data:
	cd laravel-next-app && docker compose exec laravel.test php artisan migrate:fresh
	cd laravel-next-app && docker compose exec laravel.test php artisan db:seed

test:
	@echo "テスト用データベースのマイグレーションを実行中..."
	cd laravel-next-app && docker compose exec laravel.test php artisan migrate:fresh --seed --env=testing

	@echo "Playwright テストを実行中..."
	-cd next-frontend-app && DB_DATABASE=testing_my_app npx playwright test

	@echo "PHPUnit テストを実行中..."
	cd laravel-next-app && docker compose exec laravel.test php artisan test

init:
	cd laravel-next-app && WWWUSER=$$(id -u) WWWGROUP=$$(id -g) docker compose up -d --build
	cd laravel-next-app && docker compose exec laravel.test composer install
	sleep 10
	cp laravel-next-app/src/.env.example laravel-next-app/src/.env
	cd laravel-next-app && docker compose exec laravel.test php artisan key:generate
	cd laravel-next-app && docker compose exec laravel.test php artisan storage:link
	cd laravel-next-app && docker compose exec laravel.test php artisan migrate:fresh
	cd laravel-next-app && docker compose exec laravel.test php artisan db:seed
	cd laravel-next-app && echo "CREATE DATABASE IF NOT EXISTS demo_test;" | docker compose exec -T mysql bash -c 'mysql -u sail -ppassword'
	cp laravel-next-app/src/.env.testing.example laravel-next-app/src/.env.testing
	cd laravel-next-app && docker compose exec laravel.test php artisan key:generate --env=testing
	cp laravel-next-app/src/.env.testing laravel-next-app/src/.env.dusk.local
	sed -i 's/APP_URL=http:\/\/localhost/APP_URL=http:\/\/nginx/g' laravel-next-app/src/.env.dusk.local
	cp next-frontend-app/src/.env.example next-frontend-app/src/.env.local
	SECRET_KEY=$$(openssl rand -base64 32 | tr -d '\n'); \
	sed -i '' "s|NEXTAUTH_SECRET=|NEXTAUTH_SECRET=$${SECRET_KEY}|g" next-frontend-app/src/.env.local 2>/dev/null || \
	sed -i "s|NEXTAUTH_SECRET=|NEXTAUTH_SECRET=$${SECRET_KEY}|g" next-frontend-app/src/.env.local

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