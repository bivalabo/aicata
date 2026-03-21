/**
 * Puck JSON → Shopify Liquid Conversion Engine
 *
 * Converts Puck editor data (JSON) into Shopify-compatible Liquid templates.
 * Each Puck component maps to a Shopify section with its own schema.
 */
import type { Data } from "@measured/puck";

interface LiquidSection {
  /** Shopify section type name */
  type: string;
  /** Liquid template code */
  liquid: string;
  /** Shopify section schema JSON */
  schema: object;
  /** CSS for the section */
  css: string;
}

interface LiquidOutput {
  /** Full Liquid template for the page */
  template: string;
  /** Individual sections */
  sections: LiquidSection[];
  /** Combined CSS */
  css: string;
  /** Shopify template JSON (for JSON templates) */
  templateJson: object;
}

// ── Section converters ──

function convertHero(props: any): LiquidSection {
  const type = "aicata-hero";
  return {
    type,
    liquid: `<section class="aicata-hero aicata-hero--{{ section.settings.height }} aicata-hero--align-{{ section.settings.alignment }}"
  {% if section.settings.background_image != blank %}
    style="background-image: url('{{ section.settings.background_image | image_url: width: 1920 }}')"
  {% endif %}>
  {% if section.settings.overlay != 'none' %}
    <div class="aicata-hero__overlay aicata-hero__overlay--{{ section.settings.overlay }}"></div>
  {% endif %}
  <div class="aicata-hero__content">
    <h1 class="aicata-hero__heading">{{ section.settings.heading }}</h1>
    {% if section.settings.subheading != blank %}
      <p class="aicata-hero__subheading">{{ section.settings.subheading }}</p>
    {% endif %}
    {% if section.settings.cta_text != blank %}
      <a href="{{ section.settings.cta_url }}" class="aicata-hero__cta">
        {{ section.settings.cta_text }}
      </a>
    {% endif %}
  </div>
</section>`,
    schema: {
      name: "ヒーロー",
      tag: "section",
      class: "aicata-section",
      settings: [
        { type: "text", id: "heading", label: "見出し", default: props.heading },
        { type: "text", id: "subheading", label: "サブ見出し", default: props.subheading },
        { type: "text", id: "cta_text", label: "ボタンテキスト", default: props.ctaText },
        { type: "url", id: "cta_url", label: "ボタンURL", default: props.ctaUrl },
        { type: "image_picker", id: "background_image", label: "背景画像" },
        {
          type: "select", id: "overlay", label: "オーバーレイ", default: props.overlay,
          options: [
            { value: "none", label: "なし" },
            { value: "light", label: "明るめ" },
            { value: "dark", label: "暗め" },
          ],
        },
        {
          type: "select", id: "alignment", label: "テキスト配置", default: props.alignment,
          options: [
            { value: "left", label: "左寄せ" },
            { value: "center", label: "中央" },
            { value: "right", label: "右寄せ" },
          ],
        },
        {
          type: "select", id: "height", label: "高さ", default: props.height,
          options: [
            { value: "small", label: "小" },
            { value: "medium", label: "中" },
            { value: "large", label: "大" },
            { value: "fullscreen", label: "全画面" },
          ],
        },
      ],
    },
    css: `.aicata-hero {
  position: relative;
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-color: #1a1a1a;
}
.aicata-hero--small { min-height: 50vh; }
.aicata-hero--medium { min-height: 70vh; }
.aicata-hero--large { min-height: 85vh; }
.aicata-hero--fullscreen { min-height: 100vh; }
.aicata-hero--align-left { justify-content: flex-start; }
.aicata-hero--align-center { justify-content: center; text-align: center; }
.aicata-hero--align-right { justify-content: flex-end; }
.aicata-hero__overlay {
  position: absolute;
  inset: 0;
}
.aicata-hero__overlay--dark { background-color: rgba(0,0,0,0.5); }
.aicata-hero__overlay--light { background-color: rgba(255,255,255,0.3); }
.aicata-hero__content {
  position: relative;
  z-index: 1;
  padding: 64px 48px;
  max-width: 800px;
}
.aicata-hero__heading {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 16px;
}
.aicata-hero__overlay--light + .aicata-hero__content .aicata-hero__heading { color: #1a1a1a; }
.aicata-hero__subheading {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: rgba(255,255,255,0.85);
  margin-bottom: 32px;
  line-height: 1.6;
}
.aicata-hero__cta {
  display: inline-block;
  padding: 14px 32px;
  background-color: var(--aicata-accent, #7c5cfc);
  color: #fff;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;
}
.aicata-hero__cta:hover { opacity: 0.9; }`,
  };
}

