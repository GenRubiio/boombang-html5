import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { buildContactSheet } from './lib/buildAvatarContactSheet.js'

// tasks.md slice 21 task 8: "at least one validation pass must drive the real game scene, not
// only client/harness.html + avatarHarnessApi.js" — `avatar-resolved-state.spec.js` and
// `avatar-contact-sheet.spec.js` both drive `AvatarHarnessScene`, a synthetic measurement scene
// (design.md §14 cost 19's own named gap: "a defect living purely in scene setup stays outside
// its reach"). This file drives the REAL `PublicScene` class instead —
// `client/real-scene-harness.html` -> `client/src/harness/realSceneMain.js` — through its own
// real `create()` lifecycle (TintManager, PublicSceneLoader, AvatarSystemController.init, the
// real DOM button overlay) rather than `AvatarHarnessScene`'s bespoke stand-in.
//
// Honestly disclosed scope: the scene-init data (`RealSceneHarnessData.js`) is fabricated, not a
// real server response — there is still no socket/server/login dependency, matching the
// harness's own stated cost. What IS real here, and is NOT real in `AvatarHarnessScene`, is the
// `PublicScene` class itself and everything its own `create()` method does before a single
// avatar is ever spawned — the SAME `AddUserController.processUser` call both harnesses already
// share is not the distinguishing factor; the surrounding scene is.
//
// Correction 1 (apply-progress.md, 2026-08-18): tasks.md slice 21 task 8 stated "rasta only, as
// the representative sample" and left every later migration slice harness-only. The standing
// instruction is at least one character PER BATCH validated through this real scene, not only
// `rasta` forever. This slice closes that specific gap (not yet extended per-batch) by adding a
// representative sample across the existing 16-character roster: `rasta` (unchanged, the
// original slice-21 case), `brujita` (an ordinary body-batch-1 character, no accessories),
// `ninja` and `werewolf` (the zero-declared-palette roster shape, body-batch-3, both real
// piece-referenced `manifest.slots` per Correction 2 above). `describeRealSceneCharacter` is the
// reusable generator — every future accessory batch (28-31) should call it for its own
// per-batch representative sample, per the now-restated per-batch rule.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTACT_SHEETS_DIR = path.join(__dirname, 'artifacts', 'contact-sheets')

const DIRECTIONS = ['down', 'downright', 'right', 'upright', 'up', 'upleft', 'left', 'downleft']
const MIRROR_OF = {
  down: 'down',
  up: 'up',
  left: 'right',
  right: 'left',
  downleft: 'downright',
  downright: 'downleft',
  upleft: 'upright',
  upright: 'upleft',
}
const CENTER_X_TOL = 0.5
const CRY_EMOJI_ID = 3 // AvatarEmojisEnum.CRY -> "llorar" (universal across characters, fact K)

let realSocketCounter = 0

/**
 * Generates the real-`PublicScene` validation block for one character (Correction 1). Mirrors
 * `avatar-resolved-state.spec.js`'s `describeCharacterMatrix` R1/R2/R5/R6 shape, scoped to what
 * this file already covered for `rasta` pre-refactor — this is a REFACTOR of that original
 * hardcoded-`rasta` spec (approval-tested: `rasta`'s own 4 tests below must keep their identical
 * pass outcome), not new assertion logic.
 *
 * @param {string} character
 * @param {number} avatarId
 * @param {object} [options]
 * @param {string|null} [options.hatKey] a compiled hat key this character owns, or null.
 * @param {string|null} [options.petKey] a compiled pet key this character owns, or null.
 * @param {string|null} [options.auraKey] a compiled aura key, or null.
 * @param {string} [options.actionKey] defaults to `'llorar'`, mirroring
 *   `describeCharacterMatrix`'s own default — every character passed to this generator so far
 *   has a real baked-config `'llorar'` alias (rasta, brujita, ninja, werewolf all resolve it to
 *   `down_llorar`, verified against `avatar-contact-sheet.spec.js`'s own per-character config).
 * @param {string} [options.resolvedActionKey] defaults to `'down_llorar'`.
 * @param {string|null} [options.actionPaletteSlot] a real `manifest.slots` entry to override in
 *   the captured action cell (Correction 2, apply-progress.md, 2026-08-18: present in
 *   `manifest.slots` is the correct membership check, not `manifest.defaults`) — `null` only for
 *   a character with genuinely zero declared/piece-referenced slots (none passed to this
 *   generator so far; every one of rasta/brujita/ninja/werewolf has a real `color1`).
 * @param {string} [options.actionPaletteColor] the override colour, paired with
 *   `actionPaletteSlot`.
 */
