import DirectionEnum from "../enums/DirectionEnum.js";
import AnimationUtils from "../utils/AnimationUtils.js";

class UserIdleAnimation {
    /**
     * Inicia la animación según la dirección
     */
    static main(gameScene, socketId, spritePlayer, direction, avatarId) {
        const animationKey = this.getTextureKey(direction);
        AnimationUtils.setOrigin(gameScene, spritePlayer, avatarId, animationKey, "walk_singleAtlas");
        spritePlayer.play(socketId + "_" + animationKey);
    }

    /**
     * Devuelve el key correcto de la animación o textura
     */
    static getTextureKey(direction) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                return "leftdown_idle";
            case DirectionEnum.DOWN:
                return "down_idle";
            case DirectionEnum.DOWN_RIGHT:
                return "rightdown_idle";
            case DirectionEnum.RIGHT:
                return "right_idle";
            case DirectionEnum.UP_RIGHT:
                return "rightup_idle";
            case DirectionEnum.UP:
                return "up_idle";
            case DirectionEnum.UP_LEFT:
                return "leftup_idle";
            case DirectionEnum.LEFT:
                return "left_idle";
        }
    }
}

export default UserIdleAnimation;