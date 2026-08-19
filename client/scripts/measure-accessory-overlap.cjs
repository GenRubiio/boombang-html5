#!/usr/bin/env node
// design.md §13.6 (tasks.md slice 18 tasks 1-2): content-hashes every run raster across every
// COMPILED package matching a given key (e.g. "Custom6Hat") and reports the shared fraction.
//
// Ordering note, stated rather than silently worked around (design.md names "all 17
// Custom6Hat packages" as the comparison set; only rasta's is compiled at this point in the
// chain — the other 16 characters compile in slices 23-30, after this slice): this tool
// measures whatever IS compiled today and reports the real result, including an explicit
// "inconclusive" verdict when fewer than 2 packages exist to compare — it does not simulate,
// guess, or defer to a placeholder number.
//
//   node scripts/measure-accessory-overlap.cjs <key> [<character> ...]
//   node scripts/measure-accessory-overlap.cjs Custom6Hat rasta

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { computeSharedRasterFraction } = require('./lib/computeSharedRasterFraction.cjs');

const ACCESSORIES_ROOT = path.join(__dirname, '..', 'src', 'assets', 'game', 'accessories');

/**
 * Finds every compiled package directory named `<key>` under `accessories/<kind>/<character>/`
 * — the real on-disk registry layout (design.md §7), not an assumed character list.
 */
function findCompiledPackages(key, restrictToCharacters) {
  const found = []; // {character, kind, dir}
  if (!fs.existsSync(ACCESSORIES_ROOT)) return found;
  for (const kind of fs.readdirSync(ACCESSORIES_ROOT)) {
    const kindDir = path.join(ACCESSORIES_ROOT, kind);
    if (!fs.statSync(kindDir).isDirectory()) continue;
    for (const character of fs.readdirSync(kindDir)) {
      if (restrictToCharacters && restrictToCharacters.length > 0 && !restrictToCharacters.includes(character)) continue;
      const packageDir = path.join(kindDir, character, key);
      if (fs.existsSync(packageDir) && fs.statSync(packageDir).isDirectory()) {
        found.push({ character, kind, dir: packageDir });
      }
    }
  }
  return found;
}

async function hashPackageRasters(packageDir) {
  const webpFile = fs.readdirSync(packageDir).find((name) => name.endsWith('.webp'));
  if (!webpFile) return new Set();
  const buffer = fs.readFileSync(path.join(packageDir, webpFile));
  const atlasFile = fs.readdirSync(packageDir).find((name) => name.endsWith('.atlas.json'));
  const atlas = JSON.parse(fs.readFileSync(path.join(packageDir, atlasFile), 'utf8'));
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const hashes = new Set();
  for (const frame of atlas.textures[0].frames) {
    const { x, y, w, h } = frame.frame;
    const pieceBytes = Buffer.alloc(w * h * 4);
    let offset = 0;
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        const srcOffset = (py * info.width + px) * info.channels;
        pieceBytes[offset++] = data[srcOffset];
        pieceBytes[offset++] = data[srcOffset + 1];
        pieceBytes[offset++] = data[srcOffset + 2];
        pieceBytes[offset++] = data[srcOffset + 3];
      }
    }
    hashes.add(crypto.createHash('sha1').update(pieceBytes).digest('hex'));
  }
  return hashes;
}

async function main() {
  const [key, ...characters] = process.argv.slice(2);
  if (!key) {
    console.error('Usage: node measure-accessory-overlap.cjs <key> [<character> ...]');
    process.exit(1);
  }

  const packages = findCompiledPackages(key, characters);
  console.log(`[measure-accessory-overlap] found ${packages.length} compiled "${key}" package(s): ${packages.map((p) => p.character).join(', ') || '(none)'}`);

  const packageHashSets = {};
  for (const pkg of packages) {
    packageHashSets[pkg.character] = await hashPackageRasters(pkg.dir);
    console.log(`  ${pkg.character}: ${packageHashSets[pkg.character].size} unique run rasters`);
  }

  const result = computeSharedRasterFraction(packageHashSets);
  if (result.inconclusive) {
    console.log(`[measure-accessory-overlap] INCONCLUSIVE: ${result.reason}`);
    console.log(`  Design.md names "all 17 Custom6Hat packages" as the full comparison set — only ${packages.length} compiled today. Re-run once more characters' "${key}" packages exist.`);
  } else {
    console.log(
      `[measure-accessory-overlap] shared fraction: ${(result.sharedFraction * 100).toFixed(1)}% ` +
      `(${result.sharedInstances} of ${result.totalInstances} raster instances appear in 2+ packages)`
    );
  }
}

main();
