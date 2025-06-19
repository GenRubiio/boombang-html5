import AnimationUtils from "../../utils/AnimationUtils.js";
import UserIdleAnimation from "../animations/UserIdleAnimation.js";
import DirectionEnum from "../../enums/DirectionEnum.js";

class UserCocoAnimation {
    /**
     * Inicia la animación según la dirección
     */
    static main(spriteAvatar, avatarId) {
        const textureKey = "down_coco";
        AnimationUtils.setSpriteConfig(spriteAvatar, avatarId, textureKey);
        spriteAvatar.play(avatarId + "_" + textureKey, true);
        spriteAvatar.once('animationcomplete', () => {
            UserIdleAnimation.main(
                spriteAvatar,
                DirectionEnum.DOWN,
                avatarId
            );
        });
    }
}

export default UserCocoAnimation;