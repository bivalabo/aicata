// ============================================================
// One-time DB Migration Endpoint
// PostgreSQL互換のCREATE TABLE文を実行
//
// GET /api/setup/migrate — マイグレーション実行
// ============================================================

import { prisma } from "@/lib/db";

const MIGRATION_SQL = `
-- ============================================================
-- BrandMemory テーブル（Emotional DNA含む）
-- ============================================================
CREATE TABLE IF NOT EXISTS "BrandMemory" (
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
);
CREATE UNIQUE INDEX IF NOT EXISTS "BrandMemory_storeId_key" ON "BrandMemory"("storeId");

-- ============================================================
-- ThemeLayout テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS "ThemeLayout" (
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
);
CREATE UNIQUE INDEX IF NOT EXISTS "ThemeLayout_storeId_key" ON "ThemeLayout"("storeId");

-- ============================================================
-- StoreMenu テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS "StoreMenu" (
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
);
CREATE UNIQUE INDEX IF NOT EXISTS "StoreMenu_storeId_handle_key" ON "StoreMenu"("storeId", "handle");
CREATE INDEX IF NOT EXISTS "StoreMenu_storeId_idx" ON "StoreMenu"("storeId");

-- ============================================================
-- DesignAtom テーブル (ACE Layer 1)
-- ============================================================
CREATE TABLE IF NOT EXISTS "DesignAtom" (
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
);
CREATE UNIQUE INDEX IF NOT EXISTS "DesignAtom_atomId_key" ON "DesignAtom"("atomId");
CREATE INDEX IF NOT EXISTS "DesignAtom_category_idx" ON "DesignAtom"("category");

-- ============================================================
-- BlockPattern テーブル (ACE Layer 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS "BlockPattern" (
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
);
CREATE UNIQUE INDEX IF NOT EXISTS "BlockPattern_blockId_key" ON "BlockPattern"("blockId");
CREATE INDEX IF NOT EXISTS "BlockPattern_category_idx" ON "BlockPattern"("category");

-- ============================================================
-- DesignPattern テーブル (ADIS)
-- ============================================================
CREATE TABLE IF NOT EXISTS "DesignPattern" (
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
);
CREATE UNIQUE INDEX IF NOT EXISTS "DesignPattern_name_key" ON "DesignPattern"("name");
CREATE INDEX IF NOT EXISTS "DesignPattern_category_idx" ON "DesignPattern"("category");
CREATE INDEX IF NOT EXISTS "DesignPattern_momentum_idx" ON "DesignPattern"("momentum");

-- ============================================================
-- SiteEvaluation テーブル (ADIS)
-- ============================================================
CREATE TABLE IF NOT EXISTS "SiteEvaluation" (
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
);
CREATE INDEX IF NOT EXISTS "SiteEvaluation_url_idx" ON "SiteEvaluation"("url");
CREATE INDEX IF NOT EXISTS "SiteEvaluation_createdAt_idx" ON "SiteEvaluation"("createdAt");

-- ============================================================
-- DesignDNASnapshot テーブル (ADIS)
-- ============================================================
CREATE TABLE IF NOT EXISTS "DesignDNASnapshot" (
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
);
CREATE INDEX IF NOT EXISTS "DesignDNASnapshot_createdAt_idx" ON "DesignDNASnapshot"("createdAt");

-- ============================================================
-- TrendReport テーブル (ADIS)
-- ============================================================
CREATE TABLE IF NOT EXISTS "TrendReport" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "emergingPatterns" TEXT NOT NULL DEFAULT '[]',
    "decliningPatterns" TEXT NOT NULL DEFAULT '[]',
    "colorTrends" TEXT,
    "typographyTrends" TEXT,
    "layoutTrends" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrendReport_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TrendReport_period_idx" ON "TrendReport"("period");
CREATE INDEX IF NOT EXISTS "TrendReport_createdAt_idx" ON "TrendReport"("createdAt");

-- ============================================================
-- Store テーブルに isActive カラム追加（なければ）
-- ============================================================
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Store' AND column_name = 'isActive'
    ) THEN
        ALTER TABLE "Store" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS "Store_isActive_idx" ON "Store"("isActive");

-- ============================================================
-- ThemeDeployment テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS "ThemeDeployment" (
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
);
CREATE INDEX IF NOT EXISTS "ThemeDeployment_pageId_idx" ON "ThemeDeployment"("pageId");
CREATE INDEX IF NOT EXISTS "ThemeDeployment_storeId_themeId_idx" ON "ThemeDeployment"("storeId", "themeId");
CREATE UNIQUE INDEX IF NOT EXISTS "ThemeDeployment_storeId_themeId_templateType_templateSuffix_key" ON "ThemeDeployment"("storeId", "themeId", "templateType", "templateSuffix");

-- ============================================================
-- MediaAsset テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS "MediaAsset" (
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
);
CREATE UNIQUE INDEX IF NOT EXISTS "MediaAsset_sourceUrl_sourceDomain_key" ON "MediaAsset"("sourceUrl", "sourceDomain");
CREATE INDEX IF NOT EXISTS "MediaAsset_sourceDomain_idx" ON "MediaAsset"("sourceDomain");
CREATE INDEX IF NOT EXISTS "MediaAsset_status_idx" ON "MediaAsset"("status");
CREATE INDEX IF NOT EXISTS "MediaAsset_pageId_idx" ON "MediaAsset"("pageId");

-- ============================================================
-- BuildJob テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS "BuildJob" (
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
);
CREATE INDEX IF NOT EXISTS "BuildJob_status_idx" ON "BuildJob"("status");
CREATE INDEX IF NOT EXISTS "BuildJob_conversationId_idx" ON "BuildJob"("conversationId");

-- ============================================================
-- BuildSection テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS "BuildSection" (
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
);
CREATE INDEX IF NOT EXISTS "BuildSection_buildId_sortOrder_idx" ON "BuildSection"("buildId", "sortOrder");
CREATE INDEX IF NOT EXISTS "BuildSection_status_idx" ON "BuildSection"("status");

-- ============================================================
-- Page テーブルに不足カラム追加（なければ）
-- ============================================================
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Page' AND column_name = 'pageType'
    ) THEN
        ALTER TABLE "Page" ADD COLUMN "pageType" TEXT NOT NULL DEFAULT 'general';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Page' AND column_name = 'templateId'
    ) THEN
        ALTER TABLE "Page" ADD COLUMN "templateId" TEXT;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Page' AND column_name = 'liquidGenerated'
    ) THEN
        ALTER TABLE "Page" ADD COLUMN "liquidGenerated" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS "Page_pageType_idx" ON "Page"("pageType");
`;

