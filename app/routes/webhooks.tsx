import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import prisma from "~/db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin, payload } =
    await authenticate.webhook(request);

  if (!admin) {
    throw new Response();
  }

  switch (topic) {
    case "APP_UNINSTALLED":
      // アプリがアンインストールされた場合
      if (session) {
        await prisma.session.deleteMany({ where: { shop } });
      }
      // TODO: ショップデータのクリーンアップ（必要に応じて）
      console.log(`App uninstalled from ${shop}`);
      break;

    case "SHOP_UPDATE":
      // ショップ情報が更新された場合
      console.log(`Shop updated: ${shop}`);
      break;

    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
