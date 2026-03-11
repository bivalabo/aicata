import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Divider,
} from "@shopify/polaris";
import { authenticate } from "~/shopify.server";
import { getOrCreateShop } from "~/models/shop.server";
import { getConversations, createConversation } from "~/models/conversation.server";
import {
  CONVERSATION_TEMPLATES,
  getTemplatesByCategory,
  CATEGORY_LABELS,
} from "~/prompts/templates";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await getOrCreateShop(session.shop);
  const conversations = await getConversations(shop.id, { limit: 20 });

  const templatesByCategory = getTemplatesByCategory();

  return json({
    shop,
    conversations,
    templatesByCategory,
    categoryLabels: CATEGORY_LABELS,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await getOrCreateShop(session.shop);
  const formData = await request.formData();
  const templateId = formData.get("templateId") as string;

  const template = CONVERSATION_TEMPLATES.find((t) => t.id === templateId);

  const conversation = await createConversation(shop.id, {
    title: template?.title || "新しい会話",
    type: template?.category === "SEO" ? "SEO_OPTIMIZATION" : "PAGE_DESIGN",
  });

  return json({ conversationId: conversation.id });
};

export default function ChatListPage() {
  const { conversations, templatesByCategory, categoryLabels } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Page title="AI相方">
      <Layout>
        {/* テンプレート選択エリア */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                何をしたいですか？
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                やりたいことを選んでください。AIパートナーが最適な形でサポートします。
              </Text>

              {Object.entries(templatesByCategory).map(
                ([category, templates]) => (
                  <BlockStack gap="200" key={category}>
                    <Text as="h3" variant="headingMd">
                      {categoryLabels[category] || category}
                    </Text>
                    <InlineStack gap="300" wrap>
                      {templates.map((template) => (
                        <Button
                          key={template.id}
                          onClick={() => navigate(`/app/chat/new?template=${template.id}`)}
                          size="large"
                        >
                          {template.title}
                        </Button>
                      ))}
                    </InlineStack>
                  </BlockStack>
                ),
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* 過去の会話一覧 */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                最近の会話
              </Text>
              {conversations.length === 0 ? (
                <Text as="p" variant="bodyMd" tone="subdued">
                  まだ会話がありません。上のテンプレートから始めてみましょう。
                </Text>
              ) : (
                <BlockStack gap="200">
                  {conversations.map((conv) => (
                    <Button
                      key={conv.id}
                      variant="plain"
                      textAlign="start"
                      onClick={() => navigate(`/app/chat/${conv.id}`)}
                    >
                      <BlockStack gap="100">
                        <Text as="span" variant="bodyMd" fontWeight="semibold">
                          {conv.title}
                        </Text>
                        <Text as="span" variant="bodySm" tone="subdued">
                          {new Date(conv.updatedAt).toLocaleDateString("ja-JP")}
                        </Text>
                      </BlockStack>
                    </Button>
                  ))}
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