function convertProductGrid(props: any): LiquidSection {
  const type = "aicata-product-grid";
  return {
    type,
    liquid: `<section class="aicata-product-grid">
  {% if section.settings.heading != blank %}
    <h2 class="aicata-product-grid__heading">{{ section.settings.heading }}</h2>
  {% endif %}
  {% if section.settings.description != blank %}
    <p class="aicata-product-grid__description">{{ section.settings.description }}</p>
  {% endif %}
  <div class="aicata-product-grid__grid aicata-product-grid__grid--cols-{{ section.settings.columns }}">
    {% assign collection = collections[section.settings.collection_handle] %}
    {% for product in collection.products limit: section.settings.product_count %}
      <div class="aicata-product-card">
        <a href="{{ product.url }}" class="aicata-product-card__link">
          <div class="aicata-product-card__image">
            {% if product.featured_image %}
              <img src="{{ product.featured_image | image_url: width: 600 }}"
                   alt="{{ product.featured_image.alt | escape }}"
                   loading="lazy" width="600" height="600">
            {% endif %}
          </div>
          <div class="aicata-product-card__info">
            <h3 class="aicata-product-card__title">{{ product.title }}</h3>
            {% if section.settings.show_price %}
              <div class="aicata-product-card__price">{{ product.price | money }}</div>
            {% endif %}
          </div>
        </a>
        {% if section.settings.show_add_to_cart %}
          <form method="post" action="/cart/add">
            <input type="hidden" name="id" value="{{ product.variants.first.id }}">
            <button type="submit" class="aicata-product-card__atc">カートに追加</button>
          </form>
        {% endif %}
      </div>
    {% endfor %}
  </div>
</section>`,
    schema: {
      name: "商品グリッド",
      tag: "section",
      class: "aicata-section",
      settings: [
        { type: "text", id: "heading", label: "見出し", default: props.heading },
        { type: "text", id: "description", label: "説明文", default: props.description },
        { type: "collection", id: "collection_handle", label: "コレクション" },
        {
          type: "range", id: "columns", label: "列数",
          min: 2, max: 4, step: 1, default: props.columns,
        },
        {
          type: "range", id: "product_count", label: "表示件数",
          min: 2, max: 12, step: 1, default: props.productCount,
        },
        { type: "checkbox", id: "show_price", label: "価格を表示", default: props.showPrice },
        { type: "checkbox", id: "show_add_to_cart", label: "カートボタンを表示", default: props.showAddToCart },
      ],
    },
    css: `.aicata-product-grid { padding: 64px 48px; }
.aicata-product-grid__heading { font-size: 28px; font-weight: 700; text-align: center; margin-bottom: 8px; }
.aicata-product-grid__description { font-size: 16px; color: #666; text-align: center; margin-bottom: 40px; }
.aicata-product-grid__grid { display: grid; gap: 24px; max-width: 1200px; margin: 0 auto; }
.aicata-product-grid__grid--cols-2 { grid-template-columns: repeat(2, 1fr); }
.aicata-product-grid__grid--cols-3 { grid-template-columns: repeat(3, 1fr); }
.aicata-product-grid__grid--cols-4 { grid-template-columns: repeat(4, 1fr); }
@media (max-width: 768px) { .aicata-product-grid__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .aicata-product-grid__grid { grid-template-columns: 1fr; } }
.aicata-product-card { border-radius: 12px; overflow: hidden; border: 1px solid #eee; transition: box-shadow 0.2s; }
.aicata-product-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.aicata-product-card__link { text-decoration: none; color: inherit; }
.aicata-product-card__image { aspect-ratio: 1/1; overflow: hidden; background: #f5f5f5; }
.aicata-product-card__image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.aicata-product-card:hover .aicata-product-card__image img { transform: scale(1.05); }
.aicata-product-card__info { padding: 16px; }
.aicata-product-card__title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.aicata-product-card__price { font-size: 14px; color: #666; }
.aicata-product-card__atc {
  width: calc(100% - 32px); margin: 0 16px 16px; padding: 10px 0;
  border: 1px solid #1a1a1a; border-radius: 6px; font-size: 14px;
  font-weight: 500; cursor: pointer; background: transparent; transition: all 0.2s;
}
.aicata-product-card__atc:hover { background: #1a1a1a; color: #fff; }`,
  };
}

