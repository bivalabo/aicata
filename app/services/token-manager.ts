import prisma from "~/db.server";

/**
 * トークン使用量管理
 * 月次のAPI使用量を追跡し、上限を制御する
 */

export interface TokenUsageInfo {
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  isOverLimit: boolean;
}

/**
 * 現在のトークン使用状況を取得
 */
export async function getTokenUsage(shopDomain: string): Promise<TokenUsageInfo> {
  const shop = await prisma.shop.findUnique({
    where: { shopDomain },
    select: { monthlyTokens: true, tokenLimit: true },
  });

  if (!shop) {
    throw new Error(`Shop not found: ${shopDomain}`);
  }

  const remaining = Math.max(0, shop.tokenLimit - shop.monthlyTokens);
  const percentUsed = shop.tokenLimit > 0
    ? Math.round((shop.monthlyTokens / shop.tokenLimit) * 100)
    : 0;

  return {
    used: shop.monthlyTokens,
    limit: shop.tokenLimit,
    remaining,
    percentUsed,
    isOverLimit: shop.monthlyTokens >= shop.tokenLimit,
  };
}

/**
 * トークン使用量を記録
 */
export async function recordTokenUsage(
  shopDomain: string,
  inputTokens: number,
  outputTokens: number,
): Promise<void> {
  const totalTokens = inputTokens + outputTokens;

  await prisma.shop.update({
    where: { shopDomain },
    data: {
      monthlyTokens: { increment: totalTokens },
    },
  });
}

/**
 * トークン残量チェック（送信前に呼ぶ）
 */
export async function checkTokenBudget(
  shopDomain: string,
  estimatedTokens: number = 4000,
): Promise<{
  allowed: boolean;
  usage: TokenUsageInfo;
  warning?: string;
}> {
  const usage = await getTokenUsage(shopDomain);

  if (usage.isOverLimit) {
    return {
      allowed: false,
      usage,
      warning: "今月のトークン上限に達しました。プランのアップグレードをご検討ください。",
    };
  }

  // 残量が推定使用量の2倍未満なら警告
  if (usage.remaining < estimatedTokens * 2) {
    return {
      allowed: true,
      usage,
      warning: `トークン残量が少なくなっています（残り${usage.remaining.toLocaleString()}トークン）`,
    };
  }

  return { allowed: true, usage };
}

/**
 * プランに応じたトークン上限を取得
 */
export function getTokenLimitForPlan(plan: string): number {
  switch (plan) {
    case "free":
      return 100_000;     // 無料プラン: 10万トークン/月
    case "pro":
      return 1_000_000;   // Proプラン: 100万トークン/月
    case "enterprise":
      return 10_000_000;  // Enterpriseプラン: 1000万トークン/月
    default:
      return 100_000;
  }
}

/**
 * 月次リセット（cron jobから呼ばれる想定）
 */
export async function resetAllMonthlyTokens(): Promise<number> {
  const result = await prisma.shop.updateMany({
    data: { monthlyTokens: 0 },
  });
  return result.count;
}
