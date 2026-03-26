// ============================================================
// Aicata DDP — Design Decomposition Pipeline
// Type Definitions
//
// デザインを「考える」と「作る」に分離する革新的パイプライン
// ============================================================

// ── Stage 1 Output: Design Specification ──

/**
 * DesignSpec — AIが「考えた」デザイン設計図
 * HTMLではなくJSON。なぜこのデザインなのかの理由を含む。
 */
export interface DesignSpec {
  /** ページ全体のデザイン方針 */
  designPhilosophy: string;

  /** ユーザーの視線誘導（Eye Flow） */
  eyeFlow: string;

  /** コンバージョン戦略 */
  conversionStrategy: string;

  /** カラーパレット */
  colors: ColorSpec;

  /** タイポグラフィ */
  typography: TypographySpec;

  /** セクション構成（順序付き） */
  sections: SectionSpec[];

  /** レスポンシブ戦略 */
  responsiveStrategy: string;

  /** 全体のトーン&マナー */
  toneDescription: string;
}

export interface ColorSpec {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  /** なぜこの色を選んだか */
  reasoning: string;
}

export interface TypographySpec {
  headingFont: string;
  bodyFont: string;
  /** Google Fonts URL */
  googleFontsUrl: string;
  /** なぜこのフォントか */
  reasoning: string;
}

/**
 * SectionSpec — 各セクションの設計図
 * AIが「このセクションは何のためにあるのか」を明示する
 */
export interface SectionSpec {
  /** セクションID（例: "hero", "features", "testimonials"） */
  id: string;

  /** セクションの役割（日本語） */
  purpose: string;

  /** セクションのカテゴリ */
  category: string;

  /** このセクションの視覚的スタイル */
  visualStyle: string;

  /** コンテンツ指示 — 何を書くべきか */
  contentBrief: ContentBrief;

  /** レイアウトパターン */
  layout: "full-width" | "contained" | "split" | "grid" | "centered";

  /** 背景スタイル */
  backgroundStyle: string;

  /** アニメーション（任意） */
  animation?: string;
}

export interface ContentBrief {
  /** メイン見出し — 実際のテキスト */
  heading?: string;
  /** サブ見出し */
  subheading?: string;
  /** 本文テキスト */
  bodyText?: string;
  /** CTAボタンテキスト */
  ctaText?: string;
  /** CTAリンク先 */
  ctaLink?: string;
  /** 画像の説明（placehold.co用） */
  imageDescriptions?: string[];
  /** リスト項目（特徴一覧、FAQ等） */
  listItems?: Array<{ title: string; description: string }>;
  /** 追加指示 */
  additionalNotes?: string;
  /** 画像戦略: このセクションで使用する画像の方針 */
  imageInstructions?: string;
}

// ── Stage 2 Output: Rendered Section ──

export interface RenderedSection {
  id: string;
  html: string;
  css: string;
  /** 生成成功したか */
  status: "success" | "failed";
  /** エラーメッセージ（失敗時） */
  error?: string;
}

// ── Stage 3 Output: Assembled Page ──

export interface AssembledPageResult {
  html: string;
  css: string;
  fullDocument: string;
  /** 検証結果 */
  validation: ValidationResult;
  /** 使用したDesignSpec */
  spec: DesignSpec;
}

export interface ValidationResult {
  isValid: boolean;
  /** 残存プレースホルダー */
  remainingPlaceholders: string[];
  /** 空セクション */
  emptySections: string[];
  /** CSS変数の不整合 */
  cssInconsistencies: string[];
  /** 修正された問題 */
  autoFixedIssues: string[];
}

// ── Pipeline Configuration ──

export interface DDPConfig {
  /** Stage 1 のモデル（Design Director） */
  specModel: string;
  /** Stage 2 のモデル（Section Artisan） */
  sectionModel: string;
  /** Stage 1 の最大トークン */
  specMaxTokens: number;
  /** Stage 2 の最大トークン（セクションあたり） */
  sectionMaxTokens: number;
  /** Stage 2 の並列実行数 */
  sectionConcurrency: number;
  /** タイムアウト（ms） */
  timeoutMs: number;
}

export const DEFAULT_DDP_CONFIG: DDPConfig = {
  specModel: "claude-sonnet-4-20250514",
  sectionModel: "claude-sonnet-4-20250514",
  specMaxTokens: 8192,
  sectionMaxTokens: 4096,
  sectionConcurrency: 3,
  timeoutMs: 120000,
};

// ── Pipeline Input ──

export interface DDPInput {
  /** ページ種別 */
  pageType: string;
  /** 業種 */
  industry: string;
  /** ブランド名 */
  brandName?: string;
  /** ブランドストーリー */
  brandStory?: string;
  /** デザイントーン */
  tones: string[];
  /** ターゲット顧客 */
  targetAudience?: string;
  /** 参考URL解析結果 */
  urlAnalysis?: {
    url: string;
    title: string;
    headings: string[];
    bodyTexts: string[];
    images: Array<{ src: string; alt: string; context: string }>;
    colors: string[];
    fonts: string[];
  };
  /** Brand Memory から注入されるブランド情報 */
  brandMemory?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    primaryFont: string;
    bodyFont: string;
    voiceTone: string;
    copyKeywords: string[];
    avoidKeywords: string[];
  };
  /** Emotional DNA — オーナーの感情の地層（Brand Memoryの最深層） */
  emotionalDna?: {
    originStory: string;
    coreEmotion: string;
    firstImpression: string;
    afterFeeling: string;
    customerFace: string;
    atmosphere: string[];
    antiAtmosphere: string[];
    derivedTones: string[];
    derivedColorMood: string;
    derivedTypographyFeel: string;
    essencePhrase: string;
  };
  /** ユーザーの自由テキスト指示 */
  userInstructions?: string;
  /** キーワード */
  keywords: string[];
}

// ── Progress Events ──

export type DDPProgressEvent =
  | { stage: "spec"; status: "start" }
  | { stage: "spec"; status: "complete"; spec: DesignSpec }
  | { stage: "section"; status: "start"; sectionId: string; index: number; total: number }
  | { stage: "section"; status: "complete"; sectionId: string; index: number; total: number }
  | { stage: "section"; status: "failed"; sectionId: string; error: string; index: number; total: number }
  | { stage: "assembly"; status: "start" }
  | { stage: "assembly"; status: "complete"; validation: ValidationResult }
  | { stage: "done"; result: AssembledPageResult };
