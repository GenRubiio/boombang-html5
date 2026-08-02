# Project Documentation Specification

## Purpose

Define the required content, structure, and factual-accuracy constraints for the
repository's root-level agent- and contributor-facing documentation: `CLAUDE.md`
(authoritative structural/architecture map), `AGENTS.md` (Codex-specific workflow
conventions), and `README.md` (setup and product overview).

Every requirement below is verifiable by reading the resulting Markdown files and
comparing them against source manifests (`package.json`, `composer.json`,
`docker-compose.yml`, and the directory tree), against application source under
`client/`, `server/`, and `api/`, or by running a `git` query. Claims about how the
services actually talk are verified against source code, never against the wording of
the document that makes the claim. No
requirement asks for code, application-configuration, or infrastructure changes. The
single non-Markdown edit is the deletion of one line from `.gitignore`, which is required
only so that `CLAUDE.md` can be committed at all, and which affects no build, service, or
deployment.

## Acceptance Criteria

- [x] `CLAUDE.md` exists at the repository root, is written in English, and contains all
      five required sections.
- [x] Every top-level surface appears in the surface inventory table with a correct
      stack, entry point, and command set.
- [x] Every command quoted in `CLAUDE.md` resolves to a real script in the corresponding
      manifest; no invented `test` script for `client/` or `server/`.
- [x] The inter-service communication section states that gameplay client-to-server
      traffic is Socket.IO exclusively **and** that exactly one narrow non-gameplay
      client-to-API HTTP path exists (Stripe checkout-session creation); it also contains
      the `EMULATOR_API_TOKEN`, bot-token reverse channel, and shared-database facts.
- [x] `client/src/sockets/socket.js`, `client/src/phaser/services/`,
      `server/src/collections/`, and `server/src/boot/` are all named correctly.
- [x] The known-gaps section documents the missing `web/` directory, the domain drift,
      the absence of CI, and thin test coverage — factually, without remediation. In
      particular the domain-drift entry attributes `boombang.com` only to files that
      contain that literal, and does not attribute it to `docker-compose.yml`.
- [x] `CLAUDE.md` body length falls within the 150–250 line target.
- [x] `AGENTS.md` no longer contains the stale direct client-to-API line, its replacement
      bullet states the true narrow Stripe path rather than denying all client-to-API
      traffic, and it carries a cross-reference to `CLAUDE.md`.
- [x] `README.md` carries a cross-reference to `CLAUDE.md`.
- [x] Exactly four repository paths are created or modified: `CLAUDE.md` (created),
      `AGENTS.md`, `README.md`, and `.gitignore`.
- [x] `.gitignore` no longer contains the line `CLAUDE.md`; its diff is one deletion and
      zero insertions, and the adjacent `.claude` entry survives.
- [x] `git check-ignore CLAUDE.md` exits non-zero, and `CLAUDE.md` is visible in
      `git status --porcelain --untracked-files=all`.
- [x] The verification suite contains at least one check that reconciles `CLAUDE.md`'s
      client-to-API claim against `grep -rn "fetch(\|axios" client/src` output, and no
      check validates that claim solely by grepping `CLAUDE.md` itself.

## Requirements

### Requirement: Root CLAUDE.md With Required Sections

The repository MUST contain a file `CLAUDE.md` at its root. The file MUST be written in
English and MUST contain, as distinct headed sections, all of the following:

1. A surface inventory table covering every top-level surface.
2. A per-surface internals description for `client/`, `server/`, and `api/`.
3. An inter-service communication section ("how services talk").
4. A pointer section to `doc/` for deep-dive technical notes.
5. A "Known gaps / inconsistencies" section.

The file MUST NOT restate `AGENTS.md`'s Codex-specific conventions (commit-attribution
footer, response-language framing) and MUST NOT duplicate `README.md`'s product,
feature-status, or screenshot content.

#### Scenario: All required sections present

- GIVEN a reader opens `CLAUDE.md` at the repository root
- WHEN they scan its headings top to bottom
- THEN they find a surface inventory table, per-surface internals for `client/`,
  `server/`, and `api/`, an inter-service communication section, a `doc/` pointer
  section, and a "Known gaps / inconsistencies" section
- AND the document is written in English

#### Scenario: A required section is missing

- GIVEN `CLAUDE.md` exists but has no "Known gaps / inconsistencies" section
- WHEN the change is verified
- THEN verification fails, because all five sections are mandatory

