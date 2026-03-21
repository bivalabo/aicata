# Aicata AI デザインエンジン — アーキテクチャ設計書

## エグゼクティブサマリー

Aicataの競争優位性は「ECサイトのデザインを書くことに、ものすごく強力なAIモデル」を持つことにある。この設計書では、現在の単一システムプロンプト方式から、**知識駆動型のダイナミック・デザインエンジン**へと進化させるアーキテクチャを提案する。

核心的なアプローチ: **Claude自体を再トレーニングするのではなく、Claudeに渡す「デザイン知識」を極限まで洗練・構造化し、文脈に応じて最適な知識を注入する仕組みを構築する。**

---

## 1. 現状の課題

現在のAicataは、`anthropic.ts` に定義された**固定のシステムプロンプト**（約4KB）のみでページを生成している。

| 課題 | 詳細 |
|------|------|
| デザイン知識が汎用的 | 「モダンなデザイン」「十分な余白」等の抽象的な指示のみ |
| 業界特化なし | コスメ、食品、アパレル等で最適なデザインパターンが異なる |
| トレンド追従なし | scroll-driven animations、container queries 等の最新CSSが未活用 |
| デザインの一貫性が低い | 毎回ゼロから生成するため品質のバラツキが大きい |
| 参考デザインが渡せない | 「このサイトのような」を具体的なコードとして注入できない |

---

## 2. アーキテクチャ概要

```
┌──────────────────────────────────────────────────────┐
│                  ユーザーリクエスト                      │
│   「コスメブランドのトップページを作って」               │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│            コンテキストアナライザー                      │
│  - 業界判定（コスメ → beauty）                         │
│  - ページ種別判定（トップページ → landing）             │
│  - トーン判定（高級感、ナチュラル等）                    │
│  - 必要なCSS技法の選定                                  │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│            ダイナミックプロンプトコンポーザー             │
│                                                        │
│  ┌─────────┐ ┌──────────┐ ┌────────────┐             │
│  │ベースSP  │ │業界テンプ │ │CSSパターン │             │
│  │(不変)    │ │レート     │ │ライブラリ  │             │
│  └────┬────┘ └─────┬────┘ └─────┬──────┘             │
│       │            │            │                      │
│       ▼            ▼            ▼                      │
│  ┌──────────────────────────────────────┐             │
│  │        組み立てられたプロンプト         │             │
│  │  base + industry + css_patterns      │             │
│  │  + reference_examples + constraints  │             │
│  └──────────────────────────────────────┘             │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│                    Claude API                          │
│            （強化されたコンテキストで呼出し）             │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│              デザイン品質スコアラー                      │
│  - レスポンシブ対応チェック                              │
│  - CSSベストプラクティス適合度                           │
│  - アクセシビリティスコア                                │
│  - パフォーマンス推定                                    │
└──────────────────────────────────────────────────────┘
```

---

## 3. コアコンポーネント詳細

### 3.1 デザインナレッジベース（Design Knowledge Base）

最も重要なコンポーネント。AicataのAIが「デザインに強い」理由の根幹。

#### ディレクトリ構造

