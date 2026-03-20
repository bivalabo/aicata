// ============================================================
// ADIS Curator — Claude Vision API によるサイトデザイン分析
//
// サイトのスクリーンショットを Claude Vision に送り、
// デザイン要素（カラーパレット、タイポグラフィ、レイアウトパターン、
// 全体評価）を自動抽出する。
// ============================================================

import { anthropic, DEFAULT_MODEL } from "../anthropic";

// ============================================================
// Types
// ============================================================

export interface VisionAnalysisRequest {
  /** 分析対象URL */
  url: string;
  /** スクリーンショットのBase64エンコード画像（data URL or pure base64） */
  screenshotBase64?: string;
  /** スクリーンショットのURL（screenshotBase64と排他） */
  screenshotUrl?: string;
}

export interface VisionAnalysisResult {
  /** 分析成功フラグ */
  success: boolean;
  /** エラーメッセージ（失敗時） */
  error?: string;

  // ── デザイン評価 ──
  overallRating: number;         // 1-5
  typographyScore: number;       // 1-5
  colorScore: number;            // 1-5
  layoutScore: number;           // 1-5
  animationScore: number;        // 1-5（画像からは推定）
  spacingScore: number;          // 1-5

  // ── 抽出データ ──
  colors: ExtractedColor[];
  fonts: ExtractedFont[];
  layoutPattern: string;         // "split", "centered", "grid", "asymmetric", etc.
  designTones: string[];         // ["luxury", "minimal", etc.]
  detectedPatterns: string[];    // ["glassmorphism", "dark-mode", "serif-heading", etc.]

  // ── タグ（Design DNA更新用） ──
  tags: string[];

  // ── AI所見 ──
  summary: string;
  strengths: string[];
  improvements: string[];
}

export interface ExtractedColor {
  hex: string;
  role: "primary" | "secondary" | "accent" | "background" | "text" | "muted";
  confidence: number;
}

export interface ExtractedFont {
  family: string;
  role: "heading" | "body" | "accent";
  weight?: string;
  isSerif: boolean;
}

// ============================================================
// Vision Analysis Prompt
// ============================================================

const VISION_ANALYSIS_PROMPT = `あなたはウェブデザインの専門家です。このウェブサイトのスクリーンショットを詳細に分析し、以下のJSON形式で結果を返してください。

回答は必ず有効なJSONのみで、コードブロックや説明文は含めないでください。

{
  "overallRating": <1-5の整数>,
  "typographyScore": <1-5の整数>,
  "colorScore": <1-5の整数>,
  "layoutScore": <1-5の整数>,
  "animationScore": <1-5の整数（画像から推定）>,
  "spacingScore": <1-5の整数>,
  "colors": [
    { "hex": "#XXXXXX", "role": "primary|secondary|accent|background|text|muted", "confidence": <0-1> }
  ],
  "fonts": [
    { "family": "フォント名", "role": "heading|body|accent", "weight": "400|500|600|700", "isSerif": <true/false> }
  ],
  "layoutPattern": "split|centered|grid|asymmetric|sidebar|fullwidth|card-based|magazine",
  "designTones": ["luxury", "minimal", "modern", "playful", "bold", "elegant", "warm", "cool", "natural", "traditional"],
  "detectedPatterns": ["パターン名1", "パターン名2"],
  "tags": ["タグ1", "タグ2"],
  "summary": "サイトのデザインの全体的な印象を2-3文で。",
  "strengths": ["強み1", "強み2"],
  "improvements": ["改善点1", "改善点2"]
}

## 評価基準
- **5点**: 業界トップクラスのデザイン品質。Awwwards受賞レベル。
- **4点**: プロフェッショナルで洗練されたデザイン。ブランドに合致。
- **3点**: 標準的な品質。改善余地あり。
- **2点**: いくつかのデザイン上の問題あり。
- **1点**: 大幅な改善が必要。

## 検出するパターン例
glassmorphism, neumorphism, dark-mode, parallax, hero-video, micro-interactions,
organic-shapes, bold-typography, serif-heading, mono-accent, gradient-bg,
asymmetric-layout, card-grid, mega-menu, sticky-nav, split-screen,
whitespace-heavy, editorial-layout, duotone, text-overlay

## タグ例
minimalist, luxurious, colorful, monochrome, dark, light, high-contrast,
low-contrast, serif, sans-serif, animated, static, image-heavy, text-focused,
geometric, organic, corporate, creative, e-commerce, editorial`;

