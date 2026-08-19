import { describe, it, expect } from 'vitest'
import { assertOriginSpaceMatch } from './originSpaceGate.cjs'

// design.md §5.4: origin-space assertion — |o_vector(down_idle) - o_raster(down_idle)| <= 1
// logical unit per axis. The whole action-compile slice rests on the vector and raster
// packages sharing one rig space; strongly corroborated by the existing hat/pet pipeline but
// checked per character, not trusted.
describe('assertOriginSpaceMatch', () => {
  it('passes when origins are identical', () => {
    expect(() => assertOriginSpaceMatch([40.6, 106], [40.6, 106])).not.toThrow()
  })

  it('passes when the difference is within the 1-logical-unit tolerance', () => {
    expect(() => assertOriginSpaceMatch([40.6, 106], [41.4, 106.9])).not.toThrow()
  })

  it('throws, naming both origins, when the X difference exceeds 1 logical unit', () => {
    expect(() => assertOriginSpaceMatch([40.6, 106], [42.7, 106])).toThrow(/40\.6.*42\.7|42\.7.*40\.6/)
  })

  it('throws when the Y difference exceeds 1 logical unit, even if X matches exactly', () => {
    expect(() => assertOriginSpaceMatch([40.6, 106], [40.6, 108])).toThrow()
  })
})
