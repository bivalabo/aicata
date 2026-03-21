// ============================================================
// Aicata — Shopify Compatibility Layer
//
// Shopifyの大型アップデートに対応するための互換性管理システム
// すべてのShopify API依存はこのファイルを通して参照する
//
// 設計原則:
//   1. APIバージョンの一元管理 — 1箇所変更で全体に反映
//   2. 機能検出（Feature Detection）— 存在を前提にしない
//   3. グレースフルデグレデーション — 非対応でもエラーにしない
//   4. 設定値の外部化 — 環境変数で上書き可能
// ============================================================

// ── API Version Management ──

/**
 * サポートするShopify APIバージョン
 * 環境変数で上書き可能: SHOPIFY_API_VERSION=2025-01
 *
 * Shopifyは四半期ごとに新バージョンをリリースし、
 * リリースから12ヶ月後に非サポートとなる
 * https://shopify.dev/docs/api/usage/versioning
 */
export const SHOPIFY_API_VERSION =
  process.env.SHOPIFY_API_VERSION || "2024-10";

/**
 * フォールバックバージョン（メインが失敗した場合に試行）
 */
export const SHOPIFY_API_VERSION_FALLBACK =
  process.env.SHOPIFY_API_VERSION_FALLBACK || "2024-07";

/**
 * APIバージョンの妥当性チェック（YYYY-MM 形式）
 */
export function isValidApiVersion(version: string): boolean {
  return /^\d{4}-\d{2}$/.test(version);
}

// ── OAuth Configuration ──

export const OAUTH_CONFIG = {
  /**
   * OAuth認証エンドポイント
   * 2024時点の形式: https://{shop}/admin/oauth/authorize
   */
  authorizePath: "/admin/oauth/authorize",

  /**
   * トークン交換エンドポイント
   */
  tokenPath: "/admin/oauth/access_token",

  /**
   * 必要なOAuthスコープ
   * 環境変数で上書き可能: SHOPIFY_SCOPES=read_content,write_content,...
   */
  scopes:
    process.env.SHOPIFY_SCOPES ||
    "read_content,write_content,read_themes,write_themes,read_products,read_orders",
} as const;

// ── REST API Endpoint Paths ──

/**
 * Shopify REST APIのエンドポイントパス定義
 * バージョンプレフィックス(/admin/api/{version}/)は shopifyFetch で自動付与
 *
 * 各パスは関数として定義し、パラメータの安全な埋め込みを保証
 */
export const ENDPOINTS = {
  // Shop
  shop: () => "shop.json",

  // Pages (Content API)
  pages: {
    list: (limit = 250) => `pages.json?limit=${limit}`,
    get: (id: string | number) => `pages/${id}.json`,
    create: () => "pages.json",
    update: (id: string | number) => `pages/${id}.json`,
    delete: (id: string | number) => `pages/${id}.json`,
  },

  // Themes (Online Store)
  themes: {
    list: () => "themes.json",
    assets: {
      list: (themeId: string | number) => `themes/${themeId}/assets.json`,
      get: (themeId: string | number, key: string) =>
        `themes/${themeId}/assets.json?asset[key]=${encodeURIComponent(key)}`,
      put: (themeId: string | number) => `themes/${themeId}/assets.json`,
      delete: (themeId: string | number, key: string) =>
        `themes/${themeId}/assets.json?asset[key]=${encodeURIComponent(key)}`,
    },
  },
} as const;

// ── Shopify Domain Handling ──

/**
 * ストアドメインのサフィックス
 * 環境変数で上書き可能: SHOPIFY_DOMAIN_SUFFIX=.myshopify.com
 */
export const SHOPIFY_DOMAIN_SUFFIX =
  process.env.SHOPIFY_DOMAIN_SUFFIX || ".myshopify.com";

/**
 * ストアドメインを正規化
 */
export function normalizeShopDomain(shop: string): string {
  let s = shop.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "");
  s = s.replace(/\/+$/, "");
  if (!s.endsWith(SHOPIFY_DOMAIN_SUFFIX)) {
    s = `${s}${SHOPIFY_DOMAIN_SUFFIX}`;
  }
  return s;
}

/**
 * ストアの短縮名を取得（.myshopify.comを除去）
 */
export function getShopName(shop: string): string {
  return normalizeShopDomain(shop).replace(
    new RegExp(`\\${SHOPIFY_DOMAIN_SUFFIX}$`),
    "",
  );
}

// ── Theme File Structure ──

/**
 * Online Store 2.0 テーマのファイル構造定義
 * Shopifyがファイル構造を変更した場合はここを更新
 */
