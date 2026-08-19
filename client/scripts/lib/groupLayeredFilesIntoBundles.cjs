// design.md §9.2 (tasks.md slice 16 task 2): pure grouping of a compiled character's flat file
// list into bundle units — the base pack (one bundle) and each per-key action pack (one bundle
// each), matching slice 15's own lazy-loading granularity.

/**
 * @param {string} character
 * @param {string[]} fileNames every filename directly under that character's `layers/` output
 *   directory (basenames only, no path segments).
 * @returns {Record<string, string[]>} bundle name -> its member filenames. `<char>.layers` for
 *   the base pack; `<char>.actions.<key>` per compiled action key (its `.webp`/`_N.webp` pages,
 *   `.atlas.json` and `.manifest.json` all land in the SAME bundle). Anything not matching
 *   either shape (e.g. `config.json`) is ignored.
 */
function groupLayeredFilesIntoBundles(character, fileNames) {
  const basePrefix = `${character}.layers`;
  const actionPattern = new RegExp(`^${character}\\.actions\\.(.+?)(?:_\\d+)?\\.(atlas\\.json|manifest\\.json|webp)$`);

  const bundles = {};
  for (const fileName of fileNames) {
    if (fileName.startsWith(basePrefix)) {
      (bundles[basePrefix] ||= []).push(fileName);
      continue;
    }
    const match = fileName.match(actionPattern);
    if (match) {
      const bundleName = `${character}.actions.${match[1]}`;
      (bundles[bundleName] ||= []).push(fileName);
    }
  }
  return bundles;
}

module.exports = { groupLayeredFilesIntoBundles };
