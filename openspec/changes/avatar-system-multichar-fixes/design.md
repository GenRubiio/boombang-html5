# Design: avatar-system-multichar-fixes

Implements this change's `specs/avatar-layered-rendering/` and `specs/avatar-accessories/` deltas against
canon `avatar-layered-rendering`, `avatar-accessories`, `avatar-palette`, `avatar-look-protocol`. Locked
decisions from `proposal.md` are not re-argued. `archived §N` = the predecessor design
(`openspec/changes/archive/2026-08-17-avatar-color-accessory-system/design.md`). Bare paths and line
numbers are verified against the working tree; `.bb` internals were read with `unzip -l` / `unzip -p`;
per-slice implementation detail lives in `apply-progress.md`.

**Slices 1–11 are implemented and live-verified.** The reported defect is fixed — `llorar` plays on a
layered `rasta` with the player's palette intact, asserted on resolved rendered state.

**The renderer architecture is settled: raster wins**, decided by measurement on our own client (§12). The
vector runtime built for that comparison is removed (§12.3). What remains is **load-time and memory
reduction** (§13) — the objective being how long the game takes to load on a slow connection, not how many
bytes sit in git — followed by the roster migration (§15).

## 0. User-approved scope expansions beyond the frozen artifacts

`proposal.md` and `specs/` are frozen. These decisions go beyond them and are recorded so the divergence is
auditable rather than silent.

| Date | Decision | Divergence |
|---|---|---|
| 2026-08-17 | `sally` becomes a playable client character (new avatar id) | `proposal.md` item 7 expected it to drop out; an id satisfies the LR delta as written instead of amending the spec |
| 2026-08-17 | Compile the **full** action set, no tiering | The LR delta requires coverage "that exists for that character in its source data"; this is that read taken maximally |
| 2026-08-18 | Roster is **18**: the 16 characters with a `.layers.bb` plus `ghost` and `wraith` from their vector packages | `proposal.md` named `skeleton`/`zombie` out of scope — they now ship packages. `ghost`/`wraith` have no layered package and the LR delta says such a character "MUST NOT be required to migrate": additive, not violating, but against that scenario's intent |
| 2026-08-18 | Compile all **612** accessory packages, tracked in git — no `.gitignore`, no LFS, no CDN-only | `proposal.md` anticipated compiled accessory output, not this volume |
| 2026-08-18 | Add **delivery bundling** and an **atlas/manifest compaction pass** | A new capability with **no spec delta** (§19 risk 9) |
| 2026-08-18 | Harness gains **production-parity metrics** | Extends `proposal.md` item 6 from correctness to performance |
| 2026-08-18 | Build a vector runtime behind a flag, measure it against raster, decide once | `proposal.md`'s non-goals reject "any runtime SVG/vector rendering subsystem". Executed as a time-boxed spike, now **complete and removed** (§12) — the non-goal is upheld by the result |
| 2026-08-18 | Add an **asset-authoring round-trip** (`.bb` unpack → per-frame SVG → edit → re-import → repack) | A new tooling capability with **no spec delta**, orthogonal to the renderer (§17) |
| 2026-08-18 | **Remove the vector runtime; keep the verdict and the shared modules the compilers now depend on** | Reverts the spike's runtime surface only (§12.3) |
| 2026-08-18 | **Byte and memory reduction is designed and measured on `rasta` BEFORE the mass compile**, chosen over compiling 630 packages first and optimising later | Makes every roster-migration slice conditional on a measured gate (§13.8) |
| 2026-08-18 | **The objective is player load time on a slow connection**, not tracked bytes — "lo que mas me preocupa es cuanta tardara en cargar a una persona con internet lento" | Re-ranks §13's levers around metrics 2 and 3 of §6 and expresses the gate in seconds on a stated connection profile. Tracked bytes become reported-not-blocking, which is a deliberate reversal of the previous gate's priority |

## 1. Verified source facts

**A. `.layers.bb` does not ship `colormeta.json`.** `unzip -l` on `rasta.layers.bb`, `yayo.layers.bb`,
`sally.layers.bb`: `meta.json`, `_frames.json`, 15 sequence JSONs, `p*.png`, no `colormeta*`. The data
lives in the *vector* `<char>.bb`'s `meta.json.colormeta`; staging derives it (§4).

**B. Vector frames hold three path species; only one is tintable.**
`unzip -p personajes/rasta.bb _frames_down_risa1.json` →
`[{"o":[42.35,107.2],"p":[{"d":"M38.65 90.8L…","f":"#b88a5c","eo":1,"c":"color1"},
{"d":"M36.3 85.75Q…Z","s":"#000000","w":1.8},…`

- **fill** — `d` + `f` + optional `eo` + optional `c` (colour slot).
- **stroke** — `d` + `s` + `w`, never a slot.
- **linear gradient** — `d` + `g:{t:"l", st:[[offset,hex],…], x1,y1,x2,y2}` + optional `eo`, never a slot.
  Found only by compiling real data: 546 occurrences across rasta's 4 accessory packages, 8 in the body
  action set, 0 with a slot, 0 of 546 sharing a definition.

So "paths without a `c`" are strokes and gradients — outlines and shading, not untinted fills. Matches
`doc/analysis/sistema-personajes-por-capas.md` §5.1: non-slotted raster pieces carry *"líneas, sombras y
detalles fijos"*.

**C. The authored fill of a slotted path equals that slot's default, so fills must be neutralized.**
`rasta.bb`'s `colormeta.defaults.color1 = "b88a5c"`, exactly the `#b88a5c` on the `c:"color1"` path.
`setTint` multiplies, so rasterizing at the authored fill applies the colour twice. Appendix B of the same
document, on a real raster package: slotted pieces are *"máscaras blancas con cuatro niveles principales de
alfa"* — a fact §13 returns to.

**D. Path commands and fill rule.** The alphabet is `M`, `L`, `Q`, `Z` (`C` allowed defensively). `eo: 1` is
near-universal, and real `d` strings carry multiple `M` subpaths in one path — e.g.
`"M62 39Q66 42 68 46…M68 48L68 48Q…"` in `minnieHat`'s `down_idle` — i.e. genuine even-odd holes.

**E. `colormeta` is sparse and asymmetric.** rasta's `defaults` covers `color1..color5, color7,
colorGuante` (no `color6`); `labels` omits `color4`. `manifest.slots` is `Object.keys(defaults)` and
`paletteResolve` already falls back to the raw key, so no code change — but nothing may assume a contiguous
`color1..colorN`.

**F. Sequence JSONs are literal index arrays with heavy reuse** — `down_risa1.json` has 40 entries over 30
unique frames. `meta.anims`' `{f,u}` is (frames, unique).

**G. The base package's root `_frames.json` is not vector data.** It is an already-rasterized
piece-reference shape (`{o, L:[{p,x,y,w,h,s?}], h, hz}`) referencing the `p*.png` pool. Only
`actions/_frames_<key>.json` carries `{o, p:[{d,f,eo,c}…]}` vector paths — and it carries them for **all 41
keys**, including `down_idle`/`left_walk`/`down_talk`, not only the action set.

**H. Accessory packages self-declare `(char, kind, key)`** —
`unzip -p personajes/rasta/hat/Custom6Hat.bb meta.json` → `{"char":"rasta","kind":"hat",
"key":"Custom6Hat","anims":{…},"uniqFrames":790}`. Registry identity is discovered, not invented (§7).

**I. No accessory package declares an anchor or a side.** Positioning is carried entirely by each frame's
`o:[x,y]` in the body's rig space — which *is* why a hat is positioned differently per character.

**J. Accessory packages carry the full action set** — `Custom6Hat` 790 unique frames, `minnieHat` 778,
`pet09` 227 compiled. Accessories scale the budget like bodies.

**K. `config.json` already holds the emote name map** — each baked entry carries
`prefix: "sprites/<authored-sequence>/"` and `flip_horizontally`: `risa1→down_risa1`,
`llorar→down_llorar`, `left_punch_doy→leftdown_punch_doy` (`flip:false`) and `right_punch_doy` → the same
source with `flip:true`. Callers use direction-**less** keys while sources use direction-prefixed ones
(§5.5).

**L. Vector frames carry clip data** — `k:<id>` on a path plus a sibling `cl:{"<id>":"M…Z"}`.

**M. Independent confirmation of per-character hats.** `html_static_prod/js/sprites-split/index.json` keys
hat animations `gorro_<character>_<animation>` — `gorro_rasta_left_punch_doy`, `gorro_gata_down_special`,
`gorro_lilian_left_beber`, `gorro_skeleton_left_punch_doy`.

**N. `effects/` holds 3 auras, already rasterized.** `aura_electrica.json` declares
`anchor:{x:0.5,y:0.85}` but no z-order, so aura-on-top is a client-side constant (§2).

**O. Both compilers encode with `webp({ lossless: true })` and nothing else** — verified by grep across
`client/scripts/`: three `.webp()` call sites, all `{ lossless: true }`, no `effort`, `nearLossless`,
`quality` or `alphaQuality`. sharp's default webp `effort` is 4 of 6. Encoder headroom is entirely
unexploited (§13.5).

**P. The client image does not compress JSON.** `client/Dockerfile` copies `dist` into stock `nginx:alpine`
with no config of its own; nginx's stock `nginx.conf` ships `#gzip on;` commented and defaults `gzip_types`
to `text/html`. `docker/nginx/gzip.conf` exists, enables `application/json`, and is **included by nothing** —
`docker-compose.yml` mounts it nowhere and no vhost references it. Dead configuration, the same class of gap
`CLAUDE.md` records for the absent `web/` service (§13.1).

## 2. Depth table and aura-on-top — shipped

`client/src/phaser/layered/depths.js` owns the table plus pure `resolveAccessoryDepth(kind, {zBias,
relativeY})` and `clampHatZBias`.

