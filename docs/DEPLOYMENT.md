# Aicata デプロイ手順書

## 前提条件

- Node.js 20以上
- PostgreSQL 15以上
- Redis 7以上
- Shopify Partnerアカウント
- Anthropic APIキー

## ローカル開発環境

### 1. 依存パッケージのインストール

```bash
cd aicata-project
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集：

```env
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
DATABASE_URL=postgresql://user:password@localhost:5432/aicata
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 3. データベースのセットアップ

```bash
# PostgreSQLでデータベースを作成
createdb aicata

# Prismaマイグレーション実行
npx prisma migrate dev --name init

# Prismaクライアント生成
npx prisma generate
```

### 4. Shopifyアプリの登録

```bash
# Shopify CLIでアプリを登録
npx shopify app dev
```

初回実行時にPartnerダッシュボードでアプリが自動作成されます。

### 5. 開発サーバー起動

```bash
npm run dev
```

`http://localhost:3000` でアクセス可能。
Shopify管理画面からアプリをインストールしてテスト。

## 本番デプロイ

### Fly.io の場合

#### 1. Fly CLIのインストール

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

#### 2. アプリ作成

```bash
fly launch --name aicata-app
```

#### 3. シークレット設定

```bash
fly secrets set SHOPIFY_API_KEY=your_key
fly secrets set SHOPIFY_API_SECRET=your_secret
fly secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
fly secrets set DATABASE_URL=your_postgres_url
fly secrets set REDIS_URL=your_redis_url
fly secrets set NODE_ENV=production
```

#### 4. PostgreSQL追加

```bash
fly postgres create --name aicata-db
fly postgres attach aicata-db
```

#### 5. Redis追加（Upstash推奨）

Fly.ioではUpstash Redisを推奨：

```bash
fly ext upstash redis create
```

#### 6. デプロイ

```bash
fly deploy
```

#### 7. マイグレーション

```bash
fly ssh console -C "npx prisma migrate deploy"
```

### Railway の場合

1. https://railway.app でプロジェクト作成
2. GitHubリポジトリを接続
3. PostgreSQL と Redis をサービスとして追加
4. 環境変数を設定
5. 自動デプロイが有効になる

### Heroku の場合

```bash
heroku create aicata-app
heroku addons:create heroku-postgresql:essential-0
heroku addons:create heroku-redis:mini

heroku config:set SHOPIFY_API_KEY=your_key
heroku config:set SHOPIFY_API_SECRET=your_secret
heroku config:set ANTHROPIC_API_KEY=sk-ant-xxxxx

git push heroku main

heroku run npx prisma migrate deploy
```

## Shopify App Store公開

### 1. アプリ情報の準備

- アプリ名: Aicata
- 説明文（日本語・英語）
- スクリーンショット（1280x800推奨、最低4枚）
- プライバシーポリシーURL
- アプリアイコン（1200x1200）

### 2. アプリレビュー申請

Shopify Partnerダッシュボード → アプリ → 配布 → App Store

### レビューチェックリスト

- [ ] HTTPS強制
- [ ] Webhook処理が正常
- [ ] アンインストール時のデータ削除対応
- [ ] GDPR準拠（データ削除リクエスト対応）
- [ ] 認証フローが正常
- [ ] エラーハンドリング
- [ ] レスポンシブデザイン
- [ ] 日本語ローカライゼーション完了

## 監視・運用

### ログ監視

```bash
# Fly.io
fly logs

# Heroku
heroku logs --tail
```

### データベースバックアップ

```bash
# Fly.io
fly postgres backup create

# 手動バックアップ
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### ヘルスチェック

アプリの `/webhooks` エンドポイントがShopifyからのWebhookを正常に処理しているか定期確認。

## トラブルシューティング

| 問題 | 原因 | 対処 |
|------|------|------|
| OAuth失敗 | API KeyのMismatch | .envとPartnerダッシュボードを確認 |
| DB接続エラー | DATABASE_URL不正 | 接続文字列とPostgreSQLの稼働を確認 |
| Claude API 429 | レート制限 | リトライロジック確認、上位プラン検討 |
| テーマデプロイ失敗 | スコープ不足 | write_themes スコープがあるか確認 |
| Webhook受信なし | URL未登録 | shopify.app.tomlのwebhooks設定を確認 |
