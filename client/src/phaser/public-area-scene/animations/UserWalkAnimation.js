import DirectionEnum from "../../enums/DirectionEnum.js";
import AnimationUtils from "../utils/AnimationUtils.js";
import AvatarAnimationsEnum from "../../enums/AvatarAnimationsEnum.js";

class UserWalkAnimation {
    static main(gameScene, socketId, spritePlayer, direction, avatarId) {
        const textureKey = this.getTextureKey(direction, avatarId);
        //AnimationUtils.setOrigin(gameScene, spritePlayer, avatarId, textureKey, "walk_singleAtlas");
        spritePlayer.play(textureKey, true);
    }

    static getTextureKey(direction, avatarId) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                return avatarId + "_" + AvatarAnimationsEnum.LEFTDOWN_WALK;
            case DirectionEnum.DOWN:
                return avatarId + "_" + AvatarAnimationsEnum.DOWN_WALK;
            case DirectionEnum.DOWN_RIGHT:
                return avatarId + "_" + AvatarAnimationsEnum.RIGHTDOWN_WALK;
            case DirectionEnum.RIGHT:
                return avatarId + "_" + AvatarAnimationsEnum.RIGHT_WALK;
            case DirectionEnum.UP_RIGHT:
                return avatarId + "_" + AvatarAnimationsEnum.RIGHTUP_WALK;
            case DirectionEnum.UP:
                return avatarId + "_" + AvatarAnimationsEnum.UP_WALK;
            case DirectionEnum.UP_LEFT:
                return avatarId + "_" + AvatarAnimationsEnum.LEFTUP_WALK;
            case DirectionEnum.LEFT:
                return avatarId + "_" + AvatarAnimationsEnum.LEFT_WALK;
        }
    }
}

export default UserWalkAnimation;