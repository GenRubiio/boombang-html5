#!/usr/bin/env node
// design.md §13.1 (tasks.md slice 13 task 2): a build-time step run after `vite build`,
// emitting a `.gz` sibling for every large text output file at gzip level 9 — better ratio than
// nginx's on-the-fly level 6 (docker/nginx/gzip.conf's `gzip_comp_level 6`), and zero
// request-time CPU once `gzip_static on` is set: nginx serves the pre-built `.gz` file directly
// instead of compressing on every request. `.webp` is left alone — already-compressed bytes
// gain nothing and cost CPU to try.
//
// Corrected target, live-discovered (see gzipCandidates.cjs's own comment for the full account):
// the design named `.json` because the layered manifest/atlas are authored as `.json`, but a
// real `docker build` showed they never reach `dist/` as `.json` — `AvatarManager.js`'s
// `import.meta.glob(...)` calls have no `{as:'url'}`, so Vite bundles each JSON match as a `.js`
// module instead. `selectGzipCandidates`'s default extension list is `.js`/`.css`/`.json` for
// that reason, not `.json` alone.
//
// I/O shell; the pure "which files need one" decision is `selectGzipCandidates`
// (client/scripts/lib/gzipCandidates.cjs).
//
// Usage: node scripts/emit-gzip-siblings.cjs <dir>   (e.g. the `dist/` build output)

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { selectGzipCandidates } = require('./lib/gzipCandidates.cjs');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function main() {
  const targetDir = process.argv[2];
  if (!targetDir) {
    console.error('usage: node emit-gzip-siblings.cjs <dir>');
    process.exit(1);
  }
  if (!fs.existsSync(targetDir)) {
    console.error(`emit-gzip-siblings: directory does not exist: ${targetDir}`);
    process.exit(1);
  }

  const allFiles = walk(targetDir);
  const candidates = selectGzipCandidates(allFiles);

  for (const filePath of candidates) {
    const input = fs.readFileSync(filePath);
    const gz = zlib.gzipSync(input, { level: zlib.constants.Z_BEST_COMPRESSION });
    fs.writeFileSync(`${filePath}.gz`, gz);
  }

  console.log(`[emit-gzip-siblings] wrote ${candidates.length} .gz siblings under ${targetDir}`);
}

main();
