#!/usr/bin/env node
// Offline compiler for a RASTER-ONLY source package (design.md fact B/§5.2 do not apply —
// no vector path data exists at all). `god.bb` (and, discovered live while building this,
// `ghost.bb`/`wraith.bb`) declare `"raster": true` in their own `meta.json`, not
// `"layers": true`: their `_frames.json` is ALREADY the final baked piece-reference pool, one
// flat `{o, x, y, w, h, p}` entry per frame (no `L` wrapper — a single implicit piece, unlike
// a normal character's `_frames.json`), and every `<key>.json` is a literal array of indices
// into that pool. There is nothing to rasterize: this script packs the ALREADY-CROPPED `p*.png`
// pool into atlas page(s) and re-expresses the pool directly in the SAME manifest shape
// `compile-layered-avatar.cjs` emits, reusing `LayeredAvatar` as the renderer (a character with
// zero colour slots gains nothing extra from the layered machinery beyond the shape itself —
// this is the "no layered compile needed, loads as a baked avatar" path named in the god apply
// pass, expressed via the one renderer this codebase already has).
//
//   node scripts/compile-raster-avatar.cjs <character>
//
// Input:  client/.assets-src/raster/<character>/ (_frames.json, p*.png, <anim>.json, meta.json)
// Output: client/src/assets/game/avatars/<character>/layers/
//         <character>.layers.webp — BASE PACK ONLY: keys ending in `_idle`/`_talk`/`_walk`
//         (the exact idle/talk/walk x 5-direction convention every other migrated character's
//         own base pack already carries). Everything else `meta.anims` declares (emotes,
//         gestures, punches — 26 keys for god) is DELIBERATELY NOT compiled by this script.
//         Reasons, both real and disclosed in apply-progress.md's own "god" section: (1) the
//         SHARED base-pack loader (`AvatarManager.loadLayeredAvatar`) patches every
//         `atlasJson.textures[]` entry with the SAME single webp URL — it only ever correctly
//         served a 1-page base pack (true of every character compiled before this one), and
//         god's full 41-key set needs 3 pages; restricting to the idle/talk/walk convention
//         keeps this compile inside that same, already-working, 1-page contract instead of
//         changing code every other already-shipped character depends on. (2) the per-KEY lazy
//         action-pack architecture (`compile-layered-avatar.cjs`'s own §13.3 machinery) is real
//         additional engineering this raster-only compiler does not replicate. The user's own
//         framing for this character explicitly accepted a missing action set ("es posible que
//         este personaje no tenga acciones etc", 2026-08-19).
//         <character>.layers.atlas.json (Phaser multiatlas)
//         <character>.layers.manifest.json
//
// Disclosed, deliberately NOT done here (apply-progress.md's own "god" section has the full
// account): no `--emit-config-shim` call site of its own — the caller runs
// `compile-layered-avatar.cjs`'s existing shim builder against this script's own manifest
// shape, which is compatible by construction (same field names).

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const { deriveConventionMirrors } = require('./lib/bakedKeyMap.cjs');
const { checkPageBudget } = require('./lib/pageBudget.cjs');
const { computeManifestSlots } = require('./lib/computeManifestSlots.cjs');
const { filterRegularFileNames } = require('./lib/listInputFiles.cjs');
const { buildRasterAvatarManifest } = require('./lib/buildRasterAvatarManifest.cjs');

const COMPILER_VERSION = '1.0.0';
const SS = 2;
const MAX_PAGE_SIZE = 4096;
// design.md §5.4/§6's own base-pack budget, reused unchanged: this compiler produces a real
// base pack (idle/talk/walk only, see the header comment above), not an aggregated action pack.
const PAGE_BUDGET = { failAbove: 2 };
const WEBP_OPTIONS = { lossless: true, effort: 6 };
// The idle/talk/walk x 5-direction convention every `.layers.bb` base package in the source
// dump ships (design.md's own BLOCKER fix section: "every `.layers.bb`... ships exactly the
// same 15 base sequences... and NO right-family source art at all"). A raster-only package has
// no `.layers.bb`/`.bb` split at all — everything lives in one `meta.anims` — so this filter is
// what DEFINES "the base pack" for this compiler, applied to whichever keys are present.
const BASE_KEY_SUFFIX_PATTERN = /_(idle|talk|walk)$/;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sha1OfInputs(inputDir, fileNames) {
  const hash = crypto.createHash('sha1');
  for (const name of fileNames.sort()) {
    hash.update(name);
    hash.update(fs.readFileSync(path.join(inputDir, name)));
  }
  return hash.digest('hex');
}

