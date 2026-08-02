# Exploration: create-project-claude-md

## Goal

Build a root `CLAUDE.md` that accurately explains the repository structure, with
explicit, correct coverage of `client/` services layer, `server/`, `api/`, and every
other surface. This document records what was found in the repo so the plan/apply
phases can write CLAUDE.md without re-discovering facts.

## Repository surfaces (top level)

| Path | Real stack | Entry point | Build/run/test commands (verified from source) |
|---|---|---|---|
| `client/` | Vue 3.5 + Phaser 3.87 + Pinia 3 + Vite 6, socket.io-client 4.8 | `client/index.html` → `client/src/main.js` | `npm run dev` (vite); `npm run build` (`node --max-old-space-size=4096 node_modules/vite/bin/vite.js build`); `npm run preview`; `npm run jsonmin` / `jsonunmin` (scripts/jsonmin.cjs, jsonunmin.cjs). No test script. |
| `server/` | Node.js (CommonJS) + Express 4.21 + Socket.IO 4.8 + mariadb driver 3.4 | `server/index.js` | `npm start` (`node index.js`); `npm run dev` (`nodemon index.js`, config in `server/nodemon.json`). No test script. |
| `api/` | PHP 8.2, Laravel 12, Laravel Passport 12, Backpack (filemanager, permissionmanager, theme-coreuiv4), Stripe SDK, l5-swagger | `api/public/index.php` (standard Laravel front controller) | `composer install`; `php artisan serve` (composer `dev` script runs serve+queue:listen+`npm run dev` concurrently); tests via `./vendor/bin/phpunit`; lint via `./vendor/bin/pint` (both referenced in AGENTS.md and confirmed by composer require-dev entries `laravel/pint`, `phpunit/phpunit`). |
| `launcher/` | Electron 26 (electron-builder 26) | `launcher/main.js` | `npm start` (`electron .`); `npm run build` (`electron-builder --win`, NSIS installer, multi-language). References `../web/public/favicon/...` in `package.json` build config — a dangling reference to the `web/` service that is **not present in this repo** (see below). |
| `docker/` | Infra scripts/config, not a runnable service | n/a | `docker/manager.sh`, `docker/backup-docker-uploads.sh`, `docker/restore-docker-uploads.sh`, `docker/db/init/create_databases.sql` (creates the two MariaDB schemas), `docker/nginx/*` (nginx-proxy vhost/gzip/CORS confs for `boommania.com`/`www.boommania.com` — note: filenames say "boommania" though env vars say "boombang.com", a naming drift worth flagging but not fixing here). |
| `doc/` | Markdown design/architecture notes + `doc/screenshots/*.png` used by README | n/a | Files: `AVATAR_SYSTEM_REFACTOR.md`, `BOT_SYSTEM_ARCHITECTURE.md`, `BOT_SYSTEM_FINAL.md`, `BOT_SYSTEM_IMPLEMENTATION.md`, `BOT_SYSTEM_INSTALLATION.md`, `BOT_SYSTEM_SIMPLIFIED.md`, `CACHE_CLEANUP_RECOMMENDATIONS.md`, `CACHE_OPTIMIZATION_README.md`, `CACHE_SYSTEM_README.md`, `CLIENT_VERSION_SYSTEM.md`, `REFACTOR_SUMMARY.md`, `bots_functional_spec.md`, `cache.md`. Multiple overlapping "BOT_SYSTEM_*" docs suggest doc drift/duplication (5 separate bot docs) — CLAUDE.md should link to `doc/` rather than duplicate its content. |
| `agent_tasks/` | Empty working directory (only `.gitignore`) | n/a | No committed content; likely a scratch area for agent-generated task files, gitignored. |
| `backups/` | Empty working directory (only `.gitignore`) | n/a | No committed content; target for `docker/backup-docker-uploads.sh` output. |
| `boombang_api.sql` | Root-level SQL dump (single file) | n/a | Not referenced by docker-compose or docs found; likely a manual DB seed/backup snapshot. Worth a one-line mention only. |
| `.github/instructions/copilot.instructions.md` | GitHub Copilot repo instructions (Spanish) | n/a | No `.github/workflows/*` exist — there is currently **no CI pipeline** in this repo, contrary to any assumption of automated testing/linting on push. |
| `web/` (referenced but absent) | N/A | N/A | `docker-compose.yml` still defines a full `web` service (Laravel-based public site) and root `README.md` explicitly says: "`docker-compose.yml` también conserva la configuración de un servicio `web/`... pero ese directorio no está incluido actualmente en este repositorio." `launcher/package.json` also references `../web/public/favicon/...`. CLAUDE.md must document this as a known gap, not assume `web/` exists. |