export const THEME_STRUCTURE = {
  /** テンプレートディレクトリ */
  templatesDir: "templates",
  /** セクションディレクトリ */
  sectionsDir: "sections",
  /** アセットディレクトリ */
  assetsDir: "assets",
  /** Aicataプレフィックス（衝突回避） */
  prefix: "aicata",

  /** テンプレートファイルパスを生成 */
  templatePath: (type: string, suffix: string) =>
    `templates/${type}.aicata-${suffix}.json`,

  /** セクションファイルパスを生成 */
  sectionPath: (sectionId: string) =>
    `sections/aicata-${sectionId}.liquid`,

  /** CSSアセットパスを生成 */
  cssAssetPath: (suffix: string) =>
    `assets/aicata-${suffix}.css`,
} as const;

// ── Page Type → Template Type Mapping ──

/**
 * Aicata内部のPageTypeからShopifyテンプレートタイプへのマッピング
 * Shopifyがテンプレートタイプを変更した場合はここを更新
 */
export const PAGE_TYPE_TO_TEMPLATE: Record<string, string> = {
  landing: "index",
  product: "product",
  collection: "collection",
  "list-collections": "list-collections",
  cart: "cart",
  blog: "blog",
  article: "article",
  about: "page",
  contact: "page",
  search: "search",
  account: "customers/account",
  password: "password",
  "404": "404",
  general: "page",
};

// ── Shopify URL Patterns (for site crawling) ──

/**
 * ShopifyのデフォルトURLパスパターン
 * ストアがカスタムURLを使用している場合は正確に検出できない場合がある
 */
export const SHOPIFY_URL_PATTERNS: Array<{
  pattern: RegExp;
  type: string;
}> = [
  { pattern: /^\/$/, type: "landing" },
  { pattern: /^\/collections\/[^/]+$/, type: "collection" },
  { pattern: /^\/collections\/?$/, type: "list-collections" },
  { pattern: /^\/products\/[^/]+$/, type: "product" },
  { pattern: /^\/cart\/?$/, type: "cart" },
  { pattern: /^\/blogs\/[^/]+$/, type: "blog" },
  { pattern: /^\/blogs\/[^/]+\/[^/]+$/, type: "article" },
  { pattern: /^\/pages\/about/i, type: "about" },
  { pattern: /^\/pages\/contact/i, type: "contact" },
  { pattern: /^\/pages\/faq/i, type: "about" },
  { pattern: /^\/pages\/[^/]+$/, type: "about" },
  { pattern: /^\/search\/?$/, type: "search" },
  { pattern: /^\/account/, type: "account" },
  { pattern: /^\/password\/?$/, type: "password" },
];

// ── Theme Role Detection ──

/**
 * テーマロール定義
 * Shopifyが新しいロールを追加した場合でもメインテーマ検出が動作する
 */
export const THEME_ROLES = {
  /** 公開中のメインテーマ */
  main: "main",
  /** 未公開テーマ */
  unpublished: "unpublished",
  /** デモテーマ */
  demo: "demo",
} as const;

/**
 * メインテーマかどうかを判定
 * role === "main" だけでなく、将来のロール名変更にも対応
 */
export function isMainTheme(theme: { role: string }): boolean {
  const role = theme.role.toLowerCase();
  return role === THEME_ROLES.main || role === "published" || role === "live";
}

// ── Liquid Template Filters ──

/**
 * Shopify Liquidフィルター定義
 * フィルター名が変更された場合はここを更新するだけで全テンプレートに反映
 */
export const LIQUID_FILTERS = {
  /** 通貨フォーマット */
  money: "money",
  /** 画像URL生成 */
  imageUrl: "image_url",
  /** HTMLエスケープ */
  escape: "escape",
  /** 日付フォーマット */
  date: "date",
  /** JSONエンコード */
  json: "json",
} as const;

/**
 * Shopify Liquidオブジェクトのフィールドマッピング
 * フィールド名が変更された場合はここを更新
 */
export const LIQUID_OBJECTS = {
  product: {
    title: "product.title",
    price: "product.price",
    description: "product.description",
    featuredImage: "product.featured_image",
    available: "product.available",
    sku: "product.selected_or_first_available_variant.sku",
    vendor: "product.vendor",
    type: "product.type",
  },
  collection: {
    title: "collection.title",
    description: "collection.description",
    image: "collection.image",
    productsCount: "collection.products_count",
  },
  cart: {
    totalPrice: "cart.total_price",
    itemCount: "cart.item_count",
  },
  routes: {
    cartUrl: "routes.cart_url",
    rootUrl: "routes.root_url",
  },
} as const;

