// ============================================================
// DDP Next — Entry Point (完全体)
// Design Composition Engine: 人が評価した部品をAIがスマートに組み立てる
// 9フェーズ: 0→1→1.5→2→2.5→3→3.5→4→5→5.5
// ============================================================

// Pipeline
export { runDDPNextPipeline, runDDPNextPreview, generateThreePatternPreview } from "./pipeline";
export type { ProgressCallback } from "./pipeline";

// Phase 0: ACE-ADIS Bridge (DNA auto-load + Curator Vision)
export { enrichDDPNextInput, loadLatestUserDNA, saveUserDNA } from "./ace-adis-bridge";

// Phase 1: Intent Analysis
export { analyzeIntent } from "./intent-analyzer";

// Phase 1.5: AI Template Advisor (conditional, confidence < 0.4)
export { needsAITemplateAdvisor, getAITemplateAdvice } from "./ai-template-advisor";

// Phase 2+3: Composition & Assembly
export { composePagePlan, composeTopNPlans, assembleComposedPage } from "./composer";

// Phase 3.5: Media Strategy (rule-based image optimization)
export { applyMediaStrategyToAssembledPage } from "./ace-adis-bridge";

// Phase 4: Personalization
export { personalizeContent, personalizeContentFallback, cleanupRemainingPlaceholders } from "./personalizer";

// Phase 5: Fine-tuning
export { fineTunePage } from "./fine-tuner";

// Phase 5.5: AI Quality Review (conditional, HQS < 3.0)
export { needsAIQualityReview, reviewAndPatchQuality, applyCSSPatches } from "./ai-quality-reviewer";

// Section Swap (post-pipeline)
export { getSwapCandidates, swapSection } from "./section-swap";

// Evolution Engine (HQS + DNA learning)
export { updateHQSFromFeedback, updateUserDNA, setCuratorHQS, findLowQualitySections } from "./evolution";

// Section Metadata (HQS + DNA)
export { getSectionMeta, getAllSectionMeta, getSectionMetaByCategory, updateSectionMeta } from "./section-meta";

// Types
export type {
  DDPNextInput,
  DDPNextResult,
  DDPNextProgressEvent,
  IntentAnalysis,
  ContentRequirements,
  CompositionPlan,
  ResolvedSection,
  AssembledPage,
  PersonalizedPage,
  HumanQualityScore,
  SectionMeta,
  TemplateMeta,
} from "./types";
export { computeHQSComposite } from "./types";
