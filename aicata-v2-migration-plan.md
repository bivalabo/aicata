# Aicata v2 — 開発環境リニューアル計画

## 現状の問題

1. **FUSE マウント問題**: Cowork VM → ホスト macOS のファイル同期が破綻。Turbopack が変更を検出できない
2. **ローカル SQLite**: スケーラビリティなし、マルチデバイス対応不可
3. **AI ページ生成**: 正常に機能していない
4. **デプロイ手段なし**: ライブ URL でテストやシェアができない

## 新しい技術スタック

### コア

| レイヤー | 技術 | 理由 |
|----------|------|------|
| フレームワーク | **Next.js 16** (App Router) | Turbopack 標準搭載。Vercel が開発元 |
| ホスティング | **Vercel** (Hobby→Pro) | Git push → 自動デプロイ。プレビュー URL 自動生成 |
| DB + Auth | **Supabase** (PostgreSQL) | 無料枠で十分。RLS、リアルタイム、Auth 内蔵 |
| ORM | **Prisma** (既存活用) | 型安全。SQLite → PostgreSQL はスキーマ変更のみ |
| コード管理 | **GitHub** | Vercel 自動デプロイのトリガー |
| AI | **Anthropic Claude API** + **Vercel AI SDK 6** | ストリーミング、ツールコール、Server Actions 対応 |

### ビジュアルエディタ

**Puck Editor** を推奨（GitHub ★12,200+、2026年3月も活発に開発中）

- React ネイティブ設計 — Next.js と自然に統合
- ドラッグ&ドロップのビジュアル編集
- カスタムコンポーネントを自由に定義可能
- JSON でシリアライズ → Supabase に保存 → Shopify Liquid に変換
- MIT ライセンス、ベンダーロックインなし
- AI 生成との相性が良い（JSON ベースなので Claude が直接操作可能）

**代替案: GrapesJS** — より成熟（★25,600+）だが、React ラッパーが必要で Vanilla JS ベース

### AI ページ生成のアーキテクチャ

```
ユーザー入力（自然言語）
    ↓
Claude API（Vercel AI SDK 6 経由）
    ↓
Brand Memory + 最新デザイントレンド参照
    ↓
Puck JSON コンポーネントツリー生成
    ↓
ビジュアルエディタでプレビュー＆編集
    ↓
Shopify Liquid テンプレートに変換
    ↓
Shopify API でデプロイ
```

**最先端デザインの維持方法:**
- Awwwards、Dribbble、Shopify テーマストアの優秀事例を定期的にクロール
- デザインパターンを構造化データとして蓄積（Supabase）
- Claude のプロンプトに最新トレンド情報を注入
- 業種×トーン別のデザインテンプレートライブラリを構築・更新

## 開発ワークフローの変化

### Before（現在）
```
Cowork VM でファイル編集
    ↓ FUSE マウント（壊れている）
ホスト macOS の Next.js dev サーバー
    ↓
localhost:3000 で確認
```

### After（新環境）
```
Cowork / VS Code / 任意のエディタでコード編集
    ↓
git push origin feature-branch
    ↓ Vercel が自動検出
プレビューデプロイ（一意の URL が即座に発行）
    ↓
ブラウザ / スマホで確認 → マージ → 本番デプロイ
```

**FUSE マウント問題は完全に消滅します。**

## 移行手順（フェーズ制）

### Phase 1: インフラ構築（今日〜）
1. GitHub リポジトリ作成 & 既存コードを push
2. Supabase プロジェクト作成
3. Prisma スキーマを SQLite → PostgreSQL に変更
4. Vercel プロジェクト作成 & GitHub 連携
5. 環境変数設定（Supabase URL、API キー等）
6. 初回デプロイ確認

### Phase 2: DB 移行 & Auth
1. Prisma マイグレーション実行（Supabase PostgreSQL）
2. Supabase Auth 設定（Shopify OAuth 連携）
3. 既存 API Routes を Supabase クライアントに移行
4. RLS ポリシー設定

### Phase 3: ビジュアルエディタ導入
1. Puck Editor インストール & 基本セットアップ
2. Shopify セクション対応のカスタムコンポーネント作成
   - ヒーロー、商品グリッド、テキスト＋画像、CTA、FAQなど
3. Puck JSON → Shopify Liquid 変換エンジン構築
4. エディタ UI を Aicata のデザインシステムに統合

### Phase 4: AI ページ生成の再構築
1. Vercel AI SDK 6 導入 & Server Actions 化
2. Brand Memory → Claude プロンプト統合
3. デザイントレンド参照システム構築
4. Claude → Puck JSON 直接生成フロー実装
5. 生成後のエディタ編集フロー統合

### Phase 5: 既存 UI/UX の移植
1. 現在のサイドバー、WelcomeScreen、設定画面をそのまま移植
2. デザインパッチ（パディング、フォントサイズ等）を直接コードに反映
3. Supabase からの会話履歴・Brand Memory 読み込み

## ファイル構成（新）

```
aicata/
├── app/                      # Shopify Remix アプリ（既存、変更なし）
├── web/                      # Next.js 16 フロントエンド
│   ├── src/
│   │   ├── app/              # App Router
│   │   ├── components/
│   │   │   ├── layout/       # Sidebar, Header（既存移植）
│   │   │   ├── chat/         # チャット UI（既存移植）
│   │   │   ├── editor/       # Puck ビジュアルエディタ（新規）
│   │   │   ├── settings/     # 設定画面（既存移植）
│   │   │   └── site-builder/ # サイト構築（既存移植）
│   │   ├── lib/
│   │   │   ├── supabase/     # Supabase クライアント
│   │   │   ├── ai/           # AI 生成エンジン
│   │   │   ├── shopify/      # Shopify API
│   │   │   └── editor/       # Puck コンポーネント定義
│   │   └── actions/          # Server Actions
│   ├── prisma/
│   │   └── schema.prisma     # PostgreSQL スキーマ
│   └── package.json
├── .github/
│   └── workflows/            # CI/CD（オプション）
└── vercel.json
```

## 最初にやること

**Phase 1 の Step 1〜6 を今すぐ実行可能です。**

必要な情報:
- GitHub リポジトリ名（例: `bivalabo/aicata`）
- Supabase プロジェクト URL & anon key
- Vercel でのプロジェクト名
