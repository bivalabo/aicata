// ============================================================
// Aicata Design Engine — Page Template: Luxury Beauty Product
// Gen-3: セクション参照ベースのページテンプレート
// Aesop / THREE / SHIRO レベルの高級スキンケア商品詳細ページ
// ============================================================

import type { PageTemplate } from "../../types";

export const LUXURY_BEAUTY_PRODUCT: PageTemplate = {
  id: "luxury-beauty-product",
  name: "ラグジュアリー・ビューティ 商品詳細ページ",
  description:
    "Aesop、THREE、SHIROなどの高級スキンケアブランドを参考にした商品詳細ページ。タイポグラフィ重視、ウォームニュートラルの配色、贅沢な余白を活かした設計。",
  industries: ["beauty", "lifestyle"],
  tones: ["luxury", "elegant", "minimal"],
  pageType: "product",

  // ── デザイントークン ──
  designTokens: {
    colors: {
      "--color-bg": "#FFFCF7",
      "--color-text": "#2C2C2C",
      "--color-accent": "#8B7355",
      "--color-muted": "#7A7A7A",
      "--color-border": "#E8E0D4",
      "--color-surface": "#F5F0EB",
    },
    typography: {
      "--font-heading":
        '"Cormorant Garamond", "Shippori Mincho", serif',
      "--font-body":
        '"Noto Sans JP", "Helvetica Neue", Arial, sans-serif',
      "--font-accent": '"Cormorant Garamond", serif',
    },
    spacing: {
      "--section-padding": "clamp(60px, 10vw, 160px)",
      "--section-padding-sm": "clamp(40px, 6vw, 80px)",
      "--gap-lg": "clamp(40px, 4vw, 80px)",
      "--gap-md": "clamp(24px, 3vw, 48px)",
      "--gap-sm": "clamp(12px, 1.5vw, 24px)",
      "--content-max": "1440px",
      "--content-narrow": "960px",
    },
    motion: {
      "--ease-default": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      "--ease-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      "--duration-slow": "0.8s",
      "--duration-default": "0.4s",
      "--duration-fast": "0.2s",
    },
  },

  // ── セクション構成 ──
  // Original header/footer (now managed by ThemeLayout):
  //   Navigation: nav-elegant-dropdown
  //   Announcement: announcement-top-bar
  //   Footer: footer-elegant-columns

  sections: [
    { sectionId: "breadcrumb-simple-path", order: 0},
    { sectionId: "product-gallery-thumbnail-slider", order: 1},
    { sectionId: "product-info-classic-vertical", order: 2},
    { sectionId: "product-description-tabbed", order: 3},
    { sectionId: "product-reviews-star-rating", order: 4},
    { sectionId: "related-products-card-scroll", order: 5},
    { sectionId: "cta-newsletter-minimal", order: 6},
  ],

  // ── フォント ──
  fonts: [
    { family: "Cormorant Garamond", weights: [300, 400, 500], italic: true },
    { family: "Shippori Mincho", weights: [400, 500] },
    { family: "Noto Sans JP", weights: [200, 300, 400, 500] },
  ],
};

// 後方互換: 旧名でもアクセス可能
export const LUXURY_BEAUTY_PRODUCT_TEMPLATE = LUXURY_BEAUTY_PRODUCT;
