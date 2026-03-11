import { sendChatMessage, type ChatMessage } from "./claude-client";
import type { SectionSchema, GeneratedPage } from "~/types";

/**
 * Liquidテンプレート生成エンジン
 *
 * AIとの会話で確定したデザイン要件を、
 * Shopify Online Store 2.0準拠のLiquidテンプレートに変換する
 */

interface GeneratePageOptions {
  shopDomain: string;
  pageType: string;
  requirements: string;
  designDNA?: Record<string, unknown>;
  existingThemeInfo?: Record<string, unknown>;
}

/**
 * ページ全体のLiquidテンプレートを生成
 */
export async function generatePage(
  options: GeneratePageOptions,
): Promise<GeneratedPage> {
  const { shopDomain, pageType, requirements, designDNA } = options;

  // ページ生成用の専用プロンプトを構築
  const systemContext = buildPageGenerationPrompt(pageType, designDNA);

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: `以下の要件に基づいて、Shopify Online Store 2.0準拠のLiquidテンプレートを生成してください。

## 要件
${requirements}

## 出力形式
以下の形式で出力してください:

1. セクションスキーマ（JSON）
2. Liquidテンプレートコード
3. スコープドCSS
4. 必要に応じてJavaScript

各セクションは独立したファイルとして出力し、\`\`\`liquid\`\`\` \`\`\`json\`\`\` \`\`\`css\`\`\` のコードブロックで囲んでください。`,
    },
  ];

  const response = await sendChatMessage(messages, {
    shopDomain,
    conversationType: "PAGE_DESIGN",
    model: "claude-sonnet-4-20250514", // ページ生成にはSonnetで十分
    maxTokens: 8192, // コード生成は長くなるため
    storeContext: designDNA,
  });

  // レスポンスからコードを抽出・構造化
  return parseGeneratedPage(response.content);
}

/**
 * 単一セクションの生成
 */
export async function generateSection(
  shopDomain: string,
  sectionType: string,
  requirements: string,
  designDNA?: Record<string, unknown>,
): Promise<{
  schema: SectionSchema;
  liquid: string;
  css: string;
}> {
  const messages: ChatMessage[] = [
    {
      role: "user",
      content: `Shopify Online Store 2.0の「${sectionType}」セクションを生成してください。

## 要件
${requirements}

## 技術要件
- セクションスキーマはJSON形式で \`{% schema %}\` タグ内に配置
- CSSは \`{% stylesheet %}\` タグまたは \`<style>\` タグ内にスコープド
- BEM命名規則を使用
- モバイルファーストのレスポンシブデザイン
- 日本語テキストに最適化（line-height: 1.8, letter-spacing: 0.05em）
- 画像は必ず loading="lazy" と alt属性を設定

\`\`\`liquid\`\`\` と \`\`\`json\`\`\` のコードブロックで出力してください。`,
    },
  ];

  const response = await sendChatMessage(messages, {
    shopDomain,
    conversationType: "PAGE_DESIGN",
    storeContext: designDNA,
  });

  return parseSectionResponse(response.content);
}

// ===== ヘルパー関数 =====

function buildPageGenerationPrompt(
  pageType: string,
  designDNA?: Record<string, unknown>,
): string {
  const pageTypeGuide: Record<string, string> = {
    LANDING_PAGE: `縦長のランディングページ。ファーストビュー→特徴→実績→CTA の流れ。
日本のEC市場では、情報量が多く、スクロールで読み進めるLP が効果的。`,
    PRODUCT_PAGE: `商品詳細ページ。高品質な商品画像、詳細な説明、レビュー、関連商品を含む。
日本の消費者は商品情報を詳細に確認する傾向がある。`,
    COLLECTION_PAGE: `商品一覧ページ。フィルター、ソート、グリッド/リスト切り替えを含む。
見やすく、比較しやすいレイアウトを重視。`,
    ABOUT_PAGE: `ブランドストーリーページ。企業理念、沿革、チーム紹介を含む。
信頼感と共感を生むビジュアルストーリーテリング。`,
    CAMPAIGN_PAGE: `キャンペーン/セールページ。カウントダウンタイマー、限定感、CTAを強調。
日本の季節商戦に最適化。`,
  };

  let prompt = `ページタイプ: ${pageType}\n`;
  prompt += pageTypeGuide[pageType] || "";

  if (designDNA) {
    prompt += `\n\nデザインDNA:\n${JSON.stringify(designDNA, null, 2)}`;
  }

  return prompt;
}

function parseGeneratedPage(content: string): GeneratedPage {
  const liquidBlocks = extractBlocks(content, "liquid");
  const jsonBlocks = extractBlocks(content, "json");
  const cssBlocks = extractBlocks(content, "css");
  const jsBlocks = extractBlocks(content, "javascript");

  // JSONブロックからセクションスキーマをパース
  const sections = jsonBlocks.map((jsonStr, index) => {
    let schema: SectionSchema;
    try {
      schema = JSON.parse(jsonStr);
    } catch {
      schema = { name: `section-${index}`, settings: [] };
    }

    return {
      name: schema.name || `section-${index}`,
      schema,
      liquidContent: liquidBlocks[index] || "",
    };
  });

  return {
    liquidCode: liquidBlocks.join("\n\n"),
    cssCode: cssBlocks.length > 0 ? cssBlocks.join("\n\n") : undefined,
    jsCode: jsBlocks.length > 0 ? jsBlocks.join("\n\n") : undefined,
    sections,
  };
}

function parseSectionResponse(content: string): {
  schema: SectionSchema;
  liquid: string;
  css: string;
} {
  const liquidBlocks = extractBlocks(content, "liquid");
  const jsonBlocks = extractBlocks(content, "json");
  const cssBlocks = extractBlocks(content, "css");

  let schema: SectionSchema = { name: "section", settings: [] };
  if (jsonBlocks.length > 0) {
    try {
      schema = JSON.parse(jsonBlocks[0]);
    } catch {
      // fallback
    }
  }

  return {
    schema,
    liquid: liquidBlocks[0] || "",
    css: cssBlocks[0] || "",
  };
}

function extractBlocks(text: string, language: string): string[] {
  const regex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``, "g");
  const blocks: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}
