// ============================================================
// Aicata — Section Label Map
// data-section-id → 日本語の分かりやすいセクション名
// ホバーUI、チャット連携、セクション編集パネルで使用
// ============================================================

/**
 * セクションIDから日本語ラベルへのマッピング
 * Gen-3テンプレートの data-section-id に対応
 */
const SECTION_LABELS: Record<string, string> = {
  // ── Navigation / Header ──
  navigation: "ナビゲーション",
  "navigation-mega-menu": "メガメニュー",
  "navigation-side-drawer": "サイドメニュー",
  "navigation-category-tabs": "カテゴリータブ",
  header: "ヘッダー",
  "top-bar": "お知らせバー",
  announcement: "お知らせバー",
  "announcement-top-bar": "お知らせバー",
  breadcrumb: "パンくずリスト",
  "breadcrumb-simple-path": "パンくずリスト",

  // ── Hero ──
  hero: "メインビジュアル",
  "hero-video-background": "動画メインビジュアル",
  "hero-organic-flowing": "フローイングヒーロー",
  "hero-fullscreen": "フルスクリーンヒーロー",
  "hero-split": "分割ヒーロー",
  "hero-minimal": "ミニマルヒーロー",

  // ── Products ──
  products: "商品一覧",
  "products-masonry-grid": "マソンリー商品グリッド",
  "products-horizontal-scroll": "横スクロール商品",
  "featured-products": "おすすめ商品",
  "new-arrivals": "新着商品",
  "best-sellers": "売れ筋商品",

  // ── Product Detail ──
  "product-gallery": "商品ギャラリー",
  "product-gallery-thumbnail-slider": "サムネイルスライダー",
  "product-gallery-grid-layout": "グリッドギャラリー",
  "product-info": "商品情報",
  "product-info-classic-vertical": "商品情報（クラシック）",
  "product-description": "商品説明",
  "product-description-tabbed-content": "商品説明（タブ）",
  "product-reviews": "レビュー",
  "product-reviews-star-rating-list": "レビュー一覧",
  "related-products": "関連商品",
  "related-products-card-scroll": "関連商品スクロール",
  "recently-viewed": "最近見た商品",

  // ── Collection ──
  "collection-banner": "コレクションバナー",
  "collection-banner-hero-image": "コレクションヒーロー",
  "collection-banner-minimal-text": "コレクションタイトル",
  "collection-grid": "商品グリッド",
  "collection-grid-filterable-grid": "フィルター付きグリッド",
  "collection-filter": "フィルター",
  "collection-filter-sidebar-accordion": "サイドバーフィルター",
  "collection-list": "コレクション一覧",
  "collection-list-card-grid": "コレクションカード",

  // ── Cart ──
  "cart-items": "カート商品",
  "cart-items-line-item-list": "カート商品一覧",
  "cart-summary": "注文サマリー",
  "cart-summary-order-total": "注文合計",
  "cart-upsell": "おすすめ追加商品",

  // ── Story / About ──
  story: "ストーリー",
  "story-full-bleed-image": "フルブリードストーリー",
  "story-timeline-vertical": "タイムライン",
  about: "ブランドについて",

  // ── Features ──
  features: "特徴・強み",
  "features-stats-counter": "数値カウンター",
  "features-image-cards": "画像カード",

  // ── Testimonial / Social Proof ──
  testimonial: "お客様の声",
  "testimonial-carousel-multi": "レビューカルーセル",
  "social-proof": "ソーシャルプルーフ",
  "social-proof-instagram-feed": "Instagram フィード",
  "trust-badges": "信頼バッジ",
  "trust-badges-icon-strip": "信頼バッジ一覧",

  // ── Gallery ──
  gallery: "ギャラリー",
  "gallery-lightbox-grid": "ライトボックスギャラリー",

  // ── CTA ──
  cta: "アクションセクション",
  "cta-bold-split": "分割CTA",
  "newsletter-signup": "ニュースレター登録",

  // ── Blog / Article ──
  "blog-grid": "ブログ一覧",
  "article-content": "記事本文",

  // ── Contact ──
  "contact-form": "お問い合わせ",
  "contact-form-elegant-split": "お問い合わせフォーム",

  // ── Footer ──
  footer: "フッター",
  "footer-minimal-centered": "ミニマルフッター",
  "footer-full": "フルフッター",

  // ── Search ──
  search: "検索",
  "search-predictive-overlay": "予測検索",

  // ── Other ──
  slideshow: "スライドショー",
  "image-with-text": "画像付きテキスト",
  multicolumn: "マルチカラム",
  video: "動画",
};

/**
 * セクションIDから日本語ラベルを取得
 * マッチしない場合は、IDからヒューリスティックで生成
 */
export function getSectionLabel(sectionId: string): string {
  // 完全一致
  if (SECTION_LABELS[sectionId]) {
    return SECTION_LABELS[sectionId];
  }

  // プレフィックスマッチ（例: "hero-custom" → "メインビジュアル"）
  for (const [key, label] of Object.entries(SECTION_LABELS)) {
    if (sectionId.startsWith(key + "-")) return label;
  }

  // ハイフン→スペースに変換して表示
  return sectionId
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * セクションIDの短縮表示名（ツールバー・ラベル用）
 */
export function getSectionShortLabel(sectionId: string): string {
  const full = getSectionLabel(sectionId);
  // 10文字以上なら切り詰め
  return full.length > 12 ? full.slice(0, 11) + "…" : full;
}

/**
 * セクションの編集リクエスト用プロンプトを生成
 */
export function buildSectionEditPrompt(
  sectionId: string,
  instruction?: string,
): string {
  const label = getSectionLabel(sectionId);
  if (instruction) {
    return `「${label}」セクション（${sectionId}）を次のように修正してください: ${instruction}`;
  }
  return `「${label}」セクション（${sectionId}）を修正したいです。`;
}
