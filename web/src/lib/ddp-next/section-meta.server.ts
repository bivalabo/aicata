// ============================================================
// DDP Next — Harvest Block Loader (Server-only)
// クライアントバンドルに prisma/pg が入るのを防ぐため分離
// ============================================================

import { prisma } from "@/lib/db";
import { registerDynamicMeta } from "./section-meta";
import type { DesignDNAPreferences } from "@/lib/ace-adis/types";
import type { SectionCategory } from "@/lib/design-engine/types";

/**
 * DBからハーベストブロックのメタデータをロードしてレジストリに登録
 * サーバー起動時 or DDP実行前に呼ばれる
 */
export async function loadHarvestBlockMeta(): Promise<number> {
  const blocks = await prisma.harvestedBlock.findMany({
    where: { status: "active" },
    select: {
      id: true,
      sectionCategory: true,
      designDna: true,
      hqs: true,
      flowsWellAfter: true,
      flowsWellBefore: true,
    },
  });

  for (const block of blocks) {
    const dna = JSON.parse(block.designDna);
    const hqs = JSON.parse(block.hqs);
    const flowsAfter: string[] = JSON.parse(block.flowsWellAfter);
    const flowsBefore: string[] = JSON.parse(block.flowsWellBefore);

    // DNA を DDP の形式に変換（0-1 → -1 to 1）
    const ddpDna: Partial<DesignDNAPreferences> = {
      minimalism: (dna.minimalism ?? 0.5) * 2 - 1,
      whitespace: (dna.whitespace ?? 0.5) * 2 - 1,
      contrast: (dna.contrast ?? 0.5) * 2 - 1,
      animationIntensity: (dna.animationIntensity ?? 0.2) * 2 - 1,
      serifAffinity: (dna.serifAffinity ?? 0.3) * 2 - 1,
      colorSaturation: (dna.colorSaturation ?? 0.5) * 2 - 1,
      layoutComplexity: (dna.layoutComplexity ?? 0.5) * 2 - 1,
      imageWeight: (dna.imageWeight ?? 0.5) * 2 - 1,
      asymmetry: (dna.asymmetry ?? 0.3) * 2 - 1,
      novelty: (dna.novelty ?? 0.5) * 2 - 1,
    };

    // HQS を DDP の形式に変換（0-100 → 0-5）
    const ddpHqs = {
      visual: (hqs.typography ?? 70) / 20,
      rhythm: (hqs.spacing ?? 70) / 20,
      conversion: (hqs.hierarchy ?? 70) / 20,
      mobile: (hqs.polish ?? 70) / 20,
      brand: (hqs.colorHarmony ?? 70) / 20,
    };

    registerDynamicMeta(block.id, {
      hqs: ddpHqs,
      dna: ddpDna,
      flowsWellAfter: flowsAfter as SectionCategory[],
      flowsWellBefore: flowsBefore as SectionCategory[],
    });
  }

  return blocks.length;
}
