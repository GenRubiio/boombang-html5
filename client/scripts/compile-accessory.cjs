#!/usr/bin/env node
// Offline accessory compiler (design.md §3.2). Manually invoked, matching
// compile-layered-avatar.cjs / optimize-images.cjs precedent — NOT wired into `npm run build`.
//
//   node scripts/compile-accessory.cjs --kind aura <key>
//   node scripts/compile-accessory.cjs --kind hat|pet <key>
//
// Aura mode input: client/.assets-src/auras/<key>/{aura.json, aura.webp} — the consolidated,
// already production-shaped sheet (grid of frameWidth x frameHeight cells, `cols`x`rows`).
// Output: client/src/assets/game/accessories/aura/<key>/
//   <key>.aura.webp (copied through, unmodified — no repacking needed, the sheet is already
//   one packed grid), <key>.aura.atlas.json (Phaser atlas), <key>.accessory.json (manifest).
//
// Hard-fails if either sheet axis exceeds 4096px (design.md §3.2) — a DEFENSE-IN-DEPTH check:
// the real gate is measuring the source sheet BEFORE staging it as this script's input
// (Slice 8 task 1). Unlike the body compiler, this does NOT paginate on overflow.
//
// Vector mode (hat/pet) input: client/.assets-src/accessories/<key>/{meta.json,
// _frames_<anim>.json, <anim>.json} — EaselJS-style vector paths per frame, one file pair per
// declared animation (Slice 9). Each frame's `p[]` becomes an SVG rendered via
// sharp+librsvg at density:144 (2x the 72dpi default — the same ss:2 supersampling factor the
// body compiler enforces), deduped by content hash, packed, and emitted as
// <key>.<kind>.webp + multiatlas + <key>.accessory.json.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const { svgFromPaths, computeBounds } = require('./lib/svgFromPaths.cjs');
const { packFrames } = require('./lib/packFrames.cjs');

const MAX_SHEET_SIZE = 4096;
const COMPILER_VERSION = '1.0.0';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sha1OfFile(filePath) {
  return crypto.createHash('sha1').update(fs.readFileSync(filePath)).digest('hex');
}

