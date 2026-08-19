#!/usr/bin/env node
// design.md §16.4 (tasks.md slice 11 task 8): R17a, structural losslessness. unpack -> repack,
// then compare every entry: JSON entries parsed and deep-equal (key order may legitimately
// differ), non-JSON entries byte-identical.
//
//   node scripts/verify-r17a.cjs <original.bb> <repacked.bb>

const fs = require('fs');
const { unzipSync } = require('fflate');
const assert = require('assert');

function deepEqual(a, b) {
  return JSON.stringify(sortKeysDeep(a)) === JSON.stringify(sortKeysDeep(b));
}

function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortKeysDeep(value[key]);
        return acc;
      }, {});
  }
  return value;
}

function main() {
  const [originalPath, repackedPath] = process.argv.slice(2);
  const original = unzipSync(fs.readFileSync(originalPath));
  const repacked = unzipSync(fs.readFileSync(repackedPath));

  const originalNames = Object.keys(original).sort();
  const repackedNames = Object.keys(repacked).sort();
  assert.deepStrictEqual(originalNames, repackedNames, 'entry name sets differ');

  let jsonEntries = 0;
  let binaryEntries = 0;
  for (const name of originalNames) {
    const a = Buffer.from(original[name]);
    const b = Buffer.from(repacked[name]);
    if (name.endsWith('.json')) {
      const parsedA = JSON.parse(a.toString('utf8'));
      const parsedB = JSON.parse(b.toString('utf8'));
      assert.ok(deepEqual(parsedA, parsedB), `JSON entry differs: ${name}`);
      jsonEntries += 1;
    } else {
      assert.strictEqual(Buffer.compare(a, b), 0, `binary entry differs: ${name}`);
      binaryEntries += 1;
    }
  }

  console.log(
    `[verify-r17a] PASS: ${originalNames.length} entries (${jsonEntries} JSON deep-equal, ${binaryEntries} binary byte-identical) — ${originalPath}`
  );
}

main();
