// design.md §11 (tasks.md slice 7): production-parity metrics, mirroring the reference
// implementation's own instrumentation field for field so §12's spike is an A/B rather than
// two incomparable reports. Renderer-agnostic by construction: every field below is computed
// from data both the raster and (future) vector paths expose the same way.
//
// This file separates pure, unit-testable logic from the I/O shell that wires it to a live
// Phaser scene (createAvatarMetricsAggregator, at the bottom) — the same split LayeredAvatar.js
// and PerfHarness.js already use (design.md §8): the wiring itself is not unit-tested directly.

import { computeActionBackedKeys } from '../layered/actionPack.js';
// design.md §8: imported from canvasTint.js specifically, NOT canvasTintCache.js — the latter
// imports `phaser` directly (needed for `Phaser.CANVAS`/`scene.textures`), which throws in this
// file's own node/no-DOM unit-test environment (avatarMetrics.test.js). canvasTint.js owns the
// cache Map itself precisely so this read-only accessor can stay Phaser-import-free.
import { getTintCacheStats, computeTintCacheBytes } from '../layered/canvasTint.js';

/**
 * Mirrors the reference implementation's own classifier (design.md §12.6): `/idle|walk|talk/i`
 * -> loop, `punch` -> punch (case-insensitive), else other.
 *
 * @param {string} key a `manifest.sequences`/alias/mirror key, e.g. "down_idle", "llorar"
 * @returns {'loop'|'punch'|'other'}
 */
function classifySequenceKey(key) {
  if (/idle|walk|talk/i.test(key)) return 'loop';
  if (/punch/i.test(key)) return 'punch';
  return 'other';
}

/**
 * Buckets every sequence key in a compiled manifest into loop/punch/other (design.md §11's
 * `parseComposition` field), reporting how many of each bucket's keys are in `residentKeys`
 * (whatever the caller considers "currently loaded/parsed" for that manifest — e.g. every base
 * key for the raster path, or the vector path's per-bucket lazy-parsed set once §12 exists).
 *
 * @param {{sequences: Record<string, {frames: any[]}>}} manifest
 * @param {string[]} [residentKeys]
 * @returns {{loop: {count:number,frameCount:number,residentCount:number}, punch: {...}, other: {...}}}
 */
function computeParseComposition(manifest, residentKeys = []) {
  const residentSet = new Set(residentKeys);
  const buckets = {
    loop: { count: 0, frameCount: 0, residentCount: 0 },
    punch: { count: 0, frameCount: 0, residentCount: 0 },
    other: { count: 0, frameCount: 0, residentCount: 0 },
  };

  for (const [key, seq] of Object.entries(manifest.sequences || {})) {
    const bucket = buckets[classifySequenceKey(key)];
    bucket.count += 1;
    bucket.frameCount += (seq.frames || []).length;
    if (residentSet.has(key)) bucket.residentCount += 1;
  }

  return buckets;
}

/**
 * design.md §11's `residentAvatarBytes`: Sigma w*h*4 over resident atlas pages (base pack pages,
 * action pack pages once loaded, and — under the vector path — runtime bake pages, all measured
 * the same way since a `CanvasTexture` page reports the same `width`/`height`).
 *
 * @param {{width:number,height:number}[]} pages
 * @returns {number}
 */
function computeResidentAvatarBytes(pages = []) {
  return pages.reduce((sum, page) => sum + page.width * page.height * 4, 0);
}

/**
 * @param {number[]} samples
 * @returns {number} arithmetic mean, or 0 for an empty array
 */
function meanOf(samples) {
  if (!samples.length) return 0;
  return samples.reduce((sum, v) => sum + v, 0) / samples.length;
}

/**
 * Pure accumulator step for `renderMs` (design.md §11): appends `durationMs` to `samples`,
 * dropping the oldest entry once the window exceeds `maxSamples`. Kept pure (returns a new
 * array) so the PRE_RENDER/POST_RENDER wiring that calls this is a thin, untested I/O shell.
 *
 * @param {number[]} samples
 * @param {number} durationMs
 * @param {number} [maxSamples]
 * @returns {number[]}
 */
function recordRenderSample(samples, durationMs, maxSamples = 60) {
  const next = [...samples, durationMs];
  if (next.length > maxSamples) next.shift();
  return next;
}

/**
 * Shared start/end timestamp diff behind `timeToFirstRender`/`timeToPlayCold` (design.md §11).
 *
 * @param {number} startTs
 * @param {number} endTs
 * @returns {number}
 */
function computeDurationMs(startTs, endTs) {
  return endTs - startTs;
}

