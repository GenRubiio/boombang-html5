# Sync Report: avatar-system-multichar-fixes

## Status: blocked

## CLI invocation

```
node "/Users/evgeny.lyubeznyy/Desktop/Basetis/vibeless-claude-sdd/scripts/sdd-sync.mjs" avatar-system-multichar-fixes
```

## CLI output (verbatim)

```
Domain "avatar-accessories" carries destructive deltas (REMOVED: none; large MODIFIED: Accessory Anchoring By Registration Point). Re-run with --approve-destructive after the recorded human approval.
```

Exit code: `3`

No op-count table was produced — the CLI exited before performing any merge for the
`avatar-accessories` domain, and did not touch `avatar-layered-rendering`,
`avatar-palette`, or `avatar-look-protocol` either, since it aborts before applying any
domain when a destructive gate trips.

## Why this is blocked, not applied

The delta at `openspec/changes/avatar-system-multichar-fixes/specs/avatar-accessories/spec.md`
carries a large `MODIFIED Requirements` block for:

- `### Requirement: Accessory Anchoring By Registration Point` (five rewritten/added
  scenarios: base registration point, override precedence, pets sharing hat anchoring,
  per-character-key resolution, and the pinned 8-direction pet side).

This corresponds to real, verified work — the per-character `AccessoryManager` registry
key fix (`resolveAccessoryRegistryKey`) and the `resolvePetSideX` pet-mirroring fix — both
confirmed live and via mutation-tested unit/e2e coverage in `verify-report.md` (Verdict:
PASS). The content is not in question; the gate exists because a large `MODIFIED` block on
an existing canonical requirement is treated as destructive by the sync CLI's guardrails,
and per the sync contract I may only pass `--approve-destructive` when the parent prompt
that invoked this phase records **explicit human approval for this specific destructive
delta**.

The task prompt for this sync run does record several explicit user decisions (the
`ss:1` per-action-key resolution on 2026-08-18, the `ghost`/`wraith` migration deferral on
2026-08-19, and the conditional approval for `sally`'s server/API/DB slice), but none of
them is an approval to destructively overwrite the canonical
`Accessory Anchoring By Registration Point` requirement text. Rather than infer consent
from adjacent approvals, I am stopping here and surfacing the gate for a human/parent
decision.

## Recommended next action

1. A human (or the orchestrating parent, if it already holds recorded approval) confirms
   the large `MODIFIED` block for `Accessory Anchoring By Registration Point` should
   replace the canonical requirement as written.
2. Re-run: `node ".../scripts/sdd-sync.mjs" avatar-system-multichar-fixes --approve-destructive`.
3. Re-run `sdd-sync` (this phase) afterward to capture the real op-count table, since none
   was produced in this attempt.
4. Only then proceed to `sdd-archive`.

## Known-open items carried forward (not resolved by this sync attempt)

These come from `verify-report.md`'s divergence list and are recorded here so they are not
lost while the destructive-delta gate is pending resolution:

1. **Non-goal vs. history**: `proposal.md` rejects "any runtime SVG/vector rendering
   subsystem" as a non-goal; one was built behind a flag (design §12), measured against
   raster, and deleted once raster won (§12.3). The non-goal holds in the end state, but
   the change's history contains the detour.
2. **Migration requirement vs. roster scope**: the `avatar-layered-rendering` delta's "MUST
   NOT be required to migrate" clause is upheld for `ghost`/`wraith` (deferred to a
   separate change per a 2026-08-19 user decision), but `design.md`'s own frozen §0 table
   still records an 18-character roster including `ghost`/`wraith`; the shipped, honestly
   reported roster is 16. `sally` was added as a new client character/avatar id, not
   anticipated by `proposal.md` item 7 (which expected her to drop out) — approved as a
   scope expansion in `design.md`'s §0 table.
3. **Two shipped capabilities with no spec delta at all**: delivery bundling (design
   §9.1/§13) and the asset-authoring round-trip (design §17) — both user-approved, neither
   has a requirement behind it in any of the four delta specs synced by this change.
4. **`design.md` §0 and §13.7 still pose the `ss:1` question as open** in frozen prose,
   though it was resolved by a real user decision on 2026-08-18 and implemented twice: per
   action-key for bodies (slice 20, resolved), and — separately, and still genuinely
   unresolved — the accessory-mask variant of the same question (§13.7's literal subject),
   where 51 of 249 recompiled accessory packages still exceed the 1.2 MB transfer budget
   even after halving (worst: `marsu/Custom3Hat`, 1.96 MB). These are two distinct facts,
   not one open item.
5. **`sally`'s slice touched server/API/DB surfaces** (`server/src/enums/AvatarEnum.js`,
   `AnimationBlockTimerEnum`, `EmojisBlockActionsMap`, a `catalog_items` row) despite
   `proposal.md` listing "Server, API and DB surfaces" as a non-goal for the whole change;
   the user approved this on condition it stayed isolated to that one slice, and
   `apply-progress.md`'s own status table confirms no later slice touches those surfaces
   again.

## Other known-open items (informational, not sync-blocking on their own)

- Slice 33 (aura pagination for `aura_azul`/`aura_dorada`, exceeding the compiler's
  4096px limit) is deferred, citing the proposal's own non-goals.
- A live-reproducible `hat_minnie` vs `minnieHat` mismatch in seeded DB data makes a hat
  silently vanish (`UserChangeAccessoryController.applyHat` returns without a warning);
  this is stale `catalog_items` data, not code, and needs a reseed that could not be run in
  the verify environment (PHP absent).
- All 32 completed slices sit uncommitted in one working tree; the documented slice/PR
  boundaries and the 400-line review budget are not yet real commit boundaries.

## Domains affected (attempted, not applied)

| Domain | Canonical spec | Result |
|---|---|---|
| `avatar-layered-rendering` | `openspec/specs/avatar-layered-rendering/spec.md` | not reached (CLI aborted before this domain) |
| `avatar-accessories` | `openspec/specs/avatar-accessories/spec.md` | blocked — destructive `MODIFIED` gate |
| `avatar-palette` | `openspec/specs/avatar-palette/spec.md` | not applicable — no delta in this change's `specs/` folder |
| `avatar-look-protocol` | `openspec/specs/avatar-look-protocol/spec.md` | not applicable — no delta in this change's `specs/` folder |

## Next recommended phase

Do not proceed to `sdd-archive` for this change until the destructive-delta approval is
obtained and a clean sync (with the real op-count table) is recorded.
