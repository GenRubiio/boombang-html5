import AnimationUtils from "../utils/AnimationUtils.js";
class UserUppercutAnimation {
    static main(gameScene, socketId, spritePlayer, direction, attacker, avatarId) {
        if (attacker) {
            const textureKey = direction + "_punch_doy";
            AnimationUtils.setSpriteConfig(avatarId, textureKey);
            spritePlayer.play(avatarId + "_" + textureKey);
        }
        else {
            const textureKey = direction + "_punch_rec";
            AnimationUtils.setSpriteConfig(avatarId, textureKey);
            spritePlayer.play(avatarId + "_" + textureKey);
        }
    }
}

export default UserUppercutAnimation;