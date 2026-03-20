// ============================================================
// Aicata ACE — Statistics & Section Registry Integration
// セクションレジストリからACE統計情報を計算する
// ============================================================

import {
  getAllSections,
  getSectionsByCategory,
  getCategorySummary,
} from "../design-engine/knowledge/sections/registry";
import { getAtomCount } from "./atoms/registry";
import { getBlockCount } from "./blocks/registry";
import type { ACEStatsResponse } from "./types";

// ============================================================
// Section Decomposition Tracking
// ============================================================

/**
 * セクションがAtomic分解済みかどうかを判定する
 * 将来的にはSectionBlueprintのblueprintフィールドで判定
 * 現在はハードコードした初期分解リストで管理
 */
const DECOMPOSED_SECTIONS: Record<string, string[]> = {
  hero: [
    "hero-minimal-centered",
    "hero-split-image",
    "hero-fullscreen-video",
  ],
  products: [
    "products-card-grid",
    "products-featured-single",
  ],
  features: [
    "features-icon-grid",
  ],
  navigation: [
    "nav-minimal-sticky",
  ],
  footer: [
    "footer-elegant-columns",
  ],
};

// ============================================================
// ACE Statistics Calculator
// ============================================================

/**
 * ACEの現在の統計情報を取得する
 */
export function getACEStats(): ACEStatsResponse {
  const allSections = getAllSections();
  const categorySummaryArray = getCategorySummary();
  // Array → Record変換
  const categorySummary: Record<string, number> = {};
  for (const { category, count } of categorySummaryArray) {
    categorySummary[category] = count;
  }

  // Atom/Block レジストリから実カウントを取得
  const atomCount = getAtomCount();
  const blockCount = getBlockCount();
  const sectionCount = allSections.length;

  // カテゴリ別の分解進捗
  const decompositionProgress = calculateDecompositionProgress(categorySummary);

  return {
    atomCount,
    blockCount,
    sectionCount,
    compositionPossibilities: atomCount * blockCount * sectionCount,
    decompositionProgress,
  };
}

/**
 * カテゴリ別のAtomic分解進捗を計算
 */
function calculateDecompositionProgress(
  categorySummary: Record<string, number>,
): ACEStatsResponse["decompositionProgress"] {
  const progress: ACEStatsResponse["decompositionProgress"] = [];

  // 主要カテゴリの分解進捗
  const categoryGroups: Record<string, string[]> = {
    "Hero系": ["hero"],
    "Products系": ["products", "product-gallery", "product-info", "product-description", "product-reviews", "related-products"],
    "Features系": ["features", "philosophy", "story"],
    "Navigation系": ["navigation", "announcement", "breadcrumb", "search"],
    "Footer系": ["footer"],
    "Collection系": ["collection-banner", "collection-grid", "collection-filter", "collection-list"],
    "Cart系": ["cart-items", "cart-summary", "cart-upsell"],
    "その他": ["testimonial", "cta", "newsletter", "gallery", "editorial", "faq", "slideshow", "image-with-text", "multicolumn", "video", "contact-form", "social-proof", "trust-badges", "blog-grid", "article-content", "recently-viewed"],
  };

  for (const [groupName, categories] of Object.entries(categoryGroups)) {
    let total = 0;
    let done = 0;

    for (const cat of categories) {
      const count = categorySummary[cat] || 0;
      total += count;

      // 分解済みセクションをカウント
      const decomposed = DECOMPOSED_SECTIONS[cat] || [];
      done += decomposed.length;
    }

    if (total > 0) {
      progress.push({ category: groupName, total, done });
    }
  }

  return progress;
}

/**
 * 特定セクションが分解済みかどうか
 */
export function isSectionDecomposed(sectionId: string): boolean {
  for (const sections of Object.values(DECOMPOSED_SECTIONS)) {
    if (sections.includes(sectionId)) return true;
  }
  return false;
}

/**
 * 全分解済みセクションIDの一覧
 */
export function getDecomposedSectionIds(): string[] {
  const ids: string[] = [];
  for (const sections of Object.values(DECOMPOSED_SECTIONS)) {
    ids.push(...sections);
  }
  return ids;
}
