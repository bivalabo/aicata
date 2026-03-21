/**
 * Puck Editor Configuration
 *
 * Defines the component library for the visual page editor.
 * Each component maps to a Shopify section template and can be
 * serialized to JSON (for AI generation) and converted to Liquid.
 */
import type { Config, Data } from "@measured/puck";

// ── Component Props Interfaces ──

interface HeroProps {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaUrl: string;
  backgroundImage: string;
  overlay: "none" | "light" | "dark";
  alignment: "left" | "center" | "right";
  height: "small" | "medium" | "large" | "fullscreen";
}

interface ProductGridProps {
  heading: string;
  description: string;
  columns: 2 | 3 | 4;
  productCount: number;
  showPrice: boolean;
  showAddToCart: boolean;
  layout: "grid" | "carousel";
  collectionHandle: string;
}

interface TextImageProps {
  heading: string;
  body: string;
  image: string;
  imagePosition: "left" | "right";
  ctaText: string;
  ctaUrl: string;
  backgroundColor: string;
}

interface CTABannerProps {
  heading: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  style: "solid" | "gradient" | "outline";
  backgroundColor: string;
  textColor: string;
}

interface FAQProps {
  heading: string;
  description: string;
  items: Array<{ question: string; answer: string }>;
  style: "accordion" | "grid";
}

interface TestimonialProps {
  heading: string;
  testimonials: Array<{
    name: string;
    role: string;
    quote: string;
    avatar: string;
    rating: number;
  }>;
  layout: "carousel" | "grid" | "masonry";
}

interface FeatureGridProps {
  heading: string;
  description: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  columns: 2 | 3 | 4;
}

interface RichTextProps {
  content: string;
  maxWidth: "narrow" | "medium" | "wide" | "full";
  alignment: "left" | "center" | "right";
}

interface ImageGalleryProps {
  heading: string;
  images: Array<{ src: string; alt: string; caption: string }>;
  layout: "grid" | "masonry" | "slider";
  columns: 2 | 3 | 4;
}

interface NewsletterProps {
  heading: string;
  description: string;
  placeholder: string;
  buttonText: string;
  style: "inline" | "stacked" | "card";
}

interface SpacerProps {
  height: "small" | "medium" | "large" | "xlarge";
  showDivider: boolean;
}

interface AnnouncementBarProps {
  text: string;
  link: string;
  backgroundColor: string;
  textColor: string;
  dismissible: boolean;
}

// ── Default Values ──

const HERO_DEFAULTS: HeroProps = {
  heading: "あなたのブランドストーリーを伝えよう",
  subheading: "高品質な商品で、毎日の生活をもっと豊かに",
  ctaText: "今すぐ見る",
  ctaUrl: "/collections/all",
  backgroundImage: "",
  overlay: "dark",
  alignment: "center",
  height: "large",
};

const PRODUCT_GRID_DEFAULTS: ProductGridProps = {
  heading: "おすすめ商品",
  description: "",
  columns: 3,
  productCount: 6,
  showPrice: true,
  showAddToCart: true,
  layout: "grid",
  collectionHandle: "",
};

const TEXT_IMAGE_DEFAULTS: TextImageProps = {
  heading: "こだわりのものづくり",
  body: "私たちは品質にこだわり、一つひとつ丁寧に作り上げています。",
  image: "",
  imagePosition: "right",
  ctaText: "詳しく見る",
  ctaUrl: "/pages/about",
  backgroundColor: "#ffffff",
};

const CTA_BANNER_DEFAULTS: CTABannerProps = {
  heading: "特別なオファー",
  description: "期間限定キャンペーン実施中",
  buttonText: "詳しく見る",
  buttonUrl: "/collections/sale",
  style: "gradient",
  backgroundColor: "#7c5cfc",
  textColor: "#ffffff",
};

const FAQ_DEFAULTS: FAQProps = {
  heading: "よくあるご質問",
  description: "",
  items: [
    { question: "配送にはどのくらいかかりますか？", answer: "通常2〜3営業日でお届けします。" },
    { question: "返品は可能ですか？", answer: "商品到着後14日以内であれば返品を承ります。" },
    { question: "支払い方法は何がありますか？", answer: "クレジットカード、PayPay、コンビニ決済に対応しています。" },
  ],
  style: "accordion",
};

