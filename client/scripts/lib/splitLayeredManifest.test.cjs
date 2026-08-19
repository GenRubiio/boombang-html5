// design.md §13.2 (tasks.md slice 14 task 1): pure split of one compiled manifest object into
// the base (`<char>.layers.manifest.json`) and actions (`<char>.actions.manifest.json`) shapes.
// `sequences`/`aliases`/`mirrors` MUST stay in the base output regardless of which pack they
// reference — `resolveAnimationKey`/`computeActionBackedKeys` need to know an action exists,
// and which pack backs it, before any action pack is ever fetched (design.md §13.2).

import { describe, it, expect } from 'vitest'
import { splitLayeredManifest } from './splitLayeredManifest.cjs'

function makeManifest({ withActionPieces = true } = {}) {
  const pieces = {
    p0: { frame: { x: 0, y: 0, w: 10, h: 10 }, page: 0, w: 5, h: 5, slot: 'color1', pack: 'base' },
    p1: { frame: { x: 10, y: 0, w: 10, h: 10 }, page: 0, w: 5, h: 5, slot: null, pack: 'base' },
  };
  const frames = {
    0: { o: [1, 2], L: [{ p: 'p0', dx: 1, dy: 1 }] },
  };
  if (withActionPieces) {
    pieces.p2 = { frame: { x: 0, y: 0, w: 8, h: 8 }, page: 0, w: 4, h: 4, slot: 'color1', pack: 'actions' };
    frames.a0 = { o: [3, 4], L: [{ p: 'p2', dx: 2, dy: 2 }] };
  }
  return {
    v: 1,
    compilerVersion: 'x',
    sourceHash: 'abc',
    character: 'rasta',
    ss: 2,
    slots: ['color1'],
    defaults: { color1: 'b88a5c' },
    labels: {},
    compatibleHats: [],
    bodyBounds: { w: 100, h: 200 },
    pieces,
    frames,
    sequences: { down_idle: { fps: 19, repeat: -1, frames: [0] } },
    aliases: {},
    mirrors: {},
  };
}

describe('splitLayeredManifest', () => {
  it('keeps every character-level field (slots/defaults/labels/bodyBounds/ss/sequences/aliases/mirrors) on the base output, referencing only base sequences', () => {
    const manifest = makeManifest({ withActionPieces: false });
    const { layers, actions } = splitLayeredManifest(manifest);

    expect(layers.slots).toEqual(manifest.slots);
    expect(layers.defaults).toEqual(manifest.defaults);
    expect(layers.labels).toEqual(manifest.labels);
    expect(layers.bodyBounds).toEqual(manifest.bodyBounds);
    expect(layers.ss).toBe(manifest.ss);
    expect(layers.sequences).toEqual(manifest.sequences);
    expect(layers.aliases).toEqual({});
    expect(layers.mirrors).toEqual({});
    expect(layers.pieces).toEqual({ p0: manifest.pieces.p0, p1: manifest.pieces.p1 });
    expect(layers.frames).toEqual({ 0: manifest.frames[0] });
    expect(actions.pieces).toEqual({});
    expect(actions.frames).toEqual({});
  });

  it('routes a sequence referencing an action-pack frame id into the actions output, while the sequence dict itself stays on the base output', () => {
    const manifest = makeManifest({ withActionPieces: true });
    // design.md §13.3 (tasks.md slice 15): `pack` is now the SPECIFIC per-key packId (e.g.
    // "down_llorar"), never the literal string "actions" — a piece-partition check that only
    // matched `pack === 'actions'` would silently classify every real action piece as base.
    manifest.pieces.p2.pack = 'down_llorar';
    manifest.sequences.down_llorar = { fps: 19, repeat: 0, frames: ['a0'], pack: 'down_llorar' };
    manifest.aliases.llorar = 'down_llorar';

    const { layers, actions } = splitLayeredManifest(manifest);

    // the sequence/alias dictionaries are unconditionally on the base output (design.md §13.2)
    expect(layers.sequences.down_llorar).toEqual(manifest.sequences.down_llorar);
    expect(layers.aliases).toEqual({ llorar: 'down_llorar' });
    // the actual frame/piece data the sequence points at is split by pack
    expect(layers.frames).toEqual({ 0: manifest.frames[0] });
    expect(layers.pieces).toEqual({ p0: manifest.pieces.p0, p1: manifest.pieces.p1 });
    expect(actions.frames).toEqual({ a0: manifest.frames.a0 });
    expect(actions.pieces).toEqual({ p2: manifest.pieces.p2 });
  });

  it('produces an empty actions output for a manifest with no compiled action set at all', () => {
    const manifest = makeManifest({ withActionPieces: false });
    const { actions } = splitLayeredManifest(manifest);
    expect(actions).toEqual({ pieces: {}, frames: {} });
  });

  it('does not mutate the input manifest', () => {
    const manifest = makeManifest();
    const before = JSON.parse(JSON.stringify(manifest));
    splitLayeredManifest(manifest);
    expect(manifest).toEqual(before);
  });

  // design.md §13.7 (tasks.md slice 20 task 3): `ssOverrides` is a character-level field (the
  // reported ss:1-selected key set), so it belongs on the base output alongside
  // slots/defaults/labels/bodyBounds/ss/sequences/aliases/mirrors, not split by pack.
  it('keeps ssOverrides on the base output when the manifest carries a real override', () => {
    const manifest = makeManifest();
    manifest.ssOverrides = { left_fall: 1 };
    const { layers } = splitLayeredManifest(manifest);
    expect(layers.ssOverrides).toEqual({ left_fall: 1 });
  });

  it('is backward-compatible with a manifest compiled before ssOverrides existed (field absent, not thrown)', () => {
    const manifest = makeManifest();
    const { layers } = splitLayeredManifest(manifest);
    expect(layers.ssOverrides).toBeUndefined();
  });

  // Live defect fix (tasks.md slice 26): `maxFramePieces` is a character-level fact
  // (`LayeredAvatar.computeMaxPoolSize` needs it BEFORE any action pack loads), so it belongs
  // on the base output exactly like `ssOverrides` — computed once across base+action frames,
  // never split by pack.
  it('keeps maxFramePieces on the base output', () => {
    const manifest = makeManifest();
    manifest.maxFramePieces = 72;
    const { layers } = splitLayeredManifest(manifest);
    expect(layers.maxFramePieces).toBe(72);
  });

  it('is backward-compatible with a manifest compiled before maxFramePieces existed (field absent, not thrown)', () => {
    const manifest = makeManifest();
    const { layers } = splitLayeredManifest(manifest);
    expect(layers.maxFramePieces).toBeUndefined();
  });
});
