// ============================================================
// Aicata Design Engine — Template Selector (Gen-3)
// DesignContext + (任意)UrlAnalysis から最適テンプレートを選択
// ============================================================

import type {
  DesignContext,
  PageTemplate,
  TemplateMatch,
  UrlAnalysisResult,
  IndustryType,
  DesignTone,
  PageType,
  SectionCategory,
} from "./types";

// --- Page Templates: Landing ---
import { LUXURY_BEAUTY_TOP } from "./knowledge/templates/luxury-beauty-top";
import { NATURAL_ORGANIC_TOP } from "./knowledge/templates/natural-organic-top";
import { MINIMAL_FASHION_TOP } from "./knowledge/templates/minimal-fashion-top";
import { BOLD_TECH_TOP } from "./knowledge/templates/bold-tech-top";
// --- Page Templates: Product ---
import { LUXURY_BEAUTY_PRODUCT } from "./knowledge/templates/luxury-beauty-product";
import { MINIMAL_FASHION_PRODUCT } from "./knowledge/templates/minimal-fashion-product";
import { BOLD_TECH_PRODUCT } from "./knowledge/templates/bold-tech-product";
// --- Page Templates: Collection ---
import { LUXURY_BEAUTY_COLLECTION } from "./knowledge/templates/luxury-beauty-collection";
import { MINIMAL_FASHION_COLLECTION } from "./knowledge/templates/minimal-fashion-collection";
// --- Page Templates: Cart ---
import { STANDARD_CART } from "./knowledge/templates/standard-cart";
// --- Page Templates: About / Blog / Article / Contact / 404 / Search ---
import { GENERAL_ABOUT } from "./knowledge/templates/general-about";
import { GENERAL_BLOG } from "./knowledge/templates/general-blog";
import { GENERAL_ARTICLE } from "./knowledge/templates/general-article";
import { GENERAL_CONTACT } from "./knowledge/templates/general-contact";
import { GENERAL_404 } from "./knowledge/templates/general-404";
import { GENERAL_SEARCH } from "./knowledge/templates/general-search";
// --- Page Templates: List-Collections / Account / Password / General ---
import { GENERAL_LIST_COLLECTIONS } from "./knowledge/templates/general-list-collections";
import { GENERAL_ACCOUNT } from "./knowledge/templates/general-account";
import { GENERAL_PASSWORD } from "./knowledge/templates/general-password";
import { GENERAL_PAGE } from "./knowledge/templates/general-page";

// ============================================================
// テンプレートレジストリ（ページテンプレート一覧）
// 新しいテンプレートを追加する際はここに追加するだけ
// ============================================================

const PAGE_TEMPLATES: PageTemplate[] = [
  // Landing (4)
  LUXURY_BEAUTY_TOP,
  NATURAL_ORGANIC_TOP,
  MINIMAL_FASHION_TOP,
  BOLD_TECH_TOP,
  // Product (3)
  LUXURY_BEAUTY_PRODUCT,
  MINIMAL_FASHION_PRODUCT,
  BOLD_TECH_PRODUCT,
  // Collection (2)
  LUXURY_BEAUTY_COLLECTION,
  MINIMAL_FASHION_COLLECTION,
  // Cart (1)
  STANDARD_CART,
  // About (1)
  GENERAL_ABOUT,
  // Blog (1)
  GENERAL_BLOG,
  // Article (1)
  GENERAL_ARTICLE,
  // Contact (1)
  GENERAL_CONTACT,
  // 404 (1)
  GENERAL_404,
  // Search (1)
  GENERAL_SEARCH,
  // List Collections (1)
  GENERAL_LIST_COLLECTIONS,
  // Account (1)
  GENERAL_ACCOUNT,
  // Password (1)
  GENERAL_PASSWORD,
  // General (1)
  GENERAL_PAGE,
];

// ============================================================
// スコアリングウェイト
// ============================================================

const WEIGHTS = {
  industry: 0.30,
  tone: 0.25,
  pageType: 0.25,
  urlStructure: 0.20,
} as const;

// 業界の関連性マップ（直接一致でなくても部分スコアを与える）
const INDUSTRY_AFFINITY: Partial<Record<IndustryType, IndustryType[]>> = {
  beauty: ["lifestyle", "health"],
  food: ["lifestyle"],
  fashion: ["lifestyle", "beauty"],
  lifestyle: ["beauty", "food", "fashion"],
  tech: [],
  health: ["beauty", "lifestyle"],
};

// ============================================================
// Public API
// ============================================================

/**
 * DesignContext（+ 任意のURL解析結果）から最適なページテンプレートを選択
 *
 * @returns スコア降順のTemplateMatch配列（limit件まで）
 */
