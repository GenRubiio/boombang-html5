// design.md §13.7 (tasks.md slice 20 task 2): merging a real ss:1 recompile of the over-budget
// key(s) back into the full action-compile result must DROP that key's stale ss:2 piece/frame
// entries — a real defect found while designing this: the final per-key packer only ever
// consults the CURRENT `keyPieceIds[key]`, so an orphaned old id is never packed/located, yet
// would still be blindly merged into the shipped manifest's `pieces` object by the caller's own
// `Object.assign` if left behind, corrupting it with unlocated dead entries.
import { describe, it, expect } from 'vitest'
import { mergeSsOverrideResults } from './applyActionKeySsOverride.cjs'

function makeActionResult() {
  return {
    sequences: {
      down_llorar: { frames: ['a0', 'a1'] },
      left_fall: { frames: ['a2', 'a3'] },
    },
    pieces: {
      a10: { frame: { w: 10, h: 10 }, slot: null, raster: Buffer.from('old-a10') },
      a11: { frame: { w: 10, h: 10 }, slot: null, raster: Buffer.from('old-a11') },
      a20: { frame: { w: 20, h: 20 }, slot: null, raster: Buffer.from('keep-a20') },
    },
    frames: {
      a2: { o: [0, 0], L: [{ p: 'a10', dx: 0, dy: 0 }] },
      a3: { o: [0, 0], L: [{ p: 'a11', dx: 0, dy: 0 }] },
      a0: { o: [0, 0], L: [{ p: 'a20', dx: 0, dy: 0 }] },
    },
    keyPieceIds: { left_fall: ['a10', 'a11'], down_llorar: ['a20'] },
    keyFrameIds: { left_fall: ['a2', 'a3'], down_llorar: ['a0'] },
  }
}

describe('mergeSsOverrideResults', () => {
  it('replaces the override key\'s pieces/frames and drops the stale ss:2 entries', () => {
    const actionResult = makeActionResult()
    const recompiled = {
      sequences: { left_fall: { frames: ['a99'] } },
      pieces: { a98: { frame: { w: 5, h: 5 }, slot: null, raster: Buffer.from('new-a98') } },
      frames: { a99: { o: [0, 0], L: [{ p: 'a98', dx: 0, dy: 0 }] } },
      keyPieceIds: { left_fall: ['a98'] },
      keyFrameIds: { left_fall: ['a99'] },
    }

    const merged = mergeSsOverrideResults(actionResult, ['left_fall'], recompiled)

    expect(merged.pieces.a10).toBeUndefined()
    expect(merged.pieces.a11).toBeUndefined()
    expect(merged.pieces.a98).toEqual(recompiled.pieces.a98)
    expect(merged.frames.a2).toBeUndefined()
    expect(merged.frames.a3).toBeUndefined()
    expect(merged.frames.a99).toEqual(recompiled.frames.a99)
    expect(merged.keyPieceIds.left_fall).toEqual(['a98'])
    expect(merged.keyFrameIds.left_fall).toEqual(['a99'])
    expect(merged.sequences.left_fall).toEqual({ frames: ['a99'] })
  })

  it('leaves a non-overridden key entirely untouched', () => {
    const actionResult = makeActionResult()
    const recompiled = {
      sequences: { left_fall: { frames: ['a99'] } },
      pieces: { a98: { frame: { w: 5, h: 5 }, slot: null, raster: Buffer.from('new-a98') } },
      frames: { a99: { o: [0, 0], L: [{ p: 'a98', dx: 0, dy: 0 }] } },
      keyPieceIds: { left_fall: ['a98'] },
      keyFrameIds: { left_fall: ['a99'] },
    }

    const merged = mergeSsOverrideResults(actionResult, ['left_fall'], recompiled)

    expect(merged.pieces.a20).toEqual(actionResult.pieces.a20)
    expect(merged.frames.a0).toEqual(actionResult.frames.a0)
    expect(merged.keyPieceIds.down_llorar).toEqual(['a20'])
  })

  it('is a no-op when overrideKeys is empty', () => {
    const actionResult = makeActionResult()
    const before = JSON.parse(JSON.stringify({ ...actionResult, pieces: {}, frames: {} }))
    const merged = mergeSsOverrideResults(actionResult, [], { sequences: {}, pieces: {}, frames: {}, keyPieceIds: {}, keyFrameIds: {} })
    expect(Object.keys(merged.pieces).sort()).toEqual(['a10', 'a11', 'a20'])
    expect(Object.keys(merged.frames).sort()).toEqual(['a0', 'a2', 'a3'])
    expect(before).toBeTruthy() // sanity: fixture constructed without throwing
  })
})
