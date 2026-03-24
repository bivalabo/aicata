// ============================================================
// Aicata Design Engine — Prompt Composer (Gen-3)
// テンプレートベースのプロンプト構築
// ============================================================

import type {
  DesignContext,
  PageTemplate,
  UrlAnalysisResult,
} from "./types";
import { getIndustryKnowledge } from "./knowledge/industries";
import { getCssPattern } from "./knowledge/css-patterns";
import { assembleFullHtml } from "./page-assembler";

// ============================================================
// Gen-3 コアプロンプト
// ============================================================

const GEN3_CORE_PROMPT = `あなたは「Aicata（あいかた）」— 日本のShopifyストア運営者のための AI デザインディレクターです。
高品質なテンプレートをベースに、ユーザーのブランドに最適化されたページを作り上げるパートナーです。

## 行動方針（最重要）

### 1. テンプレートベース生成
- あなたには高品質なベーステンプレートのHTML/CSSが提供されます
- **このテンプレートの構造・デザイン品質を維持しながら**、ユーザーの要望に合わせてカスタマイズしてください
- テンプレートを無視してゼロから作り直すことは**禁止**です

### 2. 情報に応じて適切に行動する
- ユーザーが【業種】【雰囲気】【ターゲット】などの構造化された情報を提供している場合 → **質問せず、即座にページを生成**
- ユーザーがざっくりした依頼の場合 → 簡潔に2〜3個だけ質問してから作成
- 修正依頼の場合 → 即座に修正版を生成

### 3. カスタマイズの範囲
テンプレートに対して以下のカスタマイズを行ってください:
- **テキスト**: {{PLACEHOLDER}} をブランドに合った魅力的なコピーに置換
- **画像**: placehold.co のURLを適切なサイズ・色で生成
- **カラー**: CSS変数（:root内）の色をブランドイメージに合わせて調整
- **フォント**: 必要に応じてGoogle Fontsを変更
- **セクション**: 不要なセクションの削除、順序変更は可
- **コピーライティング**: eコマースとして「売れる」文章を意識。CTAは明確に

### 4. コンバージョン意識
美しいだけでなく、**商品が売れるページ**を作ることが最重要:
- ファーストビューにCTAを必ず配置
- 商品の価値提案を明確に
- 社会的証明（レビュー、メディア掲載）を活用
- 購入導線をシンプルに

### 5. 会話のトーン
- 親しみやすいが、プロフェッショナル
- 説明は簡潔に（2〜3文）。長文で語らない
- 通常の相談にはマーカーを使わずテキストで回答

## 出力フォーマット（ページ生成時）

ページを作成・修正する際は、**必ず**以下のマーカーでHTMLコードを囲んでください。

（簡潔な説明 — 2〜3文。**必ず現在進行形**で書くこと。例:「〜を作成しています」「〜をデザインしています」。「作成しました」「最適化しました」のような完了形は**禁止**。ストリーミング中にユーザーが読むため、生成中であることが伝わる表現にすること）

---PAGE_START---
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">

<style>
:root { /* デザイントークン */ }
/* 全セクションのCSS */
</style>

<header data-section-id="...">...</header>
<section data-section-id="...">...</section>
---PAGE_END---

## 出力ルール（厳守）
- ---PAGE_START--- と ---PAGE_END--- のマーカーは**必ず**使用する
- 各セクションの最外ラッパーに data-section-id 属性を維持する
- **CSSを先に出力し、その後にHTMLを出力する**（ストリーミング中断時でもスタイルが適用されるため）
- CSS は必ず <style> タグ内に書く（インラインstyle属性は禁止）
- 外部フレームワーク禁止。Google Fonts のみ許可
- 画像: https://placehold.co/幅x高さ/背景色/文字色 を使用
- レスポンシブ: モバイルファースト
- 修正時もページ全体を ---PAGE_START--- 〜 ---PAGE_END--- で出力する`;

// ============================================================
// Gen-2 コアプロンプト（後方互換 — テンプレートなし時のフォールバック）
// ============================================================

