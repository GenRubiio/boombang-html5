import DirectionEnum from "../../../enums/DirectionEnum.js";
import AvatarAnimationsEnum from "../../../enums/AvatarAnimationsEnum.js";
import AnimationUtils from "../utils/AnimationUtils.js";

class UserWalkAnimation {
    static main(spritePlayer, direction, avatarId) {
        const textureKey = this.getTextureKey(direction);
        AnimationUtils.setSpriteConfig(spritePlayer, avatarId, textureKey);
        spritePlayer.play(avatarId + "_" + textureKey, true);
    }

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
        }
    }
}

export default UserWalkAnimation;