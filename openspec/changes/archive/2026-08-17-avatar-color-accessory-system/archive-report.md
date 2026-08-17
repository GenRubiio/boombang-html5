# Archive Report: avatar-color-accessory-system

Archive Status: **PASS**

Archive Date: 2026-08-17

## Summary

The avatar-color-accessory-system change implements a complete vertical proof of the avatar-rendering system overhaul: layered frame composition with per-slot customizable colours plus character accessories (hat, pet, aura). All 31 requirements across four domains have been implemented, verified live, tested, and synced to canonical specs. The change is ready for production rollout behind the feature flag `VITE_LAYERED_AVATARS=false` (default off for safety).

## Artifacts Read Before Archive

- `exploration.md` — comprehensive prior-art verification, repo-state scan, risk inventory, and design-phase inputs
- `proposal.md` — locked decisions, scope statement, delivery strategy, and success criteria
- `design.md` — architectural decisions for layered rendering, palette persistence, accessory z-order, and cache versioning
- `tasks.md` — slice-by-slice task breakdown with cross-cutting notes and review workload forecast
- `apply-progress.md` — detailed record of all 11 slices implemented, including three post-live-validation fixes
- `verify-report.md` — live-validation evidence, mutation testing, spec coverage table, TDD compliance audit, and disclosed gaps
- `sync-report.md` — canonical spec sync completion, 31 create-copy operations across four domains, exit code 0
- `specs/avatar-layered-rendering/spec.md`, `specs/avatar-palette/spec.md`, `specs/avatar-accessories/spec.md`, `specs/avatar-look-protocol/spec.md` — 31 requirements organized by domain

## Domains Synced to Canonical Specs

| Domain | Requirement Count | Mode | Status |
|--------|------------------|------|--------|
| avatar-layered-rendering | 10 (LR1–LR10) | create-copy | synced |
| avatar-palette | 10 (PAL1–PAL10) | create-copy | synced |
| avatar-accessories | 5 (ACC1–ACC5) | create-copy | synced |
| avatar-look-protocol | 6 (PROTO1–PROTO6) | create-copy | synced |
| **Total** | **31** | **all create-copy** | **synced, exit code 0** |

## Requirements Coverage (All 31 Implemented)

**avatar-layered-rendering (LR1–LR10):** explicit frame-index sequences; per-frame origins; ss:2 supersampling; layer order immutability; mirrored pivot correction; renderer strategy flag; flag-off palette preservation; perf harness + go/no-go; 100ms palette latency; automatic client testability.

**avatar-palette (PAL1–PAL10):** open manifest-declared slot set; per-character independent slot counts; defaults/labels independence with fallback; persistence scoped per (user, avatar); missing palette → manifest defaults; non-glove free colour; glove locked-preset rejection (server-authoritative); glove preset identity preservation; glove seeds from progression then persists; baked characters keep existing glove tint.

**avatar-accessories (ACC1–ACC5):** registration point override/base/zero; aura character-independent anchor; ownership reuses decoration model (admin-grant only); hybrid fallback for uncovered animations; explicit consistent z-order.

**avatar-look-protocol (PROTO1–PROTO6):** server-authoritative validation; functional ACK (never disconnect); broadcast reaches fallback-path avatars; persists across client→server→API→DB; request:/response: naming convention; debug panel proves round trip.

## Active Same-Domain Collisions

None found. No other active change in `openspec/changes/` touches these four domains' canonical specs.

## Destructive Sync Approvals or Blockers

None. All 31 operations are `create-copy` mode (new domain creation). No MODIFIED or REMOVED requirements. No destructive delta to approve or decline.

## Verify-Report Status

**First line:** `Verdict: PASS` (Verify attempt 1) ✓

**Test commands run and passing:**
- `cd client && npm test` — 16 test files, 167 tests, all passing
- `cd server && npm test` — 3 test files, 13 tests, all passing
- `cd api && ./vendor/bin/phpunit` — 6 tests total, 1 pre-existing unrelated failure (Laravel root route); new suite `UserAvatarPaletteTest` 4/4 passing, 8 assertions

**Mutation testing:** two load-bearing functions spot-checked and restored (full suite remains green post-restore).

**Live validation:** performed against running Docker stack with Vite dev server, account `God` (user 1), avatar 12 (`rasta`). Evidence includes:
- 8-direction walk cycles with exact isometry
- Colour slot tinting (confirmed, isolated to one slot)
- Palette persistence across reconnect (exact hex round-trip)
- Negative controls (rejected unowned avatars, locked/unlocked glove tiers)
- 25-avatar performance measurement (actualFps 60.0, p5 60.61, minFps 54.95, pass: true)

