// ============================================================
// Aicata DDP — Design Decomposition Pipeline v2
// Multi-Agent Design Studio
// ============================================================

// Main pipeline
export { runDDP, runDDPForChat } from "./pipeline";
export type {
  DDPInput,
  DDPConfig,
  DDPProgressEvent,
  AssembledPageResult,
} from "./pipeline";

// Types
export type {
  DesignSpec,
  SectionSpec,
  ContentBrief,
  ColorSpec,
  TypographySpec,
  RenderedSection,
  ValidationResult,
} from "./types";

// Site Crawler
export { crawlSite } from "./site-crawler";
export type {
  SiteStructure,
  CrawledPage,
  SiteTreeNode,
  CrawlProgress,
  PageTypeGuess,
} from "./site-crawler";

// Individual stages (for advanced usage)
export { generateDesignSpec } from "./stage1-design-director";
export { renderAllSections } from "./stage2-section-artisan";
export { assembleAndValidate } from "./stage3-harmony-assembler";
export { reviewPage } from "./stage4-reviewer";
export type { ReviewResult, ReviewSuggestion } from "./stage4-reviewer";
