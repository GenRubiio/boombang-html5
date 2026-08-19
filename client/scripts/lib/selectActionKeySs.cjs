// design.md §13.7 (resolved by user decision 2026-08-18, tasks.md slice 20): the ONLY escalation
// closing the R18 gate's one failing row (M3 worst key) is `ss:1` for whichever action key's own
// packed transfer exceeds the M3 worst-key budget — every other action key, and the entire body,
// stays at the project's ss:2 contract (the user explicitly ruled out density reduction for the
// body; a rarely-seen one-second falling animation is where the tradeoff costs least). This is a
// MEASUREMENT rule, not a key-name lookup: any character's any action key that measures over
// budget gets ss:1, full stop — `left_fall` is the only known member today, but 17 more
// characters' worst keys are unmeasured, so the rule must generalize.

/**
 * @param {number} packedBytes the key's own real measured packed transfer (webp bytes + gzip'd
 *   atlas/manifest JSON bytes — the same components the R18 gate's M3 rows measure).
 * @param {number} budgetBytes the M3 worst-key gate budget (design.md §13.8: <= 1.2 MB).
 * @returns {1|2} 1 when `packedBytes` strictly exceeds the budget, 2 (the project's ss:2
 *   contract) otherwise — an exact-boundary measurement (`packedBytes === budgetBytes`) is NOT
 *   over budget.
 */
function selectSsForActionKey(packedBytes, budgetBytes) {
  return packedBytes > budgetBytes ? 1 : 2;
}

/**
 * Pure decision plan over every measured key — the wiring point `compile-layered-avatar.cjs`'s
 * two-pass loop consults to decide which keys need a real ss:1 recompile call. Isolated as its
 * own pure function so "a key whose ss:2 pack exceeds budget triggers a real ss:1 recompile
 * call; a key under budget does not" (tasks.md slice 20 task 2) is unit-testable with a fixture,
 * independent of any real sharp/gzip call — the REAL recompile call is verified separately by
 * the real rasta recompile (task 5), which is what actually proves the wiring, not this function
 * alone.
 *
 * @param {Record<string, number>} measuredBytesByKey key -> its real measured ss:2 packed bytes.
 * @param {number} budgetBytes
 * @returns {{ overrideKeys: string[], ssOverrides: Record<string, 1> }} `overrideKeys` names
 *   every key needing a real ss:1 recompile; `ssOverrides` is the reportable shape
 *   (`manifest.ssOverrides`, tasks.md slice 20 task 3) — only ever contains `1`s, since ss:2 is
 *   the unreported default.
 */
function planActionKeySsOverrides(measuredBytesByKey, budgetBytes) {
  const overrideKeys = [];
  const ssOverrides = {};
  for (const [key, bytes] of Object.entries(measuredBytesByKey)) {
    if (selectSsForActionKey(bytes, budgetBytes) === 1) {
      overrideKeys.push(key);
      ssOverrides[key] = 1;
    }
  }
  return { overrideKeys, ssOverrides };
}

module.exports = { selectSsForActionKey, planActionKeySsOverrides };
