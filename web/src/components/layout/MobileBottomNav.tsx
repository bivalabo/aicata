"use client";

import {
  Sparkles,
  Layers,
  Heart,
  Settings,
} from "lucide-react";
import clsx from "clsx";

interface MobileBottomNavProps {
  activeNav: string;
  onNavigate: (nav: string) => void;
}

const NAV_ITEMS = [
  { id: "create", icon: Sparkles, label: "Create" },
  { id: "studio", icon: Layers, label: "Studio" },
  { id: "brand", icon: Heart, label: "Brand" },
  { id: "settings", icon: Settings, label: "設定" },
];

export default function MobileBottomNav({
  activeNav,
  onNavigate,
}: MobileBottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/80 backdrop-blur-xl safe-area-bottom"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={clsx(
              "flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors",
              activeNav === item.id
                ? "text-accent"
                : "text-muted-foreground",
            )}
          >
            <item.icon
              className={clsx(
                "w-5 h-5",
                activeNav === item.id && "stroke-[2.5]",
              )}
            />
            <span className="text-[10px] font-medium leading-none">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
