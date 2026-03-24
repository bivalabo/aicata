/**
 * Shopify ページ同期 API
 *
 * GET  /api/shopify/pages        — Shopifyからページ・商品・コレクションを取得し、Aicata DBと同期
 * POST /api/shopify/pages        — Aicataで作成したページをShopifyにデプロイ
 */
import { prisma } from "@/lib/db";
import * as shopify from "@/lib/shopify";

/** 接続中のストアを取得するヘルパー */
async function getConnectedStore() {
  const store = await prisma.store.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (!store) {
    throw new Error("NOT_CONNECTED");
  }
  return store;
}

/**
 * Shopify Pages の handle からページタイプを推定する
 */
function classifyPageType(handle: string, title: string): string {
  const h = handle.toLowerCase();
  const t = title.toLowerCase();

  if (h.includes("contact") || t.includes("contact") || t.includes("お問い合わせ"))
    return "contact";
  if (h.includes("about") || t.includes("about") || t.includes("私たちについて"))
    return "about";
  if (h.includes("faq") || t.includes("faq") || t.includes("よくある質問"))
    return "about";
  if (h.includes("blog") || t.includes("blog"))
    return "blog";
  // デフォルトはコンテンツページ（generalだとユーティリティに分類されるため）
  return "about";
}

/**
 * GET: Shopifyからページ・商品・コレクションを取得し、Aicata DBとマージして返す
 */
