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
  const fixedCss = `${rootCss}\n\n${resetCss}\n\n${sectionsCss}`;

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

  // 完成HTML
  const fullDocument = `${fontsLink}

${fixedHtml}

<style>
${fixedCss}
</style>`;

  return {
    html: fixedHtml,
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
  return `:root {
  /* Colors */
  --color-primary: ${spec.colors.primary};
  --color-secondary: ${spec.colors.secondary};
  --color-accent: ${spec.colors.accent};
  --color-bg: ${spec.colors.background};
  --color-text: ${spec.colors.text};

  /* Typography */
  --font-heading: "${spec.typography.headingFont}", "Hiragino Kaku Gothic ProN", sans-serif;
  --font-body: "${spec.typography.bodyFont}", "Hiragino Kaku Gothic ProN", sans-serif;

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
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
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
