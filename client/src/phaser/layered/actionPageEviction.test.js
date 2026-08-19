import { describe, it, expect } from 'vitest'
import { shouldEvictPage } from './actionPageEviction.js'

// design.md §13.3 (tasks.md slice 15 task 8): idle action-pack eviction. A page unused for N
// seconds is released via `scene.textures.remove` (the I/O shell) — this is the pure
// eviction-timer decision only.
describe('shouldEvictPage', () => {
  it('does not evict a page used well within the threshold', () => {
    expect(shouldEvictPage(1000, 5000, 60000)).toBe(false)
  })

  it('evicts a page unused for exactly the threshold', () => {
    expect(shouldEvictPage(1000, 61000, 60000)).toBe(true)
  })

  it('evicts a page unused for well beyond the threshold', () => {
    expect(shouldEvictPage(0, 999999, 60000)).toBe(true)
  })

  it('does not evict a page with no recorded last-used timestamp yet (never applied)', () => {
    expect(shouldEvictPage(null, 100000, 60000)).toBe(false)
  })
})
