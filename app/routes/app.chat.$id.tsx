import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  useLoaderData,
  useSubmit,
  useNavigation,
  useFetcher,
} from "@remix-run/react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Page,
  Layout,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Button,
  Spinner,
  Box,
  Icon,
} from "@shopify/polaris";
import { SendIcon, ChatIcon } from "@shopify/polaris-icons";
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
    const template = templateId
      ? CONVERSATION_TEMPLATES.find((t) => t.id === templateId)
      : null;

    conversation = await createConversation(shop.id, {
      title: template?.title || "新しい会話",
      type: "PAGE_DESIGN",
    });

    // テンプレートにプロンプトがある場合、ユーザーメッセージだけ先に保存
    // AI応答はチャット画面からfetcherで非同期取得する
    if (template?.prompt) {
      await addMessage(conversation.id, {
        role: "USER",
        content: template.prompt,
      });
      return redirect(`/app/chat/${conversation.id}?pending=1`);
    }

    return redirect(`/app/chat/${conversation.id}`);
  } else {
    conversation = await getConversationWithMessages(params.id!, shop.id);
  }

  if (!conversation) {
    throw new Response("会話が見つかりません", { status: 404 });
  }

  const hasPending = url.searchParams.get("pending") === "1";

  return json({ conversation, shopDomain: session.shop, hasPending });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await getOrCreateShop(session.shop);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const conversationId = params.id!;

  // AI初回応答の非同期生成
  if (intent === "generateInitial") {
    const conversation = await getConversationWithMessages(
      conversationId,
      shop.id,
    );
    if (!conversation) {
      return json({ error: "会話が見つかりません" }, { status: 404 });
    }

    const lastUserMsg = conversation.messages.find((m) => m.role === "USER");
    if (!lastUserMsg) {
      return json({ error: "ユーザーメッセージがありません" }, { status: 400 });
    }

    // 既にASSISTANTのメッセージがあればスキップ
    if (conversation.messages.some((m) => m.role === "ASSISTANT")) {
      return json({ success: true, alreadyGenerated: true });
    }

    try {
      const aiResponse = await sendChatMessage(
        [{ role: "user", content: lastUserMsg.content }],
        {
          shopDomain: session.shop,
          conversationType: conversation.type,
        },
      );

      await addMessage(conversationId, {
        role: "ASSISTANT",
        content: aiResponse.content,
        model: aiResponse.model,
        inputTokens: aiResponse.inputTokens,
        outputTokens: aiResponse.outputTokens,
        generatedCode: aiResponse.generatedCode,
      });

      return json({ success: true });
    } catch (error) {
      console.error("Claude API error:", error);
      await addMessage(conversationId, {
        role: "ASSISTANT",
        content:
          "申し訳ございません。AIの応答でエラーが発生しました。もう一度お試しください。",
      });
      return json({ success: true, hadError: true });
    }
  }

  // 通常のメッセージ送信
  const userMessage = formData.get("message") as string;

  if (!userMessage?.trim()) {
    return json({ error: "メッセージを入力してください" }, { status: 400 });
  }

  await addMessage(conversationId, {
    role: "USER",
    content: userMessage,
  });

  const conversation = await getConversationWithMessages(
    conversationId,
    shop.id,
  );
  if (!conversation) {
    return json({ error: "会話が見つかりません" }, { status: 404 });
  }

  if (conversation.messages.length <= 2) {
    const title =
      userMessage.substring(0, 50) + (userMessage.length > 50 ? "..." : "");
    await updateConversationTitle(conversationId, title);
  }

  const chatMessages: ChatMessage[] = conversation.messages
    .filter((m) => m.role !== "SYSTEM")
    .map((m) => ({
      role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

  try {
    const aiResponse = await sendChatMessage(chatMessages, {
      shopDomain: session.shop,
      conversationType: conversation.type,
    });

    await addMessage(conversationId, {
      role: "ASSISTANT",
      content: aiResponse.content,
      model: aiResponse.model,
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      generatedCode: aiResponse.generatedCode,
    });
  } catch (error) {
    console.error("Claude API error:", error);
    await addMessage(conversationId, {
      role: "ASSISTANT",
      content:
        "申し訳ございません。AIの応答でエラーが発生しました。もう一度お試しください。",
    });
  }

  return json({ success: true });
};

// Markdown風テキストを簡易フォーマット
function formatMessageContent(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const codeContent = part.replace(/```\w*\n?/, "").replace(/```$/, "");
      return (
        <Box
          key={i}
          padding="300"
          background="bg-surface-secondary"
          borderRadius="200"
        >
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              fontSize: "13px",
              fontFamily:
                "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
              lineHeight: "1.5",
            }}
          >
            {codeContent.trim()}
          </pre>
        </Box>
      );
    }

    const lines = part.split("\n");
    return (
      <div key={i}>
        {lines.map((line, j) => {
          if (line.startsWith("## ")) {
            return (
              <Text key={j} as="p" variant="headingSm">
                {line.replace("## ", "")}
              </Text>
            );
          }
          if (line.trim() === "") return <br key={j} />;
          const formatted = line.split(/(\*\*.*?\*\*)/g).map((segment, k) => {
            if (segment.startsWith("**") && segment.endsWith("**")) {
              return <strong key={k}>{segment.replace(/\*\*/g, "")}</strong>;
            }
            return segment;
          });
          return (
            <Text key={j} as="p" variant="bodyMd">
              {formatted}
            </Text>
          );
        })}
      </div>
    );
  });
}

