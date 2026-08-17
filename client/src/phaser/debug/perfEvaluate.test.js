import { describe, it, expect } from 'vitest'
import { evaluate, resolveRendererTypeLabel } from './perfEvaluate.js'

// LR8: go/no-go thresholds. PASS = p5 FPS >= 45 at 25 avatars (60 FPS stated desktop target).
// Warn (does not flip pass) when layered/baked mean-FPS ratio < 0.6.
describe('perfEvaluate.evaluate', () => {
  it('passes when p5 FPS clears the 45 floor with a healthy layered/baked ratio', () => {
    const result = evaluate({ fps5: 50, meanFpsLayered: 55, meanFpsBaked: 60 })
    expect(result.pass).toBe(true)
    expect(result.reasons).toEqual([])
  })

  it('fails when p5 FPS is below the 45 floor', () => {
    const result = evaluate({ fps5: 40, meanFpsLayered: 42, meanFpsBaked: 60 })
    expect(result.pass).toBe(false)
    expect(result.reasons).toContain('p5 FPS 40 is below the 45 floor at 25 avatars')
  })

  it('warns but still passes when the layered/baked ratio drops below 0.6', () => {
    const result = evaluate({ fps5: 46, meanFpsLayered: 30, meanFpsBaked: 60 })
    expect(result.pass).toBe(true)
    expect(result.reasons).toEqual([
      'warning: layered/baked mean FPS ratio 0.50 is below 0.6 and predicts failure on weaker clients',
    ])
  })
})

// Bug fix: live validation measured `game.renderer.type === 2` while running genuine WebGL
// (Phaser 3.90), but PerfHarness.js reported "canvas/other" — it had checked `=== 1`, which is
// actually Phaser.CANVAS (Phaser's own const.js: AUTO=0, CANVAS=1, WEBGL=2, HEADLESS=3).
describe('resolveRendererTypeLabel', () => {
  it('labels Phaser.WEBGL (2) as "webgl"', () => {
    expect(resolveRendererTypeLabel(2)).toBe('webgl')
  })

  it('labels Phaser.CANVAS (1) as "canvas"', () => {
    expect(resolveRendererTypeLabel(1)).toBe('canvas')
  })

  it('labels an unrecognised/headless type as "other" rather than silently guessing', () => {
    expect(resolveRendererTypeLabel(3)).toBe('other')
    expect(resolveRendererTypeLabel(undefined)).toBe('other')
  })
})
