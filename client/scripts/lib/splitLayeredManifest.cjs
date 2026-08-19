// design.md §13.2 (tasks.md slice 14 task 1): splits one compiled layered-avatar manifest into
// the two files room entry actually needs on different schedules — the base pack's
// character-level data plus its own pieces/frames, and the action pack's pieces/frames alone.
//
// `sequences`/`aliases`/`mirrors` stay on the base output UNCONDITIONALLY, regardless of which
// pack a given sequence's frames live in: `resolveAnimationKey`/`computeActionBackedKeys` must
// know an action exists, and which pack backs it, before deciding whether to fetch anything —
// design.md §13.2's own stated reason this file exists at all.

/**
 * @param {object} manifest a full compiled manifest (see compile-layered-avatar.cjs's own
 *   `manifest` object shape) with every `pieces[id].pack` already tagged `'base'` or a specific
 *   per-key action packId (design.md §13.3, tasks.md slice 15 — NOT the literal string
 *   `'actions'`; each compiled action key names its own pack after itself).
 * @returns {{layers: object, actions: {pieces: object, frames: object}}}
 */
function splitLayeredManifest(manifest) {
  const basePieces = {};
  const actionPieces = {};
  for (const [id, piece] of Object.entries(manifest.pieces)) {
    if (piece.pack !== 'base') {
      actionPieces[id] = piece;
    } else {
      basePieces[id] = piece;
    }
  }

  const baseFrames = {};
  const actionFrames = {};
  for (const [id, frame] of Object.entries(manifest.frames)) {
    // Every real frame's `L[]` pieces are homogeneously one pack (verified live against rasta's
    // compiled manifest: 0 cross-pack overlap) — the first referenced piece decides it. A frame
    // with an empty `L[]` defaults to base, which costs nothing either way.
    const firstPieceId = frame.L && frame.L[0] && frame.L[0].p;
    const piece = firstPieceId != null ? manifest.pieces[firstPieceId] : null;
    if (piece && piece.pack !== 'base') {
      actionFrames[id] = frame;
    } else {
      baseFrames[id] = frame;
    }
  }

  const layers = {
    v: manifest.v,
    compilerVersion: manifest.compilerVersion,
    sourceHash: manifest.sourceHash,
    character: manifest.character,
    ss: manifest.ss,
    slots: manifest.slots,
    defaults: manifest.defaults,
    labels: manifest.labels,
    compatibleHats: manifest.compatibleHats,
    // design.md §13.3 (tasks.md slice 15): per-key action-pack introspection — `[{key, pages}]`
    // for every compiled action key. Not load-critical (the runtime derives which pack backs a
    // key from `sequences[key].pack` directly, and glob-discovers the loader by character+key —
    // `groupLayeredActionKeyLoaders.js`), kept for tooling/debugging visibility. Absent entirely
    // on a manifest with no `actionPacks` field (backward-compatible with slice 14's own tests).
    actionPacks: manifest.actionPacks,
    bodyBounds: manifest.bodyBounds,
    pieces: basePieces,
    frames: baseFrames,
    sequences: manifest.sequences,
    aliases: manifest.aliases,
    mirrors: manifest.mirrors,
    // design.md §13.7 (tasks.md slice 20 task 3): character-level, like ss itself — the
    // reported ss:1-selected key set. Absent on a manifest compiled before this slice existed
    // (backward-compatible: `undefined` propagates, not a thrown error).
    ssOverrides: manifest.ssOverrides,
    // Live defect fix (tasks.md slice 26): character-level, like `ssOverrides` — see
    // `computeMaxFramePieces.cjs`'s own docblock for the full defect this closes. Absent on a
    // manifest compiled before this fix (backward-compatible: `undefined` propagates).
    maxFramePieces: manifest.maxFramePieces,
  };

  const actions = {
    pieces: actionPieces,
    frames: actionFrames,
  };

  return { layers, actions };
}

module.exports = { splitLayeredManifest };
