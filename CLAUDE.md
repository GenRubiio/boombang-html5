# CLAUDE.md

This is the structural map of the BoomBang HTML5 repository: what each top-level surface
is, what stack it really runs, how to build or run it, and how the services actually talk
to each other. It is the authoritative source for those questions.
[AGENTS.md](AGENTS.md) keeps the Codex-specific workflow conventions and
[README.md](README.md) keeps the setup walkthrough and the product overview; this file
does not restate either of them. Every fact below was verified against the manifests, the
root `.env.example`, `docker-compose.yml`, and the source tree.

## Surface inventory

One row per top-level surface. n/a means the surface has no runnable entry point or no
build tooling of its own. All npm commands are run from inside the surface directory.

| Surface | Stack (verified) | Entry point | Build / run / test |
|---------|------------------|-------------|--------------------|
| `client/` | Vue 3.5, Phaser 3.87, Pinia 3, socket.io-client 4.8, Vite 6 (ESM) | `client/index.html` -> `client/src/main.js` | `npm run dev`, `npm run build`, `npm run preview`, `npm run jsonmin`, `npm run jsonunmin`; no test script |
| `server/` | Node.js CommonJS: Express 4.21, Socket.IO 4.8, mariadb 3.4, axios 1.10 | `server/index.js` | `npm start`, `npm run dev` (nodemon); no test script |
| `api/` | PHP 8.2, Laravel 12, Passport 12, Backpack (filemanager, permissionmanager, theme-coreuiv4), Stripe PHP 19, l5-swagger 9 | `api/public/index.php` | `composer install`, `composer run dev` (serve + queue listener + Vite); `cd api && ./vendor/bin/phpunit`, `cd api && ./vendor/bin/pint` |
| `launcher/` | Electron 26 with electron-builder 26 | `launcher/main.js` | `npm start` (Electron shell), `npm run build` (Windows NSIS installer) |
| `docker/` | Shell scripts, MariaDB init SQL, nginx-proxy vhost configs | n/a | `docker compose up -d` at the repo root; `docker/manager.sh`; `docker/backup-docker-uploads.sh`; `docker/restore-docker-uploads.sh` |
| `doc/` | Markdown technical notes and their images | n/a | n/a |
| `agent_tasks/` | Empty working directory, tracked only by its own ignore file | n/a | n/a |
| `backups/` | Empty working directory; destination of `docker/backup-docker-uploads.sh` | n/a | n/a |
| `boombang_api.sql` | Root-level SQL dump; not referenced by `docker-compose.yml` or any script | n/a | n/a |
| `.github/` | Only `.github/instructions/copilot.instructions.md`; no workflows directory | n/a | n/a |
| `web/` | Referenced by configuration but absent from this repository | n/a | n/a, see Known gaps |

Containers are wired by the root `docker-compose.yml` (`db` on `mariadb:11`, `phpmyadmin`,
`api`, `web`, `server`, `client`) and reached over the local hostnames declared in the root
`.env.example`: `api.boombang.com`, `play.boombang.com`, `server.boombang.com:3000`, and
`pma.boombang.com`.

## Inside client/

`client/index.html` loads `client/src/main.js`, which mounts `client/src/App.vue` with
Pinia and vue-i18n and hands rendering to Phaser.

**Transport layer.** `client/src/sockets/socket.js` is the client's transport module: all
gameplay data leaves and enters the client through that Socket.IO connection. It is not
the client's only outbound surface — see How services talk for the one Stripe checkout
`POST` that reaches the Laravel API over HTTP. It is also not to be confused with
`client/src/phaser/services/`, which is a single-file Phaser scene helper directory (one
colour-update service for the private scene) and is neither an HTTP nor a transport layer.

| Path | Role |
|------|------|
| `client/src/main.js`, `client/src/App.vue` | Vue bootstrap and root component |
| `client/src/sockets/` | transport layer, one module: `client/src/sockets/socket.js` |
| `client/src/stores/` | Pinia stores (socket, lobby, mail, language) |
| `client/src/views/` | Vue screens and components split by feature area |
| `client/src/screens/` | one legacy standalone screen: `client/src/screens/auth/LoginScreen.vue` |
| `client/src/phaser/` | the game itself: scenes, controllers, loaders, animations, models, managers, sockets, and the single-file `client/src/phaser/services/` helper |
| `client/src/composables/` | Vue composables (Google Sign-In, scrollbars, text fitting) |
| `client/src/config/` | game and cache-manager configuration |
| `client/src/enums/` | shared client-side enums |
| `client/src/plugins/` | vue-i18n setup |
| `client/src/utils/` | animation, movement, client-version, socket-debug helpers |
| `client/src/assets/` | game media and data, described by category below |

