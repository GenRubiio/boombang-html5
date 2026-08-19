import { describe, it, expect } from 'vitest'
import { resolveOverrideDestination } from './assetOverrides.cjs'

// design.md §16.2 (tasks.md slice 11 task 3): `asset-overrides/<char>/<kind>/<key>/
// _frames_<anim>.json` is a whole-file replacement, applied onto the corresponding staged
// `.assets-src/accessories/<char>/<key>/_frames_<anim>.json` AFTER unzip and BEFORE compile —
// surviving a later re-unzip, unlike editing the staged tree directly.
describe('resolveOverrideDestination', () => {
  it('maps an override path to the correct staged destination', () => {
    const dest = resolveOverrideDestination(
      'rasta/hat/minnieHat/_frames_down_idle.json',
      '/client/.assets-src/accessories'
    )
    expect(dest).toBe('/client/.assets-src/accessories/rasta/minnieHat/_frames_down_idle.json')
  })

  it('drops the kind segment (the staged tree has no kind segment, design.md §4)', () => {
    const dest = resolveOverrideDestination(
      'lilian/pet/pet10/_frames_leftdown_walk.json',
      '/client/.assets-src/accessories'
    )
    expect(dest).toBe('/client/.assets-src/accessories/lilian/pet10/_frames_leftdown_walk.json')
  })

  it('throws on a malformed override path with too few segments', () => {
    expect(() => resolveOverrideDestination('rasta/onlyTwo.json', '/x')).toThrow(/malformed/i)
  })
})
