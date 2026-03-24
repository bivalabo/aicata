// ============================================================
// DDP Next — Pipeline Orchestrator
// Phase 1→2→3→4 を統括し、SSE進行イベントを通知
//
// AI使用箇所: Phase 4 のみ（コピーライティング）
// それ以外は完全に決定的処理
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import type {
  DDPNextInput,
  DDPNextResult,
  DDPNextProgressEvent,
  IntentAnalysis,
  CompositionPlan,
  AssembledPage,
  PersonalizedPage,
} from "./types";
import { analyzeIntent } from "./intent-analyzer";
import { composePagePlan, assembleComposedPage } from "./composer";
import {
  personalizeContent,
  personalizeContentFallback,
  cleanupRemainingPlaceholders,
} from "./personalizer";

// ============================================================
// Progress Callback
// ============================================================

export type ProgressCallback = (event: DDPNextProgressEvent) => void;

// ============================================================
// Public API
// ============================================================

/**
 * DDP Next パイプライン全体を実行
 *
 * @param input ユーザー入力
 * @param onProgress SSEイベントコールバック（省略可）
 * @param anthropicClient Anthropicクライアント（Phase 4用）
 * @returns 最終結果
 */
export async function runDDPNextPipeline(
  input: DDPNextInput,
  onProgress?: ProgressCallback,
  anthropicClient?: Anthropic,
): Promise<DDPNextResult> {
  const timing = {
    intentAnalysis: 0,
    composition: 0,
    assembly: 0,
    personalization: 0,
    total: 0,
  };
  const tokenUsage = {
    intentAnalysis: 0,
    personalization: 0,
    total: 0,
  };

  const totalStart = performance.now();

  // ── Phase 1: Intent Analysis（決定的、<1ms）──
  onProgress?.({
    phase: "intent",
    message: "デザインの意図を解析しています...",
    progress: 10,
  });

  const t1 = performance.now();
  let intent: IntentAnalysis;
  try {
    intent = analyzeIntent(input);
    timing.intentAnalysis = performance.now() - t1;

    console.log("[DDP Next] Phase 1 complete:", {
      confidence: intent.confidence,
      industry: intent.contentRequirements.industry,
      tones: intent.contentRequirements.tones,
      ms: Math.round(timing.intentAnalysis),
    });
  } catch (err) {
    onProgress?.({
      phase: "error",
      message: `意図解析に失敗しました: ${err instanceof Error ? err.message : String(err)}`,
      progress: 10,
    });
    throw err;
  }

  // ── Phase 2: Template & Section Selection（決定的、<10ms）──
  onProgress?.({
    phase: "compose",
    message: "最適なテンプレートを選定しています...",
    progress: 30,
  });

  const t2 = performance.now();
  let plan: CompositionPlan;
  try {
    plan = composePagePlan(intent);
    timing.composition = performance.now() - t2;

    console.log("[DDP Next] Phase 2 complete:", {
      templateId: plan.template.id,
      templateScore: plan.templateScore,
      sectionCount: plan.sections.length,
      reasons: plan.reasons,
      ms: Math.round(timing.composition),
    });

    onProgress?.({
      phase: "compose",
      message: `テンプレート「${plan.template.id}」を選定（スコア: ${(plan.templateScore * 100).toFixed(0)}%）`,
      progress: 40,
      data: {
        templateId: plan.template.id,
        score: plan.templateScore,
        reasons: plan.reasons,
        targetDNA: intent.targetDNA,
        confidence: intent.confidence,
      },
    });
  } catch (err) {
    onProgress?.({
      phase: "error",
      message: `テンプレート選定に失敗しました: ${err instanceof Error ? err.message : String(err)}`,
      progress: 30,
    });
    throw err;
  }

  // ── Phase 3: Page Assembly（決定的、<5ms）──
  onProgress?.({
    phase: "assemble",
    message: "ページを組み立てています...",
    progress: 60,
  });

  const t3 = performance.now();
  let assembled: AssembledPage;
  try {
    assembled = assembleComposedPage(plan);
    timing.assembly = performance.now() - t3;

    console.log("[DDP Next] Phase 3 complete:", {
      htmlLength: assembled.html.length,
      cssLength: assembled.css.length,
      placeholderCount: assembled.placeholders.length,
      ms: Math.round(timing.assembly),
    });
  } catch (err) {
    onProgress?.({
      phase: "error",
      message: `ページ組立に失敗しました: ${err instanceof Error ? err.message : String(err)}`,
      progress: 60,
    });
    throw err;
  }

  // ── Phase 4: Content Personalization（AI使用、~5-10秒）──
  onProgress?.({
    phase: "personalize",
    message: "コンテンツをブランドに合わせてカスタマイズしています...",
    progress: 75,
  });

  const t4 = performance.now();
  let personalized: PersonalizedPage;
  try {
    if (anthropicClient && assembled.placeholders.length > 0) {
      personalized = await personalizeContent(
        assembled,
        intent.contentRequirements,
        anthropicClient,
      );
      // トークン推定（入力文字数/3 + 出力文字数/3）
      const inputChars = JSON.stringify(intent.contentRequirements).length;
      const outputChars = Object.values(personalized.generatedContent)
        .join("")
        .length;
      tokenUsage.personalization = Math.ceil(
        (inputChars + outputChars) / 3,
      );
    } else {
      // AI不使用フォールバック
      personalized = personalizeContentFallback(
        assembled,
        intent.contentRequirements,
      );
    }
    timing.personalization = performance.now() - t4;

    console.log("[DDP Next] Phase 4 complete:", {
      replacedCount: personalized.replacedCount,
      ms: Math.round(timing.personalization),
    });
  } catch (err) {
    console.warn("[DDP Next] Phase 4 failed, using fallback:", err);
    // フォールバック: ブランド名のみ置換
    personalized = personalizeContentFallback(
      assembled,
      intent.contentRequirements,
    );
    timing.personalization = performance.now() - t4;
  }

  // ── 残留プレースホルダーのクリーンアップ ──
  personalized.fullDocument = cleanupRemainingPlaceholders(personalized.fullDocument);

  // ── 完了 ──
  timing.total = performance.now() - totalStart;
  tokenUsage.total = tokenUsage.intentAnalysis + tokenUsage.personalization;

  const result: DDPNextResult = {
    fullDocument: personalized.fullDocument,
    html: assembled.html,
    css: assembled.css,
    templateId: plan.template.id,
    timing,
    tokenUsage,
  };

  onProgress?.({
    phase: "done",
    message: `ページが完成しました（${Math.round(timing.total)}ms）`,
    progress: 100,
    data: {
      templateId: plan.template.id,
      sectionCount: plan.sections.length,
      replacedPlaceholders: personalized.replacedCount,
      timing,
    },
  });

  console.log("[DDP Next] Pipeline complete:", {
    templateId: plan.template.id,
    totalMs: Math.round(timing.total),
    phases: {
      intent: Math.round(timing.intentAnalysis),
      compose: Math.round(timing.composition),
      assemble: Math.round(timing.assembly),
      personalize: Math.round(timing.personalization),
    },
    tokenUsage,
  });

  return result;
}

/**
 * DDP Next パイプラインを軽量実行（Phase 4スキップ）
 * プレビュー用 — テンプレートHTML + フォールバックコピーのみ
 */
export function runDDPNextPreview(input: DDPNextInput): {
  intent: IntentAnalysis;
  plan: CompositionPlan;
  assembled: AssembledPage;
  preview: PersonalizedPage;
} {
  const intent = analyzeIntent(input);
  const plan = composePagePlan(intent);
  const assembled = assembleComposedPage(plan);
  const preview = personalizeContentFallback(
    assembled,
    intent.contentRequirements,
  );

  return { intent, plan, assembled, preview };
}