async function main() {
  const character = process.argv[2];
  if (!character) {
    console.error('Usage: node scripts/compile-raster-avatar.cjs <character>');
    process.exit(1);
  }

  const { packFrames } = await import('../src/shared/assetPipeline/packFrames.js');

  const inputDir = path.resolve(__dirname, '..', '.assets-src', 'raster', character);
  const outputDir = path.resolve(__dirname, '..', 'src/assets/game/avatars', character, 'layers');

  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory not found: ${inputDir}`);
    process.exit(1);
  }
  fs.mkdirSync(outputDir, { recursive: true });

  const meta = readJson(path.join(inputDir, 'meta.json'));
  if (!meta.raster) {
    throw new Error(`compile-raster-avatar: ${character}'s meta.json does not declare "raster": true`);
  }
  if (meta.ss !== SS) {
    throw new Error(`compile-raster-avatar: expected ss:${SS}, got ss:${meta.ss}`);
  }

  const framesRaw = readJson(path.join(inputDir, '_frames.json'));
  const allAnimKeys = Object.keys(meta.anims);
  const animKeys = allAnimKeys.filter((key) => BASE_KEY_SUFFIX_PATTERN.test(key));
  const skippedKeys = allAnimKeys.filter((key) => !BASE_KEY_SUFFIX_PATTERN.test(key));
  if (skippedKeys.length > 0) {
    console.log(`[compile-raster-avatar] base pack only — NOT compiling ${skippedKeys.length} non-idle/talk/walk key(s): ${skippedKeys.join(', ')}`);
  }

  const sequenceIndexArrays = {};
  for (const key of animKeys) {
    sequenceIndexArrays[key] = readJson(path.join(inputDir, `${key}.json`));
  }

  // Every piece referenced by ANY compiled sequence — de-duplicated by its own source index,
  // since `framesRaw[i].p` is already globally unique per frame-pool entry (verified live: 1075
  // unique `p` values across 1075 non-empty entries in god's own `_frames.json` — no reuse to
  // dedupe beyond the reuse sequences already express by repeating a frame INDEX).
  const referencedFrameIndices = new Set();
  for (const indices of Object.values(sequenceIndexArrays)) {
    for (const idx of indices) referencedFrameIndices.add(idx);
  }

  const pieceFileNames = new Map(); // pieceId -> png file name
  for (const idx of referencedFrameIndices) {
    const entry = framesRaw[idx];
    if (!entry || entry.p === undefined) continue;
    pieceFileNames.set(`p${entry.p}`, `p${entry.p}.png`);
  }

  const pieceRects = [];
  for (const [pieceId, fileName] of pieceFileNames) {
    // eslint-disable-next-line no-await-in-loop
    const metadata = await sharp(path.join(inputDir, fileName)).metadata();
    pieceRects.push({ id: pieceId, w: metadata.width, h: metadata.height });
  }

  const { pages } = packFrames(pieceRects, { maxSize: MAX_PAGE_SIZE });
  checkPageBudget(pages.length, PAGE_BUDGET);

  const pieceAtlasLocations = {};
  pages.forEach((page, pageIndex) => {
    page.placements.forEach((placement) => {
      pieceAtlasLocations[placement.id] = { page: pageIndex, x: placement.x, y: placement.y, w: placement.w, h: placement.h };
    });
  });

  const baseName = `${character}.layers`;
  const pageFileNames = pages.map((_, i) => (i === 0 ? `${baseName}.webp` : `${baseName}_${i}.webp`));

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    const compositeOps = page.placements.map((placement) => ({
      input: path.join(inputDir, pieceFileNames.get(placement.id)),
      left: placement.x,
      top: placement.y,
    }));
    // eslint-disable-next-line no-await-in-loop
    await sharp({
      create: {
        width: Math.max(1, page.width),
        height: Math.max(1, page.height),
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(compositeOps)
      .webp(WEBP_OPTIONS)
      .toFile(path.join(outputDir, pageFileNames[pageIndex]));
    console.log(`[compile-raster-avatar] wrote page ${pageIndex}: ${pageFileNames[pageIndex]} (${page.width}x${page.height}, ${page.placements.length} pieces)`);
  }

  const multiatlas = {
    textures: pages.map((page, pageIndex) => ({
      image: pageFileNames[pageIndex],
      format: 'RGBA8888',
      size: { w: page.width, h: page.height },
      scale: 1,
      frames: page.placements.map((placement) => ({
        filename: placement.id,
        rotated: false,
        trimmed: false,
        sourceSize: { w: placement.w, h: placement.h },
        spriteSourceSize: { x: 0, y: 0, w: placement.w, h: placement.h },
        frame: { x: placement.x, y: placement.y, w: placement.w, h: placement.h },
      })),
    })),
    meta: { app: 'compile-raster-avatar.cjs', version: COMPILER_VERSION, character },
  };
  fs.writeFileSync(path.join(outputDir, `${baseName}.atlas.json`), JSON.stringify(multiatlas));

  const manifestCore = buildRasterAvatarManifest({
    character,
    ss: SS,
    framesRaw,
    sequenceIndexArrays,
    pieceAtlasLocations,
    // design.md §5.5/the BLOCKER fix (2026-08-18): no baked config.json precedent exists for a
    // brand-new character — reuse the SAME universal-convention fallback sally's own blocker
    // fix built, so `right*` directions mirror their `left*`/`leftdown*`/`leftup*` counterparts
    // instead of silently degrading to `down_idle` (the exact defect that fix closed).
    mirrors: deriveConventionMirrors(sequenceIndexArrays),
  });

  const slots = computeManifestSlots({}, manifestCore.pieces); // god ships no colormeta at all

  const manifest = {
    v: 1,
    compilerVersion: COMPILER_VERSION,
    sourceHash: sha1OfInputs(inputDir, filterRegularFileNames(fs.readdirSync(inputDir, { withFileTypes: true }))),
    ...manifestCore,
    slots,
  };

  fs.writeFileSync(path.join(outputDir, `${baseName}.manifest.json`), JSON.stringify(manifest));

  // design.md §15 (tasks.md slice 10 task 4), same convention `compile-layered-avatar.cjs`
  // uses for a character with no baked precedent at all: a well-formed `window.avatars_config`
  // entry (`atlasKey: null`) instead of `undefined` for every `AvatarsDataPreload.js` consumer.
  if (process.argv.includes('--emit-config-shim')) {
    const { buildConfigShim } = require('./lib/buildConfigShim.cjs');
    const shim = buildConfigShim(manifest);
    fs.writeFileSync(path.join(outputDir, '..', 'config.json'), JSON.stringify(shim));
    console.log(`[compile-raster-avatar] wrote config shim: ${path.join(outputDir, '..', 'config.json')} (${Object.keys(shim).length} entries, atlasKey: null)`);
  }

  console.log(`[compile-raster-avatar] wrote ${character}:`);
  console.log(`  pages: ${pages.length}`);
  console.log(`  unique pieces: ${pieceRects.length}`);
  console.log(`  frames: ${Object.keys(manifest.frames).length} compiled of ${framesRaw.length} in the source pool`);
  console.log(`  sequences: ${Object.keys(sequenceIndexArrays).length} (${Object.keys(sequenceIndexArrays).join(', ')})`);
  console.log(`  mirrors: ${Object.keys(manifest.mirrors).join(', ') || '(none)'}`);
  console.log(`  slots: ${slots.join(', ') || '(none)'}`);
  console.log(`  bodyBounds: ${JSON.stringify(manifest.bodyBounds)}`);
  console.log(`  output: ${outputDir}`);
}

main().catch((err) => {
  console.error('[compile-raster-avatar] FAILED:', err.message);
  process.exit(1);
});
