// god/apply pass (2026-08-19): `god.bb` (and `ghost.bb`/`wraith.bb`) declare `"raster": true`
// in their own `meta.json`, not `"layers": true` — no vector path data exists anywhere in the
// package (`design.md` fact B/§5.2 do not apply). Their `_frames.json` is ALREADY the final
// baked piece-reference pool, one flat entry per frame (`{o, x, y, w, h, p}` — no `L` wrapper,
// unlike a normal character's own `_frames.json`, which nests possibly-several pieces per frame
// in `L`). Per-key `<anim>.json` files are literal arrays of INDICES into that same pool
// (`design.md` fact F's "sequence JSONs are literal index arrays with heavy reuse" — the SAME
// convention a normal character's baked `<anim>.json` already uses), so a compiled sequence's
// `frames` array is that source array, unchanged.
//
// This builder therefore skips the vector rasterization step (`svgFromPaths`/`sharp`/
// `partitionSlotRuns`) entirely and maps straight from the raw frame-reference pool to the
// SAME manifest shape `compile-layered-avatar.cjs` itself emits (`pieces`/`frames`/
// `sequences`/`bodyBounds`/`slots`/`mirrors`/...) — the "no layered compile needed, this loads
// as a baked avatar" path, expressed in the layered manifest shape purely for renderer reuse
// (`LayeredAvatar` is the only consumer this codebase has for a per-slot-tintable, per-piece
// atlas-driven avatar; a character with zero colour slots gains nothing extra from that
// machinery beyond the shape itself).

/**
 * @param {object} params
 * @param {string} params.character
 * @param {number} params.ss the source package's declared supersampling factor
 * @param {Array<{o?: [number, number], x?: number, y?: number, w?: number, h?: number, p?: number}>} params.framesRaw
 *   the raw `_frames.json` array — index in this array IS the frame id every sequence
 *   references. An entry with no `p` is a blank/empty frame (design.md fact G's shape,
 *   confirmed live in `god.bb`: exactly one such entry in 1076).
 * @param {Record<string, number[]>} params.sequenceIndexArrays keyed by baked action name,
 *   each value the literal frame-index array read from that key's own `<key>.json`.
 * @param {Record<string, {x:number,y:number,w:number,h:number,page:number}>} params.pieceAtlasLocations
 *   keyed `p<N>` (matching `framesRaw[i].p`) — the packed atlas placement (pixel space) for
 *   every piece actually referenced by a compiled sequence.
 * @param {Record<string, {from:string, flipX:boolean}>} [params.mirrors] pre-derived mirrors
 *   (this builder does not derive them itself — `bakedKeyMap.cjs`'s existing
 *   `deriveConventionMirrors` already does, and is reused unchanged by the caller).
 * @returns {object} a manifest matching the shape `LayeredAvatar`/`AvatarManager` consume,
 *   minus `v`/`compilerVersion`/`sourceHash` (caller-stamped, same as every other compiler).
 */
function buildRasterAvatarManifest({
  character,
  ss,
  framesRaw,
  sequenceIndexArrays,
  pieceAtlasLocations,
  mirrors = {},
}) {
  // Only frame indices some COMPILED sequence actually plays — a raster-only source's
  // `_frames.json` is the WHOLE character's shared frame pool (god: 1076 entries feeding all
  // 41 anims), not a per-pack file the way a normal vector character's base/action data is
  // already split on disk. Without this restriction, compiling only a subset of `meta.anims`
  // (e.g. this project's own base-pack-only idle/talk/walk filter) would still emit every
  // OTHER key's frame entries too — bloating the manifest and inflating `bodyBounds` with
  // poses that were never actually compiled/packed.
  const referencedIndices = new Set();
  for (const frameIndices of Object.values(sequenceIndexArrays)) {
    for (const idx of frameIndices) referencedIndices.add(idx);
  }

  const pieces = {};
  framesRaw.forEach((entry, index) => {
    if (!referencedIndices.has(index)) return;
    if (entry.p === undefined) return;
    const pieceId = `p${entry.p}`;
    const location = pieceAtlasLocations[pieceId];
    if (!location) return; // not referenced by any compiled sequence — not packed, not shipped
    pieces[pieceId] = {
      frame: { x: location.x, y: location.y, w: location.w, h: location.h },
      page: location.page,
      w: entry.w,
      h: entry.h,
      slot: null,
      pack: 'base',
    };
  });

  const frames = {};
  framesRaw.forEach((entry, index) => {
    if (!referencedIndices.has(index)) return;
    const fid = String(index);
    if (entry.p === undefined) {
      frames[fid] = { o: entry.o || [0, 0], L: [] };
      return;
    }
    frames[fid] = {
      o: entry.o,
      L: [{ p: `p${entry.p}`, dx: entry.x, dy: entry.y }],
    };
  });

  const sequences = {};
  for (const [key, frameIndices] of Object.entries(sequenceIndexArrays)) {
    sequences[key] = {
      fps: 19,
      repeat: key.endsWith('_talk') ? 0 : -1,
      frames: frameIndices,
      pack: 'base',
    };
  }

  let maxX = 0;
  let maxY = 0;
  framesRaw.forEach((entry, index) => {
    if (!referencedIndices.has(index)) return;
    if (entry.p === undefined) return;
    maxX = Math.max(maxX, entry.x + entry.w);
    maxY = Math.max(maxY, entry.y + entry.h);
  });
  const bodyBounds = { w: Math.ceil(maxX), h: Math.ceil(maxY) };

  return {
    character,
    ss,
    slots: [],
    defaults: {},
    labels: {},
    compatibleHats: [],
    bodyBounds,
    pieces,
    frames,
    sequences,
    aliases: {},
    mirrors,
    actionPacks: [],
    maxFramePieces: 1,
    ssOverrides: {},
  };
}

module.exports = { buildRasterAvatarManifest };
