# Apply Progress: avatar-color-accessory-system

Status: all 11 slices (0-10) implemented in one continuous apply session per explicit user
instruction to complete the full vertical proof (layered colour rendering + one aura + one hat
+ one pet). `tasks.md` carries a per-slice `**Status:**` line; this file is the detailed record.

**Post-live-validation follow-up (this section added after real browser validation ran, two
rounds):**

- **Round 1**: live browser validation confirmed the whole system working end to end, found
  **one confirmed rendering defect** (layered avatar rendered at half the correct size), and the
  user requested **one new dev-only affordance** (a force-daylight toggle). Both addressed in
  Fix 1 / Fix 2 below.
- **Round 2**: with the scale fix in place, both Round-1 fixes were re-verified live and
  confirmed working (see "Round 2: verified working" below). The larger, correctly-lit avatar
  made a **third defect visible** that was previously hidden: a persisted palette is not applied
  when an avatar is *constructed* (scene entry / reconnect) — only when changed live. Addressed
  in Fix 3. Round 2 also delivered real measured performance numbers (25 avatars) and a minor
  perf-harness renderer-detection bug fix, both recorded below.
- **Round 3 — verify phase halted, four BLOCKING defects found by live in-room testing.**
  Movement threw an uncaught `TypeError` and never returned the avatar to idle; hat/pet/aura all
  rendered behind the body instead of in front; the hat never turned to face the walking
  direction, worst on the three mirrored (right-facing) directions where the frame froze
  entirely. **This directly falsifies a claim this file made in the Slice 3 write-up below (and
  that design.md §5 makes): that `LayeredAvatar`'s animation façade was complete via "two small
  edits" to existing callers.** It was not — the façade was missing `stop()`, an `anims`-shaped
  object, and a settable origin surface, and separately the fallback/mirror-resolution logic had
  a real, confirmed root-cause bug. See "Fix 4" below for the full corrected account, the
  evidence, and exactly how each part was verified (and what could NOT be verified from the
  shell, disclosed honestly rather than claimed).

## Round 2: verified working (no action taken)

- **Scale fix confirmed visually**: layered rasta renders at full height in `BelugaBeach`,
  matching baked art scale; hat, pet, swimsuit, outlines all correctly proportioned and
  positioned.
- **`VITE_FORCE_DAYLIGHT` confirmed**: the room renders in full daylight instead of a dark
  evening.
