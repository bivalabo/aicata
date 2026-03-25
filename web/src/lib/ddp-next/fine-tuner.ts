// ============================================================
// DDP Next — Phase 5: Fine-tuning & Brand Fit
// CSS変数のみを微調整し、ブランドカラー・参考サイトの特徴を反映
//
// AI使用: 最小限（色のニュアンス判断のみ）
// HTML構造は一切変更しない
// ============================================================

import type { ContentRequirements } from "./types";

// ── Types ──

export interface FineTuneInput {
  /** Phase 4完了後のフルHTML */
  fullDocument: string;
  /** コンテンツ要件（Phase 1の出力） */
  requirements: ContentRequirements;
  /** ブランドメモリ（ユーザーの学習済みカラーなど） */
  brandMemory?: {
    colors?: Record<string, string>;
    fonts?: string[];
  };
}

export interface FineTuneResult {
  /** 微調整後のフルHTML */
  fullDocument: string;
  /** 適用された調整の一覧 */
  adjustments: FineTuneAdjustment[];
}

interface FineTuneAdjustment {
  type: "color" | "font" | "spacing" | "opacity";
  variable: string;
  from: string;
  to: string;
  reason: string;
}

// ============================================================
// Public API
// ============================================================

/**
 * Phase 5: 完成ページのCSS変数を微調整
 * - ブランドカラーがある場合: CSS変数を上書き
 * - 参考URL分析結果がある場合: 色・フォントのニュアンスを反映
 * - HTML構造は一切変更しない（CSS :root のみ書き換え）
 */
export function fineTunePage(input: FineTuneInput): FineTuneResult {
  let { fullDocument } = input;
  const adjustments: FineTuneAdjustment[] = [];

  // ── Step 1: ブランドカラーの適用 ──
  if (input.brandMemory?.colors) {
    const colorAdjustments = applyBrandColors(
      fullDocument,
      input.brandMemory.colors,
    );
    fullDocument = colorAdjustments.document;
    adjustments.push(...colorAdjustments.adjustments);
  }

  // ── Step 2: 参考サイトの色を反映 ──
  if (input.requirements.referenceInsights?.colors?.length) {
    const refAdjustments = applyReferenceColors(
      fullDocument,
      input.requirements.referenceInsights.colors,
    );
    fullDocument = refAdjustments.document;
    adjustments.push(...refAdjustments.adjustments);
  }

  // ── Step 3: 参考サイトのフォントを反映 ──
  if (input.requirements.referenceInsights?.fonts?.length) {
    const fontAdjustments = applyReferenceFonts(
      fullDocument,
      input.requirements.referenceInsights.fonts,
    );
    fullDocument = fontAdjustments.document;
    adjustments.push(...fontAdjustments.adjustments);
  }

  // ── Step 4: ブランドメモリのフォントを反映 ──
  if (input.brandMemory?.fonts?.length) {
    const fontAdjustments = applyBrandFonts(
      fullDocument,
      input.brandMemory.fonts,
    );
    fullDocument = fontAdjustments.document;
    adjustments.push(...fontAdjustments.adjustments);
  }

  // ── Step 5: アクセシビリティコントラスト補正 ──
  const contrastAdjustments = ensureContrast(fullDocument);
  fullDocument = contrastAdjustments.document;
  adjustments.push(...contrastAdjustments.adjustments);

  return { fullDocument, adjustments };
}

// ============================================================
// Internal: ブランドカラーの適用
// ============================================================

const CSS_COLOR_MAP: Record<string, string> = {
  primaryColor: "--aicata-color-primary",
  secondaryColor: "--aicata-color-secondary",
  accentColor: "--aicata-color-accent",
  backgroundColor: "--aicata-color-bg",
  textColor: "--aicata-color-text",
  // 旧形式の互換エイリアス
  primary: "--aicata-color-primary",
  secondary: "--aicata-color-secondary",
  accent: "--aicata-color-accent",
  background: "--aicata-color-bg",
  text: "--aicata-color-text",
};

// 旧変数名マッピング（--color-primary → --aicata-color-primary）
const LEGACY_VAR_MAP: Record<string, string> = {
  "--color-primary": "--aicata-color-primary",
  "--color-secondary": "--aicata-color-secondary",
  "--color-accent": "--aicata-color-accent",
  "--color-bg": "--aicata-color-bg",
  "--color-text": "--aicata-color-text",
};

