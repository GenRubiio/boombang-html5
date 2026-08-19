// Slice 7 (design.md §11, tasks.md slice 7): unit tests for the pure functions backing
// window.__avatarMetrics(). The aggregator wiring itself (PRE_RENDER/POST_RENDER event
// listeners, live scene traversal) is the I/O shell and is not unit-tested here, matching the
// project's own pattern for LayeredAvatar.js/PerfHarness.js wiring — only the pure logic these
// functions extract is.

import { describe, it, expect } from 'vitest';
import {
  classifySequenceKey,
  computeParseComposition,
  computeResidentAvatarBytes,
  meanOf,
  recordRenderSample,
  computeDurationMs,
  collectResidentAtlasPages,
  aggregateParseComposition,
} from './avatarMetrics.js';

describe('classifySequenceKey', () => {
  it('classifies idle/walk/talk keys as loop', () => {
    expect(classifySequenceKey('down_idle')).toBe('loop');
    expect(classifySequenceKey('left_walk')).toBe('loop');
    expect(classifySequenceKey('down_talk')).toBe('loop');
  });

  it('classifies punch keys as punch', () => {
    expect(classifySequenceKey('leftdown_punch_rec')).toBe('punch');
    expect(classifySequenceKey('right_punch_doy')).toBe('punch');
  });

  it('classifies everything else as other', () => {
    expect(classifySequenceKey('llorar')).toBe('other');
    expect(classifySequenceKey('down_risa1')).toBe('other');
  });

  it('is case-insensitive', () => {
    expect(classifySequenceKey('DOWN_IDLE')).toBe('loop');
    expect(classifySequenceKey('Left_Punch_Rec')).toBe('punch');
  });
});

describe('computeParseComposition', () => {
  const manifest = {
    sequences: {
      down_idle: { frames: [1, 2, 3] },
      left_walk: { frames: [4, 5] },
      leftdown_punch_rec: { frames: [6, 7, 8, 9] },
      llorar: { frames: [10] },
    },
  };

  it('buckets sequences into loop/punch/other with resident counts', () => {
    const result = computeParseComposition(manifest, ['down_idle', 'llorar']);
    expect(result.loop).toEqual({ count: 2, frameCount: 5, residentCount: 1 });
    expect(result.punch).toEqual({ count: 1, frameCount: 4, residentCount: 0 });
    expect(result.other).toEqual({ count: 1, frameCount: 1, residentCount: 1 });
  });

  it('reports zero resident counts when nothing is resident', () => {
    const result = computeParseComposition(manifest, []);
    expect(result.loop.residentCount).toBe(0);
    expect(result.punch.residentCount).toBe(0);
    expect(result.other.residentCount).toBe(0);
  });
});

describe('computeResidentAvatarBytes', () => {
  it('sums w*h*4 over multiple pages', () => {
    const pages = [{ width: 2048, height: 2048 }, { width: 1024, height: 512 }];
    expect(computeResidentAvatarBytes(pages)).toBe(2048 * 2048 * 4 + 1024 * 512 * 4);
  });

  it('handles a single page', () => {
    expect(computeResidentAvatarBytes([{ width: 100, height: 50 }])).toBe(100 * 50 * 4);
  });

  it('returns 0 for zero pages', () => {
    expect(computeResidentAvatarBytes([])).toBe(0);
  });
});

describe('meanOf / recordRenderSample', () => {
  it('computes the mean of a sample array', () => {
    expect(meanOf([1, 2, 3])).toBeCloseTo(2, 5);
  });

  it('returns 0 for an empty array', () => {
    expect(meanOf([])).toBe(0);
  });

  it('appends a sample and caps the window at maxSamples', () => {
    const samples = recordRenderSample([1, 2, 3], 4, 3);
    expect(samples).toEqual([2, 3, 4]);
  });

  it('does not cap below maxSamples', () => {
    expect(recordRenderSample([1], 2, 5)).toEqual([1, 2]);
  });
});