| Depth | Object | Change |
|---|---|---|
| `0.0` | `spriteShadow` | — |
| `0.5` | pet, behind | — |
| `1.0` | body | — |
| `1.0 + clamp(zBias, 0.05, 0.55)` → `[1.05, 1.55]` | hat | clamp added |
| `1.60` | pet, in front | was `1.5`, tied with the hat |
| `1.80` | aura | **was `0.2`** |
| `2.0` / `3.0` | `nameBackground` / `nameText` | — |

The aura is above body and hat as the delta requires and below the name tag (the delta scopes "topmost" to
body/hat/pet/aura; a name tag behind an aura would be a new defect). The clamp is what makes the order total
for any authored `zBias`: without a floor a `0` ties the body, without a ceiling a `0.9` crosses pet and
aura. Live-verified order and depths: `shadow → pet → body → hat → aura → nameBackground → nameText`,
`[0, 0.5, 1, 1.5, 1.8, 2, 3]`.

`aura_azul`/`aura_dorada` (8113×652) still exceed aura mode's 4096 hard-fail, which does not paginate
although vector mode does — a conditional tail slice.

## 3. Animation events, degrade telemetry — shipped

`resolveAnimationKey(sequences, requestedKey, direction, mirrors, aliases, unloadedKeys)` returns
`{requestedKey, resolvedKey, degraded, reason}` over six reasons (`match`, `alias`, `mirror`,
`pack-loading`, `direction-idle`, `down-idle`), with `resolveFallbackKey` reduced to a wrapper so its
callers and tests are untouched. `degradeReporter.js` keys a `Map` by tuple, warns on first occurrence
only, counts the rest, and exposes `window.__layeredDegrades`. `sequenceClock.js` holds pure
`advanceSequence(...)`; `tick()` emits `animationupdate` per visited frame with a 1-based `index`, and
`animationcomplete` once, after `_playing = false`, for a non-repeating sequence.

**Event identity uses the requested key.** `UserUppercutAnimation.js:23-27` compares
`anim.key === avatarId + "_" + textureKey` with `textureKey = "left_punch_rec"`, while the resolved
`_seqKey` is `leftdown_punch_rec`; emitting the resolved key means that listener never fires. `play()`
records `_requestedKey` and both events plus `anims.currentAnim` key off it. Live-verified:
`playKey('right_walk')` fires with `anim.key === '12_right_walk'`.

## 4. Asset staging — shipped

`client/scripts/stage-layered-source.sh <char>`: unzip `<srcName>.layers.bb` into
`.assets-src/layered/<char>/`; unzip `<srcName>.bb` into `.../actions/`; derive `colormeta.json` via
`lib/deriveColormeta.cjs`, which **throws** when `meta.colormeta.defaults` is absent (it is the only source
of slot defaults and labels); stage accessories to `.assets-src/accessories/<char>/<key>/`; apply
`asset-overrides/` (§17.2); compile. `srcName` is `bommer` for `boomer` and `<char>` otherwise.

**Authoring corrections live outside the destructible tree**, because a blind re-stage silently discarded
`minnieHat`'s `scale: 0.75` and `pet09`'s `groundOffsetY: 19` once already. `client/scripts/
accessory-annotations.json` (committed, keyed `<char>/<kind>/<key>`) is now the only source for
`scale`, `groundOffsetY`, `regXOffset` and `regYOffset`; `compile-accessory.cjs` reads it directly from its
fixed committed path and **never stages it into `.assets-src/`**, so it cannot be lost to a re-unzip at all
— a stronger property than re-applying after every unzip. `meta.scale`/`meta.groundOffsetY` are no longer
read. Migrating both known corrections onto the new file was verified byte-identical on recompile.

Raw source (578 MB) stays untracked under `client/.gitignore:28-30`. **Trade-off:** compiled artifacts are
not reproducible from the repository alone — mitigated by the `sourceHash`/`compilerVersion` stamp in every
manifest and by the staging script, annotations and overrides being committed.

## 5. Vector→raster build pipeline — shipped

**5.1 Run partitioning.** `partitionSlotRuns(p[])` splits a frame's path list into *maximal consecutive
runs of equal `c`* (absent `c` — every stroke and gradient — is its own value). Consecutive, not
grouped-by-slot: `p[]` order is compositing order and the renderer's contract is *layer order is immutable,
pool index === `L` index === child depth* (LR4), so grouping all `color1` paths regardless of position
would reorder the composite. Maximal runs preserve authored order while giving each run at most one slot —
exactly what `_tintChild` consumes. **The run is the unit of rasterization, dedup and packing.**

**5.2 Species branching and fill neutralization.** `svgFromPaths(paths, bounds, {fillOverride})` branches
per species: fill → `fill="{fillOverride ?? f}" fill-rule="{eo ? evenodd : nonzero}"`; stroke →
`fill="none" stroke="{s}" stroke-width="{w}"`; gradient → a `<linearGradient>` def plus `fill="url(#g<N>)"`;
none of the three → **throw**. `fillOverride = '#ffffff'` applies to slotted runs only: white × requested =
requested, whereas authored-default × requested is a doubled wrong colour (fact C). Only `fill` changes, so
alpha and antialiasing survive, and `checkLuminanceWarning` stays on as the guard.

Two `computeBounds` corrections only real data surfaced, each of which blocked the full compile outright: a
stroke's contribution is padded by `strokeWidth/2` per side (an axis-aligned line has a zero-area bbox,
which librsvg rejects), and every axis is floored to `1/ss` logical units (a ~0.1-unit highlight sliver is
sub-pixel after `ss:2`).

**5.3 Clips.** Each referenced `cl` id is emitted once as a `<clipPath clipPathUnits="userSpaceOnUse">`
and a path with `k` gets `clip-path="url(#k{id})"`. `computeBounds` is unchanged — a clip only shrinks the
drawn region.

**5.4 Emission.** Per action key: partition each authored frame into runs, rasterize with
`sharp(svg, {density: 144}).png()` (144 dpi = 2× the 72 dpi default = the same `ss: 2` the base pack
enforces), content-hash into the global dedup registry, and record
`{p, dx: runBounds.minX, dy: runBounds.minY}` in logical units — the identical `L`-entry shape and
coordinate space `_applyFrame` consumes. Action ids are namespaced `a<N>`. Two hard gates:
`originSpaceGate.cjs` asserts `|o_vector(down_idle) − o_raster(down_idle)| ≤ 1` logical unit per axis, and
`pageBudget.cjs` enforces base ≤ 2 pages, actions warn at 5 / fail above 8, accessories warn at 2 / fail
above 3.

**5.5 Aliases and mirrors.** `bakedKeyMap.cjs` derives, per baked key `B` whose `source` `S` is a compiled
sequence: nothing when `S === B`; `aliases[B] = S` when `flip` is false; `mirrors[B] = {from: S,
flipX: true}` when true. `checkAliasMirrorCompleteness` **fails the compile** if a baked key's `source`
names a compiled sequence but the key lands in none of the three. `play()` passes `manifest.aliases`
through and `sourceKey` resolution checks `aliases` before falling back (an alias like `risa1` is never
itself a `sequences` key — only what it names is). Emote keys carry `flip_horizontally: false` everywhere,
so an emote plays its authored left-facing art regardless of facing — byte-identical to the baked renderer.

**Palette persistence during actions is free**: an action run piece carries `slot` in the same field as a
base piece, so `_tintChild`/`applyPalette` are untouched.

**5.6 Deriving a character from vector only — `ghost`, `wraith`.** They have `ghost.bb`/`wraith.bb` but no
`.layers.bb`, so `--from-vector <char>` runs §5.4 over *every* key in the vector `meta.anims` (fact G
confirms all 41 are present there), with three differences: no `_frames.json`/`p*.png`, so the
declared-w/h check does not apply; **the origin-space gate cannot run**, replaced by comparing the derived
`down_idle` visible bbox against the character's existing baked `config.json` `frameWidth`/`frameHeight` ×
`ss` within ±4 real px (a real cross-check against independently authored data, since both ship a baked
config today); and `bodyBounds` from the union of run bounds.

**5.7 Measured cost, rasta.**

| Metric | Measured |
|---|---|
| Base pack / action pack | 1 page / **4** pages, 26 action keys, 41 sequences, 9 aliases, 15 mirrors |
| Unique action frames / pieces | **867** / **17,722** |
| `.webp` | ≈ **8.5 MB** |
| `.atlas.json` / `.manifest.json` | **3.03 MB** + **0.37 MB** / **4.23 MB** |
| Working tree / git | ≈ **16 MB** / ≈ **9.4 MB** — JSON compresses to 6–13%, `.webp` to 100% |

## 6. Four numbers, not one

Earlier drafts of this design conflated four distinct quantities under "asset volume" and optimised for the
one that matters least to a player. The user's stated priority is **how long the game takes to load on a
slow connection**, so they are separated here and every lever in §13 is labelled with which one it moves.

| # | Metric | Measured today | Who it affects |
|---|---|---|---|
| 1 | **Tracked git bytes** | ≈ **1.13 GB** projected across 630 packages | clone time and repo health. Accepted by the user. **Zero effect on player load time.** |
| 2 | **Transfer on room entry**, per distinct character | ≈ **4.8 MB** over the wire today (see below) | every player, every first visit |
| 3 | **Transfer on first action**, per character | ≈ **8.7 MB** — the whole 4-page action pack | every player who presses an emote |
| 4 | **Decoded texture memory**, per on-screen character | ≈ **273 MB** | low-end and mobile devices; may bind before bandwidth does |

**Metric 1**, for completeness: a body is 9.4 MB git-compressed, a hat carrying the full action set ≈ 2.08 MB,
a pet ≈ 0.22 MB → 18 bodies ≈ 169 MB, 442 hats ≈ **919 MB**, 170 pets ≈ 37 MB. `sally` has no accessories,
so it is a body only. Hats dominate — and §13 re-ranks that work *below* load time, because a hat's action
frames are never fetched on room entry (§13.5).