Top-level dirs also present but not required to document in depth: `.git/`, `LICENSE.txt`, `.env.example` (root, orchestrates docker-compose vars), `.gitignore`.

## `client/` internal layout (explicit ask)

Entry: `client/src/main.js` — creates the Vue app, installs Pinia, sets up i18n
(`client/src/plugins/i18n.js`), then dynamically imports `./sockets/socket` and calls
`socket.setupListeners()` after Pinia is ready before mounting `App.vue`.

Key directories under `client/src/`:

- `phaser/` — Phaser 3 game layer.
  - Scenes: `PublicScene.js`, `PrivateScene.js`, `MinigameScene.js`, `GlobalPreloader.js`.
  - `phaser/sockets/` — Phaser-side Socket.IO integration: `SceneRequestSockets.js` (emits),
    `SceneResponseSockets.js` / `PublicSceneResponse.js` (listens, dispatches to controllers).
  - `phaser/controllers/` — per-event game-logic handlers (`scene/`, `public-scene/`), e.g.
    `MoveUserController.js`, `UserSendChatController.js`, `ItemCollectPublicSceneController.js`.
  - `phaser/managers/` — cross-cutting runtime managers: `AvatarManager.js`,
    `CacheManager.js`, `AssetVersionManager.js`, `SmartAvatarSystem.js`, `TintManager.js`,
    `VisibilityManager.js`, `BackgroundAvatarLoader.js`.
  - `phaser/loaders/` + `phaser/preloaders/` + `phaser/load/` — asset loading pipeline
    (per-scene preloaders, per-avatar/per-item load definitions under `load/avatars/`,
    `load/cocos/`).
  - `phaser/animations/` — sprite animation definitions (`UserWalkAnimation.js`, etc.).
  - `phaser/html/` — DOM-overlay UI embedded in Phaser scenes (`ButtonsPublicSceneHtml.js`,
    `InventoryPrivateSceneHtml.js`, etc.).
  - `phaser/services/` — only one file found: `phaser/services/PrivateScene/PrivateSceneUpdateColorsService.js`.
    **This is the only thing literally named "service" in `client/src`.** There is no
    dedicated HTTP-client "services" folder.
- `sockets/socket.js` — the actual **HTTP-client-equivalent transport layer** for the
  client: a single `socket.io-client` instance configured with
  `import.meta.env.VITE_SERVER_URL`, exposing `setupListeners()` which wires
  `connect`/`connect_error`/`disconnect` to `stores/socketStore.js`. All game data (shop
  catalog, mail, islands, movement, chat, etc.) flows through this socket, not through
  REST calls from the client.
- `stores/` — Pinia stores: `socketStore.js` (connection state), `languageStore.js`,
  `LobbyStore.js`, `MailStore.js`, `NpcSubscriptionTest.js`. Small in count; most game
  state actually lives inside Phaser scene instances/managers, not Pinia, based on file
  count (5 stores vs. >100 phaser files).
- `views/` — Vue components split into `views/components/{auth,common,game,interface}/...`
  (UI pieces, deeply nested by feature: `game/lobby/`, `game/scenes/`, `game/scenes/user-card/`,
  `game/scenes/base-chat/`, `game/lobby/gachapon/`) and `views/screens/{auth,game}/...`
  (top-level route-like screens: `AuthScreen.vue`, `LobbyScreen.vue`, `GameSceneScreen.vue`,
  `IslandCreateScreen.vue`, etc.).
- `screens/auth/LoginScreen.vue` — a **second, separate** top-level screens location
  outside `views/screens/` (only one file); likely legacy/inconsistency, worth flagging
  as a minor structural inconsistency rather than a documented convention.
