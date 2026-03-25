/**
 * ページ一覧取得 & 新規作成
 * GET  /api/pages — ページ一覧（Aicata作成分）
 * POST /api/pages — 新規ページ作成
 */
import { prisma } from "@/lib/db";
import { CreatePageSchema, parseBody } from "@/lib/api-validators";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status"); // draft, published, synced
    const source = url.searchParams.get("source"); // aicata, shopify
    const conversationIdFilter = url.searchParams.get("conversationId");

    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (source) where.source = source;
    if (conversationIdFilter) where.conversationId = conversationIdFilter;

    const pages = await prisma.page.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        conversation: {
          select: { id: true, title: true },
        },
        _count: {
          select: { versions: true },
        },
      },
    });

    return Response.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pages: pages.map((p: any) => {
        // Gen-3 fields may exist on the model but TypeScript may not see them
        // if Prisma client hasn't been regenerated
        const page = p as typeof p & {
          pageType?: string;
          templateId?: string | null;
          liquidGenerated?: boolean;
        };
        return {
          id: page.id,
          title: page.title,
          slug: page.slug,
          status: page.status,
          source: page.source,
          version: page.version,
          versionCount: page._count.versions,
          hasHtml: !!page.html,
          shopifyPageId: page.shopifyPageId,
          shopifyPublished: page.shopifyPublished,
          conversationId: page.conversationId,
          conversationTitle: page.conversation?.title || null,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
          pageType: page.pageType || "general",
          templateId: page.templateId || null,
          liquidGenerated: page.liquidGenerated || false,
        };
      }),
    });
  } catch (error) {
    console.error("Pages list error:", error);
    return Response.json(
      { error: "ページ一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parsed = parseBody(CreatePageSchema, rawBody);
    if (!parsed.success) return parsed.response;
    const { title, html, css, slug, conversationId } = parsed.data;

    if (!html && !css) {
      return Response.json(
        { error: "HTML または CSS が必要です" },
        { status: 400 },
      );
    }

    // ページを作成
    const page = await prisma.page.create({
      data: {
        title: title || "無題のページ",
        slug: slug || "",
        html: html || "",
        css: css || "",
        status: "draft",
        source: "aicata",
        version: 1,
        conversationId: conversationId || null,
      },
    });

    // 初期バージョンを記録
    await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        version: 1,
        html: html || "",
        css: css || "",
        prompt: title || "",
      },
    });

    return Response.json({ page }, { status: 201 });
  } catch (error) {
    console.error("Page create error:", error);
    return Response.json(
      { error: "ページの作成に失敗しました" },
      { status: 500 },
    );
  }
}
