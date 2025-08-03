FROM php:8.2-cli

WORKDIR /var/www/html

# Instalar dependencias del sistema
RUN apt-get update \
    && apt-get install -y git unzip libzip-dev curl gnupg libpng-dev libjpeg-dev \
    && docker-php-ext-install pdo_mysql zip gd

# Copiar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copiar solo los archivos de dependencias para cachearlas
COPY composer.* ./
RUN composer install --no-interaction --prefer-dist --no-dev --no-scripts

# Instalar Node.js y dependencias de frontend
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

COPY package*.json ./
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Compilar los assets
RUN npm run build

EXPOSE 80

# El CMD se sobreescribe en docker-compose.yml, así que este es solo un fallback
CMD ["php", "-S", "0.0.0.0:80", "-t", "public"]
