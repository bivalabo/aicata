// ============================================================
// ACE Layer 2: Block Pattern Registry
// Atomを組み合わせた再利用可能なブロックパターン
// ============================================================

import type { BlockPattern, BlockCategory } from "../types";

// ============================================================
// Block Pattern Definitions
// ============================================================

const BLOCK_HERO_TEXT: BlockPattern = {
  id: "hero-text-group",
  category: "text-group",
  name: "Hero Text Group",
  description: "ラベル + 大見出し + 説明文 + CTAの典型的ヒーローテキスト構成。",
  slots: [
    { name: "label", accepts: ["typography"], defaultAtom: "label", required: false },
    { name: "heading", accepts: ["typography"], defaultAtom: "heading-serif-display", required: true },
    { name: "description", accepts: ["typography"], defaultAtom: "body-text", required: false },
    { name: "cta", accepts: ["interactive"], defaultAtom: "button-primary", required: false },
  ],
  layout: {
    display: "flex",
    direction: "column",
    gap: "24px",
    alignItems: "flex-start",
  },
  responsive: [
    { breakpoint: "768px", changes: { gap: "28px" } },
    { breakpoint: "1024px", changes: { gap: "32px" } },
  ],
  animations: [],
  css: `.block-hero-text-group {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
  max-width: 560px;
}
@media (min-width: 768px) {
  .block-hero-text-group { gap: 28px; }
}
@media (min-width: 1024px) {
  .block-hero-text-group { gap: 32px; }
}`,
};

const BLOCK_PRODUCT_CARD: BlockPattern = {
  id: "product-card",
  category: "card",
  name: "Product Card",
  description: "商品画像 + 商品名 + 価格 + CTAのカード。",
  slots: [
    { name: "image", accepts: ["media"], defaultAtom: "responsive-image", required: true },
    { name: "badge", accepts: ["decorative"], defaultAtom: "badge", required: false },
    { name: "title", accepts: ["typography"], defaultAtom: "subheading", required: true },
    { name: "price", accepts: ["typography"], defaultAtom: "price-text", required: true },
    { name: "cta", accepts: ["interactive"], defaultAtom: "button-secondary", required: false },
  ],
  layout: {
    display: "flex",
    direction: "column",
    gap: "12px",
  },
  responsive: [],
  animations: [],
  css: `.block-product-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}
.block-product-card .atom-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
}
.block-product-card .atom-responsive-image {
  aspect-ratio: 3 / 4;
}
.block-product-card:hover .atom-responsive-image__img {
  transform: scale(1.03);
}`,
};

const BLOCK_FEATURE_ITEM: BlockPattern = {
  id: "feature-item",
  category: "card",
  name: "Feature Item",
  description: "アイコン + タイトル + 説明のフィーチャーアイテム。",
  slots: [
    { name: "icon", accepts: ["media"], defaultAtom: "icon", required: true },
    { name: "title", accepts: ["typography"], defaultAtom: "subheading", required: true },
    { name: "description", accepts: ["typography"], defaultAtom: "body-text", required: false },
  ],
  layout: {
    display: "flex",
    direction: "column",
    gap: "12px",
    alignItems: "flex-start",
  },
  responsive: [],
  animations: [],
  css: `.block-feature-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}
.block-feature-item .atom-icon {
  width: 40px;
  height: 40px;
  color: var(--color-accent);
}`,
};

const BLOCK_TESTIMONIAL_CARD: BlockPattern = {
  id: "testimonial-card",
  category: "card",
  name: "Testimonial Card",
  description: "引用テキスト + 評価 + 名前のレビューカード。",
  slots: [
    { name: "rating", accepts: ["decorative"], defaultAtom: "star-rating", required: false },
    { name: "quote", accepts: ["typography"], defaultAtom: "body-text", required: true },
    { name: "author", accepts: ["typography"], defaultAtom: "label", required: true },
  ],
  layout: {
    display: "flex",
    direction: "column",
    gap: "16px",
  },
  responsive: [],
  animations: [],
  css: `.block-testimonial-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 32px;
  background: var(--color-bg-secondary, #f9f9f9);
  border-radius: 4px;
}
.block-testimonial-card .atom-body-text {
  font-style: italic;
  max-width: none;
}`,
};

