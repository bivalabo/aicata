"use client";

import { useMemo } from "react";
import {
  Home,
  ShoppingBag,
  LayoutGrid,
  FileText,
  Mail,
  Settings,
  HelpCircle,
  ScrollText,
  BookOpen,
  Search,
  User,
  ShoppingCart,
  Globe,
  Check,
} from "lucide-react";
import clsx from "clsx";

// ── Types ──

interface SiteTreeNode {
  path: string;
  title: string;
  pageType: string;
  children: SiteTreeNode[];
}

interface CrawledPageSummary {
  url: string;
  path: string;
  title: string;
  pageType: string;
  depth: number;
  status: "ok" | "error" | "skipped";
  selected?: boolean;
}

interface SiteStats {
  totalPagesFound: number;
  totalPagesCrawled: number;
  totalPagesSkipped: number;
  crawlDurationMs: number;
}

interface UnifiedDesign {
  dominantColors: string[];
  fonts: string[];
  tones: string[];
}

export interface SiteMapInfographicProps {
  siteName: string;
  rootUrl: string;
  pages: CrawledPageSummary[];
  tree?: SiteTreeNode;
  stats?: SiteStats;
  unifiedDesign?: UnifiedDesign;
  onTogglePage?: (index: number) => void;
  onToggleAll?: (selected: boolean) => void;
  selectable?: boolean;
}

// ── Constants ──

const TYPE_ICON: Record<string, typeof Home> = {
  landing: Home,
  product: ShoppingBag,
  collection: LayoutGrid,
  "list-collections": LayoutGrid,
  blog: BookOpen,
  article: FileText,
  about: ScrollText,
  contact: Mail,
  faq: HelpCircle,
  legal: FileText,
  search: Search,
  account: User,
  cart: ShoppingCart,
  "404": Settings,
  general: Globe,
};

const TYPE_COLOR: Record<string, string> = {
  landing: "from-violet-500/20 to-violet-600/5 border-violet-500/30 text-violet-400",
  product: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400",
  collection: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400",
  "list-collections": "from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400",
  blog: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400",
  article: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400",
  about: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400",
  contact: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400",
  faq: "from-rose-500/20 to-rose-600/5 border-rose-500/30 text-rose-400",
  legal: "from-gray-500/20 to-gray-600/5 border-gray-500/30 text-gray-400",
  general: "from-gray-500/20 to-gray-600/5 border-gray-500/30 text-gray-400",
};

const TYPE_LABEL: Record<string, string> = {
  landing: "トップページ",
  product: "商品ページ",
  collection: "コレクション",
  "list-collections": "コレクション一覧",
  blog: "ブログ",
  article: "ブログ記事",
  about: "ブランドストーリー",
  contact: "お問い合わせ",
  faq: "FAQ",
  legal: "法的ページ",
  search: "検索",
  account: "アカウント",
  cart: "カート",
  "404": "404",
  general: "その他",
};

const TYPE_GROUP_ORDER = [
  "landing",
  "collection",
  "product",
  "about",
  "blog",
  "article",
  "contact",
  "faq",
  "legal",
  "general",
] as const;

// ── Component ──

