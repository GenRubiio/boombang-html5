// ACC1: registration-point resolution (override ?? base ?? 0, per axis) and LR5's mirrored
// pivot correction, for runtime consumption. Deliberately a small independent ESM copy of
// scripts/lib/mirrorPivot.cjs's logic — the CJS compiler scripts and the ESM client `src`
// are separate module graphs today; neither imports the other (design.md Slice 2 note).

/**
 * @param {number|null|undefined} override an instance-level override value for one axis
 * @param {number|null|undefined} base the asset-declared base value for the same axis
 * @returns {number}
 */
function resolveRegistrationPoint(override, base) {
  return override ?? base ?? 0;
}

/**
 * @param {[number, number]} o source frame origin [x, y]
 * @param {number} bodyBoundsW the character manifest's declared body bounds width
 * @returns {[number, number]}
 * @deprecated Live-validation defect 8 (root-cause correction): this reflects `o` about
 * `bodyBoundsW / 2` — the union bounding box across ALL frames — instead of about the frame's
 * OWN origin, which is the actual anchor the shadow/name-tag/container key off. That is only
 * correct when a frame's `o.x` happens to sit at `bodyBoundsW / 2` (true for `down`/`up`-family
 * poses in the real compiled rasta manifest) and wrong by up to 56.8 real px for `left*`-family
 * poses (measured against the real compiled manifest and confirmed against a live-browser
 * `getBounds()` audit). No longer called by `LayeredAvatar` (which now always subtracts a
 * frame's own `o`, using `reflectPoint`/`reflectSpan` below to mirror POINTS/PIECES about that
 * SAME origin instead of computing a second, incorrect origin to subtract). Kept — not
 * deleted — because it remains a correct, independently unit-tested implementation of ITS OWN
 * documented contract (reflect about an arbitrary width's midpoint); the bug was in using it
 * for this purpose, not in the function itself. The compiled manifest's `oMirror` field
 * (produced by this same formula at compile time, `scripts/compile-layered-avatar.cjs`) is
 * likewise no longer read by the runtime; see `compile-layered-avatar.cjs`'s own note on why it
 * was removed from the manifest schema rather than left as inert, contradictory data.
 */
function mirrorPivot(o, bodyBoundsW) {
  return [bodyBoundsW - o[0], o[1]];
}

/**
 * Reflects a single point-anchored value (e.g. an accessory's registration point, or any value
 * with no extent of its own) about an arbitrary axis — typically a frame's own origin `o.x`,
 * the actual anchor the shadow/name-tag/container are keyed off (live-validation defect 8
 * root-cause correction; see `mirrorPivot`'s deprecation note for why the OLD reflection axis,
 * `bodyBoundsW / 2`, was wrong).
 *
 * @param {number} value the value to reflect (e.g. a registration point's X)
 * @param {number} axis the axis to reflect about (e.g. the frame's own `o[0]`)
 * @returns {number}
 */
function reflectPoint(value, axis) {
  return 2 * axis - value;
}

/**
 * Reflects a left-edge-anchored span (e.g. a body piece drawn with `setOrigin(0, 0)`, whose
 * LEFT edge is at `dx` and whose right edge is at `dx + width`) about an arbitrary axis, so the
 * WHOLE span mirrors as a rigid shape rather than just its corner. Combined with flipping the
 * piece's own texture (`setFlipX(true)`), this reproduces a true reflection of the piece: the
 * mirrored span's right edge lands at `reflectPoint(dx, axis)` — i.e. reflecting the corner
 * alone is exactly what this function additionally corrects for the piece's own width.
 *
 * @param {number} dx the span's un-reflected left-edge position
 * @param {number} widthLogical the span's width, in the SAME (pre-supersampling) logical units
 *   as `dx` (i.e. `piece.frame.w / ss`, since `piece.frame.w` is the native, already-ss-scaled
 *   atlas pixel width)
 * @param {number} axis the axis to reflect about (a frame's own `o[0]`)
 * @returns {number} the reflected span's new left-edge position
 */