const BLOCK_MEDIA_TEXT: BlockPattern = {
  id: "media-text-split",
  category: "media-text",
  name: "Media + Text Split",
  description: "画像とテキストの2カラムスプリットレイアウト。",
  slots: [
    { name: "image", accepts: ["media"], defaultAtom: "responsive-image", required: true },
    { name: "label", accepts: ["typography"], defaultAtom: "label", required: false },
    { name: "heading", accepts: ["typography"], defaultAtom: "heading-sans", required: true },
    { name: "description", accepts: ["typography"], defaultAtom: "body-text", required: false },
    { name: "cta", accepts: ["interactive"], defaultAtom: "text-link", required: false },
  ],
  layout: {
    display: "grid",
    gridTemplate: "1fr",
    gap: "40px",
    alignItems: "center",
  },
  responsive: [
    { breakpoint: "768px", changes: { gridTemplate: "1fr 1fr", gap: "60px" } },
  ],
  animations: [],
  css: `.block-media-text-split {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: center;
}
@media (min-width: 768px) {
  .block-media-text-split {
    grid-template-columns: 1fr 1fr;
    gap: 60px;
  }
}`,
};

const BLOCK_NAV_ITEM: BlockPattern = {
  id: "nav-item",
  category: "nav-item",
  name: "Navigation Item",
  description: "ナビゲーションリンクアイテム。",
  slots: [
    { name: "link", accepts: ["interactive"], defaultAtom: "text-link", required: true },
  ],
  layout: {
    display: "flex",
    alignItems: "center",
  },
  responsive: [],
  animations: [],
  css: `.block-nav-item {
  display: flex;
  align-items: center;
}
.block-nav-item .atom-text-link {
  font-size: 0.8125rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-bottom: none;
}
.block-nav-item .atom-text-link:hover {
  border-bottom: none;
  opacity: 0.7;
}`,
};

const BLOCK_PRICE_GROUP: BlockPattern = {
  id: "price-group",
  category: "price-tag",
  name: "Price Group",
  description: "通常価格・セール価格・バッジのグループ。",
  slots: [
    { name: "original-price", accepts: ["typography"], defaultAtom: "price-text", required: false },
    { name: "sale-price", accepts: ["typography"], defaultAtom: "price-text", required: true },
    { name: "badge", accepts: ["decorative"], defaultAtom: "badge", required: false },
  ],
  layout: {
    display: "flex",
    direction: "row",
    gap: "8px",
    alignItems: "center",
  },
  responsive: [],
  animations: [],
  css: `.block-price-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}`,
};

const BLOCK_STAT_ITEM: BlockPattern = {
  id: "stat-item",
  category: "stat",
  name: "Stat Item",
  description: "数値 + ラベルの統計表示ブロック。",
  slots: [
    { name: "number", accepts: ["typography"], defaultAtom: "heading-sans", required: true },
    { name: "label", accepts: ["typography"], defaultAtom: "caption", required: true },
  ],
  layout: {
    display: "flex",
    direction: "column",
    gap: "4px",
    alignItems: "center",
  },
  responsive: [],
  animations: [],
  css: `.block-stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  text-align: center;
}
.block-stat-item .atom-heading-sans {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-accent);
}`,
};

const BLOCK_NEWSLETTER_FORM: BlockPattern = {
  id: "newsletter-form",
  category: "form-group",
  name: "Newsletter Form",
  description: "メール入力 + 送信ボタンのニュースレター登録フォーム。",
  slots: [
    { name: "heading", accepts: ["typography"], defaultAtom: "subheading", required: false },
    { name: "description", accepts: ["typography"], defaultAtom: "body-text", required: false },
    { name: "email-input", accepts: ["interactive"], defaultAtom: "input-text", required: true },
    { name: "submit", accepts: ["interactive"], defaultAtom: "button-primary", required: true },
  ],
  layout: {
    display: "flex",
    direction: "column",
    gap: "16px",
    alignItems: "center",
  },
  responsive: [],
  animations: [],
  css: `.block-newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  text-align: center;
  max-width: 480px;
  margin: 0 auto;
}
.block-newsletter-form .atom-input-text {
  max-width: 320px;
}`,
};

