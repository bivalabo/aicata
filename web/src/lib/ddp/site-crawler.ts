// ============================================================
// DDP Site Crawler Agent
//
// 既存サイトのURL を受け取り、サイト全体の構造を巡回・解析する。
// 出力: SiteMap（全ページのリスト + 階層構造 + 各ページのメタ情報）
//
// 手法:
//   1. トップページの HTML を取得
//   2. 内部リンクを全抽出（同一ドメイン）
//   3. 各ページを巡回して構造を把握
//   4. ページタイプを自動推定（商品、コレクション、ブログ等）
//   5. サイトマップツリーを構築
// ============================================================

export interface CrawledPage {
  url: string;
  path: string;
  title: string;
  description: string;
  pageType: PageTypeGuess;
  /** H1〜H3 の見出しテキスト */
  headings: string[];
  /** 主要テキストスニペット */
  textSnippets: string[];
  /** 検出された画像 */
  images: Array<{ src: string; alt: string; context: string }>;
  /** 検出されたカラー（CSSから） */
  colors: string[];
  /** 検出されたフォント */
  fonts: string[];
  /** このページからの内部リンク */
  internalLinks: string[];
  /** ページの深さ（トップ=0） */
  depth: number;
  /** 取得成功したか */
  status: "ok" | "error" | "skipped";
  /** エラーメッセージ */
  error?: string;
}

export type PageTypeGuess =
  | "landing"
  | "product"
  | "collection"
  | "list-collections"
  | "cart"
  | "blog"
  | "article"
  | "about"
  | "contact"
  | "search"
  | "account"
  | "faq"
  | "legal"
  | "404"
  | "general";

export interface SiteStructure {
  /** ルートURL */
  rootUrl: string;
  /** サイト名 */
  siteName: string;
  /** 全ページ一覧 */
  pages: CrawledPage[];
  /** 統一デザインコンテキスト（全ページの共通要素） */
  unifiedDesign: {
    dominantColors: string[];
    fonts: string[];
    tones: string[];
  };
  /** サイトツリー（階層構造） */
  tree: SiteTreeNode;
  /** クロール統計 */
  stats: {
    totalPagesFound: number;
    totalPagesCrawled: number;
    totalPagesSkipped: number;
    crawlDurationMs: number;
  };
}

export interface SiteTreeNode {
  path: string;
  title: string;
  pageType: PageTypeGuess;
  children: SiteTreeNode[];
}

export interface CrawlProgress {
  phase: "discovering" | "crawling" | "analyzing" | "complete";
  current: number;
  total: number;
  currentUrl?: string;
  message: string;
}

// ── Configuration ──

const MAX_PAGES = 30; // 最大クロールページ数
const MAX_DEPTH = 3; // 最大リンク追跡深度
const CRAWL_DELAY_MS = 500; // ページ間の待機時間（礼儀正しいクロール）
const FETCH_TIMEOUT_MS = 15000; // 1ページあたりのタイムアウト

// ── Main Crawler ──

/**
 * サイト全体をクロールし、構造を返す
 */
