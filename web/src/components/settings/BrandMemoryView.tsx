"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Sparkles,
  Palette,
  Type,
  MessageSquare,
  Save,
  Check,
  Loader2,
  AlertCircle,
  Brain,
} from "lucide-react";
import clsx from "clsx";
import EmotionalHearingFlow from "./EmotionalHearingFlow";

interface BrandMemoryData {
  brandName: string;
  brandStory: string;
  industry: string;
  targetAudience: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  colorPalette: string[];
  primaryFont: string;
  bodyFont: string;
  tones: string[];
  voiceTone: string;
  copyKeywords: string[];
  avoidKeywords: string[];
  pageCount: number;
  lastLearnedAt: string | null;
  source: string;
}

const INDUSTRY_OPTIONS = [
  { value: "beauty", label: "ビューティー・コスメ" },
  { value: "food", label: "食品・グルメ" },
  { value: "fashion", label: "ファッション" },
  { value: "lifestyle", label: "ライフスタイル・雑貨" },
  { value: "tech", label: "テック・ガジェット" },
  { value: "health", label: "健康・フィットネス" },
  { value: "general", label: "その他" },
];

const TONE_OPTIONS = [
  { value: "luxury", label: "高級感" },
  { value: "natural", label: "ナチュラル" },
  { value: "modern", label: "モダン" },
  { value: "playful", label: "ポップ" },
  { value: "minimal", label: "ミニマル" },
  { value: "bold", label: "大胆" },
  { value: "elegant", label: "エレガント" },
  { value: "warm", label: "あたたかみ" },
  { value: "cool", label: "クール" },
  { value: "traditional", label: "和風" },
];

// ── カラーパレット定義 ──
interface ColorPalette {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  extra: string; // グラデーション表示用の4色目
  tones: string[]; // マッチするトーン
  industries: string[]; // マッチする業種
}

const COLOR_PALETTES: ColorPalette[] = [
  // ── ナチュラル / 食品系 ──
  { id: "warm-earth", name: "Warm Earth", description: "自然の温かみを感じるアースカラー",
    primary: "#8B6F47", secondary: "#D4C5A9", accent: "#C17817", extra: "#F5EFE6",
    tones: ["natural", "warm"], industries: ["food", "lifestyle", "health"] },
  { id: "fresh-green", name: "Fresh Green", description: "清潔感と健康的な印象",
    primary: "#2D6A4F", secondary: "#95D5B2", accent: "#40916C", extra: "#D8F3DC",
    tones: ["natural", "cool"], industries: ["food", "health"] },
  { id: "citrus-pop", name: "Citrus Pop", description: "フレッシュで活力ある配色",
    primary: "#E36414", secondary: "#FFF3E0", accent: "#FB8500", extra: "#FFB703",
    tones: ["playful", "warm", "bold"], industries: ["food", "lifestyle"] },

  // ── モダン / テック系 ──
  { id: "midnight-blue", name: "Midnight Blue", description: "信頼感と先進性を両立",
    primary: "#1B2838", secondary: "#E8EDF2", accent: "#3B82F6", extra: "#60A5FA",
    tones: ["modern", "cool", "minimal"], industries: ["tech", "general"] },
  { id: "neon-minimal", name: "Neon Minimal", description: "洗練されたミニマルにアクセント",
    primary: "#0F0F0F", secondary: "#FAFAFA", accent: "#7C5CFC", extra: "#A78BFA",
    tones: ["modern", "minimal", "bold"], industries: ["tech", "fashion"] },
  { id: "soft-tech", name: "Soft Tech", description: "やわらかいテクノロジー感",
    primary: "#4A5568", secondary: "#F7FAFC", accent: "#48BB78", extra: "#9AE6B4",
    tones: ["modern", "natural", "minimal"], industries: ["tech", "health"] },

  // ── ラグジュアリー / ビューティー系 ──
  { id: "rose-gold", name: "Rose Gold", description: "上品で華やかなフェミニン配色",
    primary: "#2D2D2D", secondary: "#FDF2F8", accent: "#BE185D", extra: "#F9A8D4",
    tones: ["luxury", "elegant"], industries: ["beauty", "fashion"] },
  { id: "noir-elegant", name: "Noir Elegant", description: "ブラック×ゴールドの高級感",
    primary: "#1A1A1A", secondary: "#F5F0EB", accent: "#C9A96E", extra: "#E8D5B5",
    tones: ["luxury", "elegant", "bold"], industries: ["beauty", "fashion", "lifestyle"] },
  { id: "lavender-mist", name: "Lavender Mist", description: "やさしく癒されるパステル",
    primary: "#4C1D95", secondary: "#F5F3FF", accent: "#8B5CF6", extra: "#C4B5FD",
    tones: ["elegant", "warm"], industries: ["beauty", "health"] },

  // ── 和風 / トラディショナル ──
  { id: "wabi-sabi", name: "侘寂 -Wabi Sabi-", description: "日本の美意識を映す配色",
    primary: "#3E3A39", secondary: "#F6F1EB", accent: "#8B4513", extra: "#C9B99A",
    tones: ["traditional", "natural", "warm"], industries: ["food", "lifestyle"] },
  { id: "indigo-craft", name: "藍 -Indigo Craft-", description: "藍染めから着想した深い青",
    primary: "#1E3A5F", secondary: "#F0F4F8", accent: "#264F78", extra: "#6B8DAF",
    tones: ["traditional", "cool", "minimal"], industries: ["fashion", "lifestyle", "general"] },

  // ── ポップ / カジュアル ──
  { id: "candy-dream", name: "Candy Dream", description: "遊び心あるカラフル配色",
    primary: "#7C3AED", secondary: "#FFF7ED", accent: "#F472B6", extra: "#FBBF24",
    tones: ["playful", "bold"], industries: ["fashion", "lifestyle", "general"] },
  { id: "ocean-breeze", name: "Ocean Breeze", description: "開放的な海辺のリゾート感",
    primary: "#0C4A6E", secondary: "#F0F9FF", accent: "#0EA5E9", extra: "#7DD3FC",
    tones: ["cool", "natural", "playful"], industries: ["lifestyle", "health", "general"] },
];