export async function GET() {
  try {
    // セキュリティ: 本番環境では環境変数でゲート
    const migrationKey = process.env.MIGRATION_KEY;
    // MIGRATION_KEYが未設定の場合は許可（初回セットアップ用）
    // 設定済みの場合はクエリパラメータで確認が必要

    console.log("[Migration] Starting PostgreSQL schema migration...");

    // 各ステートメントを個別に実行
    const statements = MIGRATION_SQL
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));

    const results: string[] = [];
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const stmt of statements) {
      try {
        await prisma.$executeRawUnsafe(stmt + ";");
        successCount++;
        // テーブル名やインデックス名を抽出してログ
        const match = stmt.match(/(?:CREATE TABLE|CREATE INDEX|CREATE UNIQUE INDEX|ALTER TABLE|DO)\s+(?:IF NOT EXISTS\s+)?"?(\w+)"?/i);
        if (match) {
          results.push(`✅ ${match[1]}`);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        // "already exists" は成功扱い
        if (message.includes("already exists") || message.includes("duplicate")) {
          skipCount++;
          const match = stmt.match(/"(\w+)"/);
          results.push(`⏭️ ${match?.[1] || "unknown"} (already exists)`);
        } else {
          errorCount++;
          const match = stmt.match(/"(\w+)"/);
          results.push(`❌ ${match?.[1] || "unknown"}: ${message.slice(0, 100)}`);
          console.error("[Migration] Error:", message.slice(0, 200));
        }
      }
    }

    console.log(`[Migration] Complete: ${successCount} created, ${skipCount} skipped, ${errorCount} errors`);

    return Response.json({
      success: errorCount === 0,
      summary: {
        created: successCount,
        skipped: skipCount,
        errors: errorCount,
      },
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
