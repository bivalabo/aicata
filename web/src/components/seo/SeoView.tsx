"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Search,
  Globe,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Eye,
} from "lucide-react";
import clsx from "clsx";

// ── Types ──

interface PageSeoInfo {
  id: string;
  title: string;
  slug: string;
  pageType: string;
  hasHtml: boolean;
  seo: {
    titleTag: string | null;
    metaDescription: string | null;
    h1Count: number;
    imgAltMissing: number;
    wordCount: number;
    score: number; // 0-100
  };
}

// ── SEO Analyzer (client-side) ──

function analyzeSeo(html: string, title: string): PageSeoInfo["seo"] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Title tag
  const titleTag = doc.querySelector("title")?.textContent?.trim() || title || null;

  // Meta description
  const metaDesc =
    doc.querySelector('meta[name="description"]')?.getAttribute("content") || null;

  // H1 count
  const h1Count = doc.querySelectorAll("h1").length;

  // Images without alt
  const allImgs = doc.querySelectorAll("img");
  let imgAltMissing = 0;
  allImgs.forEach((img) => {
    if (!img.getAttribute("alt")?.trim()) imgAltMissing++;
  });

  // Word count (rough, text content)
  const textContent = doc.body?.textContent || "";
  const wordCount = textContent
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  // Score calculation
  let score = 0;
  if (titleTag && titleTag.length >= 10 && titleTag.length <= 60) score += 25;
  else if (titleTag) score += 10;
  if (metaDesc && metaDesc.length >= 50 && metaDesc.length <= 160) score += 25;
  else if (metaDesc) score += 10;
  if (h1Count === 1) score += 20;
  else if (h1Count > 0) score += 10;
  if (imgAltMissing === 0 && allImgs.length > 0) score += 15;
  else if (imgAltMissing === 0) score += 15;
  else score += Math.max(0, 15 - imgAltMissing * 3);
  if (wordCount > 300) score += 15;
  else if (wordCount > 100) score += 10;
  else if (wordCount > 50) score += 5;

  return {
    titleTag,
    metaDescription: metaDesc,
    h1Count,
    imgAltMissing,
    wordCount,
    score: Math.min(100, Math.max(0, score)),
  };
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : score >= 50
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-red-600 bg-red-50 border-red-200";
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold border",
        color
      )}
    >
      {score}
    </span>
  );
}

// ── Main Component ──

