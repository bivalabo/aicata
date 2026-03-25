/**
 * メディア資産管理
 *
 * Aicataはファイルを保持しない。
 * クロール時にURLを記録し、デプロイ時にShopify Files APIへ直接転送。
 *
 * フロー:
 * 1. クロール時: extractImageUrls() → DB に MediaAsset(status=pending) を作成
 * 2. プレビュー時: 元サイトのURLをそのまま <img src="..."> で参照
 * 3. デプロイ時: uploadAssetsToShopify() → Shopify fileCreate API でアップロード
 *    → 返却されたCDN URLでHTML内のsrcを書き換え
 */

import { prisma } from "@/lib/db";

// ============================================================
// 1. クロール時: 画像URL収集
// ============================================================

export interface ExtractedImage {
  src: string;
  alt: string;
  context: "hero" | "product" | "logo" | "background" | "content";
}

/**
 * HTMLから画像URLを抽出する
 * クロール済みのページHTMLを解析し、画像情報を返す
 */
export function extractImageUrls(
  html: string,
  baseUrl: string,
): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  const seen = new Set<string>();

  // <img> タグから抽出
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = resolveUrl(match[1], baseUrl);
    if (!src || seen.has(src)) continue;
    seen.add(src);

    const alt = extractAttr(match[0], "alt") || "";
    const context = inferImageContext(match[0], src, alt);
    images.push({ src, alt, context });
  }

  // CSS background-image から抽出
  const bgRegex = /background(?:-image)?\s*:\s*url\(["']?([^"')]+)["']?\)/gi;
  while ((match = bgRegex.exec(html)) !== null) {
    const src = resolveUrl(match[1], baseUrl);
    if (!src || seen.has(src)) continue;
    seen.add(src);
    images.push({ src, alt: "", context: "background" });
  }

  // <source> タグ（picture要素内）
  const sourceRegex = /<source[^>]+srcset=["']([^"'\s]+)/gi;
  while ((match = sourceRegex.exec(html)) !== null) {
    const src = resolveUrl(match[1], baseUrl);
    if (!src || seen.has(src)) continue;
    seen.add(src);
    images.push({ src, alt: "", context: "content" });
  }

  return images;
}

/**
 * 抽出した画像URLをDBに保存する
 * 重複はスキップ（sourceUrl + sourceDomain で一意）
 */
export async function saveExtractedImages(
  images: ExtractedImage[],
  sourceDomain: string,
  pageId?: string,
): Promise<number> {
  let savedCount = 0;

  for (const img of images) {
    try {
      await prisma.mediaAsset.upsert({
        where: {
          sourceUrl_sourceDomain: {
            sourceUrl: img.src,
            sourceDomain,
          },
        },
        create: {
          sourceUrl: img.src,
          sourceDomain,
          alt: img.alt,
          context: img.context,
          mimeType: guessMimeType(img.src),
          pageId: pageId || null,
          status: "pending",
        },
        update: {
          // 既存レコードがあればaltとcontextだけ更新
          alt: img.alt || undefined,
          context: img.context,
          pageId: pageId || undefined,
        },
      });
      savedCount++;
    } catch (e) {
      // 重複エラー等はスキップ
      console.warn("[MediaAssets] Failed to save image:", img.src, e);
    }
  }

  return savedCount;
}

// ============================================================
// 2. Shopify Files API アップロード
// ============================================================

interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/**
 * Shopify GraphQL Admin APIを呼び出す
 */
