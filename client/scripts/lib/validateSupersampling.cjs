// LR3 (avatar-layered-rendering spec): raster pieces are authored at ss:2. A piece's raster
// asset MUST measure exactly width*2 by height*2 pixels, where width/height are the piece's
// manifest-declared logical dimensions. Compile-time enforcement — the runtime cannot fix a
// mismatched raster after the fact (design.md §3.1 step 2).

/**
 * @param {{w: number, h: number}} declared logical dimensions from _frames.json
 * @param {{width: number, height: number}} actual pixel dimensions of the extracted raster
 * @param {number} [ss] supersampling factor, defaults to 2 per the project-wide contract
 */
function validateSupersampling(declared, actual, ss = 2) {
  const expectedWidth = declared.w * ss
  const expectedHeight = declared.h * ss

  if (actual.width !== expectedWidth) {
    throw new Error(
      `validateSupersampling: width mismatch — expected ${expectedWidth} (${declared.w} * ${ss}), got ${actual.width}`
    )
  }
  if (actual.height !== expectedHeight) {
    throw new Error(
      `validateSupersampling: height mismatch — expected ${expectedHeight} (${declared.h} * ${ss}), got ${actual.height}`
    )
  }
}

module.exports = { validateSupersampling }
