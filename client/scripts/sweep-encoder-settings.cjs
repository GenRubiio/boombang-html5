#!/usr/bin/env node
// design.md §13.5 (tasks.md slice 17 task 3): sweeps candidate webp encoder settings against
// the real lossless baseline, keeping whatever the fidelity gate allows — design §13.8's own
// gate, reused here: ≤ 1% differing pixels at tolerance 8, 0 at tolerance 32, via
// `compareRasters.diffRgbaBuffers`.
//
//   node scripts/sweep-encoder-settings.cjs <webpPath>

const fs = require('fs');
const sharp = require('sharp');
const { zeroRgbWhereEitherTransparent } = require('./lib/assetByteMetrics.cjs');

const FIDELITY_GATE = { tol8MaxFraction: 0.01, tol32MaxFraction: 0 };

const CANDIDATES = [
  { name: 'effort:6 (from sharp default 4)', options: { lossless: true, effort: 6 } },
  { name: 'nearLossless:60', options: { nearLossless: true, quality: 60 } },
  { name: 'nearLossless:80', options: { nearLossless: true, quality: 80 } },
  { name: 'lossy alphaQuality:100', options: { lossless: false, quality: 90, alphaQuality: 100 } },
  { name: 'lossy alphaQuality:90', options: { lossless: false, quality: 90, alphaQuality: 90 } },
  { name: 'lossy alphaQuality:80', options: { lossless: false, quality: 90, alphaQuality: 80 } },
];

async function main() {
  const [webpPath] = process.argv.slice(2);
  if (!webpPath) {
    console.error('Usage: node sweep-encoder-settings.cjs <webpPath>');
    process.exit(1);
  }

  const { diffRgbaBuffers } = await import('../src/shared/assetPipeline/compareRasters.js');

  const originalBuffer = fs.readFileSync(webpPath);
  const { data: baselineRaw, info } = await sharp(originalBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const totalPixels = info.width * info.height;

  console.log(`[sweep-encoder-settings] ${webpPath} (${info.width}x${info.height}, ${totalPixels} px)`);
  console.log(`  lossless baseline: ${originalBuffer.length} B`);

  for (const candidate of CANDIDATES) {
    const candidateBuffer = await sharp(originalBuffer).webp(candidate.options).toBuffer();
    const { data: candidateRaw } = await sharp(candidateBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    // design.md §13.5 (tasks.md slice 17 task 3, live-discovered): a fully-transparent
    // pixel's RGB bytes are compositor-invisible "don't care" values that legitimately differ
    // across encodes with zero visual effect — without this normalization, even a byte-for-
    // byte-identical LOSSLESS re-encode at a different `effort` level reports a large false
    // "fidelity failure" driven entirely by transparent-region RGB noise (confirmed live:
    // 615,514 of 1,636,783 transparent-pixel comparisons "differed" by this artifact alone,
    // while 0 of 341,102 real, visible pixels ever did).
    const [normBaseline, normCandidate] = zeroRgbWhereEitherTransparent(baselineRaw, candidateRaw);
    const tol8 = diffRgbaBuffers(normBaseline, normCandidate, info.width, info.height, { tolerance: 8 });
    const tol32 = diffRgbaBuffers(normBaseline, normCandidate, info.width, info.height, { tolerance: 32 });
    const tol8Fraction = tol8.differingPixels / totalPixels;
    const tol32Fraction = tol32.differingPixels / totalPixels;
    const passesGate = tol8Fraction <= FIDELITY_GATE.tol8MaxFraction && tol32Fraction <= FIDELITY_GATE.tol32MaxFraction;

    console.log(
      `  ${candidate.name}: ${candidateBuffer.length} B (${((candidateBuffer.length / originalBuffer.length) * 100).toFixed(1)}% of baseline), ` +
      `tol8 ${(tol8Fraction * 100).toFixed(3)}% differing, tol32 ${(tol32Fraction * 100).toFixed(3)}% differing -> ${passesGate ? 'PASSES gate' : 'FAILS gate'}`
    );
  }
}

main();
