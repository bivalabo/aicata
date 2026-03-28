// ============================================================
// Design Harvester — Orchestrator
// ソース登録 → クロール → 抽出 → 分類 → ストック蓄積
// ============================================================

import { prisma } from "@/lib/db";
import { HARVEST_SOURCES, type HarvestSourceDef } from "./sources";
import { extractBlocksFromPage, measureRQS } from "./extractor";
import { classifyBlocks } from "./classifier";
import type { HarvestProgress, ExtractedBlock } from "./types";

type Browser = import("puppeteer").Browser;

/** RQS合格ライン */
const RQS_THRESHOLD = 80;

/** HQS最低ライン */
const HQS_MIN_COMPOSITE = 60;

/**
 * 全ハーベストソースをDBに登録（初期セットアップ）
 */
export async function seedHarvestSources(): Promise<number> {
  let count = 0;
  for (const src of HARVEST_SOURCES) {
    const existing = await prisma.harvestSource.findUnique({
      where: { url: src.url },
    });
    if (!existing) {
      await prisma.harvestSource.create({
        data: {
          url: src.url,
          domain: src.domain,
          label: src.label,
          status: "pending",
        },
      });
      count++;
    }
  }
  return count;
}

/**
 * 単一ソースからのハーベスト実行
 */
export async function harvestFromSource(
  sourceId: string,
  onProgress?: (progress: HarvestProgress) => void,
): Promise<{ totalBlocks: number; approvedBlocks: number }> {
  const source = await prisma.harvestSource.findUnique({
    where: { id: sourceId },
  });
  if (!source) throw new Error(`Source not found: ${sourceId}`);

  // ソースの定義を参照
  const sourceDef = HARVEST_SOURCES.find((s) => s.url === source.url);

  // Puppeteer起動
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  let totalBlocks = 0;
  let approvedBlocks = 0;

  try {
    // ソースのステータスを更新
    await prisma.harvestSource.update({
      where: { id: sourceId },
      data: { status: "crawling" },
    });

    // ページURLを収集
    const pageUrls = await collectPageUrls(browser, source.url, sourceDef);

    // 各ページを処理
    for (let i = 0; i < pageUrls.length; i++) {
      const pageUrl = pageUrls[i];

      // ジョブを作成
      const job = await prisma.harvestJob.create({
        data: {
          sourceId: source.id,
          pageUrl,
          status: "extracting",
        },
      });

      onProgress?.({
        sourceId: source.id,
        jobId: job.id,
        phase: "extracting",
        totalPages: pageUrls.length,
        processedPages: i,
        totalBlocks,
        approvedBlocks,
        currentUrl: pageUrl,
        errors: [],
      });

      try {
        // 1. ブロック抽出
        const blocks = await extractBlocksFromPage(pageUrl, browser, {
          captureScreenshots: true,
          maxBlocks: 30,
        });

        if (blocks.length === 0) {
          await prisma.harvestJob.update({
            where: { id: job.id },
            data: { status: "complete", extractedCount: 0 },
          });
          continue;
        }

        // 2. AI分類（Claude CLI / Max Plan）
        await prisma.harvestJob.update({
          where: { id: job.id },
          data: { status: "classifying" },
        });

        onProgress?.({
          sourceId: source.id,
          jobId: job.id,
          phase: "classifying",
          totalPages: pageUrls.length,
          processedPages: i,
          totalBlocks,
          approvedBlocks,
          currentUrl: pageUrl,
          errors: [],
        });

        const classifications = await classifyBlocks(blocks, pageUrl);

        // 3. 候補としてDB保存
        for (let j = 0; j < blocks.length; j++) {
          const block = blocks[j];
          const classification = classifications[j];

          await prisma.harvestCandidate.create({
            data: {
              jobId: job.id,
              sectionCategory: classification.sectionCategory,
              sectionVariant: classification.sectionVariant,
              html: block.html,
              css: block.css,
              js: block.js,
              screenshot: block.screenshot || null,
              designDna: JSON.stringify(classification.designDna),
              hqs: JSON.stringify(classification.hqs),
              tones: JSON.stringify(classification.tones),
              flowsWellAfter: JSON.stringify(classification.flowsWellAfter),
              flowsWellBefore: JSON.stringify(classification.flowsWellBefore),
              pageTypes: JSON.stringify(classification.pageTypes),
              status: "pending",
            },
          });
          totalBlocks++;
        }

        // 4. RQS測定 & 自動承認
        for (let j = 0; j < blocks.length; j++) {
          const block = blocks[j];
          const classification = classifications[j];

          // HQS composite check
          const hqs = classification.hqs;
          const hqsComposite =
            (hqs.typography + hqs.colorHarmony + hqs.spacing + hqs.hierarchy + hqs.polish) / 5;

          if (hqsComposite < HQS_MIN_COMPOSITE) continue;

          // RQS測定
          const rqs = await measureRQS(block.html, block.css, browser);
          const rqsAvg = (rqs.mobile + rqs.tablet + rqs.desktop + rqs.wide) / 4;

          if (rqsAvg >= RQS_THRESHOLD) {
            // 自動承認 → HarvestedBlock に登録
            await prisma.harvestedBlock.create({
              data: {
                sectionCategory: classification.sectionCategory,
                sectionVariant: classification.sectionVariant,
                html: block.html,
                css: block.css,
                js: block.js,
                designDna: JSON.stringify(classification.designDna),
                hqs: JSON.stringify(classification.hqs),
                tones: JSON.stringify(classification.tones),
                flowsWellAfter: JSON.stringify(classification.flowsWellAfter),
                flowsWellBefore: JSON.stringify(classification.flowsWellBefore),
                pageTypes: JSON.stringify(classification.pageTypes),
                placeholders: JSON.stringify(classification.placeholders),
                animations: JSON.stringify(classification.animations),
                rqs: rqsAvg,
                rqsBreakdown: JSON.stringify(rqs),
                sourceUrl: pageUrl,
                sourceDomain: new URL(pageUrl).hostname,
                status: "active",
              },
            });
            approvedBlocks++;
          }
        }

        await prisma.harvestJob.update({
          where: { id: job.id },
          data: {
            status: "complete",
            extractedCount: blocks.length,
            approvedCount: approvedBlocks,
          },
        });
      } catch (error) {
        console.error(`[Harvester] Job failed for ${pageUrl}:`, error);
        await prisma.harvestJob.update({
          where: { id: job.id },
          data: {
            status: "failed",
            errorMessage: (error as Error).message,
          },
        });
      }
    }

    // ソース完了
    await prisma.harvestSource.update({
      where: { id: sourceId },
      data: {
        status: "complete",
        pageCount: pageUrls.length,
        blockCount: approvedBlocks,
        lastCrawledAt: new Date(),
      },
    });

    onProgress?.({
      sourceId: source.id,
      jobId: "",
      phase: "complete",
      totalPages: pageUrls.length,
      processedPages: pageUrls.length,
      totalBlocks,
      approvedBlocks,
      errors: [],
    });
  } catch (error) {
    await prisma.harvestSource.update({
      where: { id: sourceId },
      data: {
        status: "failed",
        errorMessage: (error as Error).message,
      },
    });
    throw error;
  } finally {
    await browser.close();
  }

  return { totalBlocks, approvedBlocks };
}

