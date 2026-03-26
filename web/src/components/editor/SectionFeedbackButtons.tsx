"use client";

import { useState, useCallback } from "react";
import { ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface SectionFeedbackButtonsProps {
  sectionId: string;
  precedingSectionId?: string;
  followingSectionId?: string;
  onFeedbackSubmitted?: (score: number) => void;
}

/**
 * セクション評価ボタン
 * - 👍 Like / 👎 Dislike / 🔄 Regenerate
 * - クリック時に HQS スコアを更新
 * - 新しいスコアをアニメーション表示
 * - ツールバーに組み込み可能なコンパクト設計
 */
export default function SectionFeedbackButtons({
  sectionId,
  precedingSectionId,
  followingSectionId,
  onFeedbackSubmitted,
}: SectionFeedbackButtonsProps) {
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [feedbackState, setFeedbackState] = useState<"idle" | "pending">("idle");

  const handleFeedback = useCallback(
    async (action: "like" | "dislike" | "regenerate") => {
      setFeedbackState("pending");

      try {
        const res = await fetch("/api/section-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId,
            action,
            context: { precedingSectionId, followingSectionId },
          }),
        });
        const result = await res.json();

        if (result.updated) {
          setLastScore(result.newComposite);
          setShowScore(true);

          // 2.5秒後にスコア表示を非表示
          const timer = setTimeout(() => {
            setShowScore(false);
          }, 2500);

          onFeedbackSubmitted?.(result.newComposite);

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error("Failed to update feedback:", error);
      } finally {
        setFeedbackState("idle");
      }
    },
    [sectionId, precedingSectionId, followingSectionId, onFeedbackSubmitted]
  );

  return (
    <div className="relative flex items-center gap-1">
      {/* Like ボタン */}
      <button
        onClick={() => handleFeedback("like")}
        disabled={feedbackState === "pending"}
        className={clsx(
          "flex items-center justify-center w-7 h-7 rounded-lg transition-all",
          feedbackState === "pending"
            ? "opacity-50 cursor-not-allowed"
            : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10",
        )}
        title="良い（Like）"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>

      {/* Dislike ボタン */}
      <button
        onClick={() => handleFeedback("dislike")}
        disabled={feedbackState === "pending"}
        className={clsx(
          "flex items-center justify-center w-7 h-7 rounded-lg transition-all",
          feedbackState === "pending"
            ? "opacity-50 cursor-not-allowed"
            : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10",
        )}
        title="悪い（Dislike）"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>

      {/* Regenerate ボタン */}
      <button
        onClick={() => handleFeedback("regenerate")}
        disabled={feedbackState === "pending"}
        className={clsx(
          "flex items-center justify-center w-7 h-7 rounded-lg transition-all",
          feedbackState === "pending"
            ? "opacity-50 cursor-not-allowed"
            : "text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10",
        )}
        title="再生成（Regenerate）"
      >
        <RefreshCw className={clsx("w-3.5 h-3.5", feedbackState === "pending" && "animate-spin")} />
      </button>

      {/* スコア表示バッジ */}
      <AnimatePresence>
        {showScore && lastScore !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-full ml-2 whitespace-nowrap px-2.5 py-1 rounded-lg bg-accent/20 text-accent text-xs font-semibold border border-accent/30"
          >
            HQS: {lastScore.toFixed(2)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
