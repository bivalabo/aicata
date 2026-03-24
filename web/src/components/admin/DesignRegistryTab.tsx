"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Layers,
  LayoutGrid,
  Eye,
  Star,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Palette,
  Type,
  Smartphone,
  Zap,
  BarChart3,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import clsx from "clsx";

// ============================================================
// Types
// ============================================================

interface TemplateData {
  id: string;
  name: string;
  description: string;
  industries: string[];
  tones: string[];
  pageType: string;
  sectionCount: number;
  sectionIds: string[];
  designTokens: {
    colors: Record<string, string>;
    typography: Record<string, string>;
  };
  fonts: { family: string; weights: number[] }[];
}

interface SectionData {
  id: string;
  category: string;
  variant: string;
  name: string;
  description: string;
  tones: string[];
  placeholderCount: number;
  animationCount: number;
  htmlLength: number;
  cssLength: number;
  hqs: {
    visual: number;
    rhythm: number;
    conversion: number;
    mobile: number;
    brand: number;
  } | null;
  hqsComposite: number | null;
  dna: Record<string, number> | null;
  flowsWellAfter: string[] | null;
  flowsWellBefore: string[] | null;
}

interface RegistryStats {
  totalTemplates: number;
  totalSections: number;
  categoryCounts: Record<string, number>;
  industryCount: Record<string, number>;
  avgHQS: number;
}

type ViewMode = "templates" | "sections";

// ============================================================
// Consts
// ============================================================

const CATEGORY_LABELS: Record<string, string> = {
  navigation: "ナビゲーション",
  hero: "ヒーロー",
  products: "商品一覧",
  "product-detail": "商品詳細",
  "related-products": "関連商品",
  collection: "コレクション",
  cart: "カート",
  story: "ストーリー",
  features: "特徴",
  cta: "CTA",
  testimonial: "お客様の声",
  gallery: "ギャラリー",
  footer: "フッター",
  trust: "信頼表示",
  "social-proof": "ソーシャルプルーフ",
  contact: "お問い合わせ",
  search: "検索",
  announcement: "お知らせ",
  breadcrumb: "パンくず",
  "product-reviews": "レビュー",
};

const INDUSTRY_LABELS: Record<string, string> = {
  beauty: "美容",
  fashion: "ファッション",
  food: "食品",
  tech: "テック",
  health: "健康",
  lifestyle: "ライフスタイル",
  general: "汎用",
};

const TONE_LABELS: Record<string, string> = {
  luxury: "ラグジュアリー",
  elegant: "エレガント",
  minimal: "ミニマル",
  modern: "モダン",
  bold: "ボールド",
  natural: "ナチュラル",
  warm: "ウォーム",
  playful: "プレイフル",
  corporate: "コーポレート",
  vintage: "ヴィンテージ",
};

const PAGE_TYPE_LABELS: Record<string, string> = {
  landing: "ランディング",
  product: "商品詳細",
  collection: "コレクション",
  cart: "カート",
  about: "アバウト",
  blog: "ブログ",
  article: "記事",
  contact: "コンタクト",
  "404": "404",
  search: "検索",
  account: "アカウント",
  password: "パスワード",
  "list-collections": "コレクション一覧",
  general: "汎用",
};

const HQS_LABELS: Record<string, { label: string; icon: typeof Eye }> = {
  visual: { label: "ビジュアル", icon: Eye },
  rhythm: { label: "リズム", icon: BarChart3 },
  conversion: { label: "コンバージョン", icon: Zap },
  mobile: { label: "モバイル", icon: Smartphone },
  brand: { label: "ブランド", icon: Palette },
};

// ============================================================
// Sub-components
// ============================================================

function HQSBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color =
    value >= 4.0 ? "bg-emerald-400" :
    value >= 3.0 ? "bg-amber-400" :
    "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={clsx("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-white/50 w-6 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

function DNAMiniChart({ dna }: { dna: Record<string, number> }) {
  const dims = Object.entries(dna);
  return (
    <div className="flex gap-0.5">
      {dims.map(([key, val]) => {
        const pct = ((val + 1) / 2) * 100;
        const h = Math.max(4, Math.round(pct * 0.2));
        return (
          <div key={key} className="flex flex-col items-center justify-end" style={{ height: 20 }}>
            <div
              className="w-1 rounded-full bg-violet-400/60"
              style={{ height: h }}
              title={`${key}: ${val.toFixed(2)}`}
            />
          </div>
        );
      })}
    </div>
  );
}

function TagPill({ text, color = "bg-white/[0.06] text-white/50" }: { text: string; color?: string }) {
  return (
    <span className={clsx("inline-block px-2 py-0.5 rounded text-[9px] font-medium", color)}>
      {text}
    </span>
  );
}

function ColorSwatch({ colors }: { colors: Record<string, string> }) {
  const swatches = Object.entries(colors).slice(0, 6);
  return (
    <div className="flex gap-1">
      {swatches.map(([key, val]) => (
        <div
          key={key}
          className="w-4 h-4 rounded border border-white/10"
          style={{ backgroundColor: val }}
          title={`${key}: ${val}`}
        />
      ))}
    </div>
  );
}

