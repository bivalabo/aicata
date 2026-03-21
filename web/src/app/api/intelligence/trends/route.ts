import { NextRequest, NextResponse } from "next/server";
import { db, safeJsonParse } from "@/lib/prisma-extended";
import { cacheControlHeader, CACHE_PRESETS } from "@/lib/api-cache";

/**
 * GET /api/intelligence/trends
 * 最新のトレンドレポートを取得
 */
export async function GET() {
  try {
    const report = await db.trendReport.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!report) {
      return NextResponse.json({
        period: "",
        emergingPatterns: [],
        decliningPatterns: [],
        colorTrends: [],
        typographyTrends: [],
      }, { headers: { "Cache-Control": cacheControlHeader(CACHE_PRESETS.trends) } });
    }

    return NextResponse.json({
      id: report.id,
      period: report.period,
      emergingPatterns: safeJsonParse(report.emergingPatterns, []),
      decliningPatterns: safeJsonParse(report.decliningPatterns, []),
      colorTrends: safeJsonParse(report.colorTrends, []),
      typographyTrends: safeJsonParse(report.typographyTrends, []),
      layoutTrends: safeJsonParse(report.layoutTrends, []),
      createdAt: report.createdAt,
    }, { headers: { "Cache-Control": cacheControlHeader(CACHE_PRESETS.trends) } });
  } catch (error) {
    console.error("[Trends GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch trend report" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/intelligence/trends
 * 新しいトレンドレポートを作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.period || typeof body.period !== "string") {
      return NextResponse.json({ error: "Period is required" }, { status: 400 });
    }

    const report = await db.trendReport.create({
      data: {
        period: body.period,
        emergingPatterns: JSON.stringify(body.emergingPatterns || []),
        decliningPatterns: JSON.stringify(body.decliningPatterns || []),
        colorTrends: body.colorTrends ? JSON.stringify(body.colorTrends) : null,
        typographyTrends: body.typographyTrends ? JSON.stringify(body.typographyTrends) : null,
        layoutTrends: body.layoutTrends ? JSON.stringify(body.layoutTrends) : null,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("[Trends POST]", error);
    return NextResponse.json(
      { error: "Failed to create trend report" },
      { status: 500 },
    );
  }
}
