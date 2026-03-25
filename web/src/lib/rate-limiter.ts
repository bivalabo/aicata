// ============================================================
// In-Memory Rate Limiter — Sliding Window Counter
//
// Vercel Serverless では永続的なストアが使えないため、
// インメモリカウンターで実装（サーバーレスの各インスタンスごとに独立）。
// 本格運用では Redis + upstash/ratelimit に移行推奨。
// ============================================================

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp in ms
}

const store = new Map<string, RateLimitEntry>();

// 定期クリーンアップ（メモリリーク防止）
let cleanupTimer: ReturnType<typeof setInterval> | null = null;
function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 60_000); // 1分ごと
  // Node.js: タイマーがプロセスを保持しないようにする
  if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

export interface RateLimitConfig {
  /** リクエスト上限 */
  limit: number;
  /** ウィンドウ期間（ミリ秒） */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * レート制限チェック
 * @param key - 識別キー（IPアドレス、ストアID等）
 * @param config - 制限設定
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  ensureCleanup();
  const now = Date.now();
  const entry = store.get(key);

  // ウィンドウ期限切れ or 初回
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.limit - 1, resetAt: now + config.windowMs };
  }

  // ウィンドウ内
  entry.count++;
  const remaining = Math.max(0, config.limit - entry.count);
  return {
    allowed: entry.count <= config.limit,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * レート制限超過時の429レスポンスを生成
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
  return Response.json(
    { error: "リクエストが多すぎます。しばらくしてから再度お試しください。" },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, retryAfter)),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.resetAt),
      },
    },
  );
}

// ── プリセット設定 ──

/** AI操作系: 1分あたり10リクエスト */
export const AI_RATE_LIMIT: RateLimitConfig = {
  limit: 10,
  windowMs: 60_000,
};

/** URL分析: 1分あたり5リクエスト */
export const ANALYSIS_RATE_LIMIT: RateLimitConfig = {
  limit: 5,
  windowMs: 60_000,
};

/** 一般API: 1分あたり60リクエスト */
export const GENERAL_RATE_LIMIT: RateLimitConfig = {
  limit: 60,
  windowMs: 60_000,
};