function describeRealSceneCharacter(
  character,
  avatarId,
  {
    hatKey = null,
    petKey = null,
    auraKey = null,
    actionKey = 'llorar',
    resolvedActionKey = 'down_llorar',
    actionPaletteSlot = 'color1',
    actionPaletteColor = '#ff00ff',
  } = {}
) {
  test.describe(`${character} (real PublicScene)`, () => {
    async function spawn(page, opts = {}) {
      const socketId = `real_${character}_${Date.now()}_${realSocketCounter++}`
      await page.evaluate(
        ({ socketId, avatarId, opts }) =>
          window.__avatarHarness.spawnAvatar({ socketId, avatarId, ...opts }),
        { socketId, avatarId, opts }
      )
      return socketId
    }

    async function readAfterDirection(page, socketId, direction) {
      return page.evaluate(
        ({ socketId, direction }) => {
          window.__avatarHarness.setDirection(socketId, direction)
          return window.__avatarHarness.readState(socketId)
        },
        { socketId, direction }
      )
    }

    test(`R1/R2-equivalent: ${character} resolves the same container child order and depths in the REAL scene as in the harness-only matrix`, async ({
      page,
    }) => {
      const socketId = await spawn(page, {
        accessories: { hat: hatKey ?? undefined, pet: petKey ?? undefined, aura: auraKey ?? undefined },
      })

      const expectedKinds = ['shadow']
      if (petKey) expectedKinds.push('pet')
      expectedKinds.push('body')
      if (hatKey) expectedKinds.push('hat')
      if (auraKey) expectedKinds.push('aura')
      expectedKinds.push('nameBackground', 'nameText')

      for (const direction of DIRECTIONS) {
        const state = await readAfterDirection(page, socketId, direction)
        const kinds = state.children.map((c) => c.kind)
        expect(kinds, `direction ${direction}`).toEqual(expectedKinds)

        if (auraKey) {
          const byKind = Object.fromEntries(state.children.map((c) => [c.kind, c]))
          expect(byKind.aura.depth, `direction ${direction}`).toBeGreaterThan(byKind.body.depth)
          if (hatKey) expect(byKind.aura.depth, `direction ${direction}`).toBeGreaterThan(byKind.hat.depth)
        }
      }
    })

    test(`R5-equivalent: shadow stays at the local origin and body centre-X is mirror-antisymmetric for ${character} in the REAL scene`, async ({
      page,
    }) => {
      const socketId = await spawn(page)

      const centerXByDirection = {}
      for (const direction of DIRECTIONS) {
        const state = await readAfterDirection(page, socketId, direction)
        const shadow = state.children.find((c) => c.kind === 'shadow')
        expect(shadow.x, `direction ${direction}`).toBe(0)
        expect(shadow.y, `direction ${direction}`).toBe(0)
        centerXByDirection[direction] = state.body.visibleBounds.centerX
      }

      // Live-caught while extending this file past `rasta` (Correction 1): `down`/`up` map to
      // THEMSELVES in `MIRROR_OF` (no left-right counterpart exists to flip against) — asserting
      // `centerX(down) + centerX(down) <= tolerance` is not a mirror-mechanism check, it is a
      // check that `down_idle`'s own art happens to be left-right-symmetric, which rasta
      // incidentally is but `brujita`/`ninja`/`werewolf` are not (confirmed live: this loop
      // failed for all three before this exclusion, matching `avatar-resolved-state.spec.js`'s
      // own slice-24 fix for the identical defect in the harness-only R5-mirror test — the same
      // fix, applied here for the same reason once real, non-rasta character data existed to
      // surface it).
      for (const direction of DIRECTIONS) {
        const mirror = MIRROR_OF[direction]
        if (mirror === direction) continue
        const sum = centerXByDirection[direction] + centerXByDirection[mirror]
        expect(Math.abs(sum), `direction ${direction} + ${mirror}`).toBeLessThanOrEqual(CENTER_X_TOL)
      }
    })

    test(`R6-equivalent: llorar plays for ${character} in the REAL scene, not only the harness`, async ({
      page,
    }) => {
      const socketId = await spawn(page)
      await page.evaluate(({ socketId }) => window.__avatarHarness.setDirection(socketId, 'down'), {
        socketId,
      })
      await page.evaluate(
        ({ socketId, cryEmojiId }) => window.__avatarHarness.playAction(socketId, cryEmojiId),
        { socketId, cryEmojiId: CRY_EMOJI_ID }
      )
      await page.waitForFunction(
        ({ id, key }) =>
          window.game.scene.getScene('PublicScene').users[id].spriteAvatar._atlasKeys.actions.has(key),
        { id: socketId, key: resolvedActionKey }
      )
      const resolvedSeqKey = await page.evaluate(
        ({ socketId }) => window.__avatarHarness.readState(socketId).body.sequenceKey,
        { socketId }
      )
      expect(resolvedSeqKey).toBe(resolvedActionKey)
    })

    test(`captures the SAME idle/hat/pet/aura/action evidence for ${character} in the REAL scene, not just one screenshot (tasks.md slice 21 task 8, Correction 1)`, async ({
      page,
    }) => {
      const result = await buildContactSheet(
        page,
        {
          character,
          avatarId,
          hatKey: hatKey ?? undefined,
          petKey: petKey ?? undefined,
          auraKey: auraKey ?? undefined,
          actionKey,
          resolvedActionKey,
          actionPaletteSlot: actionPaletteSlot ?? undefined,
          actionPaletteColor,
        },
        { outputDir: CONTACT_SHEETS_DIR, outputFileName: `${character}-real-scene` }
      )

      const outputPath = path.join(CONTACT_SHEETS_DIR, `${character}-real-scene.png`)
      const stat = fs.statSync(outputPath)
      test.info().annotations.push({
        type: 'real-scene-contact-sheet',
        description: `${character} (real PublicScene, not harness-only): rows captured = ${result.rowsCaptured.join(', ')}, ${stat.size} bytes at ${outputPath}`,
      })
      if (stat.size <= 0) {
        throw new Error(`${character}-real-scene.png was written empty`)
      }
    })
  })
}

