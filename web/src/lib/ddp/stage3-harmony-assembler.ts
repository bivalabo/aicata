// ============================================================
// DDP Stage 3: Harmony Assembler（調和組立）
//
// セクション群を1つのページに組み立て、検証する。
// AIは使わない — 決定的なコード処理のみ。
//
// 革新点:
//   - プレースホルダーの残存を検出 & 自動除去
//   - CSS変数の一貫性チェック
//   - 空セクションの検出
//   - 最終HTML/CSSの最適化
// ============================================================

import type {
  DesignSpec,
  RenderedSection,
  AssembledPageResult,
  ValidationResult,
} from "./types";
import type { MediaStrategy } from "./media-strategy";
import { applyMediaStrategy } from "./media-strategy";

/**
 * Stage 3: 全セクションを組み立てて最終ページを生成
 */
export function assembleAndValidate(
  spec: DesignSpec,
  sections: RenderedSection[],
  mediaStrategy?: MediaStrategy,
): AssembledPageResult {
  // 1. Google Fonts リンク
  const fontsLink = buildFontsLink(spec);

  // 2. CSS 変数（:root）
  const rootCss = buildRootCss(spec);

  // 3. リセットCSS
  const resetCss = buildResetCss(spec);

  // 4. セクション HTML/CSS を結合
  const successfulSections = sections.filter((s) => s.status === "success" || s.html.length > 30);

  const sectionsHtml = successfulSections
    .map((s) => s.html)
    .join("\n\n");

  const sectionsCss = successfulSections
    .map((s) => s.css)
    .filter((css) => css.length > 0)
    .join("\n\n");

  // 5. 検証
  const validation = validate(sectionsHtml, sectionsCss, sections, spec);

  // 6. 問題の自動修正
  let fixedHtml = sectionsHtml;
  // マイクロインタラクション CSS も含めた完全な CSS（DB保存・Enhance復元用）
  const microCss = buildMicroInteractionsCss();
  const fixedCss = `${rootCss}\n\n${resetCss}\n\n${sectionsCss}\n\n${microCss}`;

  // プレースホルダー除去
  if (validation.remainingPlaceholders.length > 0) {
    for (const placeholder of validation.remainingPlaceholders) {
      const replacement = guessPlaceholderReplacement(placeholder);
      fixedHtml = fixedHtml.replaceAll(placeholder, replacement);
      validation.autoFixedIssues.push(
        `プレースホルダー "${placeholder}" → "${replacement}" に自動置換`,
      );
    }
  }

  // 画像戦略の適用: placehold.co URLをCSS/SVG/ストックフォトに置換
  if (mediaStrategy && mediaStrategy.decisions.length > 0) {
    fixedHtml = applyMediaStrategy(fixedHtml, mediaStrategy, {
      primary: spec.colors.primary,
      secondary: spec.colors.secondary,
      accent: spec.colors.accent,
      background: spec.colors.background,
    });
    validation.autoFixedIssues.push(
      `画像戦略適用: ${mediaStrategy.stats.generated}枚の画像を最適化`,
    );
  }

  // 完成HTML（fontsLink はDB保存用 html にも含める — Enhance復元で必要）
  const fullDocument = `${fontsLink}

${fixedHtml}

<style>
${fixedCss}
</style>`;

  // DB保存用: html にフォントリンクを含めることで Enhance 時にフォント情報が失われない
  const htmlWithFonts = `${fontsLink}\n\n${fixedHtml}`;

  return {
    html: htmlWithFonts,
    css: fixedCss,
    fullDocument,
    validation: {
      ...validation,
      // 修正後は valid に
      isValid:
        validation.remainingPlaceholders.length === 0 &&
        validation.emptySections.length === 0,
    },
    spec,
  };
}

/**
 * 検証: プレースホルダー残存、空セクション、CSS不整合をチェック
 */
