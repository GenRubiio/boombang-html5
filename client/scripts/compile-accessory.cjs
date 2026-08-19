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
const zlib = require('zlib');
const sharp = require('sharp');

const { svgFromPaths, computeBounds, setSharedVectorBounds } = require('./lib/svgFromPaths.cjs');
const { derivePetSide, resolvePetFrameCenterX } = require('./lib/petSide.cjs');
const { readBodyDownIdleOriginX } = require('./lib/bodyDownIdleOrigin.cjs');
const { validateCharArg } = require('./lib/validateCharArg.cjs');
const { resolveSourceCharName } = require('./lib/resolveSourceCharName.cjs');
const { resolveAccessoryAnnotation, applyRegistrationOffset } = require('./lib/accessoryAnnotations.cjs');
const { checkPageBudget } = require('./lib/pageBudget.cjs');
// design.md §13.7 (resolved by user decision 2026-08-19): accessories have no per-key split
// (unlike the body's own per-action-key packs since slice 15) — the only lever available is a
// WHOLE-PACKAGE ss:1 recompile, decided by the SAME measurement rule and the SAME 1.2 MB budget
// the body's `left_fall`/`left_beber` were measured against (the user's own stated rationale: a
// hat renders small, is often partly hidden by hair, and is where losing crispness costs least —
// the same reasoning, reused, not a new rule).
const { selectSsForActionKey } = require('./lib/selectActionKeySs.cjs');
const { sumPackedTransferBytes } = require('./lib/packedTransferBytes.cjs');

// design.md §12.3 (tasks.md slice 8 task 2): `packFrames` moved to
// client/src/shared/assetPipeline/packFrames.js — populated once, early in `compileVector()`, via
// dynamic import().
let packFrames;

const MAX_SHEET_SIZE = 4096;
const COMPILER_VERSION = '1.0.0';
// design.md §13.5 (tasks.md slice 17): `effort: 6` is lossless and free (measured
// byte-identical-or-smaller on rasta's own body pages, zero fidelity cost by definition) — kept
// conservative here versus `compile-layered-avatar.cjs`'s action-pack `nearLossless` setting,
// since only rasta's body pages were independently swept against the fidelity gate; accessory
// packages were not (a disclosed scope reduction, not an oversight).
const ACCESSORY_WEBP_OPTIONS = { lossless: true, effort: 6 };
// design.md §16.1 (tasks.md slice 11 task 1): the committed annotation file, keyed
// `<char>/<kind>/<key>` — survives a destructive re-stage of `.assets-src/`, unlike the old
// convention of hand-editing the staged `meta.json` directly (lost once already, PR4).
const ACCESSORY_ANNOTATIONS_PATH = path.resolve(__dirname, 'accessory-annotations.json');

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
const BASE_RASTER_DPI = 72; // design.md §5.4/§13.7: 1x reference DPI; density = BASE_RASTER_DPI * ss
const MAX_PAGE_SIZE = 4096;
// tasks.md slice 28 task 2 (design.md §13.8's own gate table): accessory packages warn above 2
// pages, fail above 3 — re-derived here from the same pure `checkPageBudget` the body compiler
// already uses for its base (fail above 2) and action (warn at 5, fail above 8) packs. This gate
// did not exist in compile-accessory.cjs before this slice — `pageBudget.test.cjs`'s own
// docblock already documented the accessory thresholds as design intent, but no call site ever
// enforced them.
const ACCESSORY_PAGE_BUDGET = { warnAt: 2, failAbove: 3 };
// design.md §13.7/§13.8: the M3 worst-key gate's own budget (<= 1.2 MB), reused directly as the
// whole-package selection threshold — the exact same number and pure `selectSsForActionKey`
// rule the body's per-action-key ss:1 override already uses (tasks.md slice 20).
const ACCESSORY_SS_TRANSFER_BUDGET_BYTES = Math.round(1.2 * 1024 * 1024);
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

