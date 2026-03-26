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
const StoreDnaView = dynamic(
  () => import("@/components/settings/StoreDnaView"),
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
const SeoView = dynamic(() => import("@/components/seo/SeoView"), {
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground text-sm">
        読み込み中...
      </div>
    </div>
  ),
});
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
import { SAVE_FEEDBACK_DURATION_MS, AUTO_SAVE_DEBOUNCE_MS } from "@/lib/constants";

interface ConversationItem {
  id: string;
  title: string;
  updatedAt: string;
  lastMessage?: string;
  type: string;
}

// NAV_LABELS と ComingSoonPlaceholder は不要になったため削除済み

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
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  // ── Undo/Redo 用の HTML 履歴スタック ──
  const htmlHistoryRef = useRef<string[]>([]);
  const htmlHistoryIndexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

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

  const handleSelectConversation = useCallback(async (id: string) => {
    setActiveConversationId(id);
    setPageData(null);
    setSavedPageId(null);
    setSaveState("idle");
    setIsStreaming(false);
    setMobilePanel("chat");
    setChatSessionKey((k) => k + 1);

    // ── 会話に紐づくページをDBから復元 ──
    // ChatView のメッセージ読み込みと並行して実行し、savedPageId を確実にセット
    try {
      const res = await fetch(`/api/pages?conversationId=${id}`);
      if (res.ok) {
        const data = await res.json();
        const page = data.pages?.[0];
        if (page?.hasHtml) {
          // ページが見つかった場合、savedPageId をセット（保存・自動保存が正しく動作するように）
          setSavedPageId(page.id);
          // pageData も復元（ChatView の extractPageData が後から上書きする可能性あり、それでOK）
          const pageRes = await fetch(`/api/pages/${page.id}`);
          if (pageRes.ok) {
            const pageDetail = await pageRes.json();
            if (pageDetail.page?.html) {
              setPageData({
                html: pageDetail.page.html,
                css: pageDetail.page.css || "",
              });
            }
          }
        }
      }
    } catch {
      // Non-fatal: ChatView のメッセージからページデータは復元される
    }
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
      // Undo 履歴を初期化（新しいページ生成時）
      htmlHistoryRef.current = [data.html];
      htmlHistoryIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
    }
  }, []);

  const handleHtmlChange = useCallback((newHtml: string) => {
    setPageData((prev) => {
      if (!prev) return prev;

      // ── Undo/Redo 履歴にプッシュ ──
      const history = htmlHistoryRef.current;
      const idx = htmlHistoryIndexRef.current;
      // 現在位置より先の履歴を切り捨て
      htmlHistoryRef.current = history.slice(0, idx + 1);
      htmlHistoryRef.current.push(newHtml);
      // 最大50エントリに制限
      if (htmlHistoryRef.current.length > 50) {
        htmlHistoryRef.current = htmlHistoryRef.current.slice(-50);
      }
      htmlHistoryIndexRef.current = htmlHistoryRef.current.length - 1;
      setCanUndo(htmlHistoryIndexRef.current > 0);
      setCanRedo(false);

      return { ...prev, html: newHtml };
    });
    setSaveState("idle");

    // ── Auto-save: 3秒 debounce ──
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      // savedPageId がある場合のみ自動保存（新規未保存ページは自動保存しない）
      // ref 経由で最新の値を参照（stale closure 回避）
      if (savedPageIdRef.current) {
        handleSaveInternalRef.current();
      }
    }, AUTO_SAVE_DEBOUNCE_MS);
    // handleSavePageInternal は ref 経由で安定化しているため依存不要
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ── 保存のコアロジック（auto-save / 手動保存 共用） ──
  const pageDataRef = useRef(pageData);
  pageDataRef.current = pageData;
  const savedPageIdRef = useRef(savedPageId);
  savedPageIdRef.current = savedPageId;

  const handleSavePageInternal = useCallback(async () => {
    const currentPageData = pageDataRef.current;
    if (!currentPageData) return;

    // Optimistic: 即座に "saved" 表示
    setSaveState("saving");

    try {
      if (savedPageIdRef.current) {
        const res = await fetch(`/api/pages/${savedPageIdRef.current}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            html: currentPageData.html,
            css: currentPageData.css,
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
            html: currentPageData.html,
            css: currentPageData.css,
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
      saveTimerRef.current = setTimeout(() => setSaveState("idle"), SAVE_FEEDBACK_DURATION_MS);
    } catch (error) {
      console.error("Page save error:", error);
      setSaveState("idle");
    }
  }, [activeConversationId, conversations]);

  const handleSaveInternalRef = useRef(handleSavePageInternal);
  handleSaveInternalRef.current = handleSavePageInternal;

  const handleSavePage = useCallback(async () => {
    // auto-save タイマーをクリア（手動保存が優先）
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    await handleSaveInternalRef.current();
  }, []);

  // ── Undo / Redo ──
  const handleUndo = useCallback(() => {
    const idx = htmlHistoryIndexRef.current;
    if (idx <= 0) return;
    const newIdx = idx - 1;
    htmlHistoryIndexRef.current = newIdx;
    const prevHtml = htmlHistoryRef.current[newIdx];
    setPageData((prev) => (prev ? { ...prev, html: prevHtml } : prev));
    setCanUndo(newIdx > 0);
    setCanRedo(true);
    setSaveState("idle");
  }, []);

  const handleRedo = useCallback(() => {
    const idx = htmlHistoryIndexRef.current;
    const history = htmlHistoryRef.current;
    if (idx >= history.length - 1) return;
    const newIdx = idx + 1;
    htmlHistoryIndexRef.current = newIdx;
    const nextHtml = history[newIdx];
    setPageData((prev) => (prev ? { ...prev, html: nextHtml } : prev));
    setCanUndo(true);
    setCanRedo(newIdx < history.length - 1);
    setSaveState("idle");
  }, []);

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
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
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
          <ErrorBoundary label="エディタ">
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
              onUndo={canUndo ? handleUndo : undefined}
              onRedo={canRedo ? handleRedo : undefined}
            />
          </ErrorBoundary>
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
                        autoSendPending={editorMode}
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
                        autoSendPending={editorMode}
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
                      // handleSelectConversation が DB からページデータと savedPageId を自動復元する
                      setActiveNav("chat");
                      await handleSelectConversation(data.conversationId);
                      // handleSelectConversation が pageData と savedPageId を
                      // 既にセットしているため、追加のフェッチは不要
                    } catch {
                      alert("ページの改善準備に失敗しました");
                    }
                  }}
                />
              </ErrorBoundary>
            ) : activeNav === "store-dna" ? (
              <ErrorBoundary label="ストアDNA">
                <StoreDnaView />
              </ErrorBoundary>
            ) : activeNav === "site" ? (
              <ErrorBoundary label="サイト構築">
                <SiteBuilderView />
              </ErrorBoundary>
            ) : activeNav === "seo" ? (
              <ErrorBoundary label="SEO分析">
                <SeoView />
              </ErrorBoundary>
            ) : null}
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
  const NAV_LABEL_MAP: Record<string, string> = {
    chat: "ページ制作",
    site: "サイト構築",
    pages: "ページ管理",
    "store-dna": "ストアDNA",
    seo: "SEO",
    admin: "Intelligence",
    settings: "設定",
  };
  const label = NAV_LABEL_MAP[activeNav] ?? activeNav;

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
