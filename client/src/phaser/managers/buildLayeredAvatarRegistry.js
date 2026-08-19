// design.md §14 cost 14 (tasks.md slice 9 task 3): groups a flat `import.meta.glob` result
// for `client/src/assets/game/avatars/<char>/layers/*` into per-character loader arrays, and
// derives the avatarId->characterName registry (`LAYERED_CHARACTERS`) from AvatarEnum plus
// which characters actually have a compiled manifest — replacing 5 hand-maintained literal
// maps (`LAYERED_CHARACTERS`, `LAYERED_MANIFEST_LOADERS`, `LAYERED_ATLAS_LOADERS`,
// `LAYERED_WEBP_LOADERS`, and the base-pack pair this file's own precedent covers) that each
// needed one entry added by hand per migrated character. The per-KEY action-pack loaders
// (design.md §13.3, tasks.md slice 15) use the sibling `groupLayeredActionKeyLoaders.js`
// instead, since they need a two-level (character, key) grouping this file does not provide.

/**
 * @param {string} assetPath e.g. `/src/assets/game/avatars/rasta/layers/rasta.layers.manifest.json`
 * @returns {string}
 */
function extractLayeredCharacterName(assetPath) {
  const match = assetPath.match(/avatars\/([^/]+)\/layers\//);
  if (!match) {
    throw new Error(`extractLayeredCharacterName: malformed path, no "avatars/<char>/layers/" segment: "${assetPath}"`);
  }
  return match[1];
}

/**
 * @param {Record<string, Function>} globEntries
 * @returns {Record<string, Function[]>} character name -> loaders, sorted ascending by their
 *   own asset path (so a multi-page asset like `rasta.actions_2.webp` sorts after
 *   `rasta.actions.webp`/`rasta.actions_1.webp` — page 0 first, matching the order
 *   `AvatarManager.loadLayeredAvatar` expects to push texture entries in).
 */
function groupLayeredLoadersByCharacter(globEntries) {
  const sortedPaths = Object.keys(globEntries).sort();
  const result = {};
  for (const assetPath of sortedPaths) {
    const character = extractLayeredCharacterName(assetPath);
    if (!result[character]) result[character] = [];
    result[character].push(globEntries[assetPath]);
  }
  return result;
}

/**
 * @param {string[]} compiledCharacterNames every character name with at least one compiled
 *   layered asset on disk (e.g. `Object.keys(groupLayeredLoadersByCharacter(manifestGlob))`)
 * @param {Record<string, number>} avatarEnumEntries `Object.entries(AvatarEnum)`-shaped —
 *   `{KEY: id}`, KEY uppercase matching the character name convention (`RASTA` -> `rasta`)
 * @returns {Record<number, string>} avatarId -> character name, for every compiled character
 *   that ALSO has a matching AvatarEnum entry (design.md §15: a compiled character with no
 *   registered id, or an id typo, is excluded rather than silently guessed)
 */
function buildLayeredCharacterRegistry(compiledCharacterNames, avatarEnumEntries) {
  const nameToId = {};
  for (const [key, id] of Object.entries(avatarEnumEntries)) {
    nameToId[key.toLowerCase()] = id;
  }

  const registry = {};
  for (const character of compiledCharacterNames) {
    if (character in nameToId) {
      registry[nameToId[character]] = character;
    }
  }
  return registry;
}

export { extractLayeredCharacterName, groupLayeredLoadersByCharacter, buildLayeredCharacterRegistry };
