"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Eye,
  Pencil,
  Upload,
  Trash2,
  ExternalLink,
  Loader2,
  Globe,
  ShoppingBag,
  Clock,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import clsx from "clsx";
import { buildFullHtml } from "@/components/preview/LivePreview";

// Module-level constant — never changes, avoids recreating on every render
const EMPTY_THUMBNAIL_HTML = buildFullHtml("", "", false);

export interface PageItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  source: string;
  version: number;
  versionCount: number;
  shopifyPageId: string | null;
  shopifyPublished: boolean;
  hasHtml: boolean;
  conversationId: string | null;
  conversationTitle: string | null;
  updatedAt: string;
  createdAt: string;
  pageType?: string;
  templateId?: string | null;
  liquidGenerated?: boolean;
}

interface PageCardProps {
  page: PageItem;
  storeConnected: boolean;
  /** Shopify管理画面URLのストアスラッグ */
  shopSlug?: string | null;
  onPreview: (pageId: string) => void;
  onEdit?: (conversationId: string) => void;
  /** Aicataで改善（既存ページをAI会話で編集開始） */
  onEnhance?: (pageId: string) => void;
  onDeploy: (pageId: string) => void;
  onDelete: (page: PageItem) => void;
  deploying: string | null;
  deleting: string | null;
}

/** shopifyPageId からShopify管理画面の正しいURLを生成 */
function getShopifyAdminUrl(
  shopSlug: string,
  shopifyPageId: string,
): string {
  if (shopifyPageId.startsWith("product_")) {
    const id = shopifyPageId.replace("product_", "");
    return `https://admin.shopify.com/store/${shopSlug}/products/${id}`;
  }
  if (shopifyPageId.startsWith("collection_")) {
    const id = shopifyPageId.replace("collection_", "");
    return `https://admin.shopify.com/store/${shopSlug}/collections/${id}`;
  }
  return `https://admin.shopify.com/store/${shopSlug}/pages/${shopifyPageId}`;
}

/** ページタイプの日本語ラベル */
export const PAGE_TYPE_LABELS: Record<string, string> = {
  landing: "トップ",
  product: "商品詳細",
  collection: "コレクション",
  "list-collections": "コレクション一覧",
  cart: "カート",
  about: "About",
  blog: "ブログ",
  article: "記事",
  contact: "問い合わせ",
  search: "検索",
  account: "アカウント",
  password: "パスワード",
  "404": "404",
  general: "汎用",
};

function StatusDot({
  status,
  shopifyPublished,
}: {
  status: string;
  shopifyPublished: boolean;
}) {
  if (status === "published" || (status === "synced" && shopifyPublished)) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        公開中
      </span>
    );
  }
  if (status === "synced") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-medium text-blue-600">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        同期済み
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
      下書き
    </span>
  );
}

