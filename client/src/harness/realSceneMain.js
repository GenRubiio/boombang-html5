import Phaser from "phaser";
import gameConfig from "@/config/gameConfig.js";
import PublicScene from "@/phaser/PublicScene.js";
import { createAvatarHarnessApi } from "./avatarHarnessApi.js";
import { buildRealSceneInitData, createNoOpVueComponent } from "./RealSceneHarnessData.js";

/**
 * Entry point for `client/real-scene-harness.html` (tasks.md slice 21 task 8) — boots the REAL
 * `PublicScene` class (not `AvatarHarnessScene`), so a defect living purely in scene setup
 * (real `TintManager`, real `PublicSceneLoader`, real `AvatarSystemController.init`, the real
 * `create()` lifecycle) is inside this harness's reach, unlike `harness.html`'s bespoke scene
 * (design.md §14 cost 19's own named gap). Dev-only, mirroring `harness.html`'s own two-level
 * gate: unreachable in a production build (no `rollupOptions.input` names it) and inert unless
 * `VITE_AVATAR_HARNESS_REAL_SCENE=true`.
 *
 * `AddUserController.processUser` — the same real production controller `harness.html` already
 * drives through `spawnAvatarUser` — is exercised here too, now inside a scene that ran its own
 * real `create()` first. `window.__avatarHarness` is the SAME `createAvatarHarnessApi` factory
 * `harness.html` uses, so both harnesses expose an identical driving surface and any
 * `avatar-resolved-state.spec.js`-style assertion can run against either one unmodified.
 */
if (import.meta.env.VITE_AVATAR_HARNESS_REAL_SCENE === "true") {
    // No `scene:` array here (unlike main.js's AvatarHarnessScene boot) — Phaser auto-starts the
    // first scene listed in `config.scene` immediately at boot, calling `init(undefined)` and
    // `preload()` with NO data before this file's own `game.scene.start(key, initData)` call
    // ever runs. Confirmed live: PublicScene.preload() crashed reading `this.sceneData.scenery`
    // (undefined) the moment PublicScene was listed there. Adding it with `autoStart: false` via
    // `game.scene.add` and starting it explicitly, once, with real init data is what makes this
    // the same call PublicScreen.vue's real mount performs.
    const game = new Phaser.Game({
        // `Phaser.AUTO` (was `Phaser.CANVAS`) — same coordinator-caught defect fix as
        // `main.js`: the Canvas renderer's `batchSprite` never applies a sprite's tint at all,
        // so every layered avatar's slotted body pieces rendered as raw untinted white masks
        // under `Phaser.CANVAS` regardless of the resolved palette. `App.vue`'s real game
        // defaults to `Phaser.AUTO` too, which is what makes this harness's rendering
        // representative of a real (default) client.
        type: Phaser.AUTO,
        width: gameConfig.GAME_WIDTH,
        height: gameConfig.GAME_HEIGHT,
        parent: "harness-root",
        banner: false,
        // Coordinator-flagged defect 2: makes the semi-transparent black shadow sprite visible
        // against the background — see main.js's own docblock for the measured shadow alpha.
        // This minimal harness's fabricated 1x1 `game_map` does not paint a floor large enough
        // to cover the capture region on its own (confirmed live), so the same fallback applies
        // here.
        backgroundColor: "#9a9a9a",
        // PublicScene.createHTMLButtons() calls `this.add.dom(...)`, which throws "No DOM
        // Container set in game config" without this — confirmed live (tasks.md slice 21):
        // harness.html's AvatarHarnessScene never reaches this code path at all, so this
        // requirement is specific to booting the REAL PublicScene class.
        dom: { createContainer: true },
    });

    window.game = game;

    const vueComponent = createNoOpVueComponent();
    const initData = buildRealSceneInitData(vueComponent);

    game.scene.add("PublicScene", PublicScene, false);
    game.events.once("ready", () => {
        game.scene.start("PublicScene", initData);
    });

    // `PublicScene.create()` is async and sets `isSceneReady = true` only once every step in
    // its own real lifecycle has run (design.md §14) — polled here rather than awaited directly,
    // since `scene.start` does not return the scene's own create() promise.
    const waitUntilReady = () => {
        const scene = game.scene.getScene("PublicScene");
        if (scene && scene.isSceneReady) {
            window.__avatarHarness = createAvatarHarnessApi(scene);
            window.__realSceneHarnessReady = true;
            return;
        }
        setTimeout(waitUntilReady, 20);
    };
    waitUntilReady();
}
