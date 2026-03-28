"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Rocket,
  Loader2,
  Crown,
  Leaf,
  Minimize2,
  Palette,
  Zap,
  Fan,
  Lightbulb,
} from "lucide-react";
import clsx from "clsx";

// ============================================================
// Types
// ============================================================

/** オンボーディングで選択されたパラメータ */
export interface OnboardingSelections {
  industry: string;
  tone: string;
  audience: string | null;
  freeText: string;
}

/** Brand Memoryから事前に取得されたブランド情報 */
export interface BrandMemoryHint {
  brandName: string;
  industry: string;
  tones: string[];
  targetAudience: string;
}

interface OnboardingFlowProps {
  templateType: string;
  onComplete: (compiledPrompt: string, pageType: string, selections: OnboardingSelections) => void;
  onCancel: () => void;
  brandMemory?: BrandMemoryHint | null;
}

// ============================================================
// Inspiration Cards — デザインスタイルのヒントカード
// ============================================================

interface InspirationCard {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  /** このカードを選んだときにテキストに挿入するヒント文 */
  hint: string;
}

const INSPIRATION_CARDS: InspirationCard[] = [
  {
    id: "luxury",
    label: "高級感・エレガント",
    description: "洗練されたタイポグラフィ、余白のあるレイアウト",
    icon: Crown,
    gradient: "from-amber-50 to-yellow-50",
    borderColor: "border-amber-200/60 hover:border-amber-300",
    hint: "高級感のある洗練されたデザインで、エレガントなタイポグラフィと上品な余白を活かしたレイアウトにしてください。",
  },
  {
    id: "natural",
    label: "ナチュラル・オーガニック",
    description: "アースカラー、温かみのある自然な雰囲気",
    icon: Leaf,
    gradient: "from-green-50 to-emerald-50",
    borderColor: "border-green-200/60 hover:border-green-300",
    hint: "ナチュラルで温かみのあるデザインにしてください。アースカラーを基調に、オーガニックで心地よい雰囲気を演出してください。",
  },
  {
    id: "minimal",
    label: "モダン・ミニマル",
    description: "シンプルで機能的、無駄のないデザイン",
    icon: Minimize2,
    gradient: "from-slate-50 to-gray-50",
    borderColor: "border-slate-200/60 hover:border-slate-300",
    hint: "モダンでミニマルなデザインにしてください。シンプルで機能的、無駄のない洗練されたレイアウトでお願いします。",
  },
  {
    id: "playful",
    label: "ポップ・カラフル",
    description: "鮮やかな配色、遊び心のあるUI",
    icon: Palette,
    gradient: "from-pink-50 to-violet-50",
    borderColor: "border-pink-200/60 hover:border-pink-300",
    hint: "ポップでカラフルなデザインにしてください。鮮やかな配色と遊び心のあるUIで、楽しい印象のサイトにしてください。",
  },
  {
    id: "traditional",
    label: "和風・伝統的",
    description: "日本の美意識、落ち着いた品格",
    icon: Fan,
    gradient: "from-red-50 to-orange-50",
    borderColor: "border-red-200/60 hover:border-red-300",
    hint: "和風で伝統的なデザインにしてください。日本の美意識を活かした落ち着きのある品格のあるサイトにしてください。",
  },
  {
    id: "cool",
    label: "クール・スタイリッシュ",
    description: "ダークトーン、先進的な印象",
    icon: Zap,
    gradient: "from-indigo-50 to-blue-50",
    borderColor: "border-indigo-200/60 hover:border-indigo-300",
    hint: "クールでスタイリッシュなデザインにしてください。先進的な印象の、洗練されたダークトーンのサイトにしてください。",
  },
];

// ============================================================
// Template Labels
// ============================================================

const TEMPLATE_LABELS: Record<string, string> = {
  landing: "ランディングページ",
  product: "商品詳細ページ",
  collection: "コレクションページ",
  cart: "カートページ",
  about: "ブランドページ",
  top: "トップページ",
};

// ============================================================
// Main Component
// ============================================================

