// ============================================================
// Aicata — Batch Page Generator (Site Rebuild)
// 解析済みページを順次AI生成し、ストリーミングで進捗を返す
// ============================================================

import { buildSystemPrompt } from "@/lib/anthropic";
import { prisma } from "@/lib/db";
import type { UrlAnalysisResult } from "@/lib/design-engine/types";
import {
  generateBatchResilently,
  type GenerationTask,
} from "@/lib/resilient-generator";

export const maxDuration = 300; // 5 minutes

// ── Types ──

interface PageToGenerate {
  url: string;
  path: string;
  pageType: string;
  title: string;
  description: string;
  headings: string[];
  images: Array<{ src: string; alt: string; context: string }>;
  colors: string[];
  fonts: string[];
  textSnippets: string[];
}

interface UnifiedDesignContext {
  dominantColors: string[];
  fonts: string[];
  tones: string[];
  siteName: string;
  industryKeywords: string[];
}

interface GenerateRequest {
  pages: PageToGenerate[];
  unifiedContext: UnifiedDesignContext;
  /** 既存の会話IDに紐づける場合 */
  conversationId?: string;
}

// ── Build a user prompt for a single page from its analysis ──

function buildPagePrompt(
  page: PageToGenerate,
  unified: UnifiedDesignContext,
): string {
  const parts: string[] = [];

  parts.push(
    `以下の情報をもとに、${page.title || page.path}のページを生成してください。`,
  );
  parts.push("");

  // Structured info block
  parts.push(`【ページ種別】${page.pageType}`);
  parts.push(`【URL】${page.url}`);

  if (unified.siteName) {
    parts.push(`【サイト名】${unified.siteName}`);
  }

  if (page.title) parts.push(`【ページタイトル】${page.title}`);
  if (page.description) parts.push(`【説明文】${page.description}`);

  if (page.headings.length > 0) {
    parts.push(`【見出し】${page.headings.slice(0, 5).join(" / ")}`);
  }

  if (page.textSnippets && page.textSnippets.length > 0) {
    parts.push(`【主要テキスト】`);
    page.textSnippets.slice(0, 3).forEach((t) => {
      parts.push(`  - ${t}`);
    });
  }

  if (page.images.length > 0) {
    parts.push(`【画像】`);
    page.images.slice(0, 6).forEach((img) => {
      parts.push(`  - ${img.context}: ${img.src}${img.alt ? ` (${img.alt})` : ""}`);
    });
  }

  // Unified design direction
  parts.push("");
  parts.push("【デザイン統一指示】");
  if (unified.dominantColors.length > 0) {
    parts.push(
      `  - メインカラー: ${unified.dominantColors.slice(0, 4).join(", ")} を基調に`,
    );
  }
  if (unified.fonts.length > 0) {
    parts.push(`  - フォント: ${unified.fonts.join(", ")}`);
  }
  if (unified.tones.length > 0) {
    parts.push(`  - トーン: ${unified.tones.join("、")}を意識`);
  }

  parts.push("");
  parts.push(
    "既存コンテンツをそのまま活かしつつ、デザインを一新してください。サイト全体で統一感のあるデザインにしてください。",
  );

  return parts.join("\n");
}

// ── Convert page analysis to a lightweight UrlAnalysisResult ──

function toUrlAnalysis(page: PageToGenerate): UrlAnalysisResult {
  return {
    url: page.url,
    title: page.title,
    description: page.description,
    texts: [
      ...page.headings.map((h) => ({
        content: h,
        role: "heading" as const,
        tag: "h1",
      })),
      ...(page.textSnippets || []).map((t) => ({
        content: t,
        role: "body" as const,
        tag: "p",
      })),
    ],
    images: page.images.map((img) => ({
      src: img.src,
      alt: img.alt,
      context: img.context as "hero" | "product" | "logo" | "content",
      width: undefined,
      height: undefined,
    })),
    sections: [],
    colors: page.colors,
    fonts: page.fonts,
  } as unknown as UrlAnalysisResult;
}

