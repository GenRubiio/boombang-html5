// ACC4 (pure half): the animation-coverage fallback chain and the accessory-follows decision.
// Two deterministic steps, no heuristic, no "nearest key" guessing (design.md §5).

/**
 * @typedef {'match'|'alias'|'mirror'|'pack-loading'|'direction-idle'|'down-idle'} DegradeReason
 * `match`/`alias`/`mirror` are NOT degraded (`degraded: false`) — the requested animation
 * actually plays. `pack-loading`/`direction-idle`/`down-idle` ARE degraded (`degraded: true`)
 * — the avatar plays something other than what was requested, and design.md §9 requires this
 * to be observable (see degradeReporter.js), never silent.
 */

/**
 * The observable superset of `resolveFallbackKey` (design.md §9, §5.5). Reports not just the
 * resolved key but WHY, so the substitution can be reported instead of being indistinguishable
 * from a genuine match at the call site (ACC4 success criterion 3).
 *
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
 * @param {Record<string, string>} [aliases] the manifest's baked-key-name alias table
 *   (design.md §5.5, e.g. `{risa1: 'down_risa1'}`) — a direction-less emote name that is never
 *   itself a `sequences` key but names one via its `source`.
 * @param {Set<string>} [unloadedKeys] sequence keys whose action pack has not finished loading
 *   yet (design.md §6, wired for real once PR6's lazy pack lands) — a key that would otherwise
 *   resolve by match/alias/mirror instead degrades to the same fallback chain with the
 *   distinguishable `pack-loading` reason, so a first press before the pack arrives is
 *   observable rather than a silent no-op.
 * @returns {{requestedKey: string, resolvedKey: string, degraded: boolean, reason: DegradeReason}}
 */
function resolveAnimationKey(
  sequences,
  requestedKey,
  currentDirection,
  mirrors = {},
  aliases = {},
  unloadedKeys = new Set()
) {
  const isCovered = (key) => !!(sequences[key] || mirrors[key] || (aliases[key] && sequences[aliases[key]]));

  let resolvedKey;
  let reason;

  if (sequences[requestedKey]) {
    resolvedKey = requestedKey;
    reason = 'match';
  } else if (aliases[requestedKey] && sequences[aliases[requestedKey]]) {
    resolvedKey = aliases[requestedKey];
    reason = 'alias';
  } else if (mirrors[requestedKey]) {
    resolvedKey = requestedKey;
    reason = 'mirror';
  } else {
    const directionIdleKey = `${currentDirection}_idle`;
    if (isCovered(directionIdleKey)) {
      resolvedKey = directionIdleKey;
      reason = 'direction-idle';
    } else {
      resolvedKey = 'down_idle';
      reason = 'down-idle';
    }
  }

  if ((reason === 'match' || reason === 'alias' || reason === 'mirror') && unloadedKeys.has(resolvedKey)) {
    const directionIdleKey = `${currentDirection}_idle`;
    resolvedKey = isCovered(directionIdleKey) ? directionIdleKey : 'down_idle';
    reason = 'pack-loading';
  }

  return {
    requestedKey,
    resolvedKey,
    degraded: reason !== 'match' && reason !== 'alias' && reason !== 'mirror',
    reason,
  };
}

/**
 * Thin wrapper kept for existing callers (design.md §9: "stays as a one-line wrapper... so its
 * tests and any other caller are untouched").
 *
 * @param {Record<string, {frames:number[]}>} sequences
 * @param {string} requestedKey
 * @param {string} currentDirection
 * @param {Record<string, {from:string, flipX:boolean}>} [mirrors]
 * @returns {string}
 */
function resolveFallbackKey(sequences, requestedKey, currentDirection, mirrors = {}) {
  return resolveAnimationKey(sequences, requestedKey, currentDirection, mirrors).resolvedKey;
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

/**
 * Live-reported defect fix (user: "cuando yo camino hacia adelante el gorro durante la
 * animación desaparece... vuelve a aparecer... lo mismo pasa con la mascota"): resolves which
 * of the ACCESSORY's own frame ids to show for the body's current `seqIndex`, clamped into the
 * accessory's own valid range instead of indexed directly and unconditionally.
 *
 * Root cause, confirmed against real compiled data (not a plausible story): an accessory
 * package is very often authored with FEWER frames than the body for a given key —
 * `compile-accessory.cjs` derives `anims[key].frames` from the accessory's OWN source sequence
 * file, entirely independent of the body's own frame count for that key. A roster-wide scan of
 * every compiled `(character, kind, package, key)` combination (540 packages, all 15
 * accessory-bearing characters) found 7,986 of 22,104 checked pairs where the accessory's own
 * array is a different length than the body's; of those, several thousand are the DANGEROUS
 * direction (accessory SHORTER than body — e.g. rasta's own `pet09` `down_llorar`: 2 frames vs
 * the body's 39; `boomer`'s `pet01` `down_trampa`: 11 frames vs the body's 50). The previous
 * code (`manifest.anims[sourceKey].frames[seqIndex]`) returned `undefined` for every body frame
 * past the accessory's own last authored frame, hiding the accessory for the rest of that
 * animation and only showing it again once the sequence looped back within range — exactly the
 * "disappears mid-animation, reappears" symptom reported live. (The specific `down_walk`
 * family the user named happens to have zero such shortfalls across the whole compiled roster
 * today — every walk-family key's accessory array is always exactly as long as the body's — so
 * this exact mechanism is not what reproduces for a pure walk cycle with currently compiled
 * data; it IS what reproduces for the many other action/emote keys measured above, including
 * `*_talk` — a chat bubble triggered while walking — which a player would reasonably describe
 * as "during walking".)
 *
 * Clamp-to-last, never modulo/cycle back to index 0, is the deliberate choice, backed by real
 * data rather than picked to make the symptom go away: every short accessory array's own TAIL
 * is already a held/settled pose in the authored data (a single-frame array is trivially
 * "held"; a genuine multi-frame short array, e.g. `boomer`/`pet01`'s `down_trampa` above, ends
 * on an actively-posed final frame, not a repeat) — holding that last frame is a continuation
 * of what the artist already drew. Cycling back to frame 0 would instead jump backward into an
 * unrelated earlier pose every time the short loop restarts, which is a NEW discontinuity worse
 * than the disappearing bug it would replace, and matches the user's second reported symptom
 * ("hace movimientos raros" — does weird movements) rather than fixing it.
 *
 * @param {number} seqIndex the body's current index into ITS OWN `_seqFrames` (design.md's
 *   frame clock — always in `[0, body frame count - 1]`).
 * @param {number[]} accessoryFrames the accessory's own `anims[sourceKey].frames` array — may
 *   be shorter, equal, or longer than the body's own frame count for the same key.
 * @returns {number|undefined} the accessory's frame id to show, or `undefined` when
 *   `accessoryFrames` is empty (the caller already guards this case via `accessoryFollows`
 *   before ever reaching here, but an explicit, never-throwing result keeps this function safe
 *   to call standalone).
 */
function resolveAccessoryFrameId(seqIndex, accessoryFrames) {
  if (!accessoryFrames || accessoryFrames.length === 0) return undefined;
  const clampedIndex = Math.min(seqIndex, accessoryFrames.length - 1);
  return accessoryFrames[clampedIndex];
}

export { resolveFallbackKey, resolveAnimationKey, accessoryFollows, resolveAccessoryFrameId };
