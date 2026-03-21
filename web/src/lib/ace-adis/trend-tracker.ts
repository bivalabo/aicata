// ============================================================
// ADIS Web Trend Tracker
//
// デザイントレンドの収集・分析・レポート生成パイプライン
//
// Phase 1: 手動キュレーション + AI分析ベースの集計
// Phase 2: Awwwards/Dribbble等のRSS/API自動収集（将来）
//
// パイプラインフロー:
// 1. collectFromEvaluations() — 既存の SiteEvaluation から傾向を集計
// 2. analyzeWithAI() — Claude でトレンドレポートを生成
// 3. generateReport() — TrendReport をDB保存
// ============================================================

import { anthropic, DEFAULT_MODEL } from "../anthropic";
import { db, safeJsonParse } from "../prisma-extended";
// NOTE: The TrendReportData/ColorTrend/TypographyTrend from types.ts have
// different shapes than what the AI analysis returns. We use local types here
// that align with the AI prompt output format, and map to DB format on save.

// ============================================================
// Types
// ============================================================

export interface TrendCollectionResult {
  /** 集計期間 */
  period: string;
  /** 収集した評価数 */
  evaluationCount: number;
  /** パターン頻度マップ */
  patternFrequency: Record<string, number>;
  /** カラー集計 */
  colorSummary: ColorFrequency[];
  /** フォント集計 */
  fontSummary: FontFrequency[];
  /** トーン集計 */
  toneSummary: Record<string, number>;
  /** レイアウト集計 */
  layoutSummary: Record<string, number>;
}

interface ColorFrequency {
  hex: string;
  role: string;
  count: number;
}

interface FontFrequency {
  family: string;
  role: string;
  isSerif: boolean;
  count: number;
}

export interface TrendAnalysisResult {
  emergingPatterns: PatternTrend[];
  decliningPatterns: PatternTrend[];
  colorTrends: ColorTrend[];
  typographyTrends: TypographyTrend[];
  layoutTrends: LayoutTrend[];
  summary: string;
}

// AI分析の出力形式に合わせたローカル型
interface ColorTrend {
  name: string;
  colors: string[];
  direction: "rising" | "stable" | "declining";
}

interface TypographyTrend {
  name: string;
  fonts: string[];
  direction: "rising" | "stable" | "declining";
}

interface PatternTrend {
  name: string;
  direction: "rising" | "stable" | "declining";
  strength: number; // 0-1
  description: string;
}

interface LayoutTrend {
  pattern: string;
  prevalence: number;
  direction: "rising" | "stable" | "declining";
}

// ============================================================
// 1. データ収集 — SiteEvaluation から集計
// ============================================================

/**
 * 指定期間の SiteEvaluation から傾向データを収集する
 *
 * @param daysBack 何日前まで遡るか（デフォルト30日）
 */
export async function collectFromEvaluations(
  daysBack: number = 30,
): Promise<TrendCollectionResult> {
  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  const evaluations = await db.siteEvaluation.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
  });

  const patternFrequency: Record<string, number> = {};
  const colorMap = new Map<string, ColorFrequency>();
  const fontMap = new Map<string, FontFrequency>();
  const toneSummary: Record<string, number> = {};
  const layoutSummary: Record<string, number> = {};

  for (const ev of evaluations) {
    // パターン集計
    const patterns = safeJsonParse<string[]>(ev.detectedPatterns, []);
    for (const p of patterns) {
      patternFrequency[p] = (patternFrequency[p] || 0) + 1;
    }

    // カラー集計
    const colors = safeJsonParse<{ hex: string; role: string }[]>(ev.analyzedColors, []);
    for (const c of colors) {
      const key = `${c.hex}-${c.role}`;
      const existing = colorMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        colorMap.set(key, { hex: c.hex, role: c.role, count: 1 });
      }
    }

    // フォント集計
    const fonts = safeJsonParse<{ family: string; role: string; isSerif: boolean }[]>(ev.analyzedFonts, []);
    for (const f of fonts) {
      const key = `${f.family}-${f.role}`;
      const existing = fontMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        fontMap.set(key, { family: f.family, role: f.role, isSerif: f.isSerif, count: 1 });
      }
    }

    // レイアウト・トーン集計
    const layoutData = safeJsonParse<{ pattern?: string; tones?: string[] }>(ev.analyzedLayout, {});
    if (layoutData.pattern) {
      layoutSummary[layoutData.pattern] = (layoutSummary[layoutData.pattern] || 0) + 1;
    }
    if (layoutData.tones) {
      for (const t of layoutData.tones) {
        toneSummary[t] = (toneSummary[t] || 0) + 1;
      }
    }
  }

  // 期間を "YYYY-WXX" 形式で
  const now = new Date();
  const weekNum = getISOWeek(now);
  const period = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;

  return {
    period,
    evaluationCount: evaluations.length,
    patternFrequency,
    colorSummary: Array.from(colorMap.values()).sort((a, b) => b.count - a.count),
    fontSummary: Array.from(fontMap.values()).sort((a, b) => b.count - a.count),
    toneSummary,
    layoutSummary,
  };
}

