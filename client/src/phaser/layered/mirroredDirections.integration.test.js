import { describe, it, expect } from 'vitest'
import { resolveFallbackKey, accessoryFollows } from './fallback.js'
import { resolveAccessoryPlacement, reflectSpan, reflectPoint, computeBodyBoundsX, resolvePetSideX, ACCESSORY_REFERENCE_SS } from './pivot.js'
import rawBodyManifest from '../../assets/game/avatars/rasta/layers/rasta.layers.manifest.json'
import { expandCompactManifest } from '../../shared/assetPipeline/compactManifest.js'

// design.md §9.1 (tasks.md slice 16): the real compiled manifest on disk is COMPACT by default
// now (`frames[].L` entries are `[pieceIndex, dx, dy]` tuples, not `{p, dx, dy}` objects) — this
// test drives the REAL production pure functions the same way the REAL runtime does, which
// always expands once, immediately after fetch (AvatarManager.js's `loadLayeredAvatar`/
// `loadLayeredActionKey`). Expanding here keeps every existing assertion below unchanged.
const bodyManifest = expandCompactManifest(rawBodyManifest)
import hatManifest from '../../assets/game/accessories/hat/rasta/minnieHat/minnieHat.accessory.json'
import petManifest from '../../assets/game/accessories/pet/rasta/pet09/pet09.accessory.json'
import hatAtlas from '../../assets/game/accessories/hat/rasta/minnieHat/minnieHat.hat.atlas.json'
import petAtlas from '../../assets/game/accessories/pet/rasta/pet09/pet09.pet.atlas.json'
import auraManifest from '../../assets/game/accessories/aura/auraElectrica/auraElectrica.accessory.json'
import auraAtlas from '../../assets/game/accessories/aura/auraElectrica/auraElectrica.aura.atlas.json'

// Regression test for live-validation defects 4 and 7: promoted from a one-off shell
// verification script into the permanent suite so this exact class of bug (mirrored
// directions falling through to a frozen single-frame fallback, hat/pet losing direction
// tracking on the mirrored side) cannot silently reappear. Runs the REAL production pure
// functions against the REAL compiled rasta body + minnieHat + pet09 manifests — not a
// hand-rolled fixture.
const ALL_EIGHT_DIRECTIONS = ['down', 'left', 'leftdown', 'leftup', 'up', 'right', 'rightdown', 'rightup']
const MIRRORED_DIRECTIONS = ['right', 'rightdown', 'rightup']

function resolveSourceKey(direction) {
  const requestedKey = `${direction}_walk`
  const resolvedKey = resolveFallbackKey(
    bodyManifest.sequences,
    requestedKey,
    direction,
    bodyManifest.mirrors
  )
  const mirrorInfo = bodyManifest.mirrors[resolvedKey]
  return { requestedKey, resolvedKey, sourceKey: mirrorInfo ? mirrorInfo.from : resolvedKey, mirrored: !!mirrorInfo }
}

describe('mirrored-direction regression (defect 4): body never falls through to down_idle', () => {
  it.each(ALL_EIGHT_DIRECTIONS)('%s_walk resolves to itself, not the down_idle fallback', (direction) => {
    const { requestedKey, resolvedKey } = resolveSourceKey(direction)
    expect(resolvedKey).toBe(requestedKey)
  })

  it.each(MIRRORED_DIRECTIONS)('%s_walk is recognised as mirrored, sourced from its left-facing key', (direction) => {
    const { sourceKey, mirrored } = resolveSourceKey(direction)
    expect(mirrored).toBe(true)
    expect(sourceKey).toMatch(/^left/)
    expect(bodyManifest.sequences[sourceKey].frames.length).toBeGreaterThan(1)
  })
})

describe('mirrored-direction regression (defect 7): hat and pet track every direction, mirrored included', () => {
  it.each(ALL_EIGHT_DIRECTIONS)('minnieHat follows the body for %s_walk with a real multi-frame sequence', (direction) => {
    const { sourceKey } = resolveSourceKey(direction)
    expect(accessoryFollows(hatManifest.anims, sourceKey)).toBe(true)
    expect(hatManifest.anims[sourceKey].frames.length).toBeGreaterThan(1)
  })

  it.each(ALL_EIGHT_DIRECTIONS)('pet09 follows the body for %s_walk with a real multi-frame sequence', (direction) => {
    const { sourceKey } = resolveSourceKey(direction)
    expect(accessoryFollows(petManifest.anims, sourceKey)).toBe(true)
    expect(petManifest.anims[sourceKey].frames.length).toBeGreaterThan(1)
  })
})

