// ============================================================
// Aicata — Batch Page Analyzer API
// 複数ページを順次解析し、統一デザインコンテキストを構築
// ============================================================

import { parse as parseHtml } from "node-html-parser";
import type { DesignTone } from "@/lib/design-engine/types";

export const maxDuration = 120; // 最大2分

// ── Types ──

interface AnalyzeRequest {
  pages: Array<{
    url: string;
    path: string;
    inferredType: string;
  }>;
  /** 解析するページの最大数 */
  maxPages?: number;
}

interface PageAnalysis {
  url: string;
  path: string;
  pageType: string;
  title: string;
  description: string;
  headings: string[];
  images: Array<{ src: string; alt: string; context: string }>;
  colors: string[];
  fonts: string[];
  textSnippets: string[];
  status: "ok" | "error";
  error?: string;
}

interface UnifiedDesignContext {
  /** サイト全体から抽出した主要カラー（頻度順） */
  dominantColors: string[];
  /** 検出されたフォント */
  fonts: string[];
  /** 推定されたデザイントーン */
  tones: DesignTone[];
  /** サイト名 */
  siteName: string;
  /** 業種キーワード */
  industryKeywords: string[];
}

interface AnalyzeResult {
  pages: PageAnalysis[];
  unifiedContext: UnifiedDesignContext;
  analyzedCount: number;
  totalPages: number;
}

// ── Fetch & analyze a single page ──

