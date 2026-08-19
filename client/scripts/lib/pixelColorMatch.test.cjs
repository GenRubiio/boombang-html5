import { describe, it, expect } from 'vitest'
import { hexToRgb, buildSolidRgbaBuffer } from './pixelColorMatch.cjs'

// tasks.md slice 21 defect-1 fix (coordinator-flagged, see apply-progress.md): the pixel-level
// resolved-state check `avatar-resolved-state.spec.js` now runs against a REAL screenshot needs
// a small "expected colour" buffer to reuse the already-tested `diffRgbaBuffers` comparator
// (shared/assetPipeline/compareRasters.js, R16/R17b) instead of writing a new comparator.
describe('hexToRgb', () => {
  it('parses a 6-digit hex string with a leading #', () => {
    expect(hexToRgb('#ff00ff')).toEqual({ r: 255, g: 0, b: 255 })
  })

  it('parses a hex string with no leading # and mixed case', () => {
    expect(hexToRgb('B88A5C')).toEqual({ r: 184, g: 138, b: 92 })
  })
})

describe('buildSolidRgbaBuffer', () => {
  it('fills every pixel with the given colour at full alpha', () => {
    const buf = buildSolidRgbaBuffer(2, 1, '#ff00ff')
    expect(buf.length).toBe(2 * 1 * 4)
    expect([...buf]).toEqual([255, 0, 255, 255, 255, 0, 255, 255])
  })

  it('produces a DIFFERENT buffer for a different colour (not a hardcoded return)', () => {
    const buf = buildSolidRgbaBuffer(1, 1, '#000000')
    expect([...buf]).toEqual([0, 0, 0, 255])
  })
})
