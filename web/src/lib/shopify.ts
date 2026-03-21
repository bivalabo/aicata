/**
 * Shopify API クライアント & OAuth ユーティリティ
 *
 * Shopify Admin REST API を使って、ストアのページ管理を行う
 * OAuth 2.0 フローでアクセストークンを取得する
 */

import crypto from "crypto";
import {
  SHOPIFY_API_VERSION,
  OAUTH_CONFIG,
  ENDPOINTS,
  normalizeShopDomain,
} from "./shopify-compat";

// --- 環境変数 ---
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || "";
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || "";
const SHOPIFY_SCOPES = OAUTH_CONFIG.scopes;
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_VERSION = SHOPIFY_API_VERSION;

// --- OAuth ---

/** OAuth認証URLを生成 */
export function buildAuthUrl(shop: string, state: string): string {
  const sanitized = sanitizeShop(shop);
  const redirectUri = `${APP_URL}/api/shopify/callback`;
  const params = new URLSearchParams({
    client_id: SHOPIFY_API_KEY,
    scope: SHOPIFY_SCOPES,
    redirect_uri: redirectUri,
    state,
  });
  return `https://${sanitized}/admin/oauth/authorize?${params.toString()}`;
}

/** OAuthコールバックでアクセストークンを取得 */
export async function exchangeCodeForToken(
  shop: string,
  code: string,
): Promise<{ access_token: string; scope: string }> {
  const sanitized = sanitizeShop(shop);
  const res = await fetch(
    `https://${sanitized}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  return res.json();
}

/** HMACを検証してShopifyからの正規のリクエストか確認 */
export function verifyHmac(query: Record<string, string>): boolean {
  const { hmac, ...rest } = query;
  if (!hmac) return false;

  const sorted = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("&");

  const computed = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET)
    .update(sorted)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hmac, "hex"),
    Buffer.from(computed, "hex"),
  );
}

/** CSRFトークン生成 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

// --- Admin REST API ---

export interface ShopifyPage {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  author: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  template_suffix: string | null;
}

export interface ShopifyShopInfo {
  id: number;
  name: string;
  email: string;
  domain: string;
  myshopify_domain: string;
  plan_name: string;
}

/** Shopify Admin API リクエスト */
async function shopifyFetch<T>(
  shop: string,
  accessToken: string,
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const sanitized = sanitizeShop(shop);
  const url = `https://${sanitized}/admin/api/${API_VERSION}/${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify API error: ${res.status} ${text}`);
  }

  // DELETE は 200 で空ボディの場合がある
  if (res.status === 200 && res.headers.get("content-length") === "0") {
    return {} as T;
  }

  return res.json();
}

/** ストア情報を取得 */
export async function getShopInfo(
  shop: string,
  accessToken: string,
): Promise<ShopifyShopInfo> {
  const data = await shopifyFetch<{ shop: ShopifyShopInfo }>(
    shop,
    accessToken,
    "shop.json",
  );
  return data.shop;
}

/** ページ一覧を取得 */
export async function listPages(
  shop: string,
  accessToken: string,
): Promise<ShopifyPage[]> {
  const data = await shopifyFetch<{ pages: ShopifyPage[] }>(
    shop,
    accessToken,
    "pages.json?limit=250",
  );
  return data.pages;
}

/** ページ詳細を取得 */
export async function getPage(
  shop: string,
  accessToken: string,
  pageId: number,
): Promise<ShopifyPage> {
  const data = await shopifyFetch<{ page: ShopifyPage }>(
    shop,
    accessToken,
    `pages/${pageId}.json`,
  );
  return data.page;
}

/** ページを新規作成 */
export async function createPage(
  shop: string,
  accessToken: string,
  page: {
    title: string;
    body_html: string;
    handle?: string;
    published?: boolean;
  },
): Promise<ShopifyPage> {
  const data = await shopifyFetch<{ page: ShopifyPage }>(
    shop,
    accessToken,
    "pages.json",
    {
      method: "POST",
      body: JSON.stringify({ page }),
    },
  );
  return data.page;
}

/** ページを更新 */
export async function updatePage(
  shop: string,
  accessToken: string,
  pageId: number,
  page: {
    title?: string;
    body_html?: string;
    handle?: string;
    published?: boolean;
  },
): Promise<ShopifyPage> {
  const data = await shopifyFetch<{ page: ShopifyPage }>(
    shop,
    accessToken,
    `pages/${pageId}.json`,
    {
      method: "PUT",
      body: JSON.stringify({ page }),
    },
  );
  return data.page;
}

/** ページを削除 */
export async function deletePage(
  shop: string,
  accessToken: string,
  pageId: number,
): Promise<void> {
  await shopifyFetch(
    shop,
    accessToken,
    `pages/${pageId}.json`,
    { method: "DELETE" },
  );
}

// --- Theme API ---

