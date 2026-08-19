import { describe, it, expect } from 'vitest'
import { checkPageBudget } from './pageBudget.cjs'

// design.md §5.4/§6: three page-budget gates, re-derived for the full roster and enforced by
// the compiler. Base pack fails above 2 pages; action pack warns at 5, fails above 8;
// accessory package warns at 2, fails above 3. Unit-tested here as pure threshold logic.
describe('checkPageBudget', () => {
  it('is silent (no warning) when page count is at or below the warn threshold', () => {
    expect(checkPageBudget(5, { warnAt: 5, failAbove: 8 })).toEqual({ warned: false, message: null })
  })

  it('warns (but does not throw) when page count exceeds warnAt but not failAbove', () => {
    const result = checkPageBudget(6, { warnAt: 5, failAbove: 8 })
    expect(result.warned).toBe(true)
    expect(result.message).toMatch(/6/)
  })

  it('throws when page count exceeds failAbove', () => {
    expect(() => checkPageBudget(9, { warnAt: 5, failAbove: 8 })).toThrow(/9/)
  })

  it('throws exactly above the boundary, not at it (failAbove is exclusive)', () => {
    expect(() => checkPageBudget(8, { warnAt: 5, failAbove: 8 })).not.toThrow()
    expect(() => checkPageBudget(9, { warnAt: 5, failAbove: 8 })).toThrow()
  })

  it('supports a gate with no warn threshold (base pack: fails above 2, no separate warn)', () => {
    expect(checkPageBudget(2, { failAbove: 2 })).toEqual({ warned: false, message: null })
    expect(() => checkPageBudget(3, { failAbove: 2 })).toThrow(/3/)
  })
})
