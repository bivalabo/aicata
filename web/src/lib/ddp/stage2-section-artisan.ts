// ============================================================
// DDP Stage 2: Section Artisan（セクション職人）
//
// Design Spec の各セクションを、独立した Claude 呼び出しで
// HTML/CSS に変換する。各セクションは小さく完結するため、
// 出力が切れることがない。
//
// 革新点:
//   - セクション単位の生成 = 各セクションに Claude の全集中力
//   - Design Spec の colors/typography を CSS 変数として事前定義
//   - 並列実行で速度を確保
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import type {
  DesignSpec,
  SectionSpec,
  RenderedSection,
  DDPConfig,
  DDPInput,
} from "./types";
import { ecommerceEngine } from "./engines/ecommerce";
import type { EngineContext } from "./engines/types";

const SECTION_ARTISAN_PROMPT = `あなたはHTMLセクション職人です。指定されたデザイン仕様に従い、1つのセクションのHTML+CSSを出力します。

## ルール（厳守）

1. **HTML + CSS のみ出力** — 説明文・マークダウン不要
2. **セクション最外ラッパー** に data-section-id 属性を付与
3. **CSS は全て <style> タグ内** — インライン style 禁止
4. **CSS 変数を使用** — :root は定義しない（既に定義済み）。var(--color-primary) 等を参照
5. **レスポンシブ** — モバイルファースト → @media (min-width: 768px) → @media (min-width: 1024px)
6. **画像** — https://placehold.co/幅x高さ/背景色/文字色 形式
7. **日本語** — 全テキストは自然な日本語
8. **外部フレームワーク禁止** — 純粋な HTML + CSS のみ

## 出力フォーマット

\`\`\`
<section data-section-id="指定されたID">
  （HTMLコンテンツ）
</section>

<style>
/* このセクションのCSS */
</style>
\`\`\`

HTML部分を先に、<style>タグを最後に出力してください。`;

/**
 * 全セクションを並列で生成
 * input が渡された場合、エンジン知識を各セクションに注入する
 */
export async function renderAllSections(
  client: Anthropic,
  spec: DesignSpec,
  config: DDPConfig,
  onProgress?: (sectionId: string, index: number, total: number, status: "start" | "complete" | "failed", error?: string) => void,
  input?: DDPInput,
): Promise<RenderedSection[]> {
  const results: RenderedSection[] = [];
  const total = spec.sections.length;

  // Build engine context if input is available
  const engineCtx: EngineContext | undefined = input
    ? {
        pageType: input.pageType,
        industry: input.industry,
        tones: input.tones,
        targetAudience: input.targetAudience,
        brandName: input.brandName,
        locale: "ja-JP",
      }
    : undefined;

  // Concurrency control with semaphore
  const semaphore = new Semaphore(config.sectionConcurrency);

  const promises = spec.sections.map(async (section, index) => {
    await semaphore.acquire();
    try {
      onProgress?.(section.id, index, total, "start");

      const rendered = await renderSection(client, spec, section, config, 2, engineCtx);
      results[index] = rendered;

      onProgress?.(section.id, index, total, rendered.status === "success" ? "complete" : "failed", rendered.error);
    } finally {
      semaphore.release();
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * 1セクションを生成（リトライ付き）
 */
async function renderSection(
  client: Anthropic,
  spec: DesignSpec,
  section: SectionSpec,
  config: DDPConfig,
  maxRetries = 2,
  engineCtx?: EngineContext,
): Promise<RenderedSection> {
  const userPrompt = buildSectionPrompt(spec, section, engineCtx);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await sleep(1000 * Math.pow(2, attempt - 1));
      }

      const response = await client.messages.create({
        model: config.sectionModel,
        max_tokens: config.sectionMaxTokens,
        system: SECTION_ARTISAN_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });

      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as any).text as string)
        .join("");

      const parsed = parseSectionOutput(text, section.id);

      if (parsed.html.length > 30) {
        return {
          id: section.id,
          html: parsed.html,
          css: parsed.css,
          status: "success",
        };
      }

      // Output too short — retry
      if (attempt === maxRetries) {
        return {
          id: section.id,
          html: parsed.html || `<section data-section-id="${section.id}"><p>${section.purpose}</p></section>`,
          css: parsed.css,
          status: "failed",
          error: "生成された内容が不十分です",
        };
      }
    } catch (err) {
      if (attempt === maxRetries) {
        return {
          id: section.id,
          html: `<section data-section-id="${section.id}"><p>${section.purpose}</p></section>`,
          css: "",
          status: "failed",
          error: err instanceof Error ? err.message : "不明なエラー",
        };
      }

      // Rate limit — longer backoff
      if (err instanceof Error && (err.message.includes("429") || err.message.includes("overloaded"))) {
        await sleep(5000 * Math.pow(2, attempt));
      }
    }
  }

  // Should never reach here
  return {
    id: section.id,
    html: `<section data-section-id="${section.id}"><p>${section.purpose}</p></section>`,
    css: "",
    status: "failed",
    error: "リトライ上限に達しました",
  };
}

