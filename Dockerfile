FROM php:8.4-apache

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libicu-dev \
  && docker-php-ext-install pdo pdo_mysql zip intl \
  && a2enmod rewrite \
  && rm -rf /var/lib/apt/lists/*

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
 && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

WORKDIR /var/www/html
COPY . .

# IMPORTANT: di repo yang kamu copy ke VPS harus SUDAH ADA vendor/ dan public/build
RUN php artisan config:cache || true \
 && php artisan route:cache || true \
 && php artisan view:cache || true

RUN chown -R www-data:www-data storage bootstrap/cache
