// design.md §13.7 (accessory whole-package ss:1, resolved by user decision 2026-08-19): the
// SAME packed-transfer measurement `compile-layered-avatar.cjs`'s `measureActionKeyPackedBytes`
// already uses for the body's per-action-key budget, extracted as a shared pure function so
// `compile-accessory.cjs` measures a whole package's own real transfer the identical way — webp
// bytes AS-IS (never gzip'd, `emit-gzip-siblings.cjs`'s own documented reason: already-compressed
// bytes gain nothing) plus gzip level 9 of every JSON string shipped alongside it (atlas +
// manifest), matching the R18 gate's own `content-length` method.
import { describe, it, expect } from 'vitest'
import { sumPackedTransferBytes } from './packedTransferBytes.cjs'

describe('sumPackedTransferBytes (pure, no filesystem)', () => {
  it('sums webp byte lengths as-is, plus gzip level 9 of every JSON string', () => {
    const total = sumPackedTransferBytes([1000, 2000], ['{"a":1}']);
    const zlib = require('zlib');
    const expectedGzip = zlib.gzipSync('{"a":1}', { level: zlib.constants.Z_BEST_COMPRESSION }).length;
    expect(total).toBe(1000 + 2000 + expectedGzip);
  });

  it('handles multiple JSON strings and zero webp pages', () => {
    const total = sumPackedTransferBytes([], ['{"a":1}', '{"b":2}']);
    const zlib = require('zlib');
    const gzipLevel = { level: zlib.constants.Z_BEST_COMPRESSION };
    const expected = zlib.gzipSync('{"a":1}', gzipLevel).length + zlib.gzipSync('{"b":2}', gzipLevel).length;
    expect(total).toBe(expected);
  });

  it('returns 0 for no webp pages and no JSON strings', () => {
    expect(sumPackedTransferBytes([], [])).toBe(0);
  });

  it('ignores a null/undefined JSON string entry (a package with no manifest to ship, mirroring the body compiler\'s own guard)', () => {
    const total = sumPackedTransferBytes([500], ['{"a":1}', null, undefined]);
    const zlib = require('zlib');
    const expectedGzip = zlib.gzipSync('{"a":1}', { level: zlib.constants.Z_BEST_COMPRESSION }).length;
    expect(total).toBe(500 + expectedGzip);
  });
});
