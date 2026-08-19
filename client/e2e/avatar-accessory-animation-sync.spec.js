import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

// Live-reported defect (user, 2026-08-19 in Spanish): "cuando yo camino hacia adelante el gorro
// durante la animación desaparece por alguna razon y vuelve a aparecer lo mismo pasa con la
// mascota hay veses que desaparece o hace movimientos raros" — walking forward, the hat
// disappears mid-animation and reappears; the pet does the same, and sometimes moves oddly.
//
// The gap this file closes: every PRE-EXISTING assertion in avatar-resolved-state.spec.js reads
// state after `setDirection`/`playKey` and checks exactly ONE frame (frame 0, or whichever frame
// happens to be current) — an accessory that vanishes on frame 7 of a 13-frame walk cycle is
// invisible to a test that only ever samples frame 0. This file drives `window.__avatarHarness`
// through EVERY frame of an animation (`advance()` once per frame, `readState()` after each
// call) and asserts the hat/pet stay resolved and correctly placed for the WHOLE cycle, not just
// its first frame.
//
// Root cause found (fallback.js's `resolveAccessoryFrameId` docblock has the full account, with
// the real compiled-data evidence): `LayeredAvatar._updateAccessory` indexed the ACCESSORY's own
// `anims[key].frames` array directly with the BODY's current `_seqIndex`, with no bounds check.
// `compile-accessory.cjs` derives an accessory's frame array from its OWN authored source data,
// entirely independent of the body's frame count for the same key — a roster-wide scan (540
// compiled packages across the 15 accessory-bearing characters, `apply-progress.md` has the full
// table) found 7,986 of 22,104 checked (character, package, key) triples where the two lengths
// differ, several thousand of them with the accessory SHORTER than the body (e.g. rasta's own
// `pet09`: `down_llorar` has 2 frames vs the body's 39). Once the body's index ran past the
// accessory's own last frame, the lookup returned `undefined` and the accessory hid for the rest
// of that animation — reappearing only once the sequence looped back into range.
//
// Scope, stated honestly (not assumed): the SPECIFIC `down_walk`/`left_walk`/`up_walk`/
// `leftdown_walk`/`leftup_walk` family the user named has ZERO such shortfalls across the WHOLE
// compiled roster today (verified: 2,700 checked walk-family (package, key) pairs, 0 mismatches)
// — so a pure straight walk cycle does not currently reproduce this exact mechanism with
// currently compiled data. The mechanism itself is real, current, and reproduces for many other
// action/emote keys that fire WHILE a player is walking (most plausibly `*_talk` — a chat bubble
// triggered mid-movement, 150/540 packages affected for `down_talk` alone — which a player would
// reasonably describe as "during walking"). This file therefore covers BOTH: the reported
// walk-family directions (proving they stay safe, and stay safe after the fix) and the keys
// that DO exhibit the real defect (`down_llorar`, `down_trampa`), so the new assertion is proven
// to catch the actual bug class, not just re-confirm what already worked.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS_ROOT = path.join(__dirname, '../src/assets/game')

function loadBodyManifest(character) {
  return JSON.parse(
    fs.readFileSync(
      path.join(ASSETS_ROOT, `avatars/${character}/layers/${character}.layers.manifest.json`),
      'utf8'
    )
  )
}

function loadAccessoryManifest(character, kind, key) {
  return JSON.parse(
    fs.readFileSync(
      path.join(ASSETS_ROOT, `accessories/${kind}/${character}/${key}/${key}.accessory.json`),
      'utf8'
    )
  )
}

// The body's OWN frame count/fps for a key — the ground truth for how many frames the harness
// must walk through and how fast, exactly what `LayeredAvatar.tick()` drives from at runtime.
function bodySequenceMeta(bodyManifest, key) {
  const seq = bodyManifest.sequences[key]
  if (!seq) throw new Error(`avatar-accessory-animation-sync: body has no sequence "${key}"`)
  return { frameCount: seq.frames.length, fps: seq.fps }
}

let socketCounter = 0