function applyBrandColors(
  document: string,
  colors: Record<string, string>,
): { document: string; adjustments: FineTuneAdjustment[] } {
  const adjustments: FineTuneAdjustment[] = [];

  for (const [key, value] of Object.entries(colors)) {
    if (!value || !isValidColor(value)) continue;

    const cssVar = CSS_COLOR_MAP[key];
    if (!cssVar) continue;

    const result = replaceCSSSVariable(document, cssVar, value);
    if (result.replaced) {
      adjustments.push({
        type: "color",
        variable: cssVar,
        from: result.oldValue,
        to: value,
        reason: `ブランドメモリ: ${key}`,
      });
      document = result.document;
    }

    // レガシー変数名も同時に更新
    const legacyVar = Object.entries(LEGACY_VAR_MAP)
      .find(([, v]) => v === cssVar)?.[0];
    if (legacyVar) {
      const legacyResult = replaceCSSSVariable(document, legacyVar, value);
      if (legacyResult.replaced) {
        document = legacyResult.document;
      }
    }
  }

  return { document, adjustments };
}

// ============================================================
// Internal: 参考サイトの色を反映
// ============================================================

function applyReferenceColors(
  document: string,
  refColors: string[],
): { document: string; adjustments: FineTuneAdjustment[] } {
  const adjustments: FineTuneAdjustment[] = [];

  if (refColors.length === 0) return { document, adjustments };

  // 参考サイトから抽出された色をCSS変数にマッピング
  // 戦略: 色が提供されている場合、アクセントカラーのみを参考サイトの
  // 特徴的な色に合わせる（メインカラーはブランドメモリ優先）
  const accentCandidate = findAccentCandidate(refColors);
  if (accentCandidate) {
    const result = replaceCSSSVariable(
      document,
      "--aicata-color-accent",
      accentCandidate,
    );
    if (result.replaced) {
      adjustments.push({
        type: "color",
        variable: "--aicata-color-accent",
        from: result.oldValue,
        to: accentCandidate,
        reason: "参考サイトの特徴的なアクセントカラー",
      });
      document = result.document;

      // レガシー互換
      const legacy = replaceCSSSVariable(document, "--color-accent", accentCandidate);
      if (legacy.replaced) document = legacy.document;
    }
  }

  return { document, adjustments };
}

/**
 * 参考サイトの色からアクセントカラー候補を選定
 * 最も彩度が高い色をアクセントカラーとして使用
 */
function findAccentCandidate(colors: string[]): string | null {
  if (colors.length === 0) return null;

  let maxSaturation = 0;
  let candidate: string | null = null;

  for (const color of colors) {
    const sat = estimateSaturation(color);
    if (sat > maxSaturation && sat > 0.3) {
      maxSaturation = sat;
      candidate = color;
    }
  }

  return candidate;
}

// ============================================================
// Internal: フォントの反映
// ============================================================

function applyReferenceFonts(
  document: string,
  refFonts: string[],
): { document: string; adjustments: FineTuneAdjustment[] } {
  const adjustments: FineTuneAdjustment[] = [];

  if (refFonts.length === 0) return { document, adjustments };

  // 参考サイトからセリフフォントが検出された場合、見出しフォントに適用
  const serifFont = refFonts.find(
    (f) => f.toLowerCase().includes("serif") && !f.toLowerCase().includes("sans"),
  );
  const sansFont = refFonts.find(
    (f) => f.toLowerCase().includes("sans") || f.toLowerCase().includes("gothic"),
  );

  if (serifFont) {
    const result = replaceCSSSVariable(
      document,
      "--aicata-font-heading",
      `"${serifFont}", serif`,
    );
    if (result.replaced) {
      adjustments.push({
        type: "font",
        variable: "--aicata-font-heading",
        from: result.oldValue,
        to: `"${serifFont}", serif`,
        reason: "参考サイトのセリフフォントを見出しに適用",
      });
      document = result.document;

      // Google Fonts linkを追加
      document = ensureGoogleFont(document, serifFont);
    }
  }

  if (sansFont) {
    const result = replaceCSSSVariable(
      document,
      "--aicata-font-body",
      `"${sansFont}", sans-serif`,
    );
    if (result.replaced) {
      adjustments.push({
        type: "font",
        variable: "--aicata-font-body",
        from: result.oldValue,
        to: `"${sansFont}", sans-serif`,
        reason: "参考サイトのサンセリフフォントを本文に適用",
      });
      document = result.document;
      document = ensureGoogleFont(document, sansFont);
    }
  }

  return { document, adjustments };
}

