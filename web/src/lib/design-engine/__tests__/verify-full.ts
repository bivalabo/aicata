import { getAllSections, getCategorySummary, getRequiredCategoriesForPageType } from "../knowledge/sections/registry";
import { selectBestTemplates } from "../template-selector";
import { assembleFullHtml } from "../page-assembler";
import type { DesignContext } from "../types";

// Import ALL page templates
import { LUXURY_BEAUTY_TOP } from "../knowledge/templates/luxury-beauty-top";
import { NATURAL_ORGANIC_TOP } from "../knowledge/templates/natural-organic-top";
import { MINIMAL_FASHION_TOP } from "../knowledge/templates/minimal-fashion-top";
import { BOLD_TECH_TOP } from "../knowledge/templates/bold-tech-top";
import { LUXURY_BEAUTY_PRODUCT } from "../knowledge/templates/luxury-beauty-product";
import { MINIMAL_FASHION_PRODUCT } from "../knowledge/templates/minimal-fashion-product";
import { BOLD_TECH_PRODUCT } from "../knowledge/templates/bold-tech-product";
import { LUXURY_BEAUTY_COLLECTION } from "../knowledge/templates/luxury-beauty-collection";
import { MINIMAL_FASHION_COLLECTION } from "../knowledge/templates/minimal-fashion-collection";
import { STANDARD_CART } from "../knowledge/templates/standard-cart";

console.log("╔══════════════════════════════════════════════════╗");
console.log("║  Aicata Design Engine — Full Verification       ║");
console.log("╚══════════════════════════════════════════════════╝\n");

// Section Registry
const sections = getAllSections();
console.log(`✅ Total sections: ${sections.length}`);
const summary = getCategorySummary();
for (const s of summary) {
  console.log(`   ${s.category}: ${s.count}`);
}

// Page Templates
const templates = [
  LUXURY_BEAUTY_TOP, NATURAL_ORGANIC_TOP, MINIMAL_FASHION_TOP, BOLD_TECH_TOP,
  LUXURY_BEAUTY_PRODUCT, MINIMAL_FASHION_PRODUCT, BOLD_TECH_PRODUCT,
  LUXURY_BEAUTY_COLLECTION, MINIMAL_FASHION_COLLECTION,
  STANDARD_CART,
];

console.log(`\n✅ Total page templates: ${templates.length}`);
console.log("\n── Assembly Test ──");
let allPassed = true;
for (const t of templates) {
  try {
    const html = assembleFullHtml(t);
    console.log(`  ✅ ${t.id} (${t.pageType}) — ${(html.length / 1024).toFixed(1)} KB, ${t.sections.length} sections`);
  } catch (e: any) {
    console.log(`  ❌ ${t.id}: ${e.message}`);
    allPassed = false;
  }
}

// Template Selection
console.log("\n── Selection Test ──");
const tests: Array<{label: string; ctx: DesignContext}> = [
  { label: "Beauty product page", ctx: { industry: "beauty", pageType: "product", tones: ["luxury", "elegant"], cssFeatures: [], keywords: [], confidence: 0.8 }},
  { label: "Fashion collection", ctx: { industry: "fashion", pageType: "collection", tones: ["minimal", "modern"], cssFeatures: [], keywords: [], confidence: 0.8 }},
  { label: "Tech product page", ctx: { industry: "tech", pageType: "product", tones: ["bold", "cool"], cssFeatures: [], keywords: [], confidence: 0.8 }},
  { label: "General cart", ctx: { industry: "general", pageType: "cart", tones: ["minimal"], cssFeatures: [], keywords: [], confidence: 0.8 }},
];
for (const { label, ctx } of tests) {
  const matches = selectBestTemplates(ctx, undefined, 3);
  console.log(`  ${label}: ${matches[0]?.template.id} (${matches[0]?.score})`);
}

// Required categories
console.log("\n── Required Categories per Page Type ──");
for (const pt of ["landing", "product", "collection", "cart"]) {
  const cats = getRequiredCategoriesForPageType(pt);
  console.log(`  ${pt}: ${cats.join(", ")}`);
}

console.log(allPassed ? "\n🎉 ALL TESTS PASSED" : "\n⚠️ SOME TESTS FAILED");
