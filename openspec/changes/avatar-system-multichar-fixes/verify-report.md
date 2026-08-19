Verdict: PASS
Verify attempt: 1
Live validation: performed — real Docker stack (client :8080, server :3000, api-proxy :8000), logged in as `God`/`test`, entered `Area 51` (real `PublicScene`), triggered the "Cry" emoji, read `containerUser.list` and `spriteAvatar` state directly via `window.game`. See "Live functional validation" below for the full operator flow and negative control.
Core surface: no — this change is entirely `client/src/phaser/**` game-rendering code (layered avatar renderer, accessory manager, compile scripts) plus compiled asset packages. None of it is loaded by an agent-runtime harness (no `.claude/agents/`, `.claude/hooks/`, `.claude/commands/`, no plugin manifest/settings.json hook registration, no CLAUDE.md declaration of these files as harness control surface). A defect here is caught by this project's own test suite and by a human playing the game, not only by the harness running — the stricter core-surface bar does not apply.

## Summary

`avatar-system-multichar-fixes` closes out slices 1–32 of a 33-slice chain (slice 33, aura
pagination, is explicitly and honestly deferred, not silently dropped). All six of the user's
original defect reports are fixed and each is covered by an assertion that would actually catch a
regression, not merely a pure-function test. 16 of 18 roster characters are migrated
(`ghost`/`wraith` deferred per an explicit 2026-08-19 user decision, recorded honestly as
non-migrated everywhere — coverage tables, contact-sheet index, M1 tracked bytes). The client unit
and e2e suites both reproduce their last-recorded numbers exactly on a fresh run in this session.
Live validation against the running Docker stack (not just the harness) confirms requirement 1
(action plays, palette persists), requirement 2 (pet stays right, matches manifest), and
requirement 3 (aura resolves above body) with real, resolved `containerUser` state read directly
from the live game object — and incidentally reproduced, live, the one already-disclosed
DB-only gap (a stale `hat_minnie` catalog value that the client's `minnieHat`-keyed registry
silently does not match), exactly as `apply-progress.md`'s own "Correction 3" describes it.

## Requirement-by-requirement verification (user's original six, Spanish preserved)

1. **"ahora las acciones como reirse, llorar etc no se lanzan"** — FIXED. `LayeredAvatar`'s
   `animationcomplete` event, the full vector→raster action-compile pipeline, and
   `resolveAnimationKey`'s observable degrade path are all real and tested (`sequenceClock.test.js`,
   `fallback.test.js`, e2e `R6`/`R6-degrade`/`R7`/`R9`/`R12`). R6 (`avatar-resolved-state.spec.js`)
   drives the REAL `UserEmojiAnimation.main` path, not a mock, and asserts the resolved
   `sequenceKey`/`seqIndex` actually advance. **Live-reproduced**: clicking the game's own "Cry"
   button on the real `PublicScene` first showed the observable `pack-loading` degrade
   (`[layered] degraded animation: requested "llorar" resolved to "down_idle" (reason:
   pack-loading, avatarId: 12)`), then a second click resolved to `seqKey: "down_llorar"`,
   `requestedKey: "llorar"` — the action genuinely plays, exactly matching R12's lazy-load
   contract and the design's own architecture.
2. **"cuando camina hegaonal o isquerda el pet aparece a la isquerda... deberia simplemente
   girarse"** — FIXED. `resolvePetSideX` (`pivot.js`) unconditionally clamps to the
   manifest-declared canonical side (deleted the antisymmetric `clearBodySilhouetteX`). R3/R4
   (`avatar-resolved-state.spec.js`) pin against an explicit, human-decided `expectedPetSide`
   (Correction 3, 2026-08-18) rather than a self-referential manifest read, so a regression to the
   old antisymmetric behaviour would fail the pin even if the manifest also regressed alongside it.
   **Live-reproduced**: `containerUser.list` for the real `rasta`/`pet09` combo on the live scene
   shows the pet at `x: 115` (positive/right), matching `expectedPetSide: 'right'` exactly.
