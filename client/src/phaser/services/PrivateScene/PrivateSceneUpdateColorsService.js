class PrivateSceneUpdateColorsService {
    static main(gameScene) {
        const sceneId = gameScene.sceneData.scenery.id;
        const colors = gameScene.sceneData.scenery.colors;
        const assets = gameScene.sceneData.sceneConfig.assets_data.assets_data_repeatable || [];

        // Recorrer los assets y buscar aquellos que tienen color_item_key
        assets.forEach((asset, index) => {
            // Si el asset tiene color_item_key y existe un color para esa key
            if (asset.color_item_key && colors[asset.color_item_key]) {
                const hex = colors[asset.color_item_key];  // «d1bb53»
                const spriteName = 'private_scene_' + sceneId + '_item_' + index;
                const sprite = gameScene.children.getByName(spriteName);

                if (!sprite) return;

                const tint = parseInt(hex, 16);

                // Quita cualquier tint/blend previo
                sprite.clearTint();
                sprite.setBlendMode(Phaser.BlendModes.NORMAL);

                // Aplica el tint "suave" sobre el sprite original
                sprite.setTint(tint);

                // --- OPCIONAL: si quieres un efecto más "luminoso" en las zonas claras,
                //    sustituye NORMAL por SCREEN así:
                // sprite.setBlendMode(Phaser.BlendModes.SCREEN);
            }
        });
    }
}

export default PrivateSceneUpdateColorsService;
