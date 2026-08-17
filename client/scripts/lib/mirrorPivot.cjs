// LR5 (avatar-layered-rendering spec): mirrored directions derive from the left-facing source
// with a corrected pivot — design.md §3.1 step 5. `oMirror = [bodyBoundsW - o[0], o[1]]`.

/**
 * @param {[number, number]} o source frame origin [x, y]
 * @param {number} bodyBoundsW the character manifest's declared body bounds width
 * @returns {[number, number]} the corrected pivot for the horizontally-flipped frame
 */
function mirrorPivot(o, bodyBoundsW) {
  return [bodyBoundsW - o[0], o[1]]
}

module.exports = { mirrorPivot }
