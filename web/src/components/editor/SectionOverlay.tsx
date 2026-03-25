"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Pencil, Sparkles } from "lucide-react";
import { SectionBounds } from "./useIframeSections";
import SectionToolbar from "./SectionToolbar";
import { getSectionLabel } from "@/lib/section-labels";

interface SectionOverlayProps {
  sections: Map<string, SectionBounds>;
  iframeContainer: HTMLElement | null;
  onEditSection?: (sectionId: string) => void;
  onMoveUp?: (sectionId: string) => void;
  onMoveDown?: (sectionId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  /** チャットにセクション編集リクエストを送信 */
  onChatEditSection?: (sectionId: string) => void;
  /** AIで自動改善（セクション単位） */
  onEnhanceSection?: (sectionId: string) => void;
  /** セクションデザイン置換を開始 */
  onSwapSection?: (sectionId: string) => void;
  /** EditorView の zoom レベル — セクション座標のスケーリング補正に使用 */
  zoom?: number;
}

interface SectionHighlight {
  id: string;
  label: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * iframeの上にレンダリングされるセクションハイライトオーバーレイ
 * - ホバーで日本語ラベル表示
 * - クリックで選択 → ツールバー表示
 * - 「チャットで編集」ボタンで即座にAI編集リクエスト
 */
export default function SectionOverlay({
  sections,
  iframeContainer,
  onEditSection,
  onMoveUp,
  onMoveDown,
  onDeleteSection,
  onChatEditSection,
  onEnhanceSection,
  onSwapSection,
  zoom = 1,
}: SectionOverlayProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const containerRef = useRef(iframeContainer);
  containerRef.current = iframeContainer;

  // セクション座標計算
  // iframe 内の getBoundingClientRect() はビューポート相対座標。
  // SectionOverlay の absolute div は `position: relative` の祖先（page frame）内で配置。
  // page frame は zoom 変換コンテナの子要素なので、iframe 座標をそのまま使えば
  // CSS transform が自動的にスケーリングする。
  // iframeContainer のスクロールはオーバーレイ位置に影響しない（page frame 内の相対位置）。
  const highlights = useMemo<SectionHighlight[]>(() => {
    return Array.from(sections.values()).map((section) => ({
      id: section.id,
      label: getSectionLabel(section.id),
      top: section.top,
      left: section.left,
      width: section.width,
      height: section.height,
    }));
  }, [sections]);

  // 選択されたセクションが消えた場合はリセット
  useEffect(() => {
    if (selectedSectionId && !sections.has(selectedSectionId)) {
      setSelectedSectionId(null);
    }
  }, [sections, selectedSectionId]);

  const handleSectionClick = useCallback((e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    setSelectedSectionId((prev) => (prev === sectionId ? null : sectionId));
  }, []);

  const handleSectionHover = useCallback((sectionId: string | null) => {
    setHoveredSectionId(sectionId);
  }, []);

  if (!iframeContainer) return null;

  return (
    <>
      {/* セクションハイライト */}
      {highlights.map((highlight) => {
        const isSelected = selectedSectionId === highlight.id;
        const isHovered = hoveredSectionId === highlight.id;
        const showControls = isHovered || isSelected;

        return (
          <div
            key={highlight.id}
            className={clsx(
              "absolute pointer-events-auto transition-all duration-200 rounded-md",
              isSelected
                ? "border-2 border-accent/80 bg-accent/[0.04] shadow-[0_0_0_1px_rgba(124,92,252,0.15)]"
                : isHovered
                  ? "border-2 border-accent/50 bg-accent/[0.02]"
                  : "border border-transparent hover:border-accent/25",
            )}
            style={{
              top: `${highlight.top}px`,
              left: `${highlight.left}px`,
              width: `${highlight.width}px`,
              height: `${highlight.height}px`,
            }}
            onClick={(e) => handleSectionClick(e, highlight.id)}
            onMouseEnter={() => handleSectionHover(highlight.id)}
            onMouseLeave={() => handleSectionHover(null)}
          >
            {/* ── セクションラベル（ホバー / 選択時に表示） ── */}
            <div
              className={clsx(
                "absolute -top-8 left-2 flex items-center gap-1.5 pointer-events-none z-10 transition-all duration-150",
                showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
              )}
            >
              {/* ラベルバッジ */}
              <div className="flex items-center gap-1 bg-accent text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap">
                {highlight.label}
              </div>
            </div>

            {/* ── ホバー時のクイックアクションボタン（右上） ── */}
            <div
              className={clsx(
                "absolute -top-8 right-2 flex items-center gap-1 pointer-events-auto z-10 transition-all duration-150",
                showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none",
              )}
            >
              {/* AIで自動改善ボタン */}
              {onEnhanceSection && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEnhanceSection(highlight.id);
                  }}
                  className={clsx(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold",
                    "bg-gradient-to-r from-accent to-[#5b8def] text-white",
                    "shadow-lg",
                    "hover:opacity-90",
                    "transition-all duration-150",
                  )}
                  title={`「${highlight.label}」をAicataで改善`}
                >
                  <Sparkles className="w-3 h-3" />
                  Aicataで改善
                </button>
              )}

              {/* チャットで編集ボタン */}
              {onChatEditSection && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChatEditSection(highlight.id);
                  }}
                  className={clsx(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold",
                    "bg-white/95 text-accent border border-accent/20",
                    "shadow-lg backdrop-blur-sm",
                    "hover:bg-accent hover:text-white hover:border-accent",
                    "transition-all duration-150",
                  )}
                  title={`「${highlight.label}」をチャットで編集`}
                >
                  <MessageSquare className="w-3 h-3" />
                  チャットで編集
                </button>
              )}

              {/* 直接編集ボタン */}
              {onEditSection && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSection(highlight.id);
                  }}
                  className={clsx(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold",
                    "bg-white/95 text-foreground border border-border/40",
                    "shadow-lg backdrop-blur-sm",
                    "hover:bg-black/5",
                    "transition-all duration-150",
                  )}
                  title={`「${highlight.label}」を直接編集`}
                >
                  <Pencil className="w-3 h-3" />
                  直接編集
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* セクションツールバー（選択時に表示） */}
      {selectedSectionId && iframeContainer && (
        <SectionToolbar
          sectionId={selectedSectionId}
          sectionLabel={getSectionLabel(selectedSectionId)}
          bounds={sections.get(selectedSectionId) || null}
          iframeContainer={iframeContainer}
          onEdit={() => {
            onEditSection?.(selectedSectionId);
          }}
          onChatEdit={() => {
            onChatEditSection?.(selectedSectionId);
            setSelectedSectionId(null);
          }}
          onMoveUp={() => {
            onMoveUp?.(selectedSectionId);
          }}
          onMoveDown={() => {
            onMoveDown?.(selectedSectionId);
          }}
          onDelete={() => {
            onDeleteSection?.(selectedSectionId);
            setSelectedSectionId(null);
          }}
          onSwap={() => {
            onSwapSection?.(selectedSectionId);
          }}
          onClose={() => setSelectedSectionId(null)}
        />
      )}
    </>
  );
}
