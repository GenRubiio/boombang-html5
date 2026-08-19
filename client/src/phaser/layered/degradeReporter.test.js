import { describe, it, expect, beforeEach, vi } from 'vitest'
import { report } from './degradeReporter.js'

// design.md §9: makes a degrade assertable from Playwright (success criterion 3) — a Map keyed
// by the (avatarId, requestedKey, resolvedKey, reason) tuple, warned once per tuple, counted
// after that, exposed unconditionally on globalThis.window.__layeredDegrades so it cannot spam console or
// leak memory proportional to call frequency (bounded by distinct tuples, not calls).
describe('degradeReporter.report', () => {
  beforeEach(() => {
    // Node test environment (vitest.config.js) has no real `window` — provide a bare object so
    // report()'s `globalThis.window.__layeredDegrades` exposure has somewhere to land, matching what a
    // real browser/Playwright harness provides. Fresh object per test so the Map is recreated.
    globalThis.window = {}
  })

  it('warns on the first occurrence of a (avatarId, requestedKey, resolvedKey, reason) tuple', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    report({ avatarId: 12, requestedKey: 'llorar', resolvedKey: 'down_idle', reason: 'down-idle' })
    expect(warnSpy).toHaveBeenCalledTimes(1)
    warnSpy.mockRestore()
  })

  it('does not warn again for a repeat of the same tuple, only counts it', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const entry = { avatarId: 12, requestedKey: 'llorar', resolvedKey: 'down_idle', reason: 'down-idle' }
    report(entry)
    report(entry)
    report(entry)
    expect(warnSpy).toHaveBeenCalledTimes(1)
    const stored = [...globalThis.window.__layeredDegrades.values()].find(
      (v) => v.requestedKey === 'llorar' && v.avatarId === 12
    )
    expect(stored.count).toBe(3)
    warnSpy.mockRestore()
  })

  it('warns again for a DIFFERENT tuple (different reason) even for the same avatar/key pair', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    report({ avatarId: 12, requestedKey: 'llorar', resolvedKey: 'down_idle', reason: 'down-idle' })
    report({ avatarId: 12, requestedKey: 'llorar', resolvedKey: 'down_idle', reason: 'pack-loading' })
    expect(warnSpy).toHaveBeenCalledTimes(2)
    warnSpy.mockRestore()
  })

  it('exposes the accumulated map on globalThis.window.__layeredDegrades unconditionally', () => {
    report({ avatarId: 1, requestedKey: 'coco', resolvedKey: 'down_idle', reason: 'down-idle' })
    expect(globalThis.window.__layeredDegrades).toBeInstanceOf(Map)
    expect(globalThis.window.__layeredDegrades.size).toBe(1)
  })
})
