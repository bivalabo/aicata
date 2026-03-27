// ============================================================
// DDP Stage 1: Design Director（デザインディレクター）
//
// AIが「考える」ステージ。HTMLを一切書かない。
// 入力を分析し、デザイン設計図（DesignSpec）をJSONで出力する。
//
// なぜJSON？
//   - 出力が小さい（~2000トークン）ので確実に完成する
//   - 構造化されているのでパース・検証が容易
//   - デザインの「なぜ」を記録し、Stage 2 に伝達できる
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import type { DesignSpec, DDPInput, DDPConfig } from "./types";
import { ecommerceEngine } from "./engines/ecommerce";
import { classifyImages, buildImageStrategyPrompt } from "./media-strategy";
import type { EngineContext } from "./engines/types";

/** 静的なプロンプトベース — エンジン知識を動的に注入 */
const DESIGN_DIRECTOR_PROMPT_BASE = `あなたは世界最高峰のECデザインディレクターです。
データドリブンなデザイン思考と、日本市場の消費者心理に精通しています。
コードは一切書きません。デザインの設計図（JSON）を出力してください。

あなたの仕事:
1. ブランドと業界を深く分析し、最適なデザイン方針を決定する
2. ユーザーの目線がどう流れるか（Eye Flow）を設計する
3. コンバージョンに最適なセクション構成を決める
4. 色・フォント・トーンを理由付きで選定する
5. 各セクションに「売れるコピー」を書く

## 出力フォーマット

以下のJSON構造を **必ず** そのまま出力してください。JSONのみ出力し、他のテキストは含めないでください。

\`\`\`json
{
  "designPhilosophy": "このページの全体的なデザイン方針（1-2文）",
  "eyeFlow": "ユーザーの視線誘導の設計（ファーストビュー→CTA→商品→信頼→最終CTA）",
  "conversionStrategy": "どうやって購入/行動に導くかの戦略",
  "colors": {
    "primary": "#hex値",
    "secondary": "#hex値",
    "accent": "#hex値",
    "background": "#hex値",
    "text": "#hex値",
    "reasoning": "なぜこの配色を選んだか（心理学的根拠を含む）"
  },
  "typography": {
    "headingFont": "フォント名",
    "bodyFont": "フォント名",
    "googleFontsUrl": "https://fonts.googleapis.com/css2?family=...",
    "reasoning": "なぜこのフォントか"
  },
  "sections": [
    {
      "id": "section-id",
      "purpose": "このセクションの役割",
      "category": "hero|features|testimonial|cta|products|story|faq|footer|navigation|...",
      "visualStyle": "このセクションの視覚的特徴",
      "layout": "full-width|contained|split|grid|centered",
      "backgroundStyle": "背景の色やパターン",
      "animation": "アニメーション（任意）",
      "contentBrief": {
        "heading": "実際の見出しテキスト",
        "subheading": "サブ見出し",
        "bodyText": "本文テキスト",
        "ctaText": "CTAボタンのテキスト",
        "ctaLink": "#リンク先",
        "imageDescriptions": ["画像1の説明", "画像2の説明"],
        "listItems": [{"title": "項目名", "description": "説明"}],
        "additionalNotes": "その他の指示"
      }
    }
  ],
  "responsiveStrategy": "モバイル対応の方針",
  "toneDescription": "全体のトーン&マナー"
}
\`\`\`

## 重要: contentBrief のテキストは実際のコンテンツ

"heading" や "bodyText" にプレースホルダーを入れないでください。
実際のブランドに合った、売れるコピーライティングを書いてください。`;

/**
 * エンジン知識を注入した完全なシステムプロンプトを構築
 */
function buildDirectorSystemPrompt(input: DDPInput): string {
  const ctx = buildEngineContext(input);
  const knowledge = ecommerceEngine.getDirectorKnowledge(ctx);

  return `${DESIGN_DIRECTOR_PROMPT_BASE}

${knowledge.corePrinciples}

${knowledge.industryGuidance}

${knowledge.conversionStrategy}

${knowledge.psychologyInsights}

${knowledge.antiPatterns}`;
}

/**
 * Stage 1: Design Director
 * ブランド情報と要件を分析し、DesignSpec（JSON）を生成する
 */
