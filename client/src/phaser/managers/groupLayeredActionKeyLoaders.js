// design.md §13.3 (tasks.md slice 15): per-key action packs. Each compiled action KEY gets its
// own atlas/webp(+pages)/manifest triple (`<char>.actions.<key>.atlas.json`, `<char>.actions.
// <key>{,_N}.webp`, `<char>.actions.<key>.manifest.json`) — replacing the single per-character
// action pack slice 6/14 shipped. Mirrors `buildLayeredAvatarRegistry.js`'s glob-parsing style.

/**
 * @param {string} assetPath e.g.
 *   `/src/assets/game/avatars/rasta/layers/rasta.actions.leftdown_punch_rec_1.webp`
 * @returns {{character: string, key: string, kind: 'atlas'|'manifest'|'webp'}}
 */
function parseActionKeyAssetPath(assetPath) {
  const match = assetPath.match(
    /avatars\/([^/]+)\/layers\/\1\.actions\.(.+?)(?:_\d+)?\.(atlas\.json|manifest\.json|webp)$/
  );
  if (!match) {
    throw new Error(`parseActionKeyAssetPath: cannot parse "${assetPath}"`);
  }
  const [, character, key, extension] = match;
  const kind = extension === 'atlas.json' ? 'atlas' : extension === 'manifest.json' ? 'manifest' : 'webp';
  return { character, key, kind };
}

/**
 * @param {Record<string, Function>} globEntries a flat `import.meta.glob(...)` result over
 *   every `<char>.actions.<key>.{atlas.json,manifest.json,webp}` path.
 * @returns {Record<string, Record<string, {atlas?: Function, manifest?: Function, webp: Function[]}>>}
 *   character -> key -> loaders, `webp` sorted by page order (path sort order matches page
 *   index, same convention `groupLayeredLoadersByCharacter` already uses).
 */
function groupLayeredActionKeyLoaders(globEntries) {
  const sortedPaths = Object.keys(globEntries).sort();
  const result = {};
  for (const assetPath of sortedPaths) {
    const { character, key, kind } = parseActionKeyAssetPath(assetPath);
    if (!result[character]) result[character] = {};
    if (!result[character][key]) result[character][key] = { webp: [] };
    if (kind === 'webp') {
      result[character][key].webp.push(globEntries[assetPath]);
    } else {
      result[character][key][kind] = globEntries[assetPath];
    }
  }
  return result;
}

export { parseActionKeyAssetPath, groupLayeredActionKeyLoaders };
