// LR1: explicit frame-index animation sequences. A sequence is played by literally indexing
// into its declared frame list — including repeated indices — and MUST NEVER be collapsed
// into, or represented internally as, a {start,end} range.

/**
 * @param {Record<string, {fps:number, repeat:number, frames:number[]}>} sequences
 * @param {string} key
 * @returns {number[]|undefined} the literal frame-index array, or undefined if the key is not
 *   declared (fallback.js resolves what to do in that case — this function does not guess).
 */
function expandSequence(sequences, key) {
  const sequence = sequences[key];
  if (!sequence) return undefined;
  // Return a copy so callers can never mutate the manifest's own declared array.
  return [...sequence.frames];
}

export { expandSequence };
