// ============================================================
// Aicata Design Engine — Page Template: 404 Error Page
// Gen-3: ページが見つかりません
// ============================================================

import type { PageTemplate } from "../../types";

export const GENERAL_404: PageTemplate = {
  id: "general-404",
  name: "404エラーページ（汎用）",
  description:
    "ページ未検出時のエラーページ。フレンドリーなメッセージとナビゲーションリンクでユーザーを誘導。",
  industries: ["general", "beauty", "fashion", "food", "lifestyle", "tech", "health"],
  tones: ["modern", "minimal", "playful", "warm"],
  pageType: "404",

  designTokens: {
    colors: {
      "--color-bg": "#FAFAFA",
      "--color-text": "#1A1A1A",
      "--color-accent": "#6366F1",
      "--color-muted": "#9CA3AF",
      "--color-border": "#E5E7EB",
      "--color-surface": "#FFFFFF",
    },
    typography: {
      "--font-heading": '"Inter", "Noto Sans JP", sans-serif',
      "--font-body": '"Inter", "Noto Sans JP", sans-serif',
      "--font-accent": '"Inter", sans-serif',
    },
    spacing: {
      "--section-padding": "clamp(80px, 12vw, 180px)",
      "--section-padding-sm": "clamp(40px, 6vw, 80px)",
      "--gap-lg": "clamp(32px, 4vw, 64px)",
      "--gap-md": "clamp(20px, 2.5vw, 40px)",
      "--gap-sm": "clamp(10px, 1.5vw, 20px)",
      "--content-max": "800px",
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
  // Original header/footer (now managed by ThemeLayout):
  //   Navigation: nav-minimal-sticky
  //   Footer: footer-minimal-centered


  sections: [
    { sectionId: "hero-minimal-centered", order: 0},
    { sectionId: "products-card-grid", order: 1},
    { sectionId: "search-predictive-overlay", order: 2},
  ],

  fonts: [
    { family: "Inter", weights: [400, 500, 600, 700, 800] },
    { family: "Noto Sans JP", weights: [400, 500, 700] },
  ],
};
