// design.md §13.5 (tasks.md slice 17 task 1): pure byte-accounting/histogram functions. The
// `sharp` re-encode calls (RGB-flattened re-encode for `attributeBytesToChannels`'s inputs, raw
// pixel decode for `computeAlphaHistogram`'s input) are the I/O shell in measure-asset-bytes.cjs
// — these functions only ever see plain numbers/typed arrays, never touch the filesystem.

/**
 * @param {number} webpBytes
 * @param {number} rawBytes Σ w×h×4 (uncompressed RGBA size)
 * @returns {number} webpBytes / rawBytes, or 0 when rawBytes is 0
 */
function computeCompressionRatio(webpBytes, rawBytes) {
  if (rawBytes === 0) return 0;
  return webpBytes / rawBytes;
}

/**
 * design.md §13.5's "bytes attributable to RGB versus alpha (re-encode with alpha stripped,
 * diff)": the RGB-only re-encode's own size IS the RGB plane's cost; the remainder (original
 * minus RGB-only) is attributed to alpha. Clamped at zero — a RGB-only re-encode landing LARGER
 * than the original (re-encode noise, e.g. a different internal encoder decision on a
 * fully-opaque image) must never report alpha as costing less than nothing.
 *
 * @param {number} originalBytes the real compiled `.webp`'s own byte count
 * @param {number} rgbOnlyBytes the SAME image re-encoded with alpha stripped (fully opaque)
 * @returns {{rgbBytes: number, alphaAttributedBytes: number, alphaFraction: number}}
 */
function attributeBytesToChannels(originalBytes, rgbOnlyBytes) {
  const alphaAttributedBytes = Math.max(0, originalBytes - rgbOnlyBytes);
  return {
    rgbBytes: rgbOnlyBytes,
    alphaAttributedBytes,
    alphaFraction: originalBytes === 0 ? 0 : alphaAttributedBytes / originalBytes,
  };
}

/**
 * @param {Uint8Array} alphaBytes every alpha channel byte across the sampled region(s)
 * @returns {Record<number, number>} alpha value (0-255) -> occurrence count
 */
function computeAlphaHistogram(alphaBytes) {
  const histogram = {};
  for (const value of alphaBytes) {
    histogram[value] = (histogram[value] || 0) + 1;
  }
  return histogram;
}

/**
 * @param {Record<number, number>} histogram
 * @param {number} n
 * @returns {{level: number, count: number}[]} the N most frequent alpha levels, descending
 */
function topAlphaLevels(histogram, n) {
  return Object.entries(histogram)
    .map(([level, count]) => ({ level: Number(level), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/**
 * design.md §13.5 (tasks.md slice 17 task 3): a fully-transparent pixel's RGB bytes are
 * compositor-invisible "don't care" values — an encoder is free to pick different filler RGB
 * under alpha=0 across two otherwise-identical encodes with zero visual effect. Zeroing RGB
 * wherever EITHER buffer is transparent at that pixel makes a byte-exact comparator
 * (`compareRasters.diffRgbaBuffers`) report only VISUALLY MEANINGFUL differences.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b same length as `a`, both `width*height*4` RGBA
 * @returns {[Uint8Array, Uint8Array]} new, normalized copies — inputs are never mutated
 */
function zeroRgbWhereEitherTransparent(a, b) {
  const normA = Uint8Array.from(a);
  const normB = Uint8Array.from(b);
  for (let offset = 0; offset < a.length; offset += 4) {
    if (a[offset + 3] === 0 || b[offset + 3] === 0) {
      normA[offset] = 0;
      normA[offset + 1] = 0;
      normA[offset + 2] = 0;
      normB[offset] = 0;
      normB[offset + 1] = 0;
      normB[offset + 2] = 0;
    }
  }
  return [normA, normB];
}

module.exports = {
  computeCompressionRatio,
  attributeBytesToChannels,
  computeAlphaHistogram,
  topAlphaLevels,
  zeroRgbWhereEitherTransparent,
};
