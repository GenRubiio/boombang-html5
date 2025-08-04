#!/bin/bash
set -e

# Directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

WEB_PUBLIC_PATH="$PROJECT_ROOT/boombang-html5/web/public"
UPLOADS_DIR_NAME="uploads"
UPLOADS_TAR_PATH="$WEB_PUBLIC_PATH/uploads.tar.gz"
CONTAINER_NAME="boombang-html5-web-1"

while true; do
    echo "Seleccione una opción:"
    echo "1. Copiar '$UPLOADS_DIR_NAME' del Docker al repositorio (WEB)"
    echo "2. Copiar '$UPLOADS_DIR_NAME' del repositorio al Docker (WEB)"
    echo "3. Salir"
    read -p "Opción: " opt
    case $opt in

        1)
            echo "Copiando archivos del Docker al repositorio..."
            # 1. Creamos el tarball dentro del contenedor
            sudo docker exec "$CONTAINER_NAME" \
                tar czf /tmp/uploads.tar.gz -C /var/www/html/public "$UPLOADS_DIR_NAME"

            # 2. Lo copiamos al host
            sudo docker cp "$CONTAINER_NAME":/tmp/uploads.tar.gz "$UPLOADS_TAR_PATH"

            # 3. En el host, extraemos forzando owner=data:group=data
            sudo tar \
                --no-same-owner \
                --owner=data \
                --group=data \
                -xzf "$UPLOADS_TAR_PATH" \
                -C "$WEB_PUBLIC_PATH"

            # 4. Limpiamos
            sudo rm "$UPLOADS_TAR_PATH"

            echo "Copia completada. '$UPLOADS_DIR_NAME' ahora es data:data."
            ;;

        2)
            echo "Copiando archivos del repositorio al Docker..."

            # Validación
            if [ ! -d "$WEB_PUBLIC_PATH/$UPLOADS_DIR_NAME" ] || [ -z "$(ls -A "$WEB_PUBLIC_PATH/$UPLOADS_DIR_NAME")" ]; then
                echo "Error: '$WEB_PUBLIC_PATH/$UPLOADS_DIR_NAME' no existe o está vacío."
                continue
            fi

            echo "Contenido a copiar:"
            ls -la "$WEB_PUBLIC_PATH/$UPLOADS_DIR_NAME"

            # 1. Creamos el tarball en el host
            (cd "$WEB_PUBLIC_PATH" && sudo tar czf "uploads.tar.gz" "$UPLOADS_DIR_NAME")
            sudo mv "$WEB_PUBLIC_PATH/uploads.tar.gz" "$UPLOADS_TAR_PATH"

            # 2. Lo copiamos al contenedor
            sudo docker cp "$UPLOADS_TAR_PATH" "$CONTAINER_NAME":/tmp/uploads.tar.gz

            # 3. Extraemos y ajustamos permisos dentro del contenedor
            sudo docker exec "$CONTAINER_NAME" bash -c "
                tar xzf /tmp/uploads.tar.gz -C /var/www/html/public && \
                rm /tmp/uploads.tar.gz && \
                chown -R www-data:www-data /var/www/html/public/$UPLOADS_DIR_NAME && \
                chmod -R 755 /var/www/html/public/$UPLOADS_DIR_NAME
            "

            # 4. Limpiamos el tarball del host
            sudo rm "$UPLOADS_TAR_PATH"

            echo "Copia completada dentro del contenedor."
            ;;

        3)
            echo "Saliendo..."
            break
            ;;

        *)
            echo "Opción inválida"
            ;;
    esac
done
