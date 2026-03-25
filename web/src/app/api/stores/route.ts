// ============================================================
// Aicata — Multi-Store Management API
// 複数ストアの一覧取得 + アクティブストア切り替え
//
// GET  /api/stores — 接続済みストア一覧
// POST /api/stores/switch — アクティブストア切り替え
// ============================================================

import { prisma } from "@/lib/db";
import { requireStore, AuthError } from "@/lib/api-auth";
import { apiErrorResponse } from "@/lib/api-error";

// ── GET: ストア一覧 ──

export async function GET() {
  try {
    // Require authentication
    await requireStore();

    const stores = await prisma.store.findMany({
      orderBy: { updatedAt: "desc" },
    });

    // isActive フィールドが存在しない場合のフォールバック（最初のストアをアクティブ扱い）
    const storesWithActive = stores.map((s: any, i: number) => ({
      id: s.id,
      shop: s.shop,
      name: s.name,
      domain: s.domain,
      plan: s.plan,
      isActive: (s as any).isActive ?? (i === 0),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    const activeStore = storesWithActive.find((s: any) => s.isActive) || storesWithActive[0] || null;

    return Response.json({
      stores: storesWithActive,
      activeStore,
      count: stores.length,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    return apiErrorResponse(error, "Stores GET");
  }
}

// ── POST: アクティブストア切り替え ──

export async function POST(request: Request) {
  try {
    // Require authentication
    await requireStore();

    const { storeId } = await request.json();

    if (!storeId) {
      return Response.json(
        { error: "storeIdが必要です" },
        { status: 400 },
      );
    }

    // 対象ストアが存在するか確認
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return Response.json(
        { error: "ストアが見つかりません" },
        { status: 404 },
      );
    }

    // 全ストアを非アクティブに → 対象をアクティブに
    // Use ORM methods to safely update stores
    try {
      // Deactivate all stores
      await prisma.store.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
      // Activate the selected store
      await prisma.store.update({
        where: { id: storeId },
        data: { isActive: true, updatedAt: new Date() },
      });
    } catch {
      // isActive カラムがない場合は updatedAt のみ更新（最新が常にアクティブ扱い）
      await prisma.store.update({
        where: { id: storeId },
        data: { updatedAt: new Date() },
      });
    }

    return Response.json({
      success: true,
      activeStoreId: storeId,
      storeName: store.name || store.shop,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    return apiErrorResponse(error, "Stores Switch");
  }
}
