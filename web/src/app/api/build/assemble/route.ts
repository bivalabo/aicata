import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assembleAndValidate } from "@/lib/ddp/stage3-harmony-assembler";
import type { DesignSpec, RenderedSection } from "@/lib/ddp/types";

export const maxDuration = 10; // 組み立ては決定的処理のみ（AI不要）

/**
 * POST /api/build/assemble
 *
 * Step 3: ページ組み立て（DDP Stage 3）
 * - 全セクションを結合してフルページHTML/CSSを生成
 * - AIは使わない（決定的処理のみ）
 * - BuildJobにフルドキュメントを保存
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buildId } = body;

    if (!buildId) {
      return NextResponse.json(
        { error: "buildId は必須です" },
        { status: 400 },
      );
    }

    // BuildJob と全セクションを取得
    const buildJob = await prisma.buildJob.findUnique({
      where: { id: buildId },
      include: {
        sections: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!buildJob) {
      return NextResponse.json(
        { error: `ビルドジョブ ${buildId} が見つかりません` },
        { status: 404 },
      );
    }

    if (!buildJob.designSpec) {
      return NextResponse.json(
        { error: "DesignSpecが見つかりません。先にplanを実行してください。" },
        { status: 400 },
      );
    }

    // DesignSpec を復元
    const designSpec: DesignSpec = JSON.parse(buildJob.designSpec);

    // セクション完了状況をチェック
    const completedSections = buildJob.sections.filter(
      (s) => s.status === "complete" && s.html,
    );
    const failedSections = buildJob.sections.filter(
      (s) => s.status === "failed",
    );
    const pendingSections = buildJob.sections.filter(
      (s) => s.status === "pending" || s.status === "generating",
    );

    console.log("[Build/Assemble] Section status:", {
      total: buildJob.sections.length,
      completed: completedSections.length,
      failed: failedSections.length,
      pending: pendingSections.length,
    });

    // pending がある場合は警告（ただし組み立ては可能）
    if (pendingSections.length > 0) {
      console.warn(
        `[Build/Assemble] ${pendingSections.length} sections still pending`,
      );
    }

    // RenderedSection[] に変換
    const renderedSections: RenderedSection[] = buildJob.sections.map((s) => ({
      id: s.sectionId,
      html: s.html || `<section data-section-id="${s.sectionId}"><p>（セクション未生成）</p></section>`,
      css: s.css || "",
      status: (s.status === "complete" ? "success" : "failed") as "success" | "failed",
      error: s.error || undefined,
    }));

    // Stage 3: Harmony Assembler（決定的処理 — AI不使用）
    const result = assembleAndValidate(designSpec, renderedSections);

    console.log("[Build/Assemble] Assembly complete:", {
      htmlLength: result.html.length,
      cssLength: result.css.length,
      valid: result.validation.isValid,
      autoFixed: result.validation.autoFixedIssues.length,
    });

    // BuildJobを更新
    await prisma.buildJob.update({
      where: { id: buildId },
      data: {
        assembledHtml: result.html,
        assembledCss: result.css,
        fullDocument: result.fullDocument,
        status: "complete",
      },
    });

    return NextResponse.json({
      buildId,
      fullDocument: result.fullDocument,
      html: result.html,
      css: result.css,
      validation: result.validation,
      stats: {
        totalSections: buildJob.sections.length,
        completedSections: completedSections.length,
        failedSections: failedSections.length,
      },
    });
  } catch (error) {
    console.error("[Build/Assemble] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ページ組み立てに失敗しました" },
      { status: 500 },
    );
  }
}
