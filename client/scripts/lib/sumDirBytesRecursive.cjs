// tasks.md slices 28-31: sums real file bytes under a directory tree, recursively — used by
// `avatar-load-gate.spec.js`'s M1 report so it can point at `accessories/` (and each compiled
// body's own `layers/` directory) as a whole tree, once each, rather than hand-listing every one
// of 540+ individually compiled packages.

const fs = require('fs');
const path = require('path');

/**
 * @param {string} dir a real, existing directory path.
 * @returns {number} the sum of every regular file's byte size, recursively.
 */
function sumDirBytesRecursive(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += sumDirBytesRecursive(entryPath);
    } else if (entry.isFile()) {
      total += fs.statSync(entryPath).size;
    }
  }
  return total;
}

module.exports = { sumDirBytesRecursive };
