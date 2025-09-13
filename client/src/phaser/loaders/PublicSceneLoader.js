import SceneUtils from "@/utils/SceneUtils";

class PublicSceneLoader {
    static main(gameScene, preload = true) {
        const areaId = gameScene.sceneData.scenery.id;
        const assets = gameScene.sceneData.scenery.assets_data.assets_data_repeatable || [];
        const npc = gameScene.sceneData.scenery.npc;
        const baseApiUrl = gameScene.sceneData.scenery.base_api_url + '/';

        if (preload) {
            this.#preload(areaId, assets, npc, gameScene, baseApiUrl);
            this.#loadItems(gameScene);
            this.#loadArrows(gameScene);
        }
        else {
            this.#load(areaId, assets, npc, gameScene);
        }
    }

    static #preload(areaId, assets, npc, gameScene, baseApiUrl) {
        const viteEnv = import.meta.env.VITE_APP_ENV;
        assets.forEach((asset, index) => {
            const spriteName = 'public_scene_' + areaId + '_item_' + index;
            const assetSrc = viteEnv == 'local' ? asset.image : (baseApiUrl + asset.image);
            if (SceneUtils.isVideoFile(assetSrc)) {
                gameScene.load.video(spriteName, assetSrc);
            } else {
                gameScene.load.image(spriteName, assetSrc);
            }
        });
        if (npc && npc.active) {
            const spriteName = 'public_scene_' + areaId + '_npc_' + npc.sprite_name;
            const npcSrc = viteEnv == 'local' ? npc.image : (baseApiUrl + npc.image);
            if (SceneUtils.isVideoFile(npcSrc)) {
                gameScene.load.video(spriteName, npcSrc);
            } else {
                gameScene.load.image(spriteName, npcSrc);
            }
        }
    }

    static #load(areaId, assets, npc, gameScene) {
        assets.forEach((asset, index) => {
            const spriteName = 'public_scene_' + areaId + '_item_' + index;
            if (asset.is_background == 1) {
                this.#loadBackground(gameScene, spriteName);
            }
            else {
                this.#loadSingleItem(gameScene, spriteName, {
                    name: spriteName,
                    x: asset.position_x,
                    y: asset.position_y,
                    custom_depth: asset.depth,
                    show_item: true,
                    show_controller: asset.show_controller == 1
                });
            }
        });

        this.#loadNpc(gameScene, npc, areaId);

        //SceneUtils.moveItems(gameScene);
    }

    static #loadSingleItem(gameScene, spriteName, item) {
        if (!item.show_item) {
            return; // Si no se debe mostrar el item, no hacemos nada
        }
        let sprite;
        if (SceneUtils.isVideoFile(item.image)) {
            sprite = gameScene.add.video(item.x, item.y, spriteName)
                .setOrigin(0.5, 1)
                .setDepth(item.custom_depth || item.y)
                .setName(spriteName);

            sprite.setLoop(true);
            sprite.play(true);
        }
        else {
            sprite = gameScene.add.image(item.x, item.y, spriteName)
                .setOrigin(0.5, 1)
                .setDepth(item.custom_depth || item.y)
                .setName(spriteName);
        }

        if (item.show_controller) {
            // Si es un item que se puede mover, añadimos el controlador
            SceneUtils.moveItem(gameScene, sprite);
        }
    }

    static #loadNpc(gameScene, npcData, areaId) {
        if (!npcData || !npcData.active) {
            return; // Si no hay NPC o no está activo, no hacemos nada
        }
        const spriteName = 'public_scene_' + areaId + '_npc_' + npcData.spriteName;
        let sprite;

        if (SceneUtils.isVideoFile(npcData.image)) {
            sprite = gameScene.add.video(npcData.positionX, npcData.positionY, spriteName);
            sprite.setOrigin(0.5, 1);
            sprite.setDepth(npcData.depth || npcData.positionY);
            sprite.setLoop(true);
            sprite.play(true);
        }
        else {
            sprite = gameScene.add.image(npcData.positionX, npcData.positionY, spriteName);
            sprite.setOrigin(0.5, 1);
            sprite.setDepth(npcData.depth || npcData.positionY);
        }

        sprite.setInteractive({
            cursor: 'pointer',
            pixelPerfect: true  // opcional, si tu sprite tiene transparencias
        });

        // 3) Detectar clic y llamar al método de Vue
        sprite.on("pointerdown", () => {
            // Llama a openNpcModal() que definiremos en el componente Vue
            gameScene.vueComponent.openNpcModal(1); // npcData.type
        });

        //SceneUtils.moveItem(gameScene, sprite);
    }

    static #loadBackground(gameScene, spriteName) {
        const background = gameScene.add.image(0, 0, spriteName).setOrigin(0);
        background.setDisplaySize(gameScene.scale.width, gameScene.scale.height);
    }

    static #loadArrows(gameScene) {
        if (!gameScene.sceneData.scenery.arrows || gameScene.sceneData.scenery.arrows.length === 0) {
            return;
        }
        const viteEnv = import.meta.env.VITE_APP_ENV;
        for (const arrow of gameScene.sceneData.scenery.arrows) {
            const assetSpriteFile = viteEnv == 'local' ? arrow.image : arrow.image_url;
            gameScene.load.image('arrow_' + arrow.sprite_name, assetSpriteFile);
        }
    }

    static async #loadItems(gameScene) {
        const viteEnv = import.meta.env.VITE_APP_ENV;
        for (const item of gameScene.sceneData.scenery.items) {
            const assetSpriteFile = viteEnv == 'local' ? item.sprite_file : item.sprite_file_url;
            gameScene.load.image('item_' + item.file_name, assetSpriteFile);
            if (item.catch_file_name) {
                const assetCatchSpriteFile = viteEnv == 'local' ? item.catch_sprite_file : item.catch_sprite_file_url;
                gameScene.load.image('item_' + item.catch_file_name, assetCatchSpriteFile);
            }
        }
    }
}

export default PublicSceneLoader;