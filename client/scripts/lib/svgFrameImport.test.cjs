import { describe, it, expect, vi } from 'vitest'
import { importFrameSvg } from './svgFrameImport.cjs'

// design.md §16.3/§16.4 (tasks.md slice 11 tasks 5-7): import reads geometry from the SVG and
// slots from the SIDECAR (authoritative), matched by document order. `d` strings pass through
// VERBATIM — never parsed/re-serialized (this is what makes R17b's exactness attainable).
// Rejects rather than guesses on every listed case, naming the file/path index.

const colormetaDefaults = { color1: 'b88a5c', color2: 'ff9900' }

function makeSvg({ paths, origin = [5, 6] }) {
  return `<svg data-bb-origin="${origin[0]},${origin[1]}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">${paths.join('')}</svg>`
}

describe('importFrameSvg', () => {
  it('imports a plain fill path, copying its d string VERBATIM', () => {
    const d = 'M0 0L10 5Z'
    const svg = makeSvg({ paths: [`<path d="${d}" fill="#ffaa00" fill-rule="nonzero"/>`] })
    const sidecar = { origin: [5, 6], cl: {}, paths: [{ species: 'fill' }] }
    const result = importFrameSvg(svg, sidecar, colormetaDefaults)
    expect(result.frame.p[0].d).toBe(d)
    expect(result.frame.o).toEqual([5, 6])
  })

  it('discards a slotted path own SVG fill and resolves it to the slot default instead', () => {
    const svg = makeSvg({
      paths: ['<path d="M0 0L1 1Z" data-bb-slot="color1" fill="#b88a5c" fill-rule="evenodd"/>'],
    })
    const sidecar = { origin: [0, 0], cl: {}, paths: [{ species: 'fill', slot: 'color1' }] }
    const result = importFrameSvg(svg, sidecar, colormetaDefaults)
    expect(result.frame.p[0].f).toBe('#b88a5c')
    expect(result.frame.p[0].c).toBe('color1')
    expect(result.frame.p[0].eo).toBe(1)
  })

  it('warns (does not throw) when a slotted path own SVG fill differs from the slot default', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const svg = makeSvg({
      paths: ['<path d="M0 0L1 1Z" data-bb-slot="color1" fill="#000000" fill-rule="evenodd"/>'],
    })
    const sidecar = { origin: [0, 0], cl: {}, paths: [{ species: 'fill', slot: 'color1' }] }
    const result = importFrameSvg(svg, sidecar, colormetaDefaults)
    expect(result.frame.p[0].f).toBe('#b88a5c') // discarded, resolved from the slot default
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/differs from the slot default/i))
    warnSpy.mockRestore()
  })

  it('imports a stroke path, trusting its SVG stroke/stroke-width (never slotted)', () => {
    const svg = makeSvg({ paths: ['<path d="M0 0L1 1" fill="none" stroke="#123456" stroke-width="1.8"/>'] })
    const sidecar = { origin: [0, 0], cl: {}, paths: [{ species: 'stroke' }] }
    const result = importFrameSvg(svg, sidecar, colormetaDefaults)
    expect(result.frame.p[0]).toEqual({ d: 'M0 0L1 1', s: '#123456', w: 1.8 })
  })

  it('imports a linear gradient, reducing its def back to {t,st,x1,y1,x2,y2}', () => {
    const svg = `<svg data-bb-origin="0,0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><linearGradient id="g0" gradientUnits="userSpaceOnUse" x1="1" y1="2" x2="3" y2="4"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient></defs><path d="M0 0Z" fill="url(#g0)" fill-rule="evenodd"/></svg>`
    const sidecar = { origin: [0, 0], cl: {}, paths: [{ species: 'gradient' }] }
    const result = importFrameSvg(svg, sidecar, colormetaDefaults)
    expect(result.frame.p[0]).toEqual({
      d: 'M0 0Z',
      g: { t: 'l', st: [[0, '#fff'], [1, '#000']], x1: 1, y1: 2, x2: 3, y2: 4 },
      eo: 1,
    })
  })

  it('rejects a path count mismatch, naming both counts', () => {
    const svg = makeSvg({ paths: ['<path d="M0 0Z" fill="#fff"/>'] })
    const sidecar = { origin: [0, 0], cl: {}, paths: [{ species: 'fill' }, { species: 'fill' }] }
    expect(() => importFrameSvg(svg, sidecar, colormetaDefaults)).toThrow(/count/i)
  })

  it('rejects when data-bb-slot disagrees with the sidecar', () => {
    const svg = makeSvg({ paths: ['<path d="M0 0Z" data-bb-slot="color2" fill="#fff"/>'] })
    const sidecar = { origin: [0, 0], cl: {}, paths: [{ species: 'fill', slot: 'color1' }] }
    expect(() => importFrameSvg(svg, sidecar, colormetaDefaults)).toThrow(/disagree/i)
  })

  it('rejects an unreducible RADIAL gradient', () => {
    const svg = `<svg data-bb-origin="0,0" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g0"><stop offset="0" stop-color="#fff"/></radialGradient></defs><path d="M0 0Z" fill="url(#g0)"/></svg>`
    const sidecar = { origin: [0, 0], cl: {}, paths: [{ species: 'gradient' }] }
    expect(() => importFrameSvg(svg, sidecar, colormetaDefaults)).toThrow(/radial/i)
  })

  it('rejects a gradient carrying a gradientTransform', () => {
    const svg = `<svg data-bb-origin="0,0" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g0" gradientTransform="rotate(45)" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/></linearGradient></defs><path d="M0 0Z" fill="url(#g0)"/></svg>`
    const sidecar = { origin: [0, 0], cl: {}, paths: [{ species: 'gradient' }] }
    expect(() => importFrameSvg(svg, sidecar, colormetaDefaults)).toThrow(/gradientTransform/i)
  })

  it('rejects a gradient using objectBoundingBox units', () => {
    const svg = `<svg data-bb-origin="0,0" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g0" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/></linearGradient></defs><path d="M0 0Z" fill="url(#g0)"/></svg>`
    const sidecar = { origin: [0, 0], cl: {}, paths: [{ species: 'gradient' }] }
    expect(() => importFrameSvg(svg, sidecar, colormetaDefaults)).toThrow(/objectBoundingBox/i)
  })

  it('rejects a path command outside M/L/Q/Z/C (an editor-introduced arc)', () => {
    const svg = makeSvg({ paths: ['<path d="M0 0A10 10 0 0 1 20 20" fill="#fff"/>'] })
    const sidecar = { origin: [0, 0], cl: {}, paths: [{ species: 'fill' }] }
    expect(() => importFrameSvg(svg, sidecar, colormetaDefaults)).toThrow(/unrecognised/i)
  })

  it('rejects when the root svg has no data-bb-origin', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0Z" fill="#fff"/></svg>`
    const sidecar = { origin: [0, 0], cl: {}, paths: [{ species: 'fill' }] }
    expect(() => importFrameSvg(svg, sidecar, colormetaDefaults)).toThrow(/origin/i)
  })

  it('ignores a <g data-bb-role="guide"> crosshair group entirely', () => {
    const svg = `<svg data-bb-origin="0,0" xmlns="http://www.w3.org/2000/svg"><g data-bb-role="guide"><path d="M-5 0L5 0" stroke="#f00"/></g><path d="M0 0Z" fill="#fff"/></svg>`
    const sidecar = { origin: [0, 0], cl: {}, paths: [{ species: 'fill' }] }
    const result = importFrameSvg(svg, sidecar, colormetaDefaults)
    expect(result.frame.p).toHaveLength(1)
    expect(result.frame.p[0].d).toBe('M0 0Z')
  })

  it('carries the cl dictionary through from the sidecar verbatim', () => {
    const svg = makeSvg({ paths: ['<path d="M0 0Z" fill="#fff" clip-path="url(#k1)"/>'] })
    const sidecar = { origin: [0, 0], cl: { 1: 'M0 0L1 1Z' }, paths: [{ species: 'fill', k: 1 }] }
    const result = importFrameSvg(svg, sidecar, colormetaDefaults)
    expect(result.frame.cl).toEqual({ 1: 'M0 0L1 1Z' })
    expect(result.frame.p[0].k).toBe(1)
  })
})
