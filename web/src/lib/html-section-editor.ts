// ============================================================
// Aicata — HTML Section Editor
// ページ HTML を DOM パースしてセクション操作を行うユーティリティ
// ============================================================

/**
 * セクション内のテキストノード情報
 */
export interface SectionTextNode {
  /** CSS セレクタ（セクション内相対） */
  selector: string;
  /** タグ名 */
  tag: string;
  /** 現在のテキスト */
  text: string;
  /** ロール推定: heading, subheading, body, cta, label */
  role: "heading" | "subheading" | "body" | "cta" | "label";
}

/**
 * セクション内の画像ノード情報
 */
export interface SectionImageNode {
  selector: string;
  src: string;
  alt: string;
  width?: string;
  height?: string;
}

/**
 * セクション情報
 */
export interface SectionInfo {
  id: string;
  tag: string;
  texts: SectionTextNode[];
  images: SectionImageNode[];
  outerHtml: string;
}

// ============================================================
// パーサー
// ============================================================

/**
 * HTML 文字列をパースして DOMParser で操作可能な Document を返す
 * ※ サーバーサイドでは使えないため、クライアントのみ
 */
function parseHtml(html: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(
    `<div id="__aicata_root__">${html}</div>`,
    "text/html",
  );
}

function serializeHtml(doc: Document): string {
  const root = doc.getElementById("__aicata_root__");
  return root ? root.innerHTML : "";
}

/**
 * テキスト要素のロールを推定
 */
function inferTextRole(el: Element): SectionTextNode["role"] {
  const tag = el.tagName.toLowerCase();
  if (["h1", "h2"].includes(tag)) return "heading";
  if (["h3", "h4", "h5", "h6"].includes(tag)) return "subheading";
  if (tag === "a" || tag === "button") return "cta";
  if (["span", "label", "small"].includes(tag)) return "label";
  return "body";
}

/**
 * 要素のCSS セレクタを生成（セクション内相対）
 */
function buildSelector(el: Element, sectionEl: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;
  while (current && current !== sectionEl) {
    const currentEl: Element = current;
    const tag = currentEl.tagName.toLowerCase();
    const parentEl: Element | null = currentEl.parentElement;
    if (parentEl) {
      const siblings = Array.from(parentEl.children).filter(
        (c: Element) => c.tagName === currentEl.tagName,
      );
      if (siblings.length > 1) {
        const idx = siblings.indexOf(currentEl) + 1;
        parts.unshift(`${tag}:nth-of-type(${idx})`);
      } else {
        parts.unshift(tag);
      }
    } else {
      parts.unshift(tag);
    }
    current = parentEl;
  }
  return parts.join(" > ");
}

// ============================================================
// セクション情報取得
// ============================================================

/**
 * HTML からセクション一覧を取得
 */
export function getSections(html: string): SectionInfo[] {
  const doc = parseHtml(html);
  const sectionEls = doc.querySelectorAll("[data-section-id]");
  const sections: SectionInfo[] = [];

  sectionEls.forEach((sectionEl) => {
    const id = sectionEl.getAttribute("data-section-id") || "";
    const texts: SectionTextNode[] = [];
    const images: SectionImageNode[] = [];

    // テキスト要素を収集
    const textTags = "h1, h2, h3, h4, h5, h6, p, a, button, span, li, label, figcaption";
    sectionEl.querySelectorAll(textTags).forEach((el) => {
      const text = el.textContent?.trim();
      if (!text || text.length < 2) return;
      // 子要素がすべてテキスト系の場合のみ追加（ネスト回避）
      const hasBlockChild = el.querySelector("h1, h2, h3, h4, h5, h6, p, div, section");
      if (hasBlockChild) return;

      texts.push({
        selector: buildSelector(el, sectionEl),
        tag: el.tagName.toLowerCase(),
        text,
        role: inferTextRole(el),
      });
    });

    // 画像要素を収集
    sectionEl.querySelectorAll("img").forEach((img) => {
      images.push({
        selector: buildSelector(img, sectionEl),
        src: img.getAttribute("src") || "",
        alt: img.getAttribute("alt") || "",
        width: img.getAttribute("width") || undefined,
        height: img.getAttribute("height") || undefined,
      });
    });

    sections.push({
      id,
      tag: sectionEl.tagName.toLowerCase(),
      texts,
      images,
      outerHtml: sectionEl.outerHTML.slice(0, 200) + "...",
    });
  });

  return sections;
}

/**
 * 特定セクションの情報を取得
 */
export function getSectionById(html: string, sectionId: string): SectionInfo | null {
  const sections = getSections(html);
  return sections.find((s) => s.id === sectionId) || null;
}

// ============================================================
// セクション操作
// ============================================================

/**
 * セクション内のテキストを更新
 */
export function updateSectionText(
  html: string,
  sectionId: string,
  selector: string,
  newText: string,
): string {
  const doc = parseHtml(html);
  const sectionEl = doc.querySelector(`[data-section-id="${sectionId}"]`);
  if (!sectionEl) return html;

  const targetEl = sectionEl.querySelector(selector);
  if (!targetEl) return html;

  targetEl.textContent = newText;
  return serializeHtml(doc);
}

/**
 * セクション内の画像srcを更新
 */
export function updateSectionImage(
  html: string,
  sectionId: string,
  selector: string,
  newSrc: string,
  newAlt?: string,
): string {
  const doc = parseHtml(html);
  const sectionEl = doc.querySelector(`[data-section-id="${sectionId}"]`);
  if (!sectionEl) return html;

  const imgEl = sectionEl.querySelector(selector) as HTMLImageElement | null;
  if (!imgEl) return html;

  imgEl.setAttribute("src", newSrc);
  if (newAlt !== undefined) imgEl.setAttribute("alt", newAlt);
  return serializeHtml(doc);
}

/**
 * セクションを上に移動
 */
export function moveSectionUp(html: string, sectionId: string): string {
  const doc = parseHtml(html);
  const sectionEl = doc.querySelector(`[data-section-id="${sectionId}"]`);
  if (!sectionEl) return html;

  const prev = sectionEl.previousElementSibling;
  if (!prev) return html; // すでに最上部

  sectionEl.parentElement?.insertBefore(sectionEl, prev);
  return serializeHtml(doc);
}

/**
 * セクションを下に移動
 */
export function moveSectionDown(html: string, sectionId: string): string {
  const doc = parseHtml(html);
  const sectionEl = doc.querySelector(`[data-section-id="${sectionId}"]`);
  if (!sectionEl) return html;

  const next = sectionEl.nextElementSibling;
  if (!next) return html; // すでに最下部

  // next の後ろに挿入
  next.parentElement?.insertBefore(sectionEl, next.nextSibling);
  return serializeHtml(doc);
}

/**
 * セクションを削除
 */
export function deleteSection(html: string, sectionId: string): string {
  const doc = parseHtml(html);
  const sectionEl = doc.querySelector(`[data-section-id="${sectionId}"]`);
  if (!sectionEl) return html;

  sectionEl.remove();
  return serializeHtml(doc);
}

/**
 * セクションの表示/非表示トグル
 */
export function toggleSectionVisibility(
  html: string,
  sectionId: string,
  visible: boolean,
): string {
  const doc = parseHtml(html);
  const sectionEl = doc.querySelector(`[data-section-id="${sectionId}"]`) as HTMLElement | null;
  if (!sectionEl) return html;

  if (visible) {
    sectionEl.style.removeProperty("display");
  } else {
    sectionEl.style.display = "none";
  }
  return serializeHtml(doc);
}
