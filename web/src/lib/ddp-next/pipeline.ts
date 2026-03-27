// ============================================================
// DDP Next — Pipeline Orchestrator (完全体)
// Phase 0→1→1.5→2→2.5→3→3.5→4→5→5.5 を統括し、SSE進行イベントを通知
//
// AI使用箇所:
//   Phase 1.5 — AI Template Advisor（confidence < 0.4 時のみ、~20%）
//   Phase 4   — コピーライティング（常時）
//   Phase 5.5 — AI Quality Review（HQS < 3.0 時のみ、~10%）
// それ以外は決定的処理 + ルールベース最適化
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
  setCleanupIndustry,
  setCleanupContext,
} from "./personalizer";
import { fineTunePage } from "./fine-tuner";
import {
  enrichDDPNextInput,
  applyMediaStrategyToAssembledPage,
} from "./ace-adis-bridge";
import {
  needsAITemplateAdvisor,
  getAITemplateAdvice,
} from "./ai-template-advisor";
import {
  needsAIQualityReview,
  reviewAndPatchQuality,
  applyCSSPatches,
} from "./ai-quality-reviewer";
import { computeHQSComposite } from "./types";
import { prisma } from "@/lib/db";

// ── ThemeLayout → Assembly Options ──
interface ThemeLayoutOptions {
  headerSectionId?: string;
  footerSectionId?: string;
  skipHeaderFooter?: boolean;
}

