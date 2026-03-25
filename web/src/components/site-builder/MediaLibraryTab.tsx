"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  ChevronDown,
  Film,
  FileImage,
  Copy,
  Check,
} from "lucide-react";
import clsx from "clsx";

// ── Types ──

interface MediaAsset {
  id: string;
  sourceUrl: string;
  shopifyCdnUrl: string | null;
  shopifyFileId: string | null;
  status: string;
  context: string | null;
  alt: string | null;
  mimeType: string | null;
  sourceDomain: string | null;
  pageId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ShopifyFile {
  id: string;
  alt: string | null;
  url: string | null;
  mimeType: string;
  fileStatus: string;
  createdAt: string;
  width?: number;
  height?: number;
  duration?: number;
  originalSource?: string;
}

type ViewSource = "aicata" | "shopify";
type StatusFilter = "all" | "pending" | "uploading" | "uploaded" | "failed";

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  pending: { label: "待機中", icon: Clock, color: "text-amber-500" },
  uploading: { label: "アップロード中", icon: Loader2, color: "text-blue-500" },
  uploaded: { label: "完了", icon: CheckCircle2, color: "text-emerald-500" },
  failed: { label: "失敗", icon: XCircle, color: "text-red-500" },
};

const CONTEXT_LABELS: Record<string, string> = {
  hero: "ヒーロー",
  product: "商品",
  logo: "ロゴ",
  background: "背景",
  content: "コンテンツ",
};

// ============================================================
// Main Component
// ============================================================