#### Scenario: No duplication of sibling documents

- GIVEN a reader compares `CLAUDE.md` against `AGENTS.md` and `README.md`
- WHEN they look for the Codex commit-footer convention or README's feature-status and
  screenshot galleries
- THEN neither appears in `CLAUDE.md`

### Requirement: Surface Inventory Table Covers Every Top-Level Surface

The surface inventory table in `CLAUDE.md` MUST contain one row for each of:
`client/`, `server/`, `api/`, `launcher/`, `docker/`, `doc/`, `agent_tasks/`,
`backups/`, `boombang_api.sql`, and `.github/`.

Each row MUST state the path, the real stack, the entry point (or `n/a` for
non-runnable surfaces), and the build/run/test commands (or `n/a`).

The table MUST also account for `web/` as referenced-but-absent, either as an explicit
row or via the "Known gaps / inconsistencies" section.

#### Scenario: Every surface has a row

- GIVEN the surface inventory table in `CLAUDE.md`
- WHEN a reader looks up any of `client/`, `server/`, `api/`, `launcher/`, `docker/`,
  `doc/`, `agent_tasks/`, `backups/`, `boombang_api.sql`, or `.github/`
- THEN each one is present exactly once with a path, stack, entry point, and command
  column filled in (using `n/a` where a column does not apply)

#### Scenario: Non-runnable surfaces are not given fake entry points

- GIVEN the rows for `docker/`, `doc/`, `agent_tasks/`, `backups/`, and
  `boombang_api.sql`
- WHEN a reader reads their entry-point column
- THEN each reads `n/a` rather than naming a non-existent executable entry point

### Requirement: Quoted Commands Match Real Manifests

Every build, run, or test command quoted anywhere in `CLAUDE.md` MUST correspond to a
script that actually exists in the relevant manifest:

- `client/package.json` scripts: `dev`, `build`, `preview`, `jsonmin`, `jsonunmin`.
- `server/package.json` scripts: `start`, `dev`.
- `api/composer.json`: the `dev` script, plus `./vendor/bin/phpunit` and
  `./vendor/bin/pint` from `require-dev`.
- `launcher/package.json` scripts: `start`, `build`.

`CLAUDE.md` MUST NOT quote a `test` script for `client/` or `server/`, because neither
manifest defines one. Where standalone tooling under `server/src/packages/*` has its own
manifest, `CLAUDE.md` MUST show its independent install/run form (for example
`cd server/src/packages/<name> && npm install && npm start`) rather than implying the
root server scripts cover it.

#### Scenario: Client commands are verifiable

- GIVEN the `client/` row of the surface inventory table
- WHEN a reviewer cross-checks each quoted command against `client/package.json`
- THEN every quoted script name exists in that file's `scripts` object

#### Scenario: No invented test scripts

- GIVEN `client/package.json` and `server/package.json` define no `test` script
- WHEN a reviewer searches `CLAUDE.md` for a `npm test` command attributed to `client/`
  or `server/`
- THEN no such command appears; the absence of tests is described instead

#### Scenario: Standalone tooling shown with its own run steps

- GIVEN `server/src/packages/objects-maker/` and `server/src/packages/textures_maker/`
  each have their own `package.json`
- WHEN a reader reads how to run them in `CLAUDE.md`
- THEN they see an independent `cd server/src/packages/<name>` install-and-run form,
  not a root-level `server/` script

### Requirement: Inter-Service Communication Stated Per Source

The "how services talk" section of `CLAUDE.md` MUST state all of the following, and
MUST NOT contradict any of them elsewhere in the document:

- **Gameplay** client-to-server communication is Socket.IO exclusively, carried by the
  single transport module `client/src/sockets/socket.js`.
- Exactly one **non-gameplay** client-to-API HTTP path exists: Stripe checkout-session
  creation. It MUST be described with its real shape — a `POST` from
  `client/src/views/components/game/scenes/ShopComponent.vue:313` to
  `${VITE_API_BASE_URL}/api/stripe/create-checkout-session`, authenticated by a bearer
  token read from `localStorage` (`app_jwt`), with the base URL taken from
  `import.meta.env.VITE_API_BASE_URL` and falling back to `http://127.0.0.1:8000`
  (`ShopComponent.vue:306`). The receiving route is live at `api/routes/api.php:189-190`
  (`StripeController::createCheckoutSession`).
