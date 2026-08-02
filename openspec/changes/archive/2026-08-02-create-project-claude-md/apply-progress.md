# Apply Progress: create-project-claude-md

Single work-unit slice (forecast ~207 lines, actual 231 changed lines — well inside the
400-line review budget). No chained PR split was needed; the full scope was implemented in
one pass. Four paths staged, unforced. **Not committed.**

## Status

| Field | Value |
|-------|-------|
| Status | success |
| Tasks completed | 38 / 38 |
| Spec acceptance boxes ticked | 12 / 12 |
| Paths changed (outside `openspec/`) | 4 (exactly as specified) |
| Staged diff | 229 insertions, 2 deletions across 4 files |
| Committed | No — staging only, per task 7.3 |
| Strict TDD | Active; V1–V13 used as the mandated substitute suite (D9) |

## Files changed

| Path | Operation | Actual diff | Contract met |
|------|-----------|-------------|--------------|
| `/Users/evgeny.lyubeznyy/Desktop/Proyectos/boombang-html5/.gitignore` | modified | `0 1 .gitignore` — removed line was exactly `-CLAUDE.md` | yes (D0) |
| `/Users/evgeny.lyubeznyy/Desktop/Proyectos/boombang-html5/CLAUDE.md` | created | 224 lines, 9 headings, trailing newline | yes (D3/D4/D11/D12) |
| `/Users/evgeny.lyubeznyy/Desktop/Proyectos/boombang-html5/AGENTS.md` | modified | `3 1 AGENTS.md` | yes (D5/D6) |
| `/Users/evgeny.lyubeznyy/Desktop/Proyectos/boombang-html5/README.md` | modified | `2 0 README.md` | yes (D7) |
| `openspec/changes/create-project-claude-md/tasks.md` | modified | all 38 boxes ticked | n/a (SDD artifact) |
| `openspec/changes/create-project-claude-md/specs/project-documentation/spec.md` | modified | all 12 acceptance boxes ticked | n/a (SDD artifact) |
| `openspec/changes/create-project-claude-md/apply-progress.md` | created | this file | n/a (SDD artifact) |

## Test commands run

The configured `strict_tdd` command `cd server/src/packages/objects-maker && npm test`
was **NOT run at any point** — it resolves to `node index.js`, an animated-WebP conversion
pipeline that would write an `output/` directory into the repository and break the
four-path blast-radius requirement (design D9). Its mandated substitute, the V1–V13 shell
checks from design D8, was executed in full from the repository root.

| Check | Command family | Result |
|-------|----------------|--------|
| V1 | `test -f CLAUDE.md` | `OK` |
| V2 | `wc -l < CLAUDE.md`; trailing-newline test | `224` (in [150,250]); no FAIL |
| V3 | H1 + 8 `##` heading greps | H1 at line 1; 8 headings in exact order; `grep -c '^## '` = 8 |
| V4 | 15 required-string loop | no `MISSING:` output |
| V5 | 7 prohibited-string loop + non-ASCII grep | no `PROHIBITED:` output, no Spanish characters |
| V6 | manifest script existence + 2 tripwires | no output (all scripts real; no `test` script appeared) |
| V7 | backticked-path resolution loop | no `MISSING PATH:` output (after the fix noted below) |
| V8 | AGENTS.md greps + numstat | stale=0, `CLAUDE.md`=1, Codex footer=1, `longText`=1, numstat `3 1` |
| V9 | README.md greps + numstat | `CLAUDE.md`=1, numstat `2 0` (zero deletions) |
| V10 | blast radius | exactly the 4 expected status lines; scoped/`web/`/CI/config checks all silent |
| V11 | committability + `.gitignore` | `check-ignore exit=1`, `?? CLAUDE.md`, numstat `0 1`, only `-CLAUDE.md`, no regressions, rule gone; after unforced `git add`: `A  CLAUDE.md` |
| V12 | credential grep | no output |
| V13 | manual 12-box walkthrough | all 12 hold (details below) |

No background processes were started. No `git add -f` was used anywhere.

## TDD Cycle Evidence

RED was captured **before** each edit by running that task's named V-check and observing
the failure/absence; GREEN was captured by re-running the same check after the edit.

