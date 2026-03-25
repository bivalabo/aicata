// ============================================================
// DDP Next — Evolution Engine
// 人とAIの共同進化ループ
//
// ユーザー/Curatorの評価を受け取り、HQSスコアをEMA更新
// ユーザーのDesign DNA好みを学習
// ============================================================

import type { HumanQualityScore, SectionMeta } from "./types";
import { computeHQSComposite } from "./types";
import { getSectionMeta, updateSectionMeta, getAllSectionMeta } from "./section-meta";
import type { DesignDNAPreferences } from "@/lib/ace-adis/types";
import { EMA_ALPHA_HQS, EMA_ALPHA_DNA, HQS_MIN, HQS_MAX } from "@/lib/constants";

// ============================================================
// Types
// ============================================================

export interface SectionFeedback {
  /** セクションID */
  sectionId: string;
  /** フィードバック種別 */
  action: "like" | "dislike" | "regenerate";
  /** 詳細評価（任意） */
  ratings?: Partial<HumanQualityScore>;
  /** フィードバック時のコンテキスト */
  context?: {
    precedingSectionId?: string;
    followingSectionId?: string;
    templateId?: string;
    pageType?: string;
  };
}

export interface UserDNAUpdate {
  /** 更新前のDNA */
  before: DesignDNAPreferences;
  /** 更新後のDNA */
  after: DesignDNAPreferences;
  /** 変化した次元 */
  changedDimensions: string[];
}

// ============================================================
// Constants
// ============================================================

/** HQS更新のEMA係数 — @/lib/constants から参照 */
const HQS_EMA_ALPHA = EMA_ALPHA_HQS;

/** DNA更新のEMA係数 — @/lib/constants から参照 */
const DNA_EMA_ALPHA = EMA_ALPHA_DNA;

/** like時のHQSブースト量 */
const LIKE_BOOST = 0.3;

/** dislike時のHQS減少量 */
const DISLIKE_PENALTY = -0.4;

/** regenerate時のHQS減少量（dislikeより軽い） */
const REGENERATE_PENALTY = -0.2;

// ============================================================
// Public API: HQS更新
// ============================================================

/**
 * ユーザーフィードバックを受けてHQSスコアをEMA更新
 *
 * 更新式: HQS_new = (1 - α) × HQS_current + α × rating_signal
 */
export function updateHQSFromFeedback(
  feedback: SectionFeedback,
): { updated: boolean; newComposite: number } {
  const meta = getSectionMeta(feedback.sectionId);
  if (!meta) return { updated: false, newComposite: 0 };

  const currentHQS = { ...meta.hqs };
  let newHQS: HumanQualityScore;

  if (feedback.ratings) {
    // 詳細評価が提供されている場合: 各軸をEMA更新
    newHQS = emaUpdateHQS(currentHQS, feedback.ratings);
  } else {
    // 簡易フィードバック（like/dislike/regenerate）の場合
    const boost = feedback.action === "like"
      ? LIKE_BOOST
      : feedback.action === "dislike"
        ? DISLIKE_PENALTY
        : REGENERATE_PENALTY;

    newHQS = uniformBoostHQS(currentHQS, boost);
  }

  // rhythm のコンテキスト評価（前後のセクションが分かる場合）
  if (feedback.context?.precedingSectionId || feedback.context?.followingSectionId) {
    const rhythmBoost = feedback.action === "like" ? 0.2 : -0.15;
    newHQS.rhythm = clampHQS(newHQS.rhythm + rhythmBoost);
  }

  // section-meta を更新
  updateSectionMeta(feedback.sectionId, { hqs: newHQS });

  return {
    updated: true,
    newComposite: computeHQSComposite(newHQS),
  };
}

/**
 * Curator（運営者）によるHQS直接評価
 * EMAではなく直接上書き（Curator評価は信頼度が高い）
 */
export function setCuratorHQS(
  sectionId: string,
  hqs: HumanQualityScore,
): boolean {
  const meta = getSectionMeta(sectionId);
  if (!meta) return false;

  updateSectionMeta(sectionId, { hqs });
  return true;
}

// ============================================================
// Public API: Design DNA学習
// ============================================================

