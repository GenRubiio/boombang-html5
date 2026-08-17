# Design: avatar-color-accessory-system

Implements the four delta specs in this change's `specs/`. Decisions locked by `proposal.md` are not
re-argued. §N = `exploration.md`; bare paths/lines are verified against the working tree.

## 0. Two findings that shape everything below

**A. The `look` event namespace is already taken by an unrelated live feature.**
`RequestSocketsEnum.CHANGE_LOOK = 'request:change_look'` and `ResponseSocketsEnum.USER_CHANGE_LOOK =
'response:user_change_look'` exist on both client and server and mean *gaze direction*:
`CreateSceneController.js:254` emits `{x: col, y: row}`; `scenesSockets.js:53` routes it to
`UserChangeLookController`. No new event, controller, service, column or module here may use the word
`look`. Names below use `palette` and `accessory`.

**B. The source reference packages are not in the tree.** `scratchpad/ref/` (`rasta.layers/`,
`hat_minnie/`, `pet09/`) no longer exists and is not git-ignored — it was session scratch.
Re-acquiring those archives is a **prerequisite** of the first asset slice, not a step inside it. It
blocks asset compilation only; nothing else.

## 1. Open question 1 resolved — accessory z-order

Scene depth sorts **per user container**: `containerUser.setDepth(centerY)`
(`MoveUserToTileController.js:20`), re-applied from container `y` by nine other call sites
(`MoveUserController.js:83,139`, `UserUpdatePositionController.js:39`, `UserMoveDeniedController.js:40`,
`VisibilityManager.js:78`, `SendUppercutAnimationController.js:28,48`,
`SendInteractionAnimationController.js:28,43`, `UserChangeAvatarController.js:54`). All accessories are
therefore **children of `containerUser`**, sorted only against each other by explicit child depth.
Phaser's `Container` already re-sorts on a child `setDepth` — that is how today's `0/1/2/3` works, so
no new sorting code.

| Depth | Object | New? |
|---|---|---|
| `0.0` | `spriteShadow` | — |
| `0.2` | aura | new |
| `0.5` / `1.5` | pet (dynamic) | new |
| `1.0` | body (`spriteAvatar` or `LayeredAvatar`) | — |
| `1.0 + zBias` (default `+0.5`) | hat | new |
| `2.0` / `3.0` | `nameBackground` / `nameText` | — |

Existing objects keep their existing integer depths byte-for-byte; new objects occupy only the
fractional gaps, so with the flag off the container is literally today's four-element shape.

- **Aura `0.2`** — above the shadow (an opaque dark ellipse would occlude it), behind the body, which
  matches its `(0.5, 0.85)` anchor placing it around the feet.
- **Hat above the body** — the only direct evidence (live observation: hat draws over the head).
  *Cost:* for back-facing (`up_*`) directions a brim that should hide behind the head draws over it.
  Mitigated by an optional per-frame `zBias` in the accessory manifest, resolved by the same
  override-then-base-then-default rule as `regX/regY`; an authored `zBias: -0.4` puts that frame
  behind the body. No runtime heuristic guesses direction.
- **Pet flips `0.5` ↔ `1.5`** — the observation was "a ground-level entity beside its owner", which
  implies it draws in front when nearer the viewer. The flip is `petDepth = (resolvedRegY >= 0) ? 1.5
  : 0.5`, computed from the registration point the anchor already resolves. No extra state or data.
- **Pet does not participate in world Y-sorting** — *the real cost.* A pet visually in front of a
  *different* user sorts with its owner's container and can pop behind that avatar. The alternative
  (scene-level sibling with `setDepth(petScreenY)`) needs parallel depth bookkeeping in all nine call
  sites above plus disconnect cleanup — edits to movement code this change has no mandate over and
  cannot regression-test (no client runner exists today). Reversible: promoting the pet later changes
  only its attachment, not the accessory format.
- **Name tag untouched.** `createUserNameText` measures `spriteAvatar.frame.height *
  spriteAvatar.scaleY` (`AddUserController.js:310-311`); §5 defines `LayeredAvatar.frame` as the
  manifest-declared **body** bounds, excluding accessory children.

## 2. Open question 2 resolved — cache versioning for the three new artifact classes

Three sibling dictionaries on the same `AssetVersionManager` singleton, keyed by **string** artifact
key (the existing `avatars` dictionary is keyed by **numeric** id — disjoint keyspaces by type):

```js
this.layeredVersions   = { base: '1.0.0', characters:  { rasta: '1.0.0' } };
this.accessoryVersions = { base: '1.0.0', accessories: { minnieHat: '1.0.0', pet09: '1.0.0' } };
this.auraVersions      = { base: '1.0.0', auras:       { aura01: '1.0.0' } };
```

`getArtifactVersion(class, key)` → `${classBase}_${entryVersion}`, the same two-part shape as
`getAvatarVersion()` (`AssetVersionManager.js:48-54`). Cache keys carry a class prefix containing `.`:

