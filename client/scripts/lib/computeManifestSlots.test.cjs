import { describe, it, expect } from 'vitest'
import { computeManifestSlots } from './computeManifestSlots.cjs'

// Real defect found live (tasks.md slice 26, ninja/werewolf): `manifest.slots` was computed as
// ONLY `Object.keys(colormeta.defaults)` — for a character whose vector `.bb` colormeta is
// genuinely empty (design.md §0 fact A's own precedent, `sally`) but whose `.layers.bb` BASE
// PIECES still tag themselves with recolour slots (`p.slot`, confirmed live against ninja's own
// `_frames.json`: color1-color4 all referenced despite an empty colormeta — unlike `sally`,
// whose base pieces reference ZERO slots), `manifest.slots` silently under-reported the real
// set. `resolvePalette` (paletteResolve.js) iterates `manifest.slots || Object.keys(defaults)`
// to decide which slots a caller's custom palette can ever reach — an empty `manifest.slots`
// ([] is truthy, so the `||` never falls through) meant NO custom palette override could ever
// reach these characters' color1-4 pieces at all, silently, even though the pieces genuinely
// need a colour. `slots` must be the UNION of colormeta-declared defaults and every
// piece-referenced slot, not colormeta-declared defaults alone.
describe('computeManifestSlots', () => {
  it('returns the union of colormeta-declared default keys and piece-referenced slots', () => {
    const defaults = { color1: 'aabbcc' }
    const pieces = {
      p0: { slot: 'color1' },
      p1: { slot: 'color2' }, // referenced by a piece, but NOT declared in colormeta
      p2: { slot: null },
    }
    expect(computeManifestSlots(defaults, pieces).sort()).toEqual(['color1', 'color2'])
  })

  it('is a real fix, not a no-op: a character with an empty colormeta but real piece slots (ninja/werewolf shape) still reports those slots', () => {
    const defaults = {}
    const pieces = {
      p0: { slot: 'color3' },
      p1: { slot: 'color1' },
    }
    expect(computeManifestSlots(defaults, pieces).sort()).toEqual(['color1', 'color3'])
  })

  it('returns an empty array for a character with neither declared defaults nor any piece slot (sally\'s own shape)', () => {
    const pieces = { p0: { slot: null }, p1: { slot: undefined } }
    expect(computeManifestSlots({}, pieces)).toEqual([])
  })
})
