// ============================================================
// Aicata — Section-level Enhance API
// 特定セクションだけをAIで再生成し、残りはそのまま維持
//
// POST /api/pages/[id]/enhance-section
// Body: { sectionId, instruction, html, css }
// Returns: { html, css } — セクション置換済みの完全なHTML/CSS
// ============================================================

import { anthropic, buildSystemPrompt, DEFAULT_MODEL } from "@/lib/anthropic";
import { prisma } from "@/lib/db";

export const maxDuration = 120;

type RouteContext = { params: Promise<{ id: string }> };

interface EnhanceSectionRequest {
  /** 対象セクションのdata-section-id */
  sectionId: string;
  /** ユーザーの改善指示 */
  instruction: string;
  /** 現在のページHTML全体 */
  html: string;
  /** 現在のページCSS全体 */
  css: string;
}

export async function POST(request: Request, context: RouteContext) {
  const { id: pageId } = await context.params;

  try {
    const body: EnhanceSectionRequest = await request.json();
    const { sectionId, instruction, html, css } = body;

    if (!sectionId || !html) {
      return Response.json(
        { error: "sectionIdとhtmlが必要です" },
        { status: 400 },
      );
    }

    // Validate sectionId format (alphanumeric, hyphens, underscores only)
    if (!/^[a-zA-Z0-9_-]+$/.test(sectionId)) {
      return Response.json(
        { error: "無効なセクションIDです" },
        { status: 400 },
      );
    }

    // Extract the target section's HTML
    const sectionRegex = new RegExp(
      `(<[^>]+data-section-id=["']${escapeRegex(sectionId)}["'][^>]*>[\\s\\S]*?<\\/(?:section|header|footer|div|nav|article|aside|main)>)`,
      "i",
    );
    const sectionMatch = html.match(sectionRegex);

    if (!sectionMatch) {
      return Response.json(
        { error: `セクション "${sectionId}" が見つかりません` },
        { status: 400 },
      );
    }

    const currentSectionHtml = sectionMatch[1];

    // Build a focused prompt for section-only regeneration
    const sectionPrompt = `以下のHTMLセクションを改善してください。

【指示】${instruction || "デザインとUXを改善してください"}

【対象セクション（data-section-id="${sectionId}"）】
${currentSectionHtml}

【ページ全体のCSS（参考）】
<style>${css.slice(0, 3000)}</style>

## ルール
1. data-section-id="${sectionId}" は必ず維持してください
2. セクションのHTMLだけを出力してください（他のセクションは含めない）
3. CSSの変更が必要な場合は、セクション用の追加CSSも出力してください
4. 出力フォーマット:

---SECTION_HTML_START---
<section data-section-id="${sectionId}">
  ...改善されたHTML...
</section>
---SECTION_HTML_END---

---SECTION_CSS_START---
/* 追加・変更CSS（必要な場合のみ） */
---SECTION_CSS_END---`;

    // Get system prompt (uses design engine for template/context)
    const promptResult = buildSystemPrompt(sectionPrompt, [], undefined, undefined);

    // Call Claude
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 4096,
      system: promptResult.prompt,
      messages: [
        { role: "user", content: sectionPrompt },
      ],
    });

    const textContent = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as any).text as string)
      .join("");

    // Extract section HTML
    const htmlMatch = textContent.match(
      /---SECTION_HTML_START---\s*([\s\S]*?)\s*---SECTION_HTML_END---/,
    );
    // Extract section CSS
    const cssMatch = textContent.match(
      /---SECTION_CSS_START---\s*([\s\S]*?)\s*---SECTION_CSS_END---/,
    );

    if (!htmlMatch) {
      // Fallback: try to extract any HTML block
      const fallbackHtml = textContent.match(
        /(<(?:section|header|footer|div|nav)[^>]*data-section-id[^>]*>[\s\S]*?<\/(?:section|header|footer|div|nav)>)/i,
      );
      if (!fallbackHtml) {
        return Response.json(
          { error: "AIからのセクションHTML抽出に失敗しました" },
          { status: 500 },
        );
      }

      // Replace section in original HTML
      const newHtml = html.replace(sectionRegex, fallbackHtml[1]);

      return Response.json({
        html: newHtml,
        css,
        sectionId,
        replaced: true,
      });
    }

    const newSectionHtml = htmlMatch[1].trim();
    const additionalCss = cssMatch ? cssMatch[1].trim() : "";

    // Replace the section in the full HTML
    const newHtml = html.replace(sectionRegex, newSectionHtml);
    const newCss = additionalCss ? `${css}\n\n/* Section enhance: ${sectionId} */\n${additionalCss}` : css;

    // Save new version
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (page) {
      const newVersion = page.version + 1;
      await prisma.page.update({
        where: { id: pageId },
        data: {
          html: newHtml,
          css: newCss,
          version: newVersion,
        },
      });
      await prisma.pageVersion.create({
        data: {
          pageId,
          version: newVersion,
          html: newHtml,
          css: newCss,
          prompt: `[Section enhance: ${sectionId}] ${instruction || "改善"}`,
        },
      });
    }

    return Response.json({
      html: newHtml,
      css: newCss,
      sectionId,
      replaced: true,
    });
  } catch (error) {
    console.error("[Section Enhance] Error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "セクション改善に失敗しました",
      },
      { status: 500 },
    );
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
