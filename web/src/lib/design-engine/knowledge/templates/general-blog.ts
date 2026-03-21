// ============================================================
// Aicata Design Engine — Page Template: Blog Index Page
// Gen-3: ブログ記事一覧ページ
// ============================================================

import type { PageTemplate } from "../../types";

export const GENERAL_BLOG: PageTemplate = {
  id: "general-blog",
  name: "ブログ一覧ページ（汎用）",
  description:
    "ブログ記事一覧ページ。カードグリッドレイアウトでカテゴリフィルタ付き。",
  industries: ["general", "beauty", "fashion", "food", "lifestyle", "tech", "health"],
  tones: ["modern", "minimal", "warm", "natural"],
  pageType: "blog",

  designTokens: {
    colors: {
      "--color-bg": "#FFFFFF",
      "--color-text": "#1A1A1A",
      "--color-accent": "#2563EB",
      "--color-muted": "#6B7280",
      "--color-border": "#E5E7EB",
      "--color-surface": "#F9FAFB",
    },
    typography: {
      "--font-heading": '"Inter", "Noto Sans JP", sans-serif',
      "--font-body": '"Inter", "Noto Sans JP", sans-serif',
      "--font-accent": '"Inter", sans-serif',
    },
    spacing: {
      "--section-padding": "clamp(40px, 6vw, 80px)",
      "--section-padding-sm": "clamp(24px, 4vw, 48px)",
      "--gap-lg": "clamp(32px, 4vw, 64px)",
      "--gap-md": "clamp(20px, 2.5vw, 40px)",
      "--gap-sm": "clamp(10px, 1.5vw, 20px)",
      "--content-max": "1200px",
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
    { sectionId: "nav-minimal-sticky", order: 0 },
    { sectionId: "breadcrumb-simple-path", order: 1 },
    { sectionId: "hero-minimal-centered", order: 2 },
    { sectionId: "collection-filter-sidebar-accordion", order: 3 },
    { sectionId: "gallery-lightbox-grid", order: 4 },
    { sectionId: "cta-newsletter-minimal", order: 5 },
    { sectionId: "footer-minimal-centered", order: 6 },
  ],

  fonts: [
    { family: "Inter", weights: [400, 500, 600, 700] },
    { family: "Noto Sans JP", weights: [400, 500, 700] },
  ],
};
