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
import type { EmotionalDNA } from "@/lib/emotional-dna/types";
import { emotionalDnaToPromptContext } from "@/lib/emotional-dna/hearing-engine";

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
  emotionalDna?: EmotionalDNA,
): string {
  const classified = placeholders.map((p) => {
    const clean = p.replace(/\{\{|\}\}/g, "");
    const info = classifyPlaceholder(clean);
    return { placeholder: p, name: clean, ...info };
  });

  // 画像URL・リンクURLはAIに生成させない（プレースホルダーのまま残すか、デフォルト画像を使う）
  // ALT テキストはAIに生成させる（アクセシビリティ + SEO向上）
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

  // EmotionalDNAがある場合、感情の地層をプロンプトに注入
  const emotionalContext = emotionalDna
    ? emotionalDnaToPromptContext(emotionalDna)
    : "";

  let prompt = `あなたは一流のEC/ブランドサイトのコピーライターです。
以下のブランド情報に基づいて、各プレースホルダーに対して魅力的で洗練された日本語コピーを生成してください。

## ブランド情報
- ブランド名: ${brandName}
- 業種: ${industry}
- トーン: ${toneDesc}
- ターゲット: ${audienceDesc}
${additionalNotes ? `- 補足: ${additionalNotes}` : ""}
${emotionalContext ? `\n${emotionalContext}\n` : ""}

## ルール（厳守）
1. **文字数制限**: 各コピーは指定文字数以内に収めてください（特にCTAは短く）
2. **トーン統一**: ブランドのトーンに完全に一致する表現を使ってください
3. **言語**: 日本語で書いてください（ブランド名や外来語は英語/カタカナのままでOK）
4. **HTMLタグ禁止**: プレーンテキストのみ
5. **具体性**: 抽象的な表現を避け、ブランドの特性に合った具体的なコピーを書いてください
6. **感動**: 見出しはユーザーの心に響く、印象的なコピーにしてください
7. **出力形式**: 各行を「PLACEHOLDER_NAME: テキスト」の形式で出力してください

## コピーの品質基準
- ヒーロー見出しは一目で惹きつけるキャッチコピーに
- タグラインはブランドの世界観を簡潔に表現
- CTAは行動を促す短く力強い言葉に（「今すぐ見る」「体験する」など）
- 説明文はベネフィットを明確に伝える
- 商品名は魅力的で覚えやすい名前に
- テスティモニアルはリアルで共感できる声に

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
  emotionalDna?: EmotionalDNA,
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
  const prompt = buildPersonalizationPrompt(placeholders, requirements, emotionalDna);

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
    system: `あなたは日本のトップクラスのブランドコピーライターです。
Apple、無印良品、資生堂のような洗練されたブランドサイトのコピーを手がけてきた経験があります。
ルール:
- 簡潔で印象的なコピーを書く
- ブランドの世界観を一貫して表現する
- 文字数制限を厳守する（特にCTAは短く）
- すべてのプレースホルダーに対して必ず出力する（スキップしない）
- 出力形式: PLACEHOLDER_NAME: テキスト（1行1プレースホルダー）`,
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
      personalizedDocument = personalizedDocument.split(placeholder).join(content);
      replacedCount++;
    }
  }

  // ── ブランド名の直接置換 ──
  const brandNamePlaceholders = ["{{BRAND_NAME}}", "{{SHOP_NAME}}", "{{STORE_NAME}}"];
  for (const bp of brandNamePlaceholders) {
    if (personalizedDocument.includes(bp) && requirements.brandName) {
      personalizedDocument = personalizedDocument.split(bp).join(requirements.brandName);
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

// ── 業種別 Unsplash 画像プール ──
// 各業種に適した高品質画像を複数用意し、ランダムに使い分ける
const INDUSTRY_IMAGES: Record<string, string[]> = {
  beauty: [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop", // cosmetics flat lay
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop", // skincare
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=600&fit=crop", // beauty products
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&h=600&fit=crop", // spa treatment
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop", // face cream
    "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=600&fit=crop", // beauty routine
  ],
  fashion: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop", // fashion accessories
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop", // clothing rack
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop", // shopping
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop", // outfit
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop", // fashion store
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop", // runway
  ],
  food: [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop", // plated food
    "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&h=600&fit=crop", // healthy food
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop", // restaurant
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop", // pizza
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop", // salad bowl
    "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&h=600&fit=crop", // fruits
  ],
  tech: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop", // circuit board
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop", // laptop glow
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop", // tech abstract
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop", // code on screen
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop", // team with laptops
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop", // laptop clean
  ],
  health: [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop", // yoga
    "https://images.unsplash.com/photo-1505576399279-0d754b4a35df?w=800&h=600&fit=crop", // wellness
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop", // meditation
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop", // healthy living
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop", // fitness
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop", // morning routine
  ],
  lifestyle: [
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop", // interior
    "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=600&fit=crop", // home decor
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop", // bedroom
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop", // modern house
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop", // nature lifestyle
    "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=800&h=600&fit=crop", // outdoor living
  ],
  general: [
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop", // business meeting
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop", // analytics
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop", // office
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop", // teamwork
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop", // presentation
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop", // workspace
  ],
};

// セクション別の画像選択ヒント（placeholder名からコンテキストを推定）
function selectImageForPlaceholder(
  placeholderName: string,
  industry: string,
  usedIndices: Map<string, number>,
): string {
  const pool = INDUSTRY_IMAGES[industry] || INDUSTRY_IMAGES.general;
  const key = industry;

  // 使用済みインデックスをトラッキングして同じ画像の重複を防ぐ
  const currentIdx = usedIndices.get(key) ?? 0;
  const idx = currentIdx % pool.length;
  usedIndices.set(key, currentIdx + 1);

  return pool[idx];
}

// 現在のパイプラン内で使用する業種とコンテキスト
let _currentIndustry = "general";
let _currentUserInstructions = "";

/** パイプラインから業種を設定 */
export function setCleanupIndustry(industry: string) {
  _currentIndustry = industry.toLowerCase();
}

/** パイプラインからユーザー指示を設定（セクション名推定に使用） */
export function setCleanupContext(userInstructions: string) {
  _currentUserInstructions = userInstructions;
}

// ── 業種別テキストフォールバック ──
const INDUSTRY_HEADINGS: Record<string, {
  hero: string; about: string; service: string; product: string;
  feature: string; cta: string; contact: string; generic: string;
  heroSub: string; aboutText: string;
}> = {
  food: {
    hero: "おいしい一杯を、あなたに",
    heroSub: "こだわりの素材と丁寧な手仕事で、特別なひとときをお届けします",
    about: "私たちのこだわり",
    aboutText: "素材選びから調理まで、すべてに心を込めています。",
    service: "こだわりのメニュー",
    product: "人気メニュー",
    feature: "選ばれる理由",
    cta: "メニューを見る",
    contact: "ご予約・お問い合わせ",
    generic: "おすすめ",
  },
  beauty: {
    hero: "あなたの美しさを引き出す",
    heroSub: "プロフェッショナルな技術で、理想の美を実現します",
    about: "サロンについて",
    aboutText: "経験豊富なスタッフが、一人ひとりに寄り添ったサービスをご提供します。",
    service: "施術メニュー",
    product: "おすすめケア",
    feature: "選ばれる理由",
    cta: "予約する",
    contact: "ご予約・お問い合わせ",
    generic: "ビューティー",
  },
  fashion: {
    hero: "自分らしいスタイルを見つけよう",
    heroSub: "トレンドと個性が交差する、あなただけのファッション",
    about: "ブランドストーリー",
    aboutText: "素材とデザインにこだわり、長く愛される一着をお届けします。",
    service: "コレクション",
    product: "新着アイテム",
    feature: "こだわりのポイント",
    cta: "ショップへ",
    contact: "お問い合わせ",
    generic: "コレクション",
  },
  tech: {
    hero: "テクノロジーで未来を変える",
    heroSub: "革新的なソリューションで、ビジネスの可能性を広げます",
    about: "私たちについて",
    aboutText: "最先端の技術と確かな実績で、お客様の課題を解決します。",
    service: "サービス",
    product: "プロダクト",
    feature: "特徴",
    cta: "詳しく見る",
    contact: "お問い合わせ",
    generic: "ソリューション",
  },
  health: {
    hero: "健やかな毎日のために",
    heroSub: "心と体のバランスを整える、あなたのウェルネスパートナー",
    about: "コンセプト",
    aboutText: "科学的根拠に基づいたアプローチで、健康的な生活をサポートします。",
    service: "プログラム",
    product: "おすすめアイテム",
    feature: "選ばれる理由",
    cta: "始めてみる",
    contact: "お問い合わせ",
    generic: "ウェルネス",
  },
  lifestyle: {
    hero: "暮らしを彩る",
    heroSub: "日常に心地よさと美しさを添えるアイテムをお届けします",
    about: "ブランドストーリー",
    aboutText: "丁寧に選ばれたアイテムで、あなたの暮らしをもっと豊かに。",
    service: "カテゴリ",
    product: "おすすめアイテム",
    feature: "こだわりのポイント",
    cta: "ショップへ",
    contact: "お問い合わせ",
    generic: "ライフスタイル",
  },
  general: {
    hero: "ようこそ",
    heroSub: "上質な暮らしをお届けします",
    about: "ブランドストーリー",
    aboutText: "品質とデザインにこだわった商品をお届けしています。",
    service: "サービス",
    product: "おすすめ商品",
    feature: "特徴",
    cta: "詳しく見る",
    contact: "お問い合わせ",
    generic: "コレクション",
  },
};

/** ユーザー指示からセクションのコンテキストヒントを抽出 */
function extractSectionHints(instructions: string): string[] {
  if (!instructions) return [];
  const hints: string[] = [];
  const lower = instructions.toLowerCase();
  // ヒーロー、メニュー、アクセス、サービス、料金 etc.
  if (lower.includes("ヒーロー") || lower.includes("hero")) hints.push("hero");
  if (lower.includes("メニュー") || lower.includes("menu")) hints.push("menu");
  if (lower.includes("アクセス") || lower.includes("地図") || lower.includes("map")) hints.push("access");
  if (lower.includes("サービス") || lower.includes("service")) hints.push("service");
  if (lower.includes("料金") || lower.includes("price") || lower.includes("プラン")) hints.push("pricing");
  if (lower.includes("お問い合わせ") || lower.includes("contact") || lower.includes("連絡")) hints.push("contact");
  if (lower.includes("about") || lower.includes("紹介") || lower.includes("について")) hints.push("about");
  if (lower.includes("ギャラリー") || lower.includes("gallery") || lower.includes("写真")) hints.push("gallery");
  if (lower.includes("testimonial") || lower.includes("レビュー") || lower.includes("口コミ") || lower.includes("お客様の声")) hints.push("testimonial");
  return hints;
}

/** セクションインデックスとヒントから見出しを推定 */
function inferHeadingFromContext(
  sectionIndex: number,
  placeholderName: string,
  industry: string,
  hints: string[],
): string {
  const ind = INDUSTRY_HEADINGS[industry] || INDUSTRY_HEADINGS.general;
  const n = placeholderName.toUpperCase();

  // プレースホルダー名にセクション種別のヒントがある場合
  if (n.includes("HERO")) return ind.hero;
  if (n.includes("ABOUT") || n.includes("STORY")) return ind.about;
  if (n.includes("SERVICE") || n.includes("MENU")) return ind.service;
  if (n.includes("PRODUCT") || n.includes("COLLECTION")) return ind.product;
  if (n.includes("FEATURE")) return ind.feature;
  if (n.includes("CTA") || n.includes("ACTION")) return ind.cta;
  if (n.includes("CONTACT") || n.includes("FORM")) return ind.contact;
  if (n.includes("TESTIMONIAL") || n.includes("REVIEW")) return "お客様の声";
  if (n.includes("FAQ")) return "よくあるご質問";
  if (n.includes("NEWSLETTER")) return "ニュースレター";
  if (n.includes("GALLERY")) return "ギャラリー";
  if (n.includes("TEAM")) return "チーム";
  if (n.includes("BLOG")) return "ブログ";
  if (n.includes("ACCESS") || n.includes("MAP") || n.includes("LOCATION")) return "アクセス";
  if (n.includes("PRICING") || n.includes("PRICE") || n.includes("PLAN")) return "料金プラン";

  // ユーザー指示のヒントからセクション順で推定
  if (hints.length > 0 && sectionIndex < hints.length) {
    const hint = hints[sectionIndex];
    switch (hint) {
      case "hero": return ind.hero;
      case "menu": return ind.service;
      case "service": return ind.service;
      case "access": return "アクセス";
      case "pricing": return "料金プラン";
      case "contact": return ind.contact;
      case "about": return ind.about;
      case "gallery": return "ギャラリー";
      case "testimonial": return "お客様の声";
    }
  }

  // セクション位置で推定（ヒーロー→本文→CTA の一般的な流れ）
  if (sectionIndex === 0) return ind.hero;
  if (sectionIndex === 1) return ind.service;
  if (sectionIndex === 2) return ind.contact;

  return ind.generic;
}

/**
 * 残留プレースホルダーをすべてクリーンアップ
 * 画像URL → 業種に応じた多様な Unsplash 画像
 * ALT → 意味のあるデフォルトテキスト
 * テキスト → 空文字列 or デフォルト値
 */
export function cleanupRemainingPlaceholders(html: string): string {
  const industry = _currentIndustry;
  const usedIndices = new Map<string, number>();

  // 画像系プレースホルダー → 業種別の多様な Unsplash 画像
  // 広い正規表現パターンで、IMAGE, IMG, SRC, PHOTO, BACKGROUND, BANNER, HERO_IMAGE 等すべてキャッチ
  html = html.replace(
    /\{\{(?:[A-Z0-9_]*(?:IMAGE|IMG|SRC|PHOTO|BACKGROUND|BANNER|ICON|LOGO|THUMBNAIL|AVATAR)[A-Z0-9_]*)\}\}/gi,
    (match) => selectImageForPlaceholder(match, industry, usedIndices),
  );

  // ALT テキスト → 意味のあるデフォルト値（アクセシビリティ確保）
  html = html.replace(
    /\{\{([^}]*ALT[^}]*)\}\}/gi,
    (_match, name: string) => {
      // プレースホルダー名からコンテキストを推定
      const n = name.toUpperCase();
      if (n.includes("HERO")) return "メインビジュアル";
      if (n.includes("PRODUCT")) return "商品画像";
      if (n.includes("FEATURE")) return "特徴イメージ";
      if (n.includes("BANNER")) return "バナー画像";
      if (n.includes("LOGO")) return "ロゴ";
      if (n.includes("TESTIMONIAL") || n.includes("REVIEW")) return "お客様の声";
      return "イメージ画像";
    },
  );

  // ── Step 1: href/src 属性内の URL プレースホルダー → javascript:void(0) ──
  // href="{{NAV_URL}}" のように属性値として使われている場合のみ void(0) にする
  html = html.replace(
    /(?:href|src|action)=["']\{\{[A-Z0-9_]+\}\}["']/gi,
    (match) => {
      return match.replace(/\{\{[A-Z0-9_]+\}\}/, "javascript:void(0)");
    },
  );

  // ── Step 2: テキストコンテキストの LINK/URL/HREF プレースホルダー → 読めるラベル ──
  // Step 1 で属性内のものは処理済みなので、残りはテキストノード内のもの
  html = html.replace(
    /\{\{([A-Z0-9_]*(?:URL|LINK|HREF)[A-Z0-9_]*)\}\}/gi,
    (_match, name: string) => {
      const n = name.toUpperCase();
      // ナビゲーション系リンクテキスト
      if (n.includes("NAV")) {
        if (n.includes("HOME")) return "ホーム";
        if (n.includes("SHOP") || n.includes("PRODUCT")) return "ショップ";
        if (n.includes("ABOUT")) return "私たちについて";
        if (n.includes("CONTACT")) return "お問い合わせ";
        if (n.includes("BLOG")) return "ブログ";
        if (n.includes("CART")) return "カート";
        // NAV_LINK_1, NAV_LINK_2 等 → 番号ベースのデフォルト
        const numMatch = n.match(/(\d+)/);
        if (numMatch) {
          const labels = ["ホーム", "ショップ", "私たちについて", "お問い合わせ", "ブログ"];
          const idx = parseInt(numMatch[1]) - 1;
          return labels[idx] || "メニュー";
        }
        return "メニュー";
      }
      // フッター系リンクテキスト
      if (n.includes("FOOTER")) {
        const numMatch = n.match(/(\d+)/);
        if (numMatch) {
          const labels = ["ショップ", "私たちについて", "お問い合わせ", "プライバシーポリシー", "利用規約", "特定商取引法に基づく表記"];
          const idx = parseInt(numMatch[1]) - 1;
          return labels[idx] || "リンク";
        }
        return "リンク";
      }
      // SNS リンク
      if (n.includes("SOCIAL") || n.includes("TWITTER") || n.includes("INSTAGRAM") || n.includes("FACEBOOK")) {
        return "";  // SNSリンクはアイコンのみが一般的
      }
      // それ以外の URL/HREF は空文字（テキストとしては不要）
      if (n.includes("URL") || n.includes("HREF")) return "";
      // LINK を含むがテキスト用途のもの → ラベルとして扱う
      return "リンク";
    },
  );

  // ── Step 3: 残りのテキスト系プレースホルダー → 業種対応コンテキスト推定 ──
  const ind = INDUSTRY_HEADINGS[industry] || INDUSTRY_HEADINGS.general;
  const sectionHints = extractSectionHints(_currentUserInstructions);
  let headingCounter = 0;

  html = html.replace(/\{\{([A-Z][A-Z0-9_]*)\}\}/g, (_match, name: string) => {
    const n = name.toUpperCase();
    // 見出し系 → 業種対応のセクション名を推定
    if (n.includes("HEADING") || n.includes("TITLE")) {
      headingCounter++;
      return inferHeadingFromContext(headingCounter - 1, name, industry, sectionHints);
    }
    // サブタイトル/タグライン
    if (n.includes("TAGLINE") || n.includes("SUBTITLE") || n.includes("SUBHEADING")) {
      if (n.includes("HERO")) return ind.heroSub;
      return ind.heroSub;
    }
    // CTA / ボタン
    if (n.includes("CTA") || n.includes("BUTTON")) {
      if (n.includes("CONTACT")) return ind.contact;
      if (n.includes("SHOP") || n.includes("PRODUCT")) return "ショップへ";
      return ind.cta;
    }
    // 説明テキスト
    if (n.includes("DESCRIPTION") || n.includes("TEXT") || n.includes("BODY") || n.includes("CONTENT")) {
      if (n.includes("HERO")) return ind.aboutText;
      if (n.includes("ABOUT") || n.includes("STORY")) return ind.aboutText;
      if (n.includes("FEATURE")) return "厳選された素材と確かな技術で作られています。";
      if (n.includes("CONTACT")) return "お気軽にお問い合わせください。";
      return "";
    }
    // カテゴリ名
    if (n.includes("CATEGORY") || n.includes("COLLECTION")) {
      const numMatch = n.match(/(\d+)/);
      if (numMatch) {
        const labels = ["コレクション", "新着", "セール", "限定", "人気"];
        const idx = parseInt(numMatch[1]) - 1;
        return labels[idx] || "カテゴリ";
      }
      return "カテゴリ";
    }
    // 価格
    if (n.includes("PRICE")) return "¥4,980";
    // 著者/名前
    if (n.includes("AUTHOR") || n.includes("NAME")) {
      if (n.includes("TESTIMONIAL") || n.includes("REVIEW")) return "お客様";
      return "";
    }
    // デフォルト: 空文字（不明なプレースホルダーは非表示に）
    return "";
  });

  // ── Step 4: 空の見出しタグを検出して業種対応デフォルトテキストを挿入 ──
  let emptyHeadingCounter = 0;
  html = html.replace(
    /<(h[1-6])([^>]*)>\s*<\/\1>/gi,
    (_match, tag: string, attrs: string) => {
      const cls = (attrs || "").toLowerCase();
      let text = "";
      if (cls.includes("hero")) text = ind.hero;
      else if (cls.includes("story") || cls.includes("about")) text = ind.about;
      else if (cls.includes("service") || cls.includes("menu")) text = ind.service;
      else if (cls.includes("product") || cls.includes("collection")) text = ind.product;
      else if (cls.includes("feature")) text = ind.feature;
      else if (cls.includes("cta") || cls.includes("action")) text = ind.cta;
      else if (cls.includes("contact") || cls.includes("form")) text = ind.contact;
      else if (cls.includes("testimonial") || cls.includes("review")) text = "お客様の声";
      else if (cls.includes("faq")) text = "よくあるご質問";
      else if (cls.includes("newsletter")) text = "ニュースレター";
      else if (cls.includes("footer") || cls.includes("copyright")) text = "";
      else {
        // クラス名にヒントがない場合、セクション順で推定
        text = inferHeadingFromContext(emptyHeadingCounter, "", industry, sectionHints);
        emptyHeadingCounter++;
      }

      if (!text) return `<${tag}${attrs}></${tag}>`;
      return `<${tag}${attrs}>${text}</${tag}>`;
    },
  );

  // ── Step 4.5: 孤立セパレーターの除去 ──
  // "/ / /" のようなリンク間セパレーターが目立つ場合、クリーンアップ
  // パターン: テキストが "/" だけの行や、連続する "/" セパレーター
  html = html.replace(/(?:<[^>]*>)?\s*\/\s*(?:\/\s*)+(?:<[^>]*>)?/g, (match) => {
    // HTMLタグの中にある場合はそのまま
    if (match.includes("</") && match.includes(">")) return match;
    return "";
  });
  // <nav> 内の孤立 "/" テキストをクリーンアップ
  html = html.replace(
    /(<nav[^>]*>)([\s\S]*?)(<\/nav>)/gi,
    (_match, open: string, content: string, close: string) => {
      // nav内のリンク間 "/" セパレーターを除去
      let cleaned = content.replace(/\s*\/\s*(?=<a\b|$)/g, " ");
      cleaned = cleaned.replace(/(?<=<\/a>)\s*\/\s*/g, " ");
      // テキストノードの孤立 "/" を除去
      cleaned = cleaned.replace(/>\s*\/\s*</g, "><");
      return open + cleaned + close;
    },
  );

  // ── Step 5: 生URLテキストの修復 ──
  // HTMLタグの外（テキストノードとして）に露出している画像URLを検出し、<img>タグに変換
  html = html.replace(
    /(?<![="'])(https:\/\/images\.unsplash\.com\/[^\s<>"']+)/g,
    (_match, url) => {
      return `<img src="${url}" alt="イメージ画像" style="width:100%;height:auto;display:block;object-fit:cover;" />`;
    },
  );

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

  // ブランド名の直接置換（"Brand" ではなく日本語のデフォルトを使用）
  const brandName = requirements.brandName || "My Store";
  const brandPlaceholders = ["{{BRAND_NAME}}", "{{SHOP_NAME}}", "{{STORE_NAME}}"];

  for (const bp of brandPlaceholders) {
    if (personalizedDocument.includes(bp)) {
      personalizedDocument = personalizedDocument.split(bp).join(brandName);
      generatedContent[bp] = brandName;
      replacedCount++;
    }
  }

  // 汎用的なフォールバック値（日本語）
  const year = new Date().getFullYear();
  const FALLBACK_VALUES: Record<string, string> = {
    // Hero セクション
    "{{HERO_HEADING}}": `${brandName}へようこそ`,
    "{{HERO_TAGLINE}}": "あなたのための特別なコレクション",
    "{{HERO_SUBTITLE}}": "上質な暮らしをお届けします",
    "{{HERO_DESCRIPTION}}": `${brandName}は、品質とデザインにこだわった商品をお届けしています。`,
    // CTA
    "{{CTA_PRIMARY}}": "コレクションを見る",
    "{{CTA_SECONDARY}}": "詳しく見る",
    "{{CTA_SHOP}}": "ショップへ",
    "{{CTA_LEARN_MORE}}": "もっと詳しく",
    "{{CTA_CONTACT}}": "お問い合わせ",
    // About
    "{{ABOUT_HEADING}}": "ブランドストーリー",
    "{{ABOUT_TEXT}}": `${brandName}は、品質と美しさを追求するブランドです。一つひとつの製品に想いを込めてお届けしています。`,
    "{{ABOUT_SUBTITLE}}": "私たちのこだわり",
    // Products
    "{{PRODUCTS_HEADING}}": "おすすめ商品",
    "{{PRODUCTS_SUBTITLE}}": "厳選されたコレクション",
    "{{PRODUCT_1_NAME}}": "人気アイテム",
    "{{PRODUCT_1_DESCRIPTION}}": "こだわりの素材で作られた逸品",
    "{{PRODUCT_1_PRICE}}": "¥4,980",
    "{{PRODUCT_2_NAME}}": "新商品",
    "{{PRODUCT_2_DESCRIPTION}}": "最新のトレンドを取り入れたデザイン",
    "{{PRODUCT_2_PRICE}}": "¥6,980",
    "{{PRODUCT_3_NAME}}": "限定コレクション",
    "{{PRODUCT_3_DESCRIPTION}}": "特別な日のための特別なアイテム",
    "{{PRODUCT_3_PRICE}}": "¥8,980",
    // Features
    "{{FEATURES_HEADING}}": "特徴",
    "{{FEATURE_1_HEADING}}": "高品質",
    "{{FEATURE_1_TEXT}}": "厳選された素材を使用しています",
    "{{FEATURE_2_HEADING}}": "安心のサポート",
    "{{FEATURE_2_TEXT}}": "専門スタッフがお手伝いします",
    "{{FEATURE_3_HEADING}}": "迅速な配送",
    "{{FEATURE_3_TEXT}}": "ご注文から最短翌日にお届け",
    // Testimonials
    "{{TESTIMONIALS_HEADING}}": "お客様の声",
    "{{TESTIMONIAL_1_TEXT}}": "品質がとても良く、大満足です。リピート決定です。",
    "{{TESTIMONIAL_1_AUTHOR}}": "A.T. さん",
    "{{TESTIMONIAL_2_TEXT}}": "デザインも使い心地も最高です。友人にも勧めています。",
    "{{TESTIMONIAL_2_AUTHOR}}": "M.K. さん",
    // Newsletter
    "{{NEWSLETTER_HEADING}}": "ニュースレター",
    "{{NEWSLETTER_TEXT}}": "最新情報やお得なキャンペーンをお届けします",
    "{{NEWSLETTER_CTA}}": "登録する",
    // Navigation
    "{{NAV_HOME}}": "ホーム",
    "{{NAV_SHOP}}": "ショップ",
    "{{NAV_ABOUT}}": "私たちについて",
    "{{NAV_CONTACT}}": "お問い合わせ",
    "{{NAV_CART}}": "カート",
    // Footer
    "{{FOOTER_TEXT}}": `© ${year} ${brandName}. All rights reserved.`,
    "{{FOOTER_DESCRIPTION}}": `${brandName} — 上質な暮らしをお届けするブランドです。`,
    "{{COPYRIGHT}}": `© ${year} ${brandName}`,
    // Contact
    "{{CONTACT_HEADING}}": "お問い合わせ",
    "{{CONTACT_TEXT}}": "お気軽にお問い合わせください",
    "{{EMAIL_ADDRESS}}": "info@example.com",
    "{{PHONE_NUMBER}}": "03-1234-5678",
    // Footer links（テンプレートで使われる様々なパターン）
    "{{FOOTER_LINK_1}}": "ショップ",
    "{{FOOTER_LINK_2}}": "私たちについて",
    "{{FOOTER_LINK_3}}": "お問い合わせ",
    "{{FOOTER_LINK_4}}": "プライバシーポリシー",
    "{{FOOTER_LINK_5}}": "特定商取引法に基づく表記",
    "{{FOOTER_LINK_6}}": "利用規約",
    "{{FOOTER_CATEGORY_1}}": "ショップ",
    "{{FOOTER_CATEGORY_2}}": "サポート",
    "{{FOOTER_CATEGORY_3}}": "会社情報",
    // Mega menu / navigation fallbacks
    "{{MEGA_CATEGORY_1}}": "カテゴリ",
    "{{MEGA_CATEGORY_2}}": "新着",
    "{{MEGA_CATEGORY_3}}": "セール",
  };

  for (const [placeholder, value] of Object.entries(FALLBACK_VALUES)) {
    if (personalizedDocument.includes(placeholder)) {
      personalizedDocument = personalizedDocument.split(placeholder).join(value);
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
