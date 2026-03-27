// ============================================================
// DDP Next — ACE-ADIS Bridge
// ACE-ADISコンポーネントをDDP Nextパイプラインに接続する
//
// 1. Curator Vision → urlAnalysis 拡張（初回分析のみ）
// 2. Design DNA Engine → userDNA ロード（Phase 1-2）
// 3. Media Strategy → Phase 3 画像最適化
// 4. Evolution Engine → HQS フィードバック（別 API 経由）
// ============================================================

import type { DesignDNAPreferences } from "@/lib/ace-adis/types";
import type { VisionAnalysisResult } from "@/lib/ace-adis/curator-vision";
import type { UrlAnalysisResult } from "@/lib/design-engine/types";
import type { DDPNextInput } from "./types";
import { classifyImages } from "./media-strategy";
import type { MediaStrategy } from "./media-strategy";
import { prisma } from "@/lib/db";

// ============================================================
// 1. Curator Vision → URL Analysis 拡張
// ============================================================

/**
 * Curator Vision の分析結果を DDPNextInput の urlAnalysis 形式に変換
 *
 * Vision分析にはスクリーンショットが必要（初回のみ使用）。
 * 以降は学習済みDNAで十分なので、API呼び出しは不要。
 */
export function enrichUrlAnalysisWithVision(
  existingAnalysis: Partial<UrlAnalysisResult> | undefined,
  visionResult: VisionAnalysisResult,
): UrlAnalysisResult {
  // Vision結果を UrlAnalysisResult 形式にマージ
  const colors = visionResult.colors?.map((c) => c.hex) ?? [];
  const fonts = visionResult.fonts?.map((f) => f.family) ?? [];
  const tones = visionResult.designTones ?? [];

  return {
    url: (existingAnalysis as any)?.url ?? "",
    title: (existingAnalysis as any)?.title ?? "",
    description: (existingAnalysis as any)?.description ?? "",
    colors: colors.length > 0 ? colors : (existingAnalysis?.colors ?? []),
    fonts: fonts.length > 0 ? fonts : (existingAnalysis?.fonts ?? []),
    tones: tones.length > 0 ? tones : ((existingAnalysis as any)?.tones ?? []),
    sections: (existingAnalysis as any)?.sections ?? [],
    texts: (existingAnalysis as any)?.texts ?? [],
    images: (existingAnalysis as any)?.images ?? [],
    // Vision固有の拡張情報
    layoutPattern: visionResult.layoutPattern,
    detectedPatterns: visionResult.detectedPatterns,
    overallRating: visionResult.overallRating,
    visionTags: visionResult.tags,
  } as UrlAnalysisResult & {
    layoutPattern?: string;
    detectedPatterns?: string[];
    overallRating?: number;
    visionTags?: string[];
  };
}

// ============================================================
// 2. Design DNA Engine → userDNA ロード
// ============================================================

/**
 * 最新の Design DNA スナップショットを DB から取得
 * DDPNextInput.userDNA に設定して Phase 1-2 に反映する
 */
export async function loadLatestUserDNA(): Promise<{
  dna: DesignDNAPreferences | null;
  confidence: number;
  totalRatings: number;
}> {
  try {
    const snapshot = await (prisma as any).designDNASnapshot.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!snapshot) {
      return { dna: null, confidence: 0, totalRatings: 0 };
    }

    const dna: DesignDNAPreferences = {
      minimalism: snapshot.minimalism,
      whitespace: snapshot.whitespace,
      contrast: snapshot.contrast,
      animationIntensity: snapshot.animationIntensity,
      serifAffinity: snapshot.serifAffinity,
      colorSaturation: snapshot.colorSaturation,
      layoutComplexity: snapshot.layoutComplexity,
      imageWeight: snapshot.imageWeight,
      asymmetry: snapshot.asymmetry,
      novelty: snapshot.novelty,
    };

    return {
      dna,
      confidence: snapshot.confidence,
      totalRatings: snapshot.totalRatings,
    };
  } catch (err) {
    console.warn("[ACE-ADIS Bridge] Failed to load user DNA:", err);
    return { dna: null, confidence: 0, totalRatings: 0 };
  }
}

/**
 * Design DNA スナップショットを DB に保存
 */
export async function saveUserDNA(
  dna: DesignDNAPreferences,
  confidence: number,
  totalRatings: number,
): Promise<void> {
  try {
    await (prisma as any).designDNASnapshot.create({
      data: {
        minimalism: dna.minimalism,
        whitespace: dna.whitespace,
        contrast: dna.contrast,
        animationIntensity: dna.animationIntensity,
        serifAffinity: dna.serifAffinity,
        colorSaturation: dna.colorSaturation,
        layoutComplexity: dna.layoutComplexity,
        imageWeight: dna.imageWeight,
        asymmetry: dna.asymmetry,
        novelty: dna.novelty,
        confidence,
        totalRatings,
      },
    });
  } catch (err) {
    console.warn("[ACE-ADIS Bridge] Failed to save user DNA:", err);
  }
}

