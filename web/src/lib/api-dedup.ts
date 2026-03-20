// ============================================================
// API Request Deduplication & Debouncing
//
// 同一エンドポイントへの重複リクエストを排除し、
// デバウンスで頻繁な呼び出しを抑制する。
// ============================================================

type FetcherFn<T> = () => Promise<T>;

/** 進行中のリクエストを保持するMap */
const inflight = new Map<string, Promise<unknown>>();

/**
 * 同一キーのリクエストが進行中なら、その Promise を返す（重複排除）
 *
 * @example
 * ```ts
 * const data = await dedupFetch("stats", () => fetch("/api/stats").then(r => r.json()));
 * ```
 */
export async function dedupFetch<T>(key: string, fetcher: FetcherFn<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fetcher().finally(() => {
    inflight.delete(key);
  });

  inflight.set(key, promise);
  return promise;
}

/**
 * デバウンスされたフェッチャーを返すファクトリ。
 * 指定ms以内の連続呼び出しは最後の1回だけ実行される。
 *
 * @example
 * ```ts
 * const debouncedSearch = createDebouncedFetcher<SearchResult>(300);
 * // 300ms以内に複数回呼んでも最後の1回だけ実行
 * const result = await debouncedSearch("search", () => fetch(...));
 * ```
 */
export function createDebouncedFetcher<T>(delayMs: number) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const pending = new Map<string, { resolve: (v: T) => void; reject: (e: unknown) => void }[]>();

  return (key: string, fetcher: FetcherFn<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      // 既存のタイマーをクリア
      const existingTimer = timers.get(key);
      if (existingTimer) clearTimeout(existingTimer);

      // このPromiseの解決関数を追加
      const callbacks = pending.get(key) || [];
      callbacks.push({ resolve, reject });
      pending.set(key, callbacks);

      // 新しいタイマーをセット
      const timer = setTimeout(async () => {
        timers.delete(key);
        const cbs = pending.get(key) || [];
        pending.delete(key);

        try {
          const result = await fetcher();
          cbs.forEach((cb) => cb.resolve(result));
        } catch (err) {
          cbs.forEach((cb) => cb.reject(err));
        }
      }, delayMs);

      timers.set(key, timer);
    });
  };
}

/**
 * SWR風のクライアントサイドキャッシュ。
 * 同一キーのデータをメモリキャッシュし、stale時にはバックグラウンド更新。
 */
interface ClientCacheEntry<T> {
  data: T;
  timestamp: number;
}

const clientCache = new Map<string, ClientCacheEntry<unknown>>();

export async function fetchWithClientCache<T>(
  key: string,
  fetcher: FetcherFn<T>,
  maxAgeMs = 30_000,
): Promise<T> {
  const existing = clientCache.get(key) as ClientCacheEntry<T> | undefined;
  const now = Date.now();

  if (existing && now - existing.timestamp < maxAgeMs) {
    return existing.data;
  }

  // Dedup the actual fetch
  const data = await dedupFetch(key, fetcher);
  clientCache.set(key, { data, timestamp: Date.now() });
  return data;
}

/** 特定キーのクライアントキャッシュを無効化 */
export function invalidateClientCache(key: string): void {
  clientCache.delete(key);
}

/** プレフィックスに一致するクライアントキャッシュをすべて無効化 */
export function invalidateClientCacheByPrefix(prefix: string): void {
  for (const k of clientCache.keys()) {
    if (k.startsWith(prefix)) clientCache.delete(k);
  }
}
