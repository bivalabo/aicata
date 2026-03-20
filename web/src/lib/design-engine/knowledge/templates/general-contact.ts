// ============================================================
// Aicata Design Engine — Page Template: Contact Page
// Gen-3: お問い合わせページ
// ============================================================

import type { PageTemplate } from "../../types";

export const GENERAL_CONTACT: PageTemplate = {
  id: "general-contact",
  name: "お問い合わせページ（汎用）",
  description:
    "お問い合わせフォーム、所在地情報、SNSリンクを含むコンタクトページ。",
  industries: ["general", "beauty", "fashion", "food", "lifestyle", "tech", "health"],
  tones: ["modern", "minimal", "warm", "elegant"],
  pageType: "contact",

  designTokens: {
    colors: {
      "--color-bg": "#FAFAFA",
      "--color-text": "#1A1A1A",
      "--color-accent": "#3B82F6",
      "--color-muted": "#71717A",
      "--color-border": "#E4E4E7",
      "--color-surface": "#FFFFFF",
    },
    typography: {
      "--font-heading": '"Inter", "Noto Sans JP", sans-serif',
      "--font-body": '"Inter", "Noto Sans JP", sans-serif',
      "--font-accent": '"Inter", sans-serif',
    },
    spacing: {
      "--section-padding": "clamp(60px, 8vw, 120px)",
      "--section-padding-sm": "clamp(32px, 5vw, 64px)",
      "--gap-lg": "clamp(40px, 5vw, 80px)",
      "--gap-md": "clamp(24px, 3vw, 48px)",
      "--gap-sm": "clamp(12px, 1.5vw, 24px)",
      "--content-max": "1000px",
      "--content-narrow": "600px",
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
    { sectionId: "contact-elegant-split", order: 3 },
    { sectionId: "features-icon-grid", order: 4 },
    { sectionId: "social-instagram-feed", order: 5 },
    { sectionId: "footer-elegant-columns", order: 6 },
  ],

  fonts: [
    { family: "Inter", weights: [400, 500, 600, 700] },
    { family: "Noto Sans JP", weights: [400, 500, 700] },
  ],
};
