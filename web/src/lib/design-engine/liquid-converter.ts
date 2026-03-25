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
import {
  LIQUID_NAV_ELEGANT_DROPDOWN,
  LIQUID_NAV_MINIMAL_STICKY,
  LIQUID_NAV_MEGA_MENU,
  LIQUID_NAV_TRANSPARENT_OVERLAY,
  LIQUID_NAV_CATEGORY_TABS,
  LIQUID_NAV_SIDE_DRAWER,
  NAV_SCHEMA_SETTINGS,
} from "./knowledge/sections/navigation/liquid-templates";
import {
  LIQUID_FOOTER_ELEGANT_COLUMNS,
  LIQUID_FOOTER_MINIMAL_CENTERED,
  FOOTER_SCHEMA_SETTINGS,
} from "./knowledge/sections/footer/liquid-templates";

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
  /** assets/aicata-global.css — 共通リセット+ユーティリティ（セクションLiquidから参照） */
  globalCssAsset: {
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
  "gift-card": "gift_card",
  general: "page",
};

// ============================================================
// Shopifyテーマエディタ用 — セクション名日本語マッピング
// テーマエディタのサイドバーで「Aicata: ヒーロー」と表示
// ============================================================

const SECTION_CATEGORY_LABELS_JA: Record<string, string> = {
  "navigation": "ナビゲーション",
  "footer": "フッター",
  "announcement": "告知バー",
  "breadcrumb": "パンくず",
  "search": "検索",
  "hero": "ヒーロー",
  "philosophy": "ブランド理念",
  "story": "ブランドストーリー",
  "features": "特徴",
  "testimonial": "お客様の声",
  "cta": "CTA",
  "newsletter": "ニュースレター",
  "gallery": "ギャラリー",
  "editorial": "エディトリアル",
  "faq": "FAQ",
  "product-gallery": "商品ギャラリー",
  "product-info": "商品情報",
  "product-description": "商品説明",
  "product-reviews": "レビュー",
  "related-products": "関連商品",
  "recently-viewed": "最近見た商品",
  "collection-banner": "コレクションバナー",
  "collection-grid": "商品グリッド",
  "collection-filter": "フィルター",
  "collection-list": "コレクション一覧",
  "cart-items": "カート商品",
  "cart-summary": "注文サマリー",
  "cart-upsell": "おすすめ商品",
  "blog-grid": "ブログ一覧",
  "article-content": "記事本文",
  "products": "商品一覧",
  "slideshow": "スライドショー",
  "image-with-text": "画像+テキスト",
  "multicolumn": "マルチカラム",
  "video": "動画",
  "contact-form": "お問い合わせ",
  "social-proof": "SNS",
  "trust-badges": "信頼バッジ",
};

/** セクションのShopifyテーマエディタ表示名を生成 */
function getSchemaName(section: SectionTemplate): string {
  const label = SECTION_CATEGORY_LABELS_JA[section.category] || section.category;
  return `Aicata: ${label}`;
}

// ============================================================
// Shopify セクション enabled_on / disabled_on
// ============================================================

type SectionAvailabilityMap = Record<string, {
  enabled_on?: { templates?: string[]; groups?: string[] };
  disabled_on?: { templates?: string[]; groups?: string[] };
}>;

