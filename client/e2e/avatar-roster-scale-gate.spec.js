// design.md §15 (slice 31 in design's own numbering)/tasks.md slice 32: the roster-scale
// regression gate. Every prior gate (R18, slice 19/20) measured ONE character at a time —
// per-character measurements do not compose: transfer is additive per DISTINCT character on
// screen (unlike the same-character dedup slice 7/8 measured), and texture memory/page
// pressure/draw batching are roster-scale properties a single-character number cannot surface.
// This file is the first place several DIFFERENT characters are measured simultaneously, not N
// copies of one.
//
// Scope note (apply-progress.md, standing instruction): `ghost`/`wraith` remain blocked on the
// unresolved `--from-vector` base-pack question and are excluded here, same as every other slice
// since. This gate measures the roster AS IT EXISTS TODAY (16 bodies, 540 accessory packages
// across 15 characters) — it does not wait for `ghost`/`wraith` to be resolved, matching this
// slice's own task 3 wording ("however many of the 612 packages actually exist on disk").
//
// Representative roster mix: the SAME 4-character sample (`rasta`, `brujita`, `ninja`,
// `werewolf`) Correction 1 (apply-progress.md) already established and validated through the
// real `PublicScene`, plus `boomer` (the name-reconciled character, structurally distinct
// manifest shape) — 5 distinct characters on screen at once, not a new, unvetted list.

