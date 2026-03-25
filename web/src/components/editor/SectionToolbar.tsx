"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Pencil,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Trash2,
  X,
  ArrowLeftRight,
} from "lucide-react";
import clsx from "clsx";
import { SectionBounds } from "./useIframeSections";
import SectionFeedbackButtons from "./SectionFeedbackButtons";

interface SectionToolbarProps {
  sectionId: string;
  sectionLabel: string;
  bounds: SectionBounds | null;
  iframeContainer: HTMLElement;
  onEdit: () => void;
  onChatEdit?: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onSwap?: () => void;
  onClose: () => void;
}

/**
 * 選択されたセクション上に表示されるガラスモーフィズムツールバー
 * 日本語ラベル表示 + チャット編集ボタン付き
 */
export default function SectionToolbar({
  sectionId,
  sectionLabel,
  bounds,
  iframeContainer,
  onEdit,
  onChatEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
  onSwap,
  onClose,
}: SectionToolbarProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef(iframeContainer);
  containerRef.current = iframeContainer;

  // ツールバーの位置を計算 — bounds だけを dependency にしてフリーズ防止
  useEffect(() => {
    if (!bounds) return;
    const container = containerRef.current;
    if (!container) return;

    const containerScrollTop = container.scrollTop || 0;
    const containerScrollLeft = container.scrollLeft || 0;

    // セクションの上に配置
    const toolbarHeight = 44;
    const top = bounds.top + containerScrollTop - toolbarHeight - 8;
    const left = bounds.left + containerScrollLeft;

    setPosition({ top, left });
  }, [bounds]);

  return (
    <motion.div
      className="absolute pointer-events-auto z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl shadow-black/10">
        {/* セクションラベル */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-border/40 mr-0.5">
          <span className="text-[11px] font-bold text-accent">
            {sectionLabel}
          </span>
        </div>

        {/* チャットで編集 */}
        {onChatEdit && (
          <button
            onClick={onChatEdit}
            className={clsx(
              "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all",
              "bg-accent/10 text-accent hover:bg-accent hover:text-white",
            )}
            title="チャットでAIに修正を依頼"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            AIで編集
          </button>
        )}

        {/* 直接編集 */}
        <button
          onClick={onEdit}
          className={clsx(
            "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-black/5",
          )}
          title="テキスト・画像を直接編集"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        {/* フィードバックボタン */}
        <div className="w-px h-4 bg-border/30" />
        <SectionFeedbackButtons
          sectionId={sectionId}
        />

        <div className="w-px h-4 bg-border/30" />

        {/* 移動ボタン */}
        <button
          onClick={onMoveUp}
          className={clsx(
            "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-black/5",
          )}
          title="上に移動"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onMoveDown}
          className={clsx(
            "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-black/5",
          )}
          title="下に移動"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-border/30" />

        {/* セクション置換 */}
        {onSwap && (
          <button
            onClick={onSwap}
            className={clsx(
              "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
              "text-muted-foreground hover:text-foreground hover:bg-black/5",
            )}
            title="セクションデザインを置換"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="w-px h-4 bg-border/30" />

        {/* 削除 */}
        <button
          onClick={onDelete}
          className={clsx(
            "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
            "text-muted-foreground hover:text-red-500 hover:bg-red-50",
          )}
          title="セクションを削除"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* 閉じる */}
        <button
          onClick={onClose}
          className={clsx(
            "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-black/5",
          )}
          title="閉じる"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
