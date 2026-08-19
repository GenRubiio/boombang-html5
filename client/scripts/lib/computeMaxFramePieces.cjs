// design.md §5/§13.3 (tasks.md slice 26 live defect fix): the compiler's own precomputed fact
// for `LayeredAvatar.computeMaxPoolSize` to read at construction time, BEFORE any action pack
// has loaded (see that method's own updated docblock for the full defect account). Computed
// here, at compile time, across the FULL merged `frames` dict (base + every action key) — the
// one place in the whole pipeline that already has that complete picture in memory at once,
// before `splitLayeredManifest` divides it per-pack.

/**
 * @param {Record<string, {L?: unknown[]}>} frames every compiled frame (base AND action,
 *   merged) — each frame's own `L` array length is exactly how many pooled children rendering
 *   it needs.
 * @returns {number} the maximum `L.length` across every frame, or 0 for an empty dict.
 */
function computeMaxFramePieces(frames) {
  let max = 0;
  for (const frame of Object.values(frames)) {
    const length = (frame && frame.L && frame.L.length) || 0;
    if (length > max) max = length;
  }
  return max;
}

module.exports = { computeMaxFramePieces };
