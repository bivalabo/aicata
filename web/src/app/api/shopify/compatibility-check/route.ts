/**
 * Shopify互換性チェック API
 *
 * POST /api/shopify/compatibility-check
 *
 * デプロイ前にShopify互換性を検証し、問題があれば警告/エラーを返す
 *
 * リクエストボディ:
 * {
 *   templateId?: string;   // PageTemplate ID（省略時は自動選択）
 *   pageType?: string;     // ページタイプ（省略時はlanding）
 *   pageId?: string;       // Page IDから自動判別
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  checkCompatibility,
  type CompatibilityReport,
} from "@/lib/design-engine/compatibility-checker";
import {
  selectBestTemplate,
  selectBestTemplates,
} from "@/lib/design-engine/template-selector";
import { analyzeDesignContext } from "@/lib/design-engine/context-analyzer";
import type { PageType } from "@/lib/design-engine/types";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      templateId: requestedTemplateId,
      pageType: requestedPageType,
      pageId,
    } = body;

    // ページタイトルを取得（pageIdが指定されている場合）
    let pageTitle = "";
    if (pageId) {
      const page = await prisma.page.findUnique({
        where: { id: pageId },
        select: { title: true, pageType: true },
      });
      if (page) {
        pageTitle = page.title;
      }
    }

    // PageTemplate の特定
    const resolvedPageType = (requestedPageType || "landing") as PageType;
    let pageTemplate;

    if (requestedTemplateId) {
      const allMatches = selectBestTemplates(
        {
          industry: "general",
          pageType: resolvedPageType,
          tones: [],
          cssFeatures: [],
          keywords: [],
          confidence: 1.0,
        },
        undefined,
        100,
      );
      pageTemplate = allMatches.find(
        (m) => m.template.id === requestedTemplateId,
      )?.template;
    }

    if (!pageTemplate) {
      const context = analyzeDesignContext(pageTitle || "landing page");
      context.pageType = resolvedPageType;
      const match = selectBestTemplate(context);
      if (match && match.score > 0.2) {
        pageTemplate = match.template;
      }
    }

    if (!pageTemplate) {
      return NextResponse.json(
        { error: "テンプレートが見つかりません" },
        { status: 400 },
      );
    }

    // 互換性チェック実行
    const report: CompatibilityReport = checkCompatibility(pageTemplate, {
      shopifyApiVersion: "2025-04",
      checkAccessibility: true,
      checkDeprecated: true,
      checkPerformance: true,
    });

    // 結果のサマリー
    const errorCount = report.issues.filter((i) => i.level === "error").length;
    const warningCount = report.issues.filter((i) => i.level === "warning").length;

    return NextResponse.json({
      report,
      summary: {
        passed: report.passed,
        errorCount,
        warningCount,
        templateId: pageTemplate.id,
        checkedAt: report.checkedAt,
      },
    });
  } catch (error) {
    console.error("[Compatibility Check API Error]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "互換性チェックに失敗しました",
      },
      { status: 500 },
    );
  }
}