| Class | Store | Key |
|---|---|---|
| layered manifest | `CONFIG` | `lay.${character}_manifest_v${ver}` |
| layered piece atlas | `ATLAS` | `lay.${character}_atlas_v${ver}` (+ `_p{i}`, `::{name}`, `#{sig}`) |
| accessory package | `ATLAS`/`CONFIG` | `acc.${kind}.${key}_atlas_v${ver}` / `_manifest_v${ver}` |
| aura sheet | `ATLAS`/`CONFIG` | `aur.${key}_sheet_v${ver}` / `_manifest_v${ver}` |

**Non-interference proof** (unit-tested, §8): every key today's code writes starts with one of the
eighteen literals `AvatarManager.getAvatarName()` returns (`boomer` … `zombie`, `unknown`) followed by
`_atlas` or `_spreadsheet` (`AvatarManager.js:140-143,274-276`). None starts with `lay.`/`acc.`/`aur.`
and `.` occurs in no existing key, so `removeByPrefix('${atlasKey}_v')`
(`AssetVersionManager.js:182-183`) can never match a new key and the new
`clearLayered/Accessory/AuraCache` prefixes can never match an old one. Impossible in both directions.

**localStorage: a separate key, not an extension.** New state lives under
`boombang_look_asset_versions` (`{layered, accessories, auras, timestamp}`), checked by a new
`checkArtifactUpdates()` called from `init()` after the existing `checkForUpdates()`.
`boombang_asset_versions` stays byte-identical. *Why:* `compareVersions()` reads only
`stored.base`/`stored.avatars` and `saveCurrentVersions()` rewrites the whole object from those two
fields, so folding new classes in would mean any client rollback silently erases them and forces every
user a full re-download. A separate key survives rollback as an ignored orphan. `handleForceUpdate()`
gains `clearArtifactVersionData()`; `cacheManager.clearCache()` already wipes all stores.

**IndexedDB `dbVersion` stays `1`.** New artifacts reuse the existing `ATLAS`/`CONFIG` stores
(`CacheManager.js:16-21`), so no `onupgradeneeded` fires for any existing user — the whole reason for
reusing stores instead of adding a `look_store`.

*Cost:* two localStorage keys and two check passes instead of one generalized manager. Generalizing now
would mean rewriting `compareVersions`/`clearAvatarCache` — the only code protecting 17 avatars' cached
assets — with no test runner yet in place.

## 3. Offline asset pipeline

Two CommonJS scripts under `client/scripts/`, matching `optimize-images.cjs` / `jsonmin.cjs` (`.cjs` in
an ESM package). **Both invoked manually, not from `npm run build`** — precedent: `optimize-images.cjs`
is wired to no npm script; outputs are committed assets that change ~never, and librsvg rasterization
inside a build already needing `--max-old-space-size=4096` buys nothing. *Cost:* a "forgot to re-run"
failure mode, softened by stamping `compilerVersion` + `sourceHash` (sha1 over sorted input bytes) into
every manifest, which the runtime validator warns on. Staging input root: `client/.assets-src/`
(NEW, git-ignored) — see finding B.

### 3.1 `client/scripts/compile-layered-avatar.cjs` (NEW) — raster body

Input `client/.assets-src/layered/<character>/`: `_frames.json`, `p*.png`, `<anim>.json`,
`colormeta.json`, `meta.json`.

1. Parse `_frames.json` → unique frames `{piece, x, y, w, h, o:[ox,oy], s, ss}`.
2. **Enforce `ss: 2`**: `sharp(page).metadata()` must place a `w*2 × h*2` sub-rect for each piece;
   mismatch **fails the compile**. Checked here because the runtime cannot fix it.
3. `sharp().extract()` each unique rect (never `.trim()` — trimming invalidates `o`), shelf-pack,
   `sharp().composite()`. Emit `<character>.layers.webp` plus `_1`, `_2` … whenever a canvas axis would
   exceed **4096px** — the same multi-page shape `AvatarRastaLoad.js` already loads.
4. Emit a **Phaser multiatlas JSON**, so pieces load through the existing `scene.load.multiatlas` path
   with zero new loader plumbing.
5. Emit `<character>.manifest.json`: `{v, compilerVersion, sourceHash, character, ss, slots[],
   defaults{}, labels{}, compatibleHats[], bodyBounds{w,h}, pieces{id:{frame,w,h,slot}},
   frames{fid:{o, oMirror, L:[{p,dx,dy,s}]}}, sequences{anim:{fps, repeat, frames:[…]}},
   mirrors{rightKey:{from,flipX}}}`. `oMirror = [bodyBounds.w - o[0], o[1]]` is precomputed so pivot
   correction is a pure, testable compiler function rather than a runtime expression.

