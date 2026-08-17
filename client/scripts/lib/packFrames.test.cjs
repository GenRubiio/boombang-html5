import { describe, it, expect } from 'vitest'
import { packFrames, meanLuminance, checkLuminanceWarning } from './packFrames.cjs'

// LR4/LR3 support: shelf-pack unique extracted rects into one or more pages, starting a new
// page whenever an axis would exceed 4096px (design.md §3.1 step 3).
describe('packFrames', () => {
  it('packs rects that fit onto a single page', () => {
    const rects = [
      { id: 'a', w: 100, h: 50 },
      { id: 'b', w: 100, h: 50 },
    ]
    const result = packFrames(rects, { maxSize: 4096 })
    expect(result.pages).toHaveLength(1)
    expect(result.pages[0].width).toBeLessThanOrEqual(4096)
    expect(result.pages[0].height).toBeLessThanOrEqual(4096)
    const placedIds = result.pages[0].placements.map((p) => p.id).sort()
    expect(placedIds).toEqual(['a', 'b'])
  })

  it('starts a new page when an axis would exceed the max size', () => {
    // Each rect is 3000x3000: two side-by-side on one shelf would need 6000px width, over
    // 4096, so packFrames must wrap to a new shelf/page rather than overflow the axis.
    const rects = [
      { id: 'big1', w: 3000, h: 3000 },
      { id: 'big2', w: 3000, h: 3000 },
      { id: 'big3', w: 3000, h: 3000 },
    ]
    const result = packFrames(rects, { maxSize: 4096 })
    expect(result.pages.length).toBeGreaterThan(1)
    result.pages.forEach((page) => {
      expect(page.width).toBeLessThanOrEqual(4096)
      expect(page.height).toBeLessThanOrEqual(4096)
    })
    const allIds = result.pages.flatMap((p) => p.placements.map((pl) => pl.id)).sort()
    expect(allIds).toEqual(['big1', 'big2', 'big3'])
  })
})

// The actionable authoring signal for multiply-tint fidelity (design.md §5 cost): warn, never
// fail, when a tintable piece's mean luminance is below a threshold.
describe('meanLuminance / checkLuminanceWarning', () => {
  it('computes the mean luminance of an all-white RGBA buffer as near 255', () => {
    const buf = Buffer.from([255, 255, 255, 255, 255, 255, 255, 255])
    expect(meanLuminance(buf)).toBeCloseTo(255, 0)
  })

  it('computes the mean luminance of an all-black RGBA buffer as 0', () => {
    const buf = Buffer.from([0, 0, 0, 255, 0, 0, 0, 255])
    expect(meanLuminance(buf)).toBe(0)
  })

  it('warns when a tintable piece is dark', () => {
    expect(checkLuminanceWarning(40, { threshold: 80 })).toMatch(/luminance/i)
  })

  it('does not warn when a tintable piece is bright enough', () => {
    expect(checkLuminanceWarning(200, { threshold: 80 })).toBeNull()
  })
})
