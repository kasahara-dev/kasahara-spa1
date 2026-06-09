data:
	docker compose exec php php artisan migrate:fresh
	docker compose exec php php artisan db:seed

test:
	-docker compose exec php php artisan test
	docker compose exec php php artisan dusk

init:
	docker compose up -d --build
	docker compose exec php composer install
	sleep 10
	cp laravel-next-app/src/.env.example laravel-next-app/src/.env
	docker compose exec php php artisan key:generate
	docker compose exec php php artisan storage:link
	docker compose exec php php artisan migrate:fresh
	docker compose exec php php artisan db:seed
	echo "CREATE DATABASE demo_test;"|docker compose exec -T mysql bash -c 'mysql -u root -proot'
	cp src/.env.testing.example src/.env.testing
	docker compose exec php php artisan key:generate --env=testing
	cp src/.env.testing src/.env.dusk.local
	sed -i 's/APP_URL=http:\/\/localhost/APP_URL=http:\/\/nginx/g' src/.env.dusk.local
	cp next-frontend-app/src/.env.example next-frontend-app/src/.env.local
	SECRET_KEY=$$(openssl rand -base64 32 | tr -d '\n'); \
	sed -i '' "s|NEXTAUTH_SECRET=|NEXTAUTH_SECRET=$${SECRET_KEY}|g" next-frontend-app/src/.env.local 2>/dev/null || \
	sed -i "s|NEXTAUTH_SECRET=|NEXTAUTH_SECRET=$${SECRET_KEY}|g" next-frontend-app/src/.env.local