// ============================================================
// Design Harvester — AI Block Classifier
// Claude CLI (Max Plan) を使用してブロックのメタデータを生成
// ※ Anthropic API ではなく Max Plan 内で処理
// ============================================================

import { execFile } from "child_process";
import { promisify } from "util";
import type {
  BlockClassification,
  ExtractedBlock,
  DesignDNA10D,
  HumanQualityScore5D,
  Placeholder,
  AnimationDef,
} from "./types";

const execFileAsync = promisify(execFile);

/** Claude CLI のパス（環境変数で上書き可能） */
const CLAUDE_CLI = process.env.CLAUDE_CLI_PATH || "claude";

/** Claude CLI 実行タイムアウト */
const CLI_TIMEOUT = 120_000; // 2 minutes

/**
 * Claude CLI を使ってプロンプトを実行する
 * Max Plan のサブスクリプション内で処理される
 */
async function runClaudeCLI(prompt: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync(
      CLAUDE_CLI,
      ["-p", prompt, "--output-format", "json"],
      {
        timeout: CLI_TIMEOUT,
        maxBuffer: 10 * 1024 * 1024, // 10MB
        env: {
          ...process.env,
          // Claude CLI が Max Plan の認証を使う
        },
      },
    );
    // Claude CLI の JSON 出力からレスポンスを抽出
    try {
      const parsed = JSON.parse(stdout);
      return parsed.result || parsed.content || stdout;
    } catch {
      return stdout;
    }
  } catch (error) {
    const err = error as Error & { code?: string; stderr?: string };
    if (err.code === "ENOENT") {
      throw new Error(
        "Claude CLI が見つかりません。Claude CLI をインストールし、PATH に追加してください。",
      );
    }
    throw new Error(`Claude CLI エラー: ${err.stderr || err.message}`);
  }
}

/**
 * 抽出されたブロックをAIで分類する
 */
export async function classifyBlock(
  block: ExtractedBlock,
  sourceUrl: string,
): Promise<BlockClassification> {
  const prompt = buildClassificationPrompt(block, sourceUrl);
  const response = await runClaudeCLI(prompt);
  return parseClassificationResponse(response, block);
}

/**
 * 複数ブロックをバッチ分類する
 */
export async function classifyBlocks(
  blocks: ExtractedBlock[],
  sourceUrl: string,
  concurrency: number = 3,
): Promise<BlockClassification[]> {
  const results: BlockClassification[] = [];

  // 並列度を制限しながら処理
  for (let i = 0; i < blocks.length; i += concurrency) {
    const batch = blocks.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map((block) => classifyBlock(block, sourceUrl)),
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        console.error("[Harvester] Classification failed:", result.reason);
        // フォールバック: 基本的なメタデータで登録
        results.push(createFallbackClassification(blocks[i]));
      }
    }
  }

  return results;
}

/**
 * 分類用のプロンプトを構築
 */
function buildClassificationPrompt(
  block: ExtractedBlock,
  sourceUrl: string,
): string {
  // HTMLを5000文字に制限（トークン節約）
  const truncatedHtml =
    block.html.length > 5000
      ? block.html.slice(0, 5000) + "\n<!-- truncated -->"
      : block.html;

  // CSSを3000文字に制限
  const truncatedCss =
    block.css.length > 3000
      ? block.css.slice(0, 3000) + "\n/* truncated */"
      : block.css;

  return `あなたはウェブデザインの専門家AIです。以下のHTMLセクションを分析し、JSON形式でメタデータを生成してください。

## 元サイト
${sourceUrl}

## HTML
\`\`\`html
${truncatedHtml}
\`\`\`

## CSS
\`\`\`css
${truncatedCss}
\`\`\`

## computedStyles
${JSON.stringify(block.computedStyles, null, 2)}

## 出力指示
以下のJSON構造を **必ず** 返してください。JSONのみを返し、説明文は不要です。

\`\`\`json
{
  "sectionCategory": "hero | features | testimonials | pricing | cta | faq | gallery | product-showcase | collection | about | contact | newsletter | stats | team | logo-bar | blog | header | footer | generic",
  "sectionVariant": "string (例: split-image, centered-text, grid-3col, carousel)",
  "designDna": {
    "minimalism": 0.0-1.0,
    "whitespace": 0.0-1.0,
    "contrast": 0.0-1.0,
    "animationIntensity": 0.0-1.0,
    "serifAffinity": 0.0-1.0,
    "colorSaturation": 0.0-1.0,
    "layoutComplexity": 0.0-1.0,
    "imageWeight": 0.0-1.0,
    "asymmetry": 0.0-1.0,
    "novelty": 0.0-1.0
  },
  "hqs": {
    "typography": 0-100,
    "colorHarmony": 0-100,
    "spacing": 0-100,
    "hierarchy": 0-100,
    "polish": 0-100
  },
  "tones": ["luxury", "minimal", "bold", "natural", "playful", "corporate"],
  "flowsWellAfter": ["hero", "header"],
  "flowsWellBefore": ["cta", "footer"],
  "pageTypes": ["landing", "product", "collection", "about", "blog"],
  "placeholders": [
    {
      "selector": "CSS selector",
      "type": "text | image | link | price | button | icon",
      "label": "説明",
      "defaultValue": "デフォルト値"
    }
  ],
  "animations": [
    {
      "selector": "CSS selector",
      "type": "fade-in | slide-up | parallax | scale | reveal",
      "trigger": "scroll | load | hover",
      "duration": 300,
      "delay": 0
    }
  ]
}
\`\`\`

重要な注意:
- sectionCategoryは元のclass名から推定するのではなく、**デザインの機能と内容**から判断してください
- designDnaは実際のCSSプロパティから客観的に算出してください
- hqsは業界水準を100としたときの相対スコアです
- tonesは複数可（最大3つ）
- flowsWellAfter/Before は、このセクションの前後に来ると自然なセクションタイプです
- placeholdersはShopifyテーマ化する際に動的に差し替えるべき要素です`;
}

