// ============================================================
// Aicata ACE (Atomic Composition Engine) & ADIS (AI Design Intelligence System)
// Type Definitions
// ============================================================

import type { SectionCategory, SectionVariant, DesignTone, IndustryType, AnimationDef, PlaceholderDef } from "../design-engine/types";

// ============================================================
// ACE Layer 1: Design Atoms
// ============================================================

export type AtomCategory =
  | "typography"    // headings, body text, labels, captions
  | "media"         // images, videos, icons, SVG
  | "interactive"   // buttons, links, inputs
  | "layout"        // spacers, dividers, containers
  | "decorative";   // badges, overlays, gradients, patterns

export interface AtomVariant {
  id: string;        // "sm", "lg", "dark"
  label: string;
  overrideCss: string;
}

export interface AccessibilitySpec {
  role?: string;
  ariaLabel?: string;
  focusable?: boolean;
  minContrast?: number;
}

export interface DesignAtom {
  id: string;                    // "heading-serif-display"
  category: AtomCategory;
  tag: string;                   // "h1", "img", "button", etc.
  name: string;
  description?: string;
  html: string;
  css: string;
  variants: AtomVariant[];
  tokens: string[];              // CSS variable names used
  a11y: AccessibilitySpec;
}

// ============================================================
// ACE Layer 2: Block Patterns
// ============================================================

export type BlockCategory =
  | "text-group"       // heading + description combos
  | "card"             // image + text + CTA
  | "media-text"       // media alongside text
  | "list-item"        // list elements
  | "form-group"       // form input groups
  | "stat"             // number + label
  | "nav-item"         // navigation elements
  | "social-link"      // social media links
  | "price-tag";       // price displays

export interface LayoutSpec {
  display: "flex" | "grid";
  direction?: "row" | "column";
  gap?: string;
  gridTemplate?: string;
  alignItems?: string;
  justifyContent?: string;
}

export interface ResponsiveOverride {
  breakpoint: string;    // "768px", "1024px"
  changes: Partial<LayoutSpec>;
  hiddenSlots?: string[];
}

export interface BlockSlot {
  name: string;                    // "heading", "description", "cta"
  accepts: AtomCategory[];         // allowed atom categories
  defaultAtom: string;             // default Atom ID
  required: boolean;
  placeholder?: PlaceholderDef;
}

export interface BlockPattern {
  id: string;                      // "hero-text-group"
  category: BlockCategory;
  name: string;
  description?: string;
  layout: LayoutSpec;
  slots: BlockSlot[];
  css: string;
  responsive: ResponsiveOverride[];
  animations: AnimationDef[];
}

// ============================================================
// ACE Layer 3: Section Blueprints (extends existing SectionTemplate)
// ============================================================

export interface PositionSpec {
  gridArea?: string;
  order?: number;
  span?: string;
}

export interface SectionLayoutSpec {
  display: "grid" | "flex";
  gridTemplate?: string;
  gap?: string;
  padding?: string;
  maxWidth?: string;
  responsive?: ResponsiveOverride[];
}

export interface BlueprintBlock {
  slotName: string;               // "main-content", "side-image", "background"
  blockPatternId: string;          // default BlockPattern ID
  alternatives: string[];          // swappable alternative blocks
  position: PositionSpec;
}

export interface CustomizationRule {
  target: string;                  // dot-path: "blocks.main-content.slots.heading"
  swappable: boolean;              // can swap atom
  stylable: boolean;               // can change tokens
  removable: boolean;              // can remove
  constraints?: string[];
}

export interface SectionBlueprintExtension {
  layout: SectionLayoutSpec;
  blocks: BlueprintBlock[];
  customizable: CustomizationRule[];
}

// ============================================================
// ACE Layer 4: Page Composition Rules
// ============================================================

export interface OrderingRule {
  sectionCategory: SectionCategory;
  position: "first" | "last" | "before" | "after";
  relativeTo?: SectionCategory;
}

export interface CompositionRules {
  requiredBlueprints: string[];
  suggestedBlueprints: string[];
  maxSections: number;
  sectionOrdering: OrderingRule[];
  dynamicInsertion: boolean;
}

// ============================================================
// ACE: Composition Request (AI modification protocol)
// ============================================================

export type ModificationType =
  | "swap-atom"
  | "swap-block"
  | "add-slot"
  | "remove-slot"
  | "change-token";

export interface Modification {
  type: ModificationType;
  target: string;                  // dot-notation: "blocks.hero-text.slots.heading"
  value: string;                   // new Atom/Block ID or token value
  reason?: string;                 // AI reasoning
}

export interface CompositionRequest {
  baseBlueprint: string;           // base SectionBlueprint ID
  modifications: Modification[];
}

// ============================================================
// ADIS: Design Patterns (Knowledge Graph)
// ============================================================

export type PatternCategory =
  | "layout"
  | "color"
  | "typography"
  | "animation"
  | "interaction";

export interface PatternExample {
  url: string;
  screenshotPath?: string;
  description?: string;
}

export interface DesignPatternData {
  id: string;
  name: string;
  category: PatternCategory;
  description: string;
  cssSnippet?: string;
  prevalence: number;              // 0-1
  momentum: number;                // -1 to +1
  firstSeen: Date;
  lastSeen: Date;
  curatorScore: number | null;     // 1-5 or null
  curatorNotes?: string;
  atomIds: string[];
  blockIds: string[];
  industries: IndustryType[];
  tones: DesignTone[];
  examples: PatternExample[];
  exampleCount: number;
}

