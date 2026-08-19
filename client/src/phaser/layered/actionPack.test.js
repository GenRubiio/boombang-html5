import { describe, it, expect } from 'vitest'
import { computeActionBackedKeys } from './actionPack.js'

// design.md §6: the lazy action pack. A sequence/alias/mirror key is "action-backed" when its
// underlying compiled sequence carries `pack: 'actions'` (design.md §13.2, tasks.md slice 14:
// stamped directly onto each sequence by compile-layered-avatar.cjs, at the point it already
// knows which pack backs it), determined once from the manifest and independent of whether the
// pack has actually loaded yet — `play()` only consults this set WHEN the actions pack is not
// yet loaded.
describe('computeActionBackedKeys', () => {
  // design.md §13.3 (tasks.md slice 15 task 5): returns a key -> packId MAP, not a Set — with
  // per-key action packs, `unloadedKeys`/the `pack-loading` degrade must know WHICH pack backs
  // a key, not merely THAT one does, so a request can target the right pack.
  const manifest = {
    sequences: {
      down_idle: { frames: ['0'], pack: 'base' },
      down_risa1: { frames: ['a0'], pack: 'down_risa1' },
    },
    aliases: {
      risa1: 'down_risa1',
    },
    mirrors: {
      right_risa1: { from: 'down_risa1', flipX: true },
      right_idle: { from: 'down_idle', flipX: true },
    },
  }

  it('excludes a base-pack sequence key', () => {
    expect(computeActionBackedKeys(manifest).has('down_idle')).toBe(false)
  })

  it('maps an action-pack sequence key directly to its own packId', () => {
    expect(computeActionBackedKeys(manifest).get('down_risa1')).toBe('down_risa1')
  })

  it('maps an alias key to its target sequence\'s packId', () => {
    expect(computeActionBackedKeys(manifest).get('risa1')).toBe('down_risa1')
  })

  it('maps a mirror key to its "from" sequence\'s packId', () => {
    expect(computeActionBackedKeys(manifest).get('right_risa1')).toBe('down_risa1')
  })

  it('excludes a mirror key whose "from" sequence is base-backed', () => {
    expect(computeActionBackedKeys(manifest).has('right_idle')).toBe(false)
  })

  it('handles a manifest with no aliases/mirrors declared', () => {
    const bare = { ...manifest, aliases: undefined, mirrors: undefined }
    const keys = computeActionBackedKeys(bare)
    expect(keys.has('down_risa1')).toBe(true)
    expect(keys.has('down_idle')).toBe(false)
  })

  it('distinguishes two DIFFERENT action packs backing two different keys', () => {
    const twoPack = {
      sequences: {
        down_idle: { frames: ['0'], pack: 'base' },
        down_llorar: { frames: ['a0'], pack: 'down_llorar' },
        leftdown_punch_rec: { frames: ['a5'], pack: 'leftdown_punch_rec' },
      },
    }
    const keys = computeActionBackedKeys(twoPack)
    expect(keys.get('down_llorar')).toBe('down_llorar')
    expect(keys.get('leftdown_punch_rec')).toBe('leftdown_punch_rec')
  })

  // design.md §13.2 (tasks.md slice 14 task 4): the base manifest room entry actually loads
  // carries NO `pieces`/`frames` for action-backed sequences at all (they live in the separate
  // actions manifest, fetched only once an action is triggered) — this must still resolve
  // correctly using only `sequences`/`aliases`/`mirrors`, with no `pieces`/`frames` keys present
  // on the manifest object whatsoever.
  it('operates correctly given ONLY sequences/aliases/mirrors — no pieces/frames present at all (the real base-manifest shape after the slice 14 split)', () => {
    const baseManifestOnly = {
      sequences: {
        down_idle: { frames: ['0'], pack: 'base' },
        down_risa1: { frames: ['a0'], pack: 'down_risa1' },
      },
      aliases: { risa1: 'down_risa1' },
      mirrors: { right_risa1: { from: 'down_risa1', flipX: true } },
    }
    expect('pieces' in baseManifestOnly).toBe(false)
    expect('frames' in baseManifestOnly).toBe(false)

    const keys = computeActionBackedKeys(baseManifestOnly)
    expect(keys.has('down_idle')).toBe(false)
    expect(keys.get('down_risa1')).toBe('down_risa1')
    expect(keys.get('risa1')).toBe('down_risa1')
    expect(keys.get('right_risa1')).toBe('down_risa1')
  })
})
