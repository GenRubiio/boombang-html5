/**
 * Utilidad para configurar el sprite antes de reproducir la animación
 * (flip horizontal, origen, offsets, etc.)
 */
import gameConfig from '@/config/gameConfig.js';
class AnimationUtils {
    static setSpriteConfig(spriteAvatar, avatarId, textureKey) {
        // Supone que tienes un objeto global con la config de cada avatar y animación
        // (window.avatars_config[avatarId][textureKey])
        const animationData = window.avatars_config[avatarId][textureKey];
        if (!animationData) return; // Comprueba que exista

        // Ajusta flip horizontal
        spriteAvatar.setFlipX(animationData.flip_horizontally);

        // Ajusta el origen en base a offsets
        // AnimationUtils.js
        //spriteAvatar.setOrigin(
        //    animationData.originX + (animationData.offsetX / animationData.frameWidth),
        //    animationData.originY + (animationData.offsetY / animationData.frameHeight)
        //);
        // Aplicar factor de escala para big_scene
        const scaleFactor = spriteAvatar.scene.sceneScaleFactor || 1;

        // La posición dentro del contenedor debe escalar proporcionalmente
        spriteAvatar.setPosition(
            animationData.positionX * gameConfig.DPI * scaleFactor,
            animationData.positionY * gameConfig.DPI * scaleFactor
        );
        // Escala normalizada: para assets de alta resolución (DPI=2) → escala=1, para assets normales (DPI=1) → escala=1
        // Aplicar scaleFactor para big_scene
        spriteAvatar.setScale(scaleFactor);
    }
}

export default AnimationUtils;
