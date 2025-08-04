#!/bin/bash

while true; do
    echo "Seleccione una opción:"
    echo "1. Copiar archivos del Docker al repositorio"
    echo "2. Copiar archivos del repositorio al Docker"
    echo "3. Salir"
    read -p "Opción: " opt
    case $opt in
        1)
            echo "Copiando archivos del Docker al repositorio..."
            docker exec -it boombang-html5-web-1 bash -c "cd /var/www/html/public && tar czf uploads.tar.gz uploads"
            docker cp boombang-html5-web-1:/var/www/html/public/uploads.tar.gz ./web/public/
            cd ./web/public
            tar xzf uploads.tar.gz
            rm uploads.tar.gz
            cd ../..
            echo "Copia completada."
            ;;
        2)
            echo "Copiando archivos del repositorio al Docker..."
            cd ./web/public
            tar czf uploads.tar.gz uploads
            docker cp ./uploads.tar.gz boombang-html5-web-1:/var/www/html/public/
            docker exec -it boombang-html5-web-1 bash -c "cd /var/www/html/public && tar xzf uploads.tar.gz && rm uploads.tar.gz"
            docker exec -it boombang-html5-web-1 bash -c "chown -R www-data:www-data /var/www/html/public/uploads && chmod -R 755 /var/www/html/public/uploads"
            rm uploads.tar.gz
            cd ../..
            echo "Copia completada."
            ;;
        3)
            break
            ;;
        *) echo "Opción inválida";;
    esac
done
