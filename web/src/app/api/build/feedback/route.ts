import { NextRequest, NextResponse } from "next/server";
import {
  updateHQSFromFeedback,
  updateUserDNA,
  findLowQualitySections,
} from "@/lib/ddp-next/evolution";
import type { SectionFeedback } from "@/lib/ddp-next/evolution";
import { loadLatestUserDNA, saveUserDNA } from "@/lib/ddp-next/ace-adis-bridge";

export const maxDuration = 10;

/**
 * POST /api/build/feedback
 *
 * ACE-ADIS Evolution Engine — HQS フィードバックループ
 *
 * ユーザーのlike/dislike/regenerateアクションを受け取り:
 * 1. HQS スコアを EMA 更新
 * 2. ユーザーの Design DNA を学習更新
 * 3. 更新結果を DB に永続化
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sectionId, action, ratings, context } = body;

    if (!sectionId || !action) {
      return NextResponse.json(
        { error: "sectionId と action は必須です" },
        { status: 400 },
      );
    }

    if (!["like", "dislike", "regenerate"].includes(action)) {
      return NextResponse.json(
        { error: "action は like, dislike, regenerate のいずれかです" },
        { status: 400 },
      );
    }

    const feedback: SectionFeedback = {
      sectionId,
      action,
      ratings: ratings || undefined,
      context: context || undefined,
    };

    // ── 1. HQS更新（EMA） ──
    const hqsResult = updateHQSFromFeedback(feedback);

    console.log("[Build/Feedback] HQS updated:", {
      sectionId,
      action,
      updated: hqsResult.updated,
      newComposite: hqsResult.newComposite.toFixed(2),
    });

    // ── 2. Design DNA学習更新 ──
    let dnaUpdate = null;
    const { dna: currentDNA, confidence, totalRatings } = await loadLatestUserDNA();

    if (currentDNA) {
      const result = updateUserDNA(currentDNA, feedback);

      if (result.changedDimensions.length > 0) {
        // DNA変化があれば永続化
        const newTotalRatings = totalRatings + 1;
        const newConfidence = Math.min(1.0, newTotalRatings / 50); // 50回で100%

        await saveUserDNA(result.after, newConfidence, newTotalRatings);

        dnaUpdate = {
          changedDimensions: result.changedDimensions,
          confidence: newConfidence,
          totalRatings: newTotalRatings,
        };

        console.log("[Build/Feedback] DNA updated:", {
          changed: result.changedDimensions,
          confidence: newConfidence.toFixed(2),
          totalRatings: newTotalRatings,
        });
      }
    } else {
      // 初回: デフォルトDNAから学習開始
      const defaultDNA = {
        minimalism: 0, whitespace: 0, contrast: 0,
        animationIntensity: 0, serifAffinity: 0, colorSaturation: 0,
        layoutComplexity: 0, imageWeight: 0, asymmetry: 0, novelty: 0,
      };
      const result = updateUserDNA(defaultDNA, feedback);
      await saveUserDNA(result.after, 0.02, 1);

      dnaUpdate = {
        changedDimensions: result.changedDimensions,
        confidence: 0.02,
        totalRatings: 1,
      };

      console.log("[Build/Feedback] DNA initialized from first feedback");
    }

    return NextResponse.json({
      success: true,
      hqs: {
        updated: hqsResult.updated,
        newComposite: hqsResult.newComposite,
      },
      dna: dnaUpdate,
    });
  } catch (error) {
    console.error("[Build/Feedback] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "フィードバック処理に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/build/feedback
 *
 * 低品質セクション一覧を取得（改善候補）
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const threshold = parseFloat(url.searchParams.get("threshold") || "3.0");

    const lowQuality = findLowQualitySections(threshold);
    const { dna, confidence, totalRatings } = await loadLatestUserDNA();

    return NextResponse.json({
      lowQualitySections: lowQuality,
      userDNA: dna ? {
        ...dna,
        confidence,
        totalRatings,
      } : null,
    });
  } catch (error) {
    console.error("[Build/Feedback] GET Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "取得に失敗しました" },
      { status: 500 },
    );
  }
}
