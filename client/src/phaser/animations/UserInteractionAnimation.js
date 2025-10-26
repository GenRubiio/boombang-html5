import AnimationUtils from "../../utils/AnimationUtils.js";
import UserEmojiAnimation from "./UserEmojiAnimation.js";
import AvatarEnum from "../../enums/AvatarEnum.js";

class UserInteractionAnimation {
  static main(
    spriteAvatar,
    direction,
    senderUser,
    avatarId,
    gameScene,
    interactionType
  ) {
    if (UserEmojiAnimation.isFlying(spriteAvatar)) {
      UserEmojiAnimation.cancelFly(spriteAvatar, gameScene);
    }
    const textureKey = this.#textureKey(
      senderUser,
      direction,
      avatarId,
      interactionType
    );
    if (!textureKey) return;
    AnimationUtils.setSpriteConfig(spriteAvatar, avatarId, textureKey);
    spriteAvatar.play(avatarId + "_" + textureKey, true);
  }

  static #textureKey(senderUser, direction, avatarId, interactionType) {
    
    switch (interactionType) {
      case "kiss":
        return direction + "_beso";
      case "drink":
        switch (avatarId) {
          case AvatarEnum.GATA:
          case AvatarEnum.BRUJITA:
            return "down_beber";
          default:
            return direction + "_beber";
        }
      case "rose":
        switch (avatarId) {
          case AvatarEnum.GATA:
            return senderUser
              ? direction + "down_flor"
              : direction + "_flor_rec";
          default:
            return senderUser ? direction + "_flor" : direction + "_flor_rec";
        }
      default:
        return null;
    }
  }
}

export default UserInteractionAnimation;
