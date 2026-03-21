"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  Square,
  X,
} from "lucide-react";
import clsx from "clsx";

interface EditorAIPanelProps {
  onSendMessage: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  selectedSectionId?: string | null;
  selectedSectionLabel?: string;
  prefillMessage?: string | null;
  onPrefillConsumed?: () => void;
}

export default function EditorAIPanel({
  onSendMessage,
  onStop,
  isStreaming = false,
  selectedSectionId,
  selectedSectionLabel,
  prefillMessage,
  onPrefillConsumed,
}: EditorAIPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand and prefill when a section edit request comes in
  useEffect(() => {
    if (prefillMessage) {
      setMessage(prefillMessage);
      setExpanded(true);
      onPrefillConsumed?.();
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [prefillMessage, onPrefillConsumed]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = useCallback(() => {
    if (!message.trim() || isStreaming) return;
    onSendMessage(message.trim());
    setMessage("");
  }, [message, isStreaming, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
      // Escape to collapse
      if (e.key === "Escape") {
        setExpanded(false);
      }
    },
    [handleSend]
  );

  // Quick action suggestions
  const quickActions = selectedSectionId
    ? [
        `「${selectedSectionLabel || selectedSectionId}」のテキストをもっと魅力的に`,
        `「${selectedSectionLabel || selectedSectionId}」の配色を変更して`,
        `「${selectedSectionLabel || selectedSectionId}」のレイアウトを改善して`,
      ]
    : [
        "全体の配色をもっと洗練させて",
        "ヒーローセクションをより印象的に",
        "モバイル表示を最適化して",
        "CTAボタンを目立たせて",
      ];

  return (
    <div
      className={clsx(
        "border-t border-white/[0.08] transition-all duration-300 ease-out",
        expanded ? "bg-[#1a1a2e]/95 backdrop-blur-xl" : "bg-[#14142a]/80"
      )}
    >
      {/* Expand/Collapse handle + input bar */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* AI icon + toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 shrink-0 group"
        >
          <div
            className={clsx(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
              expanded
                ? "bg-accent/20 text-accent"
                : "bg-white/[0.06] text-white/40 group-hover:text-accent group-hover:bg-accent/10"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-medium text-white/40 group-hover:text-white/60 transition-colors hidden sm:block">
            AI アシスタント
          </span>
          {expanded ? (
            <ChevronDown className="w-3 h-3 text-white/30" />
          ) : (
            <ChevronUp className="w-3 h-3 text-white/30" />
          )}
        </button>

        {/* Inline input */}
        <div className="flex-1 flex items-center gap-2">
          <div
            className={clsx(
              "flex-1 flex items-center rounded-xl border transition-all",
              expanded
                ? "bg-white/[0.08] border-white/[0.12]"
                : "bg-white/[0.04] border-white/[0.06] hover:border-white/[0.12]"
            )}
          >
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => !expanded && setExpanded(true)}
              placeholder={
                selectedSectionId
                  ? `「${selectedSectionLabel}」について指示を入力...`
                  : "デザインの変更を指示..."
              }
              rows={1}
              className="flex-1 bg-transparent text-[13px] text-white/90 placeholder:text-white/25 resize-none outline-none min-h-[28px] max-h-[120px] py-1.5 px-3 leading-relaxed"
            />

            {/* Send / Stop button */}
            {isStreaming && onStop ? (
              <button
                onClick={onStop}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mr-1 bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                title="停止"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!message.trim() || isStreaming}
                className={clsx(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mr-1 transition-all",
                  message.trim() && !isStreaming
                    ? "bg-accent text-white hover:bg-accent/80"
                    : "bg-white/[0.04] text-white/20"
                )}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded content: Quick actions */}
      {expanded && (
        <div className="px-4 pb-3 pt-0">
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  setMessage(action);
                  textareaRef.current?.focus();
                }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/40 bg-white/[0.04] border border-white/[0.06] hover:text-white/70 hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Streaming indicator */}
          {isStreaming && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
              <span className="text-[11px] text-white/40">
                デザインを更新中...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