// ============================================================
// ADIS: Site Evaluation (Curator)
// ============================================================

export interface ElementRating {
  element: "hero" | "navigation" | "typography" | "color" | "spacing" | "animation" | "overall";
  score: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}

export interface SiteEvaluationData {
  id?: string;
  url: string;
  screenshotPath?: string;
  overallRating: number;           // 1-5
  typographyScore?: number;
  colorScore?: number;
  layoutScore?: number;
  animationScore?: number;
  spacingScore?: number;
  tags: string[];
  notes?: string;
  analyzedColors?: string[];
  analyzedFonts?: string[];
  analyzedLayout?: Record<string, unknown>;
  detectedPatterns?: string[];
  createdAt?: Date;
}

// ============================================================
// ADIS: Design DNA
// ============================================================

export interface DesignDNAPreferences {
  minimalism: number;          // -1(decorative) to +1(minimal)
  whitespace: number;          // -1(dense) to +1(spacious)
  contrast: number;            // -1(soft) to +1(high contrast)
  animationIntensity: number;  // -1(static) to +1(dynamic)
  serifAffinity: number;       // -1(sans-serif) to +1(serif)
  colorSaturation: number;     // -1(monochrome) to +1(vivid)
  layoutComplexity: number;    // -1(simple) to +1(complex)
  imageWeight: number;         // -1(text-heavy) to +1(image-heavy)
  asymmetry: number;           // -1(symmetric) to +1(asymmetric)
  novelty: number;             // -1(classic) to +1(experimental)
}

export const DNA_DIMENSION_LABELS: Record<keyof DesignDNAPreferences, string> = {
  minimalism: "ミニマリズム",
  whitespace: "余白",
  contrast: "コントラスト",
  animationIntensity: "アニメーション",
  serifAffinity: "セリフ好み",
  colorSaturation: "色彩飽和度",
  layoutComplexity: "レイアウト複雑性",
  imageWeight: "画像重視",
  asymmetry: "非対称",
  novelty: "新規性",
};

export const DNA_DIMENSION_COLORS: Record<keyof DesignDNAPreferences, string> = {
  minimalism: "bg-violet-400",
  whitespace: "bg-blue-400",
  contrast: "bg-cyan-400",
  animationIntensity: "bg-emerald-400",
  serifAffinity: "bg-amber-400",
  colorSaturation: "bg-pink-400",
  layoutComplexity: "bg-orange-400",
  imageWeight: "bg-teal-400",
  asymmetry: "bg-indigo-400",
  novelty: "bg-rose-400",
};

export interface DesignDNA {
  preferences: DesignDNAPreferences;
  favoritePatterns: string[];
  avoidPatterns: string[];
  industryBias: Partial<Record<IndustryType, number>>;
  lastUpdated: Date;
  totalRatings: number;
  confidence: number;            // 0-1, based on totalRatings/50
}

export function createDefaultDesignDNA(): DesignDNA {
  return {
    preferences: {
      minimalism: 0,
      whitespace: 0,
      contrast: 0,
      animationIntensity: 0,
      serifAffinity: 0,
      colorSaturation: 0,
      layoutComplexity: 0,
      imageWeight: 0,
      asymmetry: 0,
      novelty: 0,
    },
    favoritePatterns: [],
    avoidPatterns: [],
    industryBias: {},
    lastUpdated: new Date(),
    totalRatings: 0,
    confidence: 0,
  };
}

// ============================================================
// ADIS: Trend Report
// ============================================================

export interface ColorTrend {
  palette: string[];
  name: string;
  prevalence: number;
}

export interface TypographyTrend {
  fontFamily: string;
  usage: "heading" | "body" | "accent";
  prevalence: number;
}

export interface TrendReportData {
  id?: string;
  period: string;                 // "2026-W12"
  emergingPatterns: DesignPatternData[];
  decliningPatterns: DesignPatternData[];
  colorTrends: ColorTrend[];
  typographyTrends: TypographyTrend[];
  createdAt?: Date;
}

// ============================================================
// ADIS: Template Evolution
// ============================================================

export type SuggestionType =
  | "update-token"
  | "add-variant"
  | "improve-animation"
  | "add-pattern";

export type SuggestionPriority = "high" | "medium" | "low";

export interface TemplateSuggestion {
  templateId: string;
  type: SuggestionType;
  description: string;
  priority: SuggestionPriority;
  implementation: string;
  reasoning: string;
  trendBasis?: string;
  curatorBasis?: string;
}

// ============================================================
// API Request/Response types
// ============================================================

export interface CreateSiteEvaluationRequest {
  url: string;
  overallRating: number;
  typographyScore?: number;
  colorScore?: number;
  layoutScore?: number;
  animationScore?: number;
  spacingScore?: number;
  tags: string[];
  notes?: string;
}

export interface UpdateDesignDNAResponse {
  dna: DesignDNA;
  changes: Record<string, { before: number; after: number }>;
}

export interface ACEStatsResponse {
  atomCount: number;
  blockCount: number;
  sectionCount: number;
  compositionPossibilities: number;
  decompositionProgress: {
    category: string;
    total: number;
    done: number;
  }[];
}

export interface DesignPatternListResponse {
  patterns: DesignPatternData[];
  total: number;
}
