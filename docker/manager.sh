#!/bin/bash
set -e

# Directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

### Configuración WEB ###
WEB_PUBLIC_PATH="$PROJECT_ROOT/web/public"
WEB_UPLOADS="uploads"
WEB_TAR="$WEB_PUBLIC_PATH/web_uploads.tar.gz"
WEB_CONTAINER="boombang-html5-web-1"

### Configuración API ###
API_PUBLIC_PATH="$PROJECT_ROOT/api/public"
API_UPLOADS="uploads"
API_TAR="$API_PUBLIC_PATH/api_uploads.tar.gz"
API_CONTAINER="boombang-html5-api-1"

function copiar_desde_contenedor() {
  local CONTAINER=$1
  local RUTA_CONT=$2
  local TAR_PATH=$3
  local UPLOADS_DIR=$4
  local OWNER=$5

  echo " → Creando tar dentro de $CONTAINER..."
  sudo docker exec "$CONTAINER" \
    tar czf /tmp/${UPLOADS_DIR}.tar.gz -C "$RUTA_CONT" "$UPLOADS_DIR"

  echo " → Copiando /tmp/${UPLOADS_DIR}.tar.gz al host..."
  sudo docker cp "$CONTAINER":/tmp/${UPLOADS_DIR}.tar.gz "$TAR_PATH"

  echo " → Extrayendo en host forzando owner=${OWNER}:${OWNER}..."
  sudo tar \
    --no-same-owner \
    --owner="$OWNER" \
    --group="$OWNER" \
    -xzf "$TAR_PATH" \
    -C "$(dirname "$TAR_PATH")"

  echo " → Limpiando tar en host y contenedor..."
  sudo rm "$TAR_PATH"
  sudo docker exec "$CONTAINER" rm /tmp/${UPLOADS_DIR}.tar.gz

  echo "   ✔ Hecho: $UPLOADS_DIR ahora es ${OWNER}:${OWNER} en host."
}

function copiar_a_contenedor() {
  local CONTAINER=$1
  local RUTA_CONT=$2
  local TAR_PATH=$3
  local UPLOADS_DIR=$4
  local HOST_PATH_DIR
  HOST_PATH_DIR="$(dirname "$TAR_PATH")"

  echo " → Validando carpeta en host..."
  if [ ! -d "$HOST_PATH_DIR/$UPLOADS_DIR" ] || [ -z "$(ls -A "$HOST_PATH_DIR/$UPLOADS_DIR")" ]; then
    echo "   ✖ Error: '$HOST_PATH_DIR/$UPLOADS_DIR' no existe o está vacío."
    return 1
  fi

  echo " → Contenido a copiar:"
  ls -la "$HOST_PATH_DIR/$UPLOADS_DIR"

  echo " → Creando tar en host..."
  (cd "$HOST_PATH_DIR" && sudo tar czf "$(basename "$TAR_PATH")" "$UPLOADS_DIR")
  sudo mv "$HOST_PATH_DIR/$(basename "$TAR_PATH")" "$TAR_PATH"

  echo " → Copiando tar al contenedor..."
  sudo docker cp "$TAR_PATH" "$CONTAINER":/tmp/${UPLOADS_DIR}.tar.gz

  echo " → Extrayendo dentro del contenedor y ajustando permisos..."
  sudo docker exec "$CONTAINER" bash -c "
    tar xzf /tmp/${UPLOADS_DIR}.tar.gz -C $RUTA_CONT && \
    rm /tmp/${UPLOADS_DIR}.tar.gz && \
    chown -R www-data:www-data $RUTA_CONT/$UPLOADS_DIR && \
    chmod -R 755 $RUTA_CONT/$UPLOADS_DIR
  "

  echo " → Limpiando tar en host..."
  sudo rm "$TAR_PATH"

  echo "   ✔ Hecho: $UPLOADS_DIR actualizado en contenedor $CONTAINER."
}

while true; do
  echo
  echo "Seleccione una opción:"
  echo " 1) Salir"
  echo " 2) WEB: Docker → Host (Copiando uploads)"
  echo " 3) WEB: Host → Docker (Copiando uploads)"
  echo " 4) API: Docker → Host (Copiando uploads)"
  echo " 5) API: Host → Docker (Copiando uploads)"
  echo " 6) Deploy client"
  echo " 7) Clear cache docker"
  echo " 8) UP Containers"
  echo " 9) Deploy api"
  echo " 10) Deploy web"
  read -p "Opción: " opt
  echo

  case $opt in
    1)
      echo "Saliendo..."
      break
      ;;
    2)
      echo "==> Copiando WEB uploads desde contenedor al host..."
      copiar_desde_contenedor "$WEB_CONTAINER" "/var/www/html/public" "$WEB_TAR" "$WEB_UPLOADS" "data"
      ;;
    3)
      echo "==> Copiando WEB uploads desde host al contenedor..."
      copiar_a_contenedor "$WEB_CONTAINER" "/var/www/html/public" "$WEB_TAR" "$WEB_UPLOADS"
      ;;
    4)
      echo "==> Copiando API uploads desde contenedor al host..."
      copiar_desde_contenedor "$API_CONTAINER" "/var/www/html/public" "$API_TAR" "$API_UPLOADS" "data"
      ;;
    5)
      echo "==> Copiando API uploads desde host al contenedor..."
      copiar_a_contenedor "$API_CONTAINER" "/var/www/html/public" "$API_TAR" "$API_UPLOADS"
      ;;
    6)
      echo "==> Deploy client..."
      sudo docker stop boombang-html5-server-1
      sudo docker compose build client && sudo docker compose up -d client
      sudo docker restart boombang-html5-server-1
      ;;
    7)
      echo "==> Clear cache docker..."
      sudo docker builder prune -af && sudo docker image prune -af
      ;;
    8)
      echo "==> UP Containers..."
      sudo docker start $(sudo docker ps -a -q)
      sudo docker restart boombang-html5-web-1
      sudo docker restart boombang-html5-server-1
      ;;
    9)
      echo "==> Deploy api..."
      sudo docker stop boombang-html5-server-1
      sudo docker compose build api
      sudo docker compose up -d api
      sudo docker exec boombang-html5-api-1 php artisan migrate --force
      sudo docker exec boombang-html5-api-1 php artisan passport:install
      sudo docker restart boombang-html5-server-1
      ;;
    10)
      echo "==> Deploy web..."
      sudo docker compose build web
      sudo docker compose up -d web
      sudo docker compose exec web composer install --no-dev --prefer-dist -n
      ;;
    *)
      echo "Opción inválida, inténtalo de nuevo."
      ;;
  esac
done
