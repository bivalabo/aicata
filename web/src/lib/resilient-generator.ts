// ============================================================
// Aicata — Resilient Generation Engine (v2 with DDP)
//
// 「止まらない、最後まで作り上げる」を保証するシステム
//
// 設計原則:
//   1. DDP (Design Decomposition Pipeline) を最優先で使用
//   2. 自動リトライ（指数バックオフ）— 一時的障害を自動回復
//   3. チェックポイント保存 — 途中成果を必ず保存、再開可能
//   4. フォールバックチェーン — DDP失敗時はレガシー単発生成にフォールバック
//   5. 部分成功の保証 — 10ページ中7ページ成功なら7ページは確実に保存
// ============================================================

import { anthropic, buildSystemPrompt, DEFAULT_MODEL } from "./anthropic";
import { prisma } from "./db";
import { getActiveBrandMemory, buildBrandMemoryPrompt } from "./brand-memory";
import { runDDP } from "./ddp";
import type { DDPInput } from "./ddp";
import {
  MAX_RETRIES,
  INITIAL_BACKOFF_MS,
  MAX_BACKOFF_MS,
  CLIENT_TIMEOUT_MS,
} from "@/lib/constants";

// ── Configuration ──

const GENERATION_TIMEOUT_MS = CLIENT_TIMEOUT_MS; // AI応答待ちと同じタイムアウト

// ── Types ──

export interface GenerationTask {
  id: string;
  prompt: string;
  systemPrompt: string;
  pageType: string;
  title: string;
  conversationId: string;
  metadata?: Record<string, unknown>;
  /** DDP用の入力データ（あればDDPを優先使用） */
  ddpInput?: DDPInput;
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

export interface CheckpointData {
  taskId: string;
  partialContent: string;
  attempts: number;
  lastError?: string;
  savedAt: Date;
}

// ── Core: Resilient Single Page Generation ──

/**
 * 1ページを確実に生成する
 *
 * 戦略:
 *   1. DDP (Design Decomposition Pipeline) を最優先で試みる
 *   2. DDP が失敗した場合、レガシー単発生成にフォールバック
 *   3. 失敗した場合は自動リトライし、部分的な成功でもHTMLを返す
 */
export async function generatePageResilently(
  task: GenerationTask,
  onProgress?: (event: { type: string; [key: string]: unknown }) => void,
): Promise<GenerationResult> {
  // ── DDP を最優先で試みる ──
  if (task.ddpInput) {
    try {
      console.log(`[Resilient Gen] Attempting DDP for "${task.title}"...`);
      onProgress?.({ type: "ddp_start", taskId: task.id });

      const ddpResult = await runDDP(task.ddpInput, undefined, (event) => {
        onProgress?.({ type: "ddp_progress", taskId: task.id, ...event });
      });

      if (ddpResult.html.length > 100) {
        const pageId = await saveGeneratedPage(
          task,
          ddpResult.html,
          ddpResult.css,
        );

        console.log(`[Resilient Gen] ✓ DDP succeeded for "${task.title}"`, {
          sectionCount: ddpResult.spec.sections.length,
          valid: ddpResult.validation.isValid,
          autoFixed: ddpResult.validation.autoFixedIssues.length,
        });

        return {
          taskId: task.id,
          status: "success",
          html: ddpResult.html,
          css: ddpResult.css,
          fullContent: ddpResult.fullDocument,
          pageId,
          attempts: 1,
        };
      }

      console.warn(`[Resilient Gen] DDP output too short for "${task.title}", falling back to legacy`);
    } catch (err) {
      console.error(`[Resilient Gen] DDP failed for "${task.title}", falling back to legacy:`, err);
    }
  }

  // ── レガシーフォールバック: 単発生成 ──
  return generatePageLegacy(task, onProgress);
}

/**
 * レガシー単発生成（DDP失敗時のフォールバック）
 */
async function generatePageLegacy(
  task: GenerationTask,
  onProgress?: (event: { type: string; [key: string]: unknown }) => void,
): Promise<GenerationResult> {
  let lastError: string | undefined;
  let bestContent = "";
  let attempts = 0;

  // Brand Memory を一度だけ取得
  let brandPromptSection = "";
  try {
    const bm = await getActiveBrandMemory();
    if (bm) {
      const bp = buildBrandMemoryPrompt(bm);
      if (bp) brandPromptSection = `\n\n${bp}`;
    }
  } catch { /* non-fatal */ }

  const fullSystemPrompt = task.systemPrompt + brandPromptSection;

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
      const content = await callClaudeWithTimeout(
        fullSystemPrompt,
        task.prompt,
        GENERATION_TIMEOUT_MS,
      );

      if (!content) {
        lastError = "AIからの応答が空です";
        continue;
      }

      // Extract HTML/CSS
      const pageData = extractPageData(content);

      if (pageData && (pageData.html.length > 50 || pageData.css.length > 50)) {
        // ✅ 成功: DB保存
        const pageId = await saveGeneratedPage(
          task,
          pageData.html,
          pageData.css,
        );

        console.log(
          `[Resilient Gen] ✓ "${task.title}" succeeded on attempt ${attempts}`,
        );

        return {
          taskId: task.id,
          status: "success",
          html: pageData.html,
          css: pageData.css,
          fullContent: content,
          pageId,
          attempts,
        };
      }

      // HTMLマーカーなしだが内容がある → 部分的成功として保持
      if (content.length > 200) {
        bestContent = content;
        lastError = "HTML/CSSマーカーの抽出に失敗しましたが、内容は生成されています";
      } else {
        lastError = "生成された内容が不十分です";
      }
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

  // ── 全リトライ失敗 ──

  // 部分的な内容があれば、フォールバックとして「マーカーなし」でも保存を試みる
  if (bestContent.length > 200) {
    console.log(
      `[Resilient Gen] △ "${task.title}" — partial content saved (${bestContent.length} chars)`,
    );

    // マーカーなしのHTMLをそのまま保存（ベストエフォート）
    const fallbackHtml = extractFallbackHtml(bestContent);
    if (fallbackHtml) {
      const pageId = await saveGeneratedPage(
        task,
        fallbackHtml.html,
        fallbackHtml.css,
      );

      return {
        taskId: task.id,
        status: "partial",
        html: fallbackHtml.html,
        css: fallbackHtml.css,
        fullContent: bestContent,
        pageId,
        attempts,
        error: lastError,
      };
    }
  }

  return {
    taskId: task.id,
    status: "failed",
    html: "",
    css: "",
    fullContent: bestContent,
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
 * Claude APIを呼び出し、タイムアウト付きで全文を取得
 */
async function callClaudeWithTimeout(
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number,
): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Generation timeout after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      clearTimeout(timer);

      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as any).text as string)
        .join("");

