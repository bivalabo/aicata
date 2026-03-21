"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import MobilePanelSwitcher, {
  type MobilePanel,
} from "@/components/layout/MobilePanelSwitcher";
import ChatView from "@/components/chat/ChatView";
import LivePreview from "@/components/preview/LivePreview";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { useViewport } from "@/hooks/useViewport";
import clsx from "clsx";

const AdminDashboard = dynamic(
  () => import("@/components/admin/AdminDashboard"),
  {
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">
          読み込み中...
        </div>
      </div>
    ),
  },
);
const EditorView = dynamic(() => import("@/components/editor/EditorView"), {
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground text-sm">
        読み込み中...
      </div>
    </div>
  ),
});
const SiteMapView = dynamic(() => import("@/components/pages/SiteMapView"), {
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground text-sm">
        読み込み中...
      </div>
    </div>
  ),
});
const SettingsView = dynamic(
  () => import("@/components/settings/SettingsView"),
  {
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">
          読み込み中...
        </div>
      </div>
    ),
  },
);
const SiteBuilderView = dynamic(
  () => import(/* webpackChunkName: "site-builder-v3" */ "@/components/site-builder/SiteBuilderView"),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">
          読み込み中...
        </div>
      </div>
    ),
  },
);
import type { PageData } from "@/lib/page-parser";
import { buildSectionEditPrompt } from "@/lib/section-labels";

interface ConversationItem {
  id: string;
  title: string;
  updatedAt: string;
  lastMessage?: string;
  type: string;
}

const NAV_LABELS: Record<string, { title: string; description: string }> = {
  site: {
    title: "サイト構築",
    description: "Shopifyストアの構築・テーマ設定を管理します",
  },
  pages: {
    title: "ページ管理",
    description: "AIで生成したページの一覧・編集・Shopifyへのデプロイ",
  },
  seo: {
    title: "SEO",
    description: "検索エンジン最適化の分析・改善ツール",
  },
  admin: {
    title: "Aicata Intelligence",
    description: "ACE & ADIS — デザイン知能の管理・キュレーション",
  },
  settings: {
    title: "設定",
    description: "アプリ設定・Shopify連携・APIキーの管理",
  },
};

function ComingSoonPlaceholder({ navId }: { navId: string }) {
  const info = NAV_LABELS[navId] || { title: navId, description: "" };
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <span className="text-2xl">🚧</span>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          {info.title}
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {info.description}
        </p>
      </div>
      <span className="text-xs text-muted-foreground/60 bg-black/[0.03] px-3 py-1.5 rounded-full">
        近日公開予定
      </span>
    </div>
  );
}

