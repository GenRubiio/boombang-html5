#!/bin/bash

# Script to backup and restore API uploads during deployment
# Usage: ./backup-uploads.sh [backup|restore]

BACKUP_DIR="./docker/uploads-backup"
CONTAINER_NAME="boombang-html5-api-1"
UPLOADS_PATH="/var/www/html/public/uploads"

case "$1" in
    backup)
        echo "==> Creating backup of uploads..."
        mkdir -p "$BACKUP_DIR"
        
        # Check if container exists and is running
        if sudo docker ps -q -f name="$CONTAINER_NAME" > /dev/null; then
            sudo docker cp "$CONTAINER_NAME:$UPLOADS_PATH" "$BACKUP_DIR/"
            echo "==> Uploads backed up to $BACKUP_DIR"
        else
            echo "==> Container $CONTAINER_NAME not running, checking volume..."
            # Try to backup from volume directly
            sudo docker run --rm -v boombang-html5_api_uploads:/source -v "$(pwd)/$BACKUP_DIR":/backup alpine cp -r /source/. /backup/
            echo "==> Uploads backed up from volume to $BACKUP_DIR"
        fi
        ;;
        
    restore)
        echo "==> Restoring uploads from backup..."
        if [ -d "$BACKUP_DIR/uploads" ]; then
            # Wait for container to be ready
            sleep 3
            sudo docker cp "$BACKUP_DIR/uploads/." "$CONTAINER_NAME:$UPLOADS_PATH/"
            echo "==> Uploads restored from backup"
        else
            echo "==> No backup found at $BACKUP_DIR/uploads"
        fi
        ;;
        
    *)
        echo "Usage: $0 {backup|restore}"
        echo "  backup  - Create backup of current uploads"
        echo "  restore - Restore uploads from backup"
        exit 1
        ;;
esac
