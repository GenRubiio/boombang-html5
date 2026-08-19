// Correction 2 (2026-08-18, apply-progress.md's "Correction 2" — user decision): Phaser's
// Canvas renderer (`Renderer.Canvas.CanvasRenderer#batchSprite`) draws every sprite via a plain
// `ctx.drawImage(...)` and NEVER reads a sprite's `tint`/`tintTopLeft` properties at all, unlike
// the WebGL renderer's `TextureTintPipeline` — confirmed live in slice 21's own coordinator-
// caught defect (apply-progress.md). `LayeredAvatar._tintChild`'s `setTint()` call is correct
// (the resolved colour is right) but has ZERO visual effect under `Phaser.CANVAS`, which a real
// player reaches either by having no WebGL support, or by the real `phaser_type: "canvas"`
// per-user setting `App.vue` itself reads.
//
// The fix pre-multiplies the resolved colour into a NEW texture at composition time (once per
// distinct (piece, resolved colour) pair, cached — see canvasTintCache.js for the cache/Phaser
// wiring) instead of relying on `setTint()`. This module holds the PURE pieces of that
// mechanism — colour parsing, the actual multiply, and the cache key/byte-accounting math — so
// they are directly unit-testable without a live Canvas/Phaser context (design.md §8's split).

/**
 * @param {string} hex e.g. "#ff00ff" or "ff00ff"
 * @returns {{r: number, g: number, b: number}} each channel 0-255
 */
export function hexToRgbChannels(hex) {
  const normalized = String(hex).replace('#', '');
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
}

/**
 * The cache/texture key for one (source atlas frame, resolved colour) pair — deterministic and
 * collision-free across characters/packs because `atlasKey` already encodes both (design.md's
 * per-character, per-pack atlas naming). Exported so `canvasTintCache.js`'s I/O shell and this
 * module's own tests agree on the exact same string without duplicating the format.
 *
 * @param {string} atlasKey
 * @param {string} frameName the piece id (`l.p`), which doubles as the atlas frame name
 * @param {string} hex
 * @returns {string}
 */
export function buildTintedTextureKey(atlasKey, frameName, hex) {
  const normalizedHex = String(hex).replace('#', '').toLowerCase();
  return `__layeredTint:${atlasKey}:${frameName}:${normalizedHex}`;
}

/**
 * Reproduces Phaser's own WebGL tint blend exactly (`TextureTintPipeline`: per-channel multiply,
 * alpha untouched) — this is the actual colour math, independent of any Canvas/DOM API, so it is
 * fully unit-testable on plain arrays. Mutates `rgba` in place (a `Uint8ClampedArray`-shaped
 * flat `[r,g,b,a, r,g,b,a, ...]` buffer, or any indexable array with the same layout) and also
 * returns it, so both mutate-in-place (the real `ImageData.data` use) and pure-functional
 * (tests passing a plain `Array`) callers work unchanged.
 *
 * Slot semantics (design.md, "compile-time neutralisation already guarantees the mask shape"):
 * this function does not decide WHICH pixels get recoloured — the caller only invokes it for a
 * slotted run's own already-white-masked raster. An unslotted run's raster is never passed
 * here at all (LayeredAvatar._tintChild's existing `if (!piece.slot) return` branch, unchanged
 * by this correction), and neither is a stroke run's (never given a `slot` in the first place).
 *
 * @param {ArrayLike<number>} rgba flat RGBA bytes, 4 per pixel
 * @param {{r: number, g: number, b: number}} channels 0-255 each
 * @returns {ArrayLike<number>} the same `rgba` reference, mutated
 */
export function multiplyRgbaByChannels(rgba, { r, g, b }) {
  const rf = r / 255;
  const gf = g / 255;
  const bf = b / 255;
  for (let i = 0; i < rgba.length; i += 4) {
    rgba[i] = Math.round(rgba[i] * rf);
    rgba[i + 1] = Math.round(rgba[i + 1] * gf);
    rgba[i + 2] = Math.round(rgba[i + 2] * bf);
    // alpha (rgba[i + 3]) is deliberately untouched — tint never changes opacity.
  }
  return rgba;
}

/**
 * design.md §19 risk 18 / the memory-budget constraint this correction is gated on: a
 * pre-multiplied texture is per (piece, resolved colour), so the cache's real cost is the sum of
 * every distinct cached canvas's own pixel bytes — NOT bounded by the number of avatars on
 * screen, since two avatars sharing one piece+colour share one cache entry, but two DIFFERENT
 * colours of the SAME piece do not. Pure so the M4-style measurement can be asserted against a
 * plain array of `{width, height}` entries, the same shape `computeResidentAvatarBytes`
 * (avatarMetrics.js) already uses for the WebGL path's resident atlas pages — same accounting
 * convention, different source.
 *
 * @param {{width: number, height: number}[]} entries
 * @returns {number}
 */
export function computeTintCacheBytes(entries = []) {
  return entries.reduce((sum, entry) => sum + entry.width * entry.height * 4, 0);
}

// The cache Map itself lives here (not in canvasTintCache.js, the Phaser I/O shell) so that
// `avatarMetrics.js` — which is unit-tested directly in a node/no-DOM environment (design.md §8)
// and therefore must stay Phaser-import-free — can read the cache's byte accounting without
// transitively importing `phaser` at all (importing it in a node environment throws: Phaser's
// device-detection module assumes a browser `window`/`navigator`). `canvasTintCache.js` is the
// ONLY module that ever writes to this Map; every other reader goes through `getTintCacheStats`.

/** @type {Map<string, {textureKey: string, width: number, height: number}>} */
const tintCache = new Map();

/**
 * @param {string} cacheKey
 * @param {{textureKey: string, width: number, height: number}} entry
 */
export function setTintCacheEntry(cacheKey, entry) {
  tintCache.set(cacheKey, entry);
}

/**
 * @param {string} cacheKey
 * @returns {{textureKey: string, width: number, height: number}|undefined}
 */
export function getTintCacheEntry(cacheKey) {
  return tintCache.get(cacheKey);
}

/**
 * design.md §19 risk 18's memory-budget measurement surface — an M4-equivalent for the Canvas
 * fallback, mirroring `avatarMetrics.js`'s `computeResidentAvatarBytes` shape exactly (same
 * `{width, height}` entries) so the two numbers are directly comparable in the same report.
 *
 * @returns {{count: number, entries: {width: number, height: number}[]}}
 */
export function getTintCacheStats() {
  const entries = [...tintCache.values()].map(({ width, height }) => ({ width, height }));
  return { count: entries.length, entries };
}

/** Test/measurement isolation only — never called from production rendering code. */
export function clearTintCache() {
  tintCache.clear();
}
