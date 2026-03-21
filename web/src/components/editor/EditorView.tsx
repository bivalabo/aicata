"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Tablet,
  Save,
  Check,
  Loader2,
  ExternalLink,
  RefreshCw,
  MousePointer2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import clsx from "clsx";
import { useIframeSections, getSectionDetectionScript } from "./useIframeSections";
import SectionOverlay from "./SectionOverlay";
import SectionEditPanel from "./SectionEditPanel";
import EditorLayersPanel from "./EditorLayersPanel";
import EditorAIPanel from "./EditorAIPanel";
import GeneratingOverlay from "../preview/GeneratingOverlay";
import {
  moveSectionUp,
  moveSectionDown,
  deleteSection,
} from "@/lib/html-section-editor";
import { buildFullHtml } from "../preview/LivePreview";
import { getSectionLabel } from "@/lib/section-labels";

type ViewMode = "desktop" | "tablet" | "mobile";

const VIEW_SIZES: Record<ViewMode, { width: number; icon: typeof Monitor; label: string }> = {
  desktop: { width: 1440, icon: Monitor, label: "デスクトップ" },
  tablet: { width: 768, icon: Tablet, label: "タブレット" },
  mobile: { width: 375, icon: Smartphone, label: "モバイル" },
};

interface EditorViewProps {
  html: string;
  css: string;
  pageTitle?: string;
  savedPageId?: string | null;
  onSave?: () => void;
  saveState?: "idle" | "saving" | "saved";
  isGenerating?: boolean;
  onHtmlChange?: (newHtml: string) => void;
  onBack: () => void;
  /** AI chat message sending */
  onSendAIMessage?: (message: string) => void;
  onStopAI?: () => void;
  /** Prefill for AI input from section actions */
  pendingAIMessage?: string | null;
  onPendingAIMessageConsumed?: () => void;
}

