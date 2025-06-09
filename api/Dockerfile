FROM php:8.2-cli

WORKDIR /var/www

RUN apt-get update \
    && apt-get install -y git unzip libzip-dev \
    && docker-php-ext-install pdo_mysql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-dev

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

COPY package*.json ./
RUN npm install && npm run build

COPY . .

EXPOSE 80

CMD ["php", "-S", "0.0.0.0:80", "-t", "public"]