function compileAura(key) {
  const inputDir = path.resolve(__dirname, '..', '.assets-src/auras', key);
  const outputDir = path.resolve(__dirname, '..', 'src/assets/game/accessories/aura', key);

  const sheetMeta = readJson(path.join(inputDir, 'aura.json'));
  const webpPath = path.join(inputDir, 'aura.webp');

  if (sheetMeta.sheetWidth > MAX_SHEET_SIZE || sheetMeta.sheetHeight > MAX_SHEET_SIZE) {
    throw new Error(
      `compile-accessory (aura): sheet ${sheetMeta.sheetWidth}x${sheetMeta.sheetHeight} exceeds the ${MAX_SHEET_SIZE}px limit on an axis — re-author at a smaller size or reduce frame count. No multi-page workaround for auras (design.md §3.2).`
    );
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const baseName = `${key}.aura`;
  fs.copyFileSync(webpPath, path.join(outputDir, `${baseName}.webp`));

  const frames = [];
  for (let i = 0; i < sheetMeta.frameCount; i++) {
    const col = i % sheetMeta.cols;
    const row = Math.floor(i / sheetMeta.cols);
    frames.push({
      filename: `f${i}`,
      rotated: false,
      trimmed: false,
      sourceSize: { w: sheetMeta.frameWidth, h: sheetMeta.frameHeight },
      spriteSourceSize: { x: 0, y: 0, w: sheetMeta.frameWidth, h: sheetMeta.frameHeight },
      frame: {
        x: col * sheetMeta.frameWidth,
        y: row * sheetMeta.frameHeight,
        w: sheetMeta.frameWidth,
        h: sheetMeta.frameHeight,
      },
    });
  }

  const atlas = {
    textures: [
      {
        image: `${baseName}.webp`,
        format: 'RGBA8888',
        size: { w: sheetMeta.sheetWidth, h: sheetMeta.sheetHeight },
        scale: 1,
        frames,
      },
    ],
    meta: { app: 'compile-accessory.cjs', version: COMPILER_VERSION, key },
  };
  fs.writeFileSync(path.join(outputDir, `${baseName}.atlas.json`), JSON.stringify(atlas));

  // Aura mode manifest: `anchor:[0.5, 0.85]` (design.md §3.2) rather than a character-derived
  // pivot — auras are character-independent (ACC2). One literal frame-index sequence, no
  // `{start,end}` range, matching the same philosophy as the layered body's sequences (LR1).
  const manifest = {
    v: 1,
    kind: 'aura',
    key,
    compilerVersion: COMPILER_VERSION,
    sourceHash: sha1OfFile(webpPath),
    anchor: [sheetMeta.anchor?.x ?? 0.5, sheetMeta.anchor?.y ?? 0.85],
    fps: sheetMeta.fps,
    frames: Array.from({ length: sheetMeta.frameCount }, (_, i) => `f${i}`),
  };
  fs.writeFileSync(path.join(outputDir, `${key}.accessory.json`), JSON.stringify(manifest));

  console.log(`[compile-accessory] wrote aura "${key}":`);
  console.log(`  sheet: ${sheetMeta.sheetWidth}x${sheetMeta.sheetHeight}`);
  console.log(`  frames: ${sheetMeta.frameCount} @ ${sheetMeta.fps}fps`);
  console.log(`  output: ${outputDir}`);
}

const SS = 2; // matches the body compiler's supersampling factor (design.md §3.1/§3.2)
const MAX_PAGE_SIZE = 4096;
const DEFAULT_HAT_Z_BIAS = 0.5; // design.md §1: hat default depth = 1.0 + zBias
// Live-validation defect 9 fix (deliberate z policy decision, documented in apply-progress.md):
// Slice 9 originally sent back-facing (up_idle/up_talk/up_walk/leftup_*) hat frames BEHIND the
// body (`zBias: -0.4`, depth 0.6 < the body's 1.0) so a brim would not float over the back of
// the head. A live browser audit found this fully occludes the hat (depth 0.6 sits UNDER the
// body's depth 1.0, so the head hides it completely) in 3 of 8 directions — the hat sprite was
// present, visible, correctly positioned and textured, just invisible behind an opaque body.
// Decision: an accessory must NEVER be sent behind the body — a hat should be visible in every
// direction, even if that means seeing "the back of the hat" rather than nothing at all. The
// back-facing negative-bias mechanism is removed entirely (not tuned to a smaller negative
// value): there is no way to keep a z-order-based approach "partially visible but behind" for a
// shape that broadly overlaps the head's own silhouette, so partial occlusion was never a safe
// middle ground here. Every hat frame now uses the SAME default bias (`DEFAULT_HAT_Z_BIAS`,
// depth 1.5), matching the directions that were already correct.

async function renderFrameRaster(frame) {
  // Some frames declare no geometry at all (observed in pet09's cara_grande/cara_mediana/
  // cara_peque/cayendo/ficha/left_falling — face-closeup and fall states where the
  // accessory intentionally draws nothing). A 1x1 transparent pixel keeps the pipeline
  // uniform instead of special-casing "no raster" through every downstream step.
  if (!frame.p || frame.p.length === 0) {
    const raster = await sharp({
      create: { width: 1, height: 1, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .png()
      .toBuffer();
    return { raster, bounds: { minX: frame.o[0], minY: frame.o[1], width: 1, height: 1 }, width: 1, height: 1 };
  }

  const bounds = computeBounds(frame.p);
  const { svg } = svgFromPaths(frame.p, bounds);
  const raster = await sharp(Buffer.from(svg), { density: 144 }).png().toBuffer();
  const metadata = await sharp(raster).metadata();
  return { raster, bounds, width: metadata.width, height: metadata.height };
}

async function compileVector(kind, key) {
  const inputDir = path.resolve(__dirname, '..', '.assets-src/accessories', key);
  const outputDir = path.resolve(__dirname, '..', 'src/assets/game/accessories', kind, key);
  fs.mkdirSync(outputDir, { recursive: true });

  const meta = readJson(path.join(inputDir, 'meta.json'));
  if (meta.kind !== kind) {
    throw new Error(`compile-accessory: meta.json declares kind "${meta.kind}", expected "${kind}"`);
  }

  const animKeys = Object.keys(meta.anims);

  // Global dedup registry, keyed by content hash of the rendered raster (design.md §3.2 step
  // 4 — meta.json's own deduped/perAnimUniq only dedupes WITHIN one anim's local frame list).
  const uniqueFrames = []; // [{hash, raster, width, height, regX, regY}]
  const hashToGlobalId = new Map();
  const anims = {};

  for (const animKey of animKeys) {
    const localFrames = readJson(path.join(inputDir, `_frames_${animKey}.json`));
    const sequence = readJson(path.join(inputDir, `${animKey}.json`));

    const localToGlobal = [];
    for (const frame of localFrames) {
      // eslint-disable-next-line no-await-in-loop
      const { raster, bounds, width, height } = await renderFrameRaster(frame);
      const hash = crypto.createHash('sha1').update(raster).digest('hex');

      let globalId = hashToGlobalId.get(hash);
      if (globalId === undefined) {
        globalId = uniqueFrames.length;
        hashToGlobalId.set(hash, globalId);
        uniqueFrames.push({
          hash,
          raster,
          width,
          height,
          // Registration point, rig-space (design.md §3.2 step 3): the raw declared origin,
          // used to compute this accessory's offset relative to whichever body frame it is
          // worn against (both layers share one coordinate system by construction).
          regX: frame.o[0],
          regY: frame.o[1],
          // Fractional origin within THIS piece's own raster, for Phaser's setOrigin() — the
          // pivot expressed as a 0..1 ratio needs no ss-aware runtime math.
          originX: bounds.width === 0 ? 0.5 : (frame.o[0] - bounds.minX) / bounds.width,
          originY: bounds.height === 0 ? 0.5 : (frame.o[1] - bounds.minY) / bounds.height,
        });
      }
      localToGlobal.push(globalId);
    }

    anims[animKey] = {
      fps: 19, // matches the body's default per-anim fps (compile-layered-avatar.cjs fallback)
      frames: sequence.map((localIndex) => localToGlobal[localIndex]),
    };
  }

  // Pack every unique rendered raster into one or more pages (design.md §3.2 step 4, reusing
  // Slice 1's packFrames.cjs).
  const rects = uniqueFrames.map((f, id) => ({ id: String(id), w: f.width, h: f.height }));
  const { pages } = packFrames(rects, { maxSize: MAX_PAGE_SIZE });

  const placementById = new Map();
  pages.forEach((page, pageIndex) => {
    page.placements.forEach((placement) => {
      placementById.set(placement.id, { page: pageIndex, ...placement });
    });
  });

  const baseName = `${key}.${kind}`;
  const pageFileNames = pages.map((_, i) => (i === 0 ? `${baseName}.webp` : `${baseName}_${i}.webp`));

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    const compositeOps = page.placements.map((placement) => ({
      input: uniqueFrames[Number(placement.id)].raster,
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
      .webp({ lossless: true })
      .toFile(path.join(outputDir, pageFileNames[pageIndex]));
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
    meta: { app: 'compile-accessory.cjs', version: '1.0.0', key },
  };
  fs.writeFileSync(path.join(outputDir, `${baseName}.atlas.json`), JSON.stringify(multiatlas));

  const frames = {};
  uniqueFrames.forEach((f, id) => {
    frames[String(id)] = {
      regX: f.regX,
      regY: f.regY,
      originX: f.originX,
      originY: f.originY,
    };
  });

  // Optional package-level scale correction (live-validation defect 8), resolved at runtime
  // the same override-then-base-then-default way as every other per-frame value (ACC1):
  // `accFrame.scale ?? manifest.base.scale ?? 1`. Not automatable — like the back-facing
  // `zBias` override above, this is a manual authoring correction on the STAGED INPUT
  // (`meta.json`'s own optional `scale` field, so it survives a recompile), applied only when
  // the raw source geometry has been directly, visually measured against the character's own
  // head size and found disproportionate. Left undefined (defaulting to 1 at runtime) for any
  // package whose `meta.json` does not declare one.
  const base = { regX: 0, regY: 0, zBias: kind === 'hat' ? DEFAULT_HAT_Z_BIAS : 0 };
  if (typeof meta.scale === 'number') {
    base.scale = meta.scale;
  }
  // Live-validation defect 12b fix: an optional, per-package ground-contact correction (logical
  // units, subtracted from every frame's `regY` at runtime — see resolveAccessoryPlacement's
  // `baseGroundOffsetY` docblock for the full derivation). Read the SAME way as `scale`, from an
  // optional `meta.json` field, so it survives a recompile.
  if (typeof meta.groundOffsetY === 'number') {
    base.groundOffsetY = meta.groundOffsetY;
  }

  // Architectural finding (user-raised, confirmed against the raw reference dump): accessory
  // packages are PER CHARACTER in the source data — the same hat/pet key is a genuinely
  // different package (different geometry, different frame counts, even different SEQUENCE
  // LENGTHS) per character. `meta.char` was previously read only to validate `meta.kind` above
  // and then silently dropped from the compiled manifest. Kept here so a package's own source
  // character is at least recoverable from the compiled artifact, rather than lost entirely —
  // this does NOT by itself make package identity/loading character-scoped (see
  // apply-progress.md "Character-scoped accessory packages" for the full finding and the
  // explicit, reasoned decision to defer the registry/path-level fix as a follow-up).
  const manifest = {
    v: 1,
    kind,
    key,
    char: meta.char,
    compilerVersion: '1.0.0',
    ss: SS,
    base,
    frames,
    anims,
  };
  fs.writeFileSync(path.join(outputDir, `${key}.accessory.json`), JSON.stringify(manifest));

  console.log(`[compile-accessory] wrote ${kind} "${key}":`);
  console.log(`  unique frames: ${uniqueFrames.length}`);
  console.log(`  anims: ${animKeys.length}`);
  console.log(`  pages: ${pages.length}`);
  console.log(`  output: ${outputDir}`);
}

function main() {
  const args = process.argv.slice(2);
  const kindIndex = args.indexOf('--kind');
  const kind = kindIndex !== -1 ? args[kindIndex + 1] : null;
  const key = args.filter((a, i) => a !== '--kind' && args[i - 1] !== '--kind')[0];

  if (!key) {
    console.error('Usage: node compile-accessory.cjs --kind <aura|hat|pet> <key>');
    process.exit(1);
  }

  if (kind === 'aura') {
    compileAura(key);
  } else if (kind === 'hat' || kind === 'pet') {
    compileVector(kind, key).catch((err) => {
      console.error('[compile-accessory] FAILED:', err.message);
      process.exit(1);
    });
  } else {
    console.error(`Unsupported --kind "${kind}"`);
    process.exit(1);
  }
}

main();
