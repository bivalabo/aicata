// ============================================================
// DDP Next — Phase 1: Intent Analyzer
// ユーザー入力 → Design DNA目標座標 + コンテンツ要件
//
// AI使用: なし（決定的マッピング）
// URL分析がある場合はCurator Vision結果を活用
// ============================================================

import type { DesignDNAPreferences } from "@/lib/ace-adis/types";
import type {
  IndustryType,
  PageType,
  DesignTone,
  UrlAnalysisResult,
} from "@/lib/design-engine/types";
import type {
  DDPNextInput,
  IntentAnalysis,
  ContentRequirements,
} from "./types";

// ============================================================
// トーン → DNA座標マッピング（toneBasedDNA と同等だが独立）
// ============================================================

const TONE_DNA_MAP: Record<string, Partial<DesignDNAPreferences>> = {
  luxury: {
    minimalism: 0.3, whitespace: 0.6, contrast: 0.5,
    serifAffinity: 0.7, colorSaturation: -0.2, layoutComplexity: -0.3,
    imageWeight: 0.5, asymmetry: 0.1, novelty: 0.1, animationIntensity: 0.2,
  },
  natural: {
    minimalism: 0.2, whitespace: 0.4, contrast: -0.2,
    serifAffinity: 0.3, colorSaturation: -0.1, layoutComplexity: -0.3,
    imageWeight: 0.4, asymmetry: 0.0, novelty: -0.3, animationIntensity: -0.2,
  },
  modern: {
    minimalism: 0.5, whitespace: 0.3, contrast: 0.3,
    serifAffinity: -0.5, colorSaturation: 0.1, layoutComplexity: 0.0,
    imageWeight: 0.3, asymmetry: 0.2, novelty: 0.4, animationIntensity: 0.3,
  },
  playful: {
    minimalism: -0.5, whitespace: -0.1, contrast: 0.2,
    serifAffinity: -0.3, colorSaturation: 0.7, layoutComplexity: 0.3,
    imageWeight: 0.4, asymmetry: 0.3, novelty: 0.3, animationIntensity: 0.5,
  },
  minimal: {
    minimalism: 0.9, whitespace: 0.8, contrast: 0.2,
    serifAffinity: -0.3, colorSaturation: -0.5, layoutComplexity: -0.7,
    imageWeight: 0.0, asymmetry: -0.2, novelty: 0.0, animationIntensity: -0.3,
  },
  bold: {
    minimalism: -0.3, whitespace: 0.0, contrast: 0.8,
    serifAffinity: -0.5, colorSaturation: 0.4, layoutComplexity: 0.3,
    imageWeight: 0.6, asymmetry: 0.4, novelty: 0.5, animationIntensity: 0.6,
  },
  elegant: {
    minimalism: 0.4, whitespace: 0.5, contrast: 0.3,
    serifAffinity: 0.5, colorSaturation: 0.0, layoutComplexity: -0.2,
    imageWeight: 0.3, asymmetry: 0.1, novelty: 0.1, animationIntensity: 0.3,
  },
  warm: {
    minimalism: -0.1, whitespace: 0.2, contrast: -0.3,
    serifAffinity: 0.2, colorSaturation: 0.2, layoutComplexity: -0.1,
    imageWeight: 0.4, asymmetry: 0.0, novelty: -0.1, animationIntensity: 0.1,
  },
  cool: {
    minimalism: 0.3, whitespace: 0.3, contrast: 0.4,
    serifAffinity: -0.3, colorSaturation: -0.2, layoutComplexity: 0.0,
    imageWeight: 0.2, asymmetry: 0.1, novelty: 0.2, animationIntensity: 0.2,
  },
  traditional: {
    minimalism: -0.2, whitespace: 0.1, contrast: 0.1,
    serifAffinity: 0.6, colorSaturation: 0.1, layoutComplexity: 0.1,
    imageWeight: 0.3, asymmetry: -0.2, novelty: -0.7, animationIntensity: -0.4,
  },
};

// ============================================================
// 業種 → DNA傾向マッピング
// ============================================================

