import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

// design.md §11/§12.7, tasks.md slice 7: production-parity metrics captured on the real harness
// page. This spec REPORTS metrics — it produces the JSON artifact slice 8's go/no-go table
// (design.md §12.7) reads, it does not gate on any threshold itself (no PF equivalent exists
// per design.md §13's RS/PF table: "a PF test here would be self-defeating"). This is R14.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ARTIFACT_DIR = path.join(__dirname, 'artifacts')
const RASTA_AVATAR_ID = 12 // AvatarEnum.RASTA

async function spawnN(page, n) {
  const socketIds = []
  for (let i = 0; i < n; i++) {
    const socketId = `parity_${Date.now()}_${i}`
    // eslint-disable-next-line no-await-in-loop
    await page.evaluate(
      ({ socketId, avatarId, i }) =>
        window.__avatarHarness.spawnAvatar({
          socketId,
          avatarId,
          x: (i % 5) - 2,
          y: Math.floor(i / 5) - 2,
        }),
      { socketId, avatarId: RASTA_AVATAR_ID, i }
    )
    socketIds.push(socketId)
  }
  return socketIds
}

test.beforeEach(async ({ page }) => {
  await page.goto('/harness.html')
  await page.waitForFunction(() => !!window.__avatarHarness && !!window.__avatarMetrics)
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true })
})

test('R14: __avatarMetrics() reports every design §11 field at 8 avatars', async ({ page }) => {
  await page.evaluate(() => window.__avatarMetricsControls.markRoomEntry())
  await spawnN(page, 8)
  // Let a handful of real rendered frames elapse so the prerender/postrender-driven samples and
  // timeToFirstRender have something to report (the scene is never paused, design.md §13).
  await page.waitForFunction(() => window.__avatarMetrics().timeToFirstRender !== null)
  await page.waitForTimeout(300)

  const metrics = await page.evaluate(() => window.__avatarMetrics())

  expect(metrics).toHaveProperty('fps.mean')
  expect(metrics).toHaveProperty('fps.p5')
  expect(typeof metrics.renderMs).toBe('number')
  expect(typeof metrics.sprites).toBe('number')
  expect(metrics.sprites).toBeGreaterThan(0)
  expect(typeof metrics.graphics).toBe('number')
  expect(metrics).toHaveProperty('draws')
  expect(metrics).toHaveProperty('gpuTextures')
  expect(typeof metrics.residentAvatarBytes).toBe('number')
  expect(metrics.residentAvatarBytes).toBeGreaterThan(0)
  expect(metrics.parseComposition).toHaveProperty('loop')
  expect(metrics.parseComposition).toHaveProperty('punch')
  expect(metrics.parseComposition).toHaveProperty('other')
  expect(metrics.parseComposition.loop.residentCount).toBeGreaterThan(0)
  expect(typeof metrics.timeToFirstRender).toBe('number')

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'parity-8-avatars.json'),
    JSON.stringify({ scene: '8 avatars, rasta, raster path', metrics }, null, 2)
  )
})

test('R14: 25-avatar scene (archived cycle perf gate scenario) captures fps/draws/bytes', async ({
  page,
}) => {
  await page.evaluate(() => window.__avatarMetricsControls.markRoomEntry())
  await spawnN(page, 25)
  await page.waitForFunction(() => window.__avatarMetrics().timeToFirstRender !== null)
  await page.waitForTimeout(500)

  const metrics = await page.evaluate(() => window.__avatarMetrics())

  expect(metrics.sprites).toBeGreaterThan(0)
  expect(metrics.residentAvatarBytes).toBeGreaterThan(0)

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'parity-25-avatars.json'),
    JSON.stringify({ scene: '25 avatars, rasta, raster path', metrics }, null, 2)
  )
})

test('R14: timeToPlayCold is captured around a triggered action', async ({ page }) => {
  const socketId = 'parity_cold_1'
  await page.evaluate(
    ({ socketId, avatarId }) => window.__avatarHarness.spawnAvatar({ socketId, avatarId }),
    { socketId, avatarId: RASTA_AVATAR_ID }
  )
  await page.waitForFunction(() => window.__avatarMetrics().sprites > 0)
  // design.md §13.3 (tasks.md slice 15): the always-on prefetch is REMOVED, so `playKey`
  // itself is what starts the real per-key load — this now measures the GENUINE cold-load cost
  // (previously the prefetch had already warmed the pack by this point, making "cold" a
  // misnomer; a disclosed, positive correction, not a regression this slice caused).
  await page.evaluate(
    ({ socketId }) => {
      window.__avatarMetricsControls.markActionColdStart()
      window.__avatarHarness.playKey(socketId, 'llorar')
    },
    { socketId }
  )
  await page.waitForFunction(
    (id) => window.game.scene.getScenes(true)[0].users[id].spriteAvatar._atlasKeys.actions.has('down_llorar'),
    socketId
  )
  await page.evaluate(() => window.__avatarMetricsControls.markActionColdEnd())
  const state = await page.evaluate(
    ({ socketId }) => window.__avatarHarness.readState(socketId),
    { socketId }
  )
  expect(state.body.sequenceKey).toBe('down_llorar')

  const metrics = await page.evaluate(() => window.__avatarMetrics())
  expect(typeof metrics.timeToPlayCold).toBe('number')
  expect(metrics.timeToPlayCold).toBeGreaterThanOrEqual(0)

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'parity-time-to-play-cold.json'),
    JSON.stringify({ scene: '1 avatar, cold llorar trigger, rasta, raster path', metrics }, null, 2)
  )
})
