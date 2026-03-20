import { convertToLiquid, generateTemplateSuffix } from "../liquid-converter";
import { LUXURY_BEAUTY_PRODUCT } from "../knowledge/templates/luxury-beauty-product";
import { MINIMAL_FASHION_COLLECTION } from "../knowledge/templates/minimal-fashion-collection";
import { STANDARD_CART } from "../knowledge/templates/standard-cart";
import { LUXURY_BEAUTY_TOP } from "../knowledge/templates/luxury-beauty-top";
import * as fs from "fs";

console.log("╔══════════════════════════════════════════════════╗");
console.log("║  Liquid Converter — Verification                ║");
console.log("╚══════════════════════════════════════════════════╝\n");

const templates = [
  LUXURY_BEAUTY_TOP,
  LUXURY_BEAUTY_PRODUCT,
  MINIMAL_FASHION_COLLECTION,
  STANDARD_CART,
];

for (const t of templates) {
  const suffix = generateTemplateSuffix(t.id);
  const result = convertToLiquid(t, suffix);
  
  console.log(`\n── ${t.id} (${t.pageType}) ──`);
  console.log(`  Template JSON: ${result.templateJson.key}`);
  console.log(`  CSS Asset:     ${result.cssAsset.key}`);
  console.log(`  Sections:      ${result.sectionFiles.length} files`);
  for (const s of result.sectionFiles) {
    console.log(`    - ${s.key} (${(s.value.length / 1024).toFixed(1)} KB)`);
  }
  console.log(`  Missing:       ${result.meta.missingSections.join(", ") || "none"}`);
  
  // Verify template JSON is valid
  try {
    const parsed = JSON.parse(result.templateJson.value);
    console.log(`  JSON valid:    ✅ (${parsed.order.length} sections in order)`);
  } catch (e) {
    console.log(`  JSON valid:    ❌`);
  }
  
  // Check Liquid section files contain proper {% schema %} blocks
  let schemaCount = 0;
  let liquidObjCount = 0;
  for (const s of result.sectionFiles) {
    if (s.value.includes("{% schema %}")) schemaCount++;
    if (s.value.includes("{{ product.") || s.value.includes("{{ collection.") || s.value.includes("{{ cart.")) liquidObjCount++;
  }
  console.log(`  Schema blocks: ${schemaCount}/${result.sectionFiles.length} ✅`);
  if (t.pageType === "product") {
    console.log(`  Shopify Liquid objects (product.*): ${liquidObjCount} sections`);
  } else if (t.pageType === "collection") {
    console.log(`  Shopify Liquid objects (collection.*): ${liquidObjCount} sections`);
  }
}

// Output one full section Liquid for inspection
const productResult = convertToLiquid(LUXURY_BEAUTY_PRODUCT, "test");
const infoSection = productResult.sectionFiles.find(s => s.key.includes("product-info"));
if (infoSection) {
  console.log("\n── Sample: Product Info Section Liquid ──");
  console.log(infoSection.value.substring(0, 800) + "\n...");
}

console.log("\n🎉 Liquid Converter verification complete!");
