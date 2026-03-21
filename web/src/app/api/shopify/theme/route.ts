/**
 * Shopify Theme API エンドポイント
 *
 * GET  /api/shopify/theme — テーマ一覧取得（メインテーマ特定含む）
 * GET  /api/shopify/theme?assets=true&themeId=xxx — テーマアセット一覧
 */

import { NextRequest, NextResponse } from "next/server";
import { listThemes, listAssets } from "@/lib/shopify";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // ストア情報を取得
    const store = await prisma.store.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!store) {
      return NextResponse.json(
        { error: "ストアが接続されていません" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(req.url);
    const wantAssets = searchParams.get("assets") === "true";
    const themeId = searchParams.get("themeId");

    if (wantAssets && themeId) {
      // テーマアセット一覧
      const assets = await listAssets(
        store.shop,
        store.accessToken,
        parseInt(themeId, 10),
      );

      // Aicata関連のアセットだけフィルタ
      const aicataAssets = assets.filter(
        (a) =>
          a.key.includes("aicata") ||
          a.key.startsWith("templates/") ||
          a.key.startsWith("sections/"),
      );

      return NextResponse.json({
        assets: aicataAssets,
        total: assets.length,
        aicataCount: aicataAssets.filter((a) => a.key.includes("aicata"))
          .length,
      });
    }

    // テーマ一覧
    const themes = await listThemes(store.shop, store.accessToken);
    const mainTheme = themes.find((t) => t.role === "main");

    return NextResponse.json({
      themes: themes.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        isMain: t.role === "main",
        previewable: t.previewable,
        updatedAt: t.updated_at,
      })),
      mainThemeId: mainTheme?.id || null,
      mainThemeName: mainTheme?.name || null,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "テーマ情報の取得に失敗しました";
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[Theme API Error]", msg);
    if (stack) console.error("[Theme API Stack]", stack);

    // Shopify API エラーの詳細を抽出
    let detail = msg;
    let code = "UNKNOWN";
    if (msg.includes("401") || msg.includes("Unauthorized")) {
      detail = "アクセストークンが無効または期限切れです。設定から再接続してください。";
      code = "INVALID_TOKEN";
    } else if (msg.includes("403") || msg.includes("Forbidden") || msg.includes("scope")) {
      detail = "テーマの読み取り権限がありません。OAuthスコープを確認してください。";
      code = "SCOPE_MISSING";
    } else if (msg.includes("404")) {
      detail = "ストアが見つかりません。ストアドメインを確認してください。";
      code = "STORE_NOT_FOUND";
    } else if (msg.includes("ENOTFOUND") || msg.includes("fetch failed") || msg.includes("ECONNREFUSED")) {
      detail = "Shopifyへのネットワーク接続に失敗しました。";
      code = "NETWORK_ERROR";
    }

    return NextResponse.json(
      { error: detail, code, rawError: msg },
      { status: 500 },
    );
  }
}
