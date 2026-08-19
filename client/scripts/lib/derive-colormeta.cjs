#!/usr/bin/env node
// Thin file-I/O CLI wrapper around deriveColormeta.cjs's pure logic, invoked by
// stage-layered-source.sh (design.md §4 step 3).
//
//   node derive-colormeta.cjs <sourceMetaJsonPath> <outputColormetaJsonPath>

const fs = require('fs');
const { deriveColormeta } = require('./deriveColormeta.cjs');

function main() {
  const [sourceMetaPath, outputPath] = process.argv.slice(2);
  if (!sourceMetaPath || !outputPath) {
    console.error('Usage: node derive-colormeta.cjs <sourceMetaJsonPath> <outputColormetaJsonPath>');
    process.exit(1);
  }

  const meta = JSON.parse(fs.readFileSync(sourceMetaPath, 'utf8'));
  const colormeta = deriveColormeta(meta);
  fs.writeFileSync(outputPath, JSON.stringify(colormeta));
  console.log(
    `[derive-colormeta] wrote ${outputPath} (${Object.keys(colormeta.defaults).length} slot defaults)`
  );
}

try {
  main();
} catch (err) {
  console.error('[derive-colormeta] FAILED:', err.message);
  process.exit(1);
}
