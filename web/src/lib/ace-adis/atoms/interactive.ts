// ============================================================
// ACE Layer 1: Interactive Atoms
// ボタン・リンク・入力フィールド
// ============================================================

import type { DesignAtom } from "../types";

export const ATOM_BUTTON_PRIMARY: DesignAtom = {
  id: "button-primary",
  category: "interactive",
  tag: "button",
  name: "Primary Button",
  description: "主要CTAボタン。背景色付き。",
  html: `<button class="atom-button-primary" type="button">{{TEXT}}</button>`,
  css: `.atom-button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-body, sans-serif);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-bg);
  background-color: var(--color-text);
  border: none;
  padding: 14px 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.atom-button-primary:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}
.atom-button-primary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.atom-button-primary:active {
  transform: translateY(0);
}`,
  variants: [
    { id: "rounded", label: "Rounded", overrideCss: `.atom-button-primary--rounded { border-radius: 9999px; }` },
    { id: "sm", label: "Small", overrideCss: `.atom-button-primary--sm { padding: 10px 20px; font-size: 0.8125rem; }` },
    { id: "lg", label: "Large", overrideCss: `.atom-button-primary--lg { padding: 18px 40px; font-size: 1rem; }` },
    { id: "accent", label: "Accent color", overrideCss: `.atom-button-primary--accent { background-color: var(--color-accent); color: #fff; }` },
  ],
  tokens: ["--font-body", "--color-bg", "--color-text", "--color-accent"],
  a11y: { role: "button", focusable: true, minContrast: 4.5 },
};

export const ATOM_BUTTON_SECONDARY: DesignAtom = {
  id: "button-secondary",
  category: "interactive",
  tag: "button",
  name: "Secondary Button",
  description: "ボーダーのみの副ボタン。",
  html: `<button class="atom-button-secondary" type="button">{{TEXT}}</button>`,
  css: `.atom-button-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-body, sans-serif);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text);
  background: transparent;
  border: 1px solid var(--color-text);
  padding: 13px 31px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.atom-button-secondary:hover {
  background-color: var(--color-text);
  color: var(--color-bg);
}
.atom-button-secondary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}`,
  variants: [
    { id: "rounded", label: "Rounded", overrideCss: `.atom-button-secondary--rounded { border-radius: 9999px; }` },
    { id: "sm", label: "Small", overrideCss: `.atom-button-secondary--sm { padding: 9px 19px; font-size: 0.8125rem; }` },
  ],
  tokens: ["--font-body", "--color-text", "--color-bg", "--color-accent"],
  a11y: { role: "button", focusable: true, minContrast: 4.5 },
};

export const ATOM_TEXT_LINK: DesignAtom = {
  id: "text-link",
  category: "interactive",
  tag: "a",
  name: "Text Link",
  description: "テキストリンク。下線付きホバー効果。",
  html: `<a href="{{URL}}" class="atom-text-link">{{TEXT}}</a>`,
  css: `.atom-text-link {
  font-family: var(--font-body, sans-serif);
  font-size: inherit;
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  border-bottom: 1px solid var(--color-text);
  padding-bottom: 2px;
  transition: all 0.3s ease;
  cursor: pointer;
}
.atom-text-link:hover {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}
.atom-text-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}`,
  variants: [
    { id: "underline-hover", label: "Underline on hover only", overrideCss: `.atom-text-link--underline-hover { border-bottom-color: transparent; } .atom-text-link--underline-hover:hover { border-bottom-color: var(--color-accent); }` },
    { id: "arrow", label: "With arrow →", overrideCss: `.atom-text-link--arrow::after { content: ' →'; transition: margin-left 0.2s; } .atom-text-link--arrow:hover::after { margin-left: 4px; }` },
  ],
  tokens: ["--font-body", "--color-text", "--color-accent"],
  a11y: { role: "link", focusable: true, minContrast: 4.5 },
};