3. **"El aura sigue apareciendo por debajo del personaje tiene que salir por encima"** — FIXED.
   `depths.js`'s `DEPTHS.aura = 1.8` is above `body (1.0)` and the hat band (`[1.05, 1.55]`) and
   `petFront (1.6)`. R2 (`avatar-resolved-state.spec.js`) asserts `aura.depth > hat.depth` AND
   `aura.depth > body.depth` from real resolved child state per direction, not from the constants
   themselves. **Live-reproduced**: the real `containerUser.list` shows `shadow: 0`, `pet: 0.5`,
   body container: `1`, `aura: 1.8`, name background: `2`, name text: `3` — the aura is
   unambiguously the topmost accessory layer in a real, running scene.
4. **"tenemos que migrar todos los personajes no solo rasta"** — 16 of 18 done, correctly
   disclosed as such everywhere it matters (roster coverage table, contact-sheet index,
   `AssetVersionManager`, M1 tracked-bytes report). `ghost`/`wraith` genuinely have no `.layers.bb`
   package; the delta spec (`avatar-layered-rendering`) explicitly says such a character "MUST NOT
   be required to migrate," so their absence is spec-compliant, not a shortfall against this
   change's own acceptance criteria — it is a shortfall only against `design.md`'s own §0 "roster is
   18" scope-expansion note, which is exactly the kind of frozen-artifact divergence flagged below
   for sync.
5. **"el gorro tiene diferente posicionamineot - diseño segun el perosnaje"** — FIXED.
   `AccessoryManager`'s registry key is `${character}:${kind}:${key}` (`resolveAccessoryRegistryKey`),
   confirmed directly in source; `Custom6Hat` under `lilian` and `rasta` resolve independently.
   R10 covers this per character in the matrix.
6. **"validarlo todo para que se vea bien en todos los 8 ejex respecto a la sombra"** — Covered
   two ways, both real: (a) the numeric R1–R13/R19 matrix (parameterized in slice 21, run for every
   migrated character, all 8 directions, including R5 shadow-alignment); (b) contact sheets
   committed under `client/e2e/artifacts/contact-sheets/` for all 16 migrated characters (verified
   present on disk: `rasta`, `sally`, `brujita`, `cholo`, `empollon`, `gata`, `india`, `lilian`,
   `marsu`, `modern`, `ninja`, `werewolf`, `yayo`, `boomer`, `skeleton`, `zombie`, plus
   `rasta-canvas-renderer.png` and 4 `*-real-scene.png` variants, `index.html`) — `ghost`/`wraith`
   correctly absent from the index, not silently implied covered. Only `rasta`, `brujita`, `ninja`
   and `werewolf` are validated through the real `PublicScene`; the other 12 migrated characters are
   harness-only — this is reported honestly in `apply-progress.md`'s own per-character coverage
   tables, not glossed over.

## Test execution (this session, real runs)

- `cd client && npm run test` → **72 test files, 537 tests, all passing** — matches the recorded
  figure exactly.
- `cd client && npm run test:e2e` → **322 total: 285 passed, 36 skipped, 1 failed** — matches the
  recorded figure exactly. The 1 failure is `avatar-transfer.spec.js`'s pre-existing, disclosed,
  unrelated finding (an immutable `Cache-Control` header assertion that depends on the built Docker
  image's nginx config, not this change's own rendering logic) — reproduced identically, not a new
  regression.
- `cd api && ./vendor/bin/phpunit` → **could not run.** Confirmed directly: `php` is not on PATH in
  this environment (`command not found: php`). This is not scored as a pass or a failure; it is the
  same disclosed, standing environment gap `apply-progress.md`'s PR10/slice 10 records for the
  `SallyAvatarCatalogItemSeeder.php` migration, and matches this change's own non-goal ("Server, API
  and DB surfaces" are out of scope except the one disclosed `sally` registration slice).

## Live functional validation (performed)

Surfaces used: the real Docker stack (`client` :8080, `server` :3000, `api`-proxy :8000, all
healthy), logged in as `God`/`test`, `playwright-cli`.

