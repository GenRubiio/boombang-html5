// Pure scoring function for PerfHarness.js (design.md §7, LR8). Kept dependency-free and
// side-effect-free so it is unit-testable with no Phaser instantiation.

const P5_FPS_FLOOR = 45
const LAYERED_BAKED_RATIO_WARN_THRESHOLD = 0.6

/**
 * @param {{fps5: number, meanFpsLayered?: number, meanFpsBaked?: number}} sample
 * @returns {{pass: boolean, reasons: string[]}}
 */
export function evaluate({ fps5, meanFpsLayered, meanFpsBaked }) {
  const reasons = []
  const pass = fps5 >= P5_FPS_FLOOR

  if (!pass) {
    reasons.push(`p5 FPS ${fps5} is below the ${P5_FPS_FLOOR} floor at 25 avatars`)
  }

  const hasRatioInputs =
    typeof meanFpsLayered === 'number' && typeof meanFpsBaked === 'number' && meanFpsBaked > 0
  if (hasRatioInputs) {
    const ratio = meanFpsLayered / meanFpsBaked
    if (ratio < LAYERED_BAKED_RATIO_WARN_THRESHOLD) {
      reasons.push(
        `warning: layered/baked mean FPS ratio ${ratio.toFixed(2)} is below ${LAYERED_BAKED_RATIO_WARN_THRESHOLD} and predicts failure on weaker clients`
      )
    }
  }

  return { pass, reasons }
}

// Live-validation bug fix: PerfHarness.js previously checked `renderer.type === 1` for WebGL,
// but Phaser's own const.js declares AUTO=0, CANVAS=1, WEBGL=2, HEADLESS=3 — 1 is actually
// Phaser.CANVAS. A real WebGL session (Phaser 3.90, `game.renderer.type === 2`) was therefore
// misreported as "canvas/other" in the perf report.
const RENDERER_TYPE_LABELS = { 1: 'canvas', 2: 'webgl' }

/**
 * @param {number|undefined} rendererType Phaser's `game.renderer.type` (its own CONST values)
 * @returns {'webgl'|'canvas'|'other'}
 */
export function resolveRendererTypeLabel(rendererType) {
  return RENDERER_TYPE_LABELS[rendererType] ?? 'other'
}