export default function BrandMemoryView() {
  const [memory, setMemory] = useState<BrandMemoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeConnected, setStoreConnected] = useState(false);
  const [storeName, setStoreName] = useState("");

  // Draft state for editing
  const [draft, setDraft] = useState<Partial<BrandMemoryData>>({});

  const fetchMemory = useCallback(async () => {
    try {
      const res = await fetch("/api/brand-memory");
      const data = await res.json();
      setStoreConnected(!!data.storeId);
      setStoreName(data.storeName || "");
      if (data.memory) {
        setMemory(data.memory);
        setDraft(data.memory);
      } else {
        // Initialize with empty data
        const empty: BrandMemoryData = {
          brandName: data.storeName || "",
          brandStory: "",
          industry: "general",
          targetAudience: "",
          primaryColor: "",
          secondaryColor: "",
          accentColor: "",
          colorPalette: [],
          primaryFont: "",
          bodyFont: "",
          tones: [],
          voiceTone: "",
          copyKeywords: [],
          avoidKeywords: [],
          pageCount: 0,
          lastLearnedAt: null,
          source: "manual",
        };
        setMemory(null);
        setDraft(empty);
      }
    } catch {
      setError("Brand Memoryの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemory();
  }, [fetchMemory]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/brand-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        fetchMemory();
      }
    } catch {
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const updateDraft = (key: string, value: any) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const toggleTone = (tone: string) => {
    const current = (draft.tones || []) as string[];
    if (current.includes(tone)) {
      updateDraft(
        "tones",
        current.filter((t) => t !== tone),
      );
    } else if (current.length < 3) {
      updateDraft("tones", [...current, tone]);
    }
  };

  // 未保存の変更があるかどうかを検出
  const hasChanges = useMemo(() => {
    if (!memory && !draft.brandName) return false; // 初期状態
    if (!memory) return true; // 新規作成
    const keys = Object.keys(draft) as (keyof BrandMemoryData)[];
    return keys.some((key) => {
      const draftVal = JSON.stringify(draft[key] ?? "");
      const memVal = JSON.stringify(memory[key] ?? "");
      return draftVal !== memVal;
    });
  }, [draft, memory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-[#5b8def] flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-[22px] font-bold text-foreground">
            Brand Memory
          </h2>
          <p className="text-[15px] text-muted-foreground">
            相方があなたのブランドを記憶し、すべてのページに一貫して反映します
          </p>
        </div>
      </div>

      {/* Status indicator */}
      {memory && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-accent/[0.04] border border-accent/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-[14px] font-medium text-accent">
              Brand Memory 有効
            </span>
          </div>
          <span className="text-[13px] text-muted-foreground">
            {memory.pageCount}ページ生成済み
          </span>
          {memory.lastLearnedAt && (
            <span className="text-[13px] text-muted-foreground">
              最終学習: {new Date(memory.lastLearnedAt).toLocaleDateString("ja-JP")}
            </span>
          )}
          <span className="text-[13px] text-muted-foreground bg-black/[0.04] px-2 py-1 rounded">
            {memory.source === "crawl"
              ? "サイト解析から学習"
              : memory.source === "learned"
                ? "自動学習"
                : "手動設定"}
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200/40">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-[14px] text-red-700">{error}</p>
        </div>
      )}

      {/* ── Emotional DNA Hearing ── */}
      <EmotionalHearingFlow />

      {/* ── Brand Basics ── */}
      <Section title="ブランド基本情報" icon={Sparkles}>
        <Field label="ブランド名">
          <input
            type="text"
            value={draft.brandName || ""}
            onChange={(e) => updateDraft("brandName", e.target.value)}
            placeholder="例: My Beautiful Store"
            className="input-field"
          />
        </Field>
        <Field label="業種">
          <select
            value={draft.industry || "general"}
            onChange={(e) => updateDraft("industry", e.target.value)}
            className="input-field"
          >
            {INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ターゲット顧客">
          <input
            type="text"
            value={draft.targetAudience || ""}
            onChange={(e) => updateDraft("targetAudience", e.target.value)}
            placeholder="例: 30代の働く女性、オーガニック志向"
            className="input-field"
          />
        </Field>
        <Field label="ブランドストーリー" description="AIがコピーライティングの参考にします">
          <textarea
            value={draft.brandStory || ""}
            onChange={(e) => updateDraft("brandStory", e.target.value)}
            placeholder="ブランドの世界観、理念、こだわりを自由に記述してください..."
            rows={3}
            className="input-field resize-none"
          />
        </Field>
      </Section>

      {/* ── Design Identity（パレット版 v2） ── */}
      <Section title="デザインアイデンティティ" icon={Palette}>
        <Field label="デザイントーン" description="ブランドの雰囲気を選んでください（最大3つ）">
          <div className="flex flex-wrap gap-2.5">
            {TONE_OPTIONS.map((tone) => {
              const isSelected = (draft.tones || []).includes(tone.value);
              return (
                <button
                  key={tone.value}
                  onClick={() => toggleTone(tone.value)}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-[14px] font-medium transition-all border",
                    isSelected
                      ? "bg-accent/8 text-accent border-accent/30"
                      : "text-muted-foreground border-border hover:border-border-hover hover:text-foreground",
                  )}
                >
                  {tone.label}
                </button>
              );
            })}
          </div>
        </Field>

        <PaletteSelector
          selectedTones={(draft.tones || []) as string[]}
          industry={(draft.industry || "general") as string}
          currentPrimary={draft.primaryColor || ""}
          onSelect={(palette) => {
            updateDraft("primaryColor", palette.primary);
            updateDraft("secondaryColor", palette.secondary);
            updateDraft("accentColor", palette.accent);
          }}
        />

        {/* 選択中のカラー（微調整用） */}
        {draft.primaryColor && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-medium text-foreground">選択中のカラー</span>
              <button
                onClick={() => {
                  updateDraft("primaryColor", "");
                  updateDraft("secondaryColor", "");
                  updateDraft("accentColor", "");
                }}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                リセット
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <ColorField
                label="メイン"
                value={draft.primaryColor || ""}
                onChange={(v) => updateDraft("primaryColor", v)}
              />
              <ColorField
                label="サブ"
                value={draft.secondaryColor || ""}
                onChange={(v) => updateDraft("secondaryColor", v)}
              />
              <ColorField
                label="アクセント"
                value={draft.accentColor || ""}
                onChange={(v) => updateDraft("accentColor", v)}
              />
            </div>
            <p className="text-[14px] text-muted-foreground">パレットをベースに微調整できます</p>
          </div>
        )}
      </Section>

      {/* ── Typography ── */}
      <Section title="タイポグラフィ" icon={Type}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="見出しフォント">
            <input
              type="text"
              value={draft.primaryFont || ""}
              onChange={(e) => updateDraft("primaryFont", e.target.value)}
              placeholder="例: Noto Serif JP"
              className="input-field"
            />
          </Field>
          <Field label="本文フォント">
            <input
              type="text"
              value={draft.bodyFont || ""}
              onChange={(e) => updateDraft("bodyFont", e.target.value)}
              placeholder="例: Noto Sans JP"
              className="input-field"
            />
          </Field>
        </div>
      </Section>

      {/* ── Voice & Tone ── */}
      <Section title="コミュニケーションスタイル" icon={MessageSquare}>
        <Field label="語り口" description="AIのコピーライティングに影響します">
          <input
            type="text"
            value={draft.voiceTone || ""}
            onChange={(e) => updateDraft("voiceTone", e.target.value)}
            placeholder="例: 親しみやすくカジュアル / フォーマルで上品"
            className="input-field"
          />
        </Field>
        <Field label="好む表現（カンマ区切り）">
          <input
            type="text"
            value={(draft.copyKeywords || []).join(", ")}
            onChange={(e) =>
              updateDraft(
                "copyKeywords",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            placeholder="例: 上質な, こだわりの, 厳選された"
            className="input-field"
          />
        </Field>
        <Field label="避けたい表現（カンマ区切り）">
          <input
            type="text"
            value={(draft.avoidKeywords || []).join(", ")}
            onChange={(e) =>
              updateDraft(
                "avoidKeywords",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            placeholder="例: 激安, お得, 爆売れ"
            className="input-field"
          />
        </Field>
      </Section>

      {/* Inline styles for form fields */}
      <style jsx global>{`
        .input-field {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: white;
          font-size: 15px;
          color: #111827;
          transition: all 0.15s;
          outline: none;
        }
        .input-field:focus {
          border-color: rgba(124, 92, 252, 0.4);
          box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.08);
        }
        .input-field::placeholder {
          color: #9ca3af;
        }
      `}</style>

      {/* ── Sticky Save Bar ── */}
      <div
        className={clsx(
          "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
          hasChanges
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none",
        )}
      >
        <div className="max-w-3xl mx-auto px-8 pb-6">
          <div className="flex items-center justify-between gap-4 px-6 py-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-border shadow-lg shadow-black/[0.08]">
            <p className="text-[14px] text-muted-foreground">
              未保存の変更があります
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className={clsx(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all",
                "bg-gradient-to-r from-accent to-[#5b8def] text-white",
                "hover:shadow-lg hover:shadow-accent/25 active:scale-[0.97]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "保存中..." : "変更を保存"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Save Success Toast ── */}
      <div
        className={clsx(
          "fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out",
          saved
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0 pointer-events-none",
        )}
      >
        <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
          <Check className="w-4 h-4" />
          <span className="text-[14px] font-medium">保存しました</span>
        </div>
      </div>
    </div>
  );
}

// ── Palette Selector ──

function PaletteSelector({
  selectedTones,
  industry,
  currentPrimary,
  onSelect,
}: {
  selectedTones: string[];
  industry: string;
  currentPrimary: string;
  onSelect: (palette: ColorPalette) => void;
}) {
  // トーン・業種に基づいてパレットをスコアリング
  const sortedPalettes = useMemo(() => {
    return [...COLOR_PALETTES]
      .map((p) => {
        let score = 0;
        // トーンが一致するほど高スコア
        for (const tone of selectedTones) {
          if (p.tones.includes(tone)) score += 3;
        }
        // 業種が一致
        if (p.industries.includes(industry)) score += 2;
        return { ...p, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [selectedTones, industry]);

  const hasRecommendations = selectedTones.length > 0 || industry !== "general";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[14px] font-medium text-foreground">配色パレット</span>
        {hasRecommendations && (
          <span className="text-[12px] text-accent bg-accent/8 px-2 py-0.5 rounded">
            おすすめ順
          </span>
        )}
      </div>
      <p className="text-[13px] text-muted-foreground">
        好みの配色を選んでください。サイト全体に適用されます。
      </p>
      <div className="grid grid-cols-2 gap-3">
        {sortedPalettes.map((palette) => {
          const isActive = currentPrimary === palette.primary;
          return (
            <button
              key={palette.id}
              onClick={() => onSelect(palette)}
              className={clsx(
                "group relative text-left p-4 rounded-xl border transition-all",
                isActive
                  ? "border-accent/40 bg-accent/[0.04] ring-1 ring-accent/20"
                  : "border-border/60 bg-white hover:border-border-hover hover:shadow-sm",
              )}
            >
              {/* カラースウォッチ */}
              <div className="flex gap-1 mb-2.5">
                {[palette.primary, palette.secondary, palette.accent, palette.extra].map(
                  (color, i) => (
                    <div
                      key={i}
                      className={clsx(
                        "h-6 rounded-md transition-all",
                        i === 0 ? "flex-[3]" : i === 1 ? "flex-[2]" : "flex-[1.5]",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ),
                )}
              </div>
              {/* パレット名 & 説明 */}
              <div className="text-[14px] font-medium text-foreground leading-tight">
                {palette.name}
              </div>
              <div className="text-[13px] text-muted-foreground mt-1 leading-snug">
                {palette.description}
              </div>
              {/* 選択マーク */}
              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Helper components ──

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Sparkles;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
        <Icon className="w-5 h-5 text-accent" />
        <h3 className="text-[17px] font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[15px] font-medium text-foreground mb-2">
        {label}
      </label>
      {description && (
        <p className="text-[14px] text-muted-foreground mb-2.5">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[15px] font-medium text-foreground mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2.5">
        <input
          type="color"
          value={value || "#7c5cfc"}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-border cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="input-field flex-1"
        />
      </div>
    </div>
  );
}
