"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import WelcomeScreen from "./WelcomeScreen";
import OnboardingFlow, {
  type OnboardingSelections,
  type BrandMemoryHint,
} from "./OnboardingFlow";
import { Sparkles, RefreshCw } from "lucide-react";
import { useChat, type Message, type Attachment } from "@/hooks/useChat";
import { extractPageData, stripPageMarkers, hasPageData } from "@/lib/page-parser";
import type { PageData } from "@/lib/page-parser";

/**
 * テンプレートプリフェッチ: オンボーディング完了時に即座にテンプレートを取得
 * → AIが応答する前にプレビューパネルにテンプレートを表示する
 */
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

    // template-preview API は assembleFullHtml() の結果を返す
    // これは <link>タグ + セクションHTML + <style>CSS</style> の形式
    // extractPageData と同じ方法でHTML/CSSを分離する
    const styleMatch = data.html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const css = styleMatch ? styleMatch[1].trim() : "";
    const html = data.html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").trim();

    console.log("[Aicata] Template prefetched:", {
      templateId: data.templateId,
      htmlLength: html.length,
      cssLength: css.length,
    });

    return { html, css };
  } catch (e) {
    console.warn("[Aicata] Template prefetch failed:", e);
    return null;
  }
}

// Templates that trigger the onboarding flow (page creation)
// Maps keyword fragments → Gen-3 PageType
const PAGE_CREATION_TEMPLATES: Record<string, string> = {
  "トップページを新しく作りたい": "landing",
  "商品を魅力的に紹介するページ": "product",
  "商品コレクション（カテゴリー）ページ": "collection",
  "カートページのデザイン": "cart",
  "ランディングページを作りたい": "landing",
  "私たちについて": "about",
};

/** URL pattern detection for site rebuild flow */
const URL_PATTERN = /https?:\/\/[^\s]+/;

/** Check if a prompt matches a page creation template and return its type */
function detectTemplateType(prompt: string): string | null {
  for (const [keyword, type] of Object.entries(PAGE_CREATION_TEMPLATES)) {
    if (prompt.includes(keyword)) return type;
  }
  return null;
}

/** Check if message contains a URL (for site analysis flow) */
function containsUrl(text: string): boolean {
  return URL_PATTERN.test(text);
}

interface ChatViewProps {
  conversationId?: string | null;
  onConversationCreated?: (id: string) => void;
  onPageUpdate?: (data: PageData | null) => void;
  onStreamingChange?: (isStreaming: boolean) => void;
  /** テンプレートプレビュー表示状態の変更通知 */
  onTemplatePreviewChange?: (isTemplate: boolean) => void;
  /** プレビューからのセクション編集リクエスト — チャット入力にプリセット */
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