- That path MUST NOT be described as dead, hypothetical, or planned. It is reachable:
  `ShopComponent.vue` is imported by `GameSceneScreen.vue`, `PublicSceneScreen.vue`, and
  `PrivateSceneScreen.vue`, and `handleStripePayment()` is invoked at
  `ShopComponent.vue:277` and `ShopComponent.vue:415`.
- The boundary between the two is payment rail, not data volume: in the same component,
  gold/silver purchases are emitted over Socket.IO
  (`RequestSocketsEnum.PURCHASE_SHOP_ITEM`, `ShopComponent.vue:294`) while the Stripe
  purchase leaves over HTTP.
- The server additionally exposes a small REST surface mounted at `/api`
  (`server/src/routes/apiRoutes.js`), described at a high level only and not
  enumerated endpoint by endpoint.
- Server-to-API communication is HTTP from `server/src/services-api/*ApiService.js`,
  authenticated by `EMULATOR_API_TOKEN` and validated by the API's
  `VerifyEmulatorToken` middleware.
- An API-to-server reverse channel exists via `POST /internal/add-bot-token`.
- The server and the API share the same `boombang_api` MariaDB database; the server
  issues raw queries via the `mariadb` driver, so this is not an ORM ownership
  boundary.

Two opposite misstatements are both forbidden, and neither may appear in `CLAUDE.md` or
in any document this change edits:

| Forbidden claim | Why it is wrong |
|-----------------|-----------------|
| `Direct HTTP/HTTPS calls for non-real-time data` (or any wording implying a general client-to-API REST data path) | Overstates the surface. Only one endpoint is reachable from `client/src`, and it is a payment-initiation call, not a data-fetch channel. |
| `the client never calls the Laravel API directly`, `None`, `nothing in client/src calls the Laravel API` (or any absolute denial) | Falsified by `ShopComponent.vue:313`, which calls a live route. |

The section MUST additionally distinguish two things that are not the Stripe call:

- **API-host media URLs.** `client/src` builds asset URLs against the API host from
  `import.meta.env.VITE_API_URL` (`MailPanelComponent.vue:180`, which falls back to
  `http://api.boombang.com`; `ObjectsNpcModalComponent.vue:200` and `:211`). These are
  URL strings rendered by the browser, not `fetch`/`axios` calls issued by application
  code, and MUST NOT be counted as additional client-to-API call paths.
- **Third-party outbound links.** Google Sign-In, reCAPTCHA, and `VITE_WEB_TERMS_URL`
  MAY be mentioned, but MUST NOT be described as calls to the project's own API.

#### Scenario: The single client-to-API call path is described accurately

- GIVEN a reviewer runs `grep -rn "fetch(\|axios" client/src`
- WHEN they compare its output against the "how services talk" section
- THEN exactly one hit targets a project-API URL —
  `ShopComponent.vue:313`, `POST` to `/api/stripe/create-checkout-session` — and
  `CLAUDE.md` describes that hit, its bearer-token authentication, and its
  `VITE_API_BASE_URL` base URL
- AND the remaining hits (`MovementControlsController.js:183` and `AvatarManager.js:596`,
  both fetching local `/src/assets` paths) are correctly not described as API traffic

#### Scenario: Neither the overstated nor the absolute claim appears

- GIVEN `CLAUDE.md` after the change
- WHEN a reviewer searches it for `Direct HTTP/HTTPS calls`, for `never calls the
  Laravel API`, and for any sentence asserting that nothing in `client/src` reaches the
  API
- THEN none of them is found
- AND the wording that replaces them names the Stripe checkout-session path explicitly

#### Scenario: The Stripe route is shown to be live, not dead code

- GIVEN a reviewer wants to confirm the documented path is reachable
- WHEN they open `api/routes/api.php:189-190` and the three scene screens that import
  `ShopComponent.vue`
- THEN the route resolves to `StripeController::createCheckoutSession`
- AND `handleStripePayment()` is invoked at `ShopComponent.vue:277` and `:415`, so
  `CLAUDE.md`'s description of it as a live path matches source

#### Scenario: Gameplay traffic remains Socket.IO-exclusive

- GIVEN the same `ShopComponent.vue` performs both purchase kinds
- WHEN a reader compares the gold/silver purchase with the Stripe purchase
- THEN the gold/silver purchase is documented as a Socket.IO emit
  (`RequestSocketsEnum.PURCHASE_SHOP_ITEM`, line 294)
