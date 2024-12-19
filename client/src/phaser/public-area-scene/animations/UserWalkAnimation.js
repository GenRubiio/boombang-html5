import DirectionEnum from "../enums/DirectionEnum.js";

class UserWalkAnimation {
    static main(gameScene, socketId, spritePlayer, direction, avatarId) {
        const animationKey = this.getTextureKey(direction);
        const animationData = gameScene.avatarAnimations[avatarId][animationKey];
        spritePlayer.setOrigin(animationData.originX + (animationData.offsetX / animationData.frameWidth), animationData.originY + (animationData.offsetY / animationData.frameHeight));
        spritePlayer.play(socketId + "_" + animationKey, true);
    }

    static getTextureKey(direction) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                return "leftdown_walk_atlas_0";
            case DirectionEnum.DOWN:
                return "down_walk_atlas_0";
            case DirectionEnum.DOWN_RIGHT:
                return "rightdown_walk_atlas_0";
            case DirectionEnum.RIGHT:
                return "right_walk_atlas_0";
            case DirectionEnum.UP_RIGHT:
                return "rightup_walk_atlas_0";
            case DirectionEnum.UP:
                return "up_walk_atlas_0";
            case DirectionEnum.UP_LEFT:
                return "leftup_walk_atlas_0";
            case DirectionEnum.LEFT:
                return "left_walk_atlas_0";
        }
    }
}

export default UserWalkAnimation;