      resolve(text);
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}

/**
 * ---PAGE_START---/---PAGE_END--- マーカーからHTML/CSSを抽出
 */
function extractPageData(
  text: string,
): { html: string; css: string } | null {
  const startMarker = "---PAGE_START---";
  const endMarker = "---PAGE_END---";

  const startIdx = text.indexOf(startMarker);
  const endIdx = text.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;

  const content = text.slice(startIdx + startMarker.length, endIdx).trim();

  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  let css = "";
  let html = content;

  if (styleMatch) {
    css = styleMatch
      .map((s) => s.replace(/<\/?style[^>]*>/gi, ""))
      .join("\n");
    html = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").trim();
  }

  return { html, css };
}

/**
 * マーカーなしのフォールバック抽出
 * コードブロック（```html...```）やHTMLタグから直接抽出を試みる
 */
function extractFallbackHtml(
  text: string,
): { html: string; css: string } | null {
  // Try markdown code block
  const codeBlockMatch = text.match(
    /```(?:html)?\s*([\s\S]*?)```/,
  );
  if (codeBlockMatch) {
    const content = codeBlockMatch[1].trim();
    if (content.length > 100 && (content.includes("<") || content.includes("{"))) {
      const result = extractPageData(`---PAGE_START---\n${content}\n---PAGE_END---`);
      if (result) return result;
      // No style tag — return as pure HTML
      return { html: content, css: "" };
    }
  }

  // Try raw HTML detection (starts with a tag)
  const htmlMatch = text.match(
    /(<(?:header|section|div|main|nav)[^>]*>[\s\S]{200,})/,
  );
  if (htmlMatch) {
    const content = htmlMatch[1];
    const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    let css = "";
    let html = content;
    if (styleMatch) {
      css = styleMatch
        .map((s) => s.replace(/<\/?style[^>]*>/gi, ""))
        .join("\n");
      html = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").trim();
    }
    return { html, css };
  }

  return null;
}

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
