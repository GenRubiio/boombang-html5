#!/usr/bin/env node
// Offline layered-body compiler (design.md §3.1, §5, §6). Manually invoked, matching
// optimize-images.cjs / jsonmin.cjs precedent — NOT wired into `npm run build`.
//
//   node scripts/compile-layered-avatar.cjs <character>
//
// Input:  client/.assets-src/layered/<character>/  (_frames.json, p*.png, <anim>.json,
//         colormeta.json, meta.json) — the base (idle/talk/walk) package.
//         client/.assets-src/layered/<character>/actions/ (meta.json, _frames_<anim>.json,
//         <anim>.json) — the full vector action set (design.md §5).
// Output: client/src/assets/game/avatars/<character>/layers/
//         <character>.layers.webp (+ _1, _2 … on >4096px overflow) — base pack
//         <character>.layers.atlas.json (Phaser multiatlas) — base pack
//         <character>.layers.manifest.json — character-level fields (slots/defaults/labels/
//         bodyBounds/ss/sequences/aliases/mirrors/actionPacks) + the base pack's own
//         pieces/frames (design.md §13.2, tasks.md slice 14 — SPLIT from the single-manifest
//         form slices 5-13 shipped; see splitLayeredManifest.cjs for why sequences/aliases/
//         mirrors stay here)
//         <character>.actions.<key>.webp (+ _1, _2 …) — ONE PER compiled action key
//         (design.md §13.3, tasks.md slice 15 — pages never shared between unrelated keys;
//         supersedes the single whole-pack-per-character `<character>.actions.webp` slices 6/14
//         shipped)
//         <character>.actions.<key>.atlas.json — that key's own multiatlas
//         <character>.actions.<key>.manifest.json — that key's own pieces/frames only

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const { validateSupersampling } = require('./lib/validateSupersampling.cjs');
// `mirrorPivot.cjs` is no longer used here — this compiler used to precompute `oMirror` with
// it; see the removed field's docblock further down for why that was wrong and dropped.
const { meanLuminance, checkLuminanceWarning } = require('./lib/packFrames.cjs');
const { filterRegularFileNames } = require('./lib/listInputFiles.cjs');
const { svgFromPaths, computeBounds, setSharedVectorBounds } = require('./lib/svgFromPaths.cjs');
const {
  parseBakedConfig,
  deriveAliasesAndMirrors,
  deriveConventionMirrors,
  isSelfEmittedConfigShim,
} = require('./lib/bakedKeyMap.cjs');
const { assertOriginSpaceMatch } = require('./lib/originSpaceGate.cjs');
const { checkPageBudget } = require('./lib/pageBudget.cjs');
const { sumPackedTransferBytes } = require('./lib/packedTransferBytes.cjs');
// Live defect fix (tasks.md slice 26): see computeMaxFramePieces.cjs's own docblock — the
// runtime pool-sizing defect this closes affects every character compiled before this fix.
const { computeMaxFramePieces } = require('./lib/computeMaxFramePieces.cjs');
const { computeManifestSlots } = require('./lib/computeManifestSlots.cjs');
const { splitLayeredManifest } = require('./lib/splitLayeredManifest.cjs');
const { packActionPiecesPerKey } = require('./lib/packActionPiecesPerKey.cjs');
// design.md §13.7 (tasks.md slice 20): the measurement-driven `ss:1`-for-over-budget-action-key
// rule that closes the R18 gate's one failing row (M3 worst key).
const { planActionKeySsOverrides } = require('./lib/selectActionKeySs.cjs');
const { mergeSsOverrideResults } = require('./lib/applyActionKeySsOverride.cjs');

// design.md §12.3 (tasks.md slice 8 task 1/2): `partitionSlotRuns`/`packFrames` moved to
// client/src/shared/assetPipeline/ (ESM) — module-scope bindings populated once, early in `main()`,
// via dynamic import(). Every helper function below reads these directly (single-threaded,
// sequential execution: nothing runs before `main()` populates them).
let partitionSlotRuns;
let packFrames;
// design.md §9.1 (tasks.md slice 16): compact-emission by default, `--emit-verbose` opts into
// the pre-compaction human-readable form these two functions produce the inverse of.
let compactAtlas;
let compactManifest;

const COMPILER_VERSION = '1.0.0';
const SS = 2;
const MAX_PAGE_SIZE = 4096;
const BASE_RASTER_DPI = 72; // design.md §5.4: 1x reference DPI; density = BASE_RASTER_DPI * ss
const ACTION_RUN_TOLERANCE_PX = 1; // design.md §5.4: librsvg rounds a run's own computed bounds

// design.md §5.4/§6: re-derived page budgets, enforced by the compiler.
const BASE_PAGE_BUDGET = { failAbove: 2 };
const ACTION_PAGE_BUDGET = { warnAt: 5, failAbove: 8 };

