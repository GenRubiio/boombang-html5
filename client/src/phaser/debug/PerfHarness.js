import gameConfig from "@/config/gameConfig.js";
import { evaluate, resolveRendererTypeLabel } from "./perfEvaluate.js";
import AvatarEnum from "@/enums/AvatarEnum.js";

// design.md §15/tasks.md slice 32 (roster-scale regression gate): per-character measurements do
// not compose — texture memory, page pressure and draw batching are roster-scale properties, and
// production's own ~22 MB resident figure is measured against several DIFFERENT characters on
// screen, never N copies of one. Reuses the SAME 4-character representative sample Correction 1
// (apply-progress.md) already established and validated through the real `PublicScene` — not a
// new, unvetted list — plus `boomer` (the name-reconciled character) for a fifth, structurally
// distinct manifest shape.
const DEFAULT_ROSTER_MIX_AVATAR_IDS = [
    AvatarEnum.RASTA,
    AvatarEnum.BRUJITA,
    AvatarEnum.NINJA,
    AvatarEnum.WEREWOLF,
    AvatarEnum.BOOMER,
];

/**
 * FPS / draw-call measurement harness (design.md §7, LR8). Gated by VITE_PERF_HARNESS=true,
 * read once into gameConfig.PERF_HARNESS. Reachable at runtime as `window.__perf` so a run
 * needs no rebuild. This module is I/O-shell code driving a live Phaser instance — it is not
 * unit-tested directly; its pure scoring logic lives in perfEvaluate.js and is unit-tested
 * there.
 */
class PerfHarness {
    constructor() {
        this._sampling = false;
        this._samples = [];
        this._lastResult = null;
    }

    /**
     * Finds the currently active, visible gameplay scene (Public/Private/Minigame) that owns
     * a `users` map of live avatar containers. Returns null if none is active yet.
     */
    _findActiveScene() {
        const game = window.game;
        if (!game || !game.scene) return null;
        const scenes = game.scene.getScenes(true);
        return scenes.find((s) => s && s.users && typeof s.users === "object") || null;
    }

    /**
     * Recursively counts every display object under every live user container in the scene.
     */
    _countDisplayObjects(scene) {
        let total = 0;
        let layeredPieceObjects = 0;
        const users = scene.users || {};
        Object.keys(users).forEach((key) => {
            const user = users[key];
            const container = user && user.containerUser;
            if (!container) return;
            const walk = (obj) => {
                total += 1;
                if (obj.isLayered) {
                    // pool children of a LayeredAvatar (Slice 3+) count as layered pieces
                }
                if (obj._pool) {
                    layeredPieceObjects += obj._pool.length;
                }
                if (obj.list && Array.isArray(obj.list)) {
                    obj.list.forEach(walk);
                }
            };
            walk(container);
        });
        return { total, layeredPieceObjects };
    }

    /**
     * Fabricates `n` synthetic users through the real AddUserController.processUser path so
     * measurement exercises the production assembly path (design.md §7). Delegates to the
     * shared `spawnAvatarUser` primitive (design.md §10) — the SAME one the Playwright
     * resolved-state harness's `window.__avatarHarness.spawnAvatar` calls, so the perf and
     * correctness harnesses cannot drift on what "spawn an avatar" means.
     *
     * @param {number} [n=25]
     * @param {{avatarId?: number}} [opts] `avatarId` defaults to 12 (AvatarEnum.RASTA), the
     *   proposal's originally hardcoded value, now parametrized per proposal item 6.
     */
    async spawnGhosts(n = 25, { avatarId = 12 } = {}) {
        const scene = this._findActiveScene();
        if (!scene) {
            console.warn("[PerfHarness] no active gameplay scene found; cannot spawn ghosts");
            return 0;
        }
        const { spawnAvatarUser } = await import("../shared/spawnAvatarUser.js");
        let spawned = 0;
        for (let i = 0; i < n; i++) {
            const socketId = `__ghost_${Date.now()}_${i}`;
            try {
                // eslint-disable-next-line no-await-in-loop
                await spawnAvatarUser(scene, {
                    socketId,
                    avatarId,
                    x: (i % 5) - 2,
                    y: Math.floor(i / 5) - 2,
                    username: `Ghost${i}`,
                });
                spawned += 1;
            } catch (err) {
                console.warn("[PerfHarness] failed to spawn ghost", socketId, err);
            }
        }
        return spawned;
    }

    /**
     * design.md §15/tasks.md slice 32 (roster-scale regression gate): spawns one ghost per
     * DISTINCT `avatarId` in `avatarIds` — several DIFFERENT characters simultaneously, not N
     * copies of one, alongside `spawnGhosts`'s existing single-character stress test. Reuses the
     * exact same `spawnAvatarUser` primitive and `despawnGhosts` cleanup (both key off the
     * `__ghost_` socketId prefix regardless of avatarId, so no separate teardown path is needed).
     *
     * @param {number[]} [avatarIds] distinct AvatarEnum values; defaults to a representative
     *   roster-scale spread (see `DEFAULT_ROSTER_MIX_AVATAR_IDS` above)
     * @returns {Promise<number>} how many were actually spawned
     */
    async spawnRosterMix(avatarIds = DEFAULT_ROSTER_MIX_AVATAR_IDS) {
        const scene = this._findActiveScene();
        if (!scene) {
            console.warn("[PerfHarness] no active gameplay scene found; cannot spawn roster mix");
            return 0;
        }
        const { spawnAvatarUser } = await import("../shared/spawnAvatarUser.js");
        let spawned = 0;
        for (let i = 0; i < avatarIds.length; i++) {
            const socketId = `__ghost_${Date.now()}_${i}`;
            try {
                // eslint-disable-next-line no-await-in-loop
                await spawnAvatarUser(scene, {
                    socketId,
                    avatarId: avatarIds[i],
                    x: (i % 5) - 2,
                    y: Math.floor(i / 5) - 2,
                    username: `Ghost${i}`,
                });
                spawned += 1;
            } catch (err) {
                console.warn("[PerfHarness] failed to spawn roster-mix ghost", socketId, avatarIds[i], err);
            }
        }
        return spawned;
    }