- AND the Stripe purchase is documented as the one HTTP exception, so no reader concludes
  that gameplay state is exchanged over HTTP

#### Scenario: Server-to-API trust mechanism is named

- GIVEN the inter-service communication section
- WHEN a reader looks for how the server authenticates to the API
- THEN they find `server/src/services-api/*ApiService.js`, `EMULATOR_API_TOKEN`, and
  `VerifyEmulatorToken` named explicitly

#### Scenario: Reverse channel and shared database are documented

- GIVEN the inter-service communication section
- WHEN a reader looks for how the API reaches the server and how data is shared
- THEN they find `POST /internal/add-bot-token` described as the API-to-server reverse
  channel
- AND they find the statement that server and API share the `boombang_api` database
  rather than communicating only through an ORM boundary

#### Scenario: Server REST surface described without enumeration

- GIVEN `server/src/routes/apiRoutes.js` is mounted at `/api`
- WHEN a reader reads about it in `CLAUDE.md`
- THEN it is described as a small REST surface at a high level
- AND no endpoint-by-endpoint listing is present

### Requirement: Factual Claims Are Verified Against Source, Not Against The Document

Every check that guards a factual claim about the codebase MUST compare the claim against
the codebase. A check that validates a claim solely by grepping the document that makes
the claim is tautological and MUST NOT be counted as verifying that claim.

This rule has a concrete trigger. The prior V5 check
`grep -qF 'Direct HTTP/HTTPS calls' CLAUDE.md` was the only check nominally guarding the
client-to-API claim. Because the author of `CLAUDE.md` chooses which strings to write,
grepping the authored document for a string the author elected to omit passes
unconditionally, whatever the codebase does. It asserted nothing about the system and
could never catch a false claim.

The verification suite MUST therefore include at least one **source-level reconciliation
check** for the client-to-API claim:

- It MUST run `grep -rn "fetch(\|axios" client/src` (or an equivalent that reads
  `client/src`, not `CLAUDE.md`).
- It MUST reconcile that output against what `CLAUDE.md` asserts, failing both when a
  project-API call exists that `CLAUDE.md` does not describe and when `CLAUDE.md`
  describes a call path that the grep does not support.
- Its expected result MUST be stated as a concrete set of hits, so the check fails if the
  set changes, rather than as "no output".

Document-string-presence and document-string-absence checks MAY be retained as a floor
for wording, but MUST NOT be presented as evidence that the described relationship is
true.

#### Scenario: A false claim is caught by the reconciliation check

- GIVEN a draft of `CLAUDE.md` that asserts the client never calls the Laravel API
- WHEN the source-level reconciliation check runs
- THEN it reports the `ShopComponent.vue:313` hit as an unreconciled project-API call
- AND verification fails, even though every document-string check still passes

#### Scenario: A tautological check is rejected

- GIVEN a proposed check that greps only `CLAUDE.md` for a string that `CLAUDE.md`'s
  author controls
- WHEN a reviewer asks what repository state would make that check fail
- THEN no such state exists
- AND the check is not accepted as verification of the factual claim

#### Scenario: The check tracks the codebase, not the prose

- GIVEN a future commit adds a second `fetch` to a project-API URL in `client/src`
- WHEN the reconciliation check runs against an unchanged `CLAUDE.md`
- THEN the hit set no longer matches the expected set and the check fails
- AND the failure points at the new call site rather than at document wording

### Requirement: Client And Server Internals Named Correctly

`CLAUDE.md` MUST identify `client/src/sockets/socket.js` as the client's transport
layer through which all game data flows, and MUST distinguish it from
`client/src/phaser/services/`, which contains a single Phaser-scene helper file and is
not an HTTP or transport services layer.

`socket.js` MUST NOT be described as the client's only outbound surface. It carries all
*gameplay* traffic; the Stripe checkout-session `fetch` documented in the inter-service
communication requirement sits outside it, and the two descriptions MUST agree.

`CLAUDE.md` MUST list `server/src/collections/` and `server/src/boot/` alongside the
other `server/src/*` directories, both of which are absent from `AGENTS.md` today.

`CLAUDE.md` MUST describe `server/src/packages/*` by wiring status — `bots/` is
conditionally started from `server/index.js` when `RUN_BOTS=true`, while the remaining
packages are standalone tools run manually — rather than listing folder names alone.

`CLAUDE.md` MUST describe `client/src/assets/` by asset category only and MUST NOT
enumerate its contents.

