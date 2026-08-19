#!/usr/bin/env bash
set -euo pipefail

# design.md §4: stages one character's layered + vector source packages from the decrypted
# source root into client/.assets-src/, derives colormeta.json (design.md §0 fact A — it does
# NOT ship inside .layers.bb), stages every accessory package that character has (design.md §0
# fact L), and compiles everything via the existing Node compilers. Shell, not Node — .bb
# packages are plain ZIPs and `unzip` reads them directly, so a Node zip dependency for this
# manual, one-off staging step is not justified (design.md §4). Manually invoked (matching
# compile-layered-avatar.cjs / compile-accessory.cjs precedent) — NOT wired into `npm run
# build`. Reused unchanged through PR11 (design.md §12).
#
# Usage: client/scripts/stage-layered-source.sh <char> [srcRoot]
#   <char>    the CLIENT character name (e.g. "rasta", "boomer" — NOT the source name for the
#             one character whose name is reconciled, see SRC_NAME below)
#   [srcRoot] defaults to the decrypted source root this change was verified against
#
# Manual step this script does NOT automate (design.md §4 step 4): a staged accessory's
# meta.json may need an authoring correction — `scale` (e.g. minnieHat: 0.75) or
# `groundOffsetY` (e.g. pet09: 19) — added BY HAND after staging, BEFORE compiling, only when a
# live visual check finds the raw geometry disproportionate or ground-clipping. Not
# automatable: it depends on a human visual judgement call, per package.

if [ "${1:-}" = "" ]; then
  echo "Usage: stage-layered-source.sh <char> [srcRoot]" >&2
  exit 1
fi

CHAR="$1"
SRC_ROOT="${2:-/Users/evgeny.lyubeznyy/Downloads/dswmedia_decrypted/personajes}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# design.md §4: bommer -> boomer is the one srcName != char lookup table entry (client name
# reconciled per design.md §1; the staging directory is renamed at unzip time so
# compile-layered-avatar.cjs never needs a compiler change for it).
case "$CHAR" in
  boomer) SRC_NAME="bommer" ;;
  *) SRC_NAME="$CHAR" ;;
esac

LAYERED_DIR="$CLIENT_DIR/.assets-src/layered/$CHAR"
ACTIONS_DIR="$LAYERED_DIR/actions"

echo "[stage-layered-source] staging '$CHAR' (source name '$SRC_NAME') from $SRC_ROOT"

mkdir -p "$LAYERED_DIR" "$ACTIONS_DIR"

# 1. Layers package (base body pieces + idle/talk/walk sequences).
unzip -o -q "$SRC_ROOT/$SRC_NAME.layers.bb" -d "$LAYERED_DIR"

# 2. Vector package (the character's full action set — design.md §5).
unzip -o -q "$SRC_ROOT/$SRC_NAME.bb" -d "$ACTIONS_DIR"

# 3. Derive colormeta.json from the vector package's own meta.json.colormeta (design.md §0 fact
#    A). Fails loudly when absent — it is the only source of slot defaults/labels, and an empty
#    one would silently compile a character with zero palette slots.
node "$SCRIPT_DIR/lib/derive-colormeta.cjs" "$ACTIONS_DIR/meta.json" "$LAYERED_DIR/colormeta.json"

# 4. Accessories (design.md §0 fact L) — only the characters that have any at all.
#    Source layout: <srcRoot>/<srcName>/<kind>/<Key>.bb
if [ -d "$SRC_ROOT/$SRC_NAME" ]; then
  for KIND_DIR in "$SRC_ROOT/$SRC_NAME"/*/; do
    [ -d "$KIND_DIR" ] || continue
    for PKG in "$KIND_DIR"*.bb; do
      [ -e "$PKG" ] || continue
      KEY="$(basename "$PKG" .bb)"
      DEST="$CLIENT_DIR/.assets-src/accessories/$CHAR/$KEY"
      echo "[stage-layered-source] staging accessory: $(basename "$KIND_DIR")/$KEY"
      mkdir -p "$DEST"
      unzip -o -q "$PKG" -d "$DEST"
    done
  done
fi

# 5. Apply committed hand edits (design.md §16.2 — tasks.md slice 11 task 3): any file under
#    client/asset-overrides/$CHAR/<kind>/<key>/_frames_<anim>.json overwrites the freshly
#    re-unzipped staged file at that same package's location, so a hand-edited animation
#    survives this script's own re-unzip instead of being silently discarded (the exact defect
#    PR4 hit once with scale/groundOffsetY, which now live in the committed
#    accessory-annotations.json and need no staging step at all).
node "$SCRIPT_DIR/apply-asset-overrides.cjs" "$CHAR"

# 6. Compile. Body first, then every staged accessory for this character.
echo "[stage-layered-source] compiling layered body for '$CHAR'..."
node "$CLIENT_DIR/scripts/compile-layered-avatar.cjs" "$CHAR"

if [ -d "$CLIENT_DIR/.assets-src/accessories/$CHAR" ]; then
  for PKG_DIR in "$CLIENT_DIR/.assets-src/accessories/$CHAR"/*/; do
    [ -d "$PKG_DIR" ] || continue
    KEY="$(basename "$PKG_DIR")"
    KIND="$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).kind)" "$PKG_DIR/meta.json")"
    echo "[stage-layered-source] compiling accessory $KIND/$KEY for '$CHAR'..."
    node "$CLIENT_DIR/scripts/compile-accessory.cjs" --kind "$KIND" --char "$CHAR" "$KEY"
  done
fi

echo "[stage-layered-source] done."
