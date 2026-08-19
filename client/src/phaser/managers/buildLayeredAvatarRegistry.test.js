// design.md §14 cost 14 (tasks.md slice 9 task 3): groups a flat `import.meta.glob` result for
// `client/src/assets/game/avatars/<char>/layers/*` into per-character loader maps, and derives
// the avatarId->characterName registry (`LAYERED_CHARACTERS`) from AvatarEnum + which
// characters actually have a compiled manifest — replacing 5 hand-maintained literal maps.

import { describe, it, expect } from 'vitest';
import {
  extractLayeredCharacterName,
  groupLayeredLoadersByCharacter,
  buildLayeredCharacterRegistry,
} from './buildLayeredAvatarRegistry.js';

describe('extractLayeredCharacterName', () => {
  it('extracts the character name from a real layered-avatar asset path', () => {
    expect(
      extractLayeredCharacterName('/src/assets/game/avatars/rasta/layers/rasta.layers.manifest.json')
    ).toBe('rasta');
  });

  it('extracts the character name from a multi-page actions webp path', () => {
    expect(
      extractLayeredCharacterName('/src/assets/game/avatars/rasta/layers/rasta.actions_2.webp')
    ).toBe('rasta');
  });

  it('throws on a malformed path with no "avatars/<char>/layers/" segment', () => {
    expect(() => extractLayeredCharacterName('/src/assets/game/nope.json')).toThrow(/malformed/i);
  });
});

describe('groupLayeredLoadersByCharacter', () => {
  it('sorts a multi-page character\'s loaders in ascending path order (page 0 first)', () => {
    const p3 = () => {};
    const p1 = () => {};
    const p2 = () => {};
    const globEntries = {
      '/src/assets/game/avatars/rasta/layers/rasta.actions_2.webp': p3,
      '/src/assets/game/avatars/rasta/layers/rasta.actions.webp': p1,
      '/src/assets/game/avatars/rasta/layers/rasta.actions_1.webp': p2,
    };
    const result = groupLayeredLoadersByCharacter(globEntries);
    expect(result.rasta).toEqual([p1, p2, p3]);
  });

  it('groups two different characters into two separate arrays', () => {
    const rastaFn = () => {};
    const lilianFn = () => {};
    const globEntries = {
      '/src/assets/game/avatars/rasta/layers/rasta.layers.manifest.json': rastaFn,
      '/src/assets/game/avatars/lilian/layers/lilian.layers.manifest.json': lilianFn,
    };
    const result = groupLayeredLoadersByCharacter(globEntries);
    expect(result).toEqual({ rasta: [rastaFn], lilian: [lilianFn] });
  });
});

describe('buildLayeredCharacterRegistry', () => {
  const avatarEnumEntries = { RASTA: 12, LILIAN: 8, GHOST: 6 };

  it('maps avatarId to character name for every character with a compiled manifest', () => {
    const result = buildLayeredCharacterRegistry(['rasta', 'lilian'], avatarEnumEntries);
    expect(result).toEqual({ 12: 'rasta', 8: 'lilian' });
  });

  it('excludes a character with no matching AvatarEnum entry (e.g. a typo or unregistered id)', () => {
    const result = buildLayeredCharacterRegistry(['rasta', 'unknownchar'], avatarEnumEntries);
    expect(result).toEqual({ 12: 'rasta' });
  });
});
