import { describe, it, expect } from 'vitest'
import {
  layeredManifestKey,
  layeredAtlasKey,
  accessoryAtlasKey,
  accessoryManifestKey,
  auraSheetKey,
  auraManifestKey,
} from './lookCacheKeys.js'

// design.md §2 table: one key-derivation function per new artifact class.
describe('lookCacheKeys: key derivation per artifact class', () => {
  it('derives the layered manifest key', () => {
    expect(layeredManifestKey('rasta', '1.0.0_1.0.0')).toBe('lay.rasta_manifest_v1.0.0_1.0.0')
  })

  it('derives the layered piece atlas key with page/name/sig suffixes', () => {
    expect(layeredAtlasKey('rasta', '1.0.0_1.0.0')).toBe('lay.rasta_atlas_v1.0.0_1.0.0')
    expect(layeredAtlasKey('rasta', '1.0.0_1.0.0', { page: 1 })).toBe(
      'lay.rasta_atlas_v1.0.0_1.0.0_p1'
    )
    expect(layeredAtlasKey('rasta', '1.0.0_1.0.0', { name: 'p9' })).toBe(
      'lay.rasta_atlas_v1.0.0_1.0.0::p9'
    )
    expect(layeredAtlasKey('rasta', '1.0.0_1.0.0', { sig: 'abc123' })).toBe(
      'lay.rasta_atlas_v1.0.0_1.0.0#abc123'
    )
  })

  it('derives accessory package keys', () => {
    expect(accessoryAtlasKey('hat', 'minnieHat', '1.0.0_1.0.0')).toBe(
      'acc.hat.minnieHat_atlas_v1.0.0_1.0.0'
    )
    expect(accessoryManifestKey('pet', 'pet09', '1.0.0_1.0.0')).toBe(
      'acc.pet.pet09_manifest_v1.0.0_1.0.0'
    )
  })

  it('derives aura sheet keys', () => {
    expect(auraSheetKey('aura01', '1.0.0_1.0.0')).toBe('aur.aura01_sheet_v1.0.0_1.0.0')
    expect(auraManifestKey('aura01', '1.0.0_1.0.0')).toBe('aur.aura01_manifest_v1.0.0_1.0.0')
  })
})

// design.md §2 "non-interference proof": every key today's code writes starts with one of the
// 18 AvatarManager.getAvatarName() return values followed by `_atlas` or `_spreadsheet`. None
// starts with lay./acc./aur. and `.` occurs in no existing key. AvatarManager.js cannot be
// imported here (it statically imports asset files through the `@` alias, which this
// project's isolated vitest.config.js does not resolve — see design.md §8 "no jsdom, no
// Phaser instantiation"), so the 18 names are duplicated from
// AvatarManager.js:699-718/AddUserController.js:517-536 as a literal, documented fixture.
const LEGACY_AVATAR_NAMES = [
  'boomer',
  'brujita',
  'cholo',
  'empollon',
  'gata',
  'ghost',
  'india',
  'lilian',
  'marsu',
  'modern',
  'ninja',
  'rasta',
  'skeleton',
  'werewolf',
  'wraith',
  'yayo',
  'zombie',
  'unknown',
]

describe('lookCacheKeys: collision proof against legacy avatar cache keys', () => {
  it('no generated key ever matches or is prefixed like a legacy _atlas/_spreadsheet key', () => {
    const generated = [
      layeredManifestKey('rasta', 'v1'),
      layeredAtlasKey('rasta', 'v1'),
      layeredAtlasKey('rasta', 'v1', { page: 1 }),
      accessoryAtlasKey('hat', 'minnieHat', 'v1'),
      accessoryManifestKey('pet', 'pet09', 'v1'),
      auraSheetKey('aura01', 'v1'),
      auraManifestKey('aura01', 'v1'),
    ]

    LEGACY_AVATAR_NAMES.forEach((name) => {
      const legacyAtlasKey = `${name}_atlas`;
      const legacySpreadsheetKey = `${name}_spreadsheet`;

      generated.forEach((key) => {
        expect(key).not.toBe(legacyAtlasKey)
        expect(key).not.toBe(legacySpreadsheetKey)
        expect(key.startsWith(legacyAtlasKey)).toBe(false)
        expect(key.startsWith(legacySpreadsheetKey)).toBe(false)
        expect(legacyAtlasKey.startsWith(key)).toBe(false)
        expect(legacySpreadsheetKey.startsWith(key)).toBe(false)
      })
    })

    // Every generated key carries a class-prefix `.` that no legacy key can contain, and no
    // legacy key starts with lay./acc./aur. — both directions of the collision proof.
    generated.forEach((key) => {
      expect(key).toMatch(/^(lay|acc|aur)\./)
    })
    LEGACY_AVATAR_NAMES.forEach((name) => {
      expect(`${name}_atlas`.includes('.')).toBe(false)
      expect(`${name}_spreadsheet`.includes('.')).toBe(false)
    })
  })
})
