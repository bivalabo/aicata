"use client";

import { MessagesSquare, Eye, Maximize2 } from "lucide-react";
import clsx from "clsx";

export type MobilePanel = "chat" | "preview" | "fullPreview";

interface MobilePanelSwitcherProps {
  activePanel: MobilePanel;
  onSwitch: (panel: MobilePanel) => void;
  hasPreview: boolean;
  /** プレビュー表示中に「全画面プレビュー」に切り替え可能 */
  showFullPreviewOption?: boolean;
}

/**
 * モバイル用パネル切り替えタブ
 * チャットとプレビューをタブで切り替える。
 * プレビュー時は「全画面」ボタンでコントロール非表示＋フルスクリーンプレビューも可。
 */
export default function MobilePanelSwitcher({
  activePanel,
  onSwitch,
  hasPreview,
  showFullPreviewOption = false,
}: MobilePanelSwitcherProps) {
  if (!hasPreview) return null;

  return (
    <div className="flex items-center justify-center py-1.5 px-3 bg-white/60 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-0.5">
        <button
          onClick={() => onSwitch("chat")}
          className={clsx(
            "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200",
            activePanel === "chat"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <MessagesSquare className="w-3.5 h-3.5" />
          チャット
        </button>
        <button
          onClick={() => onSwitch("preview")}
          className={clsx(
            "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200",
            activePanel === "preview"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          プレビュー
        </button>

        {showFullPreviewOption && (
          <button
            onClick={() =>
              onSwitch(activePanel === "fullPreview" ? "preview" : "fullPreview")
            }
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200",
              activePanel === "fullPreview"
                ? "bg-accent text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="コントロール非表示でフルプレビュー"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
