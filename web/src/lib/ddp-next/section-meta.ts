// ============================================================
// DDP Next — Section Metadata Registry
// HQS初期スコア + DNA座標を全47セクションに付与
//
// これらのスコアはCurator評価によって随時更新される。
// 初期値は設計意図とトーンから推定した暫定スコア。
// ============================================================

import type { SectionMeta } from "./types";
import type { DesignDNAPreferences } from "@/lib/ace-adis/types";
import type { SectionCategory } from "@/lib/design-engine/types";

// ── DNA座標ヘルパー ──

/** ラグジュアリー系DNA */
const DNA_LUXURY: Partial<DesignDNAPreferences> = {
  minimalism: 0.5, whitespace: 0.7, contrast: 0.4,
  serifAffinity: 0.6, colorSaturation: -0.2, layoutComplexity: -0.3,
  imageWeight: 0.5, asymmetry: 0.1, novelty: 0.1, animationIntensity: 0.2,
};

/** ミニマル系DNA */
const DNA_MINIMAL: Partial<DesignDNAPreferences> = {
  minimalism: 0.9, whitespace: 0.8, contrast: 0.2,
  serifAffinity: -0.3, colorSaturation: -0.5, layoutComplexity: -0.7,
  imageWeight: 0.0, asymmetry: -0.2, novelty: 0.0, animationIntensity: -0.3,
};

/** モダン・ボールド系DNA */
const DNA_BOLD: Partial<DesignDNAPreferences> = {
  minimalism: -0.2, whitespace: 0.1, contrast: 0.8,
  serifAffinity: -0.5, colorSaturation: 0.4, layoutComplexity: 0.3,
  imageWeight: 0.6, asymmetry: 0.4, novelty: 0.5, animationIntensity: 0.6,
};

/** ナチュラル・オーガニック系DNA */
const DNA_NATURAL: Partial<DesignDNAPreferences> = {
  minimalism: 0.3, whitespace: 0.5, contrast: -0.2,
  serifAffinity: 0.3, colorSaturation: -0.1, layoutComplexity: -0.3,
  imageWeight: 0.4, asymmetry: 0.0, novelty: -0.3, animationIntensity: -0.2,
};

/** DNA座標のブレンド */
function blendDNA(...dnas: Partial<DesignDNAPreferences>[]): Partial<DesignDNAPreferences> {
  const result: Record<string, number> = {};
  const keys = Object.keys(dnas[0] || {}) as (keyof DesignDNAPreferences)[];
  for (const key of keys) {
    const values = dnas.map(d => d[key] ?? 0);
    result[key] = values.reduce((a, b) => a + b, 0) / values.length;
  }
  return result as Partial<DesignDNAPreferences>;
}

// ============================================================
// 全セクションメタデータ
// ============================================================