```
web/src/lib/design-engine/
├── index.ts                    # エンジンのエントリポイント
├── context-analyzer.ts         # リクエスト分析
├── prompt-composer.ts          # ダイナミックプロンプト組み立て
├── quality-scorer.ts           # 生成デザインの品質評価
│
├── knowledge/                  # デザイン知識ベース
│   ├── base-prompt.ts          # 不変のベースシステムプロンプト
│   │
│   ├── industries/             # 業界別デザインパターン
│   │   ├── beauty.ts           # コスメ・美容
│   │   ├── food.ts             # 食品・飲料
│   │   ├── fashion.ts          # ファッション・アパレル
│   │   ├── lifestyle.ts        # ライフスタイル・雑貨
│   │   ├── tech.ts             # テクノロジー・ガジェット
│   │   └── health.ts           # 健康・サプリメント
│   │
│   ├── page-types/             # ページ種別テンプレート
│   │   ├── landing.ts          # ランディングページ
│   │   ├── product.ts          # 商品詳細ページ
│   │   ├── collection.ts       # コレクション/カテゴリページ
│   │   ├── about.ts            # About / ブランドストーリー
│   │   ├── contact.ts          # お問い合わせ
│   │   └── blog.ts             # ブログ記事
│   │
│   ├── css-patterns/           # 最新CSSテクニック集
│   │   ├── scroll-animations.ts    # scroll-driven animations
│   │   ├── view-transitions.ts     # view transitions
│   │   ├── container-queries.ts    # container queries
│   │   ├── modern-layout.ts        # CSS Grid / Subgrid
│   │   ├── motion.ts               # マイクロインタラクション
│   │   ├── glassmorphism.ts        # Glass効果
│   │   └── typography.ts           # 日本語タイポグラフィ
│   │
│   ├── components/             # 再利用可能UIコンポーネント
│   │   ├── hero-sections.ts    # ヒーローセクション集
│   │   ├── navigation.ts       # ナビゲーションパターン
│   │   ├── product-cards.ts    # 商品カードバリエーション
│   │   ├── cta-sections.ts     # CTAセクション
│   │   ├── testimonials.ts     # テスティモニアル
│   │   ├── footer-patterns.ts  # フッターパターン
│   │   └── pricing-tables.ts   # 料金表
│   │
│   └── references/             # 参考デザイン（HTMLスニペット）
│       ├── award-winning.ts    # 受賞デザインの要素分析
│       └── japanese-ec.ts      # 日本のEC優良デザイン分析
│
└── types.ts                    # 型定義
```

#### 業界別ナレッジの例（beauty.ts）

```typescript
export const beautyIndustryKnowledge: IndustryKnowledge = {
  id: "beauty",
  name: "コスメ・美容",

  // このパターンがプロンプトに注入される
  designPrinciples: `
## コスメ・美容ブランドのデザイン原則

### カラーパレット戦略
- ベースは柔らかいニュートラル（#F5F0EB, #E8E0D4, #FFF8F0）
- アクセントはブランドの世界観に合わせる
  - ナチュラル系: アースカラー（#6B5B4B, #8B7355, #4A6741）
  - 高級系: ゴールド＋深色（#C9A96E, #2C2C2C, #1A1A2E）
  - フレッシュ系: パステル（#FFB5BA, #B5D5FF, #C5E8B0）

### タイポグラフィ
- ヘッドライン: Noto Serif JP または Shippori Mincho（優雅さ）
- 本文: Noto Sans JP weight 300-400（読みやすさ）
- 英字: 'Cormorant Garamond' または 'Playfair Display'（高級感）
- letter-spacing: 0.1em〜0.2em で余裕のある字間

### レイアウト特性
- 余白を大胆に（セクション間 120px〜160px）
- 画像は大きく使う（幅100%のフルブリード画像）
- テキストと画像の重なり・オーバーラップで奥行きを出す
- 左右非対称レイアウトで動きを出す

### 必須セクション
1. ビジュアルヒーロー（商品の世界観を伝えるイメージ）
2. ブランドストーリー / フィロソフィー
3. 成分・素材の訴求（アイコン付き）
4. ビフォーアフター or 使用ステップ
5. テスティモニアル / レビュー
6. インスタグラムフィード風セクション
`,

  // CSS技法の推奨
  recommendedCssPatterns: [
    "scroll-animations",   // パララックス的な商品登場
    "glassmorphism",       // 高級感のあるカード
    "motion",              // フェードイン、スライド
    "typography",          // 日本語Webフォント
  ],

  // 参考コードスニペット
  exampleSnippets: [
    {
      name: "高級感のあるヒーローセクション",
      html: `<section class="hero">...</section>`,
      css: `.hero { ... }`,
      description: "フルスクリーンイメージ + オーバーレイテキスト",
    },
  ],
};
```

### 3.2 コンテキストアナライザー（Context Analyzer）

ユーザーのリクエストから、最適なデザイン知識を選ぶための分析エンジン。

