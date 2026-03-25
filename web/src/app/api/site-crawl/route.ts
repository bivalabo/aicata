// ============================================================
// Aicata — Site Crawler API
// サイトマップからページを発見し、ページタイプを分類する
// ============================================================

import { parse as parseHtml } from "node-html-parser";
import type { PageType } from "@/lib/design-engine/types";
import { validateExternalUrl } from "@/lib/url-validator";
import { checkRateLimit, ANALYSIS_RATE_LIMIT, rateLimitResponse } from "@/lib/rate-limiter";
import { apiErrorResponse } from "@/lib/api-error";

export const maxDuration = 60; // 最大60秒

// ── Discovered page type ──

interface DiscoveredPage {
  url: string;
  path: string;
  inferredType: PageType;
  title?: string;
  lastModified?: string;
}

interface CrawlResult {
  baseUrl: string;
  storeName?: string;
  pages: DiscoveredPage[];
  totalFound: number;
  crawlMethod: "sitemap" | "html-scan" | "shopify-patterns";
}

// ── Shopify URL pattern → PageType mapping ──

const SHOPIFY_PATH_PATTERNS: Array<{
  pattern: RegExp;
  type: PageType;
}> = [
  { pattern: /^\/$/, type: "landing" },
  { pattern: /^\/collections\/[^/]+$/, type: "collection" },
  { pattern: /^\/collections$/, type: "list-collections" },
  { pattern: /^\/products\/[^/]+$/, type: "product" },
  { pattern: /^\/cart$/, type: "cart" },
  { pattern: /^\/blogs\/[^/]+$/, type: "blog" },
  { pattern: /^\/blogs\/[^/]+\/[^/]+$/, type: "article" },
  { pattern: /^\/pages\/about/i, type: "about" },
  { pattern: /^\/pages\/contact/i, type: "contact" },
  { pattern: /^\/pages\/faq/i, type: "about" },
  { pattern: /^\/pages\/[^/]+$/, type: "about" },
  { pattern: /^\/search$/, type: "search" },
  { pattern: /^\/account/, type: "account" },
  { pattern: /^\/password$/, type: "password" },
];

function inferPageType(urlPath: string): PageType {
  for (const { pattern, type } of SHOPIFY_PATH_PATTERNS) {
    if (pattern.test(urlPath)) return type;
  }
  return "general";
}

// ── Sitemap XML parser ──

async function fetchSitemap(
  baseUrl: string,
): Promise<{ urls: string[]; method: "sitemap" | "html-scan" }> {
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  try {
    const res = await fetch(sitemapUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Aicata/1.0; +https://aicata.app)",
        Accept: "application/xml, text/xml, text/plain",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);

    const xml = await res.text();

    // Check if this is a sitemap index (Shopify pattern)
    if (xml.includes("<sitemapindex")) {
      return await parseSitemapIndex(xml, baseUrl);
    }

    // Regular sitemap
    const urls = extractUrlsFromSitemap(xml);
    return { urls, method: "sitemap" };
  } catch {
    console.log("[Site Crawl] Sitemap unavailable, falling back to HTML scan");
    return { urls: [], method: "html-scan" };
  }
}

async function parseSitemapIndex(
  xml: string,
  _baseUrl: string,
): Promise<{ urls: string[]; method: "sitemap" }> {
  // Extract child sitemap URLs
  const sitemapUrls: string[] = [];
  const locRegex = /<loc>\s*(.*?)\s*<\/loc>/gi;
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    sitemapUrls.push(match[1]);
  }

  // Fetch each child sitemap (limit to first 4 for speed: pages, collections, products, blogs)
  const allUrls: string[] = [];
  const relevantSitemaps = sitemapUrls
    .filter(
      (u) =>
        u.includes("sitemap_pages") ||
        u.includes("sitemap_collections") ||
        u.includes("sitemap_products") ||
        u.includes("sitemap_blogs") ||
        // Fallback: take first 4 if naming doesn't match Shopify pattern
        sitemapUrls.indexOf(u) < 4,
    )
    .slice(0, 6);

  for (const sitemapUrl of relevantSitemaps) {
    try {
      const res = await fetch(sitemapUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; Aicata/1.0; +https://aicata.app)",
        },
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const childXml = await res.text();
        const urls = extractUrlsFromSitemap(childXml);
        allUrls.push(...urls);
      }
    } catch {
      // Skip failed child sitemaps
    }
  }

  return { urls: allUrls, method: "sitemap" };
}

function extractUrlsFromSitemap(xml: string): string[] {
  const urls: string[] = [];
  // Skip image:loc tags by matching only top-level <loc> within <url>
  const urlBlockRegex = /<url>\s*([\s\S]*?)\s*<\/url>/gi;
  let blockMatch;
  while ((blockMatch = urlBlockRegex.exec(xml)) !== null) {
    const block = blockMatch[1];
    const locMatch = block.match(/<loc>\s*(.*?)\s*<\/loc>/);
    if (locMatch) {
      urls.push(locMatch[1].trim());
    }
  }
  return urls;
}

