#!/usr/bin/env node
// tasks.md slice 21 task 5: builds `client/e2e/artifacts/contact-sheets/index.html`, a roster
// index linking every character contact sheet `avatar-contact-sheet.spec.js` has committed
// under the same directory. Pure I/O shell (directory scan + string templating) — no rendering
// logic of its own, so it stays a plain Node script rather than a vitest-covered module, matching
// this apply pass's own precedent for build/report tooling (`measure-accessory-overlap.cjs`,
// `sweep-encoder-settings.cjs`).
//
//   node scripts/build-contact-sheet-index.cjs
//
// Slice 32 (design.md §15's final roster-scale gate) re-runs this once every migrated
// character's sheet exists, producing the FINAL honest coverage index across all 18 characters —
// this script itself needs no change to do that; it only ever reports what actually exists on
// disk, never a hardcoded roster list.

const fs = require('fs');
const path = require('path');

const SHEETS_DIR = path.join(__dirname, '..', 'e2e', 'artifacts', 'contact-sheets');
const INDEX_PATH = path.join(SHEETS_DIR, 'index.html');

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function findCharacterSheets(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.png'))
    .map((name) => name.slice(0, -'.png'.length))
    .sort();
}

function renderIndexHtml(characters) {
  const rows = characters
    .map(
      (character) =>
        `    <li><a href="./${escapeHtml(character)}.png">${escapeHtml(character)}</a> ` +
        `<img src="./${escapeHtml(character)}.png" alt="${escapeHtml(character)} contact sheet" ` +
        `style="max-width:100%;display:block;border:1px solid #ccc;margin:8px 0;"></li>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Avatar contact sheets — roster index</title>
</head>
<body>
<h1>Avatar contact sheets</h1>
<p>Review evidence, not a pixel-baseline gate (tasks.md slice 21 / design.md &sect;19 risk 8). The
numeric R1&ndash;R13/R19 matrix in <code>avatar-resolved-state.spec.js</code> remains the
automated pass/fail criterion; these sheets exist only so a human can see what the numeric
assertions cannot: texture, alpha, clip and gradient correctness.</p>
<p>${characters.length} character(s) captured: ${characters.map(escapeHtml).join(', ') || '(none yet)'}</p>
<ul>
${rows}
</ul>
</body>
</html>
`;
}

function main() {
  const characters = findCharacterSheets(SHEETS_DIR);
  fs.mkdirSync(SHEETS_DIR, { recursive: true });
  fs.writeFileSync(INDEX_PATH, renderIndexHtml(characters));
  console.log(`[build-contact-sheet-index] wrote ${INDEX_PATH} (${characters.length} character(s): ${characters.join(', ') || 'none'})`);
}

if (require.main === module) {
  main();
}

module.exports = { findCharacterSheets, renderIndexHtml };
