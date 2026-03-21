/**
 * ページ詳細・更新・削除
 * GET    /api/pages/[id] — ページ詳細（バージョン履歴含む）
 * PATCH  /api/pages/[id] — ページ更新（新バージョン作成）
 * DELETE /api/pages/[id] — ページ削除
 */
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 20,
        },
        conversation: {
          select: { id: true, title: true },
        },
      },
    });

    if (!page) {
      return Response.json({ error: "ページが見つかりません" }, { status: 404 });
    }

    return Response.json({ page });
  } catch (error) {
    console.error("Page fetch error:", error);
    return Response.json(
      { error: "ページの取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const { title, html, css, slug, prompt } = body;

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: "ページが見つかりません" }, { status: 404 });
    }

    const newVersion = existing.version + 1;

    // ページを更新
    const page = await prisma.page.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(html !== undefined && { html }),
        ...(css !== undefined && { css }),
        ...(slug !== undefined && { slug }),
        version: newVersion,
      },
    });

    // 新バージョンを記録（HTML/CSSが変更された場合のみ）
    if (html !== undefined || css !== undefined) {
      await prisma.pageVersion.create({
        data: {
          pageId: id,
          version: newVersion,
          html: html ?? existing.html,
          css: css ?? existing.css,
          prompt: prompt || "",
        },
      });
    }

    return Response.json({ page });
  } catch (error) {
    console.error("Page update error:", error);
    return Response.json(
      { error: "ページの更新に失敗しました" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await prisma.page.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Page delete error:", error);
    return Response.json(
      { error: "ページの削除に失敗しました" },
      { status: 500 },
    );
  }
}
