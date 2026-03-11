# Aicata アーキテクチャ設計書

## 1. システム概要

Aicataは、Shopify App Remixフレームワーク上に構築されたAI駆動のストア運営支援アプリケーションです。

```
┌──────────────────────────────────────────────────────┐
│                    Shopify Admin                      │
│                  (App Bridge埋め込み)                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  チャットUI   │  │ テンプレート  │  │ ダッシュボード│  │
│  │ (React)      │  │  管理画面     │  │   設定画面   │  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │
│         │                 │                │         │
│  ┌──────┴─────────────────┴────────────────┴──────┐  │
│  │           Remix Server (SSR + API)              │  │
│  ├─────────┬──────────┬────────────┬──────────────┤  │
│  │ 会話    │ Liquid   │ テーマ     │ ストア運営    │  │
│  │ エンジン│ 生成     │ デプロイ   │ サポート      │  │
│  ├─────────┴──────────┴────────────┴──────────────┤  │
│  │              Claude API (Anthropic)             │  │
│  ├────────────────────────────────────────────────┤  │
│  │      Shopify Admin API (GraphQL + REST)         │  │
│  ├─────────────┬──────────────────────────────────┤  │
│  │ PostgreSQL  │           Redis                   │  │
│  │ (Prisma)    │        (セッション)                │  │
│  └─────────────┴──────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## 2. 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | Shopify App Remix | ^3.7.0 |
| フロントエンド | React + Shopify Polaris | ^12.0.0 |
| サーバーランタイム | Node.js | 20+ |
| ビルドツール | Vite | ^6.0.0 |
| ORM | Prisma | ^6.2.0 |
| データベース | PostgreSQL | 15+ |
| セッション/キャッシュ | Redis (ioredis) | ^5.4.0 |
| AI | Anthropic SDK | ^0.39.0 |
| 言語 | TypeScript | ^5.7.0 |

## 3. ディレクトリ構成

```
app/
├── routes/           # Remix ルート（URL → コンポーネント）
│   ├── _index.tsx           # ルート → /app リダイレクト
│   ├── app.tsx              # /app レイアウト（Polaris Provider）
│   ├── app._index.tsx       # ダッシュボード
│   ├── app.chat.tsx         # チャット一覧
│   ├── app.chat.$id.tsx     # 個別チャット画面
│   ├── app.chat.$id.stream.tsx  # SSEストリーミング
│   ├── app.templates.tsx    # テンプレート管理
│   ├── app.settings.tsx     # 設定画面
│   ├── auth.$.tsx           # OAuth認証コールバック
│   └── webhooks.tsx         # Shopify Webhook受信
├── services/         # ビジネスロジック
│   ├── claude-client.ts         # Claude API通信
│   ├── conversation.server.ts   # 会話管理（SSE含む）
│   ├── token-manager.ts         # トークン使用量管理
│   ├── liquid-generator.ts      # Liquidコード生成
│   ├── section-schema.ts        # セクションスキーマビルダー
│   ├── theme-deployer.ts        # テーマアセットデプロイ
│   ├── store-analyzer.ts        # 既存ストアDesignDNA解析
│   ├── seo-analyzer.ts          # SEO分析
│   └── analytics-service.ts     # 売上・商品分析
├── models/           # データアクセス層
│   ├── conversation.server.ts   # 会話CRUD
│   └── shop.server.ts           # ショップ設定
├── prompts/          # AIプロンプト定義
│   ├── system.ts               # システムプロンプト
│   └── templates.ts            # 会話テンプレート
├── components/       # UIコンポーネント
│   ├── ChatInterface.tsx       # チャット画面
│   ├── MessageBubble.tsx       # メッセージ表示
│   └── TemplateSelector.tsx    # テンプレート選択
├── types/            # TypeScript型定義
│   └── index.ts
└── locales/          # 国際化リソース
    └── ja.json
```

## 4. データフロー

### 4.1 AI会話フロー

```
ユーザー入力 → app.chat.$id.tsx (POST)
  → conversation.server.ts
    → token-manager.ts (予算チェック)
    → claude-client.ts (API呼び出し)
      → Anthropic API (Claude)
    ← ストリーミングレスポンス
  ← SSE (app.chat.$id.stream.tsx)
← リアルタイム表示 (ChatInterface.tsx)
```

### 4.2 ページ生成フロー

```
ユーザー要件 → 会話で確定
  → liquid-generator.ts
    → Claude API (コード生成)
    → section-schema.ts (スキーマ構築)
  → theme-deployer.ts
    → Shopify Theme Asset API (REST)
  → プレビューURL生成
```

### 4.3 ストア解析フロー

```
解析リクエスト → store-analyzer.ts
  → Shopify GraphQL API (テーマ取得)
  → Shopify REST API (アセット取得)
  → settings_data.json パース
  → DesignDNA抽出 (カラー, フォント, レイアウト)
  → DB保存 (StoreAnalysis)
```

## 5. 認証・セキュリティ

- Shopify OAuth 2.0フローによるアプリ認証
- セッション管理: PrismaSessionStorage (PostgreSQL)
- Webhook検証: Shopify HMAC署名検証
- APIキー: 環境変数で管理（.env）
- CORS: Shopify App Bridge経由のみ許可

## 6. スケーラビリティ考慮

- Claude APIコールは非同期・ストリーミング対応
- トークン使用量にプラン別上限を設定
- DBクエリはPrismaのインデックス最適化
- Redisによるセッション・キャッシュの外部化
- デプロイ先: Fly.io / Railway / Heroku対応