Output: `client/src/assets/game/avatars/<character>/layers/` (NEW subdir of an existing dir).

### 3.2 `client/scripts/compile-accessory.cjs` (NEW) — vector hat/pet, and aura

Input `client/.assets-src/accessories/<key>/`: `meta.json` (`{kind, deduped, perAnimUniq,
anims:{k:{f,u}}}`) plus per-frame vector files `{o, p:[{d, f, eo}]}`. **How paths become textures** —
no runtime vector rendering, no new dependency:

1. Each frame's `p[]` becomes an SVG string: one
   `<path d="{d}" fill="{f}" fill-rule="{eo ? 'evenodd' : 'nonzero'}"/>` per entry inside an
   `<svg viewBox>` from the frame bounds (path-bounds pass when absent). EaselJS `d` is already SVG
   path syntax; the compiler asserts the command alphabet and **throws on any unrecognised command**
   rather than silently dropping geometry.
2. `sharp(Buffer.from(svg), { density: 144 }).png()` — sharp rasterizes SVG via librsvg. 144 dpi is 2×
   the 72 dpi default, giving the **same `ss: 2` supersampling as the body**, so both classes share one
   runtime downscale factor.
3. Record `regX/regY` per frame from the frame origin `o` at the same scale, so
   `override ?? base ?? 0` always has a base — the reference's `dump()` returned `{}` (§12.4), i.e.
   base is the normal path and overrides are an authoring affordance.
4. Dedupe identical rasters by content hash (`meta.json` declares `deduped`/`perAnimUniq`), pack, emit
   `<key>.webp` + multiatlas JSON + `<key>.accessory.json`: `{v, kind, key, base:{regX, regY, zBias},
   frames{fid:{regX, regY, zBias?}}, anims{k:{fps, frames:[…]}}}`.

**Aura mode** (`--kind aura`): input is the consolidated production-shaped `aura.json` + `aura.webp`
pair (§12.5), re-emitted as a Phaser atlas with `anchor: [0.5, 0.85]`. The compiler **hard-fails if
either sheet axis exceeds 4096px**, converting proposal risk 7 from "somebody must remember to measure"
into a gate that cannot be skipped.

Pure logic lives in `client/scripts/lib/` (NEW): `packFrames`, `svgFromPaths`,
`validateSupersampling`, `mirrorPivot`, `expandSequence` — sharp I/O stays in a thin shell so the logic
is unit-testable without filesystem access.

## 4. Feature flag

`VITE_LAYERED_AVATARS=false` (NEW in `client/.env.example`), read **once** into
`client/src/config/gameConfig.js` as `LAYERED_AVATARS` so checks are not scattered `import.meta.env`
reads. Two gates, both required: `gameConfig.LAYERED_AVATARS && layeredRegistry.has(avatarId)`. Layered
modules are reached via a dynamic `import()` inside that branch, so with the flag off they never enter
the main chunk and `vite.config.js`'s existing `manualChunks`/`onwarn` block (lines 36-54) needs one
added entry, not restructuring. Companion flags `VITE_AVATAR_LOOK_DEBUG` and `VITE_PERF_HARNESS` mirror
the existing `VITE_ANIMATION_AVATAR_EDITOR` pattern (`AddUserController.js:119`).

## 5. Layered renderer

`client/src/phaser/layered/LayeredAvatar.js` (NEW) extends `Phaser.GameObjects.Container` and is the
**drop-in replacement for `spriteAvatar`** at container index 1, depth `1.0`.

- Children: a **fixed pool** of `Phaser.GameObjects.Image` slots, sized at construction to the maximum
  `L` length across the character's frames, hidden when unused. No per-frame create/destroy — the
  difference between ~500 display objects and ~500 allocations per second.
- State: `_manifest`, `_palette`, `_seq`, `_seqIndex`, `_accum`, `_mirrored`, and `isLayered = true`
  as an own boolean so no consumer needs an `instanceof` import.

**Frame application** `_applyFrame(fid)`, with `k = sceneScaleFactor / ss`: for `i` in
`0 … f.L.length-1`, pool child `i` gets `setTexture(atlasKey, pieces[f.L[i].p].frame)`,
`setPosition((f.L[i].dx - origin[0]) * k, (f.L[i].dy - origin[1]) * k)`, `setScale(k)`,
`setVisible(true)`, `setDepth(i)`; children `>= f.L.length` are hidden.
*Layer order is immutable*: the pool index **is** the `L` index and the child depth **is** `i` — no
comparator, no sort, no insertion-order dependency. *Per-frame origin is the anchor*: subtracting
`origin` positions every piece relative to the declared `o`; pieces keep `setOrigin(0,0)` and nothing
recomputes a bounding-box centre. `origin` is `f.o`, or `f.oMirror` when playing a mirrored key — the
source `o` is never reused unmodified for a mirrored frame.

