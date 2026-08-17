import { describe, it, expect } from 'vitest'
import { validateSlotUpdate, resolveGlovePalette } from './UserPaletteService.js'
import AvatarEnum from '../enums/AvatarEnum.js'

// PAL6/PAL7/PAL8: server-authoritative validation. Never trust the client's UI state
// (avatar-look-protocol PROTO1).
describe('UserPaletteService.validateSlotUpdate', () => {
  it('rejects an unknown slot key for the character (PAL1/PAL2)', () => {
    const result = validateSlotUpdate({
      avatarId: AvatarEnum.RASTA,
      slotKey: 'colorGuante_unknown',
      value: '#ff0000',
      uppercutLevel: 9,
    })
    expect(result.success).toBe(false)
    expect(result.code).toBe('UNKNOWN_SLOT')
  })

  it('accepts a free hex colour for a non-glove slot regardless of tier (PAL6)', () => {
    const result = validateSlotUpdate({
      avatarId: AvatarEnum.RASTA,
      slotKey: 'color3',
      value: '#123abc',
      uppercutLevel: 0,
    })
    expect(result.success).toBe(true)
    expect(result.resolvedValue).toBe('#123abc')
  })

  it('accepts an unlocked glove preset by name (PAL7)', () => {
    const result = validateSlotUpdate({
      avatarId: AvatarEnum.RASTA,
      slotKey: 'colorGuante',
      value: 'red',
      uppercutLevel: 0,
    })
    expect(result.success).toBe(true)
    expect(result.resolvedValue).toBe('#ee4724')
  })

  it('rejects a locked glove preset even if requested directly (PAL7)', () => {
    const result = validateSlotUpdate({
      avatarId: AvatarEnum.RASTA,
      slotKey: 'colorGuante',
      value: 'gold',
      uppercutLevel: 0, // tier 0 has not unlocked index 9 (gold)
    })
    expect(result.success).toBe(false)
    expect(result.code).toBe('LOCKED_PRESET')
  })

  it('rejects an arbitrary hex value for the glove slot (PAL8)', () => {
    const result = validateSlotUpdate({
      avatarId: AvatarEnum.RASTA,
      slotKey: 'colorGuante',
      value: '#ff00ff',
      uppercutLevel: 9,
    })
    expect(result.success).toBe(false)
    expect(result.code).toBe('INVALID_VALUE')
  })
})

// PAL9: first resolution with no saved value seeds from the user's current progression tier,
// then persists — never recomputed from progression tier again after an explicit choice.
describe('UserPaletteService.resolveGlovePalette', () => {
  it('seeds the glove slot from the current progression tier when nothing is saved', () => {
    const result = resolveGlovePalette({
      avatarId: AvatarEnum.RASTA,
      savedSlots: {},
      uppercutSelected: 4, // "blue"
    })
    expect(result.seeded).toBe(true)
    expect(result.slots.colorGuante).toBe('#2056f0')
  })

  it('does not reseed when an explicit choice is already saved', () => {
    const result = resolveGlovePalette({
      avatarId: AvatarEnum.RASTA,
      savedSlots: { colorGuante: '#ee4724' },
      uppercutSelected: 4,
    })
    expect(result.seeded).toBe(false)
    expect(result.slots.colorGuante).toBe('#ee4724')
  })
})
