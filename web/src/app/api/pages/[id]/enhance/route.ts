// ============================================================
// Aicata — Page Enhance API
// 既存ページ（Shopify同期含む）をAI会話で編集可能にする
//
// POST /api/pages/[id]/enhance
//   1. 既存ページのHTMLを解析
//   2. 新しい会話を作成（ページのコンテキスト付き）
//   3. ページのconversationIdを更新
//   4. 会話IDとコンパイル済みプロンプトを返す
// ============================================================

import { prisma } from "@/lib/db";
// import { analyzeDesignContext } from "@/lib/design-engine"; // Reserved for future enhancement
import { parse as parseHtml } from "node-html-parser";
import { detectAndAnnotateSections } from "@/lib/section-detector";

type RouteContext = { params: Promise<{ id: string }> };

interface EnhanceResult {
  conversationId: string;
  pageId: string;
  compiledPrompt: string;
  pageTitle: string;
  pageType: string;
  /** 既存HTMLから抽出した概要情報 */
  extractedContext: {
    title: string;
    headings: string[];
    hasImages: boolean;
    sectionCount: number;
    colorHints: string[];
  };
  /** 検出されたセクション一覧 */
  detectedSections?: Array<{
    id: string;
    category: string;
    label: string;
    primaryText: string;
  }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    // 1. ページを取得
    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) {
      return Response.json(
        { error: "ページが見つかりません" },
        { status: 404 },
      );
    }

    if (!page.html) {
      return Response.json(
        { error: "このページにはHTMLコンテンツがありません" },
        { status: 400 },
      );
    }

    // 2. Auto-annotate sections if missing data-section-id attributes
    let pageHtml = page.html;
    const { annotatedHtml, sections: detectedSections } =
      detectAndAnnotateSections(page.html);
    if (annotatedHtml !== page.html) {
      // Save annotated HTML back to the page
      pageHtml = annotatedHtml;
      await prisma.page.update({
        where: { id },
        data: { html: annotatedHtml },
      });
      console.log(
        `[Page Enhance] Auto-annotated ${detectedSections.length} sections for page ${id}`,
      );
    }

    // 3. 既存HTMLを解析して概要を抽出
    const extractedContext = extractPageContext(pageHtml, page.css);

    // 4. 既に会話がある場合はそれを返す
    if (page.conversationId) {
      const existingConv = await prisma.conversation.findUnique({
        where: { id: page.conversationId },
      });
      if (!existingConv) {
        // 会話レコードが削除されていた場合 — stale参照をクリア
        await prisma.page.update({
          where: { id },
          data: { conversationId: null },
        });
      } else {
        return Response.json({
          conversationId: existingConv.id,
          pageId: page.id,
          compiledPrompt: "",
          pageTitle: page.title,
          pageType: (page as any).pageType || "general",
          extractedContext,
          existing: true,
        });
      }
    }

    // 4. 新しい会話を作成
    const conversation = await prisma.conversation.create({
      data: {
        title: `${page.title} — AI改善`,
        type: "chat",
      },
    });

    // 5. ページのconversationIdを紐づけ
    await prisma.page.update({
      where: { id },
      data: { conversationId: conversation.id },
    });

    // 6. 初期メッセージを会話に追加（既存ページのコンテキスト）
    const contextMessage = buildEnhanceContextMessage(
      page.title,
      extractedContext,
    );

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: contextMessage,
      },
    });

    // 7. AI応答を追加（ウェルカムメッセージ）
    const welcomeMessage = buildWelcomeMessage(page.title, extractedContext);

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: welcomeMessage,
      },
    });

    // 8. コンパイル済みプロンプト（ユーザーが次に送るメッセージの補助情報）
    const compiledPrompt = buildCompiledPrompt(page, extractedContext);

    const result: EnhanceResult = {
      conversationId: conversation.id,
      pageId: page.id,
      compiledPrompt,
      pageTitle: page.title,
      pageType: (page as any).pageType || "general",
      extractedContext,
      detectedSections: detectedSections.map((s) => ({
        id: s.id,
        category: s.category,
        label: s.label,
        primaryText: s.primaryText,
      })),
    };

    return Response.json(result);
  } catch (error) {
    console.error("[Page Enhance] Error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "ページの改善準備に失敗しました",
      },
      { status: 500 },
    );
  }
}

