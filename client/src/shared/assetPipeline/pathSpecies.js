// design.md §12.3/fact B (tasks.md slice 8 task 1): the shared species classifier both
// emitters agree on. Extracted from svgFromPaths.cjs's `renderPieceStyle` branch conditions
// (that file keeps its own inline branching unchanged — a widely-tested, shipped function this
// slice does not touch) so path2dOps.js's browser-side Path2D branching and the build-side SVG
// emission decide "which species is this path" from the exact same rule.
//
// fact B: fill (`d`+`f`+optional `eo`+optional `c`), stroke (`d`+`s`+`w`, never a slot), linear
// gradient (`d`+`g:{t:"l",st,x1,y1,x2,y2}`+optional `eo`, never a slot).

/**
 * @param {{d:string, f?:string, eo?:number, s?:string, w?:number, g?:object}} piece
 * @returns {'fill'|'stroke'|'gradient'}
 */
function classifyPathSpecies(piece) {
  if (piece.g !== undefined) return 'gradient';
  if (piece.f !== undefined) return 'fill';
  if (piece.s !== undefined && piece.w !== undefined) return 'stroke';
  throw new Error(
    `classifyPathSpecies: path has neither fill, stroke nor gradient data ("d": "${piece.d.slice(0, 60)}")`
  );
}

export { classifyPathSpecies };
