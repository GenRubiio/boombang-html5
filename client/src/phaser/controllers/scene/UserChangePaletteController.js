/**
 * Applies an accepted palette-change broadcast to the affected avatar in-room, without a
 * sprite replacement (LR9). Resolves the target directly through `gameScene.users[socketId]`
 * — `gameScene.users` is keyed by socket id (AddUserController.js:116, UserResource.js:8) —
 * rather than through SmartAvatarSystem's map, so it reaches an avatar regardless of whether
 * it loaded via the immediate or fallback/upgrade path (PROTO3, design.md §6).
 */
class UserChangePaletteController {
    static main(gameScene, data) {
        const user = gameScene.users[data.socketId];
        if (!user) return;

        if (!user.avatarPalettes) {
            user.avatarPalettes = {};
        }
        user.avatarPalettes[data.avatarId] = {
            ...(user.avatarPalettes[data.avatarId] || {}),
            ...data.slots,
        };

        const sprite = user.spriteAvatar;
        if (sprite && sprite.isLayered && sprite._avatarId === data.avatarId) {
            sprite.applyPalette(data.slots);
        }
    }
}

export default UserChangePaletteController;
