#!/bin/bash
set -e

# Get the directory of this script to build robust paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# The project root is one level up from the 'docker' directory where the script lives
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

WEB_PUBLIC_PATH="$PROJECT_ROOT/web/public"
UPLOADS_DIR_NAME="uploads"
UPLOADS_SOURCE_PATH="$WEB_PUBLIC_PATH/$UPLOADS_DIR_NAME"
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
            # Create a tarball inside the container
            sudo docker exec -it boombang-html5-web-1 bash -c "cd /var/www/html/public && tar czf uploads.tar.gz $UPLOADS_DIR_NAME"
            # Copy the tarball from the container to the host
            sudo docker cp "boombang-html5-web-1:/var/www/html/public/uploads.tar.gz" "$WEB_PUBLIC_PATH/"
            # On the host, extract the tarball and then remove it
            (cd "$WEB_PUBLIC_PATH" && tar xzf "uploads.tar.gz" && rm "uploads.tar.gz")
            echo "Copia completada."
            ;;
        2)
            echo "Copiando archivos del repositorio al Docker..."
            
            if [ ! -d "$UPLOADS_SOURCE_PATH" ] || [ -z "$(ls -A "$UPLOADS_SOURCE_PATH")" ]; then
                echo "Error: El directorio '$UPLOADS_SOURCE_PATH' no existe o está vacío."
                echo "No hay nada que copiar."
                continue
            fi

            echo "Contenido a copiar:"
            ls -la "$UPLOADS_SOURCE_PATH"

            # On the host, create the tarball
            (cd "$WEB_PUBLIC_PATH" && tar czf "$UPLOADS_TAR_PATH" "$UPLOADS_DIR_NAME")

            if [ ! -f "$UPLOADS_TAR_PATH" ]; then
                echo "Error: No se pudo crear el archivo tar '$UPLOADS_TAR_PATH'."
                continue
            fi

            # Copy the tarball from the host to the container
            sudo docker cp "$UPLOADS_TAR_PATH" "boombang-html5-web-1:/var/www/html/public/"
            # In the container, extract the tarball and then remove it
            sudo docker exec -it boombang-html5-web-1 bash -c "cd /var/www/html/public && tar xzf uploads.tar.gz && rm uploads.tar.gz"
            # Set permissions in the container
            sudo docker exec -it boombang-html5-web-1 bash -c "chown -R www-data:www-data /var/www/html/public/$UPLOADS_DIR_NAME && chmod -R 755 /var/www/html/public/$UPLOADS_DIR_NAME"
            # Remove the tarball from the host
            rm "$UPLOADS_TAR_PATH"
            echo "Copia completada."
            ;;
        3)
            break
            ;;
        *) echo "Opción inválida";;
    esac
done