"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Shirt,
  Flower2,
  UtensilsCrossed,
  Lamp,
  Cpu,
  Dumbbell,
  MoreHorizontal,
  Crown,
  Leaf,
  Minimize2,
  Palette,
  Fan,
  Zap,
  Users,
  Briefcase,
  Heart,
  Gift,
  Globe,
  PenLine,
  Rocket,
  Loader2,
} from "lucide-react";
import clsx from "clsx";
import TemplatePreviewCard from "./TemplatePreviewCard";

// ============================================================
// Types
// ============================================================

interface StepOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface StepConfig {
  id: string;
  question: string;
  subtitle: string;
  options: StepOption[];
}

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
  /**
   * フローのモード:
   * - "site-build": サイト全体を構築（自然な会話フロー）
   * - ページタイプ文字列: 個別ページ作成（従来フロー）
   */
  templateType: string;
  onComplete: (compiledPrompt: string, pageType: string, selections: OnboardingSelections) => void;
  onCancel: () => void;
  /** Brand Memoryがある場合、業種/トーンステップをスキップ */
  brandMemory?: BrandMemoryHint | null;
}

interface Selections {
  industry: string | null;
  tone: string | null;
  audience: string | null;
  audienceCustomText: string;
  freeText: string;
}

// ============================================================
// Step Definitions
// ============================================================

const STEPS: StepConfig[] = [
  {
    id: "industry",
    question: "どんな商品を扱っていますか？",
    subtitle: "業種に合わせた最適なデザインをご提案します",
    options: [
      { id: "fashion", label: "アパレル・ファッション", icon: <Shirt className="w-4 h-4" /> },
      { id: "beauty", label: "コスメ・美容", icon: <Flower2 className="w-4 h-4" /> },
      { id: "food", label: "食品・飲料", icon: <UtensilsCrossed className="w-4 h-4" /> },
      { id: "lifestyle", label: "雑貨・インテリア", icon: <Lamp className="w-4 h-4" /> },
      { id: "tech", label: "テック・ガジェット", icon: <Cpu className="w-4 h-4" /> },
      { id: "health", label: "健康・フィットネス", icon: <Dumbbell className="w-4 h-4" /> },
      { id: "other", label: "その他", icon: <MoreHorizontal className="w-4 h-4" /> },
    ],
  },
  {
    id: "tone",
    question: "どんな雰囲気がお好みですか？",
    subtitle: "ブランドに合ったトーンを選んでください",
    options: [
      { id: "luxury", label: "高級感・エレガント", icon: <Crown className="w-4 h-4" /> },
      { id: "natural", label: "ナチュラル・オーガニック", icon: <Leaf className="w-4 h-4" /> },
      { id: "modern", label: "モダン・ミニマル", icon: <Minimize2 className="w-4 h-4" /> },
      { id: "playful", label: "ポップ・カラフル", icon: <Palette className="w-4 h-4" /> },
      { id: "traditional", label: "和風・伝統的", icon: <Fan className="w-4 h-4" /> },
      { id: "cool", label: "クール・スタイリッシュ", icon: <Zap className="w-4 h-4" /> },
    ],
  },
  {
    id: "audience",
    question: "誰に届けたいですか？",
    subtitle: "ターゲットに合わせたデザインをご提案します",
    options: [
      { id: "individual", label: "個人のお客様（一般消費者）", icon: <Users className="w-4 h-4" /> },
      { id: "business", label: "法人・ビジネス向け", icon: <Briefcase className="w-4 h-4" /> },
      { id: "young", label: "若年層（10〜20代中心）", icon: <Zap className="w-4 h-4" /> },
      { id: "young-adult", label: "20〜30代の社会人" },
      { id: "middle", label: "40〜50代の大人世代" },
      { id: "women", label: "女性中心", icon: <Heart className="w-4 h-4" /> },
      { id: "men", label: "男性中心" },
      { id: "premium", label: "高品質・こだわり志向の方", icon: <Crown className="w-4 h-4" /> },
      { id: "family", label: "ファミリー・暮らし向け" },
      { id: "eco-conscious", label: "エコ・サステナブル志向", icon: <Leaf className="w-4 h-4" /> },
      { id: "gift", label: "ギフト・贈り物を探す方", icon: <Gift className="w-4 h-4" /> },
      { id: "broad", label: "特に絞らない（幅広い層）", icon: <Globe className="w-4 h-4" /> },
      { id: "custom", label: "自由に入力する", icon: <PenLine className="w-4 h-4" />, description: "ターゲット層を自由に記述" },
    ],
  },
];

