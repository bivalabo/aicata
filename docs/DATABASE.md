# Aicata データベース設計書

## 概要

PostgreSQL + Prisma ORMによるデータ永続化。
Shopifyセッション管理もDB経由（PrismaSessionStorage）。

## ER図（概念）

```
Session (Shopify管理)
  │
Shop ─────────────────── StoreAnalysis (1:1)
  │
  ├── Conversation ──── Message (1:N)
  │
  ├── Template ──────── Section (1:N)
  │
  └── PromptTemplate
```

## モデル詳細

### Session（Shopifyセッション）

Shopify App Remixが自動管理するセッションテーブル。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | String (PK) | セッションID |
| shop | String | ストアドメイン |
| state | String | OAuth state |
| isOnline | Boolean | オンラインセッションか |
| scope | String? | 許可スコープ |
| expires | DateTime? | 有効期限 |
| accessToken | String | アクセストークン |
| userId | BigInt? | ShopifyユーザーID |

### Shop（ストア設定）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | String (PK) | CUID |
| domain | String (Unique) | myshop.myshopify.com |
| name | String? | ストア表示名 |
| plan | String | free / pro / enterprise |
| preferredModel | String? | Claude使用モデル |
| brandTone | String? | ブランドトーン |
| monthlyTokens | Int | 今月の使用トークン数 |
| tokenLimit | Int | トークン上限 |
| tokenResetAt | DateTime? | トークンリセット日 |
| installedAt | DateTime | アプリインストール日 |
| createdAt | DateTime | 作成日 |
| updatedAt | DateTime | 更新日 |

### Conversation（会話）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | String (PK) | CUID |
| shopId | String (FK) | Shop.id |
| title | String? | 会話タイトル（自動生成） |
| type | Enum | PAGE_DESIGN / SEO等 |
| status | Enum | ACTIVE / ARCHIVED等 |
| metadata | Json? | 追加メタデータ |
| createdAt | DateTime | 作成日 |
| updatedAt | DateTime | 更新日 |

**ConversationType enum:**
PAGE_DESIGN, PAGE_EDIT, SEO_OPTIMIZATION, STORE_ANALYSIS, MARKETING, GENERAL

### Message（メッセージ）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | String (PK) | CUID |
| conversationId | String (FK) | Conversation.id |
| role | Enum | USER / ASSISTANT / SYSTEM |
| content | String | メッセージ本文 |
| tokenCount | Int? | 消費トークン数 |
| metadata | Json? | コードブロック情報等 |
| createdAt | DateTime | 作成日 |

### Template（テンプレート）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | String (PK) | CUID |
| shopId | String (FK) | Shop.id |
| name | String | テンプレート名 |
| type | Enum | LANDING_PAGE等 |
| status | Enum | DRAFT / PUBLISHED等 |
| liquidCode | String? | 生成されたLiquid |
| cssCode | String? | CSS |
| jsCode | String? | JavaScript |
| themeId | String? | デプロイ先テーマID |
| deployedAt | DateTime? | デプロイ日時 |
| createdAt | DateTime | 作成日 |
| updatedAt | DateTime | 更新日 |

### Section（セクション）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | String (PK) | CUID |
| templateId | String (FK) | Template.id |
| name | String | セクション名 |
| type | String | hero / features等 |
| schemaJson | Json | Online Store 2.0スキーマ |
| liquidContent | String? | Liquidコード |
| order | Int | 表示順 |
| createdAt | DateTime | 作成日 |

### StoreAnalysis（ストア解析結果）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | String (PK) | CUID |
| shopId | String (FK, Unique) | Shop.id |
| themeId | String | テーマGID |
| themeName | String | テーマ名 |
| colorPalette | Json? | 抽出カラー情報 |
| typography | Json? | フォント情報 |
| layoutPatterns | Json? | レイアウト特徴 |
| brandTone | String? | ブランドトーン推定 |
| pageStructure | Json? | ページ構造情報 |
| analyzedAt | DateTime | 解析日時 |
| createdAt | DateTime | 作成日 |

### PromptTemplate（プロンプトテンプレート）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | String (PK) | CUID |
| shopId | String (FK) | Shop.id |
| category | Enum | PAGE_CREATION等 |
| name | String | テンプレート名 |
| prompt | String | プロンプト本文 |
| isDefault | Boolean | デフォルトか |
| createdAt | DateTime | 作成日 |
| updatedAt | DateTime | 更新日 |

## インデックス戦略

- `Shop.domain` — UNIQUE（ストア検索の高速化）
- `Conversation.shopId` + `status` — 複合（アクティブ会話の取得）
- `Message.conversationId` + `createdAt` — 複合（時系列表示）
- `Template.shopId` + `status` — 複合（テンプレート一覧）
- `StoreAnalysis.shopId` — UNIQUE（1ストア1解析）

## マイグレーション手順

```bash
# スキーマ変更後
npx prisma migrate dev --name describe_change

# 本番デプロイ時
npx prisma migrate deploy

# クライアント再生成
npx prisma generate
```
