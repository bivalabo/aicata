// ============================================================
// DDP E-Commerce Intelligence Engine
//
// ECサイトを成功させるための深い知識体系。
// コンバージョン心理学、日本市場の購買行動、
// Shopify最適化、業界別ノウハウを凝縮。
//
// このエンジンが「なぜそのデザインが売れるのか」を理解し、
// Design Director と Section Artisan に知恵を授ける。
// ============================================================

import type {
  DomainEngine,
  EngineContext,
  DirectorKnowledge,
  SectionKnowledge,
  ReviewCriteria,
  RecommendedSection,
} from "./types";

export const ecommerceEngine: DomainEngine = {
  id: "ecommerce-v1",
  name: "E-Commerce Intelligence Engine",
  domain: "ecommerce",

  getDirectorKnowledge(ctx: EngineContext): DirectorKnowledge {
    const industryKnowledge = getIndustryKnowledge(ctx.industry);

    return {
      corePrinciples: `
## EC デザインの根幹原則

### 1. 3秒ルール
ユーザーがページを開いて3秒以内に以下を理解できなければ離脱する:
- 何を売っているサイトか
- 自分に関係があるか
- 次に何をすべきか（CTA）

### 2. F字型・Z字型の視線パターン
日本語サイトの視線は左上→右上→左下へ流れる。
- ロゴ・ブランド名は左上
- CTAは右上または中央
- 重要情報はファーストビューの左半分に

### 3. 認知負荷の最小化
- 1画面に1つのアクション
- 選択肢は3〜5個まで
- 余白は「高級感」と「読みやすさ」の両方を生む

### 4. 信頼の5層構造（日本市場特有）
日本の消費者は以下の順で信頼を構築する:
1. 見た目の清潔感・プロフェッショナル感
2. 会社情報の透明性（特定商取引法表記）
3. 第三者の声（レビュー、メディア掲載）
4. 安心の保証（返品・送料・決済手段）
5. 実績の数字（販売数、顧客数、創業年数）

### 5. モバイルファースト必須
日本のEC購買の70%以上がスマートフォン。
- タップターゲット 44px以上
- フォントサイズ 14px以上
- 横スクロール絶対禁止
- CTAボタンは親指で押せる位置に`,

      industryGuidance: industryKnowledge,

      conversionStrategy: `
## コンバージョン最適化戦略

### ファーストビュー（Above the Fold）
- ヒーロー画像 + 価値提案 + CTA の3要素は必須
- 「何が得られるか」を「何を売っているか」より先に伝える
- 数字を使う（「3万人が愛用」「98%満足」「送料無料」）

### 購入導線の設計
- CTAは最低2箇所（ファーストビュー + ページ下部）
- 「カートに入れる」は緑系統が日本で最も反応が良い
- 「残りわずか」「期間限定」の希少性は有効だが過度にしない
- 決済方法アイコン（クレカ、PayPay、コンビニ払い）を表示

### 社会的証明
- レビューは星評価 + テキスト + 写真の3要素
- 数字は具体的に（「★4.8 / 1,234件のレビュー」）
- メディア掲載ロゴは横並びで控えめに
- UGC（ユーザー投稿）は信頼度が高い

### 離脱防止
- ページ表示速度は3秒以内（画像最適化必須）
- ポップアップは初回訪問から30秒以降
- 「送料無料まであと¥○○」の進捗バーは効果的`,

      psychologyInsights: `
## 購買心理の活用

### 日本市場特有の心理
- **安心志向**: リスクを最小化する情報を先に（返品保証、品質保証）
- **丁寧さへの期待**: 商品説明は詳細に。「なぜ良いのか」の理由を
- **ストーリー共感**: 作り手の想いや背景に共感して購入する傾向
- **限定性**: 「日本限定」「数量限定」は強い購買動機
- **口コミ重視**: 他人の評価を自分の判断材料にする

### 色彩心理
- 赤系: 購買意欲、緊急性（セール、期間限定）
- 緑系: 安心、自然、購入ボタン
- 青系: 信頼、清潔感（企業サイト）
- 黒系: 高級感、洗練（ラグジュアリーブランド）
- ピンク系: 女性向け、優しさ（コスメ、ギフト）`,

      antiPatterns: `
## 絶対にやってはいけないこと

1. **自動再生動画（音あり）** — 即離脱の原因
2. **ポップアップの乱発** — 信頼を失う
3. **価格の非表示** — 日本の消費者は価格比較が前提
4. **英語だけのナビゲーション** — 日本語サイトでは致命的
5. **小さすぎるCTAボタン** — スマホで押せない
6. **背景動画で文字が読めない** — コントラスト不足
7. **ページ遷移が多すぎる購入フロー** — 3ステップ以内が理想
8. **過度なアニメーション** — 商品の邪魔をする
9. **フッターに重要情報を隠す** — 発見されない
10. **カテゴリーの深すぎる階層** — 2クリック以内で商品に到達できるように`,
    };
  },

  getSectionKnowledge(category: string, ctx: EngineContext): SectionKnowledge {
    const knowledge = SECTION_KNOWLEDGE[category];
    if (knowledge) return knowledge;

    return {
      bestPractices: "ユーザーにとって価値のある情報を、読みやすく構造化してください。",
      copywritingGuidance: "簡潔で具体的な日本語で書いてください。",
      layoutRecommendation: "モバイルファーストでレスポンシブに。",
      commonMistakes: "情報過多にならないよう注意してください。",
    };
  },

  getReviewCriteria(ctx: EngineContext): ReviewCriteria {
    return {
      domainSpecificChecks: `
EC固有のチェックポイント:
- CTAボタンがファーストビューに存在するか
- 商品の価値提案が明確か
- 社会的証明（レビュー/実績）が含まれているか
- 信頼シグナル（返品保証、決済方法）が表示されているか
- モバイルでのCTAタップ可能性
- ページの読み込み想定速度（画像サイズ）
- 日本語の自然さと敬語レベルの適切さ
- 特定商取引法に基づく表記へのリンク（フッター）`,
      requiredElements: [
        "CTA（購入/行動喚起ボタン）",
        "価値提案（なぜこの商品/サービスか）",
        "信頼シグナル（保証、実績、安心要素）",
        "ナビゲーション（ヘッダー）",
        "フッター（法的情報、サイトマップ）",
        "レスポンシブ対応のmedia queries",
      ],
      qualityThresholds: {
        visualConsistency: 70,
        conversionOptimization: 75,
        responsiveQuality: 80,
        copywriting: 70,
        accessibility: 60,
      },
    };
  },

  getRecommendedSections(pageType: string, ctx: EngineContext): RecommendedSection[] {
    const sections = PAGE_SECTION_RECOMMENDATIONS[pageType];
    if (sections) return sections;
    return PAGE_SECTION_RECOMMENDATIONS["general"] || [];
  },
};

