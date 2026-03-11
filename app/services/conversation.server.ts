import {
  sendChatMessage,
  streamChatMessage,
  type ChatMessage,
  type ChatResponse,
} from "./claude-client";
import {
  getConversationWithMessages,
  addMessage,
  updateConversationTitle,
} from "~/models/conversation.server";
import { recordTokenUsage, checkTokenBudget } from "./token-manager";
import type { Message } from "@prisma/client";

/**
 * 会話サービス — ビジネスロジック層
 * ルートハンドラとデータアクセス層の間を仲介する
 */

export interface SendMessageResult {
  success: boolean;
  message?: {
    content: string;
    generatedCode?: string;
  };
  error?: string;
  tokenWarning?: string;
}

/**
 * ユーザーメッセージを処理し、AIレスポンスを返す
 */
export async function processUserMessage(
  conversationId: string,
  shopId: string,
  shopDomain: string,
  userMessage: string,
): Promise<SendMessageResult> {
  // 1. トークン残量チェック
  const tokenCheck = await checkTokenBudget(shopDomain);
  if (!tokenCheck.allowed) {
    return {
      success: false,
      error: tokenCheck.warning || "トークン上限に達しました",
    };
  }

  // 2. ユーザーメッセージを保存
  await addMessage(conversationId, {
    role: "USER",
    content: userMessage,
  });

  // 3. 会話履歴を取得
  const conversation = await getConversationWithMessages(conversationId, shopId);
  if (!conversation) {
    return { success: false, error: "会話が見つかりません" };
  }

  // 4. 最初のメッセージならタイトルを自動生成
  const userMessages = conversation.messages.filter((m) => m.role === "USER");
  if (userMessages.length === 1) {
    const title = generateTitle(userMessage);
    await updateConversationTitle(conversationId, title);
  }

  // 5. 会話履歴をChatMessage形式に変換
  const chatMessages = buildChatMessages(conversation.messages);

  try {
    // 6. Claude APIに送信
    const aiResponse = await sendChatMessage(chatMessages, {
      shopDomain,
      conversationType: conversation.type,
    });

    // 7. AIレスポンスを保存
    await addMessage(conversationId, {
      role: "ASSISTANT",
      content: aiResponse.content,
      model: aiResponse.model,
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      generatedCode: aiResponse.generatedCode,
    });

    // 8. トークン使用量を記録
    await recordTokenUsage(shopDomain, aiResponse.inputTokens, aiResponse.outputTokens);

    return {
      success: true,
      message: {
        content: aiResponse.content,
        generatedCode: aiResponse.generatedCode,
      },
      tokenWarning: tokenCheck.warning,
    };
  } catch (error) {
    console.error("AI response error:", error);

    const errorMessage = getErrorMessage(error);
    return { success: false, error: errorMessage };
  }
}

/**
 * ストリーミングレスポンス用のジェネレーター
 */
export async function* processUserMessageStream(
  conversationId: string,
  shopId: string,
  shopDomain: string,
  userMessage: string,
): AsyncGenerator<{ type: string; data: string }> {
  // トークンチェック
  const tokenCheck = await checkTokenBudget(shopDomain);
  if (!tokenCheck.allowed) {
    yield { type: "error", data: tokenCheck.warning || "トークン上限に達しました" };
    return;
  }

  // ユーザーメッセージ保存
  await addMessage(conversationId, { role: "USER", content: userMessage });

  const conversation = await getConversationWithMessages(conversationId, shopId);
  if (!conversation) {
    yield { type: "error", data: "会話が見つかりません" };
    return;
  }

  // タイトル自動生成
  const userMessages = conversation.messages.filter((m) => m.role === "USER");
  if (userMessages.length === 1) {
    await updateConversationTitle(conversationId, generateTitle(userMessage));
  }

  const chatMessages = buildChatMessages(conversation.messages);

  try {
    let fullContent = "";

    // ストリーミング開始
    yield { type: "start", data: "" };

    for await (const chunk of streamChatMessage(chatMessages, {
      shopDomain,
      conversationType: conversation.type,
    })) {
      fullContent += chunk;
      yield { type: "chunk", data: chunk };
    }

    // ストリーム完了後にメッセージを保存
    const generatedCode = extractCodeFromContent(fullContent);
    await addMessage(conversationId, {
      role: "ASSISTANT",
      content: fullContent,
      generatedCode,
    });

    yield { type: "done", data: JSON.stringify({ generatedCode }) };
  } catch (error) {
    yield { type: "error", data: getErrorMessage(error) };
  }
}

// ===== ヘルパー関数 =====

function buildChatMessages(messages: Message[]): ChatMessage[] {
  return messages
    .filter((m) => m.role !== "SYSTEM")
    .map((m) => ({
      role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));
}

function generateTitle(message: string): string {
  // 最初のメッセージから短いタイトルを生成
  const cleaned = message.replace(/\n/g, " ").trim();
  if (cleaned.length <= 40) return cleaned;
  return cleaned.substring(0, 40) + "...";
}

function extractCodeFromContent(text: string): string | undefined {
  const codeBlockRegex = /```(?:liquid|html|css|javascript|json)\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks.length > 0 ? blocks.join("\n\n---\n\n") : undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("rate_limit")) {
      return "APIのレート制限に達しました。少し待ってからもう一度お試しください。";
    }
    if (error.message.includes("overloaded")) {
      return "AIサーバーが混雑しています。少し待ってからもう一度お試しください。";
    }
    if (error.message.includes("invalid_api_key")) {
      return "API設定に問題があります。管理者にお問い合わせください。";
    }
    return `エラーが発生しました: ${error.message}`;
  }
  return "予期しないエラーが発生しました。もう一度お試しください。";
}
