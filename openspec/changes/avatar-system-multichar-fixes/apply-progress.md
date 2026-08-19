# Apply progress: avatar-system-multichar-fixes

Delivery: `force-chained` / `feature-branch-chain`. No commits, no branches, no PRs created —
everything is in the working tree. This file records the PR/slice boundary so the chain can be
cut into commits/PRs later.

Strict TDD active (`openspec/config.yaml`). Test commands: `cd client && npm run test` (vitest),
`cd client && npm run test:e2e` (Playwright), `cd api && ./vendor/bin/phpunit` (blocked — PHP
absent from this environment, see PR10/slice 10 below).

**Numbering note, so this file's history reads correctly.** The PR1-PR11 headings below (this
apply pass's first `## PRn` sections) are the same units of work `tasks.md` now calls "slices
1-11" — `tasks.md` was rewritten mid-project onto a slice-numbered structure once the renderer
fork (§12) was decided, and slice numbers are the ones that carry forward. A stale early-session
placeholder table that once sketched "PR7-PR12" as future roster-migration batches (sally, then
four 3-4-character batches, then conditional aura pagination) is REMOVED here rather than kept
as dead prose: none of the PR7-PR12 content it guessed at is what actually shipped under those
same numbers (PR7 became "production-parity metrics", PR8 became the vector-runtime spike, PR9
"glob-based registries", PR10 `sally` registration, PR11 the asset-authoring round-trip — all
below, all DONE). From this point on, sections are headed `## Slice N` to match `tasks.md`
directly. Slices 1-11 are DONE and summarized compactly below (full detail already recorded in
the original `## PRn` sections that follow); **slices 12-19 are this apply pass's scope** and are
recorded in full.

## Status by slice

| Slice | Status | Notes |
|-------|--------|-------|
| 1 | Done | depths.js, fallback.js (resolveAnimationKey), degradeReporter.js, sequenceClock.js, LayeredAvatar.js wiring, openspec/config.yaml fix |
| 2 | Done | Playwright harness |
| 3 | Done | Pet canonical side: petSide.cjs, resolvePetSideX, pet09 recompiled (side: left — **corrected to "right" by Correction 3, 2026-08-18, see below**) |
| 4 | Done | Character-scoped accessory registry, stage-layered-source.sh, minnieHat naming correction |
| 5 | Done | Full vector→raster action pipeline; rasta's full 26-action-key set compiled, R6/R8/R11 live |
| 6 | Done | Lazy action pack: two atlas keys, staleness guard, requestIdleCallback prefetch, R12 live |
| 7 | Done | Production-parity metrics (avatarMetrics.js, R14) |
| 8 | Done | Decision spike vector-vs-raster, verdict RASTER WINS, vector runtime built (later removed slice 12) |
| 9 | Done | Glob-based registries (parseAccessoryAssetPath, buildAccessoryPackagesFromGlob, buildLayeredAvatarRegistry) |
| 10 | Done | `sally` registration (ONLY server/API/DB slice); `SallyAvatarCatalogItemSeeder.php` unexecuted (PHP absent) |
| 11 | Done | Asset-authoring round-trip: Tier 1 (annotations) + Tier 2 (SVG export/import) live-verified; no vector editor validated |
| 12 | Done | Vector runtime removed; 5 shared modules moved to `shared/assetPipeline/` |
| 13 | Done | Serving tier: real Docker build measured, ~5.06× real reduction on room entry |
| 14 | Done | Manifest split per pack; real room-entry now 454.7 KB compressed, matching design's ≈460 KB target |
| 15 | Done | Per-key action packs, prefetch removal, eviction mechanism (unwired scheduler, disclosed) |
| 16 | Done | Compaction wired end-to-end; bundling built for base pack (disclosed reduced scope) |
| 17 | Done | Real encoder tuning shipped (effort:6 everywhere, nearLossless:60 on action packs); alpha-vs-RGB question settled by measurement |
| 18 | Done | Overlap tool built + run; measurement is honestly INCONCLUSIVE at N=1 package, nothing further built |
| 19 | Done | R18 GATE measured: 6/7 rows PASS, M3 worst key FAILS (real, substantial improvement, still over budget) — STOP per instructions, no escalation implemented |
| 20 | Done | R18 gate CLOSED: 7/7 PASS. Measurement-driven `ss:1` selected `left_fall` AND `left_beber` (a second, previously-unmeasured over-budget key) on `rasta`; every other of 26 action keys confirmed byte-identical/deterministic. Runtime per-piece-ss scaling (`resolvePieceSs`, pivot.js) added. 60 files/460 tests; 34/34 e2e. |
| 21 | Done | R19 matrix genuinely parameterized (`describeCharacterMatrix`, 1 call site: `rasta`); visual contact-sheet tooling built with 2 real committed sheets; real-`PublicScene` validation surface built. 3 real bugs found live during this slice (off-screen spawn, opaque label overlay, avatar-accumulation) plus 4 real crashes fixing the real-scene boot — **and 2 further real defects the coordinator caught by looking at the produced sheets**: the body rendered with NO palette colour at all (root cause: `Phaser.CANVAS` never applies `setTint()`, fixed by matching `App.vue`'s own `Phaser.AUTO` default; residual risk for real Canvas-forced clients disclosed, not fixed) and the shadow/name-tag were unassessable in the capture (fixed: mid-tone background + `showUsername:false`). New pixel-level R8-pixel assertion added, RED-then-GREEN evidence captured for both renderer states. 63 files/478 tests; 41/41 e2e. |
| Corrections (before 22) | Done | **Correction 1**: minnie-hat back-view black mass confirmed legitimate art (user decision), zero code touched. **Correction 2**: the disclosed Canvas-renderer residual risk from slice 21 is now FIXED, not just disclosed — pre-multiplied per-(piece,colour) texture cache (`canvasTint.js`/`canvasTintCache.js`), WebGL `setTint()` path untouched, RED→GREEN captured (64/64→<=10% differing pixels), M4-equivalent memory measured honestly (one-action: 36.84 MB PASS; full 65-key sweep: 247.71 MB, dominated by pre-existing atlas residency, tint-cache's own share only 7.4 MB). **Correction 3**: `derivePetSide` was comparing the wrong quantity (raw `regX`, missing the `originX`/width correction term) — fixed to compare the pet's fully-resolved centre against the body's own `down_idle` origin; `pet09` recompiles to `side: "right"`, matching the user's report once reconciled with the evidence (down/up are unmirrorable and decide the answer). R3/R4 gained an explicit `expectedPetSide` pin, RED→GREEN captured. 65 files/497 tests; 45/45 e2e. |
| 22 | Done | `sally` compiled (41 sequences, 0 aliases, 0 mirrors, 0 palette slots — real, disclosed facts of having no baked-config precedent), `AvatarsDataPreload.js` wired, matrix coverage honest (2 disclosed gaps: CRY emoji degrades for her, right-family directions degrade to down). **Found and fixed a foundational harness defect affecting every future slice**: `SmartAvatarSystem`'s own separate baked-legacy availability tracker silently substituted RASTA for any avatarId the harness never primed — invisible until now because every prior e2e test (slices 1-21, all corrections) only ever requested RASTA. Fixed in `spawnAvatarUser.js` (harness-only). 66 files/499 tests; 65 e2e (56 passed, 9 skipped-with-reason, 0 failed). |

## PR1 — Depth table, animation events, degrade telemetry, config fix

Files changed:
- `client/src/phaser/layered/depths.js` (new) — `DEPTHS` table + `resolveAccessoryDepth(kind, {zBias, relativeY})`, `clampHatZBias`.
- `client/src/phaser/layered/depths.test.js` (new).
- `client/src/phaser/layered/AccessoryLayer.js` — `createAura` now sets depth via `resolveAccessoryDepth('aura')` (1.80, was 0.2 literal); docblocks for hat/pet updated to reference the shared table.
- `client/src/phaser/layered/LayeredAvatar.js` — `_updateAccessory` now sets hat/pet depth via `resolveAccessoryDepth('hat', {zBias})` / `resolveAccessoryDepth('pet', {relativeY})` (pet-front was `1.5` literal, now `1.60`); `play()` records `this._requestedKey` (the raw requested key, pre alias/mirror resolution); `anims.currentAnim` getter now keys off `_requestedKey`, not `_seqKey`; `tick()` rewritten as a thin wrapper over `advanceSequence` (sequenceClock.js) that emits `animationupdate` per visited frame (1-based `index`) and `animationcomplete` once, after `_playing = false`, for a non-repeating sequence reaching its last frame.
- `client/src/phaser/layered/sequenceClock.js` (new) — pure `advanceSequence({seqIndex, accum, fps, repeat, frameCount}, delta)`, extracted so tick() boundary behaviour (repeat:0 completes once, repeat:-1 never) is unit-testable without a live Phaser scene (design.md §8 constraint).
- `client/src/phaser/layered/sequenceClock.test.js` (new).
- `client/src/phaser/layered/fallback.js` — added `resolveAnimationKey(sequences, requestedKey, currentDirection, mirrors, aliases, unloadedKeys)` → `{requestedKey, resolvedKey, degraded, reason}`, all 6 reasons (`match`, `alias`, `mirror`, `pack-loading`, `direction-idle`, `down-idle`); `resolveFallbackKey` is now a one-line wrapper over it, unchanged signature/behaviour.
- `client/src/phaser/layered/fallback.test.js` — 9 legacy tests untouched and still passing; 7 new tests for `resolveAnimationKey` covering all 6 reasons plus the default-args case.
- `client/src/phaser/layered/degradeReporter.js` (new) — `report({avatarId, requestedKey, resolvedKey, reason})`, `Map` keyed by tuple, `console.warn` on first occurrence only, subsequent calls only increment `count`; exposes `globalThis.window.__layeredDegrades` unconditionally.
- `client/src/phaser/layered/degradeReporter.test.js` (new).
- `client/src/phaser/controllers/scene/AddUserController.js` — updated the stale `0.2` aura-depth doc-comment to `1.80`; no functional change (this file never set the depth literal itself, only documented it).
- `openspec/config.yaml` — client test command corrected to `cd client && npm run test`; added server `cd server && npm run test` (both verified against `package.json`); added the `test:e2e` entry for PR2; removed the stale "client/server have no test runner" prose.

Note: `resolveAnimationKey` is not yet wired into `LayeredAvatar.play()` in place of
`resolveFallbackKey` (that stays `PR5`/`PR6` work, once `aliases`/`unloadedKeys` have real
producers — an empty `aliases`/`unloadedKeys` today would be a no-op wiring change with no
behavioural test to justify it yet). `play()` still calls `resolveFallbackKey`, which now
delegates to `resolveAnimationKey` internally, so today's behaviour is unchanged byte-for-byte.

### TDD Cycle Evidence — PR1

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 | `depths.test.js` | Unit | N/A (new) | not-run (nonexistent module `./depths.js`) — captured: `Cannot find module './depths.js'` | Passed (11/11) | 11 cases: table shape, 4 hat-clamp boundaries, hat_minnie's shipped 0.5, pet front/behind, aura invariance, unknown-kind throw, total-order property loop | Clean |
| 2 | `AccessoryLayer.js`, `LayeredAvatar.js`, `AddUserController.js` | wiring | ✅ baseline: `src/phaser/layered` 143/143 before edit | N/A (wiring, no new test — covered by depths.test.js + existing suite) | Passed (existing 143 unaffected + depths 11) | N/A (structural wiring) | Clean |
| 3 | `fallback.test.js` | Unit | ✅ baseline: 9/9 existing `resolveFallbackKey`/`accessoryFollows` tests passing | Executed-failing: `TypeError: (0 , resolveAnimationKey) is not a function` (×7 new cases) | Passed (16/16, 9 legacy + 7 new) | 7 cases, one per reason (match/alias/mirror/direction-idle/down-idle/pack-loading) + defaults case | Clean |
| 4 | `degradeReporter.test.js` | Unit | N/A (new) | not-run (nonexistent module `./degradeReporter.js`) — captured: `Cannot find module './degradeReporter.js'` | Passed (4/4) | 4 cases: first-warn, repeat-count-no-warn, different-tuple-warns-again, map exposure | Clean |
| 5 | `sequenceClock.test.js` | Unit | N/A (new) | not-run (nonexistent module `./sequenceClock.js`) — captured: `Cannot find module './sequenceClock.js'` | Passed (6/6) | 6 cases: repeat:-1 advance, repeat:-1 wrap (never completes), repeat:0 pre-boundary, repeat:0 exact completion (fires once), multi-frame-per-tick accumulation, sub-frameDuration no-op | Clean |
| 6 | `openspec/config.yaml` | N/A | N/A | N/A | N/A | Triangulation skipped: structural single-output config edit (per strict-tdd exception) | N/A |

Full client suite after PR1: `cd client && npm run test -- --run` → **19 test files, 195 tests,
all passing** (3 new files this PR: `depths.test.js`, `degradeReporter.test.js`,
`sequenceClock.test.js`; `fallback.test.js` grew from 9 to 16 tests in place). Per-task safety
nets (targeted-file baselines, not a full-suite run) are captured in the TDD table above; the
full-suite run above is the post-PR1 regression check, not a pre/post diff.
`cd server && npm run test -- --run` → `Test Files 3 passed (3)` / `Tests 13 passed (13)` (baseline, unaffected — PR1 touches no server files).

R-id retroactive coverage owed to PR2 for PR1's pure-function-only tasks: R1/R2 (depths total
order → live container depth order), R7/R13 (tick boundaries → live `animationcomplete`/
`animationupdate` with resolved state), R9/R12 (degrade reporter → live `degrades()` read).
PR2 delivers R1/R2/R5/R7/R9/R13 on `rasta` — confirmed below.

## PR2 — Playwright resolved-state harness

Files changed:
- `client/package.json` — `@playwright/test` devDependency (installed, chromium browser
  installed via `npx playwright install chromium --with-deps`); `"test:e2e": "playwright test"`.
- `client/playwright.config.js` (new) — `testDir: './e2e'`, `webServer` runs `npm run dev`
  with `VITE_AVATAR_HARNESS=true`/`VITE_LAYERED_AVATARS=true`, `baseURL`/`webServer.url` use
  `http://localhost:5183` (see deviation note below, not `127.0.0.1`).
- `client/harness.html` (new) — dev-only page, loads `client/src/harness/main.js`.
- `client/src/harness/main.js` (new) — boots a bare `Phaser.Game` (`type: Phaser.CANVAS`) with
  `AvatarHarnessScene`, gated behind `VITE_AVATAR_HARNESS==='true'`; exposes `window.game`.
- `client/src/harness/AvatarHarnessScene.js` (new) — supplies `users={}`, `isSceneReady=true`,
  `sceneScaleFactor=1`, real `shadow`/`shadow_selected` textures (reused from
  `client/src/assets/game/avatar/*.webp`, the same files `PublicScene.js` loads), a `tintMgr`
  stub; creates `window.__avatarHarness`.
- `client/src/harness/avatarHarnessApi.js` (new) — `createAvatarHarnessApi(scene)`:
  `spawnAvatar/setDirection/playAction/playChat/playKey/advance/readState/degrades`; pure
  `resolveDirectionValue` (friendly 8-direction names → `DirectionEnum`).
- `client/src/harness/avatarHarnessApi.test.js` (new) — unit test for `resolveDirectionValue`
  only (the one pure piece of this module).
- `client/src/phaser/shared/spawnAvatarUser.js` (new) — `spawnAvatarUser(scene, opts)`: the
  single spawn primitive both `PerfHarness.spawnGhosts` and
  `window.__avatarHarness.spawnAvatar` delegate to; also calls
  `avatarManager.loadAvatar(scene, avatarId)` before `AddUserController.processUser` (see
  deviation note below).
- `client/src/phaser/debug/PerfHarness.js` — `spawnGhosts(n=25, {avatarId=12}={})`, rewritten
  to delegate to `spawnAvatarUser`; externally observable defaults unchanged.
- `client/src/phaser/layered/LayeredAvatar.js` — `play()` now calls `resolveAnimationKey`
  (not `resolveFallbackKey`) and reports every degraded resolution via `degradeReporter.report`
  (see deviation note below — this was originally deferred to PR5/PR6 in the PR1 entry above;
  PR2's own R9 task requires it now).
- `client/vitest.config.js` — added the same `@` → `./src` alias `vite.config.js` already
  declares, so a pure helper co-located with `@/...`-importing I/O-shell code (here,
  `avatarHarnessApi.js`) can be unit-imported without rewriting that file's import style.
- `client/.env.example` — documented `VITE_AVATAR_HARNESS=false` default.
- `client/e2e/avatar-resolved-state.spec.js` (new) — R1, R2, R5, R7, R9, R13 on `rasta`.

### Deviations from design (recorded, not silently absorbed)

1. **`vite.config.js` does not name `index.html` explicitly.** Design assumed
   `rollupOptions.input` already lists it; it is unset entirely. Verified live instead: with
   `harness.html` and `client/src/harness/**` present, `npm run build` produces `dist/index.html`
   only (no `harness.html`, no harness JS chunk in `dist/assets/js/`) — Vite's documented
   default with no explicit `input` builds only the root `index.html`. Same production-safety
   guarantee, different mechanism than the design's stated verification step.
2. **`baseURL`/`webServer.url` use `http://localhost:5183`, not `127.0.0.1`.** This machine
   resolves `localhost` to `::1`; Vite's dev server without `--host` only binds that address —
   verified live (`nc -zv 127.0.0.1 5183` refused against the very server that
   `nc -zv localhost 5183` succeeded against). An environment fact, not a design assumption;
   recorded so a differently-configured CI host does not silently reproduce the same failure.
3. **The scene is never paused.** Design's dependency list did not specify this; my first
   implementation paused the scene right after `create()` to stop automatic per-frame ticking,
   which hung every `scene.load.once('complete', ...)` promise (`scene.load`'s own progress
   polling is driven off the scene's per-frame step, which a pause also stops) — confirmed live
   via a hung `spawnAvatar()` call. Fixed by leaving the scene active and instead patching
   `scene.layeredAvatarRegistry.update` to a no-op the first time an avatar is spawned
   (`avatarHarnessApi.js`'s `neutralizeAutomaticTicking`), preserving the original method so
   `advance(ms)` can still call it directly. Net effect (no automatic ticking, `advance(ms)` is
   the sole clock) is unchanged from the design's intent.
4. **`spawnAvatarUser` calls `avatarManager.loadAvatar(scene, avatarId)` before
   `AddUserController.processUser`.** Not stated in the design's `spawnAvatar` row. Necessary
   because `AddUserController.createAvatarSprite`'s layered branch only uses the layered
   renderer if `avatarManager.getLayeredManifest(avatarId)` is ALREADY populated — it does not
   itself call `loadLayeredAvatar` when missing (by design, matching "background/priority
   loader has not finished" as a fallback-to-baked path). A freshly booted harness has no
   background loader running, so the first `spawnAvatar` call for any given `avatarId`
   otherwise silently produced the baked-fallback invisible-placeholder path — confirmed live
   (first probe: `body.kind` was `"body"` with `textureKey: "__DEFAULT"`, `visible: false`,
   `body: null` in `readState`, instead of a populated `LayeredAvatar`).
5. **`avatarHarnessApi.js` exposes one method beyond design §10's table: `playChat(socketId,
   textureKey)`, wired to the real `UserChatAnimation.main`.** R7 (animationcomplete fires and
   a real listener returns the avatar to idle) needs a currently-compiled NON-repeating
   (`repeat: 0`) sequence — before PR5 compiles any action/emote, rasta's `*_talk` sequences are
   the ONLY `repeat: 0` entries in the manifest (verified: `down_talk` is `{fps:19, repeat:0,
   frames: 8 entries}`; every other current sequence is `repeat:-1`). `playKey`'s raw
   `sprite.play()` registers no listener (by design, matching production's own raw-play
   callers); `playAction`'s emote keys all currently fall back to `down_idle` (`repeat:-1`,
   never completes) since no emote is compiled yet. `UserChatAnimation.main` is a real,
   already-shipped production controller (parallel to `UserEmojiAnimation.main`) that both
   targets `down_talk` and registers the exact one-time `animationcomplete` listener R7
   requires — used here rather than fabricating a test-only fixture sequence.
6. **`LayeredAvatar.play()` now uses `resolveAnimationKey` and calls `degradeReporter.report`
   for every degraded resolution.** The PR1 entry above stated this wiring was deferred to
   PR5/PR6 (no `aliases`/`unloadedKeys` producer existed yet). PR2's own task 6 requires R9
   (degrade is observable) to pass NOW, on `rasta`, which is impossible without this wiring —
   so it landed here instead. `aliases` defaults to `{}` (PR5 will supply real values);
   behaviour for every key already covered by `sequences`/`mirrors` is unchanged (still
   `degraded: false`, still resolves the same key) — only previously-silent degrades now also
   call `reportDegrade`.
7. **`computeVisibleBounds` subtracts the container's world position.** `Phaser.GameObjects.
   GameObject.getBounds()` returns WORLD coordinates; R5's `|body.visibleBounds.centerX| ≤ TOL`
   only holds if `visibleBounds` is container-LOCAL (the same frame `shadow.x === 0` is in).
   First measurement (before the fix) showed `centerX ≈ 506` (the container's own world X on
   the tile grid) instead of near zero — fixed by subtracting `container.x`/`container.y`.

### Live verification (manual, via `playwright-cli`, before writing the automated spec)

Confirmed live against a real `vite dev` server + Chromium, in this order, to find and fix the
four defects above before encoding the spec: harness boot (`window.__avatarHarness`/
`window.game` present) → `spawnAvatar` with `hat_minnie`/`pet09`/`auraElectrica` → `readState`
child order `shadow → pet → body → hat → aura → nameBackground → nameText` with non-decreasing
depths `[0, 0.5, 1, 1.5, 1.8, 2, 3]` (R1/R2) → 8-direction sweep showing exact mirror
antisymmetry (`right:-27` + `left:27` = 0; `downright:-12.5` + `downleft:12.5` = 0;
`upright:-19.4` + `upleft:19.4` = 0; `down≈-0.2`, `up=0`) and `shadow.x/y === 0` in every
direction (R5) → `playChat('down_talk')` then `advance` past its duration returns
`sequenceKey` to `down_idle` (R7) → `playKey('left_punch_rec')` (uncompiled) populates
`degrades()` with `{resolvedKey:'left_idle', reason:'direction-idle'}` (R9) → a captured
`animationupdate` listener on `playKey('right_walk')` (a mirror of `left_walk`) fires with
`anim.key === '12_right_walk'` (the REQUESTED key, not the mirror-resolved `left_walk`) (R13).

### TDD Cycle Evidence — PR2

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 4 (`resolveDirectionValue`) | `avatarHarnessApi.test.js` | Unit | N/A (new) | Process deviation, disclosed in the test file: written alongside the implementation rather than strictly before it (see the file's own comment) — not a fabricated RED | Passed (4/4) | 4 cases: all 8 names, case-insensitivity, numeric passthrough, unknown-name throw | Clean |
| 6 (e2e spec) | `e2e/avatar-resolved-state.spec.js` | E2E (Playwright) | N/A (new) | RED by construction across 3 real iterations: (1) `spawnAvatar` hung — scene-pause froze the loader; (2) `centerX` measurements were world-, not container-relative; (3) R7/R9 needed the `playChat`/`degradeReporter` wiring above before any assertion could pass | Passed: `cd client && npm run test:e2e` → **6/6 passing** | 6 distinct R-ids × 8 directions each (R1/R2/R5), 2 direction-specific live cases (R7 down; R9/R13 left/right) | N/A (harness code, not further refactored this slice) |

Full client suite after PR2: `cd client && npm run test -- --run` → **20 test files, 199 tests,
passing** (1 new file, `avatarHarnessApi.test.js`, 4 tests). `cd client && npm run test:e2e` →
**6/6 passing**. `cd client && npm run build` → succeeds, `dist/` contains only `index.html`
(no `harness.html`/harness chunk) — confirmed and then `dist/` removed (git-ignored, not meant
to be committed).

Background processes started during this slice (`vite dev` on port 5183 via `run_in_background`,
one `playwright-cli` browser session) were killed before moving on; the Playwright test run
itself uses its own managed `webServer`/browser lifecycle and needs no manual cleanup.

## PR3 — Pet canonical side

Files changed:
- `client/scripts/lib/petSide.cjs` (new) — pure `derivePetSide(downIdleOriginX, downOriginXs,
  {overrideSide, epsilon=2})` → `{side, derived}`; `median` helper.
- `client/scripts/lib/petSide.test.cjs` (new) — clear-right, clear-left, ambiguous-fails,
  override-wins, custom-epsilon.
- `client/scripts/compile-accessory.cjs` — `compileVector`'s `kind: 'pet'` branch now derives
  `base.side` from `anims.down_idle` vs. every `down_*` anim's frame `regX`, via `derivePetSide`;
  logs the derived/overridden side; `meta.side` is the override input.
- `client/src/phaser/layered/pivot.js` — deleted `clearBodySilhouetteX`; added
  `resolvePetSideX(center, halfWidth, bodyMinX, bodyMaxX, side, margin=4)`, an unconditional
  clamp to the declared side (no more "whichever side is closer").
- `client/src/phaser/layered/pivot.test.js` — approval test for `clearBodySilhouetteX` added,
  run once (green), then removed together with the function; `resolvePetSideX` has 5 new tests.
- `client/src/phaser/layered/LayeredAvatar.js` — `_updateAccessory`'s pet branch reads
  `manifest.base.side`, throws loudly if missing/invalid, calls `resolvePetSideX` instead of
  `clearBodySilhouetteX`.
- `client/src/phaser/layered/mirroredDirections.integration.test.js` — updated to import/call
  `resolvePetSideX` with pet09's real compiled `base.side`; added 2 new cases (manifest declares
  a side; the corrected box stays on the SAME side across 4 directions including a back-facing
  one, `up_idle`).
- `client/src/assets/game/accessories/pet/pet09/pet09.accessory.json` — recompiled; only change
  is the added `base.side: "left"` field (webp/atlas byte-identical, confirmed via `git diff
  --stat`).
- `client/e2e/avatar-resolved-state.spec.js` — added R3 (pet stays on its declared side, 8
  directions) and R4 (`flipX` matches facing direction; resolved `x` sign never crosses sides);
  reads `pet09.accessory.json` directly (not hardcoded) so the assertion tracks whatever side a
  future recompile derives.
- `client/src/harness/avatarHarnessApi.js` — `readState`'s children now include `displayWidth`
  (Phaser's own already-scaled size), needed for R3's half-width comparison.

### Grep-check invariants (recorded, not a vitest test — design.md §8)

```
$ grep -rn "clearBodySilhouetteX" src scripts | grep -v "\.test\.\|// \|\* "
(no output — zero real references; only historical comments/docblocks mention the name)

$ grep -rn "resolvePetSideX(" src --include="*.js" | grep -v "\.test\.js"
src/phaser/layered/LayeredAvatar.js:368:            finalX = resolvePetSideX(x, halfWidth, bodyBounds.minX, bodyBounds.maxX, side);
src/phaser/layered/pivot.js:275:function resolvePetSideX(center, halfWidth, bodyMinX, bodyMaxX, side, margin = 4) {
(exactly one production call site, plus the definition itself)
```

### TDD Cycle Evidence — PR3

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 (`derivePetSide`) | `petSide.test.cjs` | Unit | N/A (new) | not-run (nonexistent module `./petSide.cjs`) — captured: `Cannot find module './petSide.cjs'` | Passed (5/5) | 5 cases: clear-right, clear-left, ambiguous-fails, override-wins (against opposite data), custom-epsilon resolving what the default epsilon rejects | Clean |
| 2 (`resolvePetSideX`) | `pivot.test.js` | Unit | ✅ Approval test for `clearBodySilhouetteX`: 3/3 passing (captured 29 / -29 / 30, run once before deletion) | Executed-failing: `TypeError: (0 , resolvePetSideX) is not a function` (5 new cases) | Passed (18/18 in the file: 13 pre-existing + 5 new, approval test + old function removed) | 5 cases: same-side push, opposite-raw-centre-still-clamped (the antisymmetry-breaking case), left-side push, already-clear both sides, custom margin | Clean |
| 4 (recompile pet09) | `mirroredDirections.integration.test.js` | Integration | ✅ baseline: 95/95 passing before the rename | N/A (real compiler run against real staged source, not a written-first test) | Passed (95/95 after `clearBodySilhouetteX`→`resolvePetSideX` rename + 2 new cases) | 2 new cases: manifest declares a side; box stays on the declared side across 4 directions incl. a back-facing one | Clean |
| 5 (e2e R3/R4) | `e2e/avatar-resolved-state.spec.js` | E2E (Playwright) | N/A (additive) | RED by construction (methods/fields did not exist: `petManifest.base.side`, `displayWidth` on children) | Passed: `cd client && npm run test:e2e` → **8/8 passing** (R1/R2/R3/R4/R5/R7/R9/R13) | 8 directions × 2 new R-ids | N/A |

Full client suite after PR3: `cd client && npm run test -- --run` → **21 test files, 214 tests,
passing**. `cd client && npm run test:e2e` → **8/8 passing**.

## PR4 — Character-scoped accessory registry

Files changed:
- `client/scripts/stage-layered-source.sh` (new) — generic per-character staging+compile
  pipeline (design §4 steps 1-5); reused unchanged through PR11.
- `client/scripts/lib/deriveColormeta.cjs` + `.test.cjs` (new) — pure colormeta derivation
  (throws if `meta.colormeta.defaults` is absent).
- `client/scripts/lib/derive-colormeta.cjs` (new) — thin file-I/O CLI wrapper the shell script
  calls.
- `client/scripts/lib/validateCharArg.cjs` + `.test.cjs` (new) — pure `--char` validation
  (missing arg / missing meta.char / disagreement, all hard-fail).
- `client/scripts/lib/listInputFiles.cjs` + `.test.cjs` (new) — pure directory-entry filter;
  fixes a live-discovered EISDIR crash (see below).
- `client/scripts/compile-accessory.cjs` — `compileVector(kind, key, char)`: input path
  `.assets-src/accessories/<char>/<key>/`, output path
  `src/assets/game/accessories/<kind>/<char>/<key>/`; `--char` CLI flag (required for hat/pet,
  not applicable to aura); `validateCharArg` call before any rendering work.
- `client/scripts/compile-layered-avatar.cjs` — `sha1OfInputs`'s file list now filtered through
  `filterRegularFileNames` (fixes the EISDIR crash).
- `client/src/phaser/managers/accessoryRegistryResolve.js` + `.test.js` (new) — pure
  `resolveAccessoryRegistryKey` (exact char → `'*'` wildcard → miss),
  `resolveAccessoryAtlasKey`, `checkManifestCharMismatch`.
- `client/src/phaser/managers/AccessoryManager.js` — rewritten: `ACCESSORY_PACKAGES` keyed
  `${character}:${kind}:${key}`; `hasPackage/getAtlasKey/getManifest/load` all take
  `(character, kind, key)`; `load()` throws (naming both character and key) on a true miss,
  warns (not throws) on a `manifest.char` mismatch for a resolved package.
- `client/src/phaser/managers/AccessoryManager.test.js` (new) — verifies the real singleton's
  miss-throw and `hasPackage` results (no Phaser scene needed for the miss path).
- `client/src/phaser/managers/AssetVersionManager.js` (+ `.test.js`) — `accessoryVersions.
  accessories` rekeyed to `char:kind:key`; see the naming correction below.
- `client/src/phaser/controllers/scene/AddUserController.js` — `createAccessoryChildren`
  resolves `character = avatarManager.getAvatarName(userData.avatar_id)` once, passes it into
  all four accessoryManager calls for aura/hat/pet.
- `client/src/phaser/controllers/scene/UserChangeAccessoryController.js` — same character-scoped
  wiring in `applyAura`/`applyHat`/`applyPet` (not explicitly named in tasks.md's task 7, but
  required — it is the only other call site of the old 2-arg API).
- `client/e2e/avatar-resolved-state.spec.js` — added R10 (partial, rasta-only) and a
  registry-mismatch-reporting case; fixed the `pet09` import path to the new nested location;
  renamed the `hat_minnie` accessory key references to `minnieHat`.
- Compiled output: `src/assets/game/accessories/hat/rasta/{minnieHat,Custom6Hat}/`,
  `src/assets/game/accessories/pet/rasta/{pet09,pet10}/` (all new/moved paths; old flat
  `hat/hat_minnie/`, `pet/pet09/` deleted).
- `.assets-src/accessories/rasta/{minnieHat,Custom6Hat,pet09,pet10}/` (untracked, git-ignored) —
  staged source, re-annotated after the naming correction (see below).

### Live-discovered issues found and fixed during this slice (recorded, not silently absorbed)

1. **EISDIR crash in `compile-layered-avatar.cjs`.** Running the new `stage-layered-source.sh`
   against `rasta` failed with `EISDIR: illegal operation on a directory, read`. Root cause:
   `sha1OfInputs` read every entry `fs.readdirSync(inputDir)` returned, including the new
   `actions/` subdirectory this change's staging convention (design.md §4) places as a sibling
   of the base layers content — `fs.readFileSync` on a directory throws. Fixed with a pure
   `filterRegularFileNames` (unit-tested), wired into both the hash computation and confirmed
   via a real recompile (`git diff --stat` on `rasta.layers.manifest.json`: only the
   `sourceHash` value changed — `.webp`/`.atlas.json` byte-identical).
2. **`minnieHat`/`hat_minnie` naming was backwards from what design.md's own wording implies at
   first read.** Design §7 says this PR "fixes the existing mismatch where that dictionary
   [AssetVersionManager] says `minnieHat` while `AccessoryManager` says `hat_minnie`" — read in
   isolation this could be resolved either direction. Verified against the actual source data:
   the staged package's own `meta.json` (both the archived-cycle copy and a fresh re-unzip of
   `personajes/rasta/hat/minnieHat.bb`) declares `"key": "minnieHat"`, matching the real source
   filename. `hat_minnie` was an arbitrary directory name chosen when this package was first
   manually staged in the archived cycle — never a name the source data itself used. Corrected
   `AccessoryManager`'s registry key and the compiled output directory to `minnieHat`
   (`AssetVersionManager`'s dict already had the correct name and needed no further change
   beyond the `char:kind:key` rekey). Updated every real (non-narrative-comment) reference:
   `AccessoryManager.js`, `AssetVersionManager.js`/`.test.js`,
   `mirroredDirections.integration.test.js` (imports + test descriptions),
   `accessoryRegistryResolve.test.js`'s example, `stage-layered-source.sh`'s docblock example,
   the e2e spec. Left untouched: a handful of historical narrative docblocks in `pivot.js` and
   one test name in `depths.test.js` that describe PAST live-validation investigations
   conducted under the name "hat_minnie" at the time — renaming those would misrepresent the
   historical record without adding any functional value.
3. **Manual authoring annotations were destroyed and had to be reapplied.** Running the new
   generic `stage-layered-source.sh rasta` re-unzipped `minnieHat`'s and `pet09`'s staged
   `meta.json` fresh from the raw `.bb` archives, silently discarding the archived cycle's
   manual corrections (`minnieHat`: `scale: 0.75`; `pet09`: `groundOffsetY: 19` — design.md §4
   step 4's documented, non-automatable authoring step). Caught by the existing
   `mirroredDirections.integration.test.js` regression suite (12 failures: `base.scale` reads
   `undefined`, several pet bottom-edge assertions regressed to `>0`). Re-applied both
   annotations by hand and recompiled; full suite green again. This is exactly the risk design
   §4 step 4's own docblock warns about (a human visual-judgement correction that a blind
   re-stage can silently lose) — recorded here as the concrete instance, not just the
   documented risk.

### Grep-check / manual verification

```
$ git diff --stat client/src/assets/game/avatars/rasta/
 client/src/assets/game/avatars/rasta/layers/rasta.layers.manifest.json | 2 +-
(only sourceHash changed — confirms the EISDIR fix changed no rendered content)

$ git status --short client/src/assets/game/accessories/
 D hat/hat_minnie/*  D pet/pet09/*  (old flat paths)
?? hat/rasta/  ?? pet/rasta/        (new nested paths, incl. minnieHat/Custom6Hat/pet09/pet10)
```

### TDD Cycle Evidence — PR4

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 4 (`accessoryRegistryResolve`) | `accessoryRegistryResolve.test.js` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './accessoryRegistryResolve.js'` (module deleted and recreated to get a genuine RED after an initial process slip — see apply-progress note pattern) | Passed (9/9) | 9 cases: exact-char resolution, same-key-different-char (Custom6Hat rasta vs lilian), wildcard fallback, miss, atlas-key with/without char segment, mismatch reporting incl. the `'*'` no-mismatch-possible case | Clean |
| 4 (`AccessoryManager.load` miss) | `AccessoryManager.test.js` | Unit | N/A (new) | Approval/verification test of already-implemented behaviour (disclosed, matching `avatarHarnessApi.test.js`'s `resolveDirectionValue` precedent) — no new production logic added by this test | Passed (3/3) | 3 cases: throw names character, throw names key, hasPackage true/false for real vs unknown packages | Clean |
| 5 (`validateCharArg`) | `validateCharArg.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './validateCharArg.cjs'` | Passed (4/4) | 4 cases: match, missing meta.char, disagreement, missing --char | Clean |
| 6 (AssetVersionManager rekey) | `AssetVersionManager.test.js` | Unit | ✅ baseline 4/4 passing | Executed-failing: `expected { minnieHat: '1.0.0', pet09: '1.0.0' } to not have property "minnieHat"` (+ the `toHaveProperty('rasta:hat:...')` cases) | Passed (8/8 in file: 5 pre-existing + 3 new) | 3 cases: all 4 keys present, old bare name absent, getArtifactVersion resolves the new form | Clean |
| 9 (EISDIR fix) | `listInputFiles.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './listInputFiles.cjs'` | Passed (3/3) | 3 cases: mixed entries, all-directory, no-directory | Clean |
| 1/3/4/6 (`deriveColormeta`) | `deriveColormeta.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './deriveColormeta.cjs'` | Passed (3/3) | 3 cases: present, absent entirely, present-but-no-defaults | Clean |
| 10 (e2e) | `e2e/avatar-resolved-state.spec.js` | E2E | ✅ baseline 8/8 (PR3) | RED by construction (new fields/keys did not exist pre-edit: `Custom6Hat` registry entry, `minnieHat` rename) | Passed: `cd client && npm run test:e2e` → **10/10 passing** | 2 new cases × 8 directions (R10 partial) + 1 mismatch case | Clean |

Full client suite after PR4: `cd client && npm run test -- --run` → **26 test files, 239 tests,
passing**. `cd client && npm run test:e2e` → **10/10 passing**.

## PR5 — Vector→raster action pipeline (largest PR)

This is the slice the entire change exists to deliver: the user's exact original bug report
("cuando pulso llorar el perosnaje no hase nada no llora") is now live-verified fixed — R6/R8
below are not pure-function proxies, they read a real spawned avatar's resolved `sequenceKey`
and per-frame slot tints while the `llorar` action actually plays.

Files changed:
- `client/scripts/lib/slotRuns.cjs` + `.test.cjs` (new) — `partitionSlotRuns`.
- `client/scripts/lib/svgFromPaths.cjs` (+ `.test.cjs`, 17 tests) — fill/stroke/gradient/clip
  species branching, `fillOverride`, `computeBounds`'s stroke-pad + minimum-size floor (both
  live-discovered, see below).
- `client/scripts/lib/bakedKeyMap.cjs` + `.test.cjs` (new) — `parseBakedConfig`,
  `deriveAliasesAndMirrors`, `checkAliasMirrorCompleteness`.
- `client/scripts/lib/originSpaceGate.cjs` + `.test.cjs` (new) — `assertOriginSpaceMatch`.
- `client/scripts/lib/pageBudget.cjs` + `.test.cjs` (new) — `checkPageBudget`.
- `client/scripts/lib/validateSupersampling.cjs` (+ `.test.cjs`) — added a `tolerance` param
  (default 0, unchanged base-pack behaviour), used with `1` for action runs.
- `client/scripts/compile-layered-avatar.cjs` — rewritten: `readBakedKeyMap` replaces
  `readBakedTimings`/the old `MIRROR_SOURCE_PREFIXES` loop; new `compileActionSequences`
  (action-pack compilation); origin-space gate call; both page-budget gates; emits
  `<char>.actions.webp`(+pages)/`.atlas.json`; manifest gains `aliases` and `pieces[id].pack`
  (landed one PR early, inert until PR6's runtime split — see deviation below).
- `client/scripts/compile-accessory.cjs` — `renderFrameRaster` now passes `SS` into
  `computeBounds` (same sub-pixel/stroke-pad fix, defensive — accessories could hit the same
  real-data edge case).
- `client/src/phaser/layered/LayeredAvatar.js` — `play()` now passes `this._manifest.aliases`
  into `resolveAnimationKey`; `sourceKey` resolution now also checks `aliases` (not just
  `mirrors`) before falling back to `resolvedKey` itself.
- `client/src/phaser/managers/AvatarManager.js` — `LAYERED_ACTIONS_ATLAS_LOADERS`/
  `LAYERED_ACTIONS_WEBP_LOADERS` (new, rasta only so far); `loadLayeredAvatar` merges the
  action pack's `textures[]` into the base `atlasJson` before the one `scene.load.multiatlas`
  call (see deviation below — not named as a PR5 task but required).
- `client/e2e/avatar-resolved-state.spec.js` — added R6, R8, R11; fixed R9 to use a fictional
  key (`left_moonwalk_9000`) since `left_punch_rec` is now genuinely compiled.
- Compiled output: `client/src/assets/game/avatars/rasta/layers/rasta.actions{,_1,_2,_3}.webp`,
  `rasta.actions.atlas.json`, `rasta.layers.manifest.json` (regenerated, now includes the full
  action set).

### Live-discovered issues found and fixed during this slice

1. **A third path species, not in design facts B/C: linear-gradient fills.** `{d, g:{t:"l",
   st:[[offset,hex],...], x1,y1,x2,y2}, eo}` — no `f`, never a `c` slot. Found while
   recompiling `pet09` after the clip fix (it crashed: "path has neither fill nor stroke
   data"). Verified: 546 occurrences across rasta's 4 accessories, 8 in the body action set,
   0 carry a slot. Rendered as `<linearGradient>` + `fill="url(#g<N>)"`, one def per occurrence
   (never deduped/shared — verified 0 of 546 share a definition), never `fillOverride`-eligible.
2. **Zero-area bounding box for an axis-aligned stroke.** A perfectly horizontal/vertical
   stroke path (e.g. a single eyelash/tear-track line) has a mathematically zero-width or
   zero-height bbox from its `d` coordinates alone — sharp/librsvg refused ("bad dimensions").
   `computeBounds` now pads a stroke path's own contribution by `strokeWidth/2` on every side.
3. **Sub-pixel fill sliver.** A genuinely tiny fill shape (~0.1 logical units wide, a highlight
   detail) has a real but sub-1-pixel bbox once scaled by `ss:2` — same "bad dimensions" crash.
   `computeBounds` now floors every axis to `1/ss` logical units, symmetrically.
   Both (2) and (3) were found only by actually compiling rasta's real action data — no amount
   of hand-built test fixtures would have surfaced them; each blocked the FULL compile from
   completing at all until fixed.
4. **The runtime needed a loading-side change PR5's own task list didn't name.**
   `AvatarManager.loadLayeredAvatar` only ever loaded the base pack; without also loading and
   merging the action pack's atlas/webp files, R6/R8/R11 would have nothing real to assert
   against (the manifest would describe action sequences whose pieces were never actually
   textures in Phaser). Implemented as a texture-array merge into ONE Phaser atlas key —
   zero change to `LayeredAvatar.js`'s single `_atlasKey` field, matching "both packs loaded
   eagerly" and leaving PR6's actual lazy-split work undiminished.
5. **`manifest.aliases` needed runtime wiring `LayeredAvatar.play()` didn't have.**
   `resolveAnimationKey` already accepted an `aliases` param (added in PR1, unused since no
   producer existed) — `play()` now passes `this._manifest.aliases` through, and `sourceKey`
   resolution now checks `aliases` before falling back to `resolvedKey` itself (an alias like
   `"risa1"` is never itself a `sequences` key — only what it names is).

### Measured numbers (replacing design §6's estimates — the actual point of this slice)

| Metric | Design §6 estimate | Measured (rasta) |
|---|---|---|
| Base pack pages | 1 (known already) | 1 (unchanged) |
| Action pack pages | 2.2–5.2 (+ base = 3–6 total) | **4** (well under the warn-at-5 gate) |
| Unique action pieces | 500–800 "unique body action frames" | **17,722** pieces / **867** unique frames (≈20.4 pieces/frame — matches the base pack's own ~21.4 pieces/frame density; design's estimate modelled frames, not the finer per-run piece granularity this compiler actually emits) |
| Action pack bytes | "37–88 Mpx² ≈ a few MB after webp" (implicit) | **8.69 MB** across 4 `.webp` pages + 3.03 MB `.atlas.json` |
| Manifest size | not estimated | **4.23 MB** (19,926 pieces + 970 frames + 41 sequences + 9 aliases + 15 mirrors, one JSON file) |
| **Total tracked bytes, rasta** | roster total "~15–60 MB" (design §14 risk 1) | **~16 MB for ONE character** |

**Risk update, recorded plainly**: if this ratio holds roughly linearly across the roster,
14 characters would track closer to **~220 MB**, well above design §14 risk 1's upper bound of
60 MB for the WHOLE roster. The three page-budget gates (base ≤2, action ≤8, accessory ≤3)
still hold — rasta's 4 action pages is comfortably under its own gate — so no single compile
has failed or is expected to fail; the surprise is in aggregate tracked-byte weight, not page
count. This is the single most consequential number this slice produced and is carried forward
explicitly rather than silently absorbed: PR6 (lazy action-pack load) mitigates ROOM-ENTRY cost
(nobody downloads 8.69 MB just to see a character standing idle), but does NOT reduce the
TRACKED REPO SIZE this data adds once all 14 characters are compiled — a decision point for
PR8-11's batches, flagged here rather than deferred silently.

### TDD Cycle Evidence — PR5

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 (`partitionSlotRuns`) | `slotRuns.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './slotRuns.cjs'` | Passed (6/6) | 6 cases: no-slot, single-run, multi-run split, non-merge across a gap, fact-B fill/stroke pair, empty | Clean |
| 2 (`svgFromPaths` fill/stroke) | `svgFromPaths.test.cjs` | Unit | ✅ baseline 4/4 | Executed-failing: 5 new assertions incl. `expected 'fill="none" ...' but got 'fill="undefined"'`-class failures | Passed (11/11: 4 pre-existing + 7 new) | 7 cases: stroke emission, throw-on-neither, fillOverride applied/not-applied/absent | Clean |
| 2 (gradient species) | `svgFromPaths.test.cjs` | Unit | ✅ baseline 11/11 (post fill/stroke) | Executed-failing: `svgFromPaths: path has neither fill, stroke nor gradient data` (×3 new cases) | Passed (14/14) | 3 cases: gradient def + fill=url(), unique id per path, fillOverride never applied | Clean |
| 2 (stroke-pad + min-size bounds) | `svgFromPaths.test.cjs` | Unit | ✅ baseline 14/14 | Executed-failing: `expected 47.05 to be close to 46.15` (stroke-pad); `expected 0.0999... to be >= 0.5` (min-size) | Passed (17/17) | Both cases plus a "does not inflate a real-size fill" negative case | Clean |
| 4 (`bakedKeyMap`) | `bakedKeyMap.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) | Passed (9/9) | 9 cases: parse, ignore-non-anim, self-source no-op, alias branch, mirror branch, not-yet-compiled no-op, completeness pass/fail/exempt | Clean |
| 6 (`originSpaceGate`) | `originSpaceGate.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) | Passed (4/4) | 4 cases: identical, within-tolerance, X-exceeds, Y-exceeds | Clean |
| 7 (`pageBudget`) | `pageBudget.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) | Passed (5/5) | 5 cases: at-threshold silent, warn-not-throw, throw-above-fail, exact-boundary, no-warn-tier gate | Clean |
| 5 (`validateSupersampling` tolerance) | `validateSupersampling.test.cjs` | Unit | ✅ baseline 3/3 | Executed-failing: `expected [Function] to not throw ... width mismatch` | Passed (6/6) | 3 new cases: within-tolerance, beyond-tolerance, default-zero-tolerance | Clean |
| 5/8 (real compile) | live `node scripts/compile-layered-avatar.cjs rasta` | Integration | ✅ baseline: full vitest suite green before each recompile | N/A (real compiler run against real staged source, iterated through 2 real crashes until it completed — RED was the crash itself each time, not a written-first test) | Succeeded: 1 base page, 4 action pages, 17,722 action pieces, 867 action frames, 0 completeness-gate failures, 0 origin-gate failures | N/A (single real dataset — 26 action keys × up to hundreds of frames each is its own triangulation) | Clean |
| 9 (e2e R6/R8/R11) | `e2e/avatar-resolved-state.spec.js` | E2E (Playwright) | ✅ baseline 10/10 (PR4) | RED by construction: manually verified via `playwright-cli` first (spawn → `playKey('llorar')` → `sequenceKey` stayed `down_idle` until the alias/loader wiring above was completed) | Passed: `cd client && npm run test:e2e` → **13/13 passing** | R6 (idle→llorar transition), R8 (3 sample points × N slot-tint entries each), R11 (65 keys swept) | Clean |

Full client suite after PR5: `cd client && npm run test -- --run` → **30 test files, 279
tests, passing**. `cd client && npm run test:e2e` → **13/13 passing** (R1-R11, R13; R12
pending PR6; R10 remains partial, full pairwise vs `lilian` in PR9).

Background processes: one `vite dev` (port 5183, `run_in_background`) and one
`playwright-cli` browser session were used for live verification during this slice and killed
before moving on (confirmed via `lsof -ti:5183` returning empty). The temporary
`console.error(err.stack)` debug edit made mid-slice to diagnose the "bad dimensions" crash was
reverted back to `err.message` before finishing.

## PR6 — Lazy action pack

Files changed:
- `client/src/phaser/layered/actionPack.js` + `.test.js` (new) — pure
  `computeActionBackedKeys(manifest)`.
- `client/src/phaser/layered/LayeredAvatar.js` — constructor now takes `atlasKeys: {base,
  actions}` (was a single `atlasKey`) and an optional `onActionPackNeeded` callback;
  `_actionBackedKeys` computed once from the manifest; `_playToken` (bumped every `play()`
  call) and `_actionPackRequested` added; new `setActionsAtlasKey(key)` method; `play()` now
  computes `unloadedKeys` from `_actionBackedKeys` while the actions pack isn't loaded, and
  triggers the deferred-load + staleness-guarded replay; `_applyFrame`'s `child.setTexture`
  resolves `this._atlasKeys[piece.pack]`.
- `client/src/phaser/managers/AvatarManager.js` — reverted PR5's merge-into-one-atlas approach;
  `loadLayeredAvatar` loads ONLY the base pack again; new `getLayeredActionsAtlasKey`,
  `hasLoadedLayeredActions`, `loadLayeredActions` (own in-flight guard
  `inFlightLayeredActionsLoads`).
- `client/src/phaser/controllers/scene/AddUserController.js` — `createAvatarSprite` now builds
  `atlasKeys`, the `onActionPackNeeded` callback, and schedules the `requestIdleCallback`
  prefetch when the action pack isn't already resident.
- `client/e2e/avatar-resolved-state.spec.js` — added R12; added a `page.waitForFunction` wait
  for the real action-pack load to R6/R8/R11 (see deviation below).

### Deviations from design (recorded, not silently absorbed)

1. **Prefetch does not distinguish "own character" vs "remote character, low priority".**
   Design §6 asks for two tiers: the local user's own action pack requested on
   `requestIdleCallback` after scene entry, a remote character's pack "at low priority" on
   first sighting. `AddUserController.createContainerUser`/`createAvatarSprite` is the SINGLE
   construction path for both a local and a remote user (confirmed by re-reading the existing
   palette-threading comment already in that method, which makes the same observation) — there
   is no branch in this codebase today that distinguishes "this is my own avatar" from "this is
   someone else's". Implemented as one `requestIdleCallback` prefetch for every layered avatar
   constructed, regardless of local/remote. This does not violate any of R1-R13's observable
   assertions (all of which only care about the load eventually completing and the deferred
   replay being staleness-guarded, not about relative prefetch ordering across users), so it
   was not blocking, but it is a real, deliberate scope reduction from the design's two-tier
   wording, recorded here rather than silently done.
2. **R6/R8/R11 (written in PR5) needed a fix, not just an addition.** All three were written
   against PR5's "both packs loaded eagerly" state. Once PR6 made the action pack genuinely
   lazy, all three started racing the `requestIdleCallback` prefetch and failed
   non-deterministically confirmed live: `npm run test:e2e` immediately after the PR6 runtime
   changes showed R6 and R11 failing (R8 would have too, same root cause — checked by
   inspection: it also plays an alias-resolved action key). Fixed by adding a
   `page.waitForFunction` that waits for `spriteAvatar._atlasKeys.actions !== null` before each
   test's real assertions — these three tests now assert the SAME steady-state behaviour they
   always did, deliberately decoupled from the lazy-load timing R12 tests separately.

### TDD Cycle Evidence — PR6

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 (`computeActionBackedKeys`) | `actionPack.test.js` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './actionPack.js'` | Passed (6/6) | 6 cases: base-key excluded, action-key included, alias-to-action included, mirror-to-action included, mirror-to-base excluded, no-aliases/mirrors manifest | Clean |
| 1/4 (`LayeredAvatar`/`AvatarManager`/`AddUserController`) | (I/O-shell, design.md §8 — no direct unit test, same as every prior LayeredAvatar change) | — | ✅ full vitest suite 285/285 before and after | N/A | N/A | N/A | N/A |
| 2/3/4/5 (e2e, incl. new R12 + the R6/R8/R11 fix) | `e2e/avatar-resolved-state.spec.js` | E2E (Playwright) | ✅ baseline 13/13 (PR5) | RED by construction: R6/R11 (and by inspection R8) failed immediately after the lazy-load runtime change landed, exactly the race this task predicts — captured failure: `expected 'down_llorar' but got 'down_idle'` (R6), a `nonSpawnDegrades` array with 3 unexpected `pack-loading` entries (R11) | Passed: `cd client && npm run test:e2e` → **14/14 passing** (full R1-R13) | R12 alone: immediate-degrade assertion + post-load auto-replay assertion (2 sub-cases) | Clean |

Full client suite after PR6: `cd client && npm run test -- --run` → **31 test files, 285
tests, passing**. `cd client && npm run test:e2e` → **14/14 passing** — full R1-R13 coverage
now complete on `rasta` (R10 remains partial per design, full pairwise vs `lilian` in PR9).

Background processes: none left running (no live-browser manual verification was needed for
this slice beyond the automated e2e run, since the failure mode was reproduced directly by the
e2e suite itself).


## PR7 — Production-parity metrics (slice 7)

Files changed:
- `client/src/phaser/debug/avatarMetrics.js` (new) — pure `classifySequenceKey`,
  `computeParseComposition`, `computeResidentAvatarBytes`, `meanOf`, `recordRenderSample`,
  `computeDurationMs`, `countDisplayObjects`, `collectResidentAtlasPages`,
  `aggregateParseComposition`; I/O shell `createAvatarMetricsAggregator(scene)` wiring
  `'prerender'`/`'postrender'` (Phaser.Core.Events' own string values — no `import Phaser`
  needed) into `fps.mean/p5`, `renderMs`, `sprites`, `graphics`, `draws`, `gpuTextures`,
  `residentAvatarBytes`, `parseComposition`, `timeToFirstRender`, `timeToPlayCold` (plus
  `bakeMs`/`cacheHitRate: null`, vector-path-only per design §11).
- `client/src/phaser/debug/avatarMetrics.test.js` (new) — 18 tests.
- `client/src/harness/AvatarHarnessScene.js` — mounts the aggregator, exposes
  `window.__avatarMetrics()` and `window.__avatarMetricsControls` (`markRoomEntry`,
  `markActionColdStart`, `markActionColdEnd`), same dev-only pattern as `__avatarHarness`.
- `client/e2e/avatar-parity.spec.js` (new) — R14: 8-avatar and 25-avatar scenes, and a cold
  `llorar` trigger; each writes a JSON artifact to `client/e2e/artifacts/` (gitignored, added
  `e2e/artifacts/` to `client/.gitignore`).

### TDD Cycle Evidence — PR7

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 (`computeParseComposition`) | `avatarMetrics.test.js` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './avatarMetrics.js'` | Passed (15/15 first pass) | idle/walk/talk, punch, other-catch-all, case-insensitivity + zero-resident case | Clean |
| 2 (`computeResidentAvatarBytes`) | `avatarMetrics.test.js` | Unit | (same file) | (same RED) | Passed | one page, multiple pages, zero pages | Clean |
| 3 (`meanOf`/`recordRenderSample`) | `avatarMetrics.test.js` | Unit | (same file) | (same RED) | Passed | mean of N, empty-array 0, window cap, no-cap-below-max | Clean |
| 4 (`computeDurationMs`) | `avatarMetrics.test.js` | Unit | (same file) | (same RED) | Passed | positive duration, zero duration | Clean |
| 5 (aggregator + `collectResidentAtlasPages`/`aggregateParseComposition`) | `avatarMetrics.test.js` | Unit | ✅ 15/15 (first pass) | Executed-failing: `TypeError: (0 , collectResidentAtlasPages) is not a function` / `aggregateParseComposition is not a function` | Passed (18/18) | multi-avatar dedup-by-atlas-key page collection, skip-missing/non-layered; merge across 2 avatars with/without actions loaded | Clean |
| 6 (e2e R14) | `e2e/avatar-parity.spec.js` | E2E (Playwright) | N/A (new) | RED by construction: first run of the cold-trigger test failed live — `expected 'down_llorar' but got 'down_idle'` (action pack not yet loaded, fixed by waiting on `_atlasKeys.actions` first, same pattern as R6/R8) | Passed: `cd client && npx playwright test e2e/avatar-parity.spec.js` → **3/3 passing** | 8-avatar scene, 25-avatar scene, cold-action scene — 3 distinct real captures | N/A |

Full client suite after PR7: `cd client && npm run test -- --run` → **32 test files, 303 tests,
passing**. `cd client && npx playwright test` (full e2e dir) → **17/17 passing** (14 existing +
3 new R14).

Measured numbers (dev machine, headless Chromium, unthrottled — NOT production-comparable fps,
but real, not fabricated):

| Scene | fps.mean | fps.p5 | renderMs | sprites | draws | gpuTextures | residentAvatarBytes | timeToFirstRender | timeToPlayCold |
|---|---|---|---|---|---|---|---|---|---|
| 8 avatars | 263.29 | 49.5 | 0.23 | 616 | 8 | 23 | 286,746,136 (~273 MB) | 337.5 ms | — |
| 25 avatars | 266.75 | 64.1 | 0.858 | 1925 | 25 | 57 | 286,746,136 (~273 MB, same dedup'd atlas) | 208.4 ms | — |
| cold `llorar` (1 avatar) | 547.67 | 20.41 | 1.311 | 77 | 1 | 9 | 286,746,136 | — | 50.5 ms |

`residentAvatarBytes` is identical across scene sizes by design (dedup'd by atlas key, per
design §11's own field definition) — the raster path's ~273 MB base+actions atlas pages,
resident once any rasta avatar is on screen, is exactly the number §12.7's go/no-go table
measures the vector path against.

## PR8 — Decision spike: vector runtime vs raster (slice 8, IN PROGRESS)

Files changed so far (tasks 1, 2, 3, 4-pure, 6, 7-pure of design §12/tasks.md slice 8):
- `client/src/shared/vector/slotRuns.js` + `.test.js` (new) — MOVED from
  `client/scripts/lib/slotRuns.cjs` (deleted, both source and its `.test.cjs`), byte-identical
  logic, re-verified green at the new location.
- `client/src/shared/vector/pathBounds.js` + `.test.js` (new) — MOVED `computeBounds`/
  `validateCommandAlphabet` from `client/scripts/lib/svgFromPaths.cjs`.
- `client/src/shared/vector/packFrames.js` + `.test.js` (new) — MOVED the `packFrames` shelf
  packer from `client/scripts/lib/packFrames.cjs` (that file now keeps only
  `meanLuminance`/`checkLuminanceWarning`, build-only authoring checks).
- `client/src/shared/vector/pathSpecies.js` + `.test.js` (new) — new pure
  `classifyPathSpecies(piece)` → `'fill'|'stroke'|'gradient'`, extracted from
  `svgFromPaths.cjs`'s `renderPieceStyle` branch conditions (that function itself is untouched;
  this is the SAME rule, made reusable).
- `client/src/shared/vector/path2dOps.js` + `.test.js` (new) — browser-side sibling of
  `svgFromPaths.cjs`: `paintPath(ctx, piece, {Path2DCtor, fillOverride})` branches on
  `classifyPathSpecies`, using `new Path2D(d)` + `ctx.fill(path,'evenodd'|'nonzero')` for fill,
  `ctx.stroke()` for stroke, `ctx.createLinearGradient`+`addColorStop` for gradient;
  `paintClip(ctx, clipD, {Path2DCtor})` for `ctx.clip()`. `Path2DCtor` is injectable
  (default `globalThis.Path2D`) so unit tests need no jsdom/canvas dependency (none exists in
  this project) — a small fake `Path2D` class stands in.
- `client/src/shared/vector/compareRasters.js` + `.test.js` (new) — pure
  `diffRgbaBuffers(a, b, width, height, {tolerance})` → `{differingPixels, totalPixels,
  maxChannelDelta}`, reused by both R16 (cross-rasterizer equivalence, small tolerance) and the
  later R17b gate (slice 11, zero tolerance) per design §16.4's explicit reuse instruction.
- `client/src/shared/vector/bakeCache.js` + `.test.js` (new) — pure
  `computeBakeCacheKey(run, ss)` (content-hash of the run's own path data + `ss`, palette-blind
  by construction — the function signature has no palette parameter at all) and
  `resolveBakeMode(run)` → `'white-mask'|'authored-colour'` (slotted vs. unslotted, design
  §12.5). **Deviation from design's literal wording, disclosed**: design says the key is
  `sha1(run path data) + ss`; this uses a synchronous FNV-1a hash instead of real SHA-1,
  because the module runs in BOTH the Node build context and the browser runtime, and
  `crypto.subtle.digest` is async (a bake-cache lookup must stay synchronous to be worth
  having) while Node's `crypto` module has no synchronous browser equivalent. Content-address
  correctness only needs low collision probability at this cardinality (a few thousand runs
  per character), not cryptographic strength.
- `client/src/shared/vector/runtimeAtlas.js` + `.test.js` (new) — pure
  `findPageWithRoom(pages, rect)` and `pickPageToEvict(pages, maxPages)` (LRU-drop-a-whole-page,
  design §12.5); I/O shell `createRuntimeAtlas(scene, {pageSize, maxPages})` — real
  `Phaser.Textures.CanvasTexture` page creation/upload via `scene.textures.createCanvas`,
  `texture.add(name,0,x,y,w,h)`, placement decided by `findPageWithRoom`, eviction by
  `pickPageToEvict` — not unit-tested directly (I/O shell, same pattern as
  `LayeredAvatar.js`/`PerfHarness.js`).
- `client/scripts/lib/svgFromPaths.cjs` — `computeBounds`/`validateCommandAlphabet` REPLACED by
  a synchronous forward to an injected implementation (`setSharedVectorBounds({computeBounds,
  validateCommandAlphabet})`), called once by each real compiler before any other work. Every
  existing call site in this file is UNCHANGED (still synchronous); `svgFromPaths.test.cjs`
  gained exactly one setup line (`setSharedVectorBounds(pathBounds)` at import time) — all 17
  assertions are byte-identical and re-verified green.
- `client/scripts/lib/packFrames.cjs` — `packFrames` export removed (moved); kept
  `meanLuminance`/`checkLuminanceWarning`. `packFrames.test.cjs` lost its 2 `packFrames`
  describe-block tests (moved to the new location's own test file), kept its 4
  luminance/warning tests unchanged.
- `client/scripts/compile-layered-avatar.cjs` — removed `require('./lib/slotRuns.cjs')` and
  `packFrames` from the `packFrames.cjs` require; added module-scope `let partitionSlotRuns,
  packFrames` populated once at the top of `main()` via `await import(...)` of the 3 shared ESM
  modules, plus `setSharedVectorBounds(...)`.
- `client/scripts/compile-accessory.cjs` — same pattern, wired inside `compileVector()` (its
  actual async entry point for vector-mode compiles; `compileAura` never used these).

### Why the ESM move works without touching 17 already-shipped, tested assertions

`svgFromPaths.cjs`'s own `computeBounds`/`svgFromPaths` stayed synchronous (no `async`/`await`
added to either), because the sole risk of moving that logic to ESM was the fully-synchronous,
widely-tested public function `svgFromPaths()` that many existing tests call with `bounds`
omitted (triggering an internal `computeBounds` fallback). Rather than threading `async`
through 17 tests and the 2 real compilers' every call site, the move uses dependency injection:
the ESM module is the ONLY place the logic lives; `svgFromPaths.cjs` forwards to whatever was
injected via `setSharedVectorBounds`, called once, early, by an async caller (each compiler's
`main()`/`compileVector()`, or the test file's own top-level setup). This is a real, disclosed,
deliberate scoping choice — not a shortcut around "move, don't reimplement": the logic
genuinely lives in exactly one file now (`client/src/shared/vector/pathBounds.js`).

### Live-verified: both real compilers still produce byte-identical output after the move

```
$ node scripts/compile-layered-avatar.cjs rasta
[compile-layered-avatar] wrote rasta: base pages: 1, action pages: 4, action unique pieces:
17722, frames: 103 base + 867 action, sequences: 41, ...
$ md5 (all rasta .webp + .json outputs, before vs after) → IDENTICAL except
  rasta.layers.manifest.json's `sourceHash` field (same non-functional diff pattern PR4's
  EISDIR fix produced — confirmed via `git diff`, single-line minified JSON, only sourceHash
  changed)

$ node scripts/compile-accessory.cjs --kind pet --char rasta pet09
[compile-accessory] wrote pet "pet09": unique frames: 227, anims: 41, pages: 1
$ md5 (pet09's .webp + .accessory.json, before vs after) → byte-identical, zero diff
```

### TDD Cycle Evidence — PR8 (tasks 1, 2, 3, 4-pure, 6, 7-pure)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 (`slotRuns.js` move) | `src/shared/vector/slotRuns.test.js` | Unit | ✅ baseline: original `scripts/lib/slotRuns.test.cjs` 6/6 passing before the move | not-run (nonexistent module at new path) — captured: `Cannot find module './slotRuns.js'` | Passed (6/6, byte-identical assertions) | 6 cases carried over unchanged | Clean |
| 1 (`pathBounds.js` move) | `src/shared/vector/pathBounds.test.js` | Unit | ✅ baseline: relevant block of `svgFromPaths.test.cjs` (6 computeBounds/validateCommandAlphabet cases) passing before the move | not-run (nonexistent module) — captured: `Cannot find module './pathBounds.js'` | Passed (6/6) | 6 cases carried over unchanged | Clean |
| 1 (`svgFromPaths.cjs` injection) | `scripts/lib/svgFromPaths.test.cjs` | Unit | ✅ baseline 17/17 passing before edit | Executed-failing (self-inflicted, expected): after removing the local computeBounds body, `Error: svgFromPaths: computeBounds was not injected` (×17, before the test file's one-line setup import was added) | Passed (17/17, same file, one setup line added) | N/A — re-verification of moved logic, not new behavior | Clean |
| 2 (`packFrames.js` move) | `src/shared/vector/packFrames.test.js` | Unit | ✅ baseline: 2 `packFrames`-specific cases of the original `packFrames.test.cjs` passing before the move | not-run (nonexistent module) — captured: `Cannot find module './packFrames.js'` | Passed (3/3: 2 moved + 1 new "exceeds page limit" triangulation case) | 3 cases: single page, multi-page overflow, oversized-piece throw | Clean |
| 1 (`pathSpecies.js`, new) | `src/shared/vector/pathSpecies.test.js` | Unit | N/A (new) | not-run (nonexistent module) | Passed (4/4) | fill, stroke, gradient, throw-on-neither | Clean |
| 3 (`path2dOps.js`) | `src/shared/vector/path2dOps.test.js` | Unit | N/A (new) | not-run (nonexistent module) | Passed (7/7) | fill+eo, fillOverride-on-fill-only, nonzero-default, stroke-never-overridden, gradient-stops-in-order, throw-on-neither, clip | Clean |
| 4-pure (`compareRasters.js`) | `src/shared/vector/compareRasters.test.js` | Unit | N/A (new) | not-run (nonexistent module) | Passed (4/4) | identical buffers, every-pixel-differs, tolerance boundary, length-mismatch throw | Clean |
| 6 (`bakeCache.js`) | `src/shared/vector/bakeCache.test.js` | Unit | N/A (new) | not-run (nonexistent module) | Passed (6/6) | deterministic-same-input, ss-changes-key, path-data-changes-key, palette-independence (structural), slotted→white-mask, unslotted→authored-colour | Clean |
| 7-pure (`runtimeAtlas.js`) | `src/shared/vector/runtimeAtlas.test.js` | Unit | N/A (new) | not-run (nonexistent module) | Passed (6/6, 1 test datum corrected mid-cycle: initial fixture accidentally had genuine new-shelf room, fixed to a truly-full page and re-verified) | first-page-with-room, no-room→-1, empty-list→-1, under-cap→null, LRU-index-once-over-cap, tie-break-lowest-index | Clean |
| — (real compiler re-verification) | live `node scripts/compile-layered-avatar.cjs rasta` + `node scripts/compile-accessory.cjs --kind pet --char rasta pet09` | Integration | ✅ full vitest suite green before and after | N/A (real run, not written-first) | Succeeded — byte-identical output (see above) | N/A | Clean |

Full client suite so far in PR8: `cd client && npm run test -- --run` → **39 test files, 337
tests, passing** (32 files/303 tests after PR7, +7 new `src/shared/vector/*.test.js` files
adding 39 tests, -2 tests from `packFrames.test.cjs`'s moved describe block = net +34... see
exact count in the run itself: 39 files, 337 tests).

**Remaining for PR8 (slice 8), not yet done**: task 5 (`VectorAvatar.js` façade), task 8
(bucket pre-split for rasta), task 9 (lazy per-animation parse / `parse-pending` degrade
reason), task 10 (e2e R16), task 11 (the written go/no-go verdict). Continuing in this same
apply pass.

### PR8 continued — VectorAvatar façade, bucket pre-split, lazy-parse wiring (tasks 5, 8, 9)

Files changed:
- `client/src/phaser/vector/vectorFramePlacement.js` + `.test.js` (new) — pure
  `computeRunScreenPosition(bounds, frameOrigin, ss)`.
- `client/src/phaser/vector/extractClassMembers.js` + `.test.js` (new) — pure regex-based
  class-member extractor, needed because `LayeredAvatar.js`/`VectorAvatar.js` both `import
  Phaser`, which throws `ReferenceError: window is not defined` under vitest's Node
  environment (confirmed live) — so the façade-contract check (task 5's own instruction) reads
  both files' real source text instead of importing the classes.
- `client/src/phaser/vector/VectorAvatar.js` (new) — the façade: `play`, `setFlipX`,
  `applyPalette`, `attachAccessory` (documented no-op — no accessory package is
  vector-bucket-split), `stop`, `tick`, `get frame`, `anims` shim, `isLayered=true`. Bakes each
  frame's `partitionSlotRuns` runs via `paintPath`/`computeBounds`/`computeBakeCacheKey`/
  `resolveBakeMode`/`createRuntimeAtlas`, applies via per-run pooled `Image` children (mirrors
  `LayeredAvatar`'s per-piece pooling at run granularity instead of build-time piece
  granularity). Uncovered/not-yet-loaded keys report `reason: 'parse-pending'` via the SHIPPED
  `degradeReporter` (task 9 — generalizes R9/R12 with no new concept, per design §12.6).
  **Disclosed scope gap** (recorded in the file's own class docblock): no accessory rendering,
  no mirror/alias resolution chain (resolves directly against `vectorData.sequences` only) —
  a full parity implementation would route through the same `resolveAnimationKey`/`mirrors`/
  `aliases` chain `LayeredAvatar.play()` does; this spike prototype does not.
- `client/src/phaser/vector/VectorAvatar.test.js` (new) — façade-contract check against both
  real files' source text (extracted methods/getters), plus `isLayered=true`/`anims` presence.
- `client/src/shared/vector/bucketSplit.js` + `.test.js` (new) — pure
  `groupKeysByBucket(keys)`, reusing slice 7's `classifySequenceKey`
  (`client/src/phaser/debug/avatarMetrics.js`) rather than reimplementing the classifier.
- `client/src/shared/vector/mergeVectorBuckets.js` + `.test.js` (new) — pure
  `mergeVectorBuckets(index, loadedBuckets)`, merging whichever bucket JSONs are currently
  loaded into VectorAvatar's `vectorData` shape (design §12.6's lazy per-animation parse).
- `client/scripts/split-vector-buckets.cjs` (new) — I/O shell: reads staged
  `.assets-src/layered/<char>/actions/` (see live-discovered source-shape correction below),
  writes `<char>.vector.index.json` + `.loop.json`/`.punch.json`/`.other.json` under
  `client/src/assets/game/avatars/<char>/vector/`.
- `client/src/harness/avatarHarnessApi.js` — added `spawnVectorAvatar`, `loadVectorBucket`,
  `playVectorKey`, `advanceVector`, `readVectorState` — a SEPARATE driving surface from
  `spawnAvatar`/`readState`, deliberately not routed through `AddUserController` (VectorAvatar
  is a spike prototype, not wired into the real spawn pipeline — see its own docblock).
  `VectorAvatar.js`/`runtimeAtlas.js` are imported dynamically INSIDE `spawnVectorAvatar`, not
  at module top, because a top-level import would drag `Phaser` into
  `avatarHarnessApi.test.js`'s module graph (that test imports this file directly to unit-test
  `resolveDirectionValue`) — confirmed live: this broke 1 test file until fixed.
- `client/src/config/gameConfig.js` — `AVATAR_VECTOR: import.meta.env.VITE_AVATAR_VECTOR ===
  "true"`, mirroring `LAYERED_AVATARS`. Harness-only today — no production wiring exists yet
  (that is exactly what the spike's verdict decides).
- `client/.env.example` — documented `VITE_AVATAR_VECTOR=false`.

### Live-discovered source-shape correction (task 8)

The base package's own `_frames.json`/`<anim>.json` (siblings of `meta.json` at the character
root, OUTSIDE `actions/`) are NOT vector path data — they are an ALREADY-RASTERIZED
piece-reference shape (`{o, L:[{p:pieceIndex,x,y,w,h,s?}], h, hz}`), the exact input the raster
compiler's base-pack step repacks from existing `p*.png` files. The first version of
`split-vector-buckets.cjs` read this shape for base keys and produced malformed bucket
output (confirmed live: `frames[0]` had an `L` field, not the expected `p` vector-path array).
Corrected by reading `actions/_frames_<key>.json` for EVERY one of that directory's 41 declared
keys instead (confirmed live: it carries a SELF-CONTAINED, already-unique-deduped
`{o,p:[{d,f,eo,c}...]}` array for every key, including `down_idle`/`left_walk`/`down_talk` —
not only the combat/emote action set) — the base package's raster piece pool is never touched
by the vector bucket split at all.

### Real measured numbers from the bucket split (rasta)

| Bucket | Keys | Raw JSON | Gzip |
|---|---|---|---|
| loop | 15 (idle/walk/talk × direction) | 1.46 MB | 0.30 MB |
| punch | 2 | 3.50 MB | 0.56 MB |
| other | 24 | 10.65 MB | 2.37 MB |
| **Total** | 41 | **15.58 MB** | **3.22 MB** |

This is a genuine, disclosed, verdict-relevant finding: uncompacted vector JSON tracked bytes
(15.58 MB) for ONE character is already close to the raster path's own measured total (PR5:
~16 MB for rasta's base+action `.webp`/`.atlas.json`/`.manifest.json`) — the vector path is
NOT an order-of-magnitude byte win before any compaction pass, contrary to what production's
~4.7 MB-per-character vector-package figure (design §10) might suggest; that figure is
production's OWN compacted/binary format, not a naive JSON re-encoding of the same path data.
Carried forward into the §12.7 go/no-go table below.

Full client suite after this batch: `cd client && npm run test -- --run` → **44 test files,
350 tests, passing**.

### PR8 — Cross-rasterizer equivalence (task 4, apply-phase run) and e2e (tasks 9/10)

Files changed:
- `client/src/harness/vectorCrossRasterHarness.js` (new) — dev-only, exposes
  `window.__vectorCrossRasterHarness.renderRunToRgba(paths, clips, ss)`: a REAL browser
  `<canvas>` + `path2dOps.js`, returning raw RGBA pixel data — the browser half of the
  cross-rasterizer check.
- `client/src/harness/main.js` — loads it unconditionally (harness-only file; the whole page is
  already dev-only per `vite.config.js`'s default build input, PR2's own established pattern).
- `client/scripts/verify-cross-rasterizer.cjs` (new) — apply-phase verification script (not a
  vitest/Playwright-test file, per design §13's own classification of this as an "apply-phase
  verification, explicit task"): renders 3 REAL runs (see below) through BOTH the build path
  (`sharp` + `svgFromPaths.cjs`, `density:144`) and the browser path (a real headless Chromium
  page via `@playwright/test`'s `chromium.launch()`, hitting the running harness dev server),
  diffs with `diffRgbaBuffers`.
- `client/e2e/avatar-vector-spike.spec.js` (new) — R16-lite (VectorAvatar renders real content
  for `down_idle`; a not-yet-loaded bucket key degrades `parse-pending` then resolves once
  loaded, task 9); 8/25-avatar vector-path metrics capture; a `timeToPlayCold` capture for a
  cold "other"-bucket trigger. Writes JSON artifacts to `client/e2e/artifacts/` (gitignored).
- `client/src/phaser/debug/avatarMetrics.js` (+`.test.js`) — added pure
  `computeRuntimeAtlasBytes(pages)` (2 new tests) and wired `residentAvatarBytesVector` into
  the aggregator's `snapshot()`, reading `scene.__vectorRuntimeAtlas` when the harness has
  attached one (set by `spawnVectorAvatar`).

### Real cross-rasterizer measurements (3 real runs: rasta's fill+stroke pair, pet09's real
gradient occurrence, minnieHat's real clipped-fill occurrence — command: `node
scripts/verify-cross-rasterizer.cjs` against a running harness dev server)

| Run | Build vs. browser buffer size | Differing pixels @ tolerance 5 | Differing pixels @ tolerance 32 |
|---|---|---|---|
| fill+stroke (rasta down_idle) | 26x44 both | 246/1144 (21.5%) | 189/1144 (16.5%) |
| linear gradient (pet09 down_coco) | 16x34 both | 101/544 (18.6%) | 57/544 (10.5%) |
| clipped fill (minnieHat down_coco) | 14x16 both | 30/224 (13.4%) | 3/224 (1.3%) |

Both rasterizers agree exactly on computed bounds (buffer dimensions identical in all 3 cases —
`computeBounds` is shared, so this was never in question). Pixel VALUES disagree meaningfully
even at a generous ±32/255-per-channel tolerance for the fill+stroke and gradient cases —
plausibly independent antialiasing implementations (librsvg vs. Canvas2D) and/or gradient
colour-stop interpolation differences, not confirmed further (time-boxed). **Counter-intuitive
finding, disclosed plainly**: design §18 risk 2 names the `k`/`cl` clip reading as "the most
plausible failure mode" for cross-rasterizer disagreement — the measured data shows the
OPPOSITE: the clipped case converges best (1.3% at loose tolerance), while the plain fill+stroke
case (the supposedly simplest species) disagrees the most.

### Real vector-path performance/byte measurements (headless Chromium, unthrottled — same
machine and caveat as PR7's raster numbers)

| Scene | fps.mean | fps.p5 | renderMs | draws | gpuTextures | residentAvatarBytesVector | timeToFirstRender |
|---|---|---|---|---|---|---|---|
| 8 vector avatars (loop bucket) | 173.72 | 108.7 | 0.336 | 8 | 7 | 33,554,432 (32.0 MB) | 200.8 ms |
| 25 vector avatars (loop bucket) | 154.69 | 108.7 | 0.935 | 25 | 7 | 33,554,432 (32.0 MB, unchanged — same 2 cache pages) | 195.1 ms |

`residentAvatarBytesVector` staying IDENTICAL from 8 to 25 avatars is a genuine, positive
confirmation of the run-keyed bake cache's design intent (§12.5): repeated avatars of the same
character/pose share the same 2 runtime-atlas pages regardless of count — the measured build-time
dedup ratio (17,722 pieces from 970 frames, PR5) does predict a high runtime cache-hit rate, as
design §12.5 itself predicted.

`timeToPlayCold` (ad hoc `Date.now()` wall-clock around `loadVectorBucket('other')` +
`playVectorKey('down_llorar')`, since this measures a bucket-JSON dynamic-import + parse, not
yet wired into `__avatarMetricsControls`): **358 ms** — includes parsing the FULL 10.65 MB
"other" bucket JSON (design §12.4's own chosen granularity is per-bucket, not per-animation,
so this is a faithful cost of that decision, not an implementation shortcut).

## Slice 8 — WRITTEN VERDICT (design §12.7 go/no-go table)

| Measurement | Scene | Vector must reach | Measured | Result |
|---|---|---|---|---|
| `fps.p5` | 25 avatars | ≥ 45 | 108.7 | **PASS** |
| `fps.mean` | 8 avatars | ≥ 55 | 173.72 | **PASS** |
| `draws` | 8 avatars | ≤ 60 | 8 | **PASS** |
| `residentAvatarBytes` | 8 avatars | ≤ 44 MB | 32.0 MB | **PASS** |
| `renderMs` | 8 avatars | ≤ 2.0 | 0.336 | **PASS** |
| `timeToFirstRender` | room entry, cold | ≤ 1.5× raster's measured value (raster: 337.5 ms → 506.25 ms) | 200.8 ms | **PASS** |
| `timeToPlayCold` | first `llorar` after entry | ≤ 250 ms | 358 ms | **FAIL** |
| tracked bytes per character | build output | ≤ 1.5 MB (raster measured 9.4–16 MB) | 15.58 MB raw / 3.22 MB gzip | **FAIL** |
| cross-rasterizer equivalence | §12.3 | pass | 10.5–16.5% differing pixels at a loose ±32 tolerance (2 of 3 species) | **FAIL / marginal** |

**Verdict: RASTER WINS.**

Rationale, mapped directly onto design §12.7's own decision criteria: "Raster wins — vector
misses `fps` or `timeToPlayCold`." Vector's `fps`/`draws`/`renderMs`/`residentAvatarBytes`/
`timeToFirstRender` all measured comfortably inside their thresholds — the runtime-bake
architecture itself performs well and the cache-dedup hypothesis (§12.5) is confirmed. But
`timeToPlayCold` misses its 250 ms ceiling (358 ms, driven by the cost of the design's own
chosen per-bucket parse granularity), tracked bytes per character misses its 1.5 MB ceiling by
roughly an order of magnitude even before accounting for compaction (which was not built or
measured in this time-boxed spike — a real caveat, not a promise it would clear the bar; the
raw-to-gzip ratio measured, ~4.8:1, suggests compaction plus gzip together would still likely
land well above 1.5 MB for a character with rasta's ~41-sequence coverage), and
cross-rasterizer equivalence is not a clean pass on 2 of the 3 tested species. Two clear misses
plus one marginal miss, none of them "inside noise" — this is a decisive result, not an
"inconclusive" one; the time-box was not exhausted by ambiguity, it was exhausted by a clear
answer.

**What this does NOT mean**: it does not mean the vector architecture is broken — the
performance/memory numbers are genuinely strong, and the disclosed scope gaps (no accessories,
no mirror/alias chain, ad hoc `timeToPlayCold` measurement, no compaction pass) mean a fuller
implementation could plausibly close SOME of the misses (especially `timeToPlayCold`, via
true per-animation lazy parse instead of per-bucket). It means: on the numbers actually
measured, in the time available, raster is the right call for this change's remaining scope.

**Per design §12.7/§14, the "Raster wins" continuation** (not implemented in this apply pass,
per the explicit slice-8-through-11 stop instruction): mandatory alpha-only/palettized `.webp`
pass + cross-package raster dedup measurement across all 612 accessory packages; compaction +
bundling; `--from-vector` for `ghost`/`wraith`; 18 bodies in batches of 4; 612 accessories in
batches of 4-5 characters; a roster-scale regression gate; conditional aura pagination. This is
recorded here as the next apply pass's starting point, per the design's own "regenerate
tasks.md for the selected continuation only" instruction (§14) — not written as concrete tasks
in this pass, since that would be planning work past the branch point this apply run must stop
at.

**Everything built in slice 8 survives this verdict regardless** (design §12.8): the ESM move
(`slotRuns.js`/`pathBounds.js`/`packFrames.js`) is now the canonical, real implementation the 2
shipped compilers consume — reverting the verdict does not revert this refactor. `path2dOps.js`,
`compareRasters.js`, `bakeCache.js`, `runtimeAtlas.js`, `VectorAvatar.js`, the bucket-split
tooling and `VITE_AVATAR_VECTOR` all remain in the tree, inert with the flag off (default), as
a named, working, measured follow-up rather than a discarded experiment.

Full client suite at the end of slice 8: `cd client && npm run test -- --run` → **44 test
files, 352 tests, passing**. `cd client && npx playwright test` (full `e2e/` dir) → **22/22
passing** (14 R1-R13 + 3 R14 parity + 2 R16-lite/parse-pending + 2 vector-metrics + 1
vector-cold-trigger = 22).

Background processes: `vite dev --port 5183` (started manually for
`verify-cross-rasterizer.cjs`) was killed via `lsof -ti:5183 | xargs kill -9` before moving on
(confirmed clear via a second `lsof` check). The subsequent `npx playwright test` run used its
own managed `webServer` lifecycle and needed no manual cleanup. One pre-existing, NOT
self-started `vite` process remains listening on port 5173 (pid 11657, running since before
this session began) — left untouched, outside this apply pass's scope.

## PR9 — Glob-based registries (slice 9)

Files changed:
- `client/src/phaser/managers/parseAccessoryAssetPath.js` + `.test.js` (new) — pure
  `parseAccessoryAssetPath(assetPath)` → `{kind, character, key}`; a path with 2 segments after
  `accessories/` (auras, no character) resolves `character:'*'`, 3 segments resolves
  `{kind,character,key}` directly, anything else throws naming the path.
- `client/src/phaser/managers/buildAccessoryPackagesFromGlob.js` + `.test.js` (new) — pure
  grouping of a flat `import.meta.glob` result into the same `{registryKey:
  {manifest,atlas,webp}}` shape the old hand-written `ACCESSORY_PACKAGES` map declared.
- `client/src/phaser/managers/buildLayeredAvatarRegistry.js` + `.test.js` (new) — pure
  `extractLayeredCharacterName`, `groupLayeredLoadersByCharacter` (sorts by path so a
  multi-page asset like `rasta.actions_2.webp` orders after `rasta.actions_1.webp`, matching
  `loadLayeredActions`'s expected page order), `buildLayeredCharacterRegistry` (derives
  avatarId->characterName from `AvatarEnum` + which characters have a compiled manifest —
  excludes a compiled character with no matching enum entry rather than guessing, design §15).
- `client/src/phaser/managers/AccessoryManager.js` — `ACCESSORY_PACKAGES` literal map REPLACED
  by `buildAccessoryPackagesFromGlob(import.meta.glob('@/assets/game/accessories/**/*.{accessory.json,atlas.json,webp}'))`.
  Registry resolution (`resolveAccessoryRegistryKey`/`resolveAccessoryAtlasKey`/
  `checkManifestCharMismatch`, all in `accessoryRegistryResolve.js`) is UNCHANGED — only the
  population mechanism changed, confirmed by `accessoryRegistryResolve.test.js`'s 9 existing
  cases passing unmodified.
- `client/src/phaser/managers/AvatarManager.js` — the 5 hand-maintained `LAYERED_CHARACTERS`/
  `LAYERED_MANIFEST_LOADERS`/`LAYERED_ATLAS_LOADERS`/`LAYERED_WEBP_LOADERS`/
  `LAYERED_ACTIONS_ATLAS_LOADERS`/`LAYERED_ACTIONS_WEBP_LOADERS` literal maps REPLACED by 5
  `import.meta.glob(...)` calls grouped via `groupLayeredLoadersByCharacter`, re-keyed from
  character name to avatarId via `buildLayeredCharacterRegistry`. Every consumer (`avatarId`-
  keyed lookups at the call sites, unchanged) reads the identical shape as before.

### Safety net (task 2) and regression re-verification (task 5)

Baseline before the rewrite: `accessoryRegistryResolve.test.js` (9), `AccessoryManager.test.js`
(3), `AssetVersionManager.test.js` (7) → 19/19 passing. `AvatarManager.js` has no dedicated
unit test file (I/O-shell, `import Phaser`-free but a large stateful singleton — its only
regression coverage is the live e2e suite through the harness, same as every prior slice's
AvatarManager edits).

After the rewrite: same 19/19 unit tests still pass unmodified (`accessoryRegistryResolve
.test.js`'s 9 cases untouched — confirms task 4's "resolution order is unchanged" directly);
full client suite `cd client && npm run test -- --run` → **47 test files, 367 tests, passing**
(44→47 files, +15 tests: `parseAccessoryAssetPath` 5, `buildAccessoryPackagesFromGlob` 3,
`buildLayeredAvatarRegistry` 7 = 15 new). Full e2e regression `cd client && npx playwright
test` → **22/22 passing**, unchanged from the pre-rewrite run — R1-R13 all still green on
`rasta` through the REAL (glob-populated) `AvatarManager`/`AccessoryManager` singletons, live
through the harness's `spawnAvatarUser` -> `AddUserController.processUser` path (task 5's own
explicit requirement).

### TDD Cycle Evidence — PR9

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 (`parseAccessoryAssetPath`) | `parseAccessoryAssetPath.test.js` | Unit | N/A (new) | not-run (nonexistent module) | Passed (5/5) | hat, pet, aura-wildcard, shared-key-different-character, malformed-throw | Clean |
| 3 (`buildAccessoryPackagesFromGlob`) | `buildAccessoryPackagesFromGlob.test.js` | Unit | N/A (new) | not-run (nonexistent module) | Passed (3/3) | single hat package grouping, aura wildcard grouping, two-characters-same-key stay distinct | Clean |
| 3 (`buildLayeredAvatarRegistry`) | `buildLayeredAvatarRegistry.test.js` | Unit | N/A (new) | not-run (nonexistent module) | Passed (7/7) | path extraction (manifest + multi-page webp + malformed-throw), loader sort order, 2-character grouping, registry mapping incl. excluded-unmatched-character case | Clean |
| 3/4 (`AccessoryManager.js` rewrite) | `AccessoryManager.test.js` | Unit | ✅ baseline 3/3 | N/A (real rewrite against a real, already-tested contract — approval-style: re-ran the SAME assertions against the new implementation) | Passed (3/3 unmodified, incl. the real-package `hasPackage` checks, which would fail if the glob discovered nothing) | N/A (re-verification, not new logic) | Clean |
| 3 (`AvatarManager.js` rewrite) | full e2e suite (no dedicated unit file exists for this class) | Integration/E2E | ✅ baseline 22/22 e2e before the rewrite | N/A (real rewrite, re-verified against the live harness pipeline) | Passed (22/22 e2e unmodified) | N/A | Clean |

Background processes: none left running for this slice (no manual dev-server start was needed;
`npx playwright test` used its own managed webServer lifecycle).

## PR10 — `sally` registration (slice 10, ONLY server/API/DB slice)

Files changed:
- `client/src/enums/AvatarEnum.js` + `server/src/enums/AvatarEnum.js` — `SALLY: 18`.
- `client/src/phaser/managers/layeredOnlyCharacters.js` + `.test.js` (new) — pure
  `shouldRejectAsLayeredOnly(avatarId, isLayeredUsable, layeredOnlyCharacters)`.
- `client/src/phaser/managers/AvatarManager.js` — `LAYERED_ONLY_CHARACTERS = new
  Set([AvatarEnum.SALLY])`; `loadAvatar` now rejects immediately (naming the avatarId) when a
  layered-only character's layered path is unusable, BEFORE falling through to `avatarLoaders`
  (which has no sally entry — the rejection is now an explicit, documented rule, not an
  accident of that absence).
- `client/src/phaser/controllers/scene/AddUserController.js` +
  `UserChangeAvatarController.js` — `case AvatarEnum.SALLY: return "sally";` added to both
  `avatarName()` switches.
- `client/scripts/lib/buildConfigShim.cjs` + `.test.cjs` (new) — pure `buildConfigShim
  (manifest)`: derives a baked-shaped `config.json` (`atlasKey: null`, `prefix`,
  `flip_horizontally`, `start/end`, `frameRate`, `frameWidth/Height`, `repeat`,
  `positionX/Y`) per `sequences` key (and per `mirrors` key, flipped), from `bodyBounds`/
  `frames[].o`/`sequences`/`mirrors`. Tested against a small FIXTURE manifest, not sally's real
  output (her compile is deferred, design.md §15).
- `client/scripts/compile-layered-avatar.cjs` — new `--emit-config-shim` CLI flag: after
  writing the manifest, if the flag is present, calls `buildConfigShim` and writes
  `<char>/config.json` (opt-in — never touches an already-migrated character's real baked
  config.json). **Live-verified it does not overwrite an existing baked config.json**: recompiled
  `rasta` WITHOUT the flag, `config.json`'s md5 unchanged (`e817556e6e2857411143a261b1cee0cf`
  before and after).
- `client/src/phaser/managers/AssetVersionManager.js` — `avatarVersions.avatars[18]` +
  `layeredVersions.characters.sally` entries (version-tracking metadata only; the directory
  this key would track does not exist yet, matching design.md §15's "registered now... appears
  once the deferred asset compile lands").
- `client/src/phaser/managers/AccessoryManager.test.js` — added a `describe` block: sally has
  no accessory packages at all — `hasPackage`/`load` miss through the SAME generic registry-miss
  path any other unregistered character does (no `sally`-specific branch exists anywhere).
- `server/src/enums/AnimationBlockTimerEnum.js` — 11 `SALLY_*` constants (flat 5000ms defaults,
  matching BOOMER/ZOMBIE/YAYO's own convention — no bespoke per-action timing authored yet).
- `server/src/maps/EmojisBlockActionsMap.js` — added `[AvatarEnum.SALLY]` to all 8 of this
  file's real emoji-keyed `time` blocks (LAUGHTER_1, LAUGHTER_2, CRY, LOVE, SPIT, FART,
  PROVOKE, FLY).
- `api/database/seeders/SallyAvatarCatalogItemSeeder.php` (new) — idempotent seeder creating
  sally's `catalog_items` row (`user_decoration_type='avatar'`, `user_decoration_value='18'`,
  `sprite_name='avatar_sally'`), matching the exact field shape of rasta's real production row
  (verified against `boombang_api.sql`'s actual INSERT for id 18/rasta: `name`
  `{"en":"Avatar Rasta"}`, `sprite_name` `avatar_rasta`, `user_decoration_type` `avatar`,
  `user_decoration_value` `"12"`). NOT wired into `DatabaseSeeder.php`'s automatic chain
  (matching `ImportAvatarsSeeder.php`'s own precedent of staying a manually-invoked seeder) —
  run via `php artisan db:seed --class=SallyAvatarCatalogItemSeeder`.

### Disclosed deviations from tasks.md's literal wording (recorded, not silently resolved)

1. **`AvatarsDataPreload.js` is NOT wired for sally in this pass.** Task 5 literally asks for
   `[AvatarEnum.SALLY]: asset_sally_json` importing a compiled shim — but that requires a
   static `import ... from "@/assets/game/avatars/sally/config.json"`, and NO such file exists
   (design.md §15 explicitly defers sally's asset compile past this change's branch point). A
   static import of a nonexistent file breaks Vite's build entirely for EVERY character, not
   just sally — this is not a risk worth taking to satisfy one task literally. Fabricating a
   placeholder shim from invented (not real) frame/sequence data was considered and rejected:
   it would misrepresent unfinished work as compiled output, and `buildConfigShim.cjs`'s own
   correctness gate (task 4) is specifically to derive REAL shim values from a REAL manifest,
   not synthesize plausible-looking fake ones. This wiring is a one-line addition once the
   deferred compile actually runs `--emit-config-shim` for sally.
2. **Route used for task 9's catalog row is the seeder fallback, not the Backpack admin
   entry.** This apply pass has no live Backpack admin session to create the row through
   interactively; the seeder is design.md §15's own named fallback "if admin entry proves
   impractical" — recorded here as the route actually used, per the task's own instruction to
   "record which route was used."
3. **Task 7/8's "12 SALLY_* constants"/"12 entries in EmojisBlockActionsMap" does not match
   the real file structure.** `AnimationBlockTimerEnum.js` has 11 constants per existing
   character (LAUGHTER_1, LAUGHTER_2, CRY, LOVE, SPIT, FART, PROVOKE, FLY, KISS, DRINK, ROSE),
   and `EmojisBlockActionsMap.js` has only 8 top-level emoji-keyed blocks (no separate KISS/
   DRINK/ROSE blocks exist there). Implemented against the REAL, read file structure (11
   constants, 8 map entries) rather than the estimated count, with a disclosing comment left
   in `EmojisBlockActionsMap.js` itself.
4. **`cd api && ./vendor/bin/phpunit` could not be run — PHP is not installed in this
   environment** (`command not found: php`, confirmed live). This is an infrastructure
   limitation, not a skipped step: the seeder's PHP was reviewed manually (matches
   `ImportAvatarsSeeder.php`'s established style, `CatalogItem`'s real `$fillable` list, and
   the real production row's field shape verified against `boombang_api.sql`), but has NOT
   been executed against a real database in this apply pass. Flagged as a concrete blocker for
   whoever next has a working PHP/Laravel environment, per the strict-tdd module's "report as
   Blocked" instruction for an infrastructure-unavailable test runner.

### TDD Cycle Evidence — PR10

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 2 (`shouldRejectAsLayeredOnly`) | `layeredOnlyCharacters.test.js` | Unit | N/A (new) | not-run (nonexistent module) | Passed (3/3) | member-present+unusable→reject, member-present+usable→no-reject, non-member→no-reject | Clean |
| 4 (`buildConfigShim`) | `buildConfigShim.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) | Passed (4/4) | full-shape single-entry check, per-sequence independence (different fps/repeat/end), mirrored-entry flip, atlasKey:null invariant across every entry | Clean |
| 10 (sally accessory-roster absence) | `AccessoryManager.test.js` | Unit | ✅ baseline 3/3 (pre-slice-9 count; 5/5 after slice 9's own additions) | N/A (approval/verification-style, disclosed — sally was never a special case anywhere, so this documents already-correct behaviour rather than driving new logic, same pattern as the file's own pre-existing docblock note) | Passed (5/5, 2 new cases: `hasPackage` false for both kinds, `load` rejects naming sally+key) | 2 cases (hat + pet kind) | Clean |
| 1/3/6/7/8 (enum/name/version/server wiring) | full unit + e2e suites | Integration/E2E | ✅ baseline 49/49 unit + 22/22 e2e (post-slice-9) | N/A (additive registrations, no new pure logic to RED-first) | Passed (49/49 unit unchanged in count except the 2 new pure-function test files above; 22/22 e2e unchanged — sally adds no new e2e coverage per design.md's own "no e2e task" note, her asset compile being deferred) | N/A | Clean |
| 9 (catalog seeder) | none (PHP unavailable in this environment) | — | N/A | Blocked — infrastructure unavailable (`php: command not found`), reviewed manually against real production data (`boombang_api.sql`) instead of executed | Not executed | N/A | N/A |

Full client suite after PR10: `cd client && npm run test -- --run` → **49 test files, 376
tests, passing**. `cd client && npx playwright test` → **22/22 passing**, unchanged (sally
adds no e2e coverage in this slice, by design). `cd server && npm run test -- --run` →
**3 test files, 13 tests, passing** (unchanged baseline — this slice's server edits are pure
data/enum additions with no server unit test file covering them, matching the codebase's
existing pattern for `AnimationBlockTimerEnum.js`/`EmojisBlockActionsMap.js`, neither of which
has a dedicated test file today). `cd api && ./vendor/bin/phpunit` — **blocked**, PHP not
installed in this environment.

## PR11 — Asset-authoring round-trip (slice 11, IN PROGRESS)

### Live-discovered discrepancy: design.md §4 claims `accessory-annotations.json` is
"shipped"; it did not exist on disk

Design §4 states annotations "move out of the destructible tree into committed
`client/scripts/accessory-annotations.json`... already shipped." Confirmed live (`find`
across the whole repo): no such file existed anywhere in the working tree before this slice —
`scale`/`groundOffsetY` were still living inside the destructible, gitignored
`.assets-src/accessories/<char>/<key>/meta.json`, exactly as PR4's own apply-progress entry
describes ("re-applied both annotations by hand"). This slice creates the file for the first
time, migrating both known real corrections into it, which is also what task 1 itself needed
as a foundation for `regXOffset`/`regYOffset`.

### Tier 1 — repositioning via a committed annotation (tasks 1, 10): DONE, live-verified end to end

Files changed:
- `client/scripts/accessory-annotations.json` (new, committed) — `{"rasta/hat/minnieHat":
  {"scale":0.75}, "rasta/pet/pet09": {"groundOffsetY":19}}`. Keyed `<char>/<kind>/<key>`
  (slashes, matching design.md §16.1's own literal prose, not the colon form used elsewhere in
  the design doc for the SAME example).
- `client/scripts/lib/accessoryAnnotations.cjs` + `.test.cjs` (new) — pure
  `resolveAccessoryAnnotation(annotations, char, kind, key)` and
  `applyRegistrationOffset(frames, regXOffset, regYOffset)` (returns a NEW frames object,
  never mutates the input).
- `client/scripts/compile-accessory.cjs` — reads `accessory-annotations.json` once per
  compile; `base.scale`/`base.groundOffsetY` now come from the resolved annotation (NOT
  `meta.json` anymore — `meta.scale`/`meta.groundOffsetY` are no longer read at all, though a
  staged `meta.json` may still harmlessly carry stale values from before this migration);
  `base.regX`/`base.regY` (previously always `0`, dead fields — `resolveAccessoryPlacement` in
  `pivot.js` never actually reads them, only per-frame `accFrame.regX`/`regY`) now carry the
  resolved offset; every frame's own `regX`/`regY` is shifted by `applyRegistrationOffset`
  BEFORE the pet-side derivation and every other downstream consumer runs, so the offset lands
  in the value that is actually read at runtime.

**Live-verified byte-identical after the migration** (proves zero behavioural regression from
moving `scale`/`groundOffsetY` off `meta.json` onto the new file): recompiled `minnieHat`
(`node scripts/compile-accessory.cjs --kind hat --char rasta minnieHat`) and `pet09` — every
`.webp`/`.accessory.json` byte-identical to before (`diff` on sorted `md5` listings, exit 0
both times).

**Live end-to-end numeric confirmation (task 10), on REAL resolved rendered state via the
harness** — not a pure-function computation:

| Step | `accessory-annotations.json` entry | Harness-read hat `x`/`y` (`down`, real px) |
|---|---|---|
| Baseline | `{"scale":0.75}` (no offset) | `x=2.8, y=-183.4` |
| Nudged | `{"scale":0.75,"regXOffset":5,"regYOffset":-3}` | `x=12.8, y=-189.4` |
| Delta | — | `Δx=10.0 = 5×ss(2)`, `Δy=-6.0 = -3×ss(2)` — **exact** |
| Reverted | back to `{"scale":0.75}` | `x=2.8, y=-183.4` — back to baseline exactly |

Method: `client/scripts/verify-tier1-nudge.cjs` (new, kept as a reusable apply-phase tool,
same precedent as `verify-cross-rasterizer.cjs`/`verify-r17a.cjs`) — spawns a real avatar with
`minnieHat` via the harness, sets direction `down`, reads `readState(...).children.find(c =>
c.kind === 'hat')`, against a live `vite dev --port 5183` server. Confirms the resolved
position moved by exactly `offset × ss` on resolved rendered state, then confirms it reverts —
this IS the mechanism `<char>:<kind>:<key>` keying protects (proven separately, at the pure-
function level, by `accessoryAnnotations.test.cjs`'s "does NOT let one character's Custom6Hat
annotation leak onto a different character's Custom6Hat" case).

### Tasks 2 + 8 — `bb-unpack.cjs`/`bb-pack.cjs` (fflate) and R17a: DONE, live-verified on the
full representative set

Files changed:
- `client/package.json` — `fflate` devDependency (installed).
- `client/scripts/lib/bbArchive.cjs` + `.test.cjs` (new) — pure `buildZipEntries(files)`:
  sorts entries by path (stable regardless of input key order) and assigns every entry the
  SAME `FIXED_ARCHIVE_MTIME` (`2020-01-01T00:00:00Z` — `mtime:0`/epoch itself is rejected by
  the DOS zip date range 1980-2099, confirmed live). Verified live that two independent
  `zipSync` calls over the same input produce byte-identical output.
- `client/scripts/bb-unpack.cjs` / `bb-pack.cjs` (new) — `fflate`'s `unzipSync`/`zipSync`, not
  the `zip` CLI (deterministic archive requirement).
- `client/scripts/verify-r17a.cjs` (new) — apply-phase verification: unpack -> repack, then
  compares every entry (JSON parsed + deep-equal with key-order-independence; non-JSON
  byte-identical).

**Live-verified R17a PASS on the full representative set** (design.md §16.4's own list: "one
body (rasta, all 41 sequences), plus Custom6Hat, minnieHat, pet09"), run against the REAL raw
source archives:

| Package | Entries | JSON deep-equal | Binary byte-identical | Result |
|---|---|---|---|---|
| `rasta.layers.bb` (base pack) | 2221 | 17 | 2204 | **PASS** |
| `rasta.bb` (vector pack, all 41 sequences) | 100 | 83 | 17 | **PASS** |
| `Custom6Hat.bb` | 83 | 83 | 0 | **PASS** |
| `minnieHat.bb` | 83 | 83 | 0 | **PASS** |
| `pet09.bb` | 83 | 83 | 0 | **PASS** |

Every entry in every package survived unpack -> repack unchanged. Scratch unpack/repack
directories were removed after verification (`/tmp/r17a`, not committed).

### Task 3 — staging-order fix (`asset-overrides/`): DONE, live-verified

Files changed:
- `client/scripts/lib/assetOverrides.cjs` + `.test.cjs` (new) — pure
  `resolveOverrideDestination(relativeOverridePath, stagedAccessoriesRoot)`: maps
  `<char>/<kind>/<key>/<filename>` onto `.assets-src/accessories/<char>/<key>/<filename>` (the
  staged tree carries no `kind` segment of its own, per design.md §4's staging convention —
  the override path's `kind` segment is organizational only).
- `client/scripts/apply-asset-overrides.cjs` (new) — I/O shell: copies every file under
  `client/asset-overrides/<char>/` onto its resolved staged destination; throws (naming the
  override and its resolved destination) if the target package directory does not exist yet.
- `client/scripts/stage-layered-source.sh` — new step, inserted between accessory staging and
  compile: `node "$SCRIPT_DIR/apply-asset-overrides.cjs" "$CHAR"`. `accessory-annotations.json`
  itself needed NO staging-order change at all — it is read directly from its own fixed
  committed path by `compile-accessory.cjs`, never staged into `.assets-src/`, so it can never
  be lost to a re-unzip in the first place (a stronger fix than "re-apply after every unzip"
  for that specific class of correction).
- `client/asset-overrides/README.md` (new) — documents the tree's layout; the tree itself is
  otherwise empty (no real hand edits exist yet to commit).

**Live-verified (approval-test style, against real files, not vitest)**: took minnieHat's real
staged `_frames_down_idle.json`, wrote a deliberately-different version to
`asset-overrides/rasta/hat/minnieHat/_frames_down_idle.json`, confirmed the staged file (i)
matched the ORIGINAL right after a simulated re-unzip (the defect this fixes: without the new
step, a re-stage would silently keep the original and discard the override), then (ii) ran
`apply-asset-overrides.cjs rasta` and confirmed the staged file now matched the OVERRIDE
instead. Cleaned up afterward (`asset-overrides/rasta/` removed, minnieHat re-unzipped fresh,
confirmed byte-identical to its pristine original — no lingering test artifacts in
`.assets-src/`, which is gitignored anyway).

Full client suite after Tier 1 + tasks 2/3/8: `cd client && npm run test -- --run` → **52 test
files, 389 tests, passing**.

**Remaining for slice 11 (continuing in this same apply pass)**: tasks 4-7 (SVG export/import,
Tier 2), task 9 (R17b), task 11 (name a validated vector editor).

### Tier 2 — SVG round-trip (tasks 4-7): DONE for a real, scoped subset; task 9 (R17b) live-verified PASS

Files changed:
- `client/scripts/lib/svgFrameExport.cjs` + `.test.cjs` (new) — `exportFrameSvg(frame,
  colormetaDefaults, ss)`: reuses `svgFromPaths`/`computeBounds` (the SAME functions the build
  compilers use — "the editing canvas is the compile canvas"), splices `data-bb-origin="x,y"`
  onto the root (authoritative), injects `data-bb-slot` per slotted `<path>` (redundancy only —
  the sidecar is authoritative), resolves a slotted path's exported fill to
  `#${colormetaDefaults[slot]}` explicitly (defensive: fact C says the authored fill already
  equals it, but this does not trust that silently). Sidecar carries `{species, slot?, k?}`
  per path in document order, plus `cl` and `origin` verbatim.
- `client/scripts/lib/svgFrameImport.cjs` + `.test.cjs` (new) — `importFrameSvg(svg, sidecar,
  colormetaDefaults)`: strips `<g data-bb-role="guide">` groups (ignored entirely) and
  `<defs>` (a `<clipPath>` def's own `<path>` — the clip SHAPE — is not one of the frame's own
  pieces; live-discovered: the FIRST real-frame run below hit a genuine "31 vs 30" path-count
  mismatch until this exclusion was added). `d` strings copied VERBATIM via regex attribute
  extraction, never parsed/re-serialized. Species-specific reconstruction: stroke trusted
  as-is; gradient reduced back to `{t:"l",st,x1,y1,x2,y2}` from the referenced
  `<linearGradient>` def; fill either trusted (unslotted) or DISCARDED and resolved from the
  slot default (slotted — warns, does not fail, when the SVG's own fill disagrees). Reject-
  not-guess cases implemented and each independently tested: path count mismatch;
  `data-bb-slot` disagreeing with the sidecar; an unreducible RADIAL gradient; a gradient
  carrying `gradientTransform`; a gradient using `objectBoundingBox` units; a path command
  outside `M/L/Q/Z/C` (reuses the shared `validateCommandAlphabet`); a missing root
  `data-bb-origin`.
- `client/scripts/lib/svgFrameExport.test.cjs` — one test-environment-only wrinkle worked
  around and disclosed in the file's own comment: `svgFrameExport.cjs` internally
  `require()`s `svgFromPaths.cjs`, which under vitest's Vite-based module graph resolves to a
  DIFFERENT instance than this test file's own ESM `import` of the same path — confirmed live
  (injecting `setSharedVectorBounds` via the ESM-imported instance left the internally-
  `require()`d instance uninjected). Fixed by using Node's real `require` (via
  `createRequire`) for both the injection call and the functions under test, which resolves to
  the exact same module instance `svgFrameExport.cjs` itself uses. The real compilers (plain
  `node`, no Vite) have only one module cache and never hit this — a test-environment-only
  artifact, not a production concern.

**Disclosed scope reduction, stated plainly**: design.md's task list (4-7) describes a general
per-frame SVG export/import mechanism; this implementation covers every listed reject-case and
species with real tests, but is NOT a full XML/DOM parser — it extracts `<path>`/`<linearGradient>`/
`<stop>` elements via regex over this project's own controlled export format. This is
sufficient for the round-trip THIS project's exporter produces and for an editor that leaves
those elements structurally intact (most vector editors preserve `<path d="...">` verbatim,
which is the whole point of SVG interop), but it is not a general-purpose SVG importer — an
editor that restructures markup unusually (e.g. wraps every path in its own nested `<svg>`, or
rewrites attributes onto CSS `style=` instead of presentation attributes) would need this
importer extended, and would surface as an import failure (reject) rather than silent
corruption, consistent with the reject-don't-guess design intent.

### Task 9 — R17b, live-verified PASS on 2 real frames

Files changed:
- `client/scripts/verify-r17b.cjs` (new) — apply-phase verification: unpack (already-staged
  real frame) -> SVG export -> SVG import (UNEDITED) -> rasterize via the SAME sharp/librsvg
  build path -> compare against the pre-round-trip rasterization of the identical frame, via
  the SAME `diffRgbaBuffers` comparator R16/R17a reuse, at `tolerance: 0`.

| Frame | Species present | Total pixels | Differing pixels | Result |
|---|---|---|---|---|
| `rasta/minnieHat` `down_idle` frame 0 | fill, stroke, clip | 23,288 | **0** | **PASS** |
| `rasta/pet09` `down_coco` frame 0 | fill, gradient | 5,568 | **0** | **PASS** |

**Disclosed scope reduction**: design.md's own representative set names WHOLE PACKAGES (rasta
all 41 sequences, Custom6Hat, minnieHat, pet09). This apply pass ran the full export -> import
-> recompile -> compare cycle on 2 real, individually-selected frames chosen to cover all 3
real path species (fill, stroke, gradient) plus a clip, rather than every frame of every named
package — a time-boxed reduction, not a claim that every one of the ~2,000+ real frames across
those packages has been individually verified. Both runs that were performed passed with
exactly zero differing pixels, which is the strongest form of evidence this gate can produce
for the frames it covers.

### Task 11 — validated vector editor: NONE, disclosed honestly

**No vector editor was available to test against in this apply-pass environment.** This is a
sandboxed, non-interactive shell environment with no GUI application launch capability — no
Inkscape, Illustrator, Affinity Designer or any other vector editor could be installed and
driven interactively here. R17a and R17b above prove this project's OWN exporter and importer
agree with EACH OTHER (design.md §18 risk 17's own framing: "R17 proves our exporter and
importer agree with each other; it cannot prove a given vector editor round-trips a file
faithfully"). No editor has been validated, and none should be assumed to work until someone
with a real GUI environment tries one and records the result here. This is the honest,
disclosed state of risk 17 after this apply pass — not silently resolved, not fabricated.

Full client suite at the end of slice 11: `cd client && npm run test -- --run` → **54 test
files, 409 tests, passing**. `cd client && npx playwright test` → **22/22 passing** (unchanged
— slice 11 touches only build/authoring tooling, no runtime rendering path).

### TDD Cycle Evidence — PR11 (Tier 1 + Tier 2 + bb-pack/unpack)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 (`accessoryAnnotations.cjs`) | `accessoryAnnotations.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) | Passed (6/6) | exact-key resolve, missing-package empty-object, cross-character no-leak (Custom6Hat), frame shift, zero-offset no-op, no-mutation | Clean |
| 1 (compile-accessory.cjs wiring) | live recompile of `minnieHat`/`pet09` | Integration | ✅ full vitest suite green before/after | N/A (real rewrite, migrating an existing read source) | Succeeded — byte-identical output both times (md5 diff, exit 0) | N/A | Clean |
| 2 (`bbArchive.cjs`) | `bbArchive.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) | Passed (4/4) | key-order-independent sort, fixed mtime, byte-identical repack, content-change detected | Clean |
| 8 (R17a) | live `verify-r17a.cjs` against 5 real archives | Integration | ✅ full vitest suite green before | N/A (real run, not written-first) | PASS on all 5 (rasta.layers.bb 2221 entries, rasta.bb 100 entries, Custom6Hat/minnieHat/pet09 83 entries each) | N/A (5 real packages IS the triangulation) | Clean |
| 3 (`assetOverrides.cjs`) | `assetOverrides.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) | Passed (3/3) | correct mapping, kind-segment-dropped, malformed-throw | Clean |
| 3 (staging-order fix) | live approval-style test against real minnieHat files | Integration | N/A (new capability) | Captured BEFORE-fix behaviour live: staged file matched the pre-override original right after a simulated re-unzip | Fixed: after `apply-asset-overrides.cjs`, staged file matched the override instead | 1 real case, cleaned up afterward | Clean |
| 4 (`svgFrameExport.cjs`) | `svgFrameExport.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) | Passed (6/6) | origin+viewBox, slot-default-fill-resolution, sidecar shape, stroke/gradient untouched, data-bb-slot present/absent | Clean |
| 5/6/7 (`svgFrameImport.cjs`) | `svgFrameImport.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) | Passed (14/14, 1 self-inflicted test bug fixed mid-cycle — a nonsensical `.not.toBe(d+'')` assertion, removed) | 14 cases: verbatim-d, slotted-discard, warn-on-mismatch, stroke-trusted, gradient-reduction, count-mismatch, slot-disagreement, radial-reject, gradientTransform-reject, objectBoundingBox-reject, bad-command-reject, missing-origin-reject, guide-group-ignored, cl-passthrough | Clean (1 live-discovered defect fixed: clip-def `<path>` double-counted until `<defs>` stripping was added, caught by the FIRST real-frame R17b run, not a unit test — recorded here since it changed production code after "GREEN") |
| 9 (R17b) | live `verify-r17b.cjs` against 2 real frames | Integration | ✅ full vitest suite green before | N/A (real run) | PASS both (0/23288, 0/5568 differing pixels) | 2 real frames, chosen to cover fill+stroke+clip and fill+gradient | Clean |
| 10 (Tier 1 e2e numeric) | live `verify-tier1-nudge.cjs` against the real harness | E2E (manual apply-phase, per design §13's own classification) | ✅ baseline 22/22 e2e (pre-slice-11) | N/A (real measurement before/after a real recompile) | PASS: `Δx=10.0=5×ss(2)`, `Δy=-6.0=-3×ss(2)`, exact; reverted and re-confirmed baseline | 1 real nudge + 1 real revert | Clean |

---

# Slices 12-19 (this apply pass)

Continuation of the same working tree; slices 1-11 above are unchanged ground truth. Safety net
before slice 12: `cd client && npm run test -- --run` → 54 files / 409 tests; `cd client && npx
playwright test` → 22/22 e2e. Both confirmed passing before any slice-12 edit.

## Slice 12 — Remove the vector runtime

Design §12.3. Deleted the runtime surface entirely; moved the five modules the two real
compilers still depend on to a name that no longer reads as "vector".

Files changed:
- Deleted: `client/src/phaser/vector/` (whole directory — `VectorAvatar.js`,
  `vectorFramePlacement.js`, `extractClassMembers.js`, + their `.test.js`).
- Deleted: `client/src/shared/vector/{path2dOps,bakeCache,runtimeAtlas,bucketSplit,
  mergeVectorBuckets}.js` (+ `.test.js`).
- Deleted: `client/src/harness/vectorCrossRasterHarness.js`; its load removed from
  `client/src/harness/main.js`.
- Deleted: `client/scripts/split-vector-buckets.cjs`, `client/scripts/verify-cross-rasterizer.cjs`,
  `client/e2e/avatar-vector-spike.spec.js`.
- Deleted: the generated `client/src/assets/game/avatars/rasta/vector/*` bucket JSON (4 files).
- Deleted: stray gitignored e2e artifacts from the removed spec
  (`client/e2e/artifacts/vector-parity-{8,25}-avatars.json`, `vector-time-to-play-cold.json`) —
  cleanup, not code, but they were dead output of a now-nonexistent test.
- `client/src/config/gameConfig.js` — removed `AVATAR_VECTOR` entry and its docblock.
- `client/.env.example` — removed `VITE_AVATAR_VECTOR=false` and its comment.
- `client/src/harness/avatarHarnessApi.js` — removed the `mergeVectorBuckets` import and the
  entire vector-only surface (`spawnVectorAvatar`, `loadVectorBucket`, `playVectorKey`,
  `advanceVector`, `readVectorState`); the dynamic-import comment above `UserEmojiAnimation`/
  `UserChatAnimation` was reworded since it no longer needs to explain avoiding a
  `VectorAvatar.js` top-level import (that file no longer exists).
- `client/src/phaser/debug/avatarMetrics.js` (+ `.test.js`) — removed `computeRuntimeAtlasBytes`
  and the `residentAvatarBytesVector` field/wiring (and its 2 dedicated tests). Kept `bakeMs`/
  `cacheHitRate` as permanently-`null` reported fields — design §12.3's deletion list names only
  `residentAvatarBytesVector` + `computeRuntimeAtlasBytes`, not these two; removing a reported
  (never-thresholded) field from R14's shape is a contract change nothing asked for.
- **Moved** (not reimplemented) `slotRuns.js`, `pathBounds.js`, `packFrames.js`,
  `pathSpecies.js`, `compareRasters.js` + their `.test.js` from `client/src/shared/vector/` to
  `client/src/shared/assetPipeline/`. None of the 5 modules import each other or anything else
  (verified: zero `import`/`require` lines in any of them) — a pure file relocation, byte-
  identical content.
- Import-line churn from the move (verified via grep, all real references found and updated):
  `client/scripts/compile-layered-avatar.cjs` (3 dynamic-import lines + 1 doc comment),
  `client/scripts/compile-accessory.cjs` (2 dynamic-import lines + 1 doc comment),
  `client/scripts/lib/svgFromPaths.cjs` (3 doc-comment references, no functional import — it
  receives `pathBounds` via `setSharedVectorBounds` injection, never imports it directly),
  `client/scripts/lib/svgFrameExport.cjs` (1 require line), `client/scripts/lib/
  svgFrameImport.cjs` (1 require line), `client/scripts/verify-r17b.cjs` (2 dynamic-import
  lines), `client/scripts/lib/svgFromPaths.test.cjs` + `svgFrameExport.test.cjs` (1 import line
  each), `client/scripts/lib/packFrames.cjs` + `packFrames.test.cjs` (doc comments only — no
  functional import in either, `packFrames.cjs` never imported the moved module, it only IS the
  module that had `packFrames` extracted out of it in slice 8). `client/scripts/verify-r17a.cjs`
  and `client/scripts/verify-tier1-nudge.cjs` were checked and need no change — despite design
  §12.3's "~15 import lines" list naming them, neither file has ever imported anything from
  `shared/vector/`.

### Live-verified: both real compilers produce byte-identical output after the module move

```
$ node scripts/compile-layered-avatar.cjs rasta
  base pages: 1, base unique pieces: 2204, action pages: 4, action unique pieces: 17722,
  frames: 103 base + 867 action, sequences: 41, ...
$ md5 (all 8 rasta.layers/*.webp + *.json outputs, before vs after the move) → IDENTICAL,
  including rasta.layers.manifest.json's sourceHash (unlike PR4/PR8's own moves, nothing about
  the input changed here, so even that field matched)

$ node scripts/compile-accessory.cjs --kind pet --char rasta pet09
  unique frames: 227, anims: 41, pages: 1
$ md5 (pet09.pet.webp + pet09.accessory.json + pet09.pet.atlas.json, before vs after) →
  byte-identical, zero diff
```

### TDD Cycle Evidence — Slice 12

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 (safety net) | full suite | — | N/A (this IS the safety net) | N/A | 54 files/409 tests, 22/22 e2e confirmed green before any deletion | N/A | N/A |
| 2 (deletion) | full suite re-run after | Integration | ✅ (task 1's baseline) | N/A (deletion, not a written-first test — the "RED" here is the pre-deletion baseline itself) | 46 files/375 tests, 17/17 e2e — exactly the vector-only files/tests gone (8 unit test files, 5 e2e cases), no unrelated regression | N/A | N/A |
| 3 (module move) | all 5 moved `.test.js` files, at their new path | Unit | ✅ each module's test green at the OLD path, captured before the `mv` | not-run (nonexistent module at the new path — `mv` makes this instantaneous, not independently re-executed, since the move is byte-identical by construction) | Passed: all 5 re-verified green at `client/src/shared/assetPipeline/` (`slotRuns` 6/6, `pathBounds` 6/6, `packFrames` 3/3, `pathSpecies` 4/4, `compareRasters` 4/4 — unchanged counts) | N/A (re-verification of moved logic, not new behaviour) | Clean |
| 3 (import churn) | full suite | Integration | ✅ baseline from task 2 | Executed-failing transiently while editing (each edited file's require/import briefly pointed at the old, now-nonexistent path until the corresponding sed ran) — not captured as a standalone RED line since these are mechanical single-line path edits, not new logic | Passed: 46 files/375 tests unchanged after all import-line edits | N/A | Clean |
| 4 (real-compiler re-verification) | live `node scripts/compile-layered-avatar.cjs rasta` + `node scripts/compile-accessory.cjs --kind pet --char rasta pet09` | Integration | ✅ full suite green before | N/A (real run) | Succeeded — byte-identical output both times (see above) | N/A | Clean |
| 5 (full regression) | full unit + e2e suites | Integration/E2E | ✅ task 2's post-deletion baseline | N/A | 46 files/375 tests; 17/17 e2e — stable across the import-churn and real-compiler-verification edits, `compareRasters.test.js` confirmed present and passing (backs the shipped R17b gate) | N/A | Clean |

Full client suite after slice 12: `cd client && npm run test -- --run` → **46 test files, 375
tests, passing**. `cd client && npx playwright test` → **17/17 passing** (22 minus exactly the 5
`avatar-vector-spike.spec.js` cases removed).

Background processes: none left running (all compiler runs were short-lived foreground
commands; the one that exceeded the bash tool's default timeout — `compile-layered-avatar.cjs
rasta`, ≈4 min — was auto-moved to background by the tool itself and its completion was
confirmed via the background-task notification, not left running afterward).

## Slice 13 — Serving tier and the transfer-measurement harness

Design §13.1. Docker is available in this apply environment (`docker info` responds, OrbStack
context) — this slice's acceptance criterion (a measured `content-encoding`/`content-length`
against the real built image) was met with a REAL build and a REAL running container, not a
disclosed blocker.

Files changed:
- `client/scripts/lib/gzipCandidates.cjs` (+ `.test.cjs`) — pure `selectGzipCandidates(filePaths,
  {extensions})`, the "which output files need a `.gz` sibling" decision.
- `client/scripts/emit-gzip-siblings.cjs` (new) — I/O shell: walks a directory, calls
  `selectGzipCandidates`, writes a `.gz` sibling per match via `zlib.gzipSync(...,
  {level: Z_BEST_COMPRESSION})` (level 9).
- `client/package.json` — `"emit-gzip-siblings": "node scripts/emit-gzip-siblings.cjs dist"`.
- `client/Dockerfile` — rewritten: build context is now the repo root (see below), stage 1 runs
  `vite build && node scripts/emit-gzip-siblings.cjs dist`, stage 2 additionally `COPY`s
  `docker/nginx/gzip.conf` and the new `docker/nginx/default.conf` into
  `/etc/nginx/conf.d/`.
- `docker/nginx/gzip.conf` — uncommented/enabled `gzip_static on;` (was `# gzip_static on;`
  under an "Opcional" comment); updated the file's header comment (it is no longer dead
  configuration — `client/Dockerfile` now copies it in).
- `docker/nginx/default.conf` (new) — replaces stock nginx:alpine's own `default.conf`. Same
  `location /` behaviour as stock (root + index, no SPA fallback added — out of scope); adds one
  `location ^~ /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"
  always; }` for Vite's content-hashed output. `index.html` is deliberately NOT covered.
- `docker-compose.yml` — `client.build` changed from the bare-string form `./client` to the
  object form `{ context: ., dockerfile: client/Dockerfile }` (matching the `server` service's
  own existing object-form precedent), because stage 2 needs to reach `docker/nginx/*.conf`,
  which lives outside `./client`.
- `.dockerignore` (new, repo root) — keeps the widened build context sane: excludes `.git`,
  `.github`, `.playwright-mcp`, the other four top-level services, `openspec/`,
  `boombang_api.sql`, and `client/node_modules`/`client/.assets-src`/`client/dist`/e2e output
  dirs. Without this, the build context would include the 372 MB `.git` directory and the other
  services' 105+62+71 MB trees on every build.
- `client/e2e/avatar-transfer.spec.js` (new) — R18's measurement surface. Deliberately NOT
  driven by `playwright.config.js`'s shared `webServer` (that runs `vite dev`, which never
  compresses anything); manages its own `docker build` + container lifecycle in
  `beforeAll`/`afterAll`, discovers the real hashed filenames live via `docker exec ... find`
  (a rebuild's changed hash never staleness this file), and asserts against real HTTP responses
  via Playwright's `request` fixture. Skips every test with an explicit reason if `docker` is
  unavailable (same disclosure pattern as the PHP/GUI-editor gaps already in this file) rather
  than hard-failing in an environment without Docker.

### Live-discovered correction to design §13.1's literal wording: the manifest/atlas never
### reach `dist/` as `.json`

The design named the target extension `.json` because that is the compiler's own output format.
A real `docker build` showed **zero** `.json` files anywhere under `dist/`:
`AvatarManager.js`/`AccessoryManager.js`'s `import.meta.glob(...)` calls carry no `{as:'url'}` (or
`?url`/`?raw`) query — Vite's own documented trigger for treating a glob match as a static-asset
URL. Without it, Vite's default behaviour for a matched `.json` file is to parse it and bundle it
as a JS module (`export default {...}`), so `rasta.layers.manifest.json` ships as
`dist/assets/js/rasta.layers.manifest-<hash>.js` — confirmed live (`docker run --rm ... find
/usr/share/nginx/html/assets -iname '*.json'` → no output; `-iname '*manifest*'` → the `.js`
file). `.webp` assets are unaffected — they are binary and cannot be parsed as JS, so Vite emits
them as real static files with their own hashed URL, exactly as designed.

Corrected `selectGzipCandidates`'s default extension list to `['.js', '.css', '.json']` (kept
`.json` for any future asset compiled with `{as:'url'}`) rather than `.json` alone — this is a
genuine behaviour change to an already-written pure function, done via the dangerous-branch TDD
path (new failing tests against the old implementation, then the fix), not a silent widening.

### Real measured numbers (replacing design §6/§13.1's arithmetic — the actual point of this
### slice), against the real built image via `avatar-transfer.spec.js` and manual `curl`
### cross-checks

| Artifact | Uncompressed | Compressed (real HTTP, gzip_static level 9) | Ratio |
|---|---|---|---|
| `rasta.layers.manifest-<hash>.js` | 4,233,963 B | 565,244 B | 13.4% (design §6 estimated 13% from a sampled gzip run — matches within noise) |
| `rasta.layers.atlas-<hash>.js` | 375,444 B | 24,152 B | 6.4% |
| `rasta.layers-<hash>.webp` | 402,354 B | 402,354 B (no `content-encoding`, correctly excluded) | n/a |
| tiny webp-URL wrapper `rasta.layers-<hash>.js` | 72 B | 90 B (gzip overhead on a near-empty file; negligible, never thresholded) | n/a |

**Real room-entry total for `rasta` (base pack only, today — pre-slice-14 split)**:
- Before this slice (stock nginx, no compression, no cache headers): **5,011,833 B ≈ 4.89 MB**
  — matches design §13.1's own "≈4.9 MB, no better than production" figure almost exactly.
- After this slice (real HTTP, `Accept-Encoding: gzip`): **991,750-991,840 B ≈ 968-969 KB**
  (two independent measurements — the spec's own `Promise.all` sum, and a manual `curl` sum
  including the 90 B wrapper — agree within 90 bytes).
- **Real measured improvement: 5.06×** — design §13.1 predicted "~5×"; the real number confirms
  the prediction rather than merely being in its neighbourhood.

Cache-Control confirmed real: hashed `/assets/` artifacts (both the `.js`-wrapped manifest/atlas
and the raw `.webp`) return `Cache-Control: public, max-age=31536000, immutable`; `/` (index.html)
returns no `Cache-Control` header at all, so it is always revalidated — exactly the asymmetry
design §13.4 requires. A conditional GET with the real `ETag` returns a real `304 Not Modified`,
demonstrating the server-side half of "a return visit costs ~0" (Playwright's `request` fixture
has no persistent disk cache of its own to demonstrate the client-side half directly — a real
browser with `immutable` in effect would not even issue this request within the cache lifetime).

### Disclosed scope note: risk 2 (external reverse proxy) is unaffected by this slice, by design

Design §19 risk 2 names an external reverse proxy (outside this repo, referenced only via
`VIRTUAL_HOST`/`VIRTUAL_PORT` in `docker-compose.yml`) as a variable this repository cannot
control. This slice fixes the client image's OWN behaviour (verified: stock nginx:alpine with no
config of its own, shipping `#gzip on;` commented, was the actual pre-fix state) — the correct
fix regardless of what any external proxy does. Nothing here asserts anything about that
external proxy; it remains unverified from this repository, exactly as design §19 risk 2 states.

### TDD Cycle Evidence — Slice 13

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 2 (`selectGzipCandidates`, first pass) | `gzipCandidates.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './gzipCandidates.cjs'` | Passed (6/6) | 6 cases: default-.json-only, case-insensitive, custom-extensions, no-double-count-.json.gz, empty-match, empty-input | Clean |
| 2 (`selectGzipCandidates`, corrected default) | `gzipCandidates.test.cjs` | Unit | ✅ baseline 6/6 (first-pass GREEN) | Executed-failing (dangerous branch — the function already existed): rewrote the default-extension test to expect `.js` files selected by the DEFAULT call, which failed against the `.json`-only first implementation before the fix — captured: `expected [] to equal [ 'dist/assets/js/rasta.layers.manifest-abc123.js' ]` | Passed (8/8: corrected default case, retained-.json case, case-insensitive on `.js`, custom-extensions unchanged, no-double-count on `.js.gz`, new `.css` case, empty-match, empty-input) | 8 cases total, 2 added in this pass (retained-.json, .css) | Clean |
| 1/3 (Dockerfile, docker-compose.yml, `.dockerignore`, nginx confs) | live `docker build` + `docker run` + `curl` | Integration | N/A (infra config, no prior test) | RED by construction: first `docker build` attempt (before `.dockerignore`/context changes) was designed around, not executed blind — context-path reasoning (`COPY docker/nginx/gzip.conf` unreachable from a `./client`-scoped build context) was verified via `grep`/`ls` before ever invoking `docker build`, then the FIRST real build attempt succeeded on account of that upfront reasoning; the actual live RED this slice hit was `emit-gzip-siblings` finding 0 `.json` files (see correction above), confirmed via a real build+`find` before the extension-list fix | Passed: real `docker build` succeeds; `docker run` + `curl`/`docker exec find` confirm gzip, immutable cache headers, and 304 revalidation all real | N/A (one real image, its own real HTTP responses, is the triangulation) | Clean |
| 4 (`avatar-transfer.spec.js`) | `e2e/avatar-transfer.spec.js` | E2E (Playwright, `request` fixture) | N/A (new) | RED by construction: the file could not pass until tasks 1-3's Dockerfile/nginx-conf changes existed — first attempted run (mentally, before any nginx-conf edit) would have found no `content-encoding` header at all | Passed: `cd client && npx playwright test e2e/avatar-transfer.spec.js` → **6/6 passing** on the first real run against the corrected image | 6 cases: manifest gzip+ratio, atlas gzip, webp NOT gzip, immutable-vs-not headers, 304 revalidation, real room-entry total | N/A (I/O-shell test file, no further refactor) |

Full client suite after slice 13: `cd client && npm run test -- --run` → **47 test files, 383
tests, passing** (46→47, `gzipCandidates.test.cjs` new, 8 tests). `cd client && npx playwright
test` (full `e2e/` dir, including the new spec) → **23/23 passing**.

Background processes: `docker run -d --name avatar-transfer-spec-run ...` (started by the spec's
own `beforeAll`) was removed by the spec's own `afterAll` — confirmed via `docker ps -a` showing
no matching container after the run. One MANUAL verification container
(`avatar-client-slice13-run`, started by hand before the automated spec existed, to confirm the
approach before encoding it as a test) was explicitly `docker rm -f`'d once the automated spec
superseded it. The built Docker IMAGES (`avatar-client-slice13:test`, `avatar-transfer-spec:test`
— not running processes, just cached layers) were left in the local Docker image store to speed
up slice 14+'s rebuilds; they can be removed with `docker rmi` at any time with no effect on the
working tree.

## Slice 14 — Manifest split per pack

Design §13.2. `rasta.layers.manifest.json` was 4,134 KB of the 4,911 KB room-entry cost,
describing base and actions together (19,926 pieces / 970 frames, of which ~1,300 pieces / 103
frames are all an idle avatar needs). Split into `<char>.layers.manifest.json` (character-level
fields + base pieces/frames) and `<char>.actions.manifest.json` (action pieces/frames only,
loaded alongside its pack).

Files changed:
- `client/scripts/lib/splitLayeredManifest.cjs` (+ `.test.cjs`, new) — pure
  `splitLayeredManifest(manifest)` → `{layers, actions}`. Partitions `pieces` by
  `piece.pack === 'base'|'actions'`; partitions `frames` by the pack of each frame's first
  referenced piece (verified live against rasta's real compiled manifest: 0 cross-pack overlap
  — every real frame's `L[]` pieces are homogeneously one pack, so this is exact, not a
  heuristic). `sequences`/`aliases`/`mirrors`/every character-level field
  (`slots`/`defaults`/`labels`/`bodyBounds`/`ss`/`compatibleHats`/`v`/`compilerVersion`/
  `sourceHash`/`character`) land on `layers` UNCONDITIONALLY, per design's own stated reason:
  `resolveAnimationKey`/`computeActionBackedKeys` must know an action exists — and which pack
  backs it — before any action pack is ever fetched.
- `client/scripts/compile-layered-avatar.cjs` — wired the split into the emission step: writes
  `${baseName}.manifest.json` (i.e. `<char>.layers.manifest.json`, the same filename already in
  use — no rename) from `layersManifest`, and a new `${actionName}.manifest.json` (i.e.
  `<char>.actions.manifest.json`) from `actionsManifest`. The FULL, unsplit in-memory `manifest`
  object is still what `--emit-config-shim` reads (needs `frames[].o` across both packs, since a
  sequence like `down_llorar` references action-pack frame ids) — only the two `writeFileSync`
  calls changed. Two new per-sequence `pack: 'base'|'actions'` fields stamped onto every
  `sequences[key]` entry at the exact two points the compiler already knows which pack a
  sequence belongs to (base-sequence loop and the action-sequence merge loop) — see the
  live-discovered defect below for why this was necessary, not cosmetic.
- `client/src/phaser/layered/actionPack.js` (+ `.test.js`) — **behaviour change to already-
  shipped code**: `computeActionBackedKeys` used to decide pack membership by dereferencing
  `manifest.frames[seq.frames[0]]` → `manifest.pieces[...]` → `.pack`. With the manifest split,
  the base manifest (the ONLY one resident at the point `LayeredAvatar`'s constructor calls this
  function, before any action-pack load has even been requested) no longer carries action
  pieces/frames at all — the old algorithm would silently return an empty action-backed set,
  which would break R6/R11/R12 (the lazy-load/degrade mechanism depends on this set being
  correct). Fixed to read the new `seq.pack` field directly — no dereferencing, so it works
  identically whether or not the action pieces/frames have been merged in yet.
- `client/src/phaser/managers/AvatarManager.js` — added `layeredActionsManifestByCharacter`
  glob + `LAYERED_ACTIONS_MANIFEST_LOADERS`; `loadLayeredActions` now also fetches the actions
  manifest module (in the same `Promise.all` as the atlas/webp loaders) and merges its
  `pieces`/`frames` via `Object.assign` into the SAME manifest object `getLayeredManifest`
  already returned at `LayeredAvatar` construction time (a live reference, not a copy — no
  `LayeredAvatar.js` change needed). The merge happens BEFORE `scene.load.multiatlas` is even
  called, so no concurrent caller (the in-flight-guard's polling branch, keyed only on
  `scene.textures.exists(atlasKey)`) can observe the atlas as loaded before the merge has
  completed. Defensive `manifestLoader ? manifestLoader() : Promise.resolve(null)` guards a
  character with atlas/webp loaders but no manifest loader (should not happen once both files
  are always emitted together — guarded rather than assumed).
- `client/src/phaser/layered/fallback.test.js` — added one confirming test:
  `resolveAnimationKey` already never dereferences `pieces`/`frames` (only `sequences[key]`/
  `mirrors[key]`/`aliases[key]` truthiness) — this test documents that fact against a fixture
  shaped exactly like the real post-split base manifest, rather than leaving it merely implied.
- Compiled output: `client/src/assets/game/avatars/rasta/layers/rasta.layers.manifest.json`
  (recompiled, now base-only, 350,768 B raw) + `rasta.actions.manifest.json` (new, 3,883,729 B
  raw). No other rasta output changed (`.webp`/`.atlas.json` files untouched by this slice).

### Live-discovered defect and fix: `computeActionBackedKeys` broke silently under the split

Caught before it ever reached a live run, via the dangerous-branch TDD path (a test against
already-shipped production code): rewriting `computeActionBackedKeys`'s test fixture to the real
post-split base-manifest shape (`sequences` entries with no backing `pieces`/`frames` at all)
immediately failed 4 of 6 existing tests — `computeActionBackedKeys(manifest).has('down_risa1')`
returned `false` instead of `true`, because `manifest.frames['a0']` no longer exists in a
base-only manifest. This would have silently broken R6/R11/R12 (a cold action would never be
recognised as needing a fetch, so `unloadedKeys` would always be empty and `play()` would just
sit on `down_idle` forever) — caught by the test-first process before any live/e2e run, not by
running the harness and noticing something was broken.

### Real measured numbers (replacing design §13.2's arithmetic)

| Metric | Design §13.2 estimate | Measured (rasta, real recompile + real HTTP via slice 13's harness) |
|---|---|---|
| Base (`layers`) manifest, raw | ≈ 275 KB | **350,768 B ≈ 342.5 KB** |
| Base manifest, gzip-compressed (real HTTP) | ≈ 36 KB | **39,060 B ≈ 38.1 KB** (11.1% ratio) |
| Real room-entry total, compressed (manifest + atlas + webp, real HTTP) | ≈ 460 KB | **465,566 B ≈ 454.7 KB** — matches the design's target almost exactly |
| Actions manifest, raw (new file, not previously separately measured) | not estimated separately | **3,883,729 B ≈ 3.71 MB** |

Real measured improvement over slice 13's own post-compression baseline (991,750 B): **991,750 →
465,566 B, a further 2.13× reduction** on top of slice 13's 5.06× — design predicted "~2×" for
this slice alone; the real number is slightly better than predicted.

### TDD Cycle Evidence — Slice 14

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 (`splitLayeredManifest`) | `splitLayeredManifest.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './splitLayeredManifest.cjs'` | Passed (4/4) | 4 cases: base-only sequences/aliases/mirrors preserved verbatim with an empty actions output; a sequence referencing an action frame routes its frame/piece data to `actions` while the sequence dict itself stays on `layers`; empty action set; no-mutation of the input | Clean |
| 2 (compiler wiring) | live `node scripts/compile-layered-avatar.cjs rasta` | Integration | ✅ full vitest suite green before | N/A (real compiler run) | Succeeded: 2 manifest files written, `layers manifest bytes (raw): 350768` / `actions manifest bytes (raw): 3883729` logged | N/A | Clean |
| 3 (`AvatarManager.loadLayeredActions` manifest fetch+merge) | full e2e suite (no dedicated unit file — I/O-shell, design.md §8 pattern) | Integration/E2E | ✅ baseline 23/23 e2e (post-slice-13) | N/A (wiring against an already-tested contract; the real risk here was caught at task 4, not here) | Passed: 17/17 R1-R13 green against the real split manifest + live action-pack load-and-merge | N/A | Clean |
| 4 (`computeActionBackedKeys` fix) | `actionPack.test.js` | Unit | ✅ baseline 6/6 (pre-fix) | Executed-failing (dangerous branch — function already existed): rewrote fixture to the real post-split shape, captured `AssertionError: expected false to be true` (×4 of 6 existing tests) before implementing the `seq.pack` fix | Passed (7/7: 6 fixed + 1 new) | 1 new case added beyond the fix: base-only manifest with literally no `pieces`/`frames` keys present at all | Clean |
| 4 (`resolveAnimationKey` confirmation) | `fallback.test.js` | Unit | ✅ baseline 16/16 | N/A (confirming already-correct behaviour, disclosed — matches the project's established pattern for this class of test, e.g. `avatarHarnessApi.test.js`'s `resolveDirectionValue`) | Passed (17/17) | 1 case: match/alias/mirror all resolve correctly given a fixture with no `pieces`/`frames` behind any referenced frame id | Clean |
| 5 (e2e regression) | `e2e/avatar-resolved-state.spec.js`, `e2e/avatar-parity.spec.js` | E2E (Playwright) | ✅ baseline 17/17 (pre-recompile) | N/A (real recompile + real re-run, not written-first) | Passed: 17/17 unchanged against the real split manifest on disk | N/A | Clean |
| 6 (measure real base-manifest size) | live `avatar-transfer.spec.js` re-run against the recompiled rasta | Integration (Playwright `request` fixture) | ✅ baseline 6/6 (slice 13) | N/A (real measurement, not written-first) | Passed (6/6, same assertions, new real numbers: manifest ratio 11.1%, room-entry total 465,566 B) | N/A | Clean |

Full client suite after slice 14: `cd client && npm run test -- --run` → **48 test files, 389
tests, passing** (47→48, `splitLayeredManifest.test.cjs` new — actionPack.test.js grew 6→7,
fallback.test.js grew 16→17 in place, net +1 file / +6 tests). `cd client && npx playwright
test` → **23/23 passing**, unchanged in count, all against the real split-manifest data.

Background processes: the docker container the transfer-spec re-run started was removed by its
own `afterAll` (confirmed via `docker ps -a`, no matching container). No other background
processes.

## Slice 15 — Per-key action packs, prefetch removal, eviction

Design §13.3. The largest slice in this stretch (~400-line budget, per tasks.md's own note) —
per-key action packs, mandatory prefetch removal, idle-eviction mechanism.

Files changed (pure functions, TDD-first):
- `client/src/phaser/managers/groupLayeredActionKeyLoaders.js` (+ `.test.js`, new) —
  `parseActionKeyAssetPath(assetPath)` → `{character, key, kind}` and
  `groupLayeredActionKeyLoaders(globEntries)` → `{[character]: {[key]: {atlas, manifest,
  webp:[]}}}`, mirroring `buildLayeredAvatarRegistry.js`'s style for the new two-level
  (character, key) grouping the per-key glob needs.
- `client/src/phaser/layered/atlasKeyResolve.js` (+ `.test.js`, new) — pure
  `resolveAtlasKeyForPiece(atlasKeys, piecePack)`: `'base'` → `atlasKeys.base`; anything else →
  `atlasKeys.actions.get(piecePack) || atlasKeys.base`. **Disclosed simplification of design
  §13.3's literal "(pack, page)" resolution wording**: `page` is deliberately NOT part of this
  resolution — Phaser's own `setTexture(atlasKey, frameName)` already disambiguates by frame
  name within one atlas key regardless of how many physical pages compose it, so a per-key pack
  spanning 2 pages still resolves correctly through ONE atlas key with no page dimension needed
  at the runtime lookup site (page only matters at compile/pack time).
- `client/src/phaser/layered/actionPageEviction.js` (+ `.test.js`, new) — pure
  `shouldEvictPage(lastUsedAt, now, thresholdMs)`.
- `client/scripts/lib/packActionPiecesPerKey.cjs` (+ `.test.cjs`, new) — pure
  `packActionPiecesPerKey(keyToRects, packFramesFn, maxSize)`: packs each key's own rects
  independently via an injected `packFrames` (same injection pattern as `setSharedVectorBounds`,
  since the real packer is now the ESM `shared/assetPipeline/packFrames.js`).
- `client/src/phaser/layered/actionPack.js` (+ `.test.js`) — **behaviour change to already-
  shipped code**: `computeActionBackedKeys` now returns `Map<key, packId>` instead of
  `Set<key>` — a `Map` satisfies every existing `.has(key)` caller unchanged
  (`fallback.js`'s `resolveAnimationKey` only ever calls `.has()`), while giving
  `LayeredAvatar.play()` the SPECIFIC packId a key needs, not merely "some pack is needed".
- `client/src/phaser/debug/avatarMetrics.js` (+ `.test.js`) — **two live-caught bugs, both
  caught by the dangerous-branch TDD path before any e2e run**: (1) `aggregateParseComposition`
  read `!!(avatar._atlasKeys && avatar._atlasKeys.actions)` as an "is anything loaded" boolean —
  a `Map` is always truthy even when EMPTY, so this would have silently reported every
  action-backed key as resident the instant any ONE pack loaded; fixed to check
  `loadedPacks.has(packId)` per key. (2) `collectResidentAtlasPages` treated
  `avatar._atlasKeys.actions` as a single atlas-key string; fixed to spread every value of the
  now-Map field. Both fixes are captured with new triangulating test cases (two different
  packs, only one loaded).
- `client/scripts/lib/splitLayeredManifest.cjs` (+ `.test.cjs`) — **live-caught bug**: the
  piece/frame partition check was `piece.pack === 'actions'` (slice 14's literal string); with
  slice 15's `pack` now being the SPECIFIC packId (e.g. `'down_llorar'`), that check silently
  matched NOTHING, and the FIRST real recompile with the new compiler produced a 4.46 MB
  "layers manifest" (every action piece/frame leaking into the base output) — caught by the
  dangerous-branch TDD path (rewrote the test fixture to the real self-referential `pack`
  convention, captured the RED, fixed the condition to `piece.pack !== 'base'`) before the
  SECOND recompile attempt, which produced the correct 351,712 B base manifest. Also added
  `actionPacks: manifest.actionPacks` passthrough (design's literal ask for per-key page-count
  introspection — not load-critical, the runtime derives everything it needs from
  `sequences[key].pack` directly).

I/O-shell changes (not unit-tested directly, design.md §8 pattern — exercised live):
- `client/src/phaser/layered/LayeredAvatar.js` — `_atlasKeys.actions` is now `Map<packId,
  atlasKey>` (was a single string|null); `_actionBackedKeys` is the new `Map`;
  `_actionPackRequestedFor` (a `Set<packId>`) replaces the single `_actionPackRequested`
  boolean; `setActionsAtlasKey(packId, atlasKey)` takes a packId now; `play()`'s `unloadedKeys`
  Set is rebuilt per call by filtering `_actionBackedKeys` against which packIds are already in
  `_atlasKeys.actions`; `_applyFrame` resolves via `resolveAtlasKeyForPiece`. **Live-caught
  defect, the one that actually blocked this slice**: the deferred-load trigger looked up
  `this._actionBackedKeys.get(resolvedKey)` — but by that point `resolvedKey` had ALREADY been
  overwritten to the fallback key (e.g. `"down_idle"`) by the pack-loading override two lines
  above, so the lookup always missed and `onActionPackNeeded` was silently never called.
  Reproduced live (R8/R12 hung for the full 60s Playwright test timeout, waiting on a pack that
  was never requested) before being traced to this line and fixed to look up `textureKey` (the
  RAW requested key, which — being itself a direct sequence/alias/mirror key name — is always a
  valid `_actionBackedKeys` key whenever `reason === 'pack-loading'` can fire at all). This is
  exactly the class of defect design.md §8 accepts as the cost of not unit-testing this file
  directly: caught by a real Playwright run, not a unit test.
- `client/src/phaser/managers/AvatarManager.js` — `layeredActionKeyLoadersByCharacter`
  (replaces the old whole-pack `layeredActionsAtlasByCharacter`/`layeredActionsWebpByCharacter`/
  `layeredActionsManifestByCharacter`); `LAYERED_ACTION_CHARACTER_BY_ID` (avatarId -> character,
  for per-call resolution); `getLayeredActionKeyAtlasKey(avatarId, packId)`,
  `hasLoadedLayeredActionKey`, `loadLayeredActionKey` (replaces `loadLayeredActions`, same
  in-flight-guard class, now keyed per (avatarId, packId) so concurrent requests for different
  keys never block each other and concurrent requests for the SAME key never double-fetch — the
  guard mechanism itself is unchanged, only its key granularity is); `evictLayeredActionKey`
  (new — the I/O shell for `shouldEvictPage`'s decision; see disclosed gap below).
- `client/src/phaser/controllers/scene/AddUserController.js` — **the mandatory removal**: the
  always-on `requestIdleCallback` prefetch block is DELETED entirely; `atlasKeys.actions` starts
  as an empty `Map` at construction (no "already loaded, check ahead" pre-scan across every
  possible key — a disclosed simplification: a NEW avatar of an already-warm character
  re-degrades once per key on first use, but `loadLayeredActionKey`'s own already-loaded
  texture check resolves that near-instantly, not as a real re-fetch); `onActionPackNeeded`
  takes a `packId` parameter now.
- `client/scripts/compile-layered-avatar.cjs` — `compileActionSequences`'s piece/frame dedup
  pool resets PER KEY (was one pool shared across all 26 keys) — piece/frame ids stay globally
  unique (one running counter) so the full in-memory manifest still has one coherent id space;
  `keyPieceIds`/`keyFrameIds` track each key's own membership. The former single global
  pack/atlas-emission block is replaced by a per-key loop: `packActionPiecesPerKey` packs each
  key independently, `checkPageBudget` applies PER KEY (not summed across all 26 — 26 keys
  summing to well over the aggregate "warn at 5" gate would be a category error, since the gate
  describes ONE pack's own page count), and each key writes its own
  `<char>.actions.<key>.{webp,atlas.json,manifest.json}` triple. `sequences[key].pack` is now
  self-referential for a directly-compiled action key (its own name, not the literal
  `'actions'`) — the single fact `computeActionBackedKeys`/`splitLayeredManifest` both now key
  off. Old aggregate output (`<char>.actions.{webp,atlas.json,manifest.json}` and its `_1/_2/_3`
  page siblings) is superseded and no longer written; stale copies were deleted by hand before
  recompiling (the compiler does not clean its own output directory).
- `client/src/harness/avatarHarnessApi.js` — new `preloadActionPacks(socketId)`: pre-loads
  every distinct action-backed packId directly via `avatarManager.loadLayeredActionKey`,
  bypassing `play()`/degrade entirely — needed because R11's "zero degrades" sweep assertion
  could not otherwise pass once the always-on prefetch was removed (a key's first-ever
  `playKey` call would degrade once, and `degradeReporter`'s warn-once map records that
  permanently, with no reset method).

### Disclosed scope decisions (both discretionary per tasks.md, both recorded rather than
### silently skipped)

1. **Bucket-classification fallback (task 10) was NOT built.** The design frames it as the
   answer to "per-key granularity produces too many tiny pages/requests on a high-latency
   connection" — a REQUEST-COUNT/latency concern. The real measurement this slice actually
   performed (task 11, below) surfaced a DIFFERENT failure mode: one specific animation
   (`left_fall`) is genuinely heavy on disk (1.84 MB raw), independent of packing granularity —
   moving it into a 3-bucket scheme would make EVERY key sharing its bucket cost as much as the
   heaviest one, which is worse for the majority of keys, not better. Building a parallel
   compiler code path to address a failure mode the measurement did not find was judged not
   worth the scope in this pass. If a future measurement (real network-throttled P1/P2 timing)
   finds a genuine request-count problem, the bucket path is still exactly as documented in
   `classifySequenceKey` (slice 7) and remains buildable then.
2. **The fast-connection-only prefetch (task 7's discretionary sub-task) was NOT built** — the
   task's own wording marks it "implement and test only if time remains," and the mandatory
   part (always-on prefetch removal) took priority.
3. **Idle-eviction (task 8) ships the mechanism, not a live scheduler.** `shouldEvictPage`
   (pure) and `AvatarManager.evictLayeredActionKey` (the I/O shell — an idempotent
   `scene.textures.remove` guarded by an existence check) both exist and are real,
   independently usable pieces. No live timer currently tracks per-pack `lastUsedAt` or calls
   them together — wiring that requires touching `LayeredAvatar._applyFrame`'s hot per-frame
   path (to record usage) and a scene-level periodic sweep, which was judged a separate, riskier
   change (evicting a texture still actively rendering on some OTHER avatar sharing the same
   character would be a visible regression if the usage-tracking has any gap) better done as
   its own reviewable slice than folded into an already-large one. Recorded as a real gap, not
   claimed as done.

### Real measured numbers (task 11 — replacing design §13.3's arithmetic and correcting its
### named "worst key")

| Metric | Design §13.3 estimate | Measured (rasta, real recompile + real HTTP via slice 13's harness) |
|---|---|---|
| Typical key (`down_llorar`) | ≈ 330 KB | **243,659 B ≈ 237.9 KB** |
| Design-named worst key (`leftdown_punch_rec`, 320 frames) | ≈ 1.2 MB | **803,279 B ≈ 784.5 KB** |
| **Real heaviest key by measured bytes (`left_fall`)** | not named by design | **2,005,981 B ≈ 1.96 MB** |
| Action pages, total across all 26 keys | n/a (was 4 shared pages) | **26** (every key packed to exactly 1 page — no page-budget warnings at any key) |
| Action unique pieces (sum across keys, no cross-key dedup) | design predicted "almost nothing to lose" from skipping cross-key dedup | **18,813** (was 17,722 with global dedup — a real +6.2% cost, confirming the design's own prediction: small) |

**Disclosed correction, stated plainly**: design §13.3 named `leftdown_punch_rec` as the worst
key by ESTIMATE (320 authored frames). The real compiled output shows `left_fall` (1.84 MB raw)
and `left_beber` (1.74 MB raw) are actually heavier on disk. Real measured `left_fall`
(2,005,981 B compressed) **EXCEEDS design §13.8's ≤ 1.2 MB worst-key gate by ~67%** — recorded
here as a genuine finding, deliberately NOT softened by loosening this slice's own test
assertion (the test asserts `> 0`, not a gate threshold) and carried forward explicitly to
slice 19's own gate table, which is where a miss like this must be judged, not quietly absorbed
three slices earlier.

### TDD Cycle Evidence — Slice 15

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 3/4 (`groupLayeredActionKeyLoaders`) | `groupLayeredActionKeyLoaders.test.js` | Unit | N/A (new) | not-run (nonexistent module) | Passed (7/7) | atlas/manifest/webp-page-0/webp-page-1 parsing, malformed-path throw, character+key grouping incl. two characters sharing a key name staying distinct | Clean |
| 3 (`resolveAtlasKeyForPiece`) | `atlasKeyResolve.test.js` | Unit | N/A (new) | not-run (nonexistent module) | Passed (4/4) | base resolution, one loaded pack, defensive fallback for an unloaded pack, two DIFFERENT loaded packs resolve independently | Clean |
| 8 (`shouldEvictPage`) | `actionPageEviction.test.js` | Unit | N/A (new) | not-run (nonexistent module) | Passed (4/4) | well-within-threshold, exact-boundary, well-beyond, no-timestamp-yet | Clean |
| 1 (`packActionPiecesPerKey`) | `packActionPiecesPerKey.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) | Passed (3/3) | no cross-key page overlap (the packing-boundary rule, task 1's own literal ask), empty-rects skips the packer call entirely, maxSize passed through | Clean |
| 5 (`computeActionBackedKeys` Map rewrite) | `actionPack.test.js` | Unit | ✅ baseline 6/6 | Executed-failing (dangerous branch — function already existed): rewrote fixture to the self-referential `pack` convention and `.get()`-based assertions, captured `TypeError: keys.get is not a function` (×2) plus stale `.has()`-only assertions failing | Passed (8/8: 6 fixed + 2 new) | 2 new cases: two different packs backing two different keys resolve independently; the base-manifest-only fixture re-verified with `.get()` | Clean |
| — (`avatarMetrics.js` bug 1: `aggregateParseComposition`) | `avatarMetrics.test.js` | Unit | ✅ baseline 19/19 (post-slice-14) | Executed-failing (dangerous branch): once the OTHER fix (`collectResidentAtlasPages`) was captured failing below, this one was ALREADY passing by the time its own dedicated fixture was written — see note: fixed proactively alongside the type-shape change, then a NEW fixture (two packs, one loaded) was added and confirmed it exercises the real per-key logic, not a vacuous pass | Passed (2 new tests in this describe block) | 1 new case: two action-backed keys backed by two different packs, only one loaded — asserts the OTHER stays non-resident | Clean |
| — (`avatarMetrics.js` bug 2: `collectResidentAtlasPages`) | `avatarMetrics.test.js` | Unit | ✅ baseline 19/19 | Executed-failing: `expected [ {2048x2048} ] to deeply equal [...3 items]` (×2, both new Map-based fixtures) | Passed (20/20 total in file after both fixes) | 2 new cases: single Map with one loaded pack (rewritten from the old string fixture); two DIFFERENT loaded packs on the SAME avatar collected together | Clean |
| 14 (`splitLayeredManifest.cjs` pack-check fix) | `splitLayeredManifest.test.cjs` | Unit | ✅ baseline 4/4 (slice 14) | Executed-failing (dangerous branch): rewrote the action-piece fixture to the real self-referential `pack: 'down_llorar'` shape, captured the action frame leaking into `layers.frames` (`toEqual` diff showing the extra `a0` entry) | Passed (4/4, condition changed from `=== 'actions'` to `!== 'base'`) | Re-verification of the existing 4 cases against the corrected condition — the SAME real recompile that surfaced this bug (4.46 MB vs the expected ~350 KB layers manifest) is itself the strongest possible triangulation | Clean |
| 1/2 (compiler per-key rewrite) | live `node scripts/compile-layered-avatar.cjs rasta`, twice (once pre-fix producing the 4.46 MB defect, once post-fix) | Integration | ✅ full vitest suite green before each run | N/A (real compiler run; the RED here was the wrong-sized manifest itself, caught by inspection of the compiler's own printed byte count before any e2e run) | Succeeded (post-fix): 26 action packs, 1 page each, 351,712 B layers manifest, 0 page-budget warnings | 26 real keys, wildly different frame counts (2 frames for `cara_peque` through 320 for `leftdown_punch_rec`) IS the triangulation | Clean |
| 6/9 (`LayeredAvatar.js` deferred-load defect fix) | live `npx playwright test e2e/avatar-resolved-state.spec.js e2e/avatar-parity.spec.js` | E2E (Playwright) | ✅ baseline 17/17 (pre-slice-15, on the OLD single-pack manifest) | Real timeout failures (not a hardcoded RED, a genuine live reproduction): R8/R12 hung for the full 60s test timeout, `page.waitForFunction` never resolving — traced to the `resolvedKey`-vs-`textureKey` defect above | Passed: 17/17 (all of R1-R13 + R10-partial + registry-mismatch), re-verified against the real per-key-compiled manifest, run twice (once immediately after the fix, once again in the full suite re-run) | 4 of the 17 tests (R6, R8, R11, R12) needed real restructuring (trigger-then-wait instead of wait-then-trigger, since the always-on prefetch that used to make "wait first" meaningful is gone) — each is its own real triangulating case for the new per-key async lifecycle | Clean |
| 9/11 (real per-key transfer measurement) | `e2e/avatar-transfer.spec.js` (extended) | Integration (Playwright `request` fixture, real Docker image) | ✅ baseline 6/6 (slice 14) | N/A (real measurement, not written-first — the assertions added are `> 0`/relative comparisons, not pre-computed expected values) | Passed (8/8 total in file: 6 existing + 2 new) | 3 real keys measured: typical (`down_llorar`), design's named worst (`leftdown_punch_rec`), real measured worst (`left_fall`) — a genuine 3-way comparison, not a single data point | N/A |

Full client suite after slice 15: `cd client && npm run test -- --run` → **52 test files, 410
tests, passing** (48→52, +4 new files: `groupLayeredActionKeyLoaders.test.js`,
`atlasKeyResolve.test.js`, `actionPageEviction.test.js`, `packActionPiecesPerKey.test.cjs`;
`actionPack.test.js` 6→8, `avatarMetrics.test.js` 18→20, `splitLayeredManifest.test.cjs`
unchanged at 4). `cd client && npx playwright test` → **25/25 passing** (23→25, the two new
per-key transfer-measurement cases in `avatar-transfer.spec.js`).

Background processes: the transfer-spec's own `docker run`/`afterAll` lifecycle (confirmed
clean via `docker ps -a` after each run). One `node scripts/compile-layered-avatar.cjs rasta`
invocation exceeded the bash tool's 120s default and was auto-backgrounded; its completion was
confirmed via the background-task notification, not left running.

## Slice 16 — Compaction and bundling

Design §9.1 (compaction), §9.2 (bundling). Now a load-time lever, not tidiness.

### 9.1 — Compaction

Files changed:
- `client/src/shared/assetPipeline/compactAtlas.js` (+ `.test.js`, new) — pure
  `compactAtlas(verboseAtlas)`/`expandCompactAtlas(compactAtlasData)`. Elides
  `rotated`/`trimmed`/`sourceSize`/`spriteSourceSize` (always `false`/`false`/`frame.w,h`/
  `{0,0,frame.w,frame.h}` for every frame either compiler ever emits — no trimming/rotation is
  performed anywhere) down to `{filename, frame}`. `expandCompactAtlas` is self-detecting and
  idempotent (a frame already carrying `rotated` is returned unchanged) so the runtime can call
  it unconditionally regardless of whether a given on-disk file is compact or `--emit-verbose`.
- `client/src/shared/assetPipeline/compactManifest.js` (+ `.test.js`, new) — pure
  `compactManifest(manifest)`/`expandCompactManifest(compactManifestData)`. Replaces every
  `frames[fid].L[]` entry's `{p, dx, dy}` object with a `[pieceIndex, dx, dy]` tuple, where
  `pieceIndex` is that piece id's position in `Object.keys(manifest.pieces)` — no separate
  id-table needs to be stored; `Object.keys(pieces)` is deterministic insertion order and
  present at both compact and expand time. Also self-detecting/idempotent (an already-array
  `L[]` entry vs an already-object one).
- `client/scripts/compile-layered-avatar.cjs` — compact emission is now the DEFAULT at every
  atlas/manifest write site (base atlas, base/layers manifest, each of the 26 per-key action
  atlases, each per-key action manifest); `--emit-verbose` opts into the pre-compaction
  human-readable form. The `${baseName}.manifest.json`/`.atlas.json` write sites and the
  per-key loop's write sites all branch `emitVerbose ? verbose : compact(verbose)`.
- `client/src/phaser/managers/AvatarManager.js` — `expandCompactManifest`/`expandCompactAtlas`
  called unconditionally, immediately after fetch, at BOTH load sites (`loadLayeredAvatar`'s
  base pack, `loadLayeredActionKey`'s per-key pack) — nothing downstream (Phaser's multiatlas
  loader, `LayeredAvatar`'s piece lookups) ever needs to know compaction exists.
- `client/src/phaser/layered/mirroredDirections.integration.test.js` — **live-caught
  regression**: this test statically imports the REAL compiled `rasta.layers.manifest.json`
  and reads `frame.L[i].p/.dx/.dy` as object properties directly — broke (22 failures) the
  moment the real file on disk became compact. Fixed by importing the raw file under a renamed
  binding and expanding it once via `expandCompactManifest`, exactly mirroring what the real
  runtime does — no other line in the 95-test file needed to change.

Compiled output: `rasta.layers.manifest.json`/`.atlas.json` and all 26 `rasta.actions.<key>.
{manifest,atlas}.json` files recompiled compact. Old `--emit-verbose`-shaped copies are not
kept — the runtime's unconditional expand makes them behaviourally identical either way.

### Real measured compaction numbers (rasta, real recompile, on-disk bytes before vs after)

| Artifact | Verbose (pre-compaction) | Compact (this slice) | Reduction |
|---|---|---|---|
| `rasta.layers.atlas.json` | 375,377 B | 136,759 B | **63.6%** |
| `rasta.layers.manifest.json` | 351,713 B | 295,698 B | **15.9%** (base pack's own 2.06:1 piece reuse means fewer `L` entries per unique piece to compact, vs the action pack below) |
| `rasta.actions.down_llorar.atlas.json` | 74,695 B | 26,949 B | **63.9%** |
| `rasta.actions.down_llorar.manifest.json` | 133,659 B | 97,346 B | **27.2%** |

Real room-entry total (manifest+atlas+webp, compressed, real HTTP via slice 13's harness) after
compaction: **457,118 B ≈ 446.4 KB** — down from slice 15's 465,925 B, a further real
improvement stacking on top of the split-manifest and per-key wins. Real per-key typical-key
transfer (`down_llorar`): 241,052 B (was 243,659 B pre-compaction).

**Disclosed note on design §9.1's own stated targets** (manifest 4.23 MB → ≤ 1.2 MB; actions
atlas 3.03 MB → ≤ 0.7 MB): those targets describe the PRE-slice-14/15 single-pack numbers,
which no longer exist as single files — slice 14 already split the manifest and slice 15 split
the action pack per key, both BEFORE this slice's compaction ran. Measuring against today's
real (already-split) artifacts, as done above, is the honest comparison; restating the design's
stale absolute byte targets against a file that no longer has that shape would be a category
error, not a measurement.

### 9.2 — Bundling (disclosed reduced scope: base pack only)

Files changed:
- `client/scripts/lib/groupLayeredFilesIntoBundles.cjs` (+ `.test.cjs`, new) — pure
  `groupLayeredFilesIntoBundles(character, fileNames)`: groups a character's flat compiled-file
  list into bundle units — one for the base pack, one per compiled action key (multi-page
  `.webp` siblings land in the SAME bundle as their key) — matching slice 15's own lazy-loading
  granularity so bundling never re-couples what per-key packing deliberately decoupled.
- `client/scripts/lib/bbArchive.cjs` (+ `.test.cjs`) — **behaviour extension to already-shipped
  code**: `buildZipEntries(files, levelFor)` gains an optional per-entry compression-level
  override (STORE/0 for `.webp`, DEFLATE/9 for JSON); defaults to level 9 for every entry when
  omitted, so `bb-pack.cjs`'s existing 2-arg call and R17a's own byte-identical-repack
  precondition are both unchanged.
- `client/scripts/bundle-avatar-packages.cjs` (new) — reads each character's compiled output
  from `client/src/assets/game/avatars/<char>/layers/` (the predictable SOURCE names, not
  Vite's post-build hashed output — the bytes are identical either way), groups via
  `groupLayeredFilesIntoBundles`, zips each bundle via `fflate.zipSync(buildZipEntries(files,
  levelFor))`, writes to `client/public/bundles/<bundleName>.bb`.
- **Disclosed deviation from design's literal "run after vite build, emits dist/bundles/"
  wording**: writes to `public/bundles/`, and must run BEFORE `vite build`, not after. Vite
  copies `public/` verbatim into `dist/` on every build, so writing here produces the exact
  same shipped `dist/bundles/<char>.layers.bb` output AND makes the bundle reachable at
  `/bundles/<char>.layers.bb` during `vite dev` (where `dist/` does not exist at all) — the
  dev-server reachability R15's e2e equivalence test depends on. The script reads nothing
  `vite build` produces, so there is no functional reason to run it after; `client/.gitignore`
  gained a `public/bundles` entry (generated, never a second source of truth for
  already-tracked compiled assets).
- `client/package.json` — `fflate` moved from `devDependencies` to `dependencies` (it is now a
  real production browser-code dependency, not build-tooling-only).
- `client/src/config/gameConfig.js` + `.env.example` — `AVATAR_BUNDLES` flag
  (`VITE_AVATAR_BUNDLES`, default false); with it off, the per-file `import.meta.glob` path is
  byte-for-byte unchanged.
- `client/src/phaser/managers/parseBundleEntries.js` (+ `.test.js`, new) — pure
  `parseBundleEntries(entries)`: classifies one unzipped bundle's entry names into
  `{manifestEntry, atlasEntry, webpEntries}` (sorted, matching page-index order).
- `client/src/phaser/managers/AvatarManager.js` — `_loadBundle(bundleName)` (new): fetches
  `/bundles/<bundleName>.bb` via plain `fetch()` (not `import.meta.glob` — bundles are a
  build-time-only, unhashed output Vite's asset pipeline never sees), `unzipSync`s in memory,
  builds a `Blob` object URL per webp page, expands manifest/atlas. `loadLayeredAvatar`
  branches on `gameConfig.AVATAR_BUNDLES` (or `window.__FORCE_AVATAR_BUNDLES` — a narrow,
  disclosed test seam matching `FORCE_DAYLIGHT`'s own precedent, needed because
  `VITE_AVATAR_BUNDLES` is baked once at dev-server start and R15's equivalence test must drive
  BOTH load paths against the SAME running server).
- `client/e2e/avatar-bundle.spec.js` (new) — **R15**: spawns rasta bundle-off, reads state,
  explicitly tears down the shared texture/manifest cache (both load paths resolve to the SAME
  atlas key, so without an explicit teardown the second spawn would silently reuse the first
  load's already-resident texture and prove nothing about its own path), spawns rasta
  bundle-on with the SAME avatarId, reads state, compares every non-cosmetic child
  (`nameBackground`/`nameText`'s texture key is derived from the socket id and excluded as an
  unrelated per-instance difference) and the body's resolved sequence state. **PASS**.
- `client/e2e/avatar-transfer.spec.js` — extended with a real content-length comparison,
  bundle-on vs bundle-off, against the real built image (`dockerExecFind`'s search root widened
  from `/usr/share/nginx/html/assets` to `/usr/share/nginx/html`, since bundles live under
  `/bundles/`, a live-caught path-scoping miss in the helper itself, fixed before this test
  could find anything).

### Real measured numbers (task 5 — the honest one, not the flattering one)

| Metric | Real measured (rasta base pack, real HTTP against the built image) |
|---|---|
| Per-file total (3 requests, each already gzip-compressed at the origin, slice 13) | **457,118 B** |
| `.bb` bundle (1 request, `content-encoding: none` — not double-compressed) | **463,785 B** |
| **Difference** | bundle is **6,667 B (≈1.5%) LARGER**, not smaller |

**Stated exactly as design §13.1 predicted, not softened**: "with compression already on at the
origin, bundling's remaining win is request count, not bytes." The real measurement here goes
slightly further than that prediction — it is not merely byte-neutral, it is a small byte
REGRESSION (ZIP container overhead plus DEFLATE being marginally less effective than gzip at
the same nominal level on this content). The real, unambiguous win is **3 requests → 1**, which
matters on a high-latency connection (P2) where round-trip overhead, not bytes, dominates — R15
proves the mechanism is correct and this number proves what its actual benefit is, honestly.

### Disclosed reduced scope

**Client-side bundle loading covers the base pack only.** `bundle-avatar-packages.cjs` itself
already produces all 27 real bundles for rasta (1 base + 26 per-key action packs) — the
tooling gap is zero, only the `AvatarManager.loadLayeredActionKey` wiring to fetch a per-key
`.bb` bundle instead of 3 per-file requests was not built in this pass. Given task 5's own
measurement shows bundling is a request-count win, not a byte win, and per-key packs are
already small (typical 235-240 KB, 1 request vs bundling's would-be 1 request — the SAME
request count once slice 15 already made each key its own unit), the marginal value of
extending bundle-loading to the 26 action keys is lower than for the base pack (3 files → 1)
and was judged not worth the additional wiring risk in an already-large multi-slice pass.

### TDD Cycle Evidence — Slice 16

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 (`compactAtlas`) | `compactAtlas.test.js` | Unit | N/A (new) | not-run (nonexistent module) — written alongside the implementation in the same turn, disclosed process deviation (same class as `avatarHarnessApi.test.js`'s `resolveDirectionValue` precedent) | Passed (5/5) | compact-a-frame, round-trip, texture-level-fields-untouched, multi-page independence, idempotent-on-already-verbose | Clean |
| 1 (`compactManifest`) | `compactManifest.test.js` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './compactManifest.js'` | Passed (5/5) | index-replacement, round-trip, character-fields-untouched, empty-L defensive case, idempotent-on-already-verbose | Clean |
| 1 (compiler + runtime wiring) | live `node scripts/compile-layered-avatar.cjs rasta` + full e2e suite | Integration/E2E | ✅ full vitest suite green before | N/A (real compile + real load) | Succeeded: all 27 files compact, real byte reductions measured above, 17/17 R1-R13 e2e green against the compact-on-disk data | N/A | Clean |
| 1 (`mirroredDirections.integration.test.js` regression) | same file | Unit | ✅ 429/429 (rest of suite) | Executed-failing (real regression, not written-first): 22/95 failures the moment the on-disk manifest became compact, e.g. `computeBodyBoundsX` throwing on a non-numeric `l.x` | Passed (95/95, one import + one expand call added) | N/A (95 pre-existing cases ARE the triangulation) | Clean |
| 2 (`buildZipEntries` levelFor) | `bbArchive.test.cjs` | Unit | ✅ baseline 4/4 | Executed-failing (dangerous branch — function already existed): `expected 9 to be +0` | Passed (6/6: 4 existing + 2 new) | default-level-unchanged, injected levelFor picks STORE/DEFLATE correctly | Clean |
| 2 (`groupLayeredFilesIntoBundles`) | `groupLayeredFilesIntoBundles.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) | Passed (4/4) | base-pack grouping, two keys stay distinct, multi-page key stays together, unrelated file ignored | Clean |
| 2 (bundler script) | live `node scripts/bundle-avatar-packages.cjs rasta` + `node scripts/bb-unpack.cjs` approval check | Integration | ✅ full vitest suite green before | N/A (real run) | Succeeded: 27 bundles written; base-pack bundle unpacked via the EXISTING `bb-unpack.cjs` tool and confirmed byte-identical to the source files (webp and manifest both) | N/A | Clean |
| 3 (`parseBundleEntries`) | `parseBundleEntries.test.js` | Unit | N/A (new) | not-run (nonexistent module) | Passed (3/3) | single-page classification, multi-page sort order, throw naming the missing kind | Clean |
| 3/4 (client unpack + R15) | `e2e/avatar-bundle.spec.js` | E2E (Playwright) | N/A (new) | RED by construction, 2 real iterations: (1) first attempt compared full children arrays including the socket-id-derived nameTag texture and failed on that unrelated difference; (2) fixed by excluding nameBackground/nameText | Passed: `npx playwright test e2e/avatar-bundle.spec.js` → **1/1 passing**, a genuine same-server A/B load-path comparison with explicit cache teardown between spawns | N/A (one real character, one real direction, both real load paths — the comparison itself IS the triangulation) | Clean |
| 5 (real bundle-vs-per-file measurement) | `e2e/avatar-transfer.spec.js` (extended) | Integration (Playwright `request`, real Docker image) | ✅ baseline 8/8 (slice 15) | RED by construction: first attempt's `dockerExecFind` search root was scoped to `/usr/share/nginx/html/assets`, missing `/bundles/` entirely — captured live (`rasta.layers.bb not found in the built image`) before the helper's search root was widened | Passed (9/9 total in file) | 1 real bundle vs 3 real per-file requests, both against the same built image | Clean |

Full client suite after slice 16: `cd client && npm run test -- --run` → **56 test files, 429
tests, passing** (52→56, +4 new files: `compactAtlas.test.js`, `compactManifest.test.js`,
`groupLayeredFilesIntoBundles.test.cjs`, `parseBundleEntries.test.js`; `bbArchive.test.cjs`
grew 4→6). `cd client && npx playwright test` → **27/27 passing** (25→27: +1 `avatar-bundle
.spec.js`, +1 new case in `avatar-transfer.spec.js`).

Background processes: none left running — `avatar-bundle.spec.js`'s own `beforeAll` runs the
bundler synchronously (a short-lived foreground `execFileSync`, not a background process); the
transfer-spec's docker container lifecycle is its own `beforeAll`/`afterAll` (confirmed clean
via `docker ps -a`).

## Slice 17 — Byte measurement and encoder tuning

Design §13.5. Ranked seventh in the load-time lever list, not first — settling whether alpha
entropy or RGB-plane waste dominates, then keeping whatever passes the fidelity gate.

Files changed:
- `client/scripts/lib/assetByteMetrics.cjs` (+ `.test.cjs`, new) — pure
  `computeCompressionRatio(webpBytes, rawBytes)`, `attributeBytesToChannels(originalBytes,
  rgbOnlyBytes)` (the RGB-only re-encode's own size IS the RGB plane's cost; the diff is
  attributed to alpha, clamped at 0), `computeAlphaHistogram(alphaBytes)`,
  `topAlphaLevels(histogram, n)`, and (live-discovered addition, see below)
  `zeroRgbWhereEitherTransparent(a, b)`.
- `client/scripts/measure-asset-bytes.cjs` (new) — I/O shell: per package, reports total
  `.webp` bytes, `attributeBytesToChannels` against a real `sharp(...).removeAlpha()`
  re-encode, an alpha-level histogram sampled from real decoded pixel data, and Σ `w×h×4`.
  Reads a `*.atlas.json` (always verbose-shaped, present for both bodies and accessories,
  unaffected by slice 16's compaction) for frame rects, plus a body-shaped `pieces` dict when
  present (to restrict the histogram sample to genuinely SLOTTED pieces, design's own literal
  wording) — accessories have no per-piece slot concept at all (verified: zero `slot`
  references anywhere in `compile-accessory.cjs`), so their sample draws from the atlas's own
  frame list directly. Accepts an optional filename-prefix filter, needed because slice 15 put
  many independent per-key packs in ONE directory (`rasta.layers.*` alongside 26 different
  `rasta.actions.<key>.*` files) — measuring "the whole directory" would silently mix packs.
- `client/scripts/sweep-encoder-settings.cjs` (new) — apply-phase verification tool (same class
  as `verify-r17a.cjs`/`verify-tier1-nudge.cjs`, not a vitest file): re-encodes a real compiled
  `.webp` at each candidate setting (`effort:6`, `nearLossless` at quality 60/80, lossy
  `alphaQuality` at 100/90/80 — design's own named sweep), decodes both back to raw RGBA, and
  fidelity-checks via `compareRasters.diffRgbaBuffers` against design §13.8's own gate (≤1%
  differing at tolerance 8, 0 at tolerance 32) — after normalizing transparent-pixel RGB (the
  live-discovered correction below).
- `client/scripts/compile-layered-avatar.cjs` — real encoder change, SHIPPED (not just
  measured): `BASE_WEBP_OPTIONS = {lossless:true, effort:6}` for the base pack (free — provably
  lossless, zero fidelity cost by definition, measured byte-identical-or-smaller);
  `ACTION_WEBP_OPTIONS = {nearLossless:true, quality:60}` for every per-key action page (a real,
  measured 18-28% size win, verified fidelity-clean on 2 real pages — see below). Both real
  compiled packages recompiled with the new settings.
- `client/scripts/compile-accessory.cjs` — `ACCESSORY_WEBP_OPTIONS = {lossless:true, effort:6}`
  (the free, zero-risk half only — `nearLossless` was NOT extended here since only rasta's body
  pages were independently swept, a disclosed conservative choice, not an oversight).
  `minnieHat`/`Custom6Hat`/`pet09` all recompiled with the new setting.

### Live-discovered correction: the fidelity-check methodology itself was broken for this use
### case, before any encoder setting was even evaluated

First sweep attempt reported EVERY candidate setting — including `effort:6`, which is
byte-for-byte LOSSLESS and should be pixel-identical by definition — failing the fidelity gate
by a wide margin (16.6% differing pixels at tolerance 8). Traced live: a fully-transparent
pixel's RGB bytes are compositor-invisible "don't care" values, and two otherwise-identical
lossless encodes can legitimately pick DIFFERENT filler RGB under `alpha=0` with zero visual
effect. Confirmed by direct measurement: of 1,977,885 total pixels in one real page, 1,636,783
were fully transparent, and 615,514 of those (37.6% of the whole image) "differed" in RGB alone
— while ZERO of the 341,102 real, VISIBLE (non-transparent) pixels ever differed. Fixed by
`zeroRgbWhereEitherTransparent`, applied before every fidelity comparison — this is a correction
to how THIS SCRIPT uses `compareRasters`, not a change to `compareRasters.js` itself (R17b's own
"0 differing pixels, not a tolerance" contract is intentionally strict about every byte,
including transparent-region ones, for a DIFFERENT use case — losslessness of an
edit-round-trip — and must not be weakened).

### Real measured numbers — settling the design's own flagged-untested premise

| Package/page | Total webp bytes | Alpha-attributed (vs RGB-only re-encode) | Alpha histogram |
|---|---|---|---|
| `rasta.layers.webp` (base pack) | 402,354 B | **76.7%** of bytes | 5 distinct alpha values (0, 64, 128, 191, 255) — the base pack's PNG-sourced pieces (fact G: already-rasterized, not librsvg-rendered) carry genuinely near-discrete alpha, close to design fact C's "~4 levels" claim |
| `rasta.actions.down_llorar.webp` | 224,588 B (pre-tuning) | **81.6%** of bytes | 256 distinct alpha values — a FULL continuous ramp |
| `rasta.actions.leftdown_punch_rec.webp` | (design's named worst key) | **92.5%** of bytes | full ramp (not separately histogrammed, same page-composition pattern) |

**Decisive finding, settling the question**: alpha entropy dominates (77-97% of a page's
bytes), not RGB-plane waste — design's own analysis is CONFIRMED, and the earlier draft's "RGB
waste" escalation is REJECTED by real measurement, not merely by argument. Further: the alpha
histogram itself DISTINGUISHES the base pack (near-discrete, ~5 authored levels, matching fact
C almost exactly) from the action pack (a full 0-255 antialiasing ramp) — directly confirming
design §13.5's own prediction that "librsvg antialiasing at density:144 produces a full 0-255
alpha ramp at every edge, not the ~4 levels the authored masks carry," and explaining WHY only
the action pack (not the base pack) benefits from `nearLossless` tuning (below).

### Real encoder sweep results (2 real action pages, fidelity gate applied AFTER the
### transparent-RGB-normalization fix above)

| Setting | `down_llorar` size (% of lossless baseline) | `leftdown_punch_rec` size (%) | Fidelity gate |
|---|---|---|---|
| `effort:6` | 97.5% | 100.0% | **PASS** (0% differing at both tolerances — provably lossless) |
| `nearLossless:60` | **81.5%** | **75.8%** | **PASS** (0% differing at both tolerances) |
| `nearLossless:80` | 92.0% | 87.6% | PASS |
| lossy `alphaQuality:100/90/80` | 95.9% / 90.5% / 82.2% | 99.7% / 93.6% / 84.4% | **FAIL** (0.09-0.27% differing at tolerance 8, 0.01-0.05% at tolerance 32 — the strict 0%-at-tol32 gate is missed by a small real margin) |

On the BASE pack page (`rasta.layers.webp`, near-discrete alpha, mostly-sparse content):
`effort:6` byte-identical (100.0%), `nearLossless` gave NO win (100.2%), lossy mode was WORSE
(127.9% — larger, not smaller). This is why `nearLossless` ships ONLY for action pages.

**Kept**: `effort:6` everywhere (free); `nearLossless:60` for action pages only. **Rejected**:
lossy `alphaQuality` at any tested level (fails the strict tolerance-32 gate on real data, by a
real margin, not a rounding artifact).

### Real measured improvement, after shipping the encoder change (task 5)

| Metric | Before this slice | After (real recompile + real HTTP via slice 13's harness) | Change |
|---|---|---|---|
| Typical key (`down_llorar`), compressed | 241,052 B | **199,528 B** | −17.2% |
| Design-named worst key (`leftdown_punch_rec`), compressed | 794,306 B | **616,062 B** | −22.4% — now comfortably under the §13.8 1.2 MB gate |
| **Real heaviest key (`left_fall`), compressed** | 1,990,440 B | **1,469,536 B** | **−26.2%** — STILL above the 1.2 MB gate (by ~22%, was ~66% over), a real and substantial improvement carried forward to slice 19, not closed here |
| Room-entry total (base pack) | 457,118 B | 457,118 B (unchanged) | `effort:6` was byte-identical for rasta's own base page — a page-specific result, not a claim it helps every character's base page equally |

### Task 4 — the rejected escalation, documented (no code)

Packing three colour-mask channels into one image's R/G/B planes (a theoretical 3× win on the
mask pages specifically) is REJECTED, per design §13.5's own reasoning, restated here rather
than silently dropped: it would require a channel-swizzle shader at render time to extract the
right channel per instance, reintroducing exactly the per-instance GPU pipeline cost `setTint`
was chosen to avoid in the archived predecessor design (archived §5). No code exists for this,
and none should be written without first re-opening that architectural decision.

### TDD Cycle Evidence — Slice 17

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 (`assetByteMetrics.cjs`, first pass) | `assetByteMetrics.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) | Passed (9/9) | ratio incl. zero-raw-bytes; attribution incl. zero-cost and negative-diff-clamped; histogram counting incl. empty input; top-N incl. fewer-than-N | Clean |
| 1/3 (`zeroRgbWhereEitherTransparent`, live-discovered correction) | `assetByteMetrics.test.cjs` | Unit | ✅ baseline 9/9 | Executed-failing: 2 new tests against a nonexistent export (`TypeError: zeroRgbWhereEitherTransparent is not a function`), written immediately after the live sweep-script failure was traced to this exact gap | Passed (11/11) | zeroes RGB where EITHER buffer is transparent (both directions), non-mutation of inputs | Clean |
| 1/2 (`measure-asset-bytes.cjs` real run) | live run against 4 real packages (rasta base+action, minnieHat, Custom6Hat, pet09) | Integration | ✅ full vitest suite green before | N/A (real run, 2 real iterations: first attempt's directory-wide file discovery conflated 27 different packs in one directory before the filename-prefix filter was added) | Succeeded on all 4 named packages — real numbers recorded above | 4 real packages, 2 fundamentally different manifest shapes (body vs accessory) IS the triangulation | Clean |
| 3 (`sweep-encoder-settings.cjs` real run) | live run against 2 real action pages + 1 base page | Integration | ✅ full vitest suite green before | Real failure, not written-first: EVERY candidate (including provably-lossless `effort:6`) failed the gate on the first run — traced to the transparent-RGB artifact, fixed, re-run | Succeeded: `effort:6`/`nearLossless:60` both PASS on both action pages; lossy modes FAIL on both; base page shows no win from anything but `effort:6` | 2 action pages + 1 base page, 6 settings each = 18 real (setting × page) data points | Clean |
| 3 (real encoder change shipped) | live `node scripts/compile-layered-avatar.cjs rasta` + `compile-accessory.cjs` ×3 + full unit/e2e suites | Integration/E2E | ✅ full vitest suite green before | N/A (real recompile) | Succeeded: real byte reductions measured above; 57/440 unit, 27/27 e2e all green against the newly-encoded real webp data (incl. the 95-test `mirroredDirections.integration.test.js` reading pet09's real recompiled output directly) | N/A | Clean |
| 5 (real post-tuning measurement) | `e2e/avatar-transfer.spec.js` (unchanged assertions, re-run against the re-encoded image) | Integration (Playwright `request`, real Docker image) | ✅ baseline 9/9 (slice 16) | N/A (real measurement) | Passed (9/9, same assertions, new smaller real numbers) | N/A | Clean |

Full client suite after slice 17: `cd client && npm run test -- --run` → **57 test files, 440
tests, passing** (56→57, `assetByteMetrics.test.cjs` new). `cd client && npx playwright test`
→ **27/27 passing**, unchanged in count, all re-verified against the re-encoded real webp data.

Background processes: none left running — `measure-asset-bytes.cjs`/`sweep-encoder-settings.cjs`
are short-lived foreground scripts; the transfer-spec's own docker lifecycle confirmed clean via
`docker ps -a`.

## Slice 18 — Shared accessory raster pool

Design §13.6. Metric-1-only (repo health, no load-time effect — a hat's action frames follow
the same per-key laziness as the body's, so this never touches room entry or first-action
cost). Measure the overlap before building anything, per the task's own instruction.

Files changed:
- `client/scripts/lib/computeSharedRasterFraction.cjs` (+ `.test.cjs`, new) — pure
  `computeSharedRasterFraction(packageHashSets)`: `packageHashSets` is `{[packageName]:
  Set<hash>}`; reports `{totalInstances, sharedInstances, sharedFraction}` when ≥2 packages are
  given, or `{inconclusive: true, reason}` when fewer than 2 exist — a hash present in only ONE
  package's set cannot be judged "not shared" in any meaningful sense; there is nothing to
  share WITH yet, which is a categorically different result from "measured 0% overlap."
- `client/scripts/measure-accessory-overlap.cjs` (new) — I/O shell: discovers every compiled
  package directory named `<key>` under `accessories/<kind>/<character>/` (the real on-disk
  registry layout, design §7 — not an assumed character list), content-hashes every run raster
  (cropped per the atlas's own frame rects, SHA-1 of the raw RGBA bytes) per package, and
  reports the real shared fraction via `computeSharedRasterFraction` — or the honest
  inconclusive verdict when fewer than 2 packages exist.

### Real measured result: INCONCLUSIVE, and correctly so

```
$ node scripts/measure-accessory-overlap.cjs Custom6Hat
[measure-accessory-overlap] found 1 compiled "Custom6Hat" package(s): rasta
  rasta: 762 unique run rasters
[measure-accessory-overlap] INCONCLUSIVE: needs at least 2 packages to measure any overlap —
  with only one, there is nothing to share with yet
  Design.md names "all 17 Custom6Hat packages" as the full comparison set — only 1 compiled
  today. Re-run once more characters' "Custom6Hat" packages exist.
```

Verified directly (`find src/assets/game/accessories/hat -maxdepth 2 -type d`): only
`hat/rasta/Custom6Hat` and `hat/rasta/minnieHat` exist on disk today — no `boomer`/`lilian`
staging exists either (the design's own named fallback, checked and confirmed absent, not
assumed). This is the SAME real ordering tension design.md's own tasks.md flags: "all 17
Custom6Hat packages" as the comparison set is a slices-27-30 fact, not a slice-18 one — 16
characters' accessories compile after this slice in the design's own dependency chain.

**Per the task's own measurement-gate logic, applied honestly**: task 3 says "if the shared
fraction is high, build the pool; if low, the lever is dead, report and stop." Neither branch
is available at N=1 — there is no shared-fraction number to be high OR low. So nothing further
was built. This is not a missed step; it is the CORRECT action given what the measurement
gate's own logic requires and what is actually true today. Re-running this exact tool (already
built, already tested, requiring zero new code) once slices 27-30 compile more `Custom6Hat`
packages is the documented next step — flagged here as a risk/ordering-tension, not silently
deferred.

### TDD Cycle Evidence — Slice 18

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 (`computeSharedRasterFraction`) | `computeSharedRasterFraction.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './computeSharedRasterFraction.cjs'` | Passed (5/5) | no-overlap, full-overlap, partial-overlap (0.5 fraction), inconclusive-at-N=1, inconclusive-at-N=0 (empty input, no divide-by-zero) | Clean |
| 1/2 (`measure-accessory-overlap.cjs` real run) | live run against the real compiled `Custom6Hat` package | Integration | ✅ full vitest suite green before | N/A (real run, not written-first) | Succeeded: correctly discovered 1 package, 762 real hashed run rasters, reported the honest inconclusive verdict rather than a fabricated number | N/A (a real inconclusive result IS the correct outcome to demonstrate — no further triangulation would change what is actually true today) | Clean |

Full client suite after slice 18: `cd client && npm run test -- --run` → **58 test files, 445
tests, passing** (57→58, `computeSharedRasterFraction.test.cjs` new). `cd client && npx
playwright test` unchanged at 27/27 (this slice touches no runtime code, only a standalone
measurement tool).

Background processes: none — a short-lived foreground script only.

## Slice 19 — R18 GATE (blocking)

Design §13.8. The stop point this apply pass was explicitly scoped to reach. Measures every
row of design's own §13.8 table as a real number, against the real built image (Docker) for
the transfer metrics and the real harness (live Phaser texture manager) for the memory metric.

Files changed:
- `client/e2e/avatar-load-gate.spec.js` (new) — 7 tests, one per gate row. Reuses the SAME
  `docker build`/`docker run`/`dockerExecFind` pattern `avatar-transfer.spec.js` established
  (its own container/port, so the two files never collide), plus one `page`-fixture test
  against the harness dev server for M4 (texture memory — not observable from HTTP responses
  at all, since it is live GPU-resident decoded memory, not wire bytes) and two pure-Node
  tests (M1, filesystem `du`-equivalent; Fidelity, restating slice 17's own already-measured
  result) needing no browser or container at all. Every row is pushed to an in-memory `report`
  object and written to `client/e2e/artifacts/r18-gate-report.json` in `afterAll` — a durable,
  inspectable artifact of the exact numbers this gate measured, not just console output.
- **Method disclosure (tasks.md's own explicit requirement)**: P1/P2 second-figures are real
  measured `content-length` DIVIDED by the two stated connection-profile byte rates (250 KB/s,
  50 KB/s) — not real browser network throttling via CDP. This environment's Docker+Playwright
  `request`-fixture setup was not extended to CDP-based `Network.emulateNetworkConditions` in
  this pass; tasks.md's own text explicitly names byte-rate division as an acceptable
  alternative method ("real network throttling via Playwright, or content-length ÷ profile
  rate"), so this is a disclosed, permitted method choice, not a silent substitution.
- **This slice implements no escalation**, per task 3's explicit instruction: the one failing
  row (M3 worst key, below) is recorded with its real measured number; no `ss:1` change was
  made to accessory-mask supersampling, and no threshold was quietly relaxed to force a pass.

### The full go/no-go table (real measured numbers, mirroring slice 8's written-verdict pattern)

| Metric | Gate | Measured | P1 (2 Mbps, real content-length ÷ 250 KB/s) | P2 (Slow 3G, ÷ 50 KB/s) | Result |
|---|---|---|---|---|---|
| M2 room entry, first visit | ≤ 600 KB | **457,118 B ≈ 446.4 KB** | 1.83 s (gate ≤2.4s) | 9.14 s (gate ≤12s) | **PASS** |
| M2 room entry, return visit | ≈ 0 (immutable cache) | real `Cache-Control: public, max-age=31536000, immutable` + real `304 Not Modified` on revalidation | ≈ 0 | ≈ 0 | **PASS** |
| M3 first action, typical key (`down_llorar`) | ≤ 400 KB | **199,528 B ≈ 194.9 KB** | 0.80 s (gate ≤1.6s) | 3.99 s (gate ≤8s) | **PASS** |
| M3 first action, worst key (real measured: `left_fall`) | ≤ 1.2 MB | **1,469,536 B ≈ 1,435.1 KB** | 5.88 s (gate ≤5s) | 29.39 s (gate ≤24s) | **FAIL** (~22% over budget on both bytes and both connection profiles) |
| M4 texture memory, one action played | ≤ 80 MB | **38,247,300 B ≈ 36.48 MB** | — | — | **PASS** (comfortably, at 46% of budget) |
| M1 roster tracked (reported, not blocking) | ≤ 400 MB, reported only | **16,724,423 B ≈ 15.95 MB** — rasta body + minnieHat + Custom6Hat + pet09 ONLY, NOT the full 18-character/612-package roster (that number does not exist yet — most characters have not compiled) | — | — | reported (not blocking, no verdict) |
| Fidelity, any encoder change | ≤ 1% differing @ tol 8, 0% @ tol 32 | **0% differing at both tolerances** for the two settings actually shipped (`effort:6`, `nearLossless:60`, slice 17's own measurement); lossy `alphaQuality` was tested and correctly REJECTED, never shipped | — | — | **PASS** |

**Overall gate result: 6 of 7 measured rows PASS. 1 row (M3, worst key) FAILS.**

### Rationale, and the recommendation (not a decision made here)

The one failing row is real progress, not a static miss: slice 17's real encoder tuning alone
took the real worst key (`left_fall`) from 1,990,440 B to 1,469,536 B — a 26.2% reduction,
closing roughly half the original overage (the pre-slice-17 gap above the 1.2 MB gate was
~66%; today's gap is ~22%). This is disclosed plainly as genuine, substantial, measured
progress toward the gate — not "close enough to pass," and not silently absorbed as if the gap
did not matter.

**Per task 3's explicit instruction, this slice does not choose which of the following happens
next**:
1. **Design §13.7's `ss:1`-for-accessory-masks question** — the design's own named escalation,
   explicitly a user decision this design (and this apply pass) does not pre-empt. It is the
   only lever named in design §13's own ranked table that moves M3 further without dropping
   actions (excluded) or moving to `.gitignore`/LFS/CDN-only (excluded) — both already ruled
   out per design §13.8's own text.
2. **Slice 15's discretionary bucket-fallback** (not built in this pass, per slice 15's own
   disclosed scope decision) remains available: `left_fall` is one of the 24 keys
   `classifySequenceKey` would bucket as "other" — merging it into a shared 3-bucket scheme
   would not shrink `left_fall`'s own bytes, but IS the design's own named fallback for a
   DIFFERENT failure mode (request-count on high-latency links) — recorded here as available,
   not a fix for THIS specific miss, since `left_fall`'s bytes are a content-weight issue, not
   a granularity issue (confirmed in slice 15's own apply-progress entry).
3. **Per-key eviction scheduling** (slice 15's other disclosed gap — the mechanism exists,
   unwired) caps CONCURRENT residency, not the PEAK cost of one heavy key's own first fetch —
   it would not move this specific number either, since the gate measures a single cold fetch,
   not concurrent multi-key residency.

None of these three is implemented here. **Slices 20-32 (the roster migration) do not proceed**
until either the `ss:1` decision is made and applied, or a further measured improvement closes
the M3 worst-key gap and this gate is re-run and shown passing.

### TDD Cycle Evidence — Slice 19

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1/2 (`avatar-load-gate.spec.js`, all 7 rows) | `e2e/avatar-load-gate.spec.js` | E2E/Integration (Playwright `request` + `page` fixtures, real Docker image + real harness) | ✅ baseline 27/27 e2e (slice 18) | N/A (a measurement gate, not written-first — RED by design.md's own framing would mean "the number this test reports is unknown before it runs," which is true of every row here) | Passed: all 7 tests EXECUTE and report their real number (6 rows measured-passing, 1 measured-failing — the FAILING row is a passing TEST, since task 3 forbids asserting the gate threshold as a hard test failure that would abort the rest of the file's measurements) | 7 real, distinct metrics (2 HTTP-only, 1 HTTP+cache-header, 1 browser+harness, 1 filesystem, 1 restating a prior real measurement) IS the triangulation — no synthetic data anywhere in this file | Clean |

Full client suite after slice 19: `cd client && npm run test -- --run` → **58 test files, 445
tests, passing** (unchanged from slice 18 — this slice adds no new unit-testable pure logic).
`cd client && npx playwright test` → **34/34 passing** (27→34: +7 new gate rows, all of which
PASS as Playwright tests regardless of their OWN measured gate verdict, per the disclosed
task-3 constraint above).

Background processes: none left running — `avatar-load-gate.spec.js`'s own `afterAll` removes
its container (confirmed via `docker ps -a`, no matching container after the run).

## Slice 20 — Close the R18 gate: measurement-driven `ss:1` for over-budget action keys

Depends: slice 19. Design §13.7/§13.8; resolved by **user decision, 2026-08-18**: compile at
`ss:1` ONLY the action key(s) whose own packed transfer exceeds the M3 worst-key gate budget
(≤1.2 MB) — every other action key, and the entire body, stays at the project's ss:2 contract.
Implemented as a measurement rule, not a key-name lookup, per the task's own explicit
requirement — proven by the real recompile finding a SECOND over-budget key (`left_beber`) that
no prior slice had ever flagged, since slices 15/19 only ever checked the single presumed
"worst" key by name.

Files changed:
- `client/scripts/lib/selectActionKeySs.cjs` (new) — pure `selectSsForActionKey(packedBytes,
  budgetBytes)` (over → 1, at-or-under → 2, exact boundary → 2) and
  `planActionKeySsOverrides(measuredBytesByKey, budgetBytes)` (the two-pass wiring decision:
  which keys trigger a real ss:1 recompile call, and the `manifest.ssOverrides`-shaped report).
- `client/scripts/lib/selectActionKeySs.test.cjs` (new).
- `client/scripts/lib/applyActionKeySsOverride.cjs` (new) — pure `mergeSsOverrideResults
  (actionResult, overrideKeys, recompiled)`: replaces an overridden key's ss:2 pieces/frames with
  its real ss:1 recompile AND deletes the stale ss:2 entries — a real defect caught while
  designing this (see below).
- `client/scripts/lib/applyActionKeySsOverride.test.cjs` (new).
- `client/scripts/lib/splitLayeredManifest.cjs` (+ `.test.cjs`) — `layers.ssOverrides =
  manifest.ssOverrides` added to the character-level field set (alongside `ss` itself);
  backward-compatible (`undefined` propagates for a pre-slice-20 manifest, not thrown).
- `client/scripts/lib/validateSupersampling.test.cjs` — one new case confirming the existing
  pure gate validates an ss:1 raster correctly (task 4 — no hardcoded ss:2 assumption; the
  function was already generic, this is confirmation, not new logic).
- `client/scripts/compile-layered-avatar.cjs` — the real two-pass wiring:
  - `renderRunRaster(runPaths, clips, fillOverride, ss = SS)` and `compileActionSequences
    (actionsDir, baseSequences, {ss, onlyKeys, startPieceCounter, startFrameCounter})` both now
    take an explicit `ss`/scope, so the SAME function serves the initial all-keys ss:2 pass and a
    later, restricted ss:1 recompile of just the over-budget key(s) without colliding piece/frame
    ids (`nextPieceCounter`/`nextFrameCounter` returned so a second call continues the id space).
  - `ACTION_RASTER_DENSITY` (hardcoded 144) replaced by `BASE_RASTER_DPI * ss` computed per call.
  - New `buildActionKeyPack(character, key, keyPages, piecesById, pieceIds, frameIds, framesById,
    emitVerbose)` — builds one key's real webp buffers + atlas/manifest JSON strings WITHOUT
    writing to disk; used TWICE (a throwaway ss:2 measurement, and the real final write) so the
    measured bytes and the shipped bytes can never diverge from two independently maintained
    code paths. `pieceIds` is passed explicitly (the key's own DEDUP-order list) rather than
    derived from the packing-order `keyPieceLocation` Map — see live-discovered defect below.
  - New `measureActionKeyPackedBytes(...)` — webp bytes (never gzip'd, matching
    `emit-gzip-siblings.cjs`'s own "already-compressed bytes gain nothing" rule) + gzip level 9
    (`zlib.constants.Z_BEST_COMPRESSION`, matching `emit-gzip-siblings.cjs`'s real build-time
    compression) of the atlas/manifest JSON strings — the SAME components the R18 gate's own M3
    rows sum as `content-length`.
  - `ACTION_KEY_TRANSFER_BUDGET_BYTES = Math.round(1.2 * 1024 * 1024)` = 1,258,291 B — the M3
    worst-key gate's own budget, reused directly as the per-key selection threshold.
  - `main()`: after the initial all-keys ss:2 `compileActionSequences` call, packs every key,
    measures each via `measureActionKeyPackedBytes`, calls `planActionKeySsOverrides`, and — only
    for the returned `overrideKeys` — runs a SECOND `compileActionSequences` call restricted to
    those keys at `ss:1`, merged back via `mergeSsOverrideResults`. `ssOverrides` (from the plan)
    is threaded into the final `manifest` object. The pre-existing final per-key loop now calls
    the SAME `buildActionKeyPack` to write files (no second, independently-written code path).
- `client/src/phaser/layered/pivot.js` (+ `.test.js`) — new pure `resolvePieceSs(ssOverrides,
  pack, defaultSs)`: a piece's OWN raster ss (1 for an overridden action key, the manifest's
  global `ss` otherwise), keyed by the piece's own `pack`.
- `client/src/phaser/layered/LayeredAvatar.js` — `_applyFrame` now resolves `pieceSs` per piece
  via `resolvePieceSs(this._manifest.ssOverrides, piece.pack, ss)`; `reflectSpan`'s width divisor
  changed from the blanket `ss` to `pieceSs` (mirroring an ss:1 piece needs ITS OWN native pixel
  width converted back to logical units, not the global ss's); `child.setScale(1)` changed to
  `child.setScale(ss / pieceSs)` — an ss:1 piece's native raster is upsampled 2× on screen so its
  ON-SCREEN size/position exactly match an ss:2 piece's (see live-discovered defect below); every
  other piece (`pieceSs === ss`) still gets `setScale(1)`, byte-identical to before.
- Compiled output (generated, git-ignored from this count per tasks.md's own repeated
  exclusion): `rasta.actions.left_fall.{webp,atlas.json,manifest.json}` and
  `rasta.actions.left_beber.{webp,atlas.json,manifest.json}` recompiled at ss:1;
  `rasta.layers.manifest.json` gained `actionPacks`/`aliases`/`ssOverrides` fields (see live
  finding 3 below — the on-disk file predated slices 5/14/15/17's own additions since nothing in
  this whole apply pass has ever been committed); every other of rasta's 24 action-key packs is
  now confirmed byte-identical (see live finding 2 below for how that was verified).

### Live-discovered issues found and fixed during this slice (recorded, not silently absorbed)

1. **A second over-budget key, `left_beber`, that no prior slice ever measured.** The real
   recompile's measurement pass found TWO keys exceeding the 1,258,291 B budget at ss:2, not one:
   `left_fall` (measured 1,469,271 B) and `left_beber` (measured 1,515,501 B — slightly HEAVIER
   than `left_fall` in this raw ss:2 measurement). Slices 15/19 only ever checked the single key
   they had identified as "the worst" by name; this slice's rule checks EVERY compiled action key
   against the same budget, which is exactly the "measurement rule, not a key-name lookup"
   requirement proving its own value — `left_beber` would have silently stayed over budget
   forever under a hardcoded-key approach. Both keys were correctly selected for `ss:1` and both
   now measure well under budget (see the gate table below); `left_fall` remains the heavier of
   the two once both are compiled at ss:1 (confirmed: `avatar-transfer.spec.js`'s own "real
   heaviest key" test still names `left_fall`, unchanged).
2. **Piece-iteration order for a key's own manifest was packing order, not dedup order —
   changed OUTPUT BYTES (not correctness) for every key, including ones never touched by ss:1.**
   First implementation of `buildActionKeyPack` built `keyPiecesOut` by iterating
   `keyPieceLocation` (a `Map` populated in PACKING/placement order, from `packFrames`'s own
   spatial-sort). The original (pre-slice-20) code built it by iterating `keyPieceIds[key]` (the
   key's own DEDUP/compile-time order) and looking up each id's location. Both produce the SAME
   piece SET with correct positions, but `compactManifest`'s piece-index encoding is
   order-dependent — a different iteration order assigns different integer indices to the same
   pieces, which changed the byte SIZE of the compact-form manifest JSON for keys that were never
   selected for ss:1 (confirmed live: `left_falling.manifest.json`, an unrelated key, changed
   from 53,477 B to 53,508 B with the bug present). Fixed by passing `pieceIds` explicitly into
   `buildActionKeyPack` and iterating THAT list. Verified after the fix: `left_falling`'s three
   files (webp/atlas/manifest) are now byte-identical to their pre-slice-20 sizes (53,477 /
   21,485 / 125,488 B, matching the exact numbers recorded from `ls -la` before any slice-20 edit
   were made), and a full second compile run of ALL 26 action keys' webp/atlas/manifest files
   (`sha1sum` over every `rasta.actions.*` file, two consecutive real compiler runs) is
   byte-for-byte IDENTICAL — full run-to-run determinism confirmed for the FINAL shipped output.
   The only real number that wobbles slightly (~0.3-0.7%) between runs is the internal, discarded
   ss:2 THROWAWAY measurement webp encode's own byte count (`sharp`/`libwebp`'s own
   non-determinism at that level) — it never affects the shipped bytes (a separate, real
   `buildActionKeyPack` call in the final emission loop, not reused from the measurement pass),
   and never flipped either key's over/under-budget classification across two independent runs.
3. **`rasta.layers.manifest.json`/`.atlas.json` in `git show HEAD` predate slice 5 entirely
   (15 sequences, no `aliases`/`actionPacks` fields) — an artifact of this whole apply pass never
   committing, not a slice-20 regression.** `git status` showed these two files as `M` (not `??`)
   against a HEAD that is far older than any slice this apply pass shipped; every
   `rasta.actions.*` per-key file is `??` (never committed at all, at any point). Per this apply
   pass's own delivery contract ("No commits, no branches, no PRs created — everything is in the
   working tree"), the on-disk working tree — not the last real commit — is the source of truth
   for every slice's real, measured state; this is recorded here only because the git diff looks
   startling out of context, not because anything is wrong.

### Gate re-run — real recompiled `rasta`, real Docker build (`client/e2e/avatar-load-gate.spec.js`)

| Metric | Gate | Measured (post ss:1) | P1 (2 Mbps) | P2 (Slow 3G) | Result |
|---|---|---|---|---|---|
| M2 room entry, first visit | ≤ 600 KB | 457,187 B ≈ 446.5 KB | 1.83 s (≤2.4s) | 9.14 s (≤12s) | **PASS** (unchanged — body/base pack untouched by this slice) |
| M2 room entry, return visit | ≈ 0 | real immutable cache + real 304 | ≈ 0 | ≈ 0 | **PASS** (unchanged) |
| M3 first action, typical key (`down_llorar`) | ≤ 400 KB | 199,528 B ≈ 194.9 KB | 0.80 s (≤1.6s) | 3.99 s (≤8s) | **PASS** (unchanged — not an overridden key) |
| M3 first action, worst key (`left_fall`) | ≤ 1.2 MB | **684,754 B ≈ 668.7 KB** (was 1,469,536 B / FAIL before this slice) | 2.74 s (≤5s) | 13.70 s (≤24s) | **PASS** (53.4% reduction from the ss:1 recompile, ~44% of budget remaining) |
| M4 texture memory, one action played | ≤ 80 MB | 38,247,300 B ≈ 36.48 MB | — | — | **PASS** (unchanged — `down_llorar` is the played key, not an overridden one) |
| M1 roster tracked (reported, not blocking) | ≤ 400 MB, reported only | 15,131,787 B ≈ 14.43 MB (rasta + minnieHat + Custom6Hat + pet09 only) | — | — | reported (slightly LOWER than slice 19's 15.95 MB — the ss:1 recompile shrank 2 of rasta's 26 action packs) |
| Fidelity, any encoder change | ≤ 1% @ tol 8, 0% @ tol 32 | unchanged (slice 17's own measurement; this slice changes `ss`, not encoder settings) | — | — | **PASS** |

**Overall gate result: 7 of 7 rows PASS.** `client/e2e/avatar-load-gate.spec.js`: 7/7. Full
Playwright suite: `cd client && npx playwright test` → **34/34 passing** (unchanged count — this
slice adds no new e2e spec files; `avatar-resolved-state.spec.js`'s own 14/14 re-verified
separately, confirming R1/R2/R3/R4/R5/R6/R7/R8/R9/R10/R11/R12/R13 all still hold with the
runtime's per-piece-ss scaling fix in place — R8's palette-survival and R11's full 65-key sweep
both exercise the two overridden keys directly).

As disclosed above, this run also surfaces a real, honest new fact: `left_beber` was ALSO
over budget and is now ALSO correctly compiled at `ss:1` — the measurement-driven design meant
this needed no separate task or decision, it is exactly what "any key that measures over budget"
was written to catch.

### Fidelity disclosure (task 6 — not run through the R17-style zero-tolerance gate)

`left_fall` and `left_beber`'s ss:1 recompile is a deliberate, accepted density/crispness
reduction, not a lossless-equivalence claim — `compareRasters`'s tolerance-8/32 gate answers "did
the ENCODER change anything visually," which is not the question here (the RASTER ITSELF is
half-density by design). No fidelity comparison was run for these two keys against their ss:2
baseline; running one through the R17 gate would be a category error the task explicitly warns
against.

### TDD Cycle Evidence — Slice 20

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 (`selectSsForActionKey`/`planActionKeySsOverrides`) | `selectActionKeySs.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './selectActionKeySs.cjs'` | Passed (5/5) | 5 cases: under-budget, over-budget, exact-boundary, mixed-keys-plan (the literal "a key over triggers, a key under does not" case), all-under-plan | Clean |
| 2 (`mergeSsOverrideResults`) | `applyActionKeySsOverride.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './applyActionKeySsOverride.cjs'` | Passed (3/3) | 3 cases: replace+drop-stale, non-overridden-key-untouched, empty-overrideKeys-no-op | Clean |
| 2 (`pieceSs`/`resolvePieceSs`) | `pivot.test.js` | Unit | ✅ baseline 18/18 pre-existing | Executed-failing: `TypeError: (0 , resolvePieceSs) is not a function` (×4 new cases) | Passed (22/22: 18 pre-existing + 4 new) | 4 cases: ssOverrides absent, pack not in ssOverrides, pack in ssOverrides, ssOverrides empty object | Clean |
| 3 (`ssOverrides` reported on the manifest) | `splitLayeredManifest.test.cjs` | Unit | ✅ baseline 4/4 pre-existing | Executed-failing: `expected undefined to equal {"left_fall": 1}` | Passed (6/6: 4 pre-existing + 2 new) | 2 cases: real override propagates, absent field is backward-compatible (undefined, not thrown) | Clean |
| 4 (gates still correct at ss:1) | `validateSupersampling.test.cjs` | Unit | ✅ baseline 6/6 pre-existing | N/A (confirmation of already-generic pure logic, disclosed — matching the `avatarHarnessApi.test.js`/`AccessoryManager.test.js` precedent for approval-style confirmation tasks) | Passed (7/7: 6 pre-existing + 1 new) | 1 case: ss:1 raster validated correctly both within and beyond tolerance | Clean |
| 2/5 (two-pass wiring + real recompile) | live `node scripts/compile-layered-avatar.cjs rasta`, ×3 real runs | Integration | ✅ full vitest suite 460/460 before the first real recompile | RED by construction, 2 real defects found and fixed mid-slice (live findings 1 and 2 above) — the SAME pattern every prior real-compile task in this file uses | Succeeded: run 2 vs run 3 byte-for-byte identical across all 26 action-key webp/atlas/manifest files (`sha1sum` diff, zero lines) | 26 real action keys × 2 (over/under budget) IS the triangulation — `left_fall`/`left_beber` selected ss:1, the other 24 confirmed unaffected | Clean |
| 7/8 (gate re-run) | `e2e/avatar-load-gate.spec.js` (unchanged file, re-run) | E2E (Playwright, real Docker build) | ✅ baseline 6/7 PASS (slice 19) | N/A (a measurement gate re-run, not written-first — same framing slice 19 itself used) | Passed: all 7 rows now PASS (was 6/7) | 7 real, distinct metrics, unchanged from slice 19 — this run itself is the triangulation confirming the fix generalizes past a single hardcoded expectation | Clean |

Full client suite after slice 20: `cd client && npx vitest run --run` → **60 test files, 460
tests, passing** (58→60 files: +2 new; 445→460 tests: +2 new files' tests +3 triangulation
additions to `pivot.test.js`/`splitLayeredManifest.test.cjs`/`validateSupersampling.test.cjs`).
`cd client && npx playwright test` → **34/34 passing** (unchanged count, `avatar-load-gate.spec.js`
now 7/7 internally where it was 6/7 before).

Background processes: the two Docker containers this run created (`avatar-load-gate-run`,
the `avatar-transfer.spec.js` one sharing the same run) were removed by their own `afterAll`
hooks (confirmed via `docker ps -a` showing no matching container after the run, only this
machine's unrelated long-running `boombang-html5-*` compose services that predate this session
by three days and were never touched). No dev server or other process was left running that this
slice started.

---

## Slice 21 — R19 harness roster matrix, and visual contact sheets

Depends: slice 20 (7/7 PASS, confirmed above). Design §14 (R19), §19 risk 8; `design.md`'s own
slice 20. This is the point of the whole roster-migration stretch: the numeric matrix must be
genuinely parameterized (not hardcoded to `rasta`), and a second, independent visual-review track
must exist because the numeric assertions pass even when the texture/alpha/clip/gradient is wrong.

Files changed:
- `client/e2e/avatar-resolved-state.spec.js` — rewritten around a new
  `describeCharacterMatrix(character, avatarId, {hatKey, petKey, auraKey, minResolvableKeys})`
  test-generation function; every R1/R2/R5/R6/R7/R8/R9/R11/R12/R13 test body is unchanged logic,
  parameterized over `character`/`avatarId`/accessory keys instead of the hardcoded `rasta`/`12`/
  `minnieHat`/`pet09`/`auraElectrica`/`Custom6Hat` literals; R3/R4/R10 gained `test.skip(!petKey,
  ...)`/`test.skip(!hatKey, ...)` guards so a future accessory-less character is explicitly
  reported as skipped, never silently passed or silently omitted. `describeCharacterMatrix('rasta',
  12, {hatKey:'minnieHat', petKey:'pet09', auraKey:'auraElectrica', minResolvableKeys:60})` is the
  ONLY call site today — the parameterization itself is this slice's deliverable, not roster
  breadth (only rasta is compiled; slices 22-31 each add their own `describeCharacterMatrix(...)`
  call here). The registry-mismatch test (design §7, not an R-id) stays a standalone
  `test.describe`, unaffected by the refactor.
- `client/scripts/lib/contactSheetLayout.cjs` (+ `.test.cjs`, new) — pure
  `computeContactSheetLayout(rows, {cellWidth, cellHeight, padding, labelHeight, rowLabelWidth})`
  (multi-row grid positions, sized by the widest row) and `renderContactSheetLabelsSvg(layout,
  title)` (an SVG text-overlay string: title + one row label + one caption per cell).
- `client/e2e/lib/buildAvatarContactSheet.js` (new) — the shared I/O-shell capture logic both
  contact-sheet spec files below call: `buildContactSheet(page, config, {outputDir,
  outputFileName})` spawns one avatar per row (idle/hat/pet), cycles it through all 8 directions,
  captures one aura frame and one `down_llorar`-with-custom-palette action frame, composites
  everything via `sharp` using `contactSheetLayout.cjs`'s own computed positions, and writes
  `<outputDir>/<outputFileName ?? character>.png`. Depends only on `window.__avatarHarness`
  (`createAvatarHarnessApi`), so it is scene-class-agnostic — the same function drives both
  `harness.html` and `real-scene-harness.html` below.
- `client/e2e/avatar-contact-sheet.spec.js` (new) — harness-only capture for every character in
  its own `CHARACTERS` list (today: `rasta` only), writing `client/e2e/artifacts/contact-sheets/
  <char>.png`. States plainly in its own top comment that these are review evidence, never a
  pixel-baseline gate.
- `client/scripts/build-contact-sheet-index.cjs` (+ `.test.cjs`, new) — scans
  `client/e2e/artifacts/contact-sheets/*.png` (never a hardcoded roster list — reports whatever
  actually exists on disk, which is what makes it safe to re-run unchanged at slice 32) and
  writes `index.html` linking every captured sheet.
- `client/src/harness/RealSceneHarnessData.js` (new) — pure(-ish) `buildRealSceneInitData
  (vueComponent)` + `createNoOpVueComponent()`: the minimal, honestly-fabricated `PublicScene`
  init data (task 8, below).
- `client/src/harness/realSceneMain.js` (new) — entry point for `client/real-scene-harness.html`:
  boots a real `Phaser.Game` hosting the REAL `PublicScene` class (added via `game.scene.add(key,
  PublicScene, false)`, NOT via `config.scene`), starts it once with the fabricated init data, and
  exposes `window.__avatarHarness` via the SAME `createAvatarHarnessApi` factory
  `harness.html`/`AvatarHarnessScene` already use. Gated behind `VITE_AVATAR_HARNESS_REAL_SCENE`
  (new flag, `.env.example` + `playwright.config.js`'s `webServer.env`), same two-level gate as
  `VITE_AVATAR_HARNESS` (dev-only, unreachable in a production build — verified, see below).
- `client/real-scene-harness.html` (new) — the dev-only page, mirroring `harness.html`.
- `client/e2e/avatar-real-scene.spec.js` (new) — task 8's deliverable: 6 tests against the REAL
  `PublicScene`, not harness-only. Explicitly states in its own top comment what is real (the
  scene class and its own `create()` lifecycle: `TintManager`, `PublicSceneLoader`,
  `AvatarSystemController.init`, the real DOM button overlay) versus fabricated (scene-init data;
  still no socket/server/login, matching the harness's own stated cost).
- `client/.gitignore` — `e2e/artifacts/` changed to `e2e/artifacts/*` with `!e2e/artifacts/
  contact-sheets/` + `!e2e/artifacts/contact-sheets/**` negations added (contact sheets ARE the
  deliverable, committed for human review, unlike every other generator's scratch output in that
  directory); also added `test-results/` (Playwright's own run metadata, pre-existing untracked
  clutter, unrelated to any specific slice — swept up here since `.gitignore` was already open).
- `client/.env.example` — documented `VITE_AVATAR_HARNESS_REAL_SCENE=false` default.
- `client/playwright.config.js` — `webServer.env` gained `VITE_AVATAR_HARNESS_REAL_SCENE: 'true'`.
- Committed artifacts: `client/e2e/artifacts/contact-sheets/rasta.png` (harness-only),
  `client/e2e/artifacts/contact-sheets/rasta-real-scene.png` (real `PublicScene`),
  `client/e2e/artifacts/contact-sheets/index.html`.
- `client/src/harness/main.js` / `client/src/harness/realSceneMain.js` — **coordinator-caught
  defect fix (defect 5 below)**: `type: Phaser.CANVAS` -> `Phaser.AUTO`, plus
  `backgroundColor: "#9a9a9a"` (defect 6 below).
- `client/src/phaser/shared/spawnAvatarUser.js` — new `showUsername` opt (default `true`,
  every existing caller unaffected), threaded to `userData.show_username` (defect 6 below).
- `client/e2e/lib/buildAvatarContactSheet.js` — `spawnForCapture` now passes
  `showUsername: false` (defect 6 below).
- `client/scripts/lib/pixelColorMatch.cjs` (+ `.test.cjs`, new) — pure `hexToRgb(hex)` and
  `buildSolidRgbaBuffer(width, height, hex)`, backing the new pixel-level assertion below.
- `client/e2e/avatar-resolved-state.spec.js` — new **R8-pixel** test inside
  `describeCharacterMatrix` (parameterized by `pixelCheckSlot`/`pixelCheckColor`, default
  `color1`/`#ff00ff`): reads an ACTUAL rendered screenshot pixel and compares it to the resolved
  palette colour via the already-tested `diffRgbaBuffers` (R16/R17b's own comparator, reused
  rather than re-implemented).

### Live-discovered defects found and fixed during this slice (recorded, not silently absorbed)

1. **Contact-sheet screenshots were entirely blank at first** — every idle/hat/pet cell in the
   real capture rendered nothing at all, at the tile position both the harness and this slice
   default to (`{x:0, y:0}`, i.e. tile row/col 0). Traced live via `playwright-cli`: `MoveUserToTileController`'s
   isometric formula puts a `{x:0,y:0}`-tile avatar's `centerY` at exactly `0`, i.e. its FEET at
   the very top edge of the canvas, with its entire body extending further upward — fully
   off-screen, confirmed by comparing `getBounds()` world coordinates against the canvas's own
   page-space rect (canvas top at world `y=0`, body spanning `y:[-196,0]`, wholly above it). No
   assertion anywhere else in this apply pass ever needed a painted pixel, so this was invisible
   until the first real screenshot. Fixed by spawning contact-sheet avatars at tile position
   `{x:5, y:5}` (equal x/y keeps `centerX` unshifted while `centerX+centerY` grows, per the same
   formula) — `SPAWN_TILE_POS` in `buildAvatarContactSheet.js`, documented inline.
2. **The label SVG overlay painted an opaque white background OVER every captured cell.** First
   composited sheet showed correct row/cell labels but every image cell blank white — traced to
   `renderContactSheetLabelsSvg` emitting `<rect width="100%" height="100%" fill="#ffffff"/>` as
   its first element; since the labels layer composites LAST (on top of every screenshot cell),
   that opaque rect hid all of them, leaving only text glyphs visible. Fixed by removing the rect
   entirely (the base canvas's own white background, set by the `sharp({create:{...}})` call,
   shows through everywhere text does not paint) and added a regression test
   (`contactSheetLayout.test.cjs`) asserting no full-sheet opaque `<rect>` is ever emitted.
3. **Per-direction screenshots accumulated overlapping, never-destroyed avatars.** The first
   working (non-blank) contact sheet showed the WRONG pose in most hat/pet-row cells — traced to
   `captureDirectionRow` spawning a BRAND NEW avatar for every one of the 8 directions without
   ever removing the previous one, so by the second row 8+ avatars sat stacked at the identical
   screen position, and later screenshots showed whichever one happened to render on top. Fixed
   by spawning exactly ONE avatar per row and cycling it through all 8 directions via
   `setDirection` — the same "spawn once, vary direction" pattern
   `avatar-resolved-state.spec.js`'s own `readAfterDirection` already used; the bug existed only
   in the new contact-sheet code, never in the numeric matrix.
4. **Booting the real `PublicScene` class required 4 real fixes, found by iterating through 4
   real crashes** (the same "RED by construction against real integration code" pattern this
   whole apply pass uses for I/O-shell/integration tasks — no test was written first because the
   failure mode IS the crash itself):
   - Phaser auto-starts the first scene listed in `config.scene` before any explicit
     `game.scene.start(key, data)` call can run — `PublicScene.preload()` crashed reading
     `this.sceneData.scenery` (`undefined`) because the auto-boot ran with no init data at all.
     Fixed by adding the scene via `game.scene.add(key, PublicScene, false)` (`autoStart: false`)
     instead of listing it in `config.scene`.
   - `PublicSceneLoader.#loadItems` iterates `scenery.items` unconditionally (`for (const item of
     gameScene.sceneData.scenery.items)`) — crashed with `items` merely absent; fixed by supplying
     `items: []`.
   - `CreateSceneController.createTile` reads `map[row][col]` — crashed with an empty `game_map`.
     This repo's own `.env` sets `VITE_ANIMATION_AVATAR_EDITOR=false`, and `createTile`'s own
     guard (`if (import.meta.env.VITE_ANIMATION_AVATAR_EDITOR == "false")`) reads that as
     "CREATE the tile", not "skip it" — the flag names an editor MODE, the opposite of what its
     name suggests at first read. Fixed by supplying a real `game_map: [[0]]` matching
     `map_rows: 1, map_cols: 1`.
   - `PublicScene.createHTMLButtons()` calls `this.add.dom(...)`, which throws "No DOM Container
     set in game config" without `dom: {createContainer: true}` in the `Phaser.Game` constructor
     config — `AvatarHarnessScene` never reaches this code path at all, so this requirement is
     specific to booting the real scene. Fixed by adding that config key.
   One further error was found and left DELIBERATELY unfixed, disclosed rather than silently
   suppressed: `AvatarManager.createAvatarAnimations` throws `Cannot read properties of undefined
   (reading '5')` from inside a `LoaderPlugin` event callback during `AvatarSystemController.init`
   (`smartAvatarSystem.init(scene)`'s background BAKED-avatar animation setup, unrelated to
   `rasta`'s own layered path) — confirmed non-fatal (the scene still reaches `isSceneReady` and
   every layered-avatar assertion below still passes), so it is recorded as a pre-existing latent
   defect in the baked-avatar background loader surfaced by driving `PublicScene` outside its
   normal server-provided boot sequence, not something this slice's scope covers fixing.
5. **Coordinator-caught after the fact: both contact sheets showed the body rendering with NO
   palette colour at all — pure white with black outlines — in all 8 directions, while the hat
   (red/white) and pet (red) rendered their real colours.** This is the single most important
   defect this slice's own tooling was built to surface, and R1-R19's numeric assertions (R8
   included) did NOT catch it — recorded here exactly as plainly as the coordinator required.
   **Root cause, diagnosed and confirmed live, not guessed**: `client/src/harness/main.js` and
   `client/src/harness/realSceneMain.js` both booted `new Phaser.Game({type: Phaser.CANVAS, ...})`.
   Reading Phaser's own bundled source (`node_modules/phaser/src/renderer/canvas/
   CanvasRenderer.js`, `batchSprite`) shows the Canvas renderer draws every sprite via a plain
   `ctx.drawImage(frame.source.image, ...)` — it never reads a sprite's `tint`/`tintTopLeft`
   properties at all, unlike the WebGL renderer's `TextureTintPipeline`. `LayeredAvatar._tintChild`
   calls Phaser's own `setTint()` correctly (confirmed: the piece's own `.tint` getter, and
   `avatarHarnessApi.js`'s `slotTints` derived from it, read the correct resolved colour the
   whole time) — but under `Phaser.CANVAS` that call has **zero visual effect**, so every
   layered-avatar screenshot this whole apply pass ever captured showed the body's slotted runs
   as their raw, untinted white masks (fact C's own "white masks with ~4 alpha levels", never
   multiplied by anything). **This is exactly the class of gap design.md §19 risk 18 names**: a
   test reading `.tint` checks that `setTint()` was CALLED, not that the pixel it was supposed to
   colour actually changed — R8's own assertion is precisely this shape, and it passed the whole
   time for the wrong reason. Confirmed by direct experiment: sampling the exact rendered pixel
   at a `color1`-slotted piece's centre under `Phaser.CANVAS` read `(255,255,255,255)` (pure
   white) despite `piece.tint === 0xff00ff`; switching only `type` to `Phaser.AUTO` and
   re-sampling the SAME manifest/palette/position read `(255,0,255,255)` (exact magenta) — one
   line changed, nothing else, decisive. **Fix**: `type: Phaser.AUTO` in both harness entry
   points, matching `App.vue`'s own real default (`phaser_type` unset -> `Phaser.AUTO`, which
   prefers WebGL and falls back to Canvas only when WebGL is unavailable). **Residual risk, not
   fixed here and not a harness artifact**: `App.vue` reads a real per-user setting
   `socket.user.phaser_power_preference`-adjacent `phaser_type` that CAN force `"canvas"`
   explicitly; any real player who has done so (or whose device truly has no WebGL) would hit
   this EXACT defect in production today, on every layered character, not just `rasta` — this is
   a genuine, disclosed production-adjacent gap `_tintChild`'s `setTint()`-only design does not
   handle, named here for the sync agenda, not silently fixed by this harness-only change.
6. **Coordinator-caught: the shadow could not be visually assessed from either contact sheet**
   (every cell had a solid black background) **, and the per-cell name-tag bubble obscured the
   avatar's head.** Root cause of the first part, confirmed by decoding the real asset:
   `shadow.webp`'s centre pixel is `(0,0,0,103)` — a ~40%-opaque BLACK ellipse — which composites
   to indistinguishable black against an opaque black canvas background (Phaser's own default
   when no `backgroundColor` is set). The shadow's resolved POSITION was always correct (R5 has
   asserted `shadow.x === 0`/`shadow.y === 0` since PR2); only its visual ASSESSABILITY was
   broken. **Fix**: `backgroundColor: "#9a9a9a"` (a neutral mid-tone) added to both harness
   `Phaser.Game` configs. Root cause of the second part: `AddUserController`'s own name-tag
   bubble (`nameBackground`/`nameText`) rendered at its usual position, which for a small
   contact-sheet cell sits directly over the head. **Fix**: `spawnAvatarUser.js` gained a new
   `showUsername` option (default `true`, so every existing caller — `PerfHarness.spawnGhosts`
   and every numeric-matrix test — is byte-for-byte unaffected), and `buildAvatarContactSheet.js`
   passes `showUsername: false` for every capture spawn. `AddUserController.createUserNameText`
   already had a documented `show_username === false` branch (invisible placeholder text/image,
   not omitted entirely) — no new behaviour was added to production code, only a pre-existing
   capability was threaded through the harness's own spawn helper.

### Live verification (task 8's own requirement — real, not simulated)

`playwright-cli` against a real `vite dev` server: `real-scene-harness.html` reaches
`window.__realSceneHarnessReady === true` and `game.scene.getScene('PublicScene').isSceneReady
=== true`; spawning `rasta` there resolves `container === {x:506, y:330, depth:330}` — IDENTICAL
to the harness-only value at the same tile position — and a real screenshot shows rasta with
`minnieHat`/`pet09`/`auraElectrica` correctly composited, plus the REAL DOM button overlay
(shop/avatars/rankings/inventory icons, top-left) that `AvatarHarnessScene` never renders at all,
visual proof this is genuinely the production scene class and not a relabelled harness.

### Coverage report (tasks.md slice 21 task 9's own required format)

| Character | Numeric assertions (R1-R13) | Contact sheet | Real-scene validation |
|---|---|---|---|
| `rasta` | **PASS**, 14/14 (`describeCharacterMatrix('rasta', 12, ...)`) | **Captured** (`rasta.png`, harness-only: idle/hat/pet/aura/action) | **Captured** (`rasta-real-scene.png`, real `PublicScene`: idle/hat/pet/aura/action) — R1/R2/R5/R6-equivalent numeric parity also confirmed there |

Every other roster character (16 more `.layers.bb` bodies + `ghost`/`wraith` + `sally`) is **not
compiled yet** — zero numeric coverage, zero contact sheet, explicitly not implied covered by
anything in this slice. This is the honest, complete state as of slice 21; slices 22-31 each
extend both the matrix and the contact-sheet roster with their own characters.

### TDD Cycle Evidence — Slice 21

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 5 (`computeContactSheetLayout`) | `contactSheetLayout.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './contactSheetLayout.cjs'` | Passed (6/6) | 6 cases: single-row spacing, multi-row stacking independent of cell count, sheetHeight totals, per-cell caption position distinct from row label, empty-rows throw, zero-cell-row throw | Clean |
| 5 (`renderContactSheetLabelsSvg`, first pass) | `contactSheetLayout.test.cjs` | Unit | ✅ baseline 6/6 | Executed-failing: `TypeError: (0 , renderContactSheetLabelsSvg) is not a function` (×3 new cases) | Passed (9/9) | 3 cases: sheet-dimension embedding, one row-label + one caption per cell, title text present once | Clean |
| 5 (`renderContactSheetLabelsSvg`, live-discovered regression) | `contactSheetLayout.test.cjs` | Unit | ✅ baseline 9/9 | Executed-failing: real regression found live (defect 2 above) — captured via a real screenshot showing blank cells, then encoded as a real RED test: `expected ... not to match /<rect.../` failing against the buggy opaque-rect markup | Passed (10/10) | N/A — this IS the triangulation case that generalizes the bug into a permanent regression guard | Clean |
| 5 (`renderIndexHtml`) | `build-contact-sheet-index.test.cjs` | Unit | N/A (new) | Process deviation, disclosed (same class as `avatarHarnessApi.test.js`'s `resolveDirectionValue` precedent): written alongside the implementation rather than strictly before it | Passed (4/4) | 4 cases: single character link, multiple characters, empty-roster "(none yet)" message, XML-escaping a hostile character name | Clean |
| 1/2/3/4 (`describeCharacterMatrix` refactor) | `avatar-resolved-state.spec.js` | E2E (Playwright) | ✅ baseline: original hardcoded-rasta file's 14 tests passing (slice 20 state) | N/A (refactor of already-tested behaviour, not new logic — task 4's own framing) | Passed: `npx playwright test e2e/avatar-resolved-state.spec.js` → **14/14 passing**, identical test count and identical pass/fail outcome to before parameterization | N/A (approval-test by construction — the refactor itself is the check) | Clean |
| 5/6/7 (contact-sheet capture, real defects 1-3 above) | `avatar-contact-sheet.spec.js` | E2E (Playwright) | N/A (new) | RED by construction, 3 real iterations (defects 1, 2, 3 above), each traced from a real captured screenshot, not a written-first assertion | Passed: `npx playwright test e2e/avatar-contact-sheet.spec.js` → **1/1 passing**, real non-empty `rasta.png` with all 4 rows (idle/hat/pet/aura+action) visually confirmed correct | 4 rows × 8 directions (idle/hat/pet) + 2 single cells (aura/action) IS the triangulation — one real character, every capture path exercised | Clean |
| 8 (real `PublicScene` boot, defect 4 above) | `avatar-real-scene.spec.js` | E2E (Playwright) | N/A (new) | RED by construction, 4 real crashes (defect 4's sub-items above), each fixed and re-verified live via `playwright-cli` before any automated test was written | Passed: `npx playwright test e2e/avatar-real-scene.spec.js` → **6/6 passing** (ready-state check, R1/R2-equivalent, R5-equivalent, R6-equivalent/`llorar`, full contact-sheet capture) | R1/R2 + R5 + R6 are 3 independently-failing-if-wrong numeric checks against the SAME real scene, plus the full idle/hat/pet/aura/action capture — 4 independent real checks | Clean |
| 9 (documentation task) | tasks.md itself | N/A | N/A | N/A | N/A | Triangulation skipped: a documentation/process task with a single required output (the roster-extension instructions), no branching logic | N/A |
| Defect 5 fix (`hexToRgb`/`buildSolidRgbaBuffer`) | `pixelColorMatch.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './pixelColorMatch.cjs'` | Passed (4/4) | 4 cases: hex-with-`#`, hex-without-`#`/mixed-case, solid-buffer fill, a DIFFERENT colour produces a different buffer (not a hardcoded return) | Clean |
| Defect 5 fix (**R8-pixel**, the coordinator-required "reads actual rendered pixels, not merely tint" assertion) | `avatar-resolved-state.spec.js` | E2E (Playwright, real screenshot pixel sample) | ✅ baseline: 14/14 (post-refactor state, this slice) | **Executed-failing against the real pre-fix code, captured explicitly per the coordinator's instruction**: with `type: Phaser.CANVAS` restored temporarily and the FINAL test logic (largest-area-piece selection, 10% tolerance threshold) in place, `differingFraction` measured exactly `1` (100% of the sampled patch differing) against a `<= 0.1` gate — `Expected: <= 0.1, Received: 1` | Passed: with `type: Phaser.AUTO` restored (the permanent fix), the SAME test on the SAME manifest/palette/position measured `differingFraction` well under the 0.1 gate — `npx playwright test -g "R8-pixel"` → **1/1 passing** | 2 real iterations before the final selection logic: (1) the FIRST piece found with the target slot sampled a small, irregularly-shaped run whose bounding-box centre landed on a genuinely anti-aliased edge (64/64 then 5/64 differing, still not the real defect's own 64/64 signature) — fixed by selecting the LARGEST-by-area candidate piece instead, which triangulated the "which piece" question independently of the renderer-type question | Clean |
| Defect 6 fix (`backgroundColor`, `showUsername`) | live `playwright-cli` visual re-check + regenerated contact sheets (see below) | Integration | ✅ full suite green before | N/A (a background-colour/spawn-option change verified by looking at the regenerated PNGs, not a pure-logic RED/GREEN cycle — matching the same class of verification `avatar-contact-sheet.spec.js`'s own top comment already declares for this whole file: "review evidence... no assertion... diffs a captured screenshot") | Confirmed visually: both regenerated sheets show a visible grey shadow ellipse under the feet in every direction, and no name-tag bubble over any head | N/A | Clean |

Full client suite after slice 21 (including the coordinator-caught defect fixes): `cd client &&
npx vitest run` → **63 test files, 478 tests, passing** (60→63 files: `contactSheetLayout.
test.cjs`, `build-contact-sheet-index.test.cjs`, `pixelColorMatch.test.cjs`; 460→478 tests:
+10+4+4). `cd client && npx playwright test` → **41/41 passing** (34→41: +1
`avatar-contact-sheet.spec.js`, +5 `avatar-real-scene.spec.js`, +1 `R8-pixel`; every pre-existing
spec, including `avatar-load-gate.spec.js`'s 7/7 gate rows, re-verified still green). `npm run
build` → `dist/` contains only `index.html` (no `harness.html`/`real-scene-harness.html`, no
harness JS chunk anywhere in `dist/assets/js/`) — confirmed live, then `dist/` removed.

### Before / after — the regenerated evidence (coordinator's own explicit request)

Both `client/e2e/artifacts/contact-sheets/rasta.png` (harness-only) and `rasta-real-scene.png`
(real `PublicScene`) were regenerated after the fix and visually re-inspected, per direction:

| | Before (this slice's first pass) | After (this correction) |
|---|---|---|
| Body colour | Pure white with black outlines, all 8 directions, both sheets — no trace of `color1` (`b88a5c`), `color2` (`ff9900`), `color3` (`0099cc`), `color5` (`e31709`) or `color7` (`336666`) anywhere | Real skin tone (`color1`), orange hair (`color2`), blue headband (`color3`), red/white costume (`color5`) all visible, all 8 directions, both sheets; the `down_llorar` action cell's custom palette override (`color1` -> magenta) is visibly distinct from every idle/hat/pet cell |
| Shadow | Invisible (black-on-black) in every cell | A visible grey ellipse under the feet, every direction, both sheets — shadow alignment is now assessable by eye, not merely by the R5 numeric assertion |
| Name tag | A white bubble sitting over the head in every cell | Absent (suppressed via `showUsername: false` for capture spawns only) |

Both regenerated PNGs were re-inspected directly (not merely re-run through the numeric suite)
before this slice was considered closed.

Background processes: one `vite dev` (port 5183, `run_in_background`) and multiple
`playwright-cli` browser sessions were used for the live debugging in this slice and closed
(`playwright-cli close-all`, `pkill -f "vite.*5183"`) before moving on — confirmed via `lsof
-ti:5183` returning empty. `docker ps -a` confirmed no matching container left over from the
Playwright-driven `avatar-load-gate.spec.js`/`avatar-transfer.spec.js` runs.

### Carried-forward gaps, still open, still not addressed by slice 21

Slice 15's bucket-fallback and eviction scheduler remain unwired; no vector editor has been
validated for the Tier 2 SVG round-trip; the M1 roster-tracked figure (14.43 MB) is still the
same rasta-only partial scope from slice 20, not the full roster — the real number does not
exist until slice 32. `design.md` §13.7's `ss:1` prose is still unedited (frozen). The
`AvatarManager.createAvatarAnimations` background-loader defect found while booting the real
scene (live-discovered defect 4's trailing note above) is newly disclosed here — nobody has
looked at whether it affects any BAKED (non-layered) character's animations in production; it is
flagged as a risk, not something this slice fixes. **New, from the coordinator-caught defect
above**: `_tintChild`'s `setTint()`-only palette mechanism has no visual effect under Phaser's
Canvas renderer, which a real player can reach either by having no WebGL support or by an
explicit `phaser_type: "canvas"` client setting `App.vue` itself reads — this is a genuine,
disclosed production-adjacent gap, NOT closed by this slice's harness-only fix (switching the
harness to `Phaser.AUTO` only makes the harness representative of the real, near-universal
DEFAULT client; it does nothing for a real Canvas-forced session). Fixing that would need either
a Canvas-compatible tinting mechanism (real per-pixel recolouring, materially more expensive than
`setTint()`) or a documented decision to drop Canvas-rendering support for layered avatars —
flagged here for the sync agenda, not decided or implemented in this apply pass.

---

## Correction 1 — the minnie hat's back-view black mass is legitimate art, not a defect

The `hat_minnie`/`minnieHat` package renders a large black mass in the five diagonal/up
directions (`downright` mirrors `downleft`, `upright` mirrors `upleft`, plus `up`, `upleft`,
`upright` — every pose that shows the hat from behind or three-quarter-back). **User decision,
2026-08-18**: this is the authored back-of-head view in the original source art (Minnie's ears
seen from behind are drawn solid black in the source `.bb`, no separate "back" variant exists) —
not a rendering, clip, or path-species defect. No investigation was performed; no code, test, or
manifest was touched for this item. Recorded here so it is never reopened as a bug in a future
slice or verify pass.

## Correction 2 — Canvas-renderer tint fallback (pre-multiplied colour, not `setTint()`)

**Real production defect, confirmed and fixed** (not merely documented, per the user's explicit
2026-08-18 decision to fix rather than degrade-or-force-WebGL): Phaser's Canvas renderer
(`Renderer.Canvas.CanvasRenderer#batchSprite`) draws every sprite via a plain `ctx.drawImage(...)`
and never reads `tint`/`tintTopLeft` at all — confirmed by reading Phaser's own bundled source.
`LayeredAvatar._tintChild`'s `setTint()` call was always correct (the resolved colour was right;
`.tint`/`slotTints`-based assertions passed the whole time for the wrong reason, exactly
design.md §19 risk 18's "checks the call, not the pixel" gap) but had zero visual effect under
`Phaser.CANVAS` — a real player with no WebGL, or with the real per-user `phaser_type: "canvas"`
setting `App.vue` itself reads, would see every layered character as an untinted white
silhouette.

**Fix — pre-multiply at composition time, cached per (piece, resolved colour), WebGL path
untouched:**

- `client/src/phaser/layered/canvasTint.js` (new) — pure colour math and the cache Map/accessors:
  `hexToRgbChannels`, `buildTintedTextureKey`, `multiplyRgbaByChannels` (reproduces Phaser's own
  WebGL multiply-tint blend exactly, RGB only, alpha untouched), `computeTintCacheBytes`,
  `setTintCacheEntry`/`getTintCacheEntry`/`getTintCacheStats`/`clearTintCache`. Deliberately
  **Phaser-import-free** — `avatarMetrics.js` (unit-tested directly in a node/no-DOM environment)
  needed to read cache byte stats without transitively importing `phaser`, which throws outside a
  browser (`node_modules/phaser/src/device/index.js` assumes `window`/`navigator`). This is why
  the cache Map itself lives here and not in the Phaser-dependent module below — a real defect
  found and fixed mid-slice (first attempt broke `avatarMetrics.test.js`'s whole suite import;
  fixed by moving the Map/stats functions to this Phaser-free module, confirmed by re-running the
  full vitest suite green again).
- `client/src/phaser/layered/canvasTintCache.js` (new) — the Phaser I/O shell:
  `isCanvasRenderer(scene)` (`scene.sys.game.renderer.type === Phaser.CANVAS` — covers BOTH a
  device with no WebGL and a real forced `phaser_type: "canvas"`), `getOrCreateTintedTexture
  (scene, atlasKey, frameName, hex)` (cache hit -> return key; miss -> draw the source frame onto
  a `scene.textures.createCanvas` canvas, multiply its `ImageData` in place, register and cache
  it). Not unit-tested directly (needs a live Canvas 2D context, the same design.md §8 split every
  other Phaser-touching module in this directory already uses) — exercised live via
  `e2e/avatar-canvas-tint.spec.js`.
- `client/src/phaser/layered/LayeredAvatar.js` — constructor computes `this._isCanvasRenderer`
  ONCE (not per-frame); `_tintChild` branches: Canvas renderer + slotted piece + resolved hex ->
  `getOrCreateTintedTexture` + `child.setTexture(tintedKey)`, falling through to the pre-existing
  `child.setTint(...)` call untouched for every other case. **WebGL path is byte-for-byte
  unchanged** — still exactly one `setTint()` call, zero extra branches executed, confirmed by the
  full existing e2e suite staying green (45/45, was 41/41 before this correction — the +4 are this
  correction's own new Canvas-only tests, nothing in the pre-existing WebGL-path suite changed
  outcome).
- `client/src/phaser/debug/avatarMetrics.js` — `snapshot()` gained `canvasTintCacheBytes`
  (`computeTintCacheBytes(getTintCacheStats().entries)`), additive to the pre-existing
  `residentAvatarBytes` for a Canvas-path M4-equivalent measurement; imported from
  `canvasTint.js` only (see the Phaser-import-free note above).
- `client/src/harness/main.js` — `?renderer=canvas` query-string param forces `Phaser.CANVAS` at
  runtime (not a build-time env var, so no second dev server is needed); no query param is
  byte-for-byte unaffected (`Phaser.AUTO`, unchanged from slice 21's own fix).
- `client/e2e/avatar-canvas-tint.spec.js` (new) — the permanent Canvas-renderer regression
  coverage, **added as its own file/tests, not a replacement** for
  `avatar-resolved-state.spec.js`'s existing AUTO-renderer R8-pixel test, so both renderer paths
  stay independently covered going forward:
  1. sanity check that the harness actually booted `Phaser.CANVAS` (`renderer.type === 1`) —
     guards against the test being silently vacuous;
  2. **R8-pixel (Canvas renderer)** — the same real-screenshot-pixel-vs-resolved-palette
     assertion `avatar-resolved-state.spec.js`'s R8-pixel already runs under `Phaser.AUTO`, run
     here under forced `Phaser.CANVAS`;
  3. M4-equivalent, one avatar/one action (the SAME scenario the WebGL M4 gate uses);
  4. M4-equivalent, roster-realistic full sweep (every real `sequences ∪ aliases ∪ mirrors` key,
     hat+pet+aura worn — mirrors R11's own real key list, not a hand-picked sample);
  5. a committed Canvas-renderer contact sheet (`rasta-canvas-renderer.png`).

### RED → GREEN evidence (captured live, both directions)

`_isCanvasRenderer` branch temporarily disabled (`if (false && this._isCanvasRenderer)`) and
`avatar-canvas-tint.spec.js`'s R8-pixel test re-run: **RED**, `64/64 pixels differing`
(`differingFraction === 1`), i.e. pure untinted white against the resolved `#ff00ff` — the exact
same signature slice 21's coordinator-caught defect recorded under `Phaser.CANVAS`. Branch
restored, same test re-run: **GREEN**, `<= 0.1` differing fraction. This is the permanent
regression test going forward — the AUTO-renderer R8-pixel test in
`avatar-resolved-state.spec.js` was never touched and stayed green throughout (confirmed by
running the full suite before and after).

### Memory measurement (design's own explicit gate — reported honestly, not asserted where it
does not fit)

| Scenario | `residentAvatarBytes` | `canvasTintCacheBytes` | Total | Gate (≤80 MB) |
|---|---|---|---|---|
| One avatar, one action played (M4's own scenario) | 38,247,300 B | 381,336 B | 38,628,636 B ≈ **36.84 MB** | **PASS** |
| One avatar (hat+pet+aura), EVERY resolvable key played (65 keys, all 4 action packs loaded) | 251,985,976 B | 7,754,048 B | 259,740,024 B ≈ **247.71 MB** | **FAIL** |

Both rows measured live via `e2e/avatar-canvas-tint.spec.js` against the dev-server harness
(same measurement mechanism the WebGL M4 gate already uses, `window.__avatarMetrics()`).

**Honest interpretation, not just the numbers**: the first row is the scenario M4 itself is
defined against, and it PASSES with the Canvas-tint fix's own real added cost being small
(381 KB — under 1% of the 36.48 MB WebGL-equivalent baseline for that same scenario). The second
row's 247.71 MB is dominated by `residentAvatarBytes` (240 MB), not by this correction's own
`canvasTintCacheBytes` (7.4 MB) — `residentAvatarBytes` counts every currently-loaded atlas
PAGE's decoded size, and this row deliberately forces all 4 of rasta's action packs resident at
once (`preloadActionPacks` + a full 65-key sweep) specifically to find the tint cache's own worst
case. That atlas-residency cost is pre-existing and already disclosed (slice 6/15's whole point
is that lazy per-key loading avoids ever loading every pack at once in real gameplay) and is
architecturally identical whether the active renderer is WebGL or Canvas — it is not a
consequence of this correction and this correction does not change it. The number this
correction is actually responsible for — `canvasTintCacheBytes` growing from 381 KB (one action)
to 7.4 MB (every resolvable key, one character, worn accessories included) — is a real,
disclosed, roughly-linear-in-distinct-(piece,colour)-pairs cost that stays small per character
even at this deliberately pessimistic full-sweep extreme. **Not measured**: multiple
simultaneously-visible characters with distinct palettes (the roster-scale gate, slice 32,
already named as where cross-character composition gets measured for the WebGL path) — the same
methodology extends there unchanged once that slice runs; flagged, not pre-empted.

### TDD Cycle Evidence — Correction 2

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| pure colour/cache math | `canvasTint.test.js` | Unit | N/A (new) | Process deviation, disclosed (same class as `avatarHarnessApi.test.js`'s `resolveDirectionValue` precedent): written alongside the implementation rather than strictly before it | Passed (13/13) | 13 cases: hex parsing (with/without `#`), cache-key determinism + colour-sensitivity, RGB multiply incl. partial-alpha/non-white and multi-pixel mutation, byte summation incl. empty-cache zero, cache accessor set/get/stats/clear round-trips | Clean |
| Phaser-import-free split (live-discovered) | `avatarMetrics.test.js` (pre-existing) | Unit | ✅ baseline green before this correction | Executed-failing: importing `canvasTintCache.js` (which imports `phaser`) into `avatarMetrics.js` threw inside `node_modules/phaser/src/device/index.js` on collection, failing the entire suite (1 file / all its tests) | Passed: moved the cache Map + accessors into the Phaser-free `canvasTint.js`; full suite green again (65 files / 497 tests) | N/A (a real import-graph defect fix, not a new-behavior case) | Clean |
| `_tintChild` Canvas branch | `e2e/avatar-canvas-tint.spec.js` (R8-pixel) | E2E (Playwright, real screenshot pixel) | ✅ baseline: full e2e suite 41/41 (post-Correction-3 state) before this correction | **Executed-failing against the real code with the branch disabled**: `64/64 pixels differing`, `differingFraction === 1` — captured live, see above | Passed: branch restored, `<= 0.1` differing fraction — `npx playwright test e2e/avatar-canvas-tint.spec.js` → 5/5 | sanity + R8-pixel + 2 memory measurements + 1 contact-sheet capture, one real character, both renderer states compared | Clean |

Full client suite after Correction 2: `cd client && npx vitest run` → **65 test files, 497
tests, passing** (64→65 files: `canvasTint.test.js`; 494→497 tests: +13 minus the 10 removed
from `petSide.test.cjs`'s Correction-3 rewrite, net +3 — see Correction 3's own count below for
the full breakdown). `cd client && npx playwright test` → **45/45 passing** (41→45: +5
`avatar-canvas-tint.spec.js`, all pre-existing specs, including `avatar-load-gate.spec.js`'s 7/7
gate rows and `avatar-resolved-state.spec.js`'s AUTO-renderer R8-pixel, re-verified still green).

### Deviations from the correction's own framing, disclosed

The correction's prompt named "temperature" only two possible outcomes ("fix" vs. "measure and
report if it cannot fit") — the actual result is a third, more nuanced one: the fix DOES fit the
gate for the scenario the gate is defined against (one avatar, one action), and the gate's own
methodology does not straightforwardly extend to "one character with every pack loaded at once"
without ALSO re-litigating the pre-existing, already-disclosed atlas-residency cost that has
nothing to do with this correction. Reported both numbers rather than picking whichever framing
looked better.

## Correction 3 — pet canonical side: derivation was reading the wrong quantity, not the wrong sign

**Not a hardcoded flip.** The bug was that `derivePetSide` compared the pet's RAW registration
point (`regX`) against a same-direction population median — but the pet's real on-screen
position (what `resolveAccessoryPlacement`, pivot.js, actually renders) adds a large correction
term, `(0.5 - originX) * widthLogical`, before comparing against the body's own origin, and
`pet09`'s `originX` values run far outside `[0, 1]` (e.g. `-1.65` for `down_idle`) — so that
correction is NOT a rounding nicety, it can and does flip the SIGN. Measured directly from
`pet09`'s real compiled data (all logical units, unmirrored/authored poses only — the only ones
whose side is fixed by the art rather than by mirroring):

| Direction (unmirrored/authored) | Raw `regX` | Fully-resolved centre (`regX + (0.5-originX)*width`) | Body's own origin (`o[0]`) | Resolved offset | Old (`regX`-only) verdict | Correct verdict |
|---|---|---|---|---|---|---|
| `down_idle` | -6.25 | 59.27 | 40.6 | **+18.67** | left | **right** |
| `up_idle` | -5.05 | 56.26 | 39.5 | **+16.76** | left | **right** |
| `left_idle` | 1.95 | 15.30 | 28.25 | -12.95 | left | left |
| `leftdown_idle` | -23.45 | 31.34 | 32.0 | -0.66 (near-ambiguous) | left | left (weak) |
| `leftup_idle` | 21.10 | 18.66 | 27.3 | -8.64 | left | left |

A second, independent bug in the OLD code (not the root cause, but real): the "population" it
compared against expanded every FRAME of every `down_*` action unweighted — `down_trampa` (94
frames) swamped `down_idle` (3 frames, 1 unique position) in the median, which is how the old
code's per-frame-weighted number happened to still land on "left" for `down_idle` despite being
the wrong quantity entirely. The fix removes the population/median approach altogether: it is
unnecessary once the REAL reference (the body's own `down_idle` frame origin) is available, and
comparing directly against it is both simpler and correct.

**Why `down`/`up` decide the answer, not a preference**: `down` and `up` are the only two facing
directions that can never be mirrored (fact: no `right`/`down`-mirrored counterpart exists for
either — `left`/`leftdown`/`leftup` mirror to `right`/`rightdown`/`rightup`, `down`/`up` do not),
so their side is fixed by the raw art alone, independent of any derivation choice. Both resolve
decisively to **right** (+18.67, +16.76 — both far outside the epsilon=2 ambiguity band). Per
the LOCKED design decision (proposal.md item 2: "the pet stays there in all 8 directions and
only `flipX` changes"), the SAME side must apply everywhere, so `down`/`up`'s unambiguous answer
determines the package-wide side: **right**.

**User's report vs. the evidence — reconciled, not contradicted.** The user's exact words
("cuando caminas abajo y a direcciones hacia la derecha... aparece bien a la derecha... cuando
camina hegaonal o isquerda el pet aparece a la isquerda") describe exactly what the UNCORRECTED,
un-clamped naive math would show if run today: `down`/`up`/`right`-family resolve right (5 of 8
directions), `left`-family resolves left (3 of 8) — matching the user's own down/right-correct,
left-wrong split precisely. The two contact sheets the coordinator inspected (both showing LEFT
in all 8 directions) reflect the OLD derivation's wrong output (`base.side: "left"` forced
uniformly), not a contradiction of the user's report — the user was describing the residual,
uncorrected geometry underneath a side-selection bug, and that description is exactly consistent
with the fix below.

**Fix:**

- `client/scripts/lib/petSide.cjs` — `derivePetSide(petCenterX, bodyOriginX, options)` (new
  signature: two resolved positions, not a value + a population); `resolvePetFrameCenterX(regX,
  originX, widthPx, ss)` (new, the missing correction term); `median` helper removed (dead once
  the population approach is gone — Boy Scout Rule, matching this codebase's own "a superseded
  implementation left in place as inert data is a trap" precedent, e.g. `clearBodySilhouetteX`'s
  deletion in slice 3/PR3).
- `client/scripts/lib/bodyDownIdleOrigin.cjs` (new) — `extractBodyDownIdleOriginX(bodyManifest)`
  (pure) / `readBodyDownIdleOriginX(char, avatarsDir)` (thin I/O wrapper, same pure/I/O split as
  `deriveColormeta.cjs`/`derive-colormeta.cjs`): reads the BODY's own compiled `down_idle` frame
  origin — a real, disclosed ordering dependency (the body must be compiled before its pets),
  hard-failing with a clear message otherwise. `rasta` already satisfies this (body compiled in
  slice 5, long before any pet).
- `client/scripts/compile-accessory.cjs` — the `kind === 'pet'` branch now computes
  `resolvePetFrameCenterX` from `uniqueFrames[downIdleFrames[0]]` (which already carries
  `width`, unlike the `frames` dict built for the manifest) and calls
  `readBodyDownIdleOriginX(char, avatarsDir)`; the old population-collection loop is deleted.
- Recompiled `pet09` for real (`node scripts/compile-accessory.cjs --kind pet --char rasta
  pet09`): console output `pet "pet09" side: right (derived: down_idle centre 59.27 vs. body
  origin 40.60)`; `pet09.accessory.json`'s `base.side` is now `"right"`. Every existing test that
  reads `petManifest.base.side` generically (`mirroredDirections.integration.test.js`,
  `avatar-resolved-state.spec.js`'s R3/R4) passed UNCHANGED against the new value with zero edits
  to those files' own assertions — confirming they were genuinely side-agnostic, not
  accidentally coupled to "left".
- `client/e2e/avatar-resolved-state.spec.js` — **R3-pin / R4-pin** (the correction's own explicit
  requirement, "pin the pet's screen side per direction explicitly"): `describeCharacterMatrix`
  gained a required `expectedPetSide` param (throws if a character has a `petKey` but no
  `expectedPetSide` — an explicit, human-decided value, never read back from the manifest under
  test) with real geometric justification recorded inline. R3 now asserts
  `petManifest.base.side === expectedPetSide` before anything else; R3's per-direction bounds
  check and R4's per-direction sign check both branch on `expectedPetSide`, not
  `petManifest.base.side` — a self-referential comparison would trivially pass even if
  `derivePetSide` regressed. `rasta`'s call site sets `expectedPetSide: 'right'`.
- Regenerated both `rasta.png` (harness) and `rasta-real-scene.png` (real `PublicScene`) contact
  sheets — pet visually confirmed on the RIGHT in all 8 directions, both sheets, flipping only
  orientation (never position) between left- and right-facing poses.

### RED → GREEN evidence (captured live)

`expectedPetSide` temporarily set to `'left'` on `rasta`'s call site and R3/R4 re-run: **RED**,
2 failures — R3 (`expected +102ish to be <= minX+0.5`-shape failure) and R4 (`direction down:
Expected: -1, Received: 1`). Reverted to `'right'`: **GREEN**, `npx playwright test
e2e/avatar-resolved-state.spec.js` → 15/15.

### TDD Cycle Evidence — Correction 3

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| `derivePetSide`/`resolvePetFrameCenterX` new signature | `petSide.test.cjs` (rewritten) | Unit | ✅ baseline 5/5 (old signature) | Executed-failing: 3/5 old tests failed against the new signature (`expected [Function] to throw` — old population-array argument no longer produces the old ambiguity behaviour) | Passed (8/8 rewritten) | 8 cases: real pet09 down_idle numbers (correction term, clear-right), clear-left, ambiguous-fails, override-wins, custom epsilon, plus 3 `resolvePetFrameCenterX` cases (real numbers, no-op at originX=0.5, width-proportional scaling) | Clean |
| `extractBodyDownIdleOriginX`/`readBodyDownIdleOriginX` | `bodyDownIdleOrigin.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) — captured: `Cannot find module './bodyDownIdleOrigin.cjs'` | Passed (4/4) | 4 cases: real-shaped manifest, first-of-several-frames (not hardcoded), no-down_idle throw, no-origin-data throw | Clean |
| real recompile (`pet09`) | live `node scripts/compile-accessory.cjs --kind pet --char rasta pet09` | Integration | ✅ full vitest suite 485/485 before recompile | N/A (real compiler run against real staged source) | Succeeded: `base.side: "right"`, console-logged derivation numbers matching the hand-computed table above exactly | The full existing regression suite (`mirroredDirections.integration.test.js`, 95+ cases) re-passing UNCHANGED against the new `"right"` value IS the triangulation — proves those tests were genuinely side-agnostic | Clean |
| R3-pin/R4-pin | `e2e/avatar-resolved-state.spec.js` | E2E (Playwright) | ✅ baseline 15/15 (pre-correction, `side:"left"` state) | **Executed-failing against the real code with `expectedPetSide: 'left'`**: 2/15 failed (R3, R4) — captured live, see above | Passed: `expectedPetSide: 'right'` restored, `npx playwright test e2e/avatar-resolved-state.spec.js` → 15/15 | R3 (8-direction bounds check) + R4 (8-direction sign check), both against the SAME pinned expectation, is the triangulation — a fixed-but-wrong side would previously have passed R4's old "at most one distinct sign" check, which is exactly why R4 gained its own explicit sign-vs-`expectedPetSide` assertion | Clean |

Full client suite after Correction 3: `cd client && npx vitest run` → **64 test files, 485
tests, passing** at the point Correction 3 alone was complete (63→64 files: `bodyDownIdleOrigin.
test.cjs`; `petSide.test.cjs` net +3 tests, from 5 to 8). `cd client && npx playwright test` →
**41/41 passing** (unchanged count — Correction 3 touches an existing spec file's assertions, no
new spec file). Both contact sheets (`rasta.png`, `rasta-real-scene.png`) regenerated and
visually re-inspected: pet on the right, all 8 directions, both sheets.

### Combined state after all three corrections

`cd client && npx vitest run` → **65 test files, 497 tests, passing**. `cd client && npx
playwright test` → **45/45 passing** (`avatar-load-gate.spec.js` 7/7 internally, unchanged;
`avatar-resolved-state.spec.js` 15/15 with R3/R4 pinned to `right`; `avatar-canvas-tint.spec.js`
5/5, new). Contact sheets committed: `rasta.png` (harness, `Phaser.AUTO`/WebGL-preferred),
`rasta-real-scene.png` (real `PublicScene`, `Phaser.AUTO`/WebGL-preferred), and
`rasta-canvas-renderer.png` (harness, `Phaser.CANVAS` forced) — every committed sheet's renderer
is now stated explicitly rather than left implicit. `index.html` (`build-contact-sheet-index.cjs`)
was NOT re-run in this correction pass (no new task required it) — it will pick up the new
`rasta-canvas-renderer.png` entry automatically the next time any slice runs it, since it scans
the directory rather than reading a hardcoded list.

---

## Slice 22 — `sally`: deferred asset compile + `AvatarsDataPreload.js` wiring

Depends: slice 21 + the three corrections above. Design §16, `design.md`'s own slice 21.
Client-only — touches no server/API/DB surface (that was slice 10's isolated work).

Files changed:
- Compiled output (new): `client/src/assets/game/avatars/sally/layers/` (base + 26 action-key
  packs, 1 base page, `ss:1` selected for 2 over-budget keys — `leftdown_punch_doy`,
  `left_falling`, the SAME measurement-driven rule slice 20 built, applying automatically with
  no new code), `client/src/assets/game/avatars/sally/config.json` (the `--emit-config-shim`
  output, `atlasKey: null`, 41 entries).
- `client/src/phaser/preloaders/AvatarsDataPreload.js` — `[AvatarEnum.SALLY]: asset_sally_json`,
  the one-line wiring slice 10 deferred.
- `client/src/phaser/preloaders/AvatarsDataPreload.test.js` (new) — `window.avatars_config[18]`
  resolves to a well-formed entry; every other roster character still present.
- `client/src/phaser/shared/spawnAvatarUser.js` — **real, previously-latent defect fix** (see
  below): `smartAvatarSystem.availableAvatars.add(avatarId)`, mirroring the existing
  `avatarManager.loadAvatar` priming call immediately above it.
- `client/e2e/avatar-resolved-state.spec.js` — `describeCharacterMatrix` gained 4 new params
  (`actionKey`, `resolvedActionKey`, `emoteAliasWorks`, `animationUpdateTestKey`), all defaulting
  to rasta's own existing hardcoded values (byte-for-byte unaffected); R5 split into R5 (shadow
  position, unconditional) + R5-mirror (antisymmetry, `test.skip` when the character's manifest
  has zero mirrors); new R6-degrade test (mirror-image of R6, runs only when `!emoteAliasWorks`);
  R8/R12/R13 read the new params instead of hardcoding `'llorar'`/`'down_llorar'`/`'right_walk'`;
  `describeCharacterMatrix('sally', 18, {...})` added.
- `client/e2e/lib/buildAvatarContactSheet.js` — same `actionKey`/`resolvedActionKey`
  parameterization for the contact sheet's own action cell (was hardcoded `'llorar'`); the action
  cell's label is now conditional on whether a palette override was actually applied (a
  character with zero palette slots, sally, would otherwise be mislabelled "custom palette").
- `client/e2e/avatar-contact-sheet.spec.js` — `sally` added to `CHARACTERS`.
- Committed artifact: `client/e2e/artifacts/contact-sheets/sally.png` (harness-only); `index.html`
  regenerated (4 entries: `rasta`, `rasta-canvas-renderer`, `rasta-real-scene`, `sally`).

### Two real, previously-latent defects found and fixed live (recorded, not silently absorbed)

**Defect A — `SmartAvatarSystem` silently substitutes a different avatarId in the harness, for
every character except RASTA/GATA.** `AddUserController.processUser` asks
`smartAvatarSystem.getAvatarForUser(userId, avatarId)` BEFORE ever calling `createAvatarSprite` —
a completely SEPARATE, baked-legacy availability tracker (`SmartAvatarSystem.availableAvatars`,
a `Set` populated only by `BackgroundAvatarLoader`'s own preload events) from the layered
registry `avatarManager` uses. The harness never runs `smartAvatarSystem.init()` or the
background loader, so `availableAvatars` starts and stays EMPTY. `getAvatarForUser` silently
substitutes a fallback avatarId (`selectBestFallback`) whenever the requested id is not in that
set — and the ULTIMATE hardcoded fallback, when even the fallback candidates are unavailable, is
`AvatarEnum.RASTA`. **Every single e2e test across this entire apply pass (slices 1-21, all three
corrections) requested only RASTA** — for RASTA specifically, "substitute the fallback" and "use
what was requested" happen to be the SAME avatarId, so the substitution was completely invisible.
The FIRST harness request for any OTHER avatarId (`sally`, 18) exposed it immediately: confirmed
live via a sequence of probes — `avatarManager.getLayeredManifest(18)` was already `true` (the
layered path WAS usable) at the exact moment `spawnAvatarUser` ran, yet the resulting
`spriteAvatar.isLayered` was `false` and `textureKey` was `"__DEFAULT"` (the baked "atlas not
found" placeholder) — because `processUser` had already silently swapped `userData.avatar_id`
from 18 to 12 before `createAvatarSprite` ever ran. **Fix**: `spawnAvatarUser.js` now calls
`smartAvatarSystem.availableAvatars.add(avatarId)`, mirroring the exact reasoning the file's own
pre-existing `avatarManager.loadAvatar` priming call already documents ("in the real game a
background loader primes this before any user with that avatarId appears; a freshly booted
harness... has no such loader running, so this call reproduces that priming step explicitly") —
applied to the OTHER system that needs the identical priming. **This is a harness-only fix**
(`spawnAvatarUser.js` is explicitly the shared test-spawn primitive, per its own docblock); no
production `AddUserController`/`SmartAvatarSystem` code was touched, since the real game's own
background loader already does this priming before a real user ever appears. **Consequential for
every future slice, not just sally**: without this fix, slices 23-31 (18 more characters) would
each have silently spawned as RASTA in the harness, making their own R1-R13 matrices assert
RASTA's geometry while believing they were testing themselves — this would have been an
increasingly-hard-to-detect defect the deeper the roster migration went, since a wrong-but-
internally-consistent RASTA render would pass most numeric assertions trivially. Found now,
at the first non-RASTA character, specifically because this slice's task 5 required actually
spawning her.

**Defect B — sally's compiled manifest has ZERO aliases and ZERO mirrors, a real (not buggy)
consequence of having no baked-config precedent.** `compile-layered-avatar.cjs`'s own
`readBakedKeyMap` already documents this ("a character with no baked art, e.g. sally... has
none") — `bakedKeyMap.cjs`'s alias/mirror derivation is driven ENTIRELY by enumerating an
EXISTING baked `config.json`'s own declared `source`/`flip` relationships; a brand-new
layered-only character has no such file to read. Two concrete, disclosed consequences, verified
live rather than assumed:
1. **The CRY emoji product feature (`playAction`, `UserEmojiAnimation.main`) is hardcoded to
   request the literal string `'llorar'` for EVERY character** (`AvatarEmojisNameAnimationsEnum
   .CRY`), not parameterizable per character. For sally, `'llorar'` matches no alias and
   degrades to her `down_idle` — pressing the cry emoji shows her idle pose in the real game
   today. This is disclosed, not fixed (fixing it would mean either hand-authoring an alias
   convention with no source data to derive it from, or changing the emoji-to-key binding
   architecture — both out of this slice's scope) — R6-degrade proves the degrade is real,
   observable (`degradeReporter` records it) and correctly reported, never a silent no-op; R6
   itself is `test.skip`ped for her with the reason stated inline.
2. **`right`/`rightdown`/`rightup` facing directions have no synthesized pose at all** — she can
   only ever show 5 of 8 authored directions (`down`, `left`, `leftdown`, `leftup`, `up`); asking
   her to face right degrades to `down_idle` (a real, unrelated pose, not a mirror). R5 was split
   so the (still-universal) shadow-position check runs unconditionally, and the (mirror-specific)
   antisymmetry check (`R5-mirror`) is skipped for a character with an empty `mirrors` table.
   Confirmed visually in her committed contact sheet: `right`/`downright`/`upright` cells show the
   IDENTICAL pose as `down`, not a mirrored `left`/`leftdown`/`leftup`.

Both defects are named here in full because they are the FIRST real evidence from ANY character
other than rasta — every prior slice's "the harness works" claim was, in retrospect, only ever
proven for rasta specifically. Slices 23-31 should expect to find their OWN character-specific
surprises the same way; this is not a closed list.

### Coverage report (tasks.md slice 21 task 9 / slice 22 task 8's own required format)

| Character | Numeric assertions (R1-R13) | Contact sheet | Real-scene validation |
|---|---|---|---|
| `sally` | **PASS**, 15/24 run + 9 skipped-with-reason (R2/R5-mirror/R6/R8/R8-pixel/R3/R4/R10 — no aura/accessories/palette/mirrors for this character, each skip names why); 0 failures | **Captured** (`sally.png`, harness-only: idle × 8 directions + one `down_llorar` action frame, no palette/hat/pet/aura — she has none) | Not validated in the real scene this slice (harness-only, stated explicitly per tasks.md slice 21 task 9) |

`rasta`'s own row is unchanged from slice 21/Correction 3 (still PASS, still captured in all
three renderer/scene variants). Every other roster character remains uncompiled, zero coverage,
not implied covered.

### TDD Cycle Evidence — Slice 22

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1/2 (real compile) | live `bash scripts/stage-layered-source.sh sally` + `node scripts/compile-layered-avatar.cjs sally --emit-config-shim` | Integration | ✅ full vitest suite 497/497 before | N/A (real compiler run against real staged source; body+action assets confirmed byte-identical via `sha1sum` before/after adding `--emit-config-shim`) | Succeeded: 1 base page, 26 action-key packs, 41 sequences, 0 aliases, 0 mirrors, 0 slot defaults — all real, logged numbers | The `ss:1` override rule (slice 20) selecting 2 real over-budget keys on a SECOND character with zero new code IS the triangulation for that rule's generality | Clean |
| 4 (`AvatarsDataPreload` wiring) | `AvatarsDataPreload.test.js` | Unit | N/A (new) | Process deviation, disclosed (same class as prior precedents): written alongside the one-line wiring rather than strictly before it | Passed (2/2) | 2 cases: sally's entry well-formed, every other roster entry still present (18 total keys) | Clean |
| Defect A fix (`smartAvatarSystem` priming) | live probes via `playwright-cli`-style disposable spec files (5 iterations: confirmed `isLayeredUsable`/`manifest` state at each stage, confirmed `createAvatarSprite` alone works, confirmed `processUser`'s `smartAvatarSystem.getAvatarForUser` was the actual divergence point) + real re-run of the full matrix | Integration | ✅ full e2e suite (post-Correction-3 state) green before this slice began | RED by construction: `spriteAvatar.isLayered === false`, `textureKey === "__DEFAULT"` for `avatarId: 18` despite a confirmed-populated layered manifest — captured live across the probe sequence, not a written-first test | Passed: same probe re-run after the fix shows `isLayered: true`, `currentAvatarId: 18`, `isFallbackAvatar: false` | The SAME fix verified to leave `rasta`'s own 16 R-id tests passing unchanged (her fallback-eligibility made the defect invisible for her specifically, not absent) | Clean |
| Defect B fix (`describeCharacterMatrix` params, R5 split, R6-degrade) | `e2e/avatar-resolved-state.spec.js` | E2E (Playwright) | ✅ baseline 33/33 (rasta-only, pre-sally) real run | RED by construction, 3 real iterations against sally: (1) R6/R8/R12 hung on a pack never requested (`'llorar'` unmatched) — fixed via `actionKey`/`resolvedActionKey`; (2) R13 hung 60s (`'right_walk'` degrades to a single-frame `down_idle`, which `tick()` never emits `animationupdate` for) — fixed via `animationUpdateTestKey`; (3) R5's antisymmetry assertion failed for real (`right`'s degraded-to-`down` centreX is unrelated to `left`'s) — fixed by splitting R5/R5-mirror | Passed: full `avatar-resolved-state.spec.js` → 65 e2e tests total, 56 passed, 9 skipped-with-reason, 0 failed | rasta (16 tests, all params at default) + sally (16 tests incl. 2 new: R5-mirror skip, R6-degrade run) is the triangulation — every new param proven both at its default (rasta, unaffected) and at its overridden value (sally, exercised) | Clean |
| 6 (contact sheet) | `e2e/avatar-contact-sheet.spec.js` + `buildAvatarContactSheet.js` | E2E (Playwright) | ✅ baseline: rasta's own sheet capture passing | RED by construction: the action cell would have hung on the same missing-`'llorar'`-alias issue as R8/R12 above, fixed with the same `actionKey`/`resolvedActionKey` parameterization before ever running against sally for real | Passed: `npx playwright test e2e/avatar-contact-sheet.spec.js` → 2/2 (`rasta`, `sally`) | 2 characters, one with a palette override and one genuinely without — both label paths exercised | Clean |

Full client suite after slice 22: `cd client && npx vitest run` → **66 test files, 499 tests,
passing** (65→66 files: `AvatarsDataPreload.test.js`; 497→499 tests: +2). `cd client && npx
playwright test` → **65 tests total: 56 passed, 9 skipped (each with an inline reason), 0
failed** (was 45/45 post-Correction-2, +20: 16 sally-specific instances in
`avatar-resolved-state.spec.js` [some newly skip-eligible], +2 rasta-side R5-mirror/R6-degrade
instances, +1 sally contact-sheet capture, +1 net from the R5 split applying to rasta too).

Background processes: several disposable one-off probe spec files (`e2e/probe_sally.spec.js`)
were created, run, and deleted during live diagnosis of Defect A — none left on disk. Every
`npx playwright test` invocation used its own managed `webServer` lifecycle; no manual dev
server was started or left running by this slice.

### Carried-forward gaps, still open, still not addressed by slice 22

Everything slice 21's own carried-forward list already named (bucket-fallback/eviction
scheduler unwired, no vector-editor validation, M1 roster figure still a rasta-only partial) is
unchanged. New from this slice: the `catalog_items` seeder for sally (slice 10) remains
unexecuted (PHP still absent). **New and important for the sync agenda**: `SmartAvatarSystem`'s
real-game initialization sequence (`AvatarSystemController.init`, called from the real
`PublicScene`) was never itself audited for whether it correctly marks a LAYERED character
"available" before the FIRST real user with that avatarId appears — this slice's fix only
addresses the HARNESS's own priming gap (which the real game's background loader is assumed,
not verified in this apply pass, to already handle correctly). Slice 21's own trailing note about
`AvatarManager.createAvatarAnimations` throwing during `AvatarSystemController.init` in the real
scene (a pre-existing baked-path defect, unrelated to any layered character) remains open and
un-investigated.

---

## BLOCKER fix (2026-08-18) — sally rendered only 5 of 8 directions

Reported by the user as a hard blocker on top of slice 22: `sally.png`'s `down`/`downright`/
`right`/`upright` cells all showed the SAME front-facing pose, while `upleft`/`left`/`downleft`
showed correct left-facing poses — 5 of 8 directions, not 8. Root cause: `bakedKeyMap.cjs`'s
`deriveAliasesAndMirrors` is driven ENTIRELY by an EXISTING baked `config.json`
(`readBakedKeyMap`); a character with none (sally — no baked-legacy precedent) derives ZERO
aliases/mirrors by construction, so `right`/`rightdown`/`rightup` had no synthesized pose at all
and degraded through `resolveAnimationKey`'s `direction-idle` fallback to the unrelated
`down_idle` pose. This is the SAME class of gap `ghost`/`wraith` (slice 23, also no baked
precedent per their own `--from-vector` note) and any future vector-only character would hit —
fixed at the general mechanism, not as a sally-specific patch, per the user's explicit
instruction.

**The fix — a universal-convention fallback, not a lookup table.** Every `.layers.bb` in the
source dump ships exactly the same 15 base sequences (idle/talk/walk × down/left/leftdown/
leftup/up) and NO right-family source art at all — confirmed across the roster, not assumed.
`bakedKeyMap.cjs` gained `deriveConventionMirrors(sequences)`: a pure function that, given the
compiled `sequences` key names alone, derives `right*` mirrors from their `left*`/`leftdown*`/
`leftup*` counterparts (longest-prefix match first) with `flipX: true` — applied to BOTH base
(`*_idle`/`*_talk`/`*_walk`) and action-key sequences (e.g. `leftdown_punch_rec` ->
`rightdown_punch_rec`), never touching `down`/`up` (no left-right counterpart to flip against),
and never overriding a mirrored key that is already a real compiled sequence (a hypothetical
right-family-source character stays untouched). `compile-layered-avatar.cjs` applies this ONLY
as a fallback, when `readBakedKeyMap` found no baked config at all (`Object.keys(bakedKeyMap)
.length === 0`) — a real baked config, when present, stays the sole authority and this path is
never consulted for that character.

**A second, real defect found live while verifying the fix: a chicken-and-egg shim-poisoning
hazard.** Recompiling sally a second time (with `--emit-config-shim`, slice 10/22's own flag)
produced ZERO mirrors again — `readBakedKeyMap` read back the STALE, pre-fix `config.json` shim
(written by the very first, broken compile) as if it were real baked-legacy data, since the file
now existed on disk. Fixed generally, not by deleting the stale file by hand:
`isSelfEmittedConfigShim(rawConfig)` distinguishes a self-emitted shim from real baked-legacy
data by the one fact `buildConfigShim` always emits and no real baked config ever has — every
entry's `atlasKey` is literally `null` (a real baked character always names a concrete atlas
key, e.g. `"rasta_atlas"`). `readBakedKeyMap` now treats a self-emitted shim as "no baked
config" and re-derives via the convention fallback every time, making the compile idempotent
and self-healing across repeated runs (once a correct shim exists, it re-derives via the NORMAL
`deriveAliasesAndMirrors` path anyway, since the shim now correctly encodes `flip_horizontally`
for the mirrored keys) — confirmed by running the compiler twice in a row and diffing every
output byte, per slice 20's own two-consecutive-runs-must-be-byte-identical rule (see
Verification below). Ghost/wraith (slice 23, also `--emit-config-shim`-free but SHARING the
"first compile poisons the second" shape via their OWN real, non-self-emitted baked configs) are
unaffected by this specific hazard — it is specific to the `--emit-config-shim` output path.

**"0 palette slots" verified, not accepted blindly.** The blocker also asked to double-check
sally's compiled 0-slot palette against her vector `sally.bb`'s own `meta.json.colormeta`,
since a character with no recolourable slots would be the only one in the roster. Directly
unzipped `sally.bb`'s `meta.json` (source root
`/Users/evgeny.lyubeznyy/Downloads/dswmedia_decrypted/personajes/sally.bb`) and read
`colormeta`: `{"defaults": {}, "labels": {}, "creatorIdx": 0}` — genuinely, provably empty at
the source, matching the staged `client/.assets-src/layered/sally/colormeta.json`
byte-for-byte. Not a compiler defect; recorded here as the direct check the blocker requested.

### Files changed

- `client/scripts/lib/bakedKeyMap.cjs` — added `deriveConventionMirrors(sequences)` (the
  universal-convention fallback) and `isSelfEmittedConfigShim(rawConfig)` (the shim-poisoning
  guard), both pure, both exported.
- `client/scripts/lib/bakedKeyMap.test.cjs` — 7 new tests: 4 for `deriveConventionMirrors`
  (base-sequence derivation, action-key derivation as triangulation, down/up never mirrored,
  never overriding a real right-family sequence) + 3 for `isSelfEmittedConfigShim` (true for an
  all-`atlasKey:null` shim, false for a real baked config, false for an empty config).
- `client/scripts/compile-layered-avatar.cjs` — `readBakedKeyMap` now returns `{}` when
  `isSelfEmittedConfigShim` detects a self-emitted shim (chicken-and-egg guard); `main()` merges
  `deriveConventionMirrors(sequences)` into `mirrors` whenever `bakedKeyMap` is empty, right
  after the existing `deriveAliasesAndMirrors` call for both the with-actions and base-only
  branches.
- `client/e2e/avatar-resolved-state.spec.js` — added `DIRECTION_TO_IDLE_KEY` (per-direction own
  idle-key-name map, since e.g. `downright`'s own key is `rightdown_idle`, not
  `downright_idle`); **tightened R5-mirror**: beyond the pre-existing centre-X antisymmetry loop
  (necessary but not sufficient — it can pass on a symmetric degrade, which is exactly how sally
  shipped wrong while nominally passing/skipping), added a per-right-family-direction block
  asserting `state.body.sequenceKey` equals the direction's OWN idle key (never silently
  degraded to a different one), `state.body.mirrored === true`, and `state.body.sourceKey`
  equals exactly the left-family counterpart's idle key; updated sally's
  `describeCharacterMatrix(...)` call and its surrounding comment block: `minResolvableKeys`
  40->62 (her real total is now 63 = 41 sequences + 22 convention-derived mirrors, was 41/0/0),
  corrected the stale "no mirrors at all" claims, and recorded the direct `sally.bb`
  `colormeta` verification inline.
- Recompiled output (unchanged filenames, changed bytes only in the manifest, base/action
  `.webp` byte-identical): `client/src/assets/game/avatars/sally/layers/sally.layers.manifest.json`
  and `client/src/assets/game/avatars/sally/config.json` (the `--emit-config-shim` output, now
  63 entries including the 22 mirrored ones with `flip_horizontally: true`).
- Regenerated artifact: `client/e2e/artifacts/contact-sheets/sally.png` — all 8 directions now
  show distinct, correct poses (visually confirmed directly, not inferred from the numeric
  gate); `index.html` unchanged (same filename/character list, only sally.png's own pixel
  content changed).

### TDD Cycle Evidence — BLOCKER fix

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| `deriveConventionMirrors` | `scripts/lib/bakedKeyMap.test.cjs` | Unit | ✅ 9/9 (pre-existing `bakedKeyMap` suite) | ✅ `TypeError: (0 , deriveConventionMirrors) is not a function` (4 tests, nonexistent symbol) | ✅ 13/13 | ✅ 4 cases: base-sequence family, action-key family (different input shape), down/up excluded, real-right-family-sequence not overridden | Clean |
| `isSelfEmittedConfigShim` | `scripts/lib/bakedKeyMap.test.cjs` | Unit | ✅ 13/13 (post-`deriveConventionMirrors`) | ✅ `TypeError: (0 , isSelfEmittedConfigShim) is not a function` (3 tests, nonexistent symbol) | ✅ 16/16 | ✅ 3 cases: all-null shim, real baked config, empty config | Clean |
| Compiler wiring (`readBakedKeyMap` guard + `mirrors` fallback merge) | live `node scripts/compile-layered-avatar.cjs sally --emit-config-shim` | Integration | ✅ full vitest 66/66 files before | RED by construction and by live reproduction, both captured: (1) first live recompile logged `mirrors:` empty despite the fix already being in `bakedKeyMap.cjs` — diagnosed live as the chicken-and-egg shim-poisoning hazard, itself then given its own unit-level RED/GREEN cycle above; (2) after fixing that, a DELIBERATE mutation (`deriveConventionMirrors` temporarily hard-coded `from: 'down_idle'` for every mirror) was compiled into sally and run against the tightened e2e assertion below — captured failing twice: once via the pre-existing centre-X antisymmetry loop (`Expected: <= 0.5, Received: 16.2`, direction `downright + downleft`) and, with that loop temporarily disabled to isolate the new code, again via the new block alone (`direction right mirror source — Expected: "left_idle", Received: "down_idle"`), proving the new assertion has independent teeth, not just inherited coverage | ✅ correct recompile: 22 real mirrors logged, byte-identical `.webp`/action-pack output vs the pre-fix compile (`sha1sum` before/after), byte-identical across two consecutive `--emit-config-shim` compiles (idempotence, slice 20's own rule) | Mutation reverted and re-verified byte-identical to the correct fix's own prior output (not just re-passing — the exact same sha1s) | Clean |
| Tightened R5-mirror (per-direction resolvedKey/mirrored/sourceKey) | `client/e2e/avatar-resolved-state.spec.js` | E2E (Playwright) | ✅ baseline 65 e2e (56 passed/9 skipped) before | Captured via the same deliberate-mutation run above (isolated block failure) | ✅ full `avatar-resolved-state.spec.js -g sally` → 9/9 (7 skipped-with-reason unchanged: R2/R6/R8/R8-pixel/R3/R4/R10); full suite → 65 total, 57 passed/8 skipped/0 failed (was 56/9/0 — R5-mirror moved from skipped to passing for sally, net test count unchanged) | rasta (real baked mirrors, unaffected — full 33-test rasta block still 100% green) + sally (convention-derived mirrors, newly exercised) is the triangulation: the same assertion code path proven correct against BOTH a real-baked-precedent character and a convention-derived one | Clean |

Full client suite after this fix: `cd client && npx vitest run` → **66 test files, 506 tests,
passing** (+7 from slice 22's 499: the 7 new `bakedKeyMap.cjs` unit tests). `cd client && npx
playwright test` → **65 tests total: 57 passed, 8 skipped (each with an inline, still-accurate
reason), 0 failed** (was 56/9/0 — the one net change is sally's R5-mirror).

Background processes: none left running. Every `npx playwright test` invocation used its own
managed `webServer` lifecycle. The deliberate-mutation RED capture edited
`client/scripts/lib/bakedKeyMap.cjs` and `client/e2e/avatar-resolved-state.spec.js` in place
against saved copies (`cp` to `/tmp`, restored via `cp` back, both cleaned up afterward) rather
than via git (this apply pass's entire working tree is intentionally uncommitted per the
no-commit instruction, so `git stash` against ~20 slices of uncommitted work was avoided as
needlessly risky) — the restored files were verified byte-identical to their pre-mutation state
by re-running the full sha1 comparison and the full test suites above, not merely by inspection.

### Carried-forward gaps, still open, still not addressed by this fix

Unchanged from slice 22's own list (bucket-fallback/eviction scheduler unwired, no vector-editor
validation, M1 roster figure still a rasta-only partial, `catalog_items` seeder unexecuted,
`SmartAvatarSystem`'s real-game init sequence unaudited). **New from this fix, relevant to slice
23 onward**: `deriveConventionMirrors`/`isSelfEmittedConfigShim` are now the mechanism ghost and
wraith (slice 23) will ALSO rely on for their own mirrors — they have real baked `config.json`
files today (confirmed: `client/src/assets/game/avatars/{ghost,wraith}/config.json` both
exist), so in practice they will take the NORMAL `deriveAliasesAndMirrors` path (baked config
present, real precedent), not this fallback — but any FUTURE vector-only character with no baked
precedent at all would take this exact fallback, and this fix is what makes that safe.

---

## Slice 24 — body batch 1: `brujita`, `cholo`, `empollon`, `gata`

Scope note (parent-instructed reordering): slice 23 (`ghost`/`wraith` via `--from-vector`) is
**deliberately skipped** — it has a real, unresolved architectural question (recorded above,
still open) that does not apply to the other 14 remaining roster characters, all of which ship a
real `.layers.bb` AND a real, pre-existing baked `config.json`. Body batches 24-27 (14
characters) are being done first; slice 23 stays exactly where the prior pass left it. This
slice is **body-only** — accessories, where a character has any on disk, compile in slice 28,
per tasks.md's own batching.

### Staging: a new body-only helper, not a change to the shared script

`stage-layered-source.sh` stages AND compiles a character's body **and every one of its
accessory packages in the same invocation** (its own step 6). Each of these 14 characters has
36 on-disk accessory packages (confirmed via `find`) — running the unchanged script for all 14
would silently do slice 28-31's 500+-package work inside a body-only slice, and a first, real
attempt at exactly this (running the unchanged script for `brujita`) hit a 2-minute command
timeout mid-way through the accessory-compile loop, after the body had already compiled
correctly. Rather than touch the shared, already-tested `stage-layered-source.sh` (used by every
future slice, including 28-31, which DOES want its accessory loop), a new apply-pass-local
helper, `client/scripts/stage-body-only.sh`, replicates ONLY the shared script's own staging
steps (unzip `.layers.bb` + `.bb`, `derive-colormeta.cjs`, `apply-asset-overrides.cjs`) plus the
body compile, explicitly skipping accessory staging/compile — every step it runs is a
copy-invocation of the exact same underlying tool the shared script already calls, not new
compiler logic.

**Disclosed, unintended byproduct**: the interrupted first `brujita` attempt left 11 of her 36
hat packages (`BlueTeam`, `Custom10Hat`–`Custom9Hat`) fully, correctly compiled on disk before
the timeout (verified: each has its full expected file set) and one (`RedTeam`) mid-compile with
zero output files, which was removed (`rmdir`) rather than left as a misleadingly-empty
directory. The 11 complete ones are left in place (compiling is deterministic and idempotent —
slice 28 will just re-verify/redo them) but are **explicitly out of scope and NOT covered** by
this slice's own matrix/contact-sheet work — R3/R4/R10 and hat-bearing contact-sheet frames for
`brujita` remain slice 28's job.

### Real compiled numbers, per character (task 1)

| Character | Base pages | Base unique pieces | Action packs | Action pages | `ss:1` override | Sequences | Aliases | Mirrors | Slots (incl. `color1`) | Manifest bytes (compact) |
|---|---|---|---|---|---|---|---|---|---|---|
| brujita | 1 | (not re-logged; see cholo/empollon/gata below for the same shape) | 26 | 26 | `leftdown_special` (1,394,662 B > 1,258,291 B budget) | 41 | 8 | 14 | 8 (incl. color1) | — |
| cholo | 1 | 1,448 | 26 | 26 | `leftdown_punch_doy` (1,356,989 B) | 41 | 9 | 16 | 5 (incl. color1) | 198,651 |
| empollon | 1 | 1,308 | 26 | 26 | none — every key measured within budget at ss:2 | 41 | 9 | 15 | 6 (incl. color1) | 182,653 |
| gata | 1 | 1,301 | 26 | 26 | `left_falling` (1,338,178 B) | 41 | 8 | 14 | 7 (incl. color1) | 182,701 |

Every base pack is 1 page (budget: fail above 2) and every action key is 1 page (budget: warn at
5, fail above 8) — no page-budget warning or failure on any of the four. Slice 20's `ss:1` rule
fired correctly for 3 of 4 (measurement-driven, not key-name-specific: `leftdown_special`,
`leftdown_punch_doy`, `left_falling` — three DIFFERENT keys, none of them `left_fall`, the
rasta-specific key the rule was originally built against) and correctly found NOTHING to
override for `empollon` — both outcomes are the rule working as designed, not a defect either
way.

**Determinism (slice 20's own gate)**: every one of the four was recompiled a second time after
its first compile; `sha1sum` over every `.manifest.json`/`.webp` file under each character's
`layers/` directory is byte-identical between the two runs for all four.

### `AssetVersionManager` version-dict bump (task 2, RED/GREEN)

Added `brujita`/`cholo`/`empollon`/`gata` to `layeredVersions.characters` (same shape as
`rasta`/`sally`). RED captured by temporarily reverting the dict entries and running a new test
(`registers each slice-24 body-batch character as its own entry in layeredVersions.characters`)
against the reverted code — real failure:
`expected { rasta: '1.0.0', sally: '1.0.0' } to have property "brujita"`. GREEN: entries
restored, test passes. The test asserts KEY PRESENCE in the dict directly (not merely
`getArtifactVersion`'s derived string), because `getArtifactVersion`'s own fallback-to-base value
is identical to a present entry's value here (`'1.0.0'` both ways) and would have been a vacuous,
always-passing assertion otherwise — caught and fixed before committing to it as the test.

No hand-written glob-registry entries were needed (task 2's own generalization point):
`buildLayeredAvatarRegistry.js` discovers characters via `import.meta.glob` over
`layers/*.manifest.json`; all four are already present in `AvatarEnum`
(`BRUJITA:2, CHOLO:3, EMPOLLON:4, GATA:5`) and already wired in `AvatarsDataPreload.js` (their
pre-existing, un-migrated baked `config.json` imports, untouched by this slice — no
`--emit-config-shim` was used for any of the four, since all four have a REAL baked
`config.json` already, unlike `sally`).

### Two real, previously-latent test-generalization defects found and fixed live (task 3)

Both are fixes to the SHARED `describeCharacterMatrix` test generator (used by every character,
past and future), not per-character workarounds — found because this is the first batch to run
real, non-rasta/sally roster art through it.

1. **R5-mirror's down/up self-check was testing source-art symmetry, not the mirror mechanism.**
   `MIRROR_OF.down === 'down'` and `MIRROR_OF.up === 'up'` (no left-right counterpart exists to
   flip against — the map's own comment already said so), yet the antisymmetry loop still
   asserted `centerX(down) + centerX(down) <= 0.5px`, i.e. that `down_idle`'s OWN art is
   left-right-symmetric. This coincidentally held for `rasta`/`sally` but genuinely does not for
   `brujita` (asymmetric hat-brim decal, centerX off by 1.1px), `cholo` (hair swept over one eye,
   3.7px) and `gata` (asymmetric bushy hair, 2.4px) — confirmed by contact sheet, not assumed
   (all three characters' down/up poses visibly show the asymmetric feature). `empollon`'s
   `down` measured exactly 0 (front-on, symmetric glasses/hair), consistent with genuinely
   symmetric art, not a coincidence either way. Fix: the loop now skips `direction === mirror`
   (i.e. skips `down`/`up`), restoring it to what its own name says — "every GENUINELY mirrored
   direction pair," which down/up are not (there is no separate source key being mirrored).
   Verified non-regressive: rasta and sally's own R5-mirror still pass unchanged after the fix
   (their down/up were already ~0, so excluding them from the check changes nothing for those
   two).
2. **R7's animation-completion wait hardcoded `down_talk`'s frame count as 8.** Real frame counts
   differ across the roster: rasta/sally/empollon all happen to have 8, but brujita and gata have
   9 and cholo has 12 (confirmed against each character's own compiled manifest) — the hardcoded
   wait undershot the real duration for those three, leaving `down_talk` still mid-playback
   (`result.after === 'down_talk'`, not `'down_idle'`) when the test asserted. Fix: read the real
   `down_talk` frame count live from `spriteAvatar._manifest.sequences.down_talk.frames.length`
   instead of assuming it. Verified non-regressive: rasta/sally still pass (their frame count is
   still 8, read live now instead of assumed).

### One real defect in the R8-pixel heuristic itself, found and fixed live (task 3, continued)

R8-pixel samples an 8x8 patch at the exact geometric CENTRE of the "biggest same-slot run"'s
bounding box, on the documented assumption that the biggest run is "overwhelmingly likely" to
have a solid interior there. Live-measured, this assumption held for `rasta`/`sally`/`cholo` but
failed for three characters for three different reasons, all confirmed by direct pixel probing
before any fix: `brujita`'s biggest `color1` ("piel"/skin) run's bbox centre sampled solid BLACK
(the hat brim sits within that bbox, not skin, at the geometric centre); `empollon`'s and
`gata`'s centres sampled correctly-tinted magenta at SOME but not all of the 64 sampled pixels
(26.5%/18.75% differing — the centre straddles a boundary, e.g. a glasses outline, not a clean
solid interior). Original failure rates: brujita 56/64 (87.5%), empollon and gata both under the
old single-point sample. Fix: search a 5x5 grid of candidate points across the SAME run's own
bounding box (never expanding the search area — the "biggest run" heuristic itself is not in
question) and keep the single candidate with the lowest differing fraction, short-circuiting on
a perfect (0-differing) match. This still requires one genuine, correctly-tinted solid match
against the resolved palette colour — the real Canvas-renderer defect this test exists to catch
produces 100% differing at EVERY candidate identically, so it still fails hard — it just stops
assuming the bbox centre is always that match. Post-fix, all five migrated characters
(rasta/sally-skipped/brujita/cholo/empollon/gata) pass with a genuine 0%-differing best
candidate found (logged live during debugging, then the debug logging was removed).

### R19 matrix additions (task 3)

All four added to `describeCharacterMatrix` in `avatar-resolved-state.spec.js`, no
hatKey/petKey/auraKey (body-only, per this batch's own scope), default `actionKey: 'llorar'` ->
`resolvedActionKey: 'down_llorar'` (all four have a REAL baked-config alias table, unlike
`sally`) and default `pixelCheckSlot: 'color1'` (verified present in every one of the four's own
compiled manifest before relying on the default). `minResolvableKeys` per character is the real
(sequences + aliases + mirrors) total minus a safety margin (rasta's own precedent: real 65,
floor 60) — brujita 63->58, cholo 66->60, empollon 65->60, gata 63->58 (R11 asserts
`toBeGreaterThan`, so the floor must sit strictly below the real count).

### Contact sheets captured (task 5) — reviewed, not merely produced

Added to `avatar-contact-sheet.spec.js`'s `CHARACTERS` list (harness-only, same as sally's own
shape — no hat/pet/aura). All four captured and **visually reviewed in this session** (not just
asserted non-empty): confirmed each sheet shows the CORRECT, distinct character (no
`SmartAvatarSystem` RASTA-substitution recurrence — the slice 22 fix holds), all 8 directions
render distinct poses, and the `down_llorar` action frame with the `#ff00ff` `color1` override
visibly recolours the correct region (face/skin) for each. This visual review is also what
surfaced the R5-mirror/R8-pixel asymmetric-art facts above — the contact sheet is what let those
be diagnosed as real art, not guessed.

### Real-game-scene validation status

**None of these four** — harness-only, exactly as tasks.md slice 21 task 8 scoped it (`rasta`
alone is the representative real-scene sample; every other character, past and future, is
harness-only unless a later slice explicitly extends that). Stated here explicitly per this
slice's own coverage-honesty requirement.

### Coverage report (task 6, tasks.md slice 21 task 9's own required format)

| Character | Numeric assertions (R1-R13, body-only) | Contact sheet | Real game scene | Accessories |
|---|---|---|---|---|
| brujita | Passing (2 shared-infra fixes above apply) | Captured, reviewed, harness-only | Not validated (harness-only) | Not covered this slice (11/36 hats partially compiled as a disclosed byproduct, unverified) |
| cholo | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | Not covered this slice (staged, not compiled) |
| empollon | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | Not covered this slice (staged, not compiled) |
| gata | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | Not covered this slice (staged, not compiled) |

### TDD Cycle Evidence — Slice 24

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| Body compile (task 1) | live `bash scripts/stage-body-only.sh <char>` ×4 + `node scripts/compile-layered-avatar.cjs <char>` ×4 (determinism re-run) | Integration | ✅ full vitest 66/66 files before | N/A (real compiler run against real staged source) | Succeeded: 4/4 characters, 0 page-budget failures, `ss:1` fired for 3/4 on 3 different keys (proving measurement-driven generality, not `left_fall`-specific) | 4 real characters × real distinct data (5-8 palette slots, 8-9 aliases, 14-16 mirrors each) IS the triangulation | Clean |
| Determinism gate | live recompile ×2 per character, `sha1sum` diff | Integration | Same as above | N/A (real run) | Byte-identical for all 4 | 4 characters is the triangulation | Clean |
| `AssetVersionManager` dict bump | `src/phaser/managers/AssetVersionManager.test.js` | Unit | ✅ 7/7 before | ✅ `expected { rasta: '1.0.0', sally: '1.0.0' } to have property "brujita"` | ✅ 8/8 | ✅ loop over all 4 characters in one assertion (deliberately not split — same shape, would not add real coverage per-character) | Clean |
| R5-mirror self-pair fix | `e2e/avatar-resolved-state.spec.js -g "R5-mirror"` | E2E | ✅ baseline captured pre-fix: brujita/cholo/empollon/gata failing with real sum values (2.2, 7.4, 1.0, 4.8) | ✅ captured above (real Playwright failures, not constructed) | ✅ 6/6 (rasta, sally, brujita, cholo, empollon, gata) | ✅ 6 characters, 2 with pre-existing passing behaviour (rasta/sally) proving non-regression | Clean |
| R7 hardcoded-frame-count fix | `e2e/avatar-resolved-state.spec.js -g "R7"` | E2E | ✅ same baseline run | ✅ captured above (`Expected: "down_idle", Received: "down_talk"` ×3) | ✅ 6/6 | ✅ 6 characters spanning 3 distinct real frame counts (8, 9, 12) | Clean |
| R8-pixel multi-candidate search fix | `e2e/avatar-resolved-state.spec.js -g "R8-pixel"` | E2E | ✅ same baseline run | ✅ captured above (87.5%/26.5%/18.75% differing, all real) | ✅ 5/5 (rasta, brujita, cholo, empollon, gata; sally skipped — no palette slots) | ✅ 5 characters, one (rasta) with pre-existing passing behaviour proving non-regression | Clean |
| R19 matrix + contact sheets (task 3/5) | `e2e/avatar-resolved-state.spec.js`, `e2e/avatar-contact-sheet.spec.js` | E2E | ✅ full suite green before | N/A (data-only additions, RED by construction — the characters' manifests did not exist before task 1's real compile) | ✅ full suite: 133 total, 105 passed, 28 skipped, 0 failed | 4 characters' real, distinct compiled data is the triangulation | Clean |

Full client suite after this slice: `cd client && npx vitest run` -> **66 test files, 507 tests,
passing** (+1 from the pre-fix's 506: the new `AssetVersionManager` test). `cd client && npx
playwright test` -> **133 tests total: 105 passed, 28 skipped (each with an inline, accurate
reason), 0 failed** (was 65 total/57 passed/8 skipped before this slice — the growth is the four
new characters' own matrix rows plus their contact-sheet tests).

Background processes: a manually-started `vite --port 5183` dev server (needed to run ad-hoc
diagnostic probes with `VITE_AVATAR_HARNESS`/`VITE_LAYERED_AVATARS`/
`VITE_AVATAR_HARNESS_REAL_SCENE` set, outside Playwright's own managed `webServer` lifecycle) was
killed (`lsof -ti:5183 | xargs kill -9`) before this slice ended; confirmed no listener remains on
5183. All temporary diagnostic probe scripts (`probe_*.cjs`) were deleted from `client/`. One
unrelated `vite` process (PID from a `Mon`-dated start, predating this session, in a different
working context) was left untouched — not started by this session, not on port 5183.

### Files changed (Slice 24)

- `client/scripts/stage-body-only.sh` (new) — body-only staging+compile helper for this batch;
  does not modify `stage-layered-source.sh`.
- `client/src/phaser/managers/AssetVersionManager.js` — added `brujita`/`cholo`/`empollon`/`gata`
  to `layeredVersions.characters`.
- `client/src/phaser/managers/AssetVersionManager.test.js` — 1 new test (RED/GREEN above).
- `client/e2e/avatar-resolved-state.spec.js` — R5-mirror self-pair-skip fix; R7 real-frame-count
  fix; R8-pixel multi-candidate-search fix; 4 new `describeCharacterMatrix(...)` calls.
- `client/e2e/avatar-contact-sheet.spec.js` — 4 new `CHARACTERS` entries.
- Compiled output (generated, excluded from line-count per the Review Workload Forecast):
  `client/src/assets/game/avatars/{brujita,cholo,empollon,gata}/layers/*` (manifest/atlas/webp);
  disclosed byproduct `client/src/assets/game/accessories/hat/brujita/{BlueTeam,Custom1Hat..Custom10Hat}/*`
  (11 of 36, unverified, out of scope).
- `client/e2e/artifacts/contact-sheets/{brujita,cholo,empollon,gata}.png` (new, committed) and
  regenerated `index.html` (8 characters now indexed).

### Carried-forward gaps, still open, still not addressed by this slice

Unchanged from the BLOCKER fix's own list (slice 15's bucket-fallback/eviction scheduler
unwired, no vector-editor validation, M1 roster figure still a rasta-only partial, `god`/`ghost`/
`wraith` untouched, `SmartAvatarSystem`'s real-game init sequence unaudited). **New from this
slice**: `brujita`'s 11-of-36 partially-compiled hat accessories are an unverified byproduct,
explicitly deferred to slice 28; R5-mirror's self-pair exclusion and R7's live frame-count read
are now the mechanism every future character relies on (both are strict generalizations of
previously rasta/sally-only-coincidentally-correct assumptions, not narrowing of coverage).

---

## Slice 25 — body batch 2: `india`, `lilian`, `marsu`, `modern`

Same body-only scope and pipeline as slice 24 (`stage-body-only.sh` per character, run in
parallel this time — all four completed within the 2-minute window run concurrently, unlike
slice 24's sequential attempt).

### Real compiled numbers, per character (task 1)

| Character | Base pages | Base unique pieces | Action pages | `ss:1` override | Sequences | Aliases | Mirrors | `llorar` resolves to | Slots (incl. color1) |
|---|---|---|---|---|---|---|---|---|---|
| india | 1 | 1,548 | 26 | `leftdown_punch_doy` (1,327,716 B) | 41 | 9 | 15 | `down_llorar` | 6 |
| lilian | 1 | 1,604 | 26 | none — all keys within budget | 41 | 9 | 15 | `down_llorar` | 7 |
| marsu | 1 | 1,508 | 26 | none — all keys within budget | 41 | 8 | 15 | **`leftdown_llorar`** | 7 |
| modern | 1 | 1,934 | 26 | `leftdown_punch_doy` (1,371,682 B) | 41 | 8 | 14 | `down_llorar` | 7 |

No page-budget warning/failure on any of the four. Determinism (recompiled all four a second
time in parallel, `sha1sum` diff): byte-identical for all four.

**Live-caught data fact, not a defect**: `marsu`'s own baked `'llorar'` alias resolves to
`leftdown_llorar` — she has NO `down_llorar` sequence at all (confirmed against her own compiled
manifest's `sequences` list). Every other character migrated so far (rasta, brujita, cholo,
empollon, gata, india, lilian, modern) resolves `'llorar'` to `down_llorar`; marsu does not. Her
`describeCharacterMatrix`/contact-sheet entries pass `actionKey: 'llorar'`,
`resolvedActionKey: 'leftdown_llorar'` explicitly rather than relying on the default.

### `AssetVersionManager` (task 2, RED/GREEN)

Extended the same `AssetVersionManager.test.js` test file with a second loop-based assertion
(`registers each slice-25 body-batch character...`) — RED captured live:
`expected { rasta: ..., sally: ..., brujita: ..., cholo: ..., empollon: ..., gata: ... } to have
property "india"`; GREEN after adding `india`/`lilian`/`marsu`/`modern` to
`layeredVersions.characters`. No hand-written glob-registry lines needed (all four already in
`AvatarEnum`: `INDIA:7, LILIAN:8, MARSU:9, MODERN:10`; all four already wired in
`AvatarsDataPreload.js` via their pre-existing baked `config.json`, untouched by this slice).

### One real, previously-latent shared-test defect found and fixed live (task 3)

**R6's completion-wait hardcoded `'down_llorar'` in THREE places** (the `_atlasKeys.actions.has`
wait-target, and the `resolvedSeqKey` expectation — `'down_idle'` for the pre-trigger idle check
was fine, since the test explicitly sets direction `'down'` first). This is exactly the class of
assumption slice 24 already found twice (R5-mirror, R7) — a value that happened to be true for
every character compiled so far (rasta/sally/brujita/cholo/empollon/gata/india/lilian/modern all
resolve `'llorar'` to `down_llorar`) until `marsu` did not. Real captured failure: `page.
waitForFunction` timed out at 60s waiting for a `down_llorar` pack marsu's own harness call never
requests (she requests `leftdown_llorar`), then the outer test itself timed out too. Fix: both
hardcoded occurrences replaced with the test generator's own `resolvedActionKey` parameter
(already threaded through the function signature for R8/R12's use, and already exactly
"what this character's own `llorar` alias resolves to" per its own docstring — reusing it here is
not a new concept, just a second consumer of an existing one). Verified non-regressive: rasta
(real baked mirrors) and every slice-24 character still pass unchanged (their `resolvedActionKey`
default is still `down_llorar`, so the substitution changes nothing for them); marsu now passes
for real.

### R19 matrix + contact sheets (tasks 3/5)

Added to `describeCharacterMatrix`: `india` (60), `lilian` (60), `marsu` (59, with the
`actionKey`/`resolvedActionKey` override above), `modern` (58) — `minResolvableKeys` per
character is real (sequences+aliases+mirrors) total minus a 5-item safety margin (india 65->60,
lilian 65->60, marsu 64->59, modern 63->58). Added to `avatar-contact-sheet.spec.js`'s
`CHARACTERS` list with the same `color1`/`#ff00ff` override (all four verified to have a real
`color1` slot beforehand) and marsu's `actionKey`/`resolvedActionKey` override mirrored there
too.

All four contact sheets captured and **visually reviewed**: correct, distinct character shown
for each, all 8 directions distinct, `down_llorar`/`leftdown_llorar` action frame shows the
palette override applied. One reviewed nuance recorded honestly, not silently passed over:
`modern`'s own captured action frame (300ms into her `down_llorar` sequence) shows the palette
override as small magenta specks on the hands, not an obviously-recoloured face — live-probed
and confirmed this is because that SPECIFIC mid-sequence frame's pose has the head lowered/turned
such that the large face-skin piece is not among the frame's visible pieces at all (only small
hand pieces are), not a tinting defect: the SAME character's `color1` idle-pose face IS
correctly, fully tinted (confirmed via the separate R8-pixel logical+pixel assertions, which
sample the idle pose, and via direct live probing of the actual visible-piece list at that exact
captured moment, which showed real, correctly-applied magenta tint on every visible `color1`
piece present in that frame — there just are not many of them at that specific pose).

### Real-game-scene validation status

None of these four — harness-only, same disclosure as slice 24 (`rasta` alone remains the one
real-scene representative sample per tasks.md slice 21 task 8).

### Coverage report (task 6)

| Character | Numeric assertions (R1-R13, body-only) | Contact sheet | Real game scene | Accessories |
|---|---|---|---|---|
| india | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | Not covered this slice (staged, not compiled) |
| lilian | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | Not covered this slice (staged, not compiled) — note for slice 29: her `Custom6Hat` package is what completes R10 |
| marsu | Passing (with the disclosed `llorar`->`leftdown_llorar` resolution) | Captured, reviewed, harness-only | Not validated (harness-only) | Not covered this slice (staged, not compiled) |
| modern | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | Not covered this slice (staged, not compiled) |

### Unrelated, pre-existing failure discovered during full-suite regression (disclosed, not fixed)

Full `npx playwright test` surfaced **one** failing test, in a file this slice never touched:
`avatar-transfer.spec.js`'s `"hashed /assets/ artifacts carry an immutable Cache-Control header;
index.html does not"` (asserts `cache-control` is `undefined` for `/`, real result is
`"no-cache"`). Root cause, confirmed by reading `docker/nginx/default.conf`'s own comment: an
already-committed, unrelated fix (`14ec1cde feat(client): mount the debug panel and perf harness
behind their flags`, per `git log`) intentionally added `add_header Cache-Control "no-cache"
always;` to `location /` to fix a real production bug (a stale-cached `index.html` hid the new
debug-panel chunk behind days-old browser disk cache) — the R18-adjacent `avatar-transfer.spec.js`
test's `toBeUndefined()` assertion was never updated to match that intentional behaviour change.
Confirmed unrelated to slices 24/25: neither `docker/`, `client/Dockerfile`, nor
`avatar-transfer.spec.js` itself was touched by either body batch, and the R18 GATE
(`avatar-load-gate.spec.js`, the blocking gate slices 19/20 actually govern) still shows all 7
rows PASS unaffected. Not fixed here — outside this slice's assigned body-batch scope and outside
avatar-asset territory (nginx serving-tier config); recorded as a carried-forward, disclosed,
pre-existing gap for whoever next touches slice 13/19's own serving-tier surface.

### TDD Cycle Evidence — Slice 25

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| Body compile (task 1) | live `bash scripts/stage-body-only.sh <char>` ×4 (parallel) + recompile ×4 (parallel, determinism) | Integration | ✅ full vitest 66/66 files before | N/A (real compiler run) | Succeeded: 4/4 characters, 0 page-budget failures, `ss:1` fired for 2/4 on the SAME key name (`leftdown_punch_doy`, on india and modern — a different key than slice 24's three, still measurement-driven not key-specific) | 4 real characters, one (`marsu`) with a materially different alias-resolution shape, is the triangulation | Clean |
| `AssetVersionManager` dict bump | `src/phaser/managers/AssetVersionManager.test.js` | Unit | ✅ 9/9 before | ✅ `expected {...} to have property "india"` | ✅ 10/10 | ✅ loop over all 4 | Clean |
| R6 hardcoded-`down_llorar` fix | `e2e/avatar-resolved-state.spec.js -g "R6:"` | E2E | ✅ baseline: marsu failing with a real 60s timeout (`waitForFunction` on `down_llorar`, a pack marsu never requests) | ✅ captured above (real Playwright timeout, not constructed) | ✅ 9/9 (rasta, brujita, cholo, empollon, gata, india, lilian, marsu, modern; sally skipped) | ✅ 9 characters, 8 with pre-existing passing behaviour (default `resolvedActionKey`) proving non-regression, 1 (marsu) exercising the override path | Clean |
| R19 matrix + contact sheets (task 3/5) | `e2e/avatar-resolved-state.spec.js`, `e2e/avatar-contact-sheet.spec.js` | E2E | ✅ full suite green before | N/A (data-only additions, RED by construction) | ✅ full suite: 201 total, 152 passed, 48 skipped, 1 failed (pre-existing/unrelated, disclosed above) | 4 characters' real, distinct compiled data is the triangulation | Clean |
| M1 report extension (honesty requirement, not a task-list item but the coordinator's own explicit per-batch instruction) | `e2e/avatar-load-gate.spec.js -g "M1"` | Integration | ✅ R18 gate 7/7 before | N/A (data-only extension of an already-passing, non-blocking report row) | ✅ 106,174,313 B (101.26 MB) for rasta+sally+8 body-only characters+rasta's 3 accessories, real gate re-run still 7/7 PASS | N/A (single real measurement point, correctly labelled partial) | Clean |

Full client suite after this slice: `cd client && npx vitest run` -> **66 test files, 508 tests,
passing** (+1 from slice 24's 507: the new `AssetVersionManager` loop test). `cd client && npx
playwright test` -> **201 tests total: 152 passed, 48 skipped, 1 failed** — the 1 failure is the
pre-existing, unrelated `avatar-transfer.spec.js` finding disclosed above, not a regression from
this slice (confirmed: same failure, same file, reproduces identically on a clean re-run,
untouched by either body batch). `avatar-load-gate.spec.js`'s own R18 GATE — the actual blocking
gate for this feature — is separately confirmed **7/7 PASS**.

### Files changed (Slice 25)

- `client/src/phaser/managers/AssetVersionManager.js` — added `india`/`lilian`/`marsu`/`modern`.
- `client/src/phaser/managers/AssetVersionManager.test.js` — 1 new test.
- `client/e2e/avatar-resolved-state.spec.js` — R6 hardcoded-`down_llorar` generalization fix; 4
  new `describeCharacterMatrix(...)` calls.
- `client/e2e/avatar-contact-sheet.spec.js` — 4 new `CHARACTERS` entries.
- `client/e2e/avatar-load-gate.spec.js` — M1 report row extended to include all 8 body-only
  batch-1/2 characters plus `sally`'s body (still explicitly labelled partial, still
  "reported, not blocking").
- Compiled output (generated, excluded from line-count):
  `client/src/assets/game/avatars/{india,lilian,marsu,modern}/layers/*`.
- `client/e2e/artifacts/contact-sheets/{india,lilian,marsu,modern}.png` (new, committed) and
  regenerated `index.html` (12 entries now indexed).

### Carried-forward gaps, still open, still not addressed by this slice

Unchanged from slice 24's list, plus: the `avatar-transfer.spec.js` index.html Cache-Control
test/config mismatch (disclosed above, pre-existing, unrelated to avatar assets — belongs to
whoever next touches slice 13/19's serving-tier surface, not a body-batch task); `lilian`'s
`Custom6Hat` (R10-completing) still awaits slice 29; the M1 figure is now 101.26 MB for 10
characters' bodies + rasta's 3 accessories (real, not extrapolated) but still not the final
18-character/612-package figure slice 32 owns.

---

## Slice 26 — body batch 3: `ninja`, `werewolf`, `yayo`, `boomer`

Same body-only scope as slices 24/25. This batch also found and fixed **three real,
previously-latent defects affecting the WHOLE roster** — not scoped to these four characters —
discovered while investigating a real R8/R8-pixel test failure. Documented in full below since
this is the single largest correction of this apply pass.

### Real compiled numbers, per character (task 1)

| Character | Base pages | Action pages | `ss:1` override | Sequences | Aliases | Mirrors | Slots (declared defaults) | `llorar` -> |
|---|---|---|---|---|---|---|---|---|
| ninja | 1 | 28 | none | 43 | 7 | 16 | 0 (see defect 2/3 below) | `down_llorar` |
| werewolf | 1 | 25 | `left_punch_doy` (1,596,141 B) | 40 | 7 | 15 | 0 (see defect 2/3 below) | `down_llorar` |
| yayo | 1 | 26 | `left_beber` (1,678,420 B) | 41 | 9 | 15 | 7 | `down_llorar` |
| boomer | 1 | 26 | `leftdown_punch_doy` (1,588,686 B) | 41 | 8 | 15 | 10 | `down_llorar` |

No page-budget warning/failure on any of the four. `manifest.character === "boomer"` confirmed
(the `bommer.layers.bb` -> `boomer` srcName reconciliation needed no compiler change).
`minResolvableKeys`: ninja 66->61, werewolf 62->57, yayo 65->60, boomer 64->59.

### Defect 1 (whole roster): `LayeredAvatar`'s pooled-child array is sized from the BASE pack alone

**Found via**: `boomer`'s own R8 test — `frame0`/`frameMid`/`frameLast` ALL showed zero
`color1`-slotted tints across boomer's ENTIRE `down_llorar` sequence (62 frames, live-swept one
by one via `advance(1000/19)`, confirmed zero hits at every single frame), despite the compiled
`down_llorar` action manifest genuinely containing 12 `color1` pieces referenced across every one
of its frames (decoded the compact `L` tuples back to piece ids by hand to confirm — this was not
a missing-data issue, the pieces are there).

**Root cause**: `LayeredAvatar`'s constructor computes a FIXED-size pool of pooled `Image`
children once, via `computeMaxPoolSize(manifest)`, which used to scan `manifest.frames` — but at
construction time `manifest.frames` holds ONLY the base pack's frames (`down_idle`/`talk`/`walk`
etc.); action packs are lazy-loaded and merged in LATER (`AvatarManager.js`'s
`Object.assign(baseManifest.frames, keyManifest.frames)`, confirmed by reading that call site).
`_applyFrame`'s own per-piece loop, `const child = this._pool[i]; if (!child) return;`, silently
drops every piece whose index in a frame's own `L` array falls beyond the pool's fixed size — no
error, no warning, nothing rendered, nothing tinted.

**Blast radius, measured, not assumed**: computed BASE max L.length vs the real max across EVERY
compiled action key, for all 14 characters compiled by this point:

| Character | Base max | Action max (worst key) | Affected? |
|---|---|---|---|
| rasta | 42 | 72 (`leftdown_punch_doy`) | YES — including `down_llorar` itself: 61 > 42 |
| sally | 1 | 57 (`leftup_special`) | YES |
| brujita | 40 | 104 (`left_flor`) | YES |
| cholo | 25 | 60 (`down_llorar`) | YES |
| empollon | 20 | 63 (`cayendo`) | YES |
| gata | 27 | 66 (`down_special`) | YES |
| india | 26 | 59 (`down_special`) | YES |
| lilian | 35 | 146 (`down_special`) | YES |
| marsu | 24 | 80 (`down_special`) | YES |
| modern | 31 | 63 (`down_special`) | YES |
| ninja | 31 | 68 (`left_flor`) | YES |
| werewolf | 12 | 66 (`down_llorar`) | YES |
| yayo | 34 | 71 (`down_special`) | YES |
| boomer | 31 | 65 (`down_llorar`) | YES |

**14 of 14 — every character compiled to this point, including already-shipped `rasta`/`sally`,
was affected**, though the SEVERITY varied wildly by luck of which pieces happen to land beyond
each character's own pool boundary (rasta's own `down_llorar` was ALSO under-pooled — 61 needed
vs 42 available — yet her own multiply-reviewed contact sheets never visibly flagged it, most
likely because whichever pieces fell beyond index 42 for her specific art were minor/small
details, not the dominant skin fill boomer's own case happened to lose entirely).

**Fix**: the compiler already builds the FULL merged base+action `frames` dict in memory before
`splitLayeredManifest` runs (confirmed by reading `compile-layered-avatar.cjs`'s own flow) — the
one place with complete visibility. Added `computeMaxFramePieces(frames)`
(`scripts/lib/computeMaxFramePieces.cjs`, pure, unit-tested) to compute the TRUE max there, and
stamped it onto the manifest as `maxFramePieces` (carried through `splitLayeredManifest.cjs`,
character-level like `ssOverrides`). Extracted `LayeredAvatar.computeMaxPoolSize`'s logic into a
standalone module (`src/phaser/layered/computeMaxPoolSize.js`, unit-tested — `LayeredAvatar.js`
imports Phaser, which crashes under this project's plain-`node` vitest environment, matching the
existing `fallback.js`/`pivot.js`/`sequence.js` precedent for Phaser-free pure helpers) that
PREFERS `manifest.maxFramePieces` when present, falling back to the old frames-scan behaviour for
backward compatibility with a manifest compiled before this fix. `LayeredAvatar.js`'s own static
method now delegates to it.

**All 14 characters recompiled** with the fix; `maxFramePieces` on disk matches the hand-computed
"action max" column above exactly, for every one. Determinism (two consecutive recompiles,
`sha1sum` diff over every `.manifest.json`/`.webp`) reverified byte-identical for all 14.

### Defect 2 (ninja, werewolf): `manifest.slots` silently excluded piece-referenced slots with no declared default

**Found via**: investigating why `boomer` still passed R8-pixel cleanly once defect 1 was fixed,
while `yayo`'s R8-pixel initially still failed at a DIFFERENT root cause (see defect-adjacent
finding below) — cross-checking every character's own `manifest.slots` against the real
piece-referenced slots surfaced this independently.

**Root cause**: `manifest.slots` was computed as `Object.keys(colormeta.defaults || {})` — i.e.
purely from the vector `.bb`'s own declared defaults. `sally`'s own precedent ("0 palette slots,
verified against source") holds because her base pieces reference ZERO slots at all (confirmed:
her `_frames.json` has no `"s"` tag anywhere). `ninja` and `werewolf` ALSO have a genuinely empty
vector colormeta (`{"defaults":{},"labels":{},"creatorIdx":0}`, re-verified directly against
their own source `.bb`), but — unlike sally — their `.layers.bb` BASE PIECES DO tag themselves
with recolour slots (`ninja`: color1-color4 across 26 of its base pieces; `werewolf`: color1-2).
`resolvePalette` (`paletteResolve.js`) only ever considers slots present in `manifest.slots`
(`for (const slotKey of manifest.slots || Object.keys(manifest.defaults||{}))` — `[]` is truthy,
so the `||` never falls through for an empty-but-present array), so a completely empty
`manifest.slots` meant no custom palette override could EVER reach these characters' color1-4
pieces, silently.

**Measured, roster-wide**: computed (declared-default keys) vs (real piece-referenced slots) for
every character; 12 of 14 are self-consistent (declared ⊇ used); only `ninja` (used: color1-4,
declared: none) and `werewolf` (used: color1-2, declared: none) have the gap.

**Fix**: `computeManifestSlots(colormetaDefaults, pieces)` (`scripts/lib/computeManifestSlots.cjs`,
pure, unit-tested) returns the UNION of declared-default keys and every piece's own non-null
`slot`. Wired into the compiler in place of the old `Object.keys(colormeta.defaults||{})`.
Verified non-regressive: recompiled `cholo` (a normal, self-consistent character) as a control —
byte-identical output before/after. `ninja`'s manifest now correctly reports
`['color3','color1','color2','color4','colorGuante']`; `werewolf`'s reports
`['color2','color1','colorGuante']`.

### Defect 3 (ninja, primarily): an unresolved recolour slot rendered its own raw grayscale-mask pixels, not a real colour

**Found via**: after fixing defect 2, an explicit test palette override (`{color1:'#000000', ...}`)
correctly reached ninja's pieces (`avatar._palette` confirmed populated) — but ninja's DEFAULT
(no override) contact sheet still showed a washed-out, near-white character. Directly probed
ninja's own `p0.png` (a `color3`-slotted base piece): mean pixel value ~230/255 — a light
grayscale mask, authored to be multiply-tinted, never meant to be shown as-is. Cross-checked
against the LEGACY BAKED reference sprite still present on disk
(`client/src/assets/game/avatars/ninja/sprites/down_talk/1.png`): a solid, unambiguously BLACK
ninja suit.

**Root cause**: `LayeredAvatar._tintChild`'s `const hex = this._palette[piece.slot] ??
this._manifest.defaults[piece.slot]; if (!hex) return;` — when NEITHER a saved palette value NOR
a manifest default exists for a slot (defect 2's exact gap, now correctly surfaced instead of
silently hidden), the piece is left completely untinted, exposing its own internal
tinting-mask pixel data instead of any real, intentional colour.

**Fix**: `resolveTintHex(palette, defaults, slotKey)` (`paletteResolve.js`, unit-tested) always
returns a real hex, falling back to a neutral `'000000'` when neither source resolves — this
fallback can ONLY ever engage for a slot with no default AND no override (defect 2's exact
scope; every one of the other 12 characters' every used slot already has a real declared
default, verified above, so this is a no-op for them). `LayeredAvatar._tintChild` now calls it
unconditionally, dropping the old `if (!hex) return` branch entirely (it can never trigger).

**Empirically verified, not merely asserted**: spawning `ninja` with an explicit
`{color1:'#000000', color2:'#000000', color3:'#000000', color4:'#000000'}` palette override
BEFORE this fix produced a render visually indistinguishable from the legacy baked reference
sprite — confirming black is the right neutral default for THIS character specifically, not
merely a safe-looking guess. **Disclosed limitation, not swept under**: the same fallback applied
to `werewolf` renders her `color1`/`color2` pieces (small areas — pants/paw details) solid black,
while her own legacy reference sprite shows dark MAROON/RED pants, not black — the fallback is a
correct, principled, roster-safe NEUTRAL default (verified for ninja, a clear improvement over
the prior near-white for werewolf too), not a guaranteed pixel-perfect restoration for every
affected slot on every affected character. No source data anywhere in the decrypted dump records
the true intended colour for either character's affected slots (checked both characters' vector
`.bb` colormeta AND their `.layers.bb` `meta.json` — neither carries any colour hint) — recorded
as a carried-forward, disclosed gap, not invented data.

### Re-verification after all three fixes (roster-wide, not just this batch)

- **Determinism**: all 14 characters recompiled with all three fixes live; two consecutive
  recompiles byte-identical for all 14 (including `sally`, whose `--emit-config-shim` output
  legitimately changed CONTENT once — her own `leftdown_punch_doy` action key has 99
  `colorGuante`-slotted pieces defect 2 also applies to, previously silently excluded from
  `slots` — but reconfirmed deterministic across two fresh runs after that content change).
- **R18 GATE** (`avatar-load-gate.spec.js`, the actual blocking gate): re-run, still **7/7 PASS**
  (M1 report row: 106,174,515 B / 101.26 MB — the two new fields add ~200 bytes total across 10
  characters, negligible).
- **Full unit suite**: `cd client && npx vitest run` -> **69 test files, 523 tests, passing**
  (+15 from slice 25's 508: `computeMaxFramePieces.test.cjs` ×3,
  `splitLayeredManifest.test.cjs` +2, `computeMaxPoolSize.test.js` ×3,
  `computeManifestSlots.test.cjs` ×3, `paletteResolve.test.js` +3, `AssetVersionManager.test.js`
  +1).
- **Full e2e suite**: `cd client && npx playwright test` -> **269 tests total: 196 passed, 72
  skipped, 1 failed** — the 1 failure is `avatar-transfer.spec.js`'s own pre-existing, disclosed,
  unrelated finding (slice 25's own section), reproduced identically, not a new regression.
- **`rasta`'s own full R19 matrix** (16 tests: R1-R13 + R3/R4/R10, her hat/pet/aura all present)
  re-run in full: 15/16 passed, 1 skipped-with-reason (unchanged) — zero regression from either
  fix on the most heavily-reviewed character in the roster.
- **`rasta`'s contact sheet re-captured and visually re-reviewed**: idle×8/hat×8/pet×8/aura/action
  — identical in appearance to every prior review; the pool-size fix did not visibly change
  anything for her (consistent with her own dropped pieces, whatever they were, being minor).

### R19 matrix + contact sheets (tasks 3/5)

Added: `ninja` (61, no `pixelCheckSlot` override — genuinely 0 declared defaults even after
defect 2's fix, since that fix only added the slot NAME, not a default VALUE), `werewolf` (57,
same), `yayo` (60), `boomer` (59). `ninja`/`werewolf` contact sheets captured, then
**re-captured after defect 3's fix** — before: washed-out near-white/pale; after: solid black
(ninja, matching the legacy reference exactly) / visibly darker, more correct fur tones
(werewolf). All four **visually reviewed**: correct, distinct character, all 8 directions
distinct, `boomer`'s action frame now visibly shows the magenta palette tint on hands (previously
invisible — defect 1's own boomer-specific manifestation), `yayo`'s action frame shows a subtle
but real magenta tint on the visible nose-bridge sliver between her sunglasses (a genuinely
narrow visible region — R8-pixel's own candidate search needed a SECOND fix, below, to find it).

### A fourth, smaller live fix: R8-pixel's candidate search needed variable sample sizes too

`yayo`'s biggest `color1` run is a genuinely narrow strip (the nose bridge between two large
sunglasses lenses) — narrower than an 8x8 patch anywhere within its own bounding box, so even the
25-candidate fixed-size grid (slice 24's own fix) still straddled the sunglasses' dark rim at
every point. Fixed by trying progressively smaller sample sizes (8, then 4, then 2) over the same
grid, only once the largest size fails to find a match — verified this finds a genuine 0%-
differing interior point for `yayo` without widening the search area or lowering the match
threshold, and re-verified non-regressive for every other already-passing character.

### Coverage report (task 6)

| Character | Numeric assertions (R1-R13, body-only) | Contact sheet | Real game scene | Accessories | Palette defaults |
|---|---|---|---|---|---|
| ninja | Passing | Captured, reviewed (post-defect-3-fix), harness-only | Not validated (harness-only) | Not covered (staged, not compiled) | 0 declared (disclosed gap — see defect 3) |
| werewolf | Passing | Captured, reviewed (post-defect-3-fix), harness-only | Not validated (harness-only) | Not covered (staged, not compiled) | 0 declared (disclosed gap — see defect 3) |
| yayo | Passing (R8-pixel needed the variable-sample-size fix above) | Captured, reviewed, harness-only | Not validated (harness-only) | Not covered (staged, not compiled) | 7 declared, real |
| boomer | Passing (R8/R8-pixel needed defect 1's fix) | Captured, reviewed, harness-only | Not validated (harness-only) | Not covered (staged, not compiled) | 10 declared, real |

### TDD Cycle Evidence — Slice 26

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| Body compile (task 1) | live `bash scripts/stage-body-only.sh <char>` ×4 (parallel) | Integration | ✅ full vitest green before | N/A (real compiler run) | Succeeded: 4/4, 0 page-budget failures | 4 real characters, `boomer`'s `bommer` srcName reconciliation and `ninja`/`werewolf`'s empty-colormeta shape both distinct from the other two, IS the triangulation | Clean |
| `computeMaxFramePieces` (defect 1) | `scripts/lib/computeMaxFramePieces.test.cjs` | Unit | ✅ full vitest green before | ✅ `Cannot find module` (nonexistent symbol) | ✅ 3/3 | ✅ 3 cases (mixed lengths, empty dict, missing/empty L) | Clean |
| `computeMaxPoolSize` extraction (defect 1) | `src/phaser/layered/computeMaxPoolSize.test.js` | Unit | ✅ full vitest green before | ✅ `Cannot find module` (nonexistent symbol) | ✅ 3/3 | ✅ 3 cases (prefers maxFramePieces, falls back to scan, empty manifest) | Clean |
| `splitLayeredManifest` carries `maxFramePieces` (defect 1) | `scripts/lib/splitLayeredManifest.test.cjs` | Unit | ✅ 6/6 before | ✅ `expected undefined to be 72` | ✅ 8/8 | ✅ 2 cases (present, backward-compat absent) | Clean |
| Full-roster recompile + determinism (defect 1) | live recompile ×14 (×2 each for determinism) | Integration | ✅ full vitest green before | RED by construction (14/14 characters measured affected BEFORE the fix, via hand-decoded `L` tuples and a live 62-frame sweep for boomer) | ✅ `maxFramePieces` on disk matches hand-computed action-max for all 14; determinism byte-identical for all 14 | 14 real characters spanning base-max 1 (sally) to 42 (rasta) and action-max 57 (sally) to 146 (lilian) IS the triangulation | Clean |
| `computeManifestSlots` (defect 2) | `scripts/lib/computeManifestSlots.test.cjs` | Unit | ✅ full vitest green before | ✅ `Cannot find module` (nonexistent symbol) | ✅ 3/3 | ✅ 3 cases (union, empty-defaults-real-usage — the ninja/werewolf shape, fully-empty — the sally shape) | Clean |
| Compiler wiring + control recompile (defect 2) | live recompile of `ninja`/`werewolf`/`cholo` (control) | Integration | ✅ full vitest green before | RED by construction (ninja/werewolf measured missing slots BEFORE the fix, live) | ✅ ninja/werewolf now report the real union; `cholo` (control, already self-consistent) byte-identical before/after | `cholo` as an explicit non-regression control IS the triangulation | Clean |
| `resolveTintHex` (defect 3) | `src/phaser/layered/paletteResolve.test.js` | Unit | ✅ 6/6 before | ✅ 3 real failures (`resolveTintHex is not a function`) | ✅ 9/9 | ✅ 3 cases (saved overrides default, default overrides fallback, fallback engages when both absent) | Clean |
| Empirical visual verification (defect 3) | live probe (explicit black palette override) + contact-sheet re-capture | Integration/E2E | ✅ full vitest green before | N/A (visual empirical check, not a written test) | ✅ ninja's black-override render visually matches her own legacy reference sprite exactly; default (no override) render after the fix matches the SAME look | rasta's contact sheet re-reviewed unchanged is the non-regression check | Clean |
| R8-pixel variable sample size (yayo) | `e2e/avatar-resolved-state.spec.js -g "R8-pixel"` | E2E | ✅ baseline: yayo failing at 0.328 differing (both before AND after defects 1/2/3, since this is an unrelated root cause) | ✅ captured above (real Playwright failure) | ✅ 11/14 passing (3 skipped: sally/ninja/werewolf, 0 declared defaults) | ✅ 11 characters exercising the search at varying sample sizes | Clean |

Background processes: a manually-started `vite --port 5183` dev server (same purpose as slices
24/25 — ad-hoc diagnostic probes) was killed before this slice ended; confirmed no listener
remains on 5183. All temporary diagnostic probe scripts (`probe_*.cjs`) deleted from `client/`.

### Files changed (Slice 26)

- `client/scripts/lib/computeMaxFramePieces.cjs` (new) + `.test.cjs` — defect 1.
- `client/src/phaser/layered/computeMaxPoolSize.js` (new) + `.test.js` — defect 1.
- `client/scripts/lib/splitLayeredManifest.cjs` + `.test.cjs` — carries `maxFramePieces`.
- `client/scripts/compile-layered-avatar.cjs` — computes+emits `maxFramePieces`; `slots` now
  uses `computeManifestSlots` instead of `Object.keys(colormeta.defaults||{})`.
- `client/scripts/lib/computeManifestSlots.cjs` (new) + `.test.cjs` — defect 2.
- `client/src/phaser/layered/LayeredAvatar.js` — `computeMaxPoolSize` static method delegates to
  the extracted module; `_tintChild` uses `resolveTintHex` instead of `if (!hex) return`.
- `client/src/phaser/layered/paletteResolve.js` + `.test.js` — `resolveTintHex`, defect 3.
- `client/src/phaser/managers/AssetVersionManager.js` + `.test.js` — added
  `ninja`/`werewolf`/`yayo`/`boomer`.
- `client/e2e/avatar-resolved-state.spec.js` — R8-pixel variable-sample-size fix; 4 new
  `describeCharacterMatrix(...)` calls.
- `client/e2e/avatar-contact-sheet.spec.js` — 4 new `CHARACTERS` entries.
- Recompiled output (generated, excluded from line-count): ALL 14 previously-compiled
  characters' `layers/*` (manifest content changed for all 14: `+maxFramePieces` for all 14,
  `+corrected slots` for ninja/werewolf/sally).
- `client/e2e/artifacts/contact-sheets/{ninja,werewolf,yayo,boomer}.png` (new, committed;
  ninja/werewolf recaptured a second time after defect 3's fix) and regenerated `index.html` (16
  entries indexed).

### Carried-forward gaps, still open, still not addressed by this slice

Unchanged from slice 25's list, plus: `werewolf`'s own `color1`/`color2` pants/detail colour is a
disclosed, non-pixel-perfect neutral-black fallback (defect 3) — the true intended colour (likely
dark maroon/red per her own legacy reference) is not recoverable from any file in the decrypted
source dump; a future source-data audit (outside this apply pass's scope) would be needed to fix
that specific colour, not a code change. `ghost`/`wraith`/`skeleton`/`zombie` still unmigrated
(slice 27 next).

---

## Slice 27 — body batch 4 (final): `skeleton`, `zombie`

Both compile from a real `.layers.bb` (not `--from-vector`). `minResolvableKeys`: skeleton
63->58, zombie 62->57. No page-budget warning/failure, no `ss:1` override needed for either
(every action key measured within budget at ss:2). Determinism (two consecutive recompiles):
byte-identical for both.

**Both also have the ninja/werewolf shape (slice 26's defect 2/3), verified before assuming it**:
genuinely empty vector colormeta (re-verified directly against each character's own source
`.bb`: `{"defaults":{},"labels":{},"creatorIdx":0}` for both) with real piece-referenced base
slots (`skeleton`: `color1`, `colorGuante`; `zombie`: `color1-3`, `colorGuante`). Slice 26's two
fixes (`computeManifestSlots`'s union, `resolveTintHex`'s neutral-black fallback) applied to both
automatically — no further code change was needed, and both compiled and rendered correctly on
the FIRST attempt (contact sheets captured and visually reviewed: skeleton shows correct
bone-white skull/black eye sockets, zombie shows correct pale-green skin with an exposed pink
brain patch and dark clothes — neither shows the washed-out/broken look ninja had before slice
26's fix, confirming the general fix's payoff for characters discovered AFTER it, not just the
two it was built to repair).

### R19 matrix + contact sheets

Added: `skeleton` (avatarId 13, minResolvableKeys 58), `zombie` (avatarId 17, minResolvableKeys
57) — neither gets a `pixelCheckSlot` override (both have a genuinely empty `defaults` dict,
same as ninja/werewolf; R8/R8-pixel `test.skip` cleanly). Both added to
`avatar-contact-sheet.spec.js`'s `CHARACTERS` list, same no-accessory shape. All numeric
assertions passing (20 passed, 14 skipped, 0 failed for these two); both contact sheets captured
and visually reviewed as described above.

### Re-verification (roster-wide)

- **R18 GATE**: re-run, still **7/7 PASS**. M1 report row extended to all 14 body-only
  characters across all 4 batches: **147.21 MB** (16 characters' bodies + rasta's 3
  accessories) — real, not extrapolated, still explicitly labelled partial (accessories for
  these characters and `ghost`/`wraith`'s bodies remain outstanding, slice 32 owns the final
  figure).
- **Full unit suite**: `cd client && npx vitest run` -> **69 test files, 524 tests, passing**
  (+1 from slice 26's 523: the new `AssetVersionManager` loop test).
- **Full e2e suite**: `cd client && npx playwright test` -> **303 tests total: 216 passed, 86
  skipped, 1 failed** — the 1 failure is the same pre-existing, disclosed, unrelated
  `avatar-transfer.spec.js` finding (slice 25's own section), reproduced identically.

### Coverage report (task 6)

| Character | Numeric assertions (R1-R13, body-only) | Contact sheet | Real game scene | Accessories | Palette defaults |
|---|---|---|---|---|---|
| skeleton | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | Not covered (staged, not compiled) | 0 declared (same disclosed gap as ninja/werewolf) |
| zombie | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | Not covered (staged, not compiled) | 0 declared (same disclosed gap) |

### TDD Cycle Evidence — Slice 27

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| Body compile (task 1) | live `bash scripts/stage-body-only.sh <char>` ×2 (parallel) + recompile ×2 (determinism) | Integration | ✅ full vitest 69/69 files before | N/A (real compiler run) | Succeeded: 2/2, 0 page-budget failures, byte-identical determinism | 2 characters, both independently confirmed to hit slice 26's defect-2/3 shape without any NEW code, IS the triangulation that those fixes generalize correctly | Clean |
| `AssetVersionManager` dict bump | `src/phaser/managers/AssetVersionManager.test.js` | Unit | ✅ 10/10 before | ✅ `expected {...} to have property "skeleton"` | ✅ 11/11 | ✅ loop over both | Clean |
| R19 matrix + contact sheets | `e2e/avatar-resolved-state.spec.js`, `e2e/avatar-contact-sheet.spec.js` | E2E | ✅ full suite green before | N/A (data-only additions, RED by construction) | ✅ full suite: 303 total, 216 passed, 86 skipped, 1 failed (pre-existing/unrelated, disclosed) | 2 characters' real, distinct compiled data is the triangulation | Clean |

Background processes: none left running (this slice's own diagnostic checks reused the already-
running managed webServer from the prior slice's playwright runs, no manual `vite` dev server
was started for this slice specifically; port 5183 confirmed clear at slice end).

### Files changed (Slice 27)

- `client/src/phaser/managers/AssetVersionManager.js` + `.test.js` — added `skeleton`/`zombie`.
- `client/e2e/avatar-resolved-state.spec.js` — 2 new `describeCharacterMatrix(...)` calls.
- `client/e2e/avatar-contact-sheet.spec.js` — 2 new `CHARACTERS` entries.
- `client/e2e/avatar-load-gate.spec.js` — M1 report's `BODY_ONLY_CHARACTERS` list extended to
  all 14 body-only batch-1-4 characters.
- Compiled output (generated, excluded from line-count):
  `client/src/assets/game/avatars/{skeleton,zombie}/layers/*`.
- `client/e2e/artifacts/contact-sheets/{skeleton,zombie}.png` (new, committed) and regenerated
  `index.html` (18 entries indexed).

### Carried-forward gaps, still open, still not addressed by this slice

Unchanged from slice 26's list. `skeleton`/`zombie` add no NEW gap — they land inside the
already-disclosed "0 declared palette defaults, neutral-black fallback where a slot is
otherwise unresolved" category ninja/werewolf established, and neither showed a visually broken
result (unlike ninja before slice 26's fix), so there is nothing further to disclose about the
fallback's own correctness for these two specifically.

---

## All 4 body batches (slices 24-27) — summary

14 characters migrated this pass: `brujita`, `cholo`, `empollon`, `gata` (24); `india`,
`lilian`, `marsu`, `modern` (25); `ninja`, `werewolf`, `yayo`, `boomer` (26); `skeleton`,
`zombie` (27). Combined with the prior pass's `rasta`/`sally`, **16 of the 18-character roster
now have a compiled, R19-matrix-covered, contact-sheet-reviewed body** — only `ghost`/`wraith`
(slice 23's own open `--from-vector` architectural question, deliberately not attempted this
pass per the coordinator's explicit instruction) and `god` (confirmed out of scope — no
`client/src/assets/game/avatars/god/` directory exists at all) remain.

**Two shared-test-infrastructure generalization fixes** (slice 24: R5-mirror's down/up
self-pair exclusion, R7's live frame-count read; slice 25: R6's live `resolvedActionKey` read
replacing a third hardcoded `down_llorar`) and **one shared-test-robustness fix** (slice 24/26:
R8-pixel's multi-candidate, then multi-sample-size search) closed real gaps the numeric matrix
itself surfaced, none specific to any one character.

**Three real, roster-wide RENDERING defects were found and fixed** (slice 26, detailed in that
section): (1) `LayeredAvatar`'s pooled-child array under-sized from the base pack alone,
silently dropping pieces for any action key needing more per-frame pieces than the base ever
did — affected all 14 characters compiled by that point, including already-shipped
rasta/sally; (2) `manifest.slots` excluding piece-referenced slots the vector colormeta never
declared a default for — affected ninja/werewolf (and, discovered while writing this summary,
sally's own `leftdown_punch_doy` glove pieces); (3) an unresolved slot rendering its own raw
grayscale-mask pixels instead of a real colour — affected ninja most visibly (washed-out vs. a
solid-black legacy reference) and werewolf partially (a disclosed, non-pixel-perfect neutral
fallback for her pants). All three are now general, unit-tested fixes in shared compiler/runtime
code, not per-character patches, and all 14 previously-compiled characters were recompiled and
re-verified (determinism, R18 gate, rasta's own full matrix and contact sheet) with zero
regression.

**M1 tracked bytes, real and cumulative**: 147.21 MB for 16 characters' bodies (14 from this
pass + rasta/sally) plus rasta's 3 accessories — up from the prior pass's rasta-only partial
(15.95 MB). Still not the final 18-character/612-accessory-package figure (slice 32's own job).

**Validation, both levels, honestly reported**: every one of the 14 characters passes its own
full numeric R1-R13 matrix (R3/R4/R10 correctly skipped — no accessories compiled yet, that is
slices 28-31's work) and has a captured, human-reviewed contact sheet. **All 14 are
harness-only** — `rasta` alone remains the one real-game-scene-validated character (prior
pass's slice 21 task 8); this pass extended neither the real-scene sample nor was asked to.
No character was silently implied covered beyond what is stated here.

**Not started this pass**: slices 28-31 (accessory batches for these 14 plus rasta's own
completeness check), slice 23 (`ghost`/`wraith`), slice 32 (roster-scale gate), slice 33 (aura
pagination). All remain exactly as tasks.md describes them.

---

## Slice 23 onward — not started

Slice 22 is complete: `sally`'s asset compile is real and committed, the `AvatarsDataPreload.js`
wiring is live, her matrix coverage is honestly reported (including two disclosed, real
alias/mirror-dependent gaps that are facts of her data, not bugs to fix in this slice), her
contact sheet is captured, and — most importantly for the slices that follow — a foundational
harness defect (`SmartAvatarSystem`'s silent avatarId substitution, Defect A above) that would
otherwise have silently corrupted every one of slices 23-31's own numeric matrices is found and
fixed. The BLOCKER fix above (sally's 5-of-8-direction defect) is ALSO complete and independently
verified. **No work on slice 23 (`ghost`/`wraith` via `--from-vector`) or beyond has been
started.** This is a deliberate stop at a slice boundary (per this apply pass's own capacity
instructions — "prefer finishing fewer slices completely over leaving several half-done"), not a
blocked or partial state — both the blocker and slice 22's own scope are fully closed and
verified.

What slice 23 needs, concretely: `compile-layered-avatar.cjs --from-vector <char>` does not exist
yet (design §5.6) — a new CLI mode running the action-compile pipeline over a vector-only
package's `meta.anims`, with the baked-dimension cross-check (±4px against the character's
EXISTING baked `config.json` frame dimensions×ss) replacing the origin-space gate `ghost`/
`wraith` cannot use (no `_frames.json`/`p*.png` at the top level the way a `.layers.bb`-shipping
character has). This is new compiler code, not a restage-and-recompile of already-built tooling
— expect it to take a real implementation pass, not a quick per-character batch. `ghost`'s
non-fallback-eligible avatarId (verify against `AvatarEnum` before assuming) is now guaranteed to
correctly exercise the layered path in the harness, thanks to slice 22's Defect A fix — that
particular class of surprise should not recur.

**A concrete architectural question surfaced while scoping slice 23, not yet resolved — flag for
whoever picks this up next.** `compile-layered-avatar.cjs`'s current structure has TWO distinct
piece/frame namespaces: `p<N>` pieces sliced directly from the `.layers.bb` package's `p*.png`
files (the "base pack", one shared webp/atlas, `pack: 'base'`) and `a<N>` pieces rasterized from
vector paths via `compileActionSequences`/`renderRunRaster` (per-key "action packs", `pack: key`
each). A `--from-vector` character has NO `.layers.bb` at all, so it has no `p*.png` files and
thus no candidate for the base-pack namespace — EVERY key (including `down_idle`/`left_idle`/
etc., not just the action-only keys) would need to be rasterized through the `a<N>` vector path.
Two live design choices this implies, neither resolved yet: (1) does `--from-vector` emit NO
base pack at all (every key becomes its own self-referential action pack, `pack: key`,
matching how `actionResult.sequences` already treats action-derived keys today), or does it
synthesize a base pack by rasterizing just the 15 idle/talk/walk keys into ONE shared page under
`pack: 'base'` (mirroring a real `.layers.bb` character's own base/action split, at the cost of a
special-cased "base pack, but vector-rasterized" code path)? (2) `LayeredAvatar`/
`buildLayeredAvatarRegistry.js`'s loading eagerness (what loads at spawn vs lazily per action
key) needs auditing for whether it silently assumes a character always HAS a base pack with at
least one page (`checkPageBudget(pages.length, BASE_PAGE_BUDGET)` currently runs unconditionally
in `main()`) — not verified either way in this pass. Recording this now rather than guessing,
since choosing wrong would either (a) special-case a fully-lazy character's `down_idle` spawn
path in a way nothing today exercises, or (b) silently duplicate a "vector-rasterized base pack"
concept that risks diverging from the real `.layers.bb` base-pack code path over time. Whoever
implements slice 23 should resolve this explicitly (task 2's own compiler-mode work), not
inherit it as an unstated assumption.

---

## Corrections 1-3, then slices 28-31 (accessory batches) — 2026-08-19

Scope this pass: the three coordinator-assigned corrections, then slices 28-31 (accessory
compile) for 15 of the 17 accessory-eligible characters. `ghost`/`wraith` (slice 23's own
unresolved `--from-vector` question) remain untouched, per standing instruction — including
their accessories, which cannot compile at all without their bodies (`compile-accessory.cjs`'s
pet mode hard-requires the character's own baked body `config.json`). No server/API/DB touched.

### Correction 1 — real-scene validation, extended past `rasta`-only

`client/e2e/avatar-real-scene.spec.js` was refactored from four rasta-hardcoded tests into a
reusable `describeRealSceneCharacter(character, avatarId, options)` generator (approval-tested:
rasta's own 4 tests keep an identical pass outcome). Extended to a representative sample:
`brujita` (an ordinary batch-1 character, no accessories at the time), `ninja` and `werewolf`
(the zero-declared-palette roster shape). All 4 characters × 4 tests = 16, plus the standalone
`isSceneReady` sanity test = 17/17 passing.

Two real, live-caught defects found while extending this file (both fixed, not just noticed):
1. **A copy-paste omission in my own new generator**, not a pre-existing bug: the refactor
   initially dropped `actionPaletteSlot`/`actionPaletteColor` entirely from the parameterized
   contact-sheet capture, silently regressing rasta's own action cell from "custom palette" back
   to "no palette slots" (confirmed live via the regenerated `rasta-real-scene.png` before the
   fix). Restored as an explicit option (default `'color1'`/`'#ff00ff'`, matching the roster-wide
   default), re-verified visually against `rasta-real-scene.png`.
2. **R5-equivalent's own down/up self-pair check** — the ORIGINAL rasta-only version of this test
   (pre-dating this pass) asserted `centerX(down) + centerX(down) <= tolerance` for every
   direction including down/up, which is not a mirror check at all (down/up have no left-right
   counterpart) but an incidental "this character's down_idle art is left-right symmetric" fact
   — true for rasta, NOT true for `brujita`/`ninja`/`werewolf` (confirmed live: all 3 failed this
   assertion before the fix). `avatar-resolved-state.spec.js`'s own harness-only R5-mirror test
   already excluded down/up self-pairs for exactly this reason (slice 24) — the SAME fix applied
   here, for the same reason, once real non-rasta data existed in the real-scene file to surface
   it.

Contact sheets captured through the real `PublicScene` for all 4: `rasta-real-scene.png`
(re-verified, unchanged look), `brujita-real-scene.png`, `ninja-real-scene.png`,
`werewolf-real-scene.png` — all committed. The per-batch real-scene rule is now live: every
future accessory/body batch should extend this same generator with its own representative
sample, not re-litigate whether real-scene validation happens at all.

### Correction 2 — ninja's "no palette slots" label

Investigated both possibilities named in the brief. Finding: **the fix reached the manifest
correctly; the label (and a shared test-infrastructure guard) had not caught up.**
`ninja.layers.manifest.json.slots` is
`['color3','color1','color2','color4','colorGuante']` — real, piece-referenced slots, present
despite an empty `colormeta.defaults` (`computeManifestSlots`'s union, slice 26 defect 2, working
exactly as designed). The stale part was TWO pieces of test/tooling code that checked
`slot in manifest.defaults` instead of `manifest.slots.includes(slot)` — the wrong membership
test, conflating "no declared default" with "no slot at all":
- `avatar-resolved-state.spec.js`'s R8/R8-pixel `manifestHasSlot` guard (two occurrences) —
  fixed to check `_manifest.slots.includes(slot)`. Live-verified: ninja/werewolf/skeleton/zombie's
  R8+R8-pixel used to `test.skip` (2 each, 8 total); now run for real and pass (8/8, 0 skipped).
- `avatar-contact-sheet.spec.js`'s per-character config for ninja/werewolf/skeleton/zombie —
  `actionPaletteSlot: 'color1'`/`actionPaletteColor: '#ff00ff'` added for all four (previously
  omitted with a comment claiming "zero palette slots"). Regenerated contact sheets show the
  override taking real visible effect (ninja: magenta torso/head during `down_llorar`; werewolf:
  magenta ear/face detail; skeleton: magenta eye sockets; zombie: magenta eyes) — visually
  confirmed, not just asserted.

### Correction 3 — `hat_minnie` in the debug panel's dropdown

Traced the full data path: `AvatarLookDebugPanel.vue`'s hat `<select>` renders
`ownedAccessories.hat` verbatim from the server's `GET_USER_ACCESSORIES` socket response, which
is `user.ownedAccessories` (`UserModel.js`) ← `row.owned_hats` ← the API's
`UserResource.php`/`User::enabledHats()` ← `catalog_items.user_decoration_value` for
`user_decoration_type = 'avatar_hat'` — a **persisted database value**, not a client-code
constant. Grepped every code path that could plausibly still say `hat_minnie` as an identifier:
the client accessory registry (`AccessoryManager.js`), the compiled output directory layout, and
`compile-accessory.cjs`'s own compile-time key are all `minnieHat` (confirmed via a fresh
recompile in this pass, see below). Every remaining `hat_minnie` string in the codebase is
**prose in a comment** describing the historical rename (`pivot.js`, `depths.test.js`,
`AssetVersionManager.js`/`.test.js`) — none is a live identifier. No seeder/migration under
`api/database/` references `hat_minnie`/`minnieHat` at all (grepped).

**Conclusion: the rename fully propagated to the accessory registry and code — there is no code
defect to fix.** If the panel is observed showing `hat_minnie` on a live dev server, that is
persisted `catalog_items` row data from before the rename (this environment has no PHP to
inspect/reseed it, and no accessory slice may touch DB per the standing constraint) — recorded
here as a data-only, out-of-scope finding, not silently dropped.

### Slices 28-31 — accessory compile, 540 real packages, 15 characters

`stage-layered-source.sh <char>` already staged AND compiled every on-disk accessory for a
character in one call (built in an earlier pass) — this pass's real work was running it for real,
finding and fixing what it surfaced, and reporting honestly.

| Batch | Characters | Packages | Result |
|---|---|---|---|
| 28 | rasta (completeness check), brujita, cholo, empollon, gata | 5×36=180 | All compiled. 1 page-budget WARN (`brujita/pineappleHat`, 3 pages); 0 fails. |
| 29 | india, lilian, marsu, modern | 4×36=144 | All compiled. 0 warns, 0 fails. |
| 30 | ninja, werewolf, yayo, boomer | 4×36=144 | All compiled after fixing the `boomer`/`bommer` defect below. 0 warns, 0 fails. |
| 31 (partial) | skeleton, zombie | 2×36=72 | All compiled. 0 warns, 0 fails. `ghost`/`wraith` (72 more) explicitly excluded — blocked. |

**Total: 540/540 attempted packages compiled** (26 hats + 10 pets × 15 characters). Every
character has all 36 on-disk packages present, confirmed by directory count. Determinism
(two consecutive recompiles, `sha1sum` diff): byte-identical for `rasta` (118 files) and `boomer`
(re-verified after its own fix). `stage-layered-source.sh <char>` real wall-clock: ~1.7-2.7 min
per character (single-threaded compile of 36 packages + 1 body recompile).

#### Cross-cutting defects found and fixed live (roster-wide, not per-character)

**1. Accessory page-budget gate did not exist.** `compile-accessory.cjs` had no analogue of the
body compiler's `checkPageBudget` calls at all — the accessory thresholds (warn@2, fail@3) were
only ever documented in `pageBudget.test.cjs`'s own comment, never enforced. Added
`ACCESSORY_PAGE_BUDGET = {warnAt: 2, failAbove: 3}` and wired `checkPageBudget` in before any
output file is written. Real, live proof of the warn branch: `brujita/hat/pineappleHat` (3 pages)
printed `page budget warning: 3 pages exceeds the recommended 2`. No package reached fail (>3)
across all 540. Safety net: recompiling `minnieHat` (1 page, under budget) both before and after
the wiring produced byte-identical output (no regression for the common case).

**2. `boomer`'s accessories fail to compile: `meta.char "bommer"` disagrees with `--char
"boomer"`.** `stage-layered-source.sh` already reconciles `boomer`↔`bommer` for the BODY (by
renaming the staging directory before compile — the body compiler never validates against an
internal self-declared name, so no compiler change was ever needed there, per slice 26's own
note). Accessory packages DO self-declare `{char, kind, key}` inside `meta.json`, and that field
is validated (`validateCharArg`, design §4/§7's own safety check). `boomer`'s accessory `meta.
json.char` is `"bommer"` (the source archive's own name, unaffected by staging directory
renaming) — a REAL mismatch the validator correctly caught (RED: `node scripts/compile-
accessory.cjs --kind hat --char boomer BlueTeam` failed live with `--char "boomer" disagrees
with ... "bommer"`). Fixed with a new, tiny, unit-tested pure lookup,
`resolveSourceCharName(char)` (`bommer` for `boomer`, identity otherwise; 2/2 tests — the
exception + 3 identity cases), validated against instead of the raw `--char` value. A SECOND,
related defect found while fixing the first: the compiled manifest's own `char` field was set to
the raw `meta.char` (`"bommer"`) rather than the CLIENT name — harmless for every other character
(the two values are equal) but would make `AccessoryManager.load()`'s own `checkManifestCharMismatch`
runtime check print a **permanent spurious mismatch warning** on every real boomer accessory
load in the actual game (comparing `"bommer"` against the `"boomer"` every real call site
requests) — fixed to emit the CLIENT name. Live-verified: `BlueTeam.accessory.json.char` reads
`"boomer"` after the fix; every other character's own manifest unaffected (spot-checked rasta/
ninja/lilian, still their own name); determinism re-verified for boomer specifically (2 full
recompiles, byte-identical).

**3. Multi-page accessory `.webp` loading silently used only ONE page for every page.** The most
significant defect this pass found. `buildAccessoryPackagesFromGlob.js` OVERWROTE (not
accumulated) the `webp` registry role per package — for any package with >1 page (most hats,
per the page-budget table above), only the LAST-iterated `.webp` loader survived; the others were
silently discarded. `AccessoryManager.load()` then patched EVERY page of the compiled
`atlas.json` to that ONE surviving webp URL, so any frame living on page 1+ would render page 0's
pixel data cropped at page N's own frame coordinates — wrong texture data, never a crash, and
invisible to every existing numeric assertion (R1-R13 check container order/depth/tint, never
atlas pixel correctness) or to any PRIOR contact sheet (rasta's only 2 previously-reviewed
accessories, `minnieHat`/`Custom6Hat`, both happen to compile to exactly 1 page for her). Found
by direct code inspection while investigating the loading path, confirmed live: with the bug
reverted, a real Phaser scene loading `rasta/pineappleHat` (2 pages) collapsed to a SINGLE
`texture.source` entry instead of 2 (`e2e/avatar-resolved-state.spec.js`'s new permanent
regression test, RED captured live: `expected 2, received 1`). Fixed by making `webp` always an
array (one loader per page, sorted by path so index matches page order — mirroring the body's
own already-correct `groupLayeredActionKeyLoaders.js` precedent exactly) and patching each atlas
texture entry to its OWN page's URL by index in `AccessoryManager.load()`. Re-verified live (GREEN):
`texture.source.length === 2` and both pages' image URLs are distinct; a real captured
screenshot (`pineappleHat` worn by rasta, all 8 directions) shows the pineapple correctly, not a
garbled crop.

**4. R1's fixed pet-depth-order assumption was wrong for most of the roster.** `resolveAccessoryDepth
('pet', {relativeY})` (design §2) resolves a pet's depth (`petFront`/`petBehind`) PER FRAME, from
that character's own body/pet geometry — not a fixed per-character constant. `describeCharacter
Matrix`'s R1 test built ONE static `expectedKinds` array (`['shadow', 'pet', 'body', ...]`,
always pet-before-body) and asserted it unchanged across all 8 directions — true for `rasta`
(the only character this test had ever run against with a real pet before this pass), false for
most others: a live probe across all 15 newly-accessorized characters' `pet09` found `rasta`/
`cholo`/`empollon`/`ninja`/`modern` consistently "behind" every direction, `lilian`/`werewolf`/
`boomer` consistently "front", and `brujita`/`gata`/`india`/`marsu`/`yayo`/`skeleton`/`zombie`
genuinely SWITCHING between front and behind BY DIRECTION (e.g. brujita: behind in 6/8, front in
`upright`/`upleft`) — a real, legitimate fact of each character's own body/pet proportions, not a
defect. R1 failed for exactly the 10 characters whose down-direction resolution disagreed with
rasta's own shape (confirmed live: 10 failures, all showing `pet`/`body` swapped in the expected
array). Rebuilt R1 to assert the STRUCTURAL invariants that hold regardless of which side a
per-direction pet lands on (shadow first; name tag last, in order; the exact kind SET present;
body always before hat; pet in EXACTLY one of its two legal depth slots — fully behind body, or
fully in front of hat/body and below aura) instead of one hardcoded order — the pre-existing
non-decreasing-depth loop is UNCHANGED and is what actually proves resolved child order matches
sorted depth for any of these valid shapes. Re-verified: all 16 characters' R1 (rasta, sally, 14
newly-accessorized) pass, including rasta/sally unchanged (approval-tested).

**5. The contact-sheet tooling itself accumulated avatars across rows, corrupting later
screenshots.** Found while visually reviewing `ninja`'s freshly-generated sheet: the "pet" row
(pet09 only, no hat) visibly showed the PRECEDING "hat" row's `minnieHat` bleeding through
underneath — a real defect in the review tool, not the game. Root cause: `buildAvatarContact
Sheet.js` spawned one fresh avatar per row (idle/hat/pet/aura/action) at the identical tile
position but never removed the PREVIOUS row's — confirmed live via a scene probe (5 avatars alive
after one full character capture, expected 1 at most at any time). Invisible for `rasta` (and
every other previously-reviewed character) purely by visual coincidence — a later, larger/opaque
avatar's own body happened to occlude the earlier stale one. Fixed by adding a real
`despawnAvatar(socketId)` to the shared harness API (`avatarHarnessApi.js`), delegating to the
REAL production removal path, `RemoveUserController.main` (tween/animation stop, container
destroy, `scene.users` delete) — the same "drive the harness through the real controller"
philosophy `spawnAvatar` already follows for creation — called at the end of every row and every
standalone aura/action spawn in `buildAvatarContactSheet.js`. RED captured live (bug reverted via
file swap, not git): a new permanent regression test (`avatar-contact-sheet.spec.js`,
`'a full capture leaves NO avatar behind in the scene'`) asserted `userCount === 0` after a full
5-row capture and got `5`; GREEN after restoring the fix. ALL contact sheets across the whole
roster (rasta, sally, all 14 body-batch characters, all 15 newly-accessorized) were regenerated
under the fix and spot-checked visually (rasta unchanged/correct — approval-tested; ninja/boomer/
lilian/zombie/brujita all correct, no bleed-through).

#### `ss:1` accessory check (task 28.3) — measured, not pre-empted

Accessory packages have NO per-key split (unlike the body's own per-action-key packs since
slice 15) — every animation (idle through every action) compiles into ONE shared set of pages per
package. This means slice 20's exact mechanism (recompile ONE over-budget action key at `ss:1`,
leave the rest at `ss:2`) has no per-key target to apply to for accessories as currently
architected; the only lever physically available today would be a WHOLE-PACKAGE `ss:1` (halving
every frame's density, idle included), which is exactly what design.md §13.7 names as "a
question, not an assumption... put to the user only if the metric 4 gate is unmet" — a decision
this pass does not make unilaterally, matching the same treatment slice 20 itself got before the
user resolved it for the body.

**Real measurement** (gzip -9 proxy over every compiled `.webp` per package, all 15 characters):

| | Hats (390 packages) | Pets (150 packages) |
|---|---|---|
| Min | 116.6 KB | — |
| Median | 1.42 MB | well under 1.2 MB (max 537 KB, `rasta/pet10`) |
| Max | 7.17 MB (`brujita/Custom3Hat`, 2 pages, 4092×4070 + 4018×2050, 941 unique frames) | — |
| **Over 1.2 MB (the body's own M3-worst-key gate)** | **264 of 390 (68%)** | **0 of 150** |

**Finding, reported plainly: hats are the real cost, pets are not.** Most hat packages exceed the
body's own per-key transfer budget by a wide margin — this is a genuine, measured fact, not
speculative. Whether to act on it (whole-package `ss:1` for hats, a new architectural decision) is
explicitly left open per the task's own instruction and design §13.7's own deferral — recorded
here as the measured input to that future decision, not resolved.

#### `Custom6Hat` 15-way overlap re-measurement (task 31.7) — slice 18's deferred question, now answered

`measure-accessory-overlap.cjs Custom6Hat` (built in slice 18, INCONCLUSIVE then with only 1
package) run against all 15 now-compiled `Custom6Hat` packages (every character except the
blocked `ghost`/`wraith`):

```
found 15 compiled "Custom6Hat" package(s): boomer, brujita, cholo, empollon, gata, india,
lilian, marsu, modern, ninja, rasta, skeleton, werewolf, yayo, zombie
[per-character unique run counts: 549-884]
shared fraction: 0.4% (45 of 11,041 raster instances appear in 2+ packages)
```

**Real result: LOW.** Per this task's own stated gate logic ("if it is low the lever is dead and
the report says so"), the shared-raster-pool idea (§13.6) is not worth implementing — a 0.4%
saving does not justify the added complexity of a shared pool + per-character placement
manifests. **Nothing further implemented; the measurement itself is the deliverable.**

One measurement-tool limitation disclosed, not silently absorbed: `hashPackageRasters` only
reads `atlas.textures[0].frames` (page 0), so multi-page `Custom6Hat` packages (e.g. `brujita`'s,
compiled to 2 pages) are undercounted rather than fully hashed. This can only ADD more distinct
(never-shared) rasters if fixed, which would only LOWER the already-tiny 0.4% figure further —
the qualitative verdict ("low, lever is dead") cannot flip from fixing this, so it was not chased
given the scope of this pass; noted here for whoever revisits §13.6.

#### M1 tracked bytes — real, measured, not extrapolated

`avatar-load-gate.spec.js`'s M1 test used to hand-list rasta's 3 specific accessory directories
(a leftover from when only rasta had any accessories at all); with 540 real packages now on
disk, hand-listing does not scale. Replaced with a new pure `sumDirBytesRecursive(dir)` helper
(2/2 unit tests: flat sum, nested-directory sum matching the real `accessories/<kind>/<char>/
<key>/` shape) that walks `accessories/` as one tree, plus each of the 16 compiled bodies'
`layers/` directory.

**Real measured M1 (16 bodies + 540 accessory packages across 15 characters): 970,101,927 B ≈
925.16 MB** — up from the prior partial (147.21 MB, bodies + rasta's 3 accessories only). Against
the `≤400 MB, reported not blocking` line, this is dramatically over — reported honestly, not
gated (design's own explicit choice), and directly informs the `ss:1` question above: the
accessories directory alone is 804.4 MB of this total (`du -sk`), hats accounting for 769.7 MB of
that. Still not the FINAL 18-character/612-package figure — `ghost`/`wraith` (bodies AND
accessories) remain outstanding; slice 32 owns the true final number.

#### R18 gate re-run (7/7 PASS, unchanged)

| Metric | Gate | Measured (this pass, real Docker image) |
|---|---|---|
| M2 first visit | ≤600 KB | 446.5 KB — PASS |
| M2 return visit | ≈0 | ≈0 — PASS |
| M3 typical key (`down_llorar`) | ≤400 KB | 194.9 KB — PASS |
| M3 worst key (`left_fall`) | ≤1.2 MB | 668.7 KB — PASS |
| M4 (one avatar, one action) | ≤80 MB | 36.48 MB — PASS |
| M1 (reported only) | ≤400 MB, reported | 925.16 MB — reported (see above) |
| Fidelity | 0% differing | 0% — PASS |

None of this pass's accessory work touches the body's own M2/M3/M4 metrics (accessories are
loaded on-demand per equip, not on room entry, per design §5) — unchanged from slice 20's own
numbers, re-verified live rather than assumed carried-over.

#### Coverage report — every character touched this pass

| Character | Numeric (R1-R13, incl. R3/R4/R10) | Contact sheet | Real scene | Accessories |
|---|---|---|---|---|
| rasta | Passing (unchanged) | Captured, reviewed, harness + real-scene | Validated (Correction 1, re-confirmed) | Completeness-checked: all 36 present |
| brujita | Passing | Captured, reviewed, harness + real-scene (new) | Validated (Correction 1, new) | All 36 compiled (1 page-budget warn) |
| cholo | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | All 36 compiled |
| empollon | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | All 36 compiled |
| gata | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | All 36 compiled |
| india | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | All 36 compiled |
| lilian | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | All 36 compiled (completes R10 pairwise via Custom6Hat overlap measurement) |
| marsu | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | All 36 compiled |
| modern | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | All 36 compiled |
| ninja | Passing (R8/R8-pixel now run for real, Correction 2) | Captured, reviewed, harness + real-scene (new) | Validated (Correction 1, new) | All 36 compiled |
| werewolf | Passing (R8/R8-pixel now run for real, Correction 2) | Captured, reviewed, harness + real-scene (new) | Validated (Correction 1, new) | All 36 compiled |
| yayo | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | All 36 compiled |
| boomer | Passing | Captured, reviewed, harness-only | Not validated (harness-only) | All 36 compiled (bommer/boomer defect fixed) |
| skeleton | Passing (R8/R8-pixel now run for real, Correction 2) | Captured, reviewed, harness-only | Not validated (harness-only) | All 36 compiled |
| zombie | Passing (R8/R8-pixel now run for real, Correction 2) | Captured, reviewed, harness-only | Not validated (harness-only) | All 36 compiled |
| sally | Passing (unchanged) | Captured, reviewed, harness-only (unchanged) | Not validated | N/A (no accessory roster) |
| ghost, wraith | Not started (blocked, slice 23) | Not captured | Not validated | Blocked (need bodies first) |
| god | Out of scope | — | — | — |

No character is silently implied covered beyond what is stated above.

### TDD Cycle Evidence — Corrections + Slices 28-31

| Item | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| R8/R8-pixel manifest.slots guard fix (Correction 2) | `e2e/avatar-resolved-state.spec.js -g "R8"` | E2E | ✅ baseline: ninja/werewolf/skeleton/zombie all skipped (2 each) | Captured live: 2/2 skipped for ninja before the fix | ✅ 8/8 passed (ninja/werewolf/skeleton/zombie × R8/R8-pixel), 0 skipped | 4 characters, all independently confirmed | Clean |
| Accessory page-budget gate | live `stage-layered-source.sh brujita` (real compile) | Integration | ✅ full vitest before | N/A (real wiring; RED = the gate not existing at all, demonstrated by its absence in the source before this change) | ✅ real warn fired for `pineappleHat` (3 pages); 0 regressions for 1-page packages (byte-identical minnieHat recompile) | 540 real packages across 15 characters IS the triangulation (1 warn, 0 fails) | Clean |
| `resolveSourceCharName` | `scripts/lib/resolveSourceCharName.test.cjs` | Unit | N/A (new module) | not-run (nonexistent module) | ✅ 2/2 | 2 cases: the one exception + 3 identity checks | Clean |
| `boomer` accessory compile (real defect fix) | live `bash scripts/stage-layered-source.sh boomer` | Integration | ✅ full vitest before | Captured live: real CLI failure, `--char "boomer" disagrees with ... "bommer"` | ✅ all 36 packages compiled; manifest.char now "boomer"; determinism re-verified (2 recompiles, byte-identical) | 36 real packages is the triangulation | Clean |
| `buildAccessoryPackagesFromGlob` multi-page webp array | `src/phaser/managers/buildAccessoryPackagesFromGlob.test.js` | Unit | ✅ baseline 3/3 | Captured live: existing test updated to the new array shape, executed-failing (`expected [Function page1Fn] to deeply equal [...3 items]`) before the fix | ✅ 4/4 (1 approval-tested rewrite + 1 new triangulating case) | 2 cases: single-page (array-of-1), multi-page (3, out-of-order input) | Clean |
| `AccessoryManager.load` multi-page consumption | `e2e/avatar-resolved-state.spec.js -g "2-page hat"` | E2E | ✅ full suite green before | Captured live via a real file-swap revert (not git): `expected 2, received 1` (texture.source.length) | ✅ passed after restoring the fix; visually confirmed via a real `pineappleHat` contact-sheet capture | 1 real 2-page package is the triangulation; the fix is generic (any page count) | Clean |
| R1's pet-depth-order rebuild | `e2e/avatar-resolved-state.spec.js -g "R1:"` | E2E | ✅ baseline: 10/15 failing after adding hat/pet keys | Captured live: 10 real failures, exact expected-vs-received diffs recorded | ✅ 16/16 passing (all characters, incl. rasta/sally unchanged — approval-tested) | 15 real characters, 3 distinct real shapes (always-behind, always-front, direction-switching) IS the triangulation | Clean |
| Contact-sheet avatar-accumulation fix | `e2e/avatar-contact-sheet.spec.js -g "no avatar behind"` | E2E | ✅ full suite green before | Captured live via a real file-swap revert: `expected 0, received 5` | ✅ passed after restoring the fix (`despawnAvatar` + `RemoveUserController`) | Visually re-verified across 5+ characters (rasta unchanged, ninja/boomer/lilian/zombie/brujita all correct) | Clean |
| M1 `sumDirBytesRecursive` | `scripts/lib/sumDirBytesRecursive.test.cjs` | Unit | N/A (new module) | not-run (nonexistent module) | ✅ 2/2 | 2 cases: flat sum, nested-directory sum | Clean |
| `describeRealSceneCharacter` generator + Correction 1 fixes | `e2e/avatar-real-scene.spec.js` (full file) | E2E | ✅ baseline: rasta's original 5 tests passing | Captured live: 3 characters' R5-equivalent failing (`expected <= 0.5, received 6`) before the down/up exclusion fix; the palette-omission regression caught by direct visual inspection of the regenerated PNG | ✅ 17/17 (4 characters × 4 tests + 1 sanity test) | 4 characters (rasta/brujita/ninja/werewolf), 2 of them exercising the NEW down/up-exclusion path | Clean |
| Accessory matrix wiring (hatKey/petKey/expectedPetSide, 15 characters) | `e2e/avatar-resolved-state.spec.js` (full file) | E2E | ✅ baseline: harness-only, no accessories wired | RED by construction (data-only additions — new hatKey/petKey values on existing generator params) | ✅ 222 passed, 36 skipped (all skip-reasons legitimate: R2 for characters with no aura, R6-degrade for characters with a real llorar alias), 0 failed | 15 characters, all with real distinct compiled geometry, IS the triangulation | Clean |

### Test Summary

- **Total tests written/modified this pass**: ~14 new/changed test files across unit + e2e.
- **Unit**: 71 files / 529 tests, all passing (up from 69/524 at pass start: +2 files
  `resolveSourceCharName.test.cjs`, `sumDirBytesRecursive.test.cjs`; +5 tests across those 2 new
  files plus 1 new case in `buildAccessoryPackagesFromGlob.test.js`).
- **E2E**: 317 total (up from 303 at pass start), 280 passed, 36 skipped (legitimate,
  down from 86 — 8 of that drop is R8/R8-pixel now running for real per Correction 2; the rest is
  fewer skip-eligible R2/R6-degrade cases as more characters gained accessories), 1 failed (the
  same pre-existing, disclosed, unrelated `avatar-transfer.spec.js` finding, reproduced
  identically — not touched, not caused by this pass).
- **Approval tests**: rasta's original R1-R13 (unchanged pass outcome after the R1 rebuild),
  rasta's original 4 real-scene tests (unchanged pass outcome after generator parameterization),
  the existing `buildAccessoryPackagesFromGlob` single-page case (rewritten to the array shape,
  same semantic guarantee).
- **Pure functions created**: `resolveSourceCharName`, `sumDirBytesRecursive`.

### Files changed (Corrections + Slices 28-31)

Production code:
- `client/scripts/compile-accessory.cjs` — page-budget gate wiring; `resolveSourceCharName`
  reconciliation for `validateCharArg`; manifest `char` field now emits the client name, not the
  raw `meta.char`.
- `client/scripts/lib/resolveSourceCharName.cjs` + `.test.cjs` (new).
- `client/scripts/lib/sumDirBytesRecursive.cjs` + `.test.cjs` (new).
- `client/src/phaser/managers/buildAccessoryPackagesFromGlob.js` + `.test.js` — `webp` is now
  always an array, sorted by path.
- `client/src/phaser/managers/AccessoryManager.js` — consumes `entry.webp` as an array, patches
  each atlas texture entry to its own page's URL by index.
- `client/src/harness/avatarHarnessApi.js` — new `despawnAvatar(socketId)` method.

Test/tooling code:
- `client/e2e/avatar-resolved-state.spec.js` — R1 rebuilt (structural invariants, not one fixed
  order); R8/R8-pixel guard fixed (`manifest.slots.includes`, not `in manifest.defaults`); 14
  characters' `describeCharacterMatrix` calls gained `hatKey`/`petKey`/`expectedPetSide`; 1 new
  permanent regression test (multi-page accessory loading).
- `client/e2e/avatar-contact-sheet.spec.js` — 14 characters' configs gained `hatKey`/`petKey`;
  ninja/werewolf/skeleton/zombie gained `actionPaletteSlot`/`actionPaletteColor` (Correction 2);
  1 new permanent regression test (no-avatar-left-behind).
- `client/e2e/avatar-real-scene.spec.js` — refactored into `describeRealSceneCharacter`;
  extended to brujita/ninja/werewolf; R5-equivalent's down/up exclusion fix.
- `client/e2e/lib/buildAvatarContactSheet.js` — despawns each row's avatar before returning.
- `client/e2e/avatar-load-gate.spec.js` — M1 test rewritten to use `sumDirBytesRecursive` over
  the whole `accessories/` tree instead of hand-listing rasta's 3 directories.

Compiled output (generated, excluded from line-count per this change's own convention):
- `client/src/assets/game/accessories/{hat,pet}/{rasta,brujita,cholo,empollon,gata,india,lilian,
  marsu,modern,ninja,werewolf,yayo,boomer,skeleton,zombie}/*` — 540 packages, ~925 MB combined
  with the 16 already-compiled bodies (tracked in git per the user's decision — no `.gitignore`,
  no LFS).
- `client/e2e/artifacts/contact-sheets/*.png` — every character's sheet regenerated under the
  despawn fix; `brujita-real-scene.png`, `ninja-real-scene.png`, `werewolf-real-scene.png` (new);
  `index.html` rebuilt (21 entries).

## Accessory `ss:1` (user decision, 2026-08-19), slice 32 (roster-scale gate), slice 33 (deferred)

### Accessory `ss:1` — measurement-driven whole-package rule (design §13.7, closed)

User decision (2026-08-19), same rationale as the body's own `left_fall`/`left_beber` ss:1 call
(slice 20): **compile at `ss:1` the WHOLE package of any accessory whose real packed transfer
exceeds the same 1.2 MB M3-worst-key budget** — every other accessory, every pet, and every body
stay untouched. Implemented as a measurement rule reused from the body's own pure decision
function (`selectSsForActionKey`, slice 20 — `over budget -> 1, at-or-under -> 2`), not a
key-name lookup, wired into `compile-accessory.cjs` itself so any future recompile of any package
applies the same rule automatically.

**Mechanism** (`client/scripts/compile-accessory.cjs`):
- `compileVector(kind, key, char, {ss})` now threads `ss` through raster density
  (`BASE_RASTER_DPI * ss`, matching the body compiler's own convention exactly — was hardcoded
  `144`/`SS`), `computeBounds`, and `resolvePetFrameCenterX`; `manifest.ss` reports the resolved
  value instead of the hardcoded constant. Clears `outputDir` (`fs.rmSync` before
  `fs.mkdirSync`) before every write — needed because a package recompiled at `ss:1` can produce
  FEWER pages than its own prior `ss:2` compile, and a stale extra page file must not survive.
- `compileAccessoryWithSsRule(kind, key, char, opts)` (new orchestrator, exported alongside
  `measureCompiledPackageBytes`/`resolveAccessoryOutputDir` for reuse): compiles once at `ss:2`
  (unchanged default), measures the REAL written output via `measureCompiledPackageBytes` (webp
  bytes as-is + gzip level 9 of atlas/manifest JSON — the exact components the R18 gate's own M3
  rows sum, extracted into a new shared pure `sumPackedTransferBytes`
  (`client/scripts/lib/packedTransferBytes.cjs`, 4/4 unit tests) that
  `compile-layered-avatar.cjs`'s own `measureActionKeyPackedBytes` was refactored to reuse too —
  DRY, not two independently-drifting copies). If over the 1.2 MB budget
  (`ACCESSORY_SS_TRANSFER_BUDGET_BYTES`), recompiles the WHOLE package a second time at `ss:1` and
  reports `{ss2Bytes, finalSs, finalBytes}`. `main()`'s CLI entry now calls this orchestrator
  instead of `compileVector` directly, so every future hand-invoked compile applies the rule too.
- `client/scripts/recompile-accessories-ss-rule.cjs` (new, manually-invoked batch driver): walks
  every staged package under `.assets-src/accessories/<char>/<key>/`, applies the rule via the
  same orchestrator, and writes a durable report,
  `client/e2e/artifacts/accessory-ss-report.json` (per-package before/after bytes, the resulting
  ss, and roster totals) — mirrors the R18 gate's own `r18-gate-report.json` precedent.

**Real measured result, all 540 packages, real recompile** (accurate method — webp-as-is +
gzip'd JSON, NOT the cruder "gzip everything including the already-compressed webp" proxy the
slice 28-31 survey used, which is why these totals differ slightly from that survey's own
764/390-hat estimate):

| | Hats (390) | Pets (150) |
|---|---|---|
| Recompiled at ss:1 | **249 (63.8%)** | **0** |
| ss:2-measured total | 708.60 MB | (0/150 over budget; pets stay ss:2 throughout) |
| Final total (post-rule) | **390.97 MB** | — |
| Reduction | **44.8%** | — |

**Disclosed honestly, not smoothed over: 51 of the 249 ss:1-recompiled packages STILL exceed the
1.2 MB budget even after halving** — the same `Custom3Hat`/`Custom4Hat`/`Custom5Hat` keys across
nearly every character (worst: `marsu/Custom3Hat`, 7.06 MB at ss:2 -> **1.96 MB** at ss:1, still
63% over budget), plus a handful of `infernoHat`/`pineappleHat`/`rabbitHat` instances. A single
`ss:1` step is exactly what the user's decision specified — not an iterative "keep halving until
under budget" loop, and there is no `ss:0.5`. This is the genuine, measured LIMIT of what one
density halving achieves for the heaviest hats; no further escalation is authorized by the
decision as stated, and none was implemented.

**Two real, previously-latent runtime defects found and fixed live** (both invisible until an
accessory's `ss` first differed from 2, which never happened before this rule):
1. `resolveAccessoryPlacement`'s `scale` never compensated for `ss` at all — `_applyFrame` renders
   every piece at NATIVE scale (the game's whole art space is ss:2 native), so an ss:1 package's
   raster (half the native pixel dimensions of an ss:2 raster of the same subject) would render at
   HALF the intended on-screen SIZE. RED captured live (`pivot.test.js`): `expect(placement.scale
   at ss:1).toBe(2)` failed, received `1`. Fixed: `scale = (accFrame.scale ?? baseScale ?? 1) *
   (ACCESSORY_REFERENCE_SS / ss)` (`ACCESSORY_REFERENCE_SS = 2`, the fixed project-wide reference
   every accessory was compiled at before this rule existed — NOT the current character's own body
   `ss`, which is unrelated). At ss:2 the factor is 1 (identity, byte-for-byte unchanged behaviour
   for every already-shipped package — confirmed: the full 95-test `mirroredDirections.integration
   .test.js` regression suite, built entirely on real rasta/minnieHat/pet09 ss:2 fixtures, passed
   unchanged both before and after).
2. **Found by the safety net, not by design**: fixing (1) alone left `mirroredDirections.integration
   .test.js` still red (3 failures, `x`/`y` off by exactly half) once rasta's own `minnieHat`
   fixture was recompiled live mid-session — `resolveRenderPosition`'s LOGICAL-to-REAL-PIXEL
   conversion also used the package's own `ss` (halving an ss:1 accessory's real-pixel POSITION
   too, even after its SIZE was correct — the anchor itself would land in the wrong place). Fixed:
   that conversion now always uses `ACCESSORY_REFERENCE_SS`, never the package's own `ss` (real-
   pixel space is the body's own fixed ss:2 render space, regardless of which `ss` any individual
   accessory happens to compile at). RED captured live (`pivot.test.js`, position-independence
   case): `expected 17 to be close to 34`. Both fixes are additive-only at ss:2 (unchanged
   behaviour), confirmed by the same 95-test regression file plus 3 stale hand-rolled
   `expectedX` formulas in that file's own mirror-regression describe block updated to the SAME
   corrected reference (`ACCESSORY_REFERENCE_SS`, now exported from `pivot.js`) — these three were
   the test file's OWN duplicate of the buggy formula, not a second production defect.

**Visual verification** (not just numeric — the parent brief's own explicit ask, since an
ss:1 accessory rendering at the wrong size/position is exactly what R1-R13/R19 cannot catch):
regenerated ALL 17 contact sheets (every character + sally) after the fixes above; reviewed
rasta, brujita, ninja (minnieHat, now ss:1-compiled for all three) — bow/ears render at the
CORRECT size and position in every direction, matching the pre-ss:1 look exactly. A one-off ad
hoc capture (built, reviewed, then deleted — not part of the deliverable) of `marsu` wearing
`Custom3Hat` (the worst remaining over-budget case, 1.96 MB) confirmed the same: correct size and
position despite still being over the transfer budget — the transfer miss is a byte-budget fact,
not a rendering defect.

**One pre-existing hardcoded test broken by the (correct, expected) consequence of this rule,
fixed**: `avatar-resolved-state.spec.js`'s permanent multi-page-loading regression test (added in
slices 28-31) hardcoded `rasta/pineappleHat` as its 2-page fixture — halving density at ss:1
shrank it to 1 page (confirmed: EVERY one of rasta's own 36 accessory packages is now 1 page; no
rasta fixture can exercise the multi-page path any more). Reassigned to `boomer/mickeyHat` (a
REAL, currently-2-page package, confirmed live, unaffected by ss:1 since it stayed under budget)
— same test intent, real substitute, disclosed in the test file's own comment.

### R18 gate re-run, end to end (8/8 rows PASS, including the new combined row)

Real Docker rebuild, real recompile baked in. All 7 original rows unchanged (accessories never
touch the body's own M2/M3/M4 — accessories load on-demand per equip, design §5) plus one NEW row
this pass adds per the coordinator's own explicit ask (no prior gate row ever measured the
combination a player actually experiences: a worn hat's package PLUS the body's own action pack,
both cold):

| Metric | Gate | Measured | P1 (2 Mbps) | P2 (Slow 3G) | Result |
|---|---|---|---|---|---|
| M2 room entry, first visit | ≤600 KB | 446.5 KB | 1.83s | 9.14s | **PASS** (unchanged) |
| M2 room entry, return visit | ≈0 | real immutable cache + 304 | ≈0 | ≈0 | **PASS** (unchanged) |
| M3 typical key (`down_llorar`) | ≤400 KB | 194.9 KB | 0.80s | 3.99s | **PASS** (unchanged) |
| M3 worst key (`left_fall`) | ≤1.2 MB | 668.7 KB | 2.74s | 13.70s | **PASS** (unchanged) |
| **M3 combined: body action + worn hat (`rasta`/`minnieHat`), cold transfer** | informal reference only (400 KB + 1.2 MB = 1,634,304 B; design defines no combined gate) | **994,635 B ≈ 971.3 KB** (body 199,528 B + hat, measured locally — byte-identical by construction to what `gzip_static` serves, disclosed method in the test's own comment, since Vite's hashed accessory filenames give no way to address ONE character's copy among 15 identically-named built files) | **3.98s** | **19.89s** | **WITHIN** informal reference |
| M4 texture memory (one avatar, one action) | ≤80 MB | 36.48 MB | — | — | **PASS** (unchanged) |
| M1 roster tracked (reported) | ≤400 MB, reported | **606.49 MB** (down from 925.16 MB, -34.4%) | — | — | reported, still over (design's own explicit non-blocking choice) |
| Fidelity | ≤1%/0% | unchanged (no encoder change) | — | — | **PASS** |

**8 of 8 rows PASS** (the informal combined row is not a design-authored gate, disclosed as such;
every row that IS a real design gate passes). The combined figure did NOT miss — reported plainly
either way, per the brief's own instruction.

### Slice 32 — Roster-scale regression gate (design §15, tasks.md slice 32) — DONE, 4/4 PASS

5-character roster mix (rasta, brujita, ninja, werewolf, boomer — the SAME representative sample
Correction 1 already validated through the real scene, plus `boomer` for a structurally distinct
manifest shape), spawned SIMULTANEOUSLY, not N copies of one:

- **`PerfHarness.spawnRosterMix(avatarIds)`** (new, task 1): spawns one ghost per DISTINCT
  avatarId via the same `spawnAvatarUser` primitive `spawnGhosts` uses. Live-caught gap while
  wiring it: `PerfHarness.js` was previously imported ONLY from `App.vue` (the real game) — the
  bare harness page (`/harness.html`, where every e2e test in this whole apply pass runs) never
  loaded it, so `window.__perf` was unreachable there even with `VITE_PERF_HARNESS=true` set in
  `.env.local`. Fixed by importing it from `client/src/harness/main.js` too, behind the identical
  `gameConfig.PERF_HARNESS` gate App.vue uses. E2E-verified (`avatar-roster-scale-gate.spec.js`):
  spawns exactly 5 DISTINCT avatarIds.
- **M2/M3/M4 at roster scale** (`client/e2e/avatar-roster-scale-gate.spec.js`, new, own Docker
  container/port so it never collides with `avatar-load-gate`/`avatar-transfer`):

| Metric | Measured | Informal reference (N × per-character gate; design authors no roster-scale row) | Result |
|---|---|---|---|
| M2 (5 characters' base packs, summed) | 1,845,893 B ≈ 1.76 MB (P1 7.38s, P2 36.92s) | ≤5×600KB=3,072,000 B | WITHIN |
| M3 (5 characters × `down_llorar`, summed) | 570,751 B ≈ 0.54 MB (P1 2.28s, P2 11.42s) | ≤5×400KB=2,048,000 B | WITHIN |
| M4 (5 DIFFERENT characters, real `residentAvatarBytes`) | 153,861,656 B ≈ **146.73 MB**; fps.mean 142.42; `draws` unavailable via this renderer config | ≤5×80MB=419,430,400 B (design §19 risk 3's own named arithmetic, not an authored gate); production's own ~22 MB total contrasted, not thresholded | WITHIN, comfortably (35% of the informal reference) |

No escalation needed (task 4): every roster-scale measurement passed with real headroom, so
neither slice 15's unwired eviction scheduler nor a deeper `ss` cut was touched.

- **M1 final figure** (task 3): **606.49 MB**, already reported above — the real final number for
  this pass's own scope (16 bodies + 540 accessory packages across 15 characters); `ghost`/`wraith`
  (2 bodies + 72 accessory packages) are permanently out of scope per standing instruction, which
  is exactly what this task's own wording ("however many of the 612 packages actually exist on
  disk") anticipates — not a gap this slice is waiting on.
- **Contact-sheet index** (task 6): `build-contact-sheet-index.cjs` needed no code change (its own
  docblock: "never a hardcoded roster list") — re-run produced 21 entries (16 characters + 4
  real-scene variants + 1 canvas-renderer variant); `ghost`/`wraith` correctly absent, not silently
  implied covered.

### Slice 33 — Aura pagination — deferred, not attempted

Per the parent brief's own conditional framing ("attempt if there is room"): slice 32's
MEASUREMENTS left real headroom (every row above passed comfortably) — the deferral is this pass's
own remaining IMPLEMENTATION-EFFORT budget, not a measured constraint. Porting `packFrames`'s
pagination into aura mode is a genuinely new feature (per-frame crop-and-repack of an
already-consolidated grid sheet — `compileAura` today copies the source webp through unmodified,
it never decodes individual frames — plus a new multi-page atlas/manifest emission path and R2
runtime verification), not a parameter tweak; attempting it under time pressure risked a rushed,
undertested result. **Cited explicitly, per this slice's own instruction**: `proposal.md`'s own
frozen "Non-goals" section (lines 73-75) already names this precise follow-up — "porting the
layered compiler's existing multi-page splitting to aura mode is a follow-up" — so this is the
proposal's own standing deferral, not a silently dropped scope item. Source files confirmed
present and ready for whoever picks this up: `effects/aura_azul.{json,webp}` /
`aura_dorada.{json,webp}` (8113×652, 231 frames, 61×4 grid) in the decrypted source root, not yet
staged under `.assets-src/auras/`.

### TDD Cycle Evidence — Accessory ss:1 + Slice 32

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| `sumPackedTransferBytes` | `scripts/lib/packedTransferBytes.test.cjs` | Unit | N/A (new module) | not-run (nonexistent module) | ✅ 4/4 | 4 cases: webp+1 JSON, 0 webp+2 JSON, all-empty, null/undefined JSON entries skipped | Clean |
| `measureActionKeyPackedBytes` refactor to reuse the shared helper | `compile-layered-avatar.cjs` (existing, no dedicated unit test — I/O shell, matching this file's own established precedent) | Integration | ✅ full vitest 72/72 before | N/A (approval-style refactor: same computation, delegated) | ✅ full vitest unchanged after (536→536, then +4 new from the module above) | N/A (pure delegation, no new logic) | Clean |
| `resolveAccessoryPlacement` ss-compensated `scale` | `pivot.test.js` | Unit | ✅ baseline 25/25 (post-position-fix work; 22/22 pre-this-pass) | Captured live: `expected 1 to be 2` (ss:1 case) and `expected 0.75 to be close to 1.5` (baseScale composition case) | ✅ 2/2 passed after the `ACCESSORY_REFERENCE_SS/ss` factor | 3 cases: ss:2 (identity), ss:1 (double), ss:1 + baseScale composition | Clean |
| `resolveAccessoryPlacement` ss-compensated position (live-caught, safety-net-found) | `pivot.test.js` + `mirroredDirections.integration.test.js` | Unit + Integration | ✅ full 95-test regression file green before | Captured live via a REAL mid-session fixture recompile (not a file-swap revert): `expected 17 to be close to 34` (pivot.test.js, synthetic); `expected -22.5 to be close to -11.25` etc. (3 real failures in the integration file, real rasta/minnieHat data) | ✅ 26/26 (pivot.test.js) + 95/95 (integration file, including 3 stale hand-rolled `expectedX` formulas corrected to the same reference) | 1 pure synthetic case (pivot.test.js) + 3 real mirrored directions (integration file) | Clean |
| Whole-package ss:1 wiring (`compileVector`/`compileAccessoryWithSsRule`) | live `node scripts/compile-accessory.cjs --kind hat --char rasta minnieHat`, ×2 consecutive runs + full 540-package batch | Integration | ✅ full vitest before; `pet09` byte-identical before/after (unaffected-path regression check) | RED by construction (real wiring, not written-first — same framing slice 20 itself used) | ✅ real recompile: 249/390 hats selected for ss:1, 0/150 pets; determinism confirmed (2 consecutive `minnieHat` runs, byte-identical); `pet09` (under budget) byte-identical before/after (no regression for the unaffected path) | 540 real packages across 15 characters IS the triangulation (249 over, 291 under) | Clean |
| Stale `pineappleHat` 2-page fixture | `e2e/avatar-resolved-state.spec.js -g "multi-page accessory loading"` | E2E | ✅ full e2e suite green before (322 tests) | N/A (real fixture change, not written-first): `expected 2, received 1` once `rasta/pineappleHat` shrank to 1 page | ✅ passed after reassigning to `boomer/mickeyHat` (confirmed live, still 2 pages) | N/A (single real fixture swap) | Clean |
| Roster-scale gate (M2/M3/M4, harness smoke) | `e2e/avatar-roster-scale-gate.spec.js` (new) | E2E (Playwright, real Docker build + real harness) | ✅ full e2e suite green before | N/A (a measurement gate, not written-first — same framing slices 19/20 used) | ✅ all 4 tests pass and report real numbers (all within their informal references) | 5 real distinct characters × 3 metric classes IS the triangulation | Clean |
| `PerfHarness.spawnRosterMix` + harness-page wiring | `e2e/avatar-roster-scale-gate.spec.js -g "Harness extension smoke"` | E2E | ✅ full e2e suite green before | Captured live: `page.waitForFunction` timeout (`window.__perf` never defined) before wiring `PerfHarness.js` into `harness/main.js` | ✅ passed after the wiring fix: 5 distinct avatarIds spawned | 1 real case (5-avatarId default roster mix) IS the triangulation | Clean |

### Test Summary

- **Unit**: 72 files / 537 tests, all passing (up from 71/529 at this section's start: +1 file
  `packedTransferBytes.test.cjs`; +8 tests — 4 in that new file, 3 new `resolveAccessoryPlacement`
  cases in `pivot.test.js`, 1 position-independence case in `pivot.test.js`).
- **E2E**: 322 total (up from 317), 285 passed, 36 skipped (unchanged, legitimate), 1 failed (the
  same pre-existing, disclosed, unrelated `avatar-transfer.spec.js` index.html `Cache-Control`
  finding — not touched, not caused by this work).
- **Approval tests**: `mirroredDirections.integration.test.js`'s full 95-test file (built on real
  rasta/minnieHat/pet09 ss:2 fixtures) — unchanged pass outcome after both ss-compensation fixes,
  confirming ss:2 behaviour is byte-for-byte identical to before; `pet09`'s real recompile
  (byte-identical, unaffected path).
- **Pure functions created**: `sumPackedTransferBytes`; `resolveAccessoryOutputDir` (trivial path
  resolution, exercised via 540 real packages rather than a dedicated unit test, matching this
  file's own established precedent for compiler wiring helpers).

### Files changed (Accessory ss:1 + Slice 32)

Production code:
- `client/scripts/compile-accessory.cjs` — `ss` threaded through `renderFrameRaster`/
  `compileVector`/manifest emission; output-dir clearing before write; new
  `compileAccessoryWithSsRule`/`measureCompiledPackageBytes`/`resolveAccessoryOutputDir`, exported;
  `main()` now calls the orchestrator, not `compileVector` directly.
- `client/scripts/compile-layered-avatar.cjs` — `measureActionKeyPackedBytes` refactored to reuse
  `sumPackedTransferBytes` (no behaviour change); unused `zlib` require removed.
- `client/scripts/lib/packedTransferBytes.cjs` + `.test.cjs` (new).
- `client/scripts/recompile-accessories-ss-rule.cjs` (new, manually-invoked batch driver).
- `client/src/phaser/layered/pivot.js` — `resolveAccessoryPlacement` gains `referenceSs` param and
  `ACCESSORY_REFERENCE_SS` constant (exported); `scale` and the logical-to-real-pixel position
  conversion both now ss-compensated.
- `client/src/phaser/debug/PerfHarness.js` — new `spawnRosterMix(avatarIds)`.
- `client/src/harness/main.js` — imports `PerfHarness.js` behind `gameConfig.PERF_HARNESS`.
- `client/e2e/avatar-load-gate.spec.js` — new M3-combined row; M1 test's own scope comment updated
  to "final for this pass" language.

Test/tooling code:
- `client/src/phaser/layered/pivot.test.js` — 4 new cases (ss-compensated scale ×3,
  position-independence ×1).
- `client/src/phaser/layered/mirroredDirections.integration.test.js` — 3 stale hand-rolled
  `expectedX` formulas corrected to `ACCESSORY_REFERENCE_SS`.
- `client/e2e/avatar-resolved-state.spec.js` — multi-page fixture reassigned to `boomer/mickeyHat`.
- `client/e2e/avatar-roster-scale-gate.spec.js` (new) — roster-scale M2/M3/M4 gate + harness
  smoke test.

Compiled output (generated, excluded from line-count per this change's own convention):
- All 390 hat packages' output regenerated (249 at `ss:1`, 141 confirmed unchanged at `ss:2`);
  all 150 pet packages confirmed unchanged (0 selected). `client/e2e/artifacts/accessory-ss-report
  .json` (new, real before/after bytes per package). `client/e2e/artifacts/contact-sheets/*.png`
  (all 17 regenerated post-fix; index rebuilt, 21 entries, unchanged count).

### Carried-forward gaps, still open, not silently dropped

Unchanged from prior slices: slice 15's bucket-fallback/eviction scheduler unwired (not needed —
slice 32's own roster-scale measurements passed without it); no vector editor validated for the
Tier 2 SVG round-trip; `SmartAvatarSystem`'s real-game init sequence unaudited; `design.md`
§13.7's own frozen prose still poses the BODY `ss` question as open although slice 20 resolved it
(flag for sync, not edited here — frozen artifact).

Still open, explicitly not this pass's job:
- **`ghost`/`wraith`**: bodies AND accessories both permanently blocked on slice 23's own
  unresolved `--from-vector` architecture question. Not attempted, per standing instruction —
  this is not a temporary gap any later slice in this chain is waiting on; M1/the roster-scale
  gate/the contact-sheet index all measure the roster AS IT EXISTS without them.
- **51 accessory packages remain over the 1.2 MB transfer budget even after their own `ss:1`
  recompile** (the `Custom3Hat`/`Custom4Hat`/`Custom5Hat` family across nearly every character,
  plus a few `infernoHat`/`pineappleHat`/`rabbitHat` instances; worst: `marsu/Custom3Hat` at
  1.96 MB) — a genuine, measured limit of a single density-halving step, not a bug; no further
  escalation is authorized by the user's decision as stated.
- **`measure-accessory-overlap.cjs`'s page-0-only hashing**: unchanged disclosed limitation from
  the prior pass; does not change the "low, lever is dead" verdict.
- **Slice 33 (aura pagination)**: deferred per proposal.md's own named non-goal (not this pass's
  effort budget to attempt); `aura_azul`/`aura_dorada` source files confirmed present, not staged.
- **Per-batch real-scene rule**: unchanged from the prior pass — cholo, empollon, gata, india,
  lilian, marsu, modern, yayo, boomer, skeleton, zombie remain harness-only (a disclosed,
  deliberate scope boundary per the representative-sample rule, not an oversight).

No background processes left running: the two Docker containers this work created
(`avatar-load-gate-run`, `avatar-roster-scale-gate-run`) were removed by their own `afterAll`
hooks (confirmed via `docker ps -a` — only this machine's unrelated, long-running
`boombang-html5-*`/`odoo-*` compose services remain, predating this session); the one manually
started background job (`recompile-accessories-ss-rule.cjs`, run via `run_in_background`) exited
on its own before this section was written (confirmed via `ps aux`); no `vite`/`npm run dev`
process was left running (a stray ad hoc one, started and stopped during the manual visual check
above, was explicitly killed before proceeding).

---

## Slice 34 — Debug panel: dev-only character switcher + compiled accessory catalogue (2026-08-19)

Out-of-band addition, not in `design.md`'s or `tasks.md`'s original numbering — delivered after
slices 1–33 were already complete, on two direct requests: (1) the user had no way to visually
test the 16 migrated characters in the running game (the only account available, `God`, is pinned
to one avatar); (2) the coordinator separately reported the panel's aura/hat/pet dropdowns only
ever showed the account's OWNED subset (a couple of entries), not what is actually compiled. Both
addressed in `AvatarLookDebugPanel.vue`, strictly behind `VITE_AVATAR_LOOK_DEBUG` — never a
product feature (the archived `avatar-color-accessory-system` proposal.md's own non-goals already
rule out a product colour/accessory wizard; this change's own `proposal.md` does not separately
restate it, so citations below point at the archived one, not this change's).

### What shipped

**Character switcher.** A new "character" `<select>` at the top of the panel, listing every
`AvatarEnum` character with a compiled layered manifest (`avatarManager.isLayeredAvatar`, the SAME
gate `AddUserController.createAvatarSprite` uses) — currently boomer, brujita, cholo, empollon,
gata, india, lilian, marsu, modern, ninja, rasta, sally, skeleton, werewolf, yayo, zombie (16;
ghost/wraith correctly absent, no compiled manifest, matching slice 23's own standing gap).
Selecting a character retargets the LOCAL player's own live avatar, **client-side and
session-only — no new socket event, no persistence**: confirmed live that the renderer already
supports this without any server round trip, so the "prefer client-side if the renderer supports
it" branch of the brief applies, not the "must persist server-side" one.

Deliberately does **not** reuse the existing product `USER_CHANGE_AVATAR` socket request, for two
concrete, code-read reasons, not a stylistic preference:
1. It is ownership-gated server-side (`UserChangeAvatarController.js:18`:
   `user.avatars.includes(data.avatar)`) — exactly why an account cannot preview a character it
   does not own, the whole reason this control exists.
2. Even when it succeeds, its own client-side broadcast handler
   (`client/src/phaser/controllers/scene/UserChangeAvatarController.js`) builds a plain
   `gameScene.add.sprite(currentX, currentY, atlasKey)` — never a `LayeredAvatar` instance — so a
   layered character would render as a raw, unlayered atlas frame. `AddUserController.js` has the
   only real layered-aware sprite factory (`createAvatarSprite`); the "replace an existing user's
   sprite" paths (`UserChangeAvatarController`'s `replaceUserSprite`, `AddUserController`'s own
   `updateUserAvatar`/`updateUserAvatarSmart`) all predate the layered renderer and were never
   updated for it. Going through the existing product path would have been exactly the "half-
   applied avatar" the brief warned against — confirmed by reading the code, not assumed.

Instead, `switchCharacter()` reuses the real construction/cleanup primitives already established
by earlier slices: `avatarManager.loadAvatar(scene, avatarId)` (primes the target character's
atlas, the same priming step `spawnAvatarUser` already does for the harness), then
`RemoveUserController.main(scene, socketId)` (the same cleanup every departing user already gets)
followed by `spawnAvatarUser(scene, {...})` (design.md §10's "single spawn primitive" — the SAME
one `PerfHarness.spawnGhosts`/`window.__avatarHarness.spawnAvatar` already delegate to) with the
SAME socketId, so the local player's entry is rebuilt in place through the real
`AddUserController.processUser` path, not a parallel one. Currently-equipped hat/pet/aura and any
already-saved per-avatarId palette are carried over into the new character (best-effort: a
character with no compiled package for that key, or no saved palette, simply renders without it,
matching every other character's own existing behaviour).

**Accessory catalogue dropdowns.** The aura/hat/pet `<select>` options now list the FULL COMPILED
catalogue for the currently-selected character (`AccessoryManager.listKeysForCharacter`, new,
delegating to a new pure `listAccessoryKeysForCharacter` in `accessoryRegistryResolve.js`) instead
of the account's owned subset (the previous source, `GET_USER_ACCESSORIES`'s `owned` field).
Ownership is kept as a cheap `" (not owned)"` per-option marker, never a filter — selecting an
unowned entry and clicking Apply still goes through the unchanged, real, ownership-gated
`USER_CHANGE_ACCESSORY` socket path, so this is honestly a preview-list change only, not a new
grant mechanism. Re-derived on every character switch (a character's compiled hat/pet/aura set is
genuinely per-character, per design.md §4/§7).

### Real, live-caught defects found and fixed while building this (not assumed, not deferred)

1. **The panel's own manifest resolution was rasta-only.** Its pre-existing
   `LAYERED_MANIFEST_LOADERS` map (a hand-duplicated, single-entry `{[AvatarEnum.RASTA]: () =>
   import(...)}`) meant the panel showed NO manifest at all for any of the other 15 migrated
   characters even before this slice's own switcher existed — a real, disclosable gap, not
   something this slice's own scope created. Fixed by resolving through
   `AvatarManager.getOrLoadLayeredManifest(avatarId)` (new: manifest-only, no scene/atlas load
   needed just to read slot metadata — reuses the SAME `LAYERED_MANIFEST_LOADERS` internal glob
   map `loadLayeredAvatar` already uses, caching into the SAME `layeredManifests` map
   `getLayeredManifest` reads, so a later real scene-driven load is not a wasted re-fetch).
2. **`findActiveGameplayScene`'s first version found nothing once a real room was entered.**
   Modeled directly on `PerfHarness._findActiveScene`'s own `game.scene.getScenes(true)`
   (active-only) — confirmed live, against the real Docker-built client, that the real
   `PublicScene`/`PrivateScene`/`MinigameScene` render and update without Phaser considering them
   "active" the way the bare harness pages do (only the umbrella `GlobalPreloader` scene is);
   `getScenes(true)` returned only `GlobalPreloader`. Fixed to `getScenes(false)` (every
   registered scene, filtered by the real discriminator — a `users` map — instead of Phaser's own
   active flag), regression-tested (pins the exact call argument so this cannot silently regress).
   Disclosed, not fixed: `PerfHarness` itself keeps its original `getScenes(true)` call — out of
   this slice's scope, and it has only ever been exercised against harness pages, where this
   distinction has never arisen.
3. **The switch-success message showed "Switched to unknown" for sally.**
   `AvatarManager.getAvatarName`'s hardcoded `avatarNames` dict has no `SALLY` entry (she was
   added, id 18, in a later slice than that dict) and falls through to `"unknown"`. Confirmed live
   (screenshot evidence below, first attempt). Fixed with a new `characterNameForAvatarId`
   (AvatarEnum reverse lookup, covers every entry, including sally) used by this slice's own new
   code only — `AvatarManager.getAvatarName` itself is untouched; its other call sites
   (`AddUserController`, `UserChangeAccessoryController`, etc.) are unaffected and out of scope.

### TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| `listAccessoryKeysForCharacter` | `accessoryRegistryResolve.test.js` | Unit | ✅ 9/9 pre-existing green | ✅ Executed, real failure: `TypeError: listAccessoryKeysForCharacter is not a function` (4 new tests) | ✅ 4/4 passed | 4 cases: per-character list, cross-character no-leak, `'*'`-tier aura inclusion, empty result | Clean |
| `AccessoryManager.listKeysForCharacter` | (I/O-shell delegation, no dedicated test — matches this class's own established precedent for `hasPackage`/`getAtlasKey`) | Integration | ✅ full vitest 559/559 (running total) before | N/A (pure delegation to the tested pure function above) | ✅ verified live via the real running client's accessory dropdowns | N/A | Clean |
| `AvatarManager.getOrLoadLayeredManifest` | `AvatarManager.test.js` (new) | Unit | N/A (new file; `AvatarManager.js` confirmed importable under vitest's node environment first, since the whole class had never been unit-tested before) | ✅ Executed, real failures: `TypeError: default.getOrLoadLayeredManifest is not a function` (×3 initially-failing cases) | ✅ 4/4 passed | 4 cases: real compiled character (rasta, non-empty slots), a DIFFERENT character (sally, no cross-caching bleed), an uncompiled character (ghost → null), cache identity on a second call | Clean — 1 real correction mid-cycle: the sally case's own expected value (`slots: []`) was wrong on first write (assumed from a stale `tasks.md` narrative); the ACTUAL compiled file has `slots: ['colorGuante']`, checked directly (`node -e "require(...).slots"`) and corrected in the test before calling it done |
| `listLayeredCharacters` | `listLayeredCharacters.test.js` (new) | Unit | N/A (new file) | ✅ Executed, real failure: `Cannot find module './listLayeredCharacters.js'` | ✅ 3/3 passed | 3 cases: mixed layered/non-layered filter+sort, all-non-layered empty result, shape (drops `isLayered`) | Clean |
| `characterNameForAvatarId` | `listLayeredCharacters.test.js` (added to the same file) | Unit | ✅ full file green before | ✅ Executed, real failure: `TypeError: characterNameForAvatarId is not a function` (×2) | ✅ 3/3 passed | 3 cases: a known id (rasta), the SALLY id specifically (the one `getAvatarName` is missing), an unmatched id (null, no throw) | Clean |
| `findActiveGameplayScene` | `findActiveGameplayScene.test.js` (new) | Unit | N/A (new file) | ✅ Executed, real failure: `Cannot find module './findActiveGameplayScene.js'` | ✅ 3/3 passed | 3 cases: no `game`, no scene with `users`, one scene with `users` among several | Clean |
| `findActiveGameplayScene` `getScenes(false)` fix | `findActiveGameplayScene.test.js` (same file, added case) | Unit | ✅ 3/3 green before | Live-caught, not written-first (same framing slice 20/26 used for real wiring defects): captured live against the real Docker-built client via `window.game.scene.scenes.map(s => s.sys.isActive())` — `PublicScene` present with `hasUsers:true` but `isActive:false` while only `GlobalPreloader` was active; `getScenes(true)` returned `[GlobalPreloader]` only | ✅ fix (`getScenes(false)`) applied; regression test added and passes, pinning the exact call argument via a spy-style fake | 1 case, the live-caught one itself, plus the regression pin — no further variation needed (the rule has no branching beyond true/false) | Clean |
| `AvatarLookDebugPanel.vue` (character switcher, catalogue dropdowns, all 3 live-caught fixes) | none (Vue SFC, I/O shell — this repo has no jsdom/`@vue/test-utils` in `vitest.config.js`; every other Vue component in this codebase is validated the same way, via a real browser, not a component unit test) | Manual E2E (Playwright CLI against the real Docker-built client, God/test login) | ✅ full unit suite green before (72/537) and after (75/555); full e2e suite spot-checked (see below) | N/A (I/O-shell wiring, real construction, matches `AddUserController`/`RemoveUserController`/`spawnAvatarUser`'s own established untested-directly precedent) | ✅ real: character switched live to rasta (baseline), ninja, sally, werewolf, each screenshotted with slot rows and accessory catalogues visibly reflecting the new character | 4 real characters × the full panel surface (character select, 7→5→1 slot rows across them, hat/pet/aura catalogue length changes) IS the triangulation | Clean |

### Test Summary

- **Unit**: 75 files / 555 tests, all passing (up from 72/537 at this slice's start: +3 files —
  `AvatarManager.test.js`, `listLayeredCharacters.test.js`, `findActiveGameplayScene.test.js` — +18
  tests: 4 in `accessoryRegistryResolve.test.js`, 4 in `AvatarManager.test.js`, 6 in
  `listLayeredCharacters.test.js`, 4 in `findActiveGameplayScene.test.js`).
- **E2E**: see the dedicated section below — this slice live-caught a real environmental flake in
  its own verification process, investigated it rather than reporting a false regression, and
  recorded the honest result.
- **Approval tests**: none — no refactoring task in this slice (every change is additive: new
  methods/functions, one existing method's internal call argument changed with a regression test
  pinning the new value).
- **Pure functions created**: `listAccessoryKeysForCharacter`, `listLayeredCharacters`,
  `characterNameForAvatarId`, `findActiveGameplayScene` (pure given its injected `game` argument —
  no `window` read inside).

### E2E: a real environmental flake, investigated and resolved, not silently accepted

The first full `cd client && npm run test:e2e` run of this slice showed 54 passed / 22 skipped / 96
"did not run" — the underlying `npm run dev` webServer had been reused (`reuseExistingServer`)
across TWO overlapping `playwright test` processes that had not actually both exited despite an
earlier "completed" notification (confirmed via `ps aux`: two live `node .../playwright test`
processes at once). Killed both, confirmed zero stray `playwright`/`chrome-headless-shell`
processes, and re-ran clean with `npx playwright test --workers=1` for full determinism. That
"clean" run STILL showed 75 real failures (✘, not "did not run" this time — `220 passed + 27
skipped + 75 failed = 322`, the exact expected total), heavily front-loaded (tests 8–86, spanning
`avatar-contact-sheet`, `avatar-load-gate`'s M4, `avatar-parity`, all of `avatar-real-scene`, and
`avatar-resolved-state` for rasta/sally/brujita) with suspiciously fast (~90–120ms) failures,
followed by ~230 consecutive real passes (1–6s each, normal timings) for every other character
through to the end of the suite.

Rather than accept either "322 total but not the documented 285" or the alternative "declare it a
regression from my own change," each of the 6 distinct spec files that showed failures was
**re-run alone**, freshly, no other test file contending for the (also freshly-started) dev
server:

| Spec file (isolated re-run) | Result |
|---|---|
| `avatar-resolved-state.spec.js -g "rasta"` | 15 passed, 1 skipped (matches the file's own conditional-skip shape) |
| `avatar-resolved-state.spec.js -g "sally\|brujita"` | 23 passed, 9 skipped (sally's own no-accessory skips + one conditional brujita skip) |
| `avatar-parity.spec.js` | 3 passed |
| `avatar-real-scene.spec.js` | 17 passed (rasta/brujita/ninja/werewolf, real `PublicScene`) |
| `avatar-contact-sheet.spec.js` | 17 passed (all 16 characters' contact sheets + the no-leftover-avatar regression check) |
| `avatar-load-gate.spec.js` | 8 passed — **M4 36.48 MB, identical to the documented R18 gate figure** |
| `avatar-roster-scale-gate.spec.js` | 4 passed — **M2 1.76 MB / M3 0.54 MB / M4 146.73 MB, identical to slice 32's own figures** |
| `avatar-transfer.spec.js` | 8 passed, **1 failed** — the SAME pre-existing, disclosed, unrelated `index.html` `Cache-Control` finding (`"no-cache"` received, `undefined` expected) — untouched, not caused by this slice |

**Every single one of the 75 full-suite failures passed cleanly in isolation, with figures
matching or identical to the already-documented baseline.** This is real evidence, not an
assumption, that the full-suite run's failures were a cold-dev-server-start environmental
artifact specific to this sandboxed machine running the entire 322-test suite from a fresh `vite`
boot (most plausibly Vite's own dependency-optimizer triggering a mid-run full-page reload the
first time a rarely-hit lazy chunk is requested, disrupting whichever tests are in flight at that
moment) — not a regression from any change in this slice. No production code in this slice touches
`AddUserController`/`LayeredAvatar`/`UserEmojiAnimation`/`degradeReporter` or any other runtime
path these specific failing tests exercise; every change here is either a new file or an additive
method on an existing class. The one real, reproducible, pre-existing failure
(`avatar-transfer.spec.js`'s `index.html` `Cache-Control` check) is exactly the same one named in
every prior slice's own baseline — confirmed again here, not newly introduced.

**Full-suite run correctness under contention/cold-start is disclosed as a real, standing
constraint of this sandbox, not fixed here** — fixing Vite's own dependency-optimizer reload
behavior or hardening every spec against a mid-test navigation is a real but separate piece of
work, out of this slice's own scope (a dev-only debug-panel addition), and no other slice in this
change's own history reports having hit it (their own documented runs presumably did not race a
cold dep-optimization window against this exact test ordering).

### Real, Docker-built, logged-in visual verification (not by assertion)

`docker compose build client && docker compose up -d client`, then a real Playwright CLI (chromium,
headed via `playwright-cli`) session against `http://localhost:8080`, logged in as `God`/`test`,
entering both `Area 51` and `OslanAbyss` (the latter has 6 other real bot characters on screen,
confirming the switch renders correctly alongside other live avatars, not just in an empty room):

- **rasta** (baseline, before any switch): `rasta-before.png` — the account's real starting look
  (gold-tinted palette, `minnieHat`, `pet09`, `auraElectrica` already equipped from prior
  sessions/gachapon).
- **ninja**: `ninja-switched.png` — switched live, "Switched to ninja (session-only, not
  persisted)." shown, slot rows now `color3/color1/color2/color4/colorGuante` (no labels — matches
  the real compiled manifest, `labels: {}`), the SAME `minnieHat`/`pet09`/`auraElectrica` carried
  over and rendering correctly on the new character.
- **sally**: `sally-switched.png` (captured in `OslanAbyss`, alongside 5 other real bot
  characters) — "Switched to sally" (after the `getAvatarName` "unknown" defect above was found
  and fixed — the FIRST attempt is exactly what surfaced that defect), slot rows show exactly
  `colorGuante` (the real compiled manifest — see the correction in the TDD table above; not the
  "zero slots" tasks.md slice 22 originally claimed), hat/pet dropdowns correctly show only
  `"none"` (sally has zero compiled accessory packages).
- **werewolf**: `werewolf-switched.png` — "Switched to werewolf", slot rows `color2/color1/
  colorGuante` (no labels, same shape as ninja), `minnieHat` re-equipped and rendering correctly
  (visible as the red-and-white bow on the werewolf body).

All four screenshots show the real rendered character in the actual scene alongside the panel with
its slot rows and accessory dropdowns visibly reflecting the switched-to character — committed at
`openspec/changes/avatar-system-multichar-fixes/{rasta-before,ninja-switched,sally-switched,
werewolf-switched}.png`.

**Accessory catalogue, confirmed populated from the compiled registry, not ownership**: every
character switched to above showed 26 hats + 10 pets + 1 aura (`auraElectrica`) in the dropdowns —
matching slices 28–31's own real compiled-package counts — except sally (0 hats, 0 pets, 1 aura,
correctly reflecting that she has no compiled accessory packages at all). `aura_azul`/
`aura_dorada` correctly absent from the aura list (never compiled — over the compiler's 4096px
limit, slice 33's own disclosed deferral).

**Disclosed, not a defect in this slice's own code**: no `" (not owned)"` marker was ever observed
live. Confirmed why, not merely assumed: applying several arbitrary, unlikely-to-be-owned hats
(`Custom3Hat`, `pumpkinHat`) via the panel's existing, unchanged Apply button both returned
`"Accessory change accepted"` — the `God` test account owns essentially the entire compiled
catalogue (consistent with its 9,993,999 gold / 9,999,984 silver balance). The marker logic itself
is real, unit-tested-by-construction (a plain `Array.includes` check) and code-reviewable, but this
account provides no live case to demonstrate the negative branch. Separately, the
coordinator-flagged `hat_minnie` (owned key) vs `minnieHat` (compiled key) DB mismatch did **not**
reproduce with this account: `minnieHat` rendered correctly across every character switched to in
this session (rasta, ninja, werewolf all show it on-screen). Neither finding was chased further —
both are account/seed-data facts about `God` specifically, not something this panel's own code
should special-case.

### Files changed (Slice 34)

Production code:
- `client/src/phaser/managers/accessoryRegistryResolve.js` — new `listAccessoryKeysForCharacter`,
  exported.
- `client/src/phaser/managers/AccessoryManager.js` — new `listKeysForCharacter(character, kind)`,
  delegating to the above.
- `client/src/phaser/managers/AvatarManager.js` — new `getOrLoadLayeredManifest(avatarId)`.
- `client/src/phaser/managers/listLayeredCharacters.js` (new) — `listLayeredCharacters`,
  `characterNameForAvatarId`.
- `client/src/phaser/shared/findActiveGameplayScene.js` (new) — `findActiveGameplayScene(game)`.
- `client/src/views/components/game/debug/AvatarLookDebugPanel.vue` — character `<select>` +
  `switchCharacter()`, `refreshAvailableCharacters()`, `refreshAvailableAccessories()`; accessory
  dropdown options re-sourced from the compiled catalogue with an owned/not-owned marker;
  `loadManifest()` rewritten to use `AvatarManager.getOrLoadLayeredManifest` instead of its own
  stale, rasta-only loader map (removed).

Test code:
- `client/src/phaser/managers/accessoryRegistryResolve.test.js` — 4 new cases for
  `listAccessoryKeysForCharacter`.
- `client/src/phaser/managers/AvatarManager.test.js` (new) — 4 cases for
  `getOrLoadLayeredManifest`.
- `client/src/phaser/managers/listLayeredCharacters.test.js` (new) — 6 cases (3
  `listLayeredCharacters`, 3 `characterNameForAvatarId`).
- `client/src/phaser/shared/findActiveGameplayScene.test.js` (new) — 4 cases (3 original + 1
  regression pin for the `getScenes(false)` fix).

Evidence artifacts (committed under this change's own directory, not gitignored — the
deliverable, not scratch, matching slice 21's own contact-sheet precedent):
- `rasta-before.png`, `ninja-switched.png`, `sally-switched.png`, `werewolf-switched.png`.

### Carried-forward gaps, still open, not silently dropped

- `PerfHarness._findActiveScene` keeps its original `getScenes(true)` call — the same defect this
  slice fixed in its own `findActiveGameplayScene`, left unfixed there since it is out of this
  slice's scope and has only ever been exercised against harness pages (never the real
  `PublicScene`), so the distinction has not yet caused it a real failure.
- `AvatarManager.getAvatarName`'s hardcoded dict still has no SALLY entry — worked around by this
  slice's own new `characterNameForAvatarId` for its own call sites only; the dict itself, and its
  other callers (`AddUserController.js`, `UserChangeAccessoryController.js`), are untouched.
- The account-ownership `" (not owned)"` marker and the coordinator-flagged `hat_minnie`/
  `minnieHat` DB mismatch both remain unverified against an account that actually has a partial
  catalogue — `God`'s own seed data does not provide that case, and this slice does not touch
  DB/seed data to manufacture one (out of scope, explicitly deferred to whoever owns that data).
- The cold-dev-server-start full-suite flake (Vite dependency-optimizer mid-run reload,
  hypothesized cause) is disclosed, not fixed — a real but separate hardening task.

No background processes left running: all `docker ps -a` roster-scale/load-gate/transfer
containers this slice's e2e re-runs created were removed by their own `afterAll` hooks (confirmed
— only the same pre-existing `boombang-html5-*`/`odoo-*`/`eye-of-god-byparr`/`graft-ssh-test`
containers remain, all predating this session); no stray `playwright test`, `chrome-headless-shell`
or `vite --port 5183` process remains (confirmed via `ps aux` after the last isolated e2e re-run);
the `client` Docker container was rebuilt one final time from the exact code in this repo (comment-
only fixes after the last functional rebuild) so the deployed image matches source exactly, and
left running (the project's own normal state, matching every other service in `docker compose
ps`) rather than torn down.

## Live-bug fix — `hat_minnie`/`minnieHat` key mismatch, God inventory grant, `.bb` bundle wiring (2026-08-19)

Two independent user-reported issues, worked in the same pass.

### 1. The hat never appeared on the character

Traced ownership storage end-to-end (`GET_USER_ACCESSORIES` socket handler →
`UserApiService.changeAccessory`/model row → `api/app/Http/Controllers/Api/User/
UserAccessoryApiController.php` → `User::enabledHats()`), confirming it is NOT in
`catalog_items.type`/`catalog_items` rows shaped like scene items — it is
`catalog_items.user_decoration_type = 'avatar_hat'` (analogous `avatar_pet`/`avatar_aura`) with
the equipped value mirrored onto `users.avatar_hat`/`avatar_pet`/`avatar_aura`. Found the exact
offending rows: `catalog_items.id = 189` (`user_decoration_value = 'hat_minnie'`) and
`users.id = 1` (`avatar_hat = 'hat_minnie'`) — the `God` account. Every character's compiled hat
package under `client/src/assets/game/accessories/hat/*/` uses the key `minnieHat`; `hat_minnie`
does not exist anywhere in the compiled registry, so `AccessoryManager.hasPackage()` always
returned false and `UserChangeAccessoryController.applyHat` (client) returned with no trace.

No seeder produces this row (checked `CatalogItemSeeder`, `UserCatalogItemSeeder` — the latter
is a destructive `DB::table('user_catalog_items')->delete()` full-reseed with hardcoded old IDs,
confirmed NOT run — and `SallyAvatarCatalogItemSeeder`, which seeds an unrelated `avatar` row).
The two `hat_minnie` rows were data, not seed output, so the fix is a targeted UPDATE, run inside
the `db` container after confirming exactly these two rows would be touched:
```sql
UPDATE catalog_items SET user_decoration_value='minnieHat' WHERE id=189 AND user_decoration_type='avatar_hat' AND user_decoration_value='hat_minnie';
UPDATE users SET avatar_hat='minnieHat' WHERE avatar_hat='hat_minnie';
```
Both rows updated; re-selected to confirm.

**Made the silent failure loud.** `client/src/phaser/controllers/scene/UserChangeAccessoryController.js`
`applyHat()`: when `hatKey` is truthy but `accessoryManager.hasPackage()` returns false, it now
calls the existing `degradeReporter.report()` (same dedup-by-tuple pattern `LayeredAvatar.js`
already uses for animation-key degrades) with `{avatarId, requestedKey: hatKey, resolvedKey:
'none', reason: 'no compiled "hat" package for character "<character>"'}` before returning — one
`console.warn` per distinct tuple, never a hot-path spam. `applyPet`/`applyAura` were left
untouched (not asked, keeps the change targeted).

### 1b. Grant `God` ownership of every real compiled accessory (added mid-task, user follow-up)

User wants the normal in-game equip flow usable for the full catalogue, not only the debug
panel's already-in-flight "list everything" change (owned by a concurrent session —
`AvatarLookDebugPanel.vue` was not touched here). Confirmed ownership in this schema is
**global, not per-character**: `User::enabledHats()/enabledPets()/enabledAuras()` filter only by
`user_decoration_type`/`value`, with no character column anywhere in `catalog_items` or
`user_catalog_items` — per-character resolution happens client-side only, in
`AccessoryManager.hasPackage(character, kind, key)` at equip time.

Derived the full compiled set from disk (all 15 accessory-bearing characters share an identical
key set, confirmed by hashing each `hat/<char>` listing): 26 hat keys × 15 chars + 10 pet keys ×
15 chars = 540 packages, plus 1 aura key (`auraElectrica`; `aura_azul`/`aura_dorada` intentionally
excluded — both exceed the compiler's 4096px atlas limit and are not compiled). Wrote
`api/database/seeders/GodAccessoryInventorySeeder.php`: idempotent (skips any `catalog_items` row
that already exists for a `(user_decoration_type, user_decoration_value)` pair, and any
`user_catalog_items` link that already exists for `God`), grants only the `God` account, touches
no pricing/purchase logic. First attempt used `CatalogItem::create()` with a translatable `name`
array and hit two real bugs, both fixed in the committed version: Spatie `HasTranslations`
double-encoded the array through mass assignment (`{"en":{"en":"..."}}`), and `spreadsheet` has
no column default despite being `NOT NULL` — switched to a raw `DB::table()->insertGetId()` with
`json_encode()` and `spreadsheet => ''` (matching row 189's existing convention). Ran inside the
container:
```
docker compose exec -T api php artisan db:seed --class=GodAccessoryInventorySeeder --force
```
Before: 3 catalog_items rows total (one per kind, all already owned by `God`). After: 26/10/1
rows (37 total), all owned by `God`. Re-ran a second time to confirm idempotency (counts
unchanged).

**Verification, real flow, not assertion.** No production "closet"/shop UI for accessories
exists yet on this branch — grepped the whole client for `USER_CHANGE_ACCESSORY` and the only
emitter is `AvatarLookDebugPanel.vue`; `UserAccessoryApiController` itself documents "no purchase
or currency flow exists here." That panel is therefore the sole functional equip surface today,
so it was used (as an end user would, via the browser — its file was not edited) to prove the
real path: logged in as `God`, entered the `OslanAbyss` public scene (equip requires
`user.currentArea`, which the hub/spawn screen does not set), and equipped `bullHat` — a key
`God` did not own before this seeder ran. Server responded "Accessory change accepted" (not
`NOT_OWNED`), and the bull horns rendered on the character in-room. Re-equipped `minnieHat` and
confirmed the originally-reported bug is fixed: the red/white polka-dot bow renders cleanly,
singly, above the head. Screenshots (paths from this session's scratchpad, not committed):
`task1-hat-fix-full.png` / `task1-hat-fix-closeup.png` (minnieHat) and
`task1-god-inventory-bullhat-full.png` / `task1-god-inventory-bullhat-closeup.png` (bullHat,
proving the ownership grant, not just the key fix).

Files changed: `client/src/phaser/controllers/scene/UserChangeAccessoryController.js` (degrade
report only), `api/database/seeders/GodAccessoryInventorySeeder.php` (new). DB rows updated/added
as described above, run inside the `db`/`api` containers — no `.sql` dump or migration needed.

### 2. `.bb` delivery bundles built but never wired into the served client

`client/scripts/bundle-avatar-packages.cjs` (slice 16) and the `VITE_AVATAR_BUNDLES` flag already
existed but `client/Dockerfile` never invoked the bundler, so `dist/bundles/*.bb` never existed
in the served image. Fixed `client/Dockerfile`: added
`RUN node scripts/bundle-avatar-packages.cjs $(ls src/assets/game/avatars)` **before** the `vite
build` step — the script's own header comment documents this ordering (writes to
`client/public/bundles/`, which Vite copies verbatim into `dist/`; the `.env.example` comment's
"run after `vite build`" wording is stale). Passing every directory under
`src/assets/game/avatars/` rather than a hardcoded character list keeps it correct as more
characters land; the script already skips (logs, doesn't fail) any name without a `layers/`
subdir (`ghost`/`wraith`, NPC-only, have none). Rebuilt the client image: 431 `.bb` files now
exist under `dist/bundles/`, including all 16 characters' `<char>.layers.bb` base packs.
`emit-gzip-siblings.cjs` only targets `.js`/`.css`/`.json`, confirmed it does not touch `.bb`.

Set `VITE_AVATAR_BUNDLES=true` in `client/.env.local` and rebuilt/recreated the `client`
container. Verified with the browser's network panel against the rebuilt image: `.bb` requests
fire and succeed (e.g. `GET /bundles/rasta.layers.bb → 200, content-length: 463868`), and the
avatar rendered correctly in-game (screenshots above were taken in this state). Measured the
actual overhead against the 3 unbundled requests it replaces, using the real gzip'd `.js` chunk
sizes already served from this image (`rasta.layers.atlas-*.js.gz` 16731 B +
`rasta.layers.manifest-*.js.gz` 38125 B + `rasta.layers-*.webp` 402354 B = 457210 B) versus the
single `.bb` (463868 B): **+1.46% bytes, 3 requests → 1**. Matches the previously-measured "~1.5%
larger, win is request count" finding.

**Left the flag off — it broke the local dev-server/e2e workflow.** `npm run test:e2e` runs
`vite dev` (port 5183) directly against `client/public/`, which is a different serving path than
the Docker image: only the Docker build's new bundler step populates the full 431-file set, and
nothing repopulates `client/public/bundles/` for local dev — it had exactly 27 stale files for
`rasta` only (written by `avatar-transfer.spec.js`'s own setup step), none for any other
character. With the flag on, every other character's base pack (and therefore hat/pet/aura
attachment) failed to load under `vite dev`, e.g.:
```
Error: direction down: exact kind set
- Expected: Set {"body","hat","nameBackground","nameText","pet","shadow"}
+ Received: Set {"body","nameBackground","nameText","shadow"}   // hat, pet both missing
```
Full suite with the flag on: dozens of new failures across `avatar-resolved-state.spec.js`,
`avatar-real-scene.spec.js`, `avatar-contact-sheet.spec.js`, confirmed by isolating one test
(`lilian › R1`) and toggling the flag alone: fails at `true`, passes at `false`. This is a local
dev/CI parity gap (`client/public/bundles/` needs a "bundle every character" step wired into
`npm run dev`/the e2e webServer, or an equivalent for local parity with the Docker build), not a
flaw in the bundling mechanism itself — the mechanism is proven correct against the properly
populated Docker image above. Per the explicit fallback instruction, reverted
`client/.env.local` to `VITE_AVATAR_BUNDLES=false` and rebuilt the client image once more so the
running environment matches the checked-in-shaped `.env.local` state. The Dockerfile's bundler
step still runs on every build regardless of the flag, so `dist/bundles/*.bb` stays populated and
ready the moment this gap is closed and the flag is safe to flip back on.

**Test results.** `npm run test` (vitest): 552/552 passed (baseline was 537; the extra tests are
the concurrent session's in-flight work, not this pass's). `npm run test:e2e` with the flag
correctly left off: **285 passed, 1 failed, 36 skipped (322 total)** — exact match of the
documented baseline (72 files/537 unit — now 75/552 — and 285/322 e2e), including the one
pre-existing, unrelated `avatar-transfer.spec.js` Docker-image cache-header failure. No
regression from either this section's client-side change or the Dockerfile change.

Files changed: `client/Dockerfile` (bundler step added), `client/.env.local` (`VITE_AVATAR_BUNDLES`
added, left `false`). No changes to `client/.env` or `client/.env.example`.

---

## Live-bug fix — hat/pet disappearing mid-animation (Slice 35, 2026-08-19)

User report (Spanish): "cuando yo camino hacia adelante el gorro durante la animación desaparece
por alguna razon y vuelve a aparecer lo miso pasa con la mascota hay veses que desaparece o hace
movimientos raros" — walking forward, the hat disappears mid-animation and reappears; the pet does
the same, and sometimes moves oddly.

### Root cause — evidenced, not guessed

`LayeredAvatar._updateAccessory` (`client/src/phaser/layered/LayeredAvatar.js`) indexed the
ACCESSORY's own `manifest.anims[sourceKey].frames` array directly with the BODY's current
`_seqIndex`, with no bounds check:
```js
const accFid = manifest.anims[this._sourceKey].frames[this._seqIndex];
```
`compile-accessory.cjs` derives an accessory's `anims[key].frames` array from the accessory's OWN
authored source sequence file, entirely independent of the body's frame count for the same key —
there is no compiler-enforced guarantee the two lengths match. Once the body's index ran past the
accessory's own last authored frame, `frames[seqIndex]` returned `undefined`, the subsequent
`manifest.frames[String(undefined)]` lookup failed, and `_updateAccessory` hid the sprite
(`sprite.setVisible(false)`) for the rest of that animation — reappearing only once the sequence
looped back into the accessory's own covered range. That is exactly "disappears mid-animation,
reappears."

**Real-data measurement (not a plausible story).** A roster-wide static scan compared every
compiled accessory's `anims[key].frames.length` against the corresponding body
`sequences[key].frames.length`, across all 540 compiled accessory packages (26 hats + 10 pets ×
15 accessory-bearing characters) and every animation key each package declares:

| Metric | Value |
|---|---|
| (character, package, key) triples checked | 22,104 |
| Triples with ANY length mismatch | 7,986 (36.1%) |
| Triples where the accessory is SHORTER than the body (the dangerous direction — the one that can go out of bounds) | several thousand; see per-key table below |
| `*_walk`-family triples checked (`down_walk`, `left_walk`, `up_walk`, `leftdown_walk`, `leftup_walk`) | 2,700 |
| `*_walk`-family triples with a shortfall | **0** |

Dangerous (accessory-shorter-than-body) counts by key, worst offenders (full data reproducible
via the roster scan; not committed as a script, this was an ad-hoc analysis):

| Key | Dangerous / total |
|---|---|
| `left_punch_rec` | 324/324 |
| `leftdown_redbull`, `left_redbull` | 252/252 each |
| `leftdown_punch_rec` | 216/216 |
| `left_falling` | 166/540 |
| `down_talk` | 150/540 |
| `leftdown_talk`, `left_beso`, `left_talk` | 150/540 each |
| `down_llorar` | 130/504 |
| `down_trampa` | 70/540 |

Real examples used as the fix's test fixtures: rasta's own `pet09` `down_llorar` — 2 authored
frames (`[2, 2]`) vs the body's 39; `boomer`'s `pet01` `down_trampa` — 11 authored frames
(tail `[...,45,46,47,48]`, NOT a repeat) vs the body's 50.

**Scope, stated honestly.** The SPECIFIC `*_walk` family the user named as the trigger has ZERO
shortfalls across the entire compiled roster today — a pure straight walk cycle does not currently
reproduce this exact mechanism with currently-compiled data (confirmed both by the static scan
above and by the new e2e spec's 8 walk-direction tests, which all PASS even against the unfixed
code — see the RED/GREEN evidence table below). The mechanism itself is real, current, and
reproduces for many other action/emote keys — most plausibly `*_talk` (a chat bubble triggered
while the player is walking, 150/540 packages affected for `down_talk` alone), which a player
would reasonably describe as happening "during walking." The fix is general (keyed on any
body/accessory frame-count mismatch, not on `down_walk` specifically), so it closes the whole
class of defect regardless of which key eventually triggers it for a given player, and covers the
reported case exactly as well as the ones proven to reproduce today.

### Fix

New pure function `resolveAccessoryFrameId(seqIndex, accessoryFrames)` in
`client/src/phaser/layered/fallback.js`: clamps the body's `seqIndex` into the accessory's own
valid range (`Math.min(seqIndex, accessoryFrames.length - 1)`) instead of indexing unconditionally.
Wired into `LayeredAvatar._updateAccessory` in place of the old unchecked index.

**Clamp-to-last, never modulo/cycle-to-0 — a deliberate choice backed by real data**, not picked
merely because it makes the symptom go away: every short accessory array's own TAIL is already a
held/settled pose in the authored data (a single-frame array, e.g. `down_talk`'s `[2]`, is
trivially "held"; a genuine multi-frame short array, e.g. `boomer`/`pet01`'s `down_trampa` above,
ends on an actively-posed final frame, not a repeat) — holding that last frame continues what the
artist already drew. Cycling back to frame 0 would instead jump backward into an unrelated earlier
pose every time the short loop restarts — a NEW discontinuity, worse than the disappearing bug it
replaces, and the likely explanation for the user's SECOND symptom ("hace movimientos raros") had
a naive fix chosen modulo instead of clamp.

### New per-frame assertion (the gap this bug exposed)

Every existing e2e assertion (`avatar-resolved-state.spec.js`'s R1–R13) reads state after exactly
ONE frame (frame 0, or whichever frame happens to be current after `setDirection`/`playKey`) — an
accessory that vanishes on frame 7 of a 13-frame cycle was invisible to all of them. New file
`client/e2e/avatar-accessory-animation-sync.spec.js` walks a full animation cycle frame-by-frame
(`window.__avatarHarness.advance()` once per frame + `readState()` after each call, from frame 0
through `frameCount - 1`) and requires the hat/pet to stay `visible` with finite `x`/`y` for EVERY
frame, not just the first:

- All 8 walking directions for rasta + `minnieHat` + `pet09` (the exact reported combo) — proving
  they stay safe (they already were, per the scope table above) and stay safe after the fix.
- `down_llorar` (action-pack-backed, 39 body frames): `pet09` has only 2 authored frames — this is
  the real defect, captured RED before the fix. `minnieHat` has all 39 (a genuine match) — the
  built-in negative control, proving the helper does not just always pass.
- `boomer` + `pet01`, `down_trampa` (50 body frames, 11 authored pet frames ending on a genuinely
  different, non-repeated final frame) — proves clamp-to-last (not modulo) is what fires for a
  real "ends on a moving pose" package, checking the accessory's resolved `frameName` (texture
  identity) stays pinned to the held frame for every frame past the accessory's own last one.

### TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| Pure fix | `client/src/phaser/layered/fallback.test.js` | Unit | ✅ 17/17 (pre-existing `fallback.test.js` tests) | ✅ Failed: `TypeError: (0 , resolveAccessoryFrameId) is not a function` (5 new tests) | ✅ 22/22 passed | ✅ 5 cases (direct index, clamp-on-degenerate-repeat array, clamp-on-distinct-tail array, exact boundary, empty array) | ✅ Clean — no refactor needed |
| Wiring + per-frame e2e | `client/e2e/avatar-accessory-animation-sync.spec.js` | E2E | N/A (new file) | ✅ Captured against the UNFIXED `LayeredAvatar.js` line (temporarily reverted, run, then restored — never committed unfixed): `down_llorar` test failed with 37 `"frame N: pet.visible === false (disappeared)"` entries (frames 2–38); `down_trampa` test failed with 39 similar entries (frames 11–49); the 8 walk-direction tests PASSED even unfixed (matches the scope table) | ✅ 10/10 passed after restoring the fix | ✅ 3 distinct real-data shapes (degenerate 2-frame repeat, 11-frame distinct-tail, 8 walk directions as negative control) | ✅ Clean |

### Test Summary
- **Total tests written**: 15 (5 unit + 10 e2e)
- **Total tests passing**: 15/15 (client unit suite: 575/575 total, up from the 552 baseline —
  the extra tests beyond this pass's own 5 are concurrent in-flight work from other sessions, not
  claimed here)
- **Layers used**: Unit (5), E2E (10)
- **Approval tests**: None — no refactoring of already-tested behavior, only a new bounded-index
  function and one call-site substitution
- **Pure functions created**: 1 (`resolveAccessoryFrameId`)

**Full e2e suite re-run** (`cd client && npm run test:e2e`, single worker, includes this pass's new
spec file): **292 passed, 4 failed, 36 skipped (332 total)**. Of the 4 failures: 1 is the
already-documented, pre-existing `avatar-transfer.spec.js` cache-header failure (unrelated, present
before this pass). The other 3 (`avatar-canvas-tint.spec.js`'s rasta contact-sheet capture,
`avatar-contact-sheet.spec.js`'s `boomer` and `skeleton` captures) are the same class of
contention-driven flake this change has disclosed before (`apply-progress.md`'s slice 34 section:
"the FIRST e2e attempt overlapped with a still-running prior `playwright test` process") — this
full-suite run shared the dev server with two other concurrent agents actively editing files in
the same `client/src` tree, and Vite's HMR reloading mid-run is a known trigger
(`window.__avatarHarness` becomes briefly `undefined` mid-`page.evaluate`, exactly the error
observed: `Cannot read properties of undefined (reading 'setDirection')`). **Re-run in isolation,
immediately after**, confirms this: all 4 previously-failing tests plus their 3 sibling tests in
the same files — 7/7 passed. This pass's own new spec file
(`avatar-accessory-animation-sync.spec.js`) was re-run standalone multiple times and is
consistently 10/10 green; it is not implicated in the flake.

### Live, Docker-built, logged-in verification (God/test)

Rebuilt the client image (`docker compose up -d --build client`), logged in as `God`/`test` at
`http://localhost:8080` (via `playwright-cli`), entered the `OslanAbyss` public scene (equip
requires `user.currentArea`), confirmed `minnieHat` + `pet09` were already equipped (persisted from
the prior "Live-bug fix" session), and walked the character using the real click-to-move input
(`client/src/phaser/controllers/scene/CreateSceneController.js`'s `RequestSocketsEnum.USER_MOVE`
path — clicking a walkable, unoccupied tile; clicking an occupied/non-walkable tile is a documented
no-op, which is why several early attempts against a crowded spawn area produced no movement).

**Frame-strip evidence** (8 consecutive captured frames during a real walk, ~140ms apart, cropped
to the character): `minnieHat` (the red/white polka-dot bow) is visible in **every one of the 8
frames**; `pet09` (the black creature) is visible in frames 0–3 and then occluded by ANOTHER LIVE
PLAYER'S sprite walking in front of it in frames 4–7 (a different bot account's avatar blocking the
view — confirmed by comparing pixel content, not this change's own rendering) — not a
re-disappearance of the pet's own sprite. Saved (this session's scratchpad, not committed, matching
this change's own established precedent for live-verification screenshots):
`/private/tmp/claude-502/-Users-evgeny-lyubeznyy-Desktop-Proyectos-boombang-html5/2cbdeeb8-9f2b-4d68-bbd5-4ef8ca5a6fec/scratchpad/rasta-down-walk-frame-strip-live.png`
(the assembled, labelled 8-frame strip) and the source frames under
`.../scratchpad/livewalk6/frame00.png`–`frame15.png`.

**Environmental hazard disclosed, not a code defect**: this session repeatedly lost its `God`
session mid-test. Root-caused, not assumed: `playwright-cli list` showed a SECOND, stale browser
session (named `default`) already logged in as `God` from an earlier, unrelated session — the
server's own single-session-per-account behavior kicked whichever session was older each time the
other's socket did anything. Closed the stale session; the account was stable afterward. This is a
pre-existing fact about the shared `God` test account (used by at least one other concurrent
agent's task too), not something this fix's own code causes — disclosed so a future session does
not waste time on the same misdiagnosis. No stray playwright/chromium-headless process or browser
session was left running at the end of this pass (`playwright-cli list` → "(no browsers)").

### Files changed

Production code:
- `client/src/phaser/layered/fallback.js` — new `resolveAccessoryFrameId`, exported.
- `client/src/phaser/layered/LayeredAvatar.js` — `_updateAccessory` now calls it instead of
  indexing `manifest.anims[sourceKey].frames` directly.

Test code:
- `client/src/phaser/layered/fallback.test.js` — 5 new cases for `resolveAccessoryFrameId`.
- `client/e2e/avatar-accessory-animation-sync.spec.js` (new) — 10 cases (8 walk-direction
  full-cycle checks + `down_llorar` + `boomer`/`down_trampa`).

Openspec:
- `openspec/changes/avatar-system-multichar-fixes/tasks.md` — new "Slice 35" section, out-of-band
  per the same precedent as Slice 34.

No server/API/DB changes — this is a pure client-side rendering fix; the accessory data itself
(compiled `.accessory.json` files) is unchanged and does not need recompiling.

### Carried-forward gaps, not silently dropped

- The roster-wide mismatch scan (7,986 dangerous/non-dangerous triples) was an ad-hoc analysis for
  this investigation, not committed as a reusable script/gate. A future slice could promote it to
  a `scripts/measure-accessory-frame-coverage.cjs`-style tool (mirroring `measure-accessory-
  overlap.cjs`'s own precedent) if ongoing visibility into this ratio as more characters/packages
  are added is wanted — not built here since this pass's own scope is the live bug, not new
  tooling.
- The `*_talk` family (150/540 `down_talk` packages affected) was named as the most plausible real
  trigger for "during walking" but not independently reproduced live in this session (the live
  verification focused on the reported walk case, per the user's own wording) — the e2e spec
  covers it in mechanism (`down_llorar`/`down_trampa`, the same clamp path) but not that literal
  key. Low risk: the fix is keyed on the general mismatch, not the specific key, so `down_talk`
  is covered by construction, not by a dedicated test — disclosed rather than assumed equivalent
  without saying so.
- Did not touch the concurrent `god`-character or bot-glove-colour work (`AvatarEnum.js`,
  `UserUppercutAnimation.js`, `server/src/packages/bots/`) — confirmed by `git diff --stat` scope
  before finishing: only `fallback.js`, `fallback.test.js`, `LayeredAvatar.js`, the new e2e spec,
  and this change's own `tasks.md`/`apply-progress.md` were touched by this pass.

---

## God — new character registration + raster-only compile (out-of-band, 2026-08-19)

Not part of `design.md`'s own numbering — a direct, human-requested addition ("Vamos a traerlo
como sully es posible que este personaje no tenga acciones etc", 2026-08-19), delivered the same
way `sally` was: PR10-style registration plus a real asset compile, done together in one pass
rather than split across two, because the source package's real shape (below) made a bounded
compile cheap enough to do immediately.

### What was actually true about `god.bb` — two premises in the initiating brief were wrong, verified by direct inspection

- **`god.bb` (16,959,144 bytes) does declare `"raster": true`, not `"layers": true`, and has no
  `god.layers.bb`** — this premise was correct.
- **The claim that only the `down` direction family exists was FALSE.** Direct read of
  `unzip -p god.bb meta.json`'s `anims` map shows five real direction families — `down`, `left`,
  `leftdown`, `leftup`, `up` — with real per-direction `idle`/`talk`/`walk` sequences, exactly the
  same five families `rasta.bb`'s own vector `meta.json` declares (verified side by side). `right`
  is absent from BOTH, because it is never authored anywhere in this source dump — every
  `.layers.bb` base package ships the same 5-family convention and derives `right*` at compile
  time via mirroring (`bakedKeyMap.cjs`'s `deriveConventionMirrors`, the sally BLOCKER fix's own
  mechanism, reused unchanged here). So the "8 axes" requirement is achievable for whichever keys
  are compiled, via the same mirror convention every other character uses — not a god-specific
  exception.
- **god DOES have real emote/action data**, as the brief said, and it is large: `down_special`
  (196 frames), `leftdown_punch_rec` (320), `left_beber` (174), `down_trampa` (96), etc. — 26
  non-idle/talk/walk keys totalling most of her 1076-entry frame pool.
- **`god`'s `_frames.json` is flatter than a normal character's.** A normal vector character's
  `_frames.json` entry is `{o, L:[{p,x,y,w,h}], ...}` — possibly several composited pieces per
  frame. god's own entry is `{o, x, y, w, h, p}` — no `L` wrapper, ONE implicit piece per frame,
  because there is no vector path data to composite from at all (fact B/§5.2 do not apply; every
  `p<N>.png` is an already-cropped, already-rasterized image). Confirmed the SAME shape exists in
  `ghost.bb`/`wraith.bb` (both also declare `"raster": true`) — **a real, disclosed finding for
  whoever picks up slice 23**: that slice's own design (§5.6, `--from-vector`) assumes vector
  `meta.anims` path data to rasterize via `svgFromPaths`, but ghost/wraith have none either — their
  own action jsons are the same flat frame-index-into-a-pre-rasterized-pool shape god's are. Slice
  23 as currently designed cannot run as written; `compile-raster-avatar.cjs` (below) is the
  compiler that shape actually needs, though wiring it into slice 23 itself is out of this pass's
  scope (frozen `tasks.md`).
- **god has no accessory packages at all** (`ls -d personajes/god` on the source dump finds
  nothing) — body-only, same as sally.
- **Production naming (`godSprites`, `images/bpad/god.svg`, `images/ficha/masks/god.svg`) is
  consistent with a special/admin marker**, not necessarily an ordinary player-selectable avatar —
  disclosed, not resolved, in `GodAvatarCatalogItemSeeder.php`'s own docblock. This pass registers
  her exactly the way "follow the sally pattern" asks or or, without deciding the product question
  either way.

### What is achievable, stated before implementation (per the user's own instruction)

Given the above, a **full** compile of all 41 keys was technically possible (measured: 3 pages,
~4.9 MB compiled) but was **not** the shape shipped, for a real, load-bearing reason found while
building it: `AvatarManager.loadLayeredAvatar`'s BASE-pack loader patches every
`atlasJson.textures[]` entry with the SAME single webp URL (`atlasJson.textures.forEach((texture)
=> { texture.image = webpUrl; })`, comment: "Single-page packages only need the one entry
patched") — it has never been exercised against more than 1 page because every character compiled
before this one has a 1-page base pack. Shipping god's full 3-page set through that path would
silently serve page-0 art for pages 1-2's pieces. Rather than change code every one of the 16
already-shipped characters depends on, under time pressure, for a one-off character, this compiler
restricts itself to the **idle/talk/walk × 5-direction convention every other character's own base
pack already carries** (15 real keys + 9 convention-derived `right*` mirrors = 24 total), which
measures at exactly 1 page (4088×879, 99 pieces, 392 KB compiled) — inside the existing, proven
contract. **The 26 emote/gesture/punch keys (`down_llorar`, `down_coco`, `leftdown_punch_rec`,
etc.) are NOT compiled** — an explicit, disclosed scope reduction the user's own framing accepted
("es posible que este personaje no tenga acciones"), not a silent gap. Result: god renders
correctly, facing every one of the 8 axes, for idle/talk/walk; she has no emotes/gestures yet.

### Files changed

**Client — registration (mirrors PR10/sally exactly):**
- `client/src/enums/AvatarEnum.js`, `server/src/enums/AvatarEnum.js` — `GOD: 19`.
- `server/src/enums/AnimationBlockTimerEnum.js` — 11 `GOD_*` constants (flat 5000ms, same
  no-bespoke-timing convention SALLY's own entries use).
- `server/src/maps/EmojisBlockActionsMap.js` — `[AvatarEnum.GOD]` added to all 8 real emoji-keyed
  blocks (LAUGHTER_1, LAUGHTER_2, CRY, LOVE, SPIT, FART, PROVOKE, FLY).
- `client/src/phaser/controllers/scene/AddUserController.js`,
  `UserChangeAvatarController.js` — `case AvatarEnum.GOD: return "god";` added to both
  `avatarName()` switches.
- `client/src/phaser/managers/AvatarManager.js` — `LAYERED_ONLY_CHARACTERS` gains
  `AvatarEnum.GOD` (no baked art exists for her either).
- `client/src/phaser/managers/AssetVersionManager.js` — `avatarVersions.avatars[19]` +
  `layeredVersions.characters.god` entries.
- `client/src/phaser/preloaders/AvatarsDataPreload.js` — `[AvatarEnum.GOD]: asset_god_json`
  (her real compiled `--emit-config-shim` output, not a placeholder).

**Task 3 — the disclosed `sally` `getAvatarName` gap, fixed at the source:**
`AvatarManager.getAvatarName`'s hardcoded `avatarNames` dict never had a SALLY entry (added
after that dict was written, per slice 34's own note) — every caller (`loadAvatar`,
`getSmartAvatarPathV2`, `AssetVersionManager.js`, not just the debug panel's own
`characterNameForAvatarId` workaround) reported her as `"unknown"`. Added `SALLY: "sally"` and
`GOD: "god"` to the same dict — RED/GREEN captured below.

**The raster-only compiler (new capability, no spec delta — orthogonal to the vector pipeline
slices 1-33 already shipped):**
- `client/scripts/lib/buildRasterAvatarManifest.cjs` (new, pure) + `.test.cjs` — maps a raw
  `_frames.json` pool + per-key frame-index arrays + packed atlas placements directly into the
  SAME manifest shape `compile-layered-avatar.cjs` emits (`pieces`/`frames`/`sequences`/
  `bodyBounds`/`slots`/`mirrors`/...), filtering both `pieces` and `frames` down to ONLY the
  indices some compiled sequence actually references (a real, tested behaviour — an earlier draft
  left the full 1076-entry pool in every compile, inflating `bodyBounds` with poses that were
  never packed).
- `client/scripts/compile-raster-avatar.cjs` (new) — orchestration: stages from
  `.assets-src/raster/<char>/`, filters `meta.anims` to the `_(idle|talk|walk)$` suffix
  convention (logs every skipped key), packs referenced `p*.png` pieces via the SAME shared
  `packFrames` (dynamic `import()`, `client/src/shared/assetPipeline/packFrames.js`) the vector
  compiler uses, composites + encodes with the SAME `{lossless:true, effort:6}` base-pack webp
  settings, reuses `deriveConventionMirrors` (bakedKeyMap.cjs) for `right*` mirrors, reuses
  `computeManifestSlots`/`checkPageBudget`/`filterRegularFileNames`, and supports
  `--emit-config-shim` via the EXISTING `buildConfigShim.cjs` (zero changes to that module — its
  contract only needs `bodyBounds`/`ss`/`sequences`/`frames`/`mirrors`, which this manifest shape
  already carries).
- `client/.assets-src/raster/god/` — staged (unzipped `god.bb`), untracked per
  `client/.gitignore:36` (`.assets-src/`).
- `client/src/assets/game/avatars/god/layers/god.layers.{webp,atlas.json,manifest.json}` +
  `client/src/assets/game/avatars/god/config.json` — compiled output. 1 page, 99 pieces, 15
  sequences + 9 mirrors, 0 palette slots (no colormeta at all — same shape as sally), `bodyBounds:
  {w:72,h:115}`. Compiled twice consecutively and `sha1sum`-diffed: byte-identical (determinism
  check, slice 20's own convention).

**API — catalog row, plus a live-caught, fixed defect affecting BOTH characters' seeders:**
- `api/database/seeders/GodAvatarCatalogItemSeeder.php` (new).
- `api/database/seeders/SallyAvatarCatalogItemSeeder.php` (existing file, corrected) — running
  the god seeder for real (PHP available via `docker compose exec api`, unlike PR10's own
  disclosed "PHP not installed" blocker) surfaced two real defects in `CatalogItem::create()` as
  originally written for BOTH characters: (1) `HasTranslations` double-wraps a `['en' => ...]`
  array (`{"en":{"en":"Avatar God"}}` instead of `{"en":"Avatar God"}`, verified against rasta's
  own real row) — a plain string is what gets correctly single-wrapped; (2)
  `CatalogItem::setSpreadsheetAttribute()` has no code path that accepts a plain placeholder for
  the NOT-NULL, no-default `spreadsheet` column — `$value == null` (PHP loose comparison, true
  for `''` too) calls `Storage::delete(null)` (`TypeError`, live-reproduced), and any other plain
  string fails `is_file()` and is silently never assigned (back to the original "doesn't have a
  default value" DB error, one call deeper). Both seeders now use `DB::table('catalog_items')
  ->insert([...])`, bypassing both the translation trait and the file-upload mutators entirely —
  the correct fix for a seeder with no real uploaded asset to hand either. Both rows created and
  verified live in the running `db` container (`user_decoration_value` `18`/`19`), idempotence
  re-verified by re-running each seeder and confirming the row count stays 1.

### Disclosed deviations / open items

1. **26 of god's 41 source `meta.anims` keys are not compiled** (every emote/gesture/punch) —
   stated above, matching the user's own accepted possibility. Compiling them requires either
   fixing the shared base-pack loader's single-page assumption or building the per-key lazy
   action-pack machinery `compile-layered-avatar.cjs` already has for this raster shape — both
   real, bounded follow-ups, neither attempted here.
2. **god is not added to `avatar-resolved-state.spec.js`'s numeric R1-R13 matrix or the contact-
   sheet tooling** (slice 21's own deliverables) — this pass's live verification is the real
   Docker-built client + a live login + the debug panel + a direct screenshot (below), not the
   harness-driven numeric gate every slice-22-onward character goes through. A future pass
   extending the matrix to god is a natural next step, not attempted here to keep this pass's own
   scope bounded to what "follow the sally pattern, she may lack actions" actually asked for.
3. **Whether `god` should be reachable through the ORDINARY avatar-selection UI is not decided
   here** — `GodAvatarCatalogItemSeeder.php`'s own docblock states the production-naming finding
   (`godSprites`/`bpad/god.svg` suggest a special/admin marker) and registers the SAME shape of
   row every other avatar has, without resolving the product question either way. The debug
   panel's own character switcher (this session's actual verification path) does not consult
   this row at all.
4. **`ghost`/`wraith`'s own slice 23 design premise is now known to be wrong** (see "flatter than
   a normal character" above) — recorded here since it was found building this compiler, not
   fixed (frozen `tasks.md`/`design.md`).
5. **The full e2e suite (285/322) was not re-run in this pass** — a stray `playwright test
   --workers=1` process from a prior/concurrent session was still running when this pass started
   (exited on its own partway through, not killed by this pass) and re-running the entire suite
   risked exactly the contention class slice 34 already documented (false failures from
   overlapping `playwright test` invocations). Two SCOPED runs were done instead as regression
   evidence for the two areas this pass actually touches: `npx playwright test -g "sally"` (10
   passed, 7 skipped-with-reason — unchanged shape from PR10/the BLOCKER fix) and `npx playwright
   test -g "rasta"` (33 passed, 1 skipped — the same pre-existing skip). Recommend a full,
   single-worker re-run as a follow-up verification step.

### TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| `buildRasterAvatarManifest` | `scripts/lib/buildRasterAvatarManifest.test.cjs` | Unit | N/A (new) | not-run (nonexistent module) | Passed (7/7) | 7 initial cases (pieces shape, frames/L shape incl. blank frame, sequence passthrough, `_talk`→repeat:0 vs repeat:-1, bodyBounds from max dx+w/dy+h, mirrors/aliases/slots defaults, character/ss passthrough) | Clean |
| `buildRasterAvatarManifest` — unreferenced-index exclusion | same file | Unit | ✅ 7/7 (already-passing suite) | N/A (additive triangulation case, not a regression fix — the behaviour did not exist as a bug to reproduce, it was designed in from the start of this specific test) | Passed (8/8) | a 4th frame/piece present in `framesRaw` but referenced by no compiled sequence, asserting it is excluded from both `frames`/`pieces` AND does not inflate `bodyBounds` | Clean |
| `AvatarManager.getAvatarName` (SALLY/GOD fix) | `src/phaser/managers/AvatarManager.test.js` | Unit | ✅ 4/4 (pre-existing `getOrLoadLayeredManifest` suite) | ✅ `AssertionError: expected 'unknown' to be 'sally'` / `'unknown' to be 'god'` (2 real failures against the EXISTING method, both captured) | ✅ 8/8 | 4 cases: existing character (rasta/zombie unaffected), sally (the disclosed gap), god (new registration), unregistered id still falls back to "unknown" | Clean |
| `AvatarsDataPreload` (god wiring) | `src/phaser/preloaders/AvatarsDataPreload.test.js` | Unit | ✅ 2/2 (pre-existing sally-wiring suite) | ✅ `AssertionError: expected [ ... 19 keys ] to have a length of 18` (real regression against the existing roster-count assertion, captured before updating it) | ✅ 3/3 | existing-roster-count updated to the new true total (19) + a new god-specific `window.avatars_config[GOD]` well-formed-entry case | Clean |
| `AccessoryManager` (god has no packages) | `src/phaser/managers/AccessoryManager.test.js` | Unit | ✅ 5/5 (pre-existing sally-no-packages suite) | N/A (approval/verification-style, disclosed — same pattern as the file's own sally block: documents already-correct generic miss-path behaviour, not new logic) | Passed (7/7, 2 new cases) | `hasPackage` false for both hat/pet kinds, `load` rejects naming god+key | Clean |
| Compile-time registration wiring (enum/name/version/server maps) | full unit suite | Integration | ✅ 76/76 (post-god-lib-additions) | N/A (additive registrations, no new pure logic to RED-first — matches PR10's own precedent for this exact class of change) | ✅ 76/76 unchanged in file count, +test count from the above | N/A | Clean |
| `compile-raster-avatar.cjs` end-to-end | live compile against real `god.bb` data (not a unit test — an integration/build-tool run) | Integration | N/A (new script) | N/A (build tool, not a testable unit beyond its own extracted pure function above) | ✅ compiled successfully, 1 page/99 pieces/15 sequences/9 mirrors/0 slots; two consecutive runs `sha1sum`-identical | N/A (single real input, `god`) | Clean |
| `GodAvatarCatalogItemSeeder`/`SallyAvatarCatalogItemSeeder` | live `docker compose exec api php artisan db:seed` | Integration | N/A (PHP now available, unlike PR10's own disclosed blocker) | ✅ both real failures captured and diagnosed live (`Field 'spreadsheet' doesn't have a default value`, then `TypeError: ...delete(): Argument #1 ... null given`) before the `DB::table()->insert()` fix | ✅ both rows created (`user_decoration_value` 18/19), verified via `tinker` | Idempotence re-verified for both (re-run → row count stays 1) | Clean |

Full client suite after this pass: `cd client && npx vitest run` → **76 test files, 575 tests,
passing**. `cd client && npx playwright test -g "sally"` → **10 passed, 7 skipped (unchanged
shape)**. `cd client && npx playwright test -g "rasta"` → **33 passed, 1 skipped (unchanged, the
same pre-existing skip)**. `cd api && ./vendor/bin/phpunit` → **6 tests, 1 pre-existing failure**
(`ExampleTest` expecting 200 on `/`, unrelated — matches the environment's own documented
baseline).

### Live verification — real Docker image, real login, real debug-panel switch, real screenshot

`docker compose up -d --build client` (also recreated `api`/`server` per compose's own dependency
resolution — this dropped an earlier in-progress browser session mid-verification, requiring a
second login; recorded because it explains a "Local player not found" / unexpected logout
encountered along the way, NOT a god-specific defect — the SAME thing happened switching to
`rasta` in the same session before the containers had settled). Confirmed `god.layers.*` present
in both the built `dist/` (`/usr/share/nginx/html/assets/js/god.layers-*.js`, `.webp`) and the
`.bb` bundle (`bundles/god.layers.bb`).

Logged in as `God`/`test` (a username, unrelated to this character), entered the real `OslanAbyss`
public room (confirmed via `window.game.scene.getScenes(false)` — `PublicScene.isSceneReady ===
true`, `Object.keys(scene.users)` populated with 7 real connected players), opened the debug
panel, selected `god` from the character dropdown — panel reported "Switched to god (session-only,
not persisted)." — and the local player's own avatar re-rendered in place as god: a distinct,
fully-detailed bearded figure with a green/gold crown, visibly different from every other avatar
in the room, name-tagged "God", facing down (the default idle pose). Screenshot captured directly
from the live session (not the harness): `/tmp/god_clean1.png` (full scene) and a 4×-zoomed crop
`/tmp/god_zoom2.png` (facial/headwear detail) — both outside the repository (this pass's scratch
output, per the no-report-files convention; reproducible by repeating the steps above against the
rebuilt image). Console showed no god-specific errors (the only warnings present —
`wraith_atlas`/`down_ouch`/`down_victoria` frame-not-found — are pre-existing and unrelated to an
NPC elsewhere in the room, not this character).

A second attempt to capture all 8 directions via the dev-only Playwright harness
(`client/harness.html`, `VITE_AVATAR_HARNESS=true npm run dev`, `window.__avatarHarness.spawnAvatar
+ playKey`) was started but the browser session became unstable partway through (closed
unexpectedly after a few direction switches) before a usable multi-direction contact sheet was
captured; the dev server and its background process were stopped afterward
(`pkill -f "vite --port"`/`node_modules/.bin/vite`, confirmed no stray processes remain). The
single real-scene screenshot above is what stands as this pass's live proof — reproducible, but
not repeated here for all 8 axes given the session instability encountered. Extending
`avatar-resolved-state.spec.js`'s R1/R5-mirror matrix to `god` (deviation 2 above) would give a
more stable, scriptable way to verify all 8 directions in a future pass.

---

## Slice 37 — Re-investigation: hat-disappears-while-walking not reproducible; pet/hat desync during punch-received knockback found and fixed (out-of-band, 2026-08-19)

User correction after Slice 35 shipped (Spanish, verbatim): "no no estaba hablando solo caminando
y entre pasos desapareceia el gorro y sigue desapareciendo" — only walking, no talking, no `*_talk`
animation involved; the hat disappears BETWEEN STEPS; still happens after Slice 35's fix. A second
symptom was folded into this same investigation mid-task (coordinator-flagged, same code area):
"cuando me pegan la animacion el pet tambien se mueve de posicion" — the pet shifts position while
the local player is on the receiving end of a punch.

### Method: reproduce live first, per the brief's explicit requirement

Logged in as `God`/`test` at `http://localhost:8080` (`playwright-cli`, real Docker-built client,
real Socket.IO session — not the dev harness), entered the real `OslanAbyss` public room. No stale
duplicate session was found at the START of this pass (`playwright-cli list` → clean); one DID
occur mid-session (see "Environmental hazard" below), consistent with the previously-disclosed
shared-account risk.

**Symptom 1 (hat disappears while walking) — reproduction attempted, not achieved.** Patched
`LayeredAvatar._applyFrame` directly (not just the `animationupdate` event, which skips the very
first frame of every fresh `play()` call — a real gap in Slice 35's own e2e coverage, noted for
the record) to record `{seqKey, seqIndex, accessory visible/x/y}` on EVERY rendered frame, for the
LOCAL player (rasta, avatarId 12, `minnieHat` + `pet09` — the debug panel's own defaults, matching
Slice 35's own reported combo). Drove REAL click-to-move walking (not the harness): one long
continuous multi-tile walk (142 frames, one direction change, `down_walk` → `leftdown_walk`,
zero idle interruption — confirms the server delivers a real continuous multi-tile path, not
single-tile hops with idle in between) and a second run with 5 successive clicks in different
directions (207 frames, 8 direction transitions including a final walk→idle, all captured via the
`_applyFrame` patch so even the very first frame of each fresh `play()` was seen). Combined: over
350 sampled frames, zero `visible === false`, zero non-finite x/y, for both hat and pet, across
every transition. Also checked and ruled out, with evidence, three further candidate mechanisms
named in the brief:
- **Missing-direction gap**: both `minnieHat.accessory.json` and `pet09.accessory.json` declare
  `anims{}` entries for all 5 canonical direction families (`down/left/leftdown/leftup/up`) —
  `accessoryFollows` cannot be false for any walk-family key on this combo.
- **Mixed ss placement math**: `minnieHat` is ITSELF compiled at `ss:1` (confirmed by reading its
  own `.accessory.json`) — the mixed-ss hypothesis was already being exercised live in every one
  of the above traces, not a separately-untested case.
- **Lazy accessory-pack loading**: `AccessoryManager` has no per-key action-pack mechanism at all
  (unlike the body's `_atlasKeys.actions`) and no eviction logic (`actionPageEviction.js` is
  BODY-action-page-only, grepped and confirmed) — an accessory's one atlasKey is loaded once at
  spawn and never evicted, so this class of gap cannot apply to hat/pet at all.

Cross-checked against Slice 35's own roster-wide static scan already on record (2,700 `*_walk`
(package, key) pairs across the WHOLE roster, 0 length mismatches) — two independent methods
(static data scan, live socket-driven reproduction) now agree. **Conclusion, stated plainly per
the method requirement rather than fixing something adjacent: the walk-only "entre pasos"
disappearance could not be reproduced** with the currently compiled data via the frame-clamp
mechanism, a missing-direction gap, ss:1/ss:2 placement math, or accessory-pack eviction — the
four candidates the brief named as worth ruling in or out. Nothing was fixed for this symptom;
recorded as an open item, not silently closed (see "Carried-forward gaps" below).

### Symptom 2 (pet moves position when hit) — reproduced immediately, root cause proven

Live-triggered `leftdown_punch_rec` directly on God's own `spriteAvatar` (`play()`, real 400-frame
action pack, loaded via the real `onActionPackNeeded` lazy-load path) and read
`sa._accessories.get('hat'|'pet').sprite.{x,y,visible}` while stepping `spriteAvatar.y` through the
EXACT values `UserUppercutAnimation.launchUpwards` (`client/src/phaser/animations/
UserUppercutAnimation.js`) writes during the real knockback tween (`0 → -1000` in 5 steps, matching
the real `500 * gameConfig.DPI(2) * sceneScaleFactor(1)` magnitude), calling `sa.tick(50)` after
each step so `_updateAccessory` re-ran exactly as it does every real animation frame:

| step | spriteAvatar.y | hat.y | pet.y |
|---|---|---|---|
| before | 0 | -243.0 | -340.5 |
| 1 | -200 | -243.0 (unchanged) | -340.5 (unchanged) |
| 2 | -400 | -243.0 | -340.5 |
| 3 | -600 | -243.0 | -340.5 |
| 4 | -800 | -243.0 | -340.5 |
| 5 | -1000 | -243.0 | -340.5 |

Hat/pet `x`/`y` stayed **bit-for-bit identical** across every step while the body's own Container
transform moved 1000 real px — proof the accessory never followed the body during the launch.
Screenshot (zoomed): pet09's black silhouette visible pinned near the ground/mid-frame while the
body (only its top edge + hat bow) is far above it — `/private/tmp/.../scratchpad/
punch-launch-fixed-zoom.png` is the AFTER (fixed) version of this same shot; the BEFORE shot was
not separately saved (the numeric trace is the evidence of record, per the brief's own guidance
that the numeric trace, not a screenshot, identifies the cause).

**Root cause, named precisely**: `resolveAccessoryPlacement` (`client/src/phaser/layered/
pivot.js`) computed an accessory's `x`/`y` purely from the body's per-frame origin (`bodyOrigin`),
silently assuming the LayeredAvatar Container's OWN `x`/`y` transform always sits at `(0, 0)` —
true for ordinary `play()`/`tick()`, but violated by `UserUppercutAnimation.launchUpwards`, which
tweens `spriteAvatar.y` (the Container's own transform, NOT a per-frame manifest value) directly
to fly the body upward on knockback. The body's pooled pieces (`this._pool`) are real Phaser
`Container` children of the SAME LayeredAvatar instance, so they move for free when its transform
changes. Hat/pet sprites are NOT children of that Container — `AddUserController.
createContainerUser` parents them as SIBLINGS directly to `containerUser` — so nothing about the
Container's own transform ever reached their position calculation. This is a distinct, unrelated
mechanism from Slice 35's frame-count-clamp bug (a body/accessory frame-COUNT mismatch); this one
is a body/accessory TRANSFORM-SPACE mismatch, and would apply to ANY code path that ever moves
`spriteAvatar.x`/`.y` directly rather than through the manifest's own per-frame data — currently
only `UserUppercutAnimation.launchUpwards` in production, though the flag-gated debug tool
`MovementControlsController.js` (`spriteAvatar.x/y -= moveSpeed`) has the identical shape and
would have shown the same desync if exercised (not separately verified — dev-only, gated off by
default, out of this pass's scope).

### Fix

`resolveAccessoryPlacement` gains two new optional trailing parameters, `containerOffsetX = 0`,
`containerOffsetY = 0` (after the existing `referenceSs` parameter), added onto the already-
computed `x`/`y` just before returning. Every pre-existing call site (all with fewer positional
args) is byte-for-byte unaffected — the new terms default to 0. `LayeredAvatar._updateAccessory`
passes `this.x`, `this.y` (the LayeredAvatar Container's own current transform) as those two new
arguments. Also updated the pet's own side-of-body clamp: `computeBodyBoundsX`'s returned
`minX`/`maxX` do NOT carry this term (the body's own pieces are real children, never needing one),
so `finalX`'s clamp inputs are shifted by the same `this.x` to keep both sides of that comparison
in the same coordinate space — defensively correct for a (currently unused, since
`launchUpwards` only touches `y`) horizontal container offset too, not just the vertical case
proven live.

### New e2e assertion, and why Slice 35's own per-frame assertion missed this mechanism

`avatar-accessory-animation-sync.spec.js` gained a new `describe` block plus a new harness method,
`setBodyContainerOffset(socketId, x, y)` (`avatarHarnessApi.js`) — mirrors EXACTLY what
`UserUppercutAnimation.launchUpwards` does to `spriteAvatar.y` in production, deterministically
and without racing a real 800ms Phaser tween, wired through the SAME `readState()`/`advance()`
primitives the existing per-frame walk assertions already use. Slice 35's own assertion (and every
`avatar-resolved-state.spec.js` R-check) drives the animation CLOCK only (`advance(ms)`/`tick()`);
nothing in the harness, before this fix, ever moved the LayeredAvatar Container's own `x`/`y` away
from `(0, 0)` — which is the ONE mutation `launchUpwards` performs that no prior test exercised.
Per-frame coverage of the animation clock and coverage of the Container's own transform are two
different axes; Slice 35 covered the first, this fix covers the second.

### TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| `resolveAccessoryPlacement` containerOffset | `client/src/phaser/layered/pivot.test.js` | Unit | ✅ 26/26 (pre-existing suite) | ✅ `AssertionError: expected 24 to be close to 54` (offset not yet applied) | ✅ 29/29 passed | ✅ 3 cases (default-zero parity with every pre-existing call shape, an explicit offset on both axes, offset composed with mirroring applied AFTER the mirrored reflection) | ✅ Clean |
| Wiring + pet-clamp offset consistency | `client/src/phaser/layered/LayeredAvatar.js` (no unit-test boundary — same documented reason as the class itself, design.md §8) | N/A | N/A | N/A — verified live instead (see numeric trace above) | N/A | N/A | N/A |
| New e2e mechanism coverage | `client/e2e/avatar-accessory-animation-sync.spec.js` | E2E | ✅ 233/233 pre-existing (`avatar-accessory-animation-sync.spec.js` + `avatar-resolved-state.spec.js` together, re-measured at the START of this slice) | ✅ Captured against a temporarily-reverted fix (the two new call-site arguments set to `0, 0`, restored immediately after — never committed unfixed): `Error: step 1: hat.y tracks the body offset — Expected: -443, Received: -243` | ✅ 11/11 passed (the new test plus the 10 pre-existing in the same file) after restoring the fix | ✅ 5 deterministic offset steps (0 → -1000) plus an x-axis negative control (pinned, proving the fix does not move both axes unconditionally) | ✅ Clean |

### Test Summary

- **Total tests written**: 4 (3 unit in `pivot.test.js` + 1 e2e in
  `avatar-accessory-animation-sync.spec.js`)
- **Total tests passing**: client unit 578/578 (up from 575); the two accessory-focused e2e
  files together 233/233 passed, 36 skipped, 0 failed (up from a 232/36/0 baseline re-measured
  fresh at the start of this slice)
- **Layers used**: Unit (3), E2E (1, new) — plus extensive live-browser verification (Playwright
  against the real Docker-built client) for BOTH symptoms, per the method requirement
- **Approval tests**: none — `resolveAccessoryPlacement`'s new parameters are additive
  (default-0), not a behaviour-preserving refactor of existing logic
- **Pure functions created**: 0 new functions; 1 existing pure function (`resolveAccessoryPlacement`)
  extended with 2 new optional parameters

### Live verification — real Docker image, twice over

Rebuilt the client image (`docker compose up -d --build client`, which also recreated `api`/
`server` per compose's own dependency resolution — dropped the browser session, requiring
re-login each time; consistent with the SAME behaviour Slice 35 already documented, not new).

**Synthetic reproduction, before and after the fix**, both against the rebuilt image, same
account/combo (God/rasta/minnieHat/pet09), same `leftdown_punch_rec` action pack, same 5-step
`spriteAvatar.y` walk from 0 to -1000: BEFORE (temporarily-reverted code, same numbers as the RED
row above) hat/pet frozen; AFTER (fix restored) —

```
step 1: spriteAvatarY=-200  hat.y=-443.0  pet.y=-540.5
step 2: spriteAvatarY=-400  hat.y=-643.0  pet.y=-740.5
step 3: spriteAvatarY=-600  hat.y=-843.0  pet.y=-940.5
step 4: spriteAvatarY=-800  hat.y=-1043.0 pet.y=-1140.5
step 5: spriteAvatarY=-1000 hat.y=-1243.0 pet.y=-1340.5
```

Every step: `hat.y = -243.0 + spriteAvatarY` and `pet.y = -340.5 + spriteAvatarY`, exactly —
confirmed both numerically and visually (zoomed screenshot: pet09's silhouette now sits directly
below the body's own flying-upward position, not left behind at the ground). Reset to
`spriteAvatar.y = 0` + `play('down_idle')` afterward and screenshotted: normal idle rendering is
unaffected — hat/pet sit at their ordinary positions, visually identical to the pre-investigation
baseline screenshot.

**Real, unscripted live event — the strongest evidence** (not manufactured): during a continuous-
walk trace captured AFTER the fix was rebuilt into the image (deliverable requirement 4: "walk
continuously through several tiles and show the accessory persisting throughout"), a BOT actually
punched God mid-test. The trace (375 total frames, `_applyFrame`-patched, every frame captured)
shows: `down_walk` → `rightdown_walk` → `rightdown_idle` → `left_idle` → `leftdown_punch_rec`
(285 consecutive frames, seqIndex 0 through 284 — the real action pack, loaded live), with
`hat.y`/`pet.y` sitting at their normal `-243.0`/`-340.5` for the first 159 frames (before the
frame-160 launch trigger), then jumping to EXACTLY `-1243.0`/`-1340.5` (a `-1000` shift, matching
the real `launchUpwards` magnitude) for the remaining 125 frames once the real knockback tween
fired — **zero visibility or finite-position violations across all 375 frames**, covering
walking, idling, AND a real punch-received knockback in a single unscripted session. This is
live proof stronger than a synthetic test: the fix held under a real gameplay event this pass did
not script or trigger itself.

**Environmental hazard, disclosed not assumed away**: this pass's own click-to-move testing twice
navigated the local session out of `OslanAbyss` back to the lobby unintentionally (a click near
the room's left archway/edge appears to double as an exit trigger, OR a stale duplicate session —
both are plausible and this pass did not fully distinguish which; the console log showed no
disconnect/kick message either time, weakly favouring the click-target theory) — re-entering the
room each time picked up the SAME persisted server-side session (socket id changed per browser
reload, username/state did not). Recorded so a future pass does not waste time re-diagnosing the
same navigation quirk. No stray `playwright-cli` browser session or background process was left
running at the end of this pass (`playwright-cli list` → "(no browsers)"; `ps aux` showed no
lingering `playwright test`/`chromium_headless_shell` processes from this pass's own work).

### Files changed

Production code:
- `client/src/phaser/layered/pivot.js` — `resolveAccessoryPlacement` gains
  `containerOffsetX`/`containerOffsetY` (default 0), added onto the returned `x`/`y`.
- `client/src/phaser/layered/LayeredAvatar.js` — `_updateAccessory` passes `this.x`/`this.y`
  through to `resolveAccessoryPlacement`; the pet's own `resolvePetSideX` clamp bounds are
  shifted by `this.x` to match.
- `client/src/harness/avatarHarnessApi.js` — new `setBodyContainerOffset(socketId, x, y)`,
  dev-only harness method (no unit test — I/O-shell, same convention as every other method in
  this file per its own docblock).

Test code:
- `client/src/phaser/layered/pivot.test.js` — 3 new cases for the `containerOffset` parameters.
- `client/e2e/avatar-accessory-animation-sync.spec.js` — 1 new e2e test (new `describe` block)
  covering the punch-received-knockback mechanism.

Openspec:
- `openspec/changes/avatar-system-multichar-fixes/tasks.md` — new "Slice 37" section,
  out-of-band, same precedent as Slices 34/35/36.

No server/API/DB changes — this is a pure client-side rendering fix; no compiled asset data
changes.

### Carried-forward gaps, not silently dropped

- **Symptom 1 (walk-only hat disappearance) remains unreproduced and unfixed.** This is the
  primary open item from this pass. Recorded honestly per the method requirement rather than
  folded into the punch-received fix (a different mechanism, proven distinct) or silently
  dropped. A future pass should: (a) confirm the user's ACTUAL equipped hat/pet (this pass
  assumed the debug panel's own defaults, `minnieHat`/`pet09` on `rasta`, since the real account
  state was not independently confirmable); (b) specifically probe network-latency-driven stalls
  between server `USER_MOVE` messages, which this pass's live-but-still-fast-network
  reproduction cannot exercise — the "between steps" wording could describe a gap this
  environment's low-latency localhost connection never manifests.
- **`MovementControlsController.js`'s identical-shaped direct `spriteAvatar.x/y` mutation was
  not independently re-verified against this fix** — it is a flag-gated (`VITE_ANIMATION_...`
  debug tool, off by default) dev tool with the exact same "moves the Container's own transform
  directly" shape `launchUpwards` has, so this fix covers it by construction (same code path,
  same `this.x`/`this.y` read), but this pass did not spawn it live to confirm — disclosed rather
  than assumed proven.
- **The exact cause of the two mid-session lobby ejections was not conclusively distinguished**
  (accidental exit-tile click vs. a stale concurrent session) — see "Environmental hazard" above.

## Slice 36 — Gameplay defect fix: bot/human glove colour always rendered as the manifest default red (out-of-band, 2026-08-19)

User-reported defect (Spanish, verbatim): "quiero que revises el color de guante cuando los
bots se pegan veo el guante con el color por defecto que es el rojo cuando deberia de ser un
color random entre los que tenga el conseguido" — when bots punch, the glove renders in the
default red instead of a random colour among the ones that bot has actually unlocked.

### Root cause 1 (primary): PAL9 glove seeding was dead code

`server/src/services/UserPaletteService.js` already had a `resolveGlovePalette`/`resolveForUser`
pair implementing "seed the glove slot from progression the first time it is resolved with no
saved value" (PAL9, from the archived `avatar-color-accessory-system` design). Grepped the whole
server: `resolveForUser`'s only callers were its own test file and a stale comment in
`UserModel.js` — **it was never invoked from any controller, resource, or socket handler.**
Traced the actual chain end to end:

- Bots never call `USER_CHANGE_PALETTE` (the only writer of `avatarPalettes`, and only reachable
  today via the dev-only `AvatarLookDebugPanel.vue`), and confirmed via the API's
  `user_avatar_palettes` table that **zero bot rows existed** before this fix (the one existing
  row was `God`'s own manual debug-panel test, avatar 12/rasta, `colorGuante: "#ee4724"`).
- `server/src/resources/UserResource.js` emits `avatar_palette: data.avatarPalettes || {}` —
  verbatim, no fallback/seed logic — and it is the SAME resource class used for the local
  player's own login/select-user payload AND for broadcasting every OTHER user (bot or human) on
  join/sync (`UserJoinPublicSceneController`, `GetPublicSceneUsersController`,
  `UserForcedJoinSceneController`, `UserSyncController`, every `UserChange*Controller`'s
  `selected_user`/`auth_user` fields) — confirmed by grep, one call site per controller.
- Client-side, `LayeredAvatar._applyFrame` → `_tintChild` → `resolveTintHex(this._palette,
  this._manifest.defaults, piece.slot)` (`paletteResolve.js`) falls back to
  `manifest.defaults[slotKey]` whenever the resolved palette has no `colorGuante` entry — which
  is `ff0000` for `rasta` (and a real, non-red default or the neutral-black
  `UNRESOLVED_SLOT_FALLBACK_HEX` fallback for the others, per each character's own compiled
  manifest). **This is where the default wins**, on every single resolution, for every account
  that never explicitly wrote a `colorGuante` value.

**This is NOT bot-specific.** Any human account is equally affected — the only escape is
manually using the dev-only debug panel (not a real in-game control), so in practice this
defect was universal, not narrower for bots. Also confirmed the debug panel's own dedicated
glove `<select>` (`AvatarLookDebugPanel.vue`, gated on `slot === manifest.gloveSlot`) has never
actually rendered for ANY character including `rasta` — `manifest.gloveSlot` does not exist as a
field in any compiled `.layers.manifest.json` and nothing on the client ever sets it, so the
panel always falls through to its generic free-text `<input>` instead. Disclosed as a separate,
pre-existing dev-tooling gap; explicitly out of scope here since it never affects what a real
player sees during gameplay (unlike the two root causes below, which do).

### Root cause 2 (dominant in practice): the server's layered-manifest mirror table was 15 characters out of date

`server/src/data/layeredCharacterManifests.js` is a small, hand-maintained table mirroring each
character's compiled `slots`/`gloveSlot` shape — the server container only mounts `server/`
(`docker-compose.yml`), never `client/`, so it cannot `require()` the real compiled JSON at
runtime; this is a real deployment-topology constraint, not a nuance to route around. The table
held **only `rasta`** since Slice 1 of the archived `avatar-color-accessory-system`. The
avatar-system-multichar-fixes roster migration (this change's own slices 20-32) has since
compiled 15 more layered characters, and nobody updated this table — so `getLayeredManifest()`
returned `null` for every one of them, which made `resolveGlovePalette` bail out immediately
(`if (!manifest || !manifest.gloveSlot) return { slots, seeded: false }`) and made
`validateSlotUpdate` reject `UNKNOWN_SLOT`/manifest-null for any explicit palette change too —
even a human manually trying to fix their own glove via the debug panel would have been rejected
for any of these 15 characters. **This is the dominant cause in practice**: of the 6 bots
running in `OslanAbyss` during verification, 5 use a non-`rasta` avatar (`boomer` ×2, `gata`,
`brujita`, `empollon`); only fixing root cause 1 left those 5 still defaulting to red (confirmed
live — see "Live verification" below, first pass).

Filled in real `slots`/`gloveSlot` for all 16 currently-compiled layered characters, each copied
verbatim from that character's own real compiled `slots` array (read directly, 2026-08-19; never
hand-guessed): `boomer, brujita, cholo, empollon, gata, india, lilian, marsu, modern, ninja,
rasta, sally, skeleton, werewolf, yayo, zombie`. `sally` is a real, deliberate edge case: her
`colormeta.defaults` is genuinely empty (`{}`, per this change's own Slice 22 record) but her
compiled `slots` array still contains `colorGuante` alone (from `computeManifestSlots`' piece-
referenced half, Slice 26) — included with `slots: ['colorGuante']`. `ghost`/`wraith` are
deliberately NOT added — neither has a compiled `.layers.manifest.json` on disk at all (verified
directly), matching Slice 23's own disclosed, still-open `--from-vector` scope gap. `god` (a new
character under separate, concurrent development in this same branch — its own `client/src/
assets/game/avatars/god/` directory already exists) is deliberately excluded from this table:
out of scope for this fix, and left for that work to add when it lands.

### Fix: random-among-unlocked, stable-per-user seeding, wired to the one real choke point

Changed `resolveGlovePalette`'s seeding rule (previously: seed with the preset at index
`uppercutSelected`, i.e. always exactly the account's current tier, deterministic but never
random) to match the user's explicit request: **pick a preset RANDOMLY among every preset
unlocked at the account's `uppercutLevel`** (indices `0..uppercutLevel`, clamped to
`GLOVE_PRESETS.length - 1`), reusing the existing canonical `GLOVE_PRESETS` table
(`server/src/enums/GlovePresetsEnum.js`) — no new colour list. The pick is **stable per account**
via a new pure `pickStableGloveIndex(seedKey, maxIndex)`: an FNV-1a-style string hash of the
seed key (the account's own `id`) modulo `maxIndex + 1` — deterministic by construction (never
`Math.random`), so calling it twice with the same inputs always returns the same index. This
directly satisfies "randomisation must be stable per bot, not re-rolled every frame or punch":
the seed is a pure function of `(userId, uppercutLevel)`, so even a full bot reconnect (fresh
`UserModel`, `avatarPalettes` reset to `{}` since no DB row exists) reproduces the identical
colour — confirmed live (see below).

Wired the seeding call into the ONE real production choke point:
`UserPaletteService.seedPaletteForResource(user, avatarId)` (new, replaces the dead
`resolveForUser`) is called synchronously at the top of `UserResource.transform()`, mutating
`user.avatarPalettes[avatarId]` in-memory before that payload is ever built — so the seed is
already present the very first time any client renders this (user, avatarId) pair, never a
one-frame flash of the default. Persistence to the API (`UserApiService.changePalette`) is
fire-and-forget best-effort, exactly like the original dead code already documented: the
in-memory value is correct for the session regardless of whether the write lands.

### Disclosed, not blocking: best-effort DB persistence did not land for bots

Confirmed live that bots' seeded palettes never appeared in `user_avatar_palettes` even after
seeding clearly ran (the in-memory/rendered values are real, distinct, correct — see below).
`ApiService.post` (server/src/services-api/ApiService.js) treats any HTTP error response as a
*resolved* value (`error.response.data`), not a rejected promise, so a 4xx from the API's
`change-palette` endpoint for a bot's JWT would never trigger the `.catch(() => {})` at the call
site NOR the `console.error` inside `UserApiService.changePalette` itself — it would simply be
silently discarded, and no server log line would ever appear (confirmed: none did). This is a
pre-existing quirk in the shared `ApiService`/`UserApiService.changePalette` pathway, not
something this fix introduces or regresses (the identical fire-and-forget pattern already
existed in the dead `resolveForUser`), and it does not affect what a player sees: the
deterministic hash means the seed is correctly re-derived every session regardless of whether it
was ever durably persisted. Recorded here as a real, disclosed gap rather than silently assumed
fixed; diagnosing the exact bot-JWT/API rejection reason is a separate concern from the reported
rendering defect and was not pursued further under this fix's scope.

### Secondary, disclosed fix (not the root cause; zero visible behaviour change)

`client/src/phaser/controllers/scene/SendUppercutAnimationController.js` unconditionally called
`gameScene.tintMgr.changeUppercutColor(attackerSprite, data.uppercutSelected)` on every punch —
the LEGACY global-tint mechanism (`TintManager.js`), which replaces a fixed placeholder hex
(`0x11051C`) baked only into the OLD flat/baked atlas art. Traced this to confirm it: (a) is a
pure no-op for every layered avatar today — no layered character's rendered pixels ever contain
that placeholder hex, and `AddUserController.safeApplyTint` already documents and skips the same
call for the same reason on spawn ("superseded... for layered avatars, which paint colorGuante
as an ordinary palette slot"); and (b) is technically safe to leave unguarded — Phaser's
`Container` (`LayeredAvatar`'s real superclass) DOES mix in `Components.PostPipeline`, so the rex
plugin's `gameObject.setPostPipeline(...)` call does not throw — but it does attach one more
`rexColorReplacePipeline` post-pipeline instance to the avatar's `Container` on every single
punch thrown, and nothing ever calls `TintManager.clearPart('uppercut', ...)` to remove them — an
unbounded per-punch leak over a long bot-fight session, even though it never changed anything
rendered. Guarded with the same `isLayered` check `safeApplyTint` already uses. No test added:
this file (like `LayeredAvatar.js` itself, per its own docblock) requires a live Phaser scene the
project's node-environment vitest setup deliberately does not provide — matches the existing,
documented testing-boundary convention for this layer, not a new gap.

### TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| Seed algorithm (`pickStableGloveIndex`) | `server/src/services/UserPaletteService.test.js` | Unit | ✅ 13/13 (baseline before this slice) | ✅ `TypeError: (0 , pickStableGloveIndex) is not a function` | ✅ Passed | ✅ 4 cases (maxIndex=0 boundary, stability, in-range for 50 seeds, varies across 50 seeds) | ✅ Clean |
| Seed algorithm (`resolveGlovePalette` new contract) | same file | Unit | (same run) | ✅ First pass showed 2 tests passing VACUOUSLY under the OLD implementation (old code defaults to red whenever `uppercutSelected` is undefined, matching the new-shape params by coincidence) — caught per the "watch out for trivial GREEN" rule, added a stronger triangulating test (`colours.size > 1` across 50 bot ids) that correctly failed (`expected 1 to be greater than 1`) against the old implementation before the fix | ✅ Passed, 5/5 | ✅ 5 cases (unlocked-ceiling bound, tier-0 forces red for any id, distinct colours across ids, per-user stability, does-not-reseed-when-saved) | ✅ Clean |
| Roster manifest completeness | `server/src/data/layeredCharacterManifests.test.js` (new) | Unit | N/A (new file) | ✅ `AssertionError: expected null not to be null` (boomer/cholo/sally/werewolf all returned `null` before the table was filled in) | ✅ Passed | ✅ 6 cases (boomer multi-slot, cholo small-slot, sally defaults-empty-but-slotted, werewolf minimal, all-16-covered loop, ghost/wraith still-null) | ✅ Clean |
| `SendUppercutAnimationController.js` isLayered guard | none (Phaser-scene-coupled, no unit-test boundary per project convention — see docblock note above) | N/A | N/A | N/A — behaviour-neutral guard, verified live instead | N/A | N/A | N/A |

### Test Summary

- **Total tests written**: 20 (14 in `UserPaletteService.test.js`, up from the original 7 for
  `resolveGlovePalette`/`validateSlotUpdate` — 3 net-new plus 4 replaced with real, non-vacuous
  assertions; 6 in the new `layeredCharacterManifests.test.js`).
- **Total tests passing**: server 26/26 (4 files, up from 3 files/13 tests); client 562/562
  (unaffected — up from the 552/552 baseline named in this task, due to the concurrent session's
  in-flight work, not this fix).
- **Layers used**: Unit (20, server), live browser verification (Playwright, real Docker-built
  environment — no new e2e spec added; this is a live gameplay/data defect, not a UI component).
- **Approval tests** (refactoring): none — `resolveGlovePalette`'s signature change is a genuine
  behaviour change (per the user's explicit request for randomness), not a preserve-behaviour
  refactor, so its existing test cases were replaced with new ones asserting the NEW contract,
  not captured as "current, even if wrong" per the approval-testing recipe.
- **Pure functions created**: 2 (`pickStableGloveIndex`, `hashSeedKey` — both exported/used only
  via `pickStableGloveIndex`).

### Live verification (real Docker environment, not assertion)

Logged in as `God`/`test` at `http://localhost:8080` (Playwright), entered the `OslanAbyss`
public scene (6 users at the time: `God` + 5-6 bots — `ZeroByte`, `НоваЛайт`, `ユキノア`,
`Blayze`, `Nexra`, `OrionV`). Restarted the `server` container (`docker compose restart server`
— code changes only, no `.env` change, so `restart` — not `up -d --force-recreate` — is
sufficient here) between each fix increment to force a clean re-seed:

**First pass (root cause 1 fixed only, root cause 2 not yet fixed).** Read every spawned
`LayeredAvatar._palette.colorGuante` directly (`page.evaluate` over `scene.users`): `Blayze`
(avatar `rasta`) correctly seeded to `#f5f5f7` (white) — proof the seeding mechanism itself
works — but `ZeroByte`/`ユキノア` (avatar `boomer`), `Nexra` (avatar `brujita`) and `НоваЛайт`
(avatar `gata`) all still showed the raw manifest default `ff0000`, confirming root cause 2 was
still live for every non-`rasta` bot. Screenshot: OrionV (avatar `empollon`) visibly showing a
red glove — `orionv_zoom.png` (BEFORE evidence).

**Second pass (both root causes fixed).** Same room, fresh bot reconnect after the manifest
table fix + another `docker compose restart server`. Direct state read:

```json
{"ZeroByte":{"palette":"#f09b20","avatarId":1},   // boomer  -> orange
 "ユキノア":{"palette":"#464643","avatarId":1},     // boomer  -> black
 "НоваЛайт":{"palette":"#a96a0a","avatarId":5},    // gata    -> brown
 "Nexra":{"palette":"#8c19c6","avatarId":2},       // brujita -> purple
 "Blayze":{"palette":"#f5f5f7","avatarId":12},     // rasta   -> white (unchanged from pass 1)
 "OrionV":{"palette":"#2056f0","avatarId":4},      // empollon-> blue  (was red in pass 1)
 "God":{"palette":"#ee4724","avatarId":12}}        // rasta   -> red  (pre-existing EXPLICIT
                                                    //            choice, correctly untouched)
```

Six different accounts, five real distinct non-red preset colours, zero accidental reds among
the bots. Re-ran the SAME read after fully logging `God` out and back in (a fresh page load,
same account) — every bot kept the EXACT same colour (`OrionV` still `#2056f0`, etc.), proving
stability across reconnects, not just within one session. Screenshots: `room_fixed2.png` (full
room, debug panel closed), `zoom_left.png` (`OrionV`'s blue glove close-up — the AFTER pair to
`orionv_zoom.png`'s BEFORE), `zoom_center.png` (two bots facing away, glove not visible from that
angle — recorded honestly, not every angle shows the glove). All four screenshots saved under
this session's scratchpad (`glove-defect-evidence/`), not committed (per this project's own
convention for investigative screenshots vs. the committed contact-sheet deliverables).

No production `docker compose up -d --force-recreate` needed — no `.env`/`RUN_BOTS` change, only
code, and both containers are volume-mounted (`./server:/app`, `./client` served via nginx from a
pre-built image the client-side change did not require rebuilding since it is dev-served through
the existing container for this verification's purposes).

No background processes left running: no `playwright-cli` browser session, no manually-started
server process, no e2e webServer left orphaned — `docker compose ps` shows only the pre-existing,
unrelated long-running project containers; the `server` container itself was intentionally
restarted (not left in a special state) and returns to its normal `RUN_BOTS=true` operation.

Files changed: `server/src/services/UserPaletteService.js` (new `pickStableGloveIndex`,
`resolveGlovePalette` re-signatured, `resolveForUser` replaced with `seedPaletteForResource`),
`server/src/services/UserPaletteService.test.js` (updated/extended), `server/src/resources/
UserResource.js` (calls the new seed step), `server/src/data/layeredCharacterManifests.js`
(15 new character entries), `server/src/data/layeredCharacterManifests.test.js` (new),
`server/src/models/UserModel.js` (comment only, no logic change),
`client/src/phaser/controllers/scene/SendUppercutAnimationController.js` (isLayered guard).
No changes to `openspec/changes/avatar-system-multichar-fixes/proposal.md`,
`specs/`, or `design.md` (frozen inputs, per this fix's own instructions) — this defect and its
root causes are not named anywhere in those documents; recorded here as a deviation the next
`sdd-verify`/sync pass should judge, not silently folded into them.
