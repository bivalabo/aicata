// ============================================================
// ACE Layer 1: Layout Atoms
// スペーサー・ディバイダー・コンテナ
// ============================================================

import type { DesignAtom } from "../types";

export const ATOM_CONTAINER: DesignAtom = {
  id: "container",
  category: "layout",
  tag: "div",
  name: "Container",
  description: "最大幅制限付きの中央寄せコンテナ。",
  html: `<div class="atom-container">{{CONTENT}}</div>`,
  css: `.atom-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
@media (min-width: 768px) {
  .atom-container { padding: 0 40px; }
}
@media (min-width: 1024px) {
  .atom-container { padding: 0 60px; }
}`,
  variants: [
    { id: "narrow", label: "Narrow (800px)", overrideCss: `.atom-container--narrow { max-width: 800px; }` },
    { id: "wide", label: "Wide (1400px)", overrideCss: `.atom-container--wide { max-width: 1400px; }` },
    { id: "full", label: "Full width", overrideCss: `.atom-container--full { max-width: none; padding: 0; }` },
  ],
  tokens: [],
  a11y: { focusable: false },
};

export const ATOM_SPACER: DesignAtom = {
  id: "spacer",
  category: "layout",
  tag: "div",
  name: "Spacer",
  description: "セクション間の余白。レスポンシブ。",
  html: `<div class="atom-spacer" aria-hidden="true"></div>`,
  css: `.atom-spacer {
  height: 40px;
}
@media (min-width: 768px) {
  .atom-spacer { height: 60px; }
}
@media (min-width: 1024px) {
  .atom-spacer { height: 80px; }
}`,
  variants: [
    { id: "sm", label: "Small", overrideCss: `.atom-spacer--sm { height: 20px; } @media (min-width: 768px) { .atom-spacer--sm { height: 30px; } } @media (min-width: 1024px) { .atom-spacer--sm { height: 40px; } }` },
    { id: "lg", label: "Large", overrideCss: `.atom-spacer--lg { height: 60px; } @media (min-width: 768px) { .atom-spacer--lg { height: 100px; } } @media (min-width: 1024px) { .atom-spacer--lg { height: 140px; } }` },
  ],
  tokens: [],
  a11y: { focusable: false },
};

export const ATOM_DIVIDER: DesignAtom = {
  id: "divider",
  category: "layout",
  tag: "hr",
  name: "Divider",
  description: "水平区切り線。",
  html: `<hr class="atom-divider" />`,
  css: `.atom-divider {
  border: none;
  border-top: 1px solid var(--color-border, #e5e5e5);
  margin: 0;
  width: 100%;
}`,
  variants: [
    { id: "thick", label: "Thick", overrideCss: `.atom-divider--thick { border-top-width: 2px; }` },
    { id: "accent", label: "Accent color", overrideCss: `.atom-divider--accent { border-top-color: var(--color-accent); }` },
    { id: "short", label: "Short (centered)", overrideCss: `.atom-divider--short { width: 60px; margin: 0 auto; }` },
    { id: "dashed", label: "Dashed", overrideCss: `.atom-divider--dashed { border-top-style: dashed; }` },
  ],
  tokens: ["--color-border", "--color-accent"],
  a11y: { role: "separator", focusable: false },
};

export const ATOM_GRID: DesignAtom = {
  id: "grid",
  category: "layout",
  tag: "div",
  name: "Grid",
  description: "レスポンシブグリッドレイアウト。",
  html: `<div class="atom-grid">{{CONTENT}}</div>`,
  css: `.atom-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;
}
@media (min-width: 640px) {
  .atom-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
}
@media (min-width: 1024px) {
  .atom-grid { grid-template-columns: repeat(3, 1fr); gap: 32px; }
}`,
  variants: [
    { id: "2-col", label: "2 columns max", overrideCss: `@media (min-width: 640px) { .atom-grid--2-col { grid-template-columns: repeat(2, 1fr); } } @media (min-width: 1024px) { .atom-grid--2-col { grid-template-columns: repeat(2, 1fr); } }` },
    { id: "4-col", label: "4 columns", overrideCss: `@media (min-width: 1024px) { .atom-grid--4-col { grid-template-columns: repeat(4, 1fr); } }` },
    { id: "masonry", label: "Masonry-like", overrideCss: `.atom-grid--masonry { grid-template-rows: masonry; }` },
  ],
  tokens: [],
  a11y: { focusable: false },
};

export const ATOM_FLEX_ROW: DesignAtom = {
  id: "flex-row",
  category: "layout",
  tag: "div",
  name: "Flex Row",
  description: "横並びフレックスレイアウト。ナビ・ボタン群に。",
  html: `<div class="atom-flex-row">{{CONTENT}}</div>`,
  css: `.atom-flex-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}`,
  variants: [
    { id: "between", label: "Space between", overrideCss: `.atom-flex-row--between { justify-content: space-between; }` },
    { id: "center", label: "Centered", overrideCss: `.atom-flex-row--center { justify-content: center; }` },
    { id: "end", label: "End aligned", overrideCss: `.atom-flex-row--end { justify-content: flex-end; }` },
    { id: "gap-sm", label: "Small gap", overrideCss: `.atom-flex-row--gap-sm { gap: 8px; }` },
    { id: "gap-lg", label: "Large gap", overrideCss: `.atom-flex-row--gap-lg { gap: 32px; }` },
  ],
  tokens: [],
  a11y: { focusable: false },
};

export const layoutAtoms: DesignAtom[] = [
  ATOM_CONTAINER,
  ATOM_SPACER,
  ATOM_DIVIDER,
  ATOM_GRID,
  ATOM_FLEX_ROW,
];
