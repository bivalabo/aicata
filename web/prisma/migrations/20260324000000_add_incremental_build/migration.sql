-- CreateTable
CREATE TABLE "BuildJob" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuildJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildSection" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuildSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BuildJob_status_idx" ON "BuildJob"("status");
CREATE INDEX "BuildJob_conversationId_idx" ON "BuildJob"("conversationId");
CREATE INDEX "BuildSection_buildId_sortOrder_idx" ON "BuildSection"("buildId", "sortOrder");
CREATE INDEX "BuildSection_status_idx" ON "BuildSection"("status");

-- AddForeignKey
ALTER TABLE "BuildSection" ADD CONSTRAINT "BuildSection_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "BuildJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
