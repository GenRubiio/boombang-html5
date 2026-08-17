#!/usr/bin/env node
// Offline layered-body compiler (design.md §3.1). Manually invoked, matching
// optimize-images.cjs / jsonmin.cjs precedent — NOT wired into `npm run build`.
//
//   node scripts/compile-layered-avatar.cjs <character>
//
// Input:  client/.assets-src/layered/<character>/  (_frames.json, p*.png, <anim>.json,
//         colormeta.json, meta.json)
// Output: client/src/assets/game/avatars/<character>/layers/
//         <character>.layers.webp (+ _1, _2 … on >4096px overflow)
//         <character>.layers.atlas.json (Phaser multiatlas)
//         <character>.manifest.json

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const { validateSupersampling } = require('./lib/validateSupersampling.cjs');
// `mirrorPivot.cjs` is no longer used here — this compiler used to precompute `oMirror` with
// it; see the removed field's docblock further down for why that was wrong and dropped.
const { packFrames, meanLuminance, checkLuminanceWarning } = require('./lib/packFrames.cjs');

const COMPILER_VERSION = '1.0.0';
const SS = 2;
const MAX_PAGE_SIZE = 4096;

// Directions that are authored left-facing only; their right-facing counterparts are
// synthesized as manifest.mirrors entries (design.md §3.1 step 5, LR5).
const MIRROR_SOURCE_PREFIXES = ['left', 'leftdown', 'leftup'];
const MIRROR_TARGET_PREFIX = { left: 'right', leftdown: 'rightdown', leftup: 'rightup' };

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

/**
 * Best-effort fps/repeat lookup from the character's existing baked config.json, so a
 * layered animation key already served by the baked renderer keeps the same timing
 * (compile-time convenience only — not a runtime dependency on the baked path).
 */
function readBakedTimings(character) {
  const bakedConfigPath = path.resolve(
    __dirname,
    '..',
    'src/assets/game/avatars',
    character,
    'config.json'
  );
  if (!fs.existsSync(bakedConfigPath)) return {};
  const baked = readJson(bakedConfigPath);
  const timings = {};
  for (const [key, entry] of Object.entries(baked)) {
    if (typeof entry.frameRate === 'number') {
      timings[key] = { fps: entry.frameRate, repeat: entry.repeat };
    }
  }
  return timings;
}

