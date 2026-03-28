/**
 * 3-Layer Intelligent Media Strategy
 *
 * リビルド時に元サイトの各画像を評価し、最適な戦略を決定:
 *
 * Decision:
 *   KEEP      — ブランド固有・不可替の資産（ロゴ、商品写真、企業写真）
 *   GENERATE  — 汎用的な画像で、より良い代替が可能（背景、装飾、ストック風）
 *   PLACEHOLDER — ユーザーが後から提供すべきコンテンツ（顧客固有の写真等）
 *
 * Generation Tiers (cost optimization):
 *   Tier 1 (¥0)  — CSS gradients, SVG patterns, pure CSS decorations
 *   Tier 2 (¥0)  — Unsplash / Pexels API (attribution required)
 *   Tier 3 (有料) — AI image generation (Stability AI etc.) — premium only
 */

// ============================================================
// Types
// ============================================================

export type MediaDecision = "keep" | "generate" | "placeholder";
export type GenerationTier = "css-svg" | "stock-photo" | "ai-generation";

export interface ImageDecision {
  /** 元画像のURL */
  sourceUrl: string;
  /** 画像コンテキスト（クロール時に推定） */
  context: "hero" | "product" | "logo" | "background" | "content";
  /** alt テキスト */
  alt: string;
  /** 決定: KEEP / GENERATE / PLACEHOLDER */
  decision: MediaDecision;
  /** 決定理由 */
  reasoning: string;
  /** GENERATE の場合: 推奨生成ティア */
  generationTier?: GenerationTier;
  /** GENERATE の場合: 生成ヒント（検索キーワードやプロンプト） */
  generationHint?: string;
  /** PLACEHOLDER の場合: ユーザーへのガイダンス */
  placeholderGuidance?: string;
  /** GENERATE の場合: 生成されたCSS/SVG/URL */
  generatedAsset?: string;
}

export interface MediaStrategy {
  /** 全画像の決定 */
  decisions: ImageDecision[];
  /** 統計 */
  stats: {
    total: number;
    kept: number;
    generated: number;
    placeholders: number;
  };
}

// ============================================================
// Image Decision Logic
// ============================================================

/**
 * 元サイトの画像リストを評価し、各画像の最適戦略を決定する
 *
 * AI呼び出しなし — ルールベースで高速に判定
 */
export function classifyImages(
  images: Array<{ src: string; alt: string; context: string }>,
  industry: string = "general",
): MediaStrategy {
  const decisions: ImageDecision[] = [];

  for (const img of images) {
    const decision = classifySingleImage(img, industry);
    decisions.push(decision);
  }

  const stats = {
    total: decisions.length,
    kept: decisions.filter((d) => d.decision === "keep").length,
    generated: decisions.filter((d) => d.decision === "generate").length,
    placeholders: decisions.filter((d) => d.decision === "placeholder").length,
  };

  return { decisions, stats };
}

function classifySingleImage(
  img: { src: string; alt: string; context: string },
  industry: string,
): ImageDecision {
  const src = img.src.toLowerCase();
  const alt = (img.alt || "").toLowerCase();
  const context = img.context as ImageDecision["context"];

  // ── Rule 1: ロゴは常にKEEP ──
  if (context === "logo" || isLogo(src, alt)) {
    return {
      sourceUrl: img.src,
      context,
      alt: img.alt,
      decision: "keep",
      reasoning: "ブランドロゴ — 不可替のブランド資産",
    };
  }

  // ── Rule 2: 商品写真は基本KEEP ──
  if (context === "product" || isProductImage(src, alt)) {
    return {
      sourceUrl: img.src,
      context,
      alt: img.alt,
      decision: "keep",
      reasoning: "商品写真 — 固有の商品ビジュアル",
    };
  }

  // ── Rule 3: 人物・チーム写真はPLACEHOLDER ──
  if (isPersonPhoto(src, alt)) {
    return {
      sourceUrl: img.src,
      context,
      alt: img.alt,
      decision: "placeholder",
      reasoning: "人物写真 — ユーザー固有のコンテンツ",
      placeholderGuidance: "チームメンバーやお客様の写真をアップロードしてください",
    };
  }

  // ── Rule 4: 背景・装飾はGENERATE ──
  if (context === "background" || isDecorativeImage(src, alt)) {
    const hint = buildGenerationHint(alt, industry, "background");
    return {
      sourceUrl: img.src,
      context,
      alt: img.alt,
      decision: "generate",
      reasoning: "装飾/背景画像 — CSS/SVGで高品質に再現可能",
      generationTier: "css-svg",
      generationHint: hint,
    };
  }

  // ── Rule 5: ストック風のヒーロー画像はGENERATE ──
  if (context === "hero" && isStockLikeImage(src, alt)) {
    const hint = buildGenerationHint(alt, industry, "hero");
    return {
      sourceUrl: img.src,
      context,
      alt: img.alt,
      decision: "generate",
      reasoning: "汎用ヒーロー画像 — ストックフォトで高品質に置換可能",
      generationTier: "stock-photo",
      generationHint: hint,
    };
  }

  // ── Rule 6: 小さなアイコン・バッジはGENERATE (CSS/SVG) ──
  if (isIconOrBadge(src, alt)) {
    return {
      sourceUrl: img.src,
      context,
      alt: img.alt,
      decision: "generate",
      reasoning: "アイコン/バッジ — SVGで再現可能",
      generationTier: "css-svg",
      generationHint: `SVG icon: ${alt || "decorative icon"}`,
    };
  }

  // ── Rule 7: ヒーロー画像（ブランド固有の可能性）はKEEP ──
  if (context === "hero") {
    return {
      sourceUrl: img.src,
      context,
      alt: img.alt,
      decision: "keep",
      reasoning: "ヒーロー画像 — ブランドの主要ビジュアルの可能性",
    };
  }

  // ── Default: コンテンツ画像はKEEP（安全側に倒す） ──
  return {
    sourceUrl: img.src,
    context,
    alt: img.alt,
    decision: "keep",
    reasoning: "コンテンツ画像 — 安全のため元画像を保持",
  };
}

