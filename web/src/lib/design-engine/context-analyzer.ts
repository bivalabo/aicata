// ============================================================
// Aicata Design Engine — Context Analyzer
// リクエストから業界・ページ種別・トーンを判定する
// ============================================================

import type {
  DesignContext,
  IndustryType,
  PageType,
  DesignTone,
  CssFeatureId,
  AudienceType,
} from "./types";
import { getIndustryKnowledge } from "./knowledge/industries";

// ------------------------------------------------------------
// キーワードマップ（Phase 1: ルールベース判定）
// ------------------------------------------------------------

const INDUSTRY_KEYWORDS: Record<IndustryType, string[]> = {
  beauty: [
    "コスメ", "化粧品", "スキンケア", "美容", "メイク", "ヘアケア",
    "ビューティー", "beauty", "cosmetic", "skincare", "makeup",
    "香水", "フレグランス", "ネイル", "エステ", "美白", "保湿",
    "クレンジング", "化粧水", "美容液", "ファンデーション",
  ],
  food: [
    "食品", "お菓子", "スイーツ", "ドリンク", "飲料", "カフェ",
    "レストラン", "料理", "グルメ", "和食", "洋食", "お茶",
    "コーヒー", "ワイン", "日本酒", "ベーカリー", "パン",
    "チョコレート", "オーガニック食品", "サプリメント", "プロテイン",
    "food", "cafe", "restaurant", "organic",
  ],
  fashion: [
    "ファッション", "アパレル", "服", "洋服", "靴", "シューズ",
    "ジュエリー", "アクセサリー", "バッグ", "帽子", "ドレス",
    "カジュアル", "ストリート", "ハイブランド", "セレクトショップ",
    "fashion", "apparel", "clothing", "shoes", "jewelry",
    "レディース", "メンズ", "キッズ", "ベビー服",
  ],
  lifestyle: [
    "雑貨", "インテリア", "家具", "キッチン", "生活", "暮らし",
    "ホーム", "リビング", "収納", "照明", "ガーデン", "DIY",
    "lifestyle", "interior", "furniture", "home",
    "文房具", "ステーショナリー", "ギフト", "プレゼント",
  ],
  tech: [
    "ガジェット", "テック", "デバイス", "電子", "PC", "スマホ",
    "アプリ", "SaaS", "ソフトウェア", "AI", "IoT", "ロボット",
    "tech", "gadget", "software", "digital",
  ],
  health: [
    "サプリ", "健康", "フィットネス", "ヨガ", "ピラティス",
    "ジム", "ダイエット", "ウェルネス", "メディカル",
    "health", "fitness", "wellness", "supplement",
  ],
  general: [], // フォールバック
};

const PAGE_TYPE_KEYWORDS: Record<PageType, string[]> = {
  landing: [
    "ランディングページ", "LP", "トップページ", "ホームページ",
    "メインページ", "top", "landing", "home",
  ],
  product: [
    "商品ページ", "商品詳細", "プロダクト", "product", "アイテム",
    "単品ページ", "商品紹介",
  ],
  collection: [
    "コレクション", "カテゴリ", "一覧", "カタログ", "ラインナップ",
    "collection", "category", "catalog",
  ],
  about: [
    "about", "会社概要", "ブランドストーリー", "私たちについて",
    "理念", "ミッション", "ブランド紹介", "企業情報",
  ],
  contact: [
    "お問い合わせ", "コンタクト", "contact", "問い合わせ",
    "フォーム", "相談",
  ],
  blog: [
    "ブログ", "記事一覧", "コラム一覧", "ニュース", "お知らせ",
    "blog", "news",
  ],
  article: [
    "記事", "ブログ記事", "コラム", "投稿", "article", "post",
  ],
  "list-collections": [
    "コレクション一覧", "カテゴリ一覧", "全カテゴリ", "list collections",
  ],
  cart: [
    "カート", "買い物かご", "注文", "cart", "basket", "checkout",
  ],
  search: [
    "検索", "検索結果", "サーチ", "search", "find",
  ],
  account: [
    "アカウント", "マイページ", "ログイン", "登録", "account", "login", "register",
  ],
  password: [
    "パスワード", "password",
  ],
  "404": [
    "404", "ページが見つかりません", "not found",
  ],
  "gift-card": [
    "ギフトカード", "ギフト券", "プレゼントカード", "gift card", "gift certificate",
  ],
  general: [],
};

