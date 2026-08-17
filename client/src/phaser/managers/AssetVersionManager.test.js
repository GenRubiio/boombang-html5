import { describe, it, expect, beforeEach, vi } from 'vitest'

// design.md §2: no jsdom is configured for this vitest project, so `localStorage` is provided
// here as a minimal in-memory mock — sufficient to exercise the pure branching logic without
// pulling in a browser DOM implementation.
function installLocalStorageMock() {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
    _store: store,
  }
  return globalThis.localStorage
}

describe('AssetVersionManager: artifact version dictionaries (design.md §2)', () => {
  let assetVersionManager
  let localStorageMock

  beforeEach(async () => {
    vi.resetModules()
    localStorageMock = installLocalStorageMock()
    ;({ default: assetVersionManager } = await import('./AssetVersionManager.js'))
  })

  it('getArtifactVersion returns the classBase_entryVersion shape for a known layered character', () => {
    expect(assetVersionManager.getArtifactVersion('layered', 'rasta')).toBe('1.0.0_1.0.0')
  })

  it('getArtifactVersion falls back to the class base version for an unknown key', () => {
    expect(assetVersionManager.getArtifactVersion('accessory', 'unknownHat')).toBe('1.0.0_1.0.0')
  })

  it('checkArtifactUpdates writes only boombang_look_asset_versions, never boombang_asset_versions', () => {
    assetVersionManager.checkArtifactUpdates()
    expect(localStorageMock.getItem('boombang_look_asset_versions')).not.toBeNull()
    expect(localStorageMock.getItem('boombang_asset_versions')).toBeNull()
  })

  it('clearArtifactVersionData removes only the artifact key, leaving boombang_asset_versions untouched', () => {
    localStorageMock.setItem('boombang_asset_versions', '{"base":"1.0.0"}')
    assetVersionManager.checkArtifactUpdates()
    assetVersionManager.clearArtifactVersionData()
    expect(localStorageMock.getItem('boombang_look_asset_versions')).toBeNull()
    expect(localStorageMock.getItem('boombang_asset_versions')).toBe('{"base":"1.0.0"}')
  })
})
