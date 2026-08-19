// design.md §13.3 (tasks.md slice 15 task 1): pages never shared between unrelated animation
// keys — packs each key's own rects independently via an injected `packFrames` (kept
// synchronous/injectable the same way svgFromPaths.cjs's `setSharedVectorBounds` is, since the
// real `packFrames` now lives in the ESM `shared/assetPipeline/` module).

import { describe, it, expect } from 'vitest'
import { packActionPiecesPerKey } from './packActionPiecesPerKey.cjs'

describe('packActionPiecesPerKey', () => {
  it('packs each key independently — no piece id from one key ever appears in another key\'s pages', () => {
    const keyToRects = {
      down_llorar: [{ id: 'a0', w: 10, h: 10 }, { id: 'a1', w: 10, h: 10 }],
      leftdown_punch_rec: [{ id: 'a2', w: 10, h: 10 }],
    }
    const fakePackFrames = (rects) => ({
      pages: [{ width: 100, height: 100, placements: rects.map((r) => ({ ...r, x: 0, y: 0 })) }],
    })
    const result = packActionPiecesPerKey(keyToRects, fakePackFrames, 4096)

    const idsInDownLlorar = new Set(result.down_llorar[0].placements.map((p) => p.id))
    const idsInPunchRec = new Set(result.leftdown_punch_rec[0].placements.map((p) => p.id))
    for (const id of idsInDownLlorar) expect(idsInPunchRec.has(id)).toBe(false)
    expect(idsInDownLlorar).toEqual(new Set(['a0', 'a1']))
    expect(idsInPunchRec).toEqual(new Set(['a2']))
  })

  it('a key with no rects produces an empty pages array without calling packFrames', () => {
    let called = false
    const fakePackFrames = () => {
      called = true
      return { pages: [] }
    }
    const result = packActionPiecesPerKey({ empty_key: [] }, fakePackFrames, 4096)
    expect(result.empty_key).toEqual([])
    expect(called).toBe(false)
  })

  it('passes maxSize through to packFrames', () => {
    let receivedOptions
    const fakePackFrames = (rects, options) => {
      receivedOptions = options
      return { pages: [] }
    }
    packActionPiecesPerKey({ k: [{ id: 'a0', w: 1, h: 1 }] }, fakePackFrames, 2048)
    expect(receivedOptions).toEqual({ maxSize: 2048 })
  })
})
