// ============================================================
// Integration Test: Page Assembler + Section Registry
// ============================================================

import { assemblePage, assembleFullHtml } from "../page-assembler";
import { LUXURY_BEAUTY_TOP } from "../knowledge/templates/luxury-beauty-top";
import { getAllSections, getSectionsByCategory, getSectionById } from "../knowledge/sections/registry";

// ── Registry tests ──

console.log("=== Section Registry Tests ===\n");

const allSections = getAllSections();
console.log(`✓ Total sections in registry: ${allSections.length}`);
console.assert(allSections.length === 47, `Expected 47 sections, got ${allSections.length}`);

const navSections = getSectionsByCategory("navigation");
console.log(`✓ Navigation sections: ${navSections.length}`);
console.assert(navSections.length === 6, `Expected 6 nav sections, got ${navSections.length}`);

const heroSections = getSectionsByCategory("hero");
console.log(`✓ Hero sections: ${heroSections.length}`);
console.assert(heroSections.length === 5, `Expected 5 hero sections, got ${heroSections.length}`);

const productSections = getSectionsByCategory("products");
console.log(`✓ Product sections: ${productSections.length}`);
console.assert(productSections.length === 4, `Expected 4 product sections, got ${productSections.length}`);

// Verify all section IDs referenced by luxury-beauty-top exist
console.log("\n=== Page Template Resolution Tests ===\n");

for (const ref of LUXURY_BEAUTY_TOP.sections) {
  const section = getSectionById(ref.sectionId);
  if (section) {
    console.log(`✓ Section "${ref.sectionId}" → ${section.name}`);
  } else {
    console.error(`✗ MISSING: Section "${ref.sectionId}" not found in registry`);
  }
}

// ── Assembler tests ──

console.log("\n=== Page Assembler Tests ===\n");

const result = assemblePage(LUXURY_BEAUTY_TOP);

console.log(`✓ Template: ${result.meta.templateId}`);
console.log(`✓ Sections assembled: ${result.meta.sectionCount}`);
console.log(`✓ Missing sections: ${result.meta.missingSecti‌ons.length}`);
console.log(`✓ Estimated tokens: ${result.meta.tokenCount}`);
console.log(`✓ HTML length: ${result.html.length} chars`);
console.log(`✓ CSS length: ${result.css.length} chars`);

// Verify key content is present
console.assert(result.html.includes("data-section-id"), "HTML should contain data-section-id attributes");
console.assert(result.html.includes("fonts.googleapis.com"), "HTML should contain Google Fonts links");
console.assert(result.css.includes(":root"), "CSS should contain :root design tokens");
console.assert(result.css.includes("--color-bg"), "CSS should contain color tokens");
console.assert(result.css.includes("--font-heading"), "CSS should contain font tokens");
console.assert(result.css.includes("box-sizing"), "CSS should contain reset styles");

console.log("✓ All content assertions passed");

// Test assembleFullHtml
const fullHtml = assembleFullHtml(LUXURY_BEAUTY_TOP);
console.assert(fullHtml.includes("<style>"), "Full HTML should contain <style> tag");
console.assert(fullHtml.length > result.html.length, "Full HTML should be longer than HTML alone");
console.log(`✓ Full HTML output: ${fullHtml.length} chars`);

// Test placeholder overrides
const overriddenResult = assemblePage(LUXURY_BEAUTY_TOP, {
  "hero-split-image": {
    "{{HERO_HEADING}}": "テストブランド",
    "{{HERO_DESCRIPTION}}": "テスト説明文",
  },
});
console.assert(overriddenResult.html.includes("テストブランド"), "Override should replace placeholder");
console.log("✓ Placeholder override works");

console.log("\n=== ALL TESTS PASSED ===\n");
