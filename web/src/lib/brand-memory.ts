// ============================================================
// Aicata Brand Memory — Prompt Integration Layer
//
// Brand Memoryをシステムプロンプトに統合する
// すべてのページ生成でブランドの一貫性を自動的に維持する
// ============================================================

import { prisma } from "./db";
import type { EmotionalDNA } from "./emotional-dna/types";

export interface BrandMemoryData {
  brandName: string;
  brandStory: string;
  industry: string;
  targetAudience: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  colorPalette: string[];
  primaryFont: string;
  bodyFont: string;
  tones: string[];
  voiceTone: string;
  copyKeywords: string[];
  avoidKeywords: string[];
  pageCount: number;
  emotionalDna: EmotionalDNA | null;
}

/**
 * 現在のストアのBrand Memoryを取得する
 * ストア未接続 or Brand Memory未作成の場合は null
 */
export async function getActiveBrandMemory(): Promise<BrandMemoryData | null> {
  try {
    const store = await prisma.store.findFirst({
      orderBy: { updatedAt: "desc" },
    });
    if (!store) return null;

    const brandMemoryModel = (prisma as any).brandMemory;
    if (!brandMemoryModel) return null;

    const memory = await brandMemoryModel
      .findUnique({ where: { storeId: store.id } })
      .catch(() => null);

    if (!memory) return null;

    return {
      brandName: memory.brandName || "",
      brandStory: memory.brandStory || "",
      industry: memory.industry || "general",
      targetAudience: memory.targetAudience || "",
      primaryColor: memory.primaryColor || "",
      secondaryColor: memory.secondaryColor || "",
      accentColor: memory.accentColor || "",
      colorPalette: safeParseJson(memory.colorPalette, []),
      primaryFont: memory.primaryFont || "",
      bodyFont: memory.bodyFont || "",
      tones: safeParseJson(memory.tones, []),
      voiceTone: memory.voiceTone || "",
      copyKeywords: safeParseJson(memory.copyKeywords, []),
      avoidKeywords: safeParseJson(memory.avoidKeywords, []),
      pageCount: memory.pageCount || 0,
      emotionalDna: safeParseJson(memory.emotionalDna, null),
    };
  } catch {
    return null;
  }
}

/**
 * Brand Memoryをシステムプロンプトに注入するセクションを構築
 * 空のBrand Memoryの場合はnullを返す
 */
export function buildBrandMemoryPrompt(
  memory: BrandMemoryData,
): string | null {
  const parts: string[] = [];
  let hasContent = false;

  parts.push("## Brand Memory — このストアのブランドアイデンティティ");
  parts.push("");
  parts.push(
    "以下はAicataが記憶しているこのストアのブランド情報です。すべてのページ生成でこのアイデンティティを一貫して反映してください。",
  );
  parts.push("");

  // ── Brand basics ──
  if (memory.brandName) {
    parts.push(`**ブランド名**: ${memory.brandName}`);
    hasContent = true;
  }
  if (memory.brandStory) {
    parts.push(`**ブランドストーリー**: ${memory.brandStory}`);
    hasContent = true;
  }
  if (memory.industry && memory.industry !== "general") {
    parts.push(`**業種**: ${memory.industry}`);
    hasContent = true;
  }
  if (memory.targetAudience) {
    parts.push(`**ターゲット顧客**: ${memory.targetAudience}`);
    hasContent = true;
  }

  // ── Design identity ──
  const colors: string[] = [];
  if (memory.primaryColor) colors.push(`メイン: ${memory.primaryColor}`);
  if (memory.secondaryColor) colors.push(`サブ: ${memory.secondaryColor}`);
  if (memory.accentColor) colors.push(`アクセント: ${memory.accentColor}`);

  if (colors.length > 0) {
    parts.push("");
    parts.push("**ブランドカラー**:");
    parts.push(
      `  ${colors.join(" / ")}`,
    );
    if (memory.colorPalette.length > 3) {
      parts.push(
        `  その他: ${memory.colorPalette.slice(3).join(", ")}`,
      );
    }
    parts.push(
      "  → CSSの:root変数はこのカラーパレットに合わせてください",
    );
    hasContent = true;
  }

  if (memory.primaryFont || memory.bodyFont) {
    parts.push("");
    parts.push("**フォント**:");
    if (memory.primaryFont)
      parts.push(`  見出し: ${memory.primaryFont}`);
    if (memory.bodyFont) parts.push(`  本文: ${memory.bodyFont}`);
    parts.push("  → Google Fontsのlinkタグを含め、font-familyを設定してください");
    hasContent = true;
  }

  if (memory.tones.length > 0) {
    parts.push("");
    parts.push(`**デザイントーン**: ${memory.tones.join("、")}`);
    hasContent = true;
  }

  // ── Communication style ──
  if (memory.voiceTone || memory.copyKeywords.length > 0 || memory.avoidKeywords.length > 0) {
    parts.push("");
    parts.push("**コミュニケーションスタイル**:");
    if (memory.voiceTone) {
      parts.push(`  語り口: ${memory.voiceTone}`);
    }
    if (memory.copyKeywords.length > 0) {
      parts.push(
        `  好む表現: ${memory.copyKeywords.join("、")}`,
      );
    }
    if (memory.avoidKeywords.length > 0) {
      parts.push(
        `  避ける表現: ${memory.avoidKeywords.join("、")}`,
      );
    }
    hasContent = true;
  }

  // ── Emotional DNA（感情の地層）──
  if (memory.emotionalDna) {
    const { emotionalDnaToPromptContext } = require("./emotional-dna/hearing-engine");
    const emotionalContext = emotionalDnaToPromptContext(memory.emotionalDna);
    if (emotionalContext) {
      parts.push("");
      parts.push(emotionalContext);
      hasContent = true;
    }
  }

  // ── Experience level ──
  if (memory.pageCount > 0) {
    parts.push("");
    parts.push(
      `*（このストアではこれまでに${memory.pageCount}ページを生成済み — ブランドの一貫性を維持してください）*`,
    );
  }

  if (!hasContent) return null;

  return parts.join("\n");
}

function safeParseJson(str: string | null | undefined, fallback: any): any {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
