import AnimationUtils from "../utils/AnimationUtils.js";

class UserUppercutAnimation {
    static main(gameScene, socketId, spritePlayer, direction, attacker, avatarId) {
        if (attacker) {
            AnimationUtils.setOrigin(gameScene, spritePlayer, avatarId, direction + "_punch_doy_atlas_0");
            spritePlayer.play(socketId + "_" + direction + "_punch_doy_atlas_0");
        }
        else {
            AnimationUtils.setOrigin(gameScene, spritePlayer, avatarId, direction + "_punch_rec_atlas_0");
            spritePlayer.play(socketId + "_" + direction + "_punch_rec_atlas_0");
        }
    }
}

export default UserUppercutAnimation;