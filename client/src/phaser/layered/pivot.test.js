import { describe, it, expect } from 'vitest'
import { resolveRegistrationPoint, mirrorPivot, resolveRenderPosition, scaleBodyBounds, reflectPoint, reflectSpan, resolvePetSideX, resolvePieceSs, resolveAccessoryPlacement } from './pivot.js'

// design.md §13.7 (tasks.md slice 20): a piece's OWN raster supersampling factor. Only an
// ACTION key the compiler selected for the ss:1 override (design.md §13.7's measurement rule,
// tasks.md slice 20) ever differs from the manifest's global `ss` — `pack: 'base'` is never a
// key in `ssOverrides` (only action keys are eligible per the 2026-08-18 user decision).
describe('resolvePieceSs (per-piece ss, design.md §13.7)', () => {
  it('returns the manifest global ss when ssOverrides is absent (a manifest compiled before this slice)', () => {
    expect(resolvePieceSs(undefined, 'left_fall', 2)).toBe(2)
  })

  it('returns the manifest global ss for a pack not present in ssOverrides', () => {
    expect(resolvePieceSs({ left_fall: 1 }, 'base', 2)).toBe(2)
    expect(resolvePieceSs({ left_fall: 1 }, 'down_llorar', 2)).toBe(2)
  })

  it('returns the overridden ss for a pack present in ssOverrides', () => {
    expect(resolvePieceSs({ left_fall: 1 }, 'left_fall', 2)).toBe(1)
  })

  it('returns the manifest global ss when ssOverrides is an empty object', () => {
    expect(resolvePieceSs({}, 'left_fall', 2)).toBe(2)
  })
})

// design.md §8 (decision 6, a deliberate reversal, not a defect fix): clearBodySilhouetteX
// pushed the pet clear of the body "on whichever side it is already closer to" — no declared
// canonical side, so the pet could render on either side depending on direction. Approval
// tests captured that behaviour before deletion (see apply-progress.md's PR3 section for the
// captured values: right-push 29, left-push -29, already-clear 30 unchanged, from
// clearBodySilhouetteX(10|−10|30, 5, −20, 20)) — the function and that test are both removed
// together, replaced by resolvePetSideX's unconditional per-side clamp below.
describe('resolvePetSideX (unconditional clamp to the manifest-declared canonical side)', () => {
  it('clamps to the right of the body silhouette for side="right", regardless of the raw centre', () => {
    // Same fixture as the approval test's "already on/past centre" case (10, 5, -20, 20) —
    // resolvePetSideX ignores which side `center` naturally falls on and clamps to the
    // DECLARED side instead.
    expect(resolvePetSideX(10, 5, -20, 20, 'right')).toBe(29)
  })

  it('clamps to the right even when the raw centre is far to the left, for side="right"', () => {
    // The antisymmetric clearBodySilhouetteX would have pushed LEFT here (center=-10 is left
    // of the body centre 0) — resolvePetSideX must still push RIGHT because the side is
    // declared "right", proving the declared side, not proximity, now governs.
    expect(resolvePetSideX(-10, 5, -20, 20, 'right')).toBe(29)
  })

  it('clamps to the left of the body silhouette for side="left", regardless of the raw centre', () => {
    expect(resolvePetSideX(10, 5, -20, 20, 'left')).toBe(-29)
  })

  it('leaves an already-clear centre on the declared side unchanged', () => {
    expect(resolvePetSideX(30, 5, -20, 20, 'right')).toBe(30)
    expect(resolvePetSideX(-30, 5, -20, 20, 'left')).toBe(-30)
  })

  it('accepts a custom margin', () => {
    expect(resolvePetSideX(10, 5, -20, 20, 'right', 10)).toBe(35)
  })
})

