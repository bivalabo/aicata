/**
 * Shopify ストア接続状態 API
 * GET  /api/shopify/store — 接続中のストア情報を返す
 * DELETE /api/shopify/store — ストア接続を解除
 */
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const store = await prisma.store.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    // ストアがない、またはデフォルトストア（accessToken空）は未接続扱い
    if (!store || !store.accessToken) {
      return Response.json({ connected: false, store: null });
    }

    return Response.json({
      connected: true,
      store: {
        id: store.id,
        shop: store.shop,
        name: store.name,
        email: store.email,
        domain: store.domain,
        plan: store.plan,
        scope: store.scope,
        connectedAt: store.createdAt,
      },
    });
  } catch (error) {
    console.error("Store fetch error:", error);
    return Response.json(
      { error: "ストア情報の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    // 全ストア接続を削除（MVP: 1ストアのみ想定）
    await prisma.store.deleteMany();
    return Response.json({ success: true });
  } catch (error) {
    console.error("Store disconnect error:", error);
    return Response.json(
      { error: "ストア接続の解除に失敗しました" },
      { status: 500 },
    );
  }
}
