// ============================================================
// Design Harvester — Reference Source Registry
// ハーベスト参照元サイトの定義
// ============================================================

export interface HarvestSourceDef {
  url: string;
  domain: string;
  label: string;
  category: "award" | "ecommerce" | "japan" | "ui-component";
  description: string;
  /** ギャラリーサイトか（true = サイト内のリンク先を辿って個別サイトを収穫） */
  isGallery: boolean;
  /** ギャラリー内の個別サイトリンクを特定するセレクタ */
  galleryLinkSelector?: string;
  /** ページネーションのセレクタ */
  paginationSelector?: string;
  /** クロール時の最大ページ数 */
  maxPages?: number;
}

// ============================================================
// 🏆 世界最高水準デザイン
// ============================================================

const AWARD_SOURCES: HarvestSourceDef[] = [
  {
    url: "https://www.awwwards.com/websites/",
    domain: "awwwards.com",
    label: "Awwwards",
    category: "award",
    description: "世界最高水準のウェブデザイン受賞作品。審査員評価付きで品質が高い",
    isGallery: true,
    galleryLinkSelector: "a.js-visit-site",
    paginationSelector: ".js-collectionlist-load-more",
    maxPages: 20,
  },
  {
    url: "https://www.cssdesignawards.com/",
    domain: "cssdesignawards.com",
    label: "CSS Design Awards",
    category: "award",
    description: "インタラクションやアニメーションが優れたサイト多め",
    isGallery: true,
    galleryLinkSelector: "a.visit-site",
    maxPages: 15,
  },
  {
    url: "https://www.siteinspire.com/",
    domain: "siteinspire.com",
    label: "Siteinspire",
    category: "award",
    description: "ミニマル・タイポグラフィ重視の上質なキュレーション",
    isGallery: true,
    galleryLinkSelector: ".websites-grid a",
    maxPages: 15,
  },
  {
    url: "https://httpster.net/",
    domain: "httpster.net",
    label: "Httpster",
    category: "award",
    description: "シンプルで洗練されたサイトを厳選。更新頻度が高い",
    isGallery: true,
    galleryLinkSelector: ".site-link",
    maxPages: 10,
  },
];

// ============================================================
// 🛒 ECサイト特化
// ============================================================

const ECOMMERCE_SOURCES: HarvestSourceDef[] = [
  {
    url: "https://ecomm.design/",
    domain: "ecomm.design",
    label: "Ecomm.design",
    category: "ecommerce",
    description: "ECサイトに特化したギャラリー。業種・プラットフォームで絞り込み可能",
    isGallery: true,
    galleryLinkSelector: "a.website-link",
    maxPages: 20,
  },
  {
    url: "https://minimal.gallery/",
    domain: "minimal.gallery",
    label: "Minimal Gallery",
    category: "ecommerce",
    description: "Shopifyなど最新ECのデザインを多数収録",
    isGallery: true,
    galleryLinkSelector: ".gallery-item a",
    maxPages: 15,
  },
  {
    url: "https://land-book.com/",
    domain: "land-book.com",
    label: "Land-book",
    category: "ecommerce",
    description: "ランディングページ中心。商品・ブランドページの参考に最適",
    isGallery: true,
    galleryLinkSelector: ".gallery__item a",
    maxPages: 15,
  },
];

// ============================================================
// 🇯🇵 日本語・国内向け
// ============================================================

const JAPAN_SOURCES: HarvestSourceDef[] = [
  {
    url: "https://sankoudesign.com/",
    domain: "sankoudesign.com",
    label: "SANKOU!",
    category: "japan",
    description: "国内サイトのみ収録。業種・色・テイストで検索できて実用的",
    isGallery: true,
    galleryLinkSelector: ".site-item a.visit",
    maxPages: 20,
  },
  {
    url: "https://io3000.com/",
    domain: "io3000.com",
    label: "I/O 3000",
    category: "japan",
    description: "国内の優れたウェブデザインをカテゴリ別に収集",
    isGallery: true,
    galleryLinkSelector: ".entry a",
    maxPages: 15,
  },
  {
    url: "https://muuuuu.org/",
    domain: "muuuuu.org",
    label: "Muuuuu.org",
    category: "japan",
    description: "縦長・スクロール型の国内サイト特化。スマホ対応デザイン参考に",
    isGallery: true,
    galleryLinkSelector: ".entry a",
    maxPages: 15,
  },
];

// ============================================================
// 📐 UIコンポーネント・モーション系
// ============================================================

const UI_COMPONENT_SOURCES: HarvestSourceDef[] = [
  {
    url: "https://mobbin.com/browse/web/apps",
    domain: "mobbin.com",
    label: "Mobbin",
    category: "ui-component",
    description: "アプリ・ウェブのUI画面を大量収録。フロー単位で閲覧できる",
    isGallery: true,
    galleryLinkSelector: ".app-card a",
    maxPages: 15,
  },
  {
    url: "https://www.lapa.ninja/",
    domain: "lapa.ninja",
    label: "Lapa Ninja",
    category: "ui-component",
    description: "ランディングページのデザインパターンが豊富",
    isGallery: true,
    galleryLinkSelector: ".showcase-link",
    maxPages: 15,
  },
  {
    url: "https://pageflows.com/",
    domain: "pageflows.com",
    label: "Page Flows",
    category: "ui-component",
    description: "ユーザーフロー（購入・登録など）の動画録画が見られる",
    isGallery: true,
    galleryLinkSelector: ".flow-card a",
    maxPages: 10,
  },
];

// ============================================================
// All Sources
// ============================================================

export const HARVEST_SOURCES: HarvestSourceDef[] = [
  ...AWARD_SOURCES,
  ...ECOMMERCE_SOURCES,
  ...JAPAN_SOURCES,
  ...UI_COMPONENT_SOURCES,
];

export const HARVEST_SOURCES_BY_CATEGORY = {
  award: AWARD_SOURCES,
  ecommerce: ECOMMERCE_SOURCES,
  japan: JAPAN_SOURCES,
  "ui-component": UI_COMPONENT_SOURCES,
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  award: "🏆 世界最高水準デザイン",
  ecommerce: "🛒 ECサイト特化",
  japan: "🇯🇵 日本語・国内向け",
  "ui-component": "📐 UIコンポーネント・モーション系",
};