// design.md §13.7 (resolved by user decision 2026-08-19, tasks.md accessory ss:1): a WHOLE
// accessory package is compiled at ss:1 when its own transfer exceeds the same 1.2 MB budget
// left_fall/left_beber were measured against. Unlike the body's per-piece `resolvePieceSs`, an
// accessory package carries ONE `ss` for its entire manifest — but `_applyFrame` renders it at
// NATIVE scale (design.md §13.7's own text: "the game's art space is ss:2 native"), so halving
// an accessory's raster density halves its ON-SCREEN size too unless something compensates.
// `resolveAccessoryPlacement` previously computed `scale` from the authoring correction alone
// (`accFrame.scale ?? baseScale ?? 1`), with no ss term at all — invisible while every shipped
// accessory was ss:2, a real defect now that ss:1 packages exist.
describe('resolveAccessoryPlacement ss-compensated scale (design.md §13.7 accessory ss:1)', () => {
  const accFrame = { regX: 0, regY: 0, originX: 0.5, originY: 0.5 }
  const bodyOrigin = [0, 0]
  const nativeSize = { width: 100, height: 100 }

  it('leaves the authoring scale unchanged at ss:2 (the project-wide reference, current shipped behaviour)', () => {
    const placement = resolveAccessoryPlacement('hat', accFrame, bodyOrigin, 2, 1, false, nativeSize)
    expect(placement.scale).toBe(1)
  })

  it('doubles the authoring scale at ss:1 so the on-screen size matches an ss:2 package of the same visual size', () => {
    const placement = resolveAccessoryPlacement('hat', accFrame, bodyOrigin, 1, 1, false, nativeSize)
    expect(placement.scale).toBe(2)
  })

  it('composes with an authoring baseScale correction rather than replacing it', () => {
    const placement = resolveAccessoryPlacement('hat', accFrame, bodyOrigin, 1, 0.75, false, nativeSize)
    expect(placement.scale).toBeCloseTo(1.5)
  })

  // Live-caught defect (found while re-running the full suite against a real ss:1-recompiled
  // `rasta/hat/minnieHat`, `mirroredDirections.integration.test.js` going RED): `x`/`y` are ALSO
  // computed via `resolveRenderPosition(..., ss)`, which converts an author-space LOGICAL point
  // into real-pixel space by multiplying by `ss` — the same real-pixel space the body's own
  // pieces live in, which is ALWAYS anchored to the project's ss:2 reference (the body itself is
  // never compiled wholesale at ss:1). Using the PACKAGE's own `ss` there (as `scale`'s bug did)
  // would halve an ss:1 accessory's real-pixel POSITION relative to an identical ss:2 package,
  // even after `scale` is correctly compensated — the anchor point itself would land in the
  // wrong place, only the sprite's SIZE around it would be right.
  it('resolves an IDENTICAL x/y position regardless of ss, for the same author-space geometry (position is ss-independent)', () => {
    const frame = { regX: 12, regY: -34, originX: 0.4, originY: 0.6 }
    const origin = [5, 100]
    const atSs2 = resolveAccessoryPlacement('hat', frame, origin, 2, 1, false, { width: 200, height: 150 })
    const atSs1 = resolveAccessoryPlacement('hat', frame, origin, 1, 1, false, { width: 100, height: 75 })
    expect(atSs1.x).toBeCloseTo(atSs2.x)
    expect(atSs1.y).toBeCloseTo(atSs2.y)
  })
})

// Live-reported defect (user, corrected wording: "cuando me pegan la animacion el pet tambien
// se mueve de posicion" — the pet shifts position when the local player is on the RECEIVING
// end of a punch). Root cause, proven live (a real Docker-built session, God/rasta/minnieHat/
// pet09, `leftdown_punch_rec`'s real 400-frame pack): `UserUppercutAnimation.launchUpwards`
// tweens `spriteAvatar.y` directly — the LayeredAvatar Container's OWN transform — to fly the
// body upward on knockback. The body's own pooled pieces are Phaser CHILDREN of that Container,
// so they move automatically with it. Hat/pet sprites are NOT children of the LayeredAvatar
// Container — they are siblings, parented directly to `containerUser` (AddUserController's own
// `createAccessoryChildren`/`createContainerUser`) — and `resolveAccessoryPlacement`'s `x`/`y`
// were computed ONLY from the body's per-frame origin (`bodyOrigin`/`frame.o`), with no term for
// wherever the LayeredAvatar Container's OWN `x`/`y` currently sits. Live trace (captured before
// this fix, `sa.y` stepped -200/-400/.../-1000 while `sa.tick()` kept re-running
// `_updateAccessory` every step): `hat`/`pet` sprite `x`/`y` stayed BIT-FOR-BIT IDENTICAL across
// every step while the body visually flew 1000px away from them — proving the accessory was
// never re-anchored to the body's own moving transform at all.
describe('resolveAccessoryPlacement containerOffset (live-reported defect: pet desyncs from the body during the punch-received knockback launch)', () => {
  const accFrame = { regX: 12, regY: -34, originX: 0.4, originY: 0.6 }
  const bodyOrigin = [5, 100]
  const nativeSize = { width: 100, height: 100 }

  it('defaults to a zero offset, matching every pre-existing call site byte-for-byte', () => {
    const withDefault = resolveAccessoryPlacement('hat', accFrame, bodyOrigin, 2, 1, false, nativeSize)
    const withExplicitZero = resolveAccessoryPlacement('hat', accFrame, bodyOrigin, 2, 1, false, nativeSize, 0, 2, 0, 0)
    expect(withDefault.x).toBe(withExplicitZero.x)
    expect(withDefault.y).toBe(withExplicitZero.y)
  })

  it('shifts x/y by exactly the given container offset, keeping every other field unchanged', () => {
    const base = resolveAccessoryPlacement('hat', accFrame, bodyOrigin, 2, 1, false, nativeSize)
    const offset = resolveAccessoryPlacement('hat', accFrame, bodyOrigin, 2, 1, false, nativeSize, 0, 2, 30, -1000)
    expect(offset.x).toBeCloseTo(base.x + 30)
    expect(offset.y).toBeCloseTo(base.y - 1000)
    expect(offset.scale).toBe(base.scale)
    expect(offset.relativeY).toBe(base.relativeY)
    expect(offset.originX).toBe(base.originX)
    expect(offset.originY).toBe(base.originY)
    expect(offset.flipX).toBe(base.flipX)
  })

  it('composes with mirroring — the offset is applied AFTER the mirrored reflection, not before', () => {
    const mirroredBase = resolveAccessoryPlacement('hat', accFrame, bodyOrigin, 2, 1, true, nativeSize)
    const mirroredOffset = resolveAccessoryPlacement('hat', accFrame, bodyOrigin, 2, 1, true, nativeSize, 0, 2, 30, -1000)
    expect(mirroredOffset.x).toBeCloseTo(mirroredBase.x + 30)
    expect(mirroredOffset.y).toBeCloseTo(mirroredBase.y - 1000)
  })
})

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
