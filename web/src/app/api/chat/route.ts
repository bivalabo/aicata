import { NextResponse } from "next/server";
import {
  anthropic,
  buildSystemPrompt,
  DEFAULT_MODEL,
  DEFAULT_MAX_TOKENS,
} from "@/lib/anthropic";

// Non-streaming fallback endpoint
export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "メッセージが必要です" },
        { status: 400 },
      );
    }

    // Design Engine: 動的プロンプト生成
    const lastUserMsg = messages[messages.length - 1];
    const userText = typeof lastUserMsg.content === "string"
      ? lastUserMsg.content
      : "";
    const { prompt: systemPrompt } = buildSystemPrompt(userText);

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      system: systemPrompt,
      messages: messages.map(
        (msg: { role: string; content: string }) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }),
      ),
    });

    const textContent = response.content
      .filter((block) => block.type === "text")
      .map((block) => {
        if (block.type === "text") return block.text;
        return "";
      })
      .join("\n");

    return NextResponse.json({
      content: textContent,
      model: response.model,
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "AIの応答でエラーが発生しました" },
      { status: 500 },
    );
  }
}
