// design.md §12.3 (tasks.md slice 8 task 2): `packFrames` itself MOVED to
// client/src/shared/assetPipeline/packFrames.js (deleted here, not duplicated) — the runtime bake
// cache needs the exact same shelf packer (§12.5). The 2 real compilers now obtain it via a
// dynamic import() from their already-async main()/compileVector(), same pattern as
// slotRuns.js/pathBounds.js.
//
// This file keeps only the mean-luminance authoring check (design.md §5 cost): a warning,
// never a build failure, when a tintable piece's mean luminance is below a threshold —
// `setTint` cannot brighten, so a very dark source piece will render darker still. This is a
// build-only authoring signal, not part of the runtime bake path, so it stays here.

/**
 * Mean luminance (0-255) of an RGBA buffer, using the standard Rec. 601 luma weights.
 * @param {Buffer|Uint8Array} rgbaBuffer
 */
function meanLuminance(rgbaBuffer) {
  let sum = 0
  let count = 0
  for (let i = 0; i < rgbaBuffer.length; i += 4) {
    const r = rgbaBuffer[i]
    const g = rgbaBuffer[i + 1]
    const b = rgbaBuffer[i + 2]
    sum += 0.299 * r + 0.587 * g + 0.114 * b
    count += 1
  }
  return count === 0 ? 0 : sum / count
}

/**
 * @param {number} luminance mean luminance (0-255) of a tintable piece
 * @param {{threshold?: number}} [options]
 * @returns {string|null} a warning message, or null when the piece is bright enough
 */
function checkLuminanceWarning(luminance, { threshold = 80 } = {}) {
  if (luminance < threshold) {
    return `warning: tintable piece mean luminance ${luminance.toFixed(1)} is below ${threshold} — setTint cannot brighten, so multiply-tinted colours will render darker than requested`
  }
  return null
}

module.exports = { meanLuminance, checkLuminanceWarning }
