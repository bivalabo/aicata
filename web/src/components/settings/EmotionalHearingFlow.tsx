"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Heart,
  Send,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import clsx from "clsx";
import type { EmotionalDNA, HearingTurn } from "@/lib/emotional-dna/types";

// ============================================================
// Emotional Hearing Flow — 感情ヒアリング対話UI
// Brand Memoryの中に組み込まれる対話型コンポーネント
// ============================================================

interface EmotionalHearingFlowProps {
  onComplete?: (dna: EmotionalDNA) => void;
}

export default function EmotionalHearingFlow({
  onComplete,
}: EmotionalHearingFlowProps) {
  const [status, setStatus] = useState<"none" | "in_progress" | "completed">(
    "none",
  );
  const [turns, setTurns] = useState<HearingTurn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [empathyComment, setEmpathyComment] = useState<string>("");
  const [emotionalDna, setEmotionalDna] = useState<EmotionalDNA | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps] = useState(6);
  const [showDnaDetail, setShowDnaDetail] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 初回ロード
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/brand-memory/hearing");
        const data = await res.json();
        setStatus(data.status);
        setTurns(data.turns || []);
        setEmotionalDna(data.emotionalDna || null);
        if (data.status === "none") {
          setCurrentQuestion(data.initialQuestion);
        }
        setCurrentStep(data.turns?.length || 0);
      } catch {
        // Silently fail — hearing is optional
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  // スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, empathyComment, currentQuestion]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || loading) return;

    const answer = inputValue.trim();
    setInputValue("");
    setLoading(true);
    setEmpathyComment("");

    try {
      const res = await fetch("/api/brand-memory/hearing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();

      if (data.error) {
        setEmpathyComment("すみません、うまく処理できませんでした。もう一度お試しください。");
        setLoading(false);
        return;
      }

      // ターンを追加
      setTurns((prev) => [
        ...prev,
        { question: currentQuestion, answer },
      ]);

      setEmpathyComment(data.empathyComment);
      setCurrentStep(data.currentStep);

      if (data.isComplete && data.emotionalDna) {
        setStatus("completed");
        setEmotionalDna(data.emotionalDna);
        setCurrentQuestion("");
        onComplete?.(data.emotionalDna);
      } else {
        setCurrentQuestion(data.nextQuestion || "");
        setStatus("in_progress");
      }
    } catch {
      setEmpathyComment("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputValue, loading, currentQuestion, onComplete]);

  const handleReset = useCallback(async () => {
    if (!confirm("ヒアリングをリセットして最初からやり直しますか？")) return;

    try {
      await fetch("/api/brand-memory/hearing", { method: "DELETE" });
      const res = await fetch("/api/brand-memory/hearing");
      const data = await res.json();
      setStatus("none");
      setTurns([]);
      setEmotionalDna(null);
      setEmpathyComment("");
      setCurrentQuestion(data.initialQuestion);
      setCurrentStep(0);
    } catch {
      // Silent
    }
  }, []);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
            <Heart className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-foreground">
              感情の地層
            </h3>
            <p className="text-[12px] text-muted-foreground">
              {status === "completed"
                ? "ヒアリング完了 — あなたのブランドの魂を記憶しました"
                : status === "in_progress"
                  ? `ヒアリング中（${currentStep}/${totalSteps}）`
                  : "対話を通じてブランドの本質を掬い上げます"}
            </p>
          </div>
        </div>
        {status !== "none" && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            やり直す
          </button>
        )}
      </div>

      {/* Completed State — EmotionalDNA Summary */}
      {status === "completed" && emotionalDna && (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-5 border border-rose-200/30">
            {/* Essence */}
            <div className="text-center mb-4">
              <p className="text-[11px] text-rose-400 font-medium tracking-wider uppercase mb-1">
                Brand Essence
              </p>
              <p className="text-[18px] font-bold text-rose-800">
                「{emotionalDna.essencePhrase}」
              </p>
            </div>

            {/* Key emotions */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-[10px] text-rose-400 font-medium mb-1">
                  核となる感情
                </p>
                <p className="text-[13px] text-foreground leading-relaxed">
                  {emotionalDna.coreEmotion}
                </p>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-[10px] text-rose-400 font-medium mb-1">
                  最初の3秒
                </p>
                <p className="text-[13px] text-foreground leading-relaxed">
                  {emotionalDna.firstImpression}
                </p>
              </div>
            </div>

            {/* Atmosphere */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {emotionalDna.atmosphere.map((a) => (
                <span
                  key={a}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-rose-100 text-rose-700"
                >
                  {a}
                </span>
              ))}
              {emotionalDna.antiAtmosphere.map((a) => (
                <span
                  key={a}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 line-through"
                >
                  {a}
                </span>
              ))}
            </div>

            {/* Derived design direction */}
            <div className="flex items-center gap-3 text-[12px] text-rose-600">
              <span>トーン: {emotionalDna.derivedTones.join("・")}</span>
              <span>·</span>
              <span>色: {emotionalDna.derivedColorMood}</span>
              <span>·</span>
              <span>文字: {emotionalDna.derivedTypographyFeel}</span>
            </div>

            {/* Expand/Collapse */}
            <button
              onClick={() => setShowDnaDetail(!showDnaDetail)}
              className="mt-3 flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-600 transition-colors"
            >
              {showDnaDetail ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              {showDnaDetail ? "閉じる" : "詳細を見る"}
            </button>

            {showDnaDetail && (
              <div className="mt-3 pt-3 border-t border-rose-200/30 space-y-2 text-[12px] text-foreground">
                <div>
                  <span className="font-medium text-rose-500">原点: </span>
                  {emotionalDna.originStory}
                </div>
                <div>
                  <span className="font-medium text-rose-500">
                    お客さんの表情:{" "}
                  </span>
                  {emotionalDna.customerFace}
                </div>
                <div>
                  <span className="font-medium text-rose-500">
                    残ってほしい感覚:{" "}
                  </span>
                  {emotionalDna.afterFeeling}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Hearing — Chat UI */}
      {status !== "completed" && (
        <div className="bg-gray-50 rounded-xl border border-border/50 overflow-hidden">
          {/* Progress */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center gap-2 mb-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "h-1 flex-1 rounded-full transition-colors",
                    i < currentStep
                      ? "bg-rose-400"
                      : i === currentStep
                        ? "bg-rose-200"
                        : "bg-gray-200",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="max-h-[400px] overflow-y-auto px-4 pb-3 space-y-3">
            {/* Past turns */}
            {turns.map((turn, i) => (
              <div key={i} className="space-y-2">
                {/* AI question */}
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Heart className="w-3 h-3 text-rose-500" />
                  </div>
                  <p className="text-[13px] text-foreground leading-relaxed bg-white rounded-xl rounded-tl-sm px-3 py-2 border border-border/30">
                    {turn.question}
                  </p>
                </div>
                {/* User answer */}
                <div className="flex justify-end">
                  <p className="text-[13px] text-white leading-relaxed bg-accent rounded-xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                    {turn.answer}
                  </p>
                </div>
              </div>
            ))}

            {/* Current empathy + question */}
            {empathyComment && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Heart className="w-3 h-3 text-rose-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] text-muted-foreground italic leading-relaxed">
                    {empathyComment}
                  </p>
                  {currentQuestion && (
                    <p className="text-[13px] text-foreground leading-relaxed bg-white rounded-xl rounded-tl-sm px-3 py-2 border border-border/30">
                      {currentQuestion}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Initial question (when no turns yet) */}
            {turns.length === 0 && !empathyComment && currentQuestion && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Heart className="w-3 h-3 text-rose-500" />
                </div>
                <p className="text-[13px] text-foreground leading-relaxed bg-white rounded-xl rounded-tl-sm px-3 py-2 border border-border/30">
                  {currentQuestion}
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <Loader2 className="w-3 h-3 text-rose-500 animate-spin" />
                </div>
                <p className="text-[12px] text-muted-foreground italic">
                  考えています...
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="あなたの想いを聞かせてください..."
                rows={2}
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-white text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-rose-300/50 focus:border-rose-300 resize-none"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || loading}
                className="self-end px-3 py-2 rounded-xl text-white bg-gradient-to-r from-rose-400 to-pink-500 hover:shadow-lg hover:shadow-rose-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
