// design.md §13.7 (resolved by user decision 2026-08-18, tasks.md slice 20 task 1/3): a
// MEASUREMENT rule, not a key-name lookup table — any action key whose own real packed transfer
// exceeds the M3 worst-key gate budget gets ss:1; every key at or under budget stays ss:2.
import { describe, it, expect } from 'vitest'
import { selectSsForActionKey, planActionKeySsOverrides } from './selectActionKeySs.cjs'

describe('selectSsForActionKey (pure measurement rule)', () => {
  it('stays ss:2 when the packed bytes are under budget', () => {
    expect(selectSsForActionKey(400_000, 1_258_291)).toBe(2)
  })

  it('selects ss:1 when the packed bytes exceed budget', () => {
    expect(selectSsForActionKey(1_469_536, 1_258_291)).toBe(1)
  })

  it('stays ss:2 at the exact boundary (equal to budget is not "over budget")', () => {
    expect(selectSsForActionKey(1_258_291, 1_258_291)).toBe(2)
  })
})

describe('planActionKeySsOverrides (the two-pass wiring decision)', () => {
  it('a key whose ss:2 pack exceeds budget triggers a real ss:1 recompile call; a key under budget does not', () => {
    const measured = { down_llorar: 199_528, left_fall: 1_469_536 }
    const { overrideKeys, ssOverrides } = planActionKeySsOverrides(measured, 1_258_291)
    expect(overrideKeys).toEqual(['left_fall'])
    expect(ssOverrides).toEqual({ left_fall: 1 })
  })

  it('reports no overrides when every measured key is within budget', () => {
    const measured = { down_idle: 10_000, down_talk: 20_000 }
    const { overrideKeys, ssOverrides } = planActionKeySsOverrides(measured, 1_258_291)
    expect(overrideKeys).toEqual([])
    expect(ssOverrides).toEqual({})
  })
})