## Residual Risks Carried Forward to Archive

**These gaps were disclosed in verify-report.md and must not be lost when the folder moves:**

1. **`Container.sort('depth')` z-order enforcement (3 call sites) has ZERO automated test coverage** — `containerUser.sort('depth')` at three call sites has no test exercising the actual render-order sort mechanism. The depth *values* are tested ("hat depth > body depth"), but the enforcement that turns those values into correct render order is untested. A revert of all three `.sort('depth')` calls would pass all 167 client tests while silently reproducing the accessory-occluded-behind-body defect (defects 5/6/9 in the original analysis). **Top-priority follow-up:** add automated tests covering the three `Container.sort('depth')` call sites, or justify and document why Phaser-instantiation-dependent code cannot be tested in the current vitest config.

2. **Palette-at-construction wiring (Fix 3) has no capturable automated RED** — the wiring that applies a saved palette to `LayeredAvatar` at construction time lives inside the constructor and requires a live Phaser Scene to verify; the underlying pure function (`resolvePalette`) is well-tested, but nothing in `npm test` exercises the constructor wiring itself. A revert of this specific wiring would pass all 167 client tests today while silently reproducing the palette-not-applied-on-reconnect defect. Live-confirmed working in the current state (persisted colour visible immediately on reload), but genuinely untimed for regression protection.

3. **Per-character accessory registry gap** — accessories are registered as `${kind}:${key}` with no character dimension, while reference assets ship a DIFFERENT package per character for the same key. Currently safe (one character compiled: `rasta`); the `char` field is preserved in compiled manifests but not used by `AccessoryManager`'s registry. **Before a second character's accessories are compiled:** either (a) restructure `AccessoryManager`'s registry key and on-disk path to include the character segment (`${character}:${kind}:${key}`) across all 6 call sites, or (b) add a loud collision assertion that fails if two different characters' compiled packages try to register under the same `${kind}:${key}` pair. Neither exists today; this is a required precondition for multi-character accessory support, not an afterthought.

4. **`aura_azul` / `aura_dorada` (8113×652) remain uncompiled** — they exceed the 4096px compiler hard limit for texture atlas width. Escalated explicitly in apply-progress.md, not silently dropped. Live-session note: production serves a single consolidated `aura.json`/`aura.webp` pair (not three separate sheets as the local dump showed); dimensions of the production consolidated sheet must be measured against the 4096px floor before final rollout.

5. **LR9 (100ms palette-change latency) is structurally satisfied but was not independently timed** — `applyPalette()` iterates already-visible pool children and calls `setTint`, confirmed no destroy/recreate, but no live millisecond measurement was captured against the 100ms bound. Structurally sound; low risk given the mechanism; genuinely untimed.

6. **The 11-slice chained-PR forecast was overridden by explicit user instruction** — `tasks.md` recommended chained PRs across 11 slices (400-line budget risk: High); the apply session implemented all 11 in one continuous pass per explicit user instruction to complete the full vertical proof. This is **disclosed and authorized in apply-progress.md line 3**, not undisclosed scope creep, but it increases single-pass review burden. The final diff spans 2,905 insertions across 30 tracked files plus ~31 new untracked source files (compiled assets).

7. **Measured 1178 display objects at 25 avatars EXCEEDS the proposal's 500–775 forecast** — apply-progress.md explicitly states the original forecast was wrong on the object-count axis (~50% above the top of that range), but FPS still clears the go/no-go floor (60.61 p5 vs. 45 floor). Disclosed, not hidden; performance target still met.

## Testing and Evidence Quality

- **TDD compliance:** all new pure modules have test files with RED→GREEN→TRIANGULATE cycles documented in apply-progress.md. A small number of "already-correct" confirmations and Phaser-instantiation-dependent code (disclosed, consistent exclusions per design.md §8) have no RED captured; judgment in verify-report.md §159-180 is that these disclosures are legitimate and not a mask.

- **Assertion quality:** no tautologies or smoke-only tests found in sampled files. Assertions use real compiled-manifest data, not hand-rolled fixtures, throughout. Historical-bug documentation tests (asserting the *old* formula does NOT satisfy an invariant the new one does) provide stronger-than-typical regression protection for the specific defect classes this change targets.

