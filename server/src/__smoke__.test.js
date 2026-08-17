import { describe, it, expect } from 'vitest'

// Proves the vitest runner is wired up for the server surface. Vitest transforms test files
// as ESM even though server/ source modules stay CommonJS (design.md §8) — production
// modules under test are reached via `require()` from within these ESM test files.
describe('server test runner smoke test', () => {
  it('executes and asserts a real computed value', () => {
    expect(2 + 2).toBe(4)
  })
})
