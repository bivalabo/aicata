import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/harvest/blocks — ハーベスト済みブロック一覧
 * Query params:
 *   category — セクションカテゴリでフィルタ
 *   tone — トーンでフィルタ
 *   pageType — ページタイプでフィルタ
 *   status — ステータスでフィルタ (default: active)
 *   limit — 取得件数 (default: 50)
 *   offset — オフセット (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const tone = searchParams.get("tone");
    const pageType = searchParams.get("pageType");
    const status = searchParams.get("status") || "active";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Prisma の where 句を構築
    const where: Record<string, unknown> = { status };

    if (category) {
      where.sectionCategory = category;
    }
    if (tone) {
      where.tones = { contains: tone };
    }
    if (pageType) {
      where.pageTypes = { contains: pageType };
    }

    const [blocks, total] = await Promise.all([
      prisma.harvestedBlock.findMany({
        where,
        orderBy: [{ usageCount: "desc" }, { rqs: "desc" }],
        take: limit,
        skip: offset,
        select: {
          id: true,
          sectionCategory: true,
          sectionVariant: true,
          designDna: true,
          hqs: true,
          tones: true,
          pageTypes: true,
          rqs: true,
          sourceUrl: true,
          sourceDomain: true,
          usageCount: true,
          status: true,
          createdAt: true,
          // html/css は一覧では省略（詳細取得時のみ）
        },
      }),
      prisma.harvestedBlock.count({ where }),
    ]);

    // JSON文字列をパース
    const parsed = blocks.map((b: typeof blocks[number]) => ({
      ...b,
      designDna: JSON.parse(b.designDna),
      hqs: JSON.parse(b.hqs),
      tones: JSON.parse(b.tones),
      pageTypes: JSON.parse(b.pageTypes),
    }));

    return NextResponse.json({ blocks: parsed, total, limit, offset });
  } catch (error) {
    console.error("[API] harvest/blocks GET error:", error);
    return NextResponse.json(
      { error: "ブロックの取得に失敗しました" },
      { status: 500 },
    );
  }
}