const LEGACY_CORE_PROMPT = `あなたは「Aicata（あいかた）」— 日本のShopifyストア運営者のための AI ページビルダーです。
ユーザーと対話しながら、最高品質のページを一緒に作り上げるパートナーです。

## 行動方針（最重要）

### 1. 情報に応じて適切に行動する
- ユーザーが【業種】【雰囲気】【ターゲット】などの構造化された情報を提供している場合 → **質問せず、即座にページを生成してください**（UIでヒアリング済み）
- ユーザーがざっくりした依頼（「トップページ作って」など情報不足）の場合 → 簡潔に2〜3個だけ質問してから作成
- 修正依頼の場合 → 即座に修正版を生成

### 2. ページ生成の原則
- 迷わずまず形にする。修正は後からいくらでもできる
- 生成するときは簡潔な説明文（2〜3文）のあとにコードを出力する

### 3. 会話のトーン
- 親しみやすいが、プロフェッショナル
- 相手の要望に寄り添い、的確な提案をする
- 説明は簡潔に（2〜3文）。長文で語らない
- 通常の相談（SEO、運営アドバイス等）にはマーカーを使わずテキストで回答

## 出力フォーマット（ページ生成時）

ページを作成・修正する際は、**必ず**以下のマーカーでHTMLコードを囲んでください。これがないとプレビューに表示されません。

（簡潔な説明 — 2〜3文。**必ず現在進行形**で書くこと。例:「〜を作成しています」「〜をデザインしています」。「作成しました」「最適化しました」のような完了形は**禁止**。ストリーミング中にユーザーが読むため、生成中であることが伝わる表現にすること）

---PAGE_START---
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">

<style>
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", sans-serif; line-height: 1.6; color: #333; -webkit-font-smoothing: antialiased; }
img { max-width: 100%; height: auto; display: block; }
a { text-decoration: none; color: inherit; }
/* セクション固有のCSS... */
</style>

<header>...</header>
<section class="hero">...</section>
（その他のセクション）
---PAGE_END---

## 出力ルール（厳守）
- ---PAGE_START--- と ---PAGE_END--- のマーカーは**必ず**使用する
- **CSSを先に出力し、その後にHTMLを出力する**（ストリーム中断時でもスタイルが適用されるため）
- CSS は必ず <style> タグ内に書く（インラインstyle属性は禁止）
- 外部フレームワーク禁止（Bootstrap, Tailwind CDN等）。Google Fonts のみ許可
- 画像: https://placehold.co/幅x高さ/背景色/文字色 を使用
- レスポンシブ: モバイルファースト → @media (min-width: 768px) → @media (min-width: 1024px)
- 修正時もページ全体を ---PAGE_START--- 〜 ---PAGE_END--- で出力する`;

const REMINDER = `---

**リマインダー: ページを生成する場合は必ず ---PAGE_START--- と ---PAGE_END--- マーカーで囲んでください。マーカーがないとプレビューに表示されません。**`;

// ============================================================
// Gen-3: テンプレートベースのプロンプト構築
// ============================================================

/**
 * Gen-3 プロンプト: テンプレートHTML/CSSを含む完全なシステムプロンプト
 */
export function composeGen3Prompt(
  context: DesignContext,
  selectedTemplate: PageTemplate,
  urlAnalysis?: UrlAnalysisResult,
): string {
  const sections: string[] = [];

  // urlAnalysis が渡されている場合、context にも反映（buildContextInstructions の分岐用）
  const effectiveContext: DesignContext = urlAnalysis
    ? { ...context, urlAnalysis }
    : context;

  // 1. Gen-3コアプロンプト
  sections.push(GEN3_CORE_PROMPT);

  // 2. テンプレートHTML/CSS全文
  const assembledHtml = assembleFullHtml(selectedTemplate);
  sections.push(buildTemplateSection(selectedTemplate, assembledHtml));

  // 3. URL解析結果（ある場合）
  if (urlAnalysis) {
    sections.push(buildUrlAnalysisSection(urlAnalysis));
  }

  // 4. コンテキスト固有の指示
  const contextInstructions = buildContextInstructions(effectiveContext);
  if (contextInstructions) {
    sections.push(contextInstructions);
  }

  // 5. リマインダー
  sections.push(REMINDER);

  return sections.join("\n\n");
}

/**
 * Gen-3 プロンプト（キャッシュ分割版）
 * [0] = static部分（コアプロンプト + テンプレート）← cache_control: ephemeral
 * [1] = dynamic部分（URL解析 + コンテキスト）
 */