const TESTIMONIAL_DEFAULTS: TestimonialProps = {
  heading: "お客様の声",
  testimonials: [
    { name: "田中 美咲", role: "リピーター", quote: "品質の高さに驚きました。リピート確定です。", avatar: "", rating: 5 },
    { name: "鈴木 健太", role: "新規購入者", quote: "丁寧な梱包と迅速な配送で大変満足しています。", avatar: "", rating: 5 },
  ],
  layout: "grid",
};

const FEATURE_GRID_DEFAULTS: FeatureGridProps = {
  heading: "選ばれる理由",
  description: "",
  features: [
    { icon: "✨", title: "高品質素材", description: "厳選された素材のみを使用" },
    { icon: "🚀", title: "翌日配送", description: "午前中のご注文で翌日お届け" },
    { icon: "💬", title: "安心サポート", description: "お気軽にご相談ください" },
  ],
  columns: 3,
};

const RICH_TEXT_DEFAULTS: RichTextProps = {
  content: "<h2>見出し</h2><p>ここにコンテンツを入力してください。</p>",
  maxWidth: "medium",
  alignment: "left",
};

const IMAGE_GALLERY_DEFAULTS: ImageGalleryProps = {
  heading: "ギャラリー",
  images: [],
  layout: "grid",
  columns: 3,
};

const NEWSLETTER_DEFAULTS: NewsletterProps = {
  heading: "ニュースレター登録",
  description: "最新情報やお得なキャンペーン情報をお届けします",
  placeholder: "メールアドレスを入力",
  buttonText: "登録する",
  style: "card",
};

const SPACER_DEFAULTS: SpacerProps = {
  height: "medium",
  showDivider: false,
};

const ANNOUNCEMENT_BAR_DEFAULTS: AnnouncementBarProps = {
  text: "🎉 送料無料キャンペーン実施中！",
  link: "/collections/all",
  backgroundColor: "#1a1a1a",
  textColor: "#ffffff",
  dismissible: true,
};

// ── Height Map ──
const SPACER_HEIGHTS = { small: 32, medium: 64, large: 96, xlarge: 128 };
const HERO_HEIGHTS = { small: "50vh", medium: "70vh", large: "85vh", fullscreen: "100vh" };

// ── Puck Config ──