// Regression test for live-validation defect 8: accessories anchored and scaled wrong. Closes
// the exact testing gap the coordinator flagged — a fully green shell suite coexisted with a
// hat rendered nearly as large as the whole avatar, floating detached to the side, and a pet
// floating at name-tag height instead of on the ground. These assertions exercise the REAL
// resolved geometry (position, scale, resulting display width) against the REAL compiled
// rasta + minnieHat + pet09 manifests, for both a mirrored and a non-mirrored direction, so
// this exact class of bug cannot silently reappear behind a passing test count.
function findAtlasFrame(atlas, fid) {
  for (const texture of atlas.textures) {
    const found = texture.frames.find((f) => f.filename === String(fid))
    if (found) return found
  }
  return null
}

function resolveAccessoryFixture(requestedKey, kind) {
  const direction = requestedKey.split('_')[0]
  const resolvedKey = resolveFallbackKey(bodyManifest.sequences, requestedKey, direction, bodyManifest.mirrors)
  const mirrorInfo = bodyManifest.mirrors[resolvedKey]
  const sourceKey = mirrorInfo ? mirrorInfo.from : resolvedKey
  const mirrored = !!mirrorInfo
  const bodyFid = bodyManifest.sequences[sourceKey].frames[0]
  const bodyFrame = bodyManifest.frames[String(bodyFid)]
  // Root-cause correction: the body's origin is ALWAYS its own `o` now — `oMirror` no longer
  // exists in the compiled manifest at all (see pivot.js's `mirrorPivot` deprecation note and
  // compile-layered-avatar.cjs's note on why the field was dropped, not just left unused).
  const bodyOrigin = bodyFrame.o

  const manifest = kind === 'hat' ? hatManifest : petManifest
  const atlas = kind === 'hat' ? hatAtlas : petAtlas
  const accFid = manifest.anims[sourceKey].frames[0]
  const accFrame = manifest.frames[String(accFid)]
  const atlasFrame = findAtlasFrame(atlas, accFid)
  const baseScale = manifest.base && manifest.base.scale
  const baseGroundOffsetY = manifest.base && manifest.base.groundOffsetY

  const placement = resolveAccessoryPlacement(
    manifest.kind,
    accFrame,
    bodyOrigin,
    manifest.ss,
    baseScale,
    mirrored,
    { width: atlasFrame.frame.w, height: atlasFrame.frame.h },
    baseGroundOffsetY
  )
  const displayWidth = atlasFrame.frame.w * placement.scale
  const displayHeight = atlasFrame.frame.h * placement.scale
  // The sprite's rendered BOTTOM edge — not `placement.y` (the anchor/registration point) —
  // is the physically meaningful "how high off the ground does this render" quantity, because
  // Phaser's setOrigin can place that anchor point far outside the sprite's own visible pixels
  // (pet09's origin fractions run as extreme as -1.83, i.e. the registration point sits nearly
  // twice the sprite's own height above its drawn content). See resolveAccessoryPlacement's
  // "Root-cause correction 2" docblock for the full account of why asserting on `placement.y`
  // alone was the wrong test.
  const bottomEdge = placement.y + (1 - placement.originY) * displayHeight
  // Same reasoning as `bottomEdge`, applied to the horizontal axis (defect 10): the sprite's
  // rendered CENTRE — not `placement.x` (the anchor) — is what must line up with the head,
  // because `setOrigin`'s fraction can put the anchor far from the sprite's own geometric
  // centre.
  const centerX = placement.x + (0.5 - placement.originX) * displayWidth

  return { placement, displayWidth, displayHeight, bottomEdge, centerX, sourceKey, mirrored }
}

const bodyRenderWidth = bodyManifest.bodyBounds.w * bodyManifest.ss
const bodyRenderHeight = bodyManifest.bodyBounds.h * bodyManifest.ss
const DIRECTIONS_UNDER_TEST = ['down_walk', 'rightdown_walk', 'leftup_walk'] // 2 non-mirrored, 1 mirrored