// ターゲットオーディエンスのキーワードマップ
const AUDIENCE_KEYWORDS: Record<Exclude<AudienceType, "custom">, string[]> = {
  individual: ["個人", "一般消費者", "消費者", "B2C", "個人のお客様"],
  business: ["法人", "ビジネス", "企業", "B2B", "オフィス", "業務用"],
  young: ["若年層", "10代", "20代", "Z世代", "学生", "ティーン", "若者"],
  "young-adult": ["20〜30代", "社会人", "ミレニアル", "働く女性", "働く男性", "OL"],
  middle: ["40代", "50代", "40〜50代", "ミドル", "大人世代"],
  senior: ["シニア", "60代", "70代", "高齢者", "おじいちゃん", "おばあちゃん", "シルバー"],
  premium: ["高品質", "こだわり", "プレミアム", "上質", "本物志向", "高級志向", "富裕層"],
  family: ["ファミリー", "家族", "暮らし", "子育て", "ママ", "パパ", "育児"],
  women: ["女性", "レディース", "ウィメンズ", "女性向け", "女の子"],
  men: ["男性", "メンズ", "男性向け"],
  "eco-conscious": ["エコ", "サステナブル", "環境", "エシカル", "オーガニック志向", "SDGs"],
  gift: ["ギフト", "贈り物", "プレゼント", "贈答", "お祝い", "内祝い"],
  broad: ["幅広い", "全年齢", "老若男女", "特に絞らない", "万人向け"],
};

const TONE_KEYWORDS: Record<DesignTone, string[]> = {
  luxury: ["高級", "ラグジュアリー", "プレミアム", "ハイエンド", "luxury", "premium"],
  natural: ["ナチュラル", "自然", "オーガニック", "natural", "organic"],
  modern: ["モダン", "先進的", "contemporary", "modern", "スタイリッシュ"],
  playful: ["ポップ", "楽しい", "カラフル", "かわいい", "playful", "cute", "fun"],
  minimal: ["ミニマル", "シンプル", "minimal", "simple", "クリーン", "clean"],
  bold: ["大胆", "インパクト", "bold", "強い", "パワフル"],
  elegant: ["エレガント", "上品", "elegant", "洗練", "品のある", "refined"],
  warm: ["あたたかい", "温かみ", "warm", "ぬくもり", "親しみ"],
  cool: ["クール", "cool", "かっこいい", "スマート"],
  traditional: ["和風", "伝統", "traditional", "japanese", "日本的", "和モダン"],
};

// ------------------------------------------------------------
// 分析エンジン
// ------------------------------------------------------------

/**
 * ユーザーのメッセージ（と会話履歴）からデザインコンテキストを分析する
 * @param userMessage - User input message
 * @param conversationMessages - Conversation history
 * @param explicitPageType - Optional explicit page type (overrides auto-detection)
 */
export function analyzeDesignContext(
  userMessage: string,
  conversationMessages?: Array<{ role: string; content: string }>,
  explicitPageType?: string,
): DesignContext {
  // 全テキストを結合（最新メッセージに重みを持たせる）
  const allText = buildAnalysisText(userMessage, conversationMessages);

  // 1. 業界判定
  const industry = detectIndustry(allText, userMessage);

  // 2. ページ種別判定（明示的な指定がない場合のみ自動検出）
  const pageType = (explicitPageType || detectPageType(allText, userMessage)) as PageType;

  // 3. トーン判定
  const tones = detectTones(allText, userMessage);

  // 4. CSS機能の選定（業界推奨 + トーンから）
  const industryKnowledge = getIndustryKnowledge(industry);
  const cssFeatures = selectCssFeatures(industryKnowledge.recommendedCssFeatures, tones);

  // 5. URL検出
  const referenceUrl = detectUrl(userMessage);

  // 6. ブランド名検出（簡易）
  const brandName = detectBrandName(userMessage);

  // 7. キーワード抽出
  const keywords = extractKeywords(userMessage);

  // 8. ターゲットオーディエンス検出
  const { audience, audienceText } = detectAudience(allText, userMessage);

  // 9. 確信度計算
  const confidence = calculateConfidence(industry, pageType, tones);

  return {
    industry,
    pageType,
    tones,
    cssFeatures,
    referenceUrl,
    brandName,
    keywords,
    audience,
    audienceText,
    confidence,
  };
}