export const puckConfig: Config = {
  components: {
    Hero: {
      label: "ヒーロー",
      defaultProps: HERO_DEFAULTS,
      fields: {
        heading: { type: "text", label: "見出し" },
        subheading: { type: "text", label: "サブ見出し" },
        ctaText: { type: "text", label: "ボタンテキスト" },
        ctaUrl: { type: "text", label: "ボタンURL" },
        backgroundImage: { type: "text", label: "背景画像URL" },
        overlay: {
          type: "select",
          label: "オーバーレイ",
          options: [
            { label: "なし", value: "none" },
            { label: "明るめ", value: "light" },
            { label: "暗め", value: "dark" },
          ],
        },
        alignment: {
          type: "select",
          label: "テキスト配置",
          options: [
            { label: "左寄せ", value: "left" },
            { label: "中央", value: "center" },
            { label: "右寄せ", value: "right" },
          ],
        },
        height: {
          type: "select",
          label: "高さ",
          options: [
            { label: "小", value: "small" },
            { label: "中", value: "medium" },
            { label: "大", value: "large" },
            { label: "全画面", value: "fullscreen" },
          ],
        },
      },
      render: ({ heading, subheading, ctaText, ctaUrl, backgroundImage, overlay, alignment, height }) => {
        const overlayStyle =
          overlay === "dark"
            ? "rgba(0,0,0,0.5)"
            : overlay === "light"
              ? "rgba(255,255,255,0.3)"
              : "transparent";
        return (
          <section
            style={{
              minHeight: HERO_HEIGHTS[height as keyof typeof HERO_HEIGHTS],
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: backgroundImage ? undefined : "#1a1a1a",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: overlayStyle,
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                padding: "64px 48px",
                maxWidth: 800,
                textAlign: alignment,
              }}
            >
              <h1
                style={{
                  fontSize: "clamp(2rem, 5vw, 4rem)",
                  fontWeight: 700,
                  color: overlay === "light" ? "#1a1a1a" : "#ffffff",
                  lineHeight: 1.1,
                  marginBottom: 16,
                }}
              >
                {heading}
              </h1>
              <p
                style={{
                  fontSize: "clamp(1rem, 2vw, 1.25rem)",
                  color: overlay === "light" ? "#333" : "rgba(255,255,255,0.85)",
                  marginBottom: 32,
                  lineHeight: 1.6,
                }}
              >
                {subheading}
              </p>
              {ctaText && (
                <a
                  href={ctaUrl}
                  style={{
                    display: "inline-block",
                    padding: "14px 32px",
                    backgroundColor: "#7c5cfc",
                    color: "#fff",
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {ctaText}
                </a>
              )}
            </div>
          </section>
        );
      },
    },

    ProductGrid: {
      label: "商品グリッド",
      defaultProps: PRODUCT_GRID_DEFAULTS,
      fields: {
        heading: { type: "text", label: "見出し" },
        description: { type: "text", label: "説明文" },
        columns: {
          type: "select",
          label: "列数",
          options: [
            { label: "2列", value: 2 },
            { label: "3列", value: 3 },
            { label: "4列", value: 4 },
          ],
        },
        productCount: { type: "number", label: "表示件数" },
        showPrice: { type: "radio", label: "価格表示", options: [{ label: "表示", value: true }, { label: "非表示", value: false }] },
        showAddToCart: { type: "radio", label: "カートボタン", options: [{ label: "表示", value: true }, { label: "非表示", value: false }] },
        layout: {
          type: "select",
          label: "レイアウト",
          options: [
            { label: "グリッド", value: "grid" },
            { label: "カルーセル", value: "carousel" },
          ],
        },
        collectionHandle: { type: "text", label: "コレクションハンドル" },
      },
      render: ({ heading, description, columns, productCount, showPrice, showAddToCart }) => {
        const placeholders = Array.from({ length: productCount }, (_, i) => i);
        return (
          <section style={{ padding: "64px 48px" }}>
            {heading && (
              <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>
                {heading}
              </h2>
            )}
            {description && (
              <p style={{ fontSize: 16, color: "#666", textAlign: "center", marginBottom: 40 }}>
                {description}
              </p>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: 24,
                maxWidth: 1200,
                margin: "0 auto",
              }}
            >
              {placeholders.map((i) => (
                <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #eee" }}>
                  <div style={{ aspectRatio: "1/1", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
                    商品画像 {i + 1}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>商品名 {i + 1}</div>
                    {showPrice && <div style={{ fontSize: 14, color: "#666" }}>¥0,000</div>}
                    {showAddToCart && (
                      <button style={{ marginTop: 12, width: "100%", padding: "10px 0", border: "1px solid #1a1a1a", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer", backgroundColor: "transparent" }}>
                        カートに追加
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      },
    },

    TextImage: {
      label: "テキスト＋画像",
      defaultProps: TEXT_IMAGE_DEFAULTS,
      fields: {
        heading: { type: "text", label: "見出し" },
        body: { type: "textarea", label: "本文" },
        image: { type: "text", label: "画像URL" },
        imagePosition: {
          type: "select",
          label: "画像位置",
          options: [
            { label: "左", value: "left" },
            { label: "右", value: "right" },
          ],
        },
        ctaText: { type: "text", label: "ボタンテキスト" },
        ctaUrl: { type: "text", label: "ボタンURL" },
        backgroundColor: { type: "text", label: "背景色" },
      },
      render: ({ heading, body, image, imagePosition, ctaText, ctaUrl, backgroundColor }) => (
        <section style={{ padding: "64px 48px", backgroundColor }}>
          <div
            style={{
              display: "flex",
              flexDirection: imagePosition === "left" ? "row-reverse" : "row",
              gap: 48,
              maxWidth: 1200,
              margin: "0 auto",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>{heading}</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "#444", marginBottom: 24 }}>{body}</p>
              {ctaText && (
                <a href={ctaUrl} style={{ display: "inline-block", padding: "12px 28px", backgroundColor: "#1a1a1a", color: "#fff", borderRadius: 6, fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
                  {ctaText}
                </a>
              )}
            </div>
            <div style={{ flex: 1, aspectRatio: "4/3", backgroundColor: "#f5f5f5", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {image ? <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#aaa" }}>画像</span>}
            </div>
          </div>
        </section>
      ),
    },

    CTABanner: {
      label: "CTAバナー",
      defaultProps: CTA_BANNER_DEFAULTS,
      fields: {
        heading: { type: "text", label: "見出し" },
        description: { type: "text", label: "説明文" },
        buttonText: { type: "text", label: "ボタンテキスト" },
        buttonUrl: { type: "text", label: "ボタンURL" },
        style: {
          type: "select",
          label: "スタイル",
          options: [
            { label: "ソリッド", value: "solid" },
            { label: "グラデーション", value: "gradient" },
            { label: "アウトライン", value: "outline" },
          ],
        },
        backgroundColor: { type: "text", label: "背景色" },
        textColor: { type: "text", label: "テキスト色" },
      },
      render: ({ heading, description, buttonText, buttonUrl, style, backgroundColor, textColor }) => {
        const bg =
          style === "gradient"
            ? `linear-gradient(135deg, ${backgroundColor}, ${backgroundColor}cc)`
            : style === "outline"
              ? "transparent"
              : backgroundColor;
        return (
          <section
            style={{
              padding: "64px 48px",
              background: bg,
              border: style === "outline" ? `2px solid ${backgroundColor}` : undefined,
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: 32, fontWeight: 700, color: style === "outline" ? backgroundColor : textColor, marginBottom: 12 }}>
              {heading}
            </h2>
            {description && (
              <p style={{ fontSize: 16, color: style === "outline" ? "#666" : `${textColor}cc`, marginBottom: 28 }}>
                {description}
              </p>
            )}
            <a
              href={buttonUrl}
              style={{
                display: "inline-block",
                padding: "14px 36px",
                backgroundColor: style === "outline" ? backgroundColor : "#fff",
                color: style === "outline" ? "#fff" : backgroundColor,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {buttonText}
            </a>
          </section>
        );
      },
    },

    FAQ: {
      label: "よくある質問",
      defaultProps: FAQ_DEFAULTS,
      fields: {
        heading: { type: "text", label: "見出し" },
        description: { type: "text", label: "説明文" },
        items: {
          type: "array",
          label: "質問と回答",
          arrayFields: {
            question: { type: "text", label: "質問" },
            answer: { type: "textarea", label: "回答" },
          },
        },
        style: {
          type: "select",
          label: "スタイル",
          options: [
            { label: "アコーディオン", value: "accordion" },
            { label: "グリッド", value: "grid" },
          ],
        },
      },
      render: ({ heading, description, items, style }) => (
        <section style={{ padding: "64px 48px", maxWidth: 800, margin: "0 auto" }}>
          {heading && <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>{heading}</h2>}
          {description && <p style={{ fontSize: 16, color: "#666", textAlign: "center", marginBottom: 40 }}>{description}</p>}
          <div style={{ display: style === "grid" ? "grid" : "flex", gridTemplateColumns: style === "grid" ? "repeat(2, 1fr)" : undefined, gap: 16, flexDirection: "column" }}>
            {items.map((item: { question: string; answer: string }, i: number) => (
              <div key={i} style={{ padding: 20, borderRadius: 12, border: "1px solid #eee", backgroundColor: "#fafafa" }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{item.question}</div>
                <div style={{ fontSize: 15, color: "#555", lineHeight: 1.7 }}>{item.answer}</div>
              </div>
            ))}
          </div>
        </section>
      ),
    },

    Testimonials: {
      label: "お客様の声",
      defaultProps: TESTIMONIAL_DEFAULTS,
      fields: {
        heading: { type: "text", label: "見出し" },
        testimonials: {
          type: "array",
          label: "レビュー",
          arrayFields: {
            name: { type: "text", label: "名前" },
            role: { type: "text", label: "肩書き" },
            quote: { type: "textarea", label: "コメント" },
            avatar: { type: "text", label: "アバターURL" },
            rating: { type: "number", label: "評価（1-5）" },
          },
        },
        layout: {
          type: "select",
          label: "レイアウト",
          options: [
            { label: "グリッド", value: "grid" },
            { label: "カルーセル", value: "carousel" },
            { label: "メイソンリー", value: "masonry" },
          ],
        },
      },
      render: ({ heading, testimonials, layout }) => (
        <section style={{ padding: "64px 48px" }}>
          {heading && <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 40 }}>{heading}</h2>}
          <div style={{ display: "grid", gridTemplateColumns: layout === "grid" ? "repeat(auto-fit, minmax(280px, 1fr))" : "1fr", gap: 24, maxWidth: 1200, margin: "0 auto" }}>
            {testimonials.map((t: { name: string; quote: string; rating: number; role?: string }, i: number) => (
              <div key={i} style={{ padding: 24, borderRadius: 16, backgroundColor: "#fafafa", border: "1px solid #eee" }}>
                <div style={{ fontSize: 14, color: "#f59e0b", marginBottom: 12 }}>{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "#333", marginBottom: 16, fontStyle: "italic" }}>「{t.quote}」</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: "#6b7280" }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: "#888" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ),
    },

    FeatureGrid: {
      label: "特徴グリッド",
      defaultProps: FEATURE_GRID_DEFAULTS,
      fields: {
        heading: { type: "text", label: "見出し" },
        description: { type: "text", label: "説明文" },
        features: {
          type: "array",
          label: "特徴",
          arrayFields: {
            icon: { type: "text", label: "アイコン（絵文字）" },
            title: { type: "text", label: "タイトル" },
            description: { type: "textarea", label: "説明" },
          },
        },
        columns: {
          type: "select",
          label: "列数",
          options: [
            { label: "2列", value: 2 },
            { label: "3列", value: 3 },
            { label: "4列", value: 4 },
          ],
        },
      },
      render: ({ heading, description, features, columns }) => (
        <section style={{ padding: "64px 48px" }}>
          {heading && <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>{heading}</h2>}
          {description && <p style={{ fontSize: 16, color: "#666", textAlign: "center", marginBottom: 40 }}>{description}</p>}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 32, maxWidth: 1200, margin: "0 auto" }}>
            {features.map((f: { icon: string; title: string; description: string }, i: number) => (
              <div key={i} style={{ textAlign: "center", padding: 24 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      ),
    },

    RichText: {
      label: "リッチテキスト",
      defaultProps: RICH_TEXT_DEFAULTS,
      fields: {
        content: { type: "textarea", label: "HTMLコンテンツ" },
        maxWidth: {
          type: "select",
          label: "最大幅",
          options: [
            { label: "狭い", value: "narrow" },
            { label: "中", value: "medium" },
            { label: "広い", value: "wide" },
            { label: "全幅", value: "full" },
          ],
        },
        alignment: {
          type: "select",
          label: "テキスト配置",
          options: [
            { label: "左寄せ", value: "left" },
            { label: "中央", value: "center" },
            { label: "右寄せ", value: "right" },
          ],
        },
      },
      render: ({ content, maxWidth, alignment }) => {
        const widthMap = { narrow: 640, medium: 800, wide: 1000, full: "100%" };
        return (
          <section style={{ padding: "48px", maxWidth: widthMap[maxWidth as keyof typeof widthMap], margin: "0 auto", textAlign: alignment }}>
            <div dangerouslySetInnerHTML={{ __html: content }} style={{ fontSize: 16, lineHeight: 1.8, color: "#333" }} />
          </section>
        );
      },
    },

    Newsletter: {
      label: "ニュースレター",
      defaultProps: NEWSLETTER_DEFAULTS,
      fields: {
        heading: { type: "text", label: "見出し" },
        description: { type: "text", label: "説明文" },
        placeholder: { type: "text", label: "プレースホルダー" },
        buttonText: { type: "text", label: "ボタンテキスト" },
        style: {
          type: "select",
          label: "スタイル",
          options: [
            { label: "インライン", value: "inline" },
            { label: "スタック", value: "stacked" },
            { label: "カード", value: "card" },
          ],
        },
      },
      render: ({ heading, description, placeholder, buttonText, style }) => (
        <section
          style={{
            padding: style === "card" ? "48px" : "64px 48px",
            textAlign: "center",
            ...(style === "card" ? { margin: "0 auto", maxWidth: 600 } : {}),
          }}
        >
          <div style={style === "card" ? { padding: 40, borderRadius: 16, backgroundColor: "#f8f9fa", border: "1px solid #eee" } : {}}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{heading}</h2>
            {description && <p style={{ fontSize: 15, color: "#666", marginBottom: 24 }}>{description}</p>}
            <div style={{ display: "flex", gap: 8, maxWidth: 440, margin: "0 auto", flexDirection: style === "stacked" ? "column" : "row" }}>
              <input type="email" placeholder={placeholder} style={{ flex: 1, padding: "12px 16px", borderRadius: 8, border: "1px solid #ddd", fontSize: 15 }} />
              <button style={{ padding: "12px 24px", backgroundColor: "#1a1a1a", color: "#fff", borderRadius: 8, fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                {buttonText}
              </button>
            </div>
          </div>
        </section>
      ),
    },

    Spacer: {
      label: "スペーサー",
      defaultProps: SPACER_DEFAULTS,
      fields: {
        height: {
          type: "select",
          label: "高さ",
          options: [
            { label: "小（32px）", value: "small" },
            { label: "中（64px）", value: "medium" },
            { label: "大（96px）", value: "large" },
            { label: "特大（128px）", value: "xlarge" },
          ],
        },
        showDivider: { type: "radio", label: "区切り線", options: [{ label: "表示", value: true }, { label: "非表示", value: false }] },
      },
      render: ({ height, showDivider }) => (
        <div style={{ height: SPACER_HEIGHTS[height as keyof typeof SPACER_HEIGHTS], display: "flex", alignItems: "center", justifyContent: "center" }}>
          {showDivider && <hr style={{ width: "80%", border: "none", borderTop: "1px solid #eee" }} />}
        </div>
      ),
    },

    AnnouncementBar: {
      label: "お知らせバー",
      defaultProps: ANNOUNCEMENT_BAR_DEFAULTS,
      fields: {
        text: { type: "text", label: "テキスト" },
        link: { type: "text", label: "リンクURL" },
        backgroundColor: { type: "text", label: "背景色" },
        textColor: { type: "text", label: "テキスト色" },
        dismissible: { type: "radio", label: "閉じるボタン", options: [{ label: "表示", value: true }, { label: "非表示", value: false }] },
      },
      render: ({ text, link, backgroundColor, textColor }) => (
        <div style={{ padding: "10px 24px", backgroundColor, color: textColor, textAlign: "center", fontSize: 14, fontWeight: 500 }}>
          {link ? <a href={link} style={{ color: textColor, textDecoration: "underline" }}>{text}</a> : text}
        </div>
      ),
    },
  },
};

// ── Helper: Create empty Puck data ──
export function createEmptyPuckData(): Data {
  return {
    root: { props: {} },
    content: [],
  };
}

// ── Helper: Get component list for AI generation ──
export function getComponentCatalog(): string {
  return Object.entries(puckConfig.components)
    .map(([key, comp]) => {
      const fields = comp.fields
        ? Object.entries(comp.fields)
            .map(([fk, fv]: [string, any]) => `  - ${fk}: ${fv.type}`)
            .join("\n")
        : "";
      return `### ${key} (${comp.label})\n${fields}`;
    })
    .join("\n\n");
}

export type { HeroProps, ProductGridProps, TextImageProps, CTABannerProps, FAQProps, TestimonialProps, FeatureGridProps, RichTextProps, ImageGalleryProps, NewsletterProps, SpacerProps, AnnouncementBarProps };
