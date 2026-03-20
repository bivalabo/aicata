import type { IndustryKnowledge } from "../../types";

export const beautyKnowledge: IndustryKnowledge = {
  id: "beauty",
  name: "コスメ・美容",
  recommendedCssFeatures: ["scroll-animations", "motion", "typography", "glassmorphism"],
  recommendedTones: ["luxury", "natural", "elegant"],

  designPrinciples: `
## コスメ・美容ブランドのデザイン原則

### カラーパレット戦略
- ベースは柔らかいニュートラル（#F5F0EB, #E8E0D4, #FFF8F0）
- アクセントはブランドの世界観に合わせる
  - ナチュラル系: アースカラー（#6B5B4B, #8B7355, #4A6741）
  - 高級系: ゴールド＋深色（#C9A96E, #2C2C2C, #1A1A2E）
  - フレッシュ系: パステル（#FFB5BA, #B5D5FF, #C5E8B0）
- グラデーションは控えめに: 同系色の微妙な変化のみ

### タイポグラフィ
- ヘッドライン: Google Fonts から 'Shippori Mincho' または 'Noto Serif JP'（優雅さ）
- 本文: 'Noto Sans JP' weight 300-400（読みやすさ）
- 英字アクセント: 'Cormorant Garamond' または 'Playfair Display'（高級感）
- letter-spacing: 日本語 0.08em〜0.15em、英字 0.15em〜0.3em
- ヘッドラインの line-height: 1.3〜1.5（ゆとりのある行間）

### レイアウト特性
- 余白を大胆に使う（セクション間 padding: 100px〜160px）
- 画像は大きく使う（幅100%フルブリード or グリッドの60%以上）
- テキストと画像のオーバーラップで奥行きを出す
- 左右非対称レイアウト（grid: 5fr 7fr 等）で動きを出す
- 縦書き要素をアクセントに使う（writing-mode: vertical-rl）

### 推奨セクション構成
1. **ヒーロー**: フルスクリーン画像 + オーバーレイテキスト + ブランドラベル
2. **ブランドフィロソフィー**: 大きな余白 + 中央揃え + 詩的なコピー
3. **成分・こだわり**: アイコン付き3カラム or 画像＋テキスト交互配置
4. **商品ショーケース**: カード型 or フルブリード画像 + ホバーエフェクト
5. **使用ステップ / How to Use**: ステップ番号付きの横並び
6. **テスティモニアル**: 引用符 + 星評価 + ユーザー名
7. **Instagram風セクション**: グリッドギャラリー（4列 or 5列）
8. **CTA**: ミニマルなデザインで購入・詳細へ誘導

### モーション指針
- フェードイン＋わずかなスライドアップ（transform: translateY(30px)）
- 画像のスケール変化は控えめ（scale(1.03)程度）
- 高級感を出すために遷移を遅め（0.6s〜0.8s）
- ease-out または cubic-bezier(0.25, 0.46, 0.45, 0.94) を基本に
`,

  exampleSnippets: [
    {
      name: "高級感のあるヒーローセクション",
      description: "フルスクリーンイメージ + 2カラムスプリット + ブランドラベル",
      html: `<section class="hero">
  <div class="hero-content">
    <span class="hero-label">Natural Beauty Collection</span>
    <h1 class="hero-title">肌本来の<br>美しさを引き出す</h1>
    <p class="hero-desc">自然由来の厳選成分で、あなたの素肌力を高める。<br>毎日のスキンケアに、確かな安心を。</p>
    <a href="#products" class="hero-cta">コレクションを見る</a>
  </div>
  <div class="hero-visual">
    <img src="https://placehold.co/800x1000/F5F0EB/6B5B4B" alt="製品イメージ" />
  </div>
</section>`,
      css: `.hero {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;
  overflow: hidden;
}
@media (min-width: 768px) {
  .hero {
    grid-template-columns: 5fr 7fr;
  }
}
.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 24px;
}
@media (min-width: 768px) {
  .hero-content {
    padding: 80px 60px;
  }
}
.hero-label {
  font-family: 'Cormorant Garamond', serif;
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #8B7355;
  margin-bottom: 24px;
}
.hero-title {
  font-family: 'Shippori Mincho', serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.3;
  letter-spacing: 0.05em;
  color: #2C2C2C;
  margin-bottom: 24px;
}
.hero-desc {
  font-size: 0.95rem;
  line-height: 2;
  color: #666;
  margin-bottom: 40px;
  letter-spacing: 0.05em;
}
.hero-cta {
  display: inline-block;
  padding: 16px 48px;
  border: 1px solid #2C2C2C;
  font-size: 13px;
  letter-spacing: 0.15em;
  transition: all 0.4s ease;
  align-self: flex-start;
}
.hero-cta:hover {
  background: #2C2C2C;
  color: #fff;
}
.hero-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}`,
    },
  ],
};
