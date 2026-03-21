// ============================================================
// Aicata Gen-3 — URL Analysis API
// 既存サイトからテキスト・画像・構造・カラーを自動抽出
// ============================================================

import { parse as parseHtml } from "node-html-parser";
import { analyzeDesignContext } from "@/lib/design-engine";
import type {
  UrlAnalysisResult,
  ExtractedSection,
  ExtractedImage,
  ExtractedText,
  SectionCategory,
} from "@/lib/design-engine/types";
import { cachedFetch, CACHE_PRESETS } from "@/lib/api-cache";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return Response.json({ error: "URLが必要です" }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return Response.json({ error: "無効なURLです" }, { status: 400 });
    }

    // 同一URLの解析結果をキャッシュ（1時間有効）
    const cacheKey = `url-analysis:${parsedUrl.href}`;

    const result = await cachedFetch<UrlAnalysisResult>(
      cacheKey,
      async () => {
        console.log("[URL Analysis] Fetching:", parsedUrl.href);

        // Fetch the page
        const response = await fetch(parsedUrl.href, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml",
            "Accept-Language": "ja,en;q=0.9",
          },
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          throw new Error(`ページの取得に失敗しました (${response.status})`);
        }

        const html = await response.text();
        const root = parseHtml(html, { comment: false });

        // ── Extract title & description ──
        const title =
          root.querySelector("title")?.textContent?.trim() || "";
        const metaDesc =
          root
            .querySelector('meta[name="description"]')
            ?.getAttribute("content")
            ?.trim() || "";

        // ── Extract texts ──
        const texts = extractTexts(root);

        // ── Extract images ──
        const images = extractImages(root, parsedUrl);

        // ── Extract sections ──
        const sections = extractSections(root);

        // ── Extract colors ──
        const colors = extractColors(root, html);

        // ── Extract fonts ──
        const fonts = extractFonts(root, html);

        // ── Analyze industry & tone ──
        const allText = texts.map((t) => t.content).join(" ");
        const designContext = analyzeDesignContext(allText);

        const analysisResult: UrlAnalysisResult = {
          url: parsedUrl.href,
          title,
          description: metaDesc,
          industry: designContext.industry,
          tones: designContext.tones,
          sections,
          images,
          texts,
          colors,
          fonts,
        };

        console.log("[URL Analysis] Complete:", {
          title,
          industry: analysisResult.industry,
          tones: analysisResult.tones,
          sections: analysisResult.sections.length,
          images: analysisResult.images.length,
          texts: analysisResult.texts.length,
          colors: analysisResult.colors.length,
        });

        return analysisResult;
      },
      CACHE_PRESETS.urlAnalysis,
    );

    return Response.json(result);
  } catch (error) {
    console.error("[URL Analysis] Error:", error);
    const message =
      error instanceof Error ? error.message : "URL解析中にエラーが発生しました";
    return Response.json({ error: message }, { status: 500 });
  }
}

// ============================================================
// Extraction Functions
// ============================================================

function extractTexts(root: ReturnType<typeof parseHtml>): ExtractedText[] {
  const texts: ExtractedText[] = [];

  // Headings
  for (const level of [1, 2, 3, 4, 5, 6]) {
    const tag = `h${level}`;
    root.querySelectorAll(tag).forEach((el) => {
      const content = el.textContent?.trim();
      if (content && content.length > 1 && content.length < 500) {
        texts.push({
          role: level <= 2 ? "heading" : "subheading",
          content,
          tag,
        });
      }
    });
  }

  // Body text
  root.querySelectorAll("p").forEach((el) => {
    const content = el.textContent?.trim();
    if (content && content.length > 10 && content.length < 2000) {
      texts.push({ role: "body", content, tag: "p" });
    }
  });

  // CTAs (buttons and links with action text)
  root.querySelectorAll("button, a.btn, a.button, [class*='cta'], [class*='btn']").forEach((el) => {
    const content = el.textContent?.trim();
    if (content && content.length > 1 && content.length < 100) {
      texts.push({ role: "cta", content, tag: el.tagName.toLowerCase() });
    }
  });

  // Nav links
  root.querySelectorAll("nav a, header a").forEach((el) => {
    const content = el.textContent?.trim();
    if (content && content.length > 1 && content.length < 50) {
      texts.push({ role: "nav", content, tag: "a" });
    }
  });

  // Meta (og:title, og:description)
  const ogTitle = root
    .querySelector('meta[property="og:title"]')
    ?.getAttribute("content");
  if (ogTitle) {
    texts.push({ role: "meta", content: ogTitle.trim(), tag: "meta" });
  }

  return texts;
}

function extractImages(
  root: ReturnType<typeof parseHtml>,
  baseUrl: URL,
): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  const seen = new Set<string>();

  root.querySelectorAll("img").forEach((el) => {
    const src = el.getAttribute("src") || el.getAttribute("data-src");
    if (!src || seen.has(src)) return;
    seen.add(src);

    // Resolve relative URLs
    let fullSrc: string;
    try {
      fullSrc = new URL(src, baseUrl).href;
    } catch {
      return;
    }

    // Skip tiny images, tracking pixels, SVG data URIs
    if (
      fullSrc.startsWith("data:image/svg") ||
      fullSrc.includes("1x1") ||
      fullSrc.includes("pixel")
    ) {
      return;
    }

    const alt = el.getAttribute("alt") || "";
    const width = parseInt(el.getAttribute("width") || "0");
    const height = parseInt(el.getAttribute("height") || "0");

    // Guess context from surrounding elements
    const parent = el.parentNode;
    const grandparent = parent?.parentNode;
    let context = "general";

    const parentClass = (
      parent?.toString() || ""
    ).toLowerCase();
    const gpClass = (
      grandparent?.toString() || ""
    ).toLowerCase();

    if (
      parentClass.includes("hero") ||
      gpClass.includes("hero") ||
      parentClass.includes("banner")
    ) {
      context = "hero";
    } else if (
      parentClass.includes("product") ||
      gpClass.includes("product")
    ) {
      context = "product";
    } else if (
      parentClass.includes("logo") ||
      alt.toLowerCase().includes("logo")
    ) {
      context = "logo";
    }

    images.push({
      src: fullSrc,
      alt,
      width: width || undefined,
      height: height || undefined,
      context,
    });
  });

  // Also check og:image
  const ogImage = root
    .querySelector('meta[property="og:image"]')
    ?.getAttribute("content");
  if (ogImage && !seen.has(ogImage)) {
    try {
      const fullSrc = new URL(ogImage, baseUrl).href;
      images.unshift({
        src: fullSrc,
        alt: "OG Image",
        context: "hero",
      });
    } catch {
      // ignore
    }
  }

  return images.slice(0, 20); // Limit
}

