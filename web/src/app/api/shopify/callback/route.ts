/**
 * Shopify OAuth コールバック
 * GET /api/shopify/callback?code=xxx&shop=xxx&state=xxx&hmac=xxx
 */
import { exchangeCodeForToken, verifyHmac, getShopInfo, sanitizeShop } from "@/lib/shopify";
import { prisma } from "@/lib/db";
import { encryptToken } from "@/lib/token-encryption";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());

  const { shop, code, state } = params;

  if (!shop || !code || !state) {
    return Response.json(
      { error: "必要なパラメータが不足しています" },
      { status: 400 },
    );
  }

  // CSRF検証: nonceチェック
  const cookieStore = await cookies();
  const savedNonce = cookieStore.get("shopify_nonce")?.value;
  if (!savedNonce || savedNonce !== state) {
    return Response.json(
      { error: "不正なリクエストです（state不一致）" },
      { status: 403 },
    );
  }
  // nonce Cookie を削除
  cookieStore.delete("shopify_nonce");

  // HMAC検証
  try {
    const valid = verifyHmac(params);
    if (!valid) {
      return Response.json(
        { error: "HMAC検証に失敗しました" },
        { status: 403 },
      );
    }
  } catch {
    // HMAC検証が失敗してもdev環境では続行（テスト用）
    if (process.env.NODE_ENV === "production") {
      return Response.json(
        { error: "HMAC検証エラー" },
        { status: 403 },
      );
    }
  }

  // アクセストークンを取得
  const sanitized = sanitizeShop(shop);
  const tokenData = await exchangeCodeForToken(sanitized, code);

  // ストア情報を取得
  let shopInfo;
  try {
    shopInfo = await getShopInfo(sanitized, tokenData.access_token);
  } catch {
    shopInfo = null;
  }

  // DBに保存（upsert）
  await prisma.store.upsert({
    where: { shop: sanitized },
    update: {
      accessToken: encryptToken(tokenData.access_token),
      scope: tokenData.scope,
      name: shopInfo?.name || "",
      email: shopInfo?.email || "",
      domain: shopInfo?.domain || "",
      plan: shopInfo?.plan_name || "",
    },
    create: {
      shop: sanitized,
      accessToken: encryptToken(tokenData.access_token),
      scope: tokenData.scope,
      name: shopInfo?.name || "",
      email: shopInfo?.email || "",
      domain: shopInfo?.domain || "",
      plan: shopInfo?.plan_name || "",
    },
  });

  // リダイレクト先の決定（returnTo Cookie から）
  const returnTo = cookieStore.get("shopify_return_to")?.value || "settings";
  cookieStore.delete("shopify_return_to");

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  return Response.redirect(`${appUrl}?nav=${returnTo}&connected=true`);
}
