// ============================================================
// Aicata Design Engine — Page Template: Article Detail Page
// Gen-3: ブログ記事詳細ページ
// ============================================================

import type { PageTemplate } from "../../types";

export const GENERAL_ARTICLE: PageTemplate = {
  id: "general-article",
  name: "記事詳細ページ（汎用）",
  description:
    "ブログ記事の詳細ページ。読みやすさ重視のタイポグラフィとシングルカラムレイアウト。",
  industries: ["general", "beauty", "fashion", "food", "lifestyle", "tech", "health"],
  tones: ["modern", "minimal", "warm", "elegant"],
  pageType: "article",

  designTokens: {
    colors: {
      "--color-bg": "#FFFFFF",
      "--color-text": "#1C1C1C",
      "--color-accent": "#2563EB",
      "--color-muted": "#6B7280",
      "--color-border": "#E5E7EB",
      "--color-surface": "#F9FAFB",
    },
    typography: {
      "--font-heading": '"Playfair Display", "Noto Serif JP", serif',
      "--font-body": '"Inter", "Noto Sans JP", sans-serif',
      "--font-accent": '"Inter", sans-serif',
    },
    spacing: {
      "--section-padding": "clamp(40px, 6vw, 80px)",
      "--section-padding-sm": "clamp(24px, 4vw, 48px)",
      "--gap-lg": "clamp(32px, 4vw, 64px)",
      "--gap-md": "clamp(20px, 2.5vw, 40px)",
      "--gap-sm": "clamp(10px, 1.5vw, 20px)",
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
    { sectionId: "nav-minimal-sticky", order: 0 },
    { sectionId: "breadcrumb-simple-path", order: 1 },
    { sectionId: "hero-minimal-centered", order: 2 },
    { sectionId: "story-split-text-image", order: 3 },
    { sectionId: "testimonial-quote-single", order: 4 },
    { sectionId: "cta-newsletter-minimal", order: 5 },
    { sectionId: "footer-minimal-centered", order: 6 },
  ],

  fonts: [
    { family: "Playfair Display", weights: [400, 700], italic: true },
    { family: "Inter", weights: [400, 500, 600] },
    { family: "Noto Serif JP", weights: [400, 700] },
    { family: "Noto Sans JP", weights: [400, 500] },
  ],
};
