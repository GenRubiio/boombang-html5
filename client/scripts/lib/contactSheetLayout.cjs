// tasks.md slice 21 task 5: pure grid layout for the visual contact-sheet deliverable
// (design.md §19 risk 8 / §14's own "the harness asserts numeric state, not pixels" gap). Takes
// named rows of opaque "cell" values (direction names for idle/hat/pet rows, arbitrary single
// labels for the aura/action row) and returns every cell's pixel position plus label positions,
// so the Playwright I/O shell (`avatar-contact-sheet.spec.js`) only has to composite images at
// already-computed coordinates — no layout arithmetic lives in the I/O shell itself.

function computeContactSheetLayout(
  rows,
  { cellWidth = 180, cellHeight = 170, padding = 6, labelHeight = 18, rowLabelWidth = 70 } = {}
) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('computeContactSheetLayout: rows must be a non-empty array');
  }

  let maxCols = 0;
  for (const row of rows) {
    if (!Array.isArray(row.cells) || row.cells.length === 0) {
      throw new Error(
        `computeContactSheetLayout: row "${row.label}" must declare at least one cell`
      );
    }
    maxCols = Math.max(maxCols, row.cells.length);
  }

  const sheetWidth = rowLabelWidth + maxCols * (cellWidth + padding) + padding;
  const rowHeight = cellHeight + labelHeight + padding;

  const layoutRows = rows.map((row, rowIndex) => {
    const y = padding + rowIndex * rowHeight;
    const labelY = y + Math.floor((cellHeight - labelHeight) / 2);
    const cells = row.cells.map((cell, cellIndex) => ({
      cell,
      x: rowLabelWidth + padding + cellIndex * (cellWidth + padding),
      y,
      captionY: y + cellHeight,
    }));
    return { label: row.label, y, labelY, cells };
  });

  const sheetHeight = padding + rows.length * rowHeight;

  return { sheetWidth, sheetHeight, cellWidth, cellHeight, labelHeight, padding, rows: layoutRows };
}

/**
 * Renders the text-overlay half of a contact sheet as an SVG markup string — a title, one
 * row-label per row, and one caption per cell — positioned from `computeContactSheetLayout`'s
 * own output. Pure (string in, string out): the I/O shell composites the returned markup, via
 * `sharp`, on top of the screenshot grid it assembles separately.
 */
function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderContactSheetLabelsSvg(layout, title, { fontSize = 13, titleFontSize = 20 } = {}) {
  // No full-sheet backing rect here: this markup is composited LAST, on top of every real
  // screenshot cell, so an opaque background would hide all of them (a real regression this
  // slice caught live — see contactSheetLayout.test.cjs's own regression case). The base
  // canvas's own white background (set by the I/O shell's `sharp({create: {...}})` call) is
  // what shows through everywhere the text glyphs below do not paint.
  const parts = [
    `<svg width="${layout.sheetWidth}" height="${layout.sheetHeight}" ` +
      `xmlns="http://www.w3.org/2000/svg">`,
    `<text x="8" y="${titleFontSize}" font-size="${titleFontSize}" font-family="sans-serif" ` +
      `font-weight="bold">${escapeXml(title)}</text>`,
  ];

  for (const row of layout.rows) {
    parts.push(
      `<text x="4" y="${row.labelY + Math.floor(fontSize / 2)}" font-size="${fontSize}" ` +
        `font-family="sans-serif">${escapeXml(row.label)}</text>`
    );
    for (const cellEntry of row.cells) {
      const captionX = cellEntry.x + Math.floor(layout.cellWidth / 2);
      const captionY = cellEntry.captionY + Math.floor(layout.labelHeight / 2) + fontSize / 2;
      parts.push(
        `<text x="${captionX}" y="${captionY}" font-size="${fontSize}" font-family="sans-serif" ` +
          `text-anchor="middle">${escapeXml(cellEntry.cell)}</text>`
      );
    }
  }

  parts.push('</svg>');
  return parts.join('\n');
}

module.exports = { computeContactSheetLayout, renderContactSheetLabelsSvg };
