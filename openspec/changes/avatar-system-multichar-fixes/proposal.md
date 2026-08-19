# Proposal: avatar-system-multichar-fixes

## Intent

The layered avatar system shipped in `2026-08-17-avatar-color-accessory-system` is live behind
`VITE_LAYERED_AVATARS` for exactly one character and, in user testing, is visibly wrong in five ways.
This change makes the layered renderer correct and roster-wide: every triggered action plays with the
player's palette intact, the pet keeps one canonical side, the aura draws on top, hats anchor per
character, 14 characters are migrated, and — for the first time — correctness is asserted against
*resolved rendered state* rather than pure functions.

This is a fix-and-complete-scope change against canon specs `avatar-layered-rendering`,
`avatar-accessories`, `avatar-palette`, `avatar-look-protocol`. It amends them; it does not restate
them. Two items are **deliberate reversals** of the previous cycle's documented decisions, not defect
fixes, and must be recorded as such in the spec deltas: aura z-order and pet mirroring.

User evidence (verbatim Spanish, preserved):

> "ahora las acciones como reirse, llorar etc no se lanzan"
> "Yo no hablo de emotes imagenes yo digo que cuando pulso llorar el perosnaje no hase nada no llora"
> "No entiendo como que no estan todo tiene que estar hay porque si entras
> https://www.boombang.tv/es/game entras a sala y realizas accion veras que no aparece nuevos .bb"
> "el pet aparece a la isquerda cuando en realidad deberia simplemente girarse"
> "hay que mirar migrar todos los perosnajes que se pueda"
> "El aura sigue apareciendo por debajo del personaje tiene que salir por encima"
> "el gorro tiene diferente posicionamineot - diseño segun el perosnaje"
> "validarlo todo para que se vea bien en todos los 8 ejex respecto a la sombra cada perosnaje"
> "tienes que mover todos los perosnajes que haya y extraer sus archivos dentro de carpeta"

## Scope

1. **Actions must play, with palette (locked: layered, not baked fallback).** Extend the
   compile-time vector-to-raster path already proven by `compile-accessory.cjs` to the character
   **body**'s action sequences from `personajes/<char>.bb` (`_frames_<seq>.json` `{o,p:[{d,f,eo,c}]}`
   — the identical shape the accessory compiler already rasterizes via `sharp`), so `risa1`, `risa2`,
   `llorar`, `coco`, `escupir`, `ouch`, `punch_*` etc. become real `manifest.sequences` entries with
   `"c":"colorN"` mapped onto the existing slot/tint mechanism. Also: `LayeredAvatar` must emit
   `animationcomplete`, and `resolveFallbackKey`'s silent degrade-to-idle must become observable
   (warn/telemetry) so this class of failure can never again be invisible.
2. **Pet canonical side (locked: manifest-declared).** Each pet package declares its side; the pet
   stays there in all 8 directions and only `flipX` changes. Replaces the antisymmetric-under-
   mirroring rule in `pivot.js` (`resolveAccessoryPlacement`, `clearBodySilhouetteX`) outright.
3. **Aura on top (locked).** Aura depth moves above body **and** hat (`> 1.0 + max(hat zBias)`).
   Anchor stays `(0.5, 0.85)` — independently confirmed in source `effects/aura_electrica.json` —
   unless the artwork disproves it during apply.
4. **Per-character hat anchoring.** Accessory registry/manifest gains a character dimension, since
   `layers-hats.json` gives each character a *different* canonical hat, and `Custom6Hat` is genuinely
   shared by `lilian` and `rasta` and therefore needs a real per-character anchor override, not only
   a character-scoped key.
5. **Migrate 14 characters (locked).** `bommer, brujita, cholo, empollon, gata, india, lilian, marsu,
   modern, ninja, rasta, sally, werewolf, yayo` — every character shipping a `<char>.layers.bb`.
   Staging: unzip each package into `client/.assets-src/layered/<char>/` from
   `/Users/evgeny.lyubeznyy/Downloads/dswmedia_decrypted/personajes/`, then run the existing
   `compile-layered-avatar.cjs <char>` unchanged (its documented input contract matches `.layers.bb`
   contents exactly). Plus per character: 4 registry entries in `AvatarManager.js` and one
   `assetVersionManager.layeredVersions.characters` entry.
6. **Playwright resolved-state validation (locked).** A harness driving each migrated character
   through all 8 directions, asserting `containerUser.list` order and computed `x/y/depth` for body,
   shadow, hat, pet and aura — **numeric state, not screenshots**. `window.game` already exposes
   this via `PerfHarness`; only a parametrized `spawnGhost(avatarId,…)` and a direction/action helper
   are new. Lands early so every character batch is validated against it.
7. **Name reconciliation, as a design deliverable not an apply-time guess.** Resolve source `bommer`
   vs client `boomer`, and map source `sally` — which appears in `layers-index.json` but in **no**
   client roster entry (`AvatarManager.getAvatarName()`) — by comparing `AvatarEnum`/`getAvatarName()`
   against `layers-index.json`. If `sally` maps to no live avatar id it drops out and the batch is 13.
8. **Fix stale `openspec/config.yaml`**: client test command is `cd client && npm run test`
   (vitest 3.2.7); api is `cd api && ./vendor/bin/phpunit`; server has a real `vitest run` too.

## Non-goals

- `skeleton` and `zombie` (no `.layers.bb`; need raster pieces generated from vector data) — named
  follow-up change. `ghost` and `wraith` likewise have no `.layers.bb`.
