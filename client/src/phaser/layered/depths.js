// design.md §2: single source of truth for the layered-avatar container's z-order table.
// Previously the constants (aura 0.2, hat 1.0 + 0.5, pet 1.5/0.5) were literals scattered
// across AccessoryLayer.js, LayeredAvatar.js and AddUserController.js — which is how pet-front
// (1.5) and hat (1.0 + 0.5) came to collide on the same value. Every accessory depth decision
// now reads this one table.
//
// Decision 7 (locked, a deliberate reversal, not a defect fix — proposal.md, design.md §2): the
// aura moves from 0.2 (behind the body) to 1.80 (above both body and hat), staying below the
// name tag.
const DEPTHS = {
  shadow: 0.0,
  petBehind: 0.5,
  body: 1.0,
  // The hat's resolved depth is body + clamp(zBias, hatBiasMin, hatBiasMax) — see
  // resolveAccessoryDepth below. hatMin/hatMax document the resulting inclusive band
  // [1.05, 1.55] for direct assertion in tests.
  hatBiasMin: 0.05,
  hatBiasMax: 0.55,
  hatMin: 1.05,
  hatMax: 1.55,
  petFront: 1.6,
  aura: 1.8,
  nameBackground: 2.0,
  nameText: 3.0,
};

/**
 * Clamps an authored `zBias` into `[hatBiasMin, hatBiasMax]`. Without a floor, an authored
 * `zBias: 0` frame ties the body's own depth (1.0); without a ceiling, an authored `zBias: 0.9`
 * would cross both the pet-front (1.60) and aura (1.80) depths, breaking the total order the
 * hat/body/pet/aura stack depends on for any legal authored value (design.md §2, cost 7).
 *
 * @param {number} zBias
 * @returns {number}
 */
function clampHatZBias(zBias) {
  return Math.min(DEPTHS.hatBiasMax, Math.max(DEPTHS.hatBiasMin, zBias));
}

/**
 * Pure resolver for an accessory's z-depth, given its kind and the per-frame values that
 * decide it (design.md §2/§7). Never reads Phaser objects directly — callers pass in
 * `zBias`/`relativeY` already resolved from the manifest/frame data.
 *
 * @param {'hat'|'pet'|'aura'} kind
 * @param {{zBias?: number, relativeY?: number}} [opts]
 * @returns {number}
 */
function resolveAccessoryDepth(kind, { zBias = 0, relativeY = 0 } = {}) {
  switch (kind) {
    case 'hat':
      return DEPTHS.body + clampHatZBias(zBias);
    case 'pet':
      return relativeY >= 0 ? DEPTHS.petFront : DEPTHS.petBehind;
    case 'aura':
      return DEPTHS.aura;
    default:
      throw new Error(`resolveAccessoryDepth: unknown accessory kind "${kind}"`);
  }
}

export { DEPTHS, resolveAccessoryDepth, clampHatZBias };
