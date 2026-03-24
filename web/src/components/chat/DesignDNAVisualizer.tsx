"use client";

import { motion } from "framer-motion";
import { memo, useMemo } from "react";

// ── DNA 10次元の定義 ──

interface DNADimension {
  key: string;
  label: string;
  labelEn: string;
  leftLabel: string;
  rightLabel: string;
  /** グラデーション色（from → to） */
  color: [string, string];
}

const DNA_DIMENSIONS: DNADimension[] = [
  { key: "minimalism", label: "ミニマリズム", labelEn: "MINIMALISM", leftLabel: "装飾的", rightLabel: "ミニマル", color: ["#10b981", "#34d399"] },
  { key: "whitespace", label: "余白", labelEn: "WHITESPACE", leftLabel: "密", rightLabel: "広い", color: ["#06b6d4", "#22d3ee"] },
  { key: "contrast", label: "コントラスト", labelEn: "CONTRAST", leftLabel: "ソフト", rightLabel: "強い", color: ["#8b5cf6", "#a78bfa"] },
  { key: "animationIntensity", label: "アニメーション", labelEn: "ANIMATION", leftLabel: "静的", rightLabel: "動的", color: ["#6366f1", "#818cf8"] },
  { key: "serifAffinity", label: "セリフ体", labelEn: "SERIF", leftLabel: "Sans", rightLabel: "Serif", color: ["#f59e0b", "#fbbf24"] },
  { key: "colorSaturation", label: "彩度", labelEn: "SATURATION", leftLabel: "モノ", rightLabel: "鮮やか", color: ["#ef4444", "#f87171"] },
  { key: "layoutComplexity", label: "レイアウト", labelEn: "COMPLEXITY", leftLabel: "シンプル", rightLabel: "複雑", color: ["#3b82f6", "#60a5fa"] },
  { key: "imageWeight", label: "画像比重", labelEn: "IMAGE WEIGHT", leftLabel: "テキスト", rightLabel: "画像重視", color: ["#22c55e", "#4ade80"] },
  { key: "asymmetry", label: "非対称性", labelEn: "ASYMMETRY", leftLabel: "対称", rightLabel: "非対称", color: ["#64748b", "#94a3b8"] },
  { key: "novelty", label: "新規性", labelEn: "NOVELTY", leftLabel: "クラシック", rightLabel: "実験的", color: ["#ec4899", "#f472b6"] },
];

// ── 値を -1〜1 → 0〜100% に変換 ──
function toPercent(value: number): number {
  return Math.max(0, Math.min(100, (value + 1) * 50));
}

// ── 単一バーのコンポーネント ──

interface DNABarProps {
  dimension: DNADimension;
  value: number;
  index: number;
}

const DNABar = memo(function DNABar({ dimension, value, index }: DNABarProps) {
  const percent = toPercent(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col gap-1"
    >
      {/* ラベル行 */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold tracking-[0.12em] text-muted-foreground/60 uppercase">
          {dimension.labelEn}
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/40 tabular-nums">
          {value > 0 ? "+" : ""}{value.toFixed(1)}
        </span>
      </div>

      {/* バー */}
      <div className="relative h-[5px] rounded-full bg-black/[0.04] overflow-hidden">
        {/* 中央マーカー */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/[0.06]" />

        {/* 値バー */}
        <motion.div
          className="absolute top-0 bottom-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${dimension.color[0]}, ${dimension.color[1]})`,
            ...(value >= 0
              ? { left: "50%", width: 0 }
              : { right: "50%", width: 0 }),
          }}
          animate={
            value >= 0
              ? { width: `${percent - 50}%` }
              : { width: `${50 - percent}%` }
          }
          transition={{
            delay: 0.1 * index + 0.3,
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />

        {/* ドットインジケーター */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full shadow-sm border-2 border-white"
          style={{
            background: dimension.color[1],
            left: 0,
          }}
          animate={{ left: `calc(${percent}% - 4px)` }}
          transition={{
            delay: 0.1 * index + 0.3,
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />
      </div>

      {/* 左右ラベル */}
      <div className="flex items-center justify-between">
        <span className="text-[8px] text-muted-foreground/35">{dimension.leftLabel}</span>
        <span className="text-[8px] text-muted-foreground/35">{dimension.rightLabel}</span>
      </div>
    </motion.div>
  );
});

// ── メインコンポーネント ──

export interface DesignDNAData {
  minimalism: number;
  whitespace: number;
  contrast: number;
  animationIntensity: number;
  serifAffinity: number;
  colorSaturation: number;
  layoutComplexity: number;
  imageWeight: number;
  asymmetry: number;
  novelty: number;
}

interface DesignDNAVisualizerProps {
  data: DesignDNAData;
  confidence?: number;
  templateId?: string;
}

export default memo(function DesignDNAVisualizer({
  data,
  confidence,
  templateId,
}: DesignDNAVisualizerProps) {
  const bars = useMemo(
    () =>
      DNA_DIMENSIONS.map((dim) => ({
        dimension: dim,
        value: (data as any)[dim.key] ?? 0,
      })),
    [data],
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="my-3 rounded-2xl border border-border/60 overflow-hidden bg-gradient-to-br from-[#fafbfe] to-[#f5f3ff]/50 shadow-sm"
    >
      {/* ヘッダー */}
      <div className="px-4 pt-3.5 pb-2 flex items-center gap-2.5">
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, duration: 0.5, type: "spring", stiffness: 200 }}
          className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#5b8def] flex items-center justify-center shadow-sm shadow-[#7c5cfc]/15"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
        </motion.div>
        <div className="flex flex-col">
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-[11px] font-semibold tracking-[0.08em] text-accent/70 uppercase"
          >
            Design DNA Analysis
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-[9px] text-muted-foreground/50"
          >
            あなたの好みを10次元空間で解析しました
            {confidence != null && (
              <> · 信頼度 {(confidence * 100).toFixed(0)}%</>
            )}
          </motion.span>
        </div>
      </div>

      {/* DNA バーグリッド (5列 × 2行) */}
      <div className="px-4 pb-3 grid grid-cols-5 gap-x-3 gap-y-2.5">
        {bars.map(({ dimension, value }, i) => (
          <DNABar key={dimension.key} dimension={dimension} value={value} index={i} />
        ))}
      </div>

      {/* フッター：テンプレートID */}
      {templateId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.3 }}
          className="px-4 py-2 border-t border-border/40 bg-black/[0.01]"
        >
          <span className="text-[9px] text-muted-foreground/40 font-mono">
            TEMPLATE → {templateId}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
});
