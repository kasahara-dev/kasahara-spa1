data:
	cd laravel-next-app && docker compose exec laravel.test php artisan migrate:fresh
	cd laravel-next-app && docker compose exec laravel.test php artisan db:seed

test:
	@echo "テスト用データベースのマイグレーションを実行中..."
	cd laravel-next-app && docker compose exec laravel.test php artisan migrate:fresh --seed --env=testing

	@echo "Playwright テストを実行中..."
	cd next-frontend-app && DB_DATABASE=testing_my_app npx playwright test

init:
	cd laravel-next-app && docker compose up -d --build
	cd laravel-next-app && docker compose exec laravel.test composer install
	sleep 10
	cp laravel-next-app/src/.env.example laravel-next-app/src/.env
	cd laravel-next-app && docker compose exec laravel.test php artisan key:generate
	cd laravel-next-app && docker compose exec laravel.test php artisan storage:link
	cd laravel-next-app && docker compose exec laravel.test php artisan migrate:fresh
	cd laravel-next-app && docker compose exec laravel.test php artisan db:seed