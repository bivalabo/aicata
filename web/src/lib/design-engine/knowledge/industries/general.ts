import type { IndustryKnowledge } from "../../types";

export const generalKnowledge: IndustryKnowledge = {
  id: "general",
  name: "汎用",
  recommendedCssFeatures: ["motion", "typography", "modern-layout"],
  recommendedTones: ["modern", "minimal"],

  designPrinciples: `
## 汎用デザイン原則

### カラーパレット
- クリーンな白背景ベース（#FFFFFF, #FAFAFA）
- テキスト: ディープグレー（#1A1A1A or #333333）
- アクセント: ブランドに合わせて1〜2色（指定がなければ #3B82F6 ブルー系）
- サブカラー: アクセントの淡い版（opacity 0.1 でバッジ背景等）

### タイポグラフィ
- ヘッドライン: 'Noto Sans JP' weight 700
- 本文: 'Noto Sans JP' weight 400, line-height 1.8
- 英字: 'Inter' or system-ui
- letter-spacing: 0.04em〜0.08em

### レイアウト
- max-width: 1200px でセンター配置
- セクション padding: 80px 24px（モバイル 60px 16px）
- グリッド: 商品は 2〜3列、特徴は 3〜4列
- 画像比率: 16:9（横）、1:1（カード）、3:4（ポートレート）

### 推奨セクション構成
1. ヒーロー（画像 + キャッチ + CTA）
2. 特徴・強み（3〜4列アイコン付き）
3. 商品/サービス一覧
4. お客様の声
5. CTA（行動喚起）
6. フッター
`,

  exampleSnippets: [],
};