const TEMPLATE_LABELS: Record<string, string> = {
  landing: "トップページ",
  product: "商品詳細ページ",
  collection: "コレクションページ",
  cart: "カートページ",
  about: "ブランドページ",
  top: "トップページ",
};

// ============================================================
// Sub-components
// ============================================================

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className={clsx(
            "rounded-full transition-colors duration-300",
            i === current
              ? "bg-accent"
              : i < current
                ? "bg-accent/40"
                : "bg-black/[0.08]",
          )}
          animate={{
            width: i === current ? 24 : 8,
            height: 8,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      ))}
    </div>
  );
}

function OptionChip({
  option,
  isSelected,
  onClick,
  delay = 0,
}: {
  option: StepOption;
  isSelected: boolean;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      onClick={onClick}
      className={clsx(
        "group flex items-center gap-2.5 px-4 py-3 rounded-xl text-left",
        "transition-all duration-200 border",
        isSelected
          ? "bg-accent text-white border-accent shadow-md shadow-accent/20"
          : "bg-white/70 text-foreground border-border hover:bg-white hover:border-accent/30 hover:shadow-sm",
      )}
    >
      {option.icon && (
        <span
          className={clsx(
            "shrink-0 transition-colors",
            isSelected ? "text-white" : "text-muted",
          )}
        >
          {option.icon}
        </span>
      )}
      <span className="text-[13px] font-medium">{option.label}</span>
    </motion.button>
  );
}

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

  // Brand Memoryがある場合、業種/トーンをプリセットしてフリーテキストステップへ直行
  const hasBrandMemory = !!(
    brandMemory &&
    brandMemory.industry &&
    brandMemory.industry !== "general" &&
    brandMemory.tones.length > 0
  );

  const [step, setStep] = useState(hasBrandMemory ? STEPS.length : 0);
  const [selections, setSelections] = useState<Selections>({
    industry: brandMemory?.industry || null,
    tone: brandMemory?.tones[0] || null,
    audience: null,
    audienceCustomText: brandMemory?.targetAudience || "",
    freeText: "",
  });
  const [direction, setDirection] = useState(1);

  const totalSteps = STEPS.length + 1; // +1 for free text step
  const isFinalStep = step === STEPS.length;

  const [showCustomAudience, setShowCustomAudience] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = useCallback(
    (stepId: string, optionId: string) => {
      setSelections((prev) => ({ ...prev, [stepId]: optionId }));

      if (stepId === "audience" && optionId === "custom") {
        setShowCustomAudience(true);
        return;
      }
      setShowCustomAudience(false);

      setTimeout(() => {
        setDirection(1);
        setStep((s) => s + 1);
      }, 280);
    },
    [],
  );

  const handleCustomAudienceConfirm = useCallback(() => {
    if (selections.audienceCustomText.trim()) {
      setShowCustomAudience(false);
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [selections.audienceCustomText]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    } else {
      onCancel();
    }
  }, [step, onCancel]);

  const handleComplete = useCallback(() => {
    setIsSubmitting(true);
    const industryOption = STEPS[0].options.find((o) => o.id === selections.industry);
    const toneOption = STEPS[1].options.find((o) => o.id === selections.tone);
    const audienceOption = STEPS[2].options.find((o) => o.id === selections.audience);

    // ターゲット文言の構築
    let audienceText: string;
    if (selections.audience === "custom" && selections.audienceCustomText.trim()) {
      audienceText = selections.audienceCustomText.trim();
    } else {
      audienceText = audienceOption?.label || "幅広い層";
    }

    if (isSiteBuildMode) {
      // ── サイト全体構築モード ──
      // 自然な会話的プロンプトを生成
      let prompt = `Shopifyサイト全体を作成してください。\n\n`;
      prompt += `業種は${industryOption?.label || "一般"}で、`;
      prompt += `${toneOption?.label || "モダン"}な雰囲気のサイトにしたいです。\n`;
      prompt += `ターゲットは${audienceText}です。\n`;

      if (selections.freeText.trim()) {
        prompt += `\n${selections.freeText.trim()}\n`;
      }

      prompt += `\nまずトップページから作成をお願いします。`;

      onComplete(prompt, "site-build", {
        industry: selections.industry || "general",
        tone: selections.tone || "modern",
        audience: selections.audience,
        freeText: selections.freeText,
      });
    } else {
      // ── 個別ページモード（従来フロー） ──
      const pageLabel = TEMPLATE_LABELS[templateType] || "ページ";
      const normalizedPageType = templateType === "top" ? "landing" : templateType;

      let prompt = `${pageLabel}を作成してください。\n\n`;
      prompt += `【ページタイプ】${normalizedPageType}\n`;
      prompt += `【業種】${industryOption?.label || "指定なし"}\n`;
      prompt += `【雰囲気】${toneOption?.label || "指定なし"}\n`;
      prompt += `【ターゲット】${audienceText}`;

      if (selections.freeText.trim()) {
        prompt += `\n【その他の要望】${selections.freeText.trim()}`;
      }

      prompt += `\n\nこの情報をもとに、素敵な${pageLabel}を作成してください。`;

      onComplete(prompt, normalizedPageType, {
        industry: selections.industry || "general",
        tone: selections.tone || "modern",
        audience: selections.audience,
        freeText: selections.freeText,
      });
    }
  }, [selections, templateType, onComplete, isSiteBuildMode]);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  // 送信中はローディング表示
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

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 mb-8"
      >
        <div className={clsx(
          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
          isSiteBuildMode
            ? "bg-gradient-to-br from-[#7c5cfc] to-[#5b8def] shadow-[#7c5cfc]/15"
            : "bg-gradient-to-br from-[#7c5cfc] to-[#5b8def] shadow-[#7c5cfc]/15",
        )}>
          {isSiteBuildMode ? (
            <Rocket className="w-6 h-6 text-white" />
          ) : (
            <Sparkles className="w-6 h-6 text-white" />
          )}
        </div>
        {isSiteBuildMode && (
          <p className="text-[13px] font-medium text-accent">
            サイト全体を構築します
          </p>
        )}
        <ProgressDots total={totalSteps} current={step} />
      </motion.div>

      {/* Step Content */}
      <div className="w-full min-h-[320px] flex flex-col items-center relative">
        <AnimatePresence mode="wait" custom={direction}>
          {!isFinalStep ? (
            <motion.div
              key={`step-${step}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="w-full flex flex-col items-center"
            >
              {/* Question */}
              <h2 className="text-lg font-bold text-foreground text-center mb-1.5">
                {STEPS[step].question}
              </h2>
              <p className="text-[13px] text-muted mb-6 text-center">
                {STEPS[step].subtitle}
              </p>

              {/* Option Chips */}
              <div className="w-full grid grid-cols-2 gap-2.5">
                {STEPS[step].options.map((option, i) => (
                  <OptionChip
                    key={option.id}
                    option={option}
                    isSelected={
                      selections[STEPS[step].id as keyof Selections] === option.id
                    }
                    onClick={() => handleSelect(STEPS[step].id, option.id)}
                    delay={0.03 * i}
                  />
                ))}
              </div>

              {/* カスタムオーディエンス入力エリア */}
              {showCustomAudience && STEPS[step].id === "audience" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="w-full mt-4"
                >
                  <textarea
                    value={selections.audienceCustomText}
                    onChange={(e) =>
                      setSelections((prev) => ({
                        ...prev,
                        audienceCustomText: e.target.value,
                      }))
                    }
                    placeholder="例: 30代の美意識の高い女性、都内在住でサステナブルな商品に関心がある層"
                    className={clsx(
                      "w-full h-20 px-4 py-3 rounded-xl border border-accent/30 bg-white/70",
                      "text-[13px] text-foreground placeholder:text-muted-foreground/50",
                      "resize-none outline-none",
                      "focus:border-accent/50 focus:ring-2 focus:ring-accent/10",
                      "transition-all duration-200",
                    )}
                    autoFocus
                  />
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    onClick={handleCustomAudienceConfirm}
                    disabled={!selections.audienceCustomText.trim()}
                    className={clsx(
                      "mt-3 flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium",
                      "transition-all duration-200",
                      selections.audienceCustomText.trim()
                        ? "bg-accent text-white hover:bg-accent/90"
                        : "bg-black/[0.06] text-muted cursor-not-allowed",
                    )}
                  >
                    次へ
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Final Step: Free Text + Confirmation */
            <motion.div
              key="step-final"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-lg font-bold text-foreground text-center mb-1.5">
                {isSiteBuildMode
                  ? "その他のご要望はありますか？"
                  : "その他のご要望はありますか？"}
              </h2>
              <p className="text-[13px] text-muted mb-6 text-center">
                {isSiteBuildMode
                  ? "ブランド名、参考サイト、こだわりポイントなど（任意）"
                  : "ブランド名、参考サイト、こだわりポイントなど（任意）"}
              </p>

              {/* Summary pills */}
              <div className="flex flex-wrap gap-2 mb-5 justify-center">
                {isSiteBuildMode && (
                  <span className="text-[12px] px-3 py-1 rounded-full bg-[#7c5cfc]/10 text-[#7c5cfc] font-medium">
                    サイト全体を構築
                  </span>
                )}
                {selections.industry && (
                  <span className="text-[12px] px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">
                    {STEPS[0].options.find((o) => o.id === selections.industry)?.label}
                  </span>
                )}
                {selections.tone && (
                  <span className="text-[12px] px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">
                    {STEPS[1].options.find((o) => o.id === selections.tone)?.label}
                  </span>
                )}
                {selections.audience && (
                  <span className="text-[12px] px-3 py-1 rounded-full bg-accent/10 text-accent font-medium max-w-[200px] truncate">
                    {selections.audience === "custom" && selections.audienceCustomText.trim()
                      ? selections.audienceCustomText.trim()
                      : STEPS[2].options.find((o) => o.id === selections.audience)?.label}
                  </span>
                )}
              </div>

              {/* Template Preview (for individual page mode) */}
              {!isSiteBuildMode && selections.industry && selections.tone && (
                <TemplatePreviewCard
                  industry={selections.industry}
                  tone={selections.tone}
                  pageType={templateType === "top" ? "landing" : templateType}
                />
              )}

              {/* Text input */}
              <textarea
                value={selections.freeText}
                onChange={(e) =>
                  setSelections((prev) => ({ ...prev, freeText: e.target.value }))
                }
                placeholder={
                  isSiteBuildMode
                    ? "例: ブランド名は「MUJI STYLE」。参考サイト: https://... トップページ以外に、商品一覧とブランドストーリーのページも欲しいです。"
                    : "例: ブランド名は「MUJI STYLE」で、無印良品のような世界観にしたいです。参考サイト: https://..."
                }
                className={clsx(
                  "w-full h-28 px-4 py-3 rounded-xl border border-border bg-white/70",
                  "text-[13px] text-foreground placeholder:text-muted-foreground/50",
                  "resize-none outline-none",
                  "focus:border-accent/40 focus:ring-2 focus:ring-accent/10",
                  "transition-all duration-200",
                )}
              />

              {/* Submit button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleComplete}
                className={clsx(
                  "mt-5 flex items-center gap-2 px-6 py-3 rounded-xl",
                  "bg-gradient-to-r from-[#7c5cfc] to-[#5b8def]",
                  "text-white text-[14px] font-semibold",
                  "shadow-lg shadow-accent/25",
                  "hover:shadow-xl hover:shadow-accent/30",
                  "active:scale-[0.98]",
                  "transition-all duration-200",
                )}
              >
                {isSiteBuildMode ? (
                  <Rocket className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isSiteBuildMode ? "サイト構築を開始する" : "作成を開始する"}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Back / Cancel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-[12px] text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {step === 0 ? "戻る" : "前の質問に戻る"}
        </button>
      </motion.div>
    </div>
  );
}