export function composeGen3PromptWithCache(
  context: DesignContext,
  selectedTemplate: PageTemplate,
  urlAnalysis?: UrlAnalysisResult,
): [string, string] {
  const assembledHtml = assembleFullHtml(selectedTemplate);

  // urlAnalysis が渡されている場合、context にも反映
  const effectiveContext: DesignContext = urlAnalysis
    ? { ...context, urlAnalysis }
    : context;

  // Static: コアプロンプト + テンプレート（再利用可能）
  const staticPart = [
    GEN3_CORE_PROMPT,
    buildTemplateSection(selectedTemplate, assembledHtml),
  ].join("\n\n");

  // Dynamic: URL解析 + コンテキスト（リクエストごとに変わる）
  const dynamicParts: string[] = [];
  if (urlAnalysis) {
    dynamicParts.push(buildUrlAnalysisSection(urlAnalysis));
  }
  const contextInstructions = buildContextInstructions(effectiveContext);
  if (contextInstructions) {
    dynamicParts.push(contextInstructions);
  }
  dynamicParts.push(REMINDER);

  return [staticPart, dynamicParts.join("\n\n")];
}

// ============================================================
// レガシー互換: Gen-2 プロンプト（テンプレートなし）
// ============================================================

/**
 * Gen-2 プロンプト: 業界知識 + CSSパターンベース（後方互換）
 */
export function composeDesignPrompt(context: DesignContext): string {
  const sections: string[] = [];

  sections.push(LEGACY_CORE_PROMPT);

  const industry = getIndustryKnowledge(context.industry);
  sections.push(`\n---\n\n# デザインガイドライン\n\n${industry.designPrinciples}`);

  const patternsToInclude = context.cssFeatures.slice(0, 2);
  for (const featureId of patternsToInclude) {
    const pattern = getCssPattern(featureId);
    if (pattern) {
      sections.push(pattern.promptContent);
    }
  }

  if (industry.exampleSnippets.length > 0) {
    const snippet = industry.exampleSnippets[0];
    sections.push(formatSnippetSection(snippet));
  }

  const contextInstructions = buildContextInstructions(context);
  if (contextInstructions) {
    sections.push(contextInstructions);
  }

  sections.push(REMINDER);

  return sections.join("\n\n");
}

/**
 * Gen-2 キャッシュ分割版（後方互換）
 */
export function composeDesignPromptWithCache(
  context: DesignContext,
): [string, string] {
  const staticPart = LEGACY_CORE_PROMPT;

  const dynamicSections: string[] = [];
  const industry = getIndustryKnowledge(context.industry);
  dynamicSections.push(industry.designPrinciples);

  const patternsToInclude = context.cssFeatures.slice(0, 3);
  for (const featureId of patternsToInclude) {
    const pattern = getCssPattern(featureId);
    if (pattern) {
      dynamicSections.push(pattern.promptContent);
    }
  }

  if (industry.exampleSnippets.length > 0) {
    dynamicSections.push(
      formatSnippetSection(industry.exampleSnippets[0]),
    );
  }

  const contextInstructions = buildContextInstructions(context);
  if (contextInstructions) {
    dynamicSections.push(contextInstructions);
  }

  dynamicSections.push(REMINDER);

  return [staticPart, dynamicSections.join("\n\n")];
}

// ============================================================
// ヘルパー関数
// ============================================================

function buildTemplateSection(
  template: PageTemplate,
  assembledHtml: string,
): string {
  return `---

# ベーステンプレート: ${template.name}

${template.description}

**以下のHTML/CSSをベースにカスタマイズしてください。構造・デザイン品質を維持しつつ、ユーザーの要望に合わせて {{PLACEHOLDER}} を置換し、色・フォント・テキストを調整してください。**

<base_template>
---PAGE_START---
${assembledHtml}
---PAGE_END---
</base_template>

上記テンプレートの :root 内のCSS変数がデザイントークンです。色やフォントの変更はここを修正してください。`;
}