export default function ChatPage() {
  const { conversation, hasPending } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const fetcher = useFetcher();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isSubmitting = navigation.state === "submitting";
  const isGenerating = fetcher.state !== "idle";

  // 非同期でAI初回応答を生成
  useEffect(() => {
    if (hasPending && fetcher.state === "idle" && !fetcher.data) {
      const formData = new FormData();
      formData.set("intent", "generateInitial");
      fetcher.submit(formData, { method: "post" });
    }
  }, [hasPending]);

  // fetcher完了後にページをリロード
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      window.location.replace(window.location.pathname);
    }
  }, [fetcher.state, fetcher.data]);

  // スクロール制御
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation.messages, isSubmitting, isGenerating]);

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

  const isBusy = isSubmitting || isGenerating;

  return (
    <Page title={conversation.title} backAction={{ url: "/app/chat" }}>
      <Layout>
        <Layout.Section>
          <div
            style={{
              border: "1px solid var(--p-color-border-secondary)",
              borderRadius: "12px",
              overflow: "hidden",
              background: "var(--p-color-bg-surface)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            {/* メッセージ表示エリア */}
            <div
              ref={scrollRef}
              style={{
                minHeight: "450px",
                maxHeight: "calc(100vh - 280px)",
                overflowY: "auto",
                padding: "24px",
              }}
            >
              <BlockStack gap="500">
                {conversation.messages.length === 0 && !isGenerating && (
                  <Box paddingBlock="1200">
                    <BlockStack gap="300" inlineAlign="center">
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                        }}
                      >
                        <Icon source={ChatIcon} tone="textInverse" />
                      </div>
                      <Text as="p" variant="headingMd" alignment="center">
                        Aicata へようこそ
                      </Text>
                      <Text
                        as="p"
                        variant="bodyMd"
                        tone="subdued"
                        alignment="center"
                      >
                        やりたいことを日本語で伝えてください。
                      </Text>
                    </BlockStack>
                  </Box>
                )}

                {conversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 600,
                        ...(msg.role === "USER"
                          ? {
                              background:
                                "var(--p-color-bg-surface-secondary)",
                              color: "var(--p-color-text)",
                              border:
                                "1px solid var(--p-color-border-secondary)",
                            }
                          : {
                              background:
                                "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                              color: "#fff",
                            }),
                      }}
                    >
                      {msg.role === "USER" ? "S" : "A"}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ marginBottom: "6px" }}>
                        <Text
                          as="span"
                          variant="bodySm"
                          fontWeight="bold"
                          tone={msg.role === "USER" ? "base" : "magic"}
                        >
                          {msg.role === "USER" ? "あなた" : "Aicata"}
                        </Text>
                      </div>
                      <div
                        style={{
                          padding: "14px 16px",
                          borderRadius: "12px",
                          lineHeight: "1.6",
                          ...(msg.role === "USER"
                            ? {
                                background:
                                  "var(--p-color-bg-surface-secondary)",
                              }
                            : {
                                background: "#faf9ff",
                                borderLeft: "3px solid #8b5cf6",
                              }),
                        }}
                      >
                        <BlockStack gap="200">
                          {formatMessageContent(msg.content)}
                        </BlockStack>
                      </div>
                    </div>
                  </div>
                ))}

                {isBusy && (
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background:
                          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      A
                    </div>
                    <div
                      style={{
                        flex: 1,
                        padding: "16px",
                        borderRadius: "12px",
                        background: "#faf9ff",
                        borderLeft: "3px solid #8b5cf6",
                      }}
                    >
                      <InlineStack gap="300" blockAlign="center">
                        <Spinner size="small" />
                        <Text as="span" variant="bodyMd" tone="subdued">
                          Aicata が考え中...
                        </Text>
                      </InlineStack>
                    </div>
                  </div>
                )}
              </BlockStack>
            </div>

            {/* 入力エリア */}
            <div
              style={{
                borderTop: "1px solid var(--p-color-border-secondary)",
                padding: "16px 24px",
                background: "var(--p-color-bg-surface)",
              }}
            >
              <InlineStack gap="300" blockAlign="end" wrap={false}>
                <div style={{ flex: 1 }}>
                  <TextField
                    label=""
                    labelHidden
                    value={message}
                    onChange={setMessage}
                    onKeyDown={handleKeyDown}
                    placeholder="メッセージを入力..."
                    multiline={2}
                    autoComplete="off"
                    disabled={isBusy}
                  />
                </div>
                <div style={{ paddingBottom: "4px" }}>
                  <Button
                    variant="primary"
                    onClick={handleSend}
                    disabled={!message.trim() || isBusy}
                    loading={isSubmitting}
                    icon={SendIcon}
                  >
                    送信
                  </Button>
                </div>
              </InlineStack>
            </div>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
