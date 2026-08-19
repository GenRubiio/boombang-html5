// design.md §9: the observable half of the "never silent" success criterion. Every time
// `resolveAnimationKey` (fallback.js) resolves a degraded reason, the call site reports it
// here rather than swallowing the substitution. Bounded by distinct (avatarId, requestedKey,
// resolvedKey, reason) tuples, not call frequency, so this cannot spam the console or leak
// memory proportional to how often an action is (mis)triggered.

function tupleKey({ avatarId, requestedKey, resolvedKey, reason }) {
  return `${avatarId}|${requestedKey}|${resolvedKey}|${reason}`;
}

/**
 * @param {{avatarId: number|string, requestedKey: string, resolvedKey: string, reason: string}} entry
 */
function report(entry) {
  if (!globalThis.window) {
    globalThis.window = {};
  }
  if (!globalThis.window.__layeredDegrades) {
    globalThis.window.__layeredDegrades = new Map();
  }
  const map = globalThis.window.__layeredDegrades;
  const key = tupleKey(entry);
  const existing = map.get(key);

  if (existing) {
    existing.count += 1;
    return;
  }

  map.set(key, { ...entry, count: 1 });
  // First occurrence of this exact tuple only — a repeated degrade of the same substitution
  // only increments `count`, so a hot action key never spams the console.
  console.warn(
    `[layered] degraded animation: requested "${entry.requestedKey}" resolved to "${entry.resolvedKey}" (reason: ${entry.reason}, avatarId: ${entry.avatarId})`
  );
}

export { report };
