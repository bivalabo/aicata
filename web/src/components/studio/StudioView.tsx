"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  FileText,
  Layout,
  Palette,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Grid3X3,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

const SiteMapView = dynamic(() => import("@/components/pages/SiteMapView"), {
  loading: () => <StudioLoadingState />,
});
const SiteBuilderView = dynamic(
  () =>
    import(
      /* webpackChunkName: "site-builder-v3" */ "@/components/site-builder/SiteBuilderView"
    ),
  {
    ssr: false,
    loading: () => <StudioLoadingState />,
  },
);

function StudioLoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground text-sm">
        読み込み中...
      </div>
    </div>
  );
}

type StudioTab = "pages" | "global" | "theme";

const TABS: { id: StudioTab; label: string; icon: typeof FileText }[] = [
  { id: "pages", label: "ページ", icon: FileText },
  { id: "global", label: "グローバル", icon: Layout },
  { id: "theme", label: "テーマ", icon: Palette },
];

interface StudioViewProps {
  onNavigateToCreate?: () => void;
  onCreatePageByType?: (pageType: string) => void;
  onEditPage?: (conversationId: string) => void;
  onEnhancePage?: (pageId: string) => Promise<void>;
}

export default function StudioView({
  onNavigateToCreate,
  onCreatePageByType,
  onEditPage,
  onEnhancePage,
}: StudioViewProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>("pages");

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-slate-50/80 to-white">
      {/* Studio Header */}
      <div className="shrink-0 border-b border-border/50 bg-white/80 backdrop-blur-sm">
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Layers className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-foreground tracking-tight">
                Studio
              </h1>
              <p className="text-[13px] text-muted-foreground">
                ページ・グローバル要素・テーマを管理
              </p>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-t-lg transition-all duration-200 border-b-2",
                  activeTab === tab.id
                    ? "text-foreground border-indigo-500 bg-white"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-white/60",
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "pages" && (
          <SiteMapView
            onNavigateToChat={onNavigateToCreate}
            onCreatePageByType={onCreatePageByType}
            onEditPage={onEditPage}
            onEnhancePage={onEnhancePage}
            embedded
          />
        )}
        {activeTab === "global" && <GlobalElementsGallery />}
        {activeTab === "theme" && <SiteBuilderView />}
      </div>
    </div>
  );
}

// ============================================================
// Global Elements — Visual Gallery (Header/Footer/Nav)
// ============================================================

interface HarvestBlockSummary {
  id: string;
  sectionCategory: string;
  sourceDomain: string;
  sourceUrl: string;
  tones: string[];
  hqs: Record<string, number>;
}

function GlobalElementsGallery() {
  const [blocks, setBlocks] = useState<Record<string, HarvestBlockSummary[]>>({
    header: [],
    footer: [],
    "announcement-bar": [],
  });
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // ハーベストブロックをカテゴリ別に取得
  useEffect(() => {
    const categories = ["header", "footer", "announcement-bar"];
    let cancelled = false;

    async function fetchBlocks() {
      setLoading(true);
      const results: Record<string, HarvestBlockSummary[]> = {};
      for (const cat of categories) {
        try {
          const res = await fetch(`/api/harvest/blocks?category=${cat}&status=approved&limit=6`);
          if (res.ok) {
            const data = await res.json();
            results[cat] = data.blocks || [];
          } else {
            results[cat] = [];
          }
        } catch {
          results[cat] = [];
        }
      }
      if (!cancelled) {
        setBlocks(results);
        setLoading(false);
      }
    }

    fetchBlocks();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <GlobalElementSection
          title="ヘッダー"
          description="サイト全体のナビゲーションヘッダー"
          elementType="header"
          blocks={blocks.header || []}
          loading={loading}
          expanded={expandedSection === "header"}
          onToggle={() => setExpandedSection((prev) => (prev === "header" ? null : "header"))}
        />

        <div className="h-6" />

        {/* Footer Section */}
        <GlobalElementSection
          title="フッター"
          description="サイト全体のフッター"
          elementType="footer"
          blocks={blocks.footer || []}
          loading={loading}
          expanded={expandedSection === "footer"}
          onToggle={() => setExpandedSection((prev) => (prev === "footer" ? null : "footer"))}
        />

        <div className="h-6" />

        {/* Announcement Bar */}
        <GlobalElementSection
          title="アナウンスメントバー"
          description="セール告知やお知らせ"
          elementType="announcement-bar"
          blocks={blocks["announcement-bar"] || []}
          loading={loading}
          expanded={expandedSection === "announcement-bar"}
          onToggle={() => setExpandedSection((prev) => (prev === "announcement-bar" ? null : "announcement-bar"))}
        />
      </div>
    </div>
  );
}

function GlobalElementSection({
  title,
  description,
  elementType,
  blocks,
  loading,
  expanded,
  onToggle,
}: {
  title: string;
  description: string;
  elementType: string;
  blocks: HarvestBlockSummary[];
  loading: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hasBlocks = blocks.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Layout className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200",
            hasBlocks
              ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
              : "text-muted-foreground bg-black/[0.03] hover:bg-black/[0.06]",
          )}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          {hasBlocks ? `${blocks.length}件のデザイン` : "ギャラリー"}
          <ChevronRight
            className={clsx(
              "w-3 h-3 transition-transform duration-200",
              expanded && "rotate-90",
            )}
          />
        </button>
      </div>

      {/* Current Element Preview — プレースホルダー or 選択済みブロック */}
      <div className="rounded-2xl border border-border/60 bg-white overflow-hidden shadow-sm">
        <div className="aspect-[16/4] bg-gradient-to-br from-slate-50 to-slate-100/80 flex items-center justify-center relative">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground/50">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[12px]">読み込み中...</span>
            </div>
          ) : (
            <div className="text-center px-4">
              <Layout className="w-7 h-7 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground/50">
                {hasBlocks
                  ? `下のギャラリーから${title}デザインを選択してください`
                  : `ハーベスト実行後に${title}デザインが表示されます`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Block Gallery */}
      {expanded && (
        <div className="mt-3">
          {hasBlocks ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {blocks.map((block) => (
                <HarvestBlockCard key={block.id} block={block} elementType={elementType} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-slate-50/50 p-6 text-center">
              <Sparkles className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground/60 mb-1">
                まだ{title}のブロックがありません
              </p>
              <p className="text-[11px] text-muted-foreground/40">
                Admin → Harvest タブからデザイン収集を実行してください
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HarvestBlockCard({
  block,
  elementType,
}: {
  block: HarvestBlockSummary;
  elementType: string;
}) {
  const compositeHqs = block.hqs
    ? Object.values(block.hqs).reduce((sum: number, v: number) => sum + v, 0) /
      Math.max(1, Object.values(block.hqs).length)
    : 0;

  return (
    <button className="group text-left rounded-xl border border-border/50 bg-white overflow-hidden hover:border-indigo-200 hover:shadow-sm transition-all duration-200">
      {/* Preview area */}
      <div className="aspect-[16/5] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
        <Layout className="w-5 h-5 text-muted-foreground/15" />
        <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/[0.03] transition-colors" />
      </div>
      {/* Info */}
      <div className="px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground truncate max-w-[70%]">
            {block.sourceDomain}
          </span>
          <span className="text-[10px] text-indigo-500 font-medium tabular-nums">
            HQS {Math.round(compositeHqs)}
          </span>
        </div>
        {block.tones && block.tones.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {block.tones.slice(0, 3).map((tone) => (
              <span
                key={tone}
                className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-500"
              >
                {tone}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
