"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  RefreshCw,
  Save,
  Check,
  Loader2,
  Sparkles,
  MousePointer2,
  Maximize2,
} from "lucide-react";
import clsx from "clsx";
import { useIframeSections, getSectionDetectionScript } from "../editor/useIframeSections";
import SectionOverlay from "../editor/SectionOverlay";
import SectionEditPanel from "../editor/SectionEditPanel";
import GeneratingOverlay from "./GeneratingOverlay";
import {
  moveSectionUp,
  moveSectionDown,
  deleteSection,
} from "@/lib/html-section-editor";
import type { DeviceType } from "@/hooks/useViewport";

interface LivePreviewProps {
  html: string;
  css: string;
  title?: string;
  savedPageId?: string | null;
  onSave?: () => void;
  saveState?: "idle" | "saving" | "saved";
  isGenerating?: boolean;
  enableSectionEditor?: boolean;
  onHtmlChange?: (newHtml: string) => void;
  onAiRewriteSection?: (sectionId: string, instruction: string) => void;
  onChatEditSection?: (sectionId: string) => void;
  /** AIで自動改善（セクション単位で再生成） */
  onEnhanceSection?: (sectionId: string) => void;
  onOpenEditor?: () => void;
  isTemplatePreview?: boolean;
  /** 親から渡されるビューポートのデバイス種別 */
  viewport?: DeviceType;
  /** コンパクトモード（ツールバー非表示でフルプレビュー） */
  compact?: boolean;
}

type ViewMode = "desktop" | "tablet" | "mobile";

const VIEW_SIZES: Record<
  ViewMode,
  { width: string; icon: typeof Monitor; label: string }
> = {
  desktop: { width: "100%", icon: Monitor, label: "デスクトップ" },
  tablet: { width: "768px", icon: Tablet, label: "タブレット" },
  mobile: { width: "375px", icon: Smartphone, label: "モバイル" },
};

/**
 * AI生成HTMLから <link> タグを抽出して <head> に移動する
 */
function extractLinkTags(html: string): { links: string; body: string } {
  const linkRegex = /<link[^>]*>/gi;
  const links: string[] = [];
  const body = html.replace(linkRegex, (match) => {
    links.push(match);
    return "";
  });
  return { links: links.join("\n"), body: body.trim() };
}

/**
 * AI生成コンテンツを完全なHTMLドキュメントに組み立てる
 */
