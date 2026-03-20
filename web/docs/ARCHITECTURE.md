# Aicata アーキテクチャ設計書

## プロダクトビジョン

Aicata は **AI搭載のShopifyページビルダー**。
対話型AIが Shopify ストアのページを生成・編集し、専用エディタで微調整、
ボタン一つで Shopify に反映する。

## ユーザーフロー

```
1. チャットで要望を伝える
   「inspice.jp のようなトップページを作りたい」

2. AIがヒアリング（1つずつ質問）
   テーマ、ブランドカラー、画像の有無など

3. AIがページを生成 → ライブプレビュー表示
   チャット横にリアルタイムでプレビューが出る

4. 対話で修正
   「ヒーローの文字をもっと大きく」→ 即座にプレビュー更新

5. エディタで微調整（将来）
   テキスト直接編集、色変更、余白調整など

6. Shopifyにデプロイ（将来）
   「反映する」ボタン → Shopify Admin API経由で適用
```

## 画面構成

```
┌─────────┬──────────────────┬──────────────────┐
│         │                  │                  │
│ Sidebar │   Chat Area      │  Live Preview    │
│         │                  │                  │
│ ・履歴   │  メッセージ表示    │  生成されたページ   │
│ ・ナビ   │  画像添付対応     │  のリアルタイム    │
│         │  コード折りたたみ  │  プレビュー       │
│         │                  │  (iframe)        │
│         │                  │                  │
│         │  [入力エリア]     │  [エディタ切替]    │
└─────────┴──────────────────┴──────────────────┘
```

### レイアウトモード
- **チャットモード**: プレビューなし（通常の相談）
- **ビルダーモード**: チャット + プレビュー（ページ生成時）
- **エディタモード**: プレビュー + エディタパネル（将来）

## データモデル

### Page（新規）
```
Page
  id          String   @id
  title       String   "トップページ"
  slug        String   "index" (Shopify上のパス)
  html        String   生成されたHTML
  css         String   生成されたCSS
  status      String   draft / published
  version     Int      バージョン番号
  shopifyId   String?  デプロイ後のShopify上のID
  conversationId  String  紐づくチャット
  createdAt   DateTime
  updatedAt   DateTime
```

### PageVersion（履歴管理）
```
PageVersion
  id          String
  pageId      String
  version     Int
  html        String
  css         String
  prompt      String   この変更を生じたプロンプト
  createdAt   DateTime
```

## AI生成フロー

### システムプロンプト戦略

AIの応答に **構造化された出力** を含める:

```
通常の会話テキスト...

---PAGE_START---
<section class="hero">
  <h1>ブランド名</h1>
  ...
</section>
<style>
  .hero { ... }
</style>
---PAGE_END---
```

クライアント側でこのマーカーを検知し、
ページデータを抽出 → プレビューに反映 → DBに保存

### 生成ルール
- HTML + CSS のみ（JSは最小限）
- レスポンシブ対応（モバイルファースト）
- Shopify Liquid 構文は最終デプロイ時に変換
- 画像はプレースホルダーURL → ユーザーが差し替え

## 技術スタック

- **フロントエンド**: Next.js 16 + React 19 + Tailwind v4
- **AI**: Claude API (Anthropic SDK) + SSEストリーミング
- **DB**: SQLite (Prisma 7)
- **プレビュー**: iframe + srcdoc
- **将来**: Shopify Admin API, Monaco Editor

## 実装フェーズ

### Phase A: ビルダー基盤（現在）
- [ ] Page データモデル追加
- [ ] ライブプレビューコンポーネント
- [ ] AI出力からページデータ抽出
- [ ] チャット + プレビューの分割レイアウト
- [ ] システムプロンプトをビルダー型に更新

### Phase B: ページ管理
- [ ] ページ一覧画面
- [ ] バージョン履歴・ロールバック
- [ ] ページ複製・テンプレート化

### Phase C: ビジュアルエディタ
- [ ] テキスト直接編集
- [ ] カラーピッカー
- [ ] 余白・フォントサイズ調整
- [ ] 画像アップロード・差し替え

### Phase D: Shopify連携
- [ ] OAuth認証
- [ ] Liquid変換エンジン
- [ ] テーマへのデプロイ
- [ ] プレビュー環境（下書きテーマ）