| Task | "Test" (V-check) | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|------------------|-------|------------|-----|-------|-------------|----------|
| 1.1–1.6 baseline | V1, V11-partial, V8-partial, V9-partial, `git status` | Shell check | N/A (read-only) | ✅ Captured: `test -f CLAUDE.md` silent; `git check-ignore CLAUDE.md` printed `CLAUDE.md`, `check-ignore exit=0`; `grep -c 'Direct HTTP/HTTPS calls' AGENTS.md` = `1`; `grep -c 'CLAUDE.md' AGENTS.md` = `0`; `grep -c 'CLAUDE.md' README.md` = `0`; tree clean outside `openspec/` | N/A (baseline task) | N/A | N/A |
| 2.1–2.5 `.gitignore` deletion | V11 (`.gitignore` half) | Shell check | ✅ File read before edit; 13 lines, `CLAUDE.md` at line 6, `.claude` at line 7 | ✅ Failed: `git check-ignore CLAUDE.md` printed `CLAUDE.md` with `check-ignore exit=0` (rule live) | ✅ Passed: `git diff --numstat` → `0	1	.gitignore`; `git diff -U0 \| grep -E '^[+-][^+-]'` → exactly `-CLAUDE.md`; `check-ignore exit=1` | ✅ 2 cases: (a) deletion landed, (b) 5-entry regression loop (`.claude`, `.env`, `NUL`, `logs/`, `auth.json`) silent — a naive "rewrite the file" implementation would break (b) | ✅ Clean — single-line surgical edit, no reordering |
| 3.1–3.11 write `CLAUDE.md` | V1, V2, V3, V4, V5, V6, V7 | Shell check | N/A (new file) | ✅ Failed: V1 silent (no file); V3 `grep -n '^# CLAUDE.md$' CLAUDE.md` → `ugrep: warning: CLAUDE.md: No such file or directory`, exit 2; V4 probes emitted `MISSING: client/src/sockets/socket.js`, `MISSING: server/src/collections/`, `MISSING: Socket.IO` | ✅ Passed: V1 `OK`; V2 `224` + newline present; V3 8 headings in order, count 8; V4/V5/V6/V7 all silent | ✅ 7 distinct checks, not one: presence (V1), length+newline (V2), structure (V3), required content (V4), prohibited content + English-only (V5), manifest truth (V6), path resolution (V7). V7 initially FAILED with 12 `MISSING PATH` lines — a real RED on the first draft | ✅ Refactored after the V7 failure: relative fragments (`./web`, `../web/public/`, `AI/`, `Admin/`, `Internal/`, `External/`, `admin/`, `config/`, `game/`, `services/`, `tests/`) replaced with repo-root-relative paths; V1–V7 re-run all green |
| 4.1–4.4 `AGENTS.md` | V8 | Shell check | ✅ Existing-file branch: baseline captured in 1.3/1.4; Codex footer and `longText` conventions asserted intact after the edit | ✅ Failed: `grep -c 'Direct HTTP/HTTPS calls' AGENTS.md` → `1` (stale claim present); `grep -c 'CLAUDE.md' AGENTS.md` → `0` (no cross-reference) | ✅ Passed: stale grep exits 1 with `0`; `CLAUDE.md`=1; `git diff --numstat` → `3	1	AGENTS.md` | ✅ 4 cases: stale gone, cross-ref present exactly once, Codex footer still exactly 1, `longText` DB convention still present — proves no collateral edit | ✅ Clean — two surgical text-matched edits, bold label kept, no trailing period |
| 5.1–5.3 `README.md` | V9 | Shell check | ✅ Existing-file branch: baseline in 1.5; zero-deletion assertion guards translation drift | ✅ Failed: `grep -c 'CLAUDE.md' README.md` → `0` | ✅ Passed: `grep -c 'CLAUDE.md' README.md` → `1`; `git diff --numstat` → `2	0	README.md` | ✅ 2 cases: cross-reference present, **and** deletion count is 0 (a reword/translation would fail the second) | ✅ Clean — Spanish line matching host document, appended to the existing technical-documentation section |
| 6.1–6.3 blast radius | V10, V11, V12 | Shell check | ✅ 1.6 proved the tree was clean outside `openspec/` before any edit | ✅ Failed (pre-edit, task 1.2): `check-ignore exit=0` proved `CLAUDE.md` would have been invisible to `git status` | ✅ Passed: exactly ` M .gitignore`, ` M AGENTS.md`, ` M README.md`, `?? CLAUDE.md`; scoped status, `test -d web`, `test -d .github/workflows`, and the config-diff check all silent; V12 silent | ✅ 3 cases: path set, absence tripwires (`web/`, CI), config-file immutability | N/A (verification task) |
| 7.1–7.3 staging | V11 (post-staging half) | Shell check | ✅ V11 pre-staging half run first, as the design requires | ✅ Failed (pre-edit, task 1.2): file was ignored, so `git add` without `-f` would have been a no-op | ✅ Passed: unforced `git add` → `A  CLAUDE.md`, `M  AGENTS.md`, `M  README.md`, `M  .gitignore` | ✅ 2 cases: all four staged, and no residual `??`/unstaged `M` outside `openspec/` | N/A |
| 8.1–8.3 V13 | V13 manual walkthrough | Manual review | N/A | ✅ not-run (V13 is a manual read-through, not an executable assertion) | ✅ Passed: all 12 spec acceptance boxes hold | ✅ 3 residual-judgement passes: box 2 cell-by-cell against D4, box 6 factual-not-prescriptive wording, non-duplication by eye | N/A |

