import { describe, it, expect } from 'vitest'
import { resolveSourceCharName } from './resolveSourceCharName.cjs'

// Live-caught defect (tasks.md slice 30, apply-progress.md): `stage-layered-source.sh` already
// reconciles `boomer` (the CLIENT name) against `bommer` (the one srcName != char lookup table
// entry, design.md §4) for the BODY compile, by renaming the staging directory at unzip time —
// `compile-layered-avatar.cjs` never validates an internal self-declared name against its CLI
// arg, so no compiler change was ever needed there (confirmed, tasks.md slice 26: "manifest.
// character === 'boomer' confirmed, no compiler change needed"). Accessory packages DO
// self-declare `{char, kind, key}` (design.md §4/§7's own `validateCharArg` hard-fail), and
// `boomer`'s accessory packages' own `meta.json.char` is "bommer" (matching the source archive's
// own naming, unaffected by which directory it is staged into) — a real mismatch against the
// CLIENT name "boomer" `stage-layered-source.sh` passes as `--char` for every OTHER character.
// This is the compile-time half of the SAME reconciliation the body already has, applied to the
// one place it was still missing: which name to VALIDATE meta.char against, independent of which
// name still nests the OUTPUT directory (must stay "boomer", matching the body's own
// `avatars/boomer/` convention and every other accessory's own registry key).
describe('resolveSourceCharName', () => {
  it('reconciles the one known srcName != char exception: boomer -> bommer', () => {
    expect(resolveSourceCharName('boomer')).toBe('bommer')
  })

  it('is the identity function for every other character (no reconciliation needed)', () => {
    expect(resolveSourceCharName('rasta')).toBe('rasta')
    expect(resolveSourceCharName('lilian')).toBe('lilian')
    expect(resolveSourceCharName('ninja')).toBe('ninja')
  })
})
