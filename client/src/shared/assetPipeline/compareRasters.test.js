// design.md §12.3 (cross-rasterizer equivalence, R16) / §16.4 (R17b, zero differing pixels —
// reused, not reimplemented). Pure per-pixel RGBA diff; the "render through sharp/librsvg and
// through Canvas2D, then compare" is the apply-phase I/O shell around this function.

import { describe, it, expect } from 'vitest';
import { diffRgbaBuffers } from './compareRasters.js';

function solidBuffer(w, h, [r, g, b, a]) {
  const buf = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = r;
    buf[i + 1] = g;
    buf[i + 2] = b;
    buf[i + 3] = a;
  }
  return buf;
}

describe('diffRgbaBuffers', () => {
  it('reports zero differing pixels for two identical buffers', () => {
    const a = solidBuffer(2, 2, [10, 20, 30, 255]);
    const b = solidBuffer(2, 2, [10, 20, 30, 255]);
    const result = diffRgbaBuffers(a, b, 2, 2);
    expect(result).toEqual({ differingPixels: 0, totalPixels: 4, maxChannelDelta: 0 });
  });

  it('reports every pixel as differing when every channel differs beyond tolerance', () => {
    const a = solidBuffer(2, 1, [0, 0, 0, 255]);
    const b = solidBuffer(2, 1, [255, 255, 255, 255]);
    const result = diffRgbaBuffers(a, b, 2, 1);
    expect(result.differingPixels).toBe(2);
    expect(result.maxChannelDelta).toBe(255);
  });

  it('treats a 1-off channel difference as within a tolerance of 1', () => {
    const a = solidBuffer(1, 1, [100, 100, 100, 255]);
    const b = solidBuffer(1, 1, [101, 100, 100, 255]);
    expect(diffRgbaBuffers(a, b, 1, 1, { tolerance: 1 }).differingPixels).toBe(0);
    expect(diffRgbaBuffers(a, b, 1, 1, { tolerance: 0 }).differingPixels).toBe(1);
  });

  it('throws when buffer lengths disagree with the declared dimensions', () => {
    const a = solidBuffer(2, 2, [1, 1, 1, 255]);
    const b = solidBuffer(1, 1, [1, 1, 1, 255]);
    expect(() => diffRgbaBuffers(a, b, 2, 2)).toThrow(/length/i);
  });
});