// ============================================================
// 2. AI分析 — Claude でトレンドを解釈
// ============================================================

/**
 * 収集データをClaudeに送り、トレンドレポートを生成させる
 */
export async function analyzeWithAI(
  collected: TrendCollectionResult,
): Promise<TrendAnalysisResult> {
  // 評価が少なすぎる場合はAI分析をスキップしてルールベースで返す
  if (collected.evaluationCount < 3) {
    return generateRuleBasedAnalysis(collected);
  }

  const prompt = buildAnalysisPrompt(collected);

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
      system: `あなたはウェブデザイントレンドの専門アナリストです。提供されたデザイン評価データを分析し、トレンドレポートをJSON形式で生成してください。回答はJSON のみで返してください。`,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return generateRuleBasedAnalysis(collected);
    }

    return parseAnalysisResponse(textBlock.text, collected);
  } catch (error) {
    console.error("[TrendTracker] AI analysis failed, using rule-based:", error);
    return generateRuleBasedAnalysis(collected);
  }
}

// ============================================================
// 3. レポート生成 & DB保存
// ============================================================

/**
 * トレンドレポートを生成してDBに保存する
 */
export async function generateReport(
  daysBack: number = 30,
): Promise<{ report: any; collection: TrendCollectionResult; analysis: TrendAnalysisResult }> {
  // 1. データ収集
  const collection = await collectFromEvaluations(daysBack);

  // 2. AI分析
  const analysis = await analyzeWithAI(collection);

  // 3. DB保存
  const report = await db.trendReport.create({
    data: {
      period: collection.period,
      emergingPatterns: JSON.stringify(analysis.emergingPatterns),
      decliningPatterns: JSON.stringify(analysis.decliningPatterns),
      colorTrends: JSON.stringify(analysis.colorTrends),
      typographyTrends: JSON.stringify(analysis.typographyTrends),
      layoutTrends: JSON.stringify(analysis.layoutTrends),
    },
  });

  // 4. DesignPattern のmomentumを更新
  await updatePatternMomentum(analysis, collection);

  console.log("[TrendTracker] Report generated:", {
    period: collection.period,
    evaluationCount: collection.evaluationCount,
    emergingCount: analysis.emergingPatterns.length,
    decliningCount: analysis.decliningPatterns.length,
  });

  return { report, collection, analysis };
}

// ============================================================
// Pattern Momentum Update
// ============================================================

async function updatePatternMomentum(
  analysis: TrendAnalysisResult,
  collection: TrendCollectionResult,
): Promise<void> {
  try {
    const totalEvals = collection.evaluationCount || 1;

    for (const pattern of analysis.emergingPatterns) {
      const freq = collection.patternFrequency[pattern.name] || 0;
      const prevalence = freq / totalEvals;

      // 既存パターンを更新 or 新規作成
      const existing = await db.designPattern.findFirst({
        where: { name: pattern.name },
      });

      if (existing) {
        await db.designPattern.update({
          where: { id: existing.id },
          data: {
            momentum: Math.min(1.0, existing.momentum + 0.1),
            prevalence,
            lastSeen: new Date(),
          },
        });
      }
    }

    for (const pattern of analysis.decliningPatterns) {
      const existing = await db.designPattern.findFirst({
        where: { name: pattern.name },
      });

      if (existing) {
        await db.designPattern.update({
          where: { id: existing.id },
          data: {
            momentum: Math.max(-1.0, existing.momentum - 0.1),
          },
        });
      }
    }
  } catch (error) {
    console.error("[TrendTracker] Pattern momentum update failed:", error);
  }
}

// ============================================================
// Helpers
// ============================================================