async function fetchThemeLayoutOptions(storeId?: string): Promise<ThemeLayoutOptions> {
  if (!storeId) return {};
  try {
    const themeLayout = await prisma.themeLayout.findFirst({
      where: { storeId },
    });
    if (!themeLayout) return {};
    return {
      headerSectionId: themeLayout.headerSectionId,
      footerSectionId: themeLayout.footerSectionId,
    };
  } catch (err) {
    console.warn("[DDP Next] ThemeLayout fetch failed, using defaults:", err);
    return {};
  }
}

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

  // ── Phase 0: ACE-ADIS 入力拡張（userDNA自動ロード + Vision統合）──
  onProgress?.({
    phase: "intent",
    message: "Design DNA を読み込んでいます...",
    progress: 5,
  });

  const enrichedInput = await enrichDDPNextInput(input);

  // ── Phase 1: Intent Analysis（決定的、<1ms）──
  onProgress?.({
    phase: "intent",
    message: "デザインの意図を解析しています...",
    progress: 10,
  });

  const t1 = performance.now();
  let intent: IntentAnalysis;
  try {
    intent = analyzeIntent(enrichedInput);
    timing.intentAnalysis = performance.now() - t1;

    console.log("[DDP Next] Phase 1 complete:", {
      confidence: intent.confidence,
      industry: intent.contentRequirements.industry,
      tones: intent.contentRequirements.tones,
      hasUserDNA: !!enrichedInput.userDNA,
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

  // ── Phase 1.5: AI Template Advisor（条件的、confidence < 0.4 時のみ）──
  if (anthropicClient && needsAITemplateAdvisor(intent.confidence)) {
    try {
      onProgress?.({
        phase: "compose",
        message: "AIがテンプレート選定を補助しています...",
        progress: 20,
      });

      const advice = await getAITemplateAdvice(
        intent,
        enrichedInput.userInstructions,
        anthropicClient,
      );

      if (advice) {
        // AIの推奨でintentを補強（トーンと業種を上書き）
        if (advice.recommendedTones.length > 0) {
          intent.contentRequirements.tones = advice.recommendedTones as any;
        }
        if (advice.recommendedIndustry) {
          intent.contentRequirements.industry = advice.recommendedIndustry as any;
        }
        // 信頼度を引き上げ（AI補助済み）
        intent.confidence = Math.max(intent.confidence, 0.5);

        console.log("[DDP Next] Phase 1.5 AI Advisor:", {
          recommendedTemplate: advice.recommendedTemplateId,
          tones: advice.recommendedTones,
          reasoning: advice.reasoning.slice(0, 80),
        });
      }
    } catch (err) {
      console.warn("[DDP Next] Phase 1.5 AI Advisor failed (non-fatal):", err);
    }
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
      aiAssisted: needsAITemplateAdvisor(intent.confidence),
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

  // ── Phase 2.5: ThemeLayout取得（DB読み取り、<50ms）──
  const layoutOptions = await fetchThemeLayoutOptions(input.storeId);
  if (layoutOptions.headerSectionId || layoutOptions.footerSectionId) {
    console.log("[DDP Next] ThemeLayout loaded:", {
      header: layoutOptions.headerSectionId,
      footer: layoutOptions.footerSectionId,
    });
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
    assembled = assembleComposedPage(plan, layoutOptions);
    timing.assembly = performance.now() - t3;

    console.log("[DDP Next] Phase 3 complete:", {
      htmlLength: assembled.html.length,
      cssLength: assembled.css.length,
      placeholderCount: assembled.placeholders.length,
      ms: Math.round(timing.assembly),
    });

    // ── Phase 3.5: Media Strategy（ACE-ADIS、決定的）──
    if (enrichedInput.urlAnalysis) {
      const { fullDocument: mediaEnhanced, mediaStrategy } =
        applyMediaStrategyToAssembledPage(
          assembled.fullDocument,
          enrichedInput.urlAnalysis,
          enrichedInput.industry,
        );
      if (mediaStrategy) {
        assembled.fullDocument = mediaEnhanced;
        console.log("[DDP Next] Phase 3.5 Media Strategy:", mediaStrategy.stats);
      }
    }
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
        undefined, // model
        enrichedInput.emotionalDna,
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

  // ── 残留プレースホルダーのクリーンアップ（業種別画像・テキストを使用）──
  setCleanupIndustry(intent.contentRequirements.industry || enrichedInput.industry || "general");
  setCleanupContext(enrichedInput.userInstructions || "");
  personalized.fullDocument = cleanupRemainingPlaceholders(personalized.fullDocument);

  // ── Phase 5: Fine-tuning & Brand Fit（決定的、<5ms）──
  onProgress?.({
    phase: "personalize", // UIでは「パーソナライズ」の続きとして表示
    message: "ブランドに合わせた最終調整をしています...",
    progress: 90,
  });

  const t5 = performance.now();
  const fineTuned = fineTunePage({
    fullDocument: personalized.fullDocument,
    requirements: intent.contentRequirements,
    brandMemory: enrichedInput.brandMemory ? {
      colors: enrichedInput.brandMemory.colors,
      fonts: enrichedInput.brandMemory.fonts,
    } : undefined,
  });
  personalized.fullDocument = fineTuned.fullDocument;

  if (fineTuned.adjustments.length > 0) {
    console.log("[DDP Next] Phase 5 complete:", {
      adjustments: fineTuned.adjustments.length,
      details: fineTuned.adjustments.map((a) => `${a.variable}: ${a.from} → ${a.to}`),
      ms: Math.round(performance.now() - t5),
    });
  }

  // ── Phase 5.5: AI Quality Review（条件的、HQS < 3.0 時のみ）──
  if (anthropicClient && plan.sections.length > 0) {
    // テンプレートのHQSコンポジットを計算
    const avgHQS = plan.sections.reduce((sum, s) => sum + s.hqsComposite, 0) / plan.sections.length;

    if (needsAIQualityReview(avgHQS)) {
      try {
        onProgress?.({
          phase: "personalize",
          message: "AIが品質チェックを実施中...",
          progress: 95,
        });

        const reviewResult = await reviewAndPatchQuality(
          personalized.fullDocument,
          intent.contentRequirements,
          avgHQS,
          anthropicClient,
        );

        if (reviewResult.reviewed && reviewResult.cssPatches) {
          personalized.fullDocument = applyCSSPatches(
            personalized.fullDocument,
            reviewResult.cssPatches,
          );

          console.log("[DDP Next] Phase 5.5 AI Quality Review:", {
            avgHQS: avgHQS.toFixed(2),
            improvements: reviewResult.improvements,
            estimatedAfter: reviewResult.estimatedScoreAfter.toFixed(2),
          });
        }
      } catch (err) {
        console.warn("[DDP Next] Phase 5.5 AI Review failed (non-fatal):", err);
      }
    }
  }

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
export async function runDDPNextPreview(input: DDPNextInput): Promise<{
  intent: IntentAnalysis;
  plan: CompositionPlan;
  assembled: AssembledPage;
  preview: PersonalizedPage;
}> {
  const intent = analyzeIntent(input);
  const plan = composePagePlan(intent);
  const layoutOptions = await fetchThemeLayoutOptions(input.storeId);
  const assembled = assembleComposedPage(plan, layoutOptions);
  const preview = personalizeContentFallback(
    assembled,
    intent.contentRequirements,
  );

  return { intent, plan, assembled, preview };
}

/**
 * 3パターンプレビュー生成
 *
 * 仕様: DNA座標に最も近い3つのテンプレートで、
 * ヒーローセクションのみを高速プレビュー生成（AI不使用）
 *
 * ユーザーが1つを選択 → その後フルパイプラインで完成
 */
export async function generateThreePatternPreview(
  input: DDPNextInput,
): Promise<{
  intent: IntentAnalysis;
  previews: Array<{
    templateId: string;
    templateName: string;
    score: number;
    heroHtml: string;
    fullDocument: string;
    designTokens: Record<string, string>;
  }>;
}> {
  const intent = analyzeIntent(input);

  // Phase 2を3回実行（上位3テンプレートを取得）
  const { composeTopNPlans } = await import("./composer");
  const plans = composeTopNPlans(intent, 3);

  const layoutOptions = await fetchThemeLayoutOptions(input.storeId);

  const previews = plans.map((plan) => {
    // Phase 3: 各テンプレートで組立
    const assembled = assembleComposedPage(plan, layoutOptions);

    // Phase 4 (fallback): ブランド名だけ置換
    const preview = personalizeContentFallback(
      assembled,
      intent.contentRequirements,
    );

    // ヒーローセクションのHTMLを抽出
    const heroHtml = extractHeroSection(preview.fullDocument);

    // デザイントークンを抽出
    const designTokens = extractDesignTokens(assembled.css);

    return {
      templateId: plan.template.id,
      templateName: plan.template.name || plan.template.id,
      score: plan.templateScore,
      heroHtml,
      fullDocument: preview.fullDocument,
      designTokens,
    };
  });

  return { intent, previews };
}

// ── Helper: ヒーローセクション抽出 ──

function extractHeroSection(html: string): string {
  // data-section-type="hero" または最初のセクションを抽出
  const heroRegex = /<(?:section|div)[^>]*data-section-(?:type|id)="[^"]*hero[^"]*"[^>]*>[\s\S]*?<\/(?:section|div)>/i;
  const match = html.match(heroRegex);
  if (match) return match[0];

  // フォールバック: 最初の<section>タグ
  const sectionRegex = /<section[^>]*>[\s\S]*?<\/section>/i;
  const sectionMatch = html.match(sectionRegex);
  return sectionMatch ? sectionMatch[0] : "";
}

// ── Helper: デザイントークン抽出 ──

function extractDesignTokens(css: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  const varRegex = /--(aicata-)?(?:color|font)-[\w-]+\s*:\s*([^;]+)/g;
  let match;
  while ((match = varRegex.exec(css)) !== null) {
    const fullMatch = match[0];
    const [name, value] = fullMatch.split(":").map((s) => s.trim());
    tokens[name] = value;
  }
  return tokens;
}