function reflectSpan(dx, widthLogical, axis) {
  return 2 * axis - dx - widthLogical;
}

/**
 * 2x render-space contract (live-validation defect fix): the compiled manifest's dx/dy/o/
 * bodyBounds are declared in LOGICAL (pre-supersampling) units, but the game's own baked art
 * is already rendered at native ss:2 resolution (confirmed live: rasta's real baked atlas
 * frame is 162x196px while config.json's declared "frameWidth"/"frameHeight" are the half-size
 * logical numbers). A layered piece rendered at native scale (not `1/ss`) must have its logical
 * offset multiplied by `ss` to land in that same real-pixel space.
 *
 * @param {[number, number]} point a logical point (e.g. a piece's [dx, dy], or an accessory's
 *   [regX, regY])
 * @param {[number, number]} origin the logical origin to subtract (a frame's own `o` — always
 *   `o`, never a separately-mirrored origin; see the `mirrorPivot` deprecation note below)
 * @param {number} ss the manifest's declared supersampling factor
 * @returns {[number, number]} the offset in real (ss-scaled) pixel space
 */
function resolveRenderPosition(point, origin, ss) {
  return [(point[0] - origin[0]) * ss, (point[1] - origin[1]) * ss];
}

/**
 * Scales a manifest's logical bodyBounds into real-pixel space (same contract as
 * resolveRenderPosition) — used for LayeredAvatar.frame (the name-tag height calc,
 * AddUserController.js:310-311) and Container.setSize(), both of which must match the baked
 * renderer's real atlas-frame dimensions, not the logical config.json numbers.
 *
 * @param {{w: number, h: number}} bodyBounds logical body bounds from the manifest
 * @param {number} ss the manifest's declared supersampling factor
 * @returns {{width: number, height: number}}
 */
function scaleBodyBounds(bodyBounds, ss) {
  return { width: bodyBounds.w * ss, height: bodyBounds.h * ss };
}

