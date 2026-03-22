import type { LoaderFunctionArgs } from "@remix-run/node";
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
  Box,
  Icon,
  Badge,
} from "@shopify/polaris";
import {
  PageAddIcon,
  EditIcon,
  SearchIcon,
  TargetIcon,
  ChartVerticalIcon,
  ChatIcon,
  ClockIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "~/shopify.server";
import { getOrCreateShop } from "~/models/shop.server";
import { getConversations } from "~/models/conversation.server";
import {
  getTemplatesByCategory,
  CATEGORY_LABELS,
} from "~/prompts/templates";
import type { ConversationTemplate } from "~/prompts/templates";

// カテゴリ別のアイコンと色設定
const CATEGORY_CONFIG: Record<
  string,
  { icon: typeof PageAddIcon; color: string; bgColor: string }
> = {
  PAGE_CREATION: {
    icon: PageAddIcon,
    color: "#6366f1",
    bgColor: "#eef2ff",
  },
  PAGE_IMPROVEMENT: {
    icon: EditIcon,
    color: "#059669",
    bgColor: "#ecfdf5",
  },
  SEO: {
    icon: SearchIcon,
    color: "#d97706",
    bgColor: "#fffbeb",
  },
  CAMPAIGN: {
    icon: TargetIcon,
    color: "#dc2626",
    bgColor: "#fef2f2",
  },
  ANALYSIS: {
    icon: ChartVerticalIcon,
    color: "#2563eb",
    bgColor: "#eff6ff",
  },
  GENERAL: {
    icon: ChatIcon,
    color: "#7c3aed",
    bgColor: "#f5f3ff",
  },
};

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

function TemplateCard({
  template,
  categoryConfig,
  onClick,
}: {
  template: ConversationTemplate;
  categoryConfig: { icon: typeof PageAddIcon; color: string; bgColor: string };
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      role="button"
      tabIndex={0}
      style={{
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid var(--p-color-border-secondary)",
        background: "var(--p-color-bg-surface)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        flex: "1 1 calc(50% - 8px)",
        minWidth: "240px",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = categoryConfig.color;
        e.currentTarget.style.boxShadow = `0 2px 8px ${categoryConfig.color}20`;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor =
          "var(--p-color-border-secondary)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      <InlineStack gap="300" blockAlign="start" wrap={false}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: categoryConfig.bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon source={categoryConfig.icon} />
        </div>
        <BlockStack gap="100">
          <Text as="span" variant="bodyMd" fontWeight="bold">
            {template.title}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {template.description}
          </Text>
        </BlockStack>
      </InlineStack>
    </div>
  );
}

export default function ChatListPage() {
  const { conversations, templatesByCategory, categoryLabels } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Page title="Aicata" subtitle="AIパートナーに相談する">
      <Layout>
        <Layout.Section>
          <BlockStack gap="600">
            {/* ヒーローセクション */}
            <div
              style={{
                padding: "32px",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
                color: "#fff",
              }}
            >
              <BlockStack gap="200">
                <Text as="h2" variant="headingLg">
                  <span style={{ color: "#fff" }}>
                    何をお手伝いしましょうか？
                  </span>
                </Text>
                <Text as="p" variant="bodyMd">
                  <span style={{ color: "rgba(255,255,255,0.85)" }}>
                    テンプレートを選ぶか、自由にチャットで相談してください。
                    Shopify専門のAIパートナーが最適なサポートをします。
                  </span>
                </Text>
                <div style={{ marginTop: "8px" }}>
                  <Button
                    onClick={() =>
                      navigate("/app/chat/new?template=free-chat")
                    }
                    size="large"
                  >
                    自由に相談する
                  </Button>
                </div>
              </BlockStack>
            </div>

            {/* テンプレート一覧 */}
            {Object.entries(templatesByCategory).map(
              ([category, templates]) => {
                if (category === "GENERAL") return null;
                const config =
                  CATEGORY_CONFIG[category] || CATEGORY_CONFIG.GENERAL;

                return (
                  <BlockStack gap="300" key={category}>
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="h3" variant="headingMd">
                        {categoryLabels[category] || category}
                      </Text>
                      <Badge tone="info">
                        {String(templates.length)}
                      </Badge>
                    </InlineStack>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      {templates
                        .filter((t) => t.id !== "free-chat")
                        .map((template) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            categoryConfig={config}
                            onClick={() =>
                              navigate(
                                `/app/chat/new?template=${template.id}`,
                              )
                            }
                          />
                        ))}
                    </div>
                  </BlockStack>
                );
              },
            )}
          </BlockStack>
        </Layout.Section>

        {/* 過去の会話一覧 */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="200" blockAlign="center">
                <Icon source={ClockIcon} tone="subdued" />
                <Text as="h2" variant="headingMd">
                  最近の会話
                </Text>
              </InlineStack>

              {conversations.length === 0 ? (
                <Box paddingBlock="400">
                  <BlockStack gap="200" inlineAlign="center">
                    <Text
                      as="p"
                      variant="bodyMd"
                      tone="subdued"
                      alignment="center"
                    >
                      まだ会話がありません
                    </Text>
                    <Text
                      as="p"
                      variant="bodySm"
                      tone="subdued"
                      alignment="center"
                    >
                      左のテンプレートから始めてみましょう
                    </Text>
                  </BlockStack>
                </Box>
              ) : (
                <BlockStack gap="100">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => navigate(`/app/chat/${conv.id}`)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        navigate(`/app/chat/${conv.id}`)
                      }
                      role="button"
                      tabIndex={0}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background 0.1s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background =
                          "var(--p-color-bg-surface-secondary)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <BlockStack gap="100">
                        <Text
                          as="span"
                          variant="bodyMd"
                          fontWeight="semibold"
                          truncate
                        >
                          {conv.title}
                        </Text>
                        <Text as="span" variant="bodySm" tone="subdued">
                          {new Date(conv.updatedAt).toLocaleDateString(
                            "ja-JP",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </Text>
                      </BlockStack>
                    </div>
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
