# AIcata V2 セットアップガイド
## SQLite から Supabase + Vercel への移行手順

---

## 📋 概要

このガイドでは、既存の Next.js 16 プロジェクトを SQLite から Supabase PostgreSQL + Vercel へ移行する手順を説明します。

### 変更内容
- **データベース**: SQLite → Supabase PostgreSQL
- **ホスティング**: ローカル開発 → Vercel
- **ORM**: Prisma (SQLite adapter) → Prisma (PostgreSQL)
- **認証**: Next Auth + Supabase SSR

---

## 🚀 セットアップ手順

### ステップ 1: Supabase プロジェクト作成

1. **Supabase に登録**
   - https://supabase.com にアクセス
   - GitHub または Google で登録

2. **新しいプロジェクトを作成**
   - ダッシュボードから「New Project」をクリック
   - プロジェクト名を入力（例：`aicata-prod`）
   - リージョンを選択（推奨：Tokyo または Singapore）
   - PostgreSQL パスワードを設定（安全なものを生成してください）
   - 「Create new project」をクリック

3. **接続情報を取得**
   - ダッシュボード → Settings → Database → Connection string
   - 以下の情報をコピー:
     - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon public key
     - `SUPABASE_SERVICE_ROLE_KEY`: Service role secret
     - `DATABASE_URL`: PostgreSQL connection string (pgbouncer)
     - `DIRECT_URL`: PostgreSQL connection string (direct)

   > **注意**: DATABASE_URL と DIRECT_URL は異なります
   > - DATABASE_URL: `?pgbouncer=true` が付いている（サーバーレス用）
   > - DIRECT_URL: direct connection（マイグレーション用）

---

### ステップ 2: GitHub リポジトリ準備

1. **ローカルリポジトリを初期化**（未初期化の場合）
   ```bash
   cd web/
   git init
   git add .
   git commit -m "chore: initial commit"
   ```

2. **GitHub でリポジトリを作成**
   - https://github.com/new
   - リポジトリ名を入力（例：`aicata-web`）
   - 「Create repository」をクリック

3. **ローカルリポジトリを push**
   ```bash
   git branch -M main
   git remote add origin https://github.com/your-username/aicata-web.git
   git push -u origin main
   ```

   > **重要**: `node_modules/` と `.env.local` は `.gitignore` に含まれていることを確認してください

---

### ステップ 3: Vercel プロジェクト作成

1. **Vercel ダッシュボードにアクセス**
   - https://vercel.com/dashboard

2. **新しいプロジェクトをインポート**
   - 「Add New...」 → 「Project」をクリック
   - 「Import Git Repository」をクリック
   - GitHub リポジトリを選択

3. **プロジェクト設定**
   - Project Name: 任意のプロジェクト名（例：`aicata-prod`）
   - Framework Preset: Next.js（自動検出されるはず）
   - Root Directory: `web/`（該当する場合のみ）
   - 「Import」をクリック

---

### ステップ 4: 環境変数を Vercel で設定

1. **プロジェクト設定にアクセス**
   - Vercel ダッシュボード → プロジェクト選択
   - Settings → Environment Variables

2. **以下の環境変数を追加**

   | 変数名 | 値 | 説明 |
   |--------|-----|------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | Supabase Anon Key |
   | `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | Service Role Key |
   | `DATABASE_URL` | `postgresql://...?pgbouncer=true` | Database URL (pgBouncer) |
   | `DIRECT_URL` | `postgresql://...` | Direct Database URL |
   | `ANTHROPIC_API_KEY` | `your-api-key` | Claude API Key |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` で生成 | NextAuth Secret |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` | アプリの本番 URL |
   | `SHOPIFY_API_KEY` | `your-key` | Shopify API Key |
   | `SHOPIFY_API_SECRET` | `your-secret` | Shopify API Secret |
   | `APP_URL` | `https://your-app.vercel.app` | アプリの本番 URL |

3. **本番とプレビュー環境を設定**
   - 各変数の Environment セクションで、本番環境のみに設定するか、すべての環境に設定するかを選択
   - 推奨: `NEXT_PUBLIC_*` 以外は本番環境のみ

4. **変更を保存**

---

### ステップ 5: ローカルでセットアップスクリプトを実行

1. **ローカル開発環境を準備**
   ```bash
   cd web/
   ```

