// ============================================================
// Aicata Design Engine — Liquid Converter
// HTML/CSS → Shopify Online Store 2.0 テンプレート変換
//
// Aicataが生成したHTMLをShopifyテーマに統合するために:
// 1. セクションHTML → sections/aicata-*.liquid
// 2. ページテンプレート → templates/*.json (セクション参照)
// 3. デザイントークンCSS → assets/aicata-*.css
// ============================================================

import type {
  PageTemplate,
  SectionTemplate,
  DesignTokenSet,
  FontDef,
  PageType,
} from "./types";
import { getSectionById } from "./knowledge/sections/registry";

// ============================================================
// Types
// ============================================================

/** Liquid変換結果 */
export interface LiquidConversionResult {
  /** sections/aicata-{sectionId}.liquid のファイル群 */
  sectionFiles: Array<{
    key: string; // e.g., "sections/aicata-hero-split-image.liquid"
    value: string; // Liquid content
  }>;
  /** templates/{type}.aicata-{suffix}.json */
  templateJson: {
    key: string;
    value: string; // JSON string
  };
  /** assets/aicata-{suffix}.css — デザイントークン+フォント */
  cssAsset: {
    key: string;
    value: string;
  };
  /** デプロイ時に使うメタ情報 */
  meta: {
    templateType: string;
    templateSuffix: string;
    sectionCount: number;
    missingSections: string[];
  };
}

/** プレースホルダーをShopify Liquidオブジェクトにマッピングする設定 */
interface LiquidMappingConfig {
  pageType: PageType;
  /** product, collection等のShopifyオブジェクトにプレースホルダーを紐付ける */
  objectMappings: Record<string, string>;
}

// ============================================================
// Shopifyページタイプ → テンプレートタイプ マッピング
// ============================================================

const PAGE_TYPE_TO_TEMPLATE: Record<string, string> = {
  landing: "index",
  product: "product",
  collection: "collection",
  "list-collections": "list-collections",
  cart: "cart",
  blog: "blog",
  article: "article",
  about: "page",
  contact: "page",
  search: "search",
  account: "customers/account",
  password: "password",
  "404": "404",
  general: "page",
};

// ============================================================
// Liquid オブジェクトマッピング（ページタイプ別）
// ============================================================

/**
 * 各ページタイプのプレースホルダーをShopify Liquidオブジェクトに変換するマップ
 * {{PLACEHOLDER}} → {{ product.title }} のような変換
 */
const PRODUCT_PAGE_MAPPINGS: Record<string, string> = {
  "{{PRODUCT_TITLE}}": "{{ product.title }}",
  "{{PRODUCT_PRICE}}": "{{ product.price | money }}",
  "{{PRODUCT_COMPARE_PRICE}}": "{{ product.compare_at_price | money }}",
  "{{PRODUCT_DESCRIPTION}}": "{{ product.description }}",
  "{{PRODUCT_IMAGE}}": "{{ product.featured_image | image_url: width: 800 }}",
  "{{PRODUCT_IMAGE_ALT}}": "{{ product.featured_image.alt | escape }}",
  "{{PRODUCT_VENDOR}}": "{{ product.vendor }}",
  "{{PRODUCT_TYPE}}": "{{ product.type }}",
  "{{PRODUCT_URL}}": "{{ product.url }}",
  "{{PRODUCT_SKU}}": "{{ product.selected_or_first_available_variant.sku }}",
  "{{PRODUCT_AVAILABILITY}}":
    '{% if product.available %}在庫あり{% else %}売り切れ{% endif %}',
  "{{ADD_TO_CART_URL}}": "{{ product.url }}",
  "{{CTA_TEXT}}": "カートに入れる",
};

const COLLECTION_PAGE_MAPPINGS: Record<string, string> = {
  "{{COLLECTION_TITLE}}": "{{ collection.title }}",
  "{{COLLECTION_DESCRIPTION}}": "{{ collection.description }}",
  "{{COLLECTION_IMAGE}}":
    "{{ collection.image | image_url: width: 1200 }}",
  "{{COLLECTION_IMAGE_ALT}}": "{{ collection.image.alt | escape }}",
  "{{PRODUCT_COUNT}}": "{{ collection.products_count }}",
};

const CART_PAGE_MAPPINGS: Record<string, string> = {
  "{{CART_TOTAL}}": "{{ cart.total_price | money }}",
  "{{CART_ITEM_COUNT}}": "{{ cart.item_count }}",
  "{{SUBTOTAL}}": "{{ cart.total_price | money }}",
  "{{CHECKOUT_URL}}": "{{ routes.cart_url }}",
};

