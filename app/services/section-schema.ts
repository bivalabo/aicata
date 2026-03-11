import type { SectionSchema, SectionSetting, SectionBlock } from "~/types";

/**
 * セクションスキーマビルダー
 *
 * Online Store 2.0準拠のセクションスキーマを
 * プログラマティックに構築するためのビルダーパターン
 */

export class SectionSchemaBuilder {
  private schema: SectionSchema;

  constructor(name: string) {
    this.schema = {
      name,
      settings: [],
      blocks: [],
      presets: [],
    };
  }

  /**
   * タグを設定（セクションのHTMLタグ）
   */
  tag(tag: string): this {
    this.schema.tag = tag;
    return this;
  }

  /**
   * CSSクラスを設定
   */
  cssClass(className: string): this {
    this.schema.class = className;
    return this;
  }

  // ===== Settings =====

  addText(id: string, label: string, defaultValue?: string): this {
    this.schema.settings.push({
      type: "text",
      id,
      label,
      default: defaultValue,
    });
    return this;
  }

  addTextarea(id: string, label: string, defaultValue?: string): this {
    this.schema.settings.push({
      type: "textarea",
      id,
      label,
      default: defaultValue,
    });
    return this;
  }

  addRichtext(id: string, label: string, defaultValue?: string): this {
    this.schema.settings.push({
      type: "richtext",
      id,
      label,
      default: defaultValue,
    });
    return this;
  }

  addImage(id: string, label: string): this {
    this.schema.settings.push({
      type: "image_picker",
      id,
      label,
    });
    return this;
  }

  addUrl(id: string, label: string, defaultValue?: string): this {
    this.schema.settings.push({
      type: "url",
      id,
      label,
      default: defaultValue,
    });
    return this;
  }

  addColor(id: string, label: string, defaultValue?: string): this {
    this.schema.settings.push({
      type: "color",
      id,
      label,
      default: defaultValue,
    });
    return this;
  }

  addCheckbox(id: string, label: string, defaultValue: boolean = false): this {
    this.schema.settings.push({
      type: "checkbox",
      id,
      label,
      default: defaultValue,
    });
    return this;
  }

  addNumber(id: string, label: string, defaultValue?: number): this {
    this.schema.settings.push({
      type: "number",
      id,
      label,
      default: defaultValue,
    });
    return this;
  }

  addRange(
    id: string,
    label: string,
    min: number,
    max: number,
    step: number,
    defaultValue: number,
  ): this {
    this.schema.settings.push({
      type: "range",
      id,
      label,
      default: defaultValue,
      info: `${min}〜${max}（${step}刻み）`,
    });
    return this;
  }

  addSelect(
    id: string,
    label: string,
    options: { value: string; label: string }[],
    defaultValue?: string,
  ): this {
    this.schema.settings.push({
      type: "select",
      id,
      label,
      options,
      default: defaultValue || options[0]?.value,
    });
    return this;
  }

  addCollection(id: string, label: string): this {
    this.schema.settings.push({
      type: "collection",
      id,
      label,
    });
    return this;
  }

  addProduct(id: string, label: string): this {
    this.schema.settings.push({
      type: "product",
      id,
      label,
    });
    return this;
  }

  // ===== Blocks =====

  addBlock(
    type: string,
    name: string,
    settings: SectionSetting[],
    limit?: number,
  ): this {
    const block: SectionBlock = { type, name, settings };
    if (limit) block.limit = limit;
    this.schema.blocks!.push(block);
    return this;
  }

  // ===== Presets =====

  addPreset(
    name: string,
    settings?: Record<string, unknown>,
    blocks?: { type: string; settings?: Record<string, unknown> }[],
  ): this {
    this.schema.presets!.push({ name, settings, blocks });
    return this;
  }

  // ===== Build =====

  build(): SectionSchema {
    return { ...this.schema };
  }

  toJSON(): string {
    return JSON.stringify(this.schema, null, 2);
  }
}

// ===== プリセットセクションスキーマ =====

/**
 * ヒーローセクション（ファーストビュー）
 */
export function createHeroSchema(): SectionSchema {
  return new SectionSchemaBuilder("ヒーロー")
    .tag("section")
    .cssClass("hero")
    .addText("heading", "見出し", "メインキャッチコピー")
    .addTextarea("subheading", "サブ見出し", "ここにサブテキストが入ります")
    .addImage("background_image", "背景画像")
    .addUrl("button_url", "ボタンリンク")
    .addText("button_text", "ボタンテキスト", "詳しく見る")
    .addSelect("layout", "レイアウト", [
      { value: "center", label: "中央寄せ" },
      { value: "left", label: "左寄せ" },
      { value: "right", label: "右寄せ" },
    ])
    .addColor("text_color", "テキスト色", "#ffffff")
    .addColor("overlay_color", "オーバーレイ色", "#000000")
    .addRange("overlay_opacity", "オーバーレイ透明度", 0, 100, 5, 40)
    .addPreset("ヒーロー", {
      heading: "あなたのストアへようこそ",
      subheading: "最高の商品をお届けします",
      button_text: "商品を見る",
    })
    .build();
}

/**
 * 特徴セクション（3カラム）
 */
export function createFeaturesSchema(): SectionSchema {
  return new SectionSchemaBuilder("特徴")
    .tag("section")
    .cssClass("features")
    .addText("heading", "セクション見出し", "私たちの特徴")
    .addBlock(
      "feature",
      "特徴項目",
      [
        { type: "text", id: "title", label: "タイトル" },
        { type: "textarea", id: "description", label: "説明文" },
        { type: "image_picker", id: "icon", label: "アイコン画像" },
      ],
      6,
    )
    .addPreset("特徴", {}, [
      { type: "feature", settings: { title: "高品質", description: "最高品質の素材を使用" } },
      { type: "feature", settings: { title: "安心配送", description: "丁寧な梱包でお届け" } },
      { type: "feature", settings: { title: "サポート", description: "24時間対応のカスタマーサポート" } },
    ])
    .build();
}

/**
 * お客様の声セクション
 */
export function createTestimonialsSchema(): SectionSchema {
  return new SectionSchemaBuilder("お客様の声")
    .tag("section")
    .cssClass("testimonials")
    .addText("heading", "セクション見出し", "お客様の声")
    .addBlock(
      "testimonial",
      "レビュー",
      [
        { type: "textarea", id: "quote", label: "コメント" },
        { type: "text", id: "author", label: "お名前" },
        { type: "text", id: "role", label: "肩書き" },
        { type: "image_picker", id: "avatar", label: "プロフィール画像" },
        { type: "range", id: "rating", label: "評価（星）" },
      ],
      8,
    )
    .addPreset("お客様の声")
    .build();
}