export default function Home() {
  const viewport = useViewport();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isTemplatePreview, setIsTemplatePreview] = useState(false);
  const [activeNav, setActiveNav] = useState("chat");
  const [chatSessionKey, setChatSessionKey] = useState(0);
  const [savedPageId, setSavedPageId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  // ── モバイル用: チャット/プレビュー切り替え ──
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("chat");

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── AI生成完了時にモバイルでプレビューへ自動切り替え ──
  const prevPageDataRef = useRef<PageData | null>(null);
  useEffect(() => {
    if (
      viewport.isMobileOrTablet &&
      pageData &&
      !prevPageDataRef.current &&
      mobilePanel === "chat"
    ) {
      // 初めてpageDataが生成された → プレビュータブへ自動切り替え
      setMobilePanel("preview");
    }
    prevPageDataRef.current = pageData;
  }, [pageData, viewport.isMobileOrTablet, mobilePanel]);

  // Load conversations from API
  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(
        data.conversations.map(
          (c: {
            id: string;
            title: string;
            updatedAt: string;
            lastMessage?: string;
            type: string;
          }) => ({
            id: c.id,
            title: c.title,
            updatedAt: c.updatedAt,
            lastMessage: c.lastMessage,
            type: c.type,
          }),
        ),
      );
    } catch (error) {
      console.error("[PageApp] Failed to load conversations:", error);
    }
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const handleNewChat = useCallback(() => {
    setActiveConversationId(null);
    setPageData(null);
    setSavedPageId(null);
    setSaveState("idle");
    setIsStreaming(false);
    setActiveNav("chat");
    setMobilePanel("chat");
    setChatSessionKey((k) => k + 1);
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setPageData(null);
    setSavedPageId(null);
    setSaveState("idle");
    setIsStreaming(false);
    setMobilePanel("chat");
    setChatSessionKey((k) => k + 1);
  }, []);

  const handleConversationCreated = useCallback(
    (id: string) => {
      setActiveConversationId(id);
      setTimeout(refreshConversations, 500);
    },
    [refreshConversations],
  );

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/conversations/${id}`, { method: "DELETE" });
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setPageData(null);
        }
        refreshConversations();
      } catch (error) {
        console.error("[PageApp] Failed to delete conversation:", error);
      }
    },
    [activeConversationId, refreshConversations],
  );

  const handlePageUpdate = useCallback((data: PageData | null) => {
    setPageData(data);
    if (data) {
      setSaveState("idle");
    }
  }, []);

  const handleHtmlChange = useCallback((newHtml: string) => {
    setPageData((prev) => (prev ? { ...prev, html: newHtml } : prev));
    setSaveState("idle");
  }, []);

  const [pendingSectionEdit, setPendingSectionEdit] = useState<string | null>(
    null,
  );

  const handleChatEditSection = useCallback(
    (sectionId: string) => {
      const prompt = buildSectionEditPrompt(sectionId);
      setPendingSectionEdit(prompt);
      // モバイルではチャットに切り替え
      if (viewport.isMobileOrTablet) {
        setMobilePanel("chat");
      }
    },
    [viewport.isMobileOrTablet],
  );

  const handleSavePage = useCallback(async () => {
    if (!pageData) return;
    setSaveState("saving");

    try {
      if (savedPageId) {
        const res = await fetch(`/api/pages/${savedPageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            html: pageData.html,
            css: pageData.css,
          }),
        });
        if (!res.ok) throw new Error("Update failed");
      } else {
        const title =
          conversations.find((c) => c.id === activeConversationId)?.title ||
          "無題のページ";
        const res = await fetch("/api/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            html: pageData.html,
            css: pageData.css,
            conversationId: activeConversationId,
          }),
        });
        if (!res.ok) throw new Error("Create failed");
        const data = await res.json();
        if (!data?.page?.id) {
          throw new Error("Invalid response: missing page ID");
        }
        setSavedPageId(data.page.id);
      }
      setSaveState("saved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveState("idle"), 3000);
    } catch (error) {
      console.error("Page save error:", error);
      setSaveState("idle");
    }
  }, [pageData, savedPageId, activeConversationId, conversations]);

  const [isStreaming, setIsStreaming] = useState(false);
  const showPreview = pageData !== null;

  // ── フルスクリーンエディタモード ──
  const [editorMode, setEditorMode] = useState(false);

  const handleOpenEditor = useCallback(() => {
    setEditorMode(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setEditorMode(false);
  }, []);

  const [editorAIPending, setEditorAIPending] = useState<string | null>(null);
  const handleEditorAIMessage = useCallback((message: string) => {
    setPendingSectionEdit(message);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // ── モバイル: fullPreview では UI 要素を最小化 ──
  const isFullPreview = mobilePanel === "fullPreview";

  // ================================================================
  // レンダリング
  // ================================================================

  return (
    <>
      {/* ── フルスクリーンエディタ ── */}
      <AnimatePresence>
        {editorMode && pageData && (
          <EditorView
            html={pageData.html}
            css={pageData.css}
            pageTitle={
              conversations.find((c) => c.id === activeConversationId)
                ?.title || "無題のページ"
            }
            savedPageId={savedPageId}
            onSave={handleSavePage}
            saveState={saveState}
            isGenerating={isStreaming}
            onHtmlChange={handleHtmlChange}
            onBack={handleCloseEditor}
            onSendAIMessage={handleEditorAIMessage}
            pendingAIMessage={editorAIPending}
            onPendingAIMessageConsumed={() => setEditorAIPending(null)}
          />
        )}
      </AnimatePresence>

      <div
        className={clsx(
          "flex overflow-hidden",
          viewport.isMobileOrTablet ? "h-[100dvh]" : "h-screen",
        )}
      >
        {/* ── サイドバー: デスクトップのみ表示 ── */}
        {viewport.isDesktop && (
          <Sidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onNewChat={handleNewChat}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
            activeNav={activeNav}
            onNavigate={(nav) => setActiveNav(nav)}
          />
        )}

        {/* Main content area */}
        <main
          className={clsx(
            "flex-1 overflow-hidden flex flex-col",
            viewport.isMobileOrTablet && !isFullPreview && "pb-14",
          )}
        >
          {/* ── モバイル: ヘッダーバー ── */}
          {viewport.isMobileOrTablet && !isFullPreview && (
            <MobileHeader
              onNewChat={handleNewChat}
              activeNav={activeNav}
            />
          )}

          {/* ── モバイル: チャット/プレビュー切り替えタブ ── */}
          {viewport.isMobileOrTablet &&
            activeNav === "chat" &&
            showPreview &&
            !isFullPreview && (
              <MobilePanelSwitcher
                activePanel={mobilePanel}
                onSwitch={setMobilePanel}
                hasPreview={showPreview}
                showFullPreviewOption={true}
              />
            )}

          {/* ── コンテンツ ── */}
          <div className="flex-1 overflow-hidden flex">
            {activeNav === "chat" ? (
              viewport.isDesktop ? (
                /* ===== デスクトップレイアウト: サイドバイサイド ===== */
                <>
                  <div
                    className={
                      showPreview
                        ? "w-[45%] min-w-[360px] overflow-hidden transition-all duration-300"
                        : "flex-1 overflow-hidden"
                    }
                  >
                    <ErrorBoundary label="チャット">
                      <ChatView
                        key={chatSessionKey}
                        conversationId={activeConversationId}
                        onConversationCreated={handleConversationCreated}
                        onPageUpdate={handlePageUpdate}
                        onStreamingChange={setIsStreaming}
                        onTemplatePreviewChange={setIsTemplatePreview}
                        pendingMessage={pendingSectionEdit}
                        onPendingMessageConsumed={() =>
                          setPendingSectionEdit(null)
                        }
                      />
                    </ErrorBoundary>
                  </div>

                  {showPreview && (
                    <div className="flex-1 p-2 pl-0 overflow-hidden">
                      <ErrorBoundary label="プレビュー">
                        <LivePreview
                          html={pageData?.html ?? ""}
                          css={pageData?.css ?? ""}
                          title="プレビュー"
                          savedPageId={savedPageId}
                          onSave={handleSavePage}
                          saveState={saveState}
                          isGenerating={isStreaming}
                          isTemplatePreview={isTemplatePreview}
                          enableSectionEditor
                          onHtmlChange={handleHtmlChange}
                          onChatEditSection={handleChatEditSection}
                          onOpenEditor={handleOpenEditor}
                          viewport={viewport.device}
                        />
                      </ErrorBoundary>
                    </div>
                  )}
                </>
              ) : (
                /* ===== モバイル/タブレット: タブ切り替え ===== */
                <>
                  {/* チャットパネル */}
                  <div
                    className={
                      mobilePanel === "chat" || !showPreview
                        ? "flex-1 overflow-hidden"
                        : "hidden"
                    }
                  >
                    <ErrorBoundary label="チャット">
                      <ChatView
                        key={chatSessionKey}
                        conversationId={activeConversationId}
                        onConversationCreated={handleConversationCreated}
                        onPageUpdate={handlePageUpdate}
                        onStreamingChange={setIsStreaming}
                        onTemplatePreviewChange={setIsTemplatePreview}
                        pendingMessage={pendingSectionEdit}
                        onPendingMessageConsumed={() =>
                          setPendingSectionEdit(null)
                        }
                      />
                    </ErrorBoundary>
                  </div>

                  {/* プレビューパネル */}
                  {showPreview && (
                    <div
                      className={
                        mobilePanel === "preview" ||
                        mobilePanel === "fullPreview"
                          ? "flex-1 overflow-hidden"
                          : "hidden"
                      }
                    >
                      <ErrorBoundary label="プレビュー">
                        <LivePreview
                          html={pageData?.html ?? ""}
                          css={pageData?.css ?? ""}
                          title="プレビュー"
                          savedPageId={savedPageId}
                          onSave={handleSavePage}
                          saveState={saveState}
                          isGenerating={isStreaming}
                          isTemplatePreview={isTemplatePreview}
                          enableSectionEditor
                          onHtmlChange={handleHtmlChange}
                          onChatEditSection={handleChatEditSection}
                          onOpenEditor={handleOpenEditor}
                          viewport={viewport.device}
                          compact={isFullPreview}
                        />
                      </ErrorBoundary>
                    </div>
                  )}
                </>
              )
            ) : activeNav === "settings" ? (
              <ErrorBoundary label="設定">
                <SettingsView />
              </ErrorBoundary>
            ) : activeNav === "admin" ? (
              <ErrorBoundary label="Intelligence Dashboard">
                <AdminDashboard />
              </ErrorBoundary>
            ) : activeNav === "pages" ? (
              <ErrorBoundary label="サイトマップ">
                <SiteMapView
                  onNavigateToChat={() => {
                    setActiveNav("chat");
                    handleNewChat();
                  }}
                  onCreatePageByType={(pageType) => {
                    setActiveNav("chat");
                    handleNewChat();
                    // ページタイプに対応したオンボーディングを直接開始
                    // ChatViewがマウントされた後にonboardingTypeをセットするため少し遅延
                    setTimeout(() => {
                      const event = new CustomEvent("aicata:start-onboarding", {
                        detail: { pageType },
                      });
                      window.dispatchEvent(event);
                    }, 100);
                  }}
                  onEditPage={(conversationId) => {
                    setActiveNav("chat");
                    handleSelectConversation(conversationId);
                  }}
                  onEnhancePage={async (pageId) => {
                    try {
                      const res = await fetch(
                        `/api/pages/${pageId}/enhance`,
                        { method: "POST" },
                      );
                      const data = await res.json();
                      if (data.error) {
                        alert(data.error);
                        return;
                      }
                      // Navigate to chat with the new/existing conversation
                      setActiveNav("chat");
                      handleSelectConversation(data.conversationId);
                      // Load page data into preview
                      const pageRes = await fetch(`/api/pages/${pageId}`);
                      const pageData = await pageRes.json();
                      if (pageData.page) {
                        setPageData({
                          html: pageData.page.html,
                          css: pageData.page.css,
                        });
                      }
                    } catch {
                      alert("ページの改善準備に失敗しました");
                    }
                  }}
                />
              </ErrorBoundary>
            ) : activeNav === "site" ? (
              <ErrorBoundary label="サイト構築">
                <SiteBuilderView />
              </ErrorBoundary>
            ) : (
              <ComingSoonPlaceholder navId={activeNav} />
            )}
          </div>
        </main>
      </div>

      {/* ── モバイル: ボトムナビ ── */}
      {viewport.isMobileOrTablet && !isFullPreview && (
        <MobileBottomNav activeNav={activeNav} onNavigate={setActiveNav} />
      )}
    </>
  );
}

// ================================================================
// モバイルヘッダー（サイドバー代替）
// ================================================================

import { Sparkles, FilePlus2 } from "lucide-react";

function MobileHeader({
  onNewChat,
  activeNav,
}: {
  onNewChat: () => void;
  activeNav: string;
}) {
  const label =
    activeNav === "chat"
      ? "ページ制作"
      : NAV_LABELS[activeNav]?.title ?? activeNav;

  return (
    <div className="flex items-center justify-between h-12 px-4 bg-white/80 backdrop-blur-sm border-b border-border shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#5b8def] flex items-center justify-center shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[14px] font-semibold tracking-tight text-foreground">
          {label}
        </span>
      </div>

      {activeNav === "chat" && (
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] text-white shadow-sm active:scale-[0.97] transition-transform"
        >
          <FilePlus2 className="w-3.5 h-3.5" />
          新規
        </button>
      )}
    </div>
  );
}
