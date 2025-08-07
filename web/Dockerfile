FROM php:8.2-cli

WORKDIR /var/www/html

# Paquetes del sistema (añadimos libwebp-dev y freetype)
RUN apt-get update \
    && apt-get install -y \
        git unzip curl gnupg \
        libzip-dev \
        libpng-dev libjpeg-dev libwebp-dev libfreetype6-dev \
    # Configurar e instalar extensiones PHP
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) gd pdo_mysql zip pcntl bcmath exif \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Dependencias PHP (cache)
COPY composer.* ./ 
COPY auth.json ./ 
RUN composer install --no-interaction --prefer-dist --no-dev --no-scripts -vvv

# Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get update && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Frontend deps
COPY package*.json ./
RUN npm install

# Código app
COPY . .

# Build assets
RUN npm run build

EXPOSE 80
CMD ["php", "-S", "0.0.0.0:80", "-t", "public"]
