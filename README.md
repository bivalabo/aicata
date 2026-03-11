# Aicata — AI専属パートナー for Shopify

> AI + 相方（あいかた）

日本のShopifyストア運営者のためのAI専属パートナーアプリです。
日本語の対話だけで、ページデザイン・SEO・ストア運営をプロレベルでサポートします。

## クイックスタート

### 1. 前提条件

- Node.js v20以上
- Shopify Partner アカウント
- 開発ストア
- PostgreSQL（またはDocker）
- Anthropic API キー

### 2. セットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して各値を設定

# Prismaクライアントの生成
npx prisma generate

# データベースのマイグレーション
npx prisma migrate dev --name init

# 開発サーバーの起動
shopify app dev
```

### 3. Shopifyアプリの設定

初回起動時にShopify CLIが自動的にアプリの設定を行います。

1. `shopify app dev` を実行
2. Shopify Partnerアカウントでログイン
3. アプリを選択（または新規作成）
4. 開発ストアを選択

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | Shopify App Remix |
| 言語 | TypeScript |
| AI | Claude API (Anthropic) |
| DB | PostgreSQL + Prisma |
| UI | Shopify Polaris |

## プロジェクト構造

```
app/
├── routes/          # ページルート
├── services/        # ビジネスロジック
├── models/          # データアクセス
├── prompts/         # AIプロンプト
├── components/      # UIコンポーネント
├── types/           # 型定義
└── locales/         # 多言語リソース
```

## 開発フェーズ

- [x] Phase 1: プロジェクト雛形（←今ここ）
- [ ] Phase 2: AI会話エンジン
- [ ] Phase 3: Liquidテンプレート生成
- [ ] Phase 4: ストア運営サポート
