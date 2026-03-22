import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Badge,
  EmptyState,
  Tabs,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Filters,
  ChoiceList,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { authenticate } from "~/shopify.server";
import { getOrCreateShop } from "~/models/shop.server";
import prisma from "~/db.server";

/**
 * テンプレート管理ページ
 *
 * 生成済みテンプレートの一覧・管理・再利用
 */

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await getOrCreateShop(session.shop);

  const templates = await prisma.template.findMany({
    where: { shopId: shop.id },
    orderBy: { updatedAt: "desc" },
    include: {
      sections: {
        select: { id: true, name: true, type: true },
      },
    },
  });

  return json({ templates });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await getOrCreateShop(session.shop);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "delete") {
    const templateId = formData.get("templateId") as string;
    await prisma.template.delete({
      where: { id: templateId, shopId: shop.id },
    });
    return json({ success: true });
  }

  if (intent === "duplicate") {
    const templateId = formData.get("templateId") as string;
    const original = await prisma.template.findUnique({
      where: { id: templateId },
      include: { sections: true },
    });

    if (original) {
      await prisma.template.create({
        data: {
          shopId: shop.id,
          name: `${original.name}（コピー）`,
          type: original.type,
          status: "DRAFT",
          liquidCode: original.liquidCode,
          cssCode: original.cssCode,
          jsCode: original.jsCode,
          sections: {
            create: original.sections.map((s) => ({
              name: s.name,
              type: s.type,
              schema: s.schema as Parameters<typeof prisma.section.create>[0]["data"]["schema"],
              order: s.order,
            })),
          },
        },
      });
    }
    return json({ success: true });
  }

  return json({ success: false });
};

const STATUS_LABELS: Record<string, { label: string; tone: "success" | "warning" | "info" | "attention" }> = {
  DRAFT: { label: "下書き", tone: "info" },
  PUBLISHED: { label: "公開中", tone: "success" },
  ARCHIVED: { label: "アーカイブ", tone: "warning" },
};

const TYPE_LABELS: Record<string, string> = {
  LANDING_PAGE: "ランディングページ",
  PRODUCT_PAGE: "商品ページ",
  COLLECTION_PAGE: "コレクションページ",
  ABOUT_PAGE: "ブランドページ",
  CAMPAIGN_PAGE: "キャンペーンページ",
  CUSTOM: "カスタム",
};

export default function TemplatesPage() {
  const { templates } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const [selectedTab, setSelectedTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const tabs = [
    { id: "all", content: `すべて (${templates.length})`, panelID: "all-panel" },
    {
      id: "published",
      content: `公開中 (${templates.filter((t: any) => t.status === "PUBLISHED").length})`,
      panelID: "published-panel",
    },
    {
      id: "draft",
      content: `下書き (${templates.filter((t: any) => t.status === "DRAFT").length})`,
      panelID: "draft-panel",
    },
  ];

  const filteredTemplates = templates.filter((t: any) => {
    if (selectedTab === 1) return t.status === "PUBLISHED";
    if (selectedTab === 2) return t.status === "DRAFT";
    if (statusFilter.length > 0) return statusFilter.includes(t.status);
    return true;
  });

  const handleDelete = useCallback((templateId: string) => {
    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("templateId", templateId);
    submit(formData, { method: "post" });
  }, [submit]);

  const handleDuplicate = useCallback((templateId: string) => {
    const formData = new FormData();
    formData.append("intent", "duplicate");
    formData.append("templateId", templateId);
    submit(formData, { method: "post" });
  }, [submit]);

  const handleNewTemplate = useCallback(() => {
    // 新規テンプレート作成 → AI会話画面へ
    navigate("/app/chat?template=page_lp");
  }, [navigate]);

  return (
    <Page
      title="テンプレート"
      primaryAction={{
        content: "新規作成",
        onAction: handleNewTemplate,
      }}
    >
      <Layout>
        <Layout.Section>
          {templates.length === 0 ? (
            <Card>
              <EmptyState
                heading="テンプレートがまだありません"
                action={{
                  content: "AIでページを作成",
                  onAction: handleNewTemplate,
                }}
                image=""
              >
                <p>
                  AIとの会話でページデザインを作成すると、
                  テンプレートとして保存・再利用できます。
                </p>
              </EmptyState>
            </Card>
          ) : (
            <Card padding="0">
              <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                <div style={{ padding: "16px" }}>
                  <ResourceList
                    items={filteredTemplates}
                    renderItem={(template: any) => {
                      const status = STATUS_LABELS[template.status] || STATUS_LABELS.DRAFT;
                      const typeLabel = TYPE_LABELS[template.type] || template.type;
                      const sectionCount = template.sections?.length || 0;
                      const updatedAt = new Date(template.updatedAt).toLocaleDateString("ja-JP");

                      return (
                        <ResourceItem
                          id={template.id}
                          onClick={() => {
                            // テンプレート詳細/編集画面へ（将来実装）
                          }}
                          shortcutActions={[
                            {
                              content: "複製",
                              onAction: () => handleDuplicate(template.id),
                            },
                            {
                              content: "削除",
                              onAction: () => handleDelete(template.id),
                            },
                          ]}
                        >
                          <BlockStack gap="200">
                            <InlineStack align="space-between">
                              <InlineStack gap="200">
                                <Text as="span" variant="bodyMd" fontWeight="bold">
                                  {template.name}
                                </Text>
                                <Badge tone={status.tone}>{status.label}</Badge>
                              </InlineStack>
                              <Text as="span" variant="bodySm" tone="subdued">
                                {updatedAt}
                              </Text>
                            </InlineStack>
                            <InlineStack gap="200">
                              <Text as="span" variant="bodySm" tone="subdued">
                                {typeLabel}
                              </Text>
                              <Text as="span" variant="bodySm" tone="subdued">
                                {sectionCount}セクション
                              </Text>
                            </InlineStack>
                          </BlockStack>
                        </ResourceItem>
                      );
                    }}
                  />
                </div>
              </Tabs>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