describe('accessory placement regression (defect 8): pet resolves to ground level, not head height', () => {
  it.each(DIRECTIONS_UNDER_TEST)('%s: pet09 resolved BOTTOM EDGE is near ground level, comparable to the shadow (y=0)', (requestedKey) => {
    const { bottomEdge } = resolveAccessoryFixture(requestedKey, 'pet')
    // The bug this test guards against went through two forms in this same session: first the
    // pet's raw anchor sat at ~-210 (name-tag height); after an incomplete first fix the anchor
    // looked fine (~0) but the sprite's actual VISIBLE bottom edge sat at ~+210 to +243 (sunk
    // through the floor), because pet09's origin fraction is extreme (~-1.83) and was never
    // accounted for. This asserts the quantity that actually matters: where the drawn pixels
    // end up, not the anchor alone.
    expect(Math.abs(bottomEdge)).toBeLessThan(40)
  })
})

describe('accessory placement regression (defect 8): hat resolves within the body head region', () => {
  it.each(DIRECTIONS_UNDER_TEST)('%s: minnieHat resolved y falls in the upper half of the body, not below ground', (requestedKey) => {
    const { placement } = resolveAccessoryFixture(requestedKey, 'hat')
    expect(placement.y).toBeLessThan(-bodyRenderHeight / 2)
    expect(placement.y).toBeGreaterThan(-bodyRenderHeight)
  })
})

// This is a DELIBERATE aesthetic value, not a leftover fudge factor compensating for the
// defect-10 anchoring bug (that bug is now fixed and confirmed independent of scale, see the
// "scale-independence" describe block above). Recorded as an explicit assertion, per the
// coordinator's own instruction, so nobody "corrects" this back to a smaller value assuming it
// is a stale compensation constant. See apply-progress.md "hat scale: 0.5 -> 0.75" for the full
// reference-game-comparison evidence this value is based on.
describe('hat scale (deliberate aesthetic value, not a positioning-bug fudge factor)', () => {
  it('minnieHat base.scale is 0.75, chosen against the reference game after the anchoring fix', () => {
    expect(hatManifest.base.scale).toBe(0.75)
  })
})

describe('accessory placement regression (defect 8): resolved display width is a sensible fraction of the body, not ~95% of it', () => {
  it.each(DIRECTIONS_UNDER_TEST)('%s: minnieHat resolved display width is well under the body render width', (requestedKey) => {
    const { displayWidth } = resolveAccessoryFixture(requestedKey, 'hat')
    // Threshold raised from 0.6 to 0.85 for a deliberate reason, not loosened to make this
    // pass: the user chose `scale: 0.75` over the original `0.5` after comparing against the
    // reference game (a reference hat there spans ~2.4x the face width; ours at 0.5 read as "a
    // small cap"). At 0.75 the hat/body ratio is ~0.72-0.76 (matches the coordinator's own
    // live-measured table) — comfortably under 0.85, while the ORIGINAL bug this test guards
    // against (a mirror-reflected, unscaled hat at ~0.95-0.99) still fails it. See
    // apply-progress.md "hat scale: 0.5 -> 0.75" for the full reference-comparison evidence.
    expect(displayWidth / bodyRenderWidth).toBeLessThan(0.85)
  })

  it.each(DIRECTIONS_UNDER_TEST)('%s: pet09 resolved display width is well under the body render width', (requestedKey) => {
    const { displayWidth } = resolveAccessoryFixture(requestedKey, 'pet')
    expect(displayWidth / bodyRenderWidth).toBeLessThan(0.6)
  })
})

// Regression test for the DEEPER defect-8 root cause (found after a live-browser 8-direction
// audit): the body's own mirroring was itself wrong — it reflected about the bodyBounds
// bounding-box centre (`bodyBoundsW - o.x`) instead of about the frame's own origin `o.x`, the
// actual anchor the shadow/name-tag/container are keyed off. This drifted the character up to
// 56.8 real px sideways of its own shadow on `left*`-family poses (down/up-family poses were
// coincidentally close to correct because their `o.x` sits near `bodyBoundsW / 2`). The
// accessory-anchoring fix above is necessary but not sufficient without this: an accessory
// computed relative to a wrong body origin is wrong regardless of how well-anchored it is to
// that origin.
function visiblePieceBoundsX(sourceKey, mirrorDx) {
  const fid = bodyManifest.sequences[sourceKey].frames[0]
  const f = bodyManifest.frames[String(fid)]
  const ss = bodyManifest.ss
  let minX = Infinity
  let maxX = -Infinity
  f.L.forEach((l) => {
    const piece = bodyManifest.pieces[l.p]
    const dx = mirrorDx ? mirrorDx(l.dx, piece.frame.w / ss, f.o[0]) : l.dx
    const x = (dx - f.o[0]) * ss
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x + piece.frame.w)
  })
  return { minX, maxX, width: maxX - minX, cx: (minX + maxX) / 2 }
}

