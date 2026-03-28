// ============================================================
// Design Harvester — Core Types
// ============================================================

/** 10D Design DNA — ブロックのデザイン特性を多次元で表現 */
export interface DesignDNA10D {
  minimalism: number;        // 0-1: ミニマリズム
  whitespace: number;        // 0-1: 余白の使い方
  contrast: number;          // 0-1: コントラスト
  animationIntensity: number; // 0-1: アニメーション強度
  serifAffinity: number;     // 0-1: セリフ体傾向
  colorSaturation: number;   // 0-1: 彩度
  layoutComplexity: number;  // 0-1: レイアウト複雑度
  imageWeight: number;       // 0-1: 画像の比重
  asymmetry: number;         // 0-1: 非対称性
  novelty: number;           // 0-1: 新規性
}

/** 5D Human Quality Score — 人間が感じるデザイン品質 */
export interface HumanQualityScore5D {
  typography: number;    // 0-100
  colorHarmony: number;  // 0-100
  spacing: number;       // 0-100
  hierarchy: number;     // 0-100
  polish: number;        // 0-100
}

/** レスポンシブ品質スコア */
export interface RQSBreakdown {
  mobile: number;   // 375px — 0-100
  tablet: number;   // 768px — 0-100
  desktop: number;  // 1280px — 0-100
  wide: number;     // 1920px — 0-100
}

/** 抽出されたブロック（Puppeteerから返るデータ） */
export interface ExtractedBlock {
  sectionIndex: number;
  sectionCategory: string;
  sectionVariant: string;
  html: string;
  css: string;
  js: string;
  screenshot?: string; // base64
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  computedStyles: Record<string, string>;
}

/** AI分類結果 */
export interface BlockClassification {
  sectionCategory: string;
  sectionVariant: string;
  designDna: DesignDNA10D;
  hqs: HumanQualityScore5D;
  tones: string[];
  flowsWellAfter: string[];
  flowsWellBefore: string[];
  pageTypes: string[];
  placeholders: Placeholder[];
  animations: AnimationDef[];
}

/** プレースホルダー定義 */
export interface Placeholder {
  selector: string;
  type: "text" | "image" | "link" | "price" | "button" | "icon";
  label: string;
  defaultValue?: string;
}

/** アニメーション定義 */
export interface AnimationDef {
  selector: string;
  type: string; // fade-in, slide-up, parallax, etc.
  trigger: "scroll" | "load" | "hover";
  duration?: number;
  delay?: number;
}

/** ハーベストジョブの進行状態 */
export interface HarvestProgress {
  sourceId: string;
  jobId: string;
  phase: "crawling" | "extracting" | "classifying" | "validating" | "complete";
  totalPages: number;
  processedPages: number;
  totalBlocks: number;
  approvedBlocks: number;
  currentUrl?: string;
  errors: string[];
}

/** 3-Axis Scoring — 業種タグ除去後のブロックマッチングスコア */
export interface ThreeAxisScore {
  dnaSimilarity: number;  // 0-1: DNA類似度 (weight: 0.45)
  toneMatch: number;      // 0-1: トーンマッチ (weight: 0.30)
  hqsScore: number;       // 0-1: 品質スコア (weight: 0.25)
  composite: number;      // 加重合計
}

export function computeThreeAxisScore(
  dnaSimilarity: number,
  toneMatch: number,
  hqsScore: number,
): ThreeAxisScore {
  const composite = 0.45 * dnaSimilarity + 0.30 * toneMatch + 0.25 * hqsScore;
  return { dnaSimilarity, toneMatch, hqsScore, composite };
}

/** DNA間のコサイン類似度 */
export function computeDNASimilarity(a: DesignDNA10D, b: DesignDNA10D): number {
  const keys: (keyof DesignDNA10D)[] = [
    "minimalism", "whitespace", "contrast", "animationIntensity",
    "serifAffinity", "colorSaturation", "layoutComplexity",
    "imageWeight", "asymmetry", "novelty",
  ];
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (const key of keys) {
    dotProduct += a[key] * b[key];
    normA += a[key] * a[key];
    normB += b[key] * b[key];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/** HQS 5D → 正規化スコア (0-1) */
export function normalizeHQS(hqs: HumanQualityScore5D): number {
  const avg =
    (hqs.typography + hqs.colorHarmony + hqs.spacing + hqs.hierarchy + hqs.polish) / 5;
  return avg / 100;
}
