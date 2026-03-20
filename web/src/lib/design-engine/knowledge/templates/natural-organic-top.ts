// ============================================================
// Aicata Design Engine — Page Template: Natural Organic Top
// Gen-3: セクション参照ベースのページテンプレート
// Allbirds / Aesop / 農場から食卓へ レベルの自然派・ウェルネス トップページ
// ============================================================

import type { PageTemplate } from "../../types";

export const NATURAL_ORGANIC_TOP: PageTemplate = {
  id: "natural-organic-top",
  name: "ナチュラル・オーガニック トップページ",
  description:
    "Allbirds、Aesop、農場から食卓へなどの自然派・ウェルネスブランドを参考にしたトップページ。温かみのある土系カラー、有機的なフロー、心地よい余白で自然志向を表現。",
  industries: ["food", "health", "lifestyle"],
  tones: ["natural", "warm", "elegant"],
  pageType: "landing",

  // ── デザイントークン ──
  designTokens: {
    colors: {
      "--color-bg": "#FAF7F2",
      "--color-text": "#2D4A3E",
      "--color-accent": "#C67B5C",
      "--color-muted": "#8FA88A",
      "--color-border": "#E4D9CC",
      "--color-surface": "#F5EFE7",
    },
    typography: {
      "--font-heading":
        '"Playfair Display", "Shippori Mincho", serif',
      "--font-body":
        '"Source Sans 3", "Noto Sans JP", sans-serif',
      "--font-accent": '"Playfair Display", serif',
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
      "--ease-default": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      "--ease-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      "--duration-slow": "0.8s",
      "--duration-default": "0.4s",
      "--duration-fast": "0.2s",
    },
  },

  // ── セクション構成 ──
  sections: [
    { sectionId: "nav-minimal-sticky", order: 0 },
    { sectionId: "hero-organic-flowing", order: 1 },
    { sectionId: "story-full-bleed-image", order: 2 },
    { sectionId: "products-card-grid", order: 3 },
    { sectionId: "features-image-cards", order: 4 },
    { sectionId: "testimonial-carousel-multi", order: 5 },
    { sectionId: "cta-newsletter-minimal", order: 6 },
    { sectionId: "footer-elegant-columns", order: 7 },
  ],

  // ── フォント ──
  fonts: [
    { family: "Playfair Display", weights: [400, 500, 600], italic: true },
    { family: "Source Sans 3", weights: [300, 400, 500, 600] },
    { family: "Shippori Mincho", weights: [400, 500] },
    { family: "Noto Sans JP", weights: [200, 300, 400, 500] },
  ],
};

// 後方互換: 旧名でもアクセス可能
export const NATURAL_ORGANIC_TOP_TEMPLATE = NATURAL_ORGANIC_TOP;
