import { getAllSections, getCategorySummary } from "../knowledge/sections/registry";
import { LUXURY_BEAUTY_TOP } from "../knowledge/templates/luxury-beauty-top";
import { NATURAL_ORGANIC_TOP } from "../knowledge/templates/natural-organic-top";
import { MINIMAL_FASHION_TOP } from "../knowledge/templates/minimal-fashion-top";
import { BOLD_TECH_TOP } from "../knowledge/templates/bold-tech-top";
import { assembleFullHtml } from "../page-assembler";
import { selectBestTemplates } from "../template-selector";
import type { DesignContext } from "../types";

console.log("=== Section Registry ===");
const sections = getAllSections();
console.log("Total sections:", sections.length);
const summary = getCategorySummary();
for (const s of summary) {
  console.log("  " + s.category + ": " + s.count);
}

console.log("\n=== Page Templates ===");
const templates = [LUXURY_BEAUTY_TOP, NATURAL_ORGANIC_TOP, MINIMAL_FASHION_TOP, BOLD_TECH_TOP];
for (const t of templates) {
  console.log("\n[" + t.id + "]");
  console.log("  Name:", t.name);
  console.log("  Industries:", t.industries.join(", "));
  console.log("  Tones:", t.tones.join(", "));
  console.log("  Sections:", t.sections.length);
  try {
    const html = assembleFullHtml(t);
    console.log("  Assembled HTML:", (html.length / 1024).toFixed(1), "KB ✅");
  } catch (e: any) {
    console.log("  Assembly FAILED:", e.message, "❌");
  }
}

console.log("\n=== Template Selection Test ===");
const testContexts: Array<{label: string; ctx: DesignContext}> = [
  { label: "Fashion brand", ctx: { industry: "fashion", pageType: "landing", tones: ["minimal", "modern"], cssFeatures: [], keywords: [], confidence: 0.8 }},
  { label: "Tech startup", ctx: { industry: "tech", pageType: "landing", tones: ["bold", "cool"], cssFeatures: [], keywords: [], confidence: 0.8 }},
  { label: "Organic food", ctx: { industry: "food", pageType: "landing", tones: ["natural", "warm"], cssFeatures: [], keywords: [], confidence: 0.8 }},
  { label: "Beauty luxury", ctx: { industry: "beauty", pageType: "landing", tones: ["luxury", "elegant"], cssFeatures: [], keywords: [], confidence: 0.8 }},
];

for (const { label, ctx } of testContexts) {
  const matches = selectBestTemplates(ctx, undefined, 4);
  console.log("\n" + label + ":");
  for (const m of matches) {
    console.log("  " + m.template.id + ": " + m.score + " (" + m.reasons.join(", ") + ")");
  }
}
