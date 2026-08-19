import { describe, it, expect } from 'vitest';
import { computeBounds, validateCommandAlphabet } from './pathBounds.js';

// design.md §12.3 (tasks.md slice 8 task 1): moved verbatim from the `computeBounds`/
// `validateCommandAlphabet` portion of client/scripts/lib/svgFromPaths.cjs — this IS now the
// canonical implementation; svgFromPaths.cjs forwards to it via injection (see
// setSharedVectorBounds), never reimplementing it. Assertions are byte-identical to the
// relevant block of scripts/lib/svgFromPaths.test.cjs.
describe('computeBounds', () => {
  it('computes the bounding box across all paths in a frame', () => {
    const paths = [{ d: 'M0 0L10 5Z' }, { d: 'M20 20L30 -5Z' }];
    const bounds = computeBounds(paths);
    expect(bounds).toEqual({ minX: 0, minY: -5, maxX: 30, maxY: 20, width: 30, height: 25 });
  });

  it('inflates a stroke path bounding box by half its stroke-width, so a straight line never yields a zero-area box', () => {
    const paths = [{ d: 'M47.05 123.26L47.05 126.56', s: '#000000', w: 1.8 }];
    const bounds = computeBounds(paths);
    expect(bounds.minX).toBeCloseTo(47.05 - 0.9, 9);
    expect(bounds.maxX).toBeCloseTo(47.05 + 0.9, 9);
    expect(bounds.width).toBeCloseTo(1.8, 9);
    expect(bounds.height).toBeCloseTo(3.3 + 1.8, 9);
  });

  it('does not inflate a fill path when it already has real width/height (no stroke-width to account for)', () => {
    const paths = [{ d: 'M0 0L10 0L10 10Z', f: '#fff' }];
    const bounds = computeBounds(paths);
    expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10 });
  });

  it('floors an extremely thin bounding box to a minimum renderable size (>= 1/ss logical units)', () => {
    const paths = [{ d: 'M31.11 49.77L31.01 48.61L31.11 49.77', f: '#ff9900', eo: 1 }];
    const bounds = computeBounds(paths, 2);
    expect(bounds.width).toBeGreaterThanOrEqual(0.5);
  });
});

describe('validateCommandAlphabet', () => {
  it('accepts the M/L/Q/C/Z alphabet', () => {
    expect(() => validateCommandAlphabet('M0 0L10 5Q1 1 2 2C1 1 2 2 3 3Z')).not.toThrow();
  });

  it('throws on an unrecognised command', () => {
    expect(() => validateCommandAlphabet('M0 0A10 10 0 0 1 20 20')).toThrow(/unrecognised/i);
  });
});
