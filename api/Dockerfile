FROM php:8.2-cli

WORKDIR /var/www

# Instala dependencias del sistema
RUN apt-get update \
    && apt-get install -y git unzip libzip-dev curl gnupg \
    && docker-php-ext-install pdo_mysql zip

# Instala Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copia todo el proyecto (¡esto incluye artisan!)
COPY . .

# Instala dependencias PHP (Laravel)
RUN composer install --no-interaction --prefer-dist --no-dev

# Instala Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Instala dependencias JavaScript y compila frontend
RUN npm install && npm run build

EXPOSE 80

CMD ["php", "-S", "0.0.0.0:80", "-t", "public"]