const SECTION_META_LIST: SectionMeta[] = [
  // ── Navigation (6) ──
  {
    sectionId: "nav-elegant-dropdown",
    hqs: { visual: 4.2, rhythm: 4.0, conversion: 3.8, mobile: 4.0, brand: 4.5 },
    dna: DNA_LUXURY,
    flowsWellBefore: ["hero", "announcement"],
  },
  {
    sectionId: "nav-minimal-sticky",
    hqs: { visual: 4.0, rhythm: 4.2, conversion: 3.5, mobile: 4.5, brand: 3.8 },
    dna: DNA_MINIMAL,
    flowsWellBefore: ["hero", "announcement"],
  },
  {
    sectionId: "nav-transparent-overlay",
    hqs: { visual: 4.5, rhythm: 4.3, conversion: 3.3, mobile: 3.5, brand: 4.5 },
    dna: blendDNA(DNA_LUXURY, DNA_BOLD),
    flowsWellBefore: ["hero"],
  },
  {
    sectionId: "nav-mega-menu",
    hqs: { visual: 3.8, rhythm: 3.5, conversion: 4.5, mobile: 3.0, brand: 3.5 },
    dna: { ...DNA_BOLD, layoutComplexity: 0.6 },
    flowsWellBefore: ["hero", "collection-banner"],
  },
  {
    sectionId: "nav-side-drawer",
    hqs: { visual: 3.5, rhythm: 3.8, conversion: 3.5, mobile: 4.5, brand: 3.5 },
    dna: DNA_MINIMAL,
    flowsWellBefore: ["hero"],
  },
  {
    sectionId: "nav-category-tabs",
    hqs: { visual: 3.5, rhythm: 3.5, conversion: 4.0, mobile: 3.8, brand: 3.0 },
    dna: { ...DNA_BOLD, layoutComplexity: 0.4 },
    flowsWellBefore: ["hero", "products", "collection-banner"],
  },

  // ── Announcement (1) ──
  {
    sectionId: "announcement-top-bar",
    hqs: { visual: 3.5, rhythm: 3.8, conversion: 4.0, mobile: 4.0, brand: 3.0 },
    dna: DNA_MINIMAL,
    flowsWellAfter: ["navigation"],
    flowsWellBefore: ["hero"],
  },

  // ── Breadcrumb (1) ──
  {
    sectionId: "breadcrumb-simple-path",
    hqs: { visual: 3.0, rhythm: 3.5, conversion: 3.5, mobile: 4.0, brand: 2.5 },
    dna: DNA_MINIMAL,
    flowsWellAfter: ["navigation"],
  },

  // ── Hero (5) ──
  {
    sectionId: "hero-split-image",
    hqs: { visual: 4.5, rhythm: 4.5, conversion: 4.2, mobile: 4.0, brand: 4.5 },
    dna: blendDNA(DNA_LUXURY, DNA_NATURAL),
    flowsWellAfter: ["navigation"],
    flowsWellBefore: ["story", "products", "features"],
  },
  {
    sectionId: "hero-fullscreen-visual",
    hqs: { visual: 4.8, rhythm: 4.7, conversion: 3.8, mobile: 3.5, brand: 5.0 },
    dna: DNA_BOLD,
    flowsWellAfter: ["navigation"],
    flowsWellBefore: ["story", "philosophy", "products"],
  },
  {
    sectionId: "hero-minimal-centered",
    hqs: { visual: 4.3, rhythm: 4.5, conversion: 4.0, mobile: 4.5, brand: 4.0 },
    dna: DNA_MINIMAL,
    flowsWellAfter: ["navigation"],
    flowsWellBefore: ["features", "products", "story"],
  },
  {
    sectionId: "hero-video-background",
    hqs: { visual: 4.5, rhythm: 4.0, conversion: 3.5, mobile: 3.0, brand: 4.8 },
    dna: { ...DNA_BOLD, animationIntensity: 0.8, novelty: 0.6 },
    flowsWellAfter: ["navigation"],
    flowsWellBefore: ["story", "products"],
  },
  {
    sectionId: "hero-organic-flowing",
    hqs: { visual: 4.3, rhythm: 4.2, conversion: 3.5, mobile: 3.8, brand: 4.5 },
    dna: DNA_NATURAL,
    flowsWellAfter: ["navigation"],
    flowsWellBefore: ["story", "features"],
  },

  // ── Products (4) ──
  {
    sectionId: "products-card-grid",
    hqs: { visual: 4.0, rhythm: 4.0, conversion: 4.5, mobile: 4.2, brand: 3.8 },
    dna: blendDNA(DNA_MINIMAL, DNA_NATURAL),
    flowsWellAfter: ["hero", "story", "features"],
    flowsWellBefore: ["testimonial", "cta", "footer"],
  },
  {
    sectionId: "products-featured-single",
    hqs: { visual: 4.5, rhythm: 4.3, conversion: 4.5, mobile: 4.0, brand: 4.5 },
    dna: DNA_LUXURY,
    flowsWellAfter: ["hero", "story"],
    flowsWellBefore: ["products", "testimonial"],
  },
  {
    sectionId: "products-masonry-grid",
    hqs: { visual: 4.2, rhythm: 3.8, conversion: 4.0, mobile: 3.5, brand: 4.0 },
    dna: blendDNA(DNA_BOLD, DNA_NATURAL),
    flowsWellAfter: ["hero", "features"],
    flowsWellBefore: ["cta", "testimonial"],
  },
  {
    sectionId: "products-horizontal-scroll",
    hqs: { visual: 4.0, rhythm: 4.0, conversion: 4.0, mobile: 4.5, brand: 3.8 },
    dna: { ...DNA_BOLD, novelty: 0.4, animationIntensity: 0.4 },
    flowsWellAfter: ["hero", "story"],
    flowsWellBefore: ["cta", "footer"],
  },

  // ── Product Detail (5) ──
  {
    sectionId: "product-gallery-thumbnail-slider",
    hqs: { visual: 4.2, rhythm: 4.0, conversion: 4.5, mobile: 4.0, brand: 4.0 },
    dna: DNA_LUXURY,
  },
  {
    sectionId: "product-gallery-grid-layout",
    hqs: { visual: 4.0, rhythm: 3.8, conversion: 4.0, mobile: 4.2, brand: 3.5 },
    dna: DNA_MINIMAL,
  },
  {
    sectionId: "product-info-classic-vertical",
    hqs: { visual: 3.8, rhythm: 4.0, conversion: 4.5, mobile: 4.0, brand: 3.5 },
    dna: DNA_MINIMAL,
  },
  {
    sectionId: "product-description-tabbed-content",
    hqs: { visual: 3.5, rhythm: 3.8, conversion: 3.8, mobile: 4.0, brand: 3.0 },
    dna: DNA_MINIMAL,
  },
  {
    sectionId: "product-reviews-star-rating-list",
    hqs: { visual: 3.5, rhythm: 3.5, conversion: 4.5, mobile: 4.0, brand: 3.0 },
    dna: DNA_MINIMAL,
  },

  // ── Related Products (1) ──
  {
    sectionId: "related-products-card-scroll",
    hqs: { visual: 3.8, rhythm: 3.8, conversion: 4.5, mobile: 4.2, brand: 3.5 },
    dna: DNA_MINIMAL,
    flowsWellAfter: ["product-reviews"],
    flowsWellBefore: ["footer"],
  },

  // ── Collection (5) ──
  {
    sectionId: "collection-banner-hero-image",
    hqs: { visual: 4.3, rhythm: 4.2, conversion: 3.5, mobile: 3.8, brand: 4.5 },
    dna: DNA_BOLD,
    flowsWellAfter: ["navigation"],
    flowsWellBefore: ["collection-grid"],
  },
  {
    sectionId: "collection-banner-minimal-text",
    hqs: { visual: 4.0, rhythm: 4.0, conversion: 3.0, mobile: 4.5, brand: 3.8 },
    dna: DNA_MINIMAL,
    flowsWellAfter: ["navigation"],
    flowsWellBefore: ["collection-grid"],
  },
  {
    sectionId: "collection-grid-filterable-grid",
    hqs: { visual: 3.8, rhythm: 3.5, conversion: 4.5, mobile: 3.8, brand: 3.5 },
    dna: DNA_MINIMAL,
    flowsWellAfter: ["collection-banner"],
    flowsWellBefore: ["footer"],
  },
  {
    sectionId: "collection-filter-sidebar-accordion",
    hqs: { visual: 3.5, rhythm: 3.5, conversion: 4.0, mobile: 3.0, brand: 3.0 },
    dna: DNA_MINIMAL,
  },
  {
    sectionId: "collection-list-card-grid",
    hqs: { visual: 3.8, rhythm: 3.8, conversion: 4.0, mobile: 4.0, brand: 3.5 },
    dna: DNA_MINIMAL,
  },

  // ── Cart (2) ──
  {
    sectionId: "cart-items-line-item-list",
    hqs: { visual: 3.5, rhythm: 3.5, conversion: 4.5, mobile: 4.0, brand: 3.0 },
    dna: DNA_MINIMAL,
  },
  {
    sectionId: "cart-summary-order-total",
    hqs: { visual: 3.5, rhythm: 3.5, conversion: 4.5, mobile: 4.0, brand: 3.0 },
    dna: DNA_MINIMAL,
  },

  // ── Story (3) ──
  {
    sectionId: "story-split-text-image",
    hqs: { visual: 4.5, rhythm: 4.5, conversion: 3.5, mobile: 4.0, brand: 4.8 },
    dna: DNA_LUXURY,
    flowsWellAfter: ["hero"],
    flowsWellBefore: ["products", "features", "testimonial"],
  },
  {
    sectionId: "story-full-bleed-image",
    hqs: { visual: 4.8, rhythm: 4.2, conversion: 3.0, mobile: 3.5, brand: 5.0 },
    dna: blendDNA(DNA_BOLD, DNA_LUXURY),
    flowsWellAfter: ["hero", "products"],
    flowsWellBefore: ["features", "cta"],
  },
  {
    sectionId: "story-timeline-vertical",
    hqs: { visual: 4.0, rhythm: 3.8, conversion: 3.0, mobile: 3.8, brand: 4.0 },
    dna: blendDNA(DNA_NATURAL, DNA_LUXURY),
    flowsWellAfter: ["hero"],
    flowsWellBefore: ["products", "cta"],
  },

  // ── Features (3) ──
  {
    sectionId: "features-icon-grid",
    hqs: { visual: 3.8, rhythm: 4.0, conversion: 4.0, mobile: 4.2, brand: 3.5 },
    dna: DNA_MINIMAL,
    flowsWellAfter: ["hero", "story"],
    flowsWellBefore: ["products", "testimonial", "cta"],
  },
  {
    sectionId: "features-stats-counter",
    hqs: { visual: 4.0, rhythm: 3.8, conversion: 4.2, mobile: 4.0, brand: 3.8 },
    dna: DNA_BOLD,
    flowsWellAfter: ["hero", "story"],
    flowsWellBefore: ["products", "cta"],
  },
  {
    sectionId: "features-image-cards",
    hqs: { visual: 4.2, rhythm: 4.0, conversion: 3.8, mobile: 4.0, brand: 4.0 },
    dna: blendDNA(DNA_NATURAL, DNA_LUXURY),
    flowsWellAfter: ["hero", "story"],
    flowsWellBefore: ["testimonial", "cta"],
  },

  // ── CTA (2) ──
  {
    sectionId: "cta-newsletter-minimal",
    hqs: { visual: 4.0, rhythm: 4.0, conversion: 4.5, mobile: 4.2, brand: 3.5 },
    dna: DNA_MINIMAL,
    flowsWellAfter: ["testimonial", "products", "features"],
    flowsWellBefore: ["footer"],
  },
  {
    sectionId: "cta-bold-split",
    hqs: { visual: 4.3, rhythm: 3.8, conversion: 4.8, mobile: 3.8, brand: 4.0 },
    dna: DNA_BOLD,
    flowsWellAfter: ["testimonial", "products"],
    flowsWellBefore: ["footer"],
  },

  // ── Testimonial (2) ──
  {
    sectionId: "testimonial-quote-single",
    hqs: { visual: 4.2, rhythm: 4.3, conversion: 4.0, mobile: 4.5, brand: 4.2 },
    dna: DNA_LUXURY,
    flowsWellAfter: ["products", "features", "story"],
    flowsWellBefore: ["cta", "footer"],
  },
  {
    sectionId: "testimonial-carousel-multi",
    hqs: { visual: 3.8, rhythm: 3.5, conversion: 4.2, mobile: 3.5, brand: 3.5 },
    dna: DNA_BOLD,
    flowsWellAfter: ["products", "features"],
    flowsWellBefore: ["cta", "footer"],
  },

  // ── Gallery (1) ──
  {
    sectionId: "gallery-lightbox-grid",
    hqs: { visual: 4.0, rhythm: 3.8, conversion: 3.0, mobile: 3.5, brand: 4.0 },
    dna: blendDNA(DNA_BOLD, DNA_NATURAL),
    flowsWellAfter: ["story", "features"],
    flowsWellBefore: ["cta", "footer"],
  },

  // ── Footer (2) ──
  {
    sectionId: "footer-elegant-columns",
    hqs: { visual: 4.2, rhythm: 4.0, conversion: 3.8, mobile: 4.0, brand: 4.0 },
    dna: DNA_LUXURY,
    flowsWellAfter: ["cta", "testimonial", "products"],
  },
  {
    sectionId: "footer-minimal-centered",
    hqs: { visual: 4.0, rhythm: 4.2, conversion: 3.5, mobile: 4.5, brand: 3.5 },
    dna: DNA_MINIMAL,
    flowsWellAfter: ["cta", "testimonial", "products"],
  },

  // ── Trust & Social (2) ──
  {
    sectionId: "trust-badges-icon-strip",
    hqs: { visual: 3.5, rhythm: 3.5, conversion: 4.5, mobile: 4.0, brand: 3.0 },
    dna: DNA_MINIMAL,
    flowsWellAfter: ["cta", "products"],
    flowsWellBefore: ["footer"],
  },
  {
    sectionId: "social-proof-instagram-feed",
    hqs: { visual: 4.0, rhythm: 3.5, conversion: 3.5, mobile: 3.8, brand: 4.0 },
    dna: blendDNA(DNA_NATURAL, DNA_BOLD),
    flowsWellAfter: ["testimonial", "products"],
    flowsWellBefore: ["footer"],
  },

  // ── Contact (1) ──
  {
    sectionId: "contact-form-elegant-split",
    hqs: { visual: 4.0, rhythm: 4.0, conversion: 4.0, mobile: 4.0, brand: 4.0 },
    dna: DNA_LUXURY,
  },

  // ── Search (1) ──
  {
    sectionId: "search-predictive-overlay",
    hqs: { visual: 3.8, rhythm: 3.5, conversion: 4.0, mobile: 3.8, brand: 3.0 },
    dna: DNA_MINIMAL,
  },
];