**Palette application** `applyPalette(slots)` iterates the pool: a piece declaring slot `s` gets
`child.setTint(slots[s] ?? manifest.defaults[s])`. **Phaser's built-in `setTint`, not
`rexColorReplacePipeline`** — pieces are authored one-per-slot, so a multiply tint is the correct
operation: one uniform, **zero additional GPU pipeline instances**. This directly answers exploration
risk 10, where `TintManager.addReplacement()` appends an uncapped pipeline per sprite per replacement
(`TintManager.js:62-69`). *Cost:* multiply cannot brighten, so a mid-tone source piece renders darker
than the requested hex. This is an **authoring** constraint the compiler warns about (mean luminance
below threshold on a tintable piece); a shader pass would reintroduce exactly the per-instance pipeline
cost this avoids. A palette change is a loop of uniform writes over existing children — no texture
reload, no destroy/recreate, comfortably inside the 100 ms bound.

**Sequences.** `manifest.sequences[key].frames` is a literal array; the player indexes into it, so
repeated indices are simply repeated entries. It is **never** converted to a `{start,end}` range: the
layered path calls neither `scene.anims.create()` nor `generateFrameNames()`, so
`AvatarManager.createAvatarAnimations()` (`:229-247`, the `{start,end}` code) is untouched and keeps
serving baked avatars. *Cost:* a second animation clock, contained by driving it from one scene-level
`LayeredAvatarRegistry.update(time, delta)` tick (NEW) over all live layered avatars rather than a
timer per avatar.

**Animation-coverage fallback.** A triggered key absent from `manifest.sequences` resolves
deterministically to `${currentDirection}_idle`, then `down_idle` — two steps, no heuristic, no
"nearest key". The resolved key is then handed to every worn accessory: if `accessory.anims[key]`
exists the accessory plays it in lockstep with the body's sequence index; **otherwise the accessory is
`setVisible(false)` for the duration** and restored on the next covered key. An accessory is never
driven by a frame index from a key it does not declare. Implemented once, in `LayeredAvatar.play()`, so
hat, pet and aura cannot diverge.

**Façade for existing animation callers.** `UserIdleAnimation`, `UserWalkAnimation`,
`UserChatAnimation`, `UserUppercutAnimation`, `UserCocoAnimation`, `UserEmojiAnimation` and
`UserInteractionAnimation` all do exactly two things: `AnimationUtils.setSpriteConfig(sprite, avatarId,
textureKey)` then `sprite.play(avatarId + "_" + textureKey, true)`. `LayeredAvatar` implements that
surface: `play(key, ignoreIfPlaying)` strips the `${avatarId}_` prefix and looks up
`sequences[textureKey]` through the fallback chain; `setFlipX(bool)` selects `oMirror` and
`scaleX = -k` rather than flipping a texture; `frame` is a getter returning `{width, height}` from
`manifest.bodyBounds` — **body only**, so accessories cannot move the name tag;
`setPosition/setScale/setDepth/setVisible/destroy/x/y/depth/scaleY` are inherited from `Container`;
`_avatarId`, `_z`, `isLayered` are plain properties.

Two small edits make that work with **no change to any animation class's call shape**:
(1) `AnimationUtils.setSpriteConfig` gains a first line
`if (spriteAvatar.isLayered) return spriteAvatar.applyClipConfig(textureKey);`, leaving the baked
branch untouched; (2) `UserIdleAnimation.js:14` guards on `scene.anims.exists(animKey)`, false for
layered characters, so it becomes `if (!spriteAvatar.isLayered && (…existing condition…))`. No other
animation class has that guard. *Rejected:* registering dummy single-frame Phaser animations so
`anims.exists()` returns true — avoids the two edits at the price of ~680 phantom animation objects and
a lie in the animation manager the next reader has to decode.

**Glove branch.** Layered: `colorGuante` is an ordinary manifest slot, tinted by `applyPalette` and
validated server-side against the preset ladder. Baked: `safeApplyTint` →
`TintManager.changeUppercutColor()` **unchanged**, `USER_CHANGE_UPPERCUT` untouched. The only new code
on the baked path is a one-line `if (sprite.isLayered) return;` at the top of both copies of
`safeApplyTint` (`AddUserController.js:430`, `UserChangeAvatarController.js:180`); everything below is
byte-identical, and with the flag off `isLayered` is never true.
`server/src/enums/GlovePresetsEnum.js` (NEW) maps `UppercutsEnum` index → `{name, hex}` reusing the ten
hexes from `TintManager.COLOR_HEX` (`TintManager.js:9-14`) so the two systems agree by construction;
the ten Spanish names (`Guante Rojo` … `Guante de Oro`) stay in
`client/src/assets/lang/*/translations.json:215-224` and are read by key, never duplicated.
Server-side rules: the value must be one of the ten preset **names**, never a hex (which is what makes
"an arbitrary colour is rejected for the glove slot" unambiguous); `presetIndex <= user.uppercutLevel`,
so the historical `ringsWon` ladder (`UserModel.js:124-147`) survives as the gate on offered presets;
first resolution with no saved value seeds from `user.uppercutSelected` (`UserModel.js:62`) and
**persists** from then on.

