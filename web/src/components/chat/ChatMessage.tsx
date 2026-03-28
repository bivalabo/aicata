"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  User,
  Copy,
  Check,
  ChevronRight,
  Code2,
  Palette,
  Puzzle,
  Pen,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Search,
  Wrench,
  Zap,
} from "lucide-react";
import { useState, memo, useMemo } from "react";
import { COPY_FEEDBACK_DURATION_MS } from "@/lib/constants";
import clsx from "clsx";
import type { Attachment } from "@/hooks/useChat";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  attachments?: Attachment[];
}

// ── Progress Step Detection ──
const PROGRESS_EMOJI_MAP: Record<string, { icon: typeof Palette; color: string; bgColor: string; label: string }> = {
  "🎨": { icon: Palette, color: "text-purple-500", bgColor: "bg-purple-50", label: "デザイン" },
  "🧩": { icon: Puzzle, color: "text-blue-500", bgColor: "bg-blue-50", label: "組み立て" },
  "✍️": { icon: Pen, color: "text-amber-500", bgColor: "bg-amber-50", label: "パーソナライズ" },
  "✅": { icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-50", label: "完了" },
  "🔨": { icon: Wrench, color: "text-orange-500", bgColor: "bg-orange-50", label: "生成" },
  "⚙️": { icon: Loader2, color: "text-slate-500", bgColor: "bg-slate-50", label: "処理" },
  "⚠️": { icon: AlertTriangle, color: "text-amber-500", bgColor: "bg-amber-50", label: "注意" },
  "🔍": { icon: Search, color: "text-indigo-500", bgColor: "bg-indigo-50", label: "検証" },
};

function isProgressLine(line: string): boolean {
  const trimmed = line.trim();
  return Object.keys(PROGRESS_EMOJI_MAP).some((emoji) => trimmed.startsWith(emoji));
}

function getProgressInfo(line: string) {
  const trimmed = line.trim();
  for (const [emoji, info] of Object.entries(PROGRESS_EMOJI_MAP)) {
    if (trimmed.startsWith(emoji)) {
      const text = trimmed.replace(emoji, "").trim();
      const isComplete = emoji === "✅";
      return { ...info, text, isComplete, emoji };
    }
  }
  return null;
}

/** 複数の連続するプログレスラインを検出 */
function isProgressBlock(lines: string[], startIndex: number): number {
  let count = 0;
  for (let i = startIndex; i < lines.length; i++) {
    if (isProgressLine(lines[i])) count++;
    else break;
  }
  return count;
}

function ProgressStep({ line, index }: { line: string; index: number }) {
  const info = getProgressInfo(line);
  if (!info) return null;

  const Icon = info.icon;
  const isComplete = info.isComplete;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      className={clsx(
        "flex items-center gap-2.5 py-2 px-3 rounded-xl text-[13px]",
        isComplete
          ? "bg-emerald-50/80 text-emerald-700 border border-emerald-100/60"
          : `${info.bgColor}/60 text-foreground/80 border border-transparent`,
      )}
    >
      <div
        className={clsx(
          "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
          isComplete ? "bg-emerald-100" : `${info.bgColor}`,
        )}
      >
        {isComplete ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <Icon className={clsx("w-3.5 h-3.5", info.color, !isComplete && "animate-pulse")} />
        )}
      </div>
      <span className={isComplete ? "font-medium" : "font-normal"}>{info.text}</span>
    </motion.div>
  );
}

/** プログレスブロックをカード風にラップ */
function ProgressBlock({ lines, startIndex }: { lines: string[]; startIndex: number }) {
  const progressLines: string[] = [];
  for (let i = startIndex; i < lines.length && isProgressLine(lines[i]); i++) {
    progressLines.push(lines[i]);
  }

  return (
    <div className="my-2 rounded-2xl border border-accent/[0.08] bg-gradient-to-br from-white/60 to-accent/[0.02] p-2.5 space-y-1.5">
      <div className="flex items-center gap-1.5 px-2 pb-1">
        <Zap className="w-3 h-3 text-accent/40" />
        <span className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">
          Build Progress
        </span>
      </div>
      {progressLines.map((line, i) => (
        <ProgressStep key={i} line={line} index={i} />
      ))}
    </div>
  );
}

// ============================================================
// Content Formatting
// ============================================================

function formatContent(content: string) {
  return formatTextContent(content, 0);
}

