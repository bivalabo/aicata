// ============================================================
// API Error Handling — 安全なエラーレスポンス
//
// 本番環境では内部エラー詳細を返さず、汎用メッセージを返す。
// 開発環境では詳細を含める（デバッグ用）。
// ============================================================

/**
 * API ルートのエラーハンドリング。
 * 本番環境ではスタックトレースやDB詳細を隠蔽。
 */
export function apiErrorResponse(
  error: unknown,
  context: string,
  statusCode = 500,
): Response {
  const isDev = process.env.NODE_ENV !== "production";

  // サーバーログには常に詳細を出力
  console.error(`[${context}]`, error);

  // クライアント向けメッセージ
  const message = isDev && error instanceof Error
    ? error.message
    : "内部エラーが発生しました。しばらくしてから再度お試しください。";

  return Response.json(
    { error: message },
    { status: statusCode },
  );
}

/**
 * JSON parse エラーを安全にハンドリング
 */
export async function safeParseJSON(request: Request): Promise<
  { success: true; data: unknown } | { success: false; response: Response }
> {
  try {
    const data = await request.json();
    return { success: true, data };
  } catch {
    return {
      success: false,
      response: Response.json(
        { error: "リクエスト本文のJSON解析に失敗しました" },
        { status: 400 },
      ),
    };
  }
}
