// ============================================================
// Aicata — Section Detector
// data-section-id を持たないHTML（Shopify既存ページ等）に対して
// セマンティックにセクションを検出し、IDを自動付与する
// ============================================================

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

/**
 * HTMLにdata-section-idがなければ自動付与して返す
 * @returns { annotatedHtml, sections }
 */
export function detectAndAnnotateSections(html: string): {
  annotatedHtml: string;
  sections: DetectedSection[];
} {
  // まず既にdata-section-idがあるか確認
  const hasExistingIds = /data-section-id/.test(html);

  if (hasExistingIds) {
    // 既にIDがある場合は、既存のセクション情報だけ返す
    return {
      annotatedHtml: html,
      sections: extractExistingSections(html),
    };
  }

  // サーバーサイドではDOMParser使えないので正規表現ベースで処理
  const sections: DetectedSection[] = [];
  let sectionIndex = 0;

  // セクション候補: header, nav, section, main, footer, article, aside + div with role/class
  const sectionRegex =
    /<(header|nav|section|main|footer|article|aside)(\s[^>]*)?>|<div\s[^>]*(?:role=["'](?:banner|main|contentinfo|complementary|navigation)["']|class=["'][^"']*(?:section|container|wrapper|block|module)[^"']*["'])[^>]*>/gi;

  let annotatedHtml = html;
  const matches: Array<{ fullMatch: string; tag: string; attrs: string; index: number }> = [];

  let match;
  while ((match = sectionRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const tag = (match[1] || "div").toLowerCase();
    const attrs = match[2] || "";
    matches.push({ fullMatch, tag, attrs, index: match.index });
  }

  // Process matches in reverse order to maintain indices
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];

    // Skip if already has data-section-id
    if (/data-section-id/.test(m.fullMatch)) continue;

    // Extract class and id
    const classMatch = m.fullMatch.match(/class=["']([^"']*)["']/);
    const idMatch = m.fullMatch.match(/id=["']([^"']*)["']/);
    const classNames = classMatch?.[1] || "";
    const existingId = idMatch?.[1] || "";

    // Extract text content (simplified: look ahead for first heading or text)
    const afterContent = html.slice(m.index, m.index + 500);
    const headingMatch = afterContent.match(/<h[1-6][^>]*>([^<]+)</);
    const primaryText = headingMatch?.[1]?.trim() || "";

    // Check for images
    const hasImages = /<img\s/.test(afterContent.slice(0, 500));

    // Infer category
    const { category, label } = inferCategory(
      m.tag,
      classNames,
      existingId,
      primaryText,
      sectionIndex,
      i === 0,
      i === matches.length - 1,
    );

    const sectionId = existingId
      ? `auto-${existingId}`
      : `auto-${category}-${sectionIndex}`;

    sections.unshift({
      id: sectionId,
      tag: m.tag,
      category,
      label,
      primaryText,
      hasImages,
    });

    // Inject data-section-id
    const injected = m.fullMatch.replace(
      /^(<\w+)/,
      `$1 data-section-id="${sectionId}"`,
    );
    annotatedHtml =
      annotatedHtml.slice(0, m.index) +
      injected +
      annotatedHtml.slice(m.index + m.fullMatch.length);

    sectionIndex++;
  }

  return { annotatedHtml, sections };
}

/**
 * 既存のdata-section-idからセクション情報を抽出
 */
function extractExistingSections(html: string): DetectedSection[] {
  const sections: DetectedSection[] = [];
  const regex = /data-section-id=["']([^"']+)["']/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const id = match[1];
    // Look for heading near this section
    const afterContent = html.slice(match.index, match.index + 500);
    const headingMatch = afterContent.match(/<h[1-6][^>]*>([^<]+)</);
    const primaryText = headingMatch?.[1]?.trim() || "";
    const hasImages = /<img\s/.test(afterContent.slice(0, 500));

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
      tag: "section",
      category,
      label,
      primaryText,
      hasImages,
    });
  }

  return sections;
}
