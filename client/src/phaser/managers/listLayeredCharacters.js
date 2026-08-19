// avatar-system-multichar-fixes (coordinator addendum, character-switcher): pure decision
// logic for the debug panel's character dropdown — every character with a compiled layered
// manifest (design.md §15's own glob-based registry, reached through AvatarManager's
// `isLayeredAvatar`), sorted for a deterministic UI order. Split out so the filter/sort rule
// is unit-testable without importing AvatarManager's own Phaser-adjacent loader graph.

/**
 * @param {{avatarId: number, name: string, isLayered: boolean}[]} candidates one entry per
 *   AvatarEnum id, `isLayered` already resolved by the caller (e.g.
 *   `avatarManager.isLayeredAvatar(avatarId)`) — this function makes no I/O calls itself.
 * @returns {{avatarId: number, name: string}[]} only the layered candidates, sorted ascending
 *   by character name.
 */
function listLayeredCharacters(candidates) {
  return candidates
    .filter((candidate) => candidate.isLayered)
    .map((candidate) => ({ avatarId: candidate.avatarId, name: candidate.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * avatar-system-multichar-fixes (coordinator addendum, character-switcher): resolves an
 * avatarId to its lowercased AvatarEnum key name — the SAME reverse lookup this module's own
 * `listLayeredCharacters` candidates are built from — as a complete alternative to
 * `AvatarManager.getAvatarName`'s own hardcoded dict, which is missing a SALLY entry (id 18,
 * added after that dict was written) and falls through to "unknown" for her.
 *
 * @param {number} avatarId
 * @param {Record<string, number>} avatarEnum `AvatarEnum`-shaped — `{KEY: id}`
 * @returns {string|null} the lowercased key, or null if no entry matches this id
 */
function characterNameForAvatarId(avatarId, avatarEnum) {
  const entry = Object.entries(avatarEnum).find(([, id]) => id === avatarId);
  return entry ? entry[0].toLowerCase() : null;
}

export { listLayeredCharacters, characterNameForAvatarId };
