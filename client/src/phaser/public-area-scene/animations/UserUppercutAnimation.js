import AnimationUtils from "../utils/AnimationUtils.js";
class UserUppercutAnimation {
    static main(spritePlayer, direction, attacker, avatarId) {
        if (attacker) {
            const textureKey = direction + "_punch_doy";
            AnimationUtils.setSpriteConfig(spritePlayer, avatarId, textureKey);
            spritePlayer.play(avatarId + "_" + textureKey);
        }
        else {
            const textureKey = direction + "_punch_rec";
            AnimationUtils.setSpriteConfig(spritePlayer, avatarId, textureKey);
            spritePlayer.play(avatarId + "_" + textureKey);
        }
    }
}

export default UserUppercutAnimation;