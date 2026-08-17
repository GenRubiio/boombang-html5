// Shelf-pack unique extracted piece rects into one or more atlas pages, starting a new page
// whenever an axis would exceed the max size (design.md §3.1 step 3 — the same multi-page
// shape AvatarRastaLoad.js already loads for the baked renderer, default 4096px).
//
// Also hosts the mean-luminance authoring check (design.md §5 cost): a warning, never a
// build failure, when a tintable piece's mean luminance is below a threshold — `setTint`
// cannot brighten, so a very dark source piece will render darker still.

const DEFAULT_MAX_SIZE = 4096

/**
 * @param {{id: string, w: number, h: number}[]} rects unique piece rects (pixel dimensions)
 * @param {{maxSize?: number}} [options]
 * @returns {{pages: {width: number, height: number, placements: {id:string,x:number,y:number,w:number,h:number}[]}[]}}
 */
function packFrames(rects, { maxSize = DEFAULT_MAX_SIZE } = {}) {
  // Tallest-first shelf packing: stable, simple, and sufficient for a few thousand small
  // pieces per character — this is a compile-time tool run by hand, not a runtime hot path.
  const sorted = [...rects].sort((a, b) => b.h - a.h)

  const pages = []
  let page = newPage()
  let shelfY = 0
  let shelfHeight = 0
  let cursorX = 0

  function newPage() {
    return { width: 0, height: 0, placements: [] }
  }

  function finishPage() {
    if (page.placements.length > 0) pages.push(page)
  }

  for (const rect of sorted) {
    if (rect.w > maxSize || rect.h > maxSize) {
      throw new Error(
        `packFrames: piece ${rect.id} (${rect.w}x${rect.h}) exceeds the ${maxSize}px page limit on its own`
      )
    }

    // Does it fit on the current shelf?
    if (cursorX + rect.w > maxSize) {
      // Start a new shelf below the current one
      shelfY += shelfHeight
      cursorX = 0
      shelfHeight = 0
    }

    // Does the new shelf fit within the page height?
    if (shelfY + rect.h > maxSize) {
      // Start a new page entirely
      finishPage()
      page = newPage()
      shelfY = 0
      cursorX = 0
      shelfHeight = 0
    }

    page.placements.push({ id: rect.id, x: cursorX, y: shelfY, w: rect.w, h: rect.h })
    cursorX += rect.w
    shelfHeight = Math.max(shelfHeight, rect.h)
    page.width = Math.max(page.width, cursorX)
    page.height = Math.max(page.height, shelfY + shelfHeight)
  }

  finishPage()

  return { pages }
}

/**
 * Mean luminance (0-255) of an RGBA buffer, using the standard Rec. 601 luma weights.
 * @param {Buffer|Uint8Array} rgbaBuffer
 */
function meanLuminance(rgbaBuffer) {
  let sum = 0
  let count = 0
  for (let i = 0; i < rgbaBuffer.length; i += 4) {
    const r = rgbaBuffer[i]
    const g = rgbaBuffer[i + 1]
    const b = rgbaBuffer[i + 2]
    sum += 0.299 * r + 0.587 * g + 0.114 * b
    count += 1
  }
  return count === 0 ? 0 : sum / count
}

/**
 * @param {number} luminance mean luminance (0-255) of a tintable piece
 * @param {{threshold?: number}} [options]
 * @returns {string|null} a warning message, or null when the piece is bright enough
 */
function checkLuminanceWarning(luminance, { threshold = 80 } = {}) {
  if (luminance < threshold) {
    return `warning: tintable piece mean luminance ${luminance.toFixed(1)} is below ${threshold} — setTint cannot brighten, so multiply-tinted colours will render darker than requested`
  }
  return null
}

module.exports = { packFrames, meanLuminance, checkLuminanceWarning }