function buildAnalysisPrompt(collected: TrendCollectionResult): string {
  return `以下のウェブデザイン評価データ（${collected.evaluationCount}サイト、期間: ${collected.period}）を分析し、トレンドレポートを生成してください。

## パターン出現頻度
${JSON.stringify(collected.patternFrequency, null, 2)}

## よく使われるカラー（上位10件）
${JSON.stringify(collected.colorSummary.slice(0, 10), null, 2)}

## よく使われるフォント（上位10件）
${JSON.stringify(collected.fontSummary.slice(0, 10), null, 2)}

## デザイントーン分布
${JSON.stringify(collected.toneSummary, null, 2)}

## レイアウトパターン分布
${JSON.stringify(collected.layoutSummary, null, 2)}

以下のJSON形式で回答してください：
{
  "emergingPatterns": [
    { "name": "パターン名", "direction": "rising", "strength": 0.0-1.0, "description": "説明" }
  ],
  "decliningPatterns": [
    { "name": "パターン名", "direction": "declining", "strength": 0.0-1.0, "description": "説明" }
  ],
  "colorTrends": [
    { "name": "トレンド名", "colors": ["#hex1", "#hex2"], "direction": "rising|stable|declining" }
  ],
  "typographyTrends": [
    { "name": "トレンド名", "fonts": ["Font1"], "direction": "rising|stable|declining" }
  ],
  "layoutTrends": [
    { "pattern": "パターン名", "prevalence": 0.0-1.0, "direction": "rising|stable|declining" }
  ],
  "summary": "全体的なトレンドの要約を3-4文で。"
}`;
}

function parseAnalysisResponse(
  text: string,
  collected: TrendCollectionResult,
): TrendAnalysisResult {
  try {
    let jsonStr = text.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    const data = JSON.parse(jsonStr);

    return {
      emergingPatterns: Array.isArray(data.emergingPatterns) ? data.emergingPatterns : [],
      decliningPatterns: Array.isArray(data.decliningPatterns) ? data.decliningPatterns : [],
      colorTrends: Array.isArray(data.colorTrends) ? data.colorTrends : [],
      typographyTrends: Array.isArray(data.typographyTrends) ? data.typographyTrends : [],
      layoutTrends: Array.isArray(data.layoutTrends) ? data.layoutTrends : [],
      summary: data.summary || "",
    };
  } catch {
    console.error("[TrendTracker] Failed to parse AI response, using rule-based");
    return generateRuleBasedAnalysis(collected);
  }
}

/**
 * AI が使えない場合のルールベース分析
 */
function generateRuleBasedAnalysis(
  collected: TrendCollectionResult,
): TrendAnalysisResult {
  const totalEvals = collected.evaluationCount || 1;

  // パターンを頻度順にソート
  const sortedPatterns = Object.entries(collected.patternFrequency)
    .sort(([, a], [, b]) => b - a);

  const emerging: PatternTrend[] = sortedPatterns
    .filter(([, count]) => count / totalEvals > 0.3)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      direction: "rising" as const,
      strength: count / totalEvals,
      description: `${totalEvals}サイト中${count}サイトで検出`,
    }));

  // レイアウトトレンド
  const layoutTrends: LayoutTrend[] = Object.entries(collected.layoutSummary)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([pattern, count]) => ({
      pattern,
      prevalence: count / totalEvals,
      direction: "stable" as const,
    }));

  // カラートレンド
  const colorTrends: ColorTrend[] = [];
  const topColors = collected.colorSummary.slice(0, 6);
  if (topColors.length > 0) {
    colorTrends.push({
      name: "頻出カラーパレット",
      colors: topColors.map((c) => c.hex),
      direction: "stable",
    });
  }

  // タイポグラフィトレンド
  const typographyTrends: TypographyTrend[] = [];
  const topFonts = collected.fontSummary.slice(0, 3);
  if (topFonts.length > 0) {
    typographyTrends.push({
      name: "人気フォント",
      fonts: topFonts.map((f) => f.family),
      direction: "stable",
    });
  }

  return {
    emergingPatterns: emerging,
    decliningPatterns: [],
    colorTrends,
    typographyTrends,
    layoutTrends,
    summary: `${collected.evaluationCount}サイトの分析結果。${emerging.length > 0 ? `注目パターン: ${emerging.map((e) => e.name).join(", ")}。` : ""}データ蓄積中のためトレンド判定は暫定値です。`,
  };
}

/**
 * ISO 8601 の週番号を取得
 */
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
