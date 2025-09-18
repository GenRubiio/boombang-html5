import DirectionEnum from "../../enums/DirectionEnum.js";
import AvatarAnimationsEnum from "../../enums/AvatarAnimationsEnum.js";
import AnimationUtils from "../../utils/AnimationUtils.js";

class UserIdleAnimation {
    /**
     * Inicia la animación según la dirección
     */
    static main(spriteAvatar, direction, avatarId) {
        const textureKey = this.getTextureKey(direction);
        const animKey = avatarId + "_" + textureKey;
        // Si la animación aún no existe (atlas no cargado), usar un frame por defecto o salir silenciosamente
        const scene = spriteAvatar.scene;
        if (!scene || !scene.anims || !scene.anims.exists(animKey)) {
            // Placeholder: mostrar sprite invisible para no romper, se hará play cuando exista
            // Opcional: podríamos setear un frame neutral si existiera
            return;
        }
        AnimationUtils.setSpriteConfig(spriteAvatar, avatarId, textureKey);
        spriteAvatar.play(animKey, true);
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