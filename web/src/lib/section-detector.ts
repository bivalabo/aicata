// ============================================================
// Aicata — Section Detector
// data-section-id を持たないHTML（Shopify既存ページ等）に対して
// セマンティックにセクションを検出し、IDを自動付与する
//
// node-html-parser を使用してサーバーサイドでもDOMベースの処理を実現
// ============================================================

import { parse as parseHtml, type HTMLElement } from "node-html-parser";

/**
 * 検出されたセクション情報
 */
export interface DetectedSection {
  /** 自動付与されたセクションID */
  id: string;
  /** 元のHTML要素のタグ名 */
  tag: string;
  /** 推定されたセクションカテゴリ */
  category: string;
  /** 日本語ラベル */
  label: string;
  /** セクション内の主要テキスト（最初の見出し等） */
  primaryText: string;
  /** 画像を含むか */
  hasImages: boolean;
}

// ── Category detection patterns ──

const CATEGORY_PATTERNS: Array<{
  pattern: RegExp;
  category: string;
  label: string;
}> = [
  { pattern: /hero|banner|splash|masthead|jumbotron|main-?visual/i, category: "hero", label: "メインビジュアル" },
  { pattern: /nav|menu|header-nav/i, category: "navigation", label: "ナビゲーション" },
  { pattern: /product|item|shop|catalog/i, category: "products", label: "商品" },
  { pattern: /feature|benefit|service|advantage|why/i, category: "features", label: "特徴・強み" },
  { pattern: /testimonial|review|quote|voice/i, category: "testimonial", label: "お客様の声" },
  { pattern: /gallery|portfolio|showcase/i, category: "gallery", label: "ギャラリー" },
  { pattern: /faq|question|accordion/i, category: "faq", label: "FAQ" },
  { pattern: /cta|action|subscribe|newsletter/i, category: "cta", label: "CTA" },
  { pattern: /contact|form|inquiry/i, category: "contact", label: "お問い合わせ" },
  { pattern: /footer|copyright/i, category: "footer", label: "フッター" },
  { pattern: /story|about|brand|mission|philosophy/i, category: "story", label: "ストーリー" },
  { pattern: /blog|article|post|news/i, category: "blog", label: "ブログ" },
  { pattern: /collection|category/i, category: "collection", label: "コレクション" },
  { pattern: /cart|basket|checkout/i, category: "cart", label: "カート" },
  { pattern: /search|find/i, category: "search", label: "検索" },
  { pattern: /slide|carousel|swiper/i, category: "slideshow", label: "スライドショー" },
];

/**
 * セクションのカテゴリを推定する
 */
function inferCategory(
  tag: string,
  classNames: string,
  id: string,
  textContent: string,
  index: number,
  isFirst: boolean,
  isLast: boolean,
): { category: string; label: string } {
  // 1. タグ名による判定
  if (tag === "header" || tag === "nav") {
    return { category: "navigation", label: "ヘッダー" };
  }
  if (tag === "footer") {
    return { category: "footer", label: "フッター" };
  }
  if (tag === "main") {
    return { category: "main", label: "メインコンテンツ" };
  }

  // 2. class/id パターンマッチ
  const combined = `${classNames} ${id}`.toLowerCase();
  for (const { pattern, category, label } of CATEGORY_PATTERNS) {
    if (pattern.test(combined)) {
      return { category, label };
    }
  }

  // 3. 位置ベースのヒューリスティック
  if (isFirst && tag === "section") {
    return { category: "hero", label: "メインビジュアル" };
  }
  if (isLast && tag === "section") {
    return { category: "cta", label: "CTAセクション" };
  }

  // 4. テキスト内容からの推定
  const textLower = textContent.toLowerCase().slice(0, 200);
  if (/特徴|強み|なぜ|選ばれる|理由/.test(textLower)) {
    return { category: "features", label: "特徴・強み" };
  }
  if (/お客様|レビュー|口コミ|声/.test(textLower)) {
    return { category: "testimonial", label: "お客様の声" };
  }
  if (/お問い合わせ|contact|連絡/.test(textLower)) {
    return { category: "contact", label: "お問い合わせ" };
  }

  return { category: `section-${index + 1}`, label: `セクション ${index + 1}` };
}

// ── Section-level tags and selectors ──

const SECTION_TAGS = new Set(["header", "nav", "section", "main", "footer", "article", "aside"]);