function getMappingsForPageType(
  pageType: PageType,
): Record<string, string> {
  switch (pageType) {
    case "product":
      return PRODUCT_PAGE_MAPPINGS;
    case "collection":
      return COLLECTION_PAGE_MAPPINGS;
    case "cart":
      return CART_PAGE_MAPPINGS;
    default:
      return {};
  }
}

// ============================================================
// Core Converter
// ============================================================

/**
 * PageTemplate → Shopify Online Store 2.0 テンプレートファイル群に変換
 *
 * @param pageTemplate - Aicata PageTemplate
 * @param suffix - テンプレートサフィックス (e.g., "luxury" → product.aicata-luxury.json)
 * @param overrides - プレースホルダーの上書き値（ブランド固有のテキスト等）
 */
export function convertToLiquid(
  pageTemplate: PageTemplate,
  suffix?: string,
  overrides?: Record<string, string>,
): LiquidConversionResult {
  const templateSuffix = suffix || pageTemplate.id;
  const templateType =
    PAGE_TYPE_TO_TEMPLATE[pageTemplate.pageType] || "page";
  const liquidMappings = getMappingsForPageType(pageTemplate.pageType);
  const missingSections: string[] = [];

  // 1. セクションファイル生成
  const sectionFiles: LiquidConversionResult["sectionFiles"] = [];
  const sectionOrder: Array<{
    sectionId: string;
    liquidSectionType: string;
  }> = [];

  for (const ref of pageTemplate.sections) {
    const section = getSectionById(ref.sectionId);
    if (!section) {
      missingSections.push(ref.sectionId);
      continue;
    }

    const liquidSectionType = `aicata-${section.id}`;
    const liquidContent = buildSectionLiquid(
      section,
      liquidMappings,
      { ...overrides, ...ref.overrides },
    );

    sectionFiles.push({
      key: `sections/${liquidSectionType}.liquid`,
      value: liquidContent,
    });

    sectionOrder.push({
      sectionId: ref.sectionId,
      liquidSectionType,
    });
  }

  // 2. JSONテンプレート生成
  const templateJsonContent = buildTemplateJson(
    sectionOrder,
    templateSuffix,
  );
  const templateKey =
    templateType === "index"
      ? `templates/index.aicata-${templateSuffix}.json`
      : `templates/${templateType}.aicata-${templateSuffix}.json`;

  // 3. CSS アセット生成
  const cssContent = buildDesignTokenCss(
    pageTemplate.designTokens,
    pageTemplate.fonts,
    templateSuffix,
  );

  return {
    sectionFiles,
    templateJson: {
      key: templateKey,
      value: templateJsonContent,
    },
    cssAsset: {
      key: `assets/aicata-${templateSuffix}.css`,
      value: cssContent,
    },
    meta: {
      templateType,
      templateSuffix,
      sectionCount: sectionFiles.length,
      missingSections,
    },
  };
}

// ============================================================
// Section → Liquid
// ============================================================

/**
 * SectionTemplate → Shopify セクション .liquid ファイルに変換
 *
 * 構造:
 * ```liquid
 * {% comment %} Aicata Generated Section: {name} {% endcomment %}
 * {{ 'aicata-{suffix}.css' | asset_url | stylesheet_tag }}
 *
 * <style>
 *   {section CSS}
 * </style>
 *
 * {section HTML with Liquid objects}
 *
 * {% schema %}
 * { "name": "...", "settings": [...] }
 * {% endschema %}
 * ```
 */
function buildSectionLiquid(
  section: SectionTemplate,
  liquidMappings: Record<string, string>,
  overrides?: Record<string, string>,
): string {
  let html = section.html;
  const css = section.css;

  // プレースホルダーの置換
  for (const ph of section.placeholders) {
    const placeholder = ph.key;
    // 1. ユーザーの上書き値
    if (overrides && overrides[placeholder]) {
      html = html.split(placeholder).join(overrides[placeholder]);
      continue;
    }
    // 2. Shopify Liquidオブジェクトへの変換
    if (liquidMappings[placeholder]) {
      html = html.split(placeholder).join(liquidMappings[placeholder]);
      continue;
    }
    // 3. セクションスキーマ設定として残す
    const settingId = placeholderToSettingId(placeholder);
    const defaultVal = ph.defaultValue || "";
    html = html
      .split(placeholder)
      .join(`{{ section.settings.${settingId} }}`);
  }

  // Shopifyスキーマ生成
  const schema = buildSectionSchema(section, liquidMappings);

  return `{% comment %}
  Aicata Generated Section: ${section.name}
  Category: ${section.category} | Variant: ${section.variant}
  Do not edit manually — regenerate from Aicata design engine
{% endcomment %}

<style>
${css}
</style>

${html}

{% schema %}
${JSON.stringify(schema, null, 2)}
{% endschema %}
`;
}