const INDUSTRY_DNA_BIAS: Record<string, Partial<DesignDNAPreferences>> = {
  beauty: {
    minimalism: 0.3, whitespace: 0.4, serifAffinity: 0.4,
    imageWeight: 0.5, colorSaturation: -0.1, animationIntensity: 0.2,
  },
  fashion: {
    minimalism: 0.4, whitespace: 0.3, contrast: 0.3,
    imageWeight: 0.6, asymmetry: 0.2, novelty: 0.3,
  },
  food: {
    minimalism: -0.1, whitespace: 0.2, colorSaturation: 0.3,
    imageWeight: 0.7, serifAffinity: 0.1, animationIntensity: 0.0,
  },
  tech: {
    minimalism: 0.3, whitespace: 0.2, contrast: 0.4,
    serifAffinity: -0.5, colorSaturation: 0.1, novelty: 0.4,
    animationIntensity: 0.4,
  },
  health: {
    minimalism: 0.2, whitespace: 0.4, contrast: -0.1,
    serifAffinity: 0.1, colorSaturation: -0.2, imageWeight: 0.3,
  },
  lifestyle: {
    minimalism: 0.1, whitespace: 0.3, contrast: 0.1,
    serifAffinity: 0.0, colorSaturation: 0.1, imageWeight: 0.4,
  },
  general: {
    minimalism: 0.0, whitespace: 0.2, contrast: 0.0,
    serifAffinity: 0.0, colorSaturation: 0.0, imageWeight: 0.2,
  },
};

// ============================================================
// Public API
// ============================================================

/**
 * Phase 1: ユーザー入力から意図を解析し、Design DNA目標座標とコンテンツ要件を生成
 * AI不使用 — 完全に決定的
 *
 * 情報の優先度:
 *   1. ユーザーの既存DNA（学習済みの場合）
 *   2. URL分析結果（参考サイトがある場合）
 *   3. トーン + 業種からの推定
 */
export function analyzeIntent(input: DDPNextInput): IntentAnalysis {
  // ── Step 1: コンテンツ要件を構造化 ──
  const contentRequirements = buildContentRequirements(input);

  // ── Step 2: DNA目標座標を計算 ──
  const targetDNA = computeTargetDNA(input, contentRequirements);

  // ── Step 3: 信頼度を算出 ──
  const confidence = computeConfidence(input);

  return {
    targetDNA,
    contentRequirements,
    confidence,
  };
}

// ============================================================
// Internal: コンテンツ要件の構造化
// ============================================================

function buildContentRequirements(input: DDPNextInput): ContentRequirements {
  const {
    pageType,
    industry,
    brandName,
    tones,
    targetAudience,
    userInstructions,
    urlAnalysis,
    brandMemory,
  } = input;

  // ブランドメモリとの統合
  const resolvedBrandName = brandName || brandMemory?.brandName || "Brand";
  const resolvedIndustry = industry || (brandMemory?.industry as IndustryType) || "general";
  const resolvedTones = tones.length > 0
    ? tones
    : (brandMemory?.tones as DesignTone[]) || ["modern"];
  const resolvedAudience = targetAudience || brandMemory?.targetAudience || "";

  // URL分析からの参考情報
  let referenceInsights: ContentRequirements["referenceInsights"];
  if (urlAnalysis) {
    referenceInsights = {
      colors: urlAnalysis.colors,
      fonts: urlAnalysis.fonts,
      layoutPattern: undefined,
      keyFeatures: urlAnalysis.sections?.map((s: any) => s.category) || [],
    };
  }

  return {
    brandName: resolvedBrandName,
    industry: resolvedIndustry,
    pageType,
    tones: resolvedTones,
    targetAudience: resolvedAudience,
    additionalNotes: userInstructions,
    referenceInsights,
  };
}

// ============================================================
// Internal: DNA目標座標の計算
// ============================================================

const DNA_KEYS: (keyof DesignDNAPreferences)[] = [
  "minimalism", "whitespace", "contrast", "animationIntensity",
  "serifAffinity", "colorSaturation", "layoutComplexity",
  "imageWeight", "asymmetry", "novelty",
];

function computeTargetDNA(
  input: DDPNextInput,
  requirements: ContentRequirements,
): DesignDNAPreferences {
  // ── ユーザーの学習済みDNAが最優先 ──
  if (input.userDNA) {
    // 学習済みDNAに業種バイアスを軽く加える（α=0.2）
    const industryBias = INDUSTRY_DNA_BIAS[requirements.industry] || {};
    return blendDNA(input.userDNA, partialToFull(industryBias), 0.8, 0.2);
  }

  // ── トーンからDNA座標を計算 ──
  const toneDNAs = requirements.tones.map((tone) =>
    partialToFull(TONE_DNA_MAP[tone] || {}),
  );
  const avgToneDNA = averageDNA(toneDNAs);

  // ── 業種バイアス ──
  const industryDNA = partialToFull(
    INDUSTRY_DNA_BIAS[requirements.industry] || {},
  );

  // ── URL分析からの補正 ──
  if (input.urlAnalysis) {
    const urlDNA = estimateDNAFromUrlAnalysis(input.urlAnalysis);
    // URL(0.4) + Tone(0.35) + Industry(0.25)
    return blendMultipleDNA([
      { dna: urlDNA, weight: 0.4 },
      { dna: avgToneDNA, weight: 0.35 },
      { dna: industryDNA, weight: 0.25 },
    ]);
  }

  // ── トーン(0.6) + 業種(0.4) ──
  return blendDNA(avgToneDNA, industryDNA, 0.6, 0.4);
}

