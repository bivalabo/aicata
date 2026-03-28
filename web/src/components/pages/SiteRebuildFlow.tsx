"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Globe,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Home,
  LayoutGrid,
  ShoppingBag,
  FileText,
  Settings,
  Palette,
  Type,
  Zap,
  Shield,
  Eye,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import { PAGE_TYPE_LABELS } from "./PageCard";
import SiteMapInfographic from "./SiteMapInfographic";

// ── Types ──

interface DiscoveredPage {
  url: string;
  path: string;
  inferredType: string;
  selected?: boolean;
}

interface PageAnalysis {
  url: string;
  path: string;
  pageType: string;
  title: string;
  description: string;
  headings: string[];
  images: Array<{ src: string; alt: string; context: string }>;
  colors: string[];
  fonts: string[];
  status: "ok" | "error";
  error?: string;
}

interface UnifiedDesignContext {
  dominantColors: string[];
  fonts: string[];
  tones: string[];
  siteName: string;
  industryKeywords: string[];
}

type FlowStep = "welcome" | "input" | "crawling" | "select" | "analyzing" | "review" | "generating" | "preview" | "complete";

const TYPE_ICONS: Record<string, typeof Home> = {
  landing: Home,
  collection: LayoutGrid,
  "list-collections": LayoutGrid,
  product: ShoppingBag,
  about: FileText,
  contact: FileText,
  blog: FileText,
  article: FileText,
  cart: Settings,
  search: Settings,
  general: Settings,
};

interface SiteRebuildFlowProps {
  onClose: () => void;
  onComplete?: (
    analyzedPages: PageAnalysis[],
    context: UnifiedDesignContext,
  ) => void;
  /** 外部（WelcomeScreenなど）から渡されたURL — 指定時はwelcome/inputステップをスキップ */
  initialUrl?: string;
}

