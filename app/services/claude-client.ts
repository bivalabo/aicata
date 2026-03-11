import Anthropic from "@anthropic-ai/sdk";
import { getSystemPrompt } from "~/prompts/system";
import type { MessageRole } from "@prisma/client";

// Claude APIクライアントの初期化
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  generatedCode?: string;
}

/**
 * Claude APIに会話を送信し、レスポンスを取得
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  options: {
    shopDomain: string;
    conversationType?: string;
    model?: string;
    maxTokens?: number;
    storeContext?: Record<string, unknown>;
  },
): Promise<ChatResponse> {
  const model = options.model || process.env.CLAUDE_MODEL_DEFAULT || "claude-sonnet-4-20250514";
  const maxTokens = options.maxTokens || parseInt(process.env.CLAUDE_MAX_TOKENS || "4096");

  const systemPrompt = getSystemPrompt({
    shopDomain: options.shopDomain,
    conversationType: options.conversationType,
    storeContext: options.storeContext,
  });

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  });

  const textContent = response.content
    .filter((block) => block.type === "text")
    .map((block) => {
      if (block.type === "text") return block.text;
      return "";
    })
    .join("\n");

  // レスポンスからコードブロックを抽出
  const generatedCode = extractCodeBlocks(textContent);

  return {
    content: textContent,
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    generatedCode,
  };
}

/**
 * レスポンスからLiquid/CSS/JSコードブロックを抽出
 */
function extractCodeBlocks(text: string): string | undefined {
  const codeBlockRegex = /```(?:liquid|html|css|javascript|json)\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }

  return blocks.length > 0 ? blocks.join("\n\n---\n\n") : undefined;
}

/**
 * ストリーミングレスポンス用（将来実装）
 */
export async function* streamChatMessage(
  messages: ChatMessage[],
  options: {
    shopDomain: string;
    conversationType?: string;
    model?: string;
    maxTokens?: number;
  },
): AsyncGenerator<string> {
  const model = options.model || process.env.CLAUDE_MODEL_DEFAULT || "claude-sonnet-4-20250514";
  const maxTokens = options.maxTokens || parseInt(process.env.CLAUDE_MAX_TOKENS || "4096");

  const systemPrompt = getSystemPrompt({
    shopDomain: options.shopDomain,
    conversationType: options.conversationType,
  });

  const stream = anthropic.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
