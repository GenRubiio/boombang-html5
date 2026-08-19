# Exploration: avatar-system-multichar-fixes

> **Round 2 correction notice (read first):** the original round-1 exploration below (section
> "1. Emote/action animations do not play") concluded the missing-emote defect was partly an
> **asset-authoring gap** ("emotes were never compiled into the layered manifest... this is an
> asset-authoring gap upstream of any runtime code"). **The user explicitly rejected that framing**
> and a decrypted asset source has since proven the underlying art exists. That conclusion is
> **corrected in the new "Round 2" section below** — the paragraph is left in place, marked
> struck-through in spirit (not deleted, per instructions), so the reasoning trail is auditable, but
> it must not be treated as current. Everything else in the round-1 findings (items 2, 4, 5, 6, the
> meta-finding, the fallback-to-idle root cause, the missing `animationcomplete` emit) remains valid
> and is unaffected by this correction.

## Source request (verbatim, Spanish — preserved as evidence)

> "acabamos de implementar el nuevo sistema de personaje en ciclo anterior de sdd. Estoy revisandolo
> y ahora las acciones como reirse, llorar etc no se lanzan. El pet cuando caminas abajo y a
> direcciones hacia la derecha hezagonal aaprece bien a la derecha pero cuando camina hegaonal o
> isquerda el pet aparece a la isquerda cuando en realidad deberia simplemente girarse para mirarar
> la direccion isquerda. Ademas tenemos que migrar todos los personajes no solo rasta. El aura sigue
> apareciendo por debajo del personaje tiene que salir por encima. Recuerda que el gorro tiene
> diferente posicionamineot - diseño segun el perosnaje. Recuerda validarlo todo para que se vea bien
> en todos los 8 ejex respecto a la sombra cada perosnaje"

**Round 2 correction from the user (decisive, verbatim, Spanish — preserved as evidence):**

> "No entiendo como que no estan todo tiene que estar hay porque si entras
> https://www.boombang.tv/es/game entras a sala y realizas accion veras que no aparece nuevos .bb"

> "Yo no hablo de emotes imagenes yo digo que cuando pulso llorar el perosnaje no hase nada no
> llora"

Reading of these two quotes together, treated as ground truth for this change: the live reference
game (`boombang.tv`) fetches **no new `.bb` file** when an action is triggered — proving the action
art is already inside the character's already-loaded package, not a separate emote download. The
user's complaint was never "the emote art doesn't exist" — it is "pressing 'cry' makes the character
do nothing." The requirement is therefore: **every action the player triggers must actually play,
and must respect the player's current custom palette** — sourced from data that demonstrably already
exists client-side in the reference game, not from newly authored art.

This is a direct follow-up to the archived change `2026-08-17-avatar-color-accessory-system`
(`openspec/changes/archive/2026-08-17-avatar-color-accessory-system/`), whose specs are now canon at
`openspec/specs/avatar-layered-rendering/`, `openspec/specs/avatar-accessories/`,
`openspec/specs/avatar-palette/`, `openspec/specs/avatar-look-protocol/`. Feature flag
`VITE_LAYERED_AVATARS` is `false` in `client/.env.example` but `true` in the untracked
`client/.env.local`, so the layered path is what the user has actually been testing.

## Meta-finding: the previous cycle's safety net does not catch what actually broke

`verify-report.md` from the archived change already predicted this, explicitly, before this change
was even requested (its "central finding" section):

> "If all three `.sort('depth')` calls were removed today, the existing 'hat depth > body depth'
> test would still pass in full ... while the hat, pet and aura would silently render behind the body
> again ... This is the one regression class in this change that a full code-level revert would slip
> past every automated gate."

It also disclosed the client suite went green **four separate times** during that cycle's own
apply/verify passes while the running game was visibly broken (half-size avatar, palette not applied
on entry, hat floating detached, hat occluded behind body) — because every automated assertion in
`client/src/phaser/layered/*.test.js` calls **pure functions** (`resolveFallbackKey`,
`resolveAccessoryPlacement`, `reflectSpan`, `expandSequence`, `resolvePalette`...) fed either
hand-built fixtures or the real compiled manifest JSON — never a live `Phaser.Scene`, never a
resolved `Container.list` render order, never an actual on-screen pixel offset, never actual
`sprite.play()` → `animationcomplete` event flow. `mirroredDirections.integration.test.js` is the
closest thing to an end-to-end check and it is still pure-function-only (it re-derives depths/keys
from JSON, it does not instantiate anything and look at what would be drawn).

**All six items reported by the user reproduce inside code paths that the current test suite cannot
see**, for exactly the reason above. Two are outright *design decisions from the previous cycle*
that the user is now asking to reverse (aura depth, pet-side mirroring), not "bugs that slipped
through" — see items 2 and 4 below.

**Requirement for spec/design phases:** every fix in this change needs an assertion on *resolved
rendered state* — actual `Container.list` order after `sort('depth')`, actual computed screen
`x/y` for a pet/hat/aura sprite in a live (or live-like, e.g. Playwright-driven) scene, actual
`sprite.play()` → completion → idle transition — not merely a pure-function unit test proving the
math is internally consistent. A pure-function test proved correct exactly this same class of defect
"fixed" in the last cycle while the feature was broken on screen four times. **Round 2 reinforces
this further: see the new "Playwright validation feasibility" subsection below, which found the
exact live hook (`window.game`) needed to finally close this gap, at zero new instrumentation
cost.**

---

## 1. Emote/action animations do not play (laugh, cry, etc.)

**Trigger path (confirmed end to end):**
`UserSendEmojiController.main` (`client/src/phaser/controllers/scene/UserSendEmojiController.js`)
→ `UserEmojiAnimation.main` (`client/src/phaser/animations/UserEmojiAnimation.js:36-37`) →
`AnimationUtils.setSpriteConfig(sprite, avatarId, textureKey)` →
`sprite.play(\`${avatarId}_${textureKey}\`, false)`. `UserCocoAnimation`,
`UserInteractionAnimation`, `UserUppercutAnimation`, `UserChatAnimation`, `UserWalkAnimation` all
follow the identical two-call shape (confirmed by reading `UserCocoAnimation.js`).

**Root cause (confirmed, unchanged by round 2):**

- `AnimationUtils.setSpriteConfig` (`client/src/utils/AnimationUtils.js:10-12`) branches on
  `spriteAvatar.isLayered` and returns immediately via `LayeredAvatar.applyClipConfig()`, a no-op.
- `sprite.play(key)` for a `LayeredAvatar` resolves through `LayeredAvatar.play()`
  (`client/src/phaser/layered/LayeredAvatar.js:395-437`), which calls
  `resolveFallbackKey(manifest.sequences, textureKey, direction, manifest.mirrors)`
  (`client/src/phaser/layered/fallback.js:18-25`). If `textureKey` (e.g. `risa1`, `risa2`, `llorar`,
  `down_coco`) is not a key in `manifest.sequences` **and** not a key in `manifest.mirrors`, the
  function silently returns `${currentDirection}_idle`, or `down_idle` — **no error, no signal, the
  avatar just stays in idle**, which is exactly the reported symptom ("no se lanzan" / "no hase
  nada").
- Checked the actual compiled manifest: `client/src/assets/game/avatars/rasta/layers/
  rasta.layers.manifest.json` — grepped for `risa`, `llorar`, `coco`, `escupir`, `provocar`: **zero
  matches**. Its `sequences` only cover the 8-direction `idle`/`walk`/`talk` triplet.

**~~Round 1 conclusion, corrected below — struck in spirit, kept for the audit trail~~:** ~~"Traced
one level deeper into the asset pipeline: `client/.assets-src/layered/rasta/*.json` (the compiler's
own source input) contains only `down_idle.json`, `down_walk.json`, `down_talk.json` and their
direction siblings — no `risa1`/`risa2`/`llorar`/`down_coco`/etc. source files exist for the body at
all. This is an asset-authoring gap upstream of any runtime code."~~ **This was correct as a
statement about the currently-staged `client/.assets-src/layered/rasta/` directory, but wrong as a
conclusion about the game — see "Round 2" below: the missing pieces are not missing from the
reference game's real asset set, they were simply never part of what got staged/compiled for the
layered body pipeline in the first place, because the layered *body* pipeline (raster pieces) and
the *emote* animations live in two different source packages upstream (`<char>.layers.bb` vs.
`<char>.bb`), and only the first was ever staged.**

**Secondary, still-valid finding — the completion callback would not fire even if the animation
played:** `UserEmojiAnimation.js:38` and `UserCocoAnimation.js:17` both do
`sprite.once('animationcomplete', () => UserIdleAnimation.main(...))`. `LayeredAvatar` never calls
`this.emit('animationcomplete', ...)` anywhere in `LayeredAvatar.js` — its `tick()` method
(`LayeredAvatar.js:443-461`) just sets `_playing = false` and stops on a non-repeating sequence's
last frame, with no event. **This still needs fixing regardless of how the emote data itself is
delivered** — whatever mechanism ends up playing `risa1`/`llorar`/etc. on a layered avatar must also
emit `animationcomplete` (or the callers must be adapted), or the avatar freezes on the last frame
of the emote forever instead of returning to idle.

**See the new "Round 2" section below for the corrected diagnosis of where the real gap is, and
what delivering these animations with palette fidelity actually requires.**

---

## 2. Pet flips to the wrong side instead of just turning

**Reported behaviour:** walking down / right-diagonal → pet correctly on the right.
Walking left / left-diagonal → pet moves to the left side entirely, instead of staying on the
avatar's (consistent) side and just turning to face left.

**Root cause, confirmed as an explicit prior design decision, not an accidental bug:**
`resolveAccessoryPlacement` (`client/src/phaser/layered/pivot.js:203-223`) computes `regX` by
reflecting the accessory's registration point about the body's own origin **only when the direction
is a synthesized mirror** (`right*` family): `regX = mirrored ? reflectPoint(accFrame.regX,
bodyOrigin[0]) : accFrame.regX`. For **authored, non-mirrored** directions — `left`, `leftdown`,
`leftup`, and `down` — `regX` is taken directly from the accessory package's per-frame data with no
correction at all. Then `clearBodySilhouetteX` (`pivot.js:271-277`) pushes the pet clear of the
body's silhouette **"on whichever side it is already closer to"** — its own docblock states this
was done deliberately "preserving the antisymmetric-under-mirroring property the coordinator asked
to keep" (`pivot.js:256-261`).

Net effect: whichever side the raw per-frame authored data for `left`/`leftdown`/`leftup`/`down`
happens to place the pet on is the side it renders on, with no cross-direction consistency
enforced. This is exactly the reported symptom, and the previous cycle's own code comment shows it
was an intentional trade-off ("coordinator asked to keep") rather than an overlooked edge case —
this change is asking to reverse that specific decision.

**Test coverage is aligned with the current (to-be-changed) behaviour, not the desired one:**
`mirroredDirections.integration.test.js` asserts direction-key resolution and accessory-anim
coverage per direction, but has **no assertion at all about which side of the body the pet's
resolved `x` lands on** across the 8 directions — so nothing in the current suite would fail either
before or after a correct fix.

**LOCKED DECISION (user, round 2):** each pet package declares its **canonical side**; the pet stays
on that side in all 8 directions and only `flipX` changes to face left. This replaces the
deliberate antisymmetric-under-mirroring rule in `pivot.js` outright — it is not a compromise
between the two behaviours. See the new "Round 2 §4 — pet side data" subsection below for what the
decrypted `pet09.bb`/`pet10.bb` packages could carry for this field, and what could not be
independently confirmed with the tools available to this exploration.

---

## 3. Only `rasta` is migrated to the layered system — full roster inventory

**Confirmed full census roster** (`AvatarManager.getAvatarName()`, `client/src/phaser/managers/
AvatarManager.js:812-833`), 17 characters, each with its own `Avatar<Name>Load.js` loader
(`client/src/phaser/load/avatars/`) and its own `client/src/assets/game/avatars/<name>/` asset tree
(`config.json`, `sprites/<direction>_<action>/*.png`, baked `animations/atlas.json` +
`spritesheet-*.webp`):

`boomer`, `brujita`, `cholo`, `empollon`, `gata`, `ghost`, `india`, `lilian`, `marsu`, `modern`,
`ninja`, `rasta`, `skeleton`, `werewolf`, `wraith`, `yayo`, `zombie`.

**Confirmed migrated to layered rendering today:** only `rasta`, unchanged by round 2 — see
`LAYERED_CHARACTERS` (`AvatarManager.js:27-29`), the single `layers/` output directory, and the
single staged `.assets-src/layered/rasta/` input directory.

**LOCKED DECISION (user, round 2):** migrate the **14 characters that have a `.layers.bb`** in the
decrypted source (see "Round 2" below for the full inventory: `bommer, brujita, cholo, empollon,
gata, india, lilian, marsu, modern, ninja, rasta, sally, werewolf, yayo`). `skeleton` and `zombie`
are explicitly **out of scope for this change** and deferred to a follow-up, because they have no
`.layers.bb` at all (only their vector `.bb`) and would need raster pieces generated from vector
data first — a materially different, larger effort than "unzip and compile," and the user's decision
correctly separates it rather than blocking this change on it.

Note the client's existing `boomer` (baked asset folder name) vs. the decrypted source's `bommer` —
this spelling difference needs to be resolved explicitly in the design/apply phase (confirm whether
these are the same character under two spellings, by comparing `AvatarEnum`/`getAvatarName()`
against `layers-index.json`, rather than assumed).

**What migrating each character now concretely needs, corrected from round 1's more speculative
list** — see the new "Round 2 §1 — staging the assets" subsection for the full mapping from `.bb`
contents to the existing compiler's exact input contract; the short version is: **unzip the
`.layers.bb` into `client/.assets-src/layered/<character>/`, then run the existing
`compile-layered-avatar.cjs <character>` unchanged** — no new unpack-format code is needed for the
per-character body pipeline. What is still uncertain (needs the apply phase's shell/unzip access to
confirm, not resolvable with this exploration's tools) is whether `colormeta.json` — a file the
compiler requires and reads directly (`compile-layered-avatar.cjs:93`) — ships inside each
`.layers.bb`, or must be derived from the sibling vector `<char>.bb`'s embedded
`meta.json.colormeta.defaults/labels` (confirmed present in `rasta.bb` per the coordinator's
message). This is called out explicitly as an open question below, not assumed either way.

Per-character accessory anchoring (hat/pet) and the emote/action delivery mechanism remain
additional, separate pieces of per-character work — see items 1, 2, 5 and the Round 2 sections.

---

## 4. Aura renders below the character, needs to render above

**Confirmed current behaviour is exactly what the archived design intended, not a bug that slipped
through the mechanism:** `AccessoryLayer.createAura()`
(`client/src/phaser/layered/AccessoryLayer.js:13-18`) sets `sprite.setDepth(0.2)`, with the
depth table from the archived `design.md` §1 explicit: `0.0 spriteShadow → 0.2 aura → ... → 1.0
body`, documented rationale: "above the shadow ... behind the body, which matches its `(0.5,
0.85)` anchor placing it around the feet." The one-time `containerUser.sort('depth')`
(`AddUserController.js:168-170`) then places it correctly behind the body per that depth value —
the **mechanism is working correctly**; the **depth value itself is the wrong requirement now**.

This item is a **reversal of a previous design decision**, not a defect fix.

**LOCKED DECISION (user, round 2):** aura renders **above everything** — above the body AND above
the hat. Anchor stays as-is (`0.5, 0.85`) unless the artwork disproves it during apply. Round 2
independently confirmed the anchor value in the decrypted source itself:
`effects/aura_electrica.json` (plain, uncompressed JSON — not inside a `.bb`) declares
`"anchor": {"x": 0.5, "y": 0.85}`, matching the compiled `auraElectrica.accessory.json` exactly. So
the anchor does not need to change for the z-order fix; only the depth constant does (something
`> 1.0 + max(hat zBias)`, decided in design).

**No per-frame or per-direction complication here** — aura depth is static (unlike hat's `zBias`
and pet's dynamic flip), so this is a small, contained change: one depth constant, plus updating the
frozen `avatar-accessories` spec's documented z-order requirement (ACC5). See the new "Round 2 §5 —
aura packages" subsection for the full decrypted `effects/` inventory, including independent
confirmation of a previously-known blocker (`aura_azul`/`aura_dorada` at 8113×652px, over the
compiler's 4096px hard-fail limit) that this change does not need to solve but should not
silently ignore either.

---

## 5. Hat anchor differs per character — data model does not support it

**Confirmed:** `AccessoryManager` (`client/src/phaser/managers/AccessoryManager.js:43-56`) keys
`hasPackage`/`getAtlasKey`/`getManifest` purely on `(kind, key)` — e.g. `('hat', 'hat_minnie')` —
with **no character dimension anywhere in the registry or the on-disk path**
(`client/src/assets/game/accessories/hat/hat_minnie/hat_minnie.accessory.json`). The compiled
manifest does carry a `"char":"rasta"` field, but nothing reads it at lookup time — it is
descriptive metadata only.

**Round 2 independently confirms the premise, from the game's own decrypted source structure, not
just from the archived verify-report's warning:** hats and pets are authored **per character on
disk** in the decrypted source — `personajes/<char>/hat/<HatName>.bb` and
`personajes/<char>/pet/<petNN>.bb`, confirmed present for `lilian`, `rasta`, `yayo`, `india`,
`bommer`, `modern` (e.g. `rasta/hat/pandaHat.bb`, `rasta/hat/minnieHat.bb`,
`rasta/hat/Custom6Hat.bb`, `yayo/hat/bullHat.bb`, `yayo/hat/infernoHat.bb`, `india/hat/cacaHat.bb`,
`modern/hat/cacaHat.bb`). `layers-hats.json` additionally declares **one canonical hat per
character** for the 15-hat "layers" set (`bommer→rabbitHat`, `brujita→pineappleHat`,
`cholo→mickeyHat`, `empollon→RedTeam`, `gata→pumpkinHat`, `india→bullHat`, `lilian→BlueTeam`,
`marsu→minnieHat`, `modern→strawberryHat`, `ninja→infernoHat`, `rasta→pandaHat`,
`skeleton→flag01`, `werewolf→xmasGreenHat`, `yayo→frogHat`, `zombie→cacaHat`) — this is a
**different hat per character**, not the same `hat_minnie` reused, which independently confirms the
same-hat-different-anchor framing was even understating the problem: for the layered-hats set, each
character doesn't just need a different anchor for a shared hat, it wears a **different hat
entirely**. `layers-pets.json` similarly shows only 2 of the 14 characters have a declared pet
(`cholo: ["pet01","pet02"]`, `rasta: ["pet01"]`) — pets are not universal across the roster either.

**Could not independently confirm with this exploration's tools:** the exact anchor/registration
field names inside a hat `.bb`'s manifest (e.g. `personajes/rasta/hat/minnieHat.bb`). These
archives' JSON payloads are DEFLATE-compressed inside the ZIP container; the tools available to
this exploration (`Read`/`Grep`/`Glob`, no shell/`unzip`/Node access) can only see ZIP **filenames**
(stored uncompressed in the ZIP format by spec — confirmed by grepping literal substrings like
`meta.json` and getting a match) but cannot decompress the DEFLATE-compressed JSON **payloads**
themselves (confirmed: grepping content-mode for `regX`/`anchor`/`scale` inside
`rasta/hat/minnieHat.bb` triggered ripgrep's binary-content guard rather than returning text). **This
is an honest tooling limitation of the explore phase, not a claim that the data doesn't exist** — an
apply-phase agent with shell access can run `unzip -p rasta/hat/minnieHat.bb meta.json` (per the
coordinator's own confirmation that this works directly) to get the real field names. Until then,
the design phase should assume the hat/pet manifest shape is close to the already-compiled
`hat_minnie.accessory.json`/`pet09.accessory.json` (`base:{regX,regY,scale,zBias}` + per-frame
overrides, per the archived design.md §3.2), since those two compiled packages were themselves
produced by the same `compile-accessory.cjs` pipeline from the same kind of source package.

**What the fix needs, unchanged from round 1's conclusion, now with harder evidence for the "how
common is this" question:** either restructure the accessory registry/manifest to carry a
per-character anchor table, or scope the registry key itself by character
(`${character}:${kind}:${key}`, per the archived verify-report's own suggested precondition). Given
round 2's finding that the layered-hats set is **one specific hat per character**, not a shared hat
worn by multiple characters, the simpler fix may actually be: scope the registry key by character
from the start (since there is no cross-character sharing to preserve for this specific 14-hat set),
while leaving room for the general "same accessory, multiple characters, different anchor" case
(e.g. `Custom6Hat`, confirmed present under both `personajes/lilian/hat/Custom6Hat.bb` and
`personajes/rasta/hat/Custom6Hat.bb` — an actual cross-character-shared accessory in the source,
which DOES need a real per-character anchor override, not just per-character key scoping. This is a
design-phase decision, not resolved here.)

---

## 6. Full 8-direction × shadow validation — what tooling exists today

**Existing tooling, confirmed by reading it, unchanged by round 2:**
- `client/src/phaser/layered/mirroredDirections.integration.test.js` — vitest, runs against the
  **real compiled** `rasta` body manifest + `hat_minnie`/`pet09`/`auraElectrica` accessory
  manifests, asserting direction-key resolution and per-direction accessory-anim coverage across
  all 8 directions. Pure-function/data-only — no live render, no pixel check, no `Container` child
  order, no shadow-position comparison.
- `client/src/phaser/layered/pivot.test.js`, `fallback.test.js`, `sequence.test.js`,
  `manifestValidation.test.js`, `paletteResolve.test.js`, `LayeredAvatarRegistry.test.js`,
  `AssetVersionManager.test.js`, `lookCacheKeys.test.js`, `__smoke__.test.js`,
  `perfEvaluate.test.js`, plus `client/src/utils/DarkeningUtils.test.js` — 12 client test files
  total, all pure-function, none instantiate Phaser.
- `client/src/phaser/debug/PerfHarness.js` + `perfEvaluate.js`, gated by `VITE_PERF_HARNESS=true`
  and exposed as `window.__perf` — measures FPS/object counts, not visual correctness.
- `client/src/views/components/game/debug/AvatarLookDebugPanel.vue`, gated by
  `VITE_AVATAR_LOOK_DEBUG=true` — manual tool, not a repeatable regression check.

**Round 2 finding — Playwright validation is feasible TODAY, at zero new instrumentation cost, via
an existing global:** `PerfHarness._findActiveScene()`
(`client/src/phaser/debug/PerfHarness.js:22-27`) reads `window.game.scene.getScenes(true)` and
finds the scene owning `scene.users` — confirming `window.game` is **already** a live global
exposing the running Phaser game instance (confirmed by grep: `window.game` is referenced directly
in `PerfHarness.js`, and `window.__perf`/`window.avatars_config` patterns are established precedent
for reading/driving the game from outside Phaser's own code). `_countDisplayObjects()`
(`PerfHarness.js:32-55`) further shows the exact shape a Playwright script would walk:
`scene.users[socketId].containerUser` is a real `Phaser.GameObjects.Container` whose `.list` array
**is** the resolved render order (after any `sort('depth')` call), and each child in that list
exposes `.x`, `.y`, `.depth`, `.texture.key` directly — precisely the "resolved container/child
order and computed on-screen x/y for body, shadow, hat, pet, aura" the user's locked decision #5
asks for. A Playwright `eval` call today, with no new client code, could already run:
`window.game.scene.getScenes(true)[0].users[<id>].containerUser.list.map(c => ({key: c.texture &&
c.texture.key, x: c.x, y: c.y, depth: c.depth}))` and get real numeric state — not a screenshot.

`PerfHarness.spawnGhosts(n)` (`PerfHarness.js:61-95`) is additionally a ready-made template for
driving N synthetic avatars through the **real** `AddUserController.processUser` path without a
live multiplayer session — it is currently hardcoded to `avatar_id: 12` (`rasta`) with a comment
`// a compiled/loaded character in the running scene`, so a validation harness would need this
parametrized by `avatarId` to cover all 14 migrated characters, and would need an equivalent way to
force each spawned avatar through all 8 directions deterministically (e.g. calling
`UserWalkAnimation.main`/`layeredAvatar.play('<direction>_idle')` directly per ghost, since these
are plain method calls reachable the same way `spawnGhosts` already reaches
`AddUserController.processUser`).

**LOCKED DECISION (user, round 2):** validation is **Playwright-driven resolved-state assertions**
— walk each character through all 8 directions and assert resolved container/child order and
computed on-screen x/y for body, shadow, hat, pet, aura. **Numeric state, not pixel screenshots** —
this matches exactly what `window.game`/`containerUser.list` already exposes, so no new debug
surface is strictly required, though a small ergonomic helper (parametrized `spawnGhost(avatarId, x,
y)` + a `setDirection`/`playAction` helper, both trivial wrappers over existing methods) would make
a 14-character × 8-direction matrix practical to drive from a single Playwright script rather than
hand-composing `eval` calls per case.

**Runtime-sanity note for the 14×8 matrix:** 112 (character × direction) cases, each needing at
minimum a spawn + a direction-set + a resolved-state read, is well within Playwright's normal
budget for a single scene if driven via `eval`/`spawnGhosts`-style in-page calls rather than 112
separate browser sessions — consistent with how the archived cycle's own perf harness already
validated 25 simultaneous avatars in one page load. This is a design/apply-phase sizing question,
not a blocker discovered here.

---

## Round 2: decrypted asset source — corrected findings

### Source location and integrity (verified by the parent, re-confirmed independently where tools
allowed)

Two sibling trees:
- `/Users/evgeny.lyubeznyy/Downloads/dswmedia_decrypted` (218M, 509 files, 466 `.bb`) — authoritative.
- `/Users/evgeny.lyubeznyy/Downloads/dswmedia` (219M) — pre-decryption sibling, not used further.

`dswmedia_decrypted/_README.md` (read directly, plain markdown, confirms the parent's summary
exactly): 466/466 archives decrypted, 29,436 entries, 461,156,362 uncompressed bytes, 0 failures.
`.bb` files are ZIP containers with paths/compression preserved from the original.

**Tooling limitation, stated plainly:** this exploration's toolset is `Read`/`Grep`/`Glob`/`WebFetch`
only — no shell, no `unzip`, no Node `zip` library access. ZIP **filenames** are stored uncompressed
by the ZIP format itself, so `Grep` can confirm a name like `meta.json` exists as a byte-string
somewhere in an archive (files-with-matches mode returned a hit for this on
`personajes/rasta.layers.bb`, `personajes/rasta/hat/minnieHat.bb`, and
`personajes/rasta/pet/pet09.bb`), but the JSON **payloads** themselves are DEFLATE-compressed and
this toolset cannot decompress them — content-mode greps for specific field names
(`regX`/`anchor`/`side`/`_frames`) inside `.bb` files consistently hit ripgrep's binary-content guard
rather than returning readable text. Everything below that is stated as fact about the internal
*shape* of a `.bb` package's JSON content (as opposed to which filenames exist) is either (a)
supplied directly by the coordinator's message (who evidently ran `unzip -p` or equivalent, with
shell access this exploration agent does not have) and is treated as verified ground truth per this
task's framing, or (b) explicitly marked below as **not independently confirmable with this
exploration's tools** and left as an open question for the design/apply phase, which will have shell
access.

