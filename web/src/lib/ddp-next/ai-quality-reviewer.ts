// ============================================================
// DDP Next — AI Quality Reviewer
// Phase 5 HQSベースAI品質レビュー
//
// 生成されたページのHQSスコアが閾値以下の場合にのみ発火。
// Claude にHTMLを読ませ、具体的な改善パッチを返す。
//
// AI使用: 条件的（推定10%のページで発火）
// コスト: ~$0.0195/回
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import type { ContentRequirements } from "./types";

/** AI品質レビューの閾値（HQSコンポジットスコア） */
export const HQS_REVIEW_THRESHOLD = 3.0;

/** AI品質レビューが必要かどうかを判定 */
export function needsAIQualityReview(hqsComposite: number): boolean {
  return hqsComposite < HQS_REVIEW_THRESHOLD;
}

export interface QualityReviewResult {
  /** レビュー実行フラグ */
  reviewed: boolean;
  /** 修正済みCSS（差分のみ） */
  cssPatches: string;
  /** 改善点の要約 */
  improvements: string[];
  /** 修正後のスコア推定 */
  estimatedScoreAfter: number;
}

/**
 * AIでページ品質をレビューし、CSS修正パッチを生成
 *
 * 発火条件: テンプレートのHQSコンポジットスコア < 3.0
 *
 * Phase 5 Fine-tune の後に実行。HTMLの構造は変えず、
 * CSSの調整のみで品質を改善する（安全性重視）
 */
export async function reviewAndPatchQuality(
  fullDocument: string,
  requirements: ContentRequirements,
  hqsComposite: number,
  client: Anthropic,
): Promise<QualityReviewResult> {
  // HTML全文は長すぎるので、先頭3000文字 + CSS部分のみ送信
  const styleMatch = fullDocument.match(/<style[^>]*>([\s\S]*?)<\/style>/g);
  const cssContent = styleMatch ? styleMatch.join("\n") : "";
  const htmlPreview = fullDocument.replace(/<style[\s\S]*?<\/style>/g, "").slice(0, 2000);

  try {
    const response = await client.messages.create({
      model: process.env.CLAUDE_MODEL_DEFAULT || "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: `あなたはウェブデザイン品質レビューの専門家です。
提供されたページのCSSを分析し、品質改善のためのCSS修正パッチを提案してください。

ルール:
1. HTMLの構造は一切変更しない（CSSのみ）
2. 既存のCSS変数を活用する
3. レスポンシブ対応を崩さない
4. 視覚的な改善に焦点（余白、フォントサイズ、コントラスト、リズム）

出力形式（JSONのみ、コードブロック不要）:
{"cssPatches": "追加CSSルール", "improvements": ["改善点1", "改善点2"], "estimatedScoreAfter": 3.5}`,
      messages: [{
        role: "user",
        content: `ページ品質レビュー依頼:
- ブランド: ${requirements.brandName}
- 業種: ${requirements.industry}
- トーン: ${requirements.tones.join(", ")}
- 現在のHQSスコア: ${hqsComposite.toFixed(1)} / 5.0（要改善）

CSS:
${cssContent.slice(0, 3000)}

HTML（先頭プレビュー）:
${htmlPreview}

品質改善のためのCSSパッチを提案してください。`,
      }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as any).text as string)
      .join("");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { reviewed: false, cssPatches: "", improvements: [], estimatedScoreAfter: hqsComposite };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      reviewed: true,
      cssPatches: parsed.cssPatches || "",
      improvements: parsed.improvements || [],
      estimatedScoreAfter: parsed.estimatedScoreAfter || hqsComposite + 0.5,
    };
  } catch (err) {
    console.warn("[AI Quality Reviewer] Failed:", err);
    return { reviewed: false, cssPatches: "", improvements: [], estimatedScoreAfter: hqsComposite };
  }
}

/**
 * CSSパッチをフルドキュメントに適用
 */
export function applyCSSPatches(fullDocument: string, cssPatches: string): string {
  if (!cssPatches || cssPatches.trim().length === 0) return fullDocument;

  // 最後の</style>タグの直前にパッチを挿入
  const lastStyleClose = fullDocument.lastIndexOf("</style>");
  if (lastStyleClose !== -1) {
    return (
      fullDocument.slice(0, lastStyleClose) +
      "\n/* AI Quality Review Patches */\n" +
      cssPatches +
      "\n" +
      fullDocument.slice(lastStyleClose)
    );
  }

  // <style>がない場合はHTMLの先頭に追加
  return `<style>\n/* AI Quality Review Patches */\n${cssPatches}\n</style>\n${fullDocument}`;
}
