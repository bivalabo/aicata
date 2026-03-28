"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Layout,
  Palette,
  Store,
  ShoppingBag,
  Grid3X3,
  ShoppingCart,
  Globe,
  Link2,
  ArrowLeft,
  Loader2,
  Rocket,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";

// ============================================================
// Types
// ============================================================

interface WelcomeScreenProps {
  onSelectTemplate: (prompt: string, pageType?: string) => void;
  /** サイト全体構築フローを開始 */
  onStartSiteBuild?: (mode: "new" | "rebuild" | "page-rebuild", url?: string) => void;
  /** Brand Memoryが有効かどうか */
  hasBrandMemory?: boolean;
  brandName?: string;
}

/** 個別ページ作成アクション */
interface PageAction {
  icon: React.ElementType;
  title: string;
  description: string;
  pageType: string;
  prompt: string;
  iconBg: string;
}

// ============================================================
// Action Definitions
// ============================================================

/** 個別ページタイプ — サブメニュー用 */
const INDIVIDUAL_PAGE_ACTIONS: PageAction[] = [
  {
    icon: Store,
    title: "トップページ",
    description: "ストアのホームページ",
    pageType: "top",
    prompt: "Shopifyストアのトップページを作成してください。",
    iconBg: "bg-violet-500",
  },
  {
    icon: ShoppingBag,
    title: "商品詳細ページ",
    description: "プロダクトページ",
    pageType: "product",
    prompt: "商品を魅力的に紹介するページを作成してください。",
    iconBg: "bg-blue-500",
  },
  {
    icon: Grid3X3,
    title: "コレクションページ",
    description: "カテゴリー一覧",
    pageType: "collection",
    prompt: "商品コレクション（カテゴリー）ページを作成してください。",
    iconBg: "bg-teal-500",
  },
  {
    icon: Palette,
    title: "ブランドページ",
    description: "About・ストーリー",
    pageType: "about",
    prompt: "ブランドの世界観を伝える「私たちについて」ページを作成してください。",
    iconBg: "bg-pink-500",
  },
  {
    icon: Layout,
    title: "ランディングページ",
    description: "キャンペーンLP",
    pageType: "landing",
    prompt: "キャンペーン用のランディングページを作成してください。",
    iconBg: "bg-orange-500",
  },
  {
    icon: ShoppingCart,
    title: "カートページ",
    description: "購入フロー",
    pageType: "cart",
    prompt: "カートページのデザインを改善したいです。",
    iconBg: "bg-emerald-500",
  },
];

// ============================================================
// Sub-components
// ============================================================

/** URL入力モードのフォーム */
function UrlImportForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (url: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    } catch {
      return;
    }
    setIsValidating(true);
    onSubmit(trimmed);
  }, [url, onSubmit]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/15">
          <RefreshCw className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          既存サイトをリビルド
        </h2>
        <p className="text-[15px] text-muted leading-relaxed">
          URLを入力すると、デザインや構造を解析して
          <br />
          Shopifyテーマとして再構築します
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="https://example.com"
            className={clsx(
              "w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white/70",
              "text-[14px] text-foreground placeholder:text-muted-foreground/50",
              "outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10",
              "transition-all duration-200",
            )}
            autoFocus
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!url.trim() || isValidating}
          className={clsx(
            "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl",
            "bg-gradient-to-r from-[#7c5cfc] to-[#5b8def]",
            "text-white text-[14px] font-semibold",
            "shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isValidating ? "分析中..." : "サイトをリビルドする"}
        </motion.button>

        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 mx-auto text-[13px] text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </button>
      </div>

      <div className="mt-8 p-4 rounded-xl bg-black/[0.02] border border-border/30">
        <p className="text-[12px] text-muted-foreground leading-relaxed text-center">
          対応サイト: Shopify, WordPress, Wix, その他HTML/CSSサイト
          <br />
          デザイントーン・配色・レイアウト構造を自動解析します
        </p>
      </div>
    </motion.div>
  );
}

