# Design: create-project-claude-md

Write one new root `CLAUDE.md` (~200 lines, table-first) as the authoritative structural
map of this repository, correct one stale line in `AGENTS.md`, add one cross-reference
line to each of `AGENTS.md` and `README.md`, and delete the single line `CLAUDE.md` from
`.gitignore` so the new file can actually be committed. Because this is a
documentation-only change with no automated Markdown test suite, this design specifies the
exact section outline, the exact fact sources for every table cell, the exact wording of
the four edits, and a concrete set of runnable shell checks that stand in for unit tests
during apply and verify.

**No blocking decisions remain.** D0 (the `.gitignore` conflict) is resolved: the user
approved Option A, and the spec has been amended to permit the four-path change set below.

**Do not run the configured `strict_tdd` test command.** `openspec/config.yaml` points it
at `cd server/src/packages/objects-maker && npm test`, which is `node index.js` — an
asset-conversion pipeline that writes an `output/` directory into the repo. See
[D9](#d9-the-configured-test-command-must-not-run); V1–V14 are the executable substitute.

**Do not source facts from `exploration.md` prose.** Three of its claims were disproved
during this design phase. Apply must read the manifests and use the corrections table in
[D11](#d11-corrections-to-explorationmd-that-must-not-be-carried-forward).

**Correction, 2026-08-02 — the client-to-API claim in the first draft of this design was
false.** The original D12 asserted there was "no `axios`/`fetch` against a project API URL
in `client/src`". That premise was asserted, never grepped. One live path exists
(`ShopComponent.vue:313` → `/api/stripe/create-checkout-session`), the spec has been
amended, and [D12](#d12-how-services-talk-contract) now carries the true shape. The
verification suite has been corrected too: V5 was a tautology, and
[V14](#v14--source-level-reconciliation-of-the-clientapi-claim) is the source-level
reconciliation check that would have caught it. See the
[tautology audit](#v-suite-tautology-audit) before writing any new check.

## Decision summary

| ID | Decision | Choice | Status |
|----|----------|--------|--------|
| D0 | `.gitignore:6` ignores `CLAUDE.md` | Delete that one line; spec amended to allow it | **Resolved — Option A approved by user** |
| D1 | Domain key `project-documentation` | Keep unchanged | Resolved |
| D2 | How 150–250 lines is counted | Plain `wc -l CLAUDE.md` on the whole file | Resolved |
| D3 | Section outline and heading text | Nine fixed headings, no backticks in H2s | Resolved |
| D4 | Inventory table shape | 4 columns, 11 rows (incl. `web/` as absent) | Resolved |
| D5 | Corrected `AGENTS.md` line | Replace bullet in place, keep the label | Resolved |
| D6 | Cross-reference placement in `AGENTS.md` | After the Project Overview list (line 13) | Resolved |
| D7 | Language of the `README.md` insertion | Spanish, matching its host document | Resolved |
| D8 | Verification method | Named shell checks V1–V14, run from repo root | Resolved — V5 corrected, V14 added |
| D9 | `strict_tdd` configured test command | Do not run it; it is an asset pipeline | Resolved |
| D10 | `doc/` duplication counts | "five `BOT_SYSTEM_*`", "three `CACHE_*`", plus siblings | Resolved |
| D11 | Facts in `exploration.md` that are wrong | Do not carry forward (see corrections table) | Resolved |
| D12 | Client↔API shape and server `/api` surface framing | Gameplay is Socket.IO-only; **one** Stripe HTTP path exists; server `/api` is an inbound channel from the API, not a client REST path | **Corrected 2026-08-02** — first draft denied the Stripe path |
| D13 | Domain-drift attribution | Attribute each literal only to files containing it; `docker-compose.yml` is not a `boombang.com` source | **Corrected 2026-08-02** |
| D14 | Line budget after the correction | Ranked trim ledger; hard `wc -l` ceiling of 245 with 250 as the spec bound | Resolved |

## Change set: exactly four paths

Everything this change touches, with its expected diff shape and the check that proves it.
Any fifth path (outside `openspec/`) fails the spec's blast-radius requirement.

| Path | Operation | Expected diff | Contract | Verified by |
|------|-----------|---------------|----------|-------------|
| `CLAUDE.md` | created | new file, 150–245 lines ([D14](#d14-line-budget-after-the-correction)) | [outline](#claudemd-outline-mapped-11-to-spec-requirements), [D4](#d4-surface-inventory-table-contract), [D12](#d12-how-services-talk-contract) | V1–V7, V11, V12, **V14** |
| `AGENTS.md` | modified | `3` insertions, `1` deletion | [D5/D6](#d5d6-agentsmd-edit-contract) | V8, **V14** |
| `README.md` | modified | `2` insertions, `0` deletions | [D7](#d7-readmemd-edit-contract) | V9 |
| `.gitignore` | modified | `0` insertions, `1` deletion | [D0](#d0-resolved-the-gitignore-line-is-deleted) | V11 |

All three `git diff` shapes above are stated **against `HEAD`**. The current working tree
already carries a staged, factually wrong version of this change, so every diff-based check
must run with `--cached` (or be re-derived after unstaging). See
[V8](#v8--agentsmd), [V9](#v9--readmemd), and [V11](#v11--claudemd-is-committable-and-gitignore-lost-exactly-one-line).

## D0 (resolved): the `.gitignore` line is deleted

**Status: Option A, approved by the user.** The spec has been amended accordingly — the
blast-radius requirement now permits four paths, and a new requirement
("CLAUDE.md Is Committable, Not Gitignored") adds the `git check-ignore`,
`git status --porcelain`, and `git diff --numstat` scenarios that V11 mechanises.

### The problem this solves

`/Users/evgeny.lyubeznyy/Desktop/Proyectos/boombang-html5/.gitignore` line 6 is literally
`CLAUDE.md` (line 7 is `.claude`). Had apply written `CLAUDE.md` and nothing else:

- `git status` would not list it; `git add .` would not stage it.
- The file would exist only in this working copy. Anyone cloning the repo, and every
  future agent session on a fresh checkout, gets nothing — defeating the proposal's entire
  intent ("a single, reliable entry point for every future agent session").
- The blast-radius diff would show two Markdown files and no `CLAUDE.md` in the PR at all.

### The edit

One deletion, nothing else. `.gitignore` before (line numbers for reviewer orientation
only):

```diff
 .env.*.local
 NUL
-CLAUDE.md
 .claude
 logs/
```

Constraints, all enforced by V11:

- **Delete the line; do not comment it out, blank it, or reorder around it.** The diff must
  be `0` insertions / `1` deletion.
- **`.claude` (now line 6) must survive.** It is a different rule covering the agent
  settings directory, not the document; removing it would start tracking local agent state.
- **`.env*`, `NUL`, `logs/`, and the credential-file entries must all survive verbatim.**
- **Do not use `git add -f`.** A tracked file with a live ignore rule for the same path is
  a trap: the next `git rm --cached`, sparse checkout, or fresh clone workflow re-hides it,
  and the rule silently contradicts the tree.

### Rejected alternatives (recorded, not revisitable without a new spec amendment)

| Option | Effect | Why rejected |
|--------|--------|--------------|
| B `git add -f CLAUDE.md` | File gets tracked once, ignore rule stays | Leaves a misleading `.gitignore` entry; re-hides the file on any later cache/clone cycle; non-obvious to future contributors |
| C Leave it untracked | Zero scope change | Proposal intent not achieved — the document never reaches the repository |

## Information flow

This change has no runtime data flow. What it does have is an authority flow — which
document is the source of truth for which question, and where each fact in `CLAUDE.md`
comes from.

```text
source of truth                      derived artifact              reader
─────────────────────────────────    ──────────────────────        ──────────────────
client/package.json                  ┐
server/package.json                  │
api/composer.json                    ├─► exploration.md ─► CLAUDE.md ─► agent / contributor
launcher/package.json                │   (+ re-verified            │
docker-compose.yml                   │    in this design)          │
.env.example, launcher/.env.example  │                             ├─► AGENTS.md  (Codex workflow)
repo tree (client/, server/, api/…)  ┘                             └─► README.md  (setup, product)
```

Authority split after this change:

| Question | Authoritative document |
|----------|------------------------|
| What is each directory, what stack, what commands | `CLAUDE.md` |
| How do the services talk to each other | `CLAUDE.md` |
| Codex commit footer, response language, Laravel CRUD scaffolding, Backpack conventions | `AGENTS.md` |
| Local setup walkthrough, product/feature status, screenshots | `README.md` |
| Avatar / bot / cache / client-version internals | `doc/*.md` |

`CLAUDE.md` links to the other three; it never restates them.

## CLAUDE.md outline, mapped 1:1 to spec requirements

Exact H1/H2 text (headings are deliberately plain ASCII with no backticks so the
verification greps in V3 are exact-match and stable):

| # | Heading | Budget (lines) | Satisfies spec requirement |
|---|---------|----------------|----------------------------|
| 1 | `# CLAUDE.md` + intro paragraph | 8 | Root CLAUDE.md With Required Sections (English, purpose, non-duplication statement) |
| 2 | `## Surface inventory` | 20 | Surface Inventory Table Covers Every Top-Level Surface; Quoted Commands Match Real Manifests |
| 3 | `## Inside client/` | 32 | Client And Server Internals Named Correctly (transport layer, Phaser services, assets by category) |
| 4 | `## Inside server/` | 34 | Client And Server Internals Named Correctly (`collections/`, `boot/`, packages by wiring status) |
| 5 | `## Inside api/` | 22 | Root CLAUDE.md With Required Sections (item 2: per-surface internals) |
| 6 | `## How services talk` | **46** (was 30) | Inter-Service Communication Stated Per Source — grew to carry the Stripe path, its liveness evidence, and the media-URL distinction |
| 7 | `## Deep dives in doc/` | 18 | Deep Dives Are Linked, Not Duplicated |
| 8 | `## Known gaps / inconsistencies` | 26 | Known Gaps Section Documents Four Items Factually |
| 9 | `## Related documents` | 10 | Non-duplication scenario; points to `AGENTS.md`, `README.md`, `openspec/` |
| | **Total** | **~216** | Within the 150–250 target; ceiling for apply is 245, see [D14](#d14-line-budget-after-the-correction) |

Skeleton (heading text is normative; body text is indicative):

```markdown
# CLAUDE.md

<3–4 lines: this file is the structural map of the repo; it is authoritative for
directory layout and inter-service communication; AGENTS.md owns Codex workflow
conventions and README.md owns setup and product overview; facts here were verified
against manifests and source, not copied from sibling docs.>

## Surface inventory
<lead line + the 11-row table (D4) + one note line pointing at Known gaps for web/>

## Inside client/
<entry chain; transport layer; phaser subtree; stores; views vs screens; enums; assets by category>

## Inside server/
<entry chain; the 16 src/* directories; packages by wiring status; raw mariadb driver>

## Inside api/
<Laravel 12 / PHP 8.2; Passport + VerifyEmulatorToken; Backpack admin; routes; enums; migrations convention pointer>

## How services talk
<gameplay client->server is Socket.IO only; then the ONE non-gameplay client->API HTTP
 path (Stripe checkout-session POST) with its real shape and liveness; then the media-URL
 and third-party distinctions; then server->API, the two API->server reverse channels, and
 the shared database. The server's /api mount is framed as an inbound channel the Laravel
 API calls, never as a client path. See D12 for the exact claim set.>

## Deep dives in doc/
<links per topic + the duplication note>

## Known gaps / inconsistencies
<the four items, factual, no remediation>

## Related documents
<AGENTS.md, README.md, doc/, openspec/>
```

Non-duplication constraints applied while drafting: no commit-message footer, no
"respond in <language>" framing, no feature-status table, no screenshots, no
endpoint-by-endpoint route listing, no enumeration of `client/src/assets/`.

## D4: surface inventory table contract

Four columns, exactly as the spec requires (`path`, `stack`, `entry point`, `commands`):

```markdown
| Surface | Stack (verified) | Entry point | Build / run / test |
```

Eleven rows in this order. Every cell below is already verified; apply must not re-derive
or embellish it.

| Row | Stack cell — sourced from | Entry point cell — sourced from | Commands cell — sourced from |
|-----|---------------------------|---------------------------------|------------------------------|
| `client/` | `client/package.json` deps: vue ^3.5.13, phaser ^3.87.0, pinia ^3.0.2, socket.io-client ^4.8.1, vite ^6.0.1 | `client/index.html` → `client/src/main.js` | `client/package.json` scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run jsonmin`, `npm run jsonunmin`; **no test script** |
| `server/` | `server/package.json` deps: express ^4.21.1, socket.io ^4.8.1, mariadb ^3.4.0, axios ^1.10.0 (CommonJS) | `server/index.js` | `server/package.json` scripts: `npm start`, `npm run dev`; **no test script** |
| `api/` | `api/composer.json`: php ^8.2, laravel/framework ^12.0, laravel/passport ^12.0, backpack/{filemanager,permissionmanager,theme-coreuiv4}, stripe/stripe-php ^19.0, darkaonline/l5-swagger ^9.0 | `api/public/index.php` | `composer install`; `composer run dev` (composer.json `scripts.dev` → concurrently serve + queue:listen + vite); `./vendor/bin/phpunit`, `./vendor/bin/pint` (both from `require-dev`) |
| `launcher/` | `launcher/package.json` devDeps: electron ^26.0.0, electron-builder ^26.0.12 | `launcher/main.js` (package.json `main`) | `npm start` (`electron .`), `npm run build` (`electron-builder --win`) |
| `docker/` | Shell scripts + MariaDB init SQL + nginx-proxy vhost confs (`docker/` tree) | `n/a` | `docker compose up -d` (root `docker-compose.yml`); `docker/manager.sh`; `docker/backup-docker-uploads.sh`; `docker/restore-docker-uploads.sh` |
| `doc/` | Markdown technical notes + `doc/screenshots/*.png` | `n/a` | `n/a` |
| `agent_tasks/` | Empty working dir (only `.gitignore`) | `n/a` | `n/a` |
| `backups/` | Empty working dir (only `.gitignore`); target of `docker/backup-docker-uploads.sh` | `n/a` | `n/a` |
| `boombang_api.sql` | Root-level SQL dump; not referenced by `docker-compose.yml` or any script | `n/a` | `n/a` |
| `.github/` | Only `.github/instructions/copilot.instructions.md`; **no `workflows/`** | `n/a` | `n/a` |
| `web/` | Referenced but absent from this repo | `n/a` | `n/a` — see Known gaps |

Sourcing rules for the rest of the document:

| Fact | Source of record |
|------|------------------|
| Local hostnames (`api.boombang.com`, `play.boombang.com`, `server.boombang.com:3000`, `pma.boombang.com`) | root `.env.example` (`*_VIRTUAL_HOST`) |
| Shared DB name `boombang_api` | root `.env.example` `API_DB_DATABASE` and `SERVER_DB_DATABASE`; `docker/db/init/create_databases.sql` |
| MariaDB image `mariadb:11` | `docker-compose.yml` `services.db.image` |
| `web/` service definition | `docker-compose.yml` `services.web` (`build: ./web`, `env_file: ./web/.env`) |
| `web/` launcher reference | `launcher/package.json` → `build.win.icon: ../web/public/favicon/web-app-manifest-512x512.png` |
| `boombang.com` literals | root `.env.example` lines 5, 23, 42, 59, 67 (the five `*_VIRTUAL_HOST` values), `README.md`, `AGENTS.md`. **Not `docker-compose.yml`** — see [D13](#d13-domain-drift-attribution-known-gap-2) |
| `boommania.com` literals | `launcher/.env.example` (`VUE_URL=https://play.boommania.com/`); `launcher/main.js`; `docker/nginx/boommania.com` and `docker/nginx/www.boommania.com` (filenames **and** contents); `docker/nginx/api-cors.conf:2`; `launcher/package.json` `appId: com.boommania.launcher`, `productName: BoomMania` |
| Sharpest drift instance | `docker/nginx/api-cors.conf:2` vs root `.env.example:59` — see [D13](#d13-domain-drift-attribution-known-gap-2) |
| Shared-secret name | root `.env.example` `API_EMULATOR_API_TOKEN` / `SERVER_EMULATOR_API_TOKEN`, passed into containers as `EMULATOR_API_TOKEN` |
| Bots wiring | `server/index.js:7` (`require('./src/packages/bots/BotsPackage')`) and `server/index.js:65-66` (`RUN_BOTS === 'true'`) |
| Server `/api` mount | `server/index.js:60` |
| Bot-token reverse channel | `server/src/config/server.js:22`; caller `api/app/Http/Controllers/Internal/BotController.php:39` |
| Notification reverse channel | `server/src/routes/apiRoutes.js:7,11`; caller `api/app/Services/SocketNotificationService.php:24,56` |

`CLAUDE.md` states facts, not line numbers — the line numbers above exist so a reviewer can
re-verify each claim cheaply. Do not paste them into `CLAUDE.md`; they rot fastest.

## D13: domain-drift attribution (known gap 2)

**Corrected 2026-08-02.** The first draft's gap wording said `docker-compose.yml` "uses
`boombang.com` hostnames". It does not. Re-verified during this correction pass:

| Claim | Command | Result |
|-------|---------|--------|
| `docker-compose.yml` contains no literal `boombang.com` | `grep -n 'boombang' docker-compose.yml` | 7 hits, all at lines 17, 34, 72, 113, 152, 175, 188 — every one is the Docker **network name** `boombang`, never a hostname |
| The hostnames reach compose by interpolation | `grep -n 'VIRTUAL_HOST' .env.example` | `5 API_VIRTUAL_HOST=api.boombang.com`, `23 WEB_VIRTUAL_HOST=boombang.com`, `42 SERVER_VIRTUAL_HOST=server.boombang.com`, `59 CLIENT_VIRTUAL_HOST=play.boombang.com`, `67 PMA_VIRTUAL_HOST=pma.boombang.com` — compose consumes these as `${*_VIRTUAL_HOST}` |
| The sharpest instance is a real CORS mismatch | `cat docker/nginx/api-cors.conf` | line 2 hard-codes `add_header Access-Control-Allow-Origin "https://play.boommania.com" always;` while `.env.example:59` sets `CLIENT_VIRTUAL_HOST=play.boombang.com` |

**Attribution rule for the gap-2 entry in `CLAUDE.md`.** State each literal only against
files that contain it:

- `boombang.com` side: root `.env.example`, `README.md`, `AGENTS.md`.
- `boommania.com` side: `launcher/.env.example`, `launcher/main.js`, the launcher
  `electron-builder` `productName`/`appId`, the two `docker/nginx/boommania.com` vhost
  files, and `docker/nginx/api-cors.conf`.
- `docker-compose.yml` MAY be mentioned **only** as receiving hostnames by
  `${*_VIRTUAL_HOST}` interpolation from the root `.env.example`. Writing that it "uses
  `boombang.com` hostnames" fails the spec's domain-drift scenario.

**The drift sentence to lead with** (the concrete consequence, not the inventory): the API's
nginx layer advertises `https://play.boommania.com` as its CORS origin while the configured
client host is `play.boombang.com`, so the two do not match. State it as an observation.
Do not rewrite either file — remediation is out of scope.

## D11: corrections to exploration.md that must not be carried forward

Re-verification during this design phase found three inaccuracies in `exploration.md`.
Apply must use the right-hand column.

| `exploration.md` says | Verified reality | Impact |
|-----------------------|------------------|--------|
| line 119: `src/managers/` — game state managers | **`server/src/managers/` does not exist.** No file matches `server/src/managers/**` and no `require` in `server/` references `src/managers`. It is listed in `AGENTS.md` and was copied into the exploration unchecked | `CLAUDE.md` must omit `managers/` from the `server/src/*` list |
| line 105: `adminSockets.js` sits directly under `sockets/game/` | It is at `server/src/sockets/game/admin/adminSockets.js`; there is also `game/config/configSockets.js` | Describe `sockets/` by domain grouping, not by exact file paths |
| lines 223-225: the server's `/api` mount is "Client → Server via plain REST" | It is the **inbound channel from the Laravel API** — `POST /api/notify-credits-update` and `POST /api/notify-inventory-update`, both called from `api/app/Services/SocketNotificationService.php` | See D12; framing it as a client REST path would contradict the "gameplay is Socket.IO-exclusive" claim, and would wrongly imply a *second* client→API path alongside the Stripe one |

Verified authoritative `server/src/*` list for the `Inside server/` section (16 entries):
`boot/`, `collections/`, `config/`, `controllers/`, `enums/`, `instances/`, `maps/`,
`models/`, `packages/`, `resources/`, `routes/`, `services/`, `services-api/`, `sockets/`,
`tasks/`, `utils/`.

Verified `client/src/*` list: `assets/`, `composables/`, `config/`, `enums/`, `phaser/`,
`plugins/`, `screens/` (one file: `screens/auth/LoginScreen.vue`), `sockets/`, `stores/`,
`utils/`, `views/`, plus `App.vue` and `main.js`.

## D12: "How services talk" contract

**Corrected 2026-08-02.** The first draft of this table asserted "no `axios`/`fetch`
against a project API URL in `client/src`". That was false and was never grepped. The
corrected claim set below was derived by reading source, and each row names the file and
line that carries it.

The section must assert exactly these claims, and nothing that contradicts them:

| Claim | Evidence |
|-------|----------|
| **Gameplay** client → server traffic is Socket.IO exclusively, carried by the single transport module `client/src/sockets/socket.js` | `client/src/sockets/` contains exactly one file; the gold/silver purchase in `ShopComponent.vue:294` is `socket.emit(RequestSocketsEnum.PURCHASE_SHOP_ITEM, …)` |
| **Exactly one non-gameplay client → API HTTP path exists**: a `POST` to `${VITE_API_BASE_URL}/api/stripe/create-checkout-session`, authenticated by a bearer token read from `localStorage` (`app_jwt`), with the base URL falling back to `http://127.0.0.1:8000` | `client/src/views/components/game/scenes/ShopComponent.vue:306` (base URL + fallback) and `:313` (the `fetch`); receiving route live at `api/routes/api.php:189-190` → `StripeController::createCheckoutSession` |
| That path is **live, not dead or planned code** | `handleStripePayment()` is defined at `ShopComponent.vue:300` and invoked at `:277` and `:415`; `ShopComponent.vue` is imported by `GameSceneScreen.vue`, `PublicSceneScreen.vue`, and `PrivateSceneScreen.vue` |
| The boundary between the two is the **payment rail, not data volume** — the same component emits gold/silver purchases over Socket.IO and sends the Stripe purchase over HTTP | `ShopComponent.vue:294` (socket emit) vs `ShopComponent.vue:313` (`fetch`) |
| The other two `fetch(` call sites in `client/src` load **local** `/src/assets` paths and are not API traffic; there is no `axios` anywhere in `client/src` | `client/src/phaser/controllers/scene/MovementControlsController.js:183` (`fetch('/src/assets/game/avatars/gata/config.json')`); `client/src/phaser/managers/AvatarManager.js:596` (`fetch(imgPath)`) |
| **API-host media URLs are not call paths.** `client/src` builds asset URLs against the API host, but these are URL strings the browser renders, not `fetch`/`axios` calls issued by application code, and must not be counted as additional client → API paths | `MailPanelComponent.vue:180` (`VITE_API_URL`, falls back to `http://api.boombang.com`); `ObjectsNpcModalComponent.vue:200` and `:211` |
| The server exposes a small REST surface at `/api`, described at a high level only, and it is an **inbound channel used by the Laravel API** to push credit/inventory notifications — not a client entry point | `server/index.js:60`; `server/src/routes/apiRoutes.js`; `api/app/Services/SocketNotificationService.php` |
| Server → API is HTTP from `server/src/services-api/*ApiService.js`, authenticated with `EMULATOR_API_TOKEN` and validated by the API's `VerifyEmulatorToken` middleware | 19 `*ApiService.js` files incl. `ApiService.js`; root `.env.example`; `api/app/Http/Middleware/VerifyEmulatorToken.php` |
| API → server reverse channel exists via `POST /internal/add-bot-token` | `server/src/config/server.js:22`; `api/.../Internal/BotController.php:39` |
| Server and API share the same `boombang_api` MariaDB database; the server issues raw queries via the `mariadb` driver, so this is not an ORM ownership boundary | `server/src/config/database.js`; root `.env.example` `SERVER_DB_DATABASE=boombang_api` = `API_DB_DATABASE` |
| Third-party outbound calls from the client (Google Sign-In, reCAPTCHA, `VITE_WEB_TERMS_URL`) exist but are not calls to this project's API | `client/src/composables/useGoogleSignIn.js`; `client/.env.example` |

### Two forbidden wordings, in opposite directions

Both fail the spec. Neither may appear in `CLAUDE.md` **or** in `AGENTS.md`.

| Forbidden | Why it is wrong |
|-----------|-----------------|
| `Direct HTTP/HTTPS calls for non-real-time data`, or any wording implying a general client → API REST data path | Overstates it. One endpoint is reachable from `client/src`, and it initiates a payment; it is not a data-fetch channel |
| `None`, `the client never calls the Laravel API directly`, `nothing in client/src calls the Laravel API`, `no direct client-to-API HTTP path` — any absolute denial | Falsified by `ShopComponent.vue:313`, which calls a live route. This is the error the first draft shipped: it replaced an overstatement with a more confidently worded falsehood, which is a net accuracy regression |

The correct shape is neither: **gameplay is Socket.IO only, plus one narrow Stripe
checkout-session `POST`.** Lead with that sentence; the qualifiers follow it.

Enumeration is prohibited: name the two notification endpoints at most once as examples of
"what kind of thing lives there", and never list `apiRoutes.js` or `routes/api.php`
endpoint by endpoint. The single client → API endpoint is the one exception — it is named
in full precisely because its existence is the fact the reader most needs.

Two distinct API→server paths exist and must not be merged into one sentence:

| Direction | Mount | Purpose | Caller |
|-----------|-------|---------|--------|
| API → server | `POST /internal/add-bot-token` (`server/src/config/server.js`) | pre-authorize a short-lived bot token | `api/app/Http/Controllers/Internal/BotController.php` |
| API → server | `/api/*` (`server/src/routes/apiRoutes.js`, mounted in `server/index.js`) | push credit/inventory notifications into live sockets | `api/app/Services/SocketNotificationService.php` |

The second row is the one `exploration.md` got wrong. Writing "the server also exposes a
small REST surface for the client" would reintroduce, in `CLAUDE.md`, the same class of
error this change exists to remove from `AGENTS.md`.

## D5/D6: AGENTS.md edit contract

Two edits, both surgical. Nothing else in the file may change.

**Edit 1 — replace the stale bullet in place** (currently `AGENTS.md:358`, inside
`### Inter-Service Communication`):

**Corrected 2026-08-02.** The first draft prescribed
`None — the client never calls the Laravel API directly; all client traffic goes to the
server over Socket.IO`. The spec now explicitly forbids that as an absolute falsehood
(`ShopComponent.vue:313` calls a live route). The normative replacement text is below.

```diff
 - **Client ↔ Server**: Socket.IO (WebSocket)
 - **Server ↔ API**: HTTP/HTTPS with `EMULATOR_API_TOKEN` authentication
 - **Web ↔ API**: Standard Laravel HTTP/API calls
-- **Client ↔ API**: Direct HTTP/HTTPS calls for non-real-time data
+- **Client ↔ API**: One path only — a JWT-authenticated `POST` to `/api/stripe/create-checkout-session` from `ShopComponent.vue`; all other client traffic is gameplay and goes over Socket.IO
```

Copy that `+` line verbatim (minus the leading `+`). It is engineered against five
constraints simultaneously:

| Constraint | Source | How the line satisfies it |
|------------|--------|---------------------------|
| Must not be an absolute denial | spec, `AGENTS.md Stale Claim Corrected` | says `One path only`, never `None`, never "never calls" |
| Must not claim *all* client traffic is Socket.IO | same | scopes the Socket.IO clause to "all **other** client traffic … is gameplay" |
| Must name the Stripe checkout-session `POST` | same | names the endpoint in full, so V14 can grep `create-checkout-session` inside the bullet |
| Exactly one `CLAUDE.md` mention in the whole file | V8 | the bullet contains no `CLAUDE.md` link; the cross-reference in Edit 2 is the only one |
| Must not contradict `CLAUDE.md` | spec | same lead sentence shape as [D12](#d12-how-services-talk-contract) |

Exact expected diff shape for `AGENTS.md`, **both edits together, measured against `HEAD`**:

```bash
git diff --cached --numstat -- AGENTS.md
# expected, exactly:  3<TAB>1<TAB>AGENTS.md
```

`3` insertions = the one replacement bullet + the cross-reference line + its separating
blank line. `1` deletion = the stale bullet. If the numstat reads anything else, either the
replacement bullet wrapped onto a second line (it must be one physical line, however long)
or a collateral edit crept in.

Wording strategy, and why replace rather than delete:

- **Keep the `- **Client ↔ API**:` label.** A reader (or a future agent) who half-remembers
  "AGENTS.md said the client calls the API" will look for that exact bullet. Deleting it
  leaves a silent hole; replacing it delivers the correction at the exact point of
  confusion. This is the recognition-over-recall pattern.
- **Lead with the answer (`One path only —`)** before the explanation, so a scanner gets
  the corrected magnitude from the first three words.
- **No link to `CLAUDE.md` in this bullet.** The spec requires *exactly one* added
  cross-reference line; putting a second `CLAUDE.md` mention here would break the
  `grep -c 'CLAUDE.md' AGENTS.md` → `1` check in V8.
- **No trailing period**, matching the three sibling bullets.
- The `- **Web ↔ API**` bullet and the `web/` entry in Project Overview stay untouched even
  though `web/` is absent from the repo — out of scope per the spec; `CLAUDE.md` carries
  that correction instead. Accepted residual inaccuracy, recorded under Risks.

**Edit 2 — insert the one cross-reference line** after the Project Overview bullet list
(after `AGENTS.md:13`, before the blank line preceding `## Docker Development Environment`):

```markdown
Repository structure, per-service internals, and inter-service communication are documented authoritatively in [CLAUDE.md](CLAUDE.md); this file covers Codex-specific workflow conventions.
```

Placement rationale: top-of-file placement is seen by every reader in the first screen,
whereas a line buried at line 358 is only found by someone already reading the
communication section. The sentence also states the division of responsibility, which is
the mitigation the proposal promised for "perceived authority conflict".

Expected diff shape for both edits: **3 insertions, 1 deletion** (`+1/-1` for the bullet,
`+2` for the new paragraph plus its separating blank line), measured with
`git diff --cached --numstat -- AGENTS.md`. The blank line is Markdown structure, not
content; the spec's "exactly one added cross-reference line" is satisfied with one added
content line.

## D7: README.md edit contract

One line appended to the existing `## Documentación técnica` section, after
`README.md:239`:

```markdown
El mapa técnico y estructural del repositorio (directorios, stacks, comandos y comunicación entre servicios) está en [`CLAUDE.md`](CLAUDE.md).
```

- **Written in Spanish.** The spec requires `README.md` to retain its Spanish body, and a
  lone English sentence in a Spanish document is a defect, not neutrality. The
  English-only rule for this change applies to the SDD artifacts (`proposal.md`,
  `spec.md`, `design.md`, `tasks.md`) and to `CLAUDE.md` itself, which the spec explicitly
  requires to be English.
- Placed in `## Documentación técnica` rather than near the architecture diagram, because
  that section already exists to route readers to further documentation (`doc/`), so the
  new line extends an established pattern instead of interrupting the diagram.
- Expected diff shape: **2 insertions, 0 deletions** (blank separator + content line).
- The stale-adjacent content in README (architecture diagram omits the API→server reverse
  channel) is left alone — out of scope; `CLAUDE.md` is where that is corrected.

## D1: domain key stays `project-documentation`

The spec phase flagged this as open. Resolution: **keep it.**

- `openspec/` currently contains only `config.yaml` and this change's own folder — there is
  no `openspec/specs/` registry yet, so there is no existing key to collide with or align
  to. This change effectively establishes the first domain key.
- The capability being specified is not "the CLAUDE.md file"; it is the contract over the
  repo's three root-level documentation surfaces (`CLAUDE.md`, `AGENTS.md`, `README.md`)
  and their factual-accuracy constraints. A narrower key (`claude-md`, `agent-onboarding`)
  would under-describe that and would need renaming the first time a requirement about
  `README.md` or `doc/` lands.
- `project-documentation` is a kebab-case noun phrase consistent with the naming used in
  the change folder itself, and leaves room for future requirements (reconciling `doc/`
  duplication, documenting CI once it exists).

No file move, no spec rename, no follow-up task.

## D2: how the 150–250 line target is counted

**Plain `wc -l CLAUDE.md` over the entire file.** No exclusions for blank lines, code
fences, tables, or headings.

- There is no YAML front matter in this file, so "body length" and "file length" are the
  same measurement; introducing a separate body-only count would need a bespoke script and
  would make the check non-reproducible by a human reviewer.
- `wc -l` counts newline characters, so the file MUST end with a trailing newline or the
  last line is not counted. V2 enforces this explicitly.
- The bound is inclusive: `150 <= wc -l <= 250`. The headroom is no longer generous — the
  factual correction adds material to an already 224-line file. See
  [D14](#d14-line-budget-after-the-correction) for the working ceiling and the trim ledger.

## D14: line budget after the correction

The drafted `CLAUDE.md` on disk is **224 lines**. The corrections mandated by the amended
spec all add lines. This is the arithmetic and the response.

| Item | Δ lines | Why |
|------|---------|-----|
| Current file | 224 | `wc -l < CLAUDE.md` |
| Rewrite of the client→server paragraph (`CLAUDE.md:137-142`) into the corrected Socket.IO-plus-Stripe statement | +5 | 6 lines become ~11: gameplay claim, the Stripe path with its real shape, its liveness, the payment-rail framing |
| New row in the direction table (`CLAUDE.md:144-150`) for `Client -> API` | +1 | the table currently has no client→API row at all |
| Media-URL and third-party distinction | +3 | spec requires both be named and excluded from the call-path count |
| Domain-drift entry precision ([D13](#d13-domain-drift-attribution-known-gap-2)) | +2 | drop the `docker-compose.yml` misattribution, add the interpolation clause and the `api-cors.conf` instance |
| **Projected** | **235** | 15 lines under the spec bound |

**Working ceiling: 245, not 250.** Five lines of slack absorbs a wording pass without
re-triggering a trim. If `wc -l` exceeds 245 after the corrections land, apply the trims
below **in order** until it is at or under 245. Stop as soon as it is.

| Order | Location (current line numbers) | Now | Trim to | Saves |
|-------|--------------------------------|-----|---------|-------|
| 1 | `CLAUDE.md:100-110` — packages-by-wiring-status paragraph | 11 lines | Keep the `bots/` + `RUN_BOTS=true` sentence, the eight standalone names, and the `cd server/src/packages/<name> && npm install && npm start` form. Move the `textures_maker`-has-no-start-script detail into the same sentence | **4** |
| 2 | `CLAUDE.md:46-59` — client directory table | 14 rows | Fold `config/`, `enums/`, `plugins/`, `utils/` into one "supporting modules" row | **3** |
| 3 | `CLAUDE.md:61-65` — assets-by-category paragraph | 5 lines | 3 lines; the `jsonmin`/`jsonunmin` sentence moves into the surface-inventory `client/` row, which already lists both scripts | **2** |
| 4 | `CLAUDE.md:168-173` — shared-database paragraph | 6 lines | 4 lines; keep the "shared datastore, not an ORM boundary" point and drop the restatement of where the DB name is declared (already in the inventory prose) | **2** |
| 5 | `CLAUDE.md:30-33` — container/hostname prose | 4 lines | 3 lines | **1** |
| 6 | `CLAUDE.md:13-14` — surface-inventory lead-in | 2 lines | 1 line | **1** |
| | | | **Total available** | **13** |

Hard rules while trimming, straight from the spec's overflow scenario:

- **Never drop a required section.** All nine headings in the outline stay, or V3 fails.
- **Never drop a surface-inventory row.** All eleven stay, or the inventory requirement fails.
- **Never trim the Stripe description.** It is the reason this correction exists.
- **Link out, do not delete.** Detail removed here goes to `doc/`, `README.md`, or
  `AGENTS.md` by reference — the `## Deep dives in doc/` table already exists for this.
- The floor still applies: do not go below 150.

## D8: verification — executable checks in place of unit tests

There is no Markdown test runner in this repo, so verification is a fixed set of shell
checks. **Run every command from the repository root**
(`/Users/evgeny.lyubeznyy/Desktop/Proyectos/boombang-html5`). Where "expected: no output"
is stated, any output is a failure.

If a runnable script is wanted, write it to the session scratchpad
(`.../scratchpad/verify-claude-md.sh`) — **not** into the repo, which would violate the
blast-radius requirement.

These fourteen checks are the substitute for the configured `strict_tdd` test command,
which must not run (D9).

| Check | Subject | Reads | Asserts |
|-------|---------|-------|---------|
| V1 | `CLAUDE.md` | filesystem | file exists |
| V2 | `CLAUDE.md` | document | 150–250 lines (working ceiling 245), trailing newline |
| V3 | `CLAUDE.md` | document | all nine headings, in order, exact text |
| V4 | `CLAUDE.md` + source | **both** | required strings present **and** each factual token has a source-side counterpart |
| V5 | `CLAUDE.md` | document | **wording floor only** — prohibited strings absent; English-only. Carries no factual weight |
| V6 | manifests | source | every quoted command exists; no `test` script appeared |
| V7 | tree | source | every path named in the doc exists |
| V8 | `AGENTS.md` | document + git | stale line gone, one cross-reference, `+3/-1` (`--cached`) |
| V9 | `README.md` | git | one cross-reference, `+2/-0` (`--cached`) |
| V10 | working tree | git | exactly four paths, no `web/`, no CI, no config drift |
| V11 | `.gitignore` + git | git | `0/1` diff, `.claude` survives, file not ignored, stageable without `-f` |
| V12 | `CLAUDE.md` | document | no credential values |
| V13 | spec | manual | walkthrough of the **thirteen** acceptance boxes |
| **V14** | `client/src` + both docs | **source, then reconcile** | the client→API hit set is exactly the expected three, and `CLAUDE.md`/`AGENTS.md` describe it accurately in both directions |

V14 is numbered last so that V1–V13's existing numbering stays stable for `tasks.md` and
`apply-progress.md`. It is **run with V5**, at the same point in the rollout — see
[Rollout](#rollout).

### V-suite tautology audit

The spec now forbids validating a factual claim solely by grepping the document that makes
it. Applying that rule to every check:

The discriminator: a document-string check is legitimate when the property it tests **is a
property of the document** (its length, its headings, its language, whether it duplicates a
sibling doc). It is a tautology when the property it tests is **a fact about the codebase**,
because the document's author chose the strings.

| Check | Kind | Tautological? | Action taken |
|-------|------|---------------|--------------|
| V1 | filesystem | no | keep |
| V2 | document property (length) | no — length *is* a document property | keep |
| V3 | document property (headings) | no | keep |
| V4 | doc-string presence, previously offered as evidence for codebase facts | **yes**, for the seven non-path tokens (`EMULATOR_API_TOKEN`, `VerifyEmulatorToken`, `/internal/add-bot-token`, `boombang_api`, `RUN_BOTS`, `boommania.com`, `.github/workflows`) | **fixed** — V4 now pairs each factual token with a source-side counterpart grep |
| V5 | doc-string absence | **yes** for the two factual entries (`Direct HTTP/HTTPS calls`, `server/src/managers`); **no** for `npm test`, `Co-Authored-By`, `Generated with`, `doc/screenshots`, and the Spanish-character grep, which test wording and non-duplication | **fixed** — V5 demoted to an explicitly labelled wording floor; the factual guarantee moved to V14 and V7 |
| V6 | source-side (manifests) | no — genuinely reconciles doc against manifest | keep; its known floor is that it checks quoted commands exist, not that every command in the doc was extracted |
| V7 | source-side (tree) | no | keep — this is what makes V4's *path* tokens non-tautological |
| V8 | doc-string + git diff | the bullet's **content** claim was doc-side only | **fixed** — V14.4 reconciles the `AGENTS.md` bullet against source |
| V9 | git diff shape | no | keep, add `--cached` |
| V10 | git + filesystem | no | keep |
| V11 | git | no | keep, add `--cached` |
| V12 | document property (no secrets in this file) | no | keep |
| V13 | manual | n/a | extended to thirteen boxes |
| V14 | source-side, bidirectional | no — this is the fix | new |

### V1 — file exists

```bash
test -f CLAUDE.md && echo OK
```
Expected: `OK`

### V2 — length target and trailing newline

```bash
wc -l < CLAUDE.md
[ -n "$(tail -c1 CLAUDE.md)" ] && echo "FAIL: missing trailing newline"
```
Expected: an integer in `[150, 250]`; no `FAIL` line. **Treat anything above 245 as a
failure during apply** and work the [D14](#d14-line-budget-after-the-correction) trim
ledger — 250 is the spec bound, 245 is the working ceiling that keeps a wording pass safe.

### V3 — all nine sections present, in order

```bash
grep -n '^# CLAUDE.md$' CLAUDE.md
grep -nE '^## (Surface inventory|Inside client/|Inside server/|Inside api/|How services talk|Deep dives in doc/|Known gaps / inconsistencies|Related documents)$' CLAUDE.md
grep -c '^## ' CLAUDE.md
```
Expected: the H1 matches once; the second command prints **exactly 8 lines** with strictly
increasing line numbers in the order listed; the count is `8`.

### V4 — required strings present, each paired with a source-side counterpart

**V4a — the wording floor.** Proves the tokens appear. Proves nothing about the codebase.

```bash
for s in \
  'client/src/sockets/socket.js' \
  'client/src/phaser/services/' \
  'server/src/collections/' \
  'server/src/boot/' \
  'server/src/services-api/' \
  'server/src/routes/apiRoutes.js' \
  'EMULATOR_API_TOKEN' \
  'VerifyEmulatorToken' \
  '/internal/add-bot-token' \
  'boombang_api' \
  'RUN_BOTS' \
  'boommania.com' \
  'docker-compose.yml' \
  '.github/workflows' \
  'Socket.IO' \
  'stripe/create-checkout-session' \
  'ShopComponent.vue' \
  'VITE_API_BASE_URL'
do grep -qF "$s" CLAUDE.md || echo "MISSING: $s"; done
```
Expected: no output.

**V4b — the source-side counterparts.** Without these, V4a is a tautology for every token
that is a claim about the codebase rather than a path. Path tokens are covered by V7; the
Stripe tokens by V14; the rest need their own grep:

```bash
grep -rq 'EMULATOR_API_TOKEN' server/src api  || echo "UNSOURCED: EMULATOR_API_TOKEN"
test -f api/app/Http/Middleware/VerifyEmulatorToken.php || echo "UNSOURCED: VerifyEmulatorToken"
grep -rq "'/internal/add-bot-token'" server/src/config/server.js || echo "UNSOURCED: add-bot-token route"
grep -q 'add-bot-token' api/app/Http/Controllers/Internal/BotController.php || echo "UNSOURCED: add-bot-token caller"
grep -q 'API_DB_DATABASE=boombang_api'    .env.example || echo "UNSOURCED: shared DB (api side)"
grep -q 'SERVER_DB_DATABASE=boombang_api' .env.example || echo "UNSOURCED: shared DB (server side)"
grep -q 'RUN_BOTS' server/index.js || echo "UNSOURCED: RUN_BOTS wiring"
grep -rq  'boommania.com' launcher docker/nginx || echo "UNSOURCED: boommania.com drift"
grep -q   'play.boommania.com' docker/nginx/api-cors.conf || echo "UNSOURCED: CORS drift instance"
test -d .github/workflows && echo "STALE CLAIM: .github/workflows now exists"
```
Expected: no output. Each line fails loudly if the repository stops supporting a claim
`CLAUDE.md` makes, which is the property V4a alone cannot have.

### V5 — prohibited strings absent (wording floor, no factual weight)

> **Redesigned 2026-08-02.** The previous V5 was the only check nominally guarding the
> central client→API claim, and it was a tautology: it grepped the authored document for a
> string the author had chosen not to write, so it passed unconditionally whatever the
> codebase did. It is retained **only** as a wording floor and is explicitly not evidence
> that any described relationship is true. [V14](#v14--source-level-reconciliation-of-the-clientapi-claim)
> is what actually guards the claim. Do not cite V5 in a coverage table as verifying it.

**V5a — the two-directional wording ban.** Both misstatements are forbidden, and both
documents this change edits are in scope:

```bash
for f in CLAUDE.md AGENTS.md; do
  grep -nE 'Direct HTTP/HTTPS calls' "$f"
  grep -nE 'never calls the Laravel API' "$f"
  grep -nE 'no direct client-to-API' "$f"
  grep -nE 'nothing in .?client/src.? calls' "$f"
  grep -nE 'Client . API\*\*: *None' "$f"
  grep -nE 'all client traffic (goes|is)' "$f"
done
```
Expected: no output. The first pattern is the original overstatement; the rest are the
absolute-denial family the first draft shipped. Any hit fails immediately.

**V5b — other prohibited strings** (duplication and manifest hygiene, genuinely document
properties):

```bash
for s in 'npm test' 'npm run test' 'Co-Authored-By' 'Generated with' \
         'doc/screenshots' 'server/src/managers'
do grep -qF "$s" CLAUDE.md && echo "PROHIBITED: $s"; done
```
Expected: no output. `server/src/managers` is also covered from the source side by V7 and
V4b; the others are duplication checks against `AGENTS.md`/`README.md` and are legitimately
document-only.

**V5c — English-only:**

```bash
grep -nE '[áéíóúñÁÉÍÓÚÑ¿¡]' CLAUDE.md
```
Expected: no output. `CLAUDE.md` references only ASCII paths and must not quote Spanish
prose from `README.md`. (`↔` and `→` are allowed; they are not in the character class.)
Language is a property of the document itself, so this check is not tautological.

### V6 — every quoted command exists in its manifest

```bash
for s in dev build preview jsonmin jsonunmin; do grep -q "\"$s\":" client/package.json   || echo "client script missing: $s"; done
for s in start dev;                            do grep -q "\"$s\":" server/package.json   || echo "server script missing: $s"; done
for s in start build;                          do grep -q "\"$s\":" launcher/package.json || echo "launcher script missing: $s"; done
grep -q '"dev"'          api/composer.json || echo "api composer dev script missing"
grep -q 'laravel/pint'   api/composer.json || echo "pint missing"
grep -q 'phpunit/phpunit' api/composer.json || echo "phpunit missing"
grep -q '"test"' client/package.json && echo "UNEXPECTED: client test script now exists"
grep -q '"test"' server/package.json && echo "UNEXPECTED: server test script now exists"
```
Expected: no output. The last two lines are the tripwire behind the "no invented test
script" requirement — if either fires, the doc's claim about missing tests is stale and
must be re-checked before shipping.

### V7 — every path mentioned in CLAUDE.md exists

```bash
grep -oE '`[A-Za-z0-9_./*<>-]+`' CLAUDE.md | tr -d '`' | sort -u | while read -r p; do
  case "$p" in
    */*|*.md|*.js|*.json|*.php|*.sql|*.yml|*.sh|*.html) ;;
    *) continue ;;
  esac
  case "$p" in
    /*|*'*'*|*'<'*) continue ;;                       # route paths and glob/placeholder forms
    web/*|web/|.github/workflows|.github/workflows/*) continue ;;  # documented-as-absent
  esac
  [ -e "$p" ] || echo "MISSING PATH: $p"
done
```
Expected: no output.

Allowlist rationale — the three `continue` classes are the only legitimate non-resolving
tokens: route paths (`/api`, `/internal/add-bot-token`), intentional glob or placeholder
forms (`server/src/services-api/*ApiService.js`, `docker/nginx/*`,
`server/src/packages/<name>`), and the two paths `CLAUDE.md` documents as *not existing*
(`web/…`, `.github/workflows`). If a `MISSING PATH` line appears for anything else, the doc
names a path that is not in the tree.

### V8 — AGENTS.md

> **Two corrections, 2026-08-02.** (1) The changed-line sub-check was unsatisfiable and is
> replaced below. (2) All diff sub-checks are now `--cached`-aware, because they run after
> the rollout's `git add` step, where plain `git diff` reports nothing and reads as a
> vacuous pass.

```bash
grep -c 'Direct HTTP/HTTPS calls' AGENTS.md        # expected: 0 (grep exits 1)
grep -c 'CLAUDE.md' AGENTS.md                      # expected: 1
grep -c 'Co-Authored-By: Codex' AGENTS.md          # expected: 1  (Codex footer intact)
grep -c 'longText' AGENTS.md                       # expected: >= 1 (DB convention intact)
grep -n 'Client . API' AGENTS.md | grep -c 'create-checkout-session'   # expected: 1
```

Diff shape — run **both** forms and require them to agree; whichever is non-empty is the
authoritative one for the current staging state:

```bash
git diff --cached --numstat -- AGENTS.md   # after `git add`:  expected "3<TAB>1<TAB>AGENTS.md"
git diff        --numstat -- AGENTS.md     # before `git add`: expected "3<TAB>1<TAB>AGENTS.md"
```

Changed-line count — **the corrected sub-check**:

```bash
git diff --cached -U0 -- AGENTS.md | grep -E '^[+-]' | grep -vcE '^(\+\+\+|---) '   # expected: 4
```

Cross-check that `4` against the numstat above: `3` insertions + `1` deletion = `4` changed
lines. If the two disagree, a hunk is unaccounted for.

**Why the old form was replaced.** It was
`git diff -U0 -- AGENTS.md | grep -cE '^[+-][^+-]'  # expected: 4`, and it can never return
4 for this diff. Both changed lines are Markdown bullets, so the diff renders them as
`-- **Client ↔ API**: …` and `+- **Client ↔ API**: …`; the pattern `^[+-][^+-]` requires the
character after the diff marker not to be `+` or `-`, which a changed bullet can never
satisfy. The added blank line (a bare `+`) cannot match either. Only the added paragraph
matched, so the check returned `1` staged / `0` unstaged. Two independent phases confirmed
this. The replacement counts every `+`/`-` line and excludes only the `+++`/`---` file
headers, which is marker-agnostic and works for bullets.

### V9 — README.md

```bash
grep -c 'CLAUDE.md' README.md                  # expected: 1
git diff --cached --numstat -- README.md       # after `git add`:  "2<TAB>0<TAB>README.md"
git diff          --numstat -- README.md       # before `git add`: "2<TAB>0<TAB>README.md"
git diff --cached --stat -- README.md
```
A non-zero deletion count means something was reworded or translated — an automatic fail.
An **empty** result from both numstat forms is a failure too, not a pass: it means the edit
was never made.

### V10 — blast radius

```bash
git status --porcelain --untracked-files=all | grep -v '^.. openspec/'
git status --porcelain --untracked-files=all -- client server api launcher docker doc
test -d web && echo "FAIL: web/ was created"
test -d .github/workflows && echo "FAIL: CI was added"
git diff -- .env.example docker-compose.yml docker/ launcher/ | head -5
```
Expected: exactly these four lines from the first command, in any order, and no fifth line:
```text
 M .gitignore
 M AGENTS.md
 M README.md
?? CLAUDE.md
```
The second, third, fourth and fifth commands must all produce no output.

`?? CLAUDE.md` (not silence, and not `A ` from a forced add) is itself the proof that the
`.gitignore` deletion landed before the file was written to disk. V11 checks that
explicitly.

### V11 — CLAUDE.md is committable and .gitignore lost exactly one line

Mechanises the two scenarios added by the spec's "CLAUDE.md Is Committable, Not Gitignored"
requirement. Run the ignore/status half **before** any `git add`; the diff half is given in
both plain and `--cached` form because it is re-run after staging, where plain `git diff`
returns nothing and would read as a vacuous pass. An empty result from *both* forms is a
failure, not a pass.

```bash
git check-ignore CLAUDE.md; echo "check-ignore exit=$?"   # expected: no path printed, exit=1
git status --porcelain --untracked-files=all -- CLAUDE.md # expected: "?? CLAUDE.md"
git diff --numstat -- .gitignore                          # pre-add:  "0<TAB>1<TAB>.gitignore"
git diff --cached --numstat -- .gitignore                 # post-add: "0<TAB>1<TAB>.gitignore"
git diff -U0 -- .gitignore          | grep -E '^[+-]' | grep -vE '^(\+\+\+|---) '   # pre-add
git diff --cached -U0 -- .gitignore | grep -E '^[+-]' | grep -vE '^(\+\+\+|---) '   # post-add
                                                          # both expected: exactly "-CLAUDE.md"
for s in '.claude' '.env' 'NUL' 'logs/' 'auth.json'; do
  grep -qF "$s" .gitignore || echo "REGRESSION: .gitignore lost $s"
done                                                      # expected: no output
grep -qxF 'CLAUDE.md' .gitignore && echo "FAIL: ignore rule still present"
```

Then, and only then, confirm staging works without force:

```bash
git add CLAUDE.md && git status --porcelain -- CLAUDE.md  # expected: "A  CLAUDE.md"
```

Any `git add -f` in the apply transcript is an automatic fail — it means D0 Option B was
taken after Option A was approved.

### V12 — no credentials leaked into the doc

```bash
grep -nE '(API_TOKEN|PASSWORD|SECRET|_KEY)\s*=' CLAUDE.md
```
Expected: no output. Environment *variable names* may be mentioned; values, even
placeholders, must never be pasted.

### V13 — spec acceptance-criteria walkthrough

Manual, one pass, ticking the **thirteen** boxes in
`openspec/changes/create-project-claude-md/specs/project-documentation/spec.md:23-52`
(re-read them; the list grew from ten to twelve for D0, and to thirteen when the spec was
amended for the client→API correction).

| Spec box (abridged) | Mechanised by | Residual human judgement |
|---------------------|---------------|--------------------------|
| 1. Exists, English, five sections | V1, V3, V5c | none |
| 2. Every surface row has correct stack / entry point / commands | V3 (presence) | **yes** — cell-by-cell correctness against the D4 table |
| 3. Commands resolve to real manifest scripts | V6 | none |
| 4. Gameplay is Socket.IO-exclusive **and** exactly one Stripe client→API path is stated, plus the token/reverse-channel/shared-DB facts | **V14** (factual), V4a+V4b, V5a (wording floor) | **yes** — that the prose is not merely present but says the right thing |
| 5. `socket.js`, `phaser/services/`, `collections/`, `boot/` named | V4a + V7 | none |
| 6. Four gaps factual, not remediated; domain drift attributed only to files containing the literal | V4b, V10 (`test -d` tripwires), [D13](#d13-domain-drift-attribution-known-gap-2) | **yes** — phrasing must be factual, not prescriptive; `docker-compose.yml` must not be named as a `boombang.com` source |
| 7. 150–250 lines | V2 + [D14](#d14-line-budget-after-the-correction) | none |
| 8. `AGENTS.md` corrected, replacement is accurate not an absolute denial, cross-referenced | V8, V5a, **V14.4** | none |
| 9. `README.md` cross-referenced | V9 | none |
| 10. Exactly four paths created/modified | V10 | none |
| 11. `.gitignore` diff is one deletion, `.claude` survives | V11 | none |
| 12. `git check-ignore` non-zero, file visible to `git status` | V11 | none |
| 13. Suite contains a source-level reconciliation check, and no check validates the client→API claim solely by grepping `CLAUDE.md` | **V14** exists and runs; [tautology audit](#v-suite-tautology-audit) | **yes** — confirm V5 is not cited anywhere as evidence for box 4 |

V1–V12 and V14 fully mechanise ten of the thirteen boxes. Boxes 2 and 6 are mechanised for
presence only and still need a read-through, as does the "no duplication of sibling
documents" scenario — compare `CLAUDE.md` against `AGENTS.md` and `README.md` by eye for the
Codex commit footer, response-language framing, feature-status table, and screenshots. Box
13 is a meta-check on the suite itself and is inherently manual.

### V14 — source-level reconciliation of the client→API claim

**New, 2026-08-02.** This is the check whose absence let a false statement pass twelve green
checks. It reads `client/src`, not `CLAUDE.md`, and reconciles in **both** directions:
it fails when a project-API call exists that the docs do not describe, *and* when the docs
describe a call path the source does not support.

**V14.1 — the hit set is exactly three, and its expectation is concrete.** Stated as a
literal set, not as "no output", so the check fails when the set changes:

```bash
grep -rInE 'fetch\(|axios' client/src | cut -d: -f1,2 | sort
```
Expected, exactly these three lines and no others:
```text
client/src/phaser/controllers/scene/MovementControlsController.js:183
client/src/phaser/managers/AvatarManager.js:596
client/src/views/components/game/scenes/ShopComponent.vue:313
```
A fourth line means a new call site landed: **read it, classify it, and update `CLAUDE.md`
before proceeding.** A missing line means a call site was removed and the doc is now stale.
The failure points at the call site, not at document wording. (`-I` skips binaries;
`client/src/assets` was confirmed to contain zero matches, so the recursive form is safe.)

**V14.2 — classify each hit.** Exactly one targets a project-API URL:

```bash
grep -n "fetch('/src/assets" client/src/phaser/controllers/scene/MovementControlsController.js  # 183, local asset
grep -n 'fetch(imgPath)'     client/src/phaser/managers/AvatarManager.js                        # 596, local asset
grep -n 'VITE_API_BASE_URL'  client/src/views/components/game/scenes/ShopComponent.vue          # 306, base URL + 127.0.0.1:8000 fallback
grep -n 'create-checkout-session' client/src/views/components/game/scenes/ShopComponent.vue     # 313, the one API call
```

**V14.3 — the one API path is live, and its receiving route exists:**

```bash
grep -n 'create-checkout-session' api/routes/api.php                     # expected: 190 (StripeController::createCheckoutSession)
grep -c 'this.handleStripePayment()' client/src/views/components/game/scenes/ShopComponent.vue   # expected: 2  (lines 277, 415)
grep -rl 'ShopComponent' client/src/views/screens/game/scenes/ | sort    # expected: GameSceneScreen.vue, PrivateSceneScreen.vue, PublicSceneScreen.vue
grep -n 'PURCHASE_SHOP_ITEM' client/src/views/components/game/scenes/ShopComponent.vue           # expected: 294 (the socket rail, same component)
```
If `handleStripePayment` is defined but never invoked, or no screen imports the component,
the path would be dead code and `CLAUDE.md` must not call it live.

**V14.4 — forward reconciliation: the docs describe what the source shows.**

```bash
for s in 'stripe/create-checkout-session' 'ShopComponent.vue' 'VITE_API_BASE_URL' 'app_jwt'; do
  grep -qF "$s" CLAUDE.md || echo "UNRECONCILED: source has a project-API call CLAUDE.md omits ($s)"
done
grep 'Client . API' AGENTS.md | grep -qF 'create-checkout-session' \
  || echo "UNRECONCILED: AGENTS.md bullet does not name the Stripe path"
```
Expected: no output.

**V14.5 — reverse reconciliation: the docs claim no path the source lacks.** Extract every
project-API endpoint `CLAUDE.md` attributes to the client and confirm the source supports
it:

```bash
grep -oE '/api/[a-z0-9-]+/[a-z0-9-]+' CLAUDE.md | sort -u
```
Expected: exactly one line, `/api/stripe/create-checkout-session`. Any second endpoint is a
claim V14.1's hit set does not support and must be removed or evidenced.

**How V14 would have caught the shipped defect.** Against the current staged `CLAUDE.md`
(which says "nothing in `client/src` calls the Laravel API"), V14.1 returns the
`ShopComponent.vue:313` hit, V14.4 prints four `UNRECONCILED` lines, and V14.5 returns
nothing where one endpoint was required. Three independent failures, none of which depends
on which strings the document's author chose.

## D9: the configured test command must not run

`openspec/config.yaml` sets `strict_tdd: true` and, for both `apply` and `verify`,
`test_command: "cd server/src/packages/objects-maker && npm test"`.

**It MUST NOT be run for this change — not during apply, not during verify.**
`server/src/packages/objects-maker/package.json` maps
`test` to `node index.js`, which is not a test — it is an animated-WebP conversion pipeline
that reads `objects-maker/objects/` and calls `fs.ensureDir` on `objects-maker/output/`
(`index.js:23-29`). Running it would (a) require an uninstalled `node_modules` with
`sharp` and `ffmpeg-static`, (b) fail or write generated files into the repo, and (c)
therefore directly violate the "Documentation-Only Blast Radius" requirement. The sibling
`textures_maker` `test` script is a hard-coded `exit 1` placeholder.

Running it would also break V10: a generated `server/src/packages/objects-maker/output/`
tree is a fifth path, and the blast-radius requirement fails on the spot.

**V1–V14 are the substitute test suite for this change**, and they satisfy `strict_tdd` in
spirit: the checks are written here, before the artifact exists, and V1–V7 plus V11 all
failed against the pre-change tree. V14 is the newest and the most important: run it in RED
against the currently staged `CLAUDE.md` and capture the `UNRECONCILED` output as evidence
before rewriting the communication section, exactly as the TDD cycle requires.
Recommend a follow-up change to correct `openspec/config.yaml`'s test detection — the repo
has no real test runner outside `api/`'s phpunit — but that is out of scope here.

## Rollout

Documentation-only, no deployment, no migration, no feature flag. Four paths, one commit.

**Step order matters:** delete the `.gitignore` line *first*. If `CLAUDE.md` is written
while the ignore rule is still live, the file is invisible to `git status` and it is easy
to reach for `git add -f` out of reflex — exactly the outcome D0 rejected.

0. **Capture RED for V14 first.** The tree already holds a staged, factually wrong version
   of this change. Before editing anything, run V14 against it and record the
   `UNRECONCILED` output — that is the strict-TDD RED evidence for the correction, and it
   is the only check in the suite that fails on the current state.
1. **`.gitignore`** — delete the single line `CLAUDE.md` (already deleted in the staged
   state; confirm rather than repeat). Verify:
   `git diff --numstat -- .gitignore` / `git diff --cached --numstat -- .gitignore` →
   `0	1	.gitignore`.
2. **`CLAUDE.md`** — write it per the outline, D4, D11, D12, D13 and the D14 budget.
   Run V1–V7 and **V14** until clean; V2 must land at or under 245.
3. **`AGENTS.md`** — apply the two D5/D6 edits, using the D5 replacement bullet verbatim;
   run V8 and V14.4.
4. **`README.md`** — apply the D7 edit; run V9.
5. Run V10 (blast radius), V11 (committability), V12 (no credentials), and V5a across both
   `CLAUDE.md` and `AGENTS.md`.
6. `git add CLAUDE.md AGENTS.md README.md .gitignore` — **no `-f`**. Re-run every diff-based
   sub-check in its `--cached` form (V8, V9, V11); plain `git diff` is empty from here on
   and an empty result is a failure, not a pass. Then V13, the manual acceptance-criteria
   walkthrough over the **thirteen** boxes.
7. Commit. **One commit** covering all four files, so a revert restores a consistent
   state — splitting `CLAUDE.md` from the cross-reference lines would leave a window where
   `AGENTS.md` and `README.md` link to a non-existent file, and splitting off `.gitignore`
   would leave a commit whose ignore rule contradicts its own tree.

Do **not** run `cd server/src/packages/objects-maker && npm test` at any step (D9).

Rollback: `git revert <sha>`. That deletes `CLAUDE.md`, restores the original
`AGENTS.md:358` bullet and both cross-reference lines, and restores the `CLAUDE.md` line to
`.gitignore` — which is harmless once the file is gone. No service, build, container, or
database is affected; there is no CI to re-run and nothing is deployed from these files.

Post-merge maintenance: `CLAUDE.md` is a snapshot. The mitigation baked into the outline is
to describe *conventions and wiring status* ("`bots/` is started from `server/index.js`
when `RUN_BOTS=true`; the rest are standalone tools run manually") rather than bare folder
lists, so the document degrades into "incomplete" rather than "wrong" when the tree moves.

## Tradeoffs

| Decision | Chosen | Rejected alternative | Why |
|----------|--------|----------------------|-----|
| Document location | Single root `CLAUDE.md` | Per-service `client/CLAUDE.md`, `server/CLAUDE.md`, … | Four files drift four ways and none answers "how do these talk"; a single entry point is the stated intent |
| Format | Table-first inventory, prose only for communication and gaps | All-prose narrative | Tables are scannable and diff cleanly; a reader looking up "what runs `launcher/`" finds it in one row |
| Fidelity | Directory- and convention-level | File-by-file enumeration | `client/src/assets/` alone has tens of thousands of files; enumeration would be obsolete on the next commit and would blow the 250-line cap |
| Gaps | Documented, not fixed | Fix `web/`, domain drift, CI, tests in the same change | Each is a separate design problem with real blast radius; mixing them makes this change unreviewable |
| Stale AGENTS.md line | Replaced in place, label kept | Bullet deleted outright | Deleting leaves no signal at the point of confusion; replacement actively corrects the reader's prior |
| Cross-ref position in AGENTS.md | Top, after Project Overview | Next to the corrected bullet at line 358 | Top placement is in the first screen every reader sees; it also states the authority split, which is the mitigation for the two-files-one-truth risk |
| README insertion language | Spanish | English | Spec requires the Spanish body be retained; a lone English line would be a regression |
| Length bound | Hard 150–250 with a 245 working ceiling and a ranked trim ledger (D14) | Soft target, or raising the bound to fit the correction | A hard bound is verifiable by `wc -l`; a soft one is not, and this doc's whole value is being short enough to read at session start. Raising the bound would trade the correction's cost against the document's only real constraint |
| Guarding factual claims | Source-level reconciliation (V14) that reads `client/src` | Document-string greps over `CLAUDE.md` | A doc-string grep over an authored document passes unconditionally; it is the exact defect that let a false statement ship past twelve green checks |
| Verification | Named shell checks V1–V14 | Adding a Markdown linter or a test script to the repo | Any added tooling file would itself violate the blast-radius requirement; ad-hoc greps stay outside the tree |
| Gitignore | Spec amended to allow the one-line deletion (D0-A, user-approved) | Strict three-file scope with `git add -f`, or leaving the file untracked | Leaving a `CLAUDE.md` entry in `.gitignore` while tracking `CLAUDE.md` is a trap for the next contributor; leaving it untracked defeats the proposal outright |
| `strict_tdd` gate | Skip the configured command, substitute V1–V14 | Run `objects-maker`'s `npm test` to satisfy the gate literally | That script is an asset pipeline; it needs uninstalled native deps and writes `output/` into the tree, breaking the blast-radius requirement it was supposed to guard |

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Apply writes `CLAUDE.md` but forgets the `.gitignore` deletion → the file never reaches the repository and the change silently achieves nothing | High (was the D0 blocker; now a procedural risk) | `.gitignore` is step 1 of rollout, before the file is written; V10 shows `?? CLAUDE.md` only if the rule is gone; V11 checks `git check-ignore` and the `0 1` numstat directly |
| Apply reaches for `git add -f` when the file looks invisible | Medium | Rollout step order removes the trigger; V11 states any `-f` in the transcript is an automatic fail |
| The `.gitignore` edit overreaches (tidying other rules, dropping `.claude`) | Medium | V11 asserts `0` insertions / `1` deletion and greps for the surviving `.claude`, `.env`, `NUL`, `logs/`, `auth.json` entries |
| **A `CLAUDE.md` claim about the codebase is asserted rather than grepped** — this already happened once and produced a shipped falsehood | **High** | Every factual row in [D12](#d12-how-services-talk-contract) now carries a file:line; V14 reconciles the client→API claim against source in both directions; V4b gives the other factual tokens source-side counterparts; the [tautology audit](#v-suite-tautology-audit) bans doc-only evidence for codebase facts |
| Apply over-corrects and swings to the opposite falsehood (a general client→API REST data path) | Medium | The [two-forbidden-wordings table](#two-forbidden-wordings-in-opposite-directions) names both failure modes; V5a greps for both families; V14.5 fails if a second endpoint is claimed |
| The corrected communication section pushes `CLAUDE.md` past 250 lines | Medium | [D14](#d14-line-budget-after-the-correction) projects 235 and sets a 245 working ceiling with 13 lines of ranked, pre-located trims; V2 enforces it |
| Diff-based checks read as vacuous passes because the paths are already staged | Medium | V8, V9 and V11 now specify both plain and `--cached` forms, and state that an empty result from both is a failure |
| `exploration.md` contains at least three unverified claims (`managers/`, `adminSockets` path, client REST framing) — others may remain | Medium | D11 corrections table is normative; V4/V5/V7 catch the specific known ones; apply must source from manifests, not from the exploration prose |
| Snapshot drift as `server/src/packages/*` and the tree evolve | Medium | Describe wiring status and conventions, not bare lists; keep line numbers out of the doc |
| Two root agent docs (`CLAUDE.md`, `AGENTS.md`) drift apart | Medium | Explicit authority split stated in both, via the D6 cross-reference and the `## Related documents` section |
| `AGENTS.md` keeps other stale content the spec forbids touching (`web/` listed as a live service, `Web ↔ API` bullet) | Low | Accepted; `CLAUDE.md` carries the correction. Log as a follow-up change |
| Scope creep pressure to fix the four documented gaps during review | Low | Spec forbids remediation; V10's `test -d web` / `test -d .github/workflows` checks make any drift fail loudly |
| `strict_tdd` gate pushes apply/verify to run the objects-maker "test", which writes `output/` into the tree | Medium | D9 documents the prohibition and the reason; the substitute suite is V1–V14; V10 would catch the generated directory if it ever ran |

## Open questions for the parent

1. Should the `openspec/config.yaml` test-command misdetection (`strict_tdd: true` pointed
   at an asset pipeline) be filed as its own follow-up change now, or left for whoever hits
   it next? Not blocking: D9 resolves it for this change.
2. `VITE_API_BASE_URL` and `VITE_API_URL` are consumed by `client/src` but absent from
   `client/.env.example`. That is a pre-existing repository condition and fixing it would
   create a fifth path, so it stays out of scope — but `CLAUDE.md:67-68` presents
   `client/.env.example` as the source of client runtime configuration. Should
   `CLAUDE.md` note the omission as a fifth known gap (costing ~3 lines against the D14
   budget), or should it be filed as a follow-up change? Not blocking; apply may proceed
   with four gaps as the spec currently requires exactly four.

D0 is closed — Option A approved, spec amended, contract captured in
[D0](#d0-resolved-the-gitignore-line-is-deleted) and V11.

The client→API defect is closed at the design level: the spec is amended, D12 carries the
true shape, D5 carries the corrected `AGENTS.md` text, D13 the domain-drift attribution,
D14 the line budget, and V14 the source-level check that makes the claim falsifiable. No
blocking questions remain; re-apply may proceed.