**Metric 2 is worse than it looks, for a reason that is not about art at all.** rasta's compiled base pack is
`rasta.layers.webp` 402 KB + `rasta.layers.atlas.json` 375 KB + `rasta.layers.manifest.json` 4,134 KB. With
JSON gzipped (measured ratios: 6 % for the atlas, 13 % for the manifest, 100 % for `.webp`) that is
≈ 402 + 577 ≈ **980 KB per character — about 4.6× lighter than production**, which fetches 4,690,920 bytes of
`gata.bb` on room entry. **Without** JSON compression it is ≈ **4.9 MB**, i.e. no better than production.
§13.1 establishes which of those two we actually ship, and the answer is not the flattering one.

**Metric 3 is the real slow-connection defect.** The action pack is four pages measured at 1,232 + 2,063 +
2,268 + 2,921 KB ≈ **8.7 MB**, plus a 2,960 KB atlas JSON (186 KB gzipped). At 250 KB/s that is roughly
**35 seconds** the first time anybody presses an emote. The spike's `timeToPlayCold` of 358 ms was measured
on localhost and says nothing whatsoever about this.

**Metric 4** measured `residentAvatarBytes` = 286,746,136 B ≈ **273 MB for one character** with its action
pack loaded, against production's ~22 MB of avatar data. Decomposed: base page 4095×1852×4 ≈ 29 MB, four
action pages ≈ 245 MB. Room entry loads base only, so entry costs ≈ 29 MB and is fine; the moment any action
triggers, that character costs ≈ 273 MB, and eight distinct characters that have each acted is ≈ 2.2 GB.
Encoding cannot touch this — a GPU stores decoded RGBA regardless of how the file was compressed.

**Load strategy, shipped.** Base pack eager, action pack lazy: `pieces[id].pack ∈ {base, actions}`,
`LayeredAvatar` holds `_atlasKeys` and `_applyFrame` resolves per piece;
`AvatarManager.loadLayeredActions` has its own in-flight guard; `AddUserController` schedules a
`requestIdleCallback` prefetch and passes `onActionPackNeeded`; `play()` computes `unloadedKeys` from
`computeActionBackedKeys(manifest)`, degrades with `reason: 'pack-loading'`, and replays the original key on
arrival under a `_playToken` staleness guard. One recorded deviation: `createAvatarSprite` is the single
construction path for local and remote users and no branch distinguishes them, so every layered avatar gets
the same prefetch — **which on a slow connection is actively harmful**, because it spends 8.7 MB of the
player's bandwidth, and 245 MB of their texture memory, for an action nobody has triggered (§13.3).

## 7. Per-character accessory registry — shipped

`resolveAccessoryRegistryKey` resolves `${character}:${kind}:${key}` → `*:${kind}:${key}` (auras, per canon
ACC2) → miss, and a miss **throws naming both character and key**. Atlas keys are
`acc_${character}_${kind}_${key}_atlas`; layout is `accessories/<kind>/<character>/<key>/`.
`compile-accessory.cjs` requires `--char` and hard-fails when `meta.char` is absent or disagrees;
`load()` warns on a mismatch for a resolved package. `AssetVersionManager.accessoryVersions.accessories` is
keyed the same way.

Anchor resolution extends ACC1 by one tier per axis: `frameOverride ?? packageBase ?? sharedBase ?? 0`.
Because packages are per character and their anchors derive from per-character frame origins (fact I),
`packageBase` *is* that character's anchor — `Custom6Hat` under `boomer`, `lilian` and `rasta` compiles to
three packages with three anchor sets, so the delta's "MUST NOT collapse two characters' distinct anchor
data onto a single `(kind, key)` entry" holds by construction. Fact M confirms the same shape in the
reference implementation's own index. The package key is the source key — `minnieHat`, not `hat_minnie`,
which was an arbitrary directory name the source never used. **How a human adjusts one of those anchors is
§17.1**, which resolves into this same `packageBase` tier.

**Registries are glob-populated, not hand-written.** A literal map would need ~5 lines per package × 612.
`buildAccessoryPackagesFromGlob(import.meta.glob('@/assets/game/accessories/**/*.{accessory.json,atlas.json,webp}'))`
and five equivalent globs for the layered bodies replace them, lazy by default so each package stays its own
chunk. `parseAccessoryAssetPath` derives the registry key from the path and throws on a malformed one;
`buildLayeredCharacterRegistry` maps character name → avatarId via `AvatarEnum` and **excludes a compiled
character with no enum entry rather than guessing**. Resolution order is unchanged, proven by
`accessoryRegistryResolve.test.js`'s nine cases passing unmodified.

## 8. Pet canonical side — shipped

Nothing declares a side (fact I), so `derivePetSide(downIdleOriginX, downOriginXs, {overrideSide, epsilon})`
computes it at compile time from the `down_idle` frame's `regX` against the median across all `down_*`
frames, **failing** when the two candidates fall within epsilon and no override exists — no silent default
can reintroduce "whichever side the data happened to give". `pet09` derives **`left`**.

`resolveAccessoryPlacement`'s pet path no longer reflects `regX` about the body origin and no longer flips
`originX`; X is side-determined, not mirror-determined, while `flipX: mirrored` still turns the pet to face
left. `clearBodySilhouetteX` is **deleted** — approval-tested green once, then removed with the function —
and replaced by `resolvePetSideX(center, halfWidth, bodyMinX, bodyMaxX, side, margin = 4)`, an unconditional
clamp to the declared side rather than a nearest-side nudge.

The antisymmetry rule lived *only* in the deleted branch. The body's own mirroring (`reflectSpan`) and its
per-frame extent (`computeBodyBoundsX`) are untouched and still mirror-consistent. Verified by grep: zero
real references to the old name, exactly one production call site of the new one.

## 9. Delivery bundling and compaction

A build/delivery concern, deliberately **not** a repository format: loose files stay in git, which
zlib-compresses and deltas them, and an opaque ZIP blob defeats both.

**9.1 Compaction.** A 6 % compression ratio means the *format*, not the transport, is the problem. Every
multiatlas frame entry is fully determined by five values (`rotated`/`trimmed` always false,
`spriteSourceSize` always `{0,0,w,h}`, `sourceSize` always equal to `frame.w/h`), and ~19,400 manifest `L`
entries repeat string piece ids that could be integer indices into one table. The compiler emits compact
forms; the runtime expands them through pure `expandCompactAtlas()` / `expandCompactManifest()`, with
`--emit-verbose` retained for debugging. Targets against rasta's measured numbers: manifest 4.23 MB →
≤ 1.2 MB, actions atlas 3.03 MB → ≤ 0.7 MB.

**9.2 `.bb`-style bundles.** `bundle-avatar-packages.cjs`, run after `vite build`, emits
`dist/bundles/<char>.layers.bb` and friends: ZIP with **STORE** for `.webp` and **DEFLATE** for JSON.
`fflate`'s `unzipSync` (already a devDependency, added for §17.2) unpacks in memory; each page becomes a
`Blob` object URL patched into `texture.image`, the trick `loadLayeredAvatar` already uses, so
`scene.load.multiatlas` needs no change. Gated by `VITE_AVATAR_BUNDLES`, with the shipped per-file path
unchanged when off.

**One claim to verify rather than assert.** The 41 % saving is against *uncompressed* bytes. Where the
serving tier already gzips JSON the byte win largely disappears, since `.webp` is incompressible either way;
the **request-count** win is unconditional. The acceptance criterion is a measured `content-length`
comparison against the real `docker/nginx` configuration, bundle-on versus bundle-off. Production serves
`dswmedia/personajes/gata.bb` as 4,690,920 bytes of `application/octet-stream` with no `content-encoding`,
on room entry, per character present.

## 10. What production does, and the premise that is now retired

PIXI 8.19, WebGL, `resolution: 2`, 60 fps, 136 sprites, 77–110 `Graphics`, 28–43 draws, `renderMs 0.03`,
235 MB heap of which ~22 MB is avatar data (`hpVec 8.5`, `hpAnims 10`, `hpLyr 7.1`), pose/run pooling
(`hpPoolPrunedN: 1391`), GPU-tier detection persisted to `localStorage`, adaptive filter stripping. It ships
~4.7 MB of vector paths per character and rasterizes to a runtime bake cache; it parses lazily per
*animation* (`/idle|walk|talk/i` → loop, `punch` → punch, else other), reading
`bodyLoop 6×2.2MB, bodyPunch 0, bodyOther 0, accLoop 3×0.1MB` with 8 players; and it keeps no client-side
asset store at all, only the browser HTTP cache.

**The premise that motivated reopening the renderer fork is retired, with a number.** Production's ~4.7 MB
per character is **their own compacted/binary format**, not a naive JSON encoding of the same path data. The
same data, bucket-split as JSON, measured **15.58 MB raw / 3.22 MB gzipped for one character** (loop 15 keys
1.46 MB, punch 2 keys 3.50 MB, other 24 keys 10.65 MB) — already close to the raster path's own ~16 MB.
Recorded here explicitly so nobody reopens the fork on the assumption that vector source data is an
order-of-magnitude byte win. It is not, before compaction.

What production still does better, and what §13 must answer: **resident memory**. Their ~22 MB against our
measured 273 MB comes from rasterizing on demand at display size and evicting, rather than shipping every
frame of every action pre-rasterized at `ss:2`.

## 11. Production-parity metrics — shipped

`client/src/phaser/debug/avatarMetrics.js` exposes `window.__avatarMetrics()`: pure
`classifySequenceKey`, `computeParseComposition`, `computeResidentAvatarBytes`, `meanOf`,
`recordRenderSample`, `computeDurationMs`, `countDisplayObjects`, `collectResidentAtlasPages`,
`aggregateParseComposition`, plus an I/O aggregator wiring Phaser's `prerender`/`postrender` into
`fps.mean/p5`, `renderMs`, `sprites`, `graphics`, `draws`, `gpuTextures`, `residentAvatarBytes`,
`parseComposition`, `timeToFirstRender`, `timeToPlayCold`. `graphics` and `gpuTextures` are reported but
**never thresholded** — comparing absolute counts across PIXI and Phaser is false precision.

