# Proposal: avatar-color-accessory-system

Bring this project's avatar system up to the reference game (boombang.tv): **layered characters
with per-slot customizable colours**, plus **character accessories** (hat, pet, aura). Evidence
base: `openspec/changes/avatar-color-accessory-system/exploration.md` (cited as §N below).

## Problem

- One `Phaser.Sprite` per user, baked atlas only. `AddUserController.createContainerUser()` builds a
  fixed 4-element container (`spriteShadow, spriteAvatar, nameBackground, nameText`); there is **no
  sub-layer and no accessory hook point** (§3.2). No `.layers`/per-piece assets exist for any avatar (§3.3).
- **No colour customization exists.** `AvatarSelectionPopup.vue` is a 15-slot grid with no colour
  concept (§3.5). The only recolour mechanism, `TintManager` + `rexColorReplacePipeline`, substitutes
  one colour across the **entire sprite frame** and cannot discriminate slot A from slot B (§1).
- The **`guante` (glove) colour** is exactly that fragile mechanism: `TintManager.changeUppercutColor()`
  chains a global `originalColor→newColor` pipeline over the whole avatar. It works only because the
  boxing-glove pixels happen to be the sole region using that source colour (§9.2). It is also **not
  persisted** — `uppercutSelected` is recomputed from `uppercutLevel` on every reconnect
  (`server/src/models/UserModel.js:62`), discarding any in-session choice of a lower tier (§9.2, risk 13).
- Accessories have no ownership type, no renderer, no loader, and no anchor model (§3.7, §11).

## Locked decisions

