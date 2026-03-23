"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Store,
  Link2,
  Unlink,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import BrandMemoryView from "./BrandMemoryView";

interface StoreInfo {
  id: string;
  shop: string;
  name: string;
  email: string;
  domain: string;
  plan: string;
}

export default function SettingsView() {
  const [connected, setConnected] = useState(false);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [shopInput, setShopInput] = useState("");
  const [disconnecting, setDisconnecting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showSetupHelp, setShowSetupHelp] = useState(false);

  const fetchStoreStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/shopify/store");
      const data = await res.json();
      setConnected(data.connected);
      setStore(data.store || null);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoreStatus();
  }, [fetchStoreStatus]);

  const handleConnect = () => {
    if (!shopInput.trim()) return;
    setConnecting(true);
    window.location.href = `/api/shopify/install?shop=${encodeURIComponent(shopInput.trim())}`;
  };

  const handleDisconnect = async () => {
    if (!confirm("Shopifyストアの接続を解除しますか？")) return;
    setDisconnecting(true);
    try {
      await fetch("/api/shopify/store", { method: "DELETE" });
      setConnected(false);
      setStore(null);
    } catch {
      // fail silently
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 pt-16 pb-14">
        <h1 className="text-3xl font-bold text-foreground mb-2">設定</h1>
        <p className="text-[15px] text-muted-foreground mb-10">
          Shopifyストアとの接続・Brand Memoryを管理します
        </p>

        {/* ━━━ Step 1: Shopifyストア接続（最上部・最優先） ━━━ */}
        {!connected ? (
          /* ── 未接続: オンボーディングカード ── */
          <div className="mb-10 rounded-2xl border-2 border-dashed border-[#7c5cfc]/30 bg-gradient-to-br from-[#7c5cfc]/[0.03] to-[#5b8def]/[0.05] overflow-hidden">
            <div className="px-8 pt-8 pb-6">
              {/* ステップインジケーター */}
              <div className="flex items-center gap-2 mb-5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7c5cfc] text-white text-[12px] font-bold">
                  1
                </span>
                <span className="text-[13px] font-medium text-[#7c5cfc] tracking-wide uppercase">
                  はじめに
                </span>
              </div>

              <h2 className="text-[22px] font-bold text-foreground mb-2">
                Shopifyストアを接続しましょう
              </h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed mb-6">
                相方がストアのページを取得・作成・編集できるようになります。
                まずはストアのドメインを入力して接続してください。
              </p>

              {/* 接続フォーム */}
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={shopInput}
                  onChange={(e) => setShopInput(e.target.value)}
                  placeholder="your-store.myshopify.com"
                  className="flex-1 px-4 py-3.5 rounded-xl border border-border bg-white text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all duration-200 focus:ring-2 focus:ring-[#7c5cfc]/20 focus:border-[#7c5cfc]/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConnect();
                  }}
                />
                <button
                  onClick={handleConnect}
                  disabled={!shopInput.trim() || connecting}
                  className={clsx(
                    "flex items-center gap-2 px-6 py-3.5 rounded-xl text-[15px] font-semibold text-white bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] shadow-md hover:shadow-lg hover:shadow-[#7c5cfc]/20 active:scale-[0.98] transition-all duration-200",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
                  )}
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      接続中...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Shopifyに接続
                    </>
                  )}
                </button>
              </div>

              {/* メリット表示 */}
              <div className="flex gap-6 mt-6 pt-5 border-t border-[#7c5cfc]/10">
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Zap className="w-4 h-4 text-[#7c5cfc]" />
                  ページ自動生成
                </div>
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Store className="w-4 h-4 text-[#7c5cfc]" />
                  テーマ直接編集
                </div>
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-[#7c5cfc]" />
                  安全なOAuth認証
                </div>
              </div>
            </div>

            {/* セットアップヘルプ（折りたたみ） */}
            <div className="border-t border-[#7c5cfc]/10 bg-white/40">
              <button
                onClick={() => setShowSetupHelp(!showSetupHelp)}
                className="w-full px-8 py-3.5 flex items-center justify-between text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>初めての方：セットアップ手順</span>
                <span
                  className={clsx(
                    "transition-transform duration-200",
                    showSetupHelp && "rotate-180",
                  )}
                >
                  ▼
                </span>
              </button>
              {showSetupHelp && (
                <div className="px-8 pb-6">
                  <ol className="text-[14px] text-muted-foreground space-y-3 list-decimal list-inside leading-relaxed">
                    <li>
                      <a
                        href="https://partners.shopify.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#7c5cfc] hover:underline"
                      >
                        Shopify Partners
                      </a>
                      でアプリを作成
                    </li>
                    <li>
                      「レガシーインストールフローを使用する」にチェック
                    </li>
                    <li>
                      リダイレクトURLに{" "}
                      <code className="font-mono text-[12px] bg-foreground/[0.05] px-1.5 py-0.5 rounded-md">
                        http://localhost:3000/api/shopify/callback
                      </code>{" "}
                      を設定
                    </li>
                    <li>
                      <code className="font-mono text-[12px] bg-foreground/[0.05] px-1.5 py-0.5 rounded-md">
                        web/.env.local
                      </code>{" "}
                      にAPIキーとシークレットを追加
                    </li>
                  </ol>
                  <pre className="font-mono text-[12px] mt-3 bg-foreground/[0.04] rounded-xl p-3.5 text-muted-foreground overflow-x-auto">
{`SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
APP_URL=http://localhost:3000`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── 接続済み: コンパクトカード ── */
          <div className="mb-10 rounded-2xl border border-emerald-200/60 bg-emerald-50/30 overflow-hidden">
            <div className="px-6 py-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-semibold text-foreground truncate">
                    {store?.name || store?.shop}
                  </h2>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[12px] font-medium shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    接続中
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground truncate">
                  {store?.shop}
                  {store?.plan ? ` · ${store.plan}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://${store?.shop}/admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-foreground bg-black/[0.04] hover:bg-black/[0.07] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  管理画面
                </a>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {disconnecting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Unlink className="w-3.5 h-3.5" />
                  )}
                  解除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ━━━ Step 2: Brand Memory ━━━ */}
        <div className="mb-12">
          {!connected && (
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-[12px] font-bold">
                2
              </span>
              <span className="text-[13px] font-medium text-muted-foreground tracking-wide uppercase">
                ブランド設定
              </span>
            </div>
          )}
          <BrandMemoryView />
        </div>
      </div>
    </div>
  );
}