function formatTextContent(content: string, baseKey: number) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
      const lang = match?.[1] || "";
      const code = match?.[2]?.trim() || "";
      return <CodeBlock key={`${baseKey}-${i}`} language={lang} code={code} />;
    }

    const lines = part.split("\n");
    const elements: React.ReactNode[] = [];
    let j = 0;

    while (j < lines.length) {
      const line = lines[j];

      // プログレスブロック検出: 連続するプログレス行をまとめてカード化
      const progressCount = isProgressBlock(lines, j);
      if (progressCount >= 2) {
        elements.push(
          <ProgressBlock key={`${baseKey}-${i}-pb-${j}`} lines={lines} startIndex={j} />,
        );
        j += progressCount;
        continue;
      }

      // 単一プログレス行
      if (isProgressLine(line)) {
        elements.push(<ProgressStep key={`${baseKey}-${i}-${j}`} line={line} index={0} />);
        j++;
        continue;
      }

      if (line.startsWith("### ")) {
        elements.push(
          <h4
            key={`${baseKey}-${i}-${j}`}
            className="text-[14px] font-semibold text-foreground mt-3 mb-1 tracking-[-0.01em]"
          >
            {formatInline(line.replace("### ", ""))}
          </h4>,
        );
        j++;
        continue;
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h3
            key={`${baseKey}-${i}-${j}`}
            className="text-[15px] font-semibold text-foreground mt-4 mb-1 tracking-[-0.01em]"
          >
            {formatInline(line.replace("## ", ""))}
          </h3>,
        );
        j++;
        continue;
      }
      if (line.startsWith("- ")) {
        elements.push(
          <div key={`${baseKey}-${i}-${j}`} className="flex gap-2 text-[14px] leading-relaxed">
            <span className="text-accent/60 mt-0.5 shrink-0 text-[10px]">●</span>
            <span>{formatInline(line.replace("- ", ""))}</span>
          </div>,
        );
        j++;
        continue;
      }
      if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+)\./)?.[1];
        elements.push(
          <div key={`${baseKey}-${i}-${j}`} className="flex gap-2 text-[14px] leading-relaxed">
            <span className="text-accent/70 font-semibold min-w-[1.2em] shrink-0 tabular-nums">
              {num}.
            </span>
            <span>{formatInline(line.replace(/^\d+\.\s/, ""))}</span>
          </div>,
        );
        j++;
        continue;
      }
      if (line.trim() === "") {
        elements.push(<div key={`${baseKey}-${i}-${j}`} className="h-2" />);
        j++;
        continue;
      }
      elements.push(
        <p key={`${baseKey}-${i}-${j}`} className="text-[14px] leading-[1.7]">
          {formatInline(line)}
        </p>,
      );
      j++;
    }

    return (
      <div key={`${baseKey}-${i}`} className="space-y-1.5">
        {elements}
      </div>
    );
  });
}

function formatInline(text: string) {
  return text.split(/(\*\*.*?\*\*|`[^`]+`)/g).map((segment, k) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      return (
        <strong key={k} className="font-semibold text-foreground">
          {segment.replace(/\*\*/g, "")}
        </strong>
      );
    }
    if (segment.startsWith("`") && segment.endsWith("`")) {
      return (
        <code
          key={k}
          className="px-1.5 py-0.5 rounded-md bg-accent/[0.06] text-accent-hover text-[12px] font-mono"
        >
          {segment.replace(/`/g, "")}
        </code>
      );
    }
    return segment;
  });
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const lineCount = code.split("\n").length;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
  };

  return (
    <div className="my-3 rounded-xl border border-border overflow-hidden bg-[#fafbfd]">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-[#f3f5f8] hover:bg-[#eef0f5] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronRight className="w-3.5 h-3.5 text-muted" />
          </motion.div>
          <Code2 className="w-3.5 h-3.5 text-accent/50" />
          <span className="text-[11px] text-muted font-mono tracking-wide">
            {language || "code"}
          </span>
          <span className="text-[10px] text-muted-foreground/40 tabular-nums">
            {lineCount} 行
          </span>
        </div>
        <div
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-muted hover:text-foreground transition-colors"
          role="button"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-success" />
              <span className="text-success">コピー済み</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>コピー</span>
            </>
          )}
        </div>
      </button>

      {/* Code body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden border-t border-border"
          >
            <pre className="p-4 overflow-x-auto">
              <code className="text-[13px] leading-relaxed font-mono text-foreground/75">
                {code}
              </code>
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Main ChatMessage Component
// ============================================================

export default memo(function ChatMessage({
  role,
  content,
  isStreaming,
  attachments,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const handleCopyMessage = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
  };

  const formattedContent = useMemo(
    () => (content ? formatContent(content) : null),
    [content],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className={clsx(
        "group flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1",
          isUser
            ? "bg-[#f0f1f5] border border-border"
            : "bg-gradient-to-br from-[#7c5cfc] to-[#5b8def] shadow-sm shadow-accent/20",
        )}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-muted" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div className={clsx("relative", isUser ? "max-w-[78%]" : "max-w-[85%]")}>
        <div
          className={clsx(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] text-white rounded-tr-lg shadow-sm"
              : [
                  "rounded-tl-lg",
                  "bg-white/70 backdrop-blur-[16px]",
                  "border border-white/40",
                  "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.6)]",
                ],
          )}
        >
          {/* Attached images */}
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="rounded-xl overflow-hidden border border-white/20 shadow-sm max-w-[240px]"
                >
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-full h-auto max-h-[200px] object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* AI label for assistant messages */}
          {!isUser && content && (
            <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-border/30">
              <Sparkles className="w-3 h-3 text-accent/40" />
              <span className="text-[10px] text-muted-foreground/50 font-medium tracking-wider uppercase">
                Aicata
              </span>
            </div>
          )}

          {formattedContent}

          {/* Streaming cursor */}
          {isStreaming && content && (
            <span className="inline-block w-[2px] h-[16px] bg-accent/50 animate-pulse ml-0.5 align-text-bottom rounded-full" />
          )}
          {/* Waiting indicator */}
          {isStreaming && !content && (
            <div className="flex items-center gap-3 py-1.5">
              <div className="relative w-5 h-5 shrink-0">
                <div
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent border-r-accent/40 animate-spin"
                  style={{ animationDuration: "0.8s" }}
                />
              </div>
              <span className="text-[13px] text-muted">
                デザインを準備しています...
              </span>
            </div>
          )}
        </div>

        {/* Copy button on hover */}
        {!isUser && content && !isStreaming && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6 left-0">
            <button
              onClick={handleCopyMessage}
              className="flex items-center gap-1 text-[10px] text-muted hover:text-foreground transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-success" />
                  <span className="text-success">コピー済み</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>コピー</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
});
