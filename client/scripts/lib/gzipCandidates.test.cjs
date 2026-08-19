// design.md §13.1 (tasks.md slice 13 task 2): the pure "which output files need a .gz sibling"
// decision, extracted from emit-gzip-siblings.cjs's I/O shell (fs.readFileSync/zlib.gzipSync)
// so the selection rule is directly unit-testable without touching a real filesystem.

import { describe, it, expect } from 'vitest'
import { selectGzipCandidates } from './gzipCandidates.cjs'

describe('selectGzipCandidates', () => {
  it('selects .js/.css/.json by default, not index.html or already-compressed .webp', () => {
    const files = [
      'dist/index.html',
      'dist/assets/js/rasta.layers.manifest-abc123.js',
      'dist/assets/webp/rasta-def456.webp',
    ];
    expect(selectGzipCandidates(files)).toEqual(['dist/assets/js/rasta.layers.manifest-abc123.js']);
  });

  it('selects a real .json path too (design.md §13.1\'s literal wording, kept for any future {as:"url"} asset)', () => {
    const files = ['dist/assets/json/rasta-abc123.json'];
    expect(selectGzipCandidates(files)).toEqual(['dist/assets/json/rasta-abc123.json']);
  });

  it('matches case-insensitively', () => {
    const files = ['dist/assets/js/RASTA-ABC.JS'];
    expect(selectGzipCandidates(files)).toEqual(['dist/assets/js/RASTA-ABC.JS']);
  });

  it('honours a custom extensions list', () => {
    const files = ['dist/index.html', 'dist/assets/js/main-abc.js', 'dist/assets/json/a.json'];
    expect(selectGzipCandidates(files, { extensions: ['.html', '.js'] })).toEqual([
      'dist/index.html',
      'dist/assets/js/main-abc.js',
    ]);
  });

  it('does not double-select an already-gzipped .js.gz sibling', () => {
    const files = ['dist/assets/js/a.js', 'dist/assets/js/a.js.gz'];
    expect(selectGzipCandidates(files)).toEqual(['dist/assets/js/a.js']);
  });

  it('selects .css too', () => {
    const files = ['dist/assets/css/index-abc.css'];
    expect(selectGzipCandidates(files)).toEqual(['dist/assets/css/index-abc.css']);
  });

  it('returns an empty array when nothing matches', () => {
    expect(selectGzipCandidates(['dist/index.html'])).toEqual([]);
  });

  it('returns an empty array for an empty input list', () => {
    expect(selectGzipCandidates([])).toEqual([]);
  });
});
