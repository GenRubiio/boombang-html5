// design.md §13.7: the real packed-transfer measurement shared between the body compiler
// (`compile-layered-avatar.cjs`'s `measureActionKeyPackedBytes`, tasks.md slice 20) and the
// accessory compiler (`compile-accessory.cjs`'s whole-package ss:1 rule) — extracted here so
// both apply the SAME rule, not two independently-drifting copies. webp bytes count AS-IS
// (never gzip'd — `emit-gzip-siblings.cjs`'s own documented reason: already-compressed bytes
// gain nothing); every JSON string (atlas + manifest) is gzip level 9, matching the real
// build-time compression `nginx`'s `gzip_static` serves and the R18 gate's own `content-length`
// method.

const zlib = require('zlib');

/**
 * @param {number[]} webpByteLengths one entry per compiled `.webp` page, its own byte length
 * @param {(string|null|undefined)[]} jsonStrings the JSON text of every sidecar file shipped
 *   alongside the webp page(s) (atlas, manifest) — a falsy entry (no such file for this
 *   package) is skipped, not gzip'd as an empty string.
 * @returns {number} total real packed transfer bytes
 */
function sumPackedTransferBytes(webpByteLengths, jsonStrings) {
  const webpTotal = webpByteLengths.reduce((sum, bytes) => sum + bytes, 0);
  const gzipLevel = { level: zlib.constants.Z_BEST_COMPRESSION };
  const jsonTotal = jsonStrings
    .filter(Boolean)
    .reduce((sum, jsonString) => sum + zlib.gzipSync(jsonString, gzipLevel).length, 0);
  return webpTotal + jsonTotal;
}

module.exports = { sumPackedTransferBytes };
