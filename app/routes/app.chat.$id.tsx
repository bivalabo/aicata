import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useLoaderData,
  useSubmit,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Button,
  Spinner,
  Scrollable,
  Box,
  Divider,
} from "@shopify/polaris";
import { authenticate } from "~/shopify.server";
import { getOrCreateShop } from "~/models/shop.server";
import {
  getConversationWithMessages,
  createConversation,
  addMessage,
  updateConversationTitle,
} from "~/models/conversation.server";
import { sendChatMessage, type ChatMessage } from "~/services/claude-client";
import { CONVERSATION_TEMPLATES } from "~/prompts/templates";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await getOrCreateShop(session.shop);
  const url = new URL(request.url);
  const templateId = url.searchParams.get("template");

  let conversation;

  if (params.id === "new") {
    // テンプレートから新規会話を作成
    const template = templateId
      ? CONVERSATION_TEMPLATES.find((t) => t.id === templateId)
      : null;

    conversation = await createConversation(shop.id, {
      title: template?.title || "新しい会話",
      type: "PAGE_DESIGN",
    });

    // テンプレートのプロンプトがある場合は初期メッセージとして追加
    if (template?.prompt) {
      await addMessage(conversation.id, {
        role: "USER",
        content: template.prompt,
      });

      // AIからの初回レスポンスを生成
      const aiResponse = await sendChatMessage(
        [{ role: "user", content: template.prompt }],
        {
          shopDomain: session.shop,
          conversationType: "PAGE_DESIGN",
        },
      );

      await addMessage(conversation.id, {
        role: "ASSISTANT",
        content: aiResponse.content,
        model: aiResponse.model,
        inputTokens: aiResponse.inputTokens,
        outputTokens: aiResponse.outputTokens,
        generatedCode: aiResponse.generatedCode,
      });
    }

    // 再読み込みしてメッセージ込みで取得
    conversation = await getConversationWithMessages(conversation.id, shop.id);
  } else {
    conversation = await getConversationWithMessages(params.id!, shop.id);
  }

  if (!conversation) {
    throw new Response("会話が見つかりません", { status: 404 });
  }

  return json({ conversation, shopDomain: session.shop });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await getOrCreateShop(session.shop);
  const formData = await request.formData();
  const userMessage = formData.get("message") as string;
  const conversationId = params.id!;

  if (!userMessage?.trim()) {
    return json({ error: "メッセージを入力してください" }, { status: 400 });
  }

  // ユーザーメッセージを保存
  await addMessage(conversationId, {
    role: "USER",
    content: userMessage,
  });

  // 会話履歴を取得
  const conversation = await getConversationWithMessages(conversationId, shop.id);
  if (!conversation) {
    return json({ error: "会話が見つかりません" }, { status: 404 });
  }

  // 最初のメッセージならタイトルを更新
  if (conversation.messages.length <= 2) {
    const title = userMessage.substring(0, 50) + (userMessage.length > 50 ? "..." : "");
    await updateConversationTitle(conversationId, title);
  }

  // ChatMessage形式に変換
  const chatMessages: ChatMessage[] = conversation.messages
    .filter((m) => m.role !== "SYSTEM")
    .map((m) => ({
      role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

  // Claude APIに送信
  const aiResponse = await sendChatMessage(chatMessages, {
    shopDomain: session.shop,
    conversationType: conversation.type,
  });

  // AIレスポンスを保存
  await addMessage(conversationId, {
    role: "ASSISTANT",
    content: aiResponse.content,
    model: aiResponse.model,
    inputTokens: aiResponse.inputTokens,
    outputTokens: aiResponse.outputTokens,
    generatedCode: aiResponse.generatedCode,
  });

  return json({ success: true });
};

export default function ChatPage() {
  const { conversation } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isSubmitting = navigation.state === "submitting";

  // メッセージ送信時にスクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation.messages]);

  const handleSend = useCallback(() => {
    if (!message.trim() || isSubmitting) return;

    const formData = new FormData();
    formData.set("message", message);
    submit(formData, { method: "post" });
    setMessage("");
  }, [message, isSubmitting, submit]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <Page
      title={conversation.title}
      backAction={{ url: "/app/chat" }}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <BlockStack>
              {/* メッセージ表示エリア */}
              <Box
                ref={scrollRef}
                padding="400"
                minHeight="400px"
                maxHeight="600px"
                overflowY="scroll" as="div"
              >
                <BlockStack gap="400">
                  {conversation.messages.length === 0 && (
                    <Box padding="800">
                      <BlockStack gap="200" inlineAlign="center">
                        <Text as="p" variant="headingLg" alignment="center">
                          Aicata へようこそ
                        </Text>
                        <Text
                          as="p"
                          variant="bodyMd"
                          tone="subdued"
                          alignment="center"
                        >
                          やりたいことを日本語で伝えてください。
                          AIパートナーが最適な形でサポートします。
                        </Text>
                      </BlockStack>
                    </Box>
                  )}

                  {conversation.messages.map((msg) => (
                    <Box
                      key={msg.id}
                      padding="300"
                      borderRadius="200"
                      background={
                        msg.role === "USER"
                          ? "bg-surface-secondary"
                          : "bg-surface"
                      }
                    >
                      <BlockStack gap="100">
                        <Text
                          as="span"
                          variant="bodySm"
                          fontWeight="semibold"
                          tone={msg.role === "USER" ? "base" : "magic"}
                        >
                          {msg.role === "USER" ? "あなた" : "Aicata"}
                        </Text>
                        <Text as="p" variant="bodyMd">
                          {msg.content}
                        </Text>
                      </BlockStack>
                    </Box>
                  ))}

                  {isSubmitting && (
                    <Box padding="300">
                      <InlineStack gap="200" blockAlign="center">
                        <Spinner size="small" />
                        <Text as="span" variant="bodyMd" tone="subdued">
                          Aicataが考え中...
                        </Text>
                      </InlineStack>
                    </Box>
                  )}
                </BlockStack>
              </Box>

              <Divider />

              {/* 入力エリア */}
              <Box padding="400">
                <InlineStack gap="300" blockAlign="end">
                  <Box width="100%">
                    <TextField
                      label=""
                      labelHidden
                      value={message}
                      onChange={setMessage}
                      onKeyDown={handleKeyDown}
                      placeholder="メッセージを入力..."
                      multiline={2}
                      autoComplete="off"
                      disabled={isSubmitting}
                    />
                  </Box>
                  <Button
                    variant="primary"
                    onClick={handleSend}
                    disabled={!message.trim() || isSubmitting}
                    loading={isSubmitting}
                  >
                    送信
                  </Button>
                </InlineStack>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
