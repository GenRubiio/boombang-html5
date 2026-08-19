import Phaser from "phaser";
import asset_shadow_image from "@/assets/game/avatar/shadow.webp";
import asset_shadow_selected_image from "@/assets/game/avatar/shadow_selected.webp";
import { createAvatarHarnessApi } from "./avatarHarnessApi.js";
import { createAvatarMetricsAggregator } from "@/phaser/debug/avatarMetrics.js";

/**
 * Dev-only driving surface for the resolved-state Playwright harness (design.md §10) — NOT the
 * real game. Supplies exactly what `AddUserController.processUser` -> `createContainerUser` ->
 * `MoveUserToTileController.main` reads from a scene, verified sufficient by design.md §10:
 * `users`, `isSceneReady`, `sceneScaleFactor`, the `shadow`/`shadow_selected` textures, and a
 * `tintMgr` stub (reached only from the shadow's `pointerdown` handler and from
 * `safeApplyTint`, which returns early for layered sprites before ever touching `tintMgr`).
 * No tile map, no socket-driven scene lifecycle, no server/API/DB/login dependency.
 *
 * The scene stays ACTIVE (never paused) — `scene.load`'s own file-loader progress polling is
 * driven off the scene's per-frame update loop, so pausing the scene hangs every
 * `scene.load.once('complete', ...)` promise (confirmed live: every accessory/action-pack load
 * inside `AddUserController`/`AvatarManager`/`AccessoryManager` never resolves). Instead,
 * `avatarHarnessApi.js`'s `neutralizeAutomaticTicking` patches
 * `scene.layeredAvatarRegistry.update` to a no-op the first time an avatar is spawned, so real
 * wall-clock frames never advance a LayeredAvatar's animation clock — only
 * `window.__avatarHarness.advance(ms)` does, deterministically. See that function's docblock
 * for the full account.
 */
class AvatarHarnessScene extends Phaser.Scene {
    constructor() {
        super("AvatarHarnessScene");
    }

    preload() {
        this.load.image("shadow", asset_shadow_image);
        this.load.image("shadow_selected", asset_shadow_selected_image);
    }

    create() {
        this.users = {};
        this.isSceneReady = true;
        this.sceneScaleFactor = 1;
        // Present for API parity with a real gameplay scene (AddUserController.main pushes
        // here while !isSceneReady) — never actually used, since isSceneReady is always true.
        this.eventBuffer = [];
        // Reached only from the shadow sprite's `pointerdown` handler (never triggered by the
        // harness's programmatic API — nothing here simulates a pointer click) and from
        // `AddUserController.safeApplyTint`, which returns early for layered sprites before
        // ever touching `tintMgr` (see that method's docblock). A stub is enough either way.
        this.tintMgr = {
            replaceColor() {},
            clearPart() {},
        };
        this.selectedShadow = null;

        window.__avatarHarness = createAvatarHarnessApi(this);

        // design.md §11 (tasks.md slice 7): production-parity metrics, exposed the same way
        // window.__avatarHarness already is — dev-only harness page, gated a level up by
        // VITE_AVATAR_HARNESS (main.js).
        const metrics = createAvatarMetricsAggregator(this);
        metrics.wire();
        window.__avatarMetrics = () => metrics.snapshot();
        window.__avatarMetricsControls = {
            markRoomEntry: metrics.markRoomEntry,
            markActionColdStart: metrics.markActionColdStart,
            markActionColdEnd: metrics.markActionColdEnd,
        };
    }
}

export default AvatarHarnessScene;
