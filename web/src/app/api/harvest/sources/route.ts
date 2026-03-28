import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedHarvestSources, harvestFromSource } from "@/lib/harvester";

/**
 * GET /api/harvest/sources — ハーベストソース一覧を取得
 */
export async function GET() {
  try {
    const sources = await prisma.harvestSource.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { jobs: true } },
      },
    });
    return NextResponse.json({ sources });
  } catch (error) {
    console.error("[API] harvest/sources GET error:", error);
    return NextResponse.json(
      { error: "ソースの取得に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/harvest/sources — ソースの登録 or シード実行
 * body: { action: "seed" } → 全参照元を一括登録
 * body: { action: "harvest", sourceId: string } → 指定ソースからハーベスト開始
 * body: { url, domain, label } → カスタムソースを追加
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "seed") {
      const count = await seedHarvestSources();
      return NextResponse.json({
        message: `${count}件のソースを登録しました`,
        count,
      });
    }

    if (body.action === "harvest") {
      const { sourceId } = body;
      if (!sourceId) {
        return NextResponse.json(
          { error: "sourceId が必要です" },
          { status: 400 },
        );
      }

      // 非同期で実行開始（レスポンスは即座に返す）
      harvestFromSource(sourceId).catch((err) => {
        console.error("[Harvester] Background harvest failed:", err);
      });

      return NextResponse.json({
        message: "ハーベストを開始しました",
        sourceId,
      });
    }

    // カスタムソース追加
    const { url, domain, label } = body;
    if (!url) {
      return NextResponse.json(
        { error: "url が必要です" },
        { status: 400 },
      );
    }

    const source = await prisma.harvestSource.create({
      data: {
        url,
        domain: domain || new URL(url).hostname,
        label: label || "",
        status: "pending",
      },
    });

    return NextResponse.json({ source });
  } catch (error) {
    console.error("[API] harvest/sources POST error:", error);
    return NextResponse.json(
      { error: "操作に失敗しました" },
      { status: 500 },
    );
  }
}
