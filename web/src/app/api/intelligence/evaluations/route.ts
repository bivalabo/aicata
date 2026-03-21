import { NextRequest, NextResponse } from "next/server";
import { db, safeJsonParse } from "@/lib/prisma-extended";
import {
  updateDesignDNA,
  createDefaultDesignDNA,
} from "@/lib/ace-adis";
import type {
  CreateSiteEvaluationRequest,
  SiteEvaluationData,
  DesignDNA,
} from "@/lib/ace-adis";
import { cacheControlHeader, CACHE_PRESETS, invalidateCacheByPrefix } from "@/lib/api-cache";

/**
 * GET /api/intelligence/evaluations
 * サイト評価の一覧を返す
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const [evaluations, total] = await Promise.all([
      db.siteEvaluation.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.siteEvaluation.count(),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: SiteEvaluationData[] = evaluations.map((e: any) => ({
      id: e.id,
      url: e.url,
      screenshotPath: e.screenshotPath || undefined,
      overallRating: e.overallRating,
      typographyScore: e.typographyScore || undefined,
      colorScore: e.colorScore || undefined,
      layoutScore: e.layoutScore || undefined,
      animationScore: e.animationScore || undefined,
      spacingScore: e.spacingScore || undefined,
      tags: safeJsonParse(e.tags, []),
      notes: e.notes || undefined,
      analyzedColors: safeJsonParse(e.analyzedColors, undefined),
      analyzedFonts: safeJsonParse(e.analyzedFonts, undefined),
      analyzedLayout: safeJsonParse(e.analyzedLayout, undefined),
      detectedPatterns: safeJsonParse(e.detectedPatterns, undefined),
      createdAt: e.createdAt,
    }));

    return NextResponse.json({ evaluations: data, total }, { headers: { "Cache-Control": cacheControlHeader(CACHE_PRESETS.evaluations) } });
  } catch (error) {
    console.error("[Evaluations GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch evaluations" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/intelligence/evaluations
 * 新しいサイト評価を作成し、Design DNAを更新する
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateSiteEvaluationRequest = await request.json();

    // Input validation
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    if (!body.overallRating || typeof body.overallRating !== "number" || body.overallRating < 1 || body.overallRating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }
    if (!Array.isArray(body.tags)) {
      body.tags = [];
    }
    // Sanitize tags
    body.tags = body.tags.filter((t: unknown) => typeof t === "string").slice(0, 20);

    // 1. サイト評価をDBに保存
    const evaluation = await db.siteEvaluation.create({
      data: {
        url: body.url,
        overallRating: body.overallRating,
        typographyScore: body.typographyScore,
        colorScore: body.colorScore,
        layoutScore: body.layoutScore,
        animationScore: body.animationScore,
        spacingScore: body.spacingScore,
        tags: JSON.stringify(body.tags),
        notes: body.notes,
      },
    });

    // 2. 現在のDesign DNAを取得
    const latestSnapshot = await db.designDNASnapshot.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let currentDNA: DesignDNA;
    if (latestSnapshot) {
      currentDNA = {
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
        totalRatings: latestSnapshot.totalRatings,
        confidence: latestSnapshot.confidence,
      };
    } else {
      currentDNA = createDefaultDesignDNA();
    }

    // 3. Design DNAを更新
    const evalData: SiteEvaluationData = {
      id: evaluation.id,
      url: body.url,
      overallRating: body.overallRating,
      typographyScore: body.typographyScore,
      colorScore: body.colorScore,
      layoutScore: body.layoutScore,
      animationScore: body.animationScore,
      spacingScore: body.spacingScore,
      tags: body.tags,
      notes: body.notes,
      createdAt: evaluation.createdAt,
    };

    const { dna: updatedDNA, changes } = updateDesignDNA(currentDNA, evalData);

    // 4. Update Design DNA (best-effort, evaluation is already saved)
    try {
      await db.designDNASnapshot.create({
        data: {
          minimalism: updatedDNA.preferences.minimalism,
          whitespace: updatedDNA.preferences.whitespace,
          contrast: updatedDNA.preferences.contrast,
          animationIntensity: updatedDNA.preferences.animationIntensity,
          serifAffinity: updatedDNA.preferences.serifAffinity,
          colorSaturation: updatedDNA.preferences.colorSaturation,
          layoutComplexity: updatedDNA.preferences.layoutComplexity,
          imageWeight: updatedDNA.preferences.imageWeight,
          asymmetry: updatedDNA.preferences.asymmetry,
          novelty: updatedDNA.preferences.novelty,
          confidence: updatedDNA.confidence,
          totalRatings: updatedDNA.totalRatings,
          favoritePatterns: JSON.stringify(updatedDNA.favoritePatterns),
          avoidPatterns: JSON.stringify(updatedDNA.avoidPatterns),
        },
      });

      invalidateCacheByPrefix("evaluations");
      invalidateCacheByPrefix("design-dna");

      return NextResponse.json({
        evaluation: evalData,
        dna: updatedDNA,
        changes,
      });
    } catch (dnaError) {
      console.warn("[Evaluations] DNA update failed, evaluation saved:", dnaError);
      // Return evaluation without DNA update
      return NextResponse.json({ evaluation: evalData, dna: null, changes: {} });
    }
  } catch (error) {
    console.error("[Evaluations POST]", error);
    return NextResponse.json(
      { error: "Failed to create evaluation" },
      { status: 500 },
    );
  }
}
