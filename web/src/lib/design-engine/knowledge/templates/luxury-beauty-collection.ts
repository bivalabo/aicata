// ============================================================
// Aicata Design Engine — Page Template: Luxury Beauty Collection
// Gen-3: セクション参照ベースのページテンプレート
// Aesop / THREE / SHIRO レベルの高級コスメ コレクションページ
// ============================================================

import type { PageTemplate } from "../../types";

export const LUXURY_BEAUTY_COLLECTION: PageTemplate = {
  id: "luxury-beauty-collection",
  name: "ラグジュアリー・ビューティ コレクションページ",
  description:
    "Aesop、THREE、SHIROなどの高級スキンケアブランドを参考にしたコレクションページ。美しいバナー、フィルタラブルなグリッド、贅沢な余白を活かした設計。",
  industries: ["beauty", "lifestyle"],
  tones: ["luxury", "elegant", "minimal"],
  pageType: "collection",

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
  sections: [
    { sectionId: "nav-elegant-dropdown", order: 0 },
    { sectionId: "breadcrumb-simple-path", order: 1 },
    { sectionId: "collection-banner-hero-image", order: 2 },
    { sectionId: "collection-grid-filterable", order: 3 },
    { sectionId: "cta-newsletter-minimal", order: 4 },
    { sectionId: "footer-elegant-columns", order: 5 },
  ],

  // ── フォント ──
  fonts: [
    { family: "Cormorant Garamond", weights: [300, 400, 500], italic: true },
    { family: "Shippori Mincho", weights: [400, 500] },
    { family: "Noto Sans JP", weights: [200, 300, 400, 500] },
  ],
};

// 後方互換: 旧名でもアクセス可能
export const LUXURY_BEAUTY_COLLECTION_TEMPLATE = LUXURY_BEAUTY_COLLECTION;