#### Scenario: Transport layer is not conflated with Phaser services

- GIVEN a reader wants to know where the client's outbound traffic is configured
- WHEN they read the `client/` internals section of `CLAUDE.md`
- THEN `client/src/sockets/socket.js` is named as the transport layer
- AND `client/src/phaser/services/` is explicitly described as a single-file Phaser
  helper directory, not the transport or HTTP layer

#### Scenario: Previously missing server directories are listed

- GIVEN the `server/` internals section of `CLAUDE.md`
- WHEN a reader scans the `server/src/*` directory list
- THEN `server/src/collections/` and `server/src/boot/` both appear with a one-line
  description of their role

#### Scenario: Packages described by wiring status

- GIVEN the description of `server/src/packages/*`
- WHEN a reader asks which packages run as part of the server process
- THEN `bots/` is identified as wired in behind `RUN_BOTS=true`
- AND the other packages are identified as standalone tools run manually

#### Scenario: Assets described by category

- GIVEN `client/src/assets/` contains tens of thousands of files
- WHEN a reader reads its description in `CLAUDE.md`
- THEN they find a category-level summary (sprites, audio, data JSON)
- AND no file-by-file or subdirectory-by-subdirectory enumeration

### Requirement: Known Gaps Section Documents Four Items Factually

`CLAUDE.md` MUST contain a "Known gaps / inconsistencies" section documenting all four
of the following, each stated as an observed fact about the current repository:

1. `web/` is referenced by `docker-compose.yml` and `launcher/package.json` but the
   directory does not exist in this repository.
2. Domain-name drift between `boombang.com` and `boommania.com`. Each side MUST be
   attributed only to files that contain that literal string:

   - `boombang.com` literals live in the root `.env.example` (the five `*_VIRTUAL_HOST`
     values at lines 5, 23, 42, 59, 67), `README.md`, and `AGENTS.md`.
   - `boommania.com` literals live in `launcher/.env.example` (`VUE_URL`),
     `launcher/main.js`, the launcher `electron-builder` `productName`/`appId`, the
     `docker/nginx/boommania.com` and `docker/nginx/www.boommania.com` filenames **and
     their contents**, and `docker/nginx/api-cors.conf:2`.
   - `docker-compose.yml` MUST NOT be listed as a `boombang.com` source. It contains no
     literal `boombang.com`. Its `boombang` occurrences are the Docker network name, and
     hostnames reach it only by `${*_VIRTUAL_HOST}` interpolation from `.env`. If
     `CLAUDE.md` mentions `docker-compose.yml` here at all, it MUST say that the
     hostnames arrive by interpolation from the root `.env.example`, not that
     `docker-compose.yml` uses `boombang.com` hostnames.
   - The sharpest instance MAY be noted: `docker/nginx/api-cors.conf:2` hard-codes
     `Access-Control-Allow-Origin "https://play.boommania.com"` while `.env.example:59`
     sets `CLIENT_VIRTUAL_HOST=play.boombang.com`, so the CORS origin the API advertises
     does not match the configured client host. This is stated as an observation only.
3. No CI pipeline exists — there are no `.github/workflows/*` files, so nothing enforces
   `pint` or `phpunit` on push.
4. Test coverage is thin or absent — no `test` script in `client/` or `server/`;
   `api/` has `phpunit` wired through Composer but coverage depth was not audited.

The section MUST document these gaps only. It MUST NOT remediate them: this change MUST
NOT create a `web/` directory, MUST NOT reconcile the domain names, MUST NOT add CI
workflows, and MUST NOT add test suites.

#### Scenario: All four gaps are documented

- GIVEN the "Known gaps / inconsistencies" section
- WHEN a reader reads it end to end
- THEN they find the missing `web/` directory, the `boombang.com` versus
  `boommania.com` drift, the absence of CI, and the thin/absent test coverage

#### Scenario: Gaps are documented, not fixed

- GIVEN the change is applied
- WHEN the repository tree and `git status` are inspected
- THEN no `web/` directory has been created, no `.github/workflows/*` file has been
  added, no domain string has been rewritten in any config file, and no test suite has
  been added

#### Scenario: Domain drift is attributed to the files that actually contain the literal

