import { describe, it, expect } from 'vitest'
import {
  resolveAccessoryRegistryKey,
  resolveAccessoryAtlasKey,
  checkManifestCharMismatch,
  listAccessoryKeysForCharacter,
} from './accessoryRegistryResolve.js'

// design.md §4/§7: package identity in the source data IS `(char, kind, key)` (fact F) — the
// registry adopts it. Resolution order: exact `${char}:${kind}:${key}` -> character-independent
// `*:${kind}:${key}` -> miss.
const PACKAGES = {
  'rasta:hat:minnieHat': {},
  'rasta:hat:Custom6Hat': {},
  'lilian:hat:Custom6Hat': {},
  '*:aura:auraElectrica': {},
}

describe('resolveAccessoryRegistryKey', () => {
  it('resolves the exact per-character package when one exists', () => {
    expect(resolveAccessoryRegistryKey(PACKAGES, 'rasta', 'hat', 'minnieHat')).toBe('rasta:hat:minnieHat')
  })

  it('resolves the SAME key to a DIFFERENT package per character (Custom6Hat, rasta vs lilian)', () => {
    expect(resolveAccessoryRegistryKey(PACKAGES, 'rasta', 'hat', 'Custom6Hat')).toBe('rasta:hat:Custom6Hat')
    expect(resolveAccessoryRegistryKey(PACKAGES, 'lilian', 'hat', 'Custom6Hat')).toBe('lilian:hat:Custom6Hat')
  })

  it('falls back to the character-independent "*" tier for a package with no per-character entry', () => {
    expect(resolveAccessoryRegistryKey(PACKAGES, 'rasta', 'aura', 'auraElectrica')).toBe('*:aura:auraElectrica')
    expect(resolveAccessoryRegistryKey(PACKAGES, 'yayo', 'aura', 'auraElectrica')).toBe('*:aura:auraElectrica')
  })

  it('misses (returns null) when neither an exact nor a wildcard package exists', () => {
    expect(resolveAccessoryRegistryKey(PACKAGES, 'yayo', 'hat', 'Custom6Hat')).toBeNull()
    expect(resolveAccessoryRegistryKey(PACKAGES, 'rasta', 'hat', 'unknownHat')).toBeNull()
  })
})

describe('resolveAccessoryAtlasKey', () => {
  it('includes the resolved character for a per-character package', () => {
    expect(resolveAccessoryAtlasKey('rasta:hat:Custom6Hat', 'hat', 'Custom6Hat')).toBe('acc_rasta_hat_Custom6Hat_atlas')
    expect(resolveAccessoryAtlasKey('lilian:hat:Custom6Hat', 'hat', 'Custom6Hat')).toBe('acc_lilian_hat_Custom6Hat_atlas')
  })

  it('omits the character segment for the "*" (character-independent) tier', () => {
    expect(resolveAccessoryAtlasKey('*:aura:auraElectrica', 'aura', 'auraElectrica')).toBe('acc_aura_auraElectrica_atlas')
  })
})

describe('checkManifestCharMismatch', () => {
  it('reports no mismatch when the manifest char matches the requested character', () => {
    expect(checkManifestCharMismatch('rasta:hat:Custom6Hat', 'rasta', 'rasta')).toBeNull()
  })

  it('reports a mismatch, naming both the manifest char and the requested character', () => {
    const message = checkManifestCharMismatch('rasta:hat:Custom6Hat', 'lilian', 'rasta')
    expect(message).toMatch(/lilian/)
    expect(message).toMatch(/rasta/)
  })

  it('never reports a mismatch for the "*" (character-independent) tier, regardless of manifest.char', () => {
    expect(checkManifestCharMismatch('*:aura:auraElectrica', undefined, 'rasta')).toBeNull()
    expect(checkManifestCharMismatch('*:aura:auraElectrica', 'anything', 'rasta')).toBeNull()
  })
})

// avatar-system-multichar-fixes (coordinator addendum): the debug panel's accessory
// dropdowns must list the full COMPILED catalogue for the currently-selected character, not
// the account's owned subset (the previous `GET_USER_ACCESSORIES`-sourced list) — sourced from
// this exact registry, the same one AccessoryManager.hasPackage/load resolve against.
describe('listAccessoryKeysForCharacter', () => {
  it('lists per-character keys for the requested character and kind only', () => {
    expect(listAccessoryKeysForCharacter(PACKAGES, 'rasta', 'hat')).toEqual(['Custom6Hat', 'minnieHat'])
  })

  it('gives a DIFFERENT list for a different character sharing the same kind (no cross-character leak)', () => {
    expect(listAccessoryKeysForCharacter(PACKAGES, 'lilian', 'hat')).toEqual(['Custom6Hat'])
  })

  it('includes the character-independent "*" tier alongside any per-character entries', () => {
    expect(listAccessoryKeysForCharacter(PACKAGES, 'rasta', 'aura')).toEqual(['auraElectrica'])
    expect(listAccessoryKeysForCharacter(PACKAGES, 'yayo', 'aura')).toEqual(['auraElectrica'])
  })

  it('returns an empty array for a character/kind combination with nothing compiled', () => {
    expect(listAccessoryKeysForCharacter(PACKAGES, 'yayo', 'hat')).toEqual([])
    expect(listAccessoryKeysForCharacter(PACKAGES, 'rasta', 'pet')).toEqual([])
  })
})
