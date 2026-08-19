// design.md §9: pure frame-advance math for LayeredAvatar.tick(), extracted so the animation
// clock's boundary behaviour (repeat:0 completes exactly once, repeat:-1 never completes) is
// unit-testable without a live Phaser scene (design.md §8). `LayeredAvatar.tick()` is a thin
// wrapper: it calls this, applies each visited frame in order, and emits `animationupdate`/
// `animationcomplete` accordingly.

/**
 * @param {{seqIndex: number, accum: number, fps: number, repeat: number, frameCount: number}} state
 *   the animation clock's current state; `frameCount` is `sequence.frames.length` (already
 *   expanded — LR1's literal index array).
 * @param {number} delta milliseconds elapsed since the last tick.
 * @returns {{seqIndex: number, accum: number, playing: boolean, completed: boolean, visited: number[]}}
 *   `visited` lists every intermediate `seqIndex` value passed through during this call, in
 *   order (1 entry per whole `frameDuration` elapsed) — a caller applies/emits one
 *   `animationupdate` per entry. `completed` is true exactly once, the tick a non-repeating
 *   (`repeat: 0`) sequence passes its last frame; `seqIndex` then stays at its last valid
 *   value (matching Phaser: a completed animation freezes on its last frame) and `visited` is
 *   empty for that transition (no further frame is applied). A `repeat: -1` (or any non-zero)
 *   sequence wraps back to index 0 past its last frame and never sets `completed`.
 */
function advanceSequence({ seqIndex, accum, fps, repeat, frameCount }, delta) {
  let index = seqIndex;
  let acc = accum + delta;
  let playing = true;
  let completed = false;
  const visited = [];
  const frameDuration = 1000 / fps;

  while (acc >= frameDuration) {
    acc -= frameDuration;
    const nextIndex = index + 1;
    if (nextIndex >= frameCount) {
      if (repeat === 0) {
        playing = false;
        completed = true;
        break;
      }
      index = 0;
    } else {
      index = nextIndex;
    }
    visited.push(index);
  }

  return { seqIndex: index, accum: acc, playing, completed, visited };
}

export { advanceSequence };
