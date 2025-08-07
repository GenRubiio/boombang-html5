FROM php:8.2-cli

WORKDIR /var/www

# Paquetes del sistema + libs para GD con WebP/JPEG/Freetype
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
    && docker-php-ext-install -j$(nproc) gd pdo_mysql zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copiar el proyecto (incluye artisan)
COPY . .

# Dependencias PHP (Laravel)
RUN composer install --no-interaction --prefer-dist --no-dev

# Node.js 18 (si tu API realmente necesita compilar assets)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get update && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Frontend (si no usas assets en la API, puedes quitar estas dos líneas)
RUN npm install && npm run build

EXPOSE 80
CMD ["php", "-S", "0.0.0.0:80", "-t", "public"]