Measured on the raster path (dev machine, headless Chromium, unthrottled — real, not production-comparable):

| Scene | fps.mean | fps.p5 | renderMs | sprites | draws | gpuTextures | residentAvatarBytes | timeToFirstRender | timeToPlayCold |
|---|---|---|---|---|---|---|---|---|---|
| 8 avatars | 263.29 | 49.5 | 0.23 | 616 | 8 | 23 | ~273 MB | 337.5 ms | — |
| 25 avatars | 266.75 | 64.1 | 0.858 | 1925 | 25 | 57 | ~273 MB | 208.4 ms | — |
| cold `llorar` | 547.67 | 20.41 | 1.311 | 77 | 1 | 9 | ~273 MB | — | 50.5 ms |

`residentAvatarBytes` is identical across scene sizes by design (deduped by atlas key), which is what makes
it a per-character figure rather than a per-avatar one.

## 12. Renderer decision: raster, measured

A vector runtime was built behind `VITE_AVATAR_VECTOR`, driven through the harness on the same character and
scenes as the raster path, and measured. **Verdict: raster wins.**

| Measurement | Threshold | Vector measured | Result |
|---|---|---|---|
| `fps.p5`, 25 avatars | ≥ 45 | 108.7 | PASS |
| `fps.mean`, 8 avatars | ≥ 55 | 173.72 | PASS |
| `draws`, 8 avatars | ≤ 60 | 8 | PASS |
| `residentAvatarBytes`, 8 avatars | ≤ 44 MB | 32.0 MB | PASS |
| `renderMs`, 8 avatars | ≤ 2.0 | 0.336 | PASS |
| `timeToFirstRender` | ≤ 506 ms (1.5× raster) | 200.8 ms | PASS |
| `timeToPlayCold` | ≤ 250 ms | **358 ms** | **FAIL** |
| tracked bytes per character | ≤ 1.5 MB | **15.58 MB raw / 3.22 MB gzip** | **FAIL** |
| cross-rasterizer equivalence | pass | **10.5–16.5 % differing pixels at ±32 on 2 of 3 species** | **FAIL** |

**12.1 The performance case for vector was strong and is not what decided it.** fps, draws, renderMs,
resident bytes and time-to-first-render all cleared comfortably, and the run-keyed bake cache's central
prediction was confirmed: `residentAvatarBytesVector` stayed at exactly 32.0 MB from 8 to 25 avatars —
repeated avatars of the same character share the same two runtime-atlas pages. The three failures are
byte weight (§10), cold-parse latency driven by the per-bucket granularity, and correctness.

**12.2 The correctness failure is the one that would have bitten silently.** librsvg (build) and Canvas2D
(runtime) render the same run visibly differently: 21.5 % / 16.5 % differing pixels at tolerance 5 / 32 for
fill+stroke (`rasta down_idle`), 18.6 % / 10.5 % for a linear gradient (`pet09 down_coco`), 13.4 % / 1.3 %
for a clipped fill (`minnieHat down_coco`). Both rasterizers agreed exactly on bounds — `computeBounds` is
shared — so this is pixel values, most plausibly independent antialiasing and gradient-interpolation
implementations. **This contradicts a prediction this design made:** the clip reading was named as the most
plausible source of disagreement, and the clipped case in fact converged best while plain fill+stroke, the
supposedly simplest species, disagreed most. The shipped path uses only librsvg, so this is no longer a
live risk — but it is a hard precondition for anyone reviving a second rasterizer.

**12.3 Removing the vector runtime.** The runtime surface goes; the pure modules the shipped compilers now
depend on stay, because deleting them breaks the build.

*Deleted:* `client/src/phaser/vector/{VectorAvatar,vectorFramePlacement,extractClassMembers}.js` (+ tests);
`client/src/shared/vector/{path2dOps,bakeCache,runtimeAtlas,bucketSplit,mergeVectorBuckets}.js` (+ tests);
`client/src/harness/vectorCrossRasterHarness.js` and its load from `harness/main.js`;
`client/scripts/{split-vector-buckets,verify-cross-rasterizer}.cjs`;
`client/e2e/avatar-vector-spike.spec.js`; `VITE_AVATAR_VECTOR`, `gameConfig.AVATAR_VECTOR` and the
`.env.example` entry; the generated `client/src/assets/game/avatars/<char>/vector/*` bucket JSON; the
harness API's `spawnVectorAvatar`/`loadVectorBucket`/`playVectorKey`/`advanceVector`/`readVectorState`; and
`avatarMetrics`' `residentAvatarBytesVector` + `computeRuntimeAtlasBytes`.

*Kept:* `slotRuns`, `pathBounds`, `packFrames`, `pathSpecies`, `compareRasters`. All five are real
dependencies of `compile-layered-avatar.cjs` / `compile-accessory.cjs` (via `setSharedVectorBounds`
injection and dynamic `import()`), of the authoring tools (§17), and — for `compareRasters` — of the R17b
and R18 gates.

*Directory name.* `client/src/shared/vector/` no longer describes its contents: three of the five modules
are about source vector path data (still accurate), but `packFrames` is atlas packing and `compareRasters`
is raster diffing, and after the deletions the name reads as leftovers from a removed experiment. They move
to **`client/src/shared/assetPipeline/`** — one directory, one accurate name. Cost: ~15 import lines across
the two compilers, `svgFromPaths.cjs`'s injection call, `svgFrameExport/Import.cjs`, the three
`verify-*.cjs` tools and five co-located test files. Cheap, mechanical, and worth it once rather than
leaving every future reader to ask why raster compilers import from `vector/`.

**12.4 What the spike leaves behind that is worth keeping in mind.** A fuller vector implementation could
plausibly close `timeToPlayCold` (true per-animation parse instead of per-bucket) and possibly the byte gap
(a compacted binary format, as production uses). It could not close the cross-rasterizer gap without
abandoning either librsvg at build time or Canvas2D at runtime. This is a named, measured follow-up, not a
discarded experiment — but it is out of scope here, and §13 is what this change actually needs.

## 13. Load time on a slow connection — the objective, and the levers ranked by it

The objective is metric 2 and metric 3 of §6 measured **in seconds on a stated slow connection**, with
metric 4 as a device constraint and metric 1 as a secondary, reported-not-gated concern. Two profiles, so
every number below is falsifiable: **P1 = 2 Mbps ≈ 250 KB/s** and **P2 = Slow 3G ≈ 400 Kbps ≈ 50 KB/s**.

| Lever | M1 tracked | M2 room entry | M3 first action | M4 texture |
|---|---|---|---|---|
| Enable JSON compression at the origin (§13.1) | no | **~5×** | ~2× | no |
| Immutable cache headers for hashed assets (§13.1) | no | **→ ~0 on return visits** | → ~0 | no |
| Split the manifest per pack (§13.2) | no | **~2×** | no | no |
| Per-key action packs (§13.3) | no | no | **~20×** | **~4–20×** |
| Drop the speculative action prefetch (§13.3) | no | no | avoids paying it unused | yes |
| Idle page eviction (§13.3) | no | no | no | yes (concurrent) |
| Atlas/manifest compaction (§9.1) | small | ~1.3× | ~1.2× | no |
| Encoder tuning (§13.5) | yes | small | yes | **no** |
| Shared accessory raster pool (§13.6) | **yes, large** | no | no | yes |
| `ss: 1` for accessory masks (§13.7) | yes | small | yes | yes |

Two structural facts govern the ranking. **A GPU stores decoded RGBA**, so no encoder setting moves metric 4
at all. And **the bytes a player waits for are not the bytes in git**: the 919 MB of hats that dominates
metric 1 is almost entirely action-frame data that is never fetched on room entry, so the accessory encoder
work — the headline of an earlier draft of this section — is correctly ranked seventh here, not first.

### 13.1 The serving tier — verified broken, and the cheapest large win available

Every wire figure in §6 assumes the serving tier compresses JSON. **It does not.** Verified by reading the
actual deployment, not assumed:

- `client/Dockerfile` builds `dist` and copies it into stock `nginx:alpine` with **no** `nginx.conf`, no
  `conf.d` mount and no config of its own. nginx's stock configuration ships `#gzip on;` commented out, and
  its default `gzip_types` is `text/html` only even when enabled.
- `docker/nginx/gzip.conf` **does** exist in the repo, with `gzip on`, `gzip_comp_level 6` and
  `application/json` among its `gzip_types` — and nothing includes it. `docker-compose.yml` mounts it
  nowhere; the client service only sets `VIRTUAL_HOST`/`VIRTUAL_PORT` for an external proxy; no vhost file
  under `docker/nginx/` references it. It is dead configuration, the same class of gap `CLAUDE.md` already
  records for the absent `web/` service.

So room entry ships the manifest at its full **4,134 KB**, not 554 KB, and metric 2 is ≈ **4.9 MB per
character** — no better than production's 4.5 MB, rather than the 4.6× advantage the compressed figure
suggests. Enabling compression is a two-line change worth more than every encoder idea in this section
combined.

The fix, in the client image so it does not depend on an out-of-repo proxy's configuration: copy
`gzip.conf` into `/etc/nginx/conf.d/` in the Dockerfile, and add `gzip_static on` plus a build step that
emits `.gz` siblings for `.json` at level 9 — better ratio than on-the-fly level 6, and zero request-time
CPU. In the same slice, add `Cache-Control: public, max-age=31536000, immutable` for Vite's content-hashed
`assets/` output, which stock nginx also does not set. That is what makes metric 2 a first-visit cost only
(§13.4).

**Acceptance criterion is a measured `content-encoding` and `content-length` per artifact**, before and
after, against the real image — not the presence of the config file. This also settles the caveat §9.2
raised about the bundling slice's 41 % figure being measured against uncompressed bytes: with compression
on at the origin, bundling's remaining win is request count, and the slice should say so.

