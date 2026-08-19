import { describe, it, expect } from 'vitest'
import { parseActionKeyAssetPath, groupLayeredActionKeyLoaders } from './groupLayeredActionKeyLoaders.js'

// design.md §13.3 (tasks.md slice 15): per-key action packs replace the old per-character
// (single, whole-pack) action loaders — one atlas/webp/manifest triple per compiled action
// KEY, not per character. `down_llorar`/`leftdown_punch_rec`-shaped keys carry underscores, so
// parsing must not confuse a key segment with the `.actions.`/extension separators.
describe('parseActionKeyAssetPath', () => {
  it('parses an atlas path', () => {
    expect(parseActionKeyAssetPath('/src/assets/game/avatars/rasta/layers/rasta.actions.down_llorar.atlas.json')).toEqual({
      character: 'rasta',
      key: 'down_llorar',
      kind: 'atlas',
    })
  })

  it('parses a manifest path', () => {
    expect(parseActionKeyAssetPath('/src/assets/game/avatars/rasta/layers/rasta.actions.down_llorar.manifest.json')).toEqual({
      character: 'rasta',
      key: 'down_llorar',
      kind: 'manifest',
    })
  })

  it('parses a first-page webp path (no page suffix)', () => {
    expect(parseActionKeyAssetPath('/src/assets/game/avatars/rasta/layers/rasta.actions.leftdown_punch_rec.webp')).toEqual({
      character: 'rasta',
      key: 'leftdown_punch_rec',
      kind: 'webp',
    })
  })

  it('parses a second-page webp path, stripping the numeric page suffix from the key', () => {
    expect(parseActionKeyAssetPath('/src/assets/game/avatars/rasta/layers/rasta.actions.leftdown_punch_rec_1.webp')).toEqual({
      character: 'rasta',
      key: 'leftdown_punch_rec',
      kind: 'webp',
    })
  })

  it('throws on a malformed path', () => {
    expect(() => parseActionKeyAssetPath('/src/assets/game/avatars/rasta/layers/rasta.layers.manifest.json')).toThrow()
  })
})

describe('groupLayeredActionKeyLoaders', () => {
  it('groups atlas/manifest loaders by character then key, and webp pages in path order', () => {
    const globEntries = {
      '/src/assets/game/avatars/rasta/layers/rasta.actions.down_llorar.atlas.json': 'atlasLoader',
      '/src/assets/game/avatars/rasta/layers/rasta.actions.down_llorar.manifest.json': 'manifestLoader',
      '/src/assets/game/avatars/rasta/layers/rasta.actions.down_llorar.webp': 'webpLoader0',
      '/src/assets/game/avatars/rasta/layers/rasta.actions.down_llorar_1.webp': 'webpLoader1',
      '/src/assets/game/avatars/rasta/layers/rasta.actions.leftdown_punch_rec.atlas.json': 'otherAtlasLoader',
    }
    const grouped = groupLayeredActionKeyLoaders(globEntries)
    expect(grouped.rasta.down_llorar.atlas).toBe('atlasLoader')
    expect(grouped.rasta.down_llorar.manifest).toBe('manifestLoader')
    expect(grouped.rasta.down_llorar.webp).toEqual(['webpLoader0', 'webpLoader1'])
    expect(grouped.rasta.leftdown_punch_rec.atlas).toBe('otherAtlasLoader')
  })

  it('keeps two different characters\' same-named key distinct', () => {
    const globEntries = {
      '/src/assets/game/avatars/rasta/layers/rasta.actions.down_llorar.atlas.json': 'rastaLoader',
      '/src/assets/game/avatars/gata/layers/gata.actions.down_llorar.atlas.json': 'gataLoader',
    }
    const grouped = groupLayeredActionKeyLoaders(globEntries)
    expect(grouped.rasta.down_llorar.atlas).toBe('rastaLoader')
    expect(grouped.gata.down_llorar.atlas).toBe('gataLoader')
  })
})
