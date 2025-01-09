
class AnimationUtils {
    static setSpriteConfig(spritePlayer, avatarId, textureKey) {
        const animationData = window.avatars_config[avatarId][textureKey];
        spritePlayer.setFlipX(animationData.flip_horizontally);
        spritePlayer.setOrigin(animationData.originX + (animationData.offsetX / animationData.frameWidth), animationData.originY + (animationData.offsetY / animationData.frameHeight));
    }
}

export default AnimationUtils;
