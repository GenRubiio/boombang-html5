import { describe, it, expect } from 'vitest'
import DarkeningUtils from './DarkeningUtils.js'

// VITE_FORCE_DAYLIGHT (dev/validation-only affordance, added at the user's direct request
// during live validation — NOT part of the frozen avatar-color-accessory-system specs).
// resolveBrightness() is the pure decision point PublicScene.js's update() delegates to:
// forced daylight always yields full brightness regardless of game time; otherwise behaviour
// must be byte-for-byte identical to the existing calculateBrightness() output.
describe('DarkeningUtils.resolveBrightness', () => {
  it('returns full brightness (1.0) when forceDaylight is true, regardless of game time', () => {
    expect(DarkeningUtils.resolveBrightness('02:00', true)).toBe(1.0)
    expect(DarkeningUtils.resolveBrightness('22:00', true)).toBe(1.0)
  })

  it('delegates to calculateBrightness unchanged when forceDaylight is false', () => {
    expect(DarkeningUtils.resolveBrightness('02:00', false)).toBe(DarkeningUtils.calculateBrightness('02:00'))
    expect(DarkeningUtils.resolveBrightness('12:00', false)).toBe(DarkeningUtils.calculateBrightness('12:00'))
  })

  it('defaults to the existing calculateBrightness behaviour when forceDaylight is omitted', () => {
    expect(DarkeningUtils.resolveBrightness('02:00')).toBe(DarkeningUtils.calculateBrightness('02:00'))
  })
})

// applySceneDarkening's forceDaylight branch never touches the overlay when none exists yet,
// so this exercises real production code (not a Phaser scene stub) without needing a live
// Phaser.Scene — the same "extract pure decision, keep the I/O shell thin" pattern used
// elsewhere in this change (design.md §8).
describe('DarkeningUtils.applySceneDarkening (forceDaylight branch)', () => {
  it('skips overlay creation entirely and records full brightness when forceDaylight is true', () => {
    DarkeningUtils._overlay = null
    expect(() => DarkeningUtils.applySceneDarkening(null, '02:00', true)).not.toThrow()
    expect(DarkeningUtils._lastBrightness).toBe(1.0)
    expect(DarkeningUtils._overlay).toBeNull()
  })
})
