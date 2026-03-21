// ============================================================
// Aicata ACE & ADIS — Public API
// ============================================================

// --- Types ---
export type {
  DesignAtom,
  AtomCategory,
  AtomVariant,
  AccessibilitySpec,
  BlockPattern,
  BlockCategory,
  BlockSlot,
  LayoutSpec,
  ResponsiveOverride,
  SectionBlueprintExtension,
  BlueprintBlock,
  CustomizationRule,
  CompositionRules,
  CompositionRequest,
  Modification,
  ModificationType,
  DesignPatternData,
  PatternCategory,
  PatternExample,
  SiteEvaluationData,
  ElementRating,
  DesignDNA,
  DesignDNAPreferences,
  TrendReportData,
  ColorTrend,
  TypographyTrend,
  TemplateSuggestion,
  CreateSiteEvaluationRequest,
  UpdateDesignDNAResponse,
  ACEStatsResponse,
  DesignPatternListResponse,
} from "./types";

export {
  DNA_DIMENSION_LABELS,
  DNA_DIMENSION_COLORS,
  createDefaultDesignDNA,
} from "./types";

// --- Design DNA Engine ---
export {
  updateDesignDNA,
  recalculateDesignDNA,
  estimateSiteFeatures,
  calculateDNASimilarity,
  scoreTemplateAlignment,
} from "./design-dna-engine";

// --- ACE Stats ---
export {
  getACEStats,
  isSectionDecomposed,
  getDecomposedSectionIds,
} from "./ace-stats";

// --- Atom Registry (Layer 1) ---
export {
  getAllAtoms,
  getAtomById,
  getAtomsByCategory,
  getAtomCount,
  getAtomCountByCategory,
  searchAtoms,
  getAtomsByToken,
} from "./atoms/registry";

// --- Block Registry (Layer 2) ---
export {
  getAllBlocks,
  getBlockById,
  getBlocksByCategory,
  getBlockCount,
  searchBlocks,
} from "./blocks/registry";

// --- Curator Vision (AI Site Analysis) ---
export { analyzeWithVision } from "./curator-vision";
export type {
  VisionAnalysisRequest,
  VisionAnalysisResult,
  ExtractedColor,
  ExtractedFont,
} from "./curator-vision";

// --- Trend Tracker ---
export {
  collectFromEvaluations,
  analyzeWithAI as analyzeTrends,
  generateReport as generateTrendReport,
} from "./trend-tracker";
export type {
  TrendCollectionResult,
  TrendAnalysisResult,
} from "./trend-tracker";
