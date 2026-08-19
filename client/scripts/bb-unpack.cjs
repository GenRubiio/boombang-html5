#!/usr/bin/env node
// design.md §16.2 (tasks.md slice 11 task 2): unpacks a `.bb` (a plain ZIP, per this change's
// own repeated "asset source facts" confirmation) into a readable tree — `meta.json`,
// `<anim>.json` frame-index arrays, `_frames_<anim>.json` path arrays, `p*.png`, etc. Uses
// `fflate` (`unzipSync`), not the `unzip` CLI — pure symmetry with `bb-pack.cjs`'s own
// deterministic-repack requirement (`bbArchive.cjs`).
//
//   node scripts/bb-unpack.cjs <archive.bb> <outputDir>

const fs = require('fs');
const path = require('path');
const { unzipSync } = require('fflate');

function main() {
  const [archivePath, outputDir] = process.argv.slice(2);
  if (!archivePath || !outputDir) {
    console.error('Usage: node bb-unpack.cjs <archive.bb> <outputDir>');
    process.exit(1);
  }

  const buffer = fs.readFileSync(archivePath);
  const entries = unzipSync(buffer);

  fs.mkdirSync(outputDir, { recursive: true });
  const entryNames = Object.keys(entries).sort();
  for (const entryName of entryNames) {
    const destPath = path.join(outputDir, entryName);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, Buffer.from(entries[entryName]));
  }

  console.log(`[bb-unpack] wrote ${entryNames.length} entries to ${outputDir}`);
}

main();