export default function MediaLibraryTab() {
  const [source, setSource] = useState<ViewSource>("aicata");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [shopifyFiles, setShopifyFiles] = useState<ShopifyFile[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusSummary, setStatusSummary] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [shopifyHasNext, setShopifyHasNext] = useState(false);
  const [shopifyCursor, setShopifyCursor] = useState<string | null>(null);

  // ── Fetch Aicata assets ──
  const fetchAicataAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/shopify/media?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "取得に失敗しました");
      setAssets(data.assets || []);
      setTotal(data.total || 0);
      setStatusSummary(data.statusSummary || {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // ── Fetch Shopify CDN files ──
  const fetchShopifyFiles = useCallback(async (cursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        source: "shopify",
        limit: "50",
      });
      if (cursor) params.set("after", cursor);
      if (searchQuery) params.set("query", `${searchQuery} media_type:IMAGE status:READY`);

      const res = await fetch(`/api/shopify/media?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "取得に失敗しました");

      if (cursor) {
        setShopifyFiles((prev) => [...prev, ...(data.files || [])]);
      } else {
        setShopifyFiles(data.files || []);
      }
      setShopifyHasNext(data.hasNextPage || false);
      setShopifyCursor(data.endCursor || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (source === "aicata") {
      fetchAicataAssets();
    } else {
      fetchShopifyFiles();
    }
  }, [source, fetchAicataAssets, fetchShopifyFiles]);

  // ── Upload handler ──
  const handleUpload = async (url: string) => {
    if (!url.trim()) return;
    setUploading(true);
    try {
      const res = await fetch("/api/shopify/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "アップロードに失敗しました");
      setUploadUrl("");
      setShowUploadForm(false);
      // Refresh list
      if (source === "aicata") fetchAicataAssets();
      else fetchShopifyFiles();
    } catch (e) {
      setError(e instanceof Error ? e.message : "アップロードエラー");
    } finally {
      setUploading(false);
    }
  };

  // ── Batch upload pending assets ──
  const handleBatchUpload = async () => {
    const pendingIds = assets
      .filter((a) => a.status === "pending" || a.status === "failed")
      .map((a) => a.id);
    if (pendingIds.length === 0) return;
    setUploading(true);
    try {
      const res = await fetch("/api/shopify/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetIds: pendingIds.slice(0, 20) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "バッチアップロードに失敗しました");
      fetchAicataAssets();
    } catch (e) {
      setError(e instanceof Error ? e.message : "バッチアップロードエラー");
    } finally {
      setUploading(false);
    }
  };

  // ── Delete handler ──
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/shopify/media?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "削除に失敗しました");
      }
      fetchAicataAssets();
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除エラー");
    }
  };

  const pendingCount = (statusSummary.pending || 0) + (statusSummary.failed || 0);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Source Toggle + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-black/[0.04] rounded-xl p-1">
          <button
            onClick={() => setSource("aicata")}
            className={clsx(
              "px-4 py-2 rounded-lg text-[13px] font-medium transition-all",
              source === "aicata"
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FileImage className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            Aicataアセット
          </button>
          <button
            onClick={() => setSource("shopify")}
            className={clsx(
              "px-4 py-2 rounded-lg text-[13px] font-medium transition-all",
              source === "shopify"
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ExternalLink className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            Shopify CDN
          </button>
        </div>

        <div className="flex-1" />

        {/* Upload button */}
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
        >
          <Upload className="w-4 h-4" />
          アップロード
        </button>

        {/* Batch upload for pending */}
        {source === "aicata" && pendingCount > 0 && (
          <button
            onClick={handleBatchUpload}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-emerald-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            一括アップロード ({pendingCount}件)
          </button>
        )}

        {/* Refresh */}
        <button
          onClick={() => source === "aicata" ? fetchAicataAssets() : fetchShopifyFiles()}
          className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Upload form */}
      {showUploadForm && (
        <div className="flex gap-3 p-4 bg-black/[0.02] rounded-2xl border border-border">
          <input
            type="url"
            value={uploadUrl}
            onChange={(e) => setUploadUrl(e.target.value)}
            placeholder="画像URLを入力（例: https://images.unsplash.com/...）"
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            onKeyDown={(e) => e.key === "Enter" && handleUpload(uploadUrl)}
          />
          <button
            onClick={() => handleUpload(uploadUrl)}
            disabled={uploading || !uploadUrl.trim()}
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "送信"}
          </button>
        </div>
      )}

      {/* Status filter (Aicata only) */}
      {source === "aicata" && (
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "uploading", "uploaded", "failed"] as StatusFilter[]).map(
            (status) => {
              const count =
                status === "all"
                  ? total
                  : statusSummary[status] || 0;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all",
                    statusFilter === status
                      ? "bg-[var(--accent)] text-white"
                      : "bg-black/[0.04] text-muted-foreground hover:text-foreground",
                  )}
                >
                  {status === "all" ? "すべて" : STATUS_CONFIG[status]?.label || status}
                  {" "}
                  <span className="opacity-70">({count})</span>
                </button>
              );
            },
          )}
        </div>
      )}

      {/* Search (Shopify view) */}
      {source === "shopify" && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Shopifyファイルを検索..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            onKeyDown={(e) => e.key === "Enter" && fetchShopifyFiles()}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            ✕
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        </div>
      ) : source === "aicata" ? (
        /* ── Aicata Assets Grid ── */
        assets.length === 0 ? (
          <EmptyState message="メディアアセットがありません" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map((asset) => (
              <AicataAssetCard key={asset.id} asset={asset} onDelete={handleDelete} />
            ))}
          </div>
        )
      ) : (
        /* ── Shopify Files Grid ── */
        <>
          {shopifyFiles.length === 0 ? (
            <EmptyState message="Shopify CDN上のファイルが見つかりません" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {shopifyFiles.map((file) => (
                <ShopifyFileCard key={file.id} file={file} />
              ))}
            </div>
          )}
          {shopifyHasNext && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => shopifyCursor && fetchShopifyFiles(shopifyCursor)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium bg-black/[0.04] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
                もっと読み込む
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function AicataAssetCard({
  asset,
  onDelete,
}: {
  asset: MediaAsset;
  onDelete: (id: string) => void;
}) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const statusCfg = STATUS_CONFIG[asset.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;
  const displayUrl = asset.shopifyCdnUrl || asset.sourceUrl;
  const isImage = !asset.mimeType || asset.mimeType.startsWith("image/");

  const handleCopy = () => {
    if (displayUrl) {
      navigator.clipboard.writeText(displayUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        {isImage && displayUrl ? (
          <img
            src={displayUrl}
            alt={asset.alt || ""}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Film className="w-8 h-8 text-gray-300" />
          </div>
        )}

        {/* Status badge */}
        <div
          className={clsx(
            "absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-white/90 backdrop-blur-sm",
            statusCfg.color,
          )}
        >
          <StatusIcon className={clsx("w-3 h-3", asset.status === "uploading" && "animate-spin")} />
          {statusCfg.label}
        </div>

        {/* Action overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/90 hover:bg-white text-foreground transition-colors"
            title="URLをコピー"
          >
            {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
          {displayUrl && (
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/90 hover:bg-white text-foreground transition-colors"
              title="新しいタブで開く"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => onDelete(asset.id)}
            className="p-2 rounded-lg bg-white/90 hover:bg-red-50 text-red-500 transition-colors"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        {asset.alt && (
          <p className="text-[12px] text-foreground font-medium truncate">{asset.alt}</p>
        )}
        {asset.context && (
          <span className="inline-block px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-[11px] font-medium">
            {CONTEXT_LABELS[asset.context] || asset.context}
          </span>
        )}
        <p className="text-[11px] text-muted-foreground truncate">
          {asset.sourceDomain || new URL(asset.sourceUrl).hostname}
        </p>
      </div>
    </div>
  );
}

function ShopifyFileCard({ file }: { file: ShopifyFile }) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const isVideo = file.mimeType?.startsWith("video/");

  const handleCopy = () => {
    if (file.url) {
      navigator.clipboard.writeText(file.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        {!isVideo && file.url ? (
          <img
            src={file.url}
            alt={file.alt || ""}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Film className="w-8 h-8 text-gray-300" />
          </div>
        )}

        {/* Dimensions badge */}
        {file.width && file.height && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium">
            {file.width}×{file.height}
          </div>
        )}

        {/* Action overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/90 hover:bg-white text-foreground transition-colors"
            title="CDN URLをコピー"
          >
            {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
          {file.url && (
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/90 hover:bg-white text-foreground transition-colors"
              title="新しいタブで開く"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        {file.alt && (
          <p className="text-[12px] text-foreground font-medium truncate">{file.alt}</p>
        )}
        <p className="text-[11px] text-muted-foreground">
          {isVideo ? "動画" : "画像"}
          {file.duration ? ` · ${Math.round(file.duration)}s` : ""}
        </p>
        <p className="text-[10px] text-muted-foreground/70 truncate">
          {new Date(file.createdAt).toLocaleDateString("ja-JP")}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <ImageIcon className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-[14px] text-muted-foreground">{message}</p>
      <p className="text-[12px] text-muted-foreground/60 mt-1">
        ページを生成するか、画像URLを直接アップロードしてください
      </p>
    </div>
  );
}