// ============================================================
// Section Preview Modal
// ============================================================

function SectionPreviewModal({
  sectionId,
  sectionName,
  onClose,
}: {
  sectionId: string;
  sectionName: string;
  onClose: () => void;
}) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/section-preview?id=${encodeURIComponent(sectionId)}`)
      .then((r) => r.json())
      .then((data) => {
        setHtml(data.html || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sectionId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className={clsx(
          "bg-[#12121e] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col transition-all duration-300",
          expanded ? "w-[95vw] h-[95vh]" : "w-[900px] max-w-[90vw] h-[700px] max-h-[85vh]",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white/90">{sectionName}</h3>
            <p className="text-[10px] text-white/30 font-mono">{sectionId}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04]">
              {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden bg-white rounded-b-2xl">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-sm text-gray-400">プレビュー読み込み中...</div>
            </div>
          ) : html ? (
            <iframe
              srcDoc={html}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title={`Preview: ${sectionName}`}
              scrolling="yes"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              プレビューを表示できません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Template Card
// ============================================================

function TemplateCard({
  template,
  sections,
  onPreviewSection,
}: {
  template: TemplateData;
  sections: SectionData[];
  onPreviewSection: (id: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sectionMap = useMemo(
    () => new Map(sections.map((s) => [s.id, s])),
    [sections],
  );

  return (
    <div className="bg-[#12121e] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.12] transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.04]">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
                {PAGE_TYPE_LABELS[template.pageType] || template.pageType}
              </span>
              <span className="text-[10px] text-white/20 font-mono">{template.id}</span>
            </div>
            <h3 className="text-sm font-semibold text-white/90 truncate">{template.name}</h3>
            <p className="text-[11px] text-white/40 mt-0.5 line-clamp-2">{template.description}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {template.industries.map((i) => (
            <TagPill key={i} text={INDUSTRY_LABELS[i] || i} color="bg-cyan-500/10 text-cyan-300" />
          ))}
          {template.tones.map((t) => (
            <TagPill key={t} text={TONE_LABELS[t] || t} color="bg-amber-500/10 text-amber-300" />
          ))}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-3 mt-2">
          <ColorSwatch colors={template.designTokens.colors} />
          <span className="text-[10px] text-white/20">{template.sectionCount}セクション</span>
        </div>
      </div>

      {/* Section list toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-[11px] text-white/40 hover:text-white/60 hover:bg-white/[0.02] transition-colors"
      >
        <span>セクション構成</span>
        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-1">
          {template.sectionIds.map((sid, idx) => {
            const sec = sectionMap.get(sid);
            return (
              <div
                key={sid}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-colors"
                onClick={() => onPreviewSection(sid, sec?.name || sid)}
              >
                <span className="text-[10px] text-white/20 w-4">{idx + 1}</span>
                <span className="text-[11px] text-white/60 flex-1 truncate">{sec?.name || sid}</span>
                {sec?.hqsComposite && (
                  <span className={clsx(
                    "text-[9px] font-medium px-1.5 py-0.5 rounded",
                    sec.hqsComposite >= 4 ? "bg-emerald-500/15 text-emerald-400" :
                    sec.hqsComposite >= 3 ? "bg-amber-500/15 text-amber-400" :
                    "bg-red-500/15 text-red-400",
                  )}>
                    HQS {sec.hqsComposite.toFixed(1)}
                  </span>
                )}
                <Eye className="w-3 h-3 text-white/20" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Section Card
// ============================================================

function SectionCard({
  section,
  onPreview,
}: {
  section: SectionData;
  onPreview: () => void;
}) {
  return (
    <div
      className="bg-[#12121e] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-colors cursor-pointer group"
      onClick={onPreview}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40">
              {CATEGORY_LABELS[section.category] || section.category}
            </span>
            {section.animationCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300">
                {section.animationCount} anim
              </span>
            )}
          </div>
          <h4 className="text-[12px] font-semibold text-white/80 truncate">{section.name}</h4>
          <p className="text-[10px] text-white/30 mt-0.5 font-mono">{section.id}</p>
        </div>
        <Eye className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors shrink-0 mt-1" />
      </div>

      {/* Tones */}
      <div className="flex flex-wrap gap-1 mb-3">
        {section.tones.slice(0, 3).map((t) => (
          <TagPill key={t} text={TONE_LABELS[t] || t} />
        ))}
        {section.tones.length > 3 && (
          <TagPill text={`+${section.tones.length - 3}`} />
        )}
      </div>

      {/* HQS scores */}
      {section.hqs && (
        <div className="space-y-1 mb-3">
          {Object.entries(section.hqs).map(([key, val]) => {
            const info = HQS_LABELS[key];
            if (!info) return null;
            return (
              <div key={key} className="flex items-center gap-2">
                <info.icon className="w-3 h-3 text-white/20 shrink-0" />
                <span className="text-[9px] text-white/30 w-16">{info.label}</span>
                <HQSBar value={val} />
              </div>
            );
          })}
          {section.hqsComposite !== null && (
            <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
              <Star className="w-3 h-3 text-amber-400/60 shrink-0" />
              <span className="text-[9px] text-white/40 w-16">総合</span>
              <HQSBar value={section.hqsComposite} />
            </div>
          )}
        </div>
      )}

      {/* DNA mini */}
      {section.dna && (
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/20">DNA</span>
          <DNAMiniChart dna={section.dna} />
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/[0.04]">
        <span className="text-[9px] text-white/20">{section.placeholderCount} placeholders</span>
        <span className="text-[9px] text-white/20">{(section.htmlLength / 1024).toFixed(1)}KB HTML</span>
        <span className="text-[9px] text-white/20">{(section.cssLength / 1024).toFixed(1)}KB CSS</span>
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function DesignRegistryTab() {
  const [data, setData] = useState<{
    templates: TemplateData[];
    sections: SectionData[];
    stats: RegistryStats;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [previewSection, setPreviewSection] = useState<{ id: string; name: string } | null>(null);

  // Fetch data
  useEffect(() => {
    fetch("/api/admin/design-registry")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filtered data
  const filteredTemplates = useMemo(() => {
    if (!data) return [];
    let list = data.templates;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.industries.some((i) => i.includes(q)) ||
          t.tones.some((t) => t.includes(q)),
      );
    }
    return list;
  }, [data, searchQuery]);

  const filteredSections = useMemo(() => {
    if (!data) return [];
    let list = data.sections;
    if (categoryFilter) {
      list = list.filter((s) => s.category === categoryFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [data, searchQuery, categoryFilter]);

  const categories = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.stats.categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({ cat, count }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-white/30 text-sm">デザインレジストリを読み込み中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-red-400/60 text-sm">読み込みに失敗しました</div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-[#12121e] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <LayoutGrid className="w-4 h-4 text-violet-400" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">テンプレート</span>
          </div>
          <span className="text-2xl font-bold text-white/90">{data.stats.totalTemplates}</span>
        </div>
        <div className="bg-[#12121e] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">セクション</span>
          </div>
          <span className="text-2xl font-bold text-white/90">{data.stats.totalSections}</span>
        </div>
        <div className="bg-[#12121e] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">平均HQS</span>
          </div>
          <span className="text-2xl font-bold text-white/90">{data.stats.avgHQS.toFixed(1)}</span>
          <span className="text-[10px] text-white/20 ml-1">/ 5.0</span>
        </div>
        <div className="bg-[#12121e] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">カテゴリ</span>
          </div>
          <span className="text-2xl font-bold text-white/90">{Object.keys(data.stats.categoryCounts).length}</span>
        </div>
      </div>

      {/* View mode + Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex bg-white/[0.04] rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("templates")}
            className={clsx(
              "px-3 py-1.5 rounded-md text-[11px] font-medium transition-all",
              viewMode === "templates"
                ? "bg-violet-500/20 text-violet-300"
                : "text-white/30 hover:text-white/50",
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
            テンプレート ({data.stats.totalTemplates})
          </button>
          <button
            onClick={() => setViewMode("sections")}
            className={clsx(
              "px-3 py-1.5 rounded-md text-[11px] font-medium transition-all",
              viewMode === "sections"
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-white/30 hover:text-white/50",
            )}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
            セクション ({data.stats.totalSections})
          </button>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="検索..."
            className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[11px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/[0.15]"
          />
        </div>

        {/* Category filter (sections view only) */}
        {viewMode === "sections" && (
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-white/20" />
            <select
              value={categoryFilter || ""}
              onChange={(e) => setCategoryFilter(e.target.value || null)}
              className="bg-white/[0.04] border border-white/[0.06] rounded-lg text-[11px] text-white/60 px-2 py-2 focus:outline-none"
            >
              <option value="">全カテゴリ</option>
              {categories.map(({ cat, count }) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat] || cat} ({count})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Template Grid */}
      {viewMode === "templates" && (
        <div className="grid grid-cols-2 gap-4">
          {filteredTemplates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              sections={data.sections}
              onPreviewSection={(id, name) => setPreviewSection({ id, name })}
            />
          ))}
          {filteredTemplates.length === 0 && (
            <div className="col-span-2 text-center py-12 text-white/20 text-sm">
              該当するテンプレートが見つかりません
            </div>
          )}
        </div>
      )}

      {/* Section Grid */}
      {viewMode === "sections" && (
        <div className="grid grid-cols-3 gap-3">
          {filteredSections.map((s) => (
            <SectionCard
              key={s.id}
              section={s}
              onPreview={() => setPreviewSection({ id: s.id, name: s.name })}
            />
          ))}
          {filteredSections.length === 0 && (
            <div className="col-span-3 text-center py-12 text-white/20 text-sm">
              該当するセクションが見つかりません
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewSection && (
        <SectionPreviewModal
          sectionId={previewSection.id}
          sectionName={previewSection.name}
          onClose={() => setPreviewSection(null)}
        />
      )}
    </div>
  );
}
