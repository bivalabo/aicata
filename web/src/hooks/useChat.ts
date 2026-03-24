"use client";

import { useState, useCallback, useRef } from "react";

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

// Client-side timeout: 180s (3min) Ã¢ÂÂ Gen-3 full page generation can take 2+ minutes
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
      // Ã¦ÂÂ°Ã¨Â¦ÂÃ£ÂÂ¡Ã£ÂÂÃ£ÂÂ»Ã£ÂÂ¼Ã£ÂÂ¸Ã©ÂÂÃ¤Â¿Â¡Ã¦ÂÂÃ£ÂÂ¯Ã£ÂÂªÃ£ÂÂÃ£ÂÂ©Ã£ÂÂ¤Ã£ÂÂ«Ã£ÂÂ¦Ã£ÂÂ³Ã£ÂÂÃ£ÂÂÃ£ÂÂªÃ£ÂÂ»Ã£ÂÂÃ£ÂÂÃ¯Â¼ÂÃ¨ÂÂªÃ¥ÂÂÃ£ÂÂªÃ£ÂÂÃ£ÂÂ©Ã£ÂÂ¤Ã¦ÂÂÃ£ÂÂ¯Ã©ÂÂ¤Ã£ÂÂÃ¯Â¼Â
      if (!content.includes("Ã¤Â¸Â­Ã¦ÂÂ­Ã§Â®ÂÃ¦ÂÂÃ£ÂÂÃ£ÂÂÃ§Â¶ÂÃ£ÂÂÃ£ÂÂÃ§ÂÂÃ¦ÂÂ")) {
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
          setError("Ã¤Â¼ÂÃ¨Â©Â±Ã£ÂÂ®Ã¤Â½ÂÃ¦ÂÂÃ£ÂÂ«Ã¥Â¤Â±Ã¦ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ");
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
                // Ã¢ÂÂÃ¢ÂÂ Auto-retry: Ã£ÂÂªÃ£ÂÂÃ£ÂÂ©Ã£ÂÂ¤Ã¥ÂÂ¯Ã¨ÂÂ½Ã£ÂÂªÃ£ÂÂ¨Ã£ÂÂ©Ã£ÂÂ¼Ã£ÂÂ¯Ã¨ÂÂªÃ¥ÂÂÃ¥ÂÂÃ©ÂÂÃ¯Â¼ÂÃ¦ÂÂÃ¥Â¤Â§2Ã¥ÂÂÃ¯Â¼Â Ã¢ÂÂÃ¢ÂÂ
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
                  // Ã¦ÂÂÃ¦ÂÂ°Ã£ÂÂ®Ã£ÂÂ¦Ã£ÂÂ¼Ã£ÂÂ¶Ã£ÂÂ¼Ã£ÂÂ¡Ã£ÂÂÃ£ÂÂ»Ã£ÂÂ¼Ã£ÂÂ¸Ã£ÂÂstateÃ£ÂÂÃ£ÂÂÃ¥Â®ÂÃ¥ÂÂ¨Ã£ÂÂ«Ã¥ÂÂÃ¥Â¾ÂÃ£ÂÂÃ£ÂÂ¦Ã£ÂÂªÃ£ÂÂÃ£ÂÂ©Ã£ÂÂ¤
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
                    return prev; // stateÃ¥Â¤ÂÃ¦ÂÂ´Ã£ÂÂªÃ£ÂÂ
                  });
                } else {
                  setError(data.message);
                }
              } else if (data.type === "done") {
                // Server sends final content on done Ã¢ÂÂ use it if we have it
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

                // Ã¢ÂÂÃ¢ÂÂ Auto-recovery: Ã¤Â¸ÂÃ¥Â®ÂÃ¥ÂÂ¨Ã£ÂÂªÃ§ÂÂÃ¦ÂÂÃ£ÂÂ®Ã¨ÂÂªÃ¥ÂÂÃ¨Â£ÂÃ¥Â®Â Ã¢ÂÂÃ¢ÂÂ
                if (data.incomplete && data.content) {
                  const pageStartIdx = data.content.indexOf("---PAGE_START---");
                  const partialHtml = pageStartIdx >= 0
                    ? data.content.slice(pageStartIdx + "---PAGE_START---".length)
                    : "";
                  const lastChunk = partialHtml.slice(-200).trim();
                  const continuationMsg = lastChunk
                    ? `ååã®ãã¼ã¸çæãéä¸­ã§ä¸­æ­ããã¾ãããä»¥ä¸ãä¸­æ­ç´åã®ã³ã¼ãã®æ«å°¾ã§ã:\
\`\`\`\
${lastChunk}\
\`\`\`\
ãã®ç¶ãããã³ã¼ããåºåãã¦ãã ãããååã®éä¸­ããåéããæ®ãã®HTML/CSSãåºåãã¦æå¾ã« ---PAGE_END--- ã§éãã¦ãã ãããåç½®ãã®èª¬æã¯ä¸è¦ã§ããã³ã¼ãã ãåºåãã¦ãã ããã`
                    : "ååã®ãã¼ã¸çæãéä¸­ã§ä¸­æ­ããã¾ããã---PAGE_START--- ãã ---PAGE_END--- ã¾ã§å®å¨ãªãã¼ã¸ãåçæãã¦ãã ãããåç½®ãã®èª¬æã¯æå°éã«ãã¦ãã³ã¼ããåºåãã¦ãã ããã";
                  sendMessage(continuationMsg);
                  return;
                }
              }

        // ââ æ¥ç¶åæ­æ¤åº: PAGE_STARTãã + PAGE_ENDãªã ââ
        if (receivedAnyContent) {
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === "assistant" && lastMsg.content) {
              const hasPageStart = lastMsg.content.includes("---PAGE_START---");
              const hasPageEnd = lastMsg.content.includes("---PAGE_END---");
              if (hasPageStart && !hasPageEnd) {
                console.log("[useChat] Connection dropped with incomplete page generation");
              }
            }
            return prev;
          });
        }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }

        console.log("[useChat] Stream completed. Content received:", receivedAnyContent);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.warn("[useChat] Request aborted. Had content:", receivedAnyContent);
          if (!receivedAnyContent) {
            setError("Ã¥Â¿ÂÃ§Â­ÂÃ£ÂÂÃ£ÂÂ¿Ã£ÂÂ¤Ã£ÂÂ Ã£ÂÂ¢Ã£ÂÂ¦Ã£ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ£ÂÂÃ¤Â¸ÂÃ¥ÂºÂ¦Ã£ÂÂÃ¨Â©Â¦Ã£ÂÂÃ£ÂÂÃ£ÂÂ Ã£ÂÂÃ£ÂÂÃ£ÂÂ");
            // Remove empty assistant message
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && !last.content) {
                return prev.slice(0, -1);
              }
              return prev;
            });
          }
          // If we had partial content, keep it (it's better than nothing)
          return;

        // ââ æ¥ç¶åæ­æ¤åº: PAGE_STARTãã + PAGE_ENDãªã ââ
        if (receivedAnyContent) {
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === "assistant" && lastMsg.content) {
              const hasPageStart = lastMsg.content.includes("---PAGE_START---");
              const hasPageEnd = lastMsg.content.includes("---PAGE_END---");
              if (hasPageStart && !hasPageEnd) {
                console.log("[useChat] Connection dropped with incomplete page generation");
              }
            }
            return prev;
          });
        }
        }

        console.error("[useChat] Stream error:", err);
        const errMsg = err instanceof Error ? err.message : "Ã¤Â¸ÂÃ¦ÂÂÃ£ÂÂªÃ£ÂÂ¨Ã£ÂÂ©Ã£ÂÂ¼";
        setError(`Ã¥Â¿ÂÃ§Â­ÂÃ£ÂÂ®Ã¥ÂÂÃ¥Â¾ÂÃ¤Â¸Â­Ã£ÂÂ«Ã£ÂÂ¨Ã£ÂÂ©Ã£ÂÂ¼Ã£ÂÂÃ§ÂÂºÃ§ÂÂÃ£ÂÂÃ£ÂÂ¾Ã£ÂÂÃ£ÂÂ: ${errMsg}`);

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
