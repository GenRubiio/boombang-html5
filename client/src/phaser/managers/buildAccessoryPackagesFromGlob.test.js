// design.md §7/§14 cost 14 (tasks.md slice 9 task 3): groups a flat `import.meta.glob` result
// (`{path: importerFn}`) into the same `{registryKey: {manifest, atlas, webp}}` shape the
// hand-maintained `ACCESSORY_PACKAGES` literal map used to declare, via
// `parseAccessoryAssetPath`. Pure — the real `import.meta.glob(...)` call itself is the one
// line of I/O-shell wiring in `AccessoryManager.js`.

import { describe, it, expect } from 'vitest';
import { buildAccessoryPackagesFromGlob } from './buildAccessoryPackagesFromGlob.js';

describe('buildAccessoryPackagesFromGlob', () => {
  it('groups a hat package into one registry key with 3 file roles, webp as a single-entry array', () => {
    const manifestFn = () => {};
    const atlasFn = () => {};
    const webpFn = () => {};
    const globEntries = {
      '/src/assets/game/accessories/hat/rasta/minnieHat/minnieHat.accessory.json': manifestFn,
      '/src/assets/game/accessories/hat/rasta/minnieHat/minnieHat.hat.atlas.json': atlasFn,
      '/src/assets/game/accessories/hat/rasta/minnieHat/minnieHat.hat.webp': webpFn,
    };
    const result = buildAccessoryPackagesFromGlob(globEntries);
    expect(Object.keys(result)).toEqual(['rasta:hat:minnieHat']);
    expect(result['rasta:hat:minnieHat']).toEqual({ manifest: manifestFn, atlas: atlasFn, webp: [webpFn] });
  });

  // Live-caught defect (tasks.md slice 28-31, apply-progress.md): a multi-page accessory package
  // (any hat needing >1 page — brujita's `pineappleHat` measured at 3, most hats at 2, per the
  // real batch compile) has MULTIPLE `.webp` files (`X.hat.webp`, `X.hat_1.webp`, ...), but the
  // old scalar-overwrite implementation (`packages[registryKey][role] = importerFn`) kept only
  // the LAST one seen, silently discarding every earlier page's own loader. `AccessoryManager
  // .load()` then patched EVERY page's `atlas.json` `image` field to that ONE surviving webp URL
  // — every page beyond the first would render page-0's pixel data cropped at page-N's frame
  // coordinates. Mirrors `groupLayeredActionKeyLoaders.js`'s already-correct `webp: Function[]`
  // array shape (the body's own per-key action packs use exactly this pattern, proven live by
  // the whole roster's action packs rendering correctly) — accessories needed the same fix.
  it('collects ALL webp pages for a multi-page package into one array, sorted so page 0 is first', () => {
    const page0Fn = () => {};
    const page1Fn = () => {};
    const page2Fn = () => {};
    const globEntries = {
      // Deliberately out of page order in the input — the function must sort by path, not trust
      // insertion order (matching groupLayeredLoadersByCharacter's own documented contract).
      '/src/assets/game/accessories/hat/brujita/pineappleHat/pineappleHat.hat_2.webp': page2Fn,
      '/src/assets/game/accessories/hat/brujita/pineappleHat/pineappleHat.hat.webp': page0Fn,
      '/src/assets/game/accessories/hat/brujita/pineappleHat/pineappleHat.hat_1.webp': page1Fn,
    };
    const result = buildAccessoryPackagesFromGlob(globEntries);
    expect(result['brujita:hat:pineappleHat'].webp).toEqual([page0Fn, page1Fn, page2Fn]);
  });

  it('groups an aura package (no character segment) under the "*" wildcard key', () => {
    const globEntries = {
      '/src/assets/game/accessories/aura/auraElectrica/auraElectrica.accessory.json': () => {},
      '/src/assets/game/accessories/aura/auraElectrica/auraElectrica.aura.atlas.json': () => {},
      '/src/assets/game/accessories/aura/auraElectrica/auraElectrica.aura.webp': () => {},
    };
    const result = buildAccessoryPackagesFromGlob(globEntries);
    expect(Object.keys(result)).toEqual(['*:aura:auraElectrica']);
  });

  it('keeps two characters sharing one key (Custom6Hat) as two distinct registry entries', () => {
    const globEntries = {
      '/src/assets/game/accessories/hat/rasta/Custom6Hat/Custom6Hat.accessory.json': () => {},
      '/src/assets/game/accessories/hat/lilian/Custom6Hat/Custom6Hat.accessory.json': () => {},
    };
    const result = buildAccessoryPackagesFromGlob(globEntries);
    expect(Object.keys(result).sort()).toEqual(['lilian:hat:Custom6Hat', 'rasta:hat:Custom6Hat']);
  });
});
