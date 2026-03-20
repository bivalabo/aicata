/**
 * Shopify OAuth インストール開始
 * GET /api/shopify/install?shop=example.myshopify.com
 */
import { buildAuthUrl, generateNonce, sanitizeShop, isShopifyConfigured } from "@/lib/shopify";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  if (!isShopifyConfigured()) {
    return Response.json(
      { error: "Shopify APIキーが設定されていません" },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return Response.json(
      { error: "shopパラメータが必要です" },
      { status: 400 },
    );
  }

  const sanitized = sanitizeShop(shop);
  const nonce = generateNonce();

  // returnTo パラメータ（再認証後の遷移先）
  const returnTo = url.searchParams.get("returnTo") || "settings";

  // nonce を Cookie に保存（CSRF対策）
  const cookieStore = await cookies();
  cookieStore.set("shopify_nonce", nonce, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600, // 10分
    path: "/",
  });
  // returnTo を Cookie に保存
  cookieStore.set("shopify_return_to", returnTo, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const authUrl = buildAuthUrl(sanitized, nonce);
  return Response.redirect(authUrl);
}
