// ============================================================
// Aicata Design Engine — Section Template Registry
// 全セクションテンプレートを一元管理するレジストリ
// ============================================================

import type {
  SectionTemplate,
  SectionCategory,
  SectionVariant,
  DesignTone,
} from "../../types";

// --- Navigation (6) ---
import { NAV_ELEGANT_DROPDOWN } from "./navigation/elegant-dropdown";
import { NAV_MINIMAL_STICKY } from "./navigation/minimal-sticky";
import { NAV_TRANSPARENT_OVERLAY } from "./navigation/transparent-overlay";
import { NAV_MEGA_MENU } from "./navigation/mega-menu";
import { NAV_SIDE_DRAWER } from "./navigation/side-drawer";
import { NAV_CATEGORY_TABS } from "./navigation/category-tabs";

// --- Announcement (1) ---
import { ANNOUNCEMENT_TOP_BAR } from "./announcement/top-bar";

// --- Breadcrumb (1) ---
import { BREADCRUMB_SIMPLE_PATH } from "./breadcrumb/simple-path";

// --- Search (1) ---
import { SEARCH_PREDICTIVE_OVERLAY } from "./search/predictive-overlay";

// --- Hero (5) ---
import { HERO_SPLIT_IMAGE } from "./hero/split-image";
import { HERO_FULLSCREEN_VISUAL } from "./hero/fullscreen-visual";
import { HERO_MINIMAL_CENTERED } from "./hero/minimal-centered";
import { HERO_VIDEO_BACKGROUND } from "./hero/video-background";
import { HERO_ORGANIC_FLOWING } from "./hero/organic-flowing";

// --- Products (トップページ用) (4) ---
import { PRODUCTS_CARD_GRID } from "./products/card-grid";
import { PRODUCTS_FEATURED_SINGLE } from "./products/featured-single";
import { PRODUCTS_MASONRY_GRID } from "./products/masonry-grid";
import { PRODUCTS_HORIZONTAL_SCROLL } from "./products/horizontal-scroll";

// --- Product Gallery (商品詳細用) (2) ---
import { PRODUCT_GALLERY_THUMBNAIL_SLIDER } from "./product-gallery/thumbnail-slider";
import { PRODUCT_GALLERY_GRID_LAYOUT } from "./product-gallery/grid-layout";

// --- Product Info (商品詳細用) (1) ---
import { PRODUCT_INFO_CLASSIC_VERTICAL } from "./product-info/classic-vertical";

// --- Product Description (商品詳細用) (1) ---
import { PRODUCT_DESCRIPTION_TABBED } from "./product-description/tabbed-content";

// --- Product Reviews (商品詳細用) (1) ---
import { PRODUCT_REVIEWS_STAR_RATING } from "./product-reviews/star-rating-list";

// --- Related Products (商品詳細用) (1) ---
import { RELATED_PRODUCTS_CARD_SCROLL } from "./related-products/card-scroll";

// --- Collection Banner (2) ---
import { COLLECTION_BANNER_HERO_IMAGE } from "./collection-banner/hero-image";
import { COLLECTION_BANNER_MINIMAL_TEXT } from "./collection-banner/minimal-text";

// --- Collection Grid (1) ---
import { COLLECTION_GRID_FILTERABLE } from "./collection-grid/filterable-grid";

// --- Collection Filter (1) ---
import { COLLECTION_FILTER_SIDEBAR } from "./collection-filter/sidebar-accordion";

// --- Collection List (1) ---
import { COLLECTION_LIST_CARD_GRID } from "./collection-list/card-grid";

// --- Cart (2) ---
import { CART_ITEMS_LINE_LIST } from "./cart-items/line-item-list";
import { CART_SUMMARY_ORDER_TOTAL } from "./cart-summary/order-total";

// --- Story (3) ---
import { STORY_SPLIT_TEXT_IMAGE } from "./story/split-text-image";
import { STORY_FULL_BLEED_IMAGE } from "./story/full-bleed-image";
import { STORY_TIMELINE_VERTICAL } from "./story/timeline-vertical";

// --- Features (3) ---
import { FEATURES_ICON_GRID } from "./features/icon-grid";
import { FEATURES_STATS_COUNTER } from "./features/stats-counter";
import { FEATURES_IMAGE_CARDS } from "./features/image-cards";

// --- CTA (2) ---
import { CTA_NEWSLETTER_MINIMAL } from "./cta/newsletter-minimal";
import { CTA_BOLD_SPLIT } from "./cta/bold-split";

// --- Testimonial (2) ---
import { TESTIMONIAL_QUOTE_SINGLE } from "./testimonial/quote-single";
import { TESTIMONIAL_CAROUSEL_MULTI } from "./testimonial/carousel-multi";

// --- Gallery (1) ---
import { GALLERY_LIGHTBOX_GRID } from "./gallery/lightbox-grid";

// --- Footer (2) ---
import { FOOTER_ELEGANT_COLUMNS } from "./footer/elegant-columns";
import { FOOTER_MINIMAL_CENTERED } from "./footer/minimal-centered";

// --- Trust & Social (2) ---
import { TRUST_BADGES_ICON_STRIP } from "./trust-badges/icon-strip";
import { SOCIAL_PROOF_INSTAGRAM } from "./social-proof/instagram-feed";

// --- Contact (1) ---
import { CONTACT_FORM_ELEGANT_SPLIT } from "./contact-form/elegant-split";

// ============================================================
// Registry — 全セクションの配列 (47セクション)
// ============================================================

