"use client";

import { motion } from "framer-motion";
import { Sparkles, Palette, Type, Layout, Zap } from "lucide-react";

/**
 * DesignVisionCard (旧 TemplatePreviewCard)
 *
 * テンプレートプレビューは廃止。
 * DDPの「ゼロからオリジナルを創る」思想を反映し、
 * AIがこれから行うクリエイティブプロセスを可視化する。
 */

interface DesignVisionCardProps {
  industry: string;
  tone: string;
  pageType: string;
}

const INDUSTRY_LABELS: Record<string, string> = {
  fashion: "アパレル・ファッション",
  beauty: "コスメ・美容",
  food: "食品・飲料",
  lifestyle: "雑貨・インテリア",
  tech: "テック・ガジェット",
  health: "健康・フィットネス",
  other: "その他",
  general: "汎用",
};

const TONE_LABELS: Record<string, string> = {
  luxury: "高級感・エレガント",
  natural: "ナチュラル・オーガニック",
  modern: "モダン・ミニマル",
  playful: "ポップ・カラフル",
  traditional: "和風・伝統的",
  cool: "クール・スタイリッシュ",
  bold: "大胆・インパクト",
  elegant: "エレガント",
  warm: "あたたかみ",
  minimal: "ミニマル",
};

const TONE_COLORS: Record<string, { from: string; to: string; accent: string }> = {
  luxury: { from: "#1a1a2e", to: "#16213e", accent: "#c9a96e" },
  natural: { from: "#2d5016", to: "#4a7c2e", accent: "#a8d38d" },
  modern: { from: "#1e293b", to: "#334155", accent: "#60a5fa" },
  playful: { from: "#ec4899", to: "#f59e0b", accent: "#fbbf24" },
  traditional: { from: "#44403c", to: "#78716c", accent: "#d4a574" },
  cool: { from: "#0f172a", to: "#1e40af", accent: "#38bdf8" },
  bold: { from: "#7c2d12", to: "#dc2626", accent: "#fbbf24" },
  elegant: { from: "#1c1917", to: "#44403c", accent: "#d6d3d1" },
  warm: { from: "#92400e", to: "#b45309", accent: "#fde68a" },
  minimal: { from: "#f8fafc", to: "#e2e8f0", accent: "#475569" },
};

// AIの思考プロセスを表現するステップ
const CREATIVE_STEPS = [
  { icon: Palette, label: "配色設計", desc: "ブランドに最適な色を選定" },
  { icon: Type, label: "タイポグラフィ", desc: "フォントと文字組みを最適化" },
  { icon: Layout, label: "レイアウト構成", desc: "コンバージョン重視の配置" },
  { icon: Zap, label: "インタラクション", desc: "心地よいアニメーション" },
];

export default function TemplatePreviewCard({
  industry,
  tone,
  pageType,
}: DesignVisionCardProps) {
  const colors = TONE_COLORS[tone] || TONE_COLORS.modern;
  const industryLabel = INDUSTRY_LABELS[industry] || industry;
  const toneLabel = TONE_LABELS[tone] || tone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full mt-6 rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
      }}
    >
      {/* ヘッダー: AIクリエイティブエンジン */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-4 h-4" style={{ color: colors.accent }} />
          </motion.div>
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: colors.accent }}
          >
            AI Design Intelligence
          </span>
        </div>

        <h3 className="text-[15px] font-bold text-white leading-snug mb-1">
          あなただけのオリジナルデザインを創ります
        </h3>
        <p className="text-[12px] text-white/60 leading-relaxed">
          {industryLabel} × {toneLabel} — 世界中のデザイントレンドから最適な要素を組み合わせます
        </p>
      </div>

      {/* クリエイティブプロセス可視化 */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {CREATIVE_STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <step.icon
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: colors.accent }}
              />
              <div>
                <p className="text-[11px] font-semibold text-white/90 leading-tight">
                  {step.label}
                </p>
                <p className="text-[10px] text-white/40 leading-tight">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ボトムバー: 進行中のアニメーション */}
      <div
        className="px-5 py-3 flex items-center gap-3"
        style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: colors.accent }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
        <p className="text-[11px] text-white/50">
          「作成を開始する」で、AIがデザインの設計から制作まで一貫して行います
        </p>
      </div>
    </motion.div>
  );
}