export default function EditorView({
  html,
  css,
  pageTitle = "無題のページ",
  savedPageId,
  onSave,
  saveState = "idle",
  isGenerating = false,
  onHtmlChange,
  onBack,
  onSendAIMessage,
  onStopAI,
  pendingAIMessage,
  onPendingAIMessageConsumed,
}: EditorViewProps) {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [zoom, setZoom] = useState(0.7); // Start at 70% to show full desktop width
  const [refreshKey, setRefreshKey] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [editorEnabled, setEditorEnabled] = useState(true);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [layersCollapsed, setLayersCollapsed] = useState(false);
  const wasGeneratingRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Build iframe content
  const srcdoc = useMemo(
    () => buildFullHtml(html, css, editorEnabled),
    [html, css, editorEnabled]
  );

  const currentView = VIEW_SIZES[viewMode];

  // Section detection
  const { sections } = useIframeSections(iframeRef);

  // Generation complete detection
  useEffect(() => {
    if (wasGeneratingRef.current && !isGenerating && html) {
      setShowComplete(true);
      const timer = setTimeout(() => setShowComplete(false), 3000);
      return () => clearTimeout(timer);
    }
    wasGeneratingRef.current = isGenerating;
  }, [isGenerating, html]);

  // Auto-fit zoom based on container width
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width - 64; // padding
        const targetWidth = VIEW_SIZES[viewMode].width;
        if (targetWidth > containerWidth) {
          const fitZoom = Math.max(0.3, Math.min(1, containerWidth / targetWidth));
          setZoom(fitZoom);
        } else {
          setZoom(Math.min(1, containerWidth / targetWidth));
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [viewMode]);

  // Open in new tab
  const handleOpenInNewTab = useCallback(() => {
    const fullHtml = buildFullHtml(html, css, false);
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [html, css]);

  // Zoom controls
  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(1.5, z + 0.1)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(0.2, z - 0.1)), []);
  const handleZoomReset = useCallback(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const containerWidth = container.clientWidth - 64;
    const targetWidth = VIEW_SIZES[viewMode].width;
    setZoom(Math.min(1, containerWidth / targetWidth));
  }, [viewMode]);

  // Section editor handlers
  const handleEditSection = useCallback((sectionId: string) => {
    setEditingSectionId(sectionId);
    setSelectedSectionId(sectionId);
  }, []);

  const handleSelectSection = useCallback((sectionId: string | null) => {
    setSelectedSectionId(sectionId);
    // Scroll to section in iframe
    if (sectionId && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "scrollToSection", sectionId },
        "*"
      );
    }
  }, []);

  const handleMoveUpSection = useCallback((sectionId: string) => {
    if (!onHtmlChange) return;
    const newHtml = moveSectionUp(html, sectionId);
    if (newHtml !== html) {
      onHtmlChange(newHtml);
      setRefreshKey((k) => k + 1);
    }
  }, [html, onHtmlChange]);

  const handleMoveDownSection = useCallback((sectionId: string) => {
    if (!onHtmlChange) return;
    const newHtml = moveSectionDown(html, sectionId);
    if (newHtml !== html) {
      onHtmlChange(newHtml);
      setRefreshKey((k) => k + 1);
    }
  }, [html, onHtmlChange]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    if (!onHtmlChange) return;
    const newHtml = deleteSection(html, sectionId);
    if (newHtml !== html) {
      onHtmlChange(newHtml);
      setEditingSectionId(null);
      setSelectedSectionId(null);
      setRefreshKey((k) => k + 1);
    }
  }, [html, onHtmlChange]);

  const handleHtmlChangeFromEditor = useCallback((newHtml: string) => {
    onHtmlChange?.(newHtml);
    setRefreshKey((k) => k + 1);
  }, [onHtmlChange]);

  const handleChatEditSection = useCallback((sectionId: string) => {
    // This will be handled by sending to the AI panel
    if (onSendAIMessage) {
      const label = getSectionLabel(sectionId);
      onSendAIMessage(`「${label}」セクションを改善してください`);
    }
  }, [onSendAIMessage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#0c0c16]"
    >
      {/* ═══════ Top Toolbar ═══════ */}
      <div className="flex items-center justify-between h-12 px-4 bg-[#10101f] border-b border-white/[0.05] shrink-0">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[12px] font-medium hidden sm:block">戻る</span>
          </button>

          <div className="h-5 w-px bg-white/[0.08]" />

          <span className="text-[13px] font-medium text-white/80 truncate max-w-[200px]">
            {pageTitle}
          </span>
        </div>

        {/* Center: Device toggles + zoom */}
        <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1">
          {(Object.entries(VIEW_SIZES) as [ViewMode, (typeof VIEW_SIZES)[ViewMode]][]).map(
            ([mode, config]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                  viewMode === mode
                    ? "bg-white/[0.12] text-white/90 shadow-sm"
                    : "text-white/35 hover:text-white/70"
                )}
              >
                <config.icon className="w-3.5 h-3.5" />
                <span className="hidden md:block">{config.label}</span>
              </button>
            )
          )}

          <div className="h-4 w-px bg-white/[0.08] mx-1" />

          {/* Zoom controls */}
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
            title="ズームアウト"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomReset}
            className="px-2 py-1 rounded-lg text-[10px] font-mono tabular-nums text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors min-w-[40px] text-center"
            title="ズームリセット"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
            title="ズームイン"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Editor toggle */}
          <button
            onClick={() => {
              setEditorEnabled((v) => !v);
              if (editorEnabled) {
                setEditingSectionId(null);
                setSelectedSectionId(null);
              }
            }}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all",
              editorEnabled
                ? "bg-accent/20 text-accent"
                : "text-white/40 hover:text-white/60 hover:bg-white/[0.06]"
            )}
          >
            <MousePointer2 className="w-3.5 h-3.5" />
            <span className="hidden sm:block">編集モード</span>
          </button>

          <div className="h-4 w-px bg-white/[0.08]" />

          {/* Save */}
          {onSave && (
            <button
              onClick={onSave}
              disabled={!html || saveState === "saving"}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                saveState === "saved"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white",
                "disabled:opacity-30 disabled:cursor-not-allowed"
              )}
              title={savedPageId ? "ページを更新" : "ページを保存"}
            >
              {saveState === "saving" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saveState === "saved" ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saveState === "saving"
                ? "保存中..."
                : saveState === "saved"
                  ? "保存済み"
                  : savedPageId
                    ? "更新"
                    : "保存"}
            </button>
          )}

          {/* New tab */}
          <button
            onClick={handleOpenInNewTab}
            disabled={!html}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors disabled:opacity-30"
            title="新しいタブで開く"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Refresh */}
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
            title="リフレッシュ"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ═══════ Main Content Area ═══════ */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Layers Panel */}
        {editorEnabled && (
          <EditorLayersPanel
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSelectSection={handleSelectSection}
            onMoveUp={onHtmlChange ? handleMoveUpSection : undefined}
            onMoveDown={onHtmlChange ? handleMoveDownSection : undefined}
            onDelete={onHtmlChange ? handleDeleteSection : undefined}
            collapsed={layersCollapsed}
            onToggleCollapse={() => setLayersCollapsed((v) => !v)}
          />
        )}

        {/* ═══════ Canvas Area ═══════ */}
        <div
          ref={canvasContainerRef}
          className="flex-1 overflow-auto flex justify-center items-start p-8 relative"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "24px 24px" }}
        >
          {/* Canvas wrapper with zoom transform */}
          <div
            className="relative transition-transform duration-200"
            style={{
              width: `${currentView.width}px`,
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
            }}
          >
            {/* Page frame with shadow */}
            <div className="bg-white rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-hidden relative">
              {html ? (
                <>
                  <iframe
                    ref={iframeRef}
                    key={refreshKey}
                    srcDoc={srcdoc}
                    className="w-full border-0"
                    style={{ height: "100vh", minHeight: "800px" }}
                    sandbox="allow-same-origin allow-scripts"
                    title="ページエディター"
                    onLoad={() => {
                      // Auto-resize iframe to content height
                      try {
                        const iframe = iframeRef.current;
                        if (iframe?.contentDocument?.body) {
                          const height = iframe.contentDocument.body.scrollHeight;
                          iframe.style.height = `${height}px`;
                        }
                      } catch { /* cross-origin fallback */ }
                    }}
                  />

                  {/* Section overlay */}
                  {editorEnabled && (
                    <SectionOverlay
                      sections={sections}
                      iframeContainer={canvasContainerRef.current}
                      onEditSection={handleEditSection}
                      onMoveUp={onHtmlChange ? handleMoveUpSection : undefined}
                      onMoveDown={onHtmlChange ? handleMoveDownSection : undefined}
                      onDeleteSection={onHtmlChange ? handleDeleteSection : undefined}
                      onChatEditSection={handleChatEditSection}
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] text-white/20 gap-4">
                  <Monitor className="w-16 h-16" />
                  <p className="text-[14px]">ページを生成してください</p>
                </div>
              )}
            </div>
          </div>

          {/* Generating overlay */}
          <GeneratingOverlay isGenerating={isGenerating} />

          {/* Completion toast */}
          <div
            className={clsx(
              "fixed bottom-24 left-1/2 -translate-x-1/2 z-30 transition-all duration-500",
              showComplete
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            )}
          >
            <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-xl rounded-full px-5 py-2.5 border border-emerald-500/30">
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-emerald-300">
                デザインが完成しました
              </span>
            </div>
          </div>
        </div>

        {/* ═══════ Properties Panel (right, contextual) ═══════ */}
        <AnimatePresence>
          {editingSectionId && editorEnabled && onHtmlChange && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="shrink-0 h-full overflow-hidden border-l border-white/[0.06]"
            >
              <div className="w-[300px] h-full">
                <SectionEditPanel
                  sectionId={editingSectionId}
                  html={html}
                  onHtmlChange={handleHtmlChangeFromEditor}
                  onClose={() => setEditingSectionId(null)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════ Bottom AI Panel ═══════ */}
      {onSendAIMessage && (
        <EditorAIPanel
          onSendMessage={onSendAIMessage}
          onStop={onStopAI}
          isStreaming={isGenerating}
          selectedSectionId={selectedSectionId}
          selectedSectionLabel={
            selectedSectionId ? getSectionLabel(selectedSectionId) : undefined
          }
          prefillMessage={pendingAIMessage}
          onPrefillConsumed={onPendingAIMessageConsumed}
        />
      )}
    </motion.div>
  );
}
