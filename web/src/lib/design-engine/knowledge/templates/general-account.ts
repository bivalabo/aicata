// ============================================================
// Aicata Design Engine — Page Template: Account Page
// Gen-3: 顧客アカウントページ
// ============================================================

import type { PageTemplate } from "../../types";

export const GENERAL_ACCOUNT: PageTemplate = {
  id: "general-account",
  name: "アカウントページ（汎用）",
  description:
    "ログイン・登録・注文履歴・プロフィール管理のアカウント関連ページ。シンプルで使いやすいフォーム中心のレイアウト。",
  industries: ["general", "beauty", "fashion", "food", "lifestyle", "tech", "health"],
  tones: ["minimal", "modern", "cool"],
  pageType: "account",

  designTokens: {
    colors: {
      "--color-bg": "#FFFFFF",
      "--color-text": "#1A1A1A",
      "--color-accent": "#111111",
      "--color-muted": "#999999",
      "--color-border": "#EEEEEE",
      "--color-surface": "#F8F8F8",
    },
    typography: {
      "--font-heading": '"Inter", "Noto Sans JP", sans-serif',
      "--font-body": '"Inter", "Noto Sans JP", sans-serif',
      "--font-accent": '"Inter", sans-serif',
    },
    spacing: {
      "--section-padding": "clamp(40px, 6vw, 80px)",
      "--section-padding-sm": "clamp(24px, 4vw, 48px)",
      "--gap-lg": "clamp(24px, 3vw, 48px)",
      "--gap-md": "clamp(16px, 2vw, 32px)",
      "--gap-sm": "clamp(8px, 1vw, 16px)",
      "--content-max": "600px",
      "--content-narrow": "480px",
    },
    motion: {
      "--ease-default": "cubic-bezier(0.25, 0.1, 0.25, 1)",
      "--ease-out": "cubic-bezier(0, 0, 0.2, 1)",
      "--duration-slow": "0.5s",
      "--duration-default": "0.3s",
      "--duration-fast": "0.15s",
    },
  },

  sections: [
    { sectionId: "nav-elegant-dropdown", order: 0 },
    { sectionId: "hero-minimal-centered", order: 1 },
    { sectionId: "contact-form-elegant-split", order: 2 },
    { sectionId: "footer-elegant-columns", order: 3 },
  ],

  fonts: [
    { family: "Inter", weights: [400, 500, 600] },
    { family: "Noto Sans JP", weights: [400, 500] },
  ],
};
