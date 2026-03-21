// ============================================================
// Simple In-Memory Rate Limiter
//
// トークンバケットアルゴリズムによるAPIレート制限。
// プロダクション環境ではRedis等に置き換え推奨。
// ============================================================

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  /** バケットの最大トークン数 */
  maxTokens: number;
  /** リフィル間隔（ミリ秒） */
  refillInterval: number;
  /** リフィルごとに追加されるトークン数 */
  refillAmount: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxTokens: 10,
  refillInterval: 60_000, // 1分
  refillAmount: 10,
};

// AI分析系のエンドポイント向け（よりレート制限を厳しく）
export const AI_RATE_LIMIT: RateLimitConfig = {
  maxTokens: 5,
  refillInterval: 60_000,
  refillAmount: 3,
};

// 読み取り系のエンドポイント向け（緩めのレート制限）
export const READ_RATE_LIMIT: RateLimitConfig = {
  maxTokens: 30,
  refillInterval: 60_000,
  refillAmount: 30,
};

const buckets = new Map<string, RateLimitEntry>();

// 定期的に古いエントリをクリーンアップ（メモリリーク防止）
const CLEANUP_INTERVAL = 5 * 60_000; // 5分
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const staleThreshold = now - 10 * 60_000; // 10分以上アクセスなし
  for (const [key, entry] of buckets) {
    if (entry.lastRefill < staleThreshold) {
      buckets.delete(key);
    }
  }
}

/**
 * レートリミットをチェックする
 *
 * @param key 識別キー（IPアドレス、ユーザーIDなど）
 * @param config レート制限設定
 * @returns { allowed: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): { allowed: boolean; remaining: number; resetIn: number } {
  cleanup();

  const now = Date.now();
  let entry = buckets.get(key);

  if (!entry) {
    entry = { tokens: config.maxTokens, lastRefill: now };
    buckets.set(key, entry);
  }

  // トークンリフィル
  const elapsed = now - entry.lastRefill;
  const refills = Math.floor(elapsed / config.refillInterval);
  if (refills > 0) {
    entry.tokens = Math.min(
      config.maxTokens,
      entry.tokens + refills * config.refillAmount,
    );
    entry.lastRefill = now;
  }

  // トークン消費
  if (entry.tokens > 0) {
    entry.tokens--;
    return {
      allowed: true,
      remaining: entry.tokens,
      resetIn: config.refillInterval - (now - entry.lastRefill),
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetIn: config.refillInterval - (now - entry.lastRefill),
  };
}

/**
 * Next.js API ルートで使うヘルパー
 *
 * @example
 * ```ts
 * import { withRateLimit, AI_RATE_LIMIT } from "@/lib/rate-limit";
 *
 * export async function POST(request: Request) {
 *   const rateLimitResult = withRateLimit(request, AI_RATE_LIMIT);
 *   if (rateLimitResult) return rateLimitResult; // 429 レスポンス
 *   // ... 通常の処理
 * }
 * ```
 */
export function withRateLimit(
  request: Request,
  config: RateLimitConfig = DEFAULT_CONFIG,
): Response | null {
  // X-Forwarded-For or fallback to a generic key
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const url = new URL(request.url);
  const key = `${ip}:${url.pathname}`;

  const result = checkRateLimit(key, config);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: "レート制限を超えました。しばらく待ってから再試行してください。",
        retryAfter: Math.ceil(result.resetIn / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(result.resetIn / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  return null;
}
