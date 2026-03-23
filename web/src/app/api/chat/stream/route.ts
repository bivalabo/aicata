import { streamText, type ModelMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  buildSystemPrompt,
  DEFAULT_MODEL,
  DEFAULT_MAX_TOKENS,
} from "@/lib/anthropic";
import {
  getActiveBrandMemory,
  buildBrandMemoryPrompt,
} from "@/lib/brand-memory";
import { saveMessage } from "@/lib/services/conversation-service";
import { runDDP } from "@/lib/ddp";
import type { DDPInput } from "@/lib/ddp";
import { prisma } from "@/lib/db";

// Next.js Route Segment Config â allow long-running streaming responses
export const maxDuration = 300; // 5 minutes

type TextContent = { type: "text"; text: string };
type ImageContent = {
  type: "image";
  source: {
    type: "base64";
    media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    data: string;
  };
};
type ContentBlock = TextContent | ImageContent;

interface IncomingMessage {
  role: string;
  content: string | ContentBlock[];
}

// Extract text from message content (for DB storage)
function extractText(content: string | ContentBlock[]): string {
  if (typeof content === "string") return content;
  return content
    .filter((b): b is TextContent => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

// ââ SSE (Server-Sent Events) ãã«ãã¼ ââ
// ãã­ã³ãã¨ã³ãã® useChat ã¯ data: JSON\n\n å½¢å¼ãæå¾ãã

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
} as const;

class SSEWriter {
  private encoder = new TextEncoder();
  private controller: ReadableStreamDefaultController;
  private closed = false;
  /** ã¹ããªã¼ã ä¸­ã«éã£ãå¨ãã­ã¹ããèç© */
  public accumulated = "";

  constructor(controller: ReadableStreamDefaultController) {
    this.controller = controller;
  }

  get isClosed() {
    return this.closed;
  }

  /** ãã­ã¹ããã£ã³ã¯ã content_delta ã¤ãã³ãã¨ãã¦éä¿¡ */
  sendText(text: string) {
    if (this.closed) return;
    this.accumulated += text;
    this._write(`data: ${JSON.stringify({ type: "content_delta", text })}\n\n`);
  }

  /** ã¨ã©ã¼ã¤ãã³ãéä¿¡ */
  sendError(message: string, retryable = false) {
    if (this.closed) return;
    this._write(`data: ${JSON.stringify({ type: "error", message, retryable })}\n\n`);
  }

  /** å®äºã¤ãã³ãéä¿¡ */
  sendDone(extra?: { model?: string; usage?: unknown; incomplete?: boolean }) {
    if (this.closed) return;
    this._write(
      `data: ${JSON.stringify({ type: "done", content: this.accumulated, ...extra })}\n\n`,
    );
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    try { this.controller.close(); } catch { /* already closed */ }
  }

  private _write(chunk: string) {
    if (this.closed) return;
    try {
      this.controller.enqueue(this.encoder.encode(chunk));
    } catch {
      this.closed = true;
    }
  }
}

export async function POST(request: Request) {
  try {
    const { messages, conversationId, pageType, urlAnalysis } =
      await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "ã¡ãã»ã¼ã¸ãå¿è¦ã§ã" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Save user message to DB if conversationId provided
    const lastUserMsg = messages[messages.length - 1] as IncomingMessage;
    if (conversationId && lastUserMsg?.role === "user") {
      try {
        await saveMessage(
          conversationId,
          "user",
          extractText(lastUserMsg.content),
        );
      } catch (e) {
        console.error("[Stream API] Failed to save user message:", e);
      }
    }

    // === Design Engine ===
    const latestUserText = extractText(lastUserMsg.content);
    const conversationTexts = (messages as IncomingMessage[])
      .filter((m) => m.role === "user")
      .map((m) => ({
        role: m.role,
        content: extractText(m.content),
      }));

    // ââ Enhance ã¢ã¼ã: æ¢å­ãã¼ã¸ã«ç´ã¥ãä¼è©±ãå¤å® ââ
    let linkedPage: { id: string; title: string; html: string; css: string; pageType: string } | null = null;
    if (conversationId) {
      try {
        const page = await prisma.page.findFirst({
          where: { conversationId },
          select: { id: true, title: true, html: true, css: true, pageType: true },
        });
        if (page && page.html) {
          linkedPage = page;
          console.log("[Stream API] Enhance mode: linked page found", {
            pageId: page.id,
            title: page.title,
            pageType: page.pageType,
            htmlLength: page.html.length,
          });
        }
      } catch (e) {
        console.error("[Stream API] Failed to lookup linked page:", e);
      }
    }

    // ââ ãã¼ã¸çæãªã¯ã¨ã¹ããã©ããå¤å® ââ
    // Enhance ã¢ã¼ãã®å ´åã¯å¸¸ã«ãã¼ã¸çæã¨ãã¦æ±ã
    const isPageGenerationRequest = linkedPage
      ? true
      : detectPageGenerationRequest(latestUserText, pageType);

    // ââ DDP ãã¤ãã©ã¤ã³ï¼æ°è¦ãã¼ã¸çææã®ã¿ãEnhanceã¢ã¼ãã¯ã¬ã¬ã·ã¼ãã¹ã¸ï¼ ââ
    // ── Vercel Hobby プラン検出 ──
    const isVercelHobby = process.env.VERCEL === "1" && !process.env.VERCEL_PRO;
    const skipDDP = isVercelHobby || process.env.SKIP_DDP === "1";

    if (isPageGenerationRequest && !linkedPage && !skipDDP) {
      console.log("[Stream API] Using DDP pipeline for page generation");

      const isSiteBuildRequest = detectSiteBuildRequest(latestUserText);
      let ddpSucceeded = false;

      // Brand Memory åå¾
      let brandMemoryData;
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

      // DDPInput æ§ç¯
      const ddpInput = buildDDPInput(latestUserText, pageType, urlAnalysis, brandMemoryData);
      if (isSiteBuildRequest) ddpInput.pageType = "landing";

      // ââ DDP ãã¾ãåæçã«å®è¡ããå®äºå¾ã« SSE ã¹ããªã¼ã ã§çµæãè¿ã ââ
      // ãããããã¨ã§ãDDP å¤±ææã«ã¬ã¬ã·ã¼ãã¹ã¸ãã©ã¼ã«ããã¯ã§ããï¼C-2ä¿®æ­£ï¼
      try {
        const ddpResult = await runDDP(ddpInput, undefined, (event) => {
          // Progress ã¯ console.log ã®ã¿ï¼DDPã¯åæå®è¡ï¼
          if (event.stage === "spec" && event.status === "complete") {
            const spec = "spec" in event ? event.spec : null;
            if (spec) console.log("[DDP] Spec complete:", spec.designPhilosophy.slice(0, 60));
          } else if (event.stage === "section" && event.status === "complete") {
            const id = "sectionId" in event ? event.sectionId : "?";
            console.log("[DDP] Section complete:", id);
          }
        });

        ddpSucceeded = true;
        console.log("[DDP] Pipeline success. Streaming result via SSE...");

        // SSE ã¹ããªã¼ã ã§çµæãè¿ã
        const stream = new ReadableStream({
          async start(controller) {
            const sse = new SSEWriter(controller);

            // é²æãµããªã¼ãã­ã¹ã
            if (isSiteBuildRequest) {
              sse.sendText("æ¿ç¥ãã¾ããï¼ãµã¤ãå¨ä½ãæ§ç¯ãã¦ããã¾ãã­ã\n\n");
              sse.sendText("ã¾ãã¯ããããã¼ã¸ããä½æãã¦ããã¾ãã\n\n");
            } else {
              sse.sendText("ãã¼ã¸ããã¶ã¤ã³ãã¾ããã\n\n");
            }

            sse.sendText(`**ãã¶ã¤ã³æ¹é**: ${ddpResult.spec?.designPhilosophy || ""}\n`);
            sse.sendText(`**éè²**: ${ddpResult.spec?.colors?.reasoning || ""}\n`);
            sse.sendText(`**ã»ã¯ã·ã§ã³æ§æ**: ${ddpResult.spec?.sections?.length || 0}ã»ã¯ã·ã§ã³\n\n`);

            // å®æ HTML ã PAGE_START/PAGE_END ãã¼ã«ã¼ä»ãã§éä¿¡
            sse.sendText(`---PAGE_START---\n`);

            const doc = ddpResult.fullDocument;
            const chunkSize = 500;
            for (let i = 0; i < doc.length; i += chunkSize) {
              if (sse.isClosed) break;
              sse.sendText(doc.slice(i, i + chunkSize));
              await new Promise((r) => setTimeout(r, 3));
            }

            sse.sendText(`\n---PAGE_END---\n`);

            if (isSiteBuildRequest) {
              sse.sendText(`\nããããã¼ã¸ãå®æãã¾ããï¼ãã¬ãã¥ã¼ã§ãç¢ºèªãã ããã\n\n`);
              sse.sendText(`ç¶ãã¦ä»ã®ãã¼ã¸ãä½æã§ãã¾ããä¾ãã°ï¼\n`);
              sse.sendText(`ã»ãã³ã¬ã¯ã·ã§ã³ãã¼ã¸ãä½æãã¦ãã ããã\n`);
              sse.sendText(`ã»ãååè©³ç´°ãã¼ã¸ãä½æãã¦ãã ããã\n`);
              sse.sendText(`ã»ããã©ã³ãã¹ãã¼ãªã¼ãã¼ã¸ãä½æãã¦ãã ããã\n\n`);
              sse.sendText(`ã©ã®ãã¼ã¸ãæ¬¡ã«ä½æãã¾ããããï¼`);
            }

            sse.sendDone({ model: DEFAULT_MODEL || "claude-sonnet-4-20250514" });
            sse.close();

            // DBä¿å­ï¼ã¹ããªã¼ã å¤ã§éåæï¼
            if (conversationId) {
              try {
                await saveMessage(conversationId, "assistant", sse.accumulated, {
                  model: DEFAULT_MODEL || "claude-sonnet-4-20250514",
                });
              } catch (e) {
                console.error("[Stream API] Failed to save DDP assistant message:", e);
              }
            }
          },
          cancel() { /* aborted by client */ },
        });

        return new Response(stream, { headers: SSE_HEADERS });
      } catch (err) {
        console.error("[Stream API] DDP pipeline failed, falling back to legacy:", err);
        // ddpSucceeded remains false â fall through to legacy streaming
      }

      // DDP ãå¤±æããå ´åã®ã¿ã¬ã¬ã·ã¼ãã¹ã¸ãã©ã¼ã«ããã¯
      if (ddpSucceeded) {
        // Should not reach here (returned above), but just in case
        return new Response("DDP completed", { status: 200 });
      }
    }

    if (skipDDP && isPageGenerationRequest && !linkedPage) {
          console.log("[Stream API] DDP skipped (Vercel Hobby/SKIP_DDP) — using legacy streaming for page generation");
        }

    // ââ ã¬ã¬ã·ã¼: Vercel AI SDK ã¹ããªã¼ãã³ã° ââ
    let systemPrompt: string;
    let designContext;
    let isGen3 = false;

    // ââ Enhance ã¢ã¼ã: æ¢å­HTMLãå«ãç¹å¥ãªãã­ã³ãã ââ
    if (linkedPage) {
      console.log("[Stream API] Building enhance system prompt for page:", linkedPage.id);
      systemPrompt = buildEnhanceSystemPrompt(linkedPage);
      designContext = null;
      isGen3 = false;
    } else {
      try {
        const result = buildSystemPrompt(
          latestUserText,
          conversationTexts,
          urlAnalysis,
          pageType,
        );
        systemPrompt = result.prompt;
        designContext = result.context;
        isGen3 = result.gen3;
        console.log(`[Design Engine ${isGen3 ? "Gen-3" : "Gen-2"}]`, {
          industry: designContext.industry,
          pageType: designContext.pageType,
          tones: designContext.tones,
          ...(pageType ? { explicitPageType: pageType } : {}),
          ...(urlAnalysis ? { urlAnalysisIncluded: true } : {}),
          ...(result.gen3 ? { templateId: result.selectedTemplate?.id } : {}),
          promptLength: systemPrompt.length,
        });
      } catch (e) {
        console.error("[Design Engine] Prompt composition failed:", e);
        systemPrompt =
          "ããªãã¯Aicata â Shopifyã¹ãã¢ã®AIãã¼ã¸ãã«ãã¼ã§ããã¦ã¼ã¶ã¼ã®è¦æã«å¿ãã¦HTML+CSSã§ãã¼ã¸ãçæãã¦ãã ãããçæã³ã¼ãã¯ ---PAGE_START--- ã¨ ---PAGE_END--- ã§å²ãã§ãã ãããHTMLãåã«ãæå¾ã«<style>ã¿ã°ã§CSSãã¾ã¨ãã¦ãã ããã";
        designContext = null;
      }
    }

    // ââ Brand Memory æ³¨å¥ ââ
    try {
      const brandMemory = await getActiveBrandMemory();
      if (brandMemory) {
        const brandPrompt = buildBrandMemoryPrompt(brandMemory);
        if (brandPrompt) {
          systemPrompt = `${systemPrompt}\n\n${brandPrompt}`;
          console.log("[Brand Memory] Injected into prompt:", {
            brandName: brandMemory.brandName,
            industry: brandMemory.industry,
            hasColors: !!brandMemory.primaryColor,
            hasFonts: !!brandMemory.primaryFont,
            pageCount: brandMemory.pageCount,
          });
        }
      }
    } catch (e) {
      console.warn("[Brand Memory] Failed to inject:", e);
    }

    // Build AI SDK messages â convert multi-modal content
    const aiMessages = (messages as IncomingMessage[]).map(
      (msg): ModelMessage => {
        if (typeof msg.content === "string") {
          return {
            role: msg.role as "user" | "assistant",
            content: msg.content,
          } as ModelMessage;
        }
        // Handle multi-modal content (images + text)
        return {
          role: msg.role as "user",
          content: msg.content.map((block) => {
            if (block.type === "text") {
              return { type: "text" as const, text: block.text };
            }
            // Convert base64 image to AI SDK format
            return {
              type: "image" as const,
              image: block.source.data,
              mimeType: block.source.media_type,
            };
          }),
        } as ModelMessage;
      },
    );

    // Resolve the model identifier for @ai-sdk/anthropic
    const modelId = DEFAULT_MODEL || "claude-sonnet-4-20250514";

    // Enhance ã¢ã¼ãã§ã¯æ¢å­HTMLå¨ä½ãååºåããããããã¼ã¯ã³ä¸éãå¼ãä¸ã
    const maxTokens = linkedPage
      ? Math.max(DEFAULT_MAX_TOKENS, 32768)
      : DEFAULT_MAX_TOKENS;

    console.log("[Stream API] Calling Claude via Vercel AI SDK...", {
      model: modelId,
      maxOutputTokens: maxTokens,
      messageCount: aiMessages.length,
      systemPromptLength: systemPrompt.length,
      enhanceMode: !!linkedPage,
    });

    // === Vercel AI SDK streamText â SSE ã¹ããªã¼ã å¤æ ===
    const aiResult = streamText({
      model: anthropic(modelId),
      system: systemPrompt,
      messages: aiMessages,
      maxOutputTokens: maxTokens,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const sse = new SSEWriter(controller);

        try {
          // textStream ã SSE content_delta ã¤ãã³ãã«å¤æ
          for await (const chunk of aiResult.textStream) {
            if (sse.isClosed) break;
            sse.sendText(chunk);
          }

          // usageæå ±ãåå¾
          const usage = await aiResult.usage;
          const hasPageMarker = sse.accumulated.includes("---PAGE_START---");
          const isIncomplete = hasPageMarker && !sse.accumulated.includes("---PAGE_END---");

          sse.sendDone({
            model: modelId,
            usage,
            incomplete: isIncomplete,
          });
        } catch (err) {
          console.error("[Stream API] Stream error:", err);
          sse.sendError(
            err instanceof Error ? err.message : "ã¹ããªã¼ãã³ã°ã¨ã©ã¼",
            true,
          );
        } finally {
          sse.close();
        }

        // ââ Post-stream: DBä¿å­ & å¾å¦ç ââ
        const fullText = sse.accumulated;
        console.log("[Stream API] Stream completed:", { contentLength: fullText.length });

        // Save assistant message to DB
        if (conversationId && fullText) {
          try {
            await saveMessage(conversationId, "assistant", fullText, {
              model: modelId,
            });
          } catch (e) {
            console.error("[Stream API] Failed to save assistant message:", e);
          }
        }

        // ââ Enhance ã¢ã¼ã: çæãããHTMLããã¼ã¸ã«èªåä¿å­ ââ
        if (linkedPage && fullText.includes("---PAGE_START---")) {
          try {
            const startMarker = "---PAGE_START---";
            const endMarker = "---PAGE_END---";
            const startIdx = fullText.indexOf(startMarker) + startMarker.length;
            const endIdx = fullText.indexOf(endMarker);
            if (endIdx > startIdx) {
              const generatedBlock = fullText.slice(startIdx, endIdx).trim();
              // HTML ã¨ CSS ãåé¢ï¼W-2ä¿®æ­£: /gi ã§å¨ style ã¿ã°ã matchAllï¼
              const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
              const styleMatches = [...generatedBlock.matchAll(styleRegex)];
              const css = styleMatches.map((m) => m[1].trim()).join("\n");
              // W-1ä¿®æ­£: html ãã£ã¼ã«ãã«ã¯ style é¤å»å¾ã®HTMLãä¿å­ãéè¤ãé²ã
              const htmlOnly = generatedBlock.replace(styleRegex, "").trim();

              await prisma.page.update({
                where: { id: linkedPage.id },
                data: {
                  html: htmlOnly,
                  css: css || linkedPage.css,
                  updatedAt: new Date(),
                },
              });
              console.log("[Stream API] Enhanced page HTML auto-saved", {
                pageId: linkedPage.id,
                htmlLength: htmlOnly.length,
                cssLength: css.length,
              });
            }
          } catch (e) {

        // ── Enhance モード 続き生成: PAGE_START なしで HTML/CSS の続きが来た場合 ──
        if (linkedPage && !fullText.includes("---PAGE_START---") && fullText.includes("---PAGE_END---")) {
          try {
            const prevMessages = await prisma.message.findMany({
              where: { conversationId: conversationId },
              orderBy: { createdAt: "desc" },
              take: 5,
            });
            const prevAssistant = prevMessages.find(
              (m) => m.role === "assistant" && m.content.includes("---PAGE_START---") && !m.content.includes("---PAGE_END---"),
            );
            if (prevAssistant) {
              const startMarker = "---PAGE_START---";
              const partialContent = prevAssistant.content.slice(
                prevAssistant.content.indexOf(startMarker) + startMarker.length,
              );
              const endIdx = fullText.indexOf("---PAGE_END---");
              const continuationContent = endIdx >= 0 ? fullText.slice(0, endIdx).trim() : fullText.trim();
              const mergedBlock = (partialContent + "\n" + continuationContent).trim();
              const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
              const styleMatches = [...mergedBlock.matchAll(styleRegex)];
              const css = styleMatches.map((m) => m[1].trim()).join("\n");
              const htmlOnly = mergedBlock.replace(styleRegex, "").trim();
              if (htmlOnly) {
                await prisma.page.update({
                  where: { id: linkedPage.id },
                  data: { html: htmlOnly, css: css || linkedPage.css, updatedAt: new Date() },
                });
              }
            }
          } catch (e) {
            console.error("[Stream API] Failed to merge continuation:", e);
          }
        }
            console.error("[Stream API] Failed to auto-save enhanced page:", e);
          }
        }

        // ââ Brand Memory: ãã¼ã¸çæããå­¦ç¿ ââ
        if (designContext && fullText.includes("---PAGE_START---")) {
          try {
            await fetch(
              new URL("/api/brand-memory?action=learn-from-page", request.url).href,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  templateId: isGen3 ? (designContext as any).templateId : null,
                  pageType: designContext.pageType,
                  tones: designContext.tones,
                }),
              },
            );
          } catch { /* non-fatal */ }
        }
      },
      cancel() { /* aborted by client */ },
    });

    return new Response(stream, { headers: SSE_HEADERS });
  } catch (error) {
    console.error("[Stream API] Top-level error:", error);
    return new Response(
      JSON.stringify({
        error: `AIã®å¿ç­ã§ã¨ã©ã¼ãçºçãã¾ãã: ${error instanceof Error ? error.message : "ä¸æãªã¨ã©ã¼"}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

// ââ Helper Functions ââ

/**
 * ãã¼ã¸çæãªã¯ã¨ã¹ããã©ãããå¤å®
 * ä¼è©±çãªè³ªåï¼SEOã¢ããã¤ã¹ç­ï¼ã¯falseããã¼ã¸çæã¯true
 */
function detectPageGenerationRequest(
  text: string,
  explicitPageType?: string,
): boolean {
  // æç¤ºçã«pageTypeãæå®ããã¦ããå ´åã¯çæãªã¯ã¨ã¹ã
  if (explicitPageType) return true;

  // ãµã¤ãå¨ä½æ§ç¯ãªã¯ã¨ã¹ããçæãªã¯ã¨ã¹ã
  if (detectSiteBuildRequest(text)) return true;

  // ãã¼ã¸çæãç¤ºãã­ã¼ã¯ã¼ã
  const generationKeywords = [
    "ãã¼ã¸ãä½", "ãã¼ã¸ä½æ", "ãã¼ã¸çæ",
    "ããããã¼ã¸", "ã©ã³ãã£ã³ã°ãã¼ã¸", "LP",
    "ååãã¼ã¸", "ååè©³ç´°",
    "ã³ã¬ã¯ã·ã§ã³", "ã«ãã´ãªã¼",
    "ãã­ã°", "è¨äº",
    "ãåãåãã", "ã³ã³ã¿ã¯ã",
    "ä½ã£ã¦", "ä½æãã¦", "çæãã¦", "ãã¶ã¤ã³ãã¦",
    "ãªãã«ã", "rebuild",
    "ä½ãç´ã", "ãªãã¥ã¼ã¢ã«",
  ];

  const lowerText = text.toLowerCase();
  return generationKeywords.some((kw) => lowerText.includes(kw));
}

/**
 * ãµã¤ãå¨ä½æ§ç¯ãªã¯ã¨ã¹ããã©ãããå¤å®
 * ããµã¤ãå¨ä½ãããµã¤ããä½æãããªãã«ããã¦ããªã©ã®èªç¶ãªè¡¨ç¾ãæ¤åº
 */
function detectSiteBuildRequest(text: string): boolean {
  const siteBuildKeywords = [
    "ãµã¤ãå¨ä½",
    "ãµã¤ããä½æ",
    "ãµã¤ããä½ã£ã¦",
    "ãµã¤ãæ§ç¯",
    "ãµã¤ãããªãã«ã",
    "ãªãã«ããã¦",
    "å¨ãã¼ã¸",
    "ã¾ãããããã¼ã¸ãã",
    "Shopifyãµã¤ãå¨ä½",
  ];

  return siteBuildKeywords.some((kw) => text.includes(kw));
}

/**
 * ã¦ã¼ã¶ã¼ã®å¥åããDDPInput ãæ§ç¯
 */
function buildDDPInput(
  userText: string,
  pageType?: string,
  urlAnalysis?: any,
  brandMemory?: any,
): DDPInput {
  // ãã¼ã¸ç¨®å¥ã®æ¨å®
  const detectedPageType = pageType || detectPageType(userText);

  // æ¥­ç¨®ã®æ¨å®
  const industry = detectIndustry(userText);

  // ãã¼ã³ã®æ¨å®
  const tones = detectTones(userText);

  // ãã©ã³ãåã®æ¨å®
  const brandName = detectBrandName(userText);

  const input: DDPInput = {
    pageType: detectedPageType,
    industry,
    brandName,
    tones,
    keywords: extractKeywords(userText),
    userInstructions: userText,
  };

  // URLè§£æçµæ
  if (urlAnalysis) {
    input.urlAnalysis = {
      url: urlAnalysis.url || "",
      title: urlAnalysis.title || "",
      headings: (urlAnalysis.texts || [])
        .filter((t: any) => t.role === "heading" || t.role === "subheading")
        .map((t: any) => t.content),
      bodyTexts: (urlAnalysis.texts || [])
        .filter((t: any) => t.role === "body")
        .map((t: any) => t.content),
      images: urlAnalysis.images || [],
      colors: urlAnalysis.colors || [],
      fonts: urlAnalysis.fonts || [],
    };
  }

  // Brand Memory
  if (brandMemory) {
    input.brandMemory = brandMemory;
  }

  return input;
}

function detectPageType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("ããã") || lower.includes("ã©ã³ãã£ã³ã°") || lower.includes("lp") || lower.includes("ãã¼ã ")) return "landing";
  if (lower.includes("åå") || lower.includes("ãã­ãã¯ã") || lower.includes("product")) return "product";
  if (lower.includes("ã³ã¬ã¯ã·ã§ã³") || lower.includes("ã«ãã´ãª") || lower.includes("collection")) return "collection";
  if (lower.includes("ãã­ã°") || lower.includes("è¨äº") || lower.includes("blog")) return "blog";
  if (lower.includes("ãåãåãã") || lower.includes("ã³ã³ã¿ã¯ã") || lower.includes("contact")) return "contact";
  if (lower.includes("about") || lower.includes("ä¼ç¤¾æ¦è¦") || lower.includes("ãã©ã³ãã¹ãã¼ãªã¼")) return "about";
  if (lower.includes("ã«ã¼ã") || lower.includes("cart")) return "cart";
  if (lower.includes("æ¤ç´¢") || lower.includes("search")) return "search";
  if (lower.includes("404")) return "404";
  return "landing"; // ããã©ã«ã
}

function detectIndustry(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("ç¾å®¹") || lower.includes("ã³ã¹ã¡") || lower.includes("åç²§å") || lower.includes("ã¹ã­ã³ã±ã¢") || lower.includes("beauty")) return "beauty";
  if (lower.includes("ãã¡ãã·ã§ã³") || lower.includes("ã¢ãã¬ã«") || lower.includes("æ") || lower.includes("fashion")) return "fashion";
  if (lower.includes("é£å") || lower.includes("ã°ã«ã¡") || lower.includes("ãã¼ã") || lower.includes("food")) return "food";
  if (lower.includes("ããã¯") || lower.includes("ã¬ã¸ã§ãã") || lower.includes("tech")) return "tech";
  if (lower.includes("å¥åº·") || lower.includes("ãã«ã¹") || lower.includes("ãµããª") || lower.includes("health")) return "health";
  if (lower.includes("ã¤ã³ããªã¢") || lower.includes("å®¶å·") || lower.includes("ã©ã¤ãã¹ã¿ã¤ã«") || lower.includes("lifestyle")) return "lifestyle";
  return "general";
}

function detectTones(text: string): string[] {
  const tones: string[] = [];
  const lower = text.toLowerCase();
  if (lower.includes("é«ç´") || lower.includes("ã©ã°ã¸ã¥ã¢ãªã¼") || lower.includes("luxury")) tones.push("luxury");
  if (lower.includes("ããã¥ã©ã«") || lower.includes("èªç¶") || lower.includes("ãªã¼ã¬ããã¯")) tones.push("natural");
  if (lower.includes("ã¢ãã³") || lower.includes("modern")) tones.push("modern");
  if (lower.includes("ããã") || lower.includes("ã«ã¯ã¤ã¤") || lower.includes("æ¥½ãã")) tones.push("playful");
  if (lower.includes("ãããã«") || lower.includes("ã·ã³ãã«") || lower.includes("minimal")) tones.push("minimal");
  if (lower.includes("å¤§è") || lower.includes("ã¤ã³ãã¯ã") || lower.includes("bold")) tones.push("bold");
  if (lower.includes("ã¨ã¬ã¬ã³ã") || lower.includes("elegant")) tones.push("elegant");
  if (lower.includes("ãããã") || lower.includes("warm")) tones.push("warm");
  if (lower.includes("ã¯ã¼ã«") || lower.includes("cool")) tones.push("cool");
  if (lower.includes("åé¢¨") || lower.includes("ä¼çµ±")) tones.push("traditional");
  return tones.length > 0 ? tones : ["modern"]; // ããã©ã«ã
}

function detectBrandName(text: string): string | undefined {
  // ããã©ã³ãåãããã¹ãã¢åãã®å¾ã«ç¶ããã­ã¹ããæ½åº
  const brandMatch = text.match(/(?:ãã©ã³ãå|ã¹ãã¢å|ãã©ã³ã)[ï¼:ã]?([^ã\sãã]+)/);
  if (brandMatch) return brandMatch[1];
  return undefined;
}

function extractKeywords(text: string): string[] {
  // ããåã®ã­ã¼ã¯ã¼ããæ½åº
  const bracketMatches = text.match(/ã([^ã]+)ã/g);
  if (bracketMatches) {
    return bracketMatches.map((m) => m.replace(/[ãã]/g, ""));
  }
  return [];
}

/**
 * Enhance ã¢ã¼ãç¨ã·ã¹ãã ãã­ã³ãã
 * æ¢å­ãã¼ã¸ã®HTML/CSSãå«ããã¦ã¼ã¶ã¼ã®æ¹åè¦æã«åºã¥ãã¦ä¿®æ­£ããã
 */
function buildEnhanceSystemPrompt(page: {
  id: string;
  title: string;
  html: string;
  css: string;
  pageType: string;
}): string {
  const parts = [
    "ããªãã¯Aicata â Shopifyã¹ãã¢ã®AIãã¼ã¸ãã«ãã¼ã§ãã",
    "",
    "## ç¾å¨ã®ã¢ã¼ã: æ¢å­ãã¼ã¸æ¹åã¢ã¼ã",
    "",
    `ã¦ã¼ã¶ã¼ã¯æ¢å­ãã¼ã¸ã${page.title}ãï¼ã¿ã¤ã: ${page.pageType}ï¼ãæ¹åãããã¨ãã¦ãã¾ãã`,
    "ä»¥ä¸ãç¾å¨ã®ãã¼ã¸ã®HTML/CSSã§ããã¦ã¼ã¶ã¼ã®è¦æã«åºã¥ãã¦ãã®ãã¼ã¸ãæ¹åãã¦ãã ããã",
    "",
    "## éè¦ãªã«ã¼ã«",
    "",
    "1. **å¿ãæ¹åå¾ã®å®å¨ãªHTML+CSSãåºåãã¦ãã ããã** é¨åçãªã³ã¼ããèª¬æã ãã§ã¯ãªãããã¼ã¸å¨ä½ãåºåãã¾ãã",
    "2. **åºåã³ã¼ãã¯å¿ã `---PAGE_START---` ã¨ `---PAGE_END---` ã§å²ãã§ãã ããã** ããããªãã¨ãã¬ãã¥ã¼ã«åæ ããã¾ããã",
    "3. **æ¢å­ã®ã³ã³ãã³ãï¼ãã­ã¹ããç»åURLç­ï¼ã¯ã§ããã ãæ´»ããã¦ãã ããã** ãã¶ã¤ã³ãã¬ã¤ã¢ã¦ããæ¹åãã¤ã¤ãã³ã³ãã³ãã¯ä¿æãã¾ãã",
    "4. HTMLãåã«åºåããæå¾ã« `<style>` ã¿ã°ã§CSSãã¾ã¨ãã¦ãã ããã",
    "5. ã¬ã¹ãã³ã·ããã¶ã¤ã³ãå¿ããã¦ãã ããã",
    "6. ã¢ãã³ãªCSSæ©è½ï¼Grid, Flexbox, CSSå¤æ°, ã¢ãã¡ã¼ã·ã§ã³ç­ï¼ãæ´»ç¨ãã¦ãã ããã",
    "7. ã¾ãç°¡æ½ã«æ¹ååå®¹ãèª¬æãï¼2-3è¡ç¨åº¦ï¼ããã®å¾ã«ã³ã¼ããåºåãã¦ãã ããã",
    "",
    "## åºåãã©ã¼ãããä¾",
    "",
    "```",
    "æ¹ååå®¹ã®èª¬æï¼2-3è¡ï¼",
    "",
    "---PAGE_START---",
    "<div class=\"page-container\">",
    "  <!-- æ¹åå¾ã®HTML -->",
    "</div>",
    "<style>",
    "  /* æ¹åå¾ã®CSS */",
    "</style>",
    "---PAGE_END---",
    "```",
    "",
    "## ç¾å¨ã®ãã¼ã¸HTML",
    "",
    "```html",
    page.html,
    "```",
  ];

  if (page.css && page.css.trim()) {
    parts.push("");
    parts.push("## ç¾å¨ã®ãã¼ã¸CSS");
    parts.push("");
    parts.push("```css");
    parts.push(page.css);
    parts.push("```");
  }

  return parts.join("\n");
}
