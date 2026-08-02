Verdict: PASS

# Verify Report: create-project-claude-md (re-verification after corrective apply pass)

**Verified**: 2026-08-02 (supersedes the `Verdict: FAIL` report of the same date, which
predates the corrective pass)
**Change**: documentation-only; 4 repository paths (`CLAUDE.md` new/244 lines, `AGENTS.md`
`+3/-1`, `README.md` `+2/-0`, `.gitignore` `+0/-1`) = 249 insertions / 2 deletions =
**251 changed lines**. Not committed.
**Headline**: the corrective pass closes both prior blockers. CRITICAL-1 (the false
"no direct client-to-API HTTP path" claim) is fixed and the replacement text was
re-derived from source by me, independently of the document: it neither overstates nor
understates. CRITICAL-2 is closed by V14, which I confirmed is genuinely falsifiable via
four mutation probes. All 13 acceptance boxes hold. All 14 V-checks pass. Blast radius is
still exactly four paths and no `git add -f` was used. Two non-blocking warnings, one of
them an environmental staging-state anomaly the maintainer must know about before
committing.

---

## Resolved prior FAIL (history preserved)

| Prior blocker | What was wrong | How it was closed | Verified how, this pass |
|---------------|----------------|-------------------|-------------------------|
| **CRITICAL-1** | `CLAUDE.md:139` asserted *"There is no direct client-to-API HTTP path: nothing in `client/src` calls the Laravel API"*, and `AGENTS.md:360` said *"None — the client never calls the Laravel API directly"*. Both falsified by a live JWT-authenticated `POST` from `ShopComponent.vue:313`. The false premise was written into the spec and design, so it was not fixable inside apply | Spec amended (new "Inter-Service Communication Stated Per Source" claim set, both forbidden wordings tabulated, box 4 rewritten); design D12/D5/D13/D14 corrected; apply rewrote the `## How services talk` body, added a `Client -> API` direction-table row, reworded the transport paragraph, and replaced the `AGENTS.md` bullet with the D5-normative text | Re-derived from source, not from the document: V14.1–V14.5 all green, plus an independent broader grep for non-`fetch`/`axios` HTTP mechanisms (below). Verdict: **closed** |
| **CRITICAL-2** | The V1–V13 suite contained zero checks comparing any `CLAUDE.md` claim against the codebase. V5's prohibited-string grep was a tautology on the change's central claim | New spec requirement "Factual Claims Are Verified Against Source, Not Against The Document" + acceptance box 13; design gained a tautology audit and **V14**, a five-part bidirectional source-level reconciliation check; V5 demoted in writing to a wording floor | V14 exists, ran, produced captured RED against the pass-1 files, and I proved it is falsifiable with four mutation probes (below). Verdict: **closed** |
| WARN-1 (prior) | `design.md`'s V8 changed-line sub-check `grep -cE '^[+-][^+-]'` was unsatisfiable for a Markdown-bullet diff | design.md:770 replaced with the marker-agnostic form | Both forms run: old form → `1` (still unsatisfiable, as diagnosed); corrected form → `4`. **Closed** |
| WARN-2 (prior) | `CLAUDE.md` claimed `docker-compose.yml` "uses `boombang.com` hostnames" | D13 rewrote the attribution rule; gap 2 rewritten | `grep -n 'boombang\.com' docker-compose.yml` → no output, exit 1; gap 2 now says the opposite. **Closed** — see D13 section below |
| WARN-5 (prior) | Diff sub-checks read as vacuous passes once paths are staged | V8/V9/V11 made `--cached`-aware in design; apply ran both forms | Confirmed; I ran both forms too. **Closed** |
| WARN-7 (prior) | D9's blast-radius rationale for skipping the configured test command was overstated | Not changed | Still accurate as a critique (see "Configured test command" below), still non-blocking |
| WARN-3 / WARN-4 / WARN-6 (prior) | `server/src/storage/` and `client/src/style.css` omitted; `VITE_API_*` absent from `client/.env.example` | Not changed (out of scope) | Still present, still non-blocking — carried forward below |

---

## Test / validation commands

### Configured test command — deliberately NOT run, and why

`openspec/config.yaml:20` (apply) and `:22` (verify) both set:

```
test_command: "cd server/src/packages/objects-maker && npm test"
```

**It was not run at any point during this verification.** Re-confirmed on disk rather than
taken on trust:

| Fact | Evidence gathered this pass |
|------|-----------------------------|
| It is not a test runner | `server/src/packages/objects-maker/package.json:7-8` → `"start": "node index.js"`, `"test": "node index.js"` — byte-identical scripts |
| It is an asset pipeline that writes into the repo | `index.js` is an `AnimatedWebPMaker` that reads `objects-maker/objects/` and `fs.ensureDir`s `objects-maker/output/` |
| It could not run anyway | `server/src/packages/objects-maker/node_modules` is **absent** — it would crash at `require('fs-extra')` |
| The sibling unit command is a placeholder | `server/src/packages/textures_maker/package.json` → `"test": "echo \"Error: no test specified\" && exit 1"` |
| Proof it was not run by anyone in this cycle | `server/src/packages/objects-maker/output/` contains exactly one entry, the git-tracked `.gitignore`, mtime `Aug 2 02:14` (clone time). `git status` under `server/` is empty |
| No other sanctioned runtime command exists | `openspec/config.yaml:40-43` — `integration: []`, `e2e: []`; `:45` `coverage.command: ""`; `:49,52,55` lint/typecheck/format all empty |

Running it would violate the change's own "Documentation-Only Blast Radius" requirement.
Per `design.md` D9 and `tasks.md` "Constraints for every task below", **V1–V14 are the
sanctioned executable substitute**, and all fourteen were re-run by me from the repository
root.

> Nuance, informational only (carried from the prior report, still true): D9 argues that
> running the command would create a fifth path. `objects-maker/output/` already exists,
> is git-tracked, and its own `.gitignore` is `*`, so generated files would be ignored
> rather than surface as a fifth path. The conclusion (never run it) remains correct for
> the stronger reasons above.

### V1–V14 re-execution — all run from `/Users/evgeny.lyubeznyy/Desktop/Proyectos/boombang-html5`

