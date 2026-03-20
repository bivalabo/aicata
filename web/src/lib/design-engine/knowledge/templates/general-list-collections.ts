// ============================================================
// Aicata Design Engine — Page Template: List Collections
// Gen-3: コレクション一覧ページ
// ============================================================

import type { PageTemplate } from "../../types";

export const GENERAL_LIST_COLLECTIONS: PageTemplate = {
  id: "general-list-collections",
  name: "コレクション一覧（汎用）",
  description:
    "全コレクションをカード形式で一覧表示するページ。ビジュアル重視のグリッドレイアウト。",
  industries: ["general", "beauty", "fashion", "food", "lifestyle", "tech", "health"],
  tones: ["modern", "minimal", "elegant"],
  pageType: "list-collections",

  designTokens: {
    colors: {
      "--color-bg": "#FAFAFA",
      "--color-text": "#1A1A1A",
      "--color-accent": "#2563EB",
      "--color-muted": "#888888",
      "--color-border": "#E5E5E5",
      "--color-surface": "#FFFFFF",
    },
    typography: {
      "--font-heading": '"Inter", "Noto Sans JP", sans-serif',
      "--font-body": '"Inter", "Noto Sans JP", sans-serif',
      "--font-accent": '"Inter", sans-serif',
    },
    spacing: {
      "--section-padding": "clamp(60px, 8vw, 120px)",
      "--section-padding-sm": "clamp(40px, 5vw, 60px)",
      "--gap-lg": "clamp(32px, 4vw, 64px)",
      "--gap-md": "clamp(20px, 2.5vw, 40px)",
      "--gap-sm": "clamp(12px, 1.5vw, 24px)",
      "--content-max": "1400px",
      "--content-narrow": "800px",
    },
    motion: {
      "--ease-default": "cubic-bezier(0.25, 0.1, 0.25, 1)",
      "--ease-out": "cubic-bezier(0, 0, 0.2, 1)",
      "--duration-slow": "0.6s",
      "--duration-default": "0.3s",
      "--duration-fast": "0.15s",
    },
  },

  sections: [
    { sectionId: "nav-elegant-dropdown", order: 0 },
    { sectionId: "breadcrumb-simple-path", order: 1 },
    { sectionId: "hero-minimal-centered", order: 2 },
    { sectionId: "collection-list-card-grid", order: 3 },
    { sectionId: "footer-elegant-columns", order: 4 },
  ],

  fonts: [
    { family: "Inter", weights: [400, 500, 600, 700] },
    { family: "Noto Sans JP", weights: [400, 500, 700] },
  ],
};