- `composables/` — `useTextFitting.js`, `useOverlayScrollbars.js`, `useGoogleSignIn.js`.
- `config/` — `gameConfig.js`, `cacheManagerConfig.js`.
- `enums/` — ~25 enum files mirroring server/API enums (e.g. `AvatarEnum.js`,
  `PublicSceneEnum.js`, `MinigameSceneEnum.js`) — duplicated conceptually with
  `api/app/Enums/*.php`, a cross-service convention worth naming once in CLAUDE.md.
- `utils/` — `ClientVersionManager.js` (checks/clears cache on version bump, called first
  in `main.js`), `SocketDebugUtil.js`, `MovementUtil.js`, `EventLimiter.js`,
  `EarlyEventBuffer.js`, etc.
- `assets/` — huge tree of sprites/audio/data JSON (tens of thousands of files); CLAUDE.md
  should describe this directory by category only, never enumerate it.

Confirmed via grep: no `axios`/`fetch()` usage tied to a `VITE_API_URL` exists in
`client/src` for game data; the only non-socket external calls are Google Sign-In
(`useGoogleSignIn.js`), reCAPTCHA (`VITE_RECAPTCHA_SITE_KEY`), and a static terms link
(`VITE_WEB_TERMS_URL`, pointing at the — currently absent — `web/` service). **This
contradicts AGENTS.md's claim of "Client ↔ API: Direct HTTP/HTTPS calls for
non-real-time data"** (see Prior art section below).

## `server/` internal layout (explicit ask)

Entry: `server/index.js` — registers global process error handlers, calls
`initializer()` (`src/config/initializer.js`), starts `GameClock`, builds the HTTP+Socket.IO
server via `src/config/server.js` (`(port) => ({ app, io, authorizedBotTokens })`),
mounts `app.use('/api', require('./src/routes/apiRoutes'))` for REST, then wires
`sockets(io, authorizedBotTokens)` from `src/sockets/index.js`, and optionally starts
`BotsPackage.main()` if `RUN_BOTS=true`.

- `src/config/server.js` — creates the plain HTTP server (SSL terminated upstream by
  nginx-proxy) and the Socket.IO server with CORS locked to `CLIENT_URL`; also exposes
  an internal endpoint `POST /internal/add-bot-token` used by the Laravel API to
  pre-authorize short-lived bot tokens (30s TTL).
- `src/sockets/` — Socket.IO event handlers, organized by domain: `authSockets.js`,
  `connectionSockets.js`, and `game/` subtree: `adminSockets.js`, `inventorySockets.js`,
  `lobbySockets.js`, `mailSockets.js`, `minigameSockets.js`, `npcSockets.js`,
  `objectSockets.js`, `shopSockets.js`, `userSockets.js`, and `game/scenes/`
  (`islandSockets.js`, `matchMakerSockets.js`, `privateScenesSockets.js`,
  `publicScenesSockets.js`, `scenesSockets.js`). `src/sockets/index.js` is the
  aggregator wired from `index.js`.
- `src/controllers/` — mirrors the socket domains 1:1 with per-action controller files
  under `game/{config,interactions,inventory,islands,lobby,matchmaker,minigames,npc,
  objects,private-scenes,scenes,shop,user}/` plus `auth/` and `connection/` — this is
  the real request-handling layer invoked by the socket handlers.
- `src/services-api/` — **the server's own HTTP client layer talking to the Laravel
  API**: one `*ApiService.js` file per domain (`UserApiService.js`, `ShopApiService.js`,
  `IslandApiService.js`, `MailApiService.js`, `MinigameApiService.js`, etc.) plus a base
  `ApiService.js`. This is the counterpart the user should compare against `client/src/phaser/services/`.
- `src/models/` — game data models (in-memory representations).
- `src/managers/` — game state managers (rooms/scenes runtime state).
- `src/collections/` — in-memory collections: `ConnectedUsersCollection.js`,
  `GameScenesCollection.js`, `MinigameInstancesCollection.js`,
  `MinigameScenesCollection.js`, `PrivateScenesCollection.js`, `PublicScenesCollection.js`.
- `src/boot/` — `LoadGameScenesBoot.js`, `LoadMinigameScenesBoot.js`,
  `LoadPublicScenesBoot.js` — scene bootstrapping run at server start.
- `src/config/database.js` — direct MariaDB connection config (uses the `mariadb` npm
  driver, not an ORM).
