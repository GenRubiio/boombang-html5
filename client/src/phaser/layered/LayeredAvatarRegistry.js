/**
 * One scene-level animation-clock tick driving every live LayeredAvatar (design.md §5 cost 3):
 * a deliberate second timing path, rather than a `setInterval`/timer per avatar. Register a
 * LayeredAvatar when it is created; unregister it on destroy.
 *
 * Not unit-tested directly for the same reason as LayeredAvatar.js (design.md §8): it only
 * calls a live LayeredAvatar instance's `tick(delta)`. The registration bookkeeping itself
 * (register/unregister/size) is exercised below with plain object doubles, with no Phaser
 * dependency, since `tick()` is a duck-typed call (`avatar.tick(delta)`).
 */
class LayeredAvatarRegistry {
    constructor() {
        this._avatars = new Set();
    }

    register(avatar) {
        this._avatars.add(avatar);
    }

    unregister(avatar) {
        this._avatars.delete(avatar);
    }

    get size() {
        return this._avatars.size;
    }

    /**
     * Called once per scene update from the owning scene's `update(time, delta)`.
     */
    update(_time, delta) {
        this._avatars.forEach((avatar) => {
            if (typeof avatar.tick === 'function') {
                avatar.tick(delta);
            }
        });
    }
}

export default LayeredAvatarRegistry;
