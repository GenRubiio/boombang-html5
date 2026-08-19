import { describe, it, expect } from 'vitest'
import { compactAtlas, expandCompactAtlas } from './compactAtlas.js'

function makeVerboseAtlas() {
  return {
    textures: [
      {
        image: 'rasta.layers.webp',
        format: 'RGBA8888',
        size: { w: 100, h: 100 },
        scale: 1,
        frames: [
          {
            filename: 'p0',
            rotated: false,
            trimmed: false,
            sourceSize: { w: 10, h: 20 },
            spriteSourceSize: { x: 0, y: 0, w: 10, h: 20 },
            frame: { x: 1, y: 2, w: 10, h: 20 },
          },
          {
            filename: 'p1',
            rotated: false,
            trimmed: false,
            sourceSize: { w: 5, h: 5 },
            spriteSourceSize: { x: 0, y: 0, w: 5, h: 5 },
            frame: { x: 11, y: 22, w: 5, h: 5 },
          },
        ],
      },
    ],
    meta: { app: 'compile-layered-avatar.cjs', version: '1.0.0', character: 'rasta' },
  }
}

describe('compactAtlas / expandCompactAtlas round-trip', () => {
  it('compacts a frame to just filename+frame', () => {
    const compact = compactAtlas(makeVerboseAtlas())
    expect(compact.textures[0].frames[0]).toEqual({ filename: 'p0', frame: { x: 1, y: 2, w: 10, h: 20 } })
  })

  it('expand(compact(x)) reproduces the exact verbose shape', () => {
    const verbose = makeVerboseAtlas()
    const roundTripped = expandCompactAtlas(compactAtlas(verbose))
    expect(roundTripped).toEqual(verbose)
  })

  it('preserves texture-level fields (image/format/size/scale) and meta untouched', () => {
    const verbose = makeVerboseAtlas()
    const compact = compactAtlas(verbose)
    expect(compact.textures[0].image).toBe('rasta.layers.webp')
    expect(compact.textures[0].size).toEqual({ w: 100, h: 100 })
    expect(compact.meta).toEqual(verbose.meta)
  })

  it('is idempotent on an already-verbose atlas (e.g. one compiled with --emit-verbose) rather than mis-expanding it', () => {
    const verbose = makeVerboseAtlas()
    expect(expandCompactAtlas(verbose)).toEqual(verbose)
  })

  it('round-trips multiple texture pages independently', () => {
    const verbose = makeVerboseAtlas()
    verbose.textures.push({
      image: 'rasta.layers_1.webp',
      format: 'RGBA8888',
      size: { w: 50, h: 50 },
      scale: 1,
      frames: [
        {
          filename: 'p2',
          rotated: false,
          trimmed: false,
          sourceSize: { w: 3, h: 3 },
          spriteSourceSize: { x: 0, y: 0, w: 3, h: 3 },
          frame: { x: 0, y: 0, w: 3, h: 3 },
        },
      ],
    })
    const roundTripped = expandCompactAtlas(compactAtlas(verbose))
    expect(roundTripped).toEqual(verbose)
  })
})
