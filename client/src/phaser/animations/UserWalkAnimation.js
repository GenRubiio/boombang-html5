import DirectionEnum from "../../enums/DirectionEnum.js";
import AvatarAnimationsEnum from "../../enums/AvatarAnimationsEnum.js";
import AnimationUtils from "../../utils/AnimationUtils.js";

/**
 * Maneja la animación de caminar según la dirección.
 */
class UserWalkAnimation {
    /**
     * Ajusta la animación en el sprite y la reproduce.
     * @param {Phaser.GameObjects.Sprite} spriteAvatar
     * @param {number} direction - Una de las direcciones definidas en DirectionEnum
     * @param {string} avatarId - Para usar la config apropiada
     */
    static playWalk(spriteAvatar, direction, avatarId) {
        const textureKey = this.getTextureKey(direction);
        
        // Configura sprite (flip, origen, etc.)
        AnimationUtils.setSpriteConfig(spriteAvatar, avatarId, textureKey);
        
        // Inicia la animación una sola vez
        spriteAvatar.play(avatarId + "_" + textureKey, true);
    }

    /**
     * Retorna la clave de animación según la dirección.
     */
    static getTextureKey(direction) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                return AvatarAnimationsEnum.LEFTDOWN_WALK;
            case DirectionEnum.DOWN:
                return AvatarAnimationsEnum.DOWN_WALK;
            case DirectionEnum.DOWN_RIGHT:
                return AvatarAnimationsEnum.RIGHTDOWN_WALK;
            case DirectionEnum.RIGHT:
                return AvatarAnimationsEnum.RIGHT_WALK;
            case DirectionEnum.UP_RIGHT:
                return AvatarAnimationsEnum.RIGHTUP_WALK;
            case DirectionEnum.UP:
                return AvatarAnimationsEnum.UP_WALK;
            case DirectionEnum.UP_LEFT:
                return AvatarAnimationsEnum.LEFTUP_WALK;
            case DirectionEnum.LEFT:
                return AvatarAnimationsEnum.LEFT_WALK;
            default:
                // Fallback por si no coincide nada
                return AvatarAnimationsEnum.DOWN_WALK;
        }
    }
}

export default UserWalkAnimation;
