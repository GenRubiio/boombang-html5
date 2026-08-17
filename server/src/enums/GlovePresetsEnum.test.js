import { describe, it, expect } from 'vitest'
import { GLOVE_PRESETS, getPresetByIndex, getPresetByName, isValidPresetName } from './GlovePresetsEnum.js'

// PAL7/PAL8: the ten existing named glove colours keep their identity, mapped from
// UppercutsEnum index → {name, hex}, reusing TintManager.COLOR_HEX (client/src/phaser/
// managers/TintManager.js:9-14) so both systems agree on hex values by construction.
describe('GlovePresetsEnum', () => {
  it('declares exactly ten presets in UppercutsEnum order', () => {
    expect(GLOVE_PRESETS).toHaveLength(10)
    expect(GLOVE_PRESETS[0].name).toBe('red')
    expect(GLOVE_PRESETS[9].name).toBe('gold')
  })

  it('getPresetByIndex returns the preset at a given UppercutsEnum index', () => {
    expect(getPresetByIndex(0)).toEqual({ name: 'red', hex: '#ee4724', index: 0 })
    expect(getPresetByIndex(9)).toEqual({ name: 'gold', hex: '#fdd419', index: 9 })
  })

  it('getPresetByIndex returns undefined for an out-of-range index', () => {
    expect(getPresetByIndex(99)).toBeUndefined()
  })

  it('getPresetByName resolves a preset case-insensitively by its name', () => {
    expect(getPresetByName('gold')).toEqual({ name: 'gold', hex: '#fdd419', index: 9 })
    expect(getPresetByName('GOLD')).toEqual({ name: 'gold', hex: '#fdd419', index: 9 })
  })

  it('isValidPresetName rejects a name that is not one of the ten presets', () => {
    expect(isValidPresetName('turquoise')).toBe(false)
    expect(isValidPresetName('red')).toBe(true)
  })
})
