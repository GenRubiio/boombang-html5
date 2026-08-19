import { describe, it, expect } from 'vitest'
import {
  parseBakedConfig,
  deriveAliasesAndMirrors,
  checkAliasMirrorCompleteness,
  deriveConventionMirrors,
  isSelfEmittedConfigShim,
} from './bakedKeyMap.cjs'

// design.md §5.5 (fact I): the character's baked config.json already carries the emote/action
// name-alias map — `prefix: "sprites/<authored-sequence>/"` and `flip_horizontally`. This
// derives {aliases, mirrors} from it, replacing the old ad hoc MIRROR_SOURCE_PREFIXES loop
// (which only covered idle/talk/walk) with one general, data-driven mechanism covering every
// baked key.
describe('parseBakedConfig', () => {
  it('extracts {fps, repeat, source, flip} per baked key, source being the prefix tail', () => {
    const baked = {
      risa1: { prefix: 'sprites/down_risa1/', flip_horizontally: false, frameRate: 19, repeat: 0 },
      right_punch_doy: { prefix: 'sprites/leftdown_punch_doy/', flip_horizontally: true, frameRate: 19, repeat: 0 },
    }
    expect(parseBakedConfig(baked)).toEqual({
      risa1: { fps: 19, repeat: 0, source: 'down_risa1', flip: false },
      right_punch_doy: { fps: 19, repeat: 0, source: 'leftdown_punch_doy', flip: true },
    })
  })

  it('ignores an entry with no numeric frameRate', () => {
    const baked = { notAnAnim: { someOtherField: true } }
    expect(parseBakedConfig(baked)).toEqual({})
  })
})

describe('deriveAliasesAndMirrors', () => {
  const sequences = {
    down_idle: { frames: [0] },
    down_risa1: { frames: [0, 1, 2] },
    leftdown_punch_doy: { frames: [0, 1] },
  }

  it('adds nothing for a baked key whose source equals itself (already a sequences key)', () => {
    const bakedKeyMap = { down_idle: { fps: 19, repeat: -1, source: 'down_idle', flip: false } }
    const { aliases, mirrors } = deriveAliasesAndMirrors(sequences, bakedKeyMap)
    expect(aliases).toEqual({})
    expect(mirrors).toEqual({})
  })

  it('adds an alias for flip:false, source !== key (an emote name -> its authored sequence)', () => {
    const bakedKeyMap = { risa1: { fps: 19, repeat: 0, source: 'down_risa1', flip: false } }
    const { aliases } = deriveAliasesAndMirrors(sequences, bakedKeyMap)
    expect(aliases).toEqual({ risa1: 'down_risa1' })
  })

  it('adds a mirror for flip:true (a right-facing action variant)', () => {
    const bakedKeyMap = {
      right_punch_doy: { fps: 19, repeat: 0, source: 'leftdown_punch_doy', flip: true },
    }
    const { mirrors } = deriveAliasesAndMirrors(sequences, bakedKeyMap)
    expect(mirrors).toEqual({ right_punch_doy: { from: 'leftdown_punch_doy', flipX: true } })
  })

  it('does not touch aliases/mirrors when the baked source is not a compiled sequence at all (not yet reachable from this character body)', () => {
    const bakedKeyMap = { special: { fps: 19, repeat: 0, source: 'leftup_special', flip: false } }
    const { aliases, mirrors } = deriveAliasesAndMirrors(sequences, bakedKeyMap)
    expect(aliases).toEqual({})
    expect(mirrors).toEqual({})
  })
})

// design.md §5.5: "the compiler FAILS if a baked key's source names a compiled sequence but
// the key lands in none of sequences/aliases/mirrors" — the gate against a silently
// unreachable action. Tested directly against a deliberately incomplete aliases/mirrors input
// (bypassing normal derivation), since the derivation algorithm itself cannot produce a gap by
// construction — this proves the gate fires on a genuine one.
describe('checkAliasMirrorCompleteness', () => {
  const sequences = { down_risa1: { frames: [0] } }

  it('passes when every baked key whose source is compiled is covered', () => {
    const bakedKeyMap = { risa1: { fps: 19, repeat: 0, source: 'down_risa1', flip: false } }
    expect(() =>
      checkAliasMirrorCompleteness(sequences, { risa1: 'down_risa1' }, {}, bakedKeyMap)
    ).not.toThrow()
  })

  it('throws naming the unreachable key when a compiled-source baked key is covered by neither aliases nor mirrors', () => {
    const bakedKeyMap = { risa1: { fps: 19, repeat: 0, source: 'down_risa1', flip: false } }
    expect(() => checkAliasMirrorCompleteness(sequences, {}, {}, bakedKeyMap)).toThrow(/risa1/)
  })

  it('does not require coverage for a baked key whose source is not compiled at all', () => {
    const bakedKeyMap = { special: { fps: 19, repeat: 0, source: 'leftup_special', flip: false } }
    expect(() => checkAliasMirrorCompleteness(sequences, {}, {}, bakedKeyMap)).not.toThrow()
  })
})

