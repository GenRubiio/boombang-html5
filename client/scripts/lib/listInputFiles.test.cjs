import { describe, it, expect } from 'vitest'
import { filterRegularFileNames } from './listInputFiles.cjs'

// Live-discovered defect (avatar-system-multichar-fixes PR4): compile-layered-avatar.cjs's
// sourceHash computation (`sha1OfInputs`) reads EVERY entry `fs.readdirSync(inputDir)` returns,
// including subdirectories — `fs.readFileSync` on a directory throws EISDIR. This was latent
// until this change's own staging convention (design.md §4) puts an `actions/` subdirectory
// (the vector package) as a SIBLING of the base layers.bb content inside the same
// `.assets-src/layered/<char>/` directory the hash scans. Confirmed live: compiling `rasta`
// after staging failed with exactly `EISDIR: illegal operation on a directory, read`.
describe('filterRegularFileNames', () => {
  it('keeps regular files and drops directories, given fs.readdirSync({withFileTypes:true})-shaped entries', () => {
    const entries = [
      { name: 'meta.json', isDirectory: () => false },
      { name: 'actions', isDirectory: () => true },
      { name: 'p0.png', isDirectory: () => false },
    ]
    expect(filterRegularFileNames(entries)).toEqual(['meta.json', 'p0.png'])
  })

  it('returns an empty array when every entry is a directory', () => {
    const entries = [{ name: 'actions', isDirectory: () => true }]
    expect(filterRegularFileNames(entries)).toEqual([])
  })

  it('returns every name unchanged when there are no directories at all', () => {
    const entries = [
      { name: 'a.json', isDirectory: () => false },
      { name: 'b.png', isDirectory: () => false },
    ]
    expect(filterRegularFileNames(entries)).toEqual(['a.json', 'b.png'])
  })
})
