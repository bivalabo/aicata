/**
 * Shopify Menu Sync API
 *
 * GET  /api/shopify/menus         — ストアのメニュー一覧を取得
 * POST /api/shopify/menus         — メニューを作成/更新
 * PUT  /api/shopify/menus         — Shopifyからメニューデータを同期
 *
 * StoreMenu モデルは Shopify Navigation (linklists) と同期し、
 * ThemeLayout のヘッダー/フッターセクションで使用される。
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { listProducts, listAllCollections } from "@/lib/shopify";

async function getStore() {
  return prisma.store.findFirst({
    where: { isActive: true },
    select: { id: true, shop: true, accessToken: true },
  });
}

/** メニューアイテム型 */
interface MenuItem {
  title: string;
  url: string;
  type: "link" | "product" | "collection" | "page" | "blog" | "frontpage";
  children?: MenuItem[];
}

/**
 * GET: ストアのメニュー一覧
 * DB上の StoreMenu を返す。未同期の場合は空配列。
 */
export async function GET() {
  try {
    const store = await getStore();
    if (!store) {
      return NextResponse.json({ error: "ストアが接続されていません" }, { status: 400 });
    }

    const menus = await prisma.storeMenu.findMany({
      where: { storeId: store.id },
      orderBy: { handle: "asc" },
    });

    // メニューが未同期の場合、自動生成のデフォルトメニューを返す
    if (menus.length === 0) {
      return NextResponse.json({
        menus: [],
        hint: "PUT /api/shopify/menus でShopifyからメニューを同期するか、POST で新規作成してください",
      });
    }

    return NextResponse.json({
      menus: menus.map((m: any) => ({
        id: m.id,
        handle: m.handle,
        title: m.title,
        items: JSON.parse(m.items as string),
        shopifyMenuId: m.shopifyMenuId,
        lastSyncedAt: m.lastSyncedAt,
      })),
    });
  } catch (error) {
    console.error("[Menus GET Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "メニュー取得に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * POST: メニューを作成または更新
 * body: { handle: string, title: string, items: MenuItem[] }
 */
export async function POST(req: NextRequest) {
  try {
    const store = await getStore();
    if (!store) {
      return NextResponse.json({ error: "ストアが接続されていません" }, { status: 400 });
    }

    const body = await req.json();
    const { handle, title, items } = body;

    if (!handle || !title) {
      return NextResponse.json({ error: "handle と title は必須です" }, { status: 400 });
    }

    const menu = await prisma.storeMenu.upsert({
      where: {
        storeId_handle: {
          storeId: store.id,
          handle,
        },
      },
      create: {
        storeId: store.id,
        handle,
        title,
        items: JSON.stringify(items || []),
      },
      update: {
        title,
        items: JSON.stringify(items || []),
      },
    });

    return NextResponse.json({
      menu: {
        id: menu.id,
        handle: menu.handle,
        title: menu.title,
        items: JSON.parse(menu.items as string),
      },
    });
  } catch (error) {
    console.error("[Menus POST Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "メニュー保存に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * PUT: Shopify ストアから商品/コレクション/ページ情報を取得し、
 * デフォルトのナビゲーションメニューを自動生成・同期
 *
 * Shopify REST API にはメニュー取得 API がないため、
 * 商品/コレクション/ページの実データからメニューを構築する。
 */
export async function PUT() {
  try {
    const store = await getStore();
    if (!store) {
      return NextResponse.json({ error: "ストアが接続されていません" }, { status: 400 });
    }

    // Shopify からデータ取得
    const [collections, products] = await Promise.all([
      listAllCollections(store.shop, store.accessToken),
      listProducts(store.shop, store.accessToken, 50), // メニュー用なので上位50件
    ]);

    // ── メインメニュー構築 ──
    const mainMenuItems: MenuItem[] = [
      { title: "ホーム", url: "/", type: "frontpage" },
    ];

    // コレクションをメニューに追加（上位8件）
    if (collections.length > 0) {
      const collectionChildren: MenuItem[] = collections.slice(0, 8).map((c) => ({
        title: c.title,
        url: `/collections/${c.handle}`,
        type: "collection" as const,
      }));
      mainMenuItems.push({
        title: "コレクション",
        url: "/collections",
        type: "link",
        children: collectionChildren,
      });
    }

    // 商品数が少ない場合は直接メニューに追加
    if (products.length <= 6 && products.length > 0) {
      for (const p of products) {
        mainMenuItems.push({
          title: p.title,
          url: `/products/${p.handle}`,
          type: "product",
        });
      }
    }

    mainMenuItems.push({ title: "お問い合わせ", url: "/pages/contact", type: "page" });

    // ── フッターメニュー構築 ──
    const footerMenuItems: MenuItem[] = [
      { title: "ホーム", url: "/", type: "frontpage" },
      { title: "ショップ", url: "/collections/all", type: "link" },
      { title: "お問い合わせ", url: "/pages/contact", type: "page" },
      { title: "プライバシーポリシー", url: "/policies/privacy-policy", type: "link" },
      { title: "特定商取引法に基づく表記", url: "/policies/legal-notice", type: "link" },
    ];

    // DB に保存
    const [mainMenu, footerMenu] = await Promise.all([
      prisma.storeMenu.upsert({
        where: { storeId_handle: { storeId: store.id, handle: "main-menu" } },
        create: {
          storeId: store.id,
          handle: "main-menu",
          title: "メインメニュー",
          items: JSON.stringify(mainMenuItems),
          lastSyncedAt: new Date(),
        },
        update: {
          title: "メインメニュー",
          items: JSON.stringify(mainMenuItems),
          lastSyncedAt: new Date(),
        },
      }),
      prisma.storeMenu.upsert({
        where: { storeId_handle: { storeId: store.id, handle: "footer" } },
        create: {
          storeId: store.id,
          handle: "footer",
          title: "フッターメニュー",
          items: JSON.stringify(footerMenuItems),
          lastSyncedAt: new Date(),
        },
        update: {
          title: "フッターメニュー",
          items: JSON.stringify(footerMenuItems),
          lastSyncedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      synced: 2,
      menus: [
        { handle: "main-menu", title: mainMenu.title, itemCount: mainMenuItems.length },
        { handle: "footer", title: footerMenu.title, itemCount: footerMenuItems.length },
      ],
      source: {
        collections: collections.length,
        products: products.length,
      },
    });
  } catch (error) {
    console.error("[Menus Sync Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "メニュー同期に失敗しました" },
      { status: 500 },
    );
  }
}