- `src/utils/` — `ConsoleLogger.js`, `GameClock.js`, etc.
- `src/packages/*` — standalone sub-packages/tools, **not part of the runtime server
  process** (no imports from `index.js` were found for most of these; they are
  developer tooling run manually):
  - `bots/` — `BotsPackage.js` (imported and conditionally run from `index.js` when
    `RUN_BOTS=true`), `models/Bot.js`, `services/BotService.js`. This is the only
    sub-package wired into the running server.
  - `avatar-atlas/GenerateAvatarAtlas.js` — standalone script, no package.json.
  - `crop-svg/index.html` — standalone HTML tool.
  - `invert-colors/index.js` — standalone script, own `.gitignore`, no package.json.
  - `map-generator/index.js` — standalone script, no package.json.
  - `objects-maker/` — has its own `package.json` (name `objects-maker`, deps `sharp`,
    `fs-extra`, `fluent-ffmpeg`, `ffmpeg-static`; scripts: `start`/`test` both run
    `node index.js`). Converts animation frames to animated WebP.
  - `rename-sprites-swf/rename_files.bat` — Windows batch utility.
  - `textures_maker/` — own `package.json` (`sharp` dependency only; no real `test`
    script, just an `echo`/`exit 1` placeholder).
  - `webp-converter/index.js` — standalone script with `input/`/`output/` gitignored dirs.
  CLAUDE.md should state clearly: these are **tooling packages with independent
  install/run steps (`cd server/src/packages/<name> && npm install && npm start`)**, not
  services loaded by `npm run dev`/`npm start` at the server root, except `bots/`.

## `api/` internal layout (explicit ask)

- Laravel version: **Laravel 12** (composer.json `laravel/framework: ^12.0`), PHP 8.2+.
- Auth: **Laravel Passport 12** for API tokens (`auth:api` middleware seen in
  `routes/api.php`), plus a custom `VerifyEmulatorToken` middleware
  (`App\Http\Middleware\VerifyEmulatorToken`) gating the whole "Boot Emulator API
  Routes" group — this is the shared-secret mechanism (`EMULATOR_API_TOKEN`/
  `API_EMULATOR_API_TOKEN`) used for server→api trust, matching AGENTS.md's description.
- Admin panel: **Backpack for Laravel** (`backpack/filemanager`,
  `backpack/permissionmanager`, `backpack/theme-coreuiv4`), controllers under
  `app/Http/Controllers/Admin/*CrudController.php` (confirmed: `UserCrudController.php`,
  `CatalogItemCrudController.php`, `IslandCrudController.php`,
  `MinigameCrudController.php`, `ServerManagementController.php`, etc.), custom admin
  routes in `routes/backpack/custom.php`.
- Routing: `routes/api.php` (REST — has a `test/auth/login` unauthenticated debug route
  plus the main `VerifyEmulatorToken`-gated group covering auth, public/game/minigame
  scene fetch, and a nested `auth:api`-gated group for user-specific game actions),
  `routes/web.php`, `routes/console.php`.
- Controllers layered per AGENTS.md's description and confirmed present:
  `Admin/` (Backpack CRUD), `Api/` (`Api/Auth/`, `Api/Bot/`, `Api/Game/{Catalog,Config,
  Interfaces,Lobby,Npc,Object,Scene}/`, `Api/User/`), and an `Internal/` group
  (`BotController`, `ShopController`, `StripeController`, `InventoryController`) used
  only by internal/emulator calls, matching the "Internal: for emulator-only endpoints"
  note in AGENTS.md.
- Enums: `app/Enums/*.php` — ~19 enum files (Avatar, CatalogItemType(s), Color*, Island
  Type, MenuType, MinigameSceneType, MinigameType, NpcTypes, Phaser*, PublicSceneType) —
  same conceptual set duplicated in `client/src/enums/` and referenced implicitly by
  `server/src/enums/` — cross-service enum sync is an unwritten convention worth one
  callout in CLAUDE.md.
- Migrations: not individually enumerated here (large `database/migrations/` tree);
  AGENTS.md's rule "Do NOT use `json` type in migrations - use `longText` instead" is a
  genuine, still-relevant convention to keep.
- Payments: `stripe/stripe-php` dependency present (`Internal/StripeController.php`
  found), matches README's "Integración preparada para pagos mediante Stripe."
