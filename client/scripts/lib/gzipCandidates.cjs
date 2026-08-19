// design.md §13.1 (tasks.md slice 13 task 2): pure "which output files need a .gz sibling"
// decision. The actual `fs.readFileSync`/`zlib.gzipSync` encoding is the I/O shell
// (emit-gzip-siblings.cjs) — this rule stays directly unit-testable without a real filesystem.
//
// Live-discovered correction to design.md §13.1's literal "emit .gz siblings for .json" wording:
// a real `docker build` of this Dockerfile produced ZERO `.json` files anywhere under `dist/`.
// `AvatarManager.js`/`AccessoryManager.js`'s `import.meta.glob(...)` calls on `*.manifest.json`/
// `*.atlas.json`/`*.accessory.json` carry no `{ as: 'url' }` (or `?url`/`?raw`) query, which is
// Vite's own documented trigger for treating a glob match as a static asset URL — without it,
// Vite's default behaviour for a JSON match is to parse and bundle it as a JS module (`export
// default {...}`), so `rasta.layers.manifest.json` ships as `dist/assets/js/rasta.layers.
// manifest-<hash>.js`, confirmed live. The default extension list below is `.js`/`.css` (the
// text assets that are actually large enough on disk to matter) rather than the JSON literally
// named in the design, since JSON never reaches disk as JSON in this build's real output.
/**
 * @param {string[]} filePaths every file path under the build output directory
 * @param {{extensions?: string[]}} [options] extensions to gzip (default: `.js`/`.css`/`.json`
 *   — `.json` kept for any future asset that IS emitted with `{as:'url'}`; `.webp` is
 *   already-compressed and gains nothing)
 * @returns {string[]} the subset of `filePaths` that need a `.gz` sibling written
 */
function selectGzipCandidates(filePaths, { extensions = ['.js', '.css', '.json'] } = {}) {
  const lowerExtensions = extensions.map((ext) => ext.toLowerCase());
  return filePaths.filter((filePath) => {
    const lowerPath = filePath.toLowerCase();
    return lowerExtensions.some((ext) => lowerPath.endsWith(ext));
  });
}

module.exports = { selectGzipCandidates };
