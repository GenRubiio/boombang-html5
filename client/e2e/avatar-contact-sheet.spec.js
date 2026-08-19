import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { buildContactSheet } from './lib/buildAvatarContactSheet.js'

// tasks.md slice 21 task 5/6/7: the visual contact-sheet deliverable — design.md §19 risk 8's
// gap that R1-R13/R19's numeric assertions cannot close: those pass even when the texture,
// alpha, clip or path species is wrong (three real data defects so far were all caught by
// compiler crashes, never by a resolved-state test). This file captures REAL Playwright
// screenshots per character/direction/accessory combination and assembles them into one
// per-character contact-sheet PNG, committed at `client/e2e/artifacts/contact-sheets/<char>.png`
// for human review.
//
// **These screenshots are review evidence for a human, not a pixel-baseline comparison.** No
// assertion in this file diffs a captured screenshot against a stored reference image — the
// numeric R1-R13/R19 matrix in `avatar-resolved-state.spec.js` remains the automated pass/fail
// criterion. This tooling exists only because a wall of resolved-state numbers cannot show what
// a texture, alpha channel, clip or gradient actually looks like.
//
// Per tasks.md slice 21 task 9, every migration slice from 22 through 31 must add its own
// character(s) to the `CHARACTERS` list below and report both the numeric-assertion outcome
// (avatar-resolved-state.spec.js) and this contact-sheet capture outcome per character — a
// character compiled but not yet screenshotted must be listed as such, never implied covered.
//
// This drives `harness.html` (`AvatarHarnessScene`) for every character listed — the REAL
// `PublicScene` equivalent for `rasta` lives in `avatar-real-scene.spec.js` (tasks.md slice 21
// task 8), reusing this same capture logic via `./lib/buildAvatarContactSheet.js`.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, 'artifacts', 'contact-sheets')

