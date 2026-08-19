// design.md §6: the lazy action pack. A sequence is "action-backed" when its compiled pieces
// live in the 'actions' pack (design.md §5.4's `pieces[id].pack`) rather than 'base'. Computed
// once from the manifest, independent of whether the pack has actually loaded — `play()` only
// treats these keys as `unloadedKeys` (fallback.js's `resolveAnimationKey`) WHILE the actions
// pack has not finished loading yet.
//
// design.md §13.2/§13.3 (tasks.md slices 14/15): reads `seq.pack` directly rather than
// dereferencing `manifest.frames[frameId]`/`manifest.pieces[pieceId]` — with the manifest
// split, the BASE manifest (the only one resident at the point this function is ever called —
// see LayeredAvatar's constructor, which computes `_actionBackedKeys` once from the manifest it
// was constructed with, before any action pack load has even been requested) no longer carries
// action pieces/frames to dereference at all. `pack` is a self-contained fact the compiler
// stamps onto every sequence at the point it already knows which pack backs it
// (compile-layered-avatar.cjs), so this function needs nothing beyond the base manifest's own
// `sequences` dict to answer correctly.
//
// Slice 15 (design.md §13.3): returns a key -> packId MAP, not a Set. With per-key action
// packs, `pack` on a compiled action sequence IS that sequence's own packId (one pack per key,
// by construction) — the map lets `unloadedKeys`/the `pack-loading` degrade (LayeredAvatar.js)
// know WHICH specific pack a requested key needs, not merely THAT some pack is needed. `Map`
// also satisfies every existing `.has(key)` caller unchanged (fallback.js's `resolveAnimationKey`
// only ever calls `.has()` on its `unloadedKeys` parameter).

/**
 * @param {object} manifest a compiled layered-body manifest — needs only `sequences` (each
 *   entry carrying its own `pack: 'base'|<action-key-packId>`), `aliases` and `mirrors`; does
 *   NOT need `pieces`/`frames` to be present (design.md §13.2, tasks.md slice 14).
 * @returns {Map<string, string>} every key (a `sequences` key, an `aliases` key, or a `mirrors`
 *   key) whose underlying compiled sequence is action-backed, mapped to the specific packId
 *   that backs it.
 */
function computeActionBackedKeys(manifest) {
  const keyToPack = new Map();

  for (const [seqKey, seq] of Object.entries(manifest.sequences)) {
    if (seq.pack && seq.pack !== 'base') {
      keyToPack.set(seqKey, seq.pack);
    }
  }

  for (const [aliasKey, sourceKey] of Object.entries(manifest.aliases || {})) {
    if (keyToPack.has(sourceKey)) keyToPack.set(aliasKey, keyToPack.get(sourceKey));
  }

  for (const [mirrorKey, mirrorInfo] of Object.entries(manifest.mirrors || {})) {
    if (keyToPack.has(mirrorInfo.from)) keyToPack.set(mirrorKey, keyToPack.get(mirrorInfo.from));
  }

  return keyToPack;
}

export { computeActionBackedKeys };
