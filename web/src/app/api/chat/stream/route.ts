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
