// ============================================================
// One-time DB Migration Endpoint
// PostgreSQL互換のCREATE TABLE文を実行
//
// GET /api/setup/migrate — マイグレーション実行
// ============================================================

import { prisma } from "@/lib/db";

// 各SQLを個別に定義（分割問題を回避）
const STATEMENTS: { label: string; sql: string }[] = [
  // ── BrandMemory ──
  {
    label: "BrandMemory table",
    sql: `CREATE TABLE IF NOT EXISTS "BrandMemory" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL DEFAULT '',
    "brandStory" TEXT NOT NULL DEFAULT '',
    "industry" TEXT NOT NULL DEFAULT 'general',
    "targetAudience" TEXT NOT NULL DEFAULT '',
    "primaryColor" TEXT NOT NULL DEFAULT '',
    "secondaryColor" TEXT NOT NULL DEFAULT '',
    "accentColor" TEXT NOT NULL DEFAULT '',
    "colorPalette" TEXT NOT NULL DEFAULT '[]',
    "primaryFont" TEXT NOT NULL DEFAULT '',
    "bodyFont" TEXT NOT NULL DEFAULT '',
    "tones" TEXT NOT NULL DEFAULT '[]',
    "voiceTone" TEXT NOT NULL DEFAULT '',
    "copyKeywords" TEXT NOT NULL DEFAULT '[]',
    "avoidKeywords" TEXT NOT NULL DEFAULT '[]',
    "emotionalDna" TEXT NOT NULL DEFAULT '',
    "hearingSession" TEXT NOT NULL DEFAULT '',
    "hearingStatus" TEXT NOT NULL DEFAULT 'none',
    "favoriteTemplates" TEXT NOT NULL DEFAULT '[]',
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "lastLearnedAt" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BrandMemory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BrandMemory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
)`,
  },
  {
    label: "BrandMemory storeId unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "BrandMemory_storeId_key" ON "BrandMemory"("storeId")`,
  },

  // ── ThemeLayout ──
  {
    label: "ThemeLayout table",
    sql: `CREATE TABLE IF NOT EXISTS "ThemeLayout" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "headerSectionId" TEXT NOT NULL DEFAULT 'nav-elegant-dropdown',
    "headerConfig" TEXT NOT NULL DEFAULT '{}',
    "showAnnouncement" BOOLEAN NOT NULL DEFAULT false,
    "announcementText" TEXT NOT NULL DEFAULT '',
    "announcementLink" TEXT NOT NULL DEFAULT '',
    "footerSectionId" TEXT NOT NULL DEFAULT 'footer-elegant-columns',
    "footerConfig" TEXT NOT NULL DEFAULT '{}',
    "globalTokens" TEXT NOT NULL DEFAULT '{}',
    "fonts" TEXT NOT NULL DEFAULT '[]',
    "colorSchemes" TEXT NOT NULL DEFAULT '[]',
    "deployMode" TEXT NOT NULL DEFAULT 'full',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ThemeLayout_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ThemeLayout_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
)`,
  },
  {
    label: "ThemeLayout storeId unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "ThemeLayout_storeId_key" ON "ThemeLayout"("storeId")`,
  },

  // ── StoreMenu ──
  {
    label: "StoreMenu table",
    sql: `CREATE TABLE IF NOT EXISTS "StoreMenu" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shopifyMenuId" TEXT,
    "items" TEXT NOT NULL DEFAULT '[]',
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreMenu_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "StoreMenu_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
)`,
  },
  {
    label: "StoreMenu unique index",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "StoreMenu_storeId_handle_key" ON "StoreMenu"("storeId", "handle")`,
  },
  {
    label: "StoreMenu storeId index",
    sql: `CREATE INDEX IF NOT EXISTS "StoreMenu_storeId_idx" ON "StoreMenu"("storeId")`,
  },

  // ── DesignAtom (ACE Layer 1) ──
  {
    label: "DesignAtom table",
    sql: `CREATE TABLE IF NOT EXISTS "DesignAtom" (
    "id" TEXT NOT NULL,
    "atomId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "html" TEXT NOT NULL,
    "css" TEXT NOT NULL,
    "variants" TEXT,
    "tokens" TEXT,
    "a11y" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DesignAtom_pkey" PRIMARY KEY ("id")
)`,
  },
  { label: "DesignAtom atomId unique", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "DesignAtom_atomId_key" ON "DesignAtom"("atomId")` },
  { label: "DesignAtom category index", sql: `CREATE INDEX IF NOT EXISTS "DesignAtom_category_idx" ON "DesignAtom"("category")` },

  // ── BlockPattern (ACE Layer 2) ──
  {
    label: "BlockPattern table",
    sql: `CREATE TABLE IF NOT EXISTS "BlockPattern" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "layout" TEXT,
    "slots" TEXT NOT NULL,
    "css" TEXT NOT NULL,
    "responsive" TEXT,
    "animations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlockPattern_pkey" PRIMARY KEY ("id")
)`,
  },
  { label: "BlockPattern blockId unique", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "BlockPattern_blockId_key" ON "BlockPattern"("blockId")` },
  { label: "BlockPattern category index", sql: `CREATE INDEX IF NOT EXISTS "BlockPattern_category_idx" ON "BlockPattern"("category")` },

  // ── DesignPattern (ADIS) ──
  {
    label: "DesignPattern table",
    sql: `CREATE TABLE IF NOT EXISTS "DesignPattern" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cssSnippet" TEXT,
    "prevalence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "momentum" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "curatorScore" DOUBLE PRECISION,
    "curatorNotes" TEXT,
    "atomIds" TEXT,
    "blockIds" TEXT,
    "industries" TEXT,
    "tones" TEXT,
    "exampleUrls" TEXT,
    "exampleCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DesignPattern_pkey" PRIMARY KEY ("id")
)`,
  },
  { label: "DesignPattern name unique", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "DesignPattern_name_key" ON "DesignPattern"("name")` },
  { label: "DesignPattern category index", sql: `CREATE INDEX IF NOT EXISTS "DesignPattern_category_idx" ON "DesignPattern"("category")` },
  { label: "DesignPattern momentum index", sql: `CREATE INDEX IF NOT EXISTS "DesignPattern_momentum_idx" ON "DesignPattern"("momentum")` },

  // ── SiteEvaluation (ADIS) ──
  {
    label: "SiteEvaluation table",
    sql: `CREATE TABLE IF NOT EXISTS "SiteEvaluation" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "screenshotPath" TEXT,
    "overallRating" DOUBLE PRECISION NOT NULL,
    "typographyScore" DOUBLE PRECISION,
    "colorScore" DOUBLE PRECISION,
    "layoutScore" DOUBLE PRECISION,
    "animationScore" DOUBLE PRECISION,
    "spacingScore" DOUBLE PRECISION,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "analyzedColors" TEXT,
    "analyzedFonts" TEXT,
    "analyzedLayout" TEXT,
    "detectedPatterns" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteEvaluation_pkey" PRIMARY KEY ("id")
)`,
  },
  { label: "SiteEvaluation url index", sql: `CREATE INDEX IF NOT EXISTS "SiteEvaluation_url_idx" ON "SiteEvaluation"("url")` },
  { label: "SiteEvaluation createdAt index", sql: `CREATE INDEX IF NOT EXISTS "SiteEvaluation_createdAt_idx" ON "SiteEvaluation"("createdAt")` },

  // ── DesignDNASnapshot (ADIS) ──
  {
    label: "DesignDNASnapshot table",
    sql: `CREATE TABLE IF NOT EXISTS "DesignDNASnapshot" (
    "id" TEXT NOT NULL,
    "minimalism" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "whitespace" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contrast" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "animationIntensity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "serifAffinity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "colorSaturation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "layoutComplexity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imageWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "asymmetry" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "novelty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "favoritePatterns" TEXT,
    "avoidPatterns" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DesignDNASnapshot_pkey" PRIMARY KEY ("id")
)`,
  },
  { label: "DesignDNASnapshot createdAt index", sql: `CREATE INDEX IF NOT EXISTS "DesignDNASnapshot_createdAt_idx" ON "DesignDNASnapshot"("createdAt")` },

  // ── TrendReport (ADIS) ──
  {
    label: "TrendReport table",
    sql: `CREATE TABLE IF NOT EXISTS "TrendReport" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "emergingPatterns" TEXT NOT NULL DEFAULT '[]',
    "decliningPatterns" TEXT NOT NULL DEFAULT '[]',
    "colorTrends" TEXT,
    "typographyTrends" TEXT,
    "layoutTrends" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrendReport_pkey" PRIMARY KEY ("id")
)`,
  },
  { label: "TrendReport period index", sql: `CREATE INDEX IF NOT EXISTS "TrendReport_period_idx" ON "TrendReport"("period")` },
  { label: "TrendReport createdAt index", sql: `CREATE INDEX IF NOT EXISTS "TrendReport_createdAt_idx" ON "TrendReport"("createdAt")` },

  // ── Store: isActive カラム追加 ──
  { label: "Store isActive column", sql: `ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true` },
  { label: "Store isActive index", sql: `CREATE INDEX IF NOT EXISTS "Store_isActive_idx" ON "Store"("isActive")` },

  // ── ThemeDeployment ──
  {
    label: "ThemeDeployment table",
    sql: `CREATE TABLE IF NOT EXISTS "ThemeDeployment" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "templateSuffix" TEXT NOT NULL DEFAULT '',
    "assetsDeployed" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "deployedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ThemeDeployment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ThemeDeployment_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE
)`,
  },
  { label: "ThemeDeployment pageId index", sql: `CREATE INDEX IF NOT EXISTS "ThemeDeployment_pageId_idx" ON "ThemeDeployment"("pageId")` },
  { label: "ThemeDeployment store+theme index", sql: `CREATE INDEX IF NOT EXISTS "ThemeDeployment_storeId_themeId_idx" ON "ThemeDeployment"("storeId", "themeId")` },
  { label: "ThemeDeployment unique constraint", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "ThemeDeployment_storeId_themeId_templateType_templateSuffix_key" ON "ThemeDeployment"("storeId", "themeId", "templateType", "templateSuffix")` },

  // ── MediaAsset ──
  {
    label: "MediaAsset table",
    sql: `CREATE TABLE IF NOT EXISTS "MediaAsset" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "shopifyCdnUrl" TEXT,
    "shopifyFileId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "context" TEXT NOT NULL DEFAULT 'content',
    "alt" TEXT NOT NULL DEFAULT '',
    "sourceDomain" TEXT NOT NULL DEFAULT '',
    "mimeType" TEXT,
    "pageId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MediaAsset_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE SET NULL ON UPDATE CASCADE
)`,
  },
  { label: "MediaAsset unique constraint", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "MediaAsset_sourceUrl_sourceDomain_key" ON "MediaAsset"("sourceUrl", "sourceDomain")` },
  { label: "MediaAsset sourceDomain index", sql: `CREATE INDEX IF NOT EXISTS "MediaAsset_sourceDomain_idx" ON "MediaAsset"("sourceDomain")` },
  { label: "MediaAsset status index", sql: `CREATE INDEX IF NOT EXISTS "MediaAsset_status_idx" ON "MediaAsset"("status")` },
  { label: "MediaAsset pageId index", sql: `CREATE INDEX IF NOT EXISTS "MediaAsset_pageId_idx" ON "MediaAsset"("pageId")` },

  // ── BuildJob ──
  {
    label: "BuildJob table",
    sql: `CREATE TABLE IF NOT EXISTS "BuildJob" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT,
    "pageId" TEXT,
    "pageType" TEXT NOT NULL DEFAULT 'landing',
    "url" TEXT,
    "userInstructions" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'planning',
    "designSpec" TEXT,
    "assembledHtml" TEXT,
    "assembledCss" TEXT,
    "fullDocument" TEXT,
    "reviewResult" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BuildJob_pkey" PRIMARY KEY ("id")
)`,
  },
  { label: "BuildJob status index", sql: `CREATE INDEX IF NOT EXISTS "BuildJob_status_idx" ON "BuildJob"("status")` },
  { label: "BuildJob conversationId index", sql: `CREATE INDEX IF NOT EXISTS "BuildJob_conversationId_idx" ON "BuildJob"("conversationId")` },

  // ── BuildSection ──
  {
    label: "BuildSection table",
    sql: `CREATE TABLE IF NOT EXISTS "BuildSection" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "spec" TEXT NOT NULL,
    "html" TEXT,
    "css" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BuildSection_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BuildSection_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "BuildJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
)`,
  },
  { label: "BuildSection sort index", sql: `CREATE INDEX IF NOT EXISTS "BuildSection_buildId_sortOrder_idx" ON "BuildSection"("buildId", "sortOrder")` },
  { label: "BuildSection status index", sql: `CREATE INDEX IF NOT EXISTS "BuildSection_status_idx" ON "BuildSection"("status")` },

  // ── BrandMemory: 不足カラム追加（初回マイグレーションでテーブルが不完全に作成された場合） ──
  { label: "BrandMemory emotionalDna column", sql: `ALTER TABLE "BrandMemory" ADD COLUMN IF NOT EXISTS "emotionalDna" TEXT NOT NULL DEFAULT ''` },
  { label: "BrandMemory hearingSession column", sql: `ALTER TABLE "BrandMemory" ADD COLUMN IF NOT EXISTS "hearingSession" TEXT NOT NULL DEFAULT ''` },
  { label: "BrandMemory hearingStatus column", sql: `ALTER TABLE "BrandMemory" ADD COLUMN IF NOT EXISTS "hearingStatus" TEXT NOT NULL DEFAULT 'none'` },

  // ── Page: 不足カラム追加 ──
  { label: "Page pageType column", sql: `ALTER TABLE "Page" ADD COLUMN IF NOT EXISTS "pageType" TEXT NOT NULL DEFAULT 'general'` },
  { label: "Page templateId column", sql: `ALTER TABLE "Page" ADD COLUMN IF NOT EXISTS "templateId" TEXT` },
  { label: "Page liquidGenerated column", sql: `ALTER TABLE "Page" ADD COLUMN IF NOT EXISTS "liquidGenerated" BOOLEAN NOT NULL DEFAULT false` },
  { label: "Page pageType index", sql: `CREATE INDEX IF NOT EXISTS "Page_pageType_idx" ON "Page"("pageType")` },
];

export async function GET() {
  try {
    console.log("[Migration] Starting PostgreSQL schema migration...");

    const results: string[] = [];
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const { label, sql } of STATEMENTS) {
      try {
        await prisma.$executeRawUnsafe(sql);
        successCount++;
        results.push(`✅ ${label}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("already exists") || message.includes("duplicate")) {
          skipCount++;
          results.push(`⏭️ ${label} (already exists)`);
        } else {
          errorCount++;
          results.push(`❌ ${label}: ${message.slice(0, 120)}`);
          console.error(`[Migration] Error in "${label}":`, message.slice(0, 300));
        }
      }
    }

    console.log(`[Migration] Complete: ${successCount} ok, ${skipCount} skipped, ${errorCount} errors`);

    return Response.json({
      success: errorCount === 0,
      summary: { created: successCount, skipped: skipCount, errors: errorCount },
      details: results,
    });
  } catch (error) {
    console.error("[Migration] Fatal error:", error);
    return Response.json(
      { error: "Migration failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
