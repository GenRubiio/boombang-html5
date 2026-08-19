import { describe, it, expect } from 'vitest'
import { resolveAtlasKeyForPiece } from './atlasKeyResolve.js'

// design.md §13.3 (tasks.md slice 15 task 3): `_atlasKeys` becomes `{base, actions: Map<packId,
// atlasKey>}` — a base piece always resolves to `atlasKeys.base`; an action piece's `pack`
// field (a specific compiled key name, e.g. "down_llorar", not the old generic "actions")
// resolves through the Map. A page dimension is deliberately NOT part of this resolution:
// Phaser's own `setTexture(atlasKey, frameName)` disambiguates by frame name within one atlas
// key regardless of which physical page composes it — `page` only matters at compile/pack time.
describe('resolveAtlasKeyForPiece', () => {
  it('resolves a base piece to atlasKeys.base', () => {
    const atlasKeys = { base: 'rasta_layers_atlas', actions: new Map() }
    expect(resolveAtlasKeyForPiece(atlasKeys, 'base')).toBe('rasta_layers_atlas')
  })

  it('resolves a loaded action-pack piece through the per-key Map', () => {
    const atlasKeys = {
      base: 'rasta_layers_atlas',
      actions: new Map([['down_llorar', 'rasta_layers_actions_down_llorar_atlas']]),
    }
    expect(resolveAtlasKeyForPiece(atlasKeys, 'down_llorar')).toBe('rasta_layers_actions_down_llorar_atlas')
  })

  it('falls back to base when the piece\'s own pack is not yet loaded (defensive — should not happen once a pack-backed piece is actually rendered)', () => {
    const atlasKeys = { base: 'rasta_layers_atlas', actions: new Map() }
    expect(resolveAtlasKeyForPiece(atlasKeys, 'leftdown_punch_rec')).toBe('rasta_layers_atlas')
  })

  it('resolves the correct one of two DIFFERENT loaded packs', () => {
    const atlasKeys = {
      base: 'rasta_layers_atlas',
      actions: new Map([
        ['down_llorar', 'rasta_layers_actions_down_llorar_atlas'],
        ['leftdown_punch_rec', 'rasta_layers_actions_leftdown_punch_rec_atlas'],
      ]),
    }
    expect(resolveAtlasKeyForPiece(atlasKeys, 'leftdown_punch_rec')).toBe('rasta_layers_actions_leftdown_punch_rec_atlas')
    expect(resolveAtlasKeyForPiece(atlasKeys, 'down_llorar')).toBe('rasta_layers_actions_down_llorar_atlas')
  })
})