// design.md §13.7/§13.8 (resolved by user decision 2026-08-18, tasks.md slice 20): the M3
// worst-key gate's own budget (<= 1.2 MB) is reused directly as the per-key `ss:1` selection
// threshold — the measurement this rule answers to IS that gate. 1.2 MiB, matching how the gate
// itself reports KB (binary, /1024), not decimal MB.
const ACTION_KEY_TRANSFER_BUDGET_BYTES = Math.round(1.2 * 1024 * 1024);

// design.md §13.5 (tasks.md slice 17): real-measured encoder settings, kept because they pass
// the fidelity gate (≤1% differing pixels at tolerance 8, 0 at tolerance 32, via
// `compareRasters`, measured with RGB normalized under fully-transparent pixels — see
// measure-asset-bytes.cjs/sweep-encoder-settings.cjs's own live-discovered correction). `effort:
// 6` is lossless and free (sharp's own compute-harder pass, zero fidelity cost by definition —
// measured byte-identical on rasta's base page, worth keeping regardless since a future
// character's base page may benefit). `nearLossless` at `quality: 60` is ONLY applied to action
// pages, where the real alpha-entropy profile (a full 0-255 antialiasing ramp from librsvg, not
// the base pack's near-discrete ~5-level authored alpha) makes it a genuine 18-24% size win —
// measured PASSING the fidelity gate cleanly (0% differing pixels at both tolerances) on two
// real pages (`down_llorar`, `leftdown_punch_rec`). NOT applied to the base pack, where the
// same sweep measured a ~100.2% (i.e. no win, occasionally a tiny regression) result.
const BASE_WEBP_OPTIONS = { lossless: true, effort: 6 };
const ACTION_WEBP_OPTIONS = { nearLossless: true, quality: 60 };

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
 * design.md §5.5 (fact I): reads the character's existing baked `config.json` (best-effort —
 * a character with no baked art, e.g. sally in PR7, has none) into the pure `parseBakedConfig`
 * shape. Renamed from `readBakedTimings` — it now feeds `deriveAliasesAndMirrors`, not just a
 * per-key fps/repeat lookup.
 */
function readBakedKeyMap(character) {
  const bakedConfigPath = path.resolve(
    __dirname,
    '..',
    'src/assets/game/avatars',
    character,
    'config.json'
  );
  if (!fs.existsSync(bakedConfigPath)) return {};
  const rawConfig = readJson(bakedConfigPath);
  // BLOCKER fix, chicken-and-egg guard: a config.json that is ITSELF a `--emit-config-shim`
  // output from an earlier compile (design.md §15) is not real baked-legacy precedent — reading
  // it back as one would defeat `deriveConventionMirrors`'s "no baked config" fallback on every
  // compile after the first, since the shim always exists once emitted once.
  if (isSelfEmittedConfigShim(rawConfig)) return {};
  return parseBakedConfig(rawConfig);
}

/**
 * Rasterizes one slot run (design.md §5.1/§5.2/§5.4). `fillOverride` is `'#ffffff'` for a
 * slotted run only (fact C: the authored fill of a slotted path equals that slot's default,
 * so `setTint` would multiply it twice) — never for an unslotted run.
 *
 * @param {number} [ss] design.md §13.7 (tasks.md slice 20): defaults to the project's ss:2
 *   contract; a measurement-selected over-budget action key recompiles its runs at `ss:1`
 *   through this same parameter — no separate rasterization code path.
 */
async function renderRunRaster(runPaths, clips, fillOverride, ss = SS) {
  const bounds = computeBounds(runPaths, ss);
  const { svg } = svgFromPaths(runPaths, bounds, { clips, fillOverride });
  const density = BASE_RASTER_DPI * ss;
  const raster = await sharp(Buffer.from(svg), { density }).png().toBuffer();
  const metadata = await sharp(raster).metadata();
  validateSupersampling(
    { w: bounds.width, h: bounds.height },
    { width: metadata.width, height: metadata.height },
    ss,
    ACTION_RUN_TOLERANCE_PX
  );
  return { raster, bounds, width: metadata.width, height: metadata.height };
}

