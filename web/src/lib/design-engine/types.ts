// ============================================================
// Aicata Design Engine — Type Definitions (Gen-3)
// ============================================================

// ============================================================
// 基本列挙型
// ============================================================

/** 対応業界 */
export type IndustryType =
  | "beauty"
  | "food"
  | "fashion"
  | "lifestyle"
  | "tech"
  | "health"
  | "general";

/** ページ種別 — Shopify Online Store 2.0 テンプレートタイプ準拠 */
export type PageType =
  | "landing"        // index — トップページ
  | "product"        // product — 商品詳細
  | "collection"     // collection — コレクション/カテゴリー
  | "list-collections" // list-collections — コレクション一覧
  | "cart"           // cart — カートページ
  | "blog"           // blog — ブログ一覧
  | "article"        // article — ブログ記事詳細
  | "about"          // page — 会社概要/ブランドストーリー
  | "contact"        // page.contact — お問い合わせ
  | "search"         // search — 検索結果
  | "account"        // customers/* — アカウント関連
  | "password"       // password — パスワード保護
  | "404"            // 404 — エラーページ
  | "general";       // 汎用

/** デザイントーン */
export type DesignTone =
  | "luxury"
  | "natural"
  | "modern"
  | "playful"
  | "minimal"
  | "bold"
  | "elegant"
  | "warm"
  | "cool"
  | "traditional";

/** CSS機能ID */
export type CssFeatureId =
  | "scroll-animations"
  | "motion"
  | "typography"
  | "modern-layout"
  | "glassmorphism"
  | "container-queries"
  | "view-transitions";

/** セクションカテゴリ — EC全ページ対応 */
export type SectionCategory =
  // ── グローバル（全ページ共通） ──
  | "navigation"         // ヘッダー・メニュー・メガメニュー
  | "footer"             // フッター
  | "announcement"       // アナウンスバー・お知らせ帯
  | "breadcrumb"         // パンくずリスト
  | "search"             // 検索バー・予測検索
  // ── トップページ・LP ──
  | "hero"               // ヒーローバナー・メインビジュアル
  | "philosophy"         // ブランド哲学・理念
  | "story"              // ブランドストーリー・About
  | "features"           // 特徴・USP
  | "testimonial"        // レビュー・推薦
  | "cta"                // CTA・ニュースレター
  | "newsletter"         // メール登録
  | "gallery"            // 画像ギャラリー
  | "editorial"          // エディトリアル・コラム
  | "faq"                // FAQ・折りたたみ
  // ── 商品詳細ページ ──
  | "product-gallery"    // 商品画像ギャラリー（ズーム・スワイプ）
  | "product-info"       // 商品情報（タイトル・価格・バリアント選択・カートボタン）
  | "product-description"// 商品説明（タブ/アコーディオン形式）
  | "product-reviews"    // カスタマーレビュー・レーティング
  | "related-products"   // 関連商品・おすすめ
  | "recently-viewed"    // 最近見た商品
  // ── コレクション/カテゴリーページ ──
  | "collection-banner"  // コレクションバナー・ヘッダー
  | "collection-grid"    // 商品グリッド（フィルター・ソート付き）
  | "collection-filter"  // サイドバーフィルター
  | "collection-list"    // コレクション一覧
  // ── カートページ ──
  | "cart-items"         // カート内商品一覧
  | "cart-summary"       // 注文サマリー・合計
  | "cart-upsell"        // カート内アップセル・クロスセル
  // ── ブログ ──
  | "blog-grid"          // ブログ記事一覧グリッド
  | "article-content"    // 記事本文
  // ── 汎用コンポーネント ──
  | "products"           // 商品カード群（トップページ用）
  | "slideshow"          // スライドショー・カルーセル
  | "image-with-text"    // 画像+テキスト汎用
  | "multicolumn"        // マルチカラムコンテンツ
  | "video"              // 動画セクション
  | "contact-form"       // お問い合わせフォーム
  | "social-proof"       // SNSフィード・UGC
  | "trust-badges";      // 信頼バッジ・保証・決済アイコン

/** セクションバリアント */
export type SectionVariant =
  | "minimal"
  | "animated"
  | "fullbleed"
  | "split"
  | "grid"
  | "centered"
  | "sidebar"     // サイドバー付きレイアウト
  | "sticky"      // スティッキー/固定
  | "drawer"      // ドロワー/スライドイン
  | "tabs"        // タブ切り替え
  | "accordion"   // アコーディオン/折りたたみ
  | "carousel";   // カルーセル/スライド

// ============================================================
// Gen-3: セクションテンプレートシステム
// ============================================================

/** アニメーション定義 */
export interface AnimationDef {
  trigger: "load" | "scroll" | "hover";
  type: string; // "fade-in", "slide-up", "ken-burns", "parallax"
  duration?: string;
  delay?: string;
}

/** プレースホルダー定義 */
export interface PlaceholderDef {
  key: string; // "{{HERO_TITLE}}"
  type: "text" | "image" | "url" | "color";
  description: string;
  defaultValue?: string;
}

/** フォント定義 */
export interface FontDef {
  family: string;
  weights: number[];
  italic?: boolean;
}