const BLOCK_SOCIAL_LINKS: BlockPattern = {
  id: "social-links",
  category: "social-link",
  name: "Social Links",
  description: "SNSアイコンリンクの横並び。",
  slots: [
    { name: "icon-1", accepts: ["media"], defaultAtom: "icon", required: true },
    { name: "icon-2", accepts: ["media"], defaultAtom: "icon", required: false },
    { name: "icon-3", accepts: ["media"], defaultAtom: "icon", required: false },
    { name: "icon-4", accepts: ["media"], defaultAtom: "icon", required: false },
  ],
  layout: {
    display: "flex",
    direction: "row",
    gap: "16px",
    alignItems: "center",
  },
  responsive: [],
  animations: [],
  css: `.block-social-links {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
}
.block-social-links .atom-icon {
  opacity: 0.7;
  transition: opacity 0.2s;
  cursor: pointer;
}
.block-social-links .atom-icon:hover {
  opacity: 1;
}`,
};

const BLOCK_CART_LINE_ITEM: BlockPattern = {
  id: "cart-line-item",
  category: "list-item",
  name: "Cart Line Item",
  description: "カート内アイテム行: 画像 + 商品名 + 数量 + 価格。",
  slots: [
    { name: "image", accepts: ["media"], defaultAtom: "responsive-image", required: true },
    { name: "title", accepts: ["typography"], defaultAtom: "subheading", required: true },
    { name: "variant", accepts: ["typography"], defaultAtom: "caption", required: false },
    { name: "quantity", accepts: ["interactive"], defaultAtom: "quantity-selector", required: true },
    { name: "price", accepts: ["typography"], defaultAtom: "price-text", required: true },
  ],
  layout: {
    display: "grid",
    gridTemplate: "80px 1fr auto auto",
    gap: "16px",
    alignItems: "center",
  },
  responsive: [
    { breakpoint: "768px", changes: { gridTemplate: "100px 1fr auto auto", gap: "24px" } },
  ],
  animations: [],
  css: `.block-cart-line-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto;
  gap: 16px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border, #eee);
}
@media (min-width: 768px) {
  .block-cart-line-item {
    grid-template-columns: 100px 1fr auto auto;
    gap: 24px;
  }
}
.block-cart-line-item .atom-responsive-image {
  aspect-ratio: 1 / 1;
}`,
};

// ============================================================
// All Block Patterns
// ============================================================

const ALL_BLOCKS: BlockPattern[] = [
  BLOCK_HERO_TEXT,
  BLOCK_PRODUCT_CARD,
  BLOCK_FEATURE_ITEM,
  BLOCK_TESTIMONIAL_CARD,
  BLOCK_MEDIA_TEXT,
  BLOCK_NAV_ITEM,
  BLOCK_PRICE_GROUP,
  BLOCK_STAT_ITEM,
  BLOCK_NEWSLETTER_FORM,
  BLOCK_SOCIAL_LINKS,
  BLOCK_CART_LINE_ITEM,
];

const BLOCK_MAP = new Map<string, BlockPattern>(
  ALL_BLOCKS.map((b) => [b.id, b])
);

// ============================================================
// Public API
// ============================================================

export function getAllBlocks(): BlockPattern[] {
  return ALL_BLOCKS;
}

export function getBlockById(id: string): BlockPattern | undefined {
  return BLOCK_MAP.get(id);
}

export function getBlocksByCategory(category: BlockCategory): BlockPattern[] {
  return ALL_BLOCKS.filter((b) => b.category === category);
}

export function getBlockCount(): number {
  return ALL_BLOCKS.length;
}

export function searchBlocks(query: string): BlockPattern[] {
  const q = query.toLowerCase();
  return ALL_BLOCKS.filter(
    (b) =>
      b.id.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      (b.description && b.description.toLowerCase().includes(q))
  );
}
