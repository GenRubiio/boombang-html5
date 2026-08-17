// Vector accessory compilation (design.md §3.2 step 1): each frame's p[] becomes an SVG
// string, one <path> per entry, inside an <svg viewBox> derived from the frame's bounds.
// EaselJS's `d` strings use standard absolute SVG path-command syntax; this module asserts
// the command alphabet actually present in the staged source data and throws on anything
// unrecognised rather than silently dropping geometry.

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
        `svgFromPaths: unrecognised path command "${command}" in "${d.slice(0, 60)}"`
      );
    }
  }
}

function extractCoordinates(d) {
  const numbers = d.match(/-?\d+(?:\.\d+)?/g) || [];
  return numbers.map(Number);
}

/**
 * @param {{d:string}[]} paths
 * @returns {{minX:number,minY:number,maxX:number,maxY:number,width:number,height:number}}
 */
function computeBounds(paths) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const piece of paths) {
    validateCommandAlphabet(piece.d);
    const coords = extractCoordinates(piece.d);
    for (let i = 0; i + 1 < coords.length; i += 2) {
      const x = coords[i];
      const y = coords[i + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/**
 * @param {{d:string, f:string, eo?:number}[]} paths
 * @param {{minX:number,minY:number,width:number,height:number}} [bounds]
 * @returns {{svg:string, bounds:object}}
 */
function svgFromPaths(paths, bounds) {
  const resolvedBounds = bounds || computeBounds(paths);

  const pathElements = paths
    .map((piece) => {
      validateCommandAlphabet(piece.d);
      const fillRule = piece.eo ? 'evenodd' : 'nonzero';
      return `<path d="${piece.d}" fill="${piece.f}" fill-rule="${fillRule}"/>`;
    })
    .join('');

  const { minX, minY, width, height } = resolvedBounds;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">${pathElements}</svg>`;

  return { svg, bounds: resolvedBounds };
}

module.exports = { svgFromPaths, computeBounds, validateCommandAlphabet };
