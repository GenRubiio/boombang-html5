// design.md §9.2 (tasks.md slice 16 task 3): pure classification of one unzipped `.bb` bundle's
// entry names — which is the manifest, which is the atlas, which (possibly several, for a
// multi-page pack) are the webp pages. No decoding here; the caller (an I/O shell) handles
// `TextDecoder`/`JSON.parse`/`Blob` construction.

/**
 * @param {Record<string, Uint8Array>} entries the raw output of `fflate.unzipSync`.
 * @returns {{manifestEntry: string, atlasEntry: string, webpEntries: string[]}} `webpEntries`
 *   sorted ascending by name, matching the atlas's own `textures[]` page-index order (page N's
 *   filename always sorts after page N-1's — the same convention
 *   `groupLayeredLoadersByCharacter.js` already relies on).
 */
function parseBundleEntries(entries) {
  const names = Object.keys(entries);
  const manifestEntry = names.find((name) => name.endsWith('.manifest.json'));
  const atlasEntry = names.find((name) => name.endsWith('.atlas.json'));
  const webpEntries = names.filter((name) => name.endsWith('.webp')).sort();

  if (!manifestEntry) throw new Error('parseBundleEntries: bundle is missing a manifest entry');
  if (!atlasEntry) throw new Error('parseBundleEntries: bundle is missing an atlas entry');
  if (webpEntries.length === 0) throw new Error('parseBundleEntries: bundle is missing any webp entry');

  return { manifestEntry, atlasEntry, webpEntries };
}

export { parseBundleEntries };