const MIRRORED_IDLE_PAIRS = ['left_idle', 'leftdown_idle', 'leftup_idle']

describe('body mirror regression (defect 8 root cause): mirroring reflects about the frame\'s own origin', () => {
  it.each(MIRRORED_IDLE_PAIRS)('%s: a true mirror preserves width and negates the centre (uses reflectSpan, the production function)', (sourceKey) => {
    const source = visiblePieceBoundsX(sourceKey, null)
    const mirrored = visiblePieceBoundsX(sourceKey, reflectSpan)
    // A true reflection is an isometry: width must be identical...
    expect(mirrored.width).toBeCloseTo(source.width, 6)
    // ...and its centre must be the exact negation of the source's centre (both measured
    // relative to the SAME origin, o.x=0) — this is the assertion that would have caught the
    // root-cause bug: the pre-fix code preserved width too (it was a rigid shift, not a
    // reflection) but did NOT negate the centre.
    expect(mirrored.cx).toBeCloseTo(-source.cx, 6)
  })

  it.each(MIRRORED_IDLE_PAIRS)('%s: the pre-fix "no reflection, just re-origin" model did NOT negate the centre (documents the historical bug)', (sourceKey) => {
    const source = visiblePieceBoundsX(sourceKey, null)
    // The pre-fix runtime never reflected `dx` at all — mirroring was achieved ONLY by
    // subtracting a different origin (`oMirror = bodyBoundsW - o.x`) while every piece's `dx`
    // stayed exactly as authored. Reconstructed here as a literal, undoctored replica (not
    // imported from production code, which no longer computes this) so this test documents,
    // with a real assertion, exactly what was wrong rather than merely asserting the new
    // behaviour in isolation.
    const fid = bodyManifest.sequences[sourceKey].frames[0]
    const f = bodyManifest.frames[String(fid)]
    const ss = bodyManifest.ss
    const legacyOriginX = bodyManifest.bodyBounds.w - f.o[0]
    let minX = Infinity
    let maxX = -Infinity
    f.L.forEach((l) => {
      const piece = bodyManifest.pieces[l.p]
      const x = (l.dx - legacyOriginX) * ss
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x + piece.frame.w)
    })
    const legacyCx = (minX + maxX) / 2
    // The legacy formula's width happens to match (a rigid shift preserves width), which is
    // exactly why the bug was hard to catch by eyeballing a single frame — but its centre does
    // NOT negate the source's, proving it was a shift, not a reflection.
    expect(legacyCx).not.toBeCloseTo(-source.cx, 1)
  })
})

describe('accessory mirror regression (defect 8 root cause): a hat reflects its registration point about the body\'s own origin', () => {
  it.each(['rightdown_walk', 'right_walk', 'rightup_walk'])('%s: minnieHat resolved x uses reflectPoint about the body\'s o.x, not a bodyBounds-centre reflection', (requestedKey) => {
    const { placement } = resolveAccessoryFixture(requestedKey, 'hat')
    const direction = requestedKey.split('_')[0]
    const resolvedKey = resolveFallbackKey(bodyManifest.sequences, requestedKey, direction, bodyManifest.mirrors)
    const mirrorInfo = bodyManifest.mirrors[resolvedKey]
    const sourceKey = mirrorInfo.from
    const bodyFid = bodyManifest.sequences[sourceKey].frames[0]
    const bodyOriginX = bodyManifest.frames[String(bodyFid)].o[0]
    const accFid = hatManifest.anims[sourceKey].frames[0]
    const accFrame = hatManifest.frames[String(accFid)]
    const atlasFrame = findAtlasFrame(hatAtlas, accFid)
    const ss = hatManifest.ss

    // Defect 10 fix: the resolved X is now the GEOMETRIC CENTRE (regX reflected via
    // reflectPoint, then adjusted by the sprite's own origin fraction against its native
    // width), not the bare reflected registration point — reflectPoint is still the mechanism
    // that mirrors X about the body's own o.x, just one step of a slightly longer formula now.
    const reflectedRegX = reflectPoint(accFrame.regX, bodyOriginX)
    const mirroredOriginX = 1 - accFrame.originX
    const widthLogical = atlasFrame.frame.w / ss
    const centerXLogical = reflectedRegX + (0.5 - mirroredOriginX) * widthLogical
    // ss-compensated position (design.md §13.7, resolved 2026-08-19): the LOGICAL-to-REAL-PIXEL
    // step uses the FIXED project reference ss (2), not this package's own `ss` — real-pixel
    // space is anchored to the body's own ss:2 render space regardless of which ss an individual
    // accessory package happens to be compiled at (see pivot.js's own docblock on
    // `resolveAccessoryPlacement`'s "ss-compensated scale" section for the full rationale).
    const expectedX = (centerXLogical - bodyOriginX) * ACCESSORY_REFERENCE_SS
    expect(placement.x).toBeCloseTo(expectedX, 6)
  })
})