export default function OnboardingFlow({
  templateType,
  onComplete,
  onCancel,
  brandMemory,
}: OnboardingFlowProps) {
  const isSiteBuildMode = templateType === "site-build";
  const pageLabel = TEMPLATE_LABELS[templateType] || "ページ";

  const hasBrandMemory = !!(
    brandMemory &&
    brandMemory.industry &&
    brandMemory.industry !== "general" &&
    brandMemory.tones.length > 0
  );

  const [text, setText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInspirations, setShowInspirations] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  // Brandメモリがある場合のプレースホルダーテキスト
  const brandContext = hasBrandMemory
    ? `${brandMemory!.brandName ? `「${brandMemory!.brandName}」` : "ブランド"}の情報を元に最適化します`
    : null;

  // テキストエリアの自動フォーカス
  const textareaRef = useCallback((node: HTMLTextAreaElement | null) => {
    if (node) {
      // 少し遅延を入れてフォーカス（アニメーション完了後）
      setTimeout(() => node.focus(), 400);
    }
  }, []);

  // インスピレーションカード選択時
  const handleInspirationSelect = useCallback((card: InspirationCard) => {
    setSelectedStyle((prev) => (prev === card.id ? null : card.id));
    setText((prev) => {
      // すでにヒント文が含まれていたら置換、なければ追加
      const otherHints = INSPIRATION_CARDS.map((c) => c.hint);
      let cleaned = prev;
      for (const hint of otherHints) {
        cleaned = cleaned.replace(hint, "").trim();
      }
      if (selectedStyle === card.id) {
        // deselect
        return cleaned;
      }
      return cleaned ? `${cleaned}\n\n${card.hint}` : card.hint;
    });
  }, [selectedStyle]);

  // 送信処理
  const handleSubmit = useCallback(() => {
    if (!text.trim() && !hasBrandMemory && !selectedStyle) return;

    setIsSubmitting(true);

    if (isSiteBuildMode) {
      // サイト全体構築モード
      let prompt = `Shopifyサイト全体を作成してください。\n\n`;

      if (hasBrandMemory) {
        prompt += `【Brand Memory連携】\n`;
        prompt += `ブランド: ${brandMemory!.brandName || "未設定"}\n`;
        prompt += `業種: ${brandMemory!.industry}\n`;
        prompt += `トーン: ${brandMemory!.tones.join("、")}\n`;
        if (brandMemory!.targetAudience) {
          prompt += `ターゲット: ${brandMemory!.targetAudience}\n`;
        }
        prompt += `\n`;
      }

      if (text.trim()) {
        prompt += text.trim() + "\n\n";
      }

      prompt += `まずトップページから作成をお願いします。`;

      onComplete(prompt, "site-build", {
        industry: brandMemory?.industry || "general",
        tone: selectedStyle || brandMemory?.tones[0] || "modern",
        audience: null,
        freeText: text,
      });
    } else {
      // 個別ページモード
      const normalizedPageType = templateType === "top" ? "landing" : templateType;

      let prompt = `${pageLabel}を作成してください。\n\n`;
      prompt += `【ページタイプ】${normalizedPageType}\n`;

      if (hasBrandMemory) {
        prompt += `【Brand Memory連携】\n`;
        prompt += `ブランド: ${brandMemory!.brandName || "未設定"}\n`;
        prompt += `業種: ${brandMemory!.industry}\n`;
        prompt += `トーン: ${brandMemory!.tones.join("、")}\n`;
        if (brandMemory!.targetAudience) {
          prompt += `ターゲット: ${brandMemory!.targetAudience}\n`;
        }
      }

      if (text.trim()) {
        prompt += `\n【ご要望】\n${text.trim()}`;
      }

      prompt += `\n\nこの情報をもとに、素敵な${pageLabel}を作成してください。`;

      onComplete(prompt, normalizedPageType, {
        industry: brandMemory?.industry || "general",
        tone: selectedStyle || brandMemory?.tones[0] || "modern",
        audience: null,
        freeText: text,
      });
    }
  }, [text, isSiteBuildMode, hasBrandMemory, brandMemory, selectedStyle, templateType, pageLabel, onComplete]);

  // Ctrl+Enter / Cmd+Enter で送信
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  // 送信中のローディング表示
  if (isSubmitting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7c5cfc] to-[#5b8def] flex items-center justify-center shadow-lg shadow-[#7c5cfc]/15">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-[15px] font-semibold text-foreground">
            ページを準備しています...
          </p>
          <p className="text-[13px] text-muted-foreground">
            AIがデザインの設計を開始します
          </p>
        </motion.div>
      </div>
    );
  }

  const canSubmit = !!(text.trim() || hasBrandMemory || selectedStyle);

  return (
    <div className="flex-1 flex flex-col items-center px-6 py-8 max-w-2xl mx-auto overflow-y-auto">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 mb-6 shrink-0"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7c5cfc] to-[#5b8def] flex items-center justify-center shadow-lg shadow-[#7c5cfc]/15">
          {isSiteBuildMode ? (
            <Rocket className="w-6 h-6 text-white" />
          ) : (
            <Sparkles className="w-6 h-6 text-white" />
          )}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {isSiteBuildMode ? "どんなサイトを作りたいですか？" : `${pageLabel}を作りましょう`}
          </h2>
          <p className="text-[14px] text-muted-foreground mt-1.5 leading-relaxed">
            {isSiteBuildMode
              ? "自由にイメージを伝えてください。AIが最適なデザインを構築します"
              : "ページのイメージを自由に伝えてください"}
          </p>
        </div>
      </motion.div>

      {/* ── Brand Memory Badge ── */}
      {hasBrandMemory && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-4 shrink-0"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/[0.06] border border-accent/15">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-[13px] text-accent font-medium">
              {brandContext}
            </span>
          </div>
        </motion.div>
      )}

      {/* ── Inspiration Cards (テキストの上) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full mb-4 shrink-0"
      >
        <button
          onClick={() => setShowInspirations(!showInspirations)}
          className={clsx(
            "flex items-center gap-1.5 px-1 py-1 rounded-md text-[13px] font-medium mb-3",
            "transition-all duration-200",
            showInspirations
              ? "text-accent"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Lightbulb className="w-4 h-4" />
          {showInspirations ? "スタイルヒントを隠す" : "スタイルヒントを見る"}
        </button>

        <AnimatePresence>
          {showInspirations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {INSPIRATION_CARDS.map((card, i) => (
                  <motion.button
                    key={card.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.03 * i }}
                    onClick={() => handleInspirationSelect(card)}
                    className={clsx(
                      "group flex flex-col items-start gap-1.5 p-3.5 rounded-xl text-left",
                      "border transition-all duration-200",
                      `bg-gradient-to-br ${card.gradient}`,
                      selectedStyle === card.id
                        ? "border-accent/50 ring-2 ring-accent/15 shadow-md"
                        : card.borderColor,
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <card.icon
                        className={clsx(
                          "w-4 h-4 transition-colors",
                          selectedStyle === card.id ? "text-accent" : "text-foreground/60",
                        )}
                      />
                      <span
                        className={clsx(
                          "text-[13px] font-semibold transition-colors",
                          selectedStyle === card.id ? "text-accent" : "text-foreground",
                        )}
                      >
                        {card.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground leading-snug">
                      {card.description}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Text Input + Submit (統合エリア) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full shrink-0"
      >
        <div
          className={clsx(
            "relative rounded-2xl border-2 bg-white overflow-hidden",
            "transition-all duration-300",
            isFocused ? "shadow-lg" : "shadow-sm",
          )}
          style={{
            borderColor: isFocused ? "#7c5cfc" : "rgba(0,0,0,0.06)",
            boxShadow: isFocused
              ? "0 10px 15px -3px rgba(124,92,252,0.12), 0 4px 6px -4px rgba(124,92,252,0.12)"
              : undefined,
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={4}
            placeholder={
              isSiteBuildMode
                ? "例: ミニマルなアパレルブランドのサイト。白を基調に、商品の写真が映えるデザインで。"
                : `例: 上品で洗練された${pageLabel}。大きなヒーロー画像と、商品の魅力が伝わるレイアウトで。`
            }
            className={clsx(
              "w-full px-5 pt-4 pb-16",
              "text-[15px] text-foreground placeholder:text-muted-foreground/40 leading-relaxed",
              "resize-none outline-none bg-transparent",
              "min-h-[120px]",
              "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
            )}
            style={{ caretColor: "#7c5cfc" }}
          />
          {/* ── ボトムバー: ショートカット + 送信ボタン ── */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-white via-white/90 to-transparent">
            <span className="text-[12px] text-muted-foreground/40 select-none">
              ⌘+Enter で送信
            </span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={clsx(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl",
                "text-[14px] font-semibold",
                "transition-all duration-200",
                canSubmit
                  ? "bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] text-white shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30"
                  : "bg-black/[0.05] text-muted-foreground/40 cursor-not-allowed",
              )}
            >
              {isSiteBuildMode ? (
                <Rocket className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isSiteBuildMode ? "サイトを構築する" : "作成を開始する"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Back / Cancel ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-4 shrink-0"
      >
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </button>
      </motion.div>
    </div>
  );
}