// ------------------------------------------------------------
// 内部関数
// ------------------------------------------------------------

function buildAnalysisText(
  userMessage: string,
  conversationMessages?: Array<{ role: string; content: string }>,
): string {
  if (!conversationMessages || conversationMessages.length === 0) {
    return userMessage;
  }
  // 直近5メッセージ + 現在のメッセージ
  const recent = conversationMessages
    .slice(-5)
    .map((m) => m.content)
    .join(" ");
  return `${recent} ${userMessage}`;
}

function detectIndustry(allText: string, currentMessage: string): IndustryType {
  const scores: Record<IndustryType, number> = {
    beauty: 0, food: 0, fashion: 0, lifestyle: 0,
    tech: 0, health: 0, general: 0,
  };

  // 大文字小文字を統一してマッチング（英語キーワード対応）
  const currentLower = currentMessage.toLowerCase();
  const allLower = allText.toLowerCase();

  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      // 現在のメッセージ内は2倍スコア
      if (currentLower.includes(kwLower)) {
        scores[industry as IndustryType] += 2;
      } else if (allLower.includes(kwLower)) {
        scores[industry as IndustryType] += 1;
      }
    }
  }

  const best = Object.entries(scores)
    .filter(([key]) => key !== "general")
    .sort(([, a], [, b]) => b - a)[0];

  return best && best[1] > 0 ? (best[0] as IndustryType) : "general";
}

function detectPageType(allText: string, currentMessage: string): PageType {
  const scores: Record<PageType, number> = {
    landing: 0, product: 0, collection: 0, "list-collections": 0,
    cart: 0, blog: 0, article: 0, about: 0, contact: 0,
    search: 0, account: 0, password: 0, "404": 0, "gift-card": 0, general: 0,
  };

  for (const [pageType, keywords] of Object.entries(PAGE_TYPE_KEYWORDS)) {
    for (const kw of keywords) {
      if (currentMessage.toLowerCase().includes(kw.toLowerCase())) {
        scores[pageType as PageType] += 2;
      } else if (allText.toLowerCase().includes(kw.toLowerCase())) {
        scores[pageType as PageType] += 1;
      }
    }
  }

  const best = Object.entries(scores)
    .filter(([key]) => key !== "general")
    .sort(([, a], [, b]) => b - a)[0];

  // ページ種別が不明な場合、landing をデフォルトに
  return best && best[1] > 0 ? (best[0] as PageType) : "landing";
}

function detectTones(allText: string, currentMessage: string): DesignTone[] {
  const toneScores: Array<[DesignTone, number]> = [];

  // 大文字小文字を統一してマッチング
  const currentLower = currentMessage.toLowerCase();
  const allLower = allText.toLowerCase();

  for (const [tone, keywords] of Object.entries(TONE_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      if (currentLower.includes(kwLower)) score += 2;
      else if (allLower.includes(kwLower)) score += 1;
    }
    if (score > 0) {
      toneScores.push([tone as DesignTone, score]);
    }
  }

  // スコア順に上位3つまで
  const detected = toneScores
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([tone]) => tone);

  // デフォルトトーン
  return detected.length > 0 ? detected : ["modern"];
}

