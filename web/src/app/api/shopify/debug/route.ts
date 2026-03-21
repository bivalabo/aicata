/**
 * Shopify 接続デバッグ — 開発用
 * GET /api/shopify/debug
 * アクセストークンの有効性とテーマAPI呼び出しを個別にテストする
 */

import { prisma } from "@/lib/db";
import { SHOPIFY_API_VERSION } from "@/lib/shopify-compat";

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    apiVersion: SHOPIFY_API_VERSION,
  };

  try {
    // 1. DB からストア情報を取得
    const store = await prisma.store.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!store) {
      return Response.json({ ...results, error: "ストアがDBに存在しません" });
    }

    results.store = {
      shop: store.shop,
      name: store.name,
      hasAccessToken: !!store.accessToken,
      tokenLength: store.accessToken?.length || 0,
      tokenPrefix: store.accessToken ? store.accessToken.slice(0, 8) + "..." : "null",
      scope: store.scope,
    };

    // 2. shop.json で接続テスト（最も基本的なAPI）
    try {
      const shopRes = await fetch(
        `https://${store.shop}/admin/api/${SHOPIFY_API_VERSION}/shop.json`,
        {
          headers: {
            "X-Shopify-Access-Token": store.accessToken,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000),
        },
      );
      results.shopApi = {
        status: shopRes.status,
        ok: shopRes.ok,
        statusText: shopRes.statusText,
      };
      if (!shopRes.ok) {
        results.shopApi.body = (await shopRes.text()).slice(0, 500);
      }
    } catch (e) {
      results.shopApi = {
        error: e instanceof Error ? e.message : String(e),
      };
    }

    // 3. themes.json テスト
    try {
      const themesRes = await fetch(
        `https://${store.shop}/admin/api/${SHOPIFY_API_VERSION}/themes.json`,
        {
          headers: {
            "X-Shopify-Access-Token": store.accessToken,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000),
        },
      );
      results.themesApi = {
        status: themesRes.status,
        ok: themesRes.ok,
        statusText: themesRes.statusText,
      };
      if (themesRes.ok) {
        const data = await themesRes.json();
        results.themesApi.themeCount = data.themes?.length || 0;
        results.themesApi.themes = data.themes?.map((t: any) => ({
          id: t.id,
          name: t.name,
          role: t.role,
        }));
      } else {
        results.themesApi.body = (await themesRes.text()).slice(0, 500);
      }
    } catch (e) {
      results.themesApi = {
        error: e instanceof Error ? e.message : String(e),
      };
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({
      ...results,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