    /**
     * Removes every previously spawned ghost from the active scene.
     */
    despawnGhosts() {
        const scene = this._findActiveScene();
        if (!scene) return 0;
        let removed = 0;
        Object.keys(scene.users).forEach((key) => {
            if (!key.startsWith("__ghost_")) return;
            const user = scene.users[key];
            try {
                user.containerUser?.destroy();
            } catch (_) {
                // best-effort cleanup for a debug-only tool
            }
            delete scene.users[key];
            removed += 1;
        });
        return removed;
    }

    /**
     * Samples FPS/draw-calls over a fixed 10-second window and reports the result via
     * console.table, window.__perf.results, and (best-effort) the clipboard.
     */
    async measure({ windowMs = 10000, label = "run" } = {}) {
        const scene = this._findActiveScene();
        if (!scene) {
            console.warn("[PerfHarness] no active gameplay scene found; cannot measure");
            return null;
        }

        const frameDeltas = [];
        const start = performance.now();
        let lastTime = start;

        await new Promise((resolve) => {
            const tick = () => {
                const now = performance.now();
                frameDeltas.push(now - lastTime);
                lastTime = now;
                if (now - start >= windowMs) {
                    resolve();
                    return;
                }
                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });

        const fpsSamples = frameDeltas
            .filter((d) => d > 0)
            .map((d) => 1000 / d)
            .sort((a, b) => a - b);
        const meanFps =
            fpsSamples.reduce((sum, v) => sum + v, 0) / (fpsSamples.length || 1);
        const p5Index = Math.floor(fpsSamples.length * 0.05);
        const fps5 = fpsSamples[p5Index] ?? fpsSamples[0] ?? 0;
        const minFps = fpsSamples[0] ?? 0;
        const actualFps = scene.game?.loop?.actualFps ?? null;

        const { total, layeredPieceObjects } = this._countDisplayObjects(scene);

        let drawCalls = null;
        let drawCallSource = "unavailable (falling back to display-object count)";
        const renderer = scene.game?.renderer;
        if (renderer && typeof renderer.drawCount === "number") {
            drawCalls = renderer.drawCount;
            drawCallSource = "renderer.drawCount";
        }

        const result = {
            label,
            timestamp: new Date().toISOString(),
            windowMs,
            meanFps: Number(meanFps.toFixed(2)),
            fps5: Number(fps5.toFixed(2)),
            minFps: Number(minFps.toFixed(2)),
            actualFps,
            totalDisplayObjects: total,
            layeredPieceObjects,
            drawCalls,
            drawCallSource,
            avatarCount: Object.keys(scene.users || {}).length,
            context: {
                // Bug fix: `renderer.type === 1` is Phaser.CANVAS, not WEBGL (Phaser's own
                // const.js: AUTO=0, CANVAS=1, WEBGL=2, HEADLESS=3) — see resolveRendererTypeLabel
                // in perfEvaluate.js.
                rendererType: resolveRendererTypeLabel(renderer && renderer.type),
                devicePixelRatio: window.devicePixelRatio || 1,
                dpi: gameConfig.DPI,
                flagLayeredAvatars: !!gameConfig.LAYERED_AVATARS,
            },
        };

        this._samples.push(result);
        this._lastResult = result;
        console.table([result]);
        this._copyToClipboard(result);
        return result;
    }

    _copyToClipboard(result) {
        try {
            const text = JSON.stringify(result, null, 2);
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).catch(() => {});
            }
        } catch (_) {
            // clipboard access can be denied by the browser; not fatal for a debug tool
        }
    }

    /**
     * Go/no-go scoring against the last measured sample and (optionally) a prior baseline
     * sample recorded separately, e.g. the baked baseline from Slice 0.
     */
    evaluate(baselineResult) {
        const latest = this._lastResult;
        if (!latest) {
            return { pass: false, reasons: ["no measurement has been run yet"] };
        }
        const scored = evaluate({
            fps5: latest.fps5,
            meanFpsLayered: latest.context.flagLayeredAvatars ? latest.meanFps : undefined,
            meanFpsBaked: baselineResult ? baselineResult.meanFps : undefined,
        });
        scored.acceptedRiskNote =
            "Accepted risk (proposal.md): ~500-775 display objects at 25 layered avatars vs ~100 today.";
        return scored;
    }

    get results() {
        return this._samples;
    }
}

const perfHarness = new PerfHarness();

if (gameConfig.PERF_HARNESS) {
    window.__perf = perfHarness;
}

export default perfHarness;
