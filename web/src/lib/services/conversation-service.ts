import { prisma } from "@/lib/db";

export type ConversationSummary = {
  id: string;
  title: string;
  type: string;
  pinned: boolean;
  updatedAt: Date;
  lastMessage?: string;
  messageCount: number;
};

export type ConversationWithMessages = {
  id: string;
  title: string;
  type: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages: {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
  }[];
};

// List all conversations (sidebar)
export async function listConversations(): Promise<ConversationSummary[]> {
  const conversations = await prisma.conversation.findMany({
    where: { archived: false },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true },
      },
      _count: { select: { messages: true } },
    },
  });

  return conversations.map((c: any) => ({
    id: c.id,
    title: c.title,
    type: c.type,
    pinned: c.pinned,
    updatedAt: c.updatedAt,
    lastMessage: c.messages[0]?.content?.slice(0, 100),
    messageCount: c._count.messages,
  }));
}

// Get a full conversation with all messages
export async function getConversation(
  id: string,
): Promise<ConversationWithMessages | null> {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });
}

// Create a new conversation
export async function createConversation(
  type: string = "chat",
  title?: string,
): Promise<string> {
  const conversation = await prisma.conversation.create({
    data: {
      title: title || "新しいチャット",
      type,
    },
  });
  return conversation.id;
}

// Save a message and update conversation
export async function saveMessage(
  conversationId: string,
  role: string,
  content: string,
  meta?: { inputTokens?: number; outputTokens?: number; model?: string },
) {
  const message = await prisma.message.create({
    data: {
      conversationId,
      role,
      content,
      inputTokens: meta?.inputTokens,
      outputTokens: meta?.outputTokens,
      model: meta?.model,
    },
  });

  // Auto-generate title from first user message
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { _count: { select: { messages: true } } },
  });

  if (
    conversation &&
    conversation.title === "新しいチャット" &&
    role === "user" &&
    conversation._count.messages <= 1
  ) {
    const shortTitle =
      content.length > 30 ? content.slice(0, 30) + "..." : content;
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title: shortTitle },
    });
  } else {
    // Touch updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  }

  return message;
}

// Delete a conversation
export async function deleteConversation(id: string) {
  await prisma.conversation.delete({ where: { id } });
}

// Update conversation title
export async function updateConversationTitle(id: string, title: string) {
  await prisma.conversation.update({
    where: { id },
    data: { title },
  });
}

// Toggle pin
export async function togglePin(id: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) return;
  await prisma.conversation.update({
    where: { id },
    data: { pinned: !conversation.pinned },
  });
}
