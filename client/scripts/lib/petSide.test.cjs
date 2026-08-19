import { describe, it, expect } from 'vitest'
import { derivePetSide, resolvePetFrameCenterX } from './petSide.cjs'

// design.md §8, corrected 2026-08-18 (apply-progress.md's "Correction 3"): no pet package
// declares a side (fact G) — it is derived at compile time by comparing the pet's FULLY
// RESOLVED `down_idle` centre (the same formula the runtime placement uses, not the raw
// registration point) against the body's own `down_idle` frame origin. Emits "right" when the
// pet's centre sits at greater X than the body's origin, "left" otherwise. Fails on ambiguity
// (the two values within a small epsilon) unless an explicit `meta.json.side` override is
// staged.
describe('resolvePetFrameCenterX', () => {
  it('adds the origin/width correction term to the raw registration point (real pet09 down_idle numbers)', () => {
    // pet09's real compiled down_idle values: regX=-6.25, originX=-1.6482..., width=61px, ss=2.
    // Raw regX alone (-6.25) and the corrected centre disagree even on SIGN — that disagreement
    // is exactly bug 1 this module's top comment documents.
    const centerX = resolvePetFrameCenterX(-6.25, -1.6482084690553749, 61, 2)
    expect(centerX).toBeCloseTo(59.27, 1)
  })

  it('is a no-op correction when originX is exactly 0.5 (registration point already at centre)', () => {
    expect(resolvePetFrameCenterX(10, 0.5, 40, 2)).toBeCloseTo(10, 5)
  })

  it('a different width scales the correction term proportionally (not a hardcoded return)', () => {
    const narrow = resolvePetFrameCenterX(0, 0, 20, 2)
    const wide = resolvePetFrameCenterX(0, 0, 40, 2)
    expect(wide).toBeCloseTo(2 * narrow, 5)
  })
})

describe('derivePetSide', () => {
  it('derives "right" when the pet\'s resolved centre sits clearly right of the body origin (clear-right, pet09\'s real down_idle case)', () => {
    // real pet09 numbers: resolved centre 59.27, body down_idle origin 40.6 -> diff +18.67
    const result = derivePetSide(59.27, 40.6)
    expect(result).toEqual({ side: 'right', derived: true })
  })

  it('derives "left" when the pet\'s resolved centre sits clearly left of the body origin (clear-left)', () => {
    const result = derivePetSide(15.3, 28.25)
    expect(result).toEqual({ side: 'left', derived: true })
  })

  it('fails when the pet\'s resolved centre is within epsilon of the body origin (ambiguous-fails)', () => {
    expect(() => derivePetSide(31.34, 32)).toThrow(/ambiguous/i)
  })

  it('an explicit meta.json.side override wins over derivation, even against clearly opposite data (override-wins)', () => {
    // resolved centre clearly right of the body origin, but the staged annotation explicitly
    // says "left" — the override must still win, unconditionally.
    const result = derivePetSide(59.27, 40.6, { overrideSide: 'left' })
    expect(result).toEqual({ side: 'left', derived: false })
  })

  it('a custom (narrower) epsilon can resolve a case the default epsilon treats as ambiguous', () => {
    // diff is 1.2 -- within the default epsilon (2, so ambiguous) but outside a narrower 0.5
    // epsilon (so resolvable).
    expect(() => derivePetSide(11.2, 10)).toThrow(/ambiguous/i)
    expect(derivePetSide(11.2, 10, { epsilon: 0.5 })).toEqual({ side: 'right', derived: true })
  })
})
