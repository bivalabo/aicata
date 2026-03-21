// ============================================================
// ACE Layer 1: Decorative Atoms
// バッジ・オーバーレイ・グラデーション・装飾パターン
// ============================================================

import type { DesignAtom } from "../types";

export const ATOM_BADGE: DesignAtom = {
  id: "badge",
  category: "decorative",
  tag: "span",
  name: "Badge",
  description: "小さなバッジ・タグ。SALE, NEW, 在庫切れ等の表示に。",
  html: `<span class="atom-badge">{{TEXT}}</span>`,
  css: `.atom-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body, sans-serif);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #fff;
  background-color: var(--color-text);
  padding: 4px 10px;
  line-height: 1;
  white-space: nowrap;
}`,
  variants: [
    { id: "sale", label: "Sale (red)", overrideCss: `.atom-badge--sale { background-color: #c0392b; }` },
    { id: "new", label: "New (accent)", overrideCss: `.atom-badge--new { background-color: var(--color-accent); }` },
    { id: "soldout", label: "Sold out (gray)", overrideCss: `.atom-badge--soldout { background-color: #999; }` },
    { id: "rounded", label: "Rounded", overrideCss: `.atom-badge--rounded { border-radius: 9999px; padding: 4px 12px; }` },
    { id: "outline", label: "Outline", overrideCss: `.atom-badge--outline { background: transparent; color: var(--color-text); border: 1px solid var(--color-text); }` },
  ],
  tokens: ["--font-body", "--color-text", "--color-accent"],
  a11y: { focusable: false },
};

export const ATOM_OVERLAY: DesignAtom = {
  id: "overlay",
  category: "decorative",
  tag: "div",
  name: "Overlay",
  description: "画像上のグラデーションオーバーレイ。テキスト視認性向上。",
  html: `<div class="atom-overlay"></div>`,
  css: `.atom-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 30%, rgba(0, 0, 0, 0.5) 100%);
  pointer-events: none;
  z-index: 1;
}`,
  variants: [
    { id: "dark", label: "Full dark", overrideCss: `.atom-overlay--dark { background: rgba(0, 0, 0, 0.4); }` },
    { id: "light", label: "Light", overrideCss: `.atom-overlay--light { background: rgba(255, 255, 255, 0.3); }` },
    { id: "gradient-top", label: "Top gradient", overrideCss: `.atom-overlay--gradient-top { background: linear-gradient(to top, transparent 30%, rgba(0, 0, 0, 0.5) 100%); }` },
    { id: "brand", label: "Brand color", overrideCss: `.atom-overlay--brand { background: linear-gradient(to bottom, transparent, var(--color-accent)); opacity: 0.3; }` },
  ],
  tokens: ["--color-accent"],
  a11y: { focusable: false },
};

export const ATOM_STAR_RATING: DesignAtom = {
  id: "star-rating",
  category: "decorative",
  tag: "div",
  name: "Star Rating",
  description: "★評価表示。レビュー・商品評価に。",
  html: `<div class="atom-star-rating" role="img" aria-label="{{RATING}}つ星">
  <span class="atom-star-rating__stars" style="--rating: {{RATING}}">★★★★★</span>
  <span class="atom-star-rating__count">({{COUNT}})</span>
</div>`,
  css: `.atom-star-rating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.atom-star-rating__stars {
  font-size: 14px;
  letter-spacing: 2px;
  background: linear-gradient(90deg, var(--color-accent, #f5a623) calc(var(--rating, 0) / 5 * 100%), var(--color-muted, #ddd) calc(var(--rating, 0) / 5 * 100%));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.atom-star-rating__count {
  font-family: var(--font-body, sans-serif);
  font-size: 0.8125rem;
  color: var(--color-muted);
}`,
  variants: [
    { id: "lg", label: "Large", overrideCss: `.atom-star-rating--lg .atom-star-rating__stars { font-size: 20px; }` },
    { id: "no-count", label: "Stars only", overrideCss: `.atom-star-rating--no-count .atom-star-rating__count { display: none; }` },
  ],
  tokens: ["--font-body", "--color-accent", "--color-muted"],
  a11y: { role: "img", ariaLabel: "Star rating", focusable: false },
};

export const ATOM_SKELETON: DesignAtom = {
  id: "skeleton",
  category: "decorative",
  tag: "div",
  name: "Skeleton Loader",
  description: "コンテンツ読み込み中のプレースホルダー。",
  html: `<div class="atom-skeleton" aria-hidden="true"></div>`,
  css: `.atom-skeleton {
  background: linear-gradient(90deg, var(--color-bg-secondary, #f0f0f0) 25%, #e0e0e0 50%, var(--color-bg-secondary, #f0f0f0) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
  height: 20px;
  width: 100%;
}
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}`,
  variants: [
    { id: "circle", label: "Circle", overrideCss: `.atom-skeleton--circle { width: 48px; height: 48px; border-radius: 50%; }` },
    { id: "image", label: "Image placeholder", overrideCss: `.atom-skeleton--image { height: 200px; }` },
    { id: "text-block", label: "Text block", overrideCss: `.atom-skeleton--text-block { height: 12px; margin-bottom: 8px; } .atom-skeleton--text-block:last-child { width: 60%; }` },
  ],
  tokens: ["--color-bg-secondary"],
  a11y: { focusable: false },
};

export const decorativeAtoms: DesignAtom[] = [
  ATOM_BADGE,
  ATOM_OVERLAY,
  ATOM_STAR_RATING,
  ATOM_SKELETON,
];
