

import DarkeningUtils from "@/utils/DarkeningUtils";

class ItemSpawnPublicSceneController {
    static main(gameScene, data) {
        const itemConfig = gameScene.sceneData.scenery.items.find(i => i.id === data.itemId);
        const gridPosition = data.position;

        // Convertir coordenadas de grid a isométricas
        const tileWidth = 65 * 2;
        const tileHeight = 33 * 2;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = gameScene.scale.width / 2;

        const isoX = (gridPosition.x - gridPosition.y) * halfTileWidth + centerX;
        const isoY = (gridPosition.x + gridPosition.y) * halfTileHeight;

        // Cálculo de profundidad corregido (misma lógica que usuarios)
        const depth = (gridPosition.y + gridPosition.x) * 17 * 2;

        // Crear sprite con offset para centrar en el tile
        const itemSprite = gameScene.add.sprite(
            isoX,
            isoY - 20 * 2,
            'item_' + itemConfig.file_name
        )
            .setDepth(depth) // Orden de renderizado consistente
            .setScale(1)
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
