// design.md §12.3/§12.5 (tasks.md slice 8 task 2): moved from the `packFrames` export of
// client/scripts/lib/packFrames.cjs (that file keeps `meanLuminance`/`checkLuminanceWarning`,
// which are build-only authoring checks, not part of the runtime bake path). This IS now the
// canonical shelf packer, shared between the build-time atlas packer and the runtime
// bake-cache's `CanvasTexture` page placement (§12.5) — both need the exact same packing
// decision so a build-time dedup ratio prediction and a runtime cache-hit measurement agree.

const DEFAULT_MAX_SIZE = 4096;

/**
 * @param {{id: string, w: number, h: number}[]} rects unique piece rects (pixel dimensions)
 * @param {{maxSize?: number}} [options]
 * @returns {{pages: {width: number, height: number, placements: {id:string,x:number,y:number,w:number,h:number}[]}[]}}
 */
function packFrames(rects, { maxSize = DEFAULT_MAX_SIZE } = {}) {
  // Tallest-first shelf packing: stable, simple, and sufficient for a few thousand small
  // pieces per character — a compile-time tool run by hand, and (once §12 lands) a runtime
  // bake-cache page layout, neither of which is a hot per-frame path.
  const sorted = [...rects].sort((a, b) => b.h - a.h);

  const pages = [];
  let page = newPage();
  let shelfY = 0;
  let shelfHeight = 0;
  let cursorX = 0;

  function newPage() {
    return { width: 0, height: 0, placements: [] };
  }

  function finishPage() {
    if (page.placements.length > 0) pages.push(page);
  }

  for (const rect of sorted) {
    if (rect.w > maxSize || rect.h > maxSize) {
      throw new Error(
        `packFrames: piece ${rect.id} (${rect.w}x${rect.h}) exceeds the ${maxSize}px page limit on its own`
      );
    }

    if (cursorX + rect.w > maxSize) {
      shelfY += shelfHeight;
      cursorX = 0;
      shelfHeight = 0;
    }

    if (shelfY + rect.h > maxSize) {
      finishPage();
      page = newPage();
      shelfY = 0;
      cursorX = 0;
      shelfHeight = 0;
    }

    page.placements.push({ id: rect.id, x: cursorX, y: shelfY, w: rect.w, h: rect.h });
    cursorX += rect.w;
    shelfHeight = Math.max(shelfHeight, rect.h);
    page.width = Math.max(page.width, cursorX);
    page.height = Math.max(page.height, shelfY + shelfHeight);
  }

  finishPage();

  return { pages };
}

export { packFrames };