test.describe('accessory frame-by-frame sync across a full animation cycle (live-reported defect)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html')
    await page.waitForFunction(() => !!window.__avatarHarness)
  })

  async function spawnCharacter(page, avatarId, opts = {}) {
    const socketId = `accsync_${Date.now()}_${socketCounter++}`
    await page.evaluate(
      ({ socketId, avatarId, opts }) => window.__avatarHarness.spawnAvatar({ socketId, avatarId, ...opts }),
      { socketId, avatarId, opts }
    )
    return socketId
  }

  /**
   * Drives the harness through EVERY frame of `key` (frame 0 through `frameCount - 1`, in
   * order — the exact traversal `LayeredAvatar.tick()` performs at runtime) and returns one
   * observation per frame for each accessory kind present. This is the "walks every frame"
   * primitive the whole file is built on: no assertion in this file ever reads state after
   * only the first frame.
   */
  async function walkFullAnimation(page, socketId, key, frameCount, fps) {
    const frameDuration = 1000 / fps
    const observations = []

    const first = await page.evaluate(
      ({ socketId, key }) => {
        window.__avatarHarness.playKey(socketId, key)
        return window.__avatarHarness.readState(socketId)
      },
      { socketId, key }
    )
    observations.push(first)

    for (let i = 1; i < frameCount; i++) {
      const state = await page.evaluate(
        ({ socketId, frameDuration }) => {
          window.__avatarHarness.advance(frameDuration)
          return window.__avatarHarness.readState(socketId)
        },
        { socketId, frameDuration }
      )
      observations.push(state)
    }

    return observations
  }

  function accessoryViolations(observations, kind) {
    const violations = []
    observations.forEach((state, frameIndex) => {
      const acc = state.children.find((c) => c.kind === kind)
      if (!acc) return
      if (acc.visible !== true) {
        violations.push(`frame ${frameIndex}: ${kind}.visible === false (disappeared)`)
        return
      }
      if (!Number.isFinite(acc.x) || !Number.isFinite(acc.y)) {
        violations.push(`frame ${frameIndex}: ${kind} position not finite (x=${acc.x}, y=${acc.y})`)
      }
    })
    return violations
  }

  // tasks.md-style walk-family key map — mirrors UserWalkAnimation.getTextureKey (client/src/
  // phaser/animations/UserWalkAnimation.js), the REAL production caller for movement. The
  // right-family keys are synthesized mirrors of their left-family counterpart (design.md §3.1
  // step 5); the body's own frame count/fps for a mirrored key is read from its `from` source,
  // since that is the sequence that actually plays.
  const WALK_KEY_BY_DIRECTION = {
    down: { key: 'down_walk', sourceKey: 'down_walk' },
    downright: { key: 'rightdown_walk', sourceKey: 'leftdown_walk' },
    right: { key: 'right_walk', sourceKey: 'left_walk' },
    upright: { key: 'rightup_walk', sourceKey: 'leftup_walk' },
    up: { key: 'up_walk', sourceKey: 'up_walk' },
    upleft: { key: 'leftup_walk', sourceKey: 'leftup_walk' },
    left: { key: 'left_walk', sourceKey: 'left_walk' },
    downleft: { key: 'leftdown_walk', sourceKey: 'leftdown_walk' },
  }

  test.describe('rasta + minnieHat (hat) + pet09 (pet) — the exact reported combo', () => {
    const bodyManifest = loadBodyManifest('rasta')

    for (const [direction, { key, sourceKey }] of Object.entries(WALK_KEY_BY_DIRECTION)) {
      test(`walking "${direction}" (${key}): hat and pet stay resolved and correctly placed across the full ${sourceKey} cycle`, async ({
        page,
      }) => {
        const { frameCount, fps } = bodySequenceMeta(bodyManifest, sourceKey)
        const socketId = await spawnCharacter(page, 12, { accessories: { hat: 'minnieHat', pet: 'pet09' } })

        const observations = await walkFullAnimation(page, socketId, key, frameCount, fps)

        expect(observations.length, 'every frame of the cycle was observed').toBe(frameCount)
        expect(accessoryViolations(observations, 'hat')).toEqual([])
        expect(accessoryViolations(observations, 'pet')).toEqual([])
      })
    }

    // The actual defect class, proven with the exact data that exhibits it: pet09's own
    // `down_llorar` has 2 authored frames against the body's 39 (fallback.js's
    // `resolveAccessoryFrameId` docblock). Before the fix this test failed with "disappeared" at
    // frame 2 and every frame after; minnieHat's own `down_llorar` has all 39 frames (a genuine
    // match), so the hat side of this same test is the built-in negative control proving the
    // helper does not just always pass.
    test('down_llorar (crying, mid-action, action-pack-backed): pet09 stays visible for the FULL 39-frame body cycle despite having only 2 authored frames; minnieHat (39/39, a real match) stays visible too', async ({
      page,
    }) => {
      const { frameCount, fps } = bodySequenceMeta(bodyManifest, 'down_llorar')
      const socketId = await spawnCharacter(page, 12, { accessories: { hat: 'minnieHat', pet: 'pet09' } })
      await page.evaluate((socketId) => window.__avatarHarness.preloadActionPacks(socketId), socketId)

      const observations = await walkFullAnimation(page, socketId, 'down_llorar', frameCount, fps)

      expect(frameCount, "sanity: the body's own down_llorar is really 39 frames").toBe(39)
      expect(observations.length).toBe(39)
      expect(accessoryViolations(observations, 'hat')).toEqual([])
      expect(accessoryViolations(observations, 'pet')).toEqual([])

      // "correctly placed", not merely visible: once the body's index runs past the accessory's
      // own last authored frame, the accessory must keep showing THAT SAME authored frame
      // (texture identity, `frameName`) — never jump to an unrelated pose (the user's second
      // symptom, "hace movimientos raros"). pet09's down_llorar frames are [2, 2] (2 authored
      // frames, both frame id "2") — from body seqIndex 1 onward the pet's resolved frame must
      // stay "2", all the way to frame 38. (x/y are asserted finite by `accessoryViolations`
      // above, not pinned to an exact value here: the body's OWN frame origin legitimately
      // shifts across `down_llorar`'s 39 poses even while the pet's own sprite is held, and the
      // pet's placement correctly tracks that moving anchor — a real, intended behaviour, not
      // the defect this test exists to catch.)
      const petFrameNames = observations.map((s) => s.children.find((c) => c.kind === 'pet').frameName)
      const held = petFrameNames[1]
      expect(held, 'sanity: pet09 down_llorar frame 1 is frame id "2"').toBe('2')
      for (let i = 2; i < petFrameNames.length; i++) {
        expect(petFrameNames[i], `frame ${i} pet frameName vs. the held frame-1 frameName`).toBe(held)
      }
    })

    // A second real, distinct mismatch shape (design's own leading hypothesis, generalized):
    // boomer/pet01's down_trampa is 11 authored frames vs the body's 50 and its own tail is NOT
    // a repeated frame ([...,45,46,47,48]) — proving clamp-to-last (not modulo/cycle-to-0) is
    // what actually fires for a real "ends on a moving pose" package, not just the degenerate
    // "both entries are the same id" case above. Covered for `boomer` specifically (not rasta,
    // which has no such asymmetric-tail mismatch on this key) to keep the assertion honest about
    // which character's real data it is exercising.
    test('boomer + pet01, down_trampa: pet holds its own last DISTINCT frame (48), never jumps back to frame 8', async ({
      page,
    }) => {
      const boomerManifest = loadBodyManifest('boomer')
      const { frameCount, fps } = bodySequenceMeta(boomerManifest, 'down_trampa')
      const petManifest = loadAccessoryManifest('boomer', 'pet', 'pet01')
      const petFrames = petManifest.anims.down_trampa.frames

      const socketId = await spawnCharacter(page, 1, { accessories: { pet: 'pet01' } })
      await page.evaluate((socketId) => window.__avatarHarness.preloadActionPacks(socketId), socketId)

      const observations = await walkFullAnimation(page, socketId, 'down_trampa', frameCount, fps)

      expect(accessoryViolations(observations, 'pet')).toEqual([])

      const lastAuthoredFrameId = petFrames[petFrames.length - 1]
      expect(lastAuthoredFrameId, 'sanity: boomer/pet01 down_trampa really ends on frame 48').toBe(48)

      const petFrameNames = observations.map((s) => s.children.find((c) => c.kind === 'pet').frameName)
      // Every frame from the accessory's own last authored index onward must show that SAME
      // frame name — never the array's own frame 0 (`String(petFrames[0])`), which is what a
      // modulo/cycle strategy would have shown instead.
      for (let i = petFrames.length - 1; i < petFrameNames.length; i++) {
        expect(petFrameNames[i], `frame ${i}`).toBe(String(lastAuthoredFrameId))
      }
    })
  })
})

