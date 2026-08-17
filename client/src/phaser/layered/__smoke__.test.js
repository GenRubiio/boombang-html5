import { describe, it, expect } from 'vitest'

// Proves the vitest runner is wired up for the client surface (success criterion 8:
// "npm test exists and passes"). Real logic tests for layered/* modules land in Slice 2+.
describe('client test runner smoke test', () => {
  it('executes and asserts a real computed value', () => {
    expect(1 + 1).toBe(2)
  })
})
