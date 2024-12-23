
class AnimationUtils {
    static setOrigin(gameScene, spritePlayer, avatarId, animation, atlas) {
        const animationData = gameScene.avatarAnimations[avatarId][atlas][animation];
        spritePlayer.setOrigin(animationData.originX + (animationData.offsetX / animationData.frameWidth), animationData.originY + (animationData.offsetY / animationData.frameHeight));
    }
}

export default AnimationUtils;
