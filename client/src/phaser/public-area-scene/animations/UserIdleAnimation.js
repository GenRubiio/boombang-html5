import DirectionEnum from "../../enums/DirectionEnum.js";
import AnimationUtils from "../utils/AnimationUtils.js";
import AvatarAnimationsEnum from "../../enums/AvatarAnimationsEnum.js";

class UserIdleAnimation {
    /**
     * Inicia la animación según la dirección
     */
    static main(gameScene, socketId, spritePlayer, direction, avatarId) {
        const textureKey = this.getTextureKey(direction, avatarId);
        //AnimationUtils.setOrigin(gameScene, spritePlayer, avatarId, textureKey, "walk_singleAtlas");
        spritePlayer.play(textureKey);
    }

    /**
     * Devuelve el key correcto de la animación o textura
     */
    static getTextureKey(direction, avatarId) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                return avatarId + "_" + AvatarAnimationsEnum.LEFTDOWN_IDLE;
            case DirectionEnum.DOWN:
                return avatarId + "_" + AvatarAnimationsEnum.DOWN_IDLE;
            case DirectionEnum.DOWN_RIGHT:
                return avatarId + "_" + AvatarAnimationsEnum.RIGHTDOWN_IDLE;
            case DirectionEnum.RIGHT:
                return avatarId + "_" + AvatarAnimationsEnum.RIGHT_IDLE;
            case DirectionEnum.UP_RIGHT:
                return avatarId + "_" + AvatarAnimationsEnum.RIGHTUP_IDLE;
            case DirectionEnum.UP:
                return avatarId + "_" + AvatarAnimationsEnum.UP_IDLE;
            case DirectionEnum.UP_LEFT:
                return avatarId + "_" + AvatarAnimationsEnum.LEFTUP_IDLE;
            case DirectionEnum.LEFT:
                return avatarId + "_" + AvatarAnimationsEnum.LEFT_IDLE;
        }
    }
}

export default UserIdleAnimation;