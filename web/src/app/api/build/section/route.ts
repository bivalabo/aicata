import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10;

/**
 * POST /api/build/section
 *
 * [DEPRECATED] DDP Next では不要。
 * plan エンドポイントが全セクションを含む完成ページを一括生成する。
 * 後方互換性のためスタブとして残す。
 */
export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error: "このエンドポイントは廃止されました。DDP Next では /api/build/plan が全セクションを一括生成します。",
      deprecated: true,
      migration: "Use POST /api/build/plan instead — it returns the complete page (html, css, fullDocument) in a single call.",
    },
    { status: 410 },
  );
}