// ============================================================
// Internal: URL分析からDNA座標を推定
// ============================================================

function estimateDNAFromUrlAnalysis(
  urlAnalysis: UrlAnalysisResult,
): DesignDNAPreferences {
  const dna: Record<string, number> = {};

  // 色数からの推定
  const colorCount = urlAnalysis.colors?.length || 3;
  if (colorCount <= 3) {
    dna.colorSaturation = -0.3;
    dna.minimalism = 0.2;
  } else if (colorCount >= 6) {
    dna.colorSaturation = 0.4;
  }

  // フォント情報からの推定
  const fonts = urlAnalysis.fonts || [];
  const hasSerif = fonts.some(
    (f: string) =>
      f.toLowerCase().includes("serif") &&
      !f.toLowerCase().includes("sans"),
  );
  if (hasSerif) {
    dna.serifAffinity = 0.5;
  }

  // セクション数からの複雑度推定
  const sectionCount = urlAnalysis.sections?.length || 0;
  if (sectionCount > 8) {
    dna.layoutComplexity = (dna.layoutComplexity ?? 0) + 0.3;
  } else if (sectionCount <= 4) {
    dna.minimalism = (dna.minimalism ?? 0) + 0.2;
  }

  // トーンからの追加推定
  if (urlAnalysis.tones?.length > 0) {
    const toneDNAs = urlAnalysis.tones.map((t: string) =>
      partialToFull(TONE_DNA_MAP[t] || {}),
    );
    const avgTone = averageDNA(toneDNAs);
    // URL検出トーンを0.3の重みでブレンド
    for (const key of DNA_KEYS) {
      dna[key] = (dna[key] ?? 0) * 0.7 + avgTone[key] * 0.3;
    }
  }

  return partialToFull(dna);
}

// ============================================================
// Internal: 信頼度計算
// ============================================================

function computeConfidence(input: DDPNextInput): number {
  let score = 0.3; // ベースライン

  // 学習済みDNAがある場合は高信頼
  if (input.userDNA) score += 0.3;

  // URL分析がある場合
  if (input.urlAnalysis) score += 0.2;

  // トーンが指定されている場合
  if (input.tones.length > 0) score += 0.1;

  // ブランドメモリがある場合
  if (input.brandMemory) score += 0.1;

  return Math.min(1.0, score);
}

// ============================================================
// DNA演算ヘルパー
// ============================================================

/** 部分DNAを完全DNAに変換（未指定=0） */
function partialToFull(
  partial: Partial<DesignDNAPreferences>,
): DesignDNAPreferences {
  const result: Record<string, number> = {};
  for (const key of DNA_KEYS) {
    result[key] = partial[key] ?? 0;
  }
  return result as unknown as DesignDNAPreferences;
}

/** 2つのDNAを重み付きブレンド */
function blendDNA(
  a: DesignDNAPreferences,
  b: DesignDNAPreferences,
  weightA: number,
  weightB: number,
): DesignDNAPreferences {
  const result: Record<string, number> = {};
  for (const key of DNA_KEYS) {
    result[key] = Math.max(
      -1,
      Math.min(1, a[key] * weightA + b[key] * weightB),
    );
  }
  return result as unknown as DesignDNAPreferences;
}

/** 複数DNAの重み付き平均 */
function blendMultipleDNA(
  entries: Array<{ dna: DesignDNAPreferences; weight: number }>,
): DesignDNAPreferences {
  const result: Record<string, number> = {};
  for (const key of DNA_KEYS) {
    let sum = 0;
    let totalWeight = 0;
    for (const { dna, weight } of entries) {
      sum += dna[key] * weight;
      totalWeight += weight;
    }
    result[key] = Math.max(-1, Math.min(1, sum / totalWeight));
  }
  return result as unknown as DesignDNAPreferences;
}

/** DNA配列の平均 */
function averageDNA(dnas: DesignDNAPreferences[]): DesignDNAPreferences {
  if (dnas.length === 0) return partialToFull({});
  if (dnas.length === 1) return dnas[0];

  const result: Record<string, number> = {};
  for (const key of DNA_KEYS) {
    const values = dnas.map((d) => d[key]);
    result[key] = values.reduce((a, b) => a + b, 0) / values.length;
  }
  return result as unknown as DesignDNAPreferences;
}