function isSectionCandidate(el: HTMLElement): boolean {
  const tag = el.tagName?.toLowerCase();
  if (!tag) return false;

  // Direct semantic section tags
  if (SECTION_TAGS.has(tag)) return true;

  // div with role or section-like class
  if (tag === "div") {
    const role = el.getAttribute("role")?.toLowerCase() || "";
    if (["banner", "main", "contentinfo", "complementary", "navigation"].includes(role)) {
      return true;
    }
    const cls = el.getAttribute("class")?.toLowerCase() || "";
    if (/section|container|wrapper|block|module/.test(cls)) {
      return true;
    }
  }

  return false;
}

/**
 * HTMLにdata-section-idがなければ自動付与して返す
 * @returns { annotatedHtml, sections }
 */
export function detectAndAnnotateSections(html: string): {
  annotatedHtml: string;
  sections: DetectedSection[];
} {
  const root = parseHtml(html, { comment: false });

  // まず既にdata-section-idがあるか確認
  const existingIds = root.querySelectorAll("[data-section-id]");
  if (existingIds.length > 0) {
    return {
      annotatedHtml: html,
      sections: extractExistingSections(root),
    };
  }

  // セクション候補を検出
  const sections: DetectedSection[] = [];
  const candidates: HTMLElement[] = [];

  // 直下の子要素からセクション候補を収集
  for (const child of root.childNodes) {
    // node-html-parser: HTMLElement has tagName property
    const el = child as HTMLElement;
    if (el.tagName && isSectionCandidate(el)) {
      candidates.push(el);
    }
  }

  // 直下に候補がなければ、全体からセクションタグを探す
  if (candidates.length === 0) {
    const allSections = root.querySelectorAll("header, nav, section, main, footer, article, aside");
    for (const el of allSections) {
      candidates.push(el);
    }
    // div with section-like classes
    const divSections = root.querySelectorAll(
      'div[role="banner"], div[role="main"], div[role="contentinfo"], ' +
      'div[class*="section"], div[class*="container"], div[class*="wrapper"]'
    );
    for (const el of divSections) {
      if (!candidates.includes(el)) {
        candidates.push(el);
      }
    }
  }

  // セクションにIDを付与
  let sectionIndex = 0;
  for (let i = 0; i < candidates.length; i++) {
    const el = candidates[i];
    const tag = el.tagName?.toLowerCase() || "div";

    // Skip if already has data-section-id
    if (el.getAttribute("data-section-id")) continue;

    const classNames = el.getAttribute("class") || "";
    const existingId = el.getAttribute("id") || "";

    // Extract primary text (first heading)
    const heading = el.querySelector("h1, h2, h3, h4, h5, h6");
    const primaryText = heading?.textContent?.trim() || "";

    // Check for images
    const hasImages = el.querySelectorAll("img").length > 0;

    // Infer category
    const { category, label } = inferCategory(
      tag,
      classNames,
      existingId,
      primaryText,
      sectionIndex,
      i === 0,
      i === candidates.length - 1,
    );

    const sectionId = existingId
      ? `auto-${existingId}`
      : `auto-${category}-${sectionIndex}`;

    sections.push({
      id: sectionId,
      tag,
      category,
      label,
      primaryText,
      hasImages,
    });

    // Inject data-section-id attribute
    el.setAttribute("data-section-id", sectionId);
    sectionIndex++;
  }

  return {
    annotatedHtml: root.toString(),
    sections,
  };
}

/**
 * 既存のdata-section-idからセクション情報を抽出
 */
function extractExistingSections(root: HTMLElement): DetectedSection[] {
  const sections: DetectedSection[] = [];
  const elements = root.querySelectorAll("[data-section-id]");

  for (const el of elements) {
    const id = el.getAttribute("data-section-id") || "";

    // Extract primary text (first heading)
    const heading = el.querySelector("h1, h2, h3, h4, h5, h6");
    const primaryText = heading?.textContent?.trim() || "";

    // Check for images
    const hasImages = el.querySelectorAll("img").length > 0;

    // Infer category from id
    let category = id;
    let label = id;
    for (const { pattern, category: cat, label: lab } of CATEGORY_PATTERNS) {
      if (pattern.test(id)) {
        category = cat;
        label = lab;
        break;
      }
    }

    sections.push({
      id,
      tag: el.tagName?.toLowerCase() || "section",
      category,
      label,
      primaryText,
      hasImages,
    });
  }

  return sections;
}
