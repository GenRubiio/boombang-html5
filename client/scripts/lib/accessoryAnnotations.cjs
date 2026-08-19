// design.md §16.1 (tasks.md slice 11 task 1): Tier 1 of the asset-authoring round-trip —
// repositioning via a committed annotation, no unpack required. `accessory-annotations.json`
// (the repo's committed, top-level copy — see `client/accessory-annotations.json`) carries
// `scale`/`groundOffsetY` (previously staged inside the DESTRUCTIBLE `.assets-src/`
// `meta.json`, lost once already to a blind re-stage per PR4's apply-progress note) and now
// `regXOffset`/`regYOffset`, keyed `<char>/<kind>/<key>` — so an offset for one character's
// package can never affect a different character's package sharing the same (kind, key).

/**
 * @param {Record<string, {scale?:number, groundOffsetY?:number, regXOffset?:number, regYOffset?:number}>} annotations
 * @param {string} character
 * @param {string} kind
 * @param {string} key
 * @returns {{scale?:number, groundOffsetY?:number, regXOffset?:number, regYOffset?:number}}
 */
function resolveAccessoryAnnotation(annotations, character, kind, key) {
  const annotationKey = `${character}/${kind}/${key}`;
  return annotations[annotationKey] || {};
}

/**
 * @param {Record<string, {regX:number, regY:number}>} frames
 * @param {number} [regXOffset]
 * @param {number} [regYOffset]
 * @returns {Record<string, object>} a NEW frames object; every entry's `regX`/`regY` shifted,
 *   every other field preserved untouched
 */
function applyRegistrationOffset(frames, regXOffset = 0, regYOffset = 0) {
  const result = {};
  for (const [fid, frame] of Object.entries(frames)) {
    result[fid] = { ...frame, regX: frame.regX + regXOffset, regY: frame.regY + regYOffset };
  }
  return result;
}

module.exports = { resolveAccessoryAnnotation, applyRegistrationOffset };
