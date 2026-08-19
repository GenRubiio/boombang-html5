// Correction 2 (apply-progress.md's "Correction 2", 2026-08-18 user decision): Phaser's Canvas
// renderer never applies `setTint()` (`CanvasRenderer#batchSprite` draws via a plain
// `ctx.drawImage`) — a real player with no WebGL, or with the real per-user `phaser_type:
// "canvas"` setting `App.vue` reads, would see every layered character as an untinted white
// silhouette. The fix pre-multiplies the resolved colour into a cached, per-(piece, colour)
// texture instead of relying on `setTint()` under that renderer (canvasTint.js/
// canvasTintCache.js, wired into LayeredAvatar._tintChild).
//
// This file is the PERMANENT Canvas-renderer regression coverage — added as its OWN test,
// alongside (not replacing) `avatar-resolved-state.spec.js`'s existing AUTO-renderer R8-pixel
// test, so both renderer paths stay covered independently going forward. It also carries the
// memory-budget measurement design.md §19 risk 18 names: a pre-multiplied texture is per
// (piece, resolved colour), so the real risk is cache growth, not renderer choice by itself.

import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import sharp from 'sharp'
import { buildSolidRgbaBuffer } from '../scripts/lib/pixelColorMatch.cjs'
import { diffRgbaBuffers } from '../src/shared/assetPipeline/compareRasters.js'
import { buildContactSheet } from './lib/buildAvatarContactSheet.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, 'artifacts', 'contact-sheets')
const CANVAS_HARNESS_URL = '/harness.html?renderer=canvas'

