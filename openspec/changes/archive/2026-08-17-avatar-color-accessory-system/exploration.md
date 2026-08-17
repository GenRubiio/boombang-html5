# Exploration: avatar-color-accessory-system

Scope: layered characters with customizable colours plus accessories (hats, pets, auras),
matching the reference game at boombang.tv, implemented in this repository (client/server/api).
This document maps current repo state, prior-art accuracy, and risks. It does not propose a
design or implementation.

Live validation of the reference game and of this project's running app is owned by the
orchestrator (browser tools) and by the `sdd-verify` phase, not by this exploration pass. The
orchestrator has already run a live session against the reference game; its findings are folded
into §12 below. This agent performed no live/browser validation and does not need to.

## 1. Prior-art verification (claims from `doc/analysis/sistema-personajes-por-capas.md`)

| Claim | Verdict | Evidence |
|---|---|---|
| `SmartAvatarSystem` `username`-vs-`socketId` comparison bug | **CONFIRMED, still present** | `client/src/phaser/managers/SmartAvatarSystem.js` registers `activeAvatars` keyed by the id passed into `getAvatarForUser(userId, ...)`. Callers pass the socket id: `AddUserController.js:94` (`smartAvatarSystem.getAvatarForUser(userData.id, requestedAvatarId)`), `UserChangeAvatarController.js:20` (`smartAvatarSystem.getAvatarForUser(socketId, requestedAvatarId)`). But the "ready" listener compares against `user.username`, not the socket id, in `AddUserController.js:545` (`if (data.userId === user.username && ...)`) and `UserChangeAvatarController.js:297` (same pattern), and the corresponding "mark updated" calls pass `user.username` too (`AddUserController.js:552`, `UserChangeAvatarController.js:304`, `updateUserAvatar(userId, ...)`). Net effect: a user whose requested avatar loads late (fallback path) will never receive the `userAvatarReady` match because the map key (socketId) never equals `user.username`. This is a real, reproducible bug in the current fallback-upgrade path, independent of this change, but the new colour/accessory system will build directly on `SmartAvatarSystem`/`AddUserController`, so it must be fixed or bypassed as part of this change rather than inherited silently. |
| `UserResource.js` (server) declares `avatar_id` twice | **CONFIRMED** | `server/src/resources/UserResource.js:31` and `:36` both assign `avatar_id: data.avatarId,` inside the same object literal (the second silently wins; harmless today only because both read the same field, but any new field added between them, e.g. `avatar_look`, could be lost the same way if inserted carelessly). |
| `TintManager`/`rexColorReplacePipeline` wired and used | **CONFIRMED, but scoped to whole-sprite recolour, not per-zone layered colour** | Plugin registered globally as `rexColorReplacePipeline` in `client/src/App.vue:114-120` (`ColorReplacePipelinePlugin` from `phaser3-rex-plugins`, `start: false`). `client/src/phaser/managers/TintManager.js` wraps it: `replaceColor()`/`addReplacement()` chain per-sprite pipelines keyed by an arbitrary `partKey` string, but every pipeline instance still operates on the *entire* sprite texture (`originalColor`→`newColor` substitution over the whole rendered frame), not on a declared colour slot inside a multi-layer composition. It is used today only for: shadow selection colour (`AddUserController.js:181/190`), and uppercut/glove tint chains (`TintManager.js:76-90`, called from both controllers' `safeApplyTint`; see §9 for the important disambiguation between this uppercut-glove feature and the reference's `colorGuante` avatar palette slot). There is no existing mechanism that discriminates "zone A" from "zone B" within one baked sprite frame — exactly the doc's stated risk ("encadenar nueve reemplazos... sería frágil"). Confirms the doc's conclusion that a new palette pipeline (shader-based or container-of-parts) is required; the existing tint chain cannot be reused as-is for 7-9 independently variable colour slots on antialiased raster frames. |
| Server error handling disconnects users on invalid avatar selection | **CONFIRMED, and worse than a UX nit** | `server/src/controllers/game/scenes/UserChangeAvatarController.js:47-51`: the `catch` block for **any** thrown error (including the deliberate `throw new Error('Invalid avatar selection')` at line 19 for an unowned avatar) calls `DisconnectUserController.main(socket, io)` and emits `'error_critical'`. This is a genuine current behaviour, not a hypothetical: selecting an avatar not in `user.avatars` disconnects the session today. The identical anti-pattern also exists in `server/src/controllers/game/scenes/UserChangeUppercutController.js:16-21` for the unrelated glove/uppercut-colour feature (see §9) — this is a repeated pattern across at least two controllers, not an isolated bug. Any avatar-look/palette change controller built the same way inherits this footgun; the analysis doc's "ACK funcional sin desconexión" recommendation is a real requirement, not just polish. |

Additional accuracy note: the doc's §4.5 line "El proyecto ya usa `rexColorReplacePipeline` y `TintManager`" is accurate; its implication that colour infra is closer to reusable than it is should be read narrowly — see the pipeline-scope caveat above.

## 2. Contradictions the reference-asset brief raises against the analysis doc (confirmed from files I could read directly)

Verified directly against `scratchpad/ref/hat_minnie/meta.json` and `scratchpad/ref/pet09/meta.json`
(not just the brief's summary):

- Hat/pet meta files use `kind: "hat"` / `kind: "pet"`, `deduped: true`, `perAnimUniq: true`, and a
  per-animation `{f, u}` map (frame-count / unique-count), covering **~40 animation keys**
  including specials (`down_coco`, `leftdown_punch_doy`, `left_fall`, `flower_power`, `ficha`,
  `cara_grande/mediana/peque`, etc.) — confirmed present in both `hat_minnie/meta.json` and
  `pet09/meta.json`. The character's raster-layer package (`rasta.layers/meta.json`) covers only
  **15** animation keys (`down/left/leftdown/leftup/up` × `idle/talk/walk`), confirmed by direct
  read: `{"down_idle":1,"down_talk":8,"down_walk":13,...}` — 15 entries total, `uniqFrames: 103`.
  This 15-vs-40 animation coverage asymmetry between body and accessories is a **hard scoping
  fact**, not a doc claim to re-derive: any hat/pet worn during a special body animation (which
  the raster body package cannot render at all) needs an explicit hybrid-rendering decision.
- Sequence arrays preserve explicit, sometimes-repeating frame indices, confirmed directly:
  `scratchpad/ref/rasta.layers/down_walk.json` = `[9,10,11,12,13,14,15,10,16,17,18,19,20]` (index
  `10` repeats). Any sequence player must consume this literal index list, not a `{start,end}`
  range — this repo's current `client/src/assets/game/avatars/rasta/config.json` format (see
  §4 below) is exactly the `{start,end}` range shape the reference sequence format is incompatible
  with.
