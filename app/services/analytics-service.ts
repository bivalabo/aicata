import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { sendChatMessage, type ChatMessage } from "./claude-client";

/**
 * アナリティクスサービス
 *
 * Shopifyの注文・売上データを集計・分析し、
 * AIによるインサイトを生成する。
 */

interface SalesOverview {
  period: { start: string; end: string };
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  currencyCode: string;
  dailyBreakdown: { date: string; revenue: number; orders: number }[];
}

interface ProductRanking {
  productId: string;
  title: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

interface CustomerInsights {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageLifetimeValue: number;
}

/**
 * 売上概要を取得
 */
export async function getSalesOverview(
  admin: AdminApiContext,
  startDate: string,
  endDate: string,
): Promise<SalesOverview> {
  const query = `created_at:>='${startDate}' created_at:<='${endDate}'`;

  const response = await admin.graphql(`
    query SalesData($query: String!) {
      orders(first: 250, query: $query, sortKey: CREATED_AT) {
        nodes {
          id
          createdAt
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          displayFinancialStatus
        }
      }
    }
  `, { variables: { query } });

  const data = await response.json();
  const orders = data?.data?.orders?.nodes || [];

  // 日別集計
  const dailyMap: Record<string, { revenue: number; orders: number }> = {};
  let totalRevenue = 0;
  let currencyCode = "JPY";

  for (const order of orders) {
    const date = order.createdAt.split("T")[0];
    const amount = parseFloat(order.totalPriceSet?.shopMoney?.amount || "0");
    currencyCode = order.totalPriceSet?.shopMoney?.currencyCode || "JPY";

    if (!dailyMap[date]) {
      dailyMap[date] = { revenue: 0, orders: 0 };
    }
    dailyMap[date].revenue += amount;
    dailyMap[date].orders += 1;
    totalRevenue += amount;
  }

  const dailyBreakdown = Object.entries(dailyMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    period: { start: startDate, end: endDate },
    totalRevenue: Math.round(totalRevenue),
    totalOrders: orders.length,
    averageOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
    currencyCode,
    dailyBreakdown,
  };
}

/**
 * 商品パフォーマンスランキング
 */
export async function getProductPerformance(
  admin: AdminApiContext,
  startDate: string,
  endDate: string,
  limit: number = 10,
): Promise<ProductRanking[]> {
  const query = `created_at:>='${startDate}' created_at:<='${endDate}'`;

  const response = await admin.graphql(`
    query OrderLineItems($query: String!) {
      orders(first: 250, query: $query) {
        nodes {
          lineItems(first: 50) {
            nodes {
              title
              quantity
              originalTotalSet {
                shopMoney { amount }
              }
              product {
                id
              }
            }
          }
        }
      }
    }
  `, { variables: { query } });

  const data = await response.json();
  const orders = data?.data?.orders?.nodes || [];

  // 商品別に集計
  const productMap: Record<string, ProductRanking> = {};

  for (const order of orders) {
    for (const item of order.lineItems?.nodes || []) {
      const productId = item.product?.id || "unknown";
      const amount = parseFloat(item.originalTotalSet?.shopMoney?.amount || "0");

      if (!productMap[productId]) {
        productMap[productId] = {
          productId,
          title: item.title,
          totalQuantity: 0,
          totalRevenue: 0,
          orderCount: 0,
        };
      }

      productMap[productId].totalQuantity += item.quantity;
      productMap[productId].totalRevenue += amount;
      productMap[productId].orderCount += 1;
    }
  }

  return Object.values(productMap)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
}

/**
 * 顧客インサイトを取得
 */
export async function getCustomerInsights(
  admin: AdminApiContext,
  startDate: string,
  endDate: string,
): Promise<CustomerInsights> {
  const response = await admin.graphql(`
    query CustomerInsights {
      customersCount {
        count
      }
    }
  `);

  const data = await response.json();
  const totalCustomers = data?.data?.customersCount?.count || 0;

  // 注文データから新規/リピーター推定
  const orderQuery = `created_at:>='${startDate}' created_at:<='${endDate}'`;
  const ordersResponse = await admin.graphql(`
    query OrderCustomers($query: String!) {
      orders(first: 250, query: $query) {
        nodes {
          customer {
            id
            ordersCount
          }
          totalPriceSet {
            shopMoney { amount }
          }
        }
      }
    }
  `, { variables: { query: orderQuery } });

  const ordersData = await ordersResponse.json();
  const orderNodes = ordersData?.data?.orders?.nodes || [];

  const customerIds = new Set<string>();
  let newCustomers = 0;
  let returningCustomers = 0;
  let totalLTV = 0;

  for (const order of orderNodes) {
    const customerId = order.customer?.id;
    if (!customerId || customerIds.has(customerId)) continue;
    customerIds.add(customerId);

    const orderCount = order.customer?.ordersCount || 0;
    if (orderCount <= 1) {
      newCustomers++;
    } else {
      returningCustomers++;
    }

    totalLTV += parseFloat(order.totalPriceSet?.shopMoney?.amount || "0");
  }

  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
    averageLifetimeValue: customerIds.size > 0
      ? Math.round(totalLTV / customerIds.size)
      : 0,
  };
}

