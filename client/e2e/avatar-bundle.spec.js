// design.md §9.2 (tasks.md slice 16 task 4): R15 — bundle-on vs bundle-off resolved-state
// equivalence for the base pack (this slice's disclosed scope: the bundler itself produces a
// `.bb` per per-key action pack too, but client-side fetch/unpack wiring for those was not
// extended to every key in this pass — see apply-progress.md).
//
// Both load paths share the SAME Phaser atlas key (`getLayeredAtlasKey` depends only on
// character, not on how the bytes were fetched), so a genuine A/B comparison within one scene
// requires explicitly clearing the texture/manifest cache between the two spawns — otherwise
// the second spawn would just silently reuse the first load's already-resident texture,
// proving nothing about the SECOND load path at all.

import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CLIENT_ROOT = path.resolve(__dirname, '..')
const RASTA_AVATAR_ID = 12

test.beforeAll(() => {
  // Ensures public/bundles/rasta.layers.bb exists and is fresh before the dev server (already
  // running via playwright.config.js's webServer) is asked to serve it.
  execFileSync('node', ['scripts/bundle-avatar-packages.cjs', 'rasta'], { cwd: CLIENT_ROOT, stdio: 'inherit' })
})

test('R15: bundle-on and bundle-off produce identical resolved state for the same character/direction', async ({ page }) => {
  await page.goto('/harness.html')
  await page.waitForFunction(() => !!window.__avatarHarness)

  const socketIdOff = 'bundle_off_1'
  await page.evaluate(
    ({ socketId, avatarId }) => {
      window.__FORCE_AVATAR_BUNDLES = false
      return window.__avatarHarness.spawnAvatar({ socketId, avatarId })
    },
    { socketId: socketIdOff, avatarId: RASTA_AVATAR_ID }
  )
  const stateOff = await page.evaluate((socketId) => {
    window.__avatarHarness.setDirection(socketId, 'down')
    return window.__avatarHarness.readState(socketId)
  }, socketIdOff)

  // Explicit teardown: both spawns share the SAME atlas key/manifest cache slot (keyed by
  // avatarId, not by load path) — without clearing these, the bundle-on spawn below would
  // silently short-circuit on the already-resident bundle-off texture and never exercise its
  // own load path at all.
  await page.evaluate(
    async ({ socketId, avatarId }) => {
      const scene = window.game.scene.getScenes(true)[0]
      const { default: avatarManager } = await import('/src/phaser/managers/AvatarManager.js')
      const atlasKey = avatarManager.getLayeredAtlasKey(avatarId)
      const user = scene.users[socketId]
      if (user && user.spriteAvatar && typeof user.spriteAvatar.destroy === 'function') {
        user.spriteAvatar.destroy()
      }
      delete scene.users[socketId]
      scene.textures.remove(atlasKey)
      avatarManager.layeredManifests.delete(avatarId)
      avatarManager.loadedAvatars.delete(avatarId)
    },
    { socketId: socketIdOff, avatarId: RASTA_AVATAR_ID }
  )

  const socketIdOn = 'bundle_on_1'
  await page.evaluate(
    ({ socketId, avatarId }) => {
      window.__FORCE_AVATAR_BUNDLES = true
      return window.__avatarHarness.spawnAvatar({ socketId, avatarId })
    },
    { socketId: socketIdOn, avatarId: RASTA_AVATAR_ID }
  )
  const stateOn = await page.evaluate((socketId) => {
    window.__avatarHarness.setDirection(socketId, 'down')
    return window.__avatarHarness.readState(socketId)
  }, socketIdOn)

  await page.evaluate(() => {
    window.__FORCE_AVATAR_BUNDLES = null
  })

  // `container` (position/depth) is identical by construction (both spawn at 0,0). The real
  // equivalence claim is about every CHILD's resolved kind/position/depth/texture/frame and
  // the body's resolved sequence state — exactly what R15 asks: bundling changes nothing
  // observable. x/y compared separately with a tolerance (float rounding), everything else
  // (kind/depth/textureKey/frameName/visible/flipX/scaleX/tint/displayWidth) exactly.
  // nameBackground/nameText's own textureKey is derived from the socket id (a per-instance
  // cosmetic name-tag texture, unrelated to the layered avatar render path this test is about)
  // — excluded so two DIFFERENT socket ids can still be compared meaningfully.
  const avatarChildrenOn = stateOn.children.filter((c) => c.kind !== 'nameBackground' && c.kind !== 'nameText')
  const avatarChildrenOff = stateOff.children.filter((c) => c.kind !== 'nameBackground' && c.kind !== 'nameText')
  expect(avatarChildrenOn).toHaveLength(avatarChildrenOff.length)
  for (let i = 0; i < avatarChildrenOff.length; i++) {
    const { x: onX, y: onY, ...onRest } = avatarChildrenOn[i]
    const { x: offX, y: offY, ...offRest } = avatarChildrenOff[i]
    expect(onRest).toEqual(offRest)
    expect(onX).toBeCloseTo(offX, 5)
    expect(onY).toBeCloseTo(offY, 5)
  }
  expect(stateOn.body).toEqual(stateOff.body)
})
