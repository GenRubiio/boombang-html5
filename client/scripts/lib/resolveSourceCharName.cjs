// design.md §4: the one srcName != char lookup table entry (client name reconciled per
// design.md §1) — `bommer` (the source archive's own name) compiles under the client name
// `boomer`. `stage-layered-source.sh` already reconciles this for the BODY compile by renaming
// the staging directory at unzip time. This is the SAME reconciliation for validating an
// accessory package's self-declared `meta.json.char` (design.md §4/§7), which is unaffected by
// which directory it is staged into and still reads "bommer" — kept as its own tiny, pure,
// single-purpose lookup rather than folded into `validateCharArg` itself, so that function stays
// a pure comparison with no character-name knowledge of its own.

const SRC_NAME_OVERRIDES = {
  boomer: 'bommer',
};

/**
 * @param {string} char the CLIENT character name (e.g. "boomer", "rasta").
 * @returns {string} the name the character's own source archive declares internally — equal to
 *   `char` for every character except the one known exception.
 */
function resolveSourceCharName(char) {
  return SRC_NAME_OVERRIDES[char] ?? char;
}

module.exports = { resolveSourceCharName };
