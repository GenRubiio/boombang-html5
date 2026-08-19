import { describe, it, expect } from 'vitest'
import { meanLuminance, checkLuminanceWarning } from './packFrames.cjs'

// design.md §12.3 (tasks.md slice 8 task 2): `packFrames` itself moved to
// client/src/shared/assetPipeline/packFrames.js (see that file's own test) — this file keeps only
// the build-only mean-luminance authoring check.

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
