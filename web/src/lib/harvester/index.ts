// ============================================================
// Design Harvester — Public API
// ============================================================

export { HARVEST_SOURCES, HARVEST_SOURCES_BY_CATEGORY, CATEGORY_LABELS } from "./sources";
export type { HarvestSourceDef } from "./sources";

export {
  type DesignDNA10D,
  type HumanQualityScore5D,
  type RQSBreakdown,
  type ExtractedBlock,
  type BlockClassification,
  type Placeholder,
  type AnimationDef,
  type HarvestProgress,
  type ThreeAxisScore,
  computeThreeAxisScore,
  computeDNASimilarity,
  normalizeHQS,
} from "./types";

export { extractBlocksFromPage, measureRQS } from "./extractor";
export { classifyBlock, classifyBlocks } from "./classifier";
export { seedHarvestSources, harvestFromSource, getHarvestStats } from "./orchestrator";
