import { describe, it, expect } from 'vitest';
import { listLayeredCharacters, characterNameForAvatarId } from './listLayeredCharacters.js';
import AvatarEnum from '@/enums/AvatarEnum.js';

// avatar-system-multichar-fixes (coordinator addendum, character-switcher): pure filter+sort
// logic for the debug panel's character dropdown, decoupled from AvatarManager's own
// Phaser-adjacent loader graph — the caller resolves `isLayered` per candidate (e.g. via
// `avatarManager.isLayeredAvatar`), this module only decides which candidates make the list
// and in what order.
describe('listLayeredCharacters', () => {
  it('keeps only layered candidates, sorted ascending by name', () => {
    const candidates = [
      { avatarId: 12, name: 'rasta', isLayered: true },
      { avatarId: 11, name: 'ninja', isLayered: true },
      { avatarId: 6, name: 'ghost', isLayered: false },
    ];
    expect(listLayeredCharacters(candidates)).toEqual([
      { avatarId: 11, name: 'ninja' },
      { avatarId: 12, name: 'rasta' },
    ]);
  });

  it('returns an empty array when no candidate is layered', () => {
    const candidates = [
      { avatarId: 6, name: 'ghost', isLayered: false },
      { avatarId: 15, name: 'wraith', isLayered: false },
    ];
    expect(listLayeredCharacters(candidates)).toEqual([]);
  });

  it('drops the isLayered field from the returned shape', () => {
    const candidates = [{ avatarId: 18, name: 'sally', isLayered: true }];
    expect(listLayeredCharacters(candidates)).toEqual([{ avatarId: 18, name: 'sally' }]);
  });
});

// Live-caught defect (confirmed against the real Docker-built client, switching to sally):
// AvatarManager.getAvatarName's own hardcoded `avatarNames` dict never got a SALLY entry
// (avatar-system-multichar-fixes slice 10 added her as a NEW client-side id, id 18, after
// that dict was written) — falls through to its own "unknown" default. The debug panel's
// switch-success message used getAvatarName and displayed "Switched to unknown", exposing a
// pre-existing gap. `characterNameForAvatarId` resolves through the SAME AvatarEnum
// reverse-lookup this module's own `listLayeredCharacters` candidates are built from instead
// (covers every AvatarEnum entry, sally included), used by the debug panel in place of
// getAvatarName for its own new code only — AvatarManager.getAvatarName itself is untouched
// (out of scope, and other production call sites' behaviour for it is unaffected).
describe('characterNameForAvatarId', () => {
  it('resolves the lowercased AvatarEnum key for a known id', () => {
    expect(characterNameForAvatarId(AvatarEnum.RASTA, AvatarEnum)).toBe('rasta');
  });

  it('resolves SALLY specifically — the id AvatarManager.getAvatarName is missing', () => {
    expect(characterNameForAvatarId(AvatarEnum.SALLY, AvatarEnum)).toBe('sally');
  });

  it('returns null for an id with no matching AvatarEnum entry, never throws', () => {
    expect(characterNameForAvatarId(9999, AvatarEnum)).toBeNull();
  });
});
