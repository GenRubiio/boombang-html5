# Tasks: create-project-claude-md — corrective pass

The first apply pass staged four paths (`CLAUDE.md` created, `AGENTS.md`, `README.md`,
`.gitignore` modified) but shipped a factual error: `CLAUDE.md` asserted "nothing in
`client/src` calls the Laravel API", and `AGENTS.md`'s replacement bullet said the same
thing. Both are false — `ShopComponent.vue:306,313` makes a live, JWT-authenticated `POST`
to `api/routes/api.php:189-190` (Stripe checkout-session creation). `verify-report.md`
verdict is **FAIL** on exactly this. The spec (`specs/project-documentation/spec.md`) and
design (`design.md`) have already been amended to state the true fact set and to add a
source-level reconciliation check (V14) that would have caught the false claim. This task
list is a **corrective second pass over the currently staged state** — it does not restart
from scratch, and it does not re-touch anything that is already correct.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~238–252 (`CLAUDE.md` untracked new file, ~224 → projected 235, working ceiling 245, all counted as insertions; `AGENTS.md` stays `+3/-1`; `README.md` stays `+2/-0`; `.gitignore` stays `+0/-1`) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | single work-unit slice (force-chained strategy, workload under budget) |

```text
Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single work-unit slice (force-chained strategy, workload under budget)
400-line budget risk: Low
```