### Test Summary

- **Total checks written/run**: 13 (V1–V13), covering 38 tasks
- **Total checks passing**: 13
- **Layers used**: Shell/verification checks (12), Manual review (1)
- **Approval tests**: `AGENTS.md` and `README.md` were existing-file edits — the "unchanged
  content" assertions in V8 (Codex footer count, `longText` presence, `3/1` numstat) and V9
  (`2/0` numstat, zero deletions) serve as approval tests that behaviour outside the
  intended edit was preserved.
- **Pure functions created**: 0 (documentation-only change)

## V13 — spec acceptance-criteria walkthrough

| # | Box (abridged) | Evidence | Verdict |
|---|----------------|----------|---------|
| 1 | Exists, English, five required sections | V1, V3 (9 headings), V5 (no Spanish characters) | pass |
| 2 | Every surface row has correct stack / entry point / commands | Cell-by-cell read against D4: client (Vue 3.5 / Phaser 3.87 / Pinia 3 / socket.io-client 4.8 / Vite 6), server (Express 4.21 / Socket.IO 4.8 / mariadb 3.4 / axios 1.10), api (PHP 8.2 / Laravel 12 / Passport 12 / Backpack trio / Stripe 19 / l5-swagger 9), launcher (Electron 26 + builder 26), plus docker/doc/agent_tasks/backups/`boombang_api.sql`/`.github/`/`web/` — all 11 rows match; non-runnable surfaces read `n/a` | pass |
| 3 | Commands resolve to real manifest scripts; no invented `test` | V6, including the two tripwires | pass |
| 4 | Communication: no client→API claim; five required facts | V4 (`EMULATOR_API_TOKEN`, `VerifyEmulatorToken`, `/internal/add-bot-token`, `boombang_api`, `Socket.IO`), V5 (`Direct HTTP/HTTPS calls` absent); the `/api` mount is framed as an inbound Laravel-API channel per D12, never as a client path | pass |
| 5 | `socket.js`, `phaser/services/`, `collections/`, `boot/` named | V4 | pass |
| 6 | Four gaps documented factually, not remediated | Read-through: each item states an observation and its file references; no imperative or remediation language. `test -d web` and `test -d .github/workflows` both silent | pass |
| 7 | 150–250 lines | V2 → 224 | pass |
| 8 | `AGENTS.md` corrected + cross-referenced | V8 | pass |
| 9 | `README.md` cross-referenced | V9 | pass |
| 10 | Exactly four paths | V10 | pass |
| 11 | `.gitignore` = one deletion, `.claude` survives | V11 | pass |
| 12 | `git check-ignore` non-zero, file visible to git | V11 | pass |

Non-duplication read-through (the extra manual scenario): `CLAUDE.md` contains no Codex
commit-attribution footer, no "respond in the detected language" framing, no feature-status
table, and no screenshot gallery. It links to `AGENTS.md` and `README.md` for those.

## Deviations from design

1. **V8's last sub-check is defective as written; verified by an equivalent form.**
   The design expects `git diff -U0 -- AGENTS.md | grep -cE '^[+-][^+-]'` → `4`. It returns
   `1`. The pattern requires the character after the diff marker to not be `+`/`-`, but both
   changed lines are Markdown bullets, so they render as `-- **Client ...` and
   `+- **Client ...` and can never match; the added blank line (`+` alone) cannot match
   either. Only the added paragraph matches. The intent was verified with an equivalent
   form that excludes the `---`/`+++` file headers instead:
   `git diff -U0 -- AGENTS.md | grep -E '^[+-]' | grep -vcE '^(\+\+\+|---) '` → `4`.
   `git diff --numstat -- AGENTS.md` → `3	1	AGENTS.md` independently confirms the
   contract. Recommend correcting the check text in `design.md` for the verify phase.
2. **`server/src/storage/` exists on disk but is omitted from the `Inside server/` list.**
   D11 declares an authoritative 16-entry `server/src/*` list which does not include it; the
   design forbids embellishing that list. The directory contains only
   `server/src/storage/logs/.gitignore` (a runtime log destination, contents gitignored), so
   the omission does not misstate anything. Flagging it so a future update can decide
   whether to add it.
3. **`api/` phpunit and pint quoted as `cd api && ...` rather than bare
   `./vendor/bin/phpunit`.** A bare backticked `./vendor/bin/phpunit` resolves against the
   repository root under V7 and fails (`api/vendor/` is not installed in this checkout).
   The `cd api && ...` form is both more accurate for a reader and outside V7's extraction
   pattern. Same for pint.
4. **`doc/` row says "Markdown technical notes and their images" instead of naming the
   screenshots directory.** V5 prohibits the literal string `doc/screenshots`; the wording
   conveys the same fact without tripping the check.