| Check | Command (as run) | Actual output | Result |
|-------|------------------|---------------|--------|
| V1 | `test -f CLAUDE.md && echo OK` | `OK` | PASS |
| V2 | `wc -l < CLAUDE.md`; `awk 'END{print NR}'`; trailing-newline test | `244`; `244`; no `FAIL` line | PASS — in `[150,250]` and under the 245 working ceiling |
| V3 | `grep -n '^# CLAUDE.md$'`; the 8-heading `grep -nE`; `grep -c '^## '` | H1 at 1; headings at **11, 35, 71, 114, 134, 190, 207, 236** — strictly increasing, exact designed order; count `8` | PASS |
| V4a | 18-string `grep -qF` loop (incl. `stripe/create-checkout-session`, `ShopComponent.vue`, `VITE_API_BASE_URL`) | no `MISSING:` output | PASS |
| V4b | 10 source-side counterpart greps | no `UNSOURCED:` / `STALE CLAIM:` output | PASS |
| V5a | 6-pattern two-directional wording ban across **both** `CLAUDE.md` and `AGENTS.md` | no output from either file | PASS (wording floor only — not cited as evidence for box 4) |
| V5b | 6-string prohibited loop | no `PROHIBITED:` output | PASS |
| V5c | `grep -nE '[áéíóúñÁÉÍÓÚÑ¿¡]' CLAUDE.md` | no output | PASS |
| V6 | 3 manifest script loops + 3 composer greps + 2 tripwires | no output | PASS |
| V7 | backticked-path resolution loop, 3 allowlist classes | no `MISSING PATH:` output | PASS |
| V7+ | Markdown link-target resolution (added beyond V7) | no `MISSING LINK TARGET:` output — all 15 link targets resolve | PASS |
| V8 | see dedicated table below | see below | PASS, including the corrected changed-line sub-check |
| V9 | `grep -c 'CLAUDE.md' README.md`; numstat; `--stat`; raw `-U0` | `1`; `2	0	README.md`; `1 file changed, 2 insertions(+)`; one content line + one blank | PASS |
| V10 | porcelain (non-openspec); scoped status; `test -d web`; `test -d .github/workflows`; config diff (plain **and** `--cached`) | exactly ` M .gitignore`, ` M AGENTS.md`, ` M README.md`, `?? CLAUDE.md`; all four other commands silent | PASS |
| V11 | `git check-ignore`; status; `.gitignore` numstat; `-U0` changed line; 5-entry regression loop; `grep -qxF` | `check-ignore` printed nothing, **exit=1**; `?? CLAUDE.md`; `0	1	.gitignore`; exactly `-CLAUDE.md`; loop silent; no `grep -qxF` match | PASS |
| V12 | `grep -nE '(API_TOKEN\|PASSWORD\|SECRET\|_KEY)\s*=' CLAUDE.md` | no output | PASS |
| V13 | manual **13**-box walkthrough | 13/13 hold | PASS |
| **V14** | 5 sub-parts, source-first, bidirectional | see dedicated section below | **PASS** |

### V8 — `AGENTS.md`, including the corrected changed-line sub-check

| Sub-check | Expected | Actual | Result |
|-----------|----------|--------|--------|
| `grep -c 'Direct HTTP/HTTPS calls' AGENTS.md` | `0`, exit 1 | `0`, exit 1 | pass |
| `grep -c 'CLAUDE.md' AGENTS.md` | `1` | `1` | pass |
| `grep -c 'Co-Authored-By: Codex' AGENTS.md` | `1` | `1` | pass |
| `grep -c 'longText' AGENTS.md` | `>= 1` | `1` | pass |
| `grep -n 'Client . API' AGENTS.md \| grep -c 'create-checkout-session'` | `1` | `1` | pass |
| `git diff --numstat -- AGENTS.md` | `3	1	AGENTS.md` | `3	1	AGENTS.md` | pass |
| **corrected** `git diff -U0 -- AGENTS.md \| grep -E '^[+-]' \| grep -vcE '^(\+\+\+\|---) '` | `4` | **`4`** — cross-checks `3` insertions + `1` deletion | pass |
| *(old, known-defective form)* `grep -cE '^[+-][^+-]'` | — | `1` | confirms the design's diagnosis; correctly replaced |

Raw `-U0` diff inspected — exactly two hunks, no collateral edits:

```
@@ -14,0 +15,2 @@  +Repository structure, per-service internals, and inter-service
                    communication are documented authoritatively in [CLAUDE.md](CLAUDE.md); …
                   +(blank)
@@ -358 +360 @@  -- **Client ↔ API**: Direct HTTP/HTTPS calls for non-real-time data
                 +- **Client ↔ API**: One path only — a JWT-authenticated `POST` to
                    /api/stripe/create-checkout-session from `ShopComponent.vue`; all other
                    client traffic is gameplay and goes over Socket.IO
```

The replacement bullet is **byte-identical to the D5-normative text** (`design.md:372`),
keeps the bold label, is one physical line, and has no trailing period. The three sibling
bullets (`Client ↔ Server`, `Server ↔ API`, `Web ↔ API`) are untouched.

### V14 — source-level reconciliation (the check that closes CRITICAL-2)

| Sub-check | Expected | Actual | Result |
|-----------|----------|--------|--------|
| **V14.1** hit set — `grep -rInE 'fetch\(\|axios' client/src \| cut -d: -f1,2 \| sort` | exactly 3 named lines | exactly `MovementControlsController.js:183`, `AvatarManager.js:596`, `ShopComponent.vue:313` — no fourth, none missing | PASS |
| **V14.2** classification | 2 local, 1 project-API | `:183` `fetch('/src/assets/game/avatars/gata/config.json')`; `:596` `fetch(imgPath)`; `ShopComponent.vue:306` `VITE_API_BASE_URL \|\| 'http://127.0.0.1:8000'`; `:313` `fetch(\`${apiBaseUrl}/api/stripe/create-checkout-session\`)` | PASS |
| **V14.3** liveness | route live, method invoked twice, 3 screens import | `api/routes/api.php:190` `Route::post('create-checkout-session', [StripeController::class, 'createCheckoutSession'])` inside `Route::prefix('stripe')`; `grep -c 'this.handleStripePayment()'` → `2`; `GameSceneScreen.vue`, `PrivateSceneScreen.vue`, `PublicSceneScreen.vue` all list it (`GameSceneScreen.vue:57` is a real `import`); `PURCHASE_SHOP_ITEM` socket emit at `:294` | PASS |
| **V14.4** forward reconciliation | no `UNRECONCILED` output | silent for all four `CLAUDE.md` tokens **and** for the `AGENTS.md` bullet | PASS |
| **V14.5** reverse reconciliation | exactly one endpoint | exactly `/api/stripe/create-checkout-session`. A widened form (`/api/[A-Za-z0-9_/-]+`) also returns exactly that one line | PASS |

---

## Focus area 1 — CRITICAL-1 closure, adjudicated at source

I re-derived the claim from the codebase before reading what the document says, then
compared. The corrected text is **accurate in both directions**.

### Does it overstate (imply a general REST data path)? No.

