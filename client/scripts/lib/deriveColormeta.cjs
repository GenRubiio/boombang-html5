// design.md §0 fact A / §4 step 3: `.layers.bb` does not ship `colormeta.json` — the data
// lives in the sibling vector `<char>.bb`'s `meta.json.colormeta`. This is the pure derivation
// (throws loudly on absence, per design.md §4: "an empty one would silently compile a
// character with zero palette slots"); `derive-colormeta.cjs` in this same directory is the
// thin file-I/O CLI wrapper `stage-layered-source.sh` invokes.

/**
 * @param {{colormeta?: {defaults?: object, labels?: object, creatorIdx?: number}}} meta the
 *   vector package's own parsed `meta.json`
 * @returns {{defaults: object, labels: object, creatorIdx: number}}
 */
function deriveColormeta(meta) {
  const colormeta = meta && meta.colormeta;
  if (!colormeta || !colormeta.defaults) {
    throw new Error(
      'deriveColormeta: source meta.json has no colormeta.defaults — cannot derive palette slots (design.md §0 fact A). This character cannot be staged without it.'
    );
  }
  return colormeta;
}

module.exports = { deriveColormeta };