`client/src/assets/` holds tens of thousands of files and is never enumerated here. By
category it contains sprite and image sets for avatars, scenes, islands, minigames and UI
chrome; audio; data JSON consumed by Phaser loaders; per-locale translation bundles; and
stylesheets. The `jsonmin` and `jsonunmin` scripts in `client/package.json` exist to
minify and expand those data JSON files.

Client runtime configuration comes from `client/.env.example` (`VITE_SERVER_URL`,
feature flags, `VITE_RECAPTCHA_SITE_KEY`, `VITE_WEB_TERMS_URL`).

## Inside server/

`server/index.js` builds the HTTP and Socket.IO server through
`server/src/config/server.js`, runs `server/src/config/initializer.js`, mounts
`server/src/routes/apiRoutes.js` at `/api`, registers the socket handlers, and then starts
the bots package only when `RUN_BOTS=true`.

| Directory | Role |
|-----------|------|
| `server/src/boot/` | one-time load routines that populate the in-memory scene collections at startup |
| `server/src/collections/` | in-memory registries of live state: connected users, game, public, private and minigame scenes |
| `server/src/config/` | Express/Socket.IO server, database pool, initializer, bot configuration |
| `server/src/controllers/` | request and event handlers, grouped api / auth / connection / game |
| `server/src/enums/` | shared server-side enums |
| `server/src/instances/` | long-lived singletons such as the matchmaker and movement processor |
| `server/src/maps/` | action and block lookup maps used by the game loop |
| `server/src/models/` | plain data models for users, scenes, islands, NPCs, catalog items |
| `server/src/packages/` | standalone tooling plus the bots package, see below |
| `server/src/resources/` | serializers that shape models before they go out over the socket |
| `server/src/routes/` | the Express router mounted at `/api` |
| `server/src/services/` | server-side domain services (island, lobby, mail, minigame, object, scene, user) |
| `server/src/services-api/` | HTTP clients to the Laravel API, one `*ApiService.js` per domain |
| `server/src/sockets/` | Socket.IO handlers grouped by domain: auth, connection, and a `server/src/sockets/game/` tree covering lobby, inventory, mail, minigames, NPCs, objects, shop, users and scenes, plus `server/src/sockets/game/config/` and `server/src/sockets/game/admin/` subgroups |
| `server/src/tasks/` | discrete scheduled or queued game actions |
| `server/src/utils/` | logging, the game clock, mutexes, movement and text helpers |

Both `server/src/collections/` and `server/src/boot/` are missing from the directory list
in `AGENTS.md`; they are listed above because startup order and live state cannot be
understood without them.

**Packages by wiring status.** `server/src/packages/bots/` is the only package wired into
the running process: `server/index.js` requires `server/src/packages/bots/BotsPackage.js`
and starts it when `RUN_BOTS=true`. Everything else under `server/src/packages/` is a
standalone asset or maintenance tool run by hand, never covered by the root `server/`
scripts: `avatar-atlas`, `crop-svg`, `invert-colors`, `map-generator`, `objects-maker`,
`rename-sprites-swf`, `textures_maker`, `webp-converter`. Two of them carry their own
manifest and run independently with
`cd server/src/packages/<name> && npm install && npm start`
(`server/src/packages/textures_maker/` has no start script; it runs as `node index.js`).

The server talks to MariaDB through the raw `mariadb` driver configured in
`server/src/config/database.js`. There is no ORM on this side.

## Inside api/

Laravel 12 on PHP 8.2, served from `api/public/index.php`. Authentication for end users
runs through Laravel Passport; requests coming from the game server are authenticated
instead by the `EMULATOR_API_TOKEN` shared secret and validated by the
`api/app/Http/Middleware/VerifyEmulatorToken.php` middleware.

