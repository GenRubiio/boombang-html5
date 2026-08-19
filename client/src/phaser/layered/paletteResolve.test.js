import { describe, it, expect } from 'vitest'
import { resolveLabel, resolveDefault, resolvePalette, resolveTintHex } from './paletteResolve.js'

// Real rasta manifest shape (client/src/assets/game/avatars/rasta/layers/*.manifest.json,
// Slice 1): color4 has a declared default but no declared label — the exact PAL3 scenario.
const manifest = {
  defaults: {
    color1: 'b88a5c',
    color4: '0099cc',
  },
  labels: {
    color1: 'piel',
  },
  slots: ['color1', 'color4'],
}

// PAL3: defaults and labels are independent, optional per-slot metadata; label falls back to
// the raw slot key.
describe('paletteResolve: defaults and labels are independent (PAL3)', () => {
  it('a slot with a default but no label falls back to displaying its raw key', () => {
    expect(resolveDefault(manifest, 'color4')).toBe('0099cc')
    expect(resolveLabel(manifest, 'color4')).toBe('color4')
  })

  it('a labelled slot displays its declared label', () => {
    expect(resolveLabel(manifest, 'color1')).toBe('piel')
  })
})

// PAL5: a missing palette falls back to manifest defaults, slot by slot.
describe('paletteResolve: resolvePalette (PAL5)', () => {
  it('resolves every slot to its manifest default when no saved palette exists', () => {
    expect(resolvePalette(manifest, null)).toEqual({ color1: 'b88a5c', color4: '0099cc' })
  })

  it('prefers a saved value over the manifest default for a given slot', () => {
    expect(resolvePalette(manifest, { color1: 'ff0000' })).toEqual({
      color1: 'ff0000',
      color4: '0099cc',
    })
  })

  it('drops a saved slot key the manifest does not declare rather than passing it through', () => {
    expect(resolvePalette(manifest, { color1: 'ff0000', colorBogus: '#123456' })).toEqual({
      color1: 'ff0000',
      color4: '0099cc',
    })
  })

  // Live-validation defect 3 reproduction: the exact real values from the confirmed defect
  // (user 1 / avatar 12's persisted `{"color1":"#00cc44"}` over the compiled rasta manifest's
  // 7-slot defaults) — this is the effective-palette computation the construction-time wiring
  // must feed into LayeredAvatar so a saved palette renders on scene entry, not only after a
  // live in-room change.
  it('resolves the exact reconnect scenario: one saved slot merged over the real rasta defaults', () => {
    const rastaManifest = {
      slots: ['color1', 'color2', 'color3', 'color4', 'color5', 'color7', 'colorGuante'],
      defaults: {
        color1: 'b88a5c',
        color2: 'ff9900',
        color3: '0099cc',
        color4: '0099cc',
        color5: 'e31709',
        color7: '336666',
        colorGuante: 'ff0000',
      },
    }
    const result = resolvePalette(rastaManifest, { color1: '#00cc44' })
    expect(result.color1).toBe('#00cc44')
    expect(result.color2).toBe('ff9900')
    expect(result.colorGuante).toBe('ff0000')
  })
})

// Real defect found live (tasks.md slice 26, ninja/werewolf — see computeManifestSlots.cjs's
// own docblock for the full account): a piece CAN be tagged with a recolour slot that has
// neither a player-saved palette entry NOR a manifest-declared default (an empty vector-`.bb`
// colormeta does not imply zero slot-tagged base pieces). `LayeredAvatar._tintChild` used to
// leave such a piece completely untinted (`if (!hex) return`), which shows the piece's own raw
// authored pixel data — a grayscale mask meant ONLY as a multiply-tint target, never as a
// final displayed colour (confirmed live: ninja's own masks average ~230/255, rendering a
// washed-out near-white ninja against a legacy baked reference sprite that is solid black).
// `resolveTintHex` always returns a real hex, falling back to a neutral black rather than
// exposing the internal tinting-mask colour — verified live to render ninja indistinguishable
// from her own baked reference when applied.
describe('paletteResolve: resolveTintHex never returns falsy (tasks.md slice 26 defect fix)', () => {
  it('prefers a player-saved palette value over the manifest default', () => {
    expect(resolveTintHex({ color1: '#00cc44' }, { color1: 'b88a5c' }, 'color1')).toBe('#00cc44')
  })

  it('falls back to the manifest default when no player-saved value exists', () => {
    expect(resolveTintHex({}, { color1: 'b88a5c' }, 'color1')).toBe('b88a5c')
  })

  it('falls back to a neutral black when NEITHER a saved value nor a manifest default exists for this slot (the ninja/werewolf shape)', () => {
    expect(resolveTintHex({}, {}, 'color1')).toBe('000000')
  })
})