function validate(
  html: string,
  css: string,
  sections: RenderedSection[],
  spec: DesignSpec,
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    remainingPlaceholders: [],
    emptySections: [],
    cssInconsistencies: [],
    autoFixedIssues: [],
  };

  // 1. プレースホルダー検出
  const placeholderRegex = /\{\{[A-Z_]+\}\}/g;
  const placeholders = html.match(placeholderRegex);
  if (placeholders) {
    result.remainingPlaceholders = [...new Set(placeholders)];
    result.isValid = false;
  }

  // 2. 空セクション検出
  for (const section of sections) {
    if (section.status === "failed") {
      result.emptySections.push(section.id);
      result.isValid = false;
    } else if (section.html.length < 50) {
      result.emptySections.push(section.id);
      result.isValid = false;
    }
  }

  // 3. 必要な CSS 変数の参照チェック
  const expectedVars = [
    "--color-primary",
    "--color-bg",
    "--color-text",
    "--font-heading",
    "--font-body",
  ];
  const combinedCss = css;
  for (const varName of expectedVars) {
    if (!combinedCss.includes(varName) && !html.includes(varName)) {
      result.cssInconsistencies.push(
        `CSS変数 ${varName} が使用されていません`,
      );
    }
  }

  // 4. data-section-id の重複チェック
  const sectionIdMatches = html.match(/data-section-id="([^"]+)"/g);
  if (sectionIdMatches) {
    const ids = sectionIdMatches.map((m) =>
      m.replace(/data-section-id="([^"]+)"/, "$1"),
    );
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (duplicates.length > 0) {
      result.cssInconsistencies.push(
        `重複 section-id: ${[...new Set(duplicates)].join(", ")}`,
      );
    }
  }

  // 5. WCAG AA コントラスト比チェック（テキスト色 vs 背景色）
  const contrastRatio = getContrastRatio(spec.colors.text, spec.colors.background);
  if (contrastRatio < 4.5) {
    result.cssInconsistencies.push(
      `WCAGコントラスト不足: テキスト(${spec.colors.text}) vs 背景(${spec.colors.background}) = ${contrastRatio.toFixed(2)} (4.5以上必要)`,
    );
  }
  // primary色をボタン背景として使う場合のコントラスト
  const primaryOnBgRatio = getContrastRatio(spec.colors.primary, spec.colors.background);
  if (primaryOnBgRatio < 3.0) {
    result.cssInconsistencies.push(
      `プライマリ色の視認性不足: primary(${spec.colors.primary}) vs 背景(${spec.colors.background}) = ${primaryOnBgRatio.toFixed(2)} (3.0以上推奨)`,
    );
  }

  return result;
}

/**
 * プレースホルダーに対する推測置換
 */
function guessPlaceholderReplacement(placeholder: string): string {
  const key = placeholder.replace(/[{}]/g, "").toLowerCase();

  const guesses: Record<string, string> = {
    heading: "ようこそ",
    hero_heading: "あなたの理想を、ここから。",
    hero_title: "あなたの理想を、ここから。",
    title: "タイトル",
    subtitle: "サブタイトル",
    subheading: "もっと詳しく",
    description: "詳しい説明はこちら",
    body: "ここにテキストが入ります。",
    body_text: "ここにテキストが入ります。",
    cta_text: "今すぐ見る",
    cta: "詳しく見る",
    button_text: "クリック",
    logo_text: "BRAND",
    brand_name: "ブランド名",
    phone: "03-XXXX-XXXX",
    email: "info@example.com",
    address: "東京都渋谷区",
    copyright: `© ${new Date().getFullYear()} All Rights Reserved.`,
    price: "¥0,000",
    product_name: "商品名",
    review_text: "とても満足しています。",
    reviewer_name: "お客様",
  };

  return guesses[key] || "テキスト";
}

/**
 * Google Fonts <link> タグ生成
 */
// ── WCAG コントラスト計算 ──

/**
 * 相対輝度を計算（WCAG 2.0 定義）
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * WCAG 2.0 コントラスト比（1:1 ~ 21:1）
 */
function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.replace("#", "");
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return [r, g, b];
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

function buildFontsLink(spec: DesignSpec): string {
  if (spec.typography.googleFontsUrl) {
    return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${spec.typography.googleFontsUrl}" rel="stylesheet">`;
  }

  // フォールバック: Noto Sans JP
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">`;
}

/**
 * :root CSS 変数の生成
 */
