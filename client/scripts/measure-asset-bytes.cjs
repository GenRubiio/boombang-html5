#!/usr/bin/env node
// design.md §13.5 (tasks.md slice 17 tasks 1-2): settles whether alpha entropy or RGB-plane
// waste dominates a compiled package's `.webp` bytes — the premise an earlier design draft
// escalated ("slotted pieces are white masks with ~4 alpha levels, so alpha-only encoding is
// the big win") is explicitly flagged as untested and likely wrong (analysis: lossless WebP
// predicts spatially per channel, so a constant-white RGB plane should already cost near
// nothing, putting the bytes in alpha entropy × pixel count instead). This script measures it.
//
//   node scripts/measure-asset-bytes.cjs <packageDir> [<baseNameFilter>] [<pieceSampleSize>]
//
// <packageDir> must contain exactly one `.webp` (or `_N.webp` page siblings) and one
// `*.atlas.json` (Phaser multiatlas — always verbose-shaped for `frame`/`filename`, present for
// both bodies and accessories, unaffected by slice 16's compaction) MATCHING <baseNameFilter>
// (a filename prefix — needed since slice 15 put many independent per-key packs in the SAME
// directory, e.g. `rasta.layers.*` vs 26 different `rasta.actions.<key>.*`; omit the filter for
// a directory that holds only one pack, e.g. an accessory package's own directory). If the SAME
// directory also carries a body-shaped manifest with a top-level `pieces` dict (`slot` per
// piece), the alpha histogram samples only SLOTTED pieces (design's own "sample of slotted
// pieces" wording); accessories have no per-piece slot concept at all (verified: zero `slot`
// references in compile-accessory.cjs), so their histogram samples from the atlas's own frame
// list directly.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {
  computeCompressionRatio,
  attributeBytesToChannels,
  computeAlphaHistogram,
  topAlphaLevels,
} = require('./lib/assetByteMetrics.cjs');

function findPackageFiles(packageDir, baseNameFilter) {
  const allEntries = fs.readdirSync(packageDir, { withFileTypes: true }).filter((e) => e.isFile());
  const entries = baseNameFilter ? allEntries.filter((e) => e.name.startsWith(baseNameFilter)) : allEntries;
  const webpFiles = entries.filter((e) => e.name.endsWith('.webp')).map((e) => e.name).sort();
  let atlasJsonFile = null;
  let piecesJsonFile = null;
  for (const entry of entries) {
    if (!entry.name.endsWith('.json')) continue;
    const parsed = JSON.parse(fs.readFileSync(path.join(packageDir, entry.name), 'utf8'));
    if (!atlasJsonFile && Array.isArray(parsed.textures)) {
      atlasJsonFile = entry.name;
    }
    if (!piecesJsonFile && parsed && typeof parsed.pieces === 'object' && parsed.pieces !== null) {
      piecesJsonFile = entry.name;
    }
  }
  if (webpFiles.length === 0 || !atlasJsonFile) {
    throw new Error(`measure-asset-bytes: ${packageDir}${baseNameFilter ? ` (filtered to "${baseNameFilter}*")` : ''} needs at least one .webp and one *.atlas.json`);
  }
  return { webpFiles, atlasJsonFile, piecesJsonFile };
}

async function measurePage(webpPath) {
  const buffer = fs.readFileSync(webpPath);
  const metadata = await sharp(buffer).metadata();
  const rawBytes = metadata.width * metadata.height * 4;
  const rgbOnlyBuffer = await sharp(buffer).removeAlpha().webp({ lossless: true }).toBuffer();
  return {
    file: path.basename(webpPath),
    width: metadata.width,
    height: metadata.height,
    webpBytes: buffer.length,
    rawBytes,
    compressionRatio: computeCompressionRatio(buffer.length, rawBytes),
    ...attributeBytesToChannels(buffer.length, rgbOnlyBuffer.length),
  };
}

/**
 * @param {string} webpPath
 * @param {Array<{filename: string, frame: {x,y,w,h}}>} atlasFrames every frame on this page
 * @param {Set<string>|null} slottedFilenames when non-null, only atlas frames whose filename
 *   is a KNOWN slotted piece id are sampled (bodies); when null, every atlas frame is eligible
 *   (accessories, which have no per-piece slot concept at all).
 * @param {number} sampleSize
 */
