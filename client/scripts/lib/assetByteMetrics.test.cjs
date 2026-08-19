// design.md §13.5 (tasks.md slice 17 task 1): pure byte-accounting/histogram functions backing
// measure-asset-bytes.cjs. The `sharp` re-encode calls (RGB-flattened re-encode, raw pixel
// decode) are the I/O shell — these functions only ever see plain numbers/typed arrays.

import { describe, it, expect } from 'vitest'
import {
  computeCompressionRatio,
  attributeBytesToChannels,
  computeAlphaHistogram,
  topAlphaLevels,
  zeroRgbWhereEitherTransparent,
} from './assetByteMetrics.cjs'

describe('computeCompressionRatio', () => {
  it('computes webpBytes / rawBytes as a fraction', () => {
    expect(computeCompressionRatio(100, 1000)).toBe(0.1)
  })

  it('handles rawBytes of 0 without dividing by zero', () => {
    expect(computeCompressionRatio(100, 0)).toBe(0)
  })
})

describe('attributeBytesToChannels', () => {
  it('attributes the diff between original and RGB-only bytes to alpha', () => {
    const result = attributeBytesToChannels(1000, 600)
    expect(result).toEqual({ rgbBytes: 600, alphaAttributedBytes: 400, alphaFraction: 0.4 })
  })

  it('reports zero alpha attribution when RGB-only re-encode costs the same as the original (no alpha cost at all)', () => {
    const result = attributeBytesToChannels(500, 500)
    expect(result.alphaAttributedBytes).toBe(0)
    expect(result.alphaFraction).toBe(0)
  })

  it('clamps a negative diff to zero rather than reporting alpha as cheaper than free (re-encode noise)', () => {
    const result = attributeBytesToChannels(500, 520)
    expect(result.alphaAttributedBytes).toBe(0)
    expect(result.alphaFraction).toBe(0)
  })
})

describe('computeAlphaHistogram', () => {
  it('counts occurrences of each distinct alpha value', () => {
    const alphaBytes = new Uint8Array([0, 0, 128, 255, 255, 255])
    expect(computeAlphaHistogram(alphaBytes)).toEqual({ 0: 2, 128: 1, 255: 3 })
  })

  it('returns an empty histogram for an empty input', () => {
    expect(computeAlphaHistogram(new Uint8Array([]))).toEqual({})
  })
})

// design.md §13.5 (tasks.md slice 17 task 3): live-discovered correction, needed to make
// `compareRasters.diffRgbaBuffers` usable for encoder-setting fidelity evaluation. A
// fully-transparent pixel's RGB bytes are compositor-invisible "don't care" values — a webp
// re-encode (even at a DIFFERENT effort level of the SAME lossless setting) can legitimately
// pick different RGB filler bytes under alpha=0 with zero visual effect, which a byte-exact
// comparator would otherwise wrongly flag as a fidelity failure on every single re-encode.
describe('zeroRgbWhereEitherTransparent', () => {
  it('zeroes RGB where EITHER buffer is fully transparent at that pixel, leaving alpha and opaque-pixel RGB untouched', () => {
    // pixel 0: opaque in both -> untouched. pixel 1: transparent in `a` only -> RGB zeroed in both.
    const a = new Uint8Array([10, 20, 30, 255, 40, 50, 60, 0])
    const b = new Uint8Array([10, 20, 30, 255, 99, 88, 77, 0])
    const [normA, normB] = zeroRgbWhereEitherTransparent(a, b)
    expect([...normA]).toEqual([10, 20, 30, 255, 0, 0, 0, 0])
    expect([...normB]).toEqual([10, 20, 30, 255, 0, 0, 0, 0])
  })

  it('does not mutate the input buffers', () => {
    const a = new Uint8Array([1, 2, 3, 0])
    const b = new Uint8Array([1, 2, 3, 0])
    zeroRgbWhereEitherTransparent(a, b)
    expect([...a]).toEqual([1, 2, 3, 0])
  })
})

describe('topAlphaLevels', () => {
  it('returns the N most frequent alpha levels, descending by count', () => {
    const histogram = { 0: 50, 64: 5, 128: 30, 255: 100 }
    expect(topAlphaLevels(histogram, 2)).toEqual([
      { level: 255, count: 100 },
      { level: 0, count: 50 },
    ])
  })

  it('returns fewer entries than N when the histogram has fewer distinct levels', () => {
    expect(topAlphaLevels({ 0: 10 }, 4)).toEqual([{ level: 0, count: 10 }])
  })
})