// BLOCKER fix (2026-08-18, tasks.md slice 23 continuation): every `.layers.bb` in the asset dump
// ships the SAME 15 base sequences (idle/talk/walk x down/left/leftdown/leftup/up) and NO
// right-family source art at all — the convention itself already encodes "right mirrors left"
// universally. A character with no baked `config.json` precedent (sally, ghost, wraith) has an
// EMPTY `bakedKeyMap`, so `deriveAliasesAndMirrors` derives nothing and right/rightdown/rightup
// silently degrade to an unrelated `down_idle` pose (sally: 5 of 8 directions rendered). This
// derives the mirror map directly from the compiled `sequences` key names as the FALLBACK for
// exactly that case — the baked config, when present, stays the sole authority (never
// overridden).
describe('deriveConventionMirrors', () => {
  it('derives right/rightdown/rightup mirrors from left/leftdown/leftup base sequences', () => {
    const sequences = {
      down_idle: { frames: [0] },
      left_idle: { frames: [0] },
      leftdown_idle: { frames: [0] },
      leftup_idle: { frames: [0] },
      up_idle: { frames: [0] },
    }
    expect(deriveConventionMirrors(sequences)).toEqual({
      right_idle: { from: 'left_idle', flipX: true },
      rightdown_idle: { from: 'leftdown_idle', flipX: true },
      rightup_idle: { from: 'leftup_idle', flipX: true },
    })
  })

  it('applies the same convention to an action key, not only idle/talk/walk (triangulation)', () => {
    const sequences = {
      down_idle: { frames: [0] },
      leftdown_punch_rec: { frames: [0, 1] },
    }
    expect(deriveConventionMirrors(sequences)).toEqual({
      rightdown_punch_rec: { from: 'leftdown_punch_rec', flipX: true },
    })
  })

  it('never emits down/up mirrors (no left-right counterpart to flip against)', () => {
    const sequences = { down_idle: { frames: [0] }, up_idle: { frames: [0] } }
    expect(deriveConventionMirrors(sequences)).toEqual({})
  })

  it('does not override a mirrored key that is itself already a real compiled sequence', () => {
    const sequences = {
      left_idle: { frames: [0] },
      right_idle: { frames: [0, 1, 2] }, // hypothetical real right-family source art
    }
    expect(deriveConventionMirrors(sequences)).toEqual({})
  })
})

// BLOCKER fix, chicken-and-egg guard: `--emit-config-shim` writes a baked-shaped config.json
// for a character with no real baked precedent (design.md §15, tasks.md slice 10) — on a SECOND
// compile of the SAME character, `readBakedKeyMap` would otherwise read that self-emitted shim
// back as if it were real baked-legacy data, defeating `deriveConventionMirrors`'s own fallback
// condition (bakedKeyMap non-empty) even when the shim was written BEFORE this fix existed (so
// it itself carries zero mirrors) — this is exactly what happened recompiling `sally` live. A
// self-emitted shim is distinguishable from real baked-legacy data by one fact `buildConfigShim`
// always emits and no real baked config ever has: `atlasKey: null` on every entry (real baked
// characters always name a concrete atlas key, e.g. "rasta_atlas").
describe('isSelfEmittedConfigShim', () => {
  it('is true when every entry has atlasKey: null (buildConfigShim\'s own signature)', () => {
    const shim = {
      down_idle: { atlasKey: null, prefix: 'sprites/down_idle/', flip_horizontally: false },
      right_idle: { atlasKey: null, prefix: 'sprites/left_idle/', flip_horizontally: true },
    }
    expect(isSelfEmittedConfigShim(shim)).toBe(true)
  })

  it('is false for a real baked config (a concrete atlasKey string)', () => {
    const baked = {
      down_idle: { atlasKey: 'rasta_atlas', prefix: 'sprites/down_idle/', flip_horizontally: false },
    }
    expect(isSelfEmittedConfigShim(baked)).toBe(false)
  })

  it('is false for an empty config (nothing to mis-detect)', () => {
    expect(isSelfEmittedConfigShim({})).toBe(false)
  })
})
