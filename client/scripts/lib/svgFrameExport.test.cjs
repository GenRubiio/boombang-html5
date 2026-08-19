import { describe, it, expect } from 'vitest'
import { createRequire } from 'module'
import * as pathBounds from '../../src/shared/assetPipeline/pathBounds.js'

// `svgFrameExport.cjs` internally `require()`s `svgFromPaths.cjs` (plain CJS, matching how
// the real compilers consume it) — under vitest's Vite-based module graph, that internal
// `require()` resolves to a DIFFERENT module instance than this file's own ESM `import` of the
// same path (confirmed live: injecting via the ESM import left the require()'d instance
// uninjected). Using Node's real `require` (via `createRequire`) on the exact same absolute
// path `svgFrameExport.cjs` uses reaches the SAME instance it does — a test-environment-only
// wrinkle; the real compilers (plain `node`, no Vite) have only one module cache and never hit
// this at all.
const nodeRequire = createRequire(import.meta.url)
const svgFromPathsViaRequire = nodeRequire('./svgFromPaths.cjs')
svgFromPathsViaRequire.setSharedVectorBounds(pathBounds)
const { computeBounds } = svgFromPathsViaRequire
const { exportFrameSvg } = nodeRequire('./svgFrameExport.cjs')

// design.md §16.3 (tasks.md slice 11 task 4): per-frame SVG export. `viewBox` from the SHARED
// `computeBounds`; `data-bb-origin="x,y"` on the root is authoritative; slotted paths export
// at the slot's DEFAULT colour (fact C says authored fill already equals it, but this resolves
// it explicitly and defensively rather than relying on that always holding); the sidecar
// carries `{species, slot?, k?}` per path in document order, plus the `cl` dict and origin.
describe('exportFrameSvg', () => {
  const colormetaDefaults = { color1: 'b88a5c', color2: 'ff9900' }

  it('emits an svg with data-bb-origin and a viewBox from computeBounds', () => {
    const frame = {
      o: [40.6, 106],
      p: [{ d: 'M0 0L10 5Z', f: '#b88a5c', eo: 1, c: 'color1' }],
    }
    const { svg } = exportFrameSvg(frame, colormetaDefaults, 2)
    expect(svg).toContain('data-bb-origin="40.6,106"')
    const bounds = computeBounds(frame.p, 2)
    expect(svg).toContain(`viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}"`)
  })

  it('exports a slotted path at the slot default colour, not necessarily its authored fill', () => {
    const frame = {
      o: [0, 0],
      // deliberately authored with a WRONG fill, to prove the export resolves the slot
      // default rather than trusting the authored value (defensive, per the task's own
      // wording — "at colormeta.defaults[slot] visible fill")
      p: [{ d: 'M0 0L10 5Z', f: '#000000', eo: 1, c: 'color2' }],
    }
    const { svg } = exportFrameSvg(frame, colormetaDefaults, 2)
    expect(svg).toContain('fill="#ff9900"')
    expect(svg).not.toContain('fill="#000000"')
  })

  it('produces a sidecar with species/slot/k per path in document order, plus cl and origin', () => {
    const frame = {
      o: [5, 6],
      p: [
        { d: 'M0 0L10 5Z', f: '#b88a5c', eo: 1, c: 'color1' },
        { d: 'M0 0L1 1', s: '#000000', w: 1.8 },
        { d: 'M2 2Z', f: '#fff', eo: 1, k: 1 },
      ],
      cl: { 1: 'M0 0Z' },
    }
    const { sidecar } = exportFrameSvg(frame, colormetaDefaults, 2)
    expect(sidecar.origin).toEqual([5, 6])
    expect(sidecar.cl).toEqual({ 1: 'M0 0Z' })
    expect(sidecar.paths).toEqual([
      { species: 'fill', slot: 'color1' },
      { species: 'stroke' },
      { species: 'fill', k: 1 },
    ])
  })

  it('injects data-bb-slot on a slotted path element, as redundancy alongside the sidecar', () => {
    const frame = {
      o: [0, 0],
      p: [{ d: 'M0 0L10 5Z', f: '#b88a5c', eo: 1, c: 'color1' }],
    }
    const { svg } = exportFrameSvg(frame, colormetaDefaults, 2)
    expect(svg).toContain('data-bb-slot="color1"')
  })

  it('does not inject data-bb-slot on an unslotted path', () => {
    const frame = { o: [0, 0], p: [{ d: 'M0 0L1 1', s: '#000', w: 1 }] }
    const { svg } = exportFrameSvg(frame, colormetaDefaults, 2)
    expect(svg).not.toContain('data-bb-slot')
  })

  it('leaves stroke and gradient paths untouched by slot-colour resolution (never slotted, fact B)', () => {
    const frame = {
      o: [0, 0],
      p: [{ d: 'M0 0L1 1', s: '#111111', w: 1 }],
    }
    const { svg } = exportFrameSvg(frame, colormetaDefaults, 2)
    expect(svg).toContain('stroke="#111111"')
  })
})
