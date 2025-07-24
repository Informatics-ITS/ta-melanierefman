#!/bin/sh

# Wait for DB port to be open
until nc -z -v -w30 db 3306
do
  echo "Waiting for database connection..."
  sleep 5
done

# Clear config cache
php artisan config:clear

# Laravel cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migrate dan seed
php artisan migrate --force
php artisan db:seed --force

# Link storage
if [ ! -L "public/storage" ]; then
  php artisan storage:link
fi

# Clear config cache
php artisan config:clear

exec "$@"