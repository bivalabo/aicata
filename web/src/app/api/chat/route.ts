import { generateText, type CoreMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  buildSystemPrompt,
  DEFAULT_MODEL,
  DEFAULT_MAX_TOKENS,
} from "@/lib/anthropic";

// Non-streaming fallback endpoint (uses Vercel AI SDK)
export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "メッセージが必要です" },
        { status: 400 },
      );
    }

    // Design Engine: 動的プロンプト生成
    const lastUserMsg = messages[messages.length - 1];
    const userText =
      typeof lastUserMsg.content === "string" ? lastUserMsg.content : "";
    const { prompt: systemPrompt } = buildSystemPrompt(userText);

    const modelId = DEFAULT_MODEL || "claude-sonnet-4-20250514";

    const aiMessages: CoreMessage[] = messages.map(
      (msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }),
    );

    const { text, usage } = await generateText({
      model: anthropic(modelId),
      system: systemPrompt,
      messages: aiMessages,
      maxTokens: DEFAULT_MAX_TOKENS,
    });

    return Response.json({
      content: text,
      model: modelId,
      usage: {
        input: usage.promptTokens,
        output: usage.completionTokens,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "AIの応答でエラーが発生しました" },
      { status: 500 },
    );
  }
}