function formatRelative(dateStr: string): string {
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

export default function PageCard({
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
}: PageCardProps) {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Shopifyソースページの管理画面URL
  const shopifyAdminUrl = useMemo(() => {
    if (page.shopifyPageId && shopSlug) {
      return getShopifyAdminUrl(shopSlug, page.shopifyPageId);
    }
    return null;
  }, [page.shopifyPageId, shopSlug]);

  // Shopifyソースのカードはクリックで管理画面を開く
  const isShopifySource = page.source === "shopify";
  const handleCardClick = () => {
    if (isShopifySource && shopifyAdminUrl) {
      window.open(shopifyAdminUrl, "_blank");
    } else if (page.hasHtml) {
      onPreview(page.id);
    }
  };

  // Close dropdown on outside click — useEffectでdocumentクリックを監視
  useEffect(() => {
    if (!showActions) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showActions]);

  return (
    <div
      className={clsx(
        "group relative rounded-xl border border-border/60 bg-white hover:bg-white hover:shadow-md hover:shadow-black/[0.04] hover:border-border transition-all duration-200 overflow-hidden",
        isShopifySource && shopifyAdminUrl && "cursor-pointer",
      )}
      onClick={isShopifySource ? handleCardClick : undefined}
    >
      {/* ── Thumbnail area ── */}
      <div
        className="relative h-[120px] bg-gray-50 overflow-hidden cursor-pointer"
        onClick={(e) => {
          if (!isShopifySource) {
            e.stopPropagation();
            page.hasHtml && onPreview(page.id);
          }
        }}
      >
        {page.hasHtml ? (
          <div className="w-full h-full relative">
            {/* Scaled-down iframe thumbnail */}
            <iframe
              srcDoc={EMPTY_THUMBNAIL_HTML}
              className="w-[1280px] h-[800px] border-0 pointer-events-none"
              style={{
                transform: "scale(0.094)",
                transformOrigin: "top left",
              }}
              tabIndex={-1}
              title={`${page.title} thumbnail`}
            />
            {/* Hover overlay with enhance button */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors flex items-center justify-center">
              {onEnhance && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEnhance(page.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-accent/90 hover:bg-accent shadow-md backdrop-blur-sm"
                >
                  <Sparkles className="w-3 h-3" />
                  ページ編集
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/30">
            <Sparkles className="w-8 h-8" />
            {/* 未作成ページにはページ作成ボタン */}
            {onEnhance && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEnhance(page.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-accent/90 hover:bg-accent shadow-md"
              >
                <Sparkles className="w-3 h-3" />
                ページ作成
              </button>
            )}
          </div>
        )}

        {/* Source badge overlay */}
        <div className="absolute top-2 left-2">
          {page.source === "shopify" ? (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-emerald-500/90 text-white backdrop-blur-sm">
              <ShoppingBag className="w-2.5 h-2.5" />
              Shopify
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-accent/90 text-white backdrop-blur-sm">
              <Sparkles className="w-2.5 h-2.5" />
              Aicata
            </span>
          )}
        </div>

        {/* Version badge */}
        {page.versionCount > 1 && (
          <div className="absolute top-2 right-2">
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-black/60 text-white backdrop-blur-sm">
              v{page.version}
            </span>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="px-3 py-2.5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="text-[13px] font-semibold text-foreground leading-snug truncate flex-1">
            {page.title}
          </h3>

          {/* Actions menu */}
          <div className="relative shrink-0" ref={actionsRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions((v) => !v);
              }}
              className="p-1 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-black/[0.04] transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {showActions && (
              <div
                className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl border border-border shadow-lg shadow-black/[0.08] py-1 z-50"
              >
                {page.hasHtml && (
                  <button
                    onClick={() => {
                      onPreview(page.id);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-black/[0.03] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    プレビュー
                  </button>
                )}
                {page.conversationId && onEdit && (
                  <button
                    onClick={() => {
                      onEdit(page.conversationId!);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-black/[0.03] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    編集
                  </button>
                )}
                {/* Aicataで改善: 会話がないページ（Shopify同期ページ等）でも使える */}
                {page.hasHtml && onEnhance && !page.conversationId && (
                  <button
                    onClick={() => {
                      onEnhance(page.id);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-accent hover:bg-accent/[0.04] transition-colors font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Aicataで改善
                  </button>
                )}
                {storeConnected && page.hasHtml && (
                  <button
                    onClick={() => {
                      onDeploy(page.id);
                      setShowActions(false);
                    }}
                    disabled={deploying === page.id}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-black/[0.03] transition-colors disabled:opacity-50"
                  >
                    {deploying === page.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    {page.shopifyPageId ? "Shopify更新" : "デプロイ"}
                  </button>
                )}
                {shopifyAdminUrl && (
                  <a
                    href={shopifyAdminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-black/[0.03] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    Shopifyで開く
                  </a>
                )}
                {page.source === "aicata" && (
                  <>
                    <div className="h-px bg-border mx-2 my-1" />
                    <button
                      onClick={() => {
                        onDelete(page);
                        setShowActions(false);
                      }}
                      disabled={deleting === page.id}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {deleting === page.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      削除
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <StatusDot
            status={page.status}
            shopifyPublished={page.shopifyPublished}
          />
          <span className="text-[10px] text-muted-foreground/60">
            {formatRelative(page.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