/**
 * AIによるアナリティクスレポートを生成
 */
export async function generateAnalyticsReport(
  shopDomain: string,
  salesOverview: SalesOverview,
  productRanking: ProductRanking[],
): Promise<string> {
  const topProducts = productRanking.slice(0, 5).map((p, i) =>
    `${i + 1}. ${p.title}（売上: ¥${p.totalRevenue.toLocaleString()}, ${p.totalQuantity}個）`
  ).join("\n");

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: `以下のストア分析データに基づいて、ストア運営者向けの日本語レポートを生成してください。

## 売上概要（${salesOverview.period.start} 〜 ${salesOverview.period.end}）
- 総売上: ¥${salesOverview.totalRevenue.toLocaleString()}
- 注文数: ${salesOverview.totalOrders}件
- 平均注文額: ¥${salesOverview.averageOrderValue.toLocaleString()}

## 売上トップ商品
${topProducts}

以下の形式で出力してください:
1. 全体サマリー（3行以内）
2. 注目ポイント（良い点と改善点）
3. 具体的なアクションアイテム（3つ）
4. 今後1ヶ月の予測・提案

日本のEC市場のトレンドも踏まえた実用的なアドバイスをお願いします。`,
    },
  ];

  const response = await sendChatMessage(messages, {
    shopDomain,
    conversationType: "STORE_ANALYSIS",
  });

  return response.content;
}

/**
 * 日本の季節イベントカレンダー
 */
export function getUpcomingEvents(currentDate: Date = new Date()): {
  name: string;
  date: string;
  daysUntil: number;
  suggestion: string;
}[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  const events = [
    { name: "お正月セール", month: 0, day: 1, suggestion: "福袋、初売りセールの準備" },
    { name: "バレンタインデー", month: 1, day: 14, suggestion: "ギフト需要、限定パッケージ" },
    { name: "ホワイトデー", month: 2, day: 14, suggestion: "お返しギフト、ペア商品" },
    { name: "新生活応援", month: 3, day: 1, suggestion: "新生活用品、まとめ買い割引" },
    { name: "ゴールデンウィーク", month: 4, day: 3, suggestion: "GWセール、旅行関連グッズ" },
    { name: "母の日", month: 4, day: 12, suggestion: "ギフトラッピング、メッセージカード" },
    { name: "父の日", month: 5, day: 15, suggestion: "男性向けギフト、実用品" },
    { name: "お中元", month: 6, day: 1, suggestion: "ギフトセット、のし対応" },
    { name: "夏セール", month: 6, day: 15, suggestion: "サマーセール、クリアランス" },
    { name: "敬老の日", month: 8, day: 15, suggestion: "シニア向けギフト、健康関連" },
    { name: "ハロウィン", month: 9, day: 31, suggestion: "限定デザイン、コスプレ関連" },
    { name: "ブラックフライデー", month: 10, day: 29, suggestion: "大幅値引き、タイムセール" },
    { name: "お歳暮", month: 11, day: 1, suggestion: "ギフトセット、法人需要" },
    { name: "クリスマス", month: 11, day: 25, suggestion: "ギフト包装、限定商品" },
    { name: "年末年始セール", month: 11, day: 28, suggestion: "年末クリアランス、福袋予約" },
  ];

  return events
    .map((event) => {
      let eventDate = new Date(year, event.month, event.day);
      if (eventDate < currentDate) {
        eventDate = new Date(year + 1, event.month, event.day);
      }
      const daysUntil = Math.ceil(
        (eventDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        name: event.name,
        date: eventDate.toISOString().split("T")[0],
        daysUntil,
        suggestion: event.suggestion,
      };
    })
    .filter((e) => e.daysUntil <= 90 && e.daysUntil > 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}
