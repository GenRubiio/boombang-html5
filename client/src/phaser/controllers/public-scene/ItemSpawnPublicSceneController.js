import gameConfig from "@/config/gameConfig.js";

class ItemSpawnPublicSceneController {
    static main(gameScene, data) {
        const itemConfig = gameScene.sceneData.scenery.items.find(i => i.id === data.itemId);
        const gridPosition = data.position;

        // Aplicar factor de escala para big_scene
        const scaleFactor = gameScene.sceneScaleFactor || 1;

        // Convertir coordenadas de grid a isométricas
        const tileWidth = 65 * gameConfig.DPI * scaleFactor;
        const tileHeight = 33 * gameConfig.DPI * scaleFactor;
        const halfTileWidth = (tileWidth / gameConfig.DPI);
        const halfTileHeight = (tileHeight / gameConfig.DPI);
        const centerX = gameScene.scale.width / gameConfig.DPI;

        const isoX = (gridPosition.x - gridPosition.y) * halfTileWidth + centerX;
        const isoY = (gridPosition.x + gridPosition.y) * halfTileHeight;

        // Cálculo de profundidad corregido (misma lógica que usuarios)
        const depth = (gridPosition.y + gridPosition.x) * 17 * gameConfig.DPI * scaleFactor;

        // Crear sprite con offset para centrar en el tile
        const itemSprite = gameScene.add.sprite(
            isoX,
            isoY - 20 * gameConfig.DPI * scaleFactor,
            'item_' + itemConfig.file_name
        )
            .setDepth(depth) // Orden de renderizado consistente
            .setScale(scaleFactor) // Aplicar factor de escala
            .setAlpha(0)
            .setOrigin(0.5); // Ajuste de anclaje para mejor posicionamiento

        // Animación de aparición
        gameScene.tweens.add({
            targets: itemSprite,
            alpha: 1,
            duration: 800,
            ease: 'Linear'
        });

        // El oscurecimiento ahora es global por escena, no por sprite

        // Guardar referencia
        gameScene.activeItems.set(`${gridPosition.x},${gridPosition.y}`, {
            sprite: itemSprite,
            itemId: data.itemId
        });
    }
}

export default ItemSpawnPublicSceneController;