### 13.2 Split the manifest per pack — metric 2, ~2×

`rasta.layers.manifest.json` is **4,134 KB of the 4,911 KB** room entry currently costs, and it describes
**base and actions together**: 19,926 piece records and 970 frames, of which ~1,300 pieces and 103 frames
are all an idle avatar needs. The atlas is already split per pack; the manifest is not. So a player standing
still downloads the complete metadata for all 26 action sequences.

Split it: `<char>.layers.manifest.json` keeps the character-level fields every path needs (`slots`,
`defaults`, `labels`, `bodyBounds`, `ss`, `sequences`, `aliases`, `mirrors`, and the base `pieces`/`frames`),
and `<char>.actions.manifest.json` carries the action `pieces`/`frames`, loaded with the action pack it
describes. `sequences`/`aliases`/`mirrors` stay in the base manifest because `resolveAnimationKey` and
`computeActionBackedKeys` must know an action *exists* — and which pack backs it — before deciding to fetch
anything. Estimated base manifest ≈ 275 KB raw ≈ 36 KB compressed, taking metric 2 from ≈ 980 KB to
≈ **460 KB** once §13.1 lands, and to ≈ **430 KB** with compaction (§9.1) on top.

### 13.3 Per-key action packs — metric 3, ~20×, and metric 4

`packFrames` currently packs all 17,722 action pieces globally, so any single key's pieces are **scattered
across all four pages**: pressing `llorar` fetches 8.7 MB and decodes 245 MB to draw one sequence. Packing
per key — pages never shared between unrelated animation keys — means a cold action fetches only its own
page and its own frame records.

The objection to per-key packing is lost cross-key dedup. **The measured numbers say there is almost none to
lose:** 17,722 unique pieces from 867 unique frames is ≈ 20.4 unique pieces per frame, i.e. essentially
every run is unique — in sharp contrast to the base pack, where ~1,300 pieces serve 103 frames × ~26 layers
≈ 2,678 placements, a 2.06:1 reuse. Action runs are per-frame path groups, not reusable body parts. So
per-key packing costs approximately nothing and is the single biggest lever on the number the user cares
about: an average key is ~1/26 of the pack ≈ **330 KB** (1.3 s at P1, 6.6 s at P2), and the worst key
(`leftdown_punch_rec`, 320 authored frames) ≈ **1.2 MB** (5 s at P1).

Mechanics: the manifest gains `actionPacks: [{key, page, manifest}]`; action atlas keys become per key;
`pieces[id]` already carries `page`, so `_applyFrame` resolves `_atlasKeys` by `(pack, page)`;
`loadLayeredActions` becomes `loadLayeredActionKey(scene, avatarId, sequenceKey)` with the same in-flight
guard; `computeActionBackedKeys` returns a key→pack map so `unloadedKeys` and the `pack-loading` degrade
stay accurate per key. `_playToken` and the deferred replay are unchanged, and R12 is re-verified per key
rather than per pack. If per-key granularity produces too many tiny pages, the fallback is the
loop/punch/other bucket classification already implemented in `classifySequenceKey` — three packs instead of
26, still ~3× better than today.

Two companion decisions in the same slice. The **prefetch** must go: it currently spends 8.7 MB of a
player's bandwidth and 245 MB of their texture memory on an action nobody triggered, and the
`pack-loading` degrade (already observable, R12) is what makes not prefetching safe. Optionally prefetch the
single most-triggered key on a fast connection only, gated on `navigator.connection.effectiveType`. And
**eviction**: an action page unused for N seconds is released via `scene.textures.remove`, capping
concurrent residency — a complement to per-key packing, not a substitute, since it caps concurrency and not
peak.

### 13.4 The caching story — what makes metric 2 a first-visit cost

Layered packages are reached through dynamic `import()`, so Vite emits **content-hashed filenames** and the
browser HTTP cache is the store. With §13.1's `immutable` headers in place, a returning player pays
**zero** for any package whose bytes have not changed, and a rebuild that changes a package changes its
hash, which is the invalidation — no manual busting, no stale-asset class of bug.

`AssetVersionManager` remains the mechanism for the IndexedDB-backed baked path and for the
`lay.`/`acc.`/`aur.` cache-key classes: `layeredVersions.characters.<char>` feeds
`getArtifactVersion('layered', char)`, `boombang_look_asset_versions` in localStorage records what a client
has, and bumping a character's entry clears its old entries by prefix. The two mechanisms are
complementary and must not be conflated: **content hashes invalidate the HTTP cache, version entries
invalidate IndexedDB.** A character recompile therefore needs both a new build and a version bump, and the
compiler's `sourceHash` stamp is what makes a forgotten bump detectable.

So: first visit pays §13.8's entry budget per distinct character on screen; a second room entry in the same
session pays nothing (textures already resident); a return visit days later pays nothing unless a package
was rebuilt. That is what makes a ~460 KB entry cost acceptable where a 4.9 MB one is not.

### 13.5 Encoder tuning — metric 1 and metric 3, re-ranked below the above

Still worth doing, no longer the headline. The premise an earlier draft escalated — "slotted pieces are
white masks with ~4 alpha levels stored as lossless RGBA, so alpha-only encoding is the big win" — is only
half safe. Verified: the compilers encode with `webp({lossless: true})` and nothing else (fact O), and
slotted runs rasterize white (§5.2). **Not** verified, and analysis suggests wrong: that the RGB planes are
where the bytes are. Lossless WebP predicts spatially per channel, so a constant-white RGB plane should
already cost near nothing, which puts the bytes in **alpha entropy × pixel count** — and librsvg
antialiasing at `density: 144` produces a full 0–255 alpha ramp at every edge, not the ~4 levels the
*authored* masks carry (fact C).

`client/scripts/measure-asset-bytes.cjs` settles it, reporting per package: total `.webp` bytes; bytes
attributable to RGB versus alpha (re-encode with alpha stripped, and with RGB flattened, and diff); the
alpha-level histogram of a sample of slotted pieces; page pixel count; and Σ `w × h × 4`. Then sweep and
keep whatever the fidelity gate allows: `effort: 6` (from sharp's default 4 — pure compute, zero fidelity
cost, free by definition); `nearLossless` at 60/80; and for slotted mask pages only, lossy with
`alphaQuality` at 100/90/80, since the RGB plane of a white mask carries no information.

Rejected with reasoning: packing three masks into one image's RGB channels for a 3× win would need a
channel-swizzle shader, reintroducing exactly the per-instance pipeline cost `setTint` was chosen to avoid
(archived §5).

### 13.6 Shared per-key accessory raster pool — metric 1 only, measure the overlap first

442 hats dominate tracked bytes and touch **neither** metric 2 nor metric 3, because only a hat's
idle/walk/talk frames are fetched on room entry and its action frames follow the same per-key laziness as
the body's. So this is a repo-health lever, correctly ranked after load time.

26 distinct hat keys are each authored under 17 characters. `compile-accessory.cjs`'s own note says those
packages differ per character (geometry, frame counts, even sequence lengths), so identity cannot be
assumed — but the *raster* of a run is shape only, with position carried by placement metadata, so two
characters' `Custom6Hat` could share most rasters while keeping different anchors. Task: hash every run
raster across all 17 `Custom6Hat` packages and report the shared fraction. If it is high, the fix preserves
§7 exactly — **rasters shared per key, anchors per character**: one `accessories/hat/_shared/<key>/` pool
plus 17 small per-character placement manifests, with anchor resolution, the `(char, kind, key)` registry
and the `packageBase` tier all unchanged because only the texture source is shared. If it is low the lever
is dead and the report says so.

### 13.7 `ss: 1` for accessory masks — a question, not an assumption

The only lever that moves metrics 1, 3 and 4 together, ~4× each, and the one the user ruled out for the
body. **Whether that ruling extends to accessory masks is not for this design to decide.** For: a hat never
fills the screen, its slotted pieces are antialiased masks, and it is ~90 % of the pixel count behind a
15.79 Mpx² hat page. Against: `_applyFrame` renders pieces at **native** scale — the game's art space is
`ss:2` native — so halving accessory density is visible at 1:1, not absorbed by a downscale.

Recommendation: put it to the user only if §13.1–§13.3 leave the metric 4 gate unmet, with the measured
report attached. Framed that way it is a real decision with a real cost rather than a speculative ask.

### 13.8 Targets and the gate

Measured on `rasta`, `minnieHat`, `Custom6Hat` (two characters) before any mass compile. **R18** is this
gate; the roster-migration slices do not start until it passes.

| Metric | Today | Gate | P1 (250 KB/s) | P2 (50 KB/s) |
|---|---|---|---|---|
| M2 room entry, first visit, per character | ≈ 4.9 MB | **≤ 600 KB** | ≤ 2.4 s | ≤ 12 s |
| M2 room entry, return visit | ≈ 4.9 MB | **≈ 0** (immutable cache) | ≈ 0 | ≈ 0 |
| M3 first action, typical key | ≈ 8.7 MB | **≤ 400 KB** | ≤ 1.6 s | ≤ 8 s |
| M3 first action, worst key | ≈ 8.7 MB | **≤ 1.2 MB** | ≤ 5 s | ≤ 24 s |
| M4 per character, one action played | ≈ 273 MB | **≤ 80 MB** | — | — |
| M1 roster tracked | ≈ 1.13 GB | ≤ 400 MB, **reported not blocking** | — | — |
| Fidelity, any encoder change | — | ≤ 1 % differing pixels at tolerance 8, 0 at tolerance 32, via `compareRasters` against the lossless baseline | — | — |

Transfer figures are measured as real `content-length` over HTTP against the built image, with compression
as served — not computed from file sizes on disk. If a gate cannot be met, the escalation is §13.7's `ss`
question with the report attached, not a quietly relaxed threshold: dropping actions is excluded by the
2026-08-17 decision, and `.gitignore`/LFS/CDN-only by the 2026-08-18 one.

