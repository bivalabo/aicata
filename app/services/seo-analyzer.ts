import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { sendChatMessage, type ChatMessage } from "./claude-client";

/**
 * SEO分析サービス
 *
 * Shopifyストアの商品・ページのSEO状態を分析し、
 * 日本語ECに最適化された改善提案を生成する。
 */

interface SEOIssue {
  severity: "error" | "warning" | "info";
  field: string;
  message: string;
  suggestion?: string;
}

interface ProductSEOReport {
  productId: string;
  title: string;
  score: number; // 0-100
  issues: SEOIssue[];
  meta: {
    title: string | null;
    description: string | null;
    titleLength: number;
    descriptionLength: number;
  };
  images: {
    total: number;
    withAlt: number;
    missingAlt: string[];
  };
}

interface SiteSEOReport {
  totalProducts: number;
  analyzedProducts: number;
  averageScore: number;
  commonIssues: { issue: string; count: number }[];
  productReports: ProductSEOReport[];
}

/**
 * 単一商品のSEOを分析
 */
export async function analyzeProductSEO(
  admin: AdminApiContext,
  productId: string,
): Promise<ProductSEOReport> {
  const response = await admin.graphql(`
    query ProductSEO($id: ID!) {
      product(id: $id) {
        id
        title
        description
        descriptionHtml
        handle
        seo {
          title
          description
        }
        images(first: 20) {
          nodes {
            id
            altText
            url
          }
        }
        metafields(first: 10, namespace: "custom") {
          nodes {
            namespace
            key
            value
          }
        }
      }
    }
  `, { variables: { id: productId } });

  const data = await response.json();
  const product = data?.data?.product;

  if (!product) {
    throw new Error("商品が見つかりません");
  }

  const issues: SEOIssue[] = [];
  const seoTitle = product.seo?.title || product.title;
  const seoDescription = product.seo?.description || "";

  // タイトルのチェック
  if (!product.seo?.title) {
    issues.push({
      severity: "warning",
      field: "seo.title",
      message: "SEOタイトルが未設定です（商品名がそのまま使われます）",
      suggestion: "商品の特徴やキーワードを含む30〜60文字のタイトルを設定しましょう",
    });
  } else if (seoTitle.length < 15) {
    issues.push({
      severity: "warning",
      field: "seo.title",
      message: `SEOタイトルが短すぎます（${seoTitle.length}文字）`,
      suggestion: "30〜60文字が推奨です。主要キーワードとブランド名を含めましょう",
    });
  } else if (seoTitle.length > 60) {
    issues.push({
      severity: "warning",
      field: "seo.title",
      message: `SEOタイトルが長すぎます（${seoTitle.length}文字）`,
      suggestion: "検索結果で途切れないよう60文字以内に収めましょう",
    });
  }

  // メタディスクリプションのチェック
  if (!seoDescription) {
    issues.push({
      severity: "error",
      field: "seo.description",
      message: "メタディスクリプションが未設定です",
      suggestion: "商品の魅力を伝える80〜160文字の説明文を設定しましょう",
    });
  } else if (seoDescription.length < 50) {
    issues.push({
      severity: "warning",
      field: "seo.description",
      message: `メタディスクリプションが短すぎます（${seoDescription.length}文字）`,
      suggestion: "80〜160文字が推奨です。検索ユーザーがクリックしたくなる説明を",
    });
  } else if (seoDescription.length > 160) {
    issues.push({
      severity: "info",
      field: "seo.description",
      message: `メタディスクリプションがやや長いです（${seoDescription.length}文字）`,
      suggestion: "160文字以内だと検索結果で全文表示されやすくなります",
    });
  }

  // 商品説明のチェック
  if (!product.description || product.description.length < 50) {
    issues.push({
      severity: "error",
      field: "description",
      message: "商品説明が不足しています",
      suggestion: "200文字以上の詳しい商品説明を追加しましょう。素材、サイズ、使い方などを含めると効果的です",
    });
  }

  // 画像altテキストのチェック
  const images = product.images?.nodes || [];
  const missingAlt = images
    .filter((img: any) => !img.altText || img.altText.trim() === "")
    .map((img: any) => img.id);

  if (missingAlt.length > 0) {
    issues.push({
      severity: "warning",
      field: "images",
      message: `${missingAlt.length}枚の画像にalt属性が未設定です`,
      suggestion: "全ての画像に商品を説明するalt属性を設定しましょう（例：「ブルーのコットンTシャツ 正面」）",
    });
  }

  // ハンドル（URL slug）のチェック
  if (product.handle && /[A-Z]/.test(product.handle)) {
    issues.push({
      severity: "info",
      field: "handle",
      message: "URLハンドルに大文字が含まれています",
      suggestion: "URLは小文字で統一するのがSEOのベストプラクティスです",
    });
  }

  // スコア計算
  const score = calculateSEOScore(issues);

  return {
    productId: product.id,
    title: product.title,
    score,
    issues,
    meta: {
      title: product.seo?.title || null,
      description: product.seo?.description || null,
      titleLength: seoTitle.length,
      descriptionLength: seoDescription.length,
    },
    images: {
      total: images.length,
      withAlt: images.length - missingAlt.length,
      missingAlt,
    },
  };
}