// ── Extract HTML/CSS from AI response ──

function extractPageData(
  text: string,
): { html: string; css: string } | null {
  const startMarker = "---PAGE_START---";
  const endMarker = "---PAGE_END---";

  const startIdx = text.indexOf(startMarker);
  const endIdx = text.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;

  const content = text.slice(startIdx + startMarker.length, endIdx).trim();

  // Split HTML and CSS
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  let css = "";
  let html = content;

  if (styleMatch) {
    css = styleMatch
      .map((s) => s.replace(/<\/?style[^>]*>/gi, ""))
      .join("\n");
    html = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").trim();
  }

  return { html, css };
}

// ── Main handler: SSE streaming ──

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const { pages, unifiedContext, conversationId } = body;

    if (!pages || pages.length === 0) {
      return Response.json(
        { error: "生成対象のページが必要です" },
        { status: 400 },
      );
    }

    // Create a conversation for this rebuild session if none provided
    let rebuildConversationId = conversationId;
    if (!rebuildConversationId) {
      const conversation = await prisma.conversation.create({
        data: {
          title: `サイトリビルド: ${unifiedContext.siteName || "無題"}`,
          type: "site-build",
        },
      });
      rebuildConversationId = conversation.id;
    }

    // SSE stream for progress
    const encoder = new TextEncoder();
    let streamClosed = false;
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) => {
          if (streamClosed) return;
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
            );
          } catch {
            // Client disconnected
            streamClosed = true;
          }
        };

        send({
          type: "start",
          totalPages: pages.length,
          conversationId: rebuildConversationId,
        });

        // ── Resilient Batch Generation ──
        // 各ページをGenerationTaskに変換
        const tasks: GenerationTask[] = pages.map((page, i) => {
          const urlAnalysis = toUrlAnalysis(page);
          const promptResult = buildSystemPrompt(
            buildPagePrompt(page, unifiedContext),
            [],
            urlAnalysis,
            page.pageType,
          );
          return {
            id: `rebuild-${i}-${page.path}`,
            prompt: buildPagePrompt(page, unifiedContext),
            systemPrompt: promptResult.prompt,
            pageType: page.pageType,
            title: page.title || page.path,
            conversationId: rebuildConversationId!,
            metadata: { path: page.path, index: i },
          };
        });

        // Resilient engine で生成（自動リトライ + チェックポイント保存付き）
        const batchResult = await generateBatchResilently(
          tasks,
          (progress) => {
            if (streamClosed) return;
            send({
              type: "progress",
              current: progress.completed + (progress.currentTask ? 1 : 0),
              total: progress.total,
              title: progress.currentTask || "",
              succeeded: progress.succeeded,
              failed: progress.failed,
            });

            // 各ページ完了時にもイベント送信
            const latest = progress.results[progress.results.length - 1];
            if (latest && progress.completed === progress.results.length) {
              send({
                type: "page_complete",
                index: progress.completed - 1,
                pageId: latest.pageId || "",
                title: latest.taskId,
                status: latest.status === "failed" ? "error" : "ok",
                attempts: latest.attempts,
                error: latest.error,
              });
            }
          },
          () => streamClosed, // キャンセル検知
        );

        // Final summary
        send({
          type: "done",
          conversationId: rebuildConversationId,
          pages: batchResult.results.map((r) => ({
            pageId: r.pageId || "",
            title: r.taskId,
            status: r.status === "failed" ? "error" : "ok",
            attempts: r.attempts,
            error: r.error,
          })),
          successCount: batchResult.succeeded,
          totalCount: batchResult.total,
          failedCount: batchResult.failed,
        });

        if (!streamClosed) {
          try { controller.close(); } catch { /* already closed */ }
        }
      },
      cancel() {
        streamClosed = true;
        console.log("[Site Rebuild] Stream cancelled by client");
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Site Rebuild Generate] Error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "バッチ生成に失敗しました",
      },
      { status: 500 },
    );
  }
}
