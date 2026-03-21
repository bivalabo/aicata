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
    // OAuth フローを開始（リダイレクト）
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

        {/* ── Brand Memory ── */}
        <div className="mb-12">
          <BrandMemoryView />
        </div>

        {/* Shopify接続セクション */}
        <div className="rounded-2xl border border-border bg-white/60 backdrop-blur-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border/50 flex items-center gap-4">
            <div
              className={clsx(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                connected ? "bg-emerald-500" : "bg-gray-200",
              )}
            >
              <Store className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-[18px] font-semibold text-foreground">
                Shopifyストア接続
              </h2>
              <p className="text-[14px] text-muted-foreground">
                {connected ? "接続中" : "未接続"}
              </p>
            </div>
            {connected && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 text-[14px] font-medium">
                <CheckCircle2 className="w-4 h-4" />
                接続済み
              </div>
            )}
          </div>

          <div className="p-6">
            {connected && store ? (
              // 接続済みの表示
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[14px] text-muted-foreground block mb-1">
                      ストア名
                    </span>
                    <span className="text-[15px] text-foreground font-medium">
                      {store.name || store.shop}
                    </span>
                  </div>
                  <div>
                    <span className="text-[14px] text-muted-foreground block mb-1">
                      プラン
                    </span>
                    <span className="text-[15px] text-foreground font-medium capitalize">
                      {store.plan || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[14px] text-muted-foreground block mb-1">
                      Shopifyドメイン
                    </span>
                    <span className="text-[15px] text-foreground">
                      {store.shop}
                    </span>
                  </div>
                  <div>
                    <span className="text-[14px] text-muted-foreground block mb-1">
                      カスタムドメイン
                    </span>
                    <span className="text-[15px] text-foreground">
                      {store.domain || "—"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <a
                    href={`https://${store.shop}/admin`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium text-foreground bg-black/[0.04] hover:bg-black/[0.07] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Shopify管理画面
                  </a>
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {disconnecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Unlink className="w-4 h-4" />
                    )}
                    接続を解除
                  </button>
                </div>
              </div>
            ) : (
              // 未接続の表示
              <div className="space-y-5">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/60 border border-amber-200/40">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[14px] text-amber-800 leading-relaxed">
                    Shopifyストアを接続すると、ページの取得・作成・編集が
                    Aicataから直接行えるようになります。
                  </p>
                </div>

                <div>
                  <label className="text-[14px] text-muted-foreground block mb-2">
                    Shopifyストアのドメイン
                  </label>
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      value={shopInput}
                      onChange={(e) => setShopInput(e.target.value)}
                      placeholder="your-store.myshopify.com"
                      className="flex-1 px-4 py-3 rounded-xl border border-border bg-white text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all duration-200 focus:ring-2 focus:ring-accent/20 focus:border-accent/30"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleConnect();
                      }}
                    />
                    <button
                      onClick={handleConnect}
                      disabled={!shopInput.trim() || connecting}
                      className={clsx(
                        "flex items-center gap-2 px-5 py-3 rounded-xl text-[15px] font-medium text-white bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] shadow-sm hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] transition-all duration-200",
                        "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
                      )}
                    >
                      {connecting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Shopifyに接続中...
                        </>
                      ) : (
                        <>
                          <Link2 className="w-4 h-4" />
                          接続
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[13px] text-muted-foreground/60 mt-2">
                    Shopify Partnersで作成したアプリのAPIキーが必要です
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 環境変数ヒント */}
        <div className="mt-8 rounded-2xl border border-border/50 bg-white/40 p-6">
          <h3 className="text-[16px] font-semibold text-foreground mb-3">
            セットアップ手順
          </h3>
          <ol className="text-[15px] text-muted-foreground space-y-2.5 list-decimal list-inside leading-relaxed">
            <li>
              <a
                href="https://partners.shopify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Shopify Partners
              </a>
              でアプリを作成
            </li>
            <li>
              アプリのリダイレクトURLに{" "}
              <code className="font-mono text-[12px] bg-foreground/[0.03] px-1.5 py-0.5 rounded-lg">
                http://localhost:3000/api/shopify/callback
              </code>{" "}
              を設定
            </li>
            <li>
              <code className="font-mono text-[12px] bg-foreground/[0.03] px-1.5 py-0.5 rounded-lg">
                .env.local
              </code>{" "}
              にAPIキーとシークレットを追加:
            </li>
          </ol>
          <pre className="font-mono text-[12px] mt-2 bg-foreground/[0.03] rounded-xl p-3 text-muted-foreground overflow-x-auto">
{`SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
APP_URL=http://localhost:3000`}
          </pre>
        </div>
      </div>
    </div>
  );
}