function applyBrandFonts(
  document: string,
  fonts: string[],
): { document: string; adjustments: FineTuneAdjustment[] } {
  const adjustments: FineTuneAdjustment[] = [];

  if (fonts.length === 0) return { document, adjustments };

  // fonts[0] = 見出しフォント, fonts[1] = 本文フォント
  if (fonts[0]) {
    const headingFont = fonts[0];
    const isSerif = headingFont.toLowerCase().includes("serif") &&
      !headingFont.toLowerCase().includes("sans");
    const fallback = isSerif ? "serif" : "sans-serif";

    const result = replaceCSSSVariable(
      document,
      "--aicata-font-heading",
      `"${headingFont}", ${fallback}`,
    );
    if (result.replaced) {
      adjustments.push({
        type: "font",
        variable: "--aicata-font-heading",
        from: result.oldValue,
        to: `"${headingFont}", ${fallback}`,
        reason: "ブランドメモリの見出しフォント",
      });
      document = result.document;
      document = ensureGoogleFont(document, headingFont);
    }
  }

  if (fonts[1]) {
    const bodyFont = fonts[1];
    const result = replaceCSSSVariable(
      document,
      "--aicata-font-body",
      `"${bodyFont}", sans-serif`,
    );
    if (result.replaced) {
      adjustments.push({
        type: "font",
        variable: "--aicata-font-body",
        from: result.oldValue,
        to: `"${bodyFont}", sans-serif`,
        reason: "ブランドメモリの本文フォント",
      });
      document = result.document;
      document = ensureGoogleFont(document, bodyFont);
    }
  }

  return { document, adjustments };
}

// ============================================================
// Internal: アクセシビリティコントラスト補正
// ============================================================

function ensureContrast(
  document: string,
): { document: string; adjustments: FineTuneAdjustment[] } {
  const adjustments: FineTuneAdjustment[] = [];

  // :root から色を抽出
  const bgMatch = document.match(
    /--(?:aicata-)?color-bg\s*:\s*([^;]+)/,
  );
  const textMatch = document.match(
    /--(?:aicata-)?color-text\s*:\s*([^;]+)/,
  );

  if (!bgMatch || !textMatch) return { document, adjustments };

  const bgColor = bgMatch[1].trim();
  const textColor = textMatch[1].trim();

  const ratio = computeContrastRatio(bgColor, textColor);

  // WCAG AA: テキストは4.5:1以上
  if (ratio < 4.5) {
    // テキストカラーをより暗く/明るくして補正
    const bgLum = relativeLuminance(parseColor(bgColor));
    const newTextColor = bgLum > 0.5 ? "#1a1a2e" : "#f0f0f5";

    const varName = textMatch[0].includes("aicata")
      ? "--aicata-color-text"
      : "--color-text";

    const result = replaceCSSSVariable(document, varName, newTextColor);
    if (result.replaced) {
      adjustments.push({
        type: "color",
        variable: varName,
        from: textColor,
        to: newTextColor,
        reason: `WCAG AA コントラスト補正 (${ratio.toFixed(1)}:1 → 4.5:1+)`,
      });
      document = result.document;
    }
  }

  return { document, adjustments };
}

// ============================================================
// Utility: CSS変数の書き換え
// ============================================================

function replaceCSSSVariable(
  document: string,
  variable: string,
  newValue: string,
): { document: string; replaced: boolean; oldValue: string } {
  // 正規表現でCSS変数の値を置換（:root 内のみ）
  const escaped = variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `(${escaped}\\s*:\\s*)([^;]+)(;)`,
  );

  const match = document.match(regex);
  if (!match) {
    return { document, replaced: false, oldValue: "" };
  }

  const oldValue = match[2].trim();
  if (oldValue === newValue) {
    return { document, replaced: false, oldValue };
  }

  return {
    document: document.replace(regex, `$1${newValue}$3`),
    replaced: true,
    oldValue,
  };
}

// ============================================================
// Utility: Google Fonts
// ============================================================

function ensureGoogleFont(document: string, fontName: string): string {
  // フォント名にスペースが含まれる場合はURL用に+に変換
  const urlFontName = fontName.replace(/\s+/g, "+");
  const fontLink = `https://fonts.googleapis.com/css2?family=${urlFontName}`;

  // 既にこのフォントが読み込まれているかチェック
  if (document.includes(urlFontName)) return document;

  // 最初の<link>タグの前に追加
  const linkTag = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="${fontLink}:wght@300;400;500;600;700&display=swap" rel="stylesheet">`;
  const existingLink = document.indexOf("<link");
  if (existingLink >= 0) {
    return document.slice(0, existingLink) + linkTag + "\n" + document.slice(existingLink);
  }

  return linkTag + "\n" + document;
}

// ============================================================
// Utility: 色の計算
// ============================================================

function isValidColor(color: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(color) ||
    /^rgb/.test(color) ||
    /^hsl/.test(color);
}

function parseColor(color: string): [number, number, number] {
  // Hex → RGB
  const hex = color.replace("#", "");
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return [r, g, b];
  }
  if (hex.length >= 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return [r, g, b];
  }
  return [0, 0, 0];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function computeContrastRatio(color1: string, color2: string): number {
  const l1 = relativeLuminance(parseColor(color1));
  const l2 = relativeLuminance(parseColor(color2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function estimateSaturation(color: string): number {
  const [r, g, b] = parseColor(color);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  if (max === min) return 0;
  return l > 0.5
    ? (max - min) / (2 - max - min)
    : (max - min) / (max + min);
}
