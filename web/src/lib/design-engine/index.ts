// ============================================================
// Aicata Design Engine — Entry Point (Gen-3)
// ============================================================

// --- Context Analysis ---
export { analyzeDesignContext } from "./context-analyzer";

// --- Prompt Composition ---
export { composeDesignPrompt, composeDesignPromptWithCache, composeGen3Prompt, composeGen3PromptWithCache } from "./prompt-composer";

// --- Gen-3: Template Selection ---
export { selectBestTemplate, selectBestTemplates, getAllTemplates } from "./template-selector";

// --- Gen-3: Page Assembly ---
export { assemblePage, assembleFullHtml } from "./page-assembler";

// --- Gen-3: Liquid Conversion (Shopify Deploy) ---
export {
  convertToLiquid,
  getShopifyTemplateType,
  generateTemplateSuffix,
} from "./liquid-converter";
export type { LiquidConversionResult } from "./liquid-converter";

// --- Gen-3: Section Registry ---
export {
  getAllSections,
  getSectionById,
  getSectionsByCategory,
  searchSections,
  getCategorySummary,
  getRequiredCategoriesForPageType,
} from "./knowledge/sections/registry";

// --- Gen-3: Page Templates — Landing ---
export { LUXURY_BEAUTY_TOP } from "./knowledge/templates/luxury-beauty-top";
export { NATURAL_ORGANIC_TOP } from "./knowledge/templates/natural-organic-top";
export { MINIMAL_FASHION_TOP } from "./knowledge/templates/minimal-fashion-top";
export { BOLD_TECH_TOP } from "./knowledge/templates/bold-tech-top";
// --- Gen-3: Page Templates — Product ---
export { LUXURY_BEAUTY_PRODUCT } from "./knowledge/templates/luxury-beauty-product";
export { MINIMAL_FASHION_PRODUCT } from "./knowledge/templates/minimal-fashion-product";
export { BOLD_TECH_PRODUCT } from "./knowledge/templates/bold-tech-product";
// --- Gen-3: Page Templates — Collection ---
export { LUXURY_BEAUTY_COLLECTION } from "./knowledge/templates/luxury-beauty-collection";
export { MINIMAL_FASHION_COLLECTION } from "./knowledge/templates/minimal-fashion-collection";
// --- Gen-3: Page Templates — Cart ---
export { STANDARD_CART } from "./knowledge/templates/standard-cart";
// --- Gen-3: Page Templates — About / Blog / Article / Contact / 404 / Search ---
export { GENERAL_ABOUT } from "./knowledge/templates/general-about";
export { GENERAL_BLOG } from "./knowledge/templates/general-blog";
export { GENERAL_ARTICLE } from "./knowledge/templates/general-article";
export { GENERAL_CONTACT } from "./knowledge/templates/general-contact";
export { GENERAL_404 } from "./knowledge/templates/general-404";
export { GENERAL_SEARCH } from "./knowledge/templates/general-search";
// --- Gen-3: Page Templates — List-Collections / Account / Password / General ---
export { GENERAL_LIST_COLLECTIONS } from "./knowledge/templates/general-list-collections";
export { GENERAL_ACCOUNT } from "./knowledge/templates/general-account";
export { GENERAL_PASSWORD } from "./knowledge/templates/general-password";
export { GENERAL_PAGE } from "./knowledge/templates/general-page";

// --- Types ---
export type {
  DesignContext,
  IndustryType,
  PageType,
  DesignTone,
  CssFeatureId,
  AudienceType,
  DesignScore,
  // Gen-3 types
  SectionCategory,
  SectionVariant,
  SectionTemplate,
  PageTemplate,
  DesignTokenSet,
  FontDef,
  PlaceholderDef,
  AnimationDef,
  SectionRef,
  TemplateMatch,
  ConversionMeta,
  UrlAnalysisResult,
  ExtractedSection,
  ExtractedImage,
  ExtractedText,
} from "./types";
