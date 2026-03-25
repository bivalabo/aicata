"use client";
// SiteBuilderView v2 — scope-aware error handling
import { useState, useEffect, useCallback } from "react";
import {
  Palette,
  Layout,
  Store,
  Globe,
  Activity,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  Monitor,
  Smartphone,
  Eye,
  Shield,
  Zap,
  Type,
  Image as ImageIcon,
  Menu,
  Link2,
} from "lucide-react";
import clsx from "clsx";

// ── Types ──

interface StoreInfo {
  id: string;
  shop: string;
  name: string;
  email: string;
  domain: string;
  plan: string;
  scope?: string;
}

interface ThemeInfo {
  id: number;
  name: string;
  role: string;
  isMain: boolean;
  previewable: boolean;
  updatedAt: string;
}

interface HealthData {
  connected: boolean;
  shop?: string;
  apiVersion: string;
  scopes?: string;
  health: {
    valid: boolean;
    currentVersion?: string;
    latestStableVersion?: string;
    deprecationWarning?: string;
  };
  capabilities?: {
    supportsOS2: boolean;
    supportsJsonTemplates: boolean;
    supportsSections: boolean;
    supportsAssetApi: boolean;
    themeEngine: "os2" | "legacy" | "unknown";
  } | null;
  checkedAt?: string;
}

interface BrandMemoryData {
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  colorPalette: string[];
  primaryFont: string;
  bodyFont: string;
  tones: string[];
}

type SiteTab = "theme" | "global" | "profile" | "domain" | "health";

const SITE_TABS: Array<{ id: SiteTab; icon: typeof Palette; label: string; description: string }> = [
  { id: "theme", icon: Palette, label: "テーマ設定", description: "テーマの確認・テンプレート適用" },
  { id: "global", icon: Layout, label: "グローバル要素", description: "ヘッダー・フッター・ナビ" },
  { id: "profile", icon: Store, label: "ストアプロフィール", description: "ロゴ・カラー・フォント" },
  { id: "domain", icon: Globe, label: "ドメイン・公開", description: "公開状況・ドメイン設定" },
  { id: "health", icon: Activity, label: "Shopify Health", description: "API接続・互換性チェック" },
];

// ============================================================
// Main Component
// ============================================================