/**
 * セクション生成用のユーザープロンプトを構築
 * エンジン知識をセクション別に注入
 */
function buildSectionPrompt(spec: DesignSpec, section: SectionSpec, engineCtx?: EngineContext): string {
  const parts: string[] = [];

  // Design context — compact
  parts.push(`## デザインコンテキスト`);
  parts.push(`デザイン方針: ${spec.designPhilosophy}`);
  parts.push(`トーン: ${spec.toneDescription}`);
  parts.push(`視線誘導: ${spec.eyeFlow}`);

  // CSS variables available
  parts.push(`\n## 使用可能なCSS変数（:rootで定義済み）`);
  parts.push(`--color-primary: ${spec.colors.primary};`);
  parts.push(`--color-secondary: ${spec.colors.secondary};`);
  parts.push(`--color-accent: ${spec.colors.accent};`);
  parts.push(`--color-bg: ${spec.colors.background};`);
  parts.push(`--color-text: ${spec.colors.text};`);
  parts.push(`--font-heading: "${spec.typography.headingFont}", sans-serif;`);
  parts.push(`--font-body: "${spec.typography.bodyFont}", sans-serif;`);

  // ── Engine Section Knowledge — ドメイン固有のベストプラクティスを注入 ──
  if (engineCtx) {
    const sectionKnowledge = ecommerceEngine.getSectionKnowledge(section.category, engineCtx);
    parts.push(`\n## このセクションの専門知識（ECデザインエンジンより）`);
    parts.push(`### 成功法則\n${sectionKnowledge.bestPractices}`);
    parts.push(`### コピーライティング指針\n${sectionKnowledge.copywritingGuidance}`);
    parts.push(`### レイアウト推奨\n${sectionKnowledge.layoutRecommendation}`);
    parts.push(`### よくある失敗（避けること）\n${sectionKnowledge.commonMistakes}`);
  }

  // Section spec
  parts.push(`\n## 生成するセクション`);
  parts.push(`- ID: ${section.id}`);
  parts.push(`- 役割: ${section.purpose}`);
  parts.push(`- カテゴリ: ${section.category}`);
  parts.push(`- レイアウト: ${section.layout}`);
  parts.push(`- 視覚スタイル: ${section.visualStyle}`);
  parts.push(`- 背景: ${section.backgroundStyle}`);
  if (section.animation) {
    parts.push(`- アニメーション: ${section.animation}`);
  }

  // Content brief
  const brief = section.contentBrief;
  parts.push(`\n## コンテンツ`);
  if (brief.heading) parts.push(`見出し: 「${brief.heading}」`);
  if (brief.subheading) parts.push(`サブ見出し: 「${brief.subheading}」`);
  if (brief.bodyText) parts.push(`本文: 「${brief.bodyText}」`);
  if (brief.ctaText) parts.push(`CTAボタン: 「${brief.ctaText}」 → ${brief.ctaLink || "#"}`);
  if (brief.imageDescriptions && brief.imageDescriptions.length > 0) {
    parts.push(`画像:`);
    brief.imageDescriptions.forEach((desc, i) => {
      parts.push(`  ${i + 1}. ${desc}`);
    });
  }
  if (brief.listItems && brief.listItems.length > 0) {
    parts.push(`リスト項目:`);
    brief.listItems.forEach((item) => {
      parts.push(`  - ${item.title}: ${item.description}`);
    });
  }
  if (brief.additionalNotes) {
    parts.push(`追加指示: ${brief.additionalNotes}`);
  }

  parts.push(`\nこのセクションのHTML + CSSを出力してください。`);

  return parts.join("\n");
}

/**
 * AIの出力からHTML/CSSを抽出
 */
function parseSectionOutput(
  text: string,
  sectionId: string,
): { html: string; css: string } {
  let content = text.trim();

  // Remove markdown code block wrappers
  content = content.replace(/^```(?:html)?\s*/i, "");
  content = content.replace(/\s*```\s*$/i, "");
  content = content.trim();

  // Extract <style> tags
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const styleMatches = [...content.matchAll(styleRegex)];

  let css = "";
  let html = content;

  for (const match of styleMatches) {
    css += match[1].trim() + "\n";
    html = html.replace(match[0], "");
  }

  html = html.trim();
  css = css.trim();

  // Ensure data-section-id is present
  if (html && !html.includes(`data-section-id`)) {
    // Wrap in a section tag
    html = `<section data-section-id="${sectionId}">\n${html}\n</section>`;
  }

  return { html, css };
}

// ── Semaphore for concurrency control ──

class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift()!;
      next();
    } else {
      this.permits++;
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