- I could not independently re-verify the brief's claims about `colormeta` open-key slots
  (`colorGuante` alongside `color1..color7`) or the vector frame contract for hats/pets (`d`/`f`/`eo`
  path data) because those specific JSON files were not in my reading list — I am relying on the
  brief's direct quotes for those two points and flag them as **brief-sourced, not independently
  re-verified by this agent**. The brief itself states it extracted them directly from the
  archives, which this agent cannot access (no Bash/unzip tool), so there is no way for me to
  independently confirm `hat_minnie` / `pet09` frame contracts beyond the two `meta.json` files
  read above. Note: the live-session brief (§12) independently corroborates the `colorGuante`-as-
  labelled-slot idea from the runtime editor UI ("Selecciona el color de tu **Piel**" reading the
  slot's own `colormeta.labels` value), which is consistent with, though not a byte-for-byte
  re-verification of, the asset-brief's claim.

## 3. Current repo state relevant to the change

### 3.1 Client — avatar loading, caching, versioning

- `client/src/phaser/managers/AvatarManager.js` (740 lines): singleton, `avatarLoaders` map of
  17 `AvatarEnum` keys → per-avatar `Load` classes (`../load/avatars/Avatar*Load.js`), e.g.
  `AvatarRastaLoad`. `loadAvatar()` (line 127) checks `scene.textures.exists(atlasKey)`, then an
  in-memory `inFlightAtlasLoads` de-dupe set, then `loadFromCache()` (IndexedDB via
  `CacheManager`), then falls back to network load via the avatar's `loader.main(scene, avatarId)`
  which calls `scene.load.multiatlas(...)`. `createAvatarAnimations()` (line 229) reads
  `window.avatars_config[avatarId]` (populated by `AvatarsDataPreload.js`) and calls
  `scene.anims.create()` with `generateFrameNames({start, end, prefix})` — i.e. **contiguous
  numeric frame ranges only**, not explicit index lists. This is incompatible with the reference
  sequence format (§2 above) without a translation layer or a switch to `scene.anims.generateFrameNames`
  called per explicit frame array (Phaser supports arbitrary frame arrays via
  `scene.anims.create({frames: [...]})` directly, bypassing `generateFrameNames`, so this is a
  soluble compatibility gap, not a blocker — but it is a real change to `createAvatarAnimations()`).
- `getAvatarName(avatarId)` (line 698) is a static id→string map used to build `${name}_atlas`
  texture keys; this pattern is duplicated verbatim as `avatarName()` static methods in both
  `AddUserController.js:516` and `UserChangeAvatarController.js:269` (client controllers) — three
  independent copies of the same enum-to-string switch statement across the codebase.
- `client/src/phaser/managers/SmartAvatarSystem.js` (406 lines): fallback/upgrade orchestration
  layer above `BackgroundAvatarLoader.js`, not itself a loader. Tracks `activeAvatars` (Map
  keyed by the id passed to `getAvatarForUser`), fires `userAvatarReady` events consumed by the
  two controllers described in §1. Confirmed bug there.
- `client/src/phaser/managers/CacheManager.js`, `AssetVersionManager.js`,
  `BackgroundAvatarLoader.js` — read in full in this revision; see §11 for the dedicated
  extensibility analysis these were flagged for.
- `client/src/phaser/managers/TintManager.js` — see §1; whole-sprite recolour chains only.

### 3.2 Client — user assembly and animation

- `client/src/phaser/controllers/scene/AddUserController.js` (642 lines): `createContainerUser()`
  (line 132) builds `[spriteShadow, spriteAvatar, nameBackground, nameText]` as a flat
  `Phaser.Container` — **one avatar sprite per user, no sub-layers today**, confirmed. No hook
  point exists yet for a hat/pet/aura child sprite; adding one means inserting into this fixed
  4-element array and re-deriving depth/name-position math that currently assumes
  `spriteAvatar` is element index 1 (e.g. `createUserNameText()` reads
  `spriteAvatar.frame.height * spriteAvatar.scaleY` at line 310-311 to position the name tag —
  an aura or hat sprite added above the avatar must not perturb this measurement).
  `createAvatarSprite()` (line 204) hardcodes atlas-key construction from `avatarName()` + one
  `gameScene.add.sprite(0,0,atlasKey)` — no notion of "renderer strategy" (baked vs layered).
- `client/src/phaser/controllers/scene/UserChangeAvatarController.js` (330 lines):
  `replaceUserSprite()` (line 116) destroys the old `spriteAvatar` and creates + reinserts a new
  one at the same container index on every avatar change — full sprite replacement, not
  in-place update. A colour-only change (no avatar change) has no analogous code path today;
  it would need to be added net-new rather than adapted from an existing "recolour without
  replace" flow.
- `client/src/phaser/models/UserModel.js` (client-side, 29 lines): flat data holder,
  `this.avatarId = row.avatar_id` (line 16); no palette/look field exists. Adding
  `avatarLook`/`manifestVersion` is additive and low-risk here.
- `client/src/utils/AnimationUtils.js` (37 lines): `setSpriteConfig()` applies **one constant
  `positionX`/`positionY` offset per animation clip** (read from `window.avatars_config`), via
  `spriteAvatar.setPosition(...)` — confirmed by reading `client/src/assets/game/avatars/rasta/config.json`,
  where every animation entry (e.g. `"down_idle":{...,"positionX":0,"positionY":-50}`) has a
  single fixed offset for the whole clip, not a per-frame pivot. This directly confirms the
  analysis doc's "doble origen" risk (§15 of the doc): the reference/extracted raster package's
  `_frames.json` carries a **pivot per unique frame** (`"o":[x,y]`), which is finer-grained than
  this project's current per-animation-clip offset model. Reconciling the two is a real design
  problem, not a detail — any layered renderer needs per-frame pivot application that
  `AnimationUtils.setSpriteConfig` does not currently support.
- `client/src/phaser/preloaders/AvatarsDataPreload.js` (44 lines): statically imports 17
  `config.json` files (one `import` per avatar) into `window.avatars_config`. Adding an 18th
  "layered" avatar variant, or accessory manifests, means either extending this static-import
  list (simplest, matches existing convention) or introducing a dynamic-import loader (bigger
  change, not currently the pattern anywhere in this file).
- `client/src/phaser/sockets/SceneResponseSockets.js` — read in this revision:
  `socket.on(ResponseSocketsEnum.USER_CHANGE_AVATAR, (data) => { UserChangeAvatarController.main(gameScene, data); })`
  at lines 83-85 is the entire avatar-related wiring in this file — a single, simple pass-through
  registration. A new `response:user_change_avatar_look` (or similar) event would be registered
  the same way in this same file; no complexity found here beyond what was expected.

### 3.3 Client — current baked-atlas layout (rasta sample)

- `client/src/assets/game/avatars/rasta/config.json`: single flat JSON object, one key per
  animation name (not per direction/family), each value `{atlasKey, prefix, flip_horizontally,
  start, end, frameRate, frameWidth, frameHeight, repeat, positionX, positionY}`. Confirmed ~40+
  animation entries for `rasta` (special animations included: `left_punch_rec`, `special`,
  `down_ouch`, `left_beber`, `escupir`, `risa2`, `down_coco`, `risa1`, `redbull`, `pedo`,
  `left_punch_doy`, plus base `idle/talk/walk` × 5 directions + their `flip_horizontally: true`
  mirrored counterparts for the missing 3 right-side directions). `frameRate: 19` uniformly
  (matches the doc's "Boomer usa 19 FPS" claim, here also true for rasta).
- `client/src/phaser/load/avatars/AvatarRastaLoad.js`: imports **7** `spritesheet-N.webp` pages
  plus one `atlas.json`, calls `gameScene.load.multiatlas('rasta_atlas', asset_atlas_json)` after
  patching `texture.image = webpFiles[i]` per page. Also separately loads two per-avatar SVGs
  (`cara_peque`, `cara_media`) as `${avatarId}_cara_peque` / `${avatarId}_cara_media` — i.e. the
  project **already loads at least one SVG asset type per avatar** today (face icons for the UI),
  which is relevant prior art for eventually loading hat/pet vector data, though these SVGs are
  static single-frame icons, not animated vector sequences like the reference hat/pet packages.
- No `.layers`/per-piece PNG assets of any kind exist under `client/src/assets/game/avatars/` for
  any avatar today — the entire current asset pipeline is baked-atlas-only. Confirmed by the
  `Glob` for `**/*rasta*` under that folder returning only `config.json` and the two `.svg` face
  icons (the atlas pages themselves live under `rasta/animations/`, not matched by that glob
  pattern but confirmed present via the load file's imports).

### 3.4 Enums and events

- `client/src/enums/RequestSocketsEnum.js` / `ResponseSocketsEnum.js`: consistent
  `request:snake_case` / `response:snake_case` naming (Enum wrapper class). Existing avatar
  events: `USER_CHANGE_AVATAR` (`request:user_change_avatar` / `response:user_change_avatar`),
  `GET_USER_AVATARS` (`request:get_user_avatars` / `response:get_user_avatars`), plus a
  client-only `USER_CHANGE_AVATAR_POPUP` (`response:user_change_avatar_popup`) used only for the
  ack shown in the popup (see §3.5). A separate, unrelated pair exists for the uppercut/glove
  feature, `USER_CHANGE_UPPERCUT` (`request:user_change_uppercut`) — see §9. No existing
  `*_look`/`*_palette`/`*_accessory` events; new ones would follow the same naming convention
  cleanly.
- Server-side `server/src/enums/RequestSocketsEnum.js` mirrors `GET_USER_AVATARS` /
  `USER_CHANGE_AVATAR` and also declares `USER_CHANGE_UPPERCUT` (confirmed via grep hits in
  `server/src/sockets/game/scenes/scenesSockets.js`, `server/src/controllers/game/scenes/UserChangeUppercutController.js`,
  and `server/src/controllers/game/scenes/UserSendUppercutController.js`).

### 3.5 Client — avatar picker UI

- `client/src/views/components/game/scenes/AvatarSelectionPopup.vue` (354 lines): fetches
  `GET_USER_AVATARS` on mount, renders a padded 15-slot grid, `isAvatarEnabled()` checks
  `authUser.avatars.includes(avatarKey)` (ownership gate purely client-side display, matching
  server-authoritative re-check in the socket controller). On click, emits
  `USER_CHANGE_AVATAR` and listens once for `USER_CHANGE_AVATAR_POPUP` ack
  (`{success, avatar}`) to update `selectedAvatarKey` and trigger a 2s client-side cooldown
  overlay. **No colour/palette UI exists at all** — confirmed, this is 100% new UI surface. The
  existing ack pattern (`response:user_change_avatar_popup` with `{success, avatar}`, no error
  code/message) is the template to extend for a non-disconnecting error ACK (§1 risk). Note this
  popup is reachable from the room HUD, not from a settings flow — contrast with the reference
  product's placement, §12.1.

### 3.6 Server

- `server/src/models/UserModel.js` (286 lines, in-memory, per-connection): `this.avatarId =
  row.avatar_id` (line 16); no look/palette field. `enabledAvatars`-equivalent check happens via
  `user.avatars` array (populated from API, not shown in this file) checked in
  `server/src/controllers/game/scenes/UserChangeAvatarController.js:18`
  (`if (!user.avatars.includes(data.avatar))`).
- `server/src/services/UserService.js`: contains a `static async create(username, email,
  password, avatar_id, avatar_colors)` method (line 38) that does a **raw SQL INSERT referencing
  a non-existent `avatar_colors` column** (`INSERT INTO users (name, email, password, avatar_id,
  avatar_colors) VALUES (?, ?, ?, ?, ?)`, line 43-44). This method is **not called anywhere in
  `server/`** (confirmed by grepping for `UserService.create(` across `server/` — zero matches).
  It is dead code, and its column list does not even match today's actual `users` table (Laravel
  migrations use `avatar`, not `avatar_id`, and there is no `avatar_colors` column anywhere in
  `api/database/migrations/` — confirmed by grep, zero matches for `avatar_colors` in that
  directory). **This is NOT a vestige of the existing glove/uppercut-colour feature** — see §9 for
  the full investigation the coordinator requested; the uppercut/glove colour is proven to be an
  entirely separate, purely in-memory (non-persisted) mechanism with no database column at all,
  so `avatar_colors` cannot be its remnant. It remains a pre-existing landmine on its own terms:
  naming this change's new palette column `avatar_colors` would collide semantically with dead,
  broken code referencing a column of the same name that was never created. Recommend a distinct
  name if a new table/column is introduced (the analysis doc's own suggestion,
  `user_avatar_palettes.palette`, avoids the collision).
  `UserService.changeAvatar(user, newAvatarId)` (line 217) is the real, live path: sets
  `user.avatarId` then calls `UserApiService.changeAvatar`.
- `server/src/services-api/UserApiService.js`: `changeAvatar()` (line 148) POSTs to
  `api/user/change-avatar` with `{avatar: newAvatarId}`, using the user's own JWT
  (`user.authJwt`), not the `EMULATOR_API_TOKEN` — i.e. this specific call impersonates the user
  via their JWT rather than going through the emulator-token internal channel described in
  `CLAUDE.md`. Any new avatar-look persistence endpoint should decide explicitly which auth mode
  to use and should not assume the `EMULATOR_API_TOKEN` pattern applies uniformly to every
  server→API call.
- `server/src/controllers/game/scenes/UserChangeAvatarController.js`: see §1 (disconnect-on-error
  bug, also present verbatim in the glove/uppercut controller, §9). Also note: it emits
  `USER_SELECT_USER` to self only "if (!user.selectedUser)" (line 30) — an existing
  conditional-refresh pattern any new controller must replicate correctly to avoid desyncing the
  "currently selected user" panel when a look changes.
- `server/src/sockets/game/scenes/scenesSockets.js`: registers `GET_USER_AVATARS` →
  `GetUserAvatarsController` and `USER_CHANGE_AVATAR` → `UserChangeAvatarController` (lines
  89-93). New look/palette events would be registered the same way, same file.

### 3.7 API — ownership model

- Avatar ownership today: `api/app/Http/Controllers/Api/Game/Scene/SceneUserAvatarsApiController.php`
  queries `CatalogItem::where('is_active', true)->whereNotNull('user_decoration_type')->where('user_decoration_type', 'avatar')`
  and checks ownership per item via `auth()->user()->userCatalogItems()->where('catalog_item_id',
  $item->id)->exists()`. `api/app/Models/User.php:153-165` has `enabledAvatars(): array`, a raw
  `DB::table('user_catalog_items as uci')` join filtered the same way
  (`user_decoration_type = 'avatar'`), `whereNull('uci.private_scene_id')`, plucking
  `ci.user_decoration_value`. This is the existing decoration/ownership pattern; **there is no
  existing `user_decoration_type` value for hats, pets or auras** — confirmed by reading
  `api/app/Models/CatalogItem.php`'s full fillable list (line 31-68, includes
  `user_decoration_type`/`user_decoration_value` as generic string fields, so a new type value
  like `avatar_hat`/`avatar_pet`/`avatar_aura` would slot into the existing schema without a
  migration to `catalog_items` itself, though `UserCatalogItem` (per-user ownership row) would
  still need to be created per acquisition the same way avatars are).
- `api/app/Http/Controllers/Api/User/UserChangeAvatarController.php` (28 lines): the real,
  minimal persistence path — `Auth::user()`, checks `in_array($request->avatar,
  $user->enabledAvatars())`, then `$user->update(['avatar' => $request->avatar])`. Confirms the
  `users.avatar` column is the actual DB field (not `avatar_id` — that name is only used in the
  outward-facing `UserResource.php:34`, `'avatar_id' => $this->avatar,` — a naming translation
  that must be preserved/mirrored for any new look/palette resource field).
- The full CRUD-entity-template question (originally left unverified) is answered definitively in
  §10 below, with a concrete named example (`NpcCatalogItemService`/`NpcCatalogItemApiController`)
  and a definitive statement that no `api/app/Repositories/` layer exists anywhere in this
  codebase.

### 3.8 Build/tooling

- `client/package.json`: scripts are `dev`, `build`, `preview`, `jsonmin`, `jsonunmin` only —
  **confirmed, no `test` script exists**, and `client/vite.config.js` has no test/vitest
  configuration of any kind. Under `strict_tdd: true` this surface has literally nothing to run
  RED against; a test runner (vitest is the natural fit given the Vite 6 toolchain already in
  place) would need to be added from scratch as part of this change if TDD discipline is to
  apply to any new client-side logic (palette validation, manifest parsing, etc.), separate from
  and in addition to any asset-compiler script tests (which could run under plain Node without
  a browser test runner).
- `sharp` is **already present** as a client devDependency (`client/package.json:30`,
  `^0.34.3`), and is already used by an existing script, `client/scripts/optimize-images.cjs`
  (confirmed by grep hit) — so the analysis doc's proposed `compile-layered-avatar.mjs` using
  `sharp` has a precedent and does not need a new dependency.
- `client/vite.config.js`: manualChunks already special-cases `AvatarManager.js`/
  `CacheManager.js` for dynamic/static import warning suppression (lines 38-43) — any new
  manager module following the same singleton-import pattern should be aware this warning
  suppression exists and may need extending to a new file name.
- The reference client loads `iro.js` (`@jaames/iro@5`) for its colour wheel (§12.6) — this
  project has **no colour-picker library dependency today**; `client/package.json`'s dependency
  list (§3.8 above) contains none. Adopting `iro.js` (MIT-licensed per the live-session brief)
  would be a new, small dependency, not a repo-breaking addition, but it is net-new and not
  already present anywhere in `client/package-lock.json` (not independently re-verified by lockfile
  read in this pass; inferred from the absence in `client/package.json`'s dependency list).

## 4. Smallest vertical slice that proves the whole system

Based on the above, the minimal slice that touches every layer (colours + one hat + one pet +
one aura) is, in order of dependency:

1. **One character, colour-only, no accessories**: `AvatarManager` render-strategy branch +
   new layered-frame compositor (or shader) + `AddUserController`/`UserChangeAvatarController`
   integration + `UserModel` (client) `avatarLook` field + one new socket event pair + minimal
   server persistence (even a single-column stopgap, but *not* named `avatar_colors` — see §3.6)
   + a bare-bones colour editor (can be a debug panel, not the final `AvatarSelectionPopup.vue`
   UI) to prove the round trip. This alone touches ~10 files across client/server/api and is
   already the "4+ files" delegation threshold from the harness skill.
2. **+ one aura**: the cheapest accessory class per the reference brief (plain sprite-sheet,
   character-independent, fixed anchor) — a new child sprite in `AddUserController`'s container.
   The live session (§12.5) shows production consolidates all auras into a single sheet+descriptor
   pair rather than the three separate wide sheets seen in the local asset dump, which removes the
   texture-size concern this slice would otherwise have needed to solve first (see corrected risk
   in §7, item 9).
2 formatting note: chronologically this is a separate, independent slice from colours.
3. **+ one hat**: requires deciding vector-vs-raster rendering for accessories (Phaser has no
   native vector path renderer at production quality/performance for this shape; this repo has
   zero prior art for runtime vector rendering — the only vector assets loaded today are two
   static SVG face icons per avatar, not animated vector sequences). The realistic path is an
   offline rasterizer (reusing the already-present `sharp` dependency) that bakes the hat's
   vector frames into a small per-hat atlas, keyed by the same animation/frame indices as the
   body. This is new pipeline work with no existing equivalent in the repo. The live session
   (§12.4) clarifies the attachment contract: a hat is positioned by a registration point
   `(regX, regY)` resolved as `override ?? base` — an EaselJS-style anchor, not a colour slot —
   which is new information that should shape how any offline-rasterized hat atlas records its
   per-frame anchor.
4. **+ one pet**: same rendering approach as the hat, and per §12.4 shares the same `(regX, regY)`
   attachment mechanism via the same `kind` discriminator (`"kind":"pet"` vs `"kind":"hat"`).
   Z-order relative to the body (child vs sibling) remains **unresolved even after the live
   session** — the world PIXI application was not exposed on `window` and could not be traversed
   (§12.7); this is genuinely open, not just unverified by this agent, and no comparable "attached
   companion sprite" pattern exists in `client/src/phaser/controllers/scene/` today to infer an
   answer from either.

Each of the four sub-slices is independently shippable behind a feature flag, matching the
analysis doc's phased plan; none of them can reuse `TintManager`'s whole-sprite recolour chains
as-is (§1).

## 5. Where accessories fit in the existing catalog/ownership model

- Mechanically: reuse `catalog_items.user_decoration_type` with new values (e.g. `avatar_hat`,
  `avatar_pet`, `avatar_aura`), each `user_decoration_value` holding the accessory key (e.g.
  `minnieHat`, `pet09`, `aura_azul`), ownership rows in `user_catalog_items` exactly like avatars
  today (§3.7). No schema migration needed on `catalog_items` itself for this; a migration would
  only be needed if slot-specific metadata (e.g. "compatible characters") must be queryable
  rather than embedded in the manifest files themselves.
- A parallel API listing endpoint analogous to `SceneUserAvatarsApiController` would be needed
  per accessory kind (or one shared endpoint filtering by `user_decoration_type`), and a parallel
  `enabledX()`-style helper method on `User.php` analogous to `enabledAvatars()` — this is a
  mechanical repeat of an existing, working pattern, low risk.
- Character-accessory compatibility (`layers-hats.json` mapping character → allowed hat keys, per
  the reference brief) has **no existing analogue** in this repo's catalog schema — today's
  `catalog_items` rows for avatars are not scoped to "compatible with other catalog items."
  This compatibility constraint would need either a new pivot table or a manifest-side
  (non-database) whitelist enforced at the client/server validation layer, mirroring how the
  analysis doc treats colour-slot validation (manifest-declared, not DB-declared).
- Accessory ownership/economy in the *reference* product was not observable in the live session
  (guest session, no inventory — §12.7); this repo-side mapping is therefore a proposal grounded
  in this repo's existing pattern, not a mirror of a confirmed reference mechanism.

## 6. Real performance constraints in the current renderer

- Confirmed: today's model is exactly one `Phaser.Sprite` per user for the avatar, plus one
  shadow image and two name-tag elements — 4 display objects per user, no accessory objects,
  no shader passes except the on-demand `ColorReplacePipeline` chains for shadow-select/uppercut
  (which are per-instance WebGL pipeline objects, not shared — `TintManager.addReplacement()`
  calls `this.plugin.add(sprite, {...})` per sprite per replacement, meaning N uppercut recolours
  = N chained pipeline instances *per sprite*, confirmed in `TintManager.js:62-69`). This is
  already a form of per-instance GPU pipeline cost that a new colour system must not multiply
  further; stacking up to 9 palette-slot pipelines per avatar **on top of** existing shadow/
  uppercut chains, per the doc's naive-chaining warning (§4.5 of the doc), is confirmed to be a
  real risk given how `TintManager` is actually implemented (append-only pipeline chains with no
  cap or de-dup other than "last written wins" bookkeeping via `_registry`).
- No explicit FPS/draw-call budget code, texture-atlas batching diagnostics, or texture-size
  guard exists in `client/src/phaser/PublicScene.js` (grepped for `maxTextureSize|MAX_TEXTURE|
  batch|FPS|fps` — zero matches) — confirmed there is **no existing instrumentation** to validate
  the analysis doc's "60 FPS with 25 avatars" target against; any performance claim in a future
  design phase needs new measurement code, not reuse of existing telemetry, because none exists
  for this concern today. This is a gap the design phase must account for explicitly (build the
  measurement harness before or alongside the vertical slice, not after).
- **Corrected per live session (§12.5):** the aura sheet-width risk originally recorded here from
  the static asset dump (`aura_azul.json`: `sheetWidth: 8113, sheetHeight: 652`) does **not**
  reflect what production actually serves. The live session observed the room loading
  `dswmedia/effects/aura.json` + `dswmedia/effects/aura.webp` — a single consolidated
  descriptor+sheet pair — rather than three separate wide sheets. Whether that one consolidated
  sheet is itself under the 4096px `MAX_TEXTURE_SIZE` floor was **not measured** in the live
  session (dimensions of `aura.webp` were not captured), so this is not fully closed, but the
  specific "8113px sheet will definitely exceed the floor" claim from the local asset dump is
  superseded: prefer building against the production-shaped single-sheet convention, not the
  three-separate-sheet shape seen in the local dump, and re-measure the consolidated sheet's
  actual dimensions before assuming it is safe. See the corrected risk entry in §7, item 9.

## 7. Risk inventory (repo-grounded, superseding/extending the doc's §15)

1. **`SmartAvatarSystem` userId/username bug (confirmed, §1)** — must be fixed or the fallback
   path bypassed for layered avatars, otherwise late-loading colour/accessory upgrades will
   silently never apply for any user who took the fallback path.
2. **Disconnect-on-error pattern repeated across avatar AND glove/uppercut controllers (confirmed,
   §1, §3.6, §9)** — a real production behaviour today in at least two controllers, not
   hypothetical; any new avatar-look controller copying this controller's structure inherits a
   user-facing regression risk (disconnection on a rejected colour/accessory selection) unless
   explicitly redesigned with functional ACKs.
3. **`UserResource.js` duplicate `avatar_id` key (confirmed, §1)** — low risk today (dead
   duplicate), but a trap for whoever next edits this object literal to add `avatar_look`
   between the two existing `avatar_id` lines.
4. **Dead code referencing a phantom `avatar_colors` column (confirmed, §3.6, §9)** — naming
   collision risk if the new palette persistence reuses that name; recommend a distinct name.
   Confirmed NOT to be a vestige of the glove/uppercut feature (§9) — it is an unrelated,
   independently dead fragment.
5. **No test runner on `client/` at all (confirmed, §3.8)** — `strict_tdd: true` cannot apply to
   client-side work until a test runner is added; this is infrastructure work that precedes any
   RED/GREEN cycle for client logic, and should be scoped as its own task, not bundled silently
   into the first feature task.
6. **Per-frame pivot vs per-animation offset mismatch (confirmed, §3.2)** — `AnimationUtils`'s
   current model (one offset per whole clip) cannot express the reference package's per-unique-
   frame pivot (`_frames.json`'s `"o"` field) without a new code path; this is a compatibility
   gap, not a stylistic one, since the reference sequences also repeat frame indices in ways a
   `{start,end}` range cannot express (confirmed in §2, `down_walk.json`).
7. **Accessory animation coverage exceeds body coverage (confirmed via `hat_minnie`/`pet09`
   `meta.json`, §2)** — ~40 accessory animation keys vs 15 body animation keys; any design must
   state explicitly what a hat/pet does during a body special-animation the layered raster
   package cannot render.
8. **Vector rendering has zero runtime precedent in this codebase (confirmed, §3.3, §4)** — the
   only vector assets currently loaded are two static per-avatar SVG icons
   (`AvatarRastaLoad.js:9-10, 28-29`), not animated vector sequences; an offline-rasterize
   approach (using the already-present `sharp` dependency, §3.8) is the only approach with any
   precedent in this repo. The live session (§12.6) explains *why* the reference format looks
   vector/EaselJS-shaped (`regX`/`regY`, `{d,f,eo}` paths) — it is a CreateJS/EaselJS display-object
   dump — which does not change this risk but does explain its origin.
9. **Aura sheet width — corrected, downgraded** — the local asset dump's 8113px-wide sheets
   (exceeding the 4096px `MAX_TEXTURE_SIZE` floor) are **not what production serves**; the live
   session (§12.5, §6) observed a single consolidated `aura.json`/`aura.webp` pair in production.
   This repo should target the production single-sheet shape, but the consolidated sheet's actual
   pixel dimensions were not captured live and must still be measured/verified before assuming it
   is safe — downgraded from "confirmed exceeds floor" to "needs measurement of the correct
   (production) artifact, likely smaller than previously feared."
10. **Chained per-instance colour-replace pipelines have no cap (confirmed, §6)** — `TintManager`
    accumulates pipeline instances per sprite per replacement with no dedup beyond
    "supersede last write" bookkeeping; adding a naive per-colour-slot chain on top of existing
    shadow/uppercut chains is a real GPU-pipeline-count risk, not a theoretical one.
11. **Live/functional validation is out of scope for this document** — owned by the orchestrator
    (browser access) and the `sdd-verify` phase. The orchestrator's own live session against the
    reference product is folded into §12; this repo's running app (`localhost:8080`, `God`/`test`)
    has not been validated by anyone as part of this exploration pass and should be validated
    during `sdd-verify`, not assumed equivalent to the reference just because this document exists.
12. **Full CRUD-entity template question — now resolved, see §10** — no residual risk from this
    item; the prevailing `api/app/` pattern is now documented with a concrete example.
13. **New: glove/uppercut-colour feature is not persisted at all (confirmed, §9)** — `user.uppercutSelected`
    is set purely in server RAM (`UserChangeUppercutController.js:15`) and is recomputed from
    `uppercutLevel` on every reconnect (`server/src/models/UserModel.js:62`,
    `this.uppercutSelected = this.uppercutLevel;`), with no API/database write anywhere in that
    path. If the product intends the *new* palette-driven glove colour to be durable across
    reconnects (which the reference's palette-per-avatar model implies it should be, since palettes
    are described as persisted per `(user_id, avatar_id)`), this is a behavioural upgrade relative
    to today, not a like-for-like migration — flagged as a product decision input for §9.4, not
    something to silently preserve or silently fix.
14. **New: no colour-picker dependency exists in this repo (confirmed, §3.8, §12.6)** — the
    reference uses `iro.js`; adopting it (or an equivalent) is net-new dependency surface for the
    colour-wheel part of any editor UI, separate from the palette-application/rendering risk
    already covered by items 6, 8 and 10.
15. **New: editor UX shape from the reference does not match this project's current avatar-picker
    UX (confirmed, §12.1-§12.3)** — the reference treats colour editing as a settings-flow,
    slot-by-slot wizard with an isolated preview PIXI app, distinct from character selection; this
    project's only comparable surface, `AvatarSelectionPopup.vue`, is a single grid-selection
    popup reachable from the room HUD with no wizard/preview concept at all. This is a UX-scope
    gap for the design phase to resolve deliberately, not an implementation detail.

## 8. Where accessories/colours meet the existing "glove colour" feature — see §9 for full detail

Kept as a pointer since this topic previously appeared only as an open item; the full
investigation the coordinator requested now lives in §9.

## 9. Investigation: the existing "glove colour" (`guante`) feature and its relationship to the new palette system

The user's request (verbatim, Spanish): *"Tambien nesesito que revises el tema de editar el
color de guante en nuestro porque el sistema de color de guante entiendo que cambiara porque
ahora podremos cambiar el color de otra manera."* This section documents what "colour de guante"
actually is in this repository today, with exact evidence, and lays out — without deciding —
what it would take to fold it into the new palette system.

### 9.1 Critical disambiguation found during investigation

**This repository's existing "guante"/"glove" feature is the boxing-glove colour attached to the
uppercut combat mechanic — not an avatar body-part costume colour.** This matters because the
reference asset metadata (`scratchpad/ref/hat_minnie/`'s sibling character package, per the
asset-format brief, §2) uses `colorGuante` as a *character palette slot* labelled `"guante"`
(Spanish for "glove", referring to a piece of the avatar's worn costume, e.g. Rasta's actual
in-game glove/mitten graphic). Those are two unrelated concepts that happen to share the Spanish
word "guante":

- **This repo's "glove"**: a **progression-gated colour for the on-screen boxing-glove/uppercut
  fist** used when a user "sends an uppercut" at another user — a combat/interaction cosmetic tied
  to `ringsWon`, not a body-part of the avatar itself.
- **The reference's `colorGuante`**: (per the asset brief, not independently re-verified by this
  agent beyond the brief's quote) a palette slot on the character's own body/costume, alongside
  `color1..color7`, with default `#ff0000` and label `"guante"`.

Grep evidence that these are separate systems: searching the whole repo for
`guante|glove|colorGuante|glove_color|avatar_color` (case-insensitive) returns **zero hits** for
any avatar-body-part glove colour concept. Every "glove"/"guante" hit in the codebase is part of
the uppercut system: `client/src/views/components/game/scenes/npc/RingNpcModalComponent.vue`,
`client/src/views/components/game/scenes/RingInfoCardComponent.vue`, and the `es`/`en`/etc.
translation bundles under `client/src/assets/lang/*/translations.json` (e.g.
`client/src/assets/lang/es/translations.json:215-224`: `"red": "Guante Rojo"`, `"white": "Guante
Blanco"`, ... `"gold": "Guante de Oro"` — a fixed list of ten named/coloured gloves matching
`TintManager.UPPERCUT`'s ten-entry enum one-for-one).

### 9.2 Where the existing glove colour is edited, stored and applied

- **UI**: `client/src/views/components/game/scenes/user-card/tabs/InteractionsTabComponent.vue`.
  `selectedUpperIndex: this.authUser.uppercut_selected` (line 191) and `activeUpperCount:
  this.authUser.uppercut_level + 1` (line 195) drive a horizontal picker of **ten fixed preset
  webp swatches** (`asset_red_upper_image` ... `asset_gold_upper_image`, imported from
  `@/assets/game/ficha/uppercuts/{red,pink,orange,green,blue,white,purple,brown,black,gold}.webp`,
  lines 118-127), gated by unlock level — not a free colour picker of any kind, and not a
  slot-by-slot wizard. Selecting a swatch emits `socket.emit(RequestSocketsEnum.USER_CHANGE_UPPERCUT,
  { uppercut: index })` (line 226-227 area).
- **Storage — confirmed NOT persisted at all**: server-side,
  `server/src/controllers/game/scenes/UserChangeUppercutController.js:15` does
  `user.uppercutSelected = data.uppercut;` directly on the in-memory `UserModel` instance, with
  **no call to any `*ApiService`, no HTTP request, no database write** anywhere in this controller
  (confirmed by reading the full 23-line file — there is nothing else in it besides the guard
  clauses and this one assignment). `server/src/models/UserModel.js:61-62` shows
  `uppercutSelected` is **recomputed from `uppercutLevel` on every user-object construction**
  (`this.uppercutLevel = this.calculateUppercutLevel(); this.uppercutSelected =
  this.uppercutLevel;`) — i.e. on every reconnect, the "selected" glove colour resets to whatever
  the user's current unlock tier is, discarding any earlier in-session choice of a *lower* unlocked
  tier's colour. This is a genuinely ephemeral, per-connection selection today, not a durable
  per-user preference.
- **Application at render time**: confirmed to be exactly the `TintManager`/`rexColorReplacePipeline`
  path the coordinator expected. `TintManager.changeUppercutColor(sprite, newId, epsilon)`
  (`client/src/phaser/managers/TintManager.js:76-90`) looks up `TintManager.COLOR_HEX[newId]`
  (a fixed 10-entry hex map, lines 9-14) and chains a new `originalColor→newColor`
  `ColorReplacePipeline` instance via `addReplacement()`. It is invoked from
  `AddUserController.safeApplyTint()` (lines 430-484) and the identical method duplicated in
  `UserChangeAvatarController.safeApplyTint()` (lines 180-234), both gated on
  `uppercut_selected`/`uppercutSelected` truthiness and both applying the tint to the **entire
  avatar sprite texture** (this "glove colour" recolours the whole rendered avatar frame via a
  global colour substitution — it is not scoped to a hand/glove region of the sprite; presumably
  effective in practice because the boxing-glove asset is the only region in the relevant frames
  using that particular original colour, not because the pipeline is spatially constrained).
- **Server-side gating**: `server/src/controllers/game/scenes/UserChangeUppercutController.js:12`
  validates `data.uppercut > user.uppercutLevel || data.uppercut < 0` and — per the repeated
  anti-pattern noted in §1/§7 item 2 — the `catch` block for this and any other error in the same
  controller calls `DisconnectUserController.main(socket, io)` and emits `'error_critical'`
  (lines 16-20), identical in shape to the avatar-change controller's bug.

### 9.3 Is it one colour or several colours, per-user or per-avatar?

- **One colour, not several**: exactly one glove colour is active at a time
  (`uppercutSelected`, a single integer index into a fixed 10-entry enum), not a set of
  independently variable slots.
- **Per-user, not per-avatar**: `uppercutLevel`/`uppercutSelected` live on the flat
  `server/src/models/UserModel.js` user object, computed from account-wide `ringsWon`
  (`calculateUppercutLevel()`, lines 124-147) — there is no `avatar_id` dimension anywhere in this
  feature. Switching avatars does not change or reset the selected glove colour (there is no code
  path connecting the two).
- **Fixed palette, not free colour**: the ten values are a hardcoded enum
  (`TintManager.COLOR_HEX`, `UppercutsEnum` on both client and server) unlockable by a
  `ringsWon` threshold ladder (`calculateUppercutLevel()`), not user-authored hex values. This is
  structurally the opposite of the reference's free-hex, manifest-declared-slot palette model.

### 9.4 What it would take for this feature to become one slot of the new palette — findings and options, no recommendation

The user's framing (Spanish, quoted above) explicitly anticipates that "the glove colour system
will change because now we can change colours another way." Findings relevant to that
anticipated change, and the open options, without picking one:

**What would have to be true for glove colour to become "just another palette slot":**
- The reference's `colorGuante` slot (per the asset brief) is a **body-costume palette entry
  with a free hex value and a default**, applied via the same layered-composition mechanism as
  every other slot (`color1..colorN`). This project's glove colour is a **progression-gated,
  fixed 10-value enum tied to a combat mechanic**, applied via a global sprite tint. These are not
  structurally the same feature; unifying them means one of two different things depending on
  which is meant:
  1. *Literal interpretation*: if this project's reference-matching character(s) declare a
     `colorGuante`-equivalent slot in their manifest (an avatar-body glove/mitten costume piece),
     that slot should be edited through the new palette editor like any other slot, entirely
     independent of the boxing-glove/uppercut feature. Under this reading, "the glove colour
     system will change" refers to the *avatar customization* glove piece the reference shows, not
     to this project's uppercut cosmetic at all, and **no change to
     `InteractionsTabComponent.vue`/`UserChangeUppercutController.js`/`TintManager.changeUppercutColor()`
     is implied**. This is the interpretation most consistent with how the reference itself models
     `colorGuante` (a body-part slot, unconnected to any combat mechanic there either, as far as
     this investigation found).
  2. *Broader interpretation*: if the product intends the **existing uppercut/glove-colour feature
     itself** to be re-expressed as a slot of the new avatar palette (e.g. because the two features
     visually target the same on-screen region, or because product wants a single "customize your
     look" surface), that is a materially larger change: it would mean removing or reworking the
     progression-gating (`ringsWon` → `uppercutLevel` ladder), removing the fixed 10-colour
     constraint (which today gives progression meaning — level 9 unlocks gold, etc.), and deciding
     whether "you must unlock ring victories to change this colour" survives at all once colours
     are freely editable elsewhere. This reading has real gameplay/economy consequences (the
     uppercut colour ladder is a stated progression reward, `doc`/`translations` confirm ten named
     tiers up to `"30.000"` victories for gold) that a simple "point it at the new palette store"
     change would silently remove unless explicitly re-decided.
- **What breaks under interpretation 2**: (a) the `ringsWon`-gated unlock ladder loses its purpose
  if the same visual effect becomes freely choosable via the palette editor; (b) the fixed
  10-value enum (`UppercutsEnum`, `TintManager.COLOR_HEX`) would need to be either kept as a
  *default preset list* for a new "uppercut/fist" palette slot or discarded in favour of fully
  free hex, which changes the reward structure; (c) `TintManager.changeUppercutColor()`'s
  whole-sprite tint approach is incompatible with the layered/per-slot palette rendering this
  change is building (§1) — it would need to become a real colour slot (`s: "uppercut"` or similar)
  in the layered frame data, which does not exist for any current baked avatar, since the current
  atlases are baked PNGs with no slot metadata at all (§3.3).
- **Data migration question**: because the current selection is **not persisted anywhere**
  (§9.2), there is, in the strictest sense, **nothing to migrate** for users who "already saved a
  glove colour" — no user has a saved glove colour in the database today; the value is recomputed
  from `uppercutLevel` every session. If the new palette system introduces real persistence for an
  equivalent slot, the practical migration question becomes: what value should each existing user
  see the first time the new system runs — their current session's `uppercutLevel`-derived colour
  (preserves apparent continuity) vs. the slot's manifest default (simpler, consistent with how
  every other slot without a saved palette falls back per the analysis doc's rule "Si falta una
  paleta, se usa la paleta predeterminada versionada del manifiesto", §6.2 of the doc) vs. leaving
  the field unset until the user explicitly visits the new editor. This is a product decision, not
  a technical constraint — none of the three options requires new schema beyond what the palette
  system already needs.
- **Old UI/event/column: remove, keep-as-alias, or leave untouched — options, not a decision**:
  1. *Leave `InteractionsTabComponent.vue`/`USER_CHANGE_UPPERCUT` untouched* if interpretation 1
     above is correct (the two features are genuinely unrelated) — lowest risk, no regression
     surface, but leaves two different "customize a colour" UX patterns in the product
     (fixed-preset picker for gloves vs. free-hex wizard for body colours) which may or may not be
     an acceptable product inconsistency.
  2. *Deprecate `USER_CHANGE_UPPERCUT` in favour of a new slot event* if interpretation 2 is
     chosen — requires a compatibility shim if any external client/bot still emits the old event
     (unverified whether bots do; `server/src/packages/bots/` was not audited for this in this
     pass), and requires an explicit decision on whether the `ringsWon` unlock ladder is preserved
     as a *gate on which palette presets are offered* for that slot (keeps the reward meaning) or
     dropped entirely (colour becomes freely choosable once unlocked once, or from account
     creation).
  3. *Keep both events, alias one to the other server-side* (e.g. `USER_CHANGE_UPPERCUT` becomes a
     thin wrapper that writes to the new palette-slot storage under the hood) — preserves any
     existing client/bot integration while consolidating storage, at the cost of maintaining two
     public event names for one underlying concept indefinitely.

No option above is selected here; this is squarely a product decision for the proposal phase, and
the coordinator's instruction to present findings/options without picking one is followed.

## 10. API — the full CRUD-entity template question, resolved

Previously left unverified; now conclusively answered by a targeted read of `api/app/Repositories/`
and `api/app/Services/`.

- **`api/app/Repositories/` does not exist in this codebase.** Confirmed by `Glob` for
  `api/app/Repositories/**/*.php` returning zero results. The analysis doc's §8.2 suggestion of a
  `api/app/Repositories/UserAvatarPaletteRepository/` directory is **aspirational and does not
  match any existing convention in this repo** — there is no repository abstraction layer
  anywhere in `api/app/`, for any feature.
- **The prevailing pattern for a non-trivial, multi-step per-user feature is: thin Controller +
  plain Service class (no interface, no repository) + Eloquent models used directly, with API
  responses as raw arrays rather than a dedicated `Http\Resources\Json\JsonResource` subclass.**
  Concrete, fully-read example: the NPC catalog-item exchange feature.
  - Service: `api/app/Services/NpcCatalogItemService.php` (306 lines) — a plain class (no
    interface), three public methods (`getNpcCatalogItems`, `checkRequirements`,
    `claimCatalogItem`), each returning a plain associative array shaped
    `{success, message?, ...payload}`. Uses `DB::beginTransaction()`/`commit()`/`rollBack()`
    directly inside the service for the multi-step `claimCatalogItem()` (lines 152-304) — no
    repository indirection over `CatalogItem`, `User`, `UserCatalogItem` (all queried/mutated via
    their Eloquent models directly, e.g. `UserCatalogItem::create([...])` at line 268).
  - Controller: `api/app/Http/Controllers/Api/Game/Npc/NpcCatalogItemApiController.php` — thin,
    constructor-injects the Service (`__construct(NpcCatalogItemService $npcCatalogItemService)`),
    each action method does `Auth::user()` + manual `request('field')` reads (not a `FormRequest`
    class for the API path — see next point), calls the matching service method, wraps the
    result via `$this->successResponse($result)` / `$this->errorResponse(...)`
    (`ResponseApiControllerTrait`). Extensively documented with `@OA\...` l5-swagger annotations
    inline in the controller docblocks (matches `CLAUDE.md`'s note that l5-swagger annotations
    power the API docs).
  - Request: `api/app/Http/Requests/NpcCatalogItemRequest.php` exists and defines
    `rules()`/`attributes()`/`messages()`, but **its `authorize()` calls `backpack_auth()->check()`**
    — this Request class is used by the **Backpack Admin CRUD** controller
    (`api/app/Http/Controllers/Admin/NpcCatalogItemCrudController.php`, not read in full in this
    pass but present per `Glob`), not by the API controller above, which validates inline instead.
    So in this repo's convention, **`FormRequest` classes are the admin-CRUD validation layer;
    player-facing API controllers validate ad hoc inline** rather than via a dedicated API-side
    Request class.
  - Resource: no dedicated `Http\Resources` class for this feature at all — the Service's plain
    arrays are the "resource shape," returned as-is through the success/error trait helpers.
  - Route: not read directly in this pass, but per the controller's constructor-injection pattern
    and `CLAUDE.md`'s statement that `api/routes/api.php` holds the game/public API, a matching
    route entry is the expected remaining piece (unverified line number, but the pattern is
    unambiguous from the controller/service pairing already confirmed).
- **Net implication for this change's design phase**: the analysis doc's proposed shape
  (`api/app/Repositories/UserAvatarPaletteRepository/` + a dedicated
  `UserAvatarPaletteResource.php` + a dedicated API-side `UserAvatarPaletteRequest.php`) is **more
  layered than anything else in this codebase**. Following the doc's shape verbatim would be a
  stylistic departure from the repo's actual convention (thin Service + inline controller
  validation + plain-array responses, no repository, `FormRequest` reserved for Backpack admin
  CRUD). This is a real design-phase choice to surface explicitly — match the doc's aspirational
  layering, or match this repo's actual prevailing convention — not something to resolve silently
  either way in this document.

## 11. Cache-key and version-key extensibility for new artifact types

Previously left unverified; `CacheManager.js`, `AssetVersionManager.js` and
`BackgroundAvatarLoader.js` were read in full for this revision.

- **`CacheManager.js` (IndexedDB layer) is generically key-value and reasonably extensible.**
  `client/src/phaser/managers/CacheManager.js:16-21` defines four fixed IndexedDB object stores —
  `ATLAS` (`atlas_store`), `CONFIG` (`config_store`), `SPREADSHEET` (`spreadsheet_store`),
  `METADATA` (`metadata_store`) — each created with `keyPath: 'key'` plus `timestamp`/`size`/
  `version` indexes (lines 45-56). `storeAsset(key, data, type, metadata)` (line 64),
  `getAsset(key, type)` (line 125), `hasAsset`/`removeAsset`/`removeByPrefix` all accept an
  **arbitrary string `key`**, not a schema tied to avatar IDs specifically. This means **new
  artifact types (a layered manifest, an accessory atlas, an aura sheet) can reuse the existing
  `CONFIG` or `METADATA` stores today, keyed by a distinct string namespace (e.g.
  `hat_minnieHat_atlas_v1`), without any IndexedDB schema migration**, as long as the new keys do
  not collide with the existing `${avatarName}_atlas` / `${avatarName}_spreadsheet` convention
  used by `AvatarManager.js`. Adding a genuinely new **store type** (rather than reusing one of the
  four existing ones) would require bumping `this.dbVersion` (currently hardcoded to `1`, line 9),
  which triggers `onupgradeneeded` for every existing user on their next load — additive and safe
  for existing entries (old stores are untouched by IndexedDB's upgrade mechanism), but is a
  one-time schema-version bump that must be planned for, not silently skipped.
- **`AssetVersionManager.js` (version/invalidation layer) is NOT generically extensible — it is
  hardcoded to the current 17-avatar shape and has no equivalent structure for any other artifact
  type.** `client/src/phaser/managers/AssetVersionManager.js:7-31` defines exactly one dictionary,
  `this.avatarVersions = { base: '1.0.0', avatars: { 1: '1.0.0', ..., 17: '1.0.1' } }`, keyed by
  numeric avatar ID only. `getAvatarVersion(avatarId)` (line 48), `compareVersions()` (line 99),
  `clearAvatarCache()` (line 171, which itself hardcodes `${avatarName}_atlas` /
  `${avatarName}_spreadsheet` key construction, lines 174-183) all assume exactly this one
  dictionary and exactly two cache-key suffixes (`_atlas`, `_spreadsheet`). **There is no dictionary,
  method, or key convention here for a layered-avatar manifest version, an accessory-package
  version, or an aura-sheet version.** Accommodating any of the three new artifact types requires
  writing new code in this file (a parallel dictionary and a parallel `clear*Cache()` method per
  artifact class, or a generalization of the existing single-purpose methods into artifact-type-
  aware ones) — this is not a data-only addition the way the CacheManager side is; it is a real,
  if mechanical, code change. This does not break any *existing* cached avatar entries either way
  (the existing dictionary and methods are untouched by adding new, parallel ones), so there is no
  backward-compatibility risk, only an extensibility gap to close.
- **`BackgroundAvatarLoader.js` is hardcoded to `AvatarEnum` and the `${avatarId}_atlas` texture-key
  convention throughout** (`this.essentialAvatars = [AvatarEnum.GATA, AvatarEnum.RASTA]` at line
  47-49; `Object.values(AvatarEnum)` iterated at lines 92, 142, 374, 381; `${avatarId}_atlas`
  texture-existence checks at lines 94, 115, 295). It has **no equivalent queue/priority mechanism
  for accessories or auras** — a new parallel loader (or a generalization of this one to accept an
  artifact-type parameter) would be needed for accessory/aura background loading; this is a real,
  additional piece of work, not something the existing class can be configured to do without a
  code change. No backward-compatibility risk to existing avatar loading from adding a parallel
  mechanism, since this class does not currently touch anything beyond the 17 known avatar IDs.
- **Net conclusion**: the cache **storage** layer (`CacheManager`) can absorb new artifact types
  with no schema break to existing entries. The cache **versioning and background-loading**
  layers (`AssetVersionManager`, `BackgroundAvatarLoader`) cannot absorb new artifact types without
  new code (new dictionaries/methods, or a generalization), though neither requires breaking or
  migrating any existing cached avatar data to do so — the gap is additive-effort, not
  compatibility risk.

## 12. Live reference-session findings (parent-captured, folded in)

Source: `reference-live-session-brief.md` (orchestrator-captured via Playwright browser tools
against `https://www.boombang.tv/es/game`, guest session, room `Dinoland`). This agent did not
capture these itself; they are recorded here as directed, with the items that change scope or
risk called out against the sections above they affect.

### 12.1 Customization entry point differs from this project's

Reference: `Ajustes` (settings) → tab `Personaje` → "Cambia tu personaje o sus colores" → two
buttons, `Cambiar personaje` / `Cambiar colores` — a **settings-flow sibling of character
selection**, not nested inside it. This project's only comparable surface,
`AvatarSelectionPopup.vue` (§3.5), is a single grid popup reachable from the room HUD with no
settings-flow analogue and no colour-editing concept at all. Scope-affecting: the design phase
must decide whether to mirror the reference's settings-flow placement or extend the existing
popup; this is a genuine open UX-placement decision, not a detail (also recorded as risk item 15
in §7).

### 12.2 Colour editor is a slot-by-slot wizard with per-slot preset curation

Step indicator (`1/5` for the observed character), `Anterior`/`Siguiente`/`Guardar`/`Cancelar`,
prompt sourced from the slot's own `colormeta.labels` value (e.g. "Selecciona el color de tu
**Piel**"), a **per-slot** curated preset-swatch grid (skin tones only while on the skin slot) on
the left, a free HSV colour wheel + brightness strip on the right, and a live animated preview in
the centre. Two consequences worth carrying forward: (a) the per-slot preset curation is UI data
that does not exist in any asset file examined by this agent or by the brief — it would have to
be authored from scratch if replicated; (b) wizard length (`5` here) is driven by the character's
declared slot count, corroborating the "variable slot count per character" finding already in
§2/§3.7 rather than contradicting it.

### 12.3 The editor preview is an isolated PIXI application, not the room's renderer

`window.__LOOK_APP` is a separate PIXI `Application` (own `stage`/`renderer`/`_ticker`) distinct
from the world canvas (`#BoomBangCanvas`, not exposed on `window`). This corroborates the analysis
doc's own recommendation (§11.1) to build a preview component (`AvatarLookPreview.vue`) isolated
from the live room sprite — the reference does exactly that, which is useful confirmation, not new
risk.

### 12.4 Accessory anchoring contract — new information, not previously known to this agent

The reference exposes a debug API, `window.__bbHat` (`set/nudge/get/clear/reset/dump`), which
de-minifies to resolving an accessory's position as a **registration point `(regX, regY)`**,
computed as `override.regX ?? base.regX ?? 0` (same for `regY`) — i.e. an optional per-instance
override layered over an asset-provided base value. `dump()` returned `{}` in the observed
session (empty override table), meaning **the base registration data carried by the asset package
is the normal path**; overrides are an authoring/tuning affordance, not something this
implementation needs to build a UI for. The same mechanism is shared by hats and pets via the
`kind` discriminator already seen in the sampled `meta.json` files (§2: `"kind":"hat"`,
`"kind":"pet"`). This directly informs (without deciding) how any offline-rasterized accessory
atlas built by this project should record its own anchor per frame — it should carry an
equivalent `(regX, regY)`-shaped anchor, not assume a fixed corner/centre origin. This is new
information not derivable from the static asset dump alone (no `regX`/`regY` fields were observed
in the two `meta.json` files this agent read directly) and materially affects the design of any
accessory-frame data structure.

### 12.5 Production auras are consolidated — corrects a previously recorded risk

See §6 and the corrected risk entry in §7 item 9: production loads one `aura.json`/`aura.webp`
pair rather than the three separate wide sheets (`aura_azul`, `aura_dorada`, `aura_electrica`)
seen in the local asset dump. The 8113px-exceeds-`MAX_TEXTURE_SIZE` risk this agent originally
recorded from the local dump is **not applicable to the artifact production actually serves** and
has been downgraded accordingly (still needs measurement of the consolidated sheet's real
dimensions, which the live session did not capture).

### 12.6 Third-party libraries confirmed in the reference client

`@jaames/iro@5` (iro.js, MIT) powers the "Crea tu color" HSV wheel — this project has no
colour-picker dependency today (§3.8, risk item 14). `createjs.min.js` (CreateJS/EaselJS) is also
loaded, which explains the vector `.bb` frame shape (`{d, f, eo}` path/fill/even-odd-rule) and the
`regX`/`regY` naming as EaselJS `DisplayObject` registration-point semantics — useful provenance
for interpreting the asset format (§2, §8 of the asset brief), not a new risk on its own.

### 12.7 What the live session left unresolved (recorded, not resolved here)

- **Z-order of hat vs body vs pet vs aura** could not be read from the runtime (world PIXI app not
  exposed on `window`, no devtools hook installed); only visually inferred from a screenshot (hat
  over the head, pet as a separate ground-level entity beside its owner). Still open — see risk
  item in §4, sub-slice 4.
- **Whether accessories participate in the palette**: no colour-slot reference was found in the
  sampled hat/pet vector frames, and the 5-step wizard was observed for a character with no
  accessory equipped — accessories appear to have fixed colours, but this is "likely, not
  confirmed" per the live-session brief itself, and this agent has no independent way to confirm
  it further.
- **Accessory ownership/economy** in the reference was not observable (guest session, no
  inventory) — the ownership-model mapping in §5 is this repo's own pattern, not a mirror of a
  confirmed reference mechanism, and that distinction is now stated explicitly there.

## 13. Explicitly unverified in this pass (flagged rather than assumed)

- `hat_minnie`/`pet09` vector frame contract (`d`/`f`/`eo` path data) and the `colormeta` open-key
  claim — relied on the pre-extracted brief's direct quotes; not independently re-read from the
  sample JSON files in this pass beyond the two `meta.json` files. The live session (§12.4, §12.6)
  corroborates the EaselJS-shaped provenance of this format but does not substitute for a direct
  re-read of those specific fields.
- Whether `server/src/packages/bots/` emits `USER_CHANGE_UPPERCUT` or any avatar-change event that
  a migration/deprecation of those events (§9.4, option 2) would need to account for — not audited
  in this pass.
- `api/routes/api.php`'s exact route-registration line for the NPC catalog-item endpoints (§10) —
  the controller/service pairing is fully confirmed; the specific route line was not read.
- The consolidated production aura sheet's actual pixel dimensions (§6, §7 item 9, §12.5) — not
  captured by the live session and not measurable by this agent (no asset access).
- Whether `client/package-lock.json` already contains `iro.js` or any colour-picker library
  transitively — inferred absent from `client/package.json`'s dependency list only, not confirmed
  by a lockfile read.