- Lead sentence (`CLAUDE.md:136`): *"Gameplay is Socket.IO only, plus one narrow Stripe
  checkout `POST`."*
- Section header (`:140`): *"The one client-to-API HTTP path."*
- Direction table (`:161`): `Client -> API | HTTP POST (Stripe checkout-session) | one-off
  payment initiation, not gameplay data`.
- The server's `/api` mount is still framed (`:174-181`) as *"an inbound channel the
  Laravel API calls … not a client entry point"*, with no endpoint enumeration — so no
  second client-facing REST path is implied.
- V14.5 confirms the document names exactly one endpoint.

### Does it understate (deny or minimise a real path)? No.

Every specific assertion in the paragraph was checked against source:

| `CLAUDE.md` assertion | Source evidence | Verdict |
|-----------------------|-----------------|---------|
| `POST` to `${VITE_API_BASE_URL}/api/stripe/create-checkout-session` | `ShopComponent.vue:313` | accurate |
| base URL from `import.meta.env.VITE_API_BASE_URL`, falling back to `http://127.0.0.1:8000` | `ShopComponent.vue:306` verbatim | accurate |
| bearer token read from `localStorage` under the key `app_jwt` | `ShopComponent.vue:307` `localStorage.getItem("app_jwt")`, sent as `'Authorization': \`Bearer ${jwtToken}\`` | accurate |
| receiving route declared in `api/routes/api.php` as `StripeController::createCheckoutSession` | `api/routes/api.php:190`, inside `Route::prefix('stripe')`; Laravel's `api.php` supplies the `/api` prefix, so the full path resolves to `/api/stripe/create-checkout-session` | accurate |
| "This is live code" — three screens import it | `GameSceneScreen.vue:57` `import ShopComponent from "…/ShopComponent.vue"`; same in `PublicSceneScreen.vue`, `PrivateSceneScreen.vue` | accurate |
| `handleStripePayment()` "invoked from two call sites" | `:277` (from `purchaseItem()` when `price_type === 'stripe_payment'`) and `:415` (the `stripe_payment_retry` handler) | accurate |
| "the same component emits gold and silver purchases over Socket.IO (`RequestSocketsEnum.PURCHASE_SHOP_ITEM`), and only the real-money purchase leaves over HTTP" | `:294` `socket.emit(RequestSocketsEnum.PURCHASE_SHOP_ITEM, …)` under the comment `// Manejar pagos normales (oro/plata)` | accurate — the payment-rail framing is exactly right |
| media URLs are "URL strings the browser resolves while rendering an image, not `fetch` or `axios` calls issued by application code" | `MailPanelComponent.vue:180` is a `data()` property; `ObjectsNpcModalComponent.vue:200,211` are `return` values from URL-builder methods. Neither issues a request | accurate |
| Google Sign-In / reCAPTCHA / `VITE_WEB_TERMS_URL` "go to third parties, not to this project's API" | `client/src/composables/useGoogleSignIn.js` exists; no project-API target | accurate |

### Independent hardening beyond V14.1 (my own check, not in the suite)

V14.1 only greps `fetch(` and `axios`. To make sure the "exactly one" claim does not
understate through a transport the suite does not look for, I ran:

```bash
grep -rInE 'XMLHttpRequest|sendBeacon|EventSource|\$\.ajax|new Request\(|navigator\.sendBeacon' client/src
```

→ **no output.** There is no second client→API mechanism hiding behind a different API.
The `CLAUDE.md` claim is exact as of this tree. (Recorded as SUGGESTION-1 below, since a
future XHR-based call would slip past V14.1.)

### `AGENTS.md` bullet

`- **Client ↔ API**: One path only — a JWT-authenticated \`POST\` to
/api/stripe/create-checkout-session from \`ShopComponent.vue\`; all other client traffic
is gameplay and goes over Socket.IO`

Contains no `None`, no "never calls", and scopes the Socket.IO clause to "all **other**
client traffic" — so it clears the spec's absolute-denial ban and the `all client traffic
(goes|is)` V5a pattern legitimately, not by evasion. It agrees with `CLAUDE.md`'s section.
**Net accuracy is now strictly better than the pre-change line**, which was the whole
point of the proposal.

---

## Focus area 2 — adjudicating the self-reported out-of-task deviation

**The edit**: apply reworded the `## Inside client/` transport paragraph
(`CLAUDE.md:40-45`), which `tasks.md` 1.4 told it not to touch.

**Verdict: correct, minimal, consistent, and correctly self-reported. Not scope creep.**

| Test | Finding |
|------|---------|
| Was it required? | **Yes.** The amended spec's "Client And Server Internals Named Correctly" requirement states: *"`socket.js` MUST NOT be described as the client's only outbound surface … the two descriptions MUST agree."* Pass-1 text read *"is the client's **only** transport module: **every piece of game data** leaves and enters the client through that Socket.IO connection"* — a direct contradiction of the corrected communication section, which the "Inter-Service Communication" requirement independently forbids (*"MUST NOT contradict any of them elsewhere in the document"*). Leaving it would have failed two requirements |
| Which instruction wins? | The spec. `tasks.md` 1.4 was written to say "do not re-edit what is already correct"; the amended spec reclassified this paragraph as *not* correct. Apply resolved the conflict the right way and flagged it rather than silently absorbing it |
| Is it minimal? | Yes. `+1` net line, one paragraph, same file, same section, no heading moved, no adjacent content touched. No fifth path. The `client/src/sockets/` table row (`:50`, "transport layer, one module") is untouched and remains true — `ls client/src/sockets` → exactly `socket.js` |
| Is it consistent with the corrected communication section? | Yes, and it cross-references it explicitly: *"It is not the client's only outbound surface — see How services talk for the one Stripe checkout `POST` that reaches the Laravel API over HTTP."* Same magnitude ("one"), same rail, same direction. Scoping moved from "every piece of game data" to "all gameplay data", which matches `:136`'s "Gameplay is Socket.IO only" exactly |
| Did it damage the other requirement the paragraph carries? | No. The `client/src/phaser/services/` distinction survives in the same paragraph, and `find client/src/phaser/services -type f` → exactly one file (`PrivateScene/PrivateSceneUpdateColorsService.js`), so "single-file Phaser scene helper directory" remains accurate |
| Was it disclosed? | Yes — `apply-progress.md` "Deviations from the corrective plan" item 1, with the spec citation and the before/after text. Honest reporting |

---

## Focus area 3 — D14 length and the trim

