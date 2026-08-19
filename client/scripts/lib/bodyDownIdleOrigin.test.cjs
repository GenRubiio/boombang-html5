import { describe, it, expect } from 'vitest'
import { extractBodyDownIdleOriginX } from './bodyDownIdleOrigin.cjs'

describe('extractBodyDownIdleOriginX', () => {
  it('returns the down_idle first-frame origin X from a real-shaped manifest', () => {
    const manifest = {
      sequences: { down_idle: { frames: [0] } },
      frames: { 0: { o: [40.6, 106] } },
    }
    expect(extractBodyDownIdleOriginX(manifest)).toBe(40.6)
  })

  it('uses the FIRST frame when down_idle has several (a different frame proves it is not hardcoded)', () => {
    const manifest = {
      sequences: { down_idle: { frames: [3, 4, 5] } },
      frames: { 3: { o: [12.5, 90] }, 4: { o: [99, 90] } },
    }
    expect(extractBodyDownIdleOriginX(manifest)).toBe(12.5)
  })

  it('throws when the manifest declares no down_idle sequence', () => {
    expect(() => extractBodyDownIdleOriginX({ sequences: {}, frames: {} })).toThrow(
      /down_idle/i
    )
  })

  it('throws when the referenced frame has no "o" origin data', () => {
    const manifest = { sequences: { down_idle: { frames: [0] } }, frames: { 0: {} } }
    expect(() => extractBodyDownIdleOriginX(manifest)).toThrow(/origin/i)
  })
})
