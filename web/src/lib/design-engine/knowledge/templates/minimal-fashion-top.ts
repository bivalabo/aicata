// ============================================================
// Aicata Design Engine — Page Template: Minimal Fashion Top
// Gen-3: セクション参照ベースのページテンプレート
// COS / Everlane / UNIQLO U レベルのミニマル・ファッション トップページ
// ============================================================

import type { PageTemplate } from "../../types";

export const MINIMAL_FASHION_TOP: PageTemplate = {
  id: "minimal-fashion-top",
  name: "ミニマル・ファッション トップページ",
  description:
    "COS、Everlane、UNIQLO Uなどのミニマルファッションブランドを参考にしたトップページ。クリーンなモノクロ配色、洗練された余白、透けるような軽さで現代的な魅力を表現。",
  industries: ["fashion", "lifestyle"],
  tones: ["minimal", "modern", "cool", "elegant"],
  pageType: "landing",

  // ── デザイントークン ──
  designTokens: {
    colors: {
      "--color-bg": "#FAFAFA",
      "--color-text": "#1A1A1A",
      "--color-accent": "#1A1A1A",
      "--color-muted": "#666666",
      "--color-border": "#E5E5E5",
      "--color-surface": "#F5F5F5",
    },
    typography: {
      "--font-heading":
        '"Inter", "DM Sans", "Noto Sans JP", sans-serif',
      "--font-body":
        '"Inter", "Noto Sans JP", sans-serif',
      "--font-accent": '"DM Sans", sans-serif',
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
      "--duration-slow": "0.6s",
      "--duration-default": "0.3s",
      "--duration-fast": "0.15s",
    },
  },

  // ── セクション構成 ──
  sections: [
    { sectionId: "nav-transparent-overlay", order: 0 },
    { sectionId: "hero-minimal-centered", order: 1 },
    { sectionId: "products-horizontal-scroll", order: 2 },
    { sectionId: "story-split-text-image", order: 3 },
    { sectionId: "gallery-lightbox-grid", order: 4 },
    { sectionId: "testimonial-quote-single", order: 5 },
    { sectionId: "cta-newsletter-minimal", order: 6 },
    { sectionId: "footer-minimal-centered", order: 7 },
  ],

  // ── フォント ──
  fonts: [
    { family: "Inter", weights: [300, 400, 500, 600, 700] },
    { family: "DM Sans", weights: [400, 500, 600, 700] },
    { family: "Noto Sans JP", weights: [300, 400, 500, 600] },
  ],
};

// 後方互換: 旧名でもアクセス可能
export const MINIMAL_FASHION_TOP_TEMPLATE = MINIMAL_FASHION_TOP;