| Measurement | Command | Result |
|-------------|---------|--------|
| Plain line count | `wc -l < CLAUDE.md` | **`244`** |
| Independent confirmation | `awk 'END{print NR}' CLAUDE.md` | `244` |
| Trailing newline | `[ -n "$(tail -c1 CLAUDE.md)" ]` | no `FAIL` line — newline present, so `wc -l` counts the last line |
| Staged/HEAD-relative insertions | `git diff --numstat` | `244` insertions for `CLAUDE.md` — matches, confirming no uncounted last line |

`244 <= 245` (D14 working ceiling) and `244 <= 250` (spec bound), `244 >= 150` (floor).
Apply's account is accurate: the corrections landed at `246`, one over the working
ceiling, and D14 trim-ledger **item 1 only** was applied, stopping at `244` as D14
mandates ("stop as soon as it is at or under 245"). Items 2–6 correctly left unapplied.

**Did the trim drop required content? No.** The trimmed paragraph is `CLAUDE.md:101-109`,
and every element D14 required it to keep is still there:

| D14 "keep" item | Present? |
|-----------------|----------|
| the `bots/` + `RUN_BOTS=true` sentence | yes, `:101-103` — verified against `server/index.js:7` (`require('./src/packages/bots/BotsPackage')`) and `:65-66` (`RUN_BOTS === 'true'`) |
| the eight standalone package names | yes — `avatar-atlas`, `crop-svg`, `invert-colors`, `map-generator`, `objects-maker`, `rename-sprites-swf`, `textures_maker`, `webp-converter`. `ls server/src/packages` returns exactly these eight plus `bots` |
| the `cd server/src/packages/<name> && npm install && npm start` form | yes, `:108` — satisfies the spec's "Standalone tooling shown with its own run steps" scenario |
| the `textures_maker`-has-no-start-script detail, folded into the same sentence | yes, `:109` — verified: `textures_maker/package.json` has only `"test"`, `"main": "index.js"`, and `index.js` exists, so "it runs as `node index.js`" is accurate |
| "Two of them carry their own manifest" | accurate — `find server/src/packages -maxdepth 2 -name package.json` → exactly `objects-maker` and `textures_maker` |

D14's three hard trim rules also hold: no heading dropped (V3 → 8 `##` in exact order),
no surface-inventory row dropped (11 rows), the Stripe description untouched.

---

## Focus area 4 — D13 domain-drift wording

`CLAUDE.md:218-227` (gap 2). **Correct and no longer misattributed.**

| D13 rule | `CLAUDE.md` text | Source verification |
|----------|------------------|---------------------|
| Lead with the sharpest instance as an observation | *"`docker/nginx/api-cors.conf` hard-codes an `Access-Control-Allow-Origin` of `https://play.boommania.com` while the root `.env.example` sets `CLIENT_VIRTUAL_HOST=play.boombang.com`, so the CORS origin the API advertises is not the configured client host."* | `docker/nginx/api-cors.conf:2` → `add_header Access-Control-Allow-Origin "https://play.boommania.com" always;`; `.env.example:59` → `CLIENT_VIRTUAL_HOST=play.boombang.com`. **Exactly the pair the spec names.** Stated as observation, no remediation |
| `boombang.com` attributed only to files holding the literal | root `.env.example` ("its five `*_VIRTUAL_HOST` values"), `README.md`, `AGENTS.md` | `.env.example` lines 5, 23, 42, 59, 67 — exactly five; `grep -c 'boombang\.com'` → `README.md:10`, `AGENTS.md:8`. Accurate |
| `docker-compose.yml` MUST NOT be listed as a `boombang.com` source | *"`docker-compose.yml` holds no such literal and receives those hostnames only by `${*_VIRTUAL_HOST}` interpolation"* | `grep -n 'boombang\.com' docker-compose.yml` → **no output, exit 1**. Its 7 `boombang` hits (17, 34, 72, 113, 152, 175, 188) are all the Docker network name. Interpolation confirmed at compose lines 26, 50, 74, 90, 115, 130, 154, 167, 177. **The prior misattribution is gone and the replacement is exactly right** |
| `boommania.com` attributed to its real holders | `launcher/.env.example`, `launcher/main.js`, the electron-builder `productName`/`appId` in `launcher/package.json`, the two `docker/nginx/` vhost files named for it, `docker/nginx/api-cors.conf` | `launcher/.env.example:1` `VUE_URL=https://play.boommania.com/`; `launcher/main.js:22`; `launcher/package.json:21-22` `appId: com.boommania.launcher`, `productName: BoomMania`; `ls docker/nginx` → `boommania.com`, `www.boommania.com`, `api-cors.conf`. Accurate |
| No remediation | — | `git diff -- .env.example docker-compose.yml docker/ launcher/` empty in both plain and `--cached` form. No domain string rewritten |

The spec's scenario *"Domain drift is attributed to the files that actually contain the
literal"* passes exactly as written.

---

## Focus area 5 — human-judgment re-check (items that passed before and could have regressed)

### Surface inventory — all 11 rows re-verified cell by cell against the real manifests

| Row | Stack | Entry point | Commands |
|-----|-------|-------------|----------|
| `client/` | `vue ^3.5.13`, `phaser ^3.87.0`, `pinia ^3.0.2`, `socket.io-client ^4.8.1`, `vite ^6.0.1`, `"type":"module"` ✓ | `client/index.html:24` `<script type="module" src="/src/main.js">` ✓ | `dev`, `build`, `preview`, `jsonmin`, `jsonunmin` all present; **no `test` key** ✓ |
| `server/` | `express ^4.21.1`, `socket.io ^4.8.1`, `mariadb ^3.4.0`, `axios ^1.10.0`, no `"type"` ⇒ CommonJS ✓ | `server/index.js` ✓ | `start` = `node index.js`, `dev` = `nodemon index.js` (doc says "(nodemon)") ✓; **no `test` key** ✓ |
| `api/` | `php ^8.2`, `laravel/framework ^12.0`, `laravel/passport ^12.0`, `backpack/filemanager ^3.0` + `permissionmanager *` + `theme-coreuiv4 ^1.1`, `stripe/stripe-php ^19.0`, `darkaonline/l5-swagger ^9.0` ✓ | `api/public/index.php` ✓ | `composer install`; `composer run dev` — `scripts.dev:71` = `npx concurrently … "php artisan serve" "php artisan queue:listen --tries=1" "npm run dev"`, matching "(serve + queue listener + Vite)" ✓; `cd api && ./vendor/bin/phpunit` / `pint` — `phpunit/phpunit ^11.5.3`, `laravel/pint ^1.13` in `require-dev` ✓ |
| `launcher/` | `electron ^26.0.0`, `electron-builder ^26.0.12` ✓ | `launcher/main.js` = `"main": "main.js"` ✓ | `start` = `electron .`, `build` = `electron-builder --win`; "(Windows NSIS installer)" matches `build.win.target: "nsis"` ✓ |
| `docker/` | shell scripts, MariaDB init SQL, nginx-proxy vhost confs ✓ | `n/a` ✓ | `docker compose up -d` at root + the three named scripts, all present ✓ |
| `doc/` | Markdown notes and their images ✓ (13 `.md` + `doc/screenshots/`) | `n/a` ✓ | `n/a` ✓ |
| `agent_tasks/` | empty, only `.gitignore` ✓ | `n/a` ✓ | `n/a` ✓ |
| `backups/` | empty, only `.gitignore`; destination of `docker/backup-docker-uploads.sh` ✓ | `n/a` ✓ | `n/a` ✓ |
| `boombang_api.sql` | root SQL dump, "not referenced by `docker-compose.yml` or any script" — repo-wide grep outside `openspec/` finds **zero** references ✓ | `n/a` ✓ | `n/a` ✓ |
| `.github/` | only `.github/instructions/copilot.instructions.md`; `find .github -type f` returns exactly that one file ✓ | `n/a` ✓ | `n/a` ✓ |
| `web/` | referenced but absent; `test -d web` → absent; `docker-compose.yml:77-78` `build: ./web` + `env_file` ✓ | `n/a` ✓ | `n/a`, see Known gaps ✓ |

