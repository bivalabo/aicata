import type { IndustryKnowledge } from "../../types";

export const fashionKnowledge: IndustryKnowledge = {
  id: "fashion",
  name: "ファッション・アパレル",
  recommendedCssFeatures: ["scroll-animations", "motion", "modern-layout", "typography"],
  recommendedTones: ["modern", "bold", "minimal", "luxury"],

  designPrinciples: `
## ファッション・アパレルブランドのデザイン原則

### カラーパレット戦略
- モノクロベースが最も安全で洗練される（#FFFFFF, #F5F5F5, #1A1A1A, #000000）
- アクセントはブランドカラー1色のみ（例: #E63946 赤、#C9A96E ゴールド）
- ハイファッション系: 黒＋白＋1色（コントラスト重視）
- カジュアル系: オフホワイト + アースカラー（#F0EDE5, #8B7D6B, #4A4A4A）
- ストリート系: ビビッドな差し色（#00FF87, #FF3366, #6C63FF）

### タイポグラフィ
- ヘッドライン: 'Noto Sans JP' weight 900 or 700（力強さ）
- ハイブランド系は 'Shippori Mincho' + 極細ウェイト（繊細さ）
- 英字: 'Inter' or 'Outfit'（モダン）、'Cormorant Garamond'（エレガント）
- 文字サイズのコントラストを大きく: ヘッドライン 4rem〜6rem vs 本文 0.9rem
- letter-spacing: ヘッドラインは 0.05em〜0.15em（広め）
- text-transform: uppercase を英字ヘッドラインで積極的に使用

### レイアウト特性
- グリッドレイアウトを活用（2列〜4列、不揃いな高さで動きを出す）
- 画像比率はファッション的に（3:4 or 2:3 ポートレート比率）
- ネガティブスペース（余白）を武器にする
- テキストは最小限 — ビジュアルで語る
- スクロールで画像が次々と現れるマガジン的レイアウト

### 推奨セクション構成
1. **ヒーロー**: フルスクリーン画像 + ブランドロゴ + ミニマルCTA
2. **ルックブック / ニューコレクション**: 大きな写真グリッド（マソンリー or 不揃い）
3. **カテゴリーナビ**: 画像付きカテゴリーカード（WOMEN / MEN / ACCESSORIES）
4. **注目商品**: 大きな1商品フィーチャー + 小さな関連商品
5. **ブランドステートメント**: 大きなテキスト + ミニマルな背景
6. **Instagram / SNS連携**: ユーザー着用写真のグリッド
7. **ニュースレター登録**: ミニマルな入力フォーム

### モーション指針
- クリーンでシャープなアニメーション
- clip-path でのスライド揭示（clip-path: inset(0 100% 0 0) → inset(0)）
- 画像のホバー: モノクロ→カラーへの変化、またはスケール1.08
- transition: 0.3s〜0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)
- 遊び心のあるカーソルエフェクトは cursor: pointer のスタイリングで暗示
`,

  exampleSnippets: [
    {
      name: "ファッションヒーロー（フルスクリーン）",
      description: "フルスクリーンイメージ + 中央ブランドロゴ + スクロールヒント",
      html: `<section class="hero">
  <div class="hero-bg">
    <img src="https://placehold.co/1600x900/1A1A1A/F5F5F5" alt="New Collection" />
    <div class="hero-overlay"></div>
  </div>
  <div class="hero-center">
    <p class="hero-season">2026 Spring / Summer</p>
    <h1 class="hero-title">NEW<br>COLLECTION</h1>
    <a href="#collection" class="hero-cta">SHOP NOW</a>
  </div>
  <div class="hero-scroll-hint">
    <span>SCROLL</span>
    <div class="scroll-line"></div>
  </div>
</section>`,
      css: `.hero {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #fff;
}
.hero-bg {
  position: absolute;
  inset: 0;
}
.hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}
.hero-center {
  position: relative;
  text-align: center;
  z-index: 1;
}
.hero-season {
  font-size: 12px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  margin-bottom: 20px;
  opacity: 0.85;
}
.hero-title {
  font-family: 'Inter', sans-serif;
  font-size: clamp(3rem, 10vw, 7rem);
  font-weight: 200;
  letter-spacing: 0.15em;
  line-height: 1.1;
  margin-bottom: 40px;
}
.hero-cta {
  display: inline-block;
  padding: 16px 56px;
  border: 1px solid #fff;
  font-size: 12px;
  letter-spacing: 0.3em;
  transition: all 0.4s ease;
}
.hero-cta:hover {
  background: #fff;
  color: #000;
}
.hero-scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1;
}
.hero-scroll-hint span {
  font-size: 10px;
  letter-spacing: 0.3em;
  opacity: 0.7;
}
.scroll-line {
  width: 1px;
  height: 40px;
  background: rgba(255,255,255,0.5);
  position: relative;
  overflow: hidden;
}
.scroll-line::after {
  content: '';
  position: absolute;
  top: -100%;
  width: 100%;
  height: 100%;
  background: #fff;
  animation: scroll-anim 1.5s ease-in-out infinite;
}
@keyframes scroll-anim {
  0% { top: -100%; }
  100% { top: 100%; }
}`,
    },
  ],
};
