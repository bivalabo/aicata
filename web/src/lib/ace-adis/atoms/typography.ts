// ============================================================
// ACE Layer 1: Typography Atoms
// 見出し・本文・ラベル・キャプション
// ============================================================

import type { DesignAtom } from "../types";

export const ATOM_HEADING_SERIF_DISPLAY: DesignAtom = {
  id: "heading-serif-display",
  category: "typography",
  tag: "h1",
  name: "Serif Display Heading",
  description: "高級感のあるセリフ体の大見出し。ラグジュアリー・エレガント系に最適。",
  html: `<h1 class="atom-heading-serif-display">{{TEXT}}</h1>`,
  css: `.atom-heading-serif-display {
  font-family: var(--font-heading, 'Playfair Display', serif);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0;
}`,
  variants: [
    { id: "sm", label: "Small", overrideCss: `.atom-heading-serif-display--sm { font-size: clamp(1.5rem, 3vw, 2.25rem); }` },
    { id: "lg", label: "Large", overrideCss: `.atom-heading-serif-display--lg { font-size: clamp(2.5rem, 7vw, 4.5rem); }` },
    { id: "light", label: "Light weight", overrideCss: `.atom-heading-serif-display--light { font-weight: 300; }` },
  ],
  tokens: ["--font-heading", "--color-text"],
  a11y: { role: "heading", focusable: false, minContrast: 4.5 },
};

export const ATOM_HEADING_SANS: DesignAtom = {
  id: "heading-sans",
  category: "typography",
  tag: "h2",
  name: "Sans-serif Heading",
  description: "モダン・ミニマルなサンセリフ見出し。テック・ファッション系に最適。",
  html: `<h2 class="atom-heading-sans">{{TEXT}}</h2>`,
  css: `.atom-heading-sans {
  font-family: var(--font-heading, 'Inter', sans-serif);
  font-size: clamp(1.5rem, 3.5vw, 2.5rem);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--color-text);
  margin: 0;
}`,
  variants: [
    { id: "sm", label: "Small", overrideCss: `.atom-heading-sans--sm { font-size: clamp(1.25rem, 2.5vw, 1.75rem); }` },
    { id: "lg", label: "Large", overrideCss: `.atom-heading-sans--lg { font-size: clamp(2rem, 5vw, 3.5rem); }` },
    { id: "bold", label: "Bold", overrideCss: `.atom-heading-sans--bold { font-weight: 800; }` },
  ],
  tokens: ["--font-heading", "--color-text"],
  a11y: { role: "heading", focusable: false, minContrast: 4.5 },
};

export const ATOM_SUBHEADING: DesignAtom = {
  id: "subheading",
  category: "typography",
  tag: "h3",
  name: "Subheading",
  description: "セクション内サブ見出し。汎用。",
  html: `<h3 class="atom-subheading">{{TEXT}}</h3>`,
  css: `.atom-subheading {
  font-family: var(--font-heading, sans-serif);
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  font-weight: 500;
  line-height: 1.3;
  color: var(--color-text);
  margin: 0;
}`,
  variants: [
    { id: "muted", label: "Muted", overrideCss: `.atom-subheading--muted { color: var(--color-muted); }` },
  ],
  tokens: ["--font-heading", "--color-text", "--color-muted"],
  a11y: { role: "heading", focusable: false, minContrast: 4.5 },
};

export const ATOM_BODY_TEXT: DesignAtom = {
  id: "body-text",
  category: "typography",
  tag: "p",
  name: "Body Text",
  description: "本文テキスト。読みやすさ重視の行間・サイズ。",
  html: `<p class="atom-body-text">{{TEXT}}</p>`,
  css: `.atom-body-text {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: clamp(0.9375rem, 1.2vw, 1.0625rem);
  font-weight: 400;
  line-height: 1.7;
  color: var(--color-text);
  margin: 0;
  max-width: 65ch;
}`,
  variants: [
    { id: "sm", label: "Small", overrideCss: `.atom-body-text--sm { font-size: 0.875rem; line-height: 1.6; }` },
    { id: "lg", label: "Large", overrideCss: `.atom-body-text--lg { font-size: 1.125rem; line-height: 1.75; }` },
    { id: "light", label: "Light", overrideCss: `.atom-body-text--light { font-weight: 300; }` },
  ],
  tokens: ["--font-body", "--color-text"],
  a11y: { focusable: false, minContrast: 4.5 },
};

export const ATOM_LABEL: DesignAtom = {
  id: "label",
  category: "typography",
  tag: "span",
  name: "Label",
  description: "小さなラベルテキスト。アッパーケース・レタースペーシング。",
  html: `<span class="atom-label">{{TEXT}}</span>`,
  css: `.atom-label {
  font-family: var(--font-body, sans-serif);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
  display: inline-block;
}`,
  variants: [
    { id: "accent", label: "Accent color", overrideCss: `.atom-label--accent { color: var(--color-accent); }` },
    { id: "lg", label: "Large", overrideCss: `.atom-label--lg { font-size: 0.875rem; }` },
  ],
  tokens: ["--font-body", "--color-muted", "--color-accent"],
  a11y: { focusable: false, minContrast: 3.0 },
};

export const ATOM_CAPTION: DesignAtom = {
  id: "caption",
  category: "typography",
  tag: "span",
  name: "Caption",
  description: "画像下のキャプション、補足テキスト。",
  html: `<span class="atom-caption">{{TEXT}}</span>`,
  css: `.atom-caption {
  font-family: var(--font-body, sans-serif);
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-muted);
  display: inline-block;
}`,
  variants: [
    { id: "italic", label: "Italic", overrideCss: `.atom-caption--italic { font-style: italic; }` },
  ],
  tokens: ["--font-body", "--color-muted"],
  a11y: { focusable: false, minContrast: 3.0 },
};

export const ATOM_PRICE: DesignAtom = {
  id: "price-text",
  category: "typography",
  tag: "span",
  name: "Price Text",
  description: "価格表示テキスト。EC必須。",
  html: `<span class="atom-price">{{TEXT}}</span>`,
  css: `.atom-price {
  font-family: var(--font-body, sans-serif);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  display: inline-block;
}`,
  variants: [
    { id: "sale", label: "Sale price", overrideCss: `.atom-price--sale { color: var(--color-accent); }` },
    { id: "original", label: "Original (strikethrough)", overrideCss: `.atom-price--original { text-decoration: line-through; color: var(--color-muted); font-weight: 400; }` },
    { id: "lg", label: "Large", overrideCss: `.atom-price--lg { font-size: 1.75rem; }` },
  ],
  tokens: ["--font-body", "--color-text", "--color-accent", "--color-muted"],
  a11y: { focusable: false, minContrast: 4.5 },
};

export const typographyAtoms: DesignAtom[] = [
  ATOM_HEADING_SERIF_DISPLAY,
  ATOM_HEADING_SANS,
  ATOM_SUBHEADING,
  ATOM_BODY_TEXT,
  ATOM_LABEL,
  ATOM_CAPTION,
  ATOM_PRICE,
];
