// tasks.md slice 21 defect-1 fix (coordinator-flagged): a small pure helper backing the new
// PIXEL-level resolved-state check in `avatar-resolved-state.spec.js`. `hexToRgb` parses a
// manifest-style hex colour (with or without a leading `#`); `buildSolidRgbaBuffer` produces a
// solid-colour RGBA buffer at full alpha, in the exact shape `shared/assetPipeline/
// compareRasters.js`'s already-tested `diffRgbaBuffers` expects, so the new test REUSES that
// comparator against a real screenshot sample instead of writing a second one.

function hexToRgb(hex) {
  const clean = String(hex).replace('#', '');
  const value = parseInt(clean, 16);
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
}

function buildSolidRgbaBuffer(width, height, hex) {
  const { r, g, b } = hexToRgb(hex);
  const buffer = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const offset = i * 4;
    buffer[offset] = r;
    buffer[offset + 1] = g;
    buffer[offset + 2] = b;
    buffer[offset + 3] = 255;
  }
  return buffer;
}

module.exports = { hexToRgb, buildSolidRgbaBuffer };