// Second live-reported symptom, same code area, corrected wording (2026-08-19): "cuando me
// pegan la animacion el pet tambien se mueve de posicion" — the pet shifts position while the
// LOCAL player is on the receiving end of a punch. Root cause, proven live against a real
// Docker-built session (God/rasta/minnieHat/pet09, the real `leftdown_punch_rec` 400-frame
// pack): `UserUppercutAnimation.launchUpwards` (client/src/phaser/animations/
// UserUppercutAnimation.js) tweens `spriteAvatar.y` DIRECTLY — the LayeredAvatar Container's
// OWN transform — to fly the body upward on knockback. The body's pooled pieces are real
// Phaser children of that Container, so they move with it automatically. The hat/pet sprites
// are NOT children of the LayeredAvatar Container — they are siblings, parented directly to
// `containerUser` (AddUserController.createContainerUser) — and `resolveAccessoryPlacement`'s
// `x`/`y` were computed ONLY from the body's per-frame origin, with no term for wherever the
// Container's own transform currently sits. Live numeric trace (captured before the fix):
// stepping `spriteAvatar.y` from 0 to -1000 across 5 `tick()` calls left every recomputed hat/
// pet `x`/`y` bit-for-bit IDENTICAL while the body visually flew 1000px away from them.
//
// Why avatar-resolved-state.spec.js's R1-R13 and this file's OWN per-frame walk did not catch
// this: every existing assertion drives the animation CLOCK only (`advance(ms)`/`tick()`) —
// nothing in the harness (until this fix) ever moved the LayeredAvatar Container's OWN `x`/`y`
// away from `(0, 0)`, which is the ONE thing `UserUppercutAnimation.launchUpwards` does that no
// prior test exercised. `setBodyContainerOffset` (avatarHarnessApi.js, added alongside this
// test) mirrors that real production mutation exactly, deterministically, without racing an
// 800ms Phaser tween.
test.describe('accessory tracks the body Container transform during a punch-received knockback (live-reported defect)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html')
    await page.waitForFunction(() => !!window.__avatarHarness)
  })

  test('hat and pet track spriteAvatar.y exactly as the body Container is offset (the launchUpwards mutation, replayed deterministically)', async ({
    page,
  }) => {
    const socketId = `punchsync_${Date.now()}`
    await page.evaluate(
      ({ socketId }) =>
        window.__avatarHarness.spawnAvatar({ socketId, avatarId: 12, accessories: { hat: 'minnieHat', pet: 'pet09' } }),
      { socketId }
    )
    await page.evaluate((socketId) => window.__avatarHarness.preloadActionPacks(socketId), socketId)

    const before = await page.evaluate(
      ({ socketId }) => {
        window.__avatarHarness.playKey(socketId, 'leftdown_punch_rec')
        window.__avatarHarness.advance(50) // a few frames in, matching the live reproduction
        window.__avatarHarness.advance(50)
        return window.__avatarHarness.readState(socketId)
      },
      { socketId }
    )
    const beforeHat = before.children.find((c) => c.kind === 'hat')
    const beforePet = before.children.find((c) => c.kind === 'pet')
    expect(beforeHat.visible, 'sanity: hat resolved before the launch').toBe(true)
    expect(beforePet.visible, 'sanity: pet resolved before the launch').toBe(true)

    // Replays EXACTLY what UserUppercutAnimation.launchUpwards does to spriteAvatar.y — a real
    // production mutation, not a harness fabrication — in 5 deterministic steps instead of one
    // live 800ms tween.
    const totalUp = 1000 // matches the live reproduction's own probed magnitude
    for (let i = 1; i <= 5; i++) {
      const offsetY = -totalUp * (i / 5)
      const state = await page.evaluate(
        ({ socketId, offsetY }) => {
          window.__avatarHarness.setBodyContainerOffset(socketId, 0, offsetY)
          window.__avatarHarness.advance(50)
          return window.__avatarHarness.readState(socketId)
        },
        { socketId, offsetY }
      )
      const hat = state.children.find((c) => c.kind === 'hat')
      const pet = state.children.find((c) => c.kind === 'pet')

      expect(hat.visible, `step ${i}: hat still resolved`).toBe(true)
      expect(pet.visible, `step ${i}: pet still resolved`).toBe(true)

      // The actual assertion this defect needed: the accessory's own y must track the body
      // Container's offset EXACTLY (within floating-point tolerance) — before the fix, hat.y/
      // pet.y stayed frozen at their pre-launch value regardless of offsetY.
      expect(hat.y, `step ${i}: hat.y tracks the body offset`).toBeCloseTo(beforeHat.y + offsetY, 5)
      expect(pet.y, `step ${i}: pet.y tracks the body offset`).toBeCloseTo(beforePet.y + offsetY, 5)
      // x is untouched by this specific knockback (only y is tweened in production) — pinned
      // to its pre-launch value as a negative control, proving the fix does not just move
      // both axes unconditionally.
      expect(hat.x, `step ${i}: hat.x unaffected (only y is offset in this knockback)`).toBeCloseTo(beforeHat.x, 5)
      expect(pet.x, `step ${i}: pet.x unaffected (only y is offset in this knockback)`).toBeCloseTo(beforePet.x, 5)
    }
  })
})