## 14. Harness and test strategy

**Shipped harness.** `@playwright/test` + chromium; `client/playwright.config.js`
(`testDir: './e2e'`, `webServer` runs `npm run dev`). Dev-only `client/harness.html` →
`client/src/harness/main.js` boots a bare `Phaser.Game` with `AvatarHarnessScene` supplying `users={}`,
`isSceneReady=true`, `sceneScaleFactor=1`, the real `shadow` textures and a `tintMgr` stub.
`spawnAvatarUser.js` is the single spawn primitive both `PerfHarness.spawnGhosts(n, {avatarId})` and
`window.__avatarHarness.spawnAvatar` delegate to. `readState` returns resolved values only — child order
after `sort('depth')`, per-child `x/y/depth/visible/flipX/displayWidth/textureKey/frameName/tint`, and body
`requestedKey/sequenceKey/sourceKey/mirrored/seqIndex/visibleBounds/slotTints`. `advance(ms)` drives the
registry directly, which is what makes the matrix finite: `leftdown_punch_rec` is 400 frames at 19 fps
≈ 21 s of wall clock.

Six environment facts found live and worth keeping visible: `vite.config.js` sets no
`rollupOptions.input`, and Vite's default builds only the root `index.html` (verified — no `harness.html`
in `dist/`); `baseURL` uses `localhost:5183` because this machine resolves `localhost` to `::1` and Vite
without `--host` binds only that; the scene must **not** be paused, because pausing stops `scene.load`'s
progress polling and hangs every `load.once('complete')` promise, so ticking is removed by patching
`layeredAvatarRegistry.update` to a no-op; `spawnAvatarUser` must call `avatarManager.loadAvatar` before
`AddUserController.processUser`, since the layered branch only engages when the manifest is *already*
resident; `computeVisibleBounds` subtracts the container's world position, because `getBounds()` is
world-space and R5's near-zero `centerX` only holds container-local; and `playChat` exists beyond the
original API surface because R7 needs a compiled non-repeating sequence and `UserChatAnimation.main` is the
real production controller that both targets `down_talk` and registers the one-time `animationcomplete`
listener.

**R1–R14 and R17 are green** (54 unit files / 409 tests; 22/22 e2e). R1/R2 container order and depths;
R3/R4 pet side and `flipX` across 8 directions; R5 shadow alignment with measured mirror antisymmetry
(`right −27 / left +27`, `downright −12.5 / downleft +12.5`, `upright −19.4 / upleft +19.4`, `down ≈ −0.2`,
`up 0`); R6 `llorar` plays; R7 return to idle via the real listener; R8 palette retained across three
sample points; R9 uncovered key reported; R10 per-character anchor (rasta only so far); R11 all 65
resolvable keys resolve to themselves with `degraded === false`; R12 lazy-pack degrade then auto-replay;
R13 `animationupdate` carries the requested key; R14 parity metrics; R17 authoring round-trip losslessness.
R15 (bundle equivalence) lands with §9.2. R16 is retired with the vector runtime.

**Two new ids for the remaining scope.** **R18** is §13.8's load-time and memory gate: real HTTP
`content-length` and `content-encoding` per artifact on both slow-connection profiles, live
`residentAvatarBytes`, and a `compareRasters` fidelity check for any encoder change. **R19** is the
**roster matrix**: R1–R13 parameterized over every migrated character × all 8 directions, including shadow
alignment and mirror antisymmetry per direction. The suite covers `rasta` only today; R19 is what makes
"every migrated character passes" an executed fact rather than an intention, and each migration slice
extends its character list.

**Which assertions read rendered state.** RS = resolved rendered state (Playwright, live container);
PF = pure function. No requirement is covered by PF alone.

| Requirement | RS | PF |
|---|---|---|
| Actions play, not stay idle (LR delta) | **R6, R11**, per character via **R19** | `resolveAnimationKey`; `bakedKeyMap`; completeness gate |
| Palette survives the action (LR delta) | **R8** | `partitionSlotRuns`; species branching + `fillOverride` |
| `animationcomplete` (LR delta) | **R7** | `advanceSequence` boundaries |
| `animationupdate` + requested-key identity | **R13** | `_requestedKey` survives alias and mirror resolution |
| Roster-wide resolved-state validation (LR delta) | **R19** — 18 characters × 8 directions | manifest validation per character |
| Shadow alignment per direction (LR delta) | **R5**, per character via **R19** | `reflectSpan`, `resolveRenderPosition` |
| Per-character anchor (ACC delta) | **R10** (needs a second migrated character) | registry resolution; `checkManifestCharMismatch`; `parseAccessoryAssetPath` |
| Pet declared side, `flipX` only (ACC delta) | **R3, R4** | `derivePetSide` incl. ambiguous-fails; `resolvePetSideX` |
| Aura topmost (ACC delta) | **R1, R2** | `resolveAccessoryDepth` total-order property |
| Degrade observable (ACC delta) | **R9, R12** | `degradeReporter` warn-once/count-rest |
| Load time and memory (§13) | **R18** — real HTTP `content-length`/`content-encoding` per artifact plus live `residentAvatarBytes`, i.e. an integration measurement, neither a container read nor a pure function | `compareRasters` fidelity for any encoder change |
| Bundling changes nothing observable | **R15** | ZIP member listing; STORE/DEFLATE selection |
| Authoring round-trip is lossless (§17) | **R17b** compiled-raster pixel comparison; an edit's *rendered* effect via R10/R3 | **R17a** structural deep-equal; sidecar recovery; each reject case |

Commands: `cd client && npm run test`, `cd client && npm run test:e2e`, `cd api && ./vendor/bin/phpunit`
(**blocked** — PHP is absent from the environment; §19 risk 14).

## 15. Delivery — the raster continuation

Budget is hand-written changed lines; generated and compiled bytes are excluded. Feature Branch Chain with
a draft tracker; each child targets its immediate parent and carries a dependency diagram marking itself
`📍`.

**Slices 1–11 — done, live-verified**: depth table, animation events, degrade telemetry; Playwright
harness; pet canonical side; character-scoped accessory registry; vector→raster action pipeline (rasta's
full 26-key action set); lazy action pack; parity metrics; the renderer spike and its verdict; glob
registries; `sally` registration; asset-authoring round-trip.