test.describe('Canvas renderer tint fallback (Correction 2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CANVAS_HARNESS_URL)
    await page.waitForFunction(() => !!window.__avatarHarness)
  })

  test('sanity: the harness actually booted the Canvas renderer, not WebGL (the test would be vacuous otherwise)', async ({
    page,
  }) => {
    const rendererType = await page.evaluate(() => window.game.renderer.type)
    // Phaser.CANVAS === 1 (Phaser.WEBGL === 2, Phaser.AUTO === 0) — read directly off the booted
    // game instance rather than importing Phaser's constants into this Node-side test file.
    expect(rendererType).toBe(1)
  })

  test('R8-pixel (Canvas renderer): the ACTUAL RENDERED PIXEL colour of a body slot matches the resolved palette', async ({
    page,
  }) => {
    const socketId = 'canvas_tint_r8'
    const pixelCheckSlot = 'color1'
    const pixelCheckColor = '#ff00ff'

    await page.evaluate(
      ({ socketId, pixelCheckSlot, pixelCheckColor }) =>
        window.__avatarHarness.spawnAvatar({
          socketId,
          avatarId: 12,
          x: 5,
          y: 5,
          palette: { [pixelCheckSlot]: pixelCheckColor },
        }),
      { socketId, pixelCheckSlot, pixelCheckColor }
    )

    const rect = await page.evaluate(
      ({ socketId, slot }) => {
        window.__avatarHarness.setDirection(socketId, 'down')
        const scene = window.game.scene.getScenes(true)[0]
        const avatar = scene.users[socketId].spriteAvatar
        const candidates = avatar._pool.filter((child) => {
          if (!child.visible) return false
          const pieceId = child.getData('pieceId')
          const manifestPiece = pieceId && avatar._manifest.pieces[pieceId]
          return manifestPiece && manifestPiece.slot === slot
        })
        if (candidates.length === 0) return null
        const biggest = candidates.reduce((best, child) => {
          const b = child.getBounds()
          const area = b.width * b.height
          return !best || area > best.area ? { child, area, bounds: b } : best
        }, null)
        const bounds = biggest.bounds
        const canvasRect = document.querySelector('canvas').getBoundingClientRect()
        return {
          x: canvasRect.left + bounds.left,
          y: canvasRect.top + bounds.top,
          width: bounds.width,
          height: bounds.height,
        }
      },
      { socketId, slot: pixelCheckSlot }
    )
    expect(rect, `rasta has a visible "${pixelCheckSlot}"-slotted piece under the Canvas renderer`).toBeTruthy()

    await page.waitForTimeout(100)

    const sampleSize = Math.max(2, Math.min(8, Math.floor(Math.min(rect.width, rect.height) / 2)))
    const clip = {
      x: Math.round(rect.x + rect.width / 2 - sampleSize / 2),
      y: Math.round(rect.y + rect.height / 2 - sampleSize / 2),
      width: sampleSize,
      height: sampleSize,
    }
    const screenshotBuffer = await page.screenshot({ clip })
    const { data: sampledRgba } = await sharp(screenshotBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const expectedRgba = buildSolidRgbaBuffer(sampleSize, sampleSize, pixelCheckColor)
    const { differingPixels, totalPixels } = diffRgbaBuffers(
      new Uint8ClampedArray(sampledRgba),
      expectedRgba,
      sampleSize,
      sampleSize,
      { tolerance: 40 }
    )
    // Before this correction: this exact assertion measured `differingFraction === 1` (100% of
    // the sampled patch differing, i.e. pure untinted white) under this same renderer/manifest/
    // palette/position — captured live during slice 21 (apply-progress.md's defect 5) and
    // reconfirmed live during this correction with the Canvas-tint branch temporarily disabled.
    const differingFraction = differingPixels / totalPixels
    expect(
      differingFraction,
      `sampled ${sampleSize}x${sampleSize} patch at a "${pixelCheckSlot}" piece did not render close to ${pixelCheckColor} under the Canvas renderer (${differingPixels}/${totalPixels} pixels differing)`
    ).toBeLessThanOrEqual(0.1)
    expect(totalPixels).toBe(sampleSize * sampleSize)
  })

  test('M4-equivalent (Canvas renderer): resident bytes including the tint cache, one avatar with one action played', async ({
    page,
  }) => {
    await page.waitForFunction(() => !!window.__avatarMetrics)
    const socketId = 'canvas_tint_m4'
    await page.evaluate(
      ({ socketId }) => window.__avatarHarness.spawnAvatar({ socketId, avatarId: 12 }),
      { socketId }
    )
    await page.evaluate((socketId) => {
      window.__avatarHarness.setDirection(socketId, 'down')
      window.__avatarHarness.playKey(socketId, 'llorar')
    }, socketId)
    await page.waitForFunction(
      (id) => window.game.scene.getScenes(true)[0].users[id].spriteAvatar._atlasKeys.actions.has('down_llorar'),
      socketId
    )
    // A real palette paint is what populates the tint cache at all (an unpainted slot uses the
    // manifest's own default colour, exercised by spawnAvatar already, but the point of this
    // measurement is a REAL cache, not an empty one) — wait one real frame for `_tintChild` to
    // have run against the currently-playing sequence.
    await page.waitForTimeout(100)

    const metrics = await page.evaluate(() => window.__avatarMetrics())
    const totalBytes = metrics.residentAvatarBytes + metrics.canvasTintCacheBytes
    const gateBytes = 80 * 1024 * 1024
    console.log(
      `[Correction 2 measurement] Canvas renderer, one avatar/one action: residentAvatarBytes=${metrics.residentAvatarBytes} B, canvasTintCacheBytes=${metrics.canvasTintCacheBytes} B, total=${totalBytes} B (${(totalBytes / 1024 / 1024).toFixed(2)} MB) — gate <=80MB: ${totalBytes <= gateBytes ? 'PASS' : 'FAIL'}`
    )
    expect(metrics.canvasTintCacheBytes).toBeGreaterThan(0)
    expect(totalBytes).toBeLessThanOrEqual(gateBytes)
  })

  test('M4-equivalent, roster-realistic sweep (Canvas renderer): cache growth across every real resolvable action key', async ({
    page,
  }) => {
    await page.waitForFunction(() => !!window.__avatarMetrics)
    const socketId = 'canvas_tint_m4_sweep'
    await page.evaluate(
      ({ socketId }) =>
        window.__avatarHarness.spawnAvatar({
          socketId,
          avatarId: 12,
          accessories: { hat: 'minnieHat', pet: 'pet09', aura: 'auraElectrica' },
        }),
      { socketId }
    )
    // Mirrors R11's own full action-coverage sweep exactly (avatar-resolved-state.spec.js) — the
    // real `sequences ∪ aliases ∪ mirrors` key set, not a hand-picked sample, so this measures
    // the cache's REAL worst case for a single character actually visiting every one of its own
    // compiled poses, matching a real play session far more closely than one action.
    await page.evaluate((socketId) => window.__avatarHarness.preloadActionPacks(socketId), socketId)
    await page.evaluate((socketId) => {
      const scene = window.game.scene.getScenes(true)[0]
      const manifest = scene.users[socketId].spriteAvatar._manifest
      const allKeys = [
        ...Object.keys(manifest.sequences),
        ...Object.keys(manifest.aliases),
        ...Object.keys(manifest.mirrors),
      ]
      for (const key of allKeys) {
        window.__avatarHarness.playKey(socketId, key)
        window.__avatarHarness.advance(1)
      }
    }, socketId)

    const metrics = await page.evaluate(() => window.__avatarMetrics())
    const totalBytes = metrics.residentAvatarBytes + metrics.canvasTintCacheBytes
    const gateBytes = 80 * 1024 * 1024
    console.log(
      `[Correction 2 measurement] Canvas renderer, ONE avatar (hat+pet+aura worn) swept through every real resolvable action key (sequences ∪ aliases ∪ mirrors): residentAvatarBytes=${metrics.residentAvatarBytes} B, canvasTintCacheBytes=${metrics.canvasTintCacheBytes} B, total=${totalBytes} B (${(totalBytes / 1024 / 1024).toFixed(2)} MB) — gate <=80MB: ${totalBytes <= gateBytes ? 'PASS' : 'FAIL'}`
    )
    // Deliberately NOT asserted against the gate — this is the wider, more realistic sweep the
    // single-action M4-equivalent above cannot represent (a real play session visits far more
    // than one action key per character). Reported honestly per the correction's own
    // instruction: "measure ... and report the number ... rather than shipping something that
    // only passes with one avatar on screen." A hard assertion here would abort measurement
    // instead of reporting it if the number is unfavourable.
    expect(totalBytes).toBeGreaterThan(0)
  })

  test("captures rasta's contact sheet under the Canvas renderer (review evidence, not a gate)", async ({
    page,
  }) => {
    // Same tooling and same character as `avatar-contact-sheet.spec.js`'s AUTO-renderer sheet —
    // a distinct output file (`rasta-canvas-renderer.png`) so both renderer states are committed
    // and visually reviewable side by side, per the correction's own instruction to "capture a
    // contact sheet under the Canvas renderer too, and state which renderer each committed sheet
    // was produced with" (recorded in apply-progress.md).
    const config = {
      character: 'rasta',
      avatarId: 12,
      hatKey: 'minnieHat',
      petKey: 'pet09',
      auraKey: 'auraElectrica',
      actionPaletteSlot: 'color1',
      actionPaletteColor: '#ff00ff',
    }
    await buildContactSheet(page, config, {
      outputDir: OUTPUT_DIR,
      outputFileName: 'rasta-canvas-renderer',
    })
    const outputPath = path.join(OUTPUT_DIR, 'rasta-canvas-renderer.png')
    const stat = fs.statSync(outputPath)
    expect(stat.size).toBeGreaterThan(0)
  })
})