/**
 * Resolves an accessory's render-space position, scale, origin and depth-sign relative to the
 * body's own (never-mirrored) frame origin `o` (live-validation defect 8 fix — see
 * apply-progress.md's "Defect 8" section for the full measurement table and the two rounds of
 * root-cause correction this is built on).
 *
 * Root-cause correction 1 (body mirroring): the body's OWN mirroring was itself wrong —
 * `LayeredAvatar._applyFrame` used to choose between `f.o` and `f.oMirror` (`oMirror =
 * bodyBoundsW - o.x`, reflecting about the bounding-box centre, not the frame's own anchor) —
 * measured live to drift the character up to 56.8 real px sideways of its own shadow on
 * `left*`-family poses. The fix is to ALWAYS subtract the frame's own `o` (never a second,
 * separately-mirrored origin) and instead reflect each PIECE about `o.x` via `reflectSpan`
 * (body pieces, corner-anchored) / `reflectPoint` (accessories, anchored via a fractional
 * `setOrigin`) — see `mirrorPivot`'s deprecation note. This function takes the SAME
 * `bodyOrigin` (always `frame.o`, never `oMirror`) the body itself now uses.
 *
 * Root-cause correction 2 (hat vs pet, SUPERSEDING this function's first version): a live
 * 8-direction `getBounds()` audit found the pet's bottom edge sitting ~230 real px BELOW the
 * shadow (i.e. sunk through the floor) after this function's first version stopped subtracting
 * `bodyOrigin` for a pet's `y` — that first version was reasoning from `regY` ALONE (its raw
 * value is near-zero, which looks "ground-relative" in isolation) without checking where the
 * SPRITE'S OWN VISIBLE PIXELS end up once Phaser's `setOrigin` fraction is applied. `pet09`'s
 * per-frame `originX`/`originY` fall FAR outside `[0, 1]` (e.g. `-1.83` for `down_idle`) —
 * meaning the pet's registration point sits far outside its own drawn geometry, unlike a hat's
 * (whose origin fractions stay inside `[0, 1]`). Recombining the maths shows hat and pet were
 * never actually different: `setPosition(regX_render, regY_render)` + `setOrigin(originX,
 * originY)` places the sprite's TOP-LEFT at `((regX - originX * widthLogical) - bodyOrigin.x) *
 * ss` — i.e. body-origin-relative, identically to a hat, regardless of how extreme the origin
 * fraction is. Recomputing with the body-origin subtraction RESTORED for the pet (cross-checked
 * against 7 real poses) gives a bottom edge clustered at +18.5 to +35.6 real px (just below the
 * shadow's own centre, sensible for "a ground-level entity") — versus the +222 to +243 the
 * no-subtraction version actually produced live. Hat and pet are therefore resolved
 * IDENTICALLY here; the only kind-specific behaviour left is which raw value seeds the pet's
 * depth-flip decision (see `relativeY` below) — everything else was a single, shared
 * body-origin-relative contract all along.
 *
 * @param {'hat'|'pet'|string} kind kept in the signature for forward compatibility (a future
 *   accessory kind with a genuinely different anchoring contract) and because callers already
 *   have it on hand (`manifest.kind`) — currently unused in the body, since hat and pet resolve
 *   identically (see "Root-cause correction 2" above)
 * @param {{regX:number, regY:number, originX?:number, originY?:number, scale?:number}} accFrame
 *   the resolved per-frame accessory data (ACC1: already override ?? base ?? 0 per axis)
 * @param {[number, number]} bodyOrigin the body's OWN frame origin (`frame.o` — never
 *   `oMirror`, which is no longer part of the runtime contract)
 * @param {number} ss the accessory manifest's declared supersampling factor
 * @param {number} [baseScale=1] the accessory package's own base scale correction
 *   (`manifest.base.scale`), resolved `accFrame.scale ?? baseScale ?? 1`
 * @param {number} [referenceSs=ACCESSORY_REFERENCE_SS] the ss every already-shipped accessory
 *   package was compiled at before the whole-package ss:1 rule existed (design.md §13.7,
 *   resolved 2026-08-19) — the fixed baseline `ss` is compared against, NOT the current
 *   character's own body `ss` (a hat can be worn by any character regardless of that
 *   character's own body supersampling, and the body itself is never compiled wholesale at
 *   ss:1). Only ever needs overriding by a test.
 * @param {boolean} [mirrored=false] whether the body is currently playing a mirrored key —
 *   applied identically for hat and pet (a hat/pet sprite is anchored via a FRACTIONAL
 *   `setOrigin(originX, originY)`, not a corner, so reflecting the registration point itself
 *   via `reflectPoint` and flipping the texture keep the registration point fixed under the
 *   flip on the Y axis; X is now anchored at the geometric centre regardless of mirror state —
 *   see "Root-cause correction 3" below)
 * @param {{width:number, height:number}} nativeSize the accessory's currently-set atlas frame's
 *   own native (unscaled) pixel dimensions (e.g. `sprite.frame.width/height` after
 *   `setTexture()`, or `atlasFrame.frame.w/h` from the compiled atlas JSON) — needed to resolve
 *   the geometric-centre X anchor (Root-cause correction 3)
 * @returns {{x:number, y:number, scale:number, relativeY:number, originX:number,
 *   originY:number, flipX:boolean}} `relativeY` is the sign-only input to the pet depth-flip
 *   decision (ACC5, design.md §1: `petDepth = relativeY >= 0 ? 1.5 : 0.5`) — deliberately the
 *   RAW `accFrame.regY` (ACC1's fully-resolved registration point), not a body-origin-relative
 *   delta: `regY - bodyOrigin[1]` is always strongly negative in practice (`bodyOrigin[1]` is
 *   consistently ~100-106, dominating any small `regY`), which would make the sign check
 *   constant and never actually flip. `regY`'s own sign varies across a pet package's frames
 *   (real compiled `pet09` values span -129.65 to +46.05), which is what actually lets the
 *   front/behind flip happen.
 *
 * Root-cause correction 3 (defect 10 — live evidence: the hat sits 17-61 real px off-centre
 * from the head, symmetric across mirror pairs, so NOT a mirroring bug — an anchoring error
 * already present in the un-mirrored source poses): Phaser's `setScale()` scales a sprite AROUND
 * ITS OWN ORIGIN POINT, not around its geometric centre. `hat_minnie`'s registration point sits
 * far from its own drawn geometry's centre (`originX` as low as `0.098` — near the LEFT edge of
 * its own bounds), so applying the package's `scale: 0.5` correction (defect 8 fix) shrank the
 * sprite TOWARD that off-centre point, dragging the DISPLAYED centre away from where it sat at
 * native scale. Measured proof: recomputing the SAME frames at `scale: 1` (no correction) shows
 * the hat's centre already sits almost exactly on the body centre for `down_idle` (+0.4 real px)
 * — i.e. the anchoring itself was correct; the scale correction is what introduced the drift.
 * Fix: X is now anchored at the sprite's own GEOMETRIC CENTRE in the shared logical space
 * (`regX + (0.5 - originX) * widthLogical`), with `originX` pinned to `0.5` — this makes the
 * displayed centre's screen position independent of `scale` entirely, for any scale value, not
 * just `0.5`. Y is intentionally UNTOUCHED (still the raw `regY` anchor with the authored
 * `originY` fraction): Y was never reported wrong (the hat already sits at head height in every
 * confirmed-correct direction), so only the axis that was actually broken is changed.
 *
 * @param {number} [baseGroundOffsetY=0] live-validation defect 12b fix: an optional, per-package
 *   Y correction (`accFrame.groundOffsetY ?? manifest.base.groundOffsetY ?? 0`, logical units,
 *   SUBTRACTED from `regY`) that shifts an accessory's bottom edge up so it never renders below
 *   the ground line. Derived from real data, not guessed: replaying `pet09`'s own compiled
 *   bottom-edge formula (`(regY - bodyOrigin.y) * ss + (1 - originY) * heightNative`) across
 *   EVERY frame of all 15 authored body animations (not just the 8 idle poses reported live)
 *   found a bottom ranging 18.5 to 37.5 real px — i.e. always below ground, never above, and
 *   tightly clustered. `pet09`'s `manifest.base.groundOffsetY` is set to `19` (logical, =
 *   38 real px at `ss:2`) — the measured maximum (37.5) rounded up for a small safety margin —
 *   so applying it makes the worst-case frame's bottom land at ~-0.5 (just at/above ground) and
 *   every other frame float a few px above it, never below. `hat_minnie` declares no such field
 *   (defaults to 0), so this is scoped to the one package actually measured to need it.
 *
 * ss-compensated scale (design.md §13.7, resolved 2026-08-19 — the accessory whole-package
 * ss:1 rule): `_applyFrame` renders every piece, hat and pet included, at NATIVE scale — the
 * game's own art space is ss:2 native, so a raster's pixel dimensions ARE its on-screen size
 * once the authoring `scale` correction is applied. Before this fix `scale` carried only the
 * authoring correction (`accFrame.scale ?? baseScale ?? 1`), with no ss term — correct only by
 * coincidence, because every accessory ever compiled was ss:2 until this rule existed. An
 * ss:1 package's raster is HALF the native pixel dimensions of an ss:2 package depicting the
 * same visual size, so it must be upscaled 2x on screen to match — `ACCESSORY_REFERENCE_SS / ss`
 * is that compensation factor (1 at ss:2, a no-op; 2 at ss:1).
 *
 * @param {number} [containerOffsetX=0] live-reported defect fix ("cuando me pegan la animacion
 *   el pet tambien se mueve de posicion" — the pet/hat visibly desyncs from the body while the
 *   player is on the receiving end of a punch): `x`/`y` here were ALWAYS resolved purely from
 *   the body's own per-frame origin (`bodyOrigin`), silently assuming the LayeredAvatar
 *   Container's OWN `x`/`y` transform sits at `(0, 0)` — true for ordinary play(), but NOT true
 *   during `UserUppercutAnimation.launchUpwards`, which tweens `spriteAvatar.y` (the Container's
 *   own transform) directly to fly the body upward on knockback. The body's pooled pieces are
 *   real Phaser children of that Container, so they move with it automatically; the hat/pet
 *   sprites are SIBLINGS in `containerUser` (`AddUserController.createContainerUser`), not
 *   children of the Container being tweened, so without this term their `x`/`y` stayed frozen
 *   at the ground position while the body flew away — proven live (God/rasta/minnieHat/pet09,
 *   the real `leftdown_punch_rec` pack): stepping `spriteAvatar.y` from 0 to -1000 across 5
 *   `tick()` calls left every recomputed hat/pet `x`/`y` bit-for-bit identical. Passing the
 *   LayeredAvatar's own current `this.x`/`this.y` here re-anchors the accessory to wherever the
 *   body's own Container transform currently is, exactly like a real Phaser child would.
 *   Defaults to 0 — every pre-existing call site (ordinary play(), never touching `this.x/y`)
 *   is unaffected.
 * @param {number} [containerOffsetY=0] see `containerOffsetX`.
 */