Rationale: this remains a documentation-only change touching exactly four paths. The
correction only rewrites two sub-sections of the already-drafted `CLAUDE.md` (the "How
services talk" body and the known-gaps domain-drift entry) and rewords one `AGENTS.md`
bullet — it does not add a fifth path, a new file, or any code/config change. `design.md`
D14 projects the corrected `CLAUDE.md` at 235 lines against a 245 working ceiling and a
250 spec bound, with a six-entry ranked trim ledger on standby. Total changed lines stay
well under half the 400-line budget, so this ships as one reviewable unit — chaining is
force-resolved to "no chaining needed," not left `pending`.

## Constraints for every task below

- **Do not run** `cd server/src/packages/objects-maker && npm test` (the configured
  `strict_tdd` command) at any point — it is `node index.js`, an asset-conversion pipeline
  with an absent `node_modules`, not a test suite (D9 in `design.md`).
- **V1–V14** (see `design.md`, section "D8: verification") are the executable substitute
  for `strict_tdd`. Each task below names which V-check(s) give its RED (before) and GREEN
  (after) evidence.
- **V5 is a wording floor only.** Do not cite it as evidence for the client→API claim in
  any GREEN evidence or in the V13 walkthrough — that is what shipped the defect. **V14**
  is the check that actually guards that claim.
- **All `git diff` sub-checks must be run in `--cached` form** (and, where noted, also the
  plain form) — the four paths are already staged, so plain `git diff` on an
  already-staged, not-yet-re-edited path returns nothing and would read as a vacuous pass.
- **Exactly four paths may change**: `CLAUDE.md`, `AGENTS.md`, `README.md`, `.gitignore`.
  Any other path appearing in `git status --porcelain` (outside `openspec/`) is a failure.
- **Never `git add -f`.** Any use anywhere in this change is an automatic fail.
- **Do not commit.** This task list ends with the four paths re-staged (`git add`, no
  `-f`) and V13 walked through over all thirteen boxes — it does not run `git commit`.
- Run every shell check from the repository root:
  `/Users/evgeny.lyubeznyy/Desktop/Proyectos/boombang-html5`.

## 0. Rollout step 0 — capture V14 RED evidence against the current (wrong) staged state

This is the strict-TDD RED for the correction itself: prove the defect is real and
detectable *before* touching any file.

- [x] 0.1 Run V14.1 exactly as written in `design.md`:
      `grep -rInE 'fetch\(|axios' client/src | cut -d: -f1,2 | sort` — expect exactly
      three lines: `client/src/phaser/controllers/scene/MovementControlsController.js:183`,
      `client/src/phaser/managers/AvatarManager.js:596`,
      `client/src/views/components/game/scenes/ShopComponent.vue:313`.
- [x] 0.2 Run V14.4 (forward reconciliation) against the currently staged `CLAUDE.md` and
      `AGENTS.md`:
      ```bash
      for s in 'stripe/create-checkout-session' 'ShopComponent.vue' 'VITE_API_BASE_URL' 'app_jwt'; do
        grep -qF "$s" CLAUDE.md || echo "UNRECONCILED: source has a project-API call CLAUDE.md omits ($s)"
      done
      grep 'Client . API' AGENTS.md | grep -qF 'create-checkout-session' \
        || echo "UNRECONCILED: AGENTS.md bullet does not name the Stripe path"
      ```
      Expect **exactly four `UNRECONCILED` lines** (the loop fires for all four tokens
      because the current `CLAUDE.md:139` denies the path outright, plus the `AGENTS.md`
      line). Record this output verbatim as RED evidence.
- [x] 0.3 Run V14.5 (reverse reconciliation) against the currently staged `CLAUDE.md`:
      `grep -oE '/api/[a-z0-9-]+/[a-z0-9-]+' CLAUDE.md | sort -u` — expect **empty output**
      (the current file names no endpoint at all, since it denies the path exists instead
      of describing it). Record this as RED evidence too — it fails the "exactly one line"
      expectation by being empty, not by naming a second endpoint.

## 1. Already complete from the first pass — confirmed unaffected, no action needed

These are done and stay done; do not redo them. They are unaffected by the correction.

- [x] 1.1 `.gitignore` — the line `CLAUDE.md` is already deleted and staged
      (`git diff --cached --numstat -- .gitignore` → `0	1	.gitignore`). Confirmed by
      re-reading the file: 12 lines, `.claude` present, no `CLAUDE.md` entry (D0, V11).
- [x] 1.2 `README.md` — the Spanish cross-reference line into `## Documentación técnica`
      is already staged (`git diff --cached --numstat -- README.md` → `2	0	README.md`).
      Confirmed by re-reading: line present, no other change (D7, V9). Not touched by this
      correction.
- [x] 1.3 `AGENTS.md` cross-reference paragraph — the added line after the Project
      Overview list (`AGENTS.md:15-16`, "Repository structure, per-service internals, and
      inter-service communication are documented authoritatively in
      [CLAUDE.md](CLAUDE.md); ...") is already staged and correct (D6). Only the
      `Client ↔ API` bullet at `AGENTS.md:360` needs correction — see section 5.
- [x] 1.4 `CLAUDE.md` structural skeleton — the nine headings (V3), the surface inventory
      table (V4a paths + V7), the `## Inside client/`, `## Inside server/`, `## Inside
      api/`, `## Deep dives in doc/`, and `## Related documents` sections are all already
      correct and untouched by the client→API correction. Do not re-edit these sections.
- [x] 1.5 Initial unforced staging — the four paths were staged with plain `git add`, no
      `-f` (V11). Staging will need to be **re-run** after the corrective edits in
      sections 2, 3, and 5 (working-tree edits do not auto-update the index) — see
      section 7. This is a re-stage, not a new staging decision.

## 2. Correct `CLAUDE.md` — "How services talk" section (re-opens spec box 4)

The current text at `CLAUDE.md:135-173` (heading `## How services talk`) contains the
forbidden absolute denial at line 139: *"There is no direct client-to-API HTTP path:
nothing in `client/src` calls the Laravel API."* This must be replaced with the true
claim set from `design.md` D12.

- [x] 2.1 RED evidence — re-run 0.2/0.3 immediately before editing this section (they are
      still RED at this point; do not skip re-confirming).
- [x] 2.2 Rewrite the section body (keep the `## How services talk` heading; do not move
      it) to assert, and not contradict, every one of these claims (D12 in `design.md`):
  - Gameplay client→server traffic is Socket.IO exclusively, carried solely by
    `client/src/sockets/socket.js` (this much of the current text is already correct —
    keep it).
  - **Exactly one non-gameplay client→API HTTP path exists**: a `POST` from
    `ShopComponent.vue:313` to `${VITE_API_BASE_URL}/api/stripe/create-checkout-session`,
    bearer-authenticated from `localStorage`'s `app_jwt`, base URL from
    `import.meta.env.VITE_API_BASE_URL` falling back to `http://127.0.0.1:8000`
    (`ShopComponent.vue:306`). Receiving route: `api/routes/api.php:189-190` →
    `StripeController::createCheckoutSession`.
  - That path is **live, not dead or planned**: `handleStripePayment()` is invoked at
    `ShopComponent.vue:277` and `:415`; the component is imported by
    `GameSceneScreen.vue`, `PublicSceneScreen.vue`, and `PrivateSceneScreen.vue`.
  - The boundary is **payment rail, not data volume** — the same component emits
    gold/silver purchases over Socket.IO (`RequestSocketsEnum.PURCHASE_SHOP_ITEM`,
    `ShopComponent.vue:294`) while only the Stripe purchase leaves over HTTP.
  - **API-host media URLs are not call paths** — `MailPanelComponent.vue:180` and
    `ObjectsNpcModalComponent.vue:200,211` build asset URLs against
    `VITE_API_URL`/`api.boombang.com`, but these are rendered URL strings, not
    `fetch`/`axios` calls, and must not be counted as additional client→API paths. (The
    existing third-party paragraph about Google Sign-In/reCAPTCHA/`VITE_WEB_TERMS_URL`
    can stay, but must be clearly separated from the media-URL point.)
  - Add a `Client -> API` row to the direction table (currently `CLAUDE.md:144-150`),
    e.g. `HTTP POST (Stripe checkout-session)` / `one-off payment initiation, not
    gameplay data`.
  - Keep, unchanged, the already-correct rows: server→API via
    `server/src/services-api/*ApiService.js` with `EMULATOR_API_TOKEN`/
    `VerifyEmulatorToken`; the `POST /internal/add-bot-token` reverse channel; the
    server's `/api` mount framed as an inbound channel the API calls, not a client path;
    the shared `boombang_api` database, not an ORM boundary.
  - **Neither forbidden wording may appear anywhere in the file**: not the overstatement
    `Direct HTTP/HTTPS calls for non-real-time data`, and not any absolute denial (`None`,
    `never calls the Laravel API directly`, `nothing in client/src calls`, `no direct
    client-to-API HTTP path`).
- [x] 2.3 GREEN evidence — re-run V14.1 (unchanged, still the three-line hit set), V14.4
      (expect no `UNRECONCILED` output for the four `CLAUDE.md`-side tokens), V14.5
      (expect exactly one line, `/api/stripe/create-checkout-session`), V4a (`Socket.IO`,
      `stripe/create-checkout-session`, `ShopComponent.vue`, `VITE_API_BASE_URL` all
      present), V5a (both forbidden-wording families absent from `CLAUDE.md`).

## 3. Correct `CLAUDE.md` — Known gaps domain-drift entry (re-opens spec box 6)

The current gap-2 entry at `CLAUDE.md:203-207` says "`docker-compose.yml` ... use[s]
`boombang.com` hostnames", which is false — `docker-compose.yml` contains no literal
`boombang.com` (its 7 `boombang` occurrences are the Docker network name; hostnames arrive
by `${*_VIRTUAL_HOST}` interpolation). `design.md` D13 has the corrected attribution.

- [x] 3.1 RED evidence — run `grep -n 'boombang\.com' docker-compose.yml`; expect no
      output (confirms the literal is genuinely absent, so the current wording is wrong);
      run `grep -n 'docker-compose.yml' CLAUDE.md` around the gap-2 entry and confirm it
      currently reads as a `boombang.com` source.
- [x] 3.2 Rewrite gap-2 (keep it as item 2 of the four; do not renumber or drop any of
      the other three gaps) per D13:
  - Attribute `boombang.com` literals only to the root `.env.example` (the five
    `*_VIRTUAL_HOST` values), `README.md`, and `AGENTS.md`.
  - Attribute `boommania.com` literals only to `launcher/.env.example`, `launcher/main.js`,
    the launcher `electron-builder` `productName`/`appId`, the two
    `docker/nginx/boommania.com`/`www.boommania.com` vhost files, and
    `docker/nginx/api-cors.conf`.
  - `docker-compose.yml` may be mentioned **only** as receiving hostnames by
    `${*_VIRTUAL_HOST}` interpolation from the root `.env.example` — never as a
    `boombang.com` source itself.
  - Lead with the sharpest instance as an observation: `docker/nginx/api-cors.conf:2`
    hard-codes `Access-Control-Allow-Origin "https://play.boommania.com"` while
    `.env.example:59` sets `CLIENT_VIRTUAL_HOST=play.boombang.com` — the CORS origin the
    API advertises does not match the configured client host.
  - Do not remediate — no domain string may be rewritten anywhere in the repo.
- [x] 3.3 GREEN evidence — re-run `grep -n 'boombang\.com' docker-compose.yml` (still no
      output — unchanged repo fact); confirm `CLAUDE.md`'s gap-2 entry no longer claims
      `docker-compose.yml` uses `boombang.com` hostnames and instead states the
      interpolation relationship; V4b's `boommania.com`/CORS-drift source-side greps still
      pass (`grep -rq 'boommania.com' launcher docker/nginx`,
      `grep -q 'play.boommania.com' docker/nginx/api-cors.conf`); V10's config-diff check
      (`git diff -- .env.example docker-compose.yml docker/ launcher/`) still produces no
      output (proving no domain string was rewritten).

## 4. Re-verify `CLAUDE.md` length against the D14 budget

- [x] 4.1 After sections 2 and 3 land, run `wc -l < CLAUDE.md`. `design.md` D14 projects
      235 lines against a **245 working ceiling** (250 is the spec's hard bound). If the
      count exceeds 245, apply the six-entry ranked trim ledger in D14, **in order**,
      stopping as soon as it is at or under 245:
      1. Collapse the packages-by-wiring-status paragraph (save ~4 lines).
      2. Fold `config/`/`enums/`/`plugins/`/`utils/` into one "supporting modules" row in
         the client directory table (save ~3 lines).
      3. Shorten the assets-by-category paragraph, moving the `jsonmin`/`jsonunmin`
         mention into the surface-inventory row (save ~2 lines).
      4. Shorten the shared-database paragraph (save ~2 lines).
      5. Shorten the container/hostname prose (save ~1 line).
      6. Shorten the surface-inventory lead-in (save ~1 line).
      Never drop a required heading, never drop a surface-inventory row, never trim the
      Stripe description, and never go below 150 lines.
- [x] 4.2 GREEN evidence — V2: `wc -l < CLAUDE.md` in `[150, 245]` (working ceiling,
      stricter than the spec's 250); trailing-newline check still passes.

## 5. Correct `AGENTS.md` — `Client ↔ API` bullet (re-opens spec box 8)

`AGENTS.md:360` currently reads
`- **Client ↔ API**: None — the client never calls the Laravel API directly; all client
traffic goes to the server over Socket.IO` — the exact absolute denial the amended spec
now forbids.

- [x] 5.1 RED evidence — `grep -n 'Client . API' AGENTS.md` shows the current false
      bullet; `grep -c 'None' AGENTS.md` includes this line; re-run 0.2's
      `AGENTS.md`-side check and confirm it still fires.
- [x] 5.2 Replace the bullet in place, verbatim, with the D5-normative text (keep the
      bold label, no trailing period, do not touch the three sibling bullets or any other
      line of `AGENTS.md`):
      ```
      - **Client ↔ API**: One path only — a JWT-authenticated `POST` to `/api/stripe/create-checkout-session` from `ShopComponent.vue`; all other client traffic is gameplay and goes over Socket.IO
      ```
- [x] 5.3 GREEN evidence — V8: `grep -c 'Direct HTTP/HTTPS calls' AGENTS.md` still exits
      non-zero (0 matches, unaffected by this edit); `grep -c 'CLAUDE.md' AGENTS.md` → `1`
      (unchanged from section 1.3); `grep -c 'Co-Authored-By: Codex' AGENTS.md` → `1`;
      `grep -c 'longText' AGENTS.md` → `>= 1`; `git diff --cached --numstat -- AGENTS.md`
      **and** `git diff --numstat -- AGENTS.md` both → `3	1	AGENTS.md` (run both forms,
      whichever is non-empty is authoritative for the current staging state);
      `git diff --cached -U0 -- AGENTS.md | grep -E '^[+-]' | grep -vcE '^(\+\+\+|---) '`
      → `4` (the corrected V8 changed-line sub-check, not the unsatisfiable
      `^[+-][^+-]` form from the first pass); V14.4's `AGENTS.md`-side check now passes
      (no `UNRECONCILED` line).

## 6. Full-suite re-verification after both edits land

- [x] 6.1 Re-run V14 end to end: V14.1 (unchanged three-line hit set), V14.2 (each hit
      correctly classified), V14.3 (the Stripe route is live: `create-checkout-session`
      at `api/routes/api.php:190`; `handleStripePayment()` invoked twice; all three scene
      screens import `ShopComponent`), V14.4 (no `UNRECONCILED` output for either
      document), V14.5 (exactly one endpoint, `/api/stripe/create-checkout-session`).
- [x] 6.2 Re-run V4a (wording floor) and V4b (source-side counterparts) — no `MISSING:` or
      `UNSOURCED:` output. Re-run V5a/V5b/V5c and confirm they are treated as a wording
      floor only in any evidence log — do not cite V5 as proof of the client→API claim.
- [x] 6.3 Re-run V1, V2 (see section 4), V3, V6, V7, V9, V10, V11 (both plain and
      `--cached` diff forms), V12 — all must still be clean; none of these are expected to
      change from the first pass except where sections 2–5 above note otherwise.

## 7. Re-stage the four paths, unforced

The corrective edits in sections 2, 3, and 5 modify working-tree files that were already
staged from the first pass; the index must be refreshed.

- [x] 7.1 Run `git add CLAUDE.md AGENTS.md README.md .gitignore` again — no `-f` flag.
      (`README.md` and `.gitignore` are unchanged by this pass but are included for a
      clean, single re-stage; re-adding an unchanged staged file is a no-op.)
- [x] 7.2 Confirm: `git status --porcelain -- CLAUDE.md AGENTS.md README.md .gitignore`
      shows all four staged with no residual working-tree modification (no `MM`, only
      `A `/`M `); `git status --porcelain --untracked-files=all | grep -v '^.. openspec/'`
      shows exactly the same four lines as before (` M .gitignore`, ` M AGENTS.md`,
      ` M README.md`, `A  CLAUDE.md` — or `?? CLAUDE.md` if run before this step's `git
      add`) and no fifth path.
- [x] 7.3 **Stop here. Do not run `git commit`.**

## 8. V13 — thirteen-box spec acceptance-criteria walkthrough

The amended spec has **thirteen** acceptance boxes
(`specs/project-documentation/spec.md:23-52`), four of which are currently unchecked:
box 4 (inter-service communication), box 6 (known gaps / domain-drift attribution), box 8
(`AGENTS.md` correction), and box 13 (verification suite has a source-level check, newly
added). The other nine were already ticked in the first pass and are unaffected.

- [x] 8.1 Box 4 — re-read `CLAUDE.md`'s "How services talk" section against D12's claim
      list (section 2 above) and V14's GREEN evidence (section 6.1); tick it only once
      V14.1/V14.4/V14.5 all pass and neither forbidden wording appears.
- [x] 8.2 Box 6 — re-read the Known gaps section, confirming all four gaps are present,
      factual (no remediation language), and that the domain-drift entry correctly
      excludes `docker-compose.yml` as a `boombang.com` source per D13; tick it using
      section 3's GREEN evidence.
- [x] 8.3 Box 8 — re-read the `AGENTS.md` bullet against section 5's GREEN evidence;
      confirm it is not an absolute denial, names the Stripe path, and carries exactly one
      `CLAUDE.md` cross-reference; tick it.
- [x] 8.4 Box 13 — confirm the verification suite (this `tasks.md` plus `design.md`'s D8
      section) contains V14 as a genuine source-level reconciliation check, and that no
      check in the coverage table or in this file's evidence log cites V5 as proof of the
      client→API claim; tick it.
- [x] 8.5 Spot-re-check the nine already-ticked boxes (1, 2, 3, 5, 7, 9, 10, 11, 12) are
      still accurate after sections 2–5's edits — none of those sections touched the
      content those boxes cover.
- [x] 8.6 Final by-eye comparison of `CLAUDE.md` against `AGENTS.md` and `README.md`,
      confirming no duplication of the Codex commit-footer convention, the "respond in
      detected language" framing, README's feature-status table, or its screenshots
      (unchanged from the first pass, re-confirm after the section 2/3 edits did not
      introduce any).

## 9. Terminal state

- [x] 9.1 Confirm the working tree matches: four paths staged (`CLAUDE.md` corrected,
      `AGENTS.md` corrected, `README.md` and `.gitignore` unchanged from the first pass),
      nothing committed, no fifth path, no `git add -f` anywhere in the transcript, and
      `cd server/src/packages/objects-maker && npm test` was never run.
