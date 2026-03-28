"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  FileText,
  Settings,
  RefreshCw,
  Sparkles,
  Loader2,
  AlertCircle,
  Map,
  Globe,
  Search,
  Table2,
  ArrowUpDown,
  X,
} from "lucide-react";
import clsx from "clsx";
import SiteMapColumn from "./SiteMapColumn";
import SiteMapCanvas from "./SiteMapCanvas";
import SiteRebuildFlow from "./SiteRebuildFlow";
import type { PageItem } from "./PageCard";
import { buildFullHtml } from "@/components/preview/LivePreview";

// ── Column definitions ──

interface ColumnDef {
  id: string;
  title: string;
  icon: typeof Home;
  color: string;
  pageTypes: string[];
}

const COLUMNS: ColumnDef[] = [
  {
    id: "top",
    title: "トップ",
    icon: Home,
    color: "bg-gradient-to-br from-violet-500 to-violet-600",
    pageTypes: ["landing"],
  },
  {
    id: "collections",
    title: "コレクション",
    icon: LayoutGrid,
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    pageTypes: ["collection", "list-collections"],
  },
  {
    id: "products",
    title: "商品",
    icon: ShoppingBag,
    color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    pageTypes: ["product"],
  },
  {
    id: "content",
    title: "コンテンツ",
    icon: FileText,
    color: "bg-gradient-to-br from-amber-500 to-amber-600",
    pageTypes: ["about", "contact", "blog", "article"],
  },
  {
    id: "utility",
    title: "ユーティリティ",
    icon: Settings,
    color: "bg-gradient-to-br from-gray-400 to-gray-500",
    pageTypes: ["cart", "search", "account", "password", "404", "general"],
  },
];

// ── Props ──

interface SiteMapViewProps {
  onNavigateToChat?: () => void;
  /** ページタイプ指定で新規作成を開始 */
  onCreatePageByType?: (pageType: string) => void;
  onEditPage?: (conversationId: string) => void;
  /** AIで改善: ページIDからconversation作成→チャットへ遷移 */
  onEnhancePage?: (pageId: string) => void;
  /** StudioView内に埋め込まれている場合 true — 独自ヘッダーをコンパクト化 */
  embedded?: boolean;
}

// ── View modes ──
type ViewMode = "board" | "canvas" | "table";

// ── Filter / Sort ──
type SortKey = "updatedAt" | "title" | "status" | "pageType";
type SortDir = "asc" | "desc";
type FilterSource = "all" | "shopify" | "aicata";
type FilterStatus = "all" | "published" | "draft";

