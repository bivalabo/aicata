// ============================================================
// Aicata — Resilient Generation Engine (v3 with DDP Next)
//
// 「止まらない、最後まで作り上げる」を保証するシステム
//
// 設計原則:
//   1. DDP Next（キュレーション型エンジン）を唯一のエンジンとして使用
//   2. DDP Next 内部のフォールバック（personalizeContentFallback）で安定性を確保
//   3. チェックポイント保存 — 途中成果を必ず保存、再開可能
//   4. 部分成功の保証 — 10ページ中7ページ成功なら7ページは確実に保存
// ============================================================

import { prisma } from "./db";
import { runDDPNextPipeline } from "./ddp-next";
import type { DDPNextInput } from "./ddp-next";
import {
  MAX_RETRIES,
  INITIAL_BACKOFF_MS,
  MAX_BACKOFF_MS,
} from "@/lib/constants";

// ── Types ──

export interface GenerationTask {
  id: string;
  prompt: string;
  systemPrompt: string;
  pageType: string;
  title: string;
  conversationId: string;
  metadata?: Record<string, unknown>;
  /** DDP Next用の入力データ */
  ddpNextInput?: DDPNextInput;
}

export interface GenerationResult {
  taskId: string;
  status: "success" | "partial" | "failed";
  html: string;
  css: string;
  fullContent: string;
  pageId?: string;
  attempts: number;
  error?: string;
}

// ── Core: Resilient Single Page Generation ──

/**
 * 1ページを確実に生成する
 *
 * 戦略:
 *   1. DDP Next（キュレーション型エンジン）で生成
 *   2. DDP Next 内部のフォールバック（personalizeContentFallback）で安定性を確保
 *   3. 失敗した場合は自動リトライ（指数バックオフ）
 */
export async function generatePageResilently(
  task: GenerationTask,
  onProgress?: (event: { type: string; [key: string]: unknown }) => void,
): Promise<GenerationResult> {
  if (!task.ddpNextInput) {
    return {
      taskId: task.id,
      status: "failed",
      html: "",
      css: "",
      fullContent: "",
      attempts: 0,
      error: "DDPNextInput が指定されていません",
    };
  }

  let lastError: string | undefined;
  let attempts = 0;

  for (let retry = 0; retry <= MAX_RETRIES; retry++) {
    attempts = retry + 1;

    if (retry > 0) {
      const backoff = Math.min(
        INITIAL_BACKOFF_MS * Math.pow(2, retry - 1),
        MAX_BACKOFF_MS,
      );
      console.log(
        `[Resilient Gen] Retry ${retry}/${MAX_RETRIES} for "${task.title}" after ${backoff}ms`,
      );
      onProgress?.({
        type: "retry",
        taskId: task.id,
        retry,
        maxRetries: MAX_RETRIES,
        backoffMs: backoff,
      });
      await sleep(backoff);
    }

    try {
      console.log(`[Resilient Gen] Attempting DDP Next for "${task.title}" (attempt ${attempts})...`);
      onProgress?.({ type: "ddp_start", taskId: task.id });

      const result = await runDDPNextPipeline(task.ddpNextInput, (event) => {
        onProgress?.({ type: "ddp_progress", taskId: task.id, phase: event.phase, message: event.message });
      });

      if (result?.html && result.html.length > 100) {
        const pageId = await saveGeneratedPage(
          task,
          result.html,
          result.css,
        );

        console.log(`[Resilient Gen] ✓ DDP Next succeeded for "${task.title}"`, {
          templateId: result.templateId,
          timingMs: Math.round(result.timing.total),
        });

        return {
          taskId: task.id,
          status: "success",
          html: result.html,
          css: result.css,
          fullContent: result.fullDocument,
          pageId,
          attempts,
        };
      }

      lastError = "生成された内容が不十分です";
    } catch (err) {
      lastError = err instanceof Error ? err.message : "不明なエラー";
      console.error(
        `[Resilient Gen] ✗ "${task.title}" attempt ${attempts} failed:`,
        lastError,
      );

      // Overload error (429) の場合は長めのバックオフ
      if (lastError.includes("429") || lastError.includes("overloaded")) {
        await sleep(Math.min(INITIAL_BACKOFF_MS * Math.pow(2, retry + 1), 60000));
      }
    }
  }

  return {
    taskId: task.id,
    status: "failed",
    html: "",
    css: "",
    fullContent: "",
    attempts,
    error: lastError || "最大リトライ回数に達しました",
  };
}

// ── Batch Generation with Checkpoints ──

export interface BatchProgress {
  total: number;
  completed: number;
  succeeded: number;
  failed: number;
  currentTask?: string;
  results: GenerationResult[];
}

/**
 * 複数ページを順次生成（チェックポイント保存付き）
 * 途中でクライアント切断が起きても、完了分はDBに保存済み
 */
export async function generateBatchResilently(
  tasks: GenerationTask[],
  onProgress?: (progress: BatchProgress) => void,
  isCancelled?: () => boolean,
): Promise<BatchProgress> {
  const progress: BatchProgress = {
    total: tasks.length,
    completed: 0,
    succeeded: 0,
    failed: 0,
    results: [],
  };

  for (const task of tasks) {
    // キャンセルチェック
    if (isCancelled?.()) {
      console.log(
        `[Resilient Batch] Cancelled at ${progress.completed}/${progress.total}`,
      );
      break;
    }

    progress.currentTask = task.title;
    onProgress?.(progress);

    const result = await generatePageResilently(task, (event) => {
      if (event.type === "retry") {
        onProgress?.({
          ...progress,
          currentTask: `${task.title} (リトライ ${event.retry}/${event.maxRetries})`,
        });
      }
    });

    progress.results.push(result);
    progress.completed++;
    if (result.status === "success" || result.status === "partial") {
      progress.succeeded++;
    } else {
      progress.failed++;
    }

    onProgress?.(progress);
  }

  progress.currentTask = undefined;
  return progress;
}

// ── Internal Helpers ──

/**
 * 生成されたページをDBに保存
 */
async function saveGeneratedPage(
  task: GenerationTask,
  html: string,
  css: string,
): Promise<string> {
  try {
    const page = await (prisma.page.create as any)({
      data: {
        title: task.title || "生成ページ",
        slug: "",
        html,
        css,
        status: "draft",
        source: "aicata",
        version: 1,
        conversationId: task.conversationId,
        pageType: task.pageType,
      },
    });

    await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        version: 1,
        html,
        css,
        prompt: task.prompt.slice(0, 500),
      },
    });

    return page.id;
  } catch (err) {
    console.error("[Resilient Gen] Failed to save page:", err);
    throw err;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
