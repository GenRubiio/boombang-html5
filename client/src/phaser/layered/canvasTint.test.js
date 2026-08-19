import { describe, it, expect, beforeEach } from 'vitest'
import {
  hexToRgbChannels,
  buildTintedTextureKey,
  multiplyRgbaByChannels,
  computeTintCacheBytes,
  setTintCacheEntry,
  getTintCacheEntry,
  getTintCacheStats,
  clearTintCache,
} from './canvasTint.js'

describe('hexToRgbChannels', () => {
  it('parses a "#rrggbb" hex string into 0-255 channels', () => {
    expect(hexToRgbChannels('#ff00ff')).toEqual({ r: 255, g: 0, b: 255 })
  })

  it('parses a hex string without a leading "#" the same way', () => {
    expect(hexToRgbChannels('336666')).toEqual({ r: 51, g: 102, b: 102 })
  })
})

describe('buildTintedTextureKey', () => {
  it('produces a deterministic key from atlasKey/frameName/hex', () => {
    expect(buildTintedTextureKey('rasta_base_atlas', 'body_0', '#FF00FF')).toBe(
      '__layeredTint:rasta_base_atlas:body_0:ff00ff'
    )
  })

  it('a different colour produces a different key (not a hardcoded return)', () => {
    const a = buildTintedTextureKey('rasta_base_atlas', 'body_0', '#ff00ff')
    const b = buildTintedTextureKey('rasta_base_atlas', 'body_0', '#00ff00')
    expect(a).not.toBe(b)
  })
})

describe('multiplyRgbaByChannels', () => {
  it('multiplies RGB by the colour, leaves alpha untouched (real pet09-scale example)', () => {
    const rgba = new Uint8ClampedArray([255, 255, 255, 255])
    multiplyRgbaByChannels(rgba, { r: 255, g: 0, b: 255 })
    expect([...rgba]).toEqual([255, 0, 255, 255])
  })

  it('a partial-alpha, non-white source pixel scales correctly (triangulation)', () => {
    const rgba = new Uint8ClampedArray([200, 200, 200, 128])
    multiplyRgbaByChannels(rgba, { r: 51, g: 102, b: 102 })
    // 200 * 51/255 = 40, 200 * 102/255 = 80, alpha stays 128
    expect([...rgba]).toEqual([40, 80, 80, 128])
  })

  it('mutates the same reference it returns, over multiple pixels', () => {
    const rgba = new Uint8ClampedArray([255, 255, 255, 255, 255, 255, 255, 0])
    const result = multiplyRgbaByChannels(rgba, { r: 0, g: 128, b: 255 })
    expect(result).toBe(rgba)
    expect([...rgba]).toEqual([0, 128, 255, 255, 0, 128, 255, 0])
  })
})

describe('computeTintCacheBytes', () => {
  it('sums width*height*4 over every cached entry', () => {
    expect(computeTintCacheBytes([{ width: 10, height: 5 }, { width: 2, height: 2 }])).toBe(
      10 * 5 * 4 + 2 * 2 * 4
    )
  })

  it('returns 0 for an empty cache (not a hardcoded non-zero default)', () => {
    expect(computeTintCacheBytes([])).toBe(0)
  })
})

// design.md §8: the cache Map/accessors live in THIS module (not canvasTintCache.js, the
// Phaser-dependent I/O shell) specifically so `avatarMetrics.js` can read cache stats without
// transitively importing `phaser` in its own node/no-DOM unit-test environment — see that
// file's import comment. Exercised here with no live Phaser/Canvas context at all.
describe('tint cache accessors (setTintCacheEntry/getTintCacheEntry/getTintCacheStats)', () => {
  beforeEach(() => {
    clearTintCache()
  })

  it('a set entry is retrievable by the same key, and reflected in getTintCacheStats', () => {
    setTintCacheEntry('k1', { textureKey: 'k1', width: 10, height: 20 })
    expect(getTintCacheEntry('k1')).toEqual({ textureKey: 'k1', width: 10, height: 20 })
    expect(getTintCacheStats()).toEqual({ count: 1, entries: [{ width: 10, height: 20 }] })
  })

  it('an unset key returns undefined, and an empty cache reports zero entries', () => {
    expect(getTintCacheEntry('missing')).toBeUndefined()
    expect(getTintCacheStats()).toEqual({ count: 0, entries: [] })
  })

  it('clearTintCache empties every previously-set entry (test/measurement isolation)', () => {
    setTintCacheEntry('k1', { textureKey: 'k1', width: 5, height: 5 })
    setTintCacheEntry('k2', { textureKey: 'k2', width: 6, height: 6 })
    expect(getTintCacheStats().count).toBe(2)
    clearTintCache()
    expect(getTintCacheStats()).toEqual({ count: 0, entries: [] })
  })
})