// Regression test for live-validation defect 9: the hat was sent BEHIND the body (depth 0.6,
// under the body's depth 1.0) for the three up-family directions (up/leftup/rightup), fully
// occluding it even though the sprite itself was present, visible, correctly positioned and
// correctly textured — a player equipping a hat saw no hat at all in 3 of 8 directions. This
// was a deliberate (but wrong) back-facing zBias correction (`compile-accessory.cjs`'s
// `BACK_FACING_ANIMS`/`BACK_FACING_Z_BIAS = -0.4`), not a coordinate bug — the same
// `_updateAccessory` depth resolution (`accFrame.zBias ?? manifest.base.zBias ?? 0`) computed
// against the REAL compiled `minnieHat` manifest.
const BODY_DEPTH = 1.0

function resolveHatDepth(requestedKey) {
  const direction = requestedKey.split('_')[0]
  const resolvedKey = resolveFallbackKey(bodyManifest.sequences, requestedKey, direction, bodyManifest.mirrors)
  const mirrorInfo = bodyManifest.mirrors[resolvedKey]
  const sourceKey = mirrorInfo ? mirrorInfo.from : resolvedKey
  const accFid = hatManifest.anims[sourceKey].frames[0]
  const accFrame = hatManifest.frames[String(accFid)]
  const zBias = accFrame.zBias ?? (hatManifest.base && hatManifest.base.zBias) ?? 0
  return BODY_DEPTH + zBias
}

describe('accessory depth regression (defect 9): an equipped hat is never fully occluded by the body', () => {
  it.each(ALL_EIGHT_DIRECTIONS)('%s_idle: minnieHat resolved depth is greater than the body\'s own depth (1.0), in every direction', (direction) => {
    const depth = resolveHatDepth(`${direction}_idle`)
    expect(depth).toBeGreaterThan(BODY_DEPTH)
  })
})

// The coordinator asked whether pet09 has an equivalent problem. Pet uses a DIFFERENT, dynamic
// mechanism (ACC5's front/behind flip, `petDepth = regY >= 0 ? 1.5 : 0.5`, intentionally
// sometimes-behind-the-body by design, unlike the hat's static, erroneous zBias) — so "depth <
// body depth" is not itself a bug for a pet. What WOULD be a bug is the pet's own accessory
// package declaring a static zBias override the same (wrong) way the hat's compiler used to;
// pet09's compiled manifest is checked here to confirm it does not.
describe('accessory depth check (defect 9, pet): pet09 has no static back-facing zBias of its own', () => {
  it('pet09 frames never declare a zBias override (only the dynamic ACC5 front/behind flip applies)', () => {
    const framesWithZBias = Object.values(petManifest.frames).filter((f) => 'zBias' in f)
    expect(framesWithZBias).toHaveLength(0)
    expect(petManifest.base.zBias).toBe(0)
  })
})

