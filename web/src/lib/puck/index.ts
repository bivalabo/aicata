/**
 * Puck Editor Integration
 *
 * Re-exports the Puck config (component library) and
 * the Liquid conversion engine for Shopify deployment.
 */
export { puckConfig, createEmptyPuckData, getComponentCatalog } from "./config";
export { puckToLiquid, puckComponentToLiquidFile } from "./to-liquid";
export type { LiquidSection, LiquidOutput } from "./to-liquid";