/**
 * セクションの {% schema %} を生成
 *
 * Shopifyテーマエディターで編集可能なsettingsを自動生成
 */
function buildSectionSchema(
  section: SectionTemplate,
  liquidMappings: Record<string, string>,
): Record<string, unknown> {
  const settings: Array<Record<string, unknown>> = [];

  for (const ph of section.placeholders) {
    // Liquid オブジェクトにマッピングされたものはスキーマ不要
    if (liquidMappings[ph.key]) continue;

    const settingId = placeholderToSettingId(ph.key);
    const setting: Record<string, unknown> = {
      id: settingId,
      label: ph.description,
      default: ph.defaultValue || "",
    };

    switch (ph.type) {
      case "text":
        // 長いテキストはrichtextに
        if (
          ph.key.includes("DESCRIPTION") ||
          ph.key.includes("BODY") ||
          ph.key.includes("CONTENT")
        ) {
          setting.type = "richtext";
          setting.default = `<p>${ph.defaultValue || ""}</p>`;
        } else {
          setting.type = "text";
        }
        break;
      case "image":
        setting.type = "image_picker";
        delete setting.default;
        break;
      case "url":
        setting.type = "url";
        break;
      case "color":
        setting.type = "color";
        break;
    }

    settings.push(setting);
  }

  return {
    name: section.name,
    tag: "section",
    class: `aicata-section aicata-section--${section.category}`,
    settings,
    presets: [
      {
        name: section.name,
        category: "Aicata",
      },
    ],
  };
}

// ============================================================
// Template JSON
// ============================================================

/**
 * Online Store 2.0 の JSON テンプレートを生成
 *
 * ```json
 * {
 *   "sections": {
 *     "aicata-hero-split-image": { "type": "aicata-hero-split-image" },
 *     ...
 *   },
 *   "order": ["aicata-hero-split-image", ...]
 * }
 * ```
 */
function buildTemplateJson(
  sectionOrder: Array<{
    sectionId: string;
    liquidSectionType: string;
  }>,
  templateSuffix: string,
): string {
  const sections: Record<string, { type: string; settings?: Record<string, unknown> }> = {};
  const order: string[] = [];

  for (const entry of sectionOrder) {
    const blockKey = entry.liquidSectionType;
    sections[blockKey] = {
      type: entry.liquidSectionType,
    };
    order.push(blockKey);
  }

  const template = {
    sections,
    order,
  };

  return JSON.stringify(template, null, 2);
}

// ============================================================
// Design Token CSS
// ============================================================

/**
 * デザイントークン + Google Fonts → CSS アセット
 */
function buildDesignTokenCss(
  tokens: DesignTokenSet,
  fonts: FontDef[],
  suffix: string,
): string {
  // Google Fonts import
  const fontImports = fonts
    .map((f) => {
      const weights = f.weights.join(";");
      const italic = f.italic ? ":ital,wght@0," + weights + ";1," + weights : ":wght@" + weights;
      const family = f.family.replace(/ /g, "+");
      return `@import url('https://fonts.googleapis.com/css2?family=${family}${italic}&display=swap');`;
    })
    .join("\n");

  // CSS custom properties
  const colorVars = Object.entries(tokens.colors)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  const typographyVars = Object.entries(tokens.typography)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  const spacingVars = Object.entries(tokens.spacing)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  const motionVars = Object.entries(tokens.motion)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");

  return `/* Aicata Design Tokens: ${suffix} */
/* Generated by Aicata Design Engine — Do not edit manually */

${fontImports}

:root {
  /* Colors */
${colorVars}

  /* Typography */
${typographyVars}

  /* Spacing */
${spacingVars}

  /* Motion */
${motionVars}
}

/* Reset for Aicata sections */
.aicata-section {
  box-sizing: border-box;
}

.aicata-section *,
.aicata-section *::before,
.aicata-section *::after {
  box-sizing: inherit;
}

.aicata-section img {
  max-width: 100%;
  height: auto;
  display: block;
}
`;
}

// ============================================================
// Utilities
// ============================================================

/**
 * {{PLACEHOLDER_NAME}} → placeholder_name
 * Shopify section schema の setting ID に変換
 */
function placeholderToSettingId(placeholder: string): string {
  return placeholder
    .replace(/^\{\{/, "")
    .replace(/\}\}$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");
}

/**
 * ページタイプからShopifyテンプレートタイプを取得
 */
export function getShopifyTemplateType(pageType: PageType): string {
  return PAGE_TYPE_TO_TEMPLATE[pageType] || "page";
}

/**
 * 利用可能なテンプレートサフィックス一覧を取得
 * テーマ内の既存テンプレートと被らないようにするため
 */
export function generateTemplateSuffix(
  templateId: string,
): string {
  // テンプレートID → クリーンなサフィックス
  return templateId
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