function extractSections(
  root: ReturnType<typeof parseHtml>,
): ExtractedSection[] {
  const sections: ExtractedSection[] = [];
  let order = 0;

  // Header/Nav
  const header = root.querySelector("header");
  if (header) {
    sections.push({
      tag: "header",
      category: "navigation",
      textContent: header.textContent?.trim().slice(0, 200) || "",
      imageUrls: extractImageUrls(header),
      order: order++,
    });
  }

  // Main sections
  root.querySelectorAll("section, main > div, [role='main'] > div").forEach(
    (el) => {
      const category = guessSectionCategory(el);
      const text = el.textContent?.trim().slice(0, 300) || "";
      if (text.length < 5) return;

      sections.push({
        tag: el.tagName.toLowerCase(),
        category,
        textContent: text,
        imageUrls: extractImageUrls(el),
        order: order++,
      });
    },
  );

  // Footer
  const footer = root.querySelector("footer");
  if (footer) {
    sections.push({
      tag: "footer",
      category: "footer",
      textContent: footer.textContent?.trim().slice(0, 200) || "",
      imageUrls: [],
      order: order++,
    });
  }

  return sections;
}

function guessSectionCategory(
  el: ReturnType<typeof parseHtml>,
): SectionCategory {
  const classAndId = (
    (el.getAttribute("class") || "") +
    " " +
    (el.getAttribute("id") || "")
  ).toLowerCase();

  if (classAndId.match(/hero|banner|splash|jumbotron|masthead/))
    return "hero";
  if (classAndId.match(/product|item|shop|catalog|collection/))
    return "products";
  if (classAndId.match(/feature|benefit|service|why/)) return "features";
  if (classAndId.match(/story|about|philosophy|mission|brand/))
    return "story";
  if (classAndId.match(/testimonial|review|quote/)) return "testimonial";
  if (classAndId.match(/gallery|portfolio|showcase/)) return "gallery";
  if (classAndId.match(/faq|question|accordion/)) return "faq";
  if (classAndId.match(/newsletter|subscribe|signup|cta|action/))
    return "cta";
  if (classAndId.match(/editorial|blog|article|news/)) return "editorial";

  // Guess from content
  const text = el.textContent?.toLowerCase() || "";
  if (text.length < 100) return "cta";

  const hasImages =
    el.querySelectorAll("img").length > 2;
  if (hasImages) return "products";

  return "story";
}

function extractImageUrls(
  el: ReturnType<typeof parseHtml>,
): string[] {
  return el
    .querySelectorAll("img")
    .map((img) => img.getAttribute("src") || "")
    .filter(Boolean)
    .slice(0, 5);
}

function extractColors(
  root: ReturnType<typeof parseHtml>,
  html: string,
): string[] {
  const colors = new Set<string>();

  // From inline styles and CSS
  const hexMatches = html.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  const rgbMatches =
    html.match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g) || [];

  // Count frequency
  const freq = new Map<string, number>();
  for (const c of [...hexMatches, ...rgbMatches]) {
    const normalized = c.toLowerCase();
    // Skip common defaults
    if (
      ["#fff", "#ffffff", "#000", "#000000", "#333", "#333333"].includes(
        normalized,
      )
    )
      continue;
    freq.set(normalized, (freq.get(normalized) || 0) + 1);
  }

  // Sort by frequency, take top colors
  const sorted = Array.from(freq.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  for (const [color] of sorted) {
    colors.add(color);
  }

  // From theme-color meta
  const themeColor = root
    .querySelector('meta[name="theme-color"]')
    ?.getAttribute("content");
  if (themeColor) colors.add(themeColor);

  return Array.from(colors);
}

function extractFonts(
  root: ReturnType<typeof parseHtml>,
  html: string,
): string[] {
  const fonts = new Set<string>();

  // From Google Fonts links
  root.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach((el) => {
    const href = el.getAttribute("href") || "";
    const familyMatches = href.match(/family=([^&:]+)/g) || [];
    for (const match of familyMatches) {
      const family = match
        .replace("family=", "")
        .replace(/\+/g, " ")
        .split(":")[0];
      if (family) fonts.add(family);
    }
  });

  // From CSS font-family declarations
  const fontFamilyMatches =
    html.match(/font-family:\s*["']?([^;"'}\n]+)/g) || [];
  for (const match of fontFamilyMatches) {
    const family = match
      .replace(/font-family:\s*/, "")
      .replace(/["']/g, "")
      .split(",")[0]
      .trim();
    if (
      family &&
      !["inherit", "initial", "sans-serif", "serif", "monospace"].includes(
        family.toLowerCase(),
      )
    ) {
      fonts.add(family);
    }
  }

  return Array.from(fonts);
}
