import { useState, useRef, useEffect, useCallback } from "react";
import {
  BlockStack,
  InlineStack,
  TextField,
  Button,
  Box,
  Spinner,
  Text,
  Divider,
  Banner,
} from "@shopify/polaris";
import { MessageBubble } from "./MessageBubble";

interface Message {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  generatedCode?: string | null;
  createdAt: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  conversationId: string;
  isLoading: boolean;
  tokenWarning?: string;
  onSendMessage: (message: string) => void;
  streamingContent?: string;
}

/**
 * チャットインターフェースメインコンポーネント
 *
 * メッセージ表示、入力、ストリーミング表示を統合管理
 */
export function ChatInterface({
  messages,
  conversationId,
  isLoading,
  tokenWarning,
  onSendMessage,
  streamingContent,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 新しいメッセージ時に自動スクロール
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, streamingContent]);

  // 送信処理
  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    onSendMessage(trimmed);
    setInputValue("");
  }, [inputValue, isLoading, onSendMessage]);

  // Enter送信（Shift+Enterで改行）
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
    <BlockStack gap="0">
      {/* トークン残量警告 */}
      {tokenWarning && (
        <Box padding="300">
          <Banner tone="warning">{tokenWarning}</Banner>
        </Box>
      )}

      {/* メッセージ表示エリア */}
      <div
        ref={scrollContainerRef}
        style={{
          padding: "var(--p-space-400)",
          minHeight: "450px",
          maxHeight: "calc(100vh - 300px)",
          overflowY: "scroll",
        }}
      >
        <BlockStack gap="400">
          {/* ウェルカムメッセージ */}
          {messages.length === 0 && !streamingContent && (
            <Box padding="1200">
              <BlockStack gap="300" inlineAlign="center">
                <Text as="p" variant="heading2xl" alignment="center">
                  Aicata
                </Text>
                <Text as="p" variant="bodyLg" tone="subdued" alignment="center">
                  やりたいことを日本語で伝えてください。
                </Text>
                <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                  例: 「新商品のランディングページを作りたい」
                  「ストアのSEOを改善したい」「モバイル表示を最適化したい」
                </Text>
              </BlockStack>
            </Box>
          )}

          {/* メッセージ一覧 */}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              generatedCode={msg.generatedCode}
              createdAt={msg.createdAt}
            />
          ))}

          {/* ストリーミング中のメッセージ */}
          {streamingContent && (
            <MessageBubble
              role="ASSISTANT"
              content={streamingContent}
              isStreaming
            />
          )}

          {/* ローディング表示 */}
          {isLoading && !streamingContent && (
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
      </div>

      <Divider />

      {/* 入力エリア */}
      <Box padding="400">
        <InlineStack gap="300" blockAlign="end">
          <Box width="100%">
            <div onKeyDown={handleKeyDown}>
              <TextField
                label=""
                labelHidden
                value={inputValue}
                onChange={setInputValue}
                placeholder="メッセージを入力... (Shift+Enterで改行)"
                multiline
                autoComplete="off"
                disabled={isLoading}
              />
            </div>
          </Box>
          <Button
            variant="primary"
            size="large"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            loading={isLoading}
          >
            送信
          </Button>
        </InlineStack>
      </Box>
    </BlockStack>
  );
}