// ── Industry-Specific Knowledge ──

function getIndustryKnowledge(industry: string): string {
  const knowledge: Record<string, string> = {
    beauty: `
## コスメ・美容業界のデザイン知識

### 購買特性
- ビフォー/アフターの視覚的訴求が最も効果的
- 成分・安全性への関心が非常に高い（特に日本市場）
- インフルエンサーやSNSの口コミが購入の決め手
- 定期購入（サブスク）への誘導が LTV を最大化

### デザイン指針
- 清潔感のある余白多めのレイアウト
- 商品テクスチャーのクローズアップ写真が効果的
- パステルカラーまたはミニマルな配色
- 肌に触れるイメージの暖かみのある写真
- 成分表は読みやすいテーブル or アコーディオン形式

### 必須要素
- 使用方法ステップ（1,2,3形式）
- 成分リスト（透明性）
- Before/After or 使用感レビュー
- 「無添加」「オーガニック」等の安心バッジ`,

    fashion: `
## アパレル・ファッション業界のデザイン知識

### 購買特性
- ビジュアルが最重要 — 写真の品質が直接売上に影響
- サイズへの不安が最大の購入障壁（サイズガイド必須）
- コーディネート提案がクロスセルの鍵
- 季節性が強い — シーズナルバナーの更新が必要

### デザイン指針
- 写真を大きく使う（商品グリッドは2〜3列）
- モデル着用写真 + 商品単体写真の両方
- ルックブック形式のエディトリアルレイアウト
- 黒/白/グレーのニュートラルな背景が商品を引き立てる
- ホバーで別アングルを表示

### 必須要素
- サイズガイド（cm表記、身長別推奨）
- カラーバリエーション表示
- 着用スタッフの身長・体型情報
- コーディネート提案（この商品と合う商品）`,

    food: `
## 食品・飲料業界のデザイン知識

### 購買特性
- 「美味しそう」な写真が購入の60%を決める
- 産地・製法・こだわりのストーリーが差別化
- ギフト需要が大きい（のし、ラッピング対応）
- 定期便・まとめ買いの訴求が効果的

### デザイン指針
- 食欲を刺激する暖色系の配色（赤、オレンジ、茶）
- 料理写真は斜め45度からのアングルが基本
- 素材感が伝わるクローズアップ
- 産地の風景写真でストーリーを伝える
- テーブルセッティングの雰囲気写真

### 必須要素
- アレルギー表示
- 賞味期限の目安
- 保存方法
- 生産者の顔・ストーリー
- ギフトオプション（のし、メッセージカード）`,

    lifestyle: `
## 雑貨・インテリア業界のデザイン知識

### 購買特性
- 使用シーンの提案が購入を後押し
- 素材・サイズ感の詳細情報が重要
- 「部屋に置いたらどう見えるか」のイメージが鍵
- ギフト需要とセルフ需要の両方に対応

### デザイン指針
- ライフスタイル写真（使用シーン）を多用
- グリッドレイアウトで複数商品を見せる
- ナチュラルな色味（ベージュ、アースカラー）
- 余白を活かしたクリーンなレイアウト

### 必須要素
- サイズ詳細（cm単位、比較写真）
- 素材情報
- 使用シーン提案
- お手入れ方法`,

    tech: `
## テック・ガジェット業界のデザイン知識

### 購買特性
- スペック比較が購入判断の核心
- レビュー・ベンチマーク結果への信頼が高い
- 「他製品との違い」が最重要
- 開封体験（unboxing）への期待

### デザイン指針
- ダークモード or スレートカラーの配色
- 製品の美しさを引き立てるミニマルな背景
- スペック表は見やすいテーブル形式
- 3D的な製品ショット
- インフォグラフィックスでスペックを視覚化

### 必須要素
- スペック比較表
- 同梱物一覧
- 互換性情報
- 保証期間・サポート情報`,

    health: `
## 健康・フィットネス業界のデザイン知識

### 購買特性
- エビデンス（科学的根拠）への信頼が購入を決める
- ビフォー/アフターの変化が強い訴求
- 定期購入が LTV の鍵
- 資格・認証マークが信頼を構築

### デザイン指針
- 清潔感のある白基調 + アクセントカラー
- 活力を感じる明るい写真
- 成分・栄養素のインフォグラフィック
- 医師・専門家の推薦コメント

### 必須要素
- 栄養成分表示
- 使用上の注意
- 医師・専門家の推薦（あれば）
- 定期購入の価格メリット表示`,
  };

  return knowledge[industry] || `
## 一般的なECデザイン知識
業種を問わず、以下の原則を守ってください:
- 商品の魅力が伝わる高品質な写真
- 明確な価値提案
- 信頼できる会社情報
- スムーズな購入導線`;
}