/**
 * design.md §5.4: compiles every action key the vector package declares that the base
 * (idle/talk/walk) package does not already cover. Partitions each frame into slot runs
 * (design.md §5.1), rasterizes each run, content-hash-dedupes into its OWN registry
 * (namespaced `a<N>` — distinct from base `p<N>` pieces / numeric frame ids), and maps each
 * sequence's local frame indices through to the global action-frame ids (the same
 * `localToGlobal` step `compile-accessory.cjs` already performs).
 *
 * design.md §13.3 (tasks.md slice 15): the piece/frame dedup pool now resets PER KEY rather
 * than being one pool shared across all 26+ keys — measured 17,722 unique pieces from 867
 * unique frames (~20.4 pieces/frame) means cross-key dedup was already buying almost nothing, so
 * per-key packing (pages never shared between unrelated keys) costs approximately nothing.
 * Piece/frame ids stay GLOBALLY unique (one running counter across the whole compile) so the
 * full in-memory manifest (`--emit-config-shim`'s input) still has one coherent id space; each
 * key's OWN piece/frame ids are ALSO tracked (`keyPieceIds`/`keyFrameIds`) so the caller can
 * slice out exactly that key's own per-key manifest/atlas without re-deriving membership later.
 *
 * design.md §13.7 (tasks.md slice 20): `options.ss` and `options.onlyKeys` let this same
 * function serve BOTH the initial ss:2 compile of every key and a later, restricted ss:1
 * recompile of just the over-budget key(s) — `options.startPieceCounter`/`startFrameCounter`
 * continue the id space from wherever the previous call left off, so a recompile's ids never
 * collide with the ids already emitted for OTHER keys in the first pass.
 *
 * @param {{ss?: number, onlyKeys?: string[]|null, startPieceCounter?: number,
 *   startFrameCounter?: number}} [options]
 * @returns {object} the usual shape, plus `nextPieceCounter`/`nextFrameCounter` so a caller can
 *   chain a further restricted call without colliding ids.
 */
async function compileActionSequences(actionsDir, baseSequences, options = {}) {
  const { ss = SS, onlyKeys = null, startPieceCounter = 0, startFrameCounter = 0 } = options;
  const meta = readJson(path.join(actionsDir, 'meta.json'));
  let actionKeys = Object.keys(meta.anims).filter((key) => !baseSequences[key]);
  if (onlyKeys) {
    const onlySet = new Set(onlyKeys);
    actionKeys = actionKeys.filter((key) => onlySet.has(key));
  }

  const pieces = {}; // 'a<N>' -> {frame:{w,h}, slot} (global id space, may duplicate content across keys)
  const frames = {}; // 'a<N>' -> {o, L:[{p,dx,dy}]}
  const sequences = {};
  const keyPieceIds = {}; // key -> string[] (this key's own piece ids only)
  const keyFrameIds = {}; // key -> string[] (this key's own frame ids only)
  let pieceCounter = startPieceCounter;
  let frameCounter = startFrameCounter;
  const luminanceWarnings = [];

  for (const key of actionKeys) {
    const localFrames = readJson(path.join(actionsDir, `_frames_${key}.json`));
    const sequence = readJson(path.join(actionsDir, `${key}.json`));

    // Fresh dedup pool per key (design.md §13.3) — a piece identical to one already emitted
    // for a DIFFERENT key is deliberately re-emitted under a new id, not reused, so this key's
    // own page set never references another key's page.
    const hashToPieceId = new Map();
    const localToGlobal = [];
    const thisKeyPieceIds = new Set();
    const thisKeyFrameIds = [];

    for (const frame of localFrames) {
      const runs = partitionSlotRuns(frame.p || []);
      const L = [];

      for (const run of runs) {
        const fillOverride = run.slot ? '#ffffff' : undefined;
        // eslint-disable-next-line no-await-in-loop
        const { raster, bounds, width, height } = await renderRunRaster(run.paths, frame.cl, fillOverride, ss);
        const hash = crypto.createHash('sha1').update(raster).digest('hex');

        let pieceId = hashToPieceId.get(hash);
        if (pieceId === undefined) {
          pieceId = `a${pieceCounter++}`;
          hashToPieceId.set(hash, pieceId);
          pieces[pieceId] = {
            frame: { w: width, h: height },
            w: bounds.width,
            h: bounds.height,
            slot: run.slot,
            raster,
          };

          if (run.slot) {
            // eslint-disable-next-line no-await-in-loop
            const { data } = await sharp(raster).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
            const luminance = meanLuminance(data);
            const warning = checkLuminanceWarning(luminance);
            if (warning) luminanceWarnings.push(`${pieceId} (slot ${run.slot}, action "${key}"): ${warning}`);
          }
        }

        thisKeyPieceIds.add(pieceId);
        L.push({ p: pieceId, dx: bounds.minX, dy: bounds.minY });
      }

      const frameId = `a${frameCounter++}`;
      frames[frameId] = { o: frame.o, L };
      thisKeyFrameIds.push(frameId);
      localToGlobal.push(frameId);
    }

    sequences[key] = {
      frames: sequence.map((localIndex) => localToGlobal[localIndex]),
    };
    keyPieceIds[key] = [...thisKeyPieceIds];
    keyFrameIds[key] = thisKeyFrameIds;
  }

  return {
    sequences,
    pieces,
    frames,
    keyPieceIds,
    keyFrameIds,
    luminanceWarnings,
    nextPieceCounter: pieceCounter,
    nextFrameCounter: frameCounter,
  };
}

