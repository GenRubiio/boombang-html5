// design.md §12.3 (tasks.md slice 8 task 1): moved from the `computeBounds`/
// `validateCommandAlphabet` pair inside client/scripts/lib/svgFromPaths.cjs. This IS now the
// canonical implementation; svgFromPaths.cjs no longer defines this logic itself — it forwards
// to an injected reference set once, early in each compiler's `main()` (see
// svgFromPaths.cjs's `setSharedVectorBounds`), so its own widely-tested synchronous call
// sites need no change while the logic itself lives in exactly one place.

// M(oveto), L(ineto), Q(uadratic curveto), C(ubic curveto), Z(close path) — the EaselJS
// Graphics command set observed in the staged hat/pet source data (M, L, Q only, verified
// against every _frames_*.json in personajes/rasta/hat/minnieHat.bb); C/Z are allowed
// defensively since they are standard, equally simple absolute commands other accessory
// packages could use.
const ALLOWED_COMMANDS = new Set(['M', 'L', 'Q', 'C', 'Z']);

function validateCommandAlphabet(d) {
  const commands = d.match(/[A-Za-z]/g) || [];
  for (const command of commands) {
    if (!ALLOWED_COMMANDS.has(command)) {
      throw new Error(
        `pathBounds: unrecognised path command "${command}" in "${d.slice(0, 60)}"`
      );
    }
  }
}

function extractCoordinates(d) {
  const numbers = d.match(/-?\d+(?:\.\d+)?/g) || [];
  return numbers.map(Number);
}

/**
 * @param {{d:string, w?:number}[]} paths
 * @param {number} [ss] supersampling factor (design.md's project-wide ss:2 contract) — used
 *   only to floor an extremely thin bounding box to a minimum renderable size, `1/ss` logical
 *   units, so it always rounds to at least 1 real raster pixel.
 * @returns {{minX:number,minY:number,maxX:number,maxY:number,width:number,height:number}}
 */
function computeBounds(paths, ss = 2) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const piece of paths) {
    validateCommandAlphabet(piece.d);
    const coords = extractCoordinates(piece.d);
    // A perfectly horizontal or vertical STROKE path has a mathematically zero-height or
    // zero-width bounding box from its `d` coordinates alone — an invalid (zero-area) SVG
    // viewBox that sharp/librsvg refuses to rasterize ("bad dimensions"). A stroke's visible
    // ink extends `w/2` beyond its centreline on every side, so this piece's OWN contribution
    // to the bounds is inflated by that amount. A fill path (no `w`) is unaffected here.
    const strokePad = piece.w ? piece.w / 2 : 0;
    for (let i = 0; i + 1 < coords.length; i += 2) {
      const x = coords[i];
      const y = coords[i + 1];
      if (x - strokePad < minX) minX = x - strokePad;
      if (x + strokePad > maxX) maxX = x + strokePad;
      if (y - strokePad < minY) minY = y - strokePad;
      if (y + strokePad > maxY) maxY = y + strokePad;
    }
  }

  // A genuinely tiny fill sliver (e.g. a ~0.1-logical-unit-wide highlight) has a real,
  // non-zero but SUB-PIXEL bounding box once scaled by `ss` — sharp/librsvg reported "bad
  // dimensions" (it cannot rasterize a <1px image). Floor each axis to at least `1/ss` logical
  // units, symmetrically, so every rasterized run is at least 1 real pixel on every axis.
  const minSize = 1 / ss;
  let width = maxX - minX;
  let height = maxY - minY;
  if (width < minSize) {
    const pad = (minSize - width) / 2;
    minX -= pad;
    maxX += pad;
    width = minSize;
  }
  if (height < minSize) {
    const pad = (minSize - height) / 2;
    minY -= pad;
    maxY += pad;
    height = minSize;
  }

  return { minX, minY, maxX, maxY, width, height };
}

export { computeBounds, validateCommandAlphabet };
