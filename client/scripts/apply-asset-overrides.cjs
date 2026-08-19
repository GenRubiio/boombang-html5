#!/usr/bin/env node
// design.md §16.2 (tasks.md slice 11 task 3): applies every committed hand edit under
// `client/asset-overrides/<char>/` onto the freshly re-unzipped staged tree, AFTER unzip and
// BEFORE compile — the fix to `stage-layered-source.sh`'s ordering (design.md: "unzip -> apply
// accessory-annotations.json -> apply asset-overrides/ -> compile"; accessory-annotations.json
// itself needs no staging step at all, since compile-accessory.cjs now reads it from its own
// fixed committed path, never from inside `.assets-src/`, tasks.md slice 11 task 1). Without
// this step, a hand-edited `_frames_<anim>.json` living only in `.assets-src/` would be
// silently discarded by the next re-stage — exactly what already happened once to the
// `scale`/`groundOffsetY` annotations (PR4), which this override mechanism is the general
// (per-animation, per-package) form of.
//
//   node scripts/apply-asset-overrides.cjs <char>

const fs = require('fs');
const path = require('path');
const { resolveOverrideDestination } = require('./lib/assetOverrides.cjs');

function walkFiles(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      result.push(fullPath);
    }
  }
  return result;
}

function main() {
  const character = process.argv[2];
  if (!character) {
    console.error('Usage: node apply-asset-overrides.cjs <char>');
    process.exit(1);
  }

  const clientDir = path.resolve(__dirname, '..');
  const overridesRoot = path.join(clientDir, 'asset-overrides');
  const characterOverridesDir = path.join(overridesRoot, character);
  const stagedAccessoriesRoot = path.join(clientDir, '.assets-src/accessories');

  const overrideFiles = walkFiles(characterOverridesDir);
  if (overrideFiles.length === 0) {
    console.log(`[apply-asset-overrides] no overrides staged for "${character}" — nothing to apply.`);
    return;
  }

  for (const overrideFile of overrideFiles) {
    const relativePath = path.relative(overridesRoot, overrideFile).split(path.sep).join('/');
    const destination = resolveOverrideDestination(relativePath, stagedAccessoriesRoot);
    if (!fs.existsSync(path.dirname(destination))) {
      throw new Error(
        `apply-asset-overrides: override "${relativePath}" targets "${destination}", but that package directory does not exist in the staged tree — stage the accessory before applying its overrides.`
      );
    }
    fs.copyFileSync(overrideFile, destination);
    console.log(`[apply-asset-overrides] applied ${relativePath} -> ${destination}`);
  }
}

main();
