# Proposal: create-project-claude-md

Add an authoritative, corrected `CLAUDE.md` at the repository root so any agent (or
human) working in this repo gets an accurate map of `client/`, `server/`, `api/`,
`launcher/`, `docker/`, `doc/`, and everything else — without re-deriving it from
source each time, and without inheriting the one stale claim currently in `AGENTS.md`.

## Quick path

1. Write `CLAUDE.md` at the repo root: a concise (~150–250 line), table-first
   structural overview of every surface, a corrected "how services talk" section, and
   links out to `doc/` for deep dives (no per-file enumeration, no duplication of
   `doc/` content).
2. In `AGENTS.md`, fix the single stale line ("Client ↔ API: Direct HTTP/HTTPS calls
   for non-real-time data" — no such path exists in source) and add one
   cross-reference line pointing to `CLAUDE.md` for the full structural map.
3. In `README.md`, add one cross-reference line pointing to `CLAUDE.md` for the
   technical/structural map (README keeps its setup + product-marketing role).
4. Verify: `CLAUDE.md` correctly names `client/src/sockets/socket.js` (not
   `phaser/services/`) as the client's transport layer, lists `server/src/collections/`
   and `server/src/boot/` (missing from `AGENTS.md` today), states the `web/`-service
   gap, the `boombang.com`/`boommania.com` domain drift, the absence of CI, and the
   thin/absent test coverage for client and server — all stated factually, none fixed
   in this change.

## Intent

Give every future agent session (and human contributor) a single, reliable,
up-to-date entry point that explains what each top-level directory is, what stack it
runs, how the services actually communicate (per source, not assumption), and where
to go for deeper detail — replacing tribal knowledge and a partially-stale
`AGENTS.md` claim with one document scoped specifically to structural accuracy.

## Problem statement

- `AGENTS.md` is the closest thing to a structural map today, but it is
  Codex-specific (commit-footer convention, "respond in Codex's detected language"
  framing) and contains one confirmed-stale claim: "Client ↔ API: Direct HTTP/HTTPS
  calls for non-real-time data." No such call path exists — client-server
  communication is Socket.IO exclusively; the client makes no direct calls to the
  Laravel API for game data. `AGENTS.md` is also missing `server/src/collections/`
  and `server/src/boot/`, and conflates Phaser's one-file `services/` folder with the
  client's real transport layer (`sockets/socket.js`).
- `README.md` is accurate on the points it makes (correctly flags the `web/` gap,
  has the right architecture diagram) but is Spanish-language, setup/marketing
  oriented, and does not aim to be a structural reference for agents.
- No document currently exists that is scoped purely to "how is this repo organized
  and how do its parts talk to each other," verified against source rather than
  assumption.

## Scope

In scope:
- New file: `CLAUDE.md` (repo root) — structural/architecture reference.
- `AGENTS.md`: one targeted correction (the stale Client↔API line) plus one added
  cross-reference line to `CLAUDE.md`. No broader restructuring.
- `README.md`: one added cross-reference line to `CLAUDE.md`. No other changes.

Out of scope (explicitly deferred):
- Broader restructuring or de-duplication of `AGENTS.md`'s Codex-specific content
  (commit-footer convention, language-detection framing, CRUD command reference) —
  future follow-up.
- Fixing the underlying gaps documented in `CLAUDE.md` (creating a `web/` directory,
  reconciling `boombang.com` vs `boommania.com`, adding a CI pipeline, adding test
  coverage). These are documented factually, not remediated, in this change.
- Reconciling or pruning the five overlapping bot-system docs and three cache-system
  docs under `doc/` — `CLAUDE.md` links to `doc/` generically rather than resolving
  that drift.
- Enumerating `server/src/routes/apiRoutes.js` endpoint-by-endpoint — described at a
  high level only ("server also exposes a small REST surface").

## `CLAUDE.md` content plan (decisions locked)

- **Length/depth**: concise overview, target ~150–250 lines. Table-first per-surface
  summary (path, real stack, entry point, build/run/test commands) mirroring the
  exploration table, followed by a short prose "how services talk" section and a
  "known gaps / inconsistencies" section. Internals of `client/`, `server/`, `api/`
  are described by directory/convention, not file-by-file; `client/src/assets/`
  described by category only, never enumerated.
- **Relationship to `doc/`**: link out to each relevant file/topic rather than
  duplicating content inline (avatar system, bot system, cache system, client version
  system) — explicitly note the doc/ set has some duplication (5 bot docs, 3 cache
  docs) and that `CLAUDE.md` is not the place to reconcile it.
- **Relationship to `AGENTS.md`**: `CLAUDE.md` becomes authoritative for repo
  structure and inter-service communication. `AGENTS.md` keeps its Codex-specific
  workflow/convention content (commit footer, language framing, Laravel CRUD command
  reference, Backpack conventions) but no longer needs to be the source of truth for
  structure — it gets one corrected line and one cross-reference line pointing readers
  to `CLAUDE.md`.
- **Relationship to `README.md`**: no content change to README's setup/marketing
  role; one line added pointing to `CLAUDE.md` for the technical structural map.
- **Known gaps section (all four, stated factually, not fixed)**:
  1. `web/` is referenced by `docker-compose.yml` and `launcher/package.json` but the
     directory does not exist in this repo.
  2. Domain-name drift: `boombang.com` (root `.env.example`, docker-compose, README,
     AGENTS.md) vs `boommania.com` (`launcher/.env.example`, `docker/nginx/*`
     filenames, launcher's electron-builder productName/appId).
  3. No CI pipeline exists (no `.github/workflows/*`); nothing currently enforces
     `pint`/`phpunit` on push.
  4. Test coverage is thin/absent: no test script in `client/` or `server/`;
     `api/` has `phpunit` wired via composer but coverage depth was not audited.

## Affected areas

- Root `CLAUDE.md` (new file).
- Root `AGENTS.md` (one line corrected, one line added).
- Root `README.md` (one line added).
- No code, config, or runtime behavior changes anywhere in `client/`, `server/`,
  `api/`, `launcher/`, `docker/`.

## Risks

- **Drift risk**: `CLAUDE.md` is a snapshot; if `server/src/packages/*` gains/loses
  standalone tools, or a `web/` directory is added back, the doc will go stale unless
  updated alongside those changes. Mitigated by describing conventions/distinctions
  (e.g., "wired into server" vs. "standalone tool, run manually") rather than just
  listing folder names, so it degrades gracefully rather than becoming flatly wrong.
- **Perceived authority conflict**: having both `AGENTS.md` and `CLAUDE.md` risks
  future contributors updating one and not the other. Mitigated by the explicit
  division of responsibility (CLAUDE.md = structure/architecture,
  AGENTS.md = Codex-specific workflow conventions) stated in both files via the
  cross-reference lines added in this change.
- **Scope creep temptation**: the "known gaps" section documents real inconsistencies
  (domain drift, missing `web/`) that could tempt a reviewer to ask for them to be
  fixed in the same change. Explicitly out of scope — this proposal documents, does
  not remediate.
- **Low blast radius**: all changes are additive/documentation-only edits to three
  Markdown files; no risk to running services, builds, or CI (there is no CI).

## Rollback

All changes are Markdown-only and additive/localized:
- Delete `CLAUDE.md` to fully revert its introduction.
- Revert the one corrected line and one added cross-reference line in `AGENTS.md`.
- Revert the one added cross-reference line in `README.md`.
No code, schema, environment, or infrastructure changes are involved, so rollback is
a plain `git revert` of the commit(s) in this change with no operational impact.

## Success criteria

- `CLAUDE.md` exists at the repo root, is ~150–250 lines, and accurately describes
  every top-level surface (`client/`, `server/`, `api/`, `launcher/`, `docker/`,
  `doc/`, `agent_tasks/`, `backups/`, `boombang_api.sql`, `.github/`) with correct
  stack/entry-point/command info matching what was verified in the exploration.
- The "how services talk" section correctly states: Client ↔ Server is Socket.IO
  exclusively (plus the server's own small `/api` REST surface, described at a high
  level); Server ↔ API is HTTP via `server/src/services-api/*ApiService.js`
  authenticated by `EMULATOR_API_TOKEN`/`VerifyEmulatorToken`; API → Server reverse
  channel exists via `POST /internal/add-bot-token`; server and API share the same
  `boombang_api` MariaDB database (not a strict ORM boundary); and there is **no**
  direct Client ↔ API HTTP path — correcting AGENTS.md's stale claim rather than
  repeating it.
- `CLAUDE.md` correctly identifies `client/src/sockets/socket.js` as the client's
  transport-layer equivalent of a "services" folder, distinct from the single-file
  `client/src/phaser/services/` directory, and lists `server/src/collections/` and
  `server/src/boot/` alongside the rest of `server/src/*`.
- A dedicated "Known gaps / inconsistencies" section in `CLAUDE.md` documents all
  four items (missing `web/`, domain drift, no CI, thin test coverage) factually.
- `AGENTS.md` no longer contains the stale "Client ↔ API: Direct HTTP/HTTPS calls"
  line and contains a cross-reference line to `CLAUDE.md`.
- `README.md` contains a cross-reference line to `CLAUDE.md`.
- No other content in `AGENTS.md` or `README.md` is altered; no source code, config,
  or infrastructure files are touched.