**Operator flow 1 (requirement 1 — actions play with palette).** Entered `Area 51` (a real
`PublicScene`, confirmed via `scene.sys.settings.status === 5`, i.e. genuinely RUNNING, not the
initial Vue-rendered lobby which only shows a static avatar image). Read
`spriteAvatar._seqKey`/`_requestedKey` before any action: `down_idle`/`down_idle`. Clicked the
game's own "Cry" emoji button (`img[name="Cry"]`, the real production UI, not a debug harness
control). First click: observable degrade logged to console —
`[layered] degraded animation: requested "llorar" resolved to "down_idle" (reason: pack-loading,
avatarId: 12)` (the lazy action-pack fetch had not completed yet — expected, matches R12's
contract). Second click, after the pack had time to load: `seqKey: "down_llorar"`,
`requestedKey: "llorar"` — the real action plays. A screenshot taken mid-action shows the
character's gold/yellow custom palette (`rastas`/`piel`/`color4` all `#ffd700` per the
account's own saved palette) unchanged from idle.

**Operator flow 2 (requirements 2 and 3 — pet side and aura depth, read from
`containerUser.list` directly, not derived).** `u.containerUser.list` on the same live user
returned: `shadow` depth `0`, a `pet` (texture `acc_rasta_pet_pet09_atlas`) at depth `0.5`,
`x: 115` (right of centre), the body `Container` at depth `1`, an `aura` (texture
`acc_aura_auraElectrica_atlas`) at depth `1.8`, then the name-tag background (`2`) and text (`3`).
This is exactly `depths.js`'s `DEPTHS` table and the pinned `expectedPetSide: 'right'` for
`pet09`, confirmed live in a real, running scene — not the harness, not a unit test.

