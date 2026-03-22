// ============================================================
// DDP Stage 4: Quality Reviewer（品質レビューアー）
//
// 完成したページ全体を俯瞰し、以下を評価・最適化する:
//   1. 視覚的一貫性 — 色・フォント・余白が統一されているか
//   2. コンバージョン最適化 — CTAの配置、導線の明確さ
//   3. レスポンシブ品質 — モバイルでの見え方
//   4. コピーライティング — 売れる文章になっているか
//   5. アクセシビリティ — alt属性、コントラスト比
//
// 入力: 組み立て済みの fullDocument (HTML+CSS)
// 出力: レビュー結果 + 改善提案 + （オプション）修正済みHTML
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import type { DDPConfig, DDPInput } from "./types";
import { ecommerceEngine } from "./engines/ecommerce";
import type { EngineContext } from "./engines/types";

export interface ReviewResult {
  /** 総合スコア（0-100） */
  overallScore: number;

  /** カテゴリ別スコア */
  scores: {
    visualConsistency: number;
    conversionOptimization: number;
    responsiveQuality: number;
    copywriting: number;
    accessibility: number;
  };

  /** 改善提案 */
  suggestions: ReviewSuggestion[];

  /** 修正済みHTML（改善が適用された場合） */
  optimizedHtml?: string;
  optimizedCss?: string;
}

export interface ReviewSuggestion {
  category: "visual" | "conversion" | "responsive" | "copy" | "accessibility";
  severity: "critical" | "important" | "suggestion";
  description: string;
  fix?: string;
}

const REVIEWER_PROMPT_BASE = `あなたはECサイトのデザインレビュアーです。完成したページのHTML/CSSをレビューし、品質を評価してください。

## 評価基準

1. **視覚的一貫性** (0-100)
   - カラーパレットの統一
   - フォントの一貫性
   - 余白・間隔のリズム
   - 全体のトーン&マナー

2. **コンバージョン最適化** (0-100)
   - CTAボタンの視認性・配置
   - ファーストビューの訴求力
   - 購入導線の明確さ
   - 社会的証明の活用

3. **レスポンシブ品質** (0-100)
   - モバイルファーストの実装
   - ブレークポイントの適切さ
   - タッチターゲットのサイズ

4. **コピーライティング** (0-100)
   - 見出しの訴求力
   - 本文の読みやすさ
   - CTAの行動喚起力
   - 日本語の自然さ

5. **アクセシビリティ** (0-100)
   - alt属性の充実度
   - カラーコントラスト
   - セマンティックHTML

## 出力フォーマット

以下のJSON構造で出力してください。JSONのみ出力してください。

\`\`\`json
{
  "overallScore": 85,
  "scores": {
    "visualConsistency": 90,
    "conversionOptimization": 80,
    "responsiveQuality": 85,
    "copywriting": 82,
    "accessibility": 78
  },
  "suggestions": [
    {
      "category": "conversion",
      "severity": "critical",
      "description": "問題の説明",
      "fix": "修正方法（任意）"
    }
  ]
}
\`\`\`

criticalな問題がある場合のみ、修正済みのHTML/CSSも提供してください。
その場合はJSONの外に以下の形式で:

---OPTIMIZED_START---
（修正済みHTML）
<style>（修正済みCSS）</style>
---OPTIMIZED_END---`;

/**
 * エンジン知識を注入したレビュアープロンプトを構築
 */
function buildReviewerPrompt(input?: DDPInput): string {
  if (!input) return REVIEWER_PROMPT_BASE;

  const ctx: EngineContext = {
    pageType: input.pageType,
    industry: input.industry,
    tones: input.tones,
    targetAudience: input.targetAudience,
    brandName: input.brandName,
    locale: "ja-JP",
  };

  const criteria = ecommerceEngine.getReviewCriteria(ctx);

  return `${REVIEWER_PROMPT_BASE}

## ドメイン固有の評価ポイント（ECエンジンより）

${criteria.domainSpecificChecks}

### 必須要素チェックリスト
${criteria.requiredElements.map((e) => `- [ ] ${e}`).join("\n")}

### 品質閾値
${Object.entries(criteria.qualityThresholds).map(([k, v]) => `- ${k}: ${v}点以上が合格`).join("\n")}`;
}

/**
 * Stage 4: 完成ページをレビューし、品質を評価・最適化する
 */
export async function reviewPage(
  client: Anthropic,
  fullDocument: string,
  config: DDPConfig,
  input?: DDPInput,
): Promise<ReviewResult> {
  const systemPrompt = buildReviewerPrompt(input);
  const userPrompt = `以下のECサイトページをレビューしてください。\n\n${fullDocument.slice(0, 12000)}`;

  try {
    const response = await client.messages.create({
      model: config.specModel,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as any).text as string)
      .join("");

    return parseReviewResult(text);
  } catch (err) {
    console.error("[DDP Reviewer] Review failed:", err);
    // Return neutral scores on failure
    return {
      overallScore: 70,
      scores: {
        visualConsistency: 70,
        conversionOptimization: 70,
        responsiveQuality: 70,
        copywriting: 70,
        accessibility: 70,
      },
      suggestions: [],
    };
  }
}

function parseReviewResult(text: string): ReviewResult {
  // Extract JSON
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

  let parsed: any;
  try {
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      parsed = JSON.parse(jsonStr.slice(firstBrace, lastBrace + 1));
    } else {
      throw new Error("No JSON found");
    }
  } catch {
    return {
      overallScore: 70,
      scores: {
        visualConsistency: 70,
        conversionOptimization: 70,
        responsiveQuality: 70,
        copywriting: 70,
        accessibility: 70,
      },
      suggestions: [],
    };
  }

  // Extract optimized HTML if present
  let optimizedHtml: string | undefined;
  let optimizedCss: string | undefined;
  const optimizedMatch = text.match(/---OPTIMIZED_START---([\s\S]*?)---OPTIMIZED_END---/);
  if (optimizedMatch) {
    const content = optimizedMatch[1].trim();
    const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if (styleMatch) {
      optimizedCss = styleMatch[1].trim();
      optimizedHtml = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").trim();
    } else {
      optimizedHtml = content;
    }
  }

  return {
    overallScore: parsed.overallScore || 70,
    scores: {
      visualConsistency: parsed.scores?.visualConsistency || 70,
      conversionOptimization: parsed.scores?.conversionOptimization || 70,
      responsiveQuality: parsed.scores?.responsiveQuality || 70,
      copywriting: parsed.scores?.copywriting || 70,
      accessibility: parsed.scores?.accessibility || 70,
    },
    suggestions: (parsed.suggestions || []).map((s: any) => ({
      category: s.category || "visual",
      severity: s.severity || "suggestion",
      description: s.description || "",
      fix: s.fix,
    })),
    optimizedHtml,
    optimizedCss,
  };
}