function buildUrlAnalysisSection(urlAnalysis: UrlAnalysisResult): string {
  const parts: string[] = [
    `---\n\n# 既存サイト分析結果\n\nURL: ${urlAnalysis.url}`,
  ];

  if (urlAnalysis.title) {
    parts.push(`サイトタイトル: ${urlAnalysis.title}`);
  }

  // テキストコンテンツ
  if (urlAnalysis.texts.length > 0) {
    parts.push("\n## 抽出テキスト（そのまま or ブラッシュアップして使用）");
    const headings = urlAnalysis.texts.filter(
      (t) => t.role === "heading" || t.role === "subheading",
    );
    const bodies = urlAnalysis.texts.filter((t) => t.role === "body");
    const ctas = urlAnalysis.texts.filter((t) => t.role === "cta");

    if (headings.length > 0) {
      parts.push(
        "見出し:\n" + headings.map((t) => `- ${t.content}`).join("\n"),
      );
    }
    if (bodies.length > 0) {
      parts.push(
        "本文:\n" +
          bodies
            .slice(0, 5)
            .map((t) => `- ${t.content.slice(0, 200)}`)
            .join("\n"),
      );
    }
    if (ctas.length > 0) {
      parts.push("CTA:\n" + ctas.map((t) => `- ${t.content}`).join("\n"));
    }
  }

  // 画像
  if (urlAnalysis.images.length > 0) {
    parts.push("\n## 抽出画像（テンプレートの画像プレースホルダーに配置）");
    parts.push(
      urlAnalysis.images
        .slice(0, 8)
        .map(
          (img) =>
            `- ${img.context}: ${img.src}${img.alt ? ` (${img.alt})` : ""}`,
        )
        .join("\n"),
    );
  }

  // 色
  if (urlAnalysis.colors.length > 0) {
    parts.push(
      `\n## 検出カラー: ${urlAnalysis.colors.slice(0, 6).join(", ")}`,
    );
    parts.push(
      "これらの色を参考にデザイントークンを調整してください。",
    );
  }

  parts.push(
    "\n**指示**: 上記の既存サイトのコンテンツを、テンプレートに流し込んでください。テキストはそのまま使うか、よりeコマースに効果的な表現にブラッシュアップしてください。",
  );

  return parts.join("\n");
}

function buildContextInstructions(context: DesignContext): string | null {
  const parts: string[] = [];

  if (context.brandName) {
    parts.push(
      `- ブランド名「${context.brandName}」に合わせたデザインにしてください`,
    );
  }

  if (context.referenceUrl) {
    // urlAnalysis が DesignContext に直接セットされている場合、
    // または外部パラメータとして渡されている場合は重複を避ける
    // （URL解析セクションは buildUrlAnalysisSection で別途出力されるため）
    if (!context.urlAnalysis) {
      parts.push(
        `- 参考URL: ${context.referenceUrl} のデザインテイストを参考にしてください`,
      );
    }
  }

  if (context.tones.length > 0) {
    const toneNames = context.tones.map(toneToJapanese).join("、");
    parts.push(`- デザイントーン: ${toneNames}を意識してください`);
  }

  if (context.keywords.length > 0) {
    parts.push(
      `- ユーザーが求めるイメージ: ${context.keywords.join("、")}`,
    );
  }

  // ターゲットオーディエンス情報
  if (context.audienceText) {
    // フリーテキスト入力がある場合（カスタムまたは構造化テキスト）
    parts.push(
      `- ターゲット顧客: ${context.audienceText}`,
    );
    parts.push(
      `- このターゲット層に最も響くデザイン・コピー・配色を意識してください。具体的には、ターゲットの年齢層・嗜好・購買動機に合わせたトーン&マナーを徹底してください`,
    );
  } else if (context.audience && context.audience !== "broad") {
    const audienceLabel = audienceToJapanese(context.audience);
    parts.push(`- ターゲット顧客: ${audienceLabel}`);
  }

  if (parts.length === 0) return null;

  return `## このリクエスト固有の指示\n${parts.join("\n")}`;
}

function formatSnippetSection(snippet: {
  name: string;
  description: string;
  html: string;
  css: string;
}): string {
  return `
### 参考デザイン: ${snippet.name}

${snippet.description}。この品質レベルを目指してください。

<reference_code>
${snippet.html}

<style>
${snippet.css}
</style>
</reference_code>

上記は参考です。ユーザーの要望に合わせてカスタマイズしてください。`;
}

function audienceToJapanese(audience: string): string {
  const map: Record<string, string> = {
    individual: "個人消費者（B2C）",
    business: "法人・ビジネス（B2B）",
    young: "若年層（10〜20代）",
    "young-adult": "若手社会人（20〜30代）",
    middle: "ミドル世代（40〜50代）",
    senior: "シニア層（60代〜）",
    premium: "品質・本物志向の顧客",
    family: "ファミリー層",
    women: "女性",
    men: "男性",
    "eco-conscious": "エコ・サステナブル志向の顧客",
    gift: "ギフト・贈り物を探している顧客",
    broad: "幅広い層",
  };
  return map[audience] ?? audience;
}

function toneToJapanese(tone: string): string {
  const map: Record<string, string> = {
    luxury: "高級感",
    natural: "ナチュラル",
    modern: "モダン",
    playful: "ポップ・楽しさ",
    minimal: "ミニマル",
    bold: "大胆・インパクト",
    elegant: "エレガント",
    warm: "あたたかみ",
    cool: "クール",
    traditional: "和風・伝統",
  };
  return map[tone] ?? tone;
}