async function renderFrameRaster(frame, { noClips = false, ss = SS } = {}) {
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

  // `computeBounds`'s `ss` param (PR5 fix) floors an extremely thin bounding box to a minimum
  // renderable size — the same real-data edge case (a sub-pixel fill sliver) found in rasta's
  // action set could equally occur in an accessory package. `ss` is now a real parameter (design
  // §13.7's whole-package ss:1 rule), not the module constant — an over-budget package renders
  // its ENTIRE frame set at half density, base.js §5.4's own `BASE_RASTER_DPI * ss` convention.
  const bounds = computeBounds(frame.p, ss);
  // design.md §5.3 (fact J): `frame.cl` is the clip-shape map a `k`-carrying path references.
  // `--no-clips` (the apply-phase verification fallback) omits it entirely, reproducing the
  // pre-clip-support behaviour exactly.
  const { svg } = svgFromPaths(frame.p, bounds, { clips: noClips ? undefined : frame.cl });
  const raster = await sharp(Buffer.from(svg), { density: BASE_RASTER_DPI * ss }).png().toBuffer();
  const metadata = await sharp(raster).metadata();
  return { raster, bounds, width: metadata.width, height: metadata.height };
}

// design.md §4/§7: input staging is character-scoped
// (`.assets-src/accessories/<char>/<key>/`, stage-layered-source.sh's convention); compiled
// output is character-scoped too EXCEPT for the atlas/manifest naming, which stays
// `<key>.<kind>.*` — the directory nesting is what disambiguates two characters' packages
// sharing one key (e.g. `Custom6Hat` under both `rasta` and `lilian`). Extracted so the
// whole-package ss:1 orchestrator (`compileAccessoryWithSsRule`) resolves the SAME directory
// `compileVector` writes into, rather than recomputing the path a second time and risking drift.
function resolveAccessoryOutputDir(kind, char, key, outputSuffix = '') {
  return path.resolve(__dirname, '..', 'src/assets/game/accessories', kind, char, `${key}${outputSuffix}`);
}