export async function crawlSite(
  rootUrl: string,
  onProgress?: (progress: CrawlProgress) => void,
): Promise<SiteStructure> {
  const startTime = Date.now();

  // URLを正規化
  const parsedRoot = new URL(rootUrl.startsWith("http") ? rootUrl : `https://${rootUrl}`);
  const baseUrl = `${parsedRoot.protocol}//${parsedRoot.host}`;

  onProgress?.({
    phase: "discovering",
    current: 0,
    total: 0,
    currentUrl: rootUrl,
    message: "サイト構造を発見中...",
  });

  // Phase 1: トップページをクロールしてリンクを収集
  const visited = new Set<string>();
  const toVisit: Array<{ url: string; depth: number }> = [
    { url: parsedRoot.href, depth: 0 },
  ];
  const crawledPages: CrawledPage[] = [];

  // Phase 2: 幅優先でクロール
  while (toVisit.length > 0 && crawledPages.length < MAX_PAGES) {
    const { url, depth } = toVisit.shift()!;
    const normalizedPath = normalizeUrl(url, baseUrl);

    if (visited.has(normalizedPath)) continue;
    if (depth > MAX_DEPTH) continue;
    if (shouldSkipUrl(normalizedPath)) continue;

    visited.add(normalizedPath);

    onProgress?.({
      phase: "crawling",
      current: crawledPages.length,
      total: Math.min(visited.size + toVisit.length, MAX_PAGES),
      currentUrl: normalizedPath,
      message: `ページをクロール中 (${crawledPages.length + 1}/${Math.min(visited.size + toVisit.length, MAX_PAGES)})`,
    });

    try {
      const page = await crawlPage(normalizedPath, baseUrl, depth);
      crawledPages.push(page);

      // 内部リンクをキューに追加
      if (page.status === "ok" && depth < MAX_DEPTH) {
        for (const link of page.internalLinks) {
          const normalizedLink = normalizeUrl(link, baseUrl);
          if (!visited.has(normalizedLink) && !shouldSkipUrl(normalizedLink)) {
            toVisit.push({ url: normalizedLink, depth: depth + 1 });
          }
        }
      }

      // 礼儀正しいクロール
      if (toVisit.length > 0) {
        await sleep(CRAWL_DELAY_MS);
      }
    } catch (err) {
      crawledPages.push({
        url: normalizedPath,
        path: new URL(normalizedPath).pathname,
        title: "",
        description: "",
        pageType: "general",
        headings: [],
        textSnippets: [],
        images: [],
        colors: [],
        fonts: [],
        internalLinks: [],
        depth,
        status: "error",
        error: err instanceof Error ? err.message : "不明なエラー",
      });
    }
  }

  // Phase 3: 統合分析
  onProgress?.({
    phase: "analyzing",
    current: crawledPages.length,
    total: crawledPages.length,
    message: "デザイン要素を分析中...",
  });

  const siteName = extractSiteName(crawledPages);
  const unifiedDesign = analyzeUnifiedDesign(crawledPages);
  const tree = buildSiteTree(crawledPages, parsedRoot.pathname || "/");

  const structure: SiteStructure = {
    rootUrl: baseUrl,
    siteName,
    pages: crawledPages,
    unifiedDesign,
    tree,
    stats: {
      totalPagesFound: visited.size,
      totalPagesCrawled: crawledPages.filter((p) => p.status === "ok").length,
      totalPagesSkipped: crawledPages.filter((p) => p.status === "skipped").length,
      crawlDurationMs: Date.now() - startTime,
    },
  };

  onProgress?.({
    phase: "complete",
    current: crawledPages.length,
    total: crawledPages.length,
    message: `${structure.stats.totalPagesCrawled}ページのクロールが完了しました`,
  });

  return structure;
}

// ── Single Page Crawl ──

async function crawlPage(
  url: string,
  baseUrl: string,
  depth: number,
): Promise<CrawledPage> {
  const path = new URL(url).pathname;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Aicata-Crawler/1.0 (+https://aicata.app)",
        Accept: "text/html",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        url, path, title: "", description: "",
        pageType: guessPageType(path),
        headings: [], textSnippets: [], images: [], colors: [], fonts: [],
        internalLinks: [], depth,
        status: "error",
        error: `HTTP ${response.status}`,
      };
    }

    const html = await response.text();

    // HTML解析
    const title = extractTitle(html);
    const description = extractMetaDescription(html);
    const headings = extractHeadings(html);
    const textSnippets = extractTextSnippets(html);
    const images = extractImages(html, baseUrl);
    const colors = extractColors(html);
    const fonts = extractFonts(html);
    const internalLinks = extractInternalLinks(html, baseUrl);
    const pageType = guessPageType(path, html);

    return {
      url, path, title, description, pageType,
      headings, textSnippets, images, colors, fonts,
      internalLinks, depth,
      status: "ok",
    };
  } catch (err) {
    return {
      url, path, title: "", description: "",
      pageType: guessPageType(path),
      headings: [], textSnippets: [], images: [], colors: [], fonts: [],
      internalLinks: [], depth,
      status: "error",
      error: err instanceof Error ? err.message : "不明なエラー",
    };
  }
}

// ── HTML Extraction Helpers ──

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim().replace(/\s+/g, " ") : "";
}

function extractMetaDescription(html: string): string {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i);
  return match ? match[1].trim() : "";
}

