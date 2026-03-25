// ============================================================
// Aicata Design Engine — Page Template: Bold Tech Product
// Gen-3: セクション参照ベースのページテンプレート
// 高コントラスト・テック系商品詳細ページ（ハイテク業界向け）
// ============================================================

import type { PageTemplate } from "../../types";

export const BOLD_TECH_PRODUCT: PageTemplate = {
  id: "bold-tech-product",
  name: "ボールド・テック 商品詳細ページ",
  description:
    "テック企業向けの大胆で現代的な商品詳細ページ。暗いバックグラウンド、鮮やかなアクセントカラー、モノスペース体を活かした設計。",
  industries: ["tech", "general"],
  tones: ["bold", "modern", "cool"],
  pageType: "product",

  // ── デザイントークン ──
  designTokens: {
    colors: {
      "--color-bg": "#0A0A0A",
      "--color-text": "#FFFFFF",
      "--color-accent": "#00D4FF",
      "--color-muted": "#999999",
      "--color-border": "#333333",
      "--color-surface": "#1A1A1A",
    },
    typography: {
      "--font-heading":
        '"Inter", "Courier Prime", monospace',
      "--font-body":
        '"Inter", "Monaco", "Courier New", monospace, sans-serif',
      "--font-accent": '"Courier Prime", monospace',
    },
    spacing: {
      "--section-padding": "clamp(50px, 8vw, 120px)",
      "--section-padding-sm": "clamp(32px, 5vw, 70px)",
      "--gap-lg": "clamp(36px, 4vw, 72px)",
      "--gap-md": "clamp(20px, 2.5vw, 40px)",
      "--gap-sm": "clamp(10px, 1.5vw, 20px)",
      "--content-max": "1400px",
      "--content-narrow": "960px",
    },
    motion: {
      "--ease-default": "cubic-bezier(0.23, 1, 0.320, 1)",
      "--ease-out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      "--duration-slow": "0.7s",
      "--duration-default": "0.35s",
      "--duration-fast": "0.15s",
    },
  },

  // ── セクション構成 ──
  // Original header/footer (now managed by ThemeLayout):
  //   Navigation: nav-mega-menu
  //   Announcement: announcement-top-bar
  //   Footer: footer-elegant-columns

  sections: [
    { sectionId: "breadcrumb-simple-path", order: 0},
    { sectionId: "product-gallery-thumbnail-slider", order: 1},
    { sectionId: "product-info-classic-vertical", order: 2},
    { sectionId: "product-description-tabbed", order: 3},
    { sectionId: "features-stats-counter", order: 4},
    { sectionId: "product-reviews-star-rating", order: 5},
    { sectionId: "related-products-card-scroll", order: 6},
    { sectionId: "cta-bold-split", order: 7},
  ],

  // ── フォント ──
  fonts: [
    { family: "Inter", weights: [400, 500, 600, 700, 800] },
    { family: "Courier Prime", weights: [400, 700] },
    { family: "Noto Sans JP", weights: [400, 500, 600] },
  ],
};

// 後方互換: 旧名でもアクセス可能
export const BOLD_TECH_PRODUCT_TEMPLATE = BOLD_TECH_PRODUCT;
