import prisma from "~/db.server";
import type { Shop } from "@prisma/client";

/**
 * ショップの取得または作成
 */
export async function getOrCreateShop(
  shopDomain: string,
  data?: {
    shopName?: string;
    email?: string;
  },
): Promise<Shop> {
  const existing = await prisma.shop.findUnique({
    where: { shopDomain },
  });

  if (existing) {
    return existing;
  }

  return prisma.shop.create({
    data: {
      shopDomain,
      shopName: data?.shopName,
      email: data?.email,
    },
  });
}

/**
 * ショップ設定の更新
 */
export async function updateShopSettings(
  shopDomain: string,
  settings: {
    preferredModel?: string;
    locale?: string;
    timezone?: string;
  },
): Promise<Shop> {
  return prisma.shop.update({
    where: { shopDomain },
    data: settings,
  });
}

/**
 * トークン使用量の加算
 */
export async function incrementTokenUsage(
  shopDomain: string,
  tokens: number,
): Promise<void> {
  await prisma.shop.update({
    where: { shopDomain },
    data: {
      monthlyTokens: { increment: tokens },
    },
  });
}

/**
 * トークン使用量のリセット（月次）
 */
export async function resetMonthlyTokens(shopDomain: string): Promise<void> {
  await prisma.shop.update({
    where: { shopDomain },
    data: { monthlyTokens: 0 },
  });
}

/**
 * ショップのトークン残量チェック
 */
export async function hasTokenBudget(shopDomain: string): Promise<boolean> {
  const shop = await prisma.shop.findUnique({
    where: { shopDomain },
    select: { monthlyTokens: true, tokenLimit: true },
  });

  if (!shop) return false;
  return shop.monthlyTokens < shop.tokenLimit;
}