import { test, expect } from '@playwright/test'
import { execFileSync, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..', '..')
const IMAGE_TAG = 'avatar-roster-scale-gate:test'
const CONTAINER_NAME = 'avatar-roster-scale-gate-run'
const PORT = 18102
const BASE = `http://127.0.0.1:${PORT}`

const P1_BYTES_PER_SEC = 250_000 // 2 Mbps
const P2_BYTES_PER_SEC = 50_000 // Slow 3G

// character name -> AvatarEnum id (client/src/enums/AvatarEnum.js) — duplicated here rather than
// imported, since this file runs under Node/Playwright, not Vite's `@/` alias resolver.
const ROSTER_MIX = [
  { char: 'rasta', avatarId: 12 },
  { char: 'brujita', avatarId: 2 },
  { char: 'ninja', avatarId: 11 },
  { char: 'werewolf', avatarId: 14 },
  { char: 'boomer', avatarId: 1 },
]
const ACTION_KEY = 'down_llorar'

function dockerAvailable() {
  const probe = spawnSync('docker', ['info'], { stdio: 'ignore' })
  return probe.status === 0
}

function dockerExecFind(pattern) {
  const shellCmd = `find /usr/share/nginx/html -iname '${pattern}' ! -name '*.gz'`
  const out = execFileSync('docker', ['exec', CONTAINER_NAME, 'sh', '-c', shellCmd], { encoding: 'utf8' })
  return out.split('\n').map((l) => l.trim()).filter(Boolean).sort()
}

function toUrl(dockerPath) {
  return `${BASE}/${dockerPath.replace('/usr/share/nginx/html/', '')}`
}

let skipSuite = false
const report = { gateVersion: 'design.md §15 / tasks.md slice 32 (roster-scale regression gate)', rows: [] }

test.describe('Roster-scale regression gate (tasks.md slice 32): several DIFFERENT characters, not N copies of one', () => {
  test.beforeAll(async () => {
    if (!dockerAvailable()) {
      skipSuite = true
      return
    }
    test.setTimeout(300_000)

    execFileSync('docker', ['build', '-f', 'client/Dockerfile', '-t', IMAGE_TAG, '.'], { cwd: REPO_ROOT, stdio: 'inherit' })
    spawnSync('docker', ['rm', '-f', CONTAINER_NAME])
    execFileSync('docker', ['run', '-d', '--name', CONTAINER_NAME, '-p', `${PORT}:80`, IMAGE_TAG])

    const deadline = Date.now() + 15_000
    let reachable = false
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`${BASE}/`)
        if (res.ok) { reachable = true; break }
      } catch { /* not up yet */ }
      await new Promise((r) => setTimeout(r, 300))
    }
    if (!reachable) throw new Error('avatar-roster-scale-gate.spec.js: container did not become reachable in time')
  })

  test.afterAll(() => {
    spawnSync('docker', ['rm', '-f', CONTAINER_NAME])
    fs.mkdirSync(path.join(__dirname, 'artifacts'), { recursive: true })
    fs.writeFileSync(path.join(__dirname, 'artifacts', 'roster-scale-gate-report.json'), JSON.stringify(report, null, 2))
  })

  test('M2 roster-scale: N distinct characters\' base pack transfer, summed (additive per distinct character)', async ({ request }) => {
    test.skip(skipSuite, 'docker is unavailable in this environment')

    const perCharacter = []
    for (const { char } of ROSTER_MIX) {
      const [manifestFile] = dockerExecFind(`${char}.layers.manifest*.js`)
      const [atlasFile] = dockerExecFind(`${char}.layers.atlas*.js`)
      const [webpFile] = dockerExecFind(`${char}.layers-*.webp`)
      const urls = [manifestFile, atlasFile, webpFile].map(toUrl)
      // eslint-disable-next-line no-await-in-loop
      const responses = await Promise.all(urls.map((u) => request.get(u, { headers: { 'Accept-Encoding': 'gzip' } })))
      const bytes = responses.reduce((sum, r) => sum + Number(r.headers()['content-length']), 0)
      perCharacter.push({ char, bytes })
    }
    const total = perCharacter.reduce((sum, c) => sum + c.bytes, 0)
    const p1Seconds = total / P1_BYTES_PER_SEC
    const p2Seconds = total / P2_BYTES_PER_SEC
    // Informal additive reference: the per-character M2 gate (<=600KB) times the roster-mix
    // count — NOT a design-authored roster-scale gate (design defines no such row), disclosed as
    // informal so it is not mistaken for one.
    const informalReferenceBytes = ROSTER_MIX.length * 600 * 1024
    const withinInformalReference = total <= informalReferenceBytes

    report.rows.push({
      metric: 'M2 roster-scale: N distinct characters\' base pack, summed',
      characters: perCharacter,
      gate: `informal reference only: <= ${ROSTER_MIX.length} x 600KB = ${informalReferenceBytes} B — design.md defines no roster-scale M2 gate`,
      measuredBytes: total,
      measuredMB: Number((total / 1024 / 1024).toFixed(2)),
      p1Seconds: Number(p1Seconds.toFixed(2)),
      p2Seconds: Number(p2Seconds.toFixed(2)),
      result: withinInformalReference ? 'WITHIN INFORMAL REFERENCE' : 'OVER INFORMAL REFERENCE',
    })
    console.log(`[ROSTER-SCALE GATE] M2: ${ROSTER_MIX.length} characters, ${total} B (${(total / 1024 / 1024).toFixed(2)} MB) — P1 ${p1Seconds.toFixed(2)}s, P2 ${p2Seconds.toFixed(2)}s — informal reference <=${informalReferenceBytes}B: ${withinInformalReference ? 'WITHIN' : 'OVER'}`)
    expect(total).toBeGreaterThan(0)
  })

  test('M3 roster-scale: N distinct characters each triggering the SAME action key, summed (additive per distinct character)', async ({ request }) => {
    test.skip(skipSuite, 'docker is unavailable in this environment')

    const perCharacter = []
    for (const { char } of ROSTER_MIX) {
      const [manifestFile] = dockerExecFind(`${char}.actions.${ACTION_KEY}.manifest*.js`)
      const [atlasFile] = dockerExecFind(`${char}.actions.${ACTION_KEY}.atlas*.js`)
      const [webpFile] = dockerExecFind(`${char}.actions.${ACTION_KEY}*.webp`)
      const urls = [manifestFile, atlasFile, webpFile].map(toUrl)
      // eslint-disable-next-line no-await-in-loop
      const responses = await Promise.all(urls.map((u) => request.get(u, { headers: { 'Accept-Encoding': 'gzip' } })))
      const bytes = responses.reduce((sum, r) => sum + Number(r.headers()['content-length']), 0)
      perCharacter.push({ char, bytes })
    }
    const total = perCharacter.reduce((sum, c) => sum + c.bytes, 0)
    const p1Seconds = total / P1_BYTES_PER_SEC
    const p2Seconds = total / P2_BYTES_PER_SEC
    const informalReferenceBytes = ROSTER_MIX.length * 400 * 1024
    const withinInformalReference = total <= informalReferenceBytes

    report.rows.push({
      metric: `M3 roster-scale: N distinct characters each playing "${ACTION_KEY}", summed`,
      characters: perCharacter,
      gate: `informal reference only: <= ${ROSTER_MIX.length} x 400KB = ${informalReferenceBytes} B — design.md defines no roster-scale M3 gate`,
      measuredBytes: total,
      measuredMB: Number((total / 1024 / 1024).toFixed(2)),
      p1Seconds: Number(p1Seconds.toFixed(2)),
      p2Seconds: Number(p2Seconds.toFixed(2)),
      result: withinInformalReference ? 'WITHIN INFORMAL REFERENCE' : 'OVER INFORMAL REFERENCE',
    })
    console.log(`[ROSTER-SCALE GATE] M3: ${ROSTER_MIX.length} characters x "${ACTION_KEY}", ${total} B (${(total / 1024 / 1024).toFixed(2)} MB) — P1 ${p1Seconds.toFixed(2)}s, P2 ${p2Seconds.toFixed(2)}s — informal reference <=${informalReferenceBytes}B: ${withinInformalReference ? 'WITHIN' : 'OVER'}`)
    expect(total).toBeGreaterThan(0)
  })

  test('M4 roster-scale: several DIFFERENT characters simultaneously — real residentAvatarBytes/fps/draws (design.md §19 risk 3)', async ({ page }) => {
    // Uses the harness dev server (playwright.config.js's shared webServer), matching R18's own
    // M4 precedent — `residentAvatarBytes` is live GPU-resident decoded memory, unobservable from
    // HTTP response bytes. `window.__avatarMetrics()`'s own `collectResidentAtlasPages` dedups by
    // ATLAS KEY, which differs per character by construction — several DIFFERENT characters'
    // pages therefore SUM here, unlike slice 7/8's same-character dedup measurement.
    await page.goto('/harness.html')
    await page.waitForFunction(() => !!window.__avatarHarness && !!window.__avatarMetrics)

    for (const { char, avatarId } of ROSTER_MIX) {
      const socketId = `roster_scale_${char}`
      // eslint-disable-next-line no-await-in-loop
      await page.evaluate(
        ({ socketId, avatarId }) => window.__avatarHarness.spawnAvatar({ socketId, avatarId }),
        { socketId, avatarId }
      )
      // eslint-disable-next-line no-await-in-loop
      await page.evaluate((socketId) => {
        window.__avatarHarness.setDirection(socketId, 'down')
        window.__avatarHarness.playKey(socketId, 'llorar')
      }, socketId)
    }
    for (const { char } of ROSTER_MIX) {
      const socketId = `roster_scale_${char}`
      // eslint-disable-next-line no-await-in-loop
      await page.waitForFunction(
        ({ id, key }) => window.game.scene.getScenes(true)[0].users[id].spriteAvatar._atlasKeys.actions.has(key),
        { id: socketId, key: ACTION_KEY }
      )
    }

    const metrics = await page.evaluate(() => window.__avatarMetrics())

    // Informal additive reference: N x the PER-CHARACTER M4 gate (<=80MB) — design.md §19 risk 3
    // names this exact arithmetic ("eight characters is ~640MB") as a flagged CONCERN, not an
    // authored gate; production's own resident figure (~22MB total, per the coordinator's own
    // brief) is reported alongside for contrast, not as a pass/fail threshold either — production
    // renders far fewer resident atlas pages at once than this worst-case mix intentionally forces.
    const informalReferenceBytes = ROSTER_MIX.length * 80 * 1024 * 1024
    const withinInformalReference = metrics.residentAvatarBytes <= informalReferenceBytes

    report.rows.push({
      metric: 'M4 roster-scale: several DIFFERENT characters, real residentAvatarBytes',
      characters: ROSTER_MIX.map((c) => c.char),
      gate: `informal reference only: <= ${ROSTER_MIX.length} x 80MB = ${informalReferenceBytes} B (design.md §19 risk 3's own named arithmetic, not an authored gate)`,
      productionContrast: '~22 MB total resident, per the coordinator\'s own brief (not a pass/fail threshold — production renders far fewer resident pages at once than this worst-case mix)',
      measuredResidentAvatarBytes: metrics.residentAvatarBytes,
      measuredResidentMB: Number((metrics.residentAvatarBytes / 1024 / 1024).toFixed(2)),
      canvasTintCacheBytes: metrics.canvasTintCacheBytes,
      fps: metrics.fps,
      draws: metrics.draws,
      gpuTextures: metrics.gpuTextures,
      result: withinInformalReference ? 'WITHIN INFORMAL REFERENCE' : 'OVER INFORMAL REFERENCE',
    })
    console.log(`[ROSTER-SCALE GATE] M4: ${ROSTER_MIX.length} characters, residentAvatarBytes ${metrics.residentAvatarBytes} B (${(metrics.residentAvatarBytes / 1024 / 1024).toFixed(2)} MB), fps.mean ${metrics.fps.mean}, draws ${metrics.draws} — informal reference <=${informalReferenceBytes}B: ${withinInformalReference ? 'WITHIN' : 'OVER'}`)
    expect(metrics.residentAvatarBytes).toBeGreaterThan(0)
  })

  test('Harness extension smoke test: PerfHarness.spawnRosterMix spawns N DISTINCT characters (task 1)', async ({ page }) => {
    // `.env.local` sets VITE_PERF_HARNESS=true, so the shared dev webServer exposes
    // `window.__perf` (gated in PerfHarness.js). This verifies the production-facing debug tool's
    // OWN roster-mix helper (alongside `spawnGhosts`) actually spawns distinct avatarIds, not just
    // the e2e-only `window.__avatarHarness` primitive the measurement tests above use directly.
    await page.goto('/harness.html')
    await page.waitForFunction(() => !!window.__perf && typeof window.__perf.spawnRosterMix === 'function')

    const spawned = await page.evaluate(async () => {
      const count = await window.__perf.spawnRosterMix()
      const scene = window.game.scene.getScenes(true)[0]
      const distinctAvatarIds = new Set(
        Object.keys(scene.users)
          .filter((k) => k.startsWith('__ghost_'))
          .map((k) => scene.users[k].avatarId)
      )
      window.__perf.despawnGhosts()
      return { count, distinctAvatarIds: distinctAvatarIds.size }
    })

    expect(spawned.count).toBeGreaterThan(1)
    expect(spawned.distinctAvatarIds).toBe(spawned.count)
  })
})
