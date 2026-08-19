// Vector accessory/action compilation (design.md §3.2 step 1, §5.2, §5.3): each frame's p[]
// becomes an SVG string, one <path> per entry, inside an <svg viewBox> derived from the
// frame's bounds. EaselJS's `d` strings use standard absolute SVG path-command syntax; this
// module asserts the command alphabet actually present in the staged source data and throws
// on anything unrecognised rather than silently dropping geometry.

// design.md §12.3 (tasks.md slice 8 task 1): `computeBounds`/`validateCommandAlphabet` MOVED
// to client/src/shared/assetPipeline/pathBounds.js — that file is now the canonical implementation.
// This file no longer defines the logic itself; it forwards to an injected reference,
// supplied once by each real compiler's `main()`/`compileVector()` via a dynamic import() of
// the shared ESM module (design.md: "the .cjs compilers ... consume them ... via dynamic
// import() from their already-async main()"). Kept as a synchronous forward (not itself async)
// so every existing call site in this file — and every existing test in
// svgFromPaths.test.cjs — needs zero changes beyond the test file's one-time setup import.
let sharedComputeBounds = null;
let sharedValidateCommandAlphabet = null;

/**
 * @param {{computeBounds: Function, validateCommandAlphabet: Function}} impl the shared
 *   ESM module's exports (client/src/shared/assetPipeline/pathBounds.js), resolved via dynamic
 *   import() by the caller.
 */
function setSharedVectorBounds({ computeBounds: computeBoundsImpl, validateCommandAlphabet: validateImpl }) {
  sharedComputeBounds = computeBoundsImpl;
  sharedValidateCommandAlphabet = validateImpl;
}

function requireInjected(fn, name) {
  if (!fn) {
    throw new Error(
      `svgFromPaths: ${name} was not injected — call setSharedVectorBounds() once, early, from an async caller (see client/src/shared/assetPipeline/pathBounds.js)`
    );
  }
  return fn;
}

function validateCommandAlphabet(d) {
  return requireInjected(sharedValidateCommandAlphabet, 'validateCommandAlphabet')(d);
}

/**
 * @param {{d:string, w?:number}[]} paths
 * @param {number} [ss] supersampling factor (design.md's project-wide ss:2 contract).
 * @returns {{minX:number,minY:number,maxX:number,maxY:number,width:number,height:number}}
 */
function computeBounds(paths, ss = 2) {
  return requireInjected(sharedComputeBounds, 'computeBounds')(paths, ss);
}

/**
 * @param {{t:string, st:[number,string][], x1:number, y1:number, x2:number, y2:number}} gradient
 * @param {string} id
 * @returns {string} a `<linearGradient>` def — `gradientUnits="userSpaceOnUse"` so the
 *   authored x1/y1/x2/y2 vector (the same rig space as every path) applies directly.
 */
function renderLinearGradientDef(gradient, id) {
  const stops = gradient.st
    .map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`)
    .join('');
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${gradient.x1}" y1="${gradient.y1}" x2="${gradient.x2}" y2="${gradient.y2}">${stops}</linearGradient>`;
}

/**
 * design.md §5.2 (facts B/C, plus a live-discovered third species — see this file's
 * `svgFromPaths.test.cjs` note): a path species branch, replacing the latent defect of
 * unconditionally emitting `fill="${piece.f}"` (which produced `fill="undefined"` — and no
 * stroke at all — for a stroke path).
 *
 * @param {{d:string, f?:string, eo?:number, s?:string, w?:number, k?:number, g?:object}} piece
 * @param {string} [fillOverride] applied ONLY to a plain fill path (design.md §5.2: the
 *   authored fill of a slotted path equals that slot's default, so `setTint` would multiply it
 *   twice; never applied to a stroke or a gradient — neither is ever slotted, verified live)
 * @param {string} [gradientId] pre-assigned `<linearGradient>` id, when `piece.g` is present
 * @returns {string} the piece's own style attributes
 */
function renderPieceStyle(piece, fillOverride, gradientId) {
  if (piece.g !== undefined) {
    const fillRule = piece.eo ? 'evenodd' : 'nonzero';
    return `fill="url(#${gradientId})" fill-rule="${fillRule}"`;
  }
  if (piece.f !== undefined) {
    const fillRule = piece.eo ? 'evenodd' : 'nonzero';
    return `fill="${fillOverride ?? piece.f}" fill-rule="${fillRule}"`;
  }
  if (piece.s !== undefined && piece.w !== undefined) {
    return `fill="none" stroke="${piece.s}" stroke-width="${piece.w}"`;
  }
  throw new Error(
    `svgFromPaths: path has neither fill, stroke nor gradient data ("d": "${piece.d.slice(0, 60)}")`
  );
}

/**
 * @param {{d:string, f?:string, eo?:number, s?:string, w?:number, k?:number, g?:object}[]} paths
 * @param {{minX:number,minY:number,width:number,height:number}} [bounds]
 * @param {{fillOverride?: string, clips?: Record<string, string>}} [options] `clips` is a
 *   frame's `cl` map (design.md §5.3/fact J) — id -> clip-shape `d` string. Omitted entirely
 *   for `--no-clips` mode, reproducing the pre-clip-support behaviour exactly.
 * @returns {{svg:string, bounds:object}}
 */
function svgFromPaths(paths, bounds, { fillOverride, clips } = {}) {
  const resolvedBounds = bounds || computeBounds(paths);

  // design.md §5.3: each referenced clip id is emitted ONCE, regardless of how many paths
  // carry that `k` — `clipPathUnits="userSpaceOnUse"` so the clip shape's own coordinates
  // (the same rig space as every other path in this frame) apply directly, no re-scaling.
  const usedClipIds = clips ? new Set(paths.map((p) => p.k).filter((k) => k !== undefined)) : new Set();
  const clipDefs = [...usedClipIds]
    .map((id) => `<clipPath id="k${id}" clipPathUnits="userSpaceOnUse"><path d="${clips[id]}"/></clipPath>`)
    .join('');

  // Live-discovered gradient species: unlike clips (deduped by id, referenced by several
  // paths), each gradient-carrying path gets its OWN gradient def — the source data never
  // reuses one gradient definition across paths (546 occurrences checked, 0 shared), so a
  // simple per-path sequential id is correct and needs no dedup registry.
  let gradientCounter = 0;
  const gradientIds = new Map(); // piece -> id
  const gradientDefs = [];
  paths.forEach((piece) => {
    if (piece.g === undefined) return;
    const id = `g${gradientCounter++}`;
    gradientIds.set(piece, id);
    gradientDefs.push(renderLinearGradientDef(piece.g, id));
  });

  const defs = clipDefs || gradientDefs.length > 0 ? `<defs>${clipDefs}${gradientDefs.join('')}</defs>` : '';

  const pathElements = paths
    .map((piece) => {
      validateCommandAlphabet(piece.d);
      const style = renderPieceStyle(piece, fillOverride, gradientIds.get(piece));
      const clipAttr = clips && piece.k !== undefined ? ` clip-path="url(#k${piece.k})"` : '';
      return `<path d="${piece.d}" ${style}${clipAttr}/>`;
    })
    .join('');

  const { minX, minY, width, height } = resolvedBounds;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">${defs}${pathElements}</svg>`;

  return { svg, bounds: resolvedBounds };
}

module.exports = { svgFromPaths, computeBounds, validateCommandAlphabet, setSharedVectorBounds };