function convertTextImage(props: any): LiquidSection {
  const type = "aicata-text-image";
  return {
    type,
    liquid: `<section class="aicata-text-image" style="background-color: {{ section.settings.background_color }}">
  <div class="aicata-text-image__grid aicata-text-image__grid--image-{{ section.settings.image_position }}">
    <div class="aicata-text-image__text">
      <h2 class="aicata-text-image__heading">{{ section.settings.heading }}</h2>
      <div class="aicata-text-image__body">{{ section.settings.body }}</div>
      {% if section.settings.cta_text != blank %}
        <a href="{{ section.settings.cta_url }}" class="aicata-text-image__cta">
          {{ section.settings.cta_text }}
        </a>
      {% endif %}
    </div>
    <div class="aicata-text-image__image">
      {% if section.settings.image != blank %}
        <img src="{{ section.settings.image | image_url: width: 800 }}"
             alt="{{ section.settings.heading | escape }}" loading="lazy">
      {% endif %}
    </div>
  </div>
</section>`,
    schema: {
      name: "テキスト＋画像",
      tag: "section",
      class: "aicata-section",
      settings: [
        { type: "text", id: "heading", label: "見出し", default: props.heading },
        { type: "richtext", id: "body", label: "本文", default: props.body },
        { type: "image_picker", id: "image", label: "画像" },
        {
          type: "select", id: "image_position", label: "画像位置", default: props.imagePosition,
          options: [
            { value: "left", label: "左" },
            { value: "right", label: "右" },
          ],
        },
        { type: "text", id: "cta_text", label: "ボタンテキスト", default: props.ctaText },
        { type: "url", id: "cta_url", label: "ボタンURL", default: props.ctaUrl },
        { type: "color", id: "background_color", label: "背景色", default: props.backgroundColor },
      ],
    },
    css: `.aicata-text-image { padding: 64px 48px; }
.aicata-text-image__grid {
  display: flex; gap: 48px; max-width: 1200px; margin: 0 auto; align-items: center;
}
.aicata-text-image__grid--image-left { flex-direction: row-reverse; }
@media (max-width: 768px) { .aicata-text-image__grid { flex-direction: column !important; } }
.aicata-text-image__text { flex: 1; }
.aicata-text-image__heading { font-size: 28px; font-weight: 700; margin-bottom: 16px; line-height: 1.3; }
.aicata-text-image__body { font-size: 16px; line-height: 1.8; color: #444; margin-bottom: 24px; }
.aicata-text-image__cta {
  display: inline-block; padding: 12px 28px; background: #1a1a1a; color: #fff;
  border-radius: 6px; font-size: 15px; font-weight: 600; text-decoration: none;
}
.aicata-text-image__image { flex: 1; border-radius: 12px; overflow: hidden; }
.aicata-text-image__image img { width: 100%; height: auto; display: block; }`,
  };
}