async function compileVector(kind, key, char, { noClips = false, outputSuffix = '', ss = SS } = {}) {
  // design.md §12.3: consume the shared vector modules via dynamic import() before anything
  // else runs (see the module-scope `let packFrames` declared above).
  const sharedPathBounds = await import('../src/shared/assetPipeline/pathBounds.js');
  const sharedPackFrames = await import('../src/shared/assetPipeline/packFrames.js');
  packFrames = sharedPackFrames.packFrames;
  setSharedVectorBounds(sharedPathBounds);

  const inputDir = path.resolve(__dirname, '..', '.assets-src/accessories', char, key);
  // `outputSuffix` is the apply-phase clip-verification hook only (design.md §5.3) — a
  // side-by-side compile of the SAME package with/without clips, into a scratch directory
  // never read by the runtime, so the diff never touches the real registered output.
  const outputDir = resolveAccessoryOutputDir(kind, char, key, outputSuffix);
  // design.md §13.7 (whole-package ss:1): a package may be compiled here more than once (an
  // ss:2 measurement pass, then a real ss:1 recompile) — clear any stale output first so a
  // page count that SHRINKS between the two passes never leaves an orphaned page file behind
  // (e.g. an ss:2 2-page hat recompiled at ss:1 into 1 page must not leave the old `_1.webp`).
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const meta = readJson(path.join(inputDir, 'meta.json'));
  if (meta.kind !== kind) {
    throw new Error(`compile-accessory: meta.json declares kind "${meta.kind}", expected "${kind}"`);
  }
  // design.md §4/§7: hard-fail on a missing/disagreeing meta.char BEFORE any rendering work —
  // a package staged/registered under the wrong character must never silently compile.
  // Live-caught defect (tasks.md slice 30): `char` here is the CLIENT name (e.g. "boomer"),
  // used unchanged for the output directory nesting below (`accessories/<kind>/boomer/<key>/`,
  // matching the body's own `avatars/boomer/` convention). The staged package's OWN
  // `meta.json.char` is unaffected by which directory it is staged into and still reads the
  // source archive's own name ("bommer") for the one known srcName != char exception — validate
  // against the RECONCILED name, not the raw CLI arg, mirroring the body compile's own (already
  // shipped, compiler-change-free) reconciliation.
  validateCharArg(resolveSourceCharName(char), meta.char);

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
      const { raster, bounds, width, height } = await renderFrameRaster(frame, { noClips, ss });
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

  // tasks.md slice 28 task 2: enforce BEFORE any file is written — a failing package must not
  // leave a partial compiled directory behind.
  const budget = checkPageBudget(pages.length, ACCESSORY_PAGE_BUDGET);
  if (budget.warned) {
    console.warn(`[compile-accessory] ${char}/${kind}/${key}: ${budget.message}`);
  }

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
      .webp(ACCESSORY_WEBP_OPTIONS)
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

  let frames = {};
  uniqueFrames.forEach((f, id) => {
    frames[String(id)] = {
      regX: f.regX,
      regY: f.regY,
      originX: f.originX,
      originY: f.originY,
    };
  });

  // design.md §16.1 (tasks.md slice 11 task 1): Tier 1 repositioning. Resolved from the
  // committed `accessory-annotations.json`, keyed `<char>/<kind>/<key>` — an offset for
  // `rasta/hat/Custom6Hat` cannot affect `lilian/hat/Custom6Hat`. Applied to EVERY frame's own
  // origin (the value `resolveAccessoryPlacement` actually reads at runtime) and recorded on
  // `base.regX`/`base.regY` below (the `packageBase` tier §7's `frameOverride ?? packageBase ??
  // sharedBase ?? 0` resolution names).
  const annotations = fs.existsSync(ACCESSORY_ANNOTATIONS_PATH) ? readJson(ACCESSORY_ANNOTATIONS_PATH) : {};
  const annotation = resolveAccessoryAnnotation(annotations, char, kind, key);
  if (annotation.regXOffset || annotation.regYOffset) {
    frames = applyRegistrationOffset(frames, annotation.regXOffset || 0, annotation.regYOffset || 0);
  }

  // Optional package-level scale correction (live-validation defect 8), resolved at runtime
  // the same override-then-base-then-default way as every other per-frame value (ACC1):
  // `accFrame.scale ?? manifest.base.scale ?? 1`. Not automatable — like the back-facing
  // `zBias` override above, this is a manual authoring correction on the STAGED INPUT
  // (`meta.json`'s own optional `scale` field, so it survives a recompile), applied only when
  // the raw source geometry has been directly, visually measured against the character's own
  // head size and found disproportionate. Left undefined (defaulting to 1 at runtime) for any
  // package whose `meta.json` does not declare one.
  const base = { regX: annotation.regXOffset || 0, regY: annotation.regYOffset || 0, zBias: kind === 'hat' ? DEFAULT_HAT_Z_BIAS : 0 };
  if (typeof annotation.scale === 'number') {
    base.scale = annotation.scale;
  }

  // design.md §8: pet canonical side, derived at compile time from this package's OWN
  // geometry (fact G — no accessory package declares a side), recorded in the manifest so
  // runtime never has to guess. `meta.side` is the same kind of staged, per-package escape
  // hatch `scale`/`groundOffsetY` already use.
  //
  // Correction (2026-08-18, apply-progress.md's "Correction 3"): compares the pet's FULLY
  // RESOLVED `down_idle` centre (`resolvePetFrameCenterX` — the same formula
  // `resolveAccessoryPlacement` uses at runtime) against the BODY's own `down_idle` frame
  // origin, not the pet's raw `regX` against a same-direction population median. The body must
  // already be compiled (`readBodyDownIdleOriginX` hard-fails clearly otherwise) — this package
  // and its body share one coordinate system by construction (fact, see `renderFrameRaster`'s
  // own `regX`/`regY` docblock above), so the body's own origin is the correct, direct
  // reference point, and no population/median proxy is needed at all.
  if (kind === 'pet') {
    const downIdleFrames = anims.down_idle && anims.down_idle.frames;
    if (!downIdleFrames || downIdleFrames.length === 0) {
      throw new Error(
        'compile-accessory (pet): no "down_idle" anim declared — cannot derive the canonical side (design.md §8). Stage an explicit "side" in meta.json to override.'
      );
    }
    const downIdleFrame = uniqueFrames[downIdleFrames[0]];
    const petCenterX = resolvePetFrameCenterX(downIdleFrame.regX, downIdleFrame.originX, downIdleFrame.width, ss);
    const avatarsDir = path.resolve(__dirname, '..', 'src/assets/game/avatars');
    const bodyOriginX = readBodyDownIdleOriginX(char, avatarsDir);

    const { side, derived } = derivePetSide(petCenterX, bodyOriginX, {
      overrideSide: meta.side,
    });
    base.side = side;
    console.log(
      `[compile-accessory] pet "${key}" side: ${side} (${derived ? `derived: down_idle centre ${petCenterX.toFixed(2)} vs. body origin ${bodyOriginX.toFixed(2)}` : 'overridden by meta.json.side'})`
    );
  }
  // Live-validation defect 12b fix: an optional, per-package ground-contact correction (logical
  // units, subtracted from every frame's `regY` at runtime — see resolveAccessoryPlacement's
  // `baseGroundOffsetY` docblock for the full derivation). Read the SAME way as `scale`, from an
  // optional `meta.json` field, so it survives a recompile.
  if (typeof annotation.groundOffsetY === 'number') {
    base.groundOffsetY = annotation.groundOffsetY;
  }

  // Architectural finding (user-raised, confirmed against the raw reference dump), now fully
  // resolved (design.md §4/§7, avatar-system-multichar-fixes PR4): accessory packages are PER
  // CHARACTER in the source data — the same hat/pet key is a genuinely different package
  // (different geometry, different frame counts, even different SEQUENCE LENGTHS) per
  // character. `meta.char` is validated above (`validateCharArg`, via the reconciled source
  // name) and emitted here so the registry (`AccessoryManager`) can assert it at load time too
  // — package identity and loading ARE character-scoped now, both by directory nesting
  // (`outputDir`) and by this field.
  //
  // Live-caught defect (tasks.md slice 30): this must be the CLIENT name (`char`, the function's
  // own parameter — already reconciled-validated against `meta.char` above), NOT the raw
  // `meta.char` itself. For every character except `boomer` the two are equal, so this was
  // silently correct by coincidence; for `boomer`, `meta.char` is the source archive's own name
  // ("bommer"), and `AccessoryManager.load()`'s `checkManifestCharMismatch` runtime check
  // compares this field against the CLIENT name every call site actually requests — emitting
  // the raw `meta.char` would print a spurious mismatch warning on EVERY boomer accessory load,
  // permanently, undermining the one signal that check exists to give for a REAL mismatch.
  const manifest = {
    v: 1,
    kind,
    key,
    char,
    compilerVersion: '1.0.0',
    ss,
    base,
    frames,
    anims,
  };
  fs.writeFileSync(path.join(outputDir, `${key}.accessory.json`), JSON.stringify(manifest));

  console.log(`[compile-accessory] wrote ${kind} "${key}" (${char}):`);
  console.log(`  unique frames: ${uniqueFrames.length}`);
  console.log(`  anims: ${animKeys.length}`);
  console.log(`  pages: ${pages.length}`);
  console.log(`  ss: ${ss}`);
  console.log(`  output: ${outputDir}`);

  return { outputDir, baseName, pageFileNames };
}

