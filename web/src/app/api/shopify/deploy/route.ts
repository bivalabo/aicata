/**
 * Shopify テンプレートデプロイ API
 *
 * POST /api/shopify/deploy
 *
 * Aicata で生成したページをShopifyテーマにデプロイする
 * Online Store 2.0 のJSON テンプレート + sections + CSS として配置
 *
 * リクエストボディ:
 * {
 *   pageId: string;           // Aicata Page ID
 *   themeId?: number;         // デプロイ先テーマID（省略時はメインテーマ）
 *   templateSuffix?: string;  // テンプレートサフィックス（省略時は自動生成）
 *   templateId?: string;      // 使用するPageTemplate ID（省略時は自動選択）
 *   pageType?: string;        // ページタイプ（省略時はlanding）
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { getMainTheme, deployToTheme, putAsset } from "@/lib/shopify";
import { prisma } from "@/lib/db";
import {
  convertToLiquid,
  generateTemplateSuffix,
  convertGlobalSectionToLiquid,
  buildSectionGroup,
} from "@/lib/design-engine/liquid-converter";
import {
  selectBestTemplate,
  selectBestTemplates,
} from "@/lib/design-engine/template-selector";
import { analyzeDesignContext } from "@/lib/design-engine/context-analyzer";
import type { PageType } from "@/lib/design-engine/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pageId,
      themeId: requestedThemeId,
      templateSuffix,
      templateId: requestedTemplateId,
      pageType: requestedPageType,
    } = body;

    if (!pageId) {
      return NextResponse.json(
        { error: "pageId は必須です" },
        { status: 400 },
      );
    }

    // 1. ストア情報を取得
    const store = await prisma.store.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Shopifyストアが接続されていません。先にストアを接続してください。" },
        { status: 400 },
      );
    }

    // 2. ページ情報を取得
    const page = await prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return NextResponse.json(
        { error: "ページが見つかりません" },
        { status: 404 },
      );
    }

    // 3. テーマIDの決定
    let themeId = requestedThemeId;
    if (!themeId) {
      const mainTheme = await getMainTheme(store.shop, store.accessToken);
      if (!mainTheme) {
        return NextResponse.json(
          { error: "メインテーマが見つかりません" },
          { status: 500 },
        );
      }
      themeId = mainTheme.id;
    }

    // 4. PageTemplate の特定
    const resolvedPageType = (requestedPageType || "landing") as PageType;
    let pageTemplateId = requestedTemplateId;
    let pageTemplate;

    if (pageTemplateId) {
      // 指定されたテンプレートIDから探す
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
        (m) => m.template.id === pageTemplateId,
      )?.template;
    }

    if (!pageTemplate) {
      // 自動選択
      const context = analyzeDesignContext(page.title);
      context.pageType = resolvedPageType;
      const match = selectBestTemplate(context);
      if (match && match.score > 0.2) {
        pageTemplate = match.template;
        pageTemplateId = match.template.id;
      }
    }

    if (!pageTemplate) {
      return NextResponse.json(
        {
          error:
            "適切なテンプレートが見つかりません。templateId または pageType を指定してください。",
        },
        { status: 400 },
      );
    }

    // 5. Liquid変換
    const suffix =
      templateSuffix || generateTemplateSuffix(pageTemplate.id);
    const conversion = convertToLiquid(pageTemplate, suffix);

    console.log(
      `[Deploy] Converting ${pageTemplate.id} → ${conversion.meta.templateType}.aicata-${suffix}`,
    );
    console.log(
      `[Deploy] Sections: ${conversion.meta.sectionCount}, Missing: ${conversion.meta.missingSections.join(", ") || "none"}`,
    );

    // 6. Shopifyテーマにデプロイ
    const deployedFiles = await deployToTheme(
      store.shop,
      store.accessToken,
      themeId,
      {
        templateType: conversion.meta.templateType,
        templateSuffix: suffix,
        sectionFiles: conversion.sectionFiles,
        templateJson: conversion.templateJson.value,
        cssContent: conversion.cssAsset.value,
        globalCssContent: conversion.globalCssAsset.value,
      },
    );

    console.log(
      `[Deploy] Successfully deployed ${deployedFiles.length} files to theme ${themeId}`,
    );

    // 6b. ThemeLayout からヘッダー/フッターをデプロイ（存在する場合）
    const themeLayout = await prisma.themeLayout.findFirst({
      where: { storeId: store.id },
    });

    const globalSectionFiles: string[] = [];
    if (themeLayout) {
      // ヘッダーセクション
      const headerLiquid = convertGlobalSectionToLiquid(themeLayout.headerSectionId);
      if (headerLiquid) {
        await putAsset(store.shop, store.accessToken, themeId, headerLiquid);
        globalSectionFiles.push(headerLiquid.key);
      }

      // フッターセクション
      const footerLiquid = convertGlobalSectionToLiquid(themeLayout.footerSectionId);
      if (footerLiquid) {
        await putAsset(store.shop, store.accessToken, themeId, footerLiquid);
        globalSectionFiles.push(footerLiquid.key);
      }

      // ヘッダー/フッター グループJSON
      const headerGroup = buildSectionGroup("header", [themeLayout.headerSectionId]);
      await putAsset(store.shop, store.accessToken, themeId, headerGroup);
      globalSectionFiles.push(headerGroup.key);

      const footerGroup = buildSectionGroup("footer", [themeLayout.footerSectionId]);
      await putAsset(store.shop, store.accessToken, themeId, footerGroup);
      globalSectionFiles.push(footerGroup.key);

      console.log(
        `[Deploy] Global sections deployed: ${globalSectionFiles.join(", ")}`,
      );
    }

    // 7. ページのステータス更新
    await prisma.page.update({
      where: { id: pageId },
      data: {
        status: "synced",
      },
    });

    // 8. プレビューURL生成
    const previewUrl = buildPreviewUrl(
      store.shop,
      conversion.meta.templateType,
      suffix,
    );

    return NextResponse.json({
      success: true,
      deployment: {
        templateType: conversion.meta.templateType,
        templateSuffix: suffix,
        templateId: pageTemplateId,
        themeId,
        sectionCount: conversion.meta.sectionCount,
        filesDeployed: deployedFiles.length,
        files: deployedFiles,
      },
      previewUrl,
    });
  } catch (error) {
    console.error("[Deploy API Error]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "デプロイに失敗しました",
      },
      { status: 500 },
    );
  }
}

/**
 * Shopifyテーマプレビュー/管理URLを生成
 */
function buildPreviewUrl(
  shop: string,
  templateType: string,
  suffix: string,
): string {
  const cleanShop = shop.replace(/\.myshopify\.com$/, "");

  switch (templateType) {
    case "index":
      return `https://${cleanShop}.myshopify.com/?view=aicata-${suffix}`;
    case "product":
      return `https://${cleanShop}.myshopify.com/admin/themes/current/editor?template=product.aicata-${suffix}`;
    case "collection":
      return `https://${cleanShop}.myshopify.com/admin/themes/current/editor?template=collection.aicata-${suffix}`;
    case "cart":
      return `https://${cleanShop}.myshopify.com/admin/themes/current/editor?template=cart.aicata-${suffix}`;
    default:
      return `https://${cleanShop}.myshopify.com/admin/themes/current/editor?template=${templateType}.aicata-${suffix}`;
  }
}
