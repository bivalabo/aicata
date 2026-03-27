// ============================================================
// Aicata — Site Rebuild Generator (v3 with DDP Next)
// 解析済みページを DDP Next パイプラインで順次生成し、
// ストリーミングで進捗を返す
//
// DDP Next: 人が評価した部品をAIが組み立てるキュレーション型エンジン
// AI使用は Phase 4（コピーライティング）のみ — コスト効率が大幅に向上
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { runDDPNextPipeline } from "@/lib/ddp-next";
import type { DDPNextInput } from "@/lib/ddp-next";
import { getActiveBrandMemory } from "@/lib/brand-memory";
import type { IndustryType, DesignTone, PageType } from "@/lib/design-engine/types";

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

// ── Build DDPNextInput from page analysis ──

function buildDDPNextInputFromPage(
  page: PageToGenerate,
  unified: UnifiedDesignContext,
  brandMemory?: any,
  emotionalDna?: any,
): DDPNextInput {
  const industry = detectIndustryFromKeywords(unified.industryKeywords);
  const tones = unified.tones.length > 0 ? unified.tones : ["modern"];

  return {
    pageType: (page.pageType || "landing") as PageType,
    industry: industry as IndustryType,
    brandName: unified.siteName || undefined,
    tones: tones as DesignTone[],
    targetAudience: undefined,
    referenceUrl: page.url,
    urlAnalysis: {
      url: page.url,
      title: page.title,
      description: page.description || "",
      industry: industry as IndustryType,
      tones: tones as DesignTone[],
      sections: (page.headings || []).map((h, i) => ({
        tag: "section",
        category: "content" as any,
        textContent: h,
        order: i,
      })),
      texts: [
        ...(page.headings || []).map((h) => ({ content: h, role: "heading" as const, selector: "" })),
        ...(page.textSnippets || []).map((t) => ({ content: t, role: "body" as const, selector: "" })),
      ],
      images: (page.images || []).map((img) => ({
        src: img.src,
        alt: img.alt,
        width: 0,
        height: 0,
        context: img.context || "",
      })),
      colors: [...(page.colors || []), ...(unified.dominantColors || [])],
      fonts: [...(page.fonts || []), ...(unified.fonts || [])],
    } as any,
    userInstructions: `「${page.title || page.path}」のページをリビルドしてください。既存コンテンツを活かしつつ、デザインを最新のトレンドに合わせて一新してください。`,
    brandMemory: brandMemory
      ? {
          brandName: brandMemory.brandName || unified.siteName,
          industry,
          tones,
          colors: {
            primary: brandMemory.primaryColor,
            secondary: brandMemory.secondaryColor,
            accent: brandMemory.accentColor,
          },
          fonts: [brandMemory.primaryFont, brandMemory.bodyFont].filter(Boolean),
        }
      : undefined,
    emotionalDna: emotionalDna || undefined,
  };
}

function detectIndustryFromKeywords(keywords: string[]): string {
  const joined = keywords.join(" ").toLowerCase();
  if (joined.includes("beauty") || joined.includes("cosmetic") || joined.includes("skin")) return "beauty";
  if (joined.includes("fashion") || joined.includes("apparel") || joined.includes("clothing")) return "fashion";
  if (joined.includes("food") || joined.includes("gourmet") || joined.includes("organic") || joined.includes("spice")) return "food";
  if (joined.includes("tech") || joined.includes("gadget") || joined.includes("electronic")) return "tech";
  if (joined.includes("health") || joined.includes("wellness") || joined.includes("supplement")) return "health";
  return "general";
}

// ── Main handler: SSE streaming with DDP Next ──

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

    // Get Brand Memory + Emotional DNA once
    let brandMemoryData: any;
    let emotionalDnaData: any;
    try {
      const bm = await getActiveBrandMemory();
      if (bm) {
        brandMemoryData = {
          brandName: bm.brandName || unifiedContext.siteName,
          primaryColor: bm.primaryColor,
          secondaryColor: bm.secondaryColor,
          accentColor: bm.accentColor,
          primaryFont: bm.primaryFont,
          bodyFont: bm.bodyFont,
          voiceTone: bm.voiceTone,
          copyKeywords: bm.copyKeywords,
          avoidKeywords: bm.avoidKeywords,
        };
        if (bm.emotionalDna) {
          emotionalDnaData = bm.emotionalDna;
        }
      }
    } catch { /* non-fatal */ }

    // Anthropic client for Phase 4 personalization (only AI step)
    const anthropicClient = process.env.ANTHROPIC_API_KEY
      ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      : undefined;

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
          templateId?: string;
          timingMs?: number;
          error?: string;
        }> = [];

        let successCount = 0;
        let failedCount = 0;

        // ── Generate each page with DDP Next ──
        for (let i = 0; i < pages.length; i++) {
          if (streamClosed) break;

          const page = pages[i];
          const title = page.title || page.path;

          send({
            type: "progress",
            current: i + 1,
            total: pages.length,
            title,
            path: page.path,
            pageType: page.pageType,
            succeeded: successCount,
            failed: failedCount,
          });

          try {
            const ddpNextInput = buildDDPNextInputFromPage(
              page,
              unifiedContext,
              brandMemoryData,
              emotionalDnaData,
            );

            const result = await runDDPNextPipeline(
              ddpNextInput,
              (event) => {
                if (streamClosed) return;
                send({
                  type: "ddp_progress",
                  pageIndex: i,
                  title,
                  phase: event.phase,
                  message: event.message,
                  progress: event.progress,
                });
              },
              anthropicClient,
            );

            // Save to DB
            let pageId = "";
            try {
              const savedPage = await (prisma.page.create as any)({
                data: {
                  title: title,
                  slug: "",
                  html: result.html,
                  css: result.css,
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
                  html: result.html,
                  css: result.css,
                  prompt: `DDP Next rebuild: ${title} (template: ${result.templateId})`,
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
              templateId: result.templateId,
              timingMs: Math.round(result.timing.total),
            });

            send({
              type: "page_complete",
              index: i,
              pageId,
              title,
              pageType: page.pageType,
              status: "ok",
              templateId: result.templateId,
              timingMs: Math.round(result.timing.total),
            });
          } catch (err) {
            failedCount++;
            const errorMsg = err instanceof Error ? err.message : "不明なエラー";
            console.error(`[Site Rebuild] Page "${title}" failed:`, errorMsg);

            results.push({
              pageId: "",
              title,
              status: "error",
              error: errorMsg,
            });

            send({
              type: "page_complete",
              index: i,
              pageId: "",
              title,
              pageType: page.pageType,
              status: "error",
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