## 6. Protocol and persistence

Events (`request:`/`response:` preserved, `look` avoided — finding A):

| Enum | Request | Response |
|---|---|---|
| `USER_CHANGE_PALETTE` | `request:user_change_palette` | `response:user_change_palette` (room) + `…_ack` (self) |
| `USER_CHANGE_ACCESSORY` | `request:user_change_accessory` | `response:user_change_accessory` (room) + `…_ack` (self) |
| `GET_USER_ACCESSORIES` | `request:get_user_accessories` | `response:get_user_accessories` |

The broadcast/ack split mirrors the existing `USER_CHANGE_AVATAR` + `USER_CHANGE_AVATAR_POPUP` pair
(§3.4) and keeps failure ACKs off the room channel. Payloads: request `{avatarId, slots:{slotKey:
value}}` (partial updates allowed); ack `{success, code, message}` with `code ∈ {UNKNOWN_SLOT,
LOCKED_PRESET, INVALID_VALUE, NOT_OWNED, INCOMPATIBLE, RATE_LIMITED}`; broadcast `{socketId, avatarId,
slots}`.

**Never disconnect.** New controllers wrap everything in `try/catch` and always emit an ack. Design
invariant, grep-checkable: **the new controller files must not import `DisconnectUserController`**. The
two existing offenders (`UserChangeAvatarController.js:47-51`, `UserChangeUppercutController.js:16-21`)
are out of scope and left as they are.

**Broadcast targeting fixes the fallback-path bug (proposal risk 3).** The broadcast carries
`socketId`, and the client resolves `gameScene.users[data.socketId]` directly — `gameScene.users` is
keyed by socket id (`AddUserController.js:116`, `UserResource.js:8`) — so it never consults
`SmartAvatarSystem`'s map and behaves identically for immediate-load and fallback-upgrade avatars.
Separately the `userAvatarReady` comparison is corrected from `user.username` to the socket id at
`AddUserController.js:545,552` and `UserChangeAvatarController.js:297,304`, so late-loading layered
upgrades actually apply. Client registration follows the one-line pass-through shape at
`SceneResponseSockets.js:83-85`.

**Server → API → DB.** `UserChangePaletteController` → `server/src/services/UserPaletteService.js`
(NEW: validation, seeding, glove gating) → `UserApiService.changePalette(user, avatarId, slots)` (NEW
method) → `POST api/user/change-palette` using **the user's own JWT** (`user.authJwt`), matching
`changeAvatar()` at `UserApiService.js:148` — not the emulator token (§3.6 warns against assuming that
pattern is uniform).

API follows the repo's actual convention (§10: thin controller + plain service + Eloquent direct,
inline validation, plain arrays). **No `Repositories/` layer, no API-side `FormRequest`, no
`JsonResource`** — `FormRequest` is reserved for Backpack admin CRUD here.

- `api/routes/api.php`, inside the existing `Route::prefix('user')` group under `auth:api` (lines
  86-95): `change-palette`, `accessories`, `change-accessory`.
- `UserChangePaletteApiController.php` / `UserAccessoryApiController.php` (NEW) shaped like the 28-line
  `UserChangeAvatarController.php` with `ResponseApiControllerTrait`;
  `api/app/Services/UserAvatarPaletteService.php` (NEW) shaped like `NpcCatalogItemService`.
- Migration `create_user_avatar_palettes_table` (NEW): `user_id` FK, `avatar_id` unsignedInteger,
  `palette` **`longText` nullable**, `manifest_version` string nullable, timestamps,
  `unique(user_id, avatar_id)`. `longText` is the project convention (`public_scenes.assets_data`,
  `mails.description`); a `json` column is never used. `api/app/Models/UserAvatarPalette.php` (NEW)
  gets `set/getPaletteAttribute` doing `json_encode`/`json_decode`, exactly as `PublicScene.php:171`.
  The name deliberately avoids the dead `avatar_colors` reference in `UserService.create()`
  (proposal risk 8).
- Accessory ownership: `User.php` gains `enabledHats()`, `enabledPets()`, `enabledAuras()` — three
  copies of the `enabledAvatars()` body (:153-166) with `user_decoration_type` of
  `avatar_hat`/`avatar_pet`/`avatar_aura`. Deliberately not DRY'd: the file already holds four
  near-identical `enabled*()` methods. `catalog_items` needs **no migration** (`user_decoration_type`
  is a generic string, §3.7); grants go through existing Backpack admin; no purchase or currency flow
  is added anywhere. Equipped accessories: an additive migration adding three **nullable** string
  columns `avatar_hat`, `avatar_pet`, `avatar_aura` to `users`. Character↔hat compatibility is
  manifest-side (`manifest.compatibleHats`), validated server-side — no new pivot table.

