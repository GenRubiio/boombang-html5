import DirectionEnum from "../../enums/DirectionEnum.js";
import AvatarAnimationsEnum from "../../enums/AvatarAnimationsEnum.js";

class UserIdleAnimation {
    /**
     * Inicia la animación según la dirección
     */
    static main(gameScene, socketId, spritePlayer, direction, avatarId) {
        const textureKey = this.getTextureKey(direction);
        const animationData = window.avatars_config[avatarId][textureKey];
        spritePlayer.setFlipX(animationData.flip_horizontally);
        spritePlayer.setOrigin(animationData.originX + (animationData.offsetX / animationData.frameWidth), animationData.originY + (animationData.offsetY / animationData.frameHeight));
        spritePlayer.play(avatarId + "_" + textureKey);
    }

    /**
     * Devuelve el key correcto de la animación o textura
     */
    static getTextureKey(direction) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                return AvatarAnimationsEnum.LEFTDOWN_IDLE;
            case DirectionEnum.DOWN:
                return AvatarAnimationsEnum.DOWN_IDLE;
            case DirectionEnum.DOWN_RIGHT:
                return AvatarAnimationsEnum.RIGHTDOWN_IDLE;
            case DirectionEnum.RIGHT:
                return AvatarAnimationsEnum.RIGHT_IDLE;
            case DirectionEnum.UP_RIGHT:
                return AvatarAnimationsEnum.RIGHTUP_IDLE;
            case DirectionEnum.UP:
                return AvatarAnimationsEnum.UP_IDLE;
            case DirectionEnum.UP_LEFT:
                return AvatarAnimationsEnum.LEFTUP_IDLE;
            case DirectionEnum.LEFT:
                return AvatarAnimationsEnum.LEFT_IDLE;
        }
    }
}

export default UserIdleAnimation;