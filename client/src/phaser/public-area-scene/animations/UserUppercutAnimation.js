import AnimationUtils from "../utils/AnimationUtils.js";

class UserUppercutAnimation {
    static main(gameScene, socketId, spritePlayer, direction, attacker, avatarId) {
        if (attacker) {
            AnimationUtils.setOrigin(gameScene, spritePlayer, avatarId, direction + "_punch_doy", "punch_doy_singleAtlas");
            spritePlayer.play(socketId + "_" + direction + "_punch_doy");
        }
        else {
            AnimationUtils.setOrigin(gameScene, spritePlayer, avatarId, direction + "_punch_rec", "punch_rec_singleAtlas");
            spritePlayer.play(socketId + "_" + direction + "_punch_rec");
        }
    }
}

export default UserUppercutAnimation;