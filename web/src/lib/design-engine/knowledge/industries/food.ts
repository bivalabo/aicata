import type { IndustryKnowledge } from "../../types";

export const foodKnowledge: IndustryKnowledge = {
  id: "food",
  name: "食品・飲料",
  recommendedCssFeatures: ["scroll-animations", "motion", "typography", "modern-layout"],
  recommendedTones: ["warm", "natural", "playful"],

  designPrinciples: `
## 食品・飲料ブランドのデザイン原則

### カラーパレット戦略
- 食欲を刺激する暖色系ベース（#FFF5E6, #FEF3E2, #FFFBF5）
- アクセントカラー:
  - オーガニック系: ディープグリーン + テラコッタ（#2D5016, #C4704B, #8B6914）
  - 和食・お茶系: 抹茶 + 墨色（#5B7A3D, #333333, #C9A96E）
  - スイーツ系: ピンク + ブラウン（#E8A0BF, #5C3D2E, #F5D6C6）
  - ドリンク系: ブランドの飲料色をアクセントに（コーヒー: #6F4E37, ワイン: #722F37）
- 背景にテクスチャ感: 紙のような淡い質感（background: #F5F0E8 + noise overlay）

### タイポグラフィ
- ヘッドライン: 'Shippori Mincho'（上品な和食）or 'Noto Sans JP' weight 700（カジュアル）
- 本文: 'Noto Sans JP' weight 400
- 英字: 'DM Serif Display'（クラシック）or 'Josefin Sans'（モダン）
- 食品は手書き風フォントも効果的（控えめに使用）
- letter-spacing: 日本語 0.05em〜0.1em

### レイアウト特性
- 食品画像を**主役**にする（画面の50%以上を画像に）
- 白い皿、木目テーブル等の自然な背景を想定した配色
- カード型レイアウトで商品一覧を見やすく
- セクション間は 80px〜120px（美容系よりやや詰める — 情報密度を上げる）

### 推奨セクション構成
1. **ヒーロー**: 大きな食品写真 + キャッチコピー + 「今すぐ購入」ボタン
2. **こだわり・ストーリー**: 生産者の顔、産地の風景、製法の写真 + テキスト
3. **商品ラインナップ**: カードグリッド（2列 or 3列）+ 価格表示
4. **お客様の声**: レビュー + 星評価（食品は口コミが重要）
5. **定期便・セット提案**: 特別オファーセクション
6. **FAQ / 食べ方提案**: アコーディオン or カード型
7. **CTA**: 「初回限定」「送料無料」等のインセンティブ付き

### モーション指針
- 商品カードのホバー: わずかな浮き上がり（translateY(-6px)）+ 影の拡大
- 画像はズームイン（scale(1.05)）でシズル感を演出
- フェードインは比較的速め（0.4s〜0.5s）で軽快な印象
- スクロール連動で食品画像が順番に登場する演出が効果的
`,

  exampleSnippets: [
    {
      name: "食品ヒーローセクション",
      description: "大きな食品写真 + オーバーレイ + CTA",
      html: `<section class="hero">
  <div class="hero-bg">
    <img src="https://placehold.co/1600x900/5B7A3D/FFF5E6" alt="商品イメージ" />
    <div class="hero-overlay"></div>
  </div>
  <div class="hero-content">
    <p class="hero-tag">— 産地直送 —</p>
    <h1 class="hero-title">自然の恵みを、<br>そのままあなたの食卓へ</h1>
    <p class="hero-desc">厳選された有機素材だけを使用。手間ひまかけた本物の味をお届けします。</p>
    <div class="hero-actions">
      <a href="#products" class="btn-primary">商品を見る</a>
      <a href="#story" class="btn-outline">私たちのこだわり</a>
    </div>
  </div>
</section>`,
      css: `.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  overflow: hidden;
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
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%);
}
.hero-content {
  position: relative;
  z-index: 1;
  max-width: 680px;
  padding: 40px 24px;
  color: #fff;
}
@media (min-width: 768px) {
  .hero-content { padding: 80px; }
}
.hero-tag {
  font-size: 13px;
  letter-spacing: 0.2em;
  margin-bottom: 20px;
  opacity: 0.9;
}
.hero-title {
  font-family: 'Shippori Mincho', serif;
  font-size: clamp(1.8rem, 4.5vw, 3rem);
  line-height: 1.4;
  letter-spacing: 0.08em;
  margin-bottom: 20px;
}
.hero-desc {
  font-size: 0.95rem;
  line-height: 1.9;
  opacity: 0.9;
  margin-bottom: 36px;
}
.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.btn-primary {
  padding: 14px 40px;
  background: #fff;
  color: #2D5016;
  font-size: 14px;
  letter-spacing: 0.1em;
  border-radius: 2px;
  transition: all 0.3s ease;
}
.btn-primary:hover {
  background: #2D5016;
  color: #fff;
}
.btn-outline {
  padding: 14px 40px;
  border: 1px solid rgba(255,255,255,0.7);
  color: #fff;
  font-size: 14px;
  letter-spacing: 0.1em;
  border-radius: 2px;
  transition: all 0.3s ease;
}
.btn-outline:hover {
  background: rgba(255,255,255,0.15);
}`,
    },
  ],
};
