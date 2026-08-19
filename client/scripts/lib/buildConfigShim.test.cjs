import { describe, it, expect } from 'vitest'
import { buildConfigShim } from './buildConfigShim.cjs'

// design.md §15 (tasks.md slice 10 task 4): `--emit-config-shim` writes a baked-shaped
// config.json (`frameRate`, `repeat`, `frameWidth`, `frameHeight`, `positionX`, `positionY`,
// `flip_horizontally`, `prefix`, `atlasKey: null`) derived from a compiled layered manifest —
// so `window.avatars_config[avatarId]` consumers (AnimationUtils and friends) see a
// well-formed entry for sally instead of `undefined`, with nothing naming a baked atlas.
// Tested against a small FIXTURE manifest (design.md §15: "the compile is deferred past the
// branch point"), not sally's real output.
describe('buildConfigShim', () => {
  const fixtureManifest = {
    ss: 2,
    bodyBounds: { w: 40, h: 55 },
    frames: {
      f0: { o: [20, 27.5] },
      f1: { o: [20, 27.5] },
    },
    sequences: {
      down_idle: { fps: 19, repeat: -1, frames: ['f0'] },
      down_talk: { fps: 19, repeat: 0, frames: ['f0', 'f1'] },
    },
    mirrors: {
      right_idle: { from: 'down_idle', flipX: true },
    },
  }

  it('emits one well-formed, atlasKey:null entry per authored sequence', () => {
    const shim = buildConfigShim(fixtureManifest)
    expect(shim.down_idle).toEqual({
      atlasKey: null,
      prefix: 'sprites/down_idle/',
      flip_horizontally: false,
      start: 1,
      end: 1,
      frameRate: 19,
      frameWidth: 80,
      frameHeight: 110,
      repeat: -1,
      positionX: 40,
      positionY: 55,
    })
  })

  it('derives end/frameRate/repeat per sequence independently (a second, different sequence)', () => {
    const shim = buildConfigShim(fixtureManifest)
    expect(shim.down_talk.end).toBe(2)
    expect(shim.down_talk.repeat).toBe(0)
  })

  it('emits a mirrored entry sharing its source prefix but with flip_horizontally true', () => {
    const shim = buildConfigShim(fixtureManifest)
    expect(shim.right_idle).toEqual({ ...shim.down_idle, flip_horizontally: true })
  })

  it('every emitted entry has atlasKey: null', () => {
    const shim = buildConfigShim(fixtureManifest)
    Object.values(shim).forEach((entry) => expect(entry.atlasKey).toBeNull())
  })
})
