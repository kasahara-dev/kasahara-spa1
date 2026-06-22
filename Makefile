data:
	cd laravel-next-app && docker compose exec laravel.test php artisan migrate:fresh
	cd laravel-next-app && docker compose exec laravel.test php artisan db:seed

test:
	@echo "テスト用データベースのマイグレーションを実行中..."
	cd laravel-next-app && docker compose exec laravel.test php artisan migrate:fresh --seed --env=testing

	@echo "Playwright テストを実行中..."
	-cd next-frontend-app && CI=true DB_DATABASE=testing_my_app npx playwright test --workers=1

	@echo "PHPUnit テストを実行中..."
	cd laravel-next-app && docker compose exec laravel.test php artisan test

init:
	@echo "--- 初期設定ファイルを作成中 ---"
	@if [ ! -f laravel-next-app/src/.env ]; then \
		cp laravel-next-app/.env.example laravel-next-app/.env; \
	fi
	@if [ ! -f next-frontend-app/src/.env.local ]; then \
		cp next-frontend-app/.env.example next-frontend-app/.env.local; \
		SECRET_KEY=$$(openssl rand -base64 32); \
		sed -i "s|NEXTAUTH_SECRET=|NEXTAUTH_SECRET=$$SECRET_KEY|g" next-frontend-app/src/.env.local; \
	fi

	@echo "--- Docker コンテナをビルド中 ---"
	# 初回はビルドが必要なため、upの前にbuildを明示的に実行
	cd laravel-next-app && WWWUSER=$$(id -u) WWWGROUP=$$(id -g) docker compose build
	cd laravel-next-app && WWWUSER=$$(id -u) WWWGROUP=$$(id -g) docker compose up -d

	@echo "--- コンテナ内の初期セットアップを実行中 ---"
	# コンテナが起動するまで少し待機
	sleep 10
	cd laravel-next-app && docker compose exec -T laravel.test composer install
	cd laravel-next-app && docker compose exec -T laravel.test php artisan key:generate
	cd laravel-next-app && docker compose exec -T laravel.test php artisan storage:link
	cd laravel-next-app && docker compose exec -T laravel.test php artisan migrate:fresh --seed

	@echo "--- テスト用DBを作成中 ---"
	cd laravel-next-app && docker compose exec -T mysql bash -c 'mysql -u sail -ppassword -e "CREATE DATABASE IF NOT EXISTS testing_my_app;"'

	@echo "--- テスト環境の準備 ---"
	cp laravel-next-app/.env.testing.example laravel-next-app/.env.testing
	cd laravel-next-app && docker compose exec -T laravel.test php artisan key:generate --env=testing

	@echo "--- フロントエンドのインストール ---"
	cd next-frontend-app && npm install

	@echo "--- すべてのセットアップが完了しました！ ---"

up:
	@echo "バックエンド (Laravel Sail) を起動中..."
	cd laravel-next-app && WWWUSER=$$(id -u) WWWGROUP=$$(id -g) docker compose up -d
	@echo "フロントエンド (Next.js) を起動中..."
	cd next-frontend-app && npm run dev &
	@echo "すべての準備が整いました。ブラウザで確認してください。"

down:
	@echo "バックエンド (Laravel Sail) を停止中..."
	cd laravel-next-app && docker compose down
	@echo "フロントエンド (Next.js) を停止中..."
	-pkill -f "next-server" || true
	-pkill -f "next dev" || true
	-npx kill-port 3000
	@echo "すべてのプロセスが正常に停止しました。"