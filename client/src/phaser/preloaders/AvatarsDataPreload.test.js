import { describe, it, expect, beforeEach } from 'vitest'
import AvatarEnum from '@/enums/AvatarEnum'
import AvatarsDataPreload from './AvatarsDataPreload.js'

// tasks.md slice 22 task 4: window.avatars_config[18] (AvatarEnum.SALLY) must resolve to a
// well-formed entry, not undefined, once her deferred asset compile's generated config.json
// shim is wired here. No live Phaser scene involved — `AvatarsDataPreload.main()` only reads
// static JSON imports and assigns them to `window.avatars_config`, so this is directly
// unit-testable in the node/no-DOM vitest environment (a plain object stands in for `window`).
//
// Process note (same class as `avatarHarnessApi.test.js`'s `resolveDirectionValue` precedent):
// written alongside the `AvatarsDataPreload.js` wiring rather than strictly before it, since the
// wiring itself is a one-line static-import addition with no branching logic to design via a
// failing test first.
describe('AvatarsDataPreload (sally wiring)', () => {
  beforeEach(() => {
    global.window = {}
  })

  it('window.avatars_config[SALLY] resolves to a well-formed entry, not undefined', () => {
    AvatarsDataPreload.main()
    const sallyEntry = window.avatars_config[AvatarEnum.SALLY]
    expect(sallyEntry).toBeDefined()
    expect(sallyEntry.down_idle).toBeDefined()
    expect(sallyEntry.down_idle.atlasKey).toBeNull()
  })

  it('every other roster character is still present (this wiring did not displace an existing entry)', () => {
    AvatarsDataPreload.main()
    expect(window.avatars_config[AvatarEnum.RASTA]).toBeDefined()
    expect(window.avatars_config[AvatarEnum.SKELETON]).toBeDefined()
    // 18 at the time this test was written (rasta..sally); god's own apply pass (2026-08-19)
    // added a 19th registered character, the same one-line-per-character wiring sally's own
    // slice added — this count is the roster's real total, re-verified each time it grows.
    expect(Object.keys(window.avatars_config)).toHaveLength(19)
  })

  it('window.avatars_config[GOD] resolves to a well-formed entry, not undefined', () => {
    AvatarsDataPreload.main()
    const godEntry = window.avatars_config[AvatarEnum.GOD]
    expect(godEntry).toBeDefined()
    expect(godEntry.down_idle).toBeDefined()
    expect(godEntry.down_idle.atlasKey).toBeNull()
  })
})
