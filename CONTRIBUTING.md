# Aicata 開発ガイド

## ブランチ戦略

```
main (本番)
 └── develop (開発統合)
      ├── feat/xxx    — 新機能
      ├── fix/xxx     — バグ修正
      ├── refactor/xxx — リファクタリング
      └── chore/xxx   — 設定・CI・依存関係など
```

### ルール
- `main` への直接プッシュは禁止（PR 必須）
- `develop` からブランチを切り、`develop` へ PR を出す
- リリース時に `develop` → `main` へ PR
- ブランチ名は `種別/簡潔な説明` 形式（例: `feat/color-palette-ui`）

## コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/ja/) に準拠：

```
<種別>(<対象>): <概要>

<本文（任意）>
```

### 種別
| 種別 | 用途 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `refactor` | リファクタリング（機能変更なし） |
| `style` | コードスタイル変更（フォーマット等） |
| `docs` | ドキュメントのみ |
| `test` | テスト追加・修正 |
| `chore` | ビルド・CI・依存関係の変更 |
| `perf` | パフォーマンス改善 |

### 対象（スコープ）
| スコープ | 説明 |
|----------|------|
| `app` | Shopify Remix アプリ (`app/`) |
| `web` | Next.js Web アプリ (`web/`) |
| `ci` | GitHub Actions / CI 設定 |
| `prisma` | データベーススキーマ |

### 例
```
feat(web): カラーパレット選択UIを追加
fix(app): OAuth スコープの表示を修正
chore(ci): GitHub Actions CI ワークフローを追加
refactor(web): BrandMemoryView の保存ロジックを整理
```

## 開発フロー

### 1. ブランチ作成
```bash
git checkout develop
git pull origin develop
git checkout -b feat/my-feature
```

### 2. 開発 & コミット
```bash
# 変更をステージ
git add web/src/components/MyComponent.tsx

# コミット（規約に従う）
git commit -m "feat(web): MyComponent を追加"
```

### 3. プッシュ & PR
```bash
git push -u origin feat/my-feature
# GitHub で develop 宛に PR を作成
```

### 4. CI チェック
PR を出すと自動で以下が実行されます：
- TypeScript 型チェック
- ESLint
- ビルド確認

すべて通過してからマージしてください。

## プロジェクト構成

```
aicata/
├── app/              # Shopify Remix (埋め込みアプリ)
│   └── routes/       # Remix ルート
├── web/              # Next.js (独立 Web アプリ)
│   ├── src/
│   │   ├── app/      # Next.js App Router
│   │   ├── components/
│   │   └── lib/
│   └── prisma/       # DB スキーマ & マイグレーション
├── prisma/           # Shopify App 用 DB
├── docs/             # ドキュメント
└── .github/          # CI / テンプレート
```