```typescript
// context-analyzer.ts
export interface DesignContext {
  industry: IndustryType;        // beauty, food, fashion...
  pageType: PageType;            // landing, product, about...
  tone: DesignTone[];            // luxury, natural, modern, playful...
  cssFeatures: CssFeature[];     // scroll-animations, grid...
  referenceUrl?: string;         // ユーザーが提供した参考URL
  brandInfo?: BrandInfo;         // ブランド名、色、フォント等
  conversationHistory: string[]; // 過去の修正履歴（好みの学習）
}

export async function analyzeContext(
  userMessage: string,
  conversationHistory: Message[],
  storeInfo?: StoreInfo,
): Promise<DesignContext> {
  // 1. キーワード分析で業界・ページ種別を判定
  // 2. トーン分析（「高級」「ナチュラル」「ポップ」等）
  // 3. 過去の会話から好みを抽出
  // 4. ストア情報があれば業界を推定
  // ...
}
```

**判定ロジック（Phase 1: ルールベース）:**

```typescript
const INDUSTRY_KEYWORDS: Record<IndustryType, string[]> = {
  beauty: ["コスメ", "化粧品", "スキンケア", "美容", "メイク", "ヘアケア"],
  food: ["食品", "お菓子", "ドリンク", "カフェ", "レストラン", "料理", "グルメ"],
  fashion: ["ファッション", "アパレル", "服", "靴", "ジュエリー", "アクセサリー"],
  lifestyle: ["雑貨", "インテリア", "家具", "キッチン", "生活"],
  tech: ["ガジェット", "テック", "デバイス", "電子"],
  health: ["サプリ", "健康", "フィットネス", "ヨガ", "オーガニック"],
};
```

**判定ロジック（Phase 2: Claude軽量分析）:**
将来的にはClaude Haikuで高速にコンテキスト分析し、より正確な判定を行う。

### 3.3 ダイナミックプロンプトコンポーザー（Prompt Composer）

分析結果に基づき、最適なシステムプロンプトを組み立てる。

```typescript
// prompt-composer.ts
export function composeDesignPrompt(context: DesignContext): string {
  const sections: string[] = [];

  // 1. ベースプロンプト（不変 — 現在の SYSTEM_PROMPT の役割定義部分）
  sections.push(BASE_PROMPT);

  // 2. 業界別デザイン知識
  const industry = getIndustryKnowledge(context.industry);
  sections.push(industry.designPrinciples);

  // 3. ページ種別テンプレート構造
  const pageType = getPageTypeTemplate(context.pageType);
  sections.push(pageType.structureGuide);

  // 4. CSSパターンライブラリ（選択されたもののみ注入）
  for (const feature of context.cssFeatures) {
    const pattern = getCssPattern(feature);
    sections.push(pattern.codeExamples);
  }

  // 5. 参考コンポーネント（最大3つ — トークン制御）
  const components = selectRelevantComponents(context);
  for (const comp of components.slice(0, 3)) {
    sections.push(formatComponentExample(comp));
  }

  // 6. 出力フォーマット指示（不変）
  sections.push(OUTPUT_FORMAT_INSTRUCTIONS);

  return sections.join("\n\n---\n\n");
}
```

**トークン予算管理:**

| セクション | 最大トークン数 | 備考 |
|-----------|-------------|------|
| ベースプロンプト | ~800 | 固定 |
| 業界知識 | ~1,200 | 業界ごとに1つ |
| ページ種別 | ~600 | 種別ごとに1つ |
| CSSパターン | ~1,500 | 最大3パターン |
| コンポーネント例 | ~2,000 | 最大3つ、コード付き |
| 出力フォーマット | ~400 | 固定 |
| **合計** | **~6,500** | コンテキストウィンドウの約5% |

### 3.4 CSSパターンライブラリ

Aicataの差別化の核。最新のCSS技法を**実コード付き**で管理する。

#### scroll-animations.ts の例

```typescript
export const scrollAnimationsPattern: CssPattern = {
  id: "scroll-animations",
  name: "スクロール駆動アニメーション",
  browserSupport: "85%+ (2026)",

  // プロンプトに注入される説明＋コード
  promptContent: `
## スクロールアニメーション（CSS scroll-driven animations）