// ── Extract key context from existing HTML ──

function extractPageContext(
  html: string,
  css: string,
): EnhanceResult["extractedContext"] {
  let title = "";
  const headings: string[] = [];
  let hasImages = false;
  let sectionCount = 0;
  const colorHints: string[] = [];

  try {
    const root = parseHtml(html, { comment: false });

    // Title from h1
    const h1 = root.querySelector("h1");
    title = h1?.textContent?.trim() || "";

    // Headings
    root.querySelectorAll("h1, h2, h3").forEach((el) => {
      const text = el.textContent?.trim();
      if (text && text.length > 1 && headings.length < 10) {
        headings.push(text);
      }
    });

    // Images
    hasImages = root.querySelectorAll("img").length > 0;

    // Section count
    sectionCount = root.querySelectorAll(
      "section, [data-section-id]",
    ).length;

    // Color hints from CSS
    const colorRegex = /#([0-9a-fA-F]{6})\b/g;
    const allCss = css || "";
    let match;
    const colorSet = new Set<string>();
    while ((match = colorRegex.exec(allCss)) !== null) {
      const hex = match[1].toUpperCase();
      if (!["000000", "FFFFFF", "333333"].includes(hex)) {
        colorSet.add(`#${hex}`);
      }
    }
    colorHints.push(...Array.from(colorSet).slice(0, 6));
  } catch {
    // Parsing errors are non-fatal
  }

  return { title, headings, hasImages, sectionCount, colorHints };
}

// ── Build the context message for the conversation ──

function buildEnhanceContextMessage(
  pageTitle: string,
  ctx: EnhanceResult["extractedContext"],
): string {
  const parts = [
    `既存ページ「${pageTitle}」をAicataで改善したいです。`,
    "",
    "【現在のページ情報】",
  ];

  if (ctx.headings.length > 0) {
    parts.push(`見出し: ${ctx.headings.slice(0, 5).join(" / ")}`);
  }
  parts.push(`セクション数: ${ctx.sectionCount}`);
  parts.push(`画像: ${ctx.hasImages ? "あり" : "なし"}`);
  if (ctx.colorHints.length > 0) {
    parts.push(`使用カラー: ${ctx.colorHints.join(", ")}`);
  }

  parts.push("");
  parts.push(
    "現在のデザインをベースに、改善提案をお願いします。",
  );

  return parts.join("\n");
}

// ── Welcome message from AI ──

function buildWelcomeMessage(
  pageTitle: string,
  ctx: EnhanceResult["extractedContext"],
): string {
  const parts = [
    `「${pageTitle}」ページの改善をお手伝いします！`,
    "",
  ];

  if (ctx.sectionCount > 0) {
    parts.push(
      `現在のページには${ctx.sectionCount}つのセクションがあります。`,
    );
  }

  parts.push("どのような改善をご希望ですか？例えば:");
  parts.push("");
  parts.push("- 「もっとモダンなデザインにして」");
  parts.push("- 「CTAボタンを目立たせて」");
  parts.push("- 「ヒーローセクションを作り直して」");
  parts.push("- 「全体的にリニューアルして」");
  parts.push("");
  parts.push(
    "お気軽にお伝えください。現在のコンテンツを活かしつつ、デザインを改善します。",
  );

  return parts.join("\n");
}

// ── Compiled prompt with page context for the next AI call ──

function buildCompiledPrompt(
  page: any,
  ctx: EnhanceResult["extractedContext"],
): string {
  const parts = [
    "【既存ページ改善モード】",
    `ページタイトル: ${page.title}`,
    `ページタイプ: ${page.pageType || "general"}`,
  ];

  if (ctx.headings.length > 0) {
    parts.push(`現在の見出し: ${ctx.headings.join(" / ")}`);
  }
  if (ctx.colorHints.length > 0) {
    parts.push(`現在のカラー: ${ctx.colorHints.join(", ")}`);
  }

  parts.push("");
  parts.push(
    "以下の既存HTML/CSSをベースに改善してください。コンテンツはできるだけ活かし、デザインとUXを向上させてください。",
  );

  return parts.join("\n");
}
