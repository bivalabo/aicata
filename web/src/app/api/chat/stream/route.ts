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
import { runDDPForChat } from "@/lib/ddp";
import type { DDPInput } from "@/lib/ddp";

// Next.js Route Segment Config — allow long-running streaming responses
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

export async function POST(request: Request) {
  try {
    const { messages, conversationId, pageType, urlAnalysis } =
      await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "メッセージが必要です" }),
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

    // ── ページ生成リクエストかどうか判定 ──
    const isPageGenerationRequest = detectPageGenerationRequest(
      latestUserText,
      pageType,
    );

    // ── DDP パイプライン（ページ生成時） ──
    if (isPageGenerationRequest) {
      try {
        console.log("[Stream API] Using DDP pipeline for page generation");

        // Brand Memory 取得
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

        // DDPInput 構築
        const ddpInput = buildDDPInput(
          latestUserText,
          pageType,
          urlAnalysis,
          brandMemoryData,
        );

        const ddpResult = await runDDPForChat(ddpInput);

        // Save assistant message to DB
        if (conversationId && ddpResult.fullResponse) {
          try {
            await saveMessage(conversationId, "assistant", ddpResult.fullResponse, {
              model: DEFAULT_MODEL || "claude-sonnet-4-20250514",
            });
          } catch (e) {
            console.error("[Stream API] Failed to save assistant message:", e);
          }
        }

        // SSE-compatible streaming response
        // We send the complete result as a stream for frontend compatibility
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            // Send the full response as chunks
            const text = ddpResult.fullResponse;
            const chunkSize = 100;
            let offset = 0;

            function sendNextChunk() {
              if (offset >= text.length) {
                controller.close();
                return;
              }
              const chunk = text.slice(offset, offset + chunkSize);
              controller.enqueue(encoder.encode(chunk));
              offset += chunkSize;
              // Small delay to simulate streaming
              setTimeout(sendNextChunk, 10);
            }

            sendNextChunk();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      } catch (err) {
        console.error("[Stream API] DDP pipeline failed, falling back to legacy:", err);
        // Fall through to legacy streaming
      }
    }

    // ── レガシー: Vercel AI SDK ストリーミング ──
    let systemPrompt: string;
    let designContext;
    let isGen3 = false;
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
        "あなたはAicata — ShopifyストアのAIページビルダーです。ユーザーの要望に応じてHTML+CSSでページを生成してください。生成コードは ---PAGE_START--- と ---PAGE_END--- で囲んでください。HTMLを先に、最後に<style>タグでCSSをまとめてください。";
      designContext = null;
    }

    // ── Brand Memory 注入 ──
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

    // Build AI SDK messages — convert multi-modal content
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

    console.log("[Stream API] Calling Claude via Vercel AI SDK...", {
      model: modelId,
      maxOutputTokens: DEFAULT_MAX_TOKENS,
      messageCount: aiMessages.length,
      systemPromptLength: systemPrompt.length,
    });

    // === Vercel AI SDK streamText ===
    const result = streamText({
      model: anthropic(modelId),
      system: systemPrompt,
      messages: aiMessages,
      maxOutputTokens: DEFAULT_MAX_TOKENS,
      // onFinish callback for DB persistence and post-processing
      async onFinish({ text, usage }) {
        console.log("[Stream API] Stream completed:", {
          contentLength: text.length,
          usage,
        });

        // Save assistant message to DB
        if (conversationId && text) {
          try {
            await saveMessage(conversationId, "assistant", text, {
              inputTokens: usage.inputTokens,
              outputTokens: usage.outputTokens,
              model: modelId,
            });
          } catch (e) {
            console.error(
              "[Stream API] Failed to save assistant message:",
              e,
            );
          }
        }

        // ── Brand Memory: ページ生成から学習 ──
        if (designContext && text.includes("---PAGE_START---")) {
          try {
            await fetch(
              new URL(
                "/api/brand-memory?action=learn-from-page",
                request.url,
              ).href,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  templateId: isGen3
                    ? (designContext as any).templateId
                    : null,
                  pageType: designContext.pageType,
                  tones: designContext.tones,
                }),
              },
            );
          } catch {
            /* non-fatal */
          }
        }
      },
    });

    // Return the AI SDK's streaming response
    // The toDataStreamResponse() method creates SSE-compatible output
    // that works with the useChat() hook on the frontend
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[Stream API] Top-level error:", error);
    return new Response(
      JSON.stringify({
        error: `AIの応答でエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

// ── Helper Functions ──

/**
 * ページ生成リクエストかどうかを判定
 * 会話的な質問（SEOアドバイス等）はfalse、ページ生成はtrue
 */
function detectPageGenerationRequest(
  text: string,
  explicitPageType?: string,
): boolean {
  // 明示的にpageTypeが指定されている場合は生成リクエスト
  if (explicitPageType) return true;

  // ページ生成を示すキーワード
  const generationKeywords = [
    "ページを作", "ページ作成", "ページ生成",
    "トップページ", "ランディングページ", "LP",
    "商品ページ", "商品詳細",
    "コレクション", "カテゴリー",
    "ブログ", "記事",
    "お問い合わせ", "コンタクト",
    "作って", "作成して", "生成して", "デザインして",
    "リビルド", "rebuild",
    "作り直し", "リニューアル",
  ];

  const lowerText = text.toLowerCase();
  return generationKeywords.some((kw) => lowerText.includes(kw));
}

/**
 * ユーザーの入力からDDPInput を構築
 */
function buildDDPInput(
  userText: string,
  pageType?: string,
  urlAnalysis?: any,
  brandMemory?: any,
): DDPInput {
  // ページ種別の推定
  const detectedPageType = pageType || detectPageType(userText);

  // 業種の推定
  const industry = detectIndustry(userText);

  // トーンの推定
  const tones = detectTones(userText);

  // ブランド名の推定
  const brandName = detectBrandName(userText);

  const input: DDPInput = {
    pageType: detectedPageType,
    industry,
    brandName,
    tones,
    keywords: extractKeywords(userText),
    userInstructions: userText,
  };

  // URL解析結果
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
  if (lower.includes("トップ") || lower.includes("ランディング") || lower.includes("lp") || lower.includes("ホーム")) return "landing";
  if (lower.includes("商品") || lower.includes("プロダクト") || lower.includes("product")) return "product";
  if (lower.includes("コレクション") || lower.includes("カテゴリ") || lower.includes("collection")) return "collection";
  if (lower.includes("ブログ") || lower.includes("記事") || lower.includes("blog")) return "blog";
  if (lower.includes("お問い合わせ") || lower.includes("コンタクト") || lower.includes("contact")) return "contact";
  if (lower.includes("about") || lower.includes("会社概要") || lower.includes("ブランドストーリー")) return "about";
  if (lower.includes("カート") || lower.includes("cart")) return "cart";
  if (lower.includes("検索") || lower.includes("search")) return "search";
  if (lower.includes("404")) return "404";
  return "landing"; // デフォルト
}

function detectIndustry(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("美容") || lower.includes("コスメ") || lower.includes("化粧品") || lower.includes("スキンケア") || lower.includes("beauty")) return "beauty";
  if (lower.includes("ファッション") || lower.includes("アパレル") || lower.includes("服") || lower.includes("fashion")) return "fashion";
  if (lower.includes("食品") || lower.includes("グルメ") || lower.includes("フード") || lower.includes("food")) return "food";
  if (lower.includes("テック") || lower.includes("ガジェット") || lower.includes("tech")) return "tech";
  if (lower.includes("健康") || lower.includes("ヘルス") || lower.includes("サプリ") || lower.includes("health")) return "health";
  if (lower.includes("インテリア") || lower.includes("家具") || lower.includes("ライフスタイル") || lower.includes("lifestyle")) return "lifestyle";
  return "general";
}

function detectTones(text: string): string[] {
  const tones: string[] = [];
  const lower = text.toLowerCase();
  if (lower.includes("高級") || lower.includes("ラグジュアリー") || lower.includes("luxury")) tones.push("luxury");
  if (lower.includes("ナチュラル") || lower.includes("自然") || lower.includes("オーガニック")) tones.push("natural");
  if (lower.includes("モダン") || lower.includes("modern")) tones.push("modern");
  if (lower.includes("ポップ") || lower.includes("カワイイ") || lower.includes("楽しい")) tones.push("playful");
  if (lower.includes("ミニマル") || lower.includes("シンプル") || lower.includes("minimal")) tones.push("minimal");
  if (lower.includes("大胆") || lower.includes("インパクト") || lower.includes("bold")) tones.push("bold");
  if (lower.includes("エレガント") || lower.includes("elegant")) tones.push("elegant");
  if (lower.includes("あたたか") || lower.includes("warm")) tones.push("warm");
  if (lower.includes("クール") || lower.includes("cool")) tones.push("cool");
  if (lower.includes("和風") || lower.includes("伝統")) tones.push("traditional");
  return tones.length > 0 ? tones : ["modern"]; // デフォルト
}

function detectBrandName(text: string): string | undefined {
  // 「ブランド名」や「ストア名」の後に続くテキストを抽出
  const brandMatch = text.match(/(?:ブランド名|ストア名|ブランド)[：:「]?([^」\s、。]+)/);
  if (brandMatch) return brandMatch[1];
  return undefined;
}

function extractKeywords(text: string): string[] {
  // 【】内のキーワードを抽出
  const bracketMatches = text.match(/【([^】]+)】/g);
  if (bracketMatches) {
    return bracketMatches.map((m) => m.replace(/[【】]/g, ""));
  }
  return [];
}
