import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { sumDirBytesRecursive } from './sumDirBytesRecursive.cjs'

// tasks.md slices 28-31 (apply-progress.md M1 report): `avatar-load-gate.spec.js`'s M1 test used
// to hand-list rasta's 3 specific accessory directories (a leftover from when only rasta had any
// compiled) — with 540 real packages now compiled across 15 characters, hand-listing every one
// is not viable. This pure helper sums real file bytes under a directory tree, recursively,
// against real fixtures (a temp directory, not a mocked `fs`) — the M1 test then just points it
// at `accessories/` and each compiled body's `layers/` directory once each, not per-package.
describe('sumDirBytesRecursive', () => {
  let tmpRoot

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sum-dir-bytes-'))
  })

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  it('sums real file bytes at the top level of a directory', () => {
    fs.writeFileSync(path.join(tmpRoot, 'a.bin'), Buffer.alloc(100))
    fs.writeFileSync(path.join(tmpRoot, 'b.bin'), Buffer.alloc(250))
    expect(sumDirBytesRecursive(tmpRoot)).toBe(350)
  })

  it('descends into nested subdirectories (the real accessories/<kind>/<char>/<key>/ shape)', () => {
    const nested = path.join(tmpRoot, 'hat', 'rasta', 'minnieHat')
    fs.mkdirSync(nested, { recursive: true })
    fs.writeFileSync(path.join(tmpRoot, 'top.bin'), Buffer.alloc(10))
    fs.writeFileSync(path.join(nested, 'deep.bin'), Buffer.alloc(500))
    expect(sumDirBytesRecursive(tmpRoot)).toBe(510)
  })
})
