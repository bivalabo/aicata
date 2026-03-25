// ============================================================
// Aicata — Logger Utility
// 本番環境ではdebugログを抑制し、構造化ログを出力する
// ============================================================

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/** 本番環境では info 以上のみ出力 */
const MIN_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatPrefix(tag: string): string {
  return `[${tag}]`;
}

/**
 * タグ付きロガーを生成する
 *
 * @example
 * const log = createLogger("ChatStream");
 * log.info("Started streaming");        // → [ChatStream] Started streaming
 * log.debug("Token count:", 42);         // → 本番では出力されない
 * log.error("Failed:", error);           // → [ChatStream] Failed: <error>
 */
export function createLogger(tag: string) {
  const prefix = formatPrefix(tag);

  return {
    debug: (...args: unknown[]) => {
      if (shouldLog("debug")) console.log(prefix, ...args);
    },
    info: (...args: unknown[]) => {
      if (shouldLog("info")) console.log(prefix, ...args);
    },
    warn: (...args: unknown[]) => {
      if (shouldLog("warn")) console.warn(prefix, ...args);
    },
    error: (...args: unknown[]) => {
      if (shouldLog("error")) console.error(prefix, ...args);
    },
  };
}

/** グローバルロガー（タグ名指定不要の場合） */
export const logger = createLogger("Aicata");