export function buildFullHtml(html: string, css: string, enableSectionEditor: boolean = false): string {
  const { links, body } = extractLinkTags(html);

  const needsGoogleFonts =
    links.includes("fonts.googleapis.com") ||
    css.includes("fonts.googleapis.com");

  const sectionDetectionScript = enableSectionEditor ? getSectionDetectionScript() : "";

  const hasContent = body.trim().length > 0;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
${needsGoogleFonts ? `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` : ""}
${links ? `  ${links}` : ""}
  <style>
/* === Aicata Base Reset === */
*, *::before, *::after { box-sizing: border-box; }
html, body {
  margin: 0;
  min-height: 100vh;
  background-color: #ffffff;
  color: #333333;
  font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  overflow-y: auto !important;
}
img { max-width: 100%; height: auto; display: block; }
a { text-decoration: none; color: inherit; }
section, header, footer, main, nav { display: block; }
  </style>
  <style>
/* === AI Generated CSS === */
${css}
  </style>
</head>
<body>
${hasContent ? body : `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;color:#999;font-size:14px;">ページを構築中...</div>`}
</body>
${sectionDetectionScript ? `<script>${sectionDetectionScript}</script>` : ""}
</html>`;
}

/**
 * ビューポートデバイス種別からデフォルトのViewModeを返す
 */
function getDefaultViewMode(viewport?: DeviceType): ViewMode {
  if (viewport === "mobile") return "mobile";
  if (viewport === "tablet") return "tablet";
  return "desktop";
}

export default function LivePreview({
  html,
  css,
  title,
  savedPageId,
  onSave,
  saveState = "idle",
  isGenerating = false,
  enableSectionEditor = false,
  onHtmlChange,
  onAiRewriteSection,
  onChatEditSection,
  onEnhanceSection,
  onOpenEditor,
  isTemplatePreview = false,
  viewport,
  compact = false,
}: LivePreviewProps) {
  // デバイスに応じたデフォルトViewMode
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    getDefaultViewMode(viewport),
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [editorEnabled, setEditorEnabled] = useState(enableSectionEditor);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const wasGeneratingRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const isMobileViewport = viewport === "mobile" || viewport === "tablet";

  // ビューポート変更時にViewModeを同期
  const prevViewportRef = useRef(viewport);
  useEffect(() => {
    if (viewport !== prevViewportRef.current) {
      setViewMode(getDefaultViewMode(viewport));
      prevViewportRef.current = viewport;
    }
  }, [viewport]);

  const srcdoc = useMemo(
    () => buildFullHtml(html, css, editorEnabled),
    [html, css, editorEnabled],
  );

  const currentView = VIEW_SIZES[viewMode];

  const { sections } = useIframeSections(iframeRef);

  useEffect(() => {
    if (wasGeneratingRef.current && !isGenerating && html) {
      setShowComplete(true);
      const timer = setTimeout(() => setShowComplete(false), 3000);
      return () => clearTimeout(timer);
    }
    wasGeneratingRef.current = isGenerating;
  }, [isGenerating, html]);

  const handleOpenInNewTab = useCallback(() => {
    const fullHtml = buildFullHtml(html, css, false);
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [html, css]);

  const handleEditSection = useCallback((sectionId: string) => {
    setEditingSectionId(sectionId);
  }, []);

  const handleMoveUpSection = useCallback(
    (sectionId: string) => {
      if (!onHtmlChange) return;
      const newHtml = moveSectionUp(html, sectionId);
      if (newHtml !== html) {
        onHtmlChange(newHtml);
        setRefreshKey((k) => k + 1);
      }
    },
    [html, onHtmlChange],
  );

  const handleMoveDownSection = useCallback(
    (sectionId: string) => {
      if (!onHtmlChange) return;
      const newHtml = moveSectionDown(html, sectionId);
      if (newHtml !== html) {
        onHtmlChange(newHtml);
        setRefreshKey((k) => k + 1);
      }
    },
    [html, onHtmlChange],
  );

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      if (!onHtmlChange) return;
      const newHtml = deleteSection(html, sectionId);
      if (newHtml !== html) {
        onHtmlChange(newHtml);
        setEditingSectionId(null);
        setRefreshKey((k) => k + 1);
      }
    },
    [html, onHtmlChange],
  );

  const handleHtmlChangeFromEditor = useCallback(
    (newHtml: string) => {
      onHtmlChange?.(newHtml);
      setRefreshKey((k) => k + 1);
    },
    [onHtmlChange],
  );

  // ── モバイルでのiframe幅: viewMode=mobileなら100%、desktopならスケールダウン
  const iframeMobileStyle = useMemo(() => {
    if (!isMobileViewport) return {};
    if (viewMode === "desktop") {
      // デスクトップ表示をモバイル画面に縮小して全体を見せる
      return {
        width: "1280px",
        height: "200%",
        transform: "scale(0.5)",
        transformOrigin: "top left",
      };
    }
    if (viewMode === "tablet") {
      return {
        width: "768px",
        height: "150%",
        transform: "scale(0.65)",
        transformOrigin: "top left",
      };
    }
    // mobile → そのまま100%
    return { width: "100%", height: "100%" };
  }, [isMobileViewport, viewMode]);

  // スケールダウン時のコンテナサイズ
  const containerMobileStyle = useMemo(() => {
    if (!isMobileViewport) return {};
    if (viewMode === "desktop") {
      return { width: "100%", height: "100%", overflow: "auto" };
    }
    if (viewMode === "tablet") {
      return { width: "100%", height: "100%", overflow: "auto" };
    }
    return {};
  }, [isMobileViewport, viewMode]);

  return (
    <div
      className={clsx(
        "flex h-full overflow-hidden relative",
        compact
          ? "bg-white"
          : "bg-[#f5f6fa] rounded-xl border border-border",
      )}
    >
      {/* Main preview column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* ===== Toolbar ===== */}
        {!compact && (
          <div
            className={clsx(
              "flex items-center justify-between px-3 bg-white/80 backdrop-blur-sm border-b border-border shrink-0",
              isMobileViewport ? "h-12 px-2" : "h-11 px-4",
            )}
          >
            {/* 左: ドット + ラベル */}
            <div className="flex items-center gap-2">
              {!isMobileViewport && (
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] opacity-80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e] opacity-80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840] opacity-80" />
                </div>
              )}
              <span
                className={clsx(
                  "text-muted-foreground truncate",
                  isMobileViewport
                    ? "text-[11px] max-w-[100px]"
                    : "text-[12px] ml-3 max-w-[200px]",
                )}
              >
                プレビュー
              </span>
            </div>

            {/* 右: ツールバーボタン群 */}
            <div className="flex items-center gap-0.5">
              {/* Device toggles */}
              {(
                Object.entries(VIEW_SIZES) as [
                  ViewMode,
                  (typeof VIEW_SIZES)[ViewMode],
                ][]
              ).map(([mode, config]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={clsx(
                    "rounded-lg transition-all duration-200",
                    isMobileViewport ? "p-2.5" : "p-1.5",
                    viewMode === mode
                      ? "bg-accent/8 text-accent"
                      : "text-muted hover:text-foreground hover:bg-black/[0.04]",
                  )}
                  title={config.label}
                >
                  <config.icon className={isMobileViewport ? "w-4.5 h-4.5" : "w-3.5 h-3.5"} />
                </button>
              ))}

              <div className="w-px h-4 bg-border mx-0.5" />

              {/* 保存 */}
              {onSave && (
                <button
                  onClick={onSave}
                  disabled={!html || saveState === "saving"}
                  className={clsx(
                    "flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-medium transition-all",
                    saveState === "saved"
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-sm shadow-emerald-500/20"
                      : "text-muted hover:text-foreground hover:bg-black/[0.04]",
                    "disabled:opacity-30 disabled:cursor-not-allowed",
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
                  {/* モバイルではラベル省略 */}
                  {!isMobileViewport && (
                    <span>
                      {saveState === "saving"
                        ? "保存中..."
                        : saveState === "saved"
                          ? "保存済み"
                          : savedPageId
                            ? "更新"
                            : "保存"}
                    </span>
                  )}
                </button>
              )}

              {/* エディタトグル（デスクトップのみ完全表示 / モバイルはアイコンのみ） */}
              {html && onHtmlChange && (
                <>
                  <div className="w-px h-4 bg-border mx-0.5" />
                  <button
                    onClick={() => {
                      setEditorEnabled((v) => !v);
                      if (editorEnabled) setEditingSectionId(null);
                    }}
                    className={clsx(
                      "flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-medium transition-all duration-200",
                      editorEnabled
                        ? "bg-accent/8 text-accent"
                        : "text-muted hover:text-foreground hover:bg-black/[0.04]",
                    )}
                    title={
                      editorEnabled
                        ? "エディタを閉じる"
                        : "セクション編集モード"
                    }
                  >
                    <MousePointer2 className="w-3.5 h-3.5" />
                    {!isMobileViewport && "編集"}
                  </button>
                </>
              )}

              {/* フルスクリーンエディタ */}
              {onOpenEditor && html && (
                <>
                  <div className="w-px h-4 bg-border mx-0.5" />
                  <button
                    onClick={onOpenEditor}
                    className={clsx(
                      "flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-medium bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] text-white hover:opacity-90 transition-all shadow-sm",
                    )}
                    title="フルスクリーンエディタで開く"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    {!isMobileViewport && "エディタで開く"}
                  </button>
                </>
              )}

              <div className="w-px h-4 bg-border mx-0.5" />

              {/* 新規タブで開く */}
              <button
                onClick={handleOpenInNewTab}
                disabled={!html}
                className={clsx(
                  "rounded-xl text-muted hover:text-foreground hover:bg-black/[0.04] transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
                  isMobileViewport ? "p-2.5" : "p-1.5",
                )}
                title="新しいタブで開く"
              >
                <ExternalLink className={isMobileViewport ? "w-4.5 h-4.5" : "w-3.5 h-3.5"} />
              </button>

              {/* Refresh */}
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className={clsx(
                  "rounded-xl text-muted hover:text-foreground hover:bg-black/[0.04] transition-colors",
                  isMobileViewport ? "p-2.5" : "p-1.5",
                )}
                title="プレビューを更新"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ===== Preview area ===== */}
        <div
          ref={previewContainerRef}
          className={clsx(
            "flex-1 overflow-auto relative",
            isMobileViewport
              ? "flex justify-center p-0"
              : "flex justify-center p-4",
          )}
        >
          <div
            className={clsx(
              "overflow-auto transition-all duration-300 h-full relative",
              isMobileViewport
                ? "w-full"
                : "bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
            )}
            style={
              isMobileViewport
                ? containerMobileStyle
                : { width: currentView.width, maxWidth: "100%" }
            }
          >
            {html ? (
              <>
                <iframe
                  ref={iframeRef}
                  key={`${refreshKey}-${viewMode}`}
                  srcDoc={srcdoc}
                  className="border-0"
                  style={
                    isMobileViewport
                      ? {
                          ...iframeMobileStyle,
                          border: "none",
                        }
                      : { width: "100%", height: "100%" }
                  }
                  sandbox="allow-scripts allow-same-origin"
                  title="ページプレビュー"
                />

                {/* セクションエディタオーバーレイ */}
                {editorEnabled && !isMobileViewport && (
                  <SectionOverlay
                    sections={sections}
                    iframeContainer={previewContainerRef.current}
                    onEditSection={handleEditSection}
                    onMoveUp={handleMoveUpSection}
                    onMoveDown={handleMoveDownSection}
                    onDeleteSection={handleDeleteSection}
                    onChatEditSection={onChatEditSection}
                    onEnhanceSection={onEnhanceSection}
                  />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 p-8">
                <Monitor className="w-12 h-12 text-accent/30" />
                <p className="text-[14px] text-center">
                  チャットでページの内容を伝えると、
                  <br />
                  ここにリアルタイムでプレビューが表示されます
                </p>
              </div>
            )}
          </div>

          {/* デスクトップ表示のスケールインジケータ（モバイルビューポートで） */}
          {isMobileViewport && viewMode === "desktop" && html && (
            <div className="absolute top-2 right-2 z-20">
              <div className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                50% 表示
              </div>
            </div>
          )}
          {isMobileViewport && viewMode === "tablet" && html && (
            <div className="absolute top-2 right-2 z-20">
              <div className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                65% 表示
              </div>
            </div>
          )}

          {/* テンプレートプレビュー中のカスタマイズ進行バナー */}
          {isTemplatePreview && isGenerating && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30">
              <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md rounded-full px-5 py-2.5 shadow-lg shadow-accent/10 border border-accent/15">
                <div className="relative w-4 h-4 shrink-0">
                  <div
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent border-r-accent/40 animate-spin"
                    style={{ animationDuration: "1s" }}
                  />
                </div>
                <span className="text-[13px] font-medium text-accent">
                  AIがデザインをカスタマイズ中...
                </span>
              </div>
            </div>
          )}

          {/* デザイン生成中のオーバーレイ（テンプレートがない場合のみ） */}
          <GeneratingOverlay
            isGenerating={isGenerating && !isTemplatePreview}
          />
        </div>

        {/* 生成完了トースト */}
        <div
          className={clsx(
            "absolute bottom-6 left-1/2 -translate-x-1/2 z-20 transition-all duration-500",
            showComplete
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none",
          )}
        >
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-lg shadow-emerald-500/10 border border-emerald-100">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-700">
              デザインが完成しました！
            </span>
          </div>
        </div>
      </div>
      {/* End main preview column */}

      {/* セクション編集パネル（右サイドバー） — デスクトップのみ */}
      {!isMobileViewport && (
        <AnimatePresence>
          {editingSectionId && editorEnabled && onHtmlChange && (
            <div className="w-[300px] shrink-0 h-full">
              <SectionEditPanel
                sectionId={editingSectionId}
                html={html}
                onHtmlChange={handleHtmlChangeFromEditor}
                onClose={() => setEditingSectionId(null)}
                onAiRewrite={onAiRewriteSection}
              />
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