// Regression test for live-validation defect 10: the hat is not centred on the head. Root
// cause (see apply-progress.md "Defect 10" for the full account): Phaser's setScale() scales a
// sprite AROUND ITS OWN ORIGIN POINT, not around its geometric centre. minnieHat's own
// registration point sits far from its geometric centre (originX as low as 0.098 — near the
// LEFT edge of its own drawn bounds), so applying the package's `scale: 0.5` correction (fix 5
// round 1) shrank the sprite toward that off-centre point, dragging the DISPLAYED centre ~30px
// away from where it sat at native scale (which was, itself, almost exactly centred on the
// body). This helper reproduces the coordinator's own "head region" heuristic — the bounding
// box of the body's VISIBLE pieces whose OWN bottom edge falls in the upper 45% of the body's
// rendered height for that pose — independently of the accessory-placement code, so the test
// cannot pass by construction.
function computeHeadRegion(sourceKey, mirrored) {
  const fid = bodyManifest.sequences[sourceKey].frames[0]
  const f = bodyManifest.frames[String(fid)]
  const ss = bodyManifest.ss

  const pieces = f.L.map((l) => {
    const piece = bodyManifest.pieces[l.p]
    const dx = mirrored ? reflectSpan(l.dx, piece.frame.w / ss, f.o[0]) : l.dx
    const x = (dx - f.o[0]) * ss
    const y = (l.dy - f.o[1]) * ss
    return { x, y, w: piece.frame.w, bottom: y + piece.frame.h }
  })

  const bodyMinY = Math.min(...pieces.map((p) => p.y))
  const bodyMaxY = Math.max(...pieces.map((p) => p.bottom))
  const headThreshold = bodyMinY + 0.45 * (bodyMaxY - bodyMinY)

  const headPieces = pieces.filter((p) => p.bottom <= headThreshold)
  const minX = Math.min(...headPieces.map((p) => p.x))
  const maxX = Math.max(...headPieces.map((p) => p.x + p.w))

  return { cx: (minX + maxX) / 2 }
}

describe('accessory placement regression (defect 10): the hat is centred on the head, not offset to one side', () => {
  it.each(ALL_EIGHT_DIRECTIONS)('%s_idle: minnieHat resolved centre lines up with the head region (independently derived), within tolerance', (direction) => {
    const requestedKey = `${direction}_idle`
    const { centerX, sourceKey, mirrored } = resolveAccessoryFixture(requestedKey, 'hat')
    const head = computeHeadRegion(sourceKey, mirrored)
    // Tolerance is data-driven, not guessed: post-fix, the two front/back-facing poses land
    // within ~10px (down ~3px, up ~10px) and the four turned poses (left/right/leftdown/
    // leftdown-mirror family) land within ~26px — against a head region 130-166px wide, this
    // is the real, measured residual after removing the scale-around-off-centre-anchor defect,
    // not a threshold picked to make the test pass. See apply-progress.md "Defect 10" for the
    // full measurement table.
    //
    // Live-confirmed (browser pass, coordinator): `down` is 1.5 CSS px off (essentially
    // perfect). The larger residual measured live for turned poses (±7 to ±12.5 CSS px) is NOT
    // chased further here — the coordinator's own "head centre" proxy (this SAME upper-45%
    // heuristic, reproduced above) is itself dragged off-centre in profile poses by rasta's
    // hair sweeping to one side, and the residual is perfectly antisymmetric across mirrors
    // (confirmed live: `left` −12.5 ↔ `right` +12.5), which is the property that actually
    // matters. Recorded as measured-and-accepted, not tuned against a proxy known to be flawed.
    expect(Math.abs(centerX - head.cx)).toBeLessThan(30)
  })
})

// The coordinator asked for an explicit assertion that centring is independent of `scale`
// (load-bearing given the hat's aesthetic scale changed from 0.5 to 0.75 in the same round —
// see the "hat scale" describe block below): resolveAccessoryPlacement's geometric-centre X
// anchor is computed BEFORE `scale` is applied to anything (scale only affects the sprite's
// final display size, never the anchor's own position), so the resolved `x` must be identical
// regardless of which scale value is in effect.
describe('accessory placement regression (defect 10, scale-independence): hat centring does not move when scale changes', () => {
  it.each(ALL_EIGHT_DIRECTIONS)('%s_idle: minnieHat resolved centre X is identical at scale 0.5, 0.75 and 1.0', (direction) => {
    const requestedKey = `${direction}_idle`
    const dir = requestedKey.split('_')[0]
    const resolvedKey = resolveFallbackKey(bodyManifest.sequences, requestedKey, dir, bodyManifest.mirrors)
    const mirrorInfo = bodyManifest.mirrors[resolvedKey]
    const sourceKey = mirrorInfo ? mirrorInfo.from : resolvedKey
    const mirrored = !!mirrorInfo
    const bodyFid = bodyManifest.sequences[sourceKey].frames[0]
    const bodyOrigin = bodyManifest.frames[String(bodyFid)].o
    const accFid = hatManifest.anims[sourceKey].frames[0]
    const accFrame = hatManifest.frames[String(accFid)]
    const atlasFrame = findAtlasFrame(hatAtlas, accFid)
    const nativeSize = { width: atlasFrame.frame.w, height: atlasFrame.frame.h }

    const xs = [0.5, 0.75, 1.0].map(
      (scale) => resolveAccessoryPlacement('hat', accFrame, bodyOrigin, hatManifest.ss, scale, mirrored, nativeSize).x
    )
    expect(xs[1]).toBeCloseTo(xs[0], 9)
    expect(xs[2]).toBeCloseTo(xs[0], 9)
  })
})

