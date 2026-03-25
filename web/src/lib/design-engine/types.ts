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
  | "gift-card"      // gift_card — ギフトカード
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
  trustSignalsIncluded?: boolean;
  productVisibility?: "high" | "medium" | "low";
  /** 3-zone assembly 追加フィールド */
  sectionCount?: number;
  missingSections?: string[];
  templateSuffix?: string;
  pageType?: PageType;
  headerSectionId?: string;
  footerSectionId?: string;
}

// ============================================================
// Gen-4: ThemeLayout — サイト全体の共通レイアウト
// Shopify theme.liquid + header-group + footer-group 相当
// ============================================================

/** ページ種別 — gift-card 追加 */
// (PageType に "gift-card" を追加済み — 上記参照)

/** メニュー項目のリンク種別 */
export type MenuItemType =
  | "collection"
  | "product"
  | "page"
  | "blog"
  | "article"
  | "policy"
  | "url"
  | "home";

/** メニュー項目（Shopifyの link / MenuItem に相当） */
export interface MenuItem {
  id: string;
  title: string;
  url: string;
  type: MenuItemType;
  resourceId?: string;        // Shopify リソース GID（コレクション/商品等）
  children: MenuItem[];       // 子メニュー（最大3階層）
  /** メガメニュー拡張設定 */
  mega?: MegaMenuConfig;
  /** 画像（ビジュアルメニュー用） */
  image?: { src: string; alt: string };
}

/** メガメニュー拡張設定 */
export interface MegaMenuConfig {
  enabled: boolean;
  style: "columns" | "visual" | "tabbed" | "featured" | "editorial";
  featuredImage?: { src: string; alt: string; url: string };
  featuredProductIds?: string[];
  columns?: number;
}

/** メニュー定義（Shopifyの linklist に相当） */
export interface Menu {
  id: string;
  handle: string;             // "main-menu", "footer" 等
  title: string;
  items: MenuItem[];
  shopifyMenuId?: string;     // Shopify側の Menu GID（同期用）
}

/** ナビゲーション描画オプション */
export interface NavRenderOptions {
  logoText: string;
  logoUrl: string;
  logoImage?: string;
  showSearch: boolean;
  showAccount: boolean;
  showCart: boolean;
  cartCount?: number;
  announcementText?: string;
}

/** フッターメニュー構成 */
export interface FooterMenus {
  columns: Menu[];            // 各カラムのメニュー
  bottom?: Menu;              // ポリシーリンク等
}

/** フッター描画オプション */
export interface FooterRenderOptions {
  brandName: string;
  brandStory?: string;
  socialLinks?: { platform: string; url: string }[];
  showNewsletter: boolean;
  showPaymentIcons: boolean;
  copyrightYear?: number;
}

/** ヘッダー構成設定 */
export interface HeaderConfig {
  announcement: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  navigation: {
    sectionId: string;        // "nav-elegant-dropdown" 等
    menuHandle: string;       // "main-menu"（Menu テーブルの handle）
    options: NavRenderOptions;
  };
  /** ページ種別ごとの上書き */
  pageOverrides?: Partial<Record<PageType, {
    additionalSections?: SectionRef[];
    navigationOverride?: string;
  }>>;
}

/** フッター構成設定 */
export interface FooterConfig {
  sectionId: string;          // "footer-elegant-columns" 等
  menuHandles: string[];      // ["footer-shop", "footer-support", ...]
  bottomMenuHandle?: string;  // "footer-legal"
  options: FooterRenderOptions;
}

/** サイト全体の共通レイアウト設定 */
export interface ThemeLayout {
  id: string;
  header: HeaderConfig;
  footer: FooterConfig;
  globalTokens: DesignTokenSet;
  fonts: FontDef[];
  /** Shopify カラースキーム定義 */
  colorSchemes?: ColorScheme[];
}

/** Shopify カラースキーム */
export interface ColorScheme {
  id: string;
  label: string;
  colors: {
    background: string;
    text: string;
    accent: string;
    button: string;
    buttonText: string;
  };
}

// ============================================================
// Gen-4: ナビゲーション/フッター セクション拡張
// プレースホルダーベースではなく MenuData ベースの描画
// ============================================================

