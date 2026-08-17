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

export { resolveDefault, resolveLabel, resolvePalette };
