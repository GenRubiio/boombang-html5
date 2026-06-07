#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKUP_ROOT="${PROJECT_DIR}/backups/uploads"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.yml"

API_VOLUME="${API_VOLUME:-boombang-html5_api_uploads}"
WEB_VOLUME="${WEB_VOLUME:-boombang-html5_web_uploads}"

RESTART_CONTAINERS=false
FORCE=false
TIMESTAMP=""

usage() {
  cat <<USAGE
Usage:
  $(basename "$0") <timestamp> [--force] [--restart]
  $(basename "$0") --list

Examples:
  $(basename "$0") 20260225_103440
  $(basename "$0") 20260225_103440 --force --restart

Options:
  --list      List available backups in ${BACKUP_ROOT}
  --force     Skip confirmation prompt
  --restart   Restart api and web services after restore
USAGE
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: missing command '$cmd'" >&2
    exit 1
  fi
}

list_backups() {
  if [[ ! -d "$BACKUP_ROOT" ]]; then
    echo "No backups found. Directory does not exist: $BACKUP_ROOT"
    return 0
  fi
  echo "Available backups:"
  ls -1 "$BACKUP_ROOT" | sort
}

parse_args() {
  if [[ $# -eq 0 ]]; then
    usage
    exit 1
  fi

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --list)
        list_backups
        exit 0
        ;;
      --force)
        FORCE=true
        shift
        ;;
      --restart)
        RESTART_CONTAINERS=true
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        if [[ -z "$TIMESTAMP" ]]; then
          TIMESTAMP="$1"
          shift
        else
          echo "Unknown argument: $1" >&2
          usage
          exit 1
        fi
        ;;
    esac
  done

  if [[ -z "$TIMESTAMP" ]]; then
    echo "Error: missing timestamp." >&2
    usage
    exit 1
  fi
}

volume_mountpoint() {
  local volume="$1"
  sudo docker volume inspect "$volume" --format '{{ .Mountpoint }}'
}

clear_dir_contents() {
  local dir="$1"
  sudo find "$dir" -mindepth 1 -delete
}

main() {
  parse_args "$@"

  require_cmd sudo
  require_cmd docker
  require_cmd tar
  require_cmd find

  local backup_dir="${BACKUP_ROOT}/${TIMESTAMP}"
  local api_archive="${backup_dir}/api_uploads.tar.gz"
  local web_archive="${backup_dir}/web_uploads.tar.gz"

  if [[ ! -d "$backup_dir" ]]; then
    echo "Error: backup folder not found: $backup_dir" >&2
    echo
    list_backups
    exit 1
  fi

  if [[ ! -f "$api_archive" || ! -f "$web_archive" ]]; then
    echo "Error: missing archive(s) in $backup_dir" >&2
    echo "Expected:"
    echo "  - $api_archive"
    echo "  - $web_archive"
    exit 1
  fi

  local api_mount
  local web_mount
  api_mount="$(volume_mountpoint "$API_VOLUME")"
  web_mount="$(volume_mountpoint "$WEB_VOLUME")"

  if [[ -z "$api_mount" ]] || ! sudo test -d "$api_mount"; then
    echo "Error: invalid API volume mountpoint for $API_VOLUME" >&2
    exit 1
  fi

  if [[ -z "$web_mount" ]] || ! sudo test -d "$web_mount"; then
    echo "Error: invalid WEB volume mountpoint for $WEB_VOLUME" >&2
    exit 1
  fi

  echo "Restore plan"
  echo "- Backup: $backup_dir"
  echo "- API volume: $API_VOLUME -> $api_mount"
  echo "- WEB volume: $WEB_VOLUME -> $web_mount"
  echo
  echo "Warning: this will delete current files in both upload volumes."

  if [[ "$FORCE" != "true" ]]; then
    read -r -p "Type RESTORE to continue: " confirm
    if [[ "$confirm" != "RESTORE" ]]; then
      echo "Cancelled."
      exit 1
    fi
  fi

  local temp_dir
  temp_dir="$(mktemp -d)"
  trap 'rm -rf "$temp_dir"' EXIT

  mkdir -p "$temp_dir/api" "$temp_dir/web"

  echo "Extracting backup archives..."
  tar -xzf "$api_archive" -C "$temp_dir/api"
  tar -xzf "$web_archive" -C "$temp_dir/web"

  echo "Clearing existing API uploads..."
  clear_dir_contents "$api_mount"

  echo "Clearing existing WEB uploads..."
  clear_dir_contents "$web_mount"

  echo "Restoring API uploads..."
  sudo cp -a "$temp_dir/api/." "$api_mount/"

  echo "Restoring WEB uploads..."
  sudo cp -a "$temp_dir/web/." "$web_mount/"

  local api_count
  local web_count
  api_count="$(sudo find "$api_mount" -type f | wc -l | tr -d ' ')"
  web_count="$(sudo find "$web_mount" -type f | wc -l | tr -d ' ')"

  echo "Restore completed."
  echo "- API files: $api_count"
  echo "- WEB files: $web_count"

  if [[ "$RESTART_CONTAINERS" == "true" ]]; then
    if [[ -f "$COMPOSE_FILE" ]]; then
      echo "Restarting api and web containers..."
      sudo docker compose -f "$COMPOSE_FILE" restart api web
    else
      echo "Compose file not found, skipping restart: $COMPOSE_FILE"
    fi
  fi
}

main "$@"
