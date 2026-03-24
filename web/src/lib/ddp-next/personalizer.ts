// ============================================================
// DDP Next — Phase 4: Content Personalizer
// プレースホルダーをブランド固有のコピーに置換
//
// AI使用: ここだけ（コピーライティング）
// セクション構造は一切変更しない。テキストのみ。
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import type {
  ContentRequirements,
  AssembledPage,
  PersonalizedPage,
} from "./types";

// ============================================================
// プレースホルダー → コンテキスト情報マッピング
// ============================================================

/** プレースホルダーの種別を推定 */
function classifyPlaceholder(name: string): {
  type: "heading" | "body" | "cta" | "tagline" | "meta" | "image" | "url" | "alt";
  maxLength: number;
  description: string;
} {
  const n = name.toUpperCase();

  // ALT テキスト系（画像のalt属性 — テキストとして扱う）
  if (n.includes("ALT")) {
    return { type: "alt", maxLength: 60, description: "画像の代替テキスト" };
  }

  // 画像系（URL/パスとして使われるもの）
  if (n.includes("IMAGE") || n.includes("IMG") || n.includes("SRC") || n.includes("PHOTO") || n.includes("BACKGROUND_IMAGE")) {
    return { type: "image", maxLength: 200, description: "画像URL" };
  }

  // URL系
  if (n.includes("URL") || n.includes("LINK") || n.includes("HREF")) {
    return { type: "url", maxLength: 200, description: "リンクURL" };
  }

  // CTA系
  if (n.includes("CTA") || n.includes("BUTTON") || n.includes("ACTION")) {
    return { type: "cta", maxLength: 20, description: "CTAボタンテキスト" };
  }

  // タグライン系
  if (n.includes("TAGLINE") || n.includes("SLOGAN") || n.includes("SUBTITLE")) {
    return { type: "tagline", maxLength: 60, description: "タグライン・サブタイトル" };
  }

  // 見出し系
  if (n.includes("HEADING") || n.includes("TITLE") || n.includes("NAME")) {
    return { type: "heading", maxLength: 40, description: "見出しテキスト" };
  }

  // メタ系
  if (n.includes("DESCRIPTION") || n.includes("META")) {
    return { type: "meta", maxLength: 160, description: "メタディスクリプション" };
  }

  // デフォルト: 本文
  return { type: "body", maxLength: 150, description: "本文テキスト" };
}

// ============================================================
// プロンプト構築
// ============================================================

function buildPersonalizationPrompt(
  placeholders: string[],
  requirements: ContentRequirements,
): string {
  const classified = placeholders.map((p) => {
    const clean = p.replace(/\{\{|\}\}/g, "");
    const info = classifyPlaceholder(clean);
    return { placeholder: p, name: clean, ...info };
  });

  // 画像URL・リンクURLはAIに生成させない（プレースホルダーのまま残すか、デフォルト画像を使う）
  const textPlaceholders = classified.filter(
    (c) => c.type !== "image" && c.type !== "url",
  );

  if (textPlaceholders.length === 0) {
    return ""; // テキスト置換が不要
  }

  const { brandName, industry, tones, targetAudience, additionalNotes } =
    requirements;

  const toneDesc = tones.join("・");
  const audienceDesc = targetAudience || "一般消費者";

  let prompt = `あなたはEC/ブランドサイトのコピーライターです。
以下の情報に基づいて、各プレースホルダーに適切な日本語コピーを生成してください。

## ブランド情報
- ブランド名: ${brandName}
- 業種: ${industry}
- トーン: ${toneDesc}
- ターゲット: ${audienceDesc}
${additionalNotes ? `- 補足: ${additionalNotes}` : ""}

## ルール
- 各コピーは指定文字数以内に収めてください
- ブランドのトーンに一致する表現を使ってください
- 日本語で書いてください（ブランド名は英語のままでOK）
- HTMLタグは含めないでください
- 各行を「PLACEHOLDER_NAME: テキスト」の形式で出力してください

## プレースホルダー一覧
`;

  for (const p of textPlaceholders) {
    prompt += `- ${p.name} (${p.description}, 最大${p.maxLength}文字)\n`;
  }

  prompt += `\n## 出力形式
各プレースホルダーに対して1行ずつ、以下の形式で出力してください：
PLACEHOLDER_NAME: 生成されたテキスト

例：
HERO_HEADING: ${brandName}で叶える、本物の美しさ
HERO_TAGLINE: あなたの肌に寄り添う、至高のスキンケア
CTA_PRIMARY: 今すぐ見る
`;

  return prompt;
}

// ============================================================
// AIレスポンスの解析
// ============================================================

function parsePersonalizationResponse(
  text: string,
  placeholders: string[],
): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = text.split("\n").filter((l) => l.trim());

  for (let line of lines) {
    // 先頭のマークダウンリスト記号を除去
    line = line.replace(/^[\s]*[-*•]\s*/, "").trim();

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim().toUpperCase();
    const value = line.slice(colonIdx + 1).trim();

    // プレースホルダーリストに対応するキーか確認
    const matchingPlaceholder = placeholders.find(
      (p) => p.replace(/\{\{|\}\}/g, "") === key,
    );

    if (matchingPlaceholder && value) {
      result[matchingPlaceholder] = value;
    }
  }

  return result;
}

// ============================================================
// Public API
// ============================================================

/**
 * Phase 4: プレースホルダーをブランド固有のコピーに置換
 *
 * @param assembled Phase 3の組立結果
 * @param requirements コンテンツ要件
 * @param anthropicClient Anthropicクライアント（外部から注入）
 * @returns パーソナライズ済みページ
 */
