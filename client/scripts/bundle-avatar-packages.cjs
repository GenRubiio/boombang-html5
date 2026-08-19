#!/usr/bin/env node
// design.md §9.2 (tasks.md slice 16 task 2): bundles each character's compiled packages (the
// base pack, and each per-key action pack independently — never re-coupling what slice 15's
// per-key granularity deliberately decoupled) into a `.bb`-shaped ZIP. STORE (level 0) for
// `.webp` — already-compressed bytes gain nothing and cost CPU to try — DEFLATE (level 9) for
// JSON. Reuses `bbArchive.cjs`'s deterministic entry builder (slice 11) rather than
// reimplementing ZIP entry construction.
//
// Reads from the COMPILED SOURCE directory (`client/src/assets/game/avatars/<char>/layers/`),
// not from Vite's post-build hashed output — the bytes are identical either way (Vite copies
// `.webp`/`.json` content verbatim, only renaming/hashing the filename), and reading the
// predictable source names avoids reverse-engineering Vite's per-build hash.
//
// Deliberate deviation from design.md's literal "run after vite build, emits dist/bundles/"
// wording: writes to `client/public/bundles/` and must run BEFORE `vite build`, not after.
// Vite copies `public/` verbatim into `dist/` on every build, so writing here achieves the
// exact same shipped `dist/bundles/<char>.layers.bb` output AND makes the bundle reachable at
// `/bundles/<char>.layers.bb` during `vite dev` (where `dist/` does not exist at all) — the
// dev-server reachability R15's e2e equivalence test depends on. Nothing in this script reads
// anything `vite build` produces, so there is no functional reason to run it after.
//
//   node scripts/bundle-avatar-packages.cjs <character> [<character> ...]

const fs = require('fs');
const path = require('path');
const { zipSync } = require('fflate');
const { buildZipEntries } = require('./lib/bbArchive.cjs');
const { groupLayeredFilesIntoBundles } = require('./lib/groupLayeredFilesIntoBundles.cjs');

const AVATARS_ROOT = path.join(__dirname, '..', 'src', 'assets', 'game', 'avatars');
const BUNDLES_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'bundles');

function levelFor(fileName) {
  return fileName.endsWith('.webp') ? 0 : 9;
}

function bundleCharacter(character) {
  const layersDir = path.join(AVATARS_ROOT, character, 'layers');
  if (!fs.existsSync(layersDir)) {
    console.error(`[bundle-avatar-packages] no compiled output for "${character}" at ${layersDir}`);
    return 0;
  }

  const fileNames = fs.readdirSync(layersDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  const bundles = groupLayeredFilesIntoBundles(character, fileNames);

  fs.mkdirSync(BUNDLES_OUTPUT_DIR, { recursive: true });

  let written = 0;
  for (const [bundleName, memberFiles] of Object.entries(bundles)) {
    const files = {};
    for (const fileName of memberFiles) {
      files[fileName] = fs.readFileSync(path.join(layersDir, fileName));
    }
    const zipped = zipSync(buildZipEntries(files, levelFor));
    fs.writeFileSync(path.join(BUNDLES_OUTPUT_DIR, `${bundleName}.bb`), zipped);
    written += 1;
  }
  console.log(`[bundle-avatar-packages] wrote ${written} bundle(s) for "${character}"`);
  return written;
}

function main() {
  const characters = process.argv.slice(2);
  if (characters.length === 0) {
    console.error('Usage: node bundle-avatar-packages.cjs <character> [<character> ...]');
    process.exit(1);
  }
  let total = 0;
  for (const character of characters) {
    total += bundleCharacter(character);
  }
  console.log(`[bundle-avatar-packages] ${total} bundle(s) written to ${BUNDLES_OUTPUT_DIR}`);
}

main();