/**
 * design.md §13.7 (resolved by user decision 2026-08-19): compile at ss:1 the WHOLE package of
 * any hat/pet accessory whose real packed transfer exceeds the SAME 1.2 MB budget the body's
 * `left_fall`/`left_beber` were measured against — every other accessory, and every body, stays
 * at the project's ss:2 contract. A MEASUREMENT rule, not a key-name lookup, mirroring
 * `compile-layered-avatar.cjs`'s own per-action-key ss:1 override exactly (tasks.md slice 20):
 * compile once at ss:2 (the default every package has always used), measure the REAL written
 * output, and only recompile at ss:1 — a second, full pass — when that measurement is over
 * budget. Unlike the body, an accessory package has no per-key split to target individually, so
 * the "key" the measurement rule selects over is the WHOLE package.
 *
 * @param {'hat'|'pet'} kind
 * @param {string} key
 * @param {string} char
 * @param {object} [opts] forwarded to `compileVector` (`noClips`, `outputSuffix`)
 * @returns {Promise<{char:string, kind:string, key:string, ss2Bytes:number, finalSs:1|2,
 *   finalBytes:number}>} the real measured before/after bytes and the resulting ss — the
 *   reportable shape the roster-wide `ss:1` report (apply-progress.md) sums over.
 */
