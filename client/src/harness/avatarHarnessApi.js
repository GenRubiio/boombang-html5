// design.md §10: window.__avatarHarness's implementation, split from AvatarHarnessScene.js so
// the direction/emoji-name lookup tables (the only non-Phaser-shell logic here) sit in one
// place. Still I/O-shell code overall (every function touches a live Phaser scene/sprite) —
// not unit-tested directly for the same reason as LayeredAvatar.js (design.md §8); exercised
// live by client/e2e/avatar-resolved-state.spec.js.

import DirectionEnum from "@/enums/DirectionEnum.js";
import UserIdleAnimation from "../phaser/animations/UserIdleAnimation.js";
import { spawnAvatarUser } from "../phaser/shared/spawnAvatarUser.js";
// UserEmojiAnimation/UserChatAnimation below are dynamically imported rather than imported at
// top so avatarHarnessApi.test.js (which imports THIS file directly to unit-test its one pure
// helper, resolveDirectionValue) does not need to drag their transitive Phaser dependency into
// its module graph.

// Friendly direction names (matching the 8-direction vocabulary design.md/tasks.md use
// throughout, e.g. "R3/R4 ... all 8 directions") mapped onto the canonical DirectionEnum
// values UserIdleAnimation.main already switches on.
const DIRECTION_NAMES = {
    down: DirectionEnum.DOWN,
    downright: DirectionEnum.DOWN_RIGHT,
    right: DirectionEnum.RIGHT,
    upright: DirectionEnum.UP_RIGHT,
    up: DirectionEnum.UP,
    upleft: DirectionEnum.UP_LEFT,
    left: DirectionEnum.LEFT,
    downleft: DirectionEnum.DOWN_LEFT,
};

function resolveDirectionValue(direction) {
    if (typeof direction === "number") return direction;
    const key = String(direction).toLowerCase();
    if (!(key in DIRECTION_NAMES)) {
        throw new Error(`[avatarHarness] unknown direction "${direction}"`);
    }
    return DIRECTION_NAMES[key];
}

function resolveChildKind(child, user) {
    if (child === user.spriteShadow) return "shadow";
    if (child === user.spriteAvatar) return "body";
    if (child.isAccessory) return child.accessoryKind;
    if (child.type === "Text") return "nameText";
    return "nameBackground";
}

/**
 * Union of `getBounds()` over a LayeredAvatar's currently VISIBLE pool children only (design.md
 * §10) — a hidden pool child keeps a stale, reset-to-origin bounds contribution (see
 * LayeredAvatar._applyFrame's defensive fix), which is exactly why "visible only" matters here.
 * `getBounds()` returns WORLD coordinates; the container's own world position is subtracted so
 * the result is container-LOCAL, in the same frame as `shadow.x === 0`/`shadow.y === 0` (R5) —
 * the anchor every direction's centre should sit near zero relative to, not an absolute world
 * offset that shifts with wherever the container itself was placed on the tile grid.
 */