async function shopifyGraphQL<T>(
  shop: string,
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(
    `https://${shop}/admin/api/2025-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify GraphQL error: ${res.status} ${text}`);
  }

  const json = (await res.json()) as ShopifyGraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Shopify GraphQL errors: ${json.errors.map((e) => e.message).join(", ")}`);
  }

  return json.data as T;
}

/**
 * 外部URLからShopifyにファイルをアップロード（fileCreate）
 * Shopifyが元URLからファイルをダウンロードしてCDNにホスティングする
 */
export async function uploadFileFromUrl(
  shop: string,
  accessToken: string,
  sourceUrl: string,
  alt: string = "",
): Promise<{ fileId: string; cdnUrl: string } | null> {
  const mutation = `
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          id
          alt
          ... on MediaImage {
            image {
              url
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const data = await shopifyGraphQL<{
      fileCreate: {
        files: Array<{
          id: string;
          alt: string;
          image?: { url: string };
        }>;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(shop, accessToken, mutation, {
      files: [
        {
          originalSource: sourceUrl,
          alt: alt || undefined,
          contentType: "IMAGE",
        },
      ],
    });

    const result = data.fileCreate;
    if (result.userErrors.length > 0) {
      console.error("[MediaAssets] fileCreate errors:", result.userErrors);
      return null;
    }

    const file = result.files[0];
    if (!file) return null;

    // 注: fileCreate直後はimage.urlがnullの場合がある（処理中）
    // Shopifyは非同期で処理するため、CDN URLは後でポーリングが必要
    return {
      fileId: file.id,
      cdnUrl: file.image?.url || "",
    };
  } catch (e) {
    console.error("[MediaAssets] uploadFileFromUrl failed:", sourceUrl, e);
    return null;
  }
}

/**
 * Shopify Files APIでファイルの処理状態を確認する
 * fileCreate後、画像が処理されるまでポーリングに使用
 */
export async function checkFileStatus(
  shop: string,
  accessToken: string,
  fileId: string,
): Promise<{ status: string; url: string | null }> {
  const query = `
    query fileStatus($id: ID!) {
      node(id: $id) {
        ... on MediaImage {
          fileStatus
          image {
            url
          }
        }
        ... on GenericFile {
          fileStatus
          url
        }
      }
    }
  `;

  const data = await shopifyGraphQL<{
    node: {
      fileStatus: string;
      image?: { url: string };
      url?: string;
    } | null;
  }>(shop, accessToken, query, { id: fileId });

  if (!data.node) {
    return { status: "NOT_FOUND", url: null };
  }

  return {
    status: data.node.fileStatus, // UPLOADED, PROCESSING, READY, FAILED
    url: data.node.image?.url || data.node.url || null,
  };
}

/**
 * ページに紐づくMediaAssetをShopifyにアップロードし、
 * CDN URLを取得してDBを更新する
 *
 * @returns アップロード完了した件数
 */
export async function uploadAssetsToShopify(
  shop: string,
  accessToken: string,
  pageId: string,
): Promise<{ uploaded: number; failed: number; urlMap: Map<string, string> }> {
  // このページに紐づく未アップロード画像を取得
  const pendingAssets = await prisma.mediaAsset.findMany({
    where: {
      pageId,
      status: { in: ["pending", "failed"] },
    },
  });

  if (pendingAssets.length === 0) {
    return { uploaded: 0, failed: 0, urlMap: new Map() };
  }

  let uploaded = 0;
  let failed = 0;
  const urlMap = new Map<string, string>(); // sourceUrl → shopifyCdnUrl

  for (const asset of pendingAssets) {
    try {
      // ステータスを「アップロード中」に更新
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: { status: "uploading" },
      });

      const result = await uploadFileFromUrl(
        shop,
        accessToken,
        asset.sourceUrl,
        asset.alt,
      );

      if (!result) {
        await prisma.mediaAsset.update({
          where: { id: asset.id },
          data: { status: "failed", errorMessage: "fileCreate returned null" },
        });
        failed++;
        continue;
      }

      // CDN URLがまだない場合はポーリング（最大30秒）
      let cdnUrl = result.cdnUrl;
      if (!cdnUrl && result.fileId) {
        for (let i = 0; i < 6; i++) {
          await new Promise((r) => setTimeout(r, 5000));
          const status = await checkFileStatus(shop, accessToken, result.fileId);
          if (status.url) {
            cdnUrl = status.url;
            break;
          }
          if (status.status === "FAILED") break;
        }
      }

      if (cdnUrl) {
        await prisma.mediaAsset.update({
          where: { id: asset.id },
          data: {
            status: "uploaded",
            shopifyFileId: result.fileId,
            shopifyCdnUrl: cdnUrl,
          },
        });
        urlMap.set(asset.sourceUrl, cdnUrl);
        uploaded++;
      } else {
        // CDN URLが取得できなかった場合でもfileIdは保存
        await prisma.mediaAsset.update({
          where: { id: asset.id },
          data: {
            status: "uploaded",
            shopifyFileId: result.fileId,
            shopifyCdnUrl: null,
            errorMessage: "CDN URL not yet available",
          },
        });
        uploaded++;
      }
    } catch (e) {
      console.error("[MediaAssets] Upload failed for:", asset.sourceUrl, e);
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: {
          status: "failed",
          errorMessage: e instanceof Error ? e.message : String(e),
        },
      });
      failed++;
    }
  }

  return { uploaded, failed, urlMap };
}

// ============================================================
// 3. デプロイ時: HTML内の画像URL書き換え
// ============================================================

/**
 * HTML内の画像URLを元サイトURLからShopify CDN URLに書き換える
 */
