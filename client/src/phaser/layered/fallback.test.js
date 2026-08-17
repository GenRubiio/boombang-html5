import { describe, it, expect } from 'vitest'
import { resolveFallbackKey, accessoryFollows } from './fallback.js'

const sequences = {
  down_idle: { frames: [0] },
  down_walk: { frames: [9, 10] },
}

// ACC4 (pure half): animation-coverage fallback — resolveFallbackKey is a two-step chain,
// `${currentDirection}_idle` then `down_idle`, no heuristic.
describe('resolveFallbackKey', () => {
  it('returns the requested key unchanged when the body package covers it', () => {
    expect(resolveFallbackKey(sequences, 'down_walk', 'down')) .toBe('down_walk')
  })

  it('falls back to `${currentDirection}_idle` when the requested key is not covered', () => {
    const withUpIdle = { ...sequences, up_idle: { frames: [0] } }
    expect(resolveFallbackKey(withUpIdle, 'up_special', 'up')).toBe('up_idle')
  })

  it('falls through to down_idle when even the direction idle is not covered', () => {
    expect(resolveFallbackKey(sequences, 'up_special', 'up')).toBe('down_idle')
  })

  // Live-validation defect 4/7 root cause: a synthesized MIRRORED key (e.g. "rightdown_walk")
  // is never a key in `sequences` — mirrored keys only exist in the compiled manifest's
  // `mirrors` table (design.md §3.1 step 5: "right"/"rightdown"/"rightup" are never authored,
  // only synthesized). resolveFallbackKey previously checked `sequences` alone, so it treated
  // every mirrored key as "not covered" and fell all the way through to the static
  // `down_idle` sequence — freezing the avatar on frame 0 whenever it faced a mirrored
  // direction, exactly the "frame stays fixed on rightdown" symptom reported live.
  const mirrors = {
    rightdown_walk: { from: 'leftdown_walk', flipX: true },
  }
  const sequencesWithLeftdown = { ...sequences, leftdown_walk: { frames: [30, 31, 32] } }

  it('recognises a mirrored key declared only in `mirrors` as covered, not falling through', () => {
    expect(resolveFallbackKey(sequencesWithLeftdown, 'rightdown_walk', 'rightdown', mirrors)).toBe(
      'rightdown_walk'
    )
  })

  it('still falls back to direction idle when a mirrored idle key is declared in mirrors', () => {
    const mirrorsWithIdle = { ...mirrors, rightdown_idle: { from: 'leftdown_idle', flipX: true } }
    const seq = { ...sequencesWithLeftdown, leftdown_idle: { frames: [0] } }
    expect(resolveFallbackKey(seq, 'rightdown_special', 'rightdown', mirrorsWithIdle)).toBe(
      'rightdown_idle'
    )
  })

  it('still falls through to down_idle when a key is covered by neither sequences nor mirrors', () => {
    expect(resolveFallbackKey(sequences, 'rightdown_special', 'rightdown', mirrors)).toBe(
      'down_idle'
    )
  })

  it('defaults `mirrors` to an empty object so existing callers without it keep working', () => {
    expect(resolveFallbackKey(sequences, 'down_walk', 'down')).toBe('down_walk')
  })
})

describe('accessoryFollows', () => {
  it('syncs when the accessory package declares frames for the resolved key', () => {
    expect(accessoryFollows({ down_idle: { frames: [0] } }, 'down_idle')).toBe(true)
  })

  it('hides when the accessory package has no frames for the resolved key', () => {
    expect(accessoryFollows({ down_idle: { frames: [0] } }, 'down_walk')).toBe(false)
  })
})