最新のCSS機能。JavaScriptなしで高パフォーマンスなスクロール連動アニメーションを実現。

### フェードイン＋スライドアップ（推奨パターン）
\`\`\`css
@keyframes fade-slide-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-on-scroll {
  animation: fade-slide-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 40%;
}
\`\`\`

### パララックス背景
\`\`\`css
.parallax-section {
  background-attachment: fixed;  /* フォールバック */
  animation: parallax-shift linear both;
  animation-timeline: scroll();
}

@keyframes parallax-shift {
  from { background-position: center 0%; }
  to { background-position: center 100%; }
}
\`\`\`

### プログレスバー（スクロール進捗表示）
\`\`\`css
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--accent);
  transform-origin: left;
  animation: progress-grow linear;
  animation-timeline: scroll();
}

@keyframes progress-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
\`\`\`

**使用ルール:**
- animation-timeline: view() はビューポートに入る要素の登場に使う
- animation-timeline: scroll() はページ全体のスクロール進捗に使う
- animation-range で発火タイミングを制御する
- フォールバック: @supports not (animation-timeline: view()) でopacity:1を保証
`,
};
```

#### motion.ts の例

```typescript
export const motionPattern: CssPattern = {
  id: "motion",
  name: "マイクロインタラクション＆モーション",

  promptContent: `
## マイクロインタラクション・デザイン

### ホバーエフェクト（商品カード）
\`\`\`css
.product-card {
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              box-shadow 0.4s ease;
}
.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}
.product-card img {
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.product-card:hover img {
  transform: scale(1.05);
}
\`\`\`

### ボタンの押下感
\`\`\`css
.cta-button {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}
.cta-button::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}
.cta-button:hover::after {
  transform: translateX(100%);
}
.cta-button:active {
  transform: scale(0.97);
}
\`\`\`

### テキスト登場アニメーション
\`\`\`css
.reveal-text {
  clip-path: inset(0 100% 0 0);
  animation: reveal 0.8s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}
@keyframes reveal {
  to { clip-path: inset(0 0 0 0); }
}
\`\`\`

### スムーズスクロール
\`\`\`css
html {
  scroll-behavior: smooth;
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
\`\`\`

**デザイン原則:**
- cubic-bezier(0.25, 0.46, 0.45, 0.94) を基本イージングにする
- 遷移時間は 0.3s〜0.6s（速すぎず遅すぎず）
- prefers-reduced-motion を必ず尊重する
- hover は pointer デバイスのみ: @media (hover: hover) { } で囲む
`,
};
```

### 3.5 デザイン品質スコアラー（Quality Scorer）

生成されたHTML/CSSの品質を自動評価する。

```typescript
// quality-scorer.ts
export interface DesignScore {
  overall: number;          // 0-100
  responsive: number;       // レスポンシブ対応度
  cssQuality: number;       // CSSベストプラクティス
  accessibility: number;    // アクセシビリティ
  performance: number;      // パフォーマンス推定
  issues: DesignIssue[];    // 問題点リスト
}

