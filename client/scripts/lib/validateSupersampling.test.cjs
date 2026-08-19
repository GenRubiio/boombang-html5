import { describe, it, expect } from 'vitest'
import { validateSupersampling } from './validateSupersampling.cjs'

// LR3: a piece's raster asset MUST measure exactly width*2 by height*2 for ss:2.
describe('validateSupersampling', () => {
  it('passes silently when the raster matches the declared ss:2 dimensions', () => {
    expect(() => validateSupersampling({ w: 11.5, h: 21 }, { width: 23, height: 42 })).not.toThrow()
  })

  it('throws when the raster width does not match w*2', () => {
    expect(() => validateSupersampling({ w: 11.5, h: 21 }, { width: 20, height: 42 })).toThrow(
      /width/i
    )
  })

  it('throws when the raster height does not match h*2', () => {
    expect(() => validateSupersampling({ w: 11.5, h: 21 }, { width: 23, height: 40 })).toThrow(
      /height/i
    )
  })

  // design.md §5.4: action runs get a ±1px tolerance (librsvg rounds a run's own computed
  // bounds, unlike the base compiler's PNG-sourced pieces which measure exactly).
  it('passes within a ±1px tolerance when tolerance is provided (action runs)', () => {
    expect(() =>
      validateSupersampling({ w: 11.5, h: 21 }, { width: 24, height: 41 }, 2, 1)
    ).not.toThrow()
  })

  it('still throws beyond the tolerance', () => {
    expect(() =>
      validateSupersampling({ w: 11.5, h: 21 }, { width: 25, height: 42 }, 2, 1)
    ).toThrow(/width/i)
  })

  it('defaults tolerance to 0 (exact match required) when not provided', () => {
    expect(() => validateSupersampling({ w: 11.5, h: 21 }, { width: 24, height: 42 })).toThrow()
  })

  // design.md §13.7 (tasks.md slice 20 task 4): an ss:1-recompiled action key runs through this
  // SAME gate, with `ss` threaded through explicitly per call — confirms no hardcoded ss:2
  // assumption remains anywhere in the per-key path (`renderRunRaster` now passes its own `ss`
  // parameter here instead of the module-scope `SS` constant).
  it('validates an ss:1 raster (native, non-supersampled) with no hardcoded ss:2 assumption', () => {
    expect(() => validateSupersampling({ w: 11.5, h: 21 }, { width: 12, height: 21 }, 1, 1)).not.toThrow()
    expect(() => validateSupersampling({ w: 11.5, h: 21 }, { width: 23, height: 42 }, 1)).toThrow(/width/i)
  })
})
