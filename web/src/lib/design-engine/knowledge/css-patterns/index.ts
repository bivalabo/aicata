import type { CssPattern, CssFeatureId } from "../../types";
import { motionPattern } from "./motion";
import { scrollAnimationsPattern } from "./scroll-animations";
import { typographyPattern } from "./typography";
import { modernLayoutPattern } from "./modern-layout";
import { glassmorphismPattern } from "./glassmorphism";

const cssPatternMap: Record<string, CssPattern> = {
  "motion": motionPattern,
  "scroll-animations": scrollAnimationsPattern,
  "typography": typographyPattern,
  "modern-layout": modernLayoutPattern,
  "glassmorphism": glassmorphismPattern,
};

export function getCssPattern(id: CssFeatureId): CssPattern | undefined {
  return cssPatternMap[id];
}

export function getAllCssPatterns(): CssPattern[] {
  return Object.values(cssPatternMap);
}

export {
  motionPattern,
  scrollAnimationsPattern,
  typographyPattern,
  modernLayoutPattern,
  glassmorphismPattern,
};
