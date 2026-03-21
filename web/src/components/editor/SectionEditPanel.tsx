"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Type,
  Image as ImageIcon,
  Check,
  Undo2,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import {
  getSectionById,
  updateSectionText,
  updateSectionImage,
  type SectionInfo,
  type SectionTextNode,
  type SectionImageNode,
} from "@/lib/html-section-editor";

// ============================================================
// Types
// ============================================================

interface SectionEditPanelProps {
  sectionId: string;
  html: string;
  onHtmlChange: (newHtml: string) => void;
  onClose: () => void;
  onAiRewrite?: (sectionId: string, instruction: string) => void;
}

// ============================================================
// Role Labels
// ============================================================

const ROLE_LABELS: Record<string, string> = {
  heading: "見出し",
  subheading: "小見出し",
  body: "本文",
  cta: "CTA",
  label: "ラベル",
};

const ROLE_ICONS: Record<string, string> = {
  heading: "H1",
  subheading: "H3",
  body: "P",
  cta: "→",
  label: "•",
};

// ============================================================
// Sub-components
// ============================================================

function TextEditor({
  node,
  sectionId,
  html,
  onHtmlChange,
}: {
  node: SectionTextNode;
  sectionId: string;
  html: string;
  onHtmlChange: (html: string) => void;
}) {
  const [value, setValue] = useState(node.text);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setValue(node.text);
    setIsDirty(false);
  }, [node.text]);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    setIsDirty(true);
  }, []);

  const handleApply = useCallback(() => {
    const newHtml = updateSectionText(html, sectionId, node.selector, value);
    onHtmlChange(newHtml);
    setIsDirty(false);
  }, [html, sectionId, node.selector, value, onHtmlChange]);

  const handleReset = useCallback(() => {
    setValue(node.text);
    setIsDirty(false);
  }, [node.text]);

  const isMultiline = node.role === "body" || node.text.length > 60;

  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-5 h-5 rounded bg-accent/10 text-accent text-[10px] font-bold flex items-center justify-center">
          {ROLE_ICONS[node.role] || "T"}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
          {ROLE_LABELS[node.role] || node.role}
        </span>
        <span className="text-[10px] text-muted-foreground/50 font-mono">
          &lt;{node.tag}&gt;
        </span>
      </div>

      {isMultiline ? (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => isDirty && handleApply()}
          rows={3}
          className={clsx(
            "w-full px-3 py-2 rounded-lg border text-[13px] leading-relaxed",
            "bg-white/80 text-foreground resize-none outline-none",
            "transition-all duration-200",
            isDirty
              ? "border-accent/40 ring-2 ring-accent/10"
              : "border-border focus:border-accent/30 focus:ring-1 focus:ring-accent/10",
          )}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => isDirty && handleApply()}
          onKeyDown={(e) => e.key === "Enter" && isDirty && handleApply()}
          className={clsx(
            "w-full px-3 py-2 rounded-lg border text-[13px]",
            "bg-white/80 text-foreground outline-none",
            "transition-all duration-200",
            isDirty
              ? "border-accent/40 ring-2 ring-accent/10"
              : "border-border focus:border-accent/30 focus:ring-1 focus:ring-accent/10",
          )}
        />
      )}

      {/* Apply/Reset buttons */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 mt-1.5"
          >
            <button
              onClick={handleApply}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              <Check className="w-3 h-3" />
              適用
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:bg-black/5 transition-colors"
            >
              <Undo2 className="w-3 h-3" />
              戻す
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImageEditor({
  node,
  sectionId,
  html,
  onHtmlChange,
}: {
  node: SectionImageNode;
  sectionId: string;
  html: string;
  onHtmlChange: (html: string) => void;
}) {
  const [src, setSrc] = useState(node.src);
  const [alt, setAlt] = useState(node.alt);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setSrc(node.src);
    setAlt(node.alt);
    setIsDirty(false);
  }, [node.src, node.alt]);

  const handleApply = useCallback(() => {
    const newHtml = updateSectionImage(html, sectionId, node.selector, src, alt);
    onHtmlChange(newHtml);
    setIsDirty(false);
  }, [html, sectionId, node.selector, src, alt, onHtmlChange]);

  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold flex items-center justify-center">
          <ImageIcon className="w-3 h-3" />
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
          画像
        </span>
      </div>

      {/* Preview */}
      <div className="mb-2 rounded-lg overflow-hidden border border-border/40 bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="w-full h-20 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/400x200/e2e8f0/94a3b8?text=Image";
          }}
        />
      </div>

      <input
        type="text"
        value={src}
        onChange={(e) => { setSrc(e.target.value); setIsDirty(true); }}
        placeholder="画像URL"
        className="w-full px-3 py-1.5 rounded-lg border border-border text-[12px] bg-white/80 text-foreground outline-none focus:border-accent/30 mb-1.5"
      />

      <input
        type="text"
        value={alt}
        onChange={(e) => { setAlt(e.target.value); setIsDirty(true); }}
        placeholder="代替テキスト（alt）"
        className="w-full px-3 py-1.5 rounded-lg border border-border text-[12px] bg-white/80 text-foreground outline-none focus:border-accent/30"
      />

      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 mt-1.5"
          >
            <button
              onClick={handleApply}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              <Check className="w-3 h-3" />
              適用
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function SectionEditPanel({
  sectionId,
  html,
  onHtmlChange,
  onClose,
  onAiRewrite,
}: SectionEditPanelProps) {
  const [activeTab, setActiveTab] = useState<"text" | "images">("text");
  const [aiInstruction, setAiInstruction] = useState("");
  const [showAiInput, setShowAiInput] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    heading: true,
    subheading: true,
    body: true,
    cta: true,
    label: false,
  });

  const sectionInfo = useMemo(
    () => getSectionById(html, sectionId),
    [html, sectionId],
  );

  const toggleGroup = useCallback((role: string) => {
    setExpandedGroups((prev) => ({ ...prev, [role]: !prev[role] }));
  }, []);

  if (!sectionInfo) {
    return (
      <div className="p-4 text-center text-[13px] text-muted-foreground">
        セクションが見つかりません
      </div>
    );
  }

  // テキストをロール別にグループ化
  const textsByRole = sectionInfo.texts.reduce(
    (acc, node) => {
      if (!acc[node.role]) acc[node.role] = [];
      acc[node.role].push(node);
      return acc;
    },
    {} as Record<string, SectionTextNode[]>,
  );

  const roleOrder = ["heading", "subheading", "body", "cta", "label"];

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      className="flex flex-col h-full bg-white/95 backdrop-blur-xl border-l border-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
            <Type className="w-3.5 h-3.5 text-accent" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">
              セクション編集
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono">
              {sectionId}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab("text")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium transition-colors",
            activeTab === "text"
              ? "text-accent border-b-2 border-accent"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Type className="w-3.5 h-3.5" />
          テキスト ({sectionInfo.texts.length})
        </button>
        <button
          onClick={() => setActiveTab("images")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium transition-colors",
            activeTab === "images"
              ? "text-accent border-b-2 border-accent"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          画像 ({sectionInfo.images.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {activeTab === "text" ? (
          sectionInfo.texts.length === 0 ? (
            <div className="text-center text-[12px] text-muted-foreground py-8">
              編集可能なテキストはありません
            </div>
          ) : (
            roleOrder.map((role) => {
              const nodes = textsByRole[role];
              if (!nodes || nodes.length === 0) return null;
              const isExpanded = expandedGroups[role] !== false;

              return (
                <div key={role}>
                  <button
                    onClick={() => toggleGroup(role)}
                    className="flex items-center gap-1 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    {ROLE_LABELS[role]} ({nodes.length})
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        {nodes.map((node, idx) => (
                          <TextEditor
                            key={`${node.selector}-${idx}`}
                            node={node}
                            sectionId={sectionId}
                            html={html}
                            onHtmlChange={onHtmlChange}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )
        ) : sectionInfo.images.length === 0 ? (
          <div className="text-center text-[12px] text-muted-foreground py-8">
            編集可能な画像はありません
          </div>
        ) : (
          <div className="space-y-4">
            {sectionInfo.images.map((node, idx) => (
              <ImageEditor
                key={`${node.selector}-${idx}`}
                node={node}
                sectionId={sectionId}
                html={html}
                onHtmlChange={onHtmlChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Rewrite */}
      {onAiRewrite && (
        <div className="border-t border-border/50 px-4 py-3">
          {showAiInput ? (
            <div className="space-y-2">
              <textarea
                value={aiInstruction}
                onChange={(e) => setAiInstruction(e.target.value)}
                placeholder="例: もっとインパクトのある見出しに書き換えて"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border text-[12px] bg-white resize-none outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10"
                autoFocus
              />
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    if (aiInstruction.trim()) {
                      onAiRewrite(sectionId, aiInstruction.trim());
                      setAiInstruction("");
                      setShowAiInput(false);
                    }
                  }}
                  disabled={!aiInstruction.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  AIで書き換え
                </button>
                <button
                  onClick={() => setShowAiInput(false)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-black/5 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAiInput(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium text-accent bg-accent/5 hover:bg-accent/10 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AIでセクションを書き換える
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
