import {
  anthropic,
  buildSystemPrompt,
  DEFAULT_MODEL,
  DEFAULT_MAX_TOKENS,
} from "@/lib/anthropic";
import {
  getActiveBrandMemory,
  buildBrandMemoryPrompt,
} from "@/lib/brand-memory";
import { saveMessage } from "@/lib/services/conversation-service";
import { cachedFetch, CACHE_PRESETS } from "@/lib/api-cache";

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
    const { messages, conversationId, pageType, urlAnalysis } = await request.json();

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

    let systemPrompt: string;
    let designContext;
    let isGen3 = false;
    try {
      const result = buildSystemPrompt(latestUserText, conversationTexts, urlAnalysis, pageType);
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
      systemPrompt = "あなたはAicata — ShopifyストアのAIページビルダーです。ユーザーの要望に応じてHTML+CSSでページを生成してください。生成コードは ---PAGE_START--- と ---PAGE_END--- で囲んでください。HTMLを先に、最後に<style>タグでCSSをまとめてください。";
      designContext = null;
    }

    // ── Brand Memory 注入 ──
    // ストアに保存されたブランドアイデンティティを自動的に全プロンプトに反映
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
      // Brand Memory の取得に失敗しても生成は継続
      console.warn("[Brand Memory] Failed to inject:", e);
    }

    // Build Claude API messages
    const apiMessages = (messages as IncomingMessage[]).map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // === Prompt Caching ===
    // システムプロンプトを構造化ブロックに分割し、
    // 静的部分に cache_control を付与してトークン消費を削減
    // Anthropic Prompt Caching: 同一プロンプトの再送信で入力トークン最大90%削減
    const systemBlocks: Array<{ type: "text"; text: string; cache_control?: { type: "ephemeral" } }> = [];

    if (isGen3 && systemPrompt.length > 2000) {
      // Gen-3: テンプレートHTML/CSS部分（大部分）をキャッシュ対象にする
      // プロンプトの前半（テンプレート + コアルール）は静的、後半（ユーザーコンテキスト）は動的
      const splitIdx = systemPrompt.indexOf("## あなたのタスク");
      if (splitIdx > 500) {
        systemBlocks.push({
          type: "text",
          text: systemPrompt.slice(0, splitIdx),
          cache_control: { type: "ephemeral" },
        });
        systemBlocks.push({
          type: "text",
          text: systemPrompt.slice(splitIdx),
        });
      } else {
        // フォールバック: 全体をキャッシュ
        systemBlocks.push({
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        });
      }
    } else {
      // Gen-2 or 短いプロンプト: 全体をキャッシュ
      systemBlocks.push({
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      });
    }

    console.log("[Stream API] Calling Claude API...", {
      model: DEFAULT_MODEL,
      maxTokens: DEFAULT_MAX_TOKENS,
      messageCount: apiMessages.length,
      systemBlocks: systemBlocks.length,
      systemPromptLength: systemPrompt.length,
      promptCaching: true,
    });

    // Create streaming response from Claude with Prompt Caching
    const stream = anthropic.messages.stream({
      model: DEFAULT_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      system: systemBlocks,
      messages: apiMessages,
    });

    // Create a ReadableStream that sends SSE events
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullContent = "";
        let closed = false;

        function safeClose() {
          if (!closed) {
            closed = true;
            try { controller.close(); } catch { /* already closed */ }
          }
        }

        function safeEnqueue(data: string) {
          if (!closed) {
            try { controller.enqueue(encoder.encode(data)); } catch { /* closed */ }
          }
        }

        // Safety timeout: 240 seconds (4min) — Gen-3 full page generation can take 2-3 minutes
        const timeout = setTimeout(() => {
          if (!closed) {
            console.error("[Stream API] Timeout after 240s, fullContent length:", fullContent.length);

            // ── Partial content recovery ──
            // タイムアウトでも生成途中の内容があれば送信する
            // クライアント側で「incomplete」フラグを見て補完を促す
            const hasPageStart = fullContent.includes("---PAGE_START---");
            const hasPageEnd = fullContent.includes("---PAGE_END---");
            const isIncomplete = hasPageStart && !hasPageEnd;

            if (fullContent) {
              safeEnqueue(`data: ${JSON.stringify({
                type: "done",
                content: fullContent,
                incomplete: isIncomplete,
                ...(isIncomplete ? {
                  recoveryHint: "ページの生成が途中で中断されました。「続きを生成して」と送信すると、中断箇所から再開できます。",
                } : {}),
              })}` + "\n\n");
            } else {
              safeEnqueue(`data: ${JSON.stringify({
                type: "error",
                message: "応答がタイムアウトしました。もう一度お試しください。",
                retryable: true,
              })}` + "\n\n");
            }
            safeClose();
            try { stream.abort(); } catch { /* ignore */ }
          }
        }, 240000);

        try {
          // Use for-await-of on the stream for reliable iteration
          // This is more robust than event listeners
          for await (const event of stream) {
            if (closed) break;

            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              const text = event.delta.text;
              if (text) {
                fullContent += text;
                safeEnqueue(`data: ${JSON.stringify({ type: "content_delta", text })}` + "\n\n");
              }
            }
          }

          // Stream completed — get final message info
          console.log("[Stream API] Stream iteration completed, content length:", fullContent.length);

          try {
            const finalMessage = await stream.finalMessage();
            const rawUsage = finalMessage.usage as unknown as Record<string, number>;
            const usage = {
              input: finalMessage.usage.input_tokens,
              output: finalMessage.usage.output_tokens,
              cacheCreation: rawUsage.cache_creation_input_tokens || 0,
              cacheRead: rawUsage.cache_read_input_tokens || 0,
            };

            const cacheHitRate = usage.input > 0
              ? Math.round((usage.cacheRead / (usage.input + usage.cacheRead)) * 100)
              : 0;
            console.log("[Stream API] Usage:", {
              ...usage,
              cacheHitRate: `${cacheHitRate}%`,
            });

            // Save assistant message to DB
            if (conversationId) {
              try {
                await saveMessage(conversationId, "assistant", fullContent, {
                  inputTokens: usage.input,
                  outputTokens: usage.output,
                  model: finalMessage.model,
                });
              } catch (e) {
                console.error("[Stream API] Failed to save assistant message:", e);
              }
            }

            // ── Brand Memory: ページ生成から学習 ──
            if (designContext && fullContent.includes("---PAGE_START---")) {
              try {
                await fetch(new URL("/api/brand-memory?action=learn-from-page", request.url).href, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    templateId: isGen3 ? (designContext as any).templateId : null,
                    pageType: designContext.pageType,
                    tones: designContext.tones,
                  }),
                });
              } catch { /* non-fatal */ }
            }

            safeEnqueue(`data: ${JSON.stringify({
              type: "done",
              content: fullContent,
              model: finalMessage.model,
              usage,
              designContext: designContext ? {
                industry: designContext.industry,
                pageType: designContext.pageType,
                tones: designContext.tones,
              } : null,
            })}` + "\n\n");
          } catch (e) {
            console.error("[Stream API] Error getting final message:", e);
            // Still save assistant message even if finalMessage() failed
            if (conversationId && fullContent) {
              try {
                await saveMessage(conversationId, "assistant", fullContent);
              } catch (saveErr) {
                console.error("[Stream API] Failed to save assistant message (fallback):", saveErr);
              }
            }
            // Still send done with what we have
            safeEnqueue(`data: ${JSON.stringify({ type: "done", content: fullContent })}` + "\n\n");
          }
        } catch (error) {
          console.error("[Stream API] Stream iteration error:", error);
          const errorMessage = error instanceof Error ? error.message : "不明なエラー";

          // Save partial content if available
          if (conversationId && fullContent) {
            try {
              await saveMessage(conversationId, "assistant", fullContent);
            } catch (saveErr) {
              console.error("[Stream API] Failed to save partial assistant message:", saveErr);
            }
          }

          if (fullContent) {
            // Partial content — send what we have
            safeEnqueue(`data: ${JSON.stringify({ type: "done", content: fullContent })}` + "\n\n");
          } else {
            safeEnqueue(`data: ${JSON.stringify({
              type: "error",
              message: `AIの応答でエラーが発生しました: ${errorMessage}`,
            })}` + "\n\n");
          }
        } finally {
          clearTimeout(timeout);
          safeClose();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Stream API] Top-level error:", error);
    return new Response(
      JSON.stringify({ error: `AIの応答でエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}` }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
