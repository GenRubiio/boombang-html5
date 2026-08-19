import { describe, it, expect } from 'vitest'
import { compactManifest, expandCompactManifest } from './compactManifest.js'

function makeVerboseManifest() {
  return {
    v: 1,
    compilerVersion: '1.0.0',
    sourceHash: 'abc',
    character: 'rasta',
    ss: 2,
    slots: ['color1'],
    defaults: { color1: 'b88a5c' },
    labels: {},
    compatibleHats: [],
    bodyBounds: { w: 100, h: 200 },
    pieces: {
      p0: { frame: { x: 0, y: 0, w: 10, h: 10 }, page: 0, w: 5, h: 5, slot: 'color1', pack: 'base' },
      p1: { frame: { x: 10, y: 0, w: 10, h: 10 }, page: 0, w: 5, h: 5, slot: null, pack: 'base' },
    },
    frames: {
      0: { o: [1, 2], L: [{ p: 'p0', dx: 1, dy: 1 }, { p: 'p1', dx: 2, dy: 2 }] },
      1: { o: [3, 4], L: [{ p: 'p1', dx: 5, dy: 6 }] },
    },
    sequences: { down_idle: { fps: 19, repeat: -1, frames: [0], pack: 'base' } },
    aliases: {},
    mirrors: {},
  }
}

describe('compactManifest / expandCompactManifest round-trip', () => {
  it('replaces each frame\'s L[].p string id with its integer index into Object.keys(pieces)', () => {
    const compact = compactManifest(makeVerboseManifest())
    // p0 is index 0, p1 is index 1 in Object.keys(pieces) insertion order
    expect(compact.frames[0].L).toEqual([[0, 1, 1], [1, 2, 2]])
    expect(compact.frames[1].L).toEqual([[1, 5, 6]])
  })

  it('expand(compact(x)) reproduces the exact verbose manifest', () => {
    const verbose = makeVerboseManifest()
    const roundTripped = expandCompactManifest(compactManifest(verbose))
    expect(roundTripped).toEqual(verbose)
  })

  it('leaves every character-level field and the pieces dict itself untouched', () => {
    const verbose = makeVerboseManifest()
    const compact = compactManifest(verbose)
    expect(compact.pieces).toEqual(verbose.pieces)
    expect(compact.sequences).toEqual(verbose.sequences)
    expect(compact.bodyBounds).toEqual(verbose.bodyBounds)
  })

  it('is idempotent on an already-verbose manifest (e.g. one compiled with --emit-verbose) rather than mis-expanding it', () => {
    const verbose = makeVerboseManifest()
    expect(expandCompactManifest(verbose)).toEqual(verbose)
  })

  it('round-trips a frame with an empty L[] (defensive edge case)', () => {
    const verbose = makeVerboseManifest()
    verbose.frames[2] = { o: [0, 0], L: [] }
    const roundTripped = expandCompactManifest(compactManifest(verbose))
    expect(roundTripped.frames[2]).toEqual({ o: [0, 0], L: [] })
  })
})
