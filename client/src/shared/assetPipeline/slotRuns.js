// design.md §12.3 (tasks.md slice 8 task 1): moved from client/scripts/lib/slotRuns.cjs
// (deleted) — this IS now the canonical implementation, consumed by both the .cjs build
// compilers (via dynamic import() from their already-async main(), design.md §12.3) and, once
// the runtime vector path exists, the browser directly.
//
// design.md §5.1: bridges the raster package's per-piece "at most one slot" unit with a vector
// frame's per-path "optional c" unit. `p[]` order IS compositing order (LR4: "layer order is
// immutable, pool index === L index === child depth") — grouping every path of one slot
// together regardless of position would reorder the composite, so this splits into MAXIMAL
// CONSECUTIVE runs of equal `c` rather than grouping by slot value globally. Absent `c`
// (every stroke path, fact B) is its own distinct value — two `c`-less paths adjacent in the
// array are NOT merged into one shared "no slot" run, since each is its own future raster piece.

/**
 * @param {Array<{c?: string}>} paths a frame's `p[]`
 * @returns {Array<{slot: string|null, paths: Array}>} maximal consecutive runs; `slot` is the
 *   run's `c` value, or `null` for a run of exactly one path with no `c`.
 */
function partitionSlotRuns(paths) {
  const runs = [];

  for (const path of paths) {
    const slot = path.c ?? null;
    const previousRun = runs[runs.length - 1];

    if (previousRun && slot !== null && previousRun.slot === slot) {
      previousRun.paths.push(path);
    } else {
      runs.push({ slot, paths: [path] });
    }
  }

  return runs;
}

export { partitionSlotRuns };
