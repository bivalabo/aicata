-- AlterTable: Store に isActive カラムを追加
ALTER TABLE "Store" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Store_isActive_idx" ON "Store"("isActive");

-- CreateTable: BrandMemory
CREATE TABLE "BrandMemory" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "favoriteTemplates" TEXT NOT NULL DEFAULT '[]',
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "lastLearnedAt" DATETIME,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BrandMemory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandMemory_storeId_key" ON "BrandMemory"("storeId");

-- CreateTable: DesignAtom (ACE Layer 1)
CREATE TABLE "DesignAtom" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DesignAtom_atomId_key" ON "DesignAtom"("atomId");

-- CreateIndex
CREATE INDEX "DesignAtom_category_idx" ON "DesignAtom"("category");

-- CreateTable: BlockPattern (ACE Layer 2)
CREATE TABLE "BlockPattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "layout" TEXT,
    "slots" TEXT NOT NULL,
    "css" TEXT NOT NULL,
    "responsive" TEXT,
    "animations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BlockPattern_blockId_key" ON "BlockPattern"("blockId");

-- CreateIndex
CREATE INDEX "BlockPattern_category_idx" ON "BlockPattern"("category");

-- CreateTable: DesignPattern (ADIS)
CREATE TABLE "DesignPattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cssSnippet" TEXT,
    "prevalence" REAL NOT NULL DEFAULT 0,
    "momentum" REAL NOT NULL DEFAULT 0,
    "firstSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "curatorScore" REAL,
    "curatorNotes" TEXT,
    "atomIds" TEXT,
    "blockIds" TEXT,
    "industries" TEXT,
    "tones" TEXT,
    "exampleUrls" TEXT,
    "exampleCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DesignPattern_name_key" ON "DesignPattern"("name");

-- CreateIndex
CREATE INDEX "DesignPattern_category_idx" ON "DesignPattern"("category");

-- CreateIndex
CREATE INDEX "DesignPattern_momentum_idx" ON "DesignPattern"("momentum");

-- CreateTable: SiteEvaluation (ADIS)
CREATE TABLE "SiteEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "screenshotPath" TEXT,
    "overallRating" REAL NOT NULL,
    "typographyScore" REAL,
    "colorScore" REAL,
    "layoutScore" REAL,
    "animationScore" REAL,
    "spacingScore" REAL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "analyzedColors" TEXT,
    "analyzedFonts" TEXT,
    "analyzedLayout" TEXT,
    "detectedPatterns" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "SiteEvaluation_url_idx" ON "SiteEvaluation"("url");

-- CreateIndex
CREATE INDEX "SiteEvaluation_createdAt_idx" ON "SiteEvaluation"("createdAt");

-- CreateTable: DesignDNASnapshot (ADIS)
CREATE TABLE "DesignDNASnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "minimalism" REAL NOT NULL DEFAULT 0,
    "whitespace" REAL NOT NULL DEFAULT 0,
    "contrast" REAL NOT NULL DEFAULT 0,
    "animationIntensity" REAL NOT NULL DEFAULT 0,
    "serifAffinity" REAL NOT NULL DEFAULT 0,
    "colorSaturation" REAL NOT NULL DEFAULT 0,
    "layoutComplexity" REAL NOT NULL DEFAULT 0,
    "imageWeight" REAL NOT NULL DEFAULT 0,
    "asymmetry" REAL NOT NULL DEFAULT 0,
    "novelty" REAL NOT NULL DEFAULT 0,
    "confidence" REAL NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "favoritePatterns" TEXT,
    "avoidPatterns" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "DesignDNASnapshot_createdAt_idx" ON "DesignDNASnapshot"("createdAt");

-- CreateTable: TrendReport (ADIS)
CREATE TABLE "TrendReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period" TEXT NOT NULL,
    "emergingPatterns" TEXT NOT NULL DEFAULT '[]',
    "decliningPatterns" TEXT NOT NULL DEFAULT '[]',
    "colorTrends" TEXT,
    "typographyTrends" TEXT,
    "layoutTrends" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "TrendReport_period_idx" ON "TrendReport"("period");

-- CreateIndex
CREATE INDEX "TrendReport_createdAt_idx" ON "TrendReport"("createdAt");