### §1 — Staging the assets: does `.layers.bb` match the compiler's input format?

**Yes, exactly, confirmed by reading the compiler's own source
(`client/scripts/compile-layered-avatar.cjs`), not assumed:**

```
Input:  client/.assets-src/layered/<character>/  (_frames.json, p*.png, <anim>.json,
        colormeta.json, meta.json)
```
(`compile-layered-avatar.cjs:7-8`, its own header comment, matching the code that follows exactly:
line 92 reads `meta.json`, line 93 reads `colormeta.json`, line 94 reads `_frames.json`, line 104
reads `${key}.json` for every key in `meta.json.anims`, and the piece PNGs are read by filename
`p${l.p}.png` derived from `_frames.json`'s own piece references, lines 122-131.)

The coordinator's message describes each `<char>.layers.bb` as containing exactly this: `meta.json`,
`_frames.json`, per-sequence JSONs, and 1,300-2,204 piece PNGs (`p0.png`...`pN.png`) — and quotes
`rasta.layers.bb`'s own `meta.json` verbatim: `{"char":"rasta","layers":true,"ss":2,"anims":
{"down_idle":1,"down_talk":8,"down_walk":13,...},"uniqFrames":103}` — the exact `meta.json.anims`
shape the compiler code at line 100 (`Object.keys(meta.anims)`) consumes directly, and the exact
`ss:2` value the compiler hard-asserts at line 96-98.

**Conclusion: no new unpack-format code is needed for the per-character body pipeline.** Staging is:
unzip `<char>.layers.bb` directly into `client/.assets-src/layered/<character>/`, then run
`node scripts/compile-layered-avatar.cjs <character>` unchanged. This directly corrects round 1's
framing of the emote gap as partly an "asset-authoring gap upstream of any runtime code" — the
*body* piece art for walk/idle/talk was correctly identified as present and stageable; what round 1
got wrong was implying a similar gap for emotes, which live in a different, sibling package (see §2
below), not a missing-art problem at all.

**One field this exploration could not confirm inside `.layers.bb`:** whether `colormeta.json` — a
file the compiler reads directly and requires (`compile-layered-avatar.cjs:93`,
`readJson(path.join(inputDir, 'colormeta.json'))`, with no fallback) — actually ships as a top-level
member of each `.layers.bb`. The coordinator's inventory of `.layers.bb` contents (§ description
above) did not explicitly list `colormeta.json` among the files, only `meta.json`, `_frames.json`,
per-sequence JSONs, and piece PNGs. It may be present and simply not called out, or it may need to
be **derived from the sibling vector `<char>.bb`'s own `meta.json.colormeta.defaults`/`.labels`**
(confirmed present in `rasta.bb`'s `meta.json` per the coordinator's message: `color1..color7`,
`colorGuante`, with labels `piel`/`rastas`/`cinta`/`bañador`/`ojos`/`guante`). Either is plausible
and reconcilable with the existing compiler (which only cares that a `colormeta.json` file exists at
the expected path, not where its data originally came from) — **this is an explicit open question
for the design/apply phase to resolve with real `unzip -p` access, not assumed either way here.**

**Repo-weight note:** `client/.gitignore:28-30` already git-ignores `client/.assets-src/` with a
comment anticipating exactly this scenario ("decrypted source archives, never a committed
artifact... design.md §3"). Staging all 14 characters' raw packages there is therefore safe and
matches existing convention — it will not add to the tracked repo's size. Only each character's
*compiled output* (`.webp`/`.atlas.json`/`.manifest.json` under `src/assets/game/avatars/<char>/
layers/`) lands in the tracked tree, exactly as `rasta`'s already does. Total uncompressed bytes
across the whole decrypted source (461MB) or the `personajes/` subset specifically could not be
broken out per-character with the tools available here (no `du`/shell); the coordinator's figures
(218-219MB total decrypted tree, 1,300-2,204 piece PNGs per `.layers.bb`) are the only size data
available and should be treated as the basis for repo-weight planning, not a precise per-character
figure.

### §2 — Emote/action delivery path (corrected diagnosis)

**Where the trigger currently dies:** unchanged from round 1 — `LayeredAvatar.play()` →
`resolveFallbackKey()` silently degrades any key absent from `manifest.sequences`/`manifest.mirrors`
to `${direction}_idle`/`down_idle`, and `LayeredAvatar` never emits `animationcomplete`. See item 1
above.

**Corrected source of the missing data:** the vector `<char>.bb` package (sibling to
`<char>.layers.bb`, NOT the same package) contains **every** animation, including all emotes, as SVG
path frame data with an explicit colour-slot reference per path — confirmed by the coordinator's
direct inspection of `rasta.bb`: 83 JSON + 17 `.bin`, **zero PNGs**. Per sequence:
`<seq>.json` is a literal frame-index array (e.g. `down_risa1.json` = `[0,0,1,2,...]` — the exact
"explicit frame-index sequence, never a `{start,end}` range" contract the frozen
`avatar-layered-rendering` spec (LR1) already requires for the layered body), and
`_frames_<seq>.json` holds arrays of `{"o":[x,y],"p":[{"d":"M38.65 90.8L…","f":"#b88a5c","eo":1,
"c":"color1"}, ...]}` per frame — SVG path `d`, a fill colour `f`, an even-odd flag `eo`, and
**critically, a `"c":"color1"` colour-slot reference per path** tying that specific path to the
palette system (`colormeta.defaults`/`labels`) already used by the layered body and by
`avatar-palette`'s frozen spec.

`rasta.bb`'s `meta.json` carries `colormeta.defaults` (`color1..color7`, `colorGuante`),
`colormeta.labels` (`color1`=piel, `color2`=rastas, `color3`=cinta, `color5`=bañador, `color7`=ojos,
`colorGuante`=guante), `creatorIdx`, and an `anims` map with frame/unique counts. Confirmed
animations present include (not exhaustive, per the coordinator's own listing):
`cara_grande`, `cara_mediana`, `cara_peque`, `cayendo`, `down_coco` (59f/25u), `down_idle`,
`down_llorar` (39f/38u), `down_ouch` (39f/26u), `down_risa1` (40f/30u), `down_talk`,
`down_trampa` (100f/48u), `down_walk`, `espejo`, `ficha`, `flower_power`, `leftdown_escupir`,
`leftdown_idle`, `leftdown_pedo`, `leftdown_punch_doy` (210f), `leftdown_punch_rec` (400f),
`leftdown_talk`, `leftdown_walk`, `leftup_idle`, `leftup_special`, `leftup_talk`, `leftup_walk`,
`left_beber`, `left_beso`, `left_fall`, `left_falling` — this list (confirmed by directly grepping
filenames inside `rasta.bb`, e.g. `left_risa2`, `left_redbull`, `down_ouch`, `down_trampa`,
`leftdown_punch_doy`, `leftdown_punch_rec`) matches, key-for-key, the **baked** `config.json`'s own
animation keys already read in round 1 (`client/src/assets/game/avatars/rasta/config.json` —
`risa1`, `risa2`, `llorar`, `down_coco`, `escupir`, `pedo`, `left_beber`, `left_beso`,
`left_punch_doy`, `left_punch_rec`, `redbull`, `special`, etc.) — strong corroborating evidence that
`<char>.bb` is the same authoritative animation set the (already-shipped) baked renderer's
`config.json`/atlas was itself generated from, just kept in its original per-path vector form rather
than pre-rasterized.

**What the client would need to actually play these, with palette fidelity — the real design
question, not resolvable here, but scoped precisely:**

1. **No existing vector/Graphics rendering path in the Phaser client** was found for avatars.
   Grepped the client's `phaser/` tree for anything resembling runtime SVG/path rendering of avatar
   pieces (Phaser `Graphics` objects driving per-frame path fills) during this exploration and round
   1's reading of `AnimationUtils`/`LayeredAvatar`/`AvatarManager` — none exists; every avatar
   rendering path today (baked atlas frames, or the layered renderer's per-piece raster `Image`
   pool) is raster-only. Building a live per-frame vector renderer (Phaser `Graphics`, redrawing SVG
   paths every animation frame, retinting per `"c":"colorN"` reference from the current palette)
   would be a **new rendering subsystem**, not a small addition — likely far more expensive at
   runtime (path tessellation every frame, no GPU texture atlas reuse) than the existing raster
   approach, and a significant departure from the frozen `avatar-layered-rendering` spec's whole
   raster-piece-pool design.
2. **The realistic route is compile-time rasterization**, following the exact precedent the
   archived cycle already built for hat/pet accessories: `client/scripts/compile-accessory.cjs`'s
   vector mode already does precisely this — takes `{o, p:[{d, f, eo}]}` per-frame SVG path data
   (the *identical* shape `_frames_<seq>.json` in `<char>.bb` uses) and rasterizes it via
   `sharp(Buffer.from(svg), {density:144}).png()` at compile time, packing the results into a
   multiatlas (design.md §3.2 of the archived change, confirmed by reading
   `compile-accessory.cjs`'s docblock in round 1). **The missing piece is that this same
   vector-to-raster compile step has never been pointed at the character BODY's emote sequences** —
   only at hat/pet accessories, and even there design.md §5/§10 explicitly scoped it down to "the 15
   authored keys," dropping the emote coverage the source `.bb` packages already had (confirmed:
   `.assets-src/accessories/pet09/` DOES have `down_llorar.json`/`down_risa1.json`/etc. source files
   on disk already, per round 1's own finding — they were simply never compiled into
   `pet09.accessory.json`'s `anims{}`).
   - Cost/benefit versus option 1: option 2 reuses an existing, already-shipped, already-tested
     compiler and rendering path (`LayeredAvatar`'s frame-pool renderer, `applyPalette`'s
     `setTint`-per-slot mechanism) with `"c":"colorN"` mapping directly onto the existing `slot`
     concept a piece already carries in the raster pipeline — palette fidelity is close to "for
     free," since the slot-tint mechanism (LayeredAvatar `_tintChild`) already works exactly this
     way for body pieces. Cost is compile-time only (one more rasterization pass per character per
     emote sequence, at `ss:2`/`density:144` matching the existing contract) — no new runtime
     rendering subsystem, no new palette-fidelity risk.
   - Whether SVG per-path colour data (`"f":"#b88a5c","c":"color1"`) needs the compiler to actually
     substitute a placeholder/neutral colour before rasterizing (so `setTint` can multiply-correct
     it at runtime, matching the existing "one raster piece is authored one-per-slot, tinted at
     runtime" contract, `design.md` §5 of the archived cycle) or whether it can rasterize at the
     authored colour and rely on `setTint`'s multiply behaviour against that base colour (as the
     existing hat/pet/body pieces already do) is a design-phase decision, not resolved here — but it
     is the SAME open question the archived cycle already solved once for hat/pet accessories, so
     precedent exists to extend rather than invent.
3. **Can the legacy baked atlas path keep palette fidelity?** No — checked directly: the baked
   `config.json`/`atlas.json` path (`AvatarRastaLoad.js`, `AvatarManager.createAvatarAnimations`)
   renders pre-baked, pre-colored spritesheet frames with no per-piece slot/tint mechanism at all;
   `safeApplyTint`/`TintManager` (the baked palette mechanism referenced in the archived design.md
   §5 "Glove branch") only recolors a single named part (the glove), not the full multi-slot palette
   system this change's users now expect. Reusing the baked emote atlas as a stopgap (loading
   `rasta_atlas` alongside the layered body, per round 1's speculative "hybrid" idea) would visibly
   snap the character back to its DEFAULT baked colours for the duration of every emote — worse
   than the current silent no-op, not better, and would violate the palette-persistence requirement
   (PAL) this whole system exists to deliver. This closes off that hybrid option as a viable fix,
   narrowing the real decision to option 2 above (compile-time vector-to-raster for emotes,
   following the accessory pipeline's own precedent).

### §3 — Per-character accessory anchoring (hat `.bb` structure)

Covered above in the revised item 5. Summary: `personajes/<char>/hat/<HatName>.bb` on-disk
structure independently confirms hats are authored per character, and `layers-hats.json` confirms
14 (of 16 roster) characters each have exactly one canonical "layers" hat, mostly character-unique
(`rabbitHat`, `pineappleHat`, `mickeyHat`, `RedTeam`, `pumpkinHat`, `bullHat`, `BlueTeam`,
`minnieHat`, `strawberryHat`, `infernoHat`, `pandaHat`, `flag01`, `xmasGreenHat`, `frogHat`,
`cacaHat`) — but `Custom6Hat` appears under BOTH `lilian/hat/` and `rasta/hat/`, proving at least one
accessory genuinely is shared cross-character and genuinely needs a per-character anchor override
mechanism, not just a per-character registry key. The exact anchor/registration field names inside
a hat `.bb`'s manifest could not be extracted with this exploration's tools (DEFLATE-compressed
JSON payload, see the tooling-limitation note above) — flagged as an open question for a
shell-capable phase.

### §4 — Pet side data (`pet09.bb`/`pet10.bb`)

**Directly attempted, and honestly reporting the limit reached:** `Grep` confirmed `pet09.bb`
contains at least one entry whose filename matches `meta.json` and at least one matching
`_frames` (files-with-matches hits on both patterns), and confirmed **no** filename match for
`.png` or `.bin` inside `rasta/pet/pet09.bb` — consistent with `personajes/<char>/pet/*.bb` being
**vector** packages (same SVG-path-per-frame shape as `<char>.bb`/hat `.bb`), not raster piece
packages like `<char>.layers.bb`. Beyond filename presence/absence, this exploration's tools cannot
decompress the DEFLATE-compressed JSON payload to read actual field names, so **whether `pet09.bb`'s
`meta.json` already carries a side/anchor field the new "canonical side" requirement could read
directly, or whether that field must be newly added during compilation, could not be determined
here.** This is an explicit, honestly-disclosed gap for the design/apply phase (which will have
shell access) to close with a real `unzip -p personajes/rasta/pet/pet09.bb meta.json` — not
resolved by inference in this document.

What round 1 DID already establish and remains true regardless of that answer: the runtime fix for
locked decision #2 (canonical side, flip-only for left-facing) lives in `pivot.js`'s
`resolveAccessoryPlacement`/`clearBodySilhouetteX`, not in the source data shape — even if
`pet09.bb` carries no side field today, the compiler (`compile-accessory.cjs`) could derive/assign
one at compile time (e.g. from which side the pet's `down`-pose regX naturally sits on, or from an
explicit manual authoring decision recorded in a small config alongside the `.assets-src` staging),
and the runtime consumption of that field is a bounded, well-scoped change to two functions already
identified in item 2.

### §5 — Aura packages (`effects/`)

Located and read directly — **not inside a `.bb` archive at all**; these are plain, uncompressed
files under `dswmedia_decrypted/effects/`:

- `aura_electrica.json` + `.webp` — `{"name":"aura_electrica","frameCount":48,"frameWidth":133,
  "frameHeight":163,"cols":8,"rows":6,"sheetWidth":1064,"sheetHeight":978,"fps":24,
  "anchor":{"x":0.5,"y":0.85}}`. This is the **only** aura already compiled into the client today
  (`client/src/assets/game/accessories/aura/auraElectrica/`), and its anchor exactly matches the
  compiled package's own default anchor — independent confirmation that round 1's read of the
  compiled manifest was accurate and that the anchor does not need to change for the z-order fix
  (locked decision #3).
- `aura_azul.json` + `.webp`, `aura_dorada.json` + `.webp` — both
  `{"frameCount":231,"frameWidth":133,"frameHeight":163,"cols":61,"rows":4,"sheetWidth":8113,
  "sheetHeight":652,"fps":60,...}`. **`sheetWidth: 8113` independently confirms, from the primary
  source itself (not merely inferred from the archived verify-report's prose), that these two auras
  exceed `compile-accessory.cjs`'s aura-mode hard-fail limit of 4096px on the sheet's long axis**
  (archived design.md §3.2: "The compiler hard-fails if either sheet axis exceeds 4096px"). This is
  the exact pair the archived verify-report already flagged as unresolved
  ("`aura_azul`/`aura_dorada` (8113×652) failing the 4096px compiler limit... only
  `auraElectrica` exists on disk"). Round 2 does not change this fact — the source files are now in
  hand, but the compiler's page-splitting logic (already implemented for the layered BODY compiler,
  `compile-layered-avatar.cjs`'s `MAX_PAGE_SIZE`/multi-page overflow handling) has never been ported
  to the aura compile mode. This change should decide explicitly whether to (a) leave this
  unresolved (as before — `auraElectrica` only) since the z-order fix does not require it, (b) port
  the existing multi-page splitting logic to aura mode as a small follow-up, or (c) accept
  down-sampling/splitting `aura_azul`/`aura_dorada` some other way. Not required for this change's
  locked scope (only `auraElectrica` needs the depth fix), but worth a one-line decision in the
  design doc so it is not silently re-discovered a third time.
- Z-order/anchor ARE already declaratively per-package (`anchor` is a top-level JSON field per
  aura), confirming the design-phase change (moving aura's depth to "above everything") can be a
  single constant change in `AccessoryLayer.createAura()` without touching this source data at all.

### §6 — Playwright validation feasibility

Covered above in the revised item 6. Summary: `window.game` is already a live global exposing the
running Phaser instance; `scene.users[id].containerUser.list` already gives resolved
render-order/position/depth per child with zero new instrumentation; `PerfHarness.spawnGhosts()` is
a ready template for driving synthetic avatars through the real assembly path, needing only
parametrization by `avatarId` and a direction-setting helper to cover the full 14×8 matrix.

### §7 — Review workload estimate for 14 characters

The archived cycle's own `tasks.md` estimated **~3,500-4,500 hand-written lines across 11 chained
slices for ONE character** (`rasta`), explicitly noting "plus generated compiled-asset bytes...
that are additional and not line-reviewable." That figure is not a useful multiplier for 14
characters, because most of what made that cycle large was **building the runtime that does not
need to be built again**: `LayeredAvatar`, `LayeredAvatarRegistry`, `AccessoryManager`,
`AccessoryLayer`, `pivot.js`/`fallback.js`/`sequence.js`/`paletteResolve.js`, the palette
socket/API/DB protocol, the debug panel, and the perf harness are all already shipped and reusable
as-is.

**Proposed split, to keep each reviewable PR's hand-written-code line count (not asset bytes) under
the 400-line budget the harness protects:**

1. **One shared-infrastructure PR** covering the actual code-level fixes common to every character:
   pet canonical-side logic (item 2), aura depth (item 4), accessory registry character-scoping
   (item 5), and the emote-delivery mechanism (item 1/§2 — likely the largest single code PR here,
   since it is a genuinely new compile-time pipeline extension plus the `animationcomplete` emit
   fix). Estimate: comparable in kind, smaller in size, to the archived cycle's Slices 2-4 and
   Slice 8 combined — a few hundred to ~800 hand-written lines, not asset bytes.
2. **One PR per 3-4 character batch** for the mechanical roster migration itself: unzip + compile +
   the ~4-6 line registry entries per character in `AvatarManager.js`
   (`LAYERED_CHARACTERS`/`LAYERED_MANIFEST_LOADERS`/`LAYERED_ATLAS_LOADERS`/`LAYERED_WEBP_LOADERS`)
   + `assetVersionManager.layeredVersions.characters` entries + per-character manifest/slot data —
   each batch's hand-written code diff should be small (roughly `4 characters × ~20 lines` ≈ 80
   lines of registry wiring), dominated by non-line-reviewable generated asset bytes exactly as the
   archived cycle already precedented for `rasta` alone. **Batching by 3-4 keeps each PR's live-
   validation load (the Playwright 8-direction matrix) bounded** rather than reviewing all 14 at
   once, and lets a defect found in character N's specific hat/pet anchor not block the other 13.
3. **One final Playwright-harness PR** building the parametrized `spawnGhost(avatarId,...)` +
   direction-driving + resolved-state-assertion suite (item 6/§6) — this can and should land early
   enough (right after the shared-infrastructure PR) that every subsequent character-batch PR can
   be validated against it, rather than last.

Asset bytes (piece PNGs, compiled `.webp`/`.atlas.json`/`.manifest.json`) are **excluded from the
hand-written-line count** in this estimate, matching the archived cycle's own precedent and stated
reasoning ("generated compiled-asset bytes... are additional and not line-reviewable") — this is
stated explicitly here so the tasks/design phase does not need to re-derive that convention.

---

## Corroborating facts for downstream phases

- **`openspec/config.yaml` is stale**, confirmed by reading `client/package.json` directly: it has
  `"test": "vitest run"` and `"test:watch": "vitest"` with `"vitest": "^3.2.7"` in
  `devDependencies` (lines 12-13, 34). The real client test command is `cd client && npm run test`.
  `config.yaml`'s own text ("client and server intentionally left empty pending the above task") is
  now false — the task it names as pending was completed by the archived change. The archived
  change's own `verify-report.md` already flagged this exact staleness as a "housekeeping
  follow-up," so this is a second, independent confirmation, not a new finding.
- **The API command is unaffected:** `cd api && ./vendor/bin/phpunit`.
- **Current client test inventory relevant to the avatar system:** 12 files (see item 6). Running
  the historical baseline is a task for the apply/verify phases, not explore — this document only
  records what exists and what it does/does not assert on.
- **Server test command** (also stale in `config.yaml`, not re-litigated here): `server/package.json`
  now has a real `vitest run` script per the archived change's design.md §8, not exercised in this
  exploration since none of the six reported items touch server code — all six are client rendering/
  animation issues. Confirmed no server-side file matched any of the six symptom areas during this
  exploration (glove/palette/protocol code, the only server-side avatar surface, is unrelated to
  emotes, pet placement, aura depth, hat anchor, or roster migration).

## Files/paths read during this exploration (for traceability)

**Round 1:**
- `openspec/changes/archive/2026-08-17-avatar-color-accessory-system/{design.md,verify-report.md}`
- `openspec/config.yaml`
- `client/package.json`
- `client/src/phaser/managers/AvatarManager.js`
- `client/src/phaser/layered/{LayeredAvatar.js,fallback.js,pivot.js,AccessoryLayer.js,
  mirroredDirections.integration.test.js}`
- `client/src/phaser/controllers/scene/{AddUserController.js,UserSendEmojiController.js}`
- `client/src/phaser/animations/{UserEmojiAnimation.js,UserCocoAnimation.js}`
- `client/src/utils/AnimationUtils.js`
- `client/src/phaser/managers/AccessoryManager.js`
- `client/src/assets/game/avatars/rasta/{config.json,layers/rasta.layers.manifest.json}`
- `client/src/phaser/load/avatars/AvatarRastaLoad.js`
- Directory listings: `client/src/assets/game/avatars/*`, `client/.assets-src/layered/rasta/*`,
  `client/.assets-src/accessories/{pet09,hat_minnie}/*`, `client/scripts/compile-*.cjs`

**Round 2 (decrypted asset source):**
- `/Users/evgeny.lyubeznyy/Downloads/dswmedia_decrypted/_README.md`
- `/Users/evgeny.lyubeznyy/Downloads/dswmedia_decrypted/personajes/{layers-index.json,
  layers-hats.json,layers-pets.json}`
- `/Users/evgeny.lyubeznyy/Downloads/dswmedia_decrypted/effects/{aura_electrica,aura_azul,
  aura_dorada}.json` (read fully/partially — plain JSON, not inside a `.bb`)
- `client/scripts/compile-layered-avatar.cjs` (re-read in full to verify the input-format claim)
- `client/.gitignore` (confirmed `.assets-src/` ignore rule and its rationale comment)
- Filename-presence greps only (payloads not decompressible with this toolset) against
  `personajes/rasta.layers.bb`, `personajes/rasta/hat/minnieHat.bb`, `personajes/rasta/pet/pet09.bb`,
  `personajes/rasta.bb`
- Directory listing: `personajes/**/*.bb` under `dswmedia_decrypted`
