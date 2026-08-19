// design.md §9.1 (tasks.md slice 16 task 1): ~19,400 manifest `L` entries repeat string piece
// ids (`p0`, `p1523`, ...) that could be integer indices into one table. `Object.keys(pieces)`
// IS that table already — deterministic insertion order, present at both compact and expand
// time — so no separate id-list needs to be stored; each `L[]` entry becomes a plain 3-element
// array `[pieceIndex, dx, dy]` instead of an object repeating the `"p"`/`"dx"`/`"dy"` keys.

/**
 * @param {object} manifest a full compiled manifest (base OR per-key action manifest shape).
 * @returns {object} the compact form — every other field untouched, `frames[fid].L` replaced
 *   by `[pieceIndex, dx, dy]` tuples.
 */
function compactManifest(manifest) {
  const pieceIndexById = new Map(Object.keys(manifest.pieces).map((id, index) => [id, index]));

  const compactFrames = {};
  for (const [fid, frame] of Object.entries(manifest.frames)) {
    compactFrames[fid] = {
      o: frame.o,
      L: frame.L.map((l) => [pieceIndexById.get(l.p), l.dx, l.dy]),
    };
  }

  return { ...manifest, frames: compactFrames };
}

/**
 * Inverse of `compactManifest`. Self-detecting and idempotent: a manifest compiled with
 * `--emit-verbose` (debugging only — its `L` entries are already `{p,dx,dy}` objects, not
 * `[index,dx,dy]` tuples) is returned unchanged rather than mis-expanded, so the runtime can
 * call this unconditionally regardless of which form a given on-disk file happens to be.
 *
 * @param {object} compactManifestData
 * @returns {object} the full verbose manifest, byte-for-byte equivalent (modulo JSON key
 *   order) to what the compiler would have emitted with `--emit-verbose`.
 */
function expandCompactManifest(compactManifestData) {
  const pieceIds = Object.keys(compactManifestData.pieces);

  const verboseFrames = {};
  for (const [fid, frame] of Object.entries(compactManifestData.frames)) {
    verboseFrames[fid] = {
      o: frame.o,
      L: frame.L.map((entry) =>
        Array.isArray(entry) ? { p: pieceIds[entry[0]], dx: entry[1], dy: entry[2] } : entry
      ),
    };
  }

  return { ...compactManifestData, frames: verboseFrames };
}

export { compactManifest, expandCompactManifest };
