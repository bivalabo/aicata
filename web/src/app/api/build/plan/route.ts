import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { runDDPNextPipeline } from "@/lib/ddp-next";
import type { DDPNextInput } from "@/lib/ddp-next";
import type { IndustryType, DesignTone } from "@/lib/design-engine/types";
import { detectIndustry, detectTones } from "@/lib/ddp-next/intent-analyzer";

export const maxDuration = 60;

/**
 * POST /api/build/plan
 *
 * DDP Next パイプラインで1ページ全体を生成する。
 * 旧4ステップ（plan → section → assemble → review）を統合。
 *
 * DDP Next は HTML/CSS を一から生成しない。
 * 人が評価したプリビルト部品を組み立て、AI は Phase 4 の
 * コンテンツパーソナライゼーションのみ担当する。
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, pageType, userInstructions, urlAnalysis, conversationId, brandMemory } = body;

    if (!url && !userInstructions) {
      return NextResponse.json(
        { error: "url または userInstructions は必須です" },
        { status: 400 },
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY が設定されていません" },
        { status: 500 },
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // DDPNextInput 構築
    const text = userInstructions || `${url} のサイトをリビルドしてください`;
    const detectedIndustry = (brandMemory?.industry || detectIndustry(text) || "general") as IndustryType;
    const detectedTones = (brandMemory?.tones || detectTones(text) || ["modern"]) as DesignTone[];
    const store = await prisma.store.findFirst({ orderBy: { updatedAt: "desc" } }).catch(() => null);

    const ddpNextInput: DDPNextInput = {
      pageType: (pageType || "landing") as any,
      industry: detectedIndustry,
      brandName: brandMemory?.brandName || undefined,
      tones: detectedTones,
      userInstructions: text,
      urlAnalysis: urlAnalysis as any,
      brandMemory: brandMemory ? {
        brandName: brandMemory.brandName,
        industry: detectedIndustry as string,
        tones: detectedTones as string[],
        colors: brandMemory.colors,
        fonts: brandMemory.fonts,
      } : undefined,
      storeId: store?.id,
    };

    // DDP Next パイプライン実行
    console.log("[Build/Plan] Starting DDP Next pipeline");
    const result = await runDDPNextPipeline(ddpNextInput, (event) => {
      console.log(`[Build/Plan] ${event.phase}: ${event.message} (${event.progress}%)`);
    }, client);

    console.log("[Build/Plan] DDP Next pipeline complete:", {
      templateId: result.templateId,
      totalMs: Math.round(result.timing.total),
      tokenUsage: result.tokenUsage,
    });

    // DB に保存（Page レコード）
    let pageId: string | undefined;
    try {
      const page = await (prisma.page.create as any)({
        data: {
          title: `Generated: ${pageType || "landing"}`,
          slug: "",
          html: result.html,
          css: result.css,
          status: "draft",
          source: "aicata",
          version: 1,
          conversationId: conversationId || undefined,
          pageType: pageType || "landing",
        },
      });
      pageId = page.id;

      await prisma.pageVersion.create({
        data: {
          pageId: page.id,
          version: 1,
          html: result.html,
          css: result.css,
          prompt: text.slice(0, 500),
        },
      });
    } catch (dbErr) {
      console.warn("[Build/Plan] DB save failed (non-fatal):", dbErr);
    }

    return NextResponse.json({
      pageId,
      fullDocument: result.fullDocument,
      html: result.html,
      css: result.css,
      templateId: result.templateId,
      timing: result.timing,
      tokenUsage: result.tokenUsage,
    });
  } catch (error) {
    console.error("[Build/Plan] Error:", error);
    return NextResponse.json(
      { error: "ページ生成に失敗しました。しばらく時間をおいて再度お試しください。" },
      { status: 500 },
    );
  }
}
