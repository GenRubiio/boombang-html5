import { describe, it, expect } from 'vitest'
import { computeMaxPoolSize } from './computeMaxPoolSize.js'

// Real defect found live (tasks.md slice 26, boomer's own down_llorar — see
// computeMaxFramePieces.cjs's docblock for the full account): `LayeredAvatar`'s pooled-child
// array is sized ONCE, at construction, from whatever `manifest.frames` holds at that exact
// moment — action packs are lazy-loaded and merged in LATER, so a base-only scan silently
// under-sizes the pool for any action key needing more pieces per frame than the base pack
// ever did. Confirmed against all 14 characters compiled before this fix, including
// already-shipped `rasta`/`sally`. Extracted out of `LayeredAvatar.js` (which imports Phaser,
// unavailable under this project's plain-`node` vitest environment — design.md §8, this repo's
// existing `fallback.js`/`pivot.js`/`sequence.js` precedent) so the fix itself is directly
// unit-testable.
describe('computeMaxPoolSize', () => {
  it('prefers manifest.maxFramePieces (the compiler-computed, full base+action fact) when present', () => {
    const manifest = {
      maxFramePieces: 72,
      frames: { f0: { L: [1, 2, 3] } }, // deliberately smaller — must be ignored when the real fact is present
    }
    expect(computeMaxPoolSize(manifest)).toBe(72)
  })

  it('falls back to scanning manifest.frames when maxFramePieces is absent (a manifest compiled before this fix)', () => {
    const manifest = {
      frames: {
        f0: { L: [1, 2, 3] },
        f1: { L: [1, 2, 3, 4, 5] },
      },
    }
    expect(computeMaxPoolSize(manifest)).toBe(5)
  })

  it('returns 0 for a manifest with neither maxFramePieces nor any frames, not a crash', () => {
    expect(computeMaxPoolSize({})).toBe(0)
  })
})