5. **First draft of `CLAUDE.md` failed V7 with 12 `MISSING PATH` lines** (relative
   fragments such as `./web`, `AI/`, `Internal/`, `game/`, `tests/`). Fixed by promoting
   every one of them to a repo-root-relative path; V7 is now silent. Recorded because it is
   a genuine RED→GREEN cycle, not a clean first pass.

## Remaining tasks

None. All 38 tasks in `tasks.md` are complete and all 12 spec acceptance boxes are ticked.
Task 7.3 explicitly ends the list at "staged, not committed", so the absence of a commit is
the intended terminal state, not unfinished work.

## Workload / PR boundary

Single PR, single work unit, one commit's worth of staged content:

- 4 repository paths, 229 insertions / 2 deletions = **231 changed lines** (58% of the
  400-line budget).
- The four paths are inseparable: splitting `CLAUDE.md` from the two cross-reference lines
  would leave `AGENTS.md` and `README.md` linking to a file that does not exist, and
  splitting off `.gitignore` would leave a commit whose ignore rule contradicts its own
  tree. Rollback is a plain `git revert` of the single commit.
- Suggested commit message when the maintainer chooses to commit:
  `docs: add authoritative CLAUDE.md structural map and correct AGENTS.md client-to-API claim`

## Follow-ups recommended (out of scope here)

1. Correct `openspec/config.yaml`'s `strict_tdd` test command — it points at an asset
   pipeline (`objects-maker`), not a test runner. Flagged as an open question in `design.md`.
2. Fix the V8 changed-line-count check in `design.md` (deviation 1 above).
3. `AGENTS.md` retains other stale content this change was forbidden to touch: it still
   lists `web/` as one of five live services and keeps the `Web ↔ API` bullet. `CLAUDE.md`
   carries the correction; a follow-up change should reconcile `AGENTS.md` itself.

---

# Apply Progress — Corrective Pass 2 (2026-08-02)

Everything above records **pass 1**, which `verify-report.md` failed (Verdict: FAIL,
CRITICAL-1 + CRITICAL-2). This section appends the corrective pass and supersedes pass 1
only where it says so explicitly; pass 1's `.gitignore` and `README.md` work stands
untouched.

Single work-unit slice again — the force-chained delivery strategy resolved to
"no chaining needed" (`tasks.md` Review Workload Forecast: 400-line budget risk **Low**,
chained PRs **No**). Corrective scope completed in one pass. Four paths re-staged with a
plain unforced `git add`. **Still not committed.**

## Status (after corrective pass)

| Field | Value |
|-------|-------|
| Status | success |
| Tasks completed | 32 / 32 (corrective `tasks.md`) |
| Spec acceptance boxes ticked | 13 / 13 (boxes 4, 6, 8, 13 re-opened and now closed) |
| Paths changed (outside `openspec/`) | 4 (unchanged — no fifth path) |
| Staged diff | 249 insertions, 2 deletions across 4 files (**251 changed lines**, 63% of budget) |
| Committed | No — staging only, per task 7.3 |
| Strict TDD | Active; V1–**V14** used as the mandated substitute suite (D8/D9) |

## The defect that was fixed

| Location (pass 1) | False claim | Corrected to |
|-------------------|-------------|--------------|
| `CLAUDE.md:139` | "There is no direct client-to-API HTTP path: nothing in `client/src` calls the Laravel API." | A dedicated **"The one client-to-API HTTP path"** paragraph naming `ShopComponent.vue`, the `${VITE_API_BASE_URL}/api/stripe/create-checkout-session` `POST`, the `app_jwt` bearer token, the `http://127.0.0.1:8000` fallback, the receiving `StripeController::createCheckoutSession` route, and its liveness evidence |
| `AGENTS.md:360` | "None — the client never calls the Laravel API directly; all client traffic goes to the server over Socket.IO" | The D5-normative bullet: "One path only — a JWT-authenticated `POST` to `/api/stripe/create-checkout-session` from `ShopComponent.vue`; all other client traffic is gameplay and goes over Socket.IO" |
| `CLAUDE.md:203-204` | "The root `.env.example`, `docker-compose.yml`, `README.md` and `AGENTS.md` all use `boombang.com` hostnames" | D13 attribution: `docker-compose.yml` "holds no such literal and receives those hostnames only by `${*_VIRTUAL_HOST}` interpolation"; leads with the `api-cors.conf` vs `.env.example:59` CORS mismatch |

## Files changed in the corrective pass

