import AnimationUtils from "../../utils/AnimationUtils.js";
import UserIdleAnimation from "./UserIdleAnimation.js";

class UserChatAnimation {
    static main(user, textureKey) {
        if (!textureKey) return;
        const spriteAvatar = user.spriteAvatar;
        const avatarId = user.avatarId;
        AnimationUtils.setSpriteConfig(spriteAvatar, avatarId, textureKey);
        spriteAvatar.play(avatarId + "_" + textureKey, false);

        spriteAvatar.once("animationcomplete", () => {
            UserIdleAnimation.main(
                user.spriteAvatar,
                user.position.z,
                user.avatarId
            );
        });
    }
}

export default UserChatAnimation;