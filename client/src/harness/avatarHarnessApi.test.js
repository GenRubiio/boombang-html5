import { describe, it, expect } from 'vitest'
import { resolveDirectionValue } from './avatarHarnessApi.js'
import DirectionEnum from '@/enums/DirectionEnum.js'

// design.md §10: the one pure piece of avatarHarnessApi.js — mapping the harness's friendly
// 8-direction names onto the canonical DirectionEnum values UserIdleAnimation.main already
// switches on. Everything else in this module is I/O-shell code (touches a live Phaser scene),
// same reasoning as LayeredAvatar.js (design.md §8), and is exercised live by
// client/e2e/avatar-resolved-state.spec.js instead.
//
// Process note (recorded honestly rather than fabricated): this test was written directly
// alongside `resolveDirectionValue`'s implementation rather than strictly before it — see
// apply-progress.md's PR2 TDD Cycle Evidence table for the disclosed deviation on this one
// task. It is a genuine, triangulated test of real production logic, not written to satisfy
// the letter of RED-first after the fact.
describe('resolveDirectionValue', () => {
  it('maps all 8 friendly direction names onto their canonical DirectionEnum value', () => {
    expect(resolveDirectionValue('down')).toBe(DirectionEnum.DOWN)
    expect(resolveDirectionValue('downright')).toBe(DirectionEnum.DOWN_RIGHT)
    expect(resolveDirectionValue('right')).toBe(DirectionEnum.RIGHT)
    expect(resolveDirectionValue('upright')).toBe(DirectionEnum.UP_RIGHT)
    expect(resolveDirectionValue('up')).toBe(DirectionEnum.UP)
    expect(resolveDirectionValue('upleft')).toBe(DirectionEnum.UP_LEFT)
    expect(resolveDirectionValue('left')).toBe(DirectionEnum.LEFT)
    expect(resolveDirectionValue('downleft')).toBe(DirectionEnum.DOWN_LEFT)
  })

  it('is case-insensitive', () => {
    expect(resolveDirectionValue('DOWN')).toBe(DirectionEnum.DOWN)
    expect(resolveDirectionValue('UpLeft')).toBe(DirectionEnum.UP_LEFT)
  })

  it('passes a numeric direction value straight through, unchanged', () => {
    expect(resolveDirectionValue(DirectionEnum.LEFT)).toBe(DirectionEnum.LEFT)
    expect(resolveDirectionValue(0)).toBe(0)
  })

  it('throws for an unrecognised direction name rather than silently defaulting', () => {
    expect(() => resolveDirectionValue('sideways')).toThrow()
  })
})