- Dockerfile: `php:8.2-cli` base, builds GD with webp/jpeg/freetype, installs
  `pdo_mysql`/`zip`, installs Composer deps (`--no-dev`), installs Node 20 and runs
  `npm install && npm run build` for any Vite/asset build the API itself needs,
  registers a cron entry for `php artisan schedule:run`, final CMD runs `cron && php -S
  0.0.0.0:80 -t public`.

## `launcher/`, `docker/`, `doc/`, `agent_tasks/`, `backups/`, `boombang_api.sql`, `.github/`

- `launcher/` — Electron 26 app (`main.js`), single `BrowserWindow` loading
  `process.env.VUE_URL` (from `launcher/.env.example`: `VUE_URL=https://play.boommania.com/`
  — **note the domain is `boommania.com` here vs. `boombang.com` used everywhere else**,
  a naming inconsistency to flag, not silently "fix" in docs). Global shortcuts for
  DevTools (F1) and reload (F5/Ctrl+R). `electron-builder` config in `package.json`
  targets Windows NSIS installer with 6 language license files under `build/licenses/`.
- `docker/` — not a runnable service: `manager.sh` (helper script, not read in depth),
  `backup-docker-uploads.sh` / `restore-docker-uploads.sh`, `db/init/create_databases.sql`
  (creates `boombang_api`/`boombang_web` schemas consumed by the `db` compose service's
  init-scripts mount), `nginx/*.conf` (proxy vhosts/gzip/CORS for the local nginx-proxy
  setup), `ssl/` (gitignored certs dir).
- `doc/` — see table above; mostly feature-specific technical notes (avatar refactor,
  bot system x5 documents, cache system x3 documents, client version system) plus the
  screenshots README embeds. Significant duplication among the bot/cache docs suggests
  they accreted over time; CLAUDE.md should link to `doc/` as "additional technical
  notes," not attempt to reconcile or supersede them.
- `agent_tasks/` and `backups/` — both empty except a `.gitignore`; working/scratch
  directories with no committed structure to document beyond "gitignored, used for X."
- `boombang_api.sql` — a single root-level SQL file, not referenced by docker-compose or
  any script found in this exploration; likely a manual snapshot/import artifact.
- `.github/instructions/copilot.instructions.md` — Copilot-specific behavioral rules
  (Spanish), not general project documentation; no `.github/workflows/` exist, so there
  is no CI in this repo today.

## Inter-service communication (confirmed from source, not docs)

- **Client ↔ Server**: Socket.IO exclusively (`client/src/sockets/socket.js` →
  `io(import.meta.env.VITE_SERVER_URL)`; server-side `src/config/server.js` builds the
  Socket.IO server and `src/sockets/index.js` wires per-domain handlers). All game
  actions (movement, chat, shop, mail, islands, minigames) go through socket events
  handled by `src/controllers/game/**`.
  - Also **Client → Server via plain REST**: `server/src/routes/apiRoutes.js` mounted at
    `/api` on the same Express app (not just sockets) — worth confirming its exact
    consumers in a follow-up if the plan phase needs endpoint-level detail; not fully
    enumerated in this pass.
- **Server ↔ API**: HTTP calls from `server/src/services-api/*ApiService.js` to the
  Laravel API, authenticated via `EMULATOR_API_TOKEN` (server env) validated by
  `VerifyEmulatorToken` middleware (API side) — matches AGENTS.md.
- **API → Server**: reverse channel exists too — `POST /internal/add-bot-token` on the
  server, intended to be called by the Laravel API to pre-authorize a bot token
  (`API_EMULATOR_DOCKER_URL`/`SERVER_EMULATOR_URL` env vars support this direction).
  This bidirectional relationship is not mentioned in AGENTS.md and should be added.
  Also: `App\Console\Commands\RestartServerCommand.php` in `api/` — API can trigger a
  server restart (worth naming, not detailing).
- **Client ↔ API**: **No direct HTTP/REST calls to the API were found from
  `client/src`.** The only client env pointing at anything web/API-ish is
  `VITE_WEB_TERMS_URL` (a static link to the absent `web/` service) and
  `VITE_RECAPTCHA_SITE_KEY`/Google Sign-In (third-party, not the Laravel API). This
  directly contradicts AGENTS.md's "Client ↔ API: Direct HTTP/HTTPS calls for
  non-real-time data" bullet — **that line is stale and must be corrected or dropped**
  in CLAUDE.md.
