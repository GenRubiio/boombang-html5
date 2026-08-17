# Tasks: avatar-color-accessory-system

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~3,500-4,500 hand-written lines across 11 chained slices, plus generated compiled-asset bytes (manifest/atlas JSON, `.webp`) that are additional and not line-reviewable |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 Slice 0 → PR2 Slice 1 → PR3 Slice 2 → PR4 Slice 3 → PR5 Slice 4 → PR6 Slice 5 → PR7 Slice 6 → PR8 Slice 7 → PR9 Slice 8 → PR10 Slice 9 → PR11 Slice 10 |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

```text
Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High
```

Every slice ships behind `VITE_LAYERED_AVATARS=false` (added Slice 4) and lands on `main` directly —
each is safe by construction because the flag stays off until Slice 4 exists and every later slice is
additive. No tracker/feature-branch chain is needed.

## Cross-cutting notes (apply to every slice)

- **Test commands.** `client`: `cd client && npm test` (vitest, added Slice 0). `server`: `cd server &&
  npm test` (vitest, added Slice 0). `api`: `cd api && ./vendor/bin/phpunit` (exists). The old `cd
  server/src/packages/objects-maker && npm test` is not a runner and is not used anywhere below.
- **Live validation requires a real client build.** The running `client` Docker container serves a
  static build; any live-validation task needs either a `client` image rebuild or a local Vite dev
  server (`cd client && npm run dev`) pointed at `server:3000` / `api:8000`. Stated once here, not
  repeated per task.
- **Asset source of truth.** Reference archives are present, decrypted, at
  `/Users/evgeny.lyubeznyy/Downloads/dswmedia_decrypted/` (`personajes/rasta.bb`,
  `rasta.layers.bb`, `rasta/hat/*.bb`, `rasta/pet/*.bb`, `effects/*` for auras — plain ZIPs, no
  password). Extracted JSON samples also exist at the session scratchpad
  (`.../scratchpad/ref/{rasta.layers,hat_minnie,pet09}/`) for shape reference only — the scratchpad is
  session-scoped and MUST NOT be a compiler input. Slice 1 stages a stable, git-ignored input root.
- **Requirement tags.** `LR1`-`LR10` = avatar-layered-rendering spec requirements in file order;
  `PAL1`-`PAL10` = avatar-palette; `ACC1`-`ACC5` = avatar-accessories; `PROTO1`-`PROTO6` =
  avatar-look-protocol. Each slice ends with a `Covers:` line; together they cover all 31.
- **Rollback (all slices).** Revert the slice's commit(s)/PR. Migrations include a `down()`. No slice
  before Slice 4 changes any runtime-reachable code path (pure modules / compiler / generated assets
  only), so slices 0-3 carry zero behavioral rollback risk; from Slice 4 on, the flag being `false` by
  default is the functional rollback and reverting the PR removes the code.

---

## Slice 0 — Test runners + perf harness + baseline measurement

**Status: [x] Complete.** vitest wired for `client`/`server`; `PerfHarness.js` + `perfEvaluate.js`
built with TDD evidence (see apply-progress.md). Baseline FPS numbers require a real browser session
(not available to the apply agent) — reproduction steps recorded in apply-progress.md for live
verification.

Files: `client/package.json`, `client/vitest.config.js` (NEW), `server/package.json`,
`server/vitest.config.js` (NEW), `client/src/phaser/debug/PerfHarness.js` (NEW),
`client/.env.example` (`VITE_PERF_HARNESS`), `client/src/config/gameConfig.js` (read `PERF_HARNESS`
once).

1. Add `vitest` devDependency + `test`/`test:watch` scripts to `client/package.json`; add
   `client/vitest.config.js` (`environment: node`, separate from `vite.config.js` per design §8).
   TDD: write one trivial passing spec (`client/src/phaser/layered/__smoke__.test.js` or similar) to
   prove the runner executes; this satisfies success criterion 8 ("`npm test` exists and passes").
2. Add `vitest` devDependency + `test` script to `server/package.json` (CommonJS-compatible per
   design §8); add `server/vitest.config.js`. Same smoke-test proof.
3. Build `client/src/phaser/debug/PerfHarness.js`: 10s window FPS mean/p5/min + `actualFps`,
   `totalDisplayObjects` (recursive per user container) + `layeredPieceObjects`, draw-call mean with
   display-object-count fallback (report which was used), context block (renderer type, DPR,
   `gameConfig.DPI`, avatar count, flag state, layered/baked). Expose `window.__perf` with
   `spawnGhosts(n)` (drives `AddUserController.processUser` with fabricated data) and `evaluate()`
   (`{pass, reasons}`, PASS = p5 FPS ≥ 45 at 25 avatars, 60 FPS stated as desktop target, warn if
   layered/baked mean ratio < 0.6). Output: `console.table` + `window.__perf.results` + clipboard copy.
   Gate behind `VITE_PERF_HARNESS=true` (NEW in `client/.env.example`), read once into
   `gameConfig.PERF_HARNESS`. TDD: extract the pure `evaluate({fps5, meanFpsLayered, meanFpsBaked})`
   scoring function into a small pure helper (e.g. `client/src/phaser/debug/perfEvaluate.js`) and unit
   test it — RED (no such module yet) → GREEN (thresholds above) → TRIANGULATE (pass case, p5<45 fail
   case, ratio<0.6 warning case) → REFACTOR.
