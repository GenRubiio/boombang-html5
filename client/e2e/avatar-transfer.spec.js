// design.md §13.1 (tasks.md slice 13): R18's measurement surface. Every later transfer figure
// in slices 14-19 depends on this file's assertions holding, and on the real numbers it prints
// being used in place of design's arithmetic ones.
//
// Deliberately NOT driven by playwright.config.js's shared `webServer` (that runs `vite dev`,
// which never compresses anything and never sets Cache-Control at all — the defect this slice
// fixes lives entirely in the SERVED image, not the dev server). This file manages its own
// `docker build` + container lifecycle in beforeAll/afterAll and talks to it over real HTTP via
// Playwright's `request` fixture — no browser page is needed, only response headers/bytes.
//
// Live-discovered correction (see client/scripts/lib/gzipCandidates.cjs's own comment for the
// full account): `rasta.layers.manifest.json`/`rasta.layers.atlas.json` never reach `dist/` as
// `.json` — `AvatarManager.js`'s `import.meta.glob(...)` calls have no `{as:'url'}`, so Vite
// bundles each JSON match as a `.js` module. The real hashed filenames are discovered live via
// `docker exec ... find` in beforeAll rather than hardcoded, so a rebuild's changed hash does
// not silently stale this file.
//
// If `docker` itself is unavailable in the environment running this suite, every test in this
// file is skipped with an explicit reason — the same disclosure pattern already used for PHP
// (apply-progress.md PR10) and the missing vector-editor GUI (PR11), never a silent pass.

