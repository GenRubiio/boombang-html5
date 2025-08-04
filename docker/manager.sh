#!/bin/bash
set -e

# Get the directory of this script to build robust paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# The project root is one level up from the 'docker' directory where the script lives
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

WEB_PUBLIC_PATH="$PROJECT_ROOT/boombang-html5/web/public"
UPLOADS_DIR_NAME="uploads"
UPLOADS_TAR_PATH="$WEB_PUBLIC_PATH/uploads.tar.gz"

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
            sudo docker exec -it boombang-html5-web-1 bash -c \
                "cd /var/www/html/public && tar czf uploads.tar.gz $UPLOADS_DIR_NAME"
            # 2. Copiamos el tarball desde el contenedor al host
            sudo docker cp \
                "boombang-html5-web-1:/var/www/html/public/uploads.tar.gz" \
                "$WEB_PUBLIC_PATH/"
            # 3. En el host, extraemos sin preservar propietarios y luego ajustamos ownership
            (
              cd "$WEB_PUBLIC_PATH"
              sudo tar --no-same-owner xzf "uploads.tar.gz"
              sudo rm "uploads.tar.gz"
              sudo chown -R data:data "$UPLOADS_DIR_NAME"
            )
            echo "Copia completada."
            ;;
        2)
            echo "Copiando archivos del repositorio al Docker..."
            
            if [ ! -d "$WEB_PUBLIC_PATH/$UPLOADS_DIR_NAME" ] || [ -z "$(ls -A "$WEB_PUBLIC_PATH/$UPLOADS_DIR_NAME")" ]; then
                echo "Error: El directorio '$WEB_PUBLIC_PATH/$UPLOADS_DIR_NAME' no existe o está vacío."
                echo "No hay nada que copiar."
                continue
            fi

            echo "Contenido a copiar:"
            ls -la "$WEB_PUBLIC_PATH/$UPLOADS_DIR_NAME"

            # 1. En el host, creamos el tarball
            (cd "$WEB_PUBLIC_PATH" && tar czf "$UPLOADS_TAR_PATH" "$UPLOADS_DIR_NAME")

            if [ ! -f "$UPLOADS_TAR_PATH" ]; then
                echo "Error: No se pudo crear el archivo tar '$UPLOADS_TAR_PATH'."
                continue
            fi

            # 2. Copiamos el tarball del host al contenedor
            sudo docker cp \
                "$UPLOADS_TAR_PATH" \
                "boombang-html5-web-1:/var/www/html/public/"
            # 3. En el contenedor, lo extraemos y ajustamos permisos a www-data
            sudo docker exec -it boombang-html5-web-1 bash -c \
                "cd /var/www/html/public && \
                 tar xzf uploads.tar.gz && \
                 rm uploads.tar.gz && \
                 chown -R www-data:www-data $UPLOADS_DIR_NAME && \
                 chmod -R 755 $UPLOADS_DIR_NAME"
            # 4. Limpiamos el tarball del host
            rm "$UPLOADS_TAR_PATH"
            echo "Copia completada."
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