4. Live validation: rebuild/dev-serve, run `window.__perf.spawnGhosts(25)` against the **current
   baked** renderer (flag does not exist yet, so this is simply "today's renderer"), capture the JSON
   baseline artifact for later comparison in Slice 4.

Covers: `LR8` (harness + baked baseline; layered comparison completes in Slice 4).

---

## Slice 1 — Offline layered-body compiler (pure lib + orchestration + compiled `rasta` asset)

**Status: [x] Complete.** `rasta` compiled from the real decrypted archive; compiler+lib unit-tested
(TDD). See apply-progress.md for the compiled-manifest verification evidence (bodyBounds matched the
baked config's frameWidth exactly).

Files: `client/.assets-src/` (NEW, git-ignored — add entry to `client/.gitignore`),
`client/scripts/compile-layered-avatar.cjs` (NEW), `client/scripts/lib/{packFrames,
validateSupersampling,mirrorPivot}.cjs` (NEW) + tests, output
`client/src/assets/game/avatars/rasta/layers/*` (NEW, generated).

1. Stage input: extract `personajes/rasta.bb` and `personajes/rasta.layers.bb` from
   `/Users/evgeny.lyubeznyy/Downloads/dswmedia_decrypted/` into
   `client/.assets-src/layered/rasta/` (`_frames.json`, `p*.png`, `<anim>.json`, `colormeta.json`,
   `meta.json`), matching the shape sampled at
   `.../scratchpad/ref/rasta.layers/`. Add `client/.assets-src/` to `.gitignore` — it is a build input,
   not a committed artifact.
2. `client/scripts/lib/validateSupersampling.cjs`: given a piece's declared `{w,h}` and its raster's
   actual pixel dimensions, assert `actual === {w*2, h*2}` for `ss:2`, throw otherwise (LR3). TDD: RED
   (module doesn't exist) → GREEN (happy path) → TRIANGULATE (mismatched-width case,
   mismatched-height case) → REFACTOR.
3. `client/scripts/lib/mirrorPivot.cjs`: `mirrorPivot(o, bodyBoundsW)` → `[bodyBoundsW - o[0], o[1]]`
   (design §3.1 step 5, `oMirror`). TDD: RED → GREEN → TRIANGULATE (zero-origin case, non-zero
   asymmetric case) → REFACTOR.
4. `client/scripts/lib/packFrames.cjs`: shelf-pack unique extracted rects into one or more pages,
   emitting a new page whenever an axis would exceed 4096px (design §3.1 step 3). TDD: RED → GREEN
   (fits-on-one-page case) → TRIANGULATE (forces-a-second-page case) → REFACTOR. Also add a luminance
   check here: warn (not fail) when a tintable piece's mean luminance is below a threshold, per design
   §5 cost — the actionable authoring signal for multiply-tint fidelity, proven live in Slice 4.
5. `client/scripts/compile-layered-avatar.cjs`: orchestrates 1-4 with `sharp` I/O — parse
   `_frames.json`, extract+pack (never `.trim()`), emit `<character>.layers.webp` (+ `_1`, `_2`… on
   overflow) and a Phaser multiatlas JSON, emit `<character>.manifest.json` per design §3.1 step 5
   (`v, compilerVersion, sourceHash, character, ss, slots[], defaults{}, labels{}, compatibleHats[],
   bodyBounds{w,h}, pieces{}, frames{}, sequences{}, mirrors{}`), stamping `compilerVersion`+
   `sourceHash` (sha1 over sorted input bytes). This is I/O-shell code, not unit-tested directly.
6. Run the compiler against the staged `rasta` input; commit the generated output under
   `client/src/assets/game/avatars/rasta/layers/`. Note in the PR description: generated
   manifest/atlas JSON and `.webp` bytes are not reviewable line-by-line — request a
   `size:exception` for those specific generated files per the chained-PR skill; the hand-written
   compiler+lib+tests remain independently reviewable.

Covers: `LR3` (compile-time enforcement), `LR10` (compiler pure-lib tests).

---

## Slice 2 — Runtime pure modules (manifest/sequence/pivot/palette/fallback/cache-keys)

**Status: [x] Complete.** All 6 pure modules + `AssetVersionManager.js` extension implemented with
TDD; collision proof passes against a documented 18-name fixture (AvatarManager.js's asset-import
graph could not be loaded under the isolated vitest config — see apply-progress.md deviation note).

Files: `client/src/phaser/layered/{manifestValidation,sequence,pivot,paletteResolve,fallback}.js`
(NEW), `client/src/phaser/managers/lookCacheKeys.js` (NEW), `client/src/phaser/managers/
AssetVersionManager.js` (MOD, design §2).

1. `manifestValidation.js`: slot-set membership (never `color[1-9]` pattern matching — PAL1),
   independent per-character slot counts (PAL2), `ss:2` dimension assertion, required-field/
   unknown-slot rejection. TDD: RED → GREEN → TRIANGULATE (7-slot character, differently-sized
   character, unknown-slot rejection case) → REFACTOR.
2. `pivot.js`: `resolveRegistrationPoint(override, base)` → `override ?? base ?? 0` per axis (ACC1);
   may re-export or duplicate Slice 1's `mirrorPivot.cjs` shape for runtime consumption — determine at
   implementation time whether a shared copy or independent small duplicate (CJS scripts vs ESM `src`
   are separate module graphs today; neither imports the other). TDD: RED → GREEN → TRIANGULATE
   (override present on one axis only, neither present) → REFACTOR.
3. `sequence.js`: `expandSequence()` returns the literal frame-index array including repeats, never a
   `{start,end}` range — named case `down_walk = [9,10,11,12,13,14,15,10,16,17,18,19,20]` (LR1). TDD:
   RED → GREEN (the named case) → TRIANGULATE (a sequence with no repeats, a single-frame sequence) →
   REFACTOR.
4. `paletteResolve.js`: defaults/labels looked up independently, label falls back to raw slot key,
   missing palette → manifest defaults (PAL3, PAL5). TDD: RED → GREEN → TRIANGULATE (default-with-
   no-label case, labelled case, fully-missing-palette case) → REFACTOR.
5. `fallback.js`: `resolveFallbackKey()` (`${currentDirection}_idle` then `down_idle`, two steps, no
   heuristic) and `accessoryFollows()` (sync vs hide) (ACC4 pure half). TDD: RED → GREEN →
   TRIANGULATE (direction-idle covered, falls through to down_idle, accessory-has-frames vs
   accessory-lacks-frames) → REFACTOR.
6. `lookCacheKeys.js`: key derivation for `lay.`/`acc.`/`aur.` prefixes (design §2 table) **plus** the
   collision proof — assert no generated key matches the legacy `${avatarName}_atlas|_spreadsheet`
   prefix for all 18 `AvatarManager.getAvatarName()` return values. TDD: RED → GREEN → TRIANGULATE
   (one key per artifact class) → the collision test is itself the mandatory triangulating case →
   REFACTOR.
7. `AssetVersionManager.js`: add the three sibling version dictionaries (`layeredVersions`,
   `accessoryVersions`, `auraVersions`), `getArtifactVersion(class, key)`, `checkArtifactUpdates()`
   called from `init()` after `checkForUpdates()`, new `boombang_look_asset_versions` localStorage key
   (separate from `boombang_asset_versions`), `clearLayered/Accessory/AuraCache` + wiring into
   `handleForceUpdate()`/`clearArtifactVersionData()`. `dbVersion` stays `1`. TDD: exercise via
   `lookCacheKeys.js`'s collision test above; add one more assertion that `checkArtifactUpdates()`
   never reads or writes `boombang_asset_versions`.

Covers: `LR10`, `PAL1`, `PAL2`, `PAL3`, `PAL5`, `ACC1` (pure half), `ACC4` (pure half).

---

## Slice 3 — Layered renderer core (`LayeredAvatar`, `LayeredAvatarRegistry`, animation façade)

**Status: [x] Complete.** `LayeredAvatar`/`LayeredAvatarRegistry` implemented; `AnimationUtils.js`/
`UserIdleAnimation.js` guards added. A coordinate-space deviation from design.md §5's literal
`k = sceneScaleFactor/ss` formula was made and is documented in-code and in apply-progress.md,
backed by concrete evidence from the compiled rasta package.

Files: `client/src/phaser/layered/{LayeredAvatar,LayeredAvatarRegistry}.js` (NEW),
`client/src/utils/AnimationUtils.js` (MOD), `client/src/phaser/animations/UserIdleAnimation.js` (MOD).

1. `LayeredAvatar.js` extends `Phaser.GameObjects.Container`: fixed `Image` pool sized to the
   character's max `L` length; `_applyFrame(fid)` sets texture/position/scale/visibility/depth per
   design §5 (`k = sceneScaleFactor/ss`, pool index === `L` index === child depth, no sort — LR4);
   origin is `f.o` or `f.oMirror` when mirrored (LR2, LR5); `applyPalette(slots)` iterates the pool
   calling Phaser's built-in `setTint` per slot (no `rexColorReplacePipeline`, zero extra pipelines);
   `play(key, ignoreIfPlaying)` resolves through `sequence.js`+`fallback.js` from Slice 2; `frame`
   getter returns `manifest.bodyBounds` only (body, not accessories); `setFlipX` selects `oMirror`;
   `isLayered = true` own property. Not unit-tested directly (design §8: no Phaser instantiation in
   unit tests) — exercised live in Slice 4.
2. `LayeredAvatarRegistry.js`: one scene-level `update(time, delta)` tick driving every live
   `LayeredAvatar`'s animation clock (design §5 cost 3 — a second timing path, deliberately not
   per-avatar timers).