**Server in-memory model.** `server/src/models/UserModel.js` gains, next to `this.avatars` at :52:
`avatarPalettes` (map `avatarId → slots`), `accessories` (`{hat, pet, aura}`), `ownedAccessories`.
`server/src/resources/UserResource.js` gains `avatar_palette` and `accessories` **after line 54**
(`coconut_selected`) — explicitly **not** between the duplicate `avatar_id` assignments at :31 and :36
(proposal risk 9). Socket registration sits beside `USER_CHANGE_AVATAR` at `scenesSockets.js:92-94`.

## 7. Measurement harness

`client/src/phaser/debug/PerfHarness.js` (NEW), gated by `VITE_PERF_HARNESS=true` and also reachable as
`window.__perf` so a run needs no rebuild.

**Measures** over a fixed 10-second window: FPS mean, **p5 (worst 5%)** and min from raw frame deltas
plus `scene.game.loop.actualFps`; `totalDisplayObjects` (recursive through every user container) and
`layeredPieceObjects`; draw calls from the WebGL renderer's per-frame `drawCount`, meaned — if
unavailable on this Phaser build it falls back to the display-object count and **says so in the
report**, which the spec permits ("draw-call *or* display-object count"); plus context (renderer type,
`devicePixelRatio`, `gameConfig.DPI`, avatar count, flag state, layered vs baked).

**Load generation:** `window.__perf.spawnGhosts(25)` adds synthetic avatars through the *real*
`AddUserController.processUser` path with fabricated user data, so measurement exercises the production
assembly path and 25 avatars are reproducible without 25 browser sessions.

**Output:** `console.table` plus a JSON blob on `window.__perf.results`, copied to the clipboard. That
JSON is the artifact the verify phase pastes into its report.

**Go/no-go:** `window.__perf.evaluate()` returns `{pass, reasons}`. PASS requires **p5 FPS ≥ 45** at 25
layered avatars on the measuring machine, with **60 FPS the stated target on desktop reference
hardware**. The baked baseline is recorded at the same 25 avatars and the layered/baked mean-FPS ratio
reported; a ratio below 0.6 is flagged as a warning even when the absolute floor passes, because it
predicts failure on weaker clients. The accepted-risk statement (≈500-775 objects vs ≈100 today) prints
beside the measured counts, so the comparison the spec asks for lives inside the artifact.

## 8. Tests

**Commands, stated honestly.** The configured strict-TDD command
`cd server/src/packages/objects-maker && npm test` resolves to `node index.js`
(`server/src/packages/objects-maker/package.json:8`). It is **not a test runner and covers none of this
change's code**; it will not be used. Actual commands:

| Surface | Command | Status |
|---|---|---|
| `client/` | `cd client && npm test` → `vitest run` | NEW — `vitest` devDependency, `test`/`test:watch` scripts, separate `client/vitest.config.js` so `vite.config.js` stays untouched |
| `server/` | `cd server && npm test` → `vitest run` | NEW — CommonJS-compatible |
| `api/` | `cd api && ./vendor/bin/phpunit` | exists |

Environment `node`; no jsdom, no Phaser instantiation — every unit test imports pure logic.

**Unit-testable (RED first):** `layered/sequence.js` — `expandSequence()` returns the literal array
including repeats, never a range (named case `down_walk` = `[9,10,11,12,13,14,15,10,16,17,18,19,20]`);
`layered/pivot.js` — `mirrorPivot(o, w)` and `resolveRegistrationPoint(override, base)` → override ??
base ?? 0 **per axis**; `layered/manifestValidation.js` — slot-set membership, `ss:2` dimension
assertion, required fields, unknown-slot rejection, per-character independent slot counts;
`layered/paletteResolve.js` — defaults and labels looked up independently, label falls back to the raw
slot key, missing palette → manifest defaults; `layered/fallback.js` — `resolveFallbackKey()` chain and
`accessoryFollows()` (sync vs hide); `managers/lookCacheKeys.js` (NEW, pure) — key derivation **plus a
collision test asserting no generated key matches the legacy `${avatarName}_atlas|_spreadsheet`
prefixes for all 18 `getAvatarName()` return values**, the executable proof of §2;
`client/scripts/lib/*.cjs` — `svgFromPaths` (unknown path command throws), `packFrames`,
`validateSupersampling`; `server/src/services/UserPaletteService.js` — glove gating by `uppercutLevel`,
free values accepted for non-glove slots, seeding from tier, unknown-slot rejection, hex rejected for
the glove slot; `api/tests/Feature/UserAvatarPaletteTest.php` (NEW) — per-`(user, avatar)` scoping, one
avatar's palette not overwritten by another's, `longText` JSON round-trip.

