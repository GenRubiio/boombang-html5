class UserUppercutAnimation {
    static main(gameScene, socketId, spritePlayer, direction, attacker, avatarId) {
        if (attacker) {
            const animationData = gameScene.avatarAnimations[avatarId][direction + "_punch_doy_atlas_0"];
            spritePlayer.setOrigin(animationData.originX + (animationData.offsetX / animationData.frameWidth), animationData.originY + (animationData.offsetY / animationData.frameHeight));
            spritePlayer.play(socketId + "_" + direction + "_punch_doy_atlas_0");
        }
        else {
            const animationData = gameScene.avatarAnimations[avatarId][direction + "_punch_rec_atlas_0"];
            spritePlayer.setOrigin(animationData.originX + (animationData.offsetX / animationData.frameWidth), animationData.originY + (animationData.offsetY / animationData.frameHeight));
            spritePlayer.play(socketId + "_" + direction + "_punch_rec_atlas_0");
        }
    }
}

export default UserUppercutAnimation;