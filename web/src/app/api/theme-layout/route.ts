/**
 * ThemeLayout API
 *
 * GET  /api/theme-layout — 現在のThemeLayout設定を取得
 * PUT  /api/theme-layout — ThemeLayout設定を更新
 * POST /api/theme-layout — ThemeLayout を新規作成（初回セットアップ）
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ── ナビゲーション/フッターの選択肢定義 ──
const HEADER_OPTIONS = [
  { id: "nav-elegant-dropdown", name: "Elegant Dropdown", nameJa: "エレガント ドロップダウン", description: "洗練されたアニメーションドロップダウンメニュー。ラグジュアリー・ビューティブランド向け。" },
  { id: "nav-minimal-sticky", name: "Minimal Sticky", nameJa: "ミニマル スティッキー", description: "スクロール追従する最小限のナビゲーション。モダン・テック・ミニマルブランド向け。" },
  { id: "nav-mega-menu", name: "Mega Menu", nameJa: "メガメニュー", description: "大規模なカテゴリ構造を持つ3段階メガメニュー。豊富な商品ラインナップ向け。" },
  { id: "nav-transparent-overlay", name: "Transparent Overlay", nameJa: "トランスペアレント オーバーレイ", description: "ヒーロー画像の上に重なる透明ナビゲーション。ファッション・ライフスタイル向け。" },
  { id: "nav-category-tabs", name: "Category Tabs", nameJa: "カテゴリータブ", description: "横スクロール可能なカテゴリタブバー。コレクションページのフィルタリング向け。" },
  { id: "nav-side-drawer", name: "Side Drawer", nameJa: "サイドドロワー", description: "サイドから展開するフルナビゲーションパネル。情報量の多いサイト向け。" },
];

const FOOTER_OPTIONS = [
  { id: "footer-elegant-columns", name: "Elegant Columns", nameJa: "エレガント カラム", description: "複数カラムのフッター。ニュースレター登録、ソーシャルリンク、決済アイコン付き。" },
  { id: "footer-minimal-centered", name: "Minimal Centered", nameJa: "ミニマル センター", description: "中央揃えのシンプルなフッター。ミニマルブランド向け。" },
];

export async function GET() {
  try {
    const store = await prisma.store.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!store) {
      return NextResponse.json(
        { error: "ストアが接続されていません" },
        { status: 400 },
      );
    }

    const themeLayout = await prisma.themeLayout.findFirst({
      where: { storeId: store.id },
    });

    return NextResponse.json({
      themeLayout: themeLayout || null,
      headerOptions: HEADER_OPTIONS,
      footerOptions: FOOTER_OPTIONS,
      storeId: store.id,
    });
  } catch (error) {
    console.error("[ThemeLayout API] GET error:", error);
    return NextResponse.json(
      { error: "取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const store = await prisma.store.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!store) {
      return NextResponse.json(
        { error: "ストアが接続されていません" },
        { status: 400 },
      );
    }

    // 既存のThemeLayoutがあるか確認
    const existing = await prisma.themeLayout.findFirst({
      where: { storeId: store.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "ThemeLayoutは既に存在します。更新にはPUTを使用してください。", themeLayout: existing },
        { status: 409 },
      );
    }

    const body = await req.json();

    const themeLayout = await prisma.themeLayout.create({
      data: {
        storeId: store.id,
        headerSectionId: body.headerSectionId || "nav-elegant-dropdown",
        headerConfig: body.headerConfig || "{}",
        showAnnouncement: body.showAnnouncement || false,
        announcementText: body.announcementText || "",
        announcementLink: body.announcementLink || "",
        footerSectionId: body.footerSectionId || "footer-elegant-columns",
        footerConfig: body.footerConfig || "{}",
        globalTokens: body.globalTokens || "{}",
        fonts: body.fonts || "[]",
        colorSchemes: body.colorSchemes || "[]",
        deployMode: body.deployMode || "full",
      },
    });

    return NextResponse.json({ themeLayout }, { status: 201 });
  } catch (error) {
    console.error("[ThemeLayout API] POST error:", error);
    return NextResponse.json(
      { error: "作成に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const store = await prisma.store.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!store) {
      return NextResponse.json(
        { error: "ストアが接続されていません" },
        { status: 400 },
      );
    }

    const existing = await prisma.themeLayout.findFirst({
      where: { storeId: store.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "ThemeLayoutが見つかりません。先にPOSTで作成してください。" },
        { status: 404 },
      );
    }

    const body = await req.json();

    // 部分更新をサポート
    const updateData: Record<string, unknown> = {};
    if (body.headerSectionId !== undefined) updateData.headerSectionId = body.headerSectionId;
    if (body.headerConfig !== undefined) updateData.headerConfig = body.headerConfig;
    if (body.showAnnouncement !== undefined) updateData.showAnnouncement = body.showAnnouncement;
    if (body.announcementText !== undefined) updateData.announcementText = body.announcementText;
    if (body.announcementLink !== undefined) updateData.announcementLink = body.announcementLink;
    if (body.footerSectionId !== undefined) updateData.footerSectionId = body.footerSectionId;
    if (body.footerConfig !== undefined) updateData.footerConfig = body.footerConfig;
    if (body.globalTokens !== undefined) updateData.globalTokens = body.globalTokens;
    if (body.fonts !== undefined) updateData.fonts = body.fonts;
    if (body.colorSchemes !== undefined) updateData.colorSchemes = body.colorSchemes;
    if (body.deployMode !== undefined) updateData.deployMode = body.deployMode;

    const themeLayout = await prisma.themeLayout.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json({ themeLayout });
  } catch (error) {
    console.error("[ThemeLayout API] PUT error:", error);
    return NextResponse.json(
      { error: "更新に失敗しました" },
      { status: 500 },
    );
  }
}
