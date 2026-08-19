// design.md §16.2 (tasks.md slice 11 task 2): shared plumbing for bb-unpack.cjs/bb-pack.cjs.
// Uses `fflate` (not the `zip` CLI) because R17a needs a DETERMINISTIC archive: stable entry
// order and fixed timestamps — `zip`'s own CLI does not give that.

// Fixed, arbitrary date within the DOS zip date-time range (1980-2099) — every packed entry
// gets this exact mtime, so a repeated pack of unchanged content is byte-for-byte identical.
const FIXED_ARCHIVE_MTIME = new Date('2020-01-01T00:00:00Z');

/**
 * @param {Record<string, Buffer|Uint8Array>} files a flat `{path: content}` map
 * @param {(filePath: string) => number} [levelFor] optional per-entry compression-level
 *   override (design.md §9.2, tasks.md slice 16 task 2: STORE — level 0 — for `.webp`, DEFLATE
 *   — level 9 — for JSON, since `.webp` is already-compressed and gains nothing from a second
 *   pass). Defaults to level 9 for every entry when omitted — `bb-pack.cjs`'s existing 2-arg
 *   call, and R17a's own byte-identical-repack precondition, are both unchanged.
 * @returns {Record<string, [Uint8Array, {mtime: Date, level: number}]>} the shape `fflate.
 *   zipSync` needs — entries in ASCENDING path order (stable regardless of the input object's
 *   own key order) and every entry sharing the exact same fixed mtime.
 */
function buildZipEntries(files, levelFor = () => 9) {
  const sortedPaths = Object.keys(files).sort();
  const entries = {};
  for (const filePath of sortedPaths) {
    entries[filePath] = [
      files[filePath] instanceof Uint8Array ? files[filePath] : Buffer.from(files[filePath]),
      { mtime: FIXED_ARCHIVE_MTIME, level: levelFor(filePath) },
    ];
  }
  return entries;
}

module.exports = { buildZipEntries, FIXED_ARCHIVE_MTIME };
