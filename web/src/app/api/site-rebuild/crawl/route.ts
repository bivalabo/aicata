// ============================================================
// Site Rebuild — Crawl API
//
// POST: URLを受け取り、サイト全体をクロールして構造を返す
// SSE ストリーミングで進捗を返す
// ============================================================

import { crawlSite } from "@/lib/ddp/site-crawler";

export const maxDuration = 120; // 2 minutes

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return Response.json(
        { error: "URLが必要です" },
        { status: 400 },
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return Response.json(
        { error: "無効なURLです" },
        { status: 400 },
      );
    }

    // SSE stream for progress
    const encoder = new TextEncoder();
    let streamClosed = false;

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) => {
          if (streamClosed) return;
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
            );
          } catch {
            streamClosed = true;
          }
        };

        try {
          const structure = await crawlSite(parsedUrl.href, (progress) => {
            send({
              type: "progress",
              ...progress,
            });
          });

          send({
            type: "complete",
            structure,
          });
        } catch (err) {
          send({
            type: "error",
            error: err instanceof Error ? err.message : "クロールに失敗しました",
          });
        }

        if (!streamClosed) {
          try { controller.close(); } catch { /* already closed */ }
        }
      },
      cancel() {
        streamClosed = true;
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "不明なエラー" },
      { status: 500 },
    );
  }
}
