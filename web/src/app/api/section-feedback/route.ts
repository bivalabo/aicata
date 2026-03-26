/**
 * セクションフィードバック API
 *
 * POST /api/section-feedback — セクションの評価を受け取りHQSスコアを更新
 *
 * 進化ループ: ユーザーの like/dislike/regenerate が
 * HQSスコアに反映され、次回のセクション選定に活かされる
 */
import { updateHQSFromFeedback, findLowQualitySections } from "@/lib/ddp-next/evolution";
import type { SectionFeedback } from "@/lib/ddp-next/evolution";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sectionId, action, ratings, context } = body;

    if (!sectionId || !action) {
      return Response.json(
        { error: "sectionId と action は必須です" },
        { status: 400 },
      );
    }

    if (!["like", "dislike", "regenerate"].includes(action)) {
      return Response.json(
        { error: "action は like / dislike / regenerate のいずれかです" },
        { status: 400 },
      );
    }

    const feedback: SectionFeedback = {
      sectionId,
      action,
      ratings: ratings || undefined,
      context: context || undefined,
    };

    const result = updateHQSFromFeedback(feedback);

    return Response.json({
      success: true,
      updated: result.updated,
      newComposite: result.newComposite,
    });
  } catch (error) {
    console.error("[Section Feedback] Error:", error);
    return Response.json(
      { error: "フィードバックの処理に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/section-feedback — 低品質セクション一覧を返す（改善候補）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const threshold = parseFloat(searchParams.get("threshold") || "3.0");

    const lowQuality = findLowQualitySections(threshold);

    return Response.json({
      sections: lowQuality,
      count: lowQuality.length,
    });
  } catch (error) {
    console.error("[Section Feedback] GET Error:", error);
    return Response.json(
      { error: "セクション分析に失敗しました" },
      { status: 500 },
    );
  }
}
