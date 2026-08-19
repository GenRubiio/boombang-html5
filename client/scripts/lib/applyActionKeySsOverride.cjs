// design.md §13.7 (tasks.md slice 20 task 2): merges a real ss:1 recompile of the over-budget
// action key(s) back into the full action-compile result, REMOVING that key's stale ss:2
// piece/frame entries rather than leaving them as dead weight in the shipped manifest — a real
// defect caught while building this: the final per-key packer only ever consults the CURRENT
// `keyPieceIds[key]`, so an orphaned old id would never be packed/located, yet would still be
// blindly merged into the manifest's `pieces` object by the caller's own `Object.assign`,
// corrupting it with unlocated (`frame.x/y/page`-less) entries.

/**
 * @param {{pieces: object, frames: object, sequences: object, keyPieceIds: object,
 *   keyFrameIds: object}} actionResult mutated in place AND returned, matching this compiler's
 *   existing mutation style (`compile-layered-avatar.cjs`'s own `Object.assign` calls).
 * @param {string[]} overrideKeys keys selected for ss:1 (design.md §13.7's measurement rule).
 * @param {{sequences: object, pieces: object, frames: object, keyPieceIds: object,
 *   keyFrameIds: object}} recompiled the SAME shape `compileActionSequences` returns, from a
 *   recompile restricted to `overrideKeys` at ss:1.
 * @returns {object} the same `actionResult` reference, mutated.
 */
function mergeSsOverrideResults(actionResult, overrideKeys, recompiled) {
  for (const key of overrideKeys) {
    const stalePieceIds = actionResult.keyPieceIds[key] || [];
    const staleFrameIds = actionResult.keyFrameIds[key] || [];
    stalePieceIds.forEach((pid) => delete actionResult.pieces[pid]);
    staleFrameIds.forEach((fid) => delete actionResult.frames[fid]);

    actionResult.sequences[key] = recompiled.sequences[key];
    actionResult.keyPieceIds[key] = recompiled.keyPieceIds[key];
    actionResult.keyFrameIds[key] = recompiled.keyFrameIds[key];
    recompiled.keyPieceIds[key].forEach((pid) => {
      actionResult.pieces[pid] = recompiled.pieces[pid];
    });
    recompiled.keyFrameIds[key].forEach((fid) => {
      actionResult.frames[fid] = recompiled.frames[fid];
    });
  }
  return actionResult;
}

module.exports = { mergeSsOverrideResults };