**Live-validation only (verify phase):** layered-vs-baked parity across idle/talk/walk in all
directions (pivot drift, frame gaps); the 100 ms palette latency and absence of sprite replacement;
FPS/draw-call numbers and the go/no-go call; two-session broadcast; functional ACK keeping the session
connected; the debug-panel round trip; z-order consistency across two users; admin-grant ownership;
flag-off parity; palette survival across a flag toggle.

## 9. Debug panel

`client/src/views/components/game/debug/AvatarLookDebugPanel.vue` (NEW), mounted from `App.vue` behind
`VITE_AVATAR_LOOK_DEBUG=true`. Slot rows come from the manifest: label is `manifest.labels[slot] ??
slot` (raw-key fallback), value is a **plain `<input type="text">` hex field** with the manifest default
as placeholder. **`iro.js` is not added.** The glove slot is a `<select>` of the ten preset names with
above-tier options disabled — display-only; the server re-checks. Three more `<select>`s (hat/pet/aura,
plus "none") come from `response:get_user_accessories`. The panel renders the ACK `{success, code,
message}` verbatim, so a rejection is visibly a rejection rather than a disconnect.

## 10. File changes

Grouped so work-unit slices are derivable; the tasks phase owns the actual boundaries.

**Test + harness infrastructure** — `client/package.json`, `client/vitest.config.js` (NEW),
`server/package.json`, `server/vitest.config.js` (NEW), `client/src/phaser/debug/PerfHarness.js` (NEW),
`client/.env.example`, `client/src/config/gameConfig.js`.

**Layered manifest + compositor + colours + persistence + debug panel**
- NEW client: `phaser/layered/{LayeredAvatar,LayeredAvatarRegistry,manifestValidation,sequence,pivot,paletteResolve,fallback}.js`,
  `phaser/managers/lookCacheKeys.js`, `scripts/compile-layered-avatar.cjs`, `scripts/lib/*.cjs`,
  `views/components/game/debug/AvatarLookDebugPanel.vue`,
  `assets/game/avatars/<character>/layers/*`
- MOD client: `phaser/managers/AvatarManager.js` (strategy branch in `loadAvatar`),
  `AssetVersionManager.js` (§2), `SmartAvatarSystem.js` (key fix),
  `phaser/preloaders/AvatarsDataPreload.js`, `utils/AnimationUtils.js`,
  `phaser/animations/UserIdleAnimation.js`,
  `phaser/controllers/scene/AddUserController.js` (:132 container, :204 sprite creation, :430 tint
  guard, :545/:552 key fix), `phaser/controllers/scene/UserChangeAvatarController.js` (:180 tint
  guard, :297/:304 key fix), `phaser/sockets/SceneResponseSockets.js`, `phaser/models/UserModel.js`,
  `enums/{Request,Response}SocketsEnum.js`, `App.vue`, `vite.config.js`
- NEW server: `controllers/game/scenes/UserChangePaletteController.js`,
  `services/UserPaletteService.js`, `enums/GlovePresetsEnum.js`
- MOD server: `sockets/game/scenes/scenesSockets.js`, `enums/{Request,Response}SocketsEnum.js`,
  `services-api/UserApiService.js`, `models/UserModel.js`, `resources/UserResource.js`
- NEW api: `database/migrations/*_create_user_avatar_palettes_table.php`,
  `app/Models/UserAvatarPalette.php`, `app/Services/UserAvatarPaletteService.php`,
  `app/Http/Controllers/Api/User/UserChangePaletteApiController.php`,
  `tests/Feature/UserAvatarPaletteTest.php`; MOD `routes/api.php`

**Aura** — NEW `client/scripts/compile-accessory.cjs` (aura mode),
`client/src/phaser/layered/AccessoryLayer.js`, `client/src/assets/game/accessories/aura/<key>/*`,
`server/src/controllers/game/scenes/UserChangeAccessoryController.js`,
`api/app/Http/Controllers/Api/User/UserAccessoryApiController.php`,
`api/database/migrations/*_add_accessory_columns_to_users_table.php`; MOD `AddUserController`
(aura child at `0.2`), `UserApiService.js`, `scenesSockets.js`, `api/app/Models/User.php`,
`api/routes/api.php`.

**Hat** — `compile-accessory.cjs` vector mode; `client/src/assets/game/accessories/hat/<key>/*`; hat
child at `1.0 + zBias`; `avatar_hat` decoration type + Backpack seeding.

**Pet** — `client/src/assets/game/accessories/pet/<key>/*`; pet child with the `0.5`/`1.5` flip;
`avatar_pet` decoration type + Backpack seeding.

## 11. Rollout and rollback

Every slice ships behind `VITE_LAYERED_AVATARS=false`. Enable on a staging build, run the harness at 25
avatars, record the JSON, evaluate go/no-go, then decide on wider rollout.

