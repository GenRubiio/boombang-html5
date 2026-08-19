// Live defect fix (tasks.md slice 26): see this file's own test for the full defect account
// (ninja/werewolf: an empty vector-`.bb` colormeta does NOT imply zero recolourable base
// pieces, unlike `sally`'s own genuinely-zero-slot shape).

/**
 * @param {Record<string,string>} colormetaDefaults colormeta.json's own `defaults` dict.
 * @param {Record<string,{slot?: string|null}>} pieces every compiled piece (base + action,
 *   merged) — only `.slot` is read.
 * @returns {string[]} the union of colormeta-declared default keys and every piece's own
 *   non-null `slot`, de-duplicated.
 */
function computeManifestSlots(colormetaDefaults, pieces) {
  const slots = new Set(Object.keys(colormetaDefaults || {}));
  for (const piece of Object.values(pieces || {})) {
    if (piece && piece.slot) slots.add(piece.slot);
  }
  return [...slots];
}

module.exports = { computeManifestSlots };