/**
 * Claude CLI のレスポンスをパースして BlockClassification に変換
 */
function parseClassificationResponse(
  response: string,
  block: ExtractedBlock,
): BlockClassification {
  // JSONブロックを抽出
  const jsonMatch = response.match(/```json\s*([\s\S]*?)```/) ||
    response.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.warn("[Harvester] Failed to parse classification response, using fallback");
    return createFallbackClassification(block);
  }

  try {
    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const data = JSON.parse(jsonStr);

    return {
      sectionCategory: data.sectionCategory || block.sectionCategory,
      sectionVariant: data.sectionVariant || "",
      designDna: validateDNA(data.designDna),
      hqs: validateHQS(data.hqs),
      tones: Array.isArray(data.tones) ? data.tones.slice(0, 3) : [],
      flowsWellAfter: Array.isArray(data.flowsWellAfter) ? data.flowsWellAfter : [],
      flowsWellBefore: Array.isArray(data.flowsWellBefore) ? data.flowsWellBefore : [],
      pageTypes: Array.isArray(data.pageTypes) ? data.pageTypes : ["landing"],
      placeholders: validatePlaceholders(data.placeholders),
      animations: validateAnimations(data.animations),
    };
  } catch (e) {
    console.warn("[Harvester] JSON parse error:", e);
    return createFallbackClassification(block);
  }
}

/** DNA値を0-1にクランプ */
function validateDNA(dna: Partial<DesignDNA10D> | undefined): DesignDNA10D {
  const defaults: DesignDNA10D = {
    minimalism: 0.5,
    whitespace: 0.5,
    contrast: 0.5,
    animationIntensity: 0.2,
    serifAffinity: 0.3,
    colorSaturation: 0.5,
    layoutComplexity: 0.5,
    imageWeight: 0.5,
    asymmetry: 0.3,
    novelty: 0.5,
  };
  if (!dna) return defaults;

  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof DesignDNA10D)[]) {
    if (typeof dna[key] === "number") {
      result[key] = Math.max(0, Math.min(1, dna[key]!));
    }
  }
  return result;
}

/** HQS値を0-100にクランプ */
function validateHQS(hqs: Partial<HumanQualityScore5D> | undefined): HumanQualityScore5D {
  const defaults: HumanQualityScore5D = {
    typography: 70,
    colorHarmony: 70,
    spacing: 70,
    hierarchy: 70,
    polish: 70,
  };
  if (!hqs) return defaults;

  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof HumanQualityScore5D)[]) {
    if (typeof hqs[key] === "number") {
      result[key] = Math.max(0, Math.min(100, Math.round(hqs[key]!)));
    }
  }
  return result;
}

function validatePlaceholders(arr: unknown): Placeholder[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(
      (p): p is Placeholder =>
        p && typeof p.selector === "string" && typeof p.type === "string",
    )
    .slice(0, 20);
}

function validateAnimations(arr: unknown): AnimationDef[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(
      (a): a is AnimationDef =>
        a && typeof a.selector === "string" && typeof a.type === "string",
    )
    .slice(0, 10);
}

/** フォールバック: AIが使えない場合のデフォルト分類 */
function createFallbackClassification(block: ExtractedBlock): BlockClassification {
  return {
    sectionCategory: block.sectionCategory || "generic",
    sectionVariant: block.sectionVariant || "",
    designDna: {
      minimalism: 0.5,
      whitespace: 0.5,
      contrast: 0.5,
      animationIntensity: 0.2,
      serifAffinity: 0.3,
      colorSaturation: 0.5,
      layoutComplexity: 0.5,
      imageWeight: 0.5,
      asymmetry: 0.3,
      novelty: 0.5,
    },
    hqs: {
      typography: 70,
      colorHarmony: 70,
      spacing: 70,
      hierarchy: 70,
      polish: 70,
    },
    tones: [],
    flowsWellAfter: [],
    flowsWellBefore: [],
    pageTypes: ["landing"],
    placeholders: [],
    animations: [],
  };
}
