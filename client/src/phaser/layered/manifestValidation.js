// Manifest structural validation (avatar-palette PAL1/PAL2). Pure module: no Phaser
// instantiation, no filesystem access — every check operates on an already-parsed manifest
// object.

const REQUIRED_FIELDS = [
  'v',
  'character',
  'ss',
  'slots',
  'defaults',
  'bodyBounds',
  'pieces',
  'frames',
  'sequences',
];

/**
 * PAL1: slot-key membership MUST check the character's own declared slot set, never a
 * numeric-pattern match such as `color[1-9]`.
 */
function isKnownSlot(manifest, slotKey) {
  return Array.isArray(manifest.slots) && manifest.slots.includes(slotKey);
}

/**
 * Throws a functional (never disconnect-worthy) error for an unknown slot key.
 */
function assertKnownSlot(manifest, slotKey) {
  if (!isKnownSlot(manifest, slotKey)) {
    throw new Error(
      `manifestValidation: unknown slot key "${slotKey}" for character "${manifest.character}"`
    );
  }
}

/**
 * Structural validation of a loaded layered-avatar manifest: required fields present, and
 * ss === 2 (the raster pixel-dimension check itself happens at compile time —
 * scripts/lib/validateSupersampling.cjs — the runtime can only re-assert the declared value).
 */
function validateManifest(manifest) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in manifest)) {
      throw new Error(`manifestValidation: manifest is missing required field "${field}"`);
    }
  }
  if (manifest.ss !== 2) {
    throw new Error(`manifestValidation: expected ss:2, got ss:${manifest.ss}`);
  }
}

export { isKnownSlot, assertKnownSlot, validateManifest };