Supporting prose (`:30-33`) re-verified: compose services are exactly `db`, `phpmyadmin`,
`api`, `web`, `server`, `client` ✓; `db.image: mariadb:11` ✓; `.env.example` hostnames
`api.boombang.com` (:5), `play.boombang.com` (:59), `server.boombang.com` (:42) with
`SERVER_VIRTUAL_PORT=3000` (:43), `pma.boombang.com` (:67) ✓. **No invented command, no
fake entry point** — all seven non-runnable surfaces read `n/a`.

### Internals claims — re-verified against the tree

| Claim | Verified |
|-------|----------|
| `client/src/sockets/socket.js` is the transport module | `ls client/src/sockets` → exactly `socket.js` ✓ |
| `client/src/phaser/services/` is a single-file Phaser helper | exactly `PrivateScene/PrivateSceneUpdateColorsService.js` ✓ |
| `client/src/screens/` holds one legacy screen | exactly `auth/LoginScreen.vue` ✓ |
| stores "(socket, lobby, mail, language)" | `socketStore.js`, `LobbyStore.js`, `MailStore.js`, `languageStore.js` ✓ |
| config = "game and cache-manager configuration" | `gameConfig.js`, `cacheManagerConfig.js` ✓ |
| composables "(Google Sign-In, scrollbars, text fitting)" | `useGoogleSignIn.js`, `useOverlayScrollbars.js`, `useTextFitting.js` — exactly three ✓ |
| utils "animation, movement, client-version, socket-debug helpers" | `AnimationUtils.js`, `MovementUtil.js`, `ClientVersionManager.js`, `SocketDebugUtil.js` ✓ |
| `main.js` mounts `App.vue` with Pinia and vue-i18n | `main.js:3,4,5,25,35,45` ✓ |
| `server/src/boot/`, `server/src/collections/` present and absent from `AGENTS.md` | both directories exist; `grep -n 'collections\|src/boot' AGENTS.md` → no matches ✓ |
| `sockets/` by domain grouping incl. `config/` and `admin/` | `server/src/sockets/game/` holds `admin`, `config`, `scenes` plus the domain socket files ✓ |
| `managers/` correctly omitted (D11) | no `server/src/managers/`; V5b confirms the string is absent from the doc ✓ |
| `services-api/` "one `*ApiService.js` per domain over a shared axios wrapper" | 18 files, incl. the shared `ApiService.js` ✓ |
| raw `mariadb` driver, no ORM on the server side | `server/src/config/database.js:1` `require('mariadb')`, `:4` `createPool` ✓ |
| `EMULATOR_API_TOKEN` / `VerifyEmulatorToken` | middleware file present; `.env.example:12,50` ✓ |
| `POST /internal/add-bot-token` | `server/src/config/server.js:22`; caller `api/.../Internal/BotController.php` ✓ |
| `/api` mount is inbound API→server, high-level, not enumerated | `server/index.js:60`; `apiRoutes.js` has 2 routes, both driven by `SocketNotificationService.php`; `CLAUDE.md:174-181` frames it as "an inbound channel the Laravel API calls … not a client entry point" and names no endpoint path ✓ |
| shared `boombang_api` DB | `.env.example:16` = `:54`; `docker/db/init/create_databases.sql` ✓ |
| `api/` areas (routes / controllers / services / enums / migrations / Backpack / swagger) | `api/app/Http/Controllers/{Admin,Api,Internal}` ✓; `api/app/Services/` holds socket notification, bot conversation, mail, language detection, NPC catalog, traps, plus `AI/` and `External/` ✓ |
| `client/src/assets/` described by category, not enumerated | `:62-66` category prose only ✓ |

### The four gaps — factual, not remediated

Read `CLAUDE.md:207-234` in full. Opens *"Observed facts about the repository as it
stands. This document records them; it does not fix them."* A grep of the section for
`should|must|TODO|need to|fix|recommend|we will|planned` returns **only** that framing
line's own "fix them". No prescriptive or remediation language.

| Gap | Factual check | Not-fixed check |
|-----|---------------|-----------------|
| 1. `web/` referenced but absent | names both `docker-compose.yml` (`build: ./web`, `web/.env`) and `launcher/package.json` (`build.win.icon: ../web/public/…`) as the spec requires; consequence stated as observation | `test -d web` → absent ✓ |
| 2. Domain drift | see Focus area 4 — now fully correct | config diff empty ✓ |
| 3. No CI | `.github/` holds only `instructions/copilot.instructions.md` | `test -d .github/workflows` → absent ✓ |
| 4. Thin/absent test coverage | accurate and hedged ("the depth of that coverage has not been audited"); no `test` script in either manifest; `api/tests/` exists (`Feature`, `Unit`, `TestCase.php`) | no test suite added ✓ |

### `doc/` linked not duplicated; paths and commands

- `CLAUDE.md:190-205` is a 5-row topic→file link table plus a 3-line overlap note. No
  `doc/` content restated inline.
- Overlap counts verified: exactly **5** `BOT_SYSTEM_*` and exactly **3** `CACHE_*` files in
  `doc/`, matching the text; no document declared authoritative.
- **Every backticked path resolves** (V7 clean) and **every Markdown link target resolves**
  (all 15, my added check).