export async function GET() {
  try {
    const store = await getConnectedStore();

    // Shopifyから並行で取得
    const [shopifyPages, shopifyProducts, shopifyCollections] =
      await Promise.all([
        shopify.listPages(store.shop, store.accessToken),
        shopify
          .listProducts(store.shop, store.accessToken)
          .catch((err) => {
            console.warn("Products fetch failed (may lack scope):", err.message);
            return [] as shopify.ShopifyProduct[];
          }),
        shopify
          .listAllCollections(store.shop, store.accessToken)
          .catch((err) => {
            console.warn("Collections fetch failed (may lack scope):", err.message);
            return [] as shopify.ShopifyCollection[];
          }),
      ]);

    // Aicata DB のページ一覧を取得
    const aicataPages = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
    });

    // 既存の Shopify ID を追跡
    const existingShopifyIds = new Set(
      aicataPages
        .filter((p: any) => p.shopifyPageId)
        .map((p: any) => p.shopifyPageId),
    );

    // ── 1. Shopify Pages (コンテンツページ) を同期 ──
    for (const sp of shopifyPages) {
      const spId = String(sp.id);
      const pageType = classifyPageType(sp.handle, sp.title);

      if (!existingShopifyIds.has(spId)) {
        await prisma.page.create({
          data: {
            title: sp.title,
            slug: sp.handle,
            html: sp.body_html || "",
            css: "",
            status: sp.published_at ? "synced" : "draft",
            shopifyPageId: spId,
            shopifyPublished: !!sp.published_at,
            source: "shopify",
            pageType,
          },
        });
      } else {
        await prisma.page.updateMany({
          where: { shopifyPageId: spId },
          data: {
            title: sp.title,
            slug: sp.handle,
            shopifyPublished: !!sp.published_at,
            pageType,
          },
        });
      }
    }

    // ── 2. Shopify Products (商品) を同期 ──
    for (const prod of shopifyProducts) {
      const prodId = `product_${prod.id}`;

      if (!existingShopifyIds.has(prodId)) {
        await prisma.page.create({
          data: {
            title: prod.title,
            slug: prod.handle,
            html: prod.body_html || "",
            css: "",
            status: prod.published_at ? "synced" : "draft",
            shopifyPageId: prodId,
            shopifyPublished: !!prod.published_at,
            source: "shopify",
            pageType: "product",
          },
        });
      } else {
        await prisma.page.updateMany({
          where: { shopifyPageId: prodId },
          data: {
            title: prod.title,
            slug: prod.handle,
            shopifyPublished: !!prod.published_at,
            pageType: "product",
          },
        });
      }
    }

    // ── 3. Shopify Collections (コレクション) を同期 ──
    for (const col of shopifyCollections) {
      const colId = `collection_${col.id}`;
      // "frontpage" / "home" コレクションはトップページ扱い
      const h = col.handle.toLowerCase();
      const colPageType =
        h === "frontpage" || h === "home" ? "landing" : "collection";

      if (!existingShopifyIds.has(colId)) {
        await prisma.page.create({
          data: {
            title: col.title,
            slug: col.handle,
            html: col.body_html || "",
            css: "",
            status: col.published_at ? "synced" : "draft",
            shopifyPageId: colId,
            shopifyPublished: !!col.published_at,
            source: "shopify",
            pageType: colPageType,
          },
        });
      } else {
        await prisma.page.updateMany({
          where: { shopifyPageId: colId },
          data: {
            title: col.title,
            slug: col.handle,
            shopifyPublished: !!col.published_at,
            pageType: colPageType,
          },
        });
      }
    }

    // 再取得してマージ済みの一覧を返す
    const allPages = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return Response.json({
      pages: allPages.map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        status: p.status,
        source: p.source,
        shopifyPageId: p.shopifyPageId,
        shopifyPublished: p.shopifyPublished,
        hasHtml: !!p.html,
        updatedAt: p.updatedAt,
        createdAt: p.createdAt,
      })),
      shopifyPageCount:
        shopifyPages.length + shopifyProducts.length + shopifyCollections.length,
      totalPageCount: allPages.length,
      syncDetails: {
        pages: shopifyPages.length,
        products: shopifyProducts.length,
        collections: shopifyCollections.length,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_CONNECTED") {
      // ストア未接続の場合はローカルページのみ返す
      const localPages = await prisma.page.findMany({
        orderBy: { updatedAt: "desc" },
      });
      return Response.json({
        pages: localPages.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: p.status,
          source: p.source,
          shopifyPageId: p.shopifyPageId,
          shopifyPublished: p.shopifyPublished,
          hasHtml: !!p.html,
          updatedAt: p.updatedAt,
          createdAt: p.createdAt,
        })),
        shopifyPageCount: 0,
        totalPageCount: localPages.length,
        storeNotConnected: true,
      });
    }
    console.error("Pages sync error:", error);
    return Response.json(
      { error: "ページの取得に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * POST: AicataページをShopifyにデプロイ（新規作成 or 更新）
 *
 * Body: { pageId: string, publish?: boolean }
 */
export async function POST(request: Request) {
  try {
    const store = await getConnectedStore();
    const { pageId, publish = false } = await request.json();

    if (!pageId) {
      return Response.json(
        { error: "pageIdが必要です" },
        { status: 400 },
      );
    }

    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      return Response.json(
        { error: "ページが見つかりません" },
        { status: 404 },
      );
    }

    // HTML + CSS を結合してbody_htmlにする
    const bodyHtml = page.css
      ? `<style>${page.css}</style>\n${page.html}`
      : page.html;

    let shopifyPage;

    if (page.shopifyPageId && !page.shopifyPageId.startsWith("product_") && !page.shopifyPageId.startsWith("collection_")) {
      // 既存ページを更新（Shopify Pages APIのみ）
      shopifyPage = await shopify.updatePage(
        store.shop,
        store.accessToken,
        Number(page.shopifyPageId),
        {
          title: page.title,
          body_html: bodyHtml,
          published: publish,
        },
      );
    } else {
      // 新規作成
      shopifyPage = await shopify.createPage(
        store.shop,
        store.accessToken,
        {
          title: page.title,
          body_html: bodyHtml,
          handle: page.slug || undefined,
          published: publish,
        },
      );
    }

    // Aicata DB を更新
    await prisma.page.update({
      where: { id: pageId },
      data: {
        shopifyPageId: String(shopifyPage.id),
        shopifyPublished: !!shopifyPage.published_at,
        status: shopifyPage.published_at ? "published" : "synced",
        slug: shopifyPage.handle,
      },
    });

    return Response.json({
      success: true,
      shopifyPageId: shopifyPage.id,
      handle: shopifyPage.handle,
      published: !!shopifyPage.published_at,
      url: `https://${store.domain || store.shop}/pages/${shopifyPage.handle}`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_CONNECTED") {
      return Response.json(
        { error: "Shopifyストアが接続されていません" },
        { status: 400 },
      );
    }
    console.error("Deploy error:", error);
    return Response.json(
      { error: "Shopifyへのデプロイに失敗しました" },
      { status: 500 },
    );
  }
}