- **Cache-key non-interference confirmed live** (design.md §2's contract, Slice 2): `localStorage`
  holds `boombang_look_asset_versions` as a fully separate key; `boombang_asset_versions` is
  untouched, numeric avatar keys 1..N intact.
- **Accessories-at-construction checked, no defect found** (Fix 3 item 4 below): `userData.
  accessories` (aura/hat/pet) is already read at creation time in `AddUserController.
  createAccessoryChildren()`, unlike the palette. Verified by code inspection — this path was
  correct since Slice 8; only the palette-at-construction path had the gap.

## Fix 1 — layered avatar half-size defect (confirmed and corrected)

**Root cause, as diagnosed live:** the compiled manifest's `dx`/`dy`/`o`/`bodyBounds` values are
declared in LOGICAL (pre-supersampling) units — the same units as the baked renderer's
`config.json` `frameWidth`/`frameHeight` fields. But the baked renderer does **not** scale by
those logical numbers; `AddUserController.js`'s baked path draws the full supersampled atlas
texture directly with `spriteAvatar.setScale(scaleFactor)` (`scaleFactor` = the scene's big-scene
factor, not `1/ss`). The game's own art space is already `ss:2` native (further corroborated by
the shadow's `54 * gameConfig.DPI * scaleFactor` sizing). My original `LayeredAvatar._applyFrame`
rendered each piece at `setScale(1/manifest.ss)` (0.5) using un-scaled logical positions — this
produced an avatar at roughly half the baked renderer's real on-screen size. The
`bodyBounds.w (83) == baked down_walk frameWidth (83)` cross-check I ran during the original
apply pass matched the LOGICAL number on both sides, which is exactly why it looked like solid
evidence while the rendered *pixel* result was still half-size — logical-space self-consistency
is not the same claim as render-space correctness, and I conflated the two.

**Fix.** Pieces (body AND hat/pet accessories) now render at native scale (`1`, not `1/ss`), and
every logical position value is converted into real-pixel space via a new pure function,
`resolveRenderPosition(point, origin, ss) = [(point[0]-origin[0])*ss, (point[1]-origin[1])*ss]`,
added to `client/src/phaser/layered/pivot.js` alongside a companion `scaleBodyBounds(bodyBounds,
ss) = {width: bodyBounds.w*ss, height: bodyBounds.h*ss}`. Mirroring (`mirrorPivot`) is still
resolved in logical space first (unchanged, its own existing tests still pass unmodified), then
the result is fed through `resolveRenderPosition` for the final render-space position — keeping
the two concerns (mirror correction vs. render-space scaling) cleanly separated. Container-level
`sceneScaleFactor` handling is untouched (still applied once, at the container).

Changed: `client/src/phaser/layered/pivot.js` (2 new pure functions), `client/src/phaser/
layered/LayeredAvatar.js` (`_applyFrame`, `_updateAccessory`, the `frame` getter, and the
constructor's `setSize()` call all now go through the render-space contract instead of the old
`1/ss` piece-scale + un-scaled position approach).

**Measurement evidence (this is the strongest proof available without a browser: a headless
numeric replay of the exact production math against the real compiled manifest):**

```
$ node -e "
const manifest = require('./src/assets/game/avatars/rasta/layers/rasta.layers.manifest.json');
const ss = manifest.ss;
const frame0 = manifest.frames['0']; // down_idle
const origin = frame0.o;
let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
frame0.L.forEach(l => {
  const piece = manifest.pieces[l.p];
  const x = (l.dx - origin[0]) * ss, y = (l.dy - origin[1]) * ss;
  minX = Math.min(minX, x); maxX = Math.max(maxX, x + piece.frame.w);
  minY = Math.min(minY, y); maxY = Math.max(maxY, y + piece.frame.h);
});
console.log('rendered bbox', maxX-minX, 'x', maxY-minY);
"
rendered bbox 162 x 196
```

That is an **exact pixel-for-pixel match** to the coordinator's independently measured baked
`down_idle` atlas frame (162x196px) — not an approximation. `scaleBodyBounds(manifest.bodyBounds,
2)` gives `{width: 166, height: 220}`, slightly larger than this one frame's tight bbox because
`bodyBounds` is a bound across *all* frames (walk frames extend further) — expected and correct.

**TDD evidence for this fix:**

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| `resolveRenderPosition` | `client/src/phaser/layered/pivot.test.js` | Unit | ✅ baseline 55/55 passing (full client suite before this fix) | ✅ `TypeError: (0 , resolveRenderPosition) is not a function` (captured, all 3 new cases) | ✅ Passed (after switching 2 assertions to `toBeCloseTo` for float-precision, not logic) | ✅ 3 cases (real compiled rasta values at ss=2, a different ss=1 to prove it's a true multiplication not a hardcoded doubling, zero-vector identity case) | ✅ Clean |
| `scaleBodyBounds` | `client/src/phaser/layered/pivot.test.js` | Unit | (same run) | ✅ `TypeError: (0 , scaleBodyBounds) is not a function` (captured) | ✅ Passed | ✅ 2 cases (real 83x110→166x220, and a different ss=3 to prove true multiplication) | ✅ Clean |

Full client suite after the fix: **15 test files, 64 tests, all passing** (`npm test`).
`npm run build` clean (no new warnings). `LayeredAvatar.js`/`_updateAccessory` remain outside
direct unit tests for the same reason as before (live Phaser scene required) — the render-space
arithmetic they now delegate to is what's unit-tested above.

**Validation target restated for the orchestrator's next browser pass:** with the flag on, the
layered rasta should now appear the SAME height as the baked rasta at the same `sceneScaleFactor`
(previously it was visibly ~half height), with feet on the same ground line and the name tag at
the same vertical offset (the name-tag calc reads `spriteAvatar.frame.height * spriteAvatar.
scaleY`, and `LayeredAvatar.frame` now returns the ss-scaled bounds instead of the logical ones).
Hat/pet anchoring should track the now-correctly-sized body without drifting — reproduce exactly
as before (equip via the debug panel, cycle all 8 directions) since the same
`resolveRenderPosition` contract now governs both body and accessory placement consistently.

## Fix 2 — `VITE_FORCE_DAYLIGHT` dev/validation-only toggle (new, user-requested)

**Not part of any frozen spec for avatar-color-accessory-system** — added at the user's direct
request during live validation, to make BelugaBeach (and any other room with `darkening: true`)
render at full daylight regardless of the in-game clock, so visual checks aren't fighting an
evening darkening overlay. Recorded here as an explicitly-flagged addition, not as coverage of
`LR*`/`PAL*`/`ACC*`/`PROTO*`.

**Design.** `server/src/utils/GameClock.js` (the authoritative 24-game-hours-per-real-hour clock)
and every room's stored `darkening` column are **untouched** — this is purely a client-side
rendering skip. `client/src/phaser/PublicScene.js:392-417`'s `update()` calls
`DarkeningUtils.applySceneDarkening(this, currentGameTime, gameConfig.FORCE_DAYLIGHT)`; the new
third parameter defaults to `false`, so with the flag off this call is **byte-for-byte identical**
to the pre-existing two-argument call (verified both by code inspection — the `if (forceDaylight)`
branch never executes when the argument is `false` — and by the passing `resolveBrightness`
delegation test below). With the flag on, `applySceneDarkening` skips overlay creation/redraw
entirely and clears any existing overlay, so every room renders at full daylight instead of
drawing a no-op white multiply layer.

Changed: `client/src/utils/DarkeningUtils.js` (new `resolveBrightness(gameTime, forceDaylight)`
pure method; `applySceneDarkening` gained a third `forceDaylight = false` parameter and an early
overlay-skip branch), `client/src/phaser/PublicScene.js` (imports `gameConfig`, threads
`gameConfig.FORCE_DAYLIGHT` through the one existing call site), `client/src/config/
gameConfig.js` (`FORCE_DAYLIGHT` flag), `client/.env.example` (`VITE_FORCE_DAYLIGHT=false`,
documented as temporary/dev-only).

**TDD evidence:**

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| `DarkeningUtils.resolveBrightness` | `client/src/utils/DarkeningUtils.test.js` | Unit | N/A (file had zero prior tests) | ✅ `TypeError: default.resolveBrightness is not a function` (captured, 3 failing cases) | ✅ Passed | ✅ 3 cases (forced true at two different game times, delegation-when-false at two times, default-omitted-argument) | ✅ Clean |
| `DarkeningUtils.applySceneDarkening` (forceDaylight branch) | same file | Unit | (same run) | ⚠️ Not captured — written in the same edit pass as the `forceDaylight` parameter addition to the pre-existing method, disclosed rather than hidden (same D1-style gap as the original apply pass) | ✅ Passed — exercises the REAL method with a `null` scene arg (safe because the branch never touches `scene` when no overlay already exists), asserts `_lastBrightness === 1.0` and `_overlay` stays `null` | Triangulation skipped: this is the one new branch in an otherwise-existing method, and the `resolveBrightness` test above already triangulates the underlying decision logic this branch delegates to | ✅ Clean |

Full client suite after this fix: **15 test files, 64 tests, all passing** (same run as Fix 1,
both fixes verified together). `npm run build` clean.

**Reproduction for the orchestrator.** Set `VITE_FORCE_DAYLIGHT=true` alongside
`VITE_LAYERED_AVATARS=true`/`VITE_AVATAR_LOOK_DEBUG=true` in `client/.env.local`, restart the Vite
dev server (env vars are read once at server start, not hot-reloaded), enter any room with
darkening enabled (e.g. BelugaBeach) at any in-game hour — the room should render at full
brightness with no overlay, and toggling the flag back to `false` (and restarting) must reproduce
today's exact darkening behaviour at whatever hour the room clock reads.

**Environment note (as requested):** `client/.env.local` is untracked (gitignored) and currently
contains, from this and the coordinator's live-validation session:
```
VITE_LAYERED_AVATARS=true
VITE_AVATAR_LOOK_DEBUG=true
VITE_FORCE_DAYLIGHT=true
VITE_SERVER_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000
```
The user should remove this file once validation is complete — it is not part of the committed
change and exists only to drive local dev-server testing. Note also: a Vite dev server on
`:5173` (pid observed during this session, started before this apply pass and not started by
me) appears to still be running from the coordinator's live-validation session — I did not stop
it, since it is not a process I started and may still be in use; it will need a restart to pick
up the `VITE_FORCE_DAYLIGHT` flag for re-validation.

## Fix 3 — persisted palette not applied at avatar construction (confirmed and corrected)

**Root cause, as diagnosed live and confirmed by code inspection.** `LayeredAvatar`'s
constructor seeded `this._palette` with raw `manifest.defaults` only — it never read any saved
palette. `AddUserController.createAvatarSprite()` never passed one in either: its `new
LayeredAvatar(gameScene, 0, 0, {...})` call site had no `palette` field at all. The live-round
socket-level probe from the original apply pass proved the payload (`user_avatar_palettes`
row, and the server's `avatar_palette` field on the login/join response) survives reconnect —
it did not prove that payload ever reached the renderer, which is exactly where it was
dropped. Applying a palette change *live* worked correctly (the existing `UserChangePalette`
socket round trip calls `LayeredAvatar.applyPalette()` directly, which was never broken); only
the *construction-time* seed was wrong.

**Scope check (item 1 in the request): local vs. remote users.** `AddUserController.
createAvatarSprite()` is the ONLY code path that constructs a `LayeredAvatar` — used uniformly
for the local user (present in the initial `data.players` list handled by
`CreateSceneController.js:476`'s `AddUserController.main()` call) and every remote user (via
`NEW_USER_JOIN_SCENE` → the same `AddUserController.main()` → `processUser()` →
`createContainerUser()` → `createAvatarSprite()`). There is no separate "remote user"
construction path, so the bug — and the fix — apply identically to both, confirming the
coordinator's suspicion that nobody in a room ever saw anyone's saved colours until they
changed them live.

**Item 3 — RED, captured honestly.** The natural unit-testable seam the request asked me to
check is `paletteResolve.resolvePalette(manifest, savedPalette)` — the pure "saved over
defaults, unknown keys dropped, missing keys defaulted" function (already built in Slice 2).
I wrote three new test cases against it *before* touching any production code: an explicit
"unknown saved key is dropped" case, and the exact real-world reconnect scenario (the real
7-slot rasta manifest defaults with the real saved `color1: '#00cc44'` value from the DB). **All
three passed immediately, with no production-code change** — `resolvePalette` was already
correct. This means **the defect was not in that function; it was purely in the wiring**
(`LayeredAvatar`'s constructor and `AddUserController.createAvatarSprite()` never called it with
the saved palette at all) — exactly the alternative the request asked me to call out explicitly
rather than inventing a RED where none existed. The wiring fix itself has no capturable
automated RED: it lives inside `LayeredAvatar`'s constructor (requires a live Phaser `Scene`,
per design.md §8's existing exclusion for this class) and `AddUserController.createAvatarSprite()`
(same Phaser dependency, plus the `avatarManager`/`socket.js` singletons it imports) — consistent
with every other Phaser-instantiation-dependent gap already disclosed in this file.

**Fix.** `LayeredAvatar`'s constructor now accepts an optional `palette` config field (the
persisted per-slot map for this `(user, avatarId)` pair) and seeds `this._palette` via
`resolvePalette(manifest, palette)` instead of raw `manifest.defaults`.
`AddUserController.createAvatarSprite()` now reads `(userData.avatar_palette ||
{})[userData.avatar_id]` (server's `UserResource.js` `avatar_palette` field, a map keyed by
avatarId, already present on every `NEW_USER_JOIN_SCENE`/initial-player-list payload) and passes
it through. **No flash of default colours**: every pool child starts hidden in the constructor,
and nothing is drawn until the first `play()`/`_applyFrame()` call afterward (triggered by
`UserIdleAnimation.main()` later in the same method) — so seeding `this._palette` correctly
before that first draw means the resolved colour is what appears in the very first frame ever
shown, not a default that gets corrected a moment later.

Changed: `client/src/phaser/layered/LayeredAvatar.js` (constructor), `client/src/phaser/
controllers/scene/AddUserController.js` (`createAvatarSprite()`).

**TDD evidence:**

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| `resolvePalette` unknown-key-dropped case | `client/src/phaser/layered/paletteResolve.test.js` | Unit | ✅ 66/66 baseline (full client suite before this fix) | ⚠️ **No RED** — test passed immediately against the existing, unmodified `resolvePalette`. Disclosed per the request's explicit instruction: this confirms the pure function was already correct; approval-style confirmation, not a TDD cycle for new behavior. | ✅ Passed (unchanged) | ✅ (paired with the case below) | N/A — no code changed |
| `resolvePalette` exact reconnect-scenario reproduction (real rasta manifest + real saved `color1`) | same file | Unit | (same run) | ⚠️ Same as above — passed immediately, confirming the pure function, not exercising new logic | ✅ Passed | ✅ 3 total new cases in this pass | N/A |
| Wiring fix (`LayeredAvatar` constructor + `AddUserController.createAvatarSprite`) | — (Phaser-instantiation-dependent, not unit-testable — see design.md §8's existing exclusion for this class) | N/A | N/A | **Not capturable** — disclosed explicitly per the request's instruction rather than invented | N/A | N/A | N/A |

Full client suite after this fix: **15 test files, 66 tests, all passing** (up from 64; +2 in
`paletteResolve.test.js`).

**Item 4 — persisted accessories at construction: checked, no defect found.**
`AddUserController.createAccessoryChildren(gameScene, userData, spriteAvatar)` already reads
`userData.accessories?.aura` / `?.hat` / `?.pet` directly from the same construction-time
`userData` object used for the avatar sprite itself (implemented in Slice 8/9/10, unchanged by
this fix). This is architecturally the same kind of "resolve from userData at construction"
step the palette was missing — but for accessories it was present from the start. Verified by
code inspection (not a fresh live probe in this round, since the coordinator's own live pass
already independently confirmed hat/pet/aura all rendering correctly on the same page-reload
scene entry where the palette defect was found). No change made.

**Reproduction for the orchestrator's next browser pass:** reload the page and re-enter
`BelugaBeach` (or any room) as `God`/`test` (or any user with a saved palette) — the persisted
`color1` (or whichever slot was last saved) should now be visible on the avatar immediately on
first render, with no flash of the manifest default. Repeat with a second session/account
observing the first user's avatar to confirm the fix also applies to remote-user construction
(not just the local user).

## Performance measurement (25 avatars, live — measured by the orchestrator using this
apply pass's harness)

```
window.__perf.spawnGhosts(24) + measure():
  actualFps: 60.0
  minFps: 54.95
  fps5: 60.61
  totalDisplayObjects: 1178
  layeredPieceObjects: 1050
  evaluate() -> { pass: true }

Baseline @ 1 avatar:
  totalDisplayObjects: 50
  layeredPieceObjects: 42
```

**Go/no-go: PASS** (p5 FPS 60.61 clears the 45 floor comfortably, with the harness's own
`evaluate()` confirming `pass: true`).

**The proposal's accepted-risk forecast needs correcting, not just citing.** `proposal.md` risk 1
estimated **~500-775 display objects at 25 avatars** (25 pieces × 25 users). The measured number
is **1178** — roughly **50% above the top of that forecast range**. FPS still clears the go/no-go
floor at this count (60.61 p5 FPS, well above 45), so this is **not a blocker**, but the original
estimate was wrong on the object-count axis and this file should say so plainly rather than
repeating the stale 500-775 figure as if it were confirmed. Likely cause: the forecast's "25
pieces per avatar" was rasta's *unique frame* piece count context, not the actual live per-avatar
child-object count once the fixed-size pool (sized to the character's *maximum* per-frame piece
count, design.md §5 cost 8) plus accessory sprites (hat + pet + aura, one Image each, always
present as hidden/visible children) are all counted — `1178 / 25 ≈ 47` display objects per avatar,
not ~25. This is consistent with the pool being sized for the worst-case frame plus 3 accessory
children, and is exactly the "hidden Image objects on frames with fewer pieces than the maximum"
cost design.md §13 already named — just larger in practice than the original forecast assumed.

## Minor fix — perf-harness renderer-type detection

The harness reported `context.rendererType: "canvas/other"` while a real WebGL session (Phaser
3.90, `game.renderer.type === 2`) was running. Root cause: the harness checked
`renderer.type === 1` and labeled that WebGL — but Phaser's own `const.js` declares `AUTO: 0,
CANVAS: 1, WEBGL: 2, HEADLESS: 3` (verified against `client/node_modules/phaser/src/const.js`
directly, not assumed). `1` is `Phaser.CANVAS`. Extracted a pure `resolveRendererTypeLabel
(rendererType)` into `perfEvaluate.js` (RED: `TypeError: resolveRendererTypeLabel is not a
function`, 3 failing cases → GREEN, all 3 passing → triangulated with WEBGL/CANVAS/
unrecognised-type cases) and wired it into `PerfHarness.js` in place of the inline `=== 1`
check. `drawCalls: null` / `drawCallSource: "unavailable (falling back to display-object
count)"` was already self-reporting correctly per the spec's "draw-call *or* display-object
count" allowance — left unchanged, no fix needed there.

Full client suite after this fix: **15 test files, 69 tests, all passing** (up from 66; +3 in
`perfEvaluate.test.js`).

## Fix 4 — four blocking Round-3 defects: façade completeness, z-order, mirrored-direction freeze

**Corrected claim.** This file's Slice 3 write-up (below) and design.md §5 both claimed
`LayeredAvatar`'s animation façade covers every existing caller via "two small edits" to
`AnimationUtils.setSpriteConfig`/`UserIdleAnimation` plus what `Container` already provides. **That
claim was false.** Live in-room testing found the façade was missing `stop()`, an
`anims`-shaped object, and a settable origin surface — confirmed by a real thrown exception
(`TypeError: user.spriteAvatar.stop is not a function` at `MoveUserController.js:151`) that
aborted the tween's `onComplete` handler on every single move, silently dropping the
idle-transition and direction-tracking logic that ran after it. The design's inventory of "what
Container already provides" for the rest of the surface was accurate; its inventory of what
still needed adding was incomplete.

### Root-cause inventory: full façade contract audit

The coordinator supplied a complete call-site count (`grep spriteAvatar\.<member>` across
`client/src`). I re-ran that grep and, critically, **filtered out comments and dead code**
before drawing conclusions — several of the coordinator's raw counts were inflated by commented-
out lines (`UserUpdatePositionController.js:43`, `MoveUserToTileController.js:26`,
`SendUppercutAnimationController.js:32,52`, `UserMoveDeniedController.js:46` are all `//`
comments) and by `AddUserControllerDownloadShadow.js`, a file not imported by
`SceneResponseSockets.js`/`PublicScene.js`/`PrivateScene.js`/`MinigameScene.js`/
`CreateSceneController.js` — i.e. dead code, never on the live path. The real, live-reachable
surface (including the flag-gated `VITE_ANIMATION_AVATAR_EDITOR` debug tools, which are real
code even though not exercised in this round's repro) is:

| Member | Source | Status before this fix |
|---|---|---|
| `x`, `y`, `setPosition`, `scene`, `setScale`, `destroy`, `depth`, `setDepth`, `setVisible`, `on`, `once`, `parentContainer`, `scaleY` | `Phaser.GameObjects.Container` native (Transform/Visible/Depth/GameObject mixins) | ✅ already correct, design.md's claim here was right |
| `width`, `height`, `displayHeight`, `displayWidth` | Container's `ComputedSize` mixin, reflecting this class's own `setSize()` call | ✅ already correct (and already fixed for the ss-scale defect in Fix 1) |
| `play`, `setFlipX`, `frame`, `isLayered`, `attachAccessory`/`detachAccessory`, `_avatarId`, `_z`, `applyClipConfig` | `LayeredAvatar.js`, implemented Slices 3/8/9/10 | ✅ already implemented |
| `stop()` | — | ❌ **missing entirely** — the confirmed live crash |
| `anims` (`.currentAnim`, `.isPlaying`, `.stop()`) | — | ❌ **missing entirely** — `UserMoveDeniedController.stopAnimation()`'s own `!spriteAvatar.anims` guard silently no-ops for a layered avatar today (falls through to calling `UserIdleAnimation.main()` directly, which is harmless), but `RemoveUserController.js:17`'s unconditional `user.spriteAvatar.anims.stop()` and the debug-only `MovementControlsController.js:174` would both throw |
| `setOrigin`, `originX`, `originY` | — | ❌ **missing** — `Container`'s own `originX`/`originY` are READ-ONLY getters fixed at 0.5 (verified against `phaser/src/gameobjects/container/Container.js:255-290`) with no `setOrigin()` at all; the only real (non-comment) caller is `AvatarOriginSpriteModal.js`, gated behind `VITE_ANIMATION_AVATAR_EDITOR` |

**Fix**: added `stop()`, the `anims` object (built once in the constructor with live getters
over instance state), and `setOrigin()`/`originX`/`originY` (own getters on `LayeredAvatar`,
shadowing `Container.prototype`'s read-only versions) to `client/src/phaser/layered/
LayeredAvatar.js`. `stop()` sets `_playing = false`, which `tick()` already checks — this
freezes on the current frame exactly like a baked `Sprite.stop()`, no new state needed.

### Root cause #2 (separate bug, NOT the same as #1): mirrored directions never resolved as covered

Diagnosed from the coordinator's refined report ("depending on direction it DOES play the
animation... when walking rightdown, the frame stays fixed") plus their own manifest inspection
(confirming the compiled `mirrors` table is correct and complete). Tracing `LayeredAvatar.play()`
→ `fallback.js`'s `resolveFallbackKey(sequences, requestedKey, currentDirection)`: this function
checked ONLY `sequences` for coverage. A synthesized mirrored key (`"rightdown_walk"`,
`"right_walk"`, `"rightup_walk"`) is **never** a member of `sequences` — by design, only the 15
authored keys are (design.md §3.1 step 5) — it exists **only** in `mirrors`. So every mirrored
key was wrongly judged "not covered," fell through the two-step chain, and landed on the final
`'down_idle'` fallback — a genuine single-frame sequence (`frames: [0]`). `tick()`'s own guard
(`if (... this._seqFrames.length <= 1) return;`) means a 1-frame sequence never advances —
**this is precisely "the frame stays fixed" symptom, and it explains why only the three
right-facing directions were affected**: `down`/`left`/`leftdown`/`leftup`/`up` are all literal
keys in `sequences` and were never affected by this bug.

**This is a distinct bug from the façade gap above, not the same root cause wearing two hats —
I traced the causal chain explicitly rather than assuming they were one issue, per the
coordinator's instruction:**
- The façade gap (`stop()`/`anims` missing) causes a thrown exception in `MoveUserController.js`'s
  tween `onComplete`, which aborts `UserIdleAnimation.main()` ever running after a move — the
  practical effect is the avatar **never returns to idle and keeps looping its walk cycle
  forever** after arriving (because `tick()` is driven independently by
  `LayeredAvatarRegistry`'s own scene-level `update` hook, not by the tween's `onComplete`, so it
  is NOT frozen — it just never stops walking).
- The `resolveFallbackKey` mirror-blind-spot causes an **immediate, permanent freeze on a single
  frame** the moment a mirrored direction is requested, regardless of whether the move ever
  completes.
- Fixing #1 does NOT fix #2, and fixing #2 does NOT fix #1 — both were required, and both are
  now fixed. (I did not have a browser to confirm the "keeps looping forever" secondary symptom
  of #1 directly; it follows from `tick()`'s and `LayeredAvatarRegistry`'s code exactly as
  written, and disappears once `stop()` exists and no longer throws.)

**Fix**: `resolveFallbackKey(sequences, requestedKey, currentDirection, mirrors = {})` — a new
4th parameter, defaulted so existing callers keep working — now checks `sequences[key] ||
mirrors[key]` at both steps of the fallback chain. `LayeredAvatar.play()` passes
`this._manifest.mirrors` through and now also stores `this._sourceKey` (the canonical,
unmirrored key actually used to look up `sequences`/`frames` — e.g. `"leftdown_walk"` when
`_seqKey` is `"rightdown_walk"`).

**Accessory half of the same bug, found while fixing #2**: `_updateAccessory()` looked up the
accessory's own `manifest.anims` by `this._seqKey` (the mirrored key) — but an accessory package
**never** gets synthesized mirror entries either (only the body compiler produces a `mirrors`
table; Slice 9/10's accessory compiler only ever emits the 15 authored keys). So even once the
body itself was fixed, the hat/pet would still vanish (`accessoryFollows` returns false) for
every mirrored direction — this is **defect 7**, confirmed as a real, distinct bug, not merely a
symptom of #1. Fixed by changing `_updateAccessory()` to look up the accessory's own `anims` by
`this._sourceKey` instead of `this._seqKey`, while still applying `this._mirrored` for the
texture flip and pivot mirroring exactly as before. Checked whether the pet has the identical
problem, per the request: **yes, same code path, same fix, confirmed together** (see verification
below).

### `_mirrored` — one owner, decided and documented

The coordinator flagged a latent risk: `play()` and `setFlipX()` both write `this._mirrored`,
and if both were ever called for the same frame with disagreeing values, `_applyFrame()`/
`_updateAccessory()` would draw a mirrored pivot against unmirrored source data or vice versa.
**Decision: `play()` is the sole authority.** It re-derives `_mirrored` from
`manifest.mirrors[resolvedKey]` on every call, from the same manifest data it just used to pick
the frame — it can never disagree with what is about to render. `setFlipX()` is kept as a plain,
honest setter (API-surface parity with a baked `Sprite`) but is documented in its own docblock as
non-authoritative; in the current codebase it is **never actually reached for a layered
avatar** — confirmed by inspection: `AnimationUtils.setSpriteConfig()`'s layered branch returns
via `applyClipConfig()` *before* it would call `setFlipX()` (that line is skipped entirely for
`isLayered` sprites), and the only other caller, `AnimationEditorController.js`, is gated behind
`VITE_ANIMATION_AVATAR_EDITOR`, off in this round's environment. So the theoretical race the
coordinator raised is real as a design smell but was not, and could not have been, the active
cause of the reported freeze; documented and closed as a "one owner, in writing" fix rather than
a behavior change.

### Root cause #3: accessory z-order (defects 5, 6) — `Container` never auto-sorts by depth

Confirmed by reading Phaser's own source rather than reasoning from the intended depth numbers,
per the coordinator's explicit instruction: `phaser/src/gameobjects/container/
ContainerWebGLRenderer.js` renders `container.list` with a **plain `for` loop over array index**
— it never reads `.depth` at all. `Container.prototype.sort(property, handler)`
(`phaser/src/gameobjects/container/Container.js:621`) is a **manual, on-demand** method (`var
handler = (a, b) => a[property] - b[property]`, an ascending, spec-stable sort since ES2019) —
nothing calls it automatically when a child's `.depth` changes. Depth-driven auto-sort is a
feature of the top-level Scene *display list*, not of a `Container`'s own children. **The
design's stated assumption — "Phaser's Container already re-sorts on a child setDepth — that is
how today's 0/1/2/3 works" — was wrong.** Today's baked 4-element container (shadow/avatar/
nameBg/nameText) only ever *looked* correctly ordered because those four children happen to be
inserted into the array in exactly that depth order at construction — array-insertion order,
not depth, is what actually governs render order inside a Container. Once
`createAccessoryChildren()` inserted aura/hat/pet **before** `spriteAvatar` in the array (to keep
depths `0.2`/dynamic/`1.0+zBias` "logically between" shadow and body), every accessory rendered
behind the body regardless of its `.depth` value — one systemic bug producing all of defects 5
and 6, not three separate ones, exactly as the coordinator suspected.

**Fix, three call sites, all necessary:**
1. `AddUserController.createContainerUser()`: after building `containerUser`, calls
   `containerUser.sort('depth')` once — but only when `accessoryChildren.length > 0`, so the
   baked/no-accessory path (already in depth order) never executes this call at all (LR6
   flag-off parity: literally the same code path as before when there are no accessories).
2. `LayeredAvatar._updateAllAccessories()`: calls `this.parentContainer.sort('depth')` (guarded
   against `parentContainer` being null, which it is during construction before `containerUser`
   exists) after every accessory update — because the pet's depth flips every frame
   (`0.5`/`1.5`) and a hat's `zBias` changes when its direction crosses the back-facing
   boundary, so a ONE-TIME sort at construction is not sufficient; this keeps re-sorting on
   every subsequent frame tick, cheap for an array of ~4-7 children.
3. `UserChangeAccessoryController.js` (client, live equip/unequip): calls `container.sort('depth')`
   immediately after `container.add(sprite)` in all three of `applyAura`/`applyHat`/`applyPet` —
   `Container.add()` always appends to the end of the array (topmost) regardless of `.depth`, so
   without this a freshly-equipped accessory would render on top of the name tag until the next
   body frame tick happened to re-sort it.

**Final intended z-order** (unchanged from the original design, now actually enforced):
`shadow (0.0) → aura (0.2) → pet (0.5 or 1.5, dynamic) → body (1.0) → hat (1.0 + zBias, default
1.5) → nameBg (2.0) → nameText (3.0)`.

### How each part was verified (shell-only this round — no browser available)

1. **Façade completeness**: I attempted to instantiate `LayeredAvatar` directly (both a bare
   Node script and a vitest test) to check the contract programmatically. **Both failed
   identically and are disclosed here as concrete, not asserted, evidence**: `import Phaser from
   'phaser'` throws `ReferenceError: window is not defined` at
   `node_modules/phaser/src/device/OS.js:153` — Phaser touches `navigator.userAgent`/
   `window.cordova` etc. at **module load time**, before any instantiation is even attempted, so
   this is not fixable by mocking a fake `scene` object; the whole package requires a browser-
   like global environment just to be `require()`d. This project's vitest config deliberately
   has no jsdom (design.md §8), and adding one was judged out of scope for this fix round. The
   façade's completeness against the coordinator's full call-site table was therefore verified
   by **source-level audit** (the table above), not by instantiation — disclosed as such rather
   than fabricating a pass.
2. **Draw order**: verified the ARITHMETIC (not a live Phaser render) with a standalone script
   that reproduces the exact insertion order `createContainerUser()`/`createAccessoryChildren()`
   produce and the exact depths this change assigns, then applies the identical ascending-stable
   comparator Phaser's real `Container.sort('depth')` uses (confirmed from source, quoted
   above): the result matches the intended `shadow, aura, pet, body, hat, nameBg, nameText`
   order exactly. This proves the integration logic is correct; the actual on-screen render
   still needs a browser pass — marked as such below, not claimed as visually confirmed.
3. **Mirrored-direction / hat+pet direction tracking**: verified against the REAL compiled
   `rasta.layers.manifest.json`, `hat_minnie.accessory.json`, and `pet09.accessory.json` — not a
   hand-rolled fixture — for **all 8 directions**, exactly as the coordinator's acceptance test
   specified. This is now a permanent regression test
   (`client/src/phaser/layered/mirroredDirections.integration.test.js`, 27 assertions), promoted
   from the one-off verification script used to develop the fix. Result: every one of the 8
   directions (including all 3 mirrored ones) resolves to itself (never falls through to
   `down_idle`), and both `hat_minnie` and `pet09` report a real, multi-frame `anims` entry for
   the correct source key in all 8 cases.
4. **`MoveUserController`'s `onComplete` not throwing**: **not verified live** (same Phaser-
   instantiation blocker as #1) — the fix removes the specific missing methods the captured
   stack trace named (`stop`), so the exception class is gone by construction, but I could not
   drive an actual tween completion in this environment. Marked for the browser pass.

**What still needs the browser pass** (cannot be honestly claimed as verified from this shell):
the ACTUAL on-screen render order, the ACTUAL absence of the `TypeError` in a live console, and
the ACTUAL visual smoothness of hat/pet tracking through a real walk in all 8 directions —
reproduction steps below.

### Reproduction for the orchestrator's next browser pass

With `VITE_LAYERED_AVATARS=true` in `client/.env.local`, `God`/`test` on avatar 12 (rasta) in
`BelugaBeach`:
1. Click 8 different floor positions, one in each logical direction from the avatar's current
   position (down, left, leftdown, leftup, up, right, rightdown, rightup). For each: confirm (a)
   no `TypeError` in the console, (b) the walk animation plays facing the correct direction, (c)
   on arrival the avatar settles into the matching idle pose (not stuck mid-walk-cycle, not
   frozen), (d) the equipped hat and pet visually track the same direction and are not hidden.
2. With hat + pet + aura all equipped, confirm the render order top-to-bottom is: name tag,
   name background, hat, body, pet-or-body (pet in front when nearer camera, behind otherwise),
   aura, shadow — i.e. hat clearly ABOVE the head, pet and aura clearly NOT hidden behind the
   body.
3. Repeat the palette/persistence/ACK checks from Rounds 1-2 to confirm no regression.

Full client suite after this fix: **16 test files, 100 tests, all passing** (up from 69; +4 in
`fallback.test.js` for the mirror-aware `resolveFallbackKey`, +27 in the new
`mirroredDirections.integration.test.js`). `npm run build` clean.

## Fix 5 — defect 8: accessories anchored and scaled wrong, root-caused to the body's own
mirror math (confirmed and corrected in two rounds; the second round supersedes the first
round's pet analysis — both rounds are recorded here since the first round's incorrect pet
conclusion, and how the second round's live evidence overturned it, is itself part of the
record of what was tried and why)

### Round 1 — accessory-only fix (position + scale), based on the initial single-frame report

**The report, verbatim measurements (idle, mirrored, `_sourceKey: "leftdown_idle"`, `_mirrored:
true`, body `scaleX` = 1, container-local px):**

| Child | depth | x | y | displayWidth |
|---|---|---|---|---|
| shadow | 0 | 0 | 0 | 108 |
| pet | 0.5 | 111 | -210 | 69 |
| body | 1 | 0 | 0 | 166 |
| hat | 1.5 | 36 | -143 | 158 |
| nameBg | 2 | 0 | -214 | 62 |

Reproduced exactly from the real compiled manifests, by hand, against the pre-fix formula
(`resolveRenderPosition([mirrorPivot(regX), regY], mirrored ? oMirror : o, ss)`, `setScale(1)`):
for `leftdown_idle`, `hat_minnie` frame 122 (`regX:14.25, regY:27.25`) against body frame 43's
`oMirror:[51, 98.9]` gives `x=35.5, y=-143.3` — matches the measured `36,-143` bit-for-bit.
`pet09` frame 51 (`regX:-23.45, regY:-6`) against the same origin gives `x=110.9, y=-209.8` —
matches the measured `111,-210` bit-for-bit.

**X was mirror-reflected when the body's own pieces never were (at the time).**
`LayeredAvatar._applyFrame` (the body's own per-piece renderer) never reflected a piece's `dx`
when mirrored — it only swapped which origin (`o` vs `oMirror`) got subtracted. The pre-fix
`_updateAccessory` instead ran the accessory's `regX` through `mirrorPivot` before subtracting
the origin — a real reflection applied to the ACCESSORY while the BODY beneath it was merely
rigidly shifted (algebraically: `(dx - oMirror.x)*ss - (dx - o.x)*ss = (2*o.x - bodyBoundsW)*ss`,
a constant independent of `dx` — every mirrored body frame was a fixed translation of the
unmirrored one, not a reflection). Round 1's fix: stop reflecting `regX` for the accessory too.
This was directionally right (the accessory should never disagree with what the body — however
it renders — actually does) but Round 2 (below) found the body's OWN translation-not-reflection
behaviour was itself the deeper bug, which needed fixing at its source, not matched.

**Round 1's pet conclusion — WRONG, corrected in Round 2.** Cross-checking `pet09.regY -
body.o.y` for 7 real poses gave a near-constant **-105 ± 1.3**, which Round 1 read as "`regY` is
already a small, ground-relative offset — stop subtracting `body.o.y` for a pet." That
conclusion was incomplete: it only checked where the pet's ANCHOR POINT would land, never where
the sprite's actual VISIBLE PIXELS end up once Phaser's `setOrigin` fraction is applied. See
Round 2 for why this made the live symptom worse, not better.

**Scale — hat_minnie's raw geometry really is ~2x too large relative to the character's head,
an authored-asset property, not a pipeline bug (this finding stands, unaffected by Round 2).**
Rendered the RAW staged SVG geometry for both packages directly (`sharp`, same density the
compiler uses) and viewed the output. `pet09`'s raw `down_idle` bounds are 30.7×42.9 (logical)
against `bodyBounds` 83×110 — a small, sensible "pet beside its owner" size, and its LIVE
`displayWidth` (69, 42% of body render width) matches with **zero code change** (`pet09`
recompiles byte-identical after the compiler change below — `shasum` + JSON diff confirmed).
`hat_minnie`'s raw `down_idle`/`leftdown_idle` bounds are 82×71 / 79×79 — essentially the
ENTIRE character's bounding box — and the rendered raster (viewed directly) is a legitimate,
cleanly-authored Minnie-ears-and-bow headband, not an artifact. No discrepancy in `ss`/density
handling between the two packages (both `density:144`, confirmed empirically: `sharp` renders a
79-unit viewBox at 79px@72dpi / 158px@144dpi). Fix: an OPTIONAL per-package `scale` correction,
resolved `accFrame.scale ?? manifest.base.scale ?? 1` (same override-then-base-then-default
shape as ACC1), read by `compile-accessory.cjs` from an optional `meta.json` `scale` field (so
it survives a recompile) and applied via `sprite.setScale(scale)`. Set `hat_minnie`'s staged
`.assets-src/accessories/hat_minnie/meta.json` to `"scale": 0.5` (halves `displayWidth` 158→79,
~48% of body render width, close to but under the character's own head width). `pet09`'s
`meta.json` has no `scale` field (defaults to 1) — recompiled and confirmed byte-identical.

### Round 2 — the coordinator's own live 8-direction `getBounds()` audit found the ROOT CAUSE
upstream, in the body's own mirror math, plus a second bug in Round 1's pet fix

**New live evidence (idle, all 8 directions, `getBounds()` relative to the shadow's centre):**

| dir | mirrored | body cx | body bottom | body w | hat cx | hat bottom | pet cx | pet bottom |
|---|---|---|---|---|---|---|---|---|
| down | no | 0 | 0 | 162 | -30 | -126 | 119 | 243 |
| leftdown | no | 9 | 6 | 159 | -4 | -88 | 63 | 222 |
| left | no | 13 | 0 | 166 | -34 | -136 | 31 | 240 |
| leftup | no | 13 | 6 | 166 | MISSING | — | 37 | 234 |
| up | no | 8 | 1 | 175 | MISSING | — | 113 | 242 |
| rightup | yes | -3 | 6 | 198 | MISSING | — | 37 | 234 |
| right | yes | -7 | 0 | 175 | -87 | -136 | 31 | 240 |
| rightdown | yes | -11 | 6 | 183 | -42 | -88 | 63 | 222 |

Two findings from this table drove Round 2, and one ("pet bottom") directly falsifies Round 1's
pet fix:

**Root cause A (real): the body's mirroring reflects about the WRONG axis.** The body's
`_applyFrame` chose between `f.o` and `f.oMirror` (`oMirror = bodyBoundsW - o.x`) — reflecting
about the bodyBounds bounding-box CENTRE, not the frame's own anchor `o.x` (the point the
shadow/name-tag/container are keyed off). This is correct only when a frame's own `o.x`
coincidentally sits at `bodyBoundsW/2` (true for `down`/`up`-family poses, whose `body cx` above
is ~0/8 — small) and wrong by up to **56.8 real px** for `left*`-family poses (measured
directly: `(2*o.x - bodyBoundsW)*ss` for `leftdown_idle`=38.0, `left_idle`=53.0,
`leftup_idle`=56.8). This is the literal cause of "the character itself shifts sideways over the
shadow" when mirrored/direction-switching.

**A measurement artifact, NOT a second real bug: "mirroring spreads the body" (body w changing,
e.g. 159→183).** Investigated by replaying `Container.getBounds()`'s ACTUAL behaviour
(`phaser/src/gameobjects/container/Container.js:398-413`): it unions **every** child's bounds
regardless of `.visible` — never checks visibility at all. `LayeredAvatar`'s pool is a FIXED
SIZE sized to the character's MAXIMUM per-frame piece count (design.md §5 cost 8); a frame using
fewer pieces than the max leaves the excess pool children `setVisible(false)` but their
LAST-assigned (now stale) position/texture size untouched — and `getBounds()` still counts them.
Reconstructing the exact sequence of `play()` calls the coordinator's tool used, INCLUDING these
stale hidden children, reproduces the reported widths and centres EXACTLY (162.0/159.2/165.7/
165.7/174.5/197.9/175.3/182.8 vs measured 162/159/166/166/175/198/175/183 — within rounding).
Replaying the SAME sequence using only VISIBLE pieces (what a player actually sees) shows
`width(mirrored) === width(source)` exactly in all three pairs even with the PRE-fix formula —
because a rigid translation preserves width; only its CENTRE was wrong (not negated, per Root
Cause A). This is disclosed plainly rather than "fixed twice": there was no real width-changing
bug, only a misleading measurement tool for this pooled-child architecture. Fixed anyway, as a
defensive measure (see "Files changed" below): hidden pool children now also get their position
reset to `(0, 0)`, so any FUTURE bounds-based tooling is not misled the same way.

**Root cause B (real, and the reason Round 1's pet fix was wrong): a pet's registration point
sits FAR OUTSIDE its own drawn geometry, so its `setOrigin` fraction is extreme (e.g. `-1.83`),
and Round 1 never checked where the ACTUAL VISIBLE PIXELS land once that fraction is applied —
only where the bare anchor point sits.** The live table's "pet bottom" (+222 to +243, i.e. the
pet's bottom edge sits ~230 real px BELOW the shadow — sunk through the floor) is measured using
Round 1's code, which had already stopped subtracting `bodyOrigin` for a pet's `y`. Restoring
the body-origin subtraction for pet (i.e. treating it EXACTLY like a hat) and recomputing:

| pose | Round-1 formula bottom (no subtraction) | Restored formula bottom (subtract bodyOrigin) |
|---|---|---|
| down_idle | 243.1 (matches the live +243 exactly) | 31.1 |
| leftdown_idle | ~222 (matches live +222) | 24.7 |
| left_idle | ~240 (matches live +240) | 31.0 |
| leftup_idle | ~234 (matches live +234) | 21.4 |

Restoring the subtraction clusters the bottom edge at a sensible +18.5 to +35.6 (just below the
shadow's own centre, consistent with "a ground-level entity", and — since it no longer depends
on a special pet-only formula — consistent between mirrored pairs too). The maths reconciles
completely: `setPosition(regX_render, regY_render)` + `setOrigin(originX, originY)` places the
sprite's TOP-LEFT at `((regX - originX*widthLogical) - bodyOrigin.x) * ss` regardless of how
extreme `originX`/`originY` are — i.e. hat and pet were never actually different, Round 1 just
reasoned from `regY` in isolation (near-zero, looks "already ground-relative") without checking
what the extreme origin fraction does to it. **Correction, stated plainly: hat and pet are now
resolved IDENTICALLY** (`resolveAccessoryPlacement` no longer branches on `kind` for position/
origin/flip at all) — the "pet is not body-origin-relative" claim in Round 1 was wrong and is
retracted.

**Depth-flip sign also corrected (ACC5).** `petDepth = relativeY >= 0 ? 1.5 : 0.5` was computed
from `regY - bodyOrigin[1]`, which — given `bodyOrigin[1]` is consistently ~100-106 and `regY` is
small — is ALWAYS strongly negative in practice, meaning the flip could never actually trigger.
Changed `relativeY` to the RAW `accFrame.regY` (ACC1's fully-resolved registration point, which
spans -129.65 to +46.05 across `pet09`'s real frames, i.e. actually crosses zero), matching
design.md §1's "computed from the registration point the anchor already resolves" more literally
than the body-relative delta did.

**`oMirror` removed from the runtime contract AND the compiled manifest schema (a deliberate
choice, not left as inert/contradictory data).** Since mirroring is now a per-piece/per-point
reflection about the frame's own (always-used) `o`, a second precomputed "mirrored origin" has
nothing left to do. Chose to DROP the field entirely rather than keep it unused: `compile-
layered-avatar.cjs` no longer computes it (the `mirrorPivot.cjs` `require` was removed from that
file), and `rasta.layers.manifest.json` was recompiled — confirmed byte-identical to the
pre-change output in every field EXCEPT `oMirror` being absent from every frame (`v`,
`compilerVersion`, `sourceHash`, `bodyBounds`, `pieces`, `sequences`, `mirrors`, and all 103
frames' `o`/`L` are unchanged; `.webp`/`.atlas.json` unchanged by `shasum`). The runtime
`mirrorPivot` pure function itself is KEPT (not deleted) — it still correctly implements its own
documented contract (reflect about an arbitrary width's midpoint); the bug was using it for this
specific purpose, not an error in the function, and it remains independently unit-tested.

**Mirroring correctly implemented, both body and accessory:**
- Body pieces (`_applyFrame`): origin is ALWAYS `f.o`; when mirrored, each piece's `dx` is
  reflected via `reflectSpan(dx, pieceWidthLogical, o.x)` (accounts for the piece's own width,
  since it's anchored at its own top-left via `setOrigin(0,0)`) and the piece's texture is
  flipped (`setFlipX(this._mirrored)`, previously never called for body pieces at all).
- Accessories (`_updateAccessory`, both hat and pet): origin is ALWAYS `bodyFrame.o`; when
  mirrored, `regX` is reflected via `reflectPoint(regX, o.x)` (no width term needed — the
  sprite is anchored via a FRACTIONAL `setOrigin`, not a corner), the origin fraction is swapped
  to `1 - originX`, and the texture is flipped. Verified against Phaser's own
  `MultiPipeline.batchSprite` quad math (`node_modules/phaser/src/renderer/webgl/pipelines/
  MultiPipeline.js:298-403`): flipping without swapping the origin fraction shifts the rendered
  anchor by `scaleX*realWidth*(1-2*originX)` — up to ~125px on `hat_minnie` frame 122 — so the
  origin swap is load-bearing, not cosmetic.

**Proof the fix is a TRUE reflection, not another rigid shift (the exact defect that slipped
through once already).** Replaying the corrected formula for the 3 mirrored `_idle` pairs, using
only visible pieces:

| pose | source cx | mirrored cx (new formula) | width preserved? |
|---|---|---|---|
| left_idle → right_idle | 27.00 | -27.00 | yes (137.0 both) |
| leftdown_idle → rightdown_idle | 12.50 | -12.50 | yes (153.0 both) |
| leftup_idle → rightup_idle | 19.40 | -19.40 | yes (130.0 both) |

`mirrored cx == -source cx` exactly, in every case — a real, verifiable isometry. Re-running the
full 8-direction table with the corrected formulas: `body bottom` clusters at 0.0/6.2/-0.1/5.9/
0.5/5.9/-0.1/6.2 (all near the shadow, natural pose-to-pose variance, not a bug); `body cx` for
`down`/`up` stays ~0 (symmetric poses), while `left*`/`right*` pairs are now EXACT negations of
each other (12.5/-12.5, 27/-27, 19.4/-19.4 — previously -12.5 paired with something that was NOT
+12.5, since the old formula was a shift, not a reflection); `pet bottom` now clusters at 21.4 to
35.6 across all 8 directions (down from the reported +222/+243) and is IDENTICAL between each
mirrored pair (24.7=24.7, 31.0=31.0, 21.4=21.4); `hat cx` is likewise an exact negation between
mirrored pairs.

**Aura — checked, no defect found (item 5 of the audit).** `bottom: 24` (measured) matches
`(1 - anchor.y) * frameHeight = (1 - 0.85) * 163 = 24.45` EXACTLY, computed from the aura's own
declared anchor (`[0.5, 0.85]`) and its real compiled atlas frame height (163px). The aura's
positioning is correct as designed; `AccessoryLayer.createAura`/aura rendering is untouched by
this fix (auras run their own animation loop, independent of `LayeredAvatar._updateAccessory`).

**Hat "MISSING" for `leftup`/`up`/`rightup` — NOT reproducible from the compiled manifest data,
disclosed rather than guessed at.** `hat_minnie.accessory.json`'s `anims` table DOES declare
`leftup_idle`/`up_idle` (3 frames each, real non-empty geometry: frame 743 is 170×158px, frame
314 is 152×154px) — `rightup_idle` is correctly absent (accessories never get synthesized
mirror keys; `rightup_idle` resolves via `_sourceKey` to `leftup_idle`, which IS present). Both
frames DO carry `zBias: -0.4` (the intentional back-facing "hide behind the head" correction
from Slice 9) — which would make the hat render BEHIND the body for these three directions, not
literally invisible. I could not reproduce a "missing" (as opposed to "occluded") state from
static data, and did not have a browser to check live. Flagged explicitly for the orchestrator's
next live pass rather than invented a fix for a symptom I could not confirm.

**Files changed:** `client/src/phaser/layered/pivot.js` (new pure functions `reflectPoint`,
`reflectSpan`; `resolveAccessoryPlacement` rewritten to drop the `kind === 'pet'` branch and use
`accFrame.regY` raw for `relativeY`; `mirrorPivot` kept but documented `@deprecated` for this
purpose), `client/src/phaser/layered/LayeredAvatar.js` (`_applyFrame`: always use `f.o`, add
`reflectSpan` + per-piece `setFlipX`, reset hidden pool children's position; `_updateAccessory`:
always use `bodyFrame.o`, pass `this._mirrored` through), `client/scripts/compile-layered-
avatar.cjs` (stop computing/emitting `oMirror`; drop the now-unused `mirrorPivot.cjs` require),
`client/scripts/compile-accessory.cjs` (optional `meta.scale` → `manifest.base.scale`, from
Round 1), `client/.assets-src/accessories/hat_minnie/meta.json` (staged input, `"scale": 0.5`,
Round 1), regenerated `client/src/assets/game/avatars/rasta/layers/rasta.layers.manifest.json`
(oMirror removed from all 103 frames, everything else byte-identical — confirmed by full JSON
diff and `.webp`/`.atlas.json` `shasum`), regenerated `hat_minnie.accessory.json` (`base.scale:
0.5`, Round 1) and `pet09.accessory.json`/`.webp`/atlas (recompiled, confirmed byte-identical).

**Closing the testing gap.** Extended `client/src/phaser/layered/mirroredDirections.integration.
test.js` (the existing regression-shaped integration suite against real compiled manifests, not
a parallel file) with:
- `pet09`'s resolved BOTTOM EDGE (not the bare anchor — see Root Cause B) is within 40px of
  ground level, for one mirrored and two non-mirrored directions.
- `hat_minnie`'s resolved `y` falls strictly within the upper half of the body's render height.
- Both accessories' resolved `displayWidth` is under 60% of the body's render width (pre-fix
  98.8%/96.4% for the hat).
- **Body mirror invariant** (the assertion that would have caught the root cause 3 rounds ago):
  for 3 real mirrored `_idle` pairs, `width(mirrored) === width(source)` (exact) AND
  `cx(mirrored) === -cx(source)` (exact) — a literal reflection, not a shift. A companion test
  reconstructs the PRE-fix formula literally (not imported from production code, which no longer
  computes it) and asserts it does NOT satisfy the negation — documenting, with a real failing-
  if-reverted assertion, exactly what was wrong.
- **Accessory mirror check**: `hat_minnie`'s resolved `x` for all 3 mirrored keys matches
  `reflectPoint(regX, bodyOrigin.x)` fed through `resolveRenderPosition` — i.e. reflects about
  the body's own origin, not the bodyBounds centre.

**TDD evidence:**

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| `resolveAccessoryPlacement` (Round 1) | `mirroredDirections.integration.test.js` | Integration (real manifests) | ✅ baseline 100/100 client + 27/27 target file | ✅ `TypeError: (0 , resolveAccessoryPlacement) is not a function` (captured, 8 cases) | ✅ Passed (6/8 immediately; 2 hat display-width cases red pending scale fix) | ✅ 3 directions (`down_walk`, `rightdown_walk`, `leftup_walk`) | ✅ Clean |
| `compile-accessory.cjs` `meta.scale` (Round 1) | I/O-shell, not unit-tested (design.md §8) | N/A | N/A | Triangulation skipped: trivial conditional; verified via recompiled-output diff | ✅ Verified | Skipped | ✅ Clean |
| `reflectPoint`/`reflectSpan` (Round 2) | `pivot.test.js` | Unit | ✅ 13/13 baseline before this pair | ✅ `TypeError: (0 , reflectSpan) is not a function` (captured, 4 cases) | ✅ Passed | ✅ 2 cases each (real compiled values + a synthetic case per function) | ✅ Clean |
| Body mirror invariant (Round 2) | `mirroredDirections.integration.test.js` | Integration (real manifests) | ✅ 39/39 baseline (post-Round-1 state) | ✅ `AssertionError: expected 12.5 to be close to -12.5 ... difference is 25` (captured, 3 directions, using a temporarily-reverted no-reflection helper) | ✅ Passed (restored `reflectSpan` import) | ✅ 3 pose pairs (`left`, `leftdown`, `leftup`) | ✅ Clean |
| Pet bottom-edge assertion, corrected (Round 2) | `mirroredDirections.integration.test.js` | Integration | (same run) | ✅ `AssertionError: expected 212.2 to be less than 30` (captured — this is the Round-1 assertion failing against the Round-2 corrected code, proving Round 1's own test was checking the wrong quantity) | ✅ Passed (reworded assertion to check `bottomEdge`, not raw `y`) | ✅ 3 directions | ✅ Clean |

**Recompile verification.** `rasta.layers.manifest.json`: full JSON diff shows `oMirror` removed
from all 103 frames and every other field byte-identical (`v`, `compilerVersion`, `sourceHash`,
`character`, `ss`, `slots`, `defaults`, `labels`, `compatibleHats`, `bodyBounds`, `pieces`,
`sequences`, `mirrors` all equal); `.webp`/`.atlas.json` `shasum`-identical. `pet09.pet.webp`
`shasum` identical before/after the `compile-accessory.cjs` change from Round 1; `pet09.
accessory.json`'s `base`/`frames`/`anims` and atlas JSON deep-equal.

Full client suite after Round 2: **16 test files, 125 tests, all passing** (up from 112 after
Round 1; +13 in `pivot.test.js`/`mirroredDirections.integration.test.js` combined for the body
mirror invariant, the reflect helpers, and the corrected pet assertion). `npm run build` clean
(no new warnings; the chunk-size warning is pre-existing, unrelated `game-managers`/`phaser`
chunks). Server suite unaffected (`cd server && npm test` → 3 files, 13 tests, unchanged — no
server code touched). `api` unaffected (no api code touched).

**What still needs the browser pass.** The arithmetic reproduces both the original single-frame
report and the coordinator's full 8-direction live audit bit-for-bit, and the corrected formulas
produce internally-consistent, physically-sensible numbers (exact mirror reflection, pet near
ground, hat within head region, aura confirmed already-correct) — but the ACTUAL on-screen
render has not been re-checked in a live browser since this fix (no browser in this shell).
Reproduction for the orchestrator's next pass, `VITE_LAYERED_AVATARS=true`, `God`/`test` on
avatar 12 (rasta) in `BelugaBeach`, hat_minnie + pet09 equipped:
1. Confirm the character no longer drifts sideways off its own shadow when switching between a
   direction and its mirror, or between animations within one mirrored direction (walk↔idle).
2. Confirm the hat sits on the head at a consistent horizontal position across all 8 directions
   (roughly mirrored, not wandering), and specifically re-check `leftup`/`up`/`rightup` for
   whether it is genuinely invisible or merely occluded behind the head (zBias) — this could not
   be resolved from static data.
3. Confirm the pet now stands at/near ground level (comparable to the shadow) in all 8
   directions, not sunk through the floor.
4. Confirm all of the above hold through a full walk cycle, not just idle.
5. Repeat the z-order check from Fix 4 (hat above head, pet in front/behind per depth flip, both
   above the shadow).

## Fix 5 browser pass — CONFIRMED, plus one correction the coordinator owed me

The orchestrator ran the live browser pass over all 8 directions and confirmed Fix 5's root
cause and fix are correct:

- **Mirroring is an exact isometry, live-measured** (visible-children bounds, relative to the
  shadow): `leftdown`↔`rightdown` width 153↔153, `left`↔`right` 137↔137, `leftup`↔`rightup`
  130↔130 — all exact matches; `body cx` is exactly antisymmetric (`left` +27 ↔ `right` −27,
  `leftup` +19 ↔ `rightup` −19), matching the numbers this file already computed and recorded
  above (Fix 5 Round 2's "Proof the fix is a TRUE reflection" table: 27.00/-27.00, etc.).
- **The pet is on the ground**: bottom 21–36px (was 222–243px below the floor), `cx` exactly
  antisymmetric across mirrors.
- **The hat is on the head** in `down`/`leftdown`/`left`/`right`/`rightdown`, mirrors correctly
  (the bow visibly swaps sides), `cx` antisymmetric.
- **The aura is unchanged and correct** (`cx: 0, bottom: 24` in all 8) — matches this file's own
  independent calculation (`(1 - 0.85) * 163 = 24.45`) against the compiled `auraElectrica`
  package, confirmed twice now by two different methods.

**Correction the coordinator owed me, recorded for the file's own accuracy**: the earlier
"mirroring spreads the body" (`body w` changing between a direction and its mirror) was
independently re-measured with visible-children-only bounds and confirmed to be the
`Container.getBounds()` stale-hidden-child artifact this file already diagnosed in Fix 5 Round
2 — not a second real bug. No action needed; already correctly handled (root cause fixed,
artifact explained, defensive position-reset already applied to hidden pool children).

**On the `body cx == 0` invariant**: the coordinator's own follow-up correctly retracts an
earlier instruction to assert `body cx == 0` for every direction (a side-facing pose legitimately
has its visual mass offset from the feet-anchor — confirmed in this file's own Fix 5 Round 2
write-up, e.g. `left_idle`'s cx of 27.00). Checked this file's own test suite: no such
`cx == 0` assertion was ever added — `mirroredDirections.integration.test.js`'s "body mirror
regression" describe block asserts the antisymmetry (`mirrored.cx` `toBeCloseTo(-source.cx)`)
from the start, which is exactly the corrected invariant. Nothing to replace.

## Fix 6 — defect 9: hat sent fully behind the body (occluded) in the three up-family directions

**The report.** Live `containerUser.list` depths: `down`/`left`/`right`/`leftdown`/`rightdown`
give the hat depth `1.5` (in front of the body's `1.0`, correct); `leftup`/`up`/`rightup` give
the hat depth `0.6` — BEHIND the body's `1.0` — fully occluding a sprite that is otherwise
present, `visible: true`, `alpha: 1`, correctly textured and correctly positioned. Confirmed
directly against the compiled manifest (not just the live report): `hat_minnie.accessory.json`
declares real, non-empty frames for `up_idle`/`leftup_idle` (170×158px / 152×154px atlas
frames), each carrying `zBias: -0.4` — `depth = 1.0 + (-0.4) = 0.6`. This is the Slice 9
back-facing correction (`compile-accessory.cjs`'s `BACK_FACING_ANIMS`/`BACK_FACING_Z_BIAS`,
originally meant so a brim wouldn't float over the back of the head), now proven to fully
occlude the hat rather than partially recede behind it.

**Decision, made deliberately (per the coordinator's explicit ask to choose and document): drop
the negative back-facing bias entirely — a hat must never render behind the body, in any
direction.** Considered the alternative (keep a behind-case for poses that genuinely need it,
as long as it stays partially visible) and rejected it for this asset: `hat_minnie`'s geometry
broadly overlaps the head's own silhouette in every direction (it is a headband, not a small
accessory offset to one side), so there is no z-order value that puts it "behind the body" and
still leaves it partially visible — behind means occluded, for this shape, full stop. The
observable requirement ("a hat should be visible in all 8 directions; being invisible in 3 of 8
is never right") is more important than modelling "you'd see less hat from behind" — which,
concretely, would require ACTUAL back-of-hat artwork and partial-depth compositing this project
has neither the assets nor the rendering mechanism (a single z-order stack, not per-pixel
depth) for. Every hat frame now resolves to the SAME default bias
(`DEFAULT_HAT_Z_BIAS = 0.5`, depth `1.5`), matching the directions that were already correct.

**Fix.** Removed `BACK_FACING_ANIMS`/`BACK_FACING_Z_BIAS` and the `backFacing` per-frame flag
entirely from `client/scripts/compile-accessory.cjs` (not tuned to a smaller negative value —
removed, per the decision above). Recompiled `hat_minnie`: confirmed exactly the 26 frames that
previously carried `zBias: -0.4` now carry no `zBias` key at all (falling back to
`manifest.base.zBias = 0.5` at runtime, same as every other frame) — every other field
(`regX`/`regY`/`originX`/`originY`/`anims`) byte-identical, `.webp`/`.atlas.json` unchanged by
`shasum`. Recompiled `pet09` too (unaffected by this change, since `backFacing` was always
`kind === 'hat'`-gated): confirmed fully byte-identical output (`shasum` match, deep JSON
equality) — nothing in the pet's own compiled manifest changed.

**Pet checked for the same class of bug, per the coordinator's ask — none found.** A pet's
depth uses a DIFFERENT, dynamic mechanism (ACC5: `petDepth = regY >= 0 ? 1.5 : 0.5`,
intentionally sometimes-behind-the-body BY DESIGN — a pet standing further from the camera is
*supposed* to draw behind its owner, unlike the hat's static, erroneous back-facing bias). Being
sometimes-behind is not itself a bug for a pet; what WOULD be the same class of bug is `pet09`'s
own compiled manifest declaring a static `zBias` override the way the hat's used to. Checked
directly: no frame in `pet09.accessory.json` declares a `zBias` key, and `pet09`'s `base.zBias`
is `0` — the dynamic ACC5 flip is the only depth mechanism pet09 has, and it was not touched by
this fix. I could not independently re-verify from a browser that the pet is never fully
occluded across a full walk cycle in every direction (the coordinator's own live check covered
idle poses only and reported no issue) — disclosed as not fully closed, but no evidence of a
defect either, and the mechanism itself (a continuous front/behind flip based on the pet's own
per-frame registration point, not a hard-coded per-direction bias) is architecturally different
from what caused defect 9.

**Closing the testing gap.** Extended `client/src/phaser/layered/mirroredDirections.integration.
test.js` with:
- `hat_minnie`'s resolved depth (`accFrame.zBias ?? manifest.base.zBias ?? 0`, added to the
  body's fixed depth of `1.0`) is strictly greater than `1.0`, asserted for `_idle` in all 8
  directions (triangulating across both the previously-correct 5 directions and the 3
  previously-broken up-family ones — the same assertion shape, run over every direction, is
  what makes this a real regression guard rather than a single-direction spot check).
- `pet09`'s compiled manifest declares no static `zBias` override anywhere and its `base.zBias`
  is `0` — guards against the SAME mistake being reintroduced for pets.

**TDD evidence:**

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Hat depth > body depth, all 8 directions | `mirroredDirections.integration.test.js` | Integration (real compiled manifest) | ✅ 48/48 baseline (post-Fix-5 state) | ✅ `expected 0.6 to be greater than 1` (captured, exactly `leftup_idle`/`up_idle`/`rightup_idle` — the 3 reported directions, no others) | ✅ Passed (all 8 directions, after removing the back-facing bias and recompiling `hat_minnie`) | ✅ 8 directions is itself the triangulation (5 previously-correct + 3 previously-broken) | ✅ Clean (removed constants/flag entirely rather than leaving dead code) |
| Pet has no static zBias | same file | Integration | (same run) | Triangulation skipped: a single structural assertion over the compiled manifest (no branching); the RED for this one was implicit — it already passed on first run since `pet09` never had this field, disclosed rather than claimed as a captured failure | ✅ Passed | Skipped (see above) | ✅ Clean |

**Recompile verification.** `hat_minnie.accessory.json`: exactly 26 frames lost their `zBias`
key (matching the compiler's own prior log line, "back-facing (zBias) frames: 26"), zero
unexpected diffs elsewhere, `anims` unchanged, `.webp` `shasum` identical, atlas JSON
deep-equal. `pet09.accessory.json`/`.webp`: fully byte-identical before/after (`shasum` match on
the `.webp`, full JSON equality on the manifest).

Full client suite after this fix: **16 test files, 134 tests, all passing** (up from 125; +9 in
`mirroredDirections.integration.test.js`: 8 hat-depth-per-direction cases + 1 pet-zBias check).
`npm run build` clean (same pre-existing, unrelated chunk-size warning). Server suite unaffected
(`cd server && npm test` → 3 files, 13 tests, unchanged — no server code touched). `api`
unaffected (no api code touched).

**What still needs the browser pass.** The depth arithmetic reproduces the exact reported
`0.6`/`1.5` values and the fix makes every direction resolve to the same, previously-correct
depth (`1.5`) — but the actual on-screen result (does the hat now visibly render on top of the
head, including "the back of the hat" look, for `leftup`/`up`/`rightup`?) has not been
re-confirmed in a live browser since this fix. Reproduction for the orchestrator's next pass,
same setup as before: equip `hat_minnie`, cycle through `up`, `leftup`, `rightup` specifically
(previously invisible), confirm the hat now renders visibly on top of the head in all three,
alongside a repeat of the full 8-direction + walk-cycle check from Fix 5.

## Fix 6 browser pass — CONFIRMED, plus three new user-reported defects (10, 11, 12/12b)

The orchestrator confirmed defect 9's fix live (hat visible at depth 1.5 > body 1.0 in all 8
directions; pet at ground level; a 13-frame walk cycle with zero runtime errors). The user then
reviewed the render and reported the hat's size/position and the aura's placement as still
wrong; the orchestrator measured both live and added a third (pet overlap), found via a
follow-up capture. This section covers all of them together since they were reported and fixed
in the same pass.

**Units, standardised (per the coordinator's own note that this needed stating once):** every
number in this file, including this section, is in **real px** — the same "container-local,
post-`ss:2`" coordinate space every pure function in `pivot.js` already operates in and every
existing test already asserts against. The coordinator's most detailed defect-12 measurements
were reported in CSS px (this project's DPI is 2, so CSS px = real px / 2); those figures are
converted to real px below before being used, and are not repeated in CSS px anywhere in this
file to avoid a second, competing unit.

### Defect 10 — the hat is not centred on the head

**The report:** hat centre 17-61 real px off the head's own centre, symmetric across mirror
pairs (`left` -61 / `right` +60) — confirmed NOT a mirroring bug (the antisymmetry itself is
exact), but a constant anchoring error already present in the un-mirrored source poses.

**A parallel investigation the coordinator ran and reported, recorded here because it changes
what "fix the size" means:** the user's hypothesis was that the hat's `scale: 0.5` (defect 8,
Fix 5) is ITSELF a leftover half-scale bug, i.e. that removing it would fix everything. The
coordinator tested this live by doubling the hat's scale in place: at `scale: 1.0` (0.5 removed)
the hat **completely engulfs the head and face**, at `scale: 0.5` it is roughly face-width
(82px against a ~136-162px head-plus-hair bounding box, which the coordinator noted overstates
true head width because it includes rasta's hair mass). **Conclusion, adopted here: `scale: 0.5`
is correct and was NOT removed or doubled.** The instruction to "remove it if it turns out to be
compensating for a positioning bug" is explicitly withdrawn by the coordinator's own experiment
and superseded by the finding below, which shows the two problems (scale, position) are related
in a way neither original hypothesis anticipated.

**Root cause, found by recomputing the SAME frames at `scale: 1` (no correction) instead of the
current `scale: 0.5`:**

| pose | hat centre @ scale 1 (no correction) | hat centre @ scale 0.5 (current) | difference |
|---|---|---|---|
| `down_idle` | +0.4 | -30.1 | -30.5 |
| `up_idle` | +10.0 | -27.2 | -37.2 |

At native scale, the hat's centre ALREADY sits almost exactly on the body's own centre (`down`:
+0.4, matching the body's own -0.2). Applying the `scale: 0.5` correction visibly drags the
centre 30-37px away. Cause: **Phaser's `setScale()` scales a sprite around its OWN origin
point, not around its geometric centre.** `hat_minnie`'s registration point sits far from its
own drawn geometry's centre — `originX` as low as `0.098` (near the LEFT edge of its own
bounds, confirmed against the compiled manifest, not assumed) — so shrinking toward that
off-centre point drags the whole displayed shape toward it too. The scale correction and the
anchoring bug were never independent: the anchoring was fine at native scale, and the scale
correction (needed and correct on its own terms, per the coordinator's experiment) is what
exposed the drift, because Phaser has no notion of "shrink around the geometric centre" unless
the origin IS the geometric centre.

**Fix:** `resolveAccessoryPlacement` (pivot.js) now anchors X at the sprite's own **geometric
centre** in the shared logical coordinate space — `regX + (0.5 - originX) * widthLogical` — with
`originX` pinned to `0.5`, instead of the raw registration point + the asset's own (often
off-centre) origin fraction. This makes the displayed centre's screen position independent of
`scale` for ANY scale value, not just the current `0.5` — a structural fix, not a re-tuned
constant. **Y is intentionally untouched**: the hat was never reported wrong on the Y axis (it
already sits at head height in every confirmed-correct direction), so only the axis that was
actually broken changed. This requires the accessory's own currently-set NATIVE atlas frame size
(`sprite.frame.width/height`, read from Phaser right after `setTexture()`, always unscaled and
unaffected by whatever scale is already on the sprite) — `resolveAccessoryPlacement` gained a
`nativeSize` parameter for this.

**Residual, disclosed rather than hidden — the fix does not perfectly zero every pose:**

| pose | hat centre − head centre (post-fix) |
|---|---|
| `down` | +3.0 |
| `up` | +10.0 |
| `left` | -25.0 |
| `right` | +25.0 |
| `leftdown` | +14.5 |
| `rightdown` | -14.5 |
| `leftup` | +17.0 |
| `rightup` | -17.0 |

Front/back-facing poses (`down`/`up`) land within 3-10px (down from 27-30px) — the scale-drift
fix accounts for nearly all of their error. Turned poses (`left`/`leftdown`/`leftup` and their
mirrors) land within 14-25px (down from 17-61px) — a real, measured improvement, but not exact.
Why the residual differs by pose family is not fully explained: `hat_minnie`'s own raw geometry
closely tracks the WHOLE BODY's bounding box (established in Fix 5: its unscaled width, 82,
nearly equals `bodyBounds.w`, 83), so its geometric centre naturally tracks something closer to
the body's OVERALL centroid for a given pose rather than the (narrower, and for turned poses,
differently-positioned) head region specifically — this is a plausible, not confirmed,
explanation, and is flagged for the orchestrator's live judgement rather than chased further
with more constants. The test's tolerance (30 real px) is set from this MEASURED table, not
picked to make the test pass in isolation.

### Defect 11 — the aura hangs below the character / below the ground

**The report:** aura bottom edge sits 24 real px below the ground line (12.2 CSS px in the
coordinator's follow-up capture — the SAME measurement, converted; both values are recorded here
converging on one figure to remove any doubt this is one bug, not two). Root cause: the aura's
declared anchor, `{x: 0.5, y: 0.85}` — present in the "production-shaped" source `aura.json`
staged input, not a compiler default — means only 85% of the 163px frame renders above the
anchor point, and `AccessoryLayer.createAura()` places that anchor point exactly at the ground
line (`gameScene.add.sprite(0, 0, ...)`, container-local origin). The remaining 15% (24.45px)
hangs below ground by construction.

**Decision, made deliberately:** the aura's bottom edge should meet the ground line exactly
(`bottom ≈ 0`), not float with a defined overhang. Rejected the "centred with intentional
overhang" alternative because any overhang VALUE would itself be an unjustified constant, and
because the visual content does not call for one: extracted and viewed a raw frame from the
staged `aura.webp` (a lightning-bolt-style effect, not a "ring at the feet" style aura) and
measured its actual non-transparent pixel bounds across 4 sampled frames (of 48) — the content's
own bottom margin within the 163px frame is only 0-15px, i.e. the visible geometry already
extends close to the frame's own bottom edge in every sample, so anchoring the frame's bottom at
the ground introduces no visible floating gap.

**Fix:** changed the staged `.assets-src/auras/auraElectrica/aura.json`'s `anchor.y` from `0.85`
to `1.0` and recompiled — confirmed the ONLY diff in the recompiled manifest is `anchor: [0.5,
0.85] → [0.5, 1]`; `frames`/`fps`/`sourceHash` and the `.webp` (`shasum`-identical) are
unchanged. `anchor.x` (`0.5`) is untouched — already confirmed correct (`cx: 0` in all 8
directions, both by the coordinator's live measurement and independently by this file's own
`(1 - anchor.y) * frameHeight` calculation, which matched the live `bottom: 24` figure exactly
before this fix).

### Defect 12 — the pet overlaps the character (renders inside the body's own silhouette)

**The report** (live, `down_idle`): pet box entirely inside the body's box (pet `184.4..214.9`
CSS px, body `140.4..221.4` CSS px, shadow centre `181` CSS px — converting to real px relative
to shadow centre: pet `6.8..67.8`, body `-81.2..80.8`) — the pet's own span sits ENTIRELY inside
the body's, starting only ~7px right of the character's own centre line. Combined with the pet's
depth (`0.5`, behind the body's `1.0`), the leg draws over it — "appears under the leg", exactly
as reported.

**Root cause:** the pet's horizontal position (after defect 8/Fix 5's unification with the hat)
correctly resolves its OWN registration point relative to the body's origin, but nothing ever
checked whether the resulting box actually clears the body's own silhouette — a "beside the
owner" accessory was positioned with the same formula as a "on the head" one, with no notion of
"outside the body" at all.

**Fix, deliberately NOT a hard-coded constant (per the coordinator's explicit instruction):**
added `computeBodyBoundsX` (pivot.js) — computes the CURRENT frame's own body bounding box from
its real piece list (mirrored consistently with `reflectSpan`, exactly like
`LayeredAvatar._applyFrame` does) — and `clearBodySilhouetteX` — pushes the pet's box outside
that CURRENT frame's bounds, on whichever side it is ALREADY closer to (so the correction stays
antisymmetric under mirroring, since centre/bounds are themselves already mirror-consistent), by
the minimum amount needed plus a small 4px margin. This uses the ACTUAL per-frame body extent,
not a global worst-case constant, so it stays accurate across every pose without needing
per-pose tuning. Verified: the RAW (uncorrected) pet box does overlap the body box for `down_idle`
(documented as a real, reproducible historical-bug assertion, not just asserted-then-forgotten);
the corrected box does not, for a non-mirrored, a mirrored, and a third distinct pose.

**Depth decision (asked explicitly): the pet stays behind the body (depth `0.5`) or in front
(`1.5`) per the EXISTING ACC5 rule, unchanged.** Being behind is fine, and probably correct, for
a pet standing slightly further from the camera than its owner — what was wrong was the
horizontal OVERLAP (now fixed), not the depth choice itself; no change made to the depth-flip
logic.

### Defect 12b — the pet also breaks the ground line

**The report:** pet bottom 15.5 CSS px (31 real px) below the ground line for `down`, worse than
the aura's own defect 11. Root cause is the SAME shape as defect 11 (an accessory's anchor point
sits far from where its own visible content ends, so a "looks fine at the anchor" position is
not "looks fine where the pixels actually are") but pet09's specific numbers needed their own
derivation, since — unlike the aura — a pet's `regY` legitimately needs to vary pose-to-pose (it
seeds the ACC5 front/behind depth flip), so the fix could not simply pin one frame's bottom to
zero the way the aura's anchor could.

**Fix, empirically calibrated across the FULL package, not just the reported poses:** replayed
`pet09`'s own bottom-edge formula across EVERY frame of all 15 authored body animations (not
only the 8 idle poses that were live-measured) and found the bottom ranges **18.5 to 37.5 real
px — always below ground, never above, and tightly clustered** (a 19px spread across the whole
package). Added an optional, per-package additive Y correction — `manifest.base.groundOffsetY`
(logical units, resolved `accFrame.groundOffsetY ?? manifest.base.groundOffsetY ?? 0`, the SAME
override-then-base-then-default shape as `scale`), read by `compile-accessory.cjs` from an
optional `meta.json` field (so it survives a recompile) — set to `19` (logical, = 38 real px at
`ss:2`): the measured maximum (37.5) rounded up for a small safety margin, so the worst-case
frame's bottom lands at ~-0.5 and every other frame floats a few px above ground, never below,
ACROSS THE WHOLE PACKAGE, not just the poses directly observed. `hat_minnie` declares no such
field (defaults to `0`) — this correction is scoped to the one package measured to need it.
Recompiled `pet09`: confirmed the ONLY diff is `base.groundOffsetY: 19` added; `frames`, `anims`
and the `.webp` (`shasum`-identical) are unchanged.

### Files changed (Fix 7, covering defects 10/11/12/12b)

`client/src/phaser/layered/pivot.js` (`resolveAccessoryPlacement` reworked for the geometric-
centre X anchor and the `baseGroundOffsetY` parameter; new pure functions `computeBodyBoundsX`,
`clearBodySilhouetteX`), `client/src/phaser/layered/LayeredAvatar.js` (`_updateAccessory`:
`setTexture()` moved earlier so `sprite.frame.width/height` are available before computing
placement; pet-only silhouette-clearing step added after the shared placement call),
`client/scripts/compile-accessory.cjs` (optional `meta.groundOffsetY` → `manifest.base.
groundOffsetY`), `client/.assets-src/auras/auraElectrica/aura.json` (staged input, `anchor.y:
0.85 → 1.0`), `client/.assets-src/accessories/pet09/meta.json` (staged input, `groundOffsetY:
19` added), regenerated `auraElectrica.accessory.json` (anchor only) and `pet09.accessory.json`
(`base.groundOffsetY` only) — both confirmed byte-identical elsewhere.

### Closing the testing gap

Extended `mirroredDirections.integration.test.js` with, per the coordinator's explicit
instruction that assertion 1 (hat-centred-on-head) be written first:

- **Hat centred on the head** (defect 10): an INDEPENDENTLY-derived head region (the bounding
  box of the body's own visible pieces whose bottom edge falls in the upper 45% of the body's
  rendered height for that pose — the coordinator's own method, reproduced from body-manifest
  data alone, not from any accessory-placement code) compared to the hat's resolved centre, for
  all 8 directions, tolerance 30 real px (data-driven per the measured residual table above).
- **Aura ground contact** (defect 11): `(1 - anchor.y) * frameHeight` (the aura's own bottom
  edge, in isolation) must be within 1px of `0`; `anchor.x` stays `0.5`.
- **Pet silhouette clearing** (defect 12): the RAW pet box does overlap the body box for
  `down_idle` (documents the historical bug with a real assertion); `clearBodySilhouetteX` (the
  production function) produces a non-overlapping box for a non-mirrored, a mirrored, and a
  third pose.
- **Pet ground contact** (defect 12b): resolved bottom edge `<= 0` for all 8 directions.
- Kept and re-verified (per the coordinator's explicit "do not regress" list): mirror
  antisymmetry (Fix 5) and hat depth `> body depth` (Fix 6) both still pass unmodified.

**TDD evidence:**

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Hat centred on head (defect 10) | `mirroredDirections.integration.test.js` | Integration (real manifests) | ✅ 67/67 baseline (post-defect-9 state) | ✅ `expected 60.1 to be less than 30` (captured, `left_idle`/`right_idle` only — matching the coordinator's reported ±60) | ✅ Passed (all 8 directions) | ✅ 8 directions (2 front/back-facing + 6 turned/mirrored) | ✅ Clean |
| Aura ground contact (defect 11) | same file | Integration | (same run) | ✅ `expected 24.45 to be less than 1` (captured) | ✅ Passed | ✅ 2 cases (bottom, anchor.x untouched) | ✅ Clean |
| Pet silhouette clearing (defect 12) | same file | Integration | (same run) | ✅ `expected true to be false` (captured, all 3 poses, via a temporarily-reverted no-op in place of `clearBodySilhouetteX`) | ✅ Passed (restored the real call) | ✅ 3 poses (1 non-mirrored documented as historical bug + 3 poses for the fix, one mirrored) | ✅ Clean |
| Pet ground contact (defect 12b) | same file | Integration | (same run) | ✅ `expected 21.4 to be less than or equal to 0` (captured, all 8 directions, via a temporarily-forced `baseGroundOffsetY = 0`) | ✅ Passed (restored `manifest.base.groundOffsetY`) | ✅ 8 directions | ✅ Clean |
| `computeBodyBoundsX`/`clearBodySilhouetteX` | exercised transitively via the integration tests above (no standalone unit test file — the pure functions' only real callers/consumers are the integration assertions themselves, which already exercise every branch: overlapping and non-overlapping, left-leaning and right-leaning) | Integration | N/A | (see row above) | ✅ Passed | ✅ (see row above) | ✅ Clean |

Full client suite after this fix: **16 test files, 156 tests, all passing** (up from 134; +22 in
`mirroredDirections.integration.test.js`: 8 hat-centring + 2 aura + 4 pet-silhouette + 8 pet-
ground). `npm run build` clean (same pre-existing, unrelated chunk-size warning). Server suite
unaffected (`cd server && npm test` → 3 files, 13 tests, unchanged — no server code touched).
`api` unaffected (no api code touched).

**What still needs the browser pass.** All four defects' arithmetic reproduces the reported
numbers and the fixes produce internally-consistent, measured-not-guessed corrections — but the
actual on-screen result has not been re-confirmed in a live browser since this fix (no browser
in this shell). Reproduction for the orchestrator's next pass, same setup as before:
1. Confirm the hat now sits closer to centred on the head in all 8 directions (front/back-facing
   should look near-perfect; turned poses may still show a residual few px, per the disclosed
   table above — judge whether that residual is acceptable or needs further work).
2. Confirm the aura no longer spills below the character/ground in any direction.
3. Confirm the pet no longer overlaps or appears "under the leg" in any direction, and stands
   beside its owner with a small, deliberate gap (not touching the silhouette edge).
4. Confirm the pet no longer floats/sinks below the ground line in any direction.
5. Repeat the full 8-direction + walk-cycle regression check (mirror symmetry, hat depth, no
   runtime errors) to confirm none of the above regressed anything already confirmed working.

## Fix 7 browser pass — three of four CONFIRMED FIXED, one decision changed, one item closed

The orchestrator's browser pass on Fix 7 (all CSS px, ground line `y = 346.5`, shadow centre X
`278.5`):

- **Defect 11 (aura ground contact): CONFIRMED FIXED.** Aura bottom is exactly `346.5` — the
  ground line, in all 8 directions. Was 12.2px below.
- **Defect 12b (pet ground contact): CONFIRMED FIXED.** Pet bottom is `338.2..345.3` across all
  8 directions — always at or above ground. Was 15.5px below.
- **Defect 12 (pet body overlap): CONFIRMED FIXED.** Verified for every direction; examples:
  `down` pet `320.9..351.4` vs body `237.9..318.9` (clear by 2px); `left` pet `225.3..255.8` vs
  body `257.8..326.3`; `rightdown` pet `312.5..347.0` vs body `234.0..310.5`. The per-frame
  silhouette-clearing approach (`computeBodyBoundsX`/`clearBodySilhouetteX`) works and preserves
  mirror antisymmetry, live-confirmed.
- **Defect 10 (hat centring): CONFIRMED FIXED**, root cause and fix both correct: for `down` the
  hat centre is `279.9` against a head centre of `278.4` — 1.5px off, essentially perfect.

**On the turned-pose residual (±7 to ±12.5 CSS px, live-measured): correction accepted, test
comment updated, no further tuning.** The coordinator's own "head centre" metric (the same
upper-45%-bounding-box heuristic this file's test reproduces) is itself pulled off-centre in a
profile pose by rasta's hair sweeping to one side — a flaw in the MEASURING PROXY, not evidence
of a real residual offset. The residual is perfectly antisymmetric across mirrors (`left` −12.5
↔ `right` +12.5 live-confirmed), which is the property that actually matters and which the test
already asserts is preserved (the mirror-antisymmetry describe block, Fix 5). Recorded as
measured-and-accepted; the test's own comment was updated to state this explicitly rather than
leaving the earlier, more tentative "not fully explained" wording as the final account.

### Hat scale: 0.5 → 0.75 (a corrected recommendation, and an aesthetic decision)

**The coordinator's earlier advice to KEEP `scale: 0.5` is withdrawn, by the coordinator, and
that correction is recorded here rather than silently overwritten.** That advice rested on an
experiment (doubling the scale) run WHILE the defect-10 anchoring bug was still present — so the
"engulfs the head" appearance at `scale: 1` was partly the off-centre-origin drift, not the
scale value itself. With centring now fixed (and confirmed scale-independent by construction —
see the new test below), the comparison was re-run properly, AND checked against the reference
game (`static.boombang.tv/betahtml5`, screenshots `ref-hat-1.png`/`ref-hats-zoom.png`): reference
hats there span roughly 2.4x the character's face width and visibly frame the whole head, not
just sit on top of it. Measured against `hat_minnie` at three scale values (`down_idle`,
hat-width vs body's visible width):

| scale | hat width | hat/body ratio | look |
|---|---|---|---|
| 0.50 (previous) | 82 | 0.51 | small cap, hair fully visible around it — too small |
| **0.75 (chosen)** | **123** | **0.76** | covers the top of the head, ears frame it, rastas still visible at the sides |
| 1.00 | 164 | 1.01 | covers head and hair entirely, hides part of the face |

**The user chose `0.75`.** This is a **deliberate aesthetic value**, not a correction of a bug
and not a fudge factor compensating for the (now-fixed, and confirmed scale-independent)
anchoring defect — stated explicitly here, and asserted as an explicit regression-guard test
(`hat_minnie base.scale is 0.75`, `mirroredDirections.integration.test.js`), so a future reader
does not "fix" it back down to `0.5` or `1.0` assuming it is stale compensation.

**Fix:** set `.assets-src/accessories/hat_minnie/meta.json`'s `scale` to `0.75` and recompiled;
confirmed the ONLY diff in the recompiled manifest is `base.scale: 0.5 → 0.75` (`frames`/`anims`
byte-equal, `.webp` `shasum`-identical). The pre-existing "resolved display width is a sensible
fraction of the body" test's threshold moved from `0.6` to `0.85` — a DELIBERATE re-calibration
against the new chosen ratio (~0.72-0.76), not a loosening to force a pass: it still fails the
ORIGINAL defect-8 bug (an unscaled, mirror-reflected hat at ~0.95-0.99).

**Scale-independence, asserted per the coordinator's explicit request:** added a test computing
`resolveAccessoryPlacement`'s resolved X at `scale` `0.5`, `0.75` and `1.0` for all 8 directions
and asserting the three are identical — true by construction (the geometric-centre X anchor is
computed before `scale` is applied to anything), so this test passed immediately without a
production-code change; disclosed as confirming already-correct behaviour rather than a fresh
RED-GREEN cycle, per strict TDD's honest-disclosure allowance for this case.

### Low-priority item: diagonal-pose body bottom (~3 CSS px below ground) — checked, pre-existing, not caused by this change

The coordinator measured `down`/`up`/`left`/`right`'s body bottom at `346.4..346.8` (on the
ground line) but the four diagonal poses (`leftdown`/`leftup`/`rightdown`/`rightup`) at
`349.4..349.6` — about 3px lower. Checked directly against the compiled `rasta.layers.manifest.
json`: replaying the body's own bounding-box bottom for the UNMIRRORED source poses (`leftdown_
idle`/`leftup_idle` are never mirrored — confirmed no `mirrors` entry for either key) gives
`leftdown_idle`/`leftup_idle` bottoms of `+6.2`/`+5.9` real px (≈`+3` CSS px, matching the live
measurement) against `down_idle`/`up_idle`/`left_idle` at `0.0`/`+0.5`/`-0.1` real px (≈`0` CSS
px). This is present in the RAW, UNMIRRORED per-frame `o`/`L` piece data the body compiler
emitted from the original archive — i.e. it predates every fix in this change (this repo's own
mirror-axis correction, Fix 5, only ever touches MIRRORED requests, and these two keys are
canonical/source poses, never mirrored) and is not something any accessory or body fix
introduced. Judged out of scope to correct: fixing it would mean adjusting the ORIGINAL body
archive's own per-frame registration data and recompiling the whole body (`compile-layered-
avatar.cjs` over the full `rasta.layers.bb` source), a materially bigger and riskier change than
the ~3px, barely-visible discrepancy the coordinator themselves flagged as "may well be inherent
to those source frames" and marked low priority. Recorded as checked, not fixed, with the
reasoning above rather than left as an open question.

### Architectural finding: accessory packages are per-character in the source data — the compiler and the runtime registry currently assume otherwise

**The finding, as the coordinator confirmed it against the raw reference dump:** the same
accessory key (e.g. `Custom6Hat`) exists as a genuinely DIFFERENT package per character —
different md5, different unique-frame counts, and decisively a different SEQUENCE LENGTH
(`lilian`'s `up_walk` is 14 frames vs `bommer`'s/`rasta`'s 13). A single shared package cannot
represent this without desyncing against the body. Verified independently against this
project's own staged inputs: `.assets-src/accessories/hat_minnie/meta.json` and `.../pet09/
meta.json` both declare `"char": "rasta"` — and `compile-accessory.cjs`'s `compileVector`
read `meta.char` only to validate `meta.kind`, then silently dropped it from every compiled
manifest (confirmed: `hat_minnie.accessory.json`/`pet09.accessory.json` had no `char` field at
all before this fix). Separately, `AccessoryManager.js`'s `ACCESSORY_PACKAGES` registers every
package keyed by `${kind}:${key}` alone — genuinely global, no character dimension anywhere in
the registry, the loader, or the on-disk path (`client/src/assets/game/accessories/hat/
hat_minnie/…`, no character segment). **This causes no live bug today** — `rasta` is the only
compiled character in this change, so `${kind}:${key}` and `${character}:${kind}:${key}` resolve
identically by coincidence — but the moment a second character's accessory is compiled under
the same key, the registry would silently serve one character's frames to another's avatar, with
no error, no validation, nothing to catch it.

**Design-level gap, also confirmed:** `design.md`'s only compatibility mechanism,
`manifest.compatibleHats[]` (validated server-side, no new pivot table), answers "which hats
MAY this character wear", not "whose COPY of the hat do we load" — a different question the
per-character asset reality actually requires. `compatibleHats` is `[]` in the compiled `rasta`
manifest and was never populated by any slice of this change, so even the compatibility half of
the design is currently inert.

**Scope decision, made deliberately and explained rather than silently deferred or silently
fully implemented:**

- **Fixed now (low-risk, high-value, zero API-surface change):** `compile-accessory.cjs` no
  longer drops `meta.char` — it is preserved on the compiled manifest (`hat_minnie.accessory.
  json`/`pet09.accessory.json` now both carry `char: "rasta"`, confirmed via a fresh recompile
  diff against every other field, byte-identical elsewhere). A regression-guard test asserts
  both packages' `char` field, so this specific regression (the field being silently dropped
  again) cannot reappear unnoticed.
- **NOT implemented in this fix round, with reasoning:** character-scoped package IDENTITY (a
  registry key and/or on-disk path that includes the character, e.g. `${character}:${kind}:
  ${key}`) and the `compatibleHats` populate-or-retire decision. Both touch
  `AccessoryManager.js`'s public API (`hasPackage`/`load`/`getManifest`/`getAtlasKey`) AND all 6
  of its call sites (three in `AddUserController.js`, three in
  `UserChangeAccessoryController.js`), every one of which would need to additionally resolve
  "which character is this avatar" (via `avatarId` → character name, e.g. through
  `AvatarManager.getAvatarName()`) before every accessory load — a multi-file, cross-cutting
  change to a shared public API, not a contained fix. The `compatibleHats` half is additionally
  a `design.md`-level decision (what the field should mean and how it is populated), and
  `design.md`/the specs are frozen for this apply session — redesigning that contract
  unilaterally mid-apply would mean editing frozen input rather than letting verify judge a
  documented deviation. This is JUDGED, not merely deferred by default: the risk is real but
  currently LATENT (zero live impact with one compiled character), and the fix is safe to do
  properly, with full test coverage across the API surface, as a dedicated fast-follow BEFORE
  any second character's accessories are compiled — which this file now flags explicitly so
  that gate is not missed. Per the coordinator's own framing, this judgement is reported for the
  user's decision, not silently overruled in either direction.

**Files changed (this section):** `client/scripts/compile-accessory.cjs` (`char: meta.char`
added to the compiled manifest), regenerated `hat_minnie.accessory.json`/`pet09.accessory.json`
(both now carry `char: "rasta"`; every other field byte-identical, `.webp`s unchanged by
`shasum`).

**TDD evidence (Fix 7 follow-up: hat scale change, scale-independence, character-scoping):**

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Hat scale 0.75 (display-width threshold recalibration) | `mirroredDirections.integration.test.js` | Integration | ✅ 88/90-minus-new baseline before recompile | ✅ `expected 0.72... to be less than 0.6` / `expected 0.686... to be less than 0.6` (captured, 2 of 3 tested directions) | ✅ Passed (threshold moved to 0.85, recompiled with `scale: 0.75`) | ✅ 3 directions (2 non-mirrored + 1 mirrored, pre-existing coverage) | ✅ Clean |
| Hat scale explicit value guard | same file | Integration | (same run) | ✅ not-run (new, trivial single-value assertion; the OLD value `0.5` would have failed it, disclosed rather than a fabricated multi-case RED) | ✅ Passed | Triangulation skipped: single package-level constant, no branching | ✅ Clean |
| Hat centring scale-independence | same file | Integration | ✅ 79/79 baseline (pre-existing) | ⚠️ Not captured — the underlying formula was already scale-independent by construction (computed before `scale` is applied); disclosed as confirming existing-correct behaviour, not a fresh RED, per strict TDD's allowance for this case | ✅ Passed (all 8 directions × 3 scale values) | ✅ 8 directions | ✅ Clean |
| `char` preserved in compiled manifest | same file | Integration (real compiled manifests) | ✅ 88/88 baseline | ✅ `expected undefined to be 'rasta'` (captured, both `hat_minnie` and `pet09`) | ✅ Passed (recompiled both packages) | ✅ 2 cases (hat, pet) | ✅ Clean |

Full client suite after this round: **16 test files, 167 tests, all passing** (up from 156; +11
in `mirroredDirections.integration.test.js`: 8 scale-independence + 1 scale-value guard + 2
`char`-preservation). `npm run build` clean (same pre-existing, unrelated chunk-size warning).
Server suite unaffected (3 files, 13 tests). `api` unaffected.

**What still needs the browser pass.** The `scale: 0.75` change and the `char`-preservation fix
are both data/manifest-only (no position/render-path code changed beyond the already-verified
Fix 7 formulas), so no NEW visual behaviour is introduced beyond "the hat is larger" — but this
has not been re-confirmed live since the scale change. Reproduction for the orchestrator's next
pass: confirm the hat now visibly covers more of the head/ears (per the reference-game
proportions above) without looking oversized, in all 8 directions, and that centring still
holds (should, since it is a scale-independent formula, but worth a visual spot-check).

## How to read this file

- "Live-validated" below means I actually ran it against the running Docker stack (server
  `:3000`, api `:8000`, MariaDB `:3307`) from this apply session, via `phpunit`, `vitest`, real
  `npm run build`/`npm run dev`, and small `socket.io-client` Node scripts that log in as
  `God`/`test`, join a scene, and exercise the new socket events — captured output is quoted
  below.
- I do not have a browser in this environment. Anything requiring visual confirmation (pivot
  drift, z-order, FPS counts) is marked **NEEDS BROWSER** with exact reproduction steps for the
  orchestrator's browser-based pass.

## Skill resolution

`paths-injected` — the parent supplied exact `SKILL.md` paths for `vibeless-ai`, `strict-tdd`,
`work-unit-commits`, `chained-pr`; all four were read before work began.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Slice 0: vitest client smoke | `client/src/phaser/layered/__smoke__.test.js` | Unit | N/A (new runner) | not-run (no runner existed) | ✅ Passed | Skipped: trivial structural proof | ✅ Clean |
| Slice 0: vitest server smoke | `server/src/__smoke__.test.js` | Unit | N/A (new runner) | not-run (no runner existed) | ✅ Passed | Skipped: trivial structural proof | ✅ Clean |
| Slice 0: `perfEvaluate.evaluate` | `client/src/phaser/debug/perfEvaluate.test.js` | Unit | N/A (new file) | ✅ not-run (nonexistent module `perfEvaluate.js`) | ✅ Passed | ✅ 3 cases (pass, p5<45 fail, ratio<0.6 warn) | ✅ Clean |
| Slice 1: `validateSupersampling` | `client/scripts/lib/validateSupersampling.test.cjs` | Unit | N/A (new file) | ✅ not-run (nonexistent module) | ✅ Passed | ✅ 3 cases (match, width mismatch, height mismatch) | ✅ Clean |
| Slice 1: `mirrorPivot` (compiler) | `client/scripts/lib/mirrorPivot.test.cjs` | Unit | N/A (new file) | ✅ not-run (nonexistent module) | ✅ Passed | ✅ 3 cases (zero-origin, symmetric, asymmetric) | ✅ Clean |
| Slice 1: `packFrames`/`meanLuminance`/`checkLuminanceWarning` | `client/scripts/lib/packFrames.test.cjs` | Unit | N/A (new file) | ✅ not-run (nonexistent module) | ✅ Passed | ✅ 6 cases (1-page, 2-page overflow, white/black luminance, warn/no-warn) | ✅ Clean |
| Slice 2: `manifestValidation` | `client/src/phaser/layered/manifestValidation.test.js` | Unit | N/A (new file) | ✅ not-run (nonexistent module) | ✅ Passed | ✅ 7 cases (PAL1 membership, PAL2 per-character, missing field, ss≠2) | ✅ Clean |
| Slice 2: `pivot` (runtime) | `client/src/phaser/layered/pivot.test.js` | Unit | N/A (new file) | ✅ not-run (nonexistent module) | ✅ Passed | ✅ 4 cases | ✅ Clean |
| Slice 2: `sequence.expandSequence` | `client/src/phaser/layered/sequence.test.js` | Unit | N/A (new file) | ✅ not-run (nonexistent module) | ✅ Passed | ✅ 4 cases (down_walk repeat, no-repeat, single-frame, never a range) | ✅ Clean |
| Slice 2: `paletteResolve` | `client/src/phaser/layered/paletteResolve.test.js` | Unit | N/A (new file) | ✅ not-run (nonexistent module) | ✅ Passed | ✅ 4 cases (PAL3 label-fallback using the REAL `color4` labelless-default slot from the compiled rasta manifest, PAL5 defaults) | ✅ Clean |
| Slice 2: `fallback` | `client/src/phaser/layered/fallback.test.js` | Unit | N/A (new file) | ✅ not-run (nonexistent module) | ✅ Passed | ✅ 5 cases (covered key, direction-idle fallback, down_idle fallback, accessory sync/hide) | ✅ Clean |
| Slice 2: `lookCacheKeys` + collision proof | `client/src/phaser/managers/lookCacheKeys.test.js` | Unit | N/A (new file) | ✅ not-run (nonexistent module) | ✅ Passed | ✅ 5 cases incl. the mandatory 18-name x 7-key collision matrix | ✅ Clean |
| Slice 2: `AssetVersionManager` artifact dictionaries | `client/src/phaser/managers/AssetVersionManager.test.js` | Unit | ⚠️ Not run before edit — see Deviation D1 | ⚠️ Not captured (prod code written before test for this pre-existing file) | ✅ Passed | ✅ 4 cases | ✅ Clean |
| Slice 3: `LayeredAvatarRegistry` | `client/src/phaser/layered/LayeredAvatarRegistry.test.js` | Unit (duck-typed doubles, no Phaser) | N/A (new file) | ⚠️ Not captured — test written same pass as implementation (see Deviation D1) | ✅ Passed | ✅ 2 cases | ✅ Clean |
| Slice 5: `UserPaletteService.validateSlotUpdate`/`resolveGlovePalette` | `server/src/services/UserPaletteService.test.js` | Unit | N/A (new file) | ✅ not-run (nonexistent module) | ✅ Passed | ✅ 7 cases (PAL1/2/6/7/8/9 + unknown slot) | ✅ Clean |
| Slice 5: `GlovePresetsEnum` | `server/src/enums/GlovePresetsEnum.test.js` | Unit | N/A (new file) | ✅ not-run (nonexistent module) | ✅ Passed | ✅ 5 cases | ✅ Clean |
| Slice 6: `UserAvatarPaletteTest` (phpunit) | `api/tests/Feature/UserAvatarPaletteTest.php` | Feature (DatabaseTransactions, real MariaDB) | ✅ baseline captured: 2 tests, 1 pre-existing failure (`ExampleTest`, unrelated 404) | ✅ not-run (nonexistent table until migration ran) | ✅ Passed (4/4) | ✅ 4 cases (PAL4 two-avatar scoping x2, longText round-trip, missing-palette default) | ✅ Clean |
| Slice 9: `svgFromPaths`/`computeBounds` | `client/scripts/lib/svgFromPaths.test.cjs` | Unit | N/A (new file) | ✅ not-run (nonexistent module) | ✅ Passed | ✅ 4 cases (multi-path, evenodd fill-rule, unrecognised-command throw, bbox union) | ✅ Clean |

**Deviation D1 (TDD-order gap, disclosed):** two items — the `AssetVersionManager.js` artifact
methods and `LayeredAvatarRegistry.js` — had their test files written in the same pass as the
implementation rather than strictly test-first, because I was extending/creating those files
immediately while the surrounding design decision was still being finalized. Both were then run and
confirmed genuinely exercising the production code (non-trivial assertions, real state changes), and
both are triangulated. This is disclosed rather than hidden; every other task in the table above
followed strict RED-first order with a captured failure.

**Layered renderer classes not unit-tested (by design, not a gap):** `LayeredAvatar.js`,
`LayeredAvatarRegistry.js`'s Phaser-facing surface, `AccessoryLayer.js`, and `AccessoryManager.js`
instantiate/require a live `Phaser.Scene` (WebGL/Canvas context) or perform pure I/O-shell loader
work — design.md §8 explicitly scopes unit tests to logic with no Phaser instantiation. Their pure
logic (fallback resolution, sequence expansion, pivot/registration math, cache-key derivation) lives
in the unit-tested sibling modules above and is exercised transitively. These classes are exercised
live (see below) instead.

## Test Summary

- **client**: `cd client && npm test` → **16 test files, 167 tests, all passing** (updated across
  nine rounds of post-live-validation fixes: +5 in `pivot.test.js` for `resolveRenderPosition`/
  `scaleBodyBounds` (Fix 1), +4 in the new `DarkeningUtils.test.js` (Fix 2), +2 in
  `paletteResolve.test.js` confirming the pre-existing pure function (Fix 3, no new logic), +3 in
  `perfEvaluate.test.js` for `resolveRendererTypeLabel` (minor fix), +4 in `fallback.test.js` for
  the mirror-aware `resolveFallbackKey` plus +27 in the new
  `mirroredDirections.integration.test.js` (Fix 4), +12 in `mirroredDirections.integration.
  test.js` for accessory placement (Fix 5 Round 1), +4 in `pivot.test.js`
  (`reflectPoint`/`reflectSpan`) plus +9 in `mirroredDirections.integration.test.js` for the body
  mirror invariant and accessory mirror check (Fix 5 Round 2), +9 in `mirroredDirections.
  integration.test.js` for the hat-depth-per-direction and pet-zBias checks (Fix 6, defect 9),
  +22 in `mirroredDirections.integration.test.js` for hat-centring, aura ground-contact, pet
  silhouette-clearing and pet ground-contact (Fix 7, defects 10/11/12/12b), +11 in
  `mirroredDirections.integration.test.js` for the hat scale-independence, the explicit scale
  value guard, and `char`-preservation (Fix 7 browser-pass follow-up)).
- **server**: `cd server && npm test` → **3 test files, 13 tests, all passing** (unchanged by
  Fix 5/6/7 — no server code touched).
- **api**: `cd api && ./vendor/bin/phpunit` → **6 tests, 10 assertions, 1 failure** — the
  pre-existing `ExampleTest` (hits `/`, gets a 404; unrelated to this change, present in the
  baseline captured before any edits in this session: 2 tests / 1 failure at the start,
  confirmed still the *only* failure after all 4 new feature tests were added). Unaffected by
  Fix 5/6/7 (no api code touched); not re-run since nothing in `api/` changed.
- Pure functions created: 32 (all `packFrames`/`svgFromPaths`/`validateSupersampling`/
  `mirrorPivot`/`manifestValidation`/`pivot`/`sequence`/`paletteResolve`/`fallback`/
  `lookCacheKeys`/`UserPaletteService`/`GlovePresetsEnum` exports, plus `resolveRenderPosition`/
  `scaleBodyBounds` (Fix 1), `DarkeningUtils.resolveBrightness` (Fix 2), and
  `resolveRendererTypeLabel` (minor fix); Fix 4 extended `resolveFallbackKey`'s existing
  signature rather than adding a new function; Fix 5 added `resolveAccessoryPlacement`,
  `reflectPoint`, `reflectSpan`, and extended `resolveAccessoryPlacement`'s own signature with a
  `mirrored` parameter in Round 2 rather than adding a second function; Fix 7 added
  `computeBodyBoundsX`, `clearBodySilhouetteX`, and extended `resolveAccessoryPlacement` again
  with `nativeSize`/`baseGroundOffsetY` parameters rather than new functions).
- Approval tests: none — no refactoring-of-existing-behavior tasks in this change (the two
  pre-existing bug fixes changed behavior deliberately, per proposal.md risk 3, not preserved
  it — a live before/after parity check was run instead, see Slice 4 below).

## Per-slice detail

### Slice 0 — Test runners + perf harness + baseline measurement

Files: `client/package.json`, `client/vitest.config.js` (NEW), `server/package.json`,
`server/vitest.config.js` (NEW), `client/src/phaser/debug/{PerfHarness.js,perfEvaluate.js}` (NEW),
`client/.env.example`, `client/src/config/gameConfig.js`, `client/src/App.vue` (window.game/PerfHarness
wiring).

- `npm test` exists and passes on both `client` and `server` (verified).
- `PerfHarness.js` (238 lines): 10s-window FPS mean/p5/min, `totalDisplayObjects`/
  `layeredPieceObjects`, draw-call-or-object-count fallback, `window.__perf.spawnGhosts(n)` driving
  the real `AddUserController.processUser`, `window.__perf.evaluate()`. Gated by
  `VITE_PERF_HARNESS=true`; `window.game` exposed only behind that same flag.
- **NEEDS BROWSER**: the actual baked-renderer FPS baseline at 25 avatars. I verified the module
  loads cleanly under both `npm run dev` and `npm run build` (no console/transform errors), but
  cannot drive `requestAnimationFrame` sampling without a real GPU/browser context.
  - Reproduction: `cd client && npm run dev` (or point a dev server at the Docker backend with
    `VITE_SERVER_URL=http://localhost:3000`, `VITE_API_BASE_URL=http://localhost:8000`), set
    `VITE_PERF_HARNESS=true` in `.env.local`, log in as `God`/`test`, enter any public scene, open
    devtools console, run `await window.__perf.spawnGhosts(25)` then
    `await window.__perf.measure({label:'baked-baseline'})`. Record the JSON.

### Slice 1 — Offline layered-body compiler

Files: `client/.assets-src/` (git-ignored, staged from the decrypted archive), `client/scripts/
compile-layered-avatar.cjs` (291 lines), `client/scripts/lib/{packFrames,validateSupersampling,
mirrorPivot}.cjs` + tests, generated output `client/src/assets/game/avatars/rasta/layers/*`.

- Compiler run against the real `rasta.layers.bb` + `rasta.bb` (colormeta) from
  `/Users/evgeny.lyubeznyy/Downloads/dswmedia_decrypted/personajes/`. Output: 1 page
  (4095x1852, under the 4096 limit), 2204 unique pieces, 103 frames, 15 authored sequences + 9
  synthesized mirror keys, 7 slots (`color1,color2,color3,color4,color5,color7,colorGuante`).
- **Cross-check that materially increases confidence**: the compiled `bodyBounds.w` (83) landed
  *exactly* on the pre-existing baked renderer's `down_walk` config entry's `frameWidth` (83,
  from `client/src/assets/game/avatars/rasta/config.json`) — independent evidence the compiler's
  coordinate handling is correct, not just internally self-consistent.
- **Multiply-tint fidelity finding (non-negotiable, proven early)**: the luminance-warning check
  fired on real compiled data — the labelless `color4` slot (the outline/shadow-line pieces)
  measures mean luminance ~18-27 out of 255 across ~50 pieces, meaning any multiply-tint applied
  to that slot will render substantially darker than the requested hex. This is the concrete,
  proven instance of design.md §5's accepted `setTint`-cannot-brighten cost — not a theoretical
  risk. No colormeta default exists for a bright colour on this slot, so nothing needs
  correcting in this repo; it's a genuine authoring constraint for whoever hand-tunes future
  palette defaults.
- `colorGuante` limitation, discovered from real data: the compiled `rasta.layers.bb` subset
  (only idle/talk/walk directions) contains **no piece** that declares the `colorGuante` slot —
  gloves only appear in punch/uppercut-specific animations, which are not part of this asset
  package. The slot is still a first-class validated palette slot (declared in the manifest,
  accepted server-side per PAL1, persisted per PAL4/PAL9) — it simply has no currently-visible
  pixel to demonstrate the color on for this particular compiled package. This is disclosed
  as a known, real gap, not a design contradiction: the non-negotiable ("glove painted as a
  real palette slot via layered composition") is satisfied at the protocol/rendering-pipeline
  level; the visual pixel is a future-asset-coverage question, not a code gap.

### Slice 2 — Runtime pure modules

Files: `client/src/phaser/layered/{manifestValidation,sequence,pivot,paletteResolve,fallback}.js`,
`client/src/phaser/managers/lookCacheKeys.js`, `AssetVersionManager.js` (MOD).

- **Deviation from design.md's literal collision-test description**: the design text says to
  assert against "all 18 `AvatarManager.getAvatarName()` return values". `AvatarManager.js`
  cannot be imported from this project's isolated `vitest.config.js` (it statically imports
  `@/assets/game/avatars/*` webp/svg files and this vitest config deliberately has no `@` alias
  or asset-transform config — matching design.md §8's "no jsdom, no Phaser instantiation"
  intent). The collision test instead uses a literal, documented 18-name fixture copied from
  `AvatarManager.js:699-718`/`AddUserController.js:517-536`, with an in-file comment explaining
  why. The test still proves the real property (no `lay.`/`acc.`/`aur.`-prefixed key can ever
  collide with any `${name}_atlas`/`${name}_spreadsheet` key).
- `AssetVersionManager.js`: three sibling version dictionaries, `getArtifactVersion()`,
  `checkArtifactUpdates()` wired into `init()`, `boombang_look_asset_versions` as a fully
  separate localStorage key (never touches `boombang_asset_versions`), `clearLayered/
  Accessory/AuraCache()`. Verified with an in-memory `localStorage` mock (no jsdom needed).

### Slice 3 — Layered renderer core

Files: `client/src/phaser/layered/{LayeredAvatar,LayeredAvatarRegistry}.js` (NEW), `AnimationUtils.js`
(MOD), `UserIdleAnimation.js` (MOD).

- **"Two small edits, façade complete" claim — CORRECTED after live browser validation, see "Fix
  4" at the top of this file for the full account.** This section originally asserted the
  façade was complete for all seven existing animation callers via two edits to
  `AnimationUtils.setSpriteConfig`/`UserIdleAnimation` plus what `Container` natively provides —
  matching design.md §5's own claim. **That was false**: live in-room movement threw
  `TypeError: user.spriteAvatar.stop is not a function`, and a separate root cause (the
  mirror-blind fallback resolver) froze the avatar on any of the three right-facing directions.
  Both are now fixed (`stop()`, an `anims` object, `setOrigin()`/`originX`/`originY` added; the
  fallback resolver made mirror-aware) — see Fix 4 for the full root-cause account, the
  corrected façade-contract table, and how each part was verified.
- **Coordinate-space reasoning — CORRECTED after live browser validation (see "Fix 1" at the top
  of this file for the full account).** My original apply-pass reasoning here concluded the
  compiler's `dx`/`dy`/`o`/`bodyBounds` values were "already in final on-screen units" because
  `bodyBounds.w (83)` matched the baked `down_walk` config's `frameWidth` (83) exactly, and
  implemented `setScale(1/ss)` per piece with un-scaled logical positions. **That conclusion was
  wrong** — live validation measured the layered avatar rendering at half the baked renderer's
  real size. The `frameWidth`/`frameHeight` numbers in `config.json` are themselves LOGICAL
  (half-size) numbers the baked renderer never actually scales by; the baked renderer draws its
  full supersampled atlas texture directly. So the `bodyBounds.w == frameWidth` match was a
  same-space (logical-vs-logical) coincidence, not proof of render-space correctness — matching
  logical numbers on both sides does not by itself validate a render-space claim. The fix (pieces
  at native scale, logical positions multiplied by `ss` via the new `resolveRenderPosition`/
  `scaleBodyBounds` pure functions in `pivot.js`) is documented in full, with a pixel-exact
  measurement cross-check (162x196, matching the coordinator's independently measured baked
  frame), at the top of this file.
- `LayeredAvatarRegistry` ticks every registered `LayeredAvatar` from one `scene.events.on('update', ...)`
  hook installed lazily the first time a layered avatar is created — no edits to
  `PublicScene.js`/`PrivateScene.js`/`MinigameScene.js` were needed (Phaser's Scene Systems
  plugin emits `'update'` every frame regardless of whether the scene class defines its own
  `update()` method).

### Slice 4 — Flag wiring, container integration, bug fixes, parity

Files: `gameConfig.js`, `.env.example`, `AvatarManager.js` (MOD, strategy branch +
`loadLayeredAvatar`), `AddUserController.js` (MOD), `UserChangeAvatarController.js` (MOD, client),
`SmartAvatarSystem.js` fix (via the two controller call sites, see below).

- **Bug fixes (proposal.md risk 3), both call sites, with an explicit before/after note:**
  `AddUserController.js:545/552`-equivalent lines and `UserChangeAvatarController.js:297/304`-
  equivalent lines compared `data.userId === user.username` against `SmartAvatarSystem`'s
  `activeAvatars` map, which is keyed by **socket id** (`getAvatarForUser(userData.id, ...)`
  where `userData.id` is the socket id). Both fixed to `user.socketId`. The fix is general
  (not flag-gated): before the fix, a fallback-path avatar-ready upgrade for ANY user (baked or
  future-layered) silently never applied, because the comparison could never be true unless a
  user's `username` happened to equal their `socketId`. After the fix, this now works for both
  baked and layered avatars — I did not "break" a previously-working baked case because there
  was nothing working to break (the bug pre-dates this change and was unconditionally present).
- `safeApplyTint` (both files) gained a one-line `if (sprite && sprite.isLayered) return;` guard
  at the very top; every line below is byte-identical to before.
- `AvatarManager.js`: `isLayeredAvatar()`/`loadLayeredAvatar()` added; strategy branch in
  `loadAvatar()` checks both gates and falls straight through to the untouched baked path
  otherwise.
- **`vite.config.js` left unmodified — verified, not assumed.** design.md predicted one
  `manualChunks`/`onwarn` entry would be needed for the new dynamic-import chunk. I ran a real
  `npm run build` with the layered dynamic imports in place: zero `DYNAMIC_IMPORT` warnings, and
  `rasta.layers.manifest`/`rasta.layers.atlas`/`.webp` all split into their own chunks
  automatically (Vite's default behavior for assets that are *only* ever dynamically imported —
  unlike `CacheManager.js`/`AvatarManager.js`, which are both statically *and* dynamically
  imported, which is what actually triggers that warning class). Forcing an unnecessary
  `manualChunks` edit would have been speculative.
- **`AvatarsDataPreload.js` left unmodified — verified necessary, not an oversight.**
  `AvatarsDataPreload.main()` is called with no scene argument, before `new Phaser.Game()` even
  exists (`App.vue`'s `onLoginSuccess()` calls it, then awaits `initializePhaser()`). It
  literally cannot call `scene.load.multiatlas(...)` at that point. The equivalent multiatlas
  loading lives in `AvatarManager.loadLayeredAvatar()`, reached from the existing
  `loadAvatar()`/priority-loading flow — the real per-scene preload mechanism baked avatars
  already use (`scene.load.once('complete', ...)` + `scene.load.start()`, same idiom as the
  existing baked-atlas loading code at `AvatarManager.js`'s `loadAvatar()`).
- Flag-off structural check: `avatarManager.isLayeredAvatar()` returns `false` whenever
  `gameConfig.LAYERED_AVATARS` is false, so `createAvatarSprite()`'s layered branch is
  unreachable and the container stays the existing 4-element shape. Confirmed by code
  inspection and by a clean `npm run build` with the flag at its default (`false`).
- **NEEDS BROWSER**: live idle/talk/walk parity across all 8 directions (pivot drift, frame
  gaps), and the multiply-tint fidelity visual check across 2-3 alternate hex values.
  - Reproduction: `cd client && npm run dev` with `.env.local` containing
    `VITE_LAYERED_AVATARS=true` and `VITE_SERVER_URL=http://localhost:3000`. Log in as
    `God`/`test` (owns avatar id 12 = rasta). Because `AvatarManager.isLayeredAvatar(12)`
    requires `layeredManifests` to already be populated for id 12, and this vertical slice does
    not add a UI affordance to *switch to* avatar 12 in the client if `God`'s active avatar
    isn't already 12 — the fastest path is: in the debug panel or via the socket-debug tool,
    trigger `request:user_change_avatar {avatar: 12}` for `God`, or grant/seed `God`'s
    `avatar` column to `12` directly (`UPDATE users SET avatar=12 WHERE username='God'` in
    `boombang_api`, then reconnect). Enter a public scene and observe rasta idle/talk/walk in
    all 8 directions against a second window running the same account with the flag off for a
    side-by-side comparison.

### Slice 5 — Palette protocol (server validation, sockets)

Files: NEW `server/src/{controllers/game/scenes/UserChangePaletteController.js,
services/UserPaletteService.js, enums/GlovePresetsEnum.js, data/layeredCharacterManifests.js}`;
MOD `scenesSockets.js`, both `{Request,Response}SocketsEnum.js` pairs, `UserApiService.js`,
server `UserModel.js`/`UserResource.js`; NEW client `UserChangePaletteController.js`; MOD client
`SceneResponseSockets.js`, client `UserModel.js`.

- **`server/src/data/layeredCharacterManifests.js` is a necessary addition beyond tasks.md's
  literal file list.** The server needs to validate slot-key membership (PAL1) without reading
  the client's compiled ESM/Vite manifest JSON (different module system, and validation must
  not depend on the client build existing). This is a small, hand-maintained mirror of the
  compiled rasta manifest's `slots`/`gloveSlot` shape — documented in-file as needing manual
  sync when new characters are compiled.
- **Added an ownership check design.md didn't explicitly call out**: `UserChangePaletteController`
  now verifies `user.avatars.includes(String(avatarId))` before processing, matching
  `UserChangeAvatarController.js`'s existing pattern. Found this gap live: the real `God` test
  account's *active* avatar (`avatar_id`) is 1 (boomer), not 12 (rasta) — without an ownership
  check, a client could submit a palette change for an avatar the user merely *owns but isn't
  wearing*, or (without any check at all) for an avatar id they don't own at all. Rejects with
  `NOT_OWNED`.
- **Live-validated end-to-end** with a `socket.io-client` script (`node` script run from
  `server/`, using `server/node_modules/socket.io-client`; login `God`/`test`, join the first
  public scene, then):
  - Accepted change (`color3` free hex): broadcast received with `{socketId, avatarId, slots}`,
    ack `{success:true, code:null, message:null}`.
  - Rejected change (unknown slot key): ack `{success:false, code:"UNKNOWN_SLOT", message:...}`,
    **socket remained connected** (`socket.connected === true` confirmed after the rejection).
  - Locked glove preset (`gold` at tier 0): `{success:false, code:"LOCKED_PRESET", ...}`.
  - Unlocked glove preset (`red` at tier 0): `{success:true, ...}`.
  - Arbitrary hex on the glove slot: `{success:false, code:"INVALID_VALUE", ...}`.
  All captured verbatim below (see "Raw probe output" section).

### Slice 6 — Palette API persistence

Files: NEW `api/database/migrations/2025_12_10_000000_create_user_avatar_palettes_table.php`,
`api/app/Models/UserAvatarPalette.php`, `api/app/Services/UserAvatarPaletteService.php`,
`api/app/Http/Controllers/Api/User/UserChangePaletteApiController.php`,
`api/tests/Feature/UserAvatarPaletteTest.php`; MOD `api/routes/api.php`, `api/app/Models/User.php`
(`avatarPalettes()`), `api/app/Http/Resources/UserResource.php` (`avatar_palettes` — the read path
design.md's file list didn't separately call out, but is required for PROTO4's "retrieve on
reconnect" half; the write path alone is not sufficient).

- Migration applied to the **live shared dev database** (`docker exec ... php artisan migrate
  --force`) — additive only (`CREATE TABLE`), verified with `phpunit` immediately after.
- phpunit uses `DatabaseTransactions`, not `RefreshDatabase` — this repo's `ExampleTest.php` has
  `RefreshDatabase` explicitly commented out, and there is no `.env.testing` (phpunit runs
  against the real `boombang_api` MySQL/MariaDB database per `phpunit.xml`'s commented-out
  sqlite override). `RefreshDatabase` would risk a destructive `migrate:fresh` against the
  shared dev database; `DatabaseTransactions` wraps each test in a rolled-back transaction
  instead — non-destructive, and consistent with the existing test's own commented-out choice.
- `UserFactory` doesn't set `username` (a required, no-default column on the real `users`
  table) — fixed locally in the new test file only (`User::factory()->create(['username' =>
  ...])`), not in the shared factory (out of scope for this change).
- **Live end-to-end reconnect-persistence probe** (PROTO4): session 1 logs in, joins, sets
  `color1` to a randomly generated hex, disconnects; session 2 logs in fresh and the exact same
  hex is present in `avatar_palette["12"].color1`. Full output below.

### Slice 7 — Debug panel

Files: NEW `client/src/views/components/game/debug/AvatarLookDebugPanel.vue` (235 lines, built
incrementally through Slices 7-10); MOD `client/src/App.vue` (mount behind
`VITE_AVATAR_LOOK_DEBUG`), `.env.example`.

- Renders manifest-declared slots with `manifest.labels[slot] ?? slot` (PAL3 live-shape proof —
  will literally show `color4` unlabelled for rasta, and `piel`/`rastas`/etc. for the labelled
  ones), plain `<input type="text">` hex fields (no `iro.js`), glove `<select>` of the ten
  preset names with above-tier options `disabled` (display-only — server re-checks). Renders
  the ACK verbatim.
- Verified: `npm run build` and `npm run dev` both load the component cleanly with
  `VITE_AVATAR_LOOK_DEBUG=true`; `curl`'d the transformed `.vue` module under Vite dev with no
  transform errors.
- **NEEDS BROWSER**: the actual click-through — changing a slot and observing the in-room
  avatar update within 100ms without sprite replacement, the two-session broadcast, and the
  flag-toggle persistence check.
  - Reproduction: with `VITE_LAYERED_AVATARS=true` and `VITE_AVATAR_LOOK_DEBUG=true` in
    `.env.local`, `npm run dev`, log in as `God`/`test` in two browser windows/profiles, enter
    the same public scene in both. In window A's debug panel, type a new hex for `color1` (or
    pick a glove preset) and click Apply. Expect: window A's avatar recolors immediately
    (network tab shows `request:user_change_palette` → `response:user_change_palette_ack`
    `{success:true}` and a `response:user_change_palette` broadcast); window B's avatar (viewing
    God) recolors within the same broadcast round-trip, with no sprite/texture reload visible.
    Reload window A (or reconnect) — the colour should still be present without user action.

### Slice 8 — Aura

**Z-order note (all of Slices 8-10) — CORRECTED after live browser validation, see "Fix 4" at
the top of this file.** This slice and Slices 9-10 below originally shipped the intended
z-order (shadow/aura/pet/body/hat/nameBg/nameText) purely via each object's `.depth` value,
following design.md §1's stated assumption that `Container` auto-sorts children by depth. Live
testing found all three accessory kinds rendering BEHIND the body — `Container` does not
auto-sort (confirmed from Phaser's own source; see Fix 4) — fixed with explicit `.sort('depth')`
calls at construction and on every accessory update/live-equip. The z-order values themselves
(`0.2`/`0.5`-`1.5`/`1.0`/`1.0+zBias`) were always correct; only the enforcement mechanism was
missing.

Files: NEW `client/scripts/compile-accessory.cjs` (aura mode), `client/src/phaser/layered/
AccessoryLayer.js`, `client/src/phaser/managers/AccessoryManager.js` (necessary addition, see
Slice 5's data-module note — same rationale, this time for accessory package loading),
`client/src/assets/game/accessories/aura/auraElectrica/*` (generated); NEW server
`UserChangeAccessoryController.js`; MOD `UserApiService.js`, `scenesSockets.js`, both enum pairs;
NEW api `UserAccessoryApiController.php`, migration `2025_12_10_000001_add_accessory_columns_to_users_table.php`;
MOD `User.php` (`enabledHats/Pets/Auras()`), `UserResource.php` (owned/equipped fields),
`api/routes/api.php`.

- **Blocking gate result (real finding, exactly what the non-negotiables asked for):** measured
  all three source aura sheets from `dswmedia_decrypted/effects/`:
  - `aura_azul.webp`: **8113x652px — FAILS** (width exceeds 4096).
  - `aura_dorada.webp`: **8113x652px — FAILS** (same).
  - `aura_electrica.webp`: **1064x978px — PASSES.**
  Per design.md §3.2 and the task instructions, oversized sheets are NOT paginated — they are
  escalated. Since the proposal's scope only requires *one* compiled aura for the vertical
  proof, I used `aura_electrica` (key: `auraElectrica`) and did not attempt to compile
  `aura_azul`/`aura_dorada`. Escalation note for whoever owns those two assets: they need to be
  re-authored at ≤4096px on the wide axis (e.g. fewer columns, more rows) before they can ship
  through this compiler.
  - Verified the hard-fail actually fires: staged `aura_azul` as a throwaway test input and
    confirmed the compiler throws `"sheet 8113x652 exceeds the 4096px limit..."` and exits 1,
    then removed the throwaway input/output.
- **LR6 correction applied during Slice 10 wrap-up** (documented here since it affects Slice 8's
  code): the avatar-layered-rendering spec's flag-off scenario explicitly requires "no accessory
  child sprites created" — I initially built the aura as flag-independent (reasoning from ACC2's
  "character-independent" framing), then caught the LR6 conflict and gated
  `AddUserController.createAccessoryChildren()` (and the live-update path in client
  `UserChangeAccessoryController.js`) behind `gameConfig.LAYERED_AVATARS` as a whole. Equipped
  state is still tracked client-side so it applies correctly the moment the flag is re-enabled;
  nothing is lost, just not rendered while the flag is off.
- **Live-validated end-to-end**: granted `auraElectrica` to `God` via direct SQL insert into
  `catalog_items`(`user_decoration_type='avatar_aura'`, `user_decoration_value='auraElectrica'`)
  + `user_catalog_items` (no Backpack admin UI available in this environment — documented as the
  operational equivalent of an admin grant; a real admin would do this by clicking through
  Backpack's catalog-item CRUD, not SQL). Then via `socket.io-client`:
  `owned_accessories.hat/pet/aura` on login correctly showed `["auraElectrica"]` for aura;
  `request:get_user_accessories` returned the same; equip accepted with broadcast
  `{socketId, kind:"aura", value:"auraElectrica"}` and `{success:true}` ack; equipping an
  unowned aura name rejected with `{success:false, code:"NOT_OWNED"}`, connection stayed open;
  reconnect showed `accessories.aura === "auraElectrica"` persisted.
- **NEEDS BROWSER**: visual confirmation of z-order (behind body, above shadow) and that the
  same aura looks identical on a different character.
  - Reproduction: with the flag on and the debug panel's aura `<select>` showing
    `auraElectrica`, select it and observe it render at the character's feet, drawn behind the
    body sprite and above the shadow ellipse.

### Slice 9 — Hat

Files: MOD `client/scripts/compile-accessory.cjs` (vector mode added, 323 lines total), NEW
`client/scripts/lib/svgFromPaths.cjs` + test, MOD `client/src/phaser/layered/{AccessoryLayer,
LayeredAvatar}.js` (hat kind + attach/detach + mirror-aware positioning), `client/src/assets/game/
accessories/hat/hat_minnie/*` (generated); server/API accessory pipeline extended generically
(no new files, `kind` was already a free-form string); debug panel hat `<select>`.

- Compiled `hat_minnie` from the real decrypted archive
  (`personajes/rasta/hat/minnieHat.bb`): 41 animations, 778 declared unique frames deduped
  further to **755 truly-unique rasters** (23 cross-animation duplicates found and merged — the
  source data's own `deduped`/`perAnimUniq` flags only dedupe *within* one animation, so this
  compiler-level global dedup is a real, measured improvement), packed onto one 4090x3862 page
  (just under the 4096 limit — close enough that a future, slightly larger hat package would
  need genuine pagination logic this compiler does not yet have for vector mode).
- **Command-alphabet finding**: scanned every `_frames_*.json` in the staged hat input and
  confirmed only `M`, `L`, `Q` path commands appear — `svgFromPaths.cjs`'s allow-list (`M L Q C
  Z`) is a superset chosen defensively; the throw-on-unrecognised path was verified with a
  synthetic `A` (arc) command in a unit test, not just asserted.
- **Anchoring formula — a genuine, documented design decision, not spec-literal.** Neither
  design.md nor the avatar-accessories spec spells out the exact arithmetic for how a hat's
  `(regX, regY)` combines with the wearer body's own per-frame origin. I derived and documented
  (in `LayeredAvatar.js`'s `_updateAccessory` docblock and here): hat and body frame-index
  sequences for the same shared animation key have **identical lengths** (verified: hat and
  body `down_walk` both have exactly 13 frames), consistent with both being separate layers of
  one original animated rig sharing one coordinate system. The hat's local position in
  `containerUser` space is therefore `hatFrame.regX/regY - bodyFrame.o` (or `.oMirror` when
  mirrored) — the same subtraction the body already applies to its own pieces. Mirroring reuses
  `pivot.js`'s `mirrorPivot()` on the hat's own `regX` against the CURRENT wearer's
  `bodyBounds.w` (computed live at render time, not baked into the hat's own compiled manifest,
  since a hat's `compatibleHats` list could in principle span characters with different
  `bodyBounds`). **Updated by Fix 1** (top of this file): this logical-space offset is now
  additionally passed through `resolveRenderPosition(..., manifest.ss)` before being applied to
  the sprite, and accessories render at native scale instead of `1/ss` — the offset *formula*
  described here is unchanged, only the final render-space scaling step was corrected.
- **zBias applied deterministically, not "by hand" as design.md's prose suggests** — design.md
  Slice 9 task 4 calls this "manual authoring work... not automatable". I applied it via a
  small deterministic rule instead (every unique frame that appears in `up_idle`/`up_talk`/
  `up_walk`/`leftup_idle`/`leftup_talk`/`leftup_walk` gets `zBias: -0.4`), which is equivalent in
  outcome, fully reviewable in the compiler's source rather than hidden in hand-edited JSON, and
  reproducible on recompile. 26 of the 755 unique hat frames were tagged this way.
- **Live-validated end-to-end**: granted `hat_minnie` to `God` (same SQL-insert pattern as the
  aura); equip accepted, broadcast correct, reconnect persisted `accessories.hat ===
  "hat_minnie"` alongside the aura.
- **NEEDS BROWSER**: the actual anchor/z-order/no-back-facing-artifact visual check across all
  8 directions — this is the part of Slice 9 I am least certain about without seeing it
  rendered, precisely because the anchoring formula above is a derived, not spec-given, rule.
  - Reproduction: with the flag on, equip `hat_minnie` via the debug panel on `God` wearing
    rasta, and cycle through walk in all 8 directions (arrow keys / movement in the public
    scene). Watch specifically for: (a) the hat staying visually attached to the head rather
    than drifting, (b) the hat disappearing behind the head rather than floating in front of it
    when facing up/leftup/rightup, (c) the hat correctly mirroring (flipping) on right-facing
    vs left-facing movement.

### Slice 10 — Pet

Files: MOD `client/src/phaser/layered/{AccessoryLayer,LayeredAvatar}.js` (pet kind + depth flip),
`client/src/assets/game/accessories/pet/pet09/*` (generated, reusing Slice 9's vector compiler);
debug panel pet `<select>`.

- Compiled `pet09` reusing the Slice 9 compiler **unchanged** in interface — one real bug was
  found and fixed in the shared compiler while compiling pet09: several pet frames
  (`cara_grande`, `cara_mediana`, `cara_peque`, `cayendo`, `ficha`, `left_falling`) declare an
  **empty** `p: []` array (the pet draws nothing during face-closeup/falling states). The
  original SVG-bounds code produced `Infinity`/`-Infinity` bounds for these, which crashed
  `sharp`'s SVG rasterizer with a "corrupt header" error. Fixed by special-casing empty-geometry
  frames to a 1x1 transparent placeholder raster before the SVG path is ever built. This fix
  also applies to the hat compiler (shared code) and was verified not to change `hat_minnie`'s
  755-unique-frame count on recompile.
- 223 unique frames after dedup (out of the source's declared unique-per-anim totals), one page.
- `petDepth = relativeY >= 0 ? 1.5 : 0.5` implemented exactly per design, computed from the same
  registration-point resolution the hat already uses (no extra state).
- **Live-validated end-to-end**: granted `pet09` to `God`; equip accepted; reconnect confirmed
  **all three accessories together** — `{"hat":"hat_minnie","pet":"pet09","aura":"auraElectrica"}`
  — persisted correctly in one login payload.
- **NEEDS BROWSER**: the depth-flip visual check (pet in front of the owner when nearer the
  viewer, behind when farther) and the accepted limitation that the pet does not participate in
  world Y-sorting against *other* users (a code-level limitation inherited from design.md §1's
  cost 1, not something I could newly break or newly fix in this slice).

## Deviations summary (all disclosed above, collected here for quick scan)

1. Collision-test fixture is a documented literal duplicate of `AvatarManager.js`'s 18 names,
   not a live import (Slice 2) — necessary given the isolated vitest config.
2. `AssetVersionManager.test.js` and `LayeredAvatarRegistry.test.js` were written alongside
   their implementation rather than strictly before (Slice 2/3) — both genuinely GREEN and
   triangulated, disclosed rather than hidden.
3. **SUPERSEDED by "Fix 1" at the top of this file.** The original apply pass's reading of
   design.md §5 (pieces at `1/ss` scale, un-scaled logical positions, justified by the
   `bodyBounds.w == baked frameWidth` cross-check) was live-validated and found wrong — it
   rendered the avatar at half the correct size. The corrected contract (native piece scale,
   `resolveRenderPosition`/`scaleBodyBounds` multiplying logical values by `ss`) is now in place
   and pixel-exact-verified (162x196 rendered bbox matching the measured baked frame).
4. `vite.config.js` and `AvatarsDataPreload.js` were left unmodified where design.md predicted
   edits — both verified unnecessary/infeasible respectively, not skipped for convenience
   (Slice 4).
5. `server/src/data/layeredCharacterManifests.js` and `client/src/phaser/managers/
   AccessoryManager.js` are necessary additions beyond tasks.md's literal file lists (Slices 5
   and 8) — loader/validation bookkeeping that has to live somewhere, following the existing
   `AvatarManager.js` pattern.
6. Ownership check added to `UserChangePaletteController` beyond design.md's explicit text
   (Slice 5) — closes a real authorization gap found while live-testing.
7. LR6's "no accessory child sprites with the flag off" requirement was initially missed (aura
   built as flag-independent, reasoning from ACC2 alone) and corrected before Slice 10 wrapped
   up — now all accessory creation/live-update is gated behind `gameConfig.LAYERED_AVATARS`
   (Slice 8, corrected during Slice 10).
8. Hat/pet body-relative anchoring formula and mirroring are a derived design decision, not
   given literally by any spec or design.md text (Slice 9) — documented in-code with the
   supporting evidence (matching frame-sequence lengths between hat and body).
9. zBias for hat back-facing frames applied by deterministic frame-membership rule instead of
   literal hand-editing of JSON (Slice 9) — equivalent outcome, more reviewable.
10. Empty-geometry frame handling added to the vector compiler (Slice 10, benefits Slice 9 too)
    — a real crash found and fixed against real pet09 data.
11. IndexedDB-level blob caching for layered/accessory assets (the `lay.`/`acc.`/`aur.` cache-key
    functions from Slice 2) is implemented and unit-tested but **not yet wired into
    `AccessoryManager`/`AvatarManager`'s actual load methods** — every layered/accessory load in
    this vertical slice re-fetches over the network each time rather than persisting into
    `CacheManager`'s IndexedDB stores. This is a scope cut for the vertical-slice proof, not a
    bug: nothing in the four specs mandates persistent caching, and the cache-key
    non-interference proof (the actual spec-relevant guarantee) is fully tested and true.
12. Changing FROM a baked avatar TO a layered one via the existing in-session
    `UserChangeAvatarController.js` (both server and client) still uses the baked
    sprite-replacement path — design.md's file list for that controller only calls for the two
    specific bug-fix/guard edits (confirmed against the exact line numbers), not a full layered
    branch in `replaceUserSprite()`. A user's layered avatar is only rendered as such when they
    *join* a scene already set to that avatar, not via a live in-session switch. Documented
    limitation, not silently dropped scope — full parity for the in-session switch path would
    require a `replaceUserSprite()` rewrite mirroring `createAvatarSprite()`'s strategy branch,
    which was not called out in tasks.md's Slice 4 file list.

## Raw probe output (Slice 5/6/8/9/10 live validation)

Palette accept/reject (Slice 5):
```
=== broadcast received ===
{"socketId":"PFEffwsTDo0UABnCAAAD","avatarId":12,"slots":{"color3":"#123abc"}}
=== ack (phase 1) ===
{"success":true,"code":null,"message":null}
=== ack (phase 2) ===
{"success":false,"code":"UNKNOWN_SLOT","message":"Unknown slot key \"unknownSlot\""}
Socket still connected after rejection: true
```

Glove gating (Slice 5, PAL7/PAL8):
```
locked "gold" @ tier 0  -> {"success":false,"code":"LOCKED_PRESET", ...}
unlocked "red" @ tier 0 -> {"success":true, ...}
arbitrary hex on glove  -> {"success":false,"code":"INVALID_VALUE", ...}
```

Reconnect persistence (Slice 6, PROTO4):
```
Session 1 avatar_palette on login: []
Setting color1 to #aa9478 -> ack {"success":true,...}
Session 1 disconnected.
Session 2 avatar_palette on login: {"12":{"color1":"#aa9478"}}
RESULT: persisted color1 = #aa9478 | expected = #aa9478 | MATCH = true
```

Accessories (Slices 8-10):
```
owned_accessories on login: {"hat":[],"pet":[],"aura":["auraElectrica"]}   (before grants)
equip aura  -> broadcast {"socketId":"...","kind":"aura","value":"auraElectrica"}, ack success:true
equip unowned aura "notOwnedAura" -> {"success":false,"code":"NOT_OWNED", ...}, connected: true
equip hat_minnie -> ack success:true
equip pet09 -> ack success:true
Final reconnect: accessories = {"hat":"hat_minnie","pet":"pet09","aura":"auraElectrica"}
```

phpunit baseline (start of session) vs after all API changes:
```
Before: Tests: 2, Assertions: 2, Failures: 1  (ExampleTest only)
After:  Tests: 6, Assertions: 10, Failures: 1 (ExampleTest only — same pre-existing failure)
```

## Line counts (hand-written, excludes generated manifest/atlas JSON and .webp bytes)

Approximate, by primary slice (some files touched across slices, counted once at first
introduction):

| Slice | Hand-written lines (new + changed) | Notes |
|---|---|---|
| 0 | ~330 | PerfHarness.js (238) + perfEvaluate (31+26) + config/env wiring |
| 1 | ~535 | compile-layered-avatar.cjs (291) + 3 lib files + tests (~244) |
| 2 | ~350 | 6 pure modules + tests + AssetVersionManager MOD |
| 3 | ~420 | LayeredAvatar.js (321, grew further in Slices 9-10) + Registry + tests + 2 small MODs |
| 4 | ~150 | gameConfig/env/AvatarManager strategy branch/AddUserController/UserChangeAvatarController edits |
| 5 | ~330 | UserPaletteService (137+86) + controller (28) + GlovePresetsEnum (34+32) + enum/socket MODs |
| 6 | ~310 | migration + model + service + controller + phpunit test (89) |
| 7 | ~235 | AvatarLookDebugPanel.vue (final size after Slices 8-10 additions) |
| 8 | ~520 | compile-accessory.cjs aura mode + AccessoryLayer + AccessoryManager (110) + server/API accessory files |
| 9 | ~330 | compile-accessory.cjs vector-mode addition + svgFromPaths (78+45) + LayeredAvatar accessory hooks |
| 10 | ~60 | AccessoryLayer pet factory + LayeredAvatar depth-flip branch + debug-panel pet select |

Several slices (1, 3, 8, 9) individually exceed the 400-line chained-PR budget on a strict
per-slice count, consistent with tasks.md's own warning that Slices 1 and 5 were the likely
over-budget candidates (5 stayed under; 1, 8 and 9 did not, mainly due to compiler code +
their accompanying unit tests, which the chained-PR skill's tests-with-code rule says must
ship together). Since this apply ran as one continuous session per explicit instruction rather
than as literal separate PRs, no further sub-slicing was performed; if these are cut into real
PRs later, tasks.md's own fallback split points (server/client boundary for Slice 5; splitting
Slice 1 into compiler-lib vs. orchestrator-plus-generated-output) are the natural boundaries,
and generated manifest/atlas/`.webp` bytes in Slices 1/8/9/10 should get a `size:exception` per
the chained-PR skill (they are correctly non-reviewable line-by-line).

## Remaining work / follow-ups (not blockers, explicitly out of this session's proof)

- Browser-based visual verification for every "NEEDS BROWSER" item above (Slices 0, 4, 7, 8, 9,
  10) — this is the orchestrator's stated responsibility, not a gap in this apply pass.
- `aura_azul`/`aura_dorada` re-authoring at ≤4096px (Slice 8 escalation, out of this change's
  scope — only one aura was required).
- IndexedDB blob caching for layered/accessory assets (deviation 11) — a real follow-up, not
  required by any of the four frozen specs.
- Full layered-branch support in `UserChangeAvatarController`'s `replaceUserSprite()` for a live
  in-session baked→layered switch (deviation 12) — out of tasks.md's Slice 4 scope as written.
- Backpack admin UI was not used for the three accessory/aura grants in this session (no
  browser); direct SQL inserts into `catalog_items`/`user_catalog_items` were used instead, with
  the exact same schema and semantics a Backpack CRUD save would produce. A maintainer should
  confirm the Backpack admin screens actually expose `avatar_hat`/`avatar_pet`/`avatar_aura` as
  selectable `user_decoration_type` values (they are plain strings in the DB, so this should
  work without any Backpack config change, but this apply pass could not click through the UI
  to confirm the dropdown renders them).
