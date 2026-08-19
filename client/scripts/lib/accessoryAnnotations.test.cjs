import { describe, it, expect } from 'vitest'
import { resolveAccessoryAnnotation, applyRegistrationOffset } from './accessoryAnnotations.cjs'

// design.md §16.1 (tasks.md slice 11 task 1): `accessory-annotations.json` gains
// `regXOffset`/`regYOffset` (logical units) alongside `scale`/`groundOffsetY`, keyed
// `<char>/<kind>/<key>` — so an offset for one character's package cannot affect a different
// character's package sharing the same (kind, key), e.g. `Custom6Hat` under `rasta` vs
// `lilian`.
describe('resolveAccessoryAnnotation', () => {
  const annotations = {
    'rasta/hat/minnieHat': { scale: 0.75 },
    'rasta/pet/pet09': { groundOffsetY: 19 },
    'rasta/hat/Custom6Hat': { regXOffset: 3, regYOffset: -2 },
  }

  it('resolves an existing annotation for the exact char/kind/key', () => {
    expect(resolveAccessoryAnnotation(annotations, 'rasta', 'hat', 'minnieHat')).toEqual({ scale: 0.75 })
  })

  it('returns an empty object for a package with no annotation at all', () => {
    expect(resolveAccessoryAnnotation(annotations, 'rasta', 'pet', 'pet10')).toEqual({})
  })

  it('does NOT let one character\'s Custom6Hat annotation leak onto a different character\'s Custom6Hat', () => {
    expect(resolveAccessoryAnnotation(annotations, 'lilian', 'hat', 'Custom6Hat')).toEqual({})
    expect(resolveAccessoryAnnotation(annotations, 'rasta', 'hat', 'Custom6Hat')).toEqual({
      regXOffset: 3,
      regYOffset: -2,
    })
  })
})

describe('applyRegistrationOffset', () => {
  const frames = {
    f0: { regX: 10, regY: 20, originX: 0.5, originY: 0.5 },
    f1: { regX: 15, regY: 25, originX: 0.5, originY: 0.5 },
  }

  it('shifts every frame\'s regX/regY by the given offset, leaving other fields untouched', () => {
    const result = applyRegistrationOffset(frames, 3, -2)
    expect(result.f0).toEqual({ regX: 13, regY: 18, originX: 0.5, originY: 0.5 })
    expect(result.f1).toEqual({ regX: 18, regY: 23, originX: 0.5, originY: 0.5 })
  })

  it('is a no-op when both offsets are 0 (the default, no annotation present)', () => {
    const result = applyRegistrationOffset(frames, 0, 0)
    expect(result).toEqual(frames)
  })

  it('does not mutate the input frames object', () => {
    const original = JSON.parse(JSON.stringify(frames))
    applyRegistrationOffset(frames, 5, 5)
    expect(frames).toEqual(original)
  })
})