// Regression test for live-validation defect 11: the aura hangs 24px below the character's
// ground line (the shadow's own centre, container-local y=0). Root cause: the aura's declared
// anchor (`{x: 0.5, y: 0.85}`, present in the "production-shaped" source `aura.json`, not a
// compiler default) places only 85% of the frame's height above the anchor point, and
// `AccessoryLayer.createAura()` places that anchor point AT the ground line (`add.sprite(0, 0,
// ...)`) — leaving the remaining 15% (24px of a 163px frame) hanging below ground. Decision
// (documented in apply-progress.md): the aura's bottom edge should meet the ground line exactly
// (`bottom ≈ 0`), not float with an arbitrary overhang — confirmed against the actual rasterized
// frames (sampled 4 of 48: visible content's own bottom margin is 0-15px within the 163px
// frame), so anchoring the frame's bottom at the ground does not introduce a visible gap.
describe('accessory placement regression (defect 11): the aura bottom meets the ground line, not below it', () => {
  it('aura anchor.y places the frame\'s bottom edge at the ground line (bottom ≈ 0)', () => {
    const frameHeight = auraAtlas.textures[0].frames[0].sourceSize.h
    const bottom = (1 - auraManifest.anchor[1]) * frameHeight
    expect(Math.abs(bottom)).toBeLessThan(1)
  })

  it('aura anchor.x stays horizontally centred (unaffected by this fix, already confirmed correct)', () => {
    expect(auraManifest.anchor[0]).toBe(0.5)
  })
})

// Regression test for live-validation defect 12: the pet rendered ENTIRELY INSIDE the body's
// own horizontal silhouette ("appears under the leg" — the reported symptom, made worse by the
// pet's depth of 0.5, behind the body's 1.0). `resolvePetSideX` (pivot.js, design.md §8 —
// supersedes the deleted `clearBodySilhouetteX`) is the fix; this documents the historical bug
// (the RAW, uncorrected pet box genuinely does overlap the body for the exact reported pose)
// and proves the production fix clears it, for both a non-mirrored and a mirrored direction,
// using pet09's own compiled `base.side` ("left", derived by compile-accessory.cjs from its
// real down_idle-vs-down_* geometry — design.md §8) rather than a hand-picked side.
function petRawBoxX(requestedKey) {
  const { placement, displayWidth } = resolveAccessoryFixture(requestedKey, 'pet')
  return { minX: placement.x - displayWidth / 2, maxX: placement.x + displayWidth / 2, halfWidth: displayWidth / 2, centerX: placement.x }
}

function bodyBoxX(requestedKey) {
  const direction = requestedKey.split('_')[0]
  const resolvedKey = resolveFallbackKey(bodyManifest.sequences, requestedKey, direction, bodyManifest.mirrors)
  const mirrorInfo = bodyManifest.mirrors[resolvedKey]
  const sourceKey = mirrorInfo ? mirrorInfo.from : resolvedKey
  const mirrored = !!mirrorInfo
  const bodyFid = bodyManifest.sequences[sourceKey].frames[0]
  const bodyFrame = bodyManifest.frames[String(bodyFid)]
  return computeBodyBoundsX(bodyFrame.L, bodyManifest.pieces, bodyFrame.o, bodyManifest.ss, mirrored)
}

function boxesOverlap(a, b) {
  return a.minX < b.maxX && b.minX < a.maxX
}

