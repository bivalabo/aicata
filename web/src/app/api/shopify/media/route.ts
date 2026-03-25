/**
 * Shopify Media Asset Management API
 *
 * GET    /api/shopify/media                — メディア一覧取得（フィルタ付き）
 * POST   /api/shopify/media                — 画像をShopify CDNにアップロード
 * PUT    /api/shopify/media                — メディアのalt/context情報を更新
 * DELETE /api/shopify/media?id=xxx         — メディアレコードを削除
 *
 * MediaAsset テーブルはページに紐づく画像を管理し、
 * Shopify Files API を使ってCDNにアップロードする。
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  uploadFileFromUrl,
  checkFileStatus,
} from "@/lib/media-assets";

async function getStore() {
  return prisma.store.findFirst({
    where: { isActive: true },
    select: { id: true, shop: true, accessToken: true },
  });
}

/**
 * GET: メディアアセット一覧
 * Query params:
 *   pageId   — ページIDでフィルタ
 *   status   — ステータスでフィルタ (pending|uploading|uploaded|failed)
 *   context  — コンテキストでフィルタ (hero|product|logo|background|content)
 *   limit    — 取得件数 (default: 50)
 *   offset   — オフセット (default: 0)
 */
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const pageId = params.get("pageId");
    const status = params.get("status");
    const context = params.get("context");
    const limit = Math.min(parseInt(params.get("limit") || "50"), 200);
    const offset = parseInt(params.get("offset") || "0");

    const where: Record<string, unknown> = {};
    if (pageId) where.pageId = pageId;
    if (status) where.status = status;
    if (context) where.context = context;

    const [assets, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          sourceUrl: true,
          shopifyCdnUrl: true,
          shopifyFileId: true,
          status: true,
          context: true,
          alt: true,
          mimeType: true,
          sourceDomain: true,
          pageId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.mediaAsset.count({ where }),
    ]);

    // ステータス別の集計
    const statusCounts = await prisma.mediaAsset.groupBy({
      by: ["status"],
      where: pageId ? { pageId } : undefined,
      _count: { status: true },
    });

    return NextResponse.json({
      assets,
      total,
      limit,
      offset,
      statusSummary: Object.fromEntries(
        statusCounts.map((s: any) => [s.status, s._count.status]),
      ),
    });
  } catch (error) {
    console.error("[Media GET Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "メディア取得に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * POST: 画像をShopify CDNにアップロード
 * body: {
 *   assetIds?: string[]    — 特定のMediaAssetをアップロード
 *   pageId?: string        — ページの全pending画像をアップロード
 *   url?: string           — 新規URLを直接アップロード
 *   alt?: string           — alt テキスト
 *   context?: string       — コンテキスト
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const store = await getStore();
    if (!store) {
      return NextResponse.json({ error: "ストアが接続されていません" }, { status: 400 });
    }

    const body = await req.json();
    const { assetIds, pageId, url, alt, context } = body;

    // 単一URL直接アップロード
    if (url) {
      const result = await uploadFileFromUrl(
        store.shop,
        store.accessToken,
        url,
        alt || "",
      );

      if (!result) {
        return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
      }

      // CDN URLがまだない場合はポーリング
      let cdnUrl = result.cdnUrl;
      if (!cdnUrl && result.fileId) {
        for (let i = 0; i < 6; i++) {
          await new Promise((r) => setTimeout(r, 3000));
          const fileStatus = await checkFileStatus(store.shop, store.accessToken, result.fileId);
          if (fileStatus.url) {
            cdnUrl = fileStatus.url;
            break;
          }
          if (fileStatus.status === "FAILED") break;
        }
      }

      return NextResponse.json({
        uploaded: 1,
        result: {
          fileId: result.fileId,
          cdnUrl,
          sourceUrl: url,
        },
      });
    }

    // バッチアップロード（assetIds or pageId指定）
    const where: Record<string, unknown> = { status: { in: ["pending", "failed"] } };
    if (assetIds && assetIds.length > 0) {
      where.id = { in: assetIds };
    } else if (pageId) {
      where.pageId = pageId;
    } else {
      return NextResponse.json(
        { error: "assetIds, pageId, または url のいずれかが必要です" },
        { status: 400 },
      );
    }

    const pendingAssets = await prisma.mediaAsset.findMany({
      where,
      take: 20, // バッチ制限
    });

    const results: Array<{ id: string; sourceUrl: string; status: string; cdnUrl?: string }> = [];

    for (const asset of pendingAssets) {
      try {
        await prisma.mediaAsset.update({
          where: { id: asset.id },
          data: { status: "uploading" },
        });

        const uploadResult = await uploadFileFromUrl(
          store.shop,
          store.accessToken,
          asset.sourceUrl,
          asset.alt || "",
        );

        if (!uploadResult) {
          throw new Error("Upload returned null");
        }

        // 短時間ポーリング
        let cdnUrl = uploadResult.cdnUrl;
        if (!cdnUrl && uploadResult.fileId) {
          for (let i = 0; i < 3; i++) {
            await new Promise((r) => setTimeout(r, 2000));
            const fileStatus = await checkFileStatus(
              store.shop,
              store.accessToken,
              uploadResult.fileId,
            );
            if (fileStatus.url) {
              cdnUrl = fileStatus.url;
              break;
            }
          }
        }

        await prisma.mediaAsset.update({
          where: { id: asset.id },
          data: {
            status: cdnUrl ? "uploaded" : "uploading",
            shopifyFileId: uploadResult.fileId,
            shopifyCdnUrl: cdnUrl || null,
          },
        });

        results.push({
          id: asset.id,
          sourceUrl: asset.sourceUrl,
          status: cdnUrl ? "uploaded" : "uploading",
          cdnUrl: cdnUrl || undefined,
        });
      } catch (err) {
        await prisma.mediaAsset.update({
          where: { id: asset.id },
          data: { status: "failed" },
        });
        results.push({
          id: asset.id,
          sourceUrl: asset.sourceUrl,
          status: "failed",
        });
      }
    }

    const uploadedCount = results.filter((r) => r.status === "uploaded").length;
    return NextResponse.json({
      uploaded: uploadedCount,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error("[Media POST Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "アップロードに失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * PUT: メディアアセットのメタデータを更新（alt, context）
 * body: { id: string, alt?: string, context?: string }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, alt, context } = body;

    if (!id) {
      return NextResponse.json({ error: "id は必須です" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (alt !== undefined) updateData.alt = alt;
    if (context !== undefined) updateData.context = context;

    const asset = await prisma.mediaAsset.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      asset: {
        id: asset.id,
        alt: asset.alt,
        context: asset.context,
        sourceUrl: asset.sourceUrl,
        shopifyCdnUrl: asset.shopifyCdnUrl,
      },
    });
  } catch (error) {
    console.error("[Media PUT Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "メディア更新に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * DELETE: メディアアセットレコードを削除
 * ※ Shopify CDN上のファイルは削除しない（CDNは自動管理）
 */
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id パラメータが必要です" }, { status: 400 });
    }

    await prisma.mediaAsset.delete({ where: { id } });

    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    console.error("[Media DELETE Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "メディア削除に失敗しました" },
      { status: 500 },
    );
  }
}
