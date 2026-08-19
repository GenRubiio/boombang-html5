// design.md §7/§12.3 (tasks.md slice 9 task 1): parses a compiled accessory asset's own path
// into `{kind, character, key}` — the population mechanism `import.meta.glob` needs (task 3),
// replacing the hand-maintained `ACCESSORY_PACKAGES` literal map. A path with no character
// segment (auras, ACC2) resolves `character: '*'`.

import { describe, it, expect } from 'vitest';
import { parseAccessoryAssetPath } from './parseAccessoryAssetPath.js';

describe('parseAccessoryAssetPath', () => {
  it('parses a hat path with a character segment', () => {
    expect(
      parseAccessoryAssetPath('/src/assets/game/accessories/hat/rasta/minnieHat/minnieHat.accessory.json')
    ).toEqual({ kind: 'hat', character: 'rasta', key: 'minnieHat' });
  });

  it('parses a pet path with a character segment', () => {
    expect(
      parseAccessoryAssetPath('/src/assets/game/accessories/pet/rasta/pet09/pet09.pet.atlas.json')
    ).toEqual({ kind: 'pet', character: 'rasta', key: 'pet09' });
  });

  it('parses an aura path with no character segment as character "*"', () => {
    expect(
      parseAccessoryAssetPath('/src/assets/game/accessories/aura/auraElectrica/auraElectrica.aura.webp')
    ).toEqual({ kind: 'aura', character: '*', key: 'auraElectrica' });
  });

  it('resolves a different character for the same shared key (Custom6Hat, lilian vs rasta)', () => {
    const rasta = parseAccessoryAssetPath('/src/assets/game/accessories/hat/rasta/Custom6Hat/Custom6Hat.accessory.json');
    const lilian = parseAccessoryAssetPath('/src/assets/game/accessories/hat/lilian/Custom6Hat/Custom6Hat.accessory.json');
    expect(rasta.character).toBe('rasta');
    expect(lilian.character).toBe('lilian');
    expect(rasta.key).toBe(lilian.key);
  });

  it('throws on a malformed path with too few segments', () => {
    expect(() => parseAccessoryAssetPath('/src/assets/game/accessories/hat/onlyOneSegment.json')).toThrow(
      /malformed|unexpected/i
    );
  });
});