3. `AnimationUtils.js`: `setSpriteConfig` gains `if (spriteAvatar.isLayered) return
   spriteAvatar.applyClipConfig(textureKey);` as its first line; baked branch below is untouched.
4. `UserIdleAnimation.js:14`: guard becomes `if (!spriteAvatar.isLayered && (…existing condition…))` —
   the only animation class needing this guard (design §5).

Covers: `LR1`, `LR2`, `LR4`, `LR5` (structural correctness; live parity proof is Slice 4).

---

## Slice 4 — Flag wiring, container integration, pre-existing bug fixes, live parity + go/no-go

**Status: [x] Complete** except the go/no-go FPS numbers (item 8), which need a real browser session.
Flag wiring, strategy branch, both id-comparison bug fixes, and the `isLayered` tint guards are all
implemented and verified (`npm run build`/`npm run dev` clean under both flag states). `vite.config.js`
was deliberately left unmodified — a real production build showed no `DYNAMIC_IMPORT` warning and the
layered chunks split automatically; see apply-progress.md.

Files: `client/src/config/gameConfig.js` (MOD, `LAYERED_AVATARS`), `client/.env.example`
(`VITE_LAYERED_AVATARS=false`), `client/vite.config.js` (MOD, one `manualChunks` entry),
`client/src/phaser/managers/AvatarManager.js` (MOD), `client/src/phaser/preloaders/
AvatarsDataPreload.js` (MOD), `client/src/phaser/managers/SmartAvatarSystem.js` (MOD),
`client/src/phaser/controllers/scene/AddUserController.js` (MOD: `:132`, `:204`, `:430`, `:545`,
`:552`), `client/src/phaser/controllers/scene/UserChangeAvatarController.js` (MOD: `:180`, `:297`,
`:304`).