export default function SiteBuilderView() {
  const [activeTab, setActiveTab] = useState<SiteTab>("theme");
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/shopify/store");
        const data = await res.json();
        setConnected(data.connected);
        setStoreInfo(data.store || null);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (!connected) {
    return <NotConnectedState />;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-8 pt-14 pb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              サイト構築
            </h1>
            <p className="text-[15px] text-muted-foreground mt-1">
              {storeInfo?.name || storeInfo?.shop || "ストア"} のデザイン基盤を管理
            </p>
          </div>
          {storeInfo && (
            <a
              href={`https://${storeInfo.shop}/admin`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Shopify管理画面
            </a>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1">
          {SITE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium whitespace-nowrap transition-all duration-200",
                activeTab === tab.id
                  ? "bg-white shadow-sm shadow-black/[0.04] text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50",
              )}
            >
              <tab.icon className="w-4.5 h-4.5 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === "theme" && <ThemeSettingsTab storeInfo={storeInfo!} />}
        {activeTab === "global" && <GlobalElementsTab />}
        {activeTab === "profile" && <StoreProfileTab storeInfo={storeInfo!} />}
        {activeTab === "domain" && <DomainTab storeInfo={storeInfo!} />}
        {activeTab === "health" && <HealthTab />}
      </div>
    </div>
  );
}

// ============================================================
// 1. Theme Settings Tab
// ============================================================

function ThemeSettingsTab({ storeInfo }: { storeInfo: StoreInfo }) {
  const [themes, setThemes] = useState<ThemeInfo[]>([]);
  const [mainThemeId, setMainThemeId] = useState<number | null>(null);
  const [mainThemeName, setMainThemeName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/shopify/theme");
        let data: any;
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Invalid JSON response (${res.status}): ${text.slice(0, 200)}`);
        }
        if (!res.ok || data.error) {
          if (data.code) setErrorCode(data.code);
          throw new Error(data.error || `API Error: ${res.status}`);
        }
        setThemes(data.themes || []);
        setMainThemeId(data.mainThemeId);
        setMainThemeName(data.mainThemeName);
      } catch (e) {
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <TabLoader />;
  if (error) {
    if (errorCode === "SCOPE_MISSING") {
      return (
        <div className="max-w-2xl space-y-4">
          <ScopeMissingBanner
            scope="read_themes, write_themes"
            shop={storeInfo.shop}
            description="テーマ情報の取得には read_themes / write_themes スコープが必要です。Shopifyアプリの権限を更新し、再認証してください。"
          />
        </div>
      );
    }
    if (errorCode === "INVALID_TOKEN") {
      return (
        <div className="max-w-2xl space-y-4">
          <ScopeMissingBanner
            scope="(再認証が必要)"
            shop={storeInfo.shop}
            description="アクセストークンが無効または期限切れです。Shopifyで再認証してください。"
          />
        </div>
      );
    }
    return (
      <div className="max-w-2xl space-y-4">
        <TabError message="テーマ情報の取得に失敗" hint={error} />
      </div>
    );
  }

  const mainTheme = themes.find((t) => t.isMain);
  const otherThemes = themes.filter((t) => !t.isMain);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Active Theme Card */}
      <SectionCard
        icon={Monitor}
        title="公開中のテーマ"
        description="現在ストアで使用されているテーマ"
      >
        {mainTheme ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">
                    {mainTheme.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                      公開中
                    </span>
                    <span className="text-[12px] text-muted-foreground">
                      ID: {mainTheme.id}
                    </span>
                  </div>
                </div>
              </div>
              <a
                href={`https://${storeInfo.shop}/admin/themes/${mainTheme.id}/editor`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium text-accent hover:bg-accent/5 transition-colors"
              >
                <Eye className="w-4 h-4" />
                テーマエディタ
              </a>
            </div>

            <div className="text-[12px] text-muted-foreground">
              最終更新: {new Date(mainTheme.updatedAt).toLocaleString("ja-JP")}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            メインテーマが見つかりませんでした
          </p>
        )}
      </SectionCard>

      {/* Aicata Template Status */}
      <SectionCard
        icon={Zap}
        title="Aicataテンプレート"
        description="Aicataで生成・デプロイ済みのテンプレートファイル"
      >
        <AicataTemplateStatus storeInfo={storeInfo} mainThemeId={mainThemeId} />
      </SectionCard>

      {/* Other Themes */}
      {otherThemes.length > 0 && (
        <SectionCard
          icon={Palette}
          title="その他のテーマ"
          description="未公開・デモテーマ"
        >
          <div className="space-y-2">
            {otherThemes.map((theme) => (
              <div
                key={theme.id}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-black/[0.02] hover:bg-black/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">
                      {theme.name}
                    </p>
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {theme.role === "unpublished" ? "未公開" : theme.role}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  ID: {theme.id}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ── Aicata Template Status Sub-Component ──

function AicataTemplateStatus({
  storeInfo,
  mainThemeId,
}: {
  storeInfo: StoreInfo;
  mainThemeId: number | null;
}) {
  const [aicataCount, setAicataCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const checkTemplates = useCallback(async () => {
    if (!mainThemeId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/shopify/theme?assets=true&themeId=${mainThemeId}`,
      );
      if (res.ok) {
        const data = await res.json();
        setAicataCount(data.aicataCount ?? 0);
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [mainThemeId]);

  useEffect(() => {
    checkTemplates();
  }, [checkTemplates]);

  if (!mainThemeId) {
    return (
      <p className="text-sm text-muted-foreground">
        メインテーマが未検出のため確認できません
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {loading ? (
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        ) : aicataCount !== null ? (
          <>
            <div
              className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                aicataCount > 0
                  ? "bg-accent/10 text-accent"
                  : "bg-gray-100 text-gray-400",
              )}
            >
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-foreground">
                {aicataCount > 0
                  ? `${aicataCount} ファイルをデプロイ済み`
                  : "まだデプロイされていません"}
              </p>
              <p className="text-[12px] text-muted-foreground">
                {aicataCount > 0
                  ? "テーマ内のAicata関連ファイル"
                  : "ページ制作からデプロイを行うとここに反映されます"}
              </p>
            </div>
          </>
        ) : null}
      </div>
      <button
        onClick={checkTemplates}
        disabled={loading}
        className="p-2 rounded-lg hover:bg-black/[0.04] text-muted-foreground transition-colors disabled:opacity-50"
        title="再チェック"
      >
        <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
      </button>
    </div>
  );
}

// ============================================================
// 2. Global Elements Tab
// ============================================================

interface ThemeLayoutData {
  id?: string;
  headerSectionId: string;
  footerSectionId: string;
  showAnnouncement: boolean;
  announcementText: string;
  announcementLink: string;
  deployMode: string;
}

interface SectionOption {
  id: string;
  name: string;
  nameJa: string;
  description: string;
}

function GlobalElementsTab() {
  const [themeLayout, setThemeLayout] = useState<ThemeLayoutData | null>(null);
  const [headerOptions, setHeaderOptions] = useState<SectionOption[]>([]);
  const [footerOptions, setFooterOptions] = useState<SectionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // データ取得
  useEffect(() => {
    async function fetchLayout() {
      try {
        const res = await fetch("/api/theme-layout");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setHeaderOptions(data.headerOptions || []);
        setFooterOptions(data.footerOptions || []);
        if (data.themeLayout) {
          setThemeLayout(data.themeLayout);
        } else {
          // デフォルト値
          setThemeLayout({
            headerSectionId: "nav-elegant-dropdown",
            footerSectionId: "footer-elegant-columns",
            showAnnouncement: false,
            announcementText: "",
            announcementLink: "",
            deployMode: "full",
          });
        }
      } catch {
        // ストア未接続時のフォールバック
        setThemeLayout({
          headerSectionId: "nav-elegant-dropdown",
          footerSectionId: "footer-elegant-columns",
          showAnnouncement: false,
          announcementText: "",
          announcementLink: "",
          deployMode: "full",
        });
        setHeaderOptions([
          { id: "nav-elegant-dropdown", name: "Elegant Dropdown", nameJa: "エレガント ドロップダウン", description: "洗練されたドロップダウンメニュー" },
          { id: "nav-minimal-sticky", name: "Minimal Sticky", nameJa: "ミニマル スティッキー", description: "追従するミニマルナビ" },
          { id: "nav-mega-menu", name: "Mega Menu", nameJa: "メガメニュー", description: "3段階メガメニュー" },
          { id: "nav-transparent-overlay", name: "Transparent Overlay", nameJa: "トランスペアレント", description: "透明オーバーレイナビ" },
          { id: "nav-category-tabs", name: "Category Tabs", nameJa: "カテゴリータブ", description: "カテゴリタブバー" },
          { id: "nav-side-drawer", name: "Side Drawer", nameJa: "サイドドロワー", description: "サイドパネルナビ" },
        ]);
        setFooterOptions([
          { id: "footer-elegant-columns", name: "Elegant Columns", nameJa: "エレガント カラム", description: "複数カラムフッター" },
          { id: "footer-minimal-centered", name: "Minimal Centered", nameJa: "ミニマル センター", description: "中央揃えフッター" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchLayout();
  }, []);

  // 保存
  const handleSave = useCallback(async () => {
    if (!themeLayout) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const method = themeLayout.id ? "PUT" : "POST";
      const res = await fetch("/api/theme-layout", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(themeLayout),
      });
      if (!res.ok) {
        // POST で 409 (既存) の場合は PUT にフォールバック
        if (res.status === 409) {
          const fallbackRes = await fetch("/api/theme-layout", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(themeLayout),
          });
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            setThemeLayout(data.themeLayout);
            setSaveMessage("保存しました");
            return;
          }
        }
        throw new Error("Save failed");
      }
      const data = await res.json();
      setThemeLayout(data.themeLayout);
      setSaveMessage("保存しました");
    } catch {
      setSaveMessage("保存に失敗しました");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  }, [themeLayout]);

  const updateLayout = (updates: Partial<ThemeLayoutData>) => {
    setThemeLayout((prev) => prev ? { ...prev, ...updates } : null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* 説明ヘッダー */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-accent/5 border border-accent/10">
        <Zap className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-[14px] font-medium text-foreground">
            グローバル要素の管理
          </p>
          <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
            ヘッダー・フッター・アナウンスメントバーは全ページに共通する要素です。
            ここで選択した設定はShopifyのテーマエディターからも編集可能です。
          </p>
        </div>
      </div>

      {/* ── ヘッダー選択 ── */}
      <SectionPicker
        label="ヘッダー"
        sublabel="ナビゲーション・ロゴ・検索・カート"
        icon={Menu}
        options={headerOptions}
        selectedId={themeLayout?.headerSectionId || ""}
        onSelect={(id) => updateLayout({ headerSectionId: id })}
      />

      {/* ── フッター選択 ── */}
      <SectionPicker
        label="フッター"
        sublabel="リンク・ニュースレター・SNS・決済アイコン"
        icon={Layout}
        options={footerOptions}
        selectedId={themeLayout?.footerSectionId || ""}
        onSelect={(id) => updateLayout({ footerSectionId: id })}
      />

      {/* ── アナウンスメントバー ── */}
      <div className="p-4 rounded-2xl border border-border/50 bg-white/60 backdrop-blur-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Type className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-foreground">アナウンスメントバー</p>
              <p className="text-[12px] text-muted-foreground">セール告知・送料無料ライン等</p>
            </div>
          </div>
          <button
            onClick={() => updateLayout({ showAnnouncement: !themeLayout?.showAnnouncement })}
            className={clsx(
              "relative w-11 h-6 rounded-full transition-colors",
              themeLayout?.showAnnouncement ? "bg-accent" : "bg-gray-200",
            )}
          >
            <span
              className={clsx(
                "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                themeLayout?.showAnnouncement ? "left-[22px]" : "left-0.5",
              )}
            />
          </button>
        </div>

        {themeLayout?.showAnnouncement && (
          <div className="space-y-2 pt-2 border-t border-border/30">
            <input
              type="text"
              placeholder="例: 全品送料無料キャンペーン実施中！"
              value={themeLayout?.announcementText || ""}
              onChange={(e) => updateLayout({ announcementText: e.target.value })}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-border/50 bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40"
            />
            <input
              type="text"
              placeholder="リンクURL（任意）"
              value={themeLayout?.announcementLink || ""}
              onChange={(e) => updateLayout({ announcementLink: e.target.value })}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-border/50 bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40"
            />
          </div>
        )}
      </div>

      {/* ── デプロイモード ── */}
      <div className="p-4 rounded-2xl border border-border/50 bg-white/60 backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-foreground">デプロイモード</p>
            <p className="text-[12px] text-muted-foreground">Shopifyテーマへの反映方式</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "full", label: "フル", desc: "theme.liquid含む" },
            { id: "inject", label: "インジェクト", desc: "セクション追加のみ" },
            { id: "template", label: "テンプレート", desc: "ページ単位" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => updateLayout({ deployMode: mode.id })}
              className={clsx(
                "p-3 rounded-xl border text-left transition-all",
                themeLayout?.deployMode === mode.id
                  ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                  : "border-border/50 bg-white hover:bg-gray-50",
              )}
            >
              <p className="text-[13px] font-medium">{mode.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{mode.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── 保存ボタン ── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-[13px] font-medium text-white bg-accent hover:bg-accent/90 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {saving ? "保存中..." : "設定を保存"}
        </button>
        {saveMessage && (
          <span className={clsx(
            "text-[13px]",
            saveMessage.includes("失敗") ? "text-red-500" : "text-green-600",
          )}>
            {saveMessage}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * ヘッダー/フッター選択コンポーネント
 */
function SectionPicker({
  label,
  sublabel,
  icon: Icon,
  options,
  selectedId,
  onSelect,
}: {
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  options: SectionOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="p-4 rounded-2xl border border-border/50 bg-white/60 backdrop-blur-sm space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-foreground">{label}</p>
          <p className="text-[12px] text-muted-foreground">{sublabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={clsx(
              "p-3 rounded-xl border text-left transition-all",
              selectedId === opt.id
                ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                : "border-border/50 bg-white hover:bg-gray-50",
            )}
          >
            <p className="text-[13px] font-medium text-foreground">{opt.nameJa}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{opt.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 3. Store Profile Tab
// ============================================================

function StoreProfileTab({ storeInfo }: { storeInfo: StoreInfo }) {
  const [brandMemory, setBrandMemory] = useState<BrandMemoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/brand-memory");
        if (res.ok) {
          const data = await res.json();
          if (data.memory) {
            setBrandMemory(data.memory);
          }
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <TabLoader />;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Store Basic Info */}
      <SectionCard
        icon={Store}
        title="ストア基本情報"
        description="Shopifyストアから取得した情報"
      >
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="ストア名" value={storeInfo.name || storeInfo.shop} />
          <InfoItem label="プラン" value={storeInfo.plan || "—"} />
          <InfoItem label="メールアドレス" value={storeInfo.email || "—"} />
          <InfoItem label="Shopifyドメイン" value={storeInfo.shop} />
        </div>
      </SectionCard>

      {/* Brand Identity from Brand Memory */}
      <SectionCard
        icon={Palette}
        title="ブランドアイデンティティ"
        description="Brand Memoryから取得したデザイン設定"
      >
        {brandMemory ? (
          <div className="space-y-5">
            {/* Brand Name */}
            {brandMemory.brandName && (
              <InfoItem label="ブランド名" value={brandMemory.brandName} />
            )}

            {/* Color Palette */}
            {(brandMemory.primaryColor ||
              brandMemory.secondaryColor ||
              brandMemory.accentColor) && (
              <div>
                <p className="text-[12px] text-muted-foreground mb-2">
                  カラーパレット
                </p>
                <div className="flex items-center gap-3">
                  {[
                    { label: "メイン", color: brandMemory.primaryColor },
                    { label: "サブ", color: brandMemory.secondaryColor },
                    { label: "アクセント", color: brandMemory.accentColor },
                  ]
                    .filter((c) => c.color)
                    .map((c) => (
                      <div key={c.label} className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg border border-black/10 shadow-sm"
                          style={{ backgroundColor: c.color }}
                        />
                        <div>
                          <p className="text-[11px] text-muted-foreground">
                            {c.label}
                          </p>
                          <p className="text-[12px] font-mono text-foreground">
                            {c.color}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
                {brandMemory.colorPalette.length > 3 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {brandMemory.colorPalette.slice(3).map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-md border border-black/10"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fonts */}
            {(brandMemory.primaryFont || brandMemory.bodyFont) && (
              <div>
                <p className="text-[12px] text-muted-foreground mb-2">
                  フォント設定
                </p>
                <div className="flex gap-4">
                  {brandMemory.primaryFont && (
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          見出し
                        </p>
                        <p className="text-[13px] font-medium text-foreground">
                          {brandMemory.primaryFont}
                        </p>
                      </div>
                    </div>
                  )}
                  {brandMemory.bodyFont && (
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          本文
                        </p>
                        <p className="text-[13px] font-medium text-foreground">
                          {brandMemory.bodyFont}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Design Tones */}
            {brandMemory.tones.length > 0 && (
              <div>
                <p className="text-[12px] text-muted-foreground mb-2">
                  デザイントーン
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {brandMemory.tones.map((tone) => (
                    <span
                      key={tone}
                      className="text-[12px] px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium"
                    >
                      {tone}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200/40">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] text-amber-800 leading-relaxed">
                Brand Memoryが設定されていません。
              </p>
              <p className="text-[12px] text-amber-700/80 mt-1">
                「設定」タブからBrand Memoryを設定すると、ストア全体のデザインに自動反映されます。
              </p>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ============================================================
// 4. Domain & Publishing Tab
// ============================================================

function DomainTab({ storeInfo }: { storeInfo: StoreInfo }) {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Shopify Domain */}
      <SectionCard
        icon={Globe}
        title="ドメイン設定"
        description="ストアのドメイン・公開状態"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Globe className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">
                  Shopifyドメイン
                </p>
                <p className="text-[14px] font-medium text-foreground">
                  {storeInfo.shop}
                </p>
              </div>
            </div>
            <a
              href={`https://${storeInfo.shop}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-black/[0.04] text-muted-foreground transition-colors"
              title="ストアを開く"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {storeInfo.domain && storeInfo.domain !== storeInfo.shop && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">
                    カスタムドメイン
                  </p>
                  <p className="text-[14px] font-medium text-foreground">
                    {storeInfo.domain}
                  </p>
                </div>
              </div>
              <a
                href={`https://${storeInfo.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-black/[0.04] text-muted-foreground transition-colors"
                title="ドメインを開く"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Store Plan */}
      <SectionCard
        icon={Shield}
        title="ストアプラン"
        description="現在のShopifyプラン"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-foreground capitalize">
              {storeInfo.plan || "不明"}
            </p>
            <p className="text-[12px] text-muted-foreground">
              Shopify {storeInfo.plan || "—"} プラン
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Quick Links */}
      <SectionCard
        icon={ExternalLink}
        title="クイックリンク"
        description="Shopify管理画面の関連ページ"
      >
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "ドメイン設定", path: "/admin/settings/domains" },
            { label: "オンラインストア", path: "/admin/online_store" },
            { label: "ストア設定", path: "/admin/settings" },
            { label: "プラン管理", path: "/admin/settings/plan" },
          ].map((link) => (
            <a
              key={link.path}
              href={`https://${storeInfo.shop}${link.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-black/[0.02] hover:bg-black/[0.05] text-[13px] font-medium text-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              {link.label}
            </a>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================================
// 5. Health Check Tab
// ============================================================

function HealthTab() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runHealthCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/shopify/health");
      if (!res.ok) throw new Error("ヘルスチェックに失敗しました");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setHealth(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  if (loading && !health) return <TabLoader />;
  if (error && !health) {
    return (
      <TabError
        message={error}
        hint="Shopify APIへの接続を確認してください。トークンの期限切れやネットワークの問題が考えられます。"
      />
    );
  }
  if (!health) return null;

  const isHealthy = health.health.valid;
  const caps = health.capabilities;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Overall Status */}
      <div
        className={clsx(
          "p-5 rounded-2xl border",
          isHealthy
            ? "bg-emerald-50/50 border-emerald-200/50"
            : "bg-red-50/50 border-red-200/50",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isHealthy ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )}
            <div>
              <p className="text-[15px] font-semibold text-foreground">
                {isHealthy ? "接続正常" : "接続に問題があります"}
              </p>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                API Version: {health.apiVersion}
                {health.health.latestStableVersion &&
                  health.health.latestStableVersion !==
                    health.health.currentVersion &&
                  ` (最新: ${health.health.latestStableVersion})`}
              </p>
            </div>
          </div>
          <button
            onClick={runHealthCheck}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/60 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={clsx("w-4 h-4", loading && "animate-spin")}
            />
            再チェック
          </button>
        </div>

        {health.health.deprecationWarning && (
          <div className="mt-3 p-3 rounded-xl bg-amber-100/50 border border-amber-200/50">
            <p className="text-[13px] text-amber-800">
              {health.health.deprecationWarning}
            </p>
          </div>
        )}
      </div>

      {/* Connection Details */}
      <SectionCard
        icon={Activity}
        title="接続詳細"
        description="Shopify APIとの接続情報"
      >
        <div className="space-y-3">
          <HealthItem
            label="API接続"
            value={isHealthy ? "正常" : "異常"}
            status={isHealthy ? "ok" : "error"}
          />
          <HealthItem
            label="APIバージョン"
            value={health.apiVersion}
            status="ok"
          />
          <HealthItem
            label="ストア"
            value={health.shop || "—"}
            status={health.shop ? "ok" : "error"}
          />
          {health.scopes && (
            <ScopeStatus currentScopes={health.scopes} />
          )}
          {health.checkedAt && (
            <HealthItem
              label="チェック時刻"
              value={new Date(health.checkedAt).toLocaleString("ja-JP")}
              status="neutral"
            />
          )}
        </div>
      </SectionCard>

      {/* Theme Capabilities */}
      {caps && (
        <SectionCard
          icon={Zap}
          title="テーマ互換性"
          description="メインテーマの機能対応状況"
        >
          <div className="space-y-3">
            <HealthItem
              label="Online Store 2.0"
              value={caps.supportsOS2 ? "対応" : "非対応"}
              status={caps.supportsOS2 ? "ok" : "warn"}
            />
            <HealthItem
              label="JSONテンプレート"
              value={caps.supportsJsonTemplates ? "対応" : "非対応"}
              status={caps.supportsJsonTemplates ? "ok" : "warn"}
            />
            <HealthItem
              label="セクションベース"
              value={caps.supportsSections ? "対応" : "非対応"}
              status={caps.supportsSections ? "ok" : "warn"}
            />
            <HealthItem
              label="Asset API"
              value={caps.supportsAssetApi ? "利用可能" : "利用不可"}
              status={caps.supportsAssetApi ? "ok" : "error"}
            />
            <HealthItem
              label="テーマエンジン"
              value={
                caps.themeEngine === "os2"
                  ? "OS 2.0"
                  : caps.themeEngine === "legacy"
                    ? "レガシー"
                    : "不明"
              }
              status={caps.themeEngine === "os2" ? "ok" : "warn"}
            />
          </div>

          {!caps.supportsOS2 && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50/60 border border-amber-200/40">
              <p className="text-[13px] text-amber-800 leading-relaxed">
                このテーマはOnline Store 2.0に非対応です。
                Aicataのフル機能を利用するにはOS 2.0対応テーマへの移行を推奨します。
              </p>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}

// ============================================================
// Shared Components
// ============================================================

function NotConnectedState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <Store className="w-7 h-7 text-gray-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Shopifyストア未接続
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          サイト構築を始めるには、まず「設定」タブからShopifyストアを接続してください。
        </p>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Palette;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-white/60 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border/30 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-black/[0.03] flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">{title}</h3>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] text-muted-foreground mb-0.5">{label}</p>
      <p className="text-[14px] font-medium text-foreground">{value}</p>
    </div>
  );
}

function HealthItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "ok" | "warn" | "error" | "neutral";
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-foreground">{value}</span>
        {status !== "neutral" && (
          <div
            className={clsx(
              "w-2 h-2 rounded-full",
              status === "ok" && "bg-emerald-500",
              status === "warn" && "bg-amber-500",
              status === "error" && "bg-red-500",
            )}
          />
        )}
      </div>
    </div>
  );
}

const REQUIRED_SCOPES = [
  "read_content",
  "write_content",
  "read_themes",
  "write_themes",
  "read_products",
  "read_orders",
];

function ScopeStatus({ currentScopes }: { currentScopes: string }) {
  const granted = currentScopes.split(",").map((s) => s.trim());

  // Shopifyの仕様: write_* が付与されていれば read_* も暗黙的に利用可能
  // レスポンスの scope 文字列には write_* しか含まれない場合がある
  const effectiveGranted = new Set(granted);
  for (const scope of granted) {
    if (scope.startsWith("write_")) {
      effectiveGranted.add(scope.replace("write_", "read_"));
    }
  }

  const missing = REQUIRED_SCOPES.filter((s) => !effectiveGranted.has(s));

  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] text-muted-foreground">OAuthスコープ</span>
        {missing.length === 0 ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-foreground">すべて付与済み</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-amber-600">{missing.length}件不足</span>
            <div className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {REQUIRED_SCOPES.map((scope) => {
          const isGranted = effectiveGranted.has(scope);
          return (
            <span
              key={scope}
              className={clsx(
                "text-[11px] font-mono px-2 py-0.5 rounded-md",
                isGranted
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                  : "bg-red-50 text-red-600 border border-red-200/50",
              )}
            >
              {isGranted ? "✓" : "✗"} {scope}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ScopeMissingBanner({
  scope,
  shop,
  description,
}: {
  scope: string;
  shop: string;
  description: string;
}) {
  const handleReauth = () => {
    window.location.href = `/api/shopify/install?shop=${encodeURIComponent(shop)}&returnTo=site`;
  };

  const partnersUrl = `https://partners.shopify.com`;

  return (
    <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-amber-900">
              OAuthスコープの追加が必要です
            </h3>
            <p className="text-[13px] text-amber-800/80 mt-1 leading-relaxed">
              {description}
            </p>
            <p className="text-[12px] text-amber-800/60 mt-1">
              現在の権限: <code className="font-mono bg-amber-100/80 px-1 rounded">write_content</code> のみ
            </p>
            <p className="text-[12px] text-amber-800/60 mt-0.5">
              必要な権限: <code className="font-mono bg-amber-100/80 px-1 rounded">{scope}</code>
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-step guide */}
      <div className="px-5 py-4 border-t border-amber-200/40 bg-amber-50/30 space-y-3">
        <p className="text-[13px] font-semibold text-amber-900">設定手順</p>

        <div className="space-y-2.5">
          {/* Step 1 */}
          <div className="flex items-start gap-2.5">
            <span className="shrink-0 w-5 h-5 rounded-full bg-amber-200/80 text-amber-800 text-[11px] font-bold flex items-center justify-center">1</span>
            <div>
              <p className="text-[13px] text-amber-900">
                Shopify Partnersでアプリのスコープを更新
              </p>
              <a
                href={partnersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] text-accent hover:underline mt-0.5"
              >
                <ExternalLink className="w-3 h-3" />
                Shopify Partnersを開く
              </a>
              <p className="text-[11px] text-amber-700/60 mt-1 leading-relaxed">
                アプリ → APIアクセス → Access scopes に
                <code className="font-mono bg-amber-100/80 px-1 rounded">{scope}</code>
                を追加して保存
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-2.5">
            <span className="shrink-0 w-5 h-5 rounded-full bg-amber-200/80 text-amber-800 text-[11px] font-bold flex items-center justify-center">2</span>
            <div>
              <p className="text-[13px] text-amber-900">
                Aicataで再認証してスコープを反映
              </p>
              <button
                onClick={handleReauth}
                className="mt-1.5 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] shadow-sm hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Shopifyで再認証
              </button>
              <p className="text-[11px] text-amber-700/60 mt-1">
                Shopifyの承認画面で新しい権限を確認して承認してください
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
    </div>
  );
}

function TabError({
  message,
  hint,
}: {
  message: string;
  hint?: string;
}) {
  return (
    <div className="max-w-2xl space-y-3">
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50/50 border border-red-200/40">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-medium text-red-800">{message}</p>
          {hint && (
            <p className="text-[12px] text-red-700/70 mt-1 leading-relaxed">
              {hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
