// design.md §8, corrected 2026-08-18 (apply-progress.md's "Correction 3"): `derivePetSide`
// needs the BODY's own `down_idle` frame origin (`o[0]`) as the reference point a pet's
// resolved centre is compared against — the real reference `resolveAccessoryPlacement` (pivot.js)
// uses at runtime, not a proxy assembled from the pet package's own frames alone. This module is
// split pure-logic / thin-I/O the same way `deriveColormeta.cjs`/`derive-colormeta.cjs` already are
// in this scripts/lib directory, so the extraction itself is unit-testable without touching disk.
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * @param {object} bodyManifest a parsed `<char>.layers.manifest.json`
 * @returns {number} the body's own `down_idle` first-frame origin X (`o[0]`)
 * @throws if the manifest has no `down_idle` sequence, or no frame data for it — the body MUST
 *   already be compiled before any of its pets can derive a side (a real ordering dependency,
 *   not an oversight).
 */
function extractBodyDownIdleOriginX(bodyManifest) {
  const seq = bodyManifest.sequences && bodyManifest.sequences.down_idle;
  if (!seq || !seq.frames || seq.frames.length === 0) {
    throw new Error(
      'bodyDownIdleOrigin: body manifest declares no "down_idle" sequence — compile the body before its pets (design.md §8).'
    );
  }
  const frame = bodyManifest.frames && bodyManifest.frames[String(seq.frames[0])];
  if (!frame || !Array.isArray(frame.o)) {
    throw new Error(
      'bodyDownIdleOrigin: body manifest\'s "down_idle" sequence names a frame with no "o" origin data.'
    );
  }
  return frame.o[0];
}

/**
 * @param {string} char
 * @param {string} avatarsDir absolute path to `client/src/assets/game/avatars`
 * @returns {number}
 */
function readBodyDownIdleOriginX(char, avatarsDir) {
  const manifestPath = path.join(avatarsDir, char, 'layers', `${char}.layers.manifest.json`);
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `bodyDownIdleOrigin: no compiled body manifest at ${manifestPath} — compile "${char}"'s body (compile-layered-avatar.cjs) before any of its pets (design.md §8).`
    );
  }
  const bodyManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return extractBodyDownIdleOriginX(bodyManifest);
}

module.exports = { extractBodyDownIdleOriginX, readBodyDownIdleOriginX };
