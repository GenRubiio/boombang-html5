// design.md §16.3 (tasks.md slice 11 task 4): per-frame SVG export for the asset-authoring
// round-trip. Reuses `svgFromPaths`/`computeBounds` (the SAME functions the build compilers
// use — "the editing canvas is the compile canvas") rather than reimplementing SVG emission.
// `data-bb-origin="x,y"` on the root is authoritative; an optional `<g data-bb-role="guide">`
// crosshair the caller may add afterward is never produced or read here (the importer simply
// never looks for anything but the root's own attribute and the `<path>` elements, so a guide
// group cannot corrupt anything). Slotted paths export at the slot's DEFAULT colour, resolved
// explicitly here (defensive: fact C says the authored fill already equals it, but this does
// not trust that silently).

const { svgFromPaths } = require('./svgFromPaths.cjs');
const { classifyPathSpecies } = require('../../src/shared/assetPipeline/pathSpecies.js');

/**
 * @param {Array} paths a frame's `p[]`
 * @param {Record<string,string>} colormetaDefaults e.g. `{color1:"b88a5c"}` (no leading `#`)
 * @returns {Array} a NEW paths array; slotted fill paths get `f` resolved to
 *   `#${colormetaDefaults[slot]}`, everything else passes through unchanged
 */
function resolveExportFills(paths, colormetaDefaults) {
  return paths.map((piece) => {
    if (piece.c !== undefined && colormetaDefaults[piece.c] !== undefined) {
      return { ...piece, f: `#${colormetaDefaults[piece.c]}` };
    }
    return piece;
  });
}

/**
 * @param {Array} paths a frame's `p[]`, in document order
 * @returns {Array<{species: string, slot?: string, k?: number}>}
 */
function buildPathSidecarEntries(paths) {
  return paths.map((piece) => {
    const entry = { species: classifyPathSpecies(piece) };
    if (piece.c !== undefined) entry.slot = piece.c;
    if (piece.k !== undefined) entry.k = piece.k;
    return entry;
  });
}

/**
 * @param {{o:[number,number], p:Array, cl?:Record<string,string>}} frame
 * @param {Record<string,string>} colormetaDefaults
 * @param {number} ss
 * @returns {{svg: string, sidecar: {origin:[number,number], ss:number, paths:Array, cl:Record<string,string>}}}
 */
function exportFrameSvg(frame, colormetaDefaults, ss) {
  const resolvedPaths = resolveExportFills(frame.p, colormetaDefaults);
  const { svg } = svgFromPaths(resolvedPaths, undefined, { clips: frame.cl });

  const originAttr = `data-bb-origin="${frame.o[0]},${frame.o[1]}"`;
  let svgWithOrigin = svg.replace('<svg ', `<svg ${originAttr} `);

  // design.md §16.3: `data-bb-slot` is REDUNDANCY only (the sidecar is authoritative — vector
  // editors differ on whether they preserve `data-*` attributes). Injected per <path> element,
  // in document order (the same order `frame.p`/the sidecar's `paths` array uses), matching
  // each element to its slot by position rather than by content (a `d` string is not
  // guaranteed unique within a frame).
  let pathIndex = 0;
  svgWithOrigin = svgWithOrigin.replace(/<path\b[^>]*\/>/g, (match) => {
    const piece = frame.p[pathIndex];
    pathIndex += 1;
    if (piece && piece.c !== undefined) {
      return match.replace('<path ', `<path data-bb-slot="${piece.c}" `);
    }
    return match;
  });

  const sidecar = {
    origin: frame.o,
    ss,
    paths: buildPathSidecarEntries(frame.p),
    cl: frame.cl || {},
  };

  return { svg: svgWithOrigin, sidecar };
}

module.exports = { exportFrameSvg, resolveExportFills, buildPathSidecarEntries };
