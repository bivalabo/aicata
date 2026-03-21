// ============================================================
// Aicata Design Engine — Page Template: Password Page
// Gen-3: パスワード保護ページ
// ============================================================

import type { PageTemplate } from "../../types";

export const GENERAL_PASSWORD: PageTemplate = {
  id: "general-password",
  name: "パスワード保護ページ（汎用）",
  description:
    "ストア公開前やメンテナンス時に表示されるパスワード入力ページ。ブランドイメージを維持しつつ最小限の構成。",
  industries: ["general", "beauty", "fashion", "food", "lifestyle", "tech", "health"],
  tones: ["elegant", "minimal", "modern"],
  pageType: "password",

  designTokens: {
    colors: {
      "--color-bg": "#0A0A0A",
      "--color-text": "#FFFFFF",
      "--color-accent": "#C8A97E",
      "--color-muted": "#888888",
      "--color-border": "#333333",
      "--color-surface": "#1A1A1A",
    },
    typography: {
      "--font-heading": '"Playfair Display", "Noto Serif JP", serif',
      "--font-body": '"Inter", "Noto Sans JP", sans-serif',
      "--font-accent": '"Playfair Display", serif',
    },
    spacing: {
      "--section-padding": "clamp(60px, 10vw, 140px)",
      "--section-padding-sm": "clamp(40px, 6vw, 80px)",
      "--gap-lg": "clamp(32px, 4vw, 64px)",
      "--gap-md": "clamp(20px, 2.5vw, 40px)",
      "--gap-sm": "clamp(12px, 1.5vw, 24px)",
      "--content-max": "480px",
      "--content-narrow": "400px",
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
    { sectionId: "hero-minimal-centered", order: 0 },
    { sectionId: "contact-form-elegant-split", order: 1 },
    { sectionId: "footer-minimal-centered", order: 2 },
  ],

  fonts: [
    { family: "Playfair Display", weights: [400, 700], italic: true },
    { family: "Inter", weights: [300, 400, 500] },
    { family: "Noto Serif JP", weights: [400, 700] },
    { family: "Noto Sans JP", weights: [400] },
  ],
};
