// ACC4 (pure half): the animation-coverage fallback chain and the accessory-follows decision.
// Two deterministic steps, no heuristic, no "nearest key" guessing (design.md §5).

/**
 * @param {Record<string, {frames:number[]}>} sequences the layered body's declared sequences
 * @param {string} requestedKey the animation key that was triggered
 * @param {string} currentDirection the avatar's current facing direction (e.g. "down")
 * @param {Record<string, {from:string, flipX:boolean}>} [mirrors] the manifest's synthesized
 *   mirror table — a MIRRORED key (e.g. "rightdown_walk") is never a member of `sequences`
 *   (design.md §3.1 step 5: right/rightdown/rightup are never authored, only synthesized), so
 *   coverage MUST also be checked against `mirrors` or every mirrored key is wrongly treated
 *   as "not covered" and falls all the way through to the static `down_idle` sequence — the
 *   confirmed live-validation defect (frame freezes whenever the avatar faces a mirrored
 *   direction).
 * @returns {string} requestedKey itself if covered (by `sequences` OR `mirrors`); otherwise
 *   `${currentDirection}_idle` if THAT is covered; otherwise the final fallback `down_idle`.
 */
function resolveFallbackKey(sequences, requestedKey, currentDirection, mirrors = {}) {
  const isCovered = (key) => !!(sequences[key] || mirrors[key]);

  if (isCovered(requestedKey)) return requestedKey;
  const directionIdleKey = `${currentDirection}_idle`;
  if (isCovered(directionIdleKey)) return directionIdleKey;
  return 'down_idle';
}

/**
 * @param {Record<string, {frames:number[]}>|undefined} accessoryAnims
 * @param {string} resolvedKey the key resolveFallbackKey() returned for the body
 * @returns {boolean} true when the accessory has frames for the resolved key (play in sync),
 *   false when it must be hidden for the duration of that animation.
 */
function accessoryFollows(accessoryAnims, resolvedKey) {
  return !!(accessoryAnims && accessoryAnims[resolvedKey]);
}

export { resolveFallbackKey, accessoryFollows };
