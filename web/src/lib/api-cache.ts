// ============================================================
// Server-Side In-Memory API Cache
//
// Intelligence API等の読み取り系レスポンスをキャッシュ。
// stale-while-revalidate パターンを実装。
// ============================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  /** エントリが新鮮な期間（ms） */
  maxAge: number;
  /** stale データを返しつつバックグラウンド更新する期間（ms） */
  staleWhileRevalidate: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

// 定期クリーンアップ（10分おき）
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 10 * 60_000;

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of cache) {
    const totalTTL = entry.maxAge + entry.staleWhileRevalidate;
    if (now - entry.timestamp > totalTTL) {
      cache.delete(key);
    }
  }
}

interface CacheOptions {
  /** キャッシュの新鮮な期間（秒）。デフォルト: 60 */
  maxAge?: number;
  /** stale状態で返す期間（秒）。デフォルト: 300 */
  staleWhileRevalidate?: number;
}

/** キャッシュ用のデフォルトプリセット */
export const CACHE_PRESETS = {
  /** ACE Stats: 純粋な計算結果。長期キャッシュ可。 */
  aceStats: { maxAge: 600, staleWhileRevalidate: 3600 },
  /** Design DNA: 評価ごとに変化するが、頻繁ではない */
  designDna: { maxAge: 120, staleWhileRevalidate: 600 },
  /** パターン一覧: 比較的安定 */
  patterns: { maxAge: 120, staleWhileRevalidate: 600 },
  /** 評価一覧: 追加時に変化 */
  evaluations: { maxAge: 60, staleWhileRevalidate: 300 },
  /** トレンドレポート: 日次レベルで変化 */
  trends: { maxAge: 3600, staleWhileRevalidate: 86400 },
  /** URL解析: 同一URLなら結果は同じ */
  urlAnalysis: { maxAge: 3600, staleWhileRevalidate: 86400 },
} as const;

/**
 * キャッシュからデータを取得、またはfetcherを実行
 *
 * @example
 * ```ts
 * const stats = await cachedFetch("ace-stats", () => getACEStats(), CACHE_PRESETS.aceStats);
 * ```
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => T | Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  cleanup();

  const maxAge = (options.maxAge ?? 60) * 1000;
  const staleWhileRevalidate = (options.staleWhileRevalidate ?? 300) * 1000;
  const now = Date.now();

  const existing = cache.get(key) as CacheEntry<T> | undefined;

  if (existing) {
    const age = now - existing.timestamp;

    // 新鮮: そのまま返す
    if (age < maxAge) {
      return existing.data;
    }

    // Stale but usable: 返しつつバックグラウンドで更新
    if (age < maxAge + staleWhileRevalidate) {
      // Fire-and-forget background revalidation
      Promise.resolve(fetcher())
        .then((freshData) => {
          cache.set(key, {
            data: freshData,
            timestamp: Date.now(),
            maxAge,
            staleWhileRevalidate,
          });
        })
        .catch((err) => {
          console.warn(`[Cache] Background revalidation failed for "${key}":`, err);
        });
      return existing.data;
    }
  }

  // キャッシュなし or 完全に期限切れ → フェッチ
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now(), maxAge, staleWhileRevalidate });
  return data;
}

/**
 * 特定のキーのキャッシュを無効化
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * プレフィックスに一致するキャッシュをすべて無効化
 */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Cache-Control ヘッダーを生成する
 */
export function cacheControlHeader(options: CacheOptions = {}): string {
  const maxAge = options.maxAge ?? 60;
  const swr = options.staleWhileRevalidate ?? 300;
  return `public, max-age=${maxAge}, stale-while-revalidate=${swr}`;
}