describe('accessory placement regression (defect 12): the pet clears the body\'s own silhouette, not rendered inside it', () => {
  it('down_idle: the RAW (uncorrected) pet box does overlap the body box (documents the historical bug)', () => {
    const pet = petRawBoxX('down_idle')
    const body = bodyBoxX('down_idle')
    expect(boxesOverlap(pet, body)).toBe(true)
  })

  it.each(['down_idle', 'rightdown_idle', 'leftup_idle'])('%s: resolvePetSideX (the production fix, clamped to pet09\'s declared side) produces a pet box that does NOT overlap the body box', (requestedKey) => {
    const pet = petRawBoxX(requestedKey)
    const body = bodyBoxX(requestedKey)
    const correctedCenterX = resolvePetSideX(pet.centerX, pet.halfWidth, body.minX, body.maxX, petManifest.base.side)
    const correctedBox = { minX: correctedCenterX - pet.halfWidth, maxX: correctedCenterX + pet.halfWidth }
    expect(boxesOverlap(correctedBox, body)).toBe(false)
  })

  it('pet09\'s compiled manifest declares a canonical side (design.md §8) rather than leaving placement direction-dependent', () => {
    expect(['left', 'right']).toContain(petManifest.base.side)
  })

  it.each(['down_idle', 'rightdown_idle', 'leftup_idle', 'up_idle'])('%s: the corrected pet box stays on the declared side in every direction, proving no antisymmetric flip', (requestedKey) => {
    const pet = petRawBoxX(requestedKey)
    const body = bodyBoxX(requestedKey)
    const correctedCenterX = resolvePetSideX(pet.centerX, pet.halfWidth, body.minX, body.maxX, petManifest.base.side)
    if (petManifest.base.side === 'right') {
      expect(correctedCenterX - pet.halfWidth).toBeGreaterThanOrEqual(body.maxX)
    } else {
      expect(correctedCenterX + pet.halfWidth).toBeLessThanOrEqual(body.minX)
    }
  })
})

// Regression test for live-validation defect 12b: the pet's own bottom edge also broke the
// ground line (15.5 CSS px / 31 real px below ground for `down`, worse than the aura). Fixed by
// `manifest.base.groundOffsetY` (pivot.js's `baseGroundOffsetY` parameter), derived from the
// measured maximum bottom (37.5 real px) across ALL 15 authored body animations' compiled
// frames — not just the 8 idle poses live-measured — rounded up to 38 (19 logical) for a small
// safety margin, so the invariant holds beyond the specific poses that were directly observed.
describe('accessory placement regression (defect 12b): the pet bottom no longer breaks the ground line', () => {
  it.each(ALL_EIGHT_DIRECTIONS)('%s_idle: pet09 resolved bottom edge is at or above the ground line (bottom <= 0)', (direction) => {
    const { bottomEdge } = resolveAccessoryFixture(`${direction}_idle`, 'pet')
    expect(bottomEdge).toBeLessThanOrEqual(0)
  })
})

// Architectural finding (raised by the user, confirmed by the coordinator against the raw
// reference dump): accessory packages are PER CHARACTER in the source data — the same hat key
// (e.g. `Custom6Hat`) exists as a genuinely different package per character (different md5,
// different unique-frame counts, and decisively a different SEQUENCE LENGTH for `lilian`'s
// `up_walk`, 14 frames vs 13 for `bommer`/`rasta`). The compiler was silently dropping the
// source `meta.json`'s own `char` field, and `AccessoryManager` registers packages keyed only
// by `${kind}:${key}` — a global registry with no character scoping at all. This does not
// cause a live bug TODAY (only `rasta` is compiled in this change), but it would silently serve
// the wrong character's frames the moment a second character's accessory is compiled. Fixed
// here: the compiler no longer drops `char`. NOT fixed here (a deliberate scope decision,
// recorded in apply-progress.md "Character-scoped accessory packages"): the package IDENTITY
// itself (registry key, on-disk path) and `compatibleHats` population/retirement — those touch
// `AccessoryManager`'s public API and all 6 of its call sites across `AddUserController.js`/
// `UserChangeAccessoryController.js`, plus a `design.md`-level decision about
// `compatibleHats`'s semantics, and are judged too large for this fix round; recommended as a
// fast-follow BEFORE a second character's accessories are ever compiled.
describe('accessory character-scoping regression (architectural finding): compiled packages retain their source character', () => {
  it('minnieHat retains char: "rasta" from its staged meta.json (was silently dropped before this fix)', () => {
    expect(hatManifest.char).toBe('rasta')
  })

  it('pet09 retains char: "rasta" from its staged meta.json (was silently dropped before this fix)', () => {
    expect(petManifest.char).toBe('rasta')
  })
})
