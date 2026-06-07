# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

BoomBang HTML5 is a multiplayer game recreation with a microservices architecture containing five main services:

- **api/** - REST API built with Laravel (serves game data, user management, catalog)
- **web/** - Main website built with Laravel (frontend marketing/community site)
- **server/** - Game emulator written in Node.js (handles real-time game logic)
- **client/** - HTML5 game client using Vue 3, Vite, and Phaser (game rendering and UI)
- **launcher/** - Desktop launcher built with Electron

## Docker Development Environment

All services run via Docker Compose. Essential commands:

```bash
# Start all services
docker compose up --build

# Rebuild specific service
docker compose build server

# Run migrations and seed databases
docker compose exec api php artisan migrate --force --no-interaction --seed
docker compose exec web php artisan migrate --force --no-interaction --seed

# View logs
docker compose logs -f

# Access service shell
docker compose exec api bash
docker compose exec web bash
```

### Service Endpoints

- **MariaDB**: Internal databases `boombang_api` and `boombang_web`
- **api**: http://api.boombang.com (port 8000)
- **web**: http://boombang.com (port 8001)
- **server**: http://server.boombang.com:3000 (port 3000)
- **client**: http://play.boombang.com:5173

### Hosts Configuration

On Windows, add to `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 boombang.com
127.0.0.1 api.boombang.com
127.0.0.1 server.boombang.com
127.0.0.1 play.boombang.com
```

## API Service (Laravel)

### Architecture

Follows hexagonal architecture concepts with Services and Repositories (no Domain layer):

- **Services**: `app/Services/{EntityName}Service.php`
- **Repositories**: `app/Repositories/{EntityName}Repository/`
  - Contains `{EntityName}Repository.php` and `{EntityName}RepositoryInterface.php`
- **Resources**: `app/Http/Resources/{EntityName}Resource.php`
- **Controllers**:
  - Admin: `app/Http/Controllers/Admin/{EntityName}CrudController.php`
  - API: `app/Http/Controllers/Api/{EntityName}ApiController.php`
  - Internal: `app/Http/Controllers/Internal/` (for emulator-only endpoints)

### Common Commands

```bash
# Generate CRUD structure
php artisan backpack:crud {EntityName}
php artisan make:resource {EntityName}Resource
php artisan make:service {EntityName}Service
php artisan make:repository {EntityName}Repository

# Migrations
php artisan make:migration create_{table_name}_table

# Authentication (Passport)
php artisan passport:install

# Cache
php artisan config:cache
php artisan optimize:clear
```

### Database Conventions

- Do NOT use `json` type in migrations - use `longText` instead for JSON data
- Follow standard Laravel naming: `create_{table_name}_table`

### Backpack Admin Panel

Base admin CRUD structure on: `app/Http/Controllers/Admin/CookieCrudController.php`

For complex CRUDs with filters and tabs:
- Create folder: `app/Http/Controllers/Admin/{ModelName}Crud/`
- Add subfolders: `Filters/` and `Fields/`
- Create traits: `{ModelName}Crud{FilterName}Filter.php`
- Import traits in main controller: `use {ModelName}Crud{FilterName}Filter;`

Example: `app/Http/Controllers/Admin/UserCrud/Filters/UserCrudActiveFilter.php`

### Authentication

API uses Laravel Passport. Check `routes/api.php` for `Route::middleware('auth:sanctum')` to determine if authentication is required.

### Helper Functions

Global helpers autoloaded from: `app/Helpers/Helpers.php`

### Routes

- `routes/api.php` - API endpoints
- `routes/backpack/custom.php` - Admin panel routes
- `routes/web.php` - Web routes

## Web Service (Laravel)

Similar architecture to API service but focused on public-facing website.

### View Structure

- Pages: `resources/views/pages/{pageName}/{pageName}.blade.php`
- Partials: `resources/views/partials/{pageName}/`

### HTML Convention

```html
<div class="container-fluid" id="page-{pageName}">
    <div class="page-{pageName}">
        <!-- content -->
    </div>
</div>
```

### Styles (SASS)

- Page styles: `resources/sass/pages/{pageName}.scss`
- Partial styles: `resources/sass/partials/{pageName}.scss`
- Import in: `resources/sass/pages/index.scss` and `resources/sass/partials/index.scss`

SCSS structure:
```scss
#page-{pageName} {
    .page-{pageName} {
        // styles
    }
}
```

### JavaScript

- Controllers: `resources/js/pages/{pageName}Controller.js`
- Import in: `resources/js/ViewHandler.js`
- Uses vanilla JavaScript (no frameworks)

### Frontend Controllers

Located in `app/Http/Controllers/Front/`, e.g., `BlogArticleFrontController.php`

Flow: Route → `PageFrontController.php` → specific `FrontController` → Blade view

## Server Service (Node.js Emulator)

Real-time game server handling Socket.IO connections and game logic.

### Structure

- `index.js` - Entry point with error handlers and GameClock
- `src/config/` - Server and database configuration
- `src/sockets/` - Socket.IO handlers (auth, connection, game events)
- `src/models/` - Game data models
- `src/services/` - Game logic services
- `src/services-api/` - Communication with Laravel API
- `src/controllers/` - Game controllers
- `src/managers/` - Game state managers
- `src/utils/` - Utilities (ConsoleLogger, GameClock)
- `src/packages/bots/` - Bot system

### Commands

```bash
# Development with nodemon
npm run dev

# Production
npm start
```

### Key Features

- WebSocket communication via Socket.IO
- Real-time game state synchronization
- Bot system (BotsPackage)
- GameClock for synchronized game timing
- Direct MariaDB connection
- API communication via `EMULATOR_API_TOKEN`

### Environment Variables

Key vars in `server/.env`:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
- `API_DOCKER_URL` - Internal Docker network URL for API
- `CLIENT_URL` - Client URL for CORS
- `EMULATOR_API_TOKEN` - Token for API authentication
- `PORT` - Server port (default 3000)

## Client Service (Vue 3 + Phaser)

HTML5 game client with Vue 3 for UI and Phaser 3 for game rendering.

### Structure

- `src/main.js` - App initialization with Pinia, i18n, Socket.IO
- `src/App.vue` - Root component
- `src/phaser/` - Phaser game scenes and logic
  - `PublicScene.js` - Main public game scene
  - `PrivateScene.js` - Private room scene
  - `MinigameScene.js` - Minigame scene
  - `GlobalPreloader.js` - Asset preloader
  - `managers/` - Game managers
  - `controllers/` - Game controllers
  - `animations/` - Sprite animations
  - `sockets/` - Socket.IO integration with Phaser
- `src/stores/` - Pinia state stores
- `src/composables/` - Vue composables
- `src/views/` - Vue view components
- `src/screens/` - Game screen components
- `src/sockets/` - Socket.IO client setup
- `src/config/` - Configuration
- `src/utils/` - Utilities (ClientVersionManager, etc.)
- `src/assets/` - Game assets (sprites, audio, data JSON)

### Commands

```bash
# Development server
npm run dev

# Production build (requires increased memory)
npm run build

# Preview production build
npm run preview

# JSON utilities
npm run jsonmin     # Minify JSON files
npm run jsonunmin   # Unminify JSON files
```

### Key Technologies

- Vue 3 with Composition API
- Phaser 3.87.0 for game rendering
- Pinia for state management
- Socket.IO client for real-time communication
- Vue i18n for internationalization
- GSAP for animations
- Vite for bundling

### Architecture

The client follows a dual-architecture pattern:
1. **Vue layer**: UI, menus, overlays, state management
2. **Phaser layer**: Game world rendering, sprites, physics

Socket.IO events bridge both layers, with stores providing reactive state to both Vue components and Phaser scenes.

### Version Management

`ClientVersionManager` checks and clears cache on version changes, ensuring users always have the latest assets.

## Testing

### API/Web (Laravel)

```bash
docker compose exec api ./vendor/bin/phpunit
docker compose exec web ./vendor/bin/phpunit
```

### Server (Node.js)

No test suite currently configured.

### Client (Vue/Phaser)

No test suite currently configured.

## Linting & Formatting

### API/Web (Laravel)

```bash
# Laravel Pint (code style fixer)
docker compose exec api ./vendor/bin/pint
docker compose exec web ./vendor/bin/pint
```

## Deployment

For production VPS deployment:

```bash
# API
sudo docker exec -it boombang-html5-api-1 bash
php artisan migrate --seed
php artisan passport:install
php artisan config:cache

# Server (restart required after changes)
sudo docker restart boombang-html5-server-1

# Web
sudo docker start boombang-html5-web-1
sudo docker exec -it boombang-html5-web-1 bash
php artisan migrate --seed
php artisan config:cache
sudo docker exec -it boombang-html5-web-1 php artisan optimize:clear
```

## Development Guidelines

### Language Convention

Respond to users in their language (Spanish or Russian). Code comments and documentation are primarily in Spanish.

### Code Style

- Follow existing patterns in similar files
- Maintain minimal, focused changes
- Laravel: Follow PSR-12 via Laravel Pint
- JavaScript: Follow existing code style in the project
- Vue: Use Composition API with `<script setup>`

### Creating New Entities

When creating a new entity, always create:
1. Model: `app/Models/{EntityName}.php`
2. Migration: `database/migrations/{timestamp}_create_{table_name}_table.php`
3. Resource: `app/Http/Resources/{EntityName}Resource.php`
4. Service: `app/Services/{EntityName}Service.php`
5. Repository: `app/Repositories/{EntityName}Repository/`
6. Admin Controller: `app/Http/Controllers/Admin/{EntityName}CrudController.php`
7. API Controller (if needed): `app/Http/Controllers/Api/{EntityName}ApiController.php`
8. Request: `app/Http/Requests/{EntityName}Request.php`

### Inter-Service Communication

- **Client ↔ Server**: Socket.IO (WebSocket)
- **Server ↔ API**: HTTP/HTTPS with `EMULATOR_API_TOKEN` authentication
- **Web ↔ API**: Standard Laravel HTTP/API calls
- **Client ↔ API**: Direct HTTP/HTTPS calls for non-real-time data

### Git Workflow

Main branch: `main`
Current branch: `staging`

Commit messages use conventional format. When creating commits, include:
```
<type>: <description>

🤖 Generated with [Codex](https://Codex.com/Codex)

Co-Authored-By: Codex <noreply@anthropic.com>
```
