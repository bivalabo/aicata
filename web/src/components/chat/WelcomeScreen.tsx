"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Layout,
  Search,
  TrendingUp,
  Palette,
  Store,
  ArrowRight,
  ShoppingBag,
  Grid3X3,
  ShoppingCart,
  Globe,
  Link2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

// ============================================================
// Types
// ============================================================

/** ページ作成テンプレートのアクション定義 */
interface ActionItem {
  icon: React.ElementType;
  title: string;
  description: string;
  /** pageType — Gen-3 design engine の PageType に対応 */
  pageType: string;
  /** チャットに送信するプロンプト */
  prompt: string;
  iconBg: string;
}

/** ユーティリティ系（SEO, 改善など） */
interface UtilityItem {
  icon: React.ElementType;
  title: string;
  description: string;
  prompt: string;
  iconBg: string;
}

interface WelcomeScreenProps {
  onSelectTemplate: (prompt: string, pageType?: string) => void;
  /** Brand Memoryが有効かどうか */
  hasBrandMemory?: boolean;
  brandName?: string;
}

// ============================================================
// Action Definitions
// ============================================================

/** ページ作成アクション — Gen-3 対応の全ページタイプ */
const PAGE_CREATION_ACTIONS: ActionItem[] = [
  {
    icon: Store,
    title: "トップページ",
    description: "ストアの顔となるホームページ",
    pageType: "landing",
    prompt: "Shopifyストアのトップページを新しく作りたいです。",
    iconBg: "bg-violet-500",
  },
  {
    icon: ShoppingBag,
    title: "商品詳細ページ",
    description: "購買意欲を高めるプロダクトページ",
    pageType: "product",
    prompt: "商品を魅力的に紹介するページを作りたいです。",
    iconBg: "bg-blue-500",
  },
  {
    icon: Grid3X3,
    title: "コレクションページ",
    description: "商品カテゴリーの一覧ページ",
    pageType: "collection",
    prompt: "商品コレクション（カテゴリー）ページを作りたいです。",
    iconBg: "bg-teal-500",
  },
  {
    icon: ShoppingCart,
    title: "カートページ",
    description: "購入完了までスムーズに導くカート",
    pageType: "cart",
    prompt: "カートページのデザインを改善したいです。",
    iconBg: "bg-emerald-500",
  },
  {
    icon: Layout,
    title: "ランディングページ",
    description: "キャンペーン・セールのLP制作",
    pageType: "landing",
    prompt: "キャンペーン用のランディングページを作りたいです。",
    iconBg: "bg-orange-500",
  },
  {
    icon: Palette,
    title: "ブランドページ",
    description: "ブランドストーリーを伝えるAbout",
    pageType: "about",
    prompt: "ブランドの世界観を伝える「私たちについて」ページを作りたいです。",
    iconBg: "bg-pink-500",
  },
];

/** 追加ページタイプ（「もっと見る」で表示） */
const ADDITIONAL_PAGE_ACTIONS: ActionItem[] = [
  {
    icon: Layout,
    title: "ブログページ",
    description: "記事一覧・コンテンツマーケティング",
    pageType: "blog",
    prompt: "ブログ記事の一覧ページを作りたいです。記事のサムネイル、タイトル、概要が並ぶレイアウトで。",
    iconBg: "bg-indigo-500",
  },
  {
    icon: Layout,
    title: "お問い合わせページ",
    description: "フォーム付きのコンタクトページ",
    pageType: "contact",
    prompt: "お問い合わせフォーム付きのコンタクトページを作りたいです。",
    iconBg: "bg-cyan-500",
  },
  {
    icon: Layout,
    title: "FAQページ",
    description: "よくある質問のアコーディオン形式",
    pageType: "about",
    prompt: "FAQ（よくある質問）ページを作りたいです。アコーディオン形式で見やすいレイアウトで。",
    iconBg: "bg-lime-600",
  },
  {
    icon: Layout,
    title: "特集・キャンペーンLP",
    description: "季節キャンペーンやセール用",
    pageType: "landing",
    prompt: "キャンペーン用のランディングページを作りたいです。",
    iconBg: "bg-orange-500",
  },
];