const ACCESSORY_REFERENCE_SS = 2;

function resolveAccessoryPlacement(kind, accFrame, bodyOrigin, ss, baseScale = 1, mirrored = false, nativeSize, baseGroundOffsetY = 0, referenceSs = ACCESSORY_REFERENCE_SS, containerOffsetX = 0, containerOffsetY = 0) {
  const scale = (accFrame.scale ?? baseScale ?? 1) * (referenceSs / ss);
  const regX = mirrored ? reflectPoint(accFrame.regX, bodyOrigin[0]) : accFrame.regX;
  const originXRaw = mirrored ? 1 - accFrame.originX : accFrame.originX;
  const widthLogical = nativeSize.width / ss;
  const centerXLogical = regX + (0.5 - originXRaw) * widthLogical;
  const groundOffsetY = accFrame.groundOffsetY ?? baseGroundOffsetY ?? 0;
  const regY = accFrame.regY - groundOffsetY;

  // Position is resolved into REAL-PIXEL space using `referenceSs`, NOT this package's own `ss`
  // — real-pixel space is the project-wide ss:2 render space the body's own pieces always live
  // in (the body is never compiled wholesale at ss:1), so an ss:1 accessory's anchor must land
  // at the SAME real-pixel coordinate an ss:2 package of the same author-space geometry would.
  // `centerXLogical`/`regY` are already author-space (ss-independent: `widthLogical` above
  // divides this package's OWN native pixels by its OWN `ss`, undoing exactly what its OWN
  // raster density did) — only the LOGICAL-to-REAL-PIXEL step needs the fixed reference, not the
  // NATIVE-to-LOGICAL step.
  const [x, y] = resolveRenderPosition([centerXLogical, regY], bodyOrigin, referenceSs);

  return {
    x: x + containerOffsetX,
    y: y + containerOffsetY,
    scale,
    relativeY: accFrame.regY,
    originX: 0.5,
    originY: accFrame.originY,
    flipX: mirrored,
  };
}

