import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { getOrCreateShop } from "~/models/shop.server";
import { processUserMessageStream } from "~/services/conversation.server";

/**
 * SSE (Server-Sent Events) ストリーミングエンドポイント
 *
 * クライアントからPOSTリクエストを受け取り、
 * Claude APIからのレスポンスをリアルタイムでストリーミングする
 */
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await getOrCreateShop(session.shop);
  const formData = await request.formData();
  const message = formData.get("message") as string;
  const conversationId = params.id!;

  if (!message?.trim()) {
    return new Response("メッセージが空です", { status: 400 });
  }

  // ReadableStreamでSSEレスポンスを構築
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const event of processUserMessageStream(
          conversationId,
          shop.id,
          session.shop,
          message,
        )) {
          const sseData = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(sseData));
        }
      } catch (error) {
        const errorEvent = `data: ${JSON.stringify({
          type: "error",
          data: "ストリーミング中にエラーが発生しました",
        })}\n\n`;
        controller.enqueue(encoder.encode(errorEvent));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
