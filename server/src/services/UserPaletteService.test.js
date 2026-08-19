import { describe, it, expect } from 'vitest'
import { validateSlotUpdate, resolveGlovePalette, pickStableGloveIndex } from './UserPaletteService.js'
import AvatarEnum from '../enums/AvatarEnum.js'
import { getPresetByName } from '../enums/GlovePresetsEnum.js'

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

// Gameplay defect fix (2026-08-19): a bot/human never seen using the debug-only
// USER_CHANGE_PALETTE path always fell through to the manifest's raw default hex
// (rasta's colorGuante default is #ff0000, red) because the PAL9 seeding path below was never
// invoked from production code (dead code — see apply-progress.md's root-cause account).
// First resolution with no saved value now seeds a preset RANDOMLY among every preset unlocked
// at the user's progression tier (uppercutLevel), not merely the tier's own single index — the
// user's explicit request ("un color random entre los que tenga el conseguido") — and the pick
// is STABLE per user id (never re-rolled on a later resolution), then persists. Once an
// explicit choice exists, it is never recomputed again.
describe('UserPaletteService.pickStableGloveIndex', () => {
  it('always returns 0 when only index 0 is unlocked (maxIndex 0)', () => {
    expect(pickStableGloveIndex('bot-1', 0)).toBe(0)
    expect(pickStableGloveIndex('a-completely-different-seed', 0)).toBe(0)
  })

  it('is deterministic/stable: the same seed key always resolves to the same index', () => {
    const first = pickStableGloveIndex('bot-42', 9)
    const second = pickStableGloveIndex('bot-42', 9)
    expect(second).toBe(first)
  })

  it('never returns an index outside [0, maxIndex] for a range of seeds', () => {
    for (let i = 0; i < 50; i++) {
      const index = pickStableGloveIndex(`user-${i}`, 9)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThanOrEqual(9)
    }
  })

  it('actually varies across different seed keys (not a constant), proving it is not hardcoded', () => {
    const results = new Set()
    for (let i = 0; i < 50; i++) {
      results.add(pickStableGloveIndex(`user-${i}`, 9))
    }
    expect(results.size).toBeGreaterThan(1)
  })
})

describe('UserPaletteService.resolveGlovePalette', () => {
  it('seeds the glove slot with a preset unlocked at or below uppercutLevel when nothing is saved', () => {
    const result = resolveGlovePalette({
      avatarId: AvatarEnum.RASTA,
      savedSlots: {},
      uppercutLevel: 9, // every preset unlocked
      userId: 'bot-99',
    })
    expect(result.seeded).toBe(true)
    // Must be one of the ten real presets, not an arbitrary/default hex.
    const matched = Object.values({
      red: '#ee4724', pink: '#e93dc7', orange: '#f09b20', green: '#46f020', blue: '#2056f0',
      white: '#f5f5f7', purple: '#8c19c6', brown: '#a96a0a', black: '#464643', gold: '#fdd419',
    }).includes(result.slots.colorGuante)
    expect(matched).toBe(true)
  })

  it('respects the unlock ceiling: with uppercutLevel 0 only red (index 0) is possible, for any user id', () => {
    const resultA = resolveGlovePalette({
      avatarId: AvatarEnum.RASTA, savedSlots: {}, uppercutLevel: 0, userId: 'bot-1',
    })
    const resultB = resolveGlovePalette({
      avatarId: AvatarEnum.RASTA, savedSlots: {}, uppercutLevel: 0, userId: 'some-other-bot',
    })
    expect(resultA.slots.colorGuante).toBe(getPresetByName('red').hex)
    expect(resultB.slots.colorGuante).toBe(getPresetByName('red').hex)
  })

  it('produces more than one distinct glove colour across many bot ids at a high uppercutLevel (proves it is not always defaulting to red)', () => {
    const colours = new Set()
    for (let i = 0; i < 50; i++) {
      const result = resolveGlovePalette({
        avatarId: AvatarEnum.RASTA, savedSlots: {}, uppercutLevel: 9, userId: `bot-${i}`,
      })
      colours.add(result.slots.colorGuante)
    }
    expect(colours.size).toBeGreaterThan(1)
  })

  it('is stable per user: resolving the same (userId, uppercutLevel) twice yields the identical colour', () => {
    const params = { avatarId: AvatarEnum.RASTA, savedSlots: {}, uppercutLevel: 8, userId: 'bot-stable' }
    const first = resolveGlovePalette(params)
    const second = resolveGlovePalette(params)
    expect(second.slots.colorGuante).toBe(first.slots.colorGuante)
  })

  it('does not reseed when an explicit choice is already saved', () => {
    const result = resolveGlovePalette({
      avatarId: AvatarEnum.RASTA,
      savedSlots: { colorGuante: '#ee4724' },
      uppercutLevel: 4,
      userId: 'bot-1',
    })
    expect(result.seeded).toBe(false)
    expect(result.slots.colorGuante).toBe('#ee4724')
  })
})