async function main() {
  const character = process.argv[2];
  if (!character) {
    console.error('Usage: node compile-layered-avatar.cjs <character>');
    process.exit(1);
  }

  const inputDir = path.resolve(__dirname, '..', '.assets-src/layered', character);
  const outputDir = path.resolve(
    __dirname,
    '..',
    'src/assets/game/avatars',
    character,
    'layers'
  );

  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory not found: ${inputDir}`);
    process.exit(1);
  }
  fs.mkdirSync(outputDir, { recursive: true });

  const meta = readJson(path.join(inputDir, 'meta.json'));
  const colormeta = readJson(path.join(inputDir, 'colormeta.json'));
  const framesRaw = readJson(path.join(inputDir, '_frames.json'));

  if (meta.ss !== SS) {
    throw new Error(`compile-layered-avatar: expected ss:${SS}, got ss:${meta.ss}`);
  }

  const animKeys = Object.keys(meta.anims);
  const sequences = {};
  const bakedTimings = readBakedTimings(character);
  for (const key of animKeys) {
    const frames = readJson(path.join(inputDir, `${key}.json`));
    const timing = bakedTimings[key] || { fps: 19, repeat: key.endsWith('_talk') ? 0 : -1 };
    sequences[key] = { fps: timing.fps, repeat: timing.repeat, frames };
  }

  // Mirrors: synthesize right-facing keys from their left-facing source (LR5).
  const mirrors = {};
  for (const sourcePrefix of MIRROR_SOURCE_PREFIXES) {
    const targetPrefix = MIRROR_TARGET_PREFIX[sourcePrefix];
    for (const anim of ['idle', 'talk', 'walk']) {
      const sourceKey = `${sourcePrefix}_${anim}`;
      const targetKey = `${targetPrefix}_${anim}`;
      if (sequences[sourceKey]) {
        mirrors[targetKey] = { from: sourceKey, flipX: true };
      }
    }
  }

  // Collect every unique piece referenced by any frame, keyed by its source file index.
  const pieceUsage = new Map(); // pieceId -> { w, h, slot, fileName }
  framesRaw.forEach((frame) => {
    frame.L.forEach((l) => {
      const pieceId = `p${l.p}`;
      if (!pieceUsage.has(pieceId)) {
        pieceUsage.set(pieceId, { w: l.w, h: l.h, slot: l.s || null, fileName: `p${l.p}.png` });
      }
    });
  });

  // Validate ss:2 and gather actual pixel metadata for every unique piece.
  const luminanceWarnings = [];
  const pieceRects = [];
  for (const [pieceId, piece] of pieceUsage) {
    const filePath = path.join(inputDir, piece.fileName);
    const image = sharp(filePath);
    const metadata = await image.metadata();
    validateSupersampling({ w: piece.w, h: piece.h }, { width: metadata.width, height: metadata.height });

    if (piece.slot) {
      const { data } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const luminance = meanLuminance(data);
      const warning = checkLuminanceWarning(luminance);
      if (warning) luminanceWarnings.push(`${pieceId} (slot ${piece.slot}): ${warning}`);
    }

    pieceRects.push({ id: pieceId, w: metadata.width, h: metadata.height });
  }

  if (luminanceWarnings.length > 0) {
    console.warn(`[compile-layered-avatar] luminance warnings for ${character}:`);
    luminanceWarnings.forEach((w) => console.warn(`  - ${w}`));
  }

  // Pack every unique piece raster into one or more pages (design.md §3.1 step 3).
  const { pages } = packFrames(pieceRects, { maxSize: MAX_PAGE_SIZE });

  const pieceLocation = new Map(); // pieceId -> { page, x, y, w, h }
  pages.forEach((page, pageIndex) => {
    page.placements.forEach((placement) => {
      pieceLocation.set(placement.id, { page: pageIndex, ...placement });
    });
  });

  // Composite each page and write it out as .webp (+ _1, _2 … for overflow pages).
  const baseName = `${character}.layers`;
  const pageFileNames = pages.map((_, i) => (i === 0 ? `${baseName}.webp` : `${baseName}_${i}.webp`));

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    const compositeOps = [];
    for (const placement of page.placements) {
      const piece = pieceUsage.get(placement.id);
      compositeOps.push({
        input: path.join(inputDir, piece.fileName),
        left: placement.x,
        top: placement.y,
      });
    }
    await sharp({
      create: {
        width: Math.max(1, page.width),
        height: Math.max(1, page.height),
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(compositeOps)
      .webp({ lossless: true })
      .toFile(path.join(outputDir, pageFileNames[pageIndex]));
  }

  // Phaser multiatlas JSON — pieces load through scene.load.multiatlas with zero new loader
  // plumbing (design.md §3.1 step 4).
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
    meta: {
      app: 'compile-layered-avatar.cjs',
      version: COMPILER_VERSION,
      character,
    },
  };
  fs.writeFileSync(
    path.join(outputDir, `${baseName}.atlas.json`),
    JSON.stringify(multiatlas)
  );

  // Body bounds: the bounding box every frame's pieces occupy, in the same coordinate space
  // as `o`/`dx,dy` — used by the name-tag height calc equivalent (scaleBodyBounds).
  let maxX = 0;
  let maxY = 0;
  framesRaw.forEach((frame) => {
    frame.L.forEach((l) => {
      maxX = Math.max(maxX, l.x + l.w);
      maxY = Math.max(maxY, l.y + l.h);
    });
  });
  const bodyBounds = { w: Math.ceil(maxX), h: Math.ceil(maxY) };

  // Manifest frames: fid = source _frames.json array index (matches the literal frame-index
  // sequences already declared in <anim>.json — LR1).
  const pieces = {};
  for (const [pieceId, piece] of pieceUsage) {
    const location = pieceLocation.get(pieceId);
    pieces[pieceId] = {
      frame: { x: location.x, y: location.y, w: location.w, h: location.h },
      page: location.page,
      w: piece.w,
      h: piece.h,
      slot: piece.slot,
    };
  }

  // `oMirror` (a mirrored origin, precomputed as `bodyBounds.w - o[0]`) is DELIBERATELY no
  // longer emitted here (live-validation defect 8, root-cause correction). It reflected about
  // the bodyBounds bounding-box centre rather than the frame's own anchor — correct only when a
  // frame's own `o.x` happened to sit at `bodyBounds.w / 2` (true for `down`/`up`-family poses;
  // measured up to 56.8 real px wrong for `left*`-family poses in the real compiled rasta
  // manifest, causing the character to visibly drift off its own shadow when mirrored).
  // Mirroring is now applied at runtime by reflecting each piece about the frame's own `o.x`
  // (`LayeredAvatar._applyFrame`'s `reflectSpan` call, `pivot.js`) — origin is always `o`, so a
  // second, separately-computed origin has nothing left to do. Keeping `oMirror` in the schema
  // as inert data would leave two sources of truth for "the mirrored origin" (this field, and
  // whatever `reflectSpan`/`reflectPoint` compute on demand) that could silently diverge if
  // anyone ever read the stale field again — dropped instead of kept-but-unused.
  const frames = {};
  framesRaw.forEach((frame, index) => {
    const fid = String(index);
    frames[fid] = {
      o: frame.o,
      L: frame.L.map((l) => ({ p: `p${l.p}`, dx: l.x, dy: l.y })),
    };
  });

  const slots = Object.keys(colormeta.defaults || {});

  const manifest = {
    v: 1,
    compilerVersion: COMPILER_VERSION,
    sourceHash: sha1OfInputs(inputDir, fs.readdirSync(inputDir)),
    character,
    ss: SS,
    slots,
    defaults: colormeta.defaults || {},
    labels: colormeta.labels || {},
    compatibleHats: [],
    bodyBounds,
    pieces,
    frames,
    sequences,
    mirrors,
  };
  fs.writeFileSync(path.join(outputDir, `${baseName}.manifest.json`), JSON.stringify(manifest));

  console.log(`[compile-layered-avatar] wrote ${character}:`);
  console.log(`  pages: ${pages.length}`);
  console.log(`  unique pieces: ${pieceUsage.size}`);
  console.log(`  frames: ${framesRaw.length}`);
  console.log(`  sequences: ${Object.keys(sequences).join(', ')}`);
  console.log(`  mirrors: ${Object.keys(mirrors).join(', ')}`);
  console.log(`  slots: ${slots.join(', ')}`);
  console.log(`  output: ${outputDir}`);
}

main().catch((err) => {
  console.error('[compile-layered-avatar] FAILED:', err.message);
  process.exit(1);
});
