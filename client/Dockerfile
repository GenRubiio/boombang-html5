# Build context is the repo root (docker-compose.yml's `client.build.context: .`), not
# ./client, so that stage 2 can COPY the shared docker/nginx/ config that lives outside the
# client/ subtree (design.md §13.1, tasks.md slice 13) without duplicating it into client/. The
# root .dockerignore keeps the context sane despite this (excludes .git, node_modules, the other
# services, and client/.assets-src's untracked raw source).

# Stage 1: Build the application
FROM node:18 AS build
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/. .
# bundle-avatar-packages.cjs (design.md §9.2, tasks.md slice 16) MUST run before `vite build`,
# not after, despite the .env.example comment's literal wording — it writes to
# client/public/bundles/, which Vite then copies verbatim into dist/bundles/ during the build
# (see that script's own header comment for why). Passing every directory under
# src/assets/game/avatars/ rather than a hardcoded character list keeps this wired for whichever
# characters actually have a compiled `layers/` output as more land — the script itself skips
# (logs, does not fail) any name without one, e.g. ghost/wraith which are NPC-only.
RUN node scripts/bundle-avatar-packages.cjs $(ls src/assets/game/avatars)
# emit-gzip-siblings.cjs (design.md §13.1) writes a `.gz` sibling at level 9 for every compiled
# .js/.css/.json output (the layered manifest/atlas ship as .js chunks, not raw .json — see that
# script's own comment) — gzip_static (docker/nginx/gzip.conf) then serves it directly, zero
# request-time CPU, better ratio than the on-the-fly level 6 fallback.
RUN node --max-old-space-size=4096 node_modules/vite/bin/vite.js build \
 && node scripts/emit-gzip-siblings.cjs dist

# Stage 2: Serve the application with Nginx — compression at the origin and immutable caching
# for content-hashed assets (design.md §13.1; docker/nginx/gzip.conf was previously dead
# configuration, included by nothing).
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx/gzip.conf /etc/nginx/conf.d/gzip.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]