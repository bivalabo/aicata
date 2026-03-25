// ============================================================
// Aicata Design Engine — Page Template: Bold Tech Top
// Gen-3: セクション参照ベースのページテンプレート
// Apple / Nothing / ダークモード系 テック・ガジェット トップページ
// ============================================================

import type { PageTemplate } from "../../types";

export const BOLD_TECH_TOP: PageTemplate = {
  id: "bold-tech-top",
  name: "ボールド・テック トップページ",
  description:
    "Apple、Nothing、その他テック企業を参考にしたダークモード・ガジェットトップページ。大胆なカラーアクセント、深い暗黒背景、未来的なタイポグラフィで最先端イメージを表現。",
  industries: ["tech", "general"],
  tones: ["bold", "modern", "cool"],
  pageType: "landing",

  // ── デザイントークン ──
  designTokens: {
    colors: {
      "--color-bg": "#0A0A0A",
      "--color-text": "#FFFFFF",
      "--color-accent": "#6C5CE7",
      "--color-muted": "#999999",
      "--color-border": "#333333",
      "--color-surface": "#2D2D2D",
    },
    typography: {
      "--font-heading":
        '"Space Grotesk", "Inter", sans-serif',
      "--font-body":
        '"Inter", "Noto Sans JP", sans-serif',
      "--font-accent": '"Space Grotesk", sans-serif',
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
  //   Navigation: nav-minimal-sticky
  //   Footer: footer-minimal-centered

  sections: [
    { sectionId: "hero-video-background", order: 0},
    { sectionId: "features-stats-counter", order: 1},
    { sectionId: "products-masonry-grid", order: 2},
    { sectionId: "story-timeline-vertical", order: 3},
    { sectionId: "testimonial-carousel-multi", order: 4},
    { sectionId: "cta-bold-split", order: 5},
  ],

  // ── フォント ──
  fonts: [
    { family: "Space Grotesk", weights: [400, 500, 600, 700] },
    { family: "Inter", weights: [300, 400, 500, 600, 700] },
    { family: "Noto Sans JP", weights: [300, 400, 500, 600] },
  ],
};

// 後方互換: 旧名でもアクセス可能
export const BOLD_TECH_TOP_TEMPLATE = BOLD_TECH_TOP;
