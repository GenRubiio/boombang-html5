import { describe, it, expect } from 'vitest';
import { classifyPathSpecies } from './pathSpecies.js';

// design.md §12.3/fact B: the shared species classifier both emitters (svgFromPaths.cjs's
// build-side inline branching and path2dOps.js's browser-side Path2D branching) agree on —
// fill (`d`+`f`), stroke (`d`+`s`+`w`, never a slot), linear gradient (`d`+`g`, never a slot).
describe('classifyPathSpecies', () => {
  it('classifies a plain fill path', () => {
    expect(classifyPathSpecies({ d: 'M0 0Z', f: '#b88a5c', eo: 1, c: 'color1' })).toBe('fill');
  });

  it('classifies a stroke path', () => {
    expect(classifyPathSpecies({ d: 'M0 0L1 1', s: '#000000', w: 1.8 })).toBe('stroke');
  });

  it('classifies a linear-gradient path', () => {
    expect(
      classifyPathSpecies({
        d: 'M0 0Z',
        g: { t: 'l', st: [[0, '#fff']], x1: 0, y1: 0, x2: 1, y2: 1 },
        eo: 1,
      })
    ).toBe('gradient');
  });

  it('throws when a path has neither fill, stroke nor gradient data', () => {
    expect(() => classifyPathSpecies({ d: 'M0 0Z' })).toThrow(/neither fill, stroke nor gradient/i);
  });
});
