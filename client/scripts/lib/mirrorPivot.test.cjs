import { describe, it, expect } from 'vitest'
import { mirrorPivot } from './mirrorPivot.cjs'

// LR5: mirrored (right-facing) frames MUST NOT reuse the source origin unmodified — the pivot
// is corrected for the horizontal-flip transform (design.md §3.1 step 5, `oMirror`).
describe('mirrorPivot', () => {
  it('mirrors a zero-origin pivot across the body bounds width', () => {
    expect(mirrorPivot([0, 106], 81.2)).toEqual([81.2, 106])
  })

  it('mirrors a non-zero, asymmetric-origin pivot across the body bounds width', () => {
    expect(mirrorPivot([40.6, 106], 81.2)).toEqual([40.6, 106])
  })

  it('mirrors an off-centre origin correctly (not a no-op)', () => {
    expect(mirrorPivot([30, 100], 90)).toEqual([60, 100])
  })
})
