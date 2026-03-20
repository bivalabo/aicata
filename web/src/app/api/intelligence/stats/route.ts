import { NextResponse } from "next/server";
import { getACEStats } from "@/lib/ace-adis";
import { cachedFetch, CACHE_PRESETS, cacheControlHeader } from "@/lib/api-cache";

export async function GET() {
  try {
    const stats = await cachedFetch(
      "ace-stats",
      () => getACEStats(),
      CACHE_PRESETS.aceStats,
    );
    return NextResponse.json(stats, {
      headers: { "Cache-Control": cacheControlHeader(CACHE_PRESETS.aceStats) },
    });
  } catch (error) {
    console.error("[Intelligence Stats]", error);
    return NextResponse.json(
      { error: "Failed to fetch ACE stats" },
      { status: 500 },
    );
  }
}