export async function personalizeContent(
  assembled: AssembledPage,
  requirements: ContentRequirements,
  anthropicClient: Anthropic,
  model?: string,
): Promise<PersonalizedPage> {
  const { fullDocument, placeholders } = assembled;

  // テキスト系プレースホルダーのみフィルタ
  const textPlaceholders = placeholders.filter((p) => {
    const clean = p.replace(/\{\{|\}\}/g, "");
    const info = classifyPlaceholder(clean);
    return info.type !== "image" && info.type !== "url";
  });

  // テキストプレースホルダーがない場合はそのまま返す
  if (textPlaceholders.length === 0) {
    return {
      fullDocument,
      replacedCount: 0,
      generatedContent: {},
    };
  }

  // ── AI呼び出し: コピーライティング ──
  const prompt = buildPersonalizationPrompt(placeholders, requirements);

  if (!prompt) {
    return {
      fullDocument,
      replacedCount: 0,
      generatedContent: {},
    };
  }

  const resolvedModel = model || process.env.CLAUDE_MODEL_DEFAULT || "claude-sonnet-4-20250514";

  const response = await anthropicClient.messages.create({
    model: resolvedModel,
    max_tokens: 2000,
    system: "あなたはプロフェッショナルなブランドコピーライターです。簡潔で洗練されたコピーを書いてください。",
    messages: [{ role: "user", content: prompt }],
  });

  const responseText = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as any).text as string)
    .join("");

  const generatedContent = parsePersonalizationResponse(
    responseText,
    placeholders,
  );

  // ── プレースホルダー置換 ──
  let personalizedDocument = fullDocument;
  let replacedCount = 0;

  for (const [placeholder, content] of Object.entries(generatedContent)) {
    if (personalizedDocument.includes(placeholder)) {
      personalizedDocument = personalizedDocument.replaceAll(
        placeholder,
        content,
      );
      replacedCount++;
    }
  }

  // ── ブランド名の直接置換 ──
  const brandNamePlaceholders = ["{{BRAND_NAME}}", "{{SHOP_NAME}}", "{{STORE_NAME}}"];
  for (const bp of brandNamePlaceholders) {
    if (personalizedDocument.includes(bp) && requirements.brandName) {
      personalizedDocument = personalizedDocument.replaceAll(
        bp,
        requirements.brandName,
      );
      if (!generatedContent[bp]) {
        generatedContent[bp] = requirements.brandName;
        replacedCount++;
      }
    }
  }

  return {
    fullDocument: personalizedDocument,
    replacedCount,
    generatedContent,
  };
}

/**
 * 残留プレースホルダーをすべてクリーンアップ
 * 画像URL → Unsplashプレースホルダー画像
 * テキスト → 空文字列 or デフォルト値
 */
export function cleanupRemainingPlaceholders(html: string): string {
  // 画像系プレースホルダー → Unsplash のプレースホルダー画像
  html = html.replace(
    /\{\{(?:IMAGE_URL|IMAGE|IMG|BACKGROUND_IMAGE|HERO_IMAGE|PRODUCT_\d+_IMAGE|FEATURE_\d+_IMAGE|SRC)[^}]*\}\}/gi,
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop",
  );

  // ALT テキスト → 適切なデフォルト値
  html = html.replace(/\{\{[^}]*ALT[^}]*\}\}/gi, "");

  // URL系 → #
  html = html.replace(/\{\{(?:URL|LINK|HREF)[^}]*\}\}/gi, "#");

  // 残りのテキスト系プレースホルダー → 空文字
  html = html.replace(/\{\{[A-Z][A-Z0-9_]*\}\}/g, "");

  return html;
}

/**
 * AI呼び出しなしのフォールバックパーソナライゼーション
 * ブランド名のみ置換する最低限の処理
 */
export function personalizeContentFallback(
  assembled: AssembledPage,
  requirements: ContentRequirements,
): PersonalizedPage {
  let personalizedDocument = assembled.fullDocument;
  const generatedContent: Record<string, string> = {};
  let replacedCount = 0;

  // ブランド名の直接置換
  const brandName = requirements.brandName || "Brand";
  const brandPlaceholders = ["{{BRAND_NAME}}", "{{SHOP_NAME}}", "{{STORE_NAME}}"];

  for (const bp of brandPlaceholders) {
    if (personalizedDocument.includes(bp)) {
      personalizedDocument = personalizedDocument.replaceAll(bp, brandName);
      generatedContent[bp] = brandName;
      replacedCount++;
    }
  }

  // 汎用的なフォールバック値（日本語）
  const FALLBACK_VALUES: Record<string, string> = {
    "{{HERO_HEADING}}": `${brandName}へようこそ`,
    "{{HERO_TAGLINE}}": "あなたのための特別なコレクション",
    "{{HERO_SUBTITLE}}": "上質な暮らしをお届けします",
    "{{CTA_PRIMARY}}": "コレクションを見る",
    "{{CTA_SECONDARY}}": "詳しく見る",
    "{{ABOUT_HEADING}}": "ブランドストーリー",
    "{{ABOUT_TEXT}}": `${brandName}は、品質と美しさを追求するブランドです。`,
    "{{PRODUCTS_HEADING}}": "おすすめ商品",
    "{{NEWSLETTER_HEADING}}": "ニュースレター",
    "{{NEWSLETTER_TEXT}}": "最新情報をお届けします",
    "{{FOOTER_TEXT}}": `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`,
  };

  for (const [placeholder, value] of Object.entries(FALLBACK_VALUES)) {
    if (personalizedDocument.includes(placeholder)) {
      personalizedDocument = personalizedDocument.replaceAll(
        placeholder,
        value,
      );
      generatedContent[placeholder] = value;
      replacedCount++;
    }
  }

  return {
    fullDocument: personalizedDocument,
    replacedCount,
    generatedContent,
  };
}
