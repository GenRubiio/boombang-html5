import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { computeContactSheetLayout, renderContactSheetLabelsSvg } from '../../scripts/lib/contactSheetLayout.cjs'

// tasks.md slice 21 task 5/6/7/8: shared I/O-shell capture logic behind both
// `avatar-contact-sheet.spec.js` (harness-only, every migrated character) and
// `avatar-real-scene.spec.js` (the REAL `PublicScene` class, `rasta` as the representative
// sample — tasks.md slice 21 task 8). Both callers drive the SAME `window.__avatarHarness` API
// surface (`createAvatarHarnessApi`, shared by `harness.html` and `real-scene-harness.html`), so
// this module needs no knowledge of which scene class is actually hosting the avatar.

export const DIRECTIONS = ['down', 'downright', 'right', 'upright', 'up', 'upleft', 'left', 'downleft']

// Empirically measured (playwright-cli, live harness, tasks.md slice 21): with the avatar spawned
// at tile position {x: 5, y: 5} (design.md's isometric formula in MoveUserToTileController —
// {x, y} equal keeps `centerX` unshifted at `scale.width/2`, while `centerX + centerY` grows,
// pushing the avatar down into the canvas's visible area; the harness has no tile grid to anchor
// against otherwise, and a {x:0, y:0} spawn renders with its feet at the very top edge of the
// canvas — confirmed live, entirely off-screen), this page-space rectangle contains the body,
// shadow, a worn hat, a worn pet and the aura effect for `rasta` with margin to spare, in BOTH
// the harness-only scene and the real `PublicScene` (confirmed live in both — the two scenes
// place a freshly spawned avatar at the identical `container.x`/`container.y`/`depth`, since both
// go through the same `MoveUserToTileController`). Per-character overrides can be added here
// once a taller/wider migrated character needs one — none has, since only `rasta` is migrated
// today.
export const SPAWN_TILE_POS = { x: 5, y: 5 }
export const DEFAULT_CLIP = { x: 300, y: 0, width: 420, height: 400 }

const CELL_WIDTH = 180
const CELL_HEIGHT = 170

let socketCounter = 0

async function spawnForCapture(page, avatarId, opts) {
  const socketId = `sheet_${Date.now()}_${socketCounter++}`
  await page.evaluate(
    ({ socketId, avatarId, opts }) =>
      window.__avatarHarness.spawnAvatar({ socketId, avatarId, ...opts }),
    // tasks.md slice 21 defect-2 fix (coordinator-flagged): the socket-id name-tag bubble sat
    // directly over the avatar's head in every captured cell. `showUsername: false` is the
    // spawn-level suppression `spawnAvatarUser.js` now supports; `opts` is spread AFTER it so a
    // future caller could still explicitly opt back in without needing a second code path.
    { socketId, avatarId, opts: { showUsername: false, ...opts, ...SPAWN_TILE_POS } }
  )
  return socketId
}

async function captureDirection(page, socketId, direction, { advanceMs = 0 } = {}) {
  await page.evaluate(
    ({ socketId, direction }) => window.__avatarHarness.setDirection(socketId, direction),
    { socketId, direction }
  )
  if (advanceMs > 0) {
    await page.evaluate(({ socketId, advanceMs }) => window.__avatarHarness.advance(advanceMs), {
      socketId,
      advanceMs,
    })
  }
  // A freshly (re-)directed avatar needs at least one real Phaser render pass before its new
  // frame is actually painted to the canvas — `readState` reads resolved LOGICAL state
  // (position/depth/tint) with no such wait anywhere else in this apply pass because it never
  // needed a painted pixel; this is the first place that does. Confirmed live: without this
  // wait, the very first screenshot after a direction change raced ahead of the canvas's first
  // paint and captured a stale (or, before the "one avatar per row" fix below, an accumulated
  // overlapping-avatar) frame.
  await page.waitForTimeout(100)
  return page.screenshot({ clip: DEFAULT_CLIP })
}

/**
 * Spawns exactly ONE avatar for the whole row and cycles it through all 8 directions — the SAME
 * "spawn once, vary direction" pattern `avatar-resolved-state.spec.js`'s `readAfterDirection`
 * already uses. Live-caught bug this replaces (tasks.md slice 21): an earlier version spawned a
 * FRESH avatar per direction without ever removing the previous one, so by the second row every
 * screenshot showed 8+ accumulated, overlapping avatars stacked at the same screen position —
 * confirmed live via the first real contact sheet, which showed the wrong (stale/mixed) pose in
 * most cells once more than 8 avatars had ever been spawned into the scene.
 */
async function despawn(page, socketId) {
  await page.evaluate((socketId) => window.__avatarHarness.despawnAvatar(socketId), socketId)
}

/**
 * Live-caught defect (tasks.md slices 28-31, apply-progress.md): every row used to spawn a NEW
 * avatar without ever removing the PREVIOUS row's — by the aura/action row, up to 4 avatars sat
 * stacked at the identical tile position, and a later screenshot could show an EARLIER row's
 * accessory bleeding through underneath (confirmed live: `ninja`'s "pet" row screenshot showed
 * the "hat" row's still-alive `minnieHat` visible around its own small black body). Each row now
 * despawns its own avatar via the real `RemoveUserController` path before returning, so at most
 * ONE avatar is ever alive in the scene at any point during a capture.
 */