- GIVEN a reviewer runs `grep -n "boombang\.com" docker-compose.yml`
- WHEN they compare the result against the domain-drift gap entry in `CLAUDE.md`
- THEN the grep returns no matches
- AND `CLAUDE.md` does not claim that `docker-compose.yml` uses `boombang.com` hostnames;
  it attributes those literals to the root `.env.example`, `README.md`, and `AGENTS.md`,
  and describes `docker-compose.yml` as receiving them by `${*_VIRTUAL_HOST}`
  interpolation

#### Scenario: Missing web/ is stated with its references

- GIVEN a reader wants to know why `web/` appears in configuration
- WHEN they read the `web/` gap entry
- THEN it names both `docker-compose.yml` and `launcher/package.json` as the places
  that still reference the absent directory

### Requirement: Deep Dives Are Linked, Not Duplicated

`CLAUDE.md` MUST point to `doc/` for deep-dive technical notes on the avatar system, bot
system, cache system, and client version system by linking to the relevant files or
topics rather than restating their content inline.

`CLAUDE.md` MUST note that the `doc/` set contains overlapping documents — five
bot-system files and three cache-system files — and MUST state that reconciling that
duplication is out of scope for this document.

#### Scenario: doc/ topics are linked

- GIVEN a reader wants avatar, bot, cache, or client-version detail
- WHEN they read the `doc/` pointer section of `CLAUDE.md`
- THEN they find links or file references into `doc/`
- AND they do not find the content of those documents restated inline

#### Scenario: doc/ duplication is acknowledged without resolution

- GIVEN `doc/` contains five bot-system documents and three cache-system documents
- WHEN a reader reads the `doc/` pointer section
- THEN the overlap is stated as a known condition
- AND no single document is declared authoritative over the others

### Requirement: CLAUDE.md Length Target

The body of `CLAUDE.md` MUST be between 150 and 250 lines inclusive, so it stays
scannable as a session-entry document. If accuracy requires exceeding the upper bound,
the excess MUST be resolved by linking out to `doc/`, `README.md`, or `AGENTS.md`
rather than by dropping any required section.

#### Scenario: Length is within target

- GIVEN `CLAUDE.md` has been written
- WHEN its line count is measured
- THEN the count is at least 150 and at most 250

#### Scenario: Overflow is resolved by linking out

- GIVEN a draft of `CLAUDE.md` exceeds 250 lines
- WHEN it is trimmed
- THEN detail is replaced by links to `doc/`, `README.md`, or `AGENTS.md`
- AND all five required sections remain present

### Requirement: AGENTS.md Stale Claim Corrected And Cross-Referenced

`AGENTS.md` MUST NOT contain the line
`- **Client ↔ API**: Direct HTTP/HTTPS calls for non-real-time data`, because it implies
a general client-to-API REST data path that does not exist.

The replacement bullet MUST be accurate rather than an absolute denial. It MUST NOT say
`None`, MUST NOT say the client never calls the Laravel API directly, and MUST NOT assert
that all client traffic goes to the server over Socket.IO. Replacing an overstatement
with a confidently-worded falsehood is a net accuracy regression and fails this
requirement.

The replacement bullet MUST instead state the true shape in one line: gameplay traffic is
Socket.IO only, plus the single Stripe checkout-session `POST` from `ShopComponent.vue`
to `/api/stripe/create-checkout-session`. It MUST be derived from source, and MUST NOT
contradict `CLAUDE.md`'s inter-service communication section.

`AGENTS.md` MUST contain exactly one added cross-reference line directing readers to
`CLAUDE.md` as the authoritative source for repository structure and inter-service
communication.

No other line of `AGENTS.md` may be changed by this change: its Codex-specific commit
convention, response-language framing, Laravel CRUD command reference, and Backpack
conventions MUST remain byte-identical.

#### Scenario: Stale line is gone

- GIVEN the communication bullet list in `AGENTS.md`
- WHEN a reviewer greps for `Direct HTTP/HTTPS calls`
- THEN no match is found

#### Scenario: The replacement bullet is accurate, not an absolute denial

- GIVEN the `Client ↔ API` bullet in `AGENTS.md` after the change
- WHEN a reviewer checks it against `grep -rn "fetch(\|axios" client/src`
- THEN the bullet names the Stripe checkout-session `POST` as the one client-to-API path
- AND it contains neither `None` nor any claim that the client never calls the Laravel
  API directly

#### Scenario: Cross-reference is present

- GIVEN `AGENTS.md` after the change
- WHEN a reader looks for where the full structural map lives
- THEN a single line points them to `CLAUDE.md`