export default function SeoView() {
  const [pages, setPages] = useState<PageSeoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<PageSeoInfo | null>(null);

  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pages");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();

      // For each page with HTML, fetch full page and analyze SEO
      const analyzed: PageSeoInfo[] = [];
      for (const p of data.pages || []) {
        if (!p.hasHtml) continue;
        try {
          const pageRes = await fetch(`/api/pages/${p.id}`);
          if (!pageRes.ok) continue;
          const pageData = await pageRes.json();
          const html = pageData.page?.html || "";
          const seo = analyzeSeo(html, p.title);
          analyzed.push({
            id: p.id,
            title: p.title,
            slug: p.slug || "",
            pageType: p.pageType || "general",
            hasHtml: true,
            seo,
          });
        } catch {
          // Skip pages that fail to load
        }
      }

      // Sort by score ascending (worst first)
      analyzed.sort((a, b) => a.seo.score - b.seo.score);
      setPages(analyzed);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const avgScore =
    pages.length > 0
      ? Math.round(pages.reduce((sum, p) => sum + p.seo.score, 0) / pages.length)
      : 0;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Search className="w-5 h-5 text-accent" />
              SEO分析
            </h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              作成したページのSEOスコアを分析し、改善点を表示します
            </p>
          </div>
          <button
            onClick={loadPages}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] text-muted-foreground border border-border/40 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
            更新
          </button>
        </div>

        {/* Summary cards */}
        {!loading && pages.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl border border-border/40 bg-white/60">
              <p className="text-[12px] text-muted-foreground">ページ数</p>
              <p className="text-2xl font-bold text-foreground mt-1">{pages.length}</p>
            </div>
            <div className="p-4 rounded-2xl border border-border/40 bg-white/60">
              <p className="text-[12px] text-muted-foreground">平均スコア</p>
              <p className="text-2xl font-bold text-foreground mt-1 flex items-center gap-2">
                {avgScore}
                <span className="text-[12px] font-normal text-muted-foreground">/100</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-border/40 bg-white/60">
              <p className="text-[12px] text-muted-foreground">要改善</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {pages.filter((p) => p.seo.score < 60).length}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-[14px]">ページを分析中...</span>
          </div>
        )}

        {/* Empty */}
        {!loading && pages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-[14px] text-muted-foreground">
              分析するページがありません。<br />
              ページ制作からページを作成してください。
            </p>
          </div>
        )}

        {/* Page list */}
        {!loading && pages.length > 0 && (
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-foreground">ページ別スコア</p>
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() =>
                  setSelectedPage(selectedPage?.id === page.id ? null : page)
                }
                className={clsx(
                  "w-full text-left p-4 rounded-2xl border transition-all",
                  selectedPage?.id === page.id
                    ? "border-accent/40 bg-accent/5"
                    : "border-border/40 bg-white/60 hover:bg-white/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <ScoreBadge score={page.seo.score} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-foreground truncate">
                      {page.title}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {page.pageType} · {page.seo.wordCount}語
                    </p>
                  </div>
                  {page.seo.score < 60 && (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>

                {/* Detail panel */}
                {selectedPage?.id === page.id && (
                  <div className="mt-3 pt-3 border-t border-border/20 space-y-2">
                    <SeoCheckItem
                      label="タイトルタグ"
                      value={page.seo.titleTag || "未設定"}
                      ok={!!page.seo.titleTag && page.seo.titleTag.length <= 60}
                      hint={
                        !page.seo.titleTag
                          ? "タイトルタグを設定してください"
                          : page.seo.titleTag.length > 60
                            ? `${page.seo.titleTag.length}文字 — 60文字以内が推奨`
                            : `${page.seo.titleTag.length}文字`
                      }
                    />
                    <SeoCheckItem
                      label="メタディスクリプション"
                      value={
                        page.seo.metaDescription
                          ? page.seo.metaDescription.slice(0, 80) + "..."
                          : "未設定"
                      }
                      ok={
                        !!page.seo.metaDescription &&
                        page.seo.metaDescription.length >= 50
                      }
                      hint={
                        !page.seo.metaDescription
                          ? "メタディスクリプションを追加してください"
                          : `${page.seo.metaDescription.length}文字`
                      }
                    />
                    <SeoCheckItem
                      label="H1タグ"
                      value={`${page.seo.h1Count}個`}
                      ok={page.seo.h1Count === 1}
                      hint={
                        page.seo.h1Count === 0
                          ? "H1タグを1つ追加してください"
                          : page.seo.h1Count > 1
                            ? "H1タグは1ページに1つが推奨"
                            : "OK"
                      }
                    />
                    <SeoCheckItem
                      label="画像alt属性"
                      value={
                        page.seo.imgAltMissing === 0
                          ? "すべて設定済み"
                          : `${page.seo.imgAltMissing}枚 未設定`
                      }
                      ok={page.seo.imgAltMissing === 0}
                      hint={
                        page.seo.imgAltMissing > 0
                          ? "画像にalt属性を追加してください"
                          : "OK"
                      }
                    />
                    <SeoCheckItem
                      label="コンテンツ量"
                      value={`${page.seo.wordCount}語`}
                      ok={page.seo.wordCount >= 300}
                      hint={
                        page.seo.wordCount < 100
                          ? "コンテンツが少なすぎます"
                          : page.seo.wordCount < 300
                            ? "300語以上が推奨"
                            : "十分なコンテンツ量です"
                      }
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SeoCheckItem({
  label,
  value,
  ok,
  hint,
}: {
  label: string;
  value: string;
  ok: boolean;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-2 text-[12px]">
      {ok ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
      ) : (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <span className="font-medium text-foreground">{label}: </span>
        <span className="text-muted-foreground">{value}</span>
        <p className="text-muted-foreground/70 mt-0.5">{hint}</p>
      </div>
    </div>
  );
}
