class PrivateSceneUpdateColorsService {
    static main(gameScene) {
        const suffix = '_private_scene_' + gameScene.sceneData.scenery.id;
        const colors = gameScene.sceneData.scenery.colors;

        for (const key in colors) {
            if (!colors.hasOwnProperty(key)) continue;

            const hex = colors[key];           // «d1bb53»
            const imageName = key + suffix;    // «item_1_private_scene_7»
            const sprite = gameScene.children.getByName(imageName);

            if (!sprite) continue;

            const tint = parseInt(hex, 16);

            // Quita cualquier tint/blend previo
            sprite.clearTint();
            sprite.setBlendMode(Phaser.BlendModes.NORMAL);

            // Aplica el tint “suave” sobre el sprite original
            sprite.setTint(tint);

            // --- OPCIONAL: si quieres un efecto más “luminoso” en las zonas claras,
            //    sustituye NORMAL por SCREEN así:
            // sprite.setBlendMode(Phaser.BlendModes.SCREEN);
        }
    }
}

export default PrivateSceneUpdateColorsService;
