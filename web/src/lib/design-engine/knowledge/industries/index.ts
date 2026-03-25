import type { IndustryKnowledge, IndustryType } from "../../types";
import { beautyKnowledge } from "./beauty";
import { foodKnowledge } from "./food";
import { fashionKnowledge } from "./fashion";
import { generalKnowledge } from "./general";

const industryMap: Record<IndustryType, IndustryKnowledge> = {
  beauty: beautyKnowledge,
  food: foodKnowledge,
  fashion: fashionKnowledge,
  lifestyle: generalKnowledge, // Phase 2: lifestyle専用ナレッジ（暮らし・インテリア系）
  tech: generalKnowledge,      // Phase 2: tech専用ナレッジ（ガジェット・SaaS系）
  health: generalKnowledge,    // Phase 2: health専用ナレッジ（ヘルスケア・サプリ系）
  general: generalKnowledge,
};

export function getIndustryKnowledge(industry: IndustryType): IndustryKnowledge {
  return industryMap[industry] ?? generalKnowledge;
}

export { beautyKnowledge, foodKnowledge, fashionKnowledge, generalKnowledge };
