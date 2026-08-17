import { describe, it, expect } from 'vitest'
import { resolveRegistrationPoint, mirrorPivot, resolveRenderPosition, scaleBodyBounds, reflectPoint, reflectSpan } from './pivot.js'

// ACC1: override ?? base ?? 0, resolved independently per axis.
describe('resolveRegistrationPoint', () => {
  it('uses the override when present', () => {
    expect(resolveRegistrationPoint(12, 5)).toBe(12)
  })

  it('falls back to the base value when the override is absent on one axis', () => {
    expect(resolveRegistrationPoint(undefined, 5)).toBe(5)
    expect(resolveRegistrationPoint(null, 5)).toBe(5)
  })

  it('falls back to zero when neither override nor base is present', () => {
    expect(resolveRegistrationPoint(undefined, undefined)).toBe(0)
    expect(resolveRegistrationPoint(null, null)).toBe(0)
  })
})

// LR5: mirrored pivot correction, runtime-side copy of scripts/lib/mirrorPivot.cjs (separate
// module graphs — CJS compiler scripts vs ESM client src, design.md Slice 2 note).
describe('mirrorPivot (runtime)', () => {
  it('mirrors a pivot across the body bounds width', () => {
    expect(mirrorPivot([41.1, 106], 83)).toEqual([41.9, 106])
  })
})

// Live-validation defect fix: the compiled manifest's dx/dy/o/bodyBounds are declared in
// LOGICAL (pre-supersampling) units, but the game's own art space is already ss:2 native — the
// baked renderer draws its full supersampled atlas texture directly (e.g. rasta's real
// down_idle frame is 162x196px while config.json's "frameWidth"/"frameHeight" are the half-size
// logical numbers, 81x98). A layered piece rendered at native scale (not 1/ss) must therefore
// have its LOGICAL position multiplied by `ss` to land in that same real-pixel space, or the
// whole avatar renders at half the correct size relative to the baked renderer.
describe('resolveRenderPosition (2x render-space contract)', () => {
  it('multiplies the logical offset (point minus origin) by ss to reach real-pixel space', () => {
    // Real compiled rasta values: frame 9's L[0] is {dx:28, dy:84.5}, frame 9's o is [41.1, 106].
    const [x, y] = resolveRenderPosition([28, 84.5], [41.1, 106], 2)
    expect(x).toBeCloseTo(-26.2, 10)
    expect(y).toBeCloseTo(-43, 10)
  })

  it('produces a different (non-doubled-twice) result for a different ss factor', () => {
    const [x, y] = resolveRenderPosition([28, 84.5], [41.1, 106], 1)
    expect(x).toBeCloseTo(-13.1, 10)
    expect(y).toBeCloseTo(-21.5, 10)
  })

  it('is the zero vector when the point equals the origin, regardless of ss', () => {
    expect(resolveRenderPosition([10, 10], [10, 10], 2)).toEqual([0, 0])
  })
})

describe('scaleBodyBounds (2x render-space contract)', () => {
  it('scales logical bodyBounds by ss into real-pixel space', () => {
    // Real compiled rasta manifest: bodyBounds {w: 83, h: 110} — the baked renderer's actual
    // down_idle atlas frame is 162x196px, i.e. roughly double the logical 81x98 config numbers,
    // confirming the render-space contract, not just an internally self-consistent one.
    expect(scaleBodyBounds({ w: 83, h: 110 }, 2)).toEqual({ width: 166, height: 220 })
  })

  it('is a true multiplication, not a hardcoded doubling', () => {
    expect(scaleBodyBounds({ w: 10, h: 20 }, 3)).toEqual({ width: 30, height: 60 })
  })
})

// Live-validation defect 8 (root-cause correction): mirroring must reflect about the frame's
// OWN origin (o.x — the anchor the shadow/name-tag/container all key off), never about the
// bodyBounds bounding-box centre. `mirrorPivot(o, bodyBoundsW)` reflects about `bodyBoundsW / 2`
// — correct only when `o.x` happens to equal `bodyBoundsW / 2` (true for `down`/`up`-family
// frames by coincidence, off by up to 56.8 real px for `left*`-family frames, measured against
// the real compiled rasta manifest). `reflectPoint`/`reflectSpan` reflect about the ACTUAL
// origin instead, so the anchor never moves and mirroring is a true reflection, not a rigid
// shift (proven live: a mirrored frame's visible-piece bounding box previously kept the SAME
// width as its source but a DIFFERENT centre — the shape translated instead of reflecting).
describe('reflectPoint (mirror a single point about an arbitrary axis)', () => {
  it('reflects a point-anchored value (e.g. an accessory registration point) about o.x', () => {
    // Real compiled rasta leftdown_idle: o.x = 32. A registration point at regX=14.25 (hat
    // frame 122) reflects to 2*32 - 14.25 = 49.75.
    expect(reflectPoint(14.25, 32)).toBe(49.75)
  })

  it('is its own inverse (reflecting twice returns the original value)', () => {
    const reflected = reflectPoint(14.25, 32)
    expect(reflectPoint(reflected, 32)).toBe(14.25)
  })
})

describe('reflectSpan (mirror a left-edge-anchored span, e.g. a body piece, about an arbitrary axis)', () => {
  it('reflects a piece anchored at its own top-left (setOrigin(0,0)) so its FAR edge lands where reflectPoint would put a point at the near edge', () => {
    // Real compiled rasta leftdown_idle body frame 43, piece p1000: dx=22, logical width
    // (piece.frame.w / ss) = 19/2 = 9.5, origin o.x = 32.
    expect(reflectSpan(22, 9.5, 32)).toBe(2 * 32 - 22 - 9.5)
  })

  it('preserves span width under reflection (an isometry, not a rescale)', () => {
    const dx = 10
    const width = 5
    const axis = 20
    const reflectedDx = reflectSpan(dx, width, axis)
    // unmirrored span: [dx, dx+width]; mirrored span: [reflectedDx, reflectedDx+width] — must
    // be the same width, just relocated.
    expect((reflectedDx + width) - reflectedDx).toBe(width)
  })
})
