#!/usr/bin/env node
// design.md §16.2 (tasks.md slice 11 task 2): re-packs a tree (produced by bb-unpack.cjs,
// optionally hand-edited) back into a `.bb`-shaped ZIP. Deterministic (`bbArchive.cjs`'s
// `buildZipEntries`): stable entry order, fixed timestamps — so packing the SAME tree twice
// produces a byte-identical archive (R17a's own precondition), which the `zip` CLI does not
// guarantee.
//
//   node scripts/bb-pack.cjs <inputDir> <archive.bb>

const fs = require('fs');
const path = require('path');
const { zipSync } = require('fflate');
const { buildZipEntries } = require('./lib/bbArchive.cjs');

function walkFiles(dir, baseDir = dir) {
  const result = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      Object.assign(result, walkFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      const relativePath = path.relative(baseDir, fullPath).split(path.sep).join('/');
      result[relativePath] = fs.readFileSync(fullPath);
    }
  }
  return result;
}

function main() {
  const [inputDir, archivePath] = process.argv.slice(2);
  if (!inputDir || !archivePath) {
    console.error('Usage: node bb-pack.cjs <inputDir> <archive.bb>');
    process.exit(1);
  }

  const files = walkFiles(inputDir);
  const zipped = zipSync(buildZipEntries(files));
  fs.mkdirSync(path.dirname(archivePath), { recursive: true });
  fs.writeFileSync(archivePath, zipped);

  console.log(`[bb-pack] packed ${Object.keys(files).length} entries into ${archivePath}`);
}

main();