// tasks.md slice 21 task 9's roster list — extended by each migration slice with its own
// character(s) and that character's own compiled accessory keys.
const CHARACTERS = [
  {
    character: 'rasta',
    avatarId: 12,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    auraKey: 'auraElectrica',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
  // tasks.md slice 22: no hat/pet/aura (design.md §16, absent from the accessory roster) and no
  // palette slots at all (`colormeta.defaults` is genuinely empty) — `actionPaletteSlot`/
  // `actionPaletteColor` are omitted rather than set, and `actionKey`/`resolvedActionKey` target
  // the real `down_llorar` sequence directly (no `'llorar'` alias exists for her).
  {
    character: 'sally',
    avatarId: 18,
    actionKey: 'down_llorar',
    resolvedActionKey: 'down_llorar',
  },
  // tasks.md slice 24 — body batch 1 (design.md §15's slice 23): brujita, cholo, empollon, gata.
  // All four have a real color1 slot (verified against their own compiled manifest) and the
  // default 'llorar' alias resolves to 'down_llorar' for all four (real baked-config precedent,
  // unlike sally). Accessories (tasks.md slice 28): all 36 on-disk packages (26 hats + 10 pets)
  // compiled for each — `minnieHat`/`pet09` chosen uniformly across the whole roster (present
  // under every character, confirmed against the source dump).
  {
    character: 'brujita',
    avatarId: 2,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
  {
    character: 'cholo',
    avatarId: 3,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
  {
    character: 'empollon',
    avatarId: 4,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
  {
    character: 'gata',
    avatarId: 5,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
  // tasks.md slice 25 (design.md §15's slice 24) — body batch 2: india, lilian, marsu, modern.
  // `lilian`'s `Custom6Hat` compiling in slice 29 completes R10 pairwise (vs `rasta`'s own
  // `Custom6Hat`) — recorded via `measure-accessory-overlap.cjs` in apply-progress.md, not a
  // second contact-sheet hat choice here (kept uniform at `minnieHat` like the rest of the roster).
  {
    character: 'india',
    avatarId: 7,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
  {
    character: 'lilian',
    avatarId: 8,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
  // marsu's own 'llorar' alias resolves to `leftdown_llorar`, not `down_llorar` (verified
  // against her own compiled manifest — she has no `down_llorar` sequence at all).
  {
    character: 'marsu',
    avatarId: 9,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    actionKey: 'llorar',
    resolvedActionKey: 'leftdown_llorar',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
  {
    character: 'modern',
    avatarId: 10,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
  // tasks.md slice 26 (design.md §15's slice 25) — body batch 3: ninja, werewolf, yayo, boomer.
  // Correction 2 (apply-progress.md, 2026-08-18): an earlier pass's comment here claimed
  // ninja/werewolf have "zero palette slots" and omitted actionPaletteSlot/actionPaletteColor,
  // labelling the action cell "no palette slots" — stale. Their vector colormeta.defaults IS
  // empty, but `computeManifestSlots`'s union (slice 26 defect 2) means `manifest.slots` has
  // real piece-referenced slots for both (`color1` among them, verified against each compiled
  // manifest), which `resolvePalette` honours even with no manifest default. `actionPaletteSlot`
  // is now set for both, so the action cell correctly labels "custom palette" and visually shows
  // the override taking effect. `boomer`'s own accessories self-declare `meta.char: "bommer"`
  // (source archive name) — fixed at compile time (`resolveSourceCharName`, apply-progress.md).
  {
    character: 'ninja',
    avatarId: 11,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
  {
    character: 'werewolf',
    avatarId: 14,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
  {
    character: 'yayo',
    avatarId: 16,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
  {
    character: 'boomer',
    avatarId: 1,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
  // tasks.md slice 27 (design.md §15's slice 26) — body batch 4 (final): skeleton, zombie. Both
  // have an empty vector colormeta (same shape as ninja/werewolf). Correction 2 (apply-progress.md,
  // 2026-08-18): `manifest.slots` names real piece-referenced slots for both (`color1` among
  // them) even with an empty `defaults` dict — `actionPaletteSlot` is now set for both, matching
  // the ninja/werewolf fix above, rather than leaving the stale "no palette slots" label.
  {
    character: 'skeleton',
    avatarId: 13,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
  {
    character: 'zombie',
    avatarId: 17,
    hatKey: 'minnieHat',
    petKey: 'pet09',
    actionPaletteSlot: 'color1',
    actionPaletteColor: '#ff00ff',
  },
]

test.describe('avatar contact sheets (design.md §19 risk 8 — review evidence, not a gate)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html')
    await page.waitForFunction(() => !!window.__avatarHarness)
  })

  for (const config of CHARACTERS) {
    test(`captures and writes ${config.character}'s contact sheet`, async ({ page }) => {
      const result = await buildContactSheet(page, config, { outputDir: OUTPUT_DIR })
      const outputPath = path.join(OUTPUT_DIR, `${config.character}.png`)
      // The only assertion here is that the deliverable exists on disk with real content — this
      // is I/O-shell tooling, not a pixel-baseline gate (see the file's own top comment). A human
      // opens the PNG; nothing here diffs it against a reference image.
      const stat = fs.statSync(outputPath)
      test.info().annotations.push({
        type: 'contact-sheet',
        description: `${config.character}: rows captured = ${result.rowsCaptured.join(', ')}, ${stat.size} bytes`,
      })
      if (stat.size <= 0) {
        throw new Error(`${config.character}'s contact sheet was written empty`)
      }
    })
  }

  // Live-caught defect (tasks.md slices 28-31, apply-progress.md): each row used to spawn a new
  // avatar without removing the previous one — by the end of one character's capture, up to 4
  // avatars sat stacked at the same tile position, invisible for most characters (a later
  // avatar's own body occluded the earlier one) but visually confirmed for `ninja` (its "pet"
  // row screenshot showed the "hat" row's still-alive `minnieHat` bleeding through). Fixed via
  // `despawnAvatar` (the real `RemoveUserController` path) called at the end of every row.
  test('a full capture leaves NO avatar behind in the scene (regression: rows must not accumulate)', async ({
    page,
  }) => {
    await buildContactSheet(
      page,
      {
        character: 'zzz-despawn-regression-check',
        avatarId: 12,
        hatKey: 'minnieHat',
        petKey: 'pet09',
        auraKey: 'auraElectrica',
        actionPaletteSlot: 'color1',
        actionPaletteColor: '#ff00ff',
      },
      { outputDir: OUTPUT_DIR }
    )
    const userCount = await page.evaluate(() => Object.keys(window.game.scene.getScenes(true)[0].users).length)
    expect(userCount, 'every row must despawn its own avatar before the next spawns').toBe(0)
    fs.unlinkSync(path.join(OUTPUT_DIR, 'zzz-despawn-regression-check.png'))
  })
})