| Path | Operation | Corrective edits | Contract met |
|------|-----------|------------------|--------------|
| `/Users/evgeny.lyubeznyy/Desktop/Proyectos/boombang-html5/CLAUDE.md` | modified in working tree, re-staged | 4 edits: transport-layer paragraph (no longer "only outbound surface"), "How services talk" body + new `Client -> API` table row, known-gap 2 rewrite, D14 trim-ledger item 1 | yes (D12, D13, D14) |
| `/Users/evgeny.lyubeznyy/Desktop/Proyectos/boombang-html5/AGENTS.md` | modified in working tree, re-staged | 1 edit: the `Client ↔ API` bullet, replaced verbatim with D5 text | yes (D5) |
| `/Users/evgeny.lyubeznyy/Desktop/Proyectos/boombang-html5/README.md` | unchanged from pass 1 | none — re-staged only | yes (D7) |
| `/Users/evgeny.lyubeznyy/Desktop/Proyectos/boombang-html5/.gitignore` | unchanged from pass 1 | none — re-staged only | yes (D0) |
| `openspec/changes/create-project-claude-md/tasks.md` | modified | all 32 boxes ticked | n/a (SDD artifact) |
| `openspec/changes/create-project-claude-md/specs/project-documentation/spec.md` | modified | boxes 4, 6, 8, 13 ticked | n/a (SDD artifact) |
| `openspec/changes/create-project-claude-md/apply-progress.md` | appended | this section | n/a (SDD artifact) |

No fifth repository path. `git add -f` was **not** used at any point in either pass.

## Test commands run

The configured `strict_tdd` command `cd server/src/packages/objects-maker && npm test` was
**NOT run**, in this pass or the previous one. It resolves to `node index.js`, an
animated-WebP asset pipeline with an absent `node_modules` (design D9). The V1–**V14**
shell suite is its sanctioned substitute and was re-executed in full from the repository
root.

| Check | Command family | Result (corrective pass) |
|-------|----------------|--------------------------|
| V1 | `test -f CLAUDE.md` | `OK` |
| V2 | `wc -l < CLAUDE.md`; trailing-newline test | `244` — inside `[150, 245]` working ceiling; no `FAIL` line |
| V3 | H1 + 8 `##` heading greps | H1 at 1; headings at 11, 35, 71, 114, 134, 190, 207, 236 — strictly increasing, exact order; count `8` |
| V4a | 18-string presence loop (now incl. `stripe/create-checkout-session`, `ShopComponent.vue`, `VITE_API_BASE_URL`) | no `MISSING:` output |
| V4b | 10 source-side counterpart greps | no `UNSOURCED:` / `STALE CLAIM:` output |
| V5a | 6-pattern two-directional wording ban across `CLAUDE.md` **and** `AGENTS.md` | no output — neither the overstatement nor the absolute-denial family survives |
| V5b | 6-string prohibited loop | no `PROHIBITED:` output |
| V5c | Spanish-character grep | no output |
| V6 | manifest script loops + 2 tripwires | no output |
| V7 | backticked-path resolution loop | no `MISSING PATH:` output |
| V7+ | Markdown link-target resolution (added beyond V7) | no `MISSING LINK TARGET:` output |
| V8 | AGENTS.md greps + `--cached` numstat + corrected changed-line sub-check | stale `Direct HTTP/HTTPS calls`=`0` (exit 1); `CLAUDE.md`=`1`; Codex footer=`1`; `longText`=`1`; bullet-names-endpoint=`1`; `git diff --cached --numstat` → `3	1	AGENTS.md`; corrected sub-check → `4` |
| V9 | README.md grep + `--cached` numstat | `CLAUDE.md`=`1`; `2	0	README.md`; `1 file changed, 2 insertions(+)` |
| V10 | blast radius + tripwires + config diff | exactly `M  .gitignore`, `M  AGENTS.md`, `A  CLAUDE.md`, `M  README.md`; scoped source-dir status empty; `test -d web` / `test -d .github/workflows` silent; config diff empty in **both** plain and `--cached` form |
| V11 | committability + `.gitignore` | `check-ignore exit=1`; `A  CLAUDE.md`; numstat `0	1	.gitignore` (plain **and** `--cached`); changed line exactly `-CLAUDE.md`; 5-entry regression loop silent; `grep -qxF 'CLAUDE.md' .gitignore` no match |
| V12 | credential grep | no output |
| V13 | manual **13**-box walkthrough | all 13 hold (table below) |
| **V14** | source-level reconciliation, both directions | **RED → GREEN, see evidence below** |

`git diff --cached --numstat` over the four paths: `0 1 .gitignore`, `3 1 AGENTS.md`,
`244 0 CLAUDE.md`, `2 0 README.md`.

No background processes were started. No `git commit` was run.

## TDD Cycle Evidence — corrective pass

Rollout **step 0** was executed first, exactly as `design.md` and `tasks.md` require: V14
was run against the *currently staged, factually wrong* files before a single character was
edited, and its output captured verbatim as RED.

