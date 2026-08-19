import { describe, it, expect } from 'vitest';
import avatarManager from './AvatarManager.js';
import AvatarEnum from '@/enums/AvatarEnum.js';

// avatar-system-multichar-fixes (coordinator addendum, character-switcher): the debug panel
// needs slot/label metadata for ANY compiled character, not just rasta, WITHOUT requiring a
// live Phaser scene (the panel can mount before any scene exists). `loadLayeredAvatar(scene,
// avatarId)` cannot serve this — it needs `scene.load`/`scene.textures` for the atlas/webp
// half of the load. `getOrLoadLayeredManifest` splits out the manifest-only half (no scene
// argument), reusing the same `LAYERED_MANIFEST_LOADERS` glob-derived map
// `loadLayeredAvatar` already uses internally, and caching into the SAME `layeredManifests`
// map `getLayeredManifest` reads (so a later `loadLayeredAvatar` call for the same avatarId
// is not a wasted re-fetch, and a real scene-driven load later still sees a warm cache).
describe('AvatarManager.getOrLoadLayeredManifest', () => {
  it('resolves a real compiled character\'s manifest, with a genuine, non-empty slots array', async () => {
    const manifest = await avatarManager.getOrLoadLayeredManifest(AvatarEnum.RASTA);
    expect(manifest).not.toBeNull();
    expect(Array.isArray(manifest.slots)).toBe(true);
    expect(manifest.slots.length).toBeGreaterThan(0);
  });

  it('resolves a DIFFERENT character to a DIFFERENT manifest (no cross-character caching bleed)', async () => {
    const rasta = await avatarManager.getOrLoadLayeredManifest(AvatarEnum.RASTA);
    const sally = await avatarManager.getOrLoadLayeredManifest(AvatarEnum.SALLY);
    expect(sally).not.toBeNull();
    expect(sally).not.toBe(rasta);
    // Live-checked ground truth on the compiled file (2026-08-19): sally's own manifest
    // carries exactly the universal glove slot, with no label and no default for it — NOT
    // zero slots as tasks.md slice 22's narrative claims (apply-progress.md's own account
    // predates whichever later batch recompile added the universal `colorGuante` slot to
    // every character, sally included; not re-verified here beyond this direct read).
    expect(sally.slots).toEqual(['colorGuante']);
    expect(sally.labels).toEqual({});
    expect(sally.defaults).toEqual({});
  });

  it('returns null for a character with no compiled layered manifest (ghost, slice 23 open)', async () => {
    const manifest = await avatarManager.getOrLoadLayeredManifest(AvatarEnum.GHOST);
    expect(manifest).toBeNull();
  });

  it('caches the resolved manifest so a second call returns the SAME object reference', async () => {
    const first = await avatarManager.getOrLoadLayeredManifest(AvatarEnum.RASTA);
    const second = await avatarManager.getOrLoadLayeredManifest(AvatarEnum.RASTA);
    expect(second).toBe(first);
  });
});

// god apply pass (2026-08-19): `getAvatarName`'s own hardcoded `avatarNames` dict never got a
// SALLY entry when she was registered (slice 10) — `AvatarLookDebugPanel.vue`'s switch-success
// message used it and showed "Switched to unknown" (slice 34's own disclosed gap, fixed there
// only for ITS OWN new code via a separate `characterNameForAvatarId` helper, leaving this
// method itself unfixed). Fixed here, at the source, per this pass's own explicit instruction —
// every OTHER caller of `getAvatarName` (`loadAvatar`, `getSmartAvatarPathV2`,
// `AssetVersionManager.js`) gets the same correction for free.
describe('AvatarManager.getAvatarName', () => {
  it('resolves every already-registered character to its real name, not "unknown"', () => {
    expect(avatarManager.getAvatarName(AvatarEnum.RASTA)).toBe('rasta');
    expect(avatarManager.getAvatarName(AvatarEnum.ZOMBIE)).toBe('zombie');
  });

  it('resolves SALLY to "sally" (the disclosed pre-existing gap this pass was asked to close)', () => {
    expect(avatarManager.getAvatarName(AvatarEnum.SALLY)).toBe('sally');
  });

  it('resolves GOD to "god" (registered in this same pass)', () => {
    expect(avatarManager.getAvatarName(AvatarEnum.GOD)).toBe('god');
  });

  it('still falls back to "unknown" for an avatarId with no registration at all', () => {
    expect(avatarManager.getAvatarName(9999)).toBe('unknown');
  });
});