2. **セットアップスクリプトを実行**
   ```bash
   bash scripts/v2-setup/setup.sh
   ```

   このスクリプトは以下を実行します:
   - 必要な npm パッケージをインストール
   - SQLite 依存関係を削除
   - `.env.example` をコピー
   - コードパッチを適用
   - Prisma クライアントを生成

3. **ローカル環境変数を設定**
   ```bash
   cp .env.example .env.local
   ```

   以下を編集して Supabase の認証情報を入力:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`
   - その他の API キー

---

### ステップ 6: Prisma マイグレーション実行

1. **マイグレーションをプッシュ**
   ```bash
   npm run db:push
   ```

   > 最初のセットアップの場合は `db:push` を使用
   > 既存のマイグレーションがある場合は `db:migrate` を使用

2. **Prisma Studio でデータベースを確認**
   ```bash
   npm run db:studio
   ```
   - http://localhost:5555 でデータベースビューアが開きます

---

### ステップ 7: ローカルで動作確認

1. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

2. **ブラウザで確認**
   - http://localhost:3000 にアクセス
   - アプリが正常に動作することを確認

3. **データベース接続を確認**
   - Supabase ダッシュボード → SQL Editor で、テーブルが作成されていることを確認

---

### ステップ 8: Vercel にデプロイ

1. **変更を GitHub にプッシュ**
   ```bash
   git add .
   git commit -m "chore: migrate SQLite to Supabase"
   git push origin main
   ```

2. **Vercel が自動デプロイ**
   - GitHub push で自動的に Vercel デプロイが開始
   - ダッシュボードで進捗を確認

3. **本番環境での確認**
   - Vercel のプロジェクト URL にアクセス
   - 機能が正常に動作することを確認

---

## 📝 使用可能なコマンド

セットアップ後、以下のコマンドが使用できます:

```bash
# 開発サーバー起動（通常）
npm run dev

# 開発サーバー起動（キャッシュをクリア）
npm run dev:fresh

# ビルド
npm run build

# 本番サーバー起動
npm start

# データベース管理
npm run db:push       # スキーマをデータベースにプッシュ
npm run db:migrate    # マイグレーションを実行
npm run db:studio     # Prisma Studio でデータベースを管理

# Linting
npm run lint
```

---

## 🔐 セキュリティチェックリスト

- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] Vercel で環境変数が設定されている
- [ ] Supabase のシークレットキーが GitHub にコミットされていない
- [ ] `NEXTAUTH_SECRET` が安全な値に設定されている
- [ ] 本番環境 URL が正しく設定されている

---

## 🐛 トラブルシューティング

### Q: "NEXT_PUBLIC_SUPABASE_URL is not defined" エラーが出る

**A**: `.env.local` ファイルが作成されていない、または環境変数が設定されていません。
```bash
cp .env.example .env.local
# .env.local を編集して Supabase 情報を入力
```

### Q: データベース接続エラーが出る

**A**: `DATABASE_URL` と `DIRECT_URL` が正しく設定されていることを確認:
- Supabase ダッシュボード → Settings → Database → Connection string で確認
- `DATABASE_URL` は `?pgbouncer=true` を含む（サーバーレス用）
- `DIRECT_URL` は含まない（マイグレーション用）

### Q: Prisma マイグレーション実行時に権限エラーが出る

**A**: `DIRECT_URL` を使用していることを確認。マイグレーションは直接接続が必要です。

### Q: Vercel デプロイ後、500 エラーが出る

**A**: Vercel のプロジェクト Settings → Function logs で詳細なエラーを確認してください。

---

## 📚 参考資料

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma PostgreSQL Documentation](https://www.prisma.io/docs/orm/overview/databases/postgresql)
- [Next.js Deployment on Vercel](https://nextjs.org/learn/dashboard-app/deploying-nextjs-app)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

---

## 📞 サポート

問題が発生した場合:

1. **Supabase コミュニティ**: https://discord.supabase.io
2. **Vercel サポート**: https://vercel.com/support
3. **Prisma コミュニティ**: https://www.prisma.io/community
4. **プロジェクトの Issue**: GitHub で issue を作成

---

**最終確認**: 上記すべてのステップが完了したら、本番環境で完全にテストしてください。

Happy deploying! 🚀
