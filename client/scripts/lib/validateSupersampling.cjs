// LR3 (avatar-layered-rendering spec): raster pieces are authored at ss:2. A piece's raster
// asset MUST measure exactly width*2 by height*2 pixels, where width/height are the piece's
// manifest-declared logical dimensions. Compile-time enforcement — the runtime cannot fix a
// mismatched raster after the fact (design.md §3.1 step 2).

/**
 * @param {{w: number, h: number}} declared logical dimensions from _frames.json
 * @param {{width: number, height: number}} actual pixel dimensions of the extracted raster
 * @param {number} [ss] supersampling factor, defaults to 2 per the project-wide contract
 * @param {number} [tolerance] design.md §5.4: action runs get a ±1px tolerance — librsvg
 *   rounds a run's own computed bounds (unlike the base compiler's PNG-sourced pieces, which
 *   measure exactly). Defaults to 0 (exact match), the base-pack contract.
 */
function validateSupersampling(declared, actual, ss = 2, tolerance = 0) {
  const expectedWidth = declared.w * ss
  const expectedHeight = declared.h * ss

  if (Math.abs(actual.width - expectedWidth) > tolerance) {
    throw new Error(
      `validateSupersampling: width mismatch — expected ${expectedWidth} (${declared.w} * ${ss}, ±${tolerance}), got ${actual.width}`
    )
  }
  if (Math.abs(actual.height - expectedHeight) > tolerance) {
    throw new Error(
      `validateSupersampling: height mismatch — expected ${expectedHeight} (${declared.h} * ${ss}, ±${tolerance}), got ${actual.height}`
    )
  }
}

module.exports = { validateSupersampling }
