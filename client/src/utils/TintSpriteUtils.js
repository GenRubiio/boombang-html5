class TintSpriteUtils {
    static tint(gameScene, sprite, originalColor, newColor) {
        const plugin = gameScene.plugins.get('rexColorReplacePipeline');
        plugin.add(sprite, {
            originalColor: originalColor,
            newColor: newColor,
            epsilon: 0 // sensibilidad, si tienes matices
            // epsilon: 0.1 // sensibilidad, si tienes matices
        });
    }
}

export default TintSpriteUtils;
