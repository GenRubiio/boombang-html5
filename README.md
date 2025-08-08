# BoomBang HTML5

Este proyecto es una recreación de BoomBang que incluye diferentes servicios:

- **api/** una API REST construida con Laravel  
- **web/** la web principal de BoomBang también basada en Laravel  
- **server/** el emulador del juego escrito en Node.js  
- **client/** cliente en HTML5 usando Vue 3, Vite y Phaser  
- **launcher/** lanzador de escritorio con Electron

El entorno de desarrollo está preparado para ejecutarse mediante Docker y `docker-compose`.

## Requisitos

- Docker  
- Docker Compose v2

## Puesta en marcha rápida

1. Clona este repositorio.  
2. Ejecuta `docker compose up --build` para compilar las imágenes y levantar todos los servicios.  
3. Vuelve a levantar la imagen de 'server' con `docker compose build server` si se encuentra apagado.  
4. Ejecutar migraciones y sembrar la base de datos con:  
   ```bash
   docker compose exec api php artisan migrate --force --no-interaction --seed
   ```
   ```bash
   docker compose exec web php artisan migrate --force --no-interaction --seed
   ```
5. Accede al juego en [http://play.boombang.com](http://play.boombang.com).

## Help

Para limitar el consumo de RAM de Docker, puedes ajustar la configuración de Docker Desktop. Ve a "Settings" > "Resources" y ajusta el límite de memoria según tus necesidades. También puedes usar la opción `--memory` al iniciar contenedores específicos con `docker run`, por ejemplo:

```bash
docker run --memory=512m api
```

Comandos útiles para gestionar el entorno:

```bash
docker compose up -d                  # Levanta los servicios en segundo plano
docker compose down                  # Detiene y elimina los contenedores
docker compose logs -f              # Muestra los logs de todos los servicios
docker system df                    # Muestra el uso de espacio en disco por Docker
docker stop $(docker ps -aq)        # Detiene todos los contenedores en ejecución
docker rm $(docker ps -aq)          # Elimina todos los contenedores detenidos
docker rmi $(docker images -q) --force # Elimina todas las imágenes
docker volume rm $(docker volume ls -q) # Elimina todos los volúmenes
docker builder prune --all --force  # Limpia el caché de compilación
docker stats                        # Ver estadísticas en tiempo real de todos los contenedores
docker system df                    # Ver uso de disco
```

Eliminar todo lo relacionado con Docker ejecutando el archivo `docker-clean.ps1` en PowerShell:

```powershell
.\docker-clean.ps1
```

Los contenedores lanzarán los siguientes servicios:

- **MariaDB** para las bases de datos `boombang_api` y `boombang_web`.
- **nginx-proxy** para exponer cada servicio mediante dominios virtuales.
- **api** disponible en `http://api.boombang.com`.
- **web** disponible en `http://boombang.com`.
- **server** (emulador) disponible en `http://server.boombang.com:3000`.
- **client** (juego) disponible en `http://play.boombang.com:5173`.

## Configuración de hosts en Windows

Para que los dominios funcionen correctamente en Windows es necesario añadir las siguientes líneas en el archivo `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1 boombang.com
127.0.0.1 api.boombang.com
127.0.0.1 server.boombang.com
127.0.0.1 play.boombang.com
```

## Despliegue manual (Deploy)

Si estás desplegando el proyecto en un servidor (por ejemplo, VPS), puedes seguir los siguientes pasos para aplicar migraciones, instalar Passport y cachear la configuración:

```bash
# API
sudo docker exec -it boombang-html5-api-1 bash
php artisan migrate --seed
php artisan passport:install
php artisan config:cache

# Reiniciar el servidor del juego
sudo docker restart boombang-html5-server-1

# WEB
sudo docker start boombang-html5-web-1
sudo docker exec -it boombang-html5-web-1 bash
php artisan migrate --seed
php artisan config:cache
sudo docker exec -it boombang-html5-web-1 php artisan optimize:clear
```

## Licencia

Consulta el archivo [LICENSE.txt](LICENSE.txt) para obtener información sobre la licencia y las restricciones de uso.