import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10;

/**
 * POST /api/build/review
 *
 * [DEPRECATED] DDP Next では Phase 5 (Fine-tune) が品質調整を担当。
 * ACE-ADIS 統合により Phase 5.5 (AI Quality Review) + HQS フィードバックループ実装済み。
 * 後方互換性のためスタブとして残す。
 */
export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error: "このエンドポイントは廃止されました。DDP Next Phase 5 + Phase 5.5 が品質調整を実行します。",
      deprecated: true,
      migration: "Quality assurance is built into DDP Next (Phase 5: Fine-tune, Phase 5.5: AI Quality Review). For HQS feedback, use POST /api/build/feedback.",
    },
    { status: 410 },
  );
}