/**
 * design.md §11's `residentAvatarBytes`, scene-level: walks every layered avatar in `users`,
 * collects each DISTINCT atlas key currently resident (`_atlasKeys.base`, and `_atlasKeys.actions`
 * once loaded), and returns one `{width,height}` entry per texture source page found for it.
 * Deduplicates by atlas key so two users sharing the same character's atlas are counted once,
 * matching how the underlying GPU texture is shared.
 *
 * @param {Record<string, {spriteAvatar?: any}>} users
 * @param {{exists(key:string):boolean, get(key:string):{source:{width:number,height:number}[]}}} textures
 * @returns {{width:number,height:number}[]}
 */
function collectResidentAtlasPages(users, textures) {
  const seenKeys = new Set();
  const pages = [];
  Object.values(users || {}).forEach((user) => {
    const avatar = user && user.spriteAvatar;
    if (!avatar || !avatar.isLayered || !avatar._atlasKeys) return;
    // design.md §13.3 (tasks.md slice 15): `_atlasKeys.actions` is a `Map<packId, atlasKey>` —
    // every loaded per-key pack's atlas key is its own resident page source, not just one.
    const actionAtlasKeys = avatar._atlasKeys.actions ? [...avatar._atlasKeys.actions.values()] : [];
    [avatar._atlasKeys.base, ...actionAtlasKeys].forEach((key) => {
      if (!key || seenKeys.has(key)) return;
      seenKeys.add(key);
      if (!textures.exists(key)) return;
      const texture = textures.get(key);
      (texture.source || []).forEach((source) => {
        pages.push({ width: source.width, height: source.height });
      });
    });
  });
  return pages;
}

/**
 * design.md §11's `parseComposition`, scene-level: runs `computeParseComposition` for every
 * layered avatar's manifest and merges the per-bucket counts. A sequence is resident for a given
 * avatar when its backing pack is currently loaded — every base-pack sequence always is; an
 * action-pack sequence is resident only once that avatar's `_atlasKeys.actions` is set (design.md
 * §6's lazy action pack). Reuses `computeActionBackedKeys` (actionPack.js) rather than
 * reimplementing the pack classifier a second time.
 *
 * @param {Record<string, {spriteAvatar?: any}>} users
 * @returns {{loop:object,punch:object,other:object}}
 */
function aggregateParseComposition(users) {
  const totals = {
    loop: { count: 0, frameCount: 0, residentCount: 0 },
    punch: { count: 0, frameCount: 0, residentCount: 0 },
    other: { count: 0, frameCount: 0, residentCount: 0 },
  };

  Object.values(users || {}).forEach((user) => {
    const avatar = user && user.spriteAvatar;
    if (!avatar || !avatar.isLayered || !avatar._manifest) return;
    const manifest = avatar._manifest;
    // design.md §13.3 (tasks.md slice 15): `_atlasKeys.actions` is now a `Map<packId,
    // atlasKey>` (one entry per loaded per-key pack), not a single string|null — a key is only
    // resident once ITS OWN specific pack has loaded, not merely "some pack" (a Map is always
    // truthy even when empty, so a boolean `!!atlasKeys.actions` check would have silently
    // reported every action-backed key as resident the instant ANY one pack loaded).
    const loadedPacks = avatar._atlasKeys && avatar._atlasKeys.actions;
    const actionBackedKeys = computeActionBackedKeys(manifest);
    const residentKeys = Object.keys(manifest.sequences || {}).filter((key) => {
      const packId = actionBackedKeys.get(key);
      return !packId || (loadedPacks && loadedPacks.has(packId));
    });
    const per = computeParseComposition(manifest, residentKeys);
    for (const bucket of ['loop', 'punch', 'other']) {
      totals[bucket].count += per[bucket].count;
      totals[bucket].frameCount += per[bucket].frameCount;
      totals[bucket].residentCount += per[bucket].residentCount;
    }
  });

  return totals;
}

/**
 * Recursively walks every live user's container, counting every display object (`sprites`) and
 * every `Phaser.GameObjects.Graphics` instance (`graphics`) under it (design.md §11). Duck-typed
 * on `.type === 'Graphics'` so this file never needs to `import Phaser` (kept dependency-free,
 * matching depths.js/fallback.js's own no-Phaser-import pattern).
 *
 * @param {Record<string, {containerUser?: {list?: any[]}}>} users
 * @returns {{sprites: number, graphics: number}}
 */
function countDisplayObjects(users) {
  let sprites = 0;
  let graphics = 0;
  const walk = (obj) => {
    sprites += 1;
    if (obj.type === 'Graphics') graphics += 1;
    if (Array.isArray(obj.list)) obj.list.forEach(walk);
  };
  Object.values(users || {}).forEach((user) => {
    if (user && user.containerUser) walk(user.containerUser);
  });
  return { sprites, graphics };
}