/**
 * サイト全体のSEOを分析（最大50商品）
 */
export async function analyzeSiteSEO(
  admin: AdminApiContext,
  limit: number = 20,
): Promise<SiteSEOReport> {
  const response = await admin.graphql(`
    query Products($first: Int!) {
      products(first: $first) {
        nodes {
          id
        }
        pageInfo {
          hasNextPage
        }
      }
      productsCount {
        count
      }
    }
  `, { variables: { first: Math.min(limit, 50) } });

  const data = await response.json();
  const productNodes = data?.data?.products?.nodes || [];
  const totalProducts = data?.data?.productsCount?.count || 0;

  const reports: ProductSEOReport[] = [];
  for (const node of productNodes) {
    try {
      const report = await analyzeProductSEO(admin, node.id);
      reports.push(report);
    } catch {
      // 個別エラーはスキップ
    }
  }

  // 共通の問題を集計
  const issueCount: Record<string, number> = {};
  for (const report of reports) {
    for (const issue of report.issues) {
      const key = issue.message;
      issueCount[key] = (issueCount[key] || 0) + 1;
    }
  }

  const commonIssues = Object.entries(issueCount)
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const averageScore = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.score, 0) / reports.length)
    : 0;

  return {
    totalProducts,
    analyzedProducts: reports.length,
    averageScore,
    commonIssues,
    productReports: reports,
  };
}

/**
 * AIによるSEO改善提案を生成
 */
export async function generateSEOSuggestions(
  shopDomain: string,
  report: ProductSEOReport,
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "user",
      content: `以下の商品のSEO分析結果を踏まえ、日本語ECサイトとして最適なSEO改善提案を生成してください。

## 商品情報
- 商品名: ${report.title}
- 現在のSEOスコア: ${report.score}/100

## 検出された問題
${report.issues.map((i) => `- [${i.severity}] ${i.message}`).join("\n")}

## メタ情報
- タイトル（${report.meta.titleLength}文字）: ${report.meta.title || "未設定"}
- ディスクリプション（${report.meta.descriptionLength}文字）: ${report.meta.description || "未設定"}

## 画像
- 合計: ${report.images.total}枚
- alt設定済み: ${report.images.withAlt}枚

改善提案を具体的に、優先度順に日本語で出力してください。
SEOタイトルとメタディスクリプションの具体的な改善案も提示してください。`,
    },
  ];

  const response = await sendChatMessage(messages, {
    shopDomain,
    conversationType: "SEO_OPTIMIZATION",
  });

  return response.content;
}

/**
 * 商品のメタ情報を更新
 */
export async function applyMetaUpdate(
  admin: AdminApiContext,
  productId: string,
  meta: { title?: string; description?: string },
): Promise<void> {
  await admin.graphql(`
    mutation UpdateProductSEO($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          seo {
            title
            description
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: {
      input: {
        id: productId,
        seo: {
          title: meta.title,
          description: meta.description,
        },
      },
    },
  });
}

// ===== ヘルパー =====

function calculateSEOScore(issues: SEOIssue[]): number {
  let score = 100;

  for (const issue of issues) {
    switch (issue.severity) {
      case "error":
        score -= 20;
        break;
      case "warning":
        score -= 10;
        break;
      case "info":
        score -= 3;
        break;
    }
  }

  return Math.max(0, Math.min(100, score));
}
