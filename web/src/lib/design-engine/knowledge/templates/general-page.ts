// ============================================================
// Aicata Design Engine — Page Template: General Page
// Gen-3: 汎用ページ（FAQ、利用規約、プライバシーポリシー等）
// ============================================================

import type { PageTemplate } from "../../types";

export const GENERAL_PAGE: PageTemplate = {
  id: "general-page",
  name: "汎用ページ",
  description:
    "FAQ、利用規約、プライバシーポリシーなど、テキスト中心のコンテンツページ。読みやすさを重視したシンプルなレイアウト。",
  industries: ["general", "beauty", "fashion", "food", "lifestyle", "tech", "health"],
  tones: ["minimal", "modern", "warm"],
  pageType: "general",

  designTokens: {
    colors: {
      "--color-bg": "#FAFAFA",
      "--color-text": "#1A1A1A",
      "--color-accent": "#555555",
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
      "--section-padding": "clamp(48px, 8vw, 100px)",
      "--section-padding-sm": "clamp(32px, 5vw, 60px)",
      "--gap-lg": "clamp(32px, 4vw, 64px)",
      "--gap-md": "clamp(20px, 2.5vw, 40px)",
      "--gap-sm": "clamp(12px, 1.5vw, 24px)",
      "--content-max": "800px",
      "--content-narrow": "680px",
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
    { sectionId: "story-full-bleed-image", order: 3 },
    { sectionId: "cta-bold-split", order: 4 },
    { sectionId: "footer-elegant-columns", order: 5 },
  ],

  fonts: [
    { family: "Inter", weights: [400, 500, 600] },
    { family: "Noto Sans JP", weights: [400, 500] },
  ],
};
