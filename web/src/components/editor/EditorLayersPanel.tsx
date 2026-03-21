"use client";

import { useCallback } from "react";
import {
  Layers,
  ChevronLeft,
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import clsx from "clsx";
import { SectionBounds } from "./useIframeSections";
import { getSectionLabel } from "@/lib/section-labels";

interface EditorLayersPanelProps {
  sections: Map<string, SectionBounds>;
  selectedSectionId: string | null;
  onSelectSection: (id: string | null) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onDelete?: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const SECTION_ICONS: Record<string, string> = {
  nav: "🧭",
  hero: "🎯",
  product: "🛍️",
  feature: "✨",
  story: "📖",
  testimonial: "💬",
  cta: "📢",
  footer: "📋",
  gallery: "🖼️",
  announcement: "📣",
  breadcrumb: "🔗",
  cart: "🛒",
  collection: "📁",
  contact: "✉️",
  search: "🔍",
  social: "📱",
  trust: "🛡️",
  related: "🔗",
};

function getSectionIcon(sectionId: string): string {
  for (const [key, icon] of Object.entries(SECTION_ICONS)) {
    if (sectionId.toLowerCase().includes(key)) return icon;
  }
  return "📦";
}

export default function EditorLayersPanel({
  sections,
  selectedSectionId,
  onSelectSection,
  onMoveUp,
  onMoveDown,
  onDelete,
  collapsed,
  onToggleCollapse,
}: EditorLayersPanelProps) {
  const sectionList = Array.from(sections.entries()).sort(
    ([, a], [, b]) => a.top - b.top
  );

  const handleSelect = useCallback(
    (id: string) => {
      onSelectSection(selectedSectionId === id ? null : id);
    },
    [selectedSectionId, onSelectSection]
  );

  if (collapsed) {
    return (
      <div className="w-12 shrink-0 flex flex-col items-center py-3 border-r border-white/[0.06]">
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
          title="レイヤーパネルを開く"
        >
          <Layers className="w-4 h-4" />
        </button>
        <div className="mt-4 flex flex-col gap-1">
          {sectionList.map(([id]) => (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className={clsx(
                "w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors",
                selectedSectionId === id
                  ? "bg-accent/20 text-accent"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
              )}
              title={getSectionLabel(id)}
            >
              {getSectionIcon(id)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-56 shrink-0 flex flex-col border-r border-white/[0.06] bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-white/50" />
          <span className="text-[12px] font-medium text-white/70">
            レイヤー
          </span>
          <span className="text-[10px] text-white/30">
            {sectionList.length}
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto py-1">
        {sectionList.map(([id], index) => {
          const isSelected = selectedSectionId === id;
          const label = getSectionLabel(id);
          const icon = getSectionIcon(id);

          return (
            <div
              key={id}
              className={clsx(
                "group flex items-center gap-2 px-2 py-1.5 mx-1 rounded-lg cursor-pointer transition-all duration-150",
                isSelected
                  ? "bg-accent/15 text-white"
                  : "text-white/60 hover:bg-white/[0.06] hover:text-white/80"
              )}
              onClick={() => handleSelect(id)}
            >
              {/* Drag handle */}
              <GripVertical className="w-3 h-3 text-white/20 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Icon */}
              <span className="text-xs shrink-0">{icon}</span>

              {/* Label */}
              <span className="text-[11px] font-medium truncate flex-1">
                {label}
              </span>

              {/* Actions on hover */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {onMoveUp && index > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp(id);
                    }}
                    className="p-0.5 rounded text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
                    title="上に移動"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                )}
                {onMoveDown && index < sectionList.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveDown(id);
                    }}
                    className="p-0.5 rounded text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
                    title="下に移動"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(id);
                    }}
                    className="p-0.5 rounded text-white/30 hover:text-red-400/70 hover:bg-red-500/10 transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {sectionList.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-[11px] text-white/30">
              セクションがありません
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
