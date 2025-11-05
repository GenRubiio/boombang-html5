import SceneUtils from "@/utils/SceneUtils";
import DarkeningUtils from "@/utils/DarkeningUtils";

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
        const gameTime = gameScene.sceneData.scenery.game_time;
        const roomHasDarkening = gameScene.sceneData.scenery.darkening;

        assets.forEach((asset, index) => {
            const spriteName = 'public_scene_' + areaId + '_item_' + index;
            
            // Verificar si el item debe mostrarse según show_from y show_to
            const shouldShow = DarkeningUtils.shouldShowItem(
                gameTime,
                asset.show_from,
                asset.show_to
            );

            if (asset.is_background == 1) {
                this.#loadBackground(gameScene, spriteName, gameTime, roomHasDarkening);
            }
            else {
                this.#loadSingleItem(gameScene, spriteName, {
                    name: spriteName,
                    x: parseInt(asset.position_x),
                    y: parseInt(asset.position_y),
                    custom_depth: parseInt(asset.depth),
                    scale: parseInt(asset.scale) || null,
                    show_item: shouldShow,
                    show_controller: asset.show_controller == 1,
                    darkening: asset.darkening,
                    game_time: gameTime,
                    room_has_darkening: roomHasDarkening
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
        const depth = item.custom_depth == 0 ? 0 : (item.custom_depth || item.y) * item.scale;
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

    static #loadNpc(gameScene, npcData, areaId) {
        if (!npcData || !npcData.active) {
            return; // Si no hay NPC o no está activo, no hacemos nada
        }
        const spriteName = 'public_scene_' + areaId + '_npc_' + npcData.spriteName;
        let sprite;

        if (SceneUtils.isVideoFile(npcData.image)) {
            sprite = gameScene.add.video(npcData.positionX * npcData.scale, npcData.positionY * npcData.scale, spriteName);
            sprite.setOrigin(0.5, 1);
            sprite.setDepth(npcData.depth || npcData.positionY * npcData.scale);
            sprite.setLoop(true);
            sprite.play(true);
        }
        else {
            sprite = gameScene.add.image(npcData.positionX * npcData.scale, npcData.positionY * npcData.scale, spriteName);
            sprite.setOrigin(0.5, 1);
            sprite.setDepth(npcData.depth || npcData.positionY * npcData.scale);
        }
        sprite.setScale(npcData.scale);

        sprite.setInteractive({
            cursor: 'pointer',
            pixelPerfect: true  // opcional, si tu sprite tiene transparencias
        });

        // 3) Detectar clic y llamar al método de Vue
        sprite.on("pointerdown", () => {
            // Llama a openNpcModal() que definiremos en el componente Vue
            gameScene.vueComponent.openNpcModal(npcData.id, npcData.type);
        });

        //SceneUtils.moveItem(gameScene, sprite);
    }

    static #loadBackground(gameScene, spriteName, gameTime, roomHasDarkening) {
        const background = gameScene.add.image(0, 0, spriteName).setOrigin(0);
        background.setDisplaySize(gameScene.scale.width, gameScene.scale.height);
        background.setDepth(-1); // Asegurar que esté detrás de todo
        
        // El oscurecimiento ahora es global por escena, no por sprite
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