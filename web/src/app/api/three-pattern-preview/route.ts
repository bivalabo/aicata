/**
 * 3パターンプレビュー API
 *
 * POST /api/three-pattern-preview
 * DNA座標に最も近い3つのテンプレートで、
 * ヒーローセクションのみを高速プレビュー生成（AI不使用）
 *
 * ユーザーが1つを選択 → その後フルパイプラインで完成
 */
import { generateThreePatternPreview } from "@/lib/ddp-next";
import type { DDPNextInput } from "@/lib/ddp-next";
import { getActiveBrandMemory } from "@/lib/brand-memory";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageType, industry, tones, brandName, userInstructions } = body;

    if (!pageType) {
      return Response.json(
        { error: "pageType は必須です" },
        { status: 400 },
      );
    }

    // Brand Memory + Emotional DNA を取得
    let brandMemory: DDPNextInput["brandMemory"];
    let emotionalDna: DDPNextInput["emotionalDna"];
    try {
      const bm = await getActiveBrandMemory();
      if (bm) {
        brandMemory = {
          brandName: bm.brandName,
          industry: bm.industry,
          tones: bm.tones,
          colors: {
            primary: bm.primaryColor,
            secondary: bm.secondaryColor,
            accent: bm.accentColor,
          },
          fonts: [bm.primaryFont, bm.bodyFont].filter(Boolean),
        };
        if (bm.emotionalDna) {
          emotionalDna = bm.emotionalDna;
        }
      }
    } catch { /* non-fatal */ }

    // ストアID
    const store = await prisma.store.findFirst({ orderBy: { updatedAt: "desc" } }).catch(() => null);

    const input: DDPNextInput = {
      pageType: pageType || "landing",
      industry: industry || "general",
      tones: tones || ["modern"],
      brandName,
      userInstructions,
      brandMemory,
      emotionalDna,
      storeId: store?.id,
    };

    const result = await generateThreePatternPreview(input);

    return Response.json({
      success: true,
      intent: {
        pageType: result.intent.contentRequirements.pageType,
        industry: result.intent.contentRequirements.industry,
        tones: result.intent.contentRequirements.tones,
        confidence: result.intent.confidence,
      },
      previews: result.previews.map((p) => ({
        templateId: p.templateId,
        templateName: p.templateName,
        score: p.score,
        heroHtml: p.heroHtml,
        designTokens: p.designTokens,
      })),
    });
  } catch (error) {
    console.error("[Three Pattern Preview] Error:", error);
    return Response.json(
      { error: "プレビュー生成に失敗しました" },
      { status: 500 },
    );
  }
}