| # | Slice | Depends on | Hand-written |
|---|---|---|---|
| 12 | **Vector removal** (§12.3): delete the runtime surface, flag and generated buckets; move the five kept modules to `shared/assetPipeline/`; re-verify both compilers byte-identical and the full suite green | 11 | ~200 |
| 13 | **Serving tier** (§13.1): `gzip.conf` into the client image, `gzip_static` + build-time `.gz` siblings, `immutable` headers for hashed assets; plus `client/e2e/avatar-transfer.spec.js` reading real `content-length`/`content-encoding` per artifact — the measurement R18 depends on | 12 | ~200 |
| 14 | **Manifest split per pack** (§13.2): base manifest keeps character-level fields + base pieces/frames, actions manifest ships with its pack; measured metric-2 delta | 13 | ~260 |
| 15 | **Per-key action packs + prefetch removal + eviction** (§13.3): `actionPacks`, per-key atlas keys, `loadLayeredActionKey`, drop the speculative prefetch, idle `textures.remove`; R12 re-verified per key | 14 | ~400 |
| 16 | Compaction (§9.1) + bundling (§9.2), R15 — now a load-time lever, so it lands before the gate | 15 | ~360 |
| 17 | **Byte measurement + encoder tuning** (§13.5): `measure-asset-bytes.cjs` on `rasta`/`minnieHat`/`Custom6Hat`/`pet09`, then the `effort`/`nearLossless`/`alphaQuality` sweep with the `compareRasters` fidelity check | 16 | ~340 |
| 18 | **Shared accessory raster pool** (§13.6): overlap measurement across 17 `Custom6Hat` packages, then the shared pool + per-character placement manifests **only if** the number justifies it | 17 | ~300 |
| 19 | **R18 GATE** (§13.8). Blocking: the roster slices do not start until the measured packages hit the M2/M3/M4 and fidelity thresholds, with M1 reported | 18 | ~120 |
| 20 | **R19 harness matrix**: parameterize R1–R13 over a character list, extend `spawnAvatar` to any migrated character, add per-direction shadow-alignment and mirror-antisymmetry assertions | 19 | ~280 |
| 21 | `sally` asset compile: stage, compile with `--emit-config-shim`, wire `AvatarsDataPreload.js` (§19 risk 13), R19 for sally | 20 | ~60 |
| 22 | `ghost` + `wraith` via `--from-vector` (§5.6) with the baked-dimension gate; R19 for both | 20 | ~220 |
| 23 | Bodies: `brujita, cholo, empollon, gata`; R19 extended | 22 | ~40 |
| 24 | Bodies: `india, lilian, marsu, modern`; completes R10 pairwise (`Custom6Hat` on `lilian` vs `rasta`) | 23 | ~60 |
| 25 | Bodies: `ninja, werewolf, yayo, boomer` | 24 | ~40 |
| 26 | Bodies: `skeleton, zombie` | 25 | ~30 |
| 27–30 | Accessories, 4–5 characters per slice across the 17-character roster: 26 hats + 10 pets each, 612 packages | 26 | ~30 each |
| 31 | **Roster-scale regression gate**: re-run metrics 2, 3 and 4 with all 18 characters registered and a room holding several *different* characters — not one. Transfer composes additively per distinct character on screen, and texture memory, page pressure and draw batching are roster-scale properties that per-character numbers do not compose into | 30 | ~140 |
| 32 | Aura pagination + `aura_azul`/`aura_dorada` (conditional on slice 31's headroom) | 31 | ~120 |

Ordering rationale. Slice 12 first because leaving a removed architecture's runtime in the tree makes every
later diff ambiguous. **Slice 13 is second because it is the cheapest and largest win in the whole plan** —
two lines of nginx configuration against a 5× improvement on the number the user actually asked about — and
because every later transfer figure is unmeasurable without its `content-length` harness. Slices 14–16 then
attack metrics 2 and 3 structurally, in descending order of effect, and only then does slice 17 reach the
encoder work that an earlier draft of this design had ranked first. Slices 13–19 all precede any mass
compile, per the user's decision: the 630 packages are written once, in their final packing and encoding,
rather than compiled and then reworked. Slice 20 precedes every migration because "every migrated character
passes the harness across all 8 directions" is unenforceable while the matrix is hardcoded to `rasta`.
`sally` and `ghost`/`wraith` precede the plain batches because each exercises a distinct compiler path
(`--emit-config-shim`, `--from-vector`). `boomer` sits late, being the name-reconciled character with the
widest palette (9 slots vs rasta's 7). Accessories come last: they are the largest byte mass, they benefit
most from slices 17–18 being settled, and they are the only class that touches metric 1 without touching
load time.

**Review honesty:** slices 21–30 are dominated by generated bytes and no human will review hundreds of
megabytes. Their real gate is R19 plus slices 19 and 31, not line review.

**Rollback.** `VITE_LAYERED_AVATARS=false` for everything; `VITE_AVATAR_BUNDLES=false` reverts to per-file
loading; per character, remove its version-dict entry (the glob registry follows the on-disk files, so
deleting a character's directory is a complete removal); per item, revert one slice. `sally` is the one
exception: with the layered flag off it falls back to the default avatar via `LAYERED_ONLY_CHARACTERS`
(§16) rather than rendering baked art.

## 16. `sally` as a new client character

Registration is shipped: `SALLY: 18` in both `AvatarEnum`s; `getAvatarName` and both `avatarName()`
switches; `AssetVersionManager` (`avatars[18]` + `layeredVersions.characters.sally`);
`LAYERED_ONLY_CHARACTERS = new Set([AvatarEnum.SALLY])` with `loadAvatar` rejecting immediately (naming the
avatarId) when a layered-only character's layered path is unusable, **before** falling through to
`avatarLoaders` — an explicit documented rule, not an accident of a missing map entry, proven by the pure
`shouldRejectAsLayeredOnly`. Server side: 11 `SALLY_*` constants in `AnimationBlockTimerEnum` and 8
`[AvatarEnum.SALLY]` entries in `EmojisBlockActionsMap` — the real file structure, which has 11 constants
and 8 emoji-keyed blocks, not the 12/12 earlier drafts of this design estimated.

`compile-layered-avatar.cjs --emit-config-shim` derives a baked-shaped `config.json` (`atlasKey: null`,
`prefix`, `flip_horizontally`, `start`/`end`, `frameRate`, `frameWidth`/`Height`, `repeat`, `positionX`/`Y`)
per `sequences` and `mirrors` key from `bodyBounds`/`frames[].o`, so every
`window.avatars_config[avatarId]` consumer sees a well-formed entry while nothing names a baked atlas.
Verified opt-in: recompiling `rasta` without the flag left its real baked `config.json` md5 unchanged.

Ownership is a `catalog_items` row (`user_decoration_type='avatar'`, `user_decoration_value='18'`,
`sprite_name='avatar_sally'`) created by `api/database/seeders/SallyAvatarCatalogItemSeeder.php`, matching
rasta's real production row shape verified against `boombang_api.sql`, and deliberately **not** wired into
`DatabaseSeeder.php`'s automatic chain (matching `ImportAvatarsSeeder.php`'s precedent as a manually
invoked seeder). It has **not** been executed against a database (§19 risk 14).

Two items remain and land in slice 20: sally's asset compile, and the one-line
`AvatarsDataPreload.js` wiring that compile unblocks. The wiring could not land earlier because
`AvatarsDataPreload.js` uses static imports and a static import of a nonexistent file breaks Vite's build
for **every** character, not just sally; fabricating a placeholder shim from invented frame data was
considered and rejected, since `buildConfigShim`'s whole purpose is to derive real values from a real
manifest. Sally is absent from the accessory roster, so it ships accessory-less — verified to miss through
the same generic registry-miss path any unregistered character does, with no sally-specific branch
anywhere.

## 17. Asset-authoring round-trip

A `.bb` is a compiled artifact, so changing anything inside one means unpacking it, editing, and repacking.
Tooling for humans, not runtime, and independent of the renderer decision.

**17.1 Tier 1 — repositioning, via a committed annotation.** `accessory-annotations.json` carries
`regXOffset`/`regYOffset` alongside `scale` and `groundOffsetY`. `compile-accessory.cjs` shifts every
frame's own `regX`/`regY` by the resolved offset **before** the pet-side derivation and every other
downstream consumer runs, so it lands in the value `resolveAccessoryPlacement` actually reads (`base.regX`/
`regY` were previously dead fields; they now carry the offset too). Two numbers in a diffable committed
file, no unpack, and unlosable by construction (§4).

Live-verified end to end on resolved rendered state, not by computation: with `minnieHat` on a real spawned
avatar facing `down`, baseline hat `x=2.8, y=-183.4`; with `regXOffset:5, regYOffset:-3`, `x=12.8,
y=-189.4` — `Δx = 10.0 = 5 × ss(2)` and `Δy = -6.0 = -3 × ss(2)`, exact; reverting restored the baseline
exactly. Because the annotation key is `<char>/<kind>/<key>`, an offset for `rasta/hat/Custom6Hat` cannot
leak onto `lilian/hat/Custom6Hat` — the per-character anchoring requirement as a human workflow.

**17.2 Tier 2 — design changes, via the SVG round-trip.** `bb-unpack.cjs`/`bb-pack.cjs` use `fflate` rather
than the `zip` CLI because R17a needs a **deterministic** archive: `buildZipEntries` sorts entries by path
and stamps every one with a fixed mtime (`2020-01-01`; epoch itself is outside the DOS zip date range).
Scratch unpacking goes to gitignored `.assets-src/authoring/`; hand edits are committed as a **sparse
overlay** under `client/asset-overrides/<char>/<kind>/<key>/`, applied by
`apply-asset-overrides.cjs` in a staging step inserted between accessory staging and compile, which throws
if the target package does not exist. An override is a whole-file replacement of one
`_frames_<anim>.json`, so only edited animations are committed.

`exportFrameSvg` reuses `svgFromPaths`/`computeBounds` — the editing canvas is the compile canvas — splices
`data-bb-origin="x,y"` onto the root as the authoritative origin, resolves a slotted path's exported fill
to its slot default so a designer sees the character rather than a silhouette, and writes a sidecar
carrying `{species, slot?, k?}` per path in document order plus `cl` and `origin` verbatim. **The sidecar is
authoritative and `data-bb-slot` is redundancy**, because editors differ on preserving `data-*`
attributes; a disagreement between them is a failure, not a tie-break. `d` strings are copied **verbatim**
via attribute extraction, never parsed and re-serialized, which is what makes exact losslessness attainable.

`importFrameSvg` strips `<g data-bb-role="guide">` groups and `<defs>` — a `<clipPath>` def's own `<path>`
is the clip shape, not one of the frame's pieces, a distinction found by the first real-frame run hitting a
genuine "31 vs 30" count mismatch. It **rejects rather than guesses**, each case independently tested: path
count mismatch; `data-bb-slot` disagreeing with the sidecar; a radial gradient; a gradient carrying
`gradientTransform`; `objectBoundingBox` units; a command outside `M/L/Q/Z/C`; a missing root origin. One
documented behaviour rather than a surprise: a slotted path's fill is **discarded** on import (§5.2
neutralizes it anyway), so recolouring a slotted path has no effect and the importer warns — a designer
doing that meant a palette change, which belongs in `colormeta.json`.

Scope, stated plainly: the importer extracts `<path>`/`<linearGradient>`/`<stop>` by regex over this
project's own controlled export format. It is not a general-purpose SVG parser. An editor that restructures
markup unusually surfaces as an import **failure**, consistent with reject-don't-guess, but would need the
importer extended.

**17.3 R17, the losslessness gate.** **R17a** (unpack → repack, JSON deep-equal with key-order
independence, non-JSON byte-identical) passed on all five representative archives: `rasta.layers.bb` 2,221
entries, `rasta.bb` 100, `Custom6Hat`/`minnieHat`/`pet09` 83 each. **R17b** (unpack → SVG export → unedited
import → recompile → compare via `compareRasters` at tolerance **0**) passed with exactly **0** differing
pixels on `minnieHat down_idle` frame 0 (fill, stroke, clip; 23,288 px) and `pet09 down_coco` frame 0
(fill, gradient; 5,568 px). Coverage is two frames chosen to span all three species plus a clip, not every
frame of every named package — the remaining requirement is the full package set, and it is cheap to extend
now that the tooling exists.

**17.4 Why it is renderer-independent.** It operates on the **source** `.bb` packages, upstream of any
renderer, so it is the project's escape hatch for asset defects generally: a package with a bad origin or a
stray path can be corrected and committed as a sparse override instead of blocking on upstream art.

**One caveat.** The dump's `.bb` entries are unencrypted (its `_README` reports 2,467 encrypted entries read
and rewritten unencrypted), so an archive we repack is readable by *our* client. The original production
`.bb` carried encrypted entries, so a repacked archive is **not** guaranteed to be accepted by the
production client. Recorded only to prevent that assumption.

## 18. Costs of the decisions above

1. **Settling the renderer by measurement** — retired the byte premise with a number and confirmed the
   raster path on our own client. Cost: one built-and-deleted runtime, and a residual temptation to revive
   it (§12.4).
2. **Removing the vector runtime rather than leaving it inert** — every later diff is unambiguous. Cost:
   ~200 lines of working, measured code deleted, recoverable only from history, plus ~15 import lines of
   churn from the directory rename.