export function scoreDesign(html: string, css: string): DesignScore {
  const issues: DesignIssue[] = [];

  // 1. レスポンシブチェック
  const hasMediaQueries = css.includes("@media");
  const hasMobileFirst = /min-width:\s*(768|1024)px/.test(css);

  // 2. CSSベストプラクティス
  const hasInlineStyles = /style="/.test(html);
  const hasImportant = /!important/.test(css);
  const hasCssReset = /box-sizing:\s*border-box/.test(css);

  // 3. アクセシビリティ
  const hasAltTags = /<img[^>]+alt=/.test(html);
  const hasSemanticHtml = /<(header|main|footer|section|nav|article)/.test(html);
  const hasAriaLabels = /aria-label/.test(html);

  // 4. パフォーマンス
  const cssSize = new TextEncoder().encode(css).length;
  const htmlSize = new TextEncoder().encode(html).length;

  // スコア計算...
  return { overall, responsive, cssQuality, accessibility, performance, issues };
}
```

---

## 4. 実装ロードマップ

### Phase 1: ナレッジベース構築（2週間）

**目標:** デザイン知識を構造化し、プロンプトに注入できる形にする

1. **ディレクトリ構造の作成** — `web/src/lib/design-engine/`
2. **業界別ナレッジ作成** — まず beauty, food, fashion の3業界
3. **CSSパターン作成** — scroll-animations, motion, typography, modern-layout
4. **コンテキストアナライザー（v1: ルールベース）** — キーワードマッチで業界・ページ種別判定
5. **プロンプトコンポーザー** — 知識を組み立ててClaudeに渡す
6. **既存 anthropic.ts を拡張** — composeDesignPrompt() を呼び出す形に変更

**成果物:**
- AIが業界に合わせたデザインを生成できるようになる
- CSSアニメーションが自然に含まれるようになる
- 品質のバラツキが大幅に減る

### Phase 2: コンポーネントライブラリ（2週間）

**目標:** 高品質な参考コードをAIに渡せるようにする

1. **ヒーローセクション** — 5パターン（フルスクリーン、スプリット、動画背景、パララックス、ミニマル）
2. **商品カード** — 4パターン（ホバー拡大、オーバーレイ、フリップ、スライド）
3. **ナビゲーション** — 3パターン（固定ヘッダー、ハンバーガー、サイドドロワー）
4. **CTA セクション** — 3パターン（グラデーション背景、画像付き、フローティング）
5. **フッター** — 3パターン（マルチカラム、ミニマル、メガフッター）

**成果物:**
- 各コンポーネントが「そのまま使える」品質のHTML+CSS
- AIはこれらを参考に、カスタマイズしたコードを生成する

### Phase 3: 品質保証＆フィードバック（2週間）

**目標:** 生成デザインの品質を自動評価し、改善サイクルを回す

1. **品質スコアラーの実装** — レスポンシブ、CSS品質、アクセシビリティ
2. **プレビュー画面にスコア表示** — LivePreview コンポーネントに統合
3. **自動修正提案** — スコアが低い場合、AIに再生成を促す
4. **ユーザーフィードバック収集** — 「いいね」「修正」の履歴から好みを学習

### Phase 4: 参考デザイン分析パイプライン（3週間）

**目標:** 優れたECサイトのデザインを解析し、知識ベースに取り込む

1. **デザイン解析ツール** — URLからHTML/CSSを取得し、パターンを抽出
2. **パターン分類** — レイアウト、配色、タイポグラフィ、アニメーションに分解
3. **ナレッジベース更新** — 抽出したパターンを knowledge/ に追加
4. **トレンドトラッカー** — Awwwards / CSS Design Awards のEC部門を定期チェック

### Phase 5: ストアコンテキスト連携（2週間）

**目標:** 接続済みShopifyストアの情報を活かしたパーソナライズ

1. **ストア分析** — 既存テーマの色、フォント、レイアウトを抽出
2. **商品データ活用** — 実際の商品画像・説明文をデザインに反映
3. **ブランドガイドライン自動抽出** — ストアから配色・フォント・トーンを学習
4. **一貫性チェック** — 生成ページがストアの世界観と合致しているか検証

---

## 5. 技術的な実装方針

### 5.1 プロンプトエンジニアリングの戦略

Aicataのアプローチは **Fine-tuning ではなく、Prompt Engineering の極致** を目指す。

理由:
- Claude のベースモデルはすでにHTML/CSS生成に非常に優れている
- 問題は「何を作るか」の指示の精度であり、モデルの能力ではない
- プロンプトの改善はデプロイが即座で、A/Bテストが容易
- Fine-tuning はコストが高く、モデル更新のたびに再学習が必要

**Few-shot Example 戦略:**

```typescript
// プロンプトに「お手本」として実コードを1つ含める
const fewShotExample = `
以下は、コスメブランドのトップページとして高い評価を受けたデザインの一部です。
このスタイルを参考に、ユーザーのブランドに合わせてカスタマイズしてください。

<reference>
<section class="hero">
  <div class="hero-content">
    <span class="hero-label">Natural Beauty</span>
    <h1 class="hero-title">肌本来の<br>美しさを引き出す</h1>
    <p class="hero-description">...</p>
  </div>
  <div class="hero-image">
    <img src="..." alt="..." />
  </div>
</section>

<style>
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 90vh;
  overflow: hidden;
}
.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px;
}
.hero-label {
  font-family: 'Cormorant Garamond', serif;
  font-size: 14px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #8B7355;
  margin-bottom: 24px;
}
.hero-title {
  font-family: 'Shippori Mincho', serif;
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1.3;
  letter-spacing: 0.05em;
  color: #2C2C2C;
}
.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: fade-slide-up 1s ease-out;
}
/* ... */
</style>
</reference>
`;
```

### 5.2 トークン効率の最適化

Claudeのコンテキストウィンドウを効率的に使う戦略:

1. **関連知識のみ注入**: 全業界の知識を渡すのではなく、分析結果に基づいて選択
2. **コード例は最小限**: 完全なページではなく、セクション単位のスニペット
3. **キャッシュ活用**: Anthropicの prompt caching を使い、ベースプロンプト部分のコストを削減
4. **段階的詳細化**: 初回は構造のみ、修正時に該当セクションの詳細知識を注入

```typescript
// Prompt Caching の活用
const response = await anthropic.messages.create({
  model: DEFAULT_MODEL,
  max_tokens: DEFAULT_MAX_TOKENS,
  system: [
    {
      type: "text",
      text: basePrompt,          // ここはキャッシュされる
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: dynamicKnowledge,    // リクエストごとに変わる
    },
  ],
  messages: conversationMessages,
});
```

### 5.3 DBスキーマ拡張

```prisma
// 既存の Page モデルに追加
model Page {
  // ... 既存フィールド ...

  // デザインメタデータ
  industry      String?       // 業界タイプ
  pageType      String?       // ページ種別
  designTone    String?       // デザイントーン（JSON配列）
  designScore   Int?          // 品質スコア (0-100)
  cssFeatures   String?       // 使用CSS技法（JSON配列）
}