export const ATOM_INPUT_TEXT: DesignAtom = {
  id: "input-text",
  category: "interactive",
  tag: "input",
  name: "Text Input",
  description: "テキスト入力フィールド。フォーム・検索に使用。",
  html: `<div class="atom-input-text">
  <label class="atom-input-text__label" for="{{INPUT_ID}}">{{LABEL}}</label>
  <input type="text" id="{{INPUT_ID}}" class="atom-input-text__field" placeholder="{{PLACEHOLDER}}" />
</div>`,
  css: `.atom-input-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}
.atom-input-text__label {
  font-family: var(--font-body, sans-serif);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text);
}
.atom-input-text__field {
  font-family: var(--font-body, sans-serif);
  font-size: 0.9375rem;
  color: var(--color-text);
  background: transparent;
  border: 1px solid var(--color-border, #ddd);
  padding: 12px 16px;
  transition: border-color 0.2s ease;
  width: 100%;
}
.atom-input-text__field:focus {
  outline: none;
  border-color: var(--color-text);
}
.atom-input-text__field::placeholder {
  color: var(--color-muted);
}`,
  variants: [
    { id: "rounded", label: "Rounded", overrideCss: `.atom-input-text--rounded .atom-input-text__field { border-radius: 8px; }` },
    { id: "minimal", label: "Bottom border only", overrideCss: `.atom-input-text--minimal .atom-input-text__field { border: none; border-bottom: 1px solid var(--color-border, #ddd); padding-left: 0; }` },
  ],
  tokens: ["--font-body", "--color-text", "--color-border", "--color-muted"],
  a11y: { role: "textbox", focusable: true, minContrast: 4.5 },
};

export const ATOM_SELECT: DesignAtom = {
  id: "select",
  category: "interactive",
  tag: "select",
  name: "Select Dropdown",
  description: "ドロップダウン選択。バリアント選択等に使用。",
  html: `<div class="atom-select">
  <label class="atom-select__label" for="{{SELECT_ID}}">{{LABEL}}</label>
  <select id="{{SELECT_ID}}" class="atom-select__field">
    {{OPTIONS}}
  </select>
</div>`,
  css: `.atom-select {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}
.atom-select__label {
  font-family: var(--font-body, sans-serif);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text);
}
.atom-select__field {
  font-family: var(--font-body, sans-serif);
  font-size: 0.9375rem;
  color: var(--color-text);
  background: transparent;
  border: 1px solid var(--color-border, #ddd);
  padding: 12px 16px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  cursor: pointer;
}
.atom-select__field:focus {
  outline: none;
  border-color: var(--color-text);
}`,
  variants: [
    { id: "rounded", label: "Rounded", overrideCss: `.atom-select--rounded .atom-select__field { border-radius: 8px; }` },
  ],
  tokens: ["--font-body", "--color-text", "--color-border"],
  a11y: { role: "listbox", focusable: true, minContrast: 4.5 },
};

export const ATOM_QUANTITY_SELECTOR: DesignAtom = {
  id: "quantity-selector",
  category: "interactive",
  tag: "div",
  name: "Quantity Selector",
  description: "数量増減セレクター。カート・商品ページ用。",
  html: `<div class="atom-quantity" role="group" aria-label="数量">
  <button class="atom-quantity__btn" type="button" aria-label="数量を減らす">−</button>
  <input type="number" class="atom-quantity__input" value="1" min="1" aria-label="数量" />
  <button class="atom-quantity__btn" type="button" aria-label="数量を増やす">+</button>
</div>`,
  css: `.atom-quantity {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-border, #ddd);
}
.atom-quantity__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--color-text);
  transition: background 0.2s;
}
.atom-quantity__btn:hover {
  background: var(--color-bg-secondary, #f5f5f5);
}
.atom-quantity__input {
  width: 48px;
  height: 40px;
  text-align: center;
  border: none;
  border-left: 1px solid var(--color-border, #ddd);
  border-right: 1px solid var(--color-border, #ddd);
  font-size: 0.9375rem;
  color: var(--color-text);
  background: transparent;
  -moz-appearance: textfield;
}
.atom-quantity__input::-webkit-inner-spin-button,
.atom-quantity__input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}`,
  variants: [
    { id: "rounded", label: "Rounded", overrideCss: `.atom-quantity--rounded { border-radius: 8px; overflow: hidden; }` },
  ],
  tokens: ["--color-border", "--color-text", "--color-bg-secondary"],
  a11y: { role: "group", ariaLabel: "数量セレクター", focusable: true },
};

export const interactiveAtoms: DesignAtom[] = [
  ATOM_BUTTON_PRIMARY,
  ATOM_BUTTON_SECONDARY,
  ATOM_TEXT_LINK,
  ATOM_INPUT_TEXT,
  ATOM_SELECT,
  ATOM_QUANTITY_SELECTOR,
];
