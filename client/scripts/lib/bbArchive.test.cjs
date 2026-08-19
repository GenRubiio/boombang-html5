import { describe, it, expect } from 'vitest'
import { buildZipEntries, FIXED_ARCHIVE_MTIME } from './bbArchive.cjs'
import { zipSync } from 'fflate'

// design.md §16.2 (tasks.md slice 11 task 2): bb-unpack.cjs/bb-pack.cjs use `fflate` in Node,
// not the `zip` CLI, because R17a needs a DETERMINISTIC archive — stable entry order, fixed
// timestamps. `buildZipEntries` is the pure piece: given a plain `{path: Buffer}` file map, it
// produces the sorted, fixed-mtime shape `zipSync` needs.
describe('buildZipEntries', () => {
  it('sorts entries by path regardless of input object key order', () => {
    const files = {
      'z_file.json': Buffer.from('z'),
      'a_file.json': Buffer.from('a'),
      'm_file.json': Buffer.from('m'),
    }
    const entries = buildZipEntries(files)
    expect(Object.keys(entries)).toEqual(['a_file.json', 'm_file.json', 'z_file.json'])
  })

  it('assigns the SAME fixed mtime to every entry, regardless of call time', () => {
    const entries = buildZipEntries({ 'a.json': Buffer.from('a') })
    expect(entries['a.json'][1].mtime).toEqual(FIXED_ARCHIVE_MTIME)
  })

  it('produces a byte-identical zip across two independent calls with the same input', () => {
    const files = { 'b.json': Buffer.from('{"x":1}'), 'a.json': Buffer.from('{"y":2}') }
    const zip1 = zipSync(buildZipEntries(files))
    const zip2 = zipSync(buildZipEntries({ ...files }))
    expect(Buffer.compare(Buffer.from(zip1), Buffer.from(zip2))).toBe(0)
  })

  it('produces a DIFFERENT zip when file content differs', () => {
    const zip1 = zipSync(buildZipEntries({ 'a.json': Buffer.from('{"x":1}') }))
    const zip2 = zipSync(buildZipEntries({ 'a.json': Buffer.from('{"x":2}') }))
    expect(Buffer.compare(Buffer.from(zip1), Buffer.from(zip2))).not.toBe(0)
  })

  // design.md §9.2 (tasks.md slice 16 task 2): STORE (level 0) for `.webp`, DEFLATE (level 9)
  // for JSON — an injectable `levelFor(filePath)` picks the level per entry; defaults to level
  // 9 for every file (unchanged from R17a's own byte-identical-repack precondition) when no
  // override function is passed, so `bb-pack.cjs`'s existing 2-arg call sites need no change.
  it('defaults every entry to level 9 when no levelFor function is given (bb-pack.cjs\'s existing behaviour, unchanged)', () => {
    const entries = buildZipEntries({ 'a.json': Buffer.from('a') })
    expect(entries['a.json'][1].level).toBe(9)
  })

  it('uses the injected levelFor(filePath) to pick STORE (0) for .webp and DEFLATE (9) for .json', () => {
    const files = { 'a.webp': Buffer.from('binary'), 'b.json': Buffer.from('{}') }
    const levelFor = (filePath) => (filePath.endsWith('.webp') ? 0 : 9)
    const entries = buildZipEntries(files, levelFor)
    expect(entries['a.webp'][1].level).toBe(0)
    expect(entries['b.json'][1].level).toBe(9)
  })
})
