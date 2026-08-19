// Live defect fix (tasks.md slice 26): see this repo's own `computeMaxFramePieces.cjs`
// (client/scripts/lib/) for the compile-time half of this fix and the full defect account.
// Extracted out of `LayeredAvatar.js` (imports Phaser, unavailable under this project's plain-
// `node` vitest environment) so this fix is directly unit-testable, matching the existing
// `fallback.js`/`pivot.js`/`sequence.js` precedent of small, Phaser-free pure modules
// `LayeredAvatar.js` delegates to.

/**
 * @param {object} manifest the manifest `LayeredAvatar` was constructed with.
 * @returns {number} the pooled-child array size that manifest's OWN worst-case frame (base AND
 *   every action key, even though only the base pack's frames are resident at construction
 *   time) actually needs.
 */
function computeMaxPoolSize(manifest) {
  if (typeof manifest.maxFramePieces === 'number') {
    return manifest.maxFramePieces;
  }
  // Backward-compatible fallback for a manifest compiled before this fix shipped — scans
  // whatever frames ARE resident at construction time (the base pack only), same as this
  // function's own pre-fix behaviour. A manifest compiled after this fix always carries
  // `maxFramePieces`, so this branch is dead for any freshly (re)compiled character.
  let max = 0;
  for (const frame of Object.values(manifest.frames || {})) {
    max = Math.max(max, (frame.L && frame.L.length) || 0);
  }
  return max;
}

export { computeMaxPoolSize };
