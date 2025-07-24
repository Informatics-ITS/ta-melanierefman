FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    bash \
    libzip-dev \
    zip \
    unzip \
    curl \
    git \
    oniguruma-dev \
    libpng-dev \
    libxml2-dev \
    mysql-client \
    nginx \
    supervisor \
    icu-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo_mysql mbstring zip gd intl

# Install Composer (copy from official image)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy full project (to ensure artisan is available)
COPY . .

# Install Composer dependencies (after artisan is available)
RUN composer install --no-dev --optimize-autoloader

# Set permissions for Laravel storage and cache folders
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copy custom Nginx and Supervisor configuration files
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisord.conf

# Copy entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port for PHP-FPM (optional, depending on nginx setup)
EXPOSE 9000

# Run supervisord via entrypoint
ENTRYPOINT ["entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]