/** ナビゲーションセクションテンプレート */
export interface NavigationSectionTemplate {
  id: string;
  category: "navigation";
  variant: SectionVariant;
  name: string;
  nameJa: string;            // テーマエディタ用日本語名
  description: string;
  tones: DesignTone[];
  css: string;
  animations: AnimationDef[];
  /** メニューデータからHTMLを生成 */
  render: (menu: Menu, options: NavRenderOptions) => string;
  /** モバイルメニューのHTML生成 */
  renderMobile: (menu: Menu, options: NavRenderOptions) => string;
  /** Shopifyテーマ書き出し用Liquidテンプレート */
  liquidTemplate: string;
  /** 能力 */
  supportsMegaMenu: boolean;
  maxDepth: number;           // 1=フラット, 2=ドロップダウン, 3=メガメニュー
  supportsSearch: boolean;
}

/** フッターセクションテンプレート */
export interface FooterSectionTemplate {
  id: string;
  category: "footer";
  variant: SectionVariant;
  name: string;
  nameJa: string;
  description: string;
  tones: DesignTone[];
  css: string;
  animations: AnimationDef[];
  /** フッターメニューからHTMLを生成 */
  render: (menus: FooterMenus, options: FooterRenderOptions) => string;
  /** Shopifyテーマ書き出し用Liquidテンプレート */
  liquidTemplate: string;
}

/** セクション種別判別 */
export function isNavigationSection(s: unknown): s is NavigationSectionTemplate {
  return (
    typeof s === "object" && s !== null &&
    (s as Record<string, unknown>).category === "navigation" &&
    typeof (s as Record<string, unknown>).render === "function"
  );
}

export function isFooterSection(s: unknown): s is FooterSectionTemplate {
  return (
    typeof s === "object" && s !== null &&
    (s as Record<string, unknown>).category === "footer" &&
    typeof (s as Record<string, unknown>).render === "function"
  );
}

// ============================================================
// Gen-4: アセンブリ結果（3ゾーン分離）
// ============================================================

/** ページ組み立て結果 */
export interface AssembledPage {
  headerHtml: string;
  headerCss: string;
  contentHtml: string;
  contentCss: string;
  footerHtml: string;
  footerCss: string;
  /** 統合HTML（プレビュー用） */
  fullHtml: string;
  /** 統合CSS */
  fullCss: string;
  meta: ConversionMeta;
}

// ============================================================
// Gen-4: Shopify テーマ互換性
// ============================================================

/** Shopifyセクションスキーマの enabled_on/disabled_on */
export interface SectionAvailability {
  /** セクションを有効にするテンプレート/グループ */
  enabled_on?: {
    templates?: string[];     // ["product", "collection"]
    groups?: string[];        // ["header", "footer"]
  };
  /** セクションを無効にするテンプレート/グループ */
  disabled_on?: {
    templates?: string[];
    groups?: string[];
  };
}

/** Shopifyセクションスキーマのブロック定義 */
export interface SectionBlockDef {
  type: string;               // "@app", "@theme", またはカスタムブロックタイプ
  name?: string;
  settings?: SectionSchemaSetting[];
  limit?: number;
}

/** Shopifyセクションスキーマの設定定義 */
export interface SectionSchemaSetting {
  type: string;               // "text", "image_picker", "color_scheme", "font_picker", "link_list" 等
  id: string;
  label: string;
  default?: unknown;
  info?: string;
  allow_dynamic_source?: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: Array<{ value: string; label: string }>;
}

/** Liquid変換用のセクションメタ（拡張版） */
export interface SectionLiquidMeta {
  /** テーマエディタ表示名（日本語） */
  schemaName: string;
  /** セクションの有効範囲 */
  availability?: SectionAvailability;
  /** 受け入れるブロックタイプ */
  blocks?: SectionBlockDef[];
  /** 追加のスキーマ設定（color_scheme, font_picker等） */
  extraSettings?: SectionSchemaSetting[];
  /** Liquidテンプレート（メニュー連動ナビ等） */
  liquidTemplate?: string;
  /** セクション数制限 */
  limit?: number;
}

/** デプロイモード */
export type DeployMode =
  | "full"                    // Aicataフルテーマ（theme.aicata.liquid 使用）
  | "inject"                  // 既存テーマにセクション注入
  | "template";               // テンプレート差し替え（ページ単位）

/** デプロイ互換性情報 */
export interface DeployCompatibility {
  shopifyApiVersion: string;
  themeBlocksUsed: boolean;
  colorSchemesUsed: boolean;
  appBlocksEnabled: boolean;
  deployMode: DeployMode;
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