| Task | "Test" (V-check) | Layer | Safety Net | RED (captured verbatim) | GREEN | TRIANGULATE | REFACTOR |
|------|------------------|-------|------------|-------------------------|-------|-------------|----------|
| 0.1–0.3 step-0 RED capture | V14.1, V14.4, V14.5 | Shell check | ✅ Existing-file branch: pass 1's `CLAUDE.md` (224 lines) and `AGENTS.md` read before any edit; pass-1 V1–V12 baseline recorded above | ✅ Failed, three independent ways. V14.1 returned the expected three-line hit set incl. `client/src/views/components/game/scenes/ShopComponent.vue:313`. V14.4 printed exactly five lines: `UNRECONCILED: source has a project-API call CLAUDE.md omits (stripe/create-checkout-session)`, `… (ShopComponent.vue)`, `… (VITE_API_BASE_URL)`, `… (app_jwt)`, `UNRECONCILED: AGENTS.md bullet does not name the Stripe path`. V14.5 returned **empty** where exactly one endpoint was required | N/A (RED-capture task) | N/A | N/A |
| 2.1–2.3 `CLAUDE.md` "How services talk" | V14.1/V14.4/V14.5, V4a, V5a | Shell check | ✅ Section re-read in full before editing; the already-correct server→API / reverse-channel / shared-DB paragraphs preserved byte-for-byte | ✅ Failed: the four `CLAUDE.md`-side `UNRECONCILED` lines from 0.2, plus V14.5 empty | ✅ Passed: V14.4 silent; V14.5 → exactly `/api/stripe/create-checkout-session`; V4a silent (all 18 tokens incl. the three new Stripe tokens); V5a silent across both documents | ✅ 5 orthogonal cases: forward reconciliation (V14.4), reverse reconciliation (V14.5), source hit-set stability (V14.1, unchanged three lines), wording floor (V4a), two-directional wording ban (V5a). V14.5 is the case that a naive "just delete the false sentence" fix would still fail — it demands the endpoint be *named*, not merely not-denied | ✅ Clean: `## How services talk` heading and position unchanged; the correct table rows kept verbatim; one `Client -> API` row added rather than the table rebuilt |
| 3.1–3.3 known-gap 2 (domain drift) | source grep + V4b + V10 | Shell check | ✅ Gap section re-read; gaps 1, 3, 4 left byte-identical, numbering preserved | ✅ Failed: `grep -n 'boombang\.com' docker-compose.yml` → **no output, exit 1** (the literal the doc attributed to that file does not exist), while `grep -n 'docker-compose.yml' CLAUDE.md` showed line 203 naming it as a `boombang.com` source | ✅ Passed: `grep -n 'boombang\.com' docker-compose.yml` still exit 1 (unchanged repo fact); gap 2 now says `docker-compose.yml` "holds no such literal and receives those hostnames only by `${*_VIRTUAL_HOST}` interpolation"; V4b's `boommania.com` and `play.boommania.com` source-side greps silent; V10 config diff empty in both forms | ✅ 3 cases: source-side absence of the literal (the falsifier), source-side presence of the `boommania.com`/CORS counterparts (V4b), and non-remediation (V10 config diff empty — proves no domain string was rewritten) | ✅ Clean — item stays item 2 of 4, leads with the concrete CORS consequence rather than an inventory |
| 4.1–4.2 line budget | V2 | Shell check | ✅ Pre-edit count `224` recorded | ✅ Failed: after sections 2 and 3 landed, `wc -l < CLAUDE.md` → **`246`**, over the D14 245 working ceiling | ✅ Passed: applied D14 trim-ledger **item 1** (packages-by-wiring-status paragraph, 11 → 8 lines, `textures_maker` detail folded in as D14 prescribes) → `244`; stopped there per "stop as soon as it is at or under 245" | ✅ 2 cases: upper bound (`<= 245`) and lower floor (`>= 150`); trailing-newline check re-run and still silent | ✅ Clean: no heading dropped, no surface-inventory row dropped, the Stripe description untouched — the three hard rules D14 sets while trimming |
| 5.1–5.3 `AGENTS.md` bullet | V8, V14.4, V5a | Shell check | ✅ Approval-style guards on unchanged content: Codex footer count, `longText` presence, and the `3	1` numstat all asserted after the edit | ✅ Failed: `grep -n 'Client . API' AGENTS.md` → `360:- **Client ↔ API**: None — the client never calls the Laravel API directly; all client traffic goes to the server over Socket.IO`; `grep -c 'None' AGENTS.md` → `1`; V14.4's AGENTS.md-side check printed `UNRECONCILED: AGENTS.md bullet does not name the Stripe path` | ✅ Passed: V14.4 silent; `grep -n 'Client . API' AGENTS.md \| grep -c 'create-checkout-session'` → `1`; V5a silent (no `None`, no "never calls", and "all **other** client traffic is" does not match the banned `all client traffic (goes\|is)`); `git diff --cached --numstat -- AGENTS.md` → `3	1	AGENTS.md`; corrected changed-line sub-check → `4`, cross-checking 3+1 | ✅ 4 cases: bullet names the endpoint, bullet is not an absolute denial, exactly one `CLAUDE.md` cross-reference survives, and the Codex footer / `longText` conventions are untouched — a collateral edit would break the last | ✅ Clean — one physical line, bold label kept, no trailing period, three sibling bullets untouched (raw `-U0` diff shows exactly two hunks) |
| 6.1–6.3 full-suite re-verification | V1–V14 | Shell check | ✅ Pass-1 results above are the baseline; every check re-run rather than assumed | ✅ Failed pre-edit: V14 only (V1–V13 were already green in pass 1 — which is precisely the defect V14 exists to close) | ✅ Passed: all of V1–V14 green, `--cached` forms used for V8/V9/V11 and the corrected V8 changed-line sub-check used in place of the unsatisfiable `^[+-][^+-]` form | ✅ 14 distinct checks; V14 alone triangulates in 5 sub-parts (V14.1 hit set, V14.2 classification, V14.3 liveness, V14.4 forward, V14.5 reverse) | N/A (verification task) |
| 7.1–7.3 re-staging | V10, V11 (`--cached` halves) | Shell check | ✅ Pre-restage status inspected; index still held pass 1's wrong content | ✅ Failed: before `git add`, `git status --porcelain` showed `MM AGENTS.md` / `AM CLAUDE.md` — the index carried the false text while the working tree carried the fix | ✅ Passed: plain unforced `git add CLAUDE.md AGENTS.md README.md .gitignore` → `M  .gitignore`, `M  AGENTS.md`, `A  CLAUDE.md`, `M  README.md`, no residual `MM`/`AM` | ✅ 2 cases: all four staged clean, and the whole-tree porcelain (outside `openspec/`) still lists exactly those four and no fifth path | N/A |
| 8.1–8.6 V13 | V13 manual 13-box walkthrough | Manual review | N/A | ✅ not-run (V13 is a manual read-through, not an executable assertion) — RED for its four re-opened boxes is carried by 0.2/0.3, 3.1 and 5.1 above | ✅ Passed: all 13 boxes hold | ✅ 4 residual-judgement passes: box 4 prose-says-the-right-thing, box 6 factual-not-prescriptive + `docker-compose.yml` attribution, box 8 bullet accuracy, box 13 meta-check that no coverage entry cites V5 as evidence for the client→API claim | N/A |

