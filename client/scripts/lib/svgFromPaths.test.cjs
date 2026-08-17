import { describe, it, expect } from 'vitest'
import { svgFromPaths, computeBounds } from './svgFromPaths.cjs'

// compile-accessory.cjs vector mode (design.md §3.2 step 1): each frame's p[] becomes an SVG
// string, one <path> per entry, inside an <svg viewBox> from the frame bounds. EaselJS `d` is
// already SVG path syntax; the compiler asserts the command alphabet and throws on any
// unrecognised command rather than silently dropping geometry.
describe('svgFromPaths', () => {
  it('renders a multi-path frame as one <path> per entry', () => {
    const paths = [
      { d: 'M0 0L10 0L10 10Z', f: '#ff0000' },
      { d: 'M20 20L30 20L30 30Z', f: '#00ff00' },
    ]
    const { svg } = svgFromPaths(paths)
    expect(svg).toContain('<path d="M0 0L10 0L10 10Z" fill="#ff0000"')
    expect(svg).toContain('<path d="M20 20L30 20L30 30Z" fill="#00ff00"')
    expect(svg.match(/<path/g)).toHaveLength(2)
  })

  it('sets fill-rule=evenodd only when eo is truthy', () => {
    const paths = [
      { d: 'M0 0L10 0L10 10Z', f: '#000000', eo: 1 },
      { d: 'M0 0L10 0L10 10Z', f: '#000000' },
    ]
    const { svg } = svgFromPaths(paths)
    expect(svg).toContain('fill-rule="evenodd"')
    expect(svg).toContain('fill-rule="nonzero"')
  })

  it('throws on an unrecognised path command rather than silently dropping geometry', () => {
    const paths = [{ d: 'M0 0A10 10 0 0 1 20 20', f: '#000000' }]
    expect(() => svgFromPaths(paths)).toThrow(/unrecognised/i)
  })
})

describe('computeBounds', () => {
  it('computes the bounding box across all paths in a frame', () => {
    const paths = [
      { d: 'M0 0L10 5Z' },
      { d: 'M20 20L30 -5Z' },
    ]
    const bounds = computeBounds(paths)
    expect(bounds).toEqual({ minX: 0, minY: -5, maxX: 30, maxY: 20, width: 30, height: 25 })
  })
})
