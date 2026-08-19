// design.md §9.1 (tasks.md slice 16 task 1): every multiatlas frame entry is fully determined
// by five values — `rotated`/`trimmed` are always false and `spriteSourceSize` is always
// `{x:0,y:0,w,h}`/`sourceSize` always equals `frame.w/frame.h` for every frame this project's
// two compilers ever emit (no atlas trimming or rotation is performed anywhere). Compacting
// elides all four derivable fields; the runtime re-derives them on load via
// `expandCompactAtlas`, so Phaser's own multiatlas loader (which DOES need the full verbose
// shape) never sees the compact form directly.

/**
 * @param {object} verboseAtlas a full Phaser-multiatlas-shaped object (this project's own
 *   `{textures: [{image, format, size, scale, frames: [{filename, rotated, trimmed,
 *   sourceSize, spriteSourceSize, frame}]}], meta}` shape).
 * @returns {object} the compact form — same `textures[].image/format/size/scale/meta`, but
 *   each frame entry reduced to `{filename, frame}`.
 */
function compactAtlas(verboseAtlas) {
  return {
    textures: verboseAtlas.textures.map((texture) => ({
      image: texture.image,
      format: texture.format,
      size: texture.size,
      scale: texture.scale,
      frames: texture.frames.map((frame) => ({ filename: frame.filename, frame: frame.frame })),
    })),
    meta: verboseAtlas.meta,
  };
}

/**
 * Inverse of `compactAtlas` — reconstructs the exact verbose shape Phaser's
 * `scene.load.multiatlas` expects. Self-detecting and idempotent: an atlas compiled with
 * `--emit-verbose` (debugging only) already carries `rotated`/`trimmed`/etc. per frame and is
 * returned unchanged rather than double-processed, so the runtime can call this
 * unconditionally regardless of which form a given on-disk file happens to be.
 *
 * @param {object} compactAtlasData
 * @returns {object} verbose atlas, byte-for-byte equivalent (modulo JSON key order) to what the
 *   compiler would have emitted with `--emit-verbose`.
 */
function expandCompactAtlas(compactAtlasData) {
  return {
    textures: compactAtlasData.textures.map((texture) => ({
      image: texture.image,
      format: texture.format,
      size: texture.size,
      scale: texture.scale,
      frames: texture.frames.map((frame) =>
        'rotated' in frame
          ? frame
          : {
              filename: frame.filename,
              rotated: false,
              trimmed: false,
              sourceSize: { w: frame.frame.w, h: frame.frame.h },
              spriteSourceSize: { x: 0, y: 0, w: frame.frame.w, h: frame.frame.h },
              frame: frame.frame,
            }
      ),
    })),
    meta: compactAtlasData.meta,
  };
}

export { compactAtlas, expandCompactAtlas };