- **Every quoted command exists** in its manifest (V6 clean plus the manual four-manifest
  read above); both "no invented `test` script" tripwires silent.
- No duplication of sibling docs: `grep -niE 'detected language|responde|screenshot|feature
  status|coautor|co-author|Generated with' CLAUDE.md` → no matches. `CLAUDE.md:131-132`
  explicitly defers Backpack CRUD scaffolding to `AGENTS.md`.

---

## Focus area 6 — blast radius and `git add -f`

| Check | Result |
|-------|--------|
| Paths changed outside `openspec/` | exactly four: `.gitignore`, `AGENTS.md`, `README.md`, `CLAUDE.md`. **No fifth path** |
| Scoped status over `client server api launcher docker doc` | empty |
| `test -d web` / `test -d .github/workflows` | both absent |
| Config/env/infra drift (`git diff -- .env.example docker-compose.yml docker/ launcher/`, plain **and** `--cached`) | empty |
| `.gitignore` diff | `0	1	.gitignore`; the single changed line is exactly `-CLAUDE.md`; the full 12-line file retains `.env`, `.env.production`, `.env.local`, `.env.*.local`, `NUL`, `.claude` (line 6), `logs/`, `**/auth.json`, `**/.env.production`, `**/.env.local`. No rule added, relaxed, or tightened |
| `git check-ignore CLAUDE.md` | printed nothing, **exit 1** |
| `git add -f` used? | **No.** `CLAUDE.md` currently shows as `?? CLAUDE.md` — untracked yet fully visible to `git status --untracked-files=all`. A force-add cannot produce that state, and no `CLAUDE.md` rule survives in `.gitignore`. This is the strongest available form of the spec's "CLAUDE.md is visible to git" scenario |
| `objects-maker` pipeline artifacts | none — `output/` holds only its tracked `.gitignore`, clone-time mtime |

---

## Live validation

**Live validation: not-applicable — the change alters no externally observable runtime
surface.**

Assessed, not assumed:

- The four changed paths are three Markdown documents and one `.gitignore` line deletion.
  None is read at runtime by any service, build, or container.
- `git status --porcelain -uall -- client server api launcher docker doc` is **empty** — no
  page, endpoint, rendered UI, or CLI surface is added, removed, or altered.
- `git diff -- .env.example docker-compose.yml docker/ launcher/` is empty in both plain
  and `--cached` form — no config, env, schema, or infra drift that could change behaviour.
- `openspec/config.yaml:42-43` declares no e2e command (`e2e: []`), and no validation skill
  was injected — but neither is needed, because there is no changed surface to probe.

Starting a dev server or curling routes would exercise code this change provably does not
touch, producing evidence with no bearing on the proposal's success criteria. No probe was
attempted; nothing is recorded as `unavailable`.

**The asymmetry that caused the prior FAIL is explicitly handled this time.** The change has
no runtime *behaviour* to validate, but it makes falsifiable *claims about* runtime
behaviour. Those claims required source-level validation, which is exactly what V14 and my
independent re-derivation in Focus area 1 provide. That is the correct substitute for a
live probe here, and it was performed rather than skipped.

---

## Spec coverage

| Requirement | Verified how | Result |
|-------------|--------------|--------|
| Root CLAUDE.md With Required Sections | V1, V3 (H1 + 8 headings, exact text and order), V5c, full read; all five mandated sections present | PASS |
| Surface Inventory Table Covers Every Top-Level Surface | manual cell-by-cell against real manifests (table above); 11 rows; `n/a` on all non-runnable surfaces | PASS |
| Quoted Commands Match Real Manifests | V6 + manual read of all four manifests; no invented `test`; standalone tooling shown with its own `cd …` form | PASS |
| **Inter-Service Communication Stated Per Source** | **V14.1–V14.5** + independent source re-derivation + broader HTTP-mechanism grep; all eleven D12 claims confirmed; neither forbidden wording present (V5a) | **PASS — prior FAIL closed** |
| Factual Claims Are Verified Against Source, Not Against The Document | V14 exists in `design.md:888-957`, was run, reads `client/src` not `CLAUDE.md`, reconciles bidirectionally, and states its expectation as a concrete three-line hit set. Four mutation probes confirm it is falsifiable. No coverage entry in this report or in `apply-progress.md` cites V5 as evidence for the client→API claim | **PASS — new requirement** |
| Client And Server Internals Named Correctly | V4a + V7 + directory listings; the transport paragraph now explicitly states `socket.js` is not the only outbound surface and agrees with "How services talk" | PASS |
| Known Gaps Section Documents Four Items Factually | manual read + `test -d` tripwires + D13 attribution check; `docker-compose.yml` no longer named as a `boombang.com` source | PASS |
| Deep Dives Are Linked, Not Duplicated | manual read + `ls doc/`; 5/3 overlap counts exact; no content restated | PASS |
| CLAUDE.md Length Target | V2 → `244` (two independent counters) | PASS |
| AGENTS.md Stale Claim Corrected And Cross-Referenced | V8 (7 sub-checks incl. the corrected changed-line form) + raw two-hunk diff + V14.4 | PASS |
| README.md Cross-Reference Added Without Other Changes | V9 (`2	0`, zero deletions) + raw diff; Spanish line, host-language preserved | PASS |
| CLAUDE.md Is Committable, Not Gitignored | V11; `check-ignore` exit 1; `?? CLAUDE.md`; `.gitignore` `0/1` with `.claude` intact | PASS |
| Documentation-Only Blast Radius | V10; exactly four paths, no fifth | PASS |

### Acceptance boxes: 13 / 13 hold

Boxes 4, 6, 8 and 13 were the re-opened ones; all four are independently confirmed closed
above. The other nine were re-checked and none regressed.

---

## Task completion

| Item | Status |
|------|--------|
| Corrective `tasks.md` boxes | **32 / 32** ticked, each independently confirmed |
| Section 0 (V14 RED capture before editing) | done — RED output recorded verbatim in `apply-progress.md:254`; I reproduced the same mechanism against a mutant |
| Sections 2, 3, 5 (the three mandated edits) | all landed and verified |
| Section 4 (line budget) | done — `246` → trim item 1 → `244` |
| Sections 6–9 (full re-run, re-stage, V13, terminal state) | done; terminal state is "staged, not committed" per 7.3 |
| Requested scope parked as future work | **none.** The four follow-ups listed are genuinely out of scope: (1) `openspec/config.yaml`'s test-command misdetection (design open question, not a spec requirement); (2) already resolved; (3) `AGENTS.md`'s other stale content, which the spec **explicitly forbids touching** ("No other line of `AGENTS.md` may be changed"); (4) `VITE_API_*` missing from `client/.env.example`, a pre-existing repository condition whose fix would create a fifth path. None is a reviewable slice of assigned work deferred to avoid effort |
| Reviewable slices remaining | **none.** Apply should not continue; this change is complete and ready for the maintainer's commit |

