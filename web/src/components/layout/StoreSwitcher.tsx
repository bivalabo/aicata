"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Store,
  ChevronDown,
  Check,
  Plus,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

interface StoreInfo {
  id: string;
  shop: string;
  name: string;
  domain: string;
  isActive: boolean;
}

interface StoreSwitcherProps {
  collapsed?: boolean;
  onStoreChange?: () => void;
}

export default function StoreSwitcher({
  collapsed = false,
  onStoreChange,
}: StoreSwitcherProps) {
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [activeStore, setActiveStore] = useState<StoreInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchStores = useCallback(async () => {
    try {
      const res = await fetch("/api/stores");
      const data = await res.json();
      setStores(data.stores || []);
      setActiveStore(data.activeStore || null);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSwitch = async (storeId: string) => {
    setSwitching(true);
    try {
      await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      await fetchStores();
      onStoreChange?.();
    } catch {
      // Silently fail
    } finally {
      setSwitching(false);
      setOpen(false);
    }
  };

  // 0 or 1 store → don't show switcher
  if (stores.length <= 1) {
    if (!activeStore) return null;

    return (
      <div
        className={clsx(
          "mx-3 mb-2 flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white/50",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Store className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-foreground truncate">
              {activeStore.name || activeStore.shop.replace(".myshopify.com", "")}
            </p>
            <p className="text-[9px] text-muted-foreground truncate">
              {activeStore.shop}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Multiple stores → show switcher
  return (
    <div className="mx-3 mb-2 relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "w-full flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white/50 hover:bg-white/70 transition-colors",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Store className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-semibold text-foreground truncate">
                {activeStore?.name ||
                  activeStore?.shop.replace(".myshopify.com", "") ||
                  "ストアを選択"}
              </p>
            </div>
            <ChevronDown
              className={clsx(
                "w-3.5 h-3.5 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && !collapsed && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-border shadow-lg shadow-black/[0.08] py-1 z-50">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => handleSwitch(store.id)}
              disabled={switching}
              className={clsx(
                "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors",
                store.isActive
                  ? "bg-accent/[0.04]"
                  : "hover:bg-black/[0.03]",
              )}
            >
              <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Store className="w-3 h-3 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-foreground truncate">
                  {store.name || store.shop.replace(".myshopify.com", "")}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {store.shop}
                </p>
              </div>
              {store.isActive && (
                <Check className="w-3.5 h-3.5 text-accent shrink-0" />
              )}
              {switching && store.id !== activeStore?.id && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              )}
            </button>
          ))}
          <div className="h-px bg-border mx-2 my-1" />
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              // Navigate to settings to add new store
              window.dispatchEvent(
                new CustomEvent("aicata:navigate", { detail: { nav: "settings" } }),
              );
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground hover:bg-black/[0.03] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            ストアを追加
          </a>
        </div>
      )}
    </div>
  );
}
