// ============================================================
// DDP Next — Composition Engine
// Phase 2: テンプレート選定 + Phase 3: ページ組立
//
// AI不使用。純粋な数学的選定と決定的組立。
// ============================================================

import type { DesignDNAPreferences } from "@/lib/ace-adis/types";
import { calculateDNASimilarity } from "@/lib/ace-adis/design-dna-engine";
import {
  getAllSections,
  getSectionById,
  getRequiredCategoriesForPageType,
  getSectionsByCategory,
} from "@/lib/design-engine/knowledge/sections/registry";
import { getAllTemplates } from "@/lib/design-engine/template-selector";
import { assemblePage, assembleFullHtml } from "@/lib/design-engine/page-assembler";
import type {
  PageTemplate,
  SectionTemplate,
  SectionCategory,
  DesignTokenSet,
} from "@/lib/design-engine/types";
import type {
  IntentAnalysis,
  CompositionPlan,
  ResolvedSection,
  AssembledPage,
} from "./types";
import { computeHQSComposite } from "./types";
import { getSectionMeta, getAllSectionMeta } from "./section-meta";

// ============================================================
// Phase 2: テンプレート & セクション選定
// ============================================================

/** テンプレートスコアリングの重み */
const WEIGHTS = {
  dnaSimilarity: 0.35,  // DNA空間での距離
  industryMatch: 0.25,  // 業種の一致
  toneMatch: 0.20,      // トーンの一致
  hqsScore: 0.20,       // HQSの高さ
};

/** 業種の親和性マップ */
const INDUSTRY_AFFINITY: Record<string, string[]> = {
  beauty: ["lifestyle", "health"],
  food: ["lifestyle"],
  fashion: ["lifestyle", "beauty"],
  lifestyle: ["beauty", "food", "fashion"],
  tech: [],
  health: ["beauty", "lifestyle"],
  general: ["lifestyle"],
};

/**
 * Phase 2: 最適なテンプレートとセクション構成を選定
 * AI不使用 — 純粋な距離計算とスコアリング
 */
export function composePagePlan(
  intent: IntentAnalysis,
): CompositionPlan {
  const { targetDNA, contentRequirements } = intent;
  const { industry, pageType, tones } = contentRequirements;

  // ── Step 1: 全テンプレートをスコアリング ──
  const templates = getAllTemplates();
  const scored = templates
    .filter((t) => {
      // ページタイプが一致するもののみ
      if (t.pageType === pageType) return true;
      if (pageType === "landing" && t.pageType === "general") return true;
      if (pageType === "general" && t.pageType === "landing") return true;
      return false;
    })
    .map((template) => {
      const score = scoreTemplate(template, targetDNA, industry, tones);
      return { template, score };
    })
    .sort((a, b) => b.score.total - a.score.total);

  if (scored.length === 0) {
    // フォールバック: ページタイプフィルターなしで再試行
    const allScored = templates
      .map((template) => ({
        template,
        score: scoreTemplate(template, targetDNA, industry, tones),
      }))
      .sort((a, b) => b.score.total - a.score.total);
    scored.push(...allScored.slice(0, 3));
  }

  const best = scored[0];
  const reasons = buildReasons(best.score, best.template);

  // ── Step 2: セクション構成を解決 ──
  const sections = resolveSections(
    best.template,
    targetDNA,
    pageType,
  );

  return {
    template: best.template,
    templateScore: best.score.total,
    reasons,
    sections,
    designTokens: best.template.designTokens,
  };
}

/** テンプレートのスコアリング */
interface TemplateScoreBreakdown {
  total: number;
  dnaSimilarity: number;
  industryMatch: number;
  toneMatch: number;
  hqsScore: number;
}

function scoreTemplate(
  template: PageTemplate,
  targetDNA: DesignDNAPreferences,
  industry: string,
  tones: string[],
): TemplateScoreBreakdown {
  // DNA類似度 (0-1)
  const templateDNA = estimateTemplateDNA(template);
  const dnaSimilarity = calculateDNASimilarity(targetDNA, templateDNA);

  // 業種マッチ (0-1)
  let industryMatch = 0;
  if (template.industries.includes(industry as any)) {
    industryMatch = 1.0;
  } else if (INDUSTRY_AFFINITY[industry]?.some((a) => template.industries.includes(a as any))) {
    industryMatch = 0.5;
  } else if (industry === "general" || template.industries.includes("general" as any)) {
    industryMatch = 0.3;
  }

  // トーンマッチ (0-1)
  const matchedTones = tones.filter((t) => template.tones.includes(t as any));
  const toneMatch = tones.length > 0
    ? matchedTones.length / Math.max(tones.length, template.tones.length)
    : 0.3;

  // HQSスコア (0-1) — テンプレート内セクションのHQS平均を0-1に正規化
  const sectionMetas = template.sections
    .map((ref) => getSectionMeta(ref.sectionId))
    .filter(Boolean);
  const avgHQS = sectionMetas.length > 0
    ? sectionMetas.reduce((sum, m) => sum + computeHQSComposite(m!.hqs), 0) / sectionMetas.length
    : 3.0;
  const hqsScore = Math.min(1.0, (avgHQS - 1.0) / 4.0); // 1-5 → 0-1

  const total =
    WEIGHTS.dnaSimilarity * dnaSimilarity +
    WEIGHTS.industryMatch * industryMatch +
    WEIGHTS.toneMatch * toneMatch +
    WEIGHTS.hqsScore * hqsScore;

  return { total, dnaSimilarity, industryMatch, toneMatch, hqsScore };
}

