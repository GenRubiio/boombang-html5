import { describe, it, expect } from 'vitest'
import { expandSequence } from './sequence.js'

const sequences = {
  down_walk: { fps: 19, repeat: -1, frames: [9, 10, 11, 12, 13, 14, 15, 10, 16, 17, 18, 19, 20] },
  down_idle: { fps: 19, repeat: -1, frames: [0] },
  down_talk: { fps: 19, repeat: 0, frames: [1, 2, 3, 4, 5, 6, 7, 8] },
}

// LR1: explicit frame-index sequences, including repeats, never collapsed to a {start,end} range.
describe('expandSequence', () => {
  it('returns the literal down_walk frame list including the repeated index 10', () => {
    expect(expandSequence(sequences, 'down_walk')).toEqual([
      9, 10, 11, 12, 13, 14, 15, 10, 16, 17, 18, 19, 20,
    ])
  })

  it('returns a sequence with no repeats unchanged', () => {
    expect(expandSequence(sequences, 'down_talk')).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('returns a single-frame sequence as a one-element array', () => {
    expect(expandSequence(sequences, 'down_idle')).toEqual([0])
  })

  it('never represents the result as a {start,end} range object', () => {
    const result = expandSequence(sequences, 'down_walk')
    expect(Array.isArray(result)).toBe(true)
    expect(result.start).toBeUndefined()
    expect(result.end).toBeUndefined()
  })
})
