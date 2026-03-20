// ============================================================
// Aicata Brand Memory API
// 相方があなたのブランドを記憶する — CRUD + Auto-learn
//
// GET  /api/brand-memory — 現在のBrand Memoryを取得
// POST /api/brand-memory — Brand Memoryを作成/更新
// POST /api/brand-memory?action=learn-from-crawl — サイトクロール結果から学習
// POST /api/brand-memory?action=learn-from-page — 生成ページから学習
// ============================================================

import { prisma } from "@/lib/db";

// ── GET: Brand Memory 取得 ──

export async function GET() {
  try {
    const store = await prisma.store.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!store) {
      return Response.json({
        exists: false,
        memory: null,
        message: "ストアが接続されていません",
      });
    }

    // BrandMemory は Prisma client に反映されていない場合があるため dynamic access
    let memory = null;
    try {
      const model = (prisma as any).brandMemory;
      if (model && typeof model.findUnique === "function") {
        memory = await model.findUnique({ where: { storeId: store.id } });
      }
    } catch {
      // Model not available (migration needed) — return gracefully
      memory = null;
    }

    if (!memory) {
      return Response.json({
        exists: false,
        storeId: store.id,
        storeName: store.name,
        memory: null,
      });
    }

    return Response.json({
      exists: true,
      storeId: store.id,
      storeName: store.name,
      memory: {
        id: memory.id,
        brandName: memory.brandName,
        brandStory: memory.brandStory,
        industry: memory.industry,
        targetAudience: memory.targetAudience,
        primaryColor: memory.primaryColor,
        secondaryColor: memory.secondaryColor,
        accentColor: memory.accentColor,
        colorPalette: safeParseJson(memory.colorPalette, []),
        primaryFont: memory.primaryFont,
        bodyFont: memory.bodyFont,
        tones: safeParseJson(memory.tones, []),
        voiceTone: memory.voiceTone,
        copyKeywords: safeParseJson(memory.copyKeywords, []),
        avoidKeywords: safeParseJson(memory.avoidKeywords, []),
        favoriteTemplates: safeParseJson(memory.favoriteTemplates, []),
        pageCount: memory.pageCount,
        lastLearnedAt: memory.lastLearnedAt,
        source: memory.source,
        updatedAt: memory.updatedAt,
      },
    });
  } catch (error) {
    console.error("[Brand Memory] GET error:", error);
    return Response.json(
      { error: "Brand Memoryの取得に失敗しました" },
      { status: 500 },
    );
  }
}

// ── POST: Brand Memory 作成/更新/学習 ──

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const body = await request.json();

    const store = await prisma.store.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!store) {
      return Response.json(
        { error: "ストアが接続されていません" },
        { status: 400 },
      );
    }

    const brandMemoryModel = (prisma as any).brandMemory;
    if (!brandMemoryModel) {
      return Response.json(
        { error: "Brand Memoryモデルが利用できません（DB migrationが必要です）" },
        { status: 500 },
      );
    }

    // ── Action: Learn from site crawl result ──
    if (action === "learn-from-crawl") {
      const { unifiedContext, storeName } = body;
      if (!unifiedContext) {
        return Response.json(
          { error: "unifiedContextが必要です" },
          { status: 400 },
        );
      }

      const data = {
        brandName: storeName || store.name || "",
        industry: unifiedContext.industryKeywords?.[0] || "general",
        primaryColor: unifiedContext.dominantColors?.[0] || "",
        secondaryColor: unifiedContext.dominantColors?.[1] || "",
        accentColor: unifiedContext.dominantColors?.[2] || "",
        colorPalette: JSON.stringify(unifiedContext.dominantColors || []),
        primaryFont: unifiedContext.fonts?.[0] || "",
        bodyFont: unifiedContext.fonts?.[1] || unifiedContext.fonts?.[0] || "",
        tones: JSON.stringify(unifiedContext.tones || []),
        source: "crawl",
        lastLearnedAt: new Date(),
      };

      const memory = await brandMemoryModel.upsert({
        where: { storeId: store.id },
        create: { storeId: store.id, ...data },
        update: data,
      });

      console.log("[Brand Memory] Learned from crawl:", store.shop);
      return Response.json({ success: true, memory, source: "crawl" });
    }

    // ── Action: Learn from generated page ──
    if (action === "learn-from-page") {
      const { templateId, pageType, tones: pageTones } = body;

      const existing = await brandMemoryModel.findUnique({
        where: { storeId: store.id },
      });

      if (!existing) {
        // 初回学習 — 基本情報だけ保存
        const memory = await brandMemoryModel.create({
          data: {
            storeId: store.id,
            favoriteTemplates: templateId
              ? JSON.stringify([templateId])
              : "[]",
            tones: pageTones ? JSON.stringify(pageTones) : "[]",
            pageCount: 1,
            source: "learned",
            lastLearnedAt: new Date(),
          },
        });
        return Response.json({ success: true, memory, source: "learned" });
      }

      // 既存プロファイルを更新
      const favorites = safeParseJson(existing.favoriteTemplates, []) as string[];
      if (templateId && !favorites.includes(templateId)) {
        favorites.push(templateId);
      }

      await brandMemoryModel.update({
        where: { storeId: store.id },
        data: {
          favoriteTemplates: JSON.stringify(favorites.slice(-10)),
          pageCount: existing.pageCount + 1,
          lastLearnedAt: new Date(),
        },
      });

      return Response.json({ success: true, source: "learned" });
    }

    // ── Default: Manual update ──
    const {
      brandName,
      brandStory,
      industry,
      targetAudience,
      primaryColor,
      secondaryColor,
      accentColor,
      colorPalette,
      primaryFont,
      bodyFont,
      tones,
      voiceTone,
      copyKeywords,
      avoidKeywords,
    } = body;

    const data: Record<string, any> = {};
    if (brandName !== undefined) data.brandName = brandName;
    if (brandStory !== undefined) data.brandStory = brandStory;
    if (industry !== undefined) data.industry = industry;
    if (targetAudience !== undefined) data.targetAudience = targetAudience;
    if (primaryColor !== undefined) data.primaryColor = primaryColor;
    if (secondaryColor !== undefined) data.secondaryColor = secondaryColor;
    if (accentColor !== undefined) data.accentColor = accentColor;
    if (colorPalette !== undefined)
      data.colorPalette = JSON.stringify(colorPalette);
    if (primaryFont !== undefined) data.primaryFont = primaryFont;
    if (bodyFont !== undefined) data.bodyFont = bodyFont;
    if (tones !== undefined) data.tones = JSON.stringify(tones);
    if (voiceTone !== undefined) data.voiceTone = voiceTone;
    if (copyKeywords !== undefined)
      data.copyKeywords = JSON.stringify(copyKeywords);
    if (avoidKeywords !== undefined)
      data.avoidKeywords = JSON.stringify(avoidKeywords);
    data.source = "manual";

    const memory = await brandMemoryModel.upsert({
      where: { storeId: store.id },
      create: { storeId: store.id, ...data },
      update: data,
    });

    return Response.json({ success: true, memory });
  } catch (error) {
    console.error("[Brand Memory] POST error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Brand Memoryの更新に失敗しました",
      },
      { status: 500 },
    );
  }
}

function safeParseJson(str: string | null | undefined, fallback: any): any {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