### Test Summary (corrective pass)

- **Total checks written/run**: 14 (V1–V14), covering 32 tasks
- **Total checks passing**: 14
- **Layers used**: Shell/verification checks (13), Manual review (1)
- **Approval tests**: `AGENTS.md`'s unchanged-content assertions (Codex footer = 1,
  `longText` >= 1, `3	1` numstat, two-hunk raw diff) and `README.md`/`.gitignore`'s
  unchanged `2	0` / `0	1` numstats serve as approval tests that pass-1 work survived
  the corrective edits intact.
- **Pure functions created**: 0 (documentation-only change)
- **V5 is not cited as evidence for the client→API claim anywhere in this log.** It appears
  only as a wording floor. V14 carries that claim.

## V13 — thirteen-box walkthrough (corrective pass)

| # | Box (abridged) | Evidence | Verdict |
|---|----------------|----------|---------|
| 1 | Exists, English, five required sections | V1, V3 (9 headings, exact order), V5c | pass |
| 2 | Every surface row correct | Unchanged from pass 1; V3 + the pass-1 cell-by-cell read against D4 | pass |
| 3 | Commands resolve to real manifest scripts | V6 incl. both tripwires; the D14 trim kept the `cd server/src/packages/<name> && npm install && npm start` form | pass |
| 4 | Gameplay Socket.IO-exclusive **and** exactly one Stripe client→API path, plus token / reverse-channel / shared-DB facts | **V14.1/.3/.4/.5** (source-level), V4a+V4b, V5a as wording floor only | **pass — re-opened and closed** |
| 5 | `socket.js`, `phaser/services/`, `collections/`, `boot/` named | V4a + V7; the transport paragraph now also states `socket.js` is *not* the client's only outbound surface, so it agrees with box 4 | pass |
| 6 | Four gaps factual, not remediated; drift attributed only to files holding the literal | `grep -n 'boombang\.com' docker-compose.yml` → exit 1; gap 2 rewritten per D13; V10 config diff empty; `test -d web` / `test -d .github/workflows` silent | **pass — re-opened and closed** |
| 7 | 150–250 lines | V2 → `244` (also inside the stricter 245 working ceiling) | pass |
| 8 | `AGENTS.md` corrected, replacement accurate not an absolute denial, cross-referenced | V8, V5a, V14.4 | **pass — re-opened and closed** |
| 9 | `README.md` cross-referenced | V9 (`2	0`, zero deletions) | pass |
| 10 | Exactly four paths | V10 | pass |
| 11 | `.gitignore` one deletion, `.claude` survives | V11 | pass |
| 12 | `git check-ignore` non-zero, file visible to git | V11 | pass |
| 13 | Suite has a source-level reconciliation check; no check validates the client→API claim by grepping `CLAUDE.md` alone | V14 exists, ran, and produced the RED that proves it is falsifiable; `design.md`'s tautology audit demotes V5 to a wording floor and this log honours that | **pass — new box** |

