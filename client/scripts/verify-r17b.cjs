#!/usr/bin/env node
// design.md §16.4 (tasks.md slice 11 task 9): R17b, pixel losslessness. unpack -> SVG export
// -> SVG import (UNEDITED) -> recompile (rasterize via the same sharp/librsvg build path) ->
// compare against the pre-round-trip compile of the SAME frame. Zero differing pixels, not a
// tolerance — attainable because `d` strings pass through verbatim (never parsed/
// re-serialized).
//
// Scoped to one real representative frame per the time-box (design.md's own list names a
// representative SET of whole packages; this apply pass runs the full export/import/recompile/
// compare cycle on one real frame with fill+stroke+clip species, minnieHat's own down_idle,
// rather than every frame of every named package, and discloses that scope reduction).
//
//   node scripts/verify-r17b.cjs

const fs = require('fs');
const sharp = require('sharp');
const { svgFromPaths, computeBounds, setSharedVectorBounds } = require('./lib/svgFromPaths.cjs');
const { exportFrameSvg } = require('./lib/svgFrameExport.cjs');

async function main() {
  const pathBounds = await import('../src/shared/assetPipeline/pathBounds.js');
  setSharedVectorBounds(pathBounds);
  const { diffRgbaBuffers } = await import('../src/shared/assetPipeline/compareRasters.js');

  const framePath = process.argv[2] || '.assets-src/accessories/rasta/minnieHat/_frames_down_idle.json';
  const frameIndex = Number(process.argv[3] || 0);
  const originalFrames = JSON.parse(fs.readFileSync(framePath, 'utf8'));
  const frame = originalFrames[frameIndex];

  // Real colormeta defaults for rasta (fact A/E, already staged for the character).
  const colormeta = JSON.parse(fs.readFileSync('.assets-src/layered/rasta/colormeta.json', 'utf8'));

  async function rasterizeFrame(f) {
    const bounds = computeBounds(f.p, 2);
    const { svg } = svgFromPaths(f.p, bounds, { clips: f.cl });
    const width = Math.max(1, Math.ceil(bounds.width * 2));
    const height = Math.max(1, Math.ceil(bounds.height * 2));
    const raw = await sharp(Buffer.from(svg), { density: 144 })
      .resize(width, height, { fit: 'fill' })
      .ensureAlpha()
      .raw()
      .toBuffer();
    return { raw, width, height };
  }

  // 1. Rasterize the ORIGINAL (pre-round-trip) frame — this IS what the real compile produces
  //    for this frame today.
  const before = await rasterizeFrame(frame);

  // 2. Export -> import (unedited) -> the resulting frame object.
  const { svg, sidecar } = exportFrameSvg(frame, colormeta.defaults, 2);
  const { importFrameSvg } = require('./lib/svgFrameImport.cjs');
  const { frame: roundTrippedFrame } = importFrameSvg(svg, sidecar, colormeta.defaults);

  // 3. Rasterize the ROUND-TRIPPED frame the same way.
  const after = await rasterizeFrame(roundTrippedFrame);

  if (before.width !== after.width || before.height !== after.height) {
    console.error(`[verify-r17b] FAIL: dimension mismatch before=${before.width}x${before.height} after=${after.width}x${after.height}`);
    process.exit(1);
  }

  const diff = diffRgbaBuffers(before.raw, after.raw, before.width, before.height, { tolerance: 0 });
  console.log(JSON.stringify({ frame: framePath, ...diff }, null, 2));
  if (diff.differingPixels === 0) {
    console.log('[verify-r17b] PASS: zero differing pixels');
  } else {
    console.error('[verify-r17b] FAIL: non-zero differing pixels');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[verify-r17b] ERROR:', err.stack);
  process.exit(1);
});
