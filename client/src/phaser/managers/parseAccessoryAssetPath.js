// design.md §7/§12.3 (tasks.md slice 9 task 1): parses a compiled accessory asset's own path
// into `{kind, character, key}` — the population mechanism `import.meta.glob` needs, replacing
// the hand-maintained `ACCESSORY_PACKAGES` literal map. Package identity in the source data IS
// `(char, kind, key)` for hat/pet (design.md fact G); auras (ACC2) declare no character at all,
// so a path with no character segment resolves `character: '*'`, the same wildcard tier
// `accessoryRegistryResolve.js` already understands.

/**
 * @param {string} assetPath e.g.
 *   `/src/assets/game/accessories/hat/rasta/minnieHat/minnieHat.accessory.json` or
 *   `/src/assets/game/accessories/aura/auraElectrica/auraElectrica.accessory.json`
 * @returns {{kind: string, character: string, key: string}}
 */
function parseAccessoryAssetPath(assetPath) {
  const marker = 'accessories/';
  const markerIndex = assetPath.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`parseAccessoryAssetPath: malformed path, no "accessories/" segment found: "${assetPath}"`);
  }

  const rest = assetPath.slice(markerIndex + marker.length);
  const segments = rest.split('/').filter(Boolean);
  // Last segment is the filename, never part of the identity.
  const pathSegments = segments.slice(0, -1);

  if (pathSegments.length === 3) {
    const [kind, character, key] = pathSegments;
    return { kind, character, key };
  }
  if (pathSegments.length === 2) {
    const [kind, key] = pathSegments;
    return { kind, character: '*', key };
  }

  throw new Error(
    `parseAccessoryAssetPath: malformed/unexpected path shape (expected 2 or 3 segments after "accessories/", got ${pathSegments.length}): "${assetPath}"`
  );
}

export { parseAccessoryAssetPath };