1. `gameConfig.js`: read `VITE_LAYERED_AVATARS` once as `LAYERED_AVATARS`, per design §4. Add
   `client/.env.example` entry.
2. `AvatarManager.js`: strategy branch in `loadAvatar` — both gates required:
   `gameConfig.LAYERED_AVATARS && layeredRegistry.has(avatarId)`; layered modules reached via dynamic
   `import()` inside that branch so they never enter the main chunk with the flag off (LR6). Add the
   one `manualChunks`/`onwarn` entry to `vite.config.js` (lines 36-54) for that dynamic chunk.
3. `AvatarsDataPreload.js`: preload the layered manifest+atlas for a layered-registered character
   through `scene.load.multiatlas` (design §3.1 step 4 — zero new loader plumbing).
4. `AddUserController.js`: `:132` container gains `LayeredAvatar` as the drop-in replacement for
   `spriteAvatar` at index 1/depth `1.0` when the strategy branch selects layered; `:204` sprite
   creation branches accordingly; `:430` gains `if (sprite.isLayered) return;` at the top of
   `safeApplyTint` (glove branch, PAL10) — everything below stays byte-identical.
5. **Bug fix with explicit flag-off parity check** (proposal risk 3): `SmartAvatarSystem.js` and
   `AddUserController.js:545,552` / `UserChangeAvatarController.js:297,304` compare `data.userId ===
   user.username` where avatars are actually registered by socket id
   (`AddUserController.js:94`/`UserResource.js:8`) — fix both call sites to compare socket id.
   `UserChangeAvatarController.js:180` gets the same `isLayered` tint guard as step 4.
   - Before-fix note: capture that fallback-path avatar-ready upgrades silently never apply today
     (the bug proposal risk 3 describes) — this is the pre-fix baseline, not a test to keep green.
   - After-fix live parity check: with the flag OFF, load a public scene with both an immediate-load
     and a fallback/upgrade-load baked avatar and confirm both still reach "ready" and render
     identically to pre-fix behavior — the fix is general (not flag-gated) so this proves it changes
     nothing observable for baked avatars while fixing the underlying id comparison.
6. Live validation (success criterion 1, `LR6` both scenarios): flag OFF — confirm the container is
   still exactly today's four-element shape (grep: no layered module imported, no accessory child
   created). Flag ON — render the compiled `rasta` layered package (Slice 1) in a public scene at
   parity with baked `rasta` across idle/talk/walk in all directions and mirrored counterparts; check
   for pivot drift or frame gaps (`LR1`, `LR2`, `LR5`).
7. Live validation — multiply-tint fidelity proof (design §5 cost, proposal-adjacent risk): with
   `LayeredAvatar.applyPalette` now reachable, render each palette slot at its manifest default and at
   2-3 alternate hex values against the real compiled `rasta` pieces; confirm perceptual acceptability
   of `setTint`'s multiply darkening; note any slot piece whose darkening looks unacceptable so Slice
   1's luminance-warning threshold can be tuned.
