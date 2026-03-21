import Anthropic from "@anthropic-ai/sdk";
import {
  analyzeDesignContext,
  composeDesignPrompt,
  composeDesignPromptWithCache,
} from "./design-engine";
import { composeGen3Prompt } from "./design-engine/prompt-composer";
import { selectBestTemplate } from "./design-engine/template-selector";
import type { DesignContext, PageTemplate, UrlAnalysisResult } from "./design-engine";

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined;
};

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

if (process.env.NODE_ENV !== "production") {
  globalForAnthropic.anthropic = anthropic;
}

// ------------------------------------------------------------
// Gen-3 Design Engine Integration
// ------------------------------------------------------------

export interface Gen3PromptResult {
  prompt: string;
  context: DesignContext;
  selectedTemplate: PageTemplate | null;
  gen3: true;
}

export interface LegacyPromptResult {
  prompt: string;
  context: DesignContext;
  gen3: false;
}

export type SystemPromptResult = Gen3PromptResult | LegacyPromptResult;

/**
 * Gen-3: テンプレートベースのシステムプロンプト生成
 *
 * 1. DesignContext を分析
 * 2. 最適テンプレートを選択
 * 3. テンプレートHTML/CSSを含むプロンプトを構築
 *
 * テンプレートが見つからない場合はGen-2にフォールバック
 */
export function buildSystemPrompt(
  userMessage: string,
  conversationMessages?: Array<{ role: string; content: string }>,
  urlAnalysis?: UrlAnalysisResult,
  pageType?: string,
): SystemPromptResult {
  const context = analyzeDesignContext(userMessage, conversationMessages, pageType);

  // URL解析結果をコンテキストに付加
  if (urlAnalysis) {
    context.urlAnalysis = urlAnalysis;
  }

  // Gen-3: テンプレート選択を試みる
  try {
    const match = selectBestTemplate(context, urlAnalysis);

    if (match && match.score > 0.2) {
      const prompt = composeGen3Prompt(
        context,
        match.template,
        urlAnalysis,
      );

      console.log("[Gen-3] Template selected:", {
        templateId: match.template.id,
        score: match.score,
        reasons: match.reasons,
        promptLength: prompt.length,
      });

      return {
        prompt,
        context,
        selectedTemplate: match.template,
        gen3: true,
      };
    }
  } catch (e) {
    console.warn("[Gen-3] Template selection failed, falling back to Gen-2:", e);
  }

  // Gen-2 フォールバック
  const prompt = composeDesignPrompt(context);
  console.log("[Gen-2 Fallback]", {
    industry: context.industry,
    pageType: context.pageType,
    promptLength: prompt.length,
  });

  return { prompt, context, gen3: false };
}

/**
 * Gen-2互換: Prompt Caching 対応版
 */
export function buildSystemPromptWithCache(
  userMessage: string,
  conversationMessages?: Array<{ role: string; content: string }>,
): { staticPrompt: string; dynamicPrompt: string; context: DesignContext } {
  const context = analyzeDesignContext(userMessage, conversationMessages);
  const [staticPrompt, dynamicPrompt] = composeDesignPromptWithCache(context);
  return { staticPrompt, dynamicPrompt, context };
}

// Legacy: 静的プロンプト（フォールバック用）
export const SYSTEM_PROMPT = composeDesignPrompt({
  industry: "general",
  pageType: "landing",
  tones: ["modern"],
  cssFeatures: ["motion", "typography", "modern-layout"],
  keywords: [],
  confidence: 0.3,
});

export const DEFAULT_MODEL =
  process.env.CLAUDE_MODEL_DEFAULT || "claude-sonnet-4-20250514";
export const DEFAULT_MAX_TOKENS = parseInt(
  process.env.CLAUDE_MAX_TOKENS || "16384",
);