function extractHeadings(html: string): string[] {
  const headings: string[] = [];
  const regex = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text && text.length > 2 && text.length < 200) {
      headings.push(text);
    }
  }
  return headings.slice(0, 15);
}

function extractTextSnippets(html: string): string[] {
  const snippets: string[] = [];
  // Extract meaningful text from p tags
  const regex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text && text.length > 20 && text.length < 500) {
      snippets.push(text);
    }
  }
  return snippets.slice(0, 10);
}

function extractImages(html: string, baseUrl: string): Array<{ src: string; alt: string; context: string }> {
  const images: Array<{ src: string; alt: string; context: string }> = [];
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    let src = match[1];
    const alt = match[2] || "";

    // Resolve relative URLs
    if (src.startsWith("//")) src = `https:${src}`;
    else if (src.startsWith("/")) src = `${baseUrl}${src}`;

    // Skip tiny images, tracking pixels, etc.
    if (src.includes("1x1") || src.includes("pixel") || src.includes("tracking")) continue;

    const context = alt.toLowerCase().includes("logo") ? "logo"
      : alt.toLowerCase().includes("product") ? "product"
      : "general";

    images.push({ src, alt, context });
  }
  return images.slice(0, 12);
}

function extractColors(html: string): string[] {
  const colors = new Set<string>();
  // Extract from CSS custom properties and inline styles
  const colorRegex = /#[0-9a-fA-F]{3,8}\b/g;
  let match;
  while ((match = colorRegex.exec(html)) !== null) {
    const color = match[0].toLowerCase();
    // Skip very common/boring colors
    if (!["#fff", "#ffffff", "#000", "#000000", "#333", "#333333", "#ccc", "#cccccc"].includes(color)) {
      colors.add(color);
    }
  }
  return [...colors].slice(0, 10);
}