// ============================================================
// Public API
// ============================================================

/**
 * Claude Vision APIでサイトのスクリーンショットを分析する
 */
export async function analyzeWithVision(
  request: VisionAnalysisRequest,
): Promise<VisionAnalysisResult> {
  try {
    // 画像ソースの検証
    if (!request.screenshotBase64 && !request.screenshotUrl) {
      return createErrorResult("スクリーンショットが指定されていません");
    }

    // メッセージ構築
    const imageContent = buildImageContent(request);
    const userMessage = `以下のウェブサイト（${request.url}）のスクリーンショットを分析してください。`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            imageContent,
            { type: "text", text: userMessage },
          ],
        },
      ],
      system: VISION_ANALYSIS_PROMPT,
    });

    // レスポンスからテキストを抽出
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return createErrorResult("Vision APIからの応答にテキストが含まれていません");
    }

    // JSONパース
    const parsed = parseVisionResponse(textBlock.text);
    if (!parsed) {
      return createErrorResult("Vision APIの応答をパースできませんでした");
    }

    return {
      success: true,
      ...parsed,
    };
  } catch (error: any) {
    console.error("[CuratorVision] Analysis failed:", error);
    return createErrorResult(
      error?.message || "Vision分析中にエラーが発生しました",
    );
  }
}

// ============================================================
// Internal Helpers
// ============================================================

function buildImageContent(request: VisionAnalysisRequest): any {
  if (request.screenshotBase64) {
    // Base64の場合、data URL prefixがあれば除去
    let base64Data = request.screenshotBase64;
    let mediaType = "image/png";

    if (base64Data.startsWith("data:")) {
      const match = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        mediaType = match[1];
        base64Data = match[2];
      }
    }

    return {
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType,
        data: base64Data,
      },
    };
  }

  if (request.screenshotUrl) {
    return {
      type: "image",
      source: {
        type: "url",
        url: request.screenshotUrl,
      },
    };
  }

  throw new Error("No image source provided");
}

function parseVisionResponse(text: string): Omit<VisionAnalysisResult, "success" | "error"> | null {
  try {
    // JSONブロックを抽出（```json ... ``` でラップされている場合も対応）
    let jsonStr = text.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    const data = JSON.parse(jsonStr);

    // 必須フィールドのバリデーション
    const clamp = (v: any, min: number, max: number) =>
      Math.min(max, Math.max(min, Number(v) || min));

    return {
      overallRating: clamp(data.overallRating, 1, 5),
      typographyScore: clamp(data.typographyScore, 1, 5),
      colorScore: clamp(data.colorScore, 1, 5),
      layoutScore: clamp(data.layoutScore, 1, 5),
      animationScore: clamp(data.animationScore, 1, 5),
      spacingScore: clamp(data.spacingScore, 1, 5),
      colors: Array.isArray(data.colors) ? data.colors.slice(0, 10) : [],
      fonts: Array.isArray(data.fonts) ? data.fonts.slice(0, 5) : [],
      layoutPattern: String(data.layoutPattern || "unknown"),
      designTones: Array.isArray(data.designTones) ? data.designTones : [],
      detectedPatterns: Array.isArray(data.detectedPatterns) ? data.detectedPatterns : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      summary: String(data.summary || ""),
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      improvements: Array.isArray(data.improvements) ? data.improvements : [],
    };
  } catch (e) {
    console.error("[CuratorVision] JSON parse failed:", e);
    return null;
  }
}

function createErrorResult(error: string): VisionAnalysisResult {
  return {
    success: false,
    error,
    overallRating: 0,
    typographyScore: 0,
    colorScore: 0,
    layoutScore: 0,
    animationScore: 0,
    spacingScore: 0,
    colors: [],
    fonts: [],
    layoutPattern: "unknown",
    designTones: [],
    detectedPatterns: [],
    tags: [],
    summary: "",
    strengths: [],
    improvements: [],
  };
}