8. Live validation — go/no-go (`LR8`): `window.__perf.spawnGhosts(25)` against the layered renderer,
   compare to Slice 0's baked baseline via `window.__perf.evaluate()`; record the JSON artifact
   (p5 FPS, layered/baked ratio, object counts vs the accepted ~500-775-vs-~100 risk).

Covers: `LR6`, `LR8` (layered run), live confirmation of `LR1`/`LR2`/`LR5`, `PAL10` (guard),
enables `PROTO3` (fix landed here, broadcast behavior validated in Slice 7-8).

---

## Slice 5 — Palette protocol: server validation, socket wiring, client socket glue

**Status: [x] Complete.** Server-side validation TDD-tested; live-validated end-to-end against the
running Docker stack via a `socket.io-client` script (accepted change, unknown-slot rejection, locked
glove preset, invalid glove hex — all confirmed with functional ACKs and the session staying
connected). See apply-progress.md for the exact commands and captured output.

Files (server, NEW): `server/src/controllers/game/scenes/UserChangePaletteController.js`,
`server/src/services/UserPaletteService.js`, `server/src/enums/GlovePresetsEnum.js`. Files (server,
MOD): `server/src/sockets/game/scenes/scenesSockets.js`, `server/src/enums/{Request,
Response}SocketsEnum.js`, `server/src/services-api/UserApiService.js`, `server/src/models/
UserModel.js`, `server/src/resources/UserResource.js`. Files (client, MOD):
`client/src/phaser/sockets/SceneResponseSockets.js`, `client/src/phaser/models/UserModel.js`,
`client/src/enums/{Request,Response}SocketsEnum.js`.

1. `enums/{Request,Response}SocketsEnum.js` (both surfaces): add `USER_CHANGE_PALETTE` →
   `request:user_change_palette` / `response:user_change_palette` (+`_ack`) (PROTO5, avoids `look`
   per design finding A).
2. `GlovePresetsEnum.js`: map `UppercutsEnum` index → `{name, hex}` reusing `TintManager.COLOR_HEX`
   (`TintManager.js:9-14`) so both systems agree by construction; the ten Spanish names stay in
   `client/src/assets/lang/*/translations.json:215-224`, read by key only.
3. `UserPaletteService.js`: validate slot-key membership via the character's manifest (delegates to
   Slice 2's `manifestValidation.js` shape), free colour for non-glove slots (PAL6), glove restricted
   to one of the ten preset **names** gated by `presetIndex <= user.uppercutLevel` (PAL7, PAL8), first
   resolution with no saved value seeds from `user.uppercutSelected` then persists (PAL9). TDD (server
   vitest, added Slice 0): RED → GREEN → TRIANGULATE (unlocked preset accepted, locked preset
   rejected, arbitrary hex rejected for glove, free hex accepted for non-glove slot, seeding case,
   unknown-slot rejection) → REFACTOR.
4. `UserChangePaletteController.js`: thin controller — call `UserPaletteService`, always emit
   `{success, code, message}` (`code ∈ {UNKNOWN_SLOT, LOCKED_PRESET, INVALID_VALUE, NOT_OWNED,
   INCOMPATIBLE, RATE_LIMITED}`), wrap in `try/catch`, **never import `DisconnectUserController`**
   (grep-checkable design invariant, PROTO1, PROTO2). Register beside `USER_CHANGE_AVATAR` at
   `scenesSockets.js:92-94`.
5. `UserApiService.js`: `changePalette(user, avatarId, slots)` → `POST api/user/change-palette` using
   the user's own JWT (`user.authJwt`), matching `changeAvatar()` at `UserApiService.js:148` — not the
   emulator token.
6. `UserModel.js` (server): add `avatarPalettes` (map `avatarId → slots`) next to `this.avatars` at
   `:52`. `UserResource.js`: add `avatar_palette` **after line 54** (`coconut_selected`), explicitly
   not between the duplicate `avatar_id` assignments at `:31`/`:36` (proposal risk 9).