// ── Section-Specific Knowledge ──

const SECTION_KNOWLEDGE: Record<string, SectionKnowledge> = {
  hero: {
    bestPractices: `
ヒーローセクションは「3秒で伝える」が使命。
- 大きなビジュアル + キャッチコピー + CTAの3点セット
- キャッチコピーは7語以内が最適（日本語は15文字以内）
- CTAボタンは対比色で目立たせる
- サブコピーで「なぜ今行動すべきか」を補足`,
    copywritingGuidance: `
- メインコピー: 顧客の「得られる価値」を書く（商品名ではない）
- 例: ×「新作クリーム発売」→ ○「朝のスキンケアが、たった30秒に」
- サブコピー: 具体的な数字や実績を入れる
- CTAテキスト: 「今すぐ購入」より「○○を始める」が効果的`,
    layoutRecommendation: "全幅レイアウト。画像はビューポートの60%以上。テキストは画像の上に重ねるか左右分割。",
    commonMistakes: "画像が暗すぎてテキストが読めない。CTAボタンが小さすぎる。情報を詰め込みすぎ。",
  },

  features: {
    bestPractices: `
特徴セクションは「なぜこの商品/ブランドか」を伝える。
- 3〜4個が最適（多すぎると記憶に残らない）
- アイコン + 見出し + 1文説明の3層構造
- 顧客目線で書く（技術スペックではなく「あなたにとってのメリット」）`,
    copywritingGuidance: `
- 見出し: 顧客のメリットを1語で（「速い」ではなく「忙しい朝でも」）
- 説明: 具体的なシーンを描写する
- 例: ×「高品質素材使用」→ ○「10回洗っても型崩れしない」`,
    layoutRecommendation: "2列 or 3列のグリッド。アイコンは色付きの丸背景に白アイコン。",
    commonMistakes: "技術用語の羅列。項目が多すぎ。アイコンが全部同じに見える。",
  },

  testimonial: {
    bestPractices: `
レビューセクションは「他の人も買っている」という安心感を提供。
- 星評価 + テキスト + 写真の3要素が最強
- 実名 or イニシャル + 年代で信頼性UP
- ネガティブなレビューも含めると信頼度が上がる（4.2〜4.8が最も信頼される）`,
    copywritingGuidance: `
- レビューは「使ってみた感想」の口調で
- 具体的な変化や驚きを含める
- 「○ヶ月使用」など期間情報は信頼度を上げる`,
    layoutRecommendation: "カード形式で横スクロール or 3列グリッド。写真は丸型アバター。",
    commonMistakes: "レビューが長すぎ。全部5つ星（不自然）。名前がない。",
  },

  products: {
    bestPractices: `
商品グリッドは「発見と比較」を促進する。
- 4列（PC）→ 2列（スマホ）が標準
- ホバーで2枚目の画像を表示
- 価格は明確に表示（税込み）
- 「NEW」「SALE」バッジは左上に`,
    copywritingGuidance: `
- 商品名は簡潔に（20文字以内）
- 価格は税込みで大きく
- 「残りわずか」は本当の場合のみ`,
    layoutRecommendation: "グリッド形式。ホバーエフェクト付き。カード内は画像 → 商品名 → 価格の順。",
    commonMistakes: "画像サイズ不統一。価格が小さい。在庫状況が不明。",
  },

  cta: {
    bestPractices: `
CTAセクションは「最後の一押し」。
- ページ下部に必ず1つ配置
- 限定性 or 緊急性を適度に
- ニュースレター登録もここに
- 背景はアクセントカラーで目立たせる`,
    copywritingGuidance: `
- 「今すぐ」より「あなたも」の方が日本市場では反応が良い
- 特典を明記（送料無料、初回10%OFF等）
- ボタンテキストは行動を示す動詞で`,
    layoutRecommendation: "全幅、濃い背景色。テキスト中央揃え。ボタンは大きめ。",
    commonMistakes: "CTAがページの途中に埋もれている。特典の説明がない。ボタンが目立たない。",
  },

  navigation: {
    bestPractices: `
ナビゲーションは「迷わせない」が使命。
- ロゴは左上、CTA（カート/購入）は右上
- メニュー項目は5〜7個まで
- スマホではハンバーガーメニュー
- 検索バーはヘッダーに含める
- スティッキーヘッダーで常にアクセス可能に`,
    copywritingGuidance: "メニュー名は2〜4文字が理想。「商品一覧」>「Products」（日本語サイトでは日本語）。",
    layoutRecommendation: "ロゴ左、メニュー中央 or 右、アクション（検索/カート）右端。高さは60〜80px。",
    commonMistakes: "メニュー項目が多すぎ。ドロップダウンが深すぎ。スマホでタップしにくい。",
  },

  footer: {
    bestPractices: `
フッターは「信頼の最終確認」。
- 特定商取引法に基づく表記は必須（日本のEC法律）
- プライバシーポリシー、利用規約へのリンク
- SNSアイコン
- 決済方法アイコン（クレカ、コンビニ、電子マネー）
- 問い合わせ先（メール or 電話）`,
    copywritingGuidance: "コピーライト表記は「© 2024 ブランド名 All Rights Reserved.」",
    layoutRecommendation: "4列レイアウト。ダーク背景。最下部にコピーライト。",
    commonMistakes: "特商法表記がない（違法）。リンクが多すぎてカオス。フッターが高すぎ。",
  },
};

