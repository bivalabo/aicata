"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import WelcomeScreen from "./WelcomeScreen";
import OnboardingFlow, {
  type OnboardingSelections,
  type BrandMemoryHint,
} from "./OnboardingFlow";
import { Sparkles, RefreshCw, Store, ExternalLink, X } from "lucide-react";
import { useChat, type Message, type Attachment } from "@/hooks/useChat";
import { extractPageData, stripPageMarkers, hasPageData } from "@/lib/page-parser";
import type { PageData } from "@/lib/page-parser";
import dynamic from "next/dynamic";

// Lazy-load SiteRebuildFlow (heavy component)
const SiteRebuildFlow = dynamic(
  () => import("@/components/pages/SiteRebuildFlow"),
  { ssr: false },
);

// ============================================================
// Shopify Connection Hook
// ============================================================

interface ShopifyStoreInfo {
  connected: boolean;
  store: {
    id: string;
    shop: string;
    name: string;
    email: string;
    domain: string;
    plan: string;
  } | null;
}

function useShopifyConnection() {
  const [storeInfo, setStoreInfo] = useState<ShopifyStoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shopify/store")
      .then((r) => r.json())
      .then((data) => {
        setStoreInfo(data);
      })
      .catch(() => {
        setStoreInfo({ connected: false, store: null });
      })
      .finally(() => setLoading(false));
  }, []);

  const refresh = useCallback(() => {
    fetch("/api/shopify/store")
      .then((r) => r.json())
      .then((data) => setStoreInfo(data))
      .catch(() => {});
  }, []);

  return { storeInfo, loading, refresh };
}

// ============================================================
// Helpers
// ============================================================

