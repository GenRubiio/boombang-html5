// PAL3/PAL5: defaults and labels are independent, optional per-slot metadata; a missing
// palette falls back to manifest defaults, slot by slot.

/**
 * @returns {string|undefined} the manifest-declared default colour for a slot, if any.
 */
function resolveDefault(manifest, slotKey) {
  return manifest.defaults ? manifest.defaults[slotKey] : undefined;
}

/**
 * PAL3: label lookup is independent of default lookup, and falls back to the raw slot key
 * when no label is declared.
 */
function resolveLabel(manifest, slotKey) {
  const label = manifest.labels ? manifest.labels[slotKey] : undefined;
  return label ?? slotKey;
}

/**
 * PAL5: every slot other than an explicitly saved one resolves to its manifest default.
 * @param {object} manifest
 * @param {Record<string,string>|null|undefined} savedPalette per-slot saved values, or none
 * @returns {Record<string,string>}
 */
function resolvePalette(manifest, savedPalette) {
  const saved = savedPalette || {};
  const resolved = {};
  for (const slotKey of manifest.slots || Object.keys(manifest.defaults || {})) {
    resolved[slotKey] = saved[slotKey] ?? resolveDefault(manifest, slotKey);
  }
  return resolved;
}

// Live defect fix (tasks.md slice 26): see paletteResolve.test.js's own docblock for the full
// defect account (ninja/werewolf's base pieces reference a recolour slot with neither a saved
// palette value nor a manifest-declared default). Falls back to a neutral black rather than
// ever returning falsy — the caller (`LayeredAvatar._tintChild`) used to skip tinting entirely
// in that case, which exposes the piece's own raw grayscale-mask pixel data (never meant to be
// shown untinted) instead of a real, if generic, colour.
const UNRESOLVED_SLOT_FALLBACK_HEX = '000000';

/**
 * @param {Record<string,string>} palette a saved/player palette (may be empty).
 * @param {Record<string,string>} defaults manifest.defaults (may be empty).
 * @param {string} slotKey
 * @returns {string} always a real hex string — never falsy.
 */
function resolveTintHex(palette, defaults, slotKey) {
  return (palette && palette[slotKey]) ?? (defaults && defaults[slotKey]) ?? UNRESOLVED_SLOT_FALLBACK_HEX;
}

export { resolveDefault, resolveLabel, resolvePalette, resolveTintHex };
