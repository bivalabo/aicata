/**
 * Shopify Collections API
 *
 * GET  /api/shopify/collections              — コレクション一覧取得
 * POST /api/shopify/collections              — コレクションデータをDBに同期
 * GET  /api/shopify/collections?id=xxx       — コレクション内の商品一覧取得
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { listAllCollections, listCollectionProducts, type ShopifyCollection } from "@/lib/shopify";

async function getStore() {
  return prisma.store.findFirst({
    where: { isActive: true },
    select: { id: true, shop: true, accessToken: true },
  });
}

export async function GET(req: NextRequest) {
  try {
    const store = await getStore();
    if (!store) {
      return NextResponse.json({ error: "ストアが接続されていません" }, { status: 400 });
    }

    const collectionId = req.nextUrl.searchParams.get("id");

    if (collectionId) {
      // コレクション内の商品一覧を取得
      const products = await listCollectionProducts(
        store.shop,
        store.accessToken,
        parseInt(collectionId),
      );
      return NextResponse.json({ products });
    }

    // 全コレクション一覧
    const collections = await listAllCollections(store.shop, store.accessToken);

    // DB内の対応するPageデータをマッピング
    const shopifyPageIds = collections.map((c) => `collection_${c.id}`);
    const existingPages = await prisma.page.findMany({
      where: { shopifyPageId: { in: shopifyPageIds } },
      select: { shopifyPageId: true, id: true, status: true },
    });
    const pageMap = new Map<string | null, { shopifyPageId: string | null; id: string; status: string }>(
      existingPages.map((p: { shopifyPageId: string | null; id: string; status: string }) => [p.shopifyPageId, p]),
    );

    const enriched = collections.map((c: ShopifyCollection) => {
      const aicataPage = pageMap.get(`collection_${c.id}`);
      return {
        id: c.id,
        title: c.title,
        handle: c.handle,
        image: c.image?.src || null,
        bodyHtml: c.body_html,
        sortOrder: c.sort_order,
        publishedAt: c.published_at,
        updatedAt: c.updated_at,
        aicata: aicataPage
          ? { pageId: aicataPage.id, status: aicataPage.status }
          : null,
      };
    });

    return NextResponse.json({
      collections: enriched,
      total: enriched.length,
    });
  } catch (error) {
    console.error("[Collections API Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "コレクションデータの取得に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * POST: コレクションデータをDBの Page テーブルに同期
 */
export async function POST(req: NextRequest) {
  try {
    const store = await getStore();
    if (!store) {
      return NextResponse.json({ error: "ストアが接続されていません" }, { status: 400 });
    }

    const collections = await listAllCollections(store.shop, store.accessToken);

    let synced = 0;
    for (const collection of collections) {
      const shopifyPageId = `collection_${collection.id}`;

      const existing = await prisma.page.findFirst({
        where: { shopifyPageId },
        select: { id: true },
      });

      if (existing) {
        await prisma.page.update({
          where: { id: existing.id },
          data: {
            title: collection.title,
            html: collection.body_html || "",
            shopifyPublished: !!collection.published_at,
            status: "synced",
          },
        });
      } else {
        await prisma.page.create({
          data: {
            shopifyPageId,
            title: collection.title,
            html: collection.body_html || "",
            css: "",
            pageType: "collection",
            source: "shopify",
            shopifyPublished: !!collection.published_at,
            status: "synced",
          },
        });
      }
      synced++;
    }

    return NextResponse.json({
      synced,
      total: collections.length,
    });
  } catch (error) {
    console.error("[Collections Sync Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "コレクション同期に失敗しました" },
      { status: 500 },
    );
  }
}
