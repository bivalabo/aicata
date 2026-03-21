#!/bin/bash
# Aicata 起動スクリプト
# 使い方: bash start.sh

cd "$(dirname "$0")"

echo "🚀 Aicata を起動しています..."

# node_modules がなければインストール
if [ ! -d "node_modules" ]; then
  echo "📦 依存パッケージをインストール中..."
  npm install
fi

# Prisma Client を生成
if [ ! -d "node_modules/.prisma" ]; then
  echo "🗄️  Prisma Client を生成中..."
  npx prisma generate
fi

# データベースファイルがなければ作成
if [ ! -f "prisma/data/aicata.db" ]; then
  echo "🗄️  データベースを初期化中..."
  mkdir -p prisma/data
  npx prisma db push --url "file:./prisma/data/aicata.db"
fi

echo ""
echo "✨ Aicata を起動します"
echo ""

npm run dev