export function rewriteImageUrls(
  html: string,
  urlMap: Map<string, string>,
): string {
  if (urlMap.size === 0) return html;

  let result = html;

  for (const [sourceUrl, cdnUrl] of urlMap) {
    // src="..." 内のURLを書き換え
    result = result.replaceAll(sourceUrl, cdnUrl);
  }

  return result;
}

/**
 * ページのデプロイ前処理:
 * 1. MediaAssetをShopifyにアップロード
 * 2. HTML内の画像URLを書き換え
 *
 * @returns 書き換え済みHTML
 */
export async function preparePageForDeploy(
  shop: string,
  accessToken: string,
  pageId: string,
  html: string,
): Promise<string> {
  const { urlMap } = await uploadAssetsToShopify(shop, accessToken, pageId);
  return rewriteImageUrls(html, urlMap);
}

/**
 * 既にアップロード済みのMediaAssetのURLマップを取得
 * （再デプロイ時に使用）
 */
export async function getExistingUrlMap(
  pageId: string,
): Promise<Map<string, string>> {
  const assets = await prisma.mediaAsset.findMany({
    where: {
      pageId,
      status: "uploaded",
      shopifyCdnUrl: { not: null },
    },
  });

  const urlMap = new Map<string, string>();
  for (const asset of assets) {
    if (asset.shopifyCdnUrl) {
      urlMap.set(asset.sourceUrl, asset.shopifyCdnUrl);
    }
  }
  return urlMap;
}

// ============================================================
// 5. Shopify Files API: 既存ファイル一覧取得
// ============================================================

export interface ShopifyFile {
  id: string;
  alt: string;
  url: string | null;
  mimeType: string;
  fileStatus: string;
  createdAt: string;
}

/**
 * Shopifyストアの既存ファイル一覧を取得（Files API query）
 * ストアにアップロード済みの画像/動画をページネーション付きで取得
 *
 * @param first 取得件数（最大250）
 * @param after カーソル（次ページ取得用）
 * @param query 検索クエリ（例: "status:READY", "media_type:IMAGE"）
 */