export default function SiteMapInfographic({
  siteName,
  rootUrl,
  pages,
  stats,
  unifiedDesign,
  onTogglePage,
  onToggleAll,
  selectable = false,
}: SiteMapInfographicProps) {
  // Group pages by type
  const groupedPages = useMemo(() => {
    const groups: Record<string, { pages: CrawledPageSummary[]; originalIndices: number[] }> = {};

    pages.forEach((page, idx) => {
      const type = page.pageType || "general";
      if (!groups[type]) groups[type] = { pages: [], originalIndices: [] };
      groups[type].pages.push(page);
      groups[type].originalIndices.push(idx);
    });

    // Sort by defined order
    const sorted: Array<{
      type: string;
      label: string;
      pages: CrawledPageSummary[];
      originalIndices: number[];
    }> = [];

    for (const type of TYPE_GROUP_ORDER) {
      if (groups[type]) {
        sorted.push({
          type,
          label: TYPE_LABEL[type] || type,
          ...groups[type],
        });
        delete groups[type];
      }
    }
    // Remaining types
    for (const [type, data] of Object.entries(groups)) {
      sorted.push({ type, label: TYPE_LABEL[type] || type, ...data });
    }

    return sorted;
  }, [pages]);

  const selectedCount = pages.filter((p) => p.selected).length;
  const totalCount = pages.length;

  return (
    <div className="space-y-6">
      {/* ── Header Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="発見ページ"
          value={stats?.totalPagesFound ?? totalCount}
          accent="text-indigo-400"
        />
        <StatCard
          label="クロール済み"
          value={stats?.totalPagesCrawled ?? totalCount}
          accent="text-blue-400"
        />
        <StatCard
          label="ページ種別"
          value={groupedPages.length}
          accent="text-emerald-400"
        />
        <StatCard
          label="クロール時間"
          value={stats ? `${(stats.crawlDurationMs / 1000).toFixed(1)}s` : "—"}
          accent="text-amber-400"
        />
      </div>

      {/* ── Unified Design Context ── */}
      {unifiedDesign && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            検出されたデザインコンテキスト
          </h4>
          <div className="flex flex-wrap gap-4">
            {/* Colors */}
            {unifiedDesign.dominantColors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">カラー:</span>
                <div className="flex gap-1">
                  {unifiedDesign.dominantColors.slice(0, 8).map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-md border border-white/10"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Fonts */}
            {unifiedDesign.fonts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">フォント:</span>
                <div className="flex gap-1">
                  {unifiedDesign.fonts.slice(0, 4).map((font, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-white/5 rounded border border-white/10 text-gray-300"
                    >
                      {font}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Tones */}
            {unifiedDesign.tones.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">トーン:</span>
                <div className="flex gap-1">
                  {unifiedDesign.tones.slice(0, 4).map((tone, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20 text-indigo-300"
                    >
                      {tone}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Select All / None ── */}
      {selectable && onToggleAll && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {selectedCount}/{totalCount} ページ選択中
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleAll(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors border border-indigo-500/20"
            >
              すべて選択
            </button>
            <button
              onClick={() => onToggleAll(false)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors border border-white/10"
            >
              選択解除
            </button>
          </div>
        </div>
      )}

      {/* ── Page Groups ── */}
      <div className="space-y-4">
        {groupedPages.map((group) => {
          const Icon = TYPE_ICON[group.type] || Globe;
          const colorClass = TYPE_COLOR[group.type] || TYPE_COLOR.general;

          return (
            <div key={group.type} className="space-y-2">
              {/* Group Header */}
              <div className="flex items-center gap-2 px-1">
                <div
                  className={clsx(
                    "w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br border",
                    colorClass,
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-gray-200">
                  {group.label}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  {group.pages.length}
                </span>
                {/* Connection line */}
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
              </div>

              {/* Page Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pl-4">
                {group.pages.map((page, i) => {
                  const originalIndex = group.originalIndices[i];
                  const isSelected = page.selected !== false;

                  return (
                    <div
                      key={page.path}
                      onClick={() => selectable && onTogglePage?.(originalIndex)}
                      className={clsx(
                        "group relative rounded-lg border p-3 transition-all cursor-pointer",
                        selectable && "hover:border-indigo-500/40",
                        isSelected && selectable
                          ? "bg-[#12121a] border-indigo-500/30"
                          : "bg-[#0e0e14] border-[#2a2a3a]",
                        !selectable && "cursor-default",
                        page.status === "error" && "opacity-50",
                      )}
                    >
                      {/* Selection indicator */}
                      {selectable && (
                        <div
                          className={clsx(
                            "absolute top-2 right-2 w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                            isSelected
                              ? "bg-indigo-500 border-indigo-400"
                              : "bg-white/5 border-white/15",
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      )}

                      {/* Page path */}
                      <div className="text-xs font-mono text-gray-500 mb-1 pr-6 truncate">
                        {page.path || "/"}
                      </div>

                      {/* Page title */}
                      <div className="text-sm text-gray-200 font-medium truncate">
                        {page.title || page.path || "無題"}
                      </div>

                      {/* Depth indicator */}
                      <div className="flex items-center gap-1 mt-1.5">
                        {Array.from({ length: Math.min(page.depth + 1, 4) }).map(
                          (_, d) => (
                            <div
                              key={d}
                              className={clsx(
                                "w-1.5 h-1.5 rounded-full",
                                d <= page.depth
                                  ? "bg-indigo-400/60"
                                  : "bg-white/10",
                              )}
                            />
                          ),
                        )}
                        <span className="text-[10px] text-gray-600 ml-1">
                          depth {page.depth}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sub-Components ──

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4 text-center">
      <div className={clsx("text-2xl font-bold", accent)}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