/**
 * Computes the body's own render-space horizontal bounding box for one frame, from its raw
 * piece list — used to clear the pet's silhouette (defect 12) against the CURRENT frame's
 * actual body extent, not a global worst-case constant. Mirrors each piece with `reflectSpan`
 * exactly like `LayeredAvatar._applyFrame` does, so a mirrored request's bbox matches wherever
 * the body actually renders.
 *
 * @param {Array<{p:string, dx:number, dy:number}>} bodyFrameL a body frame's `L` piece list
 * @param {Record<string, {frame:{w:number,h:number}}>} pieces the manifest's `pieces` dictionary
 * @param {[number, number]} bodyOrigin the body's own frame origin (`frame.o`)
 * @param {number} ss the body manifest's declared supersampling factor
 * @param {boolean} mirrored
 * @returns {{minX: number, maxX: number}}
 */
function computeBodyBoundsX(bodyFrameL, pieces, bodyOrigin, ss, mirrored) {
  let minX = Infinity;
  let maxX = -Infinity;
  bodyFrameL.forEach((l) => {
    const piece = pieces[l.p];
    const dx = mirrored ? reflectSpan(l.dx, piece.frame.w / ss, bodyOrigin[0]) : l.dx;
    const x = (dx - bodyOrigin[0]) * ss;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + piece.frame.w);
  });
  return { minX, maxX };
}

