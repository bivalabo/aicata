import {
  Card,
  BlockStack,
  InlineGrid,
  Text,
  Box,
  Button,
} from "@shopify/polaris";
import type { ConversationTemplate } from "~/prompts/templates";
import { CATEGORY_LABELS } from "~/prompts/templates";

interface TemplateSelectorProps {
  templatesByCategory: Record<string, ConversationTemplate[]>;
  onSelect: (templateId: string) => void;
}

/**
 * 会話テンプレート選択UI
 *
 * ユーザーが「AIに何を言えばいいかわからない」という
 * 心理的ハードルを解消するためのカード型選択UI。
 * カテゴリ別に整理され、ワンタップで会話を開始できる。
 */
export function TemplateSelector({
  templatesByCategory,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <BlockStack gap="600">
      {/* ヘッダー */}
      <BlockStack gap="200">
        <Text as="h2" variant="headingXl">
          何をしたいですか？
        </Text>
        <Text as="p" variant="bodyLg" tone="subdued">
          やりたいことを選んでください。Aicataが最適な形でサポートします。
        </Text>
      </BlockStack>

      {/* カテゴリ別テンプレート */}
      {Object.entries(templatesByCategory).map(([category, templates]) => (
        <BlockStack gap="300" key={category}>
          <Text as="h3" variant="headingMd" tone="subdued">
            {CATEGORY_LABELS[category] || category}
          </Text>
          <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="300">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onSelect(template.id)}
              />
            ))}
          </InlineGrid>
        </BlockStack>
      ))}
    </BlockStack>
  );
}

/**
 * 個別テンプレートカード
 */
function TemplateCard({
  template,
  onSelect,
}: {
  template: ConversationTemplate;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
      style={{ cursor: "pointer" }}
    >
      <Card>
        <BlockStack gap="200">
          <Text as="h4" variant="headingSm">
            {template.title}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {template.description}
          </Text>
        </BlockStack>
      </Card>
    </div>
  );
}
