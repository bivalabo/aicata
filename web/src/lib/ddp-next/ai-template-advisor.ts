// ============================================================
// DDP Next — AI Template Advisor
// Phase 2 信頼度ベースAI補助
//
// confidence < 0.4 の場合にのみ発火。
// ユーザーの指示文を Claude に読ませ、
// 最適なテンプレートIDとトーン推定を返す。
//
// AI使用: 条件的（推定20%のページで発火）
// コスト: ~$0.0105/回
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import type { IntentAnalysis, CompositionPlan } from "./types";
import type { PageTemplate } from "@/lib/design-engine/types";
import { getAllTemplates } from "@/lib/design-engine/template-selector";

/** AI補助テンプレート選定の閾値 */
export const CONFIDENCE_THRESHOLD = 0.4;

/** AI補助が必要かどうかを判定 */
export function needsAITemplateAdvisor(confidence: number): boolean {
  return confidence < CONFIDENCE_THRESHOLD;
}

export interface AITemplateAdvice {
  /** 推奨テンプレートID */
  recommendedTemplateId: string;
  /** 推奨トーン */
  recommendedTones: string[];
  /** 推奨業種 */
  recommendedIndustry: string;
  /** AIの判断理由 */
  reasoning: string;
}

/**
 * AIでユーザー入力を解釈し、テンプレート選定を補助
 *
 * 発火条件: confidence < 0.4（DNA未学習 + URL分析なし + トーン未指定）
 */
export async function getAITemplateAdvice(
  intent: IntentAnalysis,
  userInstructions: string | undefined,
  client: Anthropic,
): Promise<AITemplateAdvice | null> {
  if (!userInstructions || userInstructions.trim().length < 5) {
    return null;
  }

  // 利用可能なテンプレートID一覧を構築
  const templates = getAllTemplates();
  const templateList = templates
    .map((t) => `- ${t.id}: ${t.name || t.id} (${t.pageType}, tones: ${t.tones?.join(",") || "general"})`)
    .join("\n");

  try {
    const response = await client.messages.create({
      model: process.env.CLAUDE_MODEL_DEFAULT || "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: `あなたはECサイトデザインのエキスパートです。ユーザーの要望から最適なテンプレートを1つ選んでください。
回答はJSONのみ。コードブロック不要。
{"templateId": "...", "tones": ["..."], "industry": "...", "reasoning": "..."}`,
      messages: [{
        role: "user",
        content: `ユーザーの要望:
${userInstructions}

現在の自動判定:
- 業種: ${intent.contentRequirements.industry}
- トーン: ${intent.contentRequirements.tones.join(", ")}
- ページタイプ: ${intent.contentRequirements.pageType}
- 信頼度: ${(intent.confidence * 100).toFixed(0)}%（低いため補助が必要）

利用可能なテンプレート:
${templateList}

最も適切なテンプレートIDと、推奨トーン・業種を返してください。`,
      }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as any).text as string)
      .join("");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      recommendedTemplateId: parsed.templateId || "",
      recommendedTones: parsed.tones || [],
      recommendedIndustry: parsed.industry || intent.contentRequirements.industry,
      reasoning: parsed.reasoning || "",
    };
  } catch (err) {
    console.warn("[AI Template Advisor] Failed:", err);
    return null;
  }
}