7. Client: `SceneResponseSockets.js` registers the palette broadcast/ack pair via the one-line
   pass-through shape at `:83-85`; the broadcast resolves `gameScene.users[data.socketId]` directly
   (not through `SmartAvatarSystem`'s map), fixing the fallback-path targeting bug (PROTO3) together
   with Slice 4's id-comparison fix. `client/src/phaser/models/UserModel.js` mirrors the palette map
   client-side for the local session's use.
8. Live validation (no debug panel yet — Slice 7): use the existing `client/src/utils/` socket-debug
   helper to emit a raw `request:user_change_palette` for the connected test account (`God`/`test`)
   and confirm a functional `_ack` returns without disconnecting, for both an accepted and a rejected
   (unknown slot key) case (PROTO1, PROTO2 live proof).

Note: if this slice's diff approaches or exceeds 400 lines during apply, split along the
server/client boundary already drawn above (5a server validation+persistence-plumbing, 5b client
socket glue) — both halves are independently mergeable since the client half is inert without Slice
6/7 wiring it up.

Covers: `PAL6`, `PAL7`, `PAL8`, `PAL9`, `PAL10` (guard already in Slice 4; enum here), `PROTO1`,
`PROTO2`, `PROTO3` (targeting fix), `PROTO5`.

---

## Slice 6 — Palette API persistence (server → API → DB)

**Status: [x] Complete.** Migration applied to the live dev DB; phpunit feature tests pass (4/4);
live end-to-end reconnect-persistence probe confirmed the exact submitted colour survives a full
disconnect/reconnect cycle. See apply-progress.md.

Files (NEW): `api/database/migrations/*_create_user_avatar_palettes_table.php`,
`api/app/Models/UserAvatarPalette.php`, `api/app/Services/UserAvatarPaletteService.php`,
`api/app/Http/Controllers/Api/User/UserChangePaletteApiController.php`,
`api/tests/Feature/UserAvatarPaletteTest.php`. Files (MOD): `api/routes/api.php`.

1. Migration: `user_id` FK, `avatar_id` unsignedInteger, `palette` **`longText` nullable** (project
   convention — `public_scenes.assets_data`, `mails.description`; never `json`), `manifest_version`
   string nullable, timestamps, `unique(user_id, avatar_id)` (PAL4). Include `down()`.
2. `UserAvatarPalette.php`: `set/getPaletteAttribute` doing `json_encode`/`json_decode`, exactly as
   `PublicScene.php:171`. Table/model name deliberately distinct from the dead `avatar_colors`
   reference in `UserService.create()` (proposal risk 8).
3. `UserAvatarPaletteService.php`: plain service, inline validation, shaped like
   `NpcCatalogItemService` — no `Repositories/` layer, no `FormRequest` (reserved for Backpack CRUD).
4. `UserChangePaletteApiController.php`: thin controller shaped like the 28-line
   `UserChangeAvatarController.php` with `ResponseApiControllerTrait`. Route: `api/routes/api.php`,
   inside the existing `Route::prefix('user')` group under `auth:api` (lines 86-95): `change-palette`.
5. `UserAvatarPaletteTest.php` (phpunit, `cd api && ./vendor/bin/phpunit`): TDD — RED → GREEN →
   TRIANGULATE (per-`(user, avatar)` scoping: two avatars' palettes don't clobber each other; one
   avatar's palette not overwritten by another's; `longText` JSON round-trip) → REFACTOR.
6. Live validation (PROTO4): via Slice 5's socket-debug path, change a palette slot, disconnect,
   reconnect, confirm the same palette is retrieved and applied with no reset to defaults.

Covers: `PAL4`, `PROTO4`.

---

## Slice 7 — Debug panel (palette + glove)

**Status: [x] Complete** structurally (component built, mounted behind the flag, builds clean under
Vite). The live in-browser round-trip check (item 3) needs a real browser session — exact reproduction
steps are in apply-progress.md.

Files: `client/src/views/components/game/debug/AvatarLookDebugPanel.vue` (NEW), `client/src/App.vue`
(MOD, mount behind flag), `client/.env.example` (`VITE_AVATAR_LOOK_DEBUG=true`).

1. `AvatarLookDebugPanel.vue`: slot rows from the manifest (`manifest.labels[slot] ?? slot` — PAL3
   live proof), plain `<input type="text">` hex field per slot (no `iro.js`, PROTO6 constraint), glove
   slot as a `<select>` of the ten preset names with above-tier options disabled (display-only, server
   re-checks). Renders the ACK `{success, code, message}` verbatim (PROTO6 — a rejection is visibly a
   rejection, not a disconnect).
2. `App.vue`: mount behind `VITE_AVATAR_LOOK_DEBUG=true`.
3. Live validation (success criteria 2, 3, 4; `LR7`, `LR9`, `PROTO3`, `PROTO6`):
   - Change a colour slot via the panel; confirm the in-room avatar updates **without sprite
     replacement** within 100ms of the ack (`LR9`), broadcasts to a second logged-in session
     (`PROTO3`, two-session case), and survives reconnect (`PAL4`/`PROTO4` re-confirmed end-to-end).
   - Select the `colorGuante` slot; confirm the preset list is gated by `ringsWon` tier and a low-tier
     account cannot select `Guante de Oro`; confirm a baked-renderer avatar still tints via the old
     uppercut path unaffected.
   - Toggle `VITE_LAYERED_AVATARS` off and back on; confirm the persisted palette is unread/unmodified
     while off and applies correctly on re-enable (`LR7`).
   - Submit an unowned/invalid selection; confirm a functional ACK and the session stays connected.

Covers: `PROTO6`, `LR9`, `LR7`, `PAL3` (live), `PROTO3` (full two-session live proof).

---

## Slice 8 — Aura

**Status: [x] Complete.** Blocking gate (item 1) found a REAL hit: `aura_azul`/`aura_dorada` are
8113x652 (fail the 4096px axis limit); `aura_electrica` (1064x978) passes and was compiled and used.
Full server/API/DB chain live-validated (ownership, equip, reject-unowned, reconnect-persistence).
Visual z-order/anchor correctness needs a real browser session — see apply-progress.md.

Files (NEW client): `client/src/phaser/layered/AccessoryLayer.js`,
`client/src/assets/game/accessories/aura/<key>/*` (generated). Files (MOD client):
`client/scripts/compile-accessory.cjs` (NEW, aura mode), `client/src/phaser/controllers/scene/
AddUserController.js` (aura child at depth `0.2`), `client/src/views/components/game/debug/
AvatarLookDebugPanel.vue` (aura `<select>`). Files (NEW server):
`server/src/controllers/game/scenes/UserChangeAccessoryController.js`. Files (MOD server):
`server/src/services-api/UserApiService.js`, `server/src/sockets/game/scenes/scenesSockets.js`,
`server/src/enums/{Request,Response}SocketsEnum.js` (`USER_CHANGE_ACCESSORY`,
`GET_USER_ACCESSORIES`). Files (NEW api): `api/app/Http/Controllers/Api/User/
UserAccessoryApiController.php`, `api/database/migrations/*_add_accessory_columns_to_users_table.php`
(adds all three nullable `avatar_hat`/`avatar_pet`/`avatar_aura` columns to `users` at once — cheapest
point to do it since Slice 9/10 reuse the same migration). Files (MOD api): `api/app/Models/User.php`
(`enabledHats()`, `enabledPets()`, `enabledAuras()` — three copies of `enabledAvatars()` at :153-166,
deliberately not DRY'd per design §6), `api/routes/api.php` (`accessories`, `change-accessory`).

1. **Blocking gate, first task**: extract the consolidated aura sheet from
   `/Users/evgeny.lyubeznyy/Downloads/dswmedia_decrypted/effects/` into
   `client/.assets-src/auras/<key>/` and measure both axes of `aura.webp`. If either axis exceeds
   4096px, stop and escalate — re-author at a smaller size or reduce frame count before continuing;
   do not attempt a multi-page workaround (design §3.2: the compiler hard-fails, it does not paginate
   like the body compiler).
2. `compile-accessory.cjs` (aura mode, `--kind aura`): re-emit the input `aura.json`+`aura.webp` pair
   as a Phaser atlas with `anchor:[0.5, 0.85]`; hard-fail on the >4096px case as a defense-in-depth
   check even though step 1 already gated it.
3. Migration: three nullable string columns on `users` (`avatar_hat`, `avatar_pet`, `avatar_aura`).
   `User.php`: add all three `enabled*()` helpers now.
4. `AccessoryLayer.js`: aura child, depth `0.2` (above shadow, behind body — design §1), own anchor
   independent of the wearer's character body pivots (ACC2).
5. `UserChangeAccessoryController.js` / `UserAccessoryApiController.php`: same functional-ACK,
   server-authoritative, ownership-checked shape as Slice 5/6 (PROTO1, PROTO2 reused, ACC3 — no
   `catalog_items` migration, admin-grant only, no purchase flow). `GET_USER_ACCESSORIES` returns
   owned hat/pet/aura for the `<select>`s.
6. Debug panel: add the aura `<select>` (none/owned auras) driven by `response:get_user_accessories`.
7. Live validation (success criterion 5, partial): grant an aura via Backpack admin to `God`/`test`;
   equip via the debug panel; confirm it renders identically regardless of which character wears it
   (ACC2); confirm z-order (behind body, above shadow); confirm a second session observes the change
   and that an unowned aura is rejected without disconnect (PROTO3 extended to accessories).

Covers: `ACC2`, `ACC3` (aura), `ACC5` (aura depth), `PROTO3` (accessory case).

---

## Slice 9 — Hat

**Status: [x] Complete.** `hat_minnie` compiled from the real decrypted archive (755 unique frames
after cross-anim dedup, one page). zBias for back-facing (up_*) frames applied deterministically by
frame membership rather than hand-editing JSON (documented deviation from "manual authoring" wording,
equivalent outcome). Hat/body anchoring formula and mirroring are a documented, evidence-based design
decision (no explicit spec formula existed) — see apply-progress.md. Server/API/DB chain live-verified.
Visual correctness (anchor, z-order, back-facing artifact) needs a real browser session.

Files: `client/scripts/compile-accessory.cjs` (MOD, add vector mode), `client/scripts/lib/
svgFromPaths.cjs` (NEW), `client/src/phaser/layered/AccessoryLayer.js` (MOD, hat kind + `zBias`),
`client/src/assets/game/accessories/hat/<key>/*` (generated), server/API accessory controller/service
from Slice 8 extended to accept `kind: "hat"` (no new files — same generic accessory pipeline),
`client/src/views/components/game/debug/AvatarLookDebugPanel.vue` (hat `<select>`).

1. Stage `personajes/rasta/hat/*.bb` from the decrypted archive into
   `client/.assets-src/accessories/hat_minnie/` (shape sampled at `.../scratchpad/ref/hat_minnie/`).
2. `svgFromPaths.cjs`: each frame's `p[]` → one `<path d fill fill-rule>` per entry inside an `<svg
   viewBox>`; assert the EaselJS `d` command alphabet and **throw on any unrecognised command** rather
   than silently dropping geometry. TDD: RED → GREEN → TRIANGULATE (multi-path frame, evenodd
   fill-rule case, unrecognised-command throw case) → REFACTOR.
3. `compile-accessory.cjs` vector mode: `sharp(Buffer.from(svg), {density:144}).png()` (144dpi = 2×72,
   same `ss:2` factor as the body); record `regX/regY` per frame from origin `o` at the same scale so
   `override ?? base ?? 0` always has a base (ACC1); dedupe by content hash (`meta.json`'s
   `deduped`/`perAnimUniq`), pack (reuse Slice 1's `packFrames.cjs`), emit `<key>.webp` + multiatlas +
   `<key>.accessory.json` (`{v, kind, key, base:{regX,regY,zBias}, frames{}, anims{}}`).
4. `AccessoryLayer.js`: hat kind, depth `1.0 + zBias` (default `+0.5`, design §1). **Author per-frame
   `zBias` overrides for back-facing (`up_*`) directions** in the hat manifest so a brim that should
   hide behind the head does so (e.g. `zBias: -0.4`) — this is manual authoring work on the compiled
   manifest, not automatable; owner: whoever runs the compiler for this asset. No runtime direction
   heuristic.
5. Hybrid fallback live case (ACC4, proposal risk 6): `hat_minnie/meta.json` declares ~40 animation
   keys vs the `rasta.layers` body's ~15 — trigger a body key the hat covers but the body falls back
   for, confirm the hat plays its matching frames in sync via `fallback.js`'s `accessoryFollows()`;
   trigger a key neither covers, confirm the hat is hidden rather than desynced.
6. `avatar_hat` decoration type: grant via existing Backpack admin (no new admin code — document the
   catalog-item type value and the ten-minute manual seeding step as an operational task, not code).
7. Debug panel: add the hat `<select>`.
8. Live validation: equip the hat on `God`/`test` in all four movement directions; confirm no
   back-facing brim artifact (zBias proof), correct z-order over the body, correct anchoring via
   `(regX, regY)` with and without an instance override.

Covers: `ACC1` (live), `ACC3` (hat), `ACC4` (live), `ACC5` (hat zBias).

---

## Slice 10 — Pet

**Status: [x] Complete.** `pet09` compiled reusing Slice 9's vector compiler unchanged (one small
compiler fix needed for empty-geometry frames, applied to both hat and pet). Depth-flip logic
implemented per design (`petDepth = relativeY >= 0 ? 1.5 : 0.5`). Server/API/DB chain live-verified,
all three accessories (aura+hat+pet) persisting together confirmed via reconnect. Visual correctness
needs a real browser session — see apply-progress.md.

Files: `client/src/phaser/layered/AccessoryLayer.js` (MOD, pet kind + depth flip),
`client/src/assets/game/accessories/pet/<key>/*` (generated, reuses Slice 9's vector compiler mode
unchanged), server/API accessory pipeline extended to `kind: "pet"` (no new files),
`client/src/views/components/game/debug/AvatarLookDebugPanel.vue` (pet `<select>`).

1. Stage `personajes/rasta/pet/*.bb` into `client/.assets-src/accessories/pet09/` (shape sampled at
   `.../scratchpad/ref/pet09/`); compile with Slice 9's vector-mode compiler, no compiler changes
   expected.
2. `AccessoryLayer.js`: pet kind, `petDepth = (resolvedRegY >= 0) ? 1.5 : 0.5` (design §1, computed
   from the same registration point `pivot.js` already resolves — no extra state).
3. `avatar_pet` decoration type: Backpack admin seeding (operational task, as Slice 9 step 6).
4. Debug panel: add the pet `<select>`.
5. Live validation: equip the pet on `God`/`test`; confirm the depth flip (pet draws in front of the
   owner when nearer the viewer, behind when farther — per the registration-point sign); note the
   accepted limitation that the pet does not participate in world Y-sorting against *other* users
   (design §1 cost) and confirm it at least sorts correctly against its own owner across all
   directions; confirm ownership gating (unowned pet not offered/rendered) and hybrid-fallback
   behavior if `pet09`'s animation coverage also exceeds the body's.

Covers: `ACC1` (live, pet), `ACC3` (pet), `ACC5` (pet flip), `ACC4` (live, if pet's coverage exceeds
the body's).
