// design.md §4/§7: the compile-time half of the character-scoped accessory registry.
// compile-accessory.cjs requires --char and hard-fails rather than silently trusting the
// staged meta.json, or silently registering a package under the wrong character.

/**
 * @param {string|null|undefined} cliChar the required `--char` CLI argument
 * @param {string|undefined} metaChar the staged package's own `meta.json.char`
 * @throws {Error} if `cliChar` is missing, `metaChar` is missing, or the two disagree
 */
function validateCharArg(cliChar, metaChar) {
  if (!cliChar) {
    throw new Error('compile-accessory: --char is required (design.md §4/§7).');
  }
  if (!metaChar) {
    throw new Error(
      `compile-accessory: staged package has no meta.char (expected "${cliChar}") — cannot verify package identity (design.md §0 fact F).`
    );
  }
  if (metaChar !== cliChar) {
    throw new Error(
      `compile-accessory: --char "${cliChar}" disagrees with the staged package's meta.char "${metaChar}" — refusing to compile under the wrong character.`
    );
  }
}

module.exports = { validateCharArg };
