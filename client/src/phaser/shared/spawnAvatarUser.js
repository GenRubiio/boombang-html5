import AvatarEnum from "@/enums/AvatarEnum.js";
import smartAvatarSystem from "../managers/SmartAvatarSystem.js";

let ghostCounter = 0;

/**
 * Fabricates one synthetic user through the REAL `AddUserController.processUser` path
 * (design.md §10) — the single spawn primitive `PerfHarness.spawnGhosts` (perf measurement)
 * and `window.__avatarHarness.spawnAvatar` (the Playwright resolved-state harness, PR2) both
 * delegate to, so the two harnesses cannot drift on what "spawn an avatar" means.
 *
 * @param {Phaser.Scene} scene
 * @param {{socketId?: string, avatarId?: number, x?: number, y?: number, username?: string,
 *   showUsername?: boolean, accessories?: {hat?: string, pet?: string, aura?: string},
 *   palette?: Record<string, string>}} [opts]
 * @returns {Promise<object|undefined>} the created UserModel-shaped entry, as stored in
 *   `scene.users[socketId]` — `undefined` if the spawn failed (e.g. atlas not loaded yet).
 */
async function spawnAvatarUser(scene, opts = {}) {
    const {
        socketId = `__ghost_${Date.now()}_${ghostCounter++}`,
        avatarId = AvatarEnum.RASTA,
        x = 0,
        y = 0,
        username = socketId,
        // tasks.md slice 21 defect-2 fix (coordinator-flagged): the name-tag bubble
        // (`AddUserController`'s own `show_username` gate) sat directly over a contact-sheet
        // cell's head. Defaults to `true` (byte-for-byte unchanged for every existing caller —
        // `PerfHarness.spawnGhosts` and every `avatar-resolved-state.spec.js` test never pass
        // this, and none of their assertions read `nameBackground`/`nameText` presence), so only
        // a caller that explicitly opts out (the contact-sheet capture tooling) is affected.
        showUsername = true,
        accessories,
        palette,
    } = opts;

    const { default: AddUserController } = await import(
        "../controllers/scene/AddUserController.js"
    );
    const { default: avatarManager } = await import("../managers/AvatarManager.js");

    // design.md §10: "spawnAvatar loads base + action + accessory packages, then calls the
    // real AddUserController.processUser". This step matters even outside the harness:
    // `AddUserController.createAvatarSprite`'s layered branch only uses the layered renderer
    // if `avatarManager.getLayeredManifest(avatarId)` is ALREADY populated in memory — it does
    // not itself call `loadLayeredAvatar` when the manifest is missing, by design (that is the
    // "background/priority loader has not finished yet" fallback-to-baked path). In the real
    // game a background loader primes this before any user with that avatarId appears; a
    // freshly booted harness (or a ghost for an avatarId nothing has loaded yet) has no such
    // loader running, so this call reproduces that priming step explicitly. Best-effort: a
    // failed/missing load falls through to processUser's own existing "atlas not found"
    // placeholder behaviour, unchanged.
    try {
        await avatarManager.loadAvatar(scene, avatarId);
    } catch (_err) {
        // Matches AddUserController.createAvatarSprite's own fallback: proceed anyway.
    }

    // Live-discovered defect (tasks.md slice 22, sally): `AddUserController.processUser` first
    // asks `smartAvatarSystem.getAvatarForUser(userId, avatarId)` — a COMPLETELY SEPARATE,
    // baked-legacy availability tracker (`SmartAvatarSystem.availableAvatars`, populated only by
    // `BackgroundAvatarLoader`'s own preload events) — and SILENTLY SUBSTITUTES a fallback
    // avatarId (ultimately RASTA, its own hardcoded last resort) whenever the requested id is
    // not in that separate set. The harness never runs `smartAvatarSystem.init()`/the background
    // loader, so `availableAvatars` starts empty — every prior test in this apply pass happened
    // to request RASTA or GATA (both fallback-eligible, and RASTA is the ultimate hardcoded
    // fallback), so the substitution was invisible: requesting RASTA silently "falls back" to
    // RASTA. The FIRST harness request for any OTHER avatarId (sally, avatarId 18) exposed it —
    // confirmed live: `spriteAvatar.isLayered` was `false`/`textureKey: "__DEFAULT"` even though
    // `avatarManager.getLayeredManifest(18)` was already true, because `processUser` had already
    // swapped `userData.avatar_id` to 12 before `createAvatarSprite` ever ran. This is a real
    // production-shaped gap (the SAME two-system split exists in the real game), but it is ONLY
    // reachable via this harness's own boot sequence (the real game DOES run
    // `AvatarSystemController.init`/the background loader before any user ever mounts) — fixed
    // here, not in `SmartAvatarSystem`/`AddUserController` themselves, by marking every
    // harness-spawned avatarId available the same way the real background loader eventually
    // would, mirroring the `avatarManager.loadAvatar` priming step immediately above.
    smartAvatarSystem.availableAvatars.add(avatarId);

    const userData = {
        id: socketId,
        username,
        avatar_id: avatarId,
        x,
        y,
        z: 0,
        shadow_color: null,
        name_color: null,
        show_username: showUsername,
        rings_won: 0,
        uppercut_selected: null,
        accessories,
        avatar_palette: palette ? { [avatarId]: palette } : undefined,
    };

    await AddUserController.processUser(scene, userData);
    return scene.users[socketId];
}

export { spawnAvatarUser };
