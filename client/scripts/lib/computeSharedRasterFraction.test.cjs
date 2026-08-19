// design.md §13.6 (tasks.md slice 18 task 1): pure comparison over content-hash sets, one per
// compiled package — reports what fraction of raster instances (not distinct hashes: an
// instance is counted once per package that has it) are shared across 2+ packages, vs private
// to exactly one. The package-reading/hashing step (real files, real sharp/crypto calls) is the
// I/O shell in measure-accessory-overlap.cjs.

import { describe, it, expect } from 'vitest'
import { computeSharedRasterFraction } from './computeSharedRasterFraction.cjs'

describe('computeSharedRasterFraction', () => {
  it('reports 0% shared when every hash is unique to its own package (no overlap)', () => {
    const result = computeSharedRasterFraction({
      packageA: new Set(['h1', 'h2']),
      packageB: new Set(['h3', 'h4']),
    })
    expect(result.sharedFraction).toBe(0)
    expect(result.totalInstances).toBe(4)
    expect(result.sharedInstances).toBe(0)
  })

  it('reports 100% shared when every hash appears in every package', () => {
    const result = computeSharedRasterFraction({
      packageA: new Set(['h1', 'h2']),
      packageB: new Set(['h1', 'h2']),
    })
    expect(result.sharedFraction).toBe(1)
  })

  it('computes a partial overlap fraction correctly', () => {
    // h1 shared (2 instances), h2/h3 private (1 instance each) = 2 shared of 4 total = 0.5
    const result = computeSharedRasterFraction({
      packageA: new Set(['h1', 'h2']),
      packageB: new Set(['h1', 'h3']),
    })
    expect(result.totalInstances).toBe(4)
    expect(result.sharedInstances).toBe(2)
    expect(result.sharedFraction).toBe(0.5)
  })

  it('is inconclusive (not merely "0% shared") with only ONE package — there is nothing to share with yet', () => {
    const result = computeSharedRasterFraction({ packageA: new Set(['h1', 'h2']) })
    expect(result.inconclusive).toBe(true)
    expect(result.reason).toMatch(/at least 2 packages/i)
  })

  it('handles an empty package set without dividing by zero', () => {
    const result = computeSharedRasterFraction({})
    expect(result.inconclusive).toBe(true)
  })
})