export default function SiteRebuildFlow({
  onClose,
  onComplete,
  initialUrl,
}: SiteRebuildFlowProps) {
  const [step, setStep] = useState<FlowStep>(initialUrl ? "crawling" : "welcome");
  const [siteUrl, setSiteUrl] = useState(initialUrl || "");
  const [error, setError] = useState<string | null>(null);

  // Crawl state
  const [discoveredPages, setDiscoveredPages] = useState<DiscoveredPage[]>([]);
  const [storeName, setStoreName] = useState<string>("");
  const [crawlMethod, setCrawlMethod] = useState<string>("");
  const [crawlProgress, setCrawlProgress] = useState<string>("");
  const [ddpCrawlStats, setDdpCrawlStats] = useState<{
    totalPagesFound: number;
    totalPagesCrawled: number;
    totalPagesSkipped: number;
    crawlDurationMs: number;
  } | null>(null);
  const [ddpUnifiedDesign, setDdpUnifiedDesign] = useState<{
    dominantColors: string[];
    fonts: string[];
    tones: string[];
  } | null>(null);

  // Analyze state
  const [analyzedPages, setAnalyzedPages] = useState<PageAnalysis[]>([]);
  const [unifiedContext, setUnifiedContext] =
    useState<UnifiedDesignContext | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);

  // Generate state
  const [generateProgress, setGenerateProgress] = useState(0);
  const [generateCurrent, setGenerateCurrent] = useState("");
  const [generatedPages, setGeneratedPages] = useState<
    Array<{ pageId: string; title: string; pageType: string; path: string; status: string }>
  >([]);
  const [generateTotal, setGenerateTotal] = useState(0);

  // Preview state — track which pages the user wants to keep
  const [previewSelections, setPreviewSelections] = useState<Record<string, boolean>>({});
  const [previewExpanded, setPreviewExpanded] = useState<string | null>(null);

  // ── Auto-start crawl when initialUrl is provided ──
  const initialCrawlTriggered = useRef(false);

  // ── Step 1: Crawl ──
  const handleCrawl = useCallback(async () => {
    if (!siteUrl.trim()) return;
    setError(null);
    setStep("crawling");

    try {
      const res = await fetch("/api/site-crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: siteUrl.trim() }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setStep("input");
        return;
      }

      const pages = (data.pages || []).map(
        (p: DiscoveredPage) => ({
          ...p,
          selected: true,
        }),
      );
      setDiscoveredPages(pages);
      setStoreName(data.storeName || "");
      setCrawlMethod(data.crawlMethod || "");
      setStep("select");
    } catch (err) {
      setError("サイトのクロールに失敗しました");
      setStep("input");
    }
  }, [siteUrl]);

  // ── Step 1b: Deep crawl with DDP Site Crawler ──
  const handleDeepCrawl = useCallback(async () => {
    if (!siteUrl.trim()) return;
    setError(null);
    setStep("crawling");
    setCrawlProgress("サイトに接続中...");

    try {
      const res = await fetch("/api/site-rebuild/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: siteUrl.trim() }),
      });

      if (!res.ok || !res.body) {
        setError("深層クロールに失敗しました");
        setStep("input");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "progress") {
              setCrawlProgress(data.message || `${data.current}/${data.total} ページ`);
            } else if (data.type === "complete") {
              const structure = data.structure;
              if (!structure || !structure.pages) {
                setError("サイト構造の取得に失敗しました");
                setStep("input");
                return;
              }

              const pages = structure.pages
                .filter((p: any) => p.status === "ok")
                .map((p: any) => ({
                  url: p.url,
                  path: p.path,
                  inferredType: p.pageType,
                  title: p.title || p.path,
                  depth: p.depth || 0,
                  selected: true,
                }));

              setDiscoveredPages(pages);
              setStoreName(structure.siteName || "");
              setCrawlMethod("DDP深層クロール");
              setDdpCrawlStats(structure.stats || null);
              setDdpUnifiedDesign(structure.unifiedDesign || null);
              setStep("select");
            } else if (data.type === "error") {
              setError(data.error || "クロールに失敗しました");
              setStep("input");
            }
          } catch {
            // Skip malformed SSE
          }
        }
      }
    } catch (err) {
      setError("深層クロールに失敗しました");
      setStep("input");
    }
  }, [siteUrl]);

  // ── Auto-start deep crawl when initialUrl is provided ──
  useEffect(() => {
    if (initialUrl && !initialCrawlTriggered.current) {
      initialCrawlTriggered.current = true;
      handleDeepCrawl();
    }
  }, [initialUrl, handleDeepCrawl]);

  // ── Step 2: Toggle page selection ──
  const togglePage = useCallback((index: number) => {
    setDiscoveredPages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], selected: !next[index].selected };
      return next;
    });
  }, []);

  const toggleAll = useCallback((selected: boolean) => {
    setDiscoveredPages((prev) => prev.map((p) => ({ ...p, selected })));
  }, []);

  // ── Step 3: Analyze ──
  const handleAnalyze = useCallback(async () => {
    const selectedPages = discoveredPages.filter((p) => p.selected);
    if (selectedPages.length === 0) return;

    setStep("analyzing");
    setAnalyzeProgress(0);
    setError(null);

    let progressInterval: ReturnType<typeof setInterval> | null = null;
    try {
      // Simulate progress (actual progress comes from batch response)
      progressInterval = setInterval(() => {
        setAnalyzeProgress((prev) =>
          Math.min(prev + 100 / selectedPages.length / 3, 90),
        );
      }, 1000);

      const res = await fetch("/api/site-crawl/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages: selectedPages,
          maxPages: 15,
        }),
      });

      setAnalyzeProgress(100);

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setStep("select");
        return;
      }

      setAnalyzedPages(data.pages || []);
      setUnifiedContext(data.unifiedContext || null);
      setStep("review");
    } catch {
      setError("ページの解析に失敗しました");
      setStep("select");
    } finally {
      // 必ずインターバルをクリア（メモリリーク防止）
      if (progressInterval) clearInterval(progressInterval);
    }
  }, [discoveredPages]);

  // ── Step 4: Generate pages ──
  const handleGenerate = useCallback(async () => {
    if (!unifiedContext || analyzedPages.length === 0) return;

    const successfulPages = analyzedPages.filter((p) => p.status === "ok");
    setStep("generating");
    setGenerateProgress(0);
    setGenerateCurrent("");
    setGeneratedPages([]);
    setGenerateTotal(successfulPages.length);

    try {
      const res = await fetch("/api/site-rebuild/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages: successfulPages,
          unifiedContext,
        }),
      });

      if (!res.ok || !res.body) {
        setError("生成リクエストに失敗しました");
        setStep("review");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedDone = false;
      let lastError = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "progress") {
              setGenerateProgress(
                (data.current / data.total) * 100,
              );
              setGenerateCurrent(data.title || data.path || "");
            } else if (data.type === "page_complete") {
              if (data.status === "error" && data.error) {
                lastError = data.error;
              }
              setGeneratedPages((prev) => [
                ...prev,
                {
                  pageId: data.pageId || "",
                  title: data.title || data.path,
                  pageType: data.pageType || "",
                  path: data.path || "",
                  status: data.status,
                },
              ]);
            } else if (data.type === "done") {
              receivedDone = true;
              setGenerateProgress(100);
              if (data.successCount === 0 && data.failedCount > 0) {
                setError("すべてのページの生成に失敗しました。しばらく時間をおいて再度お試しください。");
                setStep("review");
              } else {
                setStep("preview");
              }
            } else if (data.type === "error") {
              lastError = data.error || "";
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }

      // Stream ended without "done" event
      if (!receivedDone) {
        setError(
          "生成が途中で中断されました。しばらく時間をおいて再度お試しください。",
        );
        setStep("review");
      }
    } catch (err) {
      setError("ページ生成中にエラーが発生しました。しばらく時間をおいて再度お試しください。");
      setStep("review");
    }
  }, [analyzedPages, unifiedContext, onComplete]);

  // ── Step 5: Done ──
  const handleFinish = useCallback(() => {
    onClose();
  }, [onClose]);

  const selectedCount = discoveredPages.filter((p) => p.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-[#5b8def] flex items-center justify-center">
              <Globe className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-foreground">
                サイトリデザイン提案
              </h2>
              <p className="text-[12px] text-muted-foreground">
                {step === "welcome" && "はじめにお読みください"}
                {step === "input" && "サイトURLを入力してください"}
                {step === "crawling" && "ページを検出中..."}
                {step === "select" &&
                  `${discoveredPages.length}ページを検出しました`}
                {step === "analyzing" && "ページを解析中..."}
                {step === "review" && "解析結果を確認してください"}
                {step === "generating" && "デザイン案を生成中..."}
                {step === "preview" && "生成されたデザイン案を確認してください"}
                {step === "complete" && "リデザイン完了！"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ── STEP: Welcome ── */}
          {step === "welcome" && (
            <div className="space-y-5">
              {/* Safety banner */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200/50">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-emerald-800 mb-1">
                    既存のサイトには一切影響しません
                  </p>
                  <p className="text-[13px] text-emerald-700 leading-relaxed">
                    この機能は、AIが新しいデザイン案を「ドラフト」として作成するものです。
                    今のShopifyサイトが変更・上書きされることはありません。
                  </p>
                </div>
              </div>

              {/* Flow overview */}
              <div className="bg-accent/[0.03] rounded-xl p-5">
                <h3 className="text-[14px] font-semibold text-foreground mb-4">
                  リデザイン提案の流れ
                </h3>
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0 text-[12px] font-bold text-accent">
                      1
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-foreground">
                        サイトを分析
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        URLを入力すると、AIがサイト構造・デザイン・コンテンツを読み取ります
                      </p>
                    </div>
                  </div>
                  {/* Step 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0 text-[12px] font-bold text-accent">
                      2
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-foreground">
                        デザイン案を生成
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        AIが各ページの新しいデザインを提案します（ドラフトとして保存）
                      </p>
                    </div>
                  </div>
                  {/* Step 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0 text-[12px] font-bold text-accent">
                      3
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-foreground">
                        プレビューして選ぶ
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        生成結果をページごとにプレビューし、気に入ったものだけ採用できます
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra reassurance */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50/70 border border-amber-200/40">
                <Eye className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-[12px] text-amber-800">
                  生成されたデザイン案はすべて「ドラフト」状態です。ご自身で確認・承認するまで公開されることはありません。
                </p>
              </div>
            </div>
          )}

          {/* ── STEP: Input ── */}
          {step === "input" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">
                  Shopifyストアの URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCrawl()}
                    placeholder="https://your-store.myshopify.com"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50"
                    autoFocus
                  />
                  <button
                    onClick={handleDeepCrawl}
                    disabled={!siteUrl.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-accent to-[#5b8def] hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    分析開始
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200/40">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-[13px] text-red-700">{error}</p>
                </div>
              )}

              <div className="bg-accent/[0.03] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[12px] text-emerald-700 font-medium">
                    既存サイトへの影響はありません
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  URLを入力すると、AIがサイト構造を読み取りデザイン案を作成します。
                  生成結果はすべてドラフト保存され、気に入ったページだけを採用できます。
                </p>
              </div>
            </div>
          )}

          {/* ── STEP: Crawling ── */}
          {step === "crawling" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
              <p className="text-[15px] font-medium text-foreground mb-1">
                サイトを分析中...
              </p>
              <p className="text-[13px] text-muted-foreground">
                {crawlProgress || "ページ構造を検出しています"}
              </p>
            </div>
          )}

          {/* ── STEP: Select pages ── */}
          {step === "select" && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2">
                {storeName && (
                  <span className="text-[14px] font-semibold text-foreground">
                    {storeName}
                  </span>
                )}
                <span className="text-[12px] text-muted-foreground bg-black/[0.04] px-2 py-0.5 rounded-full">
                  {crawlMethod}で検出
                </span>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200/40">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-[13px] text-red-700">{error}</p>
                </div>
              )}

              {/* Visual Sitemap Infographic */}
              <div className="max-h-[450px] overflow-y-auto rounded-xl bg-[#0a0a0f] p-4 border border-[#2a2a3a]">
                <SiteMapInfographic
                  siteName={storeName}
                  rootUrl={siteUrl}
                  pages={discoveredPages.map((p) => ({
                    url: p.url,
                    path: p.path,
                    title: (p as any).title || p.path,
                    pageType: p.inferredType,
                    depth: (p as any).depth || 0,
                    status: "ok" as const,
                    selected: p.selected,
                  }))}
                  stats={ddpCrawlStats || undefined}
                  unifiedDesign={ddpUnifiedDesign || undefined}
                  selectable
                  onTogglePage={togglePage}
                  onToggleAll={toggleAll}
                />
              </div>
            </div>
          )}

          {/* ── STEP: Analyzing ── */}
          {step === "analyzing" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-full max-w-xs mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-medium text-foreground">
                    解析中...
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    {Math.round(analyzeProgress)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-[#5b8def] rounded-full transition-all duration-500"
                    style={{ width: `${analyzeProgress}%` }}
                  />
                </div>
              </div>
              <p className="text-[13px] text-muted-foreground">
                各ページのテキスト・画像・カラー・フォントを抽出しています
              </p>
            </div>
          )}

          {/* ── STEP: Review ── */}
          {step === "review" && unifiedContext && (
            <div className="space-y-5">
              {/* Unified Design Context */}
              <div className="bg-accent/[0.03] rounded-xl p-4 space-y-3">
                <h3 className="text-[14px] font-semibold text-foreground">
                  検出されたデザイン情報
                </h3>

                {/* Colors */}
                {unifiedContext.dominantColors.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[12px] text-muted-foreground w-16">
                      カラー
                    </span>
                    <div className="flex gap-1.5">
                      {unifiedContext.dominantColors.map((color) => (
                        <div
                          key={color}
                          className="w-6 h-6 rounded-md border border-border/50 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Fonts */}
                {unifiedContext.fonts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[12px] text-muted-foreground w-16">
                      フォント
                    </span>
                    <span className="text-[13px] text-foreground">
                      {unifiedContext.fonts.join(", ")}
                    </span>
                  </div>
                )}

                {/* Tones */}
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[12px] text-muted-foreground w-16">
                    トーン
                  </span>
                  <div className="flex gap-1.5">
                    {unifiedContext.tones.map((tone) => (
                      <span
                        key={tone}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/8 text-accent"
                      >
                        {tone}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analyzed pages summary */}
              <div>
                <h3 className="text-[14px] font-semibold text-foreground mb-2">
                  解析結果（{analyzedPages.filter((p) => p.status === "ok").length}
                  /{analyzedPages.length} 成功）
                </h3>
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {analyzedPages.map((page) => (
                    <div
                      key={page.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-border/50"
                    >
                      {page.status === "ok" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="flex items-center gap-1 shrink-0" title={page.error || "ページの解析に失敗しました"}>
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-[10px] text-red-500 font-medium">解析失敗</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground truncate">
                          {page.title || page.path}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {page.path}
                          {page.status === "error" && page.error
                            ? ` — ${page.error}`
                            : ""}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground bg-black/[0.04] px-1.5 py-0.5 rounded shrink-0">
                        {PAGE_TYPE_LABELS[page.pageType] || page.pageType}
                      </span>
                      {page.status === "ok" && (
                        <span className="text-[10px] text-muted-foreground">
                          {page.images.length}画像 / {page.colors.length}色
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: Generating ── */}
          {step === "generating" && (
            <div className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200/40">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-[13px] text-red-700">{error}</p>
                </div>
              )}
              <div className="flex flex-col items-center py-4">
                <div className="w-full max-w-sm mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-medium text-foreground">
                      デザイン案を生成中...
                    </span>
                    <span className="text-[13px] text-muted-foreground">
                      {Math.round(generateProgress)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-[#5b8def] rounded-full transition-all duration-700"
                      style={{ width: `${generateProgress}%` }}
                    />
                  </div>
                  {generateCurrent && (
                    <p className="text-[12px] text-muted-foreground mt-2 text-center">
                      {generateCurrent} を生成中
                    </p>
                  )}
                </div>
              </div>

              {/* Generated pages list (live updates) */}
              {generatedPages.length > 0 && (
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {generatedPages.map((gp, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-border/50"
                    >
                      {gp.status === "ok" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="flex items-center gap-1 shrink-0" title="デザイン生成に失敗しました">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-[10px] text-red-500 font-medium">生成失敗</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground truncate">
                          {gp.title || gp.path}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground bg-black/[0.04] px-1.5 py-0.5 rounded">
                        {PAGE_TYPE_LABELS[gp.pageType] || gp.pageType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: Preview & Adopt ── */}
          {step === "preview" && (
            <div className="space-y-4">
              {/* Reassurance */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/40">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-[12px] text-emerald-700">
                  以下はすべて<span className="font-semibold">ドラフト状態</span>です。採用しないページは削除できます。
                </p>
              </div>

              {/* Page cards */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {generatedPages.map((gp) => {
                  const isSelected = previewSelections[gp.pageId] !== false; // default true
                  const isExpanded = previewExpanded === gp.pageId;
                  return (
                    <div
                      key={gp.pageId}
                      className={clsx(
                        "rounded-xl border transition-all",
                        isSelected
                          ? "border-accent/30 bg-white"
                          : "border-border/30 bg-gray-50 opacity-60",
                      )}
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        {/* Checkbox */}
                        <button
                          onClick={() =>
                            setPreviewSelections((prev) => ({
                              ...prev,
                              [gp.pageId]: prev[gp.pageId] === false ? true : false,
                            }))
                          }
                          className={clsx(
                            "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                            isSelected
                              ? "border-accent bg-accent text-white"
                              : "border-gray-300 bg-white",
                          )}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        {/* Page info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-foreground truncate">
                            {gp.title || gp.path}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {PAGE_TYPE_LABELS[gp.pageType] || gp.pageType}
                            <span className="ml-2 text-emerald-600">ドラフト</span>
                          </p>
                        </div>

                        {/* Preview toggle */}
                        <button
                          onClick={() =>
                            setPreviewExpanded(isExpanded ? null : gp.pageId)
                          }
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-accent hover:bg-accent/5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {isExpanded ? "閉じる" : "プレビュー"}
                        </button>
                      </div>

                      {/* Expanded preview iframe */}
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <div className="rounded-lg overflow-hidden border border-border/50 bg-white">
                            <iframe
                              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:system-ui,sans-serif;}</style></head><body><p style="padding:2rem;color:#888;text-align:center;">プレビューはサイトマップから確認できます</p></body></html>`}
                              className="w-full h-[300px] border-0"
                              sandbox="allow-same-origin"
                              title={`Preview: ${gp.title}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP: Complete ── */}
          {step === "complete" && (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-[18px] font-bold text-foreground mb-2">
                リデザイン提案が完了しました
              </h3>
              <p className="text-[14px] text-muted-foreground mb-1">
                {Object.values(previewSelections).filter((v) => v !== false).length > 0
                  ? `${generatedPages.filter((p) => previewSelections[p.pageId] !== false).length}ページのデザイン案を採用しました`
                  : `${generatedPages.filter((p) => p.status === "ok").length}ページのデザイン案ができました`}
              </p>
              <p className="text-[12px] text-muted-foreground">
                サイトマップでプレビュー・編集・Shopifyへデプロイできます
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-border bg-gray-50/50">
          {step === "welcome" && (
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setStep("input")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-accent to-[#5b8def] hover:shadow-lg hover:shadow-accent/20 transition-all"
              >
                はじめる
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === "input" && (
            <div className="flex-1" />
          )}

          {step === "select" && (
            <>
              <span className="text-[13px] text-muted-foreground">
                {selectedCount}ページを選択中
              </span>
              <button
                onClick={handleAnalyze}
                disabled={selectedCount === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-accent to-[#5b8def] hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4" />
                {selectedCount}ページを解析する
              </button>
            </>
          )}

          {step === "analyzing" && (
            <div className="flex-1 text-center">
              <span className="text-[13px] text-muted-foreground">
                しばらくお待ちください...
              </span>
            </div>
          )}

          {step === "review" && (
            <>
              <button
                onClick={() => setStep("select")}
                className="px-4 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:bg-black/[0.04] transition-colors"
              >
                ページ選択に戻る
              </button>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-accent to-[#5b8def] hover:shadow-lg hover:shadow-accent/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                デザイン案を生成する
              </button>
            </>
          )}

          {step === "generating" && (
            <div className="flex-1 text-center">
              <span className="text-[13px] text-muted-foreground">
                AIがデザイン案を生成中です — このまましばらくお待ちください
              </span>
            </div>
          )}

          {step === "preview" && (
            <>
              <span className="text-[12px] text-muted-foreground">
                {generatedPages.filter((p) => previewSelections[p.pageId] !== false).length}
                /{generatedPages.length} ページを採用
              </span>
              <button
                onClick={() => {
                  // TODO: Delete unselected pages from DB if needed
                  onComplete?.(analyzedPages, unifiedContext!);
                  setStep("complete");
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                選択したデザイン案を採用する
              </button>
            </>
          )}

          {step === "complete" && (
            <div className="flex-1 flex justify-end">
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                サイトマップで確認する
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