/** ユーティリティアクション */
const UTILITY_ACTIONS: UtilityItem[] = [
  {
    icon: Search,
    title: "SEO・運営の相談",
    description: "検索対策やストア運営のアドバイス",
    prompt: "ストアのSEOについて相談したいです。",
    iconBg: "bg-amber-500",
  },
  {
    icon: TrendingUp,
    title: "既存ページを改善",
    description: "コンバージョン向上の提案と修正",
    prompt:
      "既存のページを改善したいです。スクリーンショットを共有するので、見てもらえますか？",
    iconBg: "bg-sky-500",
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
    // 簡易URL検証
    try {
      new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    } catch {
      return;
    }
    setIsValidating(true);
    // URLを含むプロンプトを生成して送信
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
          <Globe className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          既存サイトを分析してリビルド
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
          {isValidating ? "分析中..." : "サイトを分析する"}
        </motion.button>

        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 mx-auto text-[13px] text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </button>
      </div>

      {/* ヒント */}
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

// ============================================================
// Main Component
// ============================================================

export default function WelcomeScreen({
  onSelectTemplate,
  hasBrandMemory = false,
  brandName,
}: WelcomeScreenProps) {
  const [mode, setMode] = useState<"main" | "url-import">("main");
  const [showMore, setShowMore] = useState(false);

  /** URL入力モードのサブミット */
  const handleUrlSubmit = useCallback(
    (url: string) => {
      const prompt = `以下のサイトを分析して、Shopifyテーマとしてリビルドしたいです。\n\nURL: ${url}\n\nこのサイトのデザイントーン、配色、レイアウト構造を解析し、同等以上のクオリティでShopifyテーマを再構築してください。`;
      onSelectTemplate(prompt, "landing");
    },
    [onSelectTemplate],
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
        ) : (
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
                どんなページを作りましょうか？
              </h1>
              <p className="text-[15px] text-muted leading-relaxed">
                対話しながらShopifyページを生成。
                <br className="hidden sm:block" />
                リアルタイムプレビューで仕上がりを確認できます。
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

            {/* ページ作成グリッド */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="w-full mb-6"
            >
              <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                ページを作成
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                {PAGE_CREATION_ACTIONS.map((action, i) => (
                  <motion.button
                    key={action.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.04 }}
                    onClick={() =>
                      onSelectTemplate(action.prompt, action.pageType)
                    }
                    className={clsx(
                      "group relative flex flex-col items-center gap-3 p-5 rounded-2xl text-center",
                      "bg-white/40 backdrop-blur-[10px] border border-white/30 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-white/70",
                      "transition-all duration-200",
                      "hover:shadow-sm",
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
                      <div className="text-[12px] text-muted mt-1">
                        {action.description}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* もっと見る — 追加ページタイプ */}
              {!showMore ? (
                <button
                  onClick={() => setShowMore(true)}
                  className="mt-3 text-[13px] text-accent hover:text-accent-hover font-medium transition-colors"
                >
                  + もっとページタイプを見る
                </button>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mt-3">
                  {ADDITIONAL_PAGE_ACTIONS.map((action, i) => (
                    <motion.button
                      key={action.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      onClick={() =>
                        onSelectTemplate(action.prompt, action.pageType)
                      }
                      className={clsx(
                        "group relative flex flex-col items-center gap-3 p-5 rounded-2xl text-center",
                        "bg-white/40 backdrop-blur-[10px] border border-white/30 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-white/70",
                        "transition-all duration-200",
                        "hover:shadow-sm",
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
                        <div className="text-[12px] text-muted mt-1">
                          {action.description}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* URL入力モード + ユーティリティ */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="w-full"
            >
              {/* URLからリビルド */}
              <motion.button
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                onClick={() => setMode("url-import")}
                className={clsx(
                  "w-full flex items-center gap-4 p-4 rounded-2xl text-left mb-4",
                  "border border-dashed border-accent/30 bg-accent/[0.03]",
                  "hover:bg-accent/[0.06] hover:border-accent/50",
                  "transition-all duration-200",
                )}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-foreground flex items-center gap-1.5">
                    既存サイトからリビルド
                    <ArrowRight className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div className="text-[12px] text-muted mt-0.5">
                    URLを入力 → デザイン解析 → Shopifyテーマとして再構築
                  </div>
                </div>
              </motion.button>

              {/* ユーティリティ行 */}
              <div className="grid grid-cols-2 gap-3">
                {UTILITY_ACTIONS.map((action, i) => (
                  <motion.button
                    key={action.title}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.04 }}
                    onClick={() => onSelectTemplate(action.prompt)}
                    className={clsx(
                      "group flex items-center gap-3 p-4 rounded-xl text-left",
                      "bg-white/40 backdrop-blur-[10px] border border-white/30 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-white/70",
                      "transition-all duration-200",
                      "hover:shadow-sm",
                    )}
                  >
                    <div
                      className={clsx(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        action.iconBg,
                      )}
                    >
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-foreground">
                        {action.title}
                      </div>
                      <div className="text-[12px] text-muted mt-0.5">
                        {action.description}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Footer hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-[13px] text-muted-foreground"
            >
              テンプレートを選ぶか、入力欄に自由にメッセージを送ってください
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
