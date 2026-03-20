import { NextResponse } from "next/server";
import { db, safeJsonParse } from "@/lib/prisma-extended";
import type { DesignDNA, DesignDNAPreferences } from "@/lib/ace-adis";
import { createDefaultDesignDNA } from "@/lib/ace-adis";
import { cacheControlHeader, CACHE_PRESETS } from "@/lib/api-cache";

/**
 * GET /api/intelligence/design-dna
 * 最新のDesign DNAスナップショットを返す
 */
export async function GET() {
  try {
    const snapshot = await db.designDNASnapshot.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!snapshot) {
      return NextResponse.json(createDefaultDesignDNA(), { headers: { "Cache-Control": cacheControlHeader(CACHE_PRESETS.designDna) } });
    }

    const dna: DesignDNA = {
      preferences: {
        minimalism: snapshot.minimalism,
        whitespace: snapshot.whitespace,
        contrast: snapshot.contrast,
        animationIntensity: snapshot.animationIntensity,
        serifAffinity: snapshot.serifAffinity,
        colorSaturation: snapshot.colorSaturation,
        layoutComplexity: snapshot.layoutComplexity,
        imageWeight: snapshot.imageWeight,
        asymmetry: snapshot.asymmetry,
        novelty: snapshot.novelty,
      },
      favoritePatterns: safeJsonParse(snapshot.favoritePatterns, []),
      avoidPatterns: safeJsonParse(snapshot.avoidPatterns, []),
      industryBias: {},
      lastUpdated: snapshot.createdAt,
      totalRatings: snapshot.totalRatings,
      confidence: snapshot.confidence,
    };

    return NextResponse.json(dna, { headers: { "Cache-Control": cacheControlHeader(CACHE_PRESETS.designDna) } });
  } catch (error) {
    console.error("[Design DNA GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch Design DNA" },
      { status: 500 },
    );
  }
}
