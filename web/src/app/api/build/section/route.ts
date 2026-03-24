import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import type { DesignSpec, SectionSpec, DDPConfig } from "@/lib/ddp/types";
import { ecommerceEngine } from "@/lib/ddp/engines/ecommerce";
import type { EngineContext } from "@/lib/ddp/engines/types";

export const maxDuration = 60; // 各セクション最大60秒（通常15秒）

const SECTION_ARTISAN_PROMPT = `あなたはHTMLセクション職人です。指定されたデザイン仕様に従い、1つのセクションのHTML+CSSを出力します。

## ルール（厳守）

1. **HTML + CSS のみ出力** — 説明文・マークダウン不要
2. **セクション最外ラッパー** に data-section-id 属性を付与
3. **CSS は全て <style> タグ内** — インライン style 禁止
4. **CSS 変数を使用** — :root は定義しない（既に定義済み）。var(--color-primary) 等を参照
5. **レスポンシブ** — モバイルファースト → @media (min-width: 768px) → @media (min-width: 1024px)
6. **画像** — https://placehold.co/幅x高さ/背景色/文字色 形式
7. **日本語** — 全テキストは自然な日本語
8. **外部フレームワーク禁止** — 純粋な HTML + CSS のみ

## 出力フォーマット

\`\`\`
<style>
/* このセクションのCSS */
</style>

<section data-section-id="指定されたID">
  （HTMLコンテンツ）
</section>
\`\`\`

**CSSを先に出力し、その後にHTMLを出力してください。**（ストリーム中断時でもスタイルが適用されるため）`;

