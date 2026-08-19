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

  // avatar-system-multichar-fixes tasks.md slice 24: brujita/cholo/empollon/gata's body-only
  // compile needs the same version-dict bump rasta/sally already have. `getArtifactVersion`
  // alone cannot distinguish "entry present" from "fell back to dict.base" here, since both
  // resolve to the identical '1.0.0' string today — asserting the KEY'S OWN PRESENCE in
  // `layeredVersions.characters` (not merely the derived string) is what gives this real teeth:
  // it fails if the dict bump is missing, and would still fail even if a future entry version
  // diverged from base.
  it('registers each slice-24 body-batch character as its own entry in layeredVersions.characters', () => {
    for (const character of ['brujita', 'cholo', 'empollon', 'gata']) {
      expect(assetVersionManager.layeredVersions.characters).toHaveProperty(character)
    }
  })

  // tasks.md slice 25 — same shape, second body batch.
  it('registers each slice-25 body-batch character as its own entry in layeredVersions.characters', () => {
    for (const character of ['india', 'lilian', 'marsu', 'modern']) {
      expect(assetVersionManager.layeredVersions.characters).toHaveProperty(character)
    }
  })

  // tasks.md slice 26 — same shape, third body batch.
  it('registers each slice-26 body-batch character as its own entry in layeredVersions.characters', () => {
    for (const character of ['ninja', 'werewolf', 'yayo', 'boomer']) {
      expect(assetVersionManager.layeredVersions.characters).toHaveProperty(character)
    }
  })

  // tasks.md slice 27 — same shape, fourth (final) body batch.
  it('registers each slice-27 body-batch character as its own entry in layeredVersions.characters', () => {
    for (const character of ['skeleton', 'zombie']) {
      expect(assetVersionManager.layeredVersions.characters).toHaveProperty(character)
    }
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

// design.md §7: `accessoryVersions.accessories` is rekeyed to `char:kind:key` (fixing the
// existing `minnieHat` (this dict, always correct) / `hat_minnie` (AccessoryManager's own
// arbitrary directory name, now also corrected to `minnieHat`) mismatch) and gains the two
// packages staged+compiled in PR4 (`Custom6Hat`, `pet10`).
describe('AssetVersionManager: accessoryVersions is keyed char:kind:key (design.md §7)', () => {
  let assetVersionManager

  beforeEach(async () => {
    vi.resetModules()
    installLocalStorageMock()
    ;({ default: assetVersionManager } = await import('./AssetVersionManager.js'))
  })

  it('keys every rasta accessory package by its full char:kind:key registry key', () => {
    expect(assetVersionManager.accessoryVersions.accessories).toHaveProperty('rasta:hat:minnieHat')
    expect(assetVersionManager.accessoryVersions.accessories).toHaveProperty('rasta:pet:pet09')
    expect(assetVersionManager.accessoryVersions.accessories).toHaveProperty('rasta:hat:Custom6Hat')
    expect(assetVersionManager.accessoryVersions.accessories).toHaveProperty('rasta:pet:pet10')
  })

  it('no longer keys by the bare display-style name that mismatched AccessoryManager', () => {
    expect(assetVersionManager.accessoryVersions.accessories).not.toHaveProperty('minnieHat')
  })

  it('getArtifactVersion resolves a real rasta accessory package by its char:kind:key form', () => {
    expect(assetVersionManager.getArtifactVersion('accessory', 'rasta:hat:minnieHat')).toBe('1.0.0_1.0.0')
  })
})
