// ============================================================
// Aicata ADIS — Design DNA Engine
// サイト評価からDesign DNAを計算・更新する
// ============================================================

import type {
  DesignDNA,
  DesignDNAPreferences,
  SiteEvaluationData,
} from "./types";
import { createDefaultDesignDNA } from "./types";

// ============================================================
// Constants
// ============================================================

/** 学習率 — 新しい評価の影響度 */
const LEARNING_RATE = 0.1;

/** DNA信頼度の上限に達するのに必要な評価数 */
const CONFIDENCE_THRESHOLD = 50;

// ============================================================
// Site Feature Analysis (ルールベース推定)
// ============================================================

/**
 * サイト評価からデザイン特徴を推定する（ルールベース）
 * 将来的にはClaude Vision APIによる分析に置き換え
 */
export function estimateSiteFeatures(
  evaluation: SiteEvaluationData,
): Partial<DesignDNAPreferences> {
  const features: Partial<DesignDNAPreferences> = {};
  const tags = evaluation.tags.map((t) => t.toLowerCase());

  // --- タグベースの推定 ---

  // ミニマリズム
  if (tags.includes("minimal") || tags.includes("clean") || tags.includes("simple")) {
    features.minimalism = 0.8;
  } else if (tags.includes("cluttered") || tags.includes("busy") || tags.includes("decorative")) {
    features.minimalism = -0.7;
  }

  // 余白
  if (tags.includes("whitespace") || tags.includes("spacious") || tags.includes("airy")) {
    features.whitespace = 0.8;
  } else if (tags.includes("dense") || tags.includes("compact") || tags.includes("tight")) {
    features.whitespace = -0.6;
  }

  // コントラスト
  if (tags.includes("bold") || tags.includes("high-contrast") || tags.includes("dark")) {
    features.contrast = 0.7;
  } else if (tags.includes("soft") || tags.includes("pastel") || tags.includes("muted")) {
    features.contrast = -0.5;
  }

  // アニメーション
  if (tags.includes("animation") || tags.includes("interactive") || tags.includes("dynamic")) {
    features.animationIntensity = 0.7;
  } else if (tags.includes("static") || tags.includes("no-animation")) {
    features.animationIntensity = -0.5;
  }

  // セリフ
  if (tags.includes("serif") || tags.includes("editorial") || tags.includes("classic")) {
    features.serifAffinity = 0.7;
  } else if (tags.includes("sans-serif") || tags.includes("geometric")) {
    features.serifAffinity = -0.5;
  }

  // 色彩飽和度
  if (tags.includes("colorful") || tags.includes("vivid") || tags.includes("vibrant")) {
    features.colorSaturation = 0.8;
  } else if (tags.includes("monochrome") || tags.includes("bw") || tags.includes("neutral")) {
    features.colorSaturation = -0.7;
  }

  // レイアウト複雑性
  if (tags.includes("complex") || tags.includes("bento") || tags.includes("asymmetric")) {
    features.layoutComplexity = 0.6;
  } else if (tags.includes("simple") || tags.includes("single-column")) {
    features.layoutComplexity = -0.6;
  }

  // 画像重視
  if (tags.includes("image-heavy") || tags.includes("photography") || tags.includes("visual")) {
    features.imageWeight = 0.7;
  } else if (tags.includes("text-heavy") || tags.includes("content") || tags.includes("editorial")) {
    features.imageWeight = -0.5;
  }

  // 非対称
  if (tags.includes("asymmetric") || tags.includes("off-grid") || tags.includes("creative")) {
    features.asymmetry = 0.6;
  } else if (tags.includes("symmetric") || tags.includes("centered") || tags.includes("balanced")) {
    features.asymmetry = -0.5;
  }

  // 新規性
  if (tags.includes("experimental") || tags.includes("innovative") || tags.includes("cutting-edge")) {
    features.novelty = 0.8;
  } else if (tags.includes("traditional") || tags.includes("classic") || tags.includes("outdated")) {
    features.novelty = -0.6;
  }

  // --- スコアベースの補完 ---
  if (evaluation.typographyScore !== undefined) {
    // 高評価のタイポグラフィ → minimalism/whitespace寄り
    if (evaluation.typographyScore >= 4 && features.minimalism === undefined) {
      features.minimalism = 0.3;
    }
  }

  if (evaluation.spacingScore !== undefined) {
    if (evaluation.spacingScore >= 4 && features.whitespace === undefined) {
      features.whitespace = 0.4;
    }
  }

  if (evaluation.animationScore !== undefined) {
    if (evaluation.animationScore >= 4 && features.animationIntensity === undefined) {
      features.animationIntensity = 0.4;
    }
  }

  return features;
}

// ============================================================
// DNA Update Algorithm
// ============================================================

/**
 * サイト評価に基づいてDesign DNAを更新する
 *
 * Exponential Moving Average (EMA) を使用:
 * new_value = current * (1 - α) + target * α
 * ここで target = site_feature * rating_weight
 */
