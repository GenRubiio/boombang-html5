import { describe, it, expect } from 'vitest'
import { getLayeredManifest, isLayeredCharacter } from './layeredCharacterManifests.js'
import AvatarEnum from '../enums/AvatarEnum.js'

// Gameplay defect fix (2026-08-19): this table is the server's own hand-maintained mirror of
// each character's COMPILED client manifest (client/src/assets/game/avatars/<char>/layers/
// <char>.layers.manifest.json) — the server cannot read that file directly at runtime (the
// server container only mounts server/, not client/, per docker-compose.yml), so this table
// must be kept in sync by hand, per its own file-level comment. Until this fix it held ONLY
// `rasta` (Slice 1 of the archived avatar-color-accessory-system), even though the
// avatar-system-multichar-fixes roster migration (slices 20-32) has since compiled 15 more
// layered characters — so `UserPaletteService.validateSlotUpdate`/`resolveGlovePalette`
// silently treated every one of them as having NO layered manifest at all, which is the
// dominant reason 5 of 6 currently-running bots (avatarId BOOMER/GATA/BRUJITA, not RASTA) never
// got their glove seeded and rendered the manifest's raw default hex instead. Real slot lists
// below are copied verbatim from each character's real compiled `slots` array (verified via a
// direct read of the compiled JSON, 2026-08-19).
describe('layeredCharacterManifests roster completeness', () => {
  it('covers boomer (multi-slot character) with colorGuante as its glove slot', () => {
    const manifest = getLayeredManifest(AvatarEnum.BOOMER)
    expect(manifest).not.toBeNull()
    expect(manifest.gloveSlot).toBe('colorGuante')
    expect(manifest.slots).toEqual(
      expect.arrayContaining(['color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'color7', 'color8', 'color9', 'colorGuante'])
    )
  })

  it('covers cholo (a small-slot character) with colorGuante as its glove slot', () => {
    const manifest = getLayeredManifest(AvatarEnum.CHOLO)
    expect(manifest).not.toBeNull()
    expect(manifest.gloveSlot).toBe('colorGuante')
    expect(manifest.slots).toEqual(expect.arrayContaining(['color1', 'color2', 'color3', 'color4', 'colorGuante']))
  })

  it('covers sally, whose only real slot is colorGuante (her colormeta.defaults is empty)', () => {
    const manifest = getLayeredManifest(AvatarEnum.SALLY)
    expect(manifest).not.toBeNull()
    expect(manifest.gloveSlot).toBe('colorGuante')
    expect(manifest.slots).toEqual(['colorGuante'])
  })

  it('covers werewolf (the minimal 2-real-colour-slot roster shape)', () => {
    const manifest = getLayeredManifest(AvatarEnum.WEREWOLF)
    expect(manifest).not.toBeNull()
    expect(manifest.gloveSlot).toBe('colorGuante')
    expect(manifest.slots).toEqual(expect.arrayContaining(['color1', 'color2', 'colorGuante']))
  })

  it('every AvatarEnum id that IS covered reports isLayeredCharacter(true) and a real gloveSlot', () => {
    const coveredIds = [
      AvatarEnum.BOOMER, AvatarEnum.BRUJITA, AvatarEnum.CHOLO, AvatarEnum.EMPOLLON,
      AvatarEnum.GATA, AvatarEnum.INDIA, AvatarEnum.LILIAN, AvatarEnum.MARSU,
      AvatarEnum.MODERN, AvatarEnum.NINJA, AvatarEnum.RASTA, AvatarEnum.SALLY,
      AvatarEnum.SKELETON, AvatarEnum.WEREWOLF, AvatarEnum.YAYO, AvatarEnum.ZOMBIE,
    ]
    for (const avatarId of coveredIds) {
      expect(isLayeredCharacter(avatarId)).toBe(true)
      expect(getLayeredManifest(avatarId).gloveSlot).toBe('colorGuante')
    }
  })

  it('still returns null for a character with no compiled layered manifest at all (ghost/wraith, explicitly out of scope)', () => {
    expect(getLayeredManifest(AvatarEnum.GHOST)).toBeNull()
    expect(getLayeredManifest(AvatarEnum.WRAITH)).toBeNull()
    expect(isLayeredCharacter(AvatarEnum.GHOST)).toBe(false)
  })
})