export async function generateDesignSpec(
  client: Anthropic,
  input: DDPInput,
  config: DDPConfig,
): Promise<DesignSpec> {
  const systemPrompt = buildDirectorSystemPrompt(input);
  const userPrompt = buildDirectorUserPrompt(input);

  const response = await client.messages.create({
    model: config.specModel,
    max_tokens: config.specMaxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as any).text as string)
    .join("");

  return parseDesignSpec(text);
}

/**
 * ユーザープロンプト構築 — 入力情報を構造化して渡す
 */
function buildDirectorUserPrompt(input: DDPInput): string {
  const parts: string[] = [];

  parts.push(`## 要件`);
  parts.push(`- ページ種別: ${pageTypeToJapanese(input.pageType)}`);
  parts.push(`- 業種: ${input.industry}`);

  if (input.brandName) {
    parts.push(`- ブランド名: ${input.brandName}`);
  }
  if (input.brandStory) {
    parts.push(`- ブランドストーリー: ${input.brandStory}`);
  }
  if (input.targetAudience) {
    parts.push(`- ターゲット顧客: ${input.targetAudience}`);
  }
  if (input.tones.length > 0) {
    parts.push(`- デザイントーン: ${input.tones.join("、")}`);
  }
  if (input.keywords.length > 0) {
    parts.push(`- キーワード: ${input.keywords.join("、")}`);
  }

  // Emotional DNA（感情の地層）— Brand Memoryの最深層
  // ※ Brand Memoryより先に注入することで、感情がデザイン判断の土台になる
  if (input.emotionalDna) {
    const dna = input.emotionalDna;
    parts.push(`\n## ブランドの感情の地層（Emotional DNA）`);
    parts.push(``);
    parts.push(`このストアのオーナーは以下の想いでビジネスを営んでいます。`);
    parts.push(`デザインはこの想いから自然に立ち上がるものにしてください。`);
    parts.push(``);
    parts.push(`### オーナーの原点`);
    parts.push(dna.originStory);
    parts.push(``);
    parts.push(`### 根底にある感情`);
    parts.push(dna.coreEmotion);
    parts.push(``);
    parts.push(`### お客さんへの願い`);
    parts.push(`- 最初の3秒で感じてほしいこと: ${dna.firstImpression}`);
    parts.push(`- 商品を受け取った後に残ってほしい感覚: ${dna.afterFeeling}`);
    parts.push(`- お客さんになってほしい表情: ${dna.customerFace}`);
    parts.push(``);
    parts.push(`### 目指す空気感`);
    dna.atmosphere.forEach((a: string) => parts.push(`- ${a}`));
    parts.push(``);
    parts.push(`### 避けたい空気感`);
    dna.antiAtmosphere.forEach((a: string) => parts.push(`- ${a}`));
    parts.push(``);
    parts.push(`### デザインの方向性（感情から導出）`);
    parts.push(`- トーン: ${dna.derivedTones.join("、")}`);
    parts.push(`- 色の方向性: ${dna.derivedColorMood}`);
    parts.push(`- タイポグラフィの方向性: ${dna.derivedTypographyFeel}`);
    parts.push(``);
    parts.push(`### ブランドのエッセンス`);
    parts.push(`「${dna.essencePhrase}」`);
  }

  // Brand Memory 情報（色・フォント・トーンの具体値）
  if (input.brandMemory) {
    const bm = input.brandMemory;
    parts.push(`\n## ブランドメモリー（確定済みのブランド設定）`);
    if (bm.primaryColor) parts.push(`- メインカラー: ${bm.primaryColor}`);
    if (bm.secondaryColor) parts.push(`- サブカラー: ${bm.secondaryColor}`);
    if (bm.accentColor) parts.push(`- アクセントカラー: ${bm.accentColor}`);
    if (bm.primaryFont) parts.push(`- 見出しフォント: ${bm.primaryFont}`);
    if (bm.bodyFont) parts.push(`- 本文フォント: ${bm.bodyFont}`);
    if (bm.voiceTone) parts.push(`- 語り口: ${bm.voiceTone}`);
    if (bm.copyKeywords.length > 0) parts.push(`- 好む表現: ${bm.copyKeywords.join("、")}`);
    if (bm.avoidKeywords.length > 0) parts.push(`- 避ける表現: ${bm.avoidKeywords.join("、")}`);
  }

  // URL解析結果
  if (input.urlAnalysis) {
    const ua = input.urlAnalysis;
    parts.push(`\n## 既存サイト分析（リビルド元）`);
    parts.push(`- URL: ${ua.url}`);
    if (ua.title) parts.push(`- サイトタイトル: ${ua.title}`);
    if (ua.headings.length > 0) {
      parts.push(`- 見出し: ${ua.headings.slice(0, 8).join(" / ")}`);
    }
    if (ua.bodyTexts.length > 0) {
      parts.push(`- 主要テキスト:`);
      ua.bodyTexts.slice(0, 5).forEach(t => parts.push(`  - ${t.slice(0, 200)}`));
    }
    if (ua.images.length > 0) {
      parts.push(`- 画像: ${ua.images.slice(0, 6).map(img => `${img.context}: ${img.src}`).join(", ")}`);
    }
    if (ua.colors.length > 0) {
      parts.push(`- 検出カラー: ${ua.colors.slice(0, 6).join(", ")}`);
    }
    if (ua.fonts.length > 0) {
      parts.push(`- 検出フォント: ${ua.fonts.join(", ")}`);
    }
    parts.push(`\n既存コンテンツを活かしつつ、デザインを一新してください。`);

    // 画像戦略: 元サイトの画像を分類し、最適な方針をプロンプトに注入
    if (ua.images.length > 0) {
      const strategy = classifyImages(ua.images, input.industry);
      const strategyPrompt = buildImageStrategyPrompt(ua.images, strategy);
      if (strategyPrompt) {
        parts.push(strategyPrompt);
      }
      // メディア戦略はpipeline.tsで直接計算されるため、ここでの保存は不要
    }
  }

  // ユーザー指示
  if (input.userInstructions) {
    parts.push(`\n## ユーザーからの指示`);
    parts.push(input.userInstructions);
  }

  // ページ種別に応じたセクション推奨（エンジン駆動）
  parts.push(`\n## 推奨セクション構成`);
  const ctx = buildEngineContext(input);
  const engineSections = ecommerceEngine.getRecommendedSections(input.pageType, ctx);
  if (engineSections.length > 0) {
    engineSections.forEach((sec, i) => {
      const marker = sec.priority === "required" ? "【必須】" : sec.priority === "recommended" ? "【推奨】" : "【任意】";
      parts.push(`${i + 1}. ${sec.category} — ${sec.purpose} ${marker}`);
      parts.push(`   理由: ${sec.businessReason}`);
    });
  } else {
    parts.push(getRecommendedSections(input.pageType));
  }

  parts.push(`\n上記の情報をもとに、最適なDesignSpec（JSON）を出力してください。`);

  return parts.join("\n");
}

