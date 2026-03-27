// ============================================================
// DDP v2 Build Helpers
//
// インクリメンタルビルド用の共有ユーティリティ。
// /api/build/* エンドポイントから使用される。
// ============================================================

import type { DDPInput } from "./types";

/**
 * ユーザー入力からDDPInputを構築（/api/build/* 用の簡易版）
 */
export function buildDDPInput(
  userInstructions: string,
  pageType: string,
  urlAnalysis?: {
    url: string;
    title: string;
    headings: string[];
    bodyTexts: string[];
    images: Array<{ src: string; alt: string; context: string }>;
    colors: string[];
    fonts: string[];
  },
  brandMemory?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    primaryFont: string;
    bodyFont: string;
    voiceTone: string;
    copyKeywords: string[];
    avoidKeywords: string[];
  },
): DDPInput {
  // ページ種別
  const detectedPageType = pageType || "landing";

  // 業種の推定
  const industry = detectIndustry(userInstructions);

  // トーンの推定
  const tones = detectTones(userInstructions);

  // ブランド名の推定
  const brandName = extractBrandName(userInstructions, urlAnalysis);

  return {
    pageType: detectedPageType,
    industry,
    brandName,
    tones,
    urlAnalysis: urlAnalysis || undefined,
    brandMemory: brandMemory || undefined,
    userInstructions,
    keywords: extractKeywords(userInstructions),
  };
}

function detectIndustry(text: string): string {
  const industries: Record<string, string[]> = {
    beauty: ["美容", "コスメ", "スキンケア", "化粧", "beauty", "skincare", "メイク"],
    fashion: ["ファッション", "アパレル", "服", "fashion", "衣料", "コーデ"],
    food: ["食品", "フード", "食べ", "グルメ", "food", "レストラン", "カフェ", "料理"],
    health: ["健康", "サプリ", "ウェルネス", "health", "フィットネス"],
    tech: ["テック", "ガジェット", "IT", "tech", "デジタル", "ソフトウェア"],
    lifestyle: ["ライフスタイル", "インテリア", "雑貨", "家具", "lifestyle"],
    education: ["教育", "スクール", "学習", "レッスン", "education"],
  };

  const lower = text.toLowerCase();
  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return industry;
    }
  }
  return "general";
}

function detectTones(text: string): string[] {
  const toneMap: Record<string, string[]> = {
    modern: ["モダン", "現代的", "modern"],
    luxury: ["高級", "ラグジュアリー", "luxury", "プレミアム"],
    minimal: ["ミニマル", "シンプル", "minimal", "clean"],
    warm: ["温かい", "温もり", "warm", "ナチュラル"],
    bold: ["大胆", "インパクト", "bold", "ダイナミック"],
    elegant: ["エレガント", "上品", "elegant", "洗練"],
    playful: ["ポップ", "楽しい", "カジュアル", "playful"],
    professional: ["プロフェッショナル", "ビジネス", "信頼", "professional"],
  };

  const detected: string[] = [];
  const lower = text.toLowerCase();
  for (const [tone, keywords] of Object.entries(toneMap)) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      detected.push(tone);
    }
  }
  return detected.length > 0 ? detected : ["modern"];
}

function extractBrandName(text: string, urlAnalysis?: any): string | undefined {
  if (urlAnalysis?.title) {
    // タイトルからブランド名を推定（「|」「-」「–」の前の部分）
    const parts = urlAnalysis.title.split(/[|–\-]/);
    if (parts[0]) return parts[0].trim();
  }
  return undefined;
}

function extractKeywords(text: string): string[] {
  // 重要なキーワードを抽出
  const keywords: string[] = [];
  const patterns = [
    /「([^」]+)」/g, // 「」内の文字列
    /"([^"]+)"/g,    // ""内の文字列
  ];
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      keywords.push(match[1]);
    }
  }
  return keywords;
}
