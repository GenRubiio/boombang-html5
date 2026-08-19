import { describe, it, expect } from 'vitest'
import { svgFromPaths, computeBounds, setSharedVectorBounds } from './svgFromPaths.cjs'
import * as pathBounds from '../../src/shared/assetPipeline/pathBounds.js'

// design.md §12.3 (tasks.md slice 8 task 1): computeBounds/validateCommandAlphabet moved to
// client/src/shared/assetPipeline/pathBounds.js; svgFromPaths.cjs now forwards to an injected
// reference instead of defining the logic itself. This one setup line is the ONLY change in
// this file — every assertion below is unchanged, re-verifying the moved logic still behaves
// identically through svgFromPaths.cjs's own (untouched) call sites.
setSharedVectorBounds(pathBounds)

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

  // design.md §5.2 (facts B/C): a path carries EITHER a fill (`f`, + optional `eo`) OR a
  // stroke (`s`+`w`, no `f`, never a `c`) — never neither. The compiler's latent defect
  // (fixed here) unconditionally emitted `fill="${piece.f}"`, so a stroke path (undefined `f`)
  // rendered `fill="undefined"` and drew nothing.
  it('emits fill="none" stroke="{s}" stroke-width="{w}" for a stroke path (s/w present, no f)', () => {
    const paths = [{ d: 'M0 0L10 0L10 10Z', s: '#000000', w: 1.8 }]
    const { svg } = svgFromPaths(paths)
    expect(svg).toContain('<path d="M0 0L10 0L10 10Z" fill="none" stroke="#000000" stroke-width="1.8"')
    expect(svg).not.toContain('fill="undefined"')
  })

  it('throws when a path has neither f nor s/w, rather than emitting fill="undefined"', () => {
    const paths = [{ d: 'M0 0L10 0L10 10Z' }]
    expect(() => svgFromPaths(paths)).toThrow(/neither fill, stroke nor gradient/i)
  })

  // design.md §5.2 (fact C): the authored fill of a slotted path equals that slot's default —
  // setTint multiplies, so rasterizing at the authored colour applies the colour twice.
  // fillOverride neutralizes this to white ONLY for slotted (fill) runs; a stroke keeps its
  // own authored colour untouched, and an unslotted fill keeps its own authored colour too.
  it('applies fillOverride to a fill path when provided, ignoring the authored f', () => {
    const paths = [{ d: 'M0 0L10 0L10 10Z', f: '#b88a5c', c: 'color1' }]
    const { svg } = svgFromPaths(paths, undefined, { fillOverride: '#ffffff' })
    expect(svg).toContain('fill="#ffffff"')
    expect(svg).not.toContain('#b88a5c')
  })

  it('does NOT apply fillOverride to a stroke path (strokes are never slotted, fact B)', () => {
    const paths = [{ d: 'M0 0L10 0L10 10Z', s: '#000000', w: 1.8 }]
    const { svg } = svgFromPaths(paths, undefined, { fillOverride: '#ffffff' })
    expect(svg).toContain('stroke="#000000"')
    expect(svg).not.toContain('fill="#ffffff"')
  })

  it('keeps the authored fill when fillOverride is not provided (unslotted fill path)', () => {
    const paths = [{ d: 'M0 0L10 0L10 10Z', f: '#123456' }]
    const { svg } = svgFromPaths(paths)
    expect(svg).toContain('fill="#123456"')
  })

  // design.md §5.3 / fact J: a path carrying `k` references a clip shape in the frame's `cl`
  // map by id; each referenced id is emitted once as a <clipPath>, and the path gets
  // clip-path="url(#k{id})". Optional — omitted entirely when no `clips` param is passed
  // (`--no-clips` mode, design.md §5.3).
  it('emits a <clipPath> once per referenced id and applies clip-path to the carrying path', () => {
    const paths = [
      { d: 'M0 0L10 0L10 10Z', f: '#ffffff', k: 1 },
      { d: 'M1 1L9 1L9 9Z', f: '#ffffff', k: 1 },
    ]
    const clips = { 1: 'M63 3L63 3Z' }
    const { svg } = svgFromPaths(paths, undefined, { clips })
    expect(svg.match(/<clipPath id="k1"/g)).toHaveLength(1)
    expect(svg).toContain('<path d="M63 3L63 3Z"/>')
    expect(svg.match(/clip-path="url\(#k1\)"/g)).toHaveLength(2)
  })

  it('does not emit any clip markup when clips is not provided (--no-clips parity)', () => {
    const paths = [{ d: 'M0 0L10 0L10 10Z', f: '#ffffff', k: 1 }]
    const { svg } = svgFromPaths(paths)
    expect(svg).not.toContain('clipPath')
    expect(svg).not.toContain('clip-path')
  })

  // Live-discovered path species (avatar-system-multichar-fixes PR5): a linear-gradient fill
  // (`{d, g:{t:"l", st:[[offset,hex],...], x1,y1,x2,y2}, eo}`, no `f`, no `c` — verified
  // against real staged pet09/Custom6Hat/minnieHat frames and 8 occurrences in rasta's own
  // action set). Neither fact B nor fact C anticipated this; treating it as "neither fill nor
  // stroke" would have thrown on real production data instead of silently dropping geometry —
  // exactly the failure mode this module's own philosophy rejects.
  it('renders a linear-gradient path as a <linearGradient> referenced by fill="url(#...)"', () => {
    const paths = [
      {
        d: 'M0 0L10 0L10 10Z',
        g: { t: 'l', st: [[0, '#8e0000'], [1, '#140709']], x1: 1, y1: 2, x2: 3, y2: 4 },
        eo: 1,
      },
    ]
    const { svg } = svgFromPaths(paths)
    expect(svg).toContain('<linearGradient id="g0" gradientUnits="userSpaceOnUse" x1="1" y1="2" x2="3" y2="4">')
    expect(svg).toContain('<stop offset="0" stop-color="#8e0000"/>')
    expect(svg).toContain('<stop offset="1" stop-color="#140709"/>')
    expect(svg).toContain('fill="url(#g0)" fill-rule="evenodd"')
  })

  it('gives each gradient path its own gradient id, even with identical stops', () => {
    const gradient = { t: 'l', st: [[0, '#fff'], [1, '#000']], x1: 0, y1: 0, x2: 1, y2: 1 }
    const paths = [
      { d: 'M0 0L1 0Z', g: gradient },
      { d: 'M2 2L3 2Z', g: gradient },
    ]
    const { svg } = svgFromPaths(paths)
    expect(svg).toContain('fill="url(#g0)"')
    expect(svg).toContain('fill="url(#g1)"')
    expect(svg.match(/<linearGradient/g)).toHaveLength(2)
  })

  it('never applies fillOverride to a gradient path (gradients are never slotted, live-verified)', () => {
    const paths = [
      { d: 'M0 0L1 0Z', g: { t: 'l', st: [[0, '#fff'], [1, '#000']], x1: 0, y1: 0, x2: 1, y2: 1 } },
    ]
    const { svg } = svgFromPaths(paths, undefined, { fillOverride: '#ff00ff' })
    expect(svg).toContain('fill="url(#g0)"')
    expect(svg).not.toContain('#ff00ff')
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

  // Live-discovered defect (avatar-system-multichar-fixes PR5, rasta's real action set):
  // a perfectly horizontal or vertical STROKE path (e.g. a single eyelash/tear-track line)
  // has a mathematically zero-height or zero-width bounding box from its `d` coordinates
  // alone, which produces an invalid (zero-area) SVG viewBox — sharp/librsvg reported "bad
  // dimensions" and refused to rasterize it. A stroke's visible ink extends `w/2` beyond its
  // centreline on every side, so the bounds must inflate by that for a stroke path.
  it('inflates a stroke path bounding box by half its stroke-width, so a straight line never yields a zero-area box', () => {
    const paths = [{ d: 'M47.05 123.26L47.05 126.56', s: '#000000', w: 1.8 }]
    const bounds = computeBounds(paths)
    expect(bounds.minX).toBeCloseTo(47.05 - 0.9, 9)
    expect(bounds.maxX).toBeCloseTo(47.05 + 0.9, 9)
    expect(bounds.width).toBeCloseTo(1.8, 9)
    // The stroke pad applies on every side, not just the axis that was zero — the y-axis
    // (already non-zero from the raw coordinates) grows by the same w/2 top and bottom too,
    // matching how a real stroke's ink extends w/2 beyond its centreline in every direction.
    expect(bounds.height).toBeCloseTo(3.3 + 1.8, 9)
  })

  it('does not inflate a fill path when it already has real width/height (no stroke-width to account for)', () => {
    const paths = [{ d: 'M0 0L10 0L10 10Z', f: '#fff' }]
    const bounds = computeBounds(paths)
    expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10 })
  })

  // Live-discovered defect (avatar-system-multichar-fixes PR5, real rasta action data): a
  // genuinely tiny fill sliver (a thin highlight/glint detail, ~0.1 logical units wide) has a
  // real, non-zero but SUB-PIXEL bounding box once scaled by the ss:2 supersampling factor —
  // sharp/librsvg reported "bad dimensions" (it cannot rasterize a <1px image). A minimum
  // floor guarantees every axis is at least `1 / ss` logical units, so it always rounds to at
  // least 1 real pixel, regardless of path species.
  it('floors an extremely thin bounding box to a minimum renderable size (>= 1/ss logical units)', () => {
    const paths = [{ d: 'M31.11 49.77L31.01 48.61L31.11 49.77', f: '#ff9900', eo: 1 }]
    const bounds = computeBounds(paths, 2)
    expect(bounds.width).toBeGreaterThanOrEqual(0.5)
  })
})
