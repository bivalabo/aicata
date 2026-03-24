import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { generateDesignSpec } from "@/lib/ddp/stage1-design-director";
import { buildDDPInput } from "@/lib/ddp/build-helpers";
import type { DDPConfig } from "@/lib/ddp/types";

export const maxDuration = 60; // 60秒で十分（Stage1のみ）

/**
 * POST /api/build/plan
 *
 * Step 1: デザイン設計（DDP Stage 1）
 * - サイト分析データを元にDesignSpecを生成
 * - BuildJobレコードを作成し、セクション一覧をBuildSectionとして保存
 * - 各リクエストは独立して完結（タイムアウトリスクなし）
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, pageType, userInstructions, urlAnalysis, conversationId } = body;

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

    // Anthropic クライアント
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // DDPConfig
    const config: DDPConfig = {
      specModel: "claude-sonnet-4-20250514",
      sectionModel: "claude-sonnet-4-20250514",
      specMaxTokens: 4096,
      sectionMaxTokens: 4096,
      sectionConcurrency: 3,
      timeoutMs: 50000, // Stage1のみなので50秒で十分
    };

    // DDPInput構築
    const ddpInput = buildDDPInput(
      userInstructions || `${url} のサイトをリビルドしてください`,
      pageType || "landing",
      urlAnalysis || undefined,
      undefined, // brandMemory - TODO: fetch from DB
    );

    // Stage 1: DesignSpec生成
    console.log("[Build/Plan] Starting Stage 1: Design Director");
    const designSpec = await generateDesignSpec(client, ddpInput, config);
    // コスト制御: DDP_MAX_SECTIONS でセクション数を制限
    const maxSections = parseInt(process.env.DDP_MAX_SECTIONS || "0", 10);
    if (maxSections > 0 && designSpec.sections.length > maxSections) {
      console.log(`[Build/Plan] Limiting sections: ${designSpec.sections.length} → ${maxSections}`);
      designSpec.sections = designSpec.sections.slice(0, maxSections);
    }

    console.log("[Build/Plan] Stage 1 complete:", {
      sectionsCount: designSpec.sections.length,
      colors: designSpec.colors?.primary,
      fonts: designSpec.typography?.headingFont,
    });

    // BuildJobを作成
    const buildJob = await prisma.buildJob.create({
      data: {
        conversationId: conversationId || undefined,
        pageType: pageType || "landing",
        url: url || undefined,
        userInstructions: userInstructions || "",
        status: "building",
        designSpec: JSON.stringify(designSpec),
      },
    });

    // 各セクションをBuildSectionとして保存
    const sectionRecords = await Promise.all(
      designSpec.sections.map((section, index) =>
        prisma.buildSection.create({
          data: {
            buildId: buildJob.id,
            sectionId: section.id,
            spec: JSON.stringify(section),
            status: "pending",
            sortOrder: index,
          },
        }),
      ),
    );

    type SectionRecord = { id: string; sectionId: string; sortOrder: number; status: string };
    return NextResponse.json({
      buildId: buildJob.id,
      designSpec,
      sections: sectionRecords.map((s: SectionRecord) => ({
        id: s.id,
        sectionId: s.sectionId,
        sortOrder: s.sortOrder,
        status: s.status,
      })),
    });
  } catch (error) {
    console.error("[Build/Plan] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "計画の作成に失敗しました" },
      { status: 500 },
    );
  }
}
