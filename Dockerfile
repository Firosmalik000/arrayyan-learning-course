### 1) Stage build frontend (Vite / Laravel Mix)
FROM node:20-alpine AS frontend

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


### 2) Stage runtime PHP + Apache
FROM php:8.4-apache

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libicu-dev \
    && docker-php-ext-install pdo pdo_mysql zip intl \
    && a2enmod rewrite

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
 && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

# Install PHP deps
RUN composer install --no-dev --optimize-autoloader

# Copy hasil build frontend ke public/build (untuk Vite)
COPY --from=frontend /app/public/build /var/www/html/public/build

# Cache (optional)
RUN php artisan config:cache || true \
 && php artisan route:cache || true \
 && php artisan view:cache || true

RUN chown -R www-data:www-data storage bootstrap/cache