/** 既存ページをリビルド — 単一ページURL入力フォーム */
function PageUrlImportForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (url: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    } catch {
      return;
    }
    setIsValidating(true);
    onSubmit(trimmed);
  }, [url, onSubmit]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-sky-500/15">
          <Globe className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          既存ページをリビルド
        </h2>
        <p className="text-[15px] text-muted leading-relaxed">
          改善したいページのURLを入力してください。
          <br />
          デザインと構造を解析してリビルドします。
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="https://example.com/products/item"
            className={clsx(
              "w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white/70",
              "text-[14px] text-foreground placeholder:text-muted-foreground/50",
              "outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10",
              "transition-all duration-200",
            )}
            autoFocus
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!url.trim() || isValidating}
          className={clsx(
            "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl",
            "bg-gradient-to-r from-sky-500 to-cyan-500",
            "text-white text-[14px] font-semibold",
            "shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isValidating ? "分析中..." : "ページをリビルドする"}
        </motion.button>

        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 mx-auto text-[13px] text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </button>
      </div>

      <div className="mt-8 p-4 rounded-xl bg-black/[0.02] border border-border/30">
        <p className="text-[12px] text-muted-foreground leading-relaxed text-center">
          商品ページ、ランディングページ、ブランドページなど
          <br />
          1ページ単位でデザインを解析・リビルドします
        </p>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function WelcomeScreen({
  onSelectTemplate,
  onStartSiteBuild,
  hasBrandMemory = false,
  brandName,
}: WelcomeScreenProps) {
  const [mode, setMode] = useState<"main" | "url-import" | "page-url-import" | "individual-pages">("main");

  /** URL入力モードのサブミット — サイトリビルドフローへ */
  const handleUrlSubmit = useCallback(
    (url: string) => {
      if (onStartSiteBuild) {
        onStartSiteBuild("rebuild", url);
      } else {
        // フォールバック: 旧方式のプロンプト送信
        const prompt = `以下のサイトを分析して、Shopifyテーマとしてリビルドしたいです。\n\nURL: ${url}\n\nサイト全体のデザイントーン、配色、レイアウト構造を解析し、同等以上のクオリティでShopifyテーマを再構築してください。`;
        onSelectTemplate(prompt, "landing");
      }
    },
    [onSelectTemplate, onStartSiteBuild],
  );

  /** 「新しいサイトを作成」— オンボーディングフローへ */
  const handleNewSiteBuild = useCallback(() => {
    if (onStartSiteBuild) {
      onStartSiteBuild("new");
    } else {
      // フォールバック: landing ページのオンボーディングフローを開始
      onSelectTemplate("サイト全体を作成してください。", "landing");
    }
  }, [onSelectTemplate, onStartSiteBuild]);

  /** 「既存ページをリビルド」— 単一ページURL入力後 */
  const handlePageUrlSubmit = useCallback(
    (url: string) => {
      if (onStartSiteBuild) {
        onStartSiteBuild("page-rebuild", url);
      } else {
        const prompt = `以下のページを分析して、Shopifyテーマのページとしてリビルドしたいです。\n\nURL: ${url}\n\nこのページのデザイントーン、配色、レイアウト構造を解析し、同等以上のクオリティでリビルドしてください。`;
        onSelectTemplate(prompt, "landing");
      }
    },
    [onSelectTemplate, onStartSiteBuild],
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {mode === "url-import" ? (
          <UrlImportForm
            key="url-import"
            onSubmit={handleUrlSubmit}
            onCancel={() => setMode("main")}
          />
        ) : mode === "page-url-import" ? (
          <PageUrlImportForm
            key="page-url-import"
            onSubmit={handlePageUrlSubmit}
            onCancel={() => setMode("main")}
          />
        ) : mode === "individual-pages" ? (
          /* ── 個別ページ選択モード ── */
          <motion.div
            key="individual"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full flex flex-col items-center"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-foreground mb-2">
                どのページを作成しますか？
              </h2>
              <p className="text-[14px] text-muted">
                作成したいページの種類を選んでください
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-6">
              {INDIVIDUAL_PAGE_ACTIONS.map((action, i) => (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 + i * 0.04 }}
                  onClick={() => onSelectTemplate(action.prompt, action.pageType)}
                  className={clsx(
                    "group relative flex flex-col items-center gap-3 p-5 rounded-2xl text-center",
                    "bg-white/40 backdrop-blur-[10px] border border-white/30 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-white/70",
                    "transition-all duration-200 hover:shadow-sm",
                  )}
                >
                  <div
                    className={clsx(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      action.iconBg,
                    )}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-foreground">
                      {action.title}
                    </div>
                    <div className="text-[13px] text-muted mt-1">
                      {action.description}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => setMode("main")}
              className="flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              戻る
            </button>
          </motion.div>
        ) : (
          /* ── メイン画面 ── */
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full flex flex-col items-center"
          >
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c5cfc] to-[#5b8def] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#7c5cfc]/15"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground mb-3">
                Shopifyサイトを作りましょう
              </h1>
              <p className="text-[15px] text-muted leading-relaxed">
                AIがデザインからコーディングまで一貫して対応。
                <br className="hidden sm:block" />
                対話しながらサイト全体を構築できます。
              </p>
              {hasBrandMemory && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/[0.06] border border-accent/15 text-[13px] text-accent font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  {brandName
                    ? `${brandName} の Brand Memory が有効`
                    : "Brand Memory が有効"}
                </div>
              )}
            </motion.div>

            {/* ── 4つのメインアクション（2×2グリッド） ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="w-full grid grid-cols-2 gap-4 mb-8"
            >
              {/* 新しいサイトを作成 */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleNewSiteBuild}
                className={clsx(
                  "group flex flex-col items-center gap-4 p-6 rounded-2xl text-center",
                  "bg-gradient-to-b from-white/70 to-white/40 backdrop-blur-[10px]",
                  "border-2 border-[#7c5cfc]/20 hover:border-[#7c5cfc]/40",
                  "shadow-[0_2px_8px_rgba(124,92,252,0.06)] hover:shadow-[0_4px_16px_rgba(124,92,252,0.12)]",
                  "transition-all duration-300",
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#5b8def] flex items-center justify-center shadow-lg shadow-[#7c5cfc]/20 group-hover:shadow-xl group-hover:shadow-[#7c5cfc]/25 transition-shadow">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-foreground mb-1">
                    新しいサイトを作成
                  </div>
                  <div className="text-[13px] text-muted leading-relaxed">
                    サイト全体をゼロから構築
                  </div>
                </div>
              </motion.button>

              {/* 新しいページを作成 */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setMode("individual-pages")}
                className={clsx(
                  "group flex flex-col items-center gap-4 p-6 rounded-2xl text-center",
                  "bg-gradient-to-b from-white/70 to-white/40 backdrop-blur-[10px]",
                  "border-2 border-emerald-500/15 hover:border-emerald-500/35",
                  "shadow-[0_2px_8px_rgba(16,185,129,0.04)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.10)]",
                  "transition-all duration-300",
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/15 group-hover:shadow-xl group-hover:shadow-emerald-500/20 transition-shadow">
                  <Layout className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-foreground mb-1">
                    新しいページを作成
                  </div>
                  <div className="text-[13px] text-muted leading-relaxed">
                    1ページずつ個別に作成
                  </div>
                </div>
              </motion.button>

              {/* 既存サイトをリビルド */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setMode("url-import")}
                className={clsx(
                  "group flex flex-col items-center gap-4 p-6 rounded-2xl text-center",
                  "bg-gradient-to-b from-white/70 to-white/40 backdrop-blur-[10px]",
                  "border-2 border-indigo-500/15 hover:border-indigo-500/35",
                  "shadow-[0_2px_8px_rgba(99,102,241,0.04)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.10)]",
                  "transition-all duration-300",
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/15 group-hover:shadow-xl group-hover:shadow-indigo-500/20 transition-shadow">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-foreground mb-1">
                    既存サイトをリビルド
                  </div>
                  <div className="text-[13px] text-muted leading-relaxed">
                    サイト全体を解析して再構築
                  </div>
                </div>
              </motion.button>

              {/* 既存ページをリビルド */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setMode("page-url-import")}
                className={clsx(
                  "group flex flex-col items-center gap-4 p-6 rounded-2xl text-center",
                  "bg-gradient-to-b from-white/70 to-white/40 backdrop-blur-[10px]",
                  "border-2 border-sky-500/15 hover:border-sky-500/35",
                  "shadow-[0_2px_8px_rgba(14,165,233,0.04)] hover:shadow-[0_4px_16px_rgba(14,165,233,0.10)]",
                  "transition-all duration-300",
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/15 group-hover:shadow-xl group-hover:shadow-sky-500/20 transition-shadow">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-foreground mb-1">
                    既存ページをリビルド
                  </div>
                  <div className="text-[13px] text-muted leading-relaxed">
                    1ページを解析してリビルド
                  </div>
                </div>
              </motion.button>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
