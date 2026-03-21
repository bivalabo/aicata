"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StoreSwitcher from "./StoreSwitcher";
import {
  FilePlus2,
  MessagesSquare,
  LayoutGrid,
  Search,
  Settings,
  Sparkles,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Store,
  Trash2,
  MoreHorizontal,
  Brain,
  Globe,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  lastMessage?: string;
  type: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId?: string | null;
  activeNav?: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onNavigate: (path: string) => void;
}

const NAV_ITEMS = [
  { id: "chat", icon: MessagesSquare, label: "ページ制作" },
  { id: "site", icon: Store, label: "サイト構築" },
  { id: "pages", icon: FileText, label: "ページ管理" },
  { id: "settings", icon: Settings, label: "設定" },
];

const COMING_SOON_ITEMS = [
  { id: "seo", icon: Search, label: "SEO" },
  { id: "admin", icon: Brain, label: "Intelligence" },
];

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前`;
  if (diffDay < 7) return `${diffDay}日前`;
  return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

/** SSR-safe: 初回レンダーでは固定値を返し、マウント後に相対時間に切り替える */
function useRelativeDate(dateStr: string): string {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    // SSR と初回ハイドレーションで一致させる固定フォーマット
    const d = new Date(dateStr);
    return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
  }
  return formatRelativeDate(dateStr);
}

export default function Sidebar({
  conversations,
  activeConversationId,
  activeNav: activeNavProp = "chat",
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onNavigate,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const activeNav = activeNavProp;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const CONVERSATIONS_PER_PAGE = 20;
  const [visibleCount, setVisibleCount] = useState(CONVERSATIONS_PER_PAGE);
  const hasMoreConversations = conversations.length > visibleCount;
  const visibleConversations = conversations.slice(0, visibleCount);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 68 : 272 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="h-screen flex flex-col select-none shrink-0"
      style={{
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(16px) saturate(130%)",
        WebkitBackdropFilter: "blur(16px) saturate(130%)",
        borderRight: "1px solid rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#5b8def] flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-[16px] font-semibold tracking-tight text-foreground">
                Aicata
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#5b8def] flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-black/[0.04] text-muted transition-colors"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Store Switcher */}
      <StoreSwitcher collapsed={collapsed} />

      {/* Nav */}
      <nav className="px-3 py-4">
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <div key={item.id} className="flex items-center gap-0.5">
              <button
                onClick={() => onNavigate(item.id)}
                className={clsx(
                  "flex-1 flex items-center gap-3 rounded-xl text-[14px] transition-all duration-200",
                  collapsed ? "p-3 justify-center" : "px-3.5 py-3",
                  activeNav === item.id
                    ? "bg-white/85 text-foreground shadow-sm shadow-black/[0.03] font-semibold"
                    : "text-muted hover:text-foreground hover:bg-white/40",
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
              {/* ページ制作の横に新規作成ボタン */}
              {item.id === "chat" && !collapsed && (
                <button
                  onClick={() => {
                    onNavigate("chat");
                    onNewChat();
                  }}
                  className="p-2 rounded-lg text-muted-foreground/50 hover:text-accent hover:bg-accent/5 transition-colors"
                  title="新規ページ作成"
                >
                  <FilePlus2 className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        {!collapsed && (
          <div className="mt-4 pt-3 border-t border-black/[0.04]">
            <span className="px-3.5 text-[11px] text-muted-foreground/50 uppercase tracking-wider font-medium">
              Coming Soon
            </span>
            <div className="flex flex-col gap-1 mt-2">
              {COMING_SOON_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] text-muted-foreground/40 cursor-default"
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-black/[0.04]" />

      {/* History */}
      {!collapsed && activeNav === "chat" && (
        <ProjectHistory
          conversations={conversations}
          activeConversationId={activeConversationId}
          visibleCount={visibleCount}
          onSelectConversation={onSelectConversation}
          onDeleteConversation={onDeleteConversation}
          onShowMore={() => setVisibleCount((c) => c + CONVERSATIONS_PER_PAGE)}
          hasMore={hasMoreConversations}
          totalCount={conversations.length}
        />
      )}

      {/* Collapse toggle */}
      {collapsed && (
        <div className="mt-auto p-3">
          <button
            onClick={() => setCollapsed(false)}
            className="w-full p-2 rounded-xl hover:bg-white/60 text-muted transition-colors flex justify-center"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.aside>
  );
}

// ============================================================
// Project History Component
// ============================================================

function ProjectHistory({
  conversations,
  activeConversationId,
  visibleCount,
  onSelectConversation,
  onDeleteConversation,
  onShowMore,
  hasMore,
  totalCount,
}: {
  conversations: Conversation[];
  activeConversationId?: string | null;
  visibleCount: number;
  onSelectConversation: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onShowMore: () => void;
  hasMore: boolean;
  totalCount: number;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // フィルタリング
  const filtered = searchQuery.trim()
    ? conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : conversations.slice(0, visibleCount);

  const typeIcon = (type: string) => {
    switch (type) {
      case "site-build":
        return <Globe className="w-3 h-3 text-blue-500" />;
      default:
        return <MessagesSquare className="w-3 h-3 text-foreground/30" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-2 pb-2.5">
        <span className="text-[12px] text-foreground/60 uppercase tracking-widest font-medium">
          プロジェクト
        </span>
        {totalCount > 0 && (
          <span className="text-[11px] text-foreground/40">
            {totalCount}件
          </span>
        )}
      </div>

      {/* 検索（5件以上で表示） */}
      {totalCount >= 5 && (
        <div className="px-1 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="プロジェクトを検索..."
              className="w-full pl-7 pr-3 py-2 rounded-lg bg-white/50 border border-transparent focus:border-accent/30 focus:bg-white text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* プロジェクト一覧 */}
      <div className="flex flex-col gap-0.5 flex-1">
        {filtered.length === 0 && (
          <div className="text-[14px] text-foreground/50 px-3 py-8 text-center">
            {searchQuery ? (
              <>
                <Search className="w-7 h-7 mx-auto mb-2.5 text-foreground/20" />
                <p className="text-[13px]">見つかりませんでした</p>
              </>
            ) : (
              <>
                <MessagesSquare className="w-9 h-9 mx-auto mb-2.5 text-foreground/20" />
                <p>まだプロジェクトがありません</p>
                <p className="text-[12px] mt-1.5">新しいページを作りましょう</p>
              </>
            )}
          </div>
        )}

        {filtered.map((conv) => (
          <div
            key={conv.id}
            className="relative group"
            onMouseEnter={() => setHoveredId(conv.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              onClick={() => onSelectConversation(conv.id)}
              className={clsx(
                "w-full text-left rounded-xl px-3.5 py-3 transition-all duration-200",
                activeConversationId === conv.id
                  ? "bg-white/85 shadow-sm shadow-black/[0.03]"
                  : "hover:bg-white/40",
              )}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                {typeIcon(conv.type)}
                <span
                  className={clsx(
                    "text-[14px] truncate leading-snug flex-1 pr-5",
                    activeConversationId === conv.id
                      ? "text-foreground font-medium"
                      : "text-foreground/70",
                  )}
                >
                  {conv.title}
                </span>
              </div>
              <div className="flex items-center gap-2 pl-[18px]">
                <RelativeTime dateStr={conv.updatedAt} />
                {conv.type === "site-build" && (
                  <span className="text-[9px] text-blue-500/70 bg-blue-50 px-1 py-0.5 rounded">
                    リビルド
                  </span>
                )}
              </div>
            </button>

            {/* Delete button on hover */}
            {hoveredId === conv.id && onDeleteConversation && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(conv);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-error/10 text-muted-foreground/30 hover:text-error transition-colors"
                title="削除"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* もっと表示 */}
        {hasMore && !searchQuery && (
          <button
            onClick={onShowMore}
            className="w-full text-center text-[13px] text-muted-foreground hover:text-foreground py-2.5 mt-1.5 rounded-lg hover:bg-white/50 transition-colors"
          >
            さらに表示（残り{totalCount - visibleCount}件）
          </button>
        )}
      </div>

      {/* ── 削除確認ダイアログ ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[380px] p-6 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-foreground">
                  プロジェクトを削除
                </h3>
                <p className="text-[13px] text-muted-foreground">
                  この操作は取り消せません
                </p>
              </div>
            </div>
            <p className="text-[14px] text-foreground mb-5 px-1 leading-relaxed">
              「<span className="font-medium">{deleteTarget.title}</span>
              」を削除しますか？関連するチャット履歴もすべて失われます。
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-[14px] font-medium text-foreground bg-black/[0.04] hover:bg-black/[0.07] transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  onDeleteConversation?.(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Hydration-safe relative time display */
function RelativeTime({ dateStr }: { dateStr: string }) {
  const text = useRelativeDate(dateStr);
  return (
    <span
      className="text-[11px] text-foreground/40"
      suppressHydrationWarning
    >
      {text}
    </span>
  );
}
