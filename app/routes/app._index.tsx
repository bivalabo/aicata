import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  Button,
  Banner,
  Icon,
} from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // TODO: 実際のデータを取得
  return json({
    shopDomain: session.shop,
    stats: {
      conversations: 0,
      templates: 0,
      deployedPages: 0,
    },
  });
};

export default function DashboardPage() {
  const { shopDomain, stats } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Page title="Aicata ダッシュボード">
      <BlockStack gap="500">
        <Banner
          title="Aicataへようこそ！"
          tone="info"
        >
          <p>
            AIパートナーと一緒にShopifyストアを構築・改善しましょう。
            まずは「Aicata」メニューから会話を始めてみてください。
          </p>
        </Banner>

        <InlineGrid columns={3} gap="400">
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">会話数</Text>
              <Text as="p" variant="heading2xl" fontWeight="bold">
                {stats.conversations}
              </Text>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">テンプレート</Text>
              <Text as="p" variant="heading2xl" fontWeight="bold">
                {stats.templates}
              </Text>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">公開ページ</Text>
              <Text as="p" variant="heading2xl" fontWeight="bold">
                {stats.deployedPages}
              </Text>
            </BlockStack>
          </Card>
        </InlineGrid>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingLg">クイックスタート</Text>
                <BlockStack gap="200">
                  <Button
                    variant="primary"
                    size="large"
                    onClick={() => navigate("/app/chat")}
                  >
                    Aicataと会話を始める
                  </Button>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    「新商品のランディングページを作りたい」など、
                    やりたいことを日本語で伝えるだけでOKです。
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingLg">ストア情報</Text>
                <Text as="p" variant="bodyMd">{shopDomain}</Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