3. **Optimising for player load time rather than tracked bytes** — the levers are ranked by what a player on
   a slow connection actually waits for, which demoted the accessory encoder work from first to seventh.
   Cost: metric 1 stays large (≈ 1.13 GB until §13.5–§13.6 land, and reported rather than gated), so repo
   health is deliberately traded for load time.
4. **Fixing the serving tier first** — two lines of nginx configuration against a ~5× improvement on metric
   2. Cost: it moves a correctness-critical property into deployment configuration, where nothing in the
   test suite guards it; R18's measured `content-encoding` is the only thing that would catch a regression,
   and only if it is re-run.
5. **Splitting the manifest per pack** — an idle avatar stops downloading metadata for 26 action sequences.
   Cost: two manifest artifacts per character instead of one, and `sequences`/`aliases`/`mirrors` must stay
   in the base manifest so key resolution works before any action pack is fetched.
6. **Per-key action packs** — ~20× on metric 3 and ~4–20× on metric 4 at essentially no dedup cost,
   justified by the measured 20.4-unique-pieces-per-frame figure. Cost: per-key atlas keys and a pack
   dimension threaded through `computeActionBackedKeys`, `unloadedKeys` and the loader, plus a request-count
   risk on high-latency links (§19 risk 6) with the three-bucket fallback as the mitigation.
7. **Dropping the speculative action prefetch** — stops every avatar spending 8.7 MB of bandwidth and 245 MB
   of texture memory on an action nobody triggered. Cost: a cold first action degrades observably (R12) more
   often than today.
8. **Measure-then-optimise-then-compile** — 630 packages are written once in their final form. Cost: seven
   slices of delay before any character migrates, and a real chance R18 cannot be met without a further user
   decision (§13.7).
9. **Full action set** — every trigger works, including combat. Cost: §6's four metrics, and slices 13–19.
10. **All 612 accessories tracked** — the complete catalogue with per-character anchors. Cost: the dominant
    term in metric 1, and unreviewable by line.
11. **Bundling as delivery, not storage** — git keeps compressible, deltable loose files. Cost: a second
    load path behind a flag, and — once §13.1 turns compression on at the origin — a remaining win that is
    request count rather than bytes, which the slice must state honestly.
12. **Compaction with runtime expansion** — ~70–80 % JSON reduction, now a load-time lever rather than
    tidiness. Cost: the on-disk form is no longer human-readable without `--emit-verbose`, and two expanders
    become load-path-critical.
13. **`sally` as a new id** — satisfies the delta as written instead of amending it. Cost: two enums, a
    block-timer map, a generated shim, a `LAYERED_ONLY` rule, an unexecuted seeder, and a deferred
    one-line preload wiring.
14. **`ghost`/`wraith` from vector** — completes the roster over proven code. Cost: the origin-space gate is
    replaced by a baked-dimension cross-check, a weaker guarantee.
15. **White-mask fill override** — correct multiply-tint by construction. Cost: a slotted path's authored
    colour is discarded, and the white RGB plane is likely *not* where the bytes are (§13.5).
16. **Pet side derived, not authored** — no new source field, no runtime heuristic. Cost: ambiguity fails
    the compile and needs a manual annotation.
17. **Glob registries** — per-package wiring stops scaling with package count. Cost: registry contents
    become implicit in the directory layout, so a mis-staged path is a silent absence;
    `parseAccessoryAssetPath` and the `load()` miss-throw are the compensating checks.
18. **Two-tier authoring, sidecar authoritative** — repositioning costs two numbers, design changes get a
    real editor workflow, neither is losable to a re-stage. Cost: the round-trip is only lossless for
    editors that leave untouched `d` strings alone, overrides are whole-file, and `asset-overrides/` is a
    second committed place where per-package truth lives.
19. **Dev-only harness page** — no server/API/DB/login dependency, and `advance(ms)` makes the matrix
    finite. Cost: a *near*-production assembly path, so a defect living purely in scene setup stays outside
    its reach.

## 19. Risks

1. **Slow-connection load time has never been measured, only computed.** Every figure in §6 and §13 is
   derived from file sizes and gzip ratios, not from a real request against the built image on a throttled
   connection. `timeToPlayCold` (358 ms for vector, 50.5 ms for raster) was measured on localhost and is
   silent about the thing that matters. Slice 13's `content-length` harness is the first artifact in this
   change that would make any of these numbers falsifiable, and until it runs the whole of §13 is a plan
   built on arithmetic.
2. **The compression finding depends on a serving tier partly outside this repository.** The client image
   demonstrably ships stock `nginx:alpine` with `#gzip on;` commented and `gzip.conf` wired into nothing —
   that part is verified by reading `client/Dockerfile`, `docker-compose.yml` and every file under
   `docker/nginx/`. What is **not** verifiable here is the external reverse proxy: `docker-compose.yml` only
   sets `VIRTUAL_HOST`/`VIRTUAL_PORT` for a proxy defined outside this repo, and some nginx-proxy templates
   compress `application/json` themselves. So metric 2 today is either ≈ 4.9 MB or ≈ 980 KB depending on
   infrastructure nobody in this change controls. Fixing it at the origin is correct regardless, and the
   acceptance criterion is a measured end-to-end `content-encoding` — not the presence of a config file.
3. **Resident texture memory may bind before bandwidth does.** 273 MB per character with actions loaded;
   eight distinct characters that have each acted is ≈ 2.2 GB. §13.3 targets ~4–20× and §13.8 gates at
   80 MB, but even at target, eight characters is ≈ 640 MB — above what a modest mobile GPU tolerates, and
   production sits at ~22 MB total. Slice 31 is the only place this is measured across several *different*
   characters, and it sits after the accessory compiles. If it fails there the remedies are eviction tuning
   and §13.7's `ss` question, both of which would have been cheaper to answer earlier.
4. **R18 may not be reachable within the current rulings.** Actions cannot be dropped, `.gitignore`/LFS/
   CDN-only are excluded, and body density is fixed. If §13.1–§13.6 fall short, the only lever left is
   accessory `ss` — a user decision this design deliberately does not pre-empt.
5. **Two of §13's levers are sized by measurements that have not run yet.** The encoder sweep's premise —
   that alpha entropy rather than RGB channel waste dominates — contradicts an escalation an earlier draft
   of this design recommended, and is untested. Cross-character accessory overlap (§13.6) is either the
   single biggest metric-1 win or worth nothing, and which one is unknown until the hashes are compared.
6. **Per-key action packs trade one risk for another.** 26 packs per character instead of one means 26
   small requests instead of four large ones, and on a high-latency connection request overhead can eat the
   byte win. The `classifySequenceKey` bucket fallback (three packs) exists for that case, but which
   granularity is right is a measurement, not a decision this design can make in advance.
7. **The frozen `proposal.md` non-goal about a vector runtime was violated to test it, and upheld by the
   result.** The code is now removed, so the tree matches the non-goal again — but the change's history
   contains a subsystem the proposal forbade, and that belongs on the sync agenda rather than in the
   archive unremarked.
8. **Two further frozen-artifact divergences**: `ghost`/`wraith` are migrated although the LR delta says
   such a character "MUST NOT be required to migrate" (additive, not violating, but against intent), and
   the 612-package volume exceeds what "Affected areas" anticipated.
9. **Delivery bundling and the authoring round-trip have no spec delta** — two user-approved capabilities
   with no requirement defining "correct" beyond R15's and R17's equivalence assertions. Sync should add
   deltas or record them as explicitly unspecified build concerns.
10. **`sally` makes rollback asymmetric** — with the flag off it falls back to the default avatar rather
    than "restoring the baked renderer for all characters" as `proposal.md` states.
11. **Manual authoring annotations remain fragile in a way tooling cannot fix.** They now live in a
    committed file that a re-stage cannot destroy, but nothing verifies that a package *needs* one — only
    human visual judgement does, and that does not scale to 612 packages. Expect some accessories to ship
    subtly mis-scaled.
12. **No vector editor has been validated for the Tier 2 round-trip.** R17 proves our exporter and importer
    agree with each other; the apply environment had no GUI, so no editor was tried. None should be assumed
    to work until someone records a real result.
13. **`AvatarsDataPreload.js` is not wired for sally**, because the static import it needs targets a file
    that does not exist until her compile runs. One line, blocked on slice 21 — but until then
    `window.avatars_config[18]` is absent, and any baked-path consumer reaching for it would throw.
14. **`phpunit` has never run.** PHP is absent from the environment (`command not found`), so
    `SallyAvatarCatalogItemSeeder.php` was reviewed against real production data in `boombang_api.sql` but
    never executed against a database. Sally is unselectable until someone with a working PHP/Laravel
    environment runs it and confirms the row.
15. **R17b covers two frames, not the five named packages**, and R10 is still rasta-only pending a second
    migrated character. Both are cheap to extend and both are currently narrower than this design's own
    stated requirement.
16. **`layers-hats.json` is a reference-game catalog index, not a work list** — it promises hats such as
    `pandaHat` that exist only in some characters' directories. The authoritative inventory is the on-disk
    `personajes/<char>/{hat,pet}/*.bb` scan.
17. **Both reversals can surprise.** An aura at `1.80` draws over headwear, and a pet clamped to one side no
    longer reads as "behind the body" in left-facing poses. User-locked and recorded as intentional;
    R1–R4 make either regression detectable.
18. **The harness asserts numeric state, not pixels.** A defect placing every child at the correct
    `x/y/depth` and still looking wrong — wrong texture page, inverted alpha, mis-clipped mask, a stroke
    rendered as a fill — passes R1–R14 and R19; R17b and R18 compare *compiled rasters* and byte counts, not
    the rendered scene. With ~41 sequences × 18 characters no human will watch them end to end. The
    compiler's crash-level gates caught the real data defects so far (zero-area stroke bbox, sub-pixel
    sliver, gradient species, clip-def double-count), which is evidence both that the gates work and that
    unknown species may remain.
