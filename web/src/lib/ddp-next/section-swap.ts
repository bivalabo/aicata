// ============================================================
// DDP Next — Section Swap
// 特定セクションを別バリアントに差し替える
//
// 仕様: 「このセクションを別デザインに」→ Phase 2に戻って
//        同カテゴリの別テンプレートを選定し、Phase 3で再組立
// ============================================================

import type { DesignDNAPreferences } from "@/lib/ace-adis/types";
import type { SectionCategory, SectionTemplate } from "@/lib/design-engine/types";
import type { ResolvedSection, AssembledPage } from "./types";
import { computeHQSComposite } from "./types";
import {
  getSectionMeta,
  getSectionMetaByCategory,
} from "./section-meta";
import { calculateDNASimilarity } from "@/lib/ace-adis/design-dna-engine";
import {
  getSectionById,
  getSectionsByCategory as getRegistrySectionsByCategory,
} from "@/lib/design-engine/knowledge/sections/registry";

// ============================================================
// Types
// ============================================================

export interface SwapCandidate {
  /** セクションテンプレート */
  section: SectionTemplate;
  /** 総合スコア */
  score: number;
  /** DNA距離 */
  dnaDistance: number;
  /** HQS composite */
  hqsComposite: number;
  /** 現在使用中か */
  isCurrent: boolean;
}

export interface SwapResult {
  /** 新しいセクション構成 */
  sections: ResolvedSection[];
  /** 差し替えたセクション */
  newSection: ResolvedSection;
  /** 差し替え前のセクション */
  oldSection: ResolvedSection;
}

// ============================================================
// Public API
// ============================================================

/**
 * 指定セクションと同カテゴリの候補一覧を返す
 * DNA距離 + HQSでランク付け（現在のセクションを除外したバリアント一覧）
 */
export function getSwapCandidates(
  currentSectionId: string,
  targetDNA: DesignDNAPreferences,
  maxCandidates = 5,
): SwapCandidate[] {
  const currentSection = getSectionById(currentSectionId);
  if (!currentSection) return [];

  // 同カテゴリのセクション一覧を取得
  const candidates = getRegistrySectionsByCategory(currentSection.category);

  return candidates
    .map((section) => {
      const meta = getSectionMeta(section.id);
      const hqsComposite = meta ? computeHQSComposite(meta.hqs) : 3.0;

      // DNA距離計算
      let dnaDistance = 0.5; // デフォルト
      if (meta?.dna) {
        const filled = fillPartialDNA(meta.dna);
        const similarity = calculateDNASimilarity(targetDNA, filled);
        dnaDistance = 1 - similarity;
      }

      // スコア: HQS重視 (0.6) + DNA近さ (0.4)
      const score = 0.6 * (hqsComposite / 5.0) + 0.4 * (1 - dnaDistance);

      return {
        section,
        score,
        dnaDistance,
        hqsComposite,
        isCurrent: section.id === currentSectionId,
      };
    })
    .sort((a, b) => {
      // 現在のセクションは最後に
      if (a.isCurrent !== b.isCurrent) return a.isCurrent ? 1 : -1;
      return b.score - a.score;
    })
    .slice(0, maxCandidates + 1); // +1 for current
}

/**
 * セクション構成内の特定セクションを別バリアントに差し替える
 */
export function swapSection(
  sections: ResolvedSection[],
  targetSectionIndex: number,
  newSectionId: string,
  targetDNA: DesignDNAPreferences,
): SwapResult | null {
  if (targetSectionIndex < 0 || targetSectionIndex >= sections.length) {
    return null;
  }

  const newTemplate = getSectionById(newSectionId);
  if (!newTemplate) return null;

  const oldSection = sections[targetSectionIndex];
  const meta = getSectionMeta(newSectionId);
  const hqsComposite = meta ? computeHQSComposite(meta.hqs) : 3.0;

  let dnaDistance = 0.5;
  if (meta?.dna) {
    const filled = fillPartialDNA(meta.dna);
    const similarity = calculateDNASimilarity(targetDNA, filled);
    dnaDistance = 1 - similarity;
  }

  const newSection: ResolvedSection = {
    template: newTemplate,
    order: oldSection.order,
    hqsComposite,
    dnaDistance,
  };

  const updatedSections = [...sections];
  updatedSections[targetSectionIndex] = newSection;

  return {
    sections: updatedSections,
    newSection,
    oldSection,
  };
}

// ============================================================
// Utility
// ============================================================

function fillPartialDNA(
  partial: Partial<DesignDNAPreferences>,
): DesignDNAPreferences {
  return {
    minimalism: partial.minimalism ?? 0,
    whitespace: partial.whitespace ?? 0,
    contrast: partial.contrast ?? 0,
    animationIntensity: partial.animationIntensity ?? 0,
    serifAffinity: partial.serifAffinity ?? 0,
    colorSaturation: partial.colorSaturation ?? 0,
    layoutComplexity: partial.layoutComplexity ?? 0,
    imageWeight: partial.imageWeight ?? 0,
    asymmetry: partial.asymmetry ?? 0,
    novelty: partial.novelty ?? 0,
  };
}