async function captureDirectionRow(page, avatarId, opts) {
  const socketId = await spawnForCapture(page, avatarId, opts)
  const buffers = {}
  for (const direction of DIRECTIONS) {
    buffers[direction] = await captureDirection(page, socketId, direction)
  }
  await despawn(page, socketId)
  return buffers
}

/**
 * Builds one character's full contact sheet (idle/hat/pet/aura/action) and writes it to
 * `<outputDir>/<outputFileName ?? character>.png`. `page` must already be on a harness page
 * exposing `window.__avatarHarness` (either `harness.html` or `real-scene-harness.html` — this
 * function does not care which).
 *
 * @returns {Promise<{rowsCaptured: string[]}>}
 */
export async function buildContactSheet(page, config, { outputDir, outputFileName } = {}) {
  const {
    character,
    avatarId,
    hatKey,
    petKey,
    auraKey,
    actionPaletteSlot,
    actionPaletteColor,
    // tasks.md slice 22 (apply-progress.md): a character compiled with no baked-config
    // precedent (sally) has NO 'llorar' alias — see avatar-resolved-state.spec.js's
    // `actionKey`/`resolvedActionKey` params for the full explanation, mirrored here so the
    // contact-sheet's own action cell does not hang waiting for a pack that is never requested.
    actionKey = 'llorar',
    resolvedActionKey = 'down_llorar',
  } = config

  const rows = [{ label: 'idle', cells: DIRECTIONS }]
  const rowBuffers = { idle: await captureDirectionRow(page, avatarId, {}) }

  if (hatKey) {
    rows.push({ label: 'hat', cells: DIRECTIONS })
    rowBuffers.hat = await captureDirectionRow(page, avatarId, { accessories: { hat: hatKey } })
  }
  if (petKey) {
    rows.push({ label: 'pet', cells: DIRECTIONS })
    rowBuffers.pet = await captureDirectionRow(page, avatarId, { accessories: { pet: petKey } })
  }

  // One aura frame (aura-above-everything, visually confirmed, not only depth-asserted) and one
  // mid-action frame of down_llorar with a non-default palette (the user's originally reported
  // defect — palette survival during an action, made visible here, not only asserted via
  // slotTints in R8).
  const extraCells = []
  const extraBuffers = {}
  if (auraKey) {
    const socketId = await spawnForCapture(page, avatarId, { accessories: { aura: auraKey } })
    const buffer = await captureDirection(page, socketId, 'down', { advanceMs: 300 })
    await despawn(page, socketId)
    extraCells.push('aura')
    extraBuffers.aura = buffer
  }
  {
    const palette = actionPaletteSlot ? { [actionPaletteSlot]: actionPaletteColor } : undefined
    const socketId = await spawnForCapture(page, avatarId, { palette })
    await page.evaluate(
      ({ socketId, actionKey }) => {
        window.__avatarHarness.setDirection(socketId, 'down')
        window.__avatarHarness.playKey(socketId, actionKey)
      },
      { socketId, actionKey }
    )
    await page.waitForFunction(
      ({ id, resolvedActionKey }) =>
        window.game.scene.getScenes(true)[0].users[id].spriteAvatar._atlasKeys.actions.has(
          resolvedActionKey
        ),
      { id: socketId, resolvedActionKey }
    )
    await page.evaluate(({ socketId }) => window.__avatarHarness.advance(300), { socketId })
    await page.waitForTimeout(100) // see captureDirection's docblock — the same real-paint wait
    const buffer = await page.screenshot({ clip: DEFAULT_CLIP })
    await despawn(page, socketId)
    // A character with zero colormeta slots (sally: tasks.md slice 22) has no palette to
    // override — label honestly rather than claiming a "custom palette" that was never applied.
    const label = actionPaletteSlot ? `action (${actionKey}, custom palette)` : `action (${actionKey}, no palette slots)`
    extraCells.push(label)
    extraBuffers[label] = buffer
  }
  rows.push({ label: 'aura/action', cells: extraCells })

  const layout = computeContactSheetLayout(rows, { cellWidth: CELL_WIDTH, cellHeight: CELL_HEIGHT })
  const labelsSvg = renderContactSheetLabelsSvg(layout, character)

  const composites = []
  for (const row of layout.rows) {
    const sourceBuffers = row.label === 'aura/action' ? extraBuffers : rowBuffers[row.label]
    for (const cellEntry of row.cells) {
      const resized = await sharp(sourceBuffers[cellEntry.cell])
        .resize(layout.cellWidth, layout.cellHeight, { fit: 'cover' })
        .toBuffer()
      composites.push({ input: resized, top: cellEntry.y, left: cellEntry.x })
    }
  }
  composites.push({ input: Buffer.from(labelsSvg), top: 0, left: 0 })

  fs.mkdirSync(outputDir, { recursive: true })
  await sharp({
    create: {
      width: layout.sheetWidth,
      height: layout.sheetHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toFile(path.join(outputDir, `${outputFileName ?? character}.png`))

  return { rowsCaptured: rows.map((r) => r.label) }
}