/**
 * I/O shell (design.md §11, tasks.md slice 7 task 5): wires PRE_RENDER/POST_RENDER
 * (`'prerender'`/`'postrender'`, Phaser.Core.Events' own string values — no `import Phaser`
 * needed) and a requestAnimationFrame-driven fps sampler onto a live scene, exposing a
 * `snapshot()` that reports every design §11 field. Not unit-tested directly, matching the
 * project's established pattern for LayeredAvatar.js/PerfHarness.js wiring; every calculation it
 * delegates to is one of the pure functions above.
 *
 * @param {Phaser.Scene} scene
 */
function createAvatarMetricsAggregator(scene) {
  const state = {
    renderSamples: [],
    frameDeltas: [],
    renderStart: null,
    lastFrameTime: null,
    roomEntryTs: null,
    firstRenderTs: null,
    actionColdStartTs: null,
    lastActionColdMs: null,
    sampling: false,
  };

  function wire() {
    const game = scene.game;
    if (!game || !game.events) return;
    game.events.on('prerender', () => {
      state.renderStart = performance.now();
    });
    game.events.on('postrender', () => {
      if (state.renderStart != null) {
        state.renderSamples = recordRenderSample(
          state.renderSamples,
          performance.now() - state.renderStart,
        );
        state.renderStart = null;
      }
      const now = performance.now();
      if (state.lastFrameTime != null) {
        state.frameDeltas = recordRenderSample(state.frameDeltas, now - state.lastFrameTime, 300);
      }
      state.lastFrameTime = now;
      if (state.firstRenderTs == null && Object.keys(scene.users || {}).length > 0) {
        state.firstRenderTs = now;
      }
    });
  }

  function markRoomEntry() {
    state.roomEntryTs = performance.now();
    state.firstRenderTs = null;
  }

  function markActionColdStart() {
    state.actionColdStartTs = performance.now();
  }

  function markActionColdEnd() {
    if (state.actionColdStartTs != null) {
      state.lastActionColdMs = computeDurationMs(state.actionColdStartTs, performance.now());
      state.actionColdStartTs = null;
    }
  }

  function snapshot() {
    const users = scene.users || {};
    const { sprites, graphics } = countDisplayObjects(users);
    const renderer = scene.game && scene.game.renderer;
    const draws = renderer && typeof renderer.drawCount === 'number' ? renderer.drawCount : null;
    const gpuTextures =
      scene.textures && scene.textures.list ? Object.keys(scene.textures.list).length : null;

    const fpsSamples = state.frameDeltas
      .filter((d) => d > 0)
      .map((d) => 1000 / d)
      .sort((a, b) => a - b);
    const fpsMean = meanOf(fpsSamples);
    const p5Index = Math.floor(fpsSamples.length * 0.05);
    const fpsP5 = fpsSamples[p5Index] ?? fpsSamples[0] ?? 0;

    const residentPages = scene.textures ? collectResidentAtlasPages(users, scene.textures) : [];

    return {
      fps: { mean: Number(fpsMean.toFixed(2)), p5: Number(fpsP5.toFixed(2)) },
      renderMs: Number(meanOf(state.renderSamples).toFixed(3)),
      sprites,
      // Reported, never thresholded (design.md §11) — comparing raw PIXI vs. Phaser counts is
      // false precision; `graphics: 0` on the raster path is the architectural difference, not
      // a regression.
      graphics,
      draws,
      gpuTextures,
      residentAvatarBytes: computeResidentAvatarBytes(residentPages),
      // Correction 2 (apply-progress.md's "Correction 2"): the Canvas-renderer tint fallback's
      // own memory cost, additive on top of `residentAvatarBytes` — the base/action atlas pages
      // stay resident under Canvas too (still decoded image sources, just not GPU-tinted), and
      // every distinct (piece, resolved colour) pair the fallback has generated so far is an
      // ADDITIONAL resident canvas. Always computed (cheap, an empty cache is 0) so the WebGL
      // path's own snapshot shape never has to special-case a missing field.
      canvasTintCacheBytes: computeTintCacheBytes(getTintCacheStats().entries),
      parseComposition: aggregateParseComposition(users),
      timeToFirstRender:
        state.roomEntryTs != null && state.firstRenderTs != null
          ? computeDurationMs(state.roomEntryTs, state.firstRenderTs)
          : null,
      timeToPlayCold: state.lastActionColdMs,
      // design.md §11's table names these as vector-path-only fields. The vector runtime was
      // removed per §12.3's raster verdict, so these stay permanently null on the shipped path —
      // kept in the reported shape rather than dropped, since removing a reported (never
      // thresholded) field is a contract change no consumer has asked for.
      bakeMs: null,
      cacheHitRate: null,
    };
  }

  return { wire, markRoomEntry, markActionColdStart, markActionColdEnd, snapshot };
}

export {
  classifySequenceKey,
  computeParseComposition,
  computeResidentAvatarBytes,
  meanOf,
  recordRenderSample,
  computeDurationMs,
  countDisplayObjects,
  collectResidentAtlasPages,
  aggregateParseComposition,
  createAvatarMetricsAggregator,
};