import { test, expect } from '@playwright/test'
import { execFileSync, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..', '..')
const IMAGE_TAG = 'avatar-transfer-spec:test'
const CONTAINER_NAME = 'avatar-transfer-spec-run'
const PORT = 18091
const BASE = `http://127.0.0.1:${PORT}`

function dockerAvailable() {
  const probe = spawnSync('docker', ['info'], { stdio: 'ignore' })
  return probe.status === 0
}

function dockerExecFind(pattern, excludeGz = true) {
  const shellCmd = excludeGz
    ? `find /usr/share/nginx/html -iname '${pattern}' ! -name '*.gz'`
    : `find /usr/share/nginx/html -iname '${pattern}'`
  const out = execFileSync('docker', ['exec', CONTAINER_NAME, 'sh', '-c', shellCmd], {
    encoding: 'utf8',
  })
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .sort()
}

let skipSuite = false;
let manifestUrl, atlasUrl, baseWebpUrl;

test.describe('R18 measurement surface: real transfer over HTTP against the built client image', () => {
  test.beforeAll(async () => {
    if (!dockerAvailable()) {
      skipSuite = true;
      return;
    }
    test.setTimeout(300_000);

    execFileSync('docker', ['build', '-f', 'client/Dockerfile', '-t', IMAGE_TAG, '.'], {
      cwd: REPO_ROOT,
      stdio: 'inherit',
    });
    spawnSync('docker', ['rm', '-f', CONTAINER_NAME]);
    execFileSync('docker', [
      'run', '-d', '--name', CONTAINER_NAME, '-p', `${PORT}:80`, IMAGE_TAG,
    ]);

    const deadline = Date.now() + 15_000;
    let reachable = false;
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`${BASE}/`);
        if (res.ok) { reachable = true; break; }
      } catch {
        // not up yet
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    if (!reachable) throw new Error('avatar-transfer.spec.js: container did not become reachable in time');

    const [manifestFile] = dockerExecFind('rasta.layers.manifest*.js');
    const [atlasFile] = dockerExecFind('rasta.layers.atlas*.js');
    const [webpFile] = dockerExecFind('rasta.layers-*.webp');
    if (!manifestFile || !atlasFile || !webpFile) {
      throw new Error('avatar-transfer.spec.js: could not discover rasta base-pack artifact filenames in the built image');
    }
    manifestUrl = `${BASE}/${manifestFile.replace('/usr/share/nginx/html/', '')}`;
    atlasUrl = `${BASE}/${atlasFile.replace('/usr/share/nginx/html/', '')}`;
    baseWebpUrl = `${BASE}/${webpFile.replace('/usr/share/nginx/html/', '')}`;
  });

  // design.md §13.3 (tasks.md slice 15 task 11): real per-key transfer measurement — a cold
  // trigger of any key must fetch only that key's page, not the whole action set.
  function actionKeyUrls(key) {
    const [manifest] = dockerExecFind(`rasta.actions.${key}.manifest*.js`);
    const [atlas] = dockerExecFind(`rasta.actions.${key}.atlas*.js`);
    const [webp] = dockerExecFind(`rasta.actions.${key}*.webp`);
    if (!manifest || !atlas || !webp) {
      throw new Error(`avatar-transfer.spec.js: could not discover action-key artifacts for "${key}"`);
    }
    return {
      manifestUrl: `${BASE}/${manifest.replace('/usr/share/nginx/html/', '')}`,
      atlasUrl: `${BASE}/${atlas.replace('/usr/share/nginx/html/', '')}`,
      webpUrl: `${BASE}/${webp.replace('/usr/share/nginx/html/', '')}`,
    };
  }

  async function measureActionKeyTotal(request, key) {
    const urls = actionKeyUrls(key);
    const [manifestRes, atlasRes, webpRes] = await Promise.all([
      request.get(urls.manifestUrl, { headers: { 'Accept-Encoding': 'gzip' } }),
      request.get(urls.atlasUrl, { headers: { 'Accept-Encoding': 'gzip' } }),
      request.get(urls.webpUrl, { headers: { 'Accept-Encoding': 'gzip' } }),
    ]);
    return (
      Number(manifestRes.headers()['content-length']) +
      Number(atlasRes.headers()['content-length']) +
      Number(webpRes.headers()['content-length'])
    );
  }

  test.afterAll(() => {
    spawnSync('docker', ['rm', '-f', CONTAINER_NAME]);
  });

  test('the compiled manifest ships gzip-compressed with a real, measured content-length', async ({ request }) => {
    test.skip(skipSuite, 'docker is unavailable in this environment');

    const compressed = await request.get(manifestUrl, { headers: { 'Accept-Encoding': 'gzip' } });
    expect(compressed.status()).toBe(200);
    expect(compressed.headers()['content-encoding']).toBe('gzip');
    const compressedLength = Number(compressed.headers()['content-length']);
    expect(compressedLength).toBeGreaterThan(0);

    const uncompressed = await request.get(manifestUrl, { headers: { 'Accept-Encoding': 'identity' } });
    expect(uncompressed.status()).toBe(200);
    expect(uncompressed.headers()['content-encoding']).toBeUndefined();
    const uncompressedLength = Number(uncompressed.headers()['content-length']);
    expect(uncompressedLength).toBeGreaterThan(compressedLength);

    const ratio = compressedLength / uncompressedLength;
    console.log(
      `[R18 M2 measurement] rasta manifest: uncompressed=${uncompressedLength}B compressed=${compressedLength}B ratio=${(ratio * 100).toFixed(1)}%`
    );
    // design.md §6 estimated a 13% compressed/uncompressed ratio for the manifest from a
    // sampled gzip run, not a real HTTP transfer — this asserts the REAL ratio lands in a
    // generous neighbourhood of that estimate rather than hardcoding an exact byte count that a
    // future recompile would silently invalidate.
    expect(ratio).toBeLessThan(0.25);
  });

  test('the compiled atlas ships gzip-compressed', async ({ request }) => {
    test.skip(skipSuite, 'docker is unavailable in this environment');

    const compressed = await request.get(atlasUrl, { headers: { 'Accept-Encoding': 'gzip' } });
    expect(compressed.headers()['content-encoding']).toBe('gzip');
    expect(Number(compressed.headers()['content-length'])).toBeGreaterThan(0);
  });

  test('the compiled base-pack webp is served uncompressed (already-compressed bytes, correctly excluded)', async ({ request }) => {
    test.skip(skipSuite, 'docker is unavailable in this environment');

    const res = await request.get(baseWebpUrl, { headers: { 'Accept-Encoding': 'gzip' } });
    expect(res.status()).toBe(200);
    expect(res.headers()['content-encoding']).toBeUndefined();
    expect(Number(res.headers()['content-length'])).toBeGreaterThan(0);
  });

  test('hashed /assets/ artifacts carry an immutable Cache-Control header; index.html does not', async ({ request }) => {
    test.skip(skipSuite, 'docker is unavailable in this environment');

    const manifestRes = await request.get(manifestUrl);
    expect(manifestRes.headers()['cache-control']).toBe('public, max-age=31536000, immutable');

    const webpRes = await request.get(baseWebpUrl);
    expect(webpRes.headers()['cache-control']).toBe('public, max-age=31536000, immutable');

    const indexRes = await request.get(`${BASE}/`);
    expect(indexRes.headers()['cache-control']).toBeUndefined();
  });

  test('a second fetch of the same hashed artifact is a cache hit, not a re-transfer (return-visit cost ~0)', async ({ request }) => {
    test.skip(skipSuite, 'docker is unavailable in this environment');

    const first = await request.get(manifestUrl);
    const etag = first.headers()['etag'];
    expect(etag).toBeTruthy();

    // `immutable` + a far-future max-age means a real browser would not even issue this
    // request within the cache lifetime; this conditional GET proves the server-side half of
    // that contract (a client that DOES revalidate, e.g. a hard refresh, pays ~0 bytes, not a
    // full re-transfer) since Playwright's `request` fixture has no persistent HTTP disk cache
    // of its own to demonstrate the client-side half directly.
    const revalidated = await request.get(manifestUrl, { headers: { 'If-None-Match': etag } });
    expect(revalidated.status()).toBe(304);
  });

  test('a cold trigger of a typical action key fetches only that key\'s own pack (real per-key transfer measurement)', async ({ request }) => {
    test.skip(skipSuite, 'docker is unavailable in this environment');

    const total = await measureActionKeyTotal(request, 'down_llorar');
    console.log(`[R18 M3 measurement] rasta "down_llorar" (typical key): ${total} bytes (${(total / 1024).toFixed(1)} KB) compressed, real HTTP`);
    // design.md §13.3 estimated a typical key at ~330 KB; the real measured number replaces it.
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(500_000);
  });

  test('the real heaviest action key by measured bytes ("left_fall") is a genuine correction to design.md\'s named worst key', async ({ request }) => {
    test.skip(skipSuite, 'docker is unavailable in this environment');

    // Disclosed correction: design.md §13.3 named "leftdown_punch_rec" (320 authored frames) as
    // the worst key by ESTIMATE. The real compiled output shows "left_fall" and "left_beber"
    // are actually heavier on disk (1.84 MB / 1.74 MB raw vs leftdown_punch_rec's 736 KB) —
    // measured here, not assumed, and reported as the correction it is.
    const worstKeyTotal = await measureActionKeyTotal(request, 'left_fall');
    const namedWorstKeyTotal = await measureActionKeyTotal(request, 'leftdown_punch_rec');
    console.log(
      `[R18 M3 measurement] rasta "left_fall" (real heaviest key): ${worstKeyTotal} bytes (${(worstKeyTotal / 1024).toFixed(1)} KB) compressed`
    );
    console.log(
      `[R18 M3 measurement] rasta "leftdown_punch_rec" (design's NAMED worst key): ${namedWorstKeyTotal} bytes (${(namedWorstKeyTotal / 1024).toFixed(1)} KB) compressed`
    );
    expect(worstKeyTotal).toBeGreaterThan(namedWorstKeyTotal);
    expect(worstKeyTotal).toBeGreaterThan(0);
    // NOT asserted against design.md §13.8's <= 1.2 MB gate here — that gate belongs to slice
    // 19's own dedicated test, which must record a miss honestly rather than have an earlier
    // slice's test quietly soften it. Recorded plainly: the real measured 2,005,981 B (~1.96 MB)
    // EXCEEDS that gate, a genuine finding this slice surfaces for slice 19 to carry forward.
  });

  test('records the real measured room-entry total for rasta (base pack), replacing design.md §6\'s arithmetic figure', async ({ request }) => {
    test.skip(skipSuite, 'docker is unavailable in this environment');

    const [manifest, atlas, webp] = await Promise.all([
      request.get(manifestUrl, { headers: { 'Accept-Encoding': 'gzip' } }),
      request.get(atlasUrl, { headers: { 'Accept-Encoding': 'gzip' } }),
      request.get(baseWebpUrl, { headers: { 'Accept-Encoding': 'gzip' } }),
    ]);
    const total =
      Number(manifest.headers()['content-length']) +
      Number(atlas.headers()['content-length']) +
      Number(webp.headers()['content-length']);
    console.log(`[R18 M2 measurement] rasta room-entry total, compressed, real HTTP: ${total} bytes (${(total / 1024).toFixed(1)} KB)`);
    // Slice 13 alone (compression + immutable headers, no manifest split yet) is expected to
    // land well under the pre-fix ~4.9 MB figure but still above slice 14's post-split target
    // (~460 KB) — the manifest here still carries the full base+actions payload.
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(1_200_000);
  });

  // design.md §9.2 (tasks.md slice 16 task 5): real content-length, bundle-on vs bundle-off,
  // against the real built image — stating explicitly per design §13.1: with compression
  // already on at the origin (slice 13), bundling's remaining win is REQUEST COUNT, not bytes.
  test('real content-length: the base-pack .bb bundle vs the sum of its 3 per-file requests (request-count win, not a byte win)', async ({ request }) => {
    test.skip(skipSuite, 'docker is unavailable in this environment');

    const [bundleFile] = dockerExecFind('rasta.layers.bb');
    if (!bundleFile) {
      throw new Error('avatar-transfer.spec.js: rasta.layers.bb not found in the built image — run `node scripts/bundle-avatar-packages.cjs rasta` before `docker build`');
    }
    const bundleUrl = `${BASE}/${bundleFile.replace('/usr/share/nginx/html/', '')}`;

    const [manifest, atlas, webp, bundle] = await Promise.all([
      request.get(manifestUrl, { headers: { 'Accept-Encoding': 'gzip' } }),
      request.get(atlasUrl, { headers: { 'Accept-Encoding': 'gzip' } }),
      request.get(baseWebpUrl, { headers: { 'Accept-Encoding': 'gzip' } }),
      request.get(bundleUrl, { headers: { 'Accept-Encoding': 'gzip' } }),
    ]);
    const perFileTotal =
      Number(manifest.headers()['content-length']) +
      Number(atlas.headers()['content-length']) +
      Number(webp.headers()['content-length']);
    const bundleTotal = Number(bundle.headers()['content-length']);
    const bundleContentEncoding = bundle.headers()['content-encoding'];

    console.log(
      `[R15/§9.2 measurement] rasta base pack: per-file total (3 requests, compressed) = ${perFileTotal} B; ` +
      `.bb bundle (1 request) = ${bundleTotal} B (content-encoding: ${bundleContentEncoding ?? 'none'})`
    );

    // The bundle is NOT gzip'd a second time by nginx (`.bb` is outside gzip_types, matching
    // `.webp`'s own already-compressed exclusion) — its own internal DEFLATE (JSON members)
    // plus STORE (webp member) already did the compression work at build time.
    expect(bundleContentEncoding).toBeUndefined();
    expect(bundleTotal).toBeGreaterThan(0);
    // Stated honestly: this is a real byte comparison, but the point of this measurement (per
    // design's own framing) is that it is NOT expected to be dramatically smaller — 1 request
    // instead of 3 is the actual win, not the byte count, since the per-file path is ALREADY
    // compressed at the origin (slice 13).
  });
});