// ── HTML fallback: scan homepage for links ──

async function scanHomepageLinks(baseUrl: string): Promise<string[]> {
  try {
    const res = await fetch(baseUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];

    const html = await res.text();
    const root = parseHtml(html, { comment: false });

    const links = new Set<string>();
    const parsedBase = new URL(baseUrl);

    root.querySelectorAll("a[href]").forEach((el) => {
      const href = el.getAttribute("href");
      if (!href) return;
      try {
        const resolved = new URL(href, baseUrl);
        // Only same-origin links
        if (resolved.hostname === parsedBase.hostname) {
          links.add(resolved.origin + resolved.pathname);
        }
      } catch {
        // Skip invalid URLs
      }
    });

    return Array.from(links);
  } catch {
    return [];
  }
}

// ── Shopify default pages (when no sitemap or scan found) ──

function getShopifyDefaultPages(baseUrl: string): string[] {
  return [
    baseUrl,
    `${baseUrl}/collections`,
    `${baseUrl}/cart`,
    `${baseUrl}/pages/about`,
    `${baseUrl}/pages/contact`,
    `${baseUrl}/blogs/news`,
  ];
}

// ── Extract store name from homepage ──

async function extractStoreName(baseUrl: string): Promise<string | undefined> {
  try {
    const res = await fetch(baseUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return undefined;
    const html = await res.text();
    const root = parseHtml(html, { comment: false });
    const title = root.querySelector("title")?.textContent?.trim();
    // Shopify titles often have "| Store Name" pattern
    if (title) {
      const parts = title.split(/\s*[\|–—-]\s*/);
      return parts[parts.length - 1]?.trim() || title;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

// ── Main handler ──

export async function POST(request: Request) {
  // Rate limiting (IP-based)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(`crawl:${ip}`, ANALYSIS_RATE_LIMIT);
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return Response.json({ error: "URLが必要です" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return Response.json({ error: "無効なURLです" }, { status: 400 });
    }

    // SSRF protection: validate external URL
    const validation = validateExternalUrl(parsedUrl.href);
    if (!validation.valid) {
      return Response.json(
        { error: validation.reason || "URLは許可されていません" },
        { status: 400 },
      );
    }

    const baseUrl = parsedUrl.origin;
    console.log("[Site Crawl] Starting crawl for:", baseUrl);

    // 1. Try sitemap.xml
    let { urls, method } = await fetchSitemap(baseUrl) as { urls: string[]; method: string };

    // 2. Fallback to HTML scan
    if (urls.length === 0) {
      urls = await scanHomepageLinks(baseUrl);
      method = "html-scan";
    }

    // 3. Fallback to Shopify default pages
    if (urls.length === 0) {
      urls = getShopifyDefaultPages(baseUrl);
      method = "shopify-patterns";
    }

    // Always include homepage
    if (!urls.some((u) => new URL(u).pathname === "/")) {
      urls.unshift(baseUrl);
    }

    // Deduplicate and filter
    const seen = new Set<string>();
    const uniqueUrls = urls.filter((u) => {
      try {
        const parsed = new URL(u);
        // Skip assets, images, etc.
        if (/\.(jpg|jpeg|png|gif|svg|webp|css|js|pdf|ico)$/i.test(parsed.pathname)) {
          return false;
        }
        // Skip admin/checkout
        if (/\/(admin|checkout|account\/)/i.test(parsed.pathname)) {
          return false;
        }
        const key = parsed.pathname.toLowerCase().replace(/\/$/, "") || "/";
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      } catch {
        return false;
      }
    });

    // Limit for safety (max 100 pages)
    const limitedUrls = uniqueUrls.slice(0, 100);

    // Classify pages
    const pages: DiscoveredPage[] = limitedUrls.map((pageUrl) => {
      const parsed = new URL(pageUrl);
      return {
        url: pageUrl,
        path: parsed.pathname || "/",
        inferredType: inferPageType(parsed.pathname),
      };
    });

    // Sort: landing first, then by type, then alphabetically
    const typeOrder: Record<string, number> = {
      landing: 0,
      collection: 1,
      "list-collections": 2,
      product: 3,
      about: 4,
      contact: 5,
      blog: 6,
      article: 7,
      cart: 8,
      search: 9,
      general: 10,
    };
    pages.sort((a, b) => {
      const oa = typeOrder[a.inferredType] ?? 99;
      const ob = typeOrder[b.inferredType] ?? 99;
      if (oa !== ob) return oa - ob;
      return a.path.localeCompare(b.path);
    });

    // Get store name (async, non-blocking — already have homepage data)
    const storeName = await extractStoreName(baseUrl);

    const result: CrawlResult = {
      baseUrl,
      storeName,
      pages,
      totalFound: uniqueUrls.length,
      crawlMethod: method as CrawlResult["crawlMethod"],
    };

    console.log(
      `[Site Crawl] Found ${pages.length} pages via ${method} for ${baseUrl}`,
    );

    return Response.json(result);
  } catch (error) {
    return apiErrorResponse(error, "Site Crawl");
  }
}
