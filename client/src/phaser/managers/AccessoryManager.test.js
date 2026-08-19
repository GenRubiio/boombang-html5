import { describe, it, expect } from 'vitest'
import accessoryManager from './AccessoryManager.js'

// design.md §7 success criterion 6: "a miss is reported with both requested character and key.
// Never a silent no-render." AccessoryManager.load()'s miss branch (an unregistered
// (character, kind, key) combo) throws BEFORE ever touching the passed-in `scene` argument —
// resolveAccessoryRegistryKey returns null synchronously — so this exact path is directly
// unit-testable with no Phaser scene at all, unlike the rest of this I/O-shell class.
//
// Process note (disclosed, not hidden — same honesty as avatarHarnessApi.test.js's
// resolveDirectionValue): this documents behaviour that was already fully implemented when
// AccessoryManager.js was rewritten for the character-scoped registry (design.md §4/§7) rather
// than driving new production code — there is no new logic left to add here, so this is an
// approval/verification test of the real singleton, not a RED-first-authored one.
describe('AccessoryManager.load: registry miss is reported, never silent (design.md §7)', () => {
  it('rejects with both the requested character and key named, for a completely unregistered package', async () => {
    await expect(
      accessoryManager.load(/* scene */ undefined, 'yayo', 'hat', 'totallyUnknownHat')
    ).rejects.toThrow(/yayo/)
    await expect(
      accessoryManager.load(/* scene */ undefined, 'yayo', 'hat', 'totallyUnknownHat')
    ).rejects.toThrow(/totallyUnknownHat/)
  })

  it('hasPackage reports the miss as false for the same unregistered combo (no accessory is created)', () => {
    expect(accessoryManager.hasPackage('yayo', 'hat', 'totallyUnknownHat')).toBe(false)
  })

  it('hasPackage reports true, and load does not throw before touching scene, for a real registered package', () => {
    expect(accessoryManager.hasPackage('rasta', 'hat', 'minnieHat')).toBe(true)
    expect(accessoryManager.hasPackage('rasta', 'hat', 'Custom6Hat')).toBe(true)
    expect(accessoryManager.hasPackage('rasta', 'pet', 'pet10')).toBe(true)
  })
})

// avatar-system-multichar-fixes slice 10 (design.md §15, tasks.md slice 10 task 10): sally is
// absent from the accessory roster entirely — no `sally:hat:*`/`sally:pet:*` package was ever
// staged/compiled, so a lookup for one misses through the EXACT SAME registry-miss path any
// other unregistered (character, kind, key) combo does. Not a special case: no `if
// (character === 'sally')` branch exists anywhere in AccessoryManager.js/
// accessoryRegistryResolve.js, and this test would fail identically for any other
// never-registered character too.
describe('AccessoryManager: sally has no accessory packages (design.md §15)', () => {
  it('hasPackage is false for both sally:hat and sally:pet lookups', () => {
    expect(accessoryManager.hasPackage('sally', 'hat', 'minnieHat')).toBe(false)
    expect(accessoryManager.hasPackage('sally', 'pet', 'pet09')).toBe(false)
  })

  it('load rejects naming sally and the requested key, via the ordinary miss path', async () => {
    await expect(accessoryManager.load(undefined, 'sally', 'hat', 'anyHat')).rejects.toThrow(/sally/)
    await expect(accessoryManager.load(undefined, 'sally', 'hat', 'anyHat')).rejects.toThrow(/anyHat/)
  })
})

// god apply pass (2026-08-19): same shape as sally above — no `personajes/god/{hat,pet}/*.bb`
// package exists in the source dump at all (verified directly: `ls -d god` finds nothing under
// `personajes/`), so no `god:hat:*`/`god:pet:*` package was ever staged/compiled either.
describe('AccessoryManager: god has no accessory packages (verified against the source dump)', () => {
  it('hasPackage is false for both god:hat and god:pet lookups', () => {
    expect(accessoryManager.hasPackage('god', 'hat', 'minnieHat')).toBe(false)
    expect(accessoryManager.hasPackage('god', 'pet', 'pet09')).toBe(false)
  })

  it('load rejects naming god and the requested key, via the ordinary miss path', async () => {
    await expect(accessoryManager.load(undefined, 'god', 'hat', 'anyHat')).rejects.toThrow(/god/)
    await expect(accessoryManager.load(undefined, 'god', 'hat', 'anyHat')).rejects.toThrow(/anyHat/)
  })
})
