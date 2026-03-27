import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10;

/**
 * POST /api/build/assemble
 *
 * [DEPRECATED] DDP Next では不要。
 * plan エンドポイントがテンプレート組み立て（Phase 3）まで完了する。
 * 後方互換性のためスタブとして残す。
 */
export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error: "このエンドポイントは廃止されました。DDP Next では /api/build/plan がテンプレート組み立てまで一括実行します。",
      deprecated: true,
      migration: "Use POST /api/build/plan instead — it returns the assembled page (html, css, fullDocument) in a single call.",
    },
    { status: 410 },
  );
}