// ── Page-Type Section Recommendations ──

const PAGE_SECTION_RECOMMENDATIONS: Record<string, RecommendedSection[]> = {
  landing: [
    { id: "navigation", category: "navigation", purpose: "サイトナビゲーション", priority: "required", businessReason: "ユーザーがサイト内を迷わず移動できる導線" },
    { id: "hero", category: "hero", purpose: "ファーストビュー・価値提案", priority: "required", businessReason: "3秒以内にブランドの価値を伝え、離脱を防ぐ" },
    { id: "social-proof-bar", category: "trust-badges", purpose: "実績バー（受賞歴、メディア掲載等）", priority: "recommended", businessReason: "ファーストビュー直下で信頼を即座に構築" },
    { id: "features", category: "features", purpose: "選ばれる理由・USP", priority: "required", businessReason: "競合との差別化を明確にし、購入理由を提供" },
    { id: "products", category: "products", purpose: "人気商品・注目商品", priority: "required", businessReason: "具体的な商品を見せて購買意欲を刺激" },
    { id: "story", category: "story", purpose: "ブランドストーリー", priority: "recommended", businessReason: "共感を生み、ブランドロイヤルティを構築" },
    { id: "testimonials", category: "testimonial", purpose: "お客様の声", priority: "required", businessReason: "社会的証明で購入の不安を解消" },
    { id: "cta-bottom", category: "cta", purpose: "最終CTA", priority: "required", businessReason: "ページ離脱前の最後の行動喚起" },
    { id: "footer", category: "footer", purpose: "フッター", priority: "required", businessReason: "法的要件（特商法）と信頼シグナル（決済方法）" },
  ],

  product: [
    { id: "navigation", category: "navigation", purpose: "ヘッダー", priority: "required", businessReason: "ブランド認知とサイト内回遊" },
    { id: "breadcrumb", category: "breadcrumb", purpose: "パンくずリスト", priority: "recommended", businessReason: "ユーザーの現在地を明示し、カテゴリーへの回遊を促進" },
    { id: "product-gallery", category: "product-gallery", purpose: "商品画像ギャラリー", priority: "required", businessReason: "商品の魅力を視覚的に伝える最重要要素" },
    { id: "product-info", category: "product-info", purpose: "商品情報・購入ボタン", priority: "required", businessReason: "購入の意思決定に必要な全情報 + 行動導線" },
    { id: "product-description", category: "product-description", purpose: "商品詳細説明", priority: "required", businessReason: "購入前の疑問を解消し、信頼を構築" },
    { id: "product-reviews", category: "product-reviews", purpose: "レビュー", priority: "required", businessReason: "社会的証明。ECでの最大の購入トリガー" },
    { id: "related-products", category: "related-products", purpose: "関連商品", priority: "recommended", businessReason: "クロスセルでAOV（平均注文額）を向上" },
    { id: "footer", category: "footer", purpose: "フッター", priority: "required", businessReason: "信頼シグナルと法的要件" },
  ],

  collection: [
    { id: "navigation", category: "navigation", purpose: "ヘッダー", priority: "required", businessReason: "サイト内回遊" },
    { id: "collection-banner", category: "collection-banner", purpose: "コレクションバナー", priority: "required", businessReason: "カテゴリーの世界観を伝える" },
    { id: "collection-filter", category: "collection-filter", purpose: "フィルター・ソート", priority: "recommended", businessReason: "ユーザーが目的の商品を素早く見つけられる" },
    { id: "collection-grid", category: "collection-grid", purpose: "商品グリッド", priority: "required", businessReason: "商品の一覧表示と比較" },
    { id: "cta-bottom", category: "cta", purpose: "CTA", priority: "recommended", businessReason: "見つからなかった場合のフォローアップ" },
    { id: "footer", category: "footer", purpose: "フッター", priority: "required", businessReason: "法的要件" },
  ],

  about: [
    { id: "navigation", category: "navigation", purpose: "ヘッダー", priority: "required", businessReason: "サイト内回遊" },
    { id: "hero", category: "hero", purpose: "ブランドビジュアル", priority: "required", businessReason: "ブランドの世界観を視覚的に伝える" },
    { id: "story", category: "story", purpose: "創業ストーリー", priority: "required", businessReason: "共感と信頼を構築" },
    { id: "philosophy", category: "philosophy", purpose: "理念・ミッション", priority: "required", businessReason: "ブランドの価値観への共感" },
    { id: "team", category: "features", purpose: "チーム紹介", priority: "optional", businessReason: "人の顔が見えることで信頼度UP" },
    { id: "cta", category: "cta", purpose: "行動喚起", priority: "recommended", businessReason: "ストーリーに共感した後の自然な行動導線" },
    { id: "footer", category: "footer", purpose: "フッター", priority: "required", businessReason: "法的要件" },
  ],

  contact: [
    { id: "navigation", category: "navigation", purpose: "ヘッダー", priority: "required", businessReason: "サイト内回遊" },
    { id: "contact-hero", category: "hero", purpose: "ページタイトル", priority: "required", businessReason: "ページの目的を明確に" },
    { id: "contact-form", category: "contact-form", purpose: "お問い合わせフォーム", priority: "required", businessReason: "顧客との接点" },
    { id: "contact-info", category: "features", purpose: "連絡先情報", priority: "required", businessReason: "フォーム以外の連絡手段を提供" },
    { id: "faq", category: "faq", purpose: "よくある質問", priority: "recommended", businessReason: "問い合わせ数を削減し、即座に回答" },
    { id: "footer", category: "footer", purpose: "フッター", priority: "required", businessReason: "法的要件" },
  ],

  general: [
    { id: "navigation", category: "navigation", purpose: "ヘッダー", priority: "required", businessReason: "サイト内回遊" },
    { id: "hero", category: "hero", purpose: "メインビジュアル", priority: "required", businessReason: "ページの価値提案" },
    { id: "main-content", category: "features", purpose: "メインコンテンツ", priority: "required", businessReason: "ページの目的達成" },
    { id: "cta", category: "cta", purpose: "行動喚起", priority: "recommended", businessReason: "次のアクションへの導線" },
    { id: "footer", category: "footer", purpose: "フッター", priority: "required", businessReason: "法的要件" },
  ],
};

export default ecommerceEngine;
