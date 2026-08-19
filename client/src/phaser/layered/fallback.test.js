import { describe, it, expect } from 'vitest'
import {
  resolveFallbackKey,
  resolveAnimationKey,
  accessoryFollows,
  resolveAccessoryFrameId,
} from './fallback.js'

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

// design.md §9: resolveAnimationKey is the observable superset of resolveFallbackKey — it
// reports which of the 6 reasons produced the resolved key, not just the key itself, so a
// degrade is never silently indistinguishable from a genuine match at the call site.
describe('resolveAnimationKey', () => {
  const seq = {
    down_idle: { frames: [0] },
    down_walk: { frames: [9, 10] },
    leftdown_walk: { frames: [30, 31, 32] },
  }
  const seqWithRisa = { ...seq, down_risa1: { frames: [0, 1, 2] } }
  const mirrors = { rightdown_walk: { from: 'leftdown_walk', flipX: true } }
  const aliases = { risa1: 'down_risa1' }

  it('reason "match": a directly covered key resolves to itself, not degraded', () => {
    expect(resolveAnimationKey(seq, 'down_walk', 'down')).toEqual({
      requestedKey: 'down_walk',
      resolvedKey: 'down_walk',
      degraded: false,
      reason: 'match',
    })
  })

  it('reason "alias": an aliased key (e.g. an emote name) resolves to its source sequence, not degraded', () => {
    expect(resolveAnimationKey(seqWithRisa, 'risa1', 'down', {}, aliases)).toEqual({
      requestedKey: 'risa1',
      resolvedKey: 'down_risa1',
      degraded: false,
      reason: 'alias',
    })
  })

  it('reason "mirror": a synthesized mirrored key resolves to itself (not its `from` source), not degraded', () => {
    expect(resolveAnimationKey(seq, 'rightdown_walk', 'rightdown', mirrors)).toEqual({
      requestedKey: 'rightdown_walk',
      resolvedKey: 'rightdown_walk',
      degraded: false,
      reason: 'mirror',
    })
  })

  it('reason "direction-idle": an uncovered key degrades to the current direction idle', () => {
    const withUpIdle = { ...seq, up_idle: { frames: [0] } }
    expect(resolveAnimationKey(withUpIdle, 'up_special', 'up')).toEqual({
      requestedKey: 'up_special',
      resolvedKey: 'up_idle',
      degraded: true,
      reason: 'direction-idle',
    })
  })

  it('reason "down-idle": degrades all the way to the static down_idle when the direction idle is also uncovered', () => {
    expect(resolveAnimationKey(seq, 'up_special', 'up')).toEqual({
      requestedKey: 'up_special',
      resolvedKey: 'down_idle',
      degraded: true,
      reason: 'down-idle',
    })
  })

  it('reason "pack-loading": a covered key whose pack has not finished loading degrades to the fallback, distinguishable from a real direction-idle degrade', () => {
    const unloadedKeys = new Set(['down_walk'])
    expect(resolveAnimationKey(seq, 'down_walk', 'down', {}, {}, unloadedKeys)).toEqual({
      requestedKey: 'down_walk',
      resolvedKey: 'down_idle',
      degraded: true,
      reason: 'pack-loading',
    })
  })

  it('defaults mirrors/aliases/unloadedKeys so a 2-arg call still works', () => {
    expect(resolveAnimationKey(seq, 'down_idle', 'down').reason).toBe('match')
  })

  // design.md §13.2 (tasks.md slice 14 task 4): the real base manifest room entry loads carries
  // no `pieces`/`frames` for action-backed sequences at all after the manifest split — this
  // function must resolve correctly using only `sequences`/`mirrors`/`aliases` keys, which is
  // already everything it ever reads (confirmed here rather than assumed): each `sequences`
  // entry below carries only `{frames}` with no piece/frame data behind those ids at all.
  it('resolves match/alias/mirror correctly given only sequences/mirrors/aliases — no pieces/frames dereferenced anywhere', () => {
    const baseManifestOnlySeq = {
      down_idle: { frames: ['0'], pack: 'base' },
      down_risa1: { frames: ['a0'], pack: 'actions' }, // 'a0' names no real frame in this fixture
    }
    const baseManifestOnlyMirrors = { rightdown_walk: { from: 'down_risa1', flipX: true } }
    const baseManifestOnlyAliases = { risa1: 'down_risa1' }

    expect(resolveAnimationKey(baseManifestOnlySeq, 'down_idle', 'down').reason).toBe('match')
    expect(
      resolveAnimationKey(baseManifestOnlySeq, 'risa1', 'down', {}, baseManifestOnlyAliases)
    ).toEqual({ requestedKey: 'risa1', resolvedKey: 'down_risa1', degraded: false, reason: 'alias' })
    expect(
      resolveAnimationKey(baseManifestOnlySeq, 'rightdown_walk', 'rightdown', baseManifestOnlyMirrors)
        .reason
    ).toBe('mirror')
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

// Live-reported defect (user: "cuando yo camino hacia adelante el gorro durante la animación
// desaparece... vuelve a aparecer... lo mismo pasa con la mascota"): `_updateAccessory`
// (LayeredAvatar.js) used to index the ACCESSORY's own `anims[key].frames` array directly with
// the BODY's current `_seqIndex`. An accessory package is very often authored with FEWER frames
// than the body for a given key (real compiled data: rasta's `pet09` `down_llorar` has 2 frames
// vs the body's 39) — indexing past the accessory's own last frame produced `undefined`, which
// made the accessory hide for the remainder of that animation and reappear only once the body's
// sequence looped back into the accessory's own covered range. `resolveAccessoryFrameId` is the
// pure fix: it clamps the body's seqIndex into the accessory's own valid range instead of
// indexing out of bounds. Clamp-to-last (never modulo/cycle back to index 0) is deliberate,
// backed by real data: every short accessory array's own TAIL is already a held/settled pose (a
// single-frame array is trivially "held"; a real multi-frame short array, e.g. compiled
// `boomer`/pet01's `down_trampa` — 11 frames vs the body's 50 — ends on an actively-posed frame,
// not a repeat) — holding that last frame continues what the artist already drew. Cycling back
// to frame 0 would instead jump backward into an unrelated earlier pose every time the short
// loop restarts, which is worse than the disappearing bug it would replace (and matches the
// user's second symptom, "hace movimientos raros" — weird movements).
describe('resolveAccessoryFrameId', () => {
  it('returns the frame at seqIndex when the accessory covers it directly', () => {
    expect(resolveAccessoryFrameId(1, [10, 11, 12])).toBe(11)
  })

  it('clamps to the accessory\'s own last frame once seqIndex exceeds its frame count — the exact defect fix (real data: pet09 down_llorar has 2 frames, the body has 39)', () => {
    expect(resolveAccessoryFrameId(5, [2, 2])).toBe(2)
    expect(resolveAccessoryFrameId(38, [2, 2])).toBe(2)
  })

  it('holds the last DISTINCT frame (not a repeat) when the accessory array ends on an actively-posed frame, not a settled one', () => {
    // boomer/pet01's real compiled down_trampa: 11 frames, tail [..., 45, 46, 47, 48] — not a
    // repeat. Clamping must hold 48, never wrap to frame 8 (index 0).
    const frames = [8, 8, 9, 10, 11, 12, 13, 14, 15, 47, 48]
    expect(resolveAccessoryFrameId(10, frames)).toBe(48) // exact boundary: last valid index
    expect(resolveAccessoryFrameId(49, frames)).toBe(48) // far past the end: still holds 48, never 8
  })

  it('is a no-op at the exact boundary (seqIndex === frames.length - 1)', () => {
    expect(resolveAccessoryFrameId(2, [5, 6, 7])).toBe(7)
  })

  it('returns undefined for an empty frames array — never throws, lets the caller hide the sprite', () => {
    expect(resolveAccessoryFrameId(0, [])).toBeUndefined()
  })
})