/**
 * design.md §8 (decision 6, a deliberate reversal of `clearBodySilhouetteX`'s antisymmetric-
 * under-mirroring rule — proposal.md item 2, ACC1's "pet stays on its declared side across all
 * 8 directions" requirement): an UNCONDITIONAL clamp to the pet package's manifest-declared
 * canonical side, not a nearest-side nudge. For `side: "right"` the pet's whole box lands right
 * of the body silhouette in EVERY direction, including poses where the raw (uncorrected) centre
 * naturally sits left of the body — that is exactly what "remain on that declared side across
 * all 8 directions" requires and what `clearBodySilhouetteX`'s "whichever side it is already
 * closer to" rule did not guarantee. Deleted `clearBodySilhouetteX` rather than kept-but-
 * uncalled (design.md §8: "a superseded implementation left in place as inert data is a trap");
 * its approval-tested behaviour is documented in apply-progress.md's PR3 section, not carried
 * forward as dead code.
 *
 * @param {number} center the pet's own (uncorrected) centre X
 * @param {number} halfWidth half the pet's own displayed width
 * @param {number} bodyMinX
 * @param {number} bodyMaxX
 * @param {'left'|'right'} side the pet package's manifest-declared canonical side
 *   (`manifest.base.side`, compile-accessory.cjs's `derivePetSide` — design.md §8)
 * @param {number} [margin=4] a small additional gap so the pet's edge does not touch the body's
 *   silhouette edge exactly (real px)
 * @returns {number} the corrected centre X, unconditionally clamped to the declared side
 */
function resolvePetSideX(center, halfWidth, bodyMinX, bodyMaxX, side, margin = 4) {
  return side === 'right'
    ? Math.max(center, bodyMaxX + halfWidth + margin)
    : Math.min(center, bodyMinX - halfWidth - margin);
}

/**
 * design.md §13.7 (tasks.md slice 20): a piece's OWN raster supersampling factor — 1 for an
 * action key the compiler selected for the ss:1 override (design.md §13.7's measurement rule,
 * resolved by user decision 2026-08-18: `ss:1` ONLY for whichever action key's own packed
 * transfer exceeds the M3 worst-key gate budget), the manifest's global `ss` (2, the project-
 * wide contract) for every other piece — including every base-pack piece, since `pack: 'base'`
 * is never a key in `ssOverrides` (only ACTION keys are eligible per that decision).
 * `LayeredAvatar._applyFrame` needs this per PIECE (via its own `pack`), not per character,
 * because one compiled character can mix ss:2 and ss:1 pieces across different action keys.
 *
 * @param {Record<string, number>|undefined} ssOverrides `manifest.ssOverrides` — may be absent
 *   entirely on a manifest compiled before this slice, or empty when no key needed the override.
 * @param {string} pack the piece's own `pack` field (`'base'`, or an action-key packId).
 * @param {number} defaultSs the manifest's global `ss` (design.md's project-wide contract).
 * @returns {number}
 */
function resolvePieceSs(ssOverrides, pack, defaultSs) {
  if (ssOverrides && Object.prototype.hasOwnProperty.call(ssOverrides, pack)) {
    return ssOverrides[pack];
  }
  return defaultSs;
}

export {
  resolveRegistrationPoint,
  mirrorPivot,
  resolveRenderPosition,
  scaleBodyBounds,
  reflectPoint,
  reflectSpan,
  resolveAccessoryPlacement,
  computeBodyBoundsX,
  resolvePetSideX,
  resolvePieceSs,
  ACCESSORY_REFERENCE_SS,
};
