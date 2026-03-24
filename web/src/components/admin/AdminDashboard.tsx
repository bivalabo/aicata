"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Brain,
  Layers,
  Sparkles,
  TrendingUp,
  Star,
  Eye,
  Database,
  Activity,
  Palette,
  BarChart3,
  Settings,
  Globe,
  Zap,
  ChevronRight,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";
import type {
  ACEStatsResponse,
  DesignDNA,
  SiteEvaluationData,
  DesignPatternData,
  DesignDNAPreferences,
} from "@/lib/ace-adis/types";
import {
  DNA_DIMENSION_LABELS,
  DNA_DIMENSION_COLORS,
  createDefaultDesignDNA,
} from "@/lib/ace-adis/types";
import { dedupFetch } from "@/lib/api-dedup";
import DesignRegistryTab from "./DesignRegistryTab";

// ============================================================
// Types
// ============================================================

type AdminTab = "overview" | "ace" | "adis" | "curator" | "trends" | "registry";

interface MetricCard {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: typeof Brain;
  color: string;
}

interface DesignPatternEntry {
  id: string;
  name: string;
  category: string;
  prevalence: number;
  momentum: number;
  curatorScore: number | null;
  examples: number;
}

interface SiteRatingEntry {
  id: string;
  url: string;
  rating: number;
  tags: string[];
  date: string;
  analyzed: boolean;
}

// ============================================================
// Mock Data
// ============================================================

const METRICS: MetricCard[] = [
  {
    label: "Design Atoms",
    value: "24",
    change: "+8",
    trend: "up",
    icon: Zap,
    color: "from-violet-500 to-purple-600",
  },
  {
    label: "Block Patterns",
    value: "12",
    change: "+4",
    trend: "up",
    icon: Layers,
    color: "from-blue-500 to-cyan-500",
  },
  {
    label: "Section Blueprints",
    value: "47",
    change: "stable",
    trend: "neutral",
    icon: Database,
    color: "from-emerald-500 to-teal-500",
  },
  {
    label: "Design DNA 信頼度",
    value: "12%",
    change: "初期段階",
    trend: "up",
    icon: Brain,
    color: "from-amber-500 to-orange-500",
  },
];

const MOCK_PATTERNS: DesignPatternEntry[] = [
  {
    id: "p1",
    name: "Bento Grid Layout",
    category: "layout",
    prevalence: 0.72,
    momentum: 0.45,
    curatorScore: 4,
    examples: 23,
  },
  {
    id: "p2",
    name: "Glassmorphism Cards",
    category: "decorative",
    prevalence: 0.58,
    momentum: -0.12,
    curatorScore: 3,
    examples: 45,
  },
  {
    id: "p3",
    name: "Scroll-triggered Parallax",
    category: "animation",
    prevalence: 0.65,
    momentum: 0.08,
    curatorScore: 5,
    examples: 31,
  },
  {
    id: "p4",
    name: "Variable Font Animation",
    category: "typography",
    prevalence: 0.34,
    momentum: 0.62,
    curatorScore: null,
    examples: 12,
  },
  {
    id: "p5",
    name: "Mesh Gradient Background",
    category: "decorative",
    prevalence: 0.51,
    momentum: 0.15,
    curatorScore: 4,
    examples: 28,
  },
  {
    id: "p6",
    name: "Micro-interaction Hover",
    category: "animation",
    prevalence: 0.78,
    momentum: 0.02,
    curatorScore: 5,
    examples: 56,
  },
];

const MOCK_RATINGS: SiteRatingEntry[] = [
  {
    id: "r1",
    url: "https://aesop.com",
    rating: 5,
    tags: ["minimal", "luxury", "whitespace"],
    date: "2026-03-15",
    analyzed: true,
  },
  {
    id: "r2",
    url: "https://stripe.com",
    rating: 5,
    tags: ["modern", "clean", "animation"],
    date: "2026-03-14",
    analyzed: true,
  },
  {
    id: "r3",
    url: "https://linear.app",
    rating: 4,
    tags: ["dark", "minimal", "modern"],
    date: "2026-03-12",
    analyzed: true,
  },
  {
    id: "r4",
    url: "https://example-bad-site.com",
    rating: 1,
    tags: ["cluttered", "outdated"],
    date: "2026-03-10",
    analyzed: false,
  },
];