// 新規: デザインテンプレート
model DesignTemplate {
  id            String   @id @default(uuid())
  name          String
  industry      String
  pageType      String
  thumbnail     String?  // サムネイル画像URL
  html          String
  css           String
  tags          String   // JSON配列
  usageCount    Int      @default(0)
  rating        Float    @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## 6. 差別化ポイント

### 他のAIページビルダーとの比較

| 観点 | 一般的なAIビルダー | Aicata |
|------|------------------|--------|
| デザイン知識 | 汎用的な指示 | 業界別×ページ種別の構造化知識 |
| CSS技法 | 基本的なCSS | scroll-driven animations, container queries等 最新技法 |
| 品質管理 | なし | 自動スコアリング＋改善提案 |
| 日本市場対応 | 英語圏向け | 日本語タイポグラフィ、日本のEC習慣に最適化 |
| モーション | 静的デザイン | マイクロインタラクション標準装備 |
| パーソナライズ | テンプレート選択 | ストア情報＋会話履歴から自動適応 |

### Aicataだけの強み

1. **「日本のECに一番強いAIデザイナー」**: 日本語タイポグラフィ、日本のEC消費者心理を理解
2. **常に最先端**: CSSパターンライブラリが定期的に更新され、最新技法が即座に反映
3. **業界の文脈を理解**: 「コスメブランド」と言えば、ふさわしいカラーパレット・レイアウト・モーションを自動選択
4. **修正のたびに賢くなる**: ユーザーのフィードバックが知識ベースの改善に還元

---

## 7. 最初の一歩（Next Action）

### すぐに実装を始められること

1. `web/src/lib/design-engine/` ディレクトリを作成
2. `knowledge/industries/beauty.ts` を作成（最も需要が高い業界から）
3. `knowledge/css-patterns/motion.ts` を作成（即効果が出る）
4. `context-analyzer.ts` をルールベースで実装
5. `prompt-composer.ts` で組み立てロジックを実装
6. `anthropic.ts` の `SYSTEM_PROMPT` を動的生成に切り替え

これにより、**明日から「コスメブランドのページを作って」というリクエストに対して、格段に高品質なデザインが生成される**ようになる。
