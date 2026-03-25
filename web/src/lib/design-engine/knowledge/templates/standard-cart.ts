// ============================================================
// Aicata Design Engine — Page Template: Standard Cart
// Gen-3: セクション参照ベースのページテンプレート
// ユニバーサル・カートページ（全業界・全トーン対応）
// ============================================================

import type { PageTemplate } from "../../types";

export const STANDARD_CART: PageTemplate = {
  id: "standard-cart",
  name: "スタンダード カートページ",
  description:
    "すべてのブランド・業界に対応できるユニバーサルなカートページ。ニュートラルな配色、読みやすいタイポグラフィ、明確な操作フロー。",
  industries: ["general"],
  tones: ["minimal", "modern", "elegant"],
  pageType: "cart",

  // ── デザイントークン ──
  designTokens: {
    colors: {
      "--color-bg": "#FFFFFF",
      "--color-text": "#2C2C2C",
      "--color-accent": "#1A1A1A",
      "--color-muted": "#808080",
      "--color-border": "#E8E8E8",
      "--color-surface": "#F9F9F9",
    },
    typography: {
      "--font-heading":
        '"Inter", "-apple-system", "BlinkMacSystemFont", sans-serif',
      "--font-body":
        '"Inter", "Noto Sans JP", "-apple-system", "BlinkMacSystemFont", sans-serif',
      "--font-accent": '"Inter", sans-serif',
    },
    spacing: {
      "--section-padding": "clamp(40px, 8vw, 100px)",
      "--section-padding-sm": "clamp(24px, 4vw, 60px)",
      "--gap-lg": "clamp(32px, 3vw, 64px)",
      "--gap-md": "clamp(16px, 2vw, 32px)",
      "--gap-sm": "clamp(8px, 1vw, 16px)",
      "--content-max": "1320px",
      "--content-narrow": "960px",
    },
    motion: {
      "--ease-default": "cubic-bezier(0.4, 0, 0.2, 1)",
      "--ease-out": "cubic-bezier(0, 0, 0.2, 1)",
      "--duration-slow": "0.6s",
      "--duration-default": "0.3s",
      "--duration-fast": "0.15s",
    },
  },

  // ── セクション構成 ──
  // Original header/footer (now managed by ThemeLayout):
  //   Navigation: nav-minimal-sticky
  //   Footer: footer-elegant-columns

  sections: [
    { sectionId: "breadcrumb-simple-path", order: 0},
    { sectionId: "cart-items-line-list", order: 1},
    { sectionId: "cart-summary-order-total", order: 2},
    { sectionId: "trust-badges-icon-strip", order: 3},
    { sectionId: "related-products-card-scroll", order: 4},
  ],

  // ── フォント ──
  fonts: [
    { family: "Inter", weights: [400, 500, 600, 700] },
    { family: "Noto Sans JP", weights: [400, 500, 600] },
  ],
};

// 後方互換: 旧名でもアクセス可能
export const STANDARD_CART_TEMPLATE = STANDARD_CART;