async function measureCompiledPackageBytes(outputDir, key, kind) {
  const baseName = `${key}.${kind}`;
  const atlasJsonString = fs.readFileSync(path.join(outputDir, `${baseName}.atlas.json`), 'utf8');
  const manifestJsonString = fs.readFileSync(path.join(outputDir, `${key}.accessory.json`), 'utf8');
  const atlas = JSON.parse(atlasJsonString);
  const webpByteLengths = atlas.textures.map((texture) => fs.statSync(path.join(outputDir, texture.image)).size);
  return sumPackedTransferBytes(webpByteLengths, [atlasJsonString, manifestJsonString]);
}

async function compileAccessoryWithSsRule(kind, key, char, opts = {}) {
  await compileVector(kind, key, char, { ...opts, ss: SS });
  const outputDir = resolveAccessoryOutputDir(kind, char, key, opts.outputSuffix);
  const ss2Bytes = await measureCompiledPackageBytes(outputDir, key, kind);

  const decision = selectSsForActionKey(ss2Bytes, ACCESSORY_SS_TRANSFER_BUDGET_BYTES);
  if (decision === 1) {
    console.log(
      `[compile-accessory] ${char}/${kind}/${key}: whole-package transfer ${ss2Bytes} B exceeds the ${ACCESSORY_SS_TRANSFER_BUDGET_BYTES} B budget (design.md §13.7) — recompiling the WHOLE package at ss:1`
    );
    await compileVector(kind, key, char, { ...opts, ss: 1 });
    const finalBytes = await measureCompiledPackageBytes(outputDir, key, kind);
    console.log(
      `[compile-accessory] ${char}/${kind}/${key}: ss:1 recompile measured ${finalBytes} B (was ${ss2Bytes} B at ss:2)`
    );
    return { char, kind, key, ss2Bytes, finalSs: 1, finalBytes };
  }
  return { char, kind, key, ss2Bytes, finalSs: 2, finalBytes: ss2Bytes };
}

function main() {
  const args = process.argv.slice(2);
  const kindIndex = args.indexOf('--kind');
  const kind = kindIndex !== -1 ? args[kindIndex + 1] : null;
  const charIndex = args.indexOf('--char');
  const char = charIndex !== -1 ? args[charIndex + 1] : null;
  // design.md §5.3: permanent escape hatch reproducing pre-clip-support behaviour exactly —
  // the apply-phase raster diff (apply-progress.md) confirmed `cl` IS a real clip (a non-zero
  // pixel difference on the one `down_idle` frame that carries it), so clips stay ON by
  // default; `--no-clips` remains available if a future package's clip data turns out broken.
  const noClips = args.includes('--no-clips');
  const key = args.filter(
    (a, i) =>
      a !== '--kind' &&
      args[i - 1] !== '--kind' &&
      a !== '--char' &&
      args[i - 1] !== '--char' &&
      a !== '--no-clips'
  )[0];

  if (!key) {
    console.error('Usage: node compile-accessory.cjs --kind <aura|hat|pet> --char <character> [--no-clips] <key>');
    process.exit(1);
  }

  if (kind === 'aura') {
    // design.md §7: auras are character-independent (ACC2) — no --char applies.
    compileAura(key);
  } else if (kind === 'hat' || kind === 'pet') {
    if (!char) {
      console.error('Usage: node compile-accessory.cjs --kind <hat|pet> --char <character> [--no-clips] <key> — --char is required (design.md §4/§7).');
      process.exit(1);
    }
    compileAccessoryWithSsRule(kind, key, char, { noClips }).catch((err) => {
      console.error('[compile-accessory] FAILED:', err.message);
      process.exit(1);
    });
  } else {
    console.error(`Unsupported --kind "${kind}"`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  compileVector,
  compileAccessoryWithSsRule,
  measureCompiledPackageBytes,
  resolveAccessoryOutputDir,
  ACCESSORY_SS_TRANSFER_BUDGET_BYTES,
};
