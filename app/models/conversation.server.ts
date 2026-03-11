import prisma from "~/db.server";
import type {
  Conversation,
  Message,
  ConversationType,
  ConversationStatus,
  MessageRole,
} from "@prisma/client";

/**
 * 会話の作成
 */
export async function createConversation(
  shopId: string,
  data: {
    title?: string;
    type?: ConversationType;
    metadata?: Record<string, unknown>;
  },
): Promise<Conversation> {
  return prisma.conversation.create({
    data: {
      shopId,
      title: data.title || "新しい会話",
      type: data.type || "PAGE_DESIGN",
      metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
    },
  });
}

/**
 * 会話一覧の取得
 */
export async function getConversations(
  shopId: string,
  options?: {
    status?: ConversationStatus;
    type?: ConversationType;
    limit?: number;
    offset?: number;
  },
): Promise<Conversation[]> {
  return prisma.conversation.findMany({
    where: {
      shopId,
      ...(options?.status && { status: options.status }),
      ...(options?.type && { type: options.type }),
    },
    orderBy: { updatedAt: "desc" },
    take: options?.limit || 20,
    skip: options?.offset || 0,
  });
}

/**
 * 会話の取得（メッセージ込み）
 */
export async function getConversationWithMessages(
  conversationId: string,
  shopId: string,
): Promise<(Conversation & { messages: Message[] }) | null> {
  return prisma.conversation.findFirst({
    where: { id: conversationId, shopId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

/**
 * メッセージの追加
 */
export async function addMessage(
  conversationId: string,
  data: {
    role: MessageRole;
    content: string;
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
    generatedCode?: string;
  },
): Promise<Message> {
  // 会話のupdatedAtも更新
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return prisma.message.create({
    data: {
      conversationId,
      role: data.role,
      content: data.content,
      model: data.model,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      generatedCode: data.generatedCode,
    },
  });
}

/**
 * 会話タイトルの自動更新（最初のメッセージから）
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string,
): Promise<void> {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { title: title.substring(0, 100) },
  });
}

/**
 * 会話のアーカイブ
 */
export async function archiveConversation(
  conversationId: string,
  shopId: string,
): Promise<void> {
  await prisma.conversation.updateMany({
    where: { id: conversationId, shopId },
    data: { status: "ARCHIVED" },
  });
}

/**
 * 会話の削除
 */
export async function deleteConversation(
  conversationId: string,
  shopId: string,
): Promise<void> {
  await prisma.conversation.deleteMany({
    where: { id: conversationId, shopId },
  });
}
