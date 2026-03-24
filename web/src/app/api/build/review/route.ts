import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { reviewPage } from "@/lib/ddp/stage4-reviewer";
import type { DDPConfig } from "@/lib/ddp/types";

export const maxDuration = 60; // レビューは1回のAPI call（~15秒）

/**
 * POST /api/build/review
 *
 * Step 4: 品質レビュー（DDP Stage 4 — オプション）
 * - 完成ページを評価し、改善提案を生成
 * - スコアが低い場合は修正版HTMLを提供
 * - BuildJobにレビュー結果を保存
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

    // BuildJob を取得
    const buildJob = await prisma.buildJob.findUnique({
      where: { id: buildId },
    });

    if (!buildJob) {
      return NextResponse.json(
        { error: `ビルドジョブ ${buildId} が見つかりません` },
        { status: 404 },
      );
    }

    if (!buildJob.fullDocument) {
      return NextResponse.json(
        { error: "完成ドキュメントがありません。先にassembleを実行してください。" },
        { status: 400 },
      );
    }

    // Anthropic クライアント
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const config: DDPConfig = {
      specModel: "claude-sonnet-4-20250514",
      sectionModel: process.env.CLAUDE_MODEL_DEFAULT || "claude-sonnet-4-20250514",
      specMaxTokens: 4096,
      sectionMaxTokens: 4096,
      sectionConcurrency: 1,
      timeoutMs: 50000,
    };

    // 簡易DDPInput（レビュー用）
    const ddpInput = {
      pageType: buildJob.pageType,
      industry: "general",
      tones: ["modern"],
      keywords: [],
      userInstructions: buildJob.userInstructions,
    };

    console.log("[Build/Review] Starting quality review for build:", buildId);

    const review = await reviewPage(client, buildJob.fullDocument, config, ddpInput);

    console.log("[Build/Review] Review complete:", {
      overallScore: review.overallScore,
      suggestions: review.suggestions.length,
      hasOptimized: !!(review.optimizedHtml),
    });

    // レビュー結果をBuildJobに保存
    let updatedFullDocument = buildJob.fullDocument;

    // スコアが低い場合、修正版HTMLを適用
    if (review.optimizedHtml && review.overallScore < 70) {
      console.log("[Build/Review] Applying optimized version (score < 70)");
      updatedFullDocument = review.optimizedHtml;
      if (review.optimizedCss) {
        // CSSも差し替え
        const fontsLink = buildJob.fullDocument.match(/<link[^>]*fonts[^>]*>/gi)?.join("\n") || "";
        updatedFullDocument = `${fontsLink}\n\n<style>\n${review.optimizedCss}\n</style>\n\n${review.optimizedHtml}`;
      }
    }

    await prisma.buildJob.update({
      where: { id: buildId },
      data: {
        reviewResult: JSON.stringify(review),
        fullDocument: updatedFullDocument,
        status: "complete",
      },
    });

    return NextResponse.json({
      buildId,
      review: {
        overallScore: review.overallScore,
        scores: review.scores,
        suggestions: review.suggestions,
        hasOptimizedVersion: !!(review.optimizedHtml),
      },
      fullDocument: updatedFullDocument,
    });
  } catch (error) {
    console.error("[Build/Review] Error:", error);
    // レビュー失敗は致命的ではない — 結果なしで返す
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "レビューに失敗しました", nonFatal: true },
      { status: 500 },
    );
  }
}
