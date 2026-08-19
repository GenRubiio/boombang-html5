// design.md §8: pet canonical side, derived at compile time, never authored (fact G — no
// accessory package declares a side or an anchor; positioning is carried entirely by each
// frame's `o:[x,y]` origin). Pure so it is directly unit-testable without touching any staged
// file on disk.
//
// Correction (2026-08-18, coordinator-reported inversion — see apply-progress.md's "Correction
// 3" section for the full measured evidence): the FIRST version of this module compared the
// pet's own RAW `regX` (the frame's registration point) against a same-direction population
// median. Two independent bugs made that comparison wrong for `pet09`:
//   1. `regX` alone is NOT where the pet actually renders. The real runtime placement
//      (`resolveAccessoryPlacement`, pivot.js) adds a correction term,
//      `(0.5 - originX) * widthLogical`, before comparing against the body's own origin — and
//      `pet09`'s `originX` values run far outside `[0, 1]` (e.g. `-1.65` for `down_idle`), so
//      this correction is LARGE, not a rounding nicety. For `pet09 down_idle` the raw `regX`
//      (`-6.25`) and the fully-resolved centre (`+59.27` logical, vs. the body's own `down_idle`
//      origin at `40.6`) do not even agree on SIGN.
//   2. The population comparison expanded every FRAME of every `down_*` action, unweighted by
//      animation — so an action with many frames (`down_trampa`, 94 frames) swamped the median
//      versus an action with few (`down_idle`, 3 frames collapsing to 1 unique position),
//      even though both actions should count once each as "the population".
// The fix computes the pet's fully-resolved `down_idle` centre (same formula the runtime placement
// uses) and compares it directly against the BODY's own `down_idle` frame origin (`o[0]`) — the
// actual reference point the pet is rendered relative to. No population/median is needed once the
// real reference (the body's own origin) is available, which also removes bug 2 entirely rather
// than patching its weighting.
'use strict';

/**
 * The pet's own frame centre X, in the SAME logical coordinate space as the body's frame
 * origin (`o[0]`) — matches `resolveAccessoryPlacement`'s unmirrored `centerXLogical` exactly
 * (pivot.js), so comparing this value against a body origin is a like-for-like comparison of
 * where the pet actually renders, not merely where its raw registration point sits.
 *
 * @param {number} regX the frame's raw registration point X (`frame.o[0]`)
 * @param {number} originX the frame's fractional origin (may fall far outside `[0, 1]` — fact,
 *   not a bug; see this module's top comment)
 * @param {number} widthPx the frame's rendered raster width, in ALREADY-supersampled pixels
 * @param {number} ss the supersampling factor the raster was rendered at
 * @returns {number}
 */
function resolvePetFrameCenterX(regX, originX, widthPx, ss) {
  return regX + (0.5 - originX) * (widthPx / ss);
}

/**
 * @param {number} petCenterX the pet's fully-resolved `down_idle` centre X
 *   (`resolvePetFrameCenterX`), in the same logical space as `bodyOriginX`.
 * @param {number} bodyOriginX the body's own `down_idle` frame origin (`o[0]`) — the point the
 *   pet's placement is rendered relative to.
 * @param {{overrideSide?: 'left'|'right', epsilon?: number}} [options] `overrideSide` is the
 *   staged `meta.json.side` annotation (same escape hatch `scale`/`groundOffsetY` already use)
 *   — when present, it wins unconditionally, skipping derivation entirely. `epsilon` (default
 *   2, the same logical units as the two positional values) is the ambiguity band: derivation
 *   FAILS (throws) rather than silently guessing when `|petCenterX - bodyOriginX| <= epsilon`
 *   and no override is staged — design.md §8: "no silent default can reintroduce 'whichever
 *   side the data happened to give'".
 * @returns {{side: 'left'|'right', derived: boolean}} `derived: false` when `overrideSide` was
 *   used (printed at compile time, per design.md §8, so an override is visible in the build log
 *   even though it short-circuits the geometry check).
 */
function derivePetSide(petCenterX, bodyOriginX, { overrideSide, epsilon = 2 } = {}) {
  if (overrideSide === 'left' || overrideSide === 'right') {
    return { side: overrideSide, derived: false };
  }

  const diff = petCenterX - bodyOriginX;

  if (Math.abs(diff) <= epsilon) {
    throw new Error(
      `derivePetSide: ambiguous — the pet's resolved down_idle centre (${petCenterX}) is within ` +
        `epsilon (${epsilon}) of the body's down_idle origin (${bodyOriginX}). Stage an explicit ` +
        `"side" annotation in this package's meta.json to override.`
    );
  }

  return { side: diff > 0 ? 'right' : 'left', derived: true };
}

module.exports = { derivePetSide, resolvePetFrameCenterX };