test.describe('real game scene (PublicScene), not harness-only (tasks.md slice 21 task 8)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/real-scene-harness.html')
    await page.waitForFunction(() => !!window.__realSceneHarnessReady && !!window.__avatarHarness)
  })

  test('the real PublicScene reaches isSceneReady and exposes the SAME harness API surface as AvatarHarnessScene', async ({
    page,
  }) => {
    const state = await page.evaluate(() => ({
      isSceneReady: window.game.scene.getScene('PublicScene').isSceneReady,
      sceneKey: window.game.scene.getScene('PublicScene').sys.settings.key,
      hasSpawnAvatar: typeof window.__avatarHarness.spawnAvatar === 'function',
    }))
    expect(state.isSceneReady).toBe(true)
    expect(state.sceneKey).toBe('PublicScene')
    expect(state.hasSpawnAvatar).toBe(true)
  })

  // Original slice-21 case, unchanged behaviour (approval-tested by this refactor: same 4
  // per-character tests below, same accessory config, same expected outcomes as before
  // `describeRealSceneCharacter` existed as a named, reusable generator).
  describeRealSceneCharacter('rasta', 12, {
    hatKey: 'minnieHat',
    petKey: 'pet09',
    auraKey: 'auraElectrica',
  })

  // Correction 1's representative sample: an ordinary batch-1 character with no accessories
  // compiled yet (slice 28 owns brujita's own accessory completeness check).
  describeRealSceneCharacter('brujita', 2)

  // Correction 1's representative sample: the zero-declared-palette roster shape (Correction 2
  // above establishes both have real `manifest.slots` despite an empty vector colormeta).
  describeRealSceneCharacter('ninja', 11)
  describeRealSceneCharacter('werewolf', 14)
})
