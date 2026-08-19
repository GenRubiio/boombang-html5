import { describe, it, expect } from 'vitest'
import { computeMaxFramePieces } from './computeMaxFramePieces.cjs'

// Real defect found live (tasks.md slice 26, boomer's down_llorar): `LayeredAvatar`'s runtime
// pool of pooled `Image` children is sized ONCE, at construction, from `computeMaxPoolSize`
// scanning `manifest.frames` — but at construction time `manifest.frames` holds ONLY the base
// pack's frames (action packs are lazy-loaded and merged in later, `AvatarManager.js`'s
// `Object.assign(baseManifest.frames, keyManifest.frames)`). Any action key whose own per-frame
// piece count (`frame.L.length`) exceeds the BASE pack's own max is silently under-pooled:
// `_applyFrame`'s `const child = this._pool[i]; if (!child) return;` drops every piece beyond
// the pool's fixed size with no error — confirmed against EVERY currently-compiled character
// (14 of 14, including already-shipped `rasta`/`sally`), not boomer-specific. The general fix:
// the COMPILER already has full visibility across base+every action key's frames BEFORE
// `splitLayeredManifest` runs — computing the TRUE global max once, at compile time, and
// shipping it as `manifest.maxFramePieces` (character-level, resident before any action pack
// loads) lets the runtime size the pool correctly from the start, regardless of load order.
describe('computeMaxFramePieces', () => {
  it('returns the max L.length across every frame in the given frames dict', () => {
    const frames = {
      f1: { L: [1, 2, 3] },
      f2: { L: [1, 2, 3, 4, 5] },
      f3: { L: [1] },
    }
    expect(computeMaxFramePieces(frames)).toBe(5)
  })

  it('returns 0 for an empty frames dict', () => {
    expect(computeMaxFramePieces({})).toBe(0)
  })

  it('treats a frame with a missing/empty L as zero pieces, not a crash', () => {
    const frames = {
      f1: { L: [1, 2] },
      f2: {},
    }
    expect(computeMaxFramePieces(frames)).toBe(2)
  })
})
