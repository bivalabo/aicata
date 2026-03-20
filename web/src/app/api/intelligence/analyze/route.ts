// ============================================================
// POST /api/intelligence/analyze
// Claude Vision でサイトを自動分析し、評価 + Design DNA 更新
// ============================================================

import { NextResponse } from "next/server";
import { analyzeWithVision } from "@/lib/ace-adis/curator-vision";
import { updateDesignDNA } from "@/lib/ace-adis/design-dna-engine";
import { createDefaultDesignDNA } from "@/lib/ace-adis/types";
import type { DesignDNA } from "@/lib/ace-adis/types";
import { db, safeJsonParse } from "@/lib/prisma-extended";
import { withRateLimit, AI_RATE_LIMIT } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // レート制限チェック（AI分析は高コストのため厳しめ）
  const rateLimited = withRateLimit(request, AI_RATE_LIMIT);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const { url, screenshotBase64, screenshotUrl } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 },
      );
    }

    if (!screenshotBase64 && !screenshotUrl) {
      return NextResponse.json(
        { error: "Either screenshotBase64 or screenshotUrl is required" },
        { status: 400 },
      );
    }

    // 1. Vision APIで分析
    console.log("[Intelligence Analyze] Starting vision analysis for:", url);
    const analysis = await analyzeWithVision({
      url,
      screenshotBase64,
      screenshotUrl,
    });

    if (!analysis.success) {
      return NextResponse.json(
        { error: analysis.error || "Vision analysis failed" },
        { status: 500 },
      );
    }

    // 2. 評価をDBに保存
    const evaluation = await db.siteEvaluation.create({
      data: {
        url,
        overallRating: analysis.overallRating,
        typographyScore: analysis.typographyScore,
        colorScore: analysis.colorScore,
        layoutScore: analysis.layoutScore,
        animationScore: analysis.animationScore,
        spacingScore: analysis.spacingScore,
        tags: JSON.stringify(analysis.tags),
        notes: analysis.summary,
        analyzedColors: JSON.stringify(analysis.colors),
        analyzedFonts: JSON.stringify(analysis.fonts),
        analyzedLayout: JSON.stringify({
          pattern: analysis.layoutPattern,
          tones: analysis.designTones,
        }),
        detectedPatterns: JSON.stringify(analysis.detectedPatterns),
      },
    });

    // 3. Design DNA を更新
    let updatedDna = null;
    try {
      // 最新のDNAスナップショットを取得
      const latestSnapshot = await db.designDNASnapshot.findFirst({
        orderBy: { createdAt: "desc" },
      });

      const currentDna: DesignDNA = latestSnapshot
        ? {
            preferences: {
              minimalism: latestSnapshot.minimalism,
              whitespace: latestSnapshot.whitespace,
              contrast: latestSnapshot.contrast,
              animationIntensity: latestSnapshot.animationIntensity,
              serifAffinity: latestSnapshot.serifAffinity,
              colorSaturation: latestSnapshot.colorSaturation,
              layoutComplexity: latestSnapshot.layoutComplexity,
              imageWeight: latestSnapshot.imageWeight,
              asymmetry: latestSnapshot.asymmetry,
              novelty: latestSnapshot.novelty,
            },
            favoritePatterns: safeJsonParse(latestSnapshot.favoritePatterns, []),
            avoidPatterns: safeJsonParse(latestSnapshot.avoidPatterns, []),
            industryBias: {},
            lastUpdated: latestSnapshot.createdAt,
            totalRatings: latestSnapshot.totalRatings || 0,
            confidence: latestSnapshot.confidence || 0,
          }
        : createDefaultDesignDNA();

      const evaluationData = {
        url,
        overallRating: analysis.overallRating,
        tags: analysis.tags,
      };
      const totalRatings = currentDna.totalRatings + 1;
      const result = updateDesignDNA(currentDna, evaluationData);
      updatedDna = result.dna;

      // 新しいスナップショットを保存
      await db.designDNASnapshot.create({
        data: {
          ...updatedDna.preferences,
          confidence: Math.min(1.0, totalRatings * 0.1),
          totalRatings,
          favoritePatterns: JSON.stringify(updatedDna.favoritePatterns),
          avoidPatterns: JSON.stringify(updatedDna.avoidPatterns),
        },
      });
    } catch (dnaError) {
      console.error("[Intelligence Analyze] DNA update failed:", dnaError);
      // DNA更新失敗はnon-fatal
    }

    // 4. レスポンス
    return NextResponse.json({
      success: true,
      evaluation: {
        id: evaluation.id,
        url: evaluation.url,
        overallRating: evaluation.overallRating,
      },
      analysis: {
        colors: analysis.colors,
        fonts: analysis.fonts,
        layoutPattern: analysis.layoutPattern,
        designTones: analysis.designTones,
        detectedPatterns: analysis.detectedPatterns,
        summary: analysis.summary,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
      },
      dnaUpdated: updatedDna !== null,
    });
  } catch (error) {
    console.error("[Intelligence Analyze] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
