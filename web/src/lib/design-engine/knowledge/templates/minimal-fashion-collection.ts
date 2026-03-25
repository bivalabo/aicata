// ============================================================
// Aicata Design Engine — Page Template: Minimal Fashion Collection
// Gen-3: セクション参照ベースのページテンプレート
// COS / Everlane レベルのミニマル・ファッション コレクションページ
// ============================================================

import type { PageTemplate } from "../../types";

export const MINIMAL_FASHION_COLLECTION: PageTemplate = {
  id: "minimal-fashion-collection",
  name: "ミニマル・ファッション コレクションページ",
  description:
    "COS、Everlaneなどのミニマルファッションブランドを参考にしたコレクションページ。カテゴリータブ、フィルタラブルグリッド、シャープなサンセリフ体を活かした設計。",
  industries: ["fashion", "lifestyle"],
  tones: ["minimal", "modern", "cool"],
  pageType: "collection",

  // ── デザイントークン ──
  designTokens: {
    colors: {
      "--color-bg": "#FFFFFF",
      "--color-text": "#1A1A1A",
      "--color-accent": "#000000",
      "--color-muted": "#808080",
      "--color-border": "#E0E0E0",
      "--color-surface": "#F7F7F7",
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
  //   Navigation: nav-minimal-sticky, nav-category-tabs
  //   Footer: footer-minimal-centered

  sections: [
    { sectionId: "breadcrumb-simple-path", order: 0},
    { sectionId: "collection-banner-minimal-text", order: 1},
    { sectionId: "collection-grid-filterable", order: 2},
  ],

  // ── フォント ──
  fonts: [
    { family: "Inter", weights: [300, 400, 500, 600, 700] },
    { family: "Noto Sans JP", weights: [300, 400, 500, 600] },
  ],
};

// 後方互換: 旧名でもアクセス可能
export const MINIMAL_FASHION_COLLECTION_TEMPLATE = MINIMAL_FASHION_COLLECTION;
