// Correction 2 (apply-progress.md's "Correction 2"): the I/O shell around canvasTint.js's pure
// colour math — creates and caches one real Phaser canvas-backed texture per distinct (atlas
// frame, resolved colour) pair, for LayeredAvatar's Canvas-renderer fallback path. Not unit-
// tested directly (design.md §8's established split: a live Phaser.Scene + Canvas 2D context is
// required, matching LayeredAvatar.js/AccessoryManager.js's own precedent) — exercised live via
// the e2e Canvas-renderer suite and the M4-equivalent memory measurement it also exposes.
//
// Module-level (not per-avatar) cache, deliberately: two avatars wearing the SAME character with
// the SAME resolved colour for a given piece share one generated texture rather than doubling
// memory — the same dedup property the WebGL path gets for free via `setTint()` sharing one
// source texture. The real, disclosed cost is the opposite case: N distinct colours of the same
// piece are N distinct cache entries, which is exactly the number this module's `getTintCacheStats`
// exposes for measurement (design.md §19 risk 18's named memory risk).

import Phaser from 'phaser';
import {
  buildTintedTextureKey,
  hexToRgbChannels,
  multiplyRgbaByChannels,
  getTintCacheEntry,
  setTintCacheEntry,
} from './canvasTint.js';

// The cache Map itself, and `getTintCacheStats`/`clearTintCache`, live in canvasTint.js — a
// Phaser-import-free module `avatarMetrics.js` can read from directly (see that file's own
// comment on why this module cannot be imported from a node/no-DOM test context). Re-exported
// here too so an existing caller of THIS module (e.g. a future test importing the cache/creation
// API from one place) is not forced to know about the split.
export { getTintCacheStats, clearTintCache } from './canvasTint.js';

/**
 * @param {Phaser.Scene} scene
 * @returns {boolean} true when the ACTIVE renderer is Phaser's Canvas renderer — covers both a
 *   device with no WebGL (Phaser.AUTO falling back) and a real per-user `phaser_type: "canvas"`
 *   forced setting (App.vue), which `setTint()` alone silently fails to colour either way.
 */
export function isCanvasRenderer(scene) {
  const renderer = scene && scene.sys && scene.sys.game && scene.sys.game.renderer;
  return !!renderer && renderer.type === Phaser.CANVAS;
}

/**
 * Returns a texture key already registered on `scene.textures` that shows the given atlas
 * frame with `hex` pre-multiplied into its pixels — creating and caching it on first request.
 * Returns `null` (never throws) when the source frame cannot be read, so a caller can fall back
 * to the plain, untinted frame rather than breaking rendering entirely.
 *
 * @param {Phaser.Scene} scene
 * @param {string} atlasKey
 * @param {string} frameName the piece id (`l.p`)
 * @param {string} hex
 * @returns {string|null}
 */
export function getOrCreateTintedTexture(scene, atlasKey, frameName, hex) {
  const cacheKey = buildTintedTextureKey(atlasKey, frameName, hex);
  const cached = getTintCacheEntry(cacheKey);
  if (cached) return cached.textureKey;

  if (!scene.textures.exists(atlasKey)) return null;
  const frame = scene.textures.getFrame(atlasKey, frameName);
  if (!frame) return null;

  const { width, height } = frame;
  if (width <= 0 || height <= 0) return null;

  const canvasTexture = scene.textures.createCanvas(cacheKey, width, height);
  const ctx = canvasTexture.getContext();
  ctx.drawImage(
    frame.source.image,
    frame.cutX,
    frame.cutY,
    width,
    height,
    0,
    0,
    width,
    height
  );

  const imageData = ctx.getImageData(0, 0, width, height);
  multiplyRgbaByChannels(imageData.data, hexToRgbChannels(hex));
  ctx.putImageData(imageData, 0, 0);
  canvasTexture.refresh();

  setTintCacheEntry(cacheKey, { textureKey: cacheKey, width, height });
  return cacheKey;
}
