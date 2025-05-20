class SceneUtils {
    static loadNpc(col, row, gameScene, name, npcId) {
        const tileWidth = 65;
        const tileHeight = 33;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = gameScene.scale.width / 2;

        const x = (col - row) * halfTileWidth + centerX + 40;
        const y = (col + row) * halfTileHeight + 253;

        const npc = gameScene.add.image(x, y, name);
        npc.setOrigin(0.5, 1);
        npc.setDepth(y);

        npc.setInteractive({
            cursor: 'pointer',
            pixelPerfect: true  // opcional, si tu sprite tiene transparencias
        });

        // 3) Detectar clic y llamar al método de Vue
        npc.on("pointerdown", () => {
            // Llama a openNpcModal() que definiremos en el componente Vue
            gameScene.vueComponent.openNpcModal(npcId);
        });
    }

    static tintSelectedUserShadow(gameScene, spriteShadow, originalColor, newColor) {
        const plugin = gameScene.plugins.get('rexcolorreplacepipelineplugin');
        // Comprueba si ya tiene aplicado el pipeline
        let pipeline = plugin.get(spriteShadow)[0];
        if (pipeline) {
            // actualiza el color
            pipeline.setOriginalColor(originalColor);
            pipeline.setNewColor(newColor);
        } else {
            // lo aplica por primera vez
            plugin.add(spriteShadow, {
                originalColor: originalColor,
                newColor: newColor,
                // epsilon: 0.1 // sensibilidad, si tienes matices
            });
        }
    }
}

export default SceneUtils;
