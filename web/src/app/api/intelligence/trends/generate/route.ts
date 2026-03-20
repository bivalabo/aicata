// ============================================================
// POST /api/intelligence/trends/generate
// Web Trend Tracker: トレンドレポート自動生成
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { generateReport, collectFromEvaluations } from "@/lib/ace-adis/trend-tracker";
import { withRateLimit, AI_RATE_LIMIT } from "@/lib/rate-limit";

/**
 * POST /api/intelligence/trends/generate
 *
 * パイプライン:
 * 1. SiteEvaluation から評価データを集計
 * 2. Claude AI でトレンド分析
 * 3. TrendReport として保存
 * 4. DesignPattern の momentum 値を更新
 *
 * Body (optional):
 *   { "daysBack": 30 }  — 分析対象の日数（デフォルト30）
 */
export async function POST(request: NextRequest) {
  // レート制限チェック
  const rateLimited = withRateLimit(request, AI_RATE_LIMIT);
  if (rateLimited) return rateLimited;

  try {
    let daysBack = 30;

    try {
      const body = await request.json();
      if (body.daysBack && typeof body.daysBack === "number" && body.daysBack > 0) {
        daysBack = Math.min(body.daysBack, 365); // 最大1年
      }
    } catch {
      // body がない場合はデフォルト値で続行
    }

    console.log("[TrendTracker Generate] Starting pipeline, daysBack:", daysBack);

    // まずデータが十分にあるか確認
    const collection = await collectFromEvaluations(daysBack);

    if (collection.evaluationCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "分析対象のサイト評価データがありません。Curatorタブでサイトを評価してからレポートを生成してください。",
          evaluationCount: 0,
        },
        { status: 422 },
      );
    }

    // フルパイプライン実行
    const { report, analysis } = await generateReport(daysBack);

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        period: report.period || collection.period,
        createdAt: report.createdAt,
      },
      stats: {
        evaluationCount: collection.evaluationCount,
        emergingCount: analysis.emergingPatterns.length,
        decliningCount: analysis.decliningPatterns.length,
        colorTrendCount: analysis.colorTrends.length,
        typographyTrendCount: analysis.typographyTrends.length,
      },
      summary: analysis.summary,
    });
  } catch (error) {
    console.error("[TrendTracker Generate] Error:", error);
    return NextResponse.json(
      { error: "トレンドレポートの生成に失敗しました" },
      { status: 500 },
    );
  }
}