export async function listShopifyFiles(
  shop: string,
  accessToken: string,
  first = 50,
  after?: string,
  query?: string,
): Promise<{
  files: ShopifyFile[];
  hasNextPage: boolean;
  endCursor: string | null;
}> {
  const gqlQuery = `
    query listFiles($first: Int!, $after: String, $query: String) {
      files(first: $first, after: $after, query: $query, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            alt
            createdAt
            ... on MediaImage {
              image {
                url
              }
              mimeType
              fileStatus
            }
            ... on Video {
              sources {
                url
                mimeType
              }
              fileStatus
            }
            ... on GenericFile {
              url
              mimeType
              fileStatus
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const data = await shopifyGraphQL<{
    files: {
      edges: Array<{
        node: {
          id: string;
          alt: string;
          createdAt: string;
          image?: { url: string };
          sources?: Array<{ url: string; mimeType: string }>;
          url?: string;
          mimeType?: string;
          fileStatus?: string;
        };
        cursor: string;
      }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  }>(shop, accessToken, gqlQuery, {
    first: Math.min(first, 250),
    after: after || null,
    query: query || null,
  });

  const files: ShopifyFile[] = data.files.edges.map((edge) => {
    const node = edge.node;
    // 画像: image.url, 動画: sources[0].url, 汎用: url
    const url = node.image?.url || node.sources?.[0]?.url || node.url || null;
    const mimeType = node.mimeType || node.sources?.[0]?.mimeType || "unknown";
    return {
      id: node.id,
      alt: node.alt || "",
      url,
      mimeType,
      fileStatus: node.fileStatus || "UNKNOWN",
      createdAt: node.createdAt,
    };
  });

  return {
    files,
    hasNextPage: data.files.pageInfo.hasNextPage,
    endCursor: data.files.pageInfo.endCursor,
  };
}

// ============================================================
// 6. Unsplash外部画像 → Shopify CDN 自動移行
// ============================================================

/**
 * HTML内のUnsplash外部画像URLをShopify CDNに移行する
 *
 * DDP Personalizer が生成した Unsplash プレースホルダー画像は
 * 外部URLのままになっている。デプロイ前にこれらをShopify CDNに
 * アップロードし、URLを書き換える。
 *
 * @returns 書き換え済みHTML
 */
export async function migrateExternalImages(
  shop: string,
  accessToken: string,
  html: string,
  pageId?: string,
): Promise<string> {
  // 外部画像URLを抽出（Unsplash + その他の外部ドメイン）
  const externalUrlRegex = /https?:\/\/images\.unsplash\.com\/[^\s"'<>]+/g;
  const externalUrls = [...new Set(html.match(externalUrlRegex) || [])];

  if (externalUrls.length === 0) return html;

  console.log(`[MediaAssets] Migrating ${externalUrls.length} external images to Shopify CDN`);

  const urlMap: Record<string, string> = {};

  for (const sourceUrl of externalUrls) {
    try {
      // まずDBに既存のCDN URLがあるか確認
      const existing = await prisma.mediaAsset.findFirst({
        where: { sourceUrl, status: "uploaded", shopifyCdnUrl: { not: null } },
        select: { shopifyCdnUrl: true },
      });

      if (existing?.shopifyCdnUrl) {
        urlMap[sourceUrl] = existing.shopifyCdnUrl;
        continue;
      }

      // Shopifyにアップロード
      const result = await uploadFileFromUrl(shop, accessToken, sourceUrl, "");
      if (!result) continue;

      // ポーリングでCDN URLを取得
      let cdnUrl = result.cdnUrl;
      if (!cdnUrl && result.fileId) {
        for (let i = 0; i < 5; i++) {
          await new Promise((r) => setTimeout(r, 3000));
          const status = await checkFileStatus(shop, accessToken, result.fileId);
          if (status.url) {
            cdnUrl = status.url;
            break;
          }
          if (status.status === "FAILED") break;
        }
      }

      if (cdnUrl) {
        urlMap[sourceUrl] = cdnUrl;

        // DBに記録
        await prisma.mediaAsset.upsert({
          where: {
            sourceUrl_sourceDomain: {
              sourceUrl,
              sourceDomain: "images.unsplash.com",
            },
          },
          create: {
            sourceUrl,
            sourceDomain: "images.unsplash.com",
            shopifyFileId: result.fileId,
            shopifyCdnUrl: cdnUrl,
            status: "uploaded",
            context: "content",
            alt: "",
            pageId: pageId || null,
          },
          update: {
            shopifyFileId: result.fileId,
            shopifyCdnUrl: cdnUrl,
            status: "uploaded",
          },
        });
      }
    } catch (err) {
      console.warn(`[MediaAssets] Failed to migrate: ${sourceUrl}`, err);
    }
  }

  // URL書き換え
  let rewrittenHtml = html;
  for (const [source, cdn] of Object.entries(urlMap)) {
    rewrittenHtml = rewrittenHtml.replaceAll(source, cdn);
  }

  console.log(`[MediaAssets] Migrated ${Object.keys(urlMap).length}/${externalUrls.length} external images`);
  return rewrittenHtml;
}

// ============================================================
// ユーティリティ
// ============================================================

/** 相対URLを絶対URLに解決 */
function resolveUrl(url: string, base: string): string | null {
  if (!url) return null;
  // data: URLs, javascript: はスキップ
  if (url.startsWith("data:") || url.startsWith("javascript:")) return null;
  // 空白やプレースホルダーをスキップ
  if (url.startsWith("{{") || url.includes("{%")) return null; // Liquid

  try {
    return new URL(url, base).href;
  } catch {
    return null;
  }
}

/** HTMLタグから属性値を抽出 */
function extractAttr(tag: string, attr: string): string | null {
  const regex = new RegExp(`${attr}=["']([^"']*)["']`, "i");
  const match = tag.match(regex);
  return match ? match[1] : null;
}

/** 画像のコンテキスト（用途）を推定 */
function inferImageContext(
  imgTag: string,
  src: string,
  alt: string,
): ExtractedImage["context"] {
  const combined = `${imgTag} ${src} ${alt}`.toLowerCase();

  if (combined.includes("logo") || combined.includes("brand")) return "logo";
  if (combined.includes("hero") || combined.includes("banner") || combined.includes("main-visual"))
    return "hero";
  if (combined.includes("product") || combined.includes("item") || combined.includes("goods"))
    return "product";
  if (combined.includes("bg") || combined.includes("background"))
    return "background";

  // クラス名からも推定
  const classVal = extractAttr(imgTag, "class") || "";
  if (classVal.includes("hero") || classVal.includes("banner")) return "hero";
  if (classVal.includes("product")) return "product";
  if (classVal.includes("logo")) return "logo";

  return "content";
}

/** URLからMIMEタイプを推定 */
function guessMimeType(url: string): string | null {
  const path = url.split("?")[0].toLowerCase();
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".gif")) return "image/gif";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".avif")) return "image/avif";
  if (path.endsWith(".mp4")) return "video/mp4";
  if (path.endsWith(".webm")) return "video/webm";
  return null;
}
