#!/usr/bin/env bash
set -euo pipefail
# Ad-hoc, apply-pass-local helper (avatar-system-multichar-fixes slices 24-27): runs
# stage-layered-source.sh's own staging steps (1,2,3,5) plus the BODY compile only, deliberately
# skipping its accessory-staging/compile steps (4/6) — that work is explicitly out of scope for
# the body batches (tasks.md slices 24-27; accessories are slices 28-31). Not a new pipeline:
# every step below is copy-invoked from the same, unchanged scripts stage-layered-source.sh
# already calls (derive-colormeta.cjs, apply-asset-overrides.cjs, compile-layered-avatar.cjs).
if [ "${1:-}" = "" ]; then
  echo "Usage: stage-body-only.sh <char> [srcRoot]" >&2
  exit 1
fi
CHAR="$1"
SRC_ROOT="${2:-/Users/evgeny.lyubeznyy/Downloads/dswmedia_decrypted/personajes}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

case "$CHAR" in
  boomer) SRC_NAME="bommer" ;;
  *) SRC_NAME="$CHAR" ;;
esac

LAYERED_DIR="$CLIENT_DIR/.assets-src/layered/$CHAR"
ACTIONS_DIR="$LAYERED_DIR/actions"

echo "[stage-body-only] staging '$CHAR' body (source name '$SRC_NAME') from $SRC_ROOT"
mkdir -p "$LAYERED_DIR" "$ACTIONS_DIR"

unzip -o -q "$SRC_ROOT/$SRC_NAME.layers.bb" -d "$LAYERED_DIR"
unzip -o -q "$SRC_ROOT/$SRC_NAME.bb" -d "$ACTIONS_DIR"

node "$SCRIPT_DIR/lib/derive-colormeta.cjs" "$ACTIONS_DIR/meta.json" "$LAYERED_DIR/colormeta.json"

node "$SCRIPT_DIR/apply-asset-overrides.cjs" "$CHAR"

echo "[stage-body-only] compiling layered body for '$CHAR'..."
node "$CLIENT_DIR/scripts/compile-layered-avatar.cjs" "$CHAR"

echo "[stage-body-only] done (body only; accessories NOT staged/compiled by this helper)."
