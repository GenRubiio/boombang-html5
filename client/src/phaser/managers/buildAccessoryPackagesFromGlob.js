// design.md §7/§14 cost 14 (tasks.md slice 9 task 3): groups a flat `import.meta.glob` result
// into the same `{registryKey: {manifest, atlas, webp}}` shape the hand-maintained
// `ACCESSORY_PACKAGES` literal map used to declare, via `parseAccessoryAssetPath`.

import { parseAccessoryAssetPath } from './parseAccessoryAssetPath.js';

function classifyFileRole(assetPath) {
  if (assetPath.endsWith('.accessory.json')) return 'manifest';
  if (assetPath.endsWith('.atlas.json')) return 'atlas';
  if (assetPath.endsWith('.webp')) return 'webp';
  return null;
}

/**
 * @param {Record<string, Function>} globEntries the flat `{path: importerFn}` shape
 *   `import.meta.glob(...)` returns
 * @returns {Record<string, {manifest?: Function, atlas?: Function, webp: Function[]}>} `webp` is
 *   ALWAYS an array (even a single-page package has a 1-entry array) — a multi-page package
 *   (any hat needing >1 page, e.g. brujita's `pineappleHat` at 3, per the real batch compile)
 *   has more than one `.webp` file, and every page's own loader must be kept, not just the last
 *   one seen (the live-caught defect this shape fixes, tasks.md slices 28-31). Sorted by path
 *   first so array index matches page index — mirrors `groupLayeredActionKeyLoaders.js`'s
 *   already-correct precedent for the body's own per-key action packs.
 */
function buildAccessoryPackagesFromGlob(globEntries) {
  const packages = {};
  const sortedPaths = Object.keys(globEntries).sort();

  for (const assetPath of sortedPaths) {
    const role = classifyFileRole(assetPath);
    if (!role) continue;

    const { kind, character, key } = parseAccessoryAssetPath(assetPath);
    const registryKey = `${character}:${kind}:${key}`;
    if (!packages[registryKey]) packages[registryKey] = { webp: [] };

    if (role === 'webp') {
      packages[registryKey].webp.push(globEntries[assetPath]);
    } else {
      packages[registryKey][role] = globEntries[assetPath];
    }
  }

  return packages;
}

export { buildAccessoryPackagesFromGlob };
