"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Heart,
  Sparkles,
  Brain,
  Palette,
  ChevronRight,
  MessageCircle,
  Layers,
  Type,
  Paintbrush,
} from "lucide-react";
import clsx from "clsx";

const BrandMemoryView = dynamic(
  () => import("@/components/settings/BrandMemoryView"),
  {
    loading: () => <BrandLoadingState />,
  },
);

function BrandLoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground text-sm">
        読み込み中...
      </div>
    </div>
  );
}

type BrandTab = "hearing" | "memory";

const TABS: { id: BrandTab; label: string; icon: typeof Heart; description: string }[] = [
  { id: "hearing", label: "ブランド対話", icon: MessageCircle, description: "対話からDNAを構築" },
  { id: "memory", label: "ブランドメモリー", icon: Brain, description: "蓄積された記憶を確認" },
];

export default function BrandView() {
  const [activeTab, setActiveTab] = useState<BrandTab>("hearing");

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-slate-50/50 to-white">
      {/* Brand Header */}
      <div className="shrink-0 border-b border-border/50 bg-white/80 backdrop-blur-sm">
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Heart className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-foreground tracking-tight">
                Brand
              </h1>
              <p className="text-[13px] text-muted-foreground">
                あなたのブランドの本質を対話から引き出す
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
                    ? "text-foreground border-violet-500 bg-white"
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
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {activeTab === "hearing" && (
          <EmotionalHearingLanding onSwitchToMemory={() => setActiveTab("memory")} />
        )}
        {activeTab === "memory" && (
          <BrandMemoryWithSummary onSwitchToHearing={() => setActiveTab("hearing")} />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Emotional Hearing Landing — Brand対話のエントリーポイント
// ============================================================

function EmotionalHearingLanding({ onSwitchToMemory }: { onSwitchToMemory: () => void }) {
  const EmotionalHearingFlow = dynamic(
    () => import("@/components/settings/EmotionalHearingFlow"),
    {
      loading: () => <BrandLoadingState />,
    },
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Intro Card */}
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100/60">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm shrink-0">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-semibold text-foreground mb-1">
                Emotional Hearing
              </h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">
                AIとの自然な対話を通じて、あなたのブランドの本質—想い、価値観、世界観—を引き出します。
                対話からブランドDNAを自動的に構築します。
              </p>
              <button
                onClick={onSwitchToMemory}
                className="inline-flex items-center gap-1.5 text-[12px] text-violet-600 font-medium hover:text-violet-700 transition-colors"
              >
                <Brain className="w-3.5 h-3.5" />
                蓄積されたブランドメモリーを確認する
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Hearing Flow */}
        <EmotionalHearingFlow />
      </div>
    </div>
  );
}

// ============================================================
// Brand Memory with Summary Dashboard
// ============================================================

interface BrandMemorySummary {
  brandName: string;
  industry: string;
  tones: string[];
  targetAudience: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
}

function BrandMemoryWithSummary({ onSwitchToHearing }: { onSwitchToHearing: () => void }) {
  const [summary, setSummary] = useState<BrandMemorySummary | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetch("/api/brand-memory")
      .then((r) => r.json())
      .then((data) => {
        if (data.memory) {
          setSummary({
            brandName: data.memory.brandName || "",
            industry: data.memory.industry || "general",
            tones: data.memory.tones || [],
            targetAudience: data.memory.targetAudience || "",
            primaryColor: data.memory.primaryColor || "",
            secondaryColor: data.memory.secondaryColor || "",
            accentColor: data.memory.accentColor || "",
            headingFont: data.memory.headingFont || "",
            bodyFont: data.memory.bodyFont || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const hasData = summary && (summary.brandName || summary.industry !== "general" || summary.tones.length > 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Summary Dashboard */}
        {hasData ? (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-white to-violet-50/30 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-500" />
                <h2 className="text-[15px] font-semibold text-foreground">
                  {summary!.brandName || "ブランド"} のメモリー
                </h2>
              </div>
              <button
                onClick={onSwitchToHearing}
                className="inline-flex items-center gap-1.5 text-[12px] text-violet-600 font-medium hover:text-violet-700 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                対話で更新する
              </button>
            </div>

            {/* Quick summary cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Tones */}
              {summary!.tones.length > 0 && (
                <div className="p-3 rounded-xl bg-white/80 border border-border/30">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Palette className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-[11px] text-muted-foreground font-medium">トーン</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {summary!.tones.map((tone) => (
                      <span
                        key={tone}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-medium"
                      >
                        {tone}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {(summary!.primaryColor || summary!.accentColor) && (
                <div className="p-3 rounded-xl bg-white/80 border border-border/30">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Paintbrush className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-[11px] text-muted-foreground font-medium">カラー</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[summary!.primaryColor, summary!.secondaryColor, summary!.accentColor]
                      .filter(Boolean)
                      .map((color, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div
                            className="w-5 h-5 rounded-md border border-border/40 shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {color}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Typography */}
              {(summary!.headingFont || summary!.bodyFont) && (
                <div className="p-3 rounded-xl bg-white/80 border border-border/30">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Type className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-[11px] text-muted-foreground font-medium">フォント</span>
                  </div>
                  <div className="space-y-1">
                    {summary!.headingFont && (
                      <p className="text-[11px] text-foreground">
                        見出し: <span className="font-medium">{summary!.headingFont}</span>
                      </p>
                    )}
                    {summary!.bodyFont && (
                      <p className="text-[11px] text-foreground">
                        本文: <span className="font-medium">{summary!.bodyFont}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Target */}
              {summary!.targetAudience && (
                <div className="p-3 rounded-xl bg-white/80 border border-border/30">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Layers className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-[11px] text-muted-foreground font-medium">ターゲット</span>
                  </div>
                  <p className="text-[11px] text-foreground leading-relaxed">
                    {summary!.targetAudience}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-violet-50/50 to-indigo-50/50 border border-dashed border-violet-200/50 text-center">
            <Sparkles className="w-6 h-6 text-violet-300 mx-auto mb-2" />
            <p className="text-[14px] text-foreground font-medium mb-1">
              まだブランドメモリーがありません
            </p>
            <p className="text-[12px] text-muted-foreground mb-3">
              ブランド対話からAIと会話して、あなたのブランドDNAを構築しましょう
            </p>
            <button
              onClick={onSwitchToHearing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-violet-500 to-indigo-600 shadow-sm hover:shadow-md transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              ブランド対話を始める
            </button>
          </div>
        )}

        {/* Advanced Settings Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ChevronRight
            className={clsx(
              "w-3.5 h-3.5 transition-transform duration-200",
              showAdvanced && "rotate-90",
            )}
          />
          詳細設定を{showAdvanced ? "隠す" : "表示する"}
        </button>

        {/* Legacy Manual Config (collapsed by default) */}
        {showAdvanced && <BrandMemoryView />}
      </div>
    </div>
  );
}
