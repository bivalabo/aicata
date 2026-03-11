import { Box, BlockStack, InlineStack, Text, Button, Icon } from "@shopify/polaris";
import { ClipboardIcon } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";

interface MessageBubbleProps {
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  generatedCode?: string | null;
  createdAt?: string;
  isStreaming?: boolean;
}

/**
 * チャットメッセージのバブルコンポーネント
 * ユーザーとAIのメッセージを視覚的に区別して表示
 */
export function MessageBubble({
  role,
  content,
  generatedCode,
  createdAt,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = role === "USER";

  return (
    <Box
      padding="400"
      borderRadius="200"
      background={isUser ? "bg-surface-secondary" : "bg-surface"}
      borderColor={isUser ? undefined : "border-secondary"}
      borderWidth={isUser ? undefined : "025"}
    >
      <BlockStack gap="200">
        {/* ヘッダー */}
        <InlineStack align="space-between" blockAlign="center">
          <Text
            as="span"
            variant="bodySm"
            fontWeight="bold"
            tone={isUser ? "base" : "magic"}
          >
            {isUser ? "あなた" : "Aicata"}
          </Text>
          {createdAt && (
            <Text as="span" variant="bodySm" tone="subdued">
              {new Date(createdAt).toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </InlineStack>

        {/* メッセージ本文 */}
        <Box>
          <Text as="p" variant="bodyMd" breakWord>
            {content}
            {isStreaming && <span className="streaming-cursor">|</span>}
          </Text>
        </Box>

        {/* 生成されたコードがある場合 */}
        {generatedCode && <CodeDisplay code={generatedCode} />}
      </BlockStack>
    </Box>
  );
}

/**
 * コードブロック表示コンポーネント
 */
function CodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // フォールバック
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <Box
      padding="300"
      borderRadius="200"
      background="bg-surface-tertiary"
      borderColor="border"
      borderWidth="025"
    >
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="span" variant="bodySm" fontWeight="semibold" tone="subdued">
            生成されたコード
          </Text>
          <Button
            variant="plain"
            size="slim"
            icon={ClipboardIcon}
            onClick={handleCopy}
          >
            {copied ? "コピーしました" : "コピー"}
          </Button>
        </InlineStack>
        <Box>
          <pre
            style={{
              margin: 0,
              padding: "8px",
              fontSize: "13px",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              lineHeight: 1.5,
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {code}
          </pre>
        </Box>
      </BlockStack>
    </Box>
  );
}
