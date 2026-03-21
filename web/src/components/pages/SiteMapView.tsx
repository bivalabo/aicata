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
  List,
  Map,
  Globe,
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
}

// ── View modes ──
type ViewMode = "board" | "canvas" | "list";

export default function SiteMapView({
  onNavigateToChat,
  onCreatePageByType,
  onEditPage,
  onEnhancePage,
}: SiteMapViewProps) {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [deploying, setDeploying] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [storeConnected, setStoreConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
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
      const syncedCount = data.shopifyPageCount || 0;
      showToast(
        syncedCount > 0
          ? `Shopify同期が完了しました（${syncedCount}ページ）`
          : "Shopify同期が完了しました",
        "success",
      );
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

  // ── Group pages by column ──

  const columnPages = useMemo(() => {
    const grouped: Record<string, PageItem[]> = {};
    for (const col of COLUMNS) {
      grouped[col.id] = [];
    }
    for (const page of pages) {
      const pt = page.pageType || "general";
      const col = COLUMNS.find((c) => c.pageTypes.includes(pt));
      if (col) {
        grouped[col.id].push(page);
      } else {
        grouped["utility"].push(page);
      }
    }
    return grouped;
  }, [pages]);

  // ── Render ──

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="shrink-0 px-8 pt-14 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              サイトマップ
            </h1>
            <p className="text-[15px] text-muted-foreground">
              {pages.length}件のページ — カテゴリごとにサイト構成を俯瞰
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
                title="ボードビュー"
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
                title="キャンバスビュー"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={clsx(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="リストビュー"
              >
                <List className="w-3.5 h-3.5" />
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
              サイト一括リビルド
            </button>
            <button
              onClick={onNavigateToChat}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-medium text-white bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] hover:shadow-md hover:shadow-accent/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              AIでページ作成
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
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/60 border border-amber-200/40">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[12px] text-amber-700">
              Shopifyストアが未接続です。設定画面から接続するとデプロイや同期が可能になります。
            </p>
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
        /* ── List view (fallback) ── */
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {pages.length === 0 ? (
            <EmptyState onCreatePage={onNavigateToChat} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-2">
              {pages.map((page) => (
                <ListRow
                  key={page.id}
                  page={page}
                  storeConnected={storeConnected}
                  onPreview={handlePreview}
                  onEdit={onEditPage}
                  onDeploy={handleDeploy}
                  onDelete={handleDelete}
                  deploying={deploying}
                  deleting={deleting}
                />
              ))}
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
        AIに話しかけて、最初のページを作りましょう
      </p>
      {onCreatePage && (
        <button
          onClick={onCreatePage}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] hover:shadow-lg hover:shadow-accent/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          AIでページ作成
        </button>
      )}
    </div>
  );
}

// ── Simple list row (for list view mode) ──

import {
  Eye,
  Pencil,
  Upload,
  Trash2,
  ExternalLink,
  Clock,
} from "lucide-react";
import { PAGE_TYPE_LABELS } from "./PageCard";

function ListRow({
  page,
  storeConnected,
  onPreview,
  onEdit,
  onDeploy,
  onDelete,
  deploying,
  deleting,
}: {
  page: PageItem;
  storeConnected: boolean;
  onPreview: (id: string) => void;
  onEdit?: (conversationId: string) => void;
  onDeploy: (id: string) => void;
  onDelete: (page: PageItem) => void;
  deploying: string | null;
  deleting: string | null;
}) {
  const isPublished =
    page.status === "published" ||
    (page.status === "synced" && page.shopifyPublished);

  return (
    <div className="group rounded-2xl border border-border/50 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center gap-4 px-5 py-3.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-[14px] font-semibold text-foreground truncate">
              {page.title}
            </h3>
            {page.source === "shopify" ? (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-600 bg-emerald-50">
                <ShoppingBag className="w-2.5 h-2.5" />
                Shopify
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-violet-600 bg-violet-50">
                <Sparkles className="w-2.5 h-2.5" />
                Aicata
              </span>
            )}
            {page.pageType && page.pageType !== "general" && (
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">
                {PAGE_TYPE_LABELS[page.pageType] || page.pageType}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
            {isPublished ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <Globe className="w-3 h-3" /> 公開中
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> 下書き
              </span>
            )}
            {page.slug && <span>/pages/{page.slug}</span>}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {page.hasHtml && (
            <button
              onClick={() => onPreview(page.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-all opacity-0 group-hover:opacity-100"
              title="プレビュー"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          {page.conversationId && onEdit && (
            <button
              onClick={() => onEdit(page.conversationId!)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-all opacity-0 group-hover:opacity-100"
              title="編集"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {storeConnected && page.hasHtml && (
            <button
              onClick={() => onDeploy(page.id)}
              disabled={deploying === page.id}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-foreground bg-black/[0.04] hover:bg-black/[0.07] transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
            >
              {deploying === page.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Upload className="w-3 h-3" />
              )}
              {page.shopifyPageId ? "更新" : "デプロイ"}
            </button>
          )}
          {page.source === "aicata" && (
            <button
              onClick={() => onDelete(page)}
              disabled={deleting === page.id}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
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
      </div>
    </div>
  );
}