/** テンプレートのトーンからDNA座標を推定 */
function estimateTemplateDNA(template: PageTemplate): DesignDNAPreferences {
  // テンプレートに紐づくセクションのDNAを平均
  const sectionDNAs = template.sections
    .map((ref) => getSectionMeta(ref.sectionId))
    .filter(Boolean)
    .map((m) => m!.dna);

  if (sectionDNAs.length === 0) {
    // フォールバック: トーンからDNAを推定（既存のscoreTemplateAlignmentロジック）
    return toneBasedDNA(template.tones);
  }

  const result: Record<string, number> = {};
  const keys: (keyof DesignDNAPreferences)[] = [
    "minimalism", "whitespace", "contrast", "animationIntensity",
    "serifAffinity", "colorSaturation", "layoutComplexity",
    "imageWeight", "asymmetry", "novelty",
  ];

  for (const key of keys) {
    const values = sectionDNAs.map((d) => d[key] ?? 0);
    result[key] = values.reduce((a, b) => a + b, 0) / values.length;
  }

  return result as unknown as DesignDNAPreferences;
}

/** トーン名からDNA座標を推定 */
function toneBasedDNA(tones: string[]): DesignDNAPreferences {
  const TONE_MAP: Record<string, Partial<DesignDNAPreferences>> = {
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

  const result: Record<string, number> = {};
  const keys: (keyof DesignDNAPreferences)[] = [
    "minimalism", "whitespace", "contrast", "animationIntensity",
    "serifAffinity", "colorSaturation", "layoutComplexity",
    "imageWeight", "asymmetry", "novelty",
  ];

  for (const key of keys) {
    const values = tones.map((t) => TONE_MAP[t]?.[key] ?? 0);
    result[key] = tones.length > 0
      ? Math.max(-1, Math.min(1, values.reduce((a, b) => a + b, 0) / tones.length))
      : 0;
  }

  return result as unknown as DesignDNAPreferences;
}

/** テンプレートのセクション構成を解決 */
function resolveSections(
  template: PageTemplate,
  targetDNA: DesignDNAPreferences,
  pageType: string,
): ResolvedSection[] {
  const resolved: ResolvedSection[] = [];

  for (const ref of template.sections) {
    const section = getSectionById(ref.sectionId);
    if (!section) continue;

    const meta = getSectionMeta(ref.sectionId);
    const hqsComposite = meta ? computeHQSComposite(meta.hqs) : 3.0;

    // DNA距離の計算 (0=完全一致, 1=完全不一致)
    const sectionDNA = meta?.dna
      ? fillDNA(meta.dna)
      : toneBasedDNA(section.tones);
    const similarity = calculateDNASimilarity(targetDNA, sectionDNA);
    const dnaDistance = 1 - similarity;

    resolved.push({
      template: section,
      order: ref.order,
      hqsComposite,
      dnaDistance,
    });
  }

  return resolved.sort((a, b) => a.order - b.order);
}

/** 部分的なDNAを完全なDNAに埋める */
function fillDNA(partial: Partial<DesignDNAPreferences>): DesignDNAPreferences {
  return {
    minimalism: partial.minimalism ?? 0,
    whitespace: partial.whitespace ?? 0,
    contrast: partial.contrast ?? 0,
    animationIntensity: partial.animationIntensity ?? 0,
    serifAffinity: partial.serifAffinity ?? 0,
    colorSaturation: partial.colorSaturation ?? 0,
    layoutComplexity: partial.layoutComplexity ?? 0,
    imageWeight: partial.imageWeight ?? 0,
    asymmetry: partial.asymmetry ?? 0,
    novelty: partial.novelty ?? 0,
  };
}

/** スコアから選定理由を生成 */
function buildReasons(
  score: TemplateScoreBreakdown,
  template: PageTemplate,
): string[] {
  const reasons: string[] = [];
  if (score.dnaSimilarity > 0.7) reasons.push("デザインDNA座標が高く一致");
  if (score.industryMatch >= 1.0) reasons.push(`業種「${template.industries[0]}」が完全一致`);
  else if (score.industryMatch >= 0.5) reasons.push("関連業種として親和性あり");
  if (score.toneMatch > 0.5) reasons.push(`トーン「${template.tones.join(", ")}」が一致`);
  if (score.hqsScore > 0.7) reasons.push("人間品質スコア(HQS)が高評価");
  return reasons;
}

// ============================================================
// Phase 3: ページ組立
// ============================================================

/**
 * Phase 3: 選定されたコンポーネントからページを組み立てる
 * AI不使用 — 完全に決定的
 */
export function assembleComposedPage(plan: CompositionPlan): AssembledPage {
  // page-assembler の assemblePage を使用（font links + reset CSS + token CSS + sections を結合）
  const result = assemblePage(plan.template);

  // assembleFullHtml でフルHTML文書を生成
  const fullDocument = assembleFullHtml(plan.template);

  // プレースホルダー一覧を抽出（{{BRAND_NAME}} 形式）
  const placeholderRegex = /\{\{([A-Z][A-Z0-9_]*)\}\}/g;
  const placeholders: string[] = [];
  const combined = result.html + result.css;
  let match;
  while ((match = placeholderRegex.exec(combined)) !== null) {
    if (!placeholders.includes(match[0])) {
      placeholders.push(match[0]);
    }
  }

  return {
    html: result.html,
    css: result.css,
    fullDocument,
    placeholders,
    meta: {
      templateId: plan.template.id,
      sectionCount: plan.sections.length,
      fontLinks: "",  // assembleFullHtml に含まれる
    },
  };
}
