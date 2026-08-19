import { describe, it, expect } from 'vitest';
import { partitionSlotRuns } from './slotRuns.js';

// design.md §12.3 (tasks.md slice 8 task 1): moved verbatim from
// client/scripts/lib/slotRuns.cjs (deleted, not duplicated — this IS the canonical
// implementation now, consumed by the .cjs compilers via dynamic import()). Every assertion
// below is byte-identical to the original scripts/lib/slotRuns.test.cjs, re-verified green at
// the new location per design.md §12.3's "RE-VERIFY each moved test file still passes
// unchanged."
describe('partitionSlotRuns', () => {
  it('returns one run per path when there is no slot at all (every path lacks c)', () => {
    const paths = [{ d: 'a' }, { d: 'b' }, { d: 'c' }];
    const runs = partitionSlotRuns(paths);
    expect(runs).toEqual([
      { slot: null, paths: [{ d: 'a' }] },
      { slot: null, paths: [{ d: 'b' }] },
      { slot: null, paths: [{ d: 'c' }] },
    ]);
  });

  it('merges a single consecutive run of the same slot into one run', () => {
    const paths = [
      { d: 'a', c: 'color1' },
      { d: 'b', c: 'color1' },
      { d: 'c', c: 'color1' },
    ];
    const runs = partitionSlotRuns(paths);
    expect(runs).toEqual([{ slot: 'color1', paths }]);
  });

  it('splits into multiple runs when the slot changes, even without any gap', () => {
    const paths = [
      { d: 'a', c: 'color1' },
      { d: 'b', c: 'color2' },
      { d: 'c', c: 'color2' },
    ];
    const runs = partitionSlotRuns(paths);
    expect(runs).toEqual([
      { slot: 'color1', paths: [paths[0]] },
      { slot: 'color2', paths: [paths[1], paths[2]] },
    ]);
  });

  it('does NOT merge two color1 runs separated by an unrelated path (preserves authored/compositing order)', () => {
    const paths = [
      { d: 'a', c: 'color1' },
      { d: 'b', s: '#000', w: 1 },
      { d: 'c', c: 'color1' },
    ];
    const runs = partitionSlotRuns(paths);
    expect(runs).toEqual([
      { slot: 'color1', paths: [paths[0]] },
      { slot: null, paths: [paths[1]] },
      { slot: 'color1', paths: [paths[2]] },
    ]);
  });

  it('handles a fill-then-stroke pair (the real fact-B shape), each getting its own run', () => {
    const fill = { d: 'fillPath', f: '#b88a5c', eo: 1, c: 'color1' };
    const stroke = { d: 'strokePath', s: '#000000', w: 1.8 };
    const runs = partitionSlotRuns([fill, stroke]);
    expect(runs).toEqual([
      { slot: 'color1', paths: [fill] },
      { slot: null, paths: [stroke] },
    ]);
  });

  it('returns an empty array for an empty path list', () => {
    expect(partitionSlotRuns([])).toEqual([]);
  });
});
