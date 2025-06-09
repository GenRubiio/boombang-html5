FROM php:8.2-cli

WORKDIR /var/www

RUN apt-get update \
    && apt-get install -y git unzip libzip-dev curl gnupg \
    && docker-php-ext-install pdo_mysql zip

# Copiar Composer desde imagen oficial
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copiar todos los archivos del proyecto (incluye artisan y app/)
COPY . .

# Instalar dependencias de Laravel
RUN composer install --no-interaction --prefer-dist --no-dev

# Instalar Node.js (para frontend)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Instalar dependencias frontend y compilar
RUN npm install && npm run build

EXPOSE 80

# Iniciar servidor embebido de Laravel
CMD ["php", "-S", "0.0.0.0:80", "-t", "public"]