function convertCTABanner(props: any): LiquidSection {
  const type = "aicata-cta-banner";
  return {
    type,
    liquid: `<section class="aicata-cta-banner aicata-cta-banner--{{ section.settings.style }}"
  style="{% if section.settings.style == 'gradient' %}background: linear-gradient(135deg, {{ section.settings.background_color }}, {{ section.settings.background_color }}cc){% elsif section.settings.style == 'outline' %}border: 2px solid {{ section.settings.background_color }}{% else %}background-color: {{ section.settings.background_color }}{% endif %}">
  <h2 class="aicata-cta-banner__heading" style="color: {% if section.settings.style == 'outline' %}{{ section.settings.background_color }}{% else %}{{ section.settings.text_color }}{% endif %}">
    {{ section.settings.heading }}
  </h2>
  {% if section.settings.description != blank %}
    <p class="aicata-cta-banner__description">{{ section.settings.description }}</p>
  {% endif %}
  <a href="{{ section.settings.button_url }}" class="aicata-cta-banner__button">
    {{ section.settings.button_text }}
  </a>
</section>`,
    schema: {
      name: "CTAバナー",
      tag: "section",
      class: "aicata-section",
      settings: [
        { type: "text", id: "heading", label: "見出し", default: props.heading },
        { type: "text", id: "description", label: "説明文", default: props.description },
        { type: "text", id: "button_text", label: "ボタンテキスト", default: props.buttonText },
        { type: "url", id: "button_url", label: "ボタンURL", default: props.buttonUrl },
        {
          type: "select", id: "style", label: "スタイル", default: props.style,
          options: [
            { value: "solid", label: "ソリッド" },
            { value: "gradient", label: "グラデーション" },
            { value: "outline", label: "アウトライン" },
          ],
        },
        { type: "color", id: "background_color", label: "背景色", default: props.backgroundColor },
        { type: "color", id: "text_color", label: "テキスト色", default: props.textColor },
      ],
    },
    css: `.aicata-cta-banner { padding: 64px 48px; text-align: center; }
.aicata-cta-banner__heading { font-size: 32px; font-weight: 700; margin-bottom: 12px; }
.aicata-cta-banner__description { font-size: 16px; margin-bottom: 28px; opacity: 0.8; }
.aicata-cta-banner__button {
  display: inline-block; padding: 14px 36px; border-radius: 8px;
  font-size: 16px; font-weight: 600; text-decoration: none; transition: opacity 0.2s;
}
.aicata-cta-banner--solid .aicata-cta-banner__button,
.aicata-cta-banner--gradient .aicata-cta-banner__button { background: #fff; color: var(--aicata-accent, #7c5cfc); }
.aicata-cta-banner--outline .aicata-cta-banner__button { background: var(--aicata-accent, #7c5cfc); color: #fff; }`,
  };
}

function convertFAQ(props: any): LiquidSection {
  const type = "aicata-faq";
  const blocksLiquid = props.items
    .map((_: any, i: number) => `    {% for block in section.blocks %}
      {% if forloop.index0 == ${i} %}
        <div class="aicata-faq__item" {{ block.shopify_attributes }}>
          <details>
            <summary class="aicata-faq__question">{{ block.settings.question }}</summary>
            <div class="aicata-faq__answer">{{ block.settings.answer }}</div>
          </details>
        </div>
      {% endif %}
    {% endfor %}`)
    .join("\n");

  return {
    type,
    liquid: `<section class="aicata-faq">
  {% if section.settings.heading != blank %}
    <h2 class="aicata-faq__heading">{{ section.settings.heading }}</h2>
  {% endif %}
  {% if section.settings.description != blank %}
    <p class="aicata-faq__description">{{ section.settings.description }}</p>
  {% endif %}
  <div class="aicata-faq__list aicata-faq__list--{{ section.settings.style }}">
    {% for block in section.blocks %}
      <div class="aicata-faq__item" {{ block.shopify_attributes }}>
        <details>
          <summary class="aicata-faq__question">{{ block.settings.question }}</summary>
          <div class="aicata-faq__answer">{{ block.settings.answer }}</div>
        </details>
      </div>
    {% endfor %}
  </div>
</section>`,
    schema: {
      name: "よくある質問",
      tag: "section",
      class: "aicata-section",
      settings: [
        { type: "text", id: "heading", label: "見出し", default: props.heading },
        { type: "text", id: "description", label: "説明文", default: props.description },
        {
          type: "select", id: "style", label: "スタイル", default: props.style,
          options: [
            { value: "accordion", label: "アコーディオン" },
            { value: "grid", label: "グリッド" },
          ],
        },
      ],
      blocks: [
        {
          type: "faq_item",
          name: "質問",
          settings: [
            { type: "text", id: "question", label: "質問" },
            { type: "richtext", id: "answer", label: "回答" },
          ],
        },
      ],
      presets: [
        {
          name: "よくある質問",
          blocks: props.items.map((item: any) => ({
            type: "faq_item",
            settings: { question: item.question, answer: item.answer },
          })),
        },
      ],
    },
    css: `.aicata-faq { padding: 64px 48px; max-width: 800px; margin: 0 auto; }
.aicata-faq__heading { font-size: 28px; font-weight: 700; text-align: center; margin-bottom: 8px; }
.aicata-faq__description { font-size: 16px; color: #666; text-align: center; margin-bottom: 40px; }
.aicata-faq__list { display: flex; flex-direction: column; gap: 16px; }
.aicata-faq__list--grid { display: grid; grid-template-columns: repeat(2, 1fr); }
@media (max-width: 768px) { .aicata-faq__list--grid { grid-template-columns: 1fr; } }
.aicata-faq__item { padding: 20px; border-radius: 12px; border: 1px solid #eee; background: #fafafa; }
.aicata-faq__question { font-size: 16px; font-weight: 600; cursor: pointer; list-style: none; }
.aicata-faq__question::-webkit-details-marker { display: none; }
.aicata-faq__answer { font-size: 15px; color: #555; line-height: 1.7; margin-top: 12px; }`,
  };
}

