import type { IndustryKnowledge, IndustryType } from "../../types";
import { beautyKnowledge } from "./beauty";
import { foodKnowledge } from "./food";
import { fashionKnowledge } from "./fashion";
import { generalKnowledge } from "./general";

const industryMap: Record<IndustryType, IndustryKnowledge> = {
  beauty: beautyKnowledge,
  food: foodKnowledge,
  fashion: fashionKnowledge,
  lifestyle: generalKnowledge, // TODO: 専用ナレッジ追加
  tech: generalKnowledge,      // TODO: 専用ナレッジ追加
  health: generalKnowledge,    // TODO: 専用ナレッジ追加
  general: generalKnowledge,
};

export function getIndustryKnowledge(industry: IndustryType): IndustryKnowledge {
  return industryMap[industry] ?? generalKnowledge;
}

export { beautyKnowledge, foodKnowledge, fashionKnowledge, generalKnowledge };
