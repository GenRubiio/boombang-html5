// design.md §13.3 (tasks.md slice 15 task 1): packs each action key's own pieces independently
// — pages never shared between unrelated animation keys. `packFrames` is injected (the real
// implementation now lives in the ESM `client/src/shared/assetPipeline/packFrames.js`, consumed
// by the .cjs compiler via dynamic import(), same pattern as `setSharedVectorBounds`) so this
// stays a plain synchronous, unit-testable function with a fake packer in tests.

/**
 * @param {Record<string, Array<{id: string, w: number, h: number}>>} keyToRects every action
 *   key's own piece rects (already deduped WITHIN that key only — cross-key dedup is
 *   deliberately not attempted, design.md §13.3: measured ~20.4 unique pieces per frame means
 *   there is almost nothing to lose by not sharing).
 * @param {Function} packFramesFn `(rects, {maxSize}) => {pages}` — injected, see above.
 * @param {number} maxSize the page size ceiling (design.md: 4096).
 * @returns {Record<string, Array<{width:number, height:number, placements: Array<object>}>>}
 *   key -> its own independent pages array (empty for a key with no rects — `packFramesFn` is
 *   not called at all in that case).
 */
function packActionPiecesPerKey(keyToRects, packFramesFn, maxSize) {
  const result = {};
  for (const [key, rects] of Object.entries(keyToRects)) {
    result[key] = rects.length > 0 ? packFramesFn(rects, { maxSize }).pages : [];
  }
  return result;
}

module.exports = { packActionPiecesPerKey };
