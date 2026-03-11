/**
 * Aicata 型定義
 */

// ===== AI関連 =====

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  generatedCode?: string;
}

// ===== テンプレート関連 =====

export interface SectionSchema {
  name: string;
  tag?: string;
  class?: string;
  settings: SectionSetting[];
  blocks?: SectionBlock[];
  presets?: SectionPreset[];
}

export interface SectionSetting {
  type: string;
  id: string;
  label: string;
  default?: string | number | boolean;
  info?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface SectionBlock {
  type: string;
  name: string;
  settings: SectionSetting[];
  limit?: number;
}

export interface SectionPreset {
  name: string;
  settings?: Record<string, unknown>;
  blocks?: { type: string; settings?: Record<string, unknown> }[];
}

// ===== ストア解析関連 =====

export interface DesignDNA {
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: string;
  };
  layoutPatterns: {
    headerStyle: string;
    footerStyle: string;
    gridColumns: number;
    spacing: string;
  };
  brandTone: string;
}

// ===== ページ生成関連 =====

export interface GeneratedPage {
  liquidCode: string;
  cssCode?: string;
  jsCode?: string;
  sections: {
    name: string;
    schema: SectionSchema;
    liquidContent: string;
  }[];
}

// ===== 会話テンプレート =====

export interface ConversationStarter {
  id: string;
  category: string;
  title: string;
  description: string;
  prompt: string;
  variables?: Record<string, string>;
}
