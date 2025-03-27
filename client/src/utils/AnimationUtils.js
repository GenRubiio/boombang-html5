/**
 * Utilidad para configurar el sprite antes de reproducir la animación
 * (flip horizontal, origen, offsets, etc.)
 */
class AnimationUtils {
    static setSpriteConfig(spriteAvatar, avatarId, textureKey) {
        // Supone que tienes un objeto global con la config de cada avatar y animación
        // (window.avatars_config[avatarId][textureKey])
        const animationData = window.avatars_config[avatarId][textureKey];
        if (!animationData) return; // Comprueba que exista

        // Ajusta flip horizontal
        spriteAvatar.setFlipX(animationData.flip_horizontally);

        // Ajusta el origen en base a offsets
        spriteAvatar.setOrigin(
            //animationData.originX + (animationData.offsetX / animationData.frameWidth),
            //animationData.originY + (animationData.offsetY / animationData.frameHeight)
            animationData.originX,
            animationData.originY
        );
    }
}

export default AnimationUtils;
