import { describe, it, expect } from 'vitest'
import { computeContactSheetLayout, renderContactSheetLabelsSvg } from './contactSheetLayout.cjs'

// tasks.md slice 21 task 5: the pure grid-layout/labelling function backing
// `client/e2e/avatar-contact-sheet.spec.js` + `client/scripts/build-contact-sheet-index.cjs`.
// Takes named rows (each a label plus a list of opaque "cell" values — direction names for the
// idle/hat/pet rows, or arbitrary single-cell labels for the aura/action row) and returns pixel
// positions for every cell and every label, with no I/O of its own (design.md §8's "pure
// function, no direct unit test needed for the I/O shell" pattern this whole apply pass uses).
describe('computeContactSheetLayout', () => {
  const DIRECTIONS = ['down', 'downright', 'right', 'upright', 'up', 'upleft', 'left', 'downleft']

  it('lays out a single 8-cell row left to right, cell width apart plus padding', () => {
    const layout = computeContactSheetLayout([{ label: 'idle', cells: DIRECTIONS }], {
      cellWidth: 180,
      cellHeight: 170,
      padding: 6,
      labelHeight: 18,
      rowLabelWidth: 70,
    })

    expect(layout.rows).toHaveLength(1)
    const row = layout.rows[0]
    expect(row.label).toBe('idle')
    expect(row.cells).toHaveLength(8)
    expect(row.cells[0]).toMatchObject({ cell: 'down', x: 76, y: 6 })
    expect(row.cells[1].x).toBe(row.cells[0].x + 180 + 6)
    // sheet width covers the row label column plus 8 cells plus padding
    expect(layout.sheetWidth).toBe(70 + 8 * (180 + 6) + 6)
  })

  it('stacks multiple rows vertically, each row height = cellHeight + labelHeight + padding, independent of cell count', () => {
    const layout = computeContactSheetLayout(
      [
        { label: 'idle', cells: DIRECTIONS },
        { label: 'hat', cells: DIRECTIONS },
        { label: 'aura/action', cells: ['aura', 'action'] },
      ],
      { cellWidth: 180, cellHeight: 170, padding: 6, labelHeight: 18, rowLabelWidth: 70 }
    )

    expect(layout.rows).toHaveLength(3)
    expect(layout.rows[0].y).toBe(6)
    expect(layout.rows[1].y).toBe(6 + 170 + 18 + 6)
    expect(layout.rows[2].y).toBe(2 * (170 + 18 + 6) + 6)
    // the sheet width is driven by the WIDEST row (8 cells), not the narrower 2-cell row
    expect(layout.sheetWidth).toBe(70 + 8 * (180 + 6) + 6)
    // the third row only has 2 cells, both still positioned from the row-label column
    expect(layout.rows[2].cells).toHaveLength(2)
    expect(layout.rows[2].cells[0].x).toBe(76)
    expect(layout.rows[2].cells[1].x).toBe(76 + 180 + 6)
  })

  it('sheetHeight is the total of every row height plus one trailing padding', () => {
    const layout = computeContactSheetLayout(
      [
        { label: 'idle', cells: DIRECTIONS },
        { label: 'aura/action', cells: ['aura', 'action'] },
      ],
      { cellWidth: 180, cellHeight: 170, padding: 6, labelHeight: 18, rowLabelWidth: 70 }
    )
    expect(layout.sheetHeight).toBe(2 * (170 + 18 + 6) + 6)
  })

  it('each cell carries a caption position under the cell, distinct from the row label position', () => {
    const layout = computeContactSheetLayout([{ label: 'idle', cells: ['down'] }], {
      cellWidth: 180,
      cellHeight: 170,
      padding: 6,
      labelHeight: 18,
      rowLabelWidth: 70,
    })
    const cell = layout.rows[0].cells[0]
    expect(cell.captionY).toBe(cell.y + 170)
    expect(layout.rows[0].labelY).not.toBe(cell.captionY)
  })

  it('throws on an empty rows array — there is nothing to lay out', () => {
    expect(() => computeContactSheetLayout([])).toThrow(/non-empty/i)
  })

  it('throws when a row declares zero cells — an empty row has no width to size the sheet by', () => {
    expect(() => computeContactSheetLayout([{ label: 'empty', cells: [] }])).toThrow(/at least one cell/i)
  })
})

// tasks.md slice 21 task 5: the labelling half — an SVG text overlay composited on top of the
// screenshot grid (the I/O shell handles compositing; this function only builds the markup
// string, so it stays a pure function like `computeContactSheetLayout` itself).
describe('renderContactSheetLabelsSvg', () => {
  it('embeds the sheet dimensions as the SVG root width/height', () => {
    const layout = computeContactSheetLayout([{ label: 'idle', cells: ['down', 'up'] }])
    const svg = renderContactSheetLabelsSvg(layout, 'rasta')
    expect(svg).toContain(`width="${layout.sheetWidth}"`)
    expect(svg).toContain(`height="${layout.sheetHeight}"`)
  })

  it('emits one row-label text and one caption text per cell', () => {
    const layout = computeContactSheetLayout([
      { label: 'idle', cells: ['down', 'up'] },
      { label: 'hat', cells: ['down'] },
    ])
    const svg = renderContactSheetLabelsSvg(layout, 'rasta')
    expect(svg).toContain('>idle<')
    expect(svg).toContain('>hat<')
    expect(svg).toContain('>down<')
    expect(svg).toContain('>up<')
    // "down" appears as a caption under BOTH rows' first cell — two occurrences
    expect(svg.split('>down<').length - 1).toBe(2)
  })

  it('embeds the character title once, distinct from any row or cell label', () => {
    const layout = computeContactSheetLayout([{ label: 'idle', cells: ['down'] }])
    const svg = renderContactSheetLabelsSvg(layout, 'rasta')
    expect(svg).toContain('>rasta<')
  })

  it('paints no opaque full-sheet background — this SVG is composited ON TOP of the real screenshot cells, and an opaque backing rect would hide every one of them', () => {
    // Live-caught during slice 21: an earlier version emitted `<rect width="100%" height="100%"
    // fill="#ffffff"/>` as the first element, and since the labels layer composites LAST (on
    // top of every cell image), that opaque rect painted over the entire sheet, leaving only the
    // text glyphs visible and every captured screenshot invisible underneath. Guard against that
    // regression directly: no fill-bearing `<rect>` covering the full sheet may appear.
    const layout = computeContactSheetLayout([{ label: 'idle', cells: ['down'] }])
    const svg = renderContactSheetLabelsSvg(layout, 'rasta')
    expect(svg).not.toMatch(/<rect[^>]*width="100%"[^>]*fill="(?!none)/)
  })
})
