class TintSpriteUtils {
    static tint(gameScene, sprite, originalColor, newColor, update = false) {
        const plugin = gameScene.plugins.get('rexColorReplacePipeline');
        if (update) {
            let pipeline = plugin.get(sprite)[0];
            if (pipeline) {
                // actualiza el color
                pipeline.setOriginalColor(originalColor);
                pipeline.setNewColor(newColor);
            } else {
                // lo aplica por primera vez
                plugin.add(sprite, {
                    originalColor: originalColor,
                    newColor: newColor,
                    epsilon: 0 // sensibilidad, si tienes matices
                    // epsilon: 0.1 // sensibilidad, si tienes matices
                });
            }
        }
        else {
            plugin.add(sprite, {
                originalColor: originalColor,
                newColor: newColor,
                epsilon: 0 // sensibilidad, si tienes matices
                // epsilon: 0.1 // sensibilidad, si tienes matices
            });
        }
    }
}

export default TintSpriteUtils;
