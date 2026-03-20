// ============================================================
// Aicata Design Engine — Page Template: Search Results Page
// Gen-3: 検索結果ページ
// ============================================================

import type { PageTemplate } from "../../types";

export const GENERAL_SEARCH: PageTemplate = {
  id: "general-search",
  name: "検索結果ページ（汎用）",
  description:
    "商品・コンテンツの検索結果表示ページ。フィルタ付きグリッドレイアウト。",
  industries: ["general", "beauty", "fashion", "food", "lifestyle", "tech", "health"],
  tones: ["modern", "minimal"],
  pageType: "search",

  designTokens: {
    colors: {
      "--color-bg": "#FFFFFF",
      "--color-text": "#1A1A1A",
      "--color-accent": "#2563EB",
      "--color-muted": "#6B7280",
      "--color-border": "#E5E7EB",
      "--color-surface": "#F3F4F6",
    },
    typography: {
      "--font-heading": '"Inter", "Noto Sans JP", sans-serif',
      "--font-body": '"Inter", "Noto Sans JP", sans-serif',
      "--font-accent": '"Inter", sans-serif',
    },
    spacing: {
      "--section-padding": "clamp(32px, 5vw, 60px)",
      "--section-padding-sm": "clamp(20px, 3vw, 40px)",
      "--gap-lg": "clamp(24px, 3vw, 48px)",
      "--gap-md": "clamp(16px, 2vw, 32px)",
      "--gap-sm": "clamp(8px, 1vw, 16px)",
      "--content-max": "1200px",
      "--content-narrow": "800px",
    },
    motion: {
      "--ease-default": "cubic-bezier(0.25, 0.1, 0.25, 1)",
      "--ease-out": "cubic-bezier(0, 0, 0.2, 1)",
      "--duration-slow": "0.4s",
      "--duration-default": "0.2s",
      "--duration-fast": "0.1s",
    },
  },

  sections: [
    { sectionId: "nav-minimal-sticky", order: 0 },
    { sectionId: "search-predictive-overlay", order: 1 },
    { sectionId: "collection-filter-sidebar-accordion", order: 2 },
    { sectionId: "products-card-grid", order: 3 },
    { sectionId: "footer-minimal-centered", order: 4 },
  ],

  fonts: [
    { family: "Inter", weights: [400, 500, 600, 700] },
    { family: "Noto Sans JP", weights: [400, 500, 700] },
  ],
};
