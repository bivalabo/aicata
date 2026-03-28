"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Download,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe,
  Layers,
  BarChart3,
  RefreshCw,
  Database,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";
import {
  HARVEST_SOURCES_BY_CATEGORY,
  CATEGORY_LABELS,
} from "@/lib/harvester/sources";

// ============================================================
// Types
// ============================================================

interface HarvestSourceData {
  id: string;
  url: string;
  domain: string;
  label: string;
  status: string;
  pageCount: number;
  blockCount: number;
  lastCrawledAt: string | null;
  errorMessage: string | null;
  _count: { jobs: number };
}

interface HarvestStatsData {
  sourceCount: number;
  jobCount: number;
  candidateCount: number;
  blockCount: number;
  blocksByCategory: { category: string; count: number }[];
}

// ============================================================
// Main Component
// ============================================================

export default function HarvestTab() {
  const [sources, setSources] = useState<HarvestSourceData[]>([]);
  const [stats, setStats] = useState<HarvestStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [harvestingId, setHarvestingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [sourcesRes, statsRes] = await Promise.all([
        fetch("/api/harvest/sources"),
        fetch("/api/harvest/stats"),
      ]);
      if (sourcesRes.ok) {
        const data = await sourcesRes.json();
        setSources(data.sources || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error("[HarvestTab] Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ソースを一括登録
  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/harvest/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      if (res.ok) {
        await fetchData();
      }
    } finally {
      setSeeding(false);
    }
  };

  // ハーベスト開始
  const handleHarvest = async (sourceId: string) => {
    setHarvestingId(sourceId);
    try {
      await fetch("/api/harvest/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "harvest", sourceId }),
      });
      // ポーリングで更新
      setTimeout(fetchData, 3000);
    } finally {
      setHarvestingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="登録ソース"
          value={stats?.sourceCount ?? 0}
          icon={Globe}
          color="text-blue-400"
        />
        <StatCard
          label="処理ジョブ"
          value={stats?.jobCount ?? 0}
          icon={Layers}
          color="text-violet-400"
        />
        <StatCard
          label="候補ブロック"
          value={stats?.candidateCount ?? 0}
          icon={Database}
          color="text-amber-400"
        />
        <StatCard
          label="承認済みブロック"
          value={stats?.blockCount ?? 0}
          icon={Sparkles}
          color="text-emerald-400"
        />
      </div>

      {/* Category Breakdown */}
      {stats && stats.blocksByCategory.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="text-[13px] font-semibold text-white/70 mb-4">
            カテゴリ別ブロック数
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {stats.blocksByCategory.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03]"
              >
                <span className="text-[12px] text-white/50">{item.category}</span>
                <span className="text-[13px] font-semibold text-white/80">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 text-accent text-[13px] font-medium hover:bg-accent/30 transition-colors disabled:opacity-50"
        >
          {seeding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          参照元を一括登録
        </button>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          更新
        </button>
      </div>

      {/* Source List by Category */}
      {sources.length > 0 ? (
        <SourceList
          sources={sources}
          harvestingId={harvestingId}
          onHarvest={handleHarvest}
        />
      ) : (
        <EmptyState onSeed={handleSeed} seeding={seeding} />
      )}
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof Globe;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={clsx("w-4 h-4", color)} />
        <span className="text-[11px] text-white/40 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-[24px] font-bold text-white/90">{value}</div>
    </div>
  );
}

function SourceList({
  sources,
  harvestingId,
  onHarvest,
}: {
  sources: HarvestSourceData[];
  harvestingId: string | null;
  onHarvest: (id: string) => void;
}) {
  // カテゴリ参照用マップ
  const sourceDefs = Object.entries(HARVEST_SOURCES_BY_CATEGORY);

  return (
    <div className="space-y-6">
      {sourceDefs.map(([category, defs]) => {
        const categorySources = sources.filter((s) =>
          defs.some((d) => d.domain === s.domain),
        );
        if (categorySources.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="text-[14px] font-semibold text-white/60 mb-3">
              {CATEGORY_LABELS[category] || category}
            </h3>
            <div className="space-y-2">
              {categorySources.map((source) => (
                <SourceRow
                  key={source.id}
                  source={source}
                  isHarvesting={harvestingId === source.id}
                  onHarvest={() => onHarvest(source.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* 未分類ソース */}
      {sources.filter(
        (s) =>
          !Object.values(HARVEST_SOURCES_BY_CATEGORY)
            .flat()
            .some((d) => d.domain === s.domain),
      ).length > 0 && (
        <div>
          <h3 className="text-[14px] font-semibold text-white/60 mb-3">
            カスタムソース
          </h3>
          <div className="space-y-2">
            {sources
              .filter(
                (s) =>
                  !Object.values(HARVEST_SOURCES_BY_CATEGORY)
                    .flat()
                    .some((d) => d.domain === s.domain),
              )
              .map((source) => (
                <SourceRow
                  key={source.id}
                  source={source}
                  isHarvesting={harvestingId === source.id}
                  onHarvest={() => onHarvest(source.id)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SourceRow({
  source,
  isHarvesting,
  onHarvest,
}: {
  source: HarvestSourceData;
  isHarvesting: boolean;
  onHarvest: () => void;
}) {
  const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
    pending: { icon: Globe, color: "text-white/30", label: "待機中" },
    crawling: { icon: Loader2, color: "text-blue-400", label: "クロール中" },
    analyzing: { icon: Sparkles, color: "text-violet-400", label: "分析中" },
    complete: { icon: CheckCircle2, color: "text-emerald-400", label: "完了" },
    failed: { icon: AlertCircle, color: "text-red-400", label: "失敗" },
  };

  const status = statusConfig[source.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <StatusIcon
        className={clsx(
          "w-4 h-4 shrink-0",
          status.color,
          source.status === "crawling" || source.status === "analyzing" ? "animate-spin" : "",
        )}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-white/80 truncate">
            {source.label || source.domain}
          </span>
          <span className="text-[10px] text-white/30">{source.domain}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className={clsx("text-[10px]", status.color)}>
            {status.label}
          </span>
          {source.pageCount > 0 && (
            <span className="text-[10px] text-white/30">
              {source.pageCount}ページ
            </span>
          )}
          {source.blockCount > 0 && (
            <span className="text-[10px] text-emerald-400/60">
              {source.blockCount}ブロック
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/20 hover:text-white/50 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <button
          onClick={onHarvest}
          disabled={isHarvesting || source.status === "crawling" || source.status === "analyzing"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-[11px] font-medium hover:bg-accent/25 transition-colors disabled:opacity-30"
        >
          {isHarvesting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Play className="w-3 h-3" />
          )}
          収穫
        </button>
      </div>
    </div>
  );
}

function EmptyState({
  onSeed,
  seeding,
}: {
  onSeed: () => void;
  seeding: boolean;
}) {
  return (
    <div className="text-center py-16 rounded-2xl border border-dashed border-white/[0.08]">
      <Database className="w-10 h-10 text-white/10 mx-auto mb-4" />
      <h3 className="text-[15px] font-semibold text-white/50 mb-2">
        ハーベストソースが未登録です
      </h3>
      <p className="text-[12px] text-white/30 mb-6 max-w-md mx-auto">
        参照元サイトを登録して、世界最高水準のデザインブロックを収穫しましょう。
        13の厳選ギャラリーサイトを一括登録できます。
      </p>
      <button
        onClick={onSeed}
        disabled={seeding}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {seeding ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        13サイトを一括登録
      </button>
    </div>
  );
}
