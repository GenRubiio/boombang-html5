import { describe, it, expect } from 'vitest'
import { resolveLabel, resolveDefault, resolvePalette } from './paletteResolve.js'

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