function computeVisibleBounds(avatar, container) {
    const visible = avatar._pool.filter((child) => child.visible);
    const union = visible.reduce((acc, child) => {
        const b = child.getBounds();
        if (!acc) return { minX: b.left, maxX: b.right, minY: b.top, maxY: b.bottom };
        return {
            minX: Math.min(acc.minX, b.left),
            maxX: Math.max(acc.maxX, b.right),
            minY: Math.min(acc.minY, b.top),
            maxY: Math.max(acc.maxY, b.bottom),
        };
    }, null) || { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const local = {
        minX: union.minX - container.x,
        maxX: union.maxX - container.x,
        minY: union.minY - container.y,
        maxY: union.maxY - container.y,
    };
    return { ...local, centerX: (local.minX + local.maxX) / 2 };
}

function computeSlotTints(avatar) {
    return avatar._pool
        .filter((child) => child.visible)
        .map((child) => {
            const pieceId = child.getData("pieceId");
            const piece = pieceId && avatar._manifest.pieces[pieceId];
            if (!piece || !piece.slot) return null;
            return { pieceId, slot: piece.slot, tint: child.tint };
        })
        .filter(Boolean);
}

/**
 * @param {Phaser.Scene} scene the harness scene, exposing `users`/`layeredAvatarRegistry` the
 *   same way any real gameplay scene does.
 * @returns {object} the `window.__avatarHarness` surface (design.md §10).
 */
/**
 * Neutralizes automatic per-frame ticking of `scene.layeredAvatarRegistry` (design.md §10:
 * "removes both the wait and frame-timing flake" — `advance(ms)` must be the ONLY thing that
 * ever advances a LayeredAvatar's clock). `AddUserController.createAvatarSprite` wires
 * `gameScene.events.on("update", (time, delta) => gameScene.layeredAvatarRegistry.update(time,
 * delta))` the first time any layered avatar is spawned; the scene's own Phaser game loop keeps
 * emitting that 'update' event every real animation frame regardless of what the harness does,
 * so real wall-clock time would otherwise leak into every test. Patched here (not by pausing
 * the scene) because pausing stops `scene.load`'s own per-frame progress polling too, hanging
 * every accessory/action-pack load that resolves via `scene.load.once('complete', ...)`
 * (confirmed live while building this harness). The original `update` is preserved so
 * `advance(ms)` can still call the real tick logic directly, on demand.
 */
function neutralizeAutomaticTicking(scene) {
    const registry = scene.layeredAvatarRegistry;
    if (!registry || registry._harnessPatched) return;
    registry._harnessPatched = true;
    registry._realUpdate = registry.update.bind(registry);
    registry.update = () => {};
}

function createAvatarHarnessApi(scene) {
    return {
        async spawnAvatar(opts = {}) {
            const user = await spawnAvatarUser(scene, opts);
            neutralizeAutomaticTicking(scene);
            return user ? user.socketId : null;
        },

        // Live-caught defect (tasks.md slices 28-31, apply-progress.md): the contact-sheet
        // tooling (`buildAvatarContactSheet.js`) spawns one fresh avatar per row (idle/hat/pet/
        // aura/action) at the SAME tile position, but never removed the previous row's avatar —
        // by the end of one character's full capture, 4 avatars sat stacked on top of each
        // other. Invisible for most characters (a later avatar's own body silhouette happened to
        // occlude the earlier one), but confirmed live and visible for `ninja` (a small, mostly
        // black body): its "pet" row screenshot showed the PRECEDING "hat" row's still-alive
        // `minnieHat` bleeding through underneath the new pet-only avatar. `RemoveUserController`
        // is the real production removal path (tween/animation stop, container destroy, `scene.
        // users` delete) — reused here exactly, the same "drive the harness through the real
        // controller" philosophy `spawnAvatar` already follows for creation.
        async despawnAvatar(socketId) {
            const { default: RemoveUserController } = await import(
                "../phaser/controllers/scene/RemoveUserController.js"
            );
            RemoveUserController.main(scene, socketId);
        },

        // design.md §13.3 (tasks.md slice 15): with the always-on prefetch removed, nothing
        // loads an action pack until `play()` first needs it — R11 (full-coverage sweep, zero
        // degrades) needs every action-backed key's pack ALREADY resident before it starts, or
        // every key would degrade once (recorded permanently by degradeReporter's warn-once
        // map) on its very first `playKey` call. Pre-loads every DISTINCT packId directly via
        // `avatarManager.loadLayeredActionKey`, bypassing `play()`/degrade entirely.
        async preloadActionPacks(socketId) {
            const user = scene.users[socketId];
            if (!user) return;
            const avatar = user.spriteAvatar;
            if (!avatar || !avatar.isLayered) return;
            const { default: avatarManager } = await import("../phaser/managers/AvatarManager.js");
            const packIds = new Set(avatar._actionBackedKeys.values());
            await Promise.all(
                [...packIds].map(async (packId) => {
                    const atlasKey = await avatarManager.loadLayeredActionKey(scene, avatar._avatarId, packId);
                    if (atlasKey) avatar.setActionsAtlasKey(packId, atlasKey);
                })
            );
        },

        setDirection(socketId, direction) {
            const user = scene.users[socketId];
            if (!user) return;
            const directionValue = resolveDirectionValue(direction);
            user.position.z = directionValue;
            UserIdleAnimation.main(user.spriteAvatar, directionValue, user.avatarId);
        },

        async playAction(socketId, emojiId) {
            const user = scene.users[socketId];
            if (!user) return;
            const { default: UserEmojiAnimation } = await import(
                "../phaser/animations/UserEmojiAnimation.js"
            );
            UserEmojiAnimation.main(user, emojiId, scene);
        },

        playKey(socketId, textureKey) {
            const user = scene.users[socketId];
            if (!user) return;
            // Raw play() path (design.md §10) — bypasses UserIdleAnimation/UserEmojiAnimation
            // for keys with no emoji trigger of their own (punch_*, beber, trampa, ...).
            user.spriteAvatar.play(`${user.avatarId}_${textureKey}`, false);
        },

        // Not in design.md §10's original table — added because R7 (animationcomplete fires
        // AND the real listener runs) needs a REAL production controller that both (a) targets
        // a non-repeating (`repeat: 0`) sequence and (b) registers a one-time
        // `animationcomplete` listener returning the avatar to idle. Before PR5 compiles any
        // action/emote sequence, rasta's *_talk sequences are the only `repeat: 0` entries in
        // the compiled manifest (verified live: `down_talk` is `{fps:19, repeat:0, frames:
        // [8 entries]}`), and `UserChatAnimation.main` (client/src/phaser/animations/
        // UserChatAnimation.js) is the existing, real controller for exactly that path —
        // `playKey`'s raw `sprite.play()` deliberately registers no listener, so R7 cannot be
        // proven through it. `playAction` cannot serve R7 either: every currently-compiled
        // emote key falls back to `down_idle` (repeat:-1, never completes) until PR5 compiles
        // rasta's action set.
        async playChat(socketId, textureKey) {
            const user = scene.users[socketId];
            if (!user) return;
            const { default: UserChatAnimation } = await import(
                "../phaser/animations/UserChatAnimation.js"
            );
            UserChatAnimation.main(user, textureKey);
        },

        // Not in design.md §10's original table — added for the live-reported defect fix
        // ("cuando me pegan la animacion el pet tambien se mueve de posicion", pivot.js's
        // `resolveAccessoryPlacement` containerOffset docblock has the full root-cause account).
        // Mirrors EXACTLY what the real production code does to the body during a punch-
        // received knockback: `UserUppercutAnimation.launchUpwards` tweens `spriteAvatar.y` (the
        // LayeredAvatar Container's OWN transform) directly — this sets the SAME field the SAME
        // way, deterministically and without a live tween, so an e2e test can assert the
        // accessory tracks it at an exact, reproducible offset instead of racing a real 800ms
        // Phaser tween.
        setBodyContainerOffset(socketId, x, y) {
            const user = scene.users[socketId];
            if (!user || !user.spriteAvatar) return;
            user.spriteAvatar.x = x;
            user.spriteAvatar.y = y;
        },

        advance(ms) {
            const registry = scene.layeredAvatarRegistry;
            if (!registry) return;
            // Bypass the neutralized (no-op) `.update` and call the real tick logic directly
            // (design.md §10) — this is the ONLY thing that ever advances a LayeredAvatar's
            // animation clock in the harness.
            (registry._realUpdate || registry.update.bind(registry))(0, ms);
        },

        readState(socketId) {
            const user = scene.users[socketId];
            if (!user) return null;
            const container = user.containerUser;
            const avatar = user.spriteAvatar;

            const children = container.list.map((child, index) => ({
                index,
                kind: resolveChildKind(child, user),
                textureKey: child.texture ? child.texture.key : null,
                frameName: child.frame ? child.frame.name : null,
                x: child.x,
                y: child.y,
                depth: child.depth,
                visible: child.visible,
                flipX: !!child.flipX,
                scaleX: child.scaleX,
                tint: typeof child.tint === "number" ? child.tint : null,
                // R3 (pet stays on its declared side): needs the accessory's actual displayed
                // half-width, not just its centre x. `displayWidth` is Phaser's own
                // already-scaled size for Image/Sprite; undefined for Text/Container children,
                // where it is not meaningful for this assertion.
                displayWidth: typeof child.displayWidth === "number" ? child.displayWidth : null,
            }));

            let body = null;
            if (avatar && avatar.isLayered) {
                body = {
                    requestedKey: avatar._requestedKey,
                    sequenceKey: avatar._seqKey,
                    sourceKey: avatar._sourceKey,
                    mirrored: avatar._mirrored,
                    seqIndex: avatar._seqIndex,
                    visibleBounds: computeVisibleBounds(avatar, container),
                    slotTints: computeSlotTints(avatar),
                };
            }

            return {
                container: { x: container.x, y: container.y, depth: container.depth },
                children,
                body,
            };
        },

        degrades() {
            const map = window.__layeredDegrades;
            return map ? [...map.values()] : [];
        },
    };
}

export { createAvatarHarnessApi, resolveDirectionValue };
