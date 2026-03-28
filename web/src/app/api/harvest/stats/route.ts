import { NextResponse } from "next/server";
import { getHarvestStats } from "@/lib/harvester";

/**
 * GET /api/harvest/stats — ハーベスト統計
 */
export async function GET() {
  try {
    const stats = await getHarvestStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[API] harvest/stats GET error:", error);
    return NextResponse.json(
      { error: "統計の取得に失敗しました" },
      { status: 500 },
    );
  }
}
