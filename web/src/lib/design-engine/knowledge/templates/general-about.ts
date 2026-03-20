// ============================================================
// Aicata Design Engine — Page Template: About Page
// Gen-3: ブランドストーリー・会社紹介ページ
// ============================================================

import type { PageTemplate } from "../../types";

export const GENERAL_ABOUT: PageTemplate = {
  id: "general-about",
  name: "Aboutページ（汎用）",
  description:
    "ブランドストーリー、ミッション、チーム紹介を伝える会社概要ページ。ストーリーテリング重視のレイアウト。",
  industries: ["general", "beauty", "fashion", "food", "lifestyle", "tech", "health"],
  tones: ["warm", "elegant", "natural", "modern"],
  pageType: "about",

  designTokens: {
    colors: {
      "--color-bg": "#FAFAFA",
      "--color-text": "#1A1A1A",
      "--color-accent": "#8B7355",
      "--color-muted": "#888888",
      "--color-border": "#E8E8E8",
      "--color-surface": "#FFFFFF",
    },
    typography: {
      "--font-heading": '"Playfair Display", "Noto Serif JP", serif',
      "--font-body": '"Inter", "Noto Sans JP", sans-serif',
      "--font-accent": '"Playfair Display", serif',
    },
    spacing: {
      "--section-padding": "clamp(60px, 10vw, 140px)",
      "--section-padding-sm": "clamp(40px, 6vw, 80px)",
      "--gap-lg": "clamp(40px, 5vw, 80px)",
      "--gap-md": "clamp(24px, 3vw, 48px)",
      "--gap-sm": "clamp(12px, 1.5vw, 24px)",
      "--content-max": "1200px",
      "--content-narrow": "720px",
    },
    motion: {
      "--ease-default": "cubic-bezier(0.25, 0.1, 0.25, 1)",
      "--ease-out": "cubic-bezier(0, 0, 0.2, 1)",
      "--duration-slow": "0.8s",
      "--duration-default": "0.4s",
      "--duration-fast": "0.2s",
    },
  },

  sections: [
    { sectionId: "nav-elegant-dropdown", order: 0 },
    { sectionId: "hero-minimal-centered", order: 1 },
    { sectionId: "story-split-text-image", order: 2 },
    { sectionId: "story-full-bleed-image", order: 3 },
    { sectionId: "features-icon-grid", order: 4 },
    { sectionId: "story-timeline-vertical", order: 5 },
    { sectionId: "testimonial-quote-single", order: 6 },
    { sectionId: "cta-newsletter-minimal", order: 7 },
    { sectionId: "footer-elegant-columns", order: 8 },
  ],

  fonts: [
    { family: "Playfair Display", weights: [400, 700], italic: true },
    { family: "Inter", weights: [300, 400, 500, 600] },
    { family: "Noto Serif JP", weights: [400, 700] },
    { family: "Noto Sans JP", weights: [400, 500] },
  ],
};