function selectCssFeatures(
  industryRecommended: CssFeatureId[],
  tones: DesignTone[],
): CssFeatureId[] {
  const features = new Set<CssFeatureId>(industryRecommended);

  // トーンに基づく追加
  if (tones.includes("luxury") || tones.includes("elegant")) {
    features.add("glassmorphism");
    features.add("motion");
  }
  if (tones.includes("modern") || tones.includes("bold")) {
    features.add("scroll-animations");
    features.add("modern-layout");
  }

  // 常に含めるべき基本機能
  features.add("typography");
  features.add("motion");

  // 最大4つに絞る（トークン節約）
  return Array.from(features).slice(0, 4);
}

function detectUrl(text: string): string | undefined {
  const urlMatch = text.match(/https?:\/\/[^\s,。、）\)]+/);
  return urlMatch ? urlMatch[0] : undefined;
}

function detectBrandName(text: string): string | undefined {
  // 「〇〇というブランド」「〇〇のサイト」パターン
  const patterns = [
    /「(.+?)」(?:という|の|って)/,
    /(.+?)(?:というブランド|というお店|というショップ|のサイト|のページ)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1].length <= 30) {
      return match[1];
    }
  }
  return undefined;
}

function extractKeywords(text: string): string[] {
  const keywords: string[] = [];

  // 「〇〇な」「〇〇っぽい」「〇〇風」等のデザイン要望を抽出
  const patterns = [
    /(\S+?)(?:な|っぽい|風の?|テイストの?|のような|みたいな)(?:デザイン|ページ|サイト|雰囲気)/g,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      keywords.push(match[1]);
    }
  }

  return keywords;
}

/**
 * ターゲットオーディエンスを検出する
 * キーワードマッチング + 構造化テキスト（【ターゲット】）の両方に対応
 */
function detectAudience(
  allText: string,
  currentMessage: string,
): { audience: AudienceType; audienceText?: string } {
  // 1. 構造化テキストから抽出（OnboardingFlowが生成する形式）
  //    例: 【ターゲット】20〜30代の働く女性
  const structuredMatch = currentMessage.match(
    /【ターゲット】\s*(.+?)(?:\n|$)/,
  );

  if (structuredMatch) {
    const rawText = structuredMatch[1].trim();

    // キーワードマッチでAudienceTypeを特定
    const matched = matchAudienceKeywords(rawText);
    if (matched) {
      return { audience: matched, audienceText: rawText };
    }

    // キーワードに一致しないフリーテキスト → custom
    return { audience: "custom", audienceText: rawText };
  }

  // 2. キーワードベースの検出（構造化テキストがない場合）
  const scores: Array<[Exclude<AudienceType, "custom">, number]> = [];
  const currentLower = currentMessage.toLowerCase();
  const allLower = allText.toLowerCase();

  for (const [audienceType, keywords] of Object.entries(AUDIENCE_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      if (currentLower.includes(kwLower)) score += 2;
      else if (allLower.includes(kwLower)) score += 1;
    }
    if (score > 0) {
      scores.push([audienceType as Exclude<AudienceType, "custom">, score]);
    }
  }

  if (scores.length > 0) {
    scores.sort(([, a], [, b]) => b - a);
    return { audience: scores[0][0] };
  }

  // デフォルト: broad（幅広い層）
  return { audience: "broad" };
}

/**
 * テキストからAudienceTypeをキーワードマッチで特定する
 */
function matchAudienceKeywords(text: string): Exclude<AudienceType, "custom"> | null {
  const textLower = text.toLowerCase();
  let bestMatch: Exclude<AudienceType, "custom"> | null = null;
  let bestScore = 0;

  for (const [audienceType, keywords] of Object.entries(AUDIENCE_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (textLower.includes(kw.toLowerCase())) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = audienceType as Exclude<AudienceType, "custom">;
    }
  }

  return bestMatch;
}

function calculateConfidence(
  industry: IndustryType,
  pageType: PageType,
  tones: DesignTone[],
): number {
  let score = 0.3; // ベースライン
  if (industry !== "general") score += 0.3;
  if (pageType !== "landing") score += 0.1; // landing はデフォルトなので低め
  if (tones.length > 0 && tones[0] !== "modern") score += 0.2; // modern はデフォルト
  return Math.min(score, 1.0);
}
