// ============================================================
// Aicata — Batch Deploy API (Site Rebuild)
// 複数ページを一括でShopifyテーマにデプロイする
// ============================================================

import { prisma } from "@/lib/db";
import { preparePageForDeploy } from "@/lib/media-assets";

export const maxDuration = 120;

interface DeployRequest {
  /** デプロイするページIDの配列 */
  pageIds: string[];
}

interface DeployResult {
  results: Array<{
    pageId: string;
    title: string;
    status: "ok" | "error";
    error?: string;
    previewUrl?: string;
  }>;
  successCount: number;
  totalCount: number;
}

export async function POST(request: Request) {
  try {
    const body: DeployRequest = await request.json();
    const { pageIds } = body;

    if (!pageIds || pageIds.length === 0) {
      return Response.json(
        { error: "デプロイ対象のページIDが必要です" },
        { status: 400 },
      );
    }

    // Check store connection
    const store = await prisma.store.findFirst();
    if (!store) {
      return Response.json(
        { error: "Shopifyストアが接続されていません" },
        { status: 400 },
      );
    }

    const results: DeployResult["results"] = [];

    // ── メディア資産: デプロイ前に画像をShopifyにアップロード ──
    // Aicataはファイルを保持しない。元サイトのURLをShopify Files APIに渡し、
    // Shopify CDN URLでHTML内の画像参照を書き換える
    for (const pageId of pageIds) {
      try {
        const page = await prisma.page.findUnique({ where: { id: pageId } });
        if (page?.html) {
          const updatedHtml = await preparePageForDeploy(
            store.shop,
            store.accessToken,
            pageId,
            page.html,
          );
          if (updatedHtml !== page.html) {
            await prisma.page.update({
              where: { id: pageId },
              data: { html: updatedHtml },
            });
            console.log(`[Batch Deploy] Media assets uploaded & URLs rewritten for page ${pageId}`);
          }
        }
      } catch (e) {
        // メディアアップロードの失敗はデプロイ自体を止めない
        console.warn(`[Batch Deploy] Media upload failed for ${pageId}:`, e);
      }
    }

    // Deploy each page sequentially
    for (const pageId of pageIds) {
      try {
        // Call the existing deploy endpoint internally
        const deployRes = await fetch(
          new URL("/api/shopify/deploy", request.url).href,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pageId }),
          },
        );

        const deployData = await deployRes.json();

        if (deployData.error) {
          // Try fallback to Pages API
          const fallbackRes = await fetch(
            new URL("/api/shopify/pages", request.url).href,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pageId, publish: true }),
            },
          );
          const fallbackData = await fallbackRes.json();

          if (fallbackData.error) {
            results.push({
              pageId,
              title: fallbackData.title || pageId,
              status: "error",
              error: fallbackData.error,
            });
          } else {
            results.push({
              pageId,
              title: fallbackData.title || pageId,
              status: "ok",
            });
          }
        } else {
          results.push({
            pageId,
            title: deployData.title || pageId,
            status: "ok",
            previewUrl: deployData.previewUrl,
          });
        }
      } catch (err) {
        results.push({
          pageId,
          title: pageId,
          status: "error",
          error: err instanceof Error ? err.message : "デプロイエラー",
        });
      }
    }

    const response: DeployResult = {
      results,
      successCount: results.filter((r) => r.status === "ok").length,
      totalCount: results.length,
    };

    return Response.json(response);
  } catch (error) {
    console.error("[Batch Deploy] Error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "バッチデプロイに失敗しました",
      },
      { status: 500 },
    );
  }
}