/**
 * ユーザーのフィードバックからDesign DNA好みを学習更新
 *
 * like → そのセクションのDNA方向にDNAを近づける
 * dislike → そのセクションのDNA方向から遠ざける
 */
export function updateUserDNA(
  currentDNA: DesignDNAPreferences,
  feedback: SectionFeedback,
): UserDNAUpdate {
  const meta = getSectionMeta(feedback.sectionId);
  if (!meta?.dna) {
    return { before: currentDNA, after: currentDNA, changedDimensions: [] };
  }

  const direction = feedback.action === "like" ? 1 : -1;
  const alpha = DNA_EMA_ALPHA * direction;

  const DNA_KEYS: (keyof DesignDNAPreferences)[] = [
    "minimalism", "whitespace", "contrast", "animationIntensity",
    "serifAffinity", "colorSaturation", "layoutComplexity",
    "imageWeight", "asymmetry", "novelty",
  ];

  const after = { ...currentDNA };
  const changedDimensions: string[] = [];

  for (const key of DNA_KEYS) {
    const sectionValue = meta.dna[key];
    if (sectionValue === undefined) continue;

    const before = currentDNA[key] ?? 0;
    const updated = before + alpha * (sectionValue - before);
    if (isNaN(updated)) continue; // Guard against NaN propagation
    const clamped = Math.max(-1, Math.min(1, updated));

    if (Math.abs(clamped - before) > 0.01) {
      after[key] = clamped;
      changedDimensions.push(key);
    }
  }

  return { before: currentDNA, after, changedDimensions };
}

// ============================================================
// Public API: バッチ分析
// ============================================================

/**
 * HQSが低いセクションを特定（改善候補）
 */
export function findLowQualitySections(
  threshold = 3.0,
): Array<{ sectionId: string; composite: number; weakest: string }> {
  // section-meta から全セクションを取得してフィルタ
  const allMetas: SectionMeta[] = getAllSectionMeta();

  return allMetas
    .map((meta) => {
      const composite = computeHQSComposite(meta.hqs);
      // 最も低い評価軸を特定
      const axes = [
        { name: "visual", score: meta.hqs.visual },
        { name: "rhythm", score: meta.hqs.rhythm },
        { name: "conversion", score: meta.hqs.conversion },
        { name: "mobile", score: meta.hqs.mobile },
        { name: "brand", score: meta.hqs.brand },
      ];
      const weakest = axes.reduce((min, ax) => ax.score < min.score ? ax : min);

      return {
        sectionId: meta.sectionId,
        composite,
        weakest: weakest.name,
      };
    })
    .filter((entry) => entry.composite < threshold)
    .sort((a, b) => a.composite - b.composite);
}

// ============================================================
// Internal: EMA計算
// ============================================================

function emaUpdateHQS(
  current: HumanQualityScore,
  newRating: Partial<HumanQualityScore>,
): HumanQualityScore {
  const alpha = HQS_EMA_ALPHA;
  return {
    visual: newRating.visual !== undefined
      ? clampHQS((1 - alpha) * current.visual + alpha * newRating.visual)
      : current.visual,
    rhythm: newRating.rhythm !== undefined
      ? clampHQS((1 - alpha) * current.rhythm + alpha * newRating.rhythm)
      : current.rhythm,
    conversion: newRating.conversion !== undefined
      ? clampHQS((1 - alpha) * current.conversion + alpha * newRating.conversion)
      : current.conversion,
    mobile: newRating.mobile !== undefined
      ? clampHQS((1 - alpha) * current.mobile + alpha * newRating.mobile)
      : current.mobile,
    brand: newRating.brand !== undefined
      ? clampHQS((1 - alpha) * current.brand + alpha * newRating.brand)
      : current.brand,
  };
}

function uniformBoostHQS(
  current: HumanQualityScore,
  boost: number,
): HumanQualityScore {
  return {
    visual: clampHQS(current.visual + boost),
    rhythm: clampHQS(current.rhythm + boost),
    conversion: clampHQS(current.conversion + boost),
    mobile: clampHQS(current.mobile + boost),
    brand: clampHQS(current.brand + boost),
  };
}

function clampHQS(value: number): number {
  return Math.max(HQS_MIN, Math.min(HQS_MAX, value));
}
