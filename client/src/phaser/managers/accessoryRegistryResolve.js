// design.md §4/§7: pure resolution logic for the character-scoped accessory registry, split
// out of AccessoryManager.js (I/O-shell code — dynamic import()/scene.load, not directly unit
// tested per this project's convention, design.md §8) so the actual lookup-order and
// char-mismatch rules ARE directly unit-testable.
//
// Package identity in the source data IS `(char, kind, key)` (design.md §0 fact F) — the
// registry's key format mirrors that exactly: `${character}:${kind}:${key}`, with a
// character-independent `'*'` tier for packages like auras (ACC2) that declare no character.

/**
 * Resolves `(character, kind, key)` against a `${character}:${kind}:${key}`-keyed packages
 * object, in a fixed order (design.md §7):
 *   1. the exact per-character package
 *   2. the character-independent `'*'` package
 *   3. miss
 *
 * @param {Record<string, unknown>} packages keys of the form `${char}:${kind}:${key}`
 * @param {string} character
 * @param {string} kind
 * @param {string} key
 * @returns {string|null} the resolved registry key, or null on a miss
 */
function resolveAccessoryRegistryKey(packages, character, kind, key) {
  const exactKey = `${character}:${kind}:${key}`;
  if (packages[exactKey]) return exactKey;

  const wildcardKey = `*:${kind}:${key}`;
  if (packages[wildcardKey]) return wildcardKey;

  return null;
}

/**
 * @param {string} resolvedRegistryKey a key `resolveAccessoryRegistryKey` returned
 * @param {string} kind
 * @param {string} key
 * @returns {string} `acc_${character}_${kind}_${key}_atlas` for a per-character resolution, or
 *   the character-independent `acc_${kind}_${key}_atlas` for the `'*'` tier (design.md §7 —
 *   auras keep their existing flat atlas-key shape).
 */
function resolveAccessoryAtlasKey(resolvedRegistryKey, kind, key) {
  const resolvedChar = resolvedRegistryKey.split(':')[0];
  return resolvedChar === '*' ? `acc_${kind}_${key}_atlas` : `acc_${resolvedChar}_${kind}_${key}_atlas`;
}

/**
 * @param {string} resolvedRegistryKey
 * @returns {string} the character segment of a resolved registry key (`'*'` for the
 *   character-independent tier).
 */
function resolvedCharacterOf(resolvedRegistryKey) {
  return resolvedRegistryKey.split(':')[0];
}

/**
 * design.md §7 success criterion 6: `AccessoryManager.load()` asserts `manifest.char ===
 * character` (or `undefined` for the `'*'` tier) and reports a mismatch — this is the pure
 * rule that assertion follows, so the string message and the "no mismatch is possible for a
 * character-independent package" case are both directly testable.
 *
 * @param {string} resolvedRegistryKey
 * @param {string|undefined} manifestChar the compiled manifest's own `char` field
 * @param {string} requestedCharacter
 * @returns {string|null} a human-readable mismatch message, or null when there is no mismatch
 */
function checkManifestCharMismatch(resolvedRegistryKey, manifestChar, requestedCharacter) {
  if (resolvedCharacterOf(resolvedRegistryKey) === '*') {
    return null;
  }
  if (manifestChar !== requestedCharacter) {
    return `AccessoryManager: manifest.char ("${manifestChar}") does not match requested character ("${requestedCharacter}") for registry key "${resolvedRegistryKey}"`;
  }
  return null;
}

/**
 * avatar-system-multichar-fixes (coordinator addendum): lists every compiled key for a
 * `(character, kind)` pair — the per-character tier AND the character-independent `'*'` tier
 * (auras, ACC2) — so a caller (the debug panel's dropdowns) can show the full compiled
 * catalogue instead of the account's owned subset. Sorted ascending so the UI order is
 * deterministic and does not depend on `Object.keys` insertion order.
 *
 * @param {Record<string, unknown>} packages keys of the form `${char}:${kind}:${key}`
 * @param {string} character
 * @param {string} kind
 * @returns {string[]} the compiled keys available to this character for this kind, deduped
 */
function listAccessoryKeysForCharacter(packages, character, kind) {
  const perCharacterPrefix = `${character}:${kind}:`;
  const wildcardPrefix = `*:${kind}:`;
  const keys = new Set();

  Object.keys(packages).forEach((registryKey) => {
    if (registryKey.startsWith(perCharacterPrefix)) {
      keys.add(registryKey.slice(perCharacterPrefix.length));
    } else if (registryKey.startsWith(wildcardPrefix)) {
      keys.add(registryKey.slice(wildcardPrefix.length));
    }
  });

  return Array.from(keys).sort();
}

export {
  resolveAccessoryRegistryKey,
  resolveAccessoryAtlasKey,
  resolvedCharacterOf,
  checkManifestCharMismatch,
  listAccessoryKeysForCharacter,
};
