"use client";

import { useState, useCallback, useRef } from "react";

// ── Types ──

export type BuildStep =
  | "idle"
  | "planning"      // Stage 1: DesignSpec生成中
  | "building"      // Stage 2: セクション個別生成中
  | "assembling"    // Stage 3: ページ組み立て中
  | "reviewing"     // Stage 4: 品質レビュー中
  | "complete"      // 完了
  | "failed";       // 失敗

export interface BuildSectionStatus {
  id: string;          // DB ID
  sectionId: string;   // "hero", "features" など
  sortOrder: number;
  status: "pending" | "generating" | "complete" | "failed";
  html?: string;
  css?: string;
  error?: string;
}

export interface BuildResult {
  buildId: string;
  fullDocument: string;
  html: string;
  css: string;
  designSpec: any;
  review?: {
    overallScore: number;
    scores: Record<string, number>;
    suggestions: any[];
  };
  stats: {
    totalSections: number;
    completedSections: number;
    failedSections: number;
    totalTimeMs: number;
  };
}

export interface BuildProgress {
  step: BuildStep;
  sections: BuildSectionStatus[];
  currentSectionIndex: number;
  totalSections: number;
  /** プレビュー用の部分HTML（完成セクションのみ） */
  partialHtml: string;
  error?: string;
}

interface UseBuildControllerOptions {
  /** セクション完成時のコールバック（プレビュー更新用） */
  onSectionComplete?: (sectionId: string, html: string, css: string) => void;
  /** ステップ変更時のコールバック */
  onStepChange?: (step: BuildStep) => void;
  /** 完了時のコールバック */
  onComplete?: (result: BuildResult) => void;
  /** レビューを実行するか（デフォルト: true） */
  enableReview?: boolean;
}

/**
 * useBuildController — DDP v2 インクリメンタルビルドコントローラー
 *
 * 使い方:
 * ```tsx
 * const { startBuild, progress, result, abort } = useBuildController({
 *   onSectionComplete: (id, html, css) => addToPreview(html, css),
 *   onComplete: (result) => setFullPage(result.fullDocument),
 * });
 *
 * // ビルド開始
 * await startBuild({ url: "https://inspice.jp/", pageType: "landing" });
 * ```
 */