const SECTION_AVAILABILITY: SectionAvailabilityMap = {
  "navigation": { enabled_on: { groups: ["header"] } },
  "announcement": { enabled_on: { groups: ["header"] } },
  "footer": { enabled_on: { groups: ["footer"] } },
  "product-gallery": { enabled_on: { templates: ["product"] } },
  "product-info": { enabled_on: { templates: ["product"] } },
  "product-description": { enabled_on: { templates: ["product"] } },
  "product-reviews": { enabled_on: { templates: ["product"] } },
  "collection-banner": { enabled_on: { templates: ["collection"] } },
  "collection-grid": { enabled_on: { templates: ["collection"] } },
  "collection-filter": { enabled_on: { templates: ["collection"] } },
  "cart-items": { enabled_on: { templates: ["cart"] } },
  "cart-summary": { enabled_on: { templates: ["cart"] } },
  "cart-upsell": { enabled_on: { templates: ["cart"] } },
  "blog-grid": { enabled_on: { templates: ["blog"] } },
  "article-content": { enabled_on: { templates: ["article"] } },
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

const BLOG_PAGE_MAPPINGS: Record<string, string> = {
  "{{BLOG_TITLE}}": "{{ blog.title }}",
  "{{BLOG_URL}}": "{{ blog.url }}",
  "{{ARTICLE_COUNT}}": "{{ blog.articles_count }}",
};

const ARTICLE_PAGE_MAPPINGS: Record<string, string> = {
  "{{ARTICLE_TITLE}}": "{{ article.title }}",
  "{{ARTICLE_AUTHOR}}": "{{ article.author }}",
  "{{ARTICLE_CONTENT}}": "{{ article.content }}",
  "{{ARTICLE_EXCERPT}}": "{{ article.excerpt }}",
  "{{ARTICLE_IMAGE}}": "{{ article.image | image_url: width: 1200 }}",
  "{{ARTICLE_IMAGE_ALT}}": "{{ article.image.alt | escape }}",
  "{{ARTICLE_DATE}}": "{{ article.published_at | date: '%Y年%m月%d日' }}",
  "{{ARTICLE_TAGS}}": "{% for tag in article.tags %}{{ tag }}{% unless forloop.last %}, {% endunless %}{% endfor %}",
  "{{ARTICLE_COMMENTS_COUNT}}": "{{ article.comments_count }}",
};

const SEARCH_PAGE_MAPPINGS: Record<string, string> = {
  "{{SEARCH_TERMS}}": "{{ search.terms }}",
  "{{SEARCH_RESULTS_COUNT}}": "{{ search.results_count }}",
};

const PASSWORD_PAGE_MAPPINGS: Record<string, string> = {
  "{{SHOP_NAME}}": "{{ shop.name }}",
  "{{SHOP_DESCRIPTION}}": "{{ shop.description }}",
  "{{PASSWORD_MESSAGE}}": "{{ shop.password_message }}",
};

const GIFT_CARD_PAGE_MAPPINGS: Record<string, string> = {
  "{{GIFT_CARD_CODE}}": "{{ gift_card.code }}",
  "{{GIFT_CARD_BALANCE}}": "{{ gift_card.balance | money }}",
  "{{GIFT_CARD_INITIAL_VALUE}}": "{{ gift_card.initial_value | money }}",
  "{{GIFT_CARD_EXPIRES}}": "{{ gift_card.expires_on | date: '%Y/%m/%d' }}",
};

const LIST_COLLECTIONS_MAPPINGS: Record<string, string> = {
  "{{PAGE_TITLE}}": "コレクション一覧",
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
    case "blog":
      return BLOG_PAGE_MAPPINGS;
    case "article":
      return ARTICLE_PAGE_MAPPINGS;
    case "search":
      return SEARCH_PAGE_MAPPINGS;
    case "password":
      return PASSWORD_PAGE_MAPPINGS;
    case "gift-card":
      return GIFT_CARD_PAGE_MAPPINGS;
    case "list-collections":
      return LIST_COLLECTIONS_MAPPINGS;
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

  // 4. グローバルCSS（共通リセット+ユーティリティ — 全セクションで共有）
  const globalCss = buildGlobalCss();

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
    globalCssAsset: {
      key: "assets/aicata-global.css",
      value: globalCss,
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

// ── Navigation / Footer の Liquid テンプレートマップ ──
const NAV_LIQUID_TEMPLATES: Record<string, string> = {
  "nav-elegant-dropdown": LIQUID_NAV_ELEGANT_DROPDOWN,
  "nav-minimal-sticky": LIQUID_NAV_MINIMAL_STICKY,
  "nav-mega-menu": LIQUID_NAV_MEGA_MENU,
  "nav-transparent-overlay": LIQUID_NAV_TRANSPARENT_OVERLAY,
  "nav-category-tabs": LIQUID_NAV_CATEGORY_TABS,
  "nav-side-drawer": LIQUID_NAV_SIDE_DRAWER,
};

const FOOTER_LIQUID_TEMPLATES: Record<string, string> = {
  "footer-elegant-columns": LIQUID_FOOTER_ELEGANT_COLUMNS,
  "footer-minimal-centered": LIQUID_FOOTER_MINIMAL_CENTERED,
};
function buildSectionLiquid(
  section: SectionTemplate,
  liquidMappings: Record<string, string>,
  overrides?: Record<string, string>,
): string {
  const css = section.css;

  // ── Navigation / Footer: Liquid テンプレートを使用 ──
  const navLiquidTemplate = NAV_LIQUID_TEMPLATES[section.id];
  const footerLiquidTemplate = FOOTER_LIQUID_TEMPLATES[section.id];

  if (navLiquidTemplate || footerLiquidTemplate) {
    return buildGlobalSectionLiquid(
      section,
      navLiquidTemplate || footerLiquidTemplate,
      navLiquidTemplate ? NAV_SCHEMA_SETTINGS : FOOTER_SCHEMA_SETTINGS,
    );
  }

  // ── 通常セクション: プレースホルダーベース ──
  let html = section.html;

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
  const schemaName = getSchemaName(section);

  // カラースキーム適用（グローバルセクション以外）
  const isGlobalSection = ["navigation", "footer", "announcement"].includes(section.category);
  const colorSchemeClass = isGlobalSection
    ? ""
    : ' color-{{ section.settings.color_scheme }}';

  // App Blocks レンダリング
  const appBlocksRender = `
{%- for block in section.blocks -%}
  {%- case block.type -%}
    {%- when '@app' -%}
      {% render block %}
  {%- endcase -%}
{%- endfor -%}`;

  return `{%- comment -%}
  Aicata Generated Section: ${schemaName}
  Category: ${section.category} | Variant: ${section.variant}
  Generated by Aicata Design Engine — https://aicata.vercel.app
{%- endcomment -%}

{{ 'aicata-global.css' | asset_url | stylesheet_tag }}

<style>
@layer aicata-sections {
${css}
}
</style>

<div class="aicata-section aicata-section--${section.category}${colorSchemeClass}" data-section-id="{{ section.id }}">
${html}
${appBlocksRender}
</div>

{% schema %}
${JSON.stringify(schema, null, 2)}
{% endschema %}
`;
}

/**
 * Navigation / Footer セクション用の Liquid 生成
 *
 * プレースホルダーベースではなく、Shopify linklists を直接使用する
 * Liquid テンプレートを出力する
 */
function buildGlobalSectionLiquid(
  section: SectionTemplate,
  liquidTemplate: string,
  extraSchemaSettings: Array<Record<string, unknown>>,
): string {
  const css = section.css;
  const schemaName = getSchemaName(section);
  const isNav = section.category === "navigation";
  const isFooter = section.category === "footer";

  // スキーマ構築（link_list + logo + カスタム設定）
  const schema: Record<string, unknown> = {
    name: schemaName,
    tag: "section",
    class: `aicata-section aicata-section--${section.category}`,
    settings: extraSchemaSettings,
    blocks: [
      { type: "@app" },
      { type: "@theme" },
    ],
    presets: [
      {
        name: schemaName,
        category: "Aicata",
      },
    ],
  };

  // ページ制限
  if (isNav) {
    schema.limit = 1;
    schema.enabled_on = { groups: ["header", "aside"] };
  }
  if (isFooter) {
    schema.limit = 1;
    schema.enabled_on = { groups: ["footer"] };
  }

  return `{%- comment -%}
  Aicata Generated Section: ${schemaName}
  Category: ${section.category} | Variant: ${section.variant}
  Type: Global (linklists-based)
  Generated by Aicata Design Engine — https://aicata.vercel.app
{%- endcomment -%}

{{ 'aicata-global.css' | asset_url | stylesheet_tag }}

<style>
@layer aicata-sections {
${css}
}
</style>

<div class="aicata-section aicata-section--${section.category}" data-section-id="{{ section.id }}">
${liquidTemplate}
</div>

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

  // ── カラースキーム設定を先頭に追加 ──
  const isGlobalSection = ["navigation", "footer", "announcement"].includes(section.category);
  if (!isGlobalSection) {
    settings.unshift({
      type: "color_scheme",
      id: "color_scheme",
      label: "カラースキーム",
      default: "scheme-1",
    });
  }

  // ── スキーマ構築 ──
  const schemaName = getSchemaName(section);
  const schema: Record<string, unknown> = {
    name: schemaName,
    tag: "section",
    class: `aicata-section aicata-section--${section.category}`,
    settings,
    // App Blocks + Theme Blocks を受け入れ
    blocks: [
      { type: "@app" },
      { type: "@theme" },
    ],
    presets: [
      {
        name: schemaName,
        category: "Aicata",
      },
    ],
  };

  // ── enabled_on / disabled_on ──
  const availability = SECTION_AVAILABILITY[section.category];
  if (availability) {
    if (availability.enabled_on) {
      schema.enabled_on = availability.enabled_on;
    }
    if (availability.disabled_on) {
      schema.disabled_on = availability.disabled_on;
    }
  }

  // ── セクション数制限 ──
  if (["navigation", "footer"].includes(section.category)) {
    schema.limit = 1;
  }

  return schema;
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
 * CSS変数名を --aicata- プレフィックス付きに変換
 * "--color-bg" → "--aicata-color-bg"
 */
function namespaceVar(key: string): string {
  if (key.startsWith("--aicata-")) return key;
  if (key.startsWith("--")) return `--aicata-${key.slice(2)}`;
  return `--aicata-${key}`;
}

/**
 * デザイントークン + Google Fonts → CSS アセット
 *
 * CSS Layers を使用してスタイルの優先順位を制御:
 *   @layer aicata-base   → リセット + デザイントークン
 *   @layer aicata-sections → セクション固有スタイル
 *
 * 変数は --aicata- プレフィックス付き（名前空間分離）で定義し、
 * 既存セクションCSS互換のためエイリアス（--color-bg → var(--aicata-color-bg)）も出力
 */
function buildDesignTokenCss(
  tokens: DesignTokenSet,
  fonts: FontDef[],
  suffix: string,
): string {
  // Google Fonts import（@layer 外に配置 — @import は最上位に必要）
  const fontImports = fonts
    .map((f) => {
      const weights = f.weights.join(";");
      const italic = f.italic ? ":ital,wght@0," + weights + ";1," + weights : ":wght@" + weights;
      const family = f.family.replace(/ /g, "+");
      return `@import url('https://fonts.googleapis.com/css2?family=${family}${italic}&display=swap');`;
    })
    .join("\n");

  // 名前空間付き変数 + 後方互換エイリアスを生成
  const buildVarBlock = (
    entries: Record<string, string>,
    label: string,
  ): { namespaced: string; aliases: string } => {
    const nsLines: string[] = [];
    const aliasLines: string[] = [];
    for (const [k, v] of Object.entries(entries)) {
      const nsKey = namespaceVar(k);
      nsLines.push(`    ${nsKey}: ${v};`);
      // 後方互換: --color-bg → var(--aicata-color-bg)
      if (k !== nsKey) {
        aliasLines.push(`    ${k}: var(${nsKey});`);
      }
    }
    return {
      namespaced: nsLines.length
        ? `    /* ${label} */\n${nsLines.join("\n")}`
        : "",
      aliases: aliasLines.length
        ? `    /* ${label} aliases */\n${aliasLines.join("\n")}`
        : "",
    };
  };

  const colorBlock = buildVarBlock(tokens.colors, "Colors");
  const typographyBlock = buildVarBlock(tokens.typography, "Typography");
  const spacingBlock = buildVarBlock(tokens.spacing, "Spacing");
  const motionBlock = buildVarBlock(tokens.motion, "Motion");

  const allNamespaced = [
    colorBlock.namespaced,
    typographyBlock.namespaced,
    spacingBlock.namespaced,
    motionBlock.namespaced,
  ]
    .filter(Boolean)
    .join("\n\n");

  const allAliases = [
    colorBlock.aliases,
    typographyBlock.aliases,
    spacingBlock.aliases,
    motionBlock.aliases,
  ]
    .filter(Boolean)
    .join("\n\n");

  return `/* Aicata Design Tokens: ${suffix} */
/* Generated by Aicata Design Engine — Do not edit manually */
/* CSS Layer order: aicata-base < aicata-sections (sections override base) */

${fontImports}

@layer aicata-base, aicata-sections;

@layer aicata-base {
  :root {
${allNamespaced}

    /* ── Backward-compatible aliases ── */
    /* Existing section CSS uses --color-bg etc. These map to --aicata-color-bg */
${allAliases}
  }

  /* ── Color scheme support ── */
  /* Shopify color_scheme setting applies via class */
  .aicata-color-scheme--1 {
    --aicata-color-bg: var(--color-scheme-1-background, inherit);
    --aicata-color-text: var(--color-scheme-1-text, inherit);
    --aicata-color-accent: var(--color-scheme-1-accent, inherit);
    --aicata-color-button: var(--color-scheme-1-button, inherit);
    --aicata-color-button-text: var(--color-scheme-1-button-text, inherit);
  }

  /* ── Aicata section reset ── */
  /* Scoped to .aicata-section to avoid leaking into base theme */
  .aicata-section {
    box-sizing: border-box;
    position: relative;
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

  .aicata-section a {
    color: var(--aicata-color-accent, currentColor);
    text-decoration: none;
  }

  .aicata-section button {
    cursor: pointer;
    font-family: inherit;
  }

  /* ── Accessibility ── */
  .aicata-section .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* ── Skip link for keyboard navigation ── */
  .aicata-skip-link {
    position: absolute;
    top: -100%;
    left: 0;
    z-index: 9999;
    padding: 8px 16px;
    background: var(--aicata-color-accent, #2563EB);
    color: #fff;
    text-decoration: none;
  }

  .aicata-skip-link:focus {
    top: 0;
  }
}
`;
}

// ============================================================
// Header/Footer Group JSON (Shopify OS 2.0)
// ============================================================

/**
 * header-group.json / footer-group.json を生成
 *
 * Shopify OS 2.0 では theme.liquid に
 *   {% sections 'header-group' %}
 *   {% sections 'footer-group' %}
 * を記述し、グループJSON で使用するセクションを定義する
 */
export function buildSectionGroup(
  groupType: "header" | "footer",
  sectionIds: string[],
): { key: string; value: string } {
  const sections: Record<string, { type: string }> = {};
  const order: string[] = [];

  for (const id of sectionIds) {
    const liquidType = `aicata-${id}`;
    sections[liquidType] = { type: liquidType };
    order.push(liquidType);
  }

  const group = {
    type: groupType === "header" ? "header" : "footer",
    name: groupType === "header" ? "Aicata Header" : "Aicata Footer",
    sections,
    order,
  };

  return {
    key: `sections/${groupType}-group.json`,
    value: JSON.stringify(group, null, 2),
  };
}

/**
 * Navigation / Footer セクションの Liquid ファイルを単独生成
 *
 * convertToLiquid() はコンテンツセクションを処理するが、
 * ヘッダー/フッターは ThemeLayout から独立して生成する必要がある
 */
export function convertGlobalSectionToLiquid(
  sectionId: string,
): { key: string; value: string } | null {
  const section = getSectionById(sectionId);
  if (!section) return null;

  const navTemplate = NAV_LIQUID_TEMPLATES[sectionId];
  const footerTemplate = FOOTER_LIQUID_TEMPLATES[sectionId];

  if (!navTemplate && !footerTemplate) {
    // 通常セクション — ここでは処理しない
    return null;
  }

  const liquidContent = buildGlobalSectionLiquid(
    section,
    navTemplate || footerTemplate,
    navTemplate ? NAV_SCHEMA_SETTINGS : FOOTER_SCHEMA_SETTINGS,
  );

  return {
    key: `sections/aicata-${sectionId}.liquid`,
    value: liquidContent,
  };
}

// ============================================================
// Global CSS (aicata-global.css)
// ============================================================

/**
 * 全セクションで共有されるグローバルCSS
 *
 * 各セクション.liquid が {{ 'aicata-global.css' | asset_url | stylesheet_tag }}
 * で参照するファイル。CSS Layer 定義 + 共通ユーティリティを含む。
 * デザイントークン（カラー、フォント等）は aicata-{suffix}.css に分離。
 */
function buildGlobalCss(): string {
  return `/* Aicata Global Styles */
/* Generated by Aicata Design Engine — Do not edit manually */
/* This file is shared across all Aicata sections */

@layer aicata-base, aicata-sections;

@layer aicata-base {
  /* ── Aicata Section Reset ── */
  .aicata-section {
    box-sizing: border-box;
    position: relative;
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

  .aicata-section a {
    color: var(--aicata-color-accent, currentColor);
    text-decoration: none;
  }

  .aicata-section a:hover {
    opacity: 0.8;
  }

  .aicata-section button {
    cursor: pointer;
    font-family: inherit;
  }

  /* ── Accessibility Utilities ── */
  .aicata-section .visually-hidden,
  .aicata-section .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .aicata-skip-link {
    position: absolute;
    top: -100%;
    left: 0;
    z-index: 9999;
    padding: 8px 16px;
    background: var(--aicata-color-accent, #2563EB);
    color: #fff;
    text-decoration: none;
    font-size: 14px;
  }

  .aicata-skip-link:focus {
    top: 0;
  }

  /* ── Responsive Container ── */
  .aicata-container {
    width: 100%;
    max-width: var(--aicata-container-max-width, 1200px);
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--aicata-gap-md, 16px);
    padding-right: var(--aicata-gap-md, 16px);
  }

  .aicata-container--wide {
    max-width: var(--aicata-container-wide-max-width, 1440px);
  }

  .aicata-container--narrow {
    max-width: var(--aicata-container-narrow-max-width, 800px);
  }

  /* ── Grid Utilities ── */
  .aicata-grid {
    display: grid;
    gap: var(--aicata-gap-md, 16px);
  }

  .aicata-grid--2 { grid-template-columns: repeat(2, 1fr); }
  .aicata-grid--3 { grid-template-columns: repeat(3, 1fr); }
  .aicata-grid--4 { grid-template-columns: repeat(4, 1fr); }

  @media (max-width: 768px) {
    .aicata-grid--2,
    .aicata-grid--3,
    .aicata-grid--4 {
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .aicata-grid--3,
    .aicata-grid--4 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* ── Animation Utilities ── */
  @media (prefers-reduced-motion: no-preference) {
    .aicata-fade-in {
      animation: aicataFadeIn var(--aicata-duration-default, 0.3s) var(--aicata-ease-default, ease) both;
    }

    .aicata-slide-up {
      animation: aicataSlideUp var(--aicata-duration-slow, 0.5s) var(--aicata-ease-out, ease-out) both;
    }
  }

  @keyframes aicataFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes aicataSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Button Base ── */
  .aicata-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity var(--aicata-duration-fast, 0.15s) var(--aicata-ease-default, ease);
  }

  .aicata-btn:hover {
    opacity: 0.9;
  }

  .aicata-btn--primary {
    background: var(--aicata-color-accent, #2563EB);
    color: var(--aicata-color-button-text, #fff);
  }

  .aicata-btn--secondary {
    background: transparent;
    color: var(--aicata-color-accent, #2563EB);
    border: 1px solid currentColor;
  }
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
