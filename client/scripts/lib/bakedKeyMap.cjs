// design.md §5.5 (fact I): the character's baked config.json already carries the emote/action
// name-alias map. `readBakedTimings()` becomes `readBakedKeyMap()` (the file-I/O half lives in
// the compiler; this module is the pure parsing/derivation half): per baked key
// `{fps, repeat, source, flip}`, `source` being the tail of `prefix`.
//
// For every baked key B whose source S is a compiled sequence:
//   - S === B                    -> nothing (already a `sequences` key)
//   - flip === false, S !== B    -> aliases[B] = S
//   - flip === true              -> mirrors[B] = {from: S, flipX: true}
// This one data-driven mechanism replaces the old ad hoc MIRROR_SOURCE_PREFIXES loop, which
// only covered idle/talk/walk — every baked key (idle/talk/walk AND every emote/action name)
// now derives its alias/mirror the same way.

/**
 * @param {Record<string, {prefix?: string, flip_horizontally?: boolean, frameRate?: number, repeat?: number}>} baked
 *   a parsed baked `config.json`
 * @returns {Record<string, {fps: number, repeat: number, source: string, flip: boolean}>}
 */
function parseBakedConfig(baked) {
  const map = {};
  for (const [key, entry] of Object.entries(baked)) {
    if (typeof entry.frameRate !== 'number') continue;
    const prefix = entry.prefix || '';
    const source = prefix.replace(/^sprites\//, '').replace(/\/$/, '');
    map[key] = { fps: entry.frameRate, repeat: entry.repeat, source, flip: !!entry.flip_horizontally };
  }
  return map;
}

/**
 * @param {Record<string, unknown>} sequences the compiled `manifest.sequences` (base + action)
 * @param {Record<string, {fps: number, repeat: number, source: string, flip: boolean}>} bakedKeyMap
 * @returns {{aliases: Record<string,string>, mirrors: Record<string,{from:string,flipX:boolean}>}}
 */
function deriveAliasesAndMirrors(sequences, bakedKeyMap) {
  const aliases = {};
  const mirrors = {};

  for (const [key, entry] of Object.entries(bakedKeyMap)) {
    if (!sequences[entry.source]) continue; // not (yet) a compiled sequence for this character
    if (entry.source === key) continue; // already a sequences key

    if (entry.flip) {
      mirrors[key] = { from: entry.source, flipX: true };
    } else {
      aliases[key] = entry.source;
    }
  }

  checkAliasMirrorCompleteness(sequences, aliases, mirrors, bakedKeyMap);
  return { aliases, mirrors };
}

/**
 * design.md §5.5: "the compiler FAILS if a baked key's source names a compiled sequence but
 * the key lands in none of sequences/aliases/mirrors" — the gate against a silently
 * unreachable action.
 *
 * @throws {Error} naming the first unreachable baked key found
 */
function checkAliasMirrorCompleteness(sequences, aliases, mirrors, bakedKeyMap) {
  for (const [key, entry] of Object.entries(bakedKeyMap)) {
    if (!sequences[entry.source]) continue;
    const covered = !!(sequences[key] || aliases[key] || mirrors[key]);
    if (!covered) {
      throw new Error(
        `compile-layered-avatar: baked key "${key}" (source "${entry.source}") names a compiled sequence but is not reachable via sequences, aliases or mirrors (design.md §5.5).`
      );
    }
  }
}

// BLOCKER fix (2026-08-18, tasks.md slice 23 continuation): `deriveAliasesAndMirrors` above is
// driven ENTIRELY by an EXISTING baked `config.json` (`readBakedKeyMap` in the compiler) — a
// character with none (sally, ghost, wraith: no baked-legacy precedent) derives ZERO mirrors,
// so right/rightdown/rightup silently degrade to an unrelated `down_idle` pose instead of a
// mirrored left/leftdown/leftup pose (sally: 5 of 8 directions rendered, the reported blocker).
// Every `.layers.bb` in this asset set ships the SAME 15 base sequences (idle/talk/walk x
// down/left/leftdown/leftup/up) and NO right-family source art at all — the convention itself
// already encodes "right mirrors left" universally, independent of any one character's baked
// config. This derives that convention directly from the compiled `sequences` key names, as the
// FALLBACK used only when the baked config found nothing — a baked config, when present, stays
// the sole authority and this function is never consulted for that character.
const LEFT_TO_RIGHT_PREFIXES = [
  ['leftdown', 'rightdown'],
  ['leftup', 'rightup'],
  ['left', 'right'],
];

/**
 * @param {Record<string, unknown>} sequences the compiled `manifest.sequences` (base + action)
 * @returns {Record<string, {from: string, flipX: boolean}>}
 */
function deriveConventionMirrors(sequences) {
  const mirrors = {};
  for (const key of Object.keys(sequences)) {
    for (const [leftPrefix, rightPrefix] of LEFT_TO_RIGHT_PREFIXES) {
      const isBare = key === leftPrefix;
      const isPrefixed = key.startsWith(`${leftPrefix}_`);
      if (!isBare && !isPrefixed) continue;
      const mirroredKey = rightPrefix + key.slice(leftPrefix.length);
      if (!sequences[mirroredKey]) {
        mirrors[mirroredKey] = { from: key, flipX: true };
      }
      break; // longest-prefix match first (leftdown/leftup checked before bare left)
    }
  }
  return mirrors;
}

// BLOCKER fix, chicken-and-egg guard: `--emit-config-shim` (design.md §15) writes a
// baked-shaped `config.json` for a character with no real baked precedent. On a SECOND compile
// of the same character, `readBakedKeyMap` must not read that self-emitted shim back as if it
// were real baked-legacy data — real baked characters always name a concrete atlas key (e.g.
// `"rasta_atlas"`); `buildConfigShim` always emits `atlasKey: null` on every entry. This
// distinguishes the two so `deriveConventionMirrors`'s "no baked config" fallback condition
// keeps working across repeated compiles, not only on the very first one.
//
// @param {Record<string, {atlasKey?: unknown}>} rawConfig the parsed, unprocessed config.json
// @returns {boolean}
function isSelfEmittedConfigShim(rawConfig) {
  const entries = Object.values(rawConfig);
  if (entries.length === 0) return false;
  return entries.every((entry) => entry.atlasKey === null);
}

module.exports = {
  parseBakedConfig,
  deriveAliasesAndMirrors,
  checkAliasMirrorCompleteness,
  deriveConventionMirrors,
  isSelfEmittedConfigShim,
};