Rollback is the flag: `AvatarManager` takes the baked branch, the container returns to its four-element
shape, `TintManager.changeUppercutColor()` remains the glove mechanism, and no layered module is
imported. Per-slice rollback is reverting that slice's chained PR; earlier slices keep working because
each is independently gated.

**Zero data loss on every path.** The palette table is new; the three `users` accessory columns are new
and nullable; `catalog_items` is not migrated; `boombang_asset_versions` and every existing IndexedDB
entry are untouched and `dbVersion` stays `1` (§2). A persisted palette survives a flag toggle unread
and unmodified, ready to apply on re-enable. The glove's pre-change value was never persisted, so there
is nothing to migrate.

## 12. Requirement traceability

| Spec / requirement | Covered by |
|---|---|
| LR: Explicit frame-index sequences | §5 Sequences; §8 `sequence.js` |
| LR: Per-frame origin is the anchor | §5 Frame application; §3.1 step 5 |
| LR: Raster supersampling `ss:2` | §3.1 step 2 (compile fails); §8 `validateSupersampling` |
| LR: Layer order immutable | §5 Frame application (pool index = `L` index = depth) |
| LR: Mirrored directions, corrected pivot | §3.1 `oMirror`; §5 `origin` selection; §8 `mirrorPivot` |
| LR: Renderer strategy behind a flag | §4; §10 `AvatarManager`/`AddUserController` branch |
| LR: Flag disable loses no palette data | §11 |
| LR: Perf harness with go/no-go | §7 |
| LR: Palette change within 100 ms | §5 Palette application (uniform writes, no reload) |
| LR: New client logic automatically testable | §8 |
| PAL: Slot keys are an open manifest-declared set | §3.1 `slots[]`; §8 `manifestValidation` |
| PAL: Slot counts vary independently per character | §3.1 per-character manifest; §8 |
| PAL: Defaults and labels independent, label→raw key | §8 `paletteResolve`; §9 |
| PAL: Persistence scoped per (user, avatar) | §6 `unique(user_id, avatar_id)`; §8 phpunit |
| PAL: Missing palette → manifest defaults | §5 `applyPalette` fallback; §8 |
| PAL: Non-glove slots accept a free colour | §5 glove rules (only glove restricted); §8 |
| PAL: Glove accepts only unlocked presets | §5 glove rules; §8 `UserPaletteService` |
| PAL: Glove preset identity preserved | §5 `GlovePresetsEnum` + existing translation keys |
| PAL: Glove seeds from progression, then persists | §5 seeding from `uppercutSelected`; §6 |
| PAL: Baked characters keep existing tint | §5 glove branch (one-line `isLayered` guard) |
| ACC: Anchoring by registration point | §3.2 step 3; §8 `resolveRegistrationPoint` |
| ACC: Auras character-independent, own anchor | §3.2 aura mode `anchor:[0.5,0.85]`; §1 depth `0.2` |
| ACC: Ownership reuses decoration model | §6 `enabledHats/Pets/Auras`, no `catalog_items` migration, no purchase flow |
| ACC: Hybrid fallback outside layered coverage | §5 Animation-coverage fallback |
| ACC: Z-order explicit and consistent | §1 |
| PROTO: Server authoritative | §6 validation in `UserPaletteService` + API |
| PROTO: Functional ACK, never disconnect | §6 ack shape + no-`DisconnectUserController` invariant |
| PROTO: Broadcast reaches fallback-path avatars | §6 `socketId` targeting + `SmartAvatarSystem` key fix |
| PROTO: Persists across client-server-API chain | §6 Server → API → DB |
| PROTO: `request:`/`response:` naming | §6 events table; finding A |
| PROTO: Debug panel proves the round trip | §9 |

## 13. Costs of the decisions above

1. **Pet inside the user container** — no world Y-sorting for pets; buys avoiding a rewire of nine
   container-depth call sites that have no regression tests.
2. **`setTint` instead of a colour-replace shader** — zero pipeline objects, but multiply cannot
   brighten, so fidelity depends on an authoring constraint the compiler can only warn about.
3. **Own animation clock instead of Phaser's `AnimationManager`** — required by literal frame lists;
   costs a second timing path that will not inherit Phaser's animation fixes.
4. **Manual compilers, not a build step** — keeps `vite build` unchanged; costs a "did you re-run it?"
   failure mode, softened to a warning by `sourceHash`.
5. **Parallel version dictionaries, not a generalized manager** — cannot touch existing cached avatars;
   costs duplicated version-check code a later refactor must unify.
6. **Separate `_ack` events** — matches the existing avatar-change shape; costs two names per operation.
7. **Three near-identical `enabled*()` methods** — matches `User.php`; costs DRY.
8. **Fixed piece pool at worst-case frame size** — no per-frame allocation; costs hidden `Image`
   objects on frames with fewer pieces than the maximum.
