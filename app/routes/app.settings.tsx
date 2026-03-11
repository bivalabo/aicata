import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner,
  Text,
  BlockStack,
  InlineStack,
  Divider,
  Badge,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { authenticate } from "~/shopify.server";
import { getOrCreateShop, updateShopSettings } from "~/models/shop.server";
import { getTokenUsage } from "~/services/token-manager";

/**
 * 設定ページ
 *
 * ストアのAI設定、利用状況、アカウント情報を管理
 */

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await getOrCreateShop(session.shop);
  const tokenUsage = await getTokenUsage(shop.id);

  return json({
    shop: {
      id: shop.id,
      domain: session.shop,
      preferredModel: shop.preferredModel || "claude-sonnet-4-20250514",
      brandTone: shop.brandTone || "professional",
      plan: shop.plan || "free",
    },
    tokenUsage,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await getOrCreateShop(session.shop);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "updateSettings") {
    const preferredModel = formData.get("preferredModel") as string;
    const brandTone = formData.get("brandTone") as string;

    await updateShopSettings(shop.id, {
      preferredModel,
      brandTone,
    });

    return json({ success: true, message: "設定を保存しました" });
  }

  return json({ success: false, message: "不明な操作です" });
};

export default function SettingsPage() {
  const { shop, tokenUsage } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [preferredModel, setPreferredModel] = useState(shop.preferredModel);
  const [brandTone, setBrandTone] = useState(shop.brandTone);

  const handleSave = useCallback(() => {
    const formData = new FormData();
    formData.append("intent", "updateSettings");
    formData.append("preferredModel", preferredModel);
    formData.append("brandTone", brandTone);
    submit(formData, { method: "post" });
  }, [preferredModel, brandTone, submit]);

  const modelOptions = [
    { label: "Claude Sonnet（推奨・バランス型）", value: "claude-sonnet-4-20250514" },
    { label: "Claude Haiku（高速・軽量）", value: "claude-haiku-4-5-20251001" },
    { label: "Claude Opus（高精度・プレミアム）", value: "claude-opus-4-20250514" },
  ];

  const toneOptions = [
    { label: "プロフェッショナル", value: "professional" },
    { label: "カジュアル・フレンドリー", value: "casual" },
    { label: "丁寧・フォーマル", value: "formal" },
    { label: "エネルギッシュ", value: "energetic" },
  ];

  const planLabels: Record<string, string> = {
    free: "フリープラン",
    pro: "プロプラン",
    enterprise: "エンタープライズ",
  };

  const tokenPercentage = tokenUsage.limit > 0
    ? Math.round((tokenUsage.used / tokenUsage.limit) * 100)
    : 0;

  return (
    <Page title="設定">
      <Layout>
        {actionData?.success && (
          <Layout.Section>
            <Banner tone="success" onDismiss={() => {}}>
              {actionData.message}
            </Banner>
          </Layout.Section>
        )}

        {/* AI設定 */}
        <Layout.AnnotatedSection
          title="AI設定"
          description="AIアシスタントの動作をカスタマイズします"
        >
          <Card>
            <BlockStack gap="400">
              <FormLayout>
                <Select
                  label="使用モデル"
                  options={modelOptions}
                  value={preferredModel}
                  onChange={setPreferredModel}
                  helpText="タスクの複雑さに応じて最適なモデルを選択してください"
                />
                <Select
                  label="ブランドトーン"
                  options={toneOptions}
                  value={brandTone}
                  onChange={setBrandTone}
                  helpText="AIが生成するテキストのトーンに影響します"
                />
              </FormLayout>
              <InlineStack align="end">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  loading={isSubmitting}
                >
                  設定を保存
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>

        <Divider />

        {/* 利用状況 */}
        <Layout.AnnotatedSection
          title="利用状況"
          description="今月のAI利用トークン数を確認できます"
        >
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="span" variant="bodyMd">
                  現在のプラン
                </Text>
                <Badge tone="info">{planLabels[shop.plan] || shop.plan}</Badge>
              </InlineStack>
              <InlineStack align="space-between">
                <Text as="span" variant="bodyMd">
                  今月の使用量
                </Text>
                <Text as="span" variant="bodyMd" fontWeight="bold">
                  {tokenUsage.used.toLocaleString()} / {tokenUsage.limit.toLocaleString()} トークン
                </Text>
              </InlineStack>
              <div
                style={{
                  background: "#e4e5e7",
                  borderRadius: "4px",
                  height: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: tokenPercentage > 80 ? "#d72c0d" : "#2c6ecb",
                    height: "100%",
                    width: `${Math.min(tokenPercentage, 100)}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              {tokenPercentage > 80 && (
                <Banner tone="warning">
                  トークン使用量が上限の{tokenPercentage}%に達しています。
                  プランのアップグレードをご検討ください。
                </Banner>
              )}
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>

        <Divider />

        {/* ストア情報 */}
        <Layout.AnnotatedSection
          title="ストア情報"
          description="接続されているShopifyストアの情報"
        >
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between">
                <Text as="span" variant="bodyMd">ストアドメイン</Text>
                <Text as="span" variant="bodyMd" fontWeight="bold">{shop.domain}</Text>
              </InlineStack>
              <InlineStack align="space-between">
                <Text as="span" variant="bodyMd">ストアID</Text>
                <Text as="span" variant="bodyMd" tone="subdued">{shop.id}</Text>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
}
