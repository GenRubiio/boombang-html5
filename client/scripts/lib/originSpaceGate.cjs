// design.md §5.4: hard compile gate — the whole vector->raster action-compile slice rests on
// the vector (actions) and raster (base layers) packages sharing one rig coordinate space.
// Corroborated by the existing hat/pet accessory pipeline (which already subtracts a raster
// body's `o` from a vector accessory's origin and lands correctly) but checked per character,
// not trusted.

const TOLERANCE = 1; // logical units, per axis

/**
 * @param {[number, number]} vectorOrigin the vector (actions) package's `down_idle` frame `o`
 * @param {[number, number]} rasterOrigin the raster (base layers) package's `down_idle` frame `o`
 * @throws {Error} if either axis differs by more than 1 logical unit
 */
function assertOriginSpaceMatch(vectorOrigin, rasterOrigin) {
  const dx = Math.abs(vectorOrigin[0] - rasterOrigin[0]);
  const dy = Math.abs(vectorOrigin[1] - rasterOrigin[1]);

  if (dx > TOLERANCE || dy > TOLERANCE) {
    throw new Error(
      `compile-layered-avatar: origin-space mismatch for down_idle — vector o=${JSON.stringify(vectorOrigin)}, raster o=${JSON.stringify(rasterOrigin)} (diff [${dx}, ${dy}] exceeds ${TOLERANCE} logical unit per axis). The vector and raster packages do not share one rig space (design.md §5.4).`
    );
  }
}

module.exports = { assertOriginSpaceMatch };