function extractFonts(html: string): string[] {
  const fonts = new Set<string>();
  // Google Fonts
  const gfRegex = /fonts\.googleapis\.com\/css2?\?family=([^"&]+)/gi;
  let match;
  while ((match = gfRegex.exec(html)) !== null) {
    const families = decodeURIComponent(match[1]).split("|");
    for (const f of families) {
      fonts.add(f.replace(/[:+].*/g, "").replace(/\+/g, " "));
    }
  }
  // CSS font-family
  const ffRegex = /font-family:\s*["']?([^;"'}\n]+)/gi;
  while ((match = ffRegex.exec(html)) !== null) {
    const family = match[1].split(",")[0].trim().replace(/["']/g, "");
    if (family && !family.includes("inherit") && !family.includes("sans-serif") && !family.includes("serif")) {
      fonts.add(family);
    }
  }
  return [...fonts].slice(0, 5);
}

function extractInternalLinks(html: string, baseUrl: string): string[] {
  const links = new Set<string>();
  const regex = /<a[^>]+href=["']([^"'#]+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    let href = match[1].trim();

    // Resolve relative URLs
    if (href.startsWith("/")) {
      href = `${baseUrl}${href}`;
    }

    // Only internal links
    try {
      const parsed = new URL(href);
      const baseParsed = new URL(baseUrl);
      if (parsed.host === baseParsed.host) {
        links.add(href.split("?")[0].split("#")[0]); // Remove query/fragment
      }
    } catch {
      // Invalid URL — skip
    }
  }
  return [...links];
}

// ── Page Type Detection ──

function guessPageType(path: string, html?: string): PageTypeGuess {
  const lower = path.toLowerCase();

  // Shopify patterns
  if (lower === "/" || lower === "") return "landing";
  if (lower.includes("/products/")) return "product";
  if (lower.includes("/collections/") && !lower.endsWith("/collections") && !lower.endsWith("/collections/")) return "collection";
  if (lower.endsWith("/collections") || lower.endsWith("/collections/")) return "list-collections";
  if (lower.includes("/cart")) return "cart";
  if (lower.includes("/blogs/") || lower.includes("/blog/")) {
    return lower.match(/\/blogs?\/[^/]+\/[^/]+/) ? "article" : "blog";
  }
  if (lower.includes("/pages/about") || lower.includes("/about")) return "about";
  if (lower.includes("/pages/contact") || lower.includes("/contact")) return "contact";
  if (lower.includes("/search")) return "search";
  if (lower.includes("/account")) return "account";
  if (lower.includes("/pages/faq") || lower.includes("/faq")) return "faq";
  if (lower.includes("/policies/") || lower.includes("/legal") || lower.includes("/privacy") || lower.includes("/terms")) return "legal";

  // Generic patterns
  if (lower.includes("/product") || lower.includes("/item")) return "product";
  if (lower.includes("/categor") || lower.includes("/collection")) return "collection";

  // HTML-based detection
  if (html) {
    if (html.includes("add-to-cart") || html.includes("AddToCart") || html.includes("カートに追加")) return "product";
    if (html.includes("product-grid") || html.includes("collection-products")) return "collection";
  }

  return "general";
}

// ── Site Analysis ──

function extractSiteName(pages: CrawledPage[]): string {
  const topPage = pages.find((p) => p.path === "/" || p.depth === 0);
  if (topPage?.title) {
    // Remove common suffixes
    return topPage.title
      .replace(/\s*[-–—|]\s*.+$/, "")
      .replace(/\s*\(.+\)$/, "")
      .trim();
  }
  return "";
}

function analyzeUnifiedDesign(pages: CrawledPage[]): SiteStructure["unifiedDesign"] {
  // Aggregate colors across all pages
  const colorCounts = new Map<string, number>();
  for (const page of pages) {
    for (const color of page.colors) {
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
    }
  }
  const dominantColors = [...colorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => color);

  // Aggregate fonts
  const fontCounts = new Map<string, number>();
  for (const page of pages) {
    for (const font of page.fonts) {
      fontCounts.set(font, (fontCounts.get(font) || 0) + 1);
    }
  }
  const fonts = [...fontCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([font]) => font);

  return {
    dominantColors,
    fonts,
    tones: ["modern"], // Default — will be refined by Design Director
  };
}

// ── Tree Building ──

function buildSiteTree(pages: CrawledPage[], rootPath: string): SiteTreeNode {
  const okPages = pages.filter((p) => p.status === "ok");

  const root: SiteTreeNode = {
    path: rootPath,
    title: okPages.find((p) => p.path === rootPath || p.path === "/")?.title || "ホーム",
    pageType: "landing",
    children: [],
  };

  // Group by first path segment
  const groups = new Map<string, CrawledPage[]>();
  for (const page of okPages) {
    if (page.path === "/" || page.path === rootPath) continue;
    const segments = page.path.split("/").filter(Boolean);
    const firstSegment = segments[0] || "other";
    if (!groups.has(firstSegment)) groups.set(firstSegment, []);
    groups.get(firstSegment)!.push(page);
  }

  for (const [segment, groupPages] of groups) {
    if (groupPages.length === 1) {
      // Single page in this group
      const page = groupPages[0];
      root.children.push({
        path: page.path,
        title: page.title || page.path,
        pageType: page.pageType,
        children: [],
      });
    } else {
      // Multiple pages — create a group node
      const groupNode: SiteTreeNode = {
        path: `/${segment}`,
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        pageType: guessPageType(`/${segment}`),
        children: groupPages.map((p) => ({
          path: p.path,
          title: p.title || p.path,
          pageType: p.pageType,
          children: [],
        })),
      };
      root.children.push(groupNode);
    }
  }

  return root;
}

// ── URL Utilities ──

function normalizeUrl(url: string, baseUrl: string): string {
  try {
    const parsed = new URL(url, baseUrl);
    // Remove trailing slash, query params, and fragments
    let normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    if (normalized.endsWith("/") && normalized !== `${parsed.protocol}//${parsed.host}/`) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return url;
  }
}

function shouldSkipUrl(url: string): boolean {
  const lower = url.toLowerCase();
  const skipPatterns = [
    "/cdn-cgi/",
    "/wp-json/",
    "/wp-admin/",
    "/xmlrpc",
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".svg",
    ".webp",
    ".css",
    ".js",
    ".xml",
    ".json",
    "/cart/",
    "/checkout",
    "/account/",
    "/admin/",
    "/login",
    "/register",
    "mailto:",
    "tel:",
    "javascript:",
  ];
  return skipPatterns.some((p) => lower.includes(p));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