describe('collectResidentAtlasPages', () => {
  function makeTextures(entries) {
    return {
      exists: (key) => key in entries,
      get: (key) => entries[key],
    };
  }

  it('collects sources of every distinct resident atlas key used by layered avatars, including every entry of a Map-shaped per-key actions field', () => {
    const users = {
      a: { spriteAvatar: { isLayered: true, _atlasKeys: { base: 'rasta_base', actions: new Map() } } },
      b: { spriteAvatar: { isLayered: true, _atlasKeys: { base: 'rasta_base', actions: new Map([['down_llorar', 'rasta_actions_down_llorar']]) } } },
    };
    const textures = makeTextures({
      rasta_base: { source: [{ width: 2048, height: 2048 }] },
      rasta_actions_down_llorar: { source: [{ width: 2048, height: 1024 }, { width: 2048, height: 512 }] },
    });
    const pages = collectResidentAtlasPages(users, textures);
    expect(pages).toEqual([
      { width: 2048, height: 2048 },
      { width: 2048, height: 1024 },
      { width: 2048, height: 512 },
    ]);
  });

  it('skips a non-existent atlas key and a non-layered avatar', () => {
    const users = {
      a: { spriteAvatar: { isLayered: true, _atlasKeys: { base: 'missing_base', actions: new Map() } } },
      b: { spriteAvatar: { isLayered: false } },
    };
    const textures = makeTextures({});
    expect(collectResidentAtlasPages(users, textures)).toEqual([]);
  });

  it('collects pages from TWO different loaded per-key action packs on the same avatar, not just one', () => {
    const users = {
      a: {
        spriteAvatar: {
          isLayered: true,
          _atlasKeys: {
            base: 'rasta_base',
            actions: new Map([
              ['down_llorar', 'rasta_actions_down_llorar'],
              ['leftdown_punch_rec', 'rasta_actions_leftdown_punch_rec'],
            ]),
          },
        },
      },
    };
    const textures = makeTextures({
      rasta_base: { source: [{ width: 2048, height: 2048 }] },
      rasta_actions_down_llorar: { source: [{ width: 512, height: 512 }] },
      rasta_actions_leftdown_punch_rec: { source: [{ width: 1024, height: 1024 }] },
    });
    const pages = collectResidentAtlasPages(users, textures);
    expect(pages).toEqual([
      { width: 2048, height: 2048 },
      { width: 512, height: 512 },
      { width: 1024, height: 1024 },
    ]);
  });
});

describe('aggregateParseComposition', () => {
  it('merges parse composition across every layered avatar in the scene', () => {
    const manifest = {
      sequences: {
        down_idle: { frames: [1, 2] },
        llorar: { frames: [3] },
      },
      frames: {},
      pieces: {},
      aliases: {},
      mirrors: {},
    };
    const users = {
      a: { spriteAvatar: { isLayered: true, _manifest: manifest, _atlasKeys: { base: 'k', actions: new Map() } } },
      b: { spriteAvatar: { isLayered: true, _manifest: manifest, _atlasKeys: { base: 'k', actions: new Map([['llorar', 'k_actions_llorar']]) } } },
    };
    const result = aggregateParseComposition(users);
    // 'a' has no actions pack loaded -> llorar (action-backed via manifest.aliases/mirrors
    // detection is not exercised by this fixture, so both sequences are base-pack and resident
    // for 'a'); 'b' has actions loaded -> both resident too. Either way every key is resident
    // twice (once per avatar), which is the real assertion here.
    expect(result.loop.residentCount).toBe(2);
    expect(result.other.residentCount).toBe(2);
  });

  // design.md §13.3 (tasks.md slice 15): per-key residency — a Map is always truthy even when
  // empty, so a naive `!!atlasKeys.actions` boolean check would wrongly report every
  // action-backed key as resident the instant ANY one pack loaded. This fixture has TWO
  // action-backed keys backed by TWO DIFFERENT packs, only one of which is loaded.
  it('treats each action-backed key\'s residency independently, by its OWN pack, not by whether ANY pack has loaded', () => {
    const manifest = {
      sequences: {
        down_idle: { frames: [0], pack: 'base' },
        down_llorar: { frames: ['a0'], pack: 'down_llorar' },
        leftdown_punch_rec: { frames: ['a1'], pack: 'leftdown_punch_rec' },
      },
      frames: {},
      pieces: {},
      aliases: {},
      mirrors: {},
    };
    const users = {
      a: {
        spriteAvatar: {
          isLayered: true,
          _manifest: manifest,
          _atlasKeys: { base: 'k', actions: new Map([['down_llorar', 'k_actions_down_llorar']]) },
        },
      },
    };
    const result = aggregateParseComposition(users);
    // down_idle (base, always resident) + down_llorar (its pack IS loaded) = 2 resident 'other'
    // keys; leftdown_punch_rec (its pack is NOT loaded) must NOT be counted as resident.
    const totalResident = result.loop.residentCount + result.punch.residentCount + result.other.residentCount;
    expect(totalResident).toBe(2);
  });
});

describe('computeDurationMs', () => {
  it('computes a positive duration', () => {
    expect(computeDurationMs(100, 350)).toBe(250);
  });

  it('computes a zero duration for identical timestamps', () => {
    expect(computeDurationMs(500, 500)).toBe(0);
  });
});
