"use client";

import { useState, useCallback, useRef } from "react";

// ── Types ──

export type BuildStep =
  | "idle"
  | "generating"    // DDP Next パイプライン実行中（9フェーズ一括）
  | "complete"      // 完了
  | "failed";       // 失敗

export interface BuildResult {
  pageId?: string;
  fullDocument: string;
  html: string;
  css: string;
  templateId?: string;
  timing?: {
    total: number;
    [key: string]: number;
  };
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
  };
  stats: {
    totalTimeMs: number;
  };
}

export interface BuildProgress {
  step: BuildStep;
  /** DDP Next パイプラインの進捗メッセージ */
  message?: string;
  /** 進捗パーセント (0-100) */
  progressPercent: number;
  error?: string;
}

interface UseBuildControllerOptions {
  /** ステップ変更時のコールバック */
  onStepChange?: (step: BuildStep) => void;
  /** 完了時のコールバック */
  onComplete?: (result: BuildResult) => void;
}

/**
 * useBuildController — DDP Next ビルドコントローラー
 *
 * DDP Next は1回の API コールで完全なページを生成する。
 * 旧 DDP v1 の4ステップ（plan → section × N → assemble → review）を
 * 単一ステップに統合。
 *
 * 使い方:
 * ```tsx
 * const { startBuild, progress, result, abort } = useBuildController({
 *   onComplete: (result) => setFullPage(result.fullDocument),
 * });
 *
 * await startBuild({ url: "https://example.com/", pageType: "landing" });
 * ```
 */
export function useBuildController(options: UseBuildControllerOptions = {}) {
  const { onStepChange, onComplete } = options;

  const [progress, setProgress] = useState<BuildProgress>({
    step: "idle",
    progressPercent: 0,
  });

  const [result, setResult] = useState<BuildResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  const updateStep = useCallback((step: BuildStep) => {
    setProgress((prev) => ({ ...prev, step }));
    onStepChange?.(step);
  }, [onStepChange]);

  /**
   * ビルドを開始（DDP Next パイプライン一括実行）
   */
  const startBuild = useCallback(async (params: {
    url?: string;
    pageType?: string;
    userInstructions?: string;
    urlAnalysis?: any;
    conversationId?: string;
    brandMemory?: any;
  }) => {
    const abortController = new AbortController();
    abortRef.current = abortController;
    startTimeRef.current = Date.now();

    setResult(null);
    setProgress({
      step: "generating",
      message: "DDP Next パイプラインを実行中...",
      progressPercent: 10,
    });
    updateStep("generating");

    try {
      console.log("[BuildController] Starting DDP Next pipeline...");

      setProgress((prev) => ({
        ...prev,
        message: "ページを生成中（テンプレート選定 → 組み立て → パーソナライズ）...",
        progressPercent: 30,
      }));

      const res = await fetch("/api/build/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: params.url,
          pageType: params.pageType || "landing",
          userInstructions: params.userInstructions,
          urlAnalysis: params.urlAnalysis,
          conversationId: params.conversationId,
          brandMemory: params.brandMemory,
        }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "ページ生成に失敗しました");
      }

      const data = await res.json();

      setProgress((prev) => ({
        ...prev,
        message: "完了！",
        progressPercent: 100,
      }));

      const totalTimeMs = Date.now() - startTimeRef.current;

      const buildResult: BuildResult = {
        pageId: data.pageId,
        fullDocument: data.fullDocument,
        html: data.html,
        css: data.css,
        templateId: data.templateId,
        timing: data.timing,
        tokenUsage: data.tokenUsage,
        stats: {
          totalTimeMs,
        },
      };

      setResult(buildResult);
      updateStep("complete");

      onComplete?.(buildResult);

      console.log("[BuildController] DDP Next build complete!", {
        totalTime: `${(totalTimeMs / 1000).toFixed(1)}s`,
        templateId: data.templateId,
        tokenUsage: data.tokenUsage,
      });

      return buildResult;
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        updateStep("failed");
        setProgress((prev) => ({
          ...prev,
          error: "ビルドが中断されました",
          progressPercent: 0,
        }));
        return;
      }

      console.error("[BuildController] Build failed:", err);
      updateStep("failed");
      setProgress({
        step: "failed",
        error: err instanceof Error ? err.message : "ビルドに失敗しました",
        progressPercent: 0,
      });
      throw err;
    }
  }, [updateStep, onComplete]);

  /**
   * ビルドを中断
   */
  const abort = useCallback(() => {
    abortRef.current?.abort();
    updateStep("failed");
    setProgress({
      step: "failed",
      error: "ビルドを停止しました",
      progressPercent: 0,
    });
  }, [updateStep]);

  return {
    startBuild,
    abort,
    progress,
    result,
    isBuilding: progress.step === "generating",
  };
}