/**
 * AIの出力からDesignSpecをパース
 * JSONブロックの抽出 + バリデーション
 */
function parseDesignSpec(text: string): DesignSpec {
  // Try to extract JSON from code block first
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

  // If the text starts with { and ends with }, try parsing directly
  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // Try to find the first { and last } and parse that
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        parsed = JSON.parse(jsonStr.slice(firstBrace, lastBrace + 1));
      } catch {
        throw new Error(
          `Design Specのパースに失敗しました。AIの出力:\n${text.slice(0, 500)}`,
        );
      }
    } else {
      throw new Error(
        `Design SpecのJSONが見つかりません。AIの出力:\n${text.slice(0, 500)}`,
      );
    }
  }

  // Validate required fields and provide defaults
  return {
    designPhilosophy: parsed.designPhilosophy || "モダンで信頼感のあるデザイン",
    eyeFlow: parsed.eyeFlow || "上から下へ自然な視線誘導",
    conversionStrategy: parsed.conversionStrategy || "明確なCTAで購入に導く",
    colors: {
      primary: parsed.colors?.primary || "#2563eb",
      secondary: parsed.colors?.secondary || "#64748b",
      accent: parsed.colors?.accent || "#f59e0b",
      background: parsed.colors?.background || "#ffffff",
      text: parsed.colors?.text || "#1e293b",
      reasoning: parsed.colors?.reasoning || "",
    },
    typography: {
      headingFont: parsed.typography?.headingFont || "Noto Sans JP",
      bodyFont: parsed.typography?.bodyFont || "Noto Sans JP",
      googleFontsUrl:
        parsed.typography?.googleFontsUrl ||
        "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap",
      reasoning: parsed.typography?.reasoning || "",
    },
    sections: (parsed.sections || []).map((s: any) => ({
      id: s.id || `section-${Math.random().toString(36).slice(2, 8)}`,
      purpose: s.purpose || "",
      category: s.category || "general",
      visualStyle: s.visualStyle || "",
      layout: s.layout || "contained",
      backgroundStyle: s.backgroundStyle || "",
      animation: s.animation,
      contentBrief: {
        heading: s.contentBrief?.heading,
        subheading: s.contentBrief?.subheading,
        bodyText: s.contentBrief?.bodyText,
        ctaText: s.contentBrief?.ctaText,
        ctaLink: s.contentBrief?.ctaLink,
        imageDescriptions: s.contentBrief?.imageDescriptions || [],
        listItems: s.contentBrief?.listItems || [],
        additionalNotes: s.contentBrief?.additionalNotes,
      },
    })),
    responsiveStrategy:
      parsed.responsiveStrategy || "モバイルファースト、768px/1024pxブレークポイント",
    toneDescription: parsed.toneDescription || "",
  };
}