/**
 * ギャラリーサイトから個別ページURLを収集
 */
async function collectPageUrls(
  browser: Browser,
  sourceUrl: string,
  sourceDef?: HarvestSourceDef,
): Promise<string[]> {
  if (!sourceDef?.isGallery) {
    // ギャラリーでなければ直接URLを返す
    return [sourceUrl];
  }

  const page = await browser.newPage();
  const urls: string[] = [];
  const maxPages = sourceDef.maxPages || 10;

  try {
    await page.goto(sourceUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // ギャラリーリンクを取得
    if (sourceDef.galleryLinkSelector) {
      const links = await page.evaluate(
        (selector: string) => {
          const anchors = document.querySelectorAll(selector);
          return Array.from(anchors)
            .map((a) => (a as HTMLAnchorElement).href)
            .filter((href) => href && href.startsWith("http"));
        },
        sourceDef.galleryLinkSelector,
      );

      urls.push(...links.slice(0, maxPages));
    }
  } catch (error) {
    console.error("[Harvester] Failed to collect URLs:", error);
  } finally {
    await page.close();
  }

  return urls.length > 0 ? urls : [sourceUrl];
}

/**
 * ハーベスト統計を取得
 */
export async function getHarvestStats() {
  const [sourceCount, jobCount, candidateCount, blockCount] = await Promise.all([
    prisma.harvestSource.count(),
    prisma.harvestJob.count(),
    prisma.harvestCandidate.count(),
    prisma.harvestedBlock.count(),
  ]);

  const blocksByCategory = await prisma.harvestedBlock.groupBy({
    by: ["sectionCategory"],
    _count: true,
    orderBy: { _count: { sectionCategory: "desc" } },
  });

  const recentJobs = await prisma.harvestJob.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { source: { select: { label: true, domain: true } } },
  });

  return {
    sourceCount,
    jobCount,
    candidateCount,
    blockCount,
    blocksByCategory: blocksByCategory.map((b: { sectionCategory: string; _count: number }) => ({
      category: b.sectionCategory,
      count: b._count,
    })),
    recentJobs,
  };
}
