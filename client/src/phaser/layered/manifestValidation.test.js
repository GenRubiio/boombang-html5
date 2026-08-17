import { describe, it, expect } from 'vitest'
import { isKnownSlot, validateManifest, assertKnownSlot } from './manifestValidation.js'

const rastaManifest = {
  v: 1,
  character: 'rasta',
  ss: 2,
  slots: ['color1', 'color2', 'color3', 'color4', 'color5', 'color7', 'colorGuante'],
  defaults: {},
  bodyBounds: { w: 83, h: 110 },
  pieces: {},
  frames: {},
  sequences: {},
}

// PAL1: slot-set membership, never a color[1-9] pattern match.
describe('manifestValidation: slot-set membership (PAL1)', () => {
  it('accepts a non-numeric slot key declared by the manifest', () => {
    expect(isKnownSlot(rastaManifest, 'colorGuante')).toBe(true)
  })

  it('rejects a color[1-9]-shaped key the manifest does not declare, proving no pattern match', () => {
    // color6 matches the color[1-9] pattern but rasta's manifest does not declare it —
    // membership must be checked against slots[], never a regex.
    expect(isKnownSlot(rastaManifest, 'color6')).toBe(false)
  })

  it('assertKnownSlot throws a functional error for an unknown slot key', () => {
    expect(() => assertKnownSlot(rastaManifest, 'colorGuante_unknown')).toThrow()
  })
})

// PAL2: slot counts and key sets vary independently per character.
describe('manifestValidation: independent per-character slot counts (PAL2)', () => {
  it('a 7-slot character and a differently-sized character each use their own slot set', () => {
    const otherManifest = { ...rastaManifest, character: 'other', slots: ['tint1', 'tint2'] }
    expect(isKnownSlot(rastaManifest, 'color7')).toBe(true)
    expect(isKnownSlot(otherManifest, 'color7')).toBe(false)
    expect(isKnownSlot(otherManifest, 'tint1')).toBe(true)
  })
})

describe('manifestValidation: validateManifest', () => {
  it('accepts a well-formed manifest with ss:2', () => {
    expect(() => validateManifest(rastaManifest)).not.toThrow()
  })

  it('rejects a manifest missing a required field', () => {
    const { slots, ...missingSlots } = rastaManifest
    expect(() => validateManifest(missingSlots)).toThrow(/slots/i)
  })

  it('rejects a manifest whose ss is not 2', () => {
    expect(() => validateManifest({ ...rastaManifest, ss: 1 })).toThrow(/ss/i)
  })
})
