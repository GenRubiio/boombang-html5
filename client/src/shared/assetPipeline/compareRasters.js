// design.md §12.3 (R16, cross-rasterizer equivalence) / §16.4 (R17b, "zero differing pixels —
// not a tolerance"): the pure comparator both apply-phase verifications reuse (design.md
// explicitly names this reuse — "reusing the compareRasters comparator introduced for the
// spike's cross-rasterizer equivalence check"). The actual "render through librsvg and through
// Canvas2D, then call this" step is the I/O shell (a real PNG decode + this function).

/**
 * @param {Uint8ClampedArray|Uint8Array} a
 * @param {Uint8ClampedArray|Uint8Array} b
 * @param {number} width
 * @param {number} height
 * @param {{tolerance?: number}} [options] per-channel absolute difference tolerance (default 0
 *   — R17b's own requirement; the spike's cross-rasterizer check uses a small nonzero value
 *   per design.md §12.3, "compare within a small per-pixel tolerance")
 * @returns {{differingPixels: number, totalPixels: number, maxChannelDelta: number}}
 */
function diffRgbaBuffers(a, b, width, height, { tolerance = 0 } = {}) {
  const totalPixels = width * height;
  const expectedLength = totalPixels * 4;
  if (a.length !== expectedLength || b.length !== expectedLength) {
    throw new Error(
      `diffRgbaBuffers: buffer length mismatch (a=${a.length}, b=${b.length}, expected=${expectedLength} for ${width}x${height})`
    );
  }

  let differingPixels = 0;
  let maxChannelDelta = 0;

  for (let p = 0; p < totalPixels; p++) {
    const offset = p * 4;
    let pixelDiffers = false;
    for (let c = 0; c < 4; c++) {
      const delta = Math.abs(a[offset + c] - b[offset + c]);
      if (delta > maxChannelDelta) maxChannelDelta = delta;
      if (delta > tolerance) pixelDiffers = true;
    }
    if (pixelDiffers) differingPixels += 1;
  }

  return { differingPixels, totalPixels, maxChannelDelta };
}

export { diffRgbaBuffers };
