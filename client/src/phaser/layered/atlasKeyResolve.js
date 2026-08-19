// design.md §13.3 (tasks.md slice 15 task 3): resolves which Phaser atlas key `_applyFrame`
// must pass to `child.setTexture(...)` for a given piece's `pack`. `_atlasKeys.actions` is a
// `Map<packId, atlasKey>` (one entry per compiled action key once its own pack has loaded) —
// `pack: 'base'` always resolves to `atlasKeys.base`; anything else is looked up by its own
// name. A `page` dimension is deliberately not part of this resolution: Phaser's own
// `setTexture(atlasKey, frameName)` already disambiguates by frame name within one atlas key
// regardless of how many physical pages compose it (a per-key pack that itself spans 2 pages,
// e.g. the "worst key" `leftdown_punch_rec`, still loads under ONE atlas key via one
// `scene.load.multiatlas(atlasKey, atlasJsonWithMultipleTextures)` call).

/**
 * @param {{base: string, actions: Map<string, string>}} atlasKeys
 * @param {string} piecePack `piece.pack` — `'base'`, or a specific action-key packId
 * @returns {string} the Phaser atlas key to render this piece from
 */
function resolveAtlasKeyForPiece(atlasKeys, piecePack) {
  if (piecePack === 'base') return atlasKeys.base;
  return atlasKeys.actions.get(piecePack) || atlasKeys.base;
}

export { resolveAtlasKeyForPiece };