function convertSpacer(props: any): LiquidSection {
  return {
    type: "aicata-spacer",
    liquid: `<div class="aicata-spacer aicata-spacer--{{ section.settings.height }}">
  {% if section.settings.show_divider %}
    <hr class="aicata-spacer__divider">
  {% endif %}
</div>`,
    schema: {
      name: "スペーサー",
      tag: "div",
      settings: [
        {
          type: "select", id: "height", label: "高さ", default: props.height,
          options: [
            { value: "small", label: "小" },
            { value: "medium", label: "中" },
            { value: "large", label: "大" },
            { value: "xlarge", label: "特大" },
          ],
        },
        { type: "checkbox", id: "show_divider", label: "区切り線を表示", default: props.showDivider },
      ],
    },
    css: `.aicata-spacer { display: flex; align-items: center; justify-content: center; }
.aicata-spacer--small { height: 32px; }
.aicata-spacer--medium { height: 64px; }
.aicata-spacer--large { height: 96px; }
.aicata-spacer--xlarge { height: 128px; }
.aicata-spacer__divider { width: 80%; border: none; border-top: 1px solid #eee; }`,
  };
}

// ── Converter Map ──
const converters: Record<string, (props: any) => LiquidSection> = {
  Hero: convertHero,
  ProductGrid: convertProductGrid,
  TextImage: convertTextImage,
  CTABanner: convertCTABanner,
  FAQ: convertFAQ,
  Spacer: convertSpacer,
};

// ── Main Conversion Function ──

export function puckToLiquid(data: Data): LiquidOutput {
  const sections: LiquidSection[] = [];
  const cssChunks: string[] = [];

  for (const item of data.content) {
    const converter = converters[item.type];
    if (converter) {
      const section = converter(item.props || {});
      sections.push(section);
      cssChunks.push(section.css);
    } else {
      console.warn(`[Puck→Liquid] No converter for component type: ${item.type}`);
    }
  }

  // Build full template
  const sectionTemplates = sections.map((s) => s.liquid).join("\n\n");
  const combinedCss = cssChunks.join("\n\n");

  const template = `{% comment %}
  Generated by Aicata — AI Page Builder
  https://aicata.app
{% endcomment %}

${sectionTemplates}

{% if content_for_header %}
  {{ content_for_header }}
{% endif %}

<style>
  :root {
    --aicata-accent: {{ settings.accent_color | default: '#7c5cfc' }};
  }
  ${combinedCss}
</style>`;

  // Build Shopify JSON template
  const templateJson = {
    sections: Object.fromEntries(
      sections.map((s, i) => [
        `aicata_${i}`,
        {
          type: s.type,
          settings: {},
        },
      ]),
    ),
    order: sections.map((_, i) => `aicata_${i}`),
  };

  return { template, sections, css: combinedCss, templateJson };
}

/**
 * Convert a single Puck component to standalone Liquid section file
 * (for Shopify theme section upload)
 */
export function puckComponentToLiquidFile(
  componentType: string,
  props: any,
): { filename: string; content: string } | null {
  const converter = converters[componentType];
  if (!converter) return null;

  const section = converter(props);
  const content = `${section.liquid}

<style>
${section.css}
</style>

{% schema %}
${JSON.stringify(section.schema, null, 2)}
{% endschema %}`;

  return {
    filename: `sections/${section.type}.liquid`,
    content,
  };
}

export type { LiquidSection, LiquidOutput };
