# ============================================================
#  BIVALABO 開発コマンド集
#  使い方: make [コマンド名]
# ============================================================

.PHONY: up down dev setup db-reset db-studio logs clean help

# デフォルト: ヘルプ表示
help:
	@echo ""
	@echo "  BIVALABO 開発コマンド"
	@echo "  ━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "  make up          Docker起動（DB + Redis）"
	@echo "  make down        Docker停止"
	@echo "  make dev         アプリ開発サーバー起動"
	@echo "  make setup       初回セットアップ（npm install + DB作成）"
	@echo "  make db-reset    DB初期化（全データ削除）"
	@echo "  make db-studio   Prisma Studio起動（DB管理UI）"
	@echo "  make logs        Dockerログ表示"
	@echo "  make clean       全コンテナ・ボリューム削除"
	@echo ""

# Docker Compose 起動
up:
	docker compose -f docker-compose.dev.yml up -d
	@echo "✓ PostgreSQL: localhost:5432"
	@echo "✓ Redis: localhost:6379"

# Docker Compose 停止
down:
	docker compose -f docker-compose.dev.yml down

# アプリ開発サーバー
dev: up
	npm run dev

# 初回セットアップ
setup:
	npm install
	cp -n .env.template .env 2>/dev/null || true
	docker compose -f docker-compose.dev.yml up -d
	@echo "⏳ DB起動待ち..."
	@sleep 3
	npx prisma migrate dev --name init
	npx prisma generate
	@echo ""
	@echo "✓ セットアップ完了！"
	@echo "  .env ファイルの SHOPIFY_API_KEY, SHOPIFY_API_SECRET, ANTHROPIC_API_KEY を設定してください"
	@echo "  設定後: make dev でアプリを起動"

# DB初期化
db-reset:
	npx prisma migrate reset --force

# Prisma Studio
db-studio: up
	npx prisma studio

# ログ表示
logs:
	docker compose -f docker-compose.dev.yml logs -f

# 全削除
clean:
	docker compose -f docker-compose.dev.yml down -v
	@echo "✓ コンテナとボリュームを削除しました"