- **Shared DB**: single MariaDB instance/container (`mariadb:11`), two logical
  databases `boombang_api` and `boombang_web` created by
  `docker/db/init/create_databases.sql`. `server/` connects directly to
  `boombang_api` via its own `mariadb` driver connection (`SERVER_DB_DATABASE=boombang_api`
  in root `.env.example`) — i.e., **server and api share the same schema/database**,
  which is an important, undocumented architectural fact (not an ORM/ownership
  boundary — server does raw queries against the same tables Laravel manages).
- **Env vars** (root `.env.example`): namespaced per service (`API_*`, `WEB_*`,
  `SERVER_*`, `CLIENT_*`, `PMA_*`) and passed into `docker-compose.yml` as container
  `environment:` entries, each service then also loads its own `<service>/.env`
  (`env_file:`) for internals. No real secrets present — all sensitive-looking values
  are placeholders (`CHANGE_ME_EMULATOR_API_TOKEN`, `CHANGE_ME_RECAPTCHA_SITE_KEY`) or
  local dev defaults (`root`/`root` DB creds). Same pattern holds in `api/.env.example`,
  `server/.env.example`, `client/.env.example`, `launcher/.env.example` — none contain
  live credentials.

## Prior art: `AGENTS.md` and `README.md`

### `AGENTS.md` (root, targets Codex)

Already documents, accurately and reusably:
- The 5-surface split (api/web/server/client/launcher) — though `web/` is not actually
  present in the repo (see gap above); AGENTS.md doesn't flag this.
- Docker Compose essential commands, service endpoints/hosts.
- API hexagonal-ish Services/Repositories/Resources/Controllers convention and CRUD
  generation commands — verified plausible against controller file layout found.
- Backpack admin CRUD structure and filter/trait conventions.
- DB convention: no `json` migrations, use `longText`.
- Server structure list (`src/config`, `src/sockets`, `src/models`, `src/services`,
  `src/services-api`, `src/controllers`, `src/managers`, `src/utils`,
  `src/packages/bots`) — accurate but incomplete: **missing `src/collections/` and
  `src/boot/`**, both confirmed present and structurally significant.
- Client structure list — accurate at a glance but does not correctly name the
  "services layer" the user asked about; conflates Phaser's `services/` (1 file) with
  the real transport layer (`sockets/socket.js` + `stores/`). Does not mention
  `views/screens/` vs. `screens/` duplication, nor `client/src/enums/`.
- Testing/Linting section is accurate: no test suite for server/client; phpunit/pint
  for API.
- Language convention (respond in Spanish/Russian, code comments mostly Spanish) and
  git workflow/commit-message convention (Codex-specific attribution footer) — this
  latter part is **tool-specific to Codex** and should not be copied verbatim into
  CLAUDE.md; Claude Code has its own commit-attribution conventions.
- **Stale/inaccurate claim**: "Client ↔ API: Direct HTTP/HTTPS calls for non-real-time
  data" — contradicted by source (see communication section above). Must be corrected,
  not repeated, in CLAUDE.md.
- Does not mention: `server/src/collections/`, `server/src/boot/`, the
  `POST /internal/add-bot-token` reverse channel, the shared-database fact, the
  `web/` service being absent from the repo, `docker/`, `doc/`, `agent_tasks/`,
  `backups/`, `boombang_api.sql`, or `.github/`.

### `README.md` (root, Spanish, user-facing/marketing + setup)

Documents accurately and with more nuance than AGENTS.md on some points:
- Explicitly and correctly notes the `web/` service gap: "`docker-compose.yml` también
  conserva la configuración de un servicio `web/`... pero ese directorio no está
  incluido actualmente en este repositorio" (twice, in the architecture table note and
  in the setup steps note). **This is the single most important structural fact
  CLAUDE.md must carry forward, and AGENTS.md is missing it.**