export default function SiteMapView({
  onNavigateToChat,
  onCreatePageByType,
  onEditPage,
  onEnhancePage,
  embedded = false,
}: SiteMapViewProps) {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [deploying, setDeploying] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [storeConnected, setStoreConnected] = useState(false);
  const [shopSlug, setShopSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState<FilterSource>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showRebuildFlow, setShowRebuildFlow] = useState(false);
  // ── Toast notification ──
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };
  const [batchDeploying, setBatchDeploying] = useState(false);
  const [batchDeployResult, setBatchDeployResult] = useState<{
    successCount: number;
    totalCount: number;
  } | null>(null);

  // ── Data fetching ──

  const fetchPages = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/pages");
      const data = await res.json();
      setPages((data.pages || []) as PageItem[]);
    } catch {
      setError("ページの取得に失敗しました");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  const checkStoreConnection = useCallback(async () => {
    try {
      const res = await fetch("/api/shopify/store");
      const data = await res.json();
      setStoreConnected(data.connected);
      if (data.connected && data.store?.shop) {
        // "bivalabo-dev-2.myshopify.com" → "bivalabo-dev-2"
        setShopSlug(data.store.shop.replace(/\.myshopify\.com$/, ""));
      }
    } catch {
      setStoreConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
    checkStoreConnection();
  }, [fetchPages, checkStoreConnection]);

  // ── Actions ──

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/shopify/pages");
      const data = await res.json();
      await fetchPages();
      const details = data.syncDetails;
      if (details) {
        const parts: string[] = [];
        if (details.pages > 0) parts.push(`ページ${details.pages}件`);
        if (details.products > 0) parts.push(`商品${details.products}件`);
        if (details.collections > 0) parts.push(`コレクション${details.collections}件`);
        showToast(
          parts.length > 0
            ? `Shopify同期完了（${parts.join("、")}）`
            : "Shopify同期が完了しました",
          "success",
        );
      } else {
        const syncedCount = data.shopifyPageCount || 0;
        showToast(
          syncedCount > 0
            ? `Shopify同期が完了しました（${syncedCount}件）`
            : "Shopify同期が完了しました",
          "success",
        );
      }
    } catch {
      showToast("同期に失敗しました");
      setSyncing(false);
    }
  };

  const handleDeploy = async (pageId: string) => {
    setDeploying(pageId);
    try {
      const res = await fetch("/api/shopify/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const data = await res.json();
      if (data.error) {
        if (
          data.error.includes("テンプレート") ||
          data.error.includes("template")
        ) {
          const fallbackRes = await fetch("/api/shopify/pages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pageId, publish: true }),
          });
          const fallbackData = await fallbackRes.json();
          if (fallbackData.error) showToast(fallbackData.error);
          else await fetchPages();
        } else {
          showToast(data.error);
        }
      } else {
        if (data.previewUrl) {
          showToast("デプロイが完了しました", "success");
          if (data.previewUrl) {
            window.open(data.previewUrl, "_blank");
          }
        }
        await fetchPages();
      }
    } catch {
      showToast("デプロイに失敗しました");
    } finally {
      setDeploying(null);
    }
  };

  const handleDelete = async (page: PageItem) => {
    if (!confirm(`「${page.title}」を削除しますか？`)) return;
    setDeleting(page.id);
    try {
      await fetch(`/api/pages/${page.id}`, { method: "DELETE" });
      await fetchPages();
    } catch {
      showToast("削除に失敗しました");
    } finally {
      setDeleting(null);
    }
  };

  const handlePreview = async (pageId: string) => {
    try {
      const res = await fetch(`/api/pages/${pageId}`);
      const data = await res.json();
      if (data.page) {
        // Shopify同期ページはCSSがない場合がある — 基本スタイルを補完
        const css = data.page.css || "";
        const shopifyBaseCss = !css.trim()
          ? `
            body { max-width: 800px; margin: 0 auto; padding: 32px 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", sans-serif; line-height: 1.8; color: #333; }
            h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; color: #111; }
            h1 { font-size: 28px; } h2 { font-size: 22px; } h3 { font-size: 18px; }
            p { margin-bottom: 1em; }
            a { color: #7c5cfc; }
            img { max-width: 100%; border-radius: 8px; margin: 1em 0; }
            ul, ol { padding-left: 1.5em; margin-bottom: 1em; }
          `
          : css;
        const fullHtml = buildFullHtml(data.page.html, shopifyBaseCss);
        const blob = new Blob([fullHtml], {
          type: "text/html;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      showToast("プレビューの取得に失敗しました");
    }
  };

  // ── Batch Deploy ──
  const handleBatchDeploy = useCallback(async () => {
    const deployablePages = pages.filter(
      (p) => p.hasHtml && p.source === "aicata",
    );
    if (deployablePages.length === 0) return;

    if (
      !confirm(
        `${deployablePages.length}ページをShopifyに一括デプロイしますか？`,
      )
    )
      return;

    setBatchDeploying(true);
    setBatchDeployResult(null);
    try {
      const res = await fetch("/api/site-rebuild/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageIds: deployablePages.map((p) => p.id),
        }),
      });
      const data = await res.json();
      if (data.error) {
        showToast(data.error);
      } else {
        setBatchDeployResult({
          successCount: data.successCount,
          totalCount: data.totalCount,
        });
        await fetchPages();
        // Auto-dismiss after 5 seconds
        setTimeout(() => setBatchDeployResult(null), 5000);
      }
    } catch {
      showToast("一括デプロイに失敗しました");
    } finally {
      setBatchDeploying(false);
    }
  }, [pages, fetchPages]);

  const deployableCount = pages.filter(
    (p) => p.hasHtml && p.source === "aicata",
  ).length;

  // ── Filtered & sorted pages ──

  const filteredPages = useMemo(() => {
    let result = [...pages];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.slug && p.slug.toLowerCase().includes(q)),
      );
    }

    // Filter by source
    if (filterSource !== "all") {
      result = result.filter((p) => p.source === filterSource);
    }

    // Filter by status
    if (filterStatus === "published") {
      result = result.filter(
        (p) =>
          p.status === "published" ||
          (p.status === "synced" && p.shopifyPublished),
      );
    } else if (filterStatus === "draft") {
      result = result.filter(
        (p) =>
          p.status === "draft" ||
          (p.status === "synced" && !p.shopifyPublished),
      );
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title, "ja");
          break;
        case "status":
          cmp = (a.status || "").localeCompare(b.status || "");
          break;
        case "pageType":
          cmp = (a.pageType || "").localeCompare(b.pageType || "");
          break;
        default:
          cmp =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [pages, searchQuery, filterSource, filterStatus, sortKey, sortDir]);

  // ── Group pages by column ──

  const columnPages = useMemo(() => {
    const grouped: Record<string, PageItem[]> = {};
    for (const col of COLUMNS) {
      grouped[col.id] = [];
    }
    for (const page of filteredPages) {
      const pt = page.pageType || "general";
      const col = COLUMNS.find((c) => c.pageTypes.includes(pt));
      if (col) {
        grouped[col.id].push(page);
      } else {
        grouped["utility"].push(page);
      }
    }
    return grouped;
  }, [filteredPages]);

  // ── Render ──

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className={clsx("shrink-0 px-8 pb-4", embedded ? "pt-4" : "pt-14")}>
        <div className="flex items-center justify-between mb-3">
          <div>
            {!embedded && (
              <h1 className="text-2xl font-bold text-foreground mb-1">
                サイトマップ
              </h1>
            )}
            <p className={clsx("text-muted-foreground", embedded ? "text-[13px]" : "text-[15px]")}>
              {filteredPages.length === pages.length
                ? `${pages.length}件のページ`
                : `${filteredPages.length} / ${pages.length}件のページ`}
              {!embedded && " — カテゴリごとにサイト構成を俯瞰"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex gap-0.5 bg-black/[0.04] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("board")}
                className={clsx(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "board"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="ボード"
              >
                <Map className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("canvas")}
                className={clsx(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "canvas"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="キャンバス"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={clsx(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "table"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="テーブル"
              >
                <Table2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {storeConnected && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium text-foreground bg-black/[0.04] hover:bg-black/[0.07] transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={clsx("w-4 h-4", syncing && "animate-spin")}
                />
                Shopify同期
              </button>
            )}

            {/* 一括デプロイ */}
            {storeConnected && deployableCount > 0 && (
              <button
                onClick={handleBatchDeploy}
                disabled={batchDeploying}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium text-foreground bg-black/[0.04] hover:bg-black/[0.07] transition-colors disabled:opacity-50"
              >
                {batchDeploying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
                一括デプロイ ({deployableCount})
              </button>
            )}

            <button
              onClick={() => setShowRebuildFlow(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-medium text-foreground border border-accent/30 bg-accent/[0.04] hover:bg-accent/[0.08] transition-all"
            >
              <Globe className="w-4 h-4 text-accent" />
              サイトリデザイン提案
            </button>
            <button
              onClick={onNavigateToChat}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-medium text-white bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] hover:shadow-md hover:shadow-accent/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              ページ作成
            </button>
          </div>
        </div>

        {/* Errors & hints */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50/60 border border-red-200/40 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-[14px] text-red-700">{error}</p>
          </div>
        )}
        {!storeConnected && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/60 border border-amber-200/40 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[12px] text-amber-700">
              Shopifyストアが未接続です。設定画面から接続するとデプロイや同期が可能になります。
            </p>
          </div>
        )}

        {/* ── Search & Filter bar ── */}
        {pages.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-[320px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ページを検索..."
                className="w-full pl-8 pr-8 py-2 text-[13px] rounded-lg border border-border/60 bg-white/60 focus:bg-white focus:border-accent/40 focus:ring-1 focus:ring-accent/20 outline-none transition-all placeholder:text-muted-foreground/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground/40 hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Source filter */}
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as FilterSource)}
              className="px-3 py-2 text-[12px] rounded-lg border border-border/60 bg-white/60 text-foreground outline-none focus:border-accent/40 transition-colors cursor-pointer"
            >
              <option value="all">すべてのソース</option>
              <option value="shopify">Shopify</option>
              <option value="aicata">Aicata</option>
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-3 py-2 text-[12px] rounded-lg border border-border/60 bg-white/60 text-foreground outline-none focus:border-accent/40 transition-colors cursor-pointer"
            >
              <option value="all">すべてのステータス</option>
              <option value="published">公開中</option>
              <option value="draft">下書き</option>
            </select>

            {/* Active filter indicator */}
            {(searchQuery || filterSource !== "all" || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterSource("all");
                  setFilterStatus("all");
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-accent bg-accent/[0.06] hover:bg-accent/[0.1] rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                フィルター解除
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Board view ── */}
      {viewMode === "board" ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 pb-4">
          {pages.length === 0 ? (
            <EmptyState onCreatePage={onNavigateToChat} />
          ) : (
            <div className="flex gap-3 h-full min-w-min">
              {COLUMNS.map((col) => (
                <SiteMapColumn
                  key={col.id}
                  title={col.title}
                  icon={col.icon}
                  color={col.color}
                  pageType={col.pageTypes[0]}
                  pages={columnPages[col.id]}
                  storeConnected={storeConnected}
                  shopSlug={shopSlug}
                  onPreview={handlePreview}
                  onEdit={onEditPage}
                  onEnhance={onEnhancePage}
                  onDeploy={handleDeploy}
                  onDelete={handleDelete}
                  onCreatePage={(pt) => {
                    if (pt && onCreatePageByType) {
                      onCreatePageByType(pt);
                    } else {
                      onNavigateToChat?.();
                    }
                  }}
                  deploying={deploying}
                  deleting={deleting}
                />
              ))}
            </div>
          )}
        </div>
      ) : viewMode === "canvas" ? (
        /* ── Canvas view (zoomable tree) ── */
        <div className="flex-1 overflow-hidden relative">
          {pages.length === 0 ? (
            <EmptyState onCreatePage={onNavigateToChat} />
          ) : (
            <SiteMapCanvas
              pages={pages}
              storeConnected={storeConnected}
              onPreview={handlePreview}
              onEdit={onEditPage}
              onDeploy={handleDeploy}
              onDelete={handleDelete}
              deploying={deploying}
              deleting={deleting}
            />
          )}
        </div>
      ) : (
        /* ── Table view ── */
        <div className="flex-1 overflow-auto px-6 pb-6">
          {pages.length === 0 ? (
            <EmptyState onCreatePage={onNavigateToChat} />
          ) : (
            <div className="max-w-5xl mx-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border/40">
                    {(
                      [
                        ["title", "ページ名"],
                        ["pageType", "カテゴリ"],
                        ["status", "ステータス"],
                        ["updatedAt", "更新日"],
                      ] as [SortKey, string][]
                    ).map(([key, label]) => (
                      <th
                        key={key}
                        onClick={() => {
                          if (sortKey === key) {
                            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                          } else {
                            setSortKey(key);
                            setSortDir(key === "title" ? "asc" : "desc");
                          }
                        }}
                        className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                      >
                        <span className="inline-flex items-center gap-1">
                          {label}
                          {sortKey === key && (
                            <ArrowUpDown className="w-3 h-3 text-accent" />
                          )}
                        </span>
                      </th>
                    ))}
                    <th className="w-[100px]" />
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.map((page) => (
                    <TableRow
                      key={page.id}
                      page={page}
                      storeConnected={storeConnected}
                      shopSlug={shopSlug}
                      onPreview={handlePreview}
                      onEdit={onEditPage}
                      onEnhance={onEnhancePage}
                      onDeploy={handleDeploy}
                      onDelete={handleDelete}
                      deploying={deploying}
                      deleting={deleting}
                    />
                  ))}
                </tbody>
              </table>
              {filteredPages.length === 0 && pages.length > 0 && (
                <div className="text-center py-12 text-[13px] text-muted-foreground/60">
                  フィルター条件に一致するページがありません
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* ── 汎用トースト通知 ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div
            className={clsx(
              "flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md",
              toast.type === "success"
                ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
                : "bg-red-50/95 border-red-200 text-red-800",
            )}
          >
            {toast.type === "success" ? (
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span className="text-[13px] font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-current/50 hover:text-current transition-colors text-[16px] leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ── 一括デプロイ結果トースト ── */}
      {batchDeployResult && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full px-5 py-3 shadow-lg border border-emerald-100">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-[14px] font-medium text-foreground">
              {batchDeployResult.successCount}/{batchDeployResult.totalCount}
              ページをデプロイしました
            </span>
          </div>
        </div>
      )}

      {/* ── サイト一括リビルドモーダル ── */}
      {showRebuildFlow && (
        <SiteRebuildFlow
          onClose={() => setShowRebuildFlow(false)}
          onComplete={async (analyzedPages, context) => {
            console.log("[SiteRebuild] Complete:", {
              pages: analyzedPages.length,
              context,
            });
            // Brand Memoryにサイトクロール結果を保存
            try {
              await fetch("/api/brand-memory?action=learn-from-crawl", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  unifiedContext: context,
                  storeName: context.siteName,
                }),
              });
              console.log("[Brand Memory] Learned from site crawl");
            } catch {
              // Non-fatal
            }
            // 解析完了後にページ一覧をリフレッシュ
            fetchPages();
          }}
        />
      )}
    </div>
  );
}

// ── Empty state ──

function EmptyState({ onCreatePage }: { onCreatePage?: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center mb-4">
        <Map className="w-8 h-8 text-accent/40" />
      </div>
      <p className="text-[15px] text-muted-foreground mb-1">
        まだページがありません
      </p>
      <p className="text-[13px] text-muted-foreground/60 mb-4">
        最初のページを作りましょう
      </p>
      {onCreatePage && (
        <button
          onClick={onCreatePage}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] hover:shadow-lg hover:shadow-accent/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          ページ作成
        </button>
      )}
    </div>
  );
}

// ── Table row (for table view mode) ──

import {
  Eye,
  Pencil,
  Upload,
  Trash2,
  Clock,
} from "lucide-react";
import { PAGE_TYPE_LABELS } from "./PageCard";

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前`;
  if (diffDay < 7) return `${diffDay}日前`;
  return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

function TableRow({
  page,
  storeConnected,
  shopSlug,
  onPreview,
  onEdit,
  onEnhance,
  onDeploy,
  onDelete,
  deploying,
  deleting,
}: {
  page: PageItem;
  storeConnected: boolean;
  shopSlug?: string | null;
  onPreview: (id: string) => void;
  onEdit?: (conversationId: string) => void;
  onEnhance?: (pageId: string) => void;
  onDeploy: (id: string) => void;
  onDelete: (page: PageItem) => void;
  deploying: string | null;
  deleting: string | null;
}) {
  const isPublished =
    page.status === "published" ||
    (page.status === "synced" && page.shopifyPublished);

  return (
    <tr className="group border-b border-border/30 hover:bg-accent/[0.02] transition-colors">
      {/* ページ名 */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-foreground truncate max-w-[280px]">
            {page.title}
          </span>
          {page.source === "shopify" ? (
            <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold text-emerald-600 bg-emerald-50">
              <ShoppingBag className="w-2.5 h-2.5" />
              Shopify
            </span>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold text-violet-600 bg-violet-50">
              <Sparkles className="w-2.5 h-2.5" />
              Aicata
            </span>
          )}
        </div>
        {page.slug && (
          <span className="text-[11px] text-muted-foreground/50 mt-0.5 block">
            /{page.slug}
          </span>
        )}
      </td>

      {/* カテゴリ */}
      <td className="px-3 py-3">
        <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-medium">
          {PAGE_TYPE_LABELS[page.pageType || "general"] || page.pageType || "汎用"}
        </span>
      </td>

      {/* ステータス */}
      <td className="px-3 py-3">
        {isPublished ? (
          <span className="flex items-center gap-1 text-[12px] text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            公開中
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            下書き
          </span>
        )}
      </td>

      {/* 更新日 */}
      <td className="px-3 py-3 text-[12px] text-muted-foreground/70">
        {formatRelativeDate(page.updatedAt)}
      </td>

      {/* アクション */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {page.hasHtml && (
            <button
              onClick={() => onPreview(page.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-all"
              title="プレビュー"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          {onEnhance && (
            <button
              onClick={() => onEnhance(page.id)}
              className="p-1.5 rounded-lg text-accent hover:bg-accent/[0.06] transition-all"
              title="ページ編集"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
          {page.conversationId && onEdit && (
            <button
              onClick={() => onEdit(page.conversationId!)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-all"
              title="会話を開く"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {storeConnected && page.hasHtml && (
            <button
              onClick={() => onDeploy(page.id)}
              disabled={deploying === page.id}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-all disabled:opacity-50"
              title={page.shopifyPageId ? "Shopify更新" : "デプロイ"}
            >
              {deploying === page.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          {page.source === "aicata" && (
            <button
              onClick={() => onDelete(page)}
              disabled={deleting === page.id}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
              title="削除"
            >
              {deleting === page.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
