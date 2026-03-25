// ============================================================
// Aicata Design Engine — Page Assembler (Gen-3)
// PageTemplate + セクションテンプレート群 → 完成HTML/CSS
// ============================================================

import type {
  PageTemplate,
  SectionTemplate,
  DesignTokenSet,
  FontDef,
  ThemeLayout,
  AssembledPage as AssembledPage3Zone,
} from "./types";
import { getSectionById } from "./knowledge/sections/registry";

// ============================================================
// HTML Escape Utility
// ============================================================

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================
// Public API
// ============================================================

export interface AssembledPage {
  html: string;
  css: string;
  /** デバッグ情報 */
  meta: {
    templateId: string;
    sectionCount: number;
    missingSections: string[];
    tokenCount: number; // 推定トークン数（文字数/4）
  };
}

/**
 * ページテンプレートとセクションテンプレートを組み合わせて完成HTMLを生成
 *
 * @param pageTemplate ページテンプレート定義
 * @param overrides セクションIDごとのプレースホルダー上書き
 * @returns 完成HTML（<link> + セクションHTML）と結合CSS
 */
export function assemblePage(
  pageTemplate: PageTemplate,
  overrides?: Record<string, Record<string, string>>,
): AssembledPage {
  const resolvedSections: Array<{
    section: SectionTemplate;
    order: number;
    overrides?: Record<string, string>;
  }> = [];
  const missingSections: string[] = [];

  // セクション解決
  const sortedRefs = [...pageTemplate.sections].sort(
    (a, b) => a.order - b.order,
  );

  for (const ref of sortedRefs) {
    const section = getSectionById(ref.sectionId);
    if (!section) {
      missingSections.push(ref.sectionId);
      console.warn(
        `[PageAssembler] Section not found: ${ref.sectionId}`,
      );
      continue;
    }
    resolvedSections.push({
      section,
      order: ref.order,
      overrides: {
        ...ref.overrides,
        ...overrides?.[ref.sectionId],
      },
    });
  }

  // Google Fonts <link> タグ生成
  const fontLinks = buildFontLinks(pageTemplate.fonts);

  // デザイントークンCSS
  const tokenCss = buildTokenCss(pageTemplate.designTokens);

  // ベースリセットCSS
  const resetCss = buildResetCss();

  // セクションHTML結合
  const sectionsHtml = resolvedSections
    .map(({ section, overrides: sectionOverrides }) => {
      let html = section.html;
      // プレースホルダー置換（XSS防止のためテキスト値をエスケープ）
      if (sectionOverrides) {
        for (const [key, value] of Object.entries(sectionOverrides)) {
          // URL系プレースホルダーはエスケープしない（src属性等で使用）
          const isUrl = key.includes("URL") || key.includes("IMAGE") || key.includes("SRC");
          html = html.replaceAll(key, isUrl ? value : escapeHtml(value));
        }
      }
      return html;
    })
    .join("\n\n");

  // セクションCSS結合
  const sectionsCss = resolvedSections
    .map(({ section }) => section.css)
    .join("\n\n");

  // 完成HTML
  const html = `${fontLinks}

${sectionsHtml}`;

  // 完成CSS
  const css = `${resetCss}

${tokenCss}

${sectionsCss}`;

  const fullOutput = html + css;

  return {
    html,
    css,
    meta: {
      templateId: pageTemplate.id,
      sectionCount: resolvedSections.length,
      missingSections: missingSections,
      tokenCount: Math.ceil(fullOutput.length / 4),
    },
  };
}

/**
 * 完全なHTMLドキュメントとして組み立て（プレビュー/プロンプト注入用）
 */
export function assembleFullHtml(
  pageTemplate: PageTemplate,
  overrides?: Record<string, Record<string, string>>,
): string {
  const { html, css } = assemblePage(pageTemplate, overrides);
  return `${html}

<style>
${css}
</style>`;
}

/**
 * 3ゾーンアセンブリ: ThemeLayout を使用してヘッダー・コンテンツ・フッターを分離
 *
 * Phase D: ThemeLayout からヘッダー/フッターセクションを解決し、
 * コンテンツセクションと合わせて AssembledPage を生成
 *
 * @param pageTemplate コンテンツセクションのテンプレート
 * @param themeLayout ストアのテーマレイアウト設定
 * @param overrides プレースホルダー上書き
 */