const ALL_SECTIONS: SectionTemplate[] = [
  // ── グローバルコンポーネント ──
  // Navigation (6)
  NAV_ELEGANT_DROPDOWN,
  NAV_MINIMAL_STICKY,
  NAV_TRANSPARENT_OVERLAY,
  NAV_MEGA_MENU,
  NAV_SIDE_DRAWER,
  NAV_CATEGORY_TABS,
  // Announcement (1)
  ANNOUNCEMENT_TOP_BAR,
  // Breadcrumb (1)
  BREADCRUMB_SIMPLE_PATH,
  // Search (1)
  SEARCH_PREDICTIVE_OVERLAY,

  // ── トップページ/LP ──
  // Hero (5)
  HERO_SPLIT_IMAGE,
  HERO_FULLSCREEN_VISUAL,
  HERO_MINIMAL_CENTERED,
  HERO_VIDEO_BACKGROUND,
  HERO_ORGANIC_FLOWING,
  // Products — トップページ用 (4)
  PRODUCTS_CARD_GRID,
  PRODUCTS_FEATURED_SINGLE,
  PRODUCTS_MASONRY_GRID,
  PRODUCTS_HORIZONTAL_SCROLL,
  // Story (3)
  STORY_SPLIT_TEXT_IMAGE,
  STORY_FULL_BLEED_IMAGE,
  STORY_TIMELINE_VERTICAL,
  // Features (3)
  FEATURES_ICON_GRID,
  FEATURES_STATS_COUNTER,
  FEATURES_IMAGE_CARDS,
  // CTA (2)
  CTA_NEWSLETTER_MINIMAL,
  CTA_BOLD_SPLIT,
  // Testimonial (2)
  TESTIMONIAL_QUOTE_SINGLE,
  TESTIMONIAL_CAROUSEL_MULTI,
  // Gallery (1)
  GALLERY_LIGHTBOX_GRID,

  // ── 商品詳細ページ ──
  // Product Gallery (2)
  PRODUCT_GALLERY_THUMBNAIL_SLIDER,
  PRODUCT_GALLERY_GRID_LAYOUT,
  // Product Info (1)
  PRODUCT_INFO_CLASSIC_VERTICAL,
  // Product Description (1)
  PRODUCT_DESCRIPTION_TABBED,
  // Product Reviews (1)
  PRODUCT_REVIEWS_STAR_RATING,
  // Related Products (1)
  RELATED_PRODUCTS_CARD_SCROLL,

  // ── コレクション/カテゴリーページ ──
  // Collection Banner (2)
  COLLECTION_BANNER_HERO_IMAGE,
  COLLECTION_BANNER_MINIMAL_TEXT,
  // Collection Grid (1)
  COLLECTION_GRID_FILTERABLE,
  // Collection Filter (1)
  COLLECTION_FILTER_SIDEBAR,
  // Collection List (1)
  COLLECTION_LIST_CARD_GRID,

  // ── カートページ ──
  // Cart (2)
  CART_ITEMS_LINE_LIST,
  CART_SUMMARY_ORDER_TOTAL,

  // ── 汎用コンポーネント ──
  // Footer (2)
  FOOTER_ELEGANT_COLUMNS,
  FOOTER_MINIMAL_CENTERED,
  // Trust & Social (2)
  TRUST_BADGES_ICON_STRIP,
  SOCIAL_PROOF_INSTAGRAM,
  // Contact (1)
  CONTACT_FORM_ELEGANT_SPLIT,
];

// ID → SectionTemplate のルックアップマップ
const SECTION_MAP = new Map<string, SectionTemplate>(
  ALL_SECTIONS.map((s) => [s.id, s]),
);

// ============================================================
// Public API
// ============================================================

/** 全セクションテンプレートを取得 */
export function getAllSections(): SectionTemplate[] {
  return ALL_SECTIONS;
}

/** IDでセクションを取得 */
export function getSectionById(id: string): SectionTemplate | undefined {
  return SECTION_MAP.get(id);
}

/** カテゴリでフィルタ */
export function getSectionsByCategory(
  category: SectionCategory,
): SectionTemplate[] {
  return ALL_SECTIONS.filter((s) => s.category === category);
}

/** 複合検索 */
export function searchSections(query: {
  category?: SectionCategory;
  variant?: SectionVariant;
  tone?: DesignTone;
}): SectionTemplate[] {
  return ALL_SECTIONS.filter((s) => {
    if (query.category && s.category !== query.category) return false;
    if (query.variant && s.variant !== query.variant) return false;
    if (query.tone && !s.tones.includes(query.tone)) return false;
    return true;
  });
}

/** ページタイプに必要なセクションカテゴリを返す */
export function getRequiredCategoriesForPageType(
  pageType: string,
): SectionCategory[] {
  switch (pageType) {
    case "landing":
      return [
        "navigation",
        "hero",
        "products",
        "features",
        "testimonial",
        "cta",
        "footer",
      ];
    case "product":
      return [
        "navigation",
        "breadcrumb",
        "product-gallery",
        "product-info",
        "product-description",
        "product-reviews",
        "related-products",
        "footer",
      ];
    case "collection":
      return [
        "navigation",
        "breadcrumb",
        "collection-banner",
        "collection-grid",
        "footer",
      ];
    case "cart":
      return ["navigation", "breadcrumb", "cart-items", "cart-summary", "footer"];
    default:
      return ["navigation", "footer"];
  }
}

/** カテゴリ一覧（セクション数付き） */
export function getCategorySummary(): Array<{
  category: SectionCategory;
  count: number;
}> {
  const counts = new Map<SectionCategory, number>();
  for (const s of ALL_SECTIONS) {
    counts.set(s.category, (counts.get(s.category) || 0) + 1);
  }
  return Array.from(counts.entries()).map(([category, count]) => ({
    category,
    count,
  }));
}