// ============================================================
// Detection Helpers
// ============================================================

function isLogo(src: string, alt: string): boolean {
  const patterns = ["logo", "brand", "ブランド", "ロゴ"];
  return patterns.some((p) => src.includes(p) || alt.includes(p));
}

function isProductImage(src: string, alt: string): boolean {
  const patterns = [
    "product",
    "item",
    "goods",
    "商品",
    "製品",
    "アイテム",
    "/products/",
    "cdn.shopify.com/s/files",
  ];
  return patterns.some((p) => src.includes(p) || alt.includes(p));
}

function isPersonPhoto(src: string, alt: string): boolean {
  const patterns = [
    "staff",
    "team",
    "member",
    "portrait",
    "スタッフ",
    "チーム",
    "メンバー",
    "代表",
    "社長",
    "プロフィール",
  ];
  return patterns.some((p) => src.includes(p) || alt.includes(p));
}

function isDecorativeImage(src: string, alt: string): boolean {
  // 空altは装飾画像の可能性大
  if (!alt || alt.length <= 1) return true;
  const patterns = [
    "bg",
    "background",
    "pattern",
    "texture",
    "decoration",
    "ornament",
    "divider",
    "separator",
    "border",
    "spacer",
  ];
  return patterns.some((p) => src.includes(p) || alt.includes(p));
}

function isStockLikeImage(src: string, alt: string): boolean {
  const stockDomains = [
    "unsplash",
    "pexels",
    "pixabay",
    "shutterstock",
    "istock",
    "gettyimages",
    "stock",
    "fotolia",
  ];
  const stockPatterns = ["lifestyle", "concept", "abstract", "modern"];
  return (
    stockDomains.some((d) => src.includes(d)) ||
    stockPatterns.some((p) => alt.includes(p))
  );
}

function isIconOrBadge(src: string, alt: string): boolean {
  const patterns = [
    "icon",
    "badge",
    "seal",
    "stamp",
    "star",
    "rating",
    "check",
    "arrow",
    "chevron",
    ".svg",
  ];
  // Small images often in paths like /icons/ or /badges/
  return patterns.some((p) => src.includes(p) || alt.includes(p));
}

// ============================================================
// Tier 1: CSS/SVG Generation
// ============================================================

/**
 * CSSグラデーション or SVGパターンを生成
 * コスト: ¥0
 */
export function generateCssSvgAsset(
  hint: string,
  colors: { primary: string; secondary: string; accent: string },
): string {
  const type = hint.toLowerCase();

  // ヒーロー背景: グラデーション
  if (type.includes("hero") || type.includes("background")) {
    return `background: linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}10 50%, ${colors.accent}08 100%);`;
  }

  // パターン背景
  if (type.includes("pattern") || type.includes("texture")) {
    return `background-image: radial-gradient(circle at 25px 25px, ${colors.primary}08 2%, transparent 0%), radial-gradient(circle at 75px 75px, ${colors.secondary}06 2%, transparent 0%); background-size: 100px 100px;`;
  }

  // セクション区切り
  if (type.includes("divider") || type.includes("separator")) {
    return `<svg width="100%" height="60" viewBox="0 0 1200 60" xmlns="http://www.w3.org/2000/svg"><path d="M0,30 Q300,0 600,30 T1200,30" fill="none" stroke="${colors.primary}" stroke-width="2" opacity="0.2"/></svg>`;
  }

  // デフォルト: 柔らかいグラデーション
  return `background: linear-gradient(180deg, ${colors.primary}05 0%, ${colors.secondary}08 100%);`;
}

