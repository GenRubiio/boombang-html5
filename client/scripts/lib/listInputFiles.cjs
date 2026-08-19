// Live-discovered defect fix (avatar-system-multichar-fixes PR4, design.md §4): a directory
// entry must never be treated as a hashable/readable file — `fs.readFileSync` on a directory
// throws EISDIR. Pure filter over `fs.readdirSync(dir, {withFileTypes: true})`-shaped entries
// (a `Dirent`-like object with `.name` and `.isDirectory()`), so the actual filesystem call
// stays in the caller and this rule is directly unit-testable.

/**
 * @param {Array<{name: string, isDirectory: () => boolean}>} entries
 * @returns {string[]} names of regular (non-directory) entries only
 */
function filterRegularFileNames(entries) {
  return entries.filter((entry) => !entry.isDirectory()).map((entry) => entry.name);
}

module.exports = { filterRegularFileNames };
