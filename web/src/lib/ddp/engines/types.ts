// ============================================================
// DDP Engine Architecture — Domain Expert Interface
//
// DDPの「知能」を差し替え可能にする。
// 今はECエンジンだが、将来は:
//   - コーポレートサイトエンジン
//   - ポートフォリオエンジン
//   - メディア/ブログエンジン
//   - SaaSプロダクトエンジン
// に切り替えられる。
// ============================================================

/**
 * DomainEngine — ドメイン特化の知識エンジン
 *
 * DDPの各ステージに注入される「専門知識」を提供する。
 * エンジンを差し替えるだけで、DDPが異なるドメインに対応する。
 */
export interface DomainEngine {
  /** エンジン識別子 */
  id: string;

  /** エンジン名（表示用） */
  name: string;

  /** 対応ドメイン */
  domain: "ecommerce" | "corporate" | "portfolio" | "media" | "saas";

  /**
   * Stage 1: Design Director に注入する専門知識
   * デザイン方針を決める際に、ドメイン固有の原則を提供する
   */
  getDirectorKnowledge(context: EngineContext): DirectorKnowledge;

  /**
   * Stage 2: Section Artisan に注入するセクション別の専門知識
   * 各セクションを生成する際に、ドメイン固有のベストプラクティスを提供
   */
  getSectionKnowledge(sectionCategory: string, context: EngineContext): SectionKnowledge;

  /**
   * Stage 4: Quality Reviewer に注入する評価基準
   * 完成品をレビューする際に、ドメイン固有の品質基準を提供
   */
  getReviewCriteria(context: EngineContext): ReviewCriteria;

  /**
   * 推奨セクション構成
   * ページタイプに最適なセクション構成を返す
   */
  getRecommendedSections(pageType: string, context: EngineContext): RecommendedSection[];
}

/** エンジンに渡されるコンテキスト */
export interface EngineContext {
  pageType: string;
  industry: string;
  tones: string[];
  targetAudience?: string;
  brandName?: string;
  /** 国/地域（将来のローカライゼーション対応） */
  locale: string;
}

/** Design Director への専門知識 */
export interface DirectorKnowledge {
  /** コアプリンシプル（最重要の設計原則） */
  corePrinciples: string;
  /** 業界固有のデザインガイダンス */
  industryGuidance: string;
  /** コンバージョン/目標達成の戦略知識 */
  conversionStrategy: string;
  /** 心理学的インサイト */
  psychologyInsights: string;
  /** 絶対にやってはいけないこと */
  antiPatterns: string;
}

/** Section Artisan への専門知識 */
export interface SectionKnowledge {
  /** このセクションの成功法則 */
  bestPractices: string;
  /** コンテンツの書き方指針 */
  copywritingGuidance: string;
  /** レイアウトの推奨パターン */
  layoutRecommendation: string;
  /** よくある失敗とその回避法 */
  commonMistakes: string;
}

/** Quality Reviewer への評価基準 */
export interface ReviewCriteria {
  /** ドメイン固有の評価ポイント */
  domainSpecificChecks: string;
  /** 必須要素のチェックリスト */
  requiredElements: string[];
  /** 品質の閾値 */
  qualityThresholds: Record<string, number>;
}

/** 推奨セクション定義 */
export interface RecommendedSection {
  id: string;
  category: string;
  purpose: string;
  priority: "required" | "recommended" | "optional";
  /** このセクションが売上/目標に貢献する理由 */
  businessReason: string;
}