---

## TDD compliance

Strict TDD is active (`openspec/config.yaml:1` `strict_tdd: true`). The repo has no
Markdown test runner and the configured command is an asset pipeline, so `design.md`
D8/D9 substitutes the V1–V14 shell suite. I honoured and re-executed that substitution in
full.

| Check | Result | Details |
|-------|--------|---------|
| TDD Evidence reported | ✅ | `TDD Cycle Evidence — corrective pass` table at `apply-progress.md:252-261`, 7 rows covering all 32 corrective tasks (plus pass 1's table at `:62-71`) |
| All tasks have "tests" | ✅ | 32/32 map to a named V-check. V-checks are inline shell commands (correctly kept out of the repo per D8), so there are no test *files* to locate |
| RED confirmed | ✅ | Every row carries captured evidence, not a bare "Written". Highest-value example, row 0.1–0.3: V14.4 printed **exactly five** `UNRECONCILED` lines against the pass-1 files and V14.5 returned **empty** where one endpoint was required. Row 4.1 records `wc -l` → `246` over the ceiling. Row 5.1 records the verbatim false bullet. Row 3.1 records `grep -n 'boombang\.com' docker-compose.yml` → exit 1. Row 8.1–8.6 uses the permitted `not-run` form with a stated reason (V13 is a manual read-through) |
| RED evidence is plausible | ✅ | I reproduced the same failure mode against mutant copies (probes 1–3 below), so the recorded RED is mechanically reachable, not narrated |
| GREEN confirmed | ✅ | **14 / 14** checks re-run by me and still green; V13 re-walked manually over all thirteen boxes |
| Triangulation adequate | ✅ | Task 2 triangulated across 5 orthogonal cases (V14.4 forward, V14.5 reverse, V14.1 hit-set stability, V4a floor, V5a two-directional ban); task 3 across 3; task 5 across 4; task 4 across 2 (ceiling and floor). V14.5 is a genuinely distinct case — it fails a naive "just delete the false sentence" fix, which apply correctly identified |
| Safety net for modified files | ✅ | Every corrective row records a pre-edit read; the already-correct paragraphs were preserved and proved so by the two-hunk `AGENTS.md` diff and the unchanged `README.md`/`.gitignore` numstats. `N/A (new)` is not claimed for any modified file |
| Honest failure reporting | ✅ | Apply self-reported the `246`-line overshoot, the trim it applied, the out-of-task transport-paragraph edit (adjudicated above), and that plain `git diff` is empty for all four paths. All four confirmed accurate |

**TDD Compliance: 8 / 8 process checks passed.** Unlike the prior pass, the *suite* is now
adequate as well as the process — see Assertion quality.

### Test layer distribution

| Layer | Checks | Files | Tool |
|-------|--------|-------|------|
| Unit | 0 | 0 | none installed |
| Integration | 0 | 0 | none installed |
| E2E | 0 | 0 | none configured (`config.yaml:42-43` `e2e: []`) |
| **Source-level reconciliation** | **5** (V14.1–V14.5) | 0 (inline, per D8) | `grep`, `cut`, `sort` |
| Structural / shell verification | 13 (V1–V13 families) | 0 | `grep`, `wc`, `awk`, `test`, `git` |
| Manual review | 1 (V13) | 0 | human |

Appropriate for a documentation change. The V14 row is the layer that was missing last
time and is the reason this pass can be trusted.

### Changed file coverage

No coverage tool is configured (`openspec/config.yaml:45` `coverage.command: ""`).
Reported as unavailable, not as a failure — and not meaningful for Markdown.

### Quality metrics

**Linter**: ➖ not configured (`quality.lint: ""`).
**Type checker**: ➖ not configured (`quality.typecheck: ""`).
**Formatter**: ➖ not configured.
Reported cleanly; informational only, never blocking.

### Assertion quality

| Subject | Assertion | Finding | Severity |
|---------|-----------|---------|----------|
| **V14 (whole)** | source-first, bidirectional reconciliation | **The prior CRITICAL is resolved.** V14.1 reads `client/src`, states its expectation as a concrete three-line set (not "no output"), and fails when the set changes. V14.4/V14.5 close both directions. Proven falsifiable by mutation, not assumed | RESOLVED |
| V5a/V5b/V5c | prohibited-string and language greps over the documents | Legitimate now: explicitly demoted to a wording floor in `design.md:658-666`, and **not cited anywhere** in `apply-progress.md` or this report as evidence for the client→API claim. As a floor it is sound — V5c and the duplication greps test genuine properties of the document | OK |
| V4a | 18-string presence loop | Sound floor. No longer offered alone as factual evidence — V4b pairs the seven non-path factual tokens with source-side greps, and V7 covers the path tokens | OK |
| V4b | 10 source-side counterpart greps | Genuinely source-reading. Each fails loudly if the repository stops supporting a claim the document makes | OK |
| V8 corrected changed-line sub-check | `grep -E '^[+-]' \| grep -vcE '^(\+\+\+\|---) '` → 4 | Now satisfiable and marker-agnostic; cross-checks against the `3+1` numstat | OK |
| **V14.1 grep pattern** | `fetch\(\|axios` only | **Blind spot**: would not see `XMLHttpRequest`, `navigator.sendBeacon`, `EventSource`, `$.ajax`, or a form `action` pointing at the API. Today the claim is still exact — I ran the broader grep myself and it is clean — but a future call using one of those would slip past V14.1 while `CLAUDE.md` kept saying "one path only" | SUGGESTION |
| V6 | manifest script existence | Known floor (unchanged): checks that quoted commands exist, not that every command in the doc was extracted. Acceptable | SUGGESTION |

No tautologies, ghost loops, type-only assertions, smoke-only checks, or
implementation-detail couplings found in the amended suite. **Zero CRITICAL assertion-quality
findings** (the prior pass had two).

### Mutation spot-check

Sampled the two highest-risk tasks: **task 2** (the `CLAUDE.md` communication rewrite,
guarded by V14) and **task 5** (the `AGENTS.md` bullet, guarded by V14.4 + V5a).

Because the "tests" are inline shell commands rather than repository files, there is no
test file to Edit-invert. I mutated **scratchpad copies** instead — strictly safer than
Edit-and-restore and equally probative, since the checks are pure functions of their
inputs. **No repository file was edited at any point.**

| Probe | Mutation (scratchpad only) | Expected | Actual | Verdict |
|-------|----------------------------|----------|--------|---------|
| 1 — V14.4 forward | `stripe/create-checkout-session` → `stripe/open-payment-window` in `mutA.md` | emits `UNRECONCILED: … (stripe/create-checkout-session)` | emitted exactly that | ✅ not vacuous |
| 2 — V14.5 reverse | added a second endpoint `/api/user/profile` in `mutB.md` | returns 2 endpoints, breaking the "exactly one" expectation | returned `/api/stripe/create-checkout-session` **and** `/api/user/profile` | ✅ not vacuous |
| 3 — V5a wording ban | reinstated the pass-1 absolute denial in `mutC.md` | both `no direct client-to-API` and `nothing in client/src calls` patterns fire | both fired, at line 140 | ✅ not vacuous |
| 4 — **V14.1 source sensitivity** | built a synthetic `srcprobe/client/src/…` tree containing a 4th call site (`NewThing.js` with `fetch(\`${apiBase}/api/user/profile\`)`) and ran V14.1's grep against it | the hit set grows and points at the new call site | returned `client/src/views/components/NewThing.js:1` alongside the ShopComponent hit | ✅ **V14.1 tracks the codebase, not the prose — this is the property whose absence caused the prior FAIL** |
| Control | all four checks against the real, unmodified files | silent / exactly one endpoint / three-line hit set | exactly that | ✅ |

**Restoration confirmed.** No repository file was edited during verification, so nothing
needed restoring. Post-probe state: `shasum CLAUDE.md` →
`bc07f8c54f95c046c409bed1fd494ae4f71ee027`, `wc -l` → `244`, working-tree diffs unchanged
(`0	1	.gitignore`, `3	1	AGENTS.md`, `2	0	README.md`), and `git status` outside
`openspec/` still lists exactly the four paths. All mutants and the synthetic tree live in
the session scratchpad (`mutA.md`, `mutB.md`, `mutC.md`, `srcprobe/`), outside the
repository. No `git restore` / `git checkout --` / `git stash` was used anywhere.

---

## Review workload / PR boundary

| Item | Forecast (`tasks.md`) | Actual | Verdict |
|------|-----------------------|--------|---------|
| Estimated changed lines | ~238–252 | **251** (249 insertions + 2 deletions) — 63% of the 400-line budget | within forecast and budget |
| 400-line budget risk | Low | realised Low | honoured |
| Chained PRs recommended | No | not chained | honoured |
| Delivery strategy | single-pr | single PR, four paths, one commit's worth of work | honoured |
| Chain strategy | "single work-unit slice (force-chained strategy, workload under budget)" | matches — the returned work boundary is exactly one slice, force-resolved rather than left `pending` | consistent |
| `size:exception` | not used | not used, not needed | n/a |

**No scope creep.** The one out-of-task edit (the `Inside client/` transport paragraph) is
adjudicated in Focus area 2 as spec-mandated, minimal, same-file, and correctly disclosed —
not creep. No fifth path exists.

**No requested scope parked.** See Task completion above. The absence of a commit is the
specified terminal state (`tasks.md` 7.3: "Stop here. Do not run `git commit`"), not
unfinished work.

**Apply should not continue.** There is no remaining autonomously-implementable slice. The
four recorded follow-ups are either forbidden by this spec, out of its domain, or already
resolved.

---

## Blockers

**None.** No CRITICAL findings. Both prior blockers are closed and independently
re-verified at source.

---

## Warnings (non-blocking)

| # | Finding | Detail and recommended action |
|---|---------|-------------------------------|
| **WARN-A** | **The git index no longer holds the staged state; the working tree is intact.** | At `10:00:0x` I observed the expected staged state (`M  .gitignore`, `M  AGENTS.md`, `A  CLAUDE.md`, `M  README.md`; `git diff --cached --numstat` → `0 1`, `3 1`, `244 0`, `2 0` — matching the task brief exactly). Seconds later, and stably thereafter, the index reverted to `HEAD`: `git status` now reads ` M .gitignore`, ` M AGENTS.md`, ` M README.md`, `?? CLAUDE.md`, and `git diff --cached` is empty. `.git/index` mtime is `Aug 2 10:00:12`. **I issued no mutating git command** — every git call I made was `status`, `diff`, `log`, `check-ignore`, `ls-files`, or `reflog`. The cause appears environmental (this repo is a fresh clone; `git reflog` shows only the clone). **No content was lost**: all four files carry the corrective content and every contract re-verifies identically against `HEAD` via plain diffs. **Action for the maintainer**: re-run `git add CLAUDE.md AGENTS.md README.md .gitignore` (**no `-f`**) before committing. I deliberately did not do so — the verify phase must not mutate the repository. Silver lining: the current state is the exact `?? CLAUDE.md` scenario the spec's committability requirement describes, and it proves conclusively that no `git add -f` was ever used |
| WARN-B | V14.1's grep covers only `fetch(`/`axios` | See Assertion quality. The "exactly one client→API path" claim is exact today (I verified with a broader grep), but the check would not catch a future `XMLHttpRequest`/`sendBeacon`/`EventSource`/`$.ajax` call. Suggest widening the pattern in `design.md:899` |
| WARN-C | `server/src/storage/` omitted from the `Inside server/` table | Carried from pass 1. The directory exists (`server/src/storage/logs/.gitignore` only); D11's authoritative list has 16 entries, the tree has 17. The table makes no exhaustiveness claim, so nothing is misstated, but a reader counting directories will find one more |
| WARN-D | `client/src/style.css` omitted from the client table | Same class as WARN-C; cosmetic |
| WARN-E | `VITE_API_BASE_URL` / `VITE_API_URL` are consumed by `client/src` but absent from `client/.env.example` | Pre-existing repository condition, outside this change's blast radius, and `design.md` open question 2 was never answered by the parent. Noted because `CLAUDE.md:68-69` presents `client/.env.example` as the source of client runtime configuration, and because these two variables are the mechanism behind the corrected Stripe path. Not a defect in this change |
| WARN-F | `openspec/config.yaml`'s `strict_tdd` test command still points at an asset pipeline | Unchanged; correctly out of scope. Worth its own follow-up change so the next cycle does not have to re-litigate D9 |
| WARN-G | `AGENTS.md` retains other stale content | It still lists `web/` as a live service and keeps the `Web ↔ API` bullet. The spec **forbids** touching them in this change; `CLAUDE.md` carries the correction. Legitimate follow-up |

---

## Recommendation

**Ship it.** The staged content is correct, complete, and now backed by a verification
suite that can actually falsify its central claim. Before committing, re-stage the four
paths with a plain `git add` (WARN-A), then commit all four together in one commit so a
revert restores a consistent state.
