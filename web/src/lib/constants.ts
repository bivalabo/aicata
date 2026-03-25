// ============================================================
// Aicata — Application Constants
// マジックナンバーを排除し、名前付き定数に統一する
// ============================================================

// ── UI Timing (ms) ──

/** 保存成功表示を消すまでの時間 */
export const SAVE_FEEDBACK_DURATION_MS = 3000;

/** コピー成功フィードバックを消すまでの時間 */
export const COPY_FEEDBACK_DURATION_MS = 2000;

/** オートセーブのデバウンス遅延 */
export const AUTO_SAVE_DEBOUNCE_MS = 3000;

/** クライアントタイムアウト（AI応答待ち） */
export const CLIENT_TIMEOUT_MS = 180_000;

// ── DDP-Next: HQS Weights ──

/** HQS (Human Quality Score) の加重平均で使用する重み */
export const HQS_WEIGHTS = {
  visual: 0.30,
  rhythm: 0.25,
  conversion: 0.20,
  mobile: 0.15,
  brand: 0.10,
} as const;

/** HQS スコアの有効範囲 */
export const HQS_MIN = 1.0;
export const HQS_MAX = 5.0;

// ── DDP-Next: Evolution EMA ──

/** HQS更新のEMA平滑化係数 */
export const EMA_ALPHA_HQS = 0.15;
/** DNA更新のEMA平滑化係数 */
export const EMA_ALPHA_DNA = 0.10;

// ── DDP-Next: Section Swap ──

/** スワップスコア計算におけるHQS重み */
export const SWAP_WEIGHT_HQS = 0.6;
/** スワップスコア計算におけるDNA距離重み */
export const SWAP_WEIGHT_DNA = 0.4;
/** スワップ候補の最大数 */
export const SWAP_MAX_CANDIDATES = 8;

// ── Design DNA ──

/** Design DNA 座標の有効範囲 */
export const DNA_MIN = -1.0;
export const DNA_MAX = 1.0;

// ── API / Network ──

/** 外部フェッチのデフォルトタイムアウト */
export const FETCH_TIMEOUT_MS = 10_000;

/** Shopify GraphQL ポーリング間隔（メディアアップロード） */
export const SHOPIFY_POLL_INTERVAL_MS = 3000;
export const SHOPIFY_POLL_RETRY_INTERVAL_MS = 2000;

// ── Retry / Backoff ──

/** 初期バックオフ時間 */
export const INITIAL_BACKOFF_MS = 2000;
/** 最大バックオフ時間 */
export const MAX_BACKOFF_MS = 30_000;
/** 最大リトライ回数 */
export const MAX_RETRIES = 3;