/**
 * プレースホルダーSVGを生成（寸法付き）
 */
export function generatePlaceholderSvg(
  width: number,
  height: number,
  label: string,
  colors: { primary: string; background: string },
): string {
  const escapedLabel = label.replace(/[<>&"']/g, "");
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
      `<rect width="100%" height="100%" fill="${colors.background}"/>` +
      `<rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="none" stroke="${colors.primary}" stroke-width="2" stroke-dasharray="8 4" rx="8"/>` +
      `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="14" fill="${colors.primary}">${escapedLabel}</text>` +
      `</svg>`,
  )}`;
}

// ============================================================
// Tier 2: Stock Photo Keywords
// ============================================================

/**
 * Unsplash/Pexels検索キーワードを生成
 * コスト: ¥0 (API attribution required)
 */
export function buildStockPhotoQuery(
  hint: string,
  industry: string,
): string {
  const industryKeywords: Record<string, string[]> = {
    beauty: ["skincare", "cosmetics", "beauty", "wellness"],
    food: ["food", "restaurant", "cooking", "gourmet"],
    fashion: ["fashion", "clothing", "style", "outfit"],
    lifestyle: ["lifestyle", "interior", "home", "minimal"],
    tech: ["technology", "device", "digital", "modern"],
    health: ["fitness", "health", "wellness", "yoga"],
    general: ["business", "professional", "modern"],
  };

  const keywords = industryKeywords[industry] || industryKeywords.general;
  const baseQuery = hint || keywords[0];

  // 業種のキーワードを追加
  return `${baseQuery} ${keywords.slice(0, 2).join(" ")}`.trim();
}

/**
 * Unsplash Source URL を構築
 * 注: Unsplash Source API は Attribution が必要
 */
export function buildUnsplashUrl(
  query: string,
  width: number = 1200,
  height: number = 800,
): string {
  const encodedQuery = encodeURIComponent(query);
  return `https://images.unsplash.com/photo-random?w=${width}&h=${height}&q=80&fit=crop&auto=format&${encodedQuery}`;
}

// ============================================================
// Pipeline Integration
// ============================================================

/**
 * Design Director のプロンプトに画像戦略セクションを追加
 */