Non-duplication re-check after the section 2/3 edits:
`grep -niE 'detected language\|responde\|screenshot\|feature status\|coautor\|co-author' CLAUDE.md`
→ no matches. No Codex commit footer, no response-language framing, no feature-status
table, no screenshot gallery.

## Deviations from the corrective plan

1. **One edit outside the two sections `tasks.md` named: the `Inside client/` transport
   paragraph.** `tasks.md` 1.4 says the `## Inside client/` section is "already correct …
   do not re-edit". The **amended spec** overrides that: "Client And Server Internals Named
   Correctly" now states *"`socket.js` MUST NOT be described as the client's only outbound
   surface … the two descriptions MUST agree."* Pass 1's text read "is the client's only
   transport module: every piece of game data leaves and enters the client through that
   Socket.IO connection", which directly contradicts the corrected "How services talk"
   section and would have failed the inter-service requirement's "MUST NOT contradict any
   of them elsewhere in the document" clause. Minimal reword applied (+1 line): "is the
   client's transport module: all gameplay data … It is not the client's only outbound
   surface — see How services talk for the one Stripe checkout `POST`". Same file, no fifth
   path, no other section touched.
2. **D14 trim-ledger item 1 was needed.** The corrections landed at `246`, one line over the
   245 working ceiling. Item 1 (packages-by-wiring-status paragraph, 11 → 8 lines) was
   applied and brought it to `244`; items 2–6 were **not** applied, per D14's "stop as soon
   as it is at or under 245". The projected 235 in D14 was optimistic by ~11 lines because
   the Stripe paragraph carries more source detail than the estimate assumed.
3. **`git diff` plain forms are empty for all four paths** and the `--cached` forms are
   authoritative, exactly as `design.md`'s V8/V9/V11 corrections anticipate. Both forms were
   run; no empty result is reported as a pass on its own.
4. **Pass-1 deviations 2–5 still stand** (`server/src/storage/` omitted per D11's
   authoritative 16-entry list; `cd api && ./vendor/bin/…` command form; the `doc/` row
   wording that avoids the V5-prohibited `doc/screenshots` literal; the pass-1 V7
   relative-path RED). None was re-opened by this pass.

## Remaining tasks

None. All 32 tasks in the corrective `tasks.md` are complete and all 13 spec acceptance
boxes are ticked. Task 7.3 explicitly ends the list at "re-staged, not committed", so the
absence of a commit is the intended terminal state, not deferred work. No requested scope
was moved to future work.

## Workload / PR boundary

Single PR, single work unit, one commit's worth of staged content — the force-chained
strategy resolved to no chaining.

- 4 repository paths, **249 insertions / 2 deletions = 251 changed lines** (63% of the
  400-line budget). Up 20 lines from pass 1's 231, entirely from the factual correction.
- The four paths remain inseparable: splitting `CLAUDE.md` from the two cross-reference
  lines would leave `AGENTS.md` and `README.md` linking to a file that does not exist, and
  splitting off `.gitignore` would leave a commit whose ignore rule contradicts its own
  tree. Rollback stays a plain `git revert` of one commit.
- Suggested commit message when the maintainer chooses to commit:
  `docs: add authoritative CLAUDE.md structural map and correct the AGENTS.md client-to-API bullet`

## Follow-ups recommended (out of scope here)

1. Correct `openspec/config.yaml`'s `strict_tdd` test command — it still points at the
   `objects-maker` asset pipeline, not a test runner. (Carried over from pass 1.)
2. **Resolved in this cycle, no longer a follow-up:** `design.md`'s defective V8
   changed-line sub-check was corrected during the spec/design amendment; the corrected
   form was the one run here and it returns `4`.
3. `AGENTS.md` retains other stale content this change is forbidden to touch: it still
   lists `web/` as one of five live services and keeps the `Web ↔ API` bullet. `CLAUDE.md`
   carries the correction; a follow-up change should reconcile `AGENTS.md` itself.
4. `VITE_API_BASE_URL` and `VITE_API_URL` are consumed by `client/src` but absent from
   `client/.env.example` (design open question 2, and the mechanism behind the corrected
   Stripe path). Left as a pre-existing repository condition; fixing it would create a fifth
   path. `CLAUDE.md` documents four gaps because the spec requires exactly four.