/**
 * POST /api/build/section
 *
 * Step 2: セクション個別生成（DDP Stage 2）
 * - 1つのセクションのみ生成（~15秒）
 * - BuildSectionレコードを更新
 * - 失敗時はリトライカウントを更新
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buildId, sectionId } = body;

    if (!buildId || !sectionId) {
      return NextResponse.json(
        { error: "buildId と sectionId は必須です" },
        { status: 400 },
      );
    }

    // BuildSection を取得
    const buildSection = await prisma.buildSection.findFirst({
      where: { buildId, sectionId },
      include: { build: true },
    });

    if (!buildSection) {
      return NextResponse.json(
        { error: `セクション ${sectionId} が見つかりません` },
        { status: 404 },
      );
    }

    // 既に完了している場合はスキップ
    if (buildSection.status === "complete" && buildSection.html) {
      return NextResponse.json({
        sectionId: buildSection.sectionId,
        html: buildSection.html,
        css: buildSection.css || "",
        status: "complete",
        cached: true,
      });
    }

    // ステータスを「generating」に更新
    await prisma.buildSection.update({
      where: { id: buildSection.id },
      data: { status: "generating" },
    });

    // DesignSpec を復元
    const designSpec: DesignSpec = JSON.parse(buildSection.build.designSpec!);
    const sectionSpec: SectionSpec = JSON.parse(buildSection.spec);

    // Anthropic クライアント
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const config: DDPConfig = {
      specModel: "claude-sonnet-4-20250514",
      sectionModel: process.env.CLAUDE_MODEL_DEFAULT || "claude-sonnet-4-20250514",
      specMaxTokens: 4096,
      sectionMaxTokens: 4096,
      sectionConcurrency: 1, // この API は1セクションのみ
      timeoutMs: 50000,
    };

    // Engine context (ecommerce knowledge injection)
    const engineCtx: EngineContext = {
      pageType: buildSection.build.pageType,
      industry: "general", // TODO: detect from userInstructions
      tones: ["modern"],
      locale: "ja-JP",
    };

    // プロンプト構築
    const userPrompt = buildSectionPrompt(designSpec, sectionSpec, engineCtx);

    // セクション生成（最大2回リトライ）
    const maxRetries = 2;
    let lastError: string | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          await sleep(1000 * Math.pow(2, attempt - 1));
        }

        console.log(`[Build/Section] Generating ${sectionId} (attempt ${attempt + 1})`);

        const response = await client.messages.create({
          model: config.sectionModel,
          max_tokens: config.sectionMaxTokens,
          system: SECTION_ARTISAN_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        });

        const text = response.content
          .filter((b) => b.type === "text")
          .map((b) => (b as any).text as string)
          .join("");

        const parsed = parseSectionOutput(text, sectionId);

        if (parsed.html.length > 30) {
          // 成功 — DBに保存
          await prisma.buildSection.update({
            where: { id: buildSection.id },
            data: {
              html: parsed.html,
              css: parsed.css,
              status: "complete",
              retryCount: attempt,
            },
          });

          console.log(`[Build/Section] ${sectionId} complete (${parsed.html.length} chars HTML)`);

          return NextResponse.json({
            sectionId,
            html: parsed.html,
            css: parsed.css,
            status: "complete",
          });
        }

        lastError = "生成された内容が不十分です";
      } catch (err) {
        lastError = err instanceof Error ? err.message : "不明なエラー";

        // Rate limit — longer backoff
        if (err instanceof Error && (err.message.includes("429") || err.message.includes("overloaded"))) {
          await sleep(5000 * Math.pow(2, attempt));
        }
      }
    }

    // すべてのリトライが失敗
    const fallbackHtml = `<section data-section-id="${sectionId}"><p>${sectionSpec.purpose}</p></section>`;
    await prisma.buildSection.update({
      where: { id: buildSection.id },
      data: {
        html: fallbackHtml,
        css: "",
        status: "failed",
        error: lastError,
        retryCount: maxRetries + 1,
      },
    });

    return NextResponse.json({
      sectionId,
      html: fallbackHtml,
      css: "",
      status: "failed",
      error: lastError,
    });
  } catch (error) {
    console.error("[Build/Section] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "セクション生成に失敗しました" },
      { status: 500 },
    );
  }
}

// ── Helper functions (mirrored from stage2-section-artisan.ts) ──

function buildSectionPrompt(spec: DesignSpec, section: SectionSpec, engineCtx?: EngineContext): string {
  const parts: string[] = [];

  parts.push(`## デザインコンテキスト`);
  parts.push(`デザイン方針: ${spec.designPhilosophy}`);
  parts.push(`トーン: ${spec.toneDescription}`);
  parts.push(`視線誘導: ${spec.eyeFlow}`);

  parts.push(`\n## 使用可能なCSS変数（:rootで定義済み）`);
  parts.push(`--color-primary: ${spec.colors.primary};`);
  parts.push(`--color-secondary: ${spec.colors.secondary};`);
  parts.push(`--color-accent: ${spec.colors.accent};`);
  parts.push(`--color-bg: ${spec.colors.background};`);
  parts.push(`--color-text: ${spec.colors.text};`);
  parts.push(`--font-heading: "${spec.typography.headingFont}", sans-serif;`);
  parts.push(`--font-body: "${spec.typography.bodyFont}", sans-serif;`);

  // Engine section knowledge
  if (engineCtx) {
    try {
      const sectionKnowledge = ecommerceEngine.getSectionKnowledge(section.category, engineCtx);
      parts.push(`\n## このセクションの専門知識（ECデザインエンジンより）`);
      parts.push(`### 成功法則\n${sectionKnowledge.bestPractices}`);
      parts.push(`### コピーライティング指針\n${sectionKnowledge.copywritingGuidance}`);
      parts.push(`### レイアウト推奨\n${sectionKnowledge.layoutRecommendation}`);
      parts.push(`### よくある失敗（避けること）\n${sectionKnowledge.commonMistakes}`);
    } catch {
      // Engine knowledge not available — skip
    }
  }

  parts.push(`\n## 生成するセクション`);
  parts.push(`- ID: ${section.id}`);
  parts.push(`- 役割: ${section.purpose}`);
  parts.push(`- カテゴリ: ${section.category}`);
  parts.push(`- レイアウト: ${section.layout}`);
  parts.push(`- 視覚スタイル: ${section.visualStyle}`);
  parts.push(`- 背景: ${section.backgroundStyle}`);
  if (section.animation) {
    parts.push(`- アニメーション: ${section.animation}`);
  }

  const brief = section.contentBrief;
  parts.push(`\n## コンテンツ`);
  if (brief.heading) parts.push(`見出し: 「${brief.heading}」`);
  if (brief.subheading) parts.push(`サブ見出し: 「${brief.subheading}」`);
  if (brief.bodyText) parts.push(`本文: 「${brief.bodyText}」`);
  if (brief.ctaText) parts.push(`CTAボタン: 「${brief.ctaText}」 → ${brief.ctaLink || "#"}`);
  if (brief.imageDescriptions && brief.imageDescriptions.length > 0) {
    parts.push(`画像:`);
    brief.imageDescriptions.forEach((desc, i) => {
      parts.push(`  ${i + 1}. ${desc}`);
    });
  }
  if (brief.listItems && brief.listItems.length > 0) {
    parts.push(`リスト項目:`);
    brief.listItems.forEach((item) => {
      parts.push(`  - ${item.title}: ${item.description}`);
    });
  }
  if (brief.additionalNotes) {
    parts.push(`追加指示: ${brief.additionalNotes}`);
  }

  parts.push(`\nこのセクションのHTML + CSSを出力してください。`);

  return parts.join("\n");
}

function parseSectionOutput(text: string, sectionId: string): { html: string; css: string } {
  let content = text.trim();

  // Remove markdown code block wrappers
  content = content.replace(/^```(?:html)?\s*/i, "");
  content = content.replace(/\s*```\s*$/i, "");
  content = content.trim();

  // Extract <style> tags
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const styleMatches = [...content.matchAll(styleRegex)];

  let css = "";
  let html = content;

  for (const match of styleMatches) {
    css += match[1].trim() + "\n";
    html = html.replace(match[0], "");
  }

  html = html.trim();
  css = css.trim();

  // Ensure data-section-id is present
  if (html && !html.includes(`data-section-id`)) {
    html = `<section data-section-id="${sectionId}">\n${html}\n</section>`;
  }

  return { html, css };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