// ============================================================
// 3. Media Strategy → Phase 3 画像最適化
// ============================================================

/**
 * 組み立て済みHTMLに対してメディア戦略を適用
 *
 * URL分析から画像情報が含まれている場合、
 * 各画像に対して keep/generate/placeholder の判定を行い、
 * CSS/SVG代替やストック画像URLに置換する
 */
export function applyMediaStrategyToAssembledPage(
  fullDocument: string,
  urlAnalysis: DDPNextInput["urlAnalysis"],
  industry: string,
): { fullDocument: string; mediaStrategy: MediaStrategy | null } {
  if (!urlAnalysis) {
    return { fullDocument, mediaStrategy: null };
  }

  // URL分析から画像情報を抽出
  const images = (urlAnalysis as any)?.images;
  if (!images || !Array.isArray(images) || images.length === 0) {
    return { fullDocument, mediaStrategy: null };
  }

  // 画像分類を実行
  const strategy = classifyImages(
    images.map((img: any) => ({
      src: img.src || img.url || "",
      alt: img.alt || "",
      context: img.context || "content",
    })),
    industry,
  );

  // 生成されたアセットでHTML内の画像を置換
  let updatedDocument = fullDocument;
  for (const decision of strategy.decisions) {
    if (decision.decision === "generate" && decision.generatedAsset) {
      // placehold.co URLを生成済みアセットで置換
      // CSS/SVGの場合はbackground-imageとして適用
      if (decision.generationTier === "css-svg" && decision.generatedAsset.startsWith("linear-gradient")) {
        // CSSグラデーション → background-image に適用
        const placeholder = findPlaceholderForContext(decision.context);
        if (placeholder) {
          updatedDocument = updatedDocument.replace(
            new RegExp(`src="${escapeRegex(placeholder)}"`, "g"),
            `style="background: ${decision.generatedAsset}; display: block; width: 100%; aspect-ratio: 16/9;"`,
          );
        }
      } else if (decision.generationTier === "stock-photo" && decision.generatedAsset) {
        // ストックフォトURL
        const placeholder = findPlaceholderForContext(decision.context);
        if (placeholder) {
          updatedDocument = updatedDocument.replace(
            new RegExp(escapeRegex(placeholder), "g"),
            decision.generatedAsset,
          );
        }
      }
    }
  }

  console.log("[ACE-ADIS Bridge] Media strategy applied:", strategy.stats);

  return { fullDocument: updatedDocument, mediaStrategy: strategy };
}

// ============================================================
// 4. パイプライン拡張入力の構築
// ============================================================

/**
 * DDPNextInput を ACE-ADIS コンポーネントで拡張する
 *
 * パイプライン実行前に呼び出し:
 * - 学習済み userDNA を自動ロード
 * - Curator Vision 結果があれば urlAnalysis を拡張
 */
export async function enrichDDPNextInput(
  input: DDPNextInput,
  visionResult?: VisionAnalysisResult,
): Promise<DDPNextInput> {
  const enriched = { ...input };

  // ── userDNA 自動ロード（未設定の場合のみ） ──
  if (!enriched.userDNA) {
    const { dna, confidence } = await loadLatestUserDNA();
    if (dna && confidence > 0.1) {
      enriched.userDNA = dna;
      console.log("[ACE-ADIS Bridge] Loaded user DNA (confidence:", confidence, ")");
    }
  }

  // ── Curator Vision 結果があれば urlAnalysis を拡張 ──
  if (visionResult?.success) {
    enriched.urlAnalysis = enrichUrlAnalysisWithVision(
      enriched.urlAnalysis,
      visionResult,
    );
    console.log("[ACE-ADIS Bridge] URL analysis enriched with Curator Vision");
  }

  return enriched;
}

// ============================================================
// Internal helpers
// ============================================================

function findPlaceholderForContext(context: string): string | null {
  // DDP Nextテンプレートで使用されるplacehold.coパターン
  const placeholderMap: Record<string, string> = {
    hero: "https://placehold.co/1920x800",
    background: "https://placehold.co/1920x1080",
    product: "https://placehold.co/600x600",
    content: "https://placehold.co/800x600",
    logo: "https://placehold.co/200x60",
  };
  return placeholderMap[context] || null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
