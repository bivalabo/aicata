// ============================================================
// DDP Next — Entry Point
// Design Composition Engine: 人が評価した部品をAIが組み立てる
// ============================================================

// Pipeline
export { runDDPNextPipeline, runDDPNextPreview, generateThreePatternPreview } from "./pipeline";
export type { ProgressCallback } from "./pipeline";

// Phase 1: Intent Analysis
export { analyzeIntent } from "./intent-analyzer";

// Phase 2+3: Composition & Assembly
export { composePagePlan, composeTopNPlans, assembleComposedPage } from "./composer";

// Phase 4: Personalization
export { personalizeContent, personalizeContentFallback, cleanupRemainingPlaceholders } from "./personalizer";

// Phase 5: Fine-tuning
export { fineTunePage } from "./fine-tuner";

// Phase 6: Section Swap
export { getSwapCandidates, swapSection } from "./section-swap";

// Evolution Engine
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
