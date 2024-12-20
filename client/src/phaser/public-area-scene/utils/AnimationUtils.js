
class AnimationUtils {
    static setOrigin(gameScene, spritePlayer, avatarId, animation) {
        const animationData = gameScene.avatarAnimations[avatarId][animation];
        spritePlayer.setOrigin(animationData.originX + (animationData.offsetX / animationData.frameWidth), animationData.originY + (animationData.offsetY / animationData.frameHeight));
    }
}

export default AnimationUtils;
