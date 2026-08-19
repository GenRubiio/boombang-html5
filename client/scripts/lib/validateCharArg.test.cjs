import { describe, it, expect } from 'vitest'
import { validateCharArg } from './validateCharArg.cjs'

// design.md §4/§7: compile-accessory.cjs gains a REQUIRED --char CLI argument and hard-fails
// when the staged package's own meta.char is missing or disagrees with it — the compile-time
// half of "the registry MUST NOT collapse two characters' distinct anchor data onto a single
// (kind, key) entry".
describe('validateCharArg', () => {
  it('passes silently when --char matches meta.char', () => {
    expect(() => validateCharArg('rasta', 'rasta')).not.toThrow()
  })

  it('hard-fails when meta.char is missing entirely', () => {
    expect(() => validateCharArg('rasta', undefined)).toThrow(/meta\.char/i)
  })

  it('hard-fails when meta.char disagrees with --char', () => {
    expect(() => validateCharArg('rasta', 'lilian')).toThrow(/rasta/)
    expect(() => validateCharArg('rasta', 'lilian')).toThrow(/lilian/)
  })

  it('hard-fails when --char itself is missing (required argument)', () => {
    expect(() => validateCharArg(null, 'rasta')).toThrow(/--char/)
    expect(() => validateCharArg(undefined, 'rasta')).toThrow(/--char/)
  })
})