// ── Preview URL Builder ──

/**
 * テーマプレビューURLを構築
 * Shopifyの管理画面URL構造が変わった場合はここを更新
 */
export function buildPreviewUrl(
  shop: string,
  templateType: string,
  suffix: string,
): string {
  const shopName = getShopName(shop);
  const base = `https://${shopName}${SHOPIFY_DOMAIN_SUFFIX}`;

  switch (templateType) {
    case "index":
      return `${base}/?view=aicata-${suffix}`;
    case "product":
    case "collection":
    case "blog":
    case "article":
      return `${base}/admin/themes/current/editor?template=${templateType}.aicata-${suffix}`;
    default:
      return `${base}/admin/themes/current/editor`;
  }
}

// ── Sitemap Naming Convention ──

/**
 * Shopifyのサイトマップ子ファイル命名パターン
 * 命名規則が変わった場合はここを更新
 */
export const SITEMAP_PATTERNS = [
  "sitemap_pages",
  "sitemap_collections",
  "sitemap_products",
  "sitemap_blogs",
] as const;

/**
 * サイトマップURLがAicataに関連するかどうかを判定
 */
export function isRelevantSitemap(url: string): boolean {
  return SITEMAP_PATTERNS.some((p) => url.includes(p));
}

// ── API Health Check ──

/**
 * 現在のAPIバージョンが有効かどうかをチェック
 * @returns { valid, currentVersion, suggestedVersion? }
 */
export async function checkApiHealth(
  shop: string,
  accessToken: string,
): Promise<{
  valid: boolean;
  currentVersion: string;
  latestStableVersion?: string;
  deprecationWarning?: string;
}> {
  try {
    const sanitized = normalizeShopDomain(shop);
    const url = `https://${sanitized}/admin/api/${SHOPIFY_API_VERSION}/shop.json`;

    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    // Check for API version deprecation headers
    const apiVersion = res.headers.get("x-shopify-api-version");
    const deprecation = res.headers.get("x-shopify-api-deprecated-reason");
    const sunset = res.headers.get("sunset");

    return {
      valid: res.ok,
      currentVersion: SHOPIFY_API_VERSION,
      latestStableVersion: apiVersion || undefined,
      deprecationWarning: deprecation
        ? `API version ${SHOPIFY_API_VERSION} is deprecated: ${deprecation}${sunset ? ` (Sunset: ${sunset})` : ""}`
        : undefined,
    };
  } catch {
    return {
      valid: false,
      currentVersion: SHOPIFY_API_VERSION,
    };
  }
}

// ── Feature Capability Detection ──

export interface StoreCapabilities {
  /** Online Store 2.0対応か */
  supportsOS2: boolean;
  /** JSONテンプレート対応か */
  supportsJsonTemplates: boolean;
  /** セクションベーステーマか */
  supportsSections: boolean;
  /** Asset API利用可能か */
  supportsAssetApi: boolean;
  /** 検出されたテーマエンジン */
  themeEngine: "os2" | "legacy" | "unknown";
}

/**
 * ストアの機能を検出する
 * テーマのファイル構造を調べ、何がサポートされているかを返す
 */
export async function detectStoreCapabilities(
  shop: string,
  accessToken: string,
  themeId: string | number,
): Promise<StoreCapabilities> {
  const defaults: StoreCapabilities = {
    supportsOS2: false,
    supportsJsonTemplates: false,
    supportsSections: false,
    supportsAssetApi: true,
    themeEngine: "unknown",
  };

  try {
    const sanitized = normalizeShopDomain(shop);
    const url = `https://${sanitized}/admin/api/${SHOPIFY_API_VERSION}/themes/${themeId}/assets.json`;

    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return defaults;

    const data = await res.json();
    const assets = (data.assets || []) as Array<{ key: string }>;

    // Check for OS2 indicators
    const hasJsonTemplates = assets.some((a) =>
      /^templates\/.*\.json$/.test(a.key),
    );
    const hasSections = assets.some((a) => a.key.startsWith("sections/"));
    const hasConfig = assets.some((a) => a.key === "config/settings_schema.json");

    const supportsOS2 = hasJsonTemplates && hasSections;

    return {
      supportsOS2,
      supportsJsonTemplates: hasJsonTemplates,
      supportsSections: hasSections,
      supportsAssetApi: true,
      themeEngine: supportsOS2 ? "os2" : hasSections ? "legacy" : "unknown",
    };
  } catch {
    return defaults;
  }
}
