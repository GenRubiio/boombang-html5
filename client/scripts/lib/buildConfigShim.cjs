// design.md §15 (tasks.md slice 10 task 4): pure builder for `--emit-config-shim`'s
// baked-shaped config.json, derived from a compiled layered manifest's `bodyBounds`/`frames[].
// o`/`sequences`/`mirrors`. `atlasKey: null` on every entry — nothing names a baked atlas
// (sally has none), but every `window.avatars_config[avatarId]` consumer still sees a
// well-formed entry instead of `undefined`.

/**
 * @param {{ss:number, bodyBounds:{w:number,h:number}, frames:Record<string,{o:[number,number]}>, sequences:Record<string,{fps:number,repeat:number,frames:string[]}>, mirrors?:Record<string,{from:string,flipX:boolean}>}} manifest
 * @returns {Record<string, object>}
 */
function buildConfigShim(manifest) {
  const shim = {};
  const frameWidth = Math.round(manifest.bodyBounds.w * manifest.ss);
  const frameHeight = Math.round(manifest.bodyBounds.h * manifest.ss);

  for (const [key, seq] of Object.entries(manifest.sequences)) {
    const firstFrame = manifest.frames[seq.frames[0]];
    shim[key] = {
      atlasKey: null,
      prefix: `sprites/${key}/`,
      flip_horizontally: false,
      start: 1,
      end: seq.frames.length,
      frameRate: seq.fps,
      frameWidth,
      frameHeight,
      repeat: seq.repeat,
      positionX: Math.round(firstFrame.o[0] * manifest.ss),
      positionY: Math.round(firstFrame.o[1] * manifest.ss),
    };
  }

  for (const [mirrorKey, mirrorInfo] of Object.entries(manifest.mirrors || {})) {
    const source = shim[mirrorInfo.from];
    if (source) {
      shim[mirrorKey] = { ...source, flip_horizontally: true };
    }
  }

  return shim;
}

module.exports = { buildConfigShim };
