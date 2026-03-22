// ============================================================
// Aicata DDP — Design Decomposition Pipeline
// メインオーケストレーター
//
// 3ステージを統合し、1つのページを確実に生成する。
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { generateDesignSpec } from "./stage1-design-director";
import { renderAllSections } from "./stage2-section-artisan";
import { assembleAndValidate } from "./stage3-harmony-assembler";
import type {
  DDPInput,
  DDPConfig,
  DDPProgressEvent,
  AssembledPageResult,
  DEFAULT_DDP_CONFIG,
} from "./types";

export { DEFAULT_DDP_CONFIG } from "./types";
export type { DDPInput, DDPConfig, DDPProgressEvent, AssembledPageResult };

/**
 * DDP パイプライン — 3ステージでページを生成
 *
 * Stage 1: Design Director — デザイン設計図（JSON）を生成
 * Stage 2: Section Artisan — セクションごとにHTML/CSSを生成
 * Stage 3: Harmony Assembler — 組み立て & 検証
 */
export async function runDDP(
  input: DDPInput,
  config?: Partial<DDPConfig>,
  onProgress?: (event: DDPProgressEvent) => void,
): Promise<AssembledPageResult> {
  const finalConfig: DDPConfig = {
    ...({
      specModel: "claude-sonnet-4-20250514",
      sectionModel: "claude-sonnet-4-20250514",
      specMaxTokens: 4096,
      sectionMaxTokens: 4096,
      sectionConcurrency: 3,
      timeoutMs: 120000,
    }),
    ...config,
  };

  // Use env vars for model if available
  if (process.env.CLAUDE_MODEL_DEFAULT) {
    finalConfig.specModel = process.env.CLAUDE_MODEL_DEFAULT;
    finalConfig.sectionModel = process.env.CLAUDE_MODEL_DEFAULT;
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  console.log("[DDP] Pipeline starting", {
    pageType: input.pageType,
    industry: input.industry,
    brandName: input.brandName,
  });

  // ── Stage 1: Design Director ──
  onProgress?.({ stage: "spec", status: "start" });

  let spec;
  try {
    spec = await generateDesignSpec(client, input, finalConfig);
    console.log("[DDP] Stage 1 complete:", {
      sectionCount: spec.sections.length,
      colors: spec.colors,
      philosophy: spec.designPhilosophy.slice(0, 80),
    });
    onProgress?.({ stage: "spec", status: "complete", spec });
  } catch (err) {
    console.error("[DDP] Stage 1 failed:", err);
    // Fallback: create a minimal spec
    spec = createFallbackSpec(input);
    onProgress?.({ stage: "spec", status: "complete", spec });
  }

  // ── Stage 2: Section Artisan ──
  const sections = await renderAllSections(
    client,
    spec,
    finalConfig,
    (sectionId, index, total, status, error) => {
      if (status === "start") {
        onProgress?.({ stage: "section", status: "start", sectionId, index, total });
      } else if (status === "complete") {
        onProgress?.({ stage: "section", status: "complete", sectionId, index, total });
      } else {
        onProgress?.({ stage: "section", status: "failed", sectionId, error: error || "", index, total });
      }
    },
  );

  const successCount = sections.filter((s) => s.status === "success").length;
  console.log("[DDP] Stage 2 complete:", {
    total: sections.length,
    success: successCount,
    failed: sections.length - successCount,
  });

  // ── Stage 3: Harmony Assembler ──
  onProgress?.({ stage: "assembly", status: "start" });

  const result = assembleAndValidate(spec, sections);

  console.log("[DDP] Stage 3 complete:", {
    htmlLength: result.html.length,
    cssLength: result.css.length,
    valid: result.validation.isValid,
    autoFixed: result.validation.autoFixedIssues.length,
    remainingPlaceholders: result.validation.remainingPlaceholders.length,
  });

  onProgress?.({ stage: "assembly", status: "complete", validation: result.validation });
  onProgress?.({ stage: "done", result });

  return result;
}

/**
 * DDPをストリーミング形式で実行（チャットUI用）
 *
 * ---PAGE_START--- / ---PAGE_END--- マーカー付きで、
 * 既存のフロントエンドと互換性を保つ
 */
export async function runDDPForChat(
  input: DDPInput,
  config?: Partial<DDPConfig>,
): Promise<{
  fullResponse: string;
  html: string;
  css: string;
}> {
  const result = await runDDP(input, config);

  // 既存フロントエンドとの互換性のため、
  // ---PAGE_START--- / ---PAGE_END--- マーカー付きで返す
  const specSummary = buildSpecSummary(result.spec);

  const fullResponse = `${specSummary}

---PAGE_START---
${result.fullDocument}
---PAGE_END---`;

  return {
    fullResponse,
    html: result.html,
    css: result.css,
  };
}

/**
 * Design Spec の要約テキスト（チャット表示用）
 */
function buildSpecSummary(spec: import("./types").DesignSpec): string {
  const parts: string[] = [];
  parts.push(`ページをデザインしました。`);
  parts.push("");
  parts.push(`**デザイン方針**: ${spec.designPhilosophy}`);
  parts.push(`**配色**: ${spec.colors.reasoning}`);
  parts.push(`**セクション構成**: ${spec.sections.length}セクション`);

  const sectionNames = spec.sections.map((s) => s.purpose).join("、");
  parts.push(`（${sectionNames}）`);

  return parts.join("\n");
}

/**
 * Stage 1 失敗時のフォールバック DesignSpec
 */
function createFallbackSpec(input: DDPInput): import("./types").DesignSpec {
  const brandName = input.brandName || "ブランド";
  const isBeauty = input.industry === "beauty";
  const isFashion = input.industry === "fashion";
  const isFood = input.industry === "food";

  // Industry-appropriate defaults
  let primary = "#2563eb";
  let secondary = "#64748b";
  let accent = "#f59e0b";

  if (isBeauty) {
    primary = "#be185d";
    secondary = "#9d174d";
    accent = "#c084fc";
  } else if (isFashion) {
    primary = "#18181b";
    secondary = "#52525b";
    accent = "#a3a3a3";
  } else if (isFood) {
    primary = "#c2410c";
    secondary = "#78350f";
    accent = "#facc15";
  }

  // Use brand memory colors if available
  if (input.brandMemory?.primaryColor) primary = input.brandMemory.primaryColor;
  if (input.brandMemory?.secondaryColor) secondary = input.brandMemory.secondaryColor;
  if (input.brandMemory?.accentColor) accent = input.brandMemory.accentColor;

  return {
    designPhilosophy: `${brandName}の世界観を伝える、信頼感のあるデザイン`,
    eyeFlow: "ヒーロー → 特徴 → 商品 → 社会的証明 → CTA",
    conversionStrategy: "明確なCTAと社会的証明で購入に導く",
    colors: {
      primary,
      secondary,
      accent,
      background: "#ffffff",
      text: "#1e293b",
      reasoning: "業界標準のカラーパレット",
    },
    typography: {
      headingFont: input.brandMemory?.primaryFont || "Noto Sans JP",
      bodyFont: input.brandMemory?.bodyFont || "Noto Sans JP",
      googleFontsUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap",
      reasoning: "日本語サイトに最適なフォント",
    },
    sections: getFallbackSections(input.pageType, brandName),
    responsiveStrategy: "モバイルファースト",
    toneDescription: input.tones.join("、") || "モダン",
  };
}

function getFallbackSections(pageType: string, brandName: string): import("./types").SectionSpec[] {
  if (pageType === "landing" || pageType === "general") {
    return [
      {
        id: "navigation",
        purpose: "ヘッダー・ナビゲーション",
        category: "navigation",
        visualStyle: "シンプルでクリーン",
        layout: "full-width",
        backgroundStyle: "白背景",
        contentBrief: {
          heading: brandName,
          ctaText: "お問い合わせ",
          ctaLink: "#contact",
          listItems: [
            { title: "ホーム", description: "/" },
            { title: "商品一覧", description: "/collections" },
            { title: "ブランドストーリー", description: "/about" },
            { title: "ブログ", description: "/blog" },
          ],
        },
      },
      {
        id: "hero",
        purpose: "ファーストビュー・メインビジュアル",
        category: "hero",
        visualStyle: "大胆で目を引く",
        layout: "full-width",
        backgroundStyle: "グラデーションまたは画像背景",
        animation: "フェードイン",
        contentBrief: {
          heading: `${brandName}へようこそ`,
          subheading: "あなたの暮らしを、もっと豊かに。",
          ctaText: "今すぐ見る",
          ctaLink: "/collections",
          imageDescriptions: ["ブランドのメインビジュアル画像"],
        },
      },
      {
        id: "features",
        purpose: "特徴・USP",
        category: "features",
        visualStyle: "アイコン付きグリッド",
        layout: "contained",
        backgroundStyle: "ライトグレー背景",
        contentBrief: {
          heading: "選ばれる理由",
          listItems: [
            { title: "品質へのこだわり", description: "厳選された素材と丁寧な仕上がり" },
            { title: "安心のサポート", description: "お客様に寄り添うアフターケア" },
            { title: "送料無料", description: "¥5,000以上のお買い物で全国送料無料" },
          ],
        },
      },
      {
        id: "products",
        purpose: "注目商品",
        category: "products",
        visualStyle: "カードグリッド",
        layout: "contained",
        backgroundStyle: "白背景",
        contentBrief: {
          heading: "人気アイテム",
          subheading: "お客様に最も愛されている商品をご紹介",
          imageDescriptions: [
            "商品画像 1",
            "商品画像 2",
            "商品画像 3",
            "商品画像 4",
          ],
          ctaText: "すべて見る",
          ctaLink: "/collections/all",
        },
      },
      {
        id: "testimonials",
        purpose: "お客様の声",
        category: "testimonial",
        visualStyle: "カルーセルまたはカード",
        layout: "contained",
        backgroundStyle: "プライマリカラーの薄い背景",
        contentBrief: {
          heading: "お客様の声",
          listItems: [
            { title: "M.T.様", description: "品質が素晴らしく、リピートしています。" },
            { title: "K.S.様", description: "友人へのギフトに購入しました。とても喜ばれました。" },
            { title: "A.Y.様", description: "デザインが美しく、使い心地も抜群です。" },
          ],
        },
      },
      {
        id: "cta-bottom",
        purpose: "最終CTA",
        category: "cta",
        visualStyle: "アクセントカラー背景",
        layout: "full-width",
        backgroundStyle: "アクセントカラーグラデーション",
        contentBrief: {
          heading: "あなたにぴったりの一品を見つけてください",
          ctaText: "ショップへ",
          ctaLink: "/collections",
        },
      },
      {
        id: "footer",
        purpose: "フッター",
        category: "footer",
        visualStyle: "ダークトーン",
        layout: "full-width",
        backgroundStyle: "ダークグレー or ブラック背景",
        contentBrief: {
          heading: brandName,
          listItems: [
            { title: "会社概要", description: "/about" },
            { title: "お問い合わせ", description: "/contact" },
            { title: "プライバシーポリシー", description: "/privacy" },
            { title: "特定商取引法に基づく表記", description: "/legal" },
          ],
          additionalNotes: "SNSアイコン（Instagram, Twitter, LINE）を含めてください",
        },
      },
    ];
  }

  // Default: minimal sections
  return [
    {
      id: "navigation",
      purpose: "ヘッダー",
      category: "navigation",
      visualStyle: "シンプル",
      layout: "full-width",
      backgroundStyle: "白背景",
      contentBrief: { heading: brandName },
    },
    {
      id: "main-content",
      purpose: "メインコンテンツ",
      category: "general",
      visualStyle: "クリーン",
      layout: "contained",
      backgroundStyle: "白背景",
      contentBrief: {
        heading: "コンテンツ",
        bodyText: "ここにページの主要コンテンツが入ります。",
      },
    },
    {
      id: "footer",
      purpose: "フッター",
      category: "footer",
      visualStyle: "ダークトーン",
      layout: "full-width",
      backgroundStyle: "ダークグレー背景",
      contentBrief: { heading: brandName },
    },
  ];
}