export interface ShopifyTheme {
  id: number;
  name: string;
  role: "main" | "unpublished" | "demo";
  theme_store_id: number | null;
  previewable: boolean;
  processing: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShopifyAsset {
  key: string;
  value?: string;
  attachment?: string; // base64 for binary files
  content_type: string;
  size: number;
  theme_id: number;
  created_at: string;
  updated_at: string;
}

/** テーマ一覧を取得 */
export async function listThemes(
  shop: string,
  accessToken: string,
): Promise<ShopifyTheme[]> {
  const data = await shopifyFetch<{ themes: ShopifyTheme[] }>(
    shop,
    accessToken,
    "themes.json",
  );
  return data.themes;
}

/** メインテーマ（公開中テーマ）を取得 */
export async function getMainTheme(
  shop: string,
  accessToken: string,
): Promise<ShopifyTheme | null> {
  const themes = await listThemes(shop, accessToken);
  return themes.find((t) => t.role === "main") || null;
}

/** テーマアセット一覧を取得 */
export async function listAssets(
  shop: string,
  accessToken: string,
  themeId: number,
): Promise<ShopifyAsset[]> {
  const data = await shopifyFetch<{ assets: ShopifyAsset[] }>(
    shop,
    accessToken,
    `themes/${themeId}/assets.json`,
  );
  return data.assets;
}

/** テーマアセットを取得 */
export async function getAsset(
  shop: string,
  accessToken: string,
  themeId: number,
  key: string,
): Promise<ShopifyAsset> {
  const data = await shopifyFetch<{ asset: ShopifyAsset }>(
    shop,
    accessToken,
    `themes/${themeId}/assets.json?asset[key]=${encodeURIComponent(key)}`,
  );
  return data.asset;
}

/**
 * テーマアセットを作成/更新
 * Online Store 2.0 のテーマファイル操作の核心
 *
 * - templates/product.aicata.json → 商品ページテンプレート
 * - sections/aicata-*.liquid → セクションファイル
 * - assets/aicata-*.css → CSSファイル
 */
export async function putAsset(
  shop: string,
  accessToken: string,
  themeId: number,
  asset: { key: string; value: string },
): Promise<ShopifyAsset> {
  const data = await shopifyFetch<{ asset: ShopifyAsset }>(
    shop,
    accessToken,
    `themes/${themeId}/assets.json`,
    {
      method: "PUT",
      body: JSON.stringify({ asset }),
    },
  );
  return data.asset;
}

/** テーマアセットを削除 */
export async function deleteAsset(
  shop: string,
  accessToken: string,
  themeId: number,
  key: string,
): Promise<void> {
  await shopifyFetch(
    shop,
    accessToken,
    `themes/${themeId}/assets.json?asset[key]=${encodeURIComponent(key)}`,
    { method: "DELETE" },
  );
}

/**
 * Aicata生成ページをShopifyテーマにデプロイする
 *
 * Online Store 2.0 の仕組み:
 * 1. sections/aicata-{id}.liquid — セクションのLiquid+CSS
 * 2. templates/{type}.aicata-{suffix}.json — JSONテンプレート（セクション参照）
 * 3. assets/aicata-{id}.css — 共有CSS（デザイントークン等）
 *
 * @returns デプロイされたファイルパスの配列
 */
export async function deployToTheme(
  shop: string,
  accessToken: string,
  themeId: number,
  deployment: {
    templateType: string; // "product", "collection", "index", etc.
    templateSuffix: string; // "aicata-luxury" → product.aicata-luxury.json
    sectionFiles: Array<{ key: string; value: string }>;
    templateJson: string;
    cssContent?: string;
  },
): Promise<string[]> {
  const deployedFiles: string[] = [];

  // 1. セクションファイルをアップロード
  for (const section of deployment.sectionFiles) {
    await putAsset(shop, accessToken, themeId, section);
    deployedFiles.push(section.key);
  }

  // 2. CSSアセットがあればアップロード
  if (deployment.cssContent) {
    const cssKey = `assets/aicata-${deployment.templateSuffix}.css`;
    await putAsset(shop, accessToken, themeId, {
      key: cssKey,
      value: deployment.cssContent,
    });
    deployedFiles.push(cssKey);
  }

  // 3. JSONテンプレートをアップロード
  const templateKey =
    deployment.templateType === "index"
      ? `templates/index.aicata-${deployment.templateSuffix}.json`
      : `templates/${deployment.templateType}.aicata-${deployment.templateSuffix}.json`;
  await putAsset(shop, accessToken, themeId, {
    key: templateKey,
    value: deployment.templateJson,
  });
  deployedFiles.push(templateKey);

  return deployedFiles;
}

// --- ユーティリティ ---

/** shop ドメインをサニタイズ（xxx.myshopify.com 形式に正規化）*/
export function sanitizeShop(shop: string): string {
  return normalizeShopDomain(shop);
}

/** Shopify API Key が設定されているか */
export function isShopifyConfigured(): boolean {
  return !!SHOPIFY_API_KEY && !!SHOPIFY_API_SECRET;
}
