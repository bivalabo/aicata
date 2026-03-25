// ============================================================
// DDP Next — Type Definitions
// Design Composition Engine: 人が評価した部品をAIが組み立てる
// ============================================================

import type { DesignDNAPreferences } from "@/lib/ace-adis/types";
import { HQS_WEIGHTS } from "@/lib/constants";
import type {
  IndustryType,
  PageType,
  DesignTone,
  SectionCategory,
  PageTemplate,
  SectionTemplate,
  DesignTokenSet,
  UrlAnalysisResult,
} from "@/lib/design-engine/types";
import type { EmotionalDNA } from "@/lib/emotional-dna/types";

// ============================================================
// Human Quality Score (HQS)
// ============================================================

/** 人間品質スコア — すべてのコンポーネントに付与 */
export interface HumanQualityScore {
  /** 視覚的洗練度: タイポグラフィ、色の調和、ディテール */
  visual: number; // 1.0 - 5.0
  /** リズムと余白: 前後のセクションとの調和 */
  rhythm: number; // 1.0 - 5.0
  /** コンバージョン貢献度: CTA、購買導線、信頼構築 */
  conversion: number; // 1.0 - 5.0
  /** モバイル品質: タッチターゲット、読みやすさ */
  mobile: number; // 1.0 - 5.0
  /** ブランド表現力: トーンの体現度 */
  brand: number; // 1.0 - 5.0
}

/** HQS加重平均を計算 */
export function computeHQSComposite(hqs: HumanQualityScore): number {
  // Visual と Rhythm を重視（デザイン品質の核心）
  return (
    hqs.visual * HQS_WEIGHTS.visual +
    hqs.rhythm * HQS_WEIGHTS.rhythm +
    hqs.conversion * HQS_WEIGHTS.conversion +
    hqs.mobile * HQS_WEIGHTS.mobile +
    hqs.brand * HQS_WEIGHTS.brand
  );
}

// ============================================================
// Component Metadata (HQS + DNA座標)
// ============================================================

/** セクションテンプレートに付加するメタデータ */
export interface SectionMeta {
  sectionId: string;
  hqs: HumanQualityScore;
  /** このセクションのデザインDNA座標 */
  dna: Partial<DesignDNAPreferences>;
  /** 相性の良いprecedingセクションカテゴリ */
  flowsWellAfter?: SectionCategory[];
  /** 相性の良いfollowingセクションカテゴリ */
  flowsWellBefore?: SectionCategory[];
}

/** ページテンプレートに付加するメタデータ */
export interface TemplateMeta {
  templateId: string;
  /** テンプレート全体のHQS（セクションHQSの加重平均） */
  hqs: HumanQualityScore;
  /** テンプレートのDNA座標 */
  dna: Partial<DesignDNAPreferences>;
}

// ============================================================
// DDP Next Pipeline Types
// ============================================================

/** DDP Next 入力 */
export interface DDPNextInput {
  /** ページタイプ */
  pageType: PageType;
  /** 業種 */
  industry: IndustryType;
  /** ブランド名 */
  brandName?: string;
  /** デザイントーン */
  tones: DesignTone[];
  /** ターゲットオーディエンス */
  targetAudience?: string;
  /** 参考URL */
  referenceUrl?: string;
  /** URL分析結果 */
  urlAnalysis?: UrlAnalysisResult;
  /** ユーザーの自由記述 */
  userInstructions?: string;
  /** ブランドメモリ（既存の学習結果） */
  brandMemory?: {
    brandName?: string;
    industry?: string;
    tones?: string[];
    targetAudience?: string;
    colors?: Record<string, string>;
    fonts?: string[];
  };
  /** ユーザーのDesign DNA（学習済みの場合） */
  userDNA?: DesignDNAPreferences;
  /** 感情の地層（Emotional DNA） — Brand Memoryのヒアリングから導出 */
  emotionalDna?: EmotionalDNA;
  /** ストアID（ThemeLayout取得用） */
  storeId?: string;
}

/** Phase 1: 意図解析結果 */
export interface IntentAnalysis {
  /** 解析されたDesign DNA目標座標 */
  targetDNA: DesignDNAPreferences;
  /** 構造化されたコンテンツ要件 */
  contentRequirements: ContentRequirements;
  /** 解析の信頼度 */
  confidence: number;
}

/** コンテンツ要件 */
export interface ContentRequirements {
  brandName: string;
  tagline?: string;
  industry: IndustryType;
  pageType: PageType;
  tones: DesignTone[];
  targetAudience: string;
  /** ユーザーが入力したフリーテキストの要望 */
  additionalNotes?: string;
  /** 参考URLからの抽出情報 */
  referenceInsights?: {
    colors?: string[];
    fonts?: string[];
    layoutPattern?: string;
    keyFeatures?: string[];
  };
}

/** Phase 2: テンプレート選定結果 */
export interface CompositionPlan {
  /** 選定されたページテンプレート */
  template: PageTemplate;
  /** テンプレートスコア */
  templateScore: number;
  /** 選定理由 */
  reasons: string[];
  /** セクション構成（順序確定済み） */
  sections: ResolvedSection[];
  /** 適用するデザイントークン */
  designTokens: DesignTokenSet;
}

/** 解決済みセクション（テンプレート参照→実体） */
export interface ResolvedSection {
  /** セクションテンプレートの実体 */
  template: SectionTemplate;
  /** 並び順 */
  order: number;
  /** このセクションのHQSスコア */
  hqsComposite: number;
  /** DNA距離（0=完全一致, 1=完全不一致） */
  dnaDistance: number;
}

/** Phase 3: 組立結果 */
export interface AssembledPage {
  /** 完全なHTML文書 */
  html: string;
  /** 結合CSS */
  css: string;
  /** フル HTML (fonts + style + html) */
  fullDocument: string;
  /** プレースホルダー一覧（Phase 4で置換対象） */
  placeholders: string[];
  /** メタ情報 */
  meta: {
    templateId: string;
    sectionCount: number;
    fontLinks: string;
  };
}

/** Phase 4: コンテンツカスタマイズ結果 */
export interface PersonalizedPage {
  /** プレースホルダー置換済みのフルHTML */
  fullDocument: string;
  /** 置換されたプレースホルダー数 */
  replacedCount: number;
  /** AIが生成したコンテンツ */
  generatedContent: Record<string, string>;
}

/** DDP Next 最終結果 */
export interface DDPNextResult {
  /** 完成HTML */
  fullDocument: string;
  /** HTML部分 */
  html: string;
  /** CSS部分 */
  css: string;
  /** 使用テンプレートID */
  templateId: string;
  /** 各フェーズの処理時間 */
  timing: {
    intentAnalysis: number;
    composition: number;
    assembly: number;
    personalization: number;
    total: number;
  };
  /** AIトークン消費量 */
  tokenUsage: {
    intentAnalysis: number;
    personalization: number;
    total: number;
  };
}

/** SSE進行イベント */
export interface DDPNextProgressEvent {
  phase: "intent" | "compose" | "assemble" | "personalize" | "done" | "error";
  message: string;
  progress: number; // 0-100
  data?: Record<string, any>;
}
