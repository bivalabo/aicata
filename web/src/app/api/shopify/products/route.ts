/**
 * Shopify Products API
 *
 * GET  /api/shopify/products          — 商品一覧取得
 * GET  /api/shopify/products?id=xxx   — 商品詳細取得
 * POST /api/shopify/products/sync     — 商品データをDBに同期
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  listProducts,
  type ShopifyProduct,
} from "@/lib/shopify";

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

    const productId = req.nextUrl.searchParams.get("id");

    if (productId) {
      // 単体取得: Shopify REST API
      const res = await fetch(
        `https://${store.shop}/admin/api/2024-10/products/${productId}.json`,
        { headers: { "X-Shopify-Access-Token": store.accessToken } },
      );
      if (!res.ok) {
        return NextResponse.json({ error: "商品が見つかりません" }, { status: 404 });
      }
      const data = await res.json();
      return NextResponse.json({ product: data.product });
    }

    // 一覧取得
    const products = await listProducts(store.shop, store.accessToken);

    // DB内のPageデータとマッピング（Aicataで生成済みかどうか）
    const shopifyPageIds = products.map((p) => `product_${p.id}`);
    const existingPages = await prisma.page.findMany({
      where: { shopifyPageId: { in: shopifyPageIds } },
      select: { shopifyPageId: true, id: true, status: true },
    });
    const pageMap = new Map<string | null, { shopifyPageId: string | null; id: string; status: string }>(
      existingPages.map((p: { shopifyPageId: string | null; id: string; status: string }) => [p.shopifyPageId, p]),
    );

    const enriched = products.map((p: ShopifyProduct) => {
      const aicataPage = pageMap.get(`product_${p.id}`);
      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        vendor: p.vendor,
        productType: p.product_type,
        status: p.status,
        image: p.image?.src || null,
        images: p.images.map((img) => img.src),
        publishedAt: p.published_at,
        updatedAt: p.updated_at,
        aicata: aicataPage
          ? { pageId: aicataPage.id, status: aicataPage.status }
          : null,
      };
    });

    return NextResponse.json({
      products: enriched,
      total: enriched.length,
    });
  } catch (error) {
    console.error("[Products API Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "商品データの取得に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * POST: 商品データをDBの Page テーブルに同期
 * body: { productIds?: number[] } — 省略時は全商品を同期
 */
export async function POST(req: NextRequest) {
  try {
    const store = await getStore();
    if (!store) {
      return NextResponse.json({ error: "ストアが接続されていません" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedIds: number[] | undefined = body.productIds;

    let products = await listProducts(store.shop, store.accessToken);
    if (requestedIds && requestedIds.length > 0) {
      products = products.filter((p) => requestedIds.includes(p.id));
    }

    let synced = 0;
    for (const product of products) {
      const shopifyPageId = `product_${product.id}`;

      // 既存レコードを検索
      const existing = await prisma.page.findFirst({
        where: { shopifyPageId },
        select: { id: true },
      });

      if (existing) {
        await prisma.page.update({
          where: { id: existing.id },
          data: {
            title: product.title,
            html: product.body_html || "",
            shopifyPublished: product.status === "active",
            status: "synced",
          },
        });
      } else {
        await prisma.page.create({
          data: {
            shopifyPageId,
            title: product.title,
            html: product.body_html || "",
            css: "",
            pageType: "product",
            source: "shopify",
            shopifyPublished: product.status === "active",
            status: "synced",
          },
        });
      }
      synced++;
    }

    return NextResponse.json({
      synced,
      total: products.length,
    });
  } catch (error) {
    console.error("[Products Sync Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "商品同期に失敗しました" },
      { status: 500 },
    );
  }
}
