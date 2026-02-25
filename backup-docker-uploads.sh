#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_ROOT="${PROJECT_DIR}/backups/uploads"
TIMESTAMP="$(date -u +%Y%m%d_%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/${TIMESTAMP}"

API_VOLUME="${API_VOLUME:-boombang-html5_api_uploads}"
WEB_VOLUME="${WEB_VOLUME:-boombang-html5_web_uploads}"

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: missing command '$cmd'" >&2
    exit 1
  fi
}

require_cmd sudo
require_cmd docker
require_cmd tar
require_cmd sha256sum

backup_volume() {
  local volume="$1"
  local name="$2"
  local mountpoint
  local file_count
  local archive_path

  mountpoint="$(sudo docker volume inspect "$volume" --format '{{ .Mountpoint }}')"

  if [[ -z "$mountpoint" ]] || ! sudo test -d "$mountpoint"; then
    echo "Error: could not resolve mountpoint for volume '$volume'" >&2
    exit 1
  fi

  archive_path="${BACKUP_DIR}/${name}.tar.gz"

  echo "Backing up $volume from $mountpoint"
  sudo tar -C "$mountpoint" -czf "$archive_path" .
  sudo chown "$(id -u):$(id -g)" "$archive_path"

  file_count="$(sudo find "$mountpoint" -type f | wc -l | tr -d ' ')"
  echo "Done: ${name}.tar.gz (${file_count} files)"
}

mkdir -p "$BACKUP_DIR"

echo "Backup destination: $BACKUP_DIR"
backup_volume "$API_VOLUME" "api_uploads"
backup_volume "$WEB_VOLUME" "web_uploads"

(
  cd "$BACKUP_DIR"
  sha256sum api_uploads.tar.gz web_uploads.tar.gz > SHA256SUMS.txt
)

cat > "${BACKUP_DIR}/BACKUP_INFO.txt" <<INFO
created_at_utc=${TIMESTAMP}
host=$(hostname)
api_volume=${API_VOLUME}
web_volume=${WEB_VOLUME}
api_archive=api_uploads.tar.gz
web_archive=web_uploads.tar.gz
checksums=SHA256SUMS.txt
INFO

echo "Backup completed successfully."
echo "Files created:"
ls -lh "$BACKUP_DIR"
