import { describe, it, expect } from 'vitest'
import { DEPTHS, resolveAccessoryDepth } from './depths.js'

// design.md §2: single source of truth for the depth table. Previously the constants (aura
// 0.2, hat 1.0 + 0.5, pet 1.5/0.5) were literals scattered in AccessoryLayer.js,
// LayeredAvatar.js and AddUserController.js — which is how pet-front (1.5) and hat (1.0 + 0.5)
// came to collide on the same value.
describe('DEPTHS', () => {
  it('declares the full documented table, aura above body and hat', () => {
    expect(DEPTHS.shadow).toBe(0.0)
    expect(DEPTHS.petBehind).toBe(0.5)
    expect(DEPTHS.body).toBe(1.0)
    expect(DEPTHS.hatMin).toBe(1.05)
    expect(DEPTHS.hatMax).toBe(1.55)
    expect(DEPTHS.petFront).toBe(1.6)
    expect(DEPTHS.aura).toBe(1.8)
    expect(DEPTHS.nameBackground).toBe(2.0)
    expect(DEPTHS.nameText).toBe(3.0)
  })
})

describe('resolveAccessoryDepth', () => {
  it('resolves a hat depth as body + clamp(zBias, 0.05, 0.55) at the lower boundary (zBias=0)', () => {
    expect(resolveAccessoryDepth('hat', { zBias: 0 })).toBe(1.05)
  })

  it('resolves a hat depth at zBias=0.05, the exact lower clamp boundary', () => {
    expect(resolveAccessoryDepth('hat', { zBias: 0.05 })).toBe(1.05)
  })

  it('resolves a hat depth at zBias=0.55, the exact upper clamp boundary', () => {
    expect(resolveAccessoryDepth('hat', { zBias: 0.55 })).toBe(1.55)
  })

  it('clamps an authored zBias above the ceiling (0.9) down to the 0.55 boundary', () => {
    expect(resolveAccessoryDepth('hat', { zBias: 0.9 })).toBe(1.55)
  })

  it("resolves hat_minnie's shipped base.zBias: 0.5, inside the band, unclamped", () => {
    expect(resolveAccessoryDepth('hat', { zBias: 0.5 })).toBe(1.5)
  })

  it('resolves a pet in front (petFront, 1.60) when relativeY >= 0', () => {
    expect(resolveAccessoryDepth('pet', { relativeY: 0 })).toBe(1.6)
    expect(resolveAccessoryDepth('pet', { relativeY: 12.4 })).toBe(1.6)
  })

  it('resolves a pet behind (petBehind, 0.5) when relativeY < 0', () => {
    expect(resolveAccessoryDepth('pet', { relativeY: -0.01 })).toBe(0.5)
    expect(resolveAccessoryDepth('pet', { relativeY: -129.65 })).toBe(0.5)
  })

  it('resolves aura unconditionally to 1.80, independent of zBias/relativeY', () => {
    expect(resolveAccessoryDepth('aura', {})).toBe(1.8)
    expect(resolveAccessoryDepth('aura', { zBias: 5, relativeY: -50 })).toBe(1.8)
  })

  it('throws for an unknown accessory kind rather than silently returning a depth', () => {
    expect(() => resolveAccessoryDepth('scarf', {})).toThrow()
  })

  // Total-order property: for the whole legal zBias range and both relativeY signs, the
  // resolved order among every kind (plus the fixed shadow/body/name depths) must be a strict
  // total order — this is what makes the aura-above-hat-and-body reversal provably safe for
  // ANY authored zBias, not just the one shipped value.
  it('holds a total order (shadow < petBehind < body < hat < petFront < aura < nameBg < nameText) for the whole zBias range', () => {
    for (let zBias = -0.5; zBias <= 1.5; zBias += 0.05) {
      const hatDepth = resolveAccessoryDepth('hat', { zBias })
      const petBehindDepth = resolveAccessoryDepth('pet', { relativeY: -1 })
      const petFrontDepth = resolveAccessoryDepth('pet', { relativeY: 1 })
      const auraDepth = resolveAccessoryDepth('aura', {})

      expect(DEPTHS.shadow).toBeLessThan(petBehindDepth)
      expect(petBehindDepth).toBeLessThan(DEPTHS.body)
      expect(DEPTHS.body).toBeLessThan(hatDepth)
      expect(hatDepth).toBeLessThan(petFrontDepth)
      expect(petFrontDepth).toBeLessThan(auraDepth)
      expect(auraDepth).toBeLessThan(DEPTHS.nameBackground)
      expect(DEPTHS.nameBackground).toBeLessThan(DEPTHS.nameText)
    }
  })
})