function buildRootCss(spec: DesignSpec): string {
  return `/* @aicata-ddp-generated */
:root {
  /* Colors */
  --color-primary: ${spec.colors.primary};
  --color-secondary: ${spec.colors.secondary};
  --color-accent: ${spec.colors.accent};
  --color-bg: ${spec.colors.background};
  --color-text: ${spec.colors.text};

  /* Typography */
  --font-heading: "${spec.typography.headingFont}", "Hiragino Kaku Gothic ProN", sans-serif;
  --font-body: "${spec.typography.bodyFont}", "Hiragino Kaku Gothic ProN", sans-serif;

  /* Typography Scale (Minor Third — 1.2 ratio) */
  --text-xs: 0.694rem;
  --text-sm: 0.833rem;
  --text-base: 1rem;
  --text-lg: 1.2rem;
  --text-xl: 1.44rem;
  --text-2xl: 1.728rem;
  --text-3xl: 2.074rem;
  --text-4xl: 2.488rem;
  --text-5xl: 2.986rem;

  /* Spacing */
  --section-padding: 80px 0;
  --section-padding-mobile: 48px 0;
  --container-max: 1200px;
  --container-padding: 0 24px;
  --gap-sm: 16px;
  --gap-md: 24px;
  --gap-lg: 48px;
  --gap-xl: 64px;

  /* Motion */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04);
}`;
}

/**
 * リセットCSS
 */
function buildResetCss(spec: DesignSpec): string {
  return `/* === Aicata Reset === */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: var(--font-body);
  line-height: 1.6;
  color: var(--color-text);
  background-color: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
img {
  max-width: 100%;
  height: auto;
  display: block;
}
a {
  text-decoration: none;
  color: inherit;
}
button {
  font: inherit;
  cursor: pointer;
  border: none;
  background: none;
}
input, textarea, select {
  font: inherit;
  border: none;
  outline: none;
}
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: 1.3;
}

/* Container utility */
.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--container-padding);
}`;
}

/**
 * マイクロインタラクション CSS — AI 不要、決定的に注入
 * ボタン hover、カード浮き上がり、scroll fade-in 等
 */
function buildMicroInteractionsCss(): string {
  return `/* === Aicata Micro-Interactions === */

/* ボタン: hover 時のスケール + シャドウ変化 */
button, a[class*="btn"], a[class*="cta"], [class*="button"] {
  transition: transform var(--duration-normal) var(--ease-out-expo),
              box-shadow var(--duration-normal) var(--ease-default),
              background-color var(--duration-fast) var(--ease-default);
}
button:hover, a[class*="btn"]:hover, a[class*="cta"]:hover, [class*="button"]:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
button:active, a[class*="btn"]:active, a[class*="cta"]:active, [class*="button"]:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* カード: hover 時の浮き上がり */
[class*="card"], [class*="Card"] {
  transition: transform var(--duration-normal) var(--ease-out-expo),
              box-shadow var(--duration-normal) var(--ease-default);
}
[class*="card"]:hover, [class*="Card"]:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

/* 画像: hover 時の柔らかいズーム */
[class*="card"] img, [class*="Card"] img, [class*="product"] img {
  transition: transform var(--duration-slow) var(--ease-out-expo);
}
[class*="card"]:hover img, [class*="Card"]:hover img, [class*="product"]:hover img {
  transform: scale(1.03);
}

/* リンク: 下線アニメーション */
nav a, footer a {
  position: relative;
}
nav a::after, footer a::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width var(--duration-normal) var(--ease-out-expo);
}
nav a:hover::after, footer a:hover::after {
  width: 100%;
}

/* セクション: scroll-driven fade-in */
[data-section-id] {
  opacity: 0;
  transform: translateY(24px);
  animation: aicata-fade-in 0.6s var(--ease-out-expo) forwards;
}
@keyframes aicata-fade-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 遅延付き fade-in（セクション順） */
[data-section-id]:nth-child(1) { animation-delay: 0s; }
[data-section-id]:nth-child(2) { animation-delay: 0.1s; }
[data-section-id]:nth-child(3) { animation-delay: 0.2s; }
[data-section-id]:nth-child(4) { animation-delay: 0.3s; }
[data-section-id]:nth-child(5) { animation-delay: 0.4s; }
[data-section-id]:nth-child(6) { animation-delay: 0.5s; }
[data-section-id]:nth-child(7) { animation-delay: 0.6s; }
[data-section-id]:nth-child(8) { animation-delay: 0.7s; }

/* フォーカス可視化 */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* スムーススクロール */
html {
  scroll-behavior: smooth;
}

/* prefer-reduced-motion 対応 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-behavior: auto; }
}`;
}