#### Scenario: No collateral edits

- GIVEN the diff for `AGENTS.md`
- WHEN a reviewer inspects it
- THEN it shows only the corrected/removed stale line and the one added cross-reference
  line
- AND the Codex commit-footer convention, language framing, CRUD command reference, and
  Backpack conventions are unchanged

### Requirement: README.md Cross-Reference Added Without Other Changes

`README.md` MUST contain exactly one added line pointing readers to `CLAUDE.md` for the
technical and structural map of the repository. Its existing setup walkthrough,
architecture diagram, tech-stack table, and product/marketing content MUST remain
unchanged, and it MUST retain its existing Spanish-language body.

#### Scenario: Cross-reference is present

- GIVEN `README.md` after the change
- WHEN a reader looks for where to find the structural/technical map
- THEN a single line points them to `CLAUDE.md`

#### Scenario: README content is otherwise untouched

- GIVEN the diff for `README.md`
- WHEN a reviewer inspects it
- THEN it shows exactly one added line and no other additions, deletions, or
  translations

### Requirement: CLAUDE.md Is Committable, Not Gitignored

The repository's root `.gitignore` currently contains, at line 6, the single entry
`CLAUDE.md`, which would make the new file invisible to `git status` and unstageable by
`git add .`, so the change would never reach the repository.

This change MUST delete that single line from `.gitignore`. It MUST NOT add, reorder, or
remove any other line of that file; in particular the adjacent `.claude` entry MUST
survive unchanged. The change MUST NOT rely on `git add -f` or on any other mechanism
that leaves a stale `CLAUDE.md` entry in `.gitignore`.

After the change, `CLAUDE.md` MUST be an ordinary trackable file.

#### Scenario: CLAUDE.md is no longer ignored

- GIVEN the change has been applied
- WHEN `git check-ignore CLAUDE.md` is run from the repository root
- THEN it exits non-zero and prints nothing, because no ignore rule matches the file

#### Scenario: CLAUDE.md is visible to git

- GIVEN `CLAUDE.md` has been written and nothing has been force-added
- WHEN `git status --porcelain --untracked-files=all` is inspected
- THEN `CLAUDE.md` is listed as an untracked-but-stageable file (`?? CLAUDE.md`), and
  after `git add CLAUDE.md` it is listed as added (`A  CLAUDE.md`)
- AND it is not invisible to git at any point

#### Scenario: The .gitignore edit is exactly one deletion

- GIVEN the diff for `.gitignore`
- WHEN `git diff --numstat -- .gitignore` is inspected
- THEN it reports zero insertions and one deletion
- AND the removed line is exactly `CLAUDE.md`
- AND `.claude`, the `.env*` entries, `NUL`, `logs/`, and the credential-file entries are
  all still present

### Requirement: Documentation-Only Blast Radius

This change MUST create or modify exactly four paths at the repository root, plus its own
OpenSpec change artifacts, and nothing else:

- `CLAUDE.md` — created.
- `AGENTS.md` — modified: one corrected line plus one added cross-reference line.
- `README.md` — modified: one added cross-reference line.
- `.gitignore` — modified: deletion of the single line `CLAUDE.md`, and nothing else in
  that file.

No file under `client/`, `server/`, `api/`, `launcher/`, `docker/`, or `doc/`, and no
other configuration, environment, schema, or infrastructure file, may be added, modified,
or deleted. `.gitignore` is permitted solely for the one-line deletion described above;
any other edit to it fails this requirement.

#### Scenario: Diff touches only the four permitted root files

- GIVEN the change has been applied
- WHEN `git status --porcelain --untracked-files=all` is inspected, ignoring `openspec/`
  artifacts
- THEN the only paths listed are `CLAUDE.md`, `AGENTS.md`, `README.md`, and `.gitignore`
- AND no fifth path appears

#### Scenario: .gitignore is not used as a general-purpose edit

- GIVEN the diff for `.gitignore`
- WHEN a reviewer inspects it
- THEN it contains only the removal of the `CLAUDE.md` line
- AND no ignore rule has been added, relaxed, or tightened

#### Scenario: Rollback is a plain revert

- GIVEN the change needs to be undone
- WHEN the commit is reverted
- THEN `CLAUDE.md` is removed, the two cross-reference lines plus the AGENTS.md
  correction are restored to their prior state, and the `CLAUDE.md` line is restored to
  `.gitignore`
- AND no running service, build, or deployment is affected