/**
 * DDPInput → EngineContext 変換
 */
function buildEngineContext(input: DDPInput): EngineContext {
  return {
    pageType: input.pageType,
    industry: input.industry,
    tones: input.tones,
    targetAudience: input.targetAudience,
    brandName: input.brandName,
    locale: "ja-JP",
  };
}

function pageTypeToJapanese(pageType: string): string {
  const map: Record<string, string> = {
    landing: "トップページ（ランディング）",
    product: "商品詳細ページ",
    collection: "コレクション/カテゴリーページ",
    "list-collections": "コレクション一覧ページ",
    cart: "カートページ",
    blog: "ブログ一覧ページ",
    article: "ブログ記事ページ",
    about: "会社概要/ブランドストーリーページ",
    contact: "お問い合わせページ",
    search: "検索結果ページ",
    account: "アカウントページ",
    password: "パスワード保護ページ",
    "404": "404エラーページ",
    general: "汎用ページ",
  };
  return map[pageType] || pageType;
}

function getRecommendedSections(pageType: string): string {
  const recommendations: Record<string, string> = {
    landing: `トップページには以下のセクションを推奨:
1. navigation — ヘッダー・ロゴ・ナビゲーション
2. hero — ファーストビュー・メインビジュアル・CTA
3. features — 特徴・USP（3〜4項目）
4. products — 注目商品カード群
5. story — ブランドストーリー・哲学
6. testimonials — お客様の声・レビュー
7. cta — 最終CTA・ニュースレター登録
8. footer — フッター・リンク集`,

    product: `商品詳細ページには以下のセクションを推奨:
1. navigation — ヘッダー
2. breadcrumb — パンくずリスト
3. product-gallery — 商品画像ギャラリー
4. product-info — 商品名・価格・バリアント・カートボタン
5. product-description — 商品説明（タブ/アコーディオン）
6. product-reviews — カスタマーレビュー
7. related-products — 関連商品
8. footer — フッター`,

    collection: `コレクションページには以下のセクションを推奨:
1. navigation — ヘッダー
2. collection-banner — コレクションバナー
3. collection-filter — フィルター&ソート
4. collection-grid — 商品グリッド
5. cta — CTA
6. footer — フッター`,

    about: `ブランドストーリーページには以下のセクションを推奨:
1. navigation — ヘッダー
2. hero — ブランドビジュアル
3. story — 創業ストーリー
4. philosophy — 理念・ミッション
5. team — チーム紹介（任意）
6. cta — お問い合わせCTA
7. footer — フッター`,

    contact: `お問い合わせページには以下のセクションを推奨:
1. navigation — ヘッダー
2. contact-hero — ページタイトル
3. contact-form — お問い合わせフォーム
4. contact-info — 所在地・営業時間・電話番号
5. faq — よくある質問
6. footer — フッター`,
  };

  return (
    recommendations[pageType] ||
    `ページの目的に最適なセクション構成を5〜8セクションで設計してください。
必ず navigation（ヘッダー）と footer（フッター）を含めてください。`
  );
}