export function selectBestTemplates(
  context: DesignContext,
  urlAnalysis?: UrlAnalysisResult,
  limit: number = 3,
): TemplateMatch[] {
  const matches: TemplateMatch[] = PAGE_TEMPLATES.map((template) => {
    const reasons: string[] = [];

    // 1. 業界スコア
    const industryScore = scoreIndustry(
      context.industry,
      template.industries,
      reasons,
    );

    // 2. トーンスコア
    const toneScore = scoreTone(context.tones, template.tones, reasons);

    // 3. ページタイプスコア
    const pageTypeScore = scorePageType(
      context.pageType,
      template.pageType,
      reasons,
    );

    // 4. URL構造類似度（URL解析がある場合のみ）
    const urlScore = urlAnalysis
      ? scoreUrlStructure(urlAnalysis, template, reasons)
      : 0;

    // 重み付き合計
    const hasUrl = !!urlAnalysis;
    const totalWeight = hasUrl
      ? WEIGHTS.industry + WEIGHTS.tone + WEIGHTS.pageType + WEIGHTS.urlStructure
      : WEIGHTS.industry + WEIGHTS.tone + WEIGHTS.pageType;

    const rawScore = hasUrl
      ? WEIGHTS.industry * industryScore +
        WEIGHTS.tone * toneScore +
        WEIGHTS.pageType * pageTypeScore +
        WEIGHTS.urlStructure * urlScore
      : WEIGHTS.industry * industryScore +
        WEIGHTS.tone * toneScore +
        WEIGHTS.pageType * pageTypeScore;

    const score = rawScore / totalWeight;

    return { template, score: Math.round(score * 100) / 100, reasons };
  });

  // スコア降順ソート
  matches.sort((a, b) => b.score - a.score);

  return matches.slice(0, limit);
}

/**
 * 最適な1つのテンプレートを返す（ショートカット）
 */
export function selectBestTemplate(
  context: DesignContext,
  urlAnalysis?: UrlAnalysisResult,
): TemplateMatch {
  const matches = selectBestTemplates(context, urlAnalysis, 1);
  return matches[0];
}

// ============================================================
// スコアリング関数
// ============================================================

function scoreIndustry(
  requested: IndustryType,
  templateIndustries: IndustryType[],
  reasons: string[],
): number {
  // 完全一致
  if (templateIndustries.includes(requested)) {
    reasons.push(`業種「${requested}」に完全一致`);
    return 1.0;
  }

  // 関連業種で部分一致
  const affinities = INDUSTRY_AFFINITY[requested] || [];
  const hasAffinity = templateIndustries.some((t) => affinities.includes(t));
  if (hasAffinity) {
    reasons.push(`業種「${requested}」に関連する業種をカバー`);
    return 0.5;
  }

  // general は弱い一致
  if (requested === "general") {
    return 0.3;
  }

  return 0;
}

function scoreTone(
  requestedTones: DesignTone[],
  templateTones: DesignTone[],
  reasons: string[],
): number {
  if (requestedTones.length === 0) return 0.3; // デフォルト

  const matchCount = requestedTones.filter((t) =>
    templateTones.includes(t),
  ).length;

  const maxLen = Math.max(requestedTones.length, templateTones.length);
  const score = matchCount / maxLen;

  if (matchCount > 0) {
    const matched = requestedTones.filter((t) => templateTones.includes(t));
    reasons.push(`トーン「${matched.join("・")}」が一致`);
  }

  return score;
}

function scorePageType(
  requested: PageType,
  templatePageType: PageType,
  reasons: string[],
): number {
  if (requested === templatePageType) {
    reasons.push(`ページタイプ「${requested}」が一致`);
    return 1.0;
  }

  // landing と general は互換性あり
  if (
    (requested === "landing" && templatePageType === "general") ||
    (requested === "general" && templatePageType === "landing")
  ) {
    return 0.6;
  }

  // blog と article は関連性あり
  if (
    (requested === "blog" && templatePageType === "article") ||
    (requested === "article" && templatePageType === "blog")
  ) {
    return 0.4;
  }

  // list-collections は collection の派生
  if (
    (requested === "list-collections" && templatePageType === "collection") ||
    (requested === "collection" && templatePageType === "list-collections")
  ) {
    return 0.5;
  }

  return 0;
}

function scoreUrlStructure(
  urlAnalysis: UrlAnalysisResult,
  template: PageTemplate,
  reasons: string[],
): number {
  // URL解析で検出されたセクション構成とテンプレートのセクション構成を比較
  const urlCategories = new Set(
    urlAnalysis.sections.map((s) => s.category),
  );
  const templateCategories = new Set(
    template.sections.map((ref) => {
      // sectionIdからカテゴリを推定（"nav-elegant-dropdown" → "navigation"的なマッピング）
      const parts = ref.sectionId.split("-");
      return parts[0] as SectionCategory;
    }),
  );

  // 共通カテゴリ数 / 全ユニークカテゴリ数
  const allCategories = new Set([...urlCategories, ...templateCategories]);
  let matchCount = 0;
  for (const cat of urlCategories) {
    if (templateCategories.has(cat)) matchCount++;
  }

  const score = allCategories.size > 0 ? matchCount / allCategories.size : 0;

  if (matchCount > 0) {
    reasons.push(`URL構造と${matchCount}セクションカテゴリが一致`);
  }

  return score;
}