- **Performance measurement:** new PerfHarness.js provides FPS mean/p5/min, total display objects, draw-call count, and a go/no-go evaluator (`pass: true` when p5 ≥ 45 at 25 avatars, warning if layered/baked ratio < 0.6). Baseline and post-fix measurements recorded live in apply-progress.md.

## Locked Design Decisions

1. **Glove = palette slot + preserved unlock ladder.** The boxing-glove colour is now a real palette slot painted by the layered compositor, not a global sprite tint. The `ringsWon` ladder survives as a gate on which presets that slot offers (level 9 still unlocks `"gold": "Guante de Oro"`).

2. **Renderer: layered first, behind a feature flag.** The new layered rendering ships with `VITE_LAYERED_AVATARS=false` (default off). No existing avatar is migrated; baked-renderer avatars keep the old `TintManager` path.

3. **Editor: debug panel only.** A developer-grade colour panel proving the round trip live. The product wizard (colour wheel, preset swatches, step indicator) is deferred as non-goal.

4. **Accessory ownership: reuse + grant.** New `user_decoration_type` values (`avatar_hat`, `avatar_pet`, `avatar_aura`) in the existing `catalog_items` schema; ownership rows in `user_catalog_items`; seeded/granted via Backpack admin. No purchase/currency flow in this change.

5. **Client test runner (vitest) added as its own scoped task.** TDD discipline is not waived; new client logic has test files.

## Rollback

The feature flag is the complete rollback: disabled, `AvatarManager` takes the existing baked-atlas branch, the user container returns to its 4-element shape, and `TintManager.changeUppercutColor()` remains the glove mechanism — i.e. exactly today's behaviour, since no existing avatar is migrated. Persisted palettes are additive (new table/column, new socket events); they are ignored when the flag is off and require no down-migration. Per-slice rollback: revert the slice's commit; earlier slices keep working because each is independently flagged. Zero data loss in all cases.

## Known Gaps (Not Blockers)

Per `explore.md` audit and `verify-report.md` follow-ups:

- **Accessory animation coverage asymmetry (40 keys vs 15):** hat/pet animations exceed the rasta body package's 15 keys. Behaviour during body specials (e.g., `punch_doy`) is specified by explicit hybrid fallback in the design (LR4, ACC4).

- **Pre-existing `SmartAvatarSystem` userId/username bug (§7 risk 1 of exploration.md):** confirmed fixed (the new look broadcast travels the same code path and the fix was applied during Slice 3).

- **Pre-existing disconnect-on-error pattern (§7 risk 2 of exploration.md):** confirmed NOT depending on this change (new controllers use functional ACKs; fixing the two existing controllers is desirable but not required).

- **Per-frame pivot vs per-animation offset mismatch (§7 risk 6):** resolved by the new compositor, which applies per-frame pivots as part of the layered-render contract (LR2).

- **Vector rendering precedent (§7 risk 8):** offline rasterization approach using the already-present `sharp` dependency (Slice 3, confirmed working; hat and pet atlases compiled and rendering).

- **Hat display-width ratio recalibration (0.6 → 0.85):** verified as genuine recalibration against reference screenshots, not a loosened gate. New threshold still fails the ORIGINAL defect (hat ~0.95-0.99 at defect state).

## Artifacts Written Before Move

- `/Users/evgeny.lyubeznyy/Desktop/Proyectos/boombang-html5/openspec/changes/avatar-color-accessory-system/archive-report.md` (this file)

## Archive Path

The active change folder will be moved from:
```
openspec/changes/avatar-color-accessory-system/
```

To:
```
openspec/changes/archive/2026-08-17-avatar-color-accessory-system/
```

Using today's ISO date: **2026-08-17**

## Integrity Verification Plan

Before move:
1. Record a manifest of the source: `cd openspec/changes/avatar-color-accessory-system && find . -type f | sort | xargs shasum -a 256 > /tmp/pre-move.sha256`
2. Execute the move via Bash (`git mv` or `mv`)
3. After move: `cd openspec/changes/archive/2026-08-17-avatar-color-accessory-system && find . -type f | sort | xargs shasum -a 256 > /tmp/post-move.sha256`
4. Verify: `diff /tmp/pre-move.sha256 /tmp/post-move.sha256` must be empty (no file size changes, no truncation)
5. Confirm source is gone: `ls openspec/changes/avatar-color-accessory-system/` must not exist

---

**Change archived by:** sdd-archive executor

**Archival timestamp:** 2026-08-17T00:00:00Z (ISO 8601)

**Next recommended phase:** None — this change is complete. Monitor live deployment metrics against the disclosed risks (especially Container.sort coverage gap) for future hardening.
