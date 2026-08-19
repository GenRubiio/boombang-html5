import Phaser from "phaser";
import gameConfig from "@/config/gameConfig.js";
import AvatarHarnessScene from "./AvatarHarnessScene.js";

/**
 * Entry point for `client/harness.html` (design.md §10) — a dev-only page, never part of the
 * production build (see `client/vite.config.js`: with no `build.rollupOptions.input` declared,
 * Vite's default production build compiles ONLY the root `index.html`; this file is reachable
 * only through `vite dev`, which Playwright's `webServer` runs). Gated a second time behind
 * `VITE_AVATAR_HARNESS=true` so an accidental production deploy of this file boots nothing.
 *
 * `type: Phaser.AUTO` (was `Phaser.CANVAS` through slice 21) — a real, coordinator-caught defect
 * fix, not a preference. `Phaser.CANVAS`'s `batchSprite` (`node_modules/phaser/src/renderer/
 * canvas/CanvasRenderer.js`) draws every sprite via a plain `ctx.drawImage(...)`, with NO tint
 * handling at all — `setTint()` still updates a sprite's own `tint`/`tintTopLeft` properties
 * (which is why every resolved-state assertion that reads `.tint`, e.g. R8's `slotTints`,
 * passed), but the Canvas renderer never applies them, so every layered-avatar screenshot this
 * harness ever captured showed the body's slotted pieces as their raw untinted white masks.
 * `App.vue`'s real `Phaser.Game` defaults to `Phaser.AUTO` (WebGL-preferred, falling back to
 * Canvas only when WebGL is unavailable or a user has explicitly forced
 * `phaser_type: "canvas"`), so matching that default here is what makes this harness's captured
 * rendering representative of what a real player on a real (default) client actually sees —
 * confirmed live: the exact same manifest/palette renders the resolved colour correctly once
 * `type` is `Phaser.AUTO`.
 *
 * Correction 2 (apply-progress.md's "Correction 2"): `?renderer=canvas` FORCES `Phaser.CANVAS`
 * (a runtime query-string read, not a build-time env var, so no second dev server is needed) —
 * the dedicated e2e coverage for the Canvas-renderer tint fallback boots the harness this way.
 * Every other caller (no query param) is byte-for-byte unaffected, still `Phaser.AUTO`.
 */
if (import.meta.env.VITE_AVATAR_HARNESS === "true") {
    const forceCanvas = new URLSearchParams(window.location.search).get("renderer") === "canvas";
    const game = new Phaser.Game({
        type: forceCanvas ? Phaser.CANVAS : Phaser.AUTO,
        width: gameConfig.GAME_WIDTH,
        height: gameConfig.GAME_HEIGHT,
        parent: "harness-root",
        scene: [AvatarHarnessScene],
        banner: false,
        // Coordinator-flagged defect 2: a fully opaque black canvas background makes the
        // semi-transparent BLACK shadow sprite (`shadow.webp`, alpha ≈ 40%, confirmed via a real
        // decoded pixel sample) invisible against it, so shadow-alignment (R5/the user's item 6)
        // could never be visually assessed from a screenshot even though it was always correctly
        // POSITIONED. A neutral mid-tone makes the shadow visible without recolouring anything
        // the game itself renders.
        backgroundColor: "#9a9a9a",
    });

    // Mirrors App.vue's own "expose window.game only behind its flag" pattern
    // (PerfHarness/VITE_PERF_HARNESS) — here unconditional within this page, since the page
    // itself only ever loads behind VITE_AVATAR_HARNESS.
    window.game = game;

    // design.md §15/tasks.md slice 32 (roster-scale regression gate, task 1): PerfHarness.js was
    // previously imported ONLY from App.vue (the real game), so `window.__perf` — and its new
    // `spawnRosterMix` roster-mix helper — was unreachable from this harness page even with
    // `VITE_PERF_HARNESS=true` set (`.env.local`), since nothing here ever loaded the module.
    // Mirrors App.vue's own exact gate (`gameConfig.PERF_HARNESS`) so a production deploy of this
    // dev-only page still boots nothing extra.
    if (gameConfig.PERF_HARNESS) {
        import("../phaser/debug/PerfHarness.js");
    }
}