| Area | Where |
|------|-------|
| Routes | `api/routes/api.php` (game and public API), `api/routes/web.php`, `api/routes/backpack/custom.php` for admin |
| Controllers | `api/app/Http/Controllers/Admin/` (Backpack CRUD), `api/app/Http/Controllers/Api/`, and `api/app/Http/Controllers/Internal/` |
| Domain services | `api/app/Services/` covers socket notifications, bot conversation, mail, language detection, NPC catalog and traps, plus the `api/app/Services/AI/` and `api/app/Services/External/` integrations |
| Enums | `api/app/Enums/` mirrors much of `server/src/enums/` |
| Schema | `api/database/migrations/` is the source of truth for the shared database schema |
| Admin UI | Backpack with the CoreUI v4 theme, filemanager and permissionmanager |
| API docs | l5-swagger annotations; Stripe PHP powers the paid-credit flows |

Backpack CRUD scaffolding commands and the project's column conventions are documented in
[AGENTS.md](AGENTS.md) and are not repeated here.

## How services talk

**Gameplay is Socket.IO only, plus one narrow Stripe checkout `POST`.** The client opens a
single Socket.IO connection in `client/src/sockets/socket.js`, and all gameplay data —
chat, movement, inventory, lobby and scenes — travels over it.

**The one client-to-API HTTP path.** `client/src/views/components/game/scenes/ShopComponent.vue`
sends a `POST` to `${VITE_API_BASE_URL}/api/stripe/create-checkout-session` to open a
Stripe checkout session: base URL from `import.meta.env.VITE_API_BASE_URL` (falling back to
`http://127.0.0.1:8000`), bearer token read from `localStorage` under the key `app_jwt`,
receiving route declared in `api/routes/api.php` as
`StripeController::createCheckoutSession`. This is live code — `GameSceneScreen.vue`,
`PublicSceneScreen.vue` and `PrivateSceneScreen.vue` all import the component, and its
`handleStripePayment()` method is invoked from two call sites. The boundary is the payment
rail, not the data volume: the same component emits gold and silver purchases over
Socket.IO (`RequestSocketsEnum.PURCHASE_SHOP_ITEM`), and only the real-money purchase
leaves over HTTP.

**What is not a client-to-API call.** `client/src` builds media URLs against the API host
from `import.meta.env.VITE_API_URL` (the mail panel, the NPC objects modal) — URL strings
the browser resolves while rendering an image, not `fetch` or `axios` calls issued by
application code. Google Sign-In (`client/src/composables/useGoogleSignIn.js`), reCAPTCHA
and the terms page at `VITE_WEB_TERMS_URL` go to third parties, not to this project's API.

| Direction | Channel | Purpose |
|-----------|---------|---------|
| Client -> server | Socket.IO | all gameplay, chat, inventory, lobby and scene traffic |
| Client -> API | HTTP POST (Stripe checkout-session) | one-off payment initiation, not gameplay data |
| Server -> API | HTTP from `server/src/services-api/*ApiService.js` | read and write persistent game data |
| API -> server | `POST /internal/add-bot-token` (`server/src/config/server.js`) | pre-authorize a short-lived bot token |
| API -> server | the small REST surface at `/api` (`server/src/routes/apiRoutes.js`) | push credit and inventory notifications into live sockets |
| Server and API | shared `boombang_api` MariaDB database | persistent state |

**Server to API.** The server is an HTTP client of the Laravel API through the modules in
`server/src/services-api/`, one `*ApiService.js` per domain over a shared axios wrapper.
Every such request carries the `EMULATOR_API_TOKEN` shared secret, and the API validates
it with its `VerifyEmulatorToken` middleware. The token is supplied to both containers by
`docker-compose.yml` from the root `.env.example` entries `API_EMULATOR_API_TOKEN` and
`SERVER_EMULATOR_API_TOKEN`.

**API to server.** Two distinct reverse channels exist and they are not the same thing.
The first is `POST /internal/add-bot-token`, mounted directly in
`server/src/config/server.js`, which the API calls to pre-authorize a short-lived bot
token before a bot connects. The second is the small REST surface that
`server/src/routes/apiRoutes.js` exposes at `/api`: it is an inbound channel the Laravel
API calls (from `api/app/Services/SocketNotificationService.php`) to push credit and
inventory notifications into live socket sessions. It is described here at a high level on
purpose and is not a client entry point.

**Shared database.** The server and the API both use the `boombang_api` MariaDB database,
declared once in the root `.env.example` and created by
`docker/db/init/create_databases.sql`. The API reaches it through Eloquent while the
server issues raw queries through the `mariadb` driver, so this is a shared datastore
rather than an ORM ownership boundary: schema changes made in
`api/database/migrations/` affect server queries directly.

