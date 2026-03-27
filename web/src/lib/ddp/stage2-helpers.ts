// ============================================================
// DDP Stage 2 Helpers — 再利用可能な関数群
//
// stage2-section-artisan.ts から抽出。
// /api/chat/stream と /api/build/section の両方から使用。
// ============================================================

import type { DesignSpec, SectionSpec } from "./types";
import { ecommerceEngine } from "./engines/ecommerce";
import type { EngineContext } from "./engines/types";

export const SECTION_ARTISAN_PROMPT = `あなたはHTMLセクション職人です。指定されたデザイン仕様に従い、1つのセクションのHTML+CSSを出力します。

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
<style>
/* このセクションのCSS */
</style>

<section data-section-id="指定されたID">
  （HTMLコンテンツ）
</section>
\`\`\`

**CSSを先に出力し、その後にHTMLを出力してください。**（ストリーム中断時でもスタイルが適用されるため）`;

/**
 * セクション生成用のユーザープロンプトを構築
 */
export function buildSectionPrompt(
  spec: DesignSpec,
  section: SectionSpec,
  engineCtx?: EngineContext,
): string {
  const parts: string[] = [];

  parts.push(`## デザインコンテキスト`);
  parts.push(`デザイン方針: ${spec.designPhilosophy}`);
  parts.push(`トーン: ${spec.toneDescription}`);
  parts.push(`視線誘導: ${spec.eyeFlow}`);

  parts.push(`\n## 使用可能なCSS変数（:rootで定義済み）`);
  parts.push(`--color-primary: ${spec.colors.primary};`);
  parts.push(`--color-secondary: ${spec.colors.secondary};`);
  parts.push(`--color-accent: ${spec.colors.accent};`);
  parts.push(`--color-bg: ${spec.colors.background};`);
  parts.push(`--color-text: ${spec.colors.text};`);
  parts.push(`--font-heading: "${spec.typography.headingFont}", sans-serif;`);
  parts.push(`--font-body: "${spec.typography.bodyFont}", sans-serif;`);

  // Engine section knowledge
  if (engineCtx) {
    try {
      const sectionKnowledge = ecommerceEngine.getSectionKnowledge(section.category, engineCtx);
      parts.push(`\n## このセクションの専門知識（ECデザインエンジンより）`);
      parts.push(`### 成功法則\n${sectionKnowledge.bestPractices}`);
      parts.push(`### コピーライティング指針\n${sectionKnowledge.copywritingGuidance}`);
      parts.push(`### レイアウト推奨\n${sectionKnowledge.layoutRecommendation}`);
      parts.push(`### よくある失敗（避けること）\n${sectionKnowledge.commonMistakes}`);
    } catch {
      // Engine knowledge not available — skip
    }
  }

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
export function parseSectionOutput(
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
    html = `<section data-section-id="${sectionId}">\n${html}\n</section>`;
  }

  return { html, css };
}