- Correct architecture diagram: Client (Vue+Phaser) ↔ Socket.IO ↔ Server (Node.js) ↔
  HTTP ↔ API (Laravel) ↔ MariaDB (`boombang_api`) — this diagram is consistent with what
  was found in source and should anchor CLAUDE.md's architecture section.
  Note the README diagram omits any client→api arrow entirely, consistent with the
  source-code finding that no such direct call path exists — reinforcing that
  AGENTS.md's contradicting claim is the stale one.
  Note also the diagram doesn't show the reverse `API → Server` bot-token channel.
  Note also the diagram doesn't show client's own `/api` route mounted server-side.
- Full local setup walkthrough (docker network creation, `.env` copies for
  root/api/server/client — **note: no `launcher/.env` copy step**, even though
  `launcher/.env.example` exists), hosts file entries, migration/seed/passport:install
  commands, useful command list, `docker-clean.ps1` Windows cleanup script reference.
- Tech stack summary table per directory (client/server/api/launcher/docker) matching
  what was verified in package.json/composer.json.
- Feature/status marketing content (game systems status table, galleries, screenshots)
  — this is **not relevant to a technical CLAUDE.md** and should not be duplicated;
  CLAUDE.md can reference README for "what the product does" and focus itself on "how
  the code is organized and how to work in it."
- Points to `doc/` for avatar/bot/cache/version-control documentation.

### Recommendation: CLAUDE.md vs AGENTS.md relationship

CLAUDE.md should be the **authoritative, corrected, structurally complete** technical
map of the repo (all surfaces, correct client/server/api internals, correct
inter-service communication, the `web/`-gap fact). It should **not duplicate**
AGENTS.md's Codex-specific conventions (commit footer, "respond in Codex's detected
language" framing) verbatim, but the two files inevitably overlap heavily on Laravel
CRUD/Backpack conventions and docker commands. Two viable approaches for the plan
phase to choose between:
1. **CLAUDE.md supersedes AGENTS.md for structure/architecture**, and AGENTS.md is
   trimmed/updated later (out of scope for this change) to cross-reference CLAUDE.md
   instead of re-describing structure — reduces future drift.
2. **CLAUDE.md references AGENTS.md** for Codex-specific workflow conventions it
   intentionally does not restate, while owning the structural map itself.
Either way, CLAUDE.md must not blindly copy AGENTS.md's inaccurate client↔API claim or
its incomplete server directory list — this exploration found concrete corrections
that should not be silently perpetuated.

## Risks

- **Structure is a moving target**: `server/src/packages/*` mixes one live subsystem
  (`bots/`) with several disconnected one-off scripts; if new packages are added/removed
  without updating CLAUDE.md, the doc will drift quickly. Recommend CLAUDE.md state the
  distinction ("wired into the server" vs "standalone tool, run manually") rather than
  just listing folder names, so it ages better.
- **`web/` absence**: any CLAUDE.md content must not assume `web/` exists; if it
  reappears later, docs must be updated (flag as a known follow-up, not fixed here).
- **Domain-name drift**: `boombang.com` (used in root `.env.example`, docker-compose,
  README, AGENTS.md) vs `boommania.com` (used in `launcher/.env.example`,
  `docker/nginx/*` filenames, `launcher/package.json` productName/appId "BoomMania").
  This is a real, pre-existing inconsistency in the codebase, not a documentation bug —
  CLAUDE.md should note it factually rather than silently pick one name.
- **No secrets found** in any `.env.example` reviewed (root, api, server, client,
  launcher) — all sensitive-looking fields are placeholders or local dev defaults. Low
  risk here, but CLAUDE.md should still avoid ever suggesting real credentials be
  pasted into it.
- **Doc drift in `doc/`**: five separate bot-system markdown files and three
  cache-system files exist; likely superseding one another over time. This exploration
  did not diff their content (out of scope/budget); CLAUDE.md should link to `doc/`
  generically rather than pick a "winning" bot doc without further investigation.
- **No CI**: absence of `.github/workflows/` means nothing currently enforces
  pint/phpunit on push; CLAUDE.md should not imply CI gates exist.
- **Client REST endpoint at `/api` on the server** (`server/src/routes/apiRoutes.js`)
  was found mounted but not fully explored (consumers/purpose not enumerated in this
  pass) — flag for the plan/apply phase to inspect briefly if endpoint-level accuracy
  is needed, or describe at a high level only ("server also exposes a small REST
  surface").