// ============================================================
// Custom Hook: useIntelligenceData
// ============================================================

function useIntelligenceData(activeTab: AdminTab) {
  const [aceStats, setAceStats] = useState<ACEStatsResponse | null>(null);
  const [designDNA, setDesignDNA] = useState<DesignDNA | null>(null);
  const [evaluations, setEvaluations] = useState<SiteEvaluationData[]>([]);
  const [patterns, setPatterns] = useState<DesignPatternData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchedTabs, setFetchedTabs] = useState<Set<AdminTab>>(new Set());

  // Determine which endpoints need to be fetched for the active tab
  const getEndpointsForTab = useCallback((tab: AdminTab): ('stats' | 'dna' | 'evaluations' | 'patterns')[] => {
    switch (tab) {
      case 'overview':
        return ['stats', 'dna', 'evaluations', 'patterns'];
      case 'ace':
        return ['stats'];
      case 'adis':
        return ['dna'];
      case 'curator':
        return ['evaluations'];
      case 'trends':
        return ['patterns'];
      default:
        return [];
    }
  }, []);

  const fetchForTab = useCallback(async (tab: AdminTab) => {
    // Check if already fetched for this tab
    if (fetchedTabs.has(tab)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const endpointsNeeded = getEndpointsForTab(tab);

    try {
      const promises: Promise<any>[] = [];

      if (endpointsNeeded.includes('stats')) {
        promises.push(dedupFetch("intelligence-stats", () => fetch("/api/intelligence/stats").then((r) => r.json())).then(v => ({ key: 'stats', value: v })));
      }
      if (endpointsNeeded.includes('dna')) {
        promises.push(dedupFetch("intelligence-design-dna", () => fetch("/api/intelligence/design-dna").then((r) => r.json())).then(v => ({ key: 'dna', value: v })));
      }
      if (endpointsNeeded.includes('evaluations')) {
        promises.push(dedupFetch("intelligence-evaluations", () => fetch("/api/intelligence/evaluations?limit=20").then((r) => r.json())).then(v => ({ key: 'evaluations', value: v })));
      }
      if (endpointsNeeded.includes('patterns')) {
        promises.push(dedupFetch("intelligence-patterns", () => fetch("/api/intelligence/patterns?limit=20&sort=momentum").then((r) => r.json())).then(v => ({ key: 'patterns', value: v })));
      }

      const results = await Promise.allSettled(promises);

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const { key, value } = result.value;
          if (key === 'stats') setAceStats(value);
          else if (key === 'dna') setDesignDNA(value);
          else if (key === 'evaluations') setEvaluations(value.evaluations || []);
          else if (key === 'patterns') setPatterns(value.patterns || []);
        }
      });

      setFetchedTabs((prev) => new Set(prev).add(tab));
    } catch (err) {
      console.error("[Intelligence] Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [getEndpointsForTab, fetchedTabs]);

  // Fetch data when active tab changes
  useEffect(() => {
    fetchForTab(activeTab);
  }, [activeTab, fetchForTab]);

  // Refetch all data for current tab
  const refetch = useCallback(async () => {
    setLoading(true);
    const endpointsNeeded = getEndpointsForTab(activeTab);

    try {
      const promises: Promise<any>[] = [];

      if (endpointsNeeded.includes('stats')) {
        promises.push(dedupFetch("intelligence-stats", () => fetch("/api/intelligence/stats").then((r) => r.json())).then(v => ({ key: 'stats', value: v })));
      }
      if (endpointsNeeded.includes('dna')) {
        promises.push(dedupFetch("intelligence-design-dna", () => fetch("/api/intelligence/design-dna").then((r) => r.json())).then(v => ({ key: 'dna', value: v })));
      }
      if (endpointsNeeded.includes('evaluations')) {
        promises.push(dedupFetch("intelligence-evaluations", () => fetch("/api/intelligence/evaluations?limit=20").then((r) => r.json())).then(v => ({ key: 'evaluations', value: v })));
      }
      if (endpointsNeeded.includes('patterns')) {
        promises.push(dedupFetch("intelligence-patterns", () => fetch("/api/intelligence/patterns?limit=20&sort=momentum").then((r) => r.json())).then(v => ({ key: 'patterns', value: v })));
      }

      const results = await Promise.allSettled(promises);

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const { key, value } = result.value;
          if (key === 'stats') setAceStats(value);
          else if (key === 'dna') setDesignDNA(value);
          else if (key === 'evaluations') setEvaluations(value.evaluations || []);
          else if (key === 'patterns') setPatterns(value.patterns || []);
        }
      });
    } catch (err) {
      console.error("[Intelligence] Failed to refetch:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, getEndpointsForTab]);

  return { aceStats, designDNA, evaluations, patterns, loading, refetch };
}

// ============================================================
// Sub Components
// ============================================================

function MetricCardComponent({ metric }: { metric: MetricCard }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.06] transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div
          className={clsx(
            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
            metric.color
          )}
        >
          <metric.icon className="w-5 h-5 text-white" />
        </div>
        {metric.trend && metric.trend !== "neutral" && (
          <div
            className={clsx(
              "flex items-center gap-0.5 text-[11px] font-medium px-2 py-1 rounded-lg",
              metric.trend === "up"
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-red-400 bg-red-500/10"
            )}
          >
            {metric.trend === "up" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {metric.change}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
      <p className="text-[12px] text-white/40">{metric.label}</p>
    </div>
  );
}

function DesignDNAChart({ dna }: { dna?: DesignDNA | null }) {
  const prefs = dna?.preferences;
  const dimensions = (Object.keys(DNA_DIMENSION_LABELS) as (keyof DesignDNAPreferences)[]).map((key) => ({
    label: DNA_DIMENSION_LABELS[key],
    value: prefs ? prefs[key] : 0,
    color: DNA_DIMENSION_COLORS[key],
  }));

  return (
    <div className="space-y-3">
      {dimensions.map((dim) => {
        const percentage = ((dim.value + 1) / 2) * 100; // -1~1 → 0~100
        return (
          <div key={dim.label} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-white/50 group-hover:text-white/70 transition-colors">
                {dim.label}
              </span>
              <span className="text-[10px] font-mono text-white/30">
                {dim.value > 0 ? "+" : ""}
                {dim.value.toFixed(2)}
              </span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={clsx("h-full rounded-full transition-all duration-500", dim.color)}
                style={{ width: `${percentage}%`, opacity: 0.7 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PatternRow({ pattern }: { pattern: DesignPatternEntry }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03] rounded-xl transition-colors group">
      {/* Category badge */}
      <span
        className={clsx(
          "text-[10px] font-medium px-2 py-0.5 rounded-md",
          pattern.category === "layout" && "bg-blue-500/10 text-blue-400",
          pattern.category === "decorative" && "bg-purple-500/10 text-purple-400",
          pattern.category === "animation" && "bg-emerald-500/10 text-emerald-400",
          pattern.category === "typography" && "bg-amber-500/10 text-amber-400"
        )}
      >
        {pattern.category}
      </span>

      {/* Name */}
      <span className="text-[13px] text-white/80 flex-1 font-medium">
        {pattern.name}
      </span>

      {/* Prevalence */}
      <div className="w-20">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-1 bg-white/[0.06] rounded-full">
            <div
              className="h-full bg-blue-400/60 rounded-full"
              style={{ width: `${pattern.prevalence * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-white/30 font-mono w-8 text-right">
            {Math.round(pattern.prevalence * 100)}%
          </span>
        </div>
      </div>

      {/* Momentum */}
      <div className="w-16 flex items-center justify-end gap-1">
        {pattern.momentum > 0.1 ? (
          <ArrowUpRight className="w-3 h-3 text-emerald-400" />
        ) : pattern.momentum < -0.1 ? (
          <ArrowDownRight className="w-3 h-3 text-red-400" />
        ) : (
          <span className="w-3 h-3 text-white/20">—</span>
        )}
        <span
          className={clsx(
            "text-[10px] font-mono",
            pattern.momentum > 0.1
              ? "text-emerald-400"
              : pattern.momentum < -0.1
              ? "text-red-400"
              : "text-white/30"
          )}
        >
          {pattern.momentum > 0 ? "+" : ""}
          {pattern.momentum.toFixed(2)}
        </span>
      </div>

      {/* Curator score */}
      <div className="w-20 flex justify-end">
        {pattern.curatorScore !== null ? (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={clsx(
                  "w-3 h-3",
                  i < pattern.curatorScore!
                    ? "text-amber-400 fill-amber-400"
                    : "text-white/10"
                )}
              />
            ))}
          </div>
        ) : (
          <span className="text-[10px] text-white/20">未評価</span>
        )}
      </div>

      {/* Examples count */}
      <span className="text-[11px] text-white/30 w-10 text-right">
        {pattern.examples}例
      </span>
    </div>
  );
}

function SiteRatingRow({ rating }: { rating: SiteRatingEntry }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03] rounded-xl transition-colors group">
      {/* Rating stars */}
      <div className="flex items-center gap-0.5 shrink-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={clsx(
              "w-3.5 h-3.5",
              i < rating.rating
                ? rating.rating >= 4
                  ? "text-emerald-400 fill-emerald-400"
                  : rating.rating >= 3
                  ? "text-amber-400 fill-amber-400"
                  : "text-red-400 fill-red-400"
                : "text-white/10"
            )}
          />
        ))}
      </div>

      {/* URL */}
      <span className="text-[13px] text-white/70 flex-1 font-medium truncate">
        {rating.url.replace(/https?:\/\//, "")}
      </span>

      {/* Tags */}
      <div className="flex gap-1 shrink-0">
        {rating.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Date */}
      <span className="text-[10px] text-white/25 shrink-0">{rating.date}</span>

      {/* Analysis status */}
      <div className="shrink-0">
        {rating.analyzed ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400/50" />
        ) : (
          <AlertCircle className="w-4 h-4 text-amber-400/50" />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Tab Content Components
// ============================================================

function OverviewTab({
  aceStats,
  designDNA,
  evaluations,
  patterns,
}: {
  aceStats?: ACEStatsResponse | null;
  designDNA?: DesignDNA | null;
  evaluations?: SiteEvaluationData[];
  patterns?: DesignPatternData[];
}) {
  const metrics = useMemo<MetricCard[]>(() => [
    {
      label: "Design Atoms",
      value: aceStats ? String(aceStats.atomCount) : "24",
      change: "+8",
      trend: "up",
      icon: Zap,
      color: "from-violet-500 to-purple-600",
    },
    {
      label: "Block Patterns",
      value: aceStats ? String(aceStats.blockCount) : "12",
      change: "+4",
      trend: "up",
      icon: Layers,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Section Blueprints",
      value: aceStats ? String(aceStats.sectionCount) : "47",
      change: "stable",
      trend: "neutral",
      icon: Database,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Design DNA 信頼度",
      value: designDNA ? `${Math.round(designDNA.confidence * 100)}%` : "12%",
      change: "初期段階",
      trend: "up",
      icon: Brain,
      color: "from-amber-500 to-orange-500",
    },
  ], [aceStats, designDNA]);

  const displayPatterns = useMemo(() =>
    patterns && patterns.length > 0
      ? patterns.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category as string,
          prevalence: p.prevalence,
          momentum: p.momentum,
          curatorScore: p.curatorScore,
          examples: p.exampleCount,
        }))
      : MOCK_PATTERNS
  , [patterns]);

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <MetricCardComponent key={i} metric={metric} />
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Design DNA Summary */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-400" />
              <h3 className="text-[14px] font-semibold text-white/80">
                Design DNA
              </h3>
            </div>
            <span className="text-[10px] text-white/25">
              {evaluations ? evaluations.length : 6} サイト評価済み
            </span>
          </div>
          <DesignDNAChart dna={designDNA} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-[14px] font-semibold text-white/80">
                最近のアクティビティ
              </h3>
            </div>
          </div>
          <div className="space-y-3">
            {[
              {
                icon: Star,
                text: "aesop.com に★5評価を追加",
                time: "1時間前",
                color: "text-amber-400",
              },
              {
                icon: TrendingUp,
                text: "Bento Grid Layout パターンが急上昇中",
                time: "3時間前",
                color: "text-emerald-400",
              },
              {
                icon: Layers,
                text: "hero-text-group ブロックパターンを追加",
                time: "昨日",
                color: "text-blue-400",
              },
              {
                icon: Sparkles,
                text: "Design DNA が更新されました",
                time: "昨日",
                color: "text-violet-400",
              },
              {
                icon: Globe,
                text: "週次トレンドレポートが生成されました",
                time: "3日前",
                color: "text-cyan-400",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                  <item.icon className={clsx("w-3.5 h-3.5", item.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-white/60 truncate">{item.text}</p>
                </div>
                <span className="text-[10px] text-white/20 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Quick View */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-[14px] font-semibold text-white/80">
              注目のデザインパターン
            </h3>
          </div>
          <span className="text-[10px] text-white/25">2026年3月 第3週</span>
        </div>
        <div className="space-y-1">
          {displayPatterns.slice(0, 4).map((pattern) => (
            <PatternRow key={pattern.id} pattern={pattern} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ACETab({ aceStats }: { aceStats: ACEStatsResponse | null }) {
  const atoms = aceStats?.atomCount ?? 24;
  const blocks = aceStats?.blockCount ?? 12;
  const sections = aceStats?.sectionCount ?? 47;
  const possibilities = aceStats?.compositionPossibilities ?? 13536;

  const defaultProgress = [
    { category: "Hero系", total: 5, done: 3, color: "bg-violet-400" },
    { category: "Products系", total: 4, done: 2, color: "bg-blue-400" },
    { category: "Features系", total: 3, done: 1, color: "bg-cyan-400" },
    { category: "Navigation系", total: 6, done: 1, color: "bg-emerald-400" },
    { category: "Footer系", total: 2, done: 1, color: "bg-amber-400" },
    { category: "その他", total: 27, done: 0, color: "bg-white/20" },
  ];

  const progress = (aceStats?.decompositionProgress || []).length > 0
    ? aceStats!.decompositionProgress.map((p, i) => ({
        category: p.category,
        total: p.total,
        done: p.done,
        color: defaultProgress[i]?.color || "bg-white/20",
      }))
    : defaultProgress;

  const totalDone = progress.reduce((sum, p) => sum + p.done, 0);
  const totalAll = progress.reduce((sum, p) => sum + p.total, 0);
  const progressPercent = Math.round((totalDone / totalAll) * 100);

  return (
    <div className="space-y-8">
      {/* Atom/Block/Section counts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 rounded-2xl p-6 text-center">
          <Zap className="w-8 h-8 text-violet-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-white mb-1">{atoms}</p>
          <p className="text-[12px] text-white/40">Design Atoms</p>
          <p className="text-[10px] text-violet-400/60 mt-1">目標: 60-80</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-6 text-center">
          <Layers className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-white mb-1">{blocks}</p>
          <p className="text-[12px] text-white/40">Block Patterns</p>
          <p className="text-[10px] text-blue-400/60 mt-1">目標: 30-40</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center">
          <Database className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-white mb-1">{sections}</p>
          <p className="text-[12px] text-white/40">Section Blueprints</p>
          <p className="text-[10px] text-emerald-400/60 mt-1">Atomic分解: {totalDone}/{totalAll}</p>
        </div>
      </div>

      {/* Composition Possibilities */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-[14px] font-semibold text-white/80 mb-4">
          Composition Possibilities
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-5xl font-bold bg-gradient-to-r from-violet-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              {possibilities.toLocaleString()}
            </p>
            <p className="text-[12px] text-white/30 mt-2">
              理論上のデザインバリエーション数
            </p>
            <p className="text-[10px] text-white/20 mt-1">
              {atoms} Atoms × {blocks} Blocks × {sections} Sections
            </p>
          </div>
        </div>
      </div>

      {/* Section Atomic Decomposition Progress */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-white/80">
            Atomic 分解の進捗
          </h3>
          <span className="text-[11px] text-white/30">{progressPercent}% 完了</span>
        </div>
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {progress.map((group) => (
            <div key={group.category} className="flex items-center gap-2 py-1.5">
              <div className={clsx("w-2 h-2 rounded-full", group.color || "bg-white/20")} />
              <span className="text-[11px] text-white/50 flex-1">{group.category}</span>
              <span className="text-[10px] font-mono text-white/30">
                {group.done}/{group.total}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CuratorTab({
  designDNA,
  evaluations,
  refetch,
}: {
  designDNA: DesignDNA | null;
  evaluations: SiteEvaluationData[];
  refetch: () => void;
}) {
  const [newUrl, setNewUrl] = useState("");
  const [newRating, setNewRating] = useState(3);
  const [newTags, setNewTags] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<"manual" | "vision">("manual");
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!newUrl.trim()) return;
    setSubmitting(true);
    setAnalysisResult(null);
    try {
      if (analysisMode === "vision" && screenshotUrl.trim()) {
        // Vision APIでの自動分析
        const res = await fetch("/api/intelligence/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: newUrl,
            screenshotUrl: screenshotUrl.trim(),
          }),
        });
        const data = await res.json();
        if (data.success) {
          setAnalysisResult(
            `分析完了: ${data.analysis.summary || "OK"} (Rating: ${data.evaluation.overallRating})`
          );
        } else {
          setAnalysisResult(`分析失敗: ${data.error || "不明なエラー"}`);
        }
      } else {
        // 手動評価
        await fetch("/api/intelligence/evaluations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: newUrl,
            overallRating: newRating,
            tags: newTags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          }),
        });
      }
      setNewUrl("");
      setNewTags("");
      setScreenshotUrl("");
      setNewRating(3);
      refetch();
    } catch (err) {
      console.error("Failed to submit evaluation:", err);
      setAnalysisResult("エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const displayRatings = useMemo(() =>
    evaluations.length > 0
      ? evaluations.map((e) => ({
          id: e.id || "",
          url: e.url,
          rating: e.overallRating,
          tags: e.tags || [],
          date: e.createdAt
            ? new Date(e.createdAt).toISOString().split("T")[0]
            : "",
          analyzed: !!e.detectedPatterns?.length,
        }))
      : MOCK_RATINGS
  , [evaluations]);

  const dnaConfidence = designDNA ? designDNA.confidence : 0.12;
  const dnaTotalRatings = designDNA ? designDNA.totalRatings : 6;
  const neededRatings = Math.max(0, 50 - dnaTotalRatings);

  return (
    <div className="space-y-8">
      {/* URL Input */}
      <div className="bg-gradient-to-r from-violet-500/5 to-blue-500/5 border border-white/[0.08] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-white/80">
            サイトを評価する
          </h3>
          {/* Mode toggle */}
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5">
            <button
              onClick={() => setAnalysisMode("manual")}
              className={clsx(
                "px-3 py-1 rounded-md text-[10px] font-medium transition-all",
                analysisMode === "manual"
                  ? "bg-white/[0.1] text-white/80"
                  : "text-white/30 hover:text-white/50"
              )}
            >
              手動評価
            </button>
            <button
              onClick={() => setAnalysisMode("vision")}
              className={clsx(
                "px-3 py-1 rounded-md text-[10px] font-medium transition-all",
                analysisMode === "vision"
                  ? "bg-gradient-to-r from-violet-500/30 to-blue-500/30 text-white/80"
                  : "text-white/30 hover:text-white/50"
              )}
            >
              AI Vision 分析
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 flex items-center bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5">
              <Globe className="w-4 h-4 text-white/30 mr-2 shrink-0" />
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 bg-transparent text-[13px] text-white/80 placeholder:text-white/20 outline-none"
              />
            </div>
          </div>

          {analysisMode === "vision" && (
            <div className="flex items-center bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5">
              <Eye className="w-4 h-4 text-white/30 mr-2 shrink-0" />
              <input
                type="url"
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
                placeholder="スクリーンショットURL（画像）"
                className="flex-1 bg-transparent text-[13px] text-white/80 placeholder:text-white/20 outline-none"
              />
            </div>
          )}

          {analysisMode === "manual" && (
            <>
              {/* Rating selector */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-white/50">評価:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-0.5"
                      aria-label={`${star} out of 5 stars`}
                    >
                      <Star
                        className={clsx(
                          "w-5 h-5",
                          star <= newRating
                            ? "text-amber-400 fill-amber-400"
                            : "text-white/20"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags input */}
              <div className="flex items-center bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5">
                <span className="text-[12px] text-white/30 mr-2 shrink-0">
                  タグ:
                </span>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="minimal, luxury (カンマで区切る)"
                  className="flex-1 bg-transparent text-[13px] text-white/80 placeholder:text-white/20 outline-none"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={
                !newUrl.trim() ||
                submitting ||
                (analysisMode === "vision" && !screenshotUrl.trim())
              }
              className="px-6 py-2.5 rounded-xl text-[12px] font-medium bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:opacity-90 transition-all disabled:opacity-30"
            >
              {submitting
                ? analysisMode === "vision"
                  ? "AI 分析中..."
                  : "送信中..."
                : analysisMode === "vision"
                ? "Vision で分析"
                : "評価を送信"}
            </button>
            {analysisMode === "vision" && (
              <p className="text-[10px] text-white/25">
                Claude Vision APIでデザインを自動分析します
              </p>
            )}
          </div>

          {/* Analysis result message */}
          {analysisResult && (
            <div
              className={clsx(
                "p-3 rounded-xl text-[11px]",
                analysisResult.startsWith("分析完了")
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400/80"
                  : "bg-red-500/10 border border-red-500/20 text-red-400/80"
              )}
            >
              {analysisResult}
            </div>
          )}
        </div>
      </div>

      {/* Design DNA */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" />
            <h3 className="text-[14px] font-semibold text-white/80">
              あなたの Design DNA
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/25">信頼度</span>
            <span className="text-[11px] font-medium text-violet-400">
              {Math.round(dnaConfidence * 100)}%
            </span>
            <span className="text-[10px] text-white/25">
              ({dnaTotalRatings}/50 サイト)
            </span>
          </div>
        </div>
        <DesignDNAChart dna={designDNA} />
        <div className="mt-4 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
          <p className="text-[11px] text-white/40">
            より正確な Design DNA
            を構築するため、あと{neededRatings}サイトの評価が必要です。
            好きなサイト・嫌いなサイト、両方を評価することで精度が向上します。
          </p>
        </div>
      </div>

      {/* Rating History */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <h3 className="text-[14px] font-semibold text-white/80">
              評価履歴
            </h3>
          </div>
          <span className="text-[11px] text-white/25">
            {displayRatings.length} サイト
          </span>
        </div>
        <div className="space-y-1">
          {displayRatings.map((rating) => (
            <SiteRatingRow key={rating.id} rating={rating} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendsTab({ patterns, refetch }: { patterns: DesignPatternData[]; refetch: () => void }) {
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [genMessage, setGenMessage] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setGenerating(true);
    setGenMessage(null);
    try {
      const res = await fetch("/api/intelligence/trends/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daysBack: 30 }),
      });
      const data = await res.json();
      if (data.success) {
        setLastGenerated(new Date().toLocaleDateString("ja-JP"));
        setGenMessage(
          `レポート生成完了: ${data.stats.evaluationCount}サイト分析、${data.stats.emergingCount}個の上昇トレンド検出`
        );
        refetch();
      } else {
        setGenMessage(data.message || data.error || "生成に失敗しました");
      }
    } catch (err) {
      console.error("Failed to generate trend report:", err);
      setGenMessage("トレンドレポートの生成に失敗しました");
    } finally {
      setGenerating(false);
    }
  };

  const displayPatterns = useMemo(() =>
    patterns.length > 0
      ? patterns.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category as string,
          prevalence: p.prevalence,
          momentum: p.momentum,
          curatorScore: p.curatorScore,
          examples: p.exampleCount,
        }))
      : MOCK_PATTERNS
  , [patterns]);

  return (
    <div className="space-y-8">
      {/* Trend Report Header */}
      <div className="bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 border border-white/[0.08] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-[14px] font-semibold text-white/80">
              Web Design Trend Report
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-white/25" />
            <span className="text-[10px] text-white/25">
              {lastGenerated ? `最終更新: ${lastGenerated}` : "最終更新: —"}
            </span>
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className={clsx(
                "p-1.5 rounded-lg transition-colors",
                generating
                  ? "text-cyan-400 bg-cyan-500/10 animate-spin"
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.06]"
              )}
              title="トレンドレポートを再生成"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-[12px] text-white/40">
          サイト評価データからAIがデザイントレンドを自動分析
        </p>
        {genMessage && (
          <div
            className={clsx(
              "mt-3 p-2.5 rounded-lg text-[11px]",
              genMessage.startsWith("レポート生成完了")
                ? "bg-emerald-500/10 text-emerald-400/80"
                : "bg-amber-500/10 text-amber-400/80"
            )}
          >
            {genMessage}
          </div>
        )}
      </div>

      {/* All Patterns */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-white/80">
            デザインパターン一覧
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] text-white/30">
              <span>普及度</span>
              <span>勢い</span>
              <span>評価</span>
              <span>例</span>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          {displayPatterns.map((pattern) => (
            <PatternRow key={pattern.id} pattern={pattern} />
          ))}
        </div>
      </div>

      {/* Emerging vs Declining */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.03] border border-emerald-500/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <h3 className="text-[14px] font-semibold text-white/80">
              上昇トレンド
            </h3>
          </div>
          <div className="space-y-3">
            {["Variable Font Animation", "Bento Grid Layout", "Scroll Snap Gallery", "AI-Generated Gradients"].map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[12px] text-white/60">{name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.03] border border-red-500/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownRight className="w-4 h-4 text-red-400" />
            <h3 className="text-[14px] font-semibold text-white/80">
              下降トレンド
            </h3>
          </div>
          <div className="space-y-3">
            {["Heavy Glassmorphism", "Parallax Scrolling (heavy)", "Hamburger on Desktop", "Full-page Sliders"].map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-[12px] text-white/60">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Dashboard Component
// ============================================================

const TABS: { id: AdminTab; label: string; icon: typeof Brain; color: string }[] = [
  { id: "overview", label: "概要", icon: BarChart3, color: "text-white/60" },
  { id: "ace", label: "ACE Engine", icon: Layers, color: "text-violet-400" },
  { id: "curator", label: "キュレーション", icon: Eye, color: "text-amber-400" },
  { id: "trends", label: "トレンド", icon: TrendingUp, color: "text-cyan-400" },
  { id: "registry", label: "デザイン登録", icon: Palette, color: "text-emerald-400" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const { aceStats, designDNA, evaluations, patterns, loading, refetch } =
    useIntelligenceData(activeTab);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0a0a14]">
      {/* Header */}
      <div className="shrink-0 border-b border-white/[0.06] bg-[#0f0f1a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-[16px] font-bold text-white/90">
                  Aicata Intelligence
                </h1>
                <p className="text-[11px] text-white/30">
                  ACE & ADIS Control Center
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-medium text-emerald-400">
                  システム稼働中
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium rounded-t-lg transition-all border-b-2",
                  activeTab === tab.id
                    ? "text-white bg-white/[0.04] border-accent"
                    : "text-white/40 hover:text-white/60 border-transparent hover:bg-white/[0.02]"
                )}
              >
                <tab.icon
                  className={clsx(
                    "w-3.5 h-3.5",
                    activeTab === tab.id ? tab.color : ""
                  )}
                />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === "overview" && (
            <OverviewTab
              aceStats={aceStats}
              designDNA={designDNA}
              evaluations={evaluations}
              patterns={patterns}
            />
          )}
          {activeTab === "ace" && <ACETab aceStats={aceStats} />}
          {activeTab === "curator" && (
            <CuratorTab
              designDNA={designDNA}
              evaluations={evaluations}
              refetch={refetch}
            />
          )}
          {activeTab === "trends" && <TrendsTab patterns={patterns} refetch={refetch} />}
          {activeTab === "registry" && <DesignRegistryTab />}
        </div>
      </div>
    </div>
  );
}
