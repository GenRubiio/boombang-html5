import DirectionEnum from "../enums/DirectionEnum.js";
import AnimationUtils from "../utils/AnimationUtils.js";

class UserWalkAnimation {
    static main(gameScene, socketId, spritePlayer, direction, avatarId) {
        const animationKey = this.getTextureKey(direction);
        AnimationUtils.setOrigin(gameScene, spritePlayer, avatarId, animationKey, "walk_singleAtlas");
        spritePlayer.play(socketId + "_" + animationKey, true);
    }

    static getTextureKey(direction) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                return "leftdown_walk";
            case DirectionEnum.DOWN:
                return "down_walk";
            case DirectionEnum.DOWN_RIGHT:
                return "rightdown_walk";
            case DirectionEnum.RIGHT:
                return "right_walk";
            case DirectionEnum.UP_RIGHT:
                return "rightup_walk";
            case DirectionEnum.UP:
                return "up_walk";
            case DirectionEnum.UP_LEFT:
                return "leftup_walk";
            case DirectionEnum.LEFT:
                return "left_walk";
        }
    }
}

export default UserWalkAnimation;