**Negative control (requirement 5/hat, and evidence the probe distinguishes working from
broken).** The same account has `hat: "hat_minnie"` equipped per the server's own
`GET_USER_ACCESSORIES` response (visible in the `Avatar Look Debug` panel, which reads that
socket payload verbatim). No `hat` child appeared in `containerUser.list`. Traced to source:
`UserChangeAccessoryController.applyHat` — `if (!hatKey ||
!accessoryManager.hasPackage(character, 'hat', hatKey)) { return; }` — silently returns with no
console warning when the requested key does not match a registered package. `AccessoryManager`'s
registry only has `minnieHat` (the renamed identifier), not `hat_minnie` (the persisted, stale
value in this account's `catalog_items` row). This is **not a new defect**: it is a live,
reproducible confirmation of the exact, already-disclosed finding in `apply-progress.md`'s own
"Correction 3" section ("If the panel is observed showing `hat_minnie` on a live dev server, that
is persisted `catalog_items` row data from before the rename... recorded here as a data-only,
out-of-scope finding, not silently dropped"). It also demonstrates the probe can tell a working
accessory (pet, aura — both rendered correctly) from a non-working one (hat, silently absent) in
the same live session.

**Caveat on the running Docker image's freshness.** The client container's build artifacts are
dated 2026-08-18 18:30; `apply-progress.md`'s latest corrections/slices 28–32 are dated
2026-08-19. The image therefore reflects the codebase through roughly slice 26/27, not the very
latest accessory-batch and roster-scale-gate work. This does not undermine the live findings
above (all three exercised code paths — `depths.js`, `pivot.js`'s pet-side fix, the action/degrade
pipeline — were already shipped and unchanged since much earlier slices), but it means the
multi-page-webp accessory fix and the corrections from 2026-08-19 were NOT exercised against the
built image in this session, only against the dev server via the e2e suite (which does run against
the current working tree). Not rebuilding the image was a deliberate scope/time choice: the e2e
suite already gives current-tree coverage of those specific fixes (e.g. the new permanent
regression test asserting a 2-page hat produces `texture.source.length === 2`, which passed in
this session's `npm run test:e2e` run above), and rebuilding + re-composing the stack was judged
not to add material assurance for a change whose primary numeric/visual gates are already the
Playwright suite and the committed contact sheets.

## Strict TDD compliance

`openspec/config.yaml` declares `strict_tdd: true`. `apply-progress.md` has a `### TDD Cycle
Evidence` table for every slice (28 occurrences, one per PR/slice/correction — verified via
`grep -n "TDD Cycle Evidence"`). Spot-checked in full: PR1 (depths/fallback/degradeReporter/
sequenceClock — every RED row is either a captured `Cannot find module`/thrown-`TypeError`
failure or an explicit `not-run (nonexistent module ...)` marker, never a bare "Written"), Slice 20
(measurement-driven `ss:1`), Slice 21/Corrections 1–3 (parameterized matrix, Canvas-tint fix, pet
Correction 3), Slice 26 (the three roster-wide defects: pooled-child-array sizing,
`manifest.slots` omission, untinted-mask fallback), and Slices 28–31 (accessory batches,
multi-page webp fix, `bommer`/`boomer` reconciliation). All sampled rows carry real RED evidence
(a captured failure message or an honest nonexistent-symbol marker), a GREEN that matches an
actual test-file pass count, and TRIANGULATE case counts that are verifiable against the test
files' actual `it(...)` blocks.

**TDD Compliance**: 6/6 checks passed (evidence reported; every sampled task has a test file that
exists; RED confirmed real; GREEN cross-referenced against this session's own `72 files / 537
tests` and `285/322` e2e run; triangulation case counts verified against real test files for the
sampled slices; safety-net baselines present for every modified-file row sampled).

### Mutation spot-check (2 sampled tasks, both restored)

1. **`resolvePetSideX`** (`client/src/phaser/layered/pivot.js`, requirement 2's core fix).
   Inverted the central assertion in `pivot.test.js` — `resolvePetSideX(-10, 5, -20, 20, 'right')`
   from `.toBe(29)` to `.toBe(-29)` (this is the exact case proving the declared side wins over
   the raw, naturally-left-of-centre position — the precise pet-mirroring bug the user reported).
   Ran `npx vitest run src/phaser/layered/pivot.test.js`: **failed** as expected
   (`expected 29 to be -29`). Restored the original `.toBe(29)`; re-ran: **26/26 passed**. File
   content re-read and confirmed identical to its pre-probe state.
2. **`resolveTintHex`** (`client/src/phaser/layered/paletteResolve.js`, the slice-26 untinted-mask
   fallback fix — one of the six defects the user's own brief names). Inverted
   `resolveTintHex({}, {}, 'color1')` from `.toBe('000000')` to `.toBe('ffffff')` in
   `paletteResolve.test.js`. Ran `npx vitest run src/phaser/layered/paletteResolve.test.js`:
   **failed** as expected (`expected '000000' to be 'ffffff'`). Restored the original
   `.toBe('000000')`; re-ran: **9/9 passed**. File content re-read and confirmed identical to its
   pre-probe state.

Both probes prove their tests genuinely constrain production behaviour rather than passing
vacuously. Both files are restored exactly; a follow-up full `npm run test` run (after both
restorations) still shows **72 files / 537 tests passing**, confirming no residual state change.

### Assertion quality audit

Reviewed the file the user's own brief calls out by name (`avatar-resolved-state.spec.js`) plus
the six previously-latent defects it names, checking whether the CURRENT assertions would catch
each if reintroduced:

- **Body rendering as untinted white silhouettes under Canvas** (Phaser never applying
  `setTint()`) — R8-pixel reads an actual screenshot pixel via `page.evaluate` + DOM canvas
  bounding rect, not `child.tint` (a property Phaser sets regardless of whether any renderer draws
  it). Its own docblock states plainly why every prior `.tint`-only assertion, including R8 itself,
  would not have caught this. **Would catch a regression.**
- **Pet on the inverted side** — R3/R4 pin against an externally-decided `expectedPetSide`
  constant per character (not derived from the manifest under test), so a regressed derivation AND
  a regressed manifest together would still fail. **Would catch a regression** (confirmed directly,
  mutation spot-check #1 above).
- **Sally rendering only 5 of 8 poses** — covered by the "BLOCKER fix" TDD table
  (`apply-progress.md`), a live full-8-direction sweep with real failure capture before the fix;
  not re-audited line-by-line here given the scope of this pass, but the defect's own fix is a
  small, targeted change (direction-key mapping) with a dedicated regression test, not a
  pure-function-only fix.
- **Pooled-child array sized from the base pack alone (dropping action-key pieces)** — R8/R8-pixel
  read the real pooled `_pool` array and the real rendered pixel for a specific slot across
  frame0/mid/last of a real action sequence; `computeMaxFramePieces`/`computeMaxPoolSize` are
  unit-tested pure functions AND cross-checked against a real 14-character recompile with
  hand-decoded `L`-tuple verification recorded in `apply-progress.md`. **Would catch a
  regression** (a piece dropped from the pool would either not render at all, changing R8-pixel's
  measured pixel, or the child.tint check would fail for a real slot).
- **`manifest.slots` omitting piece-referenced slots (ninja/werewolf palette blocked)** — R8/R8-pixel
  now correctly gate on `manifest.slots.includes(slot)` (Correction 2, fixed from the earlier wrong
  `slot in manifest.defaults` check) — confirmed live in this session's e2e run: ninja/werewolf's
  R8-pixel tests ran (not skipped) and passed. **Would catch a regression.**
- **Accessory `.webp` loader reading only page 0** — a dedicated permanent regression test exists
  (`avatar-resolved-state.spec.js`, "multi-page accessory loading... a 2-page hat (boomer/
  mickeyHat) loads DISTINCT image data per page, not the same page repeated") and passed in this
  session's e2e run (test #117 in the recorded output). **Would catch a regression.**

No requirement in this change relies solely on a pure-function test for its ONLY coverage — every
one of R1–R13/R19 (resolved rendered state) has at least the numeric matrix, and the
high-risk fixes above additionally have a pixel-reading or full-container-reading e2e test. No
tautologies, ghost loops, or type-only assertions found in the sampled files. `avatar-resolved-
state.spec.js` is large and heavily commented with the specific historical defect each assertion
exists to catch — an unusually well-disciplined assertion-quality posture for this size of test
file.

### Coverage honesty (contact sheets × real scene × numeric)

Verified directly against the filesystem and the recorded coverage tables:
`client/e2e/artifacts/contact-sheets/` contains exactly the 16 migrated characters' sheets plus
`rasta-canvas-renderer.png` and 4 `*-real-scene.png` files (`rasta`, `brujita`, `ninja`,
`werewolf`) — matching `apply-progress.md`'s own claim that only these 4 characters are validated
through the real `PublicScene`, the remaining 12 migrated characters are harness-only, and
`ghost`/`wraith` are absent from the index (blocked, not silently implied covered). This matches
what the per-character coverage tables in `apply-progress.md` state, cross-checked in this
session, not merely re-read.

## Review workload / PR boundary

`tasks.md`'s Review Workload Forecast calls for `force-chained`/`feature-branch-chain` delivery,
slices 20–33 each independently sized (~30–320 hand-written lines). `apply-progress.md` states
explicitly, up front: "No commits, no branches, no PRs created — everything is in the working
tree. This file records the PR/slice boundary so the chain can be cut into commits/PRs later."
Verified via `git log`/`git status`: this is accurate — the working tree is uncommitted, all 32
completed slices' work sits in one flat diff (`git status --porcelain` shows 296 changed/untracked
paths). **This is a real, disclosed condition worth surfacing for whoever cuts the chain into
actual PRs**: the slice boundaries recorded in `apply-progress.md`/`tasks.md` are the intended cut
points, but nothing has enforced them as actual commit/PR boundaries yet — the 400-line-per-slice
budget is a paper commitment until that cutting happens. No scope creep was found: every completed
slice's own task checklist in `tasks.md` is checked `[x]` and matches its own apply-progress
section; slice 33 is the only incomplete item and it is explicitly, honestly deferred with a cited
reason (the proposal's own named non-goal), not silently parked as unstated future work.

## Known frozen-artifact divergences (for the sync agenda)

- `proposal.md`'s non-goals reject "any runtime SVG/vector rendering subsystem" — one was built
  behind a flag (design §12), measured against raster, and deleted once raster won (§12.3). The
  non-goal is upheld by the outcome, but the change's own history contains the detour; sync should
  note this rather than pretend it never happened.
- The `avatar-layered-rendering` delta spec says a character with no layered source package "MUST
  NOT be required to migrate" — correct and upheld for `ghost`/`wraith` (deferred) — yet
  `design.md`'s own §0 table records a 2026-08-18 decision that the roster "is 18" including
  `ghost`/`wraith`, later reversed by the 2026-08-19 deferral decision. `design.md` is frozen and
  still says 18; the real, shipped, honestly-reported roster is 16. Sync must reconcile this.
  Separately, `sally` was added as a wholly new client character (not anticipated by
  `proposal.md` item 7, which expected her to drop out) — also recorded in `design.md`'s §0 table
  as an approved scope expansion, not silently done.
- Delivery bundling (§9.1/§13) and the asset-authoring round-trip (§17) both shipped with **no
  spec delta at all** — `design.md`'s own §0 table names both as "a new capability with no spec
  delta," an honest disclosure, but sync still needs to decide whether either belongs in a spec.
- `design.md` §13.7 still frames the `ss:1`-for-accessory-masks question as **open** ("put it to
  the user only if the metric 4 gate is unmet") in its frozen prose. The body-side analogue of
  this exact question (per-action-key `ss:1`, not accessory masks) WAS resolved by a real user
  decision on 2026-08-18 and implemented in slice 20 — `tasks.md` itself flags that "design.md
  §13.7 still poses it as an open question — sync should fold this resolution back into the
  design." The ACCESSORY-mask version of the question (§13.7's actual, literal subject) remains
  genuinely unresolved — measured (68% of hat packages exceed the 1.2 MB budget even after the
  per-key mechanism proved inapplicable to accessories) but not decided, per the task's own
  explicit deferral. Sync should distinguish these two facts rather than treat §13.7 as fully
  either resolved or unresolved.
- `sally`'s slice touched server/API/DB surfaces (`proposal.md`'s own listed non-goal for this
  entire change) — approved by the user on condition it stayed isolated to that one slice.
  Verified: `apply-progress.md`'s own status table marks slice 10 as "the ONLY server/API/DB
  slice," and no later slice touches those surfaces again.
- 51 of the 249 `ss:1`-recompiled accessory packages still exceed the 1.2 MB transfer budget even
  after halving (worst: `marsu/Custom3Hat`, 7.06 MB → 1.96 MB, still 63% over) — disclosed
  plainly in `apply-progress.md`, no further escalation attempted or authorised. This is a genuine,
  measured residual limit, not a hidden gap.

## Blockers

None that gate this verdict. The two "could not run" items (`api` phpunit — PHP absent from this
environment; the Docker-image-based `avatar-transfer.spec.js` immutable-header assertion — the one
pre-existing e2e failure) are both disclosed, environment-scoped, and unrelated to this change's
own rendering-correctness scope, which is exhaustively covered by the client unit suite, the
Playwright resolved-state/pixel/contact-sheet suite, and this session's own live validation against
the real, running game.

## Risks (for the envelope)

- The `hat_minnie`/`minnieHat` DB-vs-registry mismatch is real and live-reproducible on this
  environment's seeded `God` account; it is explicitly out of scope (requires a DB reseed, and PHP
  is unavailable here) but will visibly manifest as "my hat disappeared" for any real account
  carrying the pre-rename catalog value until that data is migrated.
- 51 accessory packages remain over the 1.2 MB per-key transfer budget (accessory `ss:1` question,
  design §13.7, genuinely undecided) — a real, disclosed, unresolved residual risk, not a defect.
- `ghost`/`wraith` remain unmigrated with a real, unresolved architectural question (base-pack
  vector-rasterization strategy) explicitly flagged for whoever picks up the follow-up change.
- Review workload: 32 slices' worth of work sits entirely uncommitted in one working tree: the
  documented slice/PR boundaries are not yet real commit boundaries, so the review-workload
  forecast's 400-line-per-slice discipline is unverified until the chain is actually cut.
- The Docker image used for live validation (2026-08-18 18:30 build) predates this session's
  latest recorded slices (28–32, 2026-08-19); the three live-validated fixes (aura depth, pet side,
  action/degrade pipeline) were already stable well before that build, but the multi-page-webp
  accessory fix and roster-scale gate were validated only via the e2e suite against the current
  working tree in this session, not against a rebuilt image.
