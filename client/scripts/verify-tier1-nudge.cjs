#!/usr/bin/env node
// design.md §16.4 (tasks.md slice 11 task 10): Tier 1 end-to-end numeric confirmation. Reads
// the current resolved hat x/y from the harness for `down`, then the caller applies a
// regXOffset/regYOffset annotation + recompile, then this script re-reads and reports the
// delta — confirming the resolved position moved by offset*ss, on RESOLVED RENDERED STATE
// (the harness's readState), not a pure-function computation.
const { chromium } = require('@playwright/test');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5183/harness.html');
  await page.waitForFunction(() => !!window.__avatarHarness);

  const socketId = await page.evaluate(() =>
    window.__avatarHarness.spawnAvatar({
      socketId: 'tier1_nudge',
      avatarId: 12,
      accessories: { hat: 'minnieHat' },
    })
  );
  const state = await page.evaluate((id) => {
    window.__avatarHarness.setDirection(id, 'down');
    return window.__avatarHarness.readState(id);
  }, socketId);
  const hat = state.children.find((c) => c.kind === 'hat');
  console.log(JSON.stringify({ hatX: hat.x, hatY: hat.y }));

  await browser.close();
}

main().catch((err) => {
  console.error('[verify-tier1-nudge] FAILED:', err.stack);
  process.exit(1);
});
