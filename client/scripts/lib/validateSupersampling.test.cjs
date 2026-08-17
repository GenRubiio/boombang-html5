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
})