export function buildImageStrategyPrompt(
  images: Array<{ src: string; alt: string; context: string }>,
  strategy: MediaStrategy,
): string {
  if (strategy.decisions.length === 0) return "";

  const lines: string[] = [
    "\n## 画像戦略（メディア資産の最適化）",
    "",
    `元サイトから ${strategy.stats.total}枚の画像を検出:`,
    `  - 保持 (KEEP): ${strategy.stats.kept}枚 — ブランド固有の資産`,
    `  - 生成 (GENERATE): ${strategy.stats.generated}枚 — より良い代替が可能`,
    `  - 要提供 (PLACEHOLDER): ${strategy.stats.placeholders}枚 — ユーザーが後で提供`,
    "",
  ];

  // KEEP images: セクション設計時にこれらの画像を使用
  const keepImages = strategy.decisions.filter((d) => d.decision === "keep");
  if (keepImages.length > 0) {
    lines.push("### 保持する画像（セクション設計に組み込んでください）:");
    keepImages.slice(0, 8).forEach((d) => {
      lines.push(`  - [${d.context}] ${d.alt || "画像"}: ${d.sourceUrl}`);
    });
    lines.push("");
  }

  // GENERATE images: CSSやデザインパターンで代替
  const genImages = strategy.decisions.filter((d) => d.decision === "generate");
  if (genImages.length > 0) {
    lines.push(
      "### 生成で代替する画像（placehold.coの代わりにCSSグラデーションやパターンを使用）:",
    );
    genImages.slice(0, 6).forEach((d) => {
      lines.push(
        `  - [${d.context}] ${d.reasoning} → ${d.generationTier === "css-svg" ? "CSS/SVGで生成" : "ストックフォトで代替"}`,
      );
    });
    lines.push("");
  }

  // PLACEHOLDER images: セクション設計にプレースホルダー枠を含める
  const phImages = strategy.decisions.filter(
    (d) => d.decision === "placeholder",
  );
  if (phImages.length > 0) {
    lines.push(
      "### プレースホルダー（ユーザーが後で提供する枠を設計に含めてください）:",
    );
    phImages.slice(0, 4).forEach((d) => {
      lines.push(
        `  - [${d.context}] ${d.placeholderGuidance || "画像をアップロードしてください"}`,
      );
    });
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Section Artisan のプロンプトに追加する画像指示
 */
export function buildSectionImageInstructions(
  sectionCategory: string,
  decisions: ImageDecision[],
): string {
  // このセクションに関連する画像を選択
  const relevant = decisions.filter((d) => {
    if (sectionCategory.includes("hero") && d.context === "hero") return true;
    if (sectionCategory.includes("product") && d.context === "product")
      return true;
    if (sectionCategory.includes("logo") && d.context === "logo") return true;
    return false;
  });

  if (relevant.length === 0) return "";

  const lines = ["\n### この セクションの画像指示:"];
  for (const d of relevant) {
    switch (d.decision) {
      case "keep":
        lines.push(
          `- 元画像を使用: <img src="${d.sourceUrl}" alt="${d.alt}">`,
        );
        break;
      case "generate":
        if (d.generationTier === "css-svg") {
          lines.push(
            `- CSSグラデーション/SVGで装飾的な背景を生成（placehold.coの代わりに）`,
          );
        } else {
          lines.push(
            `- ストックフォトキーワード: "${d.generationHint}" で適切な画像を使用`,
          );
        }
        break;
      case "placeholder":
        lines.push(
          `- プレースホルダー枠を配置: ${d.placeholderGuidance || "ユーザーが画像を提供"}`,
        );
        break;
    }
  }
  return lines.join("\n");
}

// ============================================================
// Post-Processing (Stage 3)
// ============================================================

/**
 * 組み立て後のHTMLに対して、placehold.co URLを最適なアセットに置換する
 *
 * - KEEP画像は元URLに戻す
 * - GENERATE画像はCSS/SVG/Unsplashに置換
 * - PLACEHOLDER画像はガイダンス付きプレースホルダーに置換
 */
export function applyMediaStrategy(
  html: string,
  strategy: MediaStrategy,
  colors: { primary: string; secondary: string; accent: string; background: string },
): string {
  let result = html;

  // placehold.co URLを検出してコンテキストに応じて置換
  const placeholdRegex =
    /https?:\/\/placehold\.co\/(\d+)x(\d+)\/([a-fA-F0-9]+)\/([a-fA-F0-9]+)/g;
  let matchIndex = 0;

  result = result.replace(placeholdRegex, (match, w, h) => {
    const width = parseInt(w);
    const height = parseInt(h);

    // 対応するGENERATEまたはPLACEHOLDER決定を検索
    const genDecisions = strategy.decisions.filter(
      (d) => d.decision === "generate",
    );
    const phDecisions = strategy.decisions.filter(
      (d) => d.decision === "placeholder",
    );

    // ヒーロー的なサイズ（800px以上）
    if (width >= 800) {
      if (genDecisions.length > matchIndex) {
        const d = genDecisions[matchIndex];
        matchIndex++;
        if (d.generationTier === "stock-photo" && d.generationHint) {
          // Unsplash URL を返す
          return buildUnsplashUrl(d.generationHint, width, height);
        }
      }
      // CSS/SVGはHTMLのsrc属性に入れにくいのでプレースホルダーSVG
      return generatePlaceholderSvg(width, height, "ヒーロー画像", {
        primary: colors.primary,
        background: colors.background,
      });
    }

    // 中サイズ（アイコン・バッジ）
    if (width <= 100 && height <= 100) {
      return generatePlaceholderSvg(width, height, "●", {
        primary: colors.primary,
        background: colors.background,
      });
    }

    // その他のプレースホルダー
    if (phDecisions.length > 0) {
      const guidance =
        phDecisions[0].placeholderGuidance || "画像をアップロード";
      return generatePlaceholderSvg(width, height, guidance, {
        primary: colors.primary,
        background: colors.background,
      });
    }

    return match; // 変更なし
  });

  return result;
}

// ============================================================
// Utility
// ============================================================

function buildGenerationHint(
  alt: string,
  industry: string,
  context: string,
): string {
  if (alt && alt.length > 3) return alt;

  const contextHints: Record<string, string> = {
    hero: "professional modern workspace",
    background: "abstract minimal pattern",
    content: "lifestyle product scene",
  };

  return `${contextHints[context] || "modern"} ${industry}`;
}