async function fetchTemplatePreview(
  industry: string,
  tone: string,
  pageType: string,
): Promise<PageData | null> {
  try {
    const params = new URLSearchParams({ industry, tone, pageType });
    const res = await fetch(`/api/template-preview?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.html) return null;
    const styleMatch = data.html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const css = styleMatch ? styleMatch[1].trim() : "";
    const html = data.html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").trim();
    return { html, css };
  } catch (e) {
    console.warn("[Aicata] Template prefetch failed:", e);
    return null;
  }
}

const PAGE_CREATION_TEMPLATES: Record<string, string> = {
  "トップページを新しく作りたい": "landing",
  "トップページを作成して": "landing",
  "商品を魅力的に紹介するページ": "product",
  "商品コレクション（カテゴリー）ページ": "collection",
  "カートページのデザイン": "cart",
  "ランディングページを作り": "landing",
  "私たちについて": "about",
};

const URL_PATTERN = /https?:\/\/[^\s]+/;

function detectTemplateType(prompt: string): string | null {
  for (const [keyword, type] of Object.entries(PAGE_CREATION_TEMPLATES)) {
    if (prompt.includes(keyword)) return type;
  }
  return null;
}

function containsUrl(text: string): boolean {
  return URL_PATTERN.test(text);
}

// ============================================================
// Shopify Connection Banner
// ============================================================

function ShopifyConnectionBanner({
  onDismiss,
  compact = false,
}: {
  onDismiss: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`max-w-2xl mx-auto w-full px-4 ${compact ? "pb-1" : "pb-3"}`}>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/40">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0">
          <Store className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-green-800">
            Shopifyストアを接続するとデプロイできます
          </p>
          <p className="text-[11px] text-green-600 mt-0.5">
            作成したページをワンクリックでストアに公開
          </p>
        </div>
        <a
          href="/api/shopify/install"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-md hover:shadow-green-500/20 transition-all shrink-0"
        >
          <ExternalLink className="w-3 h-3" />
          接続する
        </a>
        <button
          onClick={onDismiss}
          className="p-1 rounded text-green-400 hover:text-green-600 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

interface ChatViewProps {
  conversationId?: string | null;
  onConversationCreated?: (id: string) => void;
  onPageUpdate?: (data: PageData | null) => void;
  onStreamingChange?: (isStreaming: boolean) => void;
  onTemplatePreviewChange?: (isTemplate: boolean) => void;
  pendingMessage?: string | null;
  onPendingMessageConsumed?: () => void;
}

export default function ChatView({
  conversationId,
  onConversationCreated,
  onPageUpdate,
  onStreamingChange,
  onTemplatePreviewChange,
  pendingMessage,
  onPendingMessageConsumed,
}: ChatViewProps) {
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    loadMessages,
  } = useChat({ conversationId, onConversationCreated });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ── Shopify Connection ──
  const { storeInfo, loading: shopifyLoading } = useShopifyConnection();
  const [shopifyBannerDismissed, setShopifyBannerDismissed] = useState(false);
  const showShopifyBanner =
    !shopifyLoading &&
    storeInfo &&
    !storeInfo.connected &&
    !shopifyBannerDismissed &&
    messages.length > 0; // ページ生成後に表示

  // ── Rebuild Flow Modal ──
  const [showRebuildFlow, setShowRebuildFlow] = useState(false);

  // ── Onboarding state ──
  const [onboardingType, setOnboardingType] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.pageType) {
        setOnboardingType(detail.pageType);
      }
    };
    window.addEventListener("aicata:start-onboarding", handler);
    return () => window.removeEventListener("aicata:start-onboarding", handler);
  }, []);

  // ── Brand Memory ──
  const [brandMemoryHint, setBrandMemoryHint] = useState<BrandMemoryHint | null>(null);
  useEffect(() => {
    fetch("/api/brand-memory")
      .then((r) => r.json())
      .then((data) => {
        if (data.memory && data.memory.industry && data.memory.industry !== "general") {
          setBrandMemoryHint({
            brandName: data.memory.brandName || "",
            industry: data.memory.industry,
            tones: data.memory.tones || [],
            targetAudience: data.memory.targetAudience || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const [currentPageType, setCurrentPageType] = useState<string | null>(null);
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  // ── 送信準備中フラグ（WelcomeScreen のフラッシュ防止） ──
  const [isSending, setIsSending] = useState(false);

  // isSending を解除: メッセージが追加されたら送信準備完了
  useEffect(() => {
    if (isSending && (messages.length > 0 || isStreaming)) {
      setIsSending(false);
    }
  }, [isSending, messages.length, isStreaming]);

  // onboardingType をメッセージ到着後に安全にクリア（WelcomeScreen フラッシュ防止）
  useEffect(() => {
    if (pendingOnboardingClearRef.current && messages.length > 0) {
      pendingOnboardingClearRef.current = false;
      setOnboardingType(null);
    }
  }, [messages.length]);

  // ストリーミング状態の変化を親コンポーネントに通知
  useEffect(() => {
    onStreamingChange?.(isStreaming);
  }, [isStreaming, onStreamingChange]);

  // Detect page data in AI responses and update preview
  useEffect(() => {
    if (!onPageUpdate) return;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === "assistant" && msg.content) {
        if (msg.content.includes("---PAGE_START---")) {
          const data = extractPageData(msg.content);
          if (data) {
            const bodyContent = data.html.replace(/<link[^>]*>/gi, "").trim();
            console.log("[Aicata] Page extracted:", {
              htmlLength: data.html.length,
              cssLength: data.css.length,
              bodyContentLength: bodyContent.length,
            });
            onTemplatePreviewChange?.(false);
            onPageUpdate(data);
            return;
          }
        }
      }

        // ── 続き生成の結合: PAGE_START がないが、前のメッセージに不完全なページがある ──
        if (i === messages.length - 1 && !msg.content.includes("---PAGE_START---")) {
          for (let j = i - 1; j >= 0; j--) {
            const prevMsg = messages[j];
            if (prevMsg.role === "assistant" && prevMsg.content.includes("---PAGE_START---") && !prevMsg.content.includes("---PAGE_END---")) {
              const combinedContent = prevMsg.content + "\n" + msg.content + "\n---PAGE_END---";
              const data = extractPageData(combinedContent);
              if (data) {
                onPageUpdate(data);
                return;
              }
              break;
            }
          }
        }
    }
  }, [messages, onPageUpdate]);

  // Auto-scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 200;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load conversation messages
  const isStreamingRef = useRef(false);
  isStreamingRef.current = isStreaming;

  useEffect(() => {
    if (!conversationId) {
      loadMessages([]);
      return;
    }
    if (isStreamingRef.current) return;
    (async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}`);
        if (!res.ok) return;
        const data = await res.json();
        const loaded: Message[] = data.conversation.messages.map(
          (m: { id: string; role: string; content: string }) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          }),
        );
        if (!isStreamingRef.current) {
          loadMessages(loaded);
        }
      } catch (error) {
        console.error("[ChatView] Failed to load messages:", error);
      }
    })();
  }, [conversationId, loadMessages]);

  const handleSend = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      // WelcomeScreen フラッシュ防止: 初回送信時は即座にフラグを立てる
      if (messages.length === 0) {
        setIsSending(true);
      }
      let urlAnalysis: unknown;

      if (containsUrl(content)) {
        const urlMatch = content.match(URL_PATTERN);
        if (urlMatch) {
          const url = urlMatch[0];
          setIsAnalyzingUrl(true);
          try {
            const res = await fetch("/api/analyze-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url }),
            });
            if (res.ok) {
              urlAnalysis = await res.json();
            }
          } catch (e) {
            console.error("[ChatView] URL analysis error:", e);
          } finally {
            setIsAnalyzingUrl(false);
          }
        }
      }

      sendMessage(content, attachments, currentPageType || undefined, urlAnalysis);
    },
    [sendMessage, currentPageType, messages.length],
  );

  // WelcomeScreen: template selection
  const handleSelectTemplate = useCallback(
    (prompt: string, pageType?: string) => {
      const detectedType = pageType || detectTemplateType(prompt);
      if (detectedType) {
        setCurrentPageType(detectedType);
        setOnboardingType(detectedType);
      } else {
        handleSend(prompt);
      }
    },
    [handleSend],
  );

  // WelcomeScreen: "新しいサイトを作成" or "リビルド"
  const handleStartSiteBuild = useCallback(
    (mode: "new" | "rebuild", url?: string) => {
      if (mode === "new") {
        // 新しいサイト構築 → オンボーディング
        setCurrentPageType("landing");
        setOnboardingType("site-build");
      } else if (mode === "rebuild") {
        // リビルド → ビジュアルサイトマップフローを開く
        setShowRebuildFlow(true);
      }
    },
    [],
  );

  // SiteRebuildFlow完了
  const handleRebuildComplete = useCallback(
    (analyzedPages: any[], context: any) => {
      setShowRebuildFlow(false);
      // 完了通知 — ページはDBに保存済みなので、チャットで案内
      const pageCount = analyzedPages.length;
      const types = [...new Set(analyzedPages.map((p: any) => p.pageType))];
      const summary = `サイトのリビルドが完了しました！${pageCount}ページを生成しました（${types.join("、")}）。サイトマップ画面で確認できます。`;

      // リビルド完了メッセージとしてチャットに表示
      handleSend(summary);
    },
    [handleSend],
  );

  // Onboarding completion
  // NOTE: onboardingType を null にするのはメッセージが追加されてからにする。
  // 先に null にすると showWelcome=true の瞬間が発生してフラッシュする。
  const pendingOnboardingClearRef = useRef(false);
  const handleOnboardingComplete = useCallback(
    async (compiledPrompt: string, pageType: string, selections: OnboardingSelections) => {
      setCurrentPageType(pageType === "site-build" ? "landing" : pageType);
      pendingOnboardingClearRef.current = true;
      handleSend(compiledPrompt);
    },
    [handleSend],
  );

  const handleOnboardingCancel = useCallback(() => {
    setOnboardingType(null);
  }, []);

  // Strip page markers from display
  const displayContent = useCallback((content: string) => {
    if (hasPageData(content)) {
      const stripped = stripPageMarkers(content);
      if (stripped.trim()) return stripped;
      return "ページをプレビューに反映しました。右側のプレビューパネルでご確認ください。";
    }

    const trimmed = content.trim();
    const codeLines = trimmed.split("\n").filter((line) => {
      const l = line.trim();
      return (
        l.startsWith(".") || l.startsWith("#") || l.startsWith("@media") ||
        l.startsWith("@keyframes") || l.match(/^\w+[-\w]*\s*\{/) ||
        l.match(/^\s*[\w-]+\s*:/) || l.startsWith("}") ||
        l.startsWith("<") || l.startsWith("</") || l === ""
      );
    });

    const totalLines = trimmed.split("\n").filter((l) => l.trim()).length;
    if (totalLines > 5 && codeLines.length / totalLines > 0.7) {
      const textParts = trimmed
        .split("\n")
        .filter((line) => {
          const l = line.trim();
          return (
            l && !l.startsWith(".") && !l.startsWith("#") && !l.startsWith("@") &&
            !l.match(/^\w+[-\w]*\s*\{/) && !l.match(/^\s*[\w-]+\s*:/) &&
            !l.startsWith("}") && !l.startsWith("<") && !l.startsWith("---PAGE")
          );
        })
        .join("\n")
        .trim();
      return textParts || "ページの生成を続行しています。プレビューパネルで確認できます。";
    }

    return content;
  }, []);

  const lastMessage = messages[messages.length - 1];
  const showStreamingIndicator =
    isStreaming && lastMessage?.role === "assistant" && !lastMessage.content;
  const isGeneratingPage =
    isStreaming && lastMessage?.role === "assistant" &&
    lastMessage.content.includes("---PAGE_START---");

  const showWelcome = messages.length === 0 && !isStreaming && !onboardingType && !isSending;
  const showOnboarding = onboardingType !== null && messages.length === 0;

  return (
    <div className="flex flex-col h-screen">
      {/* Messages / Welcome / Onboarding */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {showOnboarding ? (
          <OnboardingFlow
            templateType={onboardingType}
            onComplete={handleOnboardingComplete}
            onCancel={handleOnboardingCancel}
            brandMemory={brandMemoryHint}
          />
        ) : showWelcome ? (
          <WelcomeScreen
            onSelectTemplate={handleSelectTemplate}
            onStartSiteBuild={handleStartSiteBuild}
            hasBrandMemory={!!brandMemoryHint}
            brandName={brandMemoryHint?.brandName}
          />
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
            {/* 送信準備中のローディング表示 */}
            {isSending && messages.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 text-base-content/50">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span className="text-sm">準備しています...</span>
                </div>
              </div>
            )}
            {messages.map((msg) =>
              msg.role === "assistant" && !msg.content && isStreaming ? (
                <ChatMessage key={msg.id} role="assistant" content="" isStreaming />
              ) : (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.role === "assistant" ? displayContent(msg.content) : msg.content}
                  attachments={msg.attachments}
                />
              ),
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Shopify 未接続バナー ── */}
      {showShopifyBanner && (
        <ShopifyConnectionBanner onDismiss={() => setShopifyBannerDismissed(true)} />
      )}

      {/* ── 不完全な生成の検出 + 続行バナー ── */}
      {!isStreaming && messages.length > 0 && (() => {
        const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
        if (!lastAssistant) return null;
        const hasStart = lastAssistant.content.includes("---PAGE_START---");
        const hasEnd = lastAssistant.content.includes("---PAGE_END---");
        const isIncomplete = hasStart && !hasEnd;
        if (!isIncomplete) return null;

        return (
          <div className="max-w-2xl mx-auto w-full px-4 pb-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/50">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-amber-800">
                  ページの生成が途中で止まっています
                </p>
                <p className="text-[11px] text-amber-600 mt-0.5">
                  ネットワーク状況やサーバー負荷により中断された可能性があります
                </p>
              </div>
              <button
                onClick={() => {
                  const pageStartIdx = lastAssistant.content.indexOf("---PAGE_START---");
                  const partialHtml = pageStartIdx >= 0
                    ? lastAssistant.content.slice(pageStartIdx + "---PAGE_START---".length)
                    : "";
                  const lastChunk = partialHtml.slice(-200).trim();
                  const continuationMsg = lastChunk
                    ? `前回のページ生成が途中で中断されました。以下が中断直前のコードの末尾です:\n\`\`\`\n${lastChunk}\n\`\`\`\nこの続きからコードを出力してください。前回の途中から再開し、残りのHTML/CSSを出力して最後に ---PAGE_END--- で閉じてください。`
                    : "前回のページ生成が途中で中断されました。---PAGE_START--- から ---PAGE_END--- まで完全なページを再生成してください。";
                  handleSend(continuationMsg);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-md hover:shadow-amber-500/20 transition-all shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                続きを生成
              </button>
            </div>
          </div>
        );
      })()}

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto w-full px-4 pb-2">
          <div className="text-[13px] text-error bg-error/5 rounded-xl px-3 py-2 border border-error/10">
            {error}
          </div>
        </div>
      )}

      {/* URL Analysis indicator */}
      {isAnalyzingUrl && (
        <div className="max-w-2xl mx-auto w-full px-4 pb-1">
          <div className="flex items-center gap-3 py-2 px-4 rounded-xl bg-white/60 backdrop-blur-sm border border-accent/10 shadow-sm shadow-accent/5">
            <div className="relative w-5 h-5 shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent border-r-accent/30 animate-spin" style={{ animationDuration: "1s" }} />
            </div>
            <span className="text-[13px] text-accent font-medium">サイトを分析中...</span>
          </div>
        </div>
      )}

      {/* Streaming indicator */}
      {isStreaming && !isAnalyzingUrl && (
        <div className="max-w-2xl mx-auto w-full px-4 pb-1">
          {isGeneratingPage ? (
            <div className="flex items-center gap-3 py-2 px-4 rounded-xl bg-white/60 backdrop-blur-sm border border-accent/10 shadow-sm shadow-accent/5">
              <div className="relative w-5 h-5 shrink-0">
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent border-r-accent/30 animate-spin" style={{ animationDuration: "1s" }} />
              </div>
              <span className="text-[13px] text-accent font-medium">
                デザインを構築中...プレビューに反映されます
              </span>
            </div>
          ) : (
            <div className="h-0.5 w-full bg-accent/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent to-[#5b8def] rounded-full" style={{ animation: "loading-bar 1.8s ease-in-out infinite" }} />
            </div>
          )}
        </div>
      )}

      {/* Input — hide during onboarding */}
      {!showOnboarding && (
        <div className="max-w-2xl mx-auto w-full">
          <ChatInput
            onSend={handleSend}
            onStop={isStreaming ? stopStreaming : undefined}
            disabled={(showStreamingIndicator ?? false) || isAnalyzingUrl}
            placeholder={
              messages.length === 0
                ? "Shopifyストアについて何でも相談してください..."
                : isAnalyzingUrl
                  ? "サイトを分析中..."
                  : isStreaming
                    ? "Aicataが応答中..."
                    : "メッセージを入力..."
            }
            prefillMessage={pendingMessage}
            onPrefillConsumed={onPendingMessageConsumed}
          />
        </div>
      )}

      {/* ── SiteRebuildFlow モーダル ── */}
      {showRebuildFlow && (
        <SiteRebuildFlow
          onClose={() => setShowRebuildFlow(false)}
          onComplete={handleRebuildComplete}
        />
      )}
    </div>
  );
}