// ── ルックアップマップ ──
const META_MAP = new Map<string, SectionMeta>(
  SECTION_META_LIST.map((m) => [m.sectionId, m]),
);

// ── Public API ──

export function getSectionMeta(sectionId: string): SectionMeta | undefined {
  return META_MAP.get(sectionId);
}

export function getAllSectionMeta(): SectionMeta[] {
  return SECTION_META_LIST;
}

/** カテゴリ → セクションIDプレフィックスマッピング */
const CATEGORY_PREFIX_MAP: Record<string, string[]> = {
  navigation: ["nav-"],
  footer: ["footer-"],
  announcement: ["announcement-"],
  breadcrumb: ["breadcrumb-"],
  search: ["search-"],
  hero: ["hero-"],
  story: ["story-"],
  products: ["products-"],
  "product-detail": ["product-"],
  "related-products": ["related-products-", "related-"],
  "collection-banner": ["collection-banner-"],
  "collection-grid": ["collection-grid-"],
  "collection-filter": ["collection-filter-"],
  "collection-list": ["collection-list-"],
  cart: ["cart-"],
  features: ["features-"],
  cta: ["cta-"],
  testimonial: ["testimonial-"],
  gallery: ["gallery-"],
  trust: ["trust-"],
  "social-proof": ["social-proof-", "social-"],
  contact: ["contact-"],
};

/** 指定カテゴリのセクションをHQSスコア順で返す */
export function getSectionMetaByCategory(category: SectionCategory): SectionMeta[] {
  const prefixes = CATEGORY_PREFIX_MAP[category] || [category + "-"];
  return SECTION_META_LIST
    .filter((m) => prefixes.some((p) => m.sectionId.startsWith(p)))
    .sort((a, b) => computeHQSComposite(b.hqs) - computeHQSComposite(a.hqs));
}

// Import for computeHQSComposite
import { computeHQSComposite } from "./types";
