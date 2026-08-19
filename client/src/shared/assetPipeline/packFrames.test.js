import { describe, it, expect } from 'vitest';
import { packFrames } from './packFrames.js';

// design.md §12.5 (tasks.md slice 8 task 2): moved verbatim from client/scripts/lib/
// packFrames.cjs's `packFrames` export (the shelf packer) — the runtime bake cache needs the
// SAME packer the build compilers use (§12.5), so it becomes the shared shelf packer here.
// `meanLuminance`/`checkLuminanceWarning` stay build-only in scripts/lib/packFrames.cjs (an
// authoring-time warning, not part of the runtime bake path).
describe('packFrames', () => {
  it('packs rects that fit onto a single page', () => {
    const rects = [
      { id: 'a', w: 100, h: 50 },
      { id: 'b', w: 100, h: 50 },
    ];
    const result = packFrames(rects, { maxSize: 4096 });
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].width).toBeLessThanOrEqual(4096);
    expect(result.pages[0].height).toBeLessThanOrEqual(4096);
    const placedIds = result.pages[0].placements.map((p) => p.id).sort();
    expect(placedIds).toEqual(['a', 'b']);
  });

  it('starts a new page when an axis would exceed the max size', () => {
    const rects = [
      { id: 'big1', w: 3000, h: 3000 },
      { id: 'big2', w: 3000, h: 3000 },
      { id: 'big3', w: 3000, h: 3000 },
    ];
    const result = packFrames(rects, { maxSize: 4096 });
    expect(result.pages.length).toBeGreaterThan(1);
    result.pages.forEach((page) => {
      expect(page.width).toBeLessThanOrEqual(4096);
      expect(page.height).toBeLessThanOrEqual(4096);
    });
    const allIds = result.pages.flatMap((p) => p.placements.map((pl) => pl.id)).sort();
    expect(allIds).toEqual(['big1', 'big2', 'big3']);
  });

  it('throws when a single piece exceeds the page limit on its own', () => {
    expect(() => packFrames([{ id: 'huge', w: 5000, h: 100 }], { maxSize: 4096 })).toThrow(
      /exceeds/i
    );
  });
});