/**
 * design.md §13.3/§13.7 (tasks.md slices 15/20): builds one action key's own pages worth of
 * artifacts — real encoded webp buffers, its own multiatlas, its own pieces/frames manifest
 * slice — WITHOUT writing anything to disk. Used TWICE: once as a throwaway measurement (to
 * decide `selectSsForActionKey`) and once for real, to actually write the files this key ships.
 * Kept as ONE function so the measured bytes and the shipped bytes can never silently diverge
 * from two independently-maintained code paths.
 *
 * @param {string[]} pieceIds this key's own piece ids in DEDUP (compile) order — `keyPiecesOut`
 *   is built by iterating THIS list, not `keyPieceLocation`'s own (packing/placement-order) Map
 *   iteration, so a key whose ss stays at 2 (untouched by design.md §13.7's override) emits a
 *   byte-identical manifest to before this function existed — `compactManifest`'s piece-index
 *   encoding is order-dependent, and packing order is not the same as dedup order.
 */
async function buildActionKeyPack(character, key, keyPages, piecesById, pieceIds, frameIds, framesById, emitVerbose) {
  const keyBaseName = `${character}.actions.${key}`;
  const keyPageFileNames = keyPages.map((_, i) => (i === 0 ? `${keyBaseName}.webp` : `${keyBaseName}_${i}.webp`));

  const pageBuffers = [];
  for (let pageIndex = 0; pageIndex < keyPages.length; pageIndex++) {
    const page = keyPages[pageIndex];
    const compositeOps = page.placements.map((placement) => ({
      input: piecesById[placement.id].raster,
      left: placement.x,
      top: placement.y,
    }));
    // eslint-disable-next-line no-await-in-loop
    const buffer = await sharp({
      create: {
        width: Math.max(1, page.width),
        height: Math.max(1, page.height),
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(compositeOps)
      .webp(ACTION_WEBP_OPTIONS)
      .toBuffer();
    pageBuffers.push(buffer);
  }

  const keyPieceLocation = new Map();
  keyPages.forEach((page, pageIndex) => {
    page.placements.forEach((placement) => {
      keyPieceLocation.set(placement.id, { page: pageIndex, ...placement });
    });
  });

  let atlasJsonString = null;
  if (keyPages.length > 0) {
    const keyMultiatlas = {
      textures: keyPages.map((page, pageIndex) => ({
        image: keyPageFileNames[pageIndex],
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
      meta: { app: 'compile-layered-avatar.cjs', version: COMPILER_VERSION, character },
    };
    atlasJsonString = JSON.stringify(emitVerbose ? keyMultiatlas : compactAtlas(keyMultiatlas));
  }

  // This key's own pieces/frames — `pack` is the key's own name (self-referential, one pack
  // per key), matching `sequences[key].pack` set by the caller. Iterated in DEDUP order
  // (`pieceIds`), not packing order, so the compact-form piece-index encoding stays stable.
  const keyPiecesOut = {};
  for (const pieceId of pieceIds) {
    const location = keyPieceLocation.get(pieceId);
    const piece = piecesById[pieceId];
    keyPiecesOut[pieceId] = {
      frame: { x: location.x, y: location.y, w: location.w, h: location.h },
      page: location.page,
      w: piece.w,
      h: piece.h,
      slot: piece.slot,
      pack: key,
    };
  }
  const keyFramesOut = {};
  for (const frameId of frameIds) {
    keyFramesOut[frameId] = framesById[frameId];
  }

  let manifestJsonString = null;
  if (keyPages.length > 0) {
    const keyManifestOut = { pieces: keyPiecesOut, frames: keyFramesOut };
    manifestJsonString = JSON.stringify(emitVerbose ? keyManifestOut : compactManifest(keyManifestOut));
  }

  return { keyBaseName, keyPageFileNames, pageBuffers, atlasJsonString, manifestJsonString, keyPiecesOut, keyFramesOut };
}

/**
 * design.md §13.7 (tasks.md slice 20): the key's own real measured packed transfer — webp
 * bytes (never gzip'd, `emit-gzip-siblings.cjs`'s own documented reason: already-compressed
 * bytes gain nothing) plus gzip level 9 of the atlas/manifest JSON (matching `emit-gzip-
 * siblings.cjs`'s real compression level and `nginx`'s `gzip_static` serving), the SAME
 * components the R18 gate's own M3 rows sum as `content-length`. Zero for a key with no pages.
 */
async function measureActionKeyPackedBytes(character, key, keyPages, piecesById, pieceIds, frameIds, framesById) {
  if (keyPages.length === 0) return 0;
  const built = await buildActionKeyPack(character, key, keyPages, piecesById, pieceIds, frameIds, framesById, false);
  return sumPackedTransferBytes(
    built.pageBuffers.map((buffer) => buffer.length),
    [built.atlasJsonString, built.manifestJsonString]
  );
}

async function main() {
  // design.md §12.3: consume the shared vector modules via dynamic import() before anything
  // else runs (see the module-scope `let` bindings declared above their old require() lines).
  const sharedSlotRuns = await import('../src/shared/assetPipeline/slotRuns.js');
  const sharedPathBounds = await import('../src/shared/assetPipeline/pathBounds.js');
  const sharedPackFrames = await import('../src/shared/assetPipeline/packFrames.js');
  const sharedCompactAtlas = await import('../src/shared/assetPipeline/compactAtlas.js');
  const sharedCompactManifest = await import('../src/shared/assetPipeline/compactManifest.js');
  partitionSlotRuns = sharedSlotRuns.partitionSlotRuns;
  packFrames = sharedPackFrames.packFrames;
  compactAtlas = sharedCompactAtlas.compactAtlas;
  compactManifest = sharedCompactManifest.compactManifest;
  setSharedVectorBounds(sharedPathBounds);

  // design.md §9.1 (tasks.md slice 16): compact emission is now the DEFAULT — `--emit-verbose`
  // opts into the pre-compaction, human-readable form (debugging only; the runtime always
  // expands whichever form it loads, so this flag changes on-disk bytes, never behaviour).
  const emitVerbose = process.argv.includes('--emit-verbose');

  const character = process.argv[2];
  if (!character) {
    console.error('Usage: node compile-layered-avatar.cjs <character>');
    process.exit(1);
  }

  const inputDir = path.resolve(__dirname, '..', '.assets-src/layered', character);
  const actionsDir = path.join(inputDir, 'actions');
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
  const bakedKeyMap = readBakedKeyMap(character);
  const sequences = {};
  for (const key of animKeys) {
    const frames = readJson(path.join(inputDir, `${key}.json`));
    const bakedEntry = Object.values(bakedKeyMap).find((e) => e.source === key);
    const fps = bakedEntry ? bakedEntry.fps : 19;
    const repeat = bakedEntry ? bakedEntry.repeat : key.endsWith('_talk') ? 0 : -1;
    // design.md §13.2 (tasks.md slice 14 task 4): `pack` is a self-contained signal
    // `computeActionBackedKeys` reads directly — with the manifest split, the base manifest no
    // longer carries action pieces/frames to dereference, so pack membership must be a fact
    // about the SEQUENCE itself, decided here where it is already known, not inferred later by
    // looking up a frame that may not be present yet.
    sequences[key] = { fps, repeat, frames, pack: 'base' };
  }

  // design.md §5.4: origin-space assertion, checked BEFORE any action rendering work — the
  // whole slice rests on the vector and raster packages sharing one rig space.
  let actionResult = { sequences: {}, pieces: {}, frames: {}, luminanceWarnings: [] };
  let aliases = {};
  let mirrors = {};
  // design.md §13.7 (resolved by user decision 2026-08-18, tasks.md slice 20 task 3): reported
  // per character in the shipped manifest — the resulting ss:1-selected key set, never a silent
  // internal choice. Stays `{}` for a character with no over-budget key (the common case).
  let ssOverrides = {};

  if (fs.existsSync(actionsDir)) {
    const vectorFrames = readJson(path.join(actionsDir, '_frames_down_idle.json'));
    const vectorSeq = readJson(path.join(actionsDir, 'down_idle.json'));
    const vectorOrigin = vectorFrames[vectorSeq[0]].o;
    const rasterOrigin = framesRaw[Number(sequences.down_idle.frames[0])].o;
    assertOriginSpaceMatch(vectorOrigin, rasterOrigin);

    actionResult = await compileActionSequences(actionsDir, sequences, { ss: SS });

    // design.md §13.7 (tasks.md slice 20): a real, measurement-driven two-pass compile per key.
    // Pack every key at ss:2 (the pass just completed above), measure its REAL packed transfer
    // (webp bytes + gzip'd atlas/manifest JSON — the same components the R18 gate's M3 rows
    // measure), and recompile ONLY the over-budget key(s) at ss:1. Every other key, and the
    // entire body, stays at ss:2 — per the user's explicit 2026-08-18 decision.
    const measurementActionKeyToRects = {};
    for (const [key, ids] of Object.entries(actionResult.keyPieceIds || {})) {
      measurementActionKeyToRects[key] = ids.map((id) => ({
        id,
        w: actionResult.pieces[id].frame.w,
        h: actionResult.pieces[id].frame.h,
      }));
    }
    const measurementPagesPerKey = packActionPiecesPerKey(measurementActionKeyToRects, packFrames, MAX_PAGE_SIZE);

    const measuredBytesByKey = {};
    for (const [key, keyPages] of Object.entries(measurementPagesPerKey)) {
      if (keyPages.length === 0) continue;
      // eslint-disable-next-line no-await-in-loop
      measuredBytesByKey[key] = await measureActionKeyPackedBytes(
        character,
        key,
        keyPages,
        actionResult.pieces,
        actionResult.keyPieceIds[key] || [],
        actionResult.keyFrameIds[key] || [],
        actionResult.frames
      );
    }

    const ssPlan = planActionKeySsOverrides(measuredBytesByKey, ACTION_KEY_TRANSFER_BUDGET_BYTES);
    ssOverrides = ssPlan.ssOverrides;

    if (ssPlan.overrideKeys.length > 0) {
      console.log(
        `[compile-layered-avatar] ss:1 selected for over-budget action key(s) on ${character}: ` +
          ssPlan.overrideKeys
            .map((key) => `${key} (measured ${measuredBytesByKey[key]} B at ss:2, budget ${ACTION_KEY_TRANSFER_BUDGET_BYTES} B)`)
            .join(', ')
      );

      const recompiled = await compileActionSequences(actionsDir, sequences, {
        ss: 1,
        onlyKeys: ssPlan.overrideKeys,
        startPieceCounter: actionResult.nextPieceCounter,
        startFrameCounter: actionResult.nextFrameCounter,
      });
      mergeSsOverrideResults(actionResult, ssPlan.overrideKeys, recompiled);
    } else {
      console.log(
        `[compile-layered-avatar] ss:1 rule (design.md §13.7, tasks.md slice 20): every action ` +
          `key on ${character} measured within the ${ACTION_KEY_TRANSFER_BUDGET_BYTES} B budget at ss:2 — no override needed.`
      );
    }

    // Action sequences arrive with only `.frames` (compileActionSequences has no timing data
    // of its own — timing is a baked-config concept); resolve fps/repeat the SAME way base
    // sequences do, from whichever baked key names this action as its source.
    // design.md §13.3 (tasks.md slice 15): `pack` is SELF-REFERENTIAL for a directly-compiled
    // action sequence — one compiled key = one dedicated per-key pack, named after the key
    // itself, so `computeActionBackedKeys` (LayeredAvatar.js) can hand that exact name straight
    // to `loadLayeredActionKey` with no further indirection.
    for (const [key, seq] of Object.entries(actionResult.sequences)) {
      const bakedEntry = Object.values(bakedKeyMap).find((e) => e.source === key);
      sequences[key] = {
        fps: bakedEntry ? bakedEntry.fps : 19,
        repeat: bakedEntry ? bakedEntry.repeat : -1,
        frames: seq.frames,
        pack: key,
      };
    }

    const derived = deriveAliasesAndMirrors(sequences, bakedKeyMap);
    aliases = derived.aliases;
    mirrors = derived.mirrors;
  } else {
    // design.md §5.5 fallback (no actions directory staged yet — pre-PR5 characters, or a
    // character genuinely compiled base-only): mirrors still derives from bakedKeyMap for the
    // base idle/talk/walk keys already present, matching the old MIRROR_SOURCE_PREFIXES
    // behaviour exactly for that subset.
    const derived = deriveAliasesAndMirrors(sequences, bakedKeyMap);
    aliases = derived.aliases;
    mirrors = derived.mirrors;
  }

  // BLOCKER fix (2026-08-18): `deriveAliasesAndMirrors` above derives nothing for a character
  // with no baked `config.json` precedent (bakedKeyMap === {}) — sally shipped with 0 mirrors as
  // a result, and right/rightdown/rightup silently degraded to an unrelated down_idle pose (5 of
  // 8 directions rendered). Every `.layers.bb` in this asset set ships only left-family source
  // art and encodes "right mirrors left" as a universal convention, so the fallback derives the
  // mirror map from the compiled sequence names themselves instead of leaving it empty. A baked
  // config, when present, is the sole authority and this path is not consulted for that
  // character (bakedKeyMap would already be non-empty).
  if (Object.keys(bakedKeyMap).length === 0) {
    mirrors = { ...mirrors, ...deriveConventionMirrors(sequences) };
  }

  if (actionResult.luminanceWarnings.length > 0) {
    console.warn(`[compile-layered-avatar] action-pack luminance warnings for ${character}:`);
    actionResult.luminanceWarnings.forEach((w) => console.warn(`  - ${w}`));
  }

  // Collect every unique BASE piece referenced by any frame, keyed by its source file index.
  const pieceUsage = new Map(); // pieceId -> { w, h, slot, fileName }
  framesRaw.forEach((frame) => {
    frame.L.forEach((l) => {
      const pieceId = `p${l.p}`;
      if (!pieceUsage.has(pieceId)) {
        pieceUsage.set(pieceId, { w: l.w, h: l.h, slot: l.s || null, fileName: `p${l.p}.png` });
      }
    });
  });

  // Validate ss:2 and gather actual pixel metadata for every unique base piece.
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
    console.warn(`[compile-layered-avatar] base-pack luminance warnings for ${character}:`);
    luminanceWarnings.forEach((w) => console.warn(`  - ${w}`));
  }

  // Pack every unique BASE piece raster into one or more pages (design.md §3.1 step 3).
  const { pages } = packFrames(pieceRects, { maxSize: MAX_PAGE_SIZE });
  checkPageBudget(pages.length, BASE_PAGE_BUDGET);

  const pieceLocation = new Map(); // pieceId -> { page, x, y, w, h }
  pages.forEach((page, pageIndex) => {
    page.placements.forEach((placement) => {
      pieceLocation.set(placement.id, { page: pageIndex, ...placement });
    });
  });

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
      .webp(BASE_WEBP_OPTIONS)
      .toFile(path.join(outputDir, pageFileNames[pageIndex]));
  }

  const baseMultiatlas = {
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
    meta: { app: 'compile-layered-avatar.cjs', version: COMPILER_VERSION, character },
  };
  fs.writeFileSync(
    path.join(outputDir, `${baseName}.atlas.json`),
    JSON.stringify(emitVerbose ? baseMultiatlas : compactAtlas(baseMultiatlas))
  );

  // design.md §13.3 (tasks.md slice 15): PER-KEY action packs — each compiled key gets its own
  // page set, own atlas/webp(+pages)/manifest files, gated by its own (higher) page budget.
  // Replaces the single, whole-pack-per-character emission slices 6/14 shipped. Empty when this
  // character has no actions directory staged yet (pre-PR5 characters, base-only contract).
  const actionKeyToRects = {};
  for (const [key, ids] of Object.entries(actionResult.keyPieceIds || {})) {
    actionKeyToRects[key] = ids.map((id) => ({
      id,
      w: actionResult.pieces[id].frame.w,
      h: actionResult.pieces[id].frame.h,
    }));
  }
  const pagesPerKey = packActionPiecesPerKey(actionKeyToRects, packFrames, MAX_PAGE_SIZE);

  const actionName = `${character}.actions`;
  const actionPacksInfo = []; // for the layers manifest — introspection only, not load-critical
  let actionUniquePieceCount = 0;

  for (const [key, keyPages] of Object.entries(pagesPerKey)) {
    if (keyPages.length > 0) checkPageBudget(keyPages.length, ACTION_PAGE_BUDGET);

    // design.md §13.7 (tasks.md slice 20): the SAME builder the measurement pre-pass called —
    // for a key that was NOT selected for ss:1, `pagesPerKey` here (rebuilt from the now-final
    // `actionResult`, post `mergeSsOverrideResults`) is byte-identical to the measurement pass's
    // own packing, so this is not a second independent code path, just a second real call.
    // eslint-disable-next-line no-await-in-loop
    const built = await buildActionKeyPack(
      character,
      key,
      keyPages,
      actionResult.pieces,
      actionResult.keyPieceIds[key] || [],
      actionResult.keyFrameIds[key] || [],
      actionResult.frames,
      emitVerbose
    );

    for (let pageIndex = 0; pageIndex < built.pageBuffers.length; pageIndex++) {
      fs.writeFileSync(path.join(outputDir, built.keyPageFileNames[pageIndex]), built.pageBuffers[pageIndex]);
    }
    if (built.atlasJsonString !== null) {
      fs.writeFileSync(path.join(outputDir, `${built.keyBaseName}.atlas.json`), built.atlasJsonString);
    }
    if (built.manifestJsonString !== null) {
      fs.writeFileSync(path.join(outputDir, `${built.keyBaseName}.manifest.json`), built.manifestJsonString);
    }

    actionPacksInfo.push({ key, pages: keyPages.length });
    actionUniquePieceCount += (actionResult.keyPieceIds[key] || []).length;
    // Merged into the FULL in-memory `pieces` dict below (still needed for
    // `--emit-config-shim`, which reads `frames[].o` across every pack) — overwrite raw entries
    // with the final, located+tagged shape.
    Object.assign(actionResult.pieces, built.keyPiecesOut);
  }

  // Body bounds: the bounding box every BASE frame's pieces occupy, in the same coordinate
  // space as `o`/`dx,dy` — used by the name-tag height calc equivalent (scaleBodyBounds).
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
      pack: 'base',
    };
  }
  // design.md §13.3: every action piece's final, located+tagged entry was written into
  // `actionResult.pieces` in the per-key loop above (`pack` already set to its own key).
  Object.assign(pieces, actionResult.pieces);

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
  Object.assign(frames, actionResult.frames);

  // Live defect fix (tasks.md slice 26): NOT merely `Object.keys(colormeta.defaults)` — a
  // character whose vector `.bb` colormeta is genuinely empty can still have `.layers.bb` base
  // pieces that tag themselves with a recolour slot (`computeManifestSlots.cjs`'s own docblock
  // has the full account: ninja/werewolf do, `sally` does not). `resolvePalette` only ever
  // considers slots present in THIS field, so under-reporting it silently drops every custom
  // palette override for the missing slot(s), not merely the default colour.
  const slots = computeManifestSlots(colormeta.defaults, pieces);

  const manifest = {
    v: 1,
    compilerVersion: COMPILER_VERSION,
    // Live-discovered defect fix (PR4): `readdirSync` also returns the `actions/` subdirectory
    // this change's staging convention places alongside the base layers content (design.md
    // §4) — `fs.readFileSync` on a directory throws EISDIR. Only regular files are hashed.
    sourceHash: sha1OfInputs(inputDir, filterRegularFileNames(fs.readdirSync(inputDir, { withFileTypes: true }))),
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
    aliases,
    mirrors,
    actionPacks: actionPacksInfo,
    // Live defect fix (tasks.md slice 26): `LayeredAvatar`'s pooled-child array is sized ONCE,
    // at construction, from whatever `manifest.frames` holds AT THAT MOMENT — the base pack
    // only, since action packs are lazy-loaded and merged in later. Any action key needing MORE
    // pieces per frame than the base pack's own max silently drops the excess (`_applyFrame`'s
    // `if (!child) return`), confirmed against every character compiled before this fix,
    // including already-shipped `rasta`/`sally`. Computed here, across the FULL merged
    // base+action `frames` dict (the one point in this pipeline that already has that complete
    // picture), and shipped as a character-level fact `LayeredAvatar.computeMaxPoolSize` now
    // prefers over its own (incomplete-at-construction-time) frames scan.
    maxFramePieces: computeMaxFramePieces(frames),
    // design.md §13.7 (resolved by user decision 2026-08-18, tasks.md slice 20 task 3): the
    // reported ss:1-selected key set — key -> 1 for an over-budget action key, absent (never a
    // key with value 2) for every key that stayed at the project's ss:2 contract. `{}` when no
    // key needed the override. `LayeredAvatar._applyFrame` (`resolvePieceSs`, pivot.js) reads
    // this directly, keyed by a piece's own `pack`.
    ssOverrides,
  };
  // design.md §13.2/§13.3 (tasks.md slices 14/15): the base pack's own manifest (character-
  // level fields + base pieces/frames — everything room entry needs). The per-KEY action
  // manifests were already written directly in the per-key loop above (`<char>.actions.<key>.
  // manifest.json`), superseding slice 14's single aggregate `<char>.actions.manifest.json` —
  // `splitLayeredManifest`'s `actions` half is unused here now (kept for its OWN test coverage
  // and for any future caller that still wants "every action piece/frame in one place"). The
  // FULL, unsplit `manifest` object above is what `--emit-config-shim` below still reads (it
  // needs `sequences`/`bodyBounds`/`frames[].o` across every pack, since a sequence like
  // `down_llorar` references action-pack frame ids).
  const { layers: layersManifest } = splitLayeredManifest(manifest);
  const layersManifestOnDisk = JSON.stringify(emitVerbose ? layersManifest : compactManifest(layersManifest));
  fs.writeFileSync(path.join(outputDir, `${baseName}.manifest.json`), layersManifestOnDisk);

  // design.md §15 (tasks.md slice 10 task 4): `--emit-config-shim` — for a character with NO
  // baked art at all (sally), write a baked-shaped `config.json` (`atlasKey: null`) derived
  // from THIS manifest, so `window.avatars_config[avatarId]` consumers see a well-formed entry
  // instead of `undefined`. Opt-in: every already-migrated character already has a real baked
  // `config.json` and must never have it overwritten.
  if (process.argv.includes('--emit-config-shim')) {
    const { buildConfigShim } = require('./lib/buildConfigShim.cjs');
    const shim = buildConfigShim(manifest);
    fs.writeFileSync(path.join(outputDir, '..', 'config.json'), JSON.stringify(shim));
    console.log(`[compile-layered-avatar] wrote config shim: ${path.join(outputDir, '..', 'config.json')} (${Object.keys(shim).length} entries, atlasKey: null)`);
  }

  console.log(`[compile-layered-avatar] wrote ${character}:`);
  console.log(`  base pages: ${pages.length}`);
  console.log(`  base unique pieces: ${pieceUsage.size}`);
  console.log(`  action packs (per key): ${actionPacksInfo.map((p) => `${p.key}:${p.pages}p`).join(', ') || '(none)'}`);
  console.log(`  action total pages (sum across all keys): ${actionPacksInfo.reduce((sum, p) => sum + p.pages, 0)}`);
  console.log(`  action unique pieces (sum across all keys, cross-key dedup not attempted): ${actionUniquePieceCount}`);
  console.log(`  frames: ${framesRaw.length} base + ${Object.keys(actionResult.frames).length} action`);
  console.log(`  sequences: ${Object.keys(sequences).length} (${Object.keys(sequences).join(', ')})`);
  console.log(`  aliases: ${Object.keys(aliases).join(', ') || '(none)'}`);
  console.log(`  mirrors: ${Object.keys(mirrors).join(', ')}`);
  console.log(`  slots: ${slots.join(', ')}`);
  console.log(`  layers manifest bytes on disk (${emitVerbose ? 'verbose' : 'compact'}): ${layersManifestOnDisk.length}`);
  console.log(`  output: ${outputDir}`);
}

main().catch((err) => {
  console.error('[compile-layered-avatar] FAILED:', err.message);
  process.exit(1);
});