## Deep dives in doc/

`CLAUDE.md` links to these rather than restating them.

| Topic | Files |
|-------|-------|
| Avatar system | [`doc/AVATAR_SYSTEM_REFACTOR.md`](doc/AVATAR_SYSTEM_REFACTOR.md) |
| Bot system | [`doc/BOT_SYSTEM_ARCHITECTURE.md`](doc/BOT_SYSTEM_ARCHITECTURE.md), [`doc/BOT_SYSTEM_IMPLEMENTATION.md`](doc/BOT_SYSTEM_IMPLEMENTATION.md), [`doc/BOT_SYSTEM_INSTALLATION.md`](doc/BOT_SYSTEM_INSTALLATION.md), [`doc/BOT_SYSTEM_SIMPLIFIED.md`](doc/BOT_SYSTEM_SIMPLIFIED.md), [`doc/BOT_SYSTEM_FINAL.md`](doc/BOT_SYSTEM_FINAL.md), [`doc/bots_functional_spec.md`](doc/bots_functional_spec.md) |
| Cache system | [`doc/CACHE_SYSTEM_README.md`](doc/CACHE_SYSTEM_README.md), [`doc/CACHE_OPTIMIZATION_README.md`](doc/CACHE_OPTIMIZATION_README.md), [`doc/CACHE_CLEANUP_RECOMMENDATIONS.md`](doc/CACHE_CLEANUP_RECOMMENDATIONS.md), [`doc/cache.md`](doc/cache.md) |
| Client version system | [`doc/CLIENT_VERSION_SYSTEM.md`](doc/CLIENT_VERSION_SYSTEM.md) |
| Past refactors | [`doc/REFACTOR_SUMMARY.md`](doc/REFACTOR_SUMMARY.md) |

That set overlaps: there are five `BOT_SYSTEM_` documents and three `CACHE_` documents
covering the same two subsystems from different angles, and no single one of them is
declared authoritative over the others. Reconciling or pruning that duplication is out of
scope for this document.

## Known gaps / inconsistencies

Observed facts about the repository as it stands. This document records them; it does not
fix them.

1. **`web/` is referenced but absent.** `docker-compose.yml` defines a `web` service that
   builds from the `web/` directory and reads a `web/.env` file, and
   `launcher/package.json` points its Windows installer icon at a file under
   `web/public/`. Neither path exists in this repository, so a plain
   `docker compose up -d` cannot build the full stack as written, and `AGENTS.md` still
   lists `web/` as one of the five services.
2. **Domain-name drift.** `docker/nginx/api-cors.conf` hard-codes an
   `Access-Control-Allow-Origin` of `https://play.boommania.com` while the root
   `.env.example` sets `CLIENT_VIRTUAL_HOST=play.boombang.com`, so the CORS origin the API
   advertises is not the configured client host. `boombang.com` literals live in the root
   `.env.example` (its five `*_VIRTUAL_HOST` values), `README.md` and `AGENTS.md` —
   `docker-compose.yml` holds no such literal and receives those hostnames only by
   `${*_VIRTUAL_HOST}` interpolation. `boommania.com` literals live in
   `launcher/.env.example`, `launcher/main.js`, the electron-builder `productName`/`appId`
   in `launcher/package.json`, the two `docker/nginx/` vhost files named for it, and
   `docker/nginx/api-cors.conf`. Both names are live in configuration at once.
3. **No CI pipeline.** There is no `.github/workflows` directory; `.github/` contains only
   Copilot instructions. Nothing enforces `pint` or `phpunit` on push, so formatting and
   test regressions can only be caught locally.
4. **Test coverage is thin or absent.** Neither `client/package.json` nor
   `server/package.json` defines a test script, so those two surfaces have no automated
   tests at all. `api/` has phpunit wired through Composer and an `api/tests/` directory,
   but the depth of that coverage has not been audited.

## Related documents

| Document | Owns |
|----------|------|
| `CLAUDE.md` (this file) | repository structure, per-surface internals, inter-service communication |
| [AGENTS.md](AGENTS.md) | Codex-specific workflow conventions, Laravel CRUD scaffolding, Backpack and database conventions |
| [README.md](README.md) | local setup walkthrough, feature and product overview |
| [`doc/`](doc/) | deep dives on the avatar, bot, cache and client-version systems |
| [`openspec/`](openspec/) | spec-driven change proposals, specs, designs and task lists |
