import { describe, it, expect } from 'vitest'
import { deriveColormeta } from './deriveColormeta.cjs'

// design.md §0 fact A / §4 step 3: `.layers.bb` does not ship colormeta.json — it is derived
// from the sibling vector `<char>.bb`'s `meta.json.colormeta`. Fails loudly when absent (the
// only source of slot defaults/labels; an empty one would silently compile a character with
// zero palette slots).
describe('deriveColormeta', () => {
  it('returns the colormeta object unchanged when present', () => {
    const meta = { char: 'rasta', colormeta: { defaults: { color1: 'b88a5c' }, labels: {}, creatorIdx: 0 } }
    expect(deriveColormeta(meta)).toEqual(meta.colormeta)
  })

  it('throws when meta.json has no colormeta at all', () => {
    expect(() => deriveColormeta({ char: 'rasta' })).toThrow(/colormeta/i)
  })

  it('throws when colormeta is present but has no defaults', () => {
    expect(() => deriveColormeta({ char: 'rasta', colormeta: { labels: {} } })).toThrow(/colormeta/i)
  })
})