1. **Glove = palette slot + preserved unlock ladder.** The glove stops being a global colour
   replacement and becomes a real palette slot painted by the layered compositor like every other
   slot (pieces carrying `s: "colorGuante"` or this project's equivalent slot key). The `ringsWon`
   ladder **survives as a gate on which presets that slot offers** — level 9 still unlocks
   `"gold": "Guante de Oro"`. Not free-hex for this slot; the ten named colours
   (`"red": "Guante Rojo"` … `"gold": "Guante de Oro"`, `client/src/assets/lang/es/translations.json:215-224`)
   keep their names and meaning. A new player cannot paint themselves gold on day one.
   - **Persisted default decided here:** first time a user's layered glove slot is resolved with no
     saved value, seed it from their current `uppercutLevel`-derived colour (apparent continuity;
     nothing is persisted today so there is no migration, §9.4). From then on the choice **persists**
     — a deliberate behavioural upgrade over today's per-connection reset (risk 13), required because
     palettes are stored per `(user_id, avatar_id)`.
   - **Baked-renderer characters keep the old path working unchanged.** `TintManager.changeUppercutColor()`
     and both copies of `safeApplyTint` (`AddUserController.js:430-484`,
     `UserChangeAvatarController.js:180-234`) are superseded **only for layered characters**; they stay
     live for every avatar still on the baked renderer. `USER_CHANGE_UPPERCUT` is not removed.
2. **Renderer: layered first.** Per-frame layered container behind a feature flag, shipped together
   with a **new FPS/draw-call measurement harness** that gates go/no-go for wider rollout. The harness
   is a required deliverable — no performance instrumentation exists anywhere today (§6).
3. **Editor: debug panel only.** A developer-grade colour panel proving the round trip live. The
   product wizard is out of scope (see Non-goals). **`iro.js` is not added in this change.**
4. **Accessory ownership: reuse + grant.** `catalog_items.user_decoration_type` with new values
   `avatar_hat`, `avatar_pet`, `avatar_aura`, ownership rows in `user_catalog_items`, seeded/granted
   via existing Backpack admin. **No migration to `catalog_items`** and no purchase/currency flow (§5).
5. **Client test runner added as its own scoped task** (vitest, matching Vite 6). TDD is not waived.

## Scope

Full vertical proof: colours **and** one hat **and** one pet **and** one aura, all live-validatable.

- Layered frame/manifest format + a **layered compositor** with per-frame pivots and explicit
  (repeating) frame-index sequences — `AnimationUtils.setSpriteConfig` applies one offset per whole
  clip and `createAvatarAnimations()` uses `{start,end}` ranges, neither of which can express the
  reference shape (§2, §3.2, risk 6).
- Render-strategy branch in `AvatarManager` (baked vs layered) + accessory child sprites in the user
  container, anchored by an EaselJS-style `(regX, regY)` resolved as `override ?? base ?? 0` (§12.4).
- **Offline rasterization step** for the vector hat/pet packages, starting from the already-present
  `sharp` devDependency and `client/scripts/optimize-images.cjs` as precedent (§3.8, §4.3).
- Palette persistence (server → API → DB) + new socket event pair following `request:`/`response:`
  convention, with a **functional ACK, never a disconnect** (§1, §3.4).
- Accessory listing/ownership endpoints mirroring `SceneUserAvatarsApiController` + an
  `enabledAvatars()`-style helper per kind (§3.7, §5).
- Debug colour/accessory panel; feature flag; measurement harness; vitest setup.

### Non-goals (explicitly deferred)

- **Product colour wizard.** Reference shape, for the follow-up: `Ajustes → Personaje →
  "Cambia tu personaje o sus colores"`, step indicator `1/5`, prompt read from the slot's own
  `colormeta.labels` value (e.g. *"Selecciona el color de tu **Piel**"*), per-slot curated preset
  swatches, free HSV wheel via `@jaames/iro@5`, live preview in an **isolated** PIXI app
  (`window.__LOOK_APP`, separate from the world canvas) (§12.1-§12.3, §12.6).
- Migrating all 17 avatars to layered rendering; accessory purchase economy; accessory recolouring
  (reference accessories appear fixed-colour — "likely, not confirmed", §12.7); removing
  `USER_CHANGE_UPPERCUT`; per-slot curated preset data authoring (exists in no asset file, §12.2).

### Delivery: chained, not one PR

Scope is far over the 400-line review budget and `chainedPrStrategy` is `force-chained`. The work
**will not be narrowed to fit the budget**; it splits into chained work-unit slices each under it.
Indicative order (tasks phase owns the real boundaries): (0) vitest + measurement harness →
(1) layered manifest + compositor, one character, colours incl. `colorGuante` slot + persistence +
debug panel → (2) aura → (3) offline rasterizer + hat → (4) pet. Every slice sits behind the flag.

## Affected areas

| Surface | Touch points |
|---|---|
| `client/` renderer | `AvatarManager.js`, `SmartAvatarSystem.js`, `BackgroundAvatarLoader.js`, `AnimationUtils.js`, `AvatarsDataPreload.js`, new compositor + accessory modules |
| `client/` scene | `AddUserController.js` (container indices, name-tag height math at :310-311), `UserChangeAvatarController.js`, `SceneResponseSockets.js` |
| `client/` cache | `CacheManager.js` absorbs new keys with no schema break; `AssetVersionManager.js` needs new code — it is hardcoded to 17 numeric avatar IDs and the `_atlas`/`_spreadsheet` suffixes (§11) |
| `client/` UI/build | debug panel, feature flag, vitest, `vite.config.js` manualChunks, `scripts/` rasterizer |
| `server/` | `UserModel`, `UserService`/`UserApiService`, new look controller + `scenesSockets.js`, `UserResource.js` |
| `api/` | new palette persistence (thin Controller + plain Service + Eloquent, inline validation, plain-array response — the repo's actual convention; **no `Repositories/` layer exists**, §10), accessory listing, `User.php` helpers, Backpack seeding |
| assets | one layered character package, one hat, one pet, one aura |

## Risks

1. **~500-775 display objects at 25 avatars vs ~100 today** (25 pieces × 25 users) — **accepted risk.**
   Mitigation: feature flag + measurement harness + measured go/no-go before wider rollout (§6).
2. **No client test runner at all** (`client/package.json` has no `test` script, §3.8). If the vitest
   task is cut, **the strict-TDD evidence requirement cannot be met conventionally** for client logic.
3. **`SmartAvatarSystem` key mismatch (confirmed, §1):** avatars are registered by socket id
   (`AddUserController.js:94`) but the ready listener compares `data.userId === user.username`
   (`:545`, and `UserChangeAvatarController.js:297`), so fallback-path upgrades never apply.
   **Expectation: fix it** — the new look/palette broadcast travels these same paths.
4. **Disconnect-on-error (confirmed, §1, §9.2):** `UserChangeAvatarController.js:47-51` and
   `UserChangeUppercutController.js:16-21` call `DisconnectUserController` for *any* error, including
   a rejected selection. **Expectation: do not depend on it** — new controllers use functional ACKs;
   fixing the two existing controllers is desirable but not required by this change.
5. **Glove slot needs metadata no current baked atlas carries** — baked atlases are PNGs with zero
   slot metadata (§3.3), so the glove slot exists only once a character is layered.
6. **Accessory animation coverage 40 keys vs body 15** (`hat_minnie`/`pet09` `meta.json` vs
   `rasta.layers/meta.json`, §2) — behaviour during body specials must be specified.
7. **Consolidated aura sheet dimensions unmeasured** (§7 item 9) — **must be measured against the
   4096px floor before the aura slice ships.**
8. **`avatar_colors` naming landmine:** dead `UserService.create()` references a column that never
   existed (§3.6). Use a distinct name (e.g. `user_avatar_palettes.palette`).
9. `UserResource.js:31` and `:36` both assign `avatar_id` — do not insert a new field between them (§1).

### Open for design phase

- **Accessory z-order** (hat/pet vs body vs aura) is genuinely unresolved: the reference's world PIXI
  app is not exposed on `window`, so it could not be read live (§12.7). Parent's screenshot
  observation only: hat draws over the head, pet draws as a separate ground-level entity beside its
  owner. No comparable attached-companion pattern exists in this repo to infer from.
- Cache-version strategy for the three new artifact classes in `AssetVersionManager` (§11).

## Rollback

The **feature flag is the rollback**: disabled, `AvatarManager` takes the existing baked-atlas branch,
the user container returns to its 4-element shape, and `TintManager.changeUppercutColor()` remains the
glove mechanism — i.e. exactly today's behaviour, since no existing avatar is migrated. Persisted
palettes are additive (new table/column, new socket events); they are ignored when the flag is off and
require no down-migration. Per-slice rollback: revert the slice's chained PR; earlier slices keep
working because each is independently flagged. Zero data loss in all cases — nothing existing is
rewritten, and the glove's pre-change value was never persisted at all.

## Success criteria (live-validatable)

Validated against the running stack (client `http://localhost:8080/`, server `:3000`, api `:8000`,
Docker, account `God`/`test`). **The `client` container serves a build**, so client-side validation
needs an image rebuild or a Vite dev server pointed at that backend.

1. Flag ON: the layered character renders in a public scene at parity with its baked version across
   idle/talk/walk in all directions — no pivot drift, no frame gaps.
2. Changing a colour slot in the debug panel updates the in-room avatar **without sprite replacement**,
   is broadcast to a second logged-in session, and **survives reconnect** (palette persisted).
3. `colorGuante` is painted as a slot; the preset list offered is gated by the account's `ringsWon`
   tier (a low-tier account cannot select `Guante de Oro`); baked-renderer avatars still tint via the
   old uppercut path unchanged.
4. Rejecting an unowned avatar/accessory/invalid palette returns a functional ACK and **the session
   stays connected** (contrast with today's disconnect).
5. One hat, one pet and one aura render, granted through Backpack, anchored via `(regX, regY)`, with
   correct z-order per the design decision, and not shown for users who do not own them.
6. Harness reports FPS and draw calls with ~25 avatars on screen, layered vs baked, and the recorded
   numbers clear the agreed go/no-go threshold.
7. Flag OFF: behaviour is byte-for-byte today's, including glove tinting.
8. `npm test` exists in `client/` and passes; new client logic has RED→GREEN evidence.