  // Onboarding state
  const [onboardingType, setOnboardingType] = useState<string | null>(null);
  // Listen for page-type-specific creation from SiteMapView
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
  // Brand Memory — 存在すればオンボーディングをスキップ
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
  // Gen-3 page type for the current session
  const [currentPageType, setCurrentPageType] = useState<string | null>(null);
  // URL analysis loading state
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);

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
            // Validate: ensure html has actual renderable content (not just link tags)
            const bodyContent = data.html.replace(/<link[^>]*>/gi, "").trim();
            console.log("[Aicata] Page extracted:", {
              htmlLength: data.html.length,
              cssLength: data.css.length,
              bodyContentLength: bodyContent.length,
              htmlPreview: data.html.slice(0, 200),
              cssPreview: data.css.slice(0, 200),
              hasPageEnd: msg.content.includes("---PAGE_END---"),
            });
            // AI生成コンテンツが来た → テンプレートプレビューから昇格
            onTemplatePreviewChange?.(false);
            onPageUpdate(data);
            return;
          } else {
            console.warn("[Aicata] PAGE_START found but extractPageData returned null. Content length:", msg.content.length);
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
      container.scrollHeight - container.scrollTop - container.clientHeight <
      200;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load conversation messages (skip during streaming to prevent race condition)
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
      let urlAnalysis: unknown;

      // Check if message contains a URL and analyze it
      if (containsUrl(content)) {
        const urlMatch = content.match(URL_PATTERN);
        if (urlMatch) {
          const url = urlMatch[0];
          setIsAnalyzingUrl(true);
          try {
            console.log("[ChatView] Analyzing URL:", url);
            const res = await fetch("/api/analyze-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url }),
            });

            if (res.ok) {
              urlAnalysis = await res.json();
              console.log("[ChatView] URL analysis completed:", urlAnalysis);
            } else {
              console.warn("[ChatView] URL analysis failed:", res.status);
              // Continue without analysis
            }
          } catch (e) {
            console.error("[ChatView] URL analysis error:", e);
            // Continue without analysis on error
          } finally {
            setIsAnalyzingUrl(false);
          }
        }
      }

      sendMessage(content, attachments, currentPageType || undefined, urlAnalysis);
    },
    [sendMessage, currentPageType],
  );

  // WelcomeScreen template selection: route to onboarding or direct send
  const handleSelectTemplate = useCallback(
    (prompt: string, pageType?: string) => {
      const detectedType = pageType || detectTemplateType(prompt);
      if (detectedType) {
        // Page creation → store pageType and show onboarding flow
        setCurrentPageType(detectedType);
        setOnboardingType(detectedType);
      } else {
        // Non-page template (SEO, etc.) → send directly
        handleSend(prompt);
      }
    },
    [handleSend],
  );

  // Onboarding completion: send to AI (DDP pipeline handles everything)
  const handleOnboardingComplete = useCallback(
    async (compiledPrompt: string, pageType: string, selections: OnboardingSelections) => {
      setOnboardingType(null);
      setCurrentPageType(pageType);

      // DDP パイプラインがゼロからオリジナルデザインを生成する
      // テンプレートプリフェッチは不要（DDPはテンプレートに依存しない）
      handleSend(compiledPrompt);
    },
    [handleSend],
  );

  const handleOnboardingCancel = useCallback(() => {
    setOnboardingType(null);
  }, []);

  // For display: strip page markers from assistant messages
  const displayContent = useCallback((content: string) => {
    // 1. PAGE_START/END マーカーがある → マーカー間のコードを除去
    if (hasPageData(content)) {
      const stripped = stripPageMarkers(content);
      // マーカー除去後に残ったテキストがあればそれを表示
      if (stripped.trim()) return stripped;
      // 全てコードだった場合 → プレビューで確認してもらう
      return "ページをプレビューに反映しました。右側のプレビューパネルでご確認ください。";
    }

    // 2. 再開時のCSS/HTMLコード出力を検出して非表示にする
    //    （マーカーなしでCSSやHTMLの続きが出力される場合）
    const trimmed = content.trim();

    // ほぼ全体がCSS/HTMLコード → 非表示
    const codeLines = trimmed.split("\n").filter((line) => {
      const l = line.trim();
      return (
        l.startsWith(".") ||
        l.startsWith("#") ||
        l.startsWith("@media") ||
        l.startsWith("@keyframes") ||
        l.match(/^\w+[-\w]*\s*\{/) ||
        l.match(/^\s*[\w-]+\s*:/) ||
        l.startsWith("}") ||
        l.startsWith("<") ||
        l.startsWith("</") ||
        l === ""
      );
    });

    const totalLines = trimmed.split("\n").filter((l) => l.trim()).length;
    if (totalLines > 5 && codeLines.length / totalLines > 0.7) {
      // 70%以上がコード行 → ユーザーにはコードを見せない
      // テキスト部分だけ抽出
      const textParts = trimmed
        .split("\n")
        .filter((line) => {
          const l = line.trim();
          return (
            l &&
            !l.startsWith(".") &&
            !l.startsWith("#") &&
            !l.startsWith("@") &&
            !l.match(/^\w+[-\w]*\s*\{/) &&
            !l.match(/^\s*[\w-]+\s*:/) &&
            !l.startsWith("}") &&
            !l.startsWith("<") &&
            !l.startsWith("---PAGE")
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
    isStreaming &&
    lastMessage?.role === "assistant" &&
    lastMessage.content.includes("---PAGE_START---");

  // Determine what to show in the main area
  const showWelcome = messages.length === 0 && !isStreaming && !onboardingType;
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
            hasBrandMemory={!!brandMemoryHint}
            brandName={brandMemoryHint?.brandName}
          />
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
            {messages.map((msg) =>
              msg.role === "assistant" && !msg.content && isStreaming ? (
                <ChatMessage
                  key={msg.id}
                  role="assistant"
                  content=""
                  isStreaming
                />
              ) : (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={
                    msg.role === "assistant"
                      ? displayContent(msg.content)
                      : msg.content
                  }
                  attachments={msg.attachments}
                />
              ),
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

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
                onClick={() => handleSend(
                  "前回のページ生成が途中で中断されました。まず「ページの続きを生成します」と一言述べてから、前回の中断箇所の続きとして ---PAGE_START--- から ---PAGE_END--- まで完全なページを再生成してください。",
                )}
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
            <span className="text-[13px] text-accent font-medium">
              サイトを分析中...
            </span>
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
    </div>
  );
}
