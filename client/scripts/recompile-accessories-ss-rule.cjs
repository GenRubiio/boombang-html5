#!/usr/bin/env node
// Manually-invoked batch driver (design.md §13.7, resolved by user decision 2026-08-19): applies
// the measurement-driven whole-package ss:1 rule (`compileAccessoryWithSsRule`,
// `compile-accessory.cjs`) to EVERY already-staged accessory package across the whole roster in
// one run, and writes a durable, inspectable report of the real before/after bytes and the
// resulting ss:1 set — the same "durable JSON artifact, not just console output" precedent
// `avatar-load-gate.spec.js`'s own `r18-gate-report.json` established for the R18 gate.
//
// Usage: node scripts/recompile-accessories-ss-rule.cjs
//
// Scope (design.md's own standing instruction, apply-progress.md): ghost/wraith are excluded —
// both remain blocked on the unresolved --from-vector base-pack architecture question, and
// neither has any staged accessory package on disk to iterate. `sally` has no accessory roster
// at all (design.md §16) and is likewise absent from `.assets-src/accessories/`.

const fs = require('fs');
const path = require('path');

const { compileAccessoryWithSsRule, ACCESSORY_SS_TRANSFER_BUDGET_BYTES } = require('./compile-accessory.cjs');

const ACCESSORIES_SRC_DIR = path.resolve(__dirname, '..', '.assets-src/accessories');
const REPORT_PATH = path.resolve(__dirname, '..', 'e2e/artifacts/accessory-ss-report.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function main() {
  const characters = fs
    .readdirSync(ACCESSORIES_SRC_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const results = [];
  for (const char of characters) {
    const charDir = path.join(ACCESSORIES_SRC_DIR, char);
    const keys = fs
      .readdirSync(charDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const key of keys) {
      const metaPath = path.join(charDir, key, 'meta.json');
      if (!fs.existsSync(metaPath)) continue;
      const { kind } = readJson(metaPath);
      // eslint-disable-next-line no-await-in-loop
      const result = await compileAccessoryWithSsRule(kind, key, char, {});
      results.push(result);
    }
  }

  const overBudget = results.filter((r) => r.finalSs === 1);
  const totalBefore = results.reduce((sum, r) => sum + r.ss2Bytes, 0);
  const totalAfter = results.reduce((sum, r) => sum + r.finalBytes, 0);

  const report = {
    budgetBytes: ACCESSORY_SS_TRANSFER_BUDGET_BYTES,
    totalPackages: results.length,
    overBudgetCount: overBudget.length,
    totalSs2Bytes: totalBefore,
    totalFinalBytes: totalAfter,
    packages: results,
  };
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`[recompile-accessories-ss-rule] ${results.length} packages processed across ${characters.length} characters.`);
  console.log(`[recompile-accessories-ss-rule] ${overBudget.length} recompiled at ss:1 (over the ${ACCESSORY_SS_TRANSFER_BUDGET_BYTES} B budget at ss:2).`);
  console.log(`[recompile-accessories-ss-rule] total ss:2-measured bytes: ${totalBefore} (${(totalBefore / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`[recompile-accessories-ss-rule] total final bytes:        ${totalAfter} (${(totalAfter / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`[recompile-accessories-ss-rule] report written to ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error('[recompile-accessories-ss-rule] FAILED:', err);
  process.exit(1);
});
