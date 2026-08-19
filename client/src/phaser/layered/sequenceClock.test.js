import { describe, it, expect } from 'vitest'
import { advanceSequence } from './sequenceClock.js'

// design.md §9/§10 (R7/R13): the pure frame-advance math LayeredAvatar.tick() delegates to,
// extracted so it is directly unit-testable without a live Phaser scene (design.md §8 — a
// Container cannot be instantiated in this project's node-environment vitest setup). Tick()
// itself stays a thin wrapper that applies `visited` frames and emits animationupdate/
// animationcomplete; the resolved-state harness (PR2) re-covers this live via R7/R13.
describe('advanceSequence', () => {
  it('advances one frame per whole frameDuration elapsed, wrapping to 0 for an infinitely repeating sequence (repeat:-1)', () => {
    const result = advanceSequence({ seqIndex: 0, accum: 0, fps: 10, repeat: -1, frameCount: 3 }, 100)
    expect(result).toEqual({ seqIndex: 1, accum: 0, playing: true, completed: false, visited: [1] })
  })

  it('wraps back to frame 0 past the last frame for repeat:-1, and never completes', () => {
    const result = advanceSequence({ seqIndex: 2, accum: 0, fps: 10, repeat: -1, frameCount: 3 }, 100)
    expect(result).toEqual({ seqIndex: 0, accum: 0, playing: true, completed: false, visited: [0] })
  })

  it('advances normally before reaching the last frame for a non-repeating sequence (repeat:0)', () => {
    const result = advanceSequence({ seqIndex: 1, accum: 0, fps: 10, repeat: 0, frameCount: 3 }, 100)
    expect(result).toEqual({ seqIndex: 2, accum: 0, playing: true, completed: false, visited: [2] })
  })

  it('completes exactly once when a non-repeating sequence (repeat:0) passes its last frame, without advancing seqIndex further', () => {
    const result = advanceSequence({ seqIndex: 2, accum: 0, fps: 10, repeat: 0, frameCount: 3 }, 100)
    expect(result).toEqual({ seqIndex: 2, accum: 0, playing: false, completed: true, visited: [] })
  })

  it('accumulates leftover time across multiple frame advances within one call (delta spans 2 frame durations)', () => {
    const result = advanceSequence({ seqIndex: 0, accum: 0, fps: 10, repeat: -1, frameCount: 5 }, 250)
    expect(result).toEqual({ seqIndex: 2, accum: 50, playing: true, completed: false, visited: [1, 2] })
  })

  it('does not advance at all when delta is under one frameDuration, preserving accum', () => {
    const result = advanceSequence({ seqIndex: 0, accum: 30, fps: 10, repeat: -1, frameCount: 3 }, 40)
    expect(result).toEqual({ seqIndex: 0, accum: 70, playing: true, completed: false, visited: [] })
  })
})
