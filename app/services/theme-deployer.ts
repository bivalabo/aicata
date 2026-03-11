import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import prisma from "~/db.server";

/**
 * テーマデプロイサービス
 *
 * 生成されたLiquidテンプレートをShopifyテーマにデプロイする。
 * Theme API / Asset APIを使用してテーマファイルを直接操作。
 */

interface DeployOptions {
  admin: AdminApiContext;
  themeId?: string;  // 未指定の場合はメインテーマ
  templateName: string;
  liquidCode: string;
  cssCode?: string;
  jsCode?: string;
  sectionSchemas?: { name: string; schema: string }[];
}

interface DeployResult {
  success: boolean;
  deployedAssets: string[];
  themeId: string;
  error?: string;
}

/**
 * テンプレートをテーマにデプロイ
 */
export async function deployToTheme(
  options: DeployOptions,
): Promise<DeployResult> {
  const { admin, templateName, liquidCode, cssCode, jsCode, sectionSchemas } = options;
  const deployedAssets: string[] = [];

  try {
    // 1. テーマIDの解決（未指定の場合はメインテーマ）
    const themeId = options.themeId || (await getMainThemeId(admin));
    if (!themeId) {
      return { success: false, deployedAssets: [], themeId: "", error: "メインテーマが見つかりません" };
    }

    // 2. セクションファイルのデプロイ
    if (sectionSchemas) {
      for (const section of sectionSchemas) {
        const sectionKey = `sections/aicata-${section.name}.liquid`;
        const sectionContent = wrapWithSchema(liquidCode, section.schema);
        await putAsset(admin, themeId, sectionKey, sectionContent);
        deployedAssets.push(sectionKey);
      }
    }

    // 3. テンプレートファイルのデプロイ
    const templateKey = `templates/page.aicata-${templateName}.json`;
    const templateJson = buildTemplateJson(templateName, sectionSchemas);
    await putAsset(admin, themeId, templateKey, templateJson);
    deployedAssets.push(templateKey);

    // 4. CSSアセットのデプロイ
    if (cssCode) {
      const cssKey = `assets/aicata-${templateName}.css`;
      await putAsset(admin, themeId, cssKey, cssCode);
      deployedAssets.push(cssKey);
    }

    // 5. JSアセットのデプロイ
    if (jsCode) {
      const jsKey = `assets/aicata-${templateName}.js`;
      await putAsset(admin, themeId, jsKey, jsCode);
      deployedAssets.push(jsKey);
    }

    return { success: true, deployedAssets, themeId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "デプロイ中にエラーが発生しました";
    return { success: false, deployedAssets, themeId: options.themeId || "", error: errorMessage };
  }
}

/**
 * デプロイをロールバック（アセットを削除）
 */
export async function rollbackDeploy(
  admin: AdminApiContext,
  themeId: string,
  assetKeys: string[],
): Promise<void> {
  for (const key of assetKeys) {
    try {
      await deleteAsset(admin, themeId, key);
    } catch (error) {
      console.error(`Failed to rollback asset ${key}:`, error);
    }
  }
}

// ===== 内部ヘルパー =====

/**
 * メインテーマのIDを取得
 */
async function getMainThemeId(admin: AdminApiContext): Promise<string | null> {
  const response = await admin.graphql(`
    {
      themes(first: 10, roles: [MAIN]) {
        nodes {
          id
          name
          role
        }
      }
    }
  `);

  const data = await response.json();
  const mainTheme = data?.data?.themes?.nodes?.[0];
  return mainTheme?.id || null;
}

/**
 * テーマアセットを作成/更新
 */
async function putAsset(
  admin: AdminApiContext,
  themeId: string,
  key: string,
  value: string,
): Promise<void> {
  // REST APIを使用（Theme Asset APIはRESTのみ）
  // Note: shopify-app-remixではadmin.rest経由でアクセス
  const themeNumericId = themeId.replace("gid://shopify/Theme/", "");

  await admin.rest.put({
    path: `themes/${themeNumericId}/assets`,
    data: {
      asset: { key, value },
    },
    type: "application/json" as any,
  });
}

/**
 * テーマアセットを削除
 */
async function deleteAsset(
  admin: AdminApiContext,
  themeId: string,
  key: string,
): Promise<void> {
  const themeNumericId = themeId.replace("gid://shopify/Theme/", "");

  await admin.rest.delete({
    path: `themes/${themeNumericId}/assets`,
    data: { "asset[key]": key } as any,
  });
}

/**
 * LiquidコードにセクションスキーマをWrap
 */
function wrapWithSchema(liquidCode: string, schemaJson: string): string {
  return `${liquidCode}

{% schema %}
${schemaJson}
{% endschema %}`;
}

/**
 * Online Store 2.0 テンプレートJSONを構築
 */
function buildTemplateJson(
  name: string,
  sections?: { name: string; schema: string }[],
): string {
  const template: Record<string, unknown> = {
    name: `aicata-${name}`,
    sections: {},
    order: [] as string[],
  };

  if (sections) {
    const sectionsMap: Record<string, unknown> = {};
    const order: string[] = [];

    sections.forEach((section, index) => {
      const sectionId = `aicata_${section.name}_${index}`;
      sectionsMap[sectionId] = {
        type: `aicata-${section.name}`,
        settings: {},
      };
      order.push(sectionId);
    });

    template.sections = sectionsMap;
    template.order = order;
  }

  return JSON.stringify(template, null, 2);
}