/** デザイントークンセット */
export interface DesignTokenSet {
  colors: Record<string, string>; // --color-bg, --color-text, etc.
  typography: Record<string, string>; // --font-heading, --font-body
  spacing: Record<string, string>; // --section-padding, --gap-sm
  motion: Record<string, string>; // --ease-default, --duration-slow
}

/** セクションテンプレート — 個別セクションの定義 */
export interface SectionTemplate {
  id: string;
  category: SectionCategory;
  variant: SectionVariant;
  name: string;
  description: string;
  tones: DesignTone[];
  html: string;
  css: string;
  placeholders: PlaceholderDef[];
  animations: AnimationDef[];
}

/** セクション参照 — ページテンプレート内での順序管理 */
export interface SectionRef {
  sectionId: string;
  order: number;
  overrides?: Record<string, string>; // プレースホルダー上書き
}

/** ページテンプレート — セクション群 + デザイントークンで構成 */
export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  industries: IndustryType[];
  tones: DesignTone[];
  pageType: PageType;
  designTokens: DesignTokenSet;
  sections: SectionRef[];
  fonts: FontDef[];
}

/** テンプレートマッチ結果 */
export interface TemplateMatch {
  template: PageTemplate;
  score: number;
  reasons: string[];
}

/** コンバージョンメタデータ */
export interface ConversionMeta {
  ctaPlacement: "above-fold" | "below-fold" | "both";
  socialProofIncluded: boolean;
  trustSignalsIncluded: boolean;
  productVisibility: "high" | "medium" | "low";
}

// ============================================================
// Gen-3: URL解析
// ============================================================

/** URL解析結果 */
export interface UrlAnalysisResult {
  url: string;
  title: string;
  description: string;
  industry: IndustryType;
  tones: DesignTone[];
  sections: ExtractedSection[];
  images: ExtractedImage[];
  texts: ExtractedText[];
  colors: string[];
  fonts: string[];
}

/** 抽出されたセクション情報 */
export interface ExtractedSection {
  tag: string;
  category: SectionCategory;
  textContent: string;
  imageUrls: string[];
  order: number;
}

/** 抽出された画像 */
export interface ExtractedImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  context: string; // "hero", "product", "logo"
}

/** 抽出されたテキスト */
export interface ExtractedText {
  role: "heading" | "subheading" | "body" | "cta" | "nav" | "meta";
  content: string;
  tag: string;
}

// ============================================================
// Knowledge structures (既存 — 後方互換)
// ============================================================

/** 業界別デザイン知識 */
export interface IndustryKnowledge {
  id: IndustryType;
  name: string;
  designPrinciples: string;
  recommendedCssFeatures: CssFeatureId[];
  recommendedTones: DesignTone[];
  exampleSnippets: DesignSnippet[];
}

/** ページ種別テンプレート */
export interface PageTypeTemplate {
  id: PageType;
  name: string;
  structureGuide: string;
  requiredSections: string[];
  optionalSections: string[];
}

/** CSSパターン */
export interface CssPattern {
  id: CssFeatureId;
  name: string;
  browserSupport: string;
  promptContent: string;
}

/** デザインスニペット（参考コード） */
export interface DesignSnippet {
  name: string;
  description: string;
  html: string;
  css: string;
}

/** UIコンポーネントパターン（レガシー — SectionTemplate に移行予定） */
export interface ComponentPattern {
  id: string;
  category:
    | "hero"
    | "navigation"
    | "product-card"
    | "cta"
    | "testimonial"
    | "footer"
    | "pricing";
  name: string;
  description: string;
  html: string;
  css: string;
  tags: string[];
}

// ============================================================
// Context analysis
// ============================================================

/** ターゲットオーディエンス種別 */
export type AudienceType =
  | "individual"     // 個人のお客様（一般消費者）
  | "business"       // 法人・ビジネス向け
  | "young"          // 若年層（10〜20代中心）
  | "young-adult"    // 20〜30代の社会人
  | "middle"         // 40〜50代
  | "senior"         // シニア世代（60代以上）
  | "premium"        // 高品質・こだわり志向の方
  | "family"         // ファミリー・暮らし向け
  | "women"          // 女性中心
  | "men"            // 男性中心
  | "eco-conscious"  // エコ・サステナブル志向
  | "gift"           // ギフト・贈り物を探す方
  | "broad"          // 特に絞らない（幅広い層）
  | "custom";        // フリーテキストで指定

/** 分析されたデザインコンテキスト */
export interface DesignContext {
  industry: IndustryType;
  pageType: PageType;
  tones: DesignTone[];
  cssFeatures: CssFeatureId[];
  referenceUrl?: string;
  brandName?: string;
  keywords: string[];
  confidence: number;
  urlAnalysis?: UrlAnalysisResult;
  /** ターゲットオーディエンス種別 */
  audience?: AudienceType;
  /** フリーテキストで入力されたターゲット説明 */
  audienceText?: string;
}

// ============================================================
// Quality scoring
// ============================================================

export interface DesignIssue {
  severity: "error" | "warning" | "info";
  category: string;
  message: string;
  suggestion?: string;
}

export interface DesignScore {
  overall: number;
  responsive: number;
  cssQuality: number;
  accessibility: number;
  performance: number;
  issues: DesignIssue[];
}
