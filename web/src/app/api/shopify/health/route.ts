// ============================================================
// Aicata — Shopify API Health Check
// APIバージョンの有効性とストアの機能をチェック
// ============================================================

import { prisma } from "@/lib/db";
import {
  SHOPIFY_API_VERSION,
  checkApiHealth,
  detectStoreCapabilities,
  OAUTH_CONFIG,
} from "@/lib/shopify-compat";
import { getMainTheme } from "@/lib/shopify";

export async function GET() {
  try {
    const store = await prisma.store.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!store) {
      return Response.json({
        connected: false,
        apiVersion: SHOPIFY_API_VERSION,
        health: { valid: false, reason: "ストア未接続" },
      });
    }

    // 1. API Version Health
    const health = await checkApiHealth(store.shop, store.accessToken);

    // 2. Store Capabilities (if healthy)
    let capabilities = null;
    if (health.valid) {
      try {
        const mainTheme = await getMainTheme(store.shop, store.accessToken);
        if (mainTheme) {
          capabilities = await detectStoreCapabilities(
            store.shop,
            store.accessToken,
            mainTheme.id,
          );
        }
      } catch {
        // Non-fatal
      }
    }

    // Shopifyの仕様: write_* が付与されていれば read_* も暗黙的に利用可能
    // OAuthレスポンスの scope に read_* が含まれない場合があるため補完する
    const rawScopes = (store.scope || OAUTH_CONFIG.scopes)
      .split(",")
      .map((s: string) => s.trim());
    const effectiveScopes = new Set(rawScopes);
    for (const scope of rawScopes) {
      if (scope.startsWith("write_")) {
        effectiveScopes.add(scope.replace("write_", "read_"));
      }
    }

    return Response.json({
      connected: true,
      shop: store.shop,
      apiVersion: SHOPIFY_API_VERSION,
      scopes: Array.from(effectiveScopes).join(","),
      health: {
        valid: health.valid,
        currentVersion: health.currentVersion,
        latestStableVersion: health.latestStableVersion,
        deprecationWarning: health.deprecationWarning,
      },
      capabilities,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Shopify Health] Error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "ヘルスチェックに失敗しました",
      },
      { status: 500 },
    );
  }
}
