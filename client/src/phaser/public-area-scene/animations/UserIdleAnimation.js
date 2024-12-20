import DirectionEnum from "../enums/DirectionEnum.js";
import AnimationUtils from "../utils/AnimationUtils.js";

class UserIdleAnimation {
    /**
    * Configura el sprite en el frame inicial según la dirección
    */
    static setDefaultFrame(gameScene, socketId, spritePlayer, direction, avatarId) {
        const textureKey = this.getTextureKey(direction);
        AnimationUtils.setOrigin(gameScene, spritePlayer, avatarId, textureKey);
        spritePlayer.setTexture(socketId + "_" + textureKey);
    }

    /**
     * Inicia la animación según la dirección
     */
    static playDefaultFrame(gameScene, socketId, spritePlayer, direction, avatarId) {
        const animationKey = this.getTextureKey(direction);
        AnimationUtils.setOrigin(gameScene, spritePlayer, avatarId, animationKey);
        spritePlayer.play(socketId + "_" + animationKey);
    }

    /**
     * Devuelve el key correcto de la animación o textura
     */
    static getTextureKey(direction) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                return "leftdown_idle_atlas_0";
            case DirectionEnum.DOWN:
                return "down_idle_atlas_0";
            case DirectionEnum.DOWN_RIGHT:
                return "rightdown_idle_atlas_0";
            case DirectionEnum.RIGHT:
                return "right_idle_atlas_0";
            case DirectionEnum.UP_RIGHT:
                return "rightup_idle_atlas_0";
            case DirectionEnum.UP:
                return "up_idle_atlas_0";
            case DirectionEnum.UP_LEFT:
                return "leftup_idle_atlas_0";
            case DirectionEnum.LEFT:
                return "left_idle_atlas_0";
        }
    }
}

export default UserIdleAnimation;