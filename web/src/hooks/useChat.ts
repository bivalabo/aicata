"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface Attachment {
  id: string;
  type: "image";
  name: string;
  url: string; // object URL for preview
  base64: string; // base64 data for API
  mediaType: string; // e.g. "image/png"
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
}

interface UseChatOptions {
  conversationId?: string | null;
  onConversationCreated?: (id: string) => void;
}

// Client-side timeout: 180s (3min) — Gen-3 full page generation can take 2+ minutes
const CLIENT_TIMEOUT_MS = 180000;

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const conversationIdRef = useRef<string | null>(
    options.conversationId || null,
  );

  // Update conversationId when it changes
  conversationIdRef.current = options.conversationId || null;

  const loadMessages = useCallback((loadedMessages: Message[]) => {
    setMessages(loadedMessages);
  }, []);

  // Cleanup helper
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, attachments?: Attachment[], pageType?: string, urlAnalysis?: unknown) => {
      setError(null);
      // 新規メッセージ送信時はリトライカウントをリセット（自動リトライ時は除く）
      if (!content.includes("中断箇所から続きを生成")) {
        retryCountRef.current = 0;
      }

      // Create conversation if none exists
      if (!conversationIdRef.current) {
        try {
          const res = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "chat" }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          conversationIdRef.current = data.id;
          options.onConversationCreated?.(data.id);
        } catch (e) {
          console.error("[useChat] Failed to create conversation:", e);
          setError("会話の作成に失敗しました");
          return;
        }
      }

      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        attachments: attachments?.length ? attachments : undefined,
      };

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      // Abort any existing request + timers
      abortRef.current?.abort();
      clearTimers();

      const controller = new AbortController();
      abortRef.current = controller;

      // Client-side timeout
      timeoutRef.current = setTimeout(() => {
        console.warn("[useChat] Client timeout after", CLIENT_TIMEOUT_MS, "ms");
        controller.abort();
      }, CLIENT_TIMEOUT_MS);

      let receivedAnyContent = false;

      try {
        // Build API messages
        const apiMessages = [
          ...messages.map((m) => buildApiMessage(m)),
          buildApiMessage(userMessage),
        ];

        console.log("[useChat] Sending stream request...", {
          messageCount: apiMessages.length,
          conversationId: conversationIdRef.current,
          ...(pageType ? { pageType } : {}),
          ...(urlAnalysis ? { urlAnalysis: true } : {}),
        });

        const requestBody: {
          messages: typeof apiMessages;
          conversationId: string | null;
          pageType?: string;
          urlAnalysis?: unknown;
        } = {
          messages: apiMessages,
          conversationId: conversationIdRef.current,
        };

        if (pageType) {
          requestBody.pageType = pageType;
        }

        if (urlAnalysis) {
          requestBody.urlAnalysis = urlAnalysis;
        }

        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          throw new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body reader");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "content_delta") {
                receivedAnyContent = true;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + data.text,
                    };
                  }
                  return updated;
                });
              } else if (data.type === "error") {
                // ── Auto-retry: リトライ可能なエラーは自動再送（最大2回） ──
                const currentRetry = retryCountRef.current;
                if (data.retryable && currentRetry < 2) {
                  retryCountRef.current = currentRetry + 1;
                  console.log(
                    `[useChat] Auto-retrying (${currentRetry + 1}/2)...`,
                  );
                  // Remove empty assistant message
                  setMessages((prev) => {
                    const last = prev[prev.length - 1];
                    if (last?.role === "assistant" && !last.content) {
                      return prev.slice(0, -1);
                    }
                    return prev;
                  });
                  // 最新のユーザーメッセージをstateから安全に取得してリトライ
                  setMessages((prev) => {
                    const lastUser = [...prev].reverse().find((m) => m.role === "user");
                    if (lastUser) {
                      setTimeout(() => {
                        sendMessage(lastUser.content).catch(() => {
                          setError(data.message);
                        });
                      }, 3000);
                    } else {
                      setError(data.message);
                    }
                    return prev; // state変更なし
                  });
                } else {
                  setError(data.message);
                }
              } else if (data.type === "done") {
                // Server sends final content on done — use it if we have it
                // This ensures we have the complete content even after server-side timeout
                if (data.content && typeof data.content === "string") {
                  setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last && last.role === "assistant") {
                      // Replace with full content from server
                      updated[updated.length - 1] = {
                        ...last,
                        content: data.content,
                      };
                    }
                    return updated;
                  });
                }
                console.log("[useChat] Stream done event received", {
                  contentLength: data.content?.length,
                  model: data.model,
                  usage: data.usage,
                  incomplete: data.incomplete,
                });

                // ── Auto-recovery: 不完全な生成の自動補完 ──
                if (data.incomplete && data.content) {
                  console.log("[useChat] Incomplete generation detected — auto-requesting continuation");
                  // 中断箇所の最後の200文字を取得して続きから生成させる
                  const pageStartIdx = data.content.indexOf("---PAGE_START---");
                  const partialHtml = pageStartIdx >= 0
                    ? data.content.slice(pageStartIdx + "---PAGE_START---".length)
                    : "";
                  const lastChunk = partialHtml.slice(-200).trim();
                  const continuationMsg = lastChunk
                    ? `前回のページ生成が途中で中断されました。以下が中断直前のコードの末尾です:\n\`\`\`\n${lastChunk}\n\`\`\`\nこの続きからコードを出力してください。前回の途中から再開し、残りのHTML/CSSを出力して最後に ---PAGE_END--- で閉じてください。前置きの説明は不要です。コードだけ出力してください。`
                    : "前回のページ生成が途中で中断されました。---PAGE_START--- から ---PAGE_END--- まで完全なページを再生成してください。前置きの説明は最小限にして、コードを出力してください。";
                  setTimeout(() => {
                    sendMessage(continuationMsg).catch((e) => {
                      console.error("[useChat] Auto-recovery failed:", e);
                    });
                  }, 2000);
                }
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }

        console.log("[useChat] Stream completed. Content received:", receivedAnyContent);

        // ── 接続切断検出: done イベントなしでストリームが終了した場合 ──
        // Vercel Hobby プランの60秒タイムアウトなどで接続が切れると、
        // server から done イベントが送信されずにストリームが終了する。
        // この場合、PAGE_START があるが PAGE_END がない = 不完全な生成として扱う。
        if (receivedAnyContent) {
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === "assistant" && lastMsg.content) {
              const hasPageStart = lastMsg.content.includes("---PAGE_START---");
              const hasPageEnd = lastMsg.content.includes("---PAGE_END---");
              if (hasPageStart && !hasPageEnd) {
                console.log("[useChat] Connection dropped with incomplete page generation — will show continuation button");
                // Content is kept as-is; ChatView will show the "続きを生成" button
              }
            }
            return prev;
          });
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.warn("[useChat] Request aborted. Had content:", receivedAnyContent);
          if (!receivedAnyContent) {
            setError("応答がタイムアウトしました。もう一度お試しください。");
            // Remove empty assistant message
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && !last.content) {
                return prev.slice(0, -1);
              }
              return prev;
            });
          }
          // If we had partial content, keep it and check for incomplete page generation
          if (receivedAnyContent) {
            setMessages((prev) => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg?.role === "assistant" && lastMsg.content) {
                const hasPageStart = lastMsg.content.includes("---PAGE_START---");
                const hasPageEnd = lastMsg.content.includes("---PAGE_END---");
                if (hasPageStart && !hasPageEnd) {
                  console.log("[useChat] Abort with incomplete page — continuation button will appear");
                }
              }
              return prev;
            });
          }
          return;
        }

        console.error("[useChat] Stream error:", err);
        const errMsg = err instanceof Error ? err.message : "不明なエラー";
        setError(`応答の取得中にエラーが発生しました: ${errMsg}`);

        // Remove empty assistant message on error
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && !last.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        clearTimers();
        setIsStreaming(false);
      }
    },
    [messages, options, clearTimers],
  );

  const stopStreaming = useCallback(() => {
    clearTimers();
    abortRef.current?.abort();
    setIsStreaming(false);
  }, [clearTimers]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    conversationIdRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      abortRef.current?.abort();
    };
  }, [clearTimers]);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
    loadMessages,
  };
}

// Build Claude API message format (supports multimodal)
function buildApiMessage(msg: Message) {
  if (msg.attachments?.length) {
    // Multimodal: images + text
    const content: Array<
      | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
      | { type: "text"; text: string }
    > = [];

    for (const att of msg.attachments) {
      if (att.type === "image") {
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: att.mediaType,
            data: att.base64,
          },
        });
      }
    }

    if (msg.content.trim()) {
      content.push({ type: "text", text: msg.content });
    }

    return { role: msg.role, content };
  }

  // Text only
  return { role: msg.role, content: msg.content };
}
