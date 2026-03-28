import { NextRequest, NextResponse } from "next/server";
import {
  collectFromEvaluations,
  analyzeWithAI as analyzeTrends,
  generateReport as generateTrendReport,
} from "@/lib/ace-adis/trend-tracker";

export const maxDuration = 60;

/**
 * POST /api/admin/trend-tracker
 *
 * ACE-ADIS Trend Tracker — 週次トレンド分析を実行
 *
 * Vercel Cron / 外部スケジューラーからの呼び出しを想定。
 * Authorization ヘッダーで CRON_SECRET を検証。
 *
 * 処理:
 * 1. 過去30日分のサイト評価データを収集
 * 2. 評価3件以上 → Claude AIで分析、未満 → ルールベース
 * 3. トレンドレポートをDBに保存
 * 4. パターンモメンタムスコアを更新
 */
export async function POST(req: NextRequest) {
  try {
    // Cron認証（CRON_SECRET が設定されている場合のみチェック）
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 },
        );
      }
    }

    const body = await req.json().catch(() => ({}));
    const daysBack = (body as any).daysBack || 30;

    console.log("[TrendTracker] Starting trend analysis (daysBack:", daysBack, ")");

    // トレンドレポート生成（収集 → AI分析 → DB保存）
    const result = await generateTrendReport(daysBack);

    console.log("[TrendTracker] Report generated:", {
      period: result.collection.period,
      evaluationCount: result.collection.evaluationCount,
      aiUsed: result.collection.evaluationCount >= 3,
    });

    return NextResponse.json({
      success: true,
      period: result.collection.period,
      evaluationCount: result.collection.evaluationCount,
      aiUsed: result.collection.evaluationCount >= 3,
      analysis: {
        emergingPatterns: result.analysis.emergingPatterns?.length || 0,
        decliningPatterns: result.analysis.decliningPatterns?.length || 0,
      },
    });
  } catch (error) {
    console.error("[TrendTracker] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "トレンド分析に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/admin/trend-tracker
 *
 * 最新のトレンド収集データを返す（AI分析なし、高速）
 */
export async function GET() {
  try {
    const collection = await collectFromEvaluations(30);

    return NextResponse.json({
      period: collection.period,
      evaluationCount: collection.evaluationCount,
      topPatterns: Object.entries(collection.patternFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      topColors: collection.colorSummary.slice(0, 5),
      topFonts: collection.fontSummary.slice(0, 5),
      toneDistribution: collection.toneSummary,
      layoutDistribution: collection.layoutSummary,
    });
  } catch (error) {
    console.error("[TrendTracker] GET Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "取得に失敗しました" },
      { status: 500 },
    );
  }
}