export function useBuildController(options: UseBuildControllerOptions = {}) {
  const { onSectionComplete, onStepChange, onComplete, enableReview = true } = options;

  const [progress, setProgress] = useState<BuildProgress>({
    step: "idle",
    sections: [],
    currentSectionIndex: -1,
    totalSections: 0,
    partialHtml: "",
  });

  const [result, setResult] = useState<BuildResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  const updateStep = useCallback((step: BuildStep) => {
    setProgress((prev) => ({ ...prev, step }));
    onStepChange?.(step);
  }, [onStepChange]);

  /**
   * ビルドを開始
   */
  const startBuild = useCallback(async (params: {
    url?: string;
    pageType?: string;
    userInstructions?: string;
    urlAnalysis?: any;
    conversationId?: string;
  }) => {
    const abortController = new AbortController();
    abortRef.current = abortController;
    startTimeRef.current = Date.now();

    setResult(null);
    setProgress({
      step: "planning",
      sections: [],
      currentSectionIndex: -1,
      totalSections: 0,
      partialHtml: "",
    });
    updateStep("planning");

    try {
      // ── Step 1: Plan (Design Director) ──
      console.log("[BuildController] Step 1: Planning...");

      const planRes = await fetch("/api/build/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: params.url,
          pageType: params.pageType || "landing",
          userInstructions: params.userInstructions,
          urlAnalysis: params.urlAnalysis,
          conversationId: params.conversationId,
        }),
        signal: abortController.signal,
      });

      if (!planRes.ok) {
        const err = await planRes.json();
        throw new Error(err.error || "プラン作成に失敗しました");
      }

      const planData = await planRes.json();
      const { buildId, designSpec, sections } = planData;

      console.log("[BuildController] Plan complete:", {
        buildId,
        sectionsCount: sections.length,
      });

      // セクション一覧を初期化
      const sectionStatuses: BuildSectionStatus[] = sections.map((s: any) => ({
        id: s.id,
        sectionId: s.sectionId,
        sortOrder: s.sortOrder,
        status: "pending" as const,
      }));

      setProgress((prev) => ({
        ...prev,
        step: "building",
        sections: sectionStatuses,
        totalSections: sections.length,
      }));
      updateStep("building");

      // ── Step 2: Generate each section sequentially ──
      let partialHtml = "";

      for (let i = 0; i < sectionStatuses.length; i++) {
        if (abortController.signal.aborted) break;

        const section = sectionStatuses[i];

        // ステータスを「generating」に更新
        setProgress((prev) => ({
          ...prev,
          currentSectionIndex: i,
          sections: prev.sections.map((s, idx) =>
            idx === i ? { ...s, status: "generating" } : s,
          ),
        }));

        console.log(`[BuildController] Generating section ${i + 1}/${sectionStatuses.length}: ${section.sectionId}`);

        try {
          const sectionRes = await fetch("/api/build/section", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              buildId,
              sectionId: section.sectionId,
            }),
            signal: abortController.signal,
          });

          const sectionData = await sectionRes.json();

          if (sectionData.status === "complete") {
            // 成功
            sectionStatuses[i] = {
              ...sectionStatuses[i],
              status: "complete",
              html: sectionData.html,
              css: sectionData.css,
            };

            // プレビュー用HTMLに追加
            if (sectionData.css) {
              partialHtml += `<style>${sectionData.css}</style>\n`;
            }
            partialHtml += sectionData.html + "\n\n";

            onSectionComplete?.(section.sectionId, sectionData.html, sectionData.css || "");
          } else {
            // 失敗（フォールバックHTMLが返される）
            sectionStatuses[i] = {
              ...sectionStatuses[i],
              status: "failed",
              html: sectionData.html,
              error: sectionData.error,
            };
          }

          setProgress((prev) => ({
            ...prev,
            sections: [...sectionStatuses],
            partialHtml,
          }));
        } catch (err) {
          if ((err as Error).name === "AbortError") break;

          sectionStatuses[i] = {
            ...sectionStatuses[i],
            status: "failed",
            error: err instanceof Error ? err.message : "不明なエラー",
          };

          setProgress((prev) => ({
            ...prev,
            sections: [...sectionStatuses],
          }));
          // 失敗してもスキップして次のセクションへ
          console.warn(`[BuildController] Section ${section.sectionId} failed:`, err);
        }
      }

      if (abortController.signal.aborted) {
        updateStep("failed");
        setProgress((prev) => ({ ...prev, error: "ビルドが中断されました" }));
        return;
      }

      // ── Step 3: Assemble ──
      console.log("[BuildController] Step 3: Assembling...");
      updateStep("assembling");

      const assembleRes = await fetch("/api/build/assemble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildId }),
        signal: abortController.signal,
      });

      if (!assembleRes.ok) {
        const err = await assembleRes.json();
        throw new Error(err.error || "ページ組み立てに失敗しました");
      }

      const assembleData = await assembleRes.json();

      console.log("[BuildController] Assembly complete:", {
        htmlLength: assembleData.html?.length,
        valid: assembleData.validation?.isValid,
      });

      // ── Step 4: Review (optional) ──
      let reviewData: any = null;
      if (enableReview) {
        try {
          console.log("[BuildController] Step 4: Reviewing...");
          updateStep("reviewing");

          const reviewRes = await fetch("/api/build/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buildId }),
            signal: abortController.signal,
          });

          if (reviewRes.ok) {
            reviewData = await reviewRes.json();
            console.log("[BuildController] Review complete:", {
              score: reviewData.review?.overallScore,
            });
          }
        } catch (err) {
          // レビュー失敗は致命的ではない
          console.warn("[BuildController] Review failed (non-fatal):", err);
        }
      }

      // ── Complete ──
      const finalFullDocument = reviewData?.fullDocument || assembleData.fullDocument;
      const completedCount = sectionStatuses.filter((s) => s.status === "complete").length;
      const failedCount = sectionStatuses.filter((s) => s.status === "failed").length;

      const buildResult: BuildResult = {
        buildId,
        fullDocument: finalFullDocument,
        html: assembleData.html,
        css: assembleData.css,
        designSpec,
        review: reviewData?.review,
        stats: {
          totalSections: sectionStatuses.length,
          completedSections: completedCount,
          failedSections: failedCount,
          totalTimeMs: Date.now() - startTimeRef.current,
        },
      };

      setResult(buildResult);
      updateStep("complete");
      setProgress((prev) => ({ ...prev, step: "complete" }));

      onComplete?.(buildResult);

      console.log("[BuildController] Build complete!", {
        totalTime: `${((Date.now() - startTimeRef.current) / 1000).toFixed(1)}s`,
        sections: `${completedCount}/${sectionStatuses.length}`,
      });

      return buildResult;
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        updateStep("failed");
        setProgress((prev) => ({ ...prev, error: "ビルドが中断されました" }));
        return;
      }

      console.error("[BuildController] Build failed:", err);
      updateStep("failed");
      setProgress((prev) => ({
        ...prev,
        step: "failed",
        error: err instanceof Error ? err.message : "ビルドに失敗しました",
      }));
      throw err;
    }
  }, [updateStep, onSectionComplete, onComplete, enableReview]);

  /**
   * 失敗セクションのみリトライ
   */
  const retryFailedSections = useCallback(async (buildId: string) => {
    const failedSections = progress.sections.filter((s) => s.status === "failed");
    if (failedSections.length === 0) return;

    updateStep("building");

    for (const section of failedSections) {
      try {
        const res = await fetch("/api/build/section", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buildId,
            sectionId: section.sectionId,
          }),
        });

        const data = await res.json();

        setProgress((prev) => ({
          ...prev,
          sections: prev.sections.map((s) =>
            s.sectionId === section.sectionId
              ? { ...s, status: data.status, html: data.html, css: data.css, error: data.error }
              : s,
          ),
        }));

        if (data.status === "complete") {
          onSectionComplete?.(section.sectionId, data.html, data.css || "");
        }
      } catch (err) {
        console.error(`[BuildController] Retry failed for ${section.sectionId}:`, err);
      }
    }

    // 再度組み立て
    updateStep("assembling");
    const assembleRes = await fetch("/api/build/assemble", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buildId }),
    });

    if (assembleRes.ok) {
      const data = await assembleRes.json();
      setResult((prev) =>
        prev ? { ...prev, fullDocument: data.fullDocument, html: data.html, css: data.css } : null,
      );
      updateStep("complete");
    }
  }, [progress.sections, updateStep, onSectionComplete]);

  /**
   * ビルドを中断
   */
  const abort = useCallback(() => {
    abortRef.current?.abort();
    updateStep("failed");
    setProgress((prev) => ({ ...prev, error: "ビルドを停止しました" }));
  }, [updateStep]);

  return {
    startBuild,
    retryFailedSections,
    abort,
    progress,
    result,
    isBuilding: ["planning", "building", "assembling", "reviewing"].includes(progress.step),
  };
}