async function analyzeSinglePage(
  url: string,
  path: string,
  pageType: string,
): Promise<PageAnalysis> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html",
        "Accept-Language": "ja,en;q=0.9",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      return {
        url,
        path,
        pageType,
        title: "",
        description: "",
        headings: [],
        images: [],
        colors: [],
        fonts: [],
        textSnippets: [],
        status: "error",
        error: `HTTP ${res.status}`,
      };
    }

    const html = await res.text();
    const root = parseHtml(html, { comment: false });

    // Title
    const title = root.querySelector("title")?.textContent?.trim() || "";

    // Description
    const description =
      root
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
        ?.trim() || "";

    // Headings
    const headings: string[] = [];
    root.querySelectorAll("h1, h2, h3").forEach((el) => {
      const text = el.textContent?.trim();
      if (text && text.length > 1 && text.length < 200) {
        headings.push(text);
      }
    });

    // Images (top 10)
    const images: Array<{ src: string; alt: string; context: string }> = [];
    const baseUrl = new URL(url);
    root.querySelectorAll("img[src]").forEach((el) => {
      if (images.length >= 10) return;
      const src = el.getAttribute("src");
      if (!src || src.startsWith("data:")) return;
      try {
        const resolved = new URL(src, url).href;
        const alt = el.getAttribute("alt") || "";
        // Guess context
        const parent = el.parentNode;
        const parentClass = (
          parent?.getAttribute?.("class") || ""
        ).toLowerCase();
        let context = "content";
        if (
          parentClass.includes("hero") ||
          parentClass.includes("banner") ||
          parentClass.includes("splash")
        )
          context = "hero";
        else if (
          parentClass.includes("product") ||
          parentClass.includes("item")
        )
          context = "product";
        else if (parentClass.includes("logo")) context = "logo";

        images.push({ src: resolved, alt, context });
      } catch {
        // Skip invalid URLs
      }
    });

    // Colors from inline styles and CSS
    const colorSet = new Set<string>();
    const colorRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
    const rgbRegex =
      /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
    const allStyles: string[] = [];

    root.querySelectorAll("style").forEach((el) => {
      allStyles.push(el.textContent || "");
    });
    root.querySelectorAll("[style]").forEach((el) => {
      allStyles.push(el.getAttribute("style") || "");
    });

    const styleText = allStyles.join(" ");
    let colorMatch;
    while ((colorMatch = colorRegex.exec(styleText)) !== null) {
      const hex = colorMatch[1].toUpperCase();
      // Skip common defaults
      if (!["000000", "FFFFFF", "000", "FFF", "333333"].includes(hex)) {
        colorSet.add(`#${hex}`);
      }
    }
    while ((colorMatch = rgbRegex.exec(styleText)) !== null) {
      const r = parseInt(colorMatch[1]);
      const g = parseInt(colorMatch[2]);
      const b = parseInt(colorMatch[3]);
      const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
      if (!["#000000", "#FFFFFF", "#333333"].includes(hex)) {
        colorSet.add(hex);
      }
    }

    // Fonts
    const fontSet = new Set<string>();
    const fontRegex =
      /font-family:\s*["']?([^"';,}]+)/gi;
    let fontMatch;
    while ((fontMatch = fontRegex.exec(styleText)) !== null) {
      const font = fontMatch[1].trim();
      if (
        font &&
        !["inherit", "initial", "sans-serif", "serif", "monospace"].includes(
          font.toLowerCase(),
        )
      ) {
        fontSet.add(font);
      }
    }
    // Google Fonts
    root.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach((el) => {
      const href = el.getAttribute("href") || "";
      const familyMatch = href.match(/family=([^&:]+)/);
      if (familyMatch) {
        familyMatch[1].split("|").forEach((f) => {
          fontSet.add(f.replace(/\+/g, " "));
        });
      }
    });

    // Text snippets (key paragraphs)
    const textSnippets: string[] = [];
    root.querySelectorAll("p, .description, [class*='desc']").forEach((el) => {
      if (textSnippets.length >= 5) return;
      const text = el.textContent?.trim();
      if (text && text.length > 30 && text.length < 500) {
        textSnippets.push(text.slice(0, 200));
      }
    });

    return {
      url,
      path,
      pageType,
      title,
      description,
      headings: headings.slice(0, 10),
      images,
      colors: Array.from(colorSet).slice(0, 8),
      fonts: Array.from(fontSet).slice(0, 5),
      textSnippets,
      status: "ok",
    };
  } catch (error) {
    return {
      url,
      path,
      pageType,
      title: "",
      description: "",
      headings: [],
      images: [],
      colors: [],
      fonts: [],
      textSnippets: [],
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ── Build unified design context from all analyzed pages ──

function buildUnifiedContext(
  pages: PageAnalysis[],
): UnifiedDesignContext {
  // Color frequency across all pages
  const colorFreq = new Map<string, number>();
  for (const page of pages) {
    for (const color of page.colors) {
      colorFreq.set(color, (colorFreq.get(color) || 0) + 1);
    }
  }
  const dominantColors = Array.from(colorFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([color]) => color);

  // Fonts (ordered by frequency)
  const fontFreq = new Map<string, number>();
  for (const page of pages) {
    for (const font of page.fonts) {
      fontFreq.set(font, (fontFreq.get(font) || 0) + 1);
    }
  }
  const fonts = Array.from(fontFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([font]) => font);

  // Site name from homepage title
  const homePage = pages.find((p) => p.path === "/" || p.pageType === "landing");
  const siteName = homePage?.title?.split(/\s*[\|–—-]\s*/).pop()?.trim() || "";

  // Industry keywords from headings and descriptions
  const allText = pages
    .map((p) => [p.title, p.description, ...p.headings].join(" "))
    .join(" ")
    .toLowerCase();

  const industryKeywords: string[] = [];
  const keywordPatterns = [
    { words: ["コスメ", "美容", "スキンケア", "化粧"], label: "beauty" },
    { words: ["食品", "グルメ", "お菓子", "カフェ"], label: "food" },
    { words: ["ファッション", "アパレル", "服", "靴"], label: "fashion" },
    { words: ["雑貨", "インテリア", "家具", "暮らし"], label: "lifestyle" },
    { words: ["テック", "ガジェット", "デバイス", "アプリ"], label: "tech" },
    { words: ["健康", "フィットネス", "サプリ", "ヨガ"], label: "health" },
  ];
  for (const { words, label } of keywordPatterns) {
    if (words.some((w) => allText.includes(w))) {
      industryKeywords.push(label);
    }
  }

  // Tone inference from colors and fonts
  const tones: DesignTone[] = [];
  // High saturation/dark colors → luxury or bold
  // Pastel/light → natural or playful
  // Mostly neutrals → minimal or modern
  if (dominantColors.length === 0) {
    tones.push("modern");
  } else {
    // Simple heuristic based on color brightness
    const hasVibrant = dominantColors.some((c) => {
      const hex = c.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);
      return saturation > 100;
    });
    if (hasVibrant) tones.push("bold");
    else tones.push("minimal");
    tones.push("modern");
  }

  return {
    dominantColors,
    fonts,
    tones: tones.slice(0, 3) as DesignTone[],
    siteName,
    industryKeywords,
  };
}

// ── Main handler ──

export async function POST(request: Request) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { pages: requestPages, maxPages = 15 } = body;

    if (!requestPages || !Array.isArray(requestPages) || requestPages.length === 0) {
      return Response.json(
        { error: "解析対象のページが必要です" },
        { status: 400 },
      );
    }

    // Limit pages to analyze (prioritize: landing → collections → products → content)
    const typeOrder: Record<string, number> = {
      landing: 0,
      collection: 1,
      "list-collections": 2,
      about: 3,
      contact: 4,
      blog: 5,
      product: 6,
      article: 7,
      cart: 8,
      general: 9,
    };

    const sorted = [...requestPages].sort((a, b) => {
      const oa = typeOrder[a.inferredType] ?? 99;
      const ob = typeOrder[b.inferredType] ?? 99;
      return oa - ob;
    });

    // For products: only take first 2 (they share a template)
    const productPages = sorted.filter((p) => p.inferredType === "product");
    const nonProductPages = sorted.filter((p) => p.inferredType !== "product");
    const selectedPages = [
      ...nonProductPages,
      ...productPages.slice(0, 2),
    ].slice(0, maxPages);

    console.log(
      `[Batch Analyze] Analyzing ${selectedPages.length} of ${requestPages.length} pages`,
    );

    // Analyze pages sequentially (to avoid overwhelming the target server)
    const analyzed: PageAnalysis[] = [];
    for (const page of selectedPages) {
      const result = await analyzeSinglePage(
        page.url,
        page.path,
        page.inferredType,
      );
      analyzed.push(result);
      console.log(
        `[Batch Analyze] ${result.status === "ok" ? "✓" : "✗"} ${page.path} (${page.inferredType})`,
      );
    }

    // Build unified design context
    const successfulPages = analyzed.filter((p) => p.status === "ok");
    const unifiedContext = buildUnifiedContext(successfulPages);

    const result: AnalyzeResult = {
      pages: analyzed,
      unifiedContext,
      analyzedCount: successfulPages.length,
      totalPages: requestPages.length,
    };

    return Response.json(result);
  } catch (error) {
    console.error("[Batch Analyze] Error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "バッチ解析に失敗しました",
      },
      { status: 500 },
    );
  }
}
