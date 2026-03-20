/**
 * Shopify ページ同期 API
 *
 * GET  /api/shopify/pages        — Shopifyからページ一覧を取得し、Aicata DBと同期
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
 * GET: Shopifyからページ一覧を取得し、Aicata DBとマージして返す
 */
export async function GET() {
  try {
    const store = await getConnectedStore();

    // Shopifyからページ一覧を取得
    const shopifyPages = await shopify.listPages(store.shop, store.accessToken);

    // Aicata DB のページ一覧を取得
    const aicataPages = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
    });

    // Shopify側の新しいページをAicata DBに同期
    const existingShopifyIds = new Set(
      aicataPages
        .filter((p) => p.shopifyPageId)
        .map((p) => p.shopifyPageId),
    );

    for (const sp of shopifyPages) {
      const spId = String(sp.id);
      if (!existingShopifyIds.has(spId)) {
        // Shopifyにあるが Aicata にないページを追加
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
          },
        });
      } else {
        // 既存ページの情報を更新（Shopify側が新しい場合）
        await prisma.page.updateMany({
          where: { shopifyPageId: spId },
          data: {
            title: sp.title,
            slug: sp.handle,
            shopifyPublished: !!sp.published_at,
          },
        });
      }
    }

    // 再取得してマージ済みの一覧を返す
    const allPages = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return Response.json({
      pages: allPages.map((p) => ({
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
      shopifyPageCount: shopifyPages.length,
      totalPageCount: allPages.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_CONNECTED") {
      // ストア未接続の場合はローカルページのみ返す
      const localPages = await prisma.page.findMany({
        orderBy: { updatedAt: "desc" },
      });
      return Response.json({
        pages: localPages.map((p) => ({
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

    if (page.shopifyPageId) {
      // 既存ページを更新
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
