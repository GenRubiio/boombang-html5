import { describe, it, expect } from 'vitest'
import { buildRasterAvatarManifest } from './buildRasterAvatarManifest.cjs'

// god/apply pass (2026-08-19): `god.bb`'s own meta.json declares `"raster": true`, not
// `"layers": true` — its `_frames.json` is ALREADY the final baked piece-reference shape
// (`{o, x, y, w, h, p}` per frame, ONE implicit piece, no `L` wrapper — unlike a normal
// character's `_frames.json`, which wraps multiple pieces per frame in an `L` array). No
// vector path data exists to rasterize (fact B/§5.2 do not apply here), so this builder
// skips straight from the raw frame-reference pool to the LayeredAvatar-compatible manifest
// shape `compile-layered-avatar.cjs` itself produces (`pieces`/`frames`/`sequences`/
// `bodyBounds`/`slots`/`mirrors`) — the "no layered rasterization needed, loads as a baked
// avatar" path (apply-progress.md's own "god" section has the full account, including the
// same shape found in `ghost.bb`/`wraith.bb`).
describe('buildRasterAvatarManifest', () => {
  const framesRaw = [
    { o: [10, 20], x: 1, y: 2, w: 30, h: 40, p: 0 }, // frame 0 -> piece p0
    { o: [10, 20], x: 1, y: 2, w: 30, h: 40, p: 1 }, // frame 1 -> piece p1
    { o: [0, 0] }, // frame 2 -> empty/blank frame (no 'p' field at all)
  ]
  const pieceAtlasLocations = {
    p0: { x: 0, y: 0, w: 60, h: 80, page: 0 },
    p1: { x: 60, y: 0, w: 60, h: 80, page: 0 },
  }
  const sequenceIndexArrays = {
    down_idle: [0],
    down_talk: [0, 1, 2],
  }
  const mirrors = { right_idle: { from: 'down_idle', flipX: true } }

  function build(overrides = {}) {
    return buildRasterAvatarManifest({
      character: 'god',
      ss: 2,
      framesRaw,
      sequenceIndexArrays,
      pieceAtlasLocations,
      mirrors,
      ...overrides,
    })
  }

  it('builds pieces keyed by p<N> with atlas placement (pixel) and logical (pre-ss) size', () => {
    const manifest = build()
    expect(manifest.pieces.p0).toEqual({
      frame: { x: 0, y: 0, w: 60, h: 80 },
      page: 0,
      w: 30,
      h: 40,
      slot: null,
      pack: 'base',
    })
    expect(manifest.pieces.p1.page).toBe(0)
  })

  it('builds one L entry per non-empty frame and an empty L for a blank frame', () => {
    const manifest = build()
    expect(manifest.frames['0']).toEqual({ o: [10, 20], L: [{ p: 'p0', dx: 1, dy: 2 }] })
    expect(manifest.frames['1']).toEqual({ o: [10, 20], L: [{ p: 'p1', dx: 1, dy: 2 }] })
    expect(manifest.frames['2']).toEqual({ o: [0, 0], L: [] })
  })

  it('passes each sequence\'s own frame-index array through unchanged, fps 19, pack base', () => {
    const manifest = build()
    expect(manifest.sequences.down_idle).toEqual({ fps: 19, repeat: -1, frames: [0], pack: 'base' })
  })

  it('gives a key ending in "_talk" repeat:0 (one-shot), everything else repeat:-1 (loop)', () => {
    const manifest = build()
    expect(manifest.sequences.down_talk.repeat).toBe(0)
    expect(manifest.sequences.down_idle.repeat).toBe(-1)
  })

  it('computes bodyBounds as the max (dx+w, dy+h) across every referenced piece', () => {
    const manifest = build()
    // both pieces sit at dx:1,dy:2 with logical w:30,h:40 -> max is 1+30=31, 2+40=42
    expect(manifest.bodyBounds).toEqual({ w: 31, h: 42 })
  })

  it('carries the given mirrors through untouched and always ships empty aliases/slots', () => {
    const manifest = build()
    expect(manifest.mirrors).toEqual(mirrors)
    expect(manifest.aliases).toEqual({})
    expect(manifest.slots).toEqual([])
    expect(manifest.defaults).toEqual({})
    expect(manifest.labels).toEqual({})
    expect(manifest.compatibleHats).toEqual([])
    expect(manifest.actionPacks).toEqual([])
    expect(manifest.ssOverrides).toEqual({})
    expect(manifest.maxFramePieces).toBe(1)
  })

  it('carries the character name and ss through', () => {
    const manifest = build()
    expect(manifest.character).toBe('god')
    expect(manifest.ss).toBe(2)
  })

  it('excludes a frame index (and its piece) that no compiled sequence references', () => {
    // a 4th frame/piece exists in the raw pool but no sequence plays index 3 — simulates the
    // real god.bb shape, where `_frames.json` is the WHOLE character's shared pool but this
    // pass compiles only a subset of `meta.anims` (its own base-pack-only idle/talk/walk filter)
    const manifest = build({
      framesRaw: [...framesRaw, { o: [0, 0], x: 5, y: 5, w: 999, h: 999, p: 2 }],
      pieceAtlasLocations: { ...pieceAtlasLocations, p2: { x: 999, y: 999, w: 1998, h: 1998, page: 0 } },
    })
    expect(manifest.frames['3']).toBeUndefined()
    expect(manifest.pieces.p2).toBeUndefined()
    // and bodyBounds must NOT be inflated by the unreferenced piece's huge 999x999 logical size
    expect(manifest.bodyBounds).toEqual({ w: 31, h: 42 })
  })
})