async function sampleAlphaHistogram(webpPath, atlasFrames, slottedFilenames, sampleSize) {
  const buffer = fs.readFileSync(webpPath);
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const eligible = slottedFilenames
    ? atlasFrames.filter((f) => slottedFilenames.has(f.filename))
    : atlasFrames;
  const sample = eligible.slice(0, sampleSize);

  const alphaBytes = [];
  for (const { frame } of sample) {
    for (let y = frame.y; y < frame.y + frame.h && y < info.height; y++) {
      for (let x = frame.x; x < frame.x + frame.w && x < info.width; x++) {
        const offset = (y * info.width + x) * info.channels + 3; // alpha channel
        alphaBytes.push(data[offset]);
      }
    }
  }
  return { sampledPieces: sample.length, histogram: computeAlphaHistogram(Uint8Array.from(alphaBytes)) };
}

async function main() {
  const args = process.argv.slice(2);
  const packageDir = args[0];
  if (!packageDir) {
    console.error('Usage: node measure-asset-bytes.cjs <packageDir> [<baseNameFilter>] [<pieceSampleSize>]');
    process.exit(1);
  }
  // baseNameFilter is optional; if the second arg parses as a plain integer, treat it as the
  // sample size instead (a directory with only one pack, e.g. an accessory package, needs no
  // filter at all).
  let baseNameFilter = null;
  let sampleSizeArg = args[2];
  if (args[1] && !/^\d+$/.test(args[1])) {
    baseNameFilter = args[1];
  } else {
    sampleSizeArg = args[1];
  }
  const sampleSize = sampleSizeArg ? Number(sampleSizeArg) : 20;

  const { webpFiles, atlasJsonFile, piecesJsonFile } = findPackageFiles(packageDir, baseNameFilter);
  const atlas = JSON.parse(fs.readFileSync(path.join(packageDir, atlasJsonFile), 'utf8'));
  const atlasFrames = atlas.textures[0].frames;

  let slottedFilenames = null;
  if (piecesJsonFile) {
    const pieces = JSON.parse(fs.readFileSync(path.join(packageDir, piecesJsonFile), 'utf8')).pieces;
    const slottedCount = Object.values(pieces).filter((p) => p.slot).length;
    console.log(`[measure-asset-bytes] ${packageDir} (body-shaped: ${Object.keys(pieces).length} pieces, ${slottedCount} slotted)`);
    if (slottedCount > 0) {
      slottedFilenames = new Set(Object.keys(pieces).filter((id) => pieces[id].slot));
    }
  } else {
    console.log(`[measure-asset-bytes] ${packageDir} (accessory-shaped: no per-piece slot concept, sampling all atlas frames)`);
  }

  let totalWebpBytes = 0;
  let totalRawBytes = 0;
  for (const webpFile of webpFiles) {
    const page = await measurePage(path.join(packageDir, webpFile));
    totalWebpBytes += page.webpBytes;
    totalRawBytes += page.rawBytes;
    console.log(
      `  page ${page.file}: ${page.width}x${page.height}, webp ${page.webpBytes} B, raw Σw×h×4 ${page.rawBytes} B, ` +
      `ratio ${(page.compressionRatio * 100).toFixed(2)}%, RGB-only re-encode ${page.rgbBytes} B, ` +
      `alpha-attributed ${page.alphaAttributedBytes} B (${(page.alphaFraction * 100).toFixed(1)}% of this page's bytes)`
    );
  }
  console.log(`  TOTAL: webp ${totalWebpBytes} B, raw ${totalRawBytes} B, overall ratio ${(computeCompressionRatio(totalWebpBytes, totalRawBytes) * 100).toFixed(2)}%`);

  const { sampledPieces, histogram } = await sampleAlphaHistogram(
    path.join(packageDir, webpFiles[0]),
    atlasFrames,
    slottedFilenames,
    sampleSize
  );
  const top = topAlphaLevels(histogram, 8);
  console.log(`  alpha histogram sample: ${sampledPieces} pieces from page 0, ${Object.keys(histogram).length} distinct alpha values`);
  console.log(`  top alpha levels: ${top.map((t) => `${t.level}:${t.count}`).join(', ')}`);
}

main();