export function assemblePageWithLayout(
  pageTemplate: PageTemplate,
  themeLayout: ThemeLayout,
  overrides?: Record<string, Record<string, string>>,
): AssembledPage3Zone {
  // ── Header Zone ──
  const headerSectionId = themeLayout.header.navigation.sectionId;
  const headerSection = getSectionById(headerSectionId);
  let headerHtml = "";
  let headerCss = "";

  if (headerSection) {
    headerHtml = headerSection.html;
    headerCss = headerSection.css;
    // プレースホルダー置換
    if (overrides?.[headerSectionId]) {
      for (const [key, value] of Object.entries(overrides[headerSectionId])) {
        const isUrl = key.includes("URL") || key.includes("IMAGE") || key.includes("SRC");
        headerHtml = headerHtml.replaceAll(key, isUrl ? value : escapeHtml(value));
      }
    }
  }

  // Announcement bar
  if (themeLayout.header.announcement.enabled) {
    const announcementSection = getSectionById("announcement-top-bar");
    if (announcementSection) {
      const annoHtml = announcementSection.html
        .replaceAll("{{ANNOUNCEMENT_TEXT}}", escapeHtml(themeLayout.header.announcement.text))
        .replaceAll("{{ANNOUNCEMENT_LINK}}", themeLayout.header.announcement.link || "#");
      headerHtml = annoHtml + "\n" + headerHtml;
      headerCss = announcementSection.css + "\n" + headerCss;
    }
  }

  // ── Content Zone ── (既存のassemblePage ロジックを再利用)
  const contentResult = assemblePage(pageTemplate, overrides);

  // ── Footer Zone ──
  const footerSectionId = themeLayout.footer.sectionId;
  const footerSection = getSectionById(footerSectionId);
  let footerHtml = "";
  let footerCss = "";

  if (footerSection) {
    footerHtml = footerSection.html;
    footerCss = footerSection.css;
    if (overrides?.[footerSectionId]) {
      for (const [key, value] of Object.entries(overrides[footerSectionId])) {
        const isUrl = key.includes("URL") || key.includes("IMAGE") || key.includes("SRC");
        footerHtml = footerHtml.replaceAll(key, isUrl ? value : escapeHtml(value));
      }
    }
  }

  // ── Token + Font CSS ──
  const tokenCss = buildTokenCss(pageTemplate.designTokens);
  const resetCss = buildResetCss();
  const fontLinks = buildFontLinks(pageTemplate.fonts);

  // ── 結合 ──
  const fullHtml = `${fontLinks}

<header class="aicata-zone aicata-zone--header">
${headerHtml}
</header>

<main class="aicata-zone aicata-zone--content">
${contentResult.html}
</main>

<footer class="aicata-zone aicata-zone--footer">
${footerHtml}
</footer>`;

  const fullCss = `${resetCss}

${tokenCss}

/* === Header Zone === */
${headerCss}

/* === Content Zone === */
${contentResult.css.replace(resetCss, "").replace(tokenCss, "").trim()}

/* === Footer Zone === */
${footerCss}`;

  return {
    headerHtml,
    headerCss,
    contentHtml: contentResult.html,
    contentCss: contentResult.css,
    footerHtml,
    footerCss,
    fullHtml,
    fullCss,
    meta: {
      ctaPlacement: "both",
      socialProofIncluded: false,
      sectionCount: contentResult.meta.sectionCount + (headerSection ? 1 : 0) + (footerSection ? 1 : 0),
      missingSections: contentResult.meta.missingSections,
      templateSuffix: pageTemplate.id,
      pageType: pageTemplate.pageType,
      headerSectionId,
      footerSectionId,
    },
  };
}

// ============================================================
// Internal Helpers
// ============================================================

function buildFontLinks(fonts: FontDef[]): string {
  if (fonts.length === 0) return "";

  const families = fonts
    .map((f) => {
      const weights = f.weights.join(";");
      const family = f.family.replace(/ /g, "+");
      if (f.italic) {
        return `family=${family}:ital,wght@0,${weights};1,${weights}`;
      }
      return `family=${family}:wght@${weights}`;
    })
    .join("&");

  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${families}&display=swap" rel="stylesheet">`;
}

function buildTokenCss(tokens: DesignTokenSet): string {
  const lines: string[] = [":root {"];

  for (const [key, value] of Object.entries(tokens.colors)) {
    lines.push(`  ${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(tokens.typography)) {
    lines.push(`  ${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(tokens.spacing)) {
    lines.push(`  ${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(tokens.motion)) {
    lines.push(`  ${key}: ${value};`);
  }

  lines.push("}");
  return lines.join("\n");
}

function buildResetCss(): string {
  return `/* === Aicata Reset === */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: var(--font-body, "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", sans-serif);
  line-height: 1.6;
  color: var(--color-text, #333);
  background-color: var(--color-bg, #fff);
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
input {
  font: inherit;
  border: none;
  outline: none;
}`;
}