export function updateDesignDNA(
  currentDNA: DesignDNA,
  evaluation: SiteEvaluationData,
): { dna: DesignDNA; changes: Record<string, { before: number; after: number }> } {
  const siteFeatures = estimateSiteFeatures(evaluation);

  // 評価スコアを -1 ~ +1 のウェイトに変換 (3=中立, 5=強い肯定, 1=強い否定)
  const ratingWeight = (evaluation.overallRating - 3) / 2;

  const changes: Record<string, { before: number; after: number }> = {};
  const newPreferences = { ...currentDNA.preferences };

  // 各次元について EMA 更新
  for (const [dimension, siteValue] of Object.entries(siteFeatures)) {
    if (siteValue === undefined) continue;

    const key = dimension as keyof DesignDNAPreferences;
    const currentValue = currentDNA.preferences[key];
    const targetValue = siteValue * ratingWeight;

    // EMA: new = current * (1 - α) + target * α
    const newValue = currentValue * (1 - LEARNING_RATE) + targetValue * LEARNING_RATE;

    // Clamp to [-1, 1]
    newPreferences[key] = Math.max(-1, Math.min(1, newValue));

    if (Math.abs(newPreferences[key] - currentValue) > 0.001) {
      changes[dimension] = {
        before: Math.round(currentValue * 100) / 100,
        after: Math.round(newPreferences[key] * 100) / 100,
      };
    }
  }

  // パターン傾向を更新
  const detectedPatterns = evaluation.detectedPatterns || [];
  const newFavorites = [...currentDNA.favoritePatterns];
  const newAvoids = [...currentDNA.avoidPatterns];

  if (evaluation.overallRating >= 4) {
    for (const p of detectedPatterns) {
      if (!newFavorites.includes(p)) newFavorites.push(p);
      // avoidから除去
      const idx = newAvoids.indexOf(p);
      if (idx !== -1) newAvoids.splice(idx, 1);
    }
  } else if (evaluation.overallRating <= 2) {
    for (const p of detectedPatterns) {
      if (!newAvoids.includes(p)) newAvoids.push(p);
      // favoritesから除去
      const idx = newFavorites.indexOf(p);
      if (idx !== -1) newFavorites.splice(idx, 1);
    }
  }

  const newTotalRatings = currentDNA.totalRatings + 1;

  const updatedDNA: DesignDNA = {
    preferences: newPreferences,
    favoritePatterns: newFavorites,
    avoidPatterns: newAvoids,
    industryBias: currentDNA.industryBias,
    lastUpdated: new Date(),
    totalRatings: newTotalRatings,
    confidence: Math.min(1.0, newTotalRatings / CONFIDENCE_THRESHOLD),
  };

  return { dna: updatedDNA, changes };
}

// ============================================================
// DNA Calculation from All Evaluations (batch recalculation)
// ============================================================

/**
 * 全評価からDesign DNAを再計算する（バッチ処理）
 */
export function recalculateDesignDNA(
  evaluations: SiteEvaluationData[],
): DesignDNA {
  let dna = createDefaultDesignDNA();

  // 時系列順にソート（古い評価から処理）
  const sorted = [...evaluations].sort(
    (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0),
  );

  for (const evaluation of sorted) {
    const { dna: updated } = updateDesignDNA(dna, evaluation);
    dna = updated;
  }

  return dna;
}

// ============================================================
// DNA Similarity Scoring
// ============================================================

/**
 * 2つのDesign DNAの類似度を計算（コサイン類似度）
 * @returns 0-1 (1 = 完全一致)
 */
export function calculateDNASimilarity(
  dna1: DesignDNAPreferences,
  dna2: DesignDNAPreferences,
): number {
  const keys = Object.keys(dna1) as (keyof DesignDNAPreferences)[];

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const key of keys) {
    const v1 = dna1[key];
    const v2 = dna2[key];
    dotProduct += v1 * v2;
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denominator === 0) return 0;

  // Normalize from [-1,1] to [0,1]
  return (dotProduct / denominator + 1) / 2;
}

/**
 * テンプレートのトーンからDesign DNA特徴を推定し、
 * ユーザーDNAとの適合度を計算する
 */
export function scoreTemplateAlignment(
  templateTones: string[],
  dna: DesignDNA,
): number {
  // トーン → DNA次元 のマッピング
  const toneFeatures: Record<string, Partial<DesignDNAPreferences>> = {
    luxury: { minimalism: 0.3, whitespace: 0.6, contrast: 0.5, serifAffinity: 0.7 },
    natural: { minimalism: 0.2, whitespace: 0.4, colorSaturation: -0.3, novelty: -0.2 },
    modern: { minimalism: 0.5, contrast: 0.3, serifAffinity: -0.5, novelty: 0.4 },
    playful: { minimalism: -0.5, colorSaturation: 0.7, animationIntensity: 0.5, novelty: 0.3 },
    minimal: { minimalism: 0.9, whitespace: 0.8, colorSaturation: -0.5, layoutComplexity: -0.7 },
    bold: { contrast: 0.8, minimalism: -0.3, colorSaturation: 0.4, imageWeight: 0.3 },
    elegant: { minimalism: 0.4, whitespace: 0.5, serifAffinity: 0.5, animationIntensity: 0.3 },
    warm: { colorSaturation: 0.2, contrast: -0.3, minimalism: -0.2 },
    cool: { contrast: 0.4, minimalism: 0.3, colorSaturation: -0.2, serifAffinity: -0.3 },
    traditional: { serifAffinity: 0.6, novelty: -0.7, minimalism: -0.2, animationIntensity: -0.4 },
  };

  // テンプレートのトーンからDNA特徴を合成
  const templateDNA: DesignDNAPreferences = {
    minimalism: 0, whitespace: 0, contrast: 0, animationIntensity: 0,
    serifAffinity: 0, colorSaturation: 0, layoutComplexity: 0,
    imageWeight: 0, asymmetry: 0, novelty: 0,
  };

  let toneCount = 0;
  for (const tone of templateTones) {
    const features = toneFeatures[tone];
    if (!features) continue;
    toneCount++;
    for (const [key, value] of Object.entries(features)) {
      templateDNA[key as keyof DesignDNAPreferences] += value;
    }
  }

  if (toneCount > 0) {
    for (const key of Object.keys(templateDNA) as (keyof DesignDNAPreferences)[]) {
      templateDNA[key] = Math.max(-1, Math.min(1, templateDNA[key] / toneCount));
    }
  }

  return calculateDNASimilarity(dna.preferences, templateDNA);
}
