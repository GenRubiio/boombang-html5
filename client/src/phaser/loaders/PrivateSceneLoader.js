import SceneUtils from "@/utils/SceneUtils";

class PrivateSceneLoader {
    static main(gameScene, preload = true) {
        //console.log("PrivateSceneLoader main", gameScene, preload);
        const sceneId = gameScene.sceneData.scenery.id;
        const assets = gameScene.sceneData.sceneConfig.assets_data.assets_data_repeatable || [];
        const baseApiUrl = gameScene.sceneData.sceneConfig.base_api_url + '/';
        if (preload) {
            this.#preload(sceneId, assets, gameScene, baseApiUrl);
        }
        else {
            this.#load(sceneId, assets, gameScene);
        }
    }

    static #preload(sceneId, assets, gameScene, baseApiUrl) {
        const viteEnv = import.meta.env.VITE_APP_ENV;
        assets.forEach((asset, index) => {
            const spriteName = 'private_scene_' + sceneId + '_item_' + index;
            const assetSrc = viteEnv == 'local' ? asset.image : (baseApiUrl + asset.image);
            if (SceneUtils.isVideoFile(assetSrc)) {
                gameScene.load.video(spriteName, assetSrc);
            } else {
                gameScene.load.image(spriteName, assetSrc);
            }
        });
    }

    static #load(sceneId, assets, gameScene) {
        const gameTime = gameScene.sceneData.scenery.game_time;
        const roomHasDarkening = gameScene.sceneData.scenery.darkening;

        assets.forEach((asset, index) => {
            const spriteName = 'private_scene_' + sceneId + '_item_' + index;

            if (asset.is_background == 1) {
                this.#loadBackground(gameScene, spriteName);
            }
            else {
                this.#loadSingleItem(gameScene, spriteName, {
                    name: spriteName,
                    x: parseInt(asset.position_x),
                    y: parseInt(asset.position_y),
                    custom_depth: parseInt(asset.depth),
                    scale: parseInt(asset.scale) || null,
                    show_item: true,
                    show_controller: asset.show_controller == 1,
                    darkening: asset.darkening,
                    game_time: gameTime,
                    room_has_darkening: roomHasDarkening
                });
            }
        });
        //SceneUtils.moveItems(gameScene);
    }

    static #loadBackground(gameScene, spriteName) {
        const background = gameScene.add.image(0, 0, spriteName).setOrigin(0);
        background.setDisplaySize(gameScene.scale.width, gameScene.scale.height);
        background.setDepth(-1); // Asegurar que esté detrás de todo
    }

    static #loadSingleItem(gameScene, spriteName, item) {
        if (!item.show_item) {
            return; // Si no se debe mostrar el item, no hacemos nada
        }
        let sprite;
        const depth = item.custom_depth == 0 ? 0 : (item.custom_depth || item.y);
        if (SceneUtils.isVideoFile(item.image)) {
            sprite = gameScene.add.video(item.x * item.scale, item.y * item.scale, spriteName)
                .setOrigin(0.5, 1)
                .setDepth(depth)
                .setName(spriteName);

            sprite.setLoop(true);
            sprite.play(true);
        }
        else {
            sprite = gameScene.add.image(item.x * item.scale, item.y * item.scale, spriteName)
                .setOrigin(0.5, 1)
                .setDepth(depth)
                .setName(spriteName);
        }
        sprite.setScale(item.scale);

        // El oscurecimiento ahora es global por escena, no por sprite

        // Registrar sprites con controlador activo para un controlador unificado
        if (item.show_controller) {
            if (!gameScene.activeItems) {
                gameScene.activeItems = new Map();
            }
            gameScene.activeItems.set(spriteName, sprite);
        }
    }
}

export default PrivateSceneLoader;