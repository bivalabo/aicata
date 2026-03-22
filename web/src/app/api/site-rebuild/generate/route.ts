// ============================================================
// Aicata — Site Rebuild Generator (v2 with DDP)
// 解析済みページを DDP パイプラインで順次AI生成し、
// ストリーミングで進捗を返す
// ============================================================

import { prisma } from "@/lib/db";
import { runDDP } from "@/lib/ddp";
import type { DDPInput } from "@/lib/ddp";
import { getActiveBrandMemory } from "@/lib/brand-memory";

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

// ── Build DDPInput from page analysis ──

function buildDDPInputFromPage(
  page: PageToGenerate,
  unified: UnifiedDesignContext,
  brandMemory?: any,
): DDPInput {
  return {
    pageType: page.pageType || "landing",
    industry: detectIndustryFromKeywords(unified.industryKeywords),
    brandName: unified.siteName || undefined,
    tones: unified.tones.length > 0 ? unified.tones : ["modern"],
    targetAudience: undefined,
    keywords: unified.industryKeywords || [],
    userInstructions: `「${page.title || page.path}」のページをリビルドしてください。既存コンテンツを活かしつつ、デザインを最新のトレンドに合わせて一新してください。`,
    urlAnalysis: {
      url: page.url,
      title: page.title,
      headings: page.headings || [],
      bodyTexts: page.textSnippets || [],
      images: page.images || [],
      colors: [...(page.colors || []), ...(unified.dominantColors || [])],
      fonts: [...(page.fonts || []), ...(unified.fonts || [])],
    },
    brandMemory: brandMemory || undefined,
  };
}

function detectIndustryFromKeywords(keywords: string[]): string {
  const joined = keywords.join(" ").toLowerCase();
  if (joined.includes("beauty") || joined.includes("cosmetic") || joined.includes("skin")) return "beauty";
  if (joined.includes("fashion") || joined.includes("apparel") || joined.includes("clothing")) return "fashion";
  if (joined.includes("food") || joined.includes("gourmet") || joined.includes("organic")) return "food";
  if (joined.includes("tech") || joined.includes("gadget") || joined.includes("electronic")) return "tech";
  if (joined.includes("health") || joined.includes("wellness") || joined.includes("supplement")) return "health";
  return "general";
}

// ── Main handler: SSE streaming with DDP ──

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

    // Get Brand Memory once
    let brandMemoryData: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      primaryFont: string;
      bodyFont: string;
      voiceTone: string;
      copyKeywords: string[];
      avoidKeywords: string[];
    } | undefined;
    try {
      const bm = await getActiveBrandMemory();
      if (bm) {
        brandMemoryData = {
          primaryColor: bm.primaryColor,
          secondaryColor: bm.secondaryColor,
          accentColor: bm.accentColor,
          primaryFont: bm.primaryFont,
          bodyFont: bm.bodyFont,
          voiceTone: bm.voiceTone,
          copyKeywords: bm.copyKeywords,
          avoidKeywords: bm.avoidKeywords,
        };
      }
    } catch { /* non-fatal */ }

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
            streamClosed = true;
          }
        };

        send({
          type: "start",
          totalPages: pages.length,
          conversationId: rebuildConversationId,
        });

        const results: Array<{
          pageId: string;
          title: string;
          status: "ok" | "error";
          attempts: number;
          error?: string;
        }> = [];

        let successCount = 0;
        let failedCount = 0;

        // ── Generate each page with DDP ──
        for (let i = 0; i < pages.length; i++) {
          if (streamClosed) break;

          const page = pages[i];
          const title = page.title || page.path;

          send({
            type: "progress",
            current: i + 1,
            total: pages.length,
            title,
            succeeded: successCount,
            failed: failedCount,
          });

          try {
            const ddpInput = buildDDPInputFromPage(
              page,
              unifiedContext,
              brandMemoryData,
            );

            const ddpResult = await runDDP(ddpInput, undefined, (event) => {
              if (streamClosed) return;
              send({
                type: "ddp_progress",
                pageIndex: i,
                title,
                stage: event.stage,
                ...("status" in event ? { status: event.status } : {}),
              });
            });

            // Save to DB
            let pageId = "";
            try {
              const savedPage = await (prisma.page.create as any)({
                data: {
                  title: title,
                  slug: "",
                  html: ddpResult.html,
                  css: ddpResult.css,
                  status: "draft",
                  source: "aicata",
                  version: 1,
                  conversationId: rebuildConversationId,
                  pageType: page.pageType,
                },
              });
              pageId = savedPage.id;

              await prisma.pageVersion.create({
                data: {
                  pageId: savedPage.id,
                  version: 1,
                  html: ddpResult.html,
                  css: ddpResult.css,
                  prompt: `DDP rebuild: ${title}`,
                },
              });
            } catch (dbErr) {
              console.error("[Site Rebuild] DB save failed:", dbErr);
            }

            successCount++;
            results.push({
              pageId,
              title,
              status: "ok",
              attempts: 1,
            });

            send({
              type: "page_complete",
              index: i,
              pageId,
              title,
              status: "ok",
              attempts: 1,
              validation: ddpResult.validation,
            });
          } catch (err) {
            failedCount++;
            const errorMsg = err instanceof Error ? err.message : "不明なエラー";
            results.push({
              pageId: "",
              title,
              status: "error",
              attempts: 1,
              error: errorMsg,
            });

            send({
              type: "page_complete",
              index: i,
              pageId: "",
              title,
              status: "error",
              attempts: 1,
              error: errorMsg,
            });
          }
        }

        // Final summary
        send({
          type: "done",
          conversationId: rebuildConversationId,
          pages: results,
          successCount,
          totalCount: pages.length,
          failedCount,
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
