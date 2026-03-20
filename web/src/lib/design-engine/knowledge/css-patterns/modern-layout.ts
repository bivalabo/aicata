import type { CssPattern } from "../../types";

export const modernLayoutPattern: CssPattern = {
  id: "modern-layout",
  name: "モダンレイアウト（Grid / Subgrid）",
  browserSupport: "95%+",

  promptContent: `
## モダンCSSレイアウト

CSS Grid と最新レイアウト機能を活用した、プロフェッショナルなレイアウトパターン。

### レスポンシブグリッド（auto-fill — 商品一覧に最適）
\`\`\`css
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 0 24px;
}
@media (min-width: 768px) {
  .product-grid {
    gap: 32px;
    padding: 0;
  }
}
\`\`\`

### 非対称2カラム（テキスト + 画像 — ストーリー系に最適）
\`\`\`css
.split-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: center;
}
@media (min-width: 768px) {
  .split-section {
    grid-template-columns: 5fr 7fr;
    gap: 80px;
  }
  .split-section.reverse {
    grid-template-columns: 7fr 5fr;
  }
  .split-section.reverse > :first-child {
    order: 2;
  }
}
\`\`\`

### マソンリー風グリッド（CSS Grid + row span）
\`\`\`css
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (min-width: 768px) {
  .masonry-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}
.masonry-grid .item-tall {
  grid-row: span 2;
}
.masonry-grid .item-wide {
  grid-column: span 2;
}
\`\`\`

### フルブリード（コンテンツ幅を超えてビューポート幅に広がる）
\`\`\`css
.container {
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: 24px;
}
.full-bleed {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}
\`\`\`

### 3カラム特徴セクション（均等配置）
\`\`\`css
.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  text-align: center;
}
@media (min-width: 768px) {
  .features {
    grid-template-columns: repeat(3, 1fr);
    gap: 48px;
  }
}
.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent-light, #F0F0FF);
}
\`\`\`

### スティッキーサイドバーレイアウト
\`\`\`css
.sticky-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
}
@media (min-width: 1024px) {
  .sticky-layout {
    grid-template-columns: 1fr 360px;
    gap: 60px;
  }
  .sticky-sidebar {
    position: sticky;
    top: 100px;
    align-self: start;
  }
}
\`\`\`

### Container Queries（コンポーネント単位のレスポンシブ）
\`\`\`css
.card-container {
  container-type: inline-size;
}
.card {
  display: flex;
  flex-direction: column;
}
@container (min-width: 400px) {
  .card {
    flex-direction: row;
    align-items: center;
  }
  .card img {
    width: 40%;
  }
}
\`\`\`

**レイアウト原則:**
- モバイルファースト: grid-template-columns は 1fr から開始
- min() / max() / clamp() でフルードな値を使う
- gap はモバイル 16px〜24px、デスクトップ 32px〜48px
- max-width: 1200px（コンテンツ領域）or 1400px（ワイド）
- padding-inline: clamp(16px, 4vw, 80px) でレスポンシブ余白
`,
};