- `aura_azul` / `aura_dorada` (8113×652, over the compiler's 4096px aura-mode limit). The design doc
  records a one-line decision so this is not re-discovered a fourth time; porting the layered
  compiler's existing multi-page splitting to aura mode is a follow-up.
- Any runtime SVG/vector rendering subsystem. Rejected on evidence: no vector path exists in the
  Phaser client, and per-frame path tessellation would abandon the frozen raster-piece-pool design.
- Baked-atlas emote fallback. Rejected on evidence: the baked path has no multi-slot tint mechanism,
  so it would snap the character to default colours mid-emote — worse than the current no-op and a
  direct violation of palette persistence.
- Server, API and DB surfaces. All six items are client rendering/animation.

## Affected areas

- `client/src/phaser/layered/` — `LayeredAvatar.js` (sequences, `animationcomplete`), `pivot.js` (pet
  side), `AccessoryLayer.js` (aura depth), `fallback.js` (observable degrade), plus tests.
- `client/src/phaser/managers/` — `AvatarManager.js` (14× registry entries), `AccessoryManager.js`
  (character-scoped registry + per-character anchor).
- `client/scripts/` — `compile-layered-avatar.cjs` and/or `compile-accessory.cjs` for body action
  sequences; possible `colormeta.json` derivation.
- `client/src/phaser/debug/PerfHarness.js` — parametrized spawn/direction helpers.
- `client/src/assets/game/avatars/<char>/layers/` — compiled output, tracked (asset bytes).
- `client/.assets-src/layered/<char>/` — raw staging, **already git-ignored** (`client/.gitignore:28-30`
  anticipates exactly this), so ~218MB of source packages add zero tracked repo weight.
- `openspec/config.yaml`; spec deltas under `openspec/specs/avatar-{accessories,layered-rendering}/`.

## Risks

- **Emote pipeline is the largest unknown.** Whether the compiler must neutralize authored per-path
  fill (`"f":"#b88a5c"`) before rasterizing so `setTint` multiplies correctly, or can rasterize at
  authored colour like existing pieces, is unresolved. Same question the accessory pipeline already
  answered once — precedent exists, but it must be answered before batch work.
- **Two apply-phase verifications** the explore phase could not perform (no shell/`unzip`): (a) does
  `colormeta.json` ship inside `.layers.bb`, or must it be derived from `<char>.bb`'s
  `meta.json.colormeta.defaults/labels`? (b) exact hat/pet `.bb` manifest field names. Named
  fallback for both: derive from the sibling vector `<char>.bb`, and assume the shape of the already-
  compiled `hat_minnie.accessory.json` / `pet09.accessory.json`. Neither blocks the proposal.
- **Asset volume.** 1,300–2,204 piece PNGs per character × 14; compiled `.webp` pages enter the
  tracked tree. Per-character compile time and page-count overflow need watching.
- **Reversals may surprise.** Aura-on-top can occlude headwear; pet-fixed-side changes silhouette
  reading in left directions. Both are user-locked; record as intentional in spec deltas.
- **Test-suite blind spot is the top risk.** The client suite went green four times last cycle while
  the game was visibly broken. Any fix here landing with pure-function tests only should be treated
  as unverified.

## Rollback

- Runtime: `VITE_LAYERED_AVATARS=false` restores the baked renderer for all characters instantly, no
  code change — the same kill switch the archived cycle shipped.
- Per character: remove its 4 `AvatarManager.js` registry entries; that character falls back to baked
  while the others stay layered. This is the finest-grained rollback unit and the reason for batching.
- Per item: aura depth and pet side are each a small, isolated revert (one constant; two functions).
- Chained-PR delivery means each slice reverts independently; asset bytes are additive and inert once
  a character is unregistered.

## Success criteria

1. Pressing any action (`llorar`, `risa1`, `risa2`, `coco`, …) on a layered avatar plays that
   animation and returns to idle via `animationcomplete` — asserted on resolved state, not mocks.
2. The player's custom palette is visibly retained for the entire duration of every action.
3. `resolveFallbackKey` degrading to idle is observable in logs/telemetry, never silent.
4. Pet's resolved center-X stays on its declared canonical side across all 8 directions; only `flipX`
   changes. Asserted per direction.
5. Aura is the topmost child of `containerUser.list` after `sort('depth')`, above hat and body.
6. Each character's hat resolves its own anchor; `Custom6Hat` resolves different anchors for `lilian`
   and `rasta`; two characters' packages can never silently collide on one registry key.
7. All migrated characters (14, or 13 if `sally` maps to no avatar id) render layered, and the
   Playwright matrix passes for every character × 8 directions with correct shadow alignment.
8. `openspec/config.yaml` states the real client/server/api test commands.
9. `cd client && npm run test` and `cd api && ./vendor/bin/phpunit` pass.
10. No PR in the chain exceeds 400 hand-written changed lines (generated asset bytes excluded, per
    the archived cycle's precedent).

## Delivery

`force-chained`, 400-line budget on hand-written lines only. Order: (1) shared-infrastructure PR
(pet side, aura depth, character-scoped accessory registry, `animationcomplete`); (2) Playwright
resolved-state harness PR, early so every later slice is gated by it; (3) emote/action compile
pipeline PR (largest); (4) character-migration PRs in batches of 3–4, each independently revertable.
Every child PR carries a dependency diagram marking itself `📍`.
