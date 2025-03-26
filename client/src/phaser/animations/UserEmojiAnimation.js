import AvatarEmojisEnum from "../../enums/AvatarEmojisEnum.js";
import AvatarEmojisNameAnimationsEnum from "../../enums/AvatarEmojisNameAnimationsEnum.js";
import AnimationUtils from "../../utils/AnimationUtils.js";
import UserIdleAnimation from "./UserIdleAnimation.js";

class UserEmojiAnimation {
    /**
     * Inicia la animación según la dirección
     */
    static main(user, emojiId) {
        const spriteAvatar = user.sprite_player;
        const avatarId = user.avatar_id;
        const textureKey = this.getTextureKey(emojiId);
        if (!textureKey) return;
        AnimationUtils.setSpriteConfig(spriteAvatar, avatarId, textureKey);
        spriteAvatar.play(avatarId + "_" + textureKey, false);

        spriteAvatar.once("animationcomplete", () => {
            UserIdleAnimation.main(
                user.sprite_player,
                user.position.z,
                user.avatar_id
            );
        });
    }

    /**
     * Devuelve el key correcto de la animación o textura
     */
    static getTextureKey(emojiId) {
        switch (emojiId) {
            case AvatarEmojisEnum.LAUGHTER_1:
                return AvatarEmojisNameAnimationsEnum.LAUGHTER_1;
            case AvatarEmojisEnum.LAUGHTER_2:
                return AvatarEmojisNameAnimationsEnum.LAUGHTER_2;
            case AvatarEmojisEnum.CRY:
                return AvatarEmojisNameAnimationsEnum.CRY;
            case AvatarEmojisEnum.LOVE:
                return AvatarEmojisNameAnimationsEnum.LOVE;
            case AvatarEmojisEnum.SPIT:
                return AvatarEmojisNameAnimationsEnum.SPIT;
            case AvatarEmojisEnum.FART:
                return AvatarEmojisNameAnimationsEnum.FART;
            case AvatarEmojisEnum.PROVOKE:
                return AvatarEmojisNameAnimationsEnum.PROVOKE;
            case AvatarEmojisEnum.FLY:
                return AvatarEmojisNameAnimationsEnum.FLY;
            default:
                return null;
        }
    }
}

export default UserEmojiAnimation;