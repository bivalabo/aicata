import { NextRequest, NextResponse } from "next/server";
import { db, safeJsonParse } from "@/lib/prisma-extended";
import type { DesignPatternData } from "@/lib/ace-adis";
import { cacheControlHeader, CACHE_PRESETS } from "@/lib/api-cache";

/**
 * GET /api/intelligence/patterns
 * デザインパターン一覧
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const sortBy = searchParams.get("sort") || "momentum"; // momentum | prevalence | curatorScore

    const where = category ? { category } : {};

    const orderBy: Record<string, "asc" | "desc"> = {};
    if (sortBy === "momentum") orderBy.momentum = "desc";
    else if (sortBy === "prevalence") orderBy.prevalence = "desc";
    else if (sortBy === "curatorScore") orderBy.curatorScore = "desc";

    const [patterns, total] = await Promise.all([
      db.designPattern.findMany({
        where,
        orderBy,
        take: limit,
      }),
      db.designPattern.count({ where }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: DesignPatternData[] = patterns.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category as DesignPatternData["category"],
      description: p.description,
      cssSnippet: p.cssSnippet || undefined,
      prevalence: p.prevalence,
      momentum: p.momentum,
      firstSeen: p.firstSeen,
      lastSeen: p.lastSeen,
      curatorScore: p.curatorScore,
      curatorNotes: p.curatorNotes || undefined,
      atomIds: safeJsonParse(p.atomIds, []),
      blockIds: safeJsonParse(p.blockIds, []),
      industries: safeJsonParse(p.industries, []),
      tones: safeJsonParse(p.tones, []),
      examples: safeJsonParse(p.exampleUrls, [] as string[]).map((url: string) => ({ url })),
      exampleCount: p.exampleCount,
    }));

    return NextResponse.json({ patterns: data, total }, { headers: { "Cache-Control": cacheControlHeader(CACHE_PRESETS.patterns) } });
  } catch (error) {
    console.error("[Patterns GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch patterns" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/intelligence/patterns
 * 新しいデザインパターンを登録
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "Pattern name is required" }, { status: 400 });
    }
    if (!body.category || typeof body.category !== "string") {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    if (!body.description || typeof body.description !== "string") {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const pattern = await db.designPattern.create({
      data: {
        name: body.name,
        category: body.category,
        description: body.description,
        cssSnippet: body.cssSnippet,
        prevalence: body.prevalence ?? 0.5,
        momentum: body.momentum ?? 0,
        curatorScore: body.curatorScore,
        curatorNotes: body.curatorNotes,
        atomIds: body.atomIds ? JSON.stringify(body.atomIds) : null,
        blockIds: body.blockIds ? JSON.stringify(body.blockIds) : null,
        industries: body.industries ? JSON.stringify(body.industries) : null,
        tones: body.tones ? JSON.stringify(body.tones) : null,
        exampleUrls: body.exampleUrls ? JSON.stringify(body.exampleUrls) : null,
        exampleCount: body.exampleCount ?? 0,
      },
    });

    return NextResponse.json(pattern, { status: 201 });
  } catch (error) {
    console.error("[Patterns POST]", error);
    return NextResponse.json(
      { error: "Failed to create pattern" },
      { status: 500 },
    );
  }
}
