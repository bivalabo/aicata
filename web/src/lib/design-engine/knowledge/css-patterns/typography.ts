import type { CssPattern } from "../../types";

export const typographyPattern: CssPattern = {
  id: "typography",
  name: "日本語タイポグラフィ",
  browserSupport: "99%+",

  promptContent: `
## 日本語ウェブタイポグラフィ

日本語サイトで美しいタイポグラフィを実現するための実践パターン。

### Google Fonts 読み込み（推奨フォント）
\`\`\`html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Serif+JP:wght@400;500;700&family=Shippori+Mincho:wght@400;500;600&display=swap" rel="stylesheet">
\`\`\`
英字アクセント用:
\`\`\`html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@300;400;500;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
\`\`\`

### タイポグラフィスケール
\`\`\`css
:root {
  /* フォントファミリー */
  --font-sans: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
  --font-serif: 'Shippori Mincho', 'Noto Serif JP', 'Yu Mincho', serif;
  --font-accent: 'Cormorant Garamond', 'Playfair Display', serif;

  /* サイズスケール（clamp でレスポンシブ） */
  --text-xs: clamp(0.7rem, 0.8vw, 0.75rem);
  --text-sm: clamp(0.8rem, 0.9vw, 0.875rem);
  --text-base: clamp(0.9rem, 1vw, 1rem);
  --text-lg: clamp(1.1rem, 1.3vw, 1.25rem);
  --text-xl: clamp(1.3rem, 1.8vw, 1.5rem);
  --text-2xl: clamp(1.6rem, 2.5vw, 2rem);
  --text-3xl: clamp(2rem, 3.5vw, 2.5rem);
  --text-4xl: clamp(2.5rem, 5vw, 3.5rem);
  --text-5xl: clamp(3rem, 7vw, 5rem);
}
\`\`\`

### 見出しスタイル
\`\`\`css
/* エレガントな見出し（美容、高級品向け） */
.heading-elegant {
  font-family: var(--font-serif);
  font-weight: 400;
  letter-spacing: 0.1em;
  line-height: 1.4;
}

/* モダンな見出し（テック、ファッション向け） */
.heading-modern {
  font-family: var(--font-sans);
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.2;
}

/* 英字アクセントラベル（セクション上部に） */
.section-label {
  font-family: var(--font-accent);
  font-size: var(--text-xs);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  opacity: 0.7;
}
\`\`\`

### 本文の最適化
\`\`\`css
body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.8;  /* 日本語は 1.8〜2.0 が読みやすい */
  letter-spacing: 0.04em;
  color: #333;
  font-feature-settings: "palt";  /* プロポーショナル詰め */
  -webkit-font-smoothing: antialiased;
}
\`\`\`

### テキスト装飾パターン
\`\`\`css
/* アンダーライン装飾（セクションタイトル） */
.title-underline::after {
  content: '';
  display: block;
  width: 40px;
  height: 1px;
  background: currentColor;
  margin-top: 16px;
  opacity: 0.4;
}
.title-underline.center::after {
  margin-inline: auto;
}

/* 縦書きアクセント */
.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 0.2em;
}
\`\`\`

**日本語タイポグラフィの原則:**
- 行間（line-height）は 1.8〜2.0（英語の 1.5 より広め）
- 字間（letter-spacing）は 0.04em〜0.1em
- font-feature-settings: "palt" で約物の字間を最適化
- 長文は max-width: 40em 程度で折り返し（読みやすさ）
- 明朝体は見出し・アクセントに、ゴシック体は本文に
`,